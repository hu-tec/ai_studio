import { useMemo, useState, useEffect } from 'react';
import { AlertTriangle, ChevronDown, ChevronRight } from 'lucide-react';
import { SectionCard } from '../components/SectionCard';
import { ChipBar } from '../components/Chip';
import { RuleBadge } from '../components/RuleBadge';
import { DOMAINS, TIERS, INDUSTRIES, MODALITIES } from '../constants';
import { inferGovernance } from '../data';
import type { SampleItem, DomainCode, TierCode, IndustryCode } from '../types';

interface Props { item: SampleItem }

// B안: domain이 트리 루트. tier → industry → leaf(modality·grade는 attribute)
export function PlanBTab({ item }: Props) {
  const [openDomain, setOpenDomain] = useState<DomainCode | null>(item.facets.domain);
  const [openTier, setOpenTier] = useState<TierCode | null>(item.facets.tier);
  const [selected, setSelected] = useState<{domain: DomainCode; tier: TierCode; industry: IndustryCode} | null>({
    domain: item.facets.domain, tier: item.facets.tier, industry: item.facets.industry,
  });

  useEffect(() => {
    setOpenDomain(item.facets.domain);
    setOpenTier(item.facets.tier);
    setSelected({ domain: item.facets.domain, tier: item.facets.tier, industry: item.facets.industry });
  }, [item.id]);

  const gov = useMemo(
    () => selected ? inferGovernance(selected.domain, selected.industry) : null,
    [selected],
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
      <SectionCard title="① 과목 트리 (domain → tier → industry)" subtitle="B안: 과목이 루트">
        <div className="space-y-0.5">
          {DOMAINS.map((d) => (
            <div key={d.code}>
              <button
                className="flex items-center gap-1 text-[12px] font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 rounded px-1 py-0.5 w-full text-left"
                onClick={() => setOpenDomain(openDomain === d.code ? null : d.code)}
              >
                {openDomain === d.code ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                <span>📚 {d.label}</span>
              </button>
              {openDomain === d.code && (
                <div className="ml-1 space-y-0.5">
                  {TIERS.map((t) => (
                    <div key={t.code}>
                      <button
                        className="flex items-center gap-1 text-[11px] hover:bg-slate-100 dark:hover:bg-slate-800 rounded px-1 py-0.5 w-full text-left"
                        onClick={() => setOpenTier(openTier === t.code ? null : t.code)}
                      >
                        {openTier === t.code ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                        <span className="text-slate-700 dark:text-slate-200">📈 {t.label}</span>
                        <span className="text-[9px] text-slate-400">[{t.grades.length}급]</span>
                      </button>
                      {openTier === t.code && (
                        <div className="ml-1 flex flex-wrap gap-0.5 py-0.5">
                          {INDUSTRIES.map((i) => {
                            const active =
                              selected?.domain === d.code &&
                              selected?.tier === t.code &&
                              selected?.industry === i.code;
                            return (
                              <button
                                key={i.code}
                                className={`text-[10px] px-1.5 py-0.5 rounded-md border ${
                                  active
                                    ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900'
                                    : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600'
                                }`}
                                onClick={() => setSelected({ domain: d.code, tier: t.code, industry: i.code })}
                              >
                                🏭 {i.label}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="② 노드 attribute" subtitle="modality·grade 는 트리 외부 속성">
        {selected ? (
          <div className="space-y-1.5">
            <div className="text-[11px] text-slate-500">선택 경로</div>
            <div className="flex flex-wrap gap-1">
              <span className="text-[11px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                {DOMAINS.find((x) => x.code === selected.domain)?.label}
              </span>
              <span className="text-slate-400">›</span>
              <span className="text-[11px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                {TIERS.find((x) => x.code === selected.tier)?.label}
              </span>
              <span className="text-slate-400">›</span>
              <span className="text-[11px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                {INDUSTRIES.find((x) => x.code === selected.industry)?.label}
              </span>
            </div>
            <div className="pt-1 border-t border-dashed border-slate-300 dark:border-slate-600 space-y-1">
              <div className="text-[11px] font-semibold">modality (attribute)</div>
              <ChipBar
                options={MODALITIES.map((m) => ({ code: m.code, label: m.label }))}
                value={item.facets.modality}
              />
              <div className="text-[11px] font-semibold pt-1">grade (attribute)</div>
              <ChipBar
                options={(TIERS.find((t) => t.code === selected.tier)?.grades ?? []).map((g) => ({ code: g, label: g }))}
                value={item.facets.grade ?? null}
              />
            </div>
          </div>
        ) : (
          <div className="text-[11px] text-slate-400">트리에서 선택</div>
        )}
      </SectionCard>

      <SectionCard title="③ ACL sidecar (규정)" subtitle="노드별 수동 ACL" tone="info">
        {gov ? (
          <div className="flex flex-wrap gap-1">
            <RuleBadge level={gov.translation} axis="번역" />
            <RuleBadge level={gov.ethics} axis="윤리" />
            <RuleBadge level={gov.security} axis="보안" />
          </div>
        ) : null}
        <div className="mt-1.5 text-[10px] text-slate-500">
          ※ B안에서는 각 노드마다 수동으로 ACL을 달아야 함. (domain × tier × industry) = {DOMAINS.length}×{TIERS.length}×{INDUSTRIES.length} = <b>{DOMAINS.length * TIERS.length * INDUSTRIES.length}개 노드</b> 전체에 ACL 부여 필요.
        </div>
      </SectionCard>

      <SectionCard title="④ Work Studio 부자연스러움" tone="warn" subtitle='"누가·어떤 동사로" 진입 불가'>
        <div className="space-y-1 text-[11px]">
          <div className="flex items-start gap-1">
            <AlertTriangle className="h-3 w-3 text-amber-600 mt-0.5 flex-shrink-0" />
            <span>"인증 가능한 번역 강사"를 찾으려면 <b>domain 트리 5개 × tier 3개 × industry 9개 = 135 노드</b>를 전부 훑어 ACL에 "certify" 가 있는지 확인해야 함</span>
          </div>
          <div className="flex items-start gap-1">
            <AlertTriangle className="h-3 w-3 text-amber-600 mt-0.5 flex-shrink-0" />
            <span>actor-first 진입을 위해선 **두 번째 뒤집힌 트리**(actor→domain→…) 가 필요 → 중복 트리 발생</span>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="⑤ 교차축 조회 시뮬레이션" tone="warn">
        <div className="text-[11px] space-y-1">
          <div className="font-semibold">쿼리: "번역 × 의료 × 영상"</div>
          <div className="text-slate-600 dark:text-slate-300">
            트리 경로: <b>TRANS → expert → med</b> 선택 → attribute 패널에서 modality=video 일치 여부 확인
          </div>
          <div className="text-amber-700 dark:text-amber-400">
            ⚠︎ modality가 leaf attribute라 <b>트리 인덱스로 필터 불가</b> → 전수 스캔 필요
          </div>
        </div>
      </SectionCard>

      <SectionCard title="⑥ 원안 준수도 95%" tone="success">
        <div className="text-[11px] space-y-0.5">
          <div>✓ 과목이 최상위 — 원안 "과목 → 급수 → 기능 → 산업" 순서 그대로</div>
          <div>✓ 트리 UI 친숙, 도메인 전문가 읽기 쉬움</div>
          <div>✓ 초기 구축 3일 (A안의 1/3)</div>
          <div className="text-amber-700 dark:text-amber-400">✗ Work Studio 의 actor-first 와 맞지 않음</div>
        </div>
      </SectionCard>
    </div>
  );
}
