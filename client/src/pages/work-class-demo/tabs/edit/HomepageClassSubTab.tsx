import FlatAxisMatrix from '../../components/FlatAxisMatrix';
import { allowedAxes } from '../../taxonomyTypes';
import type { TaxonomyScope } from '../../taxonomyTypes';

// 홈페이지 분류 매트릭스 — 홈페이지타입/분야/급수
export default function HomepageClassSubTab({ scope }: { scope: TaxonomyScope }) {
  const axes = allowedAxes(scope, 'homepage');
  return (
    <div className="space-y-1">
      <div className="text-[10px] text-slate-500 px-1">
        홈페이지 분류 축. 사내규정·업무지침과 별도 축으로 운영. 신규 영역이라 빈 껍데기로 시작.
      </div>
      <FlatAxisMatrix scope={scope} gov="homepage" axes={axes} title="홈페이지 분류 축" />
    </div>
  );
}
