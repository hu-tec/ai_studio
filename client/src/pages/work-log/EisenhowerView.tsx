import { useState, DragEvent } from 'react';
import { Plus, ChevronDown, ChevronRight, AlertTriangle, Paperclip, Upload, X, ExternalLink, GripVertical } from 'lucide-react';
import { MarkdownField } from './MarkdownField';
import type { Task, FranklinPriority, EisenhowerQuadrant, TimeSlotEntry, MandalartPeriod } from './data';
import {
  EISENHOWER_CONFIG, FRANKLIN_STATUS_CONFIG, FRANKLIN_PRIORITY_CONFIG,
  getQuadrant, setQuadrant, getNextNumber, cycleStatus, syncPriorityToEisenhower,
  ACH_COLORS, ACH_LABELS, calcTaskAchievement,
  addSubTask, updateSubTask, removeSubTask,
  taskFileObjs, uploadTaskFile,
} from './data';

interface EisenhowerViewProps {
  tasks: Task[];
  timeSlots: TimeSlotEntry[];
  onTasksChange: (tasks: Task[]) => void;
  onSlotTitleChange: (index: number, title: string) => void;
  period?: MandalartPeriod;
}

export function EisenhowerView({ tasks, timeSlots, onTasksChange, onSlotTitleChange, period = 'daily' }: EisenhowerViewProps) {
  const [dragId, setDragId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<EisenhowerQuadrant | 'slot' | null>(null);
  const [newText, setNewText] = useState('');
  const [newQuad, setNewQuad] = useState<EisenhowerQuadrant>('q1');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newSubText, setNewSubText] = useState('');
  const toggleExpand = (id: string) => setExpandedIds(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  const priorities: FranklinPriority[] = ['A', 'B', 'C', 'D'];

  // Group tasks by quadrant
  const grouped: Record<EisenhowerQuadrant, Task[]> = { q1: [], q2: [], q3: [], q4: [] };
  tasks.forEach(t => grouped[getQuadrant(t)].push(t));

  // Add task
  const addTask = () => {
    if (!newText.trim()) return;
    const flags = setQuadrant({} as Task, newQuad);
    const priorityMap: Record<EisenhowerQuadrant, FranklinPriority> = { q1: 'A', q2: 'B', q3: 'C', q4: 'D' };
    const priority = priorityMap[newQuad];
    const task: Task = {
      id: `ft-${Date.now()}`,
      priority,
      number: getNextNumber(tasks, priority),
      task: newText.trim(),
      status: 'pending',
      period,
      ...flags,
    };
    onTasksChange([...tasks, task]);
    setNewText('');
  };

  // Update task
  const updateTask = (id: string, updates: Partial<Task>) => {
    onTasksChange(tasks.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const removeTask = (id: string) => {
    onTasksChange(tasks.filter(t => t.id !== id));
  };

  // Drag handlers
  const onDragStart = (e: DragEvent, id: string) => {
    setDragId(id);
    e.dataTransfer.effectAllowed = 'copyMove';
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
    const task = tasks.find(t => t.id === dragId);
    if (task && getQuadrant(task) === q) { setDragId(null); return; }
    const flags = setQuadrant({} as Task, q);
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
  const slotTaskMap = new Map<string, Task>();
  tasks.forEach(t => { if (t.timeSlotId) slotTaskMap.set(t.timeSlotId, t); });

  return (
    <div className="space-y-1">
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
                className="px-2.5 py-1 flex items-center justify-between shrink-0"
                style={{ background: cfg.bg }}
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-black px-1.5 py-0.5 rounded text-white" style={{ background: cfg.color }}>{cfg.label}</span>
                  <span className="text-[10px] font-bold" style={{ color: cfg.color }}>{cfg.desc}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-black" style={{ color: cfg.color }}>
                    {items.filter(t => t.status === 'done').length}/{items.length}
                  </span>
                  {items.length > 0 && (
                    <button onClick={() => {
                      const allExp = items.every(t => expandedIds.has(t.id));
                      setExpandedIds(prev => {
                        const s = new Set(prev);
                        items.forEach(t => allExp ? s.delete(t.id) : s.add(t.id));
                        return s;
                      });
                    }} className="text-[8px] px-1 py-0.5 rounded" style={{ background: cfg.border, color: cfg.color }}>
                      {items.every(t => expandedIds.has(t.id)) ? '▲' : '▼'}
                    </button>
                  )}
                </div>
              </div>

              {/* Tasks */}
              <div className="flex-1 overflow-y-auto">
                {items.length === 0 ? (
                  <div className="p-2 text-center text-[11px] text-muted-foreground">
                    과업을 여기로 드래그하세요
                  </div>
                ) : (
                  items.map(task => {
                    const stCfg = FRANKLIN_STATUS_CONFIG[task.status];
                    const pCfg = FRANKLIN_PRIORITY_CONFIG[task.priority];
                    const isExpanded = expandedIds.has(task.id);
                    const timeLabel = task.startTime ? `${task.startTime}${task.endTime ? '~'+task.endTime : '~'}` : '';
                    return (
                      <div key={task.id} className="border-b border-border/50">
                        <div draggable onDragStart={e => onDragStart(e, task.id)}
                          className="flex items-center gap-1 px-2 py-1 hover:bg-accent/20 cursor-grab active:cursor-grabbing group">
                          <button onClick={() => toggleExpand(task.id)} className="w-3 h-3 shrink-0 text-muted-foreground">
                            {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                          </button>
                          <button onClick={() => updateTask(task.id, { status: cycleStatus(task.status) })}
                            className="w-4 h-4 rounded flex items-center justify-center text-[10px] font-bold shrink-0 hover:scale-110"
                            style={{ background: stCfg.bg, color: stCfg.color }}>{stCfg.icon}</button>
                          <span className="text-[9px] font-bold shrink-0" style={{ color: pCfg.color }}>{task.priority}{task.number}</span>
                          <button onClick={e => { e.stopPropagation(); updateTask(task.id, { isIssue: !task.isIssue }); }}
                            onMouseDown={e => e.stopPropagation()}
                            draggable={false}
                            onDragStart={e => e.preventDefault()}
                            title={task.isIssue ? '이슈 해제' : '이슈로 표시'}
                            className={`text-[8px] px-1 py-0.5 rounded border font-bold leading-none shrink-0 ${task.isIssue ? 'bg-amber-100 border-amber-400 text-amber-700' : 'bg-transparent border-transparent text-muted-foreground/40 hover:border-amber-200 hover:text-amber-600'}`}>
                            ⚠
                          </button>
                          {editingId === task.id ? (
                            <input value={task.task}
                              onChange={e => updateTask(task.id, { task: e.target.value })}
                              onBlur={() => setEditingId(null)}
                              onKeyDown={e => { if (e.key === 'Enter' || e.key === 'Escape') setEditingId(null); }}
                              autoFocus
                              onMouseDown={e => e.stopPropagation()}
                              onClick={e => e.stopPropagation()}
                              draggable={false}
                              onDragStart={e => e.preventDefault()}
                              className="flex-1 text-[11px] px-1 py-0.5 border border-primary rounded outline-none" />
                          ) : (
                            <span
                              onDoubleClick={e => { e.stopPropagation(); setEditingId(task.id); }}
                              onMouseDown={e => e.stopPropagation()}
                              draggable={false}
                              onDragStart={e => e.preventDefault()}
                              title="더블클릭하여 편집"
                              className={`flex-1 text-[11px] cursor-text truncate ${task.status === 'cancelled' ? 'line-through text-muted-foreground/50' : ''}`}>
                              {task.task}
                            </span>
                          )}
                          <div className="flex gap-[1px] shrink-0" onClick={e => e.stopPropagation()}>
                            {[1,2,3,4,5].map(v => {
                              const ach = calcTaskAchievement(task);
                              return <button key={v} onClick={() => updateTask(task.id, { achievement: task.achievement === v ? 0 : v })}
                                className="w-2.5 h-2.5 rounded-full border-none p-0 cursor-pointer"
                                style={{ background: ach >= v ? ACH_COLORS[v] : '#e2e8f0', opacity: ach >= v ? 1 : 0.3 }} />;
                            })}
                          </div>
                          {timeLabel && <span className="text-[8px] font-mono text-blue-600 shrink-0">{timeLabel}</span>}
                          {task.children && task.children.length > 0 && (
                            <span className="text-[8px] px-1 rounded bg-slate-100 text-slate-500 font-bold shrink-0">
                              {task.children.filter(c => c.status === 'done').length}/{task.children.length}
                            </span>
                          )}
                          <button onClick={() => removeTask(task.id)}
                            className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 text-[9px] shrink-0">✕</button>
                        </div>
                        {/* Full expanded detail */}
                        {isExpanded && (
                          <div className="px-2 py-1.5 bg-accent/5 border-t border-border/30 space-y-1.5 text-[10px]">
                            {/* 링크 (이슈 토글은 메인 row 로 이동) */}
                            <div className="flex items-center gap-1.5">
                              <span className="text-muted-foreground w-10 shrink-0">링크</span>
                              <input type="url" value={task.link || ''} placeholder="https://..."
                                onChange={e => updateTask(task.id, { link: e.target.value || undefined })}
                                className="flex-1 px-1.5 py-0.5 border border-border rounded text-[10px] bg-background outline-none" />
                              {task.link && (
                                <button onClick={() => window.open(task.link, '_blank', 'noopener,noreferrer')}
                                  className="px-1 py-0.5 text-[9px] rounded border border-blue-200 text-blue-600 bg-blue-50 hover:bg-blue-100 flex items-center gap-0.5 shrink-0">
                                  <ExternalLink size={9} /> 열기
                                </button>
                              )}
                            </div>
                            {/* 파일 첨부 + 이미지 paste */}
                            <div
                              onPaste={async e => {
                                const files = Array.from(e.clipboardData.files);
                                if (files.length === 0) return;
                                e.preventDefault();
                                const existing = taskFileObjs(task);
                                const uploaded: { url: string; name: string }[] = [];
                                for (const f of files) {
                                  const r = await uploadTaskFile(f, 'worklog-task');
                                  if (r) uploaded.push(r);
                                }
                                if (uploaded.length > 0) updateTask(task.id, { files: [...existing, ...uploaded] });
                              }}
                              className="flex items-start gap-1.5">
                              <span className="text-muted-foreground w-10 pt-0.5">파일</span>
                              <div className="flex-1 flex flex-wrap items-center gap-1">
                                {taskFileObjs(task).map((f, i) => {
                                  const isImg = /\.(png|jpe?g|gif|webp|svg)$/i.test(f.name) || /\.(png|jpe?g|gif|webp|svg)(\?|$)/i.test(f.url);
                                  return (
                                    <div key={i} className="inline-flex items-center gap-1 px-1 py-0.5 bg-slate-50 border border-border rounded text-[9px]">
                                      {isImg && <img src={f.url} alt={f.name} className="w-4 h-4 object-cover rounded" />}
                                      <Paperclip className="w-2.5 h-2.5 text-muted-foreground" />
                                      <a href={f.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate max-w-[110px]">{f.name}</a>
                                      <button onClick={() => {
                                        const next = taskFileObjs(task).filter((_, j) => j !== i);
                                        updateTask(task.id, { files: next.length ? next : undefined });
                                      }} className="text-rose-500 hover:bg-rose-50 rounded w-3 h-3 flex items-center justify-center">
                                        <X size={8} />
                                      </button>
                                    </div>
                                  );
                                })}
                                <label className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded border border-dashed border-border text-[9px] text-muted-foreground cursor-pointer hover:bg-accent/20">
                                  <Upload size={9} /> 업로드
                                  <input type="file" multiple className="hidden"
                                    onChange={async e => {
                                      const files = Array.from(e.target.files || []);
                                      if (files.length === 0) return;
                                      const existing = taskFileObjs(task);
                                      const uploaded: { url: string; name: string }[] = [];
                                      for (const f of files) {
                                        const r = await uploadTaskFile(f, 'worklog-task');
                                        if (r) uploaded.push(r);
                                      }
                                      if (uploaded.length > 0) updateTask(task.id, { files: [...existing, ...uploaded] });
                                      (e.target as HTMLInputElement).value = '';
                                    }} />
                                </label>
                                <span className="text-[8px] text-muted-foreground/60 italic">이미지 Ctrl+V OK</span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <span className="text-muted-foreground w-10 pt-0.5">메모</span>
                              <div className="flex-1 border border-border rounded bg-background overflow-hidden">
                                <MarkdownField value={task.note || ''} onChange={v => updateTask(task.id, { note: v })} placeholder="상세 내용 (마크다운 지원)" minHeight={30} />
                              </div>
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-muted-foreground w-10">하위</span>
                                <input value={newSubText} onChange={e => setNewSubText(e.target.value)}
                                  onKeyDown={e => { if (e.key === 'Enter' && newSubText.trim()) { onTasksChange(addSubTask(tasks, task.id, newSubText.trim())); setNewSubText(''); } }}
                                  placeholder="서브태스크 (Enter)" className="flex-1 px-1.5 py-0.5 border border-border rounded text-[10px] bg-background outline-none" />
                              </div>
                              {(task.children || []).map(sub => {
                                const subSt = FRANKLIN_STATUS_CONFIG[sub.status];
                                return (
                                  <div key={sub.id} className="flex items-center gap-1 pl-2 py-0.5 group/sub">
                                    <button onClick={() => onTasksChange(updateSubTask(tasks, task.id, sub.id, { status: cycleStatus(sub.status) }))}
                                      className="w-3.5 h-3.5 rounded flex items-center justify-center text-[8px] font-bold shrink-0"
                                      style={{ background: subSt.bg, color: subSt.color }}>{subSt.icon}</button>
                                    <span className="text-[8px] font-bold shrink-0" style={{ color: pCfg.color }}>{task.priority}{task.number}-{sub.number}</span>
                                    <span draggable
                                      onDragStart={e => { e.stopPropagation(); e.dataTransfer.effectAllowed = 'copyMove'; e.dataTransfer.setData('text/plain', sub.id); }}
                                      title="드래그→타임테이블 배정"
                                      className="cursor-grab active:cursor-grabbing shrink-0 text-muted-foreground/40 hover:text-blue-500">
                                      <GripVertical size={10} />
                                    </span>
                                    {editingId === sub.id ? (
                                      <input value={sub.task}
                                        onChange={e => onTasksChange(updateSubTask(tasks, task.id, sub.id, { task: e.target.value }))}
                                        onBlur={() => setEditingId(null)}
                                        onKeyDown={e => { if (e.key === 'Enter' || e.key === 'Escape') setEditingId(null); }}
                                        autoFocus
                                        onMouseDown={e => e.stopPropagation()}
                                        onClick={e => e.stopPropagation()}
                                        draggable={false}
                                        onDragStart={e => e.preventDefault()}
                                        className="flex-1 text-[10px] px-1 py-0.5 border border-primary rounded outline-none" />
                                    ) : (
                                      <span
                                        onDoubleClick={e => { e.stopPropagation(); setEditingId(sub.id); }}
                                        onMouseDown={e => e.stopPropagation()}
                                        draggable={false}
                                        onDragStart={e => e.preventDefault()}
                                        title="더블클릭→편집"
                                        className={`flex-1 text-[10px] cursor-text ${sub.status === 'cancelled' ? 'line-through text-muted-foreground/50' : ''}`}>
                                        {sub.task}
                                      </span>
                                    )}
                                    <div className="flex gap-[1px] shrink-0">
                                      {[1,2,3,4,5].map(v => (
                                        <button key={v} onClick={() => onTasksChange(updateSubTask(tasks, task.id, sub.id, { achievement: sub.achievement === v ? 0 : v }))}
                                          className="w-2 h-2 rounded-full border-none p-0 cursor-pointer"
                                          style={{ background: (sub.achievement||0) >= v ? ACH_COLORS[v] : '#e2e8f0', opacity: (sub.achievement||0) >= v ? 1 : 0.3 }} />
                                      ))}
                                    </div>
                                    <button onClick={() => onTasksChange(removeSubTask(tasks, task.id, sub.id))}
                                      className="text-muted-foreground hover:text-destructive opacity-0 group-hover/sub:opacity-100 text-[8px] shrink-0">✕</button>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
