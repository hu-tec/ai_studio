import { useState, useMemo } from 'react';
import { Database, Table2, Building2, BookOpen, Globe, Grid3x3, Filter } from 'lucide-react';
import { SectionCard } from '../components/SectionCard';
import { LensSwitch, GovSwitch } from '../components/LensSwitch';
import { useTaxonomy } from '../api';
import { allowedAxes } from '../taxonomyTypes';
import type { TaxonomyScope, TaxonomyGov } from '../taxonomyTypes';

type EditSubTab =
  | 'lms'     // 🗂 대중소 DB 편집기
  | 'crule'   // 🏢 사내규정 매트릭스
  | 'wguide'  // 📘 업무지침 매트릭스
  | 'hp'      // 🌐 홈페이지 분류 매트릭스
  | 'manda'   // 📊 만다라트 뷰
  | 'items';  // 🔀 아이템 뷰

const SUBTABS: { code: EditSubTab; label: string; icon: any }[] = [
  { code: 'lms',    label: '대중소 DB',    icon: Table2 },
  { code: 'crule',  label: '사내규정',     icon: Building2 },
  { code: 'wguide', label: '업무지침',     icon: BookOpen },
  { code: 'hp',     label: '홈페이지',     icon: Globe },
  { code: 'manda',  label: '만다라트',     icon: Grid3x3 },
  { code: 'items',  label: '아이템 뷰',    icon: Filter },
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

      {/* 서브탭 본체 — Step 2 에서 각 컴포넌트로 분리 */}
      <SectionCard
        title={`③ ${SUBTABS.find((t) => t.code === sub)?.label}`}
        subtitle={`scope=${scope} · gov=${gov} · 노드 ${nodes.length}개 ${loading ? '(불러오는 중)' : ''}`}
      >
        {error && (
          <div className="text-[11px] text-rose-600 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded p-1.5 mb-1">
            DB 연결 실패: {error}
          </div>
        )}
        <div className="text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
          <div className="px-2 py-4 text-center border border-dashed border-slate-300 dark:border-slate-600 rounded">
            <div className="text-[11px] font-semibold mb-1">Step 2 구현 예정</div>
            <div className="text-[10px] text-slate-500">
              {sub === 'lms'    && '대중소 3층 spreadsheet 편집기 (rowspan 병합, 인라인 CRUD)'}
              {sub === 'crule'  && '사내규정 칩 매트릭스 — 유형·업무별·부서별·직급별·계약·작성자'}
              {sub === 'wguide' && '업무지침 칩 매트릭스 — 분류별·교육별·급수별·세부급수·DB별'}
              {sub === 'hp'     && '홈페이지 분류 매트릭스 — 홈페이지타입·분야·급수'}
              {sub === 'manda'  && '만다라트 뷰 — work-log MandalartView 재사용, 셀↔taxonomy 바인딩, 업무일지 one-way import'}
              {sub === 'items'  && 'facets 필터 + 거버넌스 자동 게이팅 (PlanA 운영판)'}
            </div>
          </div>
          <div className="text-[10px] text-slate-500">
            현재 허용 축: {axes.map((a) => (
              <span key={a} className="inline-block px-1 py-0.5 mr-0.5 bg-slate-100 dark:bg-slate-800 rounded">{a}</span>
            ))}
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
