import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Truck, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Smartphone, 
  MessageSquare, 
  Printer, 
  ArrowRight, 
  Search, 
  Filter, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  PackageCheck, 
  MapPin, 
  Phone, 
  User, 
  Building2, 
  Volume2, 
  Send, 
  ExternalLink,
  HelpCircle,
  Layers,
  ArrowLeftRight
} from 'lucide-react';
import { ShipFromStoreOrder, Store, Product, UserRole, ViewScope } from '../types';

interface ShipFromStoreViewProps {
  orders: ShipFromStoreOrder[];
  stores: Store[];
  products: Product[];
  userRole: UserRole;
  viewScope: ViewScope;
  onUpdateOrderStatus: (orderId: string, newStatus: ShipFromStoreOrder['status'], trackingNumber?: string) => void;
  onSimulateNewEcommerceOrder: (productId: string, preferredStoreId?: string) => void;
}

export const ShipFromStoreView: React.FC<ShipFromStoreViewProps> = ({
  orders,
  stores,
  products,
  userRole,
  viewScope,
  onUpdateOrderStatus,
  onSimulateNewEcommerceOrder,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSimulateModalOpen, setIsSimulateModalOpen] = useState(false);
  const [simProductId, setSimProductId] = useState<string>(products[0]?.id || 'P01');
  const [simCustomerAddress, setSimCustomerAddress] = useState<string>('台中市西屯區台灣大道三段99號');
  const [activeTab, setActiveTab] = useState<'orders' | 'notification_flow' | 'routing_logic'>('orders');
  const [previewLineOrder, setPreviewLineOrder] = useState<ShipFromStoreOrder | null>(orders[0] || null);

  // Filter orders by role / scope
  const filteredOrders = orders.filter((o) => {
    if (viewScope !== 'all' && o.assignedStoreId !== viewScope) return false;
    if (selectedStatus !== 'all' && o.status !== selectedStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        o.orderNumber.toLowerCase().includes(q) ||
        o.productName.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.shippingAddress.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getStoreName = (storeId: string) => {
    return stores.find((s) => s.id === storeId)?.name || storeId;
  };

  const handleSimulateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSimulateNewEcommerceOrder(simProductId);
    setIsSimulateModalOpen(false);
  };

  const pendingCount = orders.filter((o) => o.status === 'pending_pick').length;
  const pickedCount = orders.filter((o) => o.status === 'picked_packed').length;
  const dispatchedCount = orders.filter((o) => o.status === 'dispatched').length;

  return (
    <div className="p-3.5 sm:p-6 md:p-8 max-w-[1440px] mx-auto space-y-5 animate-in fade-in-50 duration-200">
      {/* Top Banner with OMO Core Value */}
      <div className="bg-gradient-to-r from-[#1C2024] via-[#2A2E35] to-[#1C2024] border border-[#3A4048] rounded-2xl p-5 sm:p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-[#C5A059]/10 via-transparent to-transparent pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex items-center space-x-2">
              <span className="bg-[#C5A059] text-[#16181B] text-[10px] font-extrabold uppercase px-2 py-0.5 rounded tracking-wider">
                OMO 全通路虛擬庫存池
              </span>
              <span className="text-xs text-[#D1D5DB] flex items-center gap-1 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-[#E5C482]" />
                Ship-from-Store 門市代出貨中心
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight font-serif-heading text-[#F3F4F6]">
              全通路電商下單即時尋源與門市代發工作匣
            </h1>
            <p className="text-xs text-[#9CA3AF] leading-relaxed">
              當中央總倉現貨售罄時，AI 演算法自動掃描全台專櫃，依「消呆滯銷優先、地理運費最短、門市產能」秒級指派最佳門市，即時鎖定防超賣，推播 LINE/平板指引門市出庫。
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => setIsSimulateModalOpen(true)}
              className="flex items-center space-x-2 bg-gradient-to-r from-[#C5A059] to-[#A8823E] hover:from-[#D4B06A] hover:to-[#B68F48] text-[#16181B] font-extrabold px-4 py-2.5 rounded-xl text-xs transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-current text-[#16181B]" />
              <span>⚡ 模擬消費者在官網下單</span>
            </button>
          </div>
        </div>

        {/* 3 Metric counters */}
        <div className="grid grid-cols-3 gap-3 pt-4 mt-4 border-t border-white/10 text-xs">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FEF3C7]/15 text-[#FCD34D] flex items-center justify-center font-bold">
              {pendingCount}
            </div>
            <div>
              <div className="text-[10px] text-[#9CA3AF]">待門市下架揀貨</div>
              <div className="font-bold text-[#F3F4F6]">已即時鎖定防超賣</div>
            </div>
          </div>

          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#DBEAFE]/15 text-[#93C5FD] flex items-center justify-center font-bold">
              {pickedCount}
            </div>
            <div>
              <div className="text-[10px] text-[#9CA3AF]">已包裝完成</div>
              <div className="font-bold text-[#F3F4F6]">等待黑貓快遞收件</div>
            </div>
          </div>

          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#D1FAE5]/15 text-[#6EE7B7] flex items-center justify-center font-bold">
              {dispatchedCount}
            </div>
            <div>
              <div className="text-[10px] text-[#9CA3AF]">已出庫派送</div>
              <div className="font-bold text-[#F3F4F6]">全通路正價全額回收</div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-tabs */}
      <div className="flex items-center space-x-2 border-b border-[#E5E7EB] pb-2 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'orders'
              ? 'bg-[#1C2024] text-white shadow-xs'
              : 'text-[#4B5563] hover:bg-[#F3F4F6]'
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>門市代發訂單清單 ({filteredOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('notification_flow')}
          className={`px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'notification_flow'
              ? 'bg-[#1C2024] text-white shadow-xs'
              : 'text-[#4B5563] hover:bg-[#F3F4F6]'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5 text-[#C5A059]" />
          <span>📱 門市通知與推播模擬（LINE/iPad/SMS）</span>
        </button>

        <button
          onClick={() => setActiveTab('routing_logic')}
          className={`px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'routing_logic'
              ? 'bg-[#1C2024] text-white shadow-xs'
              : 'text-[#4B5563] hover:bg-[#F3F4F6]'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5 text-[#2563EB]" />
          <span>AI 智慧尋源計分模型說明</span>
        </button>
      </div>

      {/* Main Tab 1: Orders List */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white rounded-xl border border-[#E8EAEE] p-3 sm:p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 md:pb-0">
              {[
                { id: 'all', label: '全部代發訂單' },
                { id: 'pending_pick', label: '待下架揀貨 (鎖定中)' },
                { id: 'picked_packed', label: '已包裝 (待快遞收件)' },
                { id: 'dispatched', label: '已發貨出庫' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedStatus(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    selectedStatus === tab.id
                      ? 'bg-[#8C6D3B] text-white shadow-xs'
                      : 'bg-[#F4F6F8] text-[#4B5563] hover:bg-[#EAEFF5]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-64 shrink-0">
              <Search className="w-3.5 h-3.5 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="搜尋訂單編號、商品、顧客..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#1F2937] placeholder-[#9CA3AF] focus:outline-none focus:ring-1 focus:ring-[#C5A059] focus:bg-white"
              />
            </div>
          </div>

          {/* Orders Grid */}
          <div className="grid grid-cols-1 gap-4">
            {filteredOrders.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#E8EAEE] p-12 text-center space-y-3">
                <ShoppingBag className="w-10 h-10 text-[#CBD5E1] mx-auto" />
                <div className="text-sm font-bold text-[#475569]">目前無符合篩選條件的電商代發訂單</div>
                <button
                  onClick={() => setIsSimulateModalOpen(true)}
                  className="text-xs text-[#8C6D3B] font-bold hover:underline"
                >
                  點此模擬顧客下單測試尋源流程 →
                </button>
              </div>
            ) : (
              filteredOrders.map((order) => {
                const store = stores.find((s) => s.id === order.assignedStoreId);
                const isAssignedToCurrentStore =
                  userRole === 'admin' || userRole === order.assignedStoreId;

                return (
                  <div
                    key={order.id}
                    className="bg-white rounded-2xl border border-[#E8EAEE] hover:border-[#C5A059] p-5 shadow-xs transition-all space-y-4"
                  >
                    {/* Top Row: Order Number, Status, Store */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100">
                      <div className="flex items-center space-x-3">
                        <span className="font-mono text-sm font-extrabold text-[#1E293B]">
                          {order.orderNumber}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            order.status === 'pending_pick'
                              ? 'bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]'
                              : order.status === 'picked_packed'
                              ? 'bg-[#DBEAFE] text-[#1E40AF] border border-[#BFDBFE]'
                              : 'bg-[#D1FAE5] text-[#065F46] border border-[#A7F3D0]'
                          }`}
                        >
                          {order.status === 'pending_pick'
                            ? '待揀貨下架（現場庫存已鎖定）'
                            : order.status === 'picked_packed'
                            ? '已包裝完成（待物流收件）'
                            : '已出庫交寄'}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2 text-xs">
                        <span className="text-[#64748B]">指派履約門市：</span>
                        <span className="font-bold text-[#1E293B] bg-[#F1F5F9] px-2.5 py-1 rounded-lg border border-[#E2E8F0] flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-[#8C6D3B]" />
                          {store?.name || order.assignedStoreId}
                        </span>
                      </div>
                    </div>

                    {/* Middle Info Columns */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      {/* Product Details */}
                      <div className="space-y-1.5 p-3 rounded-xl bg-[#F8FAFC] border border-[#EEF2F6]">
                        <div className="text-[11px] text-[#64748B] font-semibold">商品資訊與金額</div>
                        <div className="font-bold text-sm text-[#1E293B]">{order.productName}</div>
                        <div className="text-[11px] text-[#64748B] font-mono">
                          SKU: {order.productSku} · 數量: {order.quantity} 件
                        </div>
                        <div className="text-xs font-bold text-[#059669]">
                          正價 NT$ {order.price.toLocaleString()} (100% 正價交付)
                        </div>
                      </div>

                      {/* Customer & Shipping */}
                      <div className="space-y-1.5 p-3 rounded-xl bg-[#F8FAFC] border border-[#EEF2F6]">
                        <div className="text-[11px] text-[#64748B] font-semibold">顧客與收件地址</div>
                        <div className="font-bold text-[#1E293B] flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-[#8C6D3B]" />
                          {order.customerName} ({order.customerPhone})
                        </div>
                        <div className="text-[11px] text-[#475569] flex items-start gap-1">
                          <MapPin className="w-3.5 h-3.5 text-[#94A3B8] shrink-0 mt-0.5" />
                          <span>{order.shippingAddress}</span>
                        </div>
                        <div className="text-[10px] text-[#2563EB] font-semibold">
                          物流方式：{order.courier} {order.trackingNumber ? `(${order.trackingNumber})` : ''}
                        </div>
                      </div>

                      {/* AI Sourcing Reason & Push Alerts */}
                      <div className="space-y-1.5 p-3 rounded-xl bg-[#FAF6EE] border border-[#EEDB9F]">
                        <div className="text-[11px] text-[#8C6D3B] font-bold flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
                          AI 智慧尋源指派原因
                        </div>
                        <p className="text-[11px] text-[#63512A] leading-relaxed">
                          {order.assignedReason}
                        </p>
                        <div className="flex items-center space-x-2 pt-1 text-[10px] text-[#8C6D3B]">
                          <span className="flex items-center gap-1">
                            <Smartphone className="w-3 h-3 text-[#10B981]" />
                            iPad已推播
                          </span>
                          <span>·</span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3 text-[#10B981]" />
                            LINE Bot已通知
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Step Action Workflow Buttons */}
                    <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-gray-100">
                      <div className="text-[11px] text-[#64748B] flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#F59E0B]" />
                        <span>時效目標：{order.dueTime}</span>
                      </div>

                      {/* Operational buttons */}
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => {
                            setPreviewLineOrder(order);
                            setActiveTab('notification_flow');
                          }}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#475569] hover:bg-[#F1F5F9] border border-[#E2E8F0] transition-colors flex items-center gap-1"
                        >
                          <Smartphone className="w-3 h-3 text-[#8C6D3B]" />
                          <span>查看門市推播內容</span>
                        </button>

                        {/* Step 1: Pick from Shelf */}
                        {order.status === 'pending_pick' && (
                          <button
                            onClick={() => onUpdateOrderStatus(order.id, 'picked_packed', 'TC-' + Math.floor(100000000 + Math.random() * 900000000))}
                            disabled={!isAssignedToCurrentStore}
                            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 ${
                              isAssignedToCurrentStore
                                ? 'bg-[#8C6D3B] hover:bg-[#73592E] text-white active:scale-95'
                                : 'bg-[#E2E8F0] text-[#94A3B8] cursor-not-allowed'
                            }`}
                            title={!isAssignedToCurrentStore ? '請切換至該門市或總管理者身分操作' : '已至架上下架並包裝完成'}
                          >
                            <PackageCheck className="w-3.5 h-3.5" />
                            <span>1. 確認下架包裝 & 列印託運單</span>
                          </button>
                        )}

                        {/* Step 2: Handover to Courier */}
                        {order.status === 'picked_packed' && (
                          <button
                            onClick={() => onUpdateOrderStatus(order.id, 'dispatched')}
                            disabled={!isAssignedToCurrentStore}
                            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 ${
                              isAssignedToCurrentStore
                                ? 'bg-[#059669] hover:bg-[#047857] text-white active:scale-95'
                                : 'bg-[#E2E8F0] text-[#94A3B8] cursor-not-allowed'
                            }`}
                            title={!isAssignedToCurrentStore ? '請切換至該門市或總管理者身分操作' : '黑貓快遞已收件出庫'}
                          >
                            <Truck className="w-3.5 h-3.5" />
                            <span>2. 快遞已收件發運（完成履約）</span>
                          </button>
                        )}

                        {/* Completed State */}
                        {order.status === 'dispatched' && (
                          <span className="text-xs font-bold text-[#059669] bg-[#ECFDF5] px-3 py-1.5 rounded-lg border border-[#A7F3D0] flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>已完成代出貨，業績已計入門市</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Main Tab 2: Notification Flow Mockup */}
      {activeTab === 'notification_flow' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-150">
          {/* Left: LINE Bot Notification Card */}
          <div className="bg-[#FFFDF9] border border-[#DED6CF] rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#ECE5DE]">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-[#06C755] text-white flex items-center justify-center font-bold">
                  LINE
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#24211F]">
                    LINE 官方門市機器人推播（店長手機）
                  </h3>
                  <div className="text-[11px] text-[#7C756F]">全通路訂單一秒零時差送達</div>
                </div>
              </div>
              <span className="text-[10px] text-[#06C755] font-bold bg-[#E8F8EE] px-2 py-0.5 rounded border border-[#B4ECC7]">
                連線運作中
              </span>
            </div>

            {/* Chat bubble */}
            <div className="bg-[#7494C0] rounded-2xl p-4 space-y-3 shadow-inner">
              <div className="bg-white rounded-2xl p-4 shadow-md space-y-2.5 text-xs text-[#1E293B]">
                <div className="flex items-center justify-between text-[11px] text-[#8C6D3B] font-bold border-b border-gray-100 pb-1.5">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
                    【KAVA 總部系統】官網代出貨指派通知
                  </span>
                  <span className="text-[#94A3B8] font-normal">剛剛</span>
                </div>

                <p className="font-semibold text-sm text-[#0F172A]">
                  親愛的 {getStoreName(previewLineOrder?.assignedStoreId || 'S01')} 店長：
                </p>

                <p className="text-[#475569] leading-relaxed">
                  官網收到 1 筆訂單 <strong className="text-[#1E293B]">#{previewLineOrder?.orderNumber}</strong>，因總倉缺貨，系統已自動指派由貴店履約發貨！
                </p>

                <div className="bg-[#F8FAFC] rounded-xl p-3 border border-[#E2E8F0] space-y-1">
                  <div>💍 <strong>商品：</strong> {previewLineOrder?.productName} (1 件)</div>
                  <div>🏷️ <strong>SKU：</strong> {previewLineOrder?.productSku}</div>
                  <div>💰 <strong>金額：</strong> NT$ {previewLineOrder?.price.toLocaleString()} (計入貴店全通路業績)</div>
                  <div>📍 <strong>顧客地址：</strong> {previewLineOrder?.shippingAddress}</div>
                  <div>🔒 <strong>狀態：</strong> 系統已扣除可用現貨，標記為「鎖定:1」</div>
                </div>

                <div className="text-[11px] text-[#DC2626] font-semibold bg-[#FEF2F2] p-2 rounded-lg border border-[#FEE2E2]">
                  ⚠️ 門市安全提醒：請勿將此件商品出售給現場過路客。請於 2 小時內完成下架裝盒。
                </div>

                <div className="pt-2 flex items-center space-x-2">
                  <button className="w-full bg-[#06C755] hover:bg-[#05B34C] text-white py-2 rounded-xl font-bold text-xs shadow-xs text-center">
                    一鍵確認下架並列印託運單
                  </button>
                </div>
              </div>
            </div>

            <div className="text-[11px] text-[#7C756F] leading-relaxed">
              💡 <strong>為什麼需要 LINE 機器人？</strong> 門市專櫃人員平時都在走動招呼客人，透過 LINE Push 確保店長在第一秒就能下架展示品，徹底防止現場過路客買走造成的「超賣糾紛」。
            </div>
          </div>

          {/* Right: iPad/POS Alert Screen Mockup */}
          <div className="bg-[#FFFDF9] border border-[#DED6CF] rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#ECE5DE]">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-[#1E293B] text-[#E5C482] flex items-center justify-center font-bold">
                  POS
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#24211F]">
                    專櫃 iPad / POS 系統聲光彈窗
                  </h3>
                  <div className="text-[11px] text-[#7C756F]">結帳機台即時攔截與提醒</div>
                </div>
              </div>
              <span className="text-[10px] text-[#8C6D3B] font-bold bg-[#FAF3E0] px-2 py-0.5 rounded border border-[#EADBBD]">
                音效推播已啟動
              </span>
            </div>

            {/* iPad Window Screen */}
            <div className="bg-[#0F172A] rounded-2xl p-4 border border-[#334155] text-white space-y-3 shadow-md">
              <div className="flex items-center justify-between text-xs text-[#94A3B8]">
                <span>KAVA POS Terminal #01 (一中店櫃台)</span>
                <span className="text-[#34D399] flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
                  即時連線
                </span>
              </div>

              {/* Alert box */}
              <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] border-2 border-[#F59E0B] rounded-xl p-4 space-y-2">
                <div className="flex items-center space-x-2 text-[#F59E0B] font-bold text-sm">
                  <Volume2 className="w-4 h-4 animate-bounce" />
                  <span>【電商訂單下單通知】全台最後一件庫存已鎖定</span>
                </div>
                <div className="text-xs text-[#E2E8F0]">
                  {previewLineOrder?.productName} 已被官網訂單 #{previewLineOrder?.orderNumber} 鎖定。
                </div>
                <div className="bg-[#020617] p-2.5 rounded-lg text-[11px] font-mono text-[#CBD5E1] border border-white/10">
                  POS 刷條碼保護：若現場嘗試過卡，POS 將自動提示「此條碼已由官網鎖定待發，請引導客人改為預訂」。
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button className="bg-[#C5A059] text-[#16181B] py-2 rounded-lg font-bold text-xs text-center hover:bg-[#D4B06A]">
                  列印黑貓宅配託運單
                </button>
                <button className="bg-[#334155] text-white py-2 rounded-lg font-semibold text-xs text-center hover:bg-[#475569]">
                  列印珠寶禮品卡
                </button>
              </div>
            </div>

            <div className="text-[11px] text-[#7C756F] leading-relaxed">
              🛡️ <strong>底層防呆機制：</strong> 當現場店員拿起商品刷條碼時，系統會自動阻擋過卡結帳，引導店員改向顧客推薦「預購」或「同系列替代款」，完美兼顧現場客人體驗與線上訂單誠信！
            </div>
          </div>
        </div>
      )}

      {/* Main Tab 3: Routing Logic */}
      {activeTab === 'routing_logic' && (
        <div className="bg-white rounded-2xl border border-[#E8EAEE] p-6 shadow-xs space-y-6">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-[#1E293B] font-serif-heading">
              AI 智慧尋源計分模型（Sourcing Scoring Algorithm）
            </h2>
            <p className="text-xs text-[#64748B]">
              當官網總倉無可賣現貨時，系統依以下 4 大維度加權評分，決定指派哪間門市代出貨：
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#EEF2F6] space-y-2">
              <div className="w-7 h-7 rounded-lg bg-[#8C6D3B] text-white font-bold text-xs flex items-center justify-center">
                40%
              </div>
              <h3 className="font-bold text-xs text-[#1E293B]">1. 庫存天數與滯銷消呆 (DOI)</h3>
              <p className="text-[11px] text-[#64748B] leading-relaxed">
                優先從在庫天數超過 45 天、周轉緩慢的門市調出，搶救即將呆滯的庫存，避免原店未來打折出清。
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#EEF2F6] space-y-2">
              <div className="w-7 h-7 rounded-lg bg-[#2563EB] text-white font-bold text-xs flex items-center justify-center">
                25%
              </div>
              <h3 className="font-bold text-xs text-[#1E293B]">2. 地理最短距離與時效 (Geo)</h3>
              <p className="text-[11px] text-[#64748B] leading-relaxed">
                依顧客收件地址計算同城快遞距離（例如：台中訂單優先指派一中店），節省物流費用並實現半日達。
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#EEF2F6] space-y-2">
              <div className="w-7 h-7 rounded-lg bg-[#059669] text-white font-bold text-xs flex items-center justify-center">
                20%
              </div>
              <h3 className="font-bold text-xs text-[#1E293B]">3. 門市現場動銷預估 (Velocity)</h3>
              <p className="text-[11px] text-[#64748B] leading-relaxed">
                若某門市近 3 天現場熱賣該品項，系統會保留現貨給現場過路客，改由其他動銷平緩的門市代發。
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#EEF2F6] space-y-2">
              <div className="w-7 h-7 rounded-lg bg-[#7C3AED] text-white font-bold text-xs flex items-center justify-center">
                15%
              </div>
              <h3 className="font-bold text-xs text-[#1E293B]">4. 門市當日發貨產能 (Workload)</h3>
              <p className="text-[11px] text-[#64748B] leading-relaxed">
                避開正在舉辦週年慶大促、專櫃店員已超載的門市，確保電商客人享有最快速的包裝與出貨服務。
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Simulation Modal */}
      {isSimulateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#E5E7EB] space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-[#8C6D3B] text-white flex items-center justify-center">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#1E293B]">
                    模擬消費者在官網下單（觸發 OMO 尋源）
                  </h3>
                  <div className="text-[11px] text-[#64748B]">驗證總倉缺貨時，門市即時鎖定與推播機制</div>
                </div>
              </div>
              <button
                onClick={() => setIsSimulateModalOpen(false)}
                className="text-[#9CA3AF] hover:text-[#1E293B] font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSimulateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#475569] font-bold mb-1">
                  選擇消費者欲購買的商品：
                </label>
                <select
                  value={simProductId}
                  onChange={(e) => setSimProductId(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg p-2.5 text-xs text-[#1E293B] font-medium"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.sku}) - 正價 NT$ {p.price.toLocaleString()}
                    </option>
                  ))}
                </select>
                <div className="text-[10px] text-[#8C6D3B] mt-1">
                  * 若選擇「微光鎖骨鍊」，系統將模擬總倉缺貨時，自動尋源指派「一中店」或「西門店」並即時鎖定！
                </div>
              </div>

              <div>
                <label className="block text-[#475569] font-bold mb-1">
                  模擬顧客收件地址：
                </label>
                <input
                  type="text"
                  value={simCustomerAddress}
                  onChange={(e) => setSimCustomerAddress(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg p-2.5 text-xs text-[#1E293B]"
                  placeholder="例如：台中市西屯區台灣大道三段99號"
                />
              </div>

              <div className="p-3 bg-[#FAF6EE] rounded-xl border border-[#EEDB9F] text-[11px] text-[#8C6D3B] space-y-1">
                <div className="font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  送出後系統將立即執行：
                </div>
                <div>1. 掃描全台庫存，依消呆與距離評分指派最佳門市</div>
                <div>2. 將該門市庫存轉為 <strong>🔒 鎖定 +1</strong>，可用現貨 -1</div>
                <div>3. 生成門市代發工單，推播 LINE Bot 與專櫃 iPad</div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsSimulateModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-[#64748B] hover:bg-[#F1F5F9]"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-[#8C6D3B] hover:bg-[#73592E] text-white shadow-xs"
                >
                  立即送出下單模擬
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
