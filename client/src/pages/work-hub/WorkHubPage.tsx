import { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react';
import { toast } from 'sonner';
import {
  Plus, Trash2, Pencil, X, Upload, Link as LinkIcon,
  Image as ImageIcon, Send, MessageSquare, Pin, PinOff,
  Search, File, ExternalLink, ChevronDown, ChevronRight,
  Megaphone, FileText, Briefcase, FolderOpen, ClipboardList, BarChart3,
  Hash, User, LayoutDashboard, Table2, MessageCircle
} from 'lucide-react';

const PipelineDashboard = lazy(() => import('./PipelineDashboard'));
const StatusTable = lazy(() => import('./StatusTable'));

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
  path: [string, string?, string?];  // [대분류, 중분류?, 소분류?]  e.g. ['개발','TESOL','DB']
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
   Constants — 부서별 자료 + 서비스 URL 매핑
   ══════════════════════════════════════════════════════════════ */
const SITES = ['AI번역_AITe', 'ITT_정통번역', 'TESOL', '고전번역_통독', '대표님페이지', '반도체_조선_방산', '번역_메타트랜스', '윤리', '전문가매칭', '전시회', '프롬프트', '휴텍씨'];
const DEV_SUB = ['DB', 'UI', '기획', '산출물'];

/** 부서별 폴더 트리 */
const CATEGORY_TREE: Record<string, Record<string, string[]>> = {
  '개발':       Object.fromEntries([...SITES, '공통_플러그인_모듈'].map(s => [s, DEV_SUB])),
  '회계':       { '거래처원장': [], '부가세': [], '세금계산서': [], '수익': SITES, '연도별_결산': [], '지출': SITES },
  '마케팅':     Object.fromEntries([...SITES, 'SNS_카드뉴스', '공통_브랜딩'].map(s => [s, []])),
  '인사':       { '근로계약_서약서': [], '면접자료': [], '신입교육': [], '인수인계': [] },
  '법무':       { '공정거래_애니릭스': [], '세무조사_구룡': [], '티맥스소송': [], '행정서류': [] },
  '기획_사업':  { '데이터가치평가': [], '벤처_인증': [], '예비창업패키지': [], '정부제안서': [] },
  '매뉴얼_규정': { '검토중': [], '아카이브': [], '최신본': [] },
  '직원별':     { '박가연': [], '박미진': [], '시온': [], '조수연': [], '지예': [], '퇴사자_아카이브': [] },
  '삭제대기':   {},
  '미분류_창고': {},
};

/** 항목명 → 실제 서비스 URL (항목 옆에 링크 아이콘 표시) */
const SERVICE_URLS: Record<string, string> = {
  // 핵심 시스템
  'AI번역_AITe':    'http://54.116.15.136:82',
  'TESOL':          'https://hu-tec.github.io/TESOL/',
  '고전번역_통독':   'https://hu-tec.github.io/classic-translation/',
  '번역_메타트랜스': 'https://hu-tec.github.io/translation-hub/',
  '윤리':           'https://hu-tec.github.io/ai-ethics/',
  '휴텍씨':         'https://hu-tec.github.io/company_hutec/',
  '대표님페이지':    'https://hu-tec.github.io/personal_page/',
};

const DEF_LARGE = Object.keys(CATEGORY_TREE);
const DEF_POS = ['대표', '임원', '팀장', '강사', '신입', '알바', '외부'];

const POST_TYPES: { type: PostType; icon: typeof Megaphone; color: string; bg: string }[] = [
  { type: '공지',     icon: Megaphone,     color: '#DC2626', bg: '#FEF2F2' },
  { type: '업무지시', icon: ClipboardList,  color: '#7C3AED', bg: '#F5F3FF' },
  { type: '메모',     icon: FileText,       color: '#0EA5E9', bg: '#F0F9FF' },
  { type: '파일',     icon: FolderOpen,     color: '#F59E0B', bg: '#FFFBEB' },
  { type: '프로세스', icon: Briefcase,      color: '#10B981', bg: '#F0FDF4' },
  { type: '보고',     icon: BarChart3,      color: '#6366F1', bg: '#EEF2FF' },
];

const toArr = (v: unknown): string[] => Array.isArray(v) ? v : typeof v === 'string' && v ? [v] : [];

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

/** 경로 표시: 001 신입 개발 > TESOL > DB */
function buildPathLabel(post: HubPostData) {
  return post.path.filter(Boolean).join(' > ');
}

/** 포스트가 특정 경로에 속하는지 */
function matchesPath(post: HubPostData, activePath: string[]) {
  if (!activePath.length) return true;
  for (let i = 0; i < activePath.length; i++) {
    if ((post.path[i] || '') !== activePath[i]) return false;
  }
  return true;
}

/* ══════════════════════════════════════════════════════════════
   Main Page
   ══════════════════════════════════════════════════════════════ */
export default function WorkHubPage() {
  const [posts, setPosts] = useState<HubPost[]>([]);
  const [comments, setComments] = useState<HubComment[]>([]);
  const [loading, setLoading] = useState(true);

  // tabs
  type TabKey = 'feed' | 'dashboard' | 'table';
  const [activeTab, setActiveTab] = useState<TabKey>('feed');

  // UI state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string|null>(null);
  const [threadOpen, setThreadOpen] = useState<string|null>(null);
  const [searchText, setSearchText] = useState('');

  // filters — path-based
  const [filterType, setFilterType] = useState<PostType|'전체'>('전체');
  const [activePath, setActivePath] = useState<string[]>([]); // e.g. ['개발','TESOL','DB']
  const [filterPos, setFilterPos] = useState<string[]>([]);

  // sidebar tree collapse
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  const fetchData = useCallback(async () => {
    try {
      const [postsRes, commentsRes] = await Promise.all([
        fetch('/api/work-hub'), fetch('/api/work-hub-comments')
      ]);
      const postsRaw = await postsRes.json();
      const commentsRaw = await commentsRes.json();

      const parsed: HubPost[] = (Array.isArray(postsRaw) ? postsRaw : []).map((r: any) => {
        const d = typeof r.data === 'string' ? JSON.parse(r.data) : r.data;
        // legacy migration: department/category2/category3 → path
        let path = d.path;
        if (!path && d.department) {
          const dept = Array.isArray(d.department) ? d.department[0] : d.department;
          const c2 = Array.isArray(d.category2) ? d.category2[0] : d.category2;
          const c3 = Array.isArray(d.category3) ? d.category3[0] : d.category3;
          path = [dept, c2, c3].filter(Boolean);
        }
        return {
          ...r, data: {
            ...d,
            type: d.type || '메모',
            path: path || ['미분류_창고'],
            position: toArr(d.position),
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

  // filtering
  const filtered = posts.filter(r => {
    const d = r.data;
    if (filterType !== '전체' && d.type !== filterType) return false;
    if (!matchesPath(d, activePath)) return false;
    if (filterPos.length && !filterPos.some(f => d.position.includes(f))) return false;
    if (searchText) {
      const s = searchText.toLowerCase();
      if (!d.title.toLowerCase().includes(s) && !d.content.toLowerCase().includes(s) && !d.author.toLowerCase().includes(s)) return false;
    }
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (a.data.pinned && !b.data.pinned) return -1;
    if (!a.data.pinned && b.data.pinned) return 1;
    return new Date(b.data.created_at).getTime() - new Date(a.data.created_at).getTime();
  });

  const anyFilterActive = filterType !== '전체' || activePath.length > 0 || filterPos.length > 0 || !!searchText;

  // count posts per large category
  const pathCounts = (prefix: string[]) => posts.filter(p => matchesPath(p.data, prefix)).length;

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

  const toggleExpand = (key: string) => setExpandedNodes(prev => { const n = new Set(prev); if (n.has(key)) n.delete(key); else n.add(key); return n; });

  const getPostComments = (pid: string) => comments.filter(c => c.data.post_id === pid).sort((a, b) => new Date(a.data.created_at).getTime() - new Date(b.data.created_at).getTime());

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>로딩 중...</div>;

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 64px)', overflow: 'hidden' }}>
      {/* ── 좌측: 폴더 트리 사이드바 ── */}
      <div style={{ width: 240, flexShrink: 0, borderRight: '1px solid #e2e8f0', background: '#f8fafc', overflow: 'auto', padding: '8px 0' }}>
        <div style={{ padding: '0 10px', marginBottom: 6 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', margin: '0 0 6px' }}>업무 총괄</h2>
          {/* 유형별 필터 — 컴팩트 */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2, marginBottom: 4 }}>
            <button onClick={() => { setFilterType('전체'); setActivePath([]); }}
              style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 6, border: 'none', background: filterType === '전체' && !activePath.length ? '#EFF6FF' : 'transparent', color: filterType === '전체' && !activePath.length ? '#3B82F6' : '#64748b', fontSize: 11, fontWeight: filterType === '전체' && !activePath.length ? 600 : 400, cursor: 'pointer' }}>
              <Hash size={11} />전체 <span style={{ fontSize: 10, color: '#94a3b8' }}>{posts.length}</span>
            </button>
            {POST_TYPES.map(pt => {
              const cnt = posts.filter(p => p.data.type === pt.type).length;
              return (
                <button key={pt.type} onClick={() => { setFilterType(pt.type); setActivePath([]); }}
                  style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '3px 7px', borderRadius: 6, border: 'none', background: filterType === pt.type ? pt.bg : 'transparent', color: filterType === pt.type ? pt.color : '#64748b', fontSize: 11, fontWeight: filterType === pt.type ? 600 : 400, cursor: 'pointer' }}>
                  <pt.icon size={10} />{pt.type}{cnt > 0 && <span style={{ fontSize: 9, color: '#94a3b8' }}>{cnt}</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* 부서별 자료 (서비스 URL 통합) */}
        <div style={{ borderTop: '1px solid #e2e8f0', padding: '6px 8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4, padding: '0 4px' }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', flex: 1 }}>부서별 자료</span>
            <button onClick={() => {
              const allKeys: string[] = [];
              DEF_LARGE.forEach(lg => { allKeys.push(lg); Object.keys(CATEGORY_TREE[lg]).forEach(mid => { allKeys.push(`${lg}/${mid}`); }); });
              const allOpen = allKeys.every(k => expandedNodes.has(k));
              setExpandedNodes(allOpen ? new Set() : new Set(allKeys));
            }} style={{ fontSize: 9, color: '#94a3b8', background: 'none', border: '1px solid #e2e8f0', borderRadius: 4, padding: '1px 6px', cursor: 'pointer' }}>
              {(() => { const allKeys: string[] = []; DEF_LARGE.forEach(lg => { allKeys.push(lg); Object.keys(CATEGORY_TREE[lg]).forEach(mid => { allKeys.push(`${lg}/${mid}`); }); }); return allKeys.every(k => expandedNodes.has(k)) ? '전체접기' : '전체펼치기'; })()}
            </button>
          </div>
          {DEF_LARGE.map(lg => {
            const lgKey = lg;
            const lgActive = activePath[0] === lg;
            const lgExpanded = expandedNodes.has(lgKey);
            const mids = CATEGORY_TREE[lg];
            const midKeys = Object.keys(mids);
            const cnt = pathCounts([lg]);
            return (
              <div key={lg}>
                <button
                  style={{ display: 'flex', alignItems: 'center', gap: 4, width: '100%', padding: '3px 4px', borderRadius: 5, border: 'none', background: lgActive && activePath.length === 1 ? '#EFF6FF' : 'transparent', color: lgActive ? '#3B82F6' : '#475569', fontSize: 12, cursor: 'pointer', textAlign: 'left', fontWeight: lgActive ? 600 : 400 }}
                  onClick={() => { setActivePath([lg]); setFilterType('전체'); if (!lgExpanded) toggleExpand(lgKey); }}>
                  {midKeys.length > 0 ? (
                    <span onClick={e => { e.stopPropagation(); toggleExpand(lgKey); }} style={{ display: 'flex' }}>
                      {lgExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                    </span>
                  ) : <span style={{ width: 12 }} />}
                  <FolderOpen size={13} style={{ flexShrink: 0 }} />
                  <span style={{ flex: 1 }}>{lg}</span>
                  {cnt > 0 && <span style={{ fontSize: 10, color: '#94a3b8' }}>{cnt}</span>}
                </button>
                {lgExpanded && midKeys.map(mid => {
                  const midKey = `${lg}/${mid}`;
                  const midActive = activePath[0] === lg && activePath[1] === mid;
                  const midExpanded = expandedNodes.has(midKey);
                  const smalls = mids[mid];
                  const midCnt = pathCounts([lg, mid]);
                  return (
                    <div key={mid} style={{ paddingLeft: 14 }}>
                      <button
                        style={{ display: 'flex', alignItems: 'center', gap: 4, width: '100%', padding: '2px 4px', borderRadius: 4, border: 'none', background: midActive && activePath.length === 2 ? '#F0FDF4' : 'transparent', color: midActive ? '#22C55E' : '#64748b', fontSize: 11, cursor: 'pointer', textAlign: 'left', fontWeight: midActive ? 600 : 400 }}
                        onClick={() => { setActivePath([lg, mid]); setFilterType('전체'); if (smalls.length && !midExpanded) toggleExpand(midKey); }}>
                        {smalls.length > 0 ? (
                          <span onClick={e => { e.stopPropagation(); toggleExpand(midKey); }} style={{ display: 'flex' }}>
                            {midExpanded ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
                          </span>
                        ) : <span style={{ width: 11 }} />}
                        <span style={{ flex: 1 }}>{mid}</span>
                        {SERVICE_URLS[mid] && <a href={SERVICE_URLS[mid]} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={{ color: '#3B82F6', display: 'flex', flexShrink: 0 }} title={SERVICE_URLS[mid]}><ExternalLink size={9} /></a>}
                        {midCnt > 0 && <span style={{ fontSize: 10, color: '#94a3b8' }}>{midCnt}</span>}
                      </button>
                      {midExpanded && smalls.map(sm => {
                        const smActive = activePath[0] === lg && activePath[1] === mid && activePath[2] === sm;
                        const smCnt = pathCounts([lg, mid, sm]);
                        return (
                          <button key={sm}
                            style={{ display: 'flex', alignItems: 'center', gap: 4, width: '100%', padding: '2px 4px 2px 22px', borderRadius: 3, border: 'none', background: smActive ? '#FFFBEB' : 'transparent', color: smActive ? '#F59E0B' : '#94a3b8', fontSize: 10, cursor: 'pointer', textAlign: 'left', fontWeight: smActive ? 600 : 400 }}
                            onClick={() => { setActivePath([lg, mid, sm]); setFilterType('전체'); }}>
                            <span style={{ width: 4, height: 4, borderRadius: 2, background: smActive ? '#F59E0B' : '#cbd5e1', flexShrink: 0 }} />
                            <span style={{ flex: 1 }}>{sm}</span>
                            {smCnt > 0 && <span style={{ fontSize: 10, color: '#94a3b8' }}>{smCnt}</span>}
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 중앙 영역 ── */}
      <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
        {/* 탭 바 */}
        <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #e2e8f0', background: '#fff', flexShrink: 0, padding: '0 10px' }}>
          {([
            { key: 'feed' as TabKey, label: '피드', icon: MessageCircle },
            { key: 'dashboard' as TabKey, label: '대시보드', icon: LayoutDashboard },
            { key: 'table' as TabKey, label: '현황표', icon: Table2 },
          ]).map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '5px 10px', border: 'none', borderBottom: `2px solid ${activeTab === tab.key ? '#3B82F6' : 'transparent'}`, background: 'none', color: activeTab === tab.key ? '#3B82F6' : '#64748b', fontSize: 11, fontWeight: activeTab === tab.key ? 700 : 500, cursor: 'pointer' }}>
              <tab.icon size={11} /> {tab.label}
            </button>
          ))}
        </div>

        {/* 대시보드 / 현황표 탭 */}
        {activeTab === 'dashboard' && <Suspense fallback={<div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>로딩...</div>}><PipelineDashboard filterType={filterType} /></Suspense>}
        {activeTab === 'table' && <Suspense fallback={<div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>로딩...</div>}><StatusTable filterType={filterType} /></Suspense>}

        {/* 피드 탭 — 기존 콘텐츠 */}
        {activeTab === 'feed' && <>
        {/* 상단 바 */}
        <div style={{ padding: '6px 12px', borderBottom: '1px solid #e2e8f0', background: '#fff', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {activePath.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11 }}>
                <button onClick={() => setActivePath([])} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3B82F6', fontSize: 11 }}>전체</button>
                {activePath.map((seg, i) => (
                  <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <ChevronRight size={10} color="#94a3b8" />
                    <button onClick={() => setActivePath(activePath.slice(0, i + 1))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: i === activePath.length - 1 ? '#1e293b' : '#3B82F6', fontWeight: i === activePath.length - 1 ? 700 : 400, fontSize: 11 }}>{seg}</button>
                  </span>
                ))}
              </div>
            )}
            <div style={{ position: 'relative', flex: 1, maxWidth: 300 }}>
              <Search size={12} style={{ position: 'absolute', left: 8, top: 7, color: '#94a3b8' }} />
              <input value={searchText} onChange={e => setSearchText(e.target.value)} placeholder="검색..."
                style={{ width: '100%', padding: '5px 8px 5px 26px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 12, outline: 'none' }} />
            </div>
            {anyFilterActive && (
              <button onClick={() => { setFilterType('전체'); setActivePath([]); setFilterPos([]); setSearchText(''); }}
                style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '4px 8px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 6, fontSize: 11, cursor: 'pointer', color: '#EF4444' }}>
                <X size={10} />초기화
              </button>
            )}
            <span style={{ fontSize: 11, color: '#94a3b8' }}>{sorted.length}건</span>
            <button onClick={() => { setEditingId(null); setShowForm(true); }}
              style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 12px', background: '#3B82F6', color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
              <Plus size={12} />새 글
            </button>
          </div>
        </div>

        {/* 피드 */}
        <div style={{ flex: 1, overflow: 'auto', padding: '8px 12px' }}>
          {sorted.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>
              <Briefcase size={32} style={{ marginBottom: 8, opacity: 0.3 }} />
              <div style={{ fontSize: 12 }}>등록된 글이 없습니다</div>
            </div>
          ) : sorted.map((post, idx) => {
            const pt = POST_TYPES.find(p => p.type === post.data.type) || POST_TYPES[2];
            const postComments = getPostComments(post.post_id);
            const isThreadOpen = threadOpen === post.post_id;
            const globalIdx = posts.indexOf(post) + 1;

            return (
              <div key={post.post_id} style={{ marginBottom: 6, background: '#fff', borderRadius: 8, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: post.data.pinned ? '0 0 0 1.5px #FBBF24' : 'none' }}>
                {/* 포스트 헤더 */}
                <div style={{ padding: '8px 12px 0' }}>
                  {/* 경로 + 유형 + 핀 */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
                    {post.data.pinned && <Pin size={10} color="#F59E0B" style={{ flexShrink: 0 }} />}
                    <span style={{ padding: '1px 6px', borderRadius: 8, fontSize: 9, fontWeight: 700, background: pt.bg, color: pt.color, display: 'flex', alignItems: 'center', gap: 3 }}>
                      <pt.icon size={9} /> {post.data.type}
                    </span>
                    <span style={{ fontSize: 10, color: '#64748b', display: 'flex', alignItems: 'center', gap: 3 }}>
                      <FolderOpen size={9} /> {buildPathLabel(post.data)}
                    </span>
                    {post.data.position.map((p, i) => <span key={i} style={{ padding: '1px 5px', borderRadius: 8, fontSize: 9, background: '#F5F3FF', color: '#7C3AED' }}>{p}</span>)}
                    <span style={{ flex: 1 }} />
                    <span style={{ fontSize: 10, color: '#94a3b8' }}>{fmtDate(post.data.created_at)}</span>
                  </div>

                  {/* 제목 + 작성자 한 줄 */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{post.data.title}</span>
                    <span style={{ fontSize: 10, color: '#64748b', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 3 }}><User size={10} />{post.data.author}</span>
                  </div>
                </div>

                {/* 본문 */}
                {post.data.content && (
                  <div style={{ padding: '0 12px 8px', fontSize: 12, color: '#334155', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                    {post.data.content}
                  </div>
                )}

                {/* 첨부 */}
                {post.data.attachments.length > 0 && (
                  <div style={{ padding: '0 12px 6px', display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {post.data.attachments.map((att, i) => (
                      <a key={i} href={att.url} {...(att.type === 'link' ? { target: '_blank', rel: 'noopener noreferrer' } : { download: att.name })}
                        style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 8px', background: '#f8fafc', borderRadius: 6, border: '1px solid #e2e8f0', textDecoration: 'none', color: '#475569', fontSize: 10 }}>
                        {att.type === 'image' && <ImageIcon size={10} color="#3B82F6" />}
                        {att.type === 'file' && <File size={10} color="#F59E0B" />}
                        {att.type === 'link' && <ExternalLink size={10} color="#10B981" />}
                        <span style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{att.name}</span>
                        {att.size && <span style={{ fontSize: 10, color: '#94a3b8' }}>{fmtSize(att.size)}</span>}
                      </a>
                    ))}
                  </div>
                )}

                {/* 액션 바 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 1, padding: '4px 10px', borderTop: '1px solid #f1f5f9', background: '#fafbfd' }}>
                  <button onClick={() => setThreadOpen(isThreadOpen ? null : post.post_id)}
                    style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '2px 7px', borderRadius: 4, border: 'none', background: isThreadOpen ? '#EFF6FF' : 'transparent', color: isThreadOpen ? '#3B82F6' : '#94a3b8', fontSize: 10, cursor: 'pointer' }}>
                    <MessageSquare size={10} />{postComments.length > 0 ? `${postComments.length}` : '댓글'}
                  </button>
                  <button onClick={() => handleTogglePin(post)}
                    style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '2px 7px', borderRadius: 4, border: 'none', background: 'transparent', color: post.data.pinned ? '#F59E0B' : '#94a3b8', fontSize: 10, cursor: 'pointer' }}>
                    {post.data.pinned ? <PinOff size={10} /> : <Pin size={10} />}{post.data.pinned ? '해제' : '고정'}
                  </button>
                  <button onClick={() => { setEditingId(post.post_id); setShowForm(true); }}
                    style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '2px 7px', borderRadius: 4, border: 'none', background: 'transparent', color: '#94a3b8', fontSize: 10, cursor: 'pointer' }}>
                    <Pencil size={10} />수정
                  </button>
                  <button onClick={() => handleDelete(post.post_id)}
                    style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '2px 7px', borderRadius: 4, border: 'none', background: 'transparent', color: '#94a3b8', fontSize: 10, cursor: 'pointer' }}>
                    <Trash2 size={10} />삭제
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
      </>}
      </div>

      {/* 글 작성/수정 모달 */}
      {showForm && (
        <PostForm
          editData={editingId ? posts.find(p => p.post_id === editingId) : undefined}
          defaultPath={activePath}
          onClose={() => { setShowForm(false); setEditingId(null); }}
          onSaved={() => { setShowForm(false); setEditingId(null); fetchData(); }}
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
   Post Form (create / edit)
   ══════════════════════════════════════════════════════════════ */
function PostForm({ editData, defaultPath, onClose, onSaved }: {
  editData?: HubPost; defaultPath: string[]; onClose: () => void; onSaved: () => void;
}) {
  const isEdit = !!editData;
  const [postType, setPostType] = useState<PostType>(editData?.data.type || '메모');
  const [selLarge, setSelLarge] = useState(editData?.data.path[0] || defaultPath[0] || '');
  const [selMid, setSelMid] = useState(editData?.data.path[1] || defaultPath[1] || '');
  const [selSmall, setSelSmall] = useState(editData?.data.path[2] || defaultPath[2] || '');
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

  // derived mid/small options from tree
  const midOptions = selLarge && CATEGORY_TREE[selLarge] ? Object.keys(CATEGORY_TREE[selLarge]) : [];
  const smallOptions = selLarge && selMid && CATEGORY_TREE[selLarge]?.[selMid] ? CATEGORY_TREE[selLarge][selMid] : [];

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
    if (!selLarge || !title || !author) { toast.error('경로(대분류), 제목, 작성자를 입력해주세요'); return; }
    setSaving(true);
    localStorage.setItem('wh-author', author);
    const path: [string, string?, string?] = [selLarge];
    if (selMid) path.push(selMid);
    if (selSmall) path.push(selSmall);
    const payload: HubPostData = { type: postType, path, position: pos, title, content, attachments, author, pinned: editData?.data.pinned || false, created_at: editData?.data.created_at || new Date().toISOString() };
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

  const chip = (label: string, val: string, items: string[], set: (v: string) => void, color: string, bg: string) => (
    <div>
      <label style={{ fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6, display: 'block' }}>{label}</label>
      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
        {items.map(d => (
          <button key={d} type="button" onClick={() => set(val === d ? '' : d)}
            style={{ padding: '5px 12px', borderRadius: 16, border: '1px solid', borderColor: val === d ? color : '#e2e8f0', background: val === d ? bg : '#fff', color: val === d ? color : '#64748b', fontSize: 12, cursor: 'pointer', fontWeight: val === d ? 600 : 400 }}>{d}</button>
        ))}
        {items.length === 0 && <span style={{ fontSize: 12, color: '#94a3b8', padding: '5px 0' }}>상위 분류를 먼저 선택하세요</span>}
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
          {/* 유형 */}
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

          {/* 경로 선택 — 3축 계단식 */}
          {chip('경로: 대분류 *', selLarge, DEF_LARGE, v => { setSelLarge(v); setSelMid(''); setSelSmall(''); }, '#3B82F6', '#EFF6FF')}
          {midOptions.length > 0 && chip('경로: 중분류', selMid, midOptions, v => { setSelMid(v); setSelSmall(''); }, '#22C55E', '#F0FDF4')}
          {smallOptions.length > 0 && chip('경로: 소분류', selSmall, smallOptions, v => setSelSmall(v), '#F59E0B', '#FFFBEB')}

          {/* 현재 경로 미리보기 */}
          {selLarge && (
            <div style={{ padding: '8px 12px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12, color: '#475569', display: 'flex', alignItems: 'center', gap: 6 }}>
              <FolderOpen size={13} color="#3B82F6" />
              <span style={{ fontWeight: 600 }}>{[selLarge, selMid, selSmall].filter(Boolean).join(' > ')}</span>
            </div>
          )}

          {/* 대상 직급 */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6, display: 'block' }}>대상 직급</label>
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
              {DEF_POS.map(d => (
                <button key={d} type="button" onClick={() => setPos(pos.includes(d) ? pos.filter(x => x !== d) : [...pos, d])}
                  style={{ padding: '5px 12px', borderRadius: 16, border: '1px solid', borderColor: pos.includes(d) ? '#7C3AED' : '#e2e8f0', background: pos.includes(d) ? '#F5F3FF' : '#fff', color: pos.includes(d) ? '#7C3AED' : '#64748b', fontSize: 12, cursor: 'pointer', fontWeight: pos.includes(d) ? 600 : 400 }}>{d}</button>
              ))}
            </div>
          </div>

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
            style={{ padding: '8px 20px', background: '#3B82F6', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1 }}>{saving ? '저장 중...' : isEdit ? '수정' : '등록'}</button>
        </div>
      </div>
    </div>
  );
}
