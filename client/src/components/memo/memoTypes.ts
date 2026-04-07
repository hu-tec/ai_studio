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

export interface MemoItemData {
  id: string;
  author: string;
  text: string;
  attachments: MemoAttachment[];
  target: MemoTarget | null;
  created_at: string;
}

export interface PageMemoData {
  items: MemoItemData[];
}
