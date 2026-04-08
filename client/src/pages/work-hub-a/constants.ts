/* ── 상수 (ver.B에서 추출 + 통합) ── */
import type { PostType, TaskStatus } from './types';

/* 부서별 폴더 트리 */
const SITES = ['AI번역_AITe','ITT_정통번역','TESOL','고전번역_통독','대표님페이지','반도체_조선_방산','번역_메타트랜스','윤리','전문가매칭','전시회','프롬프트','휴텍씨'];
const DEV_SUB = ['DB','UI','기획','산출물'];
const FUNC_MID = ['규정','교육','홍보','기술','운영'];
const FUNC_SMALL: Record<string,string[]> = { '규정':['급여','복무','기타'], '교육':['교안','기타'], '홍보':['브로슈어','기타'], '기술':['서버','시스템','기타'], '운영':['기타'] };
const funcEntries = () => Object.fromEntries(FUNC_MID.map(m => [m, FUNC_SMALL[m] || []]));

export const CATEGORY_TREE: Record<string, Record<string, string[]>> = {
  '개발': Object.fromEntries([...SITES,'공통_플러그인_모듈'].map(s => [s, DEV_SUB])),
  '회계': { '거래처원장':[],'부가세':[],'세금계산서':[],'수익':SITES,'연도별_결산':[],'지출':SITES },
  '마케팅': Object.fromEntries([...SITES,'SNS_카드뉴스','공통_브랜딩'].map(s => [s, []])),
  '인사': { '근로계약_서약서':[],'면접자료':[],'신입교육':[],'인수인계':[] },
  '법무': { '공정거래_애니릭스':[],'세무조사_구룡':[],'티맥스소송':[],'행정서류':[] },
  '기획_사업': { '데이터가치평가':[],'벤처_인증':[],'예비창업패키지':[],'정부제안서':[] },
  '매뉴얼_규정': { '검토중':[],'아카이브':[],'최신본':[] },
  '직원별': { '박가연':[],'박미진':[],'시온':[],'조수연':[],'지예':[],'퇴사자_아카이브':[] },
  '경영': funcEntries(), '영업': funcEntries(), '강사팀': funcEntries(),
  '홈페이지': funcEntries(), '상담': funcEntries(), '총무': funcEntries(), '관리': funcEntries(),
  '삭제대기': {}, '미분류_창고': {},
};
export const DEF_LARGE = Object.keys(CATEGORY_TREE);

export const SERVICE_URLS: Record<string, string> = {
  'AI번역_AITe':'http://54.116.15.136:82', 'TESOL':'https://hu-tec.github.io/TESOL/',
  '고전번역_통독':'https://hu-tec.github.io/classic-translation/', '번역_메타트랜스':'https://hu-tec.github.io/translation-hub/',
  '윤리':'https://hu-tec.github.io/ai-ethics/', '휴텍씨':'https://hu-tec.github.io/company_hutec/',
  '대표님페이지':'https://hu-tec.github.io/personal_page/',
};

export const DEF_POS = ['대표','임원','팀장','강사','신입','알바','외부'];

export const POST_TYPE_STYLES: Record<PostType, { color: string; bg: string; icon: string }> = {
  '공지':     { color:'#DC2626', bg:'#FEF2F2', icon:'📢' },
  '업무지시': { color:'#7C3AED', bg:'#F5F3FF', icon:'📋' },
  '메모':     { color:'#0EA5E9', bg:'#F0F9FF', icon:'📝' },
  '파일':     { color:'#F59E0B', bg:'#FFFBEB', icon:'📁' },
  '프로세스': { color:'#10B981', bg:'#F0FDF4', icon:'⚙️' },
  '보고':     { color:'#6366F1', bg:'#EEF2FF', icon:'📊' },
};

export const TASK_STATUS_STYLES: Record<TaskStatus, { color: string; bg: string }> = {
  '할당대기': { color:'#F59E0B', bg:'#FFFBEB' },
  '진행중':   { color:'#3B82F6', bg:'#EFF6FF' },
  '검토중':   { color:'#8B5CF6', bg:'#F5F3FF' },
  '완료':     { color:'#10B981', bg:'#F0FDF4' },
};
export const TASK_STATUSES: TaskStatus[] = ['할당대기','진행중','검토중','완료'];

export const DEPT_COLORS: Record<string, string> = {
  '개발':'#EFF6FF','회계':'#FEF9C3','마케팅':'#FCE7F3','인사':'#F0FDF4',
  '법무':'#FEF2F2','기획_사업':'#EEF2FF','매뉴얼_규정':'#FDF4FF',
  '직원별':'#F0FDFA','경영':'#FFF7ED','영업':'#ECFDF5','강사팀':'#F5F3FF',
  '홈페이지':'#F0F9FF','상담':'#FFFBEB','총무':'#F8FAFC','관리':'#FEF2F2',
};
export const getDeptBg = (path: any) => (Array.isArray(path) && path[0] && DEPT_COLORS[path[0]]) || '#fff';

export const PIPELINE_DEPT_MAP: Record<string, string[]> = {
  biz: ['기획_사업','경영','영업'],
  hire: ['인사'],
  edu: ['강사팀'],
  dev: ['개발','홈페이지'],
  rule: ['매뉴얼_규정'],
  mkt: ['마케팅','상담'],
};

/* helpers */
export const toArr = (v: unknown): string[] => Array.isArray(v) ? v : typeof v === 'string' && v ? [v] : [];
export function fmtDate(iso: string) {
  const d = new Date(iso); const now = new Date(); const diff = now.getTime() - d.getTime();
  if (diff < 60000) return '방금'; if (diff < 3600000) return `${Math.floor(diff/60000)}분`;
  if (diff < 86400000) return `${Math.floor(diff/3600000)}시간`; if (diff < 604800000) return `${Math.floor(diff/86400000)}일`;
  return `${d.getMonth()+1}.${d.getDate()}`;
}
export function fmtSize(b: number) { if(b<1024) return `${b}B`; if(b<1048576) return `${(b/1024).toFixed(0)}KB`; return `${(b/1048576).toFixed(1)}MB`; }
export function genId() { return Date.now().toString(36) + Math.random().toString(36).slice(2,8); }
export function buildPathLabel(d: { path: any[] }) { return (d.path || []).filter(Boolean).join(' > '); }
export function matchesPath(d: any, activePath: string[]) {
  if (!activePath.length) return true;
  const p = d?.path || [];
  for (let i = 0; i < activePath.length; i++) { if ((p[i] || '') !== activePath[i]) return false; }
  return true;
}
