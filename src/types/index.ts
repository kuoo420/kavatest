export type UserRole = 'admin' | 'S01' | 'S02' | 'S03' | 'S04' | 'S05';

export type ViewScope = 'all' | 'S01' | 'S02' | 'S03' | 'S04' | 'S05';

export type NavigationTab = 
  | 'dashboard' 
  | 'ai_recommendations' 
  | 'manual_transfer'
  | 'transfers' 
  | 'inventory' 
  | 'history';

export interface Store {
  id: string; // e.g. S01, S02, S03, S04, S05
  name: string; // e.g. 一中店, 南西店, 西門店, 中山店, 官網/總倉
  shortName: string;
  region: '台北' | '台中' | '總部';
  code: string;
  phone: string;
  manager: string;
  isWarehouse?: boolean;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  price: number;
  unit: string;
  image?: string;
  description: string;
}

export interface StoreInventory {
  storeId: string;
  productId: string;
  availableStock: number; // 實際在架可用
  committedStock: number; // 承諾/預留
  incomingStock: number;  // 在途調入
  safetyStock: number;    // 安全存量警戒
  dailySalesRate: number; // 日均銷量
  daysOfSupply: number;   // 預估可售天數
}

export type TransferStatus = 
  | 'ai_pending'        // AI 建議待採用
  | 'waiting_source'     // 待調出店確認
  | 'waiting_target'     // 待調入店確認
  | 'both_confirmed'    // 雙方已確認 (準備發貨)
  | 'in_transit'        // 調撥運送中
  | 'completed'         // 已調撥完成
  | 'rejected';         // 已取消/拒絕

export interface TransferCase {
  id: string;
  caseNumber: string; // e.g. TR-45497660, AI-0825-001
  productName: string;
  productSku: string;
  productId: string;
  quantity: number;
  sourceStoreId: string; // 調出店
  targetStoreId: string; // 調入店
  status: TransferStatus;
  pendingStoreId?: string; // 目前待辦店家
  isAiGenerated: boolean;
  aiScore?: number; // AI 匹配信心度 (e.g. 96%)
  aiRationale?: string; // AI 調撥原因解釋
  transferReason: string; // 原因 (如: 門市缺貨預警、顧客專案預訂、熱銷補貨)
  sourceConfirmed: boolean;
  sourceConfirmedAt?: string;
  targetConfirmed: boolean;
  targetConfirmedAt?: string;
  courierNumber?: string;
  createdAt: string;
  updatedAt: string;
  remarks?: string;

  // AI 庫存處方籤相關欄位 (連鎖店價格一致性規範)
  prescriptionStatus?: 'pending' | 'vm_observing' | 'gwp_applied' | 'transfer_initiated' | 'skipped';
  prescriptionAction?: 'vm_display' | 'gwp_gift' | 'transfer' | 'none';
  vmGuidance?: string; // 視覺陳列調整指引
  salesPitchGuidance?: string; // 門市成套疊戴話術
  gwpGuidance?: string; // VIP滿額贈禮轉化指引
  observationDaysRemaining?: number; // 觀察期剩餘天數 (預設 7 天)
  diagnosis?: string; // 庫存診斷說明
  vmPhotoProofUrl?: string; // 陳列調整佐證照片 (Base64 或 URL)
  vmVerifiedAt?: string; // 陳列拍照驗證時間戳
  vmVerifiedBy?: string; // 拍照驗證人員
  salesPitchDetail?: {
    recommendedPairSku?: string; // 推薦搭售熱銷品 SKU
    recommendedPairName?: string; // 推薦搭售熱銷品名稱
    styleLogic?: string; // 美學與層次搭配邏輯
    targetPersona?: string; // 目標客群與痛點
    iceBreakerScript?: string; // 破冰推薦句
    priceOvercomeScript?: string; // 價格與正價價值化解句
    crossSellRateLift?: string; // 歷史連帶結帳率提升指標
  };
  unitEconomics?: {
    fullPrice: number;
    transferCost: number;
    expectedNetMargin: number;
    fullPriceRevenue: number;
  };
}

export interface AuditLog {
  id: string;
  timestamp: string;
  operator: string;
  roleTitle: string;
  actionType: 
    | 'AI_ADOPT' 
    | 'TRANSFER_CREATE' 
    | 'STORE_APPROVE' 
    | 'STORE_REJECT' 
    | 'DISPATCH' 
    | 'RECEIVE' 
    | 'EXPORT_CSV' 
    | 'DRIVE_BACKUP'
    | 'PRESCRIPTION_VM'
    | 'PRESCRIPTION_GWP'
    | 'PRESCRIPTION_TRANSFER';
  title: string;
  details: string;
  targetId?: string;
  status: 'success' | 'warning' | 'info';
}

export interface DashboardMetrics {
  aiPendingCount: number;
  inProgressCount: number;
  bothConfirmedCount: number;
  totalAvailableStock: number;
  activeSkuCount: number;
  storePendingMap: Record<string, number>;
}

