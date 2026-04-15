import { useState } from 'react';
import { PLAN_10H, PLAN_40H, PLAN_META, VERSION_META, COMMON_AXES } from './data';
import type { CoursePlanId, HoursMode, TabKey } from './types';

const PLAN_COLOR: Record<CoursePlanId, { bg: string; border: string; text: string; accent: string; ring: string }> = {
  A: { bg: 'bg-blue-50',   border: 'border-blue-300',   text: 'text-blue-900',   accent: 'bg-blue-500',   ring: 'ring-blue-400' },
  B: { bg: 'bg-orange-50', border: 'border-orange-300', text: 'text-orange-900', accent: 'bg-orange-500', ring: 'ring-orange-400' },
  C: { bg: 'bg-purple-50', border: 'border-purple-300', text: 'text-purple-900', accent: 'bg-purple-500', ring: 'ring-purple-400' },
};

const VERSION_IDS: CoursePlanId[] = ['A', 'B', 'C'];

export default function AiCoursePlanPage() {
  const [hours, setHours] = useState<HoursMode>('10h');
  const [tab, setTab] = useState<TabKey>('A');

  const sections = hours === '10h' ? PLAN_10H : PLAN_40H;
  const meta = PLAN_META[hours];

  return (
    <div className="p-2 space-y-2 text-xs">
      {/* Header */}
      <div className="flex items-baseline justify-between gap-2 border-b pb-1.5">
        <div>
          <h1 className="text-base font-bold">🎓 AI 강의안 (T1) — 교사 교육 / 기능 교육</h1>
          <p className="text-[11px] text-gray-500 leading-tight">
            만다라트 8 AI 기능 · 같은 목차 + 각 섹션 채움이 다른 3 버전 (A/B/C) · 기초(10h)와 심화(40h)는 별개 강의
          </p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-[10px] text-gray-500 mr-1">강의</span>
          {(['10h', '40h'] as HoursMode[]).map(h => {
            const m = PLAN_META[h];
            return (
              <button
                key={h}
                onClick={() => setHours(h)}
                className={`px-2 py-0.5 rounded border text-[11px] font-semibold ${
                  hours === h
                    ? 'bg-slate-800 text-white border-slate-800'
                    : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
                title={m.duration}
              >
                {m.label} {h}
              </button>
            );
          })}
        </div>
      </div>

      {/* Outline header (showing the SAME section list across all versions) */}
      <div className="border rounded p-1.5 bg-slate-50">
        <div className="flex items-center gap-1 flex-wrap">
          <span className="text-[10px] font-bold text-slate-600 mr-1">📋 목차 (3 버전 공통):</span>
          {sections.map(s => (
            <span key={s.num} className="px-1.5 py-0.5 bg-white border border-slate-300 rounded text-[10px] leading-tight">
              <b>{meta.unitLabel}{s.num}</b> {s.title.split(' — ')[0]}
            </span>
          ))}
          <span className="ml-auto text-[10px] text-gray-500">{meta.duration} · {sections.length}개 섹션</span>
        </div>
      </div>

      {/* Version tabs */}
      <div className="grid grid-cols-4 gap-1">
        {VERSION_IDS.map(v => {
          const c = PLAN_COLOR[v];
          const active = tab === v;
          const vm = VERSION_META[v];
          return (
            <button
              key={v}
              onClick={() => setTab(v)}
              className={`px-2 py-1 rounded border text-left transition-colors ${
                active
                  ? `${c.bg} ${c.border} ${c.text} ring-2 ${c.ring}`
                  : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div className="flex items-baseline gap-1">
                <span className={`font-bold text-[10px] px-1 rounded text-white ${c.accent}`}>버전 {v}</span>
                <span className="font-semibold text-[11px]">{vm.name}</span>
              </div>
              <div className="text-[10px] opacity-70 mt-0.5 leading-tight">{vm.framing}</div>
            </button>
          );
        })}
        <button
          onClick={() => setTab('compare')}
          className={`px-2 py-1 rounded border text-left transition-colors ${
            tab === 'compare'
              ? 'bg-slate-800 text-white border-slate-800 ring-2 ring-slate-400'
              : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
          }`}
        >
          <div className="font-bold text-[11px]">📊 3 버전 비교</div>
          <div className="text-[10px] opacity-70 mt-0.5 leading-tight">섹션별 A·B·C 나란히</div>
        </button>
      </div>

      {/* Single-version body */}
      {tab !== 'compare' && (
        <div className={`border rounded p-2 ${PLAN_COLOR[tab].bg} ${PLAN_COLOR[tab].border}`}>
          <div className="grid grid-cols-2 gap-2">
            {sections.map(s => {
              const c = PLAN_COLOR[tab];
              const items = s[tab];
              return (
                <div key={s.num} className="bg-white rounded border p-2">
                  <div className="flex items-center gap-1 mb-1">
                    <span className={`text-[10px] font-bold px-1 rounded text-white ${c.accent}`}>
                      {meta.unitLabel}{s.num}
                    </span>
                    <span className="font-bold text-[12px] leading-tight">{s.title}</span>
                  </div>
                  <p className="text-[10px] text-gray-600 leading-tight mb-1.5 italic">{s.description}</p>
                  <ul className="space-y-0.5">
                    {items.map((it, i) => (
                      <li key={i} className="text-[11px] leading-snug text-gray-800">
                        <span className="text-gray-400">{i + 1}.</span> {it}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Compare body */}
      {tab === 'compare' && (
        <div className="space-y-1.5">
          {sections.map(s => (
            <div key={s.num} className="border rounded p-1.5 bg-white">
              <div className="mb-1 border-b pb-1">
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-bold px-1 rounded bg-slate-700 text-white">
                    {meta.unitLabel}{s.num}
                  </span>
                  <span className="font-bold text-[12px]">{s.title}</span>
                </div>
                <p className="text-[10px] text-gray-600 leading-tight italic mt-0.5">{s.description}</p>
              </div>
              <div className="grid grid-cols-3 gap-1">
                {VERSION_IDS.map(v => {
                  const c = PLAN_COLOR[v];
                  const vm = VERSION_META[v];
                  return (
                    <div key={v} className={`rounded border p-1.5 ${c.bg} ${c.border}`}>
                      <div className="flex items-baseline gap-1 mb-1">
                        <span className={`text-[10px] font-bold px-1 rounded text-white ${c.accent}`}>버전 {v}</span>
                        <span className={`text-[10px] font-semibold ${c.text}`}>{vm.name}</span>
                      </div>
                      <ul className="space-y-0.5">
                        {s[v].map((it, i) => (
                          <li key={i} className="text-[10px] leading-snug text-gray-800">
                            <span className="text-gray-400">{i + 1}.</span> {it}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Common axes footer */}
      <div className="border rounded p-2 bg-slate-50">
        <div className="text-[10px] text-gray-500 mb-1 font-semibold">📐 공통 전제 (3 버전 모두 적용)</div>
        <div className="grid grid-cols-4 gap-1.5">
          {COMMON_AXES.map(axis => (
            <div key={axis.group} className="bg-white border rounded p-1.5">
              <div className="text-[10px] font-semibold text-slate-700 mb-1">{axis.group}</div>
              <div className="flex flex-wrap gap-0.5">
                {axis.items.map(item => (
                  <span
                    key={item}
                    className="px-1 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px] leading-tight"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
