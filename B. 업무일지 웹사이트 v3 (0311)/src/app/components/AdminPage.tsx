import { useState, useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Search, Eye, Filter, X, ChevronDown, ChevronUp, List, CalendarDays } from 'lucide-react';
import { AIDetailModal } from './AIDetailModal';
import { MultiSelect } from './MultiSelect';
import { AdminCalendar } from './AdminCalendar';
import { loadLogs, employees, departmentCategories, homepageCategories, workTypes, aiToolsList } from './data';
import type { DailyLog, TimeSlotEntry } from './data';

interface FlatRow {
  date: string;
  department: string;
  employeeName: string;
  timeSlot: string;
  title: string;
  content: string;
  aiTools: string[];
  log: DailyLog;
  slotEntry: TimeSlotEntry;
}

export function AdminPage() {
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [showFilters, setShowFilters] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [expandedRowIds, setExpandedRowIds] = useState<Set<string>>(new Set());

  // Filters
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [filterDepts, setFilterDepts] = useState<string[]>([]);
  const [filterHp, setFilterHp] = useState<string[]>([]);
  const [filterWorkTypes, setFilterWorkTypes] = useState<string[]>([]);
  const [filterAI, setFilterAI] = useState<string[]>([]);
  const [searchText, setSearchText] = useState('');

  // Modal (Still keep for calendar view if needed, but the user asked to change the list view behavior)
  const [detailModal, setDetailModal] = useState<{ open: boolean; slot: TimeSlotEntry | null; timeSlot: string }>({
    open: false,
    slot: null,
    timeSlot: '',
  });

  useEffect(() => {
    setLogs(loadLogs());
  }, []);

  const flatRows: FlatRow[] = useMemo(() => {
    const rows: FlatRow[] = [];
    for (const log of logs) {
      const emp = employees.find(e => e.id === log.employeeId);
      if (!emp) continue;
      for (const slot of log.timeSlots) {
        if (!slot.title && !slot.content) continue;
        rows.push({
          date: log.date,
          department: emp.department,
          employeeName: emp.name,
          timeSlot: slot.timeSlot,
          title: slot.title,
          content: slot.content,
          aiTools: slot.aiDetail?.aiTools || [],
          log,
          slotEntry: slot,
        });
      }
    }
    return rows.sort((a, b) => b.date.localeCompare(a.date));
  }, [logs]);

  const filteredRows = useMemo(() => {
    return flatRows.filter(row => {
      if (dateFrom && row.date < dateFrom) return false;
      if (dateTo && row.date > dateTo) return false;
      if (filterDepts.length > 0 && !filterDepts.some(d => row.log.departmentCategories.includes(d) || row.department === d)) return false;
      if (filterHp.length > 0 && !filterHp.some(h => row.log.homepageCategories.includes(h))) return false;
      if (filterWorkTypes.length > 0 && row.slotEntry.aiDetail && !filterWorkTypes.some(w => row.slotEntry.aiDetail!.workTypes.includes(w))) return false;
      if (filterAI.length > 0 && !filterAI.some(a => row.aiTools.includes(a))) return false;
      if (searchText && !row.title.includes(searchText) && !row.employeeName.includes(searchText) && !row.content.includes(searchText)) return false;
      return true;
    });
  }, [flatRows, dateFrom, dateTo, filterDepts, filterHp, filterWorkTypes, filterAI, searchText]);

  const toggleExpand = (id: string) => {
    setExpandedRowIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const expandAll = () => {
    setExpandedRowIds(new Set(filteredRows.map(row => `${row.date}-${row.slotEntry.id}`)));
  };

  const collapseAll = () => {
    setExpandedRowIds(new Set());
  };

  const clearFilters = () => {
    setDateFrom('');
    setDateTo('');
    setFilterDepts([]);
    setFilterHp([]);
    setFilterWorkTypes([]);
    setFilterAI([]);
    setSearchText('');
  };

  const hasActiveFilters = dateFrom || dateTo || filterDepts.length || filterHp.length || filterWorkTypes.length || filterAI.length || searchText;

  return (
    <div className="max-w-[2000px] mx-auto px-3 py-3 space-y-2">
      {/* Top bar */}
      <div className="flex items-center justify-between flex-wrap gap-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">관리자 대시보드</span>
          <span className="text-xs text-muted-foreground">{filteredRows.length}건</span>
          
          {viewMode === 'list' && (
            <div className="flex items-center gap-1 ml-4 border-l border-border pl-4">
              <button
                onClick={expandAll}
                className="px-2 py-0.5 border border-border rounded text-[10px] hover:bg-accent transition-colors"
              >
                전부펼쳐보기
              </button>
              <button
                onClick={collapseAll}
                className="px-2 py-0.5 border border-border rounded text-[10px] hover:bg-accent transition-colors"
              >
                전체접어보기
              </button>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1">
          {/* View toggle */}
          <div className="flex border border-border rounded overflow-hidden">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1 px-2.5 py-1 transition-colors ${
                viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">리스트</span>
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-1 px-2.5 py-1 border-l border-border transition-colors ${
                viewMode === 'calendar' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">캘린더</span>
            </button>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1 px-2.5 py-1 border border-border rounded hover:bg-accent"
          >
            <Filter className="w-3.5 h-3.5" />
            필터
            {showFilters ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-card border border-border rounded p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">필터</span>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="flex items-center gap-0.5 text-destructive hover:underline">
                <X className="w-3.5 h-3.5" />
                초기화
              </button>
            )}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              placeholder="검색..."
              className="w-full pl-7 pr-3 py-1.5 border border-border rounded bg-input-background"
            />
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div>
              <label className="block mb-0.5 text-muted-foreground">시작일</label>
              <input
                type="date"
                value={dateFrom}
                onChange={e => setDateFrom(e.target.value)}
                className="w-full border border-border rounded p-1.5 bg-input-background"
              />
            </div>
            <div>
              <label className="block mb-0.5 text-muted-foreground">종료일</label>
              <input
                type="date"
                value={dateTo}
                onChange={e => setDateTo(e.target.value)}
                className="w-full border border-border rounded p-1.5 bg-input-background"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <MultiSelect label="부서" options={departmentCategories} selected={filterDepts} onChange={setFilterDepts} />
            <MultiSelect label="홈페이지" options={homepageCategories} selected={filterHp} onChange={setFilterHp} />
            <MultiSelect label="작업유형" options={workTypes} selected={filterWorkTypes} onChange={setFilterWorkTypes} />
            <MultiSelect label="AI" options={aiToolsList} selected={filterAI} onChange={setFilterAI} />
          </div>
        </div>
      )}

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <AdminCalendar
          filteredRows={filteredRows}
          onViewDetail={(slot, timeSlot) => setDetailModal({ open: true, slot, timeSlot })}
        />
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="bg-card border border-border rounded overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-accent/40 border-b border-border text-muted-foreground">
                  <th className="px-2 py-1.5 text-left">날짜</th>
                  <th className="px-2 py-1.5 text-left">부서</th>
                  <th className="px-2 py-1.5 text-left">작성자</th>
                  <th className="px-2 py-1.5 text-left">시간대</th>
                  <th className="px-2 py-1.5 text-left">제목</th>
                  <th className="px-2 py-1.5 text-left">AI</th>
                  <th className="px-2 py-1.5 text-center w-12">보기</th>
                </tr>
              </thead>
              {filteredRows.length === 0 ? (
                <tbody className="text-xs">
                  <tr>
                    <td colSpan={7} className="px-2 py-8 text-center text-muted-foreground">
                      데이터가 없습니다.
                    </td>
                  </tr>
                </tbody>
              ) : (
                filteredRows.map((row, i) => {
                  const rowId = `${row.date}-${row.slotEntry.id}`;
                  const isExpanded = expandedRowIds.has(rowId);
                  return (
                    <tbody key={`${rowId}-${i}`} className="text-xs">
                      <tr className={`border-b border-border hover:bg-accent/10 transition-colors ${isExpanded ? 'bg-accent/5' : ''}`}>
                        <td className="px-2 py-1.5 whitespace-nowrap">{row.date}</td>
                        <td className="px-2 py-1.5">{row.department}</td>
                        <td className="px-2 py-1.5 font-medium">{row.employeeName}</td>
                        <td className="px-2 py-1.5 whitespace-nowrap text-muted-foreground">{row.timeSlot}</td>
                        <td className="px-2 py-1.5">{row.title}</td>
                        <td className="px-2 py-1.5">
                          <div className="flex flex-wrap gap-0.5">
                            {row.aiTools.map(tool => (
                              <span key={tool} className="px-1.5 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 rounded text-[10px]">
                                {tool}
                              </span>
                            ))}
                            {row.aiTools.length === 0 && <span className="text-muted-foreground">-</span>}
                          </div>
                        </td>
                        <td className="px-2 py-1.5 text-center">
                          <button
                            onClick={() => toggleExpand(rowId)}
                            className={`p-1 rounded transition-colors ${isExpanded ? 'bg-primary text-primary-foreground' : 'hover:bg-accent text-primary'}`}
                            disabled={!row.slotEntry.aiDetail}
                          >
                            <Eye className={`w-3.5 h-3.5 ${!row.slotEntry.aiDetail ? 'opacity-20' : ''}`} />
                          </button>
                        </td>
                      </tr>
                      {isExpanded && row.slotEntry.aiDetail && (
                        <tr className="bg-accent/5 border-b border-border">
                          <td colSpan={7} className="px-4 py-3">
                            <div className="grid grid-cols-4 gap-6">
                              {/* Left Side: Basic Info & Instructions */}
                              <div className="space-y-3">
                                <div>
                                  <h4 className="text-[10px] font-bold text-muted-foreground uppercase mb-1">작업 유형</h4>
                                  <div className="flex flex-wrap gap-1">
                                    {row.slotEntry.aiDetail.workTypes?.map(t => (
                                      <span key={t} className="px-1.5 py-0.5 bg-muted rounded text-[10px]">{t}</span>
                                    ))}
                                  </div>
                                </div>
                                <div>
                                  <h4 className="text-[10px] font-bold text-muted-foreground uppercase mb-1">업무 지시 사항</h4>
                                  <div className="text-xs p-2 bg-white border border-border rounded min-h-[60px] whitespace-pre-wrap">
                                    {row.slotEntry.aiDetail.instructions}
                                  </div>
                                  {row.slotEntry.aiDetail.instructionNote && (
                                    <p className="mt-1 text-[10px] text-muted-foreground italic">비고: {row.slotEntry.aiDetail.instructionNote}</p>
                                  )}
                                </div>
                              </div>

                              {/* Prompts Grid */}
                              <div className="col-span-2 grid grid-cols-2 gap-3">
                                <div>
                                  <h4 className="text-[10px] font-bold text-muted-foreground uppercase mb-1">1차 프롬프트</h4>
                                  <div className="border border-border rounded overflow-hidden text-[10px] bg-white">
                                    <div className="grid grid-cols-[1fr,60px] bg-muted/50 border-b border-border font-bold p-1">
                                      <div>내용</div>
                                      <div>비고</div>
                                    </div>
                                    <div className="max-h-[120px] overflow-y-auto">
                                      {row.slotEntry.aiDetail.promptGrid1?.map(p => (
                                        <div key={p.id} className="grid grid-cols-[1fr,60px] border-b border-border/50 last:border-b-0 p-1">
                                          <div className="truncate pr-1">{p.content}</div>
                                          <div className="truncate text-muted-foreground">{p.note}</div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="text-[10px] font-bold text-muted-foreground uppercase mb-1">2차 프롬프트</h4>
                                  <div className="border border-border rounded overflow-hidden text-[10px] bg-white">
                                    <div className="grid grid-cols-[1fr,60px] bg-muted/50 border-b border-border font-bold p-1">
                                      <div>내용</div>
                                      <div>비고</div>
                                    </div>
                                    <div className="max-h-[120px] overflow-y-auto">
                                      {row.slotEntry.aiDetail.promptGrid2?.map(p => (
                                        <div key={p.id} className="grid grid-cols-[1fr,60px] border-b border-border/50 last:border-b-0 p-1">
                                          <div className="truncate pr-1">{p.content}</div>
                                          <div className="truncate text-muted-foreground">{p.note}</div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                                <div className="col-span-2">
                                  <h4 className="text-[10px] font-bold text-muted-foreground uppercase mb-1">중요 사항</h4>
                                  <div className="text-xs p-2 bg-white border border-border rounded whitespace-pre-wrap">
                                    {row.slotEntry.aiDetail.importantNotes}
                                  </div>
                                </div>
                              </div>

                              {/* Images & Regulations */}
                              <div className="space-y-3">
                                <div className="flex gap-2">
                                  <div className="flex-1">
                                    <h4 className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Before</h4>
                                    <div className="aspect-video bg-muted rounded border border-border overflow-hidden">
                                      {row.slotEntry.aiDetail.beforeImage ? (
                                        <img src={row.slotEntry.aiDetail.beforeImage} className="w-full h-full object-cover" />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground/50">No Image</div>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="text-[10px] font-bold text-muted-foreground uppercase mb-1">After</h4>
                                    <div className="aspect-video bg-muted rounded border border-border overflow-hidden">
                                      {row.slotEntry.aiDetail.afterImage ? (
                                        <img src={row.slotEntry.aiDetail.afterImage} className="w-full h-full object-cover" />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground/50">No Image</div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="text-[10px] font-bold text-muted-foreground uppercase mb-1">규정 검토</h4>
                                  <div className="grid grid-cols-2 gap-1 text-[10px]">
                                    <div className="p-1 border border-border rounded bg-white truncate" title={row.slotEntry.aiDetail.regulations}>규정: {row.slotEntry.aiDetail.regulations || '-'}</div>
                                    <div className="p-1 border border-border rounded bg-white truncate" title={row.slotEntry.aiDetail.semiRegulations}>준규정: {row.slotEntry.aiDetail.semiRegulations || '-'}</div>
                                    <div className="p-1 border border-border rounded bg-white truncate" title={row.slotEntry.aiDetail.optionalRegulations}>선택: {row.slotEntry.aiDetail.optionalRegulations || '-'}</div>
                                    <div className="p-1 border border-border rounded bg-white truncate" title={row.slotEntry.aiDetail.fieldRegulations}>분야: {row.slotEntry.aiDetail.fieldRegulations || '-'}</div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  );
                })
              )}
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-border">
            {filteredRows.length === 0 ? (
              <div className="px-3 py-8 text-center text-muted-foreground">
                데이터가 없습니다.
              </div>
            ) : (
              filteredRows.map((row, i) => {
                const rowId = `${row.date}-${row.slotEntry.id}`;
                const isExpanded = expandedRowIds.has(rowId);
                return (
                  <div key={`mobile-${rowId}-${i}`} className="p-2 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground">{row.date}</span>
                      <span className="bg-accent px-1.5 py-0.5 rounded text-[10px]">{row.department}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{row.employeeName}</span>
                      <span className="text-[10px] text-muted-foreground">{row.timeSlot}</span>
                    </div>
                    <p className="text-xs">{row.title}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-0.5">
                        {row.aiTools.map(tool => (
                          <span key={tool} className="px-1 py-0 bg-blue-50 text-blue-600 border border-blue-100 rounded text-[9px]">
                            {tool}
                          </span>
                        ))}
                      </div>
                      {row.slotEntry.aiDetail && (
                        <button
                          onClick={() => toggleExpand(rowId)}
                          className={`flex items-center gap-1 text-[11px] px-2 py-0.5 rounded border transition-colors ${
                            isExpanded ? 'bg-primary text-primary-foreground border-primary' : 'text-primary border-primary/20 hover:bg-accent'
                          }`}
                        >
                          <Eye className="w-3 h-3" />
                          {isExpanded ? '접기' : '상세보기'}
                        </button>
                      )}
                    </div>
                    
                    {isExpanded && row.slotEntry.aiDetail && (
                      <div className="mt-2 p-2 bg-accent/10 rounded border border-border space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
                        <div>
                          <h4 className="text-[9px] font-bold text-muted-foreground uppercase mb-1">지시사항</h4>
                          <p className="text-xs whitespace-pre-wrap">{row.slotEntry.aiDetail.instructions}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <h4 className="text-[9px] font-bold text-muted-foreground uppercase mb-1">Before</h4>
                            <div className="aspect-video bg-muted rounded border border-border">
                              {row.slotEntry.aiDetail.beforeImage && <img src={row.slotEntry.aiDetail.beforeImage} className="w-full h-full object-cover rounded" />}
                            </div>
                          </div>
                          <div>
                            <h4 className="text-[9px] font-bold text-muted-foreground uppercase mb-1">After</h4>
                            <div className="aspect-video bg-muted rounded border border-border">
                              {row.slotEntry.aiDetail.afterImage && <img src={row.slotEntry.aiDetail.afterImage} className="w-full h-full object-cover rounded" />}
                            </div>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-[9px] font-bold text-muted-foreground uppercase mb-1">중요 사항</h4>
                          <p className="text-[11px]">{row.slotEntry.aiDetail.importantNotes}</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Detail Modal */}
      <AIDetailModal
        isOpen={detailModal.open}
        onClose={() => setDetailModal({ open: false, slot: null, timeSlot: '' })}
        timeSlot={detailModal.timeSlot}
        initialData={detailModal.slot?.aiDetail}
        onSave={() => {}}
        readOnly
      />
    </div>
  );
}