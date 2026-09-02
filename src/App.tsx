import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopNavbar } from './components/TopNavbar';
import { DashboardView } from './components/DashboardView';
import { AIRecommendationsView } from './components/AIRecommendationsView';
import { ManualTransferView } from './components/ManualTransferView';
import { TransferManagementView } from './components/TransferManagementView';
import { InventoryView } from './components/InventoryView';
import { AuditLogView } from './components/AuditLogView';
import { ExportModal } from './components/ExportModal';
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
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [selectedCaseForDetail, setSelectedCaseForDetail] = useState<TransferCase | null>(null);
  const [isNewTransferModalOpen, setIsNewTransferModalOpen] = useState(false);
  const [prefilledProduct, setPrefilledProduct] = useState<Product | null>(null);
  const [prefilledTargetStoreId, setPrefilledTargetStoreId] = useState<string | undefined>(undefined);
  const [isRefreshing, setIsRefreshing] = useState(false);


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

  // 1. Start the in-store improvement that precedes a transfer decision.
  const handleStartAIImprovement = (caseId: string) => {
    const targetCase = cases.find((c) => c.id === caseId);
    if (!targetCase) return;

    setCases((prev) => prev.map((c) => c.id === caseId ? {
      ...c,
      aiDecisionStage: 'observing' as const,
      improvementStartedAt: new Date().toLocaleString('zh-TW'),
      updatedAt: new Date().toLocaleString('zh-TW'),
      remarks: '已採用優先改善方案，進入 7 天門市銷售觀察期。',
    } : c));

    addAuditLog('AI_ADOPT', `啟動優先改善 ${targetCase.caseNumber}`,
      `已為 ${targetCase.productName} 啟動店內陳列與推廣改善，觀察 7 天後再評估是否調撥。`,
      targetCase.caseNumber, 'info');
  };

  const handleEvaluateAIImprovement = (caseId: string) => {
    const targetCase = cases.find((c) => c.id === caseId);
    if (!targetCase) return;
    // Demo rule: very high cross-store shortage confidence escalates; otherwise retain.
    const nextStage = (targetCase.aiScore ?? 0) >= 97 ? 'transfer' : 'retain';
    setCases((prev) => prev.map((c) => c.id === caseId ? {
      ...c,
      aiDecisionStage: nextStage as 'transfer' | 'retain',
      improvementResult: nextStage === 'transfer'
        ? '改善後銷售仍未達預期，且他店缺貨需求明確。'
        : '改善後銷售回升，建議繼續留店銷售。',
      updatedAt: new Date().toLocaleString('zh-TW'),
    } : c));
  };

  // 2. Adopt AI transfer recommendation after the improvement stage.
  const handleAdoptAIRecommendation = (caseId: string) => {
    const targetCase = cases.find((c) => c.id === caseId);
    if (!targetCase) return;

    const updated = cases.map((c) => {
      if (c.id === caseId) {
        return {
          ...c,
          status: 'waiting_source' as const,
          pendingStoreId: c.sourceStoreId,
          updatedAt: new Date().toLocaleString('zh-TW'),
          remarks: '已由門市/管理者採用 AI 推薦，發送給調出店進行出庫核准。',
        };
      }
      return c;
    });

    setCases(updated);
    addAuditLog(
      'AI_ADOPT',
      `採用 AI 調撥建議 ${targetCase.caseNumber}`,
      `已採用 ${targetCase.productName} 跨店調撥建議，並進入調出店核准流程。`,
      targetCase.caseNumber,
      'success'
    );
  };

  // 3. Reject/Dismiss Recommendation or Transfer
  const handleRejectTransfer = (caseId: string) => {
    const targetCase = cases.find((c) => c.id === caseId);
    if (!targetCase) return;

    if (targetCase.caseType === 'omo_fulfillment' && targetCase.status === 'omo_pending') {
      setInventory((prev) => prev.map((inv) =>
        inv.storeId === targetCase.sourceStoreId && inv.productId === targetCase.productId
          ? { ...inv, availableStock: inv.availableStock + targetCase.quantity, committedStock: Math.max(0, inv.committedStock - targetCase.quantity) }
          : inv
      ));
    }

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

    if (targetCase.caseType === 'omo_fulfillment' && targetCase.status === 'omo_pending') {
      const now = new Date().toLocaleString('zh-TW');
      setCases((prev) => prev.map((c) => c.id === caseId ? {
        ...c, sourceConfirmed: true, sourceConfirmedAt: now, targetConfirmed: true,
        status: 'both_confirmed' as const, pendingStoreId: c.sourceStoreId, updatedAt: now,
        remarks: '履約門市已接單，庫存維持預留並進入備貨。'
      } : c));
      addAuditLog('STORE_APPROVE', `OMO 門市接單 ${targetCase.caseNumber}`,
        `${stores.find(s => s.id === targetCase.sourceStoreId)?.name} 已接受 ${targetCase.orderNumber} 代出貨，開始備貨。`,
        targetCase.caseNumber, 'success');
      setSelectedCaseForDetail((prev) => prev?.id === caseId ? { ...prev, sourceConfirmed: true, sourceConfirmedAt: now, status: 'both_confirmed' } : prev);
      return;
    }

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
        if (targetCase.caseType !== 'omo_fulfillment' && inv.storeId === targetCase.targetStoreId && inv.productId === targetCase.productId) {
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
        if (targetCase.caseType !== 'omo_fulfillment' && inv.storeId === targetCase.targetStoreId && inv.productId === targetCase.productId) {
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
      targetCase.caseType === 'omo_fulfillment'
        ? `OMO 訂單 ${targetCase.orderNumber} 已送達顧客，履約流程完成。`
        : `調入門市已驗收商品無誤並上架，調撥流程正式結束。`,
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

  const handleChangeUserRole = (role: UserRole) => {
    setUserRole(role);
    setViewScope(role === 'admin' ? 'all' : role);
  };

  // Calculate Metrics
  const aiPendingCount = cases.filter((c) => c.status === 'ai_pending').length;
  const inProgressCount = cases.filter(
    (c) => c.status === 'omo_pending' || c.status === 'waiting_source' || c.status === 'waiting_target'
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
        (c.status === 'omo_pending' && c.sourceStoreId === s.id) ||
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
    <div id="kava-app-root" className="flex flex-col min-[900px]:flex-row min-h-screen bg-[#F8F7F4] text-[#1E252B] font-sans overflow-x-hidden">
      {/* Dark Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        userRole={userRole}
        viewScope={viewScope}
        stores={stores}
        pendingCount={inProgressCount}
        aiCount={aiPendingCount}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <TopNavbar
          currentTab={currentTab}
          userRole={userRole}
          onChangeUserRole={handleChangeUserRole}
          viewScope={viewScope}
          onChangeViewScope={setViewScope}
          stores={stores}
          onOpenExportModal={() => setIsExportModalOpen(true)}
          onRefreshData={handleRefresh}
          isRefreshing={isRefreshing}
        />

        {/* Dynamic Tab Views */}
        <main className="flex-1 pb-24 min-[900px]:pb-16 min-w-0">
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
              onOpenExportModal={() => setIsExportModalOpen(true)}
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
              onStartImprovement={handleStartAIImprovement}
              onEvaluateImprovement={handleEvaluateAIImprovement}
              onRejectRecommendation={handleRejectTransfer}
              onSelectCase={setSelectedCaseForDetail}
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
            />
          )}

          {currentTab === 'history' && (
            <AuditLogView logs={logs} />
          )}
        </main>
      </div>

      {/* Export & Google Drive Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        metrics={dashboardMetrics}
        cases={cases}
        stores={stores}
        inventory={inventory}
        products={products}
        logs={logs}
        onLogExportAction={handleLogExportAction}
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

