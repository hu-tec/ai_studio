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

      {/* ═══ 바로가기 — 담당자별 + 라이브 서비스 ═══ */}
      <div style={{ marginTop: 12 }}>
        {/* 라이브 서비스 + GitHub */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
          {LIVE_LINKS.map(g => (
            <div key={g.title} style={{ flex: 1, background: '#fff', borderRadius: 6, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              <div style={{ padding: '3px 6px', background: g.bg, fontSize: 9, fontWeight: 700, color: g.color }}>{g.emoji} {g.title}</div>
              {g.links.map((l, i) => (
                <a key={i} href={l.url} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '1px 6px', fontSize: 9, color: '#475569', textDecoration: 'none' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.background = ''}>
                  <ExternalLink size={7} color="#94a3b8" />{l.name}
                </a>
              ))}
            </div>
          ))}
        </div>

        {/* 담당자별 Figma 프로젝트 */}
        {SHORTCUT_SECTIONS.map(section => (
          <div key={section.person} style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: section.color, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
              PROJECTS ({section.person}) <span style={{ fontSize: 9, color: '#94a3b8', fontWeight: 400 }}>{section.count}개</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 5 }}>
              {section.groups.map(g => (
                <div key={`${section.person}-${g.code}`} style={{ background: '#fff', borderRadius: 6, border: `1px solid ${section.color}30`, overflow: 'hidden' }}>
                  <div style={{ padding: '2px 6px', background: section.bg, fontSize: 9, fontWeight: 700, color: section.color, display: 'flex', alignItems: 'center', gap: 3 }}>
                    {g.code}. {g.title} <span style={{ marginLeft: 'auto', fontSize: 8, color: '#94a3b8' }}>{g.count}</span>
                  </div>
                  {g.links.map((l: any, i: number) => (
                    <a key={i} href={l.url} target="_blank" rel="noopener noreferrer"
                      style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '1px 6px', fontSize: 9, color: '#475569', textDecoration: 'none' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.background = ''}>
                      <ExternalLink size={7} color={section.color} />
                      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.name}</span>
                      {l.date && <span style={{ fontSize: 8, color: '#94a3b8', flexShrink: 0 }}>{l.date}</span>}
                    </a>
                  ))}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══ 바로가기 — 담당자별 프로젝트 (ShortcutsPage 원본 구조) ═══ */
const SHORTCUT_SECTIONS = [
  { person: '차지예', count: 33, color: '#7C3AED', bg: '#F5F3FF', groups: [
    { code: 'A', title: '개별홈페이지', count: 9, links: [
      { name: '대표님홈페이지', url: 'https://www.figma.com/make/UitESewEV8DEcjURgkVKxX/' },
      { name: '휴텍씨홈페이지', url: 'https://www.figma.com/make/SOZJUzzTnX6RtPnfCQaxcb/' },
      { name: '번역전체', url: 'https://www.figma.com/make/0nGaGvepD5B0K70TAj4NUd/' },
      { name: '번역사이트_고전', url: 'https://www.figma.com/make/22oZmCgsA0nQk0YNizokPS/' },
      { name: 'TESOL 홈페이지', url: 'https://www.figma.com/make/TjnmN0iVLDVrCQ6qqo2Dmn/' },
      { name: 'IITA협회', url: 'https://www.figma.com/make/QjixZHU8IpzxvN3DGwbZ80/' },
      { name: 'AITE', url: 'https://www.figma.com/make/ziRs8LdTN0OQi3u6wJsujd/' },
      { name: '번역사이트_아랍어', url: 'https://www.figma.com/make/bCylC0wkVJptWB7pcAXp5W/', date: '03.19' },
      { name: '통독_전체_v2', url: 'https://www.figma.com/make/akUxACaLlCP9OvFCxl4Soi/', date: '03.19' },
    ]},
    { code: 'B', title: '데이터', count: 19, links: [
      { name: 'AI STUDIO', url: 'https://www.figma.com/make/cT4lO1pvdmRev3J9EwSnxZ/' },
      { name: '신청서관리', url: 'https://www.figma.com/make/BaLDHmzgYewuB67ix69efj/' },
      { name: '강의시간표', url: 'https://www.figma.com/make/m2bQEhHLuobcGWtAM6IM4G/' },
      { name: '프롬프트샘플', url: 'https://www.figma.com/make/e4pRets7H5qOfYaZwZiwaU/' },
      { name: '면접플로우', url: 'https://www.figma.com/make/NrnXzR1Fkab1qJiuSXcS9w/' },
      { name: '업무일지', url: 'https://www.figma.com/make/PWBXhOKfRhCpe1PCN4Zvbf/' },
      { name: '규정_레이아웃공통', url: 'https://www.figma.com/make/6D0LzlrDhSN4qkHGyluFlz/' },
      { name: '규정매뉴얼', url: 'https://www.figma.com/make/ys5GQ3XYIN1bsWXcxoqBxC/' },
      { name: '시험지_응시자용', url: 'https://www.figma.com/make/d5MXqC3PtvFI7Ye03lSMCx/' },
      { name: '상담관리시스템', url: 'https://www.figma.com/make/gP07Sq3qQGcMJRMk3oKt9p/' },
      { name: '사진모음', url: 'https://www.figma.com/make/d8wm1SkBtFMdXHkDvgXZA5/' },
      { name: '미팅신청폼', url: 'https://www.figma.com/make/RNBVN2MX8sO8K1CCUuzFp7/' },
      { name: '실적_거래처_아웃콜', url: 'https://www.figma.com/make/SSWXLtj7Y3Qv1kqXMfKPI5/' },
      { name: '미수금관리', url: 'https://www.figma.com/make/7C5JNg2oE9bAj8KnkRA9Al/' },
      { name: '관리자통합시스템', url: 'https://www.figma.com/make/kowZcVk9PeKVCrnGd3AG2Y/' },
      { name: '업무및보안준수_서약서', url: 'https://www.figma.com/make/G8KgWb7BpmxtGNbUhAP1gQ/' },
      { name: '출퇴근관리시스템', url: 'https://www.figma.com/make/SwVqROPmC9bwqY7ZawKODO/' },
      { name: '평가기준설정', url: 'https://www.figma.com/make/hwQ9CKSdzmuTZQtIDgI737/' },
      { name: '사내업무지침', url: 'https://www.figma.com/make/zNW5hljdQR9ERzmtIxOuyc/' },
    ]},
    { code: 'C', title: '개별(출력용)', count: 5, links: [
      { name: '출력용_면접관리', url: 'https://www.figma.com/make/LRPaDtZ0fQPWMEcMcg9pUM/' },
      { name: '출력용_강사지원자', url: 'https://www.figma.com/make/IMQ5j738rY41AXhUc8om55/' },
      { name: '출력용_전문가지원', url: 'https://www.figma.com/make/W6ualQ72O2HrqWORKZqZfq/' },
      { name: '출력용_번역가지원', url: 'https://www.figma.com/make/P2DFSE1YZS42rcbVXucbS1/' },
      { name: '출력용_강사면접플로우', url: 'https://www.figma.com/make/VyYeBtOudiFDJewI5hjL0B/' },
    ]},
  ]},
  { person: '황준걸', count: 25, color: '#0EA5E9', bg: '#F0F9FF', groups: [
    { code: 'A', title: '데이터', count: 6, links: [
      { name: '감사 처리', url: 'https://www.figma.com/make/60eyAaz66uEvV18k3WWbNS/', date: '03.14' },
      { name: '교재', url: 'https://www.figma.com/make/Tvkp0caVoCt1lHp5iUOqaB/', date: '03.15' },
      { name: '마케팅', url: 'https://www.figma.com/make/rKsKUorM8F7DDmVHvCaOqc/', date: '03.10' },
      { name: '문제은행 사이트', url: 'https://www.figma.com/make/cRwrhKVBI5U9iSTopaS1DB/', date: '03.11' },
      { name: 'DB', url: 'https://www.figma.com/make/Vxx6ETPoYGEr5R6Ue754Qa/', date: '03.12' },
      { name: 'DB v2', url: 'https://www.figma.com/make/uGCONfLFy7YzzZEbu1yiQQ/', date: '03.16' },
    ]},
    { code: 'B', title: '관리자', count: 4, links: [
      { name: '신청서 관리', url: 'https://www.figma.com/make/ity5waanbLT9oPRRExZKvb/', date: '03.01' },
      { name: '신청서 관리 v2', url: 'https://www.figma.com/make/wBm9HdOhHnS2qPECVAjZR8/', date: '03.05' },
      { name: '바로가기 페이지', url: 'https://www.figma.com/make/eHP8SI0rLMYd5IUmZgHiHa/', date: '03.16' },
      { name: '랜딩페이지 관리', url: 'https://www.figma.com/make/Fn89JyeeaizgKWgdZgKnvg/', date: '03.12' },
    ]},
    { code: 'C', title: '사용자', count: 5, links: [
      { name: '원페이지', url: 'https://www.figma.com/make/iof9l7wW8Z0C9qOl5qbnsf/' },
      { name: '대표님 브랜딩', url: 'https://www.figma.com/make/s4NzrfoNsGb8iUrzOrOHte/' },
      { name: '대표님 브랜딩 V2', url: 'https://www.figma.com/make/R7OHhpRkfYjPOFvy1vSW8g/' },
      { name: 'HUTECH 홈페이지', url: 'https://www.figma.com/make/c1RFhsKK1j8TN4aLGaboES/' },
      { name: '휴텍씨 서비스 소개', url: 'https://www.figma.com/make/0nGaGvepD5B0K70TAj4NUd/' },
    ]},
    { code: 'D', title: '전문가', count: 1, links: [
      { name: '전문가 신청 1단계', url: 'https://www.figma.com/make/gHkjoPMMFmD4WcNmr5DvAg/' },
    ]},
    { code: 'E', title: '개별페이지', count: 3, links: [
      { name: '반도체/조선/방산', url: 'https://www.figma.com/make/LPtNYUdip137Y9nR8lKIt9/' },
      { name: '피지컬', url: 'https://www.figma.com/make/IYMoNGvNPwDKknlxmKE52S/' },
      { name: '고전번역', url: 'https://www.figma.com/make/Io5vr1qbMIyZ16PpwsOtGL/' },
    ]},
    { code: 'F', title: 'UIUX', count: 1, links: [
      { name: '이사님(TESOL)', url: 'https://www.figma.com/make/kWloAMfn7fpvjGuP8HexYe/' },
    ]},
    { code: 'G', title: '매뉴얼', count: 2, links: [
      { name: '매뉴얼 리스트', url: 'https://www.figma.com/make/KI4I6C2gW90ox9gF2GCpW9/' },
      { name: '규정관리', url: 'https://www.figma.com/make/huQZzxU7XBHTQgW057Sejx/' },
    ]},
    { code: 'H', title: '그외', count: 3, links: [
      { name: '업무일지', url: 'https://www.figma.com/make/AaTBV4kZ3hTTaSfvwJJyZl/' },
      { name: '레벨테스트', url: 'https://www.figma.com/make/ySCF7q7vGNEmwJzWXEucKR/' },
      { name: '레슨플랜', url: 'https://www.figma.com/make/06sEVqoowsAdlhMcrlkgq6/' },
    ]},
  ]},
];

/* 라이브 서비스 + GitHub */
const LIVE_LINKS = [
  { title: '핵심시스템', emoji: '🖥️', color: '#3B82F6', bg: '#EFF6FF', links: [
    { name: 'AI Studio (직원)', url: 'http://54.116.15.136:81/app' },
    { name: 'Work Studio (관리)', url: 'http://54.116.15.136:80' },
    { name: 'AITe CBT (시험)', url: 'http://54.116.15.136:82' },
  ]},
  { title: '홈페이지(배포)', emoji: '🌐', color: '#10B981', bg: '#F0FDF4', links: [
    { name: 'TESOL', url: 'https://hu-tec.github.io/TESOL/' },
    { name: '번역허브', url: 'https://hu-tec.github.io/translation-hub/' },
    { name: 'AI윤리', url: 'https://hu-tec.github.io/ai-ethics/' },
    { name: '고전번역', url: 'https://hu-tec.github.io/classic-translation/' },
    { name: '휴텍씨', url: 'https://hu-tec.github.io/company_hutec/' },
    { name: '대표블로그', url: 'https://hu-tec.github.io/personal_page/' },
  ]},
  { title: 'GitHub', emoji: '📦', color: '#1e293b', bg: '#F8FAFC', links: [
    { name: 'ai_studio', url: 'https://github.com/hu-tec/ai_studio' },
    { name: 'work_studio', url: 'https://github.com/hu-tec/work_studio' },
    { name: 'AITe_CBT', url: 'https://github.com/hu-tec/AITe_CBT' },
  ]},
];
