import React, { useState, useRef, useEffect } from 'react';
import { 
  ChevronDown, 
  Download, 
  CloudUpload,
  CheckCircle2,
  RefreshCw,
  SlidersHorizontal,
  Building2,
  UserCheck
} from 'lucide-react';
import { UserRole, ViewScope, Store, NavigationTab } from '../types';

interface TopNavbarProps {
  currentTab: NavigationTab;
  userRole: UserRole;
  onChangeUserRole: (role: UserRole) => void;
  viewScope: ViewScope;
  onChangeViewScope: (scope: ViewScope) => void;
  stores: Store[];
  onOpenExportModal: () => void;
  onRefreshData?: () => void;
  isRefreshing?: boolean;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  currentTab,
  userRole,
  onChangeUserRole,
  viewScope,
  onChangeViewScope,
  stores,
  onOpenExportModal,
  onRefreshData,
  isRefreshing = false,
}) => {
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [scopeDropdownOpen, setScopeDropdownOpen] = useState(false);

  const roleRef = useRef<HTMLDivElement>(null);
  const scopeRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (roleRef.current && !roleRef.current.contains(event.target as Node)) {
        setRoleDropdownOpen(false);
      }
      if (scopeRef.current && !scopeRef.current.contains(event.target as Node)) {
        setScopeDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getTabTitle = () => {
    switch (currentTab) {
      case 'dashboard':
        return '營運儀表板';
      case 'ai_recommendations':
        return 'AI 庫存改善建議';
      case 'transfers':
        return '調貨申請與工單管理';
      case 'inventory':
        return '全通路庫存與承諾分析';
      case 'history':
        return '系統操作歷程與稽核軌跡';
      default:
        return '營運儀表板';
    }
  };

  const getRoleLabel = (role: UserRole) => {
    if (role === 'admin') return '總管理者';
    const s = stores.find(store => store.id === role);
    return s ? s.name : role;
  };

  const getScopeLabel = (scope: ViewScope) => {
    if (scope === 'all') return '全通路';
    const s = stores.find(store => store.id === scope);
    return s ? s.name : scope;
  };

  const getAvatarChar = () => {
    if (userRole === 'admin') return '總';
    const s = stores.find(store => store.id === userRole);
    return s ? s.region.charAt(0) : '員';
  };

  return (
    <header 
      id="kava-top-navbar"
      className="bg-white border-b border-[#E7E9ED] px-4 sm:px-6 lg:px-8 py-3 flex flex-col xl:flex-row xl:items-center justify-between gap-3 sticky top-0 z-30 shadow-[0_1px_3px_rgba(0,0,0,0.02)]"
    >
      {/* Left Title & Breadcrumbs */}
      <div className="w-full xl:w-auto min-w-0">
        <div className="text-xs text-[#7B8694] font-medium flex items-center gap-1.5 mb-0.5">
          <span>{getRoleLabel(userRole)}</span>
          <span className="text-[#C2C9D1]">|</span>
          <span>目前檢視：{getScopeLabel(viewScope)}</span>
        </div>
        <h2 className="text-base sm:text-xl font-bold text-[#1F2633] tracking-tight font-serif-heading truncate">
          {getTabTitle()}
        </h2>
      </div>

      {/* Right Controls */}
      <div className="w-full xl:w-auto flex flex-wrap items-center gap-2 sm:gap-3.5 overflow-visible pb-0.5 xl:pb-0">
        {/* Central Data Sync Status Badge */}
        <div className="hidden lg:flex items-center space-x-2 text-xs font-medium text-[#1E293B] bg-[#F4F6F8] px-3 py-1.5 rounded-full border border-[#E2E6EC]">
          <span className="h-2 w-2 rounded-full bg-[#10B981] animate-pulse"></span>
          <span>中央資料已同步</span>
          {onRefreshData && (
            <button
              onClick={onRefreshData}
              title="即時重新整理"
              className="ml-1 text-[#64748B] hover:text-[#0F172A] transition-colors"
            >
              <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin text-[#C5A059]' : ''}`} />
            </button>
          )}
        </div>

        {/* User Role Selector Pill */}
        <div className="relative" ref={roleRef}>
          <button
            id="role-selector-btn"
            onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
            className="shrink-0 flex items-center space-x-2 bg-white hover:bg-[#F9FAFB] text-[#374151] border border-[#D5DAE1] rounded-lg px-3 py-1.5 text-xs font-medium transition-all shadow-sm"
          >
            <span className="text-[#6B7280]">使用者角色</span>
            <span className="font-semibold text-[#1F2937]">{getRoleLabel(userRole)}</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#6B7280]" />
          </button>

          {roleDropdownOpen && (
            <div className="absolute right-0 mt-1.5 w-64 bg-white rounded-xl shadow-xl border border-[#E5E7EB] py-1.5 z-50 animate-in fade-in-50 duration-100">
              <div className="px-3 py-1.5 text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wider border-b border-gray-100 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-[#C5A059]" />
                切換模擬角色
              </div>
              <button
                onClick={() => {
                  onChangeUserRole('admin');
                  setRoleDropdownOpen(false);
                }}
                className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-[#F9FAFB] ${
                  userRole === 'admin' ? 'bg-[#FAF6EE] text-[#977334] font-bold' : 'text-[#374151]'
                }`}
              >
                <span>總管理者 (全通路監控)</span>
                {userRole === 'admin' && <span className="text-[10px] bg-[#C5A059]/20 text-[#846328] px-1.5 py-0.5 rounded">目前</span>}
              </button>
              <div className="my-1 border-t border-gray-100"></div>
              {stores.map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    onChangeUserRole(s.id as UserRole);
                    setRoleDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-[#F9FAFB] ${
                    userRole === s.id ? 'bg-[#FAF6EE] text-[#977334] font-bold' : 'text-[#374151]'
                  }`}
                >
                  <div className="flex flex-col">
                    <span>{s.name}</span>
                    <span className="text-[10px] text-[#9CA3AF]">店長：{s.manager}</span>
                  </div>
                  {userRole === s.id && <span className="text-[10px] bg-[#C5A059]/20 text-[#846328] px-1.5 py-0.5 rounded">目前</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* View Scope Selector Pill */}
        <div className="relative" ref={scopeRef}>
          <button
            id="scope-selector-btn"
            onClick={() => setScopeDropdownOpen(!scopeDropdownOpen)}
            className="shrink-0 flex items-center space-x-2 bg-white hover:bg-[#F9FAFB] text-[#374151] border border-[#D5DAE1] rounded-lg px-3 py-1.5 text-xs font-medium transition-all shadow-sm"
          >
            <span className="text-[#6B7280]">檢視範圍</span>
            <span className="font-semibold text-[#1F2937]">{getScopeLabel(viewScope)}</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#6B7280]" />
          </button>

          {scopeDropdownOpen && (
            <div className="absolute right-0 mt-1.5 w-56 bg-white rounded-xl shadow-xl border border-[#E5E7EB] py-1.5 z-50">
              <div className="px-3 py-1.5 text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wider border-b border-gray-100 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-[#C5A059]" />
                篩選數據範圍
              </div>
              <button
                onClick={() => {
                  onChangeViewScope('all');
                  setScopeDropdownOpen(false);
                }}
                className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-[#F9FAFB] ${
                  viewScope === 'all' ? 'bg-[#FAF6EE] text-[#977334] font-bold' : 'text-[#374151]'
                }`}
              >
                <span>全通路 (合併檢視)</span>
                {viewScope === 'all' && <span className="text-[10px] text-[#846328]">✓</span>}
              </button>
              {stores.map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    onChangeViewScope(s.id as ViewScope);
                    setScopeDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-[#F9FAFB] ${
                    viewScope === s.id ? 'bg-[#FAF6EE] text-[#977334] font-bold' : 'text-[#374151]'
                  }`}
                >
                  <span>{s.name}</span>
                  {viewScope === s.id && <span className="text-[10px] text-[#846328]">✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* CSV & Google Drive Export Button */}
        <button
          id="btn-export-csv-modal"
          onClick={onOpenExportModal}
          className="shrink-0 flex items-center space-x-1.5 bg-[#8C6D3B] hover:bg-[#785D31] text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-all active:scale-95"
        >
          <Download className="w-3.5 h-3.5" />
          <span>匯出報表 / 雲端備份</span>
        </button>

        {/* User Avatar Circle */}
        <div 
          title={`當前登入身分：${getRoleLabel(userRole)}`}
          className="w-8 h-8 rounded-full bg-[#181C20] text-[#E8C683] flex items-center justify-center font-bold text-xs border border-[#C5A059] shadow-sm select-none"
        >
          {getAvatarChar()}
        </div>
      </div>
    </header>
  );
};

