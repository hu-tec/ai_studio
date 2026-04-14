import { useEffect, useMemo, useRef, useState } from 'react';
import { Save, RefreshCw, Maximize2, Minimize2, ImportIcon, X } from 'lucide-react';
import { toast } from 'sonner';
import TaxonomyPicker from '../../components/TaxonomyPicker';
import { fetchMandalart, saveMandalart, mandalartKey, fetchTaxonomy } from '../../api';
import { allowedAxes } from '../../taxonomyTypes';
import type { TaxonomyScope, TaxonomyGov, TaxonomyNode } from '../../taxonomyTypes';

interface Cell {
  id: string;
  taxonomy_id?: string;
  text: string;
  axis?: string;
  level?: string;
}

const SIZES: { rows: number; cols: number; label: string }[] = [
  { rows: 3, cols: 3, label: '3×3' },
  { rows: 4, cols: 4, label: '4×4' },
  { rows: 5, cols: 5, label: '5×5' },
  { rows: 6, cols: 6, label: '6×6' },
  { rows: 7, cols: 7, label: '7×7' },
  { rows: 8, cols: 8, label: '8×8' },
  { rows: 9, cols: 9, label: '9×9' },
];

// 분류 만다라트 — work-log 와 별도 저장. 셀 = taxonomy 참조, 자유 텍스트 X.
export default function MandalartSubTab({ scope, gov }: { scope: TaxonomyScope; gov: TaxonomyGov }) {
  const [size, setSize] = useState<{ rows: number; cols: number }>({ rows: 3, cols: 3 });
  const [cells, setCells] = useState<Cell[]>(() => createEmpty(3, 3));
  const [revision, setRevision] = useState(1);
  const [pickerCellId, setPickerCellId] = useState<string | null>(null);
  const [taxonomyMap, setTaxonomyMap] = useState<Record<string, TaxonomyNode>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const saveTimer = useRef<any>(null);

  const id = mandalartKey(scope, gov, size.rows, size.cols);
  const axes = allowedAxes(scope, gov);

  // taxonomy 라벨 lookup 캐시
  const reloadTaxonomy = async () => {
    try {
      const all = await fetchTaxonomy({ scope, gov });
      const m: Record<string, TaxonomyNode> = {};
      all.forEach((n) => { m[n.taxonomy_id] = n; });
      // common 도 같이 (대중소 트리)
      const common = await fetchTaxonomy({ scope: 'common', gov: 'common' });
      common.forEach((n) => { if (!m[n.taxonomy_id]) m[n.taxonomy_id] = n; });
      setTaxonomyMap(m);
    } catch (e: any) {
      toast.error(`taxonomy 로드 실패: ${e.message || e}`);
    }
  };

  const reload = async () => {
    setLoading(true);
    try {
      const m = await fetchMandalart(id);
      if (m && m.data && Array.isArray(m.data.cells)) {
        setCells(m.data.cells as Cell[]);
        setSize(m.data.size || size);
        setRevision(m.revision || 1);
      } else {
        setCells(createEmpty(size.rows, size.cols));
        setRevision(1);
      }
      setDirty(false);
    } catch (e: any) {
      toast.error(`만다라트 로드 실패: ${e.message || e}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { reloadTaxonomy(); /* eslint-disable-next-line */ }, [scope, gov]);
  useEffect(() => { reload(); /* eslint-disable-next-line */ }, [id]);

  // size 변경 → 좌표 보존 resize
  const changeSize = (s: { rows: number; cols: number }) => {
    setSize(s);
    setCells((prev) => resizeCells(prev, size, s));
    setDirty(true);
  };

  // 셀 변경 → debounce autosave
  useEffect(() => {
    if (!dirty) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      setSaving(true);
      try {
        await saveMandalart({
          mandalart_id: id,
          data: { size, cells } as any,
          revision,
        } as any);
        setDirty(false);
        setRevision((r) => r + 1);
        toast.success('만다라트 저장됨', { duration: 1200 });
      } catch (e: any) {
        toast.error(`저장 실패: ${e.message || e}`);
      } finally {
        setSaving(false);
      }
    }, 800);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
    // eslint-disable-next-line
  }, [cells, size, dirty]);

  const onPick = (n: TaxonomyNode) => {
    if (!pickerCellId) return;
    setCells((prev) => prev.map((c) =>
      c.id === pickerCellId
        ? { ...c, taxonomy_id: n.taxonomy_id, text: n.label, axis: n.axis, level: n.level }
        : c
    ));
    setTaxonomyMap((m) => ({ ...m, [n.taxonomy_id]: n }));
    setPickerCellId(null);
    setDirty(true);
  };

  const clearCell = (cellId: string) => {
    setCells((prev) => prev.map((c) => c.id === cellId ? { ...c, taxonomy_id: undefined, text: '', axis: undefined, level: undefined } : c));
    setDirty(true);
  };

  const filledCount = cells.filter((c) => c.taxonomy_id).length;

  return (
    <div className={['space-y-1', fullscreen ? 'fixed inset-2 z-50 bg-white dark:bg-slate-950 p-2 overflow-auto border-2 border-emerald-500 rounded-lg' : ''].join(' ')}>
      {/* 컨트롤 바 */}
      <div className="flex items-center gap-1 flex-wrap border border-slate-200 dark:border-slate-700 rounded p-1">
        <span className="text-[10px] font-bold text-slate-500">크기</span>
        {SIZES.map((s) => (
          <button
            key={s.label}
            onClick={() => changeSize(s)}
            className={[
              'text-[10px] px-1.5 py-0.5 rounded border',
              size.rows === s.rows && size.cols === s.cols
                ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-600',
            ].join(' ')}
          >
            {s.label}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-1 text-[10px]">
          {saving && <span className="text-amber-600">●저장 중</span>}
          {!saving && dirty && <span className="text-amber-600">○변경됨</span>}
          {!saving && !dirty && <span className="text-emerald-600">●저장됨</span>}
          <button onClick={reload} className="p-0.5 text-slate-500 hover:text-slate-900" title="새로고침">
            <RefreshCw className="h-3 w-3" />
          </button>
          <button onClick={() => setFullscreen((f) => !f)} className="p-0.5 text-slate-500 hover:text-slate-900" title="전체화면">
            {fullscreen ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
          </button>
        </div>
      </div>

      {loading && <div className="text-[10px] text-slate-500 px-1">불러오는 중...</div>}

      {/* 만다라트 그리드 */}
      <div
        className="grid gap-0.5 border border-slate-300 dark:border-slate-600 p-1 bg-slate-50 dark:bg-slate-900 rounded"
        style={{
          gridTemplateColumns: `repeat(${size.cols}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${size.rows}, minmax(${fullscreen ? '60px' : '40px'}, auto))`,
        }}
      >
        {cells.map((c) => {
          const tx = c.taxonomy_id ? taxonomyMap[c.taxonomy_id] : null;
          const isPicking = pickerCellId === c.id;
          return (
            <div
              key={c.id}
              onClick={() => !isPicking && setPickerCellId(c.id)}
              className={[
                'group relative border rounded p-0.5 cursor-pointer text-[9px] flex flex-col items-center justify-center text-center',
                tx
                  ? 'bg-white dark:bg-slate-800 border-emerald-300 hover:border-emerald-500'
                  : 'bg-slate-100/50 dark:bg-slate-800/30 border-dashed border-slate-300 dark:border-slate-600 hover:border-emerald-400',
                isPicking ? 'ring-2 ring-emerald-500' : '',
              ].join(' ')}
              title={tx ? `${tx.axis} · ${tx.level} · ${tx.label}` : '+ 분류 선택'}
            >
              {tx ? (
                <>
                  <div className="text-[10px] font-semibold leading-tight truncate w-full">
                    {tx.emoji}{tx.label}
                  </div>
                  <div className="text-[8px] text-slate-500 truncate w-full">{tx.axis}</div>
                  <button
                    onClick={(e) => { e.stopPropagation(); clearCell(c.id); }}
                    className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 text-rose-500 p-0.5"
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                </>
              ) : (
                <span className="text-slate-400 text-[9px]">+ 분류</span>
              )}
            </div>
          );
        })}
      </div>

      {/* picker — 셀 선택 시 노출 */}
      {pickerCellId && (
        <TaxonomyPicker
          scope={scope}
          gov={gov}
          axes={Array.from(new Set([...axes, ...allowedAxes('common', 'common')]))}
          initialId={cells.find((c) => c.id === pickerCellId)?.taxonomy_id || null}
          onPick={onPick}
          onClose={() => setPickerCellId(null)}
        />
      )}

      <div className="text-[10px] text-slate-500 px-1 flex items-center gap-2 flex-wrap">
        <span>키=<b>{id}</b></span>
        <span>채움 {filledCount}/{cells.length}</span>
        <span>rev {revision}</span>
        <span className="text-slate-400">· 셀 클릭→분류 picker</span>
      </div>
    </div>
  );
}

function createEmpty(rows: number, cols: number): Cell[] {
  return Array.from({ length: rows * cols }, (_, i) => ({ id: `mc-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 5)}`, text: '' }));
}

function resizeCells(prev: Cell[], oldS: { rows: number; cols: number }, newS: { rows: number; cols: number }): Cell[] {
  const out: Cell[] = createEmpty(newS.rows, newS.cols);
  const R = Math.min(oldS.rows, newS.rows);
  const C = Math.min(oldS.cols, newS.cols);
  for (let r = 0; r < R; r++) {
    for (let c = 0; c < C; c++) {
      const oldIdx = r * oldS.cols + c;
      const newIdx = r * newS.cols + c;
      if (prev[oldIdx]) out[newIdx] = { ...prev[oldIdx] };
    }
  }
  return out;
}
