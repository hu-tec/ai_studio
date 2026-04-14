import type { TaxonomyScope, TaxonomyGov } from '../taxonomyTypes';

const LENSES: { code: TaxonomyScope; label: string; color: string }[] = [
  { code: 'ai-studio',   label: 'AI Studio (사내)',    color: 'emerald' },
  { code: 'work-studio', label: 'Work Studio (홈페이지)', color: 'sky' },
  { code: 'homepage',    label: '홈페이지',             color: 'indigo' },
  { code: 'common',      label: '공통',                color: 'slate' },
];

const GOVS: { code: TaxonomyGov; label: string; color: string }[] = [
  { code: 'company-rule', label: '사내규정',   color: 'red' },
  { code: 'work-guide',   label: '업무지침',   color: 'amber' },
  { code: 'homepage',     label: '홈페이지분류', color: 'indigo' },
  { code: 'common',       label: '공통',       color: 'slate' },
];

function baseBtn(active: boolean, color: string) {
  const map: Record<string, string> = {
    emerald: 'bg-emerald-600 border-emerald-600 text-white',
    sky:     'bg-sky-600 border-sky-600 text-white',
    indigo:  'bg-indigo-600 border-indigo-600 text-white',
    slate:   'bg-slate-800 border-slate-800 text-white',
    red:     'bg-red-600 border-red-600 text-white',
    amber:   'bg-amber-600 border-amber-600 text-white',
  };
  return [
    'text-[10px] px-2 py-0.5 rounded-md border whitespace-nowrap transition',
    active
      ? map[color] || 'bg-slate-900 border-slate-900 text-white'
      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-600',
  ].join(' ');
}

export function LensSwitch({ value, onChange }: { value: TaxonomyScope; onChange: (v: TaxonomyScope) => void }) {
  return (
    <div className="flex flex-wrap items-center gap-1">
      <span className="text-[10px] font-semibold text-slate-500 mr-1">Scope</span>
      {LENSES.map((l) => (
        <button key={l.code} onClick={() => onChange(l.code)} className={baseBtn(value === l.code, l.color)}>
          {l.label}
        </button>
      ))}
    </div>
  );
}

export function GovSwitch({
  value, onChange, allowed,
}: {
  value: TaxonomyGov;
  onChange: (v: TaxonomyGov) => void;
  allowed?: TaxonomyGov[];
}) {
  const list = allowed ? GOVS.filter((g) => allowed.includes(g.code)) : GOVS;
  return (
    <div className="flex flex-wrap items-center gap-1">
      <span className="text-[10px] font-semibold text-slate-500 mr-1">Governance</span>
      {list.map((g) => (
        <button key={g.code} onClick={() => onChange(g.code)} className={baseBtn(value === g.code, g.color)}>
          {g.label}
        </button>
      ))}
    </div>
  );
}
