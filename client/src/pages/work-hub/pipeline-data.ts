/* ══════════════════════════════════════════════════════════════
   파이프라인 데이터 정의 + 더미 데이터
   ══════════════════════════════════════════════════════════════ */

export type PipelineStage = '과목' | '급수' | '기능' | '산업전문' | '규정' | '상품화';
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

export interface PipelineItem {
  id: string;
  stage: PipelineStage;
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

export const STAGES: { key: PipelineStage; label: string; color: string; bg: string; filters: { label: string; options: string[] }[] }[] = [
  { key: '과목', label: '과목', color: '#DC2626', bg: '#FEF2F2', filters: [
    { label: '종목', options: ['프롬', '테솔', '번역', '윤리'] },
  ]},
  { key: '급수', label: '급수', color: '#7C3AED', bg: '#F5F3FF', filters: [
    { label: '구분', options: ['교육', '일반', '전문'] },
    { label: '급', options: ['1급','2급','3급','4급','5급','6급','7급','8급'] },
  ]},
  { key: '기능', label: '기능', color: '#0EA5E9', bg: '#F0F9FF', filters: [
    { label: '형태', options: ['문서', '음성', '영상', '개발', '창의적활동'] },
  ]},
  { key: '산업전문', label: '산업/전문영역', color: '#F59E0B', bg: '#FFFBEB', filters: [
    { label: '영역', options: ['법률', '의료', 'IT', '금융', '교육', '요리', '부동산', '기타'] },
  ]},
  { key: '규정', label: '규정 레이어', color: '#10B981', bg: '#F0FDF4', filters: [
    { label: '유형', options: ['규정(A)', '준규정(B)', '선택규정(C)'] },
    { label: '적용', options: ['영상', '텍스트', '음성'] },
  ]},
  { key: '상품화', label: '상품화', color: '#6366F1', bg: '#EEF2FF', filters: [
    { label: '목적', options: ['상품(팔것)', '교육(운영)', '강사(인증)', '직원권한'] },
  ]},
];

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

/* ── 데이터: 빈 상태 (실제 데이터는 UI에서 직접 등록) ── */
export const DUMMY_ITEMS: PipelineItem[] = [];
