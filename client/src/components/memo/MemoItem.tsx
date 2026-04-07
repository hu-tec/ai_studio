import { useState, useRef } from 'react';
import { Trash2, Crosshair, Paperclip, ExternalLink, Pencil, Check, X, Loader2 } from 'lucide-react';
import { api } from '@/api/api';
import type { MemoItemData, MemoAttachment, MemoTarget } from './memoTypes';

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return '방금 전';
  if (mins < 60) return `${mins}분 전`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}시간 전`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}일 전`;
  return new Date(dateStr).toLocaleDateString('ko-KR');
}

function scrollToTarget(selector: string) {
  try {
    const el = document.querySelector(selector);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    (el as HTMLElement).style.outline = '3px solid #3b82f6';
    (el as HTMLElement).style.outlineOffset = '2px';
    (el as HTMLElement).style.transition = 'outline 0.3s';
    setTimeout(() => {
      (el as HTMLElement).style.outline = '';
      (el as HTMLElement).style.outlineOffset = '';
    }, 2000);
  } catch { /* invalid selector */ }
}

interface Props {
  item: MemoItemData;
  onUpdate: (id: string, updates: Partial<Omit<MemoItemData, 'id' | 'created_at'>>) => void;
  onDelete: (id: string) => void;
  onStartTargeting: (editId: string) => void;
}

export function MemoItem({ item, onUpdate, onDelete, onStartTargeting }: Props) {
  const [editing, setEditing] = useState(false);
  const [editAuthor, setEditAuthor] = useState(item.author);
  const [editText, setEditText] = useState(item.text);
  const [editAttachments, setEditAttachments] = useState(item.attachments);
  const [editTarget, setEditTarget] = useState(item.target);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const startEdit = () => {
    setEditAuthor(item.author);
    setEditText(item.text);
    setEditAttachments([...item.attachments]);
    setEditTarget(item.target);
    setEditing(true);
  };

  const cancelEdit = () => setEditing(false);

  const saveEdit = () => {
    onUpdate(item.id, {
      author: editAuthor.trim(),
      text: editText.trim(),
      attachments: editAttachments,
      target: editTarget,
    });
    setEditing(false);
  };

  const handleFileAdd = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
          setEditAttachments((prev) => [...prev, {
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

  // 외부에서 대상 지정 결과 반영용
  // MemoPanel에서 editTarget을 설정해줌
  const setTargetFromOutside = (target: MemoTarget) => {
    setEditTarget(target);
  };
  // expose via item id — MemoPanel에서 관리

  if (editing) {
    return (
      <div className="rounded-lg border-2 border-blue-200 bg-blue-50/30 p-3 text-sm space-y-2">
        {/* 작성자 */}
        <input
          value={editAuthor}
          onChange={(e) => setEditAuthor(e.target.value)}
          placeholder="작성자"
          className="w-full rounded border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 focus:border-blue-400 focus:outline-none"
        />

        {/* 대상 뱃지 */}
        {editTarget && (
          <div className="flex items-center gap-1">
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-600">
              <Crosshair size={11} />
              <span className="max-w-[180px] truncate">{editTarget.label}</span>
            </span>
            <button onClick={() => setEditTarget(null)} className="text-slate-400 hover:text-red-500">
              <X size={12} />
            </button>
          </div>
        )}

        {/* 텍스트 */}
        <textarea
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          rows={3}
          className="w-full resize-none rounded border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-700 focus:border-blue-400 focus:outline-none"
        />

        {/* 첨부파일 */}
        {editAttachments.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {editAttachments.map((att, i) => (
              <span key={i} className="inline-flex items-center gap-1 rounded bg-white px-2 py-0.5 text-xs text-slate-600 border border-slate-200">
                <Paperclip size={10} />
                <span className="max-w-[100px] truncate">{att.original_name}</span>
                <button onClick={() => setEditAttachments((p) => p.filter((_, j) => j !== i))} className="text-slate-400 hover:text-red-500">
                  <X size={11} />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* 액션 버튼 */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1">
            <input ref={fileRef} type="file" multiple onChange={handleFileAdd} className="hidden" />
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors disabled:opacity-50"
              title="파일 첨부"
            >
              {uploading ? <Loader2 size={14} className="animate-spin" /> : <Paperclip size={14} />}
            </button>
            <button
              onClick={() => onStartTargeting(item.id)}
              className="rounded p-1 text-slate-400 hover:bg-blue-100 hover:text-blue-500 transition-colors"
              title="대상 지정"
            >
              <Crosshair size={14} />
            </button>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={cancelEdit} className="rounded px-2 py-1 text-xs text-slate-500 hover:bg-slate-200 transition-colors">
              취소
            </button>
            <button onClick={saveEdit} className="inline-flex items-center gap-1 rounded bg-blue-500 px-2 py-1 text-xs text-white hover:bg-blue-600 transition-colors">
              <Check size={12} />
              저장
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 text-sm">
      {/* 헤더: 작성자 + 시간 + 편집/삭제 */}
      <div className="mb-1.5 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {item.author && (
            <span className="text-xs font-medium text-slate-600">{item.author}</span>
          )}
          <span className="text-xs text-slate-400">{timeAgo(item.created_at)}</span>
        </div>
        <div className="flex items-center gap-0.5">
          <button
            onClick={startEdit}
            className="rounded p-0.5 text-slate-300 hover:bg-blue-50 hover:text-blue-500 transition-colors"
            title="편집"
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={() => onDelete(item.id)}
            className="rounded p-0.5 text-slate-300 hover:bg-red-50 hover:text-red-500 transition-colors"
            title="삭제"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* 대상 뱃지 */}
      {item.target && (
        <button
          onClick={() => scrollToTarget(item.target!.selector)}
          className="mb-1.5 inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-600 hover:bg-blue-100 transition-colors"
        >
          <Crosshair size={11} />
          <span className="max-w-[200px] truncate">{item.target.label}</span>
        </button>
      )}

      {/* 텍스트 */}
      {item.text && (
        <p className="whitespace-pre-wrap text-slate-700 leading-relaxed">{item.text}</p>
      )}

      {/* 첨부파일 */}
      {item.attachments.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {item.attachments.map((att, i) => (
            <a
              key={i}
              href={att.s3_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded bg-slate-50 px-2 py-1 text-xs text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <Paperclip size={11} />
              <span className="max-w-[140px] truncate">{att.original_name}</span>
              <ExternalLink size={10} />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
