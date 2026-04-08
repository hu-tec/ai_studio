import PipelineDashboard from '../../work-hub/PipelineDashboard';

/** ver.B의 PipelineDashboard를 ver.A 섹션으로 래핑 */
interface Props { filterType?: string; activePath?: string[]; activePipeline?: string; }

export default function PipelineSection({ filterType, activePath, activePipeline }: Props) {
  return <PipelineDashboard filterType={filterType} activePath={activePath} />;
}
