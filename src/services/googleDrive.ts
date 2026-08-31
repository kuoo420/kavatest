/**
 * Google Drive integration service for KAVA SaaS
 * Uses GSI Token Client to upload CSV reports directly to user's Google Drive.
 */

declare global {
  interface Window {
    google?: {
      accounts?: {
        oauth2?: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: { access_token?: string; error?: string }) => void;
          }) => {
            requestAccessToken: () => void;
          };
        };
      };
    };
  }
}

export interface DriveUploadResult {
  success: boolean;
  fileId?: string;
  fileName?: string;
  webLink?: string;
  error?: string;
}

// Client ID configured in Google Workspace OAuth
const OAUTH_CLIENT_ID = '1032685104345-drive.apps.googleusercontent.com';
const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.file';

let activeAccessToken: string | null = null;

export function getCachedToken(): string | null {
  return activeAccessToken;
}

export function setCachedToken(token: string | null) {
  activeAccessToken = token;
}

/**
 * Request an access token via GSI Popup
 */
export async function requestDriveAccessToken(): Promise<string> {
  if (activeAccessToken) {
    return activeAccessToken;
  }

  return new Promise((resolve, reject) => {
    if (!window.google?.accounts?.oauth2) {
      reject(new Error('Google Identity Services (GSI) 尚未載入完成，請稍候重試或使用直接 CSV 下載。'));
      return;
    }

    try {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: OAUTH_CLIENT_ID,
        scope: DRIVE_SCOPE,
        callback: (resp) => {
          if (resp.error) {
            reject(new Error(resp.error));
          } else if (resp.access_token) {
            activeAccessToken = resp.access_token;
            resolve(resp.access_token);
          } else {
            reject(new Error('未取得授權存取 Token'));
          }
        },
      });
      client.requestAccessToken();
    } catch (err: any) {
      reject(err);
    }
  });
}

/**
 * Upload a CSV file directly to Google Drive via multipart upload
 */
export async function uploadCsvToGoogleDrive(
  csvContent: string,
  fileName: string,
  token?: string
): Promise<DriveUploadResult> {
  try {
    const accessToken = token || activeAccessToken || (await requestDriveAccessToken());
    const bom = '\uFEFF';
    const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });

    const metadata = {
      name: fileName,
      mimeType: 'text/csv',
      description: '由 KAVA 跨店智慧調撥 SaaS 系統自動匯出之營運報表',
    };

    const form = new FormData();
    form.append(
      'metadata',
      new Blob([JSON.stringify(metadata)], { type: 'application/json' })
    );
    form.append('file', blob);

    const response = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: form,
      }
    );

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      throw new Error(errJson.error?.message || `Google Drive 上傳失敗 (${response.status})`);
    }

    const data = await response.json();
    return {
      success: true,
      fileId: data.id,
      fileName: data.name,
      webLink: data.webViewLink || `https://drive.google.com/file/d/${data.id}/view`,
    };
  } catch (error: any) {
    console.error('Google Drive Upload Error:', error);
    return {
      success: false,
      error: error.message || 'Google Drive 上傳發生錯誤',
    };
  }
}
