import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ConsultationForm } from './components/ConsultationForm';
import { ConsultationList } from './components/ConsultationList';
import { ConsultationDetailModal } from './components/ConsultationDetailModal';
import { FirebaseGuideModal } from './components/FirebaseGuideModal';
import { AuthModal } from './components/AuthModal';
import { AdminDashboard } from './components/AdminDashboard';
import { subscribeToConsultations } from './services/consultationService';
import { 
  getCurrentSessionUser, 
  clearSessionUser, 
  ensureAdminUserExists 
} from './services/authService';
import type { ConsultationItem, User, AuthMode } from './types';
import { Database, Sparkles, ShieldCheck, HeartHandshake, LogIn } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => getCurrentSessionUser());
  const [currentTab, setCurrentTab] = useState<'form' | 'list' | 'dashboard'>(() => {
    const savedUser = getCurrentSessionUser();
    return savedUser?.role === 'admin' ? 'dashboard' : 'form';
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<AuthMode>('login');

  const [consultations, setConsultations] = useState<ConsultationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<ConsultationItem | null>(null);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [justCreatedId, setJustCreatedId] = useState<string | null>(null);

  // Firestore 초기화 및 admin 계정 보장
  useEffect(() => {
    ensureAdminUserExists().catch(console.error);
  }, []);

  // Firestore 실시간 리스너 연결
  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = subscribeToConsultations(
      (items) => {
        setConsultations(items);
        setIsLoading(false);

        // 만약 방금 생성된 ID가 있다면 해당 아이템 업데이트
        if (justCreatedId) {
          const found = items.find((i) => i.id === justCreatedId);
          if (found) {
            setSelectedItem(found);
            setJustCreatedId(null);
          }
        }
      },
      (err) => {
        console.error('Firebase DB 실시간 연결 오류:', err);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [justCreatedId]);

  // 로그인 완료 처리
  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    if (user.role === 'admin') {
      setCurrentTab('dashboard');
    }
  };

  // 로그아웃 처리
  const handleLogout = () => {
    clearSessionUser();
    setCurrentUser(null);
    setCurrentTab('form');
  };

  // 모달 열기 핸들러
  const handleOpenAuth = (mode: AuthMode) => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  // 상담 신청 완료 후 핸들러
  const handleFormSuccess = (newDocId: string) => {
    setJustCreatedId(newDocId);
    setCurrentTab('list');
  };

  const pendingCount = consultations.filter((c) => c.status === 'pending').length;
  const isAdmin = currentUser?.role === 'admin';

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#111827] flex flex-col font-sans selection:bg-[#2563EB] selection:text-white">
      {/* Navigation Bar with Auth controls */}
      <Navbar
        currentTab={currentTab}
        onTabChange={(tab) => setCurrentTab(tab)}
        pendingCount={pendingCount}
        totalCount={consultations.length}
        onOpenGuide={() => setIsGuideOpen(true)}
        currentUser={currentUser}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
      />

      {/* Header Info Section - 상태에 따라 친절하게 분기 */}
      <div className="bg-white border-b border-[#EEEEEE] py-6 sm:py-7 px-4 shadow-xs">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[#EFF6FF] text-[#2563EB]">
                <Database className="w-3.5 h-3.5" />
                <span>Google Firebase Cloud Firestore</span>
              </div>
              {isAdmin && (
                <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-[#F0FDF4] text-[#166534] border border-[#DCFCE7]">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
                  <span>관리자 전용 대시보드 활성화</span>
                </div>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#111827]">
              {isAdmin 
                ? '고객 상담 데이터 실시간 통합 관제 대시보드'
                : '온라인 고객 상담 요청 및 실시간 관리 서비스'}
            </h1>

            <p className="text-xs sm:text-sm text-[#6B7280] max-w-2xl leading-relaxed">
              {isAdmin 
                ? '실제 사용자들이 접수한 모든 상담 데이터가 실시간으로 수집되어 있습니다. 분야별 분석, 상태 변경, 답변 작성 및 엑셀 다운로드가 가능합니다.'
                : '상담 요청을 작성하시면 Firebase 클라우드 DB에 안전하게 보관되며, 관리자가 실시간으로 확인 후 신속하게 답변을 등록합니다.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {!currentUser && (
              <button
                type="button"
                onClick={() => handleOpenAuth('login')}
                className="px-3.5 py-2.5 bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#2563EB] text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                title="관리자 계정(admin / 123)으로 로그인하여 상담 데이터 모아보기 대시보드를 체험하세요"
              >
                <LogIn className="w-4 h-4" />
                <span>관리자 로그인 체험 (admin / 123)</span>
              </button>
            )}

            <button
              id="banner-guide-button"
              type="button"
              onClick={() => setIsGuideOpen(true)}
              className="px-3.5 py-2.5 bg-[#F3F4F6] text-[#374151] hover:bg-[#E5E7EB] hover:text-[#111827] text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-[#2563EB]" />
              <span>DB 원리 안내서</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:py-8">
        {isAdmin && currentTab === 'dashboard' ? (
          /* 👑 관리자 전용 상담 데이터 통합 대시보드 */
          <AdminDashboard
            items={consultations}
            isLoading={isLoading}
            onSelectItem={(item) => setSelectedItem(item)}
            onOpenGuide={() => setIsGuideOpen(true)}
            onSwitchToClientMode={() => setCurrentTab('form')}
          />
        ) : currentTab === 'form' ? (
          /* 일반 상담 신청 폼 */
          <ConsultationForm
            onSuccess={handleFormSuccess}
            onOpenGuide={() => setIsGuideOpen(true)}
          />
        ) : (
          /* 접수 내역 목록 */
          <ConsultationList
            items={consultations}
            isLoading={isLoading}
            onSelectItem={(item) => setSelectedItem(item)}
            onGoToCreate={() => setCurrentTab('form')}
            onOpenGuide={() => setIsGuideOpen(true)}
          />
        )}
      </main>

      {/* Consultation Detail & Reply Modal */}
      {selectedItem && (
        <ConsultationDetailModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}

      {/* 회원가입 & 로그인 모달 */}
      <AuthModal
        isOpen={isAuthModalOpen}
        initialMode={authModalMode}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      {/* Friendly Firebase Guide Modal for Non-developers */}
      <FirebaseGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-[#EEEEEE] bg-white py-6 text-center text-xs text-[#9CA3AF]">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <HeartHandshake className="w-4 h-4 text-[#2563EB]" />
            <span className="font-semibold text-[#111827]">온라인 고객 상담 센터</span>
            <span className="text-[#EEEEEE]">|</span>
            <span className="text-[#6B7280]">Firebase Cloud NoSQL Database</span>
          </div>
          <div className="flex items-center gap-3 text-[#9CA3AF]">
            <span>실시간 자동 동기화</span>
            <span>•</span>
            <button 
              onClick={() => setIsGuideOpen(true)}
              className="text-[#2563EB] hover:underline cursor-pointer font-medium"
            >
              DB 구조 설명서
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

