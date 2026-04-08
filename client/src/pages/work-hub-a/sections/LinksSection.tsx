import { useState, useRef } from 'react';
import { ExternalLink, ChevronDown, ChevronRight, Plus, X, Trash2 } from 'lucide-react';
import { LIVE_LINKS, SHORTCUT_SECTIONS } from '../data/links-data';

interface CustomLink { name: string; url: string; group: string; }

export default function LinksSection() {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['live', 'custom']));
  const toggle = (k: string) => setExpanded(prev => { const n = new Set(prev); if (n.has(k)) n.delete(k); else n.add(k); return n; });
  const allKeys = ['live', 'custom', ...SHORTCUT_SECTIONS.map(s => s.person)];
  const allOpen = allKeys.every(k => expanded.has(k));

  // 커스텀 링크 (localStorage)
  const [customLinks, setCustomLinks] = useState<CustomLink[]>(() => { try { return JSON.parse(localStorage.getItem('wh-custom-links') || '[]'); } catch { return []; } });
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newGroup, setNewGroup] = useState('기타');
  const addLink = () => { if (!newName || !newUrl) return; const next = [...customLinks, { name: newName, url: newUrl.startsWith('http') ? newUrl : 'https://' + newUrl, group: newGroup }]; setCustomLinks(next); localStorage.setItem('wh-custom-links', JSON.stringify(next)); setNewName(''); setNewUrl(''); setAdding(false); };
  const removeLink = (idx: number) => { if (!confirm('삭제?')) return; const next = customLinks.filter((_, i) => i !== idx); setCustomLinks(next); localStorage.setItem('wh-custom-links', JSON.stringify(next)); };

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

      {/* 커스텀 링크 */}
      <div style={{ marginBottom: 8 }}>
        <button onClick={() => toggle('custom')} style={{ display: 'flex', alignItems: 'center', gap: 3, background: 'none', border: 'none', cursor: 'pointer', fontSize: 10, fontWeight: 700, color: '#F59E0B', marginBottom: 4 }}>
          {expanded.has('custom') ? <ChevronDown size={10} /> : <ChevronRight size={10} />} 내 링크 <span style={{ fontSize: 9, color: '#94a3b8', fontWeight: 400 }}>{customLinks.length}개</span>
        </button>
        {expanded.has('custom') && (
          <div>
            {customLinks.map((l, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '2px 6px', fontSize: 9 }}>
                <a href={l.url} target="_blank" rel="noopener noreferrer" style={{ color: '#475569', textDecoration: 'none', flex: 1, display: 'flex', alignItems: 'center', gap: 3 }}
                  onMouseEnter={e => e.currentTarget.style.color = '#3B82F6'} onMouseLeave={e => e.currentTarget.style.color = '#475569'}>
                  <ExternalLink size={7} color="#F59E0B" />{l.name} <span style={{ fontSize: 7, color: '#94a3b8' }}>{l.group}</span>
                </a>
                <button onClick={() => removeLink(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 1 }}><Trash2 size={8} color="#ef4444" /></button>
              </div>
            ))}
            {adding ? (
              <div style={{ display: 'flex', gap: 4, padding: '4px 6px' }}>
                <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="이름" style={{ width: 80, padding: '2px 4px', border: '1px solid #e2e8f0', borderRadius: 4, fontSize: 9 }} />
                <input value={newUrl} onChange={e => setNewUrl(e.target.value)} placeholder="URL" style={{ flex: 1, padding: '2px 4px', border: '1px solid #e2e8f0', borderRadius: 4, fontSize: 9 }} onKeyDown={e => { if (e.key === 'Enter') addLink(); if (e.key === 'Escape') setAdding(false); }} />
                <input value={newGroup} onChange={e => setNewGroup(e.target.value)} placeholder="그룹" style={{ width: 50, padding: '2px 4px', border: '1px solid #e2e8f0', borderRadius: 4, fontSize: 9 }} />
                <button onClick={addLink} style={{ padding: '2px 6px', background: '#F59E0B', color: '#fff', border: 'none', borderRadius: 4, fontSize: 9, cursor: 'pointer' }}>추가</button>
                <button onClick={() => setAdding(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={10} color="#94a3b8" /></button>
              </div>
            ) : (
              <button onClick={() => setAdding(true)} style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '3px 8px', margin: '4px 6px', border: '1px dashed #F59E0B', borderRadius: 4, background: 'none', color: '#F59E0B', fontSize: 9, cursor: 'pointer' }}><Plus size={9} />링크 추가</button>
            )}
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
