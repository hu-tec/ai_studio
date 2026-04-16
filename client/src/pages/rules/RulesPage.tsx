import { useState } from 'react';
import { Eye, Wrench, Target } from 'lucide-react';
import { RulesProvider } from '../rules-mgmt/RulesContext';
import { OperatorTab } from './tabs/OperatorTab';
import { ManagerTab } from './tabs/ManagerTab';
import { ExecutiveTab } from './tabs/ExecutiveTab';

type RoleTab = 'operator' | 'manager' | 'executive';

const TAB_META: Record<RoleTab, { label: string; sub: string; color: string; bg: string; border: string; Icon: typeof Eye }> = {
  operator:  { label: '사용자',   sub: '매시간 참조·적용',   color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', Icon: Eye },
  manager:   { label: '관리자',   sub: '상태 확인·수정',     color: '#d97706', bg: '#fffbeb', border: '#fde68a', Icon: Wrench },
  executive: { label: '총괄자',   sub: '유기적 관계·방향',   color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe', Icon: Target },
};

function RulesLayout() {
  const [tab, setTab] = useState<RoleTab>('operator');
  const m = TAB_META[tab];

  return (
    <div className="flex flex-col gap-1.5 p-1.5">
      {/* 헤더 배너 */}
      <div
        className="rounded border-l-4 px-2 py-1 flex items-center gap-2"
        style={{ borderLeftColor: m.color, background: m.bg }}
      >
        <span className="rounded px-1.5 py-0.5 text-[10px] font-bold text-white" style={{ background: m.color }}>
          D0 · 규정(통합)
        </span>
        <span className="text-[11px] font-bold" style={{ color: m.color }}>
          {m.label} · {m.sub}
        </span>
        <span className="ml-auto text-[9px] text-gray-500">
          기존 D1~D3 규정 페이지는 그대로 유지 — 여기는 관점별 통합 뷰
        </span>
      </div>

      {/* 3인 탭 (최상단) */}
      <div className="flex items-center gap-1">
        {(Object.keys(TAB_META) as RoleTab[]).map((k) => {
          const mt = TAB_META[k];
          const active = tab === k;
          const Icon = mt.Icon;
          return (
            <button
              key={k}
              onClick={() => setTab(k)}
              className="rounded-md border px-2 py-1 text-[11px] font-semibold transition-colors flex items-center gap-1"
              style={
                active
                  ? { background: mt.color, color: '#fff', borderColor: mt.color }
                  : { background: '#fff', color: '#475569', borderColor: mt.border }
              }
            >
              <Icon size={12} />
              {mt.label}
              <span
                className="ml-0.5 rounded px-1 text-[9px] font-bold"
                style={
                  active
                    ? { background: 'rgba(255,255,255,0.25)', color: '#fff' }
                    : { background: mt.bg, color: mt.color }
                }
              >
                {mt.sub}
              </span>
            </button>
          );
        })}
      </div>

      {/* 본문 */}
      {tab === 'operator' && <OperatorTab />}
      {tab === 'manager' && <ManagerTab />}
      {tab === 'executive' && <ExecutiveTab />}
    </div>
  );
}

export default function RulesPage() {
  return (
    <RulesProvider>
      <RulesLayout />
    </RulesProvider>
  );
}
