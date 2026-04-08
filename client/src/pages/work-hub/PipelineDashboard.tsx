import { useState } from 'react';
import { ChevronDown, ChevronUp, ExternalLink, User } from 'lucide-react';
import { STAGES, STATUSES, DUMMY_ITEMS, statusOf, POST_TYPE_STYLES, type PipelineStage, type ItemStatus, type PostType, type PipelineItem } from './pipeline-data';

/* ══════════════════════════════════════════════════════════════
   Pipeline Dashboard
   ══════════════════════════════════════════════════════════════ */

interface Props {
  filterType?: string;
  activePath?: string[]; // 사이드바 폴더 경로
}

export default function PipelineDashboard({ filterType, activePath = [] }: Props) {
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

      {/* 파이프라인 흐름 — 멀티선택 + 하위 필터 인라인 */}
      <div style={{ display: 'flex', gap: 2, marginBottom: 10, overflowX: 'auto' }}>
        {STAGES.map((s, i) => {
          const cnt = globalFiltered.filter(x => x.stage === s.key).length;
          const active = selectedStages.includes(s.key);
          return (
            <div key={s.key} style={{ display: 'flex', alignItems: 'flex-start', gap: 2, flexShrink: 0 }}>
              {i > 0 && <span style={{ color: '#cbd5e1', fontSize: 12, marginTop: 4 }}>&rarr;</span>}
              <div style={{ background: '#f8fafc', borderRadius: 8, border: `1px solid ${active ? s.color : '#e2e8f0'}`, padding: '4px 6px', minWidth: 0 }}>
                {/* 단계 헤더 */}
                <button onClick={() => togglePipelineStage(s.key)}
                  style={{ display: 'block', width: '100%', padding: '2px 6px', borderRadius: 6, fontSize: 11, fontWeight: 700, background: active ? s.color : s.bg, color: active ? '#fff' : s.color, border: 'none', cursor: 'pointer', marginBottom: 3, textAlign: 'left' }}>
                  {s.label} {cnt}
                </button>
                {/* 하위 필터들 */}
                {s.filters.map(f => (
                  <div key={f.label} style={{ marginBottom: 2 }}>
                    <div style={{ fontSize: 8, color: '#94a3b8', fontWeight: 600, marginBottom: 1 }}>{f.label}</div>
                    <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      {f.options.map(opt => {
                        const sel = getSubFilter(s.key, f.label);
                        const isActive = sel.includes(opt);
                        return (
                          <button key={opt} onClick={() => toggleSubFilter(s.key, f.label, opt)}
                            style={{ padding: '1px 5px', borderRadius: 6, border: '1px solid', borderColor: isActive ? s.color : '#e2e8f0', background: isActive ? `${s.color}18` : '#fff', color: isActive ? s.color : '#64748b', fontSize: 9, cursor: 'pointer', fontWeight: isActive ? 600 : 400, lineHeight: 1.3 }}>
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        {selectedStages.length > 0 && <button onClick={() => { setSelectedStages([]); setStageFilters({}); }} style={{ padding: '2px 7px', borderRadius: 8, border: '1px solid #FECACA', background: '#FEF2F2', color: '#EF4444', fontSize: 10, cursor: 'pointer', alignSelf: 'flex-start', marginTop: 4, flexShrink: 0 }}>초기화</button>}
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

      {/* ═══ 바로가기 링크 (ShortcutsPage 통합) ═══ */}
      <div style={{ marginTop: 14 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', marginBottom: 6 }}>
          바로가기 · 서비스 링크 {activePath.length > 0 && <span style={{ color: '#3B82F6' }}>({activePath.join(' > ')})</span>}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {SHORTCUT_GROUPS.map(g => (
            <div key={g.title} style={{ background: '#fff', borderRadius: 8, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              <div style={{ padding: '5px 8px', background: g.bg, fontSize: 10, fontWeight: 700, color: g.color, display: 'flex', alignItems: 'center', gap: 4 }}>
                <span>{g.emoji}</span> {g.title} <span style={{ marginLeft: 'auto', fontSize: 9, color: '#94a3b8' }}>{g.links.length}</span>
              </div>
              <div style={{ padding: '3px 0' }}>
                {g.links.map((l, i) => (
                  <a key={i} href={l.url} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '2px 8px', fontSize: 10, color: '#475569', textDecoration: 'none' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.background = ''}>
                    <ExternalLink size={8} color="#94a3b8" style={{ flexShrink: 0 }} />
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

/* ═══ 바로가기 데이터 (ShortcutsPage에서 이관) ═══ */
const SHORTCUT_GROUPS = [
  { title: '핵심 시스템', emoji: '🖥️', color: '#3B82F6', bg: '#EFF6FF', links: [
    { name: 'AI Studio (직원업무)', url: 'http://54.116.15.136:81/app' },
    { name: 'Work Studio (관리자)', url: 'http://54.116.15.136:80' },
    { name: 'AITe CBT (시험)', url: 'http://54.116.15.136:82' },
    { name: 'API Gateway', url: 'https://bmidcy9z17.execute-api.ap-northeast-2.amazonaws.com' },
  ]},
  { title: '홈페이지', emoji: '🌐', color: '#10B981', bg: '#F0FDF4', links: [
    { name: 'TESOL 교육', url: 'https://hu-tec.github.io/TESOL/' },
    { name: '번역 허브', url: 'https://hu-tec.github.io/translation-hub/' },
    { name: 'AI 윤리', url: 'https://hu-tec.github.io/ai-ethics/' },
    { name: '고전번역', url: 'https://hu-tec.github.io/classic-translation/' },
    { name: '휴텍씨', url: 'https://hu-tec.github.io/company_hutec/' },
    { name: '대표 블로그', url: 'https://hu-tec.github.io/personal_page/' },
  ]},
  { title: 'Figma 디자인', emoji: '🎨', color: '#7C3AED', bg: '#F5F3FF', links: [
    { name: '강사 커리', url: 'https://www.figma.com/make/60eyAaz66uEvV18k3WWbNS/' },
    { name: '교재', url: 'https://www.figma.com/make/Tvkp0caVoCt1lHp5iUOqaB/' },
    { name: '마케팅 관리', url: 'https://www.figma.com/make/rKsKUorM8F7DDmVHvCaOqc/' },
    { name: '문제은행', url: 'https://www.figma.com/make/cRwrhKVBI5U9iSTopaS1DB/' },
    { name: 'DB 페이지', url: 'https://www.figma.com/make/Vxx6ETPoYGEr5R6Ue754Qa/' },
    { name: 'DB v2', url: 'https://www.figma.com/make/uGCONfLFy7YzzZEbu1yiQQ/' },
    { name: '신청서 관리', url: 'https://www.figma.com/make/ity5waanbLT9oPRRExZKvb/' },
    { name: '신청서 v2', url: 'https://www.figma.com/make/wBm9HdOhHnS2qPECVAjZR8/' },
    { name: '바로가기', url: 'https://www.figma.com/make/eHP8SI0rLMYd5IUmZgHiHa/' },
    { name: '랜딩페이지', url: 'https://www.figma.com/make/Fn89JyeeaizgKWgdZgKnvg/' },
  ]},
  { title: 'Figma 사이트', emoji: '📄', color: '#F59E0B', bg: '#FFFBEB', links: [
    { name: '원페이지', url: 'https://www.figma.com/make/iof9l7wW8Z0C9qOl5qbnsf/' },
    { name: '대표님 브랜딩', url: 'https://www.figma.com/make/s4NzrfoNsGb8iUrzOrOHte/' },
    { name: '대표님 v2', url: 'https://www.figma.com/make/R7OHhpRkfYjPOFvy1vSW8g/' },
    { name: 'HUTECH 홈페이지', url: 'https://www.figma.com/make/c1RFhsKK1j8TN4aLGaboES/' },
    { name: '서비스 소개', url: 'https://www.figma.com/make/0nGaGvepD5B0K70TAj4NUd/' },
    { name: '전문가 신청', url: 'https://www.figma.com/make/gHkjoPMMFmD4WcNmr5DvAg/' },
    { name: '반도체/조선/방산', url: 'https://www.figma.com/make/LPtNYUdip137Y9nR8lKIt9/' },
    { name: '피지컬', url: 'https://www.figma.com/make/IYMoNGvNPwDKknlxmKE52S/' },
    { name: '고전번역', url: 'https://www.figma.com/make/Io5vr1qbMIyZ16PpwsOtGL/' },
  ]},
  { title: 'Figma UIUX/매뉴얼', emoji: '📖', color: '#EC4899', bg: '#FDF2F8', links: [
    { name: 'TESOL UIUX', url: 'https://www.figma.com/make/kWloAMfn7fpvjGuP8HexYe/' },
    { name: '매뉴얼 리스트', url: 'https://www.figma.com/make/KI4I6C2gW90ox9gF2GCpW9/' },
    { name: '규정관리', url: 'https://www.figma.com/make/huQZzxU7XBHTQgW057Sejx/' },
  ]},
  { title: 'Figma 기타', emoji: '🧩', color: '#6366F1', bg: '#EEF2FF', links: [
    { name: '업무일지', url: 'https://www.figma.com/make/AaTBV4kZ3hTTaSfvwJJyZl/' },
    { name: '레벨테스트', url: 'https://www.figma.com/make/ySCF7q7vGNEmwJzWXEucKR/' },
    { name: '레슨플랜', url: 'https://www.figma.com/make/06sEVqoowsAdlhMcrlkgq6/' },
    { name: 'AI STUDIO', url: 'https://www.figma.com/make/cT4lO1pvdmRev3J9EwSnxZ/' },
  ]},
  { title: '배포 홈페이지', emoji: '🚀', color: '#0EA5E9', bg: '#F0F9FF', links: [
    { name: '대표님홈페이지', url: 'https://www.figma.com/make/UitESewEV8DEcjURgkVKxX/' },
    { name: '휴텍씨홈페이지', url: 'https://www.figma.com/make/SOZJUzzTnX6RtPnfCQaxcb/' },
    { name: 'TESOL 홈페이지', url: 'https://www.figma.com/make/TjnmN0iVLDVrCQ6qqo2Dmn/' },
    { name: 'IITA협회', url: 'https://www.figma.com/make/QjixZHU8IpzxvN3DGwbZ80/' },
    { name: 'AITE', url: 'https://www.figma.com/make/ziRs8LdTN0OQi3u6wJsujd/' },
    { name: '번역_아랍어', url: 'https://www.figma.com/make/bCylC0wkVJptWB7pcAXp5W/' },
    { name: '통독 전체 v2', url: 'https://www.figma.com/make/akUxACaLlCP9OvFCxl4Soi/' },
    { name: '번역전체', url: 'https://www.figma.com/make/0nGaGvepD5B0K70TAj4NUd/' },
  ]},
  { title: 'GitHub 리포', emoji: '📦', color: '#475569', bg: '#F8FAFC', links: [
    { name: 'ai_studio', url: 'https://github.com/hu-tec/ai_studio' },
    { name: 'work_studio', url: 'https://github.com/hu-tec/work_studio' },
    { name: 'AITe_CBT', url: 'https://github.com/hu-tec/AITe_CBT' },
  ]},
];
