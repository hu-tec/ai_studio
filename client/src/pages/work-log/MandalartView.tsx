import { useState, DragEvent } from 'react';
import { ArrowLeft, Plus, X, GripVertical } from 'lucide-react';
import type { MandalartCell, FranklinTask, FranklinPriority } from './data';
import { getNextNumber } from './data';

interface MandalartViewProps {
  cells: MandalartCell[];
  tasks: FranklinTask[];
  onCellsChange: (cells: MandalartCell[]) => void;
  onTasksChange: (tasks: FranklinTask[]) => void;
  onSlotTitleChange: (index: number, title: string) => void;
}

const POSITIONS = [0,1,2,3,4,5,6,7,8]; // 0-8, center=4
const SURROUND = [0,1,2,3,5,6,7,8]; // center 제외

function emptyCell(text = ''): MandalartCell {
  return { id: `mc-${Date.now()}-${Math.random().toString(36).slice(2,6)}`, text, children: [] };
}

export function MandalartView({ cells, tasks, onCellsChange, onTasksChange, onSlotTitleChange }: MandalartViewProps) {
  const [drillId, setDrillId] = useState<string | null>(null); // 하위 3x3 보기 중인 셀 ID
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dragCellId, setDragCellId] = useState<string | null>(null);

  // 루트 셀 보장 (9칸)
  const root: MandalartCell[] = cells.length >= 9 ? cells : Array.from({length:9}, (_,i) => cells[i] || emptyCell(i===4 ? '오늘 목표' : ''));

  // 현재 보고 있는 3x3
  const drillCell = drillId ? root.find(c => c.id === drillId) : null;
  const currentGrid = drillCell
    ? [
        ...(drillCell.children || []).slice(0,4),
        { ...drillCell }, // center = 부모 셀 자신
        ...(drillCell.children || []).slice(4,8),
      ]
    : root;

  // 그리드가 9칸 미만이면 빈 셀로 채우기
  while (currentGrid.length < 9) currentGrid.push(emptyCell());

  const updateCell = (id: string, text: string) => {
    if (drillCell) {
      // 하위 그리드 수정
      const newRoot = root.map(c => {
        if (c.id !== drillId) return c;
        if (id === c.id) return { ...c, text }; // center 수정 = 부모 텍스트 수정
        const children = [...(c.children || [])];
        const surroundIdx = currentGrid.findIndex(g => g.id === id);
        const childIdx = surroundIdx < 4 ? surroundIdx : surroundIdx - 1;
        if (childIdx >= 0 && childIdx < children.length) {
          children[childIdx] = { ...children[childIdx], text };
        } else {
          // 새 칸 추가
          while (children.length <= childIdx) children.push(emptyCell());
          children[childIdx] = { ...children[childIdx], text };
        }
        return { ...c, children };
      });
      onCellsChange(newRoot);
    } else {
      // 루트 그리드 수정
      const newRoot = root.map(c => c.id === id ? { ...c, text } : c);
      onCellsChange(newRoot);
    }
  };

  const handleDrillDown = (cell: MandalartCell, idx: number) => {
    if (drillId) return; // 이미 하위면 더 안 들어감
    if (idx === 4) return; // center는 드릴다운 안 함
    if (!cell.text.trim()) return;
    // children이 없으면 빈 8칸 생성
    if (!cell.children || cell.children.length === 0) {
      const newRoot = root.map(c => c.id === cell.id ? { ...c, children: Array.from({length:8}, () => emptyCell()) } : c);
      onCellsChange(newRoot);
    }
    setDrillId(cell.id);
  };

  // 타임테이블로 드래그 시작
  const onDragStart = (e: DragEvent, cell: MandalartCell) => {
    if (!cell.text.trim()) return;
    setDragCellId(cell.id);
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('text/plain', cell.text);
    e.dataTransfer.setData('application/mandalart-cell', JSON.stringify(cell));
  };

  // 셀을 태스크로 변환
  const cellToTask = (cell: MandalartCell) => {
    if (!cell.text.trim()) return;
    if (cell.taskId && tasks.find(t => t.id === cell.taskId)) return; // 이미 연결됨
    const priority: FranklinPriority = 'B';
    const task: FranklinTask = {
      id: `ft-${Date.now()}`,
      priority,
      number: getNextNumber(tasks, priority),
      task: cell.text,
      status: 'pending',
      important: true,
      urgent: false,
    };
    onTasksChange([...tasks, task]);
    // 셀에 taskId 연결
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* 헤더 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {drillId && (
          <button onClick={() => setDrillId(null)} style={{ display:'flex', alignItems:'center', gap:4, padding:'4px 10px', background:'#f1f5f9', border:'1px solid #e2e8f0', borderRadius:6, fontSize:12, cursor:'pointer', color:'#475569' }}>
            <ArrowLeft size={14} /> 상위로
          </button>
        )}
        <span style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>
          {drillId ? `만다라트 — ${drillCell?.text}` : '만다라트'}
        </span>
        {!drillId && <span style={{ fontSize: 11, color: '#94a3b8' }}>셀 더블클릭 → 하위 분해 / 드래그 → 타임테이블 배정</span>}
      </div>

      {/* 3×3 Grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6,
        background: '#f1f5f9', padding: 6, borderRadius: 12, border: '1px solid #e2e8f0',
      }}>
        {currentGrid.map((cell, idx) => {
          const center = isCenter(idx);
          const linked = linkedTask(cell);
          const statusColor = linked
            ? linked.status === 'done' ? '#10B981' : linked.status === 'progress' ? '#3B82F6' : '#94a3b8'
            : undefined;

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
                minHeight: 80,
                background: center ? '#1e293b' : dragCellId === cell.id ? '#dbeafe' : '#fff',
                borderRadius: 8,
                border: `2px solid ${center ? '#1e293b' : linked ? statusColor : '#e2e8f0'}`,
                display: 'flex', flexDirection: 'column',
                cursor: center ? 'default' : cell.text.trim() ? (drillId ? 'grab' : 'pointer') : 'text',
                transition: 'all 0.15s',
                overflow: 'hidden',
              }}
            >
              {/* 상태 인디케이터 */}
              {linked && (
                <div style={{ height: 3, background: statusColor, width: '100%' }} />
              )}

              {/* 드래그 핸들 */}
              {!center && cell.text.trim() && (
                <div style={{ position: 'absolute', top: 4, right: 4, opacity: 0.3 }}>
                  <GripVertical size={12} />
                </div>
              )}

              {/* 텍스트 영역 */}
              {editingId === cell.id ? (
                <textarea
                  autoFocus
                  value={cell.text}
                  onChange={e => updateCell(cell.id, e.target.value)}
                  onBlur={() => setEditingId(null)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); setEditingId(null); } }}
                  style={{
                    flex: 1, width: '100%', padding: '8px 10px', border: 'none', outline: 'none',
                    fontSize: center ? 14 : 12, fontWeight: center ? 700 : 400,
                    color: center ? '#fff' : '#1e293b', background: 'transparent',
                    resize: 'none', fontFamily: 'inherit', lineHeight: 1.4,
                  }}
                />
              ) : (
                <div
                  style={{
                    flex: 1, padding: '8px 10px',
                    fontSize: center ? 14 : 12, fontWeight: center ? 700 : 400,
                    color: center ? '#fff' : cell.text ? '#1e293b' : '#cbd5e1',
                    lineHeight: 1.4, wordBreak: 'break-word',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    textAlign: 'center',
                  }}
                >
                  {cell.text || (center ? '목표 입력' : '+')}
                </div>
              )}

              {/* 하위 있음 표시 + 태스크 연결 버튼 */}
              {!center && cell.text.trim() && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 6px 4px', fontSize: 10 }}>
                  {!drillId && (cell.children?.length || 0) > 0 && (
                    <span style={{ color: '#3B82F6' }}>▦ {cell.children?.filter(c=>c.text).length || 0}</span>
                  )}
                  {!linked ? (
                    <button
                      onClick={e => { e.stopPropagation(); cellToTask(cell); }}
                      style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 10 }}
                      title="태스크로 등록"
                    >
                      + 태스크
                    </button>
                  ) : (
                    <span style={{ color: statusColor, fontWeight: 500 }}>
                      {linked.priority}{linked.number}
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 하위 그리드 안내 */}
      {!drillId && (
        <div style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center' }}>
          주변 셀 더블클릭 → 하위 분해 | 셀 드래그 → 타임테이블 배정 | "+ 태스크" → 프랭클린/아이젠하워 연동
        </div>
      )}
    </div>
  );
}
