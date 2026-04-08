import {
  ClipboardCheck, ShieldCheck, Clock, ClipboardList,
  Calendar, FileText, Image, Phone, Home,
  BarChart3, BookOpen, FolderOpen,
  CalendarClock, Settings, Scale, FileEdit, ListChecks,
  type LucideIcon,
} from 'lucide-react';

/* ── 타입 ── */
export interface NavItem {
  to: string;
  icon: LucideIcon;
  label: string;
  code: string;          // A1, A1-1, B2 …
  consolidated?: boolean; // 통합완료 표시
}

export interface NavGroup {
  id: string;
  title: string;
  items: NavItem[];
}

/* ── 전체 페이지 목록 (코드 부여) ── */
export const ALL_NAV_ITEMS: NavItem[] = [
  // ─── A: 업무 ───
  { code: 'A0',   to: '/work-hub',           icon: Home,          label: '업무 총괄' },
  { code: 'A1',   to: '/work-materials',     icon: FolderOpen,    label: '업무 자료' },
  { code: 'A1-1', to: '/work-log',           icon: ClipboardList, label: '업무일지(직원-new)' },
  { code: 'A1-2', to: '/work-log-old',       icon: ClipboardList, label: '업무일지(직원-old)' },
  { code: 'A1-3', to: '/work-log/admin',     icon: ClipboardList, label: '업무일지(관리)' },
  { code: 'A2',   to: '/pledge',             icon: ShieldCheck,   label: '서약서' },
  { code: 'A3',   to: '/guidelines',         icon: FileText,      label: '사내업무지침' },
  { code: 'A3-1', to: '/company-guidelines', icon: Scale,         label: '사내업무지침(통합-new)', consolidated: true },
  { code: 'A4',   to: '/lesson-plan',        icon: BookOpen,      label: '레슨플랜' },
  { code: 'A5',   to: '/manual-list',        icon: BookOpen,      label: '매뉴얼 리스트' },

  // ─── B: 채용/인사 ───
  { code: 'B1',   to: '/interview',           icon: ClipboardCheck, label: '면접 입력' },
  { code: 'B1-1', to: '/interview/dashboard', icon: ClipboardCheck, label: '면접 대시보드' },
  { code: 'B2',   to: '/attendance',          icon: Clock,          label: '출퇴근 관리' },
  { code: 'B3',   to: '/instructor-eval',     icon: ClipboardCheck, label: '강사채점' },
  { code: 'B4',   to: '/instructor-flow',     icon: ClipboardList,  label: '면접플로우' },

  // ─── C: 관리/운영 ───
  { code: 'C1',   to: '/meetings',        icon: Calendar,     label: '미팅 관리' },
  { code: 'C1-1', to: '/meeting-form',    icon: Calendar,     label: '미팅신폼' },
  { code: 'C2',   to: '/outbound-calls',  icon: Phone,        label: '거래처 아웃콜' },
  { code: 'C3',   to: '/photo-dashboard', icon: Image,        label: '사진모음' },
  { code: 'C4',   to: '/schedule',        icon: CalendarClock, label: '강의시간표' },
  { code: 'C5',   to: '/overdue',         icon: FileText,     label: '미수금관리' },
  { code: 'C6',   to: '/shortcuts',       icon: Home,         label: '바로가기' },
  { code: 'C7',   to: '/admin-system',    icon: Settings,     label: '관리자통합' },

  // ─── D: 규정 ───
  { code: 'D1',   to: '/rules-mgmt',    icon: Scale,    label: '규정관리' },
  { code: 'D1-1', to: '/rules-editor',  icon: FileEdit, label: '규정편집' },
  { code: 'D1-2', to: '/rules-layout',  icon: Scale,    label: '규정 레이아웃' },
  { code: 'D1-3', to: '/rules-manual',  icon: FileText, label: '규정매뉴얼' },
  { code: 'D1-4', to: '/rules-jungeol', icon: FileEdit, label: '규정관리(준걸)' },
  { code: 'D2',   to: '/eval-criteria', icon: ListChecks, label: '평가기준' },

  // ─── E: 교육/콘텐츠 ───
  { code: 'E1', to: '/instructor-curri', icon: BookOpen,  label: '강사커리' },
  { code: 'E2', to: '/marketing',        icon: BarChart3, label: '마케팅' },
  { code: 'E3', to: '/prompt-guide',     icon: Settings,  label: '프롬사용법' },
];

/* ── 기본 그룹 배치 ── */
export const DEFAULT_GROUPS: NavGroup[] = [
  {
    id: 'grp-work',
    title: '업무',
    items: ALL_NAV_ITEMS.filter(i => i.code.startsWith('A')),
  },
  {
    id: 'grp-hr',
    title: '채용/인사',
    items: ALL_NAV_ITEMS.filter(i => i.code.startsWith('B')),
  },
  {
    id: 'grp-ops',
    title: '관리/운영',
    items: ALL_NAV_ITEMS.filter(i => i.code.startsWith('C')),
  },
  {
    id: 'grp-rules',
    title: '규정',
    items: ALL_NAV_ITEMS.filter(i => i.code.startsWith('D')),
  },
  {
    id: 'grp-edu',
    title: '교육/콘텐츠',
    items: ALL_NAV_ITEMS.filter(i => i.code.startsWith('E')),
  },
];

/* ── localStorage 키 ── */
export const STORAGE_KEY = 'ai-studio-nav-groups';

/* 저장 형태: groupId → code[] 매핑 + 순서 */
export interface SavedLayout {
  groupOrder: string[];                  // group id 순서
  groups: Record<string, { title: string; codes: string[] }>;
}

export function loadLayout(): SavedLayout | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function saveLayout(layout: SavedLayout) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(layout));
}

/** savedLayout → NavGroup[] 복원 */
export function restoreGroups(layout: SavedLayout): NavGroup[] {
  const itemMap = new Map(ALL_NAV_ITEMS.map(i => [i.code, i]));
  const usedCodes = new Set<string>();

  const groups: NavGroup[] = layout.groupOrder.map(gid => {
    const g = layout.groups[gid];
    if (!g) return { id: gid, title: gid, items: [] };
    const items = g.codes
      .map(c => itemMap.get(c))
      .filter((x): x is NavItem => !!x);
    items.forEach(i => usedCodes.add(i.code));
    return { id: gid, title: g.title, items };
  });

  // 어디에도 안 들어간 아이템 → 미분류
  const orphans = ALL_NAV_ITEMS.filter(i => !usedCodes.has(i.code));
  if (orphans.length > 0) {
    const existing = groups.find(g => g.id === 'grp-uncategorized');
    if (existing) existing.items.push(...orphans);
    else groups.push({ id: 'grp-uncategorized', title: '미분류', items: orphans });
  }

  return groups;
}

/** NavGroup[] → SavedLayout */
export function toLayout(groups: NavGroup[]): SavedLayout {
  return {
    groupOrder: groups.map(g => g.id),
    groups: Object.fromEntries(
      groups.map(g => [g.id, { title: g.title, codes: g.items.map(i => i.code) }])
    ),
  };
}
