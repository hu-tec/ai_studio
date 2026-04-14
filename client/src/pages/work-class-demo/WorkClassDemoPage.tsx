import { useState } from 'react';
import { Beaker } from 'lucide-react';
import { ChipBar } from './components/Chip';
import { SectionCard } from './components/SectionCard';
import { SAMPLE_ITEMS } from './data';
import { ExistingTab } from './tabs/ExistingTab';
import { PlanATab } from './tabs/PlanATab';
import { PlanBTab } from './tabs/PlanBTab';
import { PlanCTab } from './tabs/PlanCTab';
import type { PlanKind } from './types';

const PLANS: { code: PlanKind; label: string }[] = [
  { code: 'existing', label: '기존' },
  { code: 'A',        label: 'A안 facets + lens ★' },
  { code: 'B',        label: 'B안 과목 트리' },
  { code: 'C',        label: 'C안 surface 분리' },
];

export default function WorkClassDemoPage() {
  const [plan, setPlan] = useState<PlanKind>('A');
  const [itemId, setItemId] = useState(SAMPLE_ITEMS[2].id);
  const item = SAMPLE_ITEMS.find((i) => i.id === itemId)!;

  return (
    <div className="p-2 space-y-2 text-slate-800 dark:text-slate-100">
      {/* 헤더 */}
      <div className="flex items-center justify-between flex-wrap gap-1">
        <div className="flex items-center gap-1.5">
          <Beaker className="h-4 w-4 text-amber-500" />
          <h1 className="text-sm font-bold">업무 분류(임시)</h1>
          <span className="text-[10px] text-slate-500">— 기존/A/B/C안 체험 샌드박스</span>
        </div>
        <div className="text-[10px] text-slate-500">
          260414 T3 · Plan A 추천
        </div>
      </div>

      {/* 탭 + 샘플 picker */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-2">
        <SectionCard title="① 안 선택 (싱글 = 네모칩)" subtitle="클릭하여 체험">
          <ChipBar options={PLANS} value={plan} onChange={(v) => setPlan(v)} />
        </SectionCard>
        <div className="lg:col-span-4">
          <SectionCard title="② 샘플 아이템 (CRUD 데모)" subtitle={`총 ${SAMPLE_ITEMS.length}개`}>
            <div className="flex flex-wrap gap-1">
              {SAMPLE_ITEMS.map((s) => {
                const active = s.id === itemId;
                return (
                  <button
                    key={s.id}
                    onClick={() => setItemId(s.id)}
                    className={[
                      'text-[10px] px-1.5 py-0.5 rounded-md border whitespace-nowrap',
                      active
                        ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-600',
                    ].join(' ')}
                    title={s.note}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
            {item.note && (
              <div className="mt-1 text-[10px] text-slate-500 border-t border-dashed border-slate-300 dark:border-slate-600 pt-1">
                💬 {item.note}
              </div>
            )}
          </SectionCard>
        </div>
      </div>

      {/* 탭 body */}
      <div>
        {plan === 'existing' && <ExistingTab item={item} />}
        {plan === 'A'        && <PlanATab item={item} />}
        {plan === 'B'        && <PlanBTab item={item} />}
        {plan === 'C'        && <PlanCTab item={item} />}
      </div>

      {/* 하단 범례 */}
      <SectionCard title="범례" collapsible defaultOpen={false}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[10px]">
          <div>
            <div className="font-semibold mb-0.5">칩</div>
            <div>· 싱글 선택 = 네모</div>
            <div>· 멀티 선택 = 원형</div>
          </div>
          <div>
            <div className="font-semibold mb-0.5">거버넌스 3단계</div>
            <div>· <b className="text-red-700">규정</b>: 반드시 유지</div>
            <div>· <b className="text-amber-700">준규정</b>: 기본+변형</div>
            <div>· <b className="text-emerald-700">선택규정</b>: 선택</div>
          </div>
          <div>
            <div className="font-semibold mb-0.5">A안 facets</div>
            <div>· L0 domain (과목 5)</div>
            <div>· L1 tier + grade (급수)</div>
            <div>· L2 modality (기능 6)</div>
            <div>· L3 industry (산업 9)</div>
          </div>
          <div>
            <div className="font-semibold mb-0.5">A안 actor × verb</div>
            <div>· 상품/직원/강사/교육 × 판매/운영/강의/인증</div>
            <div>· governance가 자동 게이팅</div>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
