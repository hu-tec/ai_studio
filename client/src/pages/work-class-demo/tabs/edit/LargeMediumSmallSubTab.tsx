import { useMemo } from 'react';
import TaxonomyTreeEditor from '../../components/TaxonomyTreeEditor';
import { allowedAxes } from '../../taxonomyTypes';
import type { TaxonomyScope, TaxonomyGov } from '../../taxonomyTypes';

// 대중소 DB 편집기 — central. 모든 hierarchical (대→중→소) 축 편집.
export default function LargeMediumSmallSubTab({ scope, gov }: { scope: TaxonomyScope; gov: TaxonomyGov }) {
  // gov 와 무관하게 'common' 축도 함께 노출 (대중소 트리는 보통 common 에 저장)
  const axes = useMemo(() => {
    const local = allowedAxes(scope, gov);
    const common = allowedAxes('common', 'common');
    return Array.from(new Set([...local, ...common]));
  }, [scope, gov]);

  return (
    <div className="space-y-1">
      <div className="text-[10px] text-slate-500 px-1">
        대→중→소 3 층 spreadsheet 편집기. 좌측 [축] 선택 → 우측 표에서 셀 클릭으로 수정, 마지막 [관리] 열에서 자식 추가.
        대중소가 아닌 flat 축(예: 업무별)은 사내규정/업무지침 매트릭스 탭에서 편집.
      </div>
      <TaxonomyTreeEditor scope={scope} gov={gov} axes={axes} />
    </div>
  );
}
