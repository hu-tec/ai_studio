import { useState } from 'react';
import { Plus, Pin, Pencil, Trash2, MessageSquare, Paperclip } from 'lucide-react';
import type { HubPost, TaskStatus } from '../types';
import { TASK_STATUSES, TASK_STATUS_STYLES, POST_TYPE_STYLES, getDeptBg, fmtDate, buildPathLabel } from '../constants';
import FilterBar from '../shared/FilterBar';

interface Props {
  sorted: HubPost[];
  posts: HubPost[];
  allAuthors: string[];
  filterType: any; setFilterType: any;
  filterPos: string[]; setFilterPos: any;
  filterAuthor: string; setFilterAuthor: any;
  searchText: string; setSearchText: any;
  anyFilterActive: boolean; resetFilters: () => void;
  handleDelete: (pid: string) => void;
  handleTogglePin: (post: HubPost) => void;
  handleSaveField: (post: HubPost, field: string, value: any) => void;
  getPostComments: (pid: string) => any[];
  setShowForm: (v: boolean) => void;
  setEditingId: (v: string | null) => void;
  onDetail: (post: HubPost) => void;
  getProgress?: (id: string) => { totalTasks: number; doneTasks: number; avgAchievement: number; assignees: string[]; totalHours: number } | undefined;
}

export default function TaskBoard(props: Props) {
  const { sorted, posts, allAuthors, filterType, setFilterType, filterPos, setFilterPos, filterAuthor, setFilterAuthor, searchText, setSearchText, anyFilterActive, resetFilters, handleDelete, handleTogglePin, handleSaveField, getPostComments, setShowForm, setEditingId, onDetail, getProgress } = props;
  const [editingNote, setEditingNote] = useState<{ id: string; val: string } | null>(null);

  const byStatus = (status: TaskStatus) => sorted.filter(p => (p.data.status || '할당대기') === status);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <FilterBar {...{ filterType, setFilterType, filterPos, setFilterPos, filterAuthor, setFilterAuthor, searchText, setSearchText, allAuthors, anyFilterActive, resetFilters }}
        count={sorted.length} total={posts.length}
        extra={<button onClick={() => { setEditingId(null); setShowForm(true); }} style={{ marginLeft: 'auto', padding: '3px 10px', background: '#3B82F6', color: '#fff', border: 'none', borderRadius: 5, fontSize: 10, fontWeight: 600, cursor: 'pointer' }}><Plus size={10} /> 새 업무</button>}
      />
      {/* 칸반 4열 */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, padding: '6px 8px', overflow: 'auto' }}>
        {TASK_STATUSES.map(status => {
          const items = byStatus(status);
          const st = TASK_STATUS_STYLES[status];
          return (
            <div key={status} style={{ background: '#f8fafc', borderRadius: 8, border: `1.5px solid ${st.color}30`, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
              {/* 열 헤더 */}
              <div style={{ padding: '5px 8px', borderBottom: `1px solid ${st.color}20`, display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: 3, background: st.color, flexShrink: 0 }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: st.color }}>{status}</span>
                <span style={{ fontSize: 9, color: '#94a3b8', marginLeft: 'auto' }}>{items.length}</span>
              </div>
              {/* 카드 목록 */}
              <div style={{ flex: 1, overflow: 'auto', padding: '4px 4px' }}>
                {items.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 16, fontSize: 9, color: '#cbd5e1' }}>비어있음</div>
                ) : items.map(post => {
                  const pt = POST_TYPE_STYLES[post.data.type];
                  const bg = getDeptBg(post.data.path);
                  const cmts = getPostComments(post.post_id);
                  const atts = post.data.attachments || [];
                  return (
                    <div key={post.post_id} onClick={() => onDetail(post)}
                      style={{ background: bg, borderRadius: 6, border: '1px solid #e2e8f0', padding: '5px 7px', marginBottom: 4, cursor: 'pointer', boxShadow: post.data.pinned ? `0 0 0 1.5px #FBBF24` : 'none' }}
                      onMouseEnter={e => e.currentTarget.style.filter = 'brightness(0.97)'} onMouseLeave={e => e.currentTarget.style.filter = ''}>
                      {/* 유형 + 부서 */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginBottom: 2 }}>
                        <span style={{ padding: '0 4px', borderRadius: 4, fontSize: 7, fontWeight: 700, background: pt.bg, color: pt.color }}>{pt.icon}{post.data.type}</span>
                        <span style={{ fontSize: 8, color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{buildPathLabel(post.data)}</span>
                      </div>
                      {/* 제목 */}
                      <div style={{ fontSize: 11, fontWeight: 600, color: '#1e293b', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {post.data.pinned && <Pin size={8} color="#F59E0B" style={{ marginRight: 2 }} />}
                        {post.data.title}
                      </div>
                      {/* 담당 + 진행률 + 날짜 */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 8, color: '#94a3b8', marginBottom: 2 }}>
                        {post.data.assignee && <span style={{ color: '#475569', fontWeight: 500 }}>{post.data.assignee}</span>}
                        {(() => { const p = getProgress?.(post.post_id); if (!p || !p.totalTasks) return null; const pct = Math.round(p.doneTasks / p.totalTasks * 100); return <span style={{ color: pct === 100 ? '#10B981' : '#3B82F6', fontWeight: 600 }}>{pct}%</span>; })()}
                        <span>{fmtDate(post.data.created_at)}</span>
                        {atts.length > 0 && <span><Paperclip size={7} />{atts.length}</span>}
                        {cmts.length > 0 && <span><MessageSquare size={7} />{cmts.length}</span>}
                      </div>
                      {/* 비고 인라인 */}
                      <div onClick={e => { e.stopPropagation(); if (!editingNote || editingNote.id !== post.post_id) setEditingNote({ id: post.post_id, val: post.data.note || '' }); }}
                        style={{ fontSize: 9, color: post.data.note ? '#475569' : '#cbd5e1', borderTop: '1px solid #e2e8f020', paddingTop: 2, cursor: 'text' }}>
                        {editingNote?.id === post.post_id ? (
                          <input value={editingNote.val} onChange={e => setEditingNote({ ...editingNote, val: e.target.value })}
                            onBlur={() => { handleSaveField(post, 'note', editingNote.val); setEditingNote(null); }}
                            onKeyDown={e => { if (e.key === 'Enter') { handleSaveField(post, 'note', editingNote.val); setEditingNote(null); } if (e.key === 'Escape') setEditingNote(null); }}
                            autoFocus onClick={e => e.stopPropagation()}
                            style={{ width: '100%', padding: '1px 3px', border: '1px solid #3B82F6', borderRadius: 3, fontSize: 9, outline: 'none' }} />
                        ) : (post.data.note || '비고...')}
                      </div>
                      {/* 액션 */}
                      <div style={{ display: 'flex', gap: 2, marginTop: 3 }} onClick={e => e.stopPropagation()}>
                        {TASK_STATUSES.filter(s => s !== status).map(s => (
                          <button key={s} onClick={() => handleSaveField(post, 'status', s)}
                            style={{ padding: '0 4px', borderRadius: 3, border: 'none', background: TASK_STATUS_STYLES[s].bg, color: TASK_STATUS_STYLES[s].color, fontSize: 7, cursor: 'pointer', fontWeight: 600 }}>→{s}</button>
                        ))}
                        <span style={{ flex: 1 }} />
                        <button onClick={() => { setEditingId(post.post_id); setShowForm(true); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 1 }}><Pencil size={8} color="#94a3b8" /></button>
                        <button onClick={() => handleDelete(post.post_id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 1 }}><Trash2 size={8} color="#ef4444" /></button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
