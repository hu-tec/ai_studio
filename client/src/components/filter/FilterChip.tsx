import type { ReactNode } from 'react';

export type ChipVariant = 'multi' | 'single';
export type ChipTone = 'neutral' | 'accent' | 'regulation' | 'semi' | 'optional' | 'dashed';

interface Props {
  children: ReactNode;
  selected?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
  variant?: ChipVariant;
  tone?: ChipTone;
  title?: string;
}

const TONE = {
  neutral: {
    on:  'border-blue-400 bg-blue-50 text-blue-600',
    off: 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50',
  },
  accent: {
    on:  'border-slate-900 bg-slate-900 text-white',
    off: 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50',
  },
  regulation: {
    on:  'border-rose-500 bg-rose-500 text-white',
    off: 'border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100',
  },
  semi: {
    on:  'border-amber-500 bg-amber-500 text-white',
    off: 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100',
  },
  optional: {
    on:  'border-emerald-500 bg-emerald-500 text-white',
    off: 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
  },
  dashed: {
    on:  'border-slate-300 border-dashed bg-white text-slate-500',
    off: 'border-slate-300 border-dashed bg-white text-slate-400 hover:bg-slate-50',
  },
} as const;

export function FilterChip({
  children,
  selected = false,
  onClick,
  onRemove,
  variant = 'multi',
  tone = 'neutral',
  title,
}: Props) {
  const shape = variant === 'multi' ? 'rounded-full' : 'rounded-md';
  const state = selected ? TONE[tone].on : TONE[tone].off;
  const weight = selected ? 'font-semibold' : 'font-normal';

  return (
    <span className="inline-flex items-center gap-0.5">
      <button
        type="button"
        onClick={onClick}
        title={title}
        className={`text-h4 px-2 py-0.5 border transition-colors cursor-pointer ${shape} ${state} ${weight}`}
      >
        {children}
      </button>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          title="삭제"
          className="text-meta text-rose-500 hover:text-rose-700 px-0.5"
        >
          ✕
        </button>
      )}
    </span>
  );
}
