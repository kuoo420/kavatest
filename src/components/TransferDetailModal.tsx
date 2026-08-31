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
  Send
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
}) => {
  const [courierInput, setCourierInput] = useState<string>('黑貓宅急便 #884920194');
  const [isDispatching, setIsDispatching] = useState<boolean>(false);

  if (!caseItem) return null;

  const srcStore = stores.find((s) => s.id === caseItem.sourceStoreId);
  const tgtStore = stores.find((s) => s.id === caseItem.targetStoreId);
  const prod = products.find((p) => p.id === caseItem.productId);

  const canApproveSource =
    userRole === 'admin' || userRole === caseItem.sourceStoreId;
  const canApproveTarget =
    userRole === 'admin' || userRole === caseItem.targetStoreId;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-[#E5E7EB] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 bg-[#181C20] text-white flex items-center justify-between border-b border-[#2B323A]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#C5A059]/20 border border-[#C5A059]/40 flex items-center justify-center">
              <Package className="w-5 h-5 text-[#E8C683]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs font-bold text-[#E8C683]">
                  {caseItem.caseNumber}
                </span>
                {caseItem.isAiGenerated && (
                  <span className="text-[10px] bg-[#C5A059]/30 text-[#F5DE9B] px-1.5 py-0.5 rounded flex items-center gap-1 font-medium">
                    <Sparkles className="w-2.5 h-2.5" />
                    AI 推薦
                  </span>
                )}
              </div>
              <h2 className="text-lg font-bold font-serif-heading text-white mt-0.5">
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
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs text-[#374151]">
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

          {/* V1.2 Dual Confirmation Status Card */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <span className="font-bold text-[#1F2937] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#C5A059]" />
                雙店確認與授權審核進度
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

          {/* Reason & Remarks */}
          <div className="bg-[#FAFBFD] rounded-xl p-4 border border-[#E9ECF0] space-y-2">
            <div>
              <span className="font-bold text-[#4B5563]">調撥申請原因：</span>
              <p className="text-[#1F2937] mt-0.5">{caseItem.transferReason}</p>
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

          {/* Courier & Dispatch Section (When both confirmed) */}
          {caseItem.status === 'both_confirmed' && (
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

          {caseItem.status === 'completed' && (
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4 flex items-center space-x-3 text-[#334155]">
              <CheckCircle2 className="w-5 h-5 text-[#16A34A]" />
              <div>
                <div className="font-bold text-[#0F172A]">該筆調撥已全數點收上架完成</div>
                <div className="text-[11px] text-[#64748B]">各門市庫存與總倉資料庫已即時平帳更新。</div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#F9FAFB] border-t border-[#E5E7EB] flex items-center justify-between">
          <button
            onClick={() => onRejectTransfer(caseItem.id)}
            className="text-xs font-semibold text-[#EF4444] hover:underline"
          >
            駁回 / 取消此調撥
          </button>
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
