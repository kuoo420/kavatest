import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldCheck, 
  Cpu,
  RefreshCw,
  Sliders,
  BarChart3,
  Building2,
  Package,
  Download,
  Eye,
  Gift,
  Truck,
  MessageSquare,
  Clock,
  Check,
  ChevronRight,
  Info,
  DollarSign,
  Tag,
  Camera,
  Layers,
  Image as ImageIcon
} from 'lucide-react';
import { TransferCase, Store, Product, StoreInventory, UserRole, ViewScope } from '../types';
import { PresetPeriod } from './ExportModal';
import { VMVerificationModal } from './VMVerificationModal';
import { SalesPitchModal } from './SalesPitchModal';

interface AIRecommendationsViewProps {
  cases: TransferCase[];
  stores: Store[];
  products: Product[];
  inventory: StoreInventory[];
  userRole: UserRole;
  viewScope: ViewScope;
  onAdoptRecommendation: (caseId: string) => void;
  onRejectRecommendation: (caseId: string) => void;
  onAdoptPrescriptionVM?: (caseId: string, photoProofUrl?: string) => void;
  onAdoptPrescriptionGWP?: (caseId: string) => void;
  onSelectCase: (caseItem: TransferCase) => void;
  onOpenExportModal?: (preset?: PresetPeriod, selectedReports?: string[], contextTitle?: string) => void;
}

export const AIRecommendationsView: React.FC<AIRecommendationsViewProps> = ({
  cases,
  stores,
  products,
  inventory,
  userRole,
  viewScope,
  onAdoptRecommendation,
  onRejectRecommendation,
  onAdoptPrescriptionVM,
  onAdoptPrescriptionGWP,
  onSelectCase,
  onOpenExportModal,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'vm_observing' | 'gwp_applied' | 'transfer_initiated'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [activeTabTabState, setActiveTabState] = useState<Record<string, 'stage1' | 'stage2'>>({});
  
  // Modals state
  const [vmModalCase, setVmModalCase] = useState<TransferCase | null>(null);
  const [pitchModalCase, setPitchModalCase] = useState<TransferCase | null>(null);

  const aiCases = cases.filter((c) => c.isAiGenerated);
  
  // Filter cases based on prescriptionStatus or status
  const filteredCases = aiCases.filter((c) => {
    // Category filter
    const prod = products.find((p) => p.id === c.productId);
    if (selectedCategory !== 'all' && prod?.category !== selectedCategory) {
      return false;
    }

    // View scope filter
    if (viewScope !== 'all') {
      if (c.sourceStoreId !== viewScope && c.targetStoreId !== viewScope) {
        return false;
      }
    }

    // Status filter
    const pStatus = c.prescriptionStatus || (c.status === 'ai_pending' ? 'pending' : 'transfer_initiated');
    if (activeFilter === 'all') return true;
    if (activeFilter === 'pending') return pStatus === 'pending' || c.status === 'ai_pending';
    if (activeFilter === 'vm_observing') return pStatus === 'vm_observing';
    if (activeFilter === 'gwp_applied') return pStatus === 'gwp_applied';
    if (activeFilter === 'transfer_initiated') return pStatus === 'transfer_initiated' || c.status !== 'ai_pending';
    return true;
  });

  const pendingCount = aiCases.filter(c => !c.prescriptionStatus || c.prescriptionStatus === 'pending').length;
  const observingCount = aiCases.filter(c => c.prescriptionStatus === 'vm_observing').length;
  const gwpCount = aiCases.filter(c => c.prescriptionStatus === 'gwp_applied').length;
  const transferredCount = aiCases.filter(c => c.prescriptionStatus === 'transfer_initiated' || c.status !== 'ai_pending').length;

  const categories = Array.from(new Set(products.map(p => p.category)));

  const getStoreName = (id: string) => stores.find((s) => s.id === id)?.name || id;
  const getProduct = (productId: string) => products.find((p) => p.id === productId);

  const getStoreInventory = (storeId: string, productId: string) => {
    return inventory.find((inv) => inv.storeId === storeId && inv.productId === productId);
  };

  const handleSimulateCalculation = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setIsSimulating(false);
    }, 600);
  };

  const handleConfirmVmVerification = (caseId: string, photoDataUrl: string) => {
    if (onAdoptPrescriptionVM) {
      onAdoptPrescriptionVM(caseId, photoDataUrl);
    }
  };

  const toggleCardSubTab = (caseId: string, tab: 'stage1' | 'stage2') => {
    setActiveTabState(prev => ({ ...prev, [caseId]: tab }));
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1440px] mx-auto space-y-6 animate-in fade-in-50 duration-200">
      {/* Header Strategy Banner */}
      <div className="bg-gradient-to-br from-[#1A1D20] via-[#242930] to-[#1A1D20] rounded-2xl p-5 sm:p-7 text-white shadow-md relative overflow-hidden border border-[#374151]">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-72 h-72 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2.5 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center space-x-1.5 bg-[#D4AF37]/20 border border-[#D4AF37]/40 px-3 py-1 rounded-full text-[11px] sm:text-xs font-semibold text-[#F1D892]">
                <Sparkles className="w-3.5 h-3.5 text-[#F5DF9E]" />
                <span>KAVA AI 階梯式庫存處方籤模型 V3.0</span>
              </div>
              <div className="inline-flex items-center space-x-1 bg-[#10B981]/20 border border-[#10B981]/40 px-2.5 py-1 rounded-full text-[11px] font-medium text-[#6EE7B7]">
                <ShieldCheck className="w-3 h-3 text-[#34D399]" />
                <span>連鎖品牌價格一致性合規</span>
              </div>
            </div>

            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold font-serif-heading tracking-tight text-[#F8FAFC]">
              AI 庫存最佳解處方與調撥決策
            </h1>
            
            <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
              拒絕銷售不好就盲目調貨！系統遵循<strong className="text-[#F1D892] font-semibold">「全門市價格一致性規範」</strong>，優先提供<strong className="text-white font-medium">「零成本視覺陳列優化」</strong>與<strong className="text-white font-medium">「門市成套疊戴話術」</strong>，待原店觀察無效或他店急缺時，才啟動跨店正價調撥，保全品牌毛利。
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0">
            {onOpenExportModal && (
              <button
                onClick={() => onOpenExportModal('monthly', ['ai_effectiveness', 'transfer_flow'], 'AI 庫存處方與轉化成效分析')}
                className="flex items-center justify-center space-x-1.5 bg-[#2A313C] hover:bg-[#343D4B] text-[#F1D892] px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all border border-[#D4AF37]/30 shadow-xs active:scale-95 grow sm:grow-0"
                title="下載 AI 庫存處方執行成效與轉化率報表"
              >
                <Download className="w-3.5 h-3.5" />
                <span>匯出成效報表</span>
              </button>
            )}

            <button
              onClick={handleSimulateCalculation}
              disabled={isSimulating}
              className="flex items-center justify-center space-x-1.5 bg-[#374151] hover:bg-[#4B5563] text-white px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all border border-[#4B5563] shadow-xs active:scale-95 grow sm:grow-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin text-[#D4AF37]' : ''}`} />
              <span>{isSimulating ? '演算法重新比對中...' : '重新演算處方'}</span>
            </button>
          </div>
        </div>

        {/* 4-Step Prescription Logic Explainer Ribbon */}
        <div className="mt-5 pt-4 border-t border-[#374151]/70 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="bg-[#14171A]/70 rounded-lg p-2.5 border border-[#2D3748] flex items-start space-x-2">
            <div className="w-5 h-5 rounded-full bg-[#B0893F]/20 text-[#E5C482] flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">1</div>
            <div>
              <div className="font-semibold text-[#E2E8F0] flex items-center gap-1">
                <Eye className="w-3 h-3 text-[#C5A059]" />
                視覺陳列優化 (VM)
              </div>
              <p className="text-[11px] text-[#94A3B8] mt-0.5">移至中島/主動線黃金位與成套陳列</p>
            </div>
          </div>

          <div className="bg-[#14171A]/70 rounded-lg p-2.5 border border-[#2D3748] flex items-start space-x-2">
            <div className="w-5 h-5 rounded-full bg-[#B0893F]/20 text-[#E5C482] flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">2</div>
            <div>
              <div className="font-semibold text-[#E2E8F0] flex items-center gap-1">
                <MessageSquare className="w-3 h-3 text-[#C5A059]" />
                成套疊戴推薦話術
              </div>
              <p className="text-[11px] text-[#94A3B8] mt-0.5">不改標價，結帳/試戴主動連帶推銷</p>
            </div>
          </div>

          <div className="bg-[#14171A]/70 rounded-lg p-2.5 border border-[#2D3748] flex items-start space-x-2">
            <div className="w-5 h-5 rounded-full bg-[#B0893F]/20 text-[#E5C482] flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">3</div>
            <div>
              <div className="font-semibold text-[#E2E8F0] flex items-center gap-1">
                <Gift className="w-3 h-3 text-[#C5A059]" />
                滿額限定禮轉化 (GWP)
              </div>
              <p className="text-[11px] text-[#94A3B8] mt-0.5">申請為專櫃滿額 $2000 限定贈禮</p>
            </div>
          </div>

          <div className="bg-[#14171A]/70 rounded-lg p-2.5 border border-[#2D3748] flex items-start space-x-2">
            <div className="w-5 h-5 rounded-full bg-[#B0893F]/20 text-[#E5C482] flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">4</div>
            <div>
              <div className="font-semibold text-[#E2E8F0] flex items-center gap-1">
                <Truck className="w-3 h-3 text-[#C5A059]" />
                跨店正價智慧調撥
              </div>
              <p className="text-[11px] text-[#94A3B8] mt-0.5">調往缺貨熱銷店，正價迅速售罄</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Category Tabs Bar */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-3 sm:p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Prescription Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeFilter === 'all'
                ? 'bg-[#1F2937] text-white shadow-xs'
                : 'text-[#4B5563] hover:bg-[#F3F4F6]'
            }`}
          >
            全部處方 ({aiCases.length})
          </button>
          <button
            onClick={() => setActiveFilter('pending')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeFilter === 'pending'
                ? 'bg-[#8C6D3B] text-white shadow-xs'
                : 'text-[#4B5563] hover:bg-[#F3F4F6]'
            }`}
          >
            <span>待決策處方</span>
            {pendingCount > 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                activeFilter === 'pending' ? 'bg-white text-[#8C6D3B]' : 'bg-[#FAF1E3] text-[#A27228]'
              }`}>
                {pendingCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveFilter('vm_observing')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeFilter === 'vm_observing'
                ? 'bg-[#2563EB] text-white shadow-xs'
                : 'text-[#4B5563] hover:bg-[#F3F4F6]'
            }`}
          >
            <Clock className="w-3 h-3" />
            <span>陳列優化中 ({observingCount})</span>
          </button>
          <button
            onClick={() => setActiveFilter('gwp_applied')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeFilter === 'gwp_applied'
                ? 'bg-[#059669] text-white shadow-xs'
                : 'text-[#4B5563] hover:bg-[#F3F4F6]'
            }`}
          >
            <Gift className="w-3 h-3" />
            <span>滿額禮應用 ({gwpCount})</span>
          </button>
          <button
            onClick={() => setActiveFilter('transfer_initiated')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeFilter === 'transfer_initiated'
                ? 'bg-[#6D28D9] text-white shadow-xs'
                : 'text-[#4B5563] hover:bg-[#F3F4F6]'
            }`}
          >
            <Truck className="w-3 h-3" />
            <span>跨店調撥中 ({transferredCount})</span>
          </button>
        </div>

        {/* Category Selector */}
        <div className="flex items-center space-x-2 shrink-0">
          <span className="text-xs text-[#6B7280] font-medium">品類：</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs font-medium bg-[#F9FAFB] border border-[#D1D5DB] rounded-lg px-2.5 py-1.5 text-[#374151] focus:ring-1 focus:ring-[#8C6D3B] outline-none"
          >
            <option value="all">全品類飾品</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Prescription Cards Container */}
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <h2 className="text-base sm:text-lg font-bold text-[#1E252E] flex items-center space-x-2 font-serif-heading">
            <span>庫存優化處方列表</span>
            <span className="text-xs font-semibold text-[#64748B]">
              (共 {filteredCases.length} 筆項目)
            </span>
          </h2>
          <span className="text-xs text-[#8C6D3B] font-medium flex items-center gap-1">
            <Info className="w-3.5 h-3.5" />
            門市採用陳列建議後享有 7 天觀察鎖定期
          </span>
        </div>

        {filteredCases.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-10 text-center">
            <CheckCircle2 className="w-10 h-10 text-[#10B981] mx-auto mb-2" />
            <h3 className="text-sm font-bold text-[#1F2937]">目前無符合篩選條件的處方項目</h3>
            <p className="text-xs text-[#6B7280] mt-1">各分店庫存運轉良好，或處方已於其他階段執行中。</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5">
            {filteredCases.map((c) => {
              const srcStore = stores.find((s) => s.id === c.sourceStoreId);
              const tgtStore = stores.find((s) => s.id === c.targetStoreId);
              const prod = getProduct(c.productId) || products.find(p => p.sku === c.productSku);
              const srcInv = getStoreInventory(c.sourceStoreId, c.productId);
              const tgtInv = getStoreInventory(c.targetStoreId, c.productId);
              const pStatus = c.prescriptionStatus || (c.status === 'ai_pending' ? 'pending' : 'transfer_initiated');
              const activeSubTab = activeTabTabState[c.id] || 'stage1';

              return (
                <div
                  key={c.id}
                  className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs hover:border-[#D4AF37]/50 transition-all overflow-hidden flex flex-col"
                >
                  {/* Card Top Title Bar */}
                  <div className="p-4 sm:p-5 pb-3 border-b border-[#F1F5F9] bg-[#FAFAFA] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="text-xs font-mono font-bold bg-[#E2E8F0] text-[#334155] px-2 py-0.5 rounded">
                        {c.caseNumber}
                      </span>
                      <h3 className="text-base sm:text-lg font-bold text-[#1E293B] font-serif-heading">
                        {c.productName}
                      </h3>
                      <span className="text-xs text-[#64748B] font-mono">({c.productSku})</span>
                      <span className="text-[11px] bg-[#EEF2FF] text-[#4F46E5] font-semibold px-2 py-0.5 rounded border border-[#E0E7FF]">
                        {prod?.category || '精選飾品'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                      {/* Price Badge */}
                      <div className="flex items-center space-x-1 text-xs bg-[#F0FDF4] border border-[#BBF7D0] px-2.5 py-1 rounded-md text-[#166534] font-semibold">
                        <Tag className="w-3 h-3 text-[#15803D]" />
                        <span>連鎖全台正價：NT$ {prod?.price?.toLocaleString() || '1,980'}</span>
                      </div>

                      {/* Status Pill */}
                      {pStatus === 'vm_observing' && (
                        <span className="text-xs font-bold bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] px-2.5 py-1 rounded-md flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#2563EB] animate-pulse" />
                          <span>陳列觀察期 (剩餘 {c.observationDaysRemaining || 7} 天)</span>
                        </span>
                      )}
                      {pStatus === 'gwp_applied' && (
                        <span className="text-xs font-bold bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0] px-2.5 py-1 rounded-md flex items-center gap-1">
                          <Gift className="w-3 h-3 text-[#059669]" />
                          <span>已轉為滿額禮標的</span>
                        </span>
                      )}
                      {pStatus === 'transfer_initiated' && (
                        <span className="text-xs font-bold bg-[#F5F3FF] text-[#6D28D9] border border-[#DDD6FE] px-2.5 py-1 rounded-md flex items-center gap-1">
                          <Truck className="w-3 h-3 text-[#7C3AED]" />
                          <span>已啟動跨店調撥</span>
                        </span>
                      )}
                      {pStatus === 'pending' && (
                        <span className="text-xs font-bold bg-[#FAF3E0] text-[#8C6D3B] border border-[#EADBAC] px-2.5 py-1 rounded-md flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-[#B0893F]" />
                          <span>AI 信心度 {c.aiScore || 95}%</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Diagnosis Strip */}
                  <div className="px-4 sm:px-5 py-2.5 bg-[#FFFBEB] border-b border-[#FEF3C7] text-xs text-[#92400E] flex items-start space-x-2">
                    <Info className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-[#78350F] mr-1.5">門市營運診斷：</span>
                      <span>{c.diagnosis || c.aiRationale || '該店目前週轉速率較慢，庫存偏多，建議優先採取原店陳列激活。'}</span>
                    </div>
                  </div>

                  {/* Main Dual-Stage Content Area */}
                  <div className="p-4 sm:p-5 space-y-4">
                    {/* Stage Selection Tabs (Desktop side-by-side or mobile tabs) */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {/* Stage 1: 原店低成本激活 Box */}
                      <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 flex flex-col justify-between space-y-3 relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-[#3B82F6] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-bl-lg uppercase tracking-wider">
                          優先推薦 · 零價格爭議
                        </div>

                        <div>
                          <div className="flex items-center space-x-2 mb-2.5">
                            <span className="w-5 h-5 rounded-full bg-[#DBEAFE] text-[#1E40AF] flex items-center justify-center font-bold text-xs">
                              1
                            </span>
                            <h4 className="text-sm font-bold text-[#1E293B] font-serif-heading">
                              階段一：原店低成本激活（連鎖合規）
                            </h4>
                          </div>

                          <div className="space-y-2.5 text-xs">
                            {/* VM Display */}
                            <div className="bg-white rounded-lg p-3 border border-[#E2E8F0] space-y-2 hover:border-[#BFDBFE] transition-colors">
                              <div className="flex items-center justify-between">
                                <div className="font-bold text-[#1E293B] flex items-center gap-1.5 text-xs text-[#2563EB]">
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>視覺陳列調整 (Visual Merchandising)</span>
                                </div>
                                
                                {c.vmPhotoProofUrl ? (
                                  <button
                                    type="button"
                                    onClick={() => setVmModalCase(c)}
                                    className="inline-flex items-center space-x-1 text-[11px] font-bold text-[#1D4ED8] bg-[#EFF6FF] px-2 py-0.5 rounded border border-[#BFDBFE] hover:bg-[#DBEAFE] transition-colors"
                                  >
                                    <Camera className="w-3 h-3 text-[#2563EB]" />
                                    <span>查看陳列照</span>
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => setVmModalCase(c)}
                                    className="inline-flex items-center space-x-1 text-[11px] font-bold text-[#2563EB] hover:text-[#1D4ED8] bg-[#EFF6FF] px-2 py-0.5 rounded border border-[#BFDBFE] hover:bg-[#DBEAFE] transition-colors"
                                  >
                                    <Camera className="w-3 h-3 text-[#2563EB]" />
                                    <span>拍照上傳存證</span>
                                  </button>
                                )}
                              </div>
                              <p className="text-[#475569] leading-relaxed">
                                {c.vmGuidance || '建議移至中央中島試戴鏡旁絲絨首飾盤，與店內熱銷項鍊做成套展示。'}
                              </p>

                              {/* Photo verified thumbnail if exists */}
                              {c.vmPhotoProofUrl && (
                                <div 
                                  onClick={() => setVmModalCase(c)}
                                  className="flex items-center space-x-2 bg-[#F0FDF4] p-1.5 rounded-md border border-[#BBF7D0] cursor-pointer hover:bg-[#DCFCE7] transition-all"
                                >
                                  <img 
                                    src={c.vmPhotoProofUrl} 
                                    alt="陳列佐證" 
                                    className="w-8 h-8 rounded object-cover border border-[#86EFAC]"
                                  />
                                  <div className="text-[10px] text-[#15803D] leading-tight">
                                    <div className="font-bold flex items-center gap-1">
                                      <Check className="w-3 h-3" />
                                      <span>已拍照驗證存證</span>
                                    </div>
                                    <div className="text-gray-500">{c.vmVerifiedAt || '已存入稽核日誌'} · {c.vmVerifiedBy || '店長已核准'}</div>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Styling Pitch with Clickable Modal */}
                            <div className="bg-white rounded-lg p-3 border border-[#E2E8F0] space-y-2 hover:border-[#A7F3D0] transition-colors">
                              <div className="flex items-center justify-between">
                                <div className="font-bold text-[#1E293B] flex items-center gap-1.5 text-xs text-[#059669]">
                                  <MessageSquare className="w-3.5 h-3.5" />
                                  <span>前線疊戴與搭售話術（不改標價）</span>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => setPitchModalCase(c)}
                                  className="inline-flex items-center space-x-1 text-[11px] font-bold text-[#059669] hover:text-[#047857] bg-[#ECFDF5] px-2 py-0.5 rounded border border-[#A7F3D0] hover:bg-[#D1FAE5] transition-colors"
                                >
                                  <Sparkles className="w-3 h-3 text-[#10B981]" />
                                  <span>查看實戰話術庫 →</span>
                                </button>
                              </div>

                              <p className="text-[#475569] leading-relaxed">
                                {c.salesPitchGuidance || '顧客挑選素面飾品時，主動引導「雙件疊戴風格」體驗，維持全國統一正價銷售。'}
                              </p>

                              {c.salesPitchDetail && (
                                <div 
                                  onClick={() => setPitchModalCase(c)}
                                  className="flex items-center justify-between bg-[#F8FAFC] p-2 rounded border border-[#E2E8F0] cursor-pointer hover:bg-[#F1F5F9] transition-colors text-[11px]"
                                >
                                  <span className="text-[#475569]">
                                    AI 建議搭售：<strong className="text-[#1E293B]">{c.salesPitchDetail.recommendedPairName}</strong>
                                  </span>
                                  <span className="text-[#059669] font-bold">點擊查閱完整台詞</span>
                                </div>
                              )}
                            </div>

                            {/* GWP Option */}
                            <div className="bg-white rounded-lg p-3 border border-[#E2E8F0] space-y-1">
                              <div className="font-bold text-[#1E293B] flex items-center gap-1.5 text-xs text-[#D97706]">
                                <Gift className="w-3.5 h-3.5" />
                                <span>門市 VIP 滿額贈禮轉化申請</span>
                              </div>
                              <p className="text-[#475569] leading-relaxed">
                                {c.gwpGuidance || '可向總部申請轉為本週末「單筆滿 $2,500 滿額限定禮」標的，拉高客單價。'}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Current Store DOS Stats */}
                        <div className="pt-2 border-t border-[#E2E8F0] flex items-center justify-between text-xs text-[#64748B]">
                          <span>{srcStore?.name} 目前在庫：<strong className="text-[#0F172A]">{srcInv?.availableStock ?? 0} 件</strong></span>
                          <span>預估可售天數：<strong className="text-[#2563EB]">{srcInv?.daysOfSupply?.toFixed(1) ?? '15.0'} 天</strong></span>
                        </div>
                      </div>

                      {/* Stage 2: 跨店正價智慧調撥 Box */}
                      <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 flex flex-col justify-between space-y-3 relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-[#8C6D3B] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-bl-lg uppercase tracking-wider">
                          備用後盾 · 急缺保全
                        </div>

                        <div>
                          <div className="flex items-center space-x-2 mb-2.5">
                            <span className="w-5 h-5 rounded-full bg-[#FAF1E3] text-[#8C6D3B] flex items-center justify-center font-bold text-xs">
                              2
                            </span>
                            <h4 className="text-sm font-bold text-[#1E293B] font-serif-heading">
                              階段二：跨店正價智慧調撥
                            </h4>
                          </div>

                          {/* Route Comparison Box */}
                          <div className="bg-white rounded-lg p-3 border border-[#E2E8F0] space-y-2.5">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-[#64748B]">調撥路徑試算：</span>
                              <span className="font-semibold text-[#8C6D3B] bg-[#FAF3E0] px-2 py-0.5 rounded border border-[#EADBAC]">
                                建議調出 {c.quantity} 件
                              </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                              <div className="p-2.5 bg-[#F8FAFC] rounded-lg border border-[#EDF2F7]">
                                <div className="text-[11px] text-[#64748B] uppercase font-semibold">調出店家 (存量充裕)</div>
                                <div className="font-bold text-[#1E293B] mt-0.5">{srcStore?.name}</div>
                                <div className="text-[#475569] mt-1">在架：{srcInv?.availableStock ?? 0} 件 | DOS: {srcInv?.daysOfSupply?.toFixed(1) ?? '15'} 天</div>
                              </div>

                              <div className="p-2.5 bg-[#FEF2F2] rounded-lg border border-[#FEE2E2]">
                                <div className="text-[11px] text-[#DC2626] uppercase font-semibold">調入店家 (正價急缺)</div>
                                <div className="font-bold text-[#991B1B] mt-0.5">{tgtStore?.name}</div>
                                <div className="text-[#B91C1C] mt-1">在架：{tgtInv?.availableStock ?? 0} 件 | 週末恐斷貨</div>
                              </div>
                            </div>

                            {/* Economics Metric */}
                            <div className="pt-2 border-t border-[#F1F5F9] flex flex-col sm:flex-row sm:items-center justify-between text-xs text-[#475569] gap-1">
                              <span className="flex items-center gap-1">
                                <DollarSign className="w-3.5 h-3.5 text-[#16A34A]" />
                                保全正價營收：<strong className="text-[#15803D]">NT$ {c.unitEconomics?.fullPriceRevenue?.toLocaleString() || ((prod?.price || 1980) * c.quantity).toLocaleString()}</strong>
                              </span>
                              <span className="text-[#64748B]">
                                預估物流運費：NT$ {c.unitEconomics?.transferCost || 90}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Rationale Bottom Note */}
                        <div className="pt-2 border-t border-[#E2E8F0] text-xs text-[#64748B] flex items-center justify-between">
                          <span>調入後預計售罄天數：<strong className="text-[#16A34A]">3 ~ 5 天 (正價完售)</strong></span>
                          <span className="text-[11px] text-[#94A3B8]">雙店店長確認後派車</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Execution Footer Bar */}
                    <div className="pt-3 border-t border-[#F1F5F9] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="text-xs text-[#64748B] flex items-center gap-1.5">
                        <Info className="w-3.5 h-3.5 text-[#C5A059]" />
                        <span>請門市主管依現場狀況選擇最合適的執行手段：</span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => onSelectCase(c)}
                          className="px-3 py-2 text-xs font-semibold text-[#4B5563] hover:text-[#1F2937] hover:bg-[#F3F4F6] rounded-lg transition-colors"
                        >
                          完整數據詳情
                        </button>

                        <button
                          onClick={() => onRejectRecommendation(c.id)}
                          className="px-3 py-2 text-xs font-semibold text-[#9CA3AF] hover:text-[#DC2626] hover:bg-[#FEF2F2] rounded-lg transition-colors border border-transparent hover:border-[#FECACA]"
                        >
                          暫時略過
                        </button>

                        {/* Adopt VM Observation Button */}
                        {onAdoptPrescriptionVM && pStatus !== 'vm_observing' && (
                          <button
                            onClick={() => {
                              if (!c.vmPhotoProofUrl) {
                                setVmModalCase(c);
                              } else {
                                onAdoptPrescriptionVM(c.id, c.vmPhotoProofUrl);
                              }
                            }}
                            className="px-3.5 py-2 text-xs font-semibold bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-lg transition-all shadow-xs flex items-center space-x-1.5 active:scale-95"
                            title="採納視覺陳列與疊戴推薦話術，拍照存證並進入 7 天觀察鎖定期"
                          >
                            <Camera className="w-3.5 h-3.5 text-[#BFDBFE]" />
                            <span>採納陳列話術 (拍照存證)</span>
                          </button>
                        )}

                        {/* Apply GWP Button */}
                        {onAdoptPrescriptionGWP && pStatus !== 'gwp_applied' && (
                          <button
                            onClick={() => onAdoptPrescriptionGWP(c.id)}
                            className="px-3 py-2 text-xs font-semibold bg-[#FAF3E0] hover:bg-[#F3E8CE] text-[#8C6D3B] border border-[#EADBAC] rounded-lg transition-all shadow-xs flex items-center space-x-1.5 active:scale-95"
                            title="申請作為門市 VIP 滿額限定贈禮"
                          >
                            <Gift className="w-3.5 h-3.5 text-[#C5A059]" />
                            <span>申請為滿額禮</span>
                          </button>
                        )}

                        {/* Initiate Cross-Store Transfer Button */}
                        <button
                          onClick={() => onAdoptRecommendation(c.id)}
                          className="px-4 py-2 text-xs font-semibold bg-[#8C6D3B] hover:bg-[#785D31] text-white rounded-lg transition-all shadow-xs flex items-center space-x-1.5 active:scale-95"
                          title="若原店無法消化或他店急缺，立即啟動跨店正價調撥審核"
                        >
                          <Truck className="w-3.5 h-3.5 text-[#FDE68A]" />
                          <span>啟動跨店正價調撥</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* VM Photo Verification Modal */}
      {vmModalCase && (
        <VMVerificationModal
          caseItem={vmModalCase}
          store={stores.find((s) => s.id === vmModalCase.sourceStoreId)}
          onClose={() => setVmModalCase(null)}
          onConfirmVerification={handleConfirmVmVerification}
        />
      )}

      {/* Sales Pitch & Stacking Guidance Modal */}
      {pitchModalCase && (
        <SalesPitchModal
          caseItem={pitchModalCase}
          product={getProduct(pitchModalCase.productId)}
          store={stores.find((s) => s.id === pitchModalCase.sourceStoreId)}
          onClose={() => setPitchModalCase(null)}
        />
      )}
    </div>
  );
};
