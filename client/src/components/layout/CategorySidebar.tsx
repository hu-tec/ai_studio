import { useState, useCallback, useRef } from 'react';
import { NavLink, useLocation } from 'react-router';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import {
  ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
  GripVertical,
  BarChart3, LayoutDashboard, FileInput, Home,
} from 'lucide-react';
import { useAllMemoCounts, toPageKey } from '../memo/useMemos';
import {
  type NavItem, type NavGroup,
  DEFAULT_GROUPS, loadLayout, saveLayout, restoreGroups, toLayout,
} from './navData';

/* ── DnD 타입 ── */
const DND_ITEM = 'NAV_ITEM';
const DND_GROUP = 'NAV_GROUP';

interface DragItem { code: string; fromGroupId: string }
interface DragGroup { groupId: string; index: number }

/* ── 드래그 가능 네비 아이템 ── */
function DraggableNavItem({
  item, groupId, isActive, memoCount, collapsed,
}: {
  item: NavItem; groupId: string; isActive: boolean; memoCount: number; collapsed: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag({
    type: DND_ITEM,
    item: (): DragItem => ({ code: item.code, fromGroupId: groupId }),
    collect: m => ({ isDragging: m.isDragging() }),
  });

  drag(ref);

  return (
    <div ref={ref} style={{ opacity: isDragging ? 0.4 : 1 }}>
      <NavLink
        to={item.to}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: collapsed ? '8px 14px' : '5px 8px',
          borderRadius: 6, fontSize: 12.5,
          fontWeight: isActive ? 600 : 400,
          color: isActive ? '#3b82f6' : '#475569',
          background: isActive ? '#eff6ff' : 'transparent',
          marginBottom: 1, textDecoration: 'none',
          transition: 'all 0.15s', whiteSpace: 'nowrap',
          cursor: 'grab',
        }}
        title={`${item.code} ${item.label}`}
      >
        {!collapsed && (
          <GripVertical size={12} style={{ flexShrink: 0, color: '#cbd5e1', cursor: 'grab' }} />
        )}
        <item.icon size={15} style={{ flexShrink: 0 }} />
        {!collapsed && (
          <>
            <span style={{
              fontSize: 10, fontWeight: 700, color: isActive ? '#2563eb' : '#94a3b8',
              minWidth: 32, flexShrink: 0,
            }}>
              {item.code}
            </span>
            <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {item.label}
            </span>
            {item.consolidated && (
              <span style={{
                fontSize: 9, background: '#dcfce7', color: '#16a34a',
                padding: '1px 5px', borderRadius: 4, fontWeight: 600, flexShrink: 0,
              }}>
                통합
              </span>
            )}
            {memoCount > 0 && (
              <span style={{
                background: '#3b82f6', color: '#fff', fontSize: 10, fontWeight: 600,
                borderRadius: 9999, padding: '1px 6px', minWidth: 18,
                textAlign: 'center', lineHeight: '16px',
              }}>
                {memoCount}
              </span>
            )}
          </>
        )}
      </NavLink>
    </div>
  );
}

/* ── 드래그 가능 그룹 섹션 ── */
function GroupSection({
  group, index, collapsed, location, memoCounts,
  onDropItem, onMoveGroup,
  collapsedGroups, toggleGroupCollapse,
}: {
  group: NavGroup;
  index: number;
  collapsed: boolean;
  location: { pathname: string };
  memoCounts: Record<string, number>;
  onDropItem: (code: string, fromGroupId: string, toGroupId: string) => void;
  onMoveGroup: (fromIdx: number, toIdx: number) => void;
  collapsedGroups: Set<string>;
  toggleGroupCollapse: (groupId: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isGroupCollapsed = collapsedGroups.has(group.id);

  // 그룹 드래그
  const [{ isDragging }, drag] = useDrag({
    type: DND_GROUP,
    item: (): DragGroup => ({ groupId: group.id, index }),
    collect: m => ({ isDragging: m.isDragging() }),
  });

  // 그룹 드롭 (아이템 받기 + 그룹 위치교환)
  const [{ isOver }, drop] = useDrop({
    accept: [DND_ITEM, DND_GROUP],
    drop: (dragObj: DragItem | DragGroup, monitor) => {
      if (monitor.getItemType() === DND_ITEM) {
        const d = dragObj as DragItem;
        if (d.fromGroupId !== group.id) {
          onDropItem(d.code, d.fromGroupId, group.id);
        }
      }
      if (monitor.getItemType() === DND_GROUP) {
        const d = dragObj as DragGroup;
        if (d.index !== index) onMoveGroup(d.index, index);
      }
    },
    collect: m => ({ isOver: m.isOver({ shallow: true }) }),
  });

  drag(drop(ref));

  return (
    <div
      ref={ref}
      style={{
        marginBottom: 8,
        opacity: isDragging ? 0.4 : 1,
        background: isOver ? '#f0f9ff' : 'transparent',
        borderRadius: 8,
        border: isOver ? '1px dashed #93c5fd' : '1px solid transparent',
        transition: 'all 0.15s',
      }}
    >
      {/* 그룹 헤더 */}
      {!collapsed && (
        <div
          onClick={() => toggleGroupCollapse(group.id)}
          style={{
            display: 'flex', alignItems: 'center', gap: 4,
            padding: '4px 8px', cursor: 'pointer',
          }}
        >
          <GripVertical size={11} style={{ color: '#cbd5e1', flexShrink: 0 }} />
          <span
            style={{
              flex: 1, fontSize: 10, fontWeight: 600, color: '#64748b',
              textTransform: 'uppercase', letterSpacing: '0.05em',
              userSelect: 'none',
            }}
          >
            {group.title}
            <span style={{ fontSize: 9, color: '#94a3b8', marginLeft: 4 }}>({group.items.length})</span>
          </span>
          {isGroupCollapsed ? <ChevronDown size={12} color="#94a3b8" /> : <ChevronUp size={12} color="#94a3b8" />}
        </div>
      )}

      {/* 아이템 목록 */}
      {!isGroupCollapsed && group.items.map(item => {
        const isActive = location.pathname === item.to || location.pathname.startsWith(item.to + '/');
        const memoCount = memoCounts[toPageKey(item.to)] || 0;
        return (
          <DraggableNavItem
            key={item.code}
            item={item}
            groupId={group.id}
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

  // 그룹 상태 초기화
  const [groups, setGroups] = useState<NavGroup[]>(() => {
    const saved = loadLayout();
    return saved ? restoreGroups(saved) : DEFAULT_GROUPS;
  });

  // 그룹 변경 시 저장
  const persist = useCallback((next: NavGroup[]) => {
    setGroups(next);
    saveLayout(toLayout(next));
  }, []);

  // 아이템 드롭 → 그룹 이동
  const handleDropItem = useCallback((code: string, fromGroupId: string, toGroupId: string) => {
    setGroups(prev => {
      const next = prev.map(g => ({ ...g, items: [...g.items] }));
      const fromG = next.find(g => g.id === fromGroupId);
      const toG = next.find(g => g.id === toGroupId);
      if (!fromG || !toG) return prev;
      const idx = fromG.items.findIndex(i => i.code === code);
      if (idx < 0) return prev;
      const [item] = fromG.items.splice(idx, 1);
      toG.items.push(item);
      saveLayout(toLayout(next));
      return next;
    });
  }, []);

  // 그룹 순서 교환
  const handleMoveGroup = useCallback((fromIdx: number, toIdx: number) => {
    setGroups(prev => {
      const next = [...prev];
      const [moved] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, moved);
      saveLayout(toLayout(next));
      return next;
    });
  }, []);

  // 그룹 접기/펼치기
  const toggleGroupCollapse = useCallback((groupId: string) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  }, []);

  // 레이아웃 초기화
  const handleReset = useCallback(() => {
    persist(DEFAULT_GROUPS);
    setCollapsedGroups(new Set());
  }, [persist]);

  return (
    <DndProvider backend={HTML5Backend}>
      <aside
        style={{
          width: sidebarCollapsed ? 52 : 230,
          minWidth: sidebarCollapsed ? 52 : 230,
          background: '#fff',
          borderRight: '1px solid #e2e8f0',
          display: 'flex', flexDirection: 'column',
          transition: 'width 0.2s, min-width 0.2s',
          overflow: 'hidden',
        }}
      >
        {/* 로고 */}
        <div style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #5ee7ff, #4c2fff)', flexShrink: 0 }} />
          {!sidebarCollapsed && <span style={{ fontWeight: 700, fontSize: 14 }}>AI Studio</span>}
        </div>

        {/* 네비게이션 */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '6px 4px' }}>
          {groups.map((group, idx) => (
            <GroupSection
              key={group.id}
              group={group}
              index={idx}
              collapsed={sidebarCollapsed}
              location={location}
              memoCounts={memoCounts}
              onDropItem={handleDropItem}
              onMoveGroup={handleMoveGroup}
              collapsedGroups={collapsedGroups}
              toggleGroupCollapse={toggleGroupCollapse}
            />
          ))}

          {/* 초기화 */}
          {!sidebarCollapsed && (
            <div style={{ padding: '4px 8px' }}>
              <button
                onClick={handleReset}
                title="기본 배치로 초기화"
                style={{
                  width: '100%', padding: '5px 0', border: '1px dashed #cbd5e1', borderRadius: 6,
                  background: 'none', cursor: 'pointer', fontSize: 10, color: '#94a3b8',
                }}
              >
                초기화
              </button>
            </div>
          )}
        </nav>

        {/* 하단 링크 + 접기 */}
        <div style={{ borderTop: '1px solid #e2e8f0', padding: '6px' }}>
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
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '6px 10px', borderRadius: 6,
                fontSize: 12, color: '#64748b', textDecoration: 'none',
              }}
            >
              <link.icon size={14} />
              {!sidebarCollapsed && link.label}
            </a>
          ))}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center',
              justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
              gap: 8, padding: '6px 10px', border: 'none', background: 'none',
              borderRadius: 6, cursor: 'pointer', fontSize: 12, color: '#94a3b8',
            }}
          >
            {sidebarCollapsed ? <ChevronRight size={14} /> : <><ChevronLeft size={14} /> 접기</>}
          </button>
        </div>
      </aside>
    </DndProvider>
  );
}
