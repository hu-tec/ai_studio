import type { ReactNode } from 'react';

interface Props {
  label: string;
  children: ReactNode;
}

// 필터 그리드 셀: 라벨(상단) + 칩 wrap(하단). 4단 그리드 아이템으로 사용.
export function FilterCell({ label, children }: Props) {
  return (
    <div className="flex flex-col gap-1 border border-slate-100 bg-slate-50/60 rounded-md px-1.5 py-1">
      <span className="text-h4 font-bold text-slate-600">{label}</span>
      <div className="flex flex-wrap gap-1">{children}</div>
    </div>
  );
}
