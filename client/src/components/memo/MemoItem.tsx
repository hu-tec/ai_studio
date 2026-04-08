import { useState, useRef } from 'react';
import { Trash2, Crosshair, Paperclip, ExternalLink, Pencil, Check, X, Loader2, MessageCircle, Send, ChevronDown, ChevronUp } from 'lucide-react';
import { api } from '@/api/api';
import { MEMO_CATEGORIES, MEMO_SUB_CATEGORIES, MEMO_EMPLOYEES, type MemoItemData, type MemoAttachment, type MemoTarget, type MemoCategory, type MemoReply } from './memoTypes';

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
  const [editCategory, setEditCategory] = useState<MemoCategory>(item.category || 'memo');
  const [editSubCategory, setEditSubCategory] = useState(item.subCategory || '');
  const [editToName, setEditToName] = useState(item.toName || '');
  const [editText, setEditText] = useState(item.text);
  const [editAttachments, setEditAttachments] = useState(item.attachments);
  const [editTarget, setEditTarget] = useState(item.target);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // 댓글 상태
  const [showReplies, setShowReplies] = useState(false);
  const [replyAuthor, setReplyAuthor] = useState(() => localStorage.getItem('memo_author') || '');
  const [replyText, setReplyText] = useState('');

  const replies = item.replies || [];

  const startEdit = () => {
    setEditAuthor(item.author);
    setEditCategory(item.category || 'memo');
    setEditSubCategory(item.subCategory || '');
    setEditToName(item.toName || '');
    setEditText(item.text);
    setEditAttachments([...item.attachments]);
    setEditTarget(item.target);
    setEditing(true);
  };

  const cancelEdit = () => setEditing(false);

  const saveEdit = () => {
    onUpdate(item.id, {
      author: editAuthor.trim(),
      category: editCategory,
      subCategory: editSubCategory || undefined,
      toName: editToName || undefined,
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

  const handleAddReply = () => {
    if (!replyText.trim()) return;
    const newReply: MemoReply = {
      id: `reply_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      author: replyAuthor.trim(),
      text: replyText.trim(),
      created_at: new Date().toISOString(),
    };
    onUpdate(item.id, { replies: [...replies, newReply] });
    setReplyText('');
  };

  const handleDeleteReply = (replyId: string) => {
    onUpdate(item.id, { replies: replies.filter((r) => r.id !== replyId) });
  };

  if (editing) {
    const editSubCats = MEMO_SUB_CATEGORIES[editCategory];
    return (
      <div className="rounded-lg border-2 border-blue-200 bg-blue-50/30 p-2 text-sm space-y-1.5">
        {/* 작성자 */}
        <div className="flex items-center gap-1 flex-wrap">
          <span className="text-[10px] text-slate-400 font-medium">작성자</span>
          {MEMO_EMPLOYEES.map((emp) => (
            <button key={emp.id} onClick={() => setEditAuthor(emp.name)}
              className={`rounded-md px-1.5 py-0.5 text-[10px] font-medium transition-all ${
                editAuthor === emp.name ? 'bg-slate-700 text-white' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-100'
              }`}>{emp.name}</button>
          ))}
        </div>

        {/* 분류 */}
        <div className="flex flex-wrap gap-1">
          {MEMO_CATEGORIES.map((cat) => (
            <button key={cat.key}
              onClick={() => { setEditCategory(cat.key); setEditSubCategory(''); }}
              className={`rounded-full px-2 py-0.5 text-[10px] font-medium transition-all ${
                editCategory === cat.key ? `${cat.color} ring-1 ring-current` : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
              }`}>{cat.label}</button>
          ))}
        </div>

        {/* 하위 분류 */}
        <div className="flex items-center gap-1 flex-wrap">
          <span className="text-[10px] text-slate-400">세부</span>
          {editSubCats.map((sub) => (
            <button key={sub} onClick={() => setEditSubCategory(editSubCategory === sub ? '' : sub)}
              className={`rounded-md px-1.5 py-0.5 text-[10px] font-medium transition-all ${
                editSubCategory === sub ? 'bg-blue-500 text-white' : 'bg-white border border-slate-200 text-slate-500 hover:bg-blue-50'
              }`}>{sub}</button>
          ))}
        </div>

        {/* 대상자 */}
        <div className="flex items-center gap-1 flex-wrap">
          <span className="text-[10px] text-slate-400">대상</span>
          {MEMO_EMPLOYEES.map((emp) => (
            <button key={emp.id} onClick={() => setEditToName(editToName === emp.name ? '' : emp.name)}
              className={`rounded-md px-1.5 py-0.5 text-[10px] font-medium transition-all ${
                editToName === emp.name ? 'bg-purple-500 text-white' : 'bg-white border border-slate-200 text-slate-500 hover:bg-purple-50'
              }`}>{emp.name}</button>
          ))}
        </div>

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
        <textarea value={editText} onChange={(e) => setEditText(e.target.value)} rows={2}
          className="w-full resize-none rounded border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 focus:border-blue-400 focus:outline-none" />

        {/* 첨부파일 */}
        {editAttachments.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {editAttachments.map((att, i) => (
              <span key={i} className="inline-flex items-center gap-1 rounded bg-white px-1.5 py-0.5 text-[10px] text-slate-600 border border-slate-200">
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
        <div className="flex items-center justify-between pt-0.5">
          <div className="flex items-center gap-1">
            <input ref={fileRef} type="file" multiple onChange={handleFileAdd} className="hidden" />
            <button onClick={() => fileRef.current?.click()} disabled={uploading}
              className="rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors disabled:opacity-50" title="파일 첨부">
              {uploading ? <Loader2 size={13} className="animate-spin" /> : <Paperclip size={13} />}
            </button>
            <button onClick={() => onStartTargeting(item.id)}
              className="rounded p-1 text-slate-400 hover:bg-blue-100 hover:text-blue-500 transition-colors" title="대상 지정">
              <Crosshair size={13} />
            </button>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={cancelEdit} className="rounded px-2 py-0.5 text-[11px] text-slate-500 hover:bg-slate-200 transition-colors">취소</button>
            <button onClick={saveEdit} className="inline-flex items-center gap-1 rounded bg-blue-500 px-2 py-0.5 text-[11px] text-white hover:bg-blue-600 transition-colors">
              <Check size={11} /> 저장
            </button>
          </div>
        </div>
      </div>
    );
  }

  const cat = MEMO_CATEGORIES.find((c) => c.key === (item.category || 'memo'));

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-2 text-sm">
      {/* 헤더: 작성자 + 시간 + 편집/삭제 */}
      <div className="mb-1 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {item.author && (
            <span className="text-[11px] font-semibold text-slate-700">{item.author}</span>
          )}
          {item.toName && (
            <span className="text-[10px] text-purple-500 font-medium">→ {item.toName}</span>
          )}
          <span className="text-[10px] text-slate-400">{timeAgo(item.created_at)}</span>
        </div>
        <div className="flex items-center gap-0.5">
          <button onClick={startEdit} className="rounded p-0.5 text-slate-300 hover:bg-blue-50 hover:text-blue-500 transition-colors" title="편집">
            <Pencil size={12} />
          </button>
          <button onClick={() => onDelete(item.id)} className="rounded p-0.5 text-slate-300 hover:bg-red-50 hover:text-red-500 transition-colors" title="삭제">
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {/* 분류 + 하위분류 뱃지 */}
      <div className="mb-1 flex items-center gap-1 flex-wrap">
        {cat && (
          <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${cat.color}`}>
            {cat.label}
          </span>
        )}
        {item.subCategory && (
          <span className="inline-block rounded-md bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-600 border border-blue-200">
            {item.subCategory}
          </span>
        )}
        {/* 대상 뱃지 */}
        {item.target && (
          <button
            onClick={() => scrollToTarget(item.target!.selector)}
            className="inline-flex items-center gap-0.5 rounded-full bg-blue-50 px-1.5 py-0.5 text-[10px] text-blue-600 hover:bg-blue-100 transition-colors"
          >
            <Crosshair size={10} />
            <span className="max-w-[150px] truncate">{item.target.label}</span>
          </button>
        )}
      </div>

      {/* 텍스트 */}
      {item.text && (
        <p className="whitespace-pre-wrap text-xs text-slate-700 leading-relaxed">{item.text}</p>
      )}

      {/* 첨부파일 */}
      {item.attachments.length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-1">
          {item.attachments.map((att, i) => (
            <a key={i} href={att.s3_url} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded bg-slate-50 px-1.5 py-0.5 text-[10px] text-slate-600 hover:bg-slate-100 transition-colors">
              <Paperclip size={10} />
              <span className="max-w-[120px] truncate">{att.original_name}</span>
              <ExternalLink size={9} />
            </a>
          ))}
        </div>
      )}

      {/* 댓글 토글 버튼 */}
      <div className="mt-1.5 border-t border-slate-100 pt-1">
        <button
          onClick={() => setShowReplies(!showReplies)}
          className="inline-flex items-center gap-1 text-[10px] text-slate-400 hover:text-slate-600 transition-colors"
        >
          <MessageCircle size={11} />
          댓글 {replies.length > 0 && `(${replies.length})`}
          {showReplies ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
        </button>
      </div>

      {/* 댓글 쓰레드 */}
      {showReplies && (
        <div className="mt-1 ml-2 border-l-2 border-slate-100 pl-2 space-y-1">
          {/* 기존 댓글 */}
          {replies.map((reply) => (
            <div key={reply.id} className="group flex items-start gap-1">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-semibold text-slate-600">{reply.author || '익명'}</span>
                  <span className="text-[9px] text-slate-400">{timeAgo(reply.created_at)}</span>
                  <button
                    onClick={() => handleDeleteReply(reply.id)}
                    className="opacity-0 group-hover:opacity-100 rounded p-0.5 text-slate-300 hover:text-red-500 transition-all"
                  >
                    <X size={10} />
                  </button>
                </div>
                <p className="text-[11px] text-slate-600 whitespace-pre-wrap">{reply.text}</p>
              </div>
            </div>
          ))}

          {/* 댓글 입력 */}
          <div className="flex flex-col gap-1 pt-0.5">
            <div className="flex items-center gap-0.5 flex-wrap">
              {MEMO_EMPLOYEES.map((emp) => (
                <button key={emp.id} onClick={() => setReplyAuthor(emp.name)}
                  className={`rounded px-1 py-px text-[9px] font-medium transition-all ${
                    replyAuthor === emp.name ? 'bg-slate-600 text-white' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                  }`}>{emp.name}</button>
              ))}
            </div>
            <div className="flex items-center gap-1">
              <input
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddReply(); } }}
                placeholder="댓글..."
                className="flex-1 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[11px] text-slate-700 placeholder:text-slate-300 focus:border-blue-400 focus:outline-none"
              />
              <button onClick={handleAddReply} disabled={!replyText.trim()}
                className="rounded bg-blue-500 p-1 text-white hover:bg-blue-600 transition-colors disabled:opacity-40">
                <Send size={10} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
