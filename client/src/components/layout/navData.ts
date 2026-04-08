import {
  ClipboardCheck, ShieldCheck, Clock, ClipboardList,
  Calendar, FileText, Image, Phone, Home,
  BarChart3, BookOpen, FolderOpen,
  CalendarClock, Settings, Scale, FileEdit, ListChecks,
  MessageSquare, Users, Megaphone, HelpCircle, StickyNote,
  GraduationCap, DollarSign, Award, Languages, Layers,
  Palette, FileCheck, Truck, Building2, Search, Kanban,
  type LucideIcon,
} from 'lucide-react';

/* ── 타입 ── */
export interface NavItem {
  to: string;
  icon: LucideIcon;
  label: string;
  code: string;          // A1, A1-1, B2 …
}

export type NavRole = 'staff' | 'admin' | 'all';

export interface NavGroup {
  id: string;
  title: string;
  role: NavRole;
  items: NavItem[];
}

/* ── 역할별 컬러 ── */
export const ROLE_COLORS: Record<NavRole, { bg: string; text: string; badge: string; border: string }> = {
  staff: { bg: '#eff6ff', text: '#2563eb', badge: '#3b82f6', border: '#bfdbfe' },   // 파랑
  admin: { bg: '#fef3c7', text: '#b45309', badge: '#f59e0b', border: '#fde68a' },   // 주황
  all:   { bg: '#ecfdf5', text: '#059669', badge: '#10b981', border: '#a7f3d0' },   // 초록
};

/* ── 전체 페이지 목록 (코드 부여) ── */
export const ALL_NAV_ITEMS: NavItem[] = [
  // ─── A: 업무 ───
  { code: 'A0',   to: '/work-hub-a',         icon: Home,          label: '업무 총괄(A)' },
  { code: 'A0-1', to: '/work-hub',           icon: Home,          label: '업무 총괄(B)' },
  { code: 'A1',   to: '/work-materials',     icon: FolderOpen,    label: '업무 자료' },
  { code: 'A1-1', to: '/work-log',           icon: ClipboardList, label: '업무일지(직원-new)' },
  { code: 'A1-3', to: '/work-log/admin',     icon: ClipboardList, label: '업무일지(관리)' },
  { code: 'A2',   to: '/pledge',             icon: ShieldCheck,   label: '서약서' },
  { code: 'A3-1', to: '/company-guidelines', icon: Scale,         label: '사내업무지침(통합-new)' },
  { code: 'A4',   to: '/lesson-plan',        icon: BookOpen,      label: '레슨플랜' },
  { code: 'A5',   to: '/manual-list',        icon: BookOpen,      label: '매뉴얼 리스트' },

  // ─── B: 채용/인사 ───
  { code: 'B0',   to: '/recruitment',         icon: ClipboardCheck, label: '채용관리(통합)' },
  { code: 'B2',   to: '/attendance',          icon: Clock,          label: '출퇴근 관리(A)' },
  { code: 'B2-1', to: '/attendance-b',        icon: Clock,          label: '출퇴근 관리(B)' },

  // ─── C: 관리/운영 ───
  { code: 'C1',   to: '/meetings',        icon: Calendar,     label: '미팅 관리' },
  { code: 'C1-1', to: '/meeting-form',    icon: Calendar,     label: '미팅신폼' },
  { code: 'C2',   to: '/outbound-calls',  icon: Phone,        label: '거래처 아웃콜' },
  { code: 'C3',   to: '/photo-dashboard', icon: Image,        label: '사진모음' },
  { code: 'C4',   to: '/schedule',        icon: CalendarClock, label: '강의시간표' },
  { code: 'C5',   to: '/overdue',         icon: FileText,     label: '미수금관리' },
  { code: 'C7',   to: '/admin-system',    icon: Settings,     label: '관리자통합' },

  // ─── D: 규정 ───
  { code: 'D1',   to: '/rules-mgmt',    icon: Scale,    label: '규정관리' },
  { code: 'D1-1', to: '/rules-editor',  icon: FileEdit, label: '규정편집' },
  { code: 'D1-2', to: '/rules-layout',  icon: Scale,    label: '규정 레이아웃' },
  { code: 'D1-3', to: '/rules-manual',  icon: FileText, label: '규정매뉴얼' },
  { code: 'D1-4', to: '/rules-jungeol', icon: FileEdit, label: '규정관리(준걸)' },
  { code: 'D2',   to: '/eval-criteria', icon: ListChecks, label: '평가기준' },
  { code: 'D3',   to: '/claude-rules', icon: FileEdit,   label: '규정(임시_혁_test)' },

  // ─── E: 교육/콘텐츠 ───
  { code: 'E1', to: '/instructor-curri', icon: BookOpen,  label: '강사커리' },
  { code: 'E2', to: '/marketing',        icon: BarChart3, label: '마케팅' },
  { code: 'E3', to: '/prompt-guide',     icon: Settings,  label: '프롬사용법' },

  // ─── F: 영규 ───
  { code: 'F1', to: '/hutechc-homepage', icon: Home, label: '영규-hutechc' },

  // ─── G: 커뮤니티 ───
  { code: 'G1',   to: '/community-notice',        icon: Megaphone,     label: '(gw) 전체공지' },
  { code: 'G2',   to: '/community-team-notice',   icon: Megaphone,     label: '(gw) 팀별공지' },
  { code: 'G3',   to: '/community-center-notice', icon: Megaphone,     label: '(gw) 센터별공지' },
  { code: 'G4',   to: '/community-work-notice',   icon: Megaphone,     label: '(gw) 업무별공지' },
  { code: 'G5',   to: '/community-free-board',    icon: MessageSquare, label: '(gw) 자유게시판' },
  { code: 'G6',   to: '/community-qna',           icon: HelpCircle,    label: '(gw) Q&A' },
  { code: 'G7',   to: '/community-memo',          icon: StickyNote,    label: '메모 모아보기' },
  { code: 'G8',   to: '/community-meeting-board', icon: MessageSquare, label: '회의 게시판' },

  // ─── H: 학생관리 ───
  { code: 'H1',   to: '/student-tesol',      icon: GraduationCap, label: '(gw) 테솔 학생관리' },
  { code: 'H1-1', to: '/student-tesol-old',  icon: GraduationCap, label: '(gw) 테솔(이전자료)' },
  { code: 'H2',   to: '/student-accounting', icon: DollarSign,    label: '(gw) 회계관리' },
  { code: 'H3',   to: '/student-certi',      icon: Award,         label: '(gw) Certi관리' },
  { code: 'H4',   to: '/student-translator', icon: Languages,     label: '(gw) 번역사' },
  { code: 'H5',   to: '/student-ics',        icon: Layers,        label: '(gw) ICS' },
  { code: 'H6',   to: '/student-etc',        icon: FolderOpen,    label: '(gw) 기타' },

  // ─── I: 서식/확인서 ───
  { code: 'I1',   to: '/form-mgmt',        icon: FileText,  label: '(gw) 서식관리' },
  { code: 'I2',   to: '/design-materials', icon: Palette,   label: '(gw) 디자인물' },
  { code: 'I3',   to: '/cert-kukton',      icon: FileCheck,  label: '(gw) 확인서-국통' },
  { code: 'I4',   to: '/cert-tesol',       icon: FileCheck,  label: '(gw) 확인서-테솔' },
  { code: 'I5',   to: '/cert-itt',         icon: FileCheck,  label: '(gw) 확인서-ITT' },

  // ─── J: 출장관리 ───
  { code: 'J1',   to: '/dispatch-instructor', icon: Truck,     label: '(gw) 출강강사관리' },
  { code: 'J2',   to: '/dispatch-client',     icon: Building2, label: '(gw) 거래처관리(출장)' },

  // ─── C 추가: 관리/운영 (gw) ───
  { code: 'C8',   to: '/staff-info',             icon: Users,  label: '(gw) 사내정보' },
  { code: 'C9',   to: '/client-mgmt',            icon: Building2, label: '(gw) 거래처관리' },
  { code: 'C10',  to: '/online-meeting-search',  icon: Search,    label: '(gw) 온라인미팅 검색' },
  { code: 'C11',  to: '/online-project',         icon: Kanban,    label: '(gw) 프로젝트관리' },

  // ─── X: 쓰레기통 (통합 완료로 대체된 페이지) ───
  { code: 'X1', to: '/shortcuts',           icon: Home,          label: '바로가기(→업무총괄)' },
  { code: 'X2', to: '/work-log-old',        icon: ClipboardList, label: '업무일지(old→new대체)' },
  { code: 'X3', to: '/guidelines',          icon: FileText,      label: '사내지침(old→통합대체)' },
  { code: 'X4', to: '/interview',           icon: ClipboardCheck, label: '면접입력(→채용통합)' },
  { code: 'X5', to: '/interview/dashboard', icon: ClipboardCheck, label: '면접대시보드(→채용통합)' },
  { code: 'X6', to: '/instructor-eval',     icon: ClipboardCheck, label: '강사채점(→채용통합)' },
  { code: 'X7', to: '/instructor-flow',     icon: ClipboardList,  label: '면접플로우(→채용통합)' },
];

/* ── 기본 그룹 배치 ── */
export const DEFAULT_GROUPS: NavGroup[] = [
  // ─── 직원 ───
  { id: 'grp-work',      title: '업무',        role: 'staff', items: ALL_NAV_ITEMS.filter(i => i.code.startsWith('A')) },
  // ─── 관리자 ───
  { id: 'grp-hr',        title: '채용/인사',    role: 'admin', items: ALL_NAV_ITEMS.filter(i => i.code.startsWith('B')) },
  { id: 'grp-ops',       title: '관리/운영',    role: 'admin', items: ALL_NAV_ITEMS.filter(i => i.code.startsWith('C')) },
  { id: 'grp-rules',     title: '규정',         role: 'admin', items: ALL_NAV_ITEMS.filter(i => i.code.startsWith('D')) },
  { id: 'grp-student',   title: '학생관리',     role: 'admin', items: ALL_NAV_ITEMS.filter(i => i.code.startsWith('H')) },
  { id: 'grp-forms',     title: '서식/확인서',  role: 'admin', items: ALL_NAV_ITEMS.filter(i => i.code.startsWith('I')) },
  { id: 'grp-dispatch',  title: '출장관리',     role: 'admin', items: ALL_NAV_ITEMS.filter(i => i.code.startsWith('J')) },
  // ─── 공통 ───
  { id: 'grp-community', title: '커뮤니티',     role: 'all',   items: ALL_NAV_ITEMS.filter(i => i.code.startsWith('G')) },
  { id: 'grp-edu',       title: '교육/콘텐츠',  role: 'all',   items: ALL_NAV_ITEMS.filter(i => i.code.startsWith('E')) },
  // ─── 기타 ───
  { id: 'grp-uncategorized', title: '미분류',    role: 'admin', items: ALL_NAV_ITEMS.filter(i => i.code.startsWith('F')) },
  { id: 'grp-trash',        title: '쓰레기통',   role: 'admin', items: ALL_NAV_ITEMS.filter(i => i.code.startsWith('X')) },
];

/* 사이드바 레이아웃은 DEFAULT_GROUPS 고정 — 드래그/localStorage 제거됨 */
