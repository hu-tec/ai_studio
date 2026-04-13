import { useState, useEffect, useRef, DragEvent } from 'react';
import { ArrowLeft, GripVertical, FileText } from 'lucide-react';
import type { MandalartCell, Task, FranklinPriority, FranklinStatus, MandalartPeriod, MandalartSize, MandalartTypeConfig } from './data';
import { getNextNumber, cycleStatus, FRANKLIN_STATUS_CONFIG, FRANKLIN_PRIORITY_CONFIG, ACH_COLORS, ACH_LABELS, mandalartCellCount, mandalartCenterIdx, mandalartChildCount } from './data';

interface MandalartViewProps {
  cells: MandalartCell[];
  tasks: Task[];
  onCellsChange: (cells: MandalartCell[]) => void;
  onTasksChange: (tasks: Task[]) => void;
  onSlotTitleChange: (index: number, title: string) => void;
  period?: MandalartPeriod;
  size?: MandalartSize;
  types?: MandalartTypeConfig[];
  activeTypeId?: string;
  onActiveTypeChange?: (id: string) => void;
  onSizeChange?: (size: MandalartSize) => void;
  syncTasks?: boolean; // 업무일지 타입만 true
}

const PERIOD_LABELS: Record<MandalartPeriod, string> = { daily: '오늘 목표', weekly: '이번 주 목표', monthly: '이번 달 목표' };

let cellCounter = 0;
function emptyCell(text = ''): MandalartCell {
  return { id: `mc-${++cellCounter}-${Math.random().toString(36).slice(2,6)}`, text, children: [], achievement: 0 };
}

function createInitialRoot(size: MandalartSize): MandalartCell[] {
  return Array.from({length: mandalartCellCount(size)}, () => emptyCell(''));
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
export function calcGridAchievement(grid: MandalartCell[], centerIdx = 4): { filled: number; total: number; yang: number; jil: number; avg: number } {
  const surrounding = grid.filter((_, i) => i !== centerIdx);
  const filled = surrounding.filter(c => c.text.trim());
  const total = filled.length;
  const yang = filled.filter(c => (c.achievement || 0) >= 1).length;
  const jil = filled.filter(c => (c.achievement || 0) >= 4).length;
  const sum = filled.reduce((s, c) => s + (c.achievement || 0), 0);
  const avg = total > 0 ? Math.round(sum / total * 10) / 10 : 0;
  return { filled: filled.length, total, yang, jil, avg };
}

export function MandalartView({ cells, tasks, onCellsChange, onTasksChange, onSlotTitleChange, period = 'daily', size = 3, types, activeTypeId, onActiveTypeChange, onSizeChange, syncTasks = true }: MandalartViewProps) {
  const [drillId, setDrillId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dragCellId, setDragCellId] = useState<string | null>(null);
  const [expand9x9, setExpand9x9] = useState(false);
  const initialized = useRef(false);

  const cellCount = mandalartCellCount(size);
  const centerIdx = mandalartCenterIdx(size);
  const childCount = mandalartChildCount(size);
  const hasCenter = centerIdx >= 0;

  useEffect(() => {
    if (!cells || cells.length < cellCount) {
      onCellsChange(createInitialRoot(size));
    }
  }, [cells?.length, period, size, cellCount]);

  // drill-down 타겟 셀이 외부에서 비워졌거나(태스크 삭제 등) 사라진 경우 자동 상위 이동
  useEffect(() => {
    if (!drillId) return;
    const target = cells?.find(c => c.id === drillId);
    if (!target || !target.text?.trim()) {
      setDrillId(null);
      setEditingId(null);
    }
  }, [cells, drillId]);

  if (!cells || cells.length < cellCount) {
    return <div style={{padding:20,textAlign:'center',color:'#94a3b8',fontSize:13}}>만다라트 초기화 중...</div>;
  }
  const root = cells;

  const drillCell = drillId ? root.find(c => c.id === drillId) : null;
  // drill-down 그리드 구성: 홀수 N → 센터에 부모 삽입; 짝수 N → 그냥 children
  const currentGrid = drillCell
    ? hasCenter
      ? [...(drillCell.children || []).slice(0, centerIdx), { ...drillCell }, ...(drillCell.children || []).slice(centerIdx, childCount)]
      : [...(drillCell.children || [])]
    : root;
  while (currentGrid.length < cellCount) currentGrid.push(emptyCell());

  const updateCell = (id: string, text: string) => {
    if (drillCell) {
      const newRoot = root.map(c => {
        if (c.id !== drillId) return c;
        if (id === c.id) return { ...c, text };
        const children = [...(c.children || [])];
        const surroundIdx = currentGrid.findIndex(g => g.id === id);
        // 짝수 N: currentGrid === children 그대로. 홀수 N: 센터 뒤 인덱스는 -1
        const childIdx = hasCenter
          ? (surroundIdx < centerIdx ? surroundIdx : surroundIdx - 1)
          : surroundIdx;
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
    if (hasCenter && idx === centerIdx) return;
    if (!cell.text.trim()) return;
    if (!cell.children || cell.children.length === 0) {
      onCellsChange(root.map(c => c.id === cell.id ? { ...c, children: Array.from({length: childCount}, () => emptyCell()) } : c));
    }
    setDrillId(cell.id);
  };

  // 9×9 전체 뷰용: 특정 parent cell의 childIdx번째 자식 text 변경
  const writeChildCell = (parentIdx: number, childIdx: number, text: string) => {
    onCellsChange(root.map((c, i) => {
      if (i !== parentIdx) return c;
      const children = [...(c.children || [])];
      while (children.length < 8) children.push(emptyCell());
      children[childIdx] = { ...children[childIdx], text };
      return { ...c, children };
    }));
  };
  // 9×9 전체 뷰용: 루트 셀 text 변경
  const writeRootCell = (idx: number, text: string) => {
    onCellsChange(root.map((c, i) => i === idx ? { ...c, text } : c));
  };

  const onDragStart = (e: DragEvent, cell: MandalartCell) => {
    if (!cell.text.trim()) return;
    setDragCellId(cell.id);
    e.dataTransfer.effectAllowed = 'copyMove';
    // 태스크 ID가 있으면 ID로, 없으면 텍스트로 전달
    e.dataTransfer.setData('text/plain', cell.taskId || cell.text);
  };

  const cellToTask = (cell: MandalartCell) => {
    if (!cell.text.trim()) return;
    if (cell.taskId && tasks.find(t => t.id === cell.taskId)) return;
    const priority: FranklinPriority = 'B';
    const task: Task = {
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

  const isCenter = (idx: number) => hasCenter && idx === centerIdx;
  const linkedTask = (cell: MandalartCell): Task | null => {
    if (!cell.taskId) return null;
    // top-level 검색
    const top = tasks.find(t => t.id === cell.taskId);
    if (top) return top;
    // 서브태스크(children) 검색
    for (const t of tasks) {
      const sub = t.children?.find(c => c.id === cell.taskId);
      if (sub) return sub;
    }
    return null;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* 헤더 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        {drillId && !expand9x9 && (
          <button onClick={() => setDrillId(null)} style={{ display:'flex', alignItems:'center', gap:4, padding:'4px 10px', background:'#f1f5f9', border:'1px solid #e2e8f0', borderRadius:6, fontSize:12, cursor:'pointer', color:'#475569' }}>
            <ArrowLeft size={14} /> 상위로
          </button>
        )}
        <span style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>
          {expand9x9 ? `만다라트 — ${size * size}×${size * size} 전체` : drillId ? `만다라트 — ${drillCell?.text}` : '만다라트'}
        </span>
        <button onClick={() => { setExpand9x9(v => !v); setDrillId(null); setEditingId(null); }}
          style={{ padding:'3px 8px', borderRadius:6, border:'1px solid #e2e8f0', fontSize:10, cursor:'pointer',
                   background: expand9x9 ? '#eff6ff' : '#fff', color: expand9x9 ? '#3B82F6' : '#94a3b8' }}>
          {expand9x9 ? '상세접기' : '상세펼치기'}
        </button>
        {/* 타입 탭 (업무일지/규정/미팅 등) — 업무일지만 타임테이블 동기화 */}
        {types && activeTypeId && onActiveTypeChange && (
          <div style={{ display: 'flex', gap: 2, marginLeft: 'auto' }}>
            {types.map(t => (
              <button key={t.id} onClick={() => onActiveTypeChange(t.id)}
                title={t.id === 'worklog' ? '업무일지 만다라트만 타임테이블에 배정 가능' : ''}
                style={{
                  padding: '3px 8px', borderRadius: 12, border: '1px solid',
                  borderColor: activeTypeId === t.id ? '#3B82F6' : '#e2e8f0',
                  background: activeTypeId === t.id ? '#3B82F6' : '#fff',
                  color: activeTypeId === t.id ? '#fff' : '#64748b',
                  fontSize: 10, fontWeight: 600, cursor: 'pointer',
                }}>
                {t.label}{t.id === 'worklog' ? ' ⏱' : ''}
              </button>
            ))}
          </div>
        )}
        {/* 크기 선택: 3×3 / 4×4 / 5×5 */}
        {onSizeChange && (
          <div style={{ display: 'flex', gap: 2 }}>
            {([3, 4, 5] as const).map(s => (
              <button key={s} onClick={() => { onSizeChange(s); setDrillId(null); setExpand9x9(false); }}
                style={{
                  padding: '3px 6px', borderRadius: 4, border: '1px solid',
                  borderColor: size === s ? '#1e293b' : '#e2e8f0',
                  background: size === s ? '#1e293b' : '#fff',
                  color: size === s ? '#fff' : '#64748b',
                  fontSize: 10, fontWeight: 700, cursor: 'pointer',
                }}>
                {s}×{s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* N²×N² 전체 펼치기 뷰: 루트 N×N × 각 셀의 N×N children */}
      {expand9x9 ? (
        <div style={{
          display: 'grid', gridTemplateColumns: `repeat(${size}, 1fr)`, gap: 6,
          background: '#f1f5f9', padding: 6, borderRadius: 12, border: '1px solid #e2e8f0',
        }}>
          {root.map((parentCell, pIdx) => {
            const isRootCenter = hasCenter && pIdx === centerIdx;
            // 루트 센터 = 전체 목표 — 큰 단일 셀
            if (isRootCenter) {
              const isEditing = editingId === parentCell.id;
              return (
                <div key={parentCell.id}
                  onClick={() => setEditingId(parentCell.id)}
                  style={{
                    background: '#1e293b', borderRadius: 8, border: '2px solid #1e293b',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    minHeight: 130, padding: 8, cursor: 'text',
                  }}>
                  {isEditing ? (
                    <textarea autoFocus value={parentCell.text}
                      onChange={e => writeRootCell(pIdx, e.target.value)}
                      onBlur={() => setEditingId(null)}
                      onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); setEditingId(null); } }}
                      style={{ width:'100%', border:'none', outline:'none', background:'transparent',
                        color:'#fff', fontSize:14, fontWeight:700, textAlign:'center', resize:'none',
                        fontFamily:'inherit', lineHeight:1.4 }} />
                  ) : (
                    <span style={{ color:'#fff', fontSize:14, fontWeight:700, textAlign:'center', wordBreak:'break-word' }}>
                      {parentCell.text || PERIOD_LABELS[period]}
                    </span>
                  )}
                </div>
              );
            }
            const children = parentCell.children || [];
            return (
              <div key={parentCell.id} style={{
                border: '2px solid #cbd5e1', borderRadius: 6, padding: 3, background: '#fff',
              }}>
                {/* 짝수 N: 서브그리드 위에 부모 라벨 바 */}
                {!hasCenter && (
                  <div onClick={e => { e.stopPropagation(); setEditingId(parentCell.id); }}
                    style={{ background: '#475569', borderRadius: 3, padding: '2px 4px', marginBottom: 3, minHeight: 18, cursor: 'text' }}>
                    {editingId === parentCell.id ? (
                      <textarea autoFocus value={parentCell.text}
                        onChange={e => writeRootCell(pIdx, e.target.value)}
                        onBlur={() => setEditingId(null)}
                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); setEditingId(null); } }}
                        style={{ width:'100%', border:'none', outline:'none', background:'transparent',
                          color:'#fff', fontSize:9, fontWeight:700, textAlign:'center', resize:'none',
                          fontFamily:'inherit', lineHeight:1.2 }} />
                    ) : (
                      <span style={{ color:'#fff', fontSize:9, fontWeight:700, textAlign:'center', wordBreak:'break-word', lineHeight:1.2, display: 'block' }}>
                        {parentCell.text || '+'}
                      </span>
                    )}
                  </div>
                )}
                <div style={{ display:'grid', gridTemplateColumns: `repeat(${size}, 1fr)`, gap: 2 }}>
                  {Array.from({length: cellCount}, (_, sIdx) => {
                    // 홀수 N: 서브그리드 센터(sIdx===centerIdx) = 부모 셀 자체 (레이블)
                    if (hasCenter && sIdx === centerIdx) {
                      const isEditing = editingId === parentCell.id;
                      return (
                        <div key={`p-${pIdx}-c-${sIdx}`}
                          onClick={e => { e.stopPropagation(); setEditingId(parentCell.id); }}
                          style={{
                            background: '#475569', borderRadius: 3, padding: 2,
                            minHeight: 34, display:'flex', alignItems:'center', justifyContent:'center',
                            cursor: 'text', overflow: 'hidden',
                          }}>
                          {isEditing ? (
                            <textarea autoFocus value={parentCell.text}
                              onChange={e => writeRootCell(pIdx, e.target.value)}
                              onBlur={() => setEditingId(null)}
                              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); setEditingId(null); } }}
                              style={{ width:'100%', border:'none', outline:'none', background:'transparent',
                                color:'#fff', fontSize:9, fontWeight:700, textAlign:'center', resize:'none',
                                fontFamily:'inherit', lineHeight:1.2 }} />
                          ) : (
                            <span style={{ color:'#fff', fontSize:9, fontWeight:700, textAlign:'center', wordBreak:'break-word', lineHeight:1.2 }}>
                              {parentCell.text || '+'}
                            </span>
                          )}
                        </div>
                      );
                    }
                    // 서브셀: childIdx 매핑 (홀수 N은 센터 건너뛰기, 짝수 N은 1:1)
                    const childIdx = hasCenter
                      ? (sIdx < centerIdx ? sIdx : sIdx - 1)
                      : sIdx;
                    const childCell = children[childIdx] || emptyCell();
                    const linked = linkedTask(childCell);
                    const statusColor = linked
                      ? linked.status === 'done' ? '#10B981' : linked.status === 'progress' ? '#3B82F6' : '#94a3b8'
                      : undefined;
                    const isEditing = editingId === childCell.id;
                    return (
                      <div key={`p-${pIdx}-c-${sIdx}`}
                        draggable={!!childCell.text.trim()}
                        onDragStart={e => onDragStart(e, childCell)}
                        onDragEnd={() => setDragCellId(null)}
                        onClick={e => { e.stopPropagation(); setEditingId(childCell.id); }}
                        style={{
                          background: dragCellId === childCell.id ? '#dbeafe' : '#fff',
                          border: `1px solid ${linked ? statusColor : '#e2e8f0'}`,
                          borderRadius: 3, padding: 2,
                          minHeight: 34, display:'flex', alignItems:'center', justifyContent:'center',
                          cursor: childCell.text.trim() ? 'grab' : 'text', overflow: 'hidden',
                        }}>
                        {isEditing ? (
                          <textarea autoFocus value={childCell.text}
                            onChange={e => writeChildCell(pIdx, childIdx, e.target.value)}
                            onBlur={() => setEditingId(null)}
                            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); setEditingId(null); } }}
                            style={{ width:'100%', border:'none', outline:'none', background:'transparent',
                              color:'#1e293b', fontSize:9, textAlign:'center', resize:'none',
                              fontFamily:'inherit', lineHeight:1.2 }} />
                        ) : (
                          <span style={{ fontSize:9, color: childCell.text ? '#1e293b' : '#cbd5e1', textAlign:'center', wordBreak:'break-word', lineHeight:1.2 }}>
                            {childCell.text || '+'}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
      <>
      {/* 메인 레이아웃 */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>

      {/* 미니맵 */}
      {drillId && (
        <div style={{ flexShrink: 0, width: 130 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', marginBottom: 4 }}>메인</div>
          <div style={{
            display: 'grid', gridTemplateColumns: `repeat(${size}, 1fr)`, gap: 3,
            background: '#f1f5f9', padding: 4, borderRadius: 8, border: '1px solid #e2e8f0',
          }}>
            {root.map((c, i) => {
              const ach = calcCellAchievement(c);
              return (
              <div key={c.id}
                onClick={() => {
                  if (hasCenter && i === centerIdx) { setDrillId(null); return; }
                  if (c.text.trim()) {
                    if (!c.children || c.children.length === 0) {
                      onCellsChange(root.map(r => r.id === c.id ? { ...r, children: Array.from({length: childCount}, () => emptyCell()) } : r));
                    }
                    setDrillId(c.id); setEditingId(null);
                  }
                }}
                style={{
                  minHeight: 32, padding: '2px 3px', position: 'relative',
                  background: isCenter(i) ? '#1e293b' : c.id === drillId ? '#3B82F6' : '#fff',
                  borderRadius: 4, fontSize: 9, lineHeight: 1.2,
                  color: isCenter(i) ? '#fff' : c.id === drillId ? '#fff' : c.text ? '#475569' : '#cbd5e1',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
                  textAlign: 'center', wordBreak: 'break-word',
                  cursor: isCenter(i) ? 'pointer' : c.text.trim() ? 'pointer' : 'default',
                  border: c.id === drillId ? '2px solid #3B82F6' : '1px solid #e2e8f0',
                  fontWeight: c.id === drillId ? 700 : 400,
                }}>
                <span>{c.text || (isCenter(i) ? '목표' : '')}</span>
                {!isCenter(i) && c.text.trim() && ach > 0 && (
                  <span style={{ fontSize:7, color: ach>=4?'#10B981':'#f59e0b', fontWeight:700 }}>{ach}</span>
                )}
              </div>
              );
            })}
          </div>
        </div>
      )}

      {/* N×N Grid */}
      <div style={{
        flex: 1, display: 'grid', gridTemplateColumns: `repeat(${size}, 1fr)`, gap: 6,
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
      </>
      )}
    </div>
  );
}
