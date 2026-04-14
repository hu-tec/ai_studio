import { useEffect, useState } from 'react';
import { SectionCard } from '../components/SectionCard';
import { ChipBar } from '../components/Chip';
import { RuleBadge } from '../components/RuleBadge';
import {
  DOMAINS, TIERS, MODALITIES, INDUSTRIES, GOV_AXES, ACTORS, VERBS,
} from '../constants';
import type {
  SampleItem, DomainCode, TierCode, ModalityCode, IndustryCode,
  GovernanceMatrix, GovLevel,
} from '../types';

interface Props { item: SampleItem }

type PermVerb = 'sell' | 'operate' | 'certify';
const ORIG_VERBS: { code: PermVerb; label: string }[] = [
  { code: 'sell',    label: '판매(팔것)' },
  { code: 'operate', label: '운영' },
  { code: 'certify', label: '인증' },
];

// "기존" = 사용자 원안 그대로의 6단 선형 구조
// 과목 → 급수 → 기능 → 산업/전문영역 → 번역·윤리·보안 레이어(수동 3×3) → 상품·교육·강사·직원 권한(수동 매트릭스)
export function ExistingTab({ item }: Props) {
  const [subject, setSubject] = useState<DomainCode>(item.facets.domain);
  const [level, setLevel] = useState<TierCode>(item.facets.tier);
  const [modality, setModality] = useState<ModalityCode>(item.facets.modality);
  const [industry, setIndustry] = useState<IndustryCode>(item.facets.industry);
  const [gov, setGov] = useState<GovernanceMatrix>({
    translation: 'optional', ethics: 'optional', security: 'optional',
  });
  const [perms, setPerms] = useState<Set<string>>(new Set());

  useEffect(() => {
    setSubject(item.facets.domain);
    setLevel(item.facets.tier);
    setModality(item.facets.modality);
    setIndustry(item.facets.industry);
    setGov({ translation: 'optional', ethics: 'optional', security: 'optional' });
    setPerms(new Set());
  }, [item.id]);

  const togglePerm = (key: string) => {
    setPerms((prev) => {
      const n = new Set(prev);
      if (n.has(key)) n.delete(key); else n.add(key);
      return n;
    });
  };

  const levelObj = TIERS.find((t) => t.code === level)!;
  const subjectObj = DOMAINS.find((d) => d.code === subject)!;
  const modalityObj = MODALITIES.find((m) => m.code === modality)!;
  const industryObj = INDUSTRIES.find((i) => i.code === industry)!;

  return (
    <div className="space-y-2">
      <div className="text-[10px] text-slate-500 px-1">
        원안 그대로의 6단 선형 구조 — 과목 → 급수 → 기능 → 산업 → 규정레이어 → 권한. 각 단계는 이전 단계에 종속됩니다.
      </div>

      {/* 6 단계 카드 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
        {/* Step 1: 과목 */}
        <SectionCard title="① 과목 (L0)" subtitle="TESOL·프롬·번역·윤리·ITT">
          <ChipBar
            options={DOMAINS.map((d) => ({ code: d.code, label: d.label }))}
            value={subject}
            onChange={(v) => setSubject(v)}
          />
        </SectionCard>

        {/* Step 2: 급수 */}
        <SectionCard title="② 급수 (L1)" subtitle="일반 / 전문 / 교육">
          <div className="space-y-1">
            <ChipBar
              options={TIERS.map((t) => ({ code: t.code, label: t.label }))}
              value={level}
              onChange={(v) => setLevel(v)}
            />
            <div className="text-[10px] text-slate-500">세부: {levelObj.grades.join(' · ')}</div>
          </div>
        </SectionCard>

        {/* Step 3: 기능 */}
        <SectionCard title="③ 기능 (L2)" subtitle="문서·영상·음성·이미지·코드·실시간">
          <ChipBar
            options={MODALITIES.map((m) => ({ code: m.code, label: m.label }))}
            value={modality}
            onChange={(v) => setModality(v)}
          />
        </SectionCard>

        {/* Step 4: 산업·전문영역 */}
        <SectionCard title="④ 산업·전문영역 (L3)" subtitle="의료·법률·금융·정부·교육·IT·미디어·무역·일반">
          <ChipBar
            options={INDUSTRIES.map((i) => ({ code: i.code, label: i.label }))}
            value={industry}
            onChange={(v) => setIndustry(v)}
          />
        </SectionCard>

        {/* Step 5: 규정 레이어 */}
        <SectionCard title="⑤ 규정 레이어 (L4)" subtitle="번역·윤리·보안 × 규정/준규정/선택 수동" tone="info">
          <div className="space-y-1">
            {GOV_AXES.map((ax) => (
              <div key={ax.code} className="flex items-center gap-1.5 text-[11px]">
                <span className="w-10 text-slate-600 dark:text-slate-300">{ax.label}</span>
                <ChipBar
                  options={[
                    { code: 'fixed'    as GovLevel, label: '규정' },
                    { code: 'semi'     as GovLevel, label: '준규정' },
                    { code: 'optional' as GovLevel, label: '선택' },
                  ]}
                  value={gov[ax.code]}
                  onChange={(v) => setGov({ ...gov, [ax.code]: v })}
                />
              </div>
            ))}
            <div className="text-[10px] text-slate-500 pt-1 border-t border-dashed border-slate-300 dark:border-slate-600">
              ※ 원안은 수동 지정 — domain·industry 별 자동 seed·override 개념 없음.
            </div>
          </div>
        </SectionCard>

        {/* Step 6: 권한 */}
        <SectionCard title="⑥ 권한 설계 (L5)" subtitle="상품/교육/강사/직원 × 판매/운영/인증 (멀티=원형)" tone="info">
          <div className="overflow-x-auto">
            <table className="w-full text-[10px] border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800">
                  <th className="border border-slate-300 dark:border-slate-600 px-1 py-0.5 text-left">actor \ verb</th>
                  {ORIG_VERBS.map((v) => (
                    <th key={v.code} className="border border-slate-300 dark:border-slate-600 px-1 py-0.5">{v.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ACTORS.map((a) => (
                  <tr key={a.code}>
                    <td className="border border-slate-300 dark:border-slate-600 px-1 py-0.5 font-medium">{a.label}</td>
                    {ORIG_VERBS.map((v) => {
                      const key = `${a.code}:${v.code}`;
                      const active = perms.has(key);
                      return (
                        <td key={v.code} className="border border-slate-300 dark:border-slate-600 px-1 py-0.5 text-center">
                          <button
                            type="button"
                            onClick={() => togglePerm(key)}
                            aria-pressed={active}
                            className={[
                              'h-3.5 w-3.5 rounded-full border transition',
                              active
                                ? 'bg-slate-900 border-slate-900 dark:bg-white dark:border-white'
                                : 'bg-white border-slate-300 hover:border-slate-500 dark:bg-slate-800 dark:border-slate-600',
                            ].join(' ')}
                          />
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

      {/* 원안 플로우 결과 breadcrumb */}
      <SectionCard title="🧭 원안 플로우 결과 (breadcrumb)" tone="info">
        <div className="flex items-center gap-1 flex-wrap text-[11px]">
          <Pill n={1} label={subjectObj.label} />
          <Arrow />
          <Pill n={2} label={`${levelObj.label}`} />
          <Arrow />
          <Pill n={3} label={modalityObj.label} />
          <Arrow />
          <Pill n={4} label={industryObj.label} />
          <Arrow />
          <div className="flex gap-0.5">
            <RuleBadge level={gov.translation} axis="번역" />
            <RuleBadge level={gov.ethics} axis="윤리" />
            <RuleBadge level={gov.security} axis="보안" />
          </div>
          <Arrow />
          <div className="flex flex-wrap gap-0.5">
            {[...perms].length === 0 && (
              <span className="text-[10px] text-slate-400">(권한 미지정)</span>
            )}
            {[...perms].map((k) => {
              const [a, v] = k.split(':');
              const aLabel = ACTORS.find((x) => x.code === a)?.label;
              const vLabel = ORIG_VERBS.find((x) => x.code === v)?.label;
              return (
                <span
                  key={k}
                  className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                >
                  {aLabel}·{vLabel}
                </span>
              );
            })}
          </div>
        </div>
      </SectionCard>

      {/* 원안의 특성 - 중립 서술 */}
      <SectionCard title="원안(기존)의 특성" subtitle="장점·제약 중립 기술">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
          <div>
            <div className="font-semibold text-emerald-700 dark:text-emerald-400 mb-0.5">✓ 장점</div>
            <ul className="space-y-0.5 pl-2">
              <li>· 6단 단선 플로우 — 학습 곡선 낮고 단계 명확</li>
              <li>· 각 단계가 이전에 종속 → 의사결정 순서 강제</li>
              <li>· 요청 원안 그대로 구현 (재해석 불필요)</li>
              <li>· 문서 표기에 가장 가까움 (도메인 전문가 친화)</li>
              <li>· 초기 구축 2~3일 (가장 빠름)</li>
              <li>· 원안 준수도 <b>100%</b></li>
            </ul>
          </div>
          <div>
            <div className="font-semibold text-amber-700 dark:text-amber-400 mb-0.5">△ 제약</div>
            <ul className="space-y-0.5 pl-2">
              <li>· 교차축 조회(예: 번역 × 의료 × 영상) 는 전수 스캔 필요</li>
              <li>· 규정 레이어가 5단에 있어 자동 상속·seed 불가 → 수동</li>
              <li>· Work Studio의 actor-first 진입에 6단 뒤집기 재배열 필요</li>
              <li>· 새 축(예: "언어쌍" 추가) 도입 시 6단 재설계 부담</li>
              <li>· 권한 매트릭스가 거버넌스와 연동되지 않아 자동 게이팅 없음</li>
            </ul>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

function Pill({ n, label }: { n: number; label?: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800">
      <span className="text-slate-400">{n}</span>
      <span className="font-medium text-slate-700 dark:text-slate-200">{label ?? '—'}</span>
    </span>
  );
}

function Arrow() {
  return <span className="text-slate-400">›</span>;
}
