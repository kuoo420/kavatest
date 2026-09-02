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
  Compass
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

  // AI Funnel Data
  const aiFunnelData = [
    { step: 'AI 建議', count: 328, widthPercent: 100, bg: 'bg-[#211F1D]' },
    { step: '接受', count: 267, widthPercent: 87, bg: 'bg-[#4A4541]' },
    { step: '完成', count: 251, widthPercent: 74, bg: 'bg-[#736A63]' },
    { step: '有效調貨', count: 213, widthPercent: 61, bg: 'bg-[#9C8A7B]' },
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

  return (
    <div className="p-3.5 sm:p-6 md:p-8 max-w-[1440px] mx-auto space-y-4 sm:space-y-5 animate-in fade-in duration-200">
      {/* 營運判讀 Notice Bar (Matching provided design) */}
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

      {/* 6 大核心 KPI 卡片 (Matching V2 specifications) */}
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
            待確認
          </div>
        </div>

        {/* KPI 6: AI 調貨有效率 */}
        <div className="bg-[#FFFDF9] border border-[#DED6CF] rounded-2xl p-4 shadow-xs hover:border-[#718B75] transition-all">
          <div className="text-[11px] text-[#7C756F] font-medium">AI 調貨有效率</div>
          <div className="text-2xl lg:text-3xl font-extrabold text-[#24211F] my-1 tracking-tight text-[#24211F]">
            84.9%
          </div>
          <div className="text-[11px] font-semibold text-[#718B75]">
            ↑ 3.9%
          </div>
        </div>
      </div>

      {/* Row 1: 各門市庫存健康度 & 庫存失衡原因 (Grid 1.1fr vs 0.9fr) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: 各門市庫存健康度 */}
        <div className="lg:col-span-7 bg-[#FFFDF9] border border-[#DED6CF] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-bold text-[#24211F] font-serif-heading">
                各門市庫存健康度
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenExportModal('daily', ['health'], '各門市庫存健康分析')}
                  className="flex items-center gap-1 text-[11px] text-[#8C6D3B] hover:text-[#785D31] bg-[#FAF3E0] hover:bg-[#F3E8CE] px-2.5 py-1 rounded-lg border border-[#EADBBD] transition-all font-semibold shadow-xs"
                  title="下載各門市庫存健康度報表 (可選日報/月報/季報)"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>下載報表</span>
                </button>
                <span className="text-[11px] text-[#7C756F]">堆疊分析</span>
              </div>
            </div>
            <div className="text-[11px] text-[#7C756F] mb-4">正常／過量／低庫存／滯銷</div>

            {/* Horizontal Stacked Bar List */}
            <div className="space-y-3.5">
              {displayedStores.map((store) => {
                const data = healthData[store.id] || [70, 15, 10, 5];
                const [ok, over, low, stale] = data;
                return (
                  <div key={store.id} className="grid grid-cols-12 gap-2.5 items-center text-xs">
                    <span className="col-span-3 font-semibold text-[#24211F] truncate">
                      {store.name}
                    </span>
                    <div className="col-span-8 h-4 rounded-full bg-[#ECE5DE] overflow-hidden flex shadow-inner">
                      <div 
                        style={{ width: `${ok}%` }} 
                        className="h-full bg-[#718B75] hover:opacity-90 transition-all"
                        title={`正常: ${ok}%`}
                      />
                      <div 
                        style={{ width: `${over}%` }} 
                        className="h-full bg-[#C99A58] hover:opacity-90 transition-all"
                        title={`過量: ${over}%`}
                      />
                      <div 
                        style={{ width: `${low}%` }} 
                        className="h-full bg-[#B86A62] hover:opacity-90 transition-all"
                        title={`低庫存: ${low}%`}
                      />
                      <div 
                        style={{ width: `${stale}%` }} 
                        className="h-full bg-[#9F8877] hover:opacity-90 transition-all"
                        title={`滯銷: ${stale}%`}
                      />
                    </div>
                    <span className="col-span-1 text-right font-mono font-bold text-[#46604A]">
                      {ok}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center space-x-4 text-[11px] text-[#7C756F] mt-5 pt-3 border-t border-[#ECE5DE]">
            <span className="flex items-center gap-1.5">
              <i className="w-2.5 h-2.5 rounded-xs bg-[#718B75] inline-block"></i>
              正常
            </span>
            <span className="flex items-center gap-1.5">
              <i className="w-2.5 h-2.5 rounded-xs bg-[#C99A58] inline-block"></i>
              過量
            </span>
            <span className="flex items-center gap-1.5">
              <i className="w-2.5 h-2.5 rounded-xs bg-[#B86A62] inline-block"></i>
              低庫存
            </span>
            <span className="flex items-center gap-1.5">
              <i className="w-2.5 h-2.5 rounded-xs bg-[#9F8877] inline-block"></i>
              滯銷
            </span>
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

      {/* Row 2: AI 調貨成效漏斗 & AI 調貨有效率趨勢 (Equal 1fr vs 1fr) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left: AI 調貨成效漏斗 */}
        <div className="bg-[#FFFDF9] border border-[#DED6CF] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-bold text-[#24211F] font-serif-heading">
                AI 調貨成效漏斗
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
                  轉化率 64.9%
                </span>
              </div>
            </div>
            <div className="text-[11px] text-[#7C756F] mb-5">建議 → 接受 → 完成 → 有效銷售</div>

            {/* Funnel Layout */}
            <div className="flex flex-col items-center space-y-2.5 py-1">
              {aiFunnelData.map((item, idx) => (
                <div
                  key={idx}
                  style={{ width: `${item.widthPercent}%` }}
                  className={`h-9 rounded-lg ${item.bg} text-white px-4 flex items-center justify-between text-xs font-semibold shadow-xs transition-transform hover:scale-[1.01]`}
                >
                  <span>{item.step}</span>
                  <span className="font-mono text-sm font-bold">
                    {Math.round(item.count * f)} 筆
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="text-[10px] text-[#7C756F] mt-4 pt-2 border-t border-[#ECE5DE] flex items-center justify-between">
            <span>從演算法推薦到門市確認平均耗時 3.2 小時</span>
            <span className="text-[#8C6D3B] font-semibold">雙店核准率 81.4%</span>
          </div>
        </div>

        {/* Right: AI 調貨有效率趨勢 (SVG Line Chart) */}
        <div className="bg-[#FFFDF9] border border-[#DED6CF] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-bold text-[#24211F] font-serif-heading">
                AI 調貨有效率趨勢
              </h3>
              <span className="text-[11px] font-bold text-[#718B75] bg-[#E8F2EA] px-2 py-0.5 rounded border border-[#C5DEC8]">
                最新 84.9%
              </span>
            </div>
            <div className="text-[11px] text-[#7C756F] mb-3">完成調貨後 14 天內產生銷售</div>

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

      {/* Row 3: 門市 × 商品庫存失衡熱力圖 (Full width card) */}
      <div className="bg-[#FFFDF9] border border-[#DED6CF] rounded-2xl p-5 shadow-xs">
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
