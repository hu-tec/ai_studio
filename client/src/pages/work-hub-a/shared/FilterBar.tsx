import { Search, X } from 'lucide-react';
import { POST_TYPE_STYLES, DEF_POS } from '../constants';
import type { PostType } from '../types';

interface Props {
  filterType: PostType | '전체'; setFilterType: (v: PostType | '전체') => void;
  filterPos: string[]; setFilterPos: (v: string[]) => void;
  filterAuthor: string; setFilterAuthor: (v: string) => void;
  searchText: string; setSearchText: (v: string) => void;
  allAuthors: string[];
  anyFilterActive: boolean; resetFilters: () => void;
  count: number; total: number;
  extra?: React.ReactNode;
}

const chip = (active: boolean, color: string, bg: string): React.CSSProperties => ({
  padding: '1px 6px', borderRadius: 6, border: '1px solid', borderColor: active ? color : '#e2e8f0',
  background: active ? bg : '#fff', color: active ? color : '#64748b', fontSize: 9, cursor: 'pointer', fontWeight: active ? 600 : 400
});

export default function FilterBar(props: Props) {
  const { filterType, setFilterType, filterPos, setFilterPos, filterAuthor, setFilterAuthor, searchText, setSearchText, allAuthors, anyFilterActive, resetFilters, count, total, extra } = props;
  const togglePos = (p: string) => setFilterPos(filterPos.includes(p) ? filterPos.filter(x => x !== p) : [...filterPos, p]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3, padding: '4px 8px', borderBottom: '1px solid #e2e8f0', background: '#fff', flexShrink: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', width: 160 }}>
          <Search size={10} style={{ position: 'absolute', left: 6, top: 6, color: '#94a3b8' }} />
          <input value={searchText} onChange={e => setSearchText(e.target.value)} placeholder="검색..."
            style={{ width: '100%', padding: '3px 6px 3px 22px', border: '1px solid #e2e8f0', borderRadius: 5, fontSize: 10, outline: 'none' }} />
        </div>
        {anyFilterActive && <button onClick={resetFilters} style={{ padding: '2px 6px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 5, fontSize: 9, cursor: 'pointer', color: '#EF4444' }}><X size={8} />초기화</button>}
        <span style={{ fontSize: 9, color: '#94a3b8' }}>{count}{count !== total ? `/${total}` : ''}건</span>
        {extra}
      </div>
      {/* 유형 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 8, color: '#94a3b8', fontWeight: 600 }}>유형</span>
        <button onClick={() => setFilterType('전체')} style={chip(filterType === '전체', '#3B82F6', '#EFF6FF')}>전체</button>
        {(Object.keys(POST_TYPE_STYLES) as PostType[]).map(t => {
          const s = POST_TYPE_STYLES[t];
          return <button key={t} onClick={() => setFilterType(t)} style={chip(filterType === t, s.color, s.bg)}>{s.icon}{t}</button>;
        })}
      </div>
      {/* 직급 + 작성자 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 8, color: '#94a3b8', fontWeight: 600 }}>직급</span>
        {DEF_POS.map(p => <button key={p} onClick={() => togglePos(p)} style={chip(filterPos.includes(p), '#7C3AED', '#F5F3FF')}>{p}</button>)}
        {allAuthors.length > 0 && <>
          <span style={{ fontSize: 8, color: '#94a3b8', fontWeight: 600, marginLeft: 4 }}>작성자</span>
          {allAuthors.map(a => <button key={a} onClick={() => setFilterAuthor(filterAuthor === a ? '' : a)} style={chip(filterAuthor === a, '#0EA5E9', '#F0F9FF')}>{a}</button>)}
        </>}
      </div>
    </div>
  );
}
