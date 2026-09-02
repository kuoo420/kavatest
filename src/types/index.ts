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
  | 'omo_pending'       // OMO 訂單待履約門市接單
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
  caseType?: 'transfer' | 'web_restock' | 'omo_fulfillment';
  orderNumber?: string;
  orderChannel?: string;
  deliveryMethod?: string;
  fulfillmentReason?: string;
  fulfillmentCandidates?: Array<{
    storeId: string;
    sellableStock: number;
    estimatedDelivery: string;
    estimatedShippingFee: number;
    workload: string;
    selected: boolean;
  }>;
  pendingStoreId?: string; // 目前待辦店家
  isAiGenerated: boolean;
  aiScore?: number; // AI 匹配信心度 (e.g. 96%)
  aiRationale?: string; // AI 調撥原因解釋
  aiDecisionStage?: 'priority_improvement' | 'observing' | 'retain' | 'transfer';
  improvementAction?: string;
  improvementObservationDays?: number;
  improvementStartedAt?: string;
  improvementResult?: string;
  transferReason: string; // 原因 (如: 門市缺貨預警、顧客專案預訂、熱銷補貨)
  sourceConfirmed: boolean;
  sourceConfirmedAt?: string;
  targetConfirmed: boolean;
  targetConfirmedAt?: string;
  courierNumber?: string;
  createdAt: string;
  updatedAt: string;
  remarks?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  operator: string;
  roleTitle: string;
  actionType: 'AI_ADOPT' | 'TRANSFER_CREATE' | 'STORE_APPROVE' | 'STORE_REJECT' | 'DISPATCH' | 'RECEIVE' | 'EXPORT_CSV' | 'DRIVE_BACKUP';
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

