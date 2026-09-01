import React, { useState, useEffect } from 'react';
import { 
  X, 
  Download, 
  FileSpreadsheet, 
  CheckCircle2, 
  Calendar, 
  Layers, 
  Sparkles, 
  TrendingUp, 
  ArrowLeftRight, 
  ShieldAlert, 
  Clock, 
  Building2, 
  FileCheck,
  Package,
  History,
  CheckSquare,
  Square
} from 'lucide-react';
import { 
  TransferCase, 
  Store, 
  StoreInventory, 
  Product, 
  AuditLog, 
  DashboardMetrics, 
  ViewScope 
} from '../types';
import { 
  downloadCSV, 
  generateMultiSectionReportCSV,
  generateDashboardSummaryCSV, 
  generateInventoryWarningCSV,
  generateAIEffectivenessCSV,
  generateTransferFlowCSV,
  generateTransferCasesCSV, 
  generateInventoryMatrixCSV, 
  generateAuditLogsCSV 
} from '../services/csvExport';

export type PresetPeriod = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'custom';

export interface ReportOption {
  key: string;
  name: string;
  code: string;
  recommendedFor: string;
  description: string;
  icon: any;
}

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  metrics: DashboardMetrics;
  cases: TransferCase[];
  stores: Store[];
  inventory: StoreInventory[];
  products: Product[];
  logs: AuditLog[];
  onLogExportAction: (reportName: string, destination: 'LOCAL_CSV' | 'GOOGLE_DRIVE') => void;
  initialPreset?: PresetPeriod;
  initialSelectedReports?: string[];
  contextTitle?: string;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  metrics,
  cases,
  stores,
  inventory,
  products,
  logs,
  onLogExportAction,
  initialPreset = 'monthly',
  initialSelectedReports,
  contextTitle,
}) => {
  // Available report types
  const reportOptions: ReportOption[] = [
    {
      key: 'health',
      name: '各門市庫存健康與 KPI 分析',
      code: 'RPT-01',
      recommendedFor: '日報 / 週報',
      description: '今日各門市在庫量、正常/過量/低庫存/滯銷百分比結構與失衡成因歸納。',
      icon: Layers,
    },
    {
      key: 'ai_effectiveness',
      name: 'AI 調貨轉化成效與趨勢',
      code: 'RPT-02',
      recommendedFor: '月報 / 季報',
      description: 'AI 推薦漏斗（建議→接受→完成）、調貨後 14 天內銷售轉化率與近 5 月成效趨勢。',
      icon: TrendingUp,
    },
    {
      key: 'inventory_risk',
      name: '庫存風險與缺貨警示清單',
      code: 'RPT-03',
      recommendedFor: '日報 (緊急處理)',
      description: '低庫存即將斷貨 (DOS < 2天) 與嚴重滯銷 SKU 清單及處置建議。',
      icon: ShieldAlert,
    },
    {
      key: 'transfer_cases',
      name: '跨店調撥工單明細官方台帳',
      code: 'RPT-04',
      recommendedFor: '月報 (對帳盤點)',
      description: '完整記錄每筆調撥單之建立時間、雙店店長確認時間、物流單號與點收紀錄。',
      icon: FileCheck,
    },
    {
      key: 'transfer_flow',
      name: '跨店庫存流向與物流關係矩陣',
      code: 'RPT-05',
      recommendedFor: '月報 (物流結算)',
      description: '各門市點對點調運件數矩陣與流向分析，供月結運費與商圈供需偏好檢討。',
      icon: ArrowLeftRight,
    },
    {
      key: 'inventory_matrix',
      name: '全通路門市庫存與承諾矩陣',
      code: 'RPT-06',
      recommendedFor: '月報 (庫存總檢)',
      description: '全門市所有 SKU 之在架可用、客訂承諾、在途調入與安全庫存水位。',
      icon: Package,
    },
    {
      key: 'audit_logs',
      name: '系統操作歷程與內控稽核日誌',
      code: 'RPT-07',
      recommendedFor: '季報 (內控稽核)',
      description: '全季度所有人員操作行為、AI 推薦採用、店長授權簽核與報表下載紀錄。',
      icon: History,
    },
  ];

  const [preset, setPreset] = useState<PresetPeriod>(initialPreset);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedReports, setSelectedReports] = useState<string[]>(
    initialSelectedReports || ['health', 'ai_effectiveness', 'inventory_risk', 'transfer_cases']
  );
  const [selectedScope, setSelectedScope] = useState<ViewScope>('all');
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  // Helper to calculate preset dates
  const calculatePresetDates = (p: PresetPeriod) => {
    const today = new Date(2026, 8, 1); // 2026-09-01 baseline
    const formatDate = (d: Date) => {
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    };

    const end = formatDate(today);
    let start = end;

    if (p === 'daily') {
      start = end;
    } else if (p === 'weekly') {
      const w = new Date(today);
      w.setDate(w.getDate() - 6);
      start = formatDate(w);
    } else if (p === 'monthly') {
      const m = new Date(today);
      m.setDate(m.getDate() - 29);
      start = formatDate(m);
    } else if (p === 'quarterly') {
      const q = new Date(today);
      q.setDate(q.getDate() - 89);
      start = formatDate(q);
    }

    return { start, end };
  };

  // Sync preset on initial open or change
  useEffect(() => {
    if (initialSelectedReports && initialSelectedReports.length > 0) {
      setSelectedReports(initialSelectedReports);
    }
  }, [initialSelectedReports]);

  useEffect(() => {
    if (preset !== 'custom') {
      const { start, end } = calculatePresetDates(preset);
      setStartDate(start);
      setEndDate(end);
    }
  }, [preset]);

  if (!isOpen) return null;

  const handlePresetChange = (newPreset: PresetPeriod) => {
    setPreset(newPreset);
    if (newPreset !== 'custom') {
      const { start, end } = calculatePresetDates(newPreset);
      setStartDate(start);
      setEndDate(end);
    }
  };

  const handleToggleReport = (key: string) => {
    setSelectedReports((prev) => {
      if (prev.includes(key)) {
        return prev.filter((k) => k !== key);
      } else {
        return [...prev, key];
      }
    });
  };

  const handleSelectAll = () => {
    setSelectedReports(reportOptions.map((r) => r.key));
  };

  const handleClearAll = () => {
    setSelectedReports([]);
  };

  // Filter cases & inventory based on selected scope
  const scopedCases = cases.filter((c) => {
    if (selectedScope === 'all') return true;
    return c.sourceStoreId === selectedScope || c.targetStoreId === selectedScope;
  });

  const scopedInventory = inventory.filter((inv) => {
    if (selectedScope === 'all') return true;
    return inv.storeId === selectedScope;
  });

  const getScopeName = () => {
    if (selectedScope === 'all') return '全通路 (全部門市)';
    const s = stores.find((st) => st.id === selectedScope);
    return s ? `${s.name} (${s.code})` : selectedScope;
  };

  const getPresetLabel = () => {
    switch (preset) {
      case 'daily':
        return '今日 (日報)';
      case 'weekly':
        return '近 7 天 (週報)';
      case 'monthly':
        return '近 30 天 (月報)';
      case 'quarterly':
        return '近 90 天 (季報)';
      default:
        return '自訂統計區間';
    }
  };

  const handleDownload = () => {
    if (selectedReports.length === 0) return;

    // Format filename
    const sTag = startDate.replace(/-/g, '');
    const eTag = endDate.replace(/-/g, '');
    const filename = `KAVA_營運分析報表_${sTag}_${eTag}.csv`;

    const content = generateMultiSectionReportCSV({
      selectedReports,
      startDate,
      endDate,
      presetLabel: getPresetLabel(),
      scopeLabel: getScopeName(),
      metrics,
      cases: scopedCases,
      stores,
      inventory: scopedInventory,
      products,
      logs,
    });

    downloadCSV(content, filename);
    onLogExportAction(filename, 'LOCAL_CSV');
    setDownloadSuccess(`已成功產出並下載「${filename}」 (包含 ${selectedReports.length} 份勾選報表)`);
    setTimeout(() => {
      setDownloadSuccess(null);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in-50">
      <div 
        id="export-modal-container"
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-[#E5E7EB] flex flex-col max-h-[90vh] overflow-hidden"
      >
        {/* Modal Header */}
        <div className="bg-[#181C20] px-6 py-4.5 text-white flex items-center justify-between border-b border-[#2D353F]">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-[#FAF6EE] text-[#977334] rounded-lg">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-wider font-bold bg-[#C5A059] text-white px-2 py-0.5 rounded-full">
                  CSV 匯出
                </span>
                <span className="text-xs text-[#9FA9B7]">內嵌 UTF-8 BOM 繁中相容格式</span>
              </div>
              <h3 className="text-lg font-bold text-white font-serif-heading">
                {contextTitle ? `匯出報表：${contextTitle}` : '匯出營運分析報表'}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#9CA3AF] hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Success Notification Alert */}
          {downloadSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex items-center gap-2.5 text-emerald-800 text-xs font-semibold shadow-sm animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{downloadSuccess}</span>
            </div>
          )}

          {/* Section 1: 日期區間與門市範圍 */}
          <div className="bg-[#F9FAFB] rounded-xl p-4 border border-[#E5E7EB] space-y-3.5">
            <div className="text-xs font-bold text-[#1F2937] flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#C5A059]" />
                <span>1. 設定統計週期與日期區間</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              {/* Preset Period Dropdown */}
              <div className="sm:col-span-4">
                <label className="block text-[11px] font-medium text-[#6B7280] mb-1">
                  週期快捷下拉選單
                </label>
                <select
                  value={preset}
                  onChange={(e) => handlePresetChange(e.target.value as PresetPeriod)}
                  className="w-full bg-white border border-[#D1D5DB] rounded-lg px-3 py-2 text-xs text-[#1F2937] font-medium focus:ring-2 focus:ring-[#C5A059] focus:outline-none shadow-xs"
                >
                  <option value="daily">📅 今日 (日報)</option>
                  <option value="weekly">📅 近 7 天 (週報)</option>
                  <option value="monthly">📊 近 30 天 (月報)</option>
                  <option value="quarterly">📈 近 90 天 (季報)</option>
                  <option value="custom">⚙️ 自訂起訖區間</option>
                </select>
              </div>

              {/* Start Date */}
              <div className="sm:col-span-4">
                <label className="block text-[11px] font-medium text-[#6B7280] mb-1">
                  起始日期
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setPreset('custom');
                  }}
                  className="w-full bg-white border border-[#D1D5DB] rounded-lg px-3 py-1.5 text-xs text-[#1F2937] font-mono focus:ring-2 focus:ring-[#C5A059] focus:outline-none shadow-xs"
                />
              </div>

              {/* End Date */}
              <div className="sm:col-span-4">
                <label className="block text-[11px] font-medium text-[#6B7280] mb-1">
                  截止日期
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setPreset('custom');
                  }}
                  className="w-full bg-white border border-[#D1D5DB] rounded-lg px-3 py-1.5 text-xs text-[#1F2937] font-mono focus:ring-2 focus:ring-[#C5A059] focus:outline-none shadow-xs"
                />
              </div>
            </div>

            {/* Scope Selection */}
            <div className="pt-2 border-t border-[#E5E7EB] flex items-center justify-between">
              <div className="text-[11px] text-[#6B7280] flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-[#6B7280]" />
                <span>門市統計範圍：</span>
              </div>
              <select
                value={selectedScope}
                onChange={(e) => setSelectedScope(e.target.value as ViewScope)}
                className="bg-white border border-[#D1D5DB] rounded-lg px-3 py-1 text-xs text-[#1F2937] font-medium focus:ring-2 focus:ring-[#C5A059] focus:outline-none"
              >
                <option value="all">全通路 (全部門市彙整)</option>
                {stores.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Section 2: 選擇要匯出的報表項目 (Checkboxes) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-[#1F2937] flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#C5A059]" />
                <span>2. 勾選欲包含之報表項目（支援多選合併匯出）</span>
              </div>
              <div className="flex items-center space-x-2 text-xs">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-[#8C6D3B] hover:underline font-medium text-[11px]"
                >
                  全選
                </button>
                <span className="text-[#D1D5DB]">|</span>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="text-[#6B7280] hover:underline font-medium text-[11px]"
                >
                  清除
                </button>
              </div>
            </div>

            {/* Checkbox Items List */}
            <div className="grid grid-cols-1 gap-2">
              {reportOptions.map((opt) => {
                const Icon = opt.icon;
                const isChecked = selectedReports.includes(opt.key);
                return (
                  <div
                    key={opt.key}
                    onClick={() => handleToggleReport(opt.key)}
                    className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none ${
                      isChecked
                        ? 'bg-[#FAF7F0] border-[#C5A059] shadow-xs'
                        : 'bg-white border-[#E5E7EB] hover:border-[#D1D5DB]'
                    }`}
                  >
                    <div className="pt-0.5">
                      {isChecked ? (
                        <CheckSquare className="w-4 h-4 text-[#8C6D3B] fill-[#8C6D3B]/10" />
                      ) : (
                        <Square className="w-4 h-4 text-[#9CA3AF]" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#1F2937]">
                            {opt.name}
                          </span>
                          <span className="text-[10px] font-mono font-semibold text-[#6B7280] bg-white px-1.5 py-0.2 rounded border border-[#E5E7EB]">
                            {opt.code}
                          </span>
                        </div>
                        <span className="text-[10px] font-medium text-[#8C6D3B] bg-white/80 px-2 py-0.5 rounded-full border border-[#EADBBD]">
                          {opt.recommendedFor}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#6B7280] leading-relaxed">
                        {opt.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-[#F9FAFB] px-6 py-4 border-t border-[#E5E7EB] flex items-center justify-between">
          <div className="text-xs text-[#6B7280]">
            已勾選 <strong className="text-[#1F2937] font-bold">{selectedReports.length}</strong> / {reportOptions.length} 項報表
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[#D1D5DB] rounded-xl text-xs font-medium text-[#4B5563] hover:bg-white transition-colors"
            >
              取消
            </button>

            <button
              type="button"
              onClick={handleDownload}
              disabled={selectedReports.length === 0}
              className="flex items-center space-x-2 bg-[#8C6D3B] hover:bg-[#785D31] text-white px-5 py-2 rounded-xl text-xs font-bold shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-3.5 h-3.5" />
              <span>立即下載報表 (CSV)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
