import React, { useState, useEffect } from 'react';
import { 
  X, 
  LogIn, 
  UserPlus, 
  KeyRound, 
  User as UserIcon, 
  ShieldCheck, 
  AlertCircle, 
  Loader2, 
  Sparkles,
  Check
} from 'lucide-react';
import { loginUser, signupUser } from '../services/authService';
import type { User, AuthMode } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: AuthMode;
  onClose: () => void;
  onSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'login',
  onClose,
  onSuccess,
}) => {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setError(null);
      setSuccessMessage(null);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (mode === 'signup') {
      if (password !== passwordConfirm) {
        setError('비밀번호와 비밀번호 확인이 일치하지 않습니다.');
        return;
      }
    }

    setIsLoading(true);
    try {
      if (mode === 'login') {
        const user = await loginUser(username, password);
        setSuccessMessage(`${user.name}님 환영합니다! 로그인되었습니다.`);
        setTimeout(() => {
          onSuccess(user);
          onClose();
        }, 500);
      } else {
        const user = await signupUser(username, password, name);
        setSuccessMessage(`회원가입이 완료되었습니다. ${user.name}님으로 로그인되었습니다!`);
        setTimeout(() => {
          onSuccess(user);
          onClose();
        }, 600);
      }
    } catch (err: any) {
      setError(err.message || '요청 처리 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 관리자 계정 1초 자동 채우기 및 로그인
  const handleQuickAdminLogin = async () => {
    setUsername('admin');
    setPassword('123');
    setError(null);
    setIsLoading(true);
    try {
      const user = await loginUser('admin', '123');
      setSuccessMessage('관리자 계정으로 확인되었습니다. 대시보드로 이동합니다!');
      setTimeout(() => {
        onSuccess(user);
        onClose();
      }, 500);
    } catch (err: any) {
      setError(err.message || '관리자 로그인 실패');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        id="auth-modal-container"
        className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-[#EEEEEE] p-6 sm:p-8 text-[#111827]"
      >
        {/* 닫기 버튼 */}
        <button
          id="auth-modal-close-btn"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-[#9CA3AF] hover:text-[#111827] hover:bg-[#F3F4F6] rounded-full transition-colors cursor-pointer"
          aria-label="닫기"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 상단 탭 전환: 로그인 / 회원가입 */}
        <div className="flex border-b border-[#EEEEEE] mb-6">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(null); }}
            className={`flex-1 pb-3 text-sm font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 border-b-2 ${
              mode === 'login'
                ? 'text-[#2563EB] border-[#2563EB]'
                : 'text-[#6B7280] border-transparent hover:text-[#111827]'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>로그인</span>
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); setError(null); }}
            className={`flex-1 pb-3 text-sm font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 border-b-2 ${
              mode === 'signup'
                ? 'text-[#2563EB] border-[#2563EB]'
                : 'text-[#6B7280] border-transparent hover:text-[#111827]'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>회원가입</span>
          </button>
        </div>

        {/* 헤더 문구 */}
        <div className="mb-6">
          <h2 className="text-xl font-bold tracking-tight text-[#111827]">
            {mode === 'login' ? '서비스 로그인' : '신규 회원가입'}
          </h2>
          <p className="text-xs text-[#6B7280] mt-1 leading-relaxed">
            {mode === 'login' 
              ? '아이디와 비밀번호를 입력하여 로그인해 주세요.' 
              : '새 계정을 생성하시면 상담 신청 및 내역 관리를 편리하게 이용하실 수 있습니다.'}
          </p>
        </div>

        {/* 관리자 1클릭 로그인 안내 배너 (사용자 편의) */}
        {mode === 'login' && (
          <div className="mb-5 p-3 bg-[#EFF6FF] rounded-xl border border-[#DBEAFE] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2 text-xs text-[#1E40AF]">
              <ShieldCheck className="w-4 h-4 text-[#2563EB] shrink-0" />
              <div>
                <span className="font-bold">관리자 계정:</span> ID <code className="bg-white/80 px-1 py-0.5 rounded font-mono text-[11px] text-[#2563EB]">admin</code> / PW <code className="bg-white/80 px-1 py-0.5 rounded font-mono text-[11px] text-[#2563EB]">123</code>
              </div>
            </div>
            <button
              type="button"
              onClick={handleQuickAdminLogin}
              className="shrink-0 px-2.5 py-1 text-[11px] font-bold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-lg transition-colors flex items-center justify-center gap-1 shadow-xs cursor-pointer"
            >
              <Sparkles className="w-3 h-3" />
              <span>관리자로 즉시 로그인</span>
            </button>
          </div>
        )}

        {/* 성공 알림 */}
        {successMessage && (
          <div className="mb-4 p-3 bg-[#F0FDF4] border border-[#DCFCE7] text-[#166534] rounded-xl text-xs flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0 text-[#166534]" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* 에러 알림 */}
        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {/* 입력 폼 */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 아이디 */}
          <div>
            <label htmlFor="auth-username-input" className="block text-xs font-bold uppercase tracking-wider text-[#9CA3AF] mb-1.5">
              사용자 아이디 (ID)
            </label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-[#9CA3AF] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="auth-username-input"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={mode === 'login' ? '아이디 입력 (예: admin)' : '3자 이상 영문/숫자 아이디'}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#F3F4F6] border border-transparent rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-[#111827] transition-all placeholder:text-[#9CA3AF]"
              />
            </div>
          </div>

          {/* 회원가입 시 이름 입력 */}
          {mode === 'signup' && (
            <div>
              <label htmlFor="auth-name-input" className="block text-xs font-bold uppercase tracking-wider text-[#9CA3AF] mb-1.5">
                이름 또는 닉네임
              </label>
              <input
                id="auth-name-input"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="예: 홍길동"
                className="w-full px-4 py-2.5 text-sm bg-[#F3F4F6] border border-transparent rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-[#111827] transition-all placeholder:text-[#9CA3AF]"
              />
            </div>
          )}

          {/* 비밀번호 */}
          <div>
            <label htmlFor="auth-password-input" className="block text-xs font-bold uppercase tracking-wider text-[#9CA3AF] mb-1.5">
              비밀번호 (Password)
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-[#9CA3AF] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="auth-password-input"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === 'login' ? '비밀번호 (예: 123)' : '비밀번호 3자 이상 입력'}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#F3F4F6] border border-transparent rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-[#111827] transition-all placeholder:text-[#9CA3AF]"
              />
            </div>
          </div>

          {/* 회원가입 시 비밀번호 확인 */}
          {mode === 'signup' && (
            <div>
              <label htmlFor="auth-password-confirm-input" className="block text-xs font-bold uppercase tracking-wider text-[#9CA3AF] mb-1.5">
                비밀번호 확인
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-[#9CA3AF] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="auth-password-confirm-input"
                  type="password"
                  required
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  placeholder="동일한 비밀번호를 다시 입력하세요"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#F3F4F6] border border-transparent rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-[#111827] transition-all placeholder:text-[#9CA3AF]"
                />
              </div>
            </div>
          )}

          {/* 제출 버튼 */}
          <div className="pt-2">
            <button
              id="auth-submit-btn"
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-sm rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>처리 중입니다...</span>
                </>
              ) : mode === 'login' ? (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>로그인 완료하기</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>회원가입 완료하기</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* 하단 모드 전환 보조 텍스트 */}
        <div className="mt-5 text-center text-xs text-[#6B7280]">
          {mode === 'login' ? (
            <span>
              아직 계정이 없으신가요?{' '}
              <button
                type="button"
                onClick={() => { setMode('signup'); setError(null); }}
                className="text-[#2563EB] font-bold hover:underline cursor-pointer ml-1"
              >
                회원가입 하기
              </button>
            </span>
          ) : (
            <span>
              이미 계정이 있으신가요?{' '}
              <button
                type="button"
                onClick={() => { setMode('login'); setError(null); }}
                className="text-[#2563EB] font-bold hover:underline cursor-pointer ml-1"
              >
                로그인 하기
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
