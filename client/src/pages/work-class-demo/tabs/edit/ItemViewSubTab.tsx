import { useEffect, useMemo, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import TaxonomyPicker from '../../components/TaxonomyPicker';
import { fetchItems, saveItem, softDeleteItem, fetchTaxonomy } from '../../api';
import { allowedAxes } from '../../taxonomyTypes';
import type { TaxonomyScope, TaxonomyGov, TaxonomyNode } from '../../taxonomyTypes';

interface Item {
  item_id: string;
  label: string;
  scope: TaxonomyScope;
  facets: Record<string, string>;
  removed: 0 | 1;
  revision: number;
}

// 아이템 뷰 — facets 필터 + 새 아이템 등록 + facets 자동 게이팅
export default function ItemViewSubTab({ scope, gov }: { scope: TaxonomyScope; gov: TaxonomyGov }) {
  const [items, setItems] = useState<Item[]>([]);
  const [taxonomyMap, setTaxonomyMap] = useState<Record<string, TaxonomyNode>>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Record<string, string>>({});
  const [adding, setAdding] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newFacets, setNewFacets] = useState<Record<string, string>>({});
  const [pickerAxis, setPickerAxis] = useState<string | null>(null);

  const axes = useMemo(() =>
    Array.from(new Set([...allowedAxes(scope, gov), ...allowedAxes('common', 'common')]))
  , [scope, gov]);

  const reloadTaxonomy = async () => {
    try {
      const local = await fetchTaxonomy({ scope, gov });
      const common = await fetchTaxonomy({ scope: 'common', gov: 'common' });
      const m: Record<string, TaxonomyNode> = {};
      [...local, ...common].forEach((n) => { if (!m[n.taxonomy_id]) m[n.taxonomy_id] = n; });
      setTaxonomyMap(m);
    } catch {}
  };

  const reload = async () => {
    setLoading(true);
    try {
      const data = await fetchItems(scope);
      setItems(data as any);
    } catch (e: any) {
      toast.error(`아이템 로드 실패: ${e.message || e}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { reloadTaxonomy(); /* eslint-disable-next-line */ }, [scope, gov]);
  useEffect(() => { reload(); /* eslint-disable-next-line */ }, [scope]);

  // 필터 매칭
  const filtered = useMemo(() => items.filter((it) =>
    Object.entries(filter).every(([axis, txId]) => !txId || it.facets[axis] === txId)
  ), [items, filter]);

  const handleAddItem = async () => {
    const label = newLabel.trim();
    if (!label) return;
    try {
      await saveItem({
        label, scope, facets: newFacets,
        source: 'user', locked: 0, revision: 1,
      });
      toast.success(`추가: ${label}`);
      setAdding(false);
      setNewLabel('');
      setNewFacets({});
      reload();
    } catch (e: any) {
      toast.error(`추가 실패: ${e.message || e}`);
    }
  };

  const handleDelete = async (it: Item) => {
    if (!confirm(`삭제: "${it.label}" ?`)) return;
    try { await softDeleteItem(it.item_id); toast.success('삭제됨'); reload(); }
    catch (e: any) { toast.error(`실패: ${e.message || e}`); }
  };

  return (
    <div className="space-y-1">
      <div className="text-[10px] text-slate-500 px-1">
        실 업무 아이템 = facets 조합. 위 필터에서 축별 분류를 골라 매칭, 우측 [+ 새 아이템] 으로 추가.
      </div>

      {/* 필터 바 */}
      <div className="border border-slate-200 dark:border-slate-700 rounded p-1 space-y-1">
        <div className="text-[10px] font-bold text-slate-500">필터</div>
        <div className="flex flex-wrap gap-1">
          {axes.map((axis) => {
            const txId = filter[axis];
            const tx = txId ? taxonomyMap[txId] : null;
            return (
              <button
                key={axis}
                onClick={() => setPickerAxis(pickerAxis === `f:${axis}` ? null : `f:${axis}`)}
                className={[
                  'text-[10px] px-1.5 py-0.5 rounded border',
                  txId ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/30 dark:text-emerald-200' : 'bg-white text-slate-600 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-600',
                ].join(' ')}
              >
                {axis}: {tx ? tx.label : '전체'}
                {txId && (
                  <span
                    onClick={(e) => { e.stopPropagation(); setFilter((f) => { const x = { ...f }; delete x[axis]; return x; }); }}
                    className="ml-0.5 text-rose-500 inline-block cursor-pointer"
                  >×</span>
                )}
              </button>
            );
          })}
        </div>
        {pickerAxis?.startsWith('f:') && (
          <TaxonomyPicker
            scope={scope}
            gov={gov}
            axes={[pickerAxis.slice(2)]}
            onPick={(n) => { setFilter((f) => ({ ...f, [pickerAxis.slice(2)]: n.taxonomy_id })); setPickerAxis(null); }}
            onClose={() => setPickerAxis(null)}
          />
        )}
      </div>

      {/* 아이템 표 */}
      <div className="border border-slate-200 dark:border-slate-700 rounded">
        <div className="flex items-center justify-between p-1 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
          <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">
            아이템 {filtered.length}/{items.length}{loading && ' · 로딩...'}
          </span>
          <button
            onClick={() => setAdding(true)}
            className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded border border-emerald-400 text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
          >
            <Plus className="h-2.5 w-2.5" /> 새 아이템
          </button>
        </div>

        {adding && (
          <div className="p-1 border-b border-slate-200 dark:border-slate-700 bg-emerald-50/30 dark:bg-emerald-950/10 space-y-1">
            <input
              autoFocus
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="아이템 이름"
              className="w-full text-[11px] px-1.5 py-0.5 border border-emerald-300 rounded bg-white dark:bg-slate-900"
            />
            <div className="flex flex-wrap gap-1">
              {axes.map((axis) => {
                const txId = newFacets[axis];
                const tx = txId ? taxonomyMap[txId] : null;
                return (
                  <button
                    key={axis}
                    onClick={() => setPickerAxis(pickerAxis === `n:${axis}` ? null : `n:${axis}`)}
                    className={[
                      'text-[10px] px-1.5 py-0.5 rounded border',
                      txId ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-white text-slate-500 border-dashed border-slate-300',
                    ].join(' ')}
                  >
                    {axis}: {tx ? tx.label : '미선택'}
                  </button>
                );
              })}
            </div>
            {pickerAxis?.startsWith('n:') && (
              <TaxonomyPicker
                scope={scope}
                gov={gov}
                axes={[pickerAxis.slice(2)]}
                onPick={(n) => { setNewFacets((f) => ({ ...f, [pickerAxis.slice(2)]: n.taxonomy_id })); setPickerAxis(null); }}
                onClose={() => setPickerAxis(null)}
              />
            )}
            <div className="flex gap-1">
              <button onClick={handleAddItem} className="text-[10px] px-2 py-0.5 rounded bg-emerald-600 text-white hover:bg-emerald-700">저장</button>
              <button onClick={() => { setAdding(false); setNewLabel(''); setNewFacets({}); }} className="text-[10px] px-2 py-0.5 rounded border border-slate-300">취소</button>
            </div>
          </div>
        )}

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {filtered.length === 0 && !loading && (
            <div className="text-center text-[10px] text-slate-400 py-3">아이템 없음</div>
          )}
          {filtered.map((it) => (
            <div key={it.item_id} className="p-1 flex items-start gap-1 hover:bg-slate-50 dark:hover:bg-slate-800/40 group">
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-semibold truncate">{it.label}</div>
                <div className="flex flex-wrap gap-0.5 mt-0.5">
                  {Object.entries(it.facets || {}).map(([axis, txId]) => {
                    const tx = taxonomyMap[txId];
                    return (
                      <span key={axis} className="text-[9px] px-1 py-0 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {axis}: {tx?.label || txId.slice(0, 8)}
                      </span>
                    );
                  })}
                </div>
              </div>
              <button onClick={() => handleDelete(it)} className="opacity-0 group-hover:opacity-100 text-rose-500 p-0.5">
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
