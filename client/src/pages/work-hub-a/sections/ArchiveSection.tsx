import { useState } from 'react';
import { ChevronDown, ChevronRight, FolderOpen, ExternalLink, Search } from 'lucide-react';
import type { HubPost } from '../types';
import { CATEGORY_TREE, DEF_LARGE, SERVICE_URLS, getDeptBg, POST_TYPE_STYLES, buildPathLabel, fmtDate, matchesPath } from '../constants';

interface Props { posts: HubPost[]; onDetail: (p: HubPost) => void; }

export default function ArchiveSection({ posts, onDetail }: Props) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [activePath, setActivePath] = useState<string[]>([]);
  const [search, setSearch] = useState('');

  const toggle = (k: string) => setExpanded(prev => { const n = new Set(prev); if (n.has(k)) n.delete(k); else n.add(k); return n; });
  const allKeys: string[] = []; DEF_LARGE.forEach(lg => { allKeys.push(lg); Object.keys(CATEGORY_TREE[lg]).forEach(mid => allKeys.push(`${lg}/${mid}`)); });
  const allOpen = allKeys.every(k => expanded.has(k));

  const filtered = posts.filter(p => {
    if (!matchesPath(p.data, activePath)) return false;
    if (search) { const s = search.toLowerCase(); if (!p.data.title.toLowerCase().includes(s) && !p.data.content.toLowerCase().includes(s)) return false; }
    return true;
  });

  return (
    <div style={{ display: 'flex', height: '100%' }}>
      {/* 트리 */}
      <div style={{ width: 200, flexShrink: 0, borderRight: '1px solid #e2e8f0', overflow: 'auto', padding: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', flex: 1 }}>자료실</span>
          <button onClick={() => setExpanded(allOpen ? new Set() : new Set(allKeys))} style={{ fontSize: 8, color: '#94a3b8', background: 'none', border: '1px solid #e2e8f0', borderRadius: 3, padding: '1px 5px', cursor: 'pointer' }}>{allOpen ? '접기' : '펼치기'}</button>
        </div>
        <button onClick={() => setActivePath([])} style={{ display: 'block', width: '100%', padding: '2px 4px', borderRadius: 4, border: 'none', background: !activePath.length ? '#EFF6FF' : 'transparent', color: !activePath.length ? '#3B82F6' : '#64748b', fontSize: 10, fontWeight: !activePath.length ? 600 : 400, cursor: 'pointer', textAlign: 'left', marginBottom: 2 }}>전체 ({posts.length})</button>
        {DEF_LARGE.map(lg => {
          const lgOpen = expanded.has(lg);
          const lgActive = activePath[0] === lg && activePath.length === 1;
          const mids = CATEGORY_TREE[lg];
          const midKeys = Object.keys(mids);
          const cnt = posts.filter(p => matchesPath(p.data, [lg])).length;
          return (
            <div key={lg}>
              <button onClick={() => { setActivePath([lg]); if (!lgOpen) toggle(lg); }}
                style={{ display: 'flex', alignItems: 'center', gap: 3, width: '100%', padding: '2px 3px', borderRadius: 4, border: 'none', background: lgActive ? '#EFF6FF' : 'transparent', color: lgActive ? '#3B82F6' : '#475569', fontSize: 10, cursor: 'pointer', fontWeight: lgActive ? 600 : 400, textAlign: 'left' }}>
                {midKeys.length > 0 ? <span onClick={e => { e.stopPropagation(); toggle(lg); }}>{lgOpen ? <ChevronDown size={10} /> : <ChevronRight size={10} />}</span> : <span style={{ width: 10 }} />}
                <FolderOpen size={10} /><span style={{ flex: 1 }}>{lg}</span>
                {cnt > 0 && <span style={{ fontSize: 8, color: '#94a3b8' }}>{cnt}</span>}
              </button>
              {lgOpen && midKeys.map(mid => {
                const midActive = activePath[0] === lg && activePath[1] === mid;
                return (
                  <button key={mid} onClick={() => setActivePath([lg, mid])}
                    style={{ display: 'flex', alignItems: 'center', gap: 3, width: '100%', padding: '1px 3px 1px 18px', borderRadius: 3, border: 'none', background: midActive ? '#F0FDF4' : 'transparent', color: midActive ? '#22C55E' : '#64748b', fontSize: 9, cursor: 'pointer', fontWeight: midActive ? 600 : 400, textAlign: 'left' }}>
                    <span style={{ flex: 1 }}>{mid}</span>
                    {SERVICE_URLS[mid] && <a href={SERVICE_URLS[mid]} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={{ color: '#3B82F6' }}><ExternalLink size={8} /></a>}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* 파일 목록 */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '4px 8px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 6 }}>
          {activePath.length > 0 && <span style={{ fontSize: 10, color: '#3B82F6', fontWeight: 600 }}>{activePath.join(' > ')}</span>}
          <div style={{ position: 'relative', flex: 1, maxWidth: 200 }}>
            <Search size={10} style={{ position: 'absolute', left: 6, top: 6, color: '#94a3b8' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="검색..." style={{ width: '100%', padding: '3px 6px 3px 22px', border: '1px solid #e2e8f0', borderRadius: 5, fontSize: 10, outline: 'none' }} />
          </div>
          <span style={{ fontSize: 9, color: '#94a3b8' }}>{filtered.length}건</span>
        </div>
        <div style={{ flex: 1, overflow: 'auto' }}>
          {filtered.length === 0 ? <div style={{ padding: 20, textAlign: 'center', fontSize: 10, color: '#94a3b8' }}>자료 없음</div> : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>
              <thead><tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '3px 6px', fontSize: 9, fontWeight: 600, color: '#64748b', textAlign: 'left' }}>#</th>
                <th style={{ padding: '3px 6px', fontSize: 9, fontWeight: 600, color: '#64748b', textAlign: 'left' }}>유형</th>
                <th style={{ padding: '3px 6px', fontSize: 9, fontWeight: 600, color: '#64748b', textAlign: 'left' }}>경로</th>
                <th style={{ padding: '3px 6px', fontSize: 9, fontWeight: 600, color: '#64748b', textAlign: 'left' }}>제목</th>
                <th style={{ padding: '3px 6px', fontSize: 9, fontWeight: 600, color: '#64748b', textAlign: 'left' }}>첨부</th>
                <th style={{ padding: '3px 6px', fontSize: 9, fontWeight: 600, color: '#64748b', textAlign: 'left' }}>작성자</th>
                <th style={{ padding: '3px 6px', fontSize: 9, fontWeight: 600, color: '#64748b', textAlign: 'left' }}>날짜</th>
              </tr></thead>
              <tbody>
                {filtered.map((p, i) => {
                  const pt = POST_TYPE_STYLES[p.data.type];
                  return (
                    <tr key={p.post_id} onClick={() => onDetail(p)} style={{ cursor: 'pointer', background: getDeptBg(p.data.path), borderBottom: '1px solid #f1f5f9' }}
                      onMouseEnter={e => e.currentTarget.style.filter = 'brightness(0.97)'} onMouseLeave={e => e.currentTarget.style.filter = ''}>
                      <td style={{ padding: '2px 6px', fontSize: 8, color: '#94a3b8' }}>{i + 1}</td>
                      <td style={{ padding: '2px 6px' }}><span style={{ padding: '0 4px', borderRadius: 4, fontSize: 7, fontWeight: 700, background: pt.bg, color: pt.color }}>{p.data.type}</span></td>
                      <td style={{ padding: '2px 6px', fontSize: 9, color: '#64748b' }}>{buildPathLabel(p.data)}</td>
                      <td style={{ padding: '2px 6px', fontWeight: 500, color: '#1e293b', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.data.title}</td>
                      <td style={{ padding: '2px 6px', fontSize: 8, color: '#94a3b8' }}>{(p.data.attachments || []).length || '—'}</td>
                      <td style={{ padding: '2px 6px', fontSize: 9, color: '#64748b' }}>{p.data.author}</td>
                      <td style={{ padding: '2px 6px', fontSize: 8, color: '#94a3b8' }}>{fmtDate(p.data.created_at)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
