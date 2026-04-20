import { useEffect, useMemo, useState } from 'react';
import {
  RefreshCw, X, Search, Layers3, Grid3x3, Package,
  Focus, Shield, Compass, ListTree, CornerDownRight, Tag, Tags, Sprout, Lock, Trash2,
  ArrowDown, ArrowRight, Ruler,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  fetchAllTaxonomy, fetchItems,
  updateTaxonomyNode, softDeleteTaxonomyNode, softDeleteItem,
} from '../api';
import type {
  TaxonomyNode, TaxonomyScope, TaxonomyGov, TaxonomyLevel,
} from '../taxonomyTypes';
import { ALLOWED_AXES } from '../taxonomyTypes';

// 전체 테이블 — 렌즈/거버넌스/편집영역 종합 뷰.
// scope·gov·axis·level 을 모드가 아닌 옵셔널 멀티선택 필터로 전환, 전 노드를 한 화면에서 관찰·편집·삭제.

const SCOPES: TaxonomyScope[]  = ['ai-studio', 'work-studio', 'homepage', 'common'];
const GOVS: TaxonomyGov[]      = ['company-rule', 'work-guide', 'homepage', 'common'];
const LEVELS: TaxonomyLevel[]  = ['large', 'medium', 'small', 'flat'];
const ALL_AXES = Array.from(new Set(Object.values(ALLOWED_AXES).flat()));
const LEVEL_ORDER: Record<TaxonomyLevel, number> = { large: 0, medium: 1, small: 2, flat: 3 };

type Kind = 'taxonomy' | 'items' | 'mandalart';

interface MandalartRaw {
  mandalart_id: string;
  data: {
    size?: { rows: number; cols: number };
    cells?: Array<{ id: string; text: string; taxonomy_id?: string; axis?: string; level?: TaxonomyLevel }>;
  };
  revision: number;
}

export default function AllTableTab() {
  const [kind, setKind] = useState<Kind>('taxonomy');
  const [fScope, setFScope] = useState<Set<string>>(new Set());
  const [fGov, setFGov]     = useState<Set<string>>(new Set());
  const [fAxis, setFAxis]   = useState<Set<string>>(new Set());
  const [fLevel, setFLevel] = useState<Set<string>>(new Set());
  const [q, setQ] = useState('');

  const [taxNodes, setTaxNodes] = useState<TaxonomyNode[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [mandalarts, setMandalarts] = useState<MandalartRaw[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const reload = async () => {
    setLoading(true);
    try {
      const [tax, itemData, mandaRes] = await Promise.all([
        fetchAllTaxonomy(),
        fetchItems(),
        fetch('/api/work-class-mandalart').then((r) => r.ok ? r.json() : []),
      ]);
      setTaxNodes(tax);
      setItems(itemData as any[]);
      const mandaArr: MandalartRaw[] = Array.isArray(mandaRes)
        ? mandaRes.map((r: any) => ({
            mandalart_id: r.mandalart_id,
            data: typeof r.data === 'string'
              ? (() => { try { return JSON.parse(r.data); } catch { return {}; } })()
              : (r.data || {}),
            revision: Number(r.revision || 1),
          }))
        : [];
      setMandalarts(mandaArr);
      setError(null);
    } catch (e: any) {
      setError(String(e.message || e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { reload(); }, []);

  const taxMap = useMemo(() => {
    const m: Record<string, TaxonomyNode> = {};
    taxNodes.forEach((n) => { m[n.taxonomy_id] = n; });
    return m;
  }, [taxNodes]);

  const parentPath = useMemo(() => {
    const cache: Record<string, string> = {};
    const walk = (n: TaxonomyNode): string => {
      if (cache[n.taxonomy_id] !== undefined) return cache[n.taxonomy_id];
      if (!n.parent_id) { cache[n.taxonomy_id] = ''; return ''; }
      const p = taxMap[n.parent_id];
      if (!p) { cache[n.taxonomy_id] = ''; return ''; }
      const up = walk(p);
      const s = up ? `${up} > ${p.label}` : p.label;
      cache[n.taxonomy_id] = s;
      return s;
    };
    const out: Record<string, string> = {};
    taxNodes.forEach((n) => { out[n.taxonomy_id] = walk(n); });
    return out;
  }, [taxNodes, taxMap]);

  const filteredTax = useMemo(() => {
    let r = taxNodes;
    if (fScope.size) r = r.filter((n) => fScope.has(n.scope));
    if (fGov.size)   r = r.filter((n) => fGov.has(n.gov));
    if (fAxis.size)  r = r.filter((n) => fAxis.has(n.axis));
    if (fLevel.size) r = r.filter((n) => fLevel.has(n.level));
    if (q.trim()) {
      const s = q.trim().toLowerCase();
      r = r.filter((n) =>
        n.label.toLowerCase().includes(s) ||
        (parentPath[n.taxonomy_id] || '').toLowerCase().includes(s) ||
        n.axis.toLowerCase().includes(s),
      );
    }
    return [...r].sort((a, b) =>
      a.scope.localeCompare(b.scope) ||
      a.gov.localeCompare(b.gov) ||
      a.axis.localeCompare(b.axis) ||
      (LEVEL_ORDER[a.level] - LEVEL_ORDER[b.level]) ||
      a.sort_order - b.sort_order ||
      a.label.localeCompare(b.label),
    );
  }, [taxNodes, fScope, fGov, fAxis, fLevel, q, parentPath]);

  const filteredItems = useMemo(() => {
    let r = items;
    if (fScope.size) r = r.filter((i) => fScope.has(i.scope));
    if (q.trim()) {
      const s = q.trim().toLowerCase();
      r = r.filter((i) => (i.label || '').toLowerCase().includes(s));
    }
    return r;
  }, [items, fScope, q]);

  const mandalartRows = useMemo(() => {
    const rows: Array<{
      mandalart_id: string; scope: string; gov: string; size: string;
      r: number; c: number;
      cellId: string; label: string; axis?: string; level?: TaxonomyLevel; taxonomy_id?: string;
    }> = [];
    mandalarts.forEach((m) => {
      const parts = m.mandalart_id.split('|');
      const scope = parts[0] || '';
      const gov = parts[1] || '';
      const size = parts[2] || '';
      const cells = m.data?.cells || [];
      const cols = m.data?.size?.cols || 0;
      cells.forEach((cell, idx) => {
        const tx = cell.taxonomy_id ? taxMap[cell.taxonomy_id] : null;
        rows.push({
          mandalart_id: m.mandalart_id,
          scope, gov, size,
          r: cols ? Math.floor(idx / cols) : 0,
          c: cols ? (idx % cols) : idx,
          cellId: cell.id,
          label: tx?.label || cell.text || '',
          axis: cell.axis || tx?.axis,
          level: cell.level || tx?.level,
          taxonomy_id: cell.taxonomy_id,
        });
      });
    });
    let r = rows;
    if (fScope.size) r = r.filter((x) => fScope.has(x.scope));
    if (fGov.size)   r = r.filter((x) => fGov.has(x.gov));
    if (fAxis.size)  r = r.filter((x) => x.axis && fAxis.has(x.axis));
    if (fLevel.size) r = r.filter((x) => x.level && fLevel.has(x.level));
    if (q.trim()) {
      const s = q.trim().toLowerCase();
      r = r.filter((x) => x.label.toLowerCase().includes(s));
    }
    return r;
  }, [mandalarts, taxMap, fScope, fGov, fAxis, fLevel, q]);

  const commitEdit = async (n: TaxonomyNode) => {
    const label = editText.trim();
    setEditingId(null);
    if (!label || label === n.label) return;
    try {
      await updateTaxonomyNode(n.taxonomy_id, {
        ...n, label, source: 'user', locked: 0, revision: n.revision,
      } as any);
      toast.success(`수정: ${n.label} → ${label}`);
      reload();
    } catch (e: any) {
      if (String(e.message).includes('409')) toast.error('다른 세션이 먼저 수정함, 새로고침 필요');
      else toast.error(`수정 실패: ${e.message || e}`);
    }
  };

  const delNode = async (n: TaxonomyNode) => {
    if (!confirm(`삭제: "${n.label}" ${n.level !== 'small' && n.level !== 'flat' ? '(하위 항목은 남음)' : ''} ?`)) return;
    try {
      await softDeleteTaxonomyNode(n.taxonomy_id);
      toast.success(`삭제: ${n.label}`);
      reload();
    } catch (e: any) {
      toast.error(`삭제 실패: ${e.message || e}`);
    }
  };

  const delItem = async (id: string, label: string) => {
    if (!confirm(`삭제: "${label}" ?`)) return;
    try {
      await softDeleteItem(id);
      toast.success(`삭제: ${label}`);
      reload();
    } catch (e: any) {
      toast.error(`삭제 실패: ${e.message || e}`);
    }
  };

  const toggleSet = (set: Set<string>, setter: (s: Set<string>) => void, v: string) => {
    const next = new Set(set);
    if (next.has(v)) next.delete(v); else next.add(v);
    setter(next);
  };

  const resetAll = () => {
    setFScope(new Set()); setFGov(new Set()); setFAxis(new Set()); setFLevel(new Set()); setQ('');
  };

  const manCellTotal = mandalarts.reduce((s, m) => s + (m.data?.cells?.length || 0), 0);
  const preTotal  = kind === 'taxonomy' ? taxNodes.length : kind === 'items' ? items.length : manCellTotal;
  const curTotal  = kind === 'taxonomy' ? filteredTax.length : kind === 'items' ? filteredItems.length : mandalartRows.length;

  return (
    <div className="space-y-2 text-slate-800 dark:text-slate-100">
      {/* 헤더 */}
      <div className="flex items-center gap-2 flex-wrap px-1">
        <Layers3 className="h-3.5 w-3.5 text-emerald-600" />
        <span className="text-[11px] font-bold">전체 테이블</span>
        <span className="text-[10px] text-slate-500">
          scope · gov · axis · level 합집합. 렌즈/거버넌스/편집영역 전부 한 화면
        </span>
        <button
          onClick={reload}
          className="ml-auto inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded border border-slate-300 hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-800"
          title="새로고침"
        >
          <RefreshCw className={`h-2.5 w-2.5 ${loading ? 'animate-spin' : ''}`} /> 새로고침
        </button>
      </div>

      {/* 종류 토글 */}
      <div className="flex flex-wrap gap-1 px-1">
        {([
          { code: 'taxonomy',  label: '분류 노드',     icon: Layers3, count: taxNodes.length },
          { code: 'items',     label: '아이템',        icon: Package, count: items.length },
          { code: 'mandalart', label: '만다라트 셀',   icon: Grid3x3, count: manCellTotal },
        ] as { code: Kind; label: string; icon: any; count: number }[]).map((t) => {
          const Icon = t.icon;
          const active = kind === t.code;
          return (
            <button
              key={t.code}
              onClick={() => setKind(t.code)}
              className={[
                'inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md border',
                active
                  ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-600',
              ].join(' ')}
            >
              <Icon className="h-3 w-3" /> {t.label}
              <span className={[
                'text-[9px] tabular-nums px-1 rounded ml-0.5',
                active
                  ? 'bg-white/20 text-white dark:bg-slate-900/20 dark:text-slate-900'
                  : t.count > 0
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                    : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500',
              ].join(' ')}>{t.count}</span>
            </button>
          );
        })}
      </div>

      {/* 필터 바 */}
      <div className="border border-slate-200 dark:border-slate-700 rounded p-1 space-y-0.5 bg-slate-50/50 dark:bg-slate-900/40">
        <FilterRow icon={Focus}    label="렌즈"     sub="scope" values={SCOPES as any}  active={fScope} onToggle={(v) => toggleSet(fScope, setFScope, v)} />
        <FilterRow icon={Shield}   label="거버넌스" sub="gov"   values={GOVS as any}    active={fGov}   onToggle={(v) => toggleSet(fGov, setFGov, v)} />
        <FilterRow icon={Compass}  label="축"       sub="axis"  values={ALL_AXES}       active={fAxis}  onToggle={(v) => toggleSet(fAxis, setFAxis, v)} />
        <FilterRow icon={ListTree} label="계층"     sub="level" values={LEVELS as any}  active={fLevel} onToggle={(v) => toggleSet(fLevel, setFLevel, v)} />
        <div className="flex items-center gap-1 pt-0.5">
          <span className="text-[10px] font-bold text-slate-500 min-w-[40px]">검색</span>
          <div className="relative flex-1">
            <Search className="absolute left-1 top-1/2 -translate-y-1/2 h-2.5 w-2.5 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="label / 경로 / axis 부분일치"
              className="w-full text-[10px] pl-5 pr-5 py-0.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
            />
            {q && (
              <button onClick={() => setQ('')} className="absolute right-1 top-1/2 -translate-y-1/2" title="clear">
                <X className="h-2.5 w-2.5 text-slate-400 hover:text-rose-500" />
              </button>
            )}
          </div>
          <button
            onClick={resetAll}
            className="text-[10px] px-1.5 py-0.5 rounded border border-slate-300 text-slate-600 hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-800"
          >
            필터 초기화
          </button>
          <span className="text-[10px] tabular-nums text-slate-500 whitespace-nowrap">
            {curTotal}/{preTotal}
          </span>
        </div>
      </div>

      {error && (
        <div className="text-[10px] text-rose-600 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded p-1.5">
          DB 오류: {error}
        </div>
      )}

      {kind === 'taxonomy' && (
        <TaxonomyTable
          rows={filteredTax}
          parentPath={parentPath}
          editingId={editingId}
          editText={editText}
          onStartEdit={(n) => { setEditingId(n.taxonomy_id); setEditText(n.label); }}
          onChangeEdit={setEditText}
          onCommitEdit={commitEdit}
          onCancelEdit={() => setEditingId(null)}
          onDelete={delNode}
        />
      )}
      {kind === 'items' && (
        <ItemsTable rows={filteredItems} taxMap={taxMap} onDelete={delItem} />
      )}
      {kind === 'mandalart' && (
        <MandalartTable rows={mandalartRows} />
      )}

      <div className="text-[10px] text-slate-500 px-1 pt-1 border-t border-dashed border-slate-300 dark:border-slate-600 space-y-0.5">
        <div><b>더블클릭</b> = 이름 수정 · hover → <b>×</b> = 삭제 · 필터 칩 = 멀티 선택(OR) · 신규 추가는 개별 편집 탭 사용</div>
        <div className="text-slate-400">
          <b>용어</b> — 렌즈(scope)=적용 범위 · 거버넌스(gov)=규정축 · 축(axis)=분류 축 · 계층(level)=대/중/소/flat · 출처(src)=seed/user/migration
        </div>
      </div>
    </div>
  );
}

function FilterRow({ icon: Icon, label, sub, values, active, onToggle }: {
  icon: any;
  label: string;
  sub?: string;
  values: string[];
  active: Set<string>;
  onToggle: (v: string) => void;
}) {
  return (
    <div className="flex items-start gap-1">
      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-slate-500 min-w-[70px] pt-0.5" title={sub}>
        <Icon className="h-2.5 w-2.5" />
        {label}
        {sub && <span className="text-[9px] font-normal text-slate-400">({sub})</span>}
      </span>
      <div className="flex-1 flex flex-wrap gap-0.5">
        {values.map((v) => {
          const on = active.has(v);
          return (
            <button
              key={v}
              onClick={() => onToggle(v)}
              className={[
                'text-[10px] px-1.5 py-0 rounded border transition-colors',
                on
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600',
              ].join(' ')}
            >
              {v}
            </button>
          );
        })}
        {active.size > 0 && (
          <button
            onClick={() => active.forEach((v) => onToggle(v))}
            className="text-[9px] px-1 py-0 rounded border border-dashed border-slate-300 text-slate-500 hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-800"
            title="이 행 해제"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}

function TaxonomyTable(props: {
  rows: TaxonomyNode[];
  parentPath: Record<string, string>;
  editingId: string | null;
  editText: string;
  onStartEdit: (n: TaxonomyNode) => void;
  onChangeEdit: (s: string) => void;
  onCommitEdit: (n: TaxonomyNode) => void;
  onCancelEdit: () => void;
  onDelete: (n: TaxonomyNode) => void;
}) {
  const { rows, parentPath, editingId, editText, onStartEdit, onChangeEdit, onCommitEdit, onCancelEdit, onDelete } = props;
  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded max-h-[calc(100vh-280px)] overflow-auto">
      <table className="w-full text-[10px] border-collapse">
        <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800 z-10">
          <tr className="text-slate-600 dark:text-slate-300">
            <Th icon={Focus}            title="scope · 적용 렌즈">렌즈</Th>
            <Th icon={Shield}           title="gov · 거버넌스(규정축)">거버넌스</Th>
            <Th icon={Compass}          title="axis · 분류 축">축</Th>
            <Th icon={ListTree}         title="level · 대/중/소/flat">계층</Th>
            <Th icon={CornerDownRight}  title="부모 → 본 노드 경로">상위 경로</Th>
            <Th icon={Tag}              title="label · 분류 이름">이름</Th>
            <Th icon={Sprout}           title="source · seed / user / migration">출처</Th>
            <Th icon={Lock}             title="잠김(seed 기본 고정)" className="w-4" noLabel />
            <Th icon={Trash2}           title="삭제" className="w-4" noLabel />
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr><td colSpan={9} className="text-center text-[10px] text-slate-400 py-3">노드 없음</td></tr>
          ) : rows.map((n) => {
            const isEditing = editingId === n.taxonomy_id;
            return (
              <tr key={n.taxonomy_id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800">
                <Td>{n.scope}</Td>
                <Td>{n.gov}</Td>
                <Td>{n.axis}</Td>
                <Td><LevelBadge level={n.level} /></Td>
                <Td className="text-slate-500 max-w-[220px] truncate" title={parentPath[n.taxonomy_id]}>{parentPath[n.taxonomy_id] || ''}</Td>
                <Td>
                  {isEditing ? (
                    <input
                      autoFocus
                      value={editText}
                      onChange={(e) => onChangeEdit(e.target.value)}
                      onBlur={() => onCommitEdit(n)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') onCommitEdit(n);
                        if (e.key === 'Escape') onCancelEdit();
                      }}
                      className="w-full text-[10px] px-1 py-0 rounded border border-emerald-400 bg-white dark:bg-slate-800"
                    />
                  ) : (
                    <span
                      onDoubleClick={() => onStartEdit(n)}
                      className="cursor-text font-medium"
                      title="더블클릭 = 이름 수정"
                    >
                      {n.emoji && <span className="mr-0.5">{n.emoji}</span>}{n.label}
                    </span>
                  )}
                </Td>
                <Td className="text-slate-500">{n.source}</Td>
                <Td>{n.locked ? '🔒' : ''}</Td>
                <Td>
                  <button
                    onClick={() => onDelete(n)}
                    className="opacity-0 group-hover:opacity-100 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900/40 rounded p-0.5"
                    title="삭제"
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                </Td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function ItemsTable({ rows, taxMap, onDelete }: {
  rows: any[];
  taxMap: Record<string, TaxonomyNode>;
  onDelete: (id: string, label: string) => void;
}) {
  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded max-h-[calc(100vh-280px)] overflow-auto">
      <table className="w-full text-[10px] border-collapse">
        <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800 z-10">
          <tr className="text-slate-600 dark:text-slate-300">
            <Th icon={Tag}     title="label · 아이템 이름">이름</Th>
            <Th icon={Focus}   title="scope · 적용 렌즈">렌즈</Th>
            <Th icon={Tags}    title="facets · 축별 분류값 (axis: label)">분류값</Th>
            <Th icon={Sprout}  title="source">출처</Th>
            <Th icon={Trash2}  title="삭제" className="w-4" noLabel />
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr><td colSpan={5} className="text-center text-[10px] text-slate-400 py-3">아이템 없음</td></tr>
          ) : rows.map((it) => (
            <tr key={it.item_id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800">
              <Td className="font-medium">{it.label}</Td>
              <Td>{it.scope}</Td>
              <Td>
                <div className="flex flex-wrap gap-0.5">
                  {Object.entries(it.facets || {}).map(([axis, txId]) => {
                    const tx = taxMap[txId as string];
                    return (
                      <span key={axis} className="text-[9px] px-1 py-0 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {axis}: {tx?.label || String(txId).slice(0, 6)}
                      </span>
                    );
                  })}
                </div>
              </Td>
              <Td className="text-slate-500">{it.source}</Td>
              <Td>
                <button
                  onClick={() => onDelete(it.item_id, it.label)}
                  className="opacity-0 group-hover:opacity-100 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900/40 rounded p-0.5"
                  title="삭제"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MandalartTable({ rows }: { rows: any[] }) {
  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded max-h-[calc(100vh-280px)] overflow-auto">
      <table className="w-full text-[10px] border-collapse">
        <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800 z-10">
          <tr className="text-slate-600 dark:text-slate-300">
            <Th icon={Focus}       title="scope · 적용 렌즈">렌즈</Th>
            <Th icon={Shield}      title="gov · 거버넌스">거버넌스</Th>
            <Th icon={Ruler}       title="만다라트 크기 (rows×cols)">크기</Th>
            <Th icon={ArrowDown}   title="행 index" className="w-8">행</Th>
            <Th icon={ArrowRight}  title="열 index" className="w-8">열</Th>
            <Th icon={Tag}         title="label · 셀 라벨">이름</Th>
            <Th icon={Compass}     title="axis · 분류 축">축</Th>
            <Th icon={ListTree}    title="level · 계층">계층</Th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr><td colSpan={8} className="text-center text-[10px] text-slate-400 py-3">셀 없음</td></tr>
          ) : rows.map((x, i) => (
            <tr key={`${x.mandalart_id}-${x.cellId}-${i}`} className="hover:bg-slate-50 dark:hover:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800">
              <Td>{x.scope}</Td>
              <Td>{x.gov}</Td>
              <Td>{x.size}</Td>
              <Td className="tabular-nums text-slate-500">{x.r}</Td>
              <Td className="tabular-nums text-slate-500">{x.c}</Td>
              <Td className="font-medium">{x.label || <span className="text-slate-400 italic">비어있음</span>}</Td>
              <Td>{x.axis || ''}</Td>
              <Td>{x.level ? <LevelBadge level={x.level} /> : ''}</Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Th({ children, className, icon: Icon, title, noLabel }: {
  children?: any;
  className?: string;
  icon?: any;
  title?: string;
  noLabel?: boolean;
}) {
  return (
    <th
      className={`text-left font-bold px-1 py-0.5 border-b border-slate-300 dark:border-slate-600 whitespace-nowrap ${className || ''}`}
      title={title}
    >
      <span className="inline-flex items-center gap-0.5">
        {Icon && <Icon className="h-2.5 w-2.5 opacity-80" />}
        {!noLabel && children}
      </span>
    </th>
  );
}

function Td({ children, className, title }: { children: any; className?: string; title?: string }) {
  return (
    <td className={`px-1 py-0 whitespace-nowrap ${className || ''}`} title={title}>
      {children}
    </td>
  );
}

function LevelBadge({ level }: { level: string }) {
  const c = ({
    large:  'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200',
    medium: 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200',
    small:  'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-200',
    flat:   'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
  } as Record<string, string>)[level] || 'bg-slate-100 text-slate-700';
  return <span className={`text-[9px] px-1 rounded ${c}`}>{level}</span>;
}
