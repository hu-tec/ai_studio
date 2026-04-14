import FlatAxisMatrix from '../../components/FlatAxisMatrix';
import { allowedAxes } from '../../taxonomyTypes';
import type { TaxonomyScope } from '../../taxonomyTypes';

// 사내규정 매트릭스 — 유형/업무별/부서별/직급별/계약/작성자
export default function CompanyRuleSubTab({ scope }: { scope: TaxonomyScope }) {
  const axes = allowedAxes(scope, 'company-rule');
  return (
    <div className="space-y-1">
      <div className="text-[10px] text-slate-500 px-1">
        사내규정 축의 칩 매트릭스. 사내업무지침(통합-new) &gt; 사내규정 탭과 동일 축. 칩 클릭→수정, X→삭제, [+추가].
      </div>
      <FlatAxisMatrix scope={scope} gov="company-rule" axes={axes} title="사내규정 축" />
    </div>
  );
}
