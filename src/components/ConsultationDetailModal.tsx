import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  User, 
  Phone, 
  Tag, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  MessageSquare, 
  Trash2, 
  Send,
  Loader2,
  Copy,
  Check
} from 'lucide-react';
import type { ConsultationItem, ConsultationStatus } from '../types';
import { updateConsultationStatus, updateConsultationReply, deleteConsultation } from '../services/consultationService';

interface ConsultationDetailModalProps {
  item: ConsultationItem | null;
  onClose: () => void;
}

export const ConsultationDetailModal: React.FC<ConsultationDetailModalProps> = ({ item, onClose }) => {
  const [replyText, setReplyText] = useState(item?.reply || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  if (!item) return null;

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  const handleStatusChange = async (newStatus: ConsultationStatus) => {
    try {
      setIsUpdating(true);
      await updateConsultationStatus(item.id, newStatus);
    } catch (err) {
      console.error('상태 변경 실패:', err);
      alert('상태 변경 중 문제가 발생했습니다.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    try {
      setIsUpdating(true);
      await updateConsultationReply(item.id, replyText);
    } catch (err) {
      console.error('답변 저장 실패:', err);
      alert('답변 등록에 실패했습니다.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('이 상담 내역을 데이터베이스에서 완전히 삭제하시겠습니까?')) {
      return;
    }

    try {
      setIsUpdating(true);
      await deleteConsultation(item.id);
      onClose();
    } catch (err) {
      console.error('삭제 실패:', err);
      alert('삭제 중 오류가 발생했습니다.');
      setIsUpdating(false);
    }
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(item.id);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        id="consultation-detail-modal" 
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-xl border border-[#EEEEEE] p-6 sm:p-8 text-[#111827]"
      >
        {/* Close Button */}
        <button
          id="close-detail-modal-btn"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-[#9CA3AF] hover:text-[#111827] hover:bg-[#F3F4F6] rounded-full transition-colors cursor-pointer"
          aria-label="닫기"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Badges & ID Header */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md ${
            item.status === 'pending'
              ? 'bg-[#EFF6FF] text-[#2563EB]'
              : item.status === 'in_progress'
              ? 'bg-slate-100 text-slate-700'
              : 'bg-[#F0FDF4] text-[#10B981]'
          }`}>
            {item.status === 'pending' ? 'PENDING • 접수대기' : item.status === 'in_progress' ? 'PROCESSING • 상담중' : 'COMPLETED • 답변완료'}
          </span>

          <span className="px-2 py-0.5 text-xs font-medium bg-[#F3F4F6] text-[#6B7280] rounded-md">
            {item.category}
          </span>

          {item.isUrgent && (
            <span className="px-2 py-0.5 text-xs font-bold bg-rose-50 text-rose-600 rounded-md border border-rose-100 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-rose-500" />
              <span>긴급 요청</span>
            </span>
          )}

          <button
            onClick={handleCopyId}
            className="ml-auto inline-flex items-center gap-1 px-2.5 py-1 text-xs font-mono text-[#6B7280] bg-[#F3F4F6] hover:bg-[#E5E7EB] rounded-lg transition-colors cursor-pointer"
            title="문서 고유 ID 복사"
          >
            <span>ID: {item.id.slice(0, 8)}...</span>
            {isCopied ? <Check className="w-3 h-3 text-[#10B981]" /> : <Copy className="w-3 h-3 text-[#9CA3AF]" />}
          </button>
        </div>

        {/* Title */}
        <h2 className="text-xl sm:text-2xl font-bold text-[#111827] tracking-tight mb-4">
          {item.title}
        </h2>

        {/* Meta Info Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-[#F9FAFB] rounded-xl border border-[#EEEEEE] text-xs text-[#6B7280] mb-6">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-[#9CA3AF]" />
            <span>신청인: <strong className="text-[#111827]">{item.clientName}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-[#9CA3AF]" />
            <span>연락처: <strong className="text-[#111827]">{item.contact}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#9CA3AF]" />
            <span>접수일: <strong className="text-[#111827]">{formatDate(item.createdAt)}</strong></span>
          </div>
        </div>

        {/* Request Content */}
        <div className="mb-6">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#9CA3AF] mb-2">
            상담 요청 상세 내용
          </h4>
          <div className="p-4 bg-[#F3F4F6] rounded-xl text-sm text-[#111827] leading-relaxed whitespace-pre-wrap">
            {item.content}
          </div>
        </div>

        {/* Status Control */}
        <div className="p-4 bg-[#EFF6FF] rounded-xl border border-[#DBEAFE] mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-[#2563EB]">상태 변경 (Firebase 실시간 반영)</span>
              <p className="text-xs text-[#2563EB]/80 mt-0.5">상태를 선택하면 Firestore DB의 status 값이 즉시 수정됩니다.</p>
            </div>
            <div className="flex items-center gap-1.5">
              {(['pending', 'in_progress', 'completed'] as ConsultationStatus[]).map((st) => (
                <button
                  key={st}
                  type="button"
                  disabled={isUpdating}
                  onClick={() => handleStatusChange(st)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                    item.status === st
                      ? 'bg-[#2563EB] text-white shadow-xs'
                      : 'bg-white text-[#6B7280] border border-[#EEEEEE] hover:bg-slate-50 hover:text-[#111827]'
                  }`}
                >
                  {st === 'pending' ? '대기중' : st === 'in_progress' ? '상담중' : '완료'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Reply Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#9CA3AF] flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>상담사 답변 및 피드백 메모</span>
            </h4>
            {item.repliedAt && (
              <span className="text-xs text-[#9CA3AF]">
                답변 등록됨: {formatDate(item.repliedAt)}
              </span>
            )}
          </div>

          <form onSubmit={handleSaveReply}>
            <textarea
              id="reply-textarea"
              rows={3}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="고객에게 안내할 답변 내용이나 상담 후 내부 조치 사항을 작성해 보세요. 저장 시 자동으로 '완료' 상태로 전환됩니다."
              className="w-full p-3.5 text-sm text-[#111827] bg-[#F3F4F6] border border-transparent rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB] placeholder:text-[#9CA3AF] leading-relaxed transition-all"
            />
            <div className="flex justify-end mt-2">
              <button
                id="save-reply-btn"
                type="submit"
                disabled={isUpdating || !replyText.trim() || replyText === item.reply}
                className="px-4 py-2 text-xs font-semibold bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl transition-all shadow-xs flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                {isUpdating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                <span>답변 내용 DB 저장</span>
              </button>
            </div>
          </form>
        </div>

        {/* Modal Footer */}
        <div className="pt-4 border-t border-[#EEEEEE] flex items-center justify-between">
          <button
            id="delete-consultation-btn"
            type="button"
            onClick={handleDelete}
            disabled={isUpdating}
            className="px-3 py-2 text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>이 상담 삭제하기</span>
          </button>

          <button
            id="close-modal-bottom-btn"
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-sm font-medium bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#374151] rounded-xl transition-colors cursor-pointer"
          >
            창 닫기
          </button>
        </div>
      </div>
    </div>
  );
};
