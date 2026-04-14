import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { SectionCard } from '../components/SectionCard';
import { ChipBar } from '../components/Chip';
import { RuleBadge } from '../components/RuleBadge';
import { USER_TIERS } from '../constants';
import {
  GRADE_FIELD_OPTIONS, GRADE_MID_OPTIONS, GRADE_LEVELS, CATEGORY_TREE,
} from '@/pages/instructor-curri/constants';
import type { SampleItem } from '../types';

interface Props { item: SampleItem }

// 기존: instructor-curri의 분야/중/급수 + CATEGORY_TREE + rules-editor 3단계 + users.tier 를 그대로 보여줌
export function ExistingTab({ item }: Props) {
  const [field, setField] = useState<string>('번역');
  const [mid, setMid] = useState<string>('전문');
  const [grade, setGrade] = useState<string>('2급');
  const [largeCat, setLargeCat] = useState<string>('문서');

  const grades = GRADE_LEVELS[mid] ?? [];
  const largeCats = CATEGORY_TREE.map((c) => ({ code: c.name, label: c.name }));
  const subCats = CATEGORY_TREE.find((c) => c.name === largeCat)?.children ?? [];

  const gaps = [
    { text: '과목(TESOL·ITT) 없음 — "분야"에 3개만 존재(프롬/번역/윤리)' },
    { text: '산업·전문영역 없음 — extends-area 일부 키워드만' },
    { text: 'actor·verb(상품/운영/강사/직원 × 판매/운영/강의/인증) 없음' },
    { text: '규정 3축(번역/윤리/보안) 구분 없음 — 단일 rules 테이블' },
    { text: '거버넌스 자동 추론 없음 — 수동 지정' },
    { text: '교차축 조회(예: 번역×의료×영상) 불가' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
      <SectionCard title="① 분야 → 중 → 급수 (instructor-curri)" subtitle="constants.ts 실제 값">
        <div className="space-y-1.5">
          <div>
            <div className="text-[10px] text-slate-500 mb-0.5">분야</div>
            <ChipBar
              options={GRADE_FIELD_OPTIONS.map((f) => ({ code: f, label: f }))}
              value={field}
              onChange={(v) => setField(v)}
            />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 mb-0.5">중분류</div>
            <ChipBar
              options={GRADE_MID_OPTIONS.map((m) => ({ code: m, label: m }))}
              value={mid}
              onChange={(v) => { setMid(v); setGrade(GRADE_LEVELS[v]?.[0] ?? ''); }}
            />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 mb-0.5">급수</div>
            <ChipBar
              options={grades.map((g) => ({ code: g, label: g }))}
              value={grade}
              onChange={(v) => setGrade(v)}
            />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="② CATEGORY_TREE (대 → 중)" subtitle="8대 분류 하드코딩">
        <div className="space-y-1.5">
          <ChipBar options={largeCats} value={largeCat} onChange={(v) => setLargeCat(v)} />
          <div className="flex flex-wrap gap-1 pt-1 border-t border-dashed border-slate-300 dark:border-slate-600">
            {subCats.slice(0, 20).map((s) => (
              <span
                key={s.name}
                className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600"
              >
                {s.name}
              </span>
            ))}
            {subCats.length === 0 && <span className="text-[10px] text-slate-400">(하위 없음)</span>}
          </div>
        </div>
      </SectionCard>

      <SectionCard title="③ rules-editor 3단계" subtitle="RegulationType: fixed | semi | optional">
        <div className="flex flex-wrap gap-1.5">
          <RuleBadge level="fixed" />
          <RuleBadge level="semi" />
          <RuleBadge level="optional" />
        </div>
        <div className="mt-1.5 text-[10px] text-slate-500">
          ※ 이 3단계는 규정 UI 타입 구분만이고, <b>어느 분야·산업·기능에 자동 적용되는지는 없음</b>.
          바인딩은 관리자가 수동 지정.
        </div>
      </SectionCard>

      <SectionCard title="④ users.tier (4-tier auth)" subtitle="admin / manager / user / external">
        <div className="flex flex-wrap gap-1">
          {USER_TIERS.map((t) => (
            <span
              key={t.code}
              className="text-[10px] px-1.5 py-0.5 rounded border font-medium"
              style={{ color: t.color, borderColor: t.color + '80', backgroundColor: t.color + '12' }}
            >
              {t.label}
            </span>
          ))}
        </div>
        <div className="mt-1.5 text-[10px] text-slate-500">
          RouteGuard로 화면 접근만 제어. 업무 역할(상품/강사/직원)·동사(판매/강의/인증) <b>게이팅 없음</b>.
        </div>
      </SectionCard>

      <SectionCard title="⑤ 선택 아이템의 표현 한계" tone="warn" subtitle={item.label}>
        <div className="text-[11px] space-y-1">
          <div>· 과목 <span className="text-amber-700 dark:text-amber-400 font-semibold">{item.facets.domain}</span> → "분야" 3값에 <b>매핑 불가</b></div>
          <div>· 산업 <span className="text-amber-700 dark:text-amber-400 font-semibold">{item.facets.industry}</span> → <b>표현 필드 없음</b></div>
          <div>· 기능 <span className="text-amber-700 dark:text-amber-400 font-semibold">{item.facets.modality}</span> → CATEGORY_TREE 대분류로만, 교차 불가</div>
        </div>
      </SectionCard>

      <SectionCard title="⑥ 기존 구조의 결함 (6건)" tone="warn">
        <ul className="space-y-0.5">
          {gaps.map((g, i) => (
            <li key={i} className="flex items-start gap-1 text-[11px]">
              <AlertTriangle className="h-3 w-3 text-amber-600 mt-0.5 flex-shrink-0" />
              <span>{g.text}</span>
            </li>
          ))}
        </ul>
      </SectionCard>
    </div>
  );
}
