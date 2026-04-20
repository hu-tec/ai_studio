import { useState, useMemo, useEffect } from 'react';
import { ChevronDown, ChevronRight, ChevronsDown, ChevronsUp, Search, Shield, ShieldAlert, ShieldCheck, FileSpreadsheet, Pencil, Trash2, Plus, LayoutGrid, Table2 } from 'lucide-react';
import { DESIGN_RULES, CLAUDE_RULES, KEY_PRINCIPLES, HR_SEED_COMPANY, HR_SEED_RANKS, HR_SEED_DEPTS, HR_SEED_SERVICES, type RuleLevel, type HRRuleSet } from './data';
import { PublicMemoryTab } from './PublicMemoryTab';

/* ── 사내업무지침 교차 축 상수 (company-guidelines 페이지와 동일) ── */
const COMPANY_DEPT = ['경영', '개발', '마케팅', '인사', '영업', '강사팀', '기획', '홈페이지', '상담', '총무', '관리'];
const WORK_CAT3 = ['일반', '전문', '교육'];
const WORK_CAT4 = ['1급', '2급', '3급', '4급', '5급', '6급', '7급', '8급'];

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
export function DesignRulesTab() {
  const [expandedMajor, setExpandedMajor] = useState<Set<string>>(new Set(DESIGN_RULES.map(r => r.id)));
  const [expandedMid, setExpandedMid] = useState<Set<string>>(() => {
    const all = new Set<string>();
    DESIGN_RULES.forEach(r => r.midCategories.forEach((_, mi) => all.add(`${r.id}-${mi}`)));
    return all;
  });
  const [activeMajors, setActiveMajors] = useState<Set<string>>(new Set(DESIGN_RULES.map(r => r.id)));
  const [search, setSearch] = useState('');
  const [showDetail, setShowDetail] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');

  type ItemPatch = { title: string; content: string };
  type Overlay = { deleted: string[]; edited: Record<string, ItemPatch>; added: Record<string, ItemPatch[]> };
  const OVERLAY_KEY = 'design-rules-overlay-v1';
  const [overlay, setOverlay] = useState<Overlay>(() => {
    try {
      const raw = localStorage.getItem(OVERLAY_KEY);
      if (raw) return JSON.parse(raw) as Overlay;
    } catch {}
    return { deleted: [], edited: {}, added: {} };
  });
  useEffect(() => {
    try { localStorage.setItem(OVERLAY_KEY, JSON.stringify(overlay)); } catch {}
  }, [overlay]);

  const [editing, setEditing] = useState<{ key: string; title: string; content: string } | null>(null);
  const [adding, setAdding] = useState<{ midKey: string; title: string; content: string } | null>(null);

  const toggleItem = (key: string) => {
    setExpandedItems(prev => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n; });
  };

  const saveEdit = () => {
    if (!editing) return;
    const { key, title, content } = editing;
    if (!title.trim()) return;
    const patch = { title: title.trim(), content: content.trim() };
    const addedMatch = key.match(/^(.+?)-a(\d+)$/);
    setOverlay(o => {
      if (addedMatch) {
        const midKey = addedMatch[1]; const ai = +addedMatch[2];
        const arr = [...(o.added[midKey] || [])]; arr[ai] = patch;
        return { ...o, added: { ...o.added, [midKey]: arr } };
      }
      return { ...o, edited: { ...o.edited, [key]: patch } };
    });
    setEditing(null);
  };
  const deleteItem = (key: string) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    const addedMatch = key.match(/^(.+?)-a(\d+)$/);
    setOverlay(o => {
      if (addedMatch) {
        const midKey = addedMatch[1]; const ai = +addedMatch[2];
        const arr = [...(o.added[midKey] || [])]; arr.splice(ai, 1);
        return { ...o, added: { ...o.added, [midKey]: arr } };
      }
      return { ...o, deleted: o.deleted.includes(key) ? o.deleted : [...o.deleted, key] };
    });
  };
  const saveAdd = () => {
    if (!adding) return;
    const { midKey, title, content } = adding;
    if (!title.trim()) return;
    setOverlay(o => ({
      ...o,
      added: { ...o.added, [midKey]: [...(o.added[midKey] || []), { title: title.trim(), content: content.trim() }] },
    }));
    setAdding(null);
  };
  const resetOverlay = () => {
    if (!window.confirm('편집 내역을 모두 초기화하시겠습니까? (추가/수정/삭제 전부)')) return;
    setOverlay({ deleted: [], edited: {}, added: {} });
  };
  const overlayCount = overlay.deleted.length + Object.keys(overlay.edited).length
    + Object.values(overlay.added).reduce((s, a) => s + a.length, 0);

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

  const overlayed = useMemo(() => {
    return DESIGN_RULES.map(r => ({
      ...r,
      midCategories: r.midCategories.map((mc, mi) => {
        const midKey = `${r.id}-${mi}`;
        const base = mc.items
          .map((it, si) => {
            const key = `${r.id}-${mi}-${si}`;
            const patch = overlay.edited[key];
            return { key, isAdded: false, title: patch?.title ?? it.title, content: patch?.content ?? it.content };
          })
          .filter(it => !overlay.deleted.includes(it.key));
        const added = (overlay.added[midKey] || []).map((it, ai) => ({
          key: `${midKey}-a${ai}`, isAdded: true, title: it.title, content: it.content,
        }));
        return { ...mc, items: [...base, ...added] };
      }),
    }));
  }, [overlay]);

  const filtered = useMemo(() => {
    return overlayed.filter(r => activeMajors.has(r.id)).map(r => {
      if (!search) return r;
      const q = search.toLowerCase();
      const midCategories = r.midCategories.map(mc => ({
        ...mc,
        items: mc.items.filter(i => i.title.toLowerCase().includes(q) || i.content.toLowerCase().includes(q)),
      })).filter(mc => mc.items.length > 0 || mc.mid.toLowerCase().includes(q));
      return { ...r, midCategories };
    }).filter(r => r.midCategories.length > 0 || r.major.toLowerCase().includes(search.toLowerCase()));
  }, [overlayed, activeMajors, search]);

  const totalItems = overlayed.reduce((s, r) => s + r.midCategories.reduce((s2, mc) => s2 + mc.items.length, 0), 0);

  return (
    <div className="flex flex-col gap-1.5">
      {/* 핵심 원칙 5개 — 1줄 압축 (hover 시 desc 툴팁) */}
      <div className="grid grid-cols-5 gap-1">
        {KEY_PRINCIPLES.map(p => (
          <div
            key={p.num}
            className="rounded-md border border-blue-200 bg-blue-50 px-1.5 py-0.5 flex items-center gap-1 min-w-0"
            title={p.desc}
          >
            <span className="rounded bg-blue-500 text-white text-[9px] font-bold px-1 flex-shrink-0">{p.num}</span>
            <span className="text-[10px] font-semibold text-gray-800 truncate">{p.title}</span>
          </div>
        ))}
      </div>

      {/* 요약 카드 */}
      <div className="flex items-center gap-2">
        <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold text-gray-600">
          {DESIGN_RULES.length}개 대분류 · {DESIGN_RULES.reduce((s, r) => s + r.midCategories.length, 0)}개 중분류 · {totalItems}개 항목
        </span>
        {overlayCount > 0 && (
          <button
            onClick={resetOverlay}
            className="rounded border border-amber-300 bg-amber-50 text-amber-700 px-1.5 py-0.5 text-[10px] font-semibold hover:bg-amber-100"
            title="추가/수정/삭제 편집 내역을 모두 초기화 (기본 시드로 복구)"
          >
            ↺ 편집 {overlayCount}건 초기화
          </button>
        )}
        <div className="flex-1" />
        <div className="relative">
          <Search className="absolute left-1.5 top-1/2 h-3 w-3 -translate-y-1/2 text-gray-400" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="검색..."
            className="rounded-md border border-gray-300 py-0.5 pl-2 pr-2 text-[11px] w-40 focus:border-blue-400 focus:outline-none"
          />
        </div>
        {/* 뷰 모드 토글 (싱글=네모) */}
        <div className="inline-flex rounded-md border border-gray-300 overflow-hidden">
          <button
            onClick={() => setViewMode('card')}
            className="flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-semibold transition-colors"
            style={viewMode === 'card'
              ? { background: '#2563eb', color: '#fff' }
              : { background: '#fff', color: '#6b7280' }}
            title="카드 뷰 (계층형)"
          ><LayoutGrid className="h-3 w-3" /> 카드</button>
          <button
            onClick={() => setViewMode('table')}
            className="flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-semibold transition-colors border-l border-gray-300"
            style={viewMode === 'table'
              ? { background: '#2563eb', color: '#fff' }
              : { background: '#fff', color: '#6b7280' }}
            title="테이블 뷰 (평면)"
          ><Table2 className="h-3 w-3" /> 테이블</button>
        </div>
        <button
          onClick={() => setShowDetail(v => !v)}
          className="flex items-center gap-0.5 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold transition-colors"
          style={
            showDetail
              ? { background: '#2563eb', color: '#fff', borderColor: '#2563eb' }
              : { background: '#fff', color: '#6b7280', borderColor: '#d1d5db' }
          }
          title="항목 제목만 / 제목+상세 설명 전환"
        >
          {showDetail ? <ChevronsUp className="h-3 w-3" /> : <ChevronsDown className="h-3 w-3" />}
          {showDetail ? '상세 접기' : '상세 펼치기'}
        </button>
        {viewMode === 'card' && (
          <button onClick={toggleAll} className="flex items-center gap-0.5 rounded-md border border-gray-300 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-gray-600 hover:bg-gray-50">
            {allExpanded ? <ChevronsUp className="h-3 w-3" /> : <ChevronsDown className="h-3 w-3" />}
            {allExpanded ? '전체 접기' : '전체 펼치기'}
          </button>
        )}
      </div>

      {/* 필터 칩 (멀티=원형) */}
      <div className="flex flex-wrap gap-1">
        {DESIGN_RULES.map(r => (
          <FilterChip key={r.id} active={activeMajors.has(r.id)} color={r.color} bg={r.bg} onClick={() => toggleFilter(r.id)}>
            {r.major}
          </FilterChip>
        ))}
      </div>

      {/* 테이블 뷰 — 평면 리스트 */}
      {viewMode === 'table' && (
        <div className="rounded-md border border-gray-200 bg-white overflow-hidden">
          <div className="grid grid-cols-[32px_minmax(100px,140px)_minmax(100px,140px)_minmax(140px,200px)_minmax(200px,1fr)_60px] gap-1 bg-gray-50 border-b border-gray-200 px-1 py-0.5 text-[9px] font-bold text-gray-500 uppercase">
            <span className="text-center">#</span>
            <span>대분류</span>
            <span>중분류</span>
            <span>제목</span>
            <span>내용</span>
            <span className="text-center">액션</span>
          </div>
          {(() => {
            let rowNum = 0;
            const rows: React.ReactNode[] = [];
            filtered.forEach(r => {
              r.midCategories.forEach(mc => {
                mc.items.forEach((item: any) => {
                  rowNum++;
                  const itemKey = item.key as string;
                  const isAdded = item.isAdded as boolean;
                  const isEditing = editing?.key === itemKey;
                  if (isEditing) {
                    rows.push(
                      <div key={itemKey} className="border-b border-gray-100 last:border-b-0 bg-blue-50/40 px-1 py-1">
                        <div className="flex items-center gap-1 text-[9px] text-gray-500 mb-0.5">
                          <span className="font-bold">{rowNum}</span>
                          <span>·</span>
                          <span style={{ color: r.color, fontWeight: 700 }}>{r.major}</span>
                          <span>›</span>
                          <span className="font-semibold">{mc.mid}</span>
                        </div>
                        <input
                          value={editing!.title}
                          onChange={e => setEditing({ ...editing!, title: e.target.value })}
                          placeholder="제목"
                          className="w-full text-[10px] rounded border border-gray-300 px-1 py-0.5 mb-0.5 focus:border-blue-400 focus:outline-none"
                          autoFocus
                        />
                        <textarea
                          value={editing!.content}
                          onChange={e => setEditing({ ...editing!, content: e.target.value })}
                          placeholder="내용"
                          rows={2}
                          className="w-full text-[10px] rounded border border-gray-300 px-1 py-0.5 resize-none focus:border-blue-400 focus:outline-none"
                        />
                        <div className="flex gap-0.5 justify-end mt-0.5">
                          <button onClick={saveEdit} className="rounded bg-blue-500 text-white px-1.5 py-0.5 text-[9px] font-bold hover:bg-blue-600">저장</button>
                          <button onClick={() => setEditing(null)} className="rounded border border-gray-300 bg-white text-gray-600 px-1.5 py-0.5 text-[9px] hover:bg-gray-50">취소</button>
                        </div>
                      </div>
                    );
                  } else {
                    rows.push(
                      <div key={itemKey} className="grid grid-cols-[32px_minmax(100px,140px)_minmax(100px,140px)_minmax(140px,200px)_minmax(200px,1fr)_60px] gap-1 items-center px-1 py-0.5 border-b border-gray-100 last:border-b-0 text-[10px] hover:bg-gray-50 group">
                        <span className="text-center font-bold text-gray-400 text-[9px]">{rowNum}</span>
                        <span className="font-semibold truncate" style={{ color: r.color }} title={r.major}>{r.major}</span>
                        <span className="text-gray-600 truncate" title={mc.mid}>{mc.mid}</span>
                        <span className="font-bold text-gray-800 truncate" title={item.title}>
                          {item.title}
                          {isAdded && <span className="ml-1 text-[8px] text-emerald-600 font-bold">+</span>}
                        </span>
                        <span className="text-gray-500 leading-tight text-[9px] truncate" title={item.content}>{item.content}</span>
                        <span className="flex items-center gap-0.5 justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => setEditing({ key: itemKey, title: item.title, content: item.content })} className="text-gray-400 hover:text-blue-500 p-px" title="편집">
                            <Pencil className="h-2.5 w-2.5" />
                          </button>
                          <button onClick={() => deleteItem(itemKey)} className="text-gray-400 hover:text-red-500 p-px" title="삭제">
                            <Trash2 className="h-2.5 w-2.5" />
                          </button>
                        </span>
                      </div>
                    );
                  }
                });
              });
            });
            return rows.length > 0 ? rows : (
              <div className="text-center text-[10px] text-gray-400 py-3">검색 결과 없음</div>
            );
          })()}
          <div className="border-t border-gray-200 bg-gray-50 px-1 py-0.5 text-[9px] text-gray-500 flex items-center justify-between">
            <span>총 {filtered.reduce((s, r) => s + r.midCategories.reduce((s2, mc) => s2 + mc.items.length, 0), 0)}개 항목</span>
            <span className="text-gray-400">이사님 공유용 평면 뷰 · 편집은 마우스 오버 시</span>
          </div>
        </div>
      )}

      {/* 대분류 4단 그리드 — 카드 내부 중분류 2단 + 소분류 2단 */}
      {viewMode === 'card' && (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-1">
        {filtered.map(r => (
          <div key={r.id} className="rounded-md border overflow-hidden" style={{ borderColor: r.color + '40' }}>
            {/* 대분류 헤더 */}
            <button
              onClick={() => toggleMajor(r.id)}
              className="flex w-full items-center gap-1 px-1.5 py-0.5 text-left"
              style={{ background: r.bg }}
            >
              {expandedMajor.has(r.id) ? <ChevronDown className="h-3 w-3 flex-shrink-0" style={{ color: r.color }} /> : <ChevronRight className="h-3 w-3 flex-shrink-0" style={{ color: r.color }} />}
              <span className="text-[11px] font-bold truncate" style={{ color: r.color }}>{r.major}</span>
              <span className="ml-auto text-[9px] text-gray-400">{r.midCategories.length}</span>
            </button>

            {expandedMajor.has(r.id) && (
              <div className="grid grid-cols-1 gap-px bg-gray-50 p-0.5">
                {r.midCategories.map((mc, mi) => {
                  const midKey = `${r.id}-${mi}`;
                  return (
                    <div key={mi} className="rounded bg-white">
                      <button
                        onClick={() => toggleMid(midKey)}
                        className="flex w-full items-center gap-1 px-1 py-0.5 text-left hover:bg-gray-50"
                      >
                        {expandedMid.has(midKey) ? <ChevronDown className="h-2.5 w-2.5 text-gray-400" /> : <ChevronRight className="h-2.5 w-2.5 text-gray-400" />}
                        <span className="text-[10px] font-semibold text-gray-700 truncate">{mc.mid}</span>
                        <span className="ml-auto text-[9px] text-gray-400">{mc.items.length}</span>
                      </button>

                      {expandedMid.has(midKey) && (
                        <div className="flex flex-col gap-0.5 px-1 pb-0.5">
                          {mc.items.map((item: any) => {
                            const itemKey = item.key as string;
                            const isAdded = item.isAdded as boolean;
                            const open = showDetail || expandedItems.has(itemKey);
                            const isEditing = editing?.key === itemKey;
                            if (isEditing) {
                              return (
                                <div key={itemKey} className="rounded border border-blue-300 bg-blue-50/60 p-0.5 space-y-0.5">
                                  <input
                                    value={editing!.title}
                                    onChange={e => setEditing({ ...editing!, title: e.target.value })}
                                    placeholder="제목"
                                    className="w-full text-[10px] rounded border border-gray-300 px-1 py-0.5 focus:border-blue-400 focus:outline-none"
                                    autoFocus
                                  />
                                  <textarea
                                    value={editing!.content}
                                    onChange={e => setEditing({ ...editing!, content: e.target.value })}
                                    placeholder="내용"
                                    rows={2}
                                    className="w-full text-[10px] rounded border border-gray-300 px-1 py-0.5 resize-none focus:border-blue-400 focus:outline-none"
                                  />
                                  <div className="flex gap-0.5 justify-end">
                                    <button onClick={saveEdit} className="rounded bg-blue-500 text-white px-1.5 py-0.5 text-[9px] font-bold hover:bg-blue-600">저장</button>
                                    <button onClick={() => setEditing(null)} className="rounded border border-gray-300 bg-white text-gray-600 px-1.5 py-0.5 text-[9px] hover:bg-gray-50">취소</button>
                                  </div>
                                </div>
                              );
                            }
                            return (
                              <div key={itemKey} className="rounded border border-gray-100 bg-gray-50/50 hover:bg-gray-100/70 transition-colors group">
                                <div className="flex items-start gap-0.5 px-1 py-0.5">
                                  <button
                                    type="button"
                                    onClick={() => toggleItem(itemKey)}
                                    className="flex items-start gap-0.5 flex-1 text-left min-w-0"
                                    title={open ? '접기' : item.content}
                                  >
                                    {open
                                      ? <ChevronDown className="h-2.5 w-2.5 mt-px text-gray-400 flex-shrink-0" />
                                      : <ChevronRight className="h-2.5 w-2.5 mt-px text-gray-400 flex-shrink-0" />}
                                    <span className="text-[9px] font-bold text-gray-700 leading-tight flex-1">
                                      {item.title}
                                      {isAdded && <span className="ml-1 text-[8px] text-emerald-600 font-bold">+</span>}
                                    </span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setEditing({ key: itemKey, title: item.title, content: item.content })}
                                    className="text-gray-400 hover:text-blue-500 p-px opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="편집"
                                  >
                                    <Pencil className="h-2.5 w-2.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => deleteItem(itemKey)}
                                    className="text-gray-400 hover:text-red-500 p-px opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="삭제"
                                  >
                                    <Trash2 className="h-2.5 w-2.5" />
                                  </button>
                                </div>
                                {open && (
                                  <div className="text-[9px] text-gray-500 leading-tight px-1 pb-0.5 pl-3">{item.content}</div>
                                )}
                              </div>
                            );
                          })}
                          {adding?.midKey === midKey ? (
                            <div className="rounded border border-emerald-300 bg-emerald-50/60 p-0.5 space-y-0.5">
                              <input
                                value={adding.title}
                                onChange={e => setAdding({ ...adding, title: e.target.value })}
                                placeholder="제목"
                                className="w-full text-[10px] rounded border border-gray-300 px-1 py-0.5 focus:border-emerald-400 focus:outline-none"
                                autoFocus
                              />
                              <textarea
                                value={adding.content}
                                onChange={e => setAdding({ ...adding, content: e.target.value })}
                                placeholder="내용"
                                rows={2}
                                className="w-full text-[10px] rounded border border-gray-300 px-1 py-0.5 resize-none focus:border-emerald-400 focus:outline-none"
                              />
                              <div className="flex gap-0.5 justify-end">
                                <button onClick={saveAdd} className="rounded bg-emerald-500 text-white px-1.5 py-0.5 text-[9px] font-bold hover:bg-emerald-600">추가</button>
                                <button onClick={() => setAdding(null)} className="rounded border border-gray-300 bg-white text-gray-600 px-1.5 py-0.5 text-[9px] hover:bg-gray-50">취소</button>
                              </div>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setAdding({ midKey, title: '', content: '' })}
                              className="rounded border border-dashed border-emerald-300 bg-white/50 hover:bg-emerald-50 text-emerald-600 text-[9px] font-semibold py-0.5 flex items-center justify-center gap-0.5"
                              title="이 중분류에 항목 추가"
                            >
                              <Plus className="h-2.5 w-2.5" /> 항목 추가
                            </button>
                          )}
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
      )}
    </div>
  );
}

/* ── Claude 작업 규정 탭 ── */
export function ClaudeRulesTab() {
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
      {/* 등급 필터 + 검색 + 전체 펼치기 */}
      <div className="flex items-center gap-2 flex-wrap">
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
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="검색..." className="rounded-md border border-gray-300 py-0.5 pl-2 pr-2 text-[11px] w-40 focus:border-blue-400 focus:outline-none" />
        </div>
        <button onClick={toggleAll} className="flex items-center gap-0.5 rounded-md border border-gray-300 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-gray-600 hover:bg-gray-50">
          {allExpanded ? <ChevronsUp className="h-3 w-3" /> : <ChevronsDown className="h-3 w-3" />}
          {allExpanded ? '전체 접기' : '전체 펼치기'}
        </button>
      </div>

      {/* 카테고리별 그룹 — 각 그룹 내 카드는 4단 */}
      {cats.map(cat => {
        const catRules = filtered.filter(r => r.category === cat);
        if (catRules.length === 0) return null;
        return (
          <div key={cat}>
            <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider px-1 py-0.5">{cat}</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-1">
              {catRules.map(r => (
                <div key={r.id} className="rounded-md border border-gray-200 bg-white overflow-hidden">
                  <button onClick={() => toggleId(r.id)} className="flex w-full items-center gap-1 px-1.5 py-0.5 text-left hover:bg-gray-50">
                    {expandedIds.has(r.id) ? <ChevronDown className="h-2.5 w-2.5 text-gray-400" /> : <ChevronRight className="h-2.5 w-2.5 text-gray-400" />}
                    <LevelBadge level={r.level} />
                    <span className="text-[10px] font-semibold text-gray-800 truncate flex-1">{r.title}</span>
                    <span className="text-[9px] text-gray-400">{r.rules.length}</span>
                  </button>
                  {expandedIds.has(r.id) && (
                    <div className="grid grid-cols-1 gap-0.5 px-1 pb-0.5">
                      {r.rules.map((ru, i) => (
                        <div key={i} className="rounded border border-gray-100 bg-gray-50/50 px-1 py-0.5 text-[9px] text-gray-700 leading-tight">
                          {ru}
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

/* ── 인사규정 탭 (가연님 xlsx 원본 seed) ── */
export function HRRulesTab() {
  const [section, setSection] = useState<'company' | 'ranks' | 'depts' | 'services'>('company');
  const [expandAll, setExpandAll] = useState(true);
  const [activeGroups, setActiveGroups] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  // 교차 축 필터 (사내업무지침 동일 축)
  const [deptFilter, setDeptFilter] = useState<Set<string>>(new Set());
  const [gradeFilter, setGradeFilter] = useState<Set<string>>(new Set());
  const [rankFilter, setRankFilter] = useState<Set<string>>(new Set());

  // 활성 section 에 해당하는 데이터
  const groups: Record<string, HRRuleSet> =
    section === 'ranks' ? HR_SEED_RANKS :
    section === 'depts' ? HR_SEED_DEPTS :
    section === 'services' ? HR_SEED_SERVICES :
    { '직급 공통': HR_SEED_COMPANY };

  const groupNames = Object.keys(groups);
  // 섹션별 현재 축 필터 (교차) — 해당 축이 있는 섹션에서만 활성
  const axisFiltered = useMemo(() => {
    if (section === 'depts' && deptFilter.size > 0) {
      return groupNames.filter(n => [...deptFilter].some(d => n.includes(d)));
    }
    if (section === 'ranks' && rankFilter.size > 0) {
      return groupNames.filter(n => rankFilter.has(n));
    }
    return groupNames;
  }, [section, deptFilter, rankFilter, groupNames]);

  // 초기: 모든 그룹 펼침 (축 필터와 별개인 펼침 상태)
  const shown = useMemo(() => {
    if (activeGroups.size === 0) return new Set(axisFiltered);
    return activeGroups;
  }, [activeGroups, section, axisFiltered]);

  const toggleGroup = (name: string) => {
    setActiveGroups(prev => {
      const base = prev.size === 0 ? new Set(groupNames) : new Set(prev);
      base.has(name) ? base.delete(name) : base.add(name);
      return base;
    });
  };
  const toggleAll = () => {
    if (expandAll) { setActiveGroups(new Set()); setExpandAll(false); }
    else { setActiveGroups(new Set(groupNames)); setExpandAll(true); }
  };

  const matchSearch = (s: string) => !search || s.toLowerCase().includes(search.toLowerCase());
  const countHit = (rs: HRRuleSet) =>
    [...rs.fixed, ...rs.semi, ...rs.opt].filter(matchSearch).length;

  // section별 요약
  const totalItems = groupNames.reduce((sum, n) => {
    const g = groups[n];
    return sum + g.fixed.length + g.semi.length + g.opt.length;
  }, 0);

  const toggleFrom = (set: Set<string>, key: string) => {
    const n = new Set(set);
    n.has(key) ? n.delete(key) : n.add(key);
    return n;
  };

  const SECTION_META: Record<string, { label: string; emoji: string; color: string }> = {
    company:  { label: '직급 공통',   emoji: '👥', color: '#4f46e5' },
    ranks:    { label: '직급 (8종)', emoji: '🎖️', color: '#dc2626' },
    depts:    { label: '부서 (13부서)', emoji: '🏢', color: '#059669' },
    services: { label: '홈페이지 (8서비스)', emoji: '🌐', color: '#7c3aed' },
  };

  return (
    <div className="flex flex-col gap-1.5">
      {/* 출처 배너 */}
      <div className="rounded-md border border-emerald-300 bg-emerald-50 px-2 py-1 flex items-center gap-2">
        <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
        <span className="text-[10px] font-bold text-emerald-700">출처:</span>
        <code className="text-[10px] text-emerald-800 bg-white px-1.5 py-0.5 rounded border border-emerald-200">1.인사규정.xlsx</code>
        <span className="text-[10px] text-emerald-600">(가연님 · v2 시트 최신본 · 7시트 중 3시트 이관)</span>
        <span className="ml-auto text-[10px] font-bold text-emerald-700">총 {totalItems}개 규정</span>
      </div>

      {/* 섹션 탭 + 검색 + 전체 토글 */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex gap-1">
          {(Object.keys(SECTION_META) as Array<keyof typeof SECTION_META>).map(k => {
            const m = SECTION_META[k];
            const isActive = section === k;
            return (
              <button key={k}
                onClick={() => { setSection(k as any); setActiveGroups(new Set()); setExpandAll(true); }}
                className={`rounded-md border px-2 py-1 text-[11px] font-semibold transition-colors`}
                style={isActive
                  ? { background: m.color, color: '#fff', borderColor: m.color }
                  : { background: '#fff', color: '#64748b', borderColor: '#cbd5e1' }}
              >
                <span className="mr-0.5">{m.emoji}</span>{m.label}
              </button>
            );
          })}
        </div>
        <div className="flex-1" />
        <div className="relative">
          <Search className="absolute left-1.5 top-1/2 h-3 w-3 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="규정 검색..."
            className="rounded-md border border-gray-300 py-0.5 pl-2 pr-2 text-[11px] w-40 focus:border-blue-400 focus:outline-none" />
        </div>
        <button onClick={toggleAll}
          className="flex items-center gap-0.5 rounded-md border border-gray-300 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-gray-600 hover:bg-gray-50">
          {expandAll ? <ChevronsUp className="h-3 w-3" /> : <ChevronsDown className="h-3 w-3" />}
          {expandAll ? '전체 접기' : '전체 펼치기'}
        </button>
      </div>

      {/* 🔍 교차 축 필터 (사내업무지침 동일 축) */}
      <div className="rounded-md border border-blue-200 bg-blue-50/40 px-1.5 py-1 flex flex-col gap-1">
        <div className="flex items-center gap-1 text-[9px] text-blue-700">
          <span className="font-bold">🔗 사내업무지침 동일 축</span>
          <span className="text-blue-500">— 부서·급수·직급 멀티 선택 필터 (빈 선택=전체)</span>
          <span className="ml-auto text-blue-500">표시 그룹: <b className="text-blue-700">{axisFiltered.length}</b>/{groupNames.length}</span>
        </div>
        {/* 부서별 (11부서) — depts 섹션 활성 시 */}
        <div className="flex items-start gap-1 flex-wrap">
          <span className="text-[9px] font-bold text-emerald-700 mt-0.5 whitespace-nowrap">🏢 부서별:</span>
          {COMPANY_DEPT.map(d => (
            <FilterChip
              key={d}
              active={deptFilter.has(d)}
              color="#059669"
              bg="#ecfdf5"
              onClick={() => setDeptFilter(prev => toggleFrom(prev, d))}
            >{d}</FilterChip>
          ))}
          {section !== 'depts' && (
            <span className="text-[9px] text-gray-400 ml-auto italic">부서(13부서) 섹션에서 활성</span>
          )}
        </div>
        {/* 급수별 — 일반/전문/교육 */}
        <div className="flex items-start gap-1 flex-wrap">
          <span className="text-[9px] font-bold text-violet-700 mt-0.5 whitespace-nowrap">🎖️ 급수별:</span>
          {WORK_CAT3.map(g => (
            <FilterChip
              key={g}
              active={gradeFilter.has(g)}
              color="#7c3aed"
              bg="#f5f3ff"
              onClick={() => setGradeFilter(prev => toggleFrom(prev, g))}
            >{g}</FilterChip>
          ))}
          <span className="text-[9px] font-bold text-orange-700 mt-0.5 ml-2 whitespace-nowrap">세부급수:</span>
          {WORK_CAT4.map(g => (
            <FilterChip
              key={g}
              active={gradeFilter.has(g)}
              color="#ea580c"
              bg="#fff7ed"
              onClick={() => setGradeFilter(prev => toggleFrom(prev, g))}
            >{g}</FilterChip>
          ))}
          <span className="text-[9px] text-gray-400 ml-auto italic">참고 축 (현재 시드 미태깅)</span>
        </div>
        {/* 직급별 (ranks 섹션 그룹명) */}
        {section === 'ranks' && (
          <div className="flex items-start gap-1 flex-wrap">
            <span className="text-[9px] font-bold text-red-700 mt-0.5 whitespace-nowrap">👤 직급별:</span>
            {Object.keys(HR_SEED_RANKS).map(r => (
              <FilterChip
                key={r}
                active={rankFilter.has(r)}
                color="#dc2626"
                bg="#fef2f2"
                onClick={() => setRankFilter(prev => toggleFrom(prev, r))}
              >{r}</FilterChip>
            ))}
            {(deptFilter.size > 0 || gradeFilter.size > 0 || rankFilter.size > 0) && (
              <button
                onClick={() => { setDeptFilter(new Set()); setGradeFilter(new Set()); setRankFilter(new Set()); }}
                className="ml-auto rounded border border-gray-300 bg-white text-gray-600 px-1.5 py-0.5 text-[9px] font-semibold hover:bg-gray-50"
              >✕ 필터 초기화</button>
            )}
          </div>
        )}
        {section !== 'ranks' && (deptFilter.size > 0 || gradeFilter.size > 0 || rankFilter.size > 0) && (
          <button
            onClick={() => { setDeptFilter(new Set()); setGradeFilter(new Set()); setRankFilter(new Set()); }}
            className="self-end rounded border border-gray-300 bg-white text-gray-600 px-1.5 py-0.5 text-[9px] font-semibold hover:bg-gray-50"
          >✕ 필터 초기화</button>
        )}
      </div>

      {/* 그룹 목록 — 그룹 2단 + 각 그룹 내부 고정·준고정·선택 3단 → 체감 2×3 = 6단 밀도 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
        {axisFiltered.map(name => {
          const g = groups[name];
          const hits = countHit(g);
          if (search && hits === 0) return null;
          const isOpen = shown.has(name);
          return (
            <div key={name} className="rounded-md border border-gray-200 bg-white overflow-hidden">
              <button onClick={() => toggleGroup(name)}
                className="flex w-full items-center gap-1 px-1.5 py-0.5 text-left hover:bg-gray-50 bg-gradient-to-r from-slate-50 to-white">
                {isOpen ? <ChevronDown className="h-2.5 w-2.5 text-gray-400" /> : <ChevronRight className="h-2.5 w-2.5 text-gray-400" />}
                <span className="text-[11px] font-bold text-gray-800 truncate">{name}</span>
                <span className="ml-1 text-[9px] text-red-500 font-semibold">고 {g.fixed.length}</span>
                <span className="text-[9px] text-amber-500 font-semibold">준 {g.semi.length}</span>
                <span className="text-[9px] text-sky-500 font-semibold">선 {g.opt.length}</span>
                {search && <span className="ml-auto text-[9px] text-blue-500 font-bold">{hits}</span>}
              </button>
              {isOpen && (
                <div className="grid grid-cols-3 gap-0.5 p-0.5 border-t border-gray-100 bg-gray-50/50">
                  <div className="rounded border border-red-200 bg-red-50/50">
                    <div className="px-1 py-px bg-red-100 border-b border-red-200 text-[9px] font-bold text-red-700">고정 ({g.fixed.length})</div>
                    <ul className="p-0.5 space-y-0.5">
                      {g.fixed.map((s, i) => (matchSearch(s) ? (
                        <li key={i} className="text-[9px] text-gray-700 leading-tight">{s}</li>
                      ) : null))}
                    </ul>
                  </div>
                  <div className="rounded border border-amber-200 bg-amber-50/50">
                    <div className="px-1 py-px bg-amber-100 border-b border-amber-200 text-[9px] font-bold text-amber-700">준고정 ({g.semi.length})</div>
                    <ul className="p-0.5 space-y-0.5">
                      {g.semi.map((s, i) => (matchSearch(s) ? (
                        <li key={i} className="text-[9px] text-gray-700 leading-tight">{s}</li>
                      ) : null))}
                    </ul>
                  </div>
                  <div className="rounded border border-sky-200 bg-sky-50/50">
                    <div className="px-1 py-px bg-sky-100 border-b border-sky-200 text-[9px] font-bold text-sky-700">선택 ({g.opt.length})</div>
                    <ul className="p-0.5 space-y-0.5">
                      {g.opt.map((s, i) => (matchSearch(s) ? (
                        <li key={i} className="text-[9px] text-gray-700 leading-tight">{s}</li>
                      ) : null))}
                    </ul>
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

/* ── 메인 페이지 ── */
export default function ClaudeRulesPage() {
  const [tab, setTab] = useState<'memory' | 'design' | 'claude' | 'hr'>('memory');

  return (
    <div className="flex flex-col gap-1.5 p-2">
      {/* 목적 배너 — 눈에 띄게 */}
      <div className="rounded-md border-2 border-dashed border-violet-400 bg-gradient-to-r from-violet-50 via-indigo-50 to-blue-50 px-2 py-1">
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-violet-600 px-1.5 py-0.5 text-[10px] font-bold text-white">TEST PAGE</span>
          <span className="text-[13px] font-bold text-violet-800">규정 (임시_혁_test)</span>
        </div>
        <div className="mt-0.5 flex flex-col gap-0.5 text-[10px] text-violet-600">
          <span>1. Claude Code가 어떤 규정들을 메모리로 학습하였는지 <b>한 눈에 보기</b> 위함</span>
          <span>2. 규정들을 어떻게 적용해서 페이지를 만드는지 <b>테스트해보는 페이지</b></span>
          <span>3. 적용되지 않은 것 같은 규정이 있다면, 우측 상단의 <b>Memo</b>에 추가해주세요.</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex gap-1 flex-wrap">
          <TabChip active={tab === 'memory'} onClick={() => setTab('memory')}>🧠 공용 메모리 (원본)</TabChip>
          <TabChip active={tab === 'design'} onClick={() => setTab('design')}>업무 설계 규정</TabChip>
          <TabChip active={tab === 'claude'} onClick={() => setTab('claude')}>Claude Code 작업 규정</TabChip>
          <TabChip active={tab === 'hr'} onClick={() => setTab('hr')}>인사규정 (가연님 xlsx)</TabChip>
        </div>
      </div>

      {tab === 'memory' ? <PublicMemoryTab />
        : tab === 'design' ? <DesignRulesTab />
        : tab === 'claude' ? <ClaudeRulesTab />
        : <HRRulesTab />}
    </div>
  );
}
