import FlatAxisMatrix from '../../components/FlatAxisMatrix';
import { allowedAxes } from '../../taxonomyTypes';
import type { TaxonomyScope } from '../../taxonomyTypes';

// 업무지침 매트릭스 — 분류별/교육별/급수별/세부급수/DB별
export default function WorkGuideSubTab({ scope }: { scope: TaxonomyScope }) {
  const axes = allowedAxes(scope, 'work-guide');
  return (
    <div className="space-y-1">
      <div className="text-[10px] text-slate-500 px-1">
        업무지침 축의 칩 매트릭스. 사내업무지침(통합-new) &gt; 업무지침 탭과 동일 축.
      </div>
      <FlatAxisMatrix scope={scope} gov="work-guide" axes={axes} title="업무지침 축" />
    </div>
  );
}
