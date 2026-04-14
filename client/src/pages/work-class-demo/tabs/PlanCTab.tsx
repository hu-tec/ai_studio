import { AlertTriangle } from 'lucide-react';
import { SectionCard } from '../components/SectionCard';
import { DOMAINS, TIERS, MODALITIES, INDUSTRIES } from '../constants';
import type { SampleItem } from '../types';

interface Props { item: SampleItem }

// C안: 3 surface 각자 독립 taxonomy + 공유 glossary
export function PlanCTab({ item }: Props) {
  const d = DOMAINS.find((x) => x.code === item.facets.domain)!;
  const t = TIERS.find((x) => x.code === item.facets.tier)!;
  const m = MODALITIES.find((x) => x.code === item.facets.modality)!;
  const i = INDUSTRIES.find((x) => x.code === item.facets.industry)!;

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <SectionCard title="AI Studio 모듈 (독립)" tone="info" subtitle="modality 중심">
          <div className="space-y-1 text-[11px]">
            <Field label="1차"    value={m.label} />
            <Field label="2차"    value={d.label} />
            <Field label="3차"    value={`${t.label} ${item.facets.grade ?? ''}`} />
            <Field label="4차"    value={i.label} />
            <div className="text-[10px] text-slate-500 pt-1 border-t border-dashed border-slate-300 dark:border-slate-600">
              자체 DB: <code>ai_items</code>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Work Studio 모듈 (독립)" tone="success" subtitle="actor·verb 중심">
          <div className="space-y-1 text-[11px]">
            <Field label="1차"    value="강사 · 인증" />
            <Field label="2차"    value={d.label} />
            <Field label="3차"    value={i.label} />
            <Field label="4차"    value={m.label} />
            <Field label="5차"    value={`${t.label} ${item.facets.grade ?? ''}`} />
            <div className="text-[10px] text-slate-500 pt-1 border-t border-dashed border-slate-300 dark:border-slate-600">
              자체 DB: <code>work_items</code>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="홈페이지 모듈 (독립)" tone="warn" subtitle="오디언스 중심">
          <div className="space-y-1 text-[11px]">
            <Field label="1차"    value={d.label} />
            <Field label="2차"    value={`${t.label} ${item.facets.grade ?? ''}`} />
            <Field label="3차"    value={i.label} />
            <div className="text-[10px] text-slate-500 pt-1 border-t border-dashed border-slate-300 dark:border-slate-600">
              자체 DB: <code>home_items</code>
            </div>
          </div>
        </SectionCard>
      </div>

      <SectionCard title="공유 glossary (유일한 공통 요소)" tone="info">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-1">
          {DOMAINS.map((d) => (
            <div key={d.code} className="text-[10px] p-1 rounded border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800">
              <div className="font-semibold text-slate-700 dark:text-slate-200">{d.code}</div>
              <div className="text-slate-500">{d.label}</div>
            </div>
          ))}
        </div>
        <div className="text-[10px] text-slate-500 mt-1">
          ※ 용어 라벨·코드만 공유. 데이터 구조·필드·DB는 전부 각자.
        </div>
      </SectionCard>

      <SectionCard title="C안의 치명적 리스크" tone="warn">
        <ul className="text-[11px] space-y-1">
          <li className="flex items-start gap-1">
            <AlertTriangle className="h-3 w-3 text-amber-600 mt-0.5 flex-shrink-0" />
            <span><b>중복 데이터 3배</b> — 같은 상품이 AI/Work/홈에 3번 저장 → "AI Studio에선 팔리는데 Work Studio에선 안 보임" 버그</span>
          </li>
          <li className="flex items-start gap-1">
            <AlertTriangle className="h-3 w-3 text-amber-600 mt-0.5 flex-shrink-0" />
            <span><b>SSOT 없음</b> — 강사 자격 인증이 세 곳에서 독립 관리 → 동기화 실패 시 책임 모호</span>
          </li>
          <li className="flex items-start gap-1">
            <AlertTriangle className="h-3 w-3 text-amber-600 mt-0.5 flex-shrink-0" />
            <span><b>표기 불일치 누적</b> — "TESOL 영어교육" vs "테솔" vs "TESOL" 세 가지 표기 공존</span>
          </li>
          <li className="flex items-start gap-1">
            <AlertTriangle className="h-3 w-3 text-amber-600 mt-0.5 flex-shrink-0" />
            <span><b>초기 속도는 빠름</b>(3~5일) 이지만 <b>유지보수는 3배</b></span>
          </li>
        </ul>
      </SectionCard>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-slate-500 w-8">{label}</span>
      <span className="font-medium text-slate-700 dark:text-slate-200">{value}</span>
    </div>
  );
}
