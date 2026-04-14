import { useMemo, useState, useEffect } from 'react';
import { Check, X } from 'lucide-react';
import { SectionCard } from '../components/SectionCard';
import { ChipBar } from '../components/Chip';
import { RuleBadge } from '../components/RuleBadge';
import {
  DOMAINS, TIERS, MODALITIES, INDUSTRIES, GOV_AXES, ACTORS, VERBS,
} from '../constants';
import { inferGovernance, isAllowed, LENS_ORDER } from '../data';
import type {
  DomainCode, TierCode, ModalityCode, IndustryCode, LensKind, SampleItem, Facets, ActorCode, VerbCode,
} from '../types';

interface Props { item: SampleItem }

export function PlanATab({ item }: Props) {
  const [lens, setLens] = useState<LensKind>('ai-studio');
  const [facets, setFacets] = useState<Facets>(item.facets);
  const [govOverride, setGovOverride] = useState<Partial<Record<'translation'|'ethics'|'security', 'fixed'|'semi'|'optional'>>>({});

  // item 바뀌면 facets 동기화
  useEffect(() => { setFacets(item.facets); setGovOverride({}); }, [item.id]);

  const govAuto = useMemo(
    () => inferGovernance(facets.domain, facets.industry),
    [facets.domain, facets.industry],
  );
  const gov = { ...govAuto, ...govOverride };

  const order = LENS_ORDER[lens];
  const firstFacet = order[0];

  const LENS_OPTS = [
    { code: 'ai-studio' as LensKind, label: 'AI Studio (작업중심)' },
    { code: 'work-studio' as LensKind, label: 'Work Studio (운영중심)' },
    { code: 'homepage' as LensKind, label: '홈페이지 (오디언스중심)' },
  ];

  function renderFacetPanel(key: keyof Facets) {
    const highlight = key === firstFacet;
    if (key === 'domain') {
      return (
        <SectionCard title={`🎓 과목 (domain)`} subtitle="facet L0" key={key}>
          <ChipBar
            options={DOMAINS.map((d) => ({ code: d.code, label: d.label }))}
            value={facets.domain}
            onChange={(v) => setFacets({ ...facets, domain: v })}
            highlight={highlight}
          />
        </SectionCard>
      );
    }
    if (key === 'tier') {
      const t = TIERS.find((x) => x.code === facets.tier)!;
      return (
        <SectionCard title={`📈 급수 (tier + grade)`} subtitle="facet L1" key={key}>
          <div className="space-y-1">
            <ChipBar
              options={TIERS.map((x) => ({ code: x.code, label: x.label }))}
              value={facets.tier}
              onChange={(v) => setFacets({ ...facets, tier: v, grade: TIERS.find(x=>x.code===v)?.grades[0] })}
              highlight={highlight}
            />
            <ChipBar
              options={t.grades.map((g) => ({ code: g, label: g }))}
              value={facets.grade ?? null}
              onChange={(v) => setFacets({ ...facets, grade: v })}
            />
          </div>
        </SectionCard>
      );
    }
    if (key === 'modality') {
      return (
        <SectionCard title={`🎬 기능 (modality)`} subtitle="facet L2" key={key}>
          <ChipBar
            options={MODALITIES.map((m) => ({ code: m.code, label: m.label }))}
            value={facets.modality}
            onChange={(v) => setFacets({ ...facets, modality: v })}
            highlight={highlight}
          />
        </SectionCard>
      );
    }
    if (key === 'industry') {
      return (
        <SectionCard title={`🏭 산업 (industry)`} subtitle="facet L3" key={key}>
          <ChipBar
            options={INDUSTRIES.map((i) => ({ code: i.code, label: i.label }))}
            value={facets.industry}
            onChange={(v) => setFacets({ ...facets, industry: v })}
            highlight={highlight}
          />
        </SectionCard>
      );
    }
    return null;
  }

  return (
    <div className="space-y-2">
      {/* Lens switcher */}
      <div className="flex items-center gap-2 flex-wrap p-1.5 rounded border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800">
        <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200">Lens</span>
        <ChipBar options={LENS_OPTS} value={lens} onChange={(v) => setLens(v)} />
        <span className="text-[10px] text-slate-500 ml-1">
          진입 순서: <b>{order.join(' → ')}</b>
        </span>
      </div>

      {/* Facet panels — lens 순서대로 재정렬 */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-2">
        {order.map((k) => renderFacetPanel(k))}
        {(['domain','tier','modality','industry'] as (keyof Facets)[])
          .filter((k) => !order.includes(k))
          .map((k) => renderFacetPanel(k))}
      </div>

      {/* Governance + actor×verb */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <SectionCard title="② 거버넌스 자동 추론" subtitle="(domain × industry) → 3축 × 3레벨" tone="info">
          <div className="space-y-1">
            {GOV_AXES.map((ax) => (
              <div key={ax.code} className="flex items-center gap-1.5 text-[11px]">
                <span className="w-10 text-slate-600 dark:text-slate-300">{ax.label}</span>
                <ChipBar
                  options={[
                    { code: 'fixed' as const,    label: '규정' },
                    { code: 'semi' as const,     label: '준' },
                    { code: 'optional' as const, label: '선택' },
                  ]}
                  value={gov[ax.code]}
                  onChange={(v) => setGovOverride({ ...govOverride, [ax.code]: v })}
                />
                {govOverride[ax.code] && (
                  <button
                    className="text-[9px] text-slate-400 hover:text-slate-700"
                    onClick={() => { const n = { ...govOverride }; delete n[ax.code]; setGovOverride(n); }}
                  >
                    초기화
                  </button>
                )}
              </div>
            ))}
            <div className="text-[10px] text-slate-500 pt-1 border-t border-dashed border-slate-300 dark:border-slate-600">
              ※ seed: 고위험(의료·법률·금융·정부)=전 축 규정, 일반=전 축 선택, 도메인별 bump 적용
            </div>
          </div>
        </SectionCard>

        <SectionCard title="③ actor × verb 매트릭스" subtitle="governance로 자동 게이팅" tone="info">
          <div className="overflow-x-auto">
            <table className="w-full text-[10px] border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800">
                  <th className="border border-slate-300 dark:border-slate-600 px-1 py-0.5 text-left">actor \ verb</th>
                  {VERBS.map((v) => (
                    <th key={v.code} className="border border-slate-300 dark:border-slate-600 px-1 py-0.5">{v.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ACTORS.map((a) => (
                  <tr key={a.code}>
                    <td className="border border-slate-300 dark:border-slate-600 px-1 py-0.5 font-medium">{a.label}</td>
                    {VERBS.map((v) => {
                      const r = isAllowed(a.code as ActorCode, v.code as VerbCode, gov);
                      return (
                        <td
                          key={v.code}
                          className="border border-slate-300 dark:border-slate-600 px-1 py-0.5 text-center"
                          title={r.reason || ''}
                        >
                          {r.allowed
                            ? <Check className="inline h-3 w-3 text-emerald-600" />
                            : <X className="inline h-3 w-3 text-slate-300 dark:text-slate-600" />}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>

      {/* 3 surface 프리뷰 카드 — 같은 데이터, 다른 렌더 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <SurfacePreview title="AI Studio" tone="info" facets={facets} gov={gov} />
        <SurfacePreview title="Work Studio" tone="success" facets={facets} gov={gov} />
        <SurfacePreview title="홈페이지" tone="warn" facets={facets} gov={gov} />
      </div>
    </div>
  );
}

function SurfacePreview({ title, tone, facets, gov }: {
  title: string;
  tone: 'info' | 'success' | 'warn';
  facets: Facets;
  gov: { translation: 'fixed'|'semi'|'optional'; ethics: 'fixed'|'semi'|'optional'; security: 'fixed'|'semi'|'optional' };
}) {
  const domain = DOMAINS.find((d) => d.code === facets.domain)!;
  const tier = TIERS.find((t) => t.code === facets.tier)!;
  const mod = MODALITIES.find((m) => m.code === facets.modality)!;
  const ind = INDUSTRIES.find((i) => i.code === facets.industry)!;
  return (
    <SectionCard title={`📍 ${title} 프리뷰`} tone={tone}>
      <div className="space-y-1">
        <div className="text-[13px] font-semibold text-slate-800 dark:text-slate-100">
          {domain.label}
        </div>
        <div className="text-[11px] text-slate-600 dark:text-slate-300">
          {tier.label} {facets.grade ?? ''} · {mod.label} · {ind.label}
        </div>
        <div className="flex flex-wrap gap-1 pt-1">
          <RuleBadge level={gov.translation} axis="번역" />
          <RuleBadge level={gov.ethics} axis="윤리" />
          <RuleBadge level={gov.security} axis="보안" />
        </div>
      </div>
    </SectionCard>
  );
}
