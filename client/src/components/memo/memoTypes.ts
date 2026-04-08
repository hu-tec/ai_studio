export interface MemoAttachment {
  original_name: string;
  s3_url: string;
  s3_key: string;
}

export interface MemoTarget {
  label: string;
  selector: string;
  description?: string;
}

export const MEMO_CATEGORIES = [
  { key: 'memo', label: '메모', color: 'bg-slate-100 text-slate-600' },
  { key: 'issue', label: '이슈', color: 'bg-red-50 text-red-600' },
  { key: 'improve', label: '개선', color: 'bg-amber-50 text-amber-600' },
  { key: 'request', label: '요청', color: 'bg-purple-50 text-purple-600' },
  { key: 'reference', label: '참고', color: 'bg-green-50 text-green-600' },
] as const;

export type MemoCategory = (typeof MEMO_CATEGORIES)[number]['key'];

/** 분류별 하위 메뉴 */
export const MEMO_SUB_CATEGORIES: Record<MemoCategory, string[]> = {
  memo: ['일반', '회의', '아이디어', '일정'],
  issue: ['버그', '장애', '긴급', '보류'],
  improve: ['UI', '기능', '성능', '프로세스'],
  request: ['피드백', '승인', '확인', '자료', '보고'],
  reference: ['참고', '공유', '학습', '링크'],
};

/** 직원 목록 — 업무일지 employees에서 가져옴 */
export { employees as MEMO_EMPLOYEES } from '@/pages/work-log/data';

export interface MemoReply {
  id: string;
  author: string;
  text: string;
  created_at: string;
}

export interface MemoItemData {
  id: string;
  author: string;
  category: MemoCategory;
  subCategory?: string;
  toName?: string;
  text: string;
  attachments: MemoAttachment[];
  target: MemoTarget | null;
  created_at: string;
  replies?: MemoReply[];
}

export interface PageMemoData {
  items: MemoItemData[];
}
