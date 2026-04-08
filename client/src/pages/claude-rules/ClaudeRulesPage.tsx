import { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight, ChevronsDown, ChevronsUp, Search, Shield, ShieldAlert, ShieldCheck } from 'lucide-react';
import { DESIGN_RULES, CLAUDE_RULES, KEY_PRINCIPLES, type RuleLevel } from './data';

/* ── 등급 배지 ── */
const LEVEL_STYLE: Record<RuleLevel, { bg: string; text: string; icon: typeof Shield }> = {
  '고정':   { bg: 'bg-red-100 border-red-300',    text: 'text-red-700',    icon: ShieldAlert },
  '준고정': { bg: 'bg-amber-100 border-amber-300', text: 'text-amber-700',  icon: ShieldCheck },
  '선택':   { bg: 'bg-sky-100 border-sky-300',     text: 'text-sky-700',    icon: Shield },
};

function LevelBadge({ level }: { level: RuleLevel }) {
  const s = LEVEL_STYLE[level];
  const Icon = s.icon;
  return (
    <span className={`inline-flex items-center gap-0.5 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold ${s.bg} ${s.text}`}>
      <Icon className="h-3 w-3" />{level}
    </span>
  );
}

/* ── 탭 칩 (싱글=네모) ── */
function TabChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-md border px-2 py-1 text-[11px] font-semibold transition-colors ${
        active ? 'border-blue-500 bg-blue-500 text-white' : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50'
      }`}
    >{children}</button>
  );
}

/* ── 필터 칩 (멀티=원형) ── */
function FilterChip({ active, color, bg, onClick, children }: {
  active: boolean; color: string; bg: string; onClick: () => void; children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="rounded-full border px-2 py-0.5 text-[10px] font-semibold transition-colors"
      style={active ? { background: bg, borderColor: color, color } : { background: '#fff', borderColor: '#d1d5db', color: '#6b7280' }}
    >{children}</button>
  );
}

/* ── 업무 설계 규정 탭 ── */
function DesignRulesTab() {
  const [expandedMajor, setExpandedMajor] = useState<Set<string>>(new Set(DESIGN_RULES.map(r => r.id)));
  const [expandedMid, setExpandedMid] = useState<Set<string>>(new Set());
  const [activeMajors, setActiveMajors] = useState<Set<string>>(new Set(DESIGN_RULES.map(r => r.id)));
  const [search, setSearch] = useState('');

  const allExpanded = expandedMajor.size === DESIGN_RULES.length && DESIGN_RULES.every(r => r.midCategories.every((_, mi) => expandedMid.has(`${r.id}-${mi}`)));

  const toggleAll = () => {
    if (allExpanded) {
      setExpandedMajor(new Set());
      setExpandedMid(new Set());
    } else {
      setExpandedMajor(new Set(DESIGN_RULES.map(r => r.id)));
      const allMids = new Set<string>();
      DESIGN_RULES.forEach(r => r.midCategories.forEach((_, mi) => allMids.add(`${r.id}-${mi}`)));
      setExpandedMid(allMids);
    }
  };

  const toggleMajor = (id: string) => {
    setExpandedMajor(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };
  const toggleMid = (key: string) => {
    setExpandedMid(prev => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n; });
  };
  const toggleFilter = (id: string) => {
    setActiveMajors(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const filtered = useMemo(() => {
    return DESIGN_RULES.filter(r => activeMajors.has(r.id)).map(r => {
      if (!search) return r;
      const q = search.toLowerCase();
      const midCategories = r.midCategories.map(mc => ({
        ...mc,
        items: mc.items.filter(i => i.title.toLowerCase().includes(q) || i.content.toLowerCase().includes(q)),
      })).filter(mc => mc.items.length > 0 || mc.mid.toLowerCase().includes(q));
      return { ...r, midCategories };
    }).filter(r => r.midCategories.length > 0 || r.major.toLowerCase().includes(search.toLowerCase()));
  }, [activeMajors, search]);

  const totalItems = DESIGN_RULES.reduce((s, r) => s + r.midCategories.reduce((s2, mc) => s2 + mc.items.length, 0), 0);

  return (
    <div className="flex flex-col gap-1.5">
      {/* 핵심 원칙 5개 */}
      <div className="grid grid-cols-5 gap-1">
        {KEY_PRINCIPLES.map(p => (
          <div key={p.num} className="rounded-md border border-blue-200 bg-blue-50 p-1.5">
            <div className="text-[10px] font-bold text-blue-600">원칙 {p.num}</div>
            <div className="text-[11px] font-semibold text-gray-800">{p.title}</div>
            <div className="text-[10px] text-gray-500">{p.desc}</div>
          </div>
        ))}
      </div>

      {/* 요약 카드 */}
      <div className="flex items-center gap-2">
        <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold text-gray-600">
          {DESIGN_RULES.length}개 대분류 · {DESIGN_RULES.reduce((s, r) => s + r.midCategories.length, 0)}개 중분류 · {totalItems}개 항목
        </span>
        <div className="flex-1" />
        <div className="relative">
          <Search className="absolute left-1.5 top-1/2 h-3 w-3 -translate-y-1/2 text-gray-400" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="검색..."
            className="rounded-md border border-gray-300 py-0.5 pl-5 pr-2 text-[11px] w-40 focus:border-blue-400 focus:outline-none"
          />
        </div>
        <button onClick={toggleAll} className="flex items-center gap-0.5 rounded-md border border-gray-300 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-gray-600 hover:bg-gray-50">
          {allExpanded ? <ChevronsUp className="h-3 w-3" /> : <ChevronsDown className="h-3 w-3" />}
          {allExpanded ? '전체 접기' : '전체 펼치기'}
        </button>
      </div>

      {/* 필터 칩 (멀티=원형) */}
      <div className="flex flex-wrap gap-1">
        {DESIGN_RULES.map(r => (
          <FilterChip key={r.id} active={activeMajors.has(r.id)} color={r.color} bg={r.bg} onClick={() => toggleFilter(r.id)}>
            {r.major}
          </FilterChip>
        ))}
      </div>

      {/* 대→중→소 확장 구조 */}
      <div className="flex flex-col gap-1">
        {filtered.map(r => (
          <div key={r.id} className="rounded-md border" style={{ borderColor: r.color + '40' }}>
            {/* 대분류 헤더 */}
            <button
              onClick={() => toggleMajor(r.id)}
              className="flex w-full items-center gap-1.5 px-2 py-1 text-left"
              style={{ background: r.bg }}
            >
              {expandedMajor.has(r.id) ? <ChevronDown className="h-3.5 w-3.5 flex-shrink-0" style={{ color: r.color }} /> : <ChevronRight className="h-3.5 w-3.5 flex-shrink-0" style={{ color: r.color }} />}
              <span className="text-[12px] font-bold" style={{ color: r.color }}>{r.major}</span>
              <span className="text-[10px] text-gray-400">{r.midCategories.length}개 중분류</span>
            </button>

            {expandedMajor.has(r.id) && (
              <div className="flex flex-col gap-px bg-gray-50 px-1 pb-1">
                {r.midCategories.map((mc, mi) => {
                  const midKey = `${r.id}-${mi}`;
                  return (
                    <div key={mi} className="rounded bg-white">
                      {/* 중분류 헤더 */}
                      <button
                        onClick={() => toggleMid(midKey)}
                        className="flex w-full items-center gap-1 px-2 py-0.5 text-left hover:bg-gray-50"
                      >
                        {expandedMid.has(midKey) ? <ChevronDown className="h-3 w-3 text-gray-400" /> : <ChevronRight className="h-3 w-3 text-gray-400" />}
                        <span className="text-[11px] font-semibold text-gray-700">{mc.mid}</span>
                        <span className="text-[10px] text-gray-400">({mc.items.length})</span>
                      </button>

                      {/* 소분류 항목 */}
                      {expandedMid.has(midKey) && (
                        <div className="ml-4 border-l border-gray-200 pl-2 pb-1">
                          {mc.items.map((item, si) => (
                            <div key={si} className="flex gap-1 py-0.5">
                              <span className="flex-shrink-0 rounded bg-gray-100 px-1 py-px text-[10px] font-semibold text-gray-600">{item.title}</span>
                              <span className="text-[10px] text-gray-500">{item.content}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Claude 작업 규정 탭 ── */
function ClaudeRulesTab() {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(CLAUDE_RULES.map(r => r.id)));
  const [levelFilter, setLevelFilter] = useState<Set<RuleLevel>>(new Set(['고정', '준고정', '선택']));
  const [search, setSearch] = useState('');

  const allExpanded = expandedIds.size === CLAUDE_RULES.length;
  const toggleAll = () => setExpandedIds(allExpanded ? new Set() : new Set(CLAUDE_RULES.map(r => r.id)));
  const toggleId = (id: string) => setExpandedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleLevel = (lv: RuleLevel) => setLevelFilter(prev => { const n = new Set(prev); n.has(lv) ? n.delete(lv) : n.add(lv); return n; });

  const filtered = useMemo(() => {
    return CLAUDE_RULES.filter(r => {
      if (!levelFilter.has(r.level)) return false;
      if (!search) return true;
      const q = search.toLowerCase();
      return r.title.toLowerCase().includes(q) || r.category.toLowerCase().includes(q) || r.rules.some(ru => ru.toLowerCase().includes(q));
    });
  }, [levelFilter, search]);

  const cats = [...new Set(CLAUDE_RULES.map(r => r.category))];

  return (
    <div className="flex flex-col gap-1.5">
      {/* 요약 */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold text-gray-600">
          고정 {CLAUDE_RULES.filter(r => r.level === '고정').length} · 준고정 {CLAUDE_RULES.filter(r => r.level === '준고정').length} · 선택 {CLAUDE_RULES.filter(r => r.level === '선택').length}
        </span>
        {/* 등급 필터 (멀티=원형) */}
        {(['고정', '준고정', '선택'] as RuleLevel[]).map(lv => (
          <FilterChip
            key={lv}
            active={levelFilter.has(lv)}
            color={lv === '고정' ? '#dc2626' : lv === '준고정' ? '#d97706' : '#0284c7'}
            bg={lv === '고정' ? '#fef2f2' : lv === '준고정' ? '#fffbeb' : '#f0f9ff'}
            onClick={() => toggleLevel(lv)}
          >{lv} ({CLAUDE_RULES.filter(r => r.level === lv).length})</FilterChip>
        ))}
        <div className="flex-1" />
        <div className="relative">
          <Search className="absolute left-1.5 top-1/2 h-3 w-3 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="검색..." className="rounded-md border border-gray-300 py-0.5 pl-5 pr-2 text-[11px] w-40 focus:border-blue-400 focus:outline-none" />
        </div>
        <button onClick={toggleAll} className="flex items-center gap-0.5 rounded-md border border-gray-300 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-gray-600 hover:bg-gray-50">
          {allExpanded ? <ChevronsUp className="h-3 w-3" /> : <ChevronsDown className="h-3 w-3" />}
          {allExpanded ? '전체 접기' : '전체 펼치기'}
        </button>
      </div>

      {/* 카테고리별 그룹 */}
      {cats.map(cat => {
        const catRules = filtered.filter(r => r.category === cat);
        if (catRules.length === 0) return null;
        return (
          <div key={cat}>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-1 py-0.5">{cat}</div>
            <div className="flex flex-col gap-0.5">
              {catRules.map(r => (
                <div key={r.id} className="rounded-md border border-gray-200 bg-white">
                  <button onClick={() => toggleId(r.id)} className="flex w-full items-center gap-1.5 px-2 py-1 text-left hover:bg-gray-50">
                    {expandedIds.has(r.id) ? <ChevronDown className="h-3 w-3 text-gray-400" /> : <ChevronRight className="h-3 w-3 text-gray-400" />}
                    <LevelBadge level={r.level} />
                    <span className="text-[11px] font-semibold text-gray-800">{r.title}</span>
                    <span className="text-[10px] text-gray-400">({r.rules.length})</span>
                  </button>
                  {expandedIds.has(r.id) && (
                    <div className="ml-6 border-l border-gray-200 pl-2 pb-1">
                      {r.rules.map((ru, i) => (
                        <div key={i} className="flex items-start gap-1 py-px">
                          <span className="mt-0.5 h-1 w-1 flex-shrink-0 rounded-full bg-gray-400" />
                          <span className="text-[10px] text-gray-600">{ru}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── 메인 페이지 ── */
export default function ClaudeRulesPage() {
  const [tab, setTab] = useState<'design' | 'claude'>('design');

  return (
    <div className="flex flex-col gap-1.5 p-2">
      <div className="flex items-center gap-2">
        <h1 className="text-sm font-bold text-gray-800">규정 (임시_혁_claude)</h1>
        <div className="flex gap-1">
          <TabChip active={tab === 'design'} onClick={() => setTab('design')}>업무 설계 규정</TabChip>
          <TabChip active={tab === 'claude'} onClick={() => setTab('claude')}>Claude 작업 규정</TabChip>
        </div>
      </div>

      {tab === 'design' ? <DesignRulesTab /> : <ClaudeRulesTab />}
    </div>
  );
}
