import { useState, DragEvent } from 'react';
import { Plus, Clock } from 'lucide-react';
import type { FranklinTask, FranklinPriority, TimeSlotEntry } from './data';
import { FRANKLIN_STATUS_CONFIG, FRANKLIN_PRIORITY_CONFIG, getNextNumber, cycleStatus, syncPriorityToEisenhower } from './data';

interface FranklinViewProps {
  tasks: FranklinTask[];
  timeSlots: TimeSlotEntry[];
  onTasksChange: (tasks: FranklinTask[]) => void;
  onSlotTitleChange: (index: number, title: string) => void;
}

export function FranklinView({ tasks, timeSlots, onTasksChange, onSlotTitleChange }: FranklinViewProps) {
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<FranklinPriority>('A');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<FranklinPriority | 'slot' | null>(null);

  const addTask = () => {
    if (!newTaskText.trim()) return;
    const eisFlags = syncPriorityToEisenhower(newTaskPriority);
    const task: FranklinTask = {
      id: `ft-${Date.now()}`,
      priority: newTaskPriority,
      number: getNextNumber(tasks, newTaskPriority),
      task: newTaskText.trim(),
      status: 'pending',
      ...eisFlags,
    };
    onTasksChange([...tasks, task]);
    setNewTaskText('');
  };

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

  const onDragOver = (e: DragEvent, target: FranklinPriority | 'slot') => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDropTarget(target);
  };

  const onDragLeave = () => setDropTarget(null);

  const onDropPriority = (e: DragEvent, priority: FranklinPriority) => {
    e.preventDefault();
    setDropTarget(null);
    if (!dragId) return;
    const eisFlags = syncPriorityToEisenhower(priority);
    updateTask(dragId, { priority, number: getNextNumber(tasks, priority), ...eisFlags });
    setDragId(null);
  };

  const onDropSlot = (e: DragEvent, slotIdx: number) => {
    e.preventDefault();
    setDropTarget(null);
    if (!dragId) return;
    const task = tasks.find(t => t.id === dragId);
    if (!task) return;
    // Clear previous slot
    if (task.timeSlotId) {
      const prevIdx = timeSlots.findIndex(s => s.id === task.timeSlotId);
      if (prevIdx >= 0) onSlotTitleChange(prevIdx, '');
    }
    const slot = timeSlots[slotIdx];
    updateTask(dragId, { timeSlotId: slot.id });
    onSlotTitleChange(slotIdx, task.task);
    setDragId(null);
  };

  const unlinkSlot = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task?.timeSlotId) {
      const idx = timeSlots.findIndex(s => s.id === task.timeSlotId);
      if (idx >= 0) onSlotTitleChange(idx, '');
    }
    updateTask(taskId, { timeSlotId: undefined });
  };

  // Group
  const priorities: FranklinPriority[] = ['A', 'B', 'C', 'D'];
  const grouped: Record<FranklinPriority, FranklinTask[]> = { A: [], B: [], C: [], D: [] };
  [...tasks].sort((a, b) => a.number - b.number).forEach(t => grouped[t.priority]?.push(t));

  // Slot map
  const slotTaskMap = new Map<string, FranklinTask>();
  tasks.forEach(t => { if (t.timeSlotId) slotTaskMap.set(t.timeSlotId, t); });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-3">
      {/* Left: Priority groups */}
      <div className="border border-border rounded-lg overflow-hidden">
        <div className="bg-accent/40 px-3 py-1.5 border-b border-border flex items-center justify-between">
          <span className="font-semibold text-sm">우선순위 과업</span>
          <span className="text-[10px] text-muted-foreground">{tasks.length}개 · 드래그로 이동</span>
        </div>

        {/* Add bar */}
        <div className="flex items-center gap-1 p-2 border-b border-border bg-muted/20">
          <div className="flex gap-0.5">
            {priorities.map(p => (
              <button
                key={p}
                onClick={() => setNewTaskPriority(p)}
                className="w-6 h-6 rounded text-[10px] font-bold transition-all"
                style={{
                  background: newTaskPriority === p ? FRANKLIN_PRIORITY_CONFIG[p].color : FRANKLIN_PRIORITY_CONFIG[p].bg,
                  color: newTaskPriority === p ? '#fff' : FRANKLIN_PRIORITY_CONFIG[p].color,
                }}
              >
                {p}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={newTaskText}
            onChange={e => setNewTaskText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addTask()}
            placeholder="새 과업 → Enter"
            className="flex-1 px-2 py-1 text-sm border border-border rounded bg-background outline-none focus:border-primary"
          />
          <button onClick={addTask} className="p-1 rounded bg-primary text-primary-foreground hover:opacity-90">
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Priority groups with DnD */}
        <div className="overflow-y-auto" style={{ scrollbarWidth: 'none', maxHeight: 'calc(100vh - 350px)' }}>
          {priorities.map(priority => {
            const cfg = FRANKLIN_PRIORITY_CONFIG[priority];
            const group = grouped[priority];
            const isDrop = dropTarget === priority;

            return (
              <div
                key={priority}
                onDragOver={e => onDragOver(e, priority)}
                onDragLeave={onDragLeave}
                onDrop={e => onDropPriority(e, priority)}
                style={{ borderLeft: isDrop ? `3px solid ${cfg.color}` : '3px solid transparent' }}
              >
                {/* Header */}
                <div
                  className="px-3 py-1 text-[11px] font-bold flex items-center gap-2 border-b border-border"
                  style={{ background: cfg.bg, color: cfg.color }}
                >
                  <span className="w-5 h-5 rounded flex items-center justify-center text-white text-[10px]" style={{ background: cfg.color }}>
                    {cfg.label}
                  </span>
                  {cfg.desc}
                  <span className="ml-auto text-[10px] opacity-60">{group.length}</span>
                </div>

                {/* Tasks */}
                {group.length === 0 ? (
                  <div className="px-3 py-2 text-[10px] text-muted-foreground/40 text-center border-b border-border italic">
                    드래그하여 이동
                  </div>
                ) : (
                  group.map(task => {
                    const stCfg = FRANKLIN_STATUS_CONFIG[task.status];
                    return (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={e => onDragStart(e, task.id)}
                        className="flex items-center gap-1.5 px-2 py-1 border-b border-border/50 hover:bg-accent/20 cursor-grab active:cursor-grabbing group"
                      >
                        <button
                          onClick={() => updateTask(task.id, { status: cycleStatus(task.status) })}
                          className="w-5 h-5 rounded flex items-center justify-center text-[11px] font-bold shrink-0 hover:scale-110 transition-all"
                          style={{ background: stCfg.bg, color: stCfg.color }}
                          title={stCfg.label}
                        >
                          {stCfg.icon}
                        </button>
                        <span className="text-[10px] font-bold shrink-0 w-5" style={{ color: cfg.color }}>
                          {priority}{task.number}
                        </span>
                        {editingId === task.id ? (
                          <input
                            type="text"
                            value={task.task}
                            onChange={e => updateTask(task.id, { task: e.target.value })}
                            onBlur={() => setEditingId(null)}
                            onKeyDown={e => e.key === 'Enter' && setEditingId(null)}
                            autoFocus
                            className="flex-1 text-[12px] px-1 py-0.5 border border-primary rounded outline-none"
                          />
                        ) : (
                          <span
                            className={`flex-1 text-[12px] cursor-pointer truncate ${
                              task.status === 'done' ? 'line-through text-muted-foreground' :
                              task.status === 'cancelled' ? 'line-through text-muted-foreground/50' : ''
                            }`}
                            onClick={() => setEditingId(task.id)}
                          >
                            {task.task}
                          </span>
                        )}
                        {task.timeSlotId && (
                          <button
                            onClick={() => unlinkSlot(task.id)}
                            className="text-[8px] px-1 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-200 hover:bg-red-50 hover:text-red-500 shrink-0"
                            title="연결 해제"
                          >
                            {timeSlots.find(s => s.id === task.timeSlotId)?.timeSlot.split('~')[0]?.trim() || ''}
                          </button>
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
            );
          })}
        </div>

        {/* Forwarded */}
        {tasks.some(t => t.status === 'forwarded') && (
          <div className="px-3 py-1.5 bg-amber-50 border-t border-amber-200 text-[10px] text-amber-700">
            <strong>이월:</strong> {tasks.filter(t => t.status === 'forwarded').map(t => `${t.priority}${t.number}`).join(', ')}
          </div>
        )}
      </div>

      {/* Right: Time Schedule with DnD */}
      <div className="border border-border rounded-lg overflow-hidden">
        <div className="bg-accent/40 px-3 py-1.5 border-b border-border flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="font-semibold text-sm">일정</span>
          <span className="text-[10px] text-muted-foreground">과업을 드래그하여 배정</span>
        </div>

        <div className="overflow-y-auto" style={{ scrollbarWidth: 'none', maxHeight: 'calc(100vh - 350px)' }}>
          {timeSlots.map((slot, idx) => {
            const linked = slotTaskMap.get(slot.id);
            const stCfg = linked ? FRANKLIN_STATUS_CONFIG[linked.status] : null;
            const pCfg = linked ? FRANKLIN_PRIORITY_CONFIG[linked.priority] : null;
            const hasFill = linked || slot.title;

            return (
              <div
                key={slot.id}
                className={`flex items-center gap-2 px-2 py-1.5 border-b border-border/50 transition-colors ${
                  dropTarget === 'slot' && !linked ? 'bg-blue-50' : hasFill ? 'bg-accent/5' : 'hover:bg-accent/10'
                }`}
                onDragOver={e => onDragOver(e, 'slot')}
                onDragLeave={onDragLeave}
                onDrop={e => onDropSlot(e, idx)}
              >
                <span className={`text-[10px] w-28 shrink-0 font-mono ${hasFill ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>
                  {slot.timeSlot}
                </span>
                {linked ? (
                  <div className="flex items-center gap-1.5 flex-1 min-w-0">
                    <span className="text-[10px] font-bold px-1 py-0.5 rounded shrink-0" style={{ background: pCfg!.bg, color: pCfg!.color }}>
                      {linked.priority}{linked.number}
                    </span>
                    <span className="w-4 h-4 rounded flex items-center justify-center text-[10px] shrink-0" style={{ background: stCfg!.bg, color: stCfg!.color }}>
                      {stCfg!.icon}
                    </span>
                    <span className={`text-[12px] truncate ${linked.status === 'done' ? 'line-through text-muted-foreground' : 'font-medium'}`}>
                      {linked.task}
                    </span>
                  </div>
                ) : slot.title ? (
                  <span className="text-[12px] flex-1 truncate">{slot.title}</span>
                ) : (
                  <span className="text-[10px] text-muted-foreground/30 flex-1 italic">비어있음</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary */}
      <div className="lg:col-span-2 grid grid-cols-4 gap-2">
        {priorities.map(p => {
          const cfg = FRANKLIN_PRIORITY_CONFIG[p];
          const done = grouped[p].filter(t => t.status === 'done').length;
          const total = grouped[p].length;
          return (
            <div key={p} className="text-center p-2 rounded" style={{ background: cfg.bg }}>
              <div className="text-[10px] font-bold" style={{ color: cfg.color }}>{cfg.label} {cfg.desc}</div>
              <div className="text-lg font-black" style={{ color: cfg.color }}>{done}/{total}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
