import { useState } from 'react';
import { Plus, ChevronDown, ChevronRight, AlertTriangle, Paperclip } from 'lucide-react';
import type { FranklinTask, FranklinPriority, TimeSlotEntry } from './data';
import {
  FRANKLIN_STATUS_CONFIG, FRANKLIN_PRIORITY_CONFIG,
  getNextNumber, cycleStatus, syncPriorityToEisenhower,
  getTimelinePosition,
} from './data';

interface FranklinViewProps {
  tasks: FranklinTask[];
  timeSlots: TimeSlotEntry[];
  timeInterval: '30min' | '1hour' | 'half-day';
  onTasksChange: (tasks: FranklinTask[]) => void;
  onSlotTitleChange: (index: number, title: string) => void;
}

const HOURS = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18];

export function FranklinView({ tasks, timeSlots, timeInterval, onTasksChange }: FranklinViewProps) {
  const [newText, setNewText] = useState('');
  const [newPriority, setNewPriority] = useState<FranklinPriority>('A');
  const [newStart, setNewStart] = useState('');
  const [newEnd, setNewEnd] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const priorities: FranklinPriority[] = ['A', 'B', 'C', 'D'];

  const addTask = () => {
    if (!newText.trim()) return;
    const eisFlags = syncPriorityToEisenhower(newPriority);
    const task: FranklinTask = {
      id: `ft-${Date.now()}`,
      priority: newPriority,
      number: getNextNumber(tasks, newPriority),
      task: newText.trim(),
      status: 'pending',
      startTime: newStart || undefined,
      endTime: newEnd || undefined,
      ...eisFlags,
    };
    onTasksChange([...tasks, task]);
    setNewText('');
    setNewStart('');
    setNewEnd('');
  };

  const updateTask = (id: string, updates: Partial<FranklinTask>) => {
    onTasksChange(tasks.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const removeTask = (id: string) => {
    onTasksChange(tasks.filter(t => t.id !== id));
  };

  // Sort: priority → number
  const sorted = [...tasks].sort((a, b) => {
    const po = { A: 0, B: 1, C: 2, D: 3 };
    if (po[a.priority] !== po[b.priority]) return po[a.priority] - po[b.priority];
    return a.number - b.number;
  });

  // Tasks with time ranges for timeline
  const timedTasks = tasks.filter(t => t.startTime);

  // Ruler ticks
  const ticks = timeInterval === 'half-day'
    ? [{ label: '오전', pos: 0 }, { label: '오후', pos: 50 }]
    : HOURS.map(h => ({ label: `${h}`, pos: getTimelinePosition(`${h}:00`) }));

  return (
    <div className="space-y-3">
      {/* Add bar */}
      <div className="flex items-center gap-1 p-2 border border-border rounded-lg bg-muted/20 flex-wrap">
        <div className="flex gap-0.5">
          {priorities.map(p => (
            <button key={p} onClick={() => setNewPriority(p)}
              className="w-6 h-6 rounded text-[10px] font-bold"
              style={{ background: newPriority === p ? FRANKLIN_PRIORITY_CONFIG[p].color : FRANKLIN_PRIORITY_CONFIG[p].bg, color: newPriority === p ? '#fff' : FRANKLIN_PRIORITY_CONFIG[p].color }}
            >{p}</button>
          ))}
        </div>
        <input value={newText} onChange={e => setNewText(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTask()}
          placeholder="업무명" className="flex-1 min-w-[120px] px-2 py-1 text-sm border border-border rounded bg-background outline-none focus:border-primary" />
        <input type="time" value={newStart} onChange={e => setNewStart(e.target.value)}
          className="w-[90px] px-1 py-1 text-[11px] border border-border rounded bg-background outline-none" />
        <span className="text-muted-foreground text-[10px]">~</span>
        <input type="time" value={newEnd} onChange={e => setNewEnd(e.target.value)}
          className="w-[90px] px-1 py-1 text-[11px] border border-border rounded bg-background outline-none" />
        <button onClick={addTask} className="p-1 rounded bg-primary text-primary-foreground hover:opacity-90">
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Timeline gantt */}
      {timedTasks.length > 0 && (
        <div className="border border-border rounded-lg overflow-hidden">
          <div className="bg-accent/40 px-3 py-1 border-b border-border text-[11px] font-semibold">타임라인</div>
          <div className="relative px-3 py-2" style={{ minHeight: timedTasks.length * 24 + 30 }}>
            {/* Ruler */}
            <div className="flex items-end h-5 border-b border-border/50 mb-1 relative">
              {ticks.map((tick, i) => (
                <div key={i} className="absolute text-[9px] text-muted-foreground font-mono" style={{ left: `${tick.pos}%`, transform: 'translateX(-50%)' }}>
                  {tick.label}
                </div>
              ))}
            </div>
            {/* Grid lines */}
            <div className="absolute inset-0 top-[28px] px-3">
              {ticks.map((tick, i) => (
                <div key={i} className="absolute top-0 bottom-0 border-l border-border/20" style={{ left: `${tick.pos}%` }} />
              ))}
            </div>
            {/* Bars */}
            {timedTasks.map((task, i) => {
              const pCfg = FRANKLIN_PRIORITY_CONFIG[task.priority];
              const stCfg = FRANKLIN_STATUS_CONFIG[task.status];
              const left = getTimelinePosition(task.startTime!);
              const right = task.endTime ? getTimelinePosition(task.endTime) : left + 5;
              const width = Math.max(3, right - left);
              return (
                <div key={task.id} className="relative h-5 mb-0.5" style={{ marginTop: i === 0 ? 2 : 0 }}>
                  <div
                    className="absolute h-4 rounded-sm flex items-center gap-1 px-1 cursor-pointer hover:opacity-90 transition-opacity overflow-hidden"
                    style={{ left: `${left}%`, width: `${width}%`, background: pCfg.color + '20', borderLeft: `3px solid ${pCfg.color}` }}
                    onClick={() => setExpandedId(expandedId === task.id ? null : task.id)}
                    title={`${task.priority}${task.number} ${task.task} (${task.startTime}~${task.endTime || ''})`}
                  >
                    <span className="text-[8px] font-bold shrink-0" style={{ color: pCfg.color }}>{task.priority}{task.number}</span>
                    <span className="text-[9px] truncate" style={{ color: stCfg.color }}>{stCfg.icon}</span>
                    <span className="text-[9px] truncate">{task.task}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Task list */}
      <div className="border border-border rounded-lg overflow-hidden">
        <div className="bg-accent/40 px-3 py-1 border-b border-border flex items-center justify-between">
          <span className="text-[11px] font-semibold">업무 목록</span>
          <div className="flex gap-2 text-[10px]">
            {priorities.map(p => {
              const cnt = tasks.filter(t => t.priority === p).length;
              return cnt > 0 ? (
                <span key={p} style={{ color: FRANKLIN_PRIORITY_CONFIG[p].color }} className="font-bold">{p}:{cnt}</span>
              ) : null;
            })}
            <span className="text-muted-foreground">
              ●{tasks.filter(t => t.status === 'done').length} ◐{tasks.filter(t => t.status === 'progress').length} ○{tasks.filter(t => t.status === 'pending').length}
            </span>
          </div>
        </div>

        <div className="overflow-y-auto" style={{ scrollbarWidth: 'none', maxHeight: 'calc(100vh - 450px)' }}>
          {sorted.length === 0 ? (
            <div className="p-6 text-center text-[11px] text-muted-foreground">업무를 추가하세요</div>
          ) : sorted.map(task => {
            const pCfg = FRANKLIN_PRIORITY_CONFIG[task.priority];
            const stCfg = FRANKLIN_STATUS_CONFIG[task.status];
            const isExpanded = expandedId === task.id;
            const timeLabel = task.startTime
              ? `${task.startTime}${task.endTime ? '~' + task.endTime : '~'}`
              : '미배정';

            return (
              <div key={task.id} className="border-b border-border/50">
                {/* Task row */}
                <div className="flex items-center gap-1.5 px-2 py-1.5 hover:bg-accent/10 group">
                  {/* Expand */}
                  <button onClick={() => setExpandedId(isExpanded ? null : task.id)} className="w-4 h-4 shrink-0 text-muted-foreground">
                    {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  </button>
                  {/* Status */}
                  <button onClick={() => updateTask(task.id, { status: cycleStatus(task.status) })}
                    className="w-5 h-5 rounded flex items-center justify-center text-[11px] font-bold shrink-0 hover:scale-110"
                    style={{ background: stCfg.bg, color: stCfg.color }}>{stCfg.icon}</button>
                  {/* Priority */}
                  <span className="text-[10px] font-bold w-5 shrink-0" style={{ color: pCfg.color }}>{task.priority}{task.number}</span>
                  {/* Issue badge */}
                  {task.isIssue && <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                  {/* Title */}
                  {editingId === task.id ? (
                    <input value={task.task} onChange={e => updateTask(task.id, { task: e.target.value })}
                      onBlur={() => setEditingId(null)} onKeyDown={e => e.key === 'Enter' && setEditingId(null)}
                      autoFocus className="flex-1 text-[12px] px-1 py-0.5 border border-primary rounded outline-none" />
                  ) : (
                    <span onClick={() => setEditingId(task.id)}
                      className={`flex-1 text-[12px] cursor-pointer truncate ${task.status === 'done' ? 'line-through text-muted-foreground' : task.status === 'cancelled' ? 'line-through text-muted-foreground/50' : ''}`}>
                      {task.task}
                    </span>
                  )}
                  {/* Time */}
                  <span className={`text-[10px] font-mono shrink-0 ${task.startTime ? 'text-blue-600' : 'text-muted-foreground/40'}`}>
                    {timeLabel}
                  </span>
                  {/* Files indicator */}
                  {task.files && task.files.length > 0 && <Paperclip className="w-3 h-3 text-muted-foreground shrink-0" />}
                  {/* Delete */}
                  <button onClick={() => removeTask(task.id)}
                    className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 text-[10px] shrink-0">✕</button>
                </div>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="px-8 py-2 bg-accent/5 border-t border-border/30 space-y-2 animate-in fade-in slide-in-from-top-1 duration-150">
                    {/* Time range edit */}
                    <div className="flex items-center gap-2 text-[11px]">
                      <span className="text-muted-foreground w-12">시간</span>
                      <input type="time" value={task.startTime || ''} onChange={e => updateTask(task.id, { startTime: e.target.value })}
                        className="px-1 py-0.5 border border-border rounded text-[11px] bg-background w-[90px]" />
                      <span>~</span>
                      <input type="time" value={task.endTime || ''} onChange={e => updateTask(task.id, { endTime: e.target.value })}
                        className="px-1 py-0.5 border border-border rounded text-[11px] bg-background w-[90px]" />
                      <label className="flex items-center gap-1 ml-4 cursor-pointer">
                        <input type="checkbox" checked={task.isIssue || false} onChange={e => updateTask(task.id, { isIssue: e.target.checked })}
                          className="w-3 h-3 accent-amber-500" />
                        <span className="text-amber-600 text-[10px] font-bold">⚠ 이슈</span>
                      </label>
                    </div>
                    {/* Priority change */}
                    <div className="flex items-center gap-2 text-[11px]">
                      <span className="text-muted-foreground w-12">우선순위</span>
                      {priorities.map(p => (
                        <button key={p} onClick={() => {
                          const eis = syncPriorityToEisenhower(p);
                          updateTask(task.id, { priority: p, number: getNextNumber(tasks, p), ...eis });
                        }}
                          className="w-6 h-6 rounded text-[10px] font-bold"
                          style={{ background: task.priority === p ? FRANKLIN_PRIORITY_CONFIG[p].color : FRANKLIN_PRIORITY_CONFIG[p].bg, color: task.priority === p ? '#fff' : FRANKLIN_PRIORITY_CONFIG[p].color }}
                        >{p}</button>
                      ))}
                    </div>
                    {/* Notes */}
                    <div className="flex gap-2 text-[11px]">
                      <span className="text-muted-foreground w-12 pt-1">메모</span>
                      <textarea value={task.note || ''} onChange={e => updateTask(task.id, { note: e.target.value })}
                        placeholder="상세 내용, 피드백, 결과..."
                        className="flex-1 px-2 py-1 border border-border rounded text-[11px] bg-background outline-none resize-none min-h-[50px]"
                        style={{ scrollbarWidth: 'none' }} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Forwarded */}
        {tasks.some(t => t.status === 'forwarded') && (
          <div className="px-3 py-1.5 bg-amber-50 border-t border-amber-200 text-[10px] text-amber-700">
            <strong>이월:</strong> {tasks.filter(t => t.status === 'forwarded').map(t => `${t.priority}${t.number} ${t.task}`).join(', ')}
          </div>
        )}
      </div>
    </div>
  );
}
