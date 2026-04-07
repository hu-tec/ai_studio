import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
}

export function MarkdownField({ value, onChange, placeholder = '', minHeight = 60 }: MarkdownFieldProps) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <textarea
        autoFocus
        value={value}
        onChange={e => onChange(e.target.value)}
        onBlur={() => setEditing(false)}
        placeholder={placeholder}
        className="w-full px-2 py-1.5 bg-transparent outline-none resize-none text-[12px] border border-blue-200 rounded"
        style={{ minHeight }}
        onInput={e => {
          const t = e.target as HTMLTextAreaElement;
          t.style.height = 'auto';
          t.style.height = Math.max(minHeight, t.scrollHeight) + 'px';
        }}
      />
    );
  }

  return (
    <div
      onClick={() => setEditing(true)}
      className="w-full px-2 py-1.5 cursor-text text-[12px] prose prose-sm max-w-none
        prose-headings:text-[13px] prose-headings:font-bold prose-headings:my-1
        prose-p:my-0.5 prose-ul:my-0.5 prose-ol:my-0.5 prose-li:my-0
        prose-code:text-[11px] prose-code:bg-slate-100 prose-code:px-1 prose-code:rounded
        prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
        [&_input[type=checkbox]]:mr-1"
      style={{ minHeight }}
    >
      {value ? (
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
      ) : (
        <span className="text-muted-foreground/40">{placeholder}</span>
      )}
    </div>
  );
}
