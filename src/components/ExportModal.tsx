import React, { useState } from 'react';
import { 
  X, 
  Download, 
  CloudUpload, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink,
  Loader2,
  Table,
  Building2,
  Calendar,
  Layers,
  Sparkles,
  TrendingUp,
  ArrowLeftRight
} from 'lucide-react';
import { 
  TransferCase, 
  Store, 
  StoreInventory, 
  Product, 
  AuditLog, 
  DashboardMetrics, 
  ViewScope 
} from '../types';
import { 
  downloadCSV, 
  generateDashboardSummaryCSV, 
  generateInventoryWarningCSV,
  generateAIEffectivenessCSV,
  generateTransferFlowCSV,
  generateTransferCasesCSV, 
  generateInventoryMatrixCSV, 
  generateAuditLogsCSV 
} from '../services/csvExport';
import { uploadCsvToGoogleDrive, DriveUploadResult } from '../services/googleDrive';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  metrics: DashboardMetrics;
  cases: TransferCase[];
  stores: Store[];
  inventory: StoreInventory[];
  products: Product[];
  logs: AuditLog[];
  onLogExportAction: (reportName: string, destination: 'LOCAL_CSV' | 'GOOGLE_DRIVE') => void;
}

export type ReportType = 
  | 'dashboard_summary' 
  | 'inventory_warning' 
  | 'ai_effectiveness' 
  | 'transfer_flow' 
  | 'transfer_cases' 
  | 'inventory_matrix' 
  | 'audit_logs';

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  metrics,
  cases,
  stores,
  inventory,
  products,
  logs,
  onLogExportAction,
}) => {
  const [selectedReport, setSelectedReport] = useState<ReportType>('dashboard_summary');
  const [selectedScope, setSelectedScope] = useState<ViewScope>('all');
  const [isUploadingToDrive, setIsUploadingToDrive] = useState<boolean>(false);
  const [driveResult, setDriveResult] = useState<DriveUploadResult | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  // Filter cases & inventory based on selected scope
  const scopedCases = cases.filter((c) => {
    if (selectedScope === 'all') return true;
    return c.sourceStoreId === selectedScope || c.targetStoreId === selectedScope;
  });

  const scopedInventory = inventory.filter((inv) => {
    if (selectedScope === 'all') return true;
    return inv.storeId === selectedScope;
  });

  const getReportCSV = (type: ReportType): { content: string; filename: string } => {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    switch (type) {
      case 'dashboard_summary':
        return {
          content: generateDashboardSummaryCSV(metrics, stores, scopedCases),
          filename: `KAVA_營運摘要報表_${dateStr}.csv`,
        };
      case 'inventory_warning':
        return {
          content: generateInventoryWarningCSV(scopedInventory, stores, products),
          filename: `KAVA_庫存警示與風險排行報表_${dateStr}.csv`,
        };
      case 'ai_effectiveness':
        return {
          content: generateAIEffectivenessCSV(scopedCases),
          filename: `KAVA_AI調貨成效與轉化率報表_${dateStr}.csv`,
        };
      case 'transfer_flow':
        return {
          content: generateTransferFlowCSV(scopedCases, stores),
          filename: `KAVA_跨店調貨流向分析報表_${dateStr}.csv`,
        };
      case 'transfer_cases':
        return {
          content: generateTransferCasesCSV(scopedCases, stores),
          filename: `KAVA_跨店調撥工單明細表_${dateStr}.csv`,
        };
      case 'inventory_matrix':
        return {
          content: generateInventoryMatrixCSV(scopedInventory, stores, products),
          filename: `KAVA_門市庫存與承諾矩陣表_${dateStr}.csv`,
        };
      case 'audit_logs':
        return {
          content: generateAuditLogsCSV(logs),
          filename: `KAVA_系統操作歷程記錄_${dateStr}.csv`,
        };
      default:
        return { content: '', filename: 'export.csv' };
    }
  };

  const handleDownloadCSV = () => {
    const { content, filename } = getReportCSV(selectedReport);
    downloadCSV(content, filename);
    setDownloadSuccess(true);
    onLogExportAction(filename, 'LOCAL_CSV');
    setTimeout(() => setDownloadSuccess(false), 4000);
  };

  const handleUploadGoogleDrive = async () => {
    setIsUploadingToDrive(true);
    setDriveResult(null);
    const { content, filename } = getReportCSV(selectedReport);

    try {
      const result = await uploadCsvToGoogleDrive(content, filename);
      setDriveResult(result);
      if (result.success) {
        onLogExportAction(filename, 'GOOGLE_DRIVE');
      }
    } catch (err: any) {
      setDriveResult({
        success: false,
        error: err.message || '無法連線至 Google Drive',
      });
    } finally {
      setIsUploadingToDrive(false);
    }
  };

  const reports = [
    {
      id: 'dashboard_summary' as ReportType,
      title: '營運摘要 CSV',
      desc: '含 6 大 KPI、各店庫存健康度、失衡成因與 AI 待辦總覽',
      tag: '核心總覽',
    },
    {
      id: 'inventory_warning' as ReportType,
      title: '庫存警示 CSV',
      desc: '含低庫存／即將缺貨風險排行、可售天數與立即處置建議',
      tag: '缺貨預警',
    },
    {
      id: 'ai_effectiveness' as ReportType,
      title: 'AI 調貨成效 CSV',
      desc: '含 4 階段轉化漏斗與近 5 個月 84.9% 有效率趨勢',
      tag: '演算法成效',
    },
    {
      id: 'transfer_flow' as ReportType,
      title: '調貨流向 CSV',
      desc: '含最近 30 天主要跨店調撥關係與成因網絡',
      tag: '物流網絡',
    },
    {
      id: 'transfer_cases' as ReportType,
      title: '跨店工單明細 CSV',
      desc: '含全工單編號、調出調入店、雙店確認時間、物流單號',
      tag: '完整工單',
    },
    {
      id: 'audit_logs' as ReportType,
      title: '操作歷程與稽核 CSV',
      desc: '含 AI 演算觸發、各店主管核准、物流派送與匯出時間戳',
      tag: '稽核軌跡',
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-[#E5E7EB] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 bg-[#181C20] text-white flex items-center justify-between border-b border-[#2B323A]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#C5A059]/20 border border-[#C5A059]/40 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5 text-[#E8C683]" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-serif-heading text-white">
                匯出營運報表 & Google Drive 備份
              </h2>
              <p className="text-xs text-[#9CA3AF] mt-0.5">
                支援 UTF-8 BOM 繁體中文相容 CSV 格式及 Google Drive 即時雲端同步
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Step 1: Select Report */}
          <div>
            <label className="text-xs font-bold text-[#374151] uppercase tracking-wider block mb-2.5">
              步驟 1：選擇匯出報表格式 (支援 Excel 繁體中文)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {reports.map((rep) => (
                <div
                  key={rep.id}
                  onClick={() => setSelectedReport(rep.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer text-left flex flex-col justify-between ${
                    selectedReport === rep.id
                      ? 'bg-[#FBF8F1] border-[#C5A059] shadow-xs'
                      : 'bg-white border-[#E5E7EB] hover:bg-[#F9FAFB]'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold ${selectedReport === rep.id ? 'text-[#8C6D3B]' : 'text-[#1F2937]'}`}>
                        {rep.title}
                      </span>
                      {selectedReport === rep.id ? (
                        <CheckCircle2 className="w-4 h-4 text-[#8C6D3B]" />
                      ) : (
                        <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-medium">
                          {rep.tag}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#6B7280] mt-1 line-clamp-2">
                      {rep.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Step 2: Scope Filter */}
          <div>
            <label className="text-xs font-bold text-[#374151] uppercase tracking-wider block mb-2.5">
              步驟 2：選擇資料門市範圍
            </label>
            <div className="flex items-center space-x-2">
              <select
                value={selectedScope}
                onChange={(e) => setSelectedScope(e.target.value as ViewScope)}
                className="w-full bg-[#F9FAFB] border border-[#D1D5DB] rounded-lg px-3 py-2 text-xs font-medium text-[#1F2937] focus:ring-1 focus:ring-[#C5A059] focus:outline-none"
              >
                <option value="all">全通路 (合併檢視全台 5 處門市數據)</option>
                {stores.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.code}) - 店長：{s.manager}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Feedback & Drive Link Status */}
          {downloadSuccess && (
            <div className="bg-[#ECFDF5] border border-[#A7F3D0] rounded-xl p-3.5 text-xs text-[#065F46] flex items-center space-x-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
              <span>CSV 檔案已成功下載至您的本機電腦！已配置 UTF-8 BOM，Excel 開啟文字不亂碼。</span>
            </div>
          )}

          {driveResult && driveResult.success && (
            <div className="bg-[#F0F9FF] border border-[#BAE6FD] rounded-xl p-3.5 text-xs text-[#0369A1] flex items-center justify-between animate-in fade-in">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-[#0284C7] shrink-0" />
                <span>報表已成功備份至 Google Drive：<strong>{driveResult.fileName}</strong></span>
              </div>
              {driveResult.webLink && (
                <a
                  href={driveResult.webLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 text-xs font-bold text-[#0284C7] hover:underline shrink-0 ml-2"
                >
                  <span>開啟雲端檔案</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          )}

          {driveResult && !driveResult.success && (
            <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-xl p-3.5 text-xs text-[#991B1B] flex items-start space-x-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-[#EF4444] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Google Drive 備份提示：</span>
                <p className="mt-0.5">{driveResult.error}</p>
                <p className="text-[11px] text-[#B91C1C] mt-1">您可直接點選「直接下載 CSV 檔案」取得完整報表。</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-5 bg-[#F9FAFB] border-t border-[#E5E7EB] flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-[11px] text-[#6B7280]">
            匯出檔名：<span className="font-mono text-[#374151]">{getReportCSV(selectedReport).filename}</span>
          </span>

          <div className="flex items-center space-x-2.5 w-full sm:w-auto">
            {/* Google Drive Upload Button */}
            <button
              onClick={handleUploadGoogleDrive}
              disabled={isUploadingToDrive}
              className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 bg-white hover:bg-[#F3F4F6] text-[#374151] border border-[#D1D5DB] px-4 py-2 rounded-lg text-xs font-semibold shadow-xs transition-all disabled:opacity-60"
            >
              {isUploadingToDrive ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0284C7]" />
                  <span>上傳 Google Drive 中...</span>
                </>
              ) : (
                <>
                  <CloudUpload className="w-3.5 h-3.5 text-[#0284C7]" />
                  <span>備份至 Google Drive</span>
                </>
              )}
            </button>

            {/* Direct Local CSV Download Button */}
            <button
              onClick={handleDownloadCSV}
              className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 bg-[#8C6D3B] hover:bg-[#785D31] text-white px-5 py-2 rounded-lg text-xs font-semibold shadow-sm transition-all active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>直接下載 CSV 報表</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

