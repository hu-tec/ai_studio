import { useState } from 'react';
import { Beaker, Database } from 'lucide-react';
import { SectionCard } from '../components/SectionCard';
import { ChipBar } from '../components/Chip';
import { SAMPLE_ITEMS } from '../data';
import { ExistingTab } from './ExistingTab';
import { PlanATab } from './PlanATab';
import { PlanBTab } from './PlanBTab';
import { PlanCTab } from './PlanCTab';
import type { PlanKind } from '../types';
import { useTaxonomy } from '../api';

const PLANS: { code: PlanKind; label: string }[] = [
  { code: 'existing', label: '기존' },
  { code: 'A',        label: 'A안 facets + lens ★' },
  { code: 'B',        label: 'B안 과목 트리' },
  { code: 'C',        label: 'C안 surface 분리' },
];

// 분류 모듈 체험 — 4안(기존/A/B/C) 비교 샌드박스 + 편집 탭 라이브 DB 요약.
// 상단: 편집 탭 DB 의 현재 상태 (라이브, 탭 전환 시 재fetch).
// 하단: 샘플 아이템 기반 4안 비교 (개념 설계 도구 — 샘플 고정).
export default function SandboxTab() {
  const [plan, setPlan] = useState<PlanKind>('A');
  const [itemId, setItemId] = useState(SAMPLE_ITEMS[2].id);
  const item = SAMPLE_ITEMS.find((i) => i.id === itemId)!;
  const { nodes: commonNodes, loading: commonLoading } = useTaxonomy({ scope: 'common', gov: 'common' });
  const axisCounts = commonNodes.reduce<Record<string, number>>((acc, n) => {
    acc[n.axis] = (acc[n.axis] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 px-1">
        <Beaker className="h-3.5 w-3.5 text-amber-500" />
        <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200">
          분류 모듈 체험
        </span>
        <span className="text-[10px] text-slate-500">
          — 상단 라이브 DB 요약 + 하단 4안(기존/A/B/C) 비교 샌드박스
        </span>
      </div>

      {/* 라이브 DB 요약 — 편집 탭에서 저장하면 여기에 즉시 반영 */}
      <SectionCard
        title="① 편집 탭 라이브 DB (scope=common · gov=common)"
        subtitle={commonLoading ? '로딩...' : `총 ${commonNodes.length} 노드 · 원본 분류표_260402.txt 기반`}
      >
        <div className="flex flex-wrap gap-1">
          {Object.entries(axisCounts).length === 0 && !commonLoading && (
            <span className="text-[10px] text-slate-400">DB 비어있음 — seed 실행 필요</span>
          )}
          {Object.entries(axisCounts).map(([axis, count]) => (
            <span
              key={axis}
              className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30"
            >
              <Database className="h-2.5 w-2.5 text-emerald-600" />
              <b>{axis}</b>
              <span className="text-emerald-700 dark:text-emerald-300">{count}</span>
            </span>
          ))}
        </div>
      </SectionCard>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-2">
        <SectionCard title="② 안 선택 (싱글 = 네모칩)" subtitle="클릭하여 체험">
          <ChipBar options={PLANS} value={plan} onChange={(v) => setPlan(v)} />
        </SectionCard>
        <div className="lg:col-span-4">
          <SectionCard title="③ 샘플 아이템 (CRUD 데모)" subtitle={`총 ${SAMPLE_ITEMS.length}개 · 4안 비교 고정 샘플`}>
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

      <div>
        {plan === 'existing' && <ExistingTab item={item} />}
        {plan === 'A'        && <PlanATab item={item} />}
        {plan === 'B'        && <PlanBTab item={item} />}
        {plan === 'C'        && <PlanCTab item={item} />}
      </div>

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
