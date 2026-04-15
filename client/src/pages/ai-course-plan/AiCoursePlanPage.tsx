import { useState } from 'react';
import { PLANS, COMPARISON_ROWS, COMMON_AXES } from './data';
import type { CoursePlanId, HoursMode, TabKey } from './types';

const PLAN_COLOR: Record<CoursePlanId, { bg: string; border: string; text: string; accent: string; ring: string }> = {
  A: { bg: 'bg-blue-50',   border: 'border-blue-300',   text: 'text-blue-900',   accent: 'bg-blue-500',   ring: 'ring-blue-400' },
  B: { bg: 'bg-orange-50', border: 'border-orange-300', text: 'text-orange-900', accent: 'bg-orange-500', ring: 'ring-orange-400' },
  C: { bg: 'bg-purple-50', border: 'border-purple-300', text: 'text-purple-900', accent: 'bg-purple-500', ring: 'ring-purple-400' },
};

export default function AiCoursePlanPage() {
  const [hours, setHours] = useState<HoursMode>('40h');
  const [tab, setTab] = useState<TabKey>('A');

  const currentPlan = tab !== 'compare' ? PLANS.find(p => p.id === tab) : null;
  const modules = currentPlan ? (hours === '40h' ? currentPlan.modules40h : currentPlan.modules10h) : [];

  return (
    <div className="p-2 space-y-2 text-xs">
      {/* Header */}
      <div className="flex items-baseline justify-between gap-2 border-b pb-1.5">
        <div>
          <h1 className="text-base font-bold">🎓 AI 강의안 — 기능 사용법 (T1)</h1>
          <p className="text-[11px] text-gray-500 leading-tight">
            5대 기능 (텍스트·이미지·음성·영상·통역) × 5대 도구 — 강의처 무관 공통 / 같은 콘텐츠의 3가지 페다고지 버전 (A/B/C) × 40h·10h
          </p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-[10px] text-gray-500 mr-1">시간</span>
          {(['40h', '10h'] as HoursMode[]).map(h => (
            <button
              key={h}
              onClick={() => setHours(h)}
              className={`px-2 py-0.5 rounded border text-[11px] font-semibold ${
                hours === h
                  ? 'bg-slate-800 text-white border-slate-800'
                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {h}
            </button>
          ))}
        </div>
      </div>

      {/* Plan tabs */}
      <div className="grid grid-cols-4 gap-1">
        {PLANS.map(p => {
          const c = PLAN_COLOR[p.id];
          const active = tab === p.id;
          return (
            <button
              key={p.id}
              onClick={() => setTab(p.id)}
              className={`px-2 py-1 rounded border text-left transition-colors ${
                active
                  ? `${c.bg} ${c.border} ${c.text} ring-2 ${c.ring}`
                  : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div className="flex items-baseline gap-1">
                <span className={`font-bold text-[10px] px-1 rounded text-white ${c.accent}`}>{p.id}안</span>
                <span className="font-semibold text-[11px] truncate">{p.name}</span>
              </div>
              <div className="text-[10px] opacity-70 mt-0.5 truncate">{p.axis}</div>
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
          <div className="font-bold text-[11px]">📊 비교</div>
          <div className="text-[10px] opacity-70 mt-0.5">A·B·C 한눈에</div>
        </button>
      </div>

      {/* Plan body */}
      {currentPlan && (
        <div className={`border rounded p-2 ${PLAN_COLOR[currentPlan.id].border} ${PLAN_COLOR[currentPlan.id].bg}`}>
          {/* Meta cards (4-col compact) */}
          <div className="grid grid-cols-4 gap-1.5 mb-2">
            <div className="bg-white rounded border p-1.5">
              <div className="text-[10px] text-gray-500 mb-0.5 font-semibold">대상</div>
              <ul className="space-y-0.5">
                {currentPlan.audience.map((a, i) => (
                  <li key={i} className="leading-tight text-[11px]">• {a}</li>
                ))}
              </ul>
            </div>
            <div className="bg-white rounded border p-1.5">
              <div className="text-[10px] text-gray-500 mb-0.5 font-semibold">컨셉</div>
              <p className="leading-tight text-[11px]">{currentPlan.concept}</p>
            </div>
            <div className="bg-white rounded border p-1.5">
              <div className="text-[10px] text-gray-500 mb-0.5 font-semibold">강점</div>
              <ul className="space-y-0.5">
                {currentPlan.strengths.map((s, i) => (
                  <li key={i} className="leading-tight text-[11px]">• {s}</li>
                ))}
              </ul>
            </div>
            <div className="bg-white rounded border p-1.5">
              <div className="text-[10px] text-gray-500 mb-0.5 font-semibold">규모</div>
              <div className="space-y-0.5 text-[11px] leading-tight">
                <div>총 시간: <b>{hours}</b></div>
                <div>모듈 수: <b>{modules.length}</b></div>
                <div>구조: <b>{currentPlan.axis}</b></div>
              </div>
            </div>
          </div>

          {/* Modules grid 4-col compact */}
          <div className="grid grid-cols-4 gap-1.5">
            {modules.map(m => {
              const c = PLAN_COLOR[currentPlan.id];
              return (
                <div
                  key={m.num}
                  className="bg-white rounded border p-1.5 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className={`text-[10px] font-bold px-1 rounded text-white ${c.accent}`}>
                      M{m.num}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {hours === '40h' ? `${Math.round(40 / modules.length * 10) / 10}h` : '2h'}
                    </span>
                  </div>
                  <div className="font-semibold text-[11px] leading-tight mb-0.5">{m.title}</div>
                  {m.subtitle && (
                    <div className="text-[10px] text-gray-600 leading-tight">{m.subtitle}</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Compare tab */}
      {tab === 'compare' && (
        <div className="border rounded p-2 bg-white">
          <table className="w-full border-collapse text-[11px]">
            <thead>
              <tr className="bg-slate-100">
                <th className="border p-1 text-left w-28">축</th>
                {PLANS.map(p => {
                  const c = PLAN_COLOR[p.id];
                  return (
                    <th key={p.id} className={`border p-1 text-left ${c.text}`}>
                      <span className={`px-1 rounded text-white ${c.accent} text-[10px] mr-1`}>{p.id}</span>
                      {p.name}
                      <div className="text-[10px] font-normal opacity-70">{p.axis}</div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {COMPARISON_ROWS.map(r => (
                <tr key={r.label}>
                  <td className="border p-1 font-semibold bg-slate-50">{r.label}</td>
                  <td className={`border p-1 ${r.highlight === 'A' ? 'bg-blue-50 font-semibold' : ''}`}>{r.A}</td>
                  <td className={`border p-1 ${r.highlight === 'B' ? 'bg-orange-50 font-semibold' : ''}`}>{r.B}</td>
                  <td className={`border p-1 ${r.highlight === 'C' ? 'bg-purple-50 font-semibold' : ''}`}>{r.C}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Common axes footer */}
      <div className="border rounded p-2 bg-slate-50">
        <div className="text-[10px] text-gray-500 mb-1 font-semibold">📐 공통 전제 (3안 모두 적용)</div>
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
