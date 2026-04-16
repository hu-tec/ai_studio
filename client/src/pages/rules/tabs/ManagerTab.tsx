import { useMemo, useState } from 'react';
import { NavLink } from 'react-router';
import { Edit3, Users, FolderTree, Clock, ExternalLink } from 'lucide-react';
import { useRules, ALL_TEAMS } from '../../rules-mgmt/RulesContext';
import type { RuleSet, RuleType } from '../../rules-mgmt/RulesContext';

type Bucket = 'company' | 'departments' | 'ranks' | 'services';

const BUCKET_META: Record<Bucket, { label: string; emoji: string; color: string }> = {
  company:     { label: '회사 전체', emoji: '🏛️', color: '#4f46e5' },
  departments: { label: '부서별',    emoji: '🏢', color: '#059669' },
  ranks:       { label: '직급별',    emoji: '🎖️', color: '#dc2626' },
  services:    { label: '서비스별',  emoji: '🌐', color: '#7c3aed' },
};

function countRuleSet(rs: RuleSet): { 규정: number; 준규정: number; 선택사항: number; total: number } {
  const 규정 = rs.규정.length;
  const 준규정 = rs.준규정.length;
  const 선택사항 = rs.선택사항.length;
  return { 규정, 준규정, 선택사항, total: 규정 + 준규정 + 선택사항 };
}

export function ManagerTab() {
  const { state, editMode, toggleEditMode } = useRules();
  const [bucket, setBucket] = useState<Bucket>('company');
  const [group, setGroup] = useState<string | null>(null);
  const [teamFilter, setTeamFilter] = useState<Set<string>>(new Set());

  // 탭 바뀌면 그룹 초기화
  const groupNames = useMemo(() => {
    if (bucket === 'company') return [] as string[];
    return Object.keys(state[bucket]);
  }, [bucket, state]);

  const activeRuleSet: RuleSet | null = useMemo(() => {
    if (bucket === 'company') return state.company;
    if (!group) return null;
    return (state[bucket] as Record<string, RuleSet>)[group] ?? null;
  }, [bucket, group, state]);

  // 전체 집계
  const totals = useMemo(() => {
    const c = countRuleSet(state.company);
    const agg = (rec: Record<string, RuleSet>) => Object.values(rec).reduce(
      (s, rs) => {
        const x = countRuleSet(rs);
        return { 규정: s.규정 + x.규정, 준규정: s.준규정 + x.준규정, 선택사항: s.선택사항 + x.선택사항, total: s.total + x.total };
      }, { 규정: 0, 준규정: 0, 선택사항: 0, total: 0 }
    );
    return {
      company: c,
      departments: agg(state.departments),
      ranks: agg(state.ranks),
      services: agg(state.services),
    };
  }, [state]);

  const grandTotal = totals.company.total + totals.departments.total + totals.ranks.total + totals.services.total;

  const filterByTeam = (items: RuleSet[RuleType]) => {
    if (teamFilter.size === 0) return items;
    return items.filter((it) => it.teams.some((t) => teamFilter.has(t)));
  };

  const toggleTeam = (t: string) => {
    setTeamFilter((prev) => {
      const n = new Set(prev);
      n.has(t) ? n.delete(t) : n.add(t);
      return n;
    });
  };

  return (
    <div className="flex flex-col gap-1.5">
      {/* 툴바 */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={toggleEditMode}
          className="rounded-md px-2 py-0.5 text-[10px] font-bold text-white transition-colors"
          style={{ background: editMode ? '#e53935' : '#333' }}
        >
          {editMode ? '✏️ 편집 ON' : '🔒 읽기'}
        </button>
        <NavLink
          to="/rules-mgmt"
          className="flex items-center gap-1 rounded-md border border-gray-300 bg-white px-2 py-0.5 text-[10px] font-semibold text-gray-600 hover:bg-gray-50"
        >
          <ExternalLink size={10} /> rules-mgmt (D1) 에서 편집
        </NavLink>
        <NavLink
          to="/rules-editor"
          className="flex items-center gap-1 rounded-md border border-gray-300 bg-white px-2 py-0.5 text-[10px] font-semibold text-gray-600 hover:bg-gray-50"
        >
          <ExternalLink size={10} /> rules-editor (D1-1)
        </NavLink>
        <NavLink
          to="/eval-criteria"
          className="flex items-center gap-1 rounded-md border border-gray-300 bg-white px-2 py-0.5 text-[10px] font-semibold text-gray-600 hover:bg-gray-50"
        >
          <ExternalLink size={10} /> eval-criteria (D2)
        </NavLink>
        <span className="ml-auto text-[10px] text-gray-500">총 <b>{grandTotal}</b>건 규정/준규정/선택</span>
      </div>

      {/* 세로 1단: 가로 4열 요약 */}
      <div className="grid grid-cols-4 gap-1.5">
        {(Object.keys(BUCKET_META) as Bucket[]).map((b) => {
          const m = BUCKET_META[b];
          const t = totals[b];
          const groupsCnt = b === 'company' ? 1 : Object.keys(state[b]).length;
          return (
            <button
              key={b}
              onClick={() => { setBucket(b); setGroup(null); }}
              className="rounded border bg-white text-left p-1.5 transition-colors hover:bg-gray-50"
              style={{ borderColor: bucket === b ? m.color : '#e5e7eb' }}
            >
              <div className="flex items-center gap-1">
                <span>{m.emoji}</span>
                <span className="text-[11px] font-bold" style={{ color: m.color }}>{m.label}</span>
                <span className="ml-auto text-[9px] text-gray-400">{groupsCnt}개 그룹</span>
              </div>
              <div className="mt-1 grid grid-cols-3 gap-0.5 text-[10px]">
                <div className="rounded bg-red-50 px-1 py-0.5 text-red-700"><b>규정</b> {t.규정}</div>
                <div className="rounded bg-amber-50 px-1 py-0.5 text-amber-700"><b>준</b> {t.준규정}</div>
                <div className="rounded bg-sky-50 px-1 py-0.5 text-sky-700"><b>선택</b> {t.선택사항}</div>
              </div>
              <div className="mt-0.5 text-[9px] text-gray-500">소계 <b>{t.total}</b></div>
            </button>
          );
        })}
      </div>

      {/* 세로 2단: 4열 편집 그리드 (카테고리 트리 | 고정 | 준고정 | 선택) */}
      <div className="grid grid-cols-4 gap-1.5 min-h-[220px]">
        {/* 1열: 카테고리 트리 */}
        <div className="rounded border border-gray-200 bg-white overflow-hidden">
          <div className="bg-gray-50 border-b border-gray-200 px-1.5 py-0.5 flex items-center gap-1">
            <FolderTree size={11} className="text-gray-500" />
            <span className="text-[10px] font-bold text-gray-700">{BUCKET_META[bucket].label}</span>
          </div>
          <div className="p-1 space-y-0.5 max-h-[320px] overflow-y-auto">
            {bucket === 'company' ? (
              <button
                onClick={() => setGroup(null)}
                className="w-full rounded px-1.5 py-0.5 text-left text-[10px] font-semibold bg-indigo-50 text-indigo-700"
              >
                회사 전체 (단일)
              </button>
            ) : (
              groupNames.map((g) => (
                <button
                  key={g}
                  onClick={() => setGroup(g)}
                  className="w-full rounded px-1.5 py-0.5 text-left text-[10px] transition-colors"
                  style={
                    group === g
                      ? { background: BUCKET_META[bucket].color, color: '#fff' }
                      : { background: '#f9fafb', color: '#374151' }
                  }
                >
                  {g}
                </button>
              ))
            )}
            {bucket !== 'company' && groupNames.length === 0 && (
              <div className="text-[10px] text-gray-400 py-1 text-center">그룹 없음</div>
            )}
          </div>
        </div>

        {/* 2~4열: 규정 · 준규정 · 선택 */}
        {(['규정', '준규정', '선택사항'] as RuleType[]).map((type, idx) => {
          const items = bucket === 'company' ? state.company[type] : (activeRuleSet ? activeRuleSet[type] : []);
          const filtered = filterByTeam(items);
          const color = idx === 0 ? '#dc2626' : idx === 1 ? '#d97706' : '#0284c7';
          const bg = idx === 0 ? '#fef2f2' : idx === 1 ? '#fffbeb' : '#f0f9ff';
          return (
            <div key={type} className="rounded border border-gray-200 bg-white overflow-hidden">
              <div className="flex items-center gap-1 px-1.5 py-0.5 border-b" style={{ background: bg, borderColor: `${color}33` }}>
                <Edit3 size={11} style={{ color }} />
                <span className="text-[10px] font-bold" style={{ color }}>{type} ({filtered.length})</span>
              </div>
              <ul className="p-1 space-y-0.5 max-h-[320px] overflow-y-auto">
                {(bucket !== 'company' && !group) ? (
                  <li className="text-[10px] text-gray-400 py-1 text-center">왼쪽 그룹 선택</li>
                ) : filtered.length === 0 ? (
                  <li className="text-[10px] text-gray-400 py-1 text-center">항목 없음</li>
                ) : (
                  filtered.map((it) => (
                    <li key={it.id} className="rounded px-1 py-0.5 hover:bg-gray-50 text-[10px] text-gray-700 leading-snug">
                      <div className="flex items-start gap-1">
                        <span className="mt-0.5 h-1 w-1 rounded-full flex-shrink-0" style={{ background: color }} />
                        <span className="flex-1">{it.text}</span>
                      </div>
                      {it.teams.length > 0 && (
                        <div className="flex flex-wrap gap-0.5 mt-0.5 pl-2">
                          {it.teams.map((t) => (
                            <span key={t} className="rounded-full bg-gray-100 px-1 py-px text-[9px] text-gray-600">
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </li>
                  ))
                )}
              </ul>
            </div>
          );
        })}
      </div>

      {/* 세로 3단: 4열 보조 — 팀 필터 + 이력 */}
      <div className="grid grid-cols-4 gap-1.5">
        <div className="col-span-2 rounded border border-gray-200 bg-white p-1.5">
          <div className="flex items-center gap-1 mb-1">
            <Users size={11} className="text-gray-500" />
            <span className="text-[10px] font-bold text-gray-700">팀 필터 (멀티)</span>
            {teamFilter.size > 0 && (
              <button onClick={() => setTeamFilter(new Set())} className="ml-auto text-[9px] text-blue-500 hover:underline">
                초기화
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-0.5">
            {ALL_TEAMS.map((t) => {
              const active = teamFilter.has(t);
              return (
                <button
                  key={t}
                  onClick={() => toggleTeam(t)}
                  className="rounded-full border px-1.5 py-px text-[9px] font-semibold transition-colors"
                  style={
                    active
                      ? { background: '#2563eb', color: '#fff', borderColor: '#2563eb' }
                      : { background: '#fff', color: '#6b7280', borderColor: '#d1d5db' }
                  }
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>

        <div className="col-span-2 rounded border border-gray-200 bg-white p-1.5">
          <div className="flex items-center gap-1 mb-1">
            <Clock size={11} className="text-gray-500" />
            <span className="text-[10px] font-bold text-gray-700">최근 변경 이력</span>
          </div>
          <div className="text-[10px] text-gray-400">
            변경 로그 API 미연결 — `/api/rules/history` 도입 시 여기에 표시.
            <br />편집은 상단 <NavLink to="/rules-mgmt" className="text-blue-500 hover:underline">rules-mgmt (D1)</NavLink> 에서 가능합니다.
          </div>
        </div>
      </div>
    </div>
  );
}
