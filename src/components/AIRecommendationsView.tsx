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
  Package
} from 'lucide-react';
import { TransferCase, Store, Product, StoreInventory, UserRole, ViewScope } from '../types';

interface AIRecommendationsViewProps {
  cases: TransferCase[];
  stores: Store[];
  products: Product[];
  inventory: StoreInventory[];
  userRole: UserRole;
  viewScope: ViewScope;
  onAdoptRecommendation: (caseId: string) => void;
  onRejectRecommendation: (caseId: string) => void;
  onSelectCase: (caseItem: TransferCase) => void;
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
  onSelectCase,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  const aiCases不易 = cases.filter((c) => c.isAiGenerated);
  const pendingAiCases = aiCases不易.filter((c) => c.status === 'ai_pending');

  const getStoreName = (id: string) => stores.find((s) => s.id === id)?.name || id;
  const getProduct = (sku: string) => products.find((p) => p.sku === sku);

  const getStoreInventory = (storeId: string, productId: string) => {
    return inventory.find((inv) => inv.storeId === storeId && inv.productId === productId);
  };

  const handleSimulateCalculation = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setIsSimulating(false);
    }, 600);
  };

  return (
    <div className="p-8 max-w-[1440px] mx-auto space-y-6 animate-in fade-in-50 duration-200">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#1E232A] via-[#2A313C] to-[#1E232A] rounded-2xl p-7 text-white shadow-md relative overflow-hidden border border-[#3A4452]">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center space-x-2 bg-[#D4AF37]/20 border border-[#D4AF37]/40 px-3 py-1 rounded-full text-xs font-semibold text-[#F1D892] mb-3">
              <Sparkles className="w-3.5 h-3.5 text-[#F5DF9E]" />
              <span>KAVA AI 跨店供需平衡演算模型 V2.4</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold font-serif-heading tracking-tight text-[#F8FAFC]">
              AI 智慧調貨推薦引擎
            </h1>
            <p className="text-xs lg:text-sm text-[#94A3B8] mt-2 max-w-2xl leading-relaxed">
              即時比對全台 5 處門市即時動銷速率 (Daily Sales Velocity)、可售天數差距及顧客缺貨率預警，智慧演算最佳跨店調撥路徑。
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleSimulateCalculation}
              disabled={isSimulating}
              className="flex items-center space-x-2 bg-[#333C48] hover:bg-[#3D4755] text-white px-4 py-2.5 rounded-lg text-xs font-medium transition-all border border-[#4B5563]"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin text-[#D4AF37]' : ''}`} />
              <span>{isSimulating ? '演算法重新演算中...' : '重新跑分比對'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* AI Pending Recommendations Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#1E252E] flex items-center space-x-2 font-serif-heading">
            <span>待採用 AI 調撥建議</span>
            <span className="text-xs font-bold bg-[#FAF1E3] text-[#A27228] border border-[#EBD4AF] px-2.5 py-0.5 rounded-full">
              {pendingAiCases.length} 筆待決策
            </span>
          </h2>
          <span className="text-xs text-[#64748B]">採用後自動進入來源店與目的店雙重確認機制</span>
        </div>

        {pendingAiCases.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#E8EAEE] p-12 text-center">
            <CheckCircle2 className="w-12 h-12 text-[#2A9D6A] mx-auto mb-3" />
            <h3 className="text-base font-bold text-[#1F2633]">目前各店庫存供需平衡良好</h3>
            <p className="text-xs text-[#64748B] mt-1">無急迫跨店調撥建議，系統每 7 秒持續監控庫存異動。</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {pendingAiCases.map((c) => {
              const srcStore = stores.find((s) => s.id === c.sourceStoreId);
              const tgtStore = stores.find((s) => s.id === c.targetStoreId);
              const prod = products.find((p) => p.id === c.productId);
              const srcInv = getStoreInventory(c.sourceStoreId, c.productId);
              const tgtInv = getStoreInventory(c.targetStoreId, c.productId);

              return (
                <div
                  key={c.id}
                  className="bg-white rounded-xl border border-[#E8EAEE] p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:border-[#D4AF37]/50 transition-all space-y-4"
                >
                  {/* Top Bar with AI score badge */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F1F3F6] pb-3">
                    <div className="flex items-center space-x-3">
                      <span className="text-xs font-mono font-bold bg-[#F4F5F7] text-[#475569] px-2 py-0.5 rounded border border-[#E2E8F0]">
                        {c.caseNumber}
                      </span>
                      <h3 className="text-base font-bold text-[#1E252E]">{c.productName}</h3>
                      <span className="text-xs text-[#64748B]">({c.productSku})</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-[#64748B]">AI 信心指標:</span>
                      <span className="text-xs font-bold bg-[#FBF3DE] text-[#916E25] border border-[#ECD9A8] px-2.5 py-1 rounded-md flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-[#B0893F]" />
                        {c.aiScore || 95}% 最佳解
                      </span>
                    </div>
                  </div>

                  {/* Transfer Route & Stock Comparison */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#FAFBFD] p-4 rounded-xl border border-[#EDF1F6]">
                    {/* Source Store */}
                    <div className="flex flex-col space-y-1">
                      <span className="text-[11px] font-semibold text-[#8C98A6] uppercase">
                        調出店家 (供方)
                      </span>
                      <span className="text-sm font-bold text-[#1E293B]">{srcStore?.name}</span>
                      <div className="text-xs text-[#475569] mt-1 space-y-0.5">
                        <div>在架庫存：<span className="font-semibold text-[#16A34A]">{srcInv?.availableStock ?? 0} 件</span></div>
                        <div>可售天數：<span className="font-semibold">{srcInv?.daysOfSupply?.toFixed(1) ?? '-'} 天</span> (存量充裕)</div>
                      </div>
                    </div>

                    {/* Route Arrow & Quantity */}
                    <div className="flex flex-col items-center justify-center py-2">
                      <span className="text-xs font-semibold text-[#8C6D3B] bg-[#FAF3E0] px-3 py-1 rounded-full border border-[#EADBAC] mb-1">
                        建議調撥 {c.quantity} 件
                      </span>
                      <ArrowRight className="w-5 h-5 text-[#C5A059]" />
                    </div>

                    {/* Target Store */}
                    <div className="flex flex-col space-y-1">
                      <span className="text-[11px] font-semibold text-[#8C98A6] uppercase">
                        調入店家 (需方)
                      </span>
                      <span className="text-sm font-bold text-[#1E293B]">{tgtStore?.name}</span>
                      <div className="text-xs text-[#475569] mt-1 space-y-0.5">
                        <div>在架庫存：<span className="font-bold text-[#DC2626]">{tgtInv?.availableStock ?? 0} 件 (急缺)</span></div>
                        <div>可售天數：<span className="font-semibold text-[#DC2626]">{tgtInv?.daysOfSupply?.toFixed(1) ?? '0'} 天</span></div>
                      </div>
                    </div>
                  </div>

                  {/* AI Rationale */}
                  <div className="bg-[#FAF7EE] border border-[#EFE2C5] rounded-lg p-3 text-xs text-[#6B5527] leading-relaxed flex items-start space-x-2">
                    <Sparkles className="w-4 h-4 text-[#C5A059] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-[#554019] mr-1.5">AI 演算依據：</span>
                      {c.aiRationale || c.transferReason}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end space-x-3 pt-2">
                    <button
                      onClick={() => onSelectCase(c)}
                      className="px-4 py-2 text-xs font-semibold text-[#4B5563] hover:text-[#1F2937] hover:bg-[#F3F4F6] rounded-lg transition-colors"
                    >
                      檢視詳細數據
                    </button>
                    <button
                      onClick={() => onRejectRecommendation(c.id)}
                      className="px-4 py-2 text-xs font-semibold text-[#9CA3AF] hover:text-[#DC2626] hover:bg-[#FEF2F2] rounded-lg transition-colors border border-transparent hover:border-[#FECACA]"
                    >
                      暫時略過
                    </button>
                    <button
                      onClick={() => onAdoptRecommendation(c.id)}
                      className="px-5 py-2 text-xs font-semibold bg-[#8C6D3B] hover:bg-[#785D31] text-white rounded-lg transition-all shadow-sm flex items-center space-x-1.5 active:scale-95"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#FDE68A]" />
                      <span>採用建議並送出審核</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
