import { useState, useEffect, useCallback, useRef } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Save, FileDown, List, Target, Grid2x2, LayoutGrid, ChevronDown, ChevronUp } from 'lucide-react';
import { AIDetailModal } from './AIDetailModal';
import { FranklinView } from './FranklinView';
import { EisenhowerView } from './EisenhowerView';
import { MandalartView, calcGridAchievement } from './MandalartView';
import type { DailyLog, TimeSlotEntry, AIDetail, Position, ViewMode, Task, MandalartCell, MandalartPeriod, MandalartTypeConfig } from './data';
import { homepageCategories, departmentCategories, positions, currentEmployee, employees, createEmptyTimeSlots, createEmptyTasks, syncFranklinToSlots, syncSlotToFranklin, getNextNumber, timeToMinutes, minutesToTime, DEFAULT_MANDALART_TYPES, WORKLOG_MANDALART_ID, mandalartCenterIdx, mandalartCellCount, mandalartChildCount, FRANKLIN_STATUS_CONFIG, FRANKLIN_PRIORITY_CONFIG } from './data';
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
  const [tasks, setTasks] = useState<Task[]>([]);
  // 타입별(업무일지/규정/미팅) × 기간별 만다라트 저장 — 업무일지 타입만 Task 동기화
  const makeEmptyMandalartByType = (types: MandalartTypeConfig[]) => {
    const init: Record<string, Record<MandalartPeriod, MandalartCell[]>> = {};
    types.forEach(t => { init[t.id] = { daily: [], weekly: [], monthly: [] }; });
    return init;
  };
  const [mandalartTypes, setMandalartTypes] = useState<MandalartTypeConfig[]>(DEFAULT_MANDALART_TYPES);
  const [mandalartActiveType, setMandalartActiveType] = useState<string>(WORKLOG_MANDALART_ID);
  const [mandalartByTypeAndPeriod, setMandalartByTypeAndPeriod] = useState<Record<string, Record<MandalartPeriod, MandalartCell[]>>>(() => makeEmptyMandalartByType(DEFAULT_MANDALART_TYPES));
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [period, setPeriod] = useState<MandalartPeriod>('daily');
  const [showStats, setShowStats] = useState(false);
  const [todayListOpen, setTodayListOpen] = useState(true);
  const [todayMemoOpen, setTodayMemoOpen] = useState(true);
  const [tomorrowListOpen, setTomorrowListOpen] = useState(true);
  const [tomorrowMemoOpen, setTomorrowMemoOpen] = useState(true);

  // 타임테이블 드래그 범위 추적 — 여러 슬롯에 걸친 드롭 지원
  const dragSlotRangeRef = useRef<{ firstIdx: number | null; lastIdx: number | null }>({ firstIdx: null, lastIdx: null });
  const [dragRangeHint, setDragRangeHint] = useState<{ lo: number; hi: number } | null>(null);
  useEffect(() => {
    const resetRange = () => {
      dragSlotRangeRef.current = { firstIdx: null, lastIdx: null };
      setDragRangeHint(null);
    };
    window.addEventListener('dragstart', resetRange);
    window.addEventListener('dragend', resetRange);
    return () => {
      window.removeEventListener('dragstart', resetRange);
      window.removeEventListener('dragend', resetRange);
    };
  }, []);
  const trackDragEnter = useCallback((idx: number) => {
    const cur = dragSlotRangeRef.current;
    if (cur.firstIdx === null) cur.firstIdx = idx;
    cur.lastIdx = idx;
    const lo = Math.min(cur.firstIdx, cur.lastIdx);
    const hi = Math.max(cur.firstIdx, cur.lastIdx);
    setDragRangeHint(prev => (prev && prev.lo === lo && prev.hi === hi) ? prev : { lo, hi });
  }, []);
  // 드롭 시 startTime/endTime/timeSlotId/loIdx 계산 — 범위 드래그 > duration 보존 > 1-slot 순서
  const computeDropSpan = useCallback((dropIdx: number, origTask?: Task) => {
    const cur = dragSlotRangeRef.current;
    const hasRange = cur.firstIdx !== null && cur.lastIdx !== null && cur.firstIdx !== cur.lastIdx;
    if (hasRange) {
      const lo = Math.min(cur.firstIdx!, cur.lastIdx!, dropIdx);
      const hi = Math.max(cur.firstIdx!, cur.lastIdx!, dropIdx);
      const a = timeSlots[lo]; const b = timeSlots[hi];
      return {
        loIdx: lo,
        startTime: a.timeSlot.split('~')[0]?.trim() || '',
        endTime: b.timeSlot.split('~')[1]?.trim() || '',
        timeSlotId: a.id,
      };
    }
    const s = timeSlots[dropIdx];
    const startTime = s.timeSlot.split('~')[0]?.trim() || '';
    const slotEnd = s.timeSlot.split('~')[1]?.trim() || '';
    let endTime = slotEnd;
    if (origTask?.startTime && origTask?.endTime) {
      const dur = timeToMinutes(origTask.endTime) - timeToMinutes(origTask.startTime);
      if (dur > 0) endTime = minutesToTime(timeToMinutes(startTime) + dur);
    }
    return { loIdx: dropIdx, startTime, endTime, timeSlotId: s.id };
  }, [timeSlots]);

  const activeTypeConfig = mandalartTypes.find(t => t.id === mandalartActiveType) || mandalartTypes[0];
  const activeSize = activeTypeConfig?.size || 3;
  const mandalartCells = mandalartByTypeAndPeriod[mandalartActiveType]?.[period] || [];
  const setMandalartCells = useCallback((cells: MandalartCell[] | ((prev: MandalartCell[]) => MandalartCell[])) => {
    setMandalartByTypeAndPeriod(prev => {
      const curType = prev[mandalartActiveType] || { daily: [], weekly: [], monthly: [] };
      const newCells = typeof cells === 'function' ? cells(curType[period] || []) : cells;
      // 역방향 동기화: 업무일지 타입만 Task 생성/업데이트
      if (mandalartActiveType !== WORKLOG_MANDALART_ID) {
        return { ...prev, [mandalartActiveType]: { ...curType, [period]: newCells } };
      }
      const centerIdx = mandalartCenterIdx(activeSize);
      setTasks(tasks => {
        let updated = [...tasks];
        let changed = false;

        // 현재 task id 집합 (top-level + children) — stale taskId 감지용
        const taskIdSet = new Set<string>();
        updated.forEach(t => { taskIdSet.add(t.id); t.children?.forEach(c => taskIdSet.add(c.id)); });

        const updateFields = (t: Task, cell: MandalartCell) => {
          const needsUpdate = t.task !== cell.text || t.achievement !== cell.achievement || (cell.status && t.status !== cell.status);
          return needsUpdate ? { ...t, task: cell.text, achievement: cell.achievement, ...(cell.status ? { status: cell.status } : {}) } : null;
        };

        const processCell = (cell: MandalartCell, parentTaskId?: string) => {
          if (!cell.text?.trim()) return;

          // stale taskId (삭제된 태스크를 가리키는 경우) 무효화 → 새 태스크 생성 경로 진입
          if (cell.taskId && !taskIdSet.has(cell.taskId)) {
            cell.taskId = undefined;
          }

          if (parentTaskId) {
            // ── 자식 셀 → 서브태스크로 처리 ──
            const pIdx = updated.findIndex(t => t.id === parentTaskId);
            if (pIdx < 0) return;
            const parent = updated[pIdx];
            const children = [...(parent.children || [])];

            if (cell.taskId) {
              const cIdx = children.findIndex(c => c.id === cell.taskId);
              if (cIdx >= 0) {
                const patched = updateFields(children[cIdx], cell);
                if (patched) { children[cIdx] = patched; updated[pIdx] = { ...parent, children }; changed = true; }
              } else {
                // 마이그레이션: top-level에 있으면 children으로 이동
                const tIdx = updated.findIndex(t => t.id === cell.taskId);
                if (tIdx >= 0) {
                  const task = updated[tIdx];
                  updated.splice(tIdx, 1);
                  const adjPIdx = updated.findIndex(t => t.id === parentTaskId);
                  const adjParent = updated[adjPIdx];
                  const adjChildren = [...(adjParent.children || []), { ...task, parentId: parentTaskId, number: (adjParent.children || []).length + 1 }];
                  updated[adjPIdx] = { ...adjParent, children: adjChildren };
                  changed = true;
                }
              }
            } else {
              // 새 서브태스크 생성 (텍스트 매칭 제거 — 셀↔태스크 1:1 보장)
              const newId = `ft-m-${Date.now()}-${Math.random().toString(36).slice(2,6)}`;
              const nextSubNum = children.length > 0 ? Math.max(...children.map(c => c.number || 0)) + 1 : 1;
              children.push({
                id: newId, priority: parent.priority, number: nextSubNum,
                task: cell.text, status: cell.status || 'pending', achievement: cell.achievement || 0,
                parentId: parentTaskId, period,
              });
              updated[pIdx] = { ...parent, children };
              taskIdSet.add(newId);
              cell.taskId = newId;
              changed = true;
            }
          } else {
            // ── 상위 셀 → 메인 태스크 ──
            if (cell.taskId) {
              const idx = updated.findIndex(t => t.id === cell.taskId);
              if (idx >= 0) {
                const patched = updateFields(updated[idx], cell);
                if (patched) { updated[idx] = patched; changed = true; }
              }
            } else {
              // 새 메인 태스크 생성 (텍스트 매칭 제거)
              const newId = `ft-m-${Date.now()}-${Math.random().toString(36).slice(2,6)}`;
              updated.push({
                id: newId, priority: 'B', number: getNextNumber(updated, 'B'),
                task: cell.text, status: cell.status || 'pending', achievement: cell.achievement || 0,
                important: true, urgent: false, period,
              });
              taskIdSet.add(newId);
              cell.taskId = newId;
              changed = true;
            }
          }
          // 하위 셀 재귀 — 이 셀의 taskId를 부모로 전달
          cell.children?.forEach(c => processCell(c, cell.taskId));
        };
        // 센터 셀(홀수 N)은 기간 목표 라벨이므로 태스크로 동기화하지 않음
        newCells.forEach((cell, i) => { if (centerIdx < 0 || i !== centerIdx) processCell(cell); });
        if (changed) {
          // 태스크 변경 → 연결된 타임슬롯 제목/내용도 동기화
          setTimeSlots(slots => syncFranklinToSlots(updated, slots, tasks));
        }
        return changed ? updated : tasks;
      });
      return { ...prev, [mandalartActiveType]: { ...curType, [period]: newCells } };
    });
  }, [period, mandalartActiveType, activeSize]);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-save: debounce 2초
  const doSave = useCallback(() => {
    const filledTitles = viewMode !== 'classic'
      ? tasks.filter(t => t.task).map(t => `${t.priority}${t.number} ${t.task}`)
      : timeSlots.filter(s => s.title).map(s => s.title);
    const summary = filledTitles.length > 0
      ? `${emp.name} - ${filledTitles.slice(0, 3).join(', ')}${filledTitles.length > 3 ? ' 외' : ''}`
      : '';
    onSave({
      date: dateStr, summary, position,
      homepageCategories: hpCategories, departmentCategories: deptCategories,
      timeInterval, timeSlots, employeeId,
      detail, viewMode, tasks,
      mandalartTypes, mandalartByTypeAndPeriod, mandalartActiveType,
      todayTasks, tomorrowTasks,
    });
  }, [dateStr, position, hpCategories, deptCategories, timeInterval, timeSlots, detail, viewMode, tasks, mandalartTypes, mandalartByTypeAndPeriod, mandalartActiveType, emp.name, onSave, employeeId, todayTasks, tomorrowTasks]);

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
  }, [position, hpCategories, deptCategories, timeInterval, timeSlots, detail, viewMode, tasks, mandalartByTypeAndPeriod, mandalartTypes, mandalartActiveType, todayTasks, tomorrowTasks]);

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
      setTasks((log.tasks || []).map(t => t.period ? t : { ...t, period: 'daily' }));
      // 만다라트 타입 목록 로드
      const loadedTypes = log.mandalartTypes && log.mandalartTypes.length > 0 ? log.mandalartTypes : DEFAULT_MANDALART_TYPES;
      setMandalartTypes(loadedTypes);
      setMandalartActiveType(log.mandalartActiveType || WORKLOG_MANDALART_ID);
      // 만다라트 데이터: 신규 구조 > 레거시 mandalartByPeriod (→ worklog 타입으로) > 빈 값
      if (log.mandalartByTypeAndPeriod) {
        // 누락된 타입은 빈 셀로 보강
        const merged = makeEmptyMandalartByType(loadedTypes);
        for (const k of Object.keys(log.mandalartByTypeAndPeriod)) {
          merged[k] = log.mandalartByTypeAndPeriod[k];
        }
        setMandalartByTypeAndPeriod(merged);
      } else if (log.mandalartByPeriod) {
        const merged = makeEmptyMandalartByType(loadedTypes);
        merged[WORKLOG_MANDALART_ID] = log.mandalartByPeriod;
        setMandalartByTypeAndPeriod(merged);
      } else {
        setMandalartByTypeAndPeriod(makeEmptyMandalartByType(loadedTypes));
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
      setTasks([]);
      setMandalartTypes(DEFAULT_MANDALART_TYPES);
      setMandalartActiveType(WORKLOG_MANDALART_ID);
      setMandalartByTypeAndPeriod(makeEmptyMandalartByType(DEFAULT_MANDALART_TYPES));
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
  const handleTasksChange = useCallback((newTasks: Task[]) => {
    setTasks(prev => {
      // 동기화: 연결된 과업 변경 → 타임슬롯 자동 반영
      setTimeSlots(slots => syncFranklinToSlots(newTasks, slots, prev));
      // 동기화: 태스크 변경 → 업무일지 타입 만다라트 셀만 반영 (다른 타입은 Task 비연결)
      setMandalartByTypeAndPeriod(mp => {
        const wl = mp[WORKLOG_MANDALART_ID] || { daily: [], weekly: [], monthly: [] };
        const taskMap = new Map<string, Task>();
        newTasks.forEach(t => {
          taskMap.set(t.id, t);
          t.children?.forEach(c => taskMap.set(c.id, c));
        });
        const syncCell = (cell: MandalartCell): MandalartCell => {
          const newChildren = cell.children?.map(syncCell);
          if (!cell.taskId) {
            return newChildren ? { ...cell, children: newChildren } : cell;
          }
          const task = taskMap.get(cell.taskId);
          if (!task) {
            // 태스크 삭제됨 → 셀 내용 초기화 (연결 해제 + 텍스트/상태 클리어)
            return { id: cell.id, text: '', children: newChildren };
          }
          return { ...cell, text: task.task, achievement: task.achievement, status: task.status, children: newChildren };
        };
        const updatedWl: Record<MandalartPeriod, MandalartCell[]> = { ...wl };
        for (const p of ['daily', 'weekly', 'monthly'] as const) {
          if (!updatedWl[p] || updatedWl[p].length === 0) continue;
          updatedWl[p] = updatedWl[p].map(syncCell);
        }
        return { ...mp, [WORKLOG_MANDALART_ID]: updatedWl };
      });
      return newTasks;
    });
  }, []);

  const updateSlot = (index: number, field: keyof TimeSlotEntry, value: string) => {
    setTimeSlots(prev => prev.map((s, i) => i === index ? { ...s, [field]: value } : s));
    // Classic → Franklin 역방향 동기화: 연결된 과업 자동 업데이트
    const slotId = timeSlots[index]?.id;
    if (slotId) {
      setTasks(prev => syncSlotToFranklin(prev, slotId, field, value));
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
      tasks,
      mandalartTypes,
      mandalartByTypeAndPeriod,
      mandalartActiveType,
    };
    const filledTitles = (viewMode !== 'classic')
      ? tasks.filter(t => t.task).map(t => `${t.priority}${t.number} ${t.task}`)
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
              <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded font-semibold text-[10px]">{emp.name}</span>
              <span className="text-[10px]">{position} · {emp.department}</span>
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

        {/* 오늘의 업무 / 다음 날 업무 (펼치기/접기 + 마크다운 + 자동 채움) */}
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-blue-200 bg-blue-50/30 overflow-hidden">
            <div className="px-2 py-1 bg-blue-100/50 border-b border-blue-200 flex items-center justify-between">
              <span className="text-[11px] font-bold text-blue-700">오늘의 업무</span>
              <span className="text-[9px] text-blue-400">{tasks.filter(t => t.startTime).length}건 배정</span>
            </div>
            {/* 업무 내역 (펼치기/접기) */}
            {tasks.filter(t => t.startTime).length > 0 && (
              <>
                <button onClick={() => setTodayListOpen(p => !p)} className="w-full px-2 py-0.5 text-[9px] text-blue-500 font-bold bg-blue-50/80 border-b border-blue-100 text-left hover:bg-blue-100/50">
                  {todayListOpen ? '▼' : '▶'} 업무 내역 ({tasks.filter(t => t.startTime).length})
                </button>
                {todayListOpen && (
                  <div className="px-2 py-1 border-b border-blue-100 bg-blue-50/50 text-[10px] space-y-0.5">
                    {tasks.filter(t => t.startTime).sort((a,b) => (a.startTime||'').localeCompare(b.startTime||'')).map(t => (
                      <div key={t.id} className="flex items-center gap-1">
                        <span className="font-mono text-blue-500 shrink-0">{t.startTime}{t.endTime ? '~'+t.endTime : ''}</span>
                        <span className={`font-bold shrink-0 ${t.status === 'done' ? 'text-emerald-600' : t.status === 'progress' ? 'text-blue-600' : 'text-gray-400'}`}>
                          {FRANKLIN_STATUS_CONFIG[t.status].icon}
                        </span>
                        <span className={t.status === 'cancelled' ? 'line-through text-gray-400' : ''}>{t.task}</span>
                        {(t.achievement || 0) > 0 && <span className={`text-[8px] font-bold ${(t.achievement||0)>=4?'text-emerald-600':'text-amber-500'}`}>{'●'.repeat(Math.min(t.achievement||0,3))}{'◆'.repeat(Math.max((t.achievement||0)-3,0))}{'○'.repeat(5-(t.achievement||0))}</span>}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
            {/* 내용 (펼치기/접기) */}
            <button onClick={() => setTodayMemoOpen(p => !p)} className="w-full px-2 py-0.5 text-[9px] text-blue-500 font-bold bg-blue-50/30 border-b border-blue-100 text-left hover:bg-blue-100/50">
              {todayMemoOpen ? '▼' : '▶'} 내용 {todayTasks ? `(${todayTasks.split('\n').filter(Boolean).length}줄)` : ''}
            </button>
            {todayMemoOpen && (
              <MarkdownField value={todayTasks} onChange={setTodayTasks} placeholder="추가 메모 (마크다운 지원)" minHeight={30} />
            )}
          </div>
          <div className="rounded-lg border border-amber-200 bg-amber-50/30 overflow-hidden">
            <div className="px-2 py-1 bg-amber-100/50 border-b border-amber-200 flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-700">다음 날 업무</span>
              <span className="text-[9px] text-amber-400">{tasks.filter(t => t.status === 'forwarded').length}건 이월</span>
            </div>
            {/* 이월 업무 내역 (펼치기/접기) */}
            {tasks.filter(t => t.status === 'forwarded').length > 0 && (
              <>
                <button onClick={() => setTomorrowListOpen(p => !p)} className="w-full px-2 py-0.5 text-[9px] text-amber-500 font-bold bg-amber-50/80 border-b border-amber-100 text-left hover:bg-amber-100/50">
                  {tomorrowListOpen ? '▼' : '▶'} 이월 업무 ({tasks.filter(t => t.status === 'forwarded').length})
                </button>
                {tomorrowListOpen && (
                  <div className="px-2 py-1 border-b border-amber-100 bg-amber-50/50 text-[10px] space-y-0.5">
                    {tasks.filter(t => t.status === 'forwarded').map(t => (
                      <div key={t.id} className="flex items-center gap-1">
                        <span className="text-amber-500 font-bold">→</span>
                        <span className="font-bold shrink-0" style={{ color: FRANKLIN_PRIORITY_CONFIG[t.priority].color }}>{t.priority}{t.number}</span>
                        <span>{t.task}</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
            {/* 내용 (펼치기/접기) */}
            <button onClick={() => setTomorrowMemoOpen(p => !p)} className="w-full px-2 py-0.5 text-[9px] text-amber-500 font-bold bg-amber-50/30 border-b border-amber-100 text-left hover:bg-amber-100/50">
              {tomorrowMemoOpen ? '▼' : '▶'} 내용 {tomorrowTasks ? `(${tomorrowTasks.split('\n').filter(Boolean).length}줄)` : ''}
            </button>
            {tomorrowMemoOpen && (
              <MarkdownField value={tomorrowTasks} onChange={setTomorrowTasks} placeholder="추가 메모 (마크다운 지원)" minHeight={30} />
            )}
          </div>
        </div>

        {/* Mode toggle + Period + Stats */}
        {(() => {
          // 통계 계산 (모든 뷰 공통)
          const filledSlots = timeSlots.filter(s => s.title.trim()).length;
          const totalSlots = timeSlots.length;
          const doneTasks = tasks.filter(t => t.status === 'done').length;
          const totalTasks = tasks.length;
          const mStats = viewMode === 'mandalart' && mandalartCells.length >= mandalartCellCount(activeSize)
            ? calcGridAchievement(mandalartCells, mandalartCenterIdx(activeSize)) : null;
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
                    <span className="text-blue-600 font-bold">작성 {mStats.filled}/{mandalartChildCount(activeSize)}</span>
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
                    <span className="text-amber-500 font-bold">진행 {tasks.filter(t=>t.status==='progress').length}</span>
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

        {/* ⑤ 대기함 — 타임테이블에서 빼낸 업무만 표시 */}
        {(() => {
          const allFlat = tasks.flatMap(t => [t, ...(t.children || [])]);
          const queued = allFlat.filter(t => t.queued);
          if (queued.length === 0) return (
            <div
              className="border border-dashed border-slate-200 rounded-lg p-1.5 bg-slate-50/20 transition-colors"
              onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; e.currentTarget.style.borderColor = '#f59e0b'; e.currentTarget.style.background = '#fffbeb'; }}
              onDragLeave={e => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.background = ''; }}
              onDrop={e => {
                e.preventDefault();
                e.currentTarget.style.borderColor = '';
                e.currentTarget.style.background = '';
                const droppedId = e.dataTransfer.getData('text/plain');
                if (!droppedId) return;
                const allF = tasks.flatMap(ft => [ft, ...(ft.children || [])]);
                const task = allF.find(ft => ft.id === droppedId);
                if (task?.timeSlotId) {
                  const slotIdx = timeSlots.findIndex(s => s.id === task.timeSlotId);
                  if (slotIdx >= 0) updateSlot(slotIdx, 'title', '');
                }
                setTasks(prev => prev.map(t => {
                  if (t.id === droppedId) return { ...t, startTime: undefined, endTime: undefined, timeSlotId: undefined, queued: true };
                  if (t.children?.some(c => c.id === droppedId)) return { ...t, children: t.children.map(c => c.id === droppedId ? { ...c, startTime: undefined, endTime: undefined, timeSlotId: undefined, queued: true } : c) };
                  return t;
                }));
              }}
            >
              <div className="text-[9px] text-slate-400 italic text-center py-0.5">대기함 — 타임테이블에서 여기로 드래그하여 해제</div>
            </div>
          );
          return (
            <div
              className="border border-dashed border-amber-300 rounded-lg p-2 bg-amber-50/30 transition-colors"
              onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; e.currentTarget.style.borderColor = '#f59e0b'; e.currentTarget.style.background = '#fffbeb'; }}
              onDragLeave={e => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.background = ''; }}
              onDrop={e => {
                e.preventDefault();
                e.currentTarget.style.borderColor = '';
                e.currentTarget.style.background = '';
                const droppedId = e.dataTransfer.getData('text/plain');
                if (!droppedId) return;
                const allF = tasks.flatMap(ft => [ft, ...(ft.children || [])]);
                const task = allF.find(ft => ft.id === droppedId);
                if (task?.timeSlotId) {
                  const slotIdx = timeSlots.findIndex(s => s.id === task.timeSlotId);
                  if (slotIdx >= 0) updateSlot(slotIdx, 'title', '');
                }
                setTasks(prev => prev.map(t => {
                  if (t.id === droppedId) return { ...t, startTime: undefined, endTime: undefined, timeSlotId: undefined, queued: true };
                  if (t.children?.some(c => c.id === droppedId)) return { ...t, children: t.children.map(c => c.id === droppedId ? { ...c, startTime: undefined, endTime: undefined, timeSlotId: undefined, queued: true } : c) };
                  return t;
                }));
              }}
            >
              <div className="text-[10px] font-bold text-amber-700 mb-1">대기함 ({queued.length}개)</div>
              <div className="grid grid-cols-4 gap-1">
                {queued.map(t => {
                  const pCfg = FRANKLIN_PRIORITY_CONFIG[t.priority];
                  const stCfg = FRANKLIN_STATUS_CONFIG[t.status];
                  return (
                    <div key={t.id} draggable
                      onDragStart={e => { e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', t.id); }}
                      className="flex items-center gap-1 px-1.5 py-1 rounded border border-amber-200 bg-white cursor-grab active:cursor-grabbing hover:shadow-sm text-[10px]"
                      style={{ borderLeftColor: pCfg.color, borderLeftWidth: 3 }}>
                      <span style={{ color: stCfg.color, fontSize: 9 }}>{stCfg.icon}</span>
                      <span className="font-bold shrink-0" style={{ color: pCfg.color }}>{t.priority}{t.number}</span>
                      <span className="truncate text-[9px]">{t.task}</span>
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
                // 시간 겹침 기반으로 모든 뷰에서 동일하게 태스크 매칭 (서브태스크 포함)
                const allTasksFlat = tasks.flatMap(t => [t, ...(t.children || [])]);
                const slotTasks = allTasksFlat.filter(t => {
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

                const inDragRange = dragRangeHint && index >= dragRangeHint.lo && index <= dragRangeHint.hi;
                return viewMode === 'classic' ? (
                  /* Classic: 확장 — 시간 + 제목 + 내용 + AI + 예정 인라인 편집 */
                  <div key={slot.id} className={`border-b border-border/50 last:border-b-0 ${inDragRange ? 'bg-amber-50/60' : ''}`}
                    onDragEnter={() => trackDragEnter(index)}
                    onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; e.currentTarget.style.background = '#dbeafe'; }}
                    onDragLeave={e => { e.currentTarget.style.background = ''; }}
                    onDrop={e => {
                      e.preventDefault();
                      e.currentTarget.style.background = '';
                      const droppedText = e.dataTransfer.getData('text/plain');
                      if (!droppedText) { setDragRangeHint(null); return; }
                      // top-level + children 모두 검색
                      const allFlat = tasks.flatMap(t => [t, ...(t.children || [])]);
                      let task = allFlat.find(t => t.id === droppedText);
                      if (!task) task = allFlat.find(t => t.task === droppedText);
                      if (task) {
                        const tid = task.id;
                        const span = computeDropSpan(index, task);
                        const newTasks = tasks.map(t => {
                          if (t.id === tid) return { ...t, startTime: span.startTime, endTime: span.endTime, timeSlotId: span.timeSlotId, queued: undefined };
                          if (t.children?.some(c => c.id === tid)) return { ...t, children: t.children.map(c => c.id === tid ? { ...c, startTime: span.startTime, endTime: span.endTime, timeSlotId: span.timeSlotId, queued: undefined } : c) };
                          return t;
                        });
                        handleTasksChange(newTasks);
                        updateSlot(span.loIdx, 'title', task.task);
                      } else {
                        // 매칭 실패 → 새 태스크 생성 (id 패턴은 무시)
                        const cleaned = droppedText.trim();
                        if (!cleaned || /^(ft-|mc-)/.test(cleaned)) { setDragRangeHint(null); return; }
                        const span = computeDropSpan(index);
                        const newTask: Task = {
                          id: `ft-d-${Date.now()}-${Math.random().toString(36).slice(2,6)}`,
                          priority: 'B',
                          number: getNextNumber(tasks, 'B'),
                          task: cleaned, status: 'pending',
                          important: true, urgent: false, period,
                          startTime: span.startTime, endTime: span.endTime, timeSlotId: span.timeSlotId,
                        };
                        handleTasksChange([...tasks, newTask]);
                        updateSlot(span.loIdx, 'title', cleaned);
                      }
                      dragSlotRangeRef.current = { firstIdx: null, lastIdx: null };
                      setDragRangeHint(null);
                    }}>
                    <div className="md:grid md:grid-cols-[80px_1fr_1fr_80px_1fr] flex flex-col">
                      <div className="px-2 py-1.5 md:border-r border-border bg-accent/10 flex items-center gap-1 flex-wrap">
                        <span className="text-[10px] font-mono text-muted-foreground shrink-0">{slot.timeSlot}</span>
                        {tasks_.map(t => (
                          <span key={t.id} draggable
                            onDragStart={e => { e.stopPropagation(); e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', t.id); }}
                            className="text-[8px] font-bold px-1 rounded cursor-grab active:cursor-grabbing" style={{ background: FRANKLIN_PRIORITY_CONFIG[t.priority].bg, color: FRANKLIN_PRIORITY_CONFIG[t.priority].color }}>
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
                    className={`border-b border-border/50 transition-colors ${inDragRange ? 'bg-amber-100/70' : hasFill ? 'bg-accent/5' : 'hover:bg-blue-50/30'}`}
                    onDragEnter={() => trackDragEnter(index)}
                    onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; e.currentTarget.style.background = '#dbeafe'; }}
                    onDragLeave={e => { e.currentTarget.style.background = ''; }}
                    onDrop={e => {
                      e.preventDefault();
                      e.currentTarget.style.background = '';
                      const droppedText = e.dataTransfer.getData('text/plain');
                      if (!droppedText) { setDragRangeHint(null); return; }
                      const allFlat = tasks.flatMap(t => [t, ...(t.children || [])]);
                      let task = allFlat.find(t => t.id === droppedText);
                      if (!task) task = allFlat.find(t => t.task === droppedText);
                      if (task) {
                        const tid = task.id;
                        const span = computeDropSpan(index, task);
                        const newTasks = tasks.map(t => {
                          if (t.id === tid) return { ...t, startTime: span.startTime, endTime: span.endTime, timeSlotId: span.timeSlotId, queued: undefined };
                          if (t.children?.some(c => c.id === tid)) return { ...t, children: t.children.map(c => c.id === tid ? { ...c, startTime: span.startTime, endTime: span.endTime, timeSlotId: span.timeSlotId, queued: undefined } : c) };
                          return t;
                        });
                        handleTasksChange(newTasks);
                        updateSlot(span.loIdx, 'title', task.task);
                      } else {
                        // 매칭 실패 → 새 태스크 생성 후 슬롯에 배정 (id 패턴은 무시)
                        const cleaned = droppedText.trim();
                        if (!cleaned || /^(ft-|mc-)/.test(cleaned)) { setDragRangeHint(null); return; }
                        const span = computeDropSpan(index);
                        const newTask: Task = {
                          id: `ft-d-${Date.now()}-${Math.random().toString(36).slice(2,6)}`,
                          priority: 'B',
                          number: getNextNumber(tasks, 'B'),
                          task: cleaned, status: 'pending',
                          important: true, urgent: false, period,
                          startTime: span.startTime, endTime: span.endTime, timeSlotId: span.timeSlotId,
                        };
                        handleTasksChange([...tasks, newTask]);
                        updateSlot(span.loIdx, 'title', cleaned);
                      }
                      dragSlotRangeRef.current = { firstIdx: null, lastIdx: null };
                      setDragRangeHint(null);
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
                            <div key={t.id} draggable
                              onDragStart={e => { e.stopPropagation(); e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', t.id); }}
                              className="flex items-center gap-1 rounded px-1 py-0.5 cursor-grab active:cursor-grabbing" style={{ background: pCfg.color + '15', borderLeft: `2px solid ${pCfg.color}` }}>
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
                  tasks={tasks}
                  onCellsChange={setMandalartCells}
                  onTasksChange={handleTasksChange}
                  onSlotTitleChange={(idx, title) => updateSlot(idx, 'title', title)}
                  period={period}
                  size={activeSize}
                  types={mandalartTypes}
                  activeTypeId={mandalartActiveType}
                  onActiveTypeChange={setMandalartActiveType}
                  onSizeChange={(newSize) => {
                    setMandalartTypes(prev => prev.map(t => t.id === mandalartActiveType ? { ...t, size: newSize } : t));
                  }}
                  syncTasks={mandalartActiveType === WORKLOG_MANDALART_ID}
                />
              ) : viewMode === 'eisenhower' ? (
                <EisenhowerView
                  tasks={tasks.filter(t => !t.period || t.period === period)}
                  timeSlots={timeSlots}
                  onTasksChange={newTasks => {
                    // period 필터링된 태스크만 받으므로 다른 period 태스크는 유지
                    const otherPeriod = tasks.filter(t => t.period && t.period !== period);
                    handleTasksChange([...otherPeriod, ...newTasks]);
                  }}
                  onSlotTitleChange={(idx, title) => updateSlot(idx, 'title', title)}
                  period={period}
                />
              ) : (
                <FranklinView
                  tasks={tasks.filter(t => !t.period || t.period === period)}
                  timeSlots={timeSlots}
                  timeInterval={timeInterval}
                  onTasksChange={newTasks => {
                    const otherPeriod = tasks.filter(t => t.period && t.period !== period);
                    handleTasksChange([...otherPeriod, ...newTasks]);
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