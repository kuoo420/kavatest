import { TransferCase, StoreInventory, Store, Product, AuditLog, DashboardMetrics } from '../types';

/**
 * Prepend UTF-8 BOM so Excel opens Traditional Chinese characters correctly without garbled text
 */
export function downloadCSV(csvContent: string, fileName: string) {
  const bom = '\uFEFF';
  const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Format CSV rows escaping commas and quotes
 */
function toCsvRow(items: (string | number | boolean | undefined | null)[]): string {
  return items
    .map((item) => {
      if (item === null || item === undefined) return '""';
      const str = String(item).replace(/"/g, '""');
      return `"${str}"`;
    })
    .join(',');
}

/**
 * 1. 營運摘要 CSV 報表
 */
export function generateDashboardSummaryCSV(
  metrics: DashboardMetrics,
  stores: Store[],
  cases: TransferCase[]
): string {
  const rows: string[] = [];

  rows.push(toCsvRow(['KAVA 跨店智慧調撥 SaaS 系統 - 營運摘要報表']));
  rows.push(toCsvRow(['匯出時間', new Date().toLocaleString('zh-TW')]));
  rows.push(toCsvRow(['系統版本', 'V1.2 / Fusion V2']));
  rows.push('');

  rows.push(toCsvRow(['【營運判讀】', '南西店庫存過量偏高；一中店與西門店存在即將缺貨 SKU。']));
  rows.push('');

  rows.push(toCsvRow(['【6 大關鍵 KPI 指標】']));
  rows.push(toCsvRow(['指標名稱', '數值', '趨勢/狀態', '說明']));
  rows.push(toCsvRow(['總庫存量', '12,480', '↑ 3.2%', '全通路現有在架總件數']));
  rows.push(toCsvRow(['低庫存 SKU', '32', '需注意', '庫存水位低於警戒之商品款數']));
  rows.push(toCsvRow(['滯銷 SKU', '186', '↓ 12.5%', '超過 30 天未產生流轉之商品款數']));
  rows.push(toCsvRow(['庫存失衡 SKU', '74', '↓ 8.6%', '跨店需求差異導致之失衡款數']));
  rows.push(toCsvRow(['AI 待處理建議', '28', '待確認', '演算法產出待店家採用之案件數']));
  rows.push(toCsvRow(['AI 調貨有效率', '84.9%', '↑ 3.9%', '調貨完成後 14 天內產生銷售比例']));
  rows.push('');

  rows.push(toCsvRow(['【各門市庫存健康度分佈】']));
  rows.push(toCsvRow(['門市編號', '門市名稱', '正常比率', '過量比率', '低庫存比率', '滯銷比率']));
  rows.push(toCsvRow(['S01', '一中店', '72%', '12%', '10%', '6%']));
  rows.push(toCsvRow(['S02', '南西店', '55%', '25%', '8%', '12%']));
  rows.push(toCsvRow(['S03', '西門店', '79%', '8%', '8%', '5%']));
  rows.push(toCsvRow(['S04', '中山店', '74%', '11%', '7%', '8%']));
  rows.push(toCsvRow(['S05', '官網/總倉', '81%', '9%', '4%', '6%']));
  rows.push('');

  rows.push(toCsvRow(['【庫存失衡原因歸納】']));
  rows.push(toCsvRow(['原因分類', '佔比 (%)']));
  rows.push(toCsvRow(['銷售下降', '38%']));
  rows.push(toCsvRow(['門市需求差異', '27%']));
  rows.push(toCsvRow(['補貨過量', '18%']));
  rows.push(toCsvRow(['新品需求誤判', '10%']));
  rows.push(toCsvRow(['季節因素', '7%']));

  return rows.join('\r\n');
}

/**
 * 2. 庫存警示 CSV (低庫存／即將缺貨風險排行)
 */
export function generateInventoryWarningCSV(
  inventory: StoreInventory[],
  stores: Store[],
  products: Product[]
): string {
  const rows: string[] = [];

  rows.push(toCsvRow(['KAVA 跨店智慧調撥 SaaS 系統 - 庫存警示與風險排行報表']));
  rows.push(toCsvRow(['匯出時間', new Date().toLocaleString('zh-TW')]));
  rows.push('');

  rows.push(toCsvRow(['【低庫存／即將缺貨風險排行清單】']));
  rows.push(toCsvRow(['商品SKU', '商品名稱', '門市代碼', '門市名稱', '目前庫存', '近7日銷量', '預估售罄天數', '風險等級', '處置建議']));
  
  const riskList = [
    { sku: 'EAR-102', name: '法式極簡流線耳環', store: '一中店', stock: 1, sales: 8, eta: '<1天', status: '立即處理 (嚴重缺貨)', rec: '由南西店調出 4 件' },
    { sku: 'NEK-231', name: '星芒碎鑽鎖骨項鍊', store: '南西店', stock: 1, sales: 5, eta: '1.4天', status: '高風險 (警戒水位)', rec: '由一中店調出 3 件' },
    { sku: 'RNG-821', name: '925純銀戒 (典雅銀)', store: '西門店', stock: 0, sales: 6, eta: '已缺貨', status: '立即處理 (零庫存)', rec: '由官網/總倉調出 5 件' },
    { sku: 'BRC-144', name: '復古編織珍珠手鍊', store: '中山店', stock: 2, sales: 4, eta: '3.5天', status: '注意 (偏低水位)', rec: '由官網/總倉調出 3 件' },
  ];

  riskList.forEach(r => {
    rows.push(toCsvRow([r.sku, r.name, '-', r.store, r.stock, r.sales, r.eta, r.status, r.rec]));
  });

  rows.push('');
  rows.push(toCsvRow(['【全門市即時庫存現況】']));
  rows.push(toCsvRow(['門市代碼', '門市名稱', '商品SKU', '商品名稱', '分類', '在架可用量', '承諾預留量', '在途調入量', '安全庫存線', '日均銷量', '可售天數']));
  
  inventory.forEach(item => {
    const s = stores.find(st => st.id === item.storeId);
    const p = products.find(pr => pr.id === item.productId);
    rows.push(toCsvRow([
      s?.code || item.storeId,
      s?.name || item.storeId,
      p?.sku || item.productId,
      p?.name || item.productId,
      p?.category || '-',
      item.availableStock,
      item.committedStock,
      item.incomingStock,
      item.safetyStock,
      item.dailySalesRate,
      item.daysOfSupply.toFixed(1)
    ]));
  });

  return rows.join('\r\n');
}

/**
 * 3. AI 調貨成效 CSV (漏斗與有效率趨勢)
 */
export function generateAIEffectivenessCSV(cases: TransferCase[]): string {
  const rows: string[] = [];

  rows.push(toCsvRow(['KAVA 跨店智慧調撥 SaaS 系統 - AI 調貨成效與轉化率報表']));
  rows.push(toCsvRow(['匯出時間', new Date().toLocaleString('zh-TW')]));
  rows.push('');

  rows.push(toCsvRow(['【AI 調貨成效漏斗分析】']));
  rows.push(toCsvRow(['階段階段名稱', '案件筆數', '階段轉化率', '累積轉化率']));
  rows.push(toCsvRow(['1. AI 演算建議產生', 328, '100.0%', '100.0%']));
  rows.push(toCsvRow(['2. 門市決定接受', 267, '81.4%', '81.4%']));
  rows.push(toCsvRow(['3. 雙店核准並完成調撥', 251, '94.0%', '76.5%']));
  rows.push(toCsvRow(['4. 調貨後14天內成功銷售', 213, '84.9%', '64.9%']));
  rows.push('');

  rows.push(toCsvRow(['【近 5 個月 AI 調貨有效率趨勢】']));
  rows.push(toCsvRow(['月份', '有效率 (%)', '備註']));
  rows.push(toCsvRow(['4月', '76.0%', '初始演算模型上線']));
  rows.push(toCsvRow(['5月', '79.0%', '加入商圈顧客偏好特徵']));
  rows.push(toCsvRow(['6月', '82.0%', '優化雙店確認耗時']));
  rows.push(toCsvRow(['7月', '81.0%', '受颱風天候微幅影響']));
  rows.push(toCsvRow(['8月', '84.9%', '達到歷史最佳有效轉化率']));

  return rows.join('\r\n');
}

/**
 * 4. 調貨流向 CSV (跨店調撥關係與明細)
 */
export function generateTransferFlowCSV(cases: TransferCase[], stores: Store[]): string {
  const rows: string[] = [];

  rows.push(toCsvRow(['KAVA 跨店智慧調撥 SaaS 系統 - 跨店調撥流向與關聯分析報表']));
  rows.push(toCsvRow(['匯出時間', new Date().toLocaleString('zh-TW')]));
  rows.push('');

  rows.push(toCsvRow(['【最近 30 天主要跨店調撥關係】']));
  rows.push(toCsvRow(['來源門市', '目的門市', '調撥總件數', '主要調貨成因']));
  rows.push(toCsvRow(['南西店 (S02)', '一中店 (S01)', '36 件', '南西過量庫存支援一中熱銷缺貨']));
  rows.push(toCsvRow(['官網/總倉 (S05)', '中山店 (S04)', '21 件', '中央總倉配發週末專案展銷補貨']));
  rows.push(toCsvRow(['西門店 (S03)', '南西店 (S02)', '18 件', '同商圈微調客訂轉單支援']));
  rows.push('');

  rows.push(toCsvRow(['【全工單調撥流向全紀錄】']));
  rows.push(toCsvRow([
    '工單編號',
    '商品名稱',
    '商品SKU',
    '調撥數量',
    '調出門市',
    '調入門市',
    '當前狀態',
    '調出店核准',
    '調入店核准',
    '物流單號',
    '調貨原因',
    '建立時間'
  ]));

  cases.forEach(c => {
    const srcStore = stores.find(s => s.id === c.sourceStoreId);
    const tgtStore = stores.find(s => s.id === c.targetStoreId);
    rows.push(toCsvRow([
      c.caseNumber,
      c.productName,
      c.productSku,
      c.quantity,
      srcStore?.name || c.sourceStoreId,
      tgtStore?.name || c.targetStoreId,
      c.status,
      c.sourceConfirmed ? '已核准' : '待確認',
      c.targetConfirmed ? '已核准' : '待確認',
      c.courierNumber || '-',
      c.transferReason,
      c.createdAt
    ]));
  });

  return rows.join('\r\n');
}

/**
 * 5. 調撥工單詳細清單 CSV
 */
export function generateTransferCasesCSV(cases: TransferCase[], stores: Store[]): string {
  const rows: string[] = [];
  rows.push(toCsvRow([
    '工單編號',
    '商品名稱',
    '商品SKU',
    '調撥數量',
    '調出門市編號',
    '調出門市',
    '調入門市編號',
    '調入門市',
    '當前狀態',
    '待辦門市',
    '來源類型',
    'AI信心分',
    '調出店確認狀態',
    '調出店確認時間',
    '調入店確認狀態',
    '調入店確認時間',
    '物流單號',
    '調撥原因',
    '建立時間',
    '最後更新時間',
    '備註說明'
  ]));

  cases.forEach((c) => {
    const srcStore = stores.find((s) => s.id === c.sourceStoreId);
    const tgtStore = stores.find((s) => s.id === c.targetStoreId);
    const pendingStore = stores.find((s) => s.id === c.pendingStoreId);

    let statusText = '未知';
    if (c.status === 'ai_pending') statusText = 'AI 建議待採用';
    else if (c.status === 'waiting_source') statusText = '等待調出店確認';
    else if (c.status === 'waiting_target') statusText = '等待調入店確認';
    else if (c.status === 'both_confirmed') statusText = '雙方已確認(待發貨)';
    else if (c.status === 'in_transit') statusText = '調撥運送中';
    else if (c.status === 'completed') statusText = '已完成調撥入庫';
    else if (c.status === 'rejected') statusText = '已拒絕/已取消';

    rows.push(toCsvRow([
      c.caseNumber,
      c.productName,
      c.productSku,
      c.quantity,
      srcStore?.code || c.sourceStoreId,
      srcStore?.name || c.sourceStoreId,
      tgtStore?.code || c.targetStoreId,
      tgtStore?.name || c.targetStoreId,
      statusText,
      pendingStore?.name || '-',
      c.isAiGenerated ? 'AI演算法推薦' : '門市人工申請',
      c.aiScore ? `${c.aiScore}%` : 'N/A',
      c.sourceConfirmed ? '已核准' : '待確認',
      c.sourceConfirmedAt || '-',
      c.targetConfirmed ? '已核准' : '待確認',
      c.targetConfirmedAt || '-',
      c.courierNumber || '-',
      c.transferReason,
      c.createdAt,
      c.updatedAt,
      c.remarks || '-'
    ]));
  });

  return rows.join('\r\n');
}

/**
 * 6. 門市庫存與承諾分析矩陣 CSV
 */
export function generateInventoryMatrixCSV(
  inventory: StoreInventory[],
  stores: Store[],
  products: Product[]
): string {
  const rows: string[] = [];
  rows.push(toCsvRow([
    '門市代碼',
    '門市名稱',
    '商品SKU',
    '商品名稱',
    '商品分類',
    '單價 (NT$)',
    '在架可用庫存',
    '承諾/預留量',
    '在途調入量',
    '安全庫存警戒線',
    '日均銷量 (件/日)',
    '預估可售天數 (Days)',
    '庫存健康度狀態'
  ]));

  inventory.forEach((item) => {
    const store = stores.find((s) => s.id === item.storeId);
    const prod = products.find((p) => p.id === item.productId);
    
    let health = '庫存健康';
    if (item.availableStock <= 0) {
      health = '嚴重缺貨 (🚨需調撥)';
    } else if (item.availableStock < item.safetyStock) {
      health = '低於安全水位 (⚠️警戒)';
    } else if (item.daysOfSupply > 14) {
      health = '庫存偏高 (可支援調出)';
    }

    rows.push(toCsvRow([
      store?.code || item.storeId,
      store?.name || item.storeId,
      prod?.sku || item.productId,
      prod?.name || item.productId,
      prod?.category || '-',
      prod?.price || 0,
      item.availableStock,
      item.committedStock,
      item.incomingStock,
      item.safetyStock,
      item.dailySalesRate,
      item.daysOfSupply.toFixed(1),
      health
    ]));
  });

  return rows.join('\r\n');
}

/**
 * 7. 操作歷程與稽核記錄 CSV
 */
export function generateAuditLogsCSV(logs: AuditLog[]): string {
  const rows: string[] = [];
  rows.push(toCsvRow([
    '記錄編號',
    '操作時間',
    '操作人員',
    '人員角色/職稱',
    '操作類別',
    '事件標題',
    '關聯工單/標的',
    '詳細內容說明',
    '狀態等級'
  ]));

  logs.forEach((log) => {
    rows.push(toCsvRow([
      log.id,
      log.timestamp,
      log.operator,
      log.roleTitle,
      log.actionType,
      log.title,
      log.targetId || '-',
      log.details,
      log.status
    ]));
  });

  return rows.join('\r\n');
}

