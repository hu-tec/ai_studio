import { useEffect, useState } from 'react';
import { Plus, X, Pencil, Check } from 'lucide-react';
import { toast } from 'sonner';
import { fetchTaxonomy, saveTaxonomyNode, updateTaxonomyNode, softDeleteTaxonomyNode } from '../api';
import type { TaxonomyNode, TaxonomyScope, TaxonomyGov } from '../taxonomyTypes';

interface Props {
  scope: TaxonomyScope;
  gov: TaxonomyGov;
  axes: string[];
  title?: string;
}

// 축별 flat chip CRUD — 사내규정/업무지침/홈페이지 매트릭스 공용.
// 한 axis 당 한 행: [축 라벨] [chip1] [chip2] ... [+ 추가]
export default function FlatAxisMatrix({ scope, gov, axes, title }: Props) {
  const [nodes, setNodes] = useState<TaxonomyNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [adding, setAdding] = useState<string | null>(null); // axis name
  const [newText, setNewText] = useState('');

  const reload = async () => {
    setLoading(true);
    try {
      const data = await fetchTaxonomy({ scope, gov, level: 'flat' });
      setNodes(data);
      setError(null);
    } catch (e: any) {
      setError(String(e.message || e));
      setNodes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { reload(); /* eslint-disable-next-line */ }, [scope, gov]);

  const handleAdd = async (axis: string) => {
    const label = newText.trim();
    if (!label) { setAdding(null); return; }
    try {
      const max = nodes.filter((n) => n.axis === axis).reduce((m, n) => Math.max(m, n.sort_order), -1);
      await saveTaxonomyNode({
        scope, gov, axis, level: 'flat', parent_id: null,
        label, sort_order: max + 1, source: 'user', locked: 0,
      } as any);
      toast.success(`추가: ${label}`);
      setNewText('');
      setAdding(null);
      reload();
    } catch (e: any) {
      toast.error(`추가 실패: ${e.message || e}`);
    }
  };

  const handleRename = async (n: TaxonomyNode) => {
    const label = editText.trim();
    if (!label || label === n.label) { setEditingId(null); return; }
    try {
      await updateTaxonomyNode(n.taxonomy_id, {
        ...n, label, source: 'user', locked: 0, revision: n.revision,
      } as any);
      toast.success(`수정: ${n.label} → ${label}`);
      setEditingId(null);
      reload();
    } catch (e: any) {
      if (String(e.message).includes('409')) toast.error('다른 세션이 먼저 수정함, 새로고침 필요');
      else toast.error(`수정 실패: ${e.message || e}`);
    }
  };

  const handleDelete = async (n: TaxonomyNode) => {
    if (!confirm(`삭제: "${n.label}" ?`)) return;
    try {
      await softDeleteTaxonomyNode(n.taxonomy_id);
      toast.success(`삭제: ${n.label}`);
      reload();
    } catch (e: any) {
      toast.error(`삭제 실패: ${e.message || e}`);
    }
  };

  if (axes.length === 0) {
    return <div className="text-[11px] text-rose-600 px-2 py-1">이 (scope×gov) 조합은 허용 축이 없습니다.</div>;
  }

  return (
    <div className="space-y-1">
      {title && <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 px-1">{title}</div>}
      {error && (
        <div className="text-[10px] text-rose-600 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded p-1.5">
          DB 오류: {error}
        </div>
      )}
      {loading && <div className="text-[10px] text-slate-500 px-1">불러오는 중...</div>}

      <div className="space-y-1">
        {axes.map((axis) => {
          const list = nodes.filter((n) => n.axis === axis).sort((a, b) => a.sort_order - b.sort_order);
          return (
            <div key={axis} className="flex items-start gap-1 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-1 bg-white dark:bg-slate-900">
              <div className="text-[10px] font-bold text-slate-500 min-w-[60px] pt-0.5">{axis}</div>
              <div className="flex-1 flex flex-wrap gap-1">
                {list.map((n) => {
                  const isEditing = editingId === n.taxonomy_id;
                  if (isEditing) {
                    return (
                      <span key={n.taxonomy_id} className="inline-flex items-center gap-0.5 border border-emerald-400 rounded px-1 bg-emerald-50 dark:bg-emerald-950/30">
                        <input
                          autoFocus
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          onBlur={() => handleRename(n)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleRename(n);
                            if (e.key === 'Escape') setEditingId(null);
                          }}
                          className="text-[10px] bg-transparent outline-none w-16"
                        />
                        <Check className="h-2.5 w-2.5 text-emerald-600" />
                      </span>
                    );
                  }
                  return (
                    <span
                      key={n.taxonomy_id}
                      className={[
                        'inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded border group',
                        n.source === 'seed' && n.locked
                          ? 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-600'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/30 dark:text-emerald-200 dark:border-emerald-800',
                      ].join(' ')}
                      title={`${n.source}${n.locked ? '·잠김' : ''}·rev${n.revision}`}
                    >
                      <button
                        onClick={() => { setEditingId(n.taxonomy_id); setEditText(n.label); }}
                        className="hover:underline"
                      >
                        {n.label}
                      </button>
                      <button onClick={() => { setEditingId(n.taxonomy_id); setEditText(n.label); }} className="opacity-0 group-hover:opacity-100">
                        <Pencil className="h-2 w-2" />
                      </button>
                      <button onClick={() => handleDelete(n)} className="opacity-0 group-hover:opacity-100 text-rose-500">
                        <X className="h-2.5 w-2.5" />
                      </button>
                    </span>
                  );
                })}
                {adding === axis ? (
                  <span className="inline-flex items-center gap-0.5 border border-emerald-400 rounded px-1 bg-emerald-50 dark:bg-emerald-950/30">
                    <input
                      autoFocus
                      value={newText}
                      onChange={(e) => setNewText(e.target.value)}
                      onBlur={() => handleAdd(axis)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAdd(axis);
                        if (e.key === 'Escape') { setAdding(null); setNewText(''); }
                      }}
                      placeholder="새 항목"
                      className="text-[10px] bg-transparent outline-none w-16"
                    />
                  </span>
                ) : (
                  <button
                    onClick={() => { setAdding(axis); setNewText(''); }}
                    className="inline-flex items-center gap-0.5 text-[10px] px-1 py-0.5 rounded border border-dashed border-slate-400 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <Plus className="h-2.5 w-2.5" /> 추가
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-[10px] text-slate-500 px-1 pt-1 border-t border-dashed border-slate-300 dark:border-slate-600">
        scope=<b>{scope}</b> · gov=<b>{gov}</b> · 노드 {nodes.length}개 · 회색=seed(잠김), 녹색=user
      </div>
    </div>
  );
}
