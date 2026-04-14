import { useEffect, useMemo, useState } from 'react';
import { Plus, X, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { fetchTaxonomy, saveTaxonomyNode, updateTaxonomyNode, softDeleteTaxonomyNode } from '../api';
import type { TaxonomyNode, TaxonomyScope, TaxonomyGov, TaxonomyLevel } from '../taxonomyTypes';

interface Props {
  scope: TaxonomyScope;
  gov: TaxonomyGov;
  axes: string[];
}

interface Row {
  large: TaxonomyNode | null;
  medium: TaxonomyNode | null;
  small: TaxonomyNode | null;
  largeSpan: number;
  mediumSpan: number;
}

// 대중소 spreadsheet — rowspan 병합 + 인라인 CRUD
export default function TaxonomyTreeEditor({ scope, gov, axes }: Props) {
  const [axis, setAxis] = useState(axes[0] || '');
  const [nodes, setNodes] = useState<TaxonomyNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<{ id: string; level: TaxonomyLevel } | null>(null);
  const [editText, setEditText] = useState('');

  useEffect(() => { if (axes.length && !axes.includes(axis)) setAxis(axes[0]); /* eslint-disable-next-line */ }, [axes]);

  const reload = async () => {
    if (!axis) return;
    setLoading(true);
    try {
      const data = await fetchTaxonomy({ scope, gov, axis });
      setNodes(data);
      setError(null);
    } catch (e: any) {
      setError(String(e.message || e));
      setNodes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { reload(); /* eslint-disable-next-line */ }, [scope, gov, axis]);

  // 트리 → 평탄 행렬 (rowspan 계산)
  const rows = useMemo<Row[]>(() => {
    const larges = nodes.filter((n) => n.level === 'large').sort((a, b) => a.sort_order - b.sort_order);
    const out: Row[] = [];
    larges.forEach((L) => {
      const meds = nodes.filter((n) => n.level === 'medium' && n.parent_id === L.taxonomy_id).sort((a, b) => a.sort_order - b.sort_order);
      if (meds.length === 0) {
        out.push({ large: L, medium: null, small: null, largeSpan: 1, mediumSpan: 1 });
        return;
      }
      let largeFirst = true;
      let largeSpan = 0;
      meds.forEach((M) => {
        const smalls = nodes.filter((n) => n.level === 'small' && n.parent_id === M.taxonomy_id).sort((a, b) => a.sort_order - b.sort_order);
        if (smalls.length === 0) {
          out.push({ large: largeFirst ? L : null, medium: M, small: null, largeSpan: 0, mediumSpan: 1 });
          largeFirst = false;
          largeSpan += 1;
        } else {
          let medFirst = true;
          smalls.forEach((S) => {
            out.push({ large: largeFirst ? L : null, medium: medFirst ? M : null, small: S, largeSpan: 0, mediumSpan: medFirst ? smalls.length : 0 });
            largeFirst = false;
            medFirst = false;
            largeSpan += 1;
          });
        }
      });
      // 첫 large 행에 large rowspan 기록
      const firstIdxFromBack = out.length - largeSpan;
      if (out[firstIdxFromBack]) out[firstIdxFromBack].largeSpan = largeSpan;
    });
    return out;
  }, [nodes]);

  const beginEdit = (n: TaxonomyNode | null) => {
    if (!n) return;
    setEditing({ id: n.taxonomy_id, level: n.level });
    setEditText(n.label);
  };

  const commitEdit = async (n: TaxonomyNode) => {
    const label = editText.trim();
    if (!label || label === n.label) { setEditing(null); return; }
    try {
      await updateTaxonomyNode(n.taxonomy_id, { ...n, label, source: 'user', locked: 0, revision: n.revision } as any);
      toast.success(`수정: ${label}`);
      setEditing(null);
      reload();
    } catch (e: any) {
      toast.error(`수정 실패: ${e.message || e}`);
    }
  };

  const addLarge = async () => {
    const label = prompt('새 대카테고리 이름?');
    if (!label) return;
    const max = nodes.filter((n) => n.level === 'large').reduce((m, n) => Math.max(m, n.sort_order), -1);
    try {
      await saveTaxonomyNode({ scope, gov, axis, level: 'large', parent_id: null, label, sort_order: max + 1, source: 'user', locked: 0 } as any);
      toast.success(`대 추가: ${label}`);
      reload();
    } catch (e: any) { toast.error(`실패: ${e.message || e}`); }
  };

  const addChild = async (parent: TaxonomyNode) => {
    const childLevel: TaxonomyLevel = parent.level === 'large' ? 'medium' : 'small';
    const label = prompt(`새 ${childLevel === 'medium' ? '중' : '소'} 카테고리 이름?`);
    if (!label) return;
    const max = nodes.filter((n) => n.parent_id === parent.taxonomy_id).reduce((m, n) => Math.max(m, n.sort_order), -1);
    try {
      await saveTaxonomyNode({ scope, gov, axis, level: childLevel, parent_id: parent.taxonomy_id, label, sort_order: max + 1, source: 'user', locked: 0 } as any);
      toast.success(`${childLevel === 'medium' ? '중' : '소'} 추가: ${label}`);
      reload();
    } catch (e: any) { toast.error(`실패: ${e.message || e}`); }
  };

  const remove = async (n: TaxonomyNode) => {
    if (!confirm(`삭제: "${n.label}" (하위 항목 포함 안 됨) ?`)) return;
    try { await softDeleteTaxonomyNode(n.taxonomy_id); toast.success('삭제됨'); reload(); }
    catch (e: any) { toast.error(`실패: ${e.message || e}`); }
  };

  if (axes.length === 0) {
    return <div className="text-[11px] text-rose-600 px-2 py-1">이 (scope×gov) 조합은 허용 축이 없습니다.</div>;
  }

  return (
    <div className="space-y-1">
      {/* 좌측 축 사이드바 */}
      <div className="flex items-center gap-1 flex-wrap border-b border-slate-200 dark:border-slate-700 pb-1">
        <span className="text-[10px] font-bold text-slate-500 mr-1">축</span>
        {axes.map((a) => (
          <button
            key={a}
            onClick={() => setAxis(a)}
            className={[
              'text-[10px] px-1.5 py-0.5 rounded border',
              axis === a
                ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-600',
            ].join(' ')}
          >
            {a}
          </button>
        ))}
        <div className="ml-auto">
          <button
            onClick={addLarge}
            className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded border border-emerald-400 text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
          >
            <Plus className="h-2.5 w-2.5" /> 대 추가
          </button>
        </div>
      </div>

      {error && (
        <div className="text-[10px] text-rose-600 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded p-1.5">
          DB 오류: {error}
        </div>
      )}
      {loading && <div className="text-[10px] text-slate-500 px-1">불러오는 중...</div>}

      {/* 우측 spreadsheet */}
      <div className="overflow-auto border border-slate-200 dark:border-slate-700 rounded">
        <table className="w-full text-[10px] border-collapse">
          <thead className="bg-slate-100 dark:bg-slate-800 sticky top-0">
            <tr>
              <th className="border border-slate-300 dark:border-slate-600 px-1 py-0.5 w-32 text-left">대카테고리</th>
              <th className="border border-slate-300 dark:border-slate-600 px-1 py-0.5 w-32 text-left">중카테고리</th>
              <th className="border border-slate-300 dark:border-slate-600 px-1 py-0.5 w-32 text-left">소카테고리</th>
              <th className="border border-slate-300 dark:border-slate-600 px-1 py-0.5 w-16 text-left">관리</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && !loading && (
              <tr><td colSpan={4} className="text-center text-slate-400 py-4">데이터 없음 — 우측 상단 [대 추가]</td></tr>
            )}
            {rows.map((row, i) => (
              <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                {row.largeSpan > 0 && (
                  <td rowSpan={row.largeSpan} className="border border-slate-300 dark:border-slate-600 px-1 py-0.5 align-top bg-emerald-50/50 dark:bg-emerald-950/20">
                    {renderCell(row.large, 'large')}
                  </td>
                )}
                {row.mediumSpan > 0 && (
                  <td rowSpan={row.mediumSpan} className="border border-slate-300 dark:border-slate-600 px-1 py-0.5 align-top bg-sky-50/50 dark:bg-sky-950/20">
                    {renderCell(row.medium, 'medium')}
                  </td>
                )}
                <td className="border border-slate-300 dark:border-slate-600 px-1 py-0.5 align-top">
                  {renderCell(row.small, 'small')}
                </td>
                <td className="border border-slate-300 dark:border-slate-600 px-1 py-0.5 align-top">
                  {row.large && row.large.large /* never */}
                  <div className="flex flex-col gap-0.5">
                    {row.medium && !row.small && (
                      <button onClick={() => addChild(row.medium!)} className="text-[9px] text-emerald-600 hover:underline">+소</button>
                    )}
                    {row.large && row.largeSpan > 0 && (
                      <button onClick={() => addChild(row.large!)} className="text-[9px] text-emerald-600 hover:underline">+중</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-[10px] text-slate-500 px-1">
        축=<b>{axis}</b> · 노드 {nodes.length}개 · 셀 클릭→수정, 우측 [관리] 열에서 자식 추가
      </div>
    </div>
  );

  function renderCell(n: TaxonomyNode | null, level: TaxonomyLevel) {
    if (!n) return <span className="text-slate-300">—</span>;
    const isEditing = editing?.id === n.taxonomy_id;
    if (isEditing) {
      return (
        <input
          autoFocus
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onBlur={() => commitEdit(n)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commitEdit(n);
            if (e.key === 'Escape') setEditing(null);
          }}
          className="text-[10px] bg-white dark:bg-slate-900 border border-emerald-400 rounded px-1 w-full"
        />
      );
    }
    return (
      <div className="flex items-center gap-0.5 group">
        {n.emoji && <span>{n.emoji}</span>}
        <button onClick={() => beginEdit(n)} className="hover:underline truncate flex-1 text-left">
          {n.label}
        </button>
        <button onClick={() => beginEdit(n)} className="opacity-0 group-hover:opacity-100">
          <Pencil className="h-2 w-2" />
        </button>
        <button onClick={() => remove(n)} className="opacity-0 group-hover:opacity-100 text-rose-500">
          <X className="h-2.5 w-2.5" />
        </button>
        {n.locked === 1 && <span className="text-[8px] text-slate-400">🔒</span>}
      </div>
    );
  }
}
