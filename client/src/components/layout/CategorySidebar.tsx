import { useState, useCallback } from 'react';
import { NavLink, useLocation } from 'react-router';
import {
  ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
  BarChart3, LayoutDashboard, FileInput, Home,
} from 'lucide-react';
import { useAllMemoCounts, toPageKey } from '../memo/useMemos';
import {
  type NavItem, type NavGroup,
  DEFAULT_GROUPS, ROLE_COLORS, ROLE_LABEL, canAccessGroup,
} from './navData';
import { useAuth } from '@/contexts/AuthContext';
import { MARKER_COLORS, MARKER_LABELS, useSidebarMarkers, type PageMarker } from './sidebarMarkers';

/* ── 네비 아이템 ── */
function NavItemRow({
  item, isActive, memoCount, collapsed, marker, onCycleMarker,
}: {
  item: NavItem; isActive: boolean; memoCount: number; collapsed: boolean;
  marker: PageMarker | undefined;
  onCycleMarker: (code: string) => void;
}) {
  const mc = marker ? MARKER_COLORS[marker] : null;
  const handleMarkerClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onCycleMarker(item.code);
  };
  const nextLabel = !marker ? '#' : marker === '#' ? '!' : marker === '!' ? '$' : '해제';
  return (
    <NavLink
      to={item.to}
      style={{
        display: 'flex', alignItems: 'center', gap: 4,
        padding: collapsed ? '5px 13px' : '2px 5px',
        borderRadius: 4, fontSize: 11,
        fontWeight: isActive ? 600 : 400,
        color: isActive ? '#3b82f6' : '#475569',
        background: isActive ? '#eff6ff' : 'transparent',
        textDecoration: 'none',
        transition: 'all 0.15s', whiteSpace: 'nowrap',
        border: mc ? `1.5px solid ${mc.border}` : '1.5px solid transparent',
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
          {memoCount > 0 && (
            <span style={{
              background: '#3b82f6', color: '#fff', fontSize: 9, fontWeight: 600,
              borderRadius: 9999, padding: '0px 5px', minWidth: 16,
              textAlign: 'center', lineHeight: '14px',
            }}>
              {memoCount}
            </span>
          )}
          <button
            type="button"
            onClick={handleMarkerClick}
            title={`마커: ${marker ?? '없음'} → ${nextLabel}`}
            aria-label={`페이지 마커 전환 (${marker ?? '없음'})`}
            style={{
              flexShrink: 0, width: 14, height: 14, padding: 0, lineHeight: '12px',
              fontSize: 10, fontWeight: 700, fontFamily: 'ui-monospace, monospace',
              border: mc ? `1px solid ${mc.border}` : '1px dashed #cbd5e1',
              background: mc ? mc.bg : 'transparent',
              color: mc ? mc.text : '#cbd5e1',
              borderRadius: 3, cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            {marker ?? '·'}
          </button>
        </>
      )}
    </NavLink>
  );
}

/* ── 그룹 섹션 ── */
function GroupSection({
  group, collapsed, location, memoCounts,
  collapsedGroups, toggleGroupCollapse,
  markers, onCycleMarker,
}: {
  group: NavGroup;
  collapsed: boolean;
  location: { pathname: string };
  memoCounts: Record<string, number>;
  collapsedGroups: Set<string>;
  toggleGroupCollapse: (groupId: string) => void;
  markers: Record<string, PageMarker>;
  onCycleMarker: (code: string) => void;
}) {
  const isGroupCollapsed = collapsedGroups.has(group.id);

  return (
    <div style={{ marginBottom: 4 }}>
      {/* 그룹 헤더 */}
      {!collapsed && (() => {
        const rc = ROLE_COLORS[group.role];
        const roleLabel = ROLE_LABEL[group.role];
        return (
          <div
            onClick={() => toggleGroupCollapse(group.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 3,
              padding: '2px 6px', cursor: 'pointer',
              background: isGroupCollapsed ? 'transparent' : rc.bg + '60',
              borderLeft: `2px solid ${rc.badge}`,
              marginBottom: 1,
            }}
          >
            <span style={{
              fontSize: 7, fontWeight: 700, color: rc.text,
              background: rc.badge + '20', padding: '0 3px', borderRadius: 2,
              flexShrink: 0,
            }}>
              {roleLabel}
            </span>
            <span
              style={{
                flex: 1, fontSize: 9, fontWeight: 600, color: '#475569',
                letterSpacing: '0.02em',
                userSelect: 'none',
              }}
            >
              {group.title}
              <span style={{ fontSize: 8, color: '#94a3b8', marginLeft: 3 }}>({group.items.length})</span>
            </span>
            {isGroupCollapsed ? <ChevronDown size={10} color="#94a3b8" /> : <ChevronUp size={10} color="#94a3b8" />}
          </div>
        );
      })()}

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
            marker={markers[item.code]}
            onCycleMarker={onCycleMarker}
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
  const { user } = useAuth();
  const { markers, cycleMarker } = useSidebarMarkers();

  const groups = DEFAULT_GROUPS.filter(g => {
    if (g.id === 'grp-trash') return user?.tier === 'admin';
    return canAccessGroup(g.role, user?.tier);
  });

  const toggleGroupCollapse = useCallback((groupId: string) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  }, []);

  const noneCollapsed = groups.every(g => !collapsedGroups.has(g.id));

  const toggleAllGroups = useCallback(() => {
    if (noneCollapsed) {
      setCollapsedGroups(new Set(groups.map(g => g.id)));
    } else {
      setCollapsedGroups(new Set());
    }
  }, [noneCollapsed, groups]);

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
        {!sidebarCollapsed && <span style={{ fontWeight: 700, fontSize: 13 }}>사내 Studio</span>}
      </div>

      {/* 마커 범례 */}
      {!sidebarCollapsed && (
        <div
          title="각 페이지 우측 버튼 클릭 시 # → ! → $ → 해제 순환"
          style={{
            display: 'flex', gap: 3,
            padding: '3px 4px',
            borderBottom: '1px solid #f1f5f9',
            background: '#fafafa',
          }}
        >
          {(['#', '!', '$'] as PageMarker[]).map(m => {
            const mc = MARKER_COLORS[m];
            return (
              <span
                key={m}
                style={{
                  flex: 1,
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 2,
                  padding: '1px 2px',
                  border: `1px solid ${mc.border}`,
                  background: mc.bg,
                  color: mc.text,
                  borderRadius: 3,
                  fontSize: 9, fontWeight: 700,
                  lineHeight: 1.2,
                }}
              >
                <span style={{ fontFamily: 'ui-monospace, monospace' }}>{m}</span>
                <span style={{ fontWeight: 600 }}>{MARKER_LABELS[m]}</span>
              </span>
            );
          })}
        </div>
      )}

      {/* 전체 펼치기/접기 토글 */}
      {!sidebarCollapsed && groups.length > 0 && (
        <div style={{ padding: '3px 4px', borderBottom: '1px solid #f1f5f9', display: 'flex', gap: 2 }}>
          <button
            type="button"
            onClick={toggleAllGroups}
            title={noneCollapsed ? '전체 그룹 접기' : '전체 그룹 펼치기'}
            style={{
              flex: 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3,
              padding: '2px 4px', border: '1px solid #e2e8f0', background: '#f8fafc',
              borderRadius: 3, fontSize: 9, color: '#64748b', cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            {noneCollapsed
              ? <><ChevronUp size={9} /> 전체 접기</>
              : <><ChevronDown size={9} /> 전체 펼치기</>}
          </button>
        </div>
      )}

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
            markers={markers}
            onCycleMarker={cycleMarker}
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
