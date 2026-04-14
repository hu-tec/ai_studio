import { useEffect, useMemo, useState } from 'react';
import { ChevronRight, X } from 'lucide-react';
import { fetchTaxonomy } from '../api';
import type { TaxonomyNode, TaxonomyScope, TaxonomyGov } from '../taxonomyTypes';

interface Props {
  scope: TaxonomyScope;
  gov: TaxonomyGov;
  axes: string[];
  initialId?: string | null;
  onPick: (node: TaxonomyNode) => void;
  onClose: () => void;
}

// 대중소 드릴다운 picker — 만다라트 셀, 아이템 facets 에서 공용.
// 인라인 (모달 X). axis 칩 → 대 칩 → 중 칩 → 소 칩 순서.
export default function TaxonomyPicker({ scope, gov, axes, initialId, onPick, onClose }: Props) {
  const [nodes, setNodes] = useState<TaxonomyNode[]>([]);
  const [axis, setAxis] = useState(axes[0] || '');
  const [largeId, setLargeId] = useState<string | null>(null);
  const [mediumId, setMediumId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!axis) return;
    fetchTaxonomy({ scope, gov, axis })
      .then((n) => { setNodes(n); setError(null); })
      .catch((e) => { setError(String(e.message || e)); setNodes([]); });
  }, [scope, gov, axis]);

  // initialId 가 있으면 자동 expand
  useEffect(() => {
    if (!initialId || nodes.length === 0) return;
    const target = nodes.find((n) => n.taxonomy_id === initialId);
    if (!target) return;
    if (target.level === 'small') {
      const med = nodes.find((n) => n.taxonomy_id === target.parent_id);
      if (med) {
        setMediumId(med.taxonomy_id);
        const lar = nodes.find((n) => n.taxonomy_id === med.parent_id);
        if (lar) setLargeId(lar.taxonomy_id);
      }
    } else if (target.level === 'medium') {
      setMediumId(target.taxonomy_id);
      const lar = nodes.find((n) => n.taxonomy_id === target.parent_id);
      if (lar) setLargeId(lar.taxonomy_id);
    } else if (target.level === 'large') {
      setLargeId(target.taxonomy_id);
    }
  }, [initialId, nodes]);

  const larges = useMemo(() => nodes.filter((n) => n.level === 'large').sort((a, b) => a.sort_order - b.sort_order), [nodes]);
  const mediums = useMemo(() => largeId ? nodes.filter((n) => n.level === 'medium' && n.parent_id === largeId).sort((a, b) => a.sort_order - b.sort_order) : [], [nodes, largeId]);
  const smalls = useMemo(() => mediumId ? nodes.filter((n) => n.level === 'small' && n.parent_id === mediumId).sort((a, b) => a.sort_order - b.sort_order) : [], [nodes, mediumId]);
  const flats = useMemo(() => nodes.filter((n) => n.level === 'flat').sort((a, b) => a.sort_order - b.sort_order), [nodes]);

  return (
    <div className="border border-emerald-300 dark:border-emerald-700 rounded p-2 bg-emerald-50/30 dark:bg-emerald-950/20 space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">분류 선택</span>
        <button onClick={onClose} className="text-slate-500 hover:text-rose-600">
          <X className="h-3 w-3" />
        </button>
      </div>

      {error && <div className="text-[10px] text-rose-600">DB 오류: {error}</div>}

      {/* 축 선택 */}
      <Row label="축">
        {axes.map((a) => (
          <Chip key={a} active={axis === a} onClick={() => { setAxis(a); setLargeId(null); setMediumId(null); }}>{a}</Chip>
        ))}
      </Row>

      {/* flat 모드 */}
      {flats.length > 0 && (
        <Row label="항목">
          {flats.map((n) => (
            <Chip key={n.taxonomy_id} onClick={() => onPick(n)}>{n.label}</Chip>
          ))}
        </Row>
      )}

      {/* 대중소 모드 */}
      {larges.length > 0 && (
        <>
          <Row label="대">
            {larges.map((n) => (
              <Chip
                key={n.taxonomy_id}
                active={largeId === n.taxonomy_id}
                onClick={() => { setLargeId(n.taxonomy_id); setMediumId(null); onPick(n); }}
              >
                {n.emoji}{n.label}
              </Chip>
            ))}
          </Row>
          {largeId && mediums.length > 0 && (
            <Row label="중" indent>
              {mediums.map((n) => (
                <Chip
                  key={n.taxonomy_id}
                  active={mediumId === n.taxonomy_id}
                  onClick={() => { setMediumId(n.taxonomy_id); onPick(n); }}
                >
                  {n.emoji}{n.label}
                </Chip>
              ))}
            </Row>
          )}
          {mediumId && smalls.length > 0 && (
            <Row label="소" indent>
              {smalls.map((n) => (
                <Chip
                  key={n.taxonomy_id}
                  onClick={() => onPick(n)}
                >
                  {n.emoji}{n.label}
                </Chip>
              ))}
            </Row>
          )}
        </>
      )}

      {nodes.length === 0 && !error && (
        <div className="text-[10px] text-slate-500 italic">데이터 없음</div>
      )}
    </div>
  );
}

function Row({ label, indent, children }: { label: string; indent?: boolean; children: React.ReactNode }) {
  return (
    <div className={['flex items-start gap-1', indent ? 'pl-4' : ''].join(' ')}>
      {indent && <ChevronRight className="h-2.5 w-2.5 text-slate-400 mt-0.5" />}
      <div className="text-[10px] font-bold text-slate-500 min-w-[28px] pt-0.5">{label}</div>
      <div className="flex-1 flex flex-wrap gap-1">{children}</div>
    </div>
  );
}

function Chip({ active, onClick, children }: { active?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={[
        'text-[10px] px-1.5 py-0.5 rounded border whitespace-nowrap',
        active
          ? 'bg-emerald-600 text-white border-emerald-600'
          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-600',
      ].join(' ')}
    >
      {children}
    </button>
  );
}
