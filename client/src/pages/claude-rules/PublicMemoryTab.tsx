import { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight, ChevronsDown, ChevronsUp, Search, Folder, FileText, Brain } from 'lucide-react';
import { MEMORY_FILES } from './memoryData';

/* ── 등급/타입 스타일 ── */
const GRADE_STYLE: Record<string, { bg: string; text: string; bar: string; border: string }> = {
  '🚨최고정🚨': { bg: 'bg-red-200', text: 'text-red-800', bar: '#b91c1c', border: 'border-red-400' },
  '고정':     { bg: 'bg-red-50',  text: 'text-red-600', bar: '#ef4444', border: 'border-red-200' },
  '준고정':   { bg: 'bg-amber-100', text: 'text-amber-700', bar: '#d97706', border: 'border-amber-200' },
  '선택':     { bg: 'bg-sky-100', text: 'text-sky-700', bar: '#0284c7', border: 'border-sky-200' },
  '참조':     { bg: 'bg-slate-100', text: 'text-slate-700', bar: '#64748b', border: 'border-slate-200' },
  '-':        { bg: 'bg-gray-100', text: 'text-gray-500', bar: '#9ca3af', border: 'border-gray-200' },
};

const TYPE_STYLE: Record<string, { bg: string; text: string; bar: string; emoji: string }> = {
  feedback:  { bg: 'bg-violet-100', text: 'text-violet-700', bar: '#7c3aed', emoji: '🎯' },
  reference: { bg: 'bg-emerald-100', text: 'text-emerald-700', bar: '#059669', emoji: '📚' },
  user:      { bg: 'bg-pink-100', text: 'text-pink-700', bar: '#db2777', emoji: '👤' },
  '':        { bg: 'bg-gray-100', text: 'text-gray-500', bar: '#9ca3af', emoji: '📄' },
};

/* ── 멀티 필터 칩 (원형) ── */
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

/* ── 작은 바 차트 (세로) ── */
function MiniBarChart({ data, title }: { data: { label: string; value: number; color: string }[]; title: string }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="rounded-md border border-gray-200 bg-white p-1">
      <div className="text-[9px] font-bold text-gray-500 px-1 pb-0.5 flex items-center justify-between">
        <span>{title}</span>
        <span className="text-gray-400">총 {data.reduce((s, d) => s + d.value, 0)}개</span>
      </div>
      <div className="flex items-end gap-0.5 h-16 px-1">
        {data.map(d => (
          <div key={d.label} className="flex-1 flex flex-col items-center gap-px" title={`${d.label}: ${d.value}`}>
            <span className="text-[8px] font-bold" style={{ color: d.color }}>{d.value}</span>
            <div
              className="w-full rounded-t"
              style={{ height: `${(d.value / max) * 100}%`, background: d.color, minHeight: 2 }}
            />
            <span className="text-[8px] text-gray-500 truncate w-full text-center" title={d.label}>{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── 파일 구조 트리 ── */
function FileStructureTree({ byType }: { byType: Record<string, number> }) {
  return (
    <div className="rounded-md border border-gray-200 bg-white p-1 font-mono text-[9px] leading-tight">
      <div className="text-[9px] font-bold text-gray-500 pb-0.5 font-sans">📁 파일 구조</div>
      <div className="text-gray-700">
        <div>~/.claude/memory/</div>
        <div className="pl-2">├── 📋 MEMORY.md <span className="text-gray-400">— 인덱스</span></div>
        {Object.entries(byType).map(([t, n], i, arr) => {
          const isLast = i === arr.length - 1;
          const prefix = isLast ? '└── ' : '├── ';
          const emoji = TYPE_STYLE[t]?.emoji ?? '📄';
          return (
            <div key={t} className="pl-2">
              {prefix}{emoji} {t}_*.md <span className="text-gray-400">× {n}</span>
            </div>
          );
        })}
      </div>
      <div className="text-gray-400 text-[8px] pt-0.5">
        출처: <code className="bg-gray-50 px-0.5 rounded">~/.claude/memory/</code>
      </div>
    </div>
  );
}

/* ── 메인 탭 ── */
export function PublicMemoryTab() {
  const [search, setSearch] = useState('');
  const [gradeFilter, setGradeFilter] = useState<Set<string>>(new Set());
  const [typeFilter, setTypeFilter] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const allGrades = useMemo(() => {
    const order = ['🚨최고정🚨', '고정', '준고정', '선택', '참조', '-'];
    const present = new Set(MEMORY_FILES.map(m => m.grade));
    return order.filter(g => present.has(g));
  }, []);
  const allTypes = useMemo(() => [...new Set(MEMORY_FILES.map(m => m.type))].filter(Boolean), []);

  const effGrades = gradeFilter.size === 0 ? new Set(allGrades) : gradeFilter;
  const effTypes = typeFilter.size === 0 ? new Set(allTypes) : typeFilter;

  const filtered = useMemo(() => {
    return MEMORY_FILES.filter(m => {
      if (!effGrades.has(m.grade)) return false;
      if (!effTypes.has(m.type)) return false;
      if (!search) return true;
      const q = search.toLowerCase();
      return [m.file, m.name, m.description, m.indexDesc, m.body].some(s => (s || '').toLowerCase().includes(q));
    });
  }, [effGrades, effTypes, search]);

  const gradeCount = useMemo(() => {
    const c: Record<string, number> = {};
    MEMORY_FILES.forEach(m => { c[m.grade] = (c[m.grade] || 0) + 1; });
    return c;
  }, []);
  const typeCount = useMemo(() => {
    const c: Record<string, number> = {};
    MEMORY_FILES.forEach(m => { c[m.type] = (c[m.type] || 0) + 1; });
    return c;
  }, []);

  const toggleGrade = (g: string) => setGradeFilter(p => {
    const base = p.size === 0 ? new Set(allGrades) : new Set(p);
    base.has(g) ? base.delete(g) : base.add(g);
    return base;
  });
  const toggleType = (t: string) => setTypeFilter(p => {
    const base = p.size === 0 ? new Set(allTypes) : new Set(p);
    base.has(t) ? base.delete(t) : base.add(t);
    return base;
  });
  const toggleExp = (f: string) => setExpanded(p => { const n = new Set(p); n.has(f) ? n.delete(f) : n.add(f); return n; });
  const allExpanded = filtered.length > 0 && filtered.every(f => expanded.has(f.file));
  const toggleAll = () => {
    if (allExpanded) setExpanded(new Set());
    else setExpanded(new Set(filtered.map(f => f.file)));
  };

  return (
    <div className="flex flex-col gap-1.5">
      {/* 🧠 배너 */}
      <div className="rounded-md border border-indigo-300 bg-gradient-to-r from-indigo-50 to-violet-50 px-2 py-1 flex items-center gap-2 flex-wrap">
        <Brain className="h-3.5 w-3.5 text-indigo-600" />
        <span className="text-[11px] font-bold text-indigo-700">공용 메모리 스냅샷</span>
        <code className="text-[10px] text-indigo-800 bg-white px-1.5 py-0.5 rounded border border-indigo-200">
          /home/hutechc/.claude/memory/
        </code>
        <span className="text-[9px] text-indigo-500">Claude Code가 모든 세션 시작 시 자동 로드</span>
        <span className="ml-auto text-[11px] font-bold text-indigo-700">
          🧠 총 {MEMORY_FILES.length}개 파일
        </span>
      </div>

      {/* 📊 통계 + 차트 — 3단 */}
      <div className="grid grid-cols-3 gap-1">
        {/* 전체 카운트 카드 */}
        <div className="rounded-md border border-indigo-200 bg-indigo-50 p-1.5 flex flex-col justify-center items-center">
          <div className="text-[9px] font-bold text-indigo-500">총 파일 수</div>
          <div className="text-2xl font-extrabold text-indigo-700 leading-none my-0.5">{MEMORY_FILES.length}</div>
          <div className="text-[9px] text-indigo-600">등급 {allGrades.length}종 · 타입 {allTypes.length}종</div>
        </div>
        {/* 등급별 차트 */}
        <MiniBarChart
          title="🏷️ 등급별 분포"
          data={allGrades.map(g => ({
            label: g.replace(/🚨/g, ''),
            value: gradeCount[g] || 0,
            color: GRADE_STYLE[g]?.bar || '#9ca3af',
          }))}
        />
        {/* 타입별 차트 */}
        <MiniBarChart
          title="📦 타입별 분포"
          data={allTypes.map(t => ({
            label: t,
            value: typeCount[t] || 0,
            color: TYPE_STYLE[t]?.bar || '#9ca3af',
          }))}
        />
      </div>

      {/* 📁 파일 구조 트리 + 검색/필터 — 2단 */}
      <div className="grid grid-cols-1 md:grid-cols-[minmax(200px,250px)_1fr] gap-1">
        <FileStructureTree byType={typeCount} />

        <div className="flex flex-col gap-1">
          {/* 필터 */}
          <div className="flex items-center gap-1 flex-wrap">
            <span className="text-[9px] font-bold text-gray-500">🏷️ 등급:</span>
            {allGrades.map(g => (
              <FilterChip
                key={g}
                active={effGrades.has(g)}
                color={GRADE_STYLE[g]?.bar || '#6b7280'}
                bg={GRADE_STYLE[g]?.bg.replace('bg-', '') === '' ? '#fff' : '#fef2f2'}
                onClick={() => toggleGrade(g)}
              >{g} ({gradeCount[g] || 0})</FilterChip>
            ))}
          </div>
          <div className="flex items-center gap-1 flex-wrap">
            <span className="text-[9px] font-bold text-gray-500">📦 타입:</span>
            {allTypes.map(t => (
              <FilterChip
                key={t}
                active={effTypes.has(t)}
                color={TYPE_STYLE[t]?.bar || '#6b7280'}
                bg={'#fff'}
                onClick={() => toggleType(t)}
              >{TYPE_STYLE[t]?.emoji} {t} ({typeCount[t] || 0})</FilterChip>
            ))}
            <div className="flex-1" />
            <div className="relative">
              <Search className="absolute left-1.5 top-1/2 h-3 w-3 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="파일·내용 검색..."
                className="rounded-md border border-gray-300 py-0.5 pl-5 pr-2 text-[11px] w-44 focus:border-blue-400 focus:outline-none"
              />
            </div>
            <button
              onClick={toggleAll}
              className="flex items-center gap-0.5 rounded-md border border-gray-300 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-gray-600 hover:bg-gray-50 whitespace-nowrap"
            >
              {allExpanded ? <ChevronsUp className="h-3 w-3" /> : <ChevronsDown className="h-3 w-3" />}
              {allExpanded ? '전체 접기' : '전체 펼치기'}
            </button>
          </div>
          <div className="text-[9px] text-gray-500 px-0.5">
            검색 결과: <b className="text-gray-700">{filtered.length}</b> / {MEMORY_FILES.length}개
          </div>
        </div>
      </div>

      {/* 📋 메인 테이블 */}
      <div className="rounded-md border border-gray-200 bg-white overflow-hidden">
        {/* 헤더 */}
        <div className="grid grid-cols-[28px_28px_50px_72px_minmax(140px,180px)_minmax(200px,1fr)_minmax(220px,2fr)_24px] gap-1 bg-gray-50 border-b border-gray-200 px-1 py-0.5 text-[9px] font-bold text-gray-500 uppercase">
          <span>#</span>
          <span></span>
          <span>🏷️</span>
          <span>📦</span>
          <span>📁 파일</span>
          <span>📝 name</span>
          <span>💬 description</span>
          <span></span>
        </div>
        {/* 행 */}
        {filtered.length === 0 ? (
          <div className="px-2 py-3 text-center text-[10px] text-gray-400">검색 결과 없음</div>
        ) : filtered.map(m => {
          const gs = GRADE_STYLE[m.grade] || GRADE_STYLE['-'];
          const ts = TYPE_STYLE[m.type] || TYPE_STYLE[''];
          const isOpen = expanded.has(m.file);
          return (
            <div key={m.file} className="border-b border-gray-100 last:border-b-0">
              <button
                onClick={() => toggleExp(m.file)}
                className="w-full grid grid-cols-[28px_28px_50px_72px_minmax(140px,180px)_minmax(200px,1fr)_minmax(220px,2fr)_24px] gap-1 items-center px-1 py-0.5 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="text-[10px] font-bold text-gray-500 text-center">{m.idx ?? '-'}</span>
                <span>{isOpen ? <ChevronDown className="h-2.5 w-2.5 text-gray-400" /> : <ChevronRight className="h-2.5 w-2.5 text-gray-400" />}</span>
                <span className={`inline-flex justify-center rounded border px-1 py-px text-[9px] font-bold ${gs.bg} ${gs.text} ${gs.border}`}>
                  {m.grade.replace(/🚨/g, '')}
                </span>
                <span className={`inline-flex justify-center rounded border px-1 py-px text-[9px] font-bold ${ts.bg} ${ts.text} border-transparent`}>
                  {ts.emoji}&nbsp;{m.type || '-'}
                </span>
                <span className="text-[10px] font-mono text-gray-700 truncate" title={m.file}>{m.file}</span>
                <span className="text-[10px] font-semibold text-gray-800 truncate" title={m.name}>{m.name || '—'}</span>
                <span className="text-[9px] text-gray-500 truncate" title={m.description}>{m.description || '—'}</span>
                <span><FileText className="h-2.5 w-2.5 text-gray-300" /></span>
              </button>
              {isOpen && (
                <div className="bg-gray-50/70 border-t border-gray-100 px-2 py-1">
                  <div className="grid grid-cols-[minmax(120px,180px)_1fr] gap-1 mb-0.5">
                    <div className="rounded border border-gray-200 bg-white p-1">
                      <div className="text-[9px] font-bold text-gray-500">📋 인덱스 요약 (MEMORY.md)</div>
                      <div className="text-[10px] text-gray-700 leading-tight">{m.indexDesc || '—'}</div>
                    </div>
                    <div className="rounded border border-gray-200 bg-white p-1">
                      <div className="text-[9px] font-bold text-gray-500">💬 description (본문)</div>
                      <div className="text-[10px] text-gray-700 leading-tight">{m.description || '—'}</div>
                    </div>
                  </div>
                  <div className="rounded border border-gray-200 bg-white">
                    <div className="text-[9px] font-bold text-gray-500 px-1 pt-0.5 flex items-center gap-1">
                      <Folder className="h-2.5 w-2.5" /> 본문 (원문 .md)
                    </div>
                    <pre className="text-[10px] text-gray-700 leading-tight px-1 py-0.5 overflow-x-auto whitespace-pre-wrap font-mono bg-gray-50/50">{m.body}</pre>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
