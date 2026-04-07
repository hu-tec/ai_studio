import { useState, useEffect, useCallback, useRef } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Save, FileDown, List, Target, Grid2x2, LayoutGrid, ChevronDown, ChevronUp } from 'lucide-react';
import { AIDetailModal } from './AIDetailModal';
import { FranklinView } from './FranklinView';
import { EisenhowerView } from './EisenhowerView';
import { MandalartView, calcGridAchievement } from './MandalartView';
import type { DailyLog, TimeSlotEntry, AIDetail, Position, ViewMode, FranklinTask, MandalartCell, MandalartPeriod } from './data';
import { homepageCategories, departmentCategories, positions, currentEmployee, employees, createEmptyTimeSlots, createEmptyFranklinTasks, syncFranklinToSlots, syncSlotToFranklin, FRANKLIN_STATUS_CONFIG, FRANKLIN_PRIORITY_CONFIG } from './data';
import { BarChart3 } from 'lucide-react';
import { exportDailyLogToWord } from './exportWord';
import { MarkdownField } from './MarkdownField';
import { toast } from 'sonner';

interface DailyDetailProps {
  date: Date;
  log: DailyLog | undefined;
  onSave: (log: DailyLog) => void;
  employeeId: string;
  onFlushRef?: React.MutableRefObject<(() => void) | null>;
}

export function DailyDetail({ date, log, onSave, employeeId, onFlushRef }: DailyDetailProps) {
  const dateStr = format(date, 'yyyy-MM-dd');
  const emp = employees.find(e => e.id === employeeId) || currentEmployee;

  const [position, setPosition] = useState<Position>(emp.position);
  const [hpCategories, setHpCategories] = useState<string[]>([]);
  const [deptCategories, setDeptCategories] = useState<string[]>([]);
  const [timeInterval, setTimeInterval] = useState<'30min' | '1hour' | 'half-day'>('1hour');
  const [timeSlots, setTimeSlots] = useState<TimeSlotEntry[]>([]);
  const [detail, setDetail] = useState('');
  const [todayTasks, setTodayTasks] = useState('');
  const [tomorrowTasks, setTomorrowTasks] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [activeSlotIndex, setActiveSlotIndex] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('classic');
  const [franklinTasks, setFranklinTasks] = useState<FranklinTask[]>([]);
  const [mandalartByPeriod, setMandalartByPeriod] = useState<Record<MandalartPeriod, MandalartCell[]>>({ daily: [], weekly: [], monthly: [] });
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [period, setPeriod] = useState<MandalartPeriod>('daily');
  const [showStats, setShowStats] = useState(false);

  const mandalartCells = mandalartByPeriod[period] || [];
  const setMandalartCells = useCallback((cells: MandalartCell[] | ((prev: MandalartCell[]) => MandalartCell[])) => {
    setMandalartByPeriod(prev => {
      const newCells = typeof cells === 'function' ? cells(prev[period] || []) : cells;
      // 역방향 동기화: 만다라트 셀 → FranklinTask 자동 생성/업데이트
      setFranklinTasks(tasks => {
        let updated = [...tasks];
        let changed = false;
        const processCell = (cell: MandalartCell) => {
          if (!cell.text?.trim()) return;
          if (cell.taskId) {
            // 기존 연결 태스크 업데이트
            const idx = updated.findIndex(t => t.id === cell.taskId);
            if (idx >= 0) {
              const t = updated[idx];
              const needsUpdate = t.task !== cell.text || t.achievement !== cell.achievement || (cell.status && t.status !== cell.status);
              if (needsUpdate) {
                updated[idx] = { ...t, task: cell.text, achievement: cell.achievement, ...(cell.status ? { status: cell.status } : {}) };
                changed = true;
              }
            }
          } else {
            // 새 셀 → FranklinTask 자동 생성
            const newId = `ft-m-${Date.now()}-${Math.random().toString(36).slice(2,6)}`;
            updated.push({
              id: newId, priority: 'B', number: updated.filter(t => t.priority === 'B').length + 1,
              task: cell.text, status: cell.status || 'pending', achievement: cell.achievement || 0,
              important: true, urgent: false, period,
            });
            cell.taskId = newId;
            changed = true;
          }
          // 하위 셀도 처리
          cell.children?.forEach(processCell);
        };
        newCells.forEach(processCell);
        return changed ? updated : tasks;
      });
      return { ...prev, [period]: newCells };
    });
  }, [period]);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-save: debounce 2초
  const doSave = useCallback(() => {
    const filledTitles = viewMode !== 'classic'
      ? franklinTasks.filter(t => t.task).map(t => `${t.priority}${t.number} ${t.task}`)
      : timeSlots.filter(s => s.title).map(s => s.title);
    const summary = filledTitles.length > 0
      ? `${emp.name} - ${filledTitles.slice(0, 3).join(', ')}${filledTitles.length > 3 ? ' 외' : ''}`
      : '';
    onSave({
      date: dateStr, summary, position,
      homepageCategories: hpCategories, departmentCategories: deptCategories,
      timeInterval, timeSlots, employeeId,
      detail, viewMode, franklinTasks, mandalartByPeriod,
      todayTasks, tomorrowTasks,
    });
  }, [dateStr, position, hpCategories, deptCategories, timeInterval, timeSlots, detail, viewMode, franklinTasks, mandalartByPeriod, emp.name, onSave, employeeId, todayTasks, tomorrowTasks]);

  const scheduleAutoSave = useCallback(() => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(doSave, 300);
  }, [doSave]);

  const flushSave = useCallback(() => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    doSave();
  }, [doSave]);

  // Expose flushSave to parent so it can flush before switching employee
  useEffect(() => {
    if (onFlushRef) onFlushRef.current = flushSave;
    return () => { if (onFlushRef) onFlushRef.current = null; };
  }, [flushSave, onFlushRef]);

  // Trigger auto-save on data changes (skip prop-driven changes)
  const userEdited = useRef(false);
  const suppressAutoSave = useRef(false);
  useEffect(() => {
    if (suppressAutoSave.current) return;
    if (!userEdited.current) { userEdited.current = true; return; }
    scheduleAutoSave();
    return () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current); };
  }, [position, hpCategories, deptCategories, timeInterval, timeSlots, detail, viewMode, franklinTasks, mandalartByPeriod, todayTasks, tomorrowTasks]);

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
      setTodayTasks(log.todayTasks || '');
      setTomorrowTasks(log.tomorrowTasks || '');
      setViewMode(log.viewMode || 'classic');
      // 기존 태스크에 period 없으면 'daily' 기본값 설정 (마이그레이션)
      setFranklinTasks((log.franklinTasks || []).map(t => t.period ? t : { ...t, period: 'daily' }));
      // 기간별 만다라트: 기존 데이터 호환
      if (log.mandalartByPeriod) {
        setMandalartByPeriod(log.mandalartByPeriod);
      } else {
        const oldCells = (log as any).mandalartCells || [];
        setMandalartByPeriod({ daily: oldCells, weekly: [], monthly: [] });
      }
    } else {
      setPosition(emp.position);
      setHpCategories([]);
      setDeptCategories([]);
      setTimeInterval('1hour');
      setTimeSlots(createEmptyTimeSlots('1hour'));
      setDetail('');
      setTodayTasks('');
      setTomorrowTasks('');
      setViewMode('classic');
      setFranklinTasks([]);
      setMandalartByPeriod({ daily: [], weekly: [], monthly: [] });
    }
    // Allow auto-save after prop-driven setState batch completes
    requestAnimationFrame(() => { suppressAutoSave.current = false; });
  }, [dateStr, log, employeeId]);

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
        // 병합: 여러 슬롯이 같은 새 슬롯에 매핑될 때 제목/내용 합침 (중복 제거)
        const cur = newSlots[bestIdx];
        const mergeField = (existing: string, adding: string) => {
          if (!adding) return existing;
          const parts = existing.split(' / ').filter(Boolean);
          adding.split(' / ').forEach(p => { if (p && !parts.includes(p)) parts.push(p); });
          return parts.join(' / ');
        };
        newSlots[bestIdx] = { ...cur, title: mergeField(cur.title, filled.title), content: mergeField(cur.content, filled.content), planned: mergeField(cur.planned, filled.planned), aiDetail: cur.aiDetail || filled.aiDetail };
      }
      return newSlots;
    });
    setTimeInterval(newInterval);
  }, []);

  // Franklin → TimeSlots + MandalartCells 정방향 동기화 핸들러
  const handleFranklinTasksChange = useCallback((newTasks: FranklinTask[]) => {
    setFranklinTasks(prev => {
      // 동기화: 연결된 과업 변경 → 타임슬롯 자동 반영
      setTimeSlots(slots => syncFranklinToSlots(newTasks, slots, prev));
      // 동기화: 태스크 변경 → 만다라트 셀 achievement/status 반영
      setMandalartByPeriod(mp => {
        const updated = { ...mp };
        for (const p of ['daily', 'weekly', 'monthly'] as const) {
          if (!updated[p] || updated[p].length === 0) continue;
          updated[p] = updated[p].map(cell => {
            if (!cell.taskId) return cell;
            const task = newTasks.find(t => t.id === cell.taskId);
            if (!task) return cell;
            return { ...cell, text: task.task, achievement: task.achievement, status: task.status };
          });
        }
        return updated;
      });
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
      employeeId,
      detail,
      todayTasks,
      tomorrowTasks,
      viewMode,
      franklinTasks,
      mandalartByPeriod,
    };
    const filledTitles = (viewMode !== 'classic')
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

        {/* 오늘의 업무 / 다음 날 업무 (마크다운 + 자동 채움) */}
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-blue-200 bg-blue-50/30 overflow-hidden">
            <div className="px-2 py-1 bg-blue-100/50 border-b border-blue-200 flex items-center justify-between">
              <span className="text-[11px] font-bold text-blue-700">오늘의 업무</span>
              <span className="text-[9px] text-blue-400">{franklinTasks.filter(t => t.startTime).length}건 배정</span>
            </div>
            {/* 자동: 타임테이블 배정 업무 목록 */}
            {franklinTasks.filter(t => t.startTime).length > 0 && (
              <div className="px-2 py-1 border-b border-blue-100 bg-blue-50/50 text-[10px] space-y-0.5">
                {franklinTasks.filter(t => t.startTime).sort((a,b) => (a.startTime||'').localeCompare(b.startTime||'')).map(t => (
                  <div key={t.id} className="flex items-center gap-1">
                    <span className="font-mono text-blue-500 shrink-0">{t.startTime}{t.endTime ? '~'+t.endTime : ''}</span>
                    <span className={`font-bold shrink-0 ${t.status === 'done' ? 'text-emerald-600' : t.status === 'progress' ? 'text-blue-600' : 'text-gray-400'}`}>
                      {FRANKLIN_STATUS_CONFIG[t.status].icon}
                    </span>
                    <span className={t.status === 'done' ? 'line-through text-gray-400' : ''}>{t.task}</span>
                    {(t.achievement || 0) > 0 && <span className={`text-[8px] font-bold ${(t.achievement||0)>=4?'text-emerald-600':'text-amber-500'}`}>{t.achievement>=4?'질':'양'}{t.achievement}</span>}
                  </div>
                ))}
              </div>
            )}
            <MarkdownField value={todayTasks} onChange={setTodayTasks} placeholder="추가 메모 (마크다운 지원)" minHeight={30} />
          </div>
          <div className="rounded-lg border border-amber-200 bg-amber-50/30 overflow-hidden">
            <div className="px-2 py-1 bg-amber-100/50 border-b border-amber-200 flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-700">다음 날 업무</span>
              <span className="text-[9px] text-amber-400">{franklinTasks.filter(t => t.status === 'forwarded').length}건 이월</span>
            </div>
            {/* 자동: 이월(forwarded) 업무 목록 */}
            {franklinTasks.filter(t => t.status === 'forwarded').length > 0 && (
              <div className="px-2 py-1 border-b border-amber-100 bg-amber-50/50 text-[10px] space-y-0.5">
                {franklinTasks.filter(t => t.status === 'forwarded').map(t => (
                  <div key={t.id} className="flex items-center gap-1">
                    <span className="text-amber-500 font-bold">→</span>
                    <span className="font-bold shrink-0" style={{ color: FRANKLIN_PRIORITY_CONFIG[t.priority].color }}>{t.priority}{t.number}</span>
                    <span>{t.task}</span>
                  </div>
                ))}
              </div>
            )}
            <MarkdownField value={tomorrowTasks} onChange={setTomorrowTasks} placeholder="추가 메모 (마크다운 지원)" minHeight={30} />
          </div>
        </div>

        {/* Mode toggle + Period + Stats */}
        {(() => {
          // 통계 계산 (모든 뷰 공통)
          const filledSlots = timeSlots.filter(s => s.title.trim()).length;
          const totalSlots = timeSlots.length;
          const doneTasks = franklinTasks.filter(t => t.status === 'done').length;
          const totalTasks = franklinTasks.length;
          const mStats = viewMode === 'mandalart' && mandalartCells.length >= 9
            ? calcGridAchievement(mandalartCells) : null;
          return (
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex gap-0.5">
                {([
                  { mode: 'classic' as ViewMode, icon: List, label: 'Classic' },
                  { mode: 'franklin' as ViewMode, icon: Target, label: 'Franklin' },
                  { mode: 'eisenhower' as ViewMode, icon: Grid2x2, label: 'Eisenhower' },
                  { mode: 'mandalart' as ViewMode, icon: LayoutGrid, label: 'Mandalart' },
                ]).map(({ mode, icon: Icon, label }) => (
                  <button key={mode} onClick={() => setViewMode(mode)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
                      viewMode === mode ? 'bg-slate-700 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}>
                    <Icon className="w-3 h-3" />{label}
                  </button>
                ))}
              </div>
              <div className="flex gap-0.5 ml-auto">
                {(['daily','weekly','monthly'] as const).map(k => (
                  <button key={k} onClick={() => setPeriod(k)}
                    className={`px-2 py-0.5 rounded-full text-[10px] border ${period===k?'bg-blue-50 text-blue-600 border-blue-300 font-bold':'bg-white text-gray-400 border-gray-200'}`}>
                    {k==='daily'?'일간':k==='weekly'?'주간':'월간'}
                  </button>
                ))}
                <button onClick={() => setShowStats(!showStats)}
                  className={`px-1.5 py-0.5 rounded-full border ${showStats?'bg-emerald-50 text-emerald-600 border-emerald-300':'bg-white text-gray-400 border-gray-200'}`}>
                  <BarChart3 className="w-3 h-3" />
                </button>
              </div>
              {/* 인라인 통계 바 */}
              {showStats && (
                <div className="w-full flex items-center gap-3 px-2 py-1 bg-slate-50 rounded border border-slate-200 text-[10px]">
                  <span className="text-slate-500 font-semibold">{period==='daily'?'오늘':period==='weekly'?'이번 주':'이번 달'}</span>
                  {viewMode === 'mandalart' && mStats ? (<>
                    <span className="text-blue-600 font-bold">작성 {mStats.filled}/8</span>
                    <span className="text-amber-500 font-bold">양 {mStats.yang}/{mStats.total}</span>
                    <span className="text-emerald-600 font-bold">질 {mStats.jil}/{mStats.total}</span>
                    <div className="flex-1 h-1 bg-slate-200 rounded overflow-hidden relative">
                      <div className="absolute left-0 top-0 h-full bg-amber-400 rounded" style={{width:`${mStats.total>0?Math.round(mStats.yang/mStats.total*100):0}%`}} />
                      <div className="absolute left-0 top-0 h-full bg-emerald-500 rounded" style={{width:`${mStats.total>0?Math.round(mStats.jil/mStats.total*100):0}%`}} />
                    </div>
                    <span className="text-emerald-600 font-bold">{mStats.total>0?Math.round(mStats.jil/mStats.total*100):0}%</span>
                  </>) : viewMode === 'classic' ? (<>
                    <span className="text-blue-600 font-bold">작성 {filledSlots}/{totalSlots}</span>
                    <div className="flex-1 h-1 bg-slate-200 rounded overflow-hidden">
                      <div className="h-full bg-blue-500 rounded" style={{width:`${totalSlots>0?Math.round(filledSlots/totalSlots*100):0}%`}} />
                    </div>
                    <span className="text-blue-600 font-bold">{totalSlots>0?Math.round(filledSlots/totalSlots*100):0}%</span>
                  </>) : (<>
                    <span className="text-blue-600 font-bold">태스크 {totalTasks}</span>
                    <span className="text-emerald-600 font-bold">완료 {doneTasks}/{totalTasks}</span>
                    <span className="text-amber-500 font-bold">진행 {franklinTasks.filter(t=>t.status==='progress').length}</span>
                    <div className="flex-1 h-1 bg-slate-200 rounded overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded" style={{width:`${totalTasks>0?Math.round(doneTasks/totalTasks*100):0}%`}} />
                    </div>
                    <span className="text-emerald-600 font-bold">{totalTasks>0?Math.round(doneTasks/totalTasks*100):0}%</span>
                  </>)}
                </div>
              )}
            </div>
          );
        })()}

        {/* 미배정 업무 (Classic/Mandalart에서 표시) */}
        {(viewMode === 'classic' || viewMode === 'mandalart') && (() => {
          const assignedSlotIds = new Set(franklinTasks.filter(t => t.timeSlotId).map(t => t.id));
          const assignedCellIds = new Set(mandalartCells.flatMap(c => [c.taskId, ...(c.children || []).map(ch => ch.taskId)].filter(Boolean)));
          const unassigned = franklinTasks.filter(t => {
            if (viewMode === 'classic') return !t.timeSlotId;
            return !assignedCellIds.has(t.id);
          });
          if (unassigned.length === 0) return null;
          return (
            <div className="border border-dashed border-amber-300 rounded-lg bg-amber-50/30 p-2">
              <div className="text-[10px] font-bold text-amber-700 mb-1">미배정 업무 ({unassigned.length}개) — 드래그하여 배정</div>
              <div className="flex flex-wrap gap-1">
                {unassigned.map(t => {
                  const pCfg = FRANKLIN_PRIORITY_CONFIG[t.priority];
                  const stCfg = FRANKLIN_STATUS_CONFIG[t.status];
                  return (
                    <div key={t.id} draggable
                      onDragStart={e => { e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', viewMode === 'mandalart' ? t.task : t.id); }}
                      className="flex items-center gap-1 px-2 py-1 rounded border border-amber-200 bg-white cursor-grab active:cursor-grabbing hover:shadow-sm text-[10px]"
                      style={{ borderLeftColor: pCfg.color, borderLeftWidth: 3 }}>
                      <span style={{ color: stCfg.color, fontSize: 9 }}>{stCfg.icon}</span>
                      <span className="font-bold" style={{ color: pCfg.color }}>{t.priority}{t.number}</span>
                      <span className="truncate max-w-[120px]">{t.task}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

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
                const slotStart = slot.timeSlot.split('~')[0]?.trim() || '';
                const slotEnd = slot.timeSlot.split('~')[1]?.trim() || '';
                // 시간 겹침 기반으로 모든 뷰에서 동일하게 태스크 매칭
                const slotTasks = franklinTasks.filter(t => {
                  if (t.timeSlotId === slot.id) return true;
                  if (!t.startTime) return false;
                  const tStart = t.startTime.replace(':','');
                  const tEnd = (t.endTime || '23:59').replace(':','');
                  const sStart = slotStart.replace(':','');
                  return sStart >= tStart && sStart < tEnd;
                });
                // 중복 제거 (timeSlotId + 시간 겹침 둘 다 매칭될 수 있음)
                const seen = new Set<string>();
                const tasks_ = slotTasks.filter(t => { if (seen.has(t.id)) return false; seen.add(t.id); return true; });
                const hasFill = tasks_.length > 0 || slot.title;

                return viewMode === 'classic' ? (
                  /* Classic: 확장 — 시간 + 제목 + 내용 + AI + 예정 인라인 편집 */
                  <div key={slot.id} className="border-b border-border/50 last:border-b-0"
                    onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; e.currentTarget.style.background = '#dbeafe'; }}
                    onDragLeave={e => { e.currentTarget.style.background = ''; }}
                    onDrop={e => {
                      e.preventDefault();
                      e.currentTarget.style.background = '';
                      const droppedText = e.dataTransfer.getData('text/plain');
                      if (!droppedText) return;
                      let task = franklinTasks.find(t => t.id === droppedText);
                      if (!task) task = franklinTasks.find(t => t.task === droppedText);
                      if (task) {
                        // 태스크 시간만 설정 — 시간 겹침으로 자동 표시됨
                        setFranklinTasks(prev => prev.map(t => t.id === task!.id ? { ...t, startTime: slotStart, endTime: slotEnd || t.endTime, timeSlotId: slot.id } : t));
                      } else {
                        // 프리텍스트 드롭은 슬롯 제목에 추가
                        updateSlot(index, 'title', slot.title ? slot.title + ' / ' + droppedText : droppedText);
                      }
                    }}>
                    <div className="md:grid md:grid-cols-[80px_1fr_1fr_80px_1fr] flex flex-col">
                      <div className="px-2 py-1.5 md:border-r border-border bg-accent/10 flex items-center gap-1 flex-wrap">
                        <span className="text-[10px] font-mono text-muted-foreground shrink-0">{slot.timeSlot}</span>
                        {tasks_.map(t => (
                          <span key={t.id} className="text-[8px] font-bold px-1 rounded" style={{ background: FRANKLIN_PRIORITY_CONFIG[t.priority].bg, color: FRANKLIN_PRIORITY_CONFIG[t.priority].color }}>
                            {t.priority}{t.number}{FRANKLIN_STATUS_CONFIG[t.status].icon}
                          </span>
                        ))}
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
                  /* Franklin/Eisenhower/Mandalart: 축소 — 시간 + 블록 (DnD drop zone) */
                  <div key={slot.id}
                    className={`border-b border-border/50 transition-colors ${hasFill ? 'bg-accent/5' : 'hover:bg-blue-50/30'}`}
                    onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; e.currentTarget.style.background = '#dbeafe'; }}
                    onDragLeave={e => { e.currentTarget.style.background = ''; }}
                    onDrop={e => {
                      e.preventDefault();
                      e.currentTarget.style.background = '';
                      const droppedText = e.dataTransfer.getData('text/plain');
                      if (!droppedText) return;
                      let task = franklinTasks.find(t => t.id === droppedText);
                      if (!task) task = franklinTasks.find(t => t.task === droppedText);
                      if (task) {
                        setFranklinTasks(prev => prev.map(t => t.id === task!.id ? { ...t, startTime: slotStart, endTime: slotEnd || t.endTime, timeSlotId: slot.id } : t));
                        updateSlot(index, 'title', task.task);
                      } else {
                        updateSlot(index, 'title', droppedText);
                      }
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

          {/* Right: Franklin/Eisenhower/Mandalart 패널 (Classic에서는 숨김) */}
          {viewMode !== 'classic' && (
            <div className="flex-1 min-w-0 transition-all duration-300 ease-in-out animate-in fade-in slide-in-from-right-2">
              {viewMode === 'mandalart' ? (
                <MandalartView
                  cells={mandalartCells}
                  tasks={franklinTasks}
                  onCellsChange={setMandalartCells}
                  onTasksChange={handleFranklinTasksChange}
                  onSlotTitleChange={(idx, title) => updateSlot(idx, 'title', title)}
                  period={period}
                />
              ) : viewMode === 'eisenhower' ? (
                <EisenhowerView
                  tasks={franklinTasks.filter(t => !t.period || t.period === period)}
                  timeSlots={timeSlots}
                  onTasksChange={newTasks => {
                    // period 필터링된 태스크만 받으므로 다른 period 태스크는 유지
                    const otherPeriod = franklinTasks.filter(t => t.period && t.period !== period);
                    handleFranklinTasksChange([...otherPeriod, ...newTasks]);
                  }}
                  onSlotTitleChange={(idx, title) => updateSlot(idx, 'title', title)}
                  period={period}
                />
              ) : (
                <FranklinView
                  tasks={franklinTasks.filter(t => !t.period || t.period === period)}
                  timeSlots={timeSlots}
                  timeInterval={timeInterval}
                  onTasksChange={newTasks => {
                    const otherPeriod = franklinTasks.filter(t => t.period && t.period !== period);
                    handleFranklinTasksChange([...otherPeriod, ...newTasks]);
                  }}
                  onSlotTitleChange={(idx, title) => updateSlot(idx, 'title', title)}
                  period={period}
                />
              )}
            </div>
          )}
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