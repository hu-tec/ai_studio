import { useState } from 'react';
import { Plus, GripVertical, Clock, MessageSquare } from 'lucide-react';
import type { FranklinTask, FranklinPriority, FranklinStatus, TimeSlotEntry } from './data';
import { FRANKLIN_STATUS_CONFIG, FRANKLIN_PRIORITY_CONFIG, getNextNumber, cycleStatus } from './data';

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

  const addTask = () => {
    if (!newTaskText.trim()) return;
    const task: FranklinTask = {
      id: `ft-${Date.now()}`,
      priority: newTaskPriority,
      number: getNextNumber(tasks, newTaskPriority),
      task: newTaskText.trim(),
      status: 'pending',
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

  const handleStatusCycle = (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    updateTask(id, { status: cycleStatus(task.status) });
  };

  const linkToSlot = (taskId: string, slotId: string | undefined) => {
    const task = tasks.find(t => t.id === taskId);
    // 기존 연결 해제 시 슬롯 클리어
    if (task?.timeSlotId) {
      const prevIdx = timeSlots.findIndex(s => s.id === task.timeSlotId);
      if (prevIdx >= 0) onSlotTitleChange(prevIdx, '');
    }
    updateTask(taskId, { timeSlotId: slotId });
    // 새 슬롯에 과업 내용 동기화 (항상 덮어쓰기)
    if (slotId && task) {
      const slotIdx = timeSlots.findIndex(s => s.id === slotId);
      if (slotIdx >= 0) onSlotTitleChange(slotIdx, task.task);
    }
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    const po = { A: 0, B: 1, C: 2 };
    if (po[a.priority] !== po[b.priority]) return po[a.priority] - po[b.priority];
    return a.number - b.number;
  });

  const groupedByPriority: Record<FranklinPriority, FranklinTask[]> = { A: [], B: [], C: [] };
  sortedTasks.forEach(t => groupedByPriority[t.priority].push(t));

  // Map slot IDs to linked tasks
  const slotTaskMap = new Map<string, FranklinTask>();
  tasks.forEach(t => { if (t.timeSlotId) slotTaskMap.set(t.timeSlotId, t); });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-3">
      {/* Left: Priority Task List */}
      <div className="border border-border rounded-lg overflow-hidden">
        <div className="bg-accent/40 px-3 py-2 border-b border-border flex items-center justify-between">
          <span className="font-semibold text-sm">우선순위 과업</span>
          <span className="text-xs text-muted-foreground">{tasks.length}개</span>
        </div>

        {/* Add task bar */}
        <div className="flex items-center gap-1 p-2 border-b border-border bg-muted/20">
          <div className="flex gap-0.5">
            {(['A', 'B', 'C'] as FranklinPriority[]).map(p => (
              <button
                key={p}
                onClick={() => setNewTaskPriority(p)}
                className="w-7 h-7 rounded text-xs font-bold transition-all"
                style={{
                  background: newTaskPriority === p ? FRANKLIN_PRIORITY_CONFIG[p].color : FRANKLIN_PRIORITY_CONFIG[p].bg,
                  color: newTaskPriority === p ? '#fff' : FRANKLIN_PRIORITY_CONFIG[p].color,
                  border: `1px solid ${FRANKLIN_PRIORITY_CONFIG[p].color}20`,
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
            placeholder="새 과업 입력 후 Enter"
            className="flex-1 px-2 py-1.5 text-sm border border-border rounded bg-background outline-none focus:border-primary"
          />
          <button
            onClick={addTask}
            className="p-1.5 rounded bg-primary text-primary-foreground hover:opacity-90"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Task groups */}
        <div className="max-h-[calc(100vh-400px)] overflow-y-auto">
          {(['A', 'B', 'C'] as FranklinPriority[]).map(priority => {
            const cfg = FRANKLIN_PRIORITY_CONFIG[priority];
            const group = groupedByPriority[priority];
            if (group.length === 0 && priority === 'C') return null;

            return (
              <div key={priority}>
                {/* Priority header */}
                <div
                  className="px-3 py-1.5 text-xs font-bold flex items-center gap-2 border-b border-border"
                  style={{ background: cfg.bg, color: cfg.color }}
                >
                  <span className="w-5 h-5 rounded flex items-center justify-center text-white text-[10px]" style={{ background: cfg.color }}>
                    {cfg.label}
                  </span>
                  {cfg.desc}
                  <span className="ml-auto text-[10px] opacity-60">{group.length}개</span>
                </div>

                {/* Tasks */}
                {group.length === 0 ? (
                  <div className="px-3 py-3 text-xs text-muted-foreground text-center border-b border-border">
                    {priority} 과업 없음
                  </div>
                ) : (
                  group.map(task => {
                    const stCfg = FRANKLIN_STATUS_CONFIG[task.status];
                    const isEditing = editingId === task.id;
                    return (
                      <div
                        key={task.id}
                        className="flex items-center gap-1.5 px-2 py-1.5 border-b border-border hover:bg-accent/20 transition-colors group"
                      >
                        {/* Status button */}
                        <button
                          onClick={() => handleStatusCycle(task.id)}
                          className="w-7 h-7 rounded flex items-center justify-center text-sm font-bold shrink-0 transition-all hover:scale-110"
                          style={{ background: stCfg.bg, color: stCfg.color, border: `1px solid ${stCfg.color}30` }}
                          title={`${stCfg.label} (클릭하여 변경)`}
                        >
                          {stCfg.icon}
                        </button>

                        {/* Priority + Number */}
                        <span
                          className="text-xs font-bold shrink-0 w-6 text-center"
                          style={{ color: cfg.color }}
                        >
                          {priority}{task.number}
                        </span>

                        {/* Task text */}
                        {isEditing ? (
                          <input
                            type="text"
                            value={task.task}
                            onChange={e => updateTask(task.id, { task: e.target.value })}
                            onBlur={() => setEditingId(null)}
                            onKeyDown={e => e.key === 'Enter' && setEditingId(null)}
                            autoFocus
                            className="flex-1 text-sm px-1 py-0.5 border border-primary rounded outline-none"
                          />
                        ) : (
                          <span
                            className={`flex-1 text-sm cursor-pointer ${
                              task.status === 'done' ? 'line-through text-muted-foreground' :
                              task.status === 'cancelled' ? 'line-through text-muted-foreground/50' : ''
                            }`}
                            onClick={() => setEditingId(task.id)}
                          >
                            {task.task}
                          </span>
                        )}

                        {/* Time link — 연결된 시간 표시 / 클릭으로 변경 */}
                        {task.timeSlotId ? (
                          <button
                            onClick={() => linkToSlot(task.id, undefined)}
                            className="text-[10px] px-1.5 py-0.5 rounded shrink-0 bg-blue-50 text-blue-600 border border-blue-200 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors"
                            title="클릭하여 연결 해제"
                          >
                            {timeSlots.find(s => s.id === task.timeSlotId)?.timeSlot || '연결됨'}
                          </button>
                        ) : (
                          <div className="flex gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity overflow-x-auto max-w-[180px]">
                            {timeSlots.filter(s => !slotTaskMap.has(s.id)).map(s => (
                              <button
                                key={s.id}
                                onClick={() => linkToSlot(task.id, s.id)}
                                className="text-[9px] px-1 py-0.5 rounded bg-muted/40 hover:bg-blue-100 hover:text-blue-700 whitespace-nowrap transition-colors"
                              >
                                {s.timeSlot.split('~')[0]?.trim()}
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Delete */}
                        <button
                          onClick={() => removeTask(task.id)}
                          className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity text-xs"
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

        {/* Footer: forwarded summary */}
        {tasks.some(t => t.status === 'forwarded') && (
          <div className="px-3 py-2 bg-amber-50 border-t border-amber-200 text-xs text-amber-700">
            <strong>이월 항목:</strong>{' '}
            {tasks.filter(t => t.status === 'forwarded').map(t => `${t.priority}${t.number} ${t.task}`).join(', ')}
          </div>
        )}
      </div>

      {/* Right: Time Schedule */}
      <div className="border border-border rounded-lg overflow-hidden">
        <div className="bg-accent/40 px-3 py-2 border-b border-border flex items-center gap-2">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span className="font-semibold text-sm">일정</span>
        </div>

        <div className="max-h-[calc(100vh-400px)] overflow-y-auto">
          {timeSlots.map((slot, idx) => {
            const linkedTask = slotTaskMap.get(slot.id);
            const stCfg = linkedTask ? FRANKLIN_STATUS_CONFIG[linkedTask.status] : null;
            const pCfg = linkedTask ? FRANKLIN_PRIORITY_CONFIG[linkedTask.priority] : null;

            return (
              <div
                key={slot.id}
                className="flex items-center gap-2 px-2 py-1.5 border-b border-border hover:bg-accent/10 transition-colors"
              >
                {/* Time */}
                <span className="text-xs text-muted-foreground w-28 shrink-0 font-mono">
                  {slot.timeSlot}
                </span>

                {/* Linked task indicator */}
                {linkedTask ? (
                  <div className="flex items-center gap-1.5 flex-1 min-w-0">
                    <span
                      className="text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0"
                      style={{ background: pCfg!.bg, color: pCfg!.color }}
                    >
                      {linkedTask.priority}{linkedTask.number}
                    </span>
                    <span
                      className="w-4 h-4 rounded flex items-center justify-center text-[10px] shrink-0"
                      style={{ background: stCfg!.bg, color: stCfg!.color }}
                    >
                      {stCfg!.icon}
                    </span>
                    <span className={`text-sm truncate ${linkedTask.status === 'done' ? 'line-through text-muted-foreground' : ''}`}>
                      {linkedTask.task}
                    </span>
                  </div>
                ) : (
                  <input
                    type="text"
                    value={slot.title}
                    onChange={e => onSlotTitleChange(idx, e.target.value)}
                    placeholder="—"
                    className="flex-1 text-sm bg-transparent border-none outline-none px-1"
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom: Notes */}
      <div className="lg:col-span-2 border border-border rounded-lg overflow-hidden">
        <div className="bg-accent/40 px-3 py-2 border-b border-border flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-muted-foreground" />
          <span className="font-semibold text-sm">메모 / 오늘의 반성</span>
        </div>
        <div className="p-2">
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center p-2 rounded" style={{ background: FRANKLIN_STATUS_CONFIG.done.bg }}>
              <div className="font-bold text-lg" style={{ color: FRANKLIN_STATUS_CONFIG.done.color }}>
                {tasks.filter(t => t.status === 'done').length}
              </div>
              <div className="text-muted-foreground">완료</div>
            </div>
            <div className="text-center p-2 rounded" style={{ background: FRANKLIN_STATUS_CONFIG.progress.bg }}>
              <div className="font-bold text-lg" style={{ color: FRANKLIN_STATUS_CONFIG.progress.color }}>
                {tasks.filter(t => t.status === 'progress').length}
              </div>
              <div className="text-muted-foreground">진행중</div>
            </div>
            <div className="text-center p-2 rounded" style={{ background: FRANKLIN_STATUS_CONFIG.forwarded.bg }}>
              <div className="font-bold text-lg" style={{ color: FRANKLIN_STATUS_CONFIG.forwarded.color }}>
                {tasks.filter(t => t.status === 'forwarded').length}
              </div>
              <div className="text-muted-foreground">이월</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
