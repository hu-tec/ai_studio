import { useState, useMemo } from 'react';
import { ExternalLink, ChevronDown, ChevronUp, Search, User } from 'lucide-react';
import { STAGES, STATUSES, DUMMY_ITEMS, statusOf, POST_TYPE_STYLES, type PipelineStage, type ItemStatus, type PostType, type PipelineItem } from './pipeline-data';

/* ══════════════════════════════════════════════════════════════
   Status Table — 빽빽한 현황표
   ══════════════════════════════════════════════════════════════ */
const POST_TYPES: PostType[] = ['공지','업무지시','메모','파일','프로세스','보고'];

interface Props { filterType?: string; }

export default function StatusTable({ filterType }: Props) {
  const [items] = useState<PipelineItem[]>(DUMMY_ITEMS);
  const [searchText, setSearchText] = useState('');
  const [filterStage, setFilterStage] = useState<PipelineStage[]>([]);
  const [filterStatus, setFilterStatus] = useState<ItemStatus[]>([]);
  const [filterPostType, setFilterPostType] = useState<PostType[]>([]);
  const [sortKey, setSortKey] = useState<'stage'|'type'|'status'|'title'|'date'|'assignee'>('stage');
  const [sortAsc, setSortAsc] = useState(true);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const allExpanded = expandedIds.size > 0 && items.every(i => expandedIds.has(i.id));
  const toggleAll = () => setExpandedIds(allExpanded ? new Set() : new Set(items.map(i => i.id)));
  const toggleRow = (id: string) => setExpandedIds(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const handleSort = (key: typeof sortKey) => { if (sortKey === key) setSortAsc(!sortAsc); else { setSortKey(key); setSortAsc(true); } };

  const filtered = useMemo(() => {
    let result = [...items];
    // sidebar type filter
    if (filterType && filterType !== '전체') result = result.filter(i => i.type === filterType);
    if (filterStage.length) result = result.filter(i => filterStage.includes(i.stage));
    if (filterStatus.length) result = result.filter(i => filterStatus.includes(i.status));
    if (filterPostType.length) result = result.filter(i => filterPostType.includes(i.type));
    if (searchText) {
      const s = searchText.toLowerCase();
      result = result.filter(i => i.title.toLowerCase().includes(s) || i.sub1.toLowerCase().includes(s) || (i.sub2||'').toLowerCase().includes(s) || (i.assignee||'').toLowerCase().includes(s) || (i.note||'').toLowerCase().includes(s));
    }
    const stageOrder = STAGES.map(s => s.key);
    const statusOrder = STATUSES.map(s => s.key);
    result.sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'stage') cmp = stageOrder.indexOf(a.stage) - stageOrder.indexOf(b.stage);
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
          {STAGES.map(s => { const a = filterStage.includes(s.key); return <button key={s.key} onClick={() => setFilterStage(prev => a ? prev.filter(x=>x!==s.key) : [...prev,s.key])} style={{ padding: '2px 6px', borderRadius: 8, border: '1px solid', borderColor: a ? s.color : '#e2e8f0', background: a ? s.bg : '#fff', color: a ? s.color : '#64748b', fontSize: 9, cursor: 'pointer', fontWeight: a ? 600 : 400 }}>{s.label}</button>; })}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 9, color: '#94a3b8', fontWeight: 600, minWidth: 40 }}>유형</span>
          {POST_TYPES.map(t => { const a = filterPostType.includes(t); const st = POST_TYPE_STYLES[t]; return <button key={t} onClick={() => setFilterPostType(prev => a ? prev.filter(x=>x!==t) : [...prev,t])} style={{ padding: '2px 6px', borderRadius: 8, border: '1px solid', borderColor: a ? st.color : '#e2e8f0', background: a ? st.bg : '#fff', color: a ? st.color : '#64748b', fontSize: 9, cursor: 'pointer', fontWeight: a ? 600 : 400 }}>{t}</button>; })}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 9, color: '#94a3b8', fontWeight: 600, minWidth: 40 }}>상태</span>
          {STATUSES.map(s => { const a = filterStatus.includes(s.key); return <button key={s.key} onClick={() => setFilterStatus(prev => a ? prev.filter(x=>x!==s.key) : [...prev,s.key])} style={{ padding: '2px 6px', borderRadius: 8, border: '1px solid', borderColor: a ? s.color : '#e2e8f0', background: a ? s.bg : '#fff', color: a ? s.color : '#64748b', fontSize: 9, cursor: 'pointer', fontWeight: a ? 600 : 400 }}>{s.key}</button>; })}
        </div>
      </div>

      {/* 테이블 */}
      <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #e2e8f0', overflow: 'auto', maxHeight: 'calc(100vh - 260px)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
          <thead>
            <tr>
              <th style={{ ...th, width: 28 }}>#</th>
              <th style={th} onClick={() => handleSort('stage')}>파이프 <SortIcon k="stage" /></th>
              <th style={th} onClick={() => handleSort('type')}>유형 <SortIcon k="type" /></th>
              <th style={{ ...th, minWidth: 48 }}>분류1</th>
              <th style={{ ...th, minWidth: 36 }}>분류2</th>
              <th style={th} onClick={() => handleSort('title')}>항목명 <SortIcon k="title" /></th>
              <th style={th} onClick={() => handleSort('status')}>상태 <SortIcon k="status" /></th>
              <th style={th} onClick={() => handleSort('assignee')}>담당 <SortIcon k="assignee" /></th>
              <th style={th} onClick={() => handleSort('date')}>날짜 <SortIcon k="date" /></th>
              <th style={{ ...th, width: 24 }}>링크</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={10} style={{ padding: 20, textAlign: 'center', color: '#94a3b8', fontSize: 11 }}>해당 항목 없음</td></tr>
            ) : filtered.map((item, idx) => {
              const st = statusOf(item.status);
              const stg = STAGES.find(s => s.key === item.stage)!;
              const pt = POST_TYPE_STYLES[item.type];
              const isOpen = expandedIds.has(item.id);
              return (
                <tr key={item.id} onClick={() => toggleRow(item.id)} style={{ cursor: 'pointer', borderBottom: isOpen ? 'none' : '1px solid #f1f5f9' }}
                  onMouseEnter={e => { if (!isOpen) (e.currentTarget as HTMLElement).style.background = '#fafbfd'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ''; }}>
                  <td style={{ padding: '3px 6px', color: '#94a3b8', fontSize: 9 }}>{idx + 1}</td>
                  <td style={{ padding: '3px 6px' }}><span style={{ padding: '0px 5px', borderRadius: 6, fontSize: 9, background: stg.bg, color: stg.color, fontWeight: 600, lineHeight: '15px', display: 'inline-block' }}>{stg.label}</span></td>
                  <td style={{ padding: '3px 6px' }}><span style={{ padding: '0px 4px', borderRadius: 4, fontSize: 8, background: pt.bg, color: pt.color, fontWeight: 700, lineHeight: '14px', display: 'inline-block' }}>{item.type}</span></td>
                  <td style={{ padding: '3px 6px', fontSize: 10, color: '#475569', fontWeight: 500 }}>{item.sub1}</td>
                  <td style={{ padding: '3px 6px', fontSize: 9, color: '#94a3b8' }}>{item.sub2 || '—'}</td>
                  <td style={{ padding: '3px 6px', color: '#1e293b', fontWeight: 500, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.title}
                    {isOpen && item.note && <div style={{ fontSize: 10, color: '#64748b', fontWeight: 400, marginTop: 1, whiteSpace: 'normal' }}>{item.note}</div>}
                  </td>
                  <td style={{ padding: '3px 6px' }}><span style={{ padding: '1px 5px', borderRadius: 6, fontSize: 9, background: st.bg, color: st.color, fontWeight: 600 }}>{item.status}</span></td>
                  <td style={{ padding: '3px 6px', fontSize: 10, color: '#64748b' }}>{item.assignee || '—'}</td>
                  <td style={{ padding: '3px 6px', fontSize: 9, color: '#94a3b8' }}>{item.date || '—'}</td>
                  <td style={{ padding: '3px 6px' }} onClick={e => e.stopPropagation()}>
                    {item.link ? <a href={item.link} style={{ color: '#3B82F6' }}><ExternalLink size={10} /></a> : <span style={{ color: '#e2e8f0' }}>—</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 하단 요약 */}
      <div style={{ marginTop: 6, display: 'flex', gap: 8, flexWrap: 'wrap', fontSize: 10 }}>
        {STAGES.map(s => { const c = filtered.filter(i => i.stage === s.key).length; return c ? <span key={s.key} style={{ color: s.color, fontWeight: 600 }}>{s.label}:{c}</span> : null; })}
        <span style={{ color: '#e2e8f0' }}>|</span>
        {STATUSES.map(s => { const c = filtered.filter(i => i.status === s.key).length; return c ? <span key={s.key} style={{ color: s.color, fontWeight: 600 }}>{s.key}:{c}</span> : null; })}
      </div>
    </div>
  );
}
