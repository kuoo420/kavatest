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
  PackageCheck,
  Gift,
  Camera,
  Store as StoreIcon
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
  const [activeCategoryTab, setActiveCategoryTab] = useState<'all' | 'transfer' | 'gwp' | 'vm'>('all');
  const [activeStatusFilter, setActiveStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const getStoreName = (id: string) => stores.find((s) => s.id === id)?.name || id;

  // Filter cases based on Scope, Category Tab (Transfer vs GWP vs VM), Status Tab, and Search Query
  const filteredCases = cases.filter((c) => {
    // 1. View Scope filter
    if (viewScope !== 'all' && c.sourceStoreId !== viewScope && c.targetStoreId !== viewScope) {
      return false;
    }

    // 2. Category Tab Filter (分流：跨店調撥 vs 滿額贈轉化 vs 原店陳列)
    const isGWP = c.prescriptionAction === 'gwp_gift' || c.prescriptionStatus === 'gwp_applied';
    const isVM = c.prescriptionStatus === 'vm_observing';
    const isTransfer = !isGWP && !isVM;

    if (activeCategoryTab === 'transfer' && !isTransfer) return false;
    if (activeCategoryTab === 'gwp' && !isGWP) return false;
    if (activeCategoryTab === 'vm' && !isVM) return false;

    // 3. Status Tab filter
    if (activeStatusFilter === 'ai_pending' && c.status !== 'ai_pending') return false;
    if (activeStatusFilter === 'in_progress' && c.status !== 'waiting_source' && c.status !== 'waiting_target') return false;
    if (activeStatusFilter === 'both_confirmed' && c.status !== 'both_confirmed') return false;
    if (activeStatusFilter === 'in_transit' && c.status !== 'in_transit') return false;
    if (activeStatusFilter === 'completed' && c.status !== 'completed') return false;

    // 4. Search query
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

  const getStatusBadge = (c: TransferCase) => {
    const isGWP = c.prescriptionAction === 'gwp_gift' || c.prescriptionStatus === 'gwp_applied';
    const isVM = c.prescriptionStatus === 'vm_observing';

    if (isGWP) {
      if (c.status === 'completed') {
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC] flex items-center gap-1">
            <Gift className="w-3 h-3 text-[#16A34A]" />
            <span>滿額禮轉列已核准</span>
          </span>
        );
      }
      return (
        <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0] flex items-center gap-1">
          <Gift className="w-3 h-3 text-[#059669]" />
          <span>滿額禮申請待覆核</span>
        </span>
      );
    }

    if (isVM) {
      return (
        <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] flex items-center gap-1">
          <Camera className="w-3 h-3 text-[#2563EB]" />
          <span>陳列觀察期 (剩{c.observationDaysRemaining || 7}天)</span>
        </span>
      );
    }

    switch (c.status) {
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

  // Category counts
  const gwpCount = cases.filter(c => c.prescriptionAction === 'gwp_gift' || c.prescriptionStatus === 'gwp_applied').length;
  const vmCount = cases.filter(c => c.prescriptionStatus === 'vm_observing').length;
  const transferCount = cases.length - gwpCount - vmCount;

  return (
    <div className="p-3.5 sm:p-6 md:p-8 max-w-[1440px] mx-auto space-y-4 sm:space-y-6 animate-in fade-in-50 duration-200">
      {/* Top Header & Search Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#1C232E] tracking-tight font-serif-heading">
            調貨工單與門市處方管制作業
          </h1>
          <p className="text-xs text-[#64748B] mt-1">
            清晰分流「跨店實體調撥」與「專櫃 VIP 滿額禮／原店陳列處方」，避免流程混淆。
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          {onOpenExportModal && (
            <button
              onClick={() => onOpenExportModal('monthly', ['transfer_cases', 'transfer_flow'], '調撥與處方工單明細台帳')}
              className="flex items-center space-x-1.5 bg-white hover:bg-[#FAF6EE] text-[#8C6D3B] border border-[#DED6CF] hover:border-[#C5A059] px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-lg text-xs font-bold transition-all shadow-xs active:scale-95 shrink-0"
              title="下載工單官方明細台帳 (CSV)"
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

      {/* Top Category Division (跨店調貨 vs 滿額贈申請 vs 原店陳列) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        <button
          type="button"
          onClick={() => setActiveCategoryTab('all')}
          className={`p-3 rounded-xl border text-left transition-all ${
            activeCategoryTab === 'all'
              ? 'bg-[#1C2024] text-white border-[#1C2024] shadow-sm'
              : 'bg-white text-[#4B5563] border-[#E8EAEE] hover:border-[#CBD5E1]'
          }`}
        >
          <div className="text-[11px] opacity-80">全部工單與處方</div>
          <div className="text-base sm:text-lg font-bold mt-0.5 font-mono">{cases.length} 件</div>
        </button>

        <button
          type="button"
          onClick={() => setActiveCategoryTab('transfer')}
          className={`p-3 rounded-xl border text-left transition-all ${
            activeCategoryTab === 'transfer'
              ? 'bg-[#8C6D3B] text-white border-[#8C6D3B] shadow-sm'
              : 'bg-white text-[#4B5563] border-[#E8EAEE] hover:border-[#EADBBD]'
          }`}
        >
          <div className="text-[11px] flex items-center justify-between">
            <span>🚚 跨店實體調貨</span>
            {transferCount > 0 && <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded font-bold">調店</span>}
          </div>
          <div className="text-base sm:text-lg font-bold mt-0.5 font-mono">{transferCount} 件</div>
        </button>

        <button
          type="button"
          onClick={() => setActiveCategoryTab('gwp')}
          className={`p-3 rounded-xl border text-left transition-all ${
            activeCategoryTab === 'gwp'
              ? 'bg-[#059669] text-white border-[#059669] shadow-sm'
              : 'bg-white text-[#4B5563] border-[#E8EAEE] hover:border-[#A7F3D0]'
          }`}
        >
          <div className="text-[11px] flex items-center justify-between">
            <span className="font-bold flex items-center gap-1">
              <Gift className="w-3.5 h-3.5" />
              VIP 滿額禮轉化
            </span>
            {gwpCount > 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                activeCategoryTab === 'gwp' ? 'bg-white text-[#059669]' : 'bg-[#DCFCE7] text-[#15803D]'
              }`}>
                {gwpCount} 待審
              </span>
            )}
          </div>
          <div className="text-base sm:text-lg font-bold mt-0.5 font-mono">{gwpCount} 件</div>
        </button>

        <button
          type="button"
          onClick={() => setActiveCategoryTab('vm')}
          className={`p-3 rounded-xl border text-left transition-all ${
            activeCategoryTab === 'vm'
              ? 'bg-[#2563EB] text-white border-[#2563EB] shadow-sm'
              : 'bg-white text-[#4B5563] border-[#E8EAEE] hover:border-[#BFDBFE]'
          }`}
        >
          <div className="text-[11px] flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Camera className="w-3.5 h-3.5" />
              原店陳列觀察
            </span>
            {vmCount > 0 && <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded font-bold">7天</span>}
          </div>
          <div className="text-base sm:text-lg font-bold mt-0.5 font-mono">{vmCount} 件</div>
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white rounded-xl border border-[#E8EAEE] p-3 sm:p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Status Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-thin">
          {[
            { id: 'all', label: '全部狀態' },
            { id: 'ai_pending', label: 'AI 建議/待審核' },
            { id: 'in_progress', label: '待門市確認' },
            { id: 'both_confirmed', label: '雙方已確認' },
            { id: 'in_transit', label: '物流運送中' },
            { id: 'completed', label: '已完成/已核准' },
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
            未找到符合條件的工單或處方案件
          </div>
        ) : (
          filteredCases.map((c) => {
            const src = getStoreName(c.sourceStoreId);
            const tgt = getStoreName(c.targetStoreId);
            const isGWP = c.prescriptionAction === 'gwp_gift' || c.prescriptionStatus === 'gwp_applied';
            const isVM = c.prescriptionStatus === 'vm_observing';

            return (
              <div
                key={c.id}
                onClick={() => onSelectCase(c)}
                className={`bg-white rounded-xl border p-4 shadow-xs space-y-3 cursor-pointer active:bg-[#F9FAFB] ${
                  isGWP ? 'border-[#A7F3D0] bg-gradient-to-r from-white to-[#F0FDF4]' : 'border-[#E8EAEE]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    {isGWP ? (
                      <Gift className="w-3.5 h-3.5 text-[#059669]" />
                    ) : isVM ? (
                      <Camera className="w-3.5 h-3.5 text-[#2563EB]" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
                    )}
                    <span className="font-mono font-bold text-xs text-[#475569]">{c.caseNumber}</span>
                  </div>
                  <div>{getStatusBadge(c)}</div>
                </div>

                <div>
                  <div className="font-bold text-sm text-[#1E293B]">{c.productName}</div>
                  <div className="text-[11px] text-[#94A3B8] font-mono">{c.productSku}</div>
                </div>

                {isGWP ? (
                  <div className="flex items-center justify-between text-xs bg-[#ECFDF5] p-2.5 rounded-lg border border-[#BBF7D0]">
                    <div className="flex items-center space-x-1.5 text-[#065F46] font-medium">
                      <span>申請留用門市：</span>
                      <strong className="text-[#047857]">{src}（原店留用轉滿額禮）</strong>
                    </div>
                    <div className="font-bold text-[#065F46]">{c.quantity} 件</div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between text-xs bg-[#F8FAFC] p-2.5 rounded-lg border border-[#EEF2F6]">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-[#64748B]">路徑:</span>
                      <span className="font-medium text-[#1E293B]">{src}</span>
                      <span className="text-[#94A3B8]">→</span>
                      <span className="font-bold text-[#1E293B]">{tgt}</span>
                    </div>
                    <div className="font-bold text-[#1E293B]">{c.quantity} 件</div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-1 text-xs">
                  <span className="text-[#64748B] text-[11px]">
                    {isGWP ? (
                      <span className="text-[#059669] font-semibold">待總公司行銷/商品部覆核</span>
                    ) : (
                      <>待辦: <strong className="text-[#1E293B]">{c.pendingStoreId ? getStoreName(c.pendingStoreId) : '-'}</strong></>
                    )}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectCase(c);
                    }}
                    className={`px-3 py-1 text-xs font-semibold rounded-md border ${
                      isGWP 
                        ? 'text-[#065F46] bg-[#DCFCE7] border-[#86EFAC]' 
                        : 'text-[#8C6D3B] bg-[#FAF3E0] border-[#EEDB9F]'
                    }`}
                  >
                    {isGWP ? '審核滿額禮 →' : '審核明細 →'}
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
                <th className="py-3 px-4">工單/案件編號</th>
                <th className="py-3 px-4">商品資訊</th>
                <th className="py-3 px-4">流轉/留用方式</th>
                <th className="py-3 px-4">數量</th>
                <th className="py-3 px-4">目前狀態</th>
                <th className="py-3 px-4">待辦負責單位</th>
                <th className="py-3 px-4 text-right">操作管理</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F3F6]">
              {filteredCases.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#94A3B8]">
                    未找到符合條件的工單或處方案件
                  </td>
                </tr>
              ) : (
                filteredCases.map((c) => {
                  const src = getStoreName(c.sourceStoreId);
                  const tgt = getStoreName(c.targetStoreId);
                  const isGWP = c.prescriptionAction === 'gwp_gift' || c.prescriptionStatus === 'gwp_applied';
                  const isVM = c.prescriptionStatus === 'vm_observing';
                  const pending = isGWP 
                    ? '總公司商品部' 
                    : c.pendingStoreId ? getStoreName(c.pendingStoreId) : '-';

                  return (
                    <tr
                      key={c.id}
                      className={`hover:bg-[#FAFBFD] transition-colors cursor-pointer group ${
                        isGWP ? 'bg-[#F0FDF4]/30' : ''
                      }`}
                      onClick={() => onSelectCase(c)}
                    >
                      {/* Case Number */}
                      <td className="py-3.5 px-4 font-mono font-bold text-[#475569]">
                        <div className="flex items-center space-x-1.5">
                          {isGWP ? (
                            <Gift className="w-3.5 h-3.5 text-[#059669]" title="VIP滿額贈禮轉化申請" />
                          ) : isVM ? (
                            <Camera className="w-3.5 h-3.5 text-[#2563EB]" title="原店陳列拍照觀察中" />
                          ) : (
                            <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" title="跨店調撥工單" />
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

                      {/* Route / Method */}
                      <td className="py-3.5 px-4">
                        {isGWP ? (
                          <div className="flex items-center space-x-1.5 text-[#065F46]">
                            <span className="font-bold">{src}</span>
                            <span className="text-[10px] bg-[#DCFCE7] text-[#15803D] px-2 py-0.5 rounded font-medium border border-[#86EFAC]">
                              原店留用轉滿額禮 (無調貨)
                            </span>
                          </div>
                        ) : isVM ? (
                          <div className="flex items-center space-x-1.5 text-[#1D4ED8]">
                            <span className="font-bold">{src}</span>
                            <span className="text-[10px] bg-[#EFF6FF] text-[#2563EB] px-2 py-0.5 rounded font-medium border border-[#BFDBFE]">
                              原店陳列調整觀察中
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2 text-[#334155]">
                            <span>{src}</span>
                            <span className="text-[#94A3B8]">→</span>
                            <span className="font-semibold">{tgt}</span>
                          </div>
                        )}
                      </td>

                      {/* Quantity */}
                      <td className="py-3.5 px-4 font-bold text-[#1E293B]">
                        {c.quantity} 件
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {getStatusBadge(c)}
                      </td>

                      {/* Pending Store */}
                      <td className="py-3.5 px-4 font-medium text-[#475569]">
                        {isGWP ? (
                          <span className="text-[#059669] font-bold">總部商品/行銷部</span>
                        ) : (
                          pending
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => onSelectCase(c)}
                            className={`px-3 py-1 text-xs font-semibold rounded-md border transition-colors ${
                              isGWP
                                ? 'text-[#065F46] bg-[#ECFDF5] hover:bg-[#D1FAE5] border-[#A7F3D0]'
                                : 'text-[#8C6D3B] hover:bg-[#FDF8EE] border-[#EEDB9F]'
                            }`}
                          >
                            {isGWP ? '審核滿額禮' : '審核明細'}
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
