import { useState, useRef } from 'react';
import { NavLink, useLocation } from 'react-router';
import { DEFAULT_GROUPS, ROLE_COLORS, ROLE_LABEL, ROLE_ORDER, canAccessGroup, type NavRole } from './navData';
import { useAllMemoCounts, toPageKey } from '../memo/useMemos';
import { useAuth } from '@/contexts/AuthContext';

/* 현재 경로가 속한 그룹 */
function detectGroup(pathname: string): string | null {
  for (const g of DEFAULT_GROUPS) {
    if (g.items.some(i => pathname === i.to || pathname.startsWith(i.to + '/'))) return g.id;
  }
  return null;
}

export function TopNavBar() {
  const [hovered, setHovered] = useState<string | null>(null);
  const loc = useLocation();
  const memo = useAllMemoCounts();
  const timer = useRef(0);
  const { user } = useAuth();

  const activeId = detectGroup(loc.pathname);
  const visible = DEFAULT_GROUPS.filter(g => {
    if (g.id === 'grp-trash') return user?.tier === 'admin';
    return canAccessGroup(g.role, user?.tier);
  });
  const hovGroup = hovered ? DEFAULT_GROUPS.find(g => g.id === hovered) : null;

  const enter = (id: string) => { clearTimeout(timer.current); setHovered(id); };
  const leave = () => { timer.current = window.setTimeout(() => setHovered(null), 200); };

  const roleOrder: NavRole[] = ROLE_ORDER;

  return (
    <div style={{ position: 'relative', zIndex: 50, flexShrink: 0 }}>
      <style>{`.tn-t:hover{opacity:1!important} .mm-i:hover{background:#f1f5f9!important}`}</style>

      {/* ── 카테고리 바 ── */}
      <div style={{
        height: 30, background: '#334155',
        display: 'flex', alignItems: 'center', padding: '0 8px', gap: 0,
        borderBottom: '1px solid #475569',
      }}>
        {roleOrder.map((role, ri) => {
          const groups = visible.filter(g => g.role === role);
          if (groups.length === 0) return null;
          const rc = ROLE_COLORS[role];
          return (
            <div key={role} style={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {/* 역할 구분자 */}
              {ri > 0 && (
                <div style={{ width: 1, height: 14, background: 'rgba(255,255,255,.1)', margin: '0 5px' }} />
              )}
              <span style={{
                fontSize: 8, fontWeight: 700, color: rc.badge,
                padding: '1px 4px', borderRadius: 3,
                background: rc.badge + '20',
                marginRight: 2, flexShrink: 0, letterSpacing: '0.02em',
              }}>
                {ROLE_LABEL[role]}
              </span>

              {groups.map(g => {
                const active = g.id === activeId;
                return (
                  <div
                    key={g.id}
                    className="tn-t"
                    onMouseEnter={() => enter(g.id)}
                    onMouseLeave={leave}
                    style={{
                      padding: '2px 7px', borderRadius: 3,
                      fontSize: 10, fontWeight: active ? 700 : 500, whiteSpace: 'nowrap',
                      color: active ? '#fff' : 'rgba(255,255,255,.5)',
                      background: active ? rc.badge + '35' : 'transparent',
                      borderBottom: active ? `2px solid ${rc.badge}` : '2px solid transparent',
                      cursor: 'pointer', transition: 'all .12s', userSelect: 'none',
                      opacity: active ? 1 : 0.8,
                    }}
                  >
                    {g.title}
                    <span style={{ fontSize: 8, marginLeft: 2, opacity: .3 }}>{g.items.length}</span>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* ── 메가메뉴 ── */}
      {hovGroup && (() => {
        const rc = ROLE_COLORS[hovGroup.role];
        return (
          <div
            onMouseEnter={() => enter(hovGroup.id)}
            onMouseLeave={leave}
            style={{
              position: 'absolute', top: 30, left: 0, right: 0,
              background: '#fff', borderBottom: `2px solid ${rc.border}`,
              boxShadow: '0 6px 20px rgba(0,0,0,.10)',
              padding: '6px 10px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
              gap: 1, zIndex: 51,
            }}
          >
            {/* 헤더 */}
            <div style={{
              gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: 6,
              padding: '1px 4px 4px', borderBottom: '1px solid #f1f5f9', marginBottom: 2,
            }}>
              <span style={{
                fontSize: 8, fontWeight: 700, color: '#fff',
                background: rc.badge, padding: '1px 5px', borderRadius: 3,
              }}>
                {ROLE_LABEL[hovGroup.role]}
              </span>
              <span style={{ fontSize: 10, fontWeight: 700, color: '#1e293b' }}>
                {hovGroup.title}
              </span>
              <span style={{ fontSize: 9, color: '#94a3b8' }}>
                {hovGroup.items.length}개
              </span>
            </div>

            {hovGroup.items.map(item => {
              const isActive = loc.pathname === item.to || loc.pathname.startsWith(item.to + '/');
              const cnt = memo[toPageKey(item.to)] || 0;
              const isGw = item.label.startsWith('(gw)');
              return (
                <NavLink
                  key={item.code}
                  to={item.to}
                  className="mm-i"
                  onClick={() => setHovered(null)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    padding: '3px 5px', borderRadius: 3, textDecoration: 'none',
                    fontSize: 11, fontWeight: isActive ? 600 : 400,
                    color: isActive ? rc.text : '#475569',
                    background: isActive ? rc.bg : 'transparent',
                    transition: 'background .08s',
                  }}
                >
                  <item.icon size={11} style={{ flexShrink: 0, opacity: .6 }} />
                  <span style={{ fontSize: 8, fontWeight: 700, color: '#94a3b8', minWidth: 24 }}>{item.code}</span>
                  <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.label}
                  </span>
                  {isGw && (
                    <span style={{ fontSize: 7, padding: '0 3px', borderRadius: 3, background: '#fef3c7', color: '#92400e', fontWeight: 700, lineHeight: '12px' }}>gw</span>
                  )}
                  {cnt > 0 && (
                    <span style={{
                      background: rc.badge, color: '#fff', fontSize: 8, fontWeight: 600,
                      borderRadius: 99, padding: '0 4px', minWidth: 14, textAlign: 'center', lineHeight: '13px',
                    }}>{cnt}</span>
                  )}
                </NavLink>
              );
            })}
          </div>
        );
      })()}
    </div>
  );
}
