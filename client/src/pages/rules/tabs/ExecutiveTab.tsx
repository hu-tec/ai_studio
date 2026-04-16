import { useMemo } from 'react';
import { NavLink } from 'react-router';
import { BarChart3, Grid3x3, Compass, TrendingUp, AlertTriangle } from 'lucide-react';
import { useRules } from '../../rules-mgmt/RulesContext';
import type { RuleSet } from '../../rules-mgmt/RulesContext';

function countRuleSet(rs: RuleSet) {
  return { 규정: rs.규정.length, 준규정: rs.준규정.length, 선택사항: rs.선택사항.length };
}

export function ExecutiveTab() {
  const { state } = useRules();

  // 전체 분포
  const distribution = useMemo(() => {
    const all: { 규정: number; 준규정: number; 선택사항: number } = { 규정: 0, 준규정: 0, 선택사항: 0 };
    const addRS = (rs: RuleSet) => {
      all.규정 += rs.규정.length;
      all.준규정 += rs.준규정.length;
      all.선택사항 += rs.선택사항.length;
    };
    addRS(state.company);
    Object.values(state.departments).forEach(addRS);
    Object.values(state.ranks).forEach(addRS);
    Object.values(state.services).forEach(addRS);
    const total = all.규정 + all.준규정 + all.선택사항;
    return { ...all, total };
  }, [state]);

  // 부서별 규정 수 TOP
  const deptRanking = useMemo(() => {
    return Object.entries(state.departments)
      .map(([name, rs]) => ({ name, total: rs.규정.length + rs.준규정.length + rs.선택사항.length, ...countRuleSet(rs) }))
      .sort((a, b) => b.total - a.total);
  }, [state.departments]);

  const serviceRanking = useMemo(() => {
    return Object.entries(state.services)
      .map(([name, rs]) => ({ name, total: rs.규정.length + rs.준규정.length + rs.선택사항.length, ...countRuleSet(rs) }))
      .sort((a, b) => b.total - a.total);
  }, [state.services]);

  const rankRanking = useMemo(() => {
    return Object.entries(state.ranks)
      .map(([name, rs]) => ({ name, total: rs.규정.length + rs.준규정.length + rs.선택사항.length, ...countRuleSet(rs) }));
  }, [state.ranks]);

  // 공백 감지 — 규정 0, 고정<3
  const gaps = useMemo(() => {
    const pickGaps = (rec: Record<string, RuleSet>, bucket: string) =>
      Object.entries(rec)
        .map(([name, rs]) => ({
          bucket,
          name,
          fixed: rs.규정.length,
          total: rs.규정.length + rs.준규정.length + rs.선택사항.length,
        }))
        .filter((x) => x.total === 0 || x.fixed < 3);
    return [
      ...pickGaps(state.departments, '부서'),
      ...pickGaps(state.ranks, '직급'),
      ...pickGaps(state.services, '서비스'),
    ];
  }, [state]);

  const maxDept = Math.max(1, ...deptRanking.map((d) => d.total));
  const maxSvc = Math.max(1, ...serviceRanking.map((d) => d.total));

  const pctFixed = distribution.total ? Math.round((distribution.규정 / distribution.total) * 100) : 0;
  const pctSemi = distribution.total ? Math.round((distribution.준규정 / distribution.total) * 100) : 0;
  const pctOpt = distribution.total ? Math.round((distribution.선택사항 / distribution.total) * 100) : 0;

  return (
    <div className="flex flex-col gap-1.5">
      {/* 세로 1단: 가로 4열 KPI */}
      <div className="grid grid-cols-4 gap-1.5">
        {/* 1) 비율 */}
        <div className="rounded border border-gray-200 bg-white p-1.5">
          <div className="flex items-center gap-1 mb-1">
            <BarChart3 size={11} className="text-violet-600" />
            <span className="text-[10px] font-bold text-violet-700">고정·준고정·선택 비율</span>
          </div>
          <div className="flex h-4 rounded overflow-hidden border border-gray-200">
            <div style={{ width: `${pctFixed}%`, background: '#dc2626' }} title={`고정 ${pctFixed}%`} />
            <div style={{ width: `${pctSemi}%`, background: '#d97706' }} title={`준고정 ${pctSemi}%`} />
            <div style={{ width: `${pctOpt}%`, background: '#0284c7' }} title={`선택 ${pctOpt}%`} />
          </div>
          <div className="mt-1 grid grid-cols-3 text-[9px] text-center">
            <div className="text-red-600"><b>{distribution.규정}</b><br />고정 {pctFixed}%</div>
            <div className="text-amber-600"><b>{distribution.준규정}</b><br />준 {pctSemi}%</div>
            <div className="text-sky-600"><b>{distribution.선택사항}</b><br />선택 {pctOpt}%</div>
          </div>
        </div>

        {/* 2) 부서 TOP5 */}
        <div className="rounded border border-gray-200 bg-white p-1.5">
          <div className="flex items-center gap-1 mb-1">
            <TrendingUp size={11} className="text-emerald-600" />
            <span className="text-[10px] font-bold text-emerald-700">부서별 규정 수 TOP5</span>
          </div>
          <div className="space-y-0.5">
            {deptRanking.slice(0, 5).map((d) => (
              <div key={d.name} className="flex items-center gap-1">
                <span className="w-14 text-[9px] text-gray-600 truncate">{d.name}</span>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500" style={{ width: `${(d.total / maxDept) * 100}%` }} />
                </div>
                <span className="w-6 text-right text-[9px] font-bold text-gray-700">{d.total}</span>
              </div>
            ))}
            {deptRanking.length === 0 && <div className="text-[10px] text-gray-400">데이터 없음</div>}
          </div>
        </div>

        {/* 3) 서비스별 */}
        <div className="rounded border border-gray-200 bg-white p-1.5">
          <div className="flex items-center gap-1 mb-1">
            <TrendingUp size={11} className="text-violet-600" />
            <span className="text-[10px] font-bold text-violet-700">서비스별 규정 수</span>
          </div>
          <div className="space-y-0.5">
            {serviceRanking.slice(0, 5).map((d) => (
              <div key={d.name} className="flex items-center gap-1">
                <span className="w-14 text-[9px] text-gray-600 truncate">{d.name}</span>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-violet-500" style={{ width: `${(d.total / maxSvc) * 100}%` }} />
                </div>
                <span className="w-6 text-right text-[9px] font-bold text-gray-700">{d.total}</span>
              </div>
            ))}
            {serviceRanking.length === 0 && <div className="text-[10px] text-gray-400">데이터 없음</div>}
          </div>
        </div>

        {/* 4) 전체 총계 + 링크 */}
        <div className="rounded border border-gray-200 bg-white p-1.5">
          <div className="flex items-center gap-1 mb-1">
            <Compass size={11} className="text-blue-600" />
            <span className="text-[10px] font-bold text-blue-700">전체 규모</span>
          </div>
          <div className="text-[10px] text-gray-700 space-y-0.5">
            <div>회사 전체 지침: <b>{state.company.규정.length + state.company.준규정.length + state.company.선택사항.length}</b></div>
            <div>부서: <b>{deptRanking.length}</b>개</div>
            <div>직급: <b>{rankRanking.length}</b>개</div>
            <div>서비스: <b>{serviceRanking.length}</b>개</div>
          </div>
          <NavLink to="/eval-criteria" className="mt-1 block text-center text-[9px] text-blue-500 hover:underline">
            → eval-criteria (D2) 에서 평가 지표 확인
          </NavLink>
        </div>
      </div>

      {/* 세로 2단: 4열 교차 매트릭스 */}
      <div className="grid grid-cols-4 gap-1.5">
        <div className="col-span-2 rounded border border-gray-200 bg-white overflow-hidden">
          <div className="flex items-center gap-1 px-1.5 py-0.5 bg-gray-50 border-b border-gray-200">
            <Grid3x3 size={11} className="text-gray-600" />
            <span className="text-[10px] font-bold text-gray-700">부서 × 규정타입 히트맵</span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-[9px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-1 py-0.5 text-left sticky left-0 bg-gray-50">부서</th>
                  <th className="px-1 py-0.5 text-center text-red-600">고정</th>
                  <th className="px-1 py-0.5 text-center text-amber-600">준고정</th>
                  <th className="px-1 py-0.5 text-center text-sky-600">선택</th>
                  <th className="px-1 py-0.5 text-center">합계</th>
                </tr>
              </thead>
              <tbody>
                {deptRanking.map((d) => (
                  <tr key={d.name} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-1 py-0.5 font-semibold sticky left-0 bg-white">{d.name}</td>
                    <td className="px-1 py-0.5 text-center" style={{ background: d.규정 === 0 ? '#fecaca' : undefined }}>{d.규정}</td>
                    <td className="px-1 py-0.5 text-center">{d.준규정}</td>
                    <td className="px-1 py-0.5 text-center">{d.선택사항}</td>
                    <td className="px-1 py-0.5 text-center font-bold">{d.total}</td>
                  </tr>
                ))}
                {deptRanking.length === 0 && (
                  <tr><td className="px-1 py-1 text-center text-gray-400" colSpan={5}>부서 데이터 없음</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="col-span-2 rounded border border-gray-200 bg-white overflow-hidden">
          <div className="flex items-center gap-1 px-1.5 py-0.5 bg-gray-50 border-b border-gray-200">
            <Grid3x3 size={11} className="text-gray-600" />
            <span className="text-[10px] font-bold text-gray-700">직급 × 서비스 규정타입 비교</span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-[9px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-1 py-0.5 text-left sticky left-0 bg-gray-50">구분</th>
                  <th className="px-1 py-0.5 text-center text-red-600">고정</th>
                  <th className="px-1 py-0.5 text-center text-amber-600">준고정</th>
                  <th className="px-1 py-0.5 text-center text-sky-600">선택</th>
                  <th className="px-1 py-0.5 text-center">합계</th>
                </tr>
              </thead>
              <tbody>
                {rankRanking.map((d) => (
                  <tr key={d.name} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-1 py-0.5 sticky left-0 bg-white"><span className="mr-1">🎖️</span>{d.name}</td>
                    <td className="px-1 py-0.5 text-center">{d.규정}</td>
                    <td className="px-1 py-0.5 text-center">{d.준규정}</td>
                    <td className="px-1 py-0.5 text-center">{d.선택사항}</td>
                    <td className="px-1 py-0.5 text-center font-bold">{d.total}</td>
                  </tr>
                ))}
                {serviceRanking.map((d) => (
                  <tr key={d.name} className="border-b border-gray-100 hover:bg-gray-50 bg-violet-50/30">
                    <td className="px-1 py-0.5 sticky left-0 bg-violet-50/30"><span className="mr-1">🌐</span>{d.name}</td>
                    <td className="px-1 py-0.5 text-center">{d.규정}</td>
                    <td className="px-1 py-0.5 text-center">{d.준규정}</td>
                    <td className="px-1 py-0.5 text-center">{d.선택사항}</td>
                    <td className="px-1 py-0.5 text-center font-bold">{d.total}</td>
                  </tr>
                ))}
                {rankRanking.length === 0 && serviceRanking.length === 0 && (
                  <tr><td className="px-1 py-1 text-center text-gray-400" colSpan={5}>데이터 없음</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 세로 3단: 4열 방향 제언 */}
      <div className="grid grid-cols-4 gap-1.5">
        <div className="col-span-2 rounded border border-amber-300 bg-amber-50 p-1.5">
          <div className="flex items-center gap-1 mb-1">
            <AlertTriangle size={11} className="text-amber-600" />
            <span className="text-[10px] font-bold text-amber-700">공백 자동 감지 ({gaps.length}건)</span>
          </div>
          <div className="text-[9px] text-amber-600 mb-1">총계 0 또는 고정 규정 3개 미만인 항목</div>
          <ul className="space-y-0.5 max-h-[160px] overflow-y-auto">
            {gaps.length === 0 ? (
              <li className="text-[10px] text-amber-600">공백 없음 — 모든 그룹이 기본 구성을 갖춤.</li>
            ) : (
              gaps.map((g) => (
                <li key={`${g.bucket}-${g.name}`} className="flex items-center gap-1 text-[10px] bg-white rounded px-1 py-0.5">
                  <span className="rounded bg-amber-200 px-1 py-px text-[9px] font-bold text-amber-800">{g.bucket}</span>
                  <span className="font-semibold text-gray-800">{g.name}</span>
                  <span className="ml-auto text-[9px] text-amber-700">고정 {g.fixed} · 총 {g.total}</span>
                </li>
              ))
            )}
          </ul>
        </div>

        <div className="col-span-2 rounded border border-blue-300 bg-blue-50 p-1.5">
          <div className="flex items-center gap-1 mb-1">
            <Compass size={11} className="text-blue-600" />
            <span className="text-[10px] font-bold text-blue-700">방향 제언 (로드맵)</span>
          </div>
          <ol className="list-decimal pl-4 space-y-0.5 text-[10px] text-blue-800">
            <li>공백 감지에서 <b>고정 3개 미만</b>인 {gaps.filter((g) => g.fixed < 3).length}건 우선 보강</li>
            <li>부서별 TOP5 외 하위 부서는 <b>상위 부서의 고정 규정</b>을 참조·복제 검토</li>
            <li>비율 이상 시(고정 &gt; 70% 또는 &lt; 30%) 분류 재조정 — 현재 고정 {pctFixed}%</li>
            <li>평가기준(<NavLink to="/eval-criteria" className="underline">D2</NavLink>)과 규정 카테고리 매핑 검토</li>
            <li>전체 <b>{distribution.total}</b>건 중 체크되지 않은 미할당 규정(teams 공란) 정비</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
