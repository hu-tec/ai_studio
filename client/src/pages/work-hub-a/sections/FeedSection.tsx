import FeedView from '../../work-hub/FeedView';
import type { HubPost } from '../types';
import { POST_TYPE_STYLES, buildPathLabel, fmtDate, fmtSize } from '../constants';

/* FeedSection — ver.B의 FeedView를 그대로 재사용 */
const POST_TYPES_ARR = Object.entries(POST_TYPE_STYLES).map(([type, s]) => ({ type, ...s }));

interface Props {
  sorted: HubPost[]; posts: HubPost[]; comments: any[];
  searchText: string; setSearchText: (v: string) => void;
  anyFilterActive: boolean; resetFilters: () => void;
  activePath: string[]; setActivePath: (v: string[]) => void;
  setShowForm: (v: boolean) => void; setEditingId: (v: string | null) => void;
  handleDelete: (pid: string) => void; handleTogglePin: (post: any) => void;
  getPostComments: (pid: string) => any[]; fetchData: () => void;
}

export default function FeedSection(props: Props) {
  return (
    <FeedView
      {...props}
      POST_TYPES={POST_TYPES_ARR}
      buildPathLabel={buildPathLabel}
      fmtDate={fmtDate}
      fmtSize={fmtSize}
    />
  );
}
