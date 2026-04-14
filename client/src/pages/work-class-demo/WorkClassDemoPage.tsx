import { useState } from 'react';
import { Database, Beaker } from 'lucide-react';
import SandboxTab from './tabs/SandboxTab';
import EditTab from './tabs/EditTab';

type RootTab = 'sandbox' | 'edit';

const ROOT_TABS: { code: RootTab; label: string; icon: any; desc: string }[] = [
  { code: 'sandbox', label: '분류 모듈 체험', icon: Beaker,   desc: '샘플 데이터로 4안(기존/A/B/C) 비교' },
  { code: 'edit',    label: '분류 모듈 편집', icon: Database, desc: '최종 DB · API · 모듈화 중앙집합체' },
];

export default function WorkClassDemoPage() {
  const [tab, setTab] = useState<RootTab>('edit');

  return (
    <div className="p-2 space-y-2 text-slate-800 dark:text-slate-100">
      {/* 헤더 */}
      <div className="flex items-center justify-between flex-wrap gap-1">
        <div className="flex items-center gap-1.5">
          <Database className="h-4 w-4 text-emerald-600" />
          <h1 className="text-sm font-bold">업무 분류(최종DB)</h1>
          <span className="text-[10px] text-slate-500">— 모든 회사 분류의 Single Source of Truth</span>
        </div>
        <div className="text-[10px] text-slate-500">260414 T9 · scope·gov·만다라트</div>
      </div>

      {/* 루트 2탭 */}
      <div className="flex flex-wrap gap-1 border-b border-slate-200 dark:border-slate-700 pb-1">
        {ROOT_TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.code;
          return (
            <button
              key={t.code}
              onClick={() => setTab(t.code)}
              className={[
                'inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-md border',
                active
                  ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-600',
              ].join(' ')}
              title={t.desc}
            >
              <Icon className="h-3.5 w-3.5" />
              {t.label}
              <span className="text-[9px] text-slate-400 ml-1">{t.desc}</span>
            </button>
          );
        })}
      </div>

      {/* 탭 본체 */}
      <div>
        {tab === 'sandbox' && <SandboxTab />}
        {tab === 'edit'    && <EditTab />}
      </div>
    </div>
  );
}
