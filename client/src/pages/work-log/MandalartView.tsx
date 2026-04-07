import { useState, useEffect, useRef, DragEvent } from 'react';
import { ArrowLeft, GripVertical } from 'lucide-react';
import type { MandalartCell, FranklinTask, FranklinPriority, FranklinStatus, MandalartPeriod } from './data';
import { getNextNumber, cycleStatus, FRANKLIN_STATUS_CONFIG, ACH_COLORS, ACH_LABELS } from './data';

interface MandalartViewProps {
  cells: MandalartCell[];
  tasks: FranklinTask[];
  onCellsChange: (cells: MandalartCell[]) => void;
  onTasksChange: (tasks: FranklinTask[]) => void;
  onSlotTitleChange: (index: number, title: string) => void;
  period?: MandalartPeriod;
}

const PERIOD_LABELS: Record<MandalartPeriod, string> = { daily: '오늘 목표', weekly: '이번 주 목표', monthly: '이번 달 목표' };

let cellCounter = 0;
function emptyCell(text = ''): MandalartCell {
  return { id: `mc-${++cellCounter}-${Math.random().toString(36).slice(2,6)}`, text, children: [], achievement: 0 };
}

function createInitialRoot(periodLabel: string): MandalartCell[] {
  return Array.from({length:9}, (_,i) => emptyCell(i===4 ? periodLabel : ''));
}

// ACH_COLORS, ACH_LABELS는 data.tsx에서 import

// 셀 달성률 계산 (하위 셀 평균)
function calcCellAchievement(cell: MandalartCell): number {
  if (!cell.children || cell.children.length === 0) return cell.achievement || 0;
  const filled = cell.children.filter(c => c.text.trim());
  if (filled.length === 0) return cell.achievement || 0;
  const sum = filled.reduce((s, c) => s + (c.achievement || 0), 0);
  return Math.round(sum / filled.length * 10) / 10;
}

// 현재 그리드 기준 달성률 (양: 1~3, 질: 4~5)
export function calcGridAchievement(grid: MandalartCell[]): { filled: number; total: number; yang: number; jil: number; avg: number } {
  const surrounding = grid.filter((_, i) => i !== 4);
  const filled = surrounding.filter(c => c.text.trim());
  const total = filled.length;
  const yang = filled.filter(c => (c.achievement || 0) >= 1).length;
  const jil = filled.filter(c => (c.achievement || 0) >= 4).length;
  const sum = filled.reduce((s, c) => s + (c.achievement || 0), 0);
  const avg = total > 0 ? Math.round(sum / total * 10) / 10 : 0;
  return { filled: filled.length, total, yang, jil, avg };
}

export function MandalartView({ cells, tasks, onCellsChange, onTasksChange, onSlotTitleChange, period = 'daily' }: MandalartViewProps) {
  const [drillId, setDrillId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dragCellId, setDragCellId] = useState<string | null>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (!cells || cells.length < 9) {
      onCellsChange(createInitialRoot(PERIOD_LABELS[period]));
    }
  }, [cells?.length, period]);

  if (!cells || cells.length < 9) {
    return <div style={{padding:20,textAlign:'center',color:'#94a3b8',fontSize:13}}>만다라트 초기화 중...</div>;
  }
  const root = cells;

  const drillCell = drillId ? root.find(c => c.id === drillId) : null;
  const currentGrid = drillCell
    ? [...(drillCell.children || []).slice(0,4), { ...drillCell }, ...(drillCell.children || []).slice(4,8)]
    : root;
  while (currentGrid.length < 9) currentGrid.push(emptyCell());

  const updateCell = (id: string, text: string) => {
    if (drillCell) {
      const newRoot = root.map(c => {
        if (c.id !== drillId) return c;
        if (id === c.id) return { ...c, text };
        const children = [...(c.children || [])];
        const surroundIdx = currentGrid.findIndex(g => g.id === id);
        const childIdx = surroundIdx < 4 ? surroundIdx : surroundIdx - 1;
        if (childIdx >= 0 && childIdx < children.length) {
          children[childIdx] = { ...children[childIdx], text };
        } else {
          while (children.length <= childIdx) children.push(emptyCell());
          children[childIdx] = { ...children[childIdx], text };
        }
        return { ...c, children };
      });
      onCellsChange(newRoot);
    } else {
      onCellsChange(root.map(c => c.id === id ? { ...c, text } : c));
    }
  };

  // 달성률 설정
  const setAchievement = (id: string, value: number) => {
    const updateAch = (c: MandalartCell): MandalartCell => {
      if (c.id === id) return { ...c, achievement: c.achievement === value ? 0 : value };
      if (c.children) return { ...c, children: c.children.map(updateAch) };
      return c;
    };
    onCellsChange(root.map(updateAch));
  };

  // 상태 순환 설정
  const setCellStatus = (id: string) => {
    const updateSt = (c: MandalartCell): MandalartCell => {
      if (c.id === id) return { ...c, status: cycleStatus(c.status || 'pending') };
      if (c.children) return { ...c, children: c.children.map(updateSt) };
      return c;
    };
    onCellsChange(root.map(updateSt));
  };

  const handleDrillDown = (cell: MandalartCell, idx: number) => {
    if (drillId) return;
    if (idx === 4) return;
    if (!cell.text.trim()) return;
    if (!cell.children || cell.children.length === 0) {
      onCellsChange(root.map(c => c.id === cell.id ? { ...c, children: Array.from({length:8}, () => emptyCell()) } : c));
    }
    setDrillId(cell.id);
  };

  const onDragStart = (e: DragEvent, cell: MandalartCell) => {
    if (!cell.text.trim()) return;
    setDragCellId(cell.id);
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('text/plain', cell.text);
  };

  const cellToTask = (cell: MandalartCell) => {
    if (!cell.text.trim()) return;
    if (cell.taskId && tasks.find(t => t.id === cell.taskId)) return;
    const priority: FranklinPriority = 'B';
    const task: FranklinTask = {
      id: `ft-${Date.now()}`, priority, number: getNextNumber(tasks, priority),
      task: cell.text, status: 'pending', important: true, urgent: false,
    };
    onTasksChange([...tasks, task]);
    const linkCell = (c: MandalartCell): MandalartCell => {
      if (c.id === cell.id) return { ...c, taskId: task.id };
      if (c.children) return { ...c, children: c.children.map(linkCell) };
      return c;
    };
    onCellsChange(root.map(linkCell));
  };

  const isCenter = (idx: number) => idx === 4;
  const linkedTask = (cell: MandalartCell) => cell.taskId ? tasks.find(t => t.id === cell.taskId) : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* 헤더 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        {drillId && (
          <button onClick={() => setDrillId(null)} style={{ display:'flex', alignItems:'center', gap:4, padding:'4px 10px', background:'#f1f5f9', border:'1px solid #e2e8f0', borderRadius:6, fontSize:12, cursor:'pointer', color:'#475569' }}>
            <ArrowLeft size={14} /> 상위로
          </button>
        )}
        <span style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>
          {drillId ? `만다라트 — ${drillCell?.text}` : '만다라트'}
        </span>

      </div>

      {/* 메인 레이아웃 */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>

      {/* 미니맵 */}
      {drillId && (
        <div style={{ flexShrink: 0, width: 130 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', marginBottom: 4 }}>메인</div>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 3,
            background: '#f1f5f9', padding: 4, borderRadius: 8, border: '1px solid #e2e8f0',
          }}>
            {root.map((c, i) => {
              const ach = calcCellAchievement(c);
              return (
              <div key={c.id}
                onClick={() => {
                  if (i === 4) { setDrillId(null); return; }
                  if (c.text.trim()) {
                    if (!c.children || c.children.length === 0) {
                      onCellsChange(root.map(r => r.id === c.id ? { ...r, children: Array.from({length:8}, () => emptyCell()) } : r));
                    }
                    setDrillId(c.id); setEditingId(null);
                  }
                }}
                style={{
                  minHeight: 32, padding: '2px 3px', position: 'relative',
                  background: i === 4 ? '#1e293b' : c.id === drillId ? '#3B82F6' : '#fff',
                  borderRadius: 4, fontSize: 9, lineHeight: 1.2,
                  color: i === 4 ? '#fff' : c.id === drillId ? '#fff' : c.text ? '#475569' : '#cbd5e1',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
                  textAlign: 'center', wordBreak: 'break-word',
                  cursor: i === 4 ? 'pointer' : c.text.trim() ? 'pointer' : 'default',
                  border: c.id === drillId ? '2px solid #3B82F6' : '1px solid #e2e8f0',
                  fontWeight: c.id === drillId ? 700 : 400,
                }}>
                <span>{c.text || (i === 4 ? '목표' : '')}</span>
                {i !== 4 && c.text.trim() && ach > 0 && (
                  <span style={{ fontSize:7, color: ach>=4?'#10B981':'#f59e0b', fontWeight:700 }}>{ach}</span>
                )}
              </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3×3 Grid */}
      <div style={{
        flex: 1, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6,
        background: '#f1f5f9', padding: 6, borderRadius: 12, border: '1px solid #e2e8f0',
      }}>
        {currentGrid.map((cell, idx) => {
          const center = isCenter(idx);
          const linked = linkedTask(cell);
          const statusColor = linked
            ? linked.status === 'done' ? '#10B981' : linked.status === 'progress' ? '#3B82F6' : '#94a3b8'
            : undefined;
          const ach = cell.achievement || 0;

          return (
            <div
              key={cell.id}
              draggable={!center && !!cell.text.trim()}
              onDragStart={e => onDragStart(e, cell)}
              onDragEnd={() => setDragCellId(null)}
              onDoubleClick={() => !drillId && cell.text.trim() && handleDrillDown(cell, idx)}
              onClick={() => setEditingId(cell.id)}
              style={{
                position: 'relative', minHeight: 90,
                background: center ? '#1e293b' : dragCellId === cell.id ? '#dbeafe' : '#fff',
                borderRadius: 8,
                border: `2px solid ${center ? '#1e293b' : linked ? statusColor : '#e2e8f0'}`,
                display: 'flex', flexDirection: 'column',
                cursor: center ? 'text' : cell.text.trim() ? (drillId ? 'grab' : 'pointer') : 'text',
                transition: 'all 0.15s', overflow: 'hidden',
              }}
            >
              {linked && <div style={{ height: 3, background: statusColor, width: '100%' }} />}
              {!center && cell.text.trim() && (
                <div style={{ position: 'absolute', top: 4, right: 4, opacity: 0.3 }}><GripVertical size={12} /></div>
              )}

              {/* 텍스트 */}
              {editingId === cell.id ? (
                <textarea autoFocus value={cell.text}
                  onChange={e => updateCell(cell.id, e.target.value)}
                  onBlur={() => setEditingId(null)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); setEditingId(null); } }}
                  style={{ flex: 1, width: '100%', padding: '6px 8px', border: 'none', outline: 'none',
                    fontSize: center ? 13 : 11, fontWeight: center ? 700 : 400,
                    color: center ? '#fff' : '#1e293b', background: 'transparent',
                    resize: 'none', fontFamily: 'inherit', lineHeight: 1.4 }}
                />
              ) : (
                <div style={{ flex: 1, padding: '6px 8px',
                  fontSize: center ? 13 : 11, fontWeight: center ? 700 : 400,
                  color: center ? '#fff' : cell.text ? '#1e293b' : '#cbd5e1',
                  lineHeight: 1.4, wordBreak: 'break-word',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                  {cell.text || (center ? PERIOD_LABELS[period] : '+')}
                </div>
              )}

              {/* 상태 + 달성률 (center 제외, 텍스트 있을 때) */}
              {!center && cell.text.trim() && (
                <div style={{ padding: '0 4px 3px', display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {/* 상태 + 달성률 한 줄 */}
                  <div style={{ display: 'flex', gap: 3, alignItems: 'center', justifyContent: 'center' }} onClick={e => e.stopPropagation()}>
                    {/* 상태 아이콘 */}
                    {(() => {
                      const st = FRANKLIN_STATUS_CONFIG[cell.status || 'pending'];
                      return (
                        <button onClick={() => setCellStatus(cell.id)}
                          title={st.label}
                          style={{ width: 16, height: 16, borderRadius: 4, border: 'none', cursor: 'pointer', padding: 0,
                            background: st.bg, color: st.color, fontSize: 10, fontWeight: 700, lineHeight: 1,
                            display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {st.icon}
                        </button>
                      );
                    })()}
                    {/* 달성률 점 */}
                    {[1,2,3,4,5].map(v => (
                      <button key={v} onClick={() => setAchievement(cell.id, v)}
                        title={ACH_LABELS[v]}
                        style={{
                          width: 12, height: 12, borderRadius: '50%', border: 'none', cursor: 'pointer', padding: 0,
                          background: ach >= v ? ACH_COLORS[v] : '#e2e8f0',
                          opacity: ach >= v ? 1 : 0.4,
                          transition: 'all 0.15s',
                        }}
                      />
                    ))}
                  </div>
                  {/* 하위 진행 현황 */}
                  {!drillId && cell.children && cell.children.length > 0 && (() => {
                    const subs = cell.children.filter(c => c.text.trim());
                    if (subs.length === 0) return null;
                    const subYang = subs.filter(c => (c.achievement || 0) >= 1).length;
                    const subJil = subs.filter(c => (c.achievement || 0) >= 4).length;
                    return (
                      <div style={{ display:'flex', alignItems:'center', gap:3, paddingTop:1 }}>
                        <div style={{ flex:1, height:3, background:'#e2e8f0', borderRadius:2, overflow:'hidden', position:'relative' }}>
                          <div style={{ width:`${Math.round(subYang/subs.length*100)}%`, height:'100%', background:'#f59e0b', borderRadius:2, position:'absolute', left:0 }} />
                          <div style={{ width:`${Math.round(subJil/subs.length*100)}%`, height:'100%', background:'#10B981', borderRadius:2, position:'absolute', left:0 }} />
                        </div>
                        <span style={{ fontSize:8, color:'#94a3b8', whiteSpace:'nowrap' }}>{subJil}/{subs.length}</span>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          );
        })}
      </div>

      </div>

      {/* 안내 */}
      {!drillId && (
        <div style={{ fontSize: 10, color: '#94a3b8', textAlign: 'center' }}>
          셀 클릭→편집 | 더블클릭→하위 분해 | ●●●(양)●●(질) 달성률 | 드래그→타임테이블
        </div>
      )}
    </div>
  );
}
