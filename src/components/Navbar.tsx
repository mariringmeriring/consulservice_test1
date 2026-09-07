import React from 'react';
import { HelpCircle, LogIn, UserPlus, LogOut, ShieldCheck, User as UserIcon, LayoutDashboard } from 'lucide-react';
import type { User } from '../types';

interface NavbarProps {
  currentTab: 'form' | 'list' | 'dashboard';
  onTabChange: (tab: 'form' | 'list' | 'dashboard') => void;
  pendingCount: number;
  totalCount: number;
  onOpenGuide: () => void;
  currentUser: User | null;
  onOpenAuth: (mode: 'login' | 'signup') => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  pendingCount,
  totalCount,
  onOpenGuide,
  currentUser,
  onOpenAuth,
  onLogout,
}) => {
  const isAdmin = currentUser?.role === 'admin';

  return (
    <nav className="sticky top-0 z-40 bg-white border-b border-[#EEEEEE] px-4 sm:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Logo & Brand */}
        <div 
          onClick={() => onTabChange(isAdmin ? 'dashboard' : 'form')} 
          className="flex items-center gap-2.5 cursor-pointer select-none shrink-0"
        >
          <div className="w-8 h-8 bg-[#2563EB] rounded-lg flex items-center justify-center shadow-xs">
            <div className="w-3.5 h-3.5 border-2 border-white rounded-xs"></div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold tracking-tight text-[#111827]">
              ConsultFlow
            </span>
            <span className="text-xs text-[#9CA3AF] hidden md:inline font-medium">
              {isAdmin ? '관리자 콘솔' : '온라인 상담 서비스'}
            </span>
          </div>
        </div>

        {/* Minimal Navigation Tabs */}
        <div className="flex items-center gap-4 sm:gap-6 text-sm font-medium">
          {isAdmin ? (
            <>
              <button
                id="nav-tab-dashboard-btn"
                onClick={() => onTabChange('dashboard')}
                className={`transition-colors cursor-pointer pb-1 border-b-2 flex items-center gap-1.5 ${
                  currentTab === 'dashboard'
                    ? 'text-[#2563EB] border-[#2563EB] font-semibold'
                    : 'text-[#6B7280] hover:text-[#111827] border-transparent'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>관리자 대시보드</span>
              </button>

              <button
                id="nav-tab-list-btn"
                onClick={() => onTabChange('list')}
                className={`transition-colors cursor-pointer pb-1 border-b-2 flex items-center gap-1.5 ${
                  currentTab === 'list'
                    ? 'text-[#2563EB] border-[#2563EB] font-semibold'
                    : 'text-[#6B7280] hover:text-[#111827] border-transparent'
                }`}
              >
                <span>상담 목록</span>
                {totalCount > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    pendingCount > 0
                      ? 'bg-[#EFF6FF] text-[#2563EB]'
                      : 'bg-[#F3F4F6] text-[#6B7280]'
                  }`}>
                    {totalCount}
                  </span>
                )}
              </button>

              <button
                id="nav-tab-form-btn"
                onClick={() => onTabChange('form')}
                className={`transition-colors cursor-pointer pb-1 border-b-2 text-xs text-[#6B7280] hover:text-[#111827] ${
                  currentTab === 'form'
                    ? 'text-[#2563EB] border-[#2563EB] font-semibold'
                    : 'border-transparent'
                }`}
              >
                신청 폼 뷰
              </button>
            </>
          ) : (
            <>
              <button
                id="nav-tab-form-btn"
                onClick={() => onTabChange('form')}
                className={`transition-colors cursor-pointer pb-1 border-b-2 ${
                  currentTab === 'form'
                    ? 'text-[#2563EB] border-[#2563EB] font-semibold'
                    : 'text-[#6B7280] hover:text-[#111827] border-transparent'
                }`}
              >
                상담 신청
              </button>
              <button
                id="nav-tab-list-btn"
                onClick={() => onTabChange('list')}
                className={`transition-colors cursor-pointer pb-1 border-b-2 flex items-center gap-2 ${
                  currentTab === 'list'
                    ? 'text-[#2563EB] border-[#2563EB] font-semibold'
                    : 'text-[#6B7280] hover:text-[#111827] border-transparent'
                }`}
              >
                <span>접수 내역</span>
                {totalCount > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    pendingCount > 0
                      ? 'bg-[#EFF6FF] text-[#2563EB]'
                      : 'bg-[#F3F4F6] text-[#6B7280]'
                  }`}>
                    {totalCount}
                  </span>
                )}
              </button>
            </>
          )}
        </div>

        {/* Right side: Auth Controls & DB Guide */}
        <div className="flex items-center gap-2 sm:gap-3">
          {currentUser ? (
            /* Logged in state */
            <div className="flex items-center gap-2">
              {isAdmin ? (
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#EFF6FF] text-[#2563EB] font-bold text-xs rounded-xl border border-[#DBEAFE]">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">최고 관리자</span>
                  <span className="font-mono text-[11px]">(admin)</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#F3F4F6] text-[#374151] font-medium text-xs rounded-xl">
                  <UserIcon className="w-3.5 h-3.5 text-[#9CA3AF]" />
                  <span>{currentUser.name} 님</span>
                </div>
              )}

              <button
                id="nav-logout-btn"
                type="button"
                onClick={onLogout}
                className="p-1.5 sm:px-2.5 sm:py-1.5 text-xs text-[#6B7280] hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer flex items-center gap-1"
                title="로그아웃"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">로그아웃</span>
              </button>
            </div>
          ) : (
            /* Not logged in: Login & Sign Up buttons */
            <div className="flex items-center gap-2">
              <button
                id="nav-login-btn"
                type="button"
                onClick={() => onOpenAuth('login')}
                className="px-3 sm:px-3.5 py-1.5 text-xs font-semibold text-[#374151] hover:text-[#111827] bg-[#F3F4F6] hover:bg-[#E5E7EB] rounded-xl transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
              >
                <LogIn className="w-3.5 h-3.5 text-[#6B7280]" />
                <span>로그인</span>
              </button>

              <button
                id="nav-signup-btn"
                type="button"
                onClick={() => onOpenAuth('signup')}
                className="px-3 sm:px-3.5 py-1.5 text-xs font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>회원가입</span>
              </button>
            </div>
          )}

          {/* DB Guide Button */}
          <button
            id="nav-open-guide-btn"
            onClick={onOpenGuide}
            className="hidden md:flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] rounded-xl transition-colors cursor-pointer"
            title="Firebase DB 연결 원리 가이드"
          >
            <HelpCircle className="w-3.5 h-3.5 text-[#9CA3AF]" />
            <span>가이드</span>
          </button>
        </div>
      </div>
    </nav>
  );
};
