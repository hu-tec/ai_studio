/* ══════════════════════════════════════════════════════════════
   다중 파이프라인 정의
   ══════════════════════════════════════════════════════════════ */

export type ItemStatus = '아이디어' | '기획' | '디자인' | '개발' | '테스트' | '배포' | '운영';
export type PostType = '공지' | '업무지시' | '메모' | '파일' | '프로세스' | '보고';

export const POST_TYPE_STYLES: Record<PostType, { color: string; bg: string }> = {
  '공지':     { color: '#DC2626', bg: '#FEF2F2' },
  '업무지시': { color: '#7C3AED', bg: '#F5F3FF' },
  '메모':     { color: '#0EA5E9', bg: '#F0F9FF' },
  '파일':     { color: '#F59E0B', bg: '#FFFBEB' },
  '프로세스': { color: '#10B981', bg: '#F0FDF4' },
  '보고':     { color: '#6366F1', bg: '#EEF2FF' },
};

export const STATUSES: { key: ItemStatus; color: string; bg: string }[] = [
  { key: '아이디어', color: '#94a3b8', bg: '#f1f5f9' },
  { key: '기획',     color: '#8B5CF6', bg: '#F5F3FF' },
  { key: '디자인',   color: '#EC4899', bg: '#FDF2F8' },
  { key: '개발',     color: '#F59E0B', bg: '#FFFBEB' },
  { key: '테스트',   color: '#0EA5E9', bg: '#F0F9FF' },
  { key: '배포',     color: '#10B981', bg: '#F0FDF4' },
  { key: '운영',     color: '#3B82F6', bg: '#EFF6FF' },
];

export const statusOf = (s: ItemStatus) => STATUSES.find(x => x.key === s)!;

export interface PipelineStage {
  key: string;
  label: string;
  filters: { label: string; options: string[] }[];
}

export interface Pipeline {
  id: string;
  name: string;
  color: string;
  bg: string;
  icon: string;
  stages: PipelineStage[];
  relatedPages?: { label: string; path: string }[]; // ai_studio 내부 페이지 링크
}

export interface PipelineItem {
  id: string;
  pipelineId: string;
  stageKey: string;
  type: PostType;
  sub1: string;
  sub2?: string;
  title: string;
  status: ItemStatus;
  assignee?: string;
  link?: string;
  note?: string;
  date?: string;
}

/* ── 파이프라인 정의 ── */
export const PIPELINES: Pipeline[] = [
  {
    id: 'biz', name: '사업', color: '#DC2626', bg: '#FEF2F2', icon: '🏢',
    stages: [
      { key: '과목', label: '과목', filters: [{ label: '종목', options: ['프롬', '테솔', '번역', '윤리'] }] },
      { key: '급수', label: '급수', filters: [{ label: '구분', options: ['교육', '일반', '전문'] }, { label: '급', options: ['1급','2급','3급','4급','5급','6급','7급','8급'] }] },
      { key: '기능', label: '기능', filters: [{ label: '형태', options: ['문서', '음성', '영상', '개발', '창의적활동'] }] },
      { key: '산업전문', label: '산업/전문', filters: [{ label: '영역', options: ['법률', '의료', 'IT', '금융', '교육', '요리', '부동산', '기타'] }] },
      { key: '규정', label: '규정', filters: [{ label: '유형', options: ['규정(A)', '준규정(B)', '선택규정(C)'] }, { label: '적용', options: ['영상', '텍스트', '음성'] }] },
      { key: '상품화', label: '상품화', filters: [{ label: '목적', options: ['상품(팔것)', '교육(운영)', '강사(인증)', '직원권한'] }] },
    ],
    relatedPages: [
      { label: '강사커리', path: '/instructor-curri' },
      { label: '규정관리', path: '/rules-jungeol' },
      { label: '규정편집', path: '/rules-editor' },
    ],
  },
  {
    id: 'hire', name: '채용/인사', color: '#7C3AED', bg: '#F5F3FF', icon: '👥',
    stages: [
      { key: '지원접수', label: '지원접수', filters: [{ label: '경로', options: ['홈페이지', '추천', '공고', '직접지원'] }] },
      { key: '서류심사', label: '서류심사', filters: [{ label: '포지션', options: ['강사', '개발', '마케팅', '관리', '기타'] }] },
      { key: '면접', label: '면접', filters: [{ label: '단계', options: ['1차면접', '2차면접', '최종면접'] }] },
      { key: '평가', label: '평가', filters: [{ label: '결과', options: ['A', 'B', 'C', 'D', '보류'] }] },
      { key: '채용결정', label: '채용결정', filters: [{ label: '형태', options: ['정규', '계약', '파트타임', '외부'] }] },
      { key: '온보딩', label: '온보딩', filters: [{ label: '단계', options: ['서류', '교육', 'OJT', '배정완료'] }] },
    ],
    relatedPages: [
      { label: '면접입력', path: '/interview' },
      { label: '면접대시보드', path: '/interview/dashboard' },
      { label: '면접플로우', path: '/instructor-flow' },
      { label: '출퇴근', path: '/attendance' },
    ],
  },
  {
    id: 'edu', name: '교육/강사', color: '#10B981', bg: '#F0FDF4', icon: '🎓',
    stages: [
      { key: '커리설계', label: '커리큘럼', filters: [{ label: '과목', options: ['프롬', '테솔', '번역', '윤리'] }] },
      { key: '교안제작', label: '교안제작', filters: [{ label: '형태', options: ['PPT', '영상', '교재', '실습'] }] },
      { key: '강사배정', label: '강사배정', filters: [{ label: '형태', options: ['전임', '파트', '외부', '온라인'] }] },
      { key: '수업진행', label: '수업진행', filters: [{ label: '방식', options: ['대면', '온라인', '하이브리드'] }] },
      { key: '평가', label: '평가', filters: [{ label: '유형', options: ['시험', '과제', '실습', '포트폴리오'] }] },
      { key: '인증', label: '인증', filters: [{ label: '급수', options: ['교육', '일반', '전문'] }] },
    ],
    relatedPages: [
      { label: '강사커리', path: '/instructor-curri' },
      { label: '강사채점', path: '/instructor-eval' },
      { label: '레슨플랜', path: '/lesson-plan' },
      { label: '강의시간표', path: '/schedule' },
    ],
  },
  {
    id: 'dev', name: '개발', color: '#0EA5E9', bg: '#F0F9FF', icon: '💻',
    stages: [
      { key: '기획', label: '기획', filters: [{ label: '시스템', options: ['AI Studio', 'Work Studio', 'CBT', '홈페이지', '기타'] }] },
      { key: '디자인', label: '디자인', filters: [{ label: '도구', options: ['Figma', 'Tailwind', '기타'] }] },
      { key: '개발', label: '개발', filters: [{ label: '스택', options: ['React', 'Express', 'Next.js', 'SQLite', 'AWS'] }] },
      { key: '테스트', label: '테스트', filters: [{ label: '유형', options: ['기능', 'UI', '성능', '보안'] }] },
      { key: '배포', label: '배포', filters: [{ label: '환경', options: ['EC2', 'GitHub Pages', 'PM2'] }] },
      { key: '운영', label: '운영', filters: [{ label: '상태', options: ['정상', '장애', '점검', '폐기'] }] },
    ],
    relatedPages: [
      { label: '관리자통합', path: '/admin-system' },
      { label: '서버저장소', path: '/storage' },
    ],
  },
  {
    id: 'rule', name: '규정', color: '#F59E0B', bg: '#FFFBEB', icon: '📜',
    stages: [
      { key: '초안', label: '초안', filters: [{ label: '유형', options: ['규정(A)', '준규정(B)', '선택규정(C)'] }] },
      { key: '검토', label: '검토', filters: [{ label: '검토자', options: ['대표', '팀장', '법무', '외부'] }] },
      { key: '승인', label: '승인', filters: [{ label: '상태', options: ['승인', '조건부승인', '반려'] }] },
      { key: '배포', label: '배포', filters: [{ label: '대상', options: ['전사', '부서', '팀', '개인'] }] },
      { key: '모니터링', label: '모니터링', filters: [{ label: '주기', options: ['일간', '주간', '월간', '분기'] }] },
    ],
    relatedPages: [
      { label: '규정관리', path: '/rules-mgmt' },
      { label: '규정편집', path: '/rules-editor' },
      { label: '규정매뉴얼', path: '/rules-manual' },
      { label: '규정(준걸)', path: '/rules-jungeol' },
      { label: '평가기준', path: '/eval-criteria' },
    ],
  },
  {
    id: 'mkt', name: '마케팅/영업', color: '#EC4899', bg: '#FDF2F8', icon: '📢',
    stages: [
      { key: '타겟분석', label: '타겟분석', filters: [{ label: '시장', options: ['교육', '기업', '개인', '해외'] }] },
      { key: '콘텐츠', label: '콘텐츠', filters: [{ label: '형태', options: ['블로그', 'SNS', '영상', '브로슈어', '이메일'] }] },
      { key: '채널배포', label: '채널배포', filters: [{ label: '채널', options: ['웹사이트', '인스타', '유튜브', '네이버', '직접'] }] },
      { key: '리드', label: '리드생성', filters: [{ label: '단계', options: ['관심', '문의', '상담', '견적'] }] },
      { key: '계약', label: '계약', filters: [{ label: '유형', options: ['신규', '갱신', '업그레이드'] }] },
    ],
    relatedPages: [
      { label: '마케팅', path: '/marketing' },
      { label: '거래처아웃콜', path: '/outbound-calls' },
      { label: '미수금', path: '/overdue' },
    ],
  },
];

/* ── 데이터: 빈 상태 ── */
export const DUMMY_ITEMS: PipelineItem[] = [];
