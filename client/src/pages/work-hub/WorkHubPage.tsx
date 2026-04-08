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
import FeedView from './FeedView';

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

/** 업무 자료 중분류/소분류 (기능 기준) */
const FUNC_MID = ['규정', '교육', '홍보', '기술', '운영'];
const FUNC_SMALL: Record<string, string[]> = {
  '규정': ['급여', '복무', '기타'],
  '교육': ['교안', '기타'],
  '홍보': ['브로슈어', '기타'],
  '기술': ['서버', '시스템', '기타'],
  '운영': ['기타'],
};
const funcEntries = () => Object.fromEntries(FUNC_MID.map(m => [m, FUNC_SMALL[m] || []]));

/** 부서별 폴더 트리 (데스크톱 구조 + 업무 자료 부서 통합) */
const CATEGORY_TREE: Record<string, Record<string, string[]>> = {
  // 데스크톱 폴더 기반
  '개발':       Object.fromEntries([...SITES, '공통_플러그인_모듈'].map(s => [s, DEV_SUB])),
  '회계':       { '거래처원장': [], '부가세': [], '세금계산서': [], '수익': SITES, '연도별_결산': [], '지출': SITES },
  '마케팅':     Object.fromEntries([...SITES, 'SNS_카드뉴스', '공통_브랜딩'].map(s => [s, []])),
  '인사':       { '근로계약_서약서': [], '면접자료': [], '신입교육': [], '인수인계': [] },
  '법무':       { '공정거래_애니릭스': [], '세무조사_구룡': [], '티맥스소송': [], '행정서류': [] },
  '기획_사업':  { '데이터가치평가': [], '벤처_인증': [], '예비창업패키지': [], '정부제안서': [] },
  '매뉴얼_규정': { '검토중': [], '아카이브': [], '최신본': [] },
  '직원별':     { '박가연': [], '박미진': [], '시온': [], '조수연': [], '지예': [], '퇴사자_아카이브': [] },
  // 업무 자료에서 추가 (기능 기준 분류)
  '경영':       funcEntries(),
  '영업':       funcEntries(),
  '강사팀':     funcEntries(),
  '홈페이지':   funcEntries(),
  '상담':       funcEntries(),
  '총무':       funcEntries(),
  '관리':       funcEntries(),
  // 기타
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
  const [filterAuthor, setFilterAuthor] = useState('');

  // sidebar tree collapse
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  const fetchData = useCallback(async () => {
    try {
      const [postsRes, commentsRes, materialsRes] = await Promise.all([
        fetch('/api/work-hub'), fetch('/api/work-hub-comments'), fetch('/api/work-materials')
      ]);
      const postsRaw = await postsRes.json();
      const commentsRaw = await commentsRes.json();
      const materialsRaw = await materialsRes.json();

      // work_hub posts
      const hubPosts: HubPost[] = (Array.isArray(postsRaw) ? postsRaw : []).map((r: any) => {
        const d = typeof r.data === 'string' ? JSON.parse(r.data) : r.data;
        let path = d.path;
        if (!path && d.department) {
          const dept = Array.isArray(d.department) ? d.department[0] : d.department;
          const c2 = Array.isArray(d.category2) ? d.category2[0] : d.category2;
          const c3 = Array.isArray(d.category3) ? d.category3[0] : d.category3;
          path = [dept, c2, c3].filter(Boolean);
        }
        return {
          ...r, post_id: r.post_id, data: {
            ...d, type: d.type || '메모', path: path || ['미분류_창고'],
            position: toArr(d.position), attachments: d.attachments || [],
            content: d.content || '', author: d.author || '', pinned: !!d.pinned,
            created_at: d.created_at || r.updated_at || '',
          }
        };
      });

      // work_materials → HubPost 변환 (업무 자료 통합)
      const matPosts: HubPost[] = (Array.isArray(materialsRaw) ? materialsRaw : []).map((r: any) => {
        const d = typeof r.data === 'string' ? JSON.parse(r.data) : r.data;
        const dept = Array.isArray(d.department) ? d.department[0] : (d.department || '');
        const c2 = Array.isArray(d.category2) ? d.category2[0] : (d.category2 || '');
        const c3 = Array.isArray(d.category3) ? d.category3[0] : (d.category3 || '');
        return {
          id: r.id, post_id: `mat_${r.material_id}`, data: {
            type: '파일' as PostType,
            path: [dept, c2, c3].filter(Boolean) as [string, string?, string?],
            position: toArr(d.position), title: d.title || '',
            content: d.content || '', attachments: d.attachments || [],
            author: d.author || '', pinned: false, note: d.note || '',
            created_at: d.created_at || r.updated_at || '',
          }, updated_at: r.updated_at,
        } as HubPost;
      });

      const parsedComments: HubComment[] = (Array.isArray(commentsRaw) ? commentsRaw : []).map((r: any) => {
        const d = typeof r.data === 'string' ? JSON.parse(r.data) : r.data;
        return { ...r, post_id: d.post_id, data: d };
      });

      setPosts([...hubPosts, ...matPosts]);
      setComments(parsedComments);
    } catch { setPosts([]); setComments([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // derived
  const allAuthors = [...new Set(posts.map(r => r.data.author).filter(Boolean))];

  // filtering
  const filtered = posts.filter(r => {
    const d = r.data;
    if (filterType !== '전체' && d.type !== filterType) return false;
    if (!matchesPath(d, activePath)) return false;
    if (filterPos.length && !filterPos.some(f => d.position.includes(f))) return false;
    if (filterAuthor && d.author !== filterAuthor) return false;
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

  const anyFilterActive = filterType !== '전체' || activePath.length > 0 || filterPos.length > 0 || !!filterAuthor || !!searchText;

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
          {/* 직급 필터 */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2, marginBottom: 4 }}>
            <span style={{ fontSize: 9, color: '#94a3b8', fontWeight: 600, marginRight: 2 }}>직급</span>
            {DEF_POS.map(p => {
              const active = filterPos.includes(p);
              return <button key={p} onClick={() => setFilterPos(prev => active ? prev.filter(x=>x!==p) : [...prev, p])}
                style={{ padding: '1px 6px', borderRadius: 6, border: '1px solid', borderColor: active ? '#7C3AED' : '#e2e8f0', background: active ? '#F5F3FF' : '#fff', color: active ? '#7C3AED' : '#64748b', fontSize: 9, cursor: 'pointer', fontWeight: active ? 600 : 400 }}>{p}</button>;
            })}
          </div>
          {/* 작성자 필터 (동적) */}
          {allAuthors.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2, marginBottom: 4 }}>
              <span style={{ fontSize: 9, color: '#94a3b8', fontWeight: 600, marginRight: 2 }}>작성자</span>
              {allAuthors.map(a => {
                const active = filterAuthor === a;
                return <button key={a} onClick={() => setFilterAuthor(active ? '' : a)}
                  style={{ padding: '1px 6px', borderRadius: 6, border: '1px solid', borderColor: active ? '#0EA5E9' : '#e2e8f0', background: active ? '#F0F9FF' : '#fff', color: active ? '#0EA5E9' : '#64748b', fontSize: 9, cursor: 'pointer', fontWeight: active ? 600 : 400 }}>{a}</button>;
              })}
            </div>
          )}
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
        {activeTab === 'dashboard' && <Suspense fallback={<div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>로딩...</div>}><PipelineDashboard filterType={filterType} activePath={activePath} /></Suspense>}
        {activeTab === 'table' && <Suspense fallback={<div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>로딩...</div>}><StatusTable filterType={filterType} activePath={activePath} /></Suspense>}

        {/* 피드 탭 — 테이블/그리드 + 팝업 */}
        {activeTab === 'feed' && (
          <FeedView
            sorted={sorted} posts={posts} comments={comments}
            searchText={searchText} setSearchText={setSearchText}
            anyFilterActive={anyFilterActive}
            resetFilters={() => { setFilterType('전체'); setActivePath([]); setFilterPos([]); setFilterAuthor(''); setSearchText(''); }}
            activePath={activePath} setActivePath={setActivePath}
            setShowForm={setShowForm} setEditingId={setEditingId}
            handleDelete={handleDelete} handleTogglePin={handleTogglePin}
            getPostComments={getPostComments} fetchData={fetchData}
            POST_TYPES={POST_TYPES} buildPathLabel={buildPathLabel}
            fmtDate={fmtDate} fmtSize={fmtSize}
          />
        )}
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
  const [note, setNote] = useState(editData ? (editData.data as any).note || '' : '');
  const [attachments, setAttachments] = useState<Attachment[]>(editData?.data.attachments || []);
  const [saving, setSaving] = useState(false);
  const [showLink, setShowLink] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkName, setLinkName] = useState('');
  const [uploading, setUploading] = useState<{ name: string; progress: number }[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  // 분류 섹션: 이미 선택된 상태면 접힘
  const [showClassify, setShowClassify] = useState(!selLarge);

  const midOptions = selLarge && CATEGORY_TREE[selLarge] ? Object.keys(CATEGORY_TREE[selLarge]) : [];
  const smallOptions = selLarge && selMid && CATEGORY_TREE[selLarge]?.[selMid] ? CATEGORY_TREE[selLarge][selMid] : [];
  const pathLabel = [selLarge, selMid, selSmall].filter(Boolean).join(' > ');

  const addLink = () => { if (!linkUrl) return; setAttachments([...attachments, { type: 'link', url: linkUrl, name: linkName || linkUrl }]); setLinkUrl(''); setLinkName(''); setShowLink(false); };
  const uploadOne = (f: globalThis.File): Promise<{ success: boolean; s3_url?: string }> => new Promise((resolve) => {
    const fd = new FormData(); fd.append('file', f); fd.append('category', 'work-hub');
    const xhr = new XMLHttpRequest();
    xhr.upload.onprogress = (ev) => { if (ev.lengthComputable) setUploading(prev => prev.map(u => u.name === f.name ? { ...u, progress: Math.round((ev.loaded / ev.total) * 100) } : u)); };
    xhr.onload = () => { try { resolve(JSON.parse(xhr.responseText)); } catch { resolve({ success: false }); } };
    xhr.onerror = () => resolve({ success: false });
    xhr.open('POST', '/api/upload'); xhr.send(fd);
  });
  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files; if (!files) return;
    const fileList = Array.from(files);
    setUploading(prev => [...prev, ...fileList.map(f => ({ name: f.name, progress: 0 }))]);
    for (const f of fileList) {
      const isImg = f.type.startsWith('image/');
      const j = await uploadOne(f);
      if (j.success && j.s3_url) { setAttachments(p => [...p, { type: isImg ? 'image' : 'file' as const, url: j.s3_url!, name: f.name, size: f.size }]); }
      else { toast.error(`${f.name} 실패`); }
      setUploading(prev => prev.filter(u => u.name !== f.name));
    }
    e.target.value = '';
  };

  const save = async () => {
    if (!selLarge || !title || !author) { toast.error('경로, 제목, 작성자 필수'); return; }
    setSaving(true);
    localStorage.setItem('wh-author', author);
    const path: [string, string?, string?] = [selLarge];
    if (selMid) path.push(selMid);
    if (selSmall) path.push(selSmall);
    const payload: any = { type: postType, path, position: pos, title, content, attachments, author, note, pinned: editData?.data.pinned || false, created_at: editData?.data.created_at || new Date().toISOString() };
    try {
      if (isEdit && editData) { await fetch(`/api/work-hub/${editData.post_id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }); }
      else { await fetch('/api/work-hub', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...payload, post_id: genId() }) }); }
      toast.success(isEdit ? '수정됨' : '등록됨');
      onSaved();
    } catch { toast.error('실패'); } finally { setSaving(false); }
  };

  const S = { chip: { padding: '2px 8px', borderRadius: 10, border: '1px solid', fontSize: 10, cursor: 'pointer' } as const };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 10, width: 620, maxHeight: '90vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
        {/* 헤더 */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '10px 16px', borderBottom: '1px solid #f1f5f9' }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', flex: 1 }}>{isEdit ? '수정' : '새 글'}</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={16} color="#94a3b8" /></button>
        </div>

        <div style={{ padding: '10px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {/* 유형 — 한 줄 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600 }}>유형</span>
            {POST_TYPES.map(pt => (
              <button key={pt.type} type="button" onClick={() => setPostType(pt.type)}
                style={{ ...S.chip, borderColor: postType === pt.type ? pt.color : '#e2e8f0', background: postType === pt.type ? pt.bg : '#fff', color: postType === pt.type ? pt.color : '#64748b', fontWeight: postType === pt.type ? 600 : 400 }}>
                {pt.type}
              </button>
            ))}
          </div>

          {/* 분류 — 접힘/펼침 */}
          <div style={{ background: '#f8fafc', borderRadius: 6, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <button onClick={() => setShowClassify(!showClassify)} type="button"
              style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%', padding: '5px 10px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 11, color: '#475569', fontWeight: 600, textAlign: 'left' }}>
              <FolderOpen size={11} color="#3B82F6" />
              경로: {pathLabel || '미선택'} {showClassify ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
              {pos.length > 0 && <span style={{ fontSize: 9, color: '#7C3AED' }}>직급:{pos.join(',')}</span>}
            </button>
            {showClassify && (
              <div style={{ padding: '6px 10px', borderTop: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: 4 }}>
                {/* 대분류 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 9, color: '#94a3b8', fontWeight: 600, minWidth: 36 }}>대분류*</span>
                  {DEF_LARGE.map(d => <button key={d} type="button" onClick={() => { setSelLarge(selLarge === d ? '' : d); setSelMid(''); setSelSmall(''); }}
                    style={{ ...S.chip, borderColor: selLarge === d ? '#3B82F6' : '#e2e8f0', background: selLarge === d ? '#EFF6FF' : '#fff', color: selLarge === d ? '#3B82F6' : '#64748b', fontWeight: selLarge === d ? 600 : 400 }}>{d}</button>)}
                </div>
                {/* 중분류 */}
                {midOptions.length > 0 && <div style={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 9, color: '#94a3b8', fontWeight: 600, minWidth: 36 }}>중분류</span>
                  {midOptions.map(d => <button key={d} type="button" onClick={() => { setSelMid(selMid === d ? '' : d); setSelSmall(''); }}
                    style={{ ...S.chip, borderColor: selMid === d ? '#22C55E' : '#e2e8f0', background: selMid === d ? '#F0FDF4' : '#fff', color: selMid === d ? '#22C55E' : '#64748b', fontWeight: selMid === d ? 600 : 400 }}>{d}</button>)}
                </div>}
                {/* 소분류 */}
                {smallOptions.length > 0 && <div style={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 9, color: '#94a3b8', fontWeight: 600, minWidth: 36 }}>소분류</span>
                  {smallOptions.map(d => <button key={d} type="button" onClick={() => setSelSmall(selSmall === d ? '' : d)}
                    style={{ ...S.chip, borderColor: selSmall === d ? '#F59E0B' : '#e2e8f0', background: selSmall === d ? '#FFFBEB' : '#fff', color: selSmall === d ? '#F59E0B' : '#64748b', fontWeight: selSmall === d ? 600 : 400 }}>{d}</button>)}
                </div>}
                {/* 직급 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 9, color: '#94a3b8', fontWeight: 600, minWidth: 36 }}>직급</span>
                  {DEF_POS.map(d => <button key={d} type="button" onClick={() => setPos(pos.includes(d) ? pos.filter(x => x !== d) : [...pos, d])}
                    style={{ ...S.chip, borderColor: pos.includes(d) ? '#7C3AED' : '#e2e8f0', background: pos.includes(d) ? '#F5F3FF' : '#fff', color: pos.includes(d) ? '#7C3AED' : '#64748b', fontWeight: pos.includes(d) ? 600 : 400 }}>{d}</button>)}
                </div>
              </div>
            )}
          </div>

          {/* 작성자 + 제목 — 한 줄 */}
          <div style={{ display: 'flex', gap: 8 }}>
            <input value={author} onChange={e => setAuthor(e.target.value)} placeholder="작성자 *" style={{ width: 80, padding: '5px 8px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 12, outline: 'none' }} />
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="제목 *" style={{ flex: 1, padding: '5px 8px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 12, outline: 'none' }} />
          </div>

          {/* 내용 */}
          <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="내용..." rows={4}
            style={{ width: '100%', padding: '6px 8px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 12, outline: 'none', resize: 'vertical', lineHeight: 1.5, fontFamily: 'inherit' }} />

          {/* 비고 */}
          <input value={note} onChange={e => setNote(e.target.value)} placeholder="비고" style={{ width: '100%', padding: '5px 8px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 12, outline: 'none' }} />

          {/* 첨부 — 컴팩트 */}
          <div>
            {attachments.length > 0 && <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginBottom: 6 }}>{attachments.map((att, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 8px', background: '#f8fafc', borderRadius: 6, fontSize: 11 }}>
                {att.type === 'image' && <ImageIcon size={11} color="#3B82F6" />}{att.type === 'link' && <ExternalLink size={11} color="#10B981" />}{att.type === 'file' && <File size={11} color="#F59E0B" />}
                <span style={{ flex: 1, color: '#334155' }}>{att.name}</span>
                <button onClick={() => setAttachments(attachments.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={11} color="#ef4444" /></button>
              </div>
            ))}</div>}
            {uploading.length > 0 && <div style={{ marginBottom: 6 }}>{uploading.map((u, i) => (
              <div key={i} style={{ padding: '4px 8px', background: '#EFF6FF', borderRadius: 6, fontSize: 10, border: '1px solid #BFDBFE', marginBottom: 2 }}>
                <span style={{ color: '#3B82F6' }}>{u.name} {u.progress}%</span>
                <div style={{ height: 2, background: '#BFDBFE', borderRadius: 1, marginTop: 2, overflow: 'hidden' }}><div style={{ height: '100%', width: `${u.progress}%`, background: '#3B82F6' }} /></div>
              </div>
            ))}</div>}
            <div style={{ display: 'flex', gap: 6 }}>
              <input ref={fileRef} type="file" multiple hidden onChange={handleFile} />
              <button onClick={() => fileRef.current?.click()} disabled={uploading.length > 0}
                style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '4px 10px', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 11, cursor: uploading.length > 0 ? 'not-allowed' : 'pointer', color: '#475569' }}><Upload size={11} />파일</button>
              <button onClick={() => setShowLink(!showLink)}
                style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '4px 10px', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 11, cursor: 'pointer', color: '#475569' }}><LinkIcon size={11} />링크</button>
            </div>
            {showLink && <div style={{ display: 'flex', gap: 6, marginTop: 6 }}><input value={linkUrl} onChange={e => setLinkUrl(e.target.value)} placeholder="URL" style={{ flex: 1, padding: '4px 8px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 11 }} /><input value={linkName} onChange={e => setLinkName(e.target.value)} placeholder="이름" style={{ width: 90, padding: '4px 8px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 11 }} /><button onClick={addLink} style={{ padding: '4px 10px', background: '#10B981', color: '#fff', border: 'none', borderRadius: 6, fontSize: 11, cursor: 'pointer' }}>추가</button></div>}
          </div>
        </div>

        {/* 하단 버튼 */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6, padding: '8px 16px', borderTop: '1px solid #f1f5f9' }}>
          <button onClick={onClose} style={{ padding: '5px 14px', background: '#f1f5f9', border: 'none', borderRadius: 6, fontSize: 12, cursor: 'pointer', color: '#64748b' }}>취소</button>
          <button onClick={save} disabled={saving}
            style={{ padding: '5px 14px', background: '#3B82F6', color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1 }}>{saving ? '저장...' : isEdit ? '수정' : '등록'}</button>
        </div>
      </div>
    </div>
  );
}
