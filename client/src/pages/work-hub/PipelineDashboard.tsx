import { useState } from 'react';
import { ChevronDown, ChevronUp, ExternalLink, User, Layers } from 'lucide-react';
import { STAGES, STATUSES, DUMMY_ITEMS, statusOf, type PipelineStage, type ItemStatus, type PipelineItem } from './pipeline-data';

/* ══════════════════════════════════════════════════════════════
   Pipeline Dashboard — ShortcutsPage 스타일 카드 그리드
   파이프라인 6단계 × 멀티필터 × 상태 카운트
   ══════════════════════════════════════════════════════════════ */

export default function PipelineDashboard() {
  const [items] = useState<PipelineItem[]>(DUMMY_ITEMS);
  const [expandedStages, setExpandedStages] = useState<Set<PipelineStage>>(new Set(STAGES.map(s => s.key)));
  const [stageFilters, setStageFilters] = useState<Record<string, Record<string, string[]>>>({});
  const [statusFilter, setStatusFilter] = useState<ItemStatus[]>([]);

  const allExpanded = expandedStages.size === STAGES.length;
  const toggleAll = () => setExpandedStages(allExpanded ? new Set() : new Set(STAGES.map(s => s.key)));
  const toggleStage = (k: PipelineStage) => setExpandedStages(prev => { const n = new Set(prev); if (n.has(k)) n.delete(k); else n.add(k); return n; });

  // per-stage sub-filter toggle
  const toggleSubFilter = (stageKey: string, filterLabel: string, option: string) => {
    setStageFilters(prev => {
      const key = `${stageKey}::${filterLabel}`;
      const cur = prev[key] ? [...prev[key]['v'] || []] : [];
      const next = cur.includes(option) ? cur.filter(x => x !== option) : [...cur, option];
      return { ...prev, [key]: { v: next } };
    });
  };
  const getSubFilter = (stageKey: string, filterLabel: string): string[] => {
    const key = `${stageKey}::${filterLabel}`;
    return stageFilters[key]?.v || [];
  };

  const toggleStatus = (s: ItemStatus) => setStatusFilter(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  // filter items for a stage
  const filteredForStage = (stageKey: PipelineStage) => {
    const stage = STAGES.find(s => s.key === stageKey)!;
    let result = items.filter(i => i.stage === stageKey);
    if (statusFilter.length) result = result.filter(i => statusFilter.includes(i.status));
    // apply sub-filters
    stage.filters.forEach((f, idx) => {
      const sel = getSubFilter(stageKey, f.label);
      if (sel.length) {
        result = result.filter(i => {
          const val = idx === 0 ? i.sub1 : (i.sub2 || '');
          return sel.includes(val);
        });
      }
    });
    return result;
  };

  // status count summary
  const countByStatus = (stageItems: PipelineItem[]) => {
    const m = new Map<ItemStatus, number>();
    stageItems.forEach(i => m.set(i.status, (m.get(i.status) || 0) + 1));
    return m;
  };

  return (
    <div style={{ padding: '20px 24px' }}>
      {/* 상단 컨트롤 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <button onClick={toggleAll}
          style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: 13, cursor: 'pointer', color: '#475569', fontWeight: 600 }}>
          {allExpanded ? '전체 접기' : '전체 펼치기'}
        </button>
        <span style={{ fontSize: 12, color: '#94a3b8', margin: '0 4px' }}>상태:</span>
        {STATUSES.map(s => {
          const active = statusFilter.includes(s.key);
          return (
            <button key={s.key} onClick={() => toggleStatus(s.key)}
              style={{ padding: '4px 10px', borderRadius: 14, border: '1px solid', borderColor: active ? s.color : '#e2e8f0', background: active ? s.bg : '#fff', color: active ? s.color : '#94a3b8', fontSize: 11, cursor: 'pointer', fontWeight: active ? 600 : 400 }}>
              {s.key}
            </button>
          );
        })}
        {statusFilter.length > 0 && (
          <button onClick={() => setStatusFilter([])}
            style={{ padding: '4px 10px', borderRadius: 14, border: '1px solid #FECACA', background: '#FEF2F2', color: '#EF4444', fontSize: 11, cursor: 'pointer' }}>
            초기화
          </button>
        )}
        <span style={{ marginLeft: 'auto', fontSize: 12, color: '#94a3b8' }}>총 {items.length}건</span>
      </div>

      {/* 파이프라인 흐름 표시 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 16, padding: '8px 12px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0', overflowX: 'auto' }}>
        <Layers size={14} color="#64748b" />
        {STAGES.map((s, i) => {
          const cnt = items.filter(x => x.stage === s.key).length;
          return (
            <span key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {i > 0 && <span style={{ color: '#cbd5e1', fontSize: 16 }}>&rarr;</span>}
              <span style={{ padding: '3px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600, background: s.bg, color: s.color }}>{s.label} {cnt}</span>
            </span>
          );
        })}
      </div>

      {/* 카드 그리드 — 3×2 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        {STAGES.map(stage => {
          const stageItems = filteredForStage(stage.key);
          const allStageItems = items.filter(i => i.stage === stage.key);
          const isOpen = expandedStages.has(stage.key);
          const counts = countByStatus(allStageItems);

          return (
            <div key={stage.key} style={{ background: '#fff', borderRadius: 12, border: `2px solid ${stage.color}22`, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              {/* 카드 헤더 */}
              <div onClick={() => toggleStage(stage.key)}
                style={{ padding: '12px 14px', background: stage.bg, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, borderBottom: `1px solid ${stage.color}22` }}>
                {isOpen ? <ChevronUp size={14} color={stage.color} /> : <ChevronDown size={14} color={stage.color} />}
                <span style={{ fontSize: 14, fontWeight: 700, color: stage.color, flex: 1 }}>{stage.label}</span>
                <span style={{ fontSize: 12, color: stage.color, fontWeight: 600 }}>{stageItems.length}건</span>
              </div>

              {/* 상태 미니바 — 항상 표시 */}
              <div style={{ display: 'flex', gap: 4, padding: '6px 12px', flexWrap: 'wrap' }}>
                {STATUSES.map(s => {
                  const c = counts.get(s.key) || 0;
                  if (!c) return null;
                  return <span key={s.key} style={{ fontSize: 10, padding: '1px 6px', borderRadius: 10, background: s.bg, color: s.color, fontWeight: 600 }}>{s.key}{c}</span>;
                })}
              </div>

              {isOpen && (
                <>
                  {/* 멀티단 필터 */}
                  <div style={{ padding: '4px 12px 8px', display: 'flex', flexDirection: 'column', gap: 4, borderBottom: '1px solid #f1f5f9' }}>
                    {stage.filters.map(f => {
                      const sel = getSubFilter(stage.key, f.label);
                      return (
                        <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600, minWidth: 28 }}>{f.label}</span>
                          {f.options.map(opt => {
                            const active = sel.includes(opt);
                            return (
                              <button key={opt} onClick={() => toggleSubFilter(stage.key, f.label, opt)}
                                style={{ padding: '2px 8px', borderRadius: 10, border: '1px solid', borderColor: active ? stage.color : '#e2e8f0', background: active ? `${stage.color}11` : '#fff', color: active ? stage.color : '#64748b', fontSize: 10, cursor: 'pointer', fontWeight: active ? 600 : 400 }}>
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>

                  {/* 아이템 리스트 */}
                  <div style={{ flex: 1, overflow: 'auto', maxHeight: 320 }}>
                    {stageItems.length === 0 ? (
                      <div style={{ padding: 16, textAlign: 'center', fontSize: 12, color: '#94a3b8' }}>해당 항목 없음</div>
                    ) : stageItems.map(item => {
                      const st = statusOf(item.status);
                      return (
                        <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderBottom: '1px solid #f8fafc', fontSize: 12 }}
                          onMouseEnter={e => e.currentTarget.style.background = '#fafbfd'} onMouseLeave={e => e.currentTarget.style.background = ''}>
                          {/* 상태 */}
                          <span style={{ padding: '1px 6px', borderRadius: 8, fontSize: 10, fontWeight: 600, background: st.bg, color: st.color, flexShrink: 0, minWidth: 36, textAlign: 'center' }}>{item.status}</span>
                          {/* 분류 태그 */}
                          <span style={{ padding: '1px 5px', borderRadius: 6, fontSize: 9, background: '#f1f5f9', color: '#475569', flexShrink: 0 }}>{item.sub1}{item.sub2 ? `·${item.sub2}` : ''}</span>
                          {/* 제목 */}
                          <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#1e293b', fontWeight: 500 }}>{item.title}</span>
                          {/* 담당 */}
                          {item.assignee && <span style={{ fontSize: 10, color: '#64748b', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 2 }}><User size={9} />{item.assignee}</span>}
                          {/* 링크 */}
                          {item.link && <a href={item.link} style={{ flexShrink: 0, color: '#3B82F6', display: 'flex' }} title={item.link}><ExternalLink size={11} /></a>}
                          {/* 날짜 */}
                          {item.date && <span style={{ fontSize: 9, color: '#94a3b8', flexShrink: 0 }}>{item.date}</span>}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
