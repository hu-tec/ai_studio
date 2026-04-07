import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
}

export function MarkdownField({ value, onChange, placeholder = '', minHeight = 60 }: MarkdownFieldProps) {
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (mode === 'edit' && textareaRef.current) {
      textareaRef.current.focus();
      const t = textareaRef.current;
      t.style.height = 'auto';
      t.style.height = Math.max(minHeight, t.scrollHeight) + 'px';
    }
  }, [mode, minHeight]);

  return (
    <div className="relative group">
      {/* 모드 토글 */}
      <div className="absolute top-0.5 right-0.5 flex gap-0.5 z-10 opacity-60 group-hover:opacity-100 transition-opacity">
        <button onClick={() => setMode('edit')}
          className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${mode === 'edit' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
          편집
        </button>
        <button onClick={() => setMode('view')}
          className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${mode === 'view' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
          보기
        </button>
      </div>

      {mode === 'edit' ? (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={e => {
            onChange(e.target.value);
            const t = e.target;
            t.style.height = 'auto';
            t.style.height = Math.max(minHeight, t.scrollHeight) + 'px';
          }}
          placeholder={placeholder}
          className="w-full px-2 py-1.5 pr-16 bg-transparent outline-none resize-none text-[12px] font-mono"
          style={{ minHeight }}
        />
      ) : (
        <div
          onClick={() => setMode('edit')}
          className="w-full px-2 py-1.5 pr-16 cursor-text text-[12px] prose prose-sm max-w-none
            prose-headings:text-[13px] prose-headings:font-bold prose-headings:my-1
            prose-p:my-0.5 prose-ul:my-0.5 prose-ol:my-0.5 prose-li:my-0
            prose-code:text-[11px] prose-code:bg-slate-100 prose-code:px-1 prose-code:rounded
            prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
            prose-table:text-[11px] prose-th:px-2 prose-th:py-0.5 prose-td:px-2 prose-td:py-0.5
            prose-th:border prose-td:border prose-th:bg-slate-50
            [&_input[type=checkbox]]:mr-1"
          style={{ minHeight }}
        >
          {value ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
          ) : (
            <span className="text-muted-foreground/40">{placeholder}</span>
          )}
        </div>
      )}
    </div>
  );
}
