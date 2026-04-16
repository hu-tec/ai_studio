import { useState } from 'react';
import { format, startOfWeek, addDays } from 'date-fns';
import { ko } from 'date-fns/locale';
import type { DailyLog, Task } from './data';
import { taskSlots, FRANKLIN_PRIORITY_CONFIG, FRANKLIN_STATUS_CONFIG } from './data';

interface WeeklyViewProps {
  date: Date;
  logs: DailyLog[];
  onSelectDate: (d: Date) => void;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onDeleteTask: (taskId: string) => void;
  onMoveTaskToDate: (taskId: string, destDate: string) => void;
}

// task + label (A1 또는 A1-1) 형태로 flatten
function flatTasksWithLabel(log: DailyLog | undefined): Array<{ task: Task; label: string }> {
  if (!log) return [];
  const out: Array<{ task: Task; label: string }> = [];
  for (const t of (log.tasks || [])) {
    if (t.task?.trim()) out.push({ task: t, label: `${t.priority}${t.number}` });
    for (const c of (t.children || [])) {
      if (c.task?.trim()) out.push({ task: c, label: `${t.priority}${t.number}-${c.number}` });
    }
  }
  return out;
}

// startTime 기준 정렬
function sortByStart(a: { task: Task }, b: { task: Task }): number {
  const ra = taskSlots(a.task)[0]?.startTime || '';
  const rb = taskSlots(b.task)[0]?.startTime || '';
  if (!ra && !rb) return 0;
  if (!ra) return 1;
  if (!rb) return -1;
  return ra.localeCompare(rb);
}

export function WeeklyView({ date, logs, onSelectDate, onUpdateTask, onDeleteTask, onMoveTaskToDate }: WeeklyViewProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [dropTargetDate, setDropTargetDate] = useState<string | null>(null);

  const weekStart = startOfWeek(date, { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const today = format(new Date(), 'yyyy-MM-dd');

  // 일자별 데이터 — 시간순 정렬
  const dailyData = days.map(d => {
    const dateStr = format(d, 'yyyy-MM-dd');
    const log = logs.find(l => l.date === dateStr);
    const items = flatTasksWithLabel(log).sort(sortByStart);
    const ranges = items.flatMap(x => taskSlots(x.task));
    const start = ranges.length > 0 ? ranges.map(r => r.startTime).sort()[0] : '';
    const end = ranges.length > 0 ? ranges.map(r => r.endTime).sort().reverse()[0] : '';
    return { date: d, dateStr, items, start, end };
  });

  // 이월 업무 — 전체 스캔
  const carryMap = new Map<string, { task: Task; label: string; fromDate: string }>();
  for (const l of logs) {
    const items = flatTasksWithLabel(l);
    for (const { task: t, label } of items) {
      if (t.status === 'done' || t.status === 'cancelled') continue;
      const isUnassigned = taskSlots(t).length === 0;
      const isForwarded = t.status === 'forwarded';
      const isQueued = !!t.queued;
      if (!isUnassigned && !isForwarded && !isQueued) continue;
      const key = t.rolledFromId || `${t.task.trim()}|${t.priority}|${label}`;
      const existing = carryMap.get(key);
      if (!existing || l.date > existing.fromDate) {
        carryMap.set(key, { task: t, label, fromDate: l.date });
      }
    }
  }
  const carryover = Array.from(carryMap.values()).sort((a, b) => a.fromDate.localeCompare(b.fromDate));

  // 편집/삭제 헬퍼
  const startEdit = (t: Task) => { setEditingId(t.id); setEditText(t.task); };
  const commitEdit = () => {
    if (editingId) onUpdateTask(editingId, { task: editText.trim() });
    setEditingId(null);
  };

  // 한 task 렌더링
  const renderRow = (item: { task: Task; label: string }, keyPrefix: string, fromDate?: string, isCarry = false) => {
    const { task: t, label } = item;
    const pCfg = FRANKLIN_PRIORITY_CONFIG[t.priority];
    const stCfg = FRANKLIN_STATUS_CONFIG[t.status];
    const r = taskSlots(t)[0];
    const isEditing = editingId === t.id;
    return (
      <div key={`${keyPrefix}-${t.id}`}
        draggable={isCarry && !isEditing}
        onDragStart={isCarry ? e => { e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', t.id); } : undefined}
        className={`flex items-start gap-1 px-1.5 py-1 text-[10px] hover:bg-accent/20 group/row ${isCarry && !isEditing ? 'cursor-grab active:cursor-grabbing' : ''}`}>
        {r?.startTime && <span className="font-mono text-[9px] text-blue-500 shrink-0 mt-[1px]">{r.startTime}</span>}
        <span className="font-bold shrink-0 mt-[1px]" style={{ color: pCfg.color }}>{label}</span>
        <span className="shrink-0 mt-[1px]" style={{ color: stCfg.color }}>{stCfg.icon}</span>
        {isEditing ? (
          <input autoFocus value={editText}
            onChange={e => setEditText(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={e => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') setEditingId(null); }}
            className="flex-1 px-1 py-0 border border-primary rounded text-[10px] outline-none min-w-0" />
        ) : (
          <span
            onDoubleClick={() => startEdit(t)}
            title="더블클릭→편집"
            className={`flex-1 break-words cursor-text ${t.status === 'cancelled' ? 'line-through text-muted-foreground/50' : ''}`}>
            {t.task}
            {fromDate && <span className="ml-1 text-[8px] font-mono bg-gray-100 text-gray-600 px-0.5 rounded">{fromDate.slice(5)}</span>}
          </span>
        )}
        {!isEditing && (
          <button onClick={() => { if (confirm(`'${t.task}' 삭제하시겠습니까?`)) onDeleteTask(t.id); }}
            title="삭제"
            className="opacity-0 group-hover/row:opacity-100 text-rose-500 hover:bg-rose-50 rounded w-3 h-3 flex items-center justify-center shrink-0 text-[10px] leading-none">×</button>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="border border-border rounded overflow-hidden">
        {/* 날짜 헤더 (7일 + 이월) */}
        <div className="grid grid-cols-8 bg-accent/40 border-b-2 border-border text-[11px] font-bold">
          {dailyData.map(d => {
            const dow = d.date.getDay();
            const isWeekend = dow === 0 || dow === 6;
            return (
              <button key={d.dateStr} onClick={() => onSelectDate(d.date)}
                title="클릭 → 해당 일자 상세 이동"
                className={`px-2 py-1.5 border-r border-border text-center hover:bg-accent/70
                  ${d.dateStr === today ? 'bg-yellow-100' : ''}
                  ${isWeekend && d.dateStr !== today ? 'text-rose-600' : ''}`}>
                {format(d.date, 'M월 d일(E)', { locale: ko })}
              </button>
            );
          })}
          <div className="px-2 py-1.5 text-center text-rose-700 bg-rose-100/60">
            이월 업무
          </div>
        </div>

        {/* 시간 범위 */}
        <div className="grid grid-cols-8 bg-yellow-50/70 border-b border-border text-[10px]">
          {dailyData.map(d => (
            <div key={d.dateStr} className="px-2 py-1 border-r border-border flex items-center justify-center gap-1">
              {d.start && d.end ? (
                <span className="font-mono text-muted-foreground">{d.start}~{d.end}</span>
              ) : (
                <span className="text-muted-foreground/40">-</span>
              )}
            </div>
          ))}
          <div className="px-2 py-1 text-center bg-rose-50/50 text-rose-700">
            {carryover.length}건
          </div>
        </div>

        {/* 본문 */}
        <div className="grid grid-cols-8 min-h-[300px]">
          {dailyData.map(d => (
            <div key={d.dateStr}
              onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setDropTargetDate(d.dateStr); }}
              onDragLeave={() => setDropTargetDate(p => p === d.dateStr ? null : p)}
              onDrop={e => {
                e.preventDefault();
                setDropTargetDate(null);
                const taskId = e.dataTransfer.getData('text/plain');
                if (taskId) onMoveTaskToDate(taskId, d.dateStr);
              }}
              className={`border-r border-border divide-y divide-border/30 transition-colors ${dropTargetDate === d.dateStr ? 'bg-blue-100/60 ring-2 ring-inset ring-blue-400' : ''}`}>
              {d.items.length === 0 ? (
                <div className="text-[9px] text-muted-foreground/40 italic text-center py-3">없음</div>
              ) : (
                d.items.map(x => renderRow(x, `d-${d.dateStr}`))
              )}
            </div>
          ))}
          <div className="bg-rose-50/20 divide-y divide-rose-100">
            {carryover.length === 0 ? (
              <div className="text-[9px] text-rose-300 italic text-center py-3">없음 ✓</div>
            ) : (
              carryover.map(x => renderRow(x, 'c', x.fromDate, true))
            )}
          </div>
        </div>

        {/* 건수 합계 */}
        <div className="grid grid-cols-8 bg-accent/50 border-t-2 border-border text-[11px] font-bold">
          {dailyData.map(d => (
            <div key={d.dateStr} className="px-2 py-1.5 border-r border-border text-center">
              {d.items.length}건
            </div>
          ))}
          <div className="px-2 py-1.5 text-center bg-rose-100/50 text-rose-700">
            {carryover.length}건
          </div>
        </div>
      </div>
    </div>
  );
}
