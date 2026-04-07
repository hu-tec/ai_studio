import { useState, useEffect, useRef, DragEvent } from 'react';
import { ArrowLeft, GripVertical, BarChart3 } from 'lucide-react';
import type { MandalartCell, FranklinTask, FranklinPriority, MandalartPeriod } from './data';
import { getNextNumber } from './data';

interface MandalartViewProps {
  cells: MandalartCell[];
  tasks: FranklinTask[];
  onCellsChange: (cells: MandalartCell[]) => void;
  onTasksChange: (tasks: FranklinTask[]) => void;
  onSlotTitleChange: (index: number, title: string) => void;
}

let cellCounter = 0;
function emptyCell(text = ''): MandalartCell {
  return { id: `mc-${++cellCounter}-${Math.random().toString(36).slice(2,6)}`, text, children: [], achievement: 0 };
}

function createInitialRoot(): MandalartCell[] {
  return Array.from({length:9}, (_,i) => emptyCell(i===4 ? '오늘 목표' : ''));
}

// 달성률 색상
const ACH_COLORS = ['#e2e8f0','#f59e0b','#f59e0b','#f59e0b','#10B981','#10B981']; // 0=미설정, 1~3=양(주황), 4~5=질(초록)
const ACH_LABELS = ['','1(양)','2(양)','3(양)','4(질)','5(질)'];

// 셀 달성률 계산 (하위 셀 평균)
function calcCellAchievement(cell: MandalartCell): number {
  if (!cell.children || cell.children.length === 0) return cell.achievement || 0;
  const filled = cell.children.filter(c => c.text.trim());
  if (filled.length === 0) return cell.achievement || 0;
  const sum = filled.reduce((s, c) => s + (c.achievement || 0), 0);
  return Math.round(sum / filled.length * 10) / 10;
}

// 현재 그리드 기준 달성률 (양: 1~3, 질: 4~5)
function calcGridAchievement(grid: MandalartCell[]): { filled: number; total: number; yang: number; jil: number; avg: number } {
  const surrounding = grid.filter((_, i) => i !== 4);
  const filled = surrounding.filter(c => c.text.trim());
  const total = filled.length;
  const yang = filled.filter(c => { const a = c.achievement || 0; return a >= 1 && a <= 3; }).length;
  const jil = filled.filter(c => (c.achievement || 0) >= 4).length;
  const sum = filled.reduce((s, c) => s + (c.achievement || 0), 0);
  const avg = total > 0 ? Math.round(sum / total * 10) / 10 : 0;
  return { filled, total, yang, jil, avg };
}

export function MandalartView({ cells, tasks, onCellsChange, onTasksChange, onSlotTitleChange }: MandalartViewProps) {
  const [drillId, setDrillId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dragCellId, setDragCellId] = useState<string | null>(null);
  const [period, setPeriod] = useState<MandalartPeriod>('daily');
  const [showStats, setShowStats] = useState(false);
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current && (!cells || cells.length < 9)) {
      initialized.current = true;
      onCellsChange(createInitialRoot());
    }
  }, []);

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
  const stats = calcGridAchievement(currentGrid);

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

        {/* 기간 탭 */}
        <div style={{ display: 'flex', gap: 2, marginLeft: 'auto' }}>
          {([['daily','일간'],['weekly','주간'],['monthly','월간']] as const).map(([key, label]) => (
            <button key={key} onClick={() => setPeriod(key)}
              style={{ padding:'3px 10px', borderRadius:12, border:'1px solid', fontSize:11, cursor:'pointer',
                borderColor: period===key?'#3B82F6':'#e2e8f0', background: period===key?'#EFF6FF':'#fff', color: period===key?'#3B82F6':'#94a3b8', fontWeight: period===key?600:400 }}>
              {label}
            </button>
          ))}
          <button onClick={() => setShowStats(!showStats)}
            style={{ padding:'3px 8px', borderRadius:12, border:'1px solid', fontSize:11, cursor:'pointer',
              borderColor: showStats?'#10B981':'#e2e8f0', background: showStats?'#ecfdf5':'#fff', color: showStats?'#10B981':'#94a3b8' }}>
            <BarChart3 size={12} />
          </button>
        </div>
      </div>

      {/* 달성률 요약 바 */}
      <div style={{ display:'flex', alignItems:'center', gap:6, padding:'4px 8px', background:'#f8fafc', borderRadius:6, border:'1px solid #e2e8f0' }}>
        <span style={{ fontSize:10, color:'#64748b', fontWeight:600 }}>달성</span>
        <div style={{ flex:1, height:6, background:'#e2e8f0', borderRadius:3, overflow:'hidden', position:'relative' }}>
          <div style={{ width:`${stats.total>0?Math.round((stats.yang+stats.jil)/stats.total*100):0}%`, height:'100%', background:'#f59e0b', borderRadius:3, transition:'width 0.3s', position:'absolute', left:0, top:0 }} />
          <div style={{ width:`${stats.total>0?Math.round(stats.jil/stats.total*100):0}%`, height:'100%', background:'#10B981', borderRadius:3, transition:'width 0.3s', position:'absolute', left:0, top:0 }} />
        </div>
        <span style={{ fontSize:10, color:'#f59e0b', fontWeight:700 }}>양{stats.yang}</span>
        <span style={{ fontSize:10, color:'#10B981', fontWeight:700 }}>질{stats.jil}</span>
        <span style={{ fontSize:10, color:'#94a3b8' }}>/{stats.total}</span>
      </div>

      {/* 통계 패널 */}
      {showStats && (
        <div style={{ padding:'6px 8px', background:'#fff', borderRadius:6, border:'1px solid #e2e8f0', fontSize:11 }}>
          <div style={{ fontWeight:600, color:'#1e293b', marginBottom:4, fontSize:11 }}>
            {period==='daily'?'오늘':period==='weekly'?'이번 주':'이번 달'} 통계 {drillId ? `— ${drillCell?.text}` : '(전체)'}
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:4 }}>
            <StatCard label="작성" value={`${stats.filled}`} sub="/8" color="#3B82F6" />
            <StatCard label="양(1~3)" value={`${stats.yang}`} sub={`/${stats.total}`} color="#f59e0b" />
            <StatCard label="질(4~5)" value={`${stats.jil}`} sub={`/${stats.total}`} color="#10B981" />
            <StatCard label="달성률" value={`${stats.total>0?Math.round((stats.yang+stats.jil)/stats.total*100):0}`} sub="%" color={stats.jil>=stats.total&&stats.total>0?'#10B981':'#f59e0b'} />
          </div>
          {/* 항목별 달성률 */}
          <div style={{ marginTop:6, display:'flex', flexDirection:'column', gap:2 }}>
            {currentGrid.filter((_,i)=>i!==4).filter(c=>c.text.trim()).map(c => {
              const ach = c.achievement || 0;
              const pct = Math.round((ach/5)*100);
              return (
                <div key={c.id} style={{ display:'flex', alignItems:'center', gap:6 }}>
                  <span style={{ fontSize:10, color:'#475569', minWidth:70, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.text}</span>
                  <div style={{ flex:1, height:5, background:'#f1f5f9', borderRadius:3, overflow:'hidden' }}>
                    <div style={{ width:`${pct}%`, height:'100%', background: ach>=4?'#10B981':ach>=1?'#f59e0b':'#e2e8f0', borderRadius:3 }} />
                  </div>
                  <span style={{ fontSize:9, color: ach>=4?'#10B981':ach>=1?'#f59e0b':'#94a3b8', fontWeight:600, minWidth:20 }}>{ach>0?ACH_LABELS[ach]:'-'}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

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
                  {cell.text || (center ? '목표 입력' : '+')}
                </div>
              )}

              {/* 달성률 1~5 버튼 (center 제외, 텍스트 있을 때) */}
              {!center && cell.text.trim() && (
                <div style={{ padding: '0 4px 3px', display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {/* 달성률 점 */}
                  <div style={{ display: 'flex', gap: 2, justifyContent: 'center' }} onClick={e => e.stopPropagation()}>
                    {[1,2,3,4,5].map(v => (
                      <button key={v} onClick={() => setAchievement(cell.id, v)}
                        title={ACH_LABELS[v]}
                        style={{
                          width: 14, height: 14, borderRadius: '50%', border: 'none', cursor: 'pointer', padding: 0,
                          background: ach >= v ? ACH_COLORS[v] : '#e2e8f0',
                          opacity: ach >= v ? 1 : 0.4,
                          transition: 'all 0.15s',
                        }}
                      />
                    ))}
                  </div>
                  {/* 하위 카운트 */}
                  {!drillId && (cell.children?.filter(c=>c.text).length || 0) > 0 && (
                    <div style={{ fontSize: 9, paddingTop: 1 }}>
                      <span style={{ color: '#3B82F6' }}>▦ {cell.children?.filter(c=>c.text).length || 0}</span>
                    </div>
                  )}
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

function StatCard({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  return (
    <div style={{ padding: '4px 6px', background: '#f8fafc', borderRadius: 4, textAlign: 'center' }}>
      <div style={{ fontSize: 14, fontWeight: 700, color, lineHeight: 1.2 }}>{value}<span style={{ fontSize: 10, color: '#94a3b8' }}>{sub}</span></div>
      <div style={{ fontSize: 9, color: '#64748b' }}>{label}</div>
    </div>
  );
}
