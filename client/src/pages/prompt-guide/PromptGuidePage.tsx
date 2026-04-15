import React, { useState, useMemo } from 'react';
import {
  Plus,
  MessageSquare,
  LayoutGrid,
  List,
  Search,
  ArrowRight,
  Copy,
  Download,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  Check,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx } from 'clsx';
import { toast } from 'sonner';

import { promptSamples, type PromptSample } from './data';
import { AddSampleModal } from './AddSampleModal';
import { SampleDetailView } from './SampleDetailView';

// ---------------------------------------------------------------------------
// Header (simplified from Root.tsx -- no router, no sidebar)
// ---------------------------------------------------------------------------

function Header({
  currentUser,
  onSwitchUser,
  staffList,
}: {
  currentUser: { name: string; role: string; avatar: string };
  onSwitchUser: (staff: { name: string; role: string; avatar: string }) => void;
  staffList: { name: string; role: string; avatar: string }[];
}) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  return (
    <header className="flex-shrink-0 z-20 bg-white/80 backdrop-blur-md border-b border-neutral-200 px-2 py-1 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <div className="w-8 h-8 bg-neutral-900 rounded-lg flex items-center justify-center flex-shrink-0">
            <Plus className="text-white w-5 h-5" />
          </div>
          <span className="font-black text-sm tracking-tighter uppercase italic">
            Prompt Archive
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative">
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-1 pl-1 pr-2 py-1.5 rounded-full border border-neutral-200 hover:bg-neutral-50 transition-all bg-white shadow-sm"
          >
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-neutral-900">{currentUser.name}</p>
              <p className="text-[10px] text-neutral-400">{currentUser.role === 'Admin' ? '전체 관리자' : '일반 직원'}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-neutral-100 overflow-hidden border border-neutral-200">
              <img src={currentUser.avatar} alt="Profile" className="w-full h-full object-cover" />
            </div>
            <ChevronRight size={14} className={clsx("text-neutral-400 transition-transform", isUserMenuOpen ? "rotate-90" : "")} />
          </button>

          <AnimatePresence>
            {isUserMenuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsUserMenuOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-56 bg-white border border-neutral-200 rounded-md shadow-sm z-20 overflow-hidden"
                >
                  <div className="p-1 border-b border-neutral-100 bg-neutral-50">
                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider px-2">계정 전환</p>
                  </div>
                  <div className="p-1">
                    {staffList.map((staff) => (
                      <button
                        key={staff.name}
                        onClick={() => {
                          onSwitchUser(staff);
                          setIsUserMenuOpen(false);
                        }}
                        className={clsx(
                          "flex items-center gap-1 w-full px-2 py-1 rounded-md text-sm transition-colors",
                          currentUser.name === staff.name ? "bg-neutral-100 font-bold" : "hover:bg-neutral-50"
                        )}
                      >
                        <img src={staff.avatar} className="w-6 h-6 rounded-full border border-neutral-200" alt="" />
                        <div className="flex-1 text-left">
                          <p className="text-xs">{staff.name}</p>
                          <p className="text-[9px] text-neutral-400">{staff.role}</p>
                        </div>
                        {currentUser.name === staff.name && <div className="w-1.5 h-1.5 rounded-full bg-neutral-800" />}
                      </button>
                    ))}
                  </div>
                  {currentUser.role === 'Admin' && (
                    <div className="p-2 border-t border-neutral-100">
                      <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-neutral-900 text-white text-[10px] font-bold">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        전체 직원 데이터 조회 모드 활성
                      </div>
                    </div>
                  )}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}

// ---------------------------------------------------------------------------
// SampleCard (from Dashboard.tsx)
// ---------------------------------------------------------------------------

function SampleCard({
  sample,
  onMouseEnter,
  isHovered,
  isCheckboxSelected,
  onToggleSelect,
}: {
  sample: PromptSample;
  onMouseEnter: () => void;
  isHovered: boolean;
  isCheckboxSelected: boolean;
  onToggleSelect: (e: React.MouseEvent) => void;
}) {
  return (
    <motion.div
      layout
      onMouseEnter={onMouseEnter}
      className={clsx(
        "group cursor-pointer bg-white border rounded-[24px] overflow-hidden transition-all duration-300 flex flex-col h-full relative",
        isHovered ? "ring-2 ring-neutral-800 border-transparent shadow-sm translate-y-[-4px]" : "border-neutral-200 shadow-sm",
        isCheckboxSelected ? "bg-neutral-50" : ""
      )}
    >
      <div className="aspect-video relative overflow-hidden bg-[#f0f0f0]">
        <img
          src={sample.imageUrl}
          alt={sample.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100"
        />
        <div className="absolute top-3 left-3">
          <div
            onClick={onToggleSelect}
            className={clsx(
              "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
              isCheckboxSelected
                ? "bg-neutral-800 border-neutral-800 text-white"
                : "bg-white/80 backdrop-blur-sm border-white group-hover:border-neutral-200"
            )}
          >
            {isCheckboxSelected && <Check size={12} />}
          </div>
        </div>
        <div className="absolute top-3 right-3">
          <span className="px-2 py-0.5 bg-white/90 backdrop-blur-md text-[8px] font-extrabold tracking-tight uppercase rounded-full shadow-sm text-neutral-800">
            {sample.category}
          </span>
        </div>
      </div>
      <div className="p-2 flex flex-col flex-1 space-y-2">
        <h3 className="font-bold text-sm text-neutral-900 uppercase tracking-tight group-hover:text-neutral-600 transition-colors">
          {sample.category}
        </h3>
        <div className="space-y-1">
          <p className="font-bold text-[11px] text-neutral-500 line-clamp-1">
            {sample.title}
          </p>
          <p className="text-[10px] text-neutral-400 line-clamp-2 leading-relaxed h-8">
            {sample.summary}
          </p>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-neutral-50">
          <span className="text-[9px] text-neutral-400 font-bold">{sample.date}</span>
          <span className="flex items-center gap-1 text-[9px] text-neutral-400 font-bold">
            <MessageSquare size={10} /> {sample.supplementaryPrompts.length + 1}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// DashboardView (from Dashboard.tsx)
// ---------------------------------------------------------------------------

function DashboardView({
  onOpenAddModal,
  onSelectSample,
}: {
  onOpenAddModal: () => void;
  onSelectSample: (sample: PromptSample) => void;
}) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [hoveredSample, setHoveredSample] = useState<PromptSample | null>(promptSamples[0]);
  const [categoryFilter, setCategoryFilter] = useState<string>('전체');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const categories = ['전체', 'UIUX', 'DB', '홈페이지', '관리자페이지'];

  const categoryStats = useMemo(() => {
    const stats: Record<string, number> = { 전체: promptSamples.length };
    promptSamples.forEach(s => {
      stats[s.category] = (stats[s.category] || 0) + 1;
    });
    return stats;
  }, []);

  const filteredSamples = useMemo(() => {
    return promptSamples.filter(s => {
      const matchesSearch = s.title.toLowerCase().includes(search.toLowerCase()) ||
        s.primaryPrompt.toLowerCase().includes(search.toLowerCase()) ||
        s.summary.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter === '전체' || s.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [search, categoryFilter]);

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredSamples.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredSamples.map(s => s.id));
    }
  };

  const toggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="flex flex-col h-full overflow-hidden p-2 space-y-2">
      {/* 보기 전환 및 액션 바 */}
      <section className="flex items-center justify-between">
        <div className="flex items-center gap-1 bg-white p-1 rounded-md border border-neutral-200 shadow-sm">
          <button
            onClick={() => setViewMode('grid')}
            className={clsx(
              "flex items-center gap-2 px-2 py-1 rounded-md text-xs font-bold transition-all",
              viewMode === 'grid' ? "bg-neutral-900 text-white shadow-sm" : "text-neutral-400 hover:text-neutral-900"
            )}
          >
            <LayoutGrid size={16} /> 대시보드
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={clsx(
              "flex items-center gap-2 px-2 py-1 rounded-md text-xs font-bold transition-all",
              viewMode === 'list' ? "bg-neutral-900 text-white shadow-sm" : "text-neutral-400 hover:text-neutral-900"
            )}
          >
            <List size={16} /> 샘플 리스트
          </button>
        </div>

        <div className="flex items-center gap-1">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="검색..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-neutral-200 rounded-md pl-1 pr-2 py-1 text-sm focus:ring-2 focus:ring-neutral-200 outline-none shadow-sm"
            />
          </div>
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-2 px-2 py-1 bg-neutral-900 text-white rounded-md text-xs font-bold hover:bg-neutral-800 transition-all shadow-sm active:scale-95"
          >
            <Plus size={16} /> 샘플 추가
          </button>
        </div>
      </section>

      {/* 최상단 현황 기록 */}
      <section className="bg-white border border-neutral-200 rounded-md p-2 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-1 px-2 overflow-x-auto">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={clsx(
                "flex flex-col text-left transition-all",
                categoryFilter === cat ? "opacity-100 scale-110" : "opacity-40 hover:opacity-70"
              )}
            >
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">{cat}</span>
              <div className="flex items-baseline gap-1">
                <span className="text-xs font-black text-neutral-900">{categoryStats[cat] || 0}</span>
                <span className="text-[10px] text-neutral-400 font-bold">개</span>
              </div>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 pr-2">
          <button className="flex items-center gap-2 px-2 py-1 bg-neutral-50 rounded-md text-[11px] font-bold text-neutral-500 border border-neutral-100 hover:text-neutral-900 transition-colors">
            <Download size={14} /> 엑셀 다운로드
          </button>
          <button className="flex items-center gap-2 px-2 py-1 bg-neutral-50 rounded-md text-[11px] font-bold text-neutral-500 border border-neutral-100 hover:text-neutral-900 transition-colors">
            <FileText size={14} /> 워드 다운로드
          </button>
        </div>
      </section>

      {/* 메인 레이아웃: 전환 모드에 따라 다르게 렌더링 */}
      <div className="flex-1 flex gap-2 min-h-0">
        <AnimatePresence mode="wait">
          {viewMode === 'grid' ? (
            <motion.div
              key="grid"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex-1 flex gap-2 min-h-0"
            >
              {/* 카드 그리드 영역 */}
              <div className="flex-1 min-h-0 overflow-y-auto pr-2 custom-scrollbar">
                <div className="grid gap-2 grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
                  {filteredSamples.map((sample) => (
                    <SampleCard
                      key={sample.id}
                      sample={sample}
                      onMouseEnter={() => setHoveredSample(sample)}
                      isHovered={hoveredSample?.id === sample.id}
                      isCheckboxSelected={selectedIds.includes(sample.id)}
                      onToggleSelect={(e) => toggleSelect(sample.id, e)}
                    />
                  ))}
                </div>
              </div>

              {/* 호버 상세 사이드바 */}
              <aside className="w-[450px] lg:w-[550px] bg-white border border-neutral-200 rounded-[32px] overflow-hidden shadow-sm flex flex-col min-h-0 self-stretch relative">
                <AnimatePresence mode="wait">
                  {hoveredSample ? (
                    <motion.div
                      key={hoveredSample.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                      className="flex flex-col h-full"
                    >
                      <div className="p-2 border-b border-neutral-100 bg-neutral-50/50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="px-2 py-0.5 bg-neutral-800 text-white text-[9px] font-bold rounded-full uppercase italic">
                            {hoveredSample.category}
                          </span>
                          <span className="text-[10px] text-neutral-400 font-bold">{hoveredSample.date}</span>
                        </div>
                        <h2 className="text-sm font-bold text-neutral-900 leading-tight">
                          {hoveredSample.title}
                        </h2>
                      </div>

                      <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
                        {/* 프롬프트 워크플로우 */}
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-neutral-900">
                            <MessageSquare size={16} className="text-neutral-400" />
                            <h3 className="text-sm font-bold uppercase tracking-wider">프롬프트 워크플로우</h3>
                          </div>
                          <div className="space-y-1 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[1px] before:bg-neutral-100">
                            <div className="relative pl-1">
                              <div className="absolute left-0 top-0 w-6 h-6 rounded-full bg-neutral-900 flex items-center justify-center text-white text-[10px] font-bold shadow-md">1</div>
                              <div className="p-2 bg-white rounded-md border border-neutral-100 text-xs text-neutral-700 leading-relaxed shadow-sm">
                                {hoveredSample.primaryPrompt}
                              </div>
                            </div>
                            {hoveredSample.supplementaryPrompts.map((p, i) => (
                              <div key={i} className="relative pl-1">
                                <div className="absolute left-0 top-0 w-6 h-6 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 text-[10px] font-bold border border-neutral-200">{i + 2}</div>
                                <div className="p-2 bg-neutral-50/50 rounded-md border border-neutral-100 text-xs text-neutral-500 italic leading-relaxed">
                                  {p}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* 요구사항 목록 */}
                        {hoveredSample.requirements && hoveredSample.requirements.length > 0 && (
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-neutral-900">
                              <CheckCircle2 size={16} className="text-neutral-400" />
                              <h3 className="text-sm font-bold uppercase tracking-wider">주요 구현 요구사항</h3>
                            </div>
                            <div className="grid grid-cols-1 gap-2">
                              {hoveredSample.requirements.map((req, idx) => (
                                <div key={idx} className="flex items-start gap-1 p-1 bg-white border border-neutral-100 rounded-md shadow-sm">
                                  <div className="w-5 h-5 rounded-full bg-neutral-100 flex items-center justify-center text-[10px] font-bold text-neutral-500 flex-shrink-0">
                                    {idx + 1}
                                  </div>
                                  <span className="text-xs text-neutral-700 font-medium leading-relaxed">{req}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* 최종 결과물 캡처 */}
                        <div className="space-y-1 pb-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-neutral-900">
                              <ImageIcon size={16} className="text-neutral-400" />
                              <h3 className="text-sm font-bold uppercase tracking-wider">최종 결과물 캡처</h3>
                            </div>
                            <div className="flex gap-1">
                              <button className="p-1.5 bg-neutral-50 rounded-lg text-neutral-400 hover:text-neutral-900 transition-colors">
                                <Download size={14} />
                              </button>
                              <button className="p-1.5 bg-neutral-50 rounded-lg text-neutral-400 hover:text-neutral-900 transition-colors">
                                <Copy size={14} />
                              </button>
                            </div>
                          </div>
                          <div className="rounded-md overflow-hidden border border-neutral-200 shadow-sm shadow-neutral-100">
                            <img src={hoveredSample.imageUrl} className="w-full h-auto object-cover" alt="Result" />
                          </div>
                        </div>
                      </div>

                      <div className="p-2 bg-neutral-50 border-t border-neutral-100">
                        <button
                          onClick={() => onSelectSample(hoveredSample)}
                          className="w-full py-1.5 bg-neutral-900 text-white rounded-md text-xs font-bold hover:bg-neutral-800 transition-all shadow-sm active:scale-95"
                        >
                          이 워크플로우 그대로 적용하기
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-neutral-300 p-1 text-center space-y-1">
                      <LayoutGrid size={48} strokeWidth={1} />
                      <p className="text-sm font-medium">카드를 마우스오버하여<br />상세 내용을 미리 확인하세요.</p>
                    </div>
                  )}
                </AnimatePresence>
              </aside>
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex-1 bg-white border border-neutral-200 rounded-[32px] overflow-hidden shadow-sm flex flex-col"
            >
              <div className="overflow-x-auto h-full custom-scrollbar">
                <table className="w-full text-left border-collapse table-fixed min-w-[1200px]">
                  <thead>
                    <tr className="bg-neutral-50/80 border-b border-neutral-100 sticky top-0 z-10">
                      <th className="px-2 py-1 w-12 text-center">
                        <input
                          type="checkbox"
                          checked={selectedIds.length === filteredSamples.length && filteredSamples.length > 0}
                          onChange={toggleSelectAll}
                          className="w-4 h-4 rounded border-neutral-300 focus:ring-neutral-200"
                        />
                      </th>
                      <th className="px-2 py-1 text-[10px] font-black text-neutral-400 uppercase tracking-widest w-[100px]">분류</th>
                      <th className="px-2 py-1 text-[10px] font-black text-neutral-400 uppercase tracking-widest w-[180px]">업무명</th>
                      <th className="px-2 py-1 text-[10px] font-black text-neutral-400 uppercase tracking-widest w-[220px]">프롬프트 요약</th>
                      <th className="px-2 py-1 text-[10px] font-black text-neutral-400 uppercase tracking-widest w-[220px]">1차 프롬프트</th>
                      <th className="px-2 py-1 text-[10px] font-black text-neutral-400 uppercase tracking-widest w-[200px]">중요포인트</th>
                      <th className="px-2 py-1 text-[10px] font-black text-neutral-400 uppercase tracking-widest w-[100px]">등록일</th>
                      <th className="px-2 py-1 text-[10px] font-black text-neutral-400 uppercase tracking-widest w-[60px] text-right pr-1">이동</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-50">
                    {filteredSamples.map((sample) => (
                      <tr
                        key={sample.id}
                        className={clsx(
                          "hover:bg-neutral-50 transition-colors group",
                          selectedIds.includes(sample.id) ? "bg-neutral-50/50" : ""
                        )}
                      >
                        <td className="px-2 py-1 text-center align-top">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(sample.id)}
                            onChange={() => {
                              setSelectedIds(prev =>
                                prev.includes(sample.id) ? prev.filter(id => id !== sample.id) : [...prev, sample.id]
                              );
                            }}
                            className="w-4 h-4 rounded border-neutral-300 focus:ring-neutral-200"
                          />
                        </td>
                        <td className="px-2 py-1 align-top">
                          <span className="px-2 py-0.5 bg-neutral-100 text-neutral-800 text-[9px] font-black rounded uppercase italic">
                            {sample.category}
                          </span>
                        </td>
                        <td className="px-2 py-1 align-top">
                          <span className="font-bold text-sm text-neutral-900 group-hover:text-neutral-600 transition-colors">
                            {sample.title}
                          </span>
                        </td>
                        <td className="px-2 py-1 align-top">
                          <p className="text-xs text-neutral-500 leading-relaxed line-clamp-2">
                            {sample.summary}
                          </p>
                        </td>
                        <td className="px-2 py-1 align-top">
                          <p className="text-[11px] text-neutral-400 leading-relaxed line-clamp-2 italic">
                            {sample.primaryPrompt}
                          </p>
                        </td>
                        <td className="px-2 py-1 align-top">
                          <p className="text-[11px] text-neutral-700 font-semibold leading-relaxed line-clamp-2">
                            {sample.keyPoint}
                          </p>
                        </td>
                        <td className="px-2 py-1 align-top">
                          <span className="text-[11px] text-neutral-400 font-bold">{sample.date}</span>
                        </td>
                        <td className="px-2 py-1 text-right align-top pr-1">
                          <button
                            onClick={() => onSelectSample(sample)}
                            className="p-2 inline-block text-neutral-300 hover:text-neutral-900 transition-colors"
                          >
                            <ArrowRight size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredSamples.length === 0 && (
                  <div className="py-1 flex flex-col items-center justify-center text-center space-y-1">
                    <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center">
                      <Search size={32} className="text-neutral-200" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold">검색 결과가 없습니다</h3>
                      <p className="text-sm text-neutral-500 max-w-xs mx-auto">다른 검색어나 필터를 선택해 보세요.</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page Component
// ---------------------------------------------------------------------------

const staffList = [
  { name: '홍길동', role: 'Staff', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100' },
  { name: '김철수', role: 'Staff', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=100' },
  { name: '이영희', role: 'Staff', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100' },
  { name: '관리자', role: 'Admin', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100' },
];

export default function PromptGuidePage() {
  const [currentUser, setCurrentUser] = useState(staffList[0]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedSample, setSelectedSample] = useState<PromptSample | null>(null);

  return (
    <div className="flex h-screen bg-[#f0f0f0] text-neutral-900 font-sans overflow-hidden">
      <main className="flex-1 h-screen overflow-hidden flex flex-col relative">
        <Header
          currentUser={currentUser}
          onSwitchUser={setCurrentUser}
          staffList={staffList}
        />

        <div className="flex-1 min-h-0 overflow-hidden">
          {selectedSample ? (
            <div className="h-full overflow-y-auto custom-scrollbar">
              <SampleDetailView
                sample={selectedSample}
                onBack={() => setSelectedSample(null)}
              />
            </div>
          ) : (
            <DashboardView
              onOpenAddModal={() => setIsAddModalOpen(true)}
              onSelectSample={setSelectedSample}
            />
          )}
        </div>

        <AddSampleModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
        />
      </main>
    </div>
  );
}
