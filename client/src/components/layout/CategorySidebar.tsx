import { useState, useCallback } from 'react';
import { NavLink, useLocation } from 'react-router';
import {
  ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
  BarChart3, LayoutDashboard, FileInput, Home,
} from 'lucide-react';
import { useAllMemoCounts, toPageKey } from '../memo/useMemos';
import {
  type NavItem, type NavGroup,
  DEFAULT_GROUPS,
} from './navData';

/* ── 네비 아이템 ── */
function NavItemRow({
  item, isActive, memoCount, collapsed,
}: {
  item: NavItem; isActive: boolean; memoCount: number; collapsed: boolean;
}) {
  return (
    <NavLink
      to={item.to}
      style={{
        display: 'flex', alignItems: 'center', gap: 4,
        padding: collapsed ? '6px 14px' : '3px 6px',
        borderRadius: 4, fontSize: 11,
        fontWeight: isActive ? 600 : 400,
        color: isActive ? '#3b82f6' : '#475569',
        background: isActive ? '#eff6ff' : 'transparent',
        textDecoration: 'none',
        transition: 'all 0.15s', whiteSpace: 'nowrap',
      }}
      title={`${item.code} ${item.label}`}
    >
      <item.icon size={13} style={{ flexShrink: 0 }} />
      {!collapsed && (
        <>
          <span style={{
            fontSize: 9, fontWeight: 700, color: isActive ? '#2563eb' : '#94a3b8',
            minWidth: 28, flexShrink: 0,
          }}>
            {item.code}
          </span>
          <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {item.label}
          </span>
          {item.consolidated && (
            <span style={{
              fontSize: 8, background: '#dcfce7', color: '#16a34a',
              padding: '0px 4px', borderRadius: 3, fontWeight: 600, flexShrink: 0,
            }}>
              통합
            </span>
          )}
          {memoCount > 0 && (
            <span style={{
              background: '#3b82f6', color: '#fff', fontSize: 9, fontWeight: 600,
              borderRadius: 9999, padding: '0px 5px', minWidth: 16,
              textAlign: 'center', lineHeight: '14px',
            }}>
              {memoCount}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
}

/* ── 그룹 섹션 ── */
function GroupSection({
  group, collapsed, location, memoCounts,
  collapsedGroups, toggleGroupCollapse,
}: {
  group: NavGroup;
  collapsed: boolean;
  location: { pathname: string };
  memoCounts: Record<string, number>;
  collapsedGroups: Set<string>;
  toggleGroupCollapse: (groupId: string) => void;
}) {
  const isGroupCollapsed = collapsedGroups.has(group.id);

  return (
    <div style={{ marginBottom: 4 }}>
      {/* 그룹 헤더 */}
      {!collapsed && (
        <div
          onClick={() => toggleGroupCollapse(group.id)}
          style={{
            display: 'flex', alignItems: 'center', gap: 3,
            padding: '2px 6px', cursor: 'pointer',
          }}
        >
          <span
            style={{
              flex: 1, fontSize: 9, fontWeight: 600, color: '#64748b',
              textTransform: 'uppercase', letterSpacing: '0.04em',
              userSelect: 'none',
            }}
          >
            {group.title}
            <span style={{ fontSize: 8, color: '#94a3b8', marginLeft: 3 }}>({group.items.length})</span>
          </span>
          {isGroupCollapsed ? <ChevronDown size={10} color="#94a3b8" /> : <ChevronUp size={10} color="#94a3b8" />}
        </div>
      )}

      {/* 아이템 목록 */}
      {!isGroupCollapsed && group.items.map(item => {
        const isActive = location.pathname === item.to || location.pathname.startsWith(item.to + '/');
        const memoCount = memoCounts[toPageKey(item.to)] || 0;
        return (
          <NavItemRow
            key={item.code}
            item={item}
            isActive={isActive}
            memoCount={memoCount}
            collapsed={collapsed}
          />
        );
      })}
    </div>
  );
}

/* ── 메인 사이드바 ── */
export function CategorySidebar() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const location = useLocation();
  const memoCounts = useAllMemoCounts();

  const groups = DEFAULT_GROUPS;

  const toggleGroupCollapse = useCallback((groupId: string) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  }, []);

  return (
    <aside
      style={{
        width: sidebarCollapsed ? 48 : 210,
        minWidth: sidebarCollapsed ? 48 : 210,
        background: '#fff',
        borderRight: '1px solid #e2e8f0',
        display: 'flex', flexDirection: 'column',
        transition: 'width 0.2s, min-width 0.2s',
        overflow: 'hidden',
      }}
    >
      {/* 로고 */}
      <div style={{ padding: '7px 10px', display: 'flex', alignItems: 'center', gap: 6, borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(135deg, #5ee7ff, #4c2fff)', flexShrink: 0 }} />
        {!sidebarCollapsed && <span style={{ fontWeight: 700, fontSize: 13 }}>AI Studio</span>}
      </div>

      {/* 네비게이션 */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '4px 3px' }}>
        {groups.map(group => (
          <GroupSection
            key={group.id}
            group={group}
            collapsed={sidebarCollapsed}
            location={location}
            memoCounts={memoCounts}
            collapsedGroups={collapsedGroups}
            toggleGroupCollapse={toggleGroupCollapse}
          />
        ))}
      </nav>

      {/* 하단 링크 + 접기 */}
      <div style={{ borderTop: '1px solid #e2e8f0', padding: '4px' }}>
        {[
          { href: '/admin.html', icon: BarChart3, label: '데이터 관리' },
          { href: '/dashboard.html', icon: LayoutDashboard, label: '프로세스' },
          { href: '/면접_main.html', icon: FileInput, label: '면접 폼(입력)' },
          { href: '/home.html', icon: Home, label: '홈으로' },
        ].map(link => (
          <a
            key={link.href}
            href={link.href}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '3px 8px', borderRadius: 4,
              fontSize: 11, color: '#64748b', textDecoration: 'none',
            }}
          >
            <link.icon size={12} />
            {!sidebarCollapsed && link.label}
          </a>
        ))}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          style={{
            width: '100%', display: 'flex', alignItems: 'center',
            justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
            gap: 6, padding: '3px 8px', border: 'none', background: 'none',
            borderRadius: 4, cursor: 'pointer', fontSize: 11, color: '#94a3b8',
          }}
        >
          {sidebarCollapsed ? <ChevronRight size={12} /> : <><ChevronLeft size={12} /> 접기</>}
        </button>
      </div>
    </aside>
  );
}
