import React, { useState } from 'react';
import { 
  X, 
  ArrowRight, 
  PlusCircle, 
  Package, 
  Building2, 
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { Store, Product, StoreInventory, TransferCase } from '../types';

interface NewTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  stores: Store[];
  products: Product[];
  inventory: StoreInventory[];
  prefilledProduct?: Product | null;
  prefilledTargetStoreId?: string;
  onCreateTransfer: (newCase: Omit<TransferCase, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

export const NewTransferModal: React.FC<NewTransferModalProps> = ({
  isOpen,
  onClose,
  stores,
  products,
  inventory,
  prefilledProduct,
  prefilledTargetStoreId,
  onCreateTransfer,
}) => {
  const [selectedProductId, setSelectedProductId] = useState<string>(
    prefilledProduct?.id || products[0]?.id || ''
  );
  const [sourceStoreId, setSourceStoreId] = useState<string>('S04');
  const [targetStoreId, setTargetStoreId] = useState<string>(
    prefilledTargetStoreId || 'S01'
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [reason, setReason] = useState<string>('門市VIP客戶急件預約調撥');
  const [remarks, setRemarks] = useState<string>('');

  if (!isOpen) return null;

  const currentProduct = products.find((p) => p.id === selectedProductId) || products[0];

  const getStoreStock = (storeId: string) => {
    const inv = inventory.find(
      (i) => i.storeId === storeId && i.productId === selectedProductId
    );
    return inv?.availableStock ?? 0;
  };

  const sourceAvailableStock = getStoreStock(sourceStoreId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (sourceStoreId === targetStoreId) {
      alert('調出門市與調入門市不可相同！');
      return;
    }
    if (quantity <= 0) {
      alert('調撥數量必須大於 0');
      return;
    }
    if (quantity > sourceAvailableStock) {
      if (!confirm(`調出門市目前可用庫存僅 ${sourceAvailableStock} 件，確定仍要提出超額調撥申請？`)) {
        return;
      }
    }

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const caseNumber = `TR-0831-${randomSuffix}`;

    onCreateTransfer({
      caseNumber,
      productId: currentProduct.id,
      productName: currentProduct.name,
      productSku: currentProduct.sku,
      quantity,
      sourceStoreId,
      targetStoreId,
      status: 'waiting_source',
      pendingStoreId: sourceStoreId,
      isAiGenerated: false,
      transferReason: reason,
      sourceConfirmed: false,
      targetConfirmed: true, // Initiating store confirmed
      targetConfirmedAt: new Date().toLocaleString('zh-TW'),
      remarks: remarks || `手動由門市發起，等待調出店審核。`,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-[#E5E7EB] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 bg-[#181C20] text-white flex items-center justify-between border-b border-[#2B323A]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#C5A059]/20 border border-[#C5A059]/40 flex items-center justify-center">
              <PlusCircle className="w-4 h-4 text-[#E8C683]" />
            </div>
            <h2 className="text-base font-bold font-serif-heading text-white">
              發起跨店調撥申請
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Select Product */}
          <div>
            <label className="font-bold text-[#374151] block mb-1">
              調撥商品
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full bg-[#F9FAFB] border border-[#D1D5DB] rounded-lg px-3 py-2 text-xs font-semibold text-[#1F2937] focus:ring-1 focus:ring-[#C5A059] focus:outline-none"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku}) - NT$ {p.price.toLocaleString()}
                </option>
              ))}
            </select>
          </div>

          {/* Store Selection (Source & Target) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-[#374151] block mb-1">
                調出店家 (供方)
              </label>
              <select
                value={sourceStoreId}
                onChange={(e) => setSourceStoreId(e.target.value)}
                className="w-full bg-[#F9FAFB] border border-[#D1D5DB] rounded-lg px-3 py-2 text-xs font-medium text-[#1F2937] focus:ring-1 focus:ring-[#C5A059] focus:outline-none"
              >
                {stores.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} (庫存: {getStoreStock(s.id)})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-[#374151] block mb-1">
                調入店家 (需方)
              </label>
              <select
                value={targetStoreId}
                onChange={(e) => setTargetStoreId(e.target.value)}
                className="w-full bg-[#F9FAFB] border border-[#D1D5DB] rounded-lg px-3 py-2 text-xs font-medium text-[#1F2937] focus:ring-1 focus:ring-[#C5A059] focus:outline-none"
              >
                {stores.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} (庫存: {getStoreStock(s.id)})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quantity */}
          <div>
            <label className="font-bold text-[#374151] block mb-1">
              調撥件數
            </label>
            <input
              type="number"
              min="1"
              max="50"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              className="w-full bg-[#F9FAFB] border border-[#D1D5DB] rounded-lg px-3 py-2 text-xs font-semibold text-[#1F2937] focus:ring-1 focus:ring-[#C5A059] focus:outline-none"
            />
          </div>

          {/* Reason */}
          <div>
            <label className="font-bold text-[#374151] block mb-1">
              調撥事由 / 客戶專案
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="例如：VIP客戶訂購、週末檔期補貨、展示樣品調配"
              className="w-full bg-[#F9FAFB] border border-[#D1D5DB] rounded-lg px-3 py-2 text-xs text-[#1F2937] focus:ring-1 focus:ring-[#C5A059] focus:outline-none"
              required
            />
          </div>

          {/* Remarks */}
          <div>
            <label className="font-bold text-[#374151] block mb-1">
              備註說明 (選填)
            </label>
            <textarea
              rows={2}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="特別包裝需求、預計指定到貨時段等..."
              className="w-full bg-[#F9FAFB] border border-[#D1D5DB] rounded-lg px-3 py-2 text-xs text-[#1F2937] focus:ring-1 focus:ring-[#C5A059] focus:outline-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-[#E5E7EB] flex items-center justify-end space-x-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-[#4B5563] hover:bg-[#F3F4F6] transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg text-xs font-semibold bg-[#8C6D3B] hover:bg-[#785D31] text-white shadow-sm transition-all active:scale-95"
            >
              送出調撥並通知調出店
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
