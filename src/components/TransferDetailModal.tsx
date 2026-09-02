import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Truck, 
  ShieldCheck, 
  AlertCircle,
  Package,
  Building2,
  Calendar,
  Sparkles,
  Send,
  Camera,
  MessageSquare,
  Check,
  Gift,
  Store as StoreIcon,
  HelpCircle,
  Lock,
  ArrowUpRight,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { TransferCase, Store, Product, UserRole } from '../types';

interface TransferDetailModalProps {
  caseItem: TransferCase | null;
  onClose: () => void;
  stores: Store[];
  products: Product[];
  userRole: UserRole;
  onApproveSource: (caseId: string) => void;
  onApproveTarget: (caseId: string) => void;
  onDispatchCourier: (caseId: string, trackingNumber: string) => void;
  onCompleteTransfer: (caseId: string) => void;
  onRejectTransfer: (caseId: string) => void;
  onApproveGWP?: (caseId: string) => void;
  onRejectGWP?: (caseId: string) => void;
  onEscalateVM?: (caseId: string) => void;
  onResolveVM?: (caseId: string) => void;
}

export const TransferDetailModal: React.FC<TransferDetailModalProps> = ({
  caseItem,
  onClose,
  stores,
  products,
  userRole,
  onApproveSource,
  onApproveTarget,
  onDispatchCourier,
  onCompleteTransfer,
  onRejectTransfer,
  onApproveGWP,
  onRejectGWP,
  onEscalateVM,
  onResolveVM,
}) => {
  const [courierInput, setCourierInput] = useState<string>('黑貓宅急便 #884920194');

  if (!caseItem) return null;

  const srcStore = stores.find((s) => s.id === caseItem.sourceStoreId);
  const tgtStore = stores.find((s) => s.id === caseItem.targetStoreId);
  const prod = products.find((p) => p.id === caseItem.productId);

  const canApproveSource =
    userRole === 'admin' || userRole === caseItem.sourceStoreId;
  const canApproveTarget =
    userRole === 'admin' || userRole === caseItem.targetStoreId;
  const isHQAdmin = userRole === 'admin';

  // Determine if this is a GWP marketing gift application
  const isGWPApplication = caseItem.prescriptionAction === 'gwp_gift' || caseItem.prescriptionStatus === 'gwp_applied';
  // Determine if this is a VM observation case
  const isVMObservation = caseItem.prescriptionStatus === 'vm_observing';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-[#E5E7EB] overflow-hidden flex flex-col max-h-[92vh] my-auto">
        {/* Header */}
        <div className={`p-4 sm:p-6 text-white flex items-center justify-between border-b ${
          isGWPApplication 
            ? 'bg-gradient-to-r from-[#143E2C] to-[#1E293B] border-[#205A42]' 
            : isVMObservation 
            ? 'bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#1E3A8A] border-[#1E3A8A]'
            : 'bg-[#181C20] border-[#2B323A]'
        }`}>
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isGWPApplication 
                ? 'bg-[#10B981]/20 border border-[#34D399]/40 text-[#6EE7B7]'
                : isVMObservation
                ? 'bg-[#3B82F6]/20 border border-[#60A5FA]/40 text-[#93C5FD]'
                : 'bg-[#C5A059]/20 border border-[#C5A059]/40 text-[#E8C683]'
            }`}>
              {isGWPApplication ? (
                <Gift className="w-5 h-5" />
              ) : isVMObservation ? (
                <Camera className="w-5 h-5" />
              ) : (
                <Package className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs font-bold text-[#F5DE9B]">
                  {caseItem.caseNumber}
                </span>
                {isGWPApplication ? (
                  <span className="text-[10px] bg-[#10B981]/30 text-[#6EE7B7] px-2 py-0.5 rounded-full flex items-center gap-1 font-bold border border-[#10B981]/40">
                    <Gift className="w-2.5 h-2.5" />
                    專櫃 VIP 滿額贈禮轉化申請
                  </span>
                ) : isVMObservation ? (
                  <span className="text-[10px] bg-[#3B82F6]/30 text-[#93C5FD] px-2 py-0.5 rounded-full flex items-center gap-1 font-bold border border-[#3B82F6]/40">
                    <Lock className="w-2.5 h-2.5" />
                    原店陳列觀察中 · 調撥暫時凍結 (7天)
                  </span>
                ) : (
                  <span className="text-[10px] bg-[#C5A059]/30 text-[#F5DE9B] px-1.5 py-0.5 rounded flex items-center gap-1 font-medium">
                    <Sparkles className="w-2.5 h-2.5" />
                    跨店正價調撥
                  </span>
                )}
              </div>
              <h2 className="text-base sm:text-lg font-bold font-serif-heading text-white mt-0.5">
                {caseItem.productName}
              </h2>
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
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-5 flex-1 text-xs text-[#374151]">
          
          {/* ========================================================================= */}
          {/* SCENARIO 1: VM Observation Mode (7-day local observation - NO TRANSFER)  */}
          {/* ========================================================================= */}
          {isVMObservation ? (
            <div className="space-y-4">
              {/* Top Banner: Local observation notice */}
              <div className="bg-gradient-to-br from-[#EFF6FF] to-[#DBEAFE] rounded-xl p-4 border border-[#BFDBFE] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-[#1E40AF] font-bold text-sm">
                    <Lock className="w-4 h-4 text-[#2563EB]" />
                    <span>案件狀態：【原店陳列觀察中 · 調撥暫時凍結】</span>
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#DBEAFE] text-[#1D4ED8] border border-[#93C5FD] flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    剩餘 {caseItem.observationDaysRemaining || 7} 天鎖定
                  </span>
                </div>

                {/* Single Store Lock Status */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="bg-white p-3 rounded-lg border border-[#BFDBFE]">
                    <div className="text-[10px] text-[#64748B] font-semibold uppercase">執行陳列門市（原店留用）</div>
                    <div className="text-sm font-bold text-[#1E293B] mt-0.5">{srcStore?.name}</div>
                    <div className="text-[11px] text-[#475569] mt-0.5">店長：{srcStore?.manager}（留用 {caseItem.quantity} 件實施話術）</div>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-[#BFDBFE]">
                    <div className="text-[10px] text-[#64748B] font-semibold uppercase">全台專櫃定價 (正價不變)</div>
                    <div className="text-sm font-bold text-[#2563EB] mt-0.5">
                      NT$ {prod?.price?.toLocaleString() || '1,980'} / 件
                    </div>
                    <div className="text-[11px] text-[#475569] mt-0.5">
                      正價保全總值：NT$ {((prod?.price || 1980) * caseItem.quantity).toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Policy explanation */}
                <div className="p-3 bg-white/95 rounded-lg border border-[#BFDBFE] text-xs text-[#1E40AF] space-y-1.5 leading-relaxed">
                  <div className="font-bold flex items-center gap-1 text-[#1D4ED8]">
                    <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
                    <span>閉環演算法觀察機制說明：</span>
                  </div>
                  <p className="text-[#334155]">
                    目前系統已<strong>暫停此品項的跨店調貨</strong>，由 <strong>{srcStore?.name}</strong> 於現場執行視覺陳列位優化與成套疊戴推薦話術，進行 7 天在地動銷驗證。<strong>目前無需進行任何雙店出入庫點收。</strong>
                  </p>
                </div>
              </div>

              {/* Photo Proof & Speech Configuration Card */}
              <div className="p-4 bg-white rounded-xl border border-[#E2E8F0] space-y-3 shadow-2xs">
                <div className="flex items-center justify-between font-bold text-xs text-[#1E293B] border-b border-gray-100 pb-2">
                  <span className="flex items-center gap-1.5 text-[#2563EB]">
                    <Camera className="w-4 h-4" />
                    門市現場陳列拍照存證紀錄
                  </span>
                  <span className="text-[11px] text-gray-500 font-normal">
                    {caseItem.vmVerifiedAt || '2026/9/2 下午2:01:29'} · {caseItem.vmVerifiedBy || `${srcStore?.name}店長`}
                  </span>
                </div>
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3.5">
                  <img 
                    src={caseItem.vmPhotoProofUrl || 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500&auto=format&fit=crop&q=80'} 
                    alt="陳列佐證" 
                    className="w-full sm:w-28 h-24 rounded-lg object-cover border border-[#CBD5E1] shadow-2xs"
                  />
                  <div className="text-xs text-[#475569] leading-relaxed space-y-1.5 flex-1">
                    <div className="font-bold text-[#1E293B] flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
                      <span>已依指引完成陳列位調整與拍照核驗</span>
                    </div>
                    <div className="text-[11px] text-[#64748B] bg-[#F8FAFC] p-2 rounded-md border border-[#E2E8F0]">
                      {caseItem.vmGuidance || '建議從「壁面飾品架（第 3 層）」移至「中央中島試戴鏡旁絲絨首飾盤」，與店內熱銷款「微光鎖骨鍊」成套展示。'}
                    </div>
                  </div>
                </div>

                {/* Sales Pitch Guidance */}
                {caseItem.salesPitchDetail && (
                  <div className="p-3 bg-[#F0FDF4] rounded-lg border border-[#BBF7D0] text-[11px] space-y-1">
                    <div className="font-bold text-[#065F46] flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5 text-[#059669]" />
                      <span>AI 推薦搭配熱銷款：{caseItem.salesPitchDetail.recommendedPairName}</span>
                    </div>
                    <div className="text-[#047857] italic leading-relaxed">
                      {caseItem.salesPitchDetail.iceBreakerScript}
                    </div>
                  </div>
                )}
              </div>

              {/* Next Steps & Action Options */}
              <div className="bg-white rounded-xl border border-[#E5E7EB] p-4 space-y-3">
                <div className="font-bold text-[#1F2937] flex items-center justify-between border-b border-gray-100 pb-2">
                  <span className="flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-[#2563EB]" />
                    <span>觀察期成效判定與總部操作</span>
                  </span>
                  <span className="text-[11px] text-gray-500 font-normal">
                    預計於 7 天期滿自動評估
                  </span>
                </div>

                <div className="text-xs text-[#475569] space-y-1 leading-relaxed">
                  <p>• <strong>成效達標（售出 ≥ 1 件）</strong>：系統將自動撤銷調撥建議，由原店完售結案。</p>
                  <p>• <strong>成效未達標（7 天仍無動銷）</strong>：系統將自動解凍，升級啟動「跨店正價調撥（一中店）」。</p>
                </div>

                {/* Action Buttons for VM observation */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => onResolveVM && onResolveVM(caseItem.id)}
                    className="w-full bg-[#ECFDF5] hover:bg-[#D1FAE5] text-[#065F46] border border-[#A7F3D0] py-2.5 rounded-lg font-bold text-xs transition-all active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
                    <span>原店已成功售出（免調貨結案）</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onEscalateVM && onEscalateVM(caseItem.id)}
                    className="w-full bg-[#FFFBEB] hover:bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] py-2.5 rounded-lg font-bold text-xs transition-all active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5 text-[#D97706]" />
                    <span>提前結束觀察（升級跨店調撥）</span>
                  </button>
                </div>
              </div>
            </div>
          ) : isGWPApplication ? (
            /* ========================================================================= */
            /* SCENARIO 2: GWP VIP Marketing Gift Conversion (Single-store presentation) */
            /* ========================================================================= */
            <div className="space-y-4">
              {/* Single Store Application Banner */}
              <div className="bg-gradient-to-br from-[#F0FDF4] to-[#ECFDF5] rounded-xl p-4 border border-[#A7F3D0] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-[#065F46] font-bold text-sm">
                    <Gift className="w-4 h-4 text-[#059669]" />
                    <span>案件類型：【原店行銷贈禮轉化】（非跨店調貨）</span>
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC]">
                    留用本門市 {caseItem.quantity} 件
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="bg-white p-3 rounded-lg border border-[#BBF7D0]">
                    <div className="text-[10px] text-[#64748B] font-semibold uppercase">申請留用門市</div>
                    <div className="text-sm font-bold text-[#1F2937] mt-0.5">{srcStore?.name}</div>
                    <div className="text-[11px] text-[#4B5563] mt-0.5">店長：{srcStore?.manager}</div>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-[#BBF7D0]">
                    <div className="text-[10px] text-[#64748B] font-semibold uppercase">全台專櫃定價 (正價不變)</div>
                    <div className="text-sm font-bold text-[#059669] mt-0.5">
                      NT$ {prod?.price?.toLocaleString() || caseItem.unitEconomics?.fullPrice?.toLocaleString() || '1,980'} / 件
                    </div>
                    <div className="text-[11px] text-[#4B5563] mt-0.5">
                      轉化總值：NT$ {((prod?.price || 1980) * caseItem.quantity).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-white/90 rounded-lg border border-[#BBF7D0] text-xs text-[#065F46] space-y-1.5 leading-relaxed">
                  <div className="font-bold flex items-center gap-1 text-[#047857]">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>轉化目的與策略價值：</span>
                  </div>
                  <p>
                    {caseItem.gwpGuidance || '轉為本季專櫃 VIP 滿額限定搭贈禮標的（例如單筆消費滿 NT$ 2,500 ~ 3,000 滿額搭贈），不改標籤售價、無跨店物流成本，拉高專櫃客單價並保全品牌高奢質感。'}
                  </p>
                </div>
              </div>

              {/* HQ Authorization Card for GWP */}
              <div className="bg-white rounded-xl border border-[#E5E7EB] p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <span className="font-bold text-[#1F2937] flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#059669]" />
                    <span>總公司商品部 / 行銷部 授權覆核</span>
                  </span>
                  <span className="text-[11px] font-bold text-[#059669]">
                    {caseItem.status === 'completed' ? '✅ 總部已核准轉列' : '⏳ 等待總公司覆核'}
                  </span>
                </div>

                {caseItem.status === 'completed' ? (
                  <div className="p-3 bg-[#F0FDF4] rounded-lg border border-[#BBF7D0] flex items-center space-x-2.5 text-[#166534]">
                    <CheckCircle2 className="w-5 h-5 text-[#16A34A] shrink-0" />
                    <div>
                      <div className="font-bold">已核准轉化為專櫃 VIP 滿額禮</div>
                      <div className="text-[11px] text-[#475569] mt-0.5">
                        系統已將 {caseItem.quantity} 件自可售庫存轉列為行銷贈品庫存。
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-[#475569] text-xs leading-relaxed">
                      若核准，該批庫存將扣抵為 <strong>{srcStore?.name}</strong> 的行銷贈品專案額度；若調入店（如 {tgtStore?.name}）目前有強烈正價缺貨需求，總部可選擇駁回並啟動跨店調撥。
                    </p>

                    {isHQAdmin && onApproveGWP && onRejectGWP && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => onRejectGWP(caseItem.id)}
                          className="w-full bg-[#FFF1F2] hover:bg-[#FFE4E6] text-[#BE123C] border border-[#FECDD3] py-2.5 rounded-lg font-bold text-xs transition-all active:scale-95 flex items-center justify-center gap-1"
                        >
                          <ArrowRight className="w-3.5 h-3.5" />
                          <span>駁回申請（升級為跨店調撥）</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onApproveGWP(caseItem.id)}
                          className="w-full bg-[#059669] hover:bg-[#047857] text-white py-2.5 rounded-lg font-bold text-xs transition-all active:scale-95 shadow-xs flex items-center justify-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>總部核准：轉為滿額贈品</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* ========================================================================= */
            /* SCENARIO 3: Standard Inter-Store Transfer (Dual Confirmation Required)   */
            /* ========================================================================= */
            <div className="space-y-4">
              {/* Route Card */}
              <div className="bg-[#FAFBFD] rounded-xl p-4 border border-[#EDF1F6] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-3 w-full sm:w-auto">
                  <div className="w-8 h-8 rounded-full bg-[#E5E7EB] text-[#374151] flex items-center justify-center font-bold text-xs">
                    出
                  </div>
                  <div>
                    <div className="text-[10px] text-[#9CA3AF] uppercase font-semibold">調出店家</div>
                    <div className="text-sm font-bold text-[#1F2937]">{srcStore?.name}</div>
                    <div className="text-[11px] text-[#6B7280]">店長：{srcStore?.manager}</div>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center">
                  <span className="text-xs font-bold text-[#8C6D3B] bg-[#FAF3E0] px-3 py-0.5 rounded-full border border-[#EEDB9F]">
                    調撥 {caseItem.quantity} 件
                  </span>
                  <ArrowRight className="w-4 h-4 text-[#C5A059] mt-1" />
                </div>

                <div className="flex items-center space-x-3 w-full sm:w-auto">
                  <div className="w-8 h-8 rounded-full bg-[#181C20] text-[#E8C683] flex items-center justify-center font-bold text-xs">
                    入
                  </div>
                  <div>
                    <div className="text-[10px] text-[#9CA3AF] uppercase font-semibold">調入店家</div>
                    <div className="text-sm font-bold text-[#1F2937]">{tgtStore?.name}</div>
                    <div className="text-[11px] text-[#6B7280]">店長：{tgtStore?.manager}</div>
                  </div>
                </div>
              </div>

              {/* Dual Confirmation Status Card for Inter-Store Transfer */}
              <div className="bg-white rounded-xl border border-[#E5E7EB] p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <span className="font-bold text-[#1F2937] flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#C5A059]" />
                    <span>雙店確認與授權審核進度</span>
                  </span>
                  <span className="text-[11px] text-[#6B7280]">
                    {caseItem.status === 'both_confirmed' ? '✅ 雙方皆已確認' : '⏳ 等待雙方回合核准'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Source Store Status */}
                  <div className={`p-3 rounded-lg border flex flex-col justify-between ${
                    caseItem.sourceConfirmed ? 'bg-[#ECFDF5] border-[#A7F3D0]' : 'bg-[#FFFBEB] border-[#FDE68A]'
                  }`}>
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-[#1F2937]">1. 調出店 (出庫授權)</span>
                        {caseItem.sourceConfirmed ? (
                          <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                        ) : (
                          <Clock className="w-4 h-4 text-[#D97706]" />
                        )}
                      </div>
                      <p className="text-[11px] text-[#6B7280] mt-1">
                        {caseItem.sourceConfirmed
                          ? `已核准 (${caseItem.sourceConfirmedAt || '已確認'})`
                          : `等待 ${srcStore?.shortName} 店長核准出庫`}
                      </p>
                    </div>

                    {!caseItem.sourceConfirmed && canApproveSource && (
                      <button
                        onClick={() => onApproveSource(caseItem.id)}
                        className="mt-3 w-full bg-[#10B981] hover:bg-[#059669] text-white py-1.5 rounded-md font-bold text-xs transition-colors"
                      >
                        調出店確認核准出庫
                      </button>
                    )}
                  </div>

                  {/* Target Store Status */}
                  <div className={`p-3 rounded-lg border flex flex-col justify-between ${
                    caseItem.targetConfirmed ? 'bg-[#ECFDF5] border-[#A7F3D0]' : 'bg-[#FFFBEB] border-[#FDE68A]'
                  }`}>
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-[#1F2937]">2. 調入店 (入庫承諾)</span>
                        {caseItem.targetConfirmed ? (
                          <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                        ) : (
                          <Clock className="w-4 h-4 text-[#D97706]" />
                        )}
                      </div>
                      <p className="text-[11px] text-[#6B7280] mt-1">
                        {caseItem.targetConfirmed
                          ? `已核准 (${caseItem.targetConfirmedAt || '已確認'})`
                          : `等待 ${tgtStore?.shortName} 店長確認需求`}
                      </p>
                    </div>

                    {!caseItem.targetConfirmed && canApproveTarget && (
                      <button
                        onClick={() => onApproveTarget(caseItem.id)}
                        className="mt-3 w-full bg-[#10B981] hover:bg-[#059669] text-white py-1.5 rounded-md font-bold text-xs transition-colors"
                      >
                        調入店確認需求入庫
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Reason & Remarks */}
          <div className="bg-[#FAFBFD] rounded-xl p-4 border border-[#E9ECF0] space-y-2">
            <div>
              <span className="font-bold text-[#4B5563]">診斷與原因：</span>
              <p className="text-[#1F2937] mt-0.5">{caseItem.diagnosis || caseItem.transferReason}</p>
            </div>
            {caseItem.aiRationale && (
              <div className="pt-2 border-t border-[#EDF1F6]">
                <span className="font-bold text-[#8C6D3B]">AI 演算分析建議：</span>
                <p className="text-[#64748B] mt-0.5">{caseItem.aiRationale}</p>
              </div>
            )}
            {caseItem.remarks && (
              <div className="pt-2 border-t border-[#EDF1F6]">
                <span className="font-bold text-[#4B5563]">備註說明：</span>
                <p className="text-[#64748B] mt-0.5">{caseItem.remarks}</p>
              </div>
            )}
          </div>

          {/* Courier & Dispatch Section (When both confirmed in Transfer mode) */}
          {caseItem.status === 'both_confirmed' && !isGWPApplication && !isVMObservation && (
            <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl p-4 space-y-3">
              <div className="flex items-center space-x-2 text-[#1E40AF] font-bold">
                <Truck className="w-4 h-4" />
                <span>雙方已授權完畢，請進行物流發貨</span>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={courierInput}
                  onChange={(e) => setCourierInput(e.target.value)}
                  placeholder="輸入物流商與追蹤單號..."
                  className="flex-1 bg-white border border-[#93C5FD] rounded-lg px-3 py-1.5 text-xs text-[#1E293B] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                />
                <button
                  onClick={() => onDispatchCourier(caseItem.id, courierInput)}
                  className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-4 py-1.5 rounded-lg font-bold text-xs transition-colors shrink-0"
                >
                  發送物流單號並發貨
                </button>
              </div>
            </div>
          )}

          {caseItem.status === 'in_transit' && (
            <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Truck className="w-5 h-5 text-[#16A34A]" />
                <div>
                  <div className="font-bold text-[#166534]">物流運送派送中</div>
                  <div className="text-[11px] text-[#475569] font-mono">{caseItem.courierNumber}</div>
                </div>
              </div>
              <button
                onClick={() => onCompleteTransfer(caseItem.id)}
                className="bg-[#16A34A] hover:bg-[#15803D] text-white px-4 py-2 rounded-lg font-bold text-xs transition-colors"
              >
                門市點收無誤，確認入庫完成
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#F9FAFB] border-t border-[#E5E7EB] flex items-center justify-between">
          {!isGWPApplication && !isVMObservation ? (
            <button
              onClick={() => onRejectTransfer(caseItem.id)}
              className="text-xs font-semibold text-[#EF4444] hover:underline"
            >
              駁回 / 取消此調撥
            </button>
          ) : isVMObservation ? (
            <span className="text-xs text-[#2563EB] font-medium flex items-center gap-1">
              <Lock className="w-3.5 h-3.5" />
              調撥鎖定中 · 優先原店動銷
            </span>
          ) : (
            <span className="text-xs text-[#059669] font-medium flex items-center gap-1">
              <Gift className="w-3.5 h-3.5" />
              專櫃 VIP 滿額禮專案轉化審核
            </span>
          )}
          
          <button
            onClick={onClose}
            className="bg-[#181C20] hover:bg-[#2B323A] text-white px-5 py-2 rounded-lg text-xs font-semibold transition-colors"
          >
            關閉視窗
          </button>
        </div>
      </div>
    </div>
  );
};
