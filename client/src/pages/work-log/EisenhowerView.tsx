import { useState, DragEvent } from 'react';
import { Plus } from 'lucide-react';
import type { FranklinTask, FranklinPriority, EisenhowerQuadrant, TimeSlotEntry } from './data';
import {
  EISENHOWER_CONFIG, FRANKLIN_STATUS_CONFIG, FRANKLIN_PRIORITY_CONFIG,
  getQuadrant, setQuadrant, getNextNumber, cycleStatus,
} from './data';

interface EisenhowerViewProps {
  tasks: FranklinTask[];
  timeSlots: TimeSlotEntry[];
  onTasksChange: (tasks: FranklinTask[]) => void;
  onSlotTitleChange: (index: number, title: string) => void;
}

export function EisenhowerView({ tasks, timeSlots, onTasksChange, onSlotTitleChange }: EisenhowerViewProps) {
  const [dragId, setDragId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<EisenhowerQuadrant | 'slot' | null>(null);
  const [newText, setNewText] = useState('');
  const [newQuad, setNewQuad] = useState<EisenhowerQuadrant>('q1');

  // Group tasks by quadrant
  const grouped: Record<EisenhowerQuadrant, FranklinTask[]> = { q1: [], q2: [], q3: [], q4: [] };
  tasks.forEach(t => grouped[getQuadrant(t)].push(t));

  // Add task
  const addTask = () => {
    if (!newText.trim()) return;
    const flags = setQuadrant({} as FranklinTask, newQuad);
    const priorityMap: Record<EisenhowerQuadrant, FranklinPriority> = { q1: 'A', q2: 'B', q3: 'C', q4: 'D' };
    const priority = priorityMap[newQuad];
    const task: FranklinTask = {
      id: `ft-${Date.now()}`,
      priority,
      number: getNextNumber(tasks, priority),
      task: newText.trim(),
      status: 'pending',
      ...flags,
    };
    onTasksChange([...tasks, task]);
    setNewText('');
  };

  // Update task
  const updateTask = (id: string, updates: Partial<FranklinTask>) => {
    onTasksChange(tasks.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const removeTask = (id: string) => {
    onTasksChange(tasks.filter(t => t.id !== id));
  };

  // Drag handlers
  const onDragStart = (e: DragEvent, id: string) => {
    setDragId(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
  };

  const onDragOver = (e: DragEvent, target: EisenhowerQuadrant | 'slot') => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDropTarget(target);
  };

  const onDragLeave = () => setDropTarget(null);

  const onDropQuadrant = (e: DragEvent, q: EisenhowerQuadrant) => {
    e.preventDefault();
    setDropTarget(null);
    if (!dragId) return;
    const flags = setQuadrant({} as FranklinTask, q);
    updateTask(dragId, { ...flags, number: getNextNumber(tasks, flags.priority!) });
    setDragId(null);
  };

  const onDropSlot = (e: DragEvent, slotIdx: number) => {
    e.preventDefault();
    setDropTarget(null);
    if (!dragId) return;
    const task = tasks.find(t => t.id === dragId);
    if (!task) return;
    const slot = timeSlots[slotIdx];
    updateTask(dragId, { timeSlotId: slot.id });
    onSlotTitleChange(slotIdx, task.task);
    setDragId(null);
  };

  // Map slot IDs to linked tasks
  const slotTaskMap = new Map<string, FranklinTask>();
  tasks.forEach(t => { if (t.timeSlotId) slotTaskMap.set(t.timeSlotId, t); });

  return (
    <div className="space-y-3">
      {/* Add bar */}
      <div className="flex items-center gap-1 p-2 border border-border rounded-lg bg-muted/20">
        <div className="flex gap-0.5">
          {(['q1', 'q2', 'q3', 'q4'] as EisenhowerQuadrant[]).map(q => {
            const cfg = EISENHOWER_CONFIG[q];
            return (
              <button
                key={q}
                onClick={() => setNewQuad(q)}
                className="px-2 py-1 rounded text-[10px] font-bold transition-all"
                style={{
                  background: newQuad === q ? cfg.color : cfg.bg,
                  color: newQuad === q ? '#fff' : cfg.color,
                  border: `1px solid ${cfg.border}`,
                }}
              >
                {cfg.label}
              </button>
            );
          })}
        </div>
        <input
          type="text"
          value={newText}
          onChange={e => setNewText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addTask()}
          placeholder="새 과업 입력 후 Enter (드래그로 사분면 이동)"
          className="flex-1 px-2 py-1.5 text-sm border border-border rounded bg-background outline-none focus:border-primary"
        />
        <button onClick={addTask} className="p-1.5 rounded bg-primary text-primary-foreground hover:opacity-90">
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* 2x2 Matrix */}
      <div className="grid grid-cols-2 gap-2">
        {(['q1', 'q2', 'q3', 'q4'] as EisenhowerQuadrant[]).map(q => {
          const cfg = EISENHOWER_CONFIG[q];
          const items = grouped[q];
          const isDrop = dropTarget === q;
          return (
            <div
              key={q}
              className="border rounded-lg overflow-hidden flex flex-col transition-all"
              style={{
                borderColor: isDrop ? cfg.color : cfg.border,
                boxShadow: isDrop ? `0 0 0 2px ${cfg.color}30` : 'none',
                minHeight: 140,
                maxHeight: 'calc(40vh - 40px)',
              }}
              onDragOver={e => onDragOver(e, q)}
              onDragLeave={onDragLeave}
              onDrop={e => onDropQuadrant(e, q)}
            >
              {/* Header */}
              <div
                className="px-2.5 py-1.5 flex items-center justify-between shrink-0"
                style={{ background: cfg.bg }}
              >
                <div className="flex items-center gap-1.5">
                  <span
                    className="text-[10px] font-black px-1.5 py-0.5 rounded text-white"
                    style={{ background: cfg.color }}
                  >
                    {cfg.label}
                  </span>
                  <span className="text-[11px] font-bold" style={{ color: cfg.color }}>{cfg.desc}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold" style={{ color: cfg.color }}>{cfg.action}</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: cfg.border }}>
                    {items.length}
                  </span>
                </div>
              </div>

              {/* Tasks */}
              <div className="flex-1 overflow-y-auto">
                {items.length === 0 ? (
                  <div className="p-4 text-center text-[11px] text-muted-foreground">
                    과업을 여기로 드래그하세요
                  </div>
                ) : (
                  items.map(task => {
                    const stCfg = FRANKLIN_STATUS_CONFIG[task.status];
                    const pCfg = FRANKLIN_PRIORITY_CONFIG[task.priority];
                    return (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={e => onDragStart(e, task.id)}
                        className="flex items-center gap-1.5 px-2 py-1.5 border-b border-border/50 hover:bg-accent/20 cursor-grab active:cursor-grabbing group"
                      >
                        <button
                          onClick={() => updateTask(task.id, { status: cycleStatus(task.status) })}
                          className="w-5 h-5 rounded flex items-center justify-center text-[11px] font-bold shrink-0 transition-all hover:scale-110"
                          style={{ background: stCfg.bg, color: stCfg.color }}
                        >
                          {stCfg.icon}
                        </button>
                        <span className="text-[10px] font-bold shrink-0" style={{ color: pCfg.color }}>
                          {task.priority}{task.number}
                        </span>
                        <span className={`flex-1 text-[12px] truncate ${
                          task.status === 'done' ? 'line-through text-muted-foreground' :
                          task.status === 'cancelled' ? 'line-through text-muted-foreground/50' : ''
                        }`}>
                          {task.task}
                        </span>
                        {task.timeSlotId && (
                          <span className="text-[8px] px-1 py-0.5 rounded bg-blue-100 text-blue-600 font-mono shrink-0">
                            {timeSlots.find(s => s.id === task.timeSlotId)?.timeSlot.split('~')[0]?.trim() || ''}
                          </span>
                        )}
                        <button
                          onClick={() => removeTask(task.id)}
                          className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 text-[10px] shrink-0"
                        >
                          ✕
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Time slots — drop zone */}
      <div className="border border-border rounded-lg overflow-hidden">
        <div className="bg-accent/40 px-3 py-1.5 border-b border-border text-sm font-semibold flex items-center gap-2">
          일정 <span className="text-[10px] text-muted-foreground font-normal">과업을 시간대에 드래그하여 배정</span>
        </div>
        <div className="overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
          {timeSlots.map((slot, idx) => {
            const linked = slotTaskMap.get(slot.id);
            const qCfg = linked ? EISENHOWER_CONFIG[getQuadrant(linked)] : null;
            const stCfg = linked ? FRANKLIN_STATUS_CONFIG[linked.status] : null;
            const hasFill = linked || slot.title;
            return (
              <div
                key={slot.id}
                className={`flex items-center gap-2 px-2 py-1.5 border-b border-border/50 transition-colors ${hasFill ? 'bg-accent/5' : 'hover:bg-accent/10'}`}
                onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setDropTarget('slot'); }}
                onDragLeave={onDragLeave}
                onDrop={e => onDropSlot(e, idx)}
              >
                <span className={`text-[10px] w-28 shrink-0 font-mono ${hasFill ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>
                  {slot.timeSlot}
                </span>
                {linked ? (
                  <div className="flex items-center gap-1.5 flex-1 min-w-0">
                    <span className="text-[8px] font-bold px-1.5 py-0.5 rounded text-white shrink-0" style={{ background: qCfg!.color }}>
                      {qCfg!.label}
                    </span>
                    <span
                      className="w-4 h-4 rounded flex items-center justify-center text-[10px] shrink-0"
                      style={{ background: stCfg!.bg, color: stCfg!.color }}
                    >
                      {stCfg!.icon}
                    </span>
                    <span className={`text-[12px] truncate ${linked.status === 'done' ? 'line-through text-muted-foreground' : 'font-medium'}`}>
                      {linked.task}
                    </span>
                  </div>
                ) : slot.title ? (
                  <span className="text-[12px] text-foreground flex-1 truncate">{slot.title}</span>
                ) : (
                  <span className="text-[11px] text-muted-foreground/30 flex-1 italic">비어있음</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-2">
        {(['q1', 'q2', 'q3', 'q4'] as EisenhowerQuadrant[]).map(q => {
          const cfg = EISENHOWER_CONFIG[q];
          const done = grouped[q].filter(t => t.status === 'done').length;
          const total = grouped[q].length;
          return (
            <div key={q} className="text-center p-2 rounded" style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
              <div className="text-[10px] font-bold" style={{ color: cfg.color }}>{cfg.action}</div>
              <div className="text-lg font-black" style={{ color: cfg.color }}>{done}/{total}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
