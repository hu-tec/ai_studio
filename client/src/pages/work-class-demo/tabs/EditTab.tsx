import { useState, useMemo } from 'react';
import { Database, Table2, Building2, BookOpen, Globe, Grid3x3, Filter } from 'lucide-react';
import { SectionCard } from '../components/SectionCard';
import { LensSwitch, GovSwitch } from '../components/LensSwitch';
import LargeMediumSmallSubTab from './edit/LargeMediumSmallSubTab';
import CompanyRuleSubTab from './edit/CompanyRuleSubTab';
import WorkGuideSubTab from './edit/WorkGuideSubTab';
import HomepageClassSubTab from './edit/HomepageClassSubTab';
import MandalartSubTab from './edit/MandalartSubTab';
import ItemViewSubTab from './edit/ItemViewSubTab';
import { useTaxonomy } from '../api';
import { allowedAxes } from '../taxonomyTypes';
import type { TaxonomyScope, TaxonomyGov } from '../taxonomyTypes';

type EditSubTab = 'lms' | 'crule' | 'wguide' | 'hp' | 'manda' | 'items';

const SUBTABS: { code: EditSubTab; label: string; icon: any }[] = [
  { code: 'lms',    label: '대중소 DB',  icon: Table2 },
  { code: 'crule',  label: '사내규정',   icon: Building2 },
  { code: 'wguide', label: '업무지침',   icon: BookOpen },
  { code: 'hp',     label: '홈페이지',   icon: Globe },
  { code: 'manda',  label: '만다라트',   icon: Grid3x3 },
  { code: 'items',  label: '아이템 뷰',  icon: Filter },
];

// 분류 모듈 편집 — 최종 DB Single Source of Truth.
// 여기에 저장되는 모든 내용이 사내 모든 페이지의 분류 값으로 FIX 됩니다.
export default function EditTab() {
  const [scope, setScope] = useState<TaxonomyScope>('ai-studio');
  const [gov, setGov] = useState<TaxonomyGov>('company-rule');
  const [sub, setSub] = useState<EditSubTab>('lms');

  const axes = useMemo(() => allowedAxes(scope, gov), [scope, gov]);
  const { nodes, loading, error } = useTaxonomy({ scope, gov });

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 px-1">
        <Database className="h-3.5 w-3.5 text-emerald-600" />
        <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200">
          분류 모듈 편집 — 최종 DB (SoT)
        </span>
        <span className="text-[10px] text-rose-600 font-semibold">
          ⚠ 이 탭의 변경은 전 페이지 카테고리 값으로 즉시 FIX
        </span>
      </div>

      {/* Lens + Gov 스위치 */}
      <SectionCard title="① 렌즈 · 거버넌스 선택" subtitle="범위와 규정축 분리 (사내규정 / 업무지침 / 홈페이지)">
        <div className="space-y-1">
          <LensSwitch value={scope} onChange={setScope} />
          <GovSwitch  value={gov}   onChange={setGov} />
          <div className="text-[10px] text-slate-500 pt-1 border-t border-dashed border-slate-300 dark:border-slate-600">
            허용 축: {axes.length ? axes.join(' · ') : <span className="text-rose-600">없음 (해당 조합은 비활성)</span>}
            {' · '}
            현재 노드 {nodes.length}개 {loading && '(로딩...)'}
            {error && <span className="text-rose-600 ml-1">({error})</span>}
          </div>
        </div>
      </SectionCard>

      {/* 서브탭 바 */}
      <SectionCard title="② 편집 영역" subtitle="서브탭 선택">
        <div className="flex flex-wrap gap-1">
          {SUBTABS.map((t) => {
            const Icon = t.icon;
            const active = sub === t.code;
            return (
              <button
                key={t.code}
                onClick={() => setSub(t.code)}
                className={[
                  'inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md border whitespace-nowrap',
                  active
                    ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-600',
                ].join(' ')}
              >
                <Icon className="h-3 w-3" />
                {t.label}
              </button>
            );
          })}
        </div>
      </SectionCard>

      {/* 서브탭 본체 */}
      <SectionCard
        title={`③ ${SUBTABS.find((t) => t.code === sub)?.label}`}
        subtitle={`scope=${scope} · gov=${gov}`}
      >
        {sub === 'lms'    && <LargeMediumSmallSubTab scope={scope} gov={gov} />}
        {sub === 'crule'  && <CompanyRuleSubTab scope={scope} />}
        {sub === 'wguide' && <WorkGuideSubTab scope={scope} />}
        {sub === 'hp'     && <HomepageClassSubTab scope={scope} />}
        {sub === 'manda'  && <MandalartSubTab scope={scope} gov={gov} />}
        {sub === 'items'  && <ItemViewSubTab scope={scope} gov={gov} />}
      </SectionCard>
    </div>
  );
}
