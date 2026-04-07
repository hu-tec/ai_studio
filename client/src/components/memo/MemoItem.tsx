import { Trash2, Crosshair, Paperclip, ExternalLink } from 'lucide-react';
import type { MemoItemData } from './memoTypes';

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
  onDelete: (id: string) => void;
}

export function MemoItem({ item, onDelete }: Props) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 text-sm">
      {/* 헤더: 작성자 + 시간 + 삭제 */}
      <div className="mb-1.5 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {item.author && (
            <span className="text-xs font-medium text-slate-600">{item.author}</span>
          )}
          <span className="text-xs text-slate-400">{timeAgo(item.created_at)}</span>
        </div>
        <button
          onClick={() => onDelete(item.id)}
          className="rounded p-0.5 text-slate-300 hover:bg-red-50 hover:text-red-500 transition-colors"
        >
          <Trash2 size={13} />
        </button>
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
