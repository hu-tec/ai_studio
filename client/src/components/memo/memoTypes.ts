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

export interface MemoItemData {
  id: string;
  author: string;
  category: MemoCategory;
  text: string;
  attachments: MemoAttachment[];
  target: MemoTarget | null;
  created_at: string;
}

export interface PageMemoData {
  items: MemoItemData[];
}
