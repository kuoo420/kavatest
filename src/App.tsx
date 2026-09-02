import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopNavbar } from './components/TopNavbar';
import { DashboardView } from './components/DashboardView';
import { AIRecommendationsView } from './components/AIRecommendationsView';
import { ManualTransferView } from './components/ManualTransferView';
import { TransferManagementView } from './components/TransferManagementView';
import { InventoryView } from './components/InventoryView';
import { AuditLogView } from './components/AuditLogView';
import { ExportModal, PresetPeriod } from './components/ExportModal';
import { TransferDetailModal } from './components/TransferDetailModal';
import { NewTransferModal } from './components/NewTransferModal';
import { 
  STORES, 
  PRODUCTS, 
  INITIAL_INVENTORY, 
  INITIAL_TRANSFER_CASES, 
  INITIAL_AUDIT_LOGS 
} from './data/mockData';
import { 
  NavigationTab, 
  UserRole, 
  ViewScope, 
  TransferCase, 
  StoreInventory, 
  AuditLog, 
  Product,
  DashboardMetrics 
} from './types';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('dashboard');
  const [userRole, setUserRole] = useState<UserRole>('admin');
  const [viewScope, setViewScope] = useState<ViewScope>('all');

  const [stores, setStores] = useState(STORES);
  const [products, setProducts] = useState(PRODUCTS);
  const [inventory, setInventory] = useState<StoreInventory[]>(INITIAL_INVENTORY);
  const [cases, setCases] = useState<TransferCase[]>(INITIAL_TRANSFER_CASES);
  const [logs, setLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);

  // Modals state
  const [exportModalConfig, setExportModalConfig] = useState<{
    isOpen: boolean;
    preset?: PresetPeriod;
    selectedReports?: string[];
    contextTitle?: string;
  }>({
    isOpen: false,
    preset: 'monthly',
    selectedReports: ['health', 'ai_effectiveness', 'inventory_risk', 'transfer_cases'],
  });

  const [selectedCaseForDetail, setSelectedCaseForDetail] = useState<TransferCase | null>(null);
  const [isNewTransferModalOpen, setIsNewTransferModalOpen] = useState(false);
  const [prefilledProduct, setPrefilledProduct] = useState<Product | null>(null);
  const [prefilledTargetStoreId, setPrefilledTargetStoreId] = useState<string | undefined>(undefined);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleOpenExportModal = (
    preset: PresetPeriod = 'monthly',
    selectedReports?: string[],
    contextTitle?: string
  ) => {
    setExportModalConfig({
      isOpen: true,
      preset,
      selectedReports: selectedReports || ['health', 'ai_effectiveness', 'inventory_risk', 'transfer_cases'],
      contextTitle,
    });
  };


  // Append new audit log helper
  const addAuditLog = (
    actionType: AuditLog['actionType'],
    title: string,
    details: string,
    targetId?: string,
    status: AuditLog['status'] = 'info'
  ) => {
    const roleTitle = userRole === 'admin' ? '總管理者' : stores.find(s => s.id === userRole)?.name + ' 店長' || '門市人員';
    const operator = userRole === 'admin' ? '中央營運調度員' : stores.find(s => s.id === userRole)?.manager || '門市主管';
    
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString('zh-TW', { hour12: false }),
      operator,
      roleTitle,
      actionType,
      title,
      details,
      targetId,
      status,
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  // 1. Adopt AI Recommendation (Initiate Transfer)
  const handleAdoptAIRecommendation = (caseId: string) => {
    const targetCase = cases.find((c) => c.id === caseId);
    if (!targetCase) return;

    const updated = cases.map((c) => {
      if (c.id === caseId) {
        return {
          ...c,
          status: 'waiting_source' as const,
          prescriptionStatus: 'transfer_initiated' as const,
          prescriptionAction: 'transfer' as const,
          pendingStoreId: c.sourceStoreId,
          updatedAt: new Date().toLocaleString('zh-TW'),
          remarks: '已由門市/管理者啟動跨店正價調撥，發送給調出店進行出庫核准。',
        };
      }
      return c;
    });

    setCases(updated);
    addAuditLog(
      'PRESCRIPTION_TRANSFER',
      `啟動跨店正價調撥 ${targetCase.caseNumber}`,
      `已啟動 ${targetCase.productName} 跨店正價調撥工單，送交調出店核准出庫。`,
      targetCase.caseNumber,
      'success'
    );
  };

  // 1b. Adopt VM Prescription (7-day observing with Photo Verification)
  const handleAdoptPrescriptionVM = (caseId: string, photoProofUrl?: string) => {
    const targetCase = cases.find((c) => c.id === caseId);
    if (!targetCase) return;

    const verifiedAt = new Date().toLocaleString('zh-TW');
    const storeObj = stores.find((s) => s.id === targetCase.sourceStoreId);
    const verifiedBy = storeObj ? `${storeObj.name}店長` : '專櫃人員';

    setCases((prev) =>
      prev.map((c) =>
        c.id === caseId
          ? {
              ...c,
              prescriptionStatus: 'vm_observing' as const,
              prescriptionAction: 'vm_display' as const,
              observationDaysRemaining: 7,
              vmPhotoProofUrl: photoProofUrl || c.vmPhotoProofUrl,
              vmVerifiedAt: verifiedAt,
              vmVerifiedBy: verifiedBy,
              updatedAt: verifiedAt,
              remarks: '門市已拍照上傳存證「視覺陳列優化與疊戴推薦話術」，進入 7 天觀察鎖定期。',
            }
          : c
      )
    );

    addAuditLog(
      'PRESCRIPTION_VM',
      `拍照存證採用陳列處方 ${targetCase.caseNumber}`,
      `門市已完成 ${targetCase.productName} 現場陳列拍照上傳與搭售話術配置，進入 7 天閉環演算法觀察期。`,
      targetCase.caseNumber,
      'info'
    );
  };

  // 1c. Adopt GWP Prescription
  const handleAdoptPrescriptionGWP = (caseId: string) => {
    const targetCase = cases.find((c) => c.id === caseId);
    if (!targetCase) return;

    setCases((prev) =>
      prev.map((c) =>
        c.id === caseId
          ? {
              ...c,
              prescriptionStatus: 'gwp_applied' as const,
              prescriptionAction: 'gwp_gift' as const,
              updatedAt: new Date().toLocaleString('zh-TW'),
              remarks: '已申請轉為門市 VIP 滿額限定禮標的。',
            }
          : c
      )
    );

    addAuditLog(
      'PRESCRIPTION_GWP',
      `申請滿額贈禮轉化 ${targetCase.caseNumber}`,
      `已將 ${targetCase.productName} 申請轉化為專櫃 VIP 滿額贈禮標的，保全正價品牌價值。`,
      targetCase.caseNumber,
      'success'
    );
  };

  // 2. Reject/Dismiss Recommendation or Transfer
  const handleRejectTransfer = (caseId: string) => {
    const targetCase = cases.find((c) => c.id === caseId);
    if (!targetCase) return;

    setCases((prev) =>
      prev.map((c) =>
        c.id === caseId
          ? {
              ...c,
              status: 'rejected' as const,
              pendingStoreId: undefined,
              updatedAt: new Date().toLocaleString('zh-TW'),
              remarks: '此工單已由店家/管理者駁回或取消。',
            }
          : c
      )
    );

    addAuditLog(
      'STORE_REJECT',
      `駁回/取消工單 ${targetCase.caseNumber}`,
      `已取消 ${targetCase.productName} 之跨店調撥工單。`,
      targetCase.caseNumber,
      'warning'
    );

    setSelectedCaseForDetail(null);
  };

  // 3. Source store approves outbound
  const handleApproveSource = (caseId: string) => {
    const targetCase = cases.find((c) => c.id === caseId);
    if (!targetCase) return;

    const newSourceConfirmed = true;
    const isBoth = targetCase.targetConfirmed && newSourceConfirmed;

    setCases((prev) =>
      prev.map((c) => {
        if (c.id === caseId) {
          return {
            ...c,
            sourceConfirmed: true,
            sourceConfirmedAt: new Date().toLocaleString('zh-TW'),
            status: isBoth ? 'both_confirmed' : ('waiting_target' as const),
            pendingStoreId: isBoth ? c.sourceStoreId : c.targetStoreId,
            updatedAt: new Date().toLocaleString('zh-TW'),
          };
        }
        return c;
      })
    );

    // Lock inventory in source store
    setInventory((prev) =>
      prev.map((inv) => {
        if (inv.storeId === targetCase.sourceStoreId && inv.productId === targetCase.productId) {
          return {
            ...inv,
            availableStock: Math.max(0, inv.availableStock - targetCase.quantity),
            committedStock: inv.committedStock + targetCase.quantity,
          };
        }
        return inv;
      })
    );

    addAuditLog(
      'STORE_APPROVE',
      `調出店核准出庫 ${targetCase.caseNumber}`,
      `調出門市已核准 ${targetCase.productName} x ${targetCase.quantity} 條出庫，在庫存鎖定承諾。`,
      targetCase.caseNumber,
      'success'
    );

    if (selectedCaseForDetail?.id === caseId) {
      setSelectedCaseForDetail((prev) =>
        prev
          ? {
              ...prev,
              sourceConfirmed: true,
              sourceConfirmedAt: new Date().toLocaleString('zh-TW'),
              status: isBoth ? 'both_confirmed' : 'waiting_target',
            }
          : null
      );
    }
  };

  // 4. Target store approves inbound
  const handleApproveTarget = (caseId: string) => {
    const targetCase = cases.find((c) => c.id === caseId);
    if (!targetCase) return;

    const newTargetConfirmed = true;
    const isBoth = targetCase.sourceConfirmed && newTargetConfirmed;

    setCases((prev) =>
      prev.map((c) => {
        if (c.id === caseId) {
          return {
            ...c,
            targetConfirmed: true,
            targetConfirmedAt: new Date().toLocaleString('zh-TW'),
            status: isBoth ? 'both_confirmed' : ('waiting_source' as const),
            pendingStoreId: isBoth ? c.sourceStoreId : c.sourceStoreId,
            updatedAt: new Date().toLocaleString('zh-TW'),
          };
        }
        return c;
      })
    );

    addAuditLog(
      'STORE_APPROVE',
      `調入店核准需求 ${targetCase.caseNumber}`,
      `調入門市已核准接收 ${targetCase.productName} x ${targetCase.quantity} 條。`,
      targetCase.caseNumber,
      'success'
    );

    if (selectedCaseForDetail?.id === caseId) {
      setSelectedCaseForDetail((prev) =>
        prev
          ? {
              ...prev,
              targetConfirmed: true,
              targetConfirmedAt: new Date().toLocaleString('zh-TW'),
              status: isBoth ? 'both_confirmed' : 'waiting_source',
            }
          : null
      );
    }
  };

  // 5. Dispatch courier
  const handleDispatchCourier = (caseId: string, trackingNumber: string) => {
    const targetCase = cases.find((c) => c.id === caseId);
    if (!targetCase) return;

    setCases((prev) =>
      prev.map((c) =>
        c.id === caseId
          ? {
              ...c,
              status: 'in_transit' as const,
              courierNumber: trackingNumber,
              pendingStoreId: c.targetStoreId,
              updatedAt: new Date().toLocaleString('zh-TW'),
            }
          : c
      )
    );

    // Update incoming stock in target store
    setInventory((prev) =>
      prev.map((inv) => {
        if (inv.storeId === targetCase.targetStoreId && inv.productId === targetCase.productId) {
          return {
            ...inv,
            incomingStock: inv.incomingStock + targetCase.quantity,
          };
        }
        return inv;
      })
    );

    addAuditLog(
      'DISPATCH',
      `物流發貨派送 ${targetCase.caseNumber}`,
      `已包裝交付物流，單號：${trackingNumber}。`,
      targetCase.caseNumber,
      'info'
    );

    if (selectedCaseForDetail?.id === caseId) {
      setSelectedCaseForDetail((prev) =>
        prev
          ? {
              ...prev,
              status: 'in_transit',
              courierNumber: trackingNumber,
              pendingStoreId: prev.targetStoreId,
            }
          : null
      );
    }
  };

  // 6. Complete transfer & receipt
  const handleCompleteTransfer = (caseId: string) => {
    const targetCase = cases.find((c) => c.id === caseId);
    if (!targetCase) return;

    setCases((prev) =>
      prev.map((c) =>
        c.id === caseId
          ? {
              ...c,
              status: 'completed' as const,
              pendingStoreId: undefined,
              updatedAt: new Date().toLocaleString('zh-TW'),
            }
          : c
      )
    );

    // Update inventory: deduct source committed stock, remove target incoming stock, add target available stock
    setInventory((prev) =>
      prev.map((inv) => {
        if (inv.storeId === targetCase.sourceStoreId && inv.productId === targetCase.productId) {
          return {
            ...inv,
            committedStock: Math.max(0, inv.committedStock - targetCase.quantity),
          };
        }
        if (inv.storeId === targetCase.targetStoreId && inv.productId === targetCase.productId) {
          return {
            ...inv,
            incomingStock: Math.max(0, inv.incomingStock - targetCase.quantity),
            availableStock: inv.availableStock + targetCase.quantity,
          };
        }
        return inv;
      })
    );

    addAuditLog(
      'RECEIVE',
      `門市點收完成 ${targetCase.caseNumber}`,
      `調入門市已驗收商品無誤並上架，調撥流程正式結束。`,
      targetCase.caseNumber,
      'success'
    );

    if (selectedCaseForDetail?.id === caseId) {
      setSelectedCaseForDetail((prev) =>
        prev ? { ...prev, status: 'completed', pendingStoreId: undefined } : null
      );
    }
  };

  // 7. Create new manual transfer
  const handleCreateTransfer = (
    newCaseData: Omit<TransferCase, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    const newCase: TransferCase = {
      ...newCaseData,
      id: `case-${Date.now()}`,
      createdAt: new Date().toLocaleString('zh-TW', { hour12: false }),
      updatedAt: new Date().toLocaleString('zh-TW', { hour12: false }),
    };

    setCases((prev) => [newCase, ...prev]);
    addAuditLog(
      'TRANSFER_CREATE',
      `發起調撥工單 ${newCase.caseNumber}`,
      `由門市發起 ${newCase.productName} x ${newCase.quantity} 條跨店調撥。`,
      newCase.caseNumber,
      'warning'
    );
  };

  // 8. Log export action
  const handleLogExportAction = (
    reportName: string,
    destination: 'LOCAL_CSV' | 'GOOGLE_DRIVE'
  ) => {
    const destText = destination === 'GOOGLE_DRIVE' ? 'Google Drive 雲端備份' : '本機 CSV 下載';
    addAuditLog(
      destination === 'GOOGLE_DRIVE' ? 'DRIVE_BACKUP' : 'EXPORT_CSV',
      `匯出營運報表 (${destText})`,
      `成功產出報表檔案：${reportName}`,
      reportName,
      'info'
    );
  };

  // 9. Quick transfer shortcut from inventory view
  const handleRequestTransferForProduct = (product: Product, targetStoreId: string) => {
    setPrefilledProduct(product);
    setPrefilledTargetStoreId(targetStoreId);
    setIsNewTransferModalOpen(true);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 500);
  };

  // Calculate Metrics
  const aiPendingCount = cases.filter((c) => c.status === 'ai_pending').length;
  const inProgressCount = cases.filter(
    (c) => c.status === 'waiting_source' || c.status === 'waiting_target'
  ).length;
  const bothConfirmedCount = cases.filter(
    (c) => c.status === 'both_confirmed' || c.status === 'in_transit'
  ).length;
  const totalAvailableStock = inventory.reduce((sum, inv) => sum + inv.availableStock, 0);

  const storePendingMap: Record<string, number> = {};
  stores.forEach((s) => {
    storePendingMap[s.id] = cases.filter(
      (c) =>
        (c.status === 'waiting_source' && c.sourceStoreId === s.id) ||
        (c.status === 'waiting_target' && c.targetStoreId === s.id) ||
        (c.status === 'ai_pending' && c.sourceStoreId === s.id)
    ).length;
  });

  const dashboardMetrics: DashboardMetrics = {
    aiPendingCount,
    inProgressCount,
    bothConfirmedCount,
    totalAvailableStock,
    activeSkuCount: products.length,
    storePendingMap,
  };

  return (
    <div id="kava-app-root" className="flex min-h-screen bg-[#F8F7F4] text-[#1E252B] font-sans relative">
      {/* Dark Sidebar (Desktop persistent + Mobile slide-over) */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        userRole={userRole}
        viewScope={viewScope}
        stores={stores}
        pendingCount={inProgressCount}
        aiCount={aiPendingCount}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 lg:pb-0">
        {/* Top Navbar */}
        <TopNavbar
          currentTab={currentTab}
          userRole={userRole}
          onChangeUserRole={setUserRole}
          viewScope={viewScope}
          onChangeViewScope={setViewScope}
          stores={stores}
          onOpenExportModal={() => handleOpenExportModal('monthly', ['health', 'ai_effectiveness', 'inventory_risk', 'transfer_cases'])}
          onRefreshData={handleRefresh}
          isRefreshing={isRefreshing}
          onToggleMobileMenu={() => setIsMobileMenuOpen((prev) => !prev)}
        />

        {/* Dynamic Tab Views */}
        <main className="flex-1 pb-8">
          {currentTab === 'dashboard' && (
            <DashboardView
              cases={cases}
              stores={stores}
              inventory={inventory}
              products={products}
              userRole={userRole}
              viewScope={viewScope}
              onNavigateTab={setCurrentTab}
              onSelectCase={setSelectedCaseForDetail}
              onOpenExportModal={handleOpenExportModal}
            />
          )}

          {currentTab === 'ai_recommendations' && (
            <AIRecommendationsView
              cases={cases}
              stores={stores}
              products={products}
              inventory={inventory}
              userRole={userRole}
              viewScope={viewScope}
              onAdoptRecommendation={handleAdoptAIRecommendation}
              onAdoptPrescriptionVM={handleAdoptPrescriptionVM}
              onAdoptPrescriptionGWP={handleAdoptPrescriptionGWP}
              onRejectRecommendation={handleRejectTransfer}
              onSelectCase={setSelectedCaseForDetail}
              onOpenExportModal={handleOpenExportModal}
            />
          )}

          {currentTab === 'manual_transfer' && (
            <ManualTransferView
              stores={stores}
              products={products}
              inventory={inventory}
              userRole={userRole}
              onNavigateTab={setCurrentTab}
              onCreateTransfer={(data) => {
                const caseNum = `TR-${Math.floor(10000000 + Math.random() * 90000000)}`;
                handleCreateTransfer({
                  caseNumber: caseNum,
                  productName: data.productName,
                  productSku: data.productSku,
                  productId: data.productId,
                  quantity: data.quantity,
                  sourceStoreId: data.sourceStoreId,
                  targetStoreId: data.targetStoreId,
                  status: 'waiting_source',
                  pendingStoreId: data.sourceStoreId,
                  isAiGenerated: false,
                  transferReason: data.transferReason,
                  sourceConfirmed: false,
                  targetConfirmed: false,
                  remarks: data.remarks,
                });
              }}
            />
          )}

          {currentTab === 'transfers' && (
            <TransferManagementView
              cases={cases}
              stores={stores}
              products={products}
              userRole={userRole}
              viewScope={viewScope}
              onSelectCase={setSelectedCaseForDetail}
              onOpenNewTransferModal={() => {
                setPrefilledProduct(null);
                setPrefilledTargetStoreId(undefined);
                setIsNewTransferModalOpen(true);
              }}
              onApproveSource={handleApproveSource}
              onApproveTarget={handleApproveTarget}
              onDispatchCourier={handleDispatchCourier}
              onCompleteTransfer={handleCompleteTransfer}
              onOpenExportModal={handleOpenExportModal}
            />
          )}

          {currentTab === 'inventory' && (
            <InventoryView
              inventory={inventory}
              products={products}
              stores={stores}
              userRole={userRole}
              viewScope={viewScope}
              onRequestTransferForProduct={handleRequestTransferForProduct}
              onOpenExportModal={handleOpenExportModal}
            />
          )}

          {currentTab === 'history' && (
            <AuditLogView 
              logs={logs} 
              onOpenExportModal={handleOpenExportModal}
            />
          )}
        </main>
      </div>

      {/* Mobile Bottom Quick Navigation Bar (Sticky at bottom on phones/tablets) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#16181B] border-t border-[#2A3038] px-2 py-1.5 flex items-center justify-around shadow-2xl backdrop-blur-md">
        <button
          onClick={() => setCurrentTab('dashboard')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
            currentTab === 'dashboard' ? 'text-[#E5C482]' : 'text-[#8E99A8] hover:text-[#D1D5DB]'
          }`}
        >
          <span className="text-base leading-none mb-0.5">📊</span>
          <span>儀表板</span>
        </button>

        <button
          onClick={() => setCurrentTab('ai_recommendations')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-medium transition-colors relative ${
            currentTab === 'ai_recommendations' ? 'text-[#E5C482]' : 'text-[#8E99A8] hover:text-[#D1D5DB]'
          }`}
        >
          <span className="text-base leading-none mb-0.5">✨</span>
          <span>AI 處方</span>
          {aiPendingCount > 0 && (
            <span className="absolute top-0 right-1 w-2 h-2 bg-[#D97706] rounded-full ring-2 ring-[#16181B]"></span>
          )}
        </button>

        <button
          onClick={() => setCurrentTab('transfers')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-medium transition-colors relative ${
            currentTab === 'transfers' ? 'text-[#E5C482]' : 'text-[#8E99A8] hover:text-[#D1D5DB]'
          }`}
        >
          <span className="text-base leading-none mb-0.5">🔄</span>
          <span>調貨工單</span>
          {inProgressCount > 0 && (
            <span className="absolute top-0 right-1 w-2 h-2 bg-[#B45309] rounded-full ring-2 ring-[#16181B]"></span>
          )}
        </button>

        <button
          onClick={() => setCurrentTab('inventory')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
            currentTab === 'inventory' ? 'text-[#E5C482]' : 'text-[#8E99A8] hover:text-[#D1D5DB]'
          }`}
        >
          <span className="text-base leading-none mb-0.5">📦</span>
          <span>全店庫存</span>
        </button>

        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-medium text-[#8E99A8] hover:text-[#D1D5DB] transition-colors"
        >
          <span className="text-base leading-none mb-0.5">☰</span>
          <span>更多</span>
        </button>
      </nav>

      {/* Export Multi-Section Modal */}
      <ExportModal
        isOpen={exportModalConfig.isOpen}
        onClose={() => setExportModalConfig((prev) => ({ ...prev, isOpen: false }))}
        metrics={dashboardMetrics}
        cases={cases}
        stores={stores}
        inventory={inventory}
        products={products}
        logs={logs}
        onLogExportAction={handleLogExportAction}
        initialPreset={exportModalConfig.preset}
        initialSelectedReports={exportModalConfig.selectedReports}
        contextTitle={exportModalConfig.contextTitle}
      />

      {/* Transfer Case Inspection & Approval Modal */}
      <TransferDetailModal
        caseItem={selectedCaseForDetail}
        onClose={() => setSelectedCaseForDetail(null)}
        stores={stores}
        products={products}
        userRole={userRole}
        onApproveSource={handleApproveSource}
        onApproveTarget={handleApproveTarget}
        onDispatchCourier={handleDispatchCourier}
        onCompleteTransfer={handleCompleteTransfer}
        onRejectTransfer={handleRejectTransfer}
      />

      {/* New Manual Transfer Creation Modal */}
      <NewTransferModal
        isOpen={isNewTransferModalOpen}
        onClose={() => setIsNewTransferModalOpen(false)}
        stores={stores}
        products={products}
        inventory={inventory}
        prefilledProduct={prefilledProduct}
        prefilledTargetStoreId={prefilledTargetStoreId}
        onCreateTransfer={handleCreateTransfer}
      />
    </div>
  );
}
