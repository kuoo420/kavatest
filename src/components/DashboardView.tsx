import React, { useState } from 'react';
import { 
  Info, 
  ArrowRight, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  Boxes, 
  Layers,
  ChevronRight,
  ShieldAlert,
  ArrowRightCircle,
  FileSpreadsheet,
  PlusCircle,
  TrendingUp,
  AlertCircle,
  TrendingDown,
  Activity,
  Filter,
  BarChart3,
  Layers3,
  Compass,
  Gift,
  Zap,
  ShoppingBag,
  HelpCircle,
  DollarSign,
  Truck,
  Award
} from 'lucide-react';
import { 
  TransferCase, 
  Store, 
  StoreInventory, 
  Product, 
  UserRole, 
  ViewScope, 
  NavigationTab 
} from '../types';
import { PresetPeriod } from './ExportModal';
import { POST_TRANSFER_SUCCESS_STORIES } from '../data/mockData';

interface DashboardViewProps {
  cases: TransferCase[];
  stores: Store[];
  inventory: StoreInventory[];
  products: Product[];
  userRole: UserRole;
  viewScope: ViewScope;
  onNavigateTab: (tab: NavigationTab) => void;
  onSelectCase: (caseItem: TransferCase) => void;
  onOpenExportModal: (preset?: PresetPeriod, selectedReports?: string[], contextTitle?: string) => void;
  onQuickInitiateTransfer?: (sku: string, fromStore: string, toStore: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  cases,
  stores,
  inventory,
  products,
  userRole,
  viewScope,
  onNavigateTab,
  onSelectCase,
  onOpenExportModal,
  onQuickInitiateTransfer,
}) => {
  const [hoveredStore, setHoveredStore] = useState<string | null>(null);
  const [selectedFunnelStep, setSelectedFunnelStep] = useState<number | null>(null);

  // Store Health Data (Percentage distribution: [ok, over, low, stale])
  const healthData: Record<string, [number, number, number, number]> = {
    'S01': [72, 12, 10, 6],  // 一中店
    'S02': [55, 25, 8, 12],  // 南西店
    'S03': [79, 8, 8, 5],    // 西門店
    'S04': [74, 11, 7, 8],   // 中山店
    'S05': [81, 9, 4, 6],    // 官網/總倉
  };

  const storeNameMap: Record<string, string> = {
    'S01': '一中店',
    'S02': '南西店',
    'S03': '西門店',
    'S04': '中山店',
    'S05': '官網/總倉',
  };

  // Reasons for inventory imbalance
  const reasonsData = [
    { label: '銷售下降', percent: 38 },
    { label: '門市需求差異', percent: 27 },
    { label: '補貨過量', percent: 18 },
    { label: '新品需求誤判', percent: 10 },
    { label: '季節因素', percent: 7 },
  ];

  // AI Funnel Data with Detailed Definitions
  const aiFunnelData = [
    { 
      step: '1. AI 建議', 
      rawName: 'AI 建議',
      count: 328, 
      widthPercent: 100, 
      bg: 'bg-[#211F1D]',
      tag: '機會點掃描',
      desc: 'AI 每日 24h 自動掃描全通路進銷存數據，主動抓出可售天數過高（>45天）與斷貨缺口之潛在處方總數。'
    },
    { 
      step: '2. 接受', 
      rawName: '接受',
      count: 267, 
      widthPercent: 87, 
      bg: 'bg-[#4A4541]',
      tag: '採納率 81.4%',
      desc: '總部督導或門市店長認同 AI 診斷，點擊「採納發起工單」未駁回之案件數量。'
    },
    { 
      step: '3. 完成', 
      rawName: '完成',
      count: 251, 
      widthPercent: 74, 
      bg: 'bg-[#736A63]',
      tag: '履約率 94.0%',
      desc: '通過「調出店出庫確認 ➔ 調入店確認 ➔ 物流運送 ➔ 調入店點收驗收入庫」之實體到貨件數。'
    },
    { 
      step: '4. 有效調貨', 
      rawName: '有效調貨',
      count: 213, 
      widthPercent: 61, 
      bg: 'bg-[#9C8A7B]',
      tag: '成功售出 84.9%',
      desc: '最核心指標！商品抵達調入店 14 天內，成功以 100% 正價售出給顧客（非調去繼續放著二次滯銷）。'
    },
  ];

  // Trend Data for AI Effectiveness
  const trendData = [
    { month: '4月', rate: 76.0 },
    { month: '5月', rate: 79.0 },
    { month: '6月', rate: 82.0 },
    { month: '7月', rate: 81.0 },
    { month: '8月', rate: 84.9 },
  ];

  // Heatmap Data: Categories x Stores
  const categories = ['耳環', '戒指', '項鍊', '手鍊'];
  const heatStatusMap: Record<string, Record<string, { status: string; label: string; bg: string; text: string }>> = {
    '耳環': {
      'S01': { status: 'ok', label: '正常', bg: 'bg-[#DFE8DF]', text: 'text-[#46604A]' },
      'S02': { status: 'low', label: '低庫存', bg: 'bg-[#F0D7D3]', text: 'text-[#914B44]' },
      'S03': { status: 'over', label: '過量', bg: 'bg-[#F4E4CA]', text: 'text-[#8D6227]' },
      'S04': { status: 'ok', label: '正常', bg: 'bg-[#DFE8DF]', text: 'text-[#46604A]' },
      'S05': { status: 'ok', label: '正常', bg: 'bg-[#DFE8DF]', text: 'text-[#46604A]' },
    },
    '戒指': {
      'S01': { status: 'low', label: '低庫存', bg: 'bg-[#F0D7D3]', text: 'text-[#914B44]' },
      'S02': { status: 'low', label: '低庫存', bg: 'bg-[#F0D7D3]', text: 'text-[#914B44]' },
      'S03': { status: 'ok', label: '正常', bg: 'bg-[#DFE8DF]', text: 'text-[#46604A]' },
      'S04': { status: 'ok', label: '正常', bg: 'bg-[#DFE8DF]', text: 'text-[#46604A]' },
      'S05': { status: 'over', label: '過量', bg: 'bg-[#F4E4CA]', text: 'text-[#8D6227]' },
    },
    '項鍊': {
      'S01': { status: 'over', label: '過量', bg: 'bg-[#F4E4CA]', text: 'text-[#8D6227]' },
      'S02': { status: 'ok', label: '正常', bg: 'bg-[#DFE8DF]', text: 'text-[#46604A]' },
      'S03': { status: 'low', label: '低庫存', bg: 'bg-[#F0D7D3]', text: 'text-[#914B44]' },
      'S04': { status: 'ok', label: '正常', bg: 'bg-[#DFE8DF]', text: 'text-[#46604A]' },
      'S05': { status: 'ok', label: '正常', bg: 'bg-[#DFE8DF]', text: 'text-[#46604A]' },
    },
    '手鍊': {
      'S01': { status: 'ok', label: '正常', bg: 'bg-[#DFE8DF]', text: 'text-[#46604A]' },
      'S02': { status: 'over', label: '過量', bg: 'bg-[#F4E4CA]', text: 'text-[#8D6227]' },
      'S03': { status: 'ok', label: '正常', bg: 'bg-[#DFE8DF]', text: 'text-[#46604A]' },
      'S04': { status: 'stale', label: '滯銷', bg: 'bg-[#E7DDD4]', text: 'text-[#70584B]' },
      'S05': { status: 'ok', label: '正常', bg: 'bg-[#DFE8DF]', text: 'text-[#46604A]' },
    },
  };

  // Risk items ranking data
  const riskItems = [
    { sku: 'EAR-102', storeId: 'S01', storeName: '一中店', stock: 1, sales7d: 8, etaSoldOut: '<1天', status: '立即處理', level: 'danger' },
    { sku: 'NEK-231', storeId: 'S02', storeName: '南西店', stock: 1, sales7d: 5, etaSoldOut: '1.4天', status: '高風險', level: 'warning' },
    { sku: 'RNG-821', storeId: 'S03', storeName: '西門店', stock: 0, sales7d: 6, etaSoldOut: '已缺貨', status: '立即處理', level: 'danger' },
    { sku: 'BRC-144', storeId: 'S04', storeName: '中山店', stock: 2, sales7d: 4, etaSoldOut: '3.5天', status: '注意', level: 'warning' },
  ];

  // Cross-store flow relationships
  const flowRelations = [
    { fromId: 'S02', fromName: '南西店', toId: 'S01', toName: '一中店', quantity: 36, reason: '南西過量支援一中缺貨' },
    { fromId: 'S05', fromName: '官網/總倉', toId: 'S04', toName: '中山店', quantity: 21, reason: '中央倉配發週末活動補貨' },
    { fromId: 'S03', fromName: '西門店', toId: 'S02', toName: '南西店', quantity: 18, reason: '商圈微調客訂轉單' },
  ];

  // Multiplier for scope filtering
  const scopeFactor: Record<string, number> = {
    'all': 1.0,
    'S01': 0.23,
    'S02': 0.21,
    'S03': 0.19,
    'S04': 0.17,
    'S05': 0.20,
  };

  const f = scopeFactor[viewScope] || 1.0;

  // Filtered lists based on store scope
  const filteredRiskItems = viewScope === 'all' 
    ? riskItems 
    : riskItems.filter(r => r.storeId === viewScope);

  const filteredFlow = viewScope === 'all'
    ? flowRelations
    : flowRelations.filter(fl => fl.fromId === viewScope || fl.toId === viewScope);

  const displayedStores = viewScope === 'all'
    ? stores
    : stores.filter(s => s.id === viewScope);

  // SVG Trend Chart Dimensions
  const chartW = 500;
  const chartH = 210;
  const paddingX = 40;
  const paddingY = 30;
  const minRate = 70;
  const maxRate = 90;

  const points = trendData.map((d, i) => {
    const x = paddingX + (i * (chartW - paddingX * 2)) / (trendData.length - 1);
    const y = chartH - paddingY - ((d.rate - minRate) / (maxRate - minRate)) * (chartH - paddingY * 2);
    return { ...d, x, y };
  });

  const polylinePoints = points.map(p => `${p.x},${p.y}`).join(' ');

  // Count pending GWP applications
  const pendingGWPCases = cases.filter(
    (c) => (c.prescriptionAction === 'gwp_gift' || c.prescriptionStatus === 'gwp_applied') && c.status !== 'completed'
  );

  return (
    <div className="p-3.5 sm:p-6 md:p-8 max-w-[1440px] mx-auto space-y-4 sm:space-y-5 animate-in fade-in duration-200">
      {/* OMO Ship-from-Store Quick Notice Bar */}
      <div className="bg-gradient-to-r from-[#1C2024] to-[#2D333B] border border-[#3E454F] rounded-xl px-4 py-3 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-[#C5A059] text-[#16181B] flex items-center justify-center shrink-0 font-bold">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-sm text-[#E5C482] flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 fill-current" />
              OMO 全通路虛擬庫存池已連線：
            </span>
            <p className="text-xs text-[#CBD5E1] mt-0.5">
              總倉缺貨時，AI 自動尋源指派門市代出貨 (Ship-from-Store)，即時鎖定防超賣並推播 LINE/平板。
            </p>
          </div>
        </div>
        <button 
          onClick={() => onNavigateTab('ship_from_store')}
          className="font-bold text-xs text-[#16181B] bg-gradient-to-r from-[#E5C482] to-[#C5A059] hover:from-[#F0D59B] hover:to-[#D4B06A] px-3.5 py-1.5 rounded-lg shadow-xs shrink-0 text-center flex items-center justify-center gap-1 active:scale-95 transition-all"
        >
          <span>進入門市代發工作匣 →</span>
        </button>
      </div>

      {/* Pending GWP Application Alert (If any) */}
      {pendingGWPCases.length > 0 && (
        <div className="bg-gradient-to-r from-[#ECFDF5] via-[#F0FDF4] to-[#DCFCE7] border border-[#A7F3D0] rounded-xl px-4 py-3 text-xs text-[#065F46] flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs animate-in fade-in-50">
          <div className="flex items-center space-x-2.5">
            <div className="w-6 h-6 rounded-full bg-[#059669] text-white flex items-center justify-center shrink-0">
              <Gift className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="font-bold text-[#065F46]">門市 VIP 滿額禮申請待總部覆核：</span>
              <span className="text-[#047857] ml-1">
                有 {pendingGWPCases.length} 筆專櫃滿額禮轉化申請（{pendingGWPCases.map(p => p.productName).join('、')}），原店留用不調貨。
              </span>
            </div>
          </div>
          <button 
            onClick={() => onNavigateTab('transfers')}
            className="font-bold text-[#059669] hover:text-[#047857] bg-white px-3 py-1.5 rounded-lg border border-[#86EFAC] shadow-2xs shrink-0 text-center flex items-center justify-center gap-1 active:scale-95 transition-all"
          >
            <span>前往工單管制頁審核 →</span>
          </button>
        </div>
      )}

      {/* 營運判讀 Notice Bar */}
      <div className="bg-[#EEE6DF] border border-[#DDD1C6] rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-xs text-[#24211F] flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs">
        <div className="flex items-center space-x-2">
          <span className="font-bold text-[#8C6D3B] flex items-center gap-1 shrink-0">
            <Activity className="w-3.5 h-3.5" />
            營運判讀：
          </span>
          <span className="text-[#3A3530]">
            南西店庫存過量偏高；一中店與西門店存在即將缺貨 SKU。
          </span>
        </div>
        <button 
          onClick={() => onNavigateTab('ai_recommendations')}
          className="font-bold text-[#8C6D3B] hover:text-[#6D5328] shrink-0 text-left sm:text-right flex items-center gap-1"
        >
          <span>{Math.round(28 * f)} 筆 AI 建議待處理</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* 6 大核心 KPI 卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3.5">
        {/* KPI 1: 總庫存 */}
        <div className="bg-[#FFFDF9] border border-[#DED6CF] rounded-2xl p-4 shadow-xs hover:border-[#927665] transition-all">
          <div className="text-[11px] text-[#7C756F] font-medium">總庫存</div>
          <div className="text-2xl lg:text-3xl font-extrabold text-[#24211F] my-1 tracking-tight">
            {viewScope === 'all' ? '12,480' : Math.round(12480 * f).toLocaleString()}
          </div>
          <div className="text-[11px] font-semibold text-[#718B75] flex items-center gap-0.5">
            <span>↑ 3.2%</span>
          </div>
        </div>

        {/* KPI 2: 低庫存 SKU */}
        <div 
          onClick={() => onNavigateTab('inventory')}
          className="bg-[#FFFDF9] border border-[#DED6CF] rounded-2xl p-4 shadow-xs hover:border-[#B86A62] transition-all cursor-pointer group"
        >
          <div className="text-[11px] text-[#7C756F] font-medium">低庫存 SKU</div>
          <div className="text-2xl lg:text-3xl font-extrabold text-[#24211F] my-1 tracking-tight group-hover:text-[#B86A62] transition-colors">
            {Math.max(1, Math.round(32 * f))}
          </div>
          <div className="text-[11px] font-semibold text-[#B86A62]">
            需注意
          </div>
        </div>

        {/* KPI 3: 滯銷 SKU */}
        <div className="bg-[#FFFDF9] border border-[#DED6CF] rounded-2xl p-4 shadow-xs hover:border-[#718B75] transition-all">
          <div className="text-[11px] text-[#7C756F] font-medium">滯銷 SKU</div>
          <div className="text-2xl lg:text-3xl font-extrabold text-[#24211F] my-1 tracking-tight">
            {Math.round(186 * f)}
          </div>
          <div className="text-[11px] font-semibold text-[#718B75]">
            ↓ 12.5%
          </div>
        </div>

        {/* KPI 4: 庫存失衡 SKU */}
        <div className="bg-[#FFFDF9] border border-[#DED6CF] rounded-2xl p-4 shadow-xs hover:border-[#718B75] transition-all">
          <div className="text-[11px] text-[#7C756F] font-medium">庫存失衡 SKU</div>
          <div className="text-2xl lg:text-3xl font-extrabold text-[#24211F] my-1 tracking-tight">
            {Math.round(74 * f)}
          </div>
          <div className="text-[11px] font-semibold text-[#718B75]">
            ↓ 8.6%
          </div>
        </div>

        {/* KPI 5: AI 待處理 */}
        <div 
          onClick={() => onNavigateTab('ai_recommendations')}
          className="bg-[#FFFDF9] border border-[#DED6CF] rounded-2xl p-4 shadow-xs hover:border-[#C99A58] transition-all cursor-pointer group"
        >
          <div className="text-[11px] text-[#7C756F] font-medium">AI 待處理</div>
          <div className="text-2xl lg:text-3xl font-extrabold text-[#24211F] my-1 tracking-tight group-hover:text-[#C99A58] transition-colors">
            {Math.round(28 * f)}
          </div>
          <div className="text-[11px] font-semibold text-[#C99A58]">
            {Math.round(18 * f)} 優先
          </div>
        </div>

        {/* KPI 6: 待確認調撥 */}
        <div 
          onClick={() => onNavigateTab('transfers')}
          className="bg-[#FFFDF9] border border-[#DED6CF] rounded-2xl p-4 shadow-xs hover:border-[#8C6D3B] transition-all cursor-pointer group"
        >
          <div className="text-[11px] text-[#7C756F] font-medium">待確認調撥</div>
          <div className="text-2xl lg:text-3xl font-extrabold text-[#24211F] my-1 tracking-tight group-hover:text-[#8C6D3B] transition-colors">
            {Math.round(14 * f)}
          </div>
          <div className="text-[11px] font-semibold text-[#8C6D3B]">
            待雙店確認
          </div>
        </div>
      </div>

      {/* 【全新核心亮點】：調貨後成效驗證與正價保全 ROI 分析看板 */}
      <div className="bg-gradient-to-br from-[#FFFDF9] to-[#FAF6EE] border-2 border-[#EEDB9F] rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#EEDB9F]/80">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="bg-[#8C6D3B] text-white text-[10px] font-bold px-2 py-0.5 rounded">
                調貨後真實成果驗證
              </span>
              <span className="text-xs font-bold text-[#8C6D3B] flex items-center gap-1">
                <Award className="w-3.5 h-3.5" />
                Post-Transfer Impact & ROI Dashboard
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-[#24211F] font-serif-heading">
              調貨後成效與正價保全效益（非紙上談兵，實體售出驗證）
            </h2>
            <p className="text-xs text-[#7C756F]">
              追蹤商品調入新店後的「7~14天動銷消化率」、「正價售出毛利回收」與「對比打折拋售的淨增益」。
            </p>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => onOpenExportModal('monthly', ['ai_effectiveness', 'transfer_cases'], '調貨成效與ROI分析報表')}
              className="flex items-center gap-1.5 text-xs font-bold text-[#8C6D3B] bg-white hover:bg-[#FAF6EE] px-3.5 py-2 rounded-xl border border-[#DED6CF] shadow-xs transition-all active:scale-95"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#8C6D3B]" />
              <span>匯出成效報表</span>
            </button>
          </div>
        </div>

        {/* 4 大成效指標卡 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="bg-white p-4 rounded-xl border border-[#EEDB9F] shadow-xs space-y-1">
            <div className="text-[11px] text-[#7C756F] font-semibold flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-[#059669]" />
              挽回正價毛利總額
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-[#059669] font-mono">
              NT$ 421,740
            </div>
            <div className="text-[10px] text-[#047857] font-medium">
              100% 正價售出，免於打折損失
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#EEDB9F] shadow-xs space-y-1">
            <div className="text-[11px] text-[#7C756F] font-semibold flex items-center gap-1">
              <Truck className="w-3.5 h-3.5 text-[#2563EB]" />
              投入調撥物流成本
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-[#1E293B] font-mono">
              NT$ 22,590
            </div>
            <div className="text-[10px] text-[#64748B]">
              平均每件調撥運費 $90~$120
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#EEDB9F] shadow-xs space-y-1">
            <div className="text-[11px] text-[#7C756F] font-semibold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-[#8C6D3B]" />
              淨投資回報率 (ROI)
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-[#8C6D3B] font-mono">
              18.7 倍
            </div>
            <div className="text-[10px] text-[#8C6D3B] font-semibold">
              每投 $1 運費換回 $18.7 淨獲利
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#EEDB9F] shadow-xs space-y-1">
            <div className="text-[11px] text-[#7C756F] font-semibold flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#7C3AED]" />
              平均去化天數縮短
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-[#7C3AED] font-mono">
              4.2 天
            </div>
            <div className="text-[10px] text-[#6D28D9]">
              原店滯銷 58 天 ➔ 新店迅速完售
            </div>
          </div>
        </div>

        {/* 3 大真實成功調撥案例卡 */}
        <div className="space-y-2.5 pt-2">
          <div className="text-xs font-bold text-[#24211F] flex items-center justify-between">
            <span>🏆 近期跨店調撥成功結案案例（已完售）：</span>
            <span className="text-[11px] text-[#7C756F]">全通路 100% 正價回收實錄</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {POST_TRANSFER_SUCCESS_STORIES.map((story, idx) => (
              <div
                key={idx}
                className="bg-white p-3.5 rounded-xl border border-[#E6DDD3] shadow-xs space-y-2 hover:border-[#C5A059] transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-xs text-[#1E293B]">{story.name}</h3>
                    <div className="text-[10px] text-[#94A3B8] font-mono">{story.sku} · {story.quantity} 件</div>
                  </div>
                  <span className="text-[10px] font-bold text-[#059669] bg-[#ECFDF5] px-2 py-0.5 rounded border border-[#A7F3D0]">
                    {story.fullPriceRate}
                  </span>
                </div>

                <div className="text-[11px] text-[#475569] space-y-0.5 bg-[#F8FAFC] p-2 rounded-lg border border-[#EEF2F6]">
                  <div className="flex items-center justify-between">
                    <span className="text-[#64748B]">調出路徑：</span>
                    <span className="font-semibold text-[#1E293B]">{story.fromStore} ➔ {story.toStore}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#64748B]">去化速度：</span>
                    <span className="font-bold text-[#7C3AED]">入庫後 {story.daysToSellOut} 完售</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#64748B]">淨毛利增益：</span>
                    <span className="font-extrabold text-[#059669]">NT$ +{story.netGain.toLocaleString()} ({story.vsDiscountGain})</span>
                  </div>
                </div>

                <p className="text-[10px] text-[#7C756F] leading-tight">
                  {story.highlight}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: AI 調貨成效漏斗 & AI 調貨有效率趨勢 (Equal 1fr vs 1fr) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left: AI 調貨成效漏斗 (帶有完整定義與互動卡片) */}
        <div className="bg-[#FFFDF9] border border-[#DED6CF] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-bold text-[#24211F] font-serif-heading flex items-center gap-1.5">
                <span>AI 調貨成效漏斗（4 階段轉化）</span>
                <span title="點擊各階梯可查看詳細業務定義" className="cursor-pointer">
                  <HelpCircle className="w-3.5 h-3.5 text-[#8C6D3B]" />
                </span>
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenExportModal('monthly', ['ai_effectiveness'], 'AI 調貨轉化成效分析')}
                  className="flex items-center gap-1 text-[11px] text-[#8C6D3B] hover:text-[#785D31] bg-[#FAF3E0] hover:bg-[#F3E8CE] px-2.5 py-1 rounded-lg border border-[#EADBBD] transition-all font-semibold shadow-xs"
                  title="下載 AI 調貨轉化成效與趨勢報表"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>下載報表</span>
                </button>
                <span className="text-[11px] font-semibold text-[#8C6D3B] bg-[#FAF3E0] px-2 py-0.5 rounded border border-[#EEDB9F]">
                  終端轉化 64.9%
                </span>
              </div>
            </div>
            <div className="text-[11px] text-[#7C756F] mb-4">
              點擊下方任一階梯，查看「AI 建議 ➔ 接受 ➔ 完成 ➔ 有效調貨」定義：
            </div>

            {/* Funnel Layout */}
            <div className="flex flex-col items-center space-y-2 py-1">
              {aiFunnelData.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedFunnelStep(selectedFunnelStep === idx ? null : idx)}
                  style={{ width: `${item.widthPercent}%` }}
                  className={`h-9 rounded-lg ${item.bg} text-white px-4 flex items-center justify-between text-xs font-semibold shadow-xs transition-all cursor-pointer hover:scale-[1.01] ${
                    selectedFunnelStep === idx ? 'ring-2 ring-[#C5A059] ring-offset-2' : ''
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span>{item.step}</span>
                    <span className="text-[10px] text-[#D8D0C9] font-normal hidden sm:inline">({item.tag})</span>
                  </div>
                  <span className="font-mono text-sm font-bold">
                    {Math.round(item.count * f)} 筆
                  </span>
                </div>
              ))}
            </div>

            {/* Selected Funnel Step Detail Card */}
            {selectedFunnelStep !== null && (
              <div className="mt-3 p-3 rounded-xl bg-[#FAF6EE] border border-[#EEDB9F] text-xs text-[#8C6D3B] space-y-1 animate-in fade-in-50">
                <div className="font-bold flex items-center justify-between">
                  <span>{aiFunnelData[selectedFunnelStep].step} 業務意義說明：</span>
                  <span className="text-[10px] bg-[#8C6D3B] text-white px-2 py-0.2 rounded">
                    {aiFunnelData[selectedFunnelStep].tag}
                  </span>
                </div>
                <p className="text-[11px] text-[#63512A] leading-relaxed">
                  {aiFunnelData[selectedFunnelStep].desc}
                </p>
              </div>
            )}
          </div>

          <div className="text-[10px] text-[#7C756F] mt-4 pt-2 border-t border-[#ECE5DE] flex items-center justify-between">
            <span>從推薦到店長確認平均耗時 3.2 小時</span>
            <span className="text-[#8C6D3B] font-semibold">有效調貨率達 84.9%</span>
          </div>
        </div>

        {/* Right: AI 調貨有效率趨勢 (SVG Line Chart) */}
        <div className="bg-[#FFFDF9] border border-[#DED6CF] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-bold text-[#24211F] font-serif-heading">
                AI 調貨有效率趨勢（近 5 個月）
              </h3>
              <span className="text-[11px] font-bold text-[#718B75] bg-[#E8F2EA] px-2 py-0.5 rounded border border-[#C5DEC8]">
                最新 84.9%
              </span>
            </div>
            <div className="text-[11px] text-[#7C756F] mb-3">完成調貨後 14 天內產生 100% 正價銷售比例</div>

            {/* SVG Trend Chart */}
            <div className="relative w-full h-[180px] overflow-hidden flex items-center justify-center">
              <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-full">
                {/* Horizontal Baseline / Gridlines */}
                <line x1={paddingX} y1={chartH - paddingY} x2={chartW - paddingX} y2={chartH - paddingY} stroke="#D8D0C9" strokeWidth="1.5" />
                <line x1={paddingX} y1={chartH / 2} x2={chartW - paddingX} y2={chartH / 2} stroke="#EBE4DD" strokeDasharray="3,3" />

                {/* Trend Polyline */}
                <polyline
                  points={polylinePoints}
                  fill="none"
                  stroke="#6F6259"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Data Points and Labels */}
                {points.map((p, i) => (
                  <g key={i}>
                    {/* Circle Point */}
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r="5.5"
                      fill="#FFFDF9"
                      stroke="#6F6259"
                      strokeWidth="3"
                    />
                    {/* Month Label */}
                    <text
                      x={p.x}
                      y={chartH - 8}
                      textAnchor="middle"
                      fontSize="11"
                      fill="#7C756F"
                      fontWeight="500"
                    >
                      {p.month}
                    </text>
                    {/* Percentage Value Label */}
                    <text
                      x={p.x}
                      y={p.y - 12}
                      textAnchor="middle"
                      fontSize="11"
                      fontWeight="bold"
                      fill="#24211F"
                    >
                      {p.rate}%
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          </div>

          <div className="text-[10px] text-[#7C756F] mt-2 pt-2 border-t border-[#ECE5DE]">
            近 5 個月有效率持續穩健攀升（從 76.0% 提升至 84.9%）
          </div>
        </div>
      </div>

      {/* Row 3: 門市 × 商品庫存失衡熱力圖 & 庫存失衡原因 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: 門市 × 商品庫存失衡熱力圖 */}
        <div className="lg:col-span-7 bg-[#FFFDF9] border border-[#DED6CF] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-bold text-[#24211F] font-serif-heading">
              門市 × 商品庫存失衡熱力圖
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenExportModal('daily', ['health', 'inventory_risk'], '庫存失衡與熱力圖分析')}
                className="flex items-center gap-1 text-[11px] text-[#8C6D3B] hover:text-[#785D31] bg-[#FAF3E0] hover:bg-[#F3E8CE] px-2.5 py-1 rounded-lg border border-[#EADBBD] transition-all font-semibold shadow-xs"
                title="下載品類庫存失衡結構報表"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>下載報表</span>
              </button>
              <span className="text-[11px] text-[#7C756F]">即時狀態矩陣</span>
            </div>
          </div>
          <div className="text-[11px] text-[#7C756F] mb-4">快速辨識各店商品類別的庫存問題</div>

          {/* Heatmap Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-separate border-spacing-2 text-xs">
              <thead>
                <tr>
                  <th className="text-left font-semibold text-[#7C756F] pb-2 pl-2 w-24">分類</th>
                  {displayedStores.map((s) => (
                    <th key={s.id} className="text-center font-semibold text-[#7C756F] pb-2">
                      {s.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat}>
                    <td className="font-bold text-[#24211F] py-2 pl-2 bg-[#F6F2ED]/50 rounded-lg">
                      {cat}
                    </td>
                    {displayedStores.map((s) => {
                      const cell = heatStatusMap[cat]?.[s.id] || { status: 'ok', label: '正常', bg: 'bg-[#DFE8DF]', text: 'text-[#46604A]' };
                      return (
                        <td
                          key={s.id}
                          className={`text-center py-3.5 px-3 rounded-xl font-bold ${cell.bg} ${cell.text} transition-transform hover:scale-105 shadow-xs`}
                        >
                          {cell.label}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Heatmap Legend */}
          <div className="flex items-center justify-end space-x-3 text-[11px] mt-4 pt-3 border-t border-[#ECE5DE]">
            <span className="px-2 py-0.5 rounded bg-[#DFE8DF] text-[#46604A] font-medium">正常：水位平衡</span>
            <span className="px-2 py-0.5 rounded bg-[#F4E4CA] text-[#8D6227] font-medium">過量：建議調出</span>
            <span className="px-2 py-0.5 rounded bg-[#F0D7D3] text-[#914B44] font-medium">低庫存：建議補貨</span>
            <span className="px-2 py-0.5 rounded bg-[#E7DDD4] text-[#70584B] font-medium">滯銷：需促銷流轉</span>
          </div>
        </div>

        {/* Right: 庫存失衡原因 */}
        <div className="lg:col-span-5 bg-[#FFFDF9] border border-[#DED6CF] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-bold text-[#24211F] font-serif-heading">
                庫存失衡原因
              </h3>
              <span className="text-[11px] text-[#7C756F]">成因歸納</span>
            </div>
            <div className="text-[11px] text-[#7C756F] mb-4">依銷售、庫存與補貨資料分析</div>

            <div className="space-y-3">
              {reasonsData.map((r, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#3A3530] font-medium">{r.label}</span>
                    <span className="font-bold text-[#24211F] font-mono">{r.percent}%</span>
                  </div>
                  <div className="h-2.5 w-full bg-[#EEE7DF] rounded-full overflow-hidden">
                    <div 
                      style={{ width: `${r.percent * 2.2}%` }}
                      className="h-full bg-[#A78D7B] rounded-full transition-all duration-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-[10px] text-[#8C98A6] mt-4 pt-2 border-t border-[#ECE5DE]">
            大數據每 24 小時自動回溯銷售曲線重新計算權重
          </div>
        </div>
      </div>

      {/* Row 4: 低庫存／即將缺貨風險排行 & 跨店庫存流向 (Grid 1fr vs 1fr) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left: 低庫存／即將缺貨風險排行 */}
        <div className="bg-[#FFFDF9] border border-[#DED6CF] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-bold text-[#24211F] font-serif-heading">
                低庫存／即將缺貨風險排行
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenExportModal('daily', ['inventory_risk'], '庫存風險與缺貨警示清單')}
                  className="flex items-center gap-1 text-[11px] text-[#8C6D3B] hover:text-[#785D31] bg-[#FAF3E0] hover:bg-[#F3E8CE] px-2.5 py-1 rounded-lg border border-[#EADBBD] transition-all font-semibold shadow-xs"
                  title="下載低庫存缺貨與滯銷風險排行清單"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>下載報表</span>
                </button>
                <button 
                  onClick={() => onNavigateTab('transfers')}
                  className="text-xs font-semibold text-[#8C6D3B] hover:underline"
                >
                  發起調撥
                </button>
              </div>
            </div>
            <div className="text-[11px] text-[#7C756F] mb-3">依庫存、近 7 日銷量、售罄天數排序</div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[#ECE5DE] text-[#7C756F] text-[10px] text-left">
                    <th className="pb-2 font-semibold">SKU</th>
                    <th className="pb-2 font-semibold">門市</th>
                    <th className="pb-2 font-semibold text-center">庫存</th>
                    <th className="pb-2 font-semibold text-center">7日銷量</th>
                    <th className="pb-2 font-semibold text-center">預估售罄</th>
                    <th className="pb-2 font-semibold text-right">狀態</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1EDE7]">
                  {filteredRiskItems.map((item, idx) => (
                    <tr key={idx} className="hover:bg-[#F9F6F0] transition-colors">
                      <td className="py-2.5 font-bold font-mono text-[#24211F]">{item.sku}</td>
                      <td className="py-2.5 text-[#3A3530]">{item.storeName}</td>
                      <td className="py-2.5 text-center font-bold text-[#24211F]">{item.stock}</td>
                      <td className="py-2.5 text-center text-[#554F49]">{item.sales7d}</td>
                      <td className="py-2.5 text-center font-semibold text-[#B86A62]">{item.etaSoldOut}</td>
                      <td className="py-2.5 text-right">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          item.level === 'danger'
                            ? 'bg-[#F2D8D5] text-[#914B44]'
                            : 'bg-[#F4E4CA] text-[#8D6227]'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="text-[10px] text-[#7C756F] mt-4 pt-2 border-t border-[#ECE5DE]">
            系統已自動在「AI 調貨建議」中為上述品項生成建議調撥單
          </div>
        </div>

        {/* Right: 跨店庫存流向 */}
        <div className="bg-[#FFFDF9] border border-[#DED6CF] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-bold text-[#24211F] font-serif-heading">
                跨店庫存流向
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenExportModal('monthly', ['transfer_flow'], '跨店庫存流向分析')}
                  className="flex items-center gap-1 text-[11px] text-[#8C6D3B] hover:text-[#785D31] bg-[#FAF3E0] hover:bg-[#F3E8CE] px-2.5 py-1 rounded-lg border border-[#EADBBD] transition-all font-semibold shadow-xs"
                  title="下載跨店庫存流向與物流關係報表"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>下載報表</span>
                </button>
                <span className="text-[11px] text-[#7C756F]">調撥關係網絡</span>
              </div>
            </div>
            <div className="text-[11px] text-[#7C756F] mb-4">最近 30 天主要調撥關係</div>

            {/* Flow Nodes Network List */}
            <div className="space-y-3">
              {filteredFlow.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#9CA3AF]">
                  目前此視角範圍內無主要調撥流向
                </div>
              ) : (
                filteredFlow.map((fl, idx) => (
                  <div 
                    key={idx} 
                    className="p-3 bg-[#F6F2ED] rounded-xl border border-[#E4DCD3] flex items-center justify-between hover:border-[#A78D7B] transition-all"
                  >
                    {/* Source Store */}
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#211F1D] text-[#E8C683] flex items-center justify-center font-bold text-xs">
                        出
                      </div>
                      <div>
                        <div className="text-[10px] text-[#7C756F]">來源門市</div>
                        <div className="text-xs font-bold text-[#24211F]">{fl.fromName}</div>
                      </div>
                    </div>

                    {/* Middle Quantity Badge & Arrow */}
                    <div className="flex flex-col items-center px-2">
                      <span className="text-xs font-mono font-bold text-[#8C6D3B] bg-[#FFFDF9] px-2.5 py-0.5 rounded-full border border-[#DED6CF] shadow-xs">
                        {fl.quantity} 件
                      </span>
                      <div className="flex items-center text-[#8C6D3B] text-xs font-bold mt-0.5">
                        <span>→</span>
                      </div>
                    </div>

                    {/* Target Store */}
                    <div className="flex items-center space-x-2.5">
                      <div className="text-right">
                        <div className="text-[10px] text-[#7C756F]">接收門市</div>
                        <div className="text-xs font-bold text-[#24211F]">{fl.toName}</div>
                      </div>
                      <div className="w-8 h-8 rounded-lg bg-[#718B75] text-white flex items-center justify-center font-bold text-xs">
                        入
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="text-[10px] text-[#7C756F] mt-4 pt-2 border-t border-[#ECE5DE] flex items-center justify-between">
            <span>主要調貨路徑已形成穩定雙向互補效益</span>
            <button
              onClick={() => onNavigateTab('transfers')}
              className="text-[#8C6D3B] font-bold hover:underline"
            >
              檢視完整工單清單 →
            </button>
          </div>
        </div>
      </div>

      {/* V1.2 核心規則 - 雙店確認門檻 (Three-step pipeline) */}
      <div className="bg-[#FFFDF9] border border-[#DED6CF] rounded-2xl p-5 shadow-xs">
        <div className="text-[11px] font-semibold text-[#8C6D3B] uppercase tracking-wider">V1.2 核心規則</div>
        <h3 className="text-sm font-bold text-[#24211F] mt-0.5 mb-4 font-serif-heading">
          雙店確認門檻機制
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-[#F6F2ED] border border-[#E4DCD3]">
            <div className="flex items-center space-x-2.5 mb-2">
              <div className="w-6 h-6 rounded-full bg-[#211F1D] text-[#E8C683] text-xs font-bold flex items-center justify-center">
                1
              </div>
              <span className="text-xs font-bold text-[#24211F]">來源店確認</span>
            </div>
            <p className="text-[11px] text-[#635B55] leading-relaxed">
              由調出門市現場清點現貨、核對品相無誤後，鎖定在架庫存並承諾調出。
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#F6F2ED] border border-[#E4DCD3]">
            <div className="flex items-center space-x-2.5 mb-2">
              <div className="w-6 h-6 rounded-full bg-[#211F1D] text-[#E8C683] text-xs font-bold flex items-center justify-center">
                2
              </div>
              <span className="text-xs font-bold text-[#24211F]">目的店確認</span>
            </div>
            <p className="text-[11px] text-[#635B55] leading-relaxed">
              調入門市再次確認顧客預訂或補貨需求，完成入庫對接準備與物流接收。
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#F6F2ED] border border-[#E4DCD3]">
            <div className="flex items-center space-x-2.5 mb-2">
              <div className="w-6 h-6 rounded-full bg-[#8C6D3B] text-white text-xs font-bold flex items-center justify-center shadow-xs">
                3
              </div>
              <span className="text-xs font-bold text-[#24211F]">正式成立調撥</span>
            </div>
            <p className="text-[11px] text-[#635B55] leading-relaxed">
              雙方門市皆核准後，自動產生物流調撥憑證與單號，中央資料即時平帳同步。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
