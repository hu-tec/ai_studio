import { useState, useEffect, useCallback, useRef } from 'react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, parseISO, startOfMonth, endOfMonth } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Save, FileDown, List, Target, Grid2x2, LayoutGrid, ChevronDown, ChevronUp } from 'lucide-react';
import { AIDetailModal } from './AIDetailModal';
import { FranklinView } from './FranklinView';
import { EisenhowerView } from './EisenhowerView';
import { MandalartView, calcGridAchievement } from './MandalartView';
import type { DailyLog, TimeSlotEntry, AIDetail, Position, ViewMode, Task, TaskSlot, MandalartCell, MandalartPeriod, MandalartSize, MandalartTypeConfig } from './data';
import { homepageCategories, departmentCategories, positions, currentEmployee, employees, createEmptyTimeSlots, createEmptyTasks, syncFranklinToSlots, syncSlotToFranklin, getNextNumber, timeToMinutes, minutesToTime, DEFAULT_MANDALART_TYPES, WORKLOG_MANDALART_ID, mandalartCenterIdx, mandalartCellCount, mandalartChildCount, mandalartKey, normalizeMandalartSize, migrateMandalartKeys, resizeMandalartCells, sameMandalartSize, FRANKLIN_STATUS_CONFIG, FRANKLIN_PRIORITY_CONFIG, isWorklogType, loadPersistentCells, savePersistentCells, loadPersistentTypes, savePersistentTypes, findTypeInTree, taskSlots, withSlots, taskCoversSlot } from './data';
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
  allLogs?: DailyLog[]; // 이월 누적 계산용 — 같은 직원의 전체 일지
}

export function DailyDetail({ date, log, onSave, employeeId, onFlushRef, allLogs }: DailyDetailProps) {
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
  // 만다라트: 타입 × 기간 × 크기 독립 저장 — key = `${type}|${period}|${size}`
  const [mandalartTypes, setMandalartTypesRaw] = useState<MandalartTypeConfig[]>(DEFAULT_MANDALART_TYPES);
  const [mandalartActiveType, setMandalartActiveType] = useState<string>(WORKLOG_MANDALART_ID);
  const [mandalartActiveSize, setMandalartActiveSize] = useState<MandalartSize>({ rows: 3, cols: 3 });
  const [mandalartCellsByKey, setMandalartCellsByKey] = useState<Record<string, MandalartCell[]>>({});
  // 추가 블록 persistent cells (날짜 무관)
  const [persistentCellsByKey, setPersistentCellsByKey] = useState<Record<string, MandalartCell[]>>(() => loadPersistentCells(employeeId));
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [period, setPeriod] = useState<MandalartPeriod>('daily');
  // types 변경 시 persistent storage에도 저장
  const setMandalartTypes = useCallback((updater: MandalartTypeConfig[] | ((prev: MandalartTypeConfig[]) => MandalartTypeConfig[])) => {
    setMandalartTypesRaw(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      savePersistentTypes(employeeId, next);
      return next;
    });
  }, [employeeId]);
  const [showStats, setShowStats] = useState(false);
  const [todayListOpen, setTodayListOpen] = useState(true);
  const [todayMemoOpen, setTodayMemoOpen] = useState(true);
  const [tomorrowListOpen, setTomorrowListOpen] = useState(true);
  const [tomorrowMemoOpen, setTomorrowMemoOpen] = useState(true);
  // 주간/월간 뷰에서 날짜 탭 필터: null=전체, 'YYYY-MM-DD' = 해당 일
  const [dateTabFilter, setDateTabFilter] = useState<string | null>(null);

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
  // 드롭할 슬롯 index 목록 — 범위 드래그 > duration 보존 > 1-slot
  // 핵심: 범위 드롭 시 개별 슬롯 N개로 분할 (그룹 배정 금지)
  const computeDropSlotIdxs = useCallback((dropIdx: number, origTask?: Task): number[] => {
    const cur = dragSlotRangeRef.current;
    const hasRange = cur.firstIdx !== null && cur.lastIdx !== null && cur.firstIdx !== cur.lastIdx;
    if (hasRange) {
      const lo = Math.min(cur.firstIdx!, cur.lastIdx!, dropIdx);
      const hi = Math.max(cur.firstIdx!, cur.lastIdx!, dropIdx);
      const idxs: number[] = [];
      for (let i = lo; i <= hi; i++) idxs.push(i);
      return idxs;
    }
    // duration 보존: 원본 task의 length(분) → 필요한 슬롯 수 계산
    if (origTask?.startTime && origTask?.endTime) {
      const dur = timeToMinutes(origTask.endTime) - timeToMinutes(origTask.startTime);
      const dropSlot = timeSlots[dropIdx];
      const sStart = timeToMinutes(dropSlot?.timeSlot.split('~')[0]?.trim() || '');
      const sEnd = timeToMinutes(dropSlot?.timeSlot.split('~')[1]?.trim() || '');
      const slotDur = sEnd - sStart;
      if (dur > 0 && slotDur > 0) {
        const count = Math.max(1, Math.round(dur / slotDur));
        const idxs: number[] = [];
        for (let i = 0; i < count && dropIdx + i < timeSlots.length; i++) idxs.push(dropIdx + i);
        return idxs;
      }
    }
    return [dropIdx];
  }, [timeSlots]);

  // 슬롯 index 목록 → 개별 TaskSlot N개
  const slotIdxsToRanges = useCallback((idxs: number[]): TaskSlot[] => {
    const out: TaskSlot[] = [];
    for (const i of idxs) {
      const s = timeSlots[i];
      if (!s) continue;
      out.push({
        startTime: s.timeSlot.split('~')[0]?.trim() || '',
        endTime: s.timeSlot.split('~')[1]?.trim() || '',
        timeSlotId: s.id,
      });
    }
    return out;
  }, [timeSlots]);

  // 중복 슬롯 제거 (timeSlotId 우선, 없으면 startTime 키)
  const dedupeRanges = useCallback((ranges: TaskSlot[]): TaskSlot[] => {
    const seen = new Set<string>();
    const out: TaskSlot[] = [];
    for (const r of ranges) {
      const k = r.timeSlotId || `${r.startTime}-${r.endTime}`;
      if (seen.has(k)) continue;
      seen.add(k);
      out.push(r);
    }
    return out;
  }, []);

  const activeSize = mandalartActiveSize;
  const activeIsWorklog = isWorklogType(mandalartActiveType);
  // 추가 블록의 root type 탐색 (서브탭 중 어디든 worklog이 아니면 persistent)
  const activeRootType = findTypeInTree(mandalartTypes, mandalartActiveType);
  const activeIsPersistent = !activeIsWorklog && !(activeRootType && activeRootType.id === WORKLOG_MANDALART_ID);
  const effectivePeriod = activeIsPersistent ? 'always' as MandalartPeriod : period;
  const currentMandalartKey = mandalartKey(mandalartActiveType, effectivePeriod, activeSize);
  const mandalartCells = activeIsPersistent
    ? (persistentCellsByKey[currentMandalartKey] || [])
    : (mandalartCellsByKey[currentMandalartKey] || []);
  const setMandalartCells = useCallback((cells: MandalartCell[] | ((prev: MandalartCell[]) => MandalartCell[])) => {
    const isPersistent = !isWorklogType(mandalartActiveType);
    const effPeriod = isPersistent ? 'always' as MandalartPeriod : period;
    const key = mandalartKey(mandalartActiveType, effPeriod, activeSize);

    if (isPersistent) {
      setPersistentCellsByKey(prev => {
        const newCells = typeof cells === 'function' ? cells(prev[key] || []) : cells;
        const next = { ...prev, [key]: newCells };
        savePersistentCells(employeeId, next);
        return next;
      });
      return;
    }

    setMandalartCellsByKey(prev => {
      const newCells = typeof cells === 'function' ? cells(prev[key] || []) : cells;
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
      return { ...prev, [key]: newCells };
    });
  }, [period, mandalartActiveType, activeSize, employeeId]);

  // 크기 변경 — 이전 크기의 셀을 2D 좌표 보존 remap하여 새 크기 key에 seed.
  // 새 key 에 이미 작성된 셀(텍스트 있음)은 유지(merge), 빈칸만 remap 결과로 채움.
  const handleMandalartSizeChange = useCallback((newSize: MandalartSize) => {
    if (sameMandalartSize(newSize, mandalartActiveSize)) return;
    const isPers = !isWorklogType(mandalartActiveType);
    const effP = isPers ? 'always' as MandalartPeriod : period;
    const oldKey = mandalartKey(mandalartActiveType, effP, mandalartActiveSize);
    const newKey = mandalartKey(mandalartActiveType, effP, newSize);
    const doResize = (prev: Record<string, MandalartCell[]>) => {
      const oldCells = prev[oldKey] || [];
      if (oldCells.length === 0) return prev;
      const existingNewCells = prev[newKey] || [];
      const remapped = resizeMandalartCells(oldCells, mandalartActiveSize, newSize);
      const newCount = mandalartCellCount(newSize);
      const merged: MandalartCell[] = Array.from({ length: newCount }, (_, i) => {
        const existing = existingNewCells[i];
        if (existing && existing.text?.trim()) return existing;
        return remapped[i] || { id: `mc-new-${Date.now()}-${i}`, text: '', children: [], achievement: 0 };
      });
      return { ...prev, [newKey]: merged };
    };
    if (oldKey !== newKey) {
      if (isPers) {
        setPersistentCellsByKey(prev => {
          const next = doResize(prev);
          savePersistentCells(employeeId, next);
          return next;
        });
      } else {
        setMandalartCellsByKey(doResize);
      }
    }
    setMandalartActiveSize(newSize);
  }, [mandalartActiveType, period, mandalartActiveSize]);

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
      mandalartTypes, mandalartCellsByKey, mandalartActiveType, mandalartActiveSize,
      todayTasks, tomorrowTasks,
    });
  }, [dateStr, position, hpCategories, deptCategories, timeInterval, timeSlots, detail, viewMode, tasks, mandalartTypes, mandalartCellsByKey, mandalartActiveType, mandalartActiveSize, emp.name, onSave, employeeId, todayTasks, tomorrowTasks]);

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
  }, [position, hpCategories, deptCategories, timeInterval, timeSlots, detail, viewMode, tasks, mandalartCellsByKey, mandalartTypes, mandalartActiveType, mandalartActiveSize, todayTasks, tomorrowTasks]);

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
      // 만다라트 타입 목록 로드 — persistent 우선, 레거시 fallback
      const persistedTypes = loadPersistentTypes(employeeId);
      const rawTypes = persistedTypes || (log.mandalartTypes && log.mandalartTypes.length > 0 ? log.mandalartTypes : DEFAULT_MANDALART_TYPES);
      const loadedTypes: MandalartTypeConfig[] = rawTypes.map(t => ({
        ...t,
        size: normalizeMandalartSize((t as any).size),
        allowChildren: t.allowChildren ?? (t.id !== WORKLOG_MANDALART_ID),
      }));
      setMandalartTypesRaw(loadedTypes);
      if (!persistedTypes) savePersistentTypes(employeeId, loadedTypes);
      setMandalartActiveType(log.mandalartActiveType || WORKLOG_MANDALART_ID);
      // persistent cells 로드
      setPersistentCellsByKey(loadPersistentCells(employeeId));
      setMandalartActiveSize(normalizeMandalartSize(log.mandalartActiveSize));
      // 만다라트 데이터 로드 (3-tier 레거시 호환)
      if (log.mandalartCellsByKey) {
        // 최신 구조 — 레거시 key(`typeId|period|N`) → `typeId|period|NxN` 마이그레이션
        setMandalartCellsByKey(migrateMandalartKeys(log.mandalartCellsByKey));
      } else if (log.mandalartByTypeAndPeriod) {
        // Legacy 2: 타입별×기간별 (크기 미분리) — 길이로 size 추정
        const byKey: Record<string, MandalartCell[]> = {};
        for (const typeId of Object.keys(log.mandalartByTypeAndPeriod)) {
          for (const p of ['daily', 'weekly', 'monthly'] as const) {
            const arr = log.mandalartByTypeAndPeriod[typeId]?.[p];
            if (!arr || arr.length === 0) continue;
            const detectedSize: MandalartSize = arr.length >= 25 ? { rows: 5, cols: 5 } : arr.length >= 16 ? { rows: 4, cols: 4 } : { rows: 3, cols: 3 };
            byKey[mandalartKey(typeId, p, detectedSize)] = arr;
          }
        }
        setMandalartCellsByKey(byKey);
      } else if (log.mandalartByPeriod) {
        // Legacy 1: 단일 타입, 단일 크기(3×3) — worklog 로 이동
        const byKey: Record<string, MandalartCell[]> = {};
        for (const p of ['daily', 'weekly', 'monthly'] as const) {
          const arr = log.mandalartByPeriod[p];
          if (arr && arr.length > 0) {
            byKey[mandalartKey(WORKLOG_MANDALART_ID, p, { rows: 3, cols: 3 })] = arr;
          }
        }
        setMandalartCellsByKey(byKey);
      } else {
        setMandalartCellsByKey({});
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
      const persistedTypes = loadPersistentTypes(employeeId);
      const fallbackTypes = persistedTypes || DEFAULT_MANDALART_TYPES.map(t => ({ ...t, allowChildren: t.allowChildren ?? (t.id !== WORKLOG_MANDALART_ID) }));
      setMandalartTypesRaw(fallbackTypes);
      if (!persistedTypes) savePersistentTypes(employeeId, fallbackTypes);
      setMandalartActiveType(WORKLOG_MANDALART_ID);
      setMandalartActiveSize({ rows: 3, cols: 3 });
      setMandalartCellsByKey({});
      setPersistentCellsByKey(loadPersistentCells(employeeId));
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
      // 동기화: 태스크 변경 → 업무일지 타입 만다라트 셀만 반영 (모든 기간 × 모든 크기)
      setMandalartCellsByKey(mp => {
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
        const updated: Record<string, MandalartCell[]> = { ...mp };
        const prefix = WORKLOG_MANDALART_ID + '|';
        for (const key in updated) {
          if (!key.startsWith(prefix)) continue;
          if (!updated[key] || updated[key].length === 0) continue;
          updated[key] = updated[key].map(syncCell);
        }
        return updated;
      });
      return newTasks;
    });
  }, []);

  // task의 slots 배열을 업데이트하고 handleTasksChange 호출
  const applyTaskRanges = useCallback((taskId: string, nextRanges: TaskSlot[], extra?: Partial<Task>) => {
    const sorted = [...nextRanges].sort((a, b) => a.startTime.localeCompare(b.startTime));
    const newTasks = tasks.map(t => {
      if (t.id === taskId) return withSlots({ ...t, ...(extra || {}) }, sorted);
      if (t.children?.some(c => c.id === taskId)) {
        return { ...t, children: t.children.map(c => c.id === taskId ? withSlots({ ...c, ...(extra || {}) }, sorted) : c) };
      }
      return t;
    });
    handleTasksChange(newTasks);
  }, [tasks, handleTasksChange]);

  // 특정 range 제거 (모두 제거되면 slots=[] → 대기함 아님, 그냥 미할당)
  const removeTaskRange = useCallback((taskId: string, rangeIdx: number) => {
    const allFlat = tasks.flatMap(t => [t, ...(t.children || [])]);
    const target = allFlat.find(t => t.id === taskId);
    if (!target) return;
    const cur = taskSlots(target);
    const next = cur.filter((_, i) => i !== rangeIdx);
    applyTaskRanges(taskId, next);
  }, [tasks, applyTaskRanges]);


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
      mandalartCellsByKey,
      mandalartActiveType,
      mandalartActiveSize,
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
      <div className="px-2 py-1 border-b border-border bg-accent/20 flex items-center justify-between">
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

      <div className="p-1 space-y-2 [&_::-webkit-scrollbar]:hidden [&_*]:scrollbar-none" style={{ scrollbarWidth: 'none' }}>

        {/* Settings summary (collapsed) + expand toggle */}
        <div className="rounded-lg border border-border overflow-hidden">
          <button
            onClick={() => setSettingsOpen(p => !p)}
            className="w-full px-2 py-1.5 flex items-center justify-between bg-accent/10 hover:bg-accent/20 transition-colors"
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

        {/* 기간별 업무 패널 (3열: 현재 · 다음 · 이월) */}
        {(() => {
          const periodLabels: Record<MandalartPeriod, { cur: string; next: string }> = {
            daily: { cur: '오늘의 업무', next: '다음 날 업무' },
            weekly: { cur: '이번 주 업무', next: '다음 주 업무' },
            monthly: { cur: '이번 달 업무', next: '다음 달 업무' },
            always: { cur: '상시 업무', next: '예정 업무' },
          };
          const { cur: curLabel, next: nextLabel } = periodLabels[period];
          const inPeriod = (t: Task) => !t.period || t.period === period;
          // 기간별 날짜 범위 (주간: 월~일, 월간: 해당 월 전체)
          const weekStart = startOfWeek(date, { weekStartsOn: 1 });
          const weekEnd = endOfWeek(date, { weekStartsOn: 1 });
          const monthStart = startOfMonth(date);
          const monthEnd = endOfMonth(date);
          const periodDates: string[] = period === 'weekly'
            ? eachDayOfInterval({ start: weekStart, end: weekEnd }).map(d => format(d, 'yyyy-MM-dd'))
            : period === 'monthly'
              ? eachDayOfInterval({ start: monthStart, end: monthEnd }).map(d => format(d, 'yyyy-MM-dd'))
              : [dateStr];
          const showDateTabs = period === 'weekly' || period === 'monthly';
          const sourceLogs = allLogs && allLogs.length > 0 ? allLogs : (log ? [log] : []);

          // 주간/월간 — 각 일자 로그의 task를 수집 (assigned = 해당 일 slots 배정된 것)
          type AssignedItem = { task: Task; fromDate: string };
          const assignedAll: AssignedItem[] = [];
          if (showDateTabs) {
            const dateSet = new Set(periodDates);
            for (const l of sourceLogs) {
              if (!dateSet.has(l.date)) continue;
              for (const t of (l.tasks || [])) {
                if (!inPeriod(t)) continue;
                if (taskSlots(t).length === 0) continue;
                assignedAll.push({ task: t, fromDate: l.date });
              }
            }
          } else {
            for (const t of tasks) {
              if (!inPeriod(t)) continue;
              if (taskSlots(t).length === 0) continue;
              assignedAll.push({ task: t, fromDate: dateStr });
            }
          }
          const assigned = (dateTabFilter && showDateTabs)
            ? assignedAll.filter(a => a.fromDate === dateTabFilter)
            : assignedAll;

          // 이월 pool: 전체 일지에서 누적 — 완료/취소 제외한 모든 미완료 업무
          type CarryItem = { task: Task; fromDate: string; isToday: boolean };
          const carryMap = new Map<string, CarryItem>();
          const currentTaskIds = new Set(tasks.map(t => t.id));
          for (const l of sourceLogs) {
            for (const t of (l.tasks || [])) {
              if (t.status === 'done' || t.status === 'cancelled') continue;
              if (!t.task?.trim()) continue;
              if (l.date === dateStr && currentTaskIds.has(t.id) && taskSlots(t).length > 0) continue;
              const isToday = l.date === dateStr;
              if (isToday && taskSlots(t).length > 0 && t.status !== 'forwarded') continue;
              const key = t.rolledFromId || `${t.task.trim()}|${t.priority}`;
              const existing = carryMap.get(key);
              if (!existing || l.date > existing.fromDate) {
                carryMap.set(key, { task: t, fromDate: l.date, isToday });
              }
            }
          }
          const carryoverAll = Array.from(carryMap.values()).sort((a, b) => a.fromDate.localeCompare(b.fromDate));
          const carryover = (dateTabFilter && showDateTabs)
            ? carryoverAll.filter(c => c.fromDate === dateTabFilter)
            : carryoverAll;
          const forwardedCount = carryoverAll.filter(c => c.task.status === 'forwarded').length;

          // 각 일자별 건수 (탭 카운터)
          const dateCounts = new Map<string, number>();
          for (const a of assignedAll) dateCounts.set(a.fromDate, (dateCounts.get(a.fromDate) || 0) + 1);
          const weekDayShort = ['일', '월', '화', '수', '목', '금', '토'];
          const dateTabs = periodDates.map(d => {
            const dObj = parseISO(d);
            const label = period === 'weekly' ? `${weekDayShort[dObj.getDay()]}` : format(dObj, 'd');
            const sub = period === 'weekly' ? format(dObj, 'M/d') : weekDayShort[dObj.getDay()];
            return { date: d, label, sub, count: dateCounts.get(d) || 0 };
          });

          const dateTabBar = showDateTabs ? (
            <div className="flex gap-0.5 px-1.5 py-1 bg-blue-50/60 border-b border-blue-100 overflow-x-auto">
              <button onClick={() => setDateTabFilter(null)}
                className={`px-1.5 py-0.5 rounded text-[9px] font-semibold whitespace-nowrap shrink-0 ${dateTabFilter === null ? 'bg-blue-500 text-white' : 'bg-white text-blue-500 border border-blue-200 hover:bg-blue-100'}`}>
                전체({assignedAll.length})
              </button>
              {dateTabs.map(t => (
                <button key={t.date} onClick={() => setDateTabFilter(t.date)}
                  title={t.date}
                  className={`px-1.5 py-0.5 rounded text-[9px] font-semibold whitespace-nowrap shrink-0 flex items-center gap-0.5 ${dateTabFilter === t.date ? 'bg-blue-500 text-white' : t.count > 0 ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'bg-white text-gray-400 border border-gray-200'}`}>
                  <span>{t.label}</span>
                  <span className="text-[8px] opacity-70">{t.sub}</span>
                  {t.count > 0 && <span className="text-[8px] px-0.5 rounded bg-blue-600 text-white">{t.count}</span>}
                </button>
              ))}
            </div>
          ) : null;

          return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {/* Panel 1 — 현재 기간 배정된 업무 */}
              <div className="rounded-lg border border-blue-200 bg-blue-50/30 overflow-hidden">
                <div className="px-2 py-1 bg-blue-100/50 border-b border-blue-200 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-blue-700">{curLabel}</span>
                  <span className="text-[9px] text-blue-400">{assigned.length}건 배정{dateTabFilter ? ` (${dateTabFilter.slice(5)})` : ''}</span>
                </div>
                {dateTabBar}
                {assigned.length > 0 && (
                  <>
                    <button onClick={() => setTodayListOpen(p => !p)} className="w-full px-2 py-0.5 text-[9px] text-blue-500 font-bold bg-blue-50/80 border-b border-blue-100 text-left hover:bg-blue-100/50">
                      {todayListOpen ? '▼' : '▶'} 업무 내역 ({assigned.length})
                    </button>
                    {todayListOpen && (
                      <div className="px-2 py-1 border-b border-blue-100 bg-blue-50/50 text-[10px] space-y-0.5">
                        {assigned.slice().sort((a,b) => {
                          if (showDateTabs && a.fromDate !== b.fromDate) return a.fromDate.localeCompare(b.fromDate);
                          return (taskSlots(a.task)[0]?.startTime||'').localeCompare(taskSlots(b.task)[0]?.startTime||'');
                        }).map(({ task: t, fromDate }) => {
                          const r = taskSlots(t)[0];
                          return (
                            <div key={`${fromDate}-${t.id}`} className="flex items-center gap-1">
                              {showDateTabs && !dateTabFilter && <span className="text-[8px] font-mono text-blue-400 shrink-0 bg-white px-0.5 rounded">{fromDate.slice(5)}</span>}
                              <span className="font-mono text-blue-500 shrink-0">{r?.startTime}{r?.endTime ? '~'+r.endTime : ''}</span>
                              <span className={`font-bold shrink-0 ${t.status === 'done' ? 'text-emerald-600' : t.status === 'progress' ? 'text-blue-600' : 'text-gray-400'}`}>
                                {FRANKLIN_STATUS_CONFIG[t.status].icon}
                              </span>
                              <span className={t.status === 'cancelled' ? 'line-through text-gray-400' : ''}>{t.task}</span>
                              {(t.achievement || 0) > 0 && <span className={`text-[8px] font-bold ${(t.achievement||0)>=4?'text-emerald-600':'text-amber-500'}`}>{'●'.repeat(Math.min(t.achievement||0,3))}{'◆'.repeat(Math.max((t.achievement||0)-3,0))}{'○'.repeat(5-(t.achievement||0))}</span>}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}
                <button onClick={() => setTodayMemoOpen(p => !p)} className="w-full px-2 py-0.5 text-[9px] text-blue-500 font-bold bg-blue-50/30 border-b border-blue-100 text-left hover:bg-blue-100/50">
                  {todayMemoOpen ? '▼' : '▶'} 내용 {todayTasks ? `(${todayTasks.split('\n').filter(Boolean).length}줄)` : ''}
                </button>
                {todayMemoOpen && (
                  <MarkdownField value={todayTasks} onChange={setTodayTasks} placeholder="추가 메모 (마크다운 지원)" minHeight={30} />
                )}
              </div>

              {/* Panel 2 — 다음 기간 계획 메모 */}
              <div className="rounded-lg border border-amber-200 bg-amber-50/30 overflow-hidden">
                <div className="px-2 py-1 bg-amber-100/50 border-b border-amber-200 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-amber-700">{nextLabel}</span>
                  <span className="text-[9px] text-amber-400">계획 메모</span>
                </div>
                <button onClick={() => setTomorrowMemoOpen(p => !p)} className="w-full px-2 py-0.5 text-[9px] text-amber-500 font-bold bg-amber-50/30 border-b border-amber-100 text-left hover:bg-amber-100/50">
                  {tomorrowMemoOpen ? '▼' : '▶'} 내용 {tomorrowTasks ? `(${tomorrowTasks.split('\n').filter(Boolean).length}줄)` : ''}
                </button>
                {tomorrowMemoOpen && (
                  <MarkdownField value={tomorrowTasks} onChange={setTomorrowTasks} placeholder="추가 메모 (마크다운 지원)" minHeight={30} />
                )}
              </div>

              {/* Panel 3 — 이월 업무 (남은 업무 pool) */}
              <div className="rounded-lg border border-rose-200 bg-rose-50/30 overflow-hidden">
                <div className="px-2 py-1 bg-rose-100/50 border-b border-rose-200 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-rose-700">이월 업무</span>
                  <span className="text-[9px] text-rose-400">{carryover.length}건 남음{forwardedCount > 0 ? ` · 이월${forwardedCount}` : ''}</span>
                </div>
                {carryover.length > 0 ? (
                  <>
                    <button onClick={() => setTomorrowListOpen(p => !p)} className="w-full px-2 py-0.5 text-[9px] text-rose-500 font-bold bg-rose-50/80 border-b border-rose-100 text-left hover:bg-rose-100/50">
                      {tomorrowListOpen ? '▼' : '▶'} 업무 리스트 ({carryover.length})
                    </button>
                    {tomorrowListOpen && (
                      <div className="px-2 py-1 bg-rose-50/50 text-[10px] space-y-0.5">
                        {carryover.map(({ task: t, fromDate, isToday }) => {
                          const pCfg = FRANKLIN_PRIORITY_CONFIG[t.priority];
                          const stCfg = FRANKLIN_STATUS_CONFIG[t.status];
                          const tag = t.status === 'forwarded' ? '이월' : t.queued ? '대기' : taskSlots(t).length === 0 ? '미배정' : '';
                          return (
                            <div key={`${fromDate}-${t.id}`} className="flex items-center gap-1">
                              <span className="text-rose-500 font-bold">→</span>
                              <span className="font-bold shrink-0" style={{ color: pCfg.color }}>{t.priority}{t.number}</span>
                              <span className="shrink-0" style={{ color: stCfg.color }}>{stCfg.icon}</span>
                              <span className="flex-1 truncate">{t.task}</span>
                              {!isToday && <span className="text-[8px] px-1 rounded bg-gray-100 text-gray-600 shrink-0 font-mono">{fromDate.slice(5)}</span>}
                              {tag && <span className="text-[8px] px-1 rounded bg-rose-100 text-rose-600 shrink-0">{tag}</span>}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="px-2 py-2 text-[10px] text-rose-300 italic text-center">남은 업무 없음 — 만다라트/프랭클린에서 작성 후 타임테이블에 배정하세요</div>
                )}
              </div>
            </div>
          );
        })()}

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
                <div className="w-full flex items-center gap-1 px-2 py-1 bg-slate-50 rounded border border-slate-200 text-[10px]">
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

        {/* ⑤ 대기함 — 타임테이블에서 빼낸 업무만 표시 (만다라트 뷰에서만 노출) */}
        {viewMode === 'mandalart' && (() => {
          const allFlat = tasks.flatMap(t => [t, ...(t.children || [])]);
          const queued = allFlat.filter(t => t.queued);
          const handleQueueDrop = (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            e.currentTarget.style.borderColor = '';
            e.currentTarget.style.background = '';
            const droppedId = e.dataTransfer.getData('text/plain');
            if (!droppedId) return;
            const clearToQueue = (t: Task): Task => withSlots({ ...t, queued: true }, []);
            const newTasks = tasks.map(t => {
              if (t.id === droppedId) return clearToQueue(t);
              if (t.children?.some(c => c.id === droppedId)) return { ...t, children: t.children.map(c => c.id === droppedId ? clearToQueue(c) : c) };
              return t;
            });
            handleTasksChange(newTasks);
          };
          if (queued.length === 0) return (
            <div
              className="border border-dashed border-slate-200 rounded-lg p-1.5 bg-slate-50/20 transition-colors"
              onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; e.currentTarget.style.borderColor = '#f59e0b'; e.currentTarget.style.background = '#fffbeb'; }}
              onDragLeave={e => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.background = ''; }}
              onDrop={handleQueueDrop}
            >
              <div className="text-[9px] text-slate-400 italic text-center py-0.5">대기함 — 타임테이블에서 여기로 드래그하여 해제</div>
            </div>
          );
          return (
            <div
              className="border border-dashed border-amber-300 rounded-lg p-2 bg-amber-50/30 transition-colors"
              onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; e.currentTarget.style.borderColor = '#f59e0b'; e.currentTarget.style.background = '#fffbeb'; }}
              onDragLeave={e => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.background = ''; }}
              onDrop={handleQueueDrop}
            >
              <div className="text-[10px] font-bold text-amber-700 mb-1">대기함 ({queued.length}개) — 드래그하여 타임테이블 슬롯에 배정</div>
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
        <div className="flex gap-1 items-start">
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
                // 시간 겹침 기반으로 모든 뷰에서 동일하게 태스크 매칭 (서브태스크 + 다중 range 포함)
                const allTasksFlat = tasks.flatMap(t => [t, ...(t.children || [])]);
                const slotTasksWithRange: Array<{ task: Task; rangeIdx: number }> = [];
                for (const t of allTasksFlat) {
                  const ranges = taskSlots(t);
                  ranges.forEach((r, idx) => {
                    if (r.timeSlotId === slot.id || (slotStart >= r.startTime && slotStart < r.endTime)) {
                      slotTasksWithRange.push({ task: t, rangeIdx: idx });
                    }
                  });
                }
                const seenRK = new Set<string>();
                const tasksWithRange_ = slotTasksWithRange.filter(({ task, rangeIdx }) => {
                  const k = `${task.id}:${rangeIdx}`;
                  if (seenRK.has(k)) return false;
                  seenRK.add(k);
                  return true;
                });
                const tasks_ = tasksWithRange_.map(x => x.task);
                const hasFill = tasks_.length > 0 || slot.title;

                const inDragRange = dragRangeHint && index >= dragRangeHint.lo && index <= dragRangeHint.hi;
                // 공통 드롭 핸들러 — 다중 range 지원 (타임테이블 내부 chip = MOVE, 외부 = ADD)
                const handleSlotDrop = (e: React.DragEvent<HTMLDivElement>) => {
                  e.preventDefault();
                  e.currentTarget.style.background = '';
                  const droppedText = e.dataTransfer.getData('text/plain');
                  const srcRangeIdxRaw = e.dataTransfer.getData('application/x-worklog-range-idx');
                  if (!droppedText) { setDragRangeHint(null); return; }
                  const allFlat = tasks.flatMap(t => [t, ...(t.children || [])]);
                  let task = allFlat.find(t => t.id === droppedText);
                  if (!task) task = allFlat.find(t => t.task === droppedText);
                  const isFromTimetable = srcRangeIdxRaw !== '';
                  const srcRangeIdx = isFromTimetable ? parseInt(srcRangeIdxRaw, 10) : -1;
                  if (task) {
                    const curRanges = taskSlots(task);
                    // 타임테이블 내부 MOVE는 단일 슬롯 이동 (range drag 무시)
                    // 외부 드롭은 범위 드래그 honor → N개 개별 range 생성
                    let newRanges: TaskSlot[];
                    if (isFromTimetable && srcRangeIdx >= 0) {
                      newRanges = slotIdxsToRanges([index]);
                    } else {
                      const dropIdxs = computeDropSlotIdxs(index);
                      newRanges = slotIdxsToRanges(dropIdxs);
                    }
                    let nextRanges: TaskSlot[];
                    if (isFromTimetable && srcRangeIdx >= 0) {
                      // MOVE: 원본 range 제거 + 새 range 1개 추가
                      nextRanges = [...curRanges.filter((_, i) => i !== srcRangeIdx), ...newRanges];
                    } else {
                      // ADD: 기존 + 새 N개
                      nextRanges = [...curRanges, ...newRanges];
                    }
                    nextRanges = dedupeRanges(nextRanges);
                    applyTaskRanges(task.id, nextRanges, { queued: undefined });
                  } else {
                    const cleaned = droppedText.trim();
                    if (!cleaned || /^(ft-|mc-)/.test(cleaned)) { setDragRangeHint(null); return; }
                    const dropIdxs = computeDropSlotIdxs(index);
                    const newRanges = slotIdxsToRanges(dropIdxs);
                    if (newRanges.length === 0) { setDragRangeHint(null); return; }
                    const first = newRanges[0];
                    const newTask: Task = {
                      id: `ft-d-${Date.now()}-${Math.random().toString(36).slice(2,6)}`,
                      priority: 'B',
                      number: getNextNumber(tasks, 'B'),
                      task: cleaned, status: 'pending',
                      important: true, urgent: false, period,
                      slots: newRanges,
                      startTime: first.startTime, endTime: first.endTime, timeSlotId: first.timeSlotId,
                    };
                    handleTasksChange([...tasks, newTask]);
                  }
                  dragSlotRangeRef.current = { firstIdx: null, lastIdx: null };
                  setDragRangeHint(null);
                };

                return viewMode === 'classic' ? (
                  /* Classic: 확장 — 시간 + 제목 + 내용 + AI + 예정 인라인 편집 */
                  <div key={slot.id} className={`border-b border-border/50 last:border-b-0 ${inDragRange ? 'bg-amber-50/60' : ''}`}
                    onDragEnter={() => trackDragEnter(index)}
                    onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; e.currentTarget.style.background = '#dbeafe'; }}
                    onDragLeave={e => { e.currentTarget.style.background = ''; }}
                    onDrop={handleSlotDrop}>
                    <div className="md:grid md:grid-cols-[80px_1fr_1fr_80px_1fr] flex flex-col">
                      <div className="px-2 py-1.5 md:border-r border-border bg-accent/10 flex items-center gap-1 flex-wrap">
                        <span className="text-[10px] font-mono text-muted-foreground shrink-0">{slot.timeSlot}</span>
                        {tasksWithRange_.map(({ task: t, rangeIdx }) => (
                          <span key={`${t.id}-${rangeIdx}`} draggable
                            onDragStart={e => {
                              e.stopPropagation();
                              e.dataTransfer.effectAllowed = 'move';
                              e.dataTransfer.setData('text/plain', t.id);
                              e.dataTransfer.setData('application/x-worklog-range-idx', String(rangeIdx));
                            }}
                            className="text-[8px] font-bold px-1 rounded cursor-grab active:cursor-grabbing inline-flex items-center gap-0.5" style={{ background: FRANKLIN_PRIORITY_CONFIG[t.priority].bg, color: FRANKLIN_PRIORITY_CONFIG[t.priority].color }}>
                            {t.priority}{t.number}{FRANKLIN_STATUS_CONFIG[t.status].icon}
                            <button onClick={ev => { ev.stopPropagation(); removeTaskRange(t.id, rangeIdx); }}
                              title="이 시간대 배정 제거"
                              className="ml-0.5 w-2.5 h-2.5 rounded-full bg-white/70 hover:bg-red-500 hover:text-white text-[7px] leading-none flex items-center justify-center">×</button>
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
                    onDrop={handleSlotDrop}>
                    <div className="flex items-center gap-1 px-1.5 py-1">
                      <span className={`text-[10px] font-mono w-12 shrink-0 ${hasFill ? 'text-foreground font-semibold' : 'text-muted-foreground/60'}`}>
                        {slotStart}
                      </span>
                      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                        {tasksWithRange_.length > 0 ? tasksWithRange_.map(({ task: t, rangeIdx }) => {
                          const pCfg = FRANKLIN_PRIORITY_CONFIG[t.priority];
                          const stCfg = FRANKLIN_STATUS_CONFIG[t.status];
                          return (
                            <div key={`${t.id}-${rangeIdx}`} draggable
                              onDragStart={e => {
                                e.stopPropagation();
                                e.dataTransfer.effectAllowed = 'move';
                                e.dataTransfer.setData('text/plain', t.id);
                                e.dataTransfer.setData('application/x-worklog-range-idx', String(rangeIdx));
                              }}
                              className="flex items-center gap-1 rounded px-1 py-0.5 cursor-grab active:cursor-grabbing" style={{ background: pCfg.color + '15', borderLeft: `2px solid ${pCfg.color}` }}>
                              <span className="text-[9px] font-bold" style={{ color: pCfg.color }}>{t.priority}{t.number}</span>
                              <span className="text-[9px]" style={{ color: stCfg.color }}>{stCfg.icon}</span>
                              <span className="text-[10px] truncate flex-1">{t.task}</span>
                              <button onClick={ev => { ev.stopPropagation(); removeTaskRange(t.id, rangeIdx); }}
                                title="이 시간대 배정 제거"
                                className="w-3 h-3 rounded-full bg-white/70 hover:bg-red-500 hover:text-white text-[8px] leading-none flex items-center justify-center shrink-0">×</button>
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
                  onTypesChange={setMandalartTypes}
                  onSizeChange={handleMandalartSizeChange}
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