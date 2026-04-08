import { useState, useMemo } from 'react';
import { ExternalLink, ChevronDown, ChevronUp, Search, User } from 'lucide-react';
import { PIPELINES, STATUSES, DUMMY_ITEMS, statusOf, POST_TYPE_STYLES, type ItemStatus, type PostType, type PipelineItem } from './pipeline-data';

/* ══════════════════════════════════════════════════════════════
   Status Table — 빽빽한 현황표
   ══════════════════════════════════════════════════════════════ */
const POST_TYPES: PostType[] = ['공지','업무지시','메모','파일','프로세스','보고'];

interface Props { filterType?: string; activePath?: string[]; }

export default function StatusTable({ filterType, activePath = [] }: Props) {
  const [items] = useState<PipelineItem[]>(DUMMY_ITEMS);
  const [searchText, setSearchText] = useState('');
  const [filterStage, setFilterStage] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState<ItemStatus[]>([]);
  const [filterPostType, setFilterPostType] = useState<PostType[]>([]);
  const [sortKey, setSortKey] = useState<'stage'|'type'|'status'|'title'|'date'|'assignee'>('stage');
  const [sortAsc, setSortAsc] = useState(true);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const ALL_COLS = ['파이프','유형','분류1','분류2','항목명','상태','담당','비고','날짜','링크'] as const;
  const [visibleCols, setVisibleCols] = useState<Set<string>>(new Set(ALL_COLS));
  const showCol = (c: string) => visibleCols.has(c);
  const toggleCol = (c: string) => setVisibleCols(prev => { const n = new Set(prev); if (n.has(c)) n.delete(c); else n.add(c); return n; });
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteVal, setEditingNoteVal] = useState('');

  const allExpanded = expandedIds.size > 0 && items.every(i => expandedIds.has(i.id));
  const toggleAll = () => setExpandedIds(allExpanded ? new Set() : new Set(items.map(i => i.id)));
  const toggleRow = (id: string) => setExpandedIds(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const handleSort = (key: typeof sortKey) => { if (sortKey === key) setSortAsc(!sortAsc); else { setSortKey(key); setSortAsc(true); } };

  const filtered = useMemo(() => {
    let result = [...items];
    // sidebar type filter
    if (filterType && filterType !== '전체') result = result.filter(i => i.type === filterType);
    if (filterStage.length) result = result.filter(i => filterStage.includes(i.pipelineId));
    if (filterStatus.length) result = result.filter(i => filterStatus.includes(i.status));
    if (filterPostType.length) result = result.filter(i => filterPostType.includes(i.type));
    if (searchText) {
      const s = searchText.toLowerCase();
      result = result.filter(i => i.title.toLowerCase().includes(s) || i.sub1.toLowerCase().includes(s) || (i.sub2||'').toLowerCase().includes(s) || (i.assignee||'').toLowerCase().includes(s) || (i.note||'').toLowerCase().includes(s));
    }
    const stageOrder = PIPELINES.map(s => s.id);
    const statusOrder = STATUSES.map(s => s.key);
    result.sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'stage') cmp = stageOrder.indexOf(a.pipelineId) - stageOrder.indexOf(b.pipelineId);
      else if (sortKey === 'status') cmp = statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status);
      else if (sortKey === 'type') cmp = a.type.localeCompare(b.type);
      else if (sortKey === 'title') cmp = a.title.localeCompare(b.title);
      else if (sortKey === 'date') cmp = (a.date||'zz').localeCompare(b.date||'zz');
      else if (sortKey === 'assignee') cmp = (a.assignee||'zz').localeCompare(b.assignee||'zz');
      return sortAsc ? cmp : -cmp;
    });
    return result;
  }, [items, filterType, filterStage, filterStatus, filterPostType, searchText, sortKey, sortAsc]);

  const anyFilter = filterStage.length > 0 || filterStatus.length > 0 || filterPostType.length > 0 || !!searchText;
  const SortIcon = ({ k }: { k: typeof sortKey }) => sortKey === k ? (sortAsc ? <ChevronUp size={9} /> : <ChevronDown size={9} />) : null;
  const th: React.CSSProperties = { padding: '4px 6px', fontSize: 10, fontWeight: 700, color: '#475569', cursor: 'pointer', textAlign: 'left', whiteSpace: 'nowrap', borderBottom: '2px solid #e2e8f0', background: '#f8fafc', position: 'sticky', top: 0, zIndex: 1 };

  return (
    <div style={{ padding: '10px 16px' }}>
      {/* 필터 — 컴팩트 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <button onClick={toggleAll} style={{ padding: '3px 10px', borderRadius: 6, border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: 11, cursor: 'pointer', color: '#475569', fontWeight: 600 }}>{allExpanded ? '접기' : '펼치기'}</button>
          <div style={{ position: 'relative', width: 200 }}>
            <Search size={12} style={{ position: 'absolute', left: 7, top: 7, color: '#94a3b8' }} />
            <input value={searchText} onChange={e => setSearchText(e.target.value)} placeholder="검색..." style={{ width: '100%', padding: '4px 8px 4px 24px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 11, outline: 'none' }} />
          </div>
          {anyFilter && <button onClick={() => { setFilterStage([]); setFilterStatus([]); setFilterPostType([]); setSearchText(''); }} style={{ padding: '3px 8px', borderRadius: 6, border: '1px solid #FECACA', background: '#FEF2F2', color: '#EF4444', fontSize: 10, cursor: 'pointer' }}>초기화</button>}
          <span style={{ marginLeft: 'auto', fontSize: 11, color: '#94a3b8' }}>{filtered.length}/{items.length}</span>
        </div>
        {/* 3줄 필터 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 9, color: '#94a3b8', fontWeight: 600, minWidth: 40 }}>파이프라인</span>
          {PIPELINES.map(s => { const a = filterStage.includes(s.id); return <button key={s.id} onClick={() => setFilterStage(prev => a ? prev.filter(x=>x!==s.id) : [...prev,s.id])} style={{ padding: '2px 6px', borderRadius: 8, border: '1px solid', borderColor: a ? s.color : '#e2e8f0', background: a ? s.bg : '#fff', color: a ? s.color : '#64748b', fontSize: 9, cursor: 'pointer', fontWeight: a ? 600 : 400 }}>{s.name}</button>; })}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 9, color: '#94a3b8', fontWeight: 600, minWidth: 40 }}>유형</span>
          {POST_TYPES.map(t => { const a = filterPostType.includes(t); const st = POST_TYPE_STYLES[t]; return <button key={t} onClick={() => setFilterPostType(prev => a ? prev.filter(x=>x!==t) : [...prev,t])} style={{ padding: '2px 6px', borderRadius: 8, border: '1px solid', borderColor: a ? st.color : '#e2e8f0', background: a ? st.bg : '#fff', color: a ? st.color : '#64748b', fontSize: 9, cursor: 'pointer', fontWeight: a ? 600 : 400 }}>{t}</button>; })}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 9, color: '#94a3b8', fontWeight: 600, minWidth: 40 }}>상태</span>
          {STATUSES.map(s => { const a = filterStatus.includes(s.key); return <button key={s.key} onClick={() => setFilterStatus(prev => a ? prev.filter(x=>x!==s.key) : [...prev,s.key])} style={{ padding: '2px 6px', borderRadius: 8, border: '1px solid', borderColor: a ? s.color : '#e2e8f0', background: a ? s.bg : '#fff', color: a ? s.color : '#64748b', fontSize: 9, cursor: 'pointer', fontWeight: a ? 600 : 400 }}>{s.key}</button>; })}
        </div>
        {/* 열 선택 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 9, color: '#94a3b8', fontWeight: 600, minWidth: 40 }}>열</span>
          {ALL_COLS.map(c => <button key={c} onClick={() => toggleCol(c)} style={{ padding: '2px 5px', borderRadius: 6, border: '1px solid', borderColor: showCol(c) ? '#3B82F6' : '#e2e8f0', background: showCol(c) ? '#EFF6FF' : '#fff', color: showCol(c) ? '#3B82F6' : '#cbd5e1', fontSize: 8, cursor: 'pointer', fontWeight: showCol(c) ? 600 : 400 }}>{c}</button>)}
        </div>
      </div>

      {/* 테이블 */}
      <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #e2e8f0', overflow: 'auto', maxHeight: 'calc(100vh - 260px)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
          <thead>
            <tr>
              <th style={{ ...th, width: 28 }}>#</th>
              {showCol('파이프') && <th style={th} onClick={() => handleSort('stage')}>파이프 <SortIcon k="stage" /></th>}
              {showCol('유형') && <th style={th} onClick={() => handleSort('type')}>유형 <SortIcon k="type" /></th>}
              {showCol('분류1') && <th style={{ ...th, minWidth: 48 }}>분류1</th>}
              {showCol('분류2') && <th style={{ ...th, minWidth: 36 }}>분류2</th>}
              {showCol('항목명') && <th style={th} onClick={() => handleSort('title')}>항목명 <SortIcon k="title" /></th>}
              {showCol('상태') && <th style={th} onClick={() => handleSort('status')}>상태 <SortIcon k="status" /></th>}
              {showCol('담당') && <th style={th} onClick={() => handleSort('assignee')}>담당 <SortIcon k="assignee" /></th>}
              {showCol('비고') && <th style={{ ...th, minWidth: 50 }}>비고</th>}
              {showCol('날짜') && <th style={th} onClick={() => handleSort('date')}>날짜 <SortIcon k="date" /></th>}
              {showCol('링크') && <th style={{ ...th, width: 24 }}>링크</th>}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={10} style={{ padding: 20, textAlign: 'center', color: '#94a3b8', fontSize: 11 }}>해당 항목 없음</td></tr>
            ) : filtered.map((item, idx) => {
              const st = statusOf(item.status);
              const stg = PIPELINES.find(s => s.id === item.pipelineId) || PIPELINES[0];
              const pt = POST_TYPE_STYLES[item.type];
              const isOpen = expandedIds.has(item.id);
              return (
                <tr key={item.id} onClick={() => toggleRow(item.id)} style={{ cursor: 'pointer', borderBottom: isOpen ? 'none' : '1px solid #f1f5f9' }}
                  onMouseEnter={e => { if (!isOpen) (e.currentTarget as HTMLElement).style.background = '#fafbfd'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ''; }}>
                  <td style={{ padding: '3px 6px', color: '#94a3b8', fontSize: 9 }}>{idx + 1}</td>
                  {showCol('파이프') && <td style={{ padding: '3px 6px' }}><span style={{ padding: '0px 5px', borderRadius: 6, fontSize: 9, background: stg.bg, color: stg.color, fontWeight: 600 }}>{stg.name}</span></td>}
                  {showCol('유형') && <td style={{ padding: '3px 6px' }}><span style={{ padding: '0px 4px', borderRadius: 4, fontSize: 8, background: pt.bg, color: pt.color, fontWeight: 700 }}>{item.type}</span></td>}
                  {showCol('분류1') && <td style={{ padding: '3px 6px', fontSize: 10, color: '#475569', fontWeight: 500 }}>{item.sub1}</td>}
                  {showCol('분류2') && <td style={{ padding: '3px 6px', fontSize: 9, color: '#94a3b8' }}>{item.sub2 || '—'}</td>}
                  {showCol('항목명') && <td style={{ padding: '3px 6px', color: '#1e293b', fontWeight: 500, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.title}
                    {isOpen && item.note && <div style={{ fontSize: 10, color: '#64748b', fontWeight: 400, marginTop: 1, whiteSpace: 'normal' }}>{item.note}</div>}
                  </td>}
                  {showCol('상태') && <td style={{ padding: '3px 6px' }}><span style={{ padding: '1px 5px', borderRadius: 6, fontSize: 9, background: st.bg, color: st.color, fontWeight: 600 }}>{item.status}</span></td>}
                  {showCol('담당') && <td style={{ padding: '3px 6px', fontSize: 10, color: '#64748b' }}>{item.assignee || '—'}</td>}
                  {showCol('비고') && <td style={{ padding: '3px 6px' }} onClick={e => { e.stopPropagation(); setEditingNoteId(item.id); setEditingNoteVal(item.note || ''); }}>
                    {editingNoteId === item.id ? (
                      <input value={editingNoteVal} onChange={e => setEditingNoteVal(e.target.value)}
                        onBlur={() => setEditingNoteId(null)} onKeyDown={e => { if (e.key === 'Escape') setEditingNoteId(null); }}
                        autoFocus onClick={e => e.stopPropagation()} style={{ width: '100%', padding: '1px 3px', border: '1px solid #3B82F6', borderRadius: 3, fontSize: 9, outline: 'none' }} />
                    ) : <span style={{ fontSize: 9, color: item.note ? '#475569' : '#cbd5e1', cursor: 'text' }}>{item.note || '비고'}</span>}
                  </td>}
                  {showCol('날짜') && <td style={{ padding: '3px 6px', fontSize: 9, color: '#94a3b8' }}>{item.date || '—'}</td>}
                  {showCol('링크') && <td style={{ padding: '3px 6px' }} onClick={e => e.stopPropagation()}>
                    {item.link ? <a href={item.link} style={{ color: '#3B82F6' }}><ExternalLink size={10} /></a> : <span style={{ color: '#e2e8f0' }}>—</span>}
                  </td>}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 하단 요약 */}
      <div style={{ marginTop: 6, display: 'flex', gap: 8, flexWrap: 'wrap', fontSize: 10 }}>
        {PIPELINES.map(s => { const c = filtered.filter(i => i.pipelineId === s.id).length; return c ? <span key={s.id} style={{ color: s.color, fontWeight: 600 }}>{s.name}:{c}</span> : null; })}
        <span style={{ color: '#e2e8f0' }}>|</span>
        {STATUSES.map(s => { const c = filtered.filter(i => i.status === s.key).length; return c ? <span key={s.key} style={{ color: s.color, fontWeight: 600 }}>{s.key}:{c}</span> : null; })}
      </div>
    </div>
  );
}
