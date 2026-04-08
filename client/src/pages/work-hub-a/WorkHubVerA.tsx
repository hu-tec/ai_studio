import { useState, lazy, Suspense } from 'react';
import { toast } from 'sonner';
import { useWorkHubData } from './hooks/useWorkHubData';
import { useGlobalFilter } from './hooks/useGlobalFilter';
import { useWorkLogSync } from './hooks/useWorkLogSync';
import NavRail from './nav/NavRail';
import TaskBoard from './sections/TaskBoard';
import LinksSection from './sections/LinksSection';
import SystemSection from './sections/SystemSection';
import ArchiveSection from './sections/ArchiveSection';
import PipelineSection from './sections/PipelineSection';
import type { HubPost } from './types';
import { genId, CATEGORY_TREE, DEF_LARGE, DEF_POS, POST_TYPE_STYLES, TASK_STATUSES, TASK_STATUS_STYLES, STAFF_NAMES } from './constants';

// lazy load heavier sections
const FeedSection = lazy(() => import('./sections/FeedSection'));
const StatusSection = lazy(() => import('./sections/StatusSection'));

/* ═══ PostForm 간소 (ver.B에서 가져와 축소) ═══ */
import { Plus, X, Upload, Link as LinkIcon, FolderOpen, ChevronDown, ChevronRight, Image as ImageIcon, File, ExternalLink } from 'lucide-react';
import type { PostType, Attachment } from './types';

function PostForm({ editData, defaultPath, onClose, onSaved }: { editData?: HubPost; defaultPath: string[]; onClose: () => void; onSaved: () => void }) {
  const isEdit = !!editData;
  const [postType, setPostType] = useState<PostType>(editData?.data.type || '메모');
  const [selLarge, setSelLarge] = useState(editData?.data.path[0] || defaultPath[0] || '');
  const [selMid, setSelMid] = useState(editData?.data.path[1] || defaultPath[1] || '');
  const [selSmall, setSelSmall] = useState(editData?.data.path[2] || defaultPath[2] || '');
  const [pos, setPos] = useState<string[]>(editData?.data.position || []);
  const [title, setTitle] = useState(editData?.data.title || '');
  const [content, setContent] = useState(editData?.data.content || '');
  const [author, setAuthor] = useState(editData?.data.author || localStorage.getItem('wh-author') || '');
  const [note, setNote] = useState(editData ? (editData.data as any).note || '' : '');
  const [status, setStatus] = useState(editData?.data.status || '할당대기');
  const [assignee, setAssignee] = useState(editData?.data.assignee || '');
  const [attachments, setAttachments] = useState<Attachment[]>(editData?.data.attachments || []);
  const [saving, setSaving] = useState(false);
  const [showClassify, setShowClassify] = useState(!selLarge);

  const midOptions = selLarge && CATEGORY_TREE[selLarge] ? Object.keys(CATEGORY_TREE[selLarge]) : [];
  const smallOptions = selLarge && selMid && CATEGORY_TREE[selLarge]?.[selMid] ? CATEGORY_TREE[selLarge][selMid] : [];
  const pathLabel = [selLarge, selMid, selSmall].filter(Boolean).join(' > ');

  const save = async () => {
    if (!selLarge || !title || !author) { toast.error('경로, 제목, 작성자 필수'); return; }
    setSaving(true); localStorage.setItem('wh-author', author);
    const path: [string, string?, string?] = [selLarge]; if (selMid) path.push(selMid); if (selSmall) path.push(selSmall);
    const payload: any = { type: postType, path, position: pos, title, content, attachments, author, note, status, assignee, pinned: editData?.data.pinned || false, created_at: editData?.data.created_at || new Date().toISOString() };
    try {
      if (isEdit && editData) await fetch(`/api/work-hub/${editData.post_id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      else await fetch('/api/work-hub', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...payload, post_id: genId() }) });
      toast.success(isEdit ? '수정됨' : '등록됨'); onSaved();
    } catch { toast.error('실패'); } finally { setSaving(false); }
  };

  const S: React.CSSProperties = { padding: '2px 8px', borderRadius: 10, border: '1px solid', fontSize: 10, cursor: 'pointer' };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 10, width: 580, maxHeight: '88vh', overflow: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '8px 12px', borderBottom: '1px solid #f1f5f9' }}>
          <span style={{ fontSize: 13, fontWeight: 700, flex: 1 }}>{isEdit ? '수정' : '새 업무'}</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={14} color="#94a3b8" /></button>
        </div>
        <div style={{ padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {/* 유형 + 상태 */}
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: 9, color: '#94a3b8', fontWeight: 600 }}>유형</span>
              <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', marginTop: 2 }}>
                {(Object.keys(POST_TYPE_STYLES) as PostType[]).map(t => { const s = POST_TYPE_STYLES[t]; return <button key={t} type="button" onClick={() => setPostType(t)} style={{ ...S, borderColor: postType === t ? s.color : '#e2e8f0', background: postType === t ? s.bg : '#fff', color: postType === t ? s.color : '#64748b', fontWeight: postType === t ? 600 : 400 }}>{s.icon}{t}</button>; })}
              </div>
            </div>
            <div>
              <span style={{ fontSize: 9, color: '#94a3b8', fontWeight: 600 }}>상태</span>
              <div style={{ display: 'flex', gap: 3, marginTop: 2 }}>
                {TASK_STATUSES.map(s => { const st = TASK_STATUS_STYLES[s]; return <button key={s} type="button" onClick={() => setStatus(s as any)} style={{ ...S, borderColor: status === s ? st.color : '#e2e8f0', background: status === s ? st.bg : '#fff', color: status === s ? st.color : '#64748b', fontWeight: status === s ? 600 : 400 }}>{s}</button>; })}
              </div>
            </div>
          </div>

          {/* 분류 접힘 */}
          <div style={{ background: '#f8fafc', borderRadius: 6, border: '1px solid #e2e8f0' }}>
            <button onClick={() => setShowClassify(!showClassify)} type="button" style={{ display: 'flex', alignItems: 'center', gap: 4, width: '100%', padding: '4px 8px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 10, color: '#475569', fontWeight: 600, textAlign: 'left' }}>
              <FolderOpen size={10} color="#3B82F6" /> 경로: {pathLabel || '미선택'} {showClassify ? <ChevronDown size={9} /> : <ChevronRight size={9} />}
            </button>
            {showClassify && <div style={{ padding: '4px 8px', borderTop: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: 3 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}><span style={{ fontSize: 8, color: '#94a3b8', fontWeight: 600, minWidth: 32 }}>대분류</span>
                {DEF_LARGE.map(d => <button key={d} type="button" onClick={() => { setSelLarge(selLarge === d ? '' : d); setSelMid(''); setSelSmall(''); }} style={{ ...S, borderColor: selLarge === d ? '#3B82F6' : '#e2e8f0', background: selLarge === d ? '#EFF6FF' : '#fff', color: selLarge === d ? '#3B82F6' : '#64748b', fontWeight: selLarge === d ? 600 : 400 }}>{d}</button>)}</div>
              {midOptions.length > 0 && <div style={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}><span style={{ fontSize: 8, color: '#94a3b8', fontWeight: 600, minWidth: 32 }}>중분류</span>
                {midOptions.map(d => <button key={d} type="button" onClick={() => { setSelMid(selMid === d ? '' : d); setSelSmall(''); }} style={{ ...S, borderColor: selMid === d ? '#22C55E' : '#e2e8f0', background: selMid === d ? '#F0FDF4' : '#fff', color: selMid === d ? '#22C55E' : '#64748b', fontWeight: selMid === d ? 600 : 400 }}>{d}</button>)}</div>}
              {smallOptions.length > 0 && <div style={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}><span style={{ fontSize: 8, color: '#94a3b8', fontWeight: 600, minWidth: 32 }}>소분류</span>
                {smallOptions.map(d => <button key={d} type="button" onClick={() => setSelSmall(selSmall === d ? '' : d)} style={{ ...S, borderColor: selSmall === d ? '#F59E0B' : '#e2e8f0', background: selSmall === d ? '#FFFBEB' : '#fff', color: selSmall === d ? '#F59E0B' : '#64748b', fontWeight: selSmall === d ? 600 : 400 }}>{d}</button>)}</div>}
              <div style={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}><span style={{ fontSize: 8, color: '#94a3b8', fontWeight: 600, minWidth: 32 }}>직급</span>
                {DEF_POS.map(d => <button key={d} type="button" onClick={() => setPos(pos.includes(d) ? pos.filter(x => x !== d) : [...pos, d])} style={{ ...S, borderColor: pos.includes(d) ? '#7C3AED' : '#e2e8f0', background: pos.includes(d) ? '#F5F3FF' : '#fff', color: pos.includes(d) ? '#7C3AED' : '#64748b', fontWeight: pos.includes(d) ? 600 : 400 }}>{d}</button>)}</div>
            </div>}
          </div>

          {/* 작성자 + 담당자 — 칩 선택 */}
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: 9, color: '#94a3b8', fontWeight: 600 }}>작성자*</span>
              <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap', marginTop: 2 }}>
                {STAFF_NAMES.map(n => <button key={n} type="button" onClick={() => { setAuthor(n); localStorage.setItem('wh-author', n); }} style={{ ...S, borderColor: author === n ? '#3B82F6' : '#e2e8f0', background: author === n ? '#EFF6FF' : '#fff', color: author === n ? '#3B82F6' : '#64748b', fontWeight: author === n ? 600 : 400 }}>{n}</button>)}
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: 9, color: '#94a3b8', fontWeight: 600 }}>담당자</span>
              <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap', marginTop: 2 }}>
                {STAFF_NAMES.map(n => <button key={n} type="button" onClick={() => setAssignee(assignee === n ? '' : n)} style={{ ...S, borderColor: assignee === n ? '#10B981' : '#e2e8f0', background: assignee === n ? '#F0FDF4' : '#fff', color: assignee === n ? '#10B981' : '#64748b', fontWeight: assignee === n ? 600 : 400 }}>{n}</button>)}
              </div>
            </div>
          </div>
          {/* 제목 */}
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="제목*" style={{ width: '100%', padding: '4px 6px', border: '1px solid #e2e8f0', borderRadius: 5, fontSize: 11, outline: 'none' }} />
          <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="내용..." rows={3} style={{ width: '100%', padding: '4px 6px', border: '1px solid #e2e8f0', borderRadius: 5, fontSize: 11, outline: 'none', resize: 'vertical', fontFamily: 'inherit' }} />
          <input value={note} onChange={e => setNote(e.target.value)} placeholder="비고" style={{ width: '100%', padding: '4px 6px', border: '1px solid #e2e8f0', borderRadius: 5, fontSize: 11, outline: 'none' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6, padding: '6px 12px', borderTop: '1px solid #f1f5f9' }}>
          <button onClick={onClose} style={{ padding: '4px 12px', background: '#f1f5f9', border: 'none', borderRadius: 5, fontSize: 11, cursor: 'pointer', color: '#64748b' }}>취소</button>
          <button onClick={save} disabled={saving} style={{ padding: '4px 12px', background: '#3B82F6', color: '#fff', border: 'none', borderRadius: 5, fontSize: 11, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer' }}>{saving ? '저장...' : isEdit ? '수정' : '등록'}</button>
        </div>
      </div>
    </div>
  );
}

/* ═══ DetailPopup 간소 ═══ */
function DetailPopup({ post, onClose }: { post: HubPost; onClose: () => void }) {
  const d = post.data;
  const pt = POST_TYPE_STYLES[d.type];
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 10, width: 640, maxHeight: '85vh', overflow: 'auto' }}>
        <div style={{ padding: '8px 12px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ padding: '1px 6px', borderRadius: 6, fontSize: 9, fontWeight: 700, background: pt.bg, color: pt.color }}>{pt.icon}{d.type}</span>
          <span style={{ fontSize: 10, color: '#64748b' }}>{(d.path || []).filter(Boolean).join(' > ')}</span>
          <span style={{ flex: 1 }} />
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={14} color="#94a3b8" /></button>
        </div>
        <div style={{ padding: '10px 14px' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 4px' }}>{d.title}</h3>
          <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 8 }}>{d.author} · {d.assignee ? `담당:${d.assignee}` : ''} · {d.status || '할당대기'}</div>
          {d.content && <div style={{ fontSize: 12, color: '#334155', lineHeight: 1.6, whiteSpace: 'pre-wrap', padding: '8px 10px', background: '#f8fafc', borderRadius: 6, marginBottom: 8 }}>{d.content}</div>}
          {d.note && <div style={{ fontSize: 11, color: '#64748b', padding: '6px 10px', background: '#FFFBEB', borderRadius: 6, marginBottom: 8 }}>비고: {d.note}</div>}
          {(d.attachments || []).length > 0 && <div style={{ marginBottom: 8 }}>{d.attachments.map((att, i) => (
            <a key={i} href={att.url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px', background: '#f8fafc', borderRadius: 5, border: '1px solid #e2e8f0', textDecoration: 'none', color: '#334155', fontSize: 11, marginBottom: 3 }}>
              {att.type === 'image' ? <ImageIcon size={12} color="#3B82F6" /> : att.type === 'link' ? <ExternalLink size={12} color="#10B981" /> : <File size={12} color="#F59E0B" />}
              {att.name}
            </a>
          ))}</div>}
        </div>
      </div>
    </div>
  );
}

/* ═══ Main Component ═══ */
export default function WorkHubVerA() {
  const { posts, comments, loading, fetchData, handleDelete, handleTogglePin, handleSaveField, getPostComments } = useWorkHubData();
  const filter = useGlobalFilter(posts);
  const { getProgress } = useWorkLogSync();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [detailPost, setDetailPost] = useState<HubPost | null>(null);

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8', fontSize: 12 }}>로딩...</div>;

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 64px)', overflow: 'hidden' }}>
      <NavRail
        activePipeline={filter.activePipeline} setActivePipeline={filter.setActivePipeline}
        activeSection={filter.activeSection} setActiveSection={filter.setActiveSection}
        postCount={filter.sorted.length}
      />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {filter.activeSection === 'board' && (
          <TaskBoard
            sorted={filter.sorted} posts={posts} allAuthors={filter.allAuthors}
            filterType={filter.filterType} setFilterType={filter.setFilterType}
            filterPos={filter.filterPos} setFilterPos={filter.setFilterPos}
            filterAuthor={filter.filterAuthor} setFilterAuthor={filter.setFilterAuthor}
            searchText={filter.searchText} setSearchText={filter.setSearchText}
            anyFilterActive={filter.anyFilterActive} resetFilters={filter.resetFilters}
            handleDelete={handleDelete} handleTogglePin={handleTogglePin} handleSaveField={handleSaveField}
            getPostComments={getPostComments} setShowForm={setShowForm} setEditingId={setEditingId}
            onDetail={setDetailPost} getProgress={getProgress}
          />
        )}
        {filter.activeSection === 'feed' && (
          <Suspense fallback={<div style={{ padding: 20, color: '#94a3b8', fontSize: 11 }}>로딩...</div>}>
            <FeedSection
              sorted={filter.sorted} posts={posts} comments={comments}
              searchText={filter.searchText} setSearchText={filter.setSearchText}
              anyFilterActive={filter.anyFilterActive} resetFilters={filter.resetFilters}
              activePath={filter.activePath} setActivePath={filter.setActivePath}
              setShowForm={setShowForm} setEditingId={setEditingId}
              handleDelete={handleDelete} handleTogglePin={handleTogglePin}
              getPostComments={getPostComments} fetchData={fetchData}
            />
          </Suspense>
        )}
        {filter.activeSection === 'pipeline' && (
          <PipelineSection filterType={filter.filterType === '전체' ? undefined : filter.filterType} activePath={filter.activePath} activePipeline={filter.activePipeline} />
        )}
        {filter.activeSection === 'status' && (
          <Suspense fallback={<div style={{ padding: 20, color: '#94a3b8', fontSize: 11 }}>로딩...</div>}>
            <StatusSection filterType={filter.filterType === '전체' ? undefined : filter.filterType} activePath={filter.activePath} activePipeline={filter.activePipeline} />
          </Suspense>
        )}
        {filter.activeSection === 'archive' && <ArchiveSection posts={posts} onDetail={setDetailPost} />}
        {filter.activeSection === 'links' && <LinksSection />}
        {filter.activeSection === 'system' && <SystemSection />}
      </div>

      {showForm && <PostForm editData={editingId ? posts.find(p => p.post_id === editingId) : undefined} defaultPath={filter.activePath} onClose={() => { setShowForm(false); setEditingId(null); }} onSaved={() => { setShowForm(false); setEditingId(null); fetchData(); }} />}
      {detailPost && <DetailPopup post={detailPost} onClose={() => setDetailPost(null)} />}
    </div>
  );
}
