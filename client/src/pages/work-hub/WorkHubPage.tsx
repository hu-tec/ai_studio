import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import {
  Plus, Trash2, Pencil, X, Upload, Link as LinkIcon,
  Image as ImageIcon, Send, MessageSquare, Pin, PinOff,
  Search, File, ExternalLink, Download, ChevronDown, ChevronRight,
  Megaphone, FileText, Briefcase, FolderOpen, ClipboardList, BarChart3,
  Filter, Hash, Paperclip, Clock, User
} from 'lucide-react';

/* ══════════════════════════════════════════════════════════════
   Types
   ══════════════════════════════════════════════════════════════ */
interface Attachment {
  type: 'image' | 'link' | 'file';
  url: string;
  name: string;
  size?: number;
}

interface HubPostData {
  type: PostType;
  department: string[];   // 대분류
  category2: string[];    // 중분류
  category3: string[];    // 소분류
  position: string[];     // 대상 직급
  title: string;
  content: string;
  attachments: Attachment[];
  author: string;
  pinned: boolean;
  created_at: string;
}

interface HubPost {
  id: number;
  post_id: string;
  data: HubPostData;
  updated_at: string;
}

interface CommentData {
  post_id: string;
  author: string;
  content: string;
  created_at: string;
}

interface HubComment {
  id: number;
  comment_id: string;
  post_id: string;
  data: CommentData;
  created_at: string;
}

type PostType = '공지' | '업무지시' | '메모' | '파일' | '프로세스' | '보고';

/* ══════════════════════════════════════════════════════════════
   Constants — C_시스템3축 분류
   ══════════════════════════════════════════════════════════════ */
const DEF_DEPTS = ['경영', '개발', '마케팅', '인사', '영업', '강사팀', '기획', '홈페이지', '상담', '총무', '관리'];
const DEF_CAT2 = ['규정', '교육', '홍보', '기술', '운영'];
const DEF_CAT3 = ['급여', '복무', '교안', '브로슈어', '서버', '시스템', '기타'];
const DEF_POS = ['대표', '임원', '팀장', '강사', '신입', '알바', '외부'];

const POST_TYPES: { type: PostType; icon: typeof Megaphone; color: string; bg: string }[] = [
  { type: '공지',     icon: Megaphone,     color: '#DC2626', bg: '#FEF2F2' },
  { type: '업무지시', icon: ClipboardList,  color: '#7C3AED', bg: '#F5F3FF' },
  { type: '메모',     icon: FileText,       color: '#0EA5E9', bg: '#F0F9FF' },
  { type: '파일',     icon: FolderOpen,     color: '#F59E0B', bg: '#FFFBEB' },
  { type: '프로세스', icon: Briefcase,      color: '#10B981', bg: '#F0FDF4' },
  { type: '보고',     icon: BarChart3,      color: '#6366F1', bg: '#EEF2FF' },
];

const LS_KEY = 'wh-custom-filters';
const toArr = (v: unknown): string[] => Array.isArray(v) ? v : typeof v === 'string' && v ? [v] : [];

function loadCustom(): Record<string, string[]> {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '{}'); } catch { return {}; }
}
function saveCustom(c: Record<string, string[]>) { localStorage.setItem(LS_KEY, JSON.stringify(c)); }

function fmtDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 60000) return '방금 전';
  if (diff < 3600000) return `${Math.floor(diff/60000)}분 전`;
  if (diff < 86400000) return `${Math.floor(diff/3600000)}시간 전`;
  if (diff < 604800000) return `${Math.floor(diff/86400000)}일 전`;
  return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`;
}
function fmtSize(b: number) { if(b<1024) return `${b}B`; if(b<1048576) return `${(b/1024).toFixed(0)}KB`; return `${(b/1048576).toFixed(1)}MB`; }

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2,8);
}

/** 경로 표시: 001 신입 경영_규정_급여 */
function buildPath(idx: number, post: HubPostData) {
  const num = String(idx).padStart(3, '0');
  const pos = post.position.length ? post.position[0] : '—';
  const cat = [
    post.department.join('+') || '—',
    post.category2.length ? post.category2.join('+') : null,
    post.category3.length ? post.category3.join('+') : null,
  ].filter(Boolean).join('_');
  return `${num} ${pos} ${cat}`;
}

/* ══════════════════════════════════════════════════════════════
   Main Page
   ══════════════════════════════════════════════════════════════ */
export default function WorkHubPage() {
  const [posts, setPosts] = useState<HubPost[]>([]);
  const [comments, setComments] = useState<HubComment[]>([]);
  const [loading, setLoading] = useState(true);

  // UI state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string|null>(null);
  const [threadOpen, setThreadOpen] = useState<string|null>(null);
  const [searchText, setSearchText] = useState('');

  // filters
  const [filterType, setFilterType] = useState<PostType|'전체'>('전체');
  const [filterDept, setFilterDept] = useState<string[]>([]);
  const [filterCat2, setFilterCat2] = useState<string[]>([]);
  const [filterCat3, setFilterCat3] = useState<string[]>([]);
  const [filterPos, setFilterPos] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // custom
  const [custom, setCustom] = useState<Record<string,string[]>>(loadCustom);
  const updateCustom = (key: string, items: string[]) => { const next = {...custom, [key]: items}; setCustom(next); saveCustom(next); };

  // sidebar category tree collapse
  const [collapsedDepts, setCollapsedDepts] = useState<Set<string>>(new Set());

  const fetchData = useCallback(async () => {
    try {
      const [postsRes, commentsRes] = await Promise.all([
        fetch('/api/work-hub'), fetch('/api/work-hub-comments')
      ]);
      const postsRaw = await postsRes.json();
      const commentsRaw = await commentsRes.json();

      const parsed: HubPost[] = (Array.isArray(postsRaw) ? postsRaw : []).map((r: any) => {
        const d = typeof r.data === 'string' ? JSON.parse(r.data) : r.data;
        return {
          ...r, data: {
            ...d,
            type: d.type || '메모',
            department: toArr(d.department), category2: toArr(d.category2),
            category3: toArr(d.category3), position: toArr(d.position),
            attachments: d.attachments || [], content: d.content || '',
            author: d.author || '', pinned: !!d.pinned,
            created_at: d.created_at || r.updated_at || '',
          }
        };
      });

      const parsedComments: HubComment[] = (Array.isArray(commentsRaw) ? commentsRaw : []).map((r: any) => {
        const d = typeof r.data === 'string' ? JSON.parse(r.data) : r.data;
        return { ...r, post_id: d.post_id, data: d };
      });

      setPosts(parsed);
      setComments(parsedComments);
    } catch { setPosts([]); setComments([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // derived
  const mergedDepts = [...DEF_DEPTS, ...(custom['dept']||[])];
  const mergedCat2 = [...DEF_CAT2, ...(custom['cat2']||[])];
  const mergedCat3 = [...DEF_CAT3, ...(custom['cat3']||[])];
  const mergedPos = [...DEF_POS, ...(custom['pos']||[])];

  const filtered = posts.filter(r => {
    const d = r.data;
    if (filterType !== '전체' && d.type !== filterType) return false;
    if (filterDept.length && !filterDept.some(f => d.department.includes(f))) return false;
    if (filterCat2.length && !filterCat2.some(f => d.category2.includes(f))) return false;
    if (filterCat3.length && !filterCat3.some(f => d.category3.includes(f))) return false;
    if (filterPos.length && !filterPos.some(f => d.position.includes(f))) return false;
    if (searchText) {
      const s = searchText.toLowerCase();
      if (!d.title.toLowerCase().includes(s) && !d.content.toLowerCase().includes(s) && !d.author.toLowerCase().includes(s)) return false;
    }
    return true;
  });

  // pinned first, then by date desc
  const sorted = [...filtered].sort((a, b) => {
    if (a.data.pinned && !b.data.pinned) return -1;
    if (!a.data.pinned && b.data.pinned) return 1;
    return new Date(b.data.created_at).getTime() - new Date(a.data.created_at).getTime();
  });

  const anyFilterActive = filterType !== '전체' || filterDept.length > 0 || filterCat2.length > 0 || filterCat3.length > 0 || filterPos.length > 0 || !!searchText;

  const handleDelete = async (pid: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
      await fetch(`/api/work-hub/${pid}`, { method: 'DELETE' });
      setPosts(p => p.filter(r => r.post_id !== pid));
      // 관련 댓글도 삭제
      const related = comments.filter(c => c.data.post_id === pid);
      for (const c of related) { try { await fetch(`/api/work-hub-comments/${c.comment_id}`, { method: 'DELETE' }); } catch {} }
      setComments(p => p.filter(c => c.data.post_id !== pid));
      toast.success('삭제되었습니다');
    } catch { toast.error('삭제 실패'); }
  };

  const handleTogglePin = async (post: HubPost) => {
    const payload = { ...post.data, pinned: !post.data.pinned };
    try {
      await fetch(`/api/work-hub/${post.post_id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      setPosts(prev => prev.map(p => p.post_id === post.post_id ? { ...p, data: { ...p.data, pinned: !p.data.pinned } } : p));
      toast.success(post.data.pinned ? '고정 해제' : '상단 고정됨');
    } catch { toast.error('실패'); }
  };

  // sidebar: count by department
  const deptCounts = new Map<string, number>();
  posts.forEach(p => p.data.department.forEach(d => deptCounts.set(d, (deptCounts.get(d) || 0) + 1)));

  const getPostComments = (pid: string) => comments.filter(c => c.data.post_id === pid).sort((a, b) => new Date(a.data.created_at).getTime() - new Date(b.data.created_at).getTime());

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>로딩 중...</div>;

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 64px)', overflow: 'hidden' }}>
      {/* ── 좌측: 카테고리 사이드바 ── */}
      <div style={{ width: 240, flexShrink: 0, borderRight: '1px solid #e2e8f0', background: '#f8fafc', overflow: 'auto', padding: '16px 0' }}>
        <div style={{ padding: '0 16px', marginBottom: 16 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', margin: '0 0 12px' }}>업무 총괄</h2>
          {/* 유형별 필터 */}
          <button onClick={() => setFilterType('전체')}
            style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 10px', borderRadius: 8, border: 'none', background: filterType === '전체' ? '#EFF6FF' : 'transparent', color: filterType === '전체' ? '#3B82F6' : '#64748b', fontSize: 13, fontWeight: filterType === '전체' ? 600 : 400, cursor: 'pointer', marginBottom: 2, textAlign: 'left' }}>
            <Hash size={15} /> 전체 <span style={{ marginLeft: 'auto', fontSize: 11, color: '#94a3b8' }}>{posts.length}</span>
          </button>
          {POST_TYPES.map(pt => (
            <button key={pt.type} onClick={() => setFilterType(pt.type)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 10px', borderRadius: 8, border: 'none', background: filterType === pt.type ? pt.bg : 'transparent', color: filterType === pt.type ? pt.color : '#64748b', fontSize: 13, fontWeight: filterType === pt.type ? 600 : 400, cursor: 'pointer', marginBottom: 2, textAlign: 'left' }}>
              <pt.icon size={15} /> {pt.type}
              <span style={{ marginLeft: 'auto', fontSize: 11, color: '#94a3b8' }}>{posts.filter(p => p.data.type === pt.type).length}</span>
            </button>
          ))}
        </div>

        {/* 부서별 트리 */}
        <div style={{ borderTop: '1px solid #e2e8f0', padding: '12px 16px' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 8, letterSpacing: 0.5 }}>C_시스템3축 분류</div>
          {mergedDepts.filter(d => deptCounts.has(d)).map(dept => {
            const isCollapsed = collapsedDepts.has(dept);
            const count = deptCounts.get(dept) || 0;
            const isActive = filterDept.includes(dept);
            return (
              <div key={dept}>
                <button onClick={() => {
                  setFilterDept(prev => prev.includes(dept) ? prev.filter(x => x !== dept) : [...prev, dept]);
                }}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%', padding: '6px 8px', borderRadius: 6, border: 'none', background: isActive ? '#EFF6FF' : 'transparent', color: isActive ? '#3B82F6' : '#475569', fontSize: 13, cursor: 'pointer', textAlign: 'left' }}>
                  <span onClick={e => { e.stopPropagation(); setCollapsedDepts(prev => { const n = new Set(prev); if (n.has(dept)) n.delete(dept); else n.add(dept); return n; }); }} style={{ display: 'flex', cursor: 'pointer' }}>
                    {isCollapsed ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
                  </span>
                  <FolderOpen size={13} />
                  <span style={{ flex: 1 }}>{dept}</span>
                  <span style={{ fontSize: 10, color: '#94a3b8' }}>{count}</span>
                </button>
                {!isCollapsed && (
                  <div style={{ paddingLeft: 28 }}>
                    {mergedCat2.filter(c2 => posts.some(p => p.data.department.includes(dept) && p.data.category2.includes(c2))).map(c2 => (
                      <button key={c2} onClick={() => { setFilterDept(prev => prev.includes(dept) ? prev : [...prev, dept]); setFilterCat2(prev => prev.includes(c2) ? prev.filter(x => x !== c2) : [...prev, c2]); }}
                        style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%', padding: '4px 6px', borderRadius: 4, border: 'none', background: filterCat2.includes(c2) ? '#F0FDF4' : 'transparent', color: filterCat2.includes(c2) ? '#22C55E' : '#94a3b8', fontSize: 12, cursor: 'pointer', textAlign: 'left' }}>
                        <span style={{ width: 4, height: 4, borderRadius: 2, background: '#cbd5e1', flexShrink: 0 }} />
                        {c2}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 중앙: 피드 영역 ── */}
      <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
        {/* 상단 바 */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #e2e8f0', background: '#fff', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: 400 }}>
            <Search size={16} style={{ position: 'absolute', left: 10, top: 10, color: '#94a3b8' }} />
            <input value={searchText} onChange={e => setSearchText(e.target.value)} placeholder="제목, 내용, 작성자 검색..."
              style={{ width: '100%', padding: '8px 12px 8px 34px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, outline: 'none' }} />
          </div>
          <button onClick={() => setShowFilters(!showFilters)}
            style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '8px 14px', background: showFilters ? '#EFF6FF' : '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, cursor: 'pointer', color: showFilters ? '#3B82F6' : '#64748b' }}>
            <Filter size={14} /> 상세 필터
          </button>
          {anyFilterActive && (
            <button onClick={() => { setFilterType('전체'); setFilterDept([]); setFilterCat2([]); setFilterCat3([]); setFilterPos([]); setSearchText(''); }}
              style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '8px 14px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, fontSize: 13, cursor: 'pointer', color: '#EF4444' }}>
              <X size={14} /> 초기화
            </button>
          )}
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: 13, color: '#94a3b8' }}>{sorted.length}건{anyFilterActive ? ` / ${posts.length}건` : ''}</span>
          <button onClick={() => { setEditingId(null); setShowForm(true); }}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px', background: '#3B82F6', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            <Plus size={16} /> 새 글
          </button>
        </div>

        {/* 상세 필터 패널 */}
        {showFilters && (
          <div style={{ padding: '12px 24px', borderBottom: '1px solid #e2e8f0', background: '#fafbfd', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <MultiChipFilter label="대분류" items={mergedDepts} defaults={DEF_DEPTS} value={filterDept} onChange={setFilterDept} customKey="dept" custom={custom} updateCustom={updateCustom} />
            <MultiChipFilter label="중분류" items={mergedCat2} defaults={DEF_CAT2} value={filterCat2} onChange={setFilterCat2} customKey="cat2" custom={custom} updateCustom={updateCustom} />
            <MultiChipFilter label="소분류" items={mergedCat3} defaults={DEF_CAT3} value={filterCat3} onChange={setFilterCat3} customKey="cat3" custom={custom} updateCustom={updateCustom} />
            <MultiChipFilter label="직급" items={mergedPos} defaults={DEF_POS} value={filterPos} onChange={setFilterPos} customKey="pos" custom={custom} updateCustom={updateCustom} />
          </div>
        )}

        {/* 피드 */}
        <div style={{ flex: 1, overflow: 'auto', padding: '16px 24px' }}>
          {sorted.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8' }}>
              <Briefcase size={48} style={{ marginBottom: 16, opacity: 0.3 }} />
              <div style={{ fontSize: 15 }}>등록된 글이 없습니다</div>
              <div style={{ fontSize: 13, marginTop: 4 }}>새 글을 작성해 업무를 공유하세요</div>
            </div>
          ) : sorted.map((post, idx) => {
            const pt = POST_TYPES.find(p => p.type === post.data.type) || POST_TYPES[2];
            const postComments = getPostComments(post.post_id);
            const isThreadOpen = threadOpen === post.post_id;
            const globalIdx = posts.indexOf(post) + 1;

            return (
              <div key={post.post_id} style={{ marginBottom: 12, background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: post.data.pinned ? '0 0 0 2px #FBBF24' : 'none' }}>
                {/* 포스트 헤더 */}
                <div style={{ padding: '14px 20px 0' }}>
                  {/* 경로 + 핀 */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    {post.data.pinned && <Pin size={12} color="#F59E0B" style={{ flexShrink: 0 }} />}
                    <span style={{ fontSize: 11, color: '#94a3b8', fontFamily: 'monospace' }}>{buildPath(globalIdx, post.data)}</span>
                    <span style={{ flex: 1 }} />
                    <span style={{ fontSize: 11, color: '#94a3b8' }}>{fmtDate(post.data.created_at)}</span>
                  </div>

                  {/* 유형 배지 + 분류 태그 */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
                    <span style={{ padding: '2px 10px', borderRadius: 12, fontSize: 11, fontWeight: 600, background: pt.bg, color: pt.color, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <pt.icon size={12} /> {post.data.type}
                    </span>
                    {post.data.department.map((d, i) => <span key={`d${i}`} style={{ padding: '2px 8px', borderRadius: 12, fontSize: 10, background: '#EFF6FF', color: '#3B82F6' }}>{d}</span>)}
                    {post.data.category2.map((c, i) => <span key={`c2${i}`} style={{ padding: '2px 8px', borderRadius: 12, fontSize: 10, background: '#F0FDF4', color: '#22C55E' }}>{c}</span>)}
                    {post.data.category3.map((c, i) => <span key={`c3${i}`} style={{ padding: '2px 8px', borderRadius: 12, fontSize: 10, background: '#FFFBEB', color: '#F59E0B' }}>{c}</span>)}
                    {post.data.position.map((p, i) => <span key={`p${i}`} style={{ padding: '2px 8px', borderRadius: 12, fontSize: 10, background: '#F5F3FF', color: '#7C3AED' }}>{p}</span>)}
                  </div>

                  {/* 제목 */}
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', margin: '4px 0 6px', lineHeight: 1.4 }}>{post.data.title}</h3>

                  {/* 작성자 */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#64748b', marginBottom: 8 }}>
                    <User size={13} /> {post.data.author}
                  </div>
                </div>

                {/* 본문 */}
                {post.data.content && (
                  <div style={{ padding: '0 20px 12px', fontSize: 14, color: '#334155', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                    {post.data.content}
                  </div>
                )}

                {/* 첨부 */}
                {post.data.attachments.length > 0 && (
                  <div style={{ padding: '0 20px 12px', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {post.data.attachments.map((att, i) => (
                      <a key={i} href={att.url} {...(att.type === 'link' ? { target: '_blank', rel: 'noopener noreferrer' } : { download: att.name })}
                        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0', textDecoration: 'none', color: '#475569', fontSize: 12 }}>
                        {att.type === 'image' && <ImageIcon size={13} color="#3B82F6" />}
                        {att.type === 'file' && <File size={13} color="#F59E0B" />}
                        {att.type === 'link' && <ExternalLink size={13} color="#10B981" />}
                        <span style={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{att.name}</span>
                        {att.size && <span style={{ fontSize: 10, color: '#94a3b8' }}>{fmtSize(att.size)}</span>}
                      </a>
                    ))}
                  </div>
                )}

                {/* 액션 바 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 2, padding: '8px 16px', borderTop: '1px solid #f1f5f9', background: '#fafbfd' }}>
                  <button onClick={() => setThreadOpen(isThreadOpen ? null : post.post_id)}
                    style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 6, border: 'none', background: isThreadOpen ? '#EFF6FF' : 'transparent', color: isThreadOpen ? '#3B82F6' : '#94a3b8', fontSize: 12, cursor: 'pointer' }}>
                    <MessageSquare size={13} /> {postComments.length > 0 ? `댓글 ${postComments.length}` : '댓글'}
                  </button>
                  <button onClick={() => handleTogglePin(post)}
                    style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 6, border: 'none', background: 'transparent', color: post.data.pinned ? '#F59E0B' : '#94a3b8', fontSize: 12, cursor: 'pointer' }}>
                    {post.data.pinned ? <PinOff size={13} /> : <Pin size={13} />} {post.data.pinned ? '고정 해제' : '고정'}
                  </button>
                  <button onClick={() => { setEditingId(post.post_id); setShowForm(true); }}
                    style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 6, border: 'none', background: 'transparent', color: '#94a3b8', fontSize: 12, cursor: 'pointer' }}>
                    <Pencil size={13} /> 수정
                  </button>
                  <button onClick={() => handleDelete(post.post_id)}
                    style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 6, border: 'none', background: 'transparent', color: '#94a3b8', fontSize: 12, cursor: 'pointer' }}>
                    <Trash2 size={13} /> 삭제
                  </button>
                </div>

                {/* 댓글 스레드 */}
                {isThreadOpen && (
                  <CommentThread postId={post.post_id} comments={postComments} onRefresh={fetchData} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 글 작성/수정 모달 */}
      {showForm && (
        <PostForm
          editData={editingId ? posts.find(p => p.post_id === editingId) : undefined}
          onClose={() => { setShowForm(false); setEditingId(null); }}
          onSaved={() => { setShowForm(false); setEditingId(null); fetchData(); }}
          custom={custom}
          updateCustom={updateCustom}
        />
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   Comment Thread
   ══════════════════════════════════════════════════════════════ */
function CommentThread({ postId, comments, onRefresh }: { postId: string; comments: HubComment[]; onRefresh: () => void }) {
  const [text, setText] = useState('');
  const [author, setAuthor] = useState(() => localStorage.getItem('wh-author') || '');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [comments.length]);

  const handleSend = async () => {
    if (!text.trim() || !author.trim()) { toast.error('작성자와 내용을 입력해주세요'); return; }
    setSending(true);
    localStorage.setItem('wh-author', author);
    const payload: CommentData = { post_id: postId, author: author.trim(), content: text.trim(), created_at: new Date().toISOString() };
    try {
      await fetch('/api/work-hub-comments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...payload, comment_id: genId() }) });
      setText('');
      onRefresh();
    } catch { toast.error('댓글 등록 실패'); }
    finally { setSending(false); }
  };

  const handleDeleteComment = async (cid: string) => {
    try {
      await fetch(`/api/work-hub-comments/${cid}`, { method: 'DELETE' });
      onRefresh();
    } catch { toast.error('삭제 실패'); }
  };

  return (
    <div style={{ borderTop: '1px solid #e2e8f0', background: '#fafbfd' }}>
      {/* 기존 댓글 */}
      <div style={{ maxHeight: 300, overflow: 'auto', padding: comments.length ? '12px 20px 0' : 0 }}>
        {comments.map(c => (
          <div key={c.comment_id} style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 28, height: 28, borderRadius: 14, background: '#E0E7FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: '#6366F1', flexShrink: 0 }}>
              {c.data.author.charAt(0)}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{c.data.author}</span>
                <span style={{ fontSize: 11, color: '#94a3b8' }}>{fmtDate(c.data.created_at)}</span>
                <button onClick={() => handleDeleteComment(c.comment_id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginLeft: 'auto', opacity: 0.4 }} title="삭제"><Trash2 size={11} color="#ef4444" /></button>
              </div>
              <div style={{ fontSize: 13, color: '#334155', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{c.data.content}</div>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* 댓글 입력 */}
      <div style={{ padding: '12px 20px', display: 'flex', gap: 8, alignItems: 'flex-end' }}>
        <input value={author} onChange={e => setAuthor(e.target.value)} placeholder="이름"
          style={{ width: 80, padding: '8px 10px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, outline: 'none' }} />
        <textarea value={text} onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); handleSend(); } }}
          placeholder="댓글을 입력하세요... (Ctrl+Enter로 전송)"
          rows={1}
          style={{ flex: 1, padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, outline: 'none', resize: 'none', fontFamily: 'inherit', lineHeight: 1.5, minHeight: 36 }} />
        <button onClick={handleSend} disabled={sending}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: 8, border: 'none', background: '#3B82F6', color: '#fff', cursor: sending ? 'not-allowed' : 'pointer', opacity: sending ? 0.5 : 1, flexShrink: 0 }}>
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   Multi Chip Filter (inline)
   ══════════════════════════════════════════════════════════════ */
function MultiChipFilter({ label, items, defaults, value, onChange, customKey, custom, updateCustom }: {
  label: string; items: string[]; defaults: string[]; value: string[]; onChange: (v: string[]) => void;
  customKey: string; custom: Record<string, string[]>; updateCustom: (k: string, v: string[]) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [newVal, setNewVal] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const toggle = (d: string) => onChange(value.includes(d) ? value.filter(x => x !== d) : [...value, d]);
  const handleAdd = () => {
    const v = newVal.trim();
    if (!v || items.includes(v)) { setNewVal(''); setAdding(false); return; }
    updateCustom(customKey, [...(custom[customKey] || []), v]);
    setNewVal(''); setAdding(false);
  };
  const handleRemove = (item: string) => {
    if (defaults.includes(item)) return;
    updateCustom(customKey, (custom[customKey] || []).filter(c => c !== item));
    onChange(value.filter(x => x !== item));
  };

  useEffect(() => { if (adding) inputRef.current?.focus(); }, [adding]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
      <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600, minWidth: 44 }}>{label}</span>
      <button onClick={() => onChange([])}
        style={{ padding: '3px 10px', borderRadius: 14, border: '1px solid', borderColor: value.length === 0 ? '#3B82F6' : '#e2e8f0', background: value.length === 0 ? '#EFF6FF' : '#fff', color: value.length === 0 ? '#3B82F6' : '#64748b', fontSize: 12, cursor: 'pointer', fontWeight: value.length === 0 ? 600 : 400 }}>전체</button>
      {items.map(d => (
        <span key={d} style={{ display: 'inline-flex', alignItems: 'center', position: 'relative' }}>
          <button onClick={() => toggle(d)}
            style={{ padding: '3px 10px', borderRadius: 14, border: '1px solid', borderColor: value.includes(d) ? '#3B82F6' : '#e2e8f0', background: value.includes(d) ? '#EFF6FF' : '#fff', color: value.includes(d) ? '#3B82F6' : '#64748b', fontSize: 12, cursor: 'pointer', fontWeight: value.includes(d) ? 600 : 400, paddingRight: defaults.includes(d) ? undefined : 22 }}>{d}</button>
          {!defaults.includes(d) && <button onClick={e => { e.stopPropagation(); handleRemove(d); }} style={{ position: 'absolute', right: 3, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}><X size={10} color="#EF4444" /></button>}
        </span>
      ))}
      {adding ? (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <input ref={inputRef} value={newVal} onChange={e => setNewVal(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') { setAdding(false); setNewVal(''); } }}
            placeholder="Enter" style={{ padding: '3px 8px', borderRadius: 14, border: '1px solid #3B82F6', fontSize: 12, outline: 'none', width: 80 }} />
          <button onClick={() => { setAdding(false); setNewVal(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}><X size={13} color="#94a3b8" /></button>
        </span>
      ) : (
        <button onClick={() => setAdding(true)} style={{ padding: '3px 8px', borderRadius: 14, border: '1px dashed #cbd5e1', background: '#fff', color: '#94a3b8', fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 2 }}><Plus size={11} />추가</button>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   Post Form (create / edit)
   ══════════════════════════════════════════════════════════════ */
function PostForm({ editData, onClose, onSaved, custom, updateCustom }: {
  editData?: HubPost; onClose: () => void; onSaved: () => void;
  custom: Record<string, string[]>; updateCustom: (k: string, v: string[]) => void;
}) {
  const isEdit = !!editData;
  const [postType, setPostType] = useState<PostType>(editData?.data.type || '메모');
  const [dept, setDept] = useState<string[]>(editData?.data.department || []);
  const [cat2, setCat2] = useState<string[]>(editData?.data.category2 || []);
  const [cat3, setCat3] = useState<string[]>(editData?.data.category3 || []);
  const [pos, setPos] = useState<string[]>(editData?.data.position || []);
  const [title, setTitle] = useState(editData?.data.title || '');
  const [content, setContent] = useState(editData?.data.content || '');
  const [author, setAuthor] = useState(editData?.data.author || localStorage.getItem('wh-author') || '');
  const [attachments, setAttachments] = useState<Attachment[]>(editData?.data.attachments || []);
  const [saving, setSaving] = useState(false);
  const [showLink, setShowLink] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkName, setLinkName] = useState('');
  const [uploading, setUploading] = useState<{ name: string; progress: number }[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const depts = [...DEF_DEPTS, ...(custom['dept'] || [])];
  const cat2s = [...DEF_CAT2, ...(custom['cat2'] || [])];
  const cat3s = [...DEF_CAT3, ...(custom['cat3'] || [])];
  const poss = [...DEF_POS, ...(custom['pos'] || [])];

  const addLink = () => { if (!linkUrl) return; setAttachments([...attachments, { type: 'link', url: linkUrl, name: linkName || linkUrl }]); setLinkUrl(''); setLinkName(''); setShowLink(false); };

  const uploadOne = (f: globalThis.File): Promise<{ success: boolean; s3_url?: string }> => {
    return new Promise((resolve) => {
      const fd = new FormData(); fd.append('file', f); fd.append('category', 'work-hub');
      const xhr = new XMLHttpRequest();
      xhr.upload.onprogress = (ev) => { if (ev.lengthComputable) { setUploading(prev => prev.map(u => u.name === f.name ? { ...u, progress: Math.round((ev.loaded / ev.total) * 100) } : u)); } };
      xhr.onload = () => { try { resolve(JSON.parse(xhr.responseText)); } catch { resolve({ success: false }); } };
      xhr.onerror = () => resolve({ success: false });
      xhr.open('POST', '/api/upload'); xhr.send(fd);
    });
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files; if (!files) return;
    const fileList = Array.from(files);
    setUploading(prev => [...prev, ...fileList.map(f => ({ name: f.name, progress: 0 }))]);
    for (const f of fileList) {
      const isImg = f.type.startsWith('image/');
      const j = await uploadOne(f);
      if (j.success && j.s3_url) { setAttachments(p => [...p, { type: isImg ? 'image' : 'file' as const, url: j.s3_url!, name: f.name, size: f.size }]); toast.success(`${f.name} 업로드`); }
      else { toast.error(`${f.name} 실패`); }
      setUploading(prev => prev.filter(u => u.name !== f.name));
    }
    e.target.value = '';
  };

  const save = async () => {
    if (!dept.length || !title || !author) { toast.error('대분류, 제목, 작성자를 입력해주세요'); return; }
    setSaving(true);
    localStorage.setItem('wh-author', author);
    const payload: HubPostData = { type: postType, department: dept, category2: cat2, category3: cat3, position: pos, title, content, attachments, author, pinned: editData?.data.pinned || false, created_at: editData?.data.created_at || new Date().toISOString() };
    try {
      if (isEdit && editData) {
        await fetch(`/api/work-hub/${editData.post_id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        toast.success('수정되었습니다');
      } else {
        await fetch('/api/work-hub', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...payload, post_id: genId() }) });
        toast.success('등록되었습니다');
      }
      onSaved();
    } catch { toast.error('저장 실패'); } finally { setSaving(false); }
  };

  const chipRow = (label: string, items: string[], val: string[], set: (v: string[]) => void, cKey: string) => (
    <div>
      <label style={{ fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6, display: 'block' }}>{label} {val.length > 0 && <span style={{ fontSize: 11, color: '#3B82F6', fontWeight: 400 }}>({val.length})</span>}</label>
      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
        {items.map(d => (
          <button key={d} type="button" onClick={() => set(val.includes(d) ? val.filter(x => x !== d) : [...val, d])}
            style={{ padding: '5px 12px', borderRadius: 16, border: '1px solid', borderColor: val.includes(d) ? '#3B82F6' : '#e2e8f0', background: val.includes(d) ? '#EFF6FF' : '#fff', color: val.includes(d) ? '#3B82F6' : '#64748b', fontSize: 12, cursor: 'pointer', fontWeight: val.includes(d) ? 600 : 400 }}>{d}</button>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 16, width: 680, maxHeight: '92vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #f1f5f9' }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: '#1e293b' }}>{isEdit ? '글 수정' : '새 글 작성'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} color="#94a3b8" /></button>
        </div>
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* 유형 선택 */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6, display: 'block' }}>유형 *</label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {POST_TYPES.map(pt => (
                <button key={pt.type} type="button" onClick={() => setPostType(pt.type)}
                  style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 14px', borderRadius: 16, border: '1px solid', borderColor: postType === pt.type ? pt.color : '#e2e8f0', background: postType === pt.type ? pt.bg : '#fff', color: postType === pt.type ? pt.color : '#64748b', fontSize: 13, cursor: 'pointer', fontWeight: postType === pt.type ? 600 : 400 }}>
                  <pt.icon size={13} /> {pt.type}
                </button>
              ))}
            </div>
          </div>

          {chipRow('대분류 *', depts, dept, setDept, 'dept')}
          {chipRow('중분류', cat2s, cat2, setCat2, 'cat2')}
          {chipRow('소분류', cat3s, cat3, setCat3, 'cat3')}
          {chipRow('대상 직급', poss, pos, setPos, 'pos')}

          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1 }}><label style={{ fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6, display: 'block' }}>작성자 *</label><input value={author} onChange={e => setAuthor(e.target.value)} placeholder="이름" style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, outline: 'none' }} /></div>
            <div style={{ flex: 2 }}><label style={{ fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6, display: 'block' }}>제목 *</label><input value={title} onChange={e => setTitle(e.target.value)} placeholder="제목을 입력하세요" style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, outline: 'none' }} /></div>
          </div>

          <div><label style={{ fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6, display: 'block' }}>내용</label>
            <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="내용을 작성하세요..." rows={6}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, outline: 'none', resize: 'vertical', lineHeight: 1.6, fontFamily: 'inherit' }} />
          </div>

          {/* 첨부 */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 8, display: 'block' }}>첨부</label>
            {attachments.length > 0 && <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 }}>{attachments.map((att, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: '#f8fafc', borderRadius: 8, fontSize: 13 }}>
                {att.type === 'image' && <ImageIcon size={14} color="#3B82F6" />}{att.type === 'link' && <ExternalLink size={14} color="#10B981" />}{att.type === 'file' && <File size={14} color="#F59E0B" />}
                <span style={{ flex: 1, color: '#334155' }}>{att.name}</span>{att.size && <span style={{ fontSize: 11, color: '#94a3b8' }}>{fmtSize(att.size)}</span>}
                <button onClick={() => setAttachments(attachments.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={14} color="#ef4444" /></button>
              </div>
            ))}</div>}
            {uploading.length > 0 && <div style={{ marginBottom: 10 }}>{uploading.map((u, i) => (
              <div key={i} style={{ padding: '8px 12px', background: '#EFF6FF', borderRadius: 8, fontSize: 12, border: '1px solid #BFDBFE', marginBottom: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ color: '#3B82F6' }}>{u.name}</span><span style={{ marginLeft: 'auto', fontWeight: 600, color: '#2563EB' }}>{u.progress}%</span></div>
                <div style={{ height: 3, background: '#BFDBFE', borderRadius: 2, marginTop: 4, overflow: 'hidden' }}><div style={{ height: '100%', width: `${u.progress}%`, background: '#3B82F6', borderRadius: 2 }} /></div>
              </div>
            ))}</div>}
            <div style={{ display: 'flex', gap: 8 }}>
              <input ref={fileRef} type="file" multiple hidden onChange={handleFile} />
              <button onClick={() => fileRef.current?.click()} disabled={uploading.length > 0}
                style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, cursor: uploading.length > 0 ? 'not-allowed' : 'pointer', color: '#475569' }}><Upload size={14} />파일/이미지</button>
              <button onClick={() => setShowLink(!showLink)}
                style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, cursor: 'pointer', color: '#475569' }}><LinkIcon size={14} />링크</button>
            </div>
            {showLink && <div style={{ display: 'flex', gap: 8, marginTop: 8 }}><input value={linkUrl} onChange={e => setLinkUrl(e.target.value)} placeholder="URL" style={{ flex: 1, padding: '6px 10px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13 }} /><input value={linkName} onChange={e => setLinkName(e.target.value)} placeholder="이름" style={{ width: 120, padding: '6px 10px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13 }} /><button onClick={addLink} style={{ padding: '6px 12px', background: '#10B981', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}>추가</button></div>}
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, padding: '16px 24px', borderTop: '1px solid #f1f5f9' }}>
          <button onClick={onClose} style={{ padding: '8px 20px', background: '#f1f5f9', border: 'none', borderRadius: 8, fontSize: 14, cursor: 'pointer', color: '#64748b' }}>취소</button>
          <button onClick={save} disabled={saving}
            style={{ padding: '8px 20px', background: '#3B82F6', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1 }}>{saving ? '저��� 중...' : isEdit ? '수정' : '등록'}</button>
        </div>
      </div>
    </div>
  );
}
