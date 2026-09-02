import React from 'react';
import { 
  LayoutDashboard, 
  Sparkles, 
  PlusCircle,
  ArrowLeftRight, 
  Box, 
  RotateCcw,
  ShieldCheck,
  X,
  Radio
} from 'lucide-react';
import { NavigationTab, UserRole, ViewScope, Store } from '../types';

interface SidebarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  userRole: UserRole;
  viewScope: ViewScope;
  stores: Store[];
  pendingCount: number;
  aiCount: number;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  userRole,
  viewScope,
  stores,
  pendingCount,
  aiCount,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const getRoleDisplayName = () => {
    if (userRole === 'admin') return '總管理者';
    const store = stores.find(s => s.id === userRole);
    return store ? store.name : '門市人員';
  };

  const getScopeDisplayName = () => {
    if (viewScope === 'all') return '全通路';
    const store = stores.find(s => s.id === viewScope);
    return store ? store.shortName : '全通路';
  };

  const navItems = [
    {
      id: 'dashboard' as NavigationTab,
      label: '營運儀表板',
      icon: LayoutDashboard,
    },
    {
      id: 'ai_recommendations' as NavigationTab,
      label: 'AI 庫存處方與調撥',
      icon: Sparkles,
      badge: aiCount > 0 ? aiCount : undefined,
      badgeColor: 'bg-[#B0893F] text-white',
    },
    {
      id: 'manual_transfer' as NavigationTab,
      label: '人工跨店調貨',
      icon: PlusCircle,
    },
    {
      id: 'transfers' as NavigationTab,
      label: '調貨工單管核',
      icon: ArrowLeftRight,
      badge: pendingCount > 0 ? pendingCount : undefined,
      badgeColor: 'bg-[#967746] text-white',
    },
    {
      id: 'inventory' as NavigationTab,
      label: '全店庫存與承諾',
      icon: Box,
    },
    {
      id: 'history' as NavigationTab,
      label: '操作歷程稽核',
      icon: RotateCcw,
    },
  ];

  const handleItemClick = (tabId: NavigationTab) => {
    onSelectTab(tabId);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const sidebarContent = (
    <div className="flex flex-col justify-between h-full">
      {/* Top Brand & Role Container */}
      <div className="flex flex-col">
        {/* Brand Header */}
        <div className="p-5 sm:p-6 pb-4 sm:pb-5 flex items-center justify-between border-b border-[#20252A]/80">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#E3C27E] via-[#C5A059] to-[#997737] p-[1px] flex items-center justify-center shadow-md">
              <div className="w-full h-full bg-[#16181B] rounded-[7px] flex items-center justify-center">
                <span className="font-brand text-lg font-bold text-[#E5C482] tracking-wider">K</span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-brand text-base font-bold text-[#F3F4F6] tracking-[0.2em] leading-tight">
                K A V A
              </span>
              <span className="text-[10px] tracking-[0.18em] text-[#A68A56] font-medium uppercase mt-0.5">
                SMART TRANSFER
              </span>
            </div>
          </div>

          {/* Close button for mobile drawer */}
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 text-[#9EA6B0] hover:text-white rounded-lg hover:bg-[#23282E]"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Current Active Role Box */}
        <div className="px-4 sm:px-5 py-3 sm:py-4">
          <div className="bg-[#1C2024] rounded-lg p-3 sm:p-3.5 border border-[#2A3138] text-xs">
            <div className="text-[11px] text-[#7E8895] mb-1 font-medium">目前使用者角色</div>
            <div className="text-sm font-semibold text-[#F3F4F6] flex items-center justify-between">
              <span>{getRoleDisplayName()}</span>
              {userRole === 'admin' && (
                <ShieldCheck className="w-3.5 h-3.5 text-[#C5A059]" />
              )}
            </div>
            <div className="text-[11px] text-[#8D97A5] mt-1 flex items-center gap-1">
              <span>檢視：</span>
              <span className="text-[#C5A059] font-medium">{getScopeDisplayName()}</span>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="px-2.5 sm:px-3 space-y-1 mt-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-item-${item.id}`}
                onClick={() => handleItemClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 sm:py-3 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-[#23282E] text-[#F3F4F6] shadow-sm border-l-[3px] border-[#C5A059]'
                    : 'text-[#9EA6B0] hover:text-[#E2E8F0] hover:bg-[#1A1E22]'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#C5A059]' : 'text-[#7A838F]'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${item.badgeColor || 'bg-[#374151] text-[#E5E7EB]'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Sync Info Widget */}
      <div className="p-3.5 mx-3 mb-4 bg-[#191D21] border border-[#262C33] rounded-lg">
        <div className="text-[11px] text-[#757F8E] font-medium mb-1">中央資料庫連線</div>
        <div className="flex items-center space-x-2 text-xs font-semibold text-[#34D399]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>全台 5 店即時連線中</span>
        </div>
        <div className="text-[10px] text-[#697482] mt-1">每 7 秒智慧監控庫存</div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside 
        id="kava-sidebar"
        className="hidden lg:flex w-64 bg-[#141618] text-[#9EA6B0] flex-col justify-between border-r border-[#22272B] min-h-screen shrink-0 select-none sticky top-0 h-screen overflow-y-auto"
      >
        {sidebarContent}
      </aside>

      {/* Mobile Slide-Over Drawer with Backdrop Overlay */}
      {isOpenMobile && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={onCloseMobile}
          />
          
          {/* Drawer panel */}
          <aside className="relative w-72 max-w-[85vw] bg-[#141618] text-[#9EA6B0] flex flex-col justify-between h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
};

