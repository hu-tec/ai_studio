import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
}

const mdComponents = {
  table: (props: any) => <table style={{ width:'100%', borderCollapse:'collapse', fontSize:11, margin:'4px 0' }} {...props} />,
  thead: (props: any) => <thead style={{ background:'#f8fafc' }} {...props} />,
  th: (props: any) => <th style={{ border:'1px solid #e2e8f0', padding:'3px 8px', fontWeight:600, textAlign:'left', whiteSpace:'nowrap' }} {...props} />,
  td: (props: any) => <td style={{ border:'1px solid #e2e8f0', padding:'2px 8px' }} {...props} />,
  tr: (props: any) => <tr style={{ borderBottom:'1px solid #e2e8f0' }} {...props} />,
  ul: (props: any) => <ul style={{ margin:'2px 0', paddingLeft:16 }} {...props} />,
  ol: (props: any) => <ol style={{ margin:'2px 0', paddingLeft:16 }} {...props} />,
  li: (props: any) => <li style={{ margin:0 }} {...props} />,
  p: (props: any) => <p style={{ margin:'2px 0' }} {...props} />,
  h1: (props: any) => <h1 style={{ fontSize:14, fontWeight:700, margin:'4px 0' }} {...props} />,
  h2: (props: any) => <h2 style={{ fontSize:13, fontWeight:700, margin:'3px 0' }} {...props} />,
  h3: (props: any) => <h3 style={{ fontSize:12, fontWeight:600, margin:'2px 0' }} {...props} />,
  strong: (props: any) => <strong style={{ fontWeight:700 }} {...props} />,
  code: (props: any) => <code style={{ fontSize:11, background:'#f1f5f9', padding:'1px 4px', borderRadius:3 }} {...props} />,
  a: (props: any) => <a style={{ color:'#2563eb', textDecoration:'none' }} {...props} />,
};

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
          className="w-full px-2 py-1.5 pr-16 cursor-text"
          style={{ minHeight, fontSize: 12, lineHeight: 1.5 }}
        >
          {value ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>{value}</ReactMarkdown>
          ) : (
            <span style={{ color: '#94a3b8' }}>{placeholder}</span>
          )}
        </div>
      )}
    </div>
  );
}
