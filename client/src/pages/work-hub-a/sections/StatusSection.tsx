import StatusTable from '../../work-hub/StatusTable';

/* StatusSection — ver.B의 StatusTable 재사용 */
interface Props { filterType?: string; activePath?: string[]; activePipeline?: string; }

export default function StatusSection({ filterType, activePath, activePipeline }: Props) {
  return <StatusTable filterType={filterType} activePath={activePath} />;
}
