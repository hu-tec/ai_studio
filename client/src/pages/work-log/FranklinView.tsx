import { useState, DragEvent } from 'react';
import { Plus, ChevronDown, ChevronRight, AlertTriangle, Paperclip, Maximize2, Minimize2, ExternalLink, Upload, X, GripVertical } from 'lucide-react';
import { MarkdownField } from './MarkdownField';
import type { Task, FranklinPriority, TimeSlotEntry, MandalartPeriod } from './data';
import {
  FRANKLIN_STATUS_CONFIG, FRANKLIN_PRIORITY_CONFIG,
  getNextNumber, cycleStatus, syncPriorityToEisenhower,
  getTimelinePosition, ACH_COLORS, ACH_LABELS,
  addSubTask, updateSubTask, removeSubTask, calcTaskAchievement,
  taskFileObjs, uploadTaskFile,
} from './data';

interface FranklinViewProps {
  tasks: Task[];
  timeSlots: TimeSlotEntry[];
  timeInterval: '30min' | '1hour' | 'half-day';
  onTasksChange: (tasks: Task[]) => void;
  onSlotTitleChange: (index: number, title: string) => void;
  period?: MandalartPeriod;
}

const HOURS = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18];

export function FranklinView({ tasks, timeSlots, timeInterval, onTasksChange, period = 'daily' }: FranklinViewProps) {
  const [newText, setNewText] = useState('');
  const [newPriority, setNewPriority] = useState<FranklinPriority>('A');
  const [newStart, setNewStart] = useState('');
  const [newEnd, setNewEnd] = useState('');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newSubText, setNewSubText] = useState('');
  const [fullscreen, setFullscreen] = useState(false);
  const toggleExpand = (id: string) => setExpandedIds(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  const [dragId, setDragId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<FranklinPriority | null>(null);
  const priorities: FranklinPriority[] = ['A', 'B', 'C', 'D'];

  // DnD handlers
  const onDragStart = (e: DragEvent, id: string) => {
    setDragId(id);
    e.dataTransfer.effectAllowed = 'copyMove';
    e.dataTransfer.setData('text/plain', id);
  };
  const onDragOver = (e: DragEvent, target: FranklinPriority) => {
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

  const addTask = () => {
    if (!newText.trim()) return;
    const eisFlags = syncPriorityToEisenhower(newPriority);
    const task: Task = {
      id: `ft-${Date.now()}`,
      priority: newPriority,
      number: getNextNumber(tasks, newPriority),
      task: newText.trim(),
      status: 'pending',
      startTime: newStart || undefined,
      endTime: newEnd || undefined,
      period,
      ...eisFlags,
    };
    onTasksChange([...tasks, task]);
    setNewText('');
    setNewStart('');
    setNewEnd('');
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
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
    <div className={fullscreen
      ? "fixed inset-0 z-50 bg-background p-2 overflow-auto space-y-1"
      : "space-y-1"
    }>
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

      {/* Task list (타임라인은 왼쪽 타임테이블에 표시됨) */}
      <div className="border border-border rounded-lg overflow-hidden">
        <div className="bg-accent/40 px-2 py-1 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold">업무 목록</span>
            <button onClick={() => { const allExp = sorted.every(t => expandedIds.has(t.id)); setExpandedIds(allExp ? new Set() : new Set(sorted.map(t => t.id))); }}
              className="text-[9px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-600 hover:bg-slate-300">
              {sorted.every(t => expandedIds.has(t.id)) ? '▲접기' : '▼펼치기'}
            </button>
            <button onClick={() => setFullscreen(f => !f)}
              title={fullscreen ? '전체화면 종료' : '전체화면'}
              className="text-[9px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 flex items-center gap-1">
              {fullscreen ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
              {fullscreen ? '닫기' : '전체화면'}
            </button>
          </div>
          <div className="flex items-center gap-2 text-[10px]">
            {priorities.map(p => {
              const cnt = tasks.filter(t => t.priority === p).length;
              return cnt > 0 ? <span key={p} style={{ color: FRANKLIN_PRIORITY_CONFIG[p].color }} className="font-bold">{p}:{cnt}</span> : null;
            })}
            <span className="text-[10px] text-amber-500 font-bold">양{tasks.filter(t => (t.achievement||0) >= 1).length}/{tasks.length}</span>
            <span className="text-[10px] text-emerald-600 font-bold">질{tasks.filter(t => (t.achievement||0) >= 4).length}/{tasks.length}</span>
          </div>
        </div>

        <div className="overflow-y-auto" style={{ scrollbarWidth: 'none', maxHeight: fullscreen ? 'calc(100vh - 180px)' : 'calc(100vh - 450px)' }}>
          {sorted.length === 0 ? (
            <div className="p-2 text-center text-[11px] text-muted-foreground">업무를 추가하세요</div>
          ) : sorted.map(task => {
            const pCfg = FRANKLIN_PRIORITY_CONFIG[task.priority];
            const stCfg = FRANKLIN_STATUS_CONFIG[task.status];
            const isExpanded = expandedIds.has(task.id);
            const timeLabel = task.startTime
              ? `${task.startTime}${task.endTime ? '~' + task.endTime : '~'}`
              : '미배정';

            return (
              <div key={task.id} className="border-b border-border/50">
                {/* Task row — draggable */}
                <div
                  draggable
                  onDragStart={e => onDragStart(e, task.id)}
                  className="flex items-center gap-1.5 px-2 py-1.5 hover:bg-accent/10 group cursor-grab active:cursor-grabbing"
                >
                  {/* Expand */}
                  <button onClick={() => toggleExpand(task.id)} className="w-4 h-4 shrink-0 text-muted-foreground">
                    {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  </button>
                  {/* Status */}
                  <button onClick={() => updateTask(task.id, { status: cycleStatus(task.status) })}
                    className="w-5 h-5 rounded flex items-center justify-center text-[11px] font-bold shrink-0 hover:scale-110"
                    style={{ background: stCfg.bg, color: stCfg.color }}>{stCfg.icon}</button>
                  {/* Priority */}
                  <span className="text-[10px] font-bold w-5 shrink-0" style={{ color: pCfg.color }}>{task.priority}{task.number}</span>
                  {/* Issue toggle — 메인 row 에 항상 표시 */}
                  <button onClick={e => { e.stopPropagation(); updateTask(task.id, { isIssue: !task.isIssue }); }}
                    onMouseDown={e => e.stopPropagation()}
                    draggable={false}
                    onDragStart={e => e.preventDefault()}
                    title={task.isIssue ? '이슈 해제' : '이슈로 표시'}
                    className={`text-[9px] px-1 py-0.5 rounded border font-bold leading-none shrink-0 ${task.isIssue ? 'bg-amber-100 border-amber-400 text-amber-700' : 'bg-transparent border-transparent text-muted-foreground/40 hover:border-amber-200 hover:text-amber-600'}`}>
                    ⚠
                  </button>
                  {/* Title — 더블클릭으로 인라인 편집 */}
                  {editingId === task.id ? (
                    <input value={task.task} onChange={e => updateTask(task.id, { task: e.target.value })}
                      onBlur={() => setEditingId(null)}
                      onKeyDown={e => { if (e.key === 'Enter' || e.key === 'Escape') setEditingId(null); }}
                      autoFocus
                      onMouseDown={e => e.stopPropagation()}
                      onClick={e => e.stopPropagation()}
                      draggable={false}
                      onDragStart={e => e.preventDefault()}
                      className="flex-1 text-[12px] px-1 py-0.5 border border-primary rounded outline-none" />
                  ) : (
                    <span
                      onDoubleClick={e => { e.stopPropagation(); setEditingId(task.id); }}
                      onMouseDown={e => e.stopPropagation()}
                      draggable={false}
                      onDragStart={e => e.preventDefault()}
                      title="더블클릭하여 편집"
                      className={`flex-1 text-[12px] cursor-text truncate ${task.status === 'cancelled' ? 'line-through text-muted-foreground/50' : ''}`}>
                      {task.task}
                    </span>
                  )}
                  {/* Achievement dots */}
                  <div className="flex gap-[2px] shrink-0" onClick={e => e.stopPropagation()}>
                    {[1,2,3,4,5].map(v => {
                      const ach = calcTaskAchievement(task);
                      return (
                        <button key={v} onClick={() => updateTask(task.id, { achievement: task.achievement === v ? 0 : v })}
                          className="w-3 h-3 rounded-full border-none p-0 cursor-pointer"
                          title={ACH_LABELS[v]}
                          style={{ background: ach >= v ? ACH_COLORS[v] : '#e2e8f0', opacity: ach >= v ? 1 : 0.3 }} />
                      );
                    })}
                  </div>
                  {/* Time */}
                  <span className={`text-[10px] font-mono shrink-0 ${task.startTime ? 'text-blue-600' : 'text-muted-foreground/40'}`}>
                    {timeLabel}
                  </span>
                  {/* Sub-task count */}
                  {task.children && task.children.length > 0 && (
                    <span className="text-[9px] px-1 py-0.5 rounded bg-slate-100 text-slate-500 font-bold shrink-0">
                      {task.children.filter(c => c.status === 'done').length}/{task.children.length}
                    </span>
                  )}
                  {/* Files indicator */}
                  {task.files && task.files.length > 0 && <Paperclip className="w-3 h-3 text-muted-foreground shrink-0" />}
                  {/* Delete */}
                  <button onClick={() => removeTask(task.id)}
                    className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 text-[10px] shrink-0">✕</button>
                </div>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="px-2 py-1 bg-accent/5 border-t border-border/30 space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
                    {/* 시간 (이슈 토글은 메인 row 로 이동) */}
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <span className="text-muted-foreground w-12">시간</span>
                      <input type="time" value={task.startTime || ''} onChange={e => updateTask(task.id, { startTime: e.target.value })}
                        className="px-1 py-0.5 border border-border rounded text-[11px] bg-background w-[80px]" />
                      <span className="text-[10px] text-muted-foreground">~</span>
                      <input type="time" value={task.endTime || ''} onChange={e => updateTask(task.id, { endTime: e.target.value })}
                        className="px-1 py-0.5 border border-border rounded text-[11px] bg-background w-[80px]" />
                    </div>
                    {/* 링크 */}
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <span className="text-muted-foreground w-12">링크</span>
                      <input type="url" value={task.link || ''} placeholder="https://..."
                        onChange={e => updateTask(task.id, { link: e.target.value || undefined })}
                        className="flex-1 px-1.5 py-0.5 border border-border rounded text-[11px] bg-background outline-none" />
                      {task.link && (
                        <button onClick={() => window.open(task.link, '_blank', 'noopener,noreferrer')}
                          className="px-1.5 py-0.5 text-[10px] rounded border border-blue-200 text-blue-600 bg-blue-50 hover:bg-blue-100 flex items-center gap-0.5">
                          <ExternalLink size={10} /> 열기
                        </button>
                      )}
                    </div>
                    {/* 파일 첨부 — 업로드 + 이미지 paste 지원 */}
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
                      className="flex items-start gap-1.5 text-[11px]">
                      <span className="text-muted-foreground w-12 pt-1">파일</span>
                      <div className="flex-1 flex flex-wrap items-center gap-1">
                        {taskFileObjs(task).map((f, i) => {
                          const isImg = /\.(png|jpe?g|gif|webp|svg)$/i.test(f.name) || /\.(png|jpe?g|gif|webp|svg)(\?|$)/i.test(f.url);
                          return (
                            <div key={i} className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-slate-50 border border-border rounded text-[10px]">
                              {isImg && <img src={f.url} alt={f.name} className="w-5 h-5 object-cover rounded" />}
                              <Paperclip className="w-3 h-3 text-muted-foreground" />
                              <a href={f.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate max-w-[140px]">{f.name}</a>
                              <button onClick={() => {
                                const next = taskFileObjs(task).filter((_, j) => j !== i);
                                updateTask(task.id, { files: next.length ? next : undefined });
                              }} className="text-rose-500 hover:bg-rose-50 rounded w-3.5 h-3.5 flex items-center justify-center">
                                <X size={9} />
                              </button>
                            </div>
                          );
                        })}
                        <label className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded border border-dashed border-border text-[10px] text-muted-foreground cursor-pointer hover:bg-accent/20">
                          <Upload size={10} /> 업로드
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
                        <span className="text-[9px] text-muted-foreground/60 italic">여기에 이미지 Ctrl+V 붙여넣기 OK</span>
                      </div>
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
                    {/* Notes (마크다운) */}
                    <div className="flex gap-2 text-[11px]">
                      <span className="text-muted-foreground w-12 pt-1">메모</span>
                      <div className="flex-1 border border-border rounded bg-background overflow-hidden">
                        <MarkdownField value={task.note || ''} onChange={v => updateTask(task.id, { note: v })} placeholder="상세 내용 (마크다운 지원)" minHeight={40} />
                      </div>
                    </div>
                    {/* Sub-tasks */}
                    <div className="text-[11px]">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-muted-foreground w-12">하위</span>
                        <input value={newSubText} onChange={e => setNewSubText(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter' && newSubText.trim()) {
                              onTasksChange(addSubTask(tasks, task.id, newSubText.trim()));
                              setNewSubText('');
                            }
                          }}
                          placeholder="서브태스크 입력 후 Enter"
                          className="flex-1 px-2 py-0.5 border border-border rounded text-[11px] bg-background outline-none" />
                      </div>
                      {(task.children || []).map(sub => {
                        const subSt = FRANKLIN_STATUS_CONFIG[sub.status];
                        return (
                          <div key={sub.id} className="flex items-center gap-1.5 pl-2 py-0.5 group/sub">
                            <button onClick={() => onTasksChange(updateSubTask(tasks, task.id, sub.id, { status: cycleStatus(sub.status) }))}
                              className="w-4 h-4 rounded flex items-center justify-center text-[9px] font-bold shrink-0"
                              style={{ background: subSt.bg, color: subSt.color }}>{subSt.icon}</button>
                            <span className="text-[8px] font-bold shrink-0" style={{ color: FRANKLIN_PRIORITY_CONFIG[task.priority].color }}>
                              {task.priority}{task.number}-{sub.number}
                            </span>
                            {/* 드래그 핸들 — 타임테이블 배정용 */}
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
                                className="flex-1 text-[11px] px-1 py-0.5 border border-primary rounded outline-none" />
                            ) : (
                              <span
                                onDoubleClick={e => { e.stopPropagation(); setEditingId(sub.id); }}
                                onMouseDown={e => e.stopPropagation()}
                                draggable={false}
                                onDragStart={e => e.preventDefault()}
                                title="더블클릭→편집"
                                className={`flex-1 text-[11px] cursor-text ${sub.status === 'cancelled' ? 'line-through text-muted-foreground/50' : ''}`}>
                                {sub.task}
                              </span>
                            )}
                            <div className="flex gap-[1px] shrink-0">
                              {[1,2,3,4,5].map(v => (
                                <button key={v} onClick={() => onTasksChange(updateSubTask(tasks, task.id, sub.id, { achievement: sub.achievement === v ? 0 : v }))}
                                  className="w-2.5 h-2.5 rounded-full border-none p-0 cursor-pointer"
                                  style={{ background: (sub.achievement||0) >= v ? ACH_COLORS[v] : '#e2e8f0', opacity: (sub.achievement||0) >= v ? 1 : 0.3 }} />
                              ))}
                            </div>
                            <button onClick={() => onTasksChange(removeSubTask(tasks, task.id, sub.id))}
                              className="text-muted-foreground hover:text-destructive opacity-0 group-hover/sub:opacity-100 text-[9px] shrink-0">✕</button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Forwarded */}
        {tasks.some(t => t.status === 'forwarded') && (
          <div className="px-2 py-1.5 bg-amber-50 border-t border-amber-200 text-[10px] text-amber-700">
            <strong>이월:</strong> {tasks.filter(t => t.status === 'forwarded').map(t => `${t.priority}${t.number} ${t.task}`).join(', ')}
          </div>
        )}
      </div>
    </div>
  );
}
