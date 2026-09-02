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
  onStartImprovement: (caseId: string) => void;
  onEvaluateImprovement: (caseId: string) => void;
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
  onStartImprovement,
  onEvaluateImprovement,
  onRejectRecommendation,
  onSelectCase,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  const aiCases不易 = cases.filter((c) => c.isAiGenerated);
  const pendingAiCases = aiCases不易.filter((c) =>
    c.status === 'ai_pending' &&
    c.caseType !== 'omo_fulfillment' &&
    (viewScope === 'all' || c.sourceStoreId === viewScope || c.targetStoreId === viewScope)
  );

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
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1440px] mx-auto space-y-5 sm:space-y-6 animate-in fade-in-50 duration-200">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#1E232A] via-[#2A313C] to-[#1E232A] rounded-2xl p-5 sm:p-7 text-white shadow-md relative overflow-hidden border border-[#3A4452]">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center space-x-2 bg-[#D4AF37]/20 border border-[#D4AF37]/40 px-3 py-1 rounded-full text-xs font-semibold text-[#F1D892] mb-3">
              <Sparkles className="w-3.5 h-3.5 text-[#F5DF9E]" />
              <span>KAVA AI 跨店供需平衡演算模型 V2.4</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold font-serif-heading tracking-tight text-[#F8FAFC]">
              AI 庫存改善建議
            </h1>
            <p className="text-xs lg:text-sm text-[#94A3B8] mt-2 max-w-2xl leading-relaxed">
              先建議門市陳列與推廣改善，觀察成效後，再結合可售天數與他店缺貨需求判斷是否調撥。
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleSimulateCalculation}
              disabled={isSimulating}
            className="w-full sm:w-auto justify-center flex items-center space-x-2 bg-[#333C48] hover:bg-[#3D4755] text-white px-4 py-2.5 rounded-lg text-xs font-medium transition-all border border-[#4B5563]"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin text-[#D4AF37]' : ''}`} />
              <span>{isSimulating ? '演算法重新演算中...' : '重新跑分比對'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* AI Pending Recommendations Cards */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="text-base sm:text-lg font-bold text-[#1E252E] flex flex-wrap items-center gap-2 font-serif-heading">
            <span>AI 改善決策</span>
            <span className="text-xs font-bold bg-[#FAF1E3] text-[#A27228] border border-[#EBD4AF] px-2.5 py-0.5 rounded-full">
              {pendingAiCases.length} 筆待決策
            </span>
          </h2>
          <span className="text-xs text-[#64748B]">優先改善 → 觀察成效 → 建議留店／建議調撥</span>
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
              const decisionStage = c.aiDecisionStage || 'priority_improvement';
              const srcStore = stores.find((s) => s.id === c.sourceStoreId);
              const tgtStore = stores.find((s) => s.id === c.targetStoreId);
              const prod = products.find((p) => p.id === c.productId);
              const srcInv = getStoreInventory(c.sourceStoreId, c.productId);
              const tgtInv = getStoreInventory(c.targetStoreId, c.productId);

              return (
                <div
                  key={c.id}
                  className="bg-white rounded-xl border border-[#E8EAEE] p-4 sm:p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:border-[#D4AF37]/50 transition-all space-y-4"
                >
                  {/* Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F1F3F6] pb-3">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 min-w-0">
                      <span className="text-xs font-mono font-bold bg-[#F4F5F7] text-[#475569] px-2 py-0.5 rounded border border-[#E2E8F0]">
                        {c.caseNumber}
                      </span>
                      <h3 className="text-base font-bold text-[#1E252E] break-words">{c.productName}</h3>
                      <span className="text-xs text-[#64748B]">({c.productSku})</span>
                    </div>

                    <span className="text-xs text-[#64748B]">系統已完成庫存與需求檢核</span>
                  </div>

                  {/* Current decision: one clear action, with transfer kept as a fallback. */}
                  <div className="rounded-xl border border-[#DDE7DF] bg-[#F4F8F4] p-4">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                            decisionStage === 'observing' ? 'bg-[#EEF3FA] text-[#46627E] border-[#D4E0ED]' :
                            decisionStage === 'retain' ? 'bg-[#EAF5ED] text-[#39704A] border-[#CDE4D3]' :
                            decisionStage === 'transfer' ? 'bg-[#FAF1E3] text-[#8C6328] border-[#EBD4AF]' :
                            'bg-white text-[#4E6B54] border-[#CFE0D2]'
                          }`}>
                            {decisionStage === 'observing' ? '改善觀察中' : decisionStage === 'retain' ? '建議留店' : decisionStage === 'transfer' ? '建議調撥' : '優先改善'}
                          </span>
                          {decisionStage === 'priority_improvement' && <span className="text-xs text-[#617067]">建議觀察 7 天</span>}
                        </div>
                        <h4 className="text-sm font-bold text-[#25352A]">
                          {decisionStage === 'observing' ? '已啟動店內改善，觀察銷售變化' :
                           decisionStage === 'retain' ? '改善後銷售回升，建議繼續留店' :
                           decisionStage === 'transfer' ? '改善成效不足，他店需求明確' :
                           '先改善陳列與門市推廣'}
                        </h4>
                        <p className="text-xs text-[#5F6D63] mt-1.5 leading-relaxed">
                          {c.improvementResult || c.improvementAction || `將「${c.productName}」移至主視覺區，搭配熱銷品推薦，並記錄 7 天銷售。`}
                        </p>
                      </div>
                      <div className="sm:text-right shrink-0 text-xs text-[#64748B]">
                        <div>備用方案</div>
                        <div className="font-semibold text-[#7A5B2B] mt-0.5">調撥 {c.quantity} 件至 {tgtStore?.name}</div>
                      </div>
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
                      <ArrowRight className="w-5 h-5 text-[#C5A059] rotate-90 md:rotate-0" />
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
                  <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2 sm:gap-3 pt-2">
                    <button
                      onClick={() => onSelectCase(c)}
                      className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-[#4B5563] hover:text-[#1F2937] hover:bg-[#F3F4F6] rounded-lg transition-colors"
                    >
                      檢視詳細數據
                    </button>
                    <button
                      onClick={() => onRejectRecommendation(c.id)}
                      className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-[#9CA3AF] hover:text-[#DC2626] hover:bg-[#FEF2F2] rounded-lg transition-colors border border-transparent hover:border-[#FECACA]"
                    >
                      暫時略過
                    </button>
                    <button
                      onClick={() => decisionStage === 'priority_improvement' ? onStartImprovement(c.id) : decisionStage === 'observing' ? onEvaluateImprovement(c.id) : decisionStage === 'transfer' ? onAdoptRecommendation(c.id) : onSelectCase(c)}
                      className="w-full sm:w-auto justify-center px-5 py-2.5 text-xs font-semibold bg-[#6F805F] hover:bg-[#5E704F] text-white rounded-lg transition-all shadow-sm flex items-center space-x-1.5 active:scale-95"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#FDE68A]" />
                      <span>{decisionStage === 'priority_improvement' ? '採用優先改善' : decisionStage === 'observing' ? '完成觀察並重新評估' : decisionStage === 'transfer' ? '建立調撥並送審' : '查看改善成效'}</span>
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

