import React, { useState } from 'react';
import { 
  RotateCcw, 
  Search, 
  Filter, 
  ShieldCheck, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  ArrowLeftRight, 
  Truck,
  Download,
  AlertTriangle
} from 'lucide-react';
import { AuditLog } from '../types';
import { PresetPeriod } from './ExportModal';

interface AuditLogViewProps {
  logs: AuditLog[];
  onOpenExportModal?: (preset?: PresetPeriod, selectedReports?: string[], contextTitle?: string) => void;
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({ logs, onOpenExportModal }) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredLogs = logs.filter((log) => {
    if (filterType !== 'all' && log.actionType !== filterType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        log.title.toLowerCase().includes(q) ||
        log.operator.toLowerCase().includes(q) ||
        log.details.toLowerCase().includes(q) ||
        (log.targetId && log.targetId.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const getActionBadge = (type: AuditLog['actionType']) => {
    switch (type) {
      case 'AI_ADOPT':
        return <span className="px-2 py-0.5 text-[11px] font-semibold rounded bg-[#FAF3E0] text-[#8C6A21] border border-[#EEDB9F]">AI 演算法</span>;
      case 'TRANSFER_CREATE':
        return <span className="px-2 py-0.5 text-[11px] font-semibold rounded bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]">發起調撥</span>;
      case 'STORE_APPROVE':
        return <span className="px-2 py-0.5 text-[11px] font-semibold rounded bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]">門市核准</span>;
      case 'DISPATCH':
        return <span className="px-2 py-0.5 text-[11px] font-semibold rounded bg-[#F5F3FF] text-[#6D28D9] border border-[#DDD6FE]">物流派送</span>;
      case 'RECEIVE':
        return <span className="px-2 py-0.5 text-[11px] font-semibold rounded bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0]">點收完成</span>;
      case 'EXPORT_CSV':
        return <span className="px-2 py-0.5 text-[11px] font-semibold rounded bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]">報表匯出</span>;
      case 'DRIVE_BACKUP':
        return <span className="px-2 py-0.5 text-[11px] font-semibold rounded bg-[#F0F9FF] text-[#0369A1] border border-[#BAE6FD]">雲端備份</span>;
      default:
        return <span className="px-2 py-0.5 text-[11px] font-semibold rounded bg-gray-100 text-gray-700">系統作業</span>;
    }
  };

  return (
    <div className="p-8 max-w-[1440px] mx-auto space-y-6 animate-in fade-in-50 duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1C232E] tracking-tight font-serif-heading">
            系統操作歷程與調撥稽核軌跡
          </h1>
          <p className="text-xs text-[#64748B] mt-1">
            完整記錄每筆 AI 推薦、門市確認授權、物流單號更新與報表匯出歷史。
          </p>
        </div>

        {onOpenExportModal && (
          <button
            onClick={() => onOpenExportModal('quarterly', ['audit_logs'], '系統操作歷程稽核日誌')}
            className="flex items-center space-x-1.5 bg-white hover:bg-[#FAF6EE] text-[#8C6D3B] border border-[#DED6CF] hover:border-[#C5A059] px-3.5 py-2.5 rounded-lg text-xs font-bold transition-all shadow-xs active:scale-95 shrink-0"
            title="下載系統操作與稽核日誌 (CSV)"
          >
            <Download className="w-3.5 h-3.5" />
            <span>下載歷程日誌</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-[#E8EAEE] p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 md:pb-0">
          {[
            { id: 'all', label: '全部歷程' },
            { id: 'AI_ADOPT', label: 'AI 演算法' },
            { id: 'TRANSFER_CREATE', label: '調撥發起' },
            { id: 'STORE_APPROVE', label: '門市核准' },
            { id: 'DISPATCH', label: '物流派送' },
            { id: 'EXPORT_CSV', label: '報表匯出' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
                filterType === tab.id
                  ? 'bg-[#1C2024] text-white'
                  : 'bg-[#F4F6F8] text-[#4B5563] hover:bg-[#EAEFF5]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64">
          <Search className="w-3.5 h-3.5 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="搜尋操作者、事件、工單..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#1F2937] placeholder-[#9CA3AF] focus:outline-none focus:ring-1 focus:ring-[#C5A059] focus:bg-white"
          />
        </div>
      </div>

      {/* Timeline List */}
      <div className="bg-white rounded-xl border border-[#E8EAEE] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-4">
        {filteredLogs.length === 0 ? (
          <div className="py-12 text-center text-[#94A3B8] text-xs">
            查無相關操作歷程記錄
          </div>
        ) : (
          <div className="relative border-l-2 border-[#E9ECF0] ml-3 pl-6 space-y-6">
            {filteredLogs.map((log) => (
              <div key={log.id} className="relative group">
                {/* Dot */}
                <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-[#C5A059] border-2 border-white shadow-xs"></div>

                <div className="bg-[#FAFBFD] border border-[#EBEFF5] rounded-xl p-4 hover:border-[#D4AF37]/40 transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center space-x-2.5">
                      {getActionBadge(log.actionType)}
                      <h4 className="text-sm font-bold text-[#1E293B]">{log.title}</h4>
                      {log.targetId && (
                        <span className="text-xs font-mono font-semibold text-[#64748B] bg-white px-2 py-0.5 rounded border border-[#E2E8F0]">
                          {log.targetId}
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-[#94A3B8] flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{log.timestamp}</span>
                    </div>
                  </div>

                  <p className="text-xs text-[#475569] leading-relaxed mt-1">
                    {log.details}
                  </p>

                  <div className="mt-2.5 pt-2 border-t border-[#EDF1F6] flex items-center justify-between text-[11px] text-[#8C98A6]">
                    <div>
                      <span>操作人：</span>
                      <span className="font-semibold text-[#334155]">{log.operator}</span>
                      <span className="mx-1 text-[#CBD5E1]">|</span>
                      <span>身分：{log.roleTitle}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
