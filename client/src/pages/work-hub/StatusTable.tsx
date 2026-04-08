import { useState, useMemo } from 'react';
import { ExternalLink, ChevronDown, ChevronUp, Search, User } from 'lucide-react';
import { STAGES, STATUSES, DUMMY_ITEMS, statusOf, type PipelineStage, type ItemStatus, type PipelineItem } from './pipeline-data';

/* ══════════════════════════════════════════════════════════════
   Status Table — 빽빽한 현황표 (행×열 꽉꽉 + 링크 가득)
   ══════════════════════════════════════════════════════════════ */

export default function StatusTable() {
  const [items] = useState<PipelineItem[]>(DUMMY_ITEMS);
  const [searchText, setSearchText] = useState('');
  const [filterStage, setFilterStage] = useState<PipelineStage[]>([]);
  const [filterStatus, setFilterStatus] = useState<ItemStatus[]>([]);
  const [sortKey, setSortKey] = useState<'stage' | 'status' | 'title' | 'date' | 'assignee'>('stage');
  const [sortAsc, setSortAsc] = useState(true);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const allExpanded = expandedIds.size > 0 && items.every(i => expandedIds.has(i.id));
  const toggleAll = () => setExpandedIds(allExpanded ? new Set() : new Set(items.map(i => i.id)));
  const toggleRow = (id: string) => setExpandedIds(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });

  const toggleStage = (s: PipelineStage) => setFilterStage(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  const toggleStatus = (s: ItemStatus) => setFilterStatus(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const handleSort = (key: typeof sortKey) => { if (sortKey === key) setSortAsc(!sortAsc); else { setSortKey(key); setSortAsc(true); } };

  const filtered = useMemo(() => {
    let result = [...items];
    if (filterStage.length) result = result.filter(i => filterStage.includes(i.stage));
    if (filterStatus.length) result = result.filter(i => filterStatus.includes(i.status));
    if (searchText) {
      const s = searchText.toLowerCase();
      result = result.filter(i => i.title.toLowerCase().includes(s) || i.sub1.toLowerCase().includes(s) || (i.sub2 || '').toLowerCase().includes(s) || (i.assignee || '').toLowerCase().includes(s) || (i.note || '').toLowerCase().includes(s));
    }
    // sort
    const stageOrder = STAGES.map(s => s.key);
    const statusOrder = STATUSES.map(s => s.key);
    result.sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'stage') cmp = stageOrder.indexOf(a.stage) - stageOrder.indexOf(b.stage);
      else if (sortKey === 'status') cmp = statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status);
      else if (sortKey === 'title') cmp = a.title.localeCompare(b.title);
      else if (sortKey === 'date') cmp = (a.date || 'zz').localeCompare(b.date || 'zz');
      else if (sortKey === 'assignee') cmp = (a.assignee || 'zz').localeCompare(b.assignee || 'zz');
      return sortAsc ? cmp : -cmp;
    });
    return result;
  }, [items, filterStage, filterStatus, searchText, sortKey, sortAsc]);

  const anyFilter = filterStage.length > 0 || filterStatus.length > 0 || !!searchText;

  // count per stage & status
  const stageCounts = STAGES.map(s => ({ ...s, count: items.filter(i => i.stage === s.key).length }));
  const statusCounts = STATUSES.map(s => ({ ...s, count: items.filter(i => i.status === s.key).length }));

  const SortIcon = ({ k }: { k: typeof sortKey }) => sortKey === k ? (sortAsc ? <ChevronUp size={10} /> : <ChevronDown size={10} />) : null;

  const thStyle = (k: typeof sortKey): React.CSSProperties => ({ padding: '6px 8px', fontSize: 11, fontWeight: 700, color: '#475569', cursor: 'pointer', textAlign: 'left', whiteSpace: 'nowrap', userSelect: 'none', borderBottom: '2px solid #e2e8f0', background: '#f8fafc', position: 'sticky' as const, top: 0, zIndex: 1 });

  return (
    <div style={{ padding: '20px 24px' }}>
      {/* 필터 바 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <button onClick={toggleAll} style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: 13, cursor: 'pointer', color: '#475569', fontWeight: 600 }}>
            {allExpanded ? '전체 접기' : '전체 펼치기'}
          </button>
          <div style={{ position: 'relative', width: 240 }}>
            <Search size={14} style={{ position: 'absolute', left: 8, top: 8, color: '#94a3b8' }} />
            <input value={searchText} onChange={e => setSearchText(e.target.value)} placeholder="검색..."
              style={{ width: '100%', padding: '6px 10px 6px 28px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, outline: 'none' }} />
          </div>
          {anyFilter && <button onClick={() => { setFilterStage([]); setFilterStatus([]); setSearchText(''); }}
            style={{ padding: '5px 10px', borderRadius: 8, border: '1px solid #FECACA', background: '#FEF2F2', color: '#EF4444', fontSize: 12, cursor: 'pointer' }}>초기화</button>}
          <span style={{ marginLeft: 'auto', fontSize: 12, color: '#94a3b8' }}>{filtered.length}건{anyFilter ? ` / ${items.length}` : ''}</span>
        </div>
        {/* 파이프라인 필터 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600, minWidth: 48 }}>파이프라인</span>
          {stageCounts.map(s => {
            const active = filterStage.includes(s.key);
            return <button key={s.key} onClick={() => toggleStage(s.key)}
              style={{ padding: '3px 8px', borderRadius: 10, border: '1px solid', borderColor: active ? s.color : '#e2e8f0', background: active ? s.bg : '#fff', color: active ? s.color : '#64748b', fontSize: 10, cursor: 'pointer', fontWeight: active ? 600 : 400 }}>
              {s.label} {s.count}
            </button>;
          })}
        </div>
        {/* 상태 필터 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600, minWidth: 48 }}>상태</span>
          {statusCounts.map(s => {
            const active = filterStatus.includes(s.key);
            return <button key={s.key} onClick={() => toggleStatus(s.key)}
              style={{ padding: '3px 8px', borderRadius: 10, border: '1px solid', borderColor: active ? s.color : '#e2e8f0', background: active ? s.bg : '#fff', color: active ? s.color : '#64748b', fontSize: 10, cursor: 'pointer', fontWeight: active ? 600 : 400 }}>
              {s.key} {s.count}
            </button>;
          })}
        </div>
      </div>

      {/* 테이블 */}
      <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0', overflow: 'auto', maxHeight: 'calc(100vh - 280px)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr>
              <th style={{ ...thStyle('stage'), width: 36 }}>#</th>
              <th style={thStyle('stage')} onClick={() => handleSort('stage')}>파이프라인 <SortIcon k="stage" /></th>
              <th style={{ ...thStyle('stage'), minWidth: 60 }}>분류1</th>
              <th style={{ ...thStyle('stage'), minWidth: 40 }}>분류2</th>
              <th style={thStyle('title')} onClick={() => handleSort('title')}>항목명 <SortIcon k="title" /></th>
              <th style={thStyle('status')} onClick={() => handleSort('status')}>상태 <SortIcon k="status" /></th>
              <th style={thStyle('assignee')} onClick={() => handleSort('assignee')}>담당 <SortIcon k="assignee" /></th>
              <th style={thStyle('date')} onClick={() => handleSort('date')}>날짜 <SortIcon k="date" /></th>
              <th style={{ ...thStyle('stage'), width: 28 }}>링크</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={9} style={{ padding: 24, textAlign: 'center', color: '#94a3b8' }}>해당 항목 없음</td></tr>
            ) : filtered.map((item, idx) => {
              const st = statusOf(item.status);
              const stg = STAGES.find(s => s.key === item.stage)!;
              const isOpen = expandedIds.has(item.id);
              return (
                <tr key={item.id} onClick={() => toggleRow(item.id)} style={{ cursor: 'pointer', borderBottom: isOpen ? 'none' : '1px solid #f1f5f9' }}
                  onMouseEnter={e => { if (!isOpen) (e.currentTarget as HTMLElement).style.background = '#fafbfd'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ''; }}>
                  <td style={{ padding: '5px 8px', color: '#94a3b8', fontSize: 10 }}>{idx + 1}</td>
                  <td style={{ padding: '5px 8px' }}><span style={{ padding: '1px 6px', borderRadius: 8, fontSize: 10, background: stg.bg, color: stg.color, fontWeight: 600 }}>{stg.label}</span></td>
                  <td style={{ padding: '5px 8px', fontSize: 11, color: '#475569', fontWeight: 500 }}>{item.sub1}</td>
                  <td style={{ padding: '5px 8px', fontSize: 10, color: '#94a3b8' }}>{item.sub2 || '—'}</td>
                  <td style={{ padding: '5px 8px', color: '#1e293b', fontWeight: 500, maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.title}
                    {isOpen && item.note && <div style={{ fontSize: 10, color: '#64748b', fontWeight: 400, marginTop: 2, whiteSpace: 'normal' }}>{item.note}</div>}
                  </td>
                  <td style={{ padding: '5px 8px' }}><span style={{ padding: '2px 7px', borderRadius: 8, fontSize: 10, background: st.bg, color: st.color, fontWeight: 600 }}>{item.status}</span></td>
                  <td style={{ padding: '5px 8px', fontSize: 11, color: '#64748b' }}>{item.assignee ? <span style={{ display: 'flex', alignItems: 'center', gap: 2 }}><User size={10} />{item.assignee}</span> : '—'}</td>
                  <td style={{ padding: '5px 8px', fontSize: 10, color: '#94a3b8' }}>{item.date || '—'}</td>
                  <td style={{ padding: '5px 8px' }} onClick={e => e.stopPropagation()}>
                    {item.link ? <a href={item.link} style={{ color: '#3B82F6' }}><ExternalLink size={12} /></a> : <span style={{ color: '#e2e8f0' }}>—</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 하단 요약 */}
      <div style={{ marginTop: 12, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {STAGES.map(s => {
          const cnt = filtered.filter(i => i.stage === s.key).length;
          return <span key={s.key} style={{ fontSize: 11, color: s.color, fontWeight: 600 }}>{s.label}: {cnt}</span>;
        })}
        <span style={{ fontSize: 11, color: '#94a3b8' }}>|</span>
        {STATUSES.map(s => {
          const cnt = filtered.filter(i => i.status === s.key).length;
          if (!cnt) return null;
          return <span key={s.key} style={{ fontSize: 11, color: s.color, fontWeight: 600 }}>{s.key}: {cnt}</span>;
        })}
      </div>
    </div>
  );
}
