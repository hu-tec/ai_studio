import { useState, useRef } from 'react';
import { toast } from 'sonner';
import {
  Plus, Trash2, Pencil, X, Pin, PinOff, MessageSquare,
  Search, File, ExternalLink, ChevronDown, ChevronRight,
  Image as ImageIcon, FolderOpen, User, LayoutGrid, List,
  Paperclip, Send, Upload, Link as LinkIcon
} from 'lucide-react';

/** 부서별 배경색 (pastel) */
const DEPT_COLORS: Record<string, string> = {
  '개발': '#EFF6FF', '회계': '#FEF9C3', '마케팅': '#FCE7F3', '인사': '#F0FDF4',
  '법무': '#FEF2F2', '기획_사업': '#EEF2FF', '매뉴얼_규정': '#FDF4FF',
  '직원별': '#F0FDFA', '경영': '#FFF7ED', '영업': '#ECFDF5', '강사팀': '#F5F3FF',
  '홈페이지': '#F0F9FF', '상담': '#FFFBEB', '총무': '#F8FAFC', '관리': '#FEF2F2',
};
const getDeptBg = (path: string[]) => (path[0] && DEPT_COLORS[path[0]]) || '#fff';

interface FeedViewProps {
  sorted: any[];
  posts: any[];
  comments: any[];
  searchText: string;
  setSearchText: (v: string) => void;
  anyFilterActive: boolean;
  resetFilters: () => void;
  activePath: string[];
  setActivePath: (v: string[]) => void;
  setShowForm: (v: boolean) => void;
  setEditingId: (v: string | null) => void;
  handleDelete: (pid: string) => void;
  handleTogglePin: (post: any) => void;
  getPostComments: (pid: string) => any[];
  fetchData: () => void;
  POST_TYPES: any[];
  buildPathLabel: (d: any) => string;
  fmtDate: (iso: string) => string;
  fmtSize: (b: number) => string;
  getProgress?: (hubPostId: string) => { totalTasks: number; doneTasks: number; progressTasks: number; avgAchievement: number; assignees: string[]; totalHours: number } | undefined;
}

export default function FeedView(props: FeedViewProps) {
  const { sorted, posts, comments, searchText, setSearchText, anyFilterActive, resetFilters, activePath, setActivePath, setShowForm, setEditingId, handleDelete, handleTogglePin, getPostComments, fetchData, POST_TYPES, buildPathLabel, fmtDate, fmtSize, getProgress } = props;

  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [detailPost, setDetailPost] = useState<any | null>(null);
  const [diskInfo, setDiskInfo] = useState<any>(null);

  // fetch disk info
  useState(() => { fetch('/api/disk-usage').then(r => r.json()).then(setDiskInfo).catch(() => {}); });
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteVal, setEditingNoteVal] = useState('');
  const [expandAll, setExpandAll] = useState(false);

  // 열 선택 토글
  const ALL_COLS = ['유형','부서','제목','내용','비고','첨부','작성자','진행','날짜','액션'] as const;
  const [visibleCols, setVisibleCols] = useState<Set<string>>(new Set(ALL_COLS));
  const toggleCol = (col: string) => setVisibleCols(prev => { const n = new Set(prev); if (n.has(col)) n.delete(col); else n.add(col); return n; });
  const showCol = (col: string) => visibleCols.has(col);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (id: string) => setExpandedRows(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const toggleAllRows = () => {
    if (expandAll) { setExpandedRows(new Set()); setExpandAll(false); }
    else { setExpandedRows(new Set(sorted.map((p: any) => p.post_id))); setExpandAll(true); }
  };

  // inline note save
  const saveNote = async (post: any) => {
    const payload = { ...post.data, note: editingNoteVal };
    try {
      await fetch(`/api/work-hub/${post.post_id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      toast.success('비고 저장');
      fetchData();
    } catch { toast.error('실패'); }
    setEditingNoteId(null);
  };

  const ptOf = (type: string) => POST_TYPES.find((p: any) => p.type === type) || POST_TYPES[2];

  return (
    <>
      {/* 상단 바 */}
      <div style={{ padding: '4px 10px', borderBottom: '1px solid #e2e8f0', background: '#fff', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
        {activePath.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: 10 }}>
            <button onClick={() => setActivePath([])} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3B82F6', fontSize: 10 }}>전체</button>
            {activePath.map((seg, i) => (
              <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <ChevronRight size={9} color="#94a3b8" />
                <button onClick={() => setActivePath(activePath.slice(0, i + 1))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: i === activePath.length - 1 ? '#1e293b' : '#3B82F6', fontWeight: i === activePath.length - 1 ? 700 : 400, fontSize: 10 }}>{seg}</button>
              </span>
            ))}
          </div>
        )}
        <div style={{ position: 'relative', flex: 1, maxWidth: 240 }}>
          <Search size={11} style={{ position: 'absolute', left: 7, top: 6, color: '#94a3b8' }} />
          <input value={searchText} onChange={e => setSearchText(e.target.value)} placeholder="검색..."
            style={{ width: '100%', padding: '4px 7px 4px 24px', border: '1px solid #e2e8f0', borderRadius: 5, fontSize: 11, outline: 'none' }} />
        </div>
        {anyFilterActive && <button onClick={resetFilters} style={{ padding: '3px 7px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 5, fontSize: 10, cursor: 'pointer', color: '#EF4444' }}><X size={9} />초기화</button>}
        <button onClick={toggleAllRows} style={{ padding: '3px 7px', border: '1px solid #e2e8f0', borderRadius: 5, fontSize: 10, cursor: 'pointer', color: '#475569', background: '#f8fafc' }}>{expandAll ? '접기' : '펼치기'}</button>
        {/* 뷰 토글 */}
        <button onClick={() => setViewMode('table')} style={{ padding: '3px 6px', borderRadius: 4, border: 'none', background: viewMode === 'table' ? '#EFF6FF' : 'transparent', color: viewMode === 'table' ? '#3B82F6' : '#94a3b8', cursor: 'pointer' }}><List size={12} /></button>
        <button onClick={() => setViewMode('grid')} style={{ padding: '3px 6px', borderRadius: 4, border: 'none', background: viewMode === 'grid' ? '#EFF6FF' : 'transparent', color: viewMode === 'grid' ? '#3B82F6' : '#94a3b8', cursor: 'pointer' }}><LayoutGrid size={12} /></button>
        {/* 열 선택 */}
        {viewMode === 'table' && ALL_COLS.map(col => (
          <button key={col} onClick={() => toggleCol(col)}
            style={{ padding: '1px 5px', borderRadius: 4, border: '1px solid', borderColor: showCol(col) ? '#3B82F6' : '#e2e8f0', background: showCol(col) ? '#EFF6FF' : '#fff', color: showCol(col) ? '#3B82F6' : '#cbd5e1', fontSize: 8, cursor: 'pointer', fontWeight: showCol(col) ? 600 : 400 }}>{col}</button>
        ))}
        <span style={{ fontSize: 10, color: '#94a3b8' }}>{sorted.length}건</span>
        {diskInfo && (() => { const pct = Math.round(diskInfo.used / diskInfo.total * 100); const gb = (b: number) => (b / 1073741824).toFixed(1); const mb = (b: number) => (b / 1048576).toFixed(1); return (
          <span style={{ fontSize: 9, color: pct > 90 ? '#EF4444' : pct > 70 ? '#F59E0B' : '#94a3b8', display: 'flex', alignItems: 'center', gap: 3 }}>
            S3:{diskInfo.s3Count ?? '?'}개/{mb(diskInfo.s3Size || 0)}MB DB:{mb(diskInfo.dbSize)}MB 디스크:{gb(diskInfo.used)}/{gb(diskInfo.total)}GB
          </span>);
        })()}
        <button onClick={() => { setEditingId(null); setShowForm(true); }}
          style={{ padding: '3px 10px', background: '#3B82F6', color: '#fff', border: 'none', borderRadius: 5, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
          <Plus size={11} />새 글
        </button>
      </div>

      {/* 콘텐츠 영역 */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {sorted.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 30, color: '#94a3b8', fontSize: 11 }}>등록된 글이 없습니다</div>
        ) : viewMode === 'table' ? (
          /* ═══ 테이블 뷰 ═══ */
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 1 }}>
                <th style={{ padding: '4px 6px', fontSize: 10, fontWeight: 700, color: '#475569', textAlign: 'left', width: 28 }}>#</th>
                {showCol('유형') && <th style={{ padding: '4px 6px', fontSize: 10, fontWeight: 700, color: '#475569', textAlign: 'left' }}>유형</th>}
                {showCol('부서') && <th style={{ padding: '4px 6px', fontSize: 10, fontWeight: 700, color: '#475569', textAlign: 'left' }}>부서</th>}
                {showCol('제목') && <th style={{ padding: '4px 6px', fontSize: 10, fontWeight: 700, color: '#475569', textAlign: 'left' }}>제목</th>}
                {showCol('내용') && <th style={{ padding: '4px 6px', fontSize: 10, fontWeight: 700, color: '#475569', textAlign: 'left' }}>내용</th>}
                {showCol('비고') && <th style={{ padding: '4px 6px', fontSize: 10, fontWeight: 700, color: '#475569', textAlign: 'left', minWidth: 60 }}>비고</th>}
                {showCol('첨부') && <th style={{ padding: '4px 6px', fontSize: 10, fontWeight: 700, color: '#475569', textAlign: 'left' }}>첨부</th>}
                {showCol('작성자') && <th style={{ padding: '4px 6px', fontSize: 10, fontWeight: 700, color: '#475569', textAlign: 'left' }}>작성자</th>}
                {showCol('진행') && <th style={{ padding: '4px 6px', fontSize: 10, fontWeight: 700, color: '#475569', textAlign: 'left' }}>진행</th>}
                {showCol('날짜') && <th style={{ padding: '4px 6px', fontSize: 10, fontWeight: 700, color: '#475569', textAlign: 'left' }}>날짜</th>}
                {showCol('액션') && <th style={{ padding: '4px 6px', fontSize: 10, fontWeight: 700, color: '#475569', width: 50 }}>액션</th>}
              </tr>
            </thead>
            <tbody>
              {sorted.map((post: any, idx: number) => {
                const pt = ptOf(post.data.type);
                const bg = getDeptBg(post.data.path);
                const isOpen = expandedRows.has(post.post_id);
                const atts = post.data.attachments || [];
                const cmts = getPostComments(post.post_id);
                return (
                  <tr key={post.post_id}
                    onClick={() => setDetailPost(post)}
                    style={{ background: bg, borderBottom: '1px solid #f1f5f9', cursor: 'pointer', transition: 'background 0.1s' }}
                    onMouseEnter={e => e.currentTarget.style.filter = 'brightness(0.97)'}
                    onMouseLeave={e => e.currentTarget.style.filter = ''}>
                    <td style={{ padding: '3px 6px', fontSize: 9, color: '#94a3b8' }}>{idx + 1}</td>
                    {showCol('유형') && <td style={{ padding: '3px 6px' }}><span style={{ padding: '1px 5px', borderRadius: 6, fontSize: 8, fontWeight: 700, background: pt.bg, color: pt.color }}>{post.data.type}</span></td>}
                    {showCol('부서') && <td style={{ padding: '3px 6px', fontSize: 10, color: '#475569', fontWeight: 500, maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{buildPathLabel(post.data)}</td>}
                    {showCol('제목') && <td style={{ padding: '3px 6px', fontSize: 11, color: '#1e293b', fontWeight: 600, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{post.data.pinned && <Pin size={9} color="#F59E0B" style={{ marginRight: 3 }} />}{post.data.title}</td>}
                    {showCol('내용') && <td style={{ padding: '3px 6px', fontSize: 10, color: '#64748b', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{post.data.content?.split('\n')[0] || '—'}</td>}
                    {showCol('비고') && <td style={{ padding: '3px 6px' }} onClick={e => { e.stopPropagation(); if (editingNoteId !== post.post_id) { setEditingNoteId(post.post_id); setEditingNoteVal((post.data as any).note || ''); } }}>
                      {editingNoteId === post.post_id ? (
                        <input value={editingNoteVal} onChange={e => setEditingNoteVal(e.target.value)} onBlur={() => saveNote(post)} onKeyDown={e => { if (e.key === 'Enter') saveNote(post); if (e.key === 'Escape') setEditingNoteId(null); }} autoFocus style={{ width: '100%', padding: '2px 4px', border: '1px solid #3B82F6', borderRadius: 4, fontSize: 10, outline: 'none' }} onClick={e => e.stopPropagation()} />
                      ) : (<span style={{ fontSize: 10, color: (post.data as any).note ? '#475569' : '#cbd5e1', cursor: 'text' }}>{(post.data as any).note || '비고'}</span>)}
                    </td>}
                    {showCol('첨부') && <td style={{ padding: '3px 6px', fontSize: 9, color: '#64748b' }}>{atts.length > 0 ? <span style={{ display: 'flex', alignItems: 'center', gap: 2 }}><Paperclip size={9} />{atts.length}</span> : '—'}</td>}
                    {showCol('작성자') && <td style={{ padding: '3px 6px', fontSize: 10, color: '#64748b' }}>{post.data.author}</td>}
                    {showCol('진행') && <td style={{ padding: '3px 6px', fontSize: 9 }}>{(() => { const p = getProgress?.(post.post_id); if (!p) return <span style={{ color: '#cbd5e1' }}>—</span>; const pct = p.totalTasks > 0 ? Math.round(p.doneTasks / p.totalTasks * 100) : 0; return <span style={{ color: pct === 100 ? '#10B981' : pct > 0 ? '#3B82F6' : '#94a3b8', fontWeight: 600 }}>{pct}%</span>; })()}</td>}
                    {showCol('날짜') && <td style={{ padding: '3px 6px', fontSize: 9, color: '#94a3b8' }}>{fmtDate(post.data.created_at)}</td>}
                    {showCol('액션') && <td style={{ padding: '3px 4px' }} onClick={e => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: 2 }}>
                        <button onClick={() => { setEditingId(post.post_id); setShowForm(true); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}><Pencil size={10} color="#94a3b8" /></button>
                        <button onClick={() => handleDelete(post.post_id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}><Trash2 size={10} color="#ef4444" /></button>
                        <button onClick={() => handleTogglePin(post)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>{post.data.pinned ? <PinOff size={10} color="#F59E0B" /> : <Pin size={10} color="#94a3b8" />}</button>
                      </div>
                    </td>}
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          /* ═══ 4단 그리드 뷰 ═══ */
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, padding: '8px 10px' }}>
            {sorted.map((post: any) => {
              const pt = ptOf(post.data.type);
              const bg = getDeptBg(post.data.path);
              return (
                <div key={post.post_id} onClick={() => setDetailPost(post)}
                  style={{ background: bg, borderRadius: 6, border: '1px solid #e2e8f0', padding: '6px 8px', cursor: 'pointer', overflow: 'hidden', boxShadow: post.data.pinned ? '0 0 0 1.5px #FBBF24' : 'none' }}
                  onMouseEnter={e => e.currentTarget.style.filter = 'brightness(0.97)'} onMouseLeave={e => e.currentTarget.style.filter = ''}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginBottom: 3 }}>
                    <span style={{ padding: '0px 4px', borderRadius: 4, fontSize: 8, fontWeight: 700, background: pt.bg, color: pt.color }}>{post.data.type}</span>
                    <span style={{ fontSize: 8, color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{buildPathLabel(post.data)}</span>
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#1e293b', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {post.data.pinned && <Pin size={8} color="#F59E0B" style={{ marginRight: 2 }} />}
                    {post.data.title}
                  </div>
                  <div style={{ fontSize: 9, color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 3 }}>
                    {post.data.content?.split('\n')[0] || '—'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 8, color: '#94a3b8' }}>
                    <span>{post.data.author}</span>
                    <span>{fmtDate(post.data.created_at)}</span>
                    {(post.data.attachments || []).length > 0 && <span><Paperclip size={8} />{post.data.attachments.length}</span>}
                    {getPostComments(post.post_id).length > 0 && <span><MessageSquare size={8} />{getPostComments(post.post_id).length}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ═══ 상세 팝업 (참고 UI 스타일 — 섹션별 펼치기/접기) ═══ */}
      {detailPost && <DetailPopup post={detailPost} onClose={() => setDetailPost(null)}
        ptOf={ptOf} buildPathLabel={buildPathLabel} fmtDate={fmtDate} fmtSize={fmtSize}
        getPostComments={getPostComments} fetchData={fetchData}
        handleDelete={handleDelete} handleTogglePin={handleTogglePin}
        setEditingId={setEditingId} setShowForm={setShowForm} setDetailPost={setDetailPost} />}
    </>
  );
}

/* ═══ Detail Popup ═══ */
function DetailPopup({ post, onClose, ptOf, buildPathLabel, fmtDate, fmtSize, getPostComments, fetchData, handleDelete, handleTogglePin, setEditingId, setShowForm, setDetailPost }: any) {
  const d = post.data;
  const pt = ptOf(d.type);
  const atts = d.attachments || [];
  const cmts = getPostComments(post.post_id);
  const [sections, setSections] = useState({ info: true, content: true, attach: true, comments: true });
  const [commentText, setCommentText] = useState('');
  const [commentAuthor, setCommentAuthor] = useState(() => localStorage.getItem('wh-author') || '');
  const toggle = (k: keyof typeof sections) => setSections(prev => ({ ...prev, [k]: !prev[k] }));

  const sendComment = async () => {
    if (!commentText.trim() || !commentAuthor.trim()) return;
    localStorage.setItem('wh-author', commentAuthor);
    await fetch('/api/work-hub-comments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ comment_id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), post_id: post.post_id, author: commentAuthor, content: commentText, created_at: new Date().toISOString() }) });
    setCommentText('');
    fetchData();
  };

  const bg = getDeptBg(d.path);

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 12, width: 720, maxHeight: '90vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
        {/* 헤더 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', borderBottom: '1px solid #e2e8f0', background: bg }}>
          <span style={{ padding: '2px 8px', borderRadius: 8, fontSize: 10, fontWeight: 700, background: pt.bg, color: pt.color }}>{d.type}</span>
          <span style={{ fontSize: 11, color: '#475569' }}>{buildPathLabel(d)}</span>
          {d.position?.map((p: string, i: number) => <span key={i} style={{ padding: '1px 5px', borderRadius: 6, fontSize: 9, background: '#F5F3FF', color: '#7C3AED' }}>{p}</span>)}
          <span style={{ flex: 1 }} />
          <button onClick={() => { setEditingId(post.post_id); setShowForm(true); setDetailPost(null); }} style={{ padding: '2px 8px', borderRadius: 5, border: '1px solid #e2e8f0', background: '#fff', fontSize: 10, cursor: 'pointer', color: '#475569' }}><Pencil size={10} /> 수정</button>
          <button onClick={() => { handleDelete(post.post_id); onClose(); }} style={{ padding: '2px 8px', borderRadius: 5, border: '1px solid #FECACA', background: '#FEF2F2', fontSize: 10, cursor: 'pointer', color: '#EF4444' }}><Trash2 size={10} /> 삭제</button>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={16} color="#94a3b8" /></button>
        </div>

        {/* 제목 */}
        <div style={{ padding: '10px 16px', borderBottom: '1px solid #f1f5f9' }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', margin: 0 }}>{d.pinned && <Pin size={12} color="#F59E0B" style={{ marginRight: 4 }} />}{d.title}</h2>
          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 3 }}>{d.author} · {fmtDate(d.created_at)}</div>
        </div>

        {/* ● 기본정보 */}
        <div style={{ borderBottom: '1px solid #f1f5f9' }}>
          <button onClick={() => toggle('info')} style={{ display: 'flex', alignItems: 'center', gap: 4, width: '100%', padding: '6px 16px', border: 'none', background: '#fafbfd', cursor: 'pointer', fontSize: 11, fontWeight: 700, color: '#475569', textAlign: 'left' }}>
            <span style={{ color: '#3B82F6' }}>●</span> 기본정보 {sections.info ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
          </button>
          {sections.info && (
            <div style={{ padding: '6px 16px 10px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px 12px', fontSize: 11 }}>
              <div><span style={{ color: '#94a3b8', fontSize: 9 }}>유형</span><div style={{ fontWeight: 600 }}>{d.type}</div></div>
              <div><span style={{ color: '#94a3b8', fontSize: 9 }}>부서</span><div style={{ fontWeight: 600 }}>{d.path?.join(' > ')}</div></div>
              <div><span style={{ color: '#94a3b8', fontSize: 9 }}>직급</span><div style={{ fontWeight: 600 }}>{d.position?.join(', ') || '—'}</div></div>
              <div><span style={{ color: '#94a3b8', fontSize: 9 }}>작성자</span><div style={{ fontWeight: 600 }}>{d.author}</div></div>
              <div><span style={{ color: '#94a3b8', fontSize: 9 }}>작성일</span><div>{fmtDate(d.created_at)}</div></div>
              <div><span style={{ color: '#94a3b8', fontSize: 9 }}>고정</span><div>{d.pinned ? '고정됨' : '—'}</div></div>
              <div style={{ gridColumn: 'span 2' }}><span style={{ color: '#94a3b8', fontSize: 9 }}>비고</span><div style={{ color: d.note ? '#475569' : '#cbd5e1' }}>{d.note || '—'}</div></div>
            </div>
          )}
        </div>

        {/* ● 내용 */}
        <div style={{ borderBottom: '1px solid #f1f5f9' }}>
          <button onClick={() => toggle('content')} style={{ display: 'flex', alignItems: 'center', gap: 4, width: '100%', padding: '6px 16px', border: 'none', background: '#fafbfd', cursor: 'pointer', fontSize: 11, fontWeight: 700, color: '#475569', textAlign: 'left' }}>
            <span style={{ color: '#10B981' }}>●</span> 내용 {sections.content ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
          </button>
          {sections.content && (
            <div style={{ padding: '8px 16px 12px', fontSize: 13, color: '#334155', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
              {d.content || <span style={{ color: '#cbd5e1' }}>내용 없음</span>}
            </div>
          )}
        </div>

        {/* ● 첨부파일 */}
        <div style={{ borderBottom: '1px solid #f1f5f9' }}>
          <button onClick={() => toggle('attach')} style={{ display: 'flex', alignItems: 'center', gap: 4, width: '100%', padding: '6px 16px', border: 'none', background: '#fafbfd', cursor: 'pointer', fontSize: 11, fontWeight: 700, color: '#475569', textAlign: 'left' }}>
            <span style={{ color: '#F59E0B' }}>●</span> 첨부 ({atts.length}) {sections.attach ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
          </button>
          {sections.attach && (
            <div style={{ padding: '6px 16px 10px' }}>
              {atts.length === 0 ? <div style={{ fontSize: 11, color: '#cbd5e1' }}>첨부파일 없음</div> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {atts.map((att: any, i: number) => (
                    <a key={i} href={att.url} {...(att.type === 'link' ? { target: '_blank', rel: 'noopener noreferrer' } : { download: att.name })}
                      style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', background: '#f8fafc', borderRadius: 6, border: '1px solid #e2e8f0', textDecoration: 'none', color: '#334155', fontSize: 12 }}>
                      {att.type === 'image' && <ImageIcon size={14} color="#3B82F6" />}
                      {att.type === 'file' && <File size={14} color="#F59E0B" />}
                      {att.type === 'link' && <ExternalLink size={14} color="#10B981" />}
                      <span style={{ flex: 1 }}>{att.name}</span>
                      {att.size && <span style={{ fontSize: 10, color: '#94a3b8' }}>{fmtSize(att.size)}</span>}
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ● 댓글 */}
        <div>
          <button onClick={() => toggle('comments')} style={{ display: 'flex', alignItems: 'center', gap: 4, width: '100%', padding: '6px 16px', border: 'none', background: '#fafbfd', cursor: 'pointer', fontSize: 11, fontWeight: 700, color: '#475569', textAlign: 'left' }}>
            <span style={{ color: '#6366F1' }}>●</span> 댓글 ({cmts.length}) {sections.comments ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
          </button>
          {sections.comments && (
            <div style={{ padding: '6px 16px 10px' }}>
              {cmts.map((c: any) => (
                <div key={c.comment_id} style={{ display: 'flex', gap: 8, marginBottom: 8, fontSize: 12 }}>
                  <div style={{ width: 24, height: 24, borderRadius: 12, background: '#E0E7FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600, color: '#6366F1', flexShrink: 0 }}>{c.data.author?.charAt(0)}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: 6, fontSize: 11 }}><strong>{c.data.author}</strong><span style={{ color: '#94a3b8', fontSize: 10 }}>{fmtDate(c.data.created_at)}</span></div>
                    <div style={{ color: '#334155', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{c.data.content}</div>
                  </div>
                </div>
              ))}
              {/* 댓글 입력 */}
              <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                <input value={commentAuthor} onChange={e => setCommentAuthor(e.target.value)} placeholder="이름" style={{ width: 60, padding: '5px 7px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 11 }} />
                <input value={commentText} onChange={e => setCommentText(e.target.value)} placeholder="댓글 입력 (Enter)" style={{ flex: 1, padding: '5px 7px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 11 }}
                  onKeyDown={e => { if (e.key === 'Enter') sendComment(); }} />
                <button onClick={sendComment} style={{ padding: '5px 10px', background: '#3B82F6', color: '#fff', border: 'none', borderRadius: 6, fontSize: 11, cursor: 'pointer' }}><Send size={11} /></button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
