import { useState } from 'react';
import { ChevronDown, ChevronUp, ExternalLink, User } from 'lucide-react';
import { STAGES, STATUSES, DUMMY_ITEMS, statusOf, POST_TYPE_STYLES, type PipelineStage, type ItemStatus, type PostType, type PipelineItem } from './pipeline-data';

/* ══════════════════════════════════════════════════════════════
   Pipeline Dashboard
   ══════════════════════════════════════════════════════════════ */

interface Props {
  filterType?: string; // from sidebar: 공지/업무지시/... or 전체
}

export default function PipelineDashboard({ filterType }: Props) {
  const [items] = useState<PipelineItem[]>(DUMMY_ITEMS);
  const [expandedStages, setExpandedStages] = useState<Set<PipelineStage>>(new Set(STAGES.map(s => s.key)));
  const [stageFilters, setStageFilters] = useState<Record<string, string[]>>({});
  const [statusFilter, setStatusFilter] = useState<ItemStatus[]>([]);
  const [selectedStages, setSelectedStages] = useState<PipelineStage[]>([]);

  const allExpanded = expandedStages.size === STAGES.length;
  const toggleAll = () => setExpandedStages(allExpanded ? new Set() : new Set(STAGES.map(s => s.key)));
  const toggleStage = (k: PipelineStage) => setExpandedStages(prev => { const n = new Set(prev); if (n.has(k)) n.delete(k); else n.add(k); return n; });

  const toggleSubFilter = (stageKey: string, filterLabel: string, option: string) => {
    const key = `${stageKey}::${filterLabel}`;
    setStageFilters(prev => {
      const cur = prev[key] || [];
      return { ...prev, [key]: cur.includes(option) ? cur.filter(x => x !== option) : [...cur, option] };
    });
  };
  const getSubFilter = (stageKey: string, filterLabel: string): string[] => stageFilters[`${stageKey}::${filterLabel}`] || [];
  const toggleStatus = (s: ItemStatus) => setStatusFilter(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  const togglePipelineStage = (s: PipelineStage) => setSelectedStages(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  // apply global + type filter from sidebar
  const globalFiltered = items.filter(i => {
    if (filterType && filterType !== '전체' && i.type !== filterType) return false;
    return true;
  });

  const filteredForStage = (stageKey: PipelineStage) => {
    const stage = STAGES.find(s => s.key === stageKey)!;
    let result = globalFiltered.filter(i => i.stage === stageKey);
    if (statusFilter.length) result = result.filter(i => statusFilter.includes(i.status));
    stage.filters.forEach((f, idx) => {
      const sel = getSubFilter(stageKey, f.label);
      if (sel.length) result = result.filter(i => sel.includes(idx === 0 ? i.sub1 : (i.sub2 || '')));
    });
    return result;
  };

  const countByStatus = (stageItems: PipelineItem[]) => {
    const m = new Map<ItemStatus, number>();
    stageItems.forEach(i => m.set(i.status, (m.get(i.status) || 0) + 1));
    return m;
  };

  const visibleStages = selectedStages.length ? STAGES.filter(s => selectedStages.includes(s.key)) : STAGES;

  return (
    <div style={{ padding: '10px 16px' }}>
      {/* 컨트롤 — 컴팩트 1줄 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
        <button onClick={toggleAll}
          style={{ padding: '3px 10px', borderRadius: 6, border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: 11, cursor: 'pointer', color: '#475569', fontWeight: 600 }}>
          {allExpanded ? '접기' : '펼치기'}
        </button>
        <span style={{ fontSize: 10, color: '#94a3b8' }}>상태:</span>
        {STATUSES.map(s => {
          const active = statusFilter.includes(s.key);
          const cnt = globalFiltered.filter(i => i.status === s.key).length;
          return (
            <button key={s.key} onClick={() => toggleStatus(s.key)}
              style={{ padding: '2px 7px', borderRadius: 10, border: '1px solid', borderColor: active ? s.color : '#e2e8f0', background: active ? s.bg : '#fff', color: active ? s.color : '#94a3b8', fontSize: 10, cursor: 'pointer', fontWeight: active ? 600 : 400, lineHeight: 1.3 }}>
              {s.key}{cnt > 0 ? cnt : ''}
            </button>
          );
        })}
        {statusFilter.length > 0 && <button onClick={() => setStatusFilter([])} style={{ padding: '2px 7px', borderRadius: 10, border: '1px solid #FECACA', background: '#FEF2F2', color: '#EF4444', fontSize: 10, cursor: 'pointer' }}>X</button>}
        <span style={{ marginLeft: 'auto', fontSize: 11, color: '#94a3b8' }}>{globalFiltered.length}건</span>
      </div>

      {/* 파이프라인 흐름 — 클릭 가능, 멀티선택 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginBottom: 10, padding: '5px 8px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0', flexWrap: 'wrap' }}>
        {STAGES.map((s, i) => {
          const cnt = globalFiltered.filter(x => x.stage === s.key).length;
          const active = selectedStages.includes(s.key);
          return (
            <span key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              {i > 0 && <span style={{ color: '#cbd5e1', fontSize: 12 }}>&rarr;</span>}
              <button onClick={() => togglePipelineStage(s.key)}
                style={{ padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 600, background: active ? s.color : s.bg, color: active ? '#fff' : s.color, border: `1px solid ${active ? s.color : 'transparent'}`, cursor: 'pointer', transition: 'all 0.1s' }}>
                {s.label} {cnt}
              </button>
            </span>
          );
        })}
        {selectedStages.length > 0 && <button onClick={() => setSelectedStages([])} style={{ padding: '2px 7px', borderRadius: 10, border: '1px solid #FECACA', background: '#FEF2F2', color: '#EF4444', fontSize: 10, cursor: 'pointer', marginLeft: 4 }}>초기화</button>}
      </div>

      {/* 카드 그리드 */}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(visibleStages.length, 3)}, 1fr)`, gap: 10 }}>
        {visibleStages.map(stage => {
          const stageItems = filteredForStage(stage.key);
          const allStageItems = globalFiltered.filter(i => i.stage === stage.key);
          const isOpen = expandedStages.has(stage.key);
          const counts = countByStatus(allStageItems);

          return (
            <div key={stage.key} style={{ background: '#fff', borderRadius: 10, border: `1.5px solid ${stage.color}33`, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              {/* 헤더 */}
              <div onClick={() => toggleStage(stage.key)}
                style={{ padding: '8px 10px', background: stage.bg, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, borderBottom: `1px solid ${stage.color}22` }}>
                {isOpen ? <ChevronUp size={12} color={stage.color} /> : <ChevronDown size={12} color={stage.color} />}
                <span style={{ fontSize: 13, fontWeight: 700, color: stage.color, flex: 1 }}>{stage.label}</span>
                <span style={{ fontSize: 11, color: stage.color, fontWeight: 600 }}>{stageItems.length}</span>
              </div>

              {/* 상태 미니바 */}
              <div style={{ display: 'flex', gap: 3, padding: '4px 8px', flexWrap: 'wrap' }}>
                {STATUSES.map(s => {
                  const c = counts.get(s.key) || 0;
                  if (!c) return null;
                  return <span key={s.key} style={{ fontSize: 9, padding: '0px 5px', borderRadius: 8, background: s.bg, color: s.color, fontWeight: 600, lineHeight: '16px' }}>{s.key}{c}</span>;
                })}
              </div>

              {isOpen && (
                <>
                  {/* 멀티필터 */}
                  <div style={{ padding: '2px 8px 6px', display: 'flex', flexDirection: 'column', gap: 2, borderBottom: '1px solid #f1f5f9' }}>
                    {stage.filters.map(f => {
                      const sel = getSubFilter(stage.key, f.label);
                      return (
                        <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 9, color: '#94a3b8', fontWeight: 600, minWidth: 24 }}>{f.label}</span>
                          {f.options.map(opt => {
                            const active = sel.includes(opt);
                            return (
                              <button key={opt} onClick={() => toggleSubFilter(stage.key, f.label, opt)}
                                style={{ padding: '1px 6px', borderRadius: 8, border: '1px solid', borderColor: active ? stage.color : '#e2e8f0', background: active ? `${stage.color}15` : '#fff', color: active ? stage.color : '#64748b', fontSize: 9, cursor: 'pointer', fontWeight: active ? 600 : 400, lineHeight: 1.4 }}>
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>

                  {/* 아이템 리스트 */}
                  <div style={{ flex: 1, overflow: 'auto', maxHeight: 280 }}>
                    {stageItems.length === 0 ? (
                      <div style={{ padding: 12, textAlign: 'center', fontSize: 11, color: '#94a3b8' }}>없음</div>
                    ) : stageItems.map(item => {
                      const st = statusOf(item.status);
                      const pt = POST_TYPE_STYLES[item.type];
                      return (
                        <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px', borderBottom: '1px solid #f8fafc', fontSize: 11 }}
                          onMouseEnter={e => e.currentTarget.style.background = '#fafbfd'} onMouseLeave={e => e.currentTarget.style.background = ''}>
                          {/* 유형 */}
                          <span style={{ padding: '0px 4px', borderRadius: 4, fontSize: 8, fontWeight: 700, background: pt.bg, color: pt.color, flexShrink: 0, lineHeight: '14px' }}>{item.type}</span>
                          {/* 상태 */}
                          <span style={{ padding: '0px 4px', borderRadius: 6, fontSize: 8, fontWeight: 600, background: st.bg, color: st.color, flexShrink: 0, lineHeight: '14px', minWidth: 28, textAlign: 'center' }}>{item.status}</span>
                          {/* 분류 */}
                          <span style={{ padding: '0px 4px', borderRadius: 4, fontSize: 8, background: '#f1f5f9', color: '#475569', flexShrink: 0 }}>{item.sub1}{item.sub2 ? `·${item.sub2}` : ''}</span>
                          {/* 제목 */}
                          <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#1e293b', fontWeight: 500 }}>{item.title}</span>
                          {/* 담당 */}
                          {item.assignee && <span style={{ fontSize: 9, color: '#64748b', flexShrink: 0 }}>{item.assignee}</span>}
                          {/* 링크 */}
                          {item.link && <a href={item.link} style={{ flexShrink: 0, color: '#3B82F6', display: 'flex' }} title={item.link}><ExternalLink size={10} /></a>}
                          {/* 날짜 */}
                          {item.date && <span style={{ fontSize: 8, color: '#94a3b8', flexShrink: 0 }}>{item.date}</span>}
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
