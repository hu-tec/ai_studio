import { useState, useEffect, useRef, DragEvent } from 'react';
import { ArrowLeft, GripVertical, FileText, Palette, Maximize2, Minimize2 } from 'lucide-react';
import type { MandalartCell, Task, FranklinPriority, FranklinStatus, MandalartPeriod, MandalartSize, MandalartTypeConfig } from './data';
import { getNextNumber, cycleStatus, FRANKLIN_STATUS_CONFIG, FRANKLIN_PRIORITY_CONFIG, ACH_COLORS, ACH_LABELS, mandalartCellCount, mandalartCenterIdx, mandalartChildCount, MANDALART_COLOR_PALETTE, MANDALART_DIMS, mandalartColor, WORKLOG_MANDALART_ID } from './data';

const DEFAULT_SIZE: MandalartSize = { rows: 3, cols: 3 };

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
  onTypesChange?: (types: MandalartTypeConfig[]) => void; // 타입 CRUD (add/rename/delete)
  onSizeChange?: (size: MandalartSize) => void;
  syncTasks?: boolean; // 업무일지 타입만 true
}

const PERIOD_LABELS: Record<MandalartPeriod, string> = { daily: '오늘 목표', weekly: '이번 주 목표', monthly: '이번 달 목표' };

let cellCounter = 0;
function emptyCell(text = ''): MandalartCell {
  return { id: `mc-${++cellCounter}-${Math.random().toString(36).slice(2,6)}`, text, children: [], achievement: 0 };
}

// 안정 id placeholder — 같은 (parentId, idx) 조합은 항상 동일 id 반환 (React key + editingId 유지용)
function placeholderCell(parentId: string, idx: number): MandalartCell {
  return { id: `${parentId}-c${idx}`, text: '', children: [], achievement: 0 };
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

export function MandalartView({ cells, tasks, onCellsChange, onTasksChange, onSlotTitleChange, period = 'daily', size = DEFAULT_SIZE, types, activeTypeId, onActiveTypeChange, onTypesChange, onSizeChange, syncTasks = true }: MandalartViewProps) {
  const [editingTypeId, setEditingTypeId] = useState<string | null>(null);
  const [editingTypeLabel, setEditingTypeLabel] = useState('');
  const [drillId, setDrillId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dragCellId, setDragCellId] = useState<string | null>(null);
  const [expand9x9, setExpand9x9] = useState(false);
  const [colorPickerId, setColorPickerId] = useState<string | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const initialized = useRef(false);

  const { rows, cols } = size;
  const cellCount = mandalartCellCount(size);
  const centerIdx = mandalartCenterIdx(size);
  const childCount = mandalartChildCount(size);
  const hasCenter = centerIdx >= 0;
  // 전체 펼침 허용 (부모×자식 규모 제한)
  const allowExpand = cellCount <= 25;
  // 셀당 최대 픽셀 크기 (정사각형 유지 + 가로 제한)
  // 열 수가 많을수록 셀 축소 → 텍스트 가독성 유지
  const MAX_CELL_PX = cols >= 7 ? 78 : cols >= 5 ? 92 : 110;
  const GRID_GAP = 6;
  const GRID_PAD = 6;
  // 그리드 총 너비 상한 = cols * cell + gap * (cols-1) + padding * 2
  const mainGridMaxWidth = cols * MAX_CELL_PX + (cols - 1) * GRID_GAP + GRID_PAD * 2;
  // 폰트 크기 — 열 수 기반 스케일
  const CENTER_FONT = cols >= 7 ? 12 : cols >= 5 ? 13 : 15;
  const CELL_FONT = cols >= 7 ? 10 : cols >= 5 ? 11 : 13;

  useEffect(() => {
    // 길이 불일치(크기 변경 포함) → 기존 셀 앞에서부터 보존하며 길이 맞춤
    if (!cells || cells.length !== cellCount) {
      const padded: MandalartCell[] = Array.from({length: cellCount}, (_, i) => cells?.[i] || emptyCell(''));
      onCellsChange(padded);
    }
  }, [cells?.length, period, size.rows, size.cols, cellCount]);

  // drill-down 타겟 셀이 외부에서 비워졌거나(태스크 삭제 등) 사라진 경우 자동 상위 이동
  useEffect(() => {
    if (!drillId) return;
    const target = cells?.find(c => c.id === drillId);
    if (!target || !target.text?.trim()) {
      setDrillId(null);
      setEditingId(null);
    }
  }, [cells, drillId]);

  if (!cells || cells.length !== cellCount) {
    return <div style={{padding:20,textAlign:'center',color:'#94a3b8',fontSize:13}}>만다라트 초기화 중...</div>;
  }
  const root = cells;

  const drillCell = drillId ? root.find(c => c.id === drillId) : null;
  // drill 시 자식 배열을 현재 size 의 childCount 에 맞게 pad/truncate (표시용, 안정 id)
  const drilledChildren: MandalartCell[] = drillCell
    ? Array.from({length: childCount}, (_, i) => drillCell.children?.[i] || placeholderCell(drillCell.id, i))
    : [];
  // drill-down 그리드 구성: 홀수 N → 센터에 부모 삽입; 짝수 N → 그냥 children
  const currentGrid: MandalartCell[] = drillCell
    ? hasCenter
      ? [...drilledChildren.slice(0, centerIdx), { ...drillCell }, ...drilledChildren.slice(centerIdx, childCount)]
      : drilledChildren
    : root;
  // 방어: length 가 cellCount 를 초과하면 잘라냄 (크기 축소 직후 transient 상태 대비)
  while (currentGrid.length < cellCount) currentGrid.push(emptyCell());
  if (currentGrid.length > cellCount) currentGrid.length = cellCount;

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
          while (children.length <= childIdx) children.push(placeholderCell(c.id, children.length));
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

  // 색상 설정: 루트 셀에만 적용 — 자식들은 렌더링 시 부모 color를 상속
  const setCellColor = (id: string, color: string | undefined) => {
    onCellsChange(root.map(c => c.id === id ? { ...c, color } : c));
    setColorPickerId(null);
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

  // 9×9 전체 뷰용: 특정 parent cell의 childIdx번째 자식 text 변경 (현재 size의 childCount 까지 자동 패딩)
  const writeChildCell = (parentIdx: number, childIdx: number, text: string) => {
    onCellsChange(root.map((c, i) => {
      if (i !== parentIdx) return c;
      const children = [...(c.children || [])];
      while (children.length < childCount) children.push(placeholderCell(c.id, children.length));
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

  // 셀 배경색 계산: 상속 체인 — drill 시 부모 색, root 시 자기 색
  const cellBgAndBorder = (cell: MandalartCell, center: boolean, parentColorVal?: string): { bg: string; border: string } => {
    if (center) return { bg: '#1e293b', border: '#1e293b' };
    const effectiveColor = cell.color || parentColorVal;
    const cfg = mandalartColor(effectiveColor);
    if (cfg) return { bg: cfg.light, border: cfg.border };
    return { bg: '#fff', border: '#e2e8f0' };
  };

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
    <div style={fullscreen
      ? { position: 'fixed', inset: 0, zIndex: 50, background: '#fff', padding: 16, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }
      : { display: 'flex', flexDirection: 'column', gap: 10 }
    }>
      {/* 헤더 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        {drillId && !expand9x9 && (
          <button onClick={() => setDrillId(null)} style={{ display:'flex', alignItems:'center', gap:4, padding:'4px 10px', background:'#f1f5f9', border:'1px solid #e2e8f0', borderRadius:6, fontSize:12, cursor:'pointer', color:'#475569' }}>
            <ArrowLeft size={14} /> 상위로
          </button>
        )}
        <span style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>
          {expand9x9
            ? `만다라트 — ${rows * rows}×${cols * cols} 전체`
            : drillId
              ? `만다라트 — ${drillCell?.text}`
              : `만다라트 ${rows}×${cols}`}
        </span>
        {allowExpand && (
          <button onClick={() => { setExpand9x9(v => !v); setDrillId(null); setEditingId(null); }}
            style={{ padding:'3px 8px', borderRadius:6, border:'1px solid #e2e8f0', fontSize:10, cursor:'pointer',
                     background: expand9x9 ? '#eff6ff' : '#fff', color: expand9x9 ? '#3B82F6' : '#94a3b8' }}>
            {expand9x9 ? '상세접기' : '상세펼치기'}
          </button>
        )}
        <button onClick={() => setFullscreen(v => !v)}
          title={fullscreen ? '전체화면 종료' : '전체화면'}
          style={{ padding:'3px 8px', borderRadius:6, border:'1px solid #bfdbfe', fontSize:10, cursor:'pointer',
                   background: fullscreen ? '#3B82F6' : '#eff6ff', color: fullscreen ? '#fff' : '#3B82F6',
                   display: 'flex', alignItems: 'center', gap: 3 }}>
          {fullscreen ? <Minimize2 size={10} /> : <Maximize2 size={10} />}
          {fullscreen ? '닫기' : '전체화면'}
        </button>
        {/* 타입 탭 (업무일지/규정/미팅 등) — 업무일지만 타임테이블 동기화 + CRUD */}
        {types && activeTypeId && onActiveTypeChange && (
          <div style={{ display: 'flex', gap: 2, marginLeft: 'auto', alignItems: 'center', flexWrap: 'wrap' }}>
            {types.map(t => {
              const isWorklog = t.id === WORKLOG_MANDALART_ID;
              const isEditing = editingTypeId === t.id;
              if (isEditing && onTypesChange) {
                return (
                  <input key={t.id} autoFocus value={editingTypeLabel}
                    onChange={e => setEditingTypeLabel(e.target.value)}
                    onBlur={() => {
                      const v = editingTypeLabel.trim();
                      if (v) onTypesChange(types.map(x => x.id === t.id ? { ...x, label: v } : x));
                      setEditingTypeId(null);
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Enter') { (e.target as HTMLInputElement).blur(); }
                      if (e.key === 'Escape') setEditingTypeId(null);
                    }}
                    style={{ width: 60, padding: '2px 6px', borderRadius: 12, border: '1px solid #3B82F6', fontSize: 10, outline: 'none' }} />
                );
              }
              return (
                <div key={t.id} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <button onClick={() => onActiveTypeChange(t.id)}
                    onDoubleClick={() => {
                      if (!onTypesChange || isWorklog) return;
                      setEditingTypeId(t.id); setEditingTypeLabel(t.label);
                    }}
                    title={isWorklog ? '업무일지 만다라트만 타임테이블에 배정 가능' : '더블클릭하여 이름 변경'}
                    style={{
                      padding: '3px 8px', borderRadius: 12, border: '1px solid',
                      borderColor: activeTypeId === t.id ? '#3B82F6' : '#e2e8f0',
                      background: activeTypeId === t.id ? '#3B82F6' : '#fff',
                      color: activeTypeId === t.id ? '#fff' : '#64748b',
                      fontSize: 10, fontWeight: 600, cursor: 'pointer',
                    }}>
                    {t.label}{isWorklog ? ' ⏱' : ''}
                  </button>
                  {onTypesChange && !isWorklog && types.length > 1 && (
                    <button
                      onClick={() => {
                        if (!confirm(`'${t.label}' 탭을 삭제하시겠습니까?`)) return;
                        const next = types.filter(x => x.id !== t.id);
                        onTypesChange(next);
                        if (activeTypeId === t.id && next[0]) onActiveTypeChange(next[0].id);
                      }}
                      title="삭제"
                      style={{
                        position: 'absolute', top: -4, right: -4, width: 12, height: 12,
                        borderRadius: '50%', background: '#ef4444', color: '#fff',
                        border: 'none', cursor: 'pointer', fontSize: 8, fontWeight: 700,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        lineHeight: 1,
                      }}>✕</button>
                  )}
                </div>
              );
            })}
            {onTypesChange && (
              <button onClick={() => {
                const newId = `mt-${Date.now()}`;
                const newType = { id: newId, label: '새 탭', size };
                onTypesChange([...types, newType]);
                onActiveTypeChange(newId);
                setEditingTypeId(newId);
                setEditingTypeLabel('새 탭');
              }}
                title="탭 추가"
                style={{ padding: '3px 6px', borderRadius: 12, border: '1px dashed #cbd5e1',
                  background: '#fff', color: '#94a3b8', fontSize: 10, fontWeight: 600, cursor: 'pointer' }}>
                +추가
              </button>
            )}
          </div>
        )}
        {/* 크기 선택: 행·열 독립 3~9 (n×m) */}
        {onSizeChange && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <span style={{ fontSize: 9, color: '#94a3b8', fontWeight: 700, width: 16 }}>행</span>
              {MANDALART_DIMS.map(d => (
                <button key={`r-${d}`}
                  onClick={() => { onSizeChange({ rows: d, cols }); setDrillId(null); setExpand9x9(false); }}
                  style={{
                    padding: '2px 5px', borderRadius: 3, border: '1px solid',
                    borderColor: rows === d ? '#1e293b' : '#e2e8f0',
                    background: rows === d ? '#1e293b' : '#fff',
                    color: rows === d ? '#fff' : '#64748b',
                    fontSize: 9, fontWeight: 700, cursor: 'pointer', minWidth: 16,
                  }}>{d}</button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <span style={{ fontSize: 9, color: '#94a3b8', fontWeight: 700, width: 16 }}>열</span>
              {MANDALART_DIMS.map(d => (
                <button key={`c-${d}`}
                  onClick={() => { onSizeChange({ rows, cols: d }); setDrillId(null); setExpand9x9(false); }}
                  style={{
                    padding: '2px 5px', borderRadius: 3, border: '1px solid',
                    borderColor: cols === d ? '#1e293b' : '#e2e8f0',
                    background: cols === d ? '#1e293b' : '#fff',
                    color: cols === d ? '#fff' : '#64748b',
                    fontSize: 9, fontWeight: 700, cursor: 'pointer', minWidth: 16,
                  }}>{d}</button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* N²×N² 전체 펼치기 뷰: 루트 N×N × 각 셀의 N×N children */}
      {expand9x9 ? (
        <div style={{
          display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 6,
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
                    aspectRatio: '1 / 1', padding: 8, cursor: 'text',
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
            const parentColorCfg = mandalartColor(parentCell.color);
            return (
              <div key={parentCell.id} style={{
                border: `2px solid ${parentColorCfg?.border || '#cbd5e1'}`,
                borderRadius: 6, padding: 3,
                background: parentColorCfg?.light || '#fff',
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
                <div style={{ display:'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 2 }}>
                  {Array.from({length: cellCount}, (_, sIdx) => {
                    // 홀수 N: 서브그리드 센터(sIdx===centerIdx) = 부모 셀 자체 (레이블)
                    if (hasCenter && sIdx === centerIdx) {
                      const isEditing = editingId === parentCell.id;
                      return (
                        <div key={`p-${pIdx}-c-${sIdx}`}
                          onClick={e => { e.stopPropagation(); setEditingId(parentCell.id); }}
                          style={{
                            background: parentColorCfg?.bg || '#475569', borderRadius: 3, padding: 2,
                            aspectRatio: '1 / 1', display:'flex', alignItems:'center', justifyContent:'center',
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
                    const childCell = children[childIdx] || placeholderCell(parentCell.id, childIdx);
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
                          border: `1px solid ${linked ? statusColor : (parentColorCfg?.border || '#e2e8f0')}`,
                          borderRadius: 3, padding: 2,
                          aspectRatio: '1 / 1',
                          display:'flex', alignItems:'center', justifyContent:'center',
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
            display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 3,
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

      {/* N×N Grid — 셀당 MAX_CELL_PX 상한으로 가로폭 제한 */}
      <div style={{
        flex: '0 1 auto',
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, minmax(0, ${MAX_CELL_PX}px))`,
        gap: GRID_GAP,
        background: '#f1f5f9', padding: GRID_PAD, borderRadius: 12, border: '1px solid #e2e8f0',
        maxWidth: mainGridMaxWidth,
      }}>
        {currentGrid.map((cell, idx) => {
          const center = isCenter(idx);
          const linked = linkedTask(cell);
          const statusColor = linked
            ? linked.status === 'done' ? '#10B981' : linked.status === 'progress' ? '#3B82F6' : '#94a3b8'
            : undefined;
          const ach = cell.achievement || 0;
          // 색상 상속: drill 시 drillCell.color 를 자식들에게 상속 (center는 부모 자체이므로 제외)
          const parentColorVal = drillCell && !center ? drillCell.color : undefined;
          const { bg: cellBg, border: cellBorder } = cellBgAndBorder(cell, center, parentColorVal);
          // 루트 모드에서만 색상 피커 노출 (drill 안 하고, 센터 아닐 때)
          const showColorPicker = !drillId && !center;

          return (
            <div
              key={cell.id}
              draggable={!center && !!cell.text.trim()}
              onDragStart={e => onDragStart(e, cell)}
              onDragEnd={() => setDragCellId(null)}
              onDoubleClick={() => !drillId && cell.text.trim() && handleDrillDown(cell, idx)}
              onClick={() => setEditingId(cell.id)}
              style={{
                position: 'relative',
                aspectRatio: '1 / 1',
                background: center ? '#1e293b' : dragCellId === cell.id ? '#dbeafe' : cellBg,
                borderRadius: 8,
                border: `2px solid ${linked ? statusColor : cellBorder}`,
                display: 'flex', flexDirection: 'column',
                cursor: center ? 'text' : cell.text.trim() ? (drillId ? 'grab' : 'pointer') : 'text',
                transition: 'all 0.15s', overflow: 'hidden',
              }}
            >
              {linked && <div style={{ height: 3, background: statusColor, width: '100%' }} />}
              {!center && cell.text.trim() && (
                <div style={{ position: 'absolute', top: 4, right: 4, opacity: 0.3 }}><GripVertical size={12} /></div>
              )}
              {/* 색상 피커 버튼 + 팝업 */}
              {showColorPicker && (
                <div style={{ position: 'absolute', top: 2, left: 2, zIndex: 2 }} onClick={e => e.stopPropagation()}>
                  <button
                    onClick={() => setColorPickerId(colorPickerId === cell.id ? null : cell.id)}
                    title="색상 선택"
                    style={{
                      width: 12, height: 12, borderRadius: '50%',
                      border: '1px solid #94a3b8',
                      background: mandalartColor(cell.color)?.bg || '#fff',
                      cursor: 'pointer', padding: 0,
                    }}
                  />
                  {colorPickerId === cell.id && (
                    <div style={{
                      position: 'absolute', top: 14, left: 0, zIndex: 10,
                      display: 'flex', gap: 2, padding: 3, background: '#fff',
                      border: '1px solid #cbd5e1', borderRadius: 4, boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                    }}>
                      <button onClick={() => setCellColor(cell.id, undefined)} title="해제"
                        style={{ width: 12, height: 12, borderRadius: '50%', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', padding: 0, fontSize: 7, lineHeight: 1 }}>×</button>
                      {MANDALART_COLOR_PALETTE.map(c => (
                        <button key={c.value} onClick={() => setCellColor(cell.id, c.value)} title={c.value}
                          style={{ width: 12, height: 12, borderRadius: '50%', border: cell.color === c.value ? '2px solid #1e293b' : '1px solid #cbd5e1', background: c.bg, cursor: 'pointer', padding: 0 }} />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 텍스트 */}
              {editingId === cell.id ? (
                <textarea autoFocus value={cell.text}
                  onChange={e => updateCell(cell.id, e.target.value)}
                  onBlur={() => setEditingId(null)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); setEditingId(null); } }}
                  style={{ flex: 1, width: '100%', padding: '6px 8px', border: 'none', outline: 'none',
                    fontSize: center ? CENTER_FONT : CELL_FONT, fontWeight: center ? 700 : 400,
                    color: center ? '#fff' : '#1e293b', background: 'transparent',
                    resize: 'none', fontFamily: 'inherit', lineHeight: 1.4 }}
                />
              ) : (
                <div style={{ flex: 1, padding: '6px 8px',
                  fontSize: center ? CENTER_FONT : CELL_FONT, fontWeight: center ? 700 : 400,
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
