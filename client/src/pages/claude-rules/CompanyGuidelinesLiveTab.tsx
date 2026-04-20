import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, ChevronsDown, ChevronsUp, Search, Database, RefreshCw, AlertCircle } from 'lucide-react';

interface LiveItem {
  id: string;
  tab: string;           // 프롬프트 / 업무지침 / 사내규정
  workCat1?: string; workCat2?: string; workCat3?: string; workCat4?: string; workDb?: string;
  compWork?: string; compDept?: string; compPos?: string; compContract?: string;
  author?: string;
  title: string;
  content: string;
  ruleType: string;      // 규정 / 준규정 / 선택규정
  note?: string;
  created_at?: string;
}

const API = 'http://54.116.15.136:81/api/company-guidelines';

const COMPANY_DEPT = ['경영', '개발', '마케팅', '인사', '영업', '강사팀', '기획', '홈페이지', '상담', '총무', '관리'];
const WORK_CAT3 = ['일반', '전문', '교육'];
const WORK_CAT4 = ['1급', '2급', '3급', '4급', '5급', '6급', '7급', '8급'];

const TAB_STYLE: Record<string, { bg: string; text: string; bar: string; emoji: string }> = {
  '프롬프트': { bg: 'bg-violet-100', text: 'text-violet-700', bar: '#7c3aed', emoji: '💬' },
  '업무지침': { bg: 'bg-emerald-100', text: 'text-emerald-700', bar: '#059669', emoji: '📋' },
  '사내규정': { bg: 'bg-blue-100', text: 'text-blue-700', bar: '#2563eb', emoji: '🏢' },
};

const RULE_STYLE: Record<string, { bg: string; text: string; bar: string }> = {
  '규정':    { bg: 'bg-red-100', text: 'text-red-700', bar: '#dc2626' },
  '준규정':  { bg: 'bg-amber-100', text: 'text-amber-700', bar: '#d97706' },
  '선택규정':{ bg: 'bg-sky-100', text: 'text-sky-700', bar: '#0284c7' },
};

function FilterChip({ active, color, bg, onClick, children }: {
  active: boolean; color: string; bg: string; onClick: () => void; children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="rounded-full border px-2 py-0.5 text-[10px] font-semibold transition-colors whitespace-nowrap"
      style={active ? { background: bg, borderColor: color, color } : { background: '#fff', borderColor: '#d1d5db', color: '#6b7280' }}
    >{children}</button>
  );
}

function StackedBar({ data, title }: { data: { label: string; value: number; color: string }[]; title: string }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  return (
    <div className="rounded-md border border-gray-200 bg-white px-1.5 py-1">
      <div className="text-[9px] font-bold text-gray-500 pb-0.5 flex items-center justify-between">
        <span>{title}</span>
        <span className="text-gray-400">총 {total}개</span>
      </div>
      <div className="flex h-3.5 w-full overflow-hidden rounded border border-gray-100">
        {data.map(d => {
          const pct = (d.value / total) * 100;
          if (d.value === 0) return null;
          return (
            <div
              key={d.label}
              className="flex items-center justify-center text-[9px] font-bold text-white leading-none"
              style={{ width: `${pct}%`, background: d.color, minWidth: 14 }}
              title={`${d.label}: ${d.value} (${pct.toFixed(0)}%)`}
            >{pct >= 6 ? d.value : ''}</div>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-x-1.5 gap-y-0 mt-0.5 text-[9px]">
        {data.map(d => (
          <span key={d.label} className="inline-flex items-center gap-0.5">
            <span className="h-1.5 w-1.5 rounded-sm" style={{ background: d.color }} />
            <span className="font-semibold" style={{ color: d.color }}>{d.label}</span>
            <span className="text-gray-500">{d.value}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export function CompanyGuidelinesLiveTab() {
  const [items, setItems] = useState<LiveItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<string>('');

  const [search, setSearch] = useState('');
  const [tabFilter, setTabFilter] = useState<Set<string>>(new Set());
  const [typeFilter, setTypeFilter] = useState<Set<string>>(new Set());
  const [deptFilter, setDeptFilter] = useState<Set<string>>(new Set());
  const [posFilter, setPosFilter] = useState<Set<string>>(new Set());
  const [gradeFilter, setGradeFilter] = useState<Set<string>>(new Set());
  const [sgFilter, setSgFilter] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch(API);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const arr = Array.isArray(json) ? json : [];
      const all: LiveItem[] = [];
      arr.forEach((row: any) => {
        const rowItems = row?.data?.items || [];
        rowItems.forEach((it: any) => all.push(it));
      });
      setItems(all);
      setLastFetch(new Date().toLocaleString('ko-KR', { hour12: false }));
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const toggleFrom = (set: Set<string>, key: string) => {
    const n = new Set(set); n.has(key) ? n.delete(key) : n.add(key); return n;
  };

  const allTabs = useMemo(() => [...new Set(items.map(i => i.tab))].filter(Boolean), [items]);
  const allTypes = useMemo(() => [...new Set(items.map(i => i.ruleType))].filter(Boolean), [items]);
  const allPos = useMemo(() => [...new Set(items.map(i => i.compPos).filter(Boolean))] as string[], [items]);

  const filtered = useMemo(() => {
    return items.filter(i => {
      if (tabFilter.size > 0 && !tabFilter.has(i.tab)) return false;
      if (typeFilter.size > 0 && !typeFilter.has(i.ruleType)) return false;
      if (deptFilter.size > 0 && !deptFilter.has(i.compDept || '')) return false;
      if (posFilter.size > 0 && !posFilter.has(i.compPos || '')) return false;
      if (gradeFilter.size > 0 && !gradeFilter.has(i.workCat3 || '')) return false;
      if (sgFilter.size > 0 && !sgFilter.has(i.workCat4 || '')) return false;
      if (!search) return true;
      const q = search.toLowerCase();
      return [i.title, i.content, i.author, i.note, i.compDept, i.compPos, i.tab, i.ruleType]
        .some(s => (s || '').toLowerCase().includes(q));
    });
  }, [items, tabFilter, typeFilter, deptFilter, posFilter, gradeFilter, sgFilter, search]);

  const count = (key: keyof LiveItem, val: string) => items.filter(i => i[key] === val).length;

  const toggleExp = (id: string) => setExpanded(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const allExpanded = filtered.length > 0 && filtered.every(i => expanded.has(i.id));
  const toggleAll = () => {
    if (allExpanded) setExpanded(new Set());
    else setExpanded(new Set(filtered.map(i => i.id)));
  };
  const resetFilters = () => {
    setTabFilter(new Set()); setTypeFilter(new Set()); setDeptFilter(new Set());
    setPosFilter(new Set()); setGradeFilter(new Set()); setSgFilter(new Set()); setSearch('');
  };
  const hasFilter = tabFilter.size + typeFilter.size + deptFilter.size + posFilter.size + gradeFilter.size + sgFilter.size > 0 || search;

  return (
    <div className="flex flex-col gap-1.5">
      {/* 🔴 LIVE 배너 */}
      <div className="rounded-md border border-red-300 bg-gradient-to-r from-red-50 to-orange-50 px-2 py-1 flex items-center gap-2 flex-wrap">
        <Database className="h-3.5 w-3.5 text-red-600" />
        <span className="text-[11px] font-bold text-red-700">🔴 LIVE 데이터</span>
        <code className="text-[10px] text-red-800 bg-white px-1.5 py-0.5 rounded border border-red-200">
          GET {API}
        </code>
        <span className="text-[9px] text-red-500">사내업무지침 페이지와 동일 DB — 편집 즉시 반영</span>
        <div className="ml-auto flex items-center gap-1">
          {lastFetch && <span className="text-[9px] text-gray-500">최근 로드: {lastFetch}</span>}
          <button onClick={load} className="flex items-center gap-0.5 rounded border border-red-300 bg-white text-red-700 px-1.5 py-0.5 text-[10px] font-semibold hover:bg-red-50">
            <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
            새로고침
          </button>
        </div>
      </div>

      {loading && <div className="text-center text-[11px] text-gray-500 py-3">로딩 중...</div>}
      {error && (
        <div className="rounded-md border border-red-300 bg-red-50 px-2 py-1 flex items-center gap-1 text-[10px] text-red-700">
          <AlertCircle className="h-3 w-3" /> API 오류: {error}
        </div>
      )}

      {!loading && !error && (
        <>
          {/* 📊 통계 3단 */}
          <div className="grid grid-cols-3 gap-1">
            <div className="rounded-md border border-red-200 bg-red-50 p-1.5 flex flex-col justify-center items-center">
              <div className="text-[9px] font-bold text-red-500">총 규정 수</div>
              <div className="text-2xl font-extrabold text-red-700 leading-none my-0.5">{items.length}</div>
              <div className="text-[9px] text-red-600">필터 결과: <b>{filtered.length}</b></div>
            </div>
            <StackedBar
              title="📂 탭별 분포"
              data={allTabs.map(t => ({ label: `${TAB_STYLE[t]?.emoji || ''} ${t}`, value: count('tab', t), color: TAB_STYLE[t]?.bar || '#9ca3af' }))}
            />
            <StackedBar
              title="🏷️ 규정 타입별 분포"
              data={allTypes.map(t => ({ label: t, value: count('ruleType', t), color: RULE_STYLE[t]?.bar || '#9ca3af' }))}
            />
          </div>

          {/* 필터 영역 */}
          <div className="rounded-md border border-blue-200 bg-blue-50/40 px-1.5 py-1 flex flex-col gap-1">
            <div className="flex items-center gap-1">
              <span className="text-[9px] font-bold text-blue-700">🔗 멀티 축 필터</span>
              <span className="text-[9px] text-blue-500">— 동시 적용 가능 (빈 선택=전체)</span>
              <div className="flex-1" />
              <div className="relative">
                <Search className="absolute left-1.5 top-1/2 h-3 w-3 -translate-y-1/2 text-gray-400" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="제목·내용·작성자 검색..."
                  className="rounded-md border border-gray-300 py-0.5 pl-5 pr-2 text-[11px] w-48 focus:border-blue-400 focus:outline-none"
                />
              </div>
              {hasFilter && (
                <button onClick={resetFilters} className="rounded border border-gray-300 bg-white text-gray-600 px-1.5 py-0.5 text-[9px] font-semibold hover:bg-gray-50">✕ 전체 초기화</button>
              )}
              <button onClick={toggleAll} className="flex items-center gap-0.5 rounded-md border border-gray-300 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-gray-600 hover:bg-gray-50">
                {allExpanded ? <ChevronsUp className="h-3 w-3" /> : <ChevronsDown className="h-3 w-3" />}
                {allExpanded ? '전체 접기' : '전체 펼치기'}
              </button>
            </div>

            <div className="flex items-start gap-1 flex-wrap">
              <span className="text-[9px] font-bold text-violet-700 mt-0.5 whitespace-nowrap">📂 탭:</span>
              {allTabs.map(t => (
                <FilterChip key={t} active={tabFilter.has(t)} color={TAB_STYLE[t]?.bar || '#6b7280'} bg={TAB_STYLE[t]?.bg === 'bg-violet-100' ? '#f5f3ff' : TAB_STYLE[t]?.bg === 'bg-emerald-100' ? '#ecfdf5' : '#eff6ff'}
                  onClick={() => setTabFilter(p => toggleFrom(p, t))}
                >{TAB_STYLE[t]?.emoji} {t} ({count('tab', t)})</FilterChip>
              ))}
              <span className="text-[9px] font-bold text-red-700 mt-0.5 ml-2 whitespace-nowrap">🏷️ 타입:</span>
              {allTypes.map(t => (
                <FilterChip key={t} active={typeFilter.has(t)} color={RULE_STYLE[t]?.bar || '#6b7280'} bg={t === '규정' ? '#fef2f2' : t === '준규정' ? '#fffbeb' : '#f0f9ff'}
                  onClick={() => setTypeFilter(p => toggleFrom(p, t))}
                >{t} ({count('ruleType', t)})</FilterChip>
              ))}
            </div>

            <div className="flex items-start gap-1 flex-wrap">
              <span className="text-[9px] font-bold text-emerald-700 mt-0.5 whitespace-nowrap">🏢 부서(11):</span>
              {COMPANY_DEPT.map(d => {
                const n = items.filter(i => i.compDept === d).length;
                return (
                  <FilterChip key={d} active={deptFilter.has(d)} color="#059669" bg="#ecfdf5" onClick={() => setDeptFilter(p => toggleFrom(p, d))}>
                    {d}{n > 0 && ` (${n})`}
                  </FilterChip>
                );
              })}
            </div>

            <div className="flex items-start gap-1 flex-wrap">
              <span className="text-[9px] font-bold text-red-700 mt-0.5 whitespace-nowrap">👤 직급:</span>
              {allPos.length === 0 ? (
                <span className="text-[9px] text-gray-400 italic">태깅된 직급 데이터 없음</span>
              ) : allPos.map(p => (
                <FilterChip key={p} active={posFilter.has(p)} color="#dc2626" bg="#fef2f2" onClick={() => setPosFilter(pp => toggleFrom(pp, p))}>
                  {p} ({count('compPos', p)})
                </FilterChip>
              ))}
              <span className="text-[9px] font-bold text-violet-700 mt-0.5 ml-2 whitespace-nowrap">🎖️ 급수:</span>
              {WORK_CAT3.map(g => {
                const n = items.filter(i => i.workCat3 === g).length;
                return (
                  <FilterChip key={g} active={gradeFilter.has(g)} color="#7c3aed" bg="#f5f3ff" onClick={() => setGradeFilter(p => toggleFrom(p, g))}>
                    {g}{n > 0 && ` (${n})`}
                  </FilterChip>
                );
              })}
              <span className="text-[9px] font-bold text-orange-700 mt-0.5 ml-1 whitespace-nowrap">세부:</span>
              {WORK_CAT4.map(g => {
                const n = items.filter(i => i.workCat4 === g).length;
                return (
                  <FilterChip key={g} active={sgFilter.has(g)} color="#ea580c" bg="#fff7ed" onClick={() => setSgFilter(p => toggleFrom(p, g))}>
                    {g}{n > 0 && ` (${n})`}
                  </FilterChip>
                );
              })}
            </div>
          </div>

          {/* 📋 메인 테이블 */}
          <div className="rounded-md border border-gray-200 bg-white overflow-hidden">
            <div className="grid grid-cols-[28px_28px_60px_60px_60px_44px_minmax(180px,1fr)_minmax(200px,2fr)] gap-1 bg-gray-50 border-b border-gray-200 px-1 py-0.5 text-[9px] font-bold text-gray-500 uppercase">
              <span className="text-center">#</span>
              <span></span>
              <span>탭</span>
              <span>타입</span>
              <span>부서</span>
              <span>직급</span>
              <span>📝 제목</span>
              <span>💬 내용</span>
            </div>
            {filtered.length === 0 ? (
              <div className="px-2 py-3 text-center text-[10px] text-gray-400">필터 결과 없음</div>
            ) : filtered.map((i, idx) => {
              const ts = TAB_STYLE[i.tab] || { bg: 'bg-gray-100', text: 'text-gray-600', emoji: '📄' };
              const rs = RULE_STYLE[i.ruleType] || { bg: 'bg-gray-100', text: 'text-gray-600' };
              const isOpen = expanded.has(i.id);
              return (
                <div key={i.id} className="border-b border-gray-100 last:border-b-0">
                  <button onClick={() => toggleExp(i.id)}
                    className="w-full grid grid-cols-[28px_28px_60px_60px_60px_44px_minmax(180px,1fr)_minmax(200px,2fr)] gap-1 items-center px-1 py-0.5 text-left hover:bg-gray-50 transition-colors">
                    <span className="text-center text-[9px] font-bold text-gray-500">{idx + 1}</span>
                    <span>{isOpen ? <ChevronDown className="h-2.5 w-2.5 text-gray-400" /> : <ChevronRight className="h-2.5 w-2.5 text-gray-400" />}</span>
                    <span className={`inline-flex justify-center rounded px-1 py-px text-[9px] font-bold ${ts.bg} ${ts.text}`}>{ts.emoji} {i.tab}</span>
                    <span className={`inline-flex justify-center rounded px-1 py-px text-[9px] font-bold ${rs.bg} ${rs.text}`}>{i.ruleType}</span>
                    <span className="text-[9px] text-gray-700 truncate text-center">{i.compDept || '—'}</span>
                    <span className="text-[9px] text-gray-700 truncate text-center">{i.compPos || '—'}</span>
                    <span className="text-[10px] font-semibold text-gray-800 truncate" title={i.title}>{i.title}</span>
                    <span className="text-[9px] text-gray-500 truncate leading-tight" title={i.content}>{i.content}</span>
                  </button>
                  {isOpen && (
                    <div className="bg-gray-50/70 border-t border-gray-100 px-2 py-1 grid grid-cols-[120px_1fr] gap-1 text-[10px]">
                      <div className="text-gray-500 font-bold">📝 제목</div>
                      <div className="text-gray-800">{i.title}</div>
                      <div className="text-gray-500 font-bold">💬 내용</div>
                      <div className="text-gray-700 whitespace-pre-wrap">{i.content}</div>
                      <div className="text-gray-500 font-bold">🏷️ 메타</div>
                      <div className="text-gray-600 flex flex-wrap gap-1">
                        <span>탭: <b>{i.tab}</b></span>
                        <span>· 타입: <b>{i.ruleType}</b></span>
                        {i.compDept && <span>· 부서: <b>{i.compDept}</b></span>}
                        {i.compPos && <span>· 직급: <b>{i.compPos}</b></span>}
                        {i.compWork && <span>· 업무: <b>{i.compWork}</b></span>}
                        {i.workCat1 && <span>· 분류: <b>{i.workCat1}</b></span>}
                        {i.workCat2 && <span>· 교육: <b>{i.workCat2}</b></span>}
                        {i.workCat3 && <span>· 급수: <b>{i.workCat3}</b></span>}
                        {i.workCat4 && <span>· 세부: <b>{i.workCat4}</b></span>}
                        {i.author && <span>· 작성자: <b>{i.author}</b></span>}
                        {i.created_at && <span>· 생성: <b>{i.created_at.slice(0, 10)}</b></span>}
                      </div>
                      {i.note && <><div className="text-gray-500 font-bold">📎 비고</div><div className="text-gray-600 italic">{i.note}</div></>}
                    </div>
                  )}
                </div>
              );
            })}
            <div className="border-t border-gray-200 bg-gray-50 px-1 py-0.5 text-[9px] text-gray-500 flex items-center justify-between">
              <span>표시 <b>{filtered.length}</b> / 전체 {items.length}개</span>
              <a href="/app/company-guidelines" className="text-blue-600 hover:underline">→ 원본 페이지 (편집 가능)</a>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
