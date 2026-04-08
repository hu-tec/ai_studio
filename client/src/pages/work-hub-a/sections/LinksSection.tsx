import { useState } from 'react';
import { ExternalLink, ChevronDown, ChevronRight } from 'lucide-react';
import { LIVE_LINKS, SHORTCUT_SECTIONS } from '../data/links-data';

export default function LinksSection() {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['live']));
  const toggle = (k: string) => setExpanded(prev => { const n = new Set(prev); if (n.has(k)) n.delete(k); else n.add(k); return n; });
  const allKeys = ['live', ...SHORTCUT_SECTIONS.map(s => s.person)];
  const allOpen = allKeys.every(k => expanded.has(k));

  return (
    <div style={{ padding: '8px 12px', overflow: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#1e293b' }}>바로가기</span>
        <button onClick={() => setExpanded(allOpen ? new Set() : new Set(allKeys))} style={{ fontSize: 9, color: '#94a3b8', background: 'none', border: '1px solid #e2e8f0', borderRadius: 4, padding: '1px 6px', cursor: 'pointer' }}>{allOpen ? '접기' : '펼치기'}</button>
      </div>

      {/* 라이브 서비스 */}
      <div style={{ marginBottom: 8 }}>
        <button onClick={() => toggle('live')} style={{ display: 'flex', alignItems: 'center', gap: 3, background: 'none', border: 'none', cursor: 'pointer', fontSize: 10, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
          {expanded.has('live') ? <ChevronDown size={10} /> : <ChevronRight size={10} />} 라이브 서비스 + GitHub
        </button>
        {expanded.has('live') && (
          <div style={{ display: 'flex', gap: 6 }}>
            {LIVE_LINKS.map(g => (
              <div key={g.title} style={{ flex: 1, background: '#fff', borderRadius: 6, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <div style={{ padding: '3px 6px', background: g.bg, fontSize: 9, fontWeight: 700, color: g.color }}>{g.emoji} {g.title}</div>
                {g.links.map((l, i) => (
                  <a key={i} href={l.url} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '2px 6px', fontSize: 9, color: '#475569', textDecoration: 'none' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.background = ''}>
                    <ExternalLink size={7} color="#94a3b8" />{l.name}
                  </a>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 담당자별 Figma */}
      {SHORTCUT_SECTIONS.map(section => (
        <div key={section.person} style={{ marginBottom: 8 }}>
          <button onClick={() => toggle(section.person)} style={{ display: 'flex', alignItems: 'center', gap: 3, background: 'none', border: 'none', cursor: 'pointer', fontSize: 10, fontWeight: 700, color: section.color, marginBottom: 4 }}>
            {expanded.has(section.person) ? <ChevronDown size={10} /> : <ChevronRight size={10} />} PROJECTS ({section.person}) <span style={{ fontSize: 9, color: '#94a3b8', fontWeight: 400 }}>{section.count}개</span>
          </button>
          {expanded.has(section.person) && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 5 }}>
              {section.groups.map(g => (
                <div key={`${section.person}-${g.code}`} style={{ background: '#fff', borderRadius: 6, border: `1px solid ${section.color}30`, overflow: 'hidden' }}>
                  <div style={{ padding: '2px 6px', background: section.bg, fontSize: 9, fontWeight: 700, color: section.color }}>{g.code}. {g.title} <span style={{ fontSize: 8, color: '#94a3b8' }}>{g.count}</span></div>
                  {g.links.map((l, i) => (
                    <a key={i} href={l.url} target="_blank" rel="noopener noreferrer"
                      style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '1px 6px', fontSize: 9, color: '#475569', textDecoration: 'none' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.background = ''}>
                      <ExternalLink size={7} color={section.color} />
                      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.name}</span>
                      {l.date && <span style={{ fontSize: 7, color: '#94a3b8' }}>{l.date}</span>}
                    </a>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
