import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  Filter, 
  Download, 
  MessageSquare, 
  User, 
  Phone, 
  Trash2, 
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  Inbox,
  RefreshCw,
  Send,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import type { ConsultationItem, ConsultationStatus, ConsultationCategory } from '../types';
import { updateConsultationStatus, deleteConsultation } from '../services/consultationService';

interface AdminDashboardProps {
  items: ConsultationItem[];
  isLoading: boolean;
  onSelectItem: (item: ConsultationItem) => void;
  onOpenGuide: () => void;
  onSwitchToClientMode?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  items,
  isLoading,
  onSelectItem,
  onOpenGuide,
  onSwitchToClientMode,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isUpdatingId, setIsUpdatingId] = useState<string | null>(null);

  // 종합 통계 계산
  const stats = useMemo(() => {
    const total = items.length;
    const pending = items.filter((i) => i.status === 'pending').length;
    const inProgress = items.filter((i) => i.status === 'in_progress').length;
    const completed = items.filter((i) => i.status === 'completed').length;
    const urgent = items.filter((i) => i.isUrgent).length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    // 카테고리별 분포 집계
    const categoryCounts: Record<string, number> = {
      '일반 문의': 0,
      '서비스 안내': 0,
      '비용 및 견적': 0,
      '기술 지원': 0,
      '기타 요청': 0,
    };
    items.forEach((item) => {
      if (categoryCounts[item.category] !== undefined) {
        categoryCounts[item.category] += 1;
      } else {
        categoryCounts[item.category] = 1;
      }
    });

    return {
      total,
      pending,
      inProgress,
      completed,
      urgent,
      completionRate,
      categoryCounts,
    };
  }, [items]);

  // 검색 및 필터링된 데이터
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

  // 빠른 상태 변경 핸들러
  const handleQuickStatus = async (e: React.MouseEvent, id: string, newStatus: ConsultationStatus) => {
    e.stopPropagation();
    setIsUpdatingId(id);
    try {
      await updateConsultationStatus(id, newStatus);
    } catch (err) {
      alert('상태 변경 실패: ' + err);
    } finally {
      setIsUpdatingId(null);
    }
  };

  // 삭제 핸들러
  const handleDelete = async (e: React.MouseEvent, id: string, title: string) => {
    e.stopPropagation();
    if (window.confirm(`[${title}] 상담 건을 영구 삭제하시겠습니까?`)) {
      try {
        await deleteConsultation(id);
      } catch (err) {
        alert('삭제 실패: ' + err);
      }
    }
  };

  // CSV 내보내기 핸들러
  const handleExportCSV = () => {
    if (items.length === 0) {
      alert('내보낼 상담 데이터가 없습니다.');
      return;
    }

    const headers = ['고유ID', '제목', '내용', '신청인', '연락처', '카테고리', '상태', '긴급여부', '등록일시', '답변내용'];
    const rows = items.map((i) => [
      i.id,
      `"${i.title.replace(/"/g, '""')}"`,
      `"${i.content.replace(/"/g, '""')}"`,
      `"${i.clientName.replace(/"/g, '""')}"`,
      `"${i.contact.replace(/"/g, '""')}"`,
      i.category,
      i.status,
      i.isUrgent ? '긴급' : '일반',
      i.createdAt,
      `"${(i.reply || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `상담통합데이터_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div id="admin-dashboard-container" className="w-full max-w-6xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* 1. 대시보드 상단 헤더 & 컨트롤 */}
      <div className="bg-white rounded-2xl border border-[#EEEEEE] p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider bg-[#EFF6FF] text-[#2563EB] rounded-md flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>관리자 관제 콘솔 (ADMIN DASHBOARD)</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#F0FDF4] text-[#166534] border border-[#DCFCE7]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                <span>실시간 Cloud DB 집계</span>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111827]">
              실시간 고객 상담 통합 대시보드
            </h1>
            <p className="text-sm text-[#6B7280]">
              사용자들이 등록한 모든 상담 데이터를 한눈에 분석하고 답변 및 처리 상태를 실시간으로 관리합니다.
            </p>
          </div>

          {/* 헤더 우측 빠른 액션 */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              id="admin-export-csv-btn"
              type="button"
              onClick={handleExportCSV}
              className="px-3.5 py-2 text-xs font-semibold text-[#374151] bg-[#F3F4F6] hover:bg-[#E5E7EB] rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="전체 상담 데이터를 엑셀(CSV) 파일로 다운로드합니다"
            >
              <Download className="w-4 h-4 text-[#6B7280]" />
              <span>전체 엑셀(CSV) 저장</span>
            </button>

            {onSwitchToClientMode && (
              <button
                type="button"
                onClick={onSwitchToClientMode}
                className="px-3.5 py-2 text-xs font-semibold text-[#2563EB] bg-[#EFF6FF] hover:bg-[#DBEAFE] rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                title="일반 고객이 보는 상담 신청 폼 화면을 확인합니다"
              >
                <Sparkles className="w-4 h-4" />
                <span>신청 폼 뷰 확인</span>
              </button>
            )}

            <button
              type="button"
              onClick={onOpenGuide}
              className="px-3 py-2 text-xs font-medium text-[#6B7280] hover:text-[#111827] bg-[#F9FAFB] hover:bg-[#F3F4F6] rounded-xl transition-all border border-[#EEEEEE] cursor-pointer"
              title="DB 구조 및 가이드"
            >
              <span>DB 구조 가이드</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. 핵심 지표 KPI 카드 그리드 (6개 지표) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* 전체 건수 */}
        <div 
          onClick={() => setSelectedStatus('all')}
          className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
            selectedStatus === 'all' 
              ? 'bg-white border-[#2563EB] ring-2 ring-[#2563EB]/10 shadow-xs' 
              : 'bg-white border-[#EEEEEE] hover:border-slate-300'
          }`}
        >
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF]">총 접수 상담</span>
          <div className="text-2xl sm:text-3xl font-bold text-[#111827] mt-1.5 flex items-baseline gap-1">
            <span>{stats.total}</span>
            <span className="text-xs font-normal text-[#9CA3AF]">건</span>
          </div>
          <span className="text-[11px] text-[#6B7280] mt-1 block">누적 등록 데이터</span>
        </div>

        {/* 접수 대기 */}
        <div 
          onClick={() => setSelectedStatus('pending')}
          className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
            selectedStatus === 'pending' 
              ? 'bg-white border-[#2563EB] ring-2 ring-[#2563EB]/10 shadow-xs' 
              : 'bg-white border-[#EEEEEE] hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#2563EB]">접수 대기</span>
            {stats.pending > 0 && <span className="w-2 h-2 rounded-full bg-[#2563EB] animate-pulse" />}
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-[#2563EB] mt-1.5 flex items-baseline gap-1">
            <span>{stats.pending}</span>
            <span className="text-xs font-normal text-[#9CA3AF]">건</span>
          </div>
          <span className="text-[11px] text-[#2563EB] font-medium mt-1 block">
            {stats.pending > 0 ? '신속 답변 필요' : '모두 확인됨'}
          </span>
        </div>

        {/* 상담 진행중 */}
        <div 
          onClick={() => setSelectedStatus('in_progress')}
          className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
            selectedStatus === 'in_progress' 
              ? 'bg-white border-[#2563EB] ring-2 ring-[#2563EB]/10 shadow-xs' 
              : 'bg-white border-[#EEEEEE] hover:border-slate-300'
          }`}
        >
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#374151]">상담 진행중</span>
          <div className="text-2xl sm:text-3xl font-bold text-[#111827] mt-1.5 flex items-baseline gap-1">
            <span>{stats.inProgress}</span>
            <span className="text-xs font-normal text-[#9CA3AF]">건</span>
          </div>
          <span className="text-[11px] text-[#6B7280] mt-1 block">검토 및 조치 중</span>
        </div>

        {/* 답변 완료 */}
        <div 
          onClick={() => setSelectedStatus('completed')}
          className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
            selectedStatus === 'completed' 
              ? 'bg-white border-[#10B981] ring-2 ring-[#10B981]/10 shadow-xs' 
              : 'bg-white border-[#EEEEEE] hover:border-slate-300'
          }`}
        >
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#10B981]">답변 완료</span>
          <div className="text-2xl sm:text-3xl font-bold text-[#10B981] mt-1.5 flex items-baseline gap-1">
            <span>{stats.completed}</span>
            <span className="text-xs font-normal text-[#9CA3AF]">건</span>
          </div>
          <span className="text-[11px] text-[#10B981] font-medium mt-1 block">답변 등록 완료</span>
        </div>

        {/* 답변율 */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#EEEEEE]">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF]">답변 처리율</span>
          <div className="text-2xl sm:text-3xl font-bold text-[#111827] mt-1.5 flex items-baseline gap-1">
            <span>{stats.completionRate}</span>
            <span className="text-xs font-normal text-[#9CA3AF]">%</span>
          </div>
          <div className="w-full bg-[#F3F4F6] h-1.5 rounded-full mt-2 overflow-hidden">
            <div 
              className="bg-[#10B981] h-full rounded-full transition-all duration-500" 
              style={{ width: `${stats.completionRate}%` }} 
            />
          </div>
        </div>

        {/* 긴급 요청 */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#EEEEEE]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600">긴급 요청</span>
            {stats.urgent > 0 && <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />}
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-rose-600 mt-1.5 flex items-baseline gap-1">
            <span>{stats.urgent}</span>
            <span className="text-xs font-normal text-[#9CA3AF]">건</span>
          </div>
          <span className="text-[11px] text-rose-500 font-medium mt-1 block">
            {stats.urgent > 0 ? '우선 확인 요망' : '긴급 건 없음'}
          </span>
        </div>
      </div>

      {/* 3. 데이터 시각화 & 분석 섹션 (분야별 분포 & 처리 상태 비율) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 카테고리별 상담 분포 바 차트 */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-[#EEEEEE] shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#EEEEEE]">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#2563EB]" />
              <h3 className="text-sm font-bold text-[#111827]">분야별 상담 신청 분포 현황</h3>
            </div>
            <span className="text-xs text-[#9CA3AF]">총 5개 카테고리</span>
          </div>

          <div className="space-y-3.5">
            {Object.entries(stats.categoryCounts).map(([catName, val]) => {
              const count = Number(val);
              const percent = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
              return (
                <div key={catName} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-[#374151]">{catName}</span>
                    <span className="text-[#6B7280]">
                      <strong className="text-[#111827]">{count}건</strong> ({percent}%)
                    </span>
                  </div>
                  <div className="w-full bg-[#F3F4F6] h-2 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#2563EB] rounded-full transition-all duration-500" 
                      style={{ width: `${percent}%` }} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 처리 상태 비율 & 빠른 관리 팁 */}
        <div className="bg-white p-6 rounded-2xl border border-[#EEEEEE] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#EEEEEE]">
              <TrendingUp className="w-4 h-4 text-[#10B981]" />
              <h3 className="text-sm font-bold text-[#111827]">상담 처리 진행 현황</h3>
            </div>

            {/* 멀티 컬러 프로그레스 바 */}
            <div className="w-full h-3 bg-[#F3F4F6] rounded-full overflow-hidden flex mb-4">
              {stats.total > 0 ? (
                <>
                  <div 
                    title={`완료: ${stats.completed}건`} 
                    style={{ width: `${(stats.completed / stats.total) * 100}%` }} 
                    className="bg-[#10B981] h-full" 
                  />
                  <div 
                    title={`진행중: ${stats.inProgress}건`} 
                    style={{ width: `${(stats.inProgress / stats.total) * 100}%` }} 
                    className="bg-[#2563EB] h-full" 
                  />
                  <div 
                    title={`대기: ${stats.pending}건`} 
                    style={{ width: `${(stats.pending / stats.total) * 100}%` }} 
                    className="bg-[#F59E0B] h-full" 
                  />
                </>
              ) : (
                <div className="w-full bg-[#E5E7EB] h-full" />
              )}
            </div>

            {/* 범례 */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-[#374151]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                  답변 완료
                </span>
                <span className="font-semibold text-[#111827]">{stats.completed}건</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-[#374151]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB]" />
                  상담 진행중
                </span>
                <span className="font-semibold text-[#111827]">{stats.inProgress}건</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-[#374151]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
                  대기중
                </span>
                <span className="font-semibold text-[#111827]">{stats.pending}건</span>
              </div>
            </div>
          </div>

          <div className="mt-6 p-3 bg-[#F9FAFB] rounded-xl border border-[#EEEEEE] text-[11px] text-[#6B7280]">
            💡 <strong>관리자 팁:</strong> 아래 상담 목록에서 상태 버튼을 클릭하면 즉시 데이터베이스의 처리 상태가 업데이트됩니다.
          </div>
        </div>
      </div>

      {/* 4. 종합 상담 관리 테이블 (실제 사람들이 남긴 데이터 모아보기) */}
      <div className="bg-white rounded-2xl border border-[#EEEEEE] shadow-xs overflow-hidden">
        {/* 테이블 상단 필터 & 검색 바 */}
        <div className="p-5 border-b border-[#EEEEEE] space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="admin-search-input"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="제목, 내용, 신청인, 연락처 검색..."
                className="w-full pl-9 pr-4 py-2.5 text-xs sm:text-sm bg-[#F3F4F6] border border-transparent rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-[#111827] placeholder:text-[#9CA3AF] transition-all"
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

            <div className="flex items-center gap-2">
              {/* 상태 필터 드롭다운/셀렉트 */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 text-xs bg-[#F3F4F6] rounded-xl text-[#374151] border border-transparent focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB] cursor-pointer font-medium"
              >
                <option value="all">모든 상태</option>
                <option value="pending">대기중</option>
                <option value="in_progress">상담 진행중</option>
                <option value="completed">답변 완료</option>
              </select>

              {/* 분야 필터 */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 text-xs bg-[#F3F4F6] rounded-xl text-[#374151] border border-transparent focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB] cursor-pointer font-medium"
              >
                <option value="all">모든 분야</option>
                <option value="일반 문의">일반 문의</option>
                <option value="서비스 안내">서비스 안내</option>
                <option value="비용 및 견적">비용 및 견적</option>
                <option value="기술 지원">기술 지원</option>
                <option value="기타 요청">기타 요청</option>
              </select>
            </div>
          </div>
        </div>

        {/* 테이블 목록 */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-12 text-center text-sm text-[#6B7280]">
              <div className="inline-block p-3 bg-[#EFF6FF] text-[#2563EB] rounded-full animate-spin mb-3">
                <RefreshCw className="w-5 h-5" />
              </div>
              <p className="font-semibold text-[#111827]">Firebase Cloud DB에서 상담 데이터를 실시간 동기화 중입니다...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="p-12 text-center text-[#6B7280]">
              <Inbox className="w-10 h-10 mx-auto text-[#9CA3AF] mb-3" />
              <h4 className="font-bold text-[#111827]">조건에 맞는 상담 데이터가 없습니다.</h4>
              <p className="text-xs text-[#9CA3AF] mt-1">검색어를 지우거나 필터를 초기화해 보세요.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-[#EEEEEE] bg-[#F9FAFB] text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                  <th className="py-3.5 px-4">처리 상태</th>
                  <th className="py-3.5 px-4">분야</th>
                  <th className="py-3.5 px-4">상담 제목 및 요청 내용</th>
                  <th className="py-3.5 px-4">신청인 / 연락처</th>
                  <th className="py-3.5 px-4">접수 일시</th>
                  <th className="py-3.5 px-4 text-center">관리자 답변</th>
                  <th className="py-3.5 px-4 text-right">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEEEEE]">
                {filteredItems.map((item) => (
                  <tr 
                    key={item.id}
                    onClick={() => onSelectItem(item)}
                    className="hover:bg-[#F9FAFB] transition-colors cursor-pointer group"
                  >
                    {/* 상태 변경 칩 */}
                    <td className="py-4 px-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="inline-flex items-center gap-1">
                        <select
                          disabled={isUpdatingId === item.id}
                          value={item.status}
                          onChange={(e) => handleQuickStatus(e as any, item.id, e.target.value as ConsultationStatus)}
                          className={`text-xs font-semibold px-2.5 py-1 rounded-md border-0 focus:outline-none focus:ring-1 focus:ring-[#2563EB] cursor-pointer ${
                            item.status === 'pending'
                              ? 'bg-[#EFF6FF] text-[#2563EB]'
                              : item.status === 'in_progress'
                              ? 'bg-slate-100 text-slate-700'
                              : 'bg-[#F0FDF4] text-[#10B981]'
                          }`}
                        >
                          <option value="pending">대기중</option>
                          <option value="in_progress">진행중</option>
                          <option value="completed">완료</option>
                        </select>
                      </div>
                    </td>

                    {/* 카테고리 & 긴급 */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-medium text-[#374151]">{item.category}</span>
                        {item.isUrgent && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded w-fit">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            긴급
                          </span>
                        )}
                      </div>
                    </td>

                    {/* 제목 및 내용 요약 */}
                    <td className="py-4 px-4 max-w-xs sm:max-w-md">
                      <div className="font-bold text-[#111827] group-hover:text-[#2563EB] transition-colors line-clamp-1">
                        {item.title}
                      </div>
                      <div className="text-xs text-[#6B7280] line-clamp-1 mt-0.5">
                        {item.content}
                      </div>
                    </td>

                    {/* 신청인 및 연락처 */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="font-medium text-[#111827] flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-[#9CA3AF]" />
                        <span>{item.clientName}</span>
                      </div>
                      <div className="text-xs text-[#6B7280] flex items-center gap-1 mt-0.5">
                        <Phone className="w-3.5 h-3.5 text-[#9CA3AF]" />
                        <span>{item.contact}</span>
                      </div>
                    </td>

                    {/* 접수 일시 */}
                    <td className="py-4 px-4 whitespace-nowrap text-xs text-[#6B7280]">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#9CA3AF]" />
                        <span>{formatDate(item.createdAt)}</span>
                      </div>
                    </td>

                    {/* 관리자 답변 상태 */}
                    <td className="py-4 px-4 whitespace-nowrap text-center">
                      {item.reply ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#10B981] bg-[#F0FDF4] px-2 py-0.5 rounded-md">
                          <CheckCircle2 className="w-3 h-3" />
                          답변 완료
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#9CA3AF] bg-[#F3F4F6] px-2 py-0.5 rounded-md">
                          미답변
                        </span>
                      )}
                    </td>

                    {/* 관리 액션 */}
                    <td className="py-4 px-4 whitespace-nowrap text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => onSelectItem(item)}
                          className="px-2.5 py-1.5 text-xs font-semibold text-[#2563EB] bg-[#EFF6FF] hover:bg-[#DBEAFE] rounded-lg transition-colors cursor-pointer"
                          title="상담 상세 및 답변 작성"
                        >
                          답변/상세
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDelete(e, item.id, item.title)}
                          className="p-1.5 text-[#9CA3AF] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="상담 삭제"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* 테이블 하단 푸터 */}
        <div className="p-4 bg-[#F9FAFB] border-t border-[#EEEEEE] flex flex-col sm:flex-row items-center justify-between text-xs text-[#6B7280] gap-2">
          <span>
            총 <strong className="text-[#111827]">{filteredItems.length}</strong>개의 상담 내역이 표시되고 있습니다.
          </span>
          <span className="text-[11px] text-[#9CA3AF]">
            상담 행을 클릭하면 상세 모달이 열려 답변을 작성하거나 피드백을 남길 수 있습니다.
          </span>
        </div>
      </div>
    </div>
  );
};
