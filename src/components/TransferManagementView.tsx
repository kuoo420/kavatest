import React, { useState } from 'react';
import { 
  ArrowLeftRight, 
  Search, 
  Filter, 
  Plus, 
  Clock, 
  CheckCircle2, 
  Truck, 
  AlertCircle,
  FileCheck,
  ChevronRight,
  Sparkles,
  Download,
  Building2,
  PackageCheck
} from 'lucide-react';
import { TransferCase, Store, Product, UserRole, ViewScope, TransferStatus } from '../types';
import { PresetPeriod } from './ExportModal';

interface TransferManagementViewProps {
  cases: TransferCase[];
  stores: Store[];
  products: Product[];
  userRole: UserRole;
  viewScope: ViewScope;
  onSelectCase: (caseItem: TransferCase) => void;
  onOpenNewTransferModal: () => void;
  onApproveSource: (caseId: string) => void;
  onApproveTarget: (caseId: string) => void;
  onDispatchCourier: (caseId: string, courierNumber: string) => void;
  onCompleteTransfer: (caseId: string) => void;
  onOpenExportModal?: (preset?: PresetPeriod, selectedReports?: string[], contextTitle?: string) => void;
}

export const TransferManagementView: React.FC<TransferManagementViewProps> = ({
  cases,
  stores,
  products,
  userRole,
  viewScope,
  onSelectCase,
  onOpenNewTransferModal,
  onApproveSource,
  onApproveTarget,
  onDispatchCourier,
  onCompleteTransfer,
  onOpenExportModal,
}) => {
  const [activeStatusFilter, setActiveStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const getStoreName = (id: string) => stores.find((s) => s.id === id)?.name || id;

  // Filter cases based on Scope, Status Tab, and Search Query
  const filteredCases = cases.filter((c) => {
    // 1. View Scope filter
    if (viewScope !== 'all' && c.sourceStoreId !== viewScope && c.targetStoreId !== viewScope) {
      return false;
    }

    // 2. Status Tab filter
    if (activeStatusFilter === 'ai_pending' && c.status !== 'ai_pending') return false;
    if (activeStatusFilter === 'in_progress' && c.status !== 'waiting_source' && c.status !== 'waiting_target') return false;
    if (activeStatusFilter === 'both_confirmed' && c.status !== 'both_confirmed') return false;
    if (activeStatusFilter === 'in_transit' && c.status !== 'in_transit') return false;
    if (activeStatusFilter === 'completed' && c.status !== 'completed') return false;

    // 3. Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = c.productName.toLowerCase().includes(q);
      const matchSku = c.productSku.toLowerCase().includes(q);
      const matchCase = c.caseNumber.toLowerCase().includes(q);
      const matchSrc = getStoreName(c.sourceStoreId).toLowerCase().includes(q);
      const matchTgt = getStoreName(c.targetStoreId).toLowerCase().includes(q);
      if (!matchName && !matchSku && !matchCase && !matchSrc && !matchTgt) return false;
    }

    return true;
  });

  const getStatusBadge = (status: TransferStatus) => {
    switch (status) {
      case 'ai_pending':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-[#FAF3E0] text-[#8C6A21] border border-[#EEDB9F]">AI 建議待採用</span>;
      case 'waiting_source':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-[#F4EFE6] text-[#7A5E2E] border border-[#E6DBCA]">待調出店核准</span>;
      case 'waiting_target':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-[#FFF7ED] text-[#C2410C] border border-[#FFEDD5]">待調入店核准</span>;
      case 'both_confirmed':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-[#EAF6F0] text-[#1E7E50] border border-[#C2E7D4]">雙方已確認(待發貨)</span>;
      case 'in_transit':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-[#EBF3FB] text-[#2C6CA4] border border-[#C5DCF4]">物流運送中</span>;
      case 'completed':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0]">已完成入庫</span>;
      case 'rejected':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]">已駁回</span>;
      default:
        return null;
    }
  };

  return (
    <div className="p-3.5 sm:p-6 md:p-8 max-w-[1440px] mx-auto space-y-4 sm:space-y-6 animate-in fade-in-50 duration-200">
      {/* Top Header & Search Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#1C232E] tracking-tight font-serif-heading">
            調貨申請與跨店工單管制作業
          </h1>
          <p className="text-xs text-[#64748B] mt-1">
            全面落實「調出調入雙方門市雙重確認」與「即時扣鎖可用庫存」機制。
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          {onOpenExportModal && (
            <button
              onClick={() => onOpenExportModal('monthly', ['transfer_cases', 'transfer_flow'], '跨店調撥工單明細台帳')}
              className="flex items-center space-x-1.5 bg-white hover:bg-[#FAF6EE] text-[#8C6D3B] border border-[#DED6CF] hover:border-[#C5A059] px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-lg text-xs font-bold transition-all shadow-xs active:scale-95 shrink-0"
              title="下載調撥工單官方明細台帳 (CSV)"
            >
              <Download className="w-3.5 h-3.5" />
              <span>下載台帳</span>
            </button>
          )}

          <button
            onClick={onOpenNewTransferModal}
            className="flex items-center space-x-2 bg-[#8C6D3B] hover:bg-[#785D31] text-white px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs font-semibold transition-all shadow-sm active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>發起調撥</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white rounded-xl border border-[#E8EAEE] p-3 sm:p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Status Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-thin">
          {[
            { id: 'all', label: '全部案件' },
            { id: 'ai_pending', label: 'AI 建議待採用' },
            { id: 'in_progress', label: '確認中 (雙方回合)' },
            { id: 'both_confirmed', label: '雙方已確認' },
            { id: 'in_transit', label: '物流運送中' },
            { id: 'completed', label: '已完成' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveStatusFilter(tab.id)}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 whitespace-nowrap ${
                activeStatusFilter === tab.id
                  ? 'bg-[#1C2024] text-white'
                  : 'bg-[#F4F6F8] text-[#4B5563] hover:bg-[#EAEFF5]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72 shrink-0">
          <Search className="w-3.5 h-3.5 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="搜尋商品、SKU、工單號、門市..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#1F2937] placeholder-[#9CA3AF] focus:outline-none focus:ring-1 focus:ring-[#C5A059] focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Mobile Card List (Visible on sm & down) */}
      <div className="md:hidden space-y-3">
        {filteredCases.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#E8EAEE] p-8 text-center text-xs text-[#94A3B8]">
            未找到符合條件的調撥工單
          </div>
        ) : (
          filteredCases.map((c) => {
            const src = getStoreName(c.sourceStoreId);
            const tgt = getStoreName(c.targetStoreId);
            const pending = c.pendingStoreId ? getStoreName(c.pendingStoreId) : '-';

            return (
              <div
                key={c.id}
                onClick={() => onSelectCase(c)}
                className="bg-white rounded-xl border border-[#E8EAEE] p-4 shadow-xs space-y-3 cursor-pointer active:bg-[#F9FAFB]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    {c.isAiGenerated && (
                      <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" title="AI 演算法生成" />
                    )}
                    <span className="font-mono font-bold text-xs text-[#475569]">{c.caseNumber}</span>
                  </div>
                  <div>{getStatusBadge(c.status)}</div>
                </div>

                <div>
                  <div className="font-bold text-sm text-[#1E293B]">{c.productName}</div>
                  <div className="text-[11px] text-[#94A3B8] font-mono">{c.productSku}</div>
                </div>

                <div className="flex items-center justify-between text-xs bg-[#F8FAFC] p-2.5 rounded-lg border border-[#EEF2F6]">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[#64748B]">路徑:</span>
                    <span className="font-medium text-[#1E293B]">{src}</span>
                    <span className="text-[#94A3B8]">→</span>
                    <span className="font-bold text-[#1E293B]">{tgt}</span>
                  </div>
                  <div className="font-bold text-[#1E293B]">{c.quantity} 件</div>
                </div>

                <div className="flex items-center justify-between pt-1 text-xs">
                  <span className="text-[#64748B] text-[11px]">
                    待辦: <strong className="text-[#1E293B]">{pending}</strong>
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectCase(c);
                    }}
                    className="px-3 py-1 text-xs font-semibold text-[#8C6D3B] bg-[#FAF3E0] rounded-md border border-[#EEDB9F]"
                  >
                    審核明細 →
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Desktop Cases Table (Hidden on small screens) */}
      <div className="hidden md:block bg-white rounded-xl border border-[#E8EAEE] shadow-[0_2px_8px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] border-b border-[#E8EAEE] text-[#64748B] font-semibold">
              <tr>
                <th className="py-3 px-4">工單編號</th>
                <th className="py-3 px-4">商品資訊</th>
                <th className="py-3 px-4">調撥路徑</th>
                <th className="py-3 px-4">數量</th>
                <th className="py-3 px-4">目前狀態</th>
                <th className="py-3 px-4">待辦門市</th>
                <th className="py-3 px-4 text-right">操作管理</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F3F6]">
              {filteredCases.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#94A3B8]">
                    未找到符合條件的調撥工單
                  </td>
                </tr>
              ) : (
                filteredCases.map((c) => {
                  const src = getStoreName(c.sourceStoreId);
                  const tgt = getStoreName(c.targetStoreId);
                  const pending = c.pendingStoreId ? getStoreName(c.pendingStoreId) : '-';

                  return (
                    <tr
                      key={c.id}
                      className="hover:bg-[#FAFBFD] transition-colors cursor-pointer group"
                      onClick={() => onSelectCase(c)}
                    >
                      {/* Case Number */}
                      <td className="py-3.5 px-4 font-mono font-bold text-[#475569]">
                        <div className="flex items-center space-x-1.5">
                          {c.isAiGenerated && (
                            <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" title="AI 演算法生成" />
                          )}
                          <span>{c.caseNumber}</span>
                        </div>
                      </td>

                      {/* Product Info */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#1E293B] group-hover:text-[#967746] transition-colors">
                          {c.productName}
                        </div>
                        <div className="text-[11px] text-[#94A3B8]">{c.productSku}</div>
                      </td>

                      {/* Transfer Route */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-2 text-[#334155]">
                          <span>{src}</span>
                          <span className="text-[#94A3B8]">→</span>
                          <span className="font-semibold">{tgt}</span>
                        </div>
                      </td>

                      {/* Quantity */}
                      <td className="py-3.5 px-4 font-bold text-[#1E293B]">
                        {c.quantity} 件
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {getStatusBadge(c.status)}
                      </td>

                      {/* Pending Store */}
                      <td className="py-3.5 px-4 font-medium text-[#475569]">
                        {pending}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => onSelectCase(c)}
                            className="px-3 py-1 text-xs font-semibold text-[#8C6D3B] hover:bg-[#FDF8EE] rounded-md border border-[#EEDB9F] transition-colors"
                          >
                            審核明細
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
