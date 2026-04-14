import React from 'react';

interface ChipBarProps<T extends string> {
  options: { code: T; label: string }[];
  value: T | null | undefined;
  onChange?: (code: T) => void;
  multi?: boolean;
  values?: T[];
  size?: 'xs' | 'sm';
  highlight?: boolean;
  disabled?: boolean;
}

// 싱글 = 네모(rounded-md), 멀티 = 원형(rounded-full)  [메모리 규정]
export function ChipBar<T extends string>({
  options, value, onChange, multi, values, size = 'xs', highlight, disabled,
}: ChipBarProps<T>) {
  const radius = multi ? 'rounded-full' : 'rounded-md';
  const pad = size === 'xs' ? 'px-2 py-0.5' : 'px-2.5 py-1';
  const font = size === 'xs' ? 'text-xs' : 'text-sm';
  return (
    <div className={`flex flex-wrap gap-1 ${highlight ? 'ring-1 ring-amber-400 ring-offset-1 rounded p-0.5' : ''}`}>
      {options.map((o) => {
        const active = multi ? values?.includes(o.code) : value === o.code;
        return (
          <button
            key={o.code}
            type="button"
            disabled={disabled}
            onClick={() => onChange?.(o.code)}
            className={[
              radius, pad, font,
              'border transition whitespace-nowrap',
              active
                ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900 dark:border-white'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-600 dark:hover:bg-slate-700',
              disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer',
            ].join(' ')}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
