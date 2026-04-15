import { useEffect, useState, useMemo } from 'react';
import { Plus, X, Check } from 'lucide-react';
import { toast } from 'sonner';
import { fetchAllTaxonomy, saveTaxonomyNode, updateTaxonomyNode, softDeleteTaxonomyNode } from '../api';
import type { TaxonomyNode, TaxonomyScope, TaxonomyGov, TaxonomyLevel } from '../taxonomyTypes';
import { allowedAxes } from '../taxonomyTypes';

interface Props {
  scope: TaxonomyScope;
  gov: TaxonomyGov;
  axes: string[];
}

// 공통 축(분야·급수·홈페이지·부서·등급)은 항상 (common, common) 에서 읽고 쓴다.
// 현재 Lens/Gov 는 로컬 축에만 적용 — 공통 축은 모든 Lens 에서 동일 SoT 를 공유.
const COMMON_AXES = allowedAxes('common', 'common');
const isCommonAxis = (a: string) => COMMON_AXES.includes(a);

// 3-column picker — 대 클릭 → 중 필터 → 소 필터.
// 인터랙션: 단일 클릭 = 선택(필터), 더블 클릭 = 이름 수정, 우측 × = 삭제.
export default function TaxonomyTreeEditor({ scope, gov, axes }: Props) {
  const [axis, setAxis] = useState(axes[0] || '');
  const [allNodes, setAllNodes] = useState<TaxonomyNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selLargeId, setSelLargeId] = useState<string | null>(null);
  const [selMediumId, setSelMediumId] = useState<string | null>(null);

  useEffect(() => { if (axes.length && !axes.includes(axis)) setAxis(axes[0]); /* eslint-disable-next-line */ }, [axes]);

  const reload = async () => {
    setLoading(true);
    try {
      const data = await fetchAllTaxonomy();
      setAllNodes(data);
      setError(null);
    } catch (e: any) {
      setError(String(e.message || e));
      setAllNodes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { reload(); /* eslint-disable-next-line */ }, []);
  useEffect(() => { setSelLargeId(null); setSelMediumId(null); }, [axis, scope, gov]);
  useEffect(() => { setSelMediumId(null); }, [selLargeId]);

  const effScope: TaxonomyScope = isCommonAxis(axis) ? 'common' : scope;
  const effGov: TaxonomyGov = isCommonAxis(axis) ? 'common' : gov;

  const byOrder = (a: TaxonomyNode, b: TaxonomyNode) => a.sort_order - b.sort_order || a.label.localeCompare(b.label);

  const nodes = useMemo(
    () => allNodes.filter((n) => n.axis === axis && n.scope === effScope && n.gov === effGov),
    [allNodes, axis, effScope, effGov],
  );

  const larges  = useMemo(() => nodes.filter((n) => n.level === 'large').sort(byOrder), [nodes]);
  const mediums = useMemo(() => nodes.filter((n) => n.level === 'medium' && n.parent_id === selLargeId).sort(byOrder), [nodes, selLargeId]);
  const smalls  = useMemo(() => nodes.filter((n) => n.level === 'small'  && n.parent_id === selMediumId).sort(byOrder), [nodes, selMediumId]);

  // 각 축의 노드 수 — 탭 버튼 옆 표시
  const axisCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const a of axes) {
      const es = isCommonAxis(a) ? 'common' : scope;
      const eg = isCommonAxis(a) ? 'common' : gov;
      counts[a] = allNodes.filter((n) => n.axis === a && n.scope === es && n.gov === eg).length;
    }
    return counts;
  }, [allNodes, axes, scope, gov]);

  const addNode = async (level: TaxonomyLevel, parentId: string | null, label: string) => {
    const list = level === 'large' ? larges : level === 'medium' ? mediums : smalls;
    const max = list.reduce((m, n) => Math.max(m, n.sort_order), -1);
    try {
      await saveTaxonomyNode({
        scope: effScope, gov: effGov, axis, level, parent_id: parentId,
        label, sort_order: max + 1, source: 'user', locked: 0,
      } as any);
      toast.success(`추가: ${label}`);
      await reload();
    } catch (e: any) {
      toast.error(`추가 실패: ${e.message || e}`);
    }
  };

  const renameNode = async (n: TaxonomyNode, label: string) => {
    if (!label || label === n.label) return;
    try {
      await updateTaxonomyNode(n.taxonomy_id, {
        ...n, label, source: 'user', locked: 0, revision: n.revision,
      } as any);
      toast.success(`수정: ${n.label} → ${label}`);
      await reload();
    } catch (e: any) {
      if (String(e.message).includes('409')) toast.error('다른 세션이 먼저 수정함, 새로고침 필요');
      else toast.error(`수정 실패: ${e.message || e}`);
    }
  };

  const deleteNode = async (n: TaxonomyNode) => {
    if (!confirm(`삭제: "${n.label}" ${n.level !== 'small' ? '(하위 항목은 남음)' : ''} ?`)) return;
    try {
      await softDeleteTaxonomyNode(n.taxonomy_id);
      toast.success(`삭제: ${n.label}`);
      if (n.taxonomy_id === selLargeId) setSelLargeId(null);
      if (n.taxonomy_id === selMediumId) setSelMediumId(null);
      await reload();
    } catch (e: any) {
      toast.error(`삭제 실패: ${e.message || e}`);
    }
  };

  if (axes.length === 0) {
    return <div className="text-[11px] text-rose-600 px-2 py-1">이 (scope×gov) 조합은 허용 축이 없습니다.</div>;
  }

  return (
    <div className="space-y-1">
      {/* 축 tab 바 — 각 축 옆에 노드 수 + 공통 축 표시 */}
      <div className="flex items-center gap-1 flex-wrap border-b border-slate-200 dark:border-slate-700 pb-1">
        <span className="text-[10px] font-bold text-slate-500 mr-1">축</span>
        {axes.map((a) => {
          const active = axis === a;
          const count = axisCounts[a] ?? 0;
          const common = isCommonAxis(a);
          return (
            <button
              key={a}
              onClick={() => setAxis(a)}
              title={common ? '공통 축 · scope=common gov=common' : `${scope} · ${gov}`}
              className={[
                'inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded border',
                active
                  ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-600',
              ].join(' ')}
            >
              {common && <span className="text-[8px] opacity-70">🌐</span>}
              <span>{a}</span>
              <span className={[
                'text-[9px] tabular-nums px-1 rounded',
                active
                  ? 'bg-white/20 text-white dark:bg-slate-900/20 dark:text-slate-900'
                  : count > 0
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                    : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500',
              ].join(' ')}>{count}</span>
            </button>
          );
        })}
        <span className="ml-auto text-[10px] text-slate-500">
          현재: <b>{axis}</b> · {isCommonAxis(axis) ? 'common|common' : `${scope}|${gov}`} · {nodes.length} 노드
        </span>
      </div>

      {error && (
        <div className="text-[10px] text-rose-600 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded p-1.5">
          DB 오류: {error}
        </div>
      )}
      {loading && <div className="text-[10px] text-slate-500 px-1">불러오는 중...</div>}

      {/* 3-column picker */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-1.5">
        <Column
          title="📁 대 카테고리"
          items={larges}
          selectedId={selLargeId}
          onSelect={(id) => setSelLargeId(id)}
          onRename={renameNode}
          onDelete={deleteNode}
          onAdd={(label) => addNode('large', null, label)}
          color="emerald"
        />
        <Column
          title="📂 중 카테고리"
          items={mediums}
          selectedId={selMediumId}
          onSelect={(id) => setSelMediumId(id)}
          onRename={renameNode}
          onDelete={deleteNode}
          onAdd={async (label) => { if (selLargeId) await addNode('medium', selLargeId, label); }}
          color="sky"
          placeholder={selLargeId ? null : '← 대 카테고리 선택'}
        />
        <Column
          title="📄 소 카테고리"
          items={smalls}
          selectedId={null}
          onSelect={() => undefined}
          onRename={renameNode}
          onDelete={deleteNode}
          onAdd={async (label) => { if (selMediumId) await addNode('small', selMediumId, label); }}
          color="violet"
          placeholder={
            !selLargeId ? '← 대 카테고리 선택' :
            !selMediumId ? '← 중 카테고리 선택' : null
          }
        />
      </div>

      <div className="text-[10px] text-slate-500 px-1 pt-1 border-t border-dashed border-slate-300 dark:border-slate-600">
        단일 클릭=선택(필터) · <b>더블 클릭=이름 수정</b> · X=삭제 · 각 열 하단 [+ 추가]
      </div>
    </div>
  );
}

interface ColumnProps {
  title: string;
  items: TaxonomyNode[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onRename: (n: TaxonomyNode, label: string) => Promise<void> | void;
  onDelete: (n: TaxonomyNode) => Promise<void> | void;
  onAdd: (label: string) => Promise<void> | void;
  color: 'emerald' | 'sky' | 'violet';
  placeholder?: string | null;
}

function Column(p: ColumnProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [adding, setAdding] = useState(false);
  const [addText, setAddText] = useState('');

  const bgSel = { emerald: 'bg-emerald-100 dark:bg-emerald-900/40 border-emerald-400',
                  sky:     'bg-sky-100 dark:bg-sky-900/40 border-sky-400',
                  violet:  'bg-violet-100 dark:bg-violet-900/40 border-violet-400' }[p.color];
  const btnColor = { emerald: 'text-emerald-600 border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30',
                     sky:     'text-sky-600 border-sky-300 hover:bg-sky-50 dark:hover:bg-sky-950/30',
                     violet:  'text-violet-600 border-violet-300 hover:bg-violet-50 dark:hover:bg-violet-950/30' }[p.color];

  const commitRename = (n: TaxonomyNode) => {
    const label = editText.trim();
    if (label && label !== n.label) p.onRename(n, label);
    setEditingId(null);
  };
  const commitAdd = () => {
    const label = addText.trim();
    if (label) p.onAdd(label);
    setAddText('');
    setAdding(false);
  };

  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-900">
      <div className="text-[10px] font-bold text-slate-600 dark:text-slate-300 px-1.5 py-1 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
        {p.title} <span className="text-slate-400 tabular-nums">({p.items.length})</span>
      </div>
      <ul className="p-1 space-y-0.5 min-h-[60px] max-h-[400px] overflow-y-auto">
        {p.placeholder ? (
          <li className="text-[10px] text-slate-400 text-center py-4">{p.placeholder}</li>
        ) : p.items.length === 0 ? (
          <li className="text-[10px] text-slate-400 text-center py-2">항목 없음</li>
        ) : (
          p.items.map((n) => {
            const isEditing = editingId === n.taxonomy_id;
            const isSelected = p.selectedId === n.taxonomy_id;
            if (isEditing) {
              return (
                <li key={n.taxonomy_id}>
                  <input
                    autoFocus
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onBlur={() => commitRename(n)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') commitRename(n);
                      if (e.key === 'Escape') setEditingId(null);
                    }}
                    className="text-[10px] w-full px-1 py-0.5 rounded border border-emerald-400 bg-white dark:bg-slate-800"
                  />
                </li>
              );
            }
            return (
              <li
                key={n.taxonomy_id}
                className={[
                  'group flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded border cursor-pointer select-none',
                  isSelected
                    ? bgSel
                    : 'bg-white dark:bg-slate-800 border-transparent hover:bg-slate-100 dark:hover:bg-slate-700',
                ].join(' ')}
                onClick={() => p.onSelect(n.taxonomy_id)}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  setEditingId(n.taxonomy_id);
                  setEditText(n.label);
                }}
                title="더블 클릭하여 이름 수정"
              >
                <span className="flex-1 truncate">{n.label}</span>
                {n.locked === 1 && <span className="text-[8px] text-slate-400 mr-0.5" title="seed">🔒</span>}
                <button
                  onClick={(e) => { e.stopPropagation(); p.onDelete(n); }}
                  className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-500 rounded"
                  title="삭제"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </li>
            );
          })
        )}

        {!p.placeholder && (
          adding ? (
            <li>
              <div className="flex items-center gap-0.5">
                <input
                  autoFocus
                  value={addText}
                  onChange={(e) => setAddText(e.target.value)}
                  onBlur={commitAdd}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') commitAdd();
                    if (e.key === 'Escape') { setAdding(false); setAddText(''); }
                  }}
                  placeholder="새 항목"
                  className={`flex-1 text-[10px] px-1 py-0.5 rounded border ${btnColor}`}
                />
                <Check className="h-2.5 w-2.5 text-emerald-600" />
              </div>
            </li>
          ) : (
            <li>
              <button
                onClick={() => { setAdding(true); setAddText(''); }}
                className={`w-full inline-flex items-center justify-center gap-0.5 text-[10px] py-0.5 rounded border border-dashed ${btnColor}`}
              >
                <Plus className="h-2.5 w-2.5" /> 추가
              </button>
            </li>
          )
        )}
      </ul>
    </div>
  );
}
