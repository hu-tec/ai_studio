/* ── 업무 총괄 ver.A 타입 ── */

export type PostType = '공지' | '업무지시' | '메모' | '파일' | '프로세스' | '보고';
export type TaskStatus = '할당대기' | '진행중' | '검토중' | '완료';

export interface Attachment {
  type: 'image' | 'link' | 'file';
  url: string;
  name: string;
  size?: number;
}

export interface HubPostData {
  type: PostType;
  path: [string, string?, string?];
  position: string[];
  title: string;
  content: string;
  attachments: Attachment[];
  author: string;
  pinned: boolean;
  created_at: string;
  note?: string;
  // ver.A 추가
  status?: TaskStatus;
  assignee?: string;
  pipelineId?: string;
  stageKey?: string;
  dueDate?: string;
}

export interface HubPost {
  id: number;
  post_id: string;
  data: HubPostData;
  updated_at: string;
}

export interface CommentData {
  post_id: string;
  author: string;
  content: string;
  created_at: string;
}

export interface HubComment {
  id: number;
  comment_id: string;
  post_id: string;
  data: CommentData;
  created_at: string;
}

export type SectionKey = 'board' | 'feed' | 'pipeline' | 'status' | 'archive' | 'links' | 'system';
