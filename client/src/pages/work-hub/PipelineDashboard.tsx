import { useState } from 'react';
import { ChevronDown, ChevronRight, ExternalLink, User } from 'lucide-react';
import { PIPELINES, STATUSES, DUMMY_ITEMS, statusOf, POST_TYPE_STYLES, type Pipeline, type PipelineItem } from './pipeline-data';

/* ══════════════════════════════════════════════════════════════
   Multi-Pipeline Dashboard
   ══════════════════════════════════════════════════════════════ */

interface Props { filterType?: string; activePath?: string[]; }

export default function PipelineDashboard({ filterType, activePath = [] }: Props) {
  const [items] = useState<PipelineItem[]>(DUMMY_ITEMS);
  const [expandedPipelines, setExpandedPipelines] = useState<Set<string>>(new Set(PIPELINES.map(p => p.id)));
  const [expandedStages, setExpandedStages] = useState<Set<string>>(new Set());

  const togglePipeline = (id: string) => setExpandedPipelines(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const toggleStage = (key: string) => setExpandedStages(prev => { const n = new Set(prev); if (n.has(key)) n.delete(key); else n.add(key); return n; });
  const allExpanded = expandedPipelines.size === PIPELINES.length;
  const toggleAll = () => setExpandedPipelines(allExpanded ? new Set() : new Set(PIPELINES.map(p => p.id)));

  const itemsFor = (pipelineId: string, stageKey?: string) => {
    let result = items.filter(i => i.pipelineId === pipelineId);
    if (filterType && filterType !== '전체') result = result.filter(i => i.type === filterType);
    if (stageKey) result = result.filter(i => i.stageKey === stageKey);
    return result;
  };

  return (
    <div style={{ padding: '8px 12px', overflow: 'auto' }}>
      {/* 컨트롤 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
        <button onClick={toggleAll} style={{ padding: '3px 8px', borderRadius: 5, border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: 10, cursor: 'pointer', color: '#475569', fontWeight: 600 }}>{allExpanded ? '접기' : '펼치기'}</button>
        <span style={{ fontSize: 10, color: '#94a3b8' }}>파이프라인 {PIPELINES.length}개</span>
        {activePath.length > 0 && <span style={{ fontSize: 10, color: '#3B82F6', fontWeight: 600 }}>경로: {activePath.join(' > ')}</span>}
      </div>

      {/* 파이프라인 목록 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {PIPELINES.map(pl => {
          const isOpen = expandedPipelines.has(pl.id);
          const totalItems = itemsFor(pl.id).length;

          return (
            <div key={pl.id} style={{ background: '#fff', borderRadius: 8, border: `1.5px solid ${pl.color}33`, overflow: 'hidden' }}>
              {/* 파이프라인 헤더 */}
              <div onClick={() => togglePipeline(pl.id)}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', background: pl.bg, cursor: 'pointer', borderBottom: isOpen ? `1px solid ${pl.color}22` : 'none' }}>
                {isOpen ? <ChevronDown size={11} color={pl.color} /> : <ChevronRight size={11} color={pl.color} />}
                <span style={{ fontSize: 12, fontWeight: 700, color: pl.color }}>{pl.icon} {pl.name}</span>
                <span style={{ fontSize: 10, color: pl.color }}>{totalItems}건</span>
                {/* 스테이지 미니 요약 */}
                <div style={{ display: 'flex', gap: 2, marginLeft: 8 }}>
                  {pl.stages.map((s, i) => (
                    <span key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      {i > 0 && <span style={{ color: '#cbd5e1', fontSize: 8 }}>→</span>}
                      <span style={{ fontSize: 9, color: '#64748b', padding: '0 3px', borderRadius: 4, background: '#f1f5f9' }}>{s.label}</span>
                    </span>
                  ))}
                </div>
                {/* 관련 페이지 링크 */}
                {pl.relatedPages && (
                  <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
                    {pl.relatedPages.map(rp => (
                      <a key={rp.path} href={`/app${rp.path}`} onClick={e => e.stopPropagation()}
                        style={{ fontSize: 9, color: pl.color, textDecoration: 'none', padding: '1px 5px', borderRadius: 4, background: `${pl.color}10`, border: `1px solid ${pl.color}30` }}>{rp.label}</a>
                    ))}
                  </div>
                )}
              </div>

              {/* 스테이지 상세 */}
              {isOpen && (
                <div style={{ display: 'flex', gap: 0, borderTop: `1px solid ${pl.color}15` }}>
                  {pl.stages.map((stage, idx) => {
                    const stgKey = `${pl.id}::${stage.key}`;
                    const stgItems = itemsFor(pl.id, stage.key);
                    const stgOpen = expandedStages.has(stgKey);

                    return (
                      <div key={stage.key} style={{ flex: 1, borderRight: idx < pl.stages.length - 1 ? '1px solid #f1f5f9' : 'none', minWidth: 0 }}>
                        {/* 스테이지 헤더 */}
                        <button onClick={() => toggleStage(stgKey)}
                          style={{ display: 'flex', alignItems: 'center', gap: 3, width: '100%', padding: '4px 6px', border: 'none', background: '#fafbfd', cursor: 'pointer', fontSize: 10, fontWeight: 600, color: '#475569', textAlign: 'left', borderBottom: '1px solid #f1f5f9' }}>
                          {stgOpen ? <ChevronDown size={9} /> : <ChevronRight size={9} />}
                          {stage.label}
                          <span style={{ marginLeft: 'auto', fontSize: 9, color: '#94a3b8' }}>{stgItems.length}</span>
                        </button>

                        {/* 필터 + 아이템 */}
                        {stgOpen && (
                          <div style={{ padding: '3px 4px' }}>
                            {/* 필터 칩 */}
                            {stage.filters.map(f => (
                              <div key={f.label} style={{ display: 'flex', gap: 2, flexWrap: 'wrap', marginBottom: 2 }}>
                                <span style={{ fontSize: 8, color: '#94a3b8', fontWeight: 600 }}>{f.label}</span>
                                {f.options.map(opt => (
                                  <span key={opt} style={{ fontSize: 8, padding: '0 4px', borderRadius: 4, background: '#f1f5f9', color: '#64748b' }}>{opt}</span>
                                ))}
                              </div>
                            ))}
                            {/* 아이템 */}
                            {stgItems.length === 0 ? (
                              <div style={{ fontSize: 9, color: '#cbd5e1', padding: '4px 0', textAlign: 'center' }}>—</div>
                            ) : stgItems.map(item => {
                              const st = statusOf(item.status);
                              const pt = POST_TYPE_STYLES[item.type];
                              return (
                                <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '2px 3px', fontSize: 9, borderBottom: '1px solid #f8fafc' }}>
                                  <span style={{ padding: '0 3px', borderRadius: 3, fontSize: 7, fontWeight: 700, background: pt.bg, color: pt.color }}>{item.type}</span>
                                  <span style={{ padding: '0 3px', borderRadius: 3, fontSize: 7, background: st.bg, color: st.color }}>{item.status}</span>
                                  <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#1e293b' }}>{item.title}</span>
                                  {item.link && <a href={item.link} style={{ color: '#3B82F6' }}><ExternalLink size={8} /></a>}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ═══ 바로가기 링크 ═══ */}
      <div style={{ marginTop: 12 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', marginBottom: 6 }}>
          바로가기 {activePath.length > 0 && <span style={{ color: '#3B82F6' }}>({activePath.join(' > ')})</span>}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
          {SHORTCUT_GROUPS.map(g => (
            <div key={g.title} style={{ background: '#fff', borderRadius: 6, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              <div style={{ padding: '3px 6px', background: g.bg, fontSize: 9, fontWeight: 700, color: g.color, display: 'flex', alignItems: 'center', gap: 3 }}>
                {g.emoji} {g.title} <span style={{ marginLeft: 'auto', fontSize: 8, color: '#94a3b8' }}>{g.links.length}</span>
              </div>
              <div style={{ padding: '2px 0' }}>
                {g.links.map((l, i) => (
                  <a key={i} href={l.url} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '1px 6px', fontSize: 9, color: '#475569', textDecoration: 'none' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.background = ''}>
                    <ExternalLink size={7} color="#94a3b8" style={{ flexShrink: 0 }} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.name}</span>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══ 바로가기 데이터 ═══ */
const SHORTCUT_GROUPS = [
  { title: '핵심시스템', emoji: '🖥️', color: '#3B82F6', bg: '#EFF6FF', links: [
    { name: 'AI Studio', url: 'http://54.116.15.136:81/app' },
    { name: 'Work Studio', url: 'http://54.116.15.136:80' },
    { name: 'AITe CBT', url: 'http://54.116.15.136:82' },
  ]},
  { title: '홈페이지', emoji: '🌐', color: '#10B981', bg: '#F0FDF4', links: [
    { name: 'TESOL', url: 'https://hu-tec.github.io/TESOL/' },
    { name: '번역허브', url: 'https://hu-tec.github.io/translation-hub/' },
    { name: 'AI윤리', url: 'https://hu-tec.github.io/ai-ethics/' },
    { name: '고전번역', url: 'https://hu-tec.github.io/classic-translation/' },
    { name: '휴텍씨', url: 'https://hu-tec.github.io/company_hutec/' },
    { name: '대표블로그', url: 'https://hu-tec.github.io/personal_page/' },
  ]},
  { title: 'Figma', emoji: '🎨', color: '#7C3AED', bg: '#F5F3FF', links: [
    { name: '강사커리', url: 'https://www.figma.com/make/60eyAaz66uEvV18k3WWbNS/' },
    { name: '교재', url: 'https://www.figma.com/make/Tvkp0caVoCt1lHp5iUOqaB/' },
    { name: '마케팅', url: 'https://www.figma.com/make/rKsKUorM8F7DDmVHvCaOqc/' },
    { name: '문제은행', url: 'https://www.figma.com/make/cRwrhKVBI5U9iSTopaS1DB/' },
    { name: 'DB v2', url: 'https://www.figma.com/make/uGCONfLFy7YzzZEbu1yiQQ/' },
    { name: '신청서v2', url: 'https://www.figma.com/make/wBm9HdOhHnS2qPECVAjZR8/' },
    { name: '랜딩페이지', url: 'https://www.figma.com/make/Fn89JyeeaizgKWgdZgKnvg/' },
    { name: 'AI STUDIO', url: 'https://www.figma.com/make/cT4lO1pvdmRev3J9EwSnxZ/' },
    { name: '반도체', url: 'https://www.figma.com/make/LPtNYUdip137Y9nR8lKIt9/' },
    { name: '고전번역', url: 'https://www.figma.com/make/Io5vr1qbMIyZ16PpwsOtGL/' },
  ]},
  { title: 'GitHub', emoji: '📦', color: '#475569', bg: '#F8FAFC', links: [
    { name: 'ai_studio', url: 'https://github.com/hu-tec/ai_studio' },
    { name: 'work_studio', url: 'https://github.com/hu-tec/work_studio' },
    { name: 'AITe_CBT', url: 'https://github.com/hu-tec/AITe_CBT' },
  ]},
];
