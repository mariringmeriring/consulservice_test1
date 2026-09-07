import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Clock, 
  User, 
  Phone, 
  AlertCircle, 
  AlertTriangle,
  CheckCircle2, 
  Download, 
  ExternalLink,
  MessageSquare,
  PlusCircle,
  Database,
  ArrowUpDown,
  Sparkles
} from 'lucide-react';
import type { ConsultationItem, ConsultationCategory, ConsultationStatus } from '../types';

interface ConsultationListProps {
  items: ConsultationItem[];
  isLoading: boolean;
  onSelectItem: (item: ConsultationItem) => void;
  onGoToCreate: () => void;
  onOpenGuide: () => void;
}

export const ConsultationList: React.FC<ConsultationListProps> = ({
  items,
  isLoading,
  onSelectItem,
  onGoToCreate,
  onOpenGuide,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // 통계 계산
  const stats = useMemo(() => {
    const total = items.length;
    const pending = items.filter(i => i.status === 'pending').length;
    const inProgress = items.filter(i => i.status === 'in_progress').length;
    const completed = items.filter(i => i.status === 'completed').length;
    return { total, pending, inProgress, completed };
  }, [items]);

  // 필터링 및 검색 로직
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchSearch = 
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.contact.toLowerCase().includes(searchTerm.toLowerCase());

      const matchCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchStatus = selectedStatus === 'all' || item.status === selectedStatus;

      return matchSearch && matchCategory && matchStatus;
    });
  }, [items, searchTerm, selectedCategory, selectedStatus]);

  // CSV 내보내기 (비개발자 관리자를 위한 엑셀 호환 다운로드)
  const handleExportCSV = () => {
    if (items.length === 0) {
      alert('다운로드할 상담 데이터가 없습니다.');
      return;
    }

    const headers = ['고유ID', '제목', '요청내용', '신청자', '연락처', '카테고리', '상태', '긴급여부', '등록일시', '답변내용'];
    const rows = items.map((item) => [
      `"${item.id}"`,
      `"${item.title.replace(/"/g, '""')}"`,
      `"${item.content.replace(/"/g, '""').replace(/\n/g, ' ')}"`,
      `"${item.clientName.replace(/"/g, '""')}"`,
      `"${item.contact.replace(/"/g, '""')}"`,
      `"${item.category}"`,
      `"${item.status}"`,
      `"${item.isUrgent ? '긴급' : '일반'}"`,
      `"${item.createdAt}"`,
      `"${(item.reply || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `상담신청내역_Firebase_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('ko-KR', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Top Stat Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div 
          onClick={() => setSelectedStatus('all')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            selectedStatus === 'all' 
              ? 'bg-white border-[#2563EB] shadow-xs ring-2 ring-[#2563EB]/10' 
              : 'bg-white border-[#EEEEEE] hover:border-slate-300'
          }`}
        >
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF]">전체 상담</span>
          <div className="text-2xl font-bold text-[#111827] mt-1 flex items-baseline gap-1">
            <span>{stats.total}</span>
            <span className="text-xs font-normal text-[#9CA3AF]">건</span>
          </div>
        </div>

        <div 
          onClick={() => setSelectedStatus('pending')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            selectedStatus === 'pending' 
              ? 'bg-white border-[#2563EB] shadow-xs ring-2 ring-[#2563EB]/10' 
              : 'bg-white border-[#EEEEEE] hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#2563EB]">접수 대기</span>
            <span className="w-2 h-2 rounded-full bg-[#2563EB] animate-pulse" />
          </div>
          <div className="text-2xl font-bold text-[#111827] mt-1 flex items-baseline gap-1">
            <span>{stats.pending}</span>
            <span className="text-xs font-normal text-[#9CA3AF]">건</span>
          </div>
        </div>

        <div 
          onClick={() => setSelectedStatus('in_progress')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            selectedStatus === 'in_progress' 
              ? 'bg-white border-[#2563EB] shadow-xs ring-2 ring-[#2563EB]/10' 
              : 'bg-white border-[#EEEEEE] hover:border-slate-300'
          }`}
        >
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#374151]">상담 진행중</span>
          <div className="text-2xl font-bold text-[#111827] mt-1 flex items-baseline gap-1">
            <span>{stats.inProgress}</span>
            <span className="text-xs font-normal text-[#9CA3AF]">건</span>
          </div>
        </div>

        <div 
          onClick={() => setSelectedStatus('completed')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            selectedStatus === 'completed' 
              ? 'bg-white border-[#10B981] shadow-xs ring-2 ring-[#10B981]/10' 
              : 'bg-white border-[#EEEEEE] hover:border-slate-300'
          }`}
        >
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#10B981]">답변 완료</span>
          <div className="text-2xl font-bold text-[#111827] mt-1 flex items-baseline gap-1">
            <span>{stats.completed}</span>
            <span className="text-xs font-normal text-[#9CA3AF]">건</span>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div 
        id="consultation-search-filter-bar"
        className="bg-white p-5 rounded-2xl border border-[#EEEEEE] shadow-xs space-y-3"
      >
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Field */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="search-consultation-input"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="상담 제목, 내용, 신청자명, 연락처 검색..."
              className="w-full pl-9 pr-4 py-2.5 text-xs sm:text-sm bg-[#F3F4F6] border border-transparent rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-[#111827] transition-all placeholder:text-[#9CA3AF]"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#9CA3AF] hover:text-[#111827] cursor-pointer"
              >
                지우기
              </button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              id="export-csv-btn"
              onClick={handleExportCSV}
              className="px-3.5 py-2.5 text-xs font-semibold text-[#374151] bg-[#F3F4F6] hover:bg-[#E5E7EB] rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              title="현재 등록된 상담 데이터를 엑셀(CSV) 파일로 저장합니다"
            >
              <Download className="w-3.5 h-3.5 text-[#6B7280]" />
              <span>CSV 다운로드</span>
            </button>

            <button
              id="new-consultation-quick-btn"
              onClick={onGoToCreate}
              className="px-4 py-2.5 text-xs font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>신규 상담 신청</span>
            </button>
          </div>
        </div>

        {/* Category Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-[#9CA3AF] shrink-0 font-medium mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> 분야:
          </span>
          {['all', '일반 문의', '서비스 안내', '비용 및 견적', '기술 지원', '기타 요청'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg transition-all shrink-0 cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#2563EB] text-white font-medium shadow-xs'
                  : 'bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB] hover:text-[#111827]'
              }`}
            >
              {cat === 'all' ? '전체 분야' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Items Container */}
      <div id="consultation-items-container" className="space-y-3">
        {isLoading ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-[#EEEEEE]">
            <div className="inline-block p-3 bg-[#EFF6FF] text-[#2563EB] rounded-full animate-spin mb-3">
              <Database className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-[#111827]">Firebase Firestore 실시간 데이터 동기화 중...</h3>
            <p className="text-xs text-[#9CA3AF] mt-1">잠시만 기다려 주세요.</p>
          </div>
        ) : filteredItems.length === 0 ? (
          /* Empty State */
          <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-[#EEEEEE]">
            <div className="w-12 h-12 mx-auto mb-3 p-3 bg-[#F3F4F6] text-[#9CA3AF] rounded-xl flex items-center justify-center">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#111827]">
              {searchTerm || selectedCategory !== 'all' || selectedStatus !== 'all'
                ? '조건에 일치하는 상담 내역이 없습니다.'
                : '아직 접수된 상담 내역이 없습니다.'}
            </h3>
            <p className="text-xs text-[#6B7280] max-w-md mx-auto mt-1 mb-5">
              {searchTerm || selectedCategory !== 'all' || selectedStatus !== 'all'
                ? '검색어나 필터 조건을 변경해 보시거나 초기화해 보세요.'
                : '첫 번째 상담 요청을 작성해 보세요. 등록하는 즉시 Firebase 클라우드 DB에 안전하게 기록됩니다.'}
            </p>
            <div className="flex items-center justify-center gap-2">
              <button
                id="empty-state-create-btn"
                onClick={onGoToCreate}
                className="px-4 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold rounded-xl shadow-xs transition-all cursor-pointer"
              >
                신규 상담 신청하기
              </button>
              <button
                id="empty-state-guide-btn"
                onClick={onOpenGuide}
                className="px-4 py-2.5 bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#374151] text-xs font-medium rounded-xl transition-all cursor-pointer"
              >
                DB 가이드 읽기
              </button>
            </div>
          </div>
        ) : (
          /* Request Cards */
          filteredItems.map((item) => (
            <div
              id={`consultation-card-${item.id}`}
              key={item.id}
              onClick={() => onSelectItem(item)}
              className="group bg-white p-5 sm:p-6 rounded-2xl border border-[#EEEEEE] hover:border-[#2563EB] hover:shadow-md transition-all cursor-pointer relative"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-2.5">
                {/* Badges */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-2.5 py-1 text-[10px] font-bold rounded-md uppercase tracking-wider ${
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
                      <AlertTriangle className="w-3 h-3" />
                      <span>긴급</span>
                    </span>
                  )}
                </div>

                {/* Date */}
                <div className="flex items-center gap-1 text-xs text-[#9CA3AF]">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{formatDate(item.createdAt)}</span>
                </div>
              </div>

              {/* Title */}
              <h3 className="text-base font-bold text-[#111827] group-hover:text-[#2563EB] transition-colors mb-1.5 line-clamp-1">
                {item.title}
              </h3>

              {/* Content Preview */}
              <p className="text-xs sm:text-sm text-[#6B7280] line-clamp-2 leading-relaxed mb-4">
                {item.content}
              </p>

              {/* Card Footer */}
              <div className="pt-3 border-t border-[#EEEEEE] flex flex-wrap items-center justify-between gap-2 text-xs text-[#9CA3AF]">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-[#374151]">
                    <User className="w-3.5 h-3.5 text-[#9CA3AF]" />
                    <strong>{item.clientName}</strong>
                  </span>
                  <span className="flex items-center gap-1 text-[#6B7280]">
                    <Phone className="w-3.5 h-3.5 text-[#9CA3AF]" />
                    <span>{item.contact}</span>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {item.reply ? (
                    <span className="inline-flex items-center gap-1 text-[#10B981] font-semibold bg-[#F0FDF4] px-2 py-0.5 rounded-md text-[11px]">
                      <CheckCircle2 className="w-3 h-3" /> 답변 완료
                    </span>
                  ) : (
                    <span className="text-[#9CA3AF] group-hover:text-[#2563EB] transition-colors flex items-center gap-1 font-medium">
                      상세보기 및 답변 등록 →
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
