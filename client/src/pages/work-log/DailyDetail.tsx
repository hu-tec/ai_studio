import { useState, useEffect, useCallback, useRef } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Save, FileDown, List, Target, Grid2x2, ChevronDown, ChevronUp } from 'lucide-react';
import { AIDetailModal } from './AIDetailModal';
import { FranklinView } from './FranklinView';
import { EisenhowerView } from './EisenhowerView';
import type { DailyLog, TimeSlotEntry, AIDetail, Position, ViewMode, FranklinTask } from './data';
import { homepageCategories, departmentCategories, positions, currentEmployee, employees, createEmptyTimeSlots, createEmptyFranklinTasks, syncFranklinToSlots, syncSlotToFranklin, FRANKLIN_STATUS_CONFIG, FRANKLIN_PRIORITY_CONFIG } from './data';
import { exportDailyLogToWord } from './exportWord';
import { toast } from 'sonner';

interface DailyDetailProps {
  date: Date;
  log: DailyLog | undefined;
  onSave: (log: DailyLog) => void;
}

export function DailyDetail({ date, log, onSave }: DailyDetailProps) {
  const dateStr = format(date, 'yyyy-MM-dd');
  const emp = employees.find(e => e.id === currentEmployee.id) || currentEmployee;

  const [position, setPosition] = useState<Position>(emp.position);
  const [hpCategories, setHpCategories] = useState<string[]>([]);
  const [deptCategories, setDeptCategories] = useState<string[]>([]);
  const [timeInterval, setTimeInterval] = useState<'30min' | '1hour' | 'half-day'>('1hour');
  const [timeSlots, setTimeSlots] = useState<TimeSlotEntry[]>([]);
  const [detail, setDetail] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [activeSlotIndex, setActiveSlotIndex] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('classic');
  const [franklinTasks, setFranklinTasks] = useState<FranklinTask[]>([]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-save: debounce 2초
  const doSave = useCallback(() => {
    const filledTitles = viewMode === 'franklin' || viewMode === 'eisenhower'
      ? franklinTasks.filter(t => t.task).map(t => `${t.priority}${t.number} ${t.task}`)
      : timeSlots.filter(s => s.title).map(s => s.title);
    const summary = filledTitles.length > 0
      ? `${emp.name} - ${filledTitles.slice(0, 3).join(', ')}${filledTitles.length > 3 ? ' 외' : ''}`
      : '';
    onSave({
      date: dateStr, summary, position,
      homepageCategories: hpCategories, departmentCategories: deptCategories,
      timeInterval, timeSlots, employeeId: currentEmployee.id,
      detail, viewMode, franklinTasks,
    });
  }, [dateStr, position, hpCategories, deptCategories, timeInterval, timeSlots, detail, viewMode, franklinTasks, emp.name, onSave]);

  const scheduleAutoSave = useCallback(() => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(doSave, 2000);
  }, [doSave]);

  const flushSave = useCallback(() => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    doSave();
  }, [doSave]);

  // Trigger auto-save on data changes (skip prop-driven changes)
  const userEdited = useRef(false);
  const suppressAutoSave = useRef(false);
  useEffect(() => {
    if (suppressAutoSave.current) return;
    if (!userEdited.current) { userEdited.current = true; return; }
    scheduleAutoSave();
    return () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current); };
  }, [position, hpCategories, deptCategories, timeInterval, timeSlots, detail, viewMode, franklinTasks]);

  useEffect(() => {
    // When date or log changes from props, suppress next auto-save cycle
    suppressAutoSave.current = true;
    userEdited.current = false;
    if (log) {
      setPosition(log.position || emp.position);
      setHpCategories(log.homepageCategories);
      setDeptCategories(log.departmentCategories);
      setTimeInterval(log.timeInterval);
      setTimeSlots(log.timeSlots);
      setDetail(log.detail || '');
      setViewMode(log.viewMode || 'classic');
      setFranklinTasks(log.franklinTasks || []);
    } else {
      setPosition(emp.position);
      setHpCategories([]);
      setDeptCategories([]);
      setTimeInterval('1hour');
      setTimeSlots(createEmptyTimeSlots('1hour'));
      setDetail('');
      setViewMode('classic');
      setFranklinTasks([]);
    }
    // Allow auto-save after prop-driven setState batch completes
    requestAnimationFrame(() => { suppressAutoSave.current = false; });
  }, [dateStr, log]);

  const handleIntervalChange = useCallback((newInterval: '30min' | '1hour' | 'half-day') => {
    setTimeSlots(prev => {
      const filledSlots = prev.filter(s => s.title || s.content || s.planned || s.aiDetail);
      if (filledSlots.length === 0) {
        return createEmptyTimeSlots(newInterval);
      }
      const newSlots = createEmptyTimeSlots(newInterval);
      // 기존 작성 데이터를 시간대 기준으로 매핑
      for (const filled of filledSlots) {
        const oldStart = filled.timeSlot.split('~')[0]?.trim().split(':').map(Number);
        if (!oldStart || oldStart.length < 2) continue;
        const oldMinutes = oldStart[0] * 60 + oldStart[1];
        // 가장 가까운 새 슬롯 찾기
        let bestIdx = 0, bestDist = Infinity;
        for (let i = 0; i < newSlots.length; i++) {
          const ns = newSlots[i].timeSlot.split('~')[0]?.trim().split(':').map(Number);
          if (!ns || ns.length < 2) continue;
          const dist = Math.abs((ns[0] * 60 + ns[1]) - oldMinutes);
          if (dist < bestDist) { bestDist = dist; bestIdx = i; }
        }
        newSlots[bestIdx] = { ...newSlots[bestIdx], title: filled.title, content: filled.content, planned: filled.planned, aiDetail: filled.aiDetail };
      }
      return newSlots;
    });
    setTimeInterval(newInterval);
  }, []);

  // Franklin → TimeSlots 정방향 동기화 핸들러
  const handleFranklinTasksChange = useCallback((newTasks: FranklinTask[]) => {
    setFranklinTasks(prev => {
      // 동기화: 연결된 과업 변경 → 타임슬롯 자동 반영
      setTimeSlots(slots => syncFranklinToSlots(newTasks, slots, prev));
      return newTasks;
    });
  }, []);

  const updateSlot = (index: number, field: keyof TimeSlotEntry, value: string) => {
    setTimeSlots(prev => prev.map((s, i) => i === index ? { ...s, [field]: value } : s));
    // Classic → Franklin 역방향 동기화: 연결된 과업 자동 업데이트
    const slotId = timeSlots[index]?.id;
    if (slotId) {
      setFranklinTasks(prev => syncSlotToFranklin(prev, slotId, field, value));
    }
  };

  const openModal = (index: number) => {
    setActiveSlotIndex(index);
    setModalOpen(true);
  };

  const handleAISave = (aiData: AIDetail) => {
    if (activeSlotIndex === null) return;
    setTimeSlots(prev =>
      prev.map((s, i) => i === activeSlotIndex ? { ...s, aiDetail: aiData } : s)
    );
  };

  const toggleCheckbox = (
    list: string[],
    setList: (v: string[]) => void,
    item: string
  ) => {
    if (list.includes(item)) {
      setList(list.filter(s => s !== item));
    } else {
      setList([...list, item]);
    }
  };

  const buildLog = (): DailyLog => {
    const newLog: DailyLog = {
      date: dateStr,
      summary: '',
      position,
      homepageCategories: hpCategories,
      departmentCategories: deptCategories,
      timeInterval,
      timeSlots,
      employeeId: currentEmployee.id,
      detail,
      viewMode,
      franklinTasks,
    };
    const filledTitles = (viewMode === 'franklin' || viewMode === 'eisenhower')
      ? franklinTasks.filter(t => t.task).map(t => `${t.priority}${t.number} ${t.task}`)
      : timeSlots.filter(s => s.title).map(s => s.title);
    newLog.summary = filledTitles.length > 0
      ? `${emp.name} - ${filledTitles.slice(0, 3).join(', ')}${filledTitles.length > 3 ? ' 외' : ''}`
      : '';
    return newLog;
  };

  const handleSave = () => {
    onSave(buildLog());
    toast.success('저장되었습니다.');
  };

  const handleExport = () => {
    exportDailyLogToWord(buildLog(), date);
    toast.success('워드 파일로 내보내졌습니다.');
  };

  return (
    <div className="bg-card rounded border border-border overflow-hidden">
      {/* Header */}
      <div className="px-3 py-2 border-b border-border bg-accent/20 flex items-center justify-between">
        <span className="font-semibold">{format(date, 'yyyy.M.d (EEE)', { locale: ko })} 업무일지</span>
        <div className="flex items-center gap-1">
          <span className="text-[9px] text-muted-foreground mr-1">자동저장</span>
          <button
            onClick={handleExport}
            className="flex items-center gap-1 px-2.5 py-1 bg-primary text-primary-foreground rounded hover:opacity-90 text-xs"
          >
            <FileDown className="w-3.5 h-3.5" />
            내보내기
          </button>
        </div>
      </div>

      <div className="p-3 space-y-2 [&_::-webkit-scrollbar]:hidden [&_*]:scrollbar-none" style={{ scrollbarWidth: 'none' }}>

        {/* Settings summary (collapsed) + expand toggle */}
        <div className="rounded-lg border border-border overflow-hidden">
          <button
            onClick={() => setSettingsOpen(p => !p)}
            className="w-full px-3 py-1.5 flex items-center justify-between bg-accent/10 hover:bg-accent/20 transition-colors"
          >
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground flex-wrap">
              <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded font-semibold text-[10px]">{position}</span>
              <span>{emp.name}</span>
              <span className="text-muted-foreground/40">·</span>
              <span>{emp.department}</span>
              {hpCategories.length > 0 && <>
                <span className="text-muted-foreground/40">·</span>
                <span className="text-emerald-600">{hpCategories.join(', ')}</span>
              </>}
              {deptCategories.length > 0 && <>
                <span className="text-muted-foreground/40">·</span>
                <span className="text-violet-600">{deptCategories.join(', ')}</span>
              </>}
            </div>
            {settingsOpen ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground shrink-0" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />}
          </button>

          {/* Settings panel (expanded) */}
          {settingsOpen && (
            <div className="p-2 space-y-1.5 border-t border-border bg-accent/5 animate-in fade-in slide-in-from-top-1 duration-200">
              {/* ① 직급 */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold text-muted-foreground w-8 shrink-0">직급</span>
                <div className="flex gap-0.5">
                  {positions.map(pos => (
                    <button key={pos} onClick={() => setPosition(pos)}
                      className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${position === pos ? 'bg-blue-600 text-white shadow-sm' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
                    >{pos}</button>
                  ))}
                </div>
              </div>
              {/* ③ 홈피 */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold text-muted-foreground w-8 shrink-0">홈피</span>
                <div className="flex gap-0.5 flex-wrap">
                  {homepageCategories.map(cat => {
                    const checked = hpCategories.includes(cat);
                    return (
                      <button key={cat} onClick={() => toggleCheckbox(hpCategories, setHpCategories, cat)}
                        className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${checked ? 'bg-emerald-600 text-white shadow-sm' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}
                      >{cat}</button>
                    );
                  })}
                </div>
              </div>
              {/* ④ 부서 */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold text-muted-foreground w-8 shrink-0">부서</span>
                <div className="flex gap-0.5 flex-wrap">
                  {departmentCategories.map(cat => {
                    const checked = deptCategories.includes(cat);
                    return (
                      <button key={cat} onClick={() => toggleCheckbox(deptCategories, setDeptCategories, cat)}
                        className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${checked ? 'bg-violet-600 text-white shadow-sm' : 'bg-violet-50 text-violet-600 hover:bg-violet-100'}`}
                      >{cat}</button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mode toggle — standalone */}
        <div className="flex items-center gap-2">
          <div className="flex gap-0.5">
            {([
              { mode: 'classic' as ViewMode, icon: List, label: 'Classic' },
              { mode: 'franklin' as ViewMode, icon: Target, label: 'Franklin' },
              { mode: 'eisenhower' as ViewMode, icon: Grid2x2, label: 'Eisenhower' },
            ]).map(({ mode, icon: Icon, label }) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
                  viewMode === mode ? 'bg-slate-700 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Icon className="w-3 h-3" />
                {label}
              </button>
            ))}
          </div>

        </div>

        {/* ⑥ 타임테이블 (Classic=확장, Franklin/Eisenhower=축소+우측패널) */}
        <div className="flex gap-3 items-start">
          {/* Timetable — Classic: 전체너비 확장, 나머지: 300px 축소 */}
          <div
            className="shrink-0 border border-border rounded-lg overflow-hidden transition-all duration-300 ease-in-out"
            style={{ width: viewMode === 'classic' ? '100%' : '300px' }}
          >
            <div className="bg-accent/40 px-2 py-1 border-b border-border flex items-center justify-between">
              <span className="text-[11px] font-semibold">타임테이블</span>
              <div className="flex gap-0.5">
                {([
                  { value: '30min' as const, label: '30분' },
                  { value: '1hour' as const, label: '1시간' },
                  { value: 'half-day' as const, label: '오전·오후' },
                ] as const).map(opt => (
                  <button key={opt.value} onClick={() => handleIntervalChange(opt.value)}
                    className={`px-1.5 py-0.5 rounded text-[9px] font-medium transition-all ${timeInterval === opt.value ? 'bg-orange-500 text-white shadow-sm' : 'bg-orange-50 text-orange-600 hover:bg-orange-100'}`}
                  >{opt.label}</button>
                ))}
              </div>
            </div>

            {/* Classic: 헤더 */}
            {viewMode === 'classic' && (
              <div className="hidden md:grid grid-cols-[80px_1fr_1fr_80px_1fr] bg-accent/20 border-b border-border text-[10px] text-muted-foreground">
                <div className="px-2 py-1 border-r border-border">시간대</div>
                <div className="px-2 py-1 border-r border-border">제목</div>
                <div className="px-2 py-1 border-r border-border">업무 내용</div>
                <div className="px-2 py-1 border-r border-border text-center">AI</div>
                <div className="px-2 py-1 bg-amber-50/30">예정</div>
              </div>
            )}

            <div className="overflow-y-auto" style={{ scrollbarWidth: 'none', maxHeight: 'calc(100vh - 300px)' }}>
              {timeSlots.map((slot, index) => {
                const linkedTask = franklinTasks.find(t => t.timeSlotId === slot.id);
                const slotStart = slot.timeSlot.split('~')[0]?.trim() || '';
                const overlapping = franklinTasks.filter(t => {
                  if (!t.startTime) return false;
                  const tStart = t.startTime.replace(':','');
                  const tEnd = (t.endTime || '23:59').replace(':','');
                  const sStart = slotStart.replace(':','');
                  return sStart >= tStart && sStart < tEnd;
                });
                const tasks_ = linkedTask ? [linkedTask] : (viewMode !== 'classic' ? overlapping : []);
                const hasFill = tasks_.length > 0 || slot.title;

                return viewMode === 'classic' ? (
                  /* Classic: 확장 — 시간 + 제목 + 내용 + AI + 예정 인라인 편집 */
                  <div key={slot.id} className="border-b border-border/50 last:border-b-0">
                    <div className="md:grid md:grid-cols-[80px_1fr_1fr_80px_1fr] flex flex-col">
                      <div className="px-2 py-1.5 md:border-r border-border bg-accent/10 flex items-center gap-1">
                        <span className="text-[10px] font-mono text-muted-foreground">{slot.timeSlot}</span>
                        {linkedTask && (
                          <span className="text-[8px] font-bold px-1 rounded" style={{ background: FRANKLIN_PRIORITY_CONFIG[linkedTask.priority].bg, color: FRANKLIN_PRIORITY_CONFIG[linkedTask.priority].color }}>
                            {linkedTask.priority}{linkedTask.number}{FRANKLIN_STATUS_CONFIG[linkedTask.status].icon}
                          </span>
                        )}
                      </div>
                      <div className="px-1 py-0.5 md:border-r border-border">
                        <input type="text" value={slot.title} onChange={e => updateSlot(index, 'title', e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') { e.currentTarget.blur(); flushSave(); } }}
                          className="w-full bg-transparent border-none outline-none px-1 py-0.5 text-[12px]" placeholder="제목" />
                      </div>
                      <div className="px-1 py-0.5 md:border-r border-border">
                        <input type="text" value={slot.content} onChange={e => updateSlot(index, 'content', e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') { e.currentTarget.blur(); flushSave(); } }}
                          className="w-full bg-transparent border-none outline-none px-1 py-0.5 text-[12px]" placeholder="내용" />
                      </div>
                      <div className="px-1 py-0.5 md:border-r border-border flex items-center justify-center">
                        <button onClick={() => openModal(index)}
                          className={`px-1 py-0.5 rounded border w-full text-center text-[9px] transition-colors ${slot.aiDetail ? 'bg-blue-50 border-blue-200 text-blue-700' : 'border-border text-muted-foreground'}`}>
                          {slot.aiDetail ? 'AI✓' : 'AI'}
                        </button>
                      </div>
                      <div className="px-1 py-0.5">
                        <input type="text" value={slot.planned} onChange={e => updateSlot(index, 'planned', e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') { e.currentTarget.blur(); flushSave(); } }}
                          className="w-full bg-transparent border-none outline-none px-1 py-0.5 text-[12px]" placeholder="예정" />
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Franklin/Eisenhower: 축소 — 시간 + 블록 (DnD drop zone) */
                  <div key={slot.id}
                    className={`border-b border-border/50 transition-colors ${hasFill ? 'bg-accent/5' : 'hover:bg-blue-50/30'}`}
                    onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; e.currentTarget.style.background = '#dbeafe'; }}
                    onDragLeave={e => { e.currentTarget.style.background = ''; }}
                    onDrop={e => {
                      e.preventDefault();
                      e.currentTarget.style.background = '';
                      const taskId = e.dataTransfer.getData('text/plain');
                      if (!taskId) return;
                      const task = franklinTasks.find(t => t.id === taskId);
                      if (!task) return;
                      const slotEnd = slot.timeSlot.split('~')[1]?.trim() || '';
                      setFranklinTasks(prev => prev.map(t => t.id === taskId ? { ...t, startTime: slotStart, endTime: t.endTime || slotEnd, timeSlotId: slot.id } : t));
                      updateSlot(index, 'title', task.task);
                    }}
                  >
                    <div className="flex items-center gap-1 px-1.5 py-1">
                      <span className={`text-[10px] font-mono w-12 shrink-0 ${hasFill ? 'text-foreground font-semibold' : 'text-muted-foreground/60'}`}>
                        {slotStart}
                      </span>
                      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                        {tasks_.length > 0 ? tasks_.map(t => {
                          const pCfg = FRANKLIN_PRIORITY_CONFIG[t.priority];
                          const stCfg = FRANKLIN_STATUS_CONFIG[t.status];
                          return (
                            <div key={t.id} className="flex items-center gap-1 rounded px-1 py-0.5" style={{ background: pCfg.color + '15', borderLeft: `2px solid ${pCfg.color}` }}>
                              <span className="text-[9px] font-bold" style={{ color: pCfg.color }}>{t.priority}{t.number}</span>
                              <span className="text-[9px]" style={{ color: stCfg.color }}>{stCfg.icon}</span>
                              <span className="text-[10px] truncate">{t.task}</span>
                            </div>
                          );
                        }) : slot.title ? (
                          <span className="text-[10px] truncate text-foreground/70">{slot.title}</span>
                        ) : (
                          <span className="text-[9px] text-muted-foreground/20 italic">드래그하여 배정</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Franklin/Eisenhower 패널 (Classic에서는 숨김) */}
          {viewMode !== 'classic' && (
            <div className="flex-1 min-w-0 transition-all duration-300 ease-in-out animate-in fade-in slide-in-from-right-2">
              {viewMode === 'eisenhower' ? (
                <EisenhowerView
                  tasks={franklinTasks}
                  timeSlots={timeSlots}
                  onTasksChange={handleFranklinTasksChange}
                  onSlotTitleChange={(idx, title) => updateSlot(idx, 'title', title)}
                />
              ) : (
                <FranklinView
                  tasks={franklinTasks}
                  timeSlots={timeSlots}
                  timeInterval={timeInterval}
                  onTasksChange={handleFranklinTasksChange}
                  onSlotTitleChange={(idx, title) => updateSlot(idx, 'title', title)}
                />
              )}
            </div>
          )}
        </div>

        {/* ⑦ 세부 내용 */}
        <div>
          <label className="block mb-1 text-muted-foreground">⑦ 세부 내용</label>
          <textarea
            value={detail}
            onChange={e => setDetail(e.target.value)}
            className="w-full border border-border rounded px-2 py-1.5 bg-transparent outline-none resize-none min-h-[80px]"
            rows={4}
            placeholder="오늘 하루 업무에 대한 세부 내용을 입력하세요."
            onInput={e => {
              const t = e.target as HTMLTextAreaElement;
              t.style.height = 'auto';
              t.style.height = Math.max(80, t.scrollHeight) + 'px';
            }}
          />
        </div>
      </div>

      {/* AI Detail Modal */}
      <AIDetailModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        timeSlot={activeSlotIndex !== null ? timeSlots[activeSlotIndex]?.timeSlot || '' : ''}
        initialData={activeSlotIndex !== null ? timeSlots[activeSlotIndex]?.aiDetail : undefined}
        onSave={handleAISave}
      />
    </div>
  );
}