import React, { useState } from 'react';
import { 
  Send, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  User, 
  Phone, 
  FileText, 
  HelpCircle,
  Clock,
  Loader2,
  Check
} from 'lucide-react';
import type { ConsultationCategory, ConsultationFormData } from '../types';
import { createConsultation } from '../services/consultationService';

interface ConsultationFormProps {
  onSuccess: (newId: string) => void;
  onOpenGuide: () => void;
}

const CATEGORIES: ConsultationCategory[] = [
  '일반 문의',
  '서비스 안내',
  '비용 및 견적',
  '기술 지원',
  '기타 요청',
];

const SAMPLE_TEMPLATES = [
  {
    title: '신규 비즈니스 홈페이지 제작 견적 및 일정 문의',
    content: '안녕하세요! 새로 요식업 브랜드를 론칭하면서 모바일과 PC에서 모두 깔끔하게 동작하는 브랜드 소개 사이트를 만들고자 합니다.\n주요 기능으로는 메뉴 소개, 매장 위치(지도 연동), 그리고 이번처럼 온라인 예약/상담 접수 기능이 필요합니다.\n대략적인 제작 소요 시간과 예상 비용 가이드라인을 전달해 주시면 감사하겠습니다.',
    clientName: '이지은 대표',
    contact: '010-8765-4321 / jieun@brandfood.kr',
    category: '비용 및 견적' as ConsultationCategory,
    isUrgent: false
  },
  {
    title: '기존 관리 시스템의 데이터베이스 실시간 연동 기술 문의',
    content: '현재 운영 중인 웹 고객센터에 Firebase 실시간 데이터베이스를 도입하여 고객 문의를 실시간으로 받아보고 싶습니다.\n기존에 저장된 고객 데이터 이전 방법과 보안 규칙 설정에 대해 전문가의 기술 상담을 요청드립니다.',
    clientName: '박준형 팀장',
    contact: '010-1234-9988',
    category: '기술 지원' as ConsultationCategory,
    isUrgent: true
  }
];

export const ConsultationForm: React.FC<ConsultationFormProps> = ({ onSuccess, onOpenGuide }) => {
  const [formData, setFormData] = useState<ConsultationFormData>({
    title: '',
    content: '',
    clientName: '',
    contact: '',
    category: '일반 문의',
    isUrgent: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showSuccessNotice, setShowSuccessNotice] = useState(false);

  // 샘플 데이터 1초 자동 채우기 (비개발자 테스터를 위한 배려)
  const handleFillSample = (index: number = 0) => {
    const sample = SAMPLE_TEMPLATES[index] || SAMPLE_TEMPLATES[0];
    setFormData({
      title: sample.title,
      content: sample.content,
      clientName: sample.clientName,
      contact: sample.contact,
      category: sample.category,
      isUrgent: sample.isUrgent,
    });
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // 유효성 검사
    if (!formData.title.trim()) {
      setErrorMessage('상담 제목을 입력해 주세요.');
      return;
    }
    if (!formData.content.trim()) {
      setErrorMessage('상담 요청 내용을 구체적으로 입력해 주세요.');
      return;
    }

    try {
      setIsLoading(true);
      // Firebase Firestore에 데이터 저장 실행!
      const docId = await createConsultation(formData);
      
      // 등록 완료 처리
      setShowSuccessNotice(true);
      setFormData({
        title: '',
        content: '',
        clientName: '',
        contact: '',
        category: '일반 문의',
        isUrgent: false,
      });

      // 1.5초 후 성공 상태 안내 및 목록으로 전환 트리거
      setTimeout(() => {
        setShowSuccessNotice(false);
        onSuccess(docId);
      }, 1200);

    } catch (err: any) {
      console.error('상담 신청 등록 실패:', err);
      setErrorMessage(`데이터베이스 저장 중 오류가 발생했습니다: ${err.message || '잠시 후 다시 시도해 주세요.'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Clean Minimalist Card */}
      <div 
        id="consultation-form-card"
        className="bg-white rounded-2xl shadow-sm border border-[#EEEEEE] p-6 sm:p-10 transition-all"
      >
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-[#EEEEEE]">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-[#EFF6FF] text-[#2563EB] mb-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]"></span>
              <span>Firebase Cloud DB 실시간 동기화</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#111827] tracking-tight">
              신규 상담 신청
            </h1>
            <p className="text-[#6B7280] text-sm mt-1 leading-relaxed">
              상담 제목과 상세 내용을 입력해 주시면 안전하게 데이터베이스에 저장됩니다.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              id="fill-sample-btn"
              type="button"
              onClick={() => handleFillSample(0)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#2563EB] bg-[#EFF6FF] hover:bg-[#DBEAFE] rounded-lg transition-colors cursor-pointer"
              title="클릭 한 번으로 실제 상담 예시를 자동으로 입력합니다"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>예시 입력</span>
            </button>
            <button
              id="view-guide-btn"
              type="button"
              onClick={onOpenGuide}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#6B7280] bg-[#F3F4F6] hover:bg-[#E5E7EB] rounded-lg transition-colors cursor-pointer"
              title="Firebase 데이터베이스 작동 원리 설명 보기"
            >
              <HelpCircle className="w-3.5 h-3.5 text-[#9CA3AF]" />
              <span>DB 가이드</span>
            </button>
          </div>
        </div>

        {/* Success Banner */}
        {showSuccessNotice && (
          <div 
            id="submission-success-banner"
            className="my-6 p-4 rounded-xl bg-[#F0FDF4] border border-[#DCFCE7] text-[#166534] flex items-center gap-3 animate-in fade-in"
          >
            <div className="p-2 bg-[#DCFCE7] text-[#166534] rounded-lg">
              <Check className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h4 className="font-semibold text-sm">상담 신청이 Firebase DB에 저장되었습니다!</h4>
              <p className="text-xs text-[#15803D] mt-0.5">실시간 접수 목록으로 이동 중입니다...</p>
            </div>
          </div>
        )}

        {/* Error Banner */}
        {errorMessage && (
          <div 
            id="submission-error-banner"
            className="my-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span className="text-sm font-medium">{errorMessage}</span>
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          {/* Category Section */}
          <div id="category-section">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#9CA3AF] mb-2.5">
              상담 분야 (카테고리)
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  id={`category-btn-${cat}`}
                  key={cat}
                  type="button"
                  onClick={() => setFormData({ ...formData, category: cat })}
                  className={`px-3.5 py-2 text-xs font-medium rounded-xl transition-all cursor-pointer ${
                    formData.category === cat
                      ? 'bg-[#2563EB] text-white shadow-xs'
                      : 'bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB] hover:text-[#111827]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Title Field */}
          <div id="title-field-section">
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="title-input" className="block text-xs font-bold uppercase tracking-wider text-[#9CA3AF]">
                상담 제목 <span className="text-rose-500">*</span>
              </label>
              <span className="text-xs text-[#9CA3AF]">{formData.title.length}/80자</span>
            </div>
            <input
              id="title-input"
              type="text"
              maxLength={80}
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="상담을 신청하실 제목을 간략히 입력해 주세요"
              className="w-full px-4 py-3 text-sm text-[#111827] bg-[#F3F4F6] border border-transparent rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB] transition-all placeholder:text-[#9CA3AF]"
              required
            />
          </div>

          {/* Content Field */}
          <div id="content-field-section">
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="content-textarea" className="block text-xs font-bold uppercase tracking-wider text-[#9CA3AF]">
                요청 및 문의 상세 내용 <span className="text-rose-500">*</span>
              </label>
              <span className="text-xs text-[#9CA3AF]">{formData.content.length}자</span>
            </div>
            <textarea
              id="content-textarea"
              rows={6}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="구체적인 상담 및 요청 사항을 상세히 작성해 주세요.&#10;예) 필요한 서비스 범위, 목표 일정, 문의 내용 등"
              className="w-full p-4 text-sm text-[#111827] bg-[#F3F4F6] border border-transparent rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB] transition-all placeholder:text-[#9CA3AF] resize-y leading-relaxed"
              required
            />
            <p className="text-xs text-[#9CA3AF] mt-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
              <span>작성된 내용은 Firestore <code className="text-[#2563EB] bg-[#EFF6FF] px-1.5 py-0.5 rounded font-mono text-[11px]">consultations</code> 컬렉션에 실시간 기록됩니다.</span>
            </p>
          </div>

          {/* 2-Column: Client Name & Contact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div id="client-name-section">
              <label htmlFor="client-name-input" className="block text-xs font-bold uppercase tracking-wider text-[#9CA3AF] mb-2">
                신청자 성함 / 상호명
              </label>
              <input
                id="client-name-input"
                type="text"
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                placeholder="예: 홍길동 (미입력 시 익명)"
                className="w-full px-4 py-3 text-sm text-[#111827] bg-[#F3F4F6] border border-transparent rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB] transition-all placeholder:text-[#9CA3AF]"
              />
            </div>

            <div id="contact-section">
              <label htmlFor="contact-input" className="block text-xs font-bold uppercase tracking-wider text-[#9CA3AF] mb-2">
                회신 연락처 / 이메일
              </label>
              <input
                id="contact-input"
                type="text"
                value={formData.contact}
                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                placeholder="예: 010-1234-5678 또는 email@domain.com"
                className="w-full px-4 py-3 text-sm text-[#111827] bg-[#F3F4F6] border border-transparent rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB] transition-all placeholder:text-[#9CA3AF]"
              />
            </div>
          </div>

          {/* Urgent Checkbox */}
          <div 
            id="urgent-checkbox-container"
            className="p-3.5 bg-[#F9FAFB] rounded-xl border border-[#EEEEEE] flex items-center justify-between"
          >
            <div className="flex items-center gap-2.5">
              <input
                id="urgent-checkbox"
                type="checkbox"
                checked={formData.isUrgent}
                onChange={(e) => setFormData({ ...formData, isUrgent: e.target.checked })}
                className="w-4 h-4 text-[#2563EB] rounded border-[#EEEEEE] focus:ring-[#2563EB] cursor-pointer"
              />
              <label htmlFor="urgent-checkbox" className="text-xs font-semibold text-[#374151] cursor-pointer">
                빠른 확인이 필요한 긴급 요청입니다
              </label>
            </div>
            {formData.isUrgent && (
              <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">
                긴급 태그
              </span>
            )}
          </div>

          {/* Footer Submit */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-[#9CA3AF] flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#9CA3AF]" />
              <span>제출 즉시 관리자 데이터베이스에 등록됩니다.</span>
            </div>

            <button
              id="submit-consultation-btn"
              type="submit"
              disabled={isLoading}
              className={`w-full sm:w-auto min-w-[200px] px-6 py-3.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-sm rounded-xl shadow-lg shadow-blue-500/10 transition-all flex items-center justify-center gap-2 cursor-pointer ${
                isLoading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>DB 저장 중...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>상담 신청서 제출하기</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
