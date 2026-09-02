import React, { useState } from 'react';
import { 
  PlusCircle, 
  ArrowRight, 
  Building2, 
  Package, 
  FileText, 
  AlertCircle, 
  CheckCircle2, 
  Boxes,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { Store, Product, StoreInventory, UserRole } from '../types';

interface ManualTransferViewProps {
  stores: Store[];
  products: Product[];
  inventory: StoreInventory[];
  userRole: UserRole;
  onCreateTransfer: (transferData: {
    productId: string;
    productName: string;
    productSku: string;
    sourceStoreId: string;
    targetStoreId: string;
    quantity: number;
    transferReason: string;
    remarks?: string;
  }) => void;
  onNavigateTab: (tab: any) => void;
}

export const ManualTransferView: React.FC<ManualTransferViewProps> = ({
  stores,
  products,
  inventory,
  userRole,
  onCreateTransfer,
  onNavigateTab,
}) => {
  const defaultSource = userRole !== 'admin' ? userRole : stores[0]?.id || 'S01';
  const defaultTarget = stores.find(s => s.id !== defaultSource)?.id || 'S02';

  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || 'P01');
  const [sourceStoreId, setSourceStoreId] = useState<string>(defaultSource);
  const [targetStoreId, setTargetStoreId] = useState<string>(defaultTarget);
  const [quantity, setQuantity] = useState<number>(1);
  const [transferReason, setTransferReason] = useState<string>('門市缺貨預警支援');
  const [customReason, setCustomReason] = useState<string>('');
  const [remarks, setRemarks] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<boolean>(false);

  const selectedProduct = products.find(p => p.id === selectedProductId) || products[0];

  // Get current inventory at source store
  const sourceStockItem = inventory.find(
    i => i.productId === selectedProductId && i.storeId === sourceStoreId
  );
  const availableAtSource = sourceStockItem?.availableStock || 0;

  // Get current inventory at target store
  const targetStockItem = inventory.find(
    i => i.productId === selectedProductId && i.storeId === targetStoreId
  );
  const availableAtTarget = targetStockItem?.availableStock || 0;

  const isSourceValid = sourceStoreId !== targetStoreId;
  const isStockSufficient = availableAtSource >= quantity && quantity > 0;
  const canSubmit = isSourceValid && isStockSufficient;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    const finalReason = transferReason === '其他原因' ? (customReason || '人工指定調撥') : transferReason;

    onCreateTransfer({
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      productSku: selectedProduct.sku,
      sourceStoreId,
      targetStoreId,
      quantity,
      transferReason: finalReason,
      remarks,
    });

    setSuccessMsg(true);
    setTimeout(() => {
      setSuccessMsg(false);
      onNavigateTab('transfers');
    }, 1200);
  };

  return (
    <div className="p-3.5 sm:p-6 md:p-8 max-w-4xl mx-auto space-y-4 sm:space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <div className="text-xs font-semibold text-[#8C6D3B] uppercase tracking-wider mb-1">
          人工發起 ｜ 雙店核准流程
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#1C232E] tracking-tight font-serif-heading">
          建立跨店調貨申請
        </h1>
        <p className="text-xs lg:text-sm text-[#64748B] mt-1 leading-relaxed">
          手動調撥仍遵循 V1.2 雙店確認機制：送出後由調出店清點現貨鎖定，調入店覆核接收。
        </p>
      </div>

      {successMsg && (
        <div className="p-4 bg-[#EAF6F0] border border-[#BDE3CF] rounded-xl text-xs text-[#1E7E50] font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-[#2A9D6A]" />
          <span>調貨工單建立成功！即將前往「調貨申請」列表...</span>
        </div>
      )}

      {/* Main Form Container */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-[#E8EAEE] p-4 sm:p-6 md:p-8 shadow-xs space-y-5 sm:space-y-6">
        {/* Product Selection */}
        <div>
          <label className="block text-xs font-bold text-[#1F2633] mb-2 flex items-center gap-1.5">
            <Package className="w-4 h-4 text-[#8C6D3B]" />
            <span>選擇調撥商品</span>
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full bg-[#FBFBFC] border border-[#D5DAE1] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#1F2633] focus:outline-none focus:border-[#8C6D3B]"
            >
              {products.map((prod) => (
                <option key={prod.id} value={prod.id}>
                  [{prod.sku}] {prod.name} - NT$ {prod.price.toLocaleString()} ({prod.category})
                </option>
              ))}
            </select>

            {/* Product Summary Card */}
            <div className="bg-[#F8F6F2] rounded-xl p-3 border border-[#EBE3D7] flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-[#211F1D] text-[#E8C683] flex items-center justify-center font-bold text-xs shrink-0">
                SKU
              </div>
              <div className="text-xs">
                <div className="font-bold text-[#24211F]">{selectedProduct.name}</div>
                <div className="text-[#7C756F]">分類：{selectedProduct.category} ｜ 單價：NT$ {selectedProduct.price.toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Store Route (From -> To) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-[#F1F3F6]">
          {/* Source Store */}
          <div>
            <label className="block text-xs font-bold text-[#1F2633] mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-[#8C6D3B]" />
                調出門市 (來源)
              </span>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                availableAtSource > 0 ? 'bg-[#EAF6F0] text-[#1E7E50]' : 'bg-[#FBEBEB] text-[#D9534F]'
              }`}>
                在架可用：{availableAtSource} 件
              </span>
            </label>
            <select
              value={sourceStoreId}
              onChange={(e) => setSourceStoreId(e.target.value)}
              className="w-full bg-[#FBFBFC] border border-[#D5DAE1] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#1F2633] focus:outline-none focus:border-[#8C6D3B]"
            >
              {stores.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.code}) - 店長：{s.manager}
                </option>
              ))}
            </select>
          </div>

          {/* Target Store */}
          <div>
            <label className="block text-xs font-bold text-[#1F2633] mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-[#718B75]" />
                調入門市 (目的地)
              </span>
              <span className="text-[11px] text-[#7C756F]">
                現有存量：{availableAtTarget} 件
              </span>
            </label>
            <select
              value={targetStoreId}
              onChange={(e) => setTargetStoreId(e.target.value)}
              className="w-full bg-[#FBFBFC] border border-[#D5DAE1] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#1F2633] focus:outline-none focus:border-[#8C6D3B]"
            >
              {stores.map((s) => (
                <option key={s.id} value={s.id} disabled={s.id === sourceStoreId}>
                  {s.name} ({s.code}) {s.id === sourceStoreId ? '(不可與來源相同)' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quantity & Reason */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-[#F1F3F6]">
          {/* Quantity */}
          <div>
            <label className="block text-xs font-bold text-[#1F2633] mb-2">
              調撥件數
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="number"
                min="1"
                max={Math.max(1, availableAtSource)}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-32 bg-[#FBFBFC] border border-[#D5DAE1] rounded-xl px-3.5 py-2 text-sm font-bold text-[#1F2633] focus:outline-none focus:border-[#8C6D3B]"
              />
              <span className="text-xs text-[#7C756F]">
                件 (調出店最大可調：{availableAtSource} 件)
              </span>
            </div>
            {!isStockSufficient && (
              <p className="text-[11px] text-[#D9534F] mt-1.5 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                調出門市現有在架庫存不足，無法調撥指定數量。
              </p>
            )}
          </div>

          {/* Reason */}
          <div>
            <label className="block text-xs font-bold text-[#1F2633] mb-2">
              調貨原因分類
            </label>
            <select
              value={transferReason}
              onChange={(e) => setTransferReason(e.target.value)}
              className="w-full bg-[#FBFBFC] border border-[#D5DAE1] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#1F2633] focus:outline-none focus:border-[#8C6D3B]"
            >
              <option value="門市缺貨預警支援">門市缺貨預警支援</option>
              <option value="顧客專案VIP預訂">顧客專案VIP預訂</option>
              <option value="熱銷品快速補貨">熱銷品快速補貨</option>
              <option value="高庫存門市支援流轉">高庫存門市支援流轉</option>
              <option value="假日活動展銷配給">假日活動展銷配給</option>
              <option value="其他原因">其他原因 (自訂輸入)</option>
            </select>
          </div>
        </div>

        {transferReason === '其他原因' && (
          <div>
            <label className="block text-xs font-bold text-[#1F2633] mb-1.5">
              請輸入自訂調貨原因
            </label>
            <input
              type="text"
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              placeholder="例如：特定專案拍攝展示需求..."
              className="w-full bg-[#FBFBFC] border border-[#D5DAE1] rounded-xl px-3.5 py-2 text-xs text-[#1F2633] focus:outline-none focus:border-[#8C6D3B]"
            />
          </div>
        )}

        {/* Remarks */}
        <div>
          <label className="block text-xs font-bold text-[#1F2633] mb-1.5">
            備註說明 (選填)
          </label>
          <textarea
            rows={2}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="若有特殊物流指示或顧客預約時間可在此註明..."
            className="w-full bg-[#FBFBFC] border border-[#D5DAE1] rounded-xl px-3.5 py-2 text-xs text-[#1F2633] focus:outline-none focus:border-[#8C6D3B]"
          />
        </div>

        {/* Submit & Cancel Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-[#F1F3F6]">
          <button
            type="button"
            onClick={() => onNavigateTab('dashboard')}
            className="px-5 py-2.5 rounded-xl border border-[#D5DAE1] text-xs font-semibold text-[#555E68] hover:bg-[#F9FAFB] transition-colors"
          >
            取消返回
          </button>
          <button
            type="submit"
            disabled={!canSubmit}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center space-x-2 ${
              canSubmit
                ? 'bg-[#8C6D3B] hover:bg-[#785D31] text-white active:scale-98'
                : 'bg-[#D1D5DB] text-[#9CA3AF] cursor-not-allowed'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>正式送出調貨申請</span>
          </button>
        </div>
      </form>
    </div>
  );
};
