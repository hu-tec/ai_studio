import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface Props {
  title: string;
  subtitle?: React.ReactNode;
  tone?: 'default' | 'warn' | 'success' | 'info';
  collapsible?: boolean;
  defaultOpen?: boolean;
  right?: React.ReactNode;
  children: React.ReactNode;
}

const TONE: Record<NonNullable<Props['tone']>, string> = {
  default: 'border-slate-300 dark:border-slate-600',
  warn:    'border-amber-400 dark:border-amber-500',
  success: 'border-emerald-400 dark:border-emerald-500',
  info:    'border-sky-400 dark:border-sky-500',
};

export function SectionCard({ title, subtitle, tone = 'default', collapsible, defaultOpen = true, right, children }: Props) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`rounded border ${TONE[tone]} bg-white dark:bg-slate-900`}>
      <div
        className={`flex items-center justify-between px-2 py-1 border-b ${TONE[tone]} ${collapsible ? 'cursor-pointer' : ''}`}
        onClick={() => collapsible && setOpen(!open)}
      >
        <div className="flex items-center gap-1">
          {collapsible && (open ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />)}
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-100">{title}</span>
          {subtitle && <span className="text-[10px] text-slate-500 dark:text-slate-400">· {subtitle}</span>}
        </div>
        {right}
      </div>
      {open && <div className="p-2">{children}</div>}
    </div>
  );
}
