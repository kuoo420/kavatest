import React, { useState } from 'react';
import { 
  Box, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowLeftRight,
  TrendingDown,
  Layers,
  Filter,
  BarChart3,
  Sparkles,
  Download
} from 'lucide-react';
import { StoreInventory, Product, Store, UserRole, ViewScope } from '../types';
import { PresetPeriod } from './ExportModal';

interface InventoryViewProps {
  inventory: StoreInventory[];
  products: Product[];
  stores: Store[];
  userRole: UserRole;
  viewScope: ViewScope;
  onRequestTransferForProduct: (product: Product, targetStoreId: string) => void;
  onOpenExportModal?: (preset?: PresetPeriod, selectedReports?: string[], contextTitle?: string) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  inventory,
  products,
  stores,
  userRole,
  viewScope,
  onRequestTransferForProduct,
  onOpenExportModal,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['all', ...Array.from(new Set(products.map((p) => p.category)))];

  const filteredProducts = products.filter((p) => {
    if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
    }
    return true;
  });

  const getInventoryRecord = (storeId: string, productId: string) => {
    return inventory.find((inv) => inv.storeId === storeId && inv.productId === productId);
  };

  return (
    <div className="p-8 max-w-[1440px] mx-auto space-y-6 animate-in fade-in-50 duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1C232E] tracking-tight font-serif-heading">
            全通路庫存分佈與承諾鎖定分析矩陣
          </h1>
          <p className="text-xs text-[#64748B] mt-1">
            即時監控各門市在架現品、VIP客訂承諾、在途運送與安全庫存水位。
          </p>
        </div>

        {onOpenExportModal && (
          <button
            onClick={() => onOpenExportModal('monthly', ['inventory_matrix', 'inventory_risk'], '門市庫存與承諾矩陣')}
            className="flex items-center space-x-1.5 bg-white hover:bg-[#FAF6EE] text-[#8C6D3B] border border-[#DED6CF] hover:border-[#C5A059] px-3.5 py-2.5 rounded-lg text-xs font-bold transition-all shadow-xs active:scale-95 shrink-0"
            title="下載全通路庫存與承諾明細矩陣 (CSV)"
          >
            <Download className="w-3.5 h-3.5" />
            <span>下載庫存矩陣</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-[#E8EAEE] p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                selectedCategory === cat
                  ? 'bg-[#1C2024] text-white'
                  : 'bg-[#F4F6F8] text-[#4B5563] hover:bg-[#EAEFF5]'
              }`}
            >
              {cat === 'all' ? '全部商品品類' : cat}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64">
          <Search className="w-3.5 h-3.5 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="搜尋商品名稱、SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#1F2937] placeholder-[#9CA3AF] focus:outline-none focus:ring-1 focus:ring-[#C5A059] focus:bg-white"
          />
        </div>
      </div>

      {/* Inventory Matrix Table */}
      <div className="bg-white rounded-xl border border-[#E8EAEE] shadow-[0_2px_8px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E8EAEE] text-[#64748B] font-semibold">
                <th className="py-3 px-4 w-64">商品品名 / SKU</th>
                <th className="py-3 px-3">單價</th>
                {stores.map((s) => (
                  <th key={s.id} className="py-3 px-3 text-center border-l border-[#F1F3F6]">
                    <div>{s.name}</div>
                    <span className="text-[10px] text-[#94A3B8] font-mono">{s.code}</span>
                  </th>
                ))}
                <th className="py-3 px-4 text-center border-l border-[#E8EAEE] bg-[#FAFBFD] font-bold text-[#1E293B]">
                  全通路總在架
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F3F6]">
              {filteredProducts.map((p) => {
                const totalAvail = stores.reduce((sum, s) => {
                  const inv = getInventoryRecord(s.id, p.id);
                  return sum + (inv?.availableStock || 0);
                }, 0);

                return (
                  <tr key={p.id} className="hover:bg-[#FAFBFD] transition-colors">
                    {/* Product Name & SKU */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[#1E293B] text-sm">{p.name}</div>
                      <div className="text-[11px] text-[#94A3B8] font-mono">{p.sku}</div>
                    </td>

                    {/* Price */}
                    <td className="py-3.5 px-3 font-medium text-[#475569]">
                      NT$ {p.price.toLocaleString()}
                    </td>

                    {/* Per Store Stock Cell */}
                    {stores.map((s) => {
                      const inv = getInventoryRecord(s.id, p.id);
                      const available = inv?.availableStock ?? 0;
                      const committed = inv?.committedStock ?? 0;
                      const incoming = inv?.incomingStock ?? 0;
                      const safety = inv?.safetyStock ?? 2;
                      const isOutOfStock = available <= 0;
                      const isLowStock = available > 0 && available < safety;

                      return (
                        <td
                          key={s.id}
                          className="py-3.5 px-3 text-center border-l border-[#F1F3F6]"
                        >
                          <div className="flex flex-col items-center justify-center">
                            {/* Stock Badge */}
                            <span
                              className={`text-sm font-bold px-2 py-0.5 rounded-md min-w-[28px] ${
                                isOutOfStock
                                  ? 'bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]'
                                  : isLowStock
                                  ? 'bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]'
                                  : 'bg-[#F0FDF4] text-[#16A34A]'
                              }`}
                            >
                              {available}
                            </span>

                            {/* Sub details: Committed & Incoming */}
                            <div className="text-[10px] text-[#94A3B8] mt-1 space-x-1">
                              {committed > 0 && (
                                <span title="承諾/客訂" className="text-[#D97706] font-medium">
                                  鎖定:{committed}
                                </span>
                              )}
                              {incoming > 0 && (
                                <span title="調撥在途" className="text-[#2563EB] font-medium">
                                  在途:{incoming}
                                </span>
                              )}
                            </div>

                            {/* Quick Transfer Button when Out of Stock */}
                            {isOutOfStock && (
                              <button
                                onClick={() => onRequestTransferForProduct(p, s.id)}
                                className="mt-1.5 text-[10px] text-[#8C6D3B] hover:underline font-semibold flex items-center gap-0.5"
                              >
                                <ArrowLeftRight className="w-2.5 h-2.5" />
                                <span>申請調入</span>
                              </button>
                            )}
                          </div>
                        </td>
                      );
                    })}

                    {/* Total Stock */}
                    <td className="py-3.5 px-4 text-center border-l border-[#E8EAEE] bg-[#FAFBFD] font-bold text-sm text-[#1E293B]">
                      {totalAvail} 件
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
