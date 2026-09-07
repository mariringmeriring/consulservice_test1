import React from 'react';
import { Database, ShieldCheck, Zap, Layers, X, ExternalLink, Lightbulb, CheckCircle2 } from 'lucide-react';
import { firebaseConfig } from '../firebase';

interface FirebaseGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FirebaseGuideModal: React.FC<FirebaseGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        id="firebase-guide-modal-container" 
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-xl border border-[#EEEEEE] p-6 sm:p-8 text-[#111827]"
      >
        {/* Close Button */}
        <button
          id="close-guide-modal-btn"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-[#9CA3AF] hover:text-[#111827] hover:bg-[#F3F4F6] rounded-full transition-colors cursor-pointer"
          aria-label="닫기"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-[#EFF6FF] text-[#2563EB] rounded-xl flex items-center justify-center border border-blue-100">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#2563EB] bg-[#EFF6FF] px-2 py-0.5 rounded-md">
              초보자 & 비개발자 맞춤 가이드
            </span>
            <h2 className="text-xl font-bold text-[#111827] mt-1">
              지금 연결된 Firebase DB 원리 안내서
            </h2>
          </div>
        </div>

        {/* Explanation Sections */}
        <div className="space-y-4 text-sm leading-relaxed text-[#6B7280]">
          {/* 1. Firebase란? */}
          <div className="p-4 rounded-xl bg-[#F9FAFB] border border-[#EEEEEE]">
            <div className="flex items-center gap-2 font-bold text-[#111827] mb-1.5">
              <Layers className="w-4 h-4 text-[#2563EB]" />
              <span>1. Firebase Cloud Firestore란 무엇인가요?</span>
            </div>
            <p className="text-[#6B7280]">
              구글(Google)이 제공하는 안전한 **클라우드 데이터베이스**입니다. 
              내 컴퓨터가 꺼져 있어도 구글의 강력한 서버에서 24시간 365일 안전하게 상담 요청 데이터를 저장하고 보관해 줍니다.
            </p>
          </div>

          {/* 2. 데이터 저장 구조 */}
          <div className="p-4 rounded-xl bg-[#F9FAFB] border border-[#EEEEEE]">
            <div className="flex items-center gap-2 font-bold text-[#111827] mb-1.5">
              <Database className="w-4 h-4 text-[#10B981]" />
              <span>2. 내 상담 데이터는 어떤 형식으로 저장되나요?</span>
            </div>
            <p className="mb-2 text-[#6B7280]">
              Firestore는 <strong>‘컬렉션(폴더)’</strong>과 <strong>‘문서(파일)’</strong> 구조로 되어 있습니다.
            </p>
            <div className="bg-white p-3 rounded-lg border border-[#EEEEEE] font-mono text-xs text-[#374151] space-y-1">
              <div className="text-[#2563EB] font-bold">📁 consultations (컬렉션: 서류함)</div>
              <div className="pl-4 text-[#9CA3AF]">ㄴ 📄 ID_12345 (문서: 개별 상담 건)</div>
              <div className="pl-8 text-[#6B7280] font-sans">
                • 제목 (title): "홈페이지 제작 상담 요청 드립니다"<br />
                • 요청내용 (content): "상세 견적과 제작 일정이 궁금합니다..."<br />
                • 신청자 (clientName): "홍길동"<br />
                • 연락처 (contact): "010-1234-5678"<br />
                • 상태 (status): "접수대기(pending)"<br />
                • 등록일시 (createdAt): "2026-09-07T..."
              </div>
            </div>
          </div>

          {/* 3. 실시간 동기화 (Live Sync) */}
          <div className="p-4 rounded-xl bg-[#F9FAFB] border border-[#EEEEEE]">
            <div className="flex items-center gap-2 font-bold text-[#111827] mb-1.5">
              <Zap className="w-4 h-4 text-[#2563EB]" />
              <span>3. 실시간 동기화(Live Sync)의 마법</span>
            </div>
            <p className="text-[#6B7280]">
              상담 폼에서 [상담 신청서 제출하기]를 누르는 순간, 브라우저를 새로고침(F5)하지 않아도 
              <strong> 0.1초 만에 [접수 내역] 화면에 새 글이 자동으로 실시간 갱신</strong>됩니다. 
              이 기능이 바로 Firebase의 핵심 기술인 실시간 리스너(Listener)입니다.
            </p>
          </div>

          {/* 4. 데이터 보안 규칙 */}
          <div className="p-4 rounded-xl bg-[#F9FAFB] border border-[#EEEEEE]">
            <div className="flex items-center gap-2 font-bold text-[#111827] mb-1.5">
              <ShieldCheck className="w-4 h-4 text-[#2563EB]" />
              <span>4. 보안 규칙 (Security Rules) 적용 완료</span>
            </div>
            <p className="text-[#6B7280]">
              Google Cloud 방화벽에 보안 규칙(<code className="bg-[#F3F4F6] text-[#111827] px-1 py-0.5 rounded text-xs font-mono">firestore.rules</code>)이 배포되어, 
              승인된 권한으로 안전하게 데이터 입출력이 보장됩니다.
            </p>
          </div>

          {/* 5. 실무/운영 추천 팁 */}
          <div className="p-4 rounded-xl bg-[#F0FDF4] border border-[#DCFCE7]">
            <div className="flex items-center gap-2 font-bold text-[#166534] mb-2">
              <Lightbulb className="w-4 h-4 text-[#10B981]" />
              <span>💡 비개발자 대표님/운영자를 위한 추가 추천 기능</span>
            </div>
            <ul className="space-y-1.5 text-xs text-[#166534]">
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] mt-0.5 shrink-0" />
                <span><strong>카카오 알림톡 / 이메일 알림 연동:</strong> 새 상담이 접수되었을 때 대표님 스마트폰으로 바로 톡이 오게 구성할 수 있습니다.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] mt-0.5 shrink-0" />
                <span><strong>관리자 전용 로그인:</strong> 고객은 신청만 하고, 상담 내역 및 답변 작성은 관리자만 볼 수 있도록 권한을 분리할 수 있습니다.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] mt-0.5 shrink-0" />
                <span><strong>엑셀(CSV) 백업 다운로드:</strong> 접수된 데이터를 월말 보고서나 고객 관리용으로 다운로드하여 보관할 수 있습니다 (본 페이지에 탑재됨).</span>
              </li>
            </ul>
          </div>

          {/* 프로젝트 정보 */}
          <div className="pt-2 border-t border-[#EEEEEE] text-xs text-[#9CA3AF] flex flex-wrap items-center justify-between gap-2">
            <span>연결된 Firebase 프로젝트 ID: <strong className="text-[#374151] font-mono">{firebaseConfig.projectId}</strong></span>
            <span>Database: <code className="font-mono text-[#374151]">{firebaseConfig.firestoreDatabaseId || 'default'}</code></span>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-6 flex justify-end">
          <button
            id="confirm-guide-modal-btn"
            onClick={onClose}
            className="px-5 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold rounded-xl transition-all shadow-xs cursor-pointer"
          >
            확인 완료
          </button>
        </div>
      </div>
    </div>
  );
};
