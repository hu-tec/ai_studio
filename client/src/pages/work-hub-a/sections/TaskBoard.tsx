import { useState, useRef } from 'react';
import { Plus, Pin, Pencil, Trash2, MessageSquare, Paperclip, List, LayoutGrid, ChevronDown, ChevronRight, GripVertical } from 'lucide-react';
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import type { HubPost, TaskStatus } from '../types';
import { TASK_STATUSES, TASK_STATUS_STYLES, POST_TYPE_STYLES, getDeptBg, fmtDate, buildPathLabel } from '../constants';

const DND_CARD = 'TASK_CARD';

interface Props {
  sorted: HubPost[]; posts: HubPost[]; allAuthors: string[];
  filterType: any; setFilterType: any; filterPos: string[]; setFilterPos: any;
  filterAuthor: string; setFilterAuthor: any; searchText: string; setSearchText: any;
  anyFilterActive: boolean; resetFilters: () => void;
  handleDelete: (pid: string) => void; handleTogglePin: (post: HubPost) => void;
  handleSaveField: (post: HubPost, field: string, value: any) => void;
  getPostComments: (pid: string) => any[];
  setShowForm: (v: boolean) => void; setEditingId: (v: string | null) => void;
  onDetail: (post: HubPost) => void;
  getProgress?: (id: string) => any;
}

/* ── Draggable Card ── */
function DragCard({ post, status, onDrop, onDetail, onEdit, onDelete, onPin, onSaveField, getComments, getProgress, editingNote, setEditingNote }: any) {
  const ref = useRef<HTMLDivElement>(null);
  const [{ isDragging }, drag] = useDrag({ type: DND_CARD, item: { postId: post.post_id, fromStatus: status }, collect: m => ({ isDragging: m.isDragging() }) });
  drag(ref);

  const pt = POST_TYPE_STYLES[post.data.type as keyof typeof POST_TYPE_STYLES] || POST_TYPE_STYLES['메모'];
  const bg = getDeptBg(post.data.path);
  const cmts = getComments(post.post_id);
  const atts = post.data.attachments || [];
  const progress = getProgress?.(post.post_id);
  const pct = progress?.totalTasks > 0 ? Math.round(progress.doneTasks / progress.totalTasks * 100) : null;

  return (
    <div ref={ref} onClick={() => onDetail(post)}
      style={{ background: bg, borderRadius: 5, border: '1px solid #e2e8f0', padding: '4px 6px', marginBottom: 3, cursor: 'grab', opacity: isDragging ? 0.4 : 1, boxShadow: post.data.pinned ? '0 0 0 1.5px #FBBF24' : 'none' }}>
      {/* 1줄: 유형+부서+날짜 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginBottom: 1 }}>
        <span style={{ padding: '0 3px', borderRadius: 3, fontSize: 7, fontWeight: 700, background: pt.bg, color: pt.color }}>{post.data.type}</span>
        <span style={{ fontSize: 7, color: '#94a3b8', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{buildPathLabel(post.data)}</span>
        <span style={{ fontSize: 7, color: '#94a3b8' }}>{fmtDate(post.data.created_at)}</span>
      </div>
      {/* 제목 */}
      <div style={{ fontSize: 10, fontWeight: 600, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 1 }}>
        {post.data.pinned && <Pin size={7} color="#F59E0B" style={{ marginRight: 2 }} />}{post.data.title}
      </div>
      {/* 담당+진행률+메타 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 8, color: '#94a3b8' }}>
        {post.data.assignee && <span style={{ color: '#475569', fontWeight: 500 }}>{post.data.assignee}</span>}
        {pct !== null && <span style={{ color: pct === 100 ? '#10B981' : '#3B82F6', fontWeight: 600 }}>{pct}%</span>}
        {post.data.dueDate && <span style={{ color: '#F59E0B' }}>~{post.data.dueDate}</span>}
        {atts.length > 0 && <span><Paperclip size={6} />{atts.length}</span>}
        {cmts.length > 0 && <span><MessageSquare size={6} />{cmts.length}</span>}
      </div>
      {/* 비고 인라인 */}
      <div onClick={e => { e.stopPropagation(); if (!editingNote || editingNote.id !== post.post_id) setEditingNote({ id: post.post_id, val: post.data.note || '' }); }}
        style={{ fontSize: 8, color: post.data.note ? '#475569' : '#cbd5e1', borderTop: '1px solid #f1f5f9', paddingTop: 1, marginTop: 1, cursor: 'text' }}>
        {editingNote?.id === post.post_id ? (
          <input value={editingNote.val} onChange={e => setEditingNote({ ...editingNote, val: e.target.value })}
            onBlur={() => { onSaveField(post, 'note', editingNote.val); setEditingNote(null); }}
            onKeyDown={e => { if (e.key === 'Enter') { onSaveField(post, 'note', editingNote.val); setEditingNote(null); } if (e.key === 'Escape') setEditingNote(null); }}
            autoFocus onClick={e => e.stopPropagation()} style={{ width: '100%', padding: '0 2px', border: '1px solid #3B82F6', borderRadius: 2, fontSize: 8, outline: 'none' }} />
        ) : (post.data.note || '비고')}
      </div>
      {/* 액션 */}
      <div style={{ display: 'flex', gap: 1, marginTop: 2 }} onClick={e => e.stopPropagation()}>
        <button onClick={() => onEdit(post.post_id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 1 }}><Pencil size={7} color="#94a3b8" /></button>
        <button onClick={() => onDelete(post.post_id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 1 }}><Trash2 size={7} color="#ef4444" /></button>
        <button onClick={() => onPin(post)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 1 }}><Pin size={7} color={post.data.pinned ? '#F59E0B' : '#94a3b8'} /></button>
      </div>
    </div>
  );
}

/* ── Drop Column (열별 접기/펼치기) ── */
function DropColumn({ status, items, onDrop, collapsed, onToggle, ...cardProps }: any) {
  const st = TASK_STATUS_STYLES[status as TaskStatus];
  const [{ isOver }, drop] = useDrop({
    accept: DND_CARD,
    drop: (item: any) => { if (item.fromStatus !== status) onDrop(item.postId, status); },
    collect: m => ({ isOver: m.isOver() }),
  });

  return (
    <div ref={drop as any} style={{ background: isOver ? `${st.color}10` : '#f8fafc', borderRadius: 6, border: `1.5px solid ${isOver ? st.color : st.color + '30'}`, display: 'flex', flexDirection: 'column', minHeight: 0, transition: 'all 0.15s' }}>
      <div onClick={onToggle} style={{ padding: '4px 6px', borderBottom: collapsed ? 'none' : `1px solid ${st.color}20`, display: 'flex', alignItems: 'center', gap: 3, cursor: 'pointer' }}>
        {collapsed ? <ChevronRight size={9} color={st.color} /> : <ChevronDown size={9} color={st.color} />}
        <span style={{ width: 5, height: 5, borderRadius: 3, background: st.color }} />
        <span style={{ fontSize: 10, fontWeight: 700, color: st.color }}>{status}</span>
        <span style={{ fontSize: 8, color: '#94a3b8', marginLeft: 'auto' }}>{items.length}</span>
      </div>
      {!collapsed && (
        <div style={{ flex: 1, overflow: 'auto', padding: '3px 3px', minHeight: 40 }}>
          {items.length === 0 ? <div style={{ textAlign: 'center', padding: 10, fontSize: 8, color: '#cbd5e1' }}>드래그하여 이동</div> :
            items.map((post: HubPost) => <DragCard key={post.post_id} post={post} status={status} {...cardProps} />)}
        </div>
      )}
    </div>
  );
}

/* ── Main ── */
export default function TaskBoard(props: Props) {
  const { sorted, posts, allAuthors, filterType, setFilterType, filterPos, setFilterPos, filterAuthor, setFilterAuthor, searchText, setSearchText, anyFilterActive, resetFilters, handleDelete, handleTogglePin, handleSaveField, getPostComments, setShowForm, setEditingId, onDetail, getProgress } = props;
  const [editingNote, setEditingNote] = useState<{ id: string; val: string } | null>(null);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [expandAll, setExpandAll] = useState(true);
  const [collapsedCols, setCollapsedCols] = useState<Set<string>>(new Set());
  const toggleCol = (s: string) => setCollapsedCols(prev => { const n = new Set(prev); if (n.has(s)) n.delete(s); else n.add(s); return n; });

  const byStatus = (status: TaskStatus) => sorted.filter(p => (p.data.status || '할당대기') === status);
  const onDrop = (postId: string, newStatus: string) => {
    const post = posts.find(p => p.post_id === postId);
    if (post) handleSaveField(post, 'status', newStatus);
  };

  const cardProps = { onDrop, onDetail, onEdit: (id: string) => { setEditingId(id); setShowForm(true); }, onDelete: handleDelete, onPin: handleTogglePin, onSaveField: handleSaveField, getComments: getPostComments, getProgress, editingNote, setEditingNote };

  return (
    <DndProvider backend={HTML5Backend}>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* 필터 — 1줄 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderBottom: '1px solid #e2e8f0', background: '#fff', flexShrink: 0, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', width: 120 }}>
            <input value={searchText} onChange={e => setSearchText(e.target.value)} placeholder="검색..." style={{ width: '100%', padding: '3px 6px', border: '1px solid #e2e8f0', borderRadius: 4, fontSize: 10, outline: 'none' }} />
          </div>
          {anyFilterActive && <button onClick={resetFilters} style={{ padding: '2px 6px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 4, fontSize: 9, cursor: 'pointer', color: '#EF4444' }}>초기화</button>}
          {/* 뷰 토글 */}
          <button onClick={() => setViewMode('kanban')} style={{ padding: '2px 4px', borderRadius: 3, border: 'none', background: viewMode === 'kanban' ? '#EFF6FF' : 'transparent', color: viewMode === 'kanban' ? '#3B82F6' : '#94a3b8', cursor: 'pointer' }}><LayoutGrid size={11} /></button>
          <button onClick={() => setViewMode('list')} style={{ padding: '2px 4px', borderRadius: 3, border: 'none', background: viewMode === 'list' ? '#EFF6FF' : 'transparent', color: viewMode === 'list' ? '#3B82F6' : '#94a3b8', cursor: 'pointer' }}><List size={11} /></button>
          <button onClick={() => { if (collapsedCols.size === 0 && expandAll) { setCollapsedCols(new Set(TASK_STATUSES)); setExpandAll(false); } else { setCollapsedCols(new Set()); setExpandAll(true); } }} style={{ padding: '2px 6px', border: '1px solid #e2e8f0', borderRadius: 4, fontSize: 9, cursor: 'pointer', color: '#475569', background: '#f8fafc' }}>{collapsedCols.size === 0 ? '전체접기' : '전체펼치기'}</button>
          <span style={{ fontSize: 9, color: '#94a3b8' }}>{sorted.length}건</span>
          <button onClick={() => { setEditingId(null); setShowForm(true); }} style={{ marginLeft: 'auto', padding: '3px 8px', background: '#3B82F6', color: '#fff', border: 'none', borderRadius: 4, fontSize: 10, fontWeight: 600, cursor: 'pointer' }}>+새 업무</button>
        </div>

        {/* 콘텐츠 */}
        {viewMode === 'kanban' && expandAll ? (
          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 5, padding: '5px 6px', overflow: 'auto' }}>
            {TASK_STATUSES.map(status => <DropColumn key={status} status={status} items={byStatus(status)} collapsed={collapsedCols.has(status)} onToggle={() => toggleCol(status)} {...cardProps} />)}
          </div>
        ) : viewMode === 'kanban' && !expandAll ? (
          /* 접힌 칸반 — 열 헤더만 */
          <div style={{ display: 'flex', gap: 6, padding: '8px', flexWrap: 'wrap' }}>
            {TASK_STATUSES.map(s => {
              const st = TASK_STATUS_STYLES[s];
              const cnt = byStatus(s).length;
              return <button key={s} onClick={() => setExpandAll(true)} style={{ padding: '4px 10px', borderRadius: 6, background: st.bg, color: st.color, border: `1px solid ${st.color}30`, fontSize: 10, fontWeight: 600, cursor: 'pointer' }}>{s} ({cnt})</button>;
            })}
          </div>
        ) : (
          /* 리스트 모드 — 한 줄씩 */
          <div style={{ flex: 1, overflow: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 1 }}>
                  {['#','상태','유형','부서','제목','담당','진행','비고','날짜','액션'].map(h => <th key={h} style={{ padding: '3px 5px', fontSize: 9, fontWeight: 700, color: '#475569', textAlign: 'left' }}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {sorted.map((post, i) => {
                  const pt = POST_TYPE_STYLES[post.data.type as keyof typeof POST_TYPE_STYLES] || POST_TYPE_STYLES['메모'];
                  const st = TASK_STATUS_STYLES[(post.data.status || '할당대기') as TaskStatus];
                  const bg = getDeptBg(post.data.path);
                  const progress = getProgress?.(post.post_id);
                  const pct = progress?.totalTasks > 0 ? Math.round(progress.doneTasks / progress.totalTasks * 100) : null;
                  return (
                    <tr key={post.post_id} onClick={() => onDetail(post)} style={{ background: bg, borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }}
                      onMouseEnter={e => e.currentTarget.style.filter = 'brightness(0.97)'} onMouseLeave={e => e.currentTarget.style.filter = ''}>
                      <td style={{ padding: '2px 5px', fontSize: 8, color: '#94a3b8' }}>{i + 1}</td>
                      <td style={{ padding: '2px 5px' }}><span style={{ padding: '0 4px', borderRadius: 4, fontSize: 8, fontWeight: 600, background: st.bg, color: st.color }}>{post.data.status || '할당대기'}</span></td>
                      <td style={{ padding: '2px 5px' }}><span style={{ padding: '0 3px', borderRadius: 3, fontSize: 7, fontWeight: 700, background: pt.bg, color: pt.color }}>{post.data.type}</span></td>
                      <td style={{ padding: '2px 5px', fontSize: 9, color: '#64748b', maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{buildPathLabel(post.data)}</td>
                      <td style={{ padding: '2px 5px', fontSize: 10, fontWeight: 600, color: '#1e293b', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{post.data.pinned && <Pin size={7} color="#F59E0B" style={{ marginRight: 2 }} />}{post.data.title}</td>
                      <td style={{ padding: '2px 5px', fontSize: 9, color: '#475569' }}>{post.data.assignee || '—'}</td>
                      <td style={{ padding: '2px 5px', fontSize: 9 }}>{pct !== null ? <span style={{ color: pct === 100 ? '#10B981' : '#3B82F6', fontWeight: 600 }}>{pct}%</span> : '—'}</td>
                      <td style={{ padding: '2px 5px', fontSize: 9, color: post.data.note ? '#475569' : '#cbd5e1', maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{post.data.note || '비고'}</td>
                      <td style={{ padding: '2px 5px', fontSize: 8, color: '#94a3b8' }}>{fmtDate(post.data.created_at)}</td>
                      <td style={{ padding: '2px 4px' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', gap: 1 }}>
                          <button onClick={() => { setEditingId(post.post_id); setShowForm(true); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 1 }}><Pencil size={8} color="#94a3b8" /></button>
                          <button onClick={() => handleDelete(post.post_id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 1 }}><Trash2 size={8} color="#ef4444" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DndProvider>
  );
}
