import { useState, useRef } from 'react';
import { Send, Paperclip, Crosshair, X, Loader2 } from 'lucide-react';
import { api } from '@/api/api';
import type { MemoAttachment, MemoTarget } from './memoTypes';

interface Props {
  onSubmit: (data: { author: string; text: string; attachments: MemoAttachment[]; target: MemoTarget | null }) => void;
  onStartTargeting: () => void;
  pendingTarget: MemoTarget | null;
  onClearTarget: () => void;
}

const AUTHOR_KEY = 'memo_author';

export function MemoInput({ onSubmit, onStartTargeting, pendingTarget, onClearTarget }: Props) {
  const [author, setAuthor] = useState(() => localStorage.getItem(AUTHOR_KEY) || '');
  const [text, setText] = useState('');
  const [attachments, setAttachments] = useState<MemoAttachment[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('category', 'memos');
        const res = await api.upload.file(formData);
        if (res.s3_url) {
          setAttachments((prev) => [...prev, {
            original_name: res.original_name || file.name,
            s3_url: res.s3_url,
            s3_key: res.s3_key || '',
          }]);
        }
      }
    } catch (err) {
      console.error('File upload failed:', err);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleSubmit = () => {
    if (!text.trim() && attachments.length === 0) return;
    if (author.trim()) localStorage.setItem(AUTHOR_KEY, author.trim());
    onSubmit({ author: author.trim(), text: text.trim(), attachments, target: pendingTarget });
    setText('');
    setAttachments([]);
    onClearTarget();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="border-t border-slate-200 bg-slate-50 p-3">
      {/* 작성자 */}
      <input
        value={author}
        onChange={(e) => setAuthor(e.target.value)}
        placeholder="작성자 이름"
        className="mb-2 w-full rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
      />

      {/* 대상 뱃지 */}
      {pendingTarget && (
        <div className="mb-2 flex items-center gap-1">
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-600">
            <Crosshair size={11} />
            <span className="max-w-[200px] truncate">{pendingTarget.label}</span>
          </span>
          <button onClick={onClearTarget} className="text-slate-400 hover:text-red-500">
            <X size={13} />
          </button>
        </div>
      )}

      {/* 첨부파일 미리보기 */}
      {attachments.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1">
          {attachments.map((att, i) => (
            <span key={i} className="inline-flex items-center gap-1 rounded bg-white px-2 py-0.5 text-xs text-slate-600 border border-slate-200">
              <Paperclip size={10} />
              <span className="max-w-[120px] truncate">{att.original_name}</span>
              <button onClick={() => setAttachments((p) => p.filter((_, j) => j !== i))} className="text-slate-400 hover:text-red-500">
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* 텍스트 입력 */}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="메모 작성... (Ctrl+Enter로 전송)"
        rows={3}
        className="w-full resize-none rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
      />

      {/* 액션 버튼 */}
      <div className="mt-2 flex items-center justify-between">
        <div className="flex items-center gap-1">
          {/* 파일 첨부 */}
          <input ref={fileRef} type="file" multiple onChange={handleFileChange} className="hidden" />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="rounded p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors disabled:opacity-50"
            title="파일 첨부"
          >
            {uploading ? <Loader2 size={16} className="animate-spin" /> : <Paperclip size={16} />}
          </button>

          {/* 대상 지정 */}
          <button
            onClick={onStartTargeting}
            className="rounded p-1.5 text-slate-400 hover:bg-blue-50 hover:text-blue-500 transition-colors"
            title="대상 지정"
          >
            <Crosshair size={16} />
          </button>
        </div>

        {/* 전송 */}
        <button
          onClick={handleSubmit}
          disabled={!text.trim() && attachments.length === 0}
          className="inline-flex items-center gap-1 rounded-md bg-blue-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Send size={13} />
          전송
        </button>
      </div>
    </div>
  );
}
