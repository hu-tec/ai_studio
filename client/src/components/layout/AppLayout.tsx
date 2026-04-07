import { Outlet, NavLink, useLocation } from 'react-router';
import { useState } from 'react';
import { Toaster } from 'sonner';
import {
  ClipboardCheck, ShieldCheck, Clock, ClipboardList,
  Calendar, FileText, Image, Phone, ChevronLeft, ChevronRight, Home,
  BarChart3, LayoutDashboard, BookOpen, FolderOpen,
  CalendarClock, Settings, Scale, FileEdit, FileInput, ListChecks, Construction
} from 'lucide-react';
import { StoreProvider } from '../../pages/interview/interviewStore';

const C = Construction; // 공사중 아이콘 약어

const NAV_SECTIONS = [
  // 소비자 접수 → work_studio로 이관 완료 (54.116.15.136)
  {
    title: '직원 도구',
    items: [
      { to: '/work-materials', icon: FolderOpen, label: '업무 자료' },
      { to: '/work-log', icon: ClipboardList, label: '업무일지(직원-new)' },
      { to: '/work-log-old', icon: ClipboardList, label: '업무일지(직원-old)' },
      { to: '/work-log/admin', icon: ClipboardList, label: '업무일지(관리)' },
      { to: '/pledge', icon: ShieldCheck, label: '서약서' },
      { to: '/guidelines', icon: FileText, label: '사내업무지침' },
      { to: '/company-guidelines', icon: Scale, label: '사내업무지침(통합-new)' },
      { to: '/lesson-plan', icon: BookOpen, label: '레슨플랜' },
      { to: '/coming/manual-list', icon: C, label: '매뉴얼 리스트' },
    ],
  },
  {
    title: '관리자 도구',
    items: [
      { to: '/interview', icon: ClipboardCheck, label: '면접 입력' },
      { to: '/interview/dashboard', icon: ClipboardCheck, label: '면접 대시보드' },
      { to: '/attendance', icon: Clock, label: '출퇴근 관리' },
      { to: '/meetings', icon: Calendar, label: '미팅 관리' },
      { to: '/outbound-calls', icon: Phone, label: '거래처 아웃콜' },
      { to: '/photo-dashboard', icon: Image, label: '사진모음' },
      { to: '/schedule', icon: CalendarClock, label: '강의시간표' },
      { to: '/rules-mgmt', icon: Scale, label: '규정관리' },
      { to: '/rules-editor', icon: FileEdit, label: '규정편집' },
      { to: '/eval-criteria', icon: ListChecks, label: '평가기준' },
      { to: '/admin-system', icon: Settings, label: '관리자통합' },
      { to: '/coming/overdue', icon: C, label: '미수금관리' },
      { to: '/coming/shortcuts', icon: C, label: '바로가기' },
      { to: '/coming/instructor-eval', icon: C, label: '강사채점' },
      { to: '/coming/instructor-flow', icon: C, label: '면접플로우' },
      { to: '/coming/meeting-form', icon: C, label: '미팅신폼' },
      // 신청서모음, 전문가관리, 상담관리, 전문가지원서 → work_studio로 이관
    ],
  },
  {
    title: '규정',
    items: [
      { to: '/coming/rules-layout', icon: C, label: '규정 레이아웃' },
      { to: '/coming/rules-manual', icon: C, label: '규정매뉴얼' },
      { to: '/coming/rules-jungeol', icon: C, label: '규정관리(준걸)' },
      { to: '/coming/instructor-curri', icon: C, label: '강사커리' },
      { to: '/coming/marketing', icon: C, label: '마케팅' },
      { to: '/coming/prompt-guide', icon: C, label: '프롬사용법' },
      // DB분류, 문제은행, 홈페이지/랜딩 전체 → work_studio로 이관
    ],
  },
];

export function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 58px)', overflow: 'hidden', background: '#f3f6fb' }}>
      {/* 사이드바 */}
      <aside
        style={{
          width: collapsed ? 52 : 220,
          minWidth: collapsed ? 52 : 220,
          background: '#fff',
          borderRight: '1px solid #e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          transition: 'width 0.2s, min-width 0.2s',
          overflow: 'hidden',
        }}
      >
        {/* 로고 */}
        <div style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #5ee7ff, #4c2fff)', flexShrink: 0 }} />
          {!collapsed && <span style={{ fontWeight: 700, fontSize: 14 }}>AI Studio</span>}
        </div>

        {/* 네비게이션 */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 6px' }}>
          {NAV_SECTIONS.map((section) => (
            <div key={section.title} style={{ marginBottom: 12 }}>
              {!collapsed && (
                <div style={{ fontSize: 10, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '4px 8px', marginBottom: 2 }}>
                  {section.title}
                </div>
              )}
              {section.items.map((item) => {
                const isActive = location.pathname === item.to || location.pathname.startsWith(item.to + '/');
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: collapsed ? '8px 14px' : '6px 10px',
                      borderRadius: 6,
                      fontSize: 13,
                      fontWeight: isActive ? 600 : 400,
                      color: isActive ? '#3b82f6' : '#475569',
                      background: isActive ? '#eff6ff' : 'transparent',
                      marginBottom: 1,
                      textDecoration: 'none',
                      transition: 'all 0.15s',
                      whiteSpace: 'nowrap',
                    }}
                    title={item.label}
                  >
                    <item.icon size={16} style={{ flexShrink: 0 }} />
                    {!collapsed && item.label}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>

        {/* 하단 링크 + 접기 */}
        <div style={{ borderTop: '1px solid #e2e8f0', padding: '6px' }}>
          <a
            href="/admin.html"
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 6, fontSize: 12, color: '#64748b', textDecoration: 'none' }}
          >
            <BarChart3 size={14} />
            {!collapsed && '데이터 관리'}
          </a>
          <a
            href="/dashboard.html"
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 6, fontSize: 12, color: '#64748b', textDecoration: 'none' }}
          >
            <LayoutDashboard size={14} />
            {!collapsed && '프로세스'}
          </a>
          <a
            href="/면접_main.html"
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 6, fontSize: 12, color: '#64748b', textDecoration: 'none' }}
          >
            <FileInput size={14} />
            {!collapsed && '면접 폼(입력)'}
          </a>
          <a
            href="/home.html"
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 6, fontSize: 12, color: '#64748b', textDecoration: 'none' }}
          >
            <Home size={14} />
            {!collapsed && '홈으로'}
          </a>
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start',
              gap: 8, padding: '6px 10px', border: 'none', background: 'none', borderRadius: 6,
              cursor: 'pointer', fontSize: 12, color: '#94a3b8',
            }}
          >
            {collapsed ? <ChevronRight size={14} /> : <><ChevronLeft size={14} /> 접기</>}
          </button>
        </div>
      </aside>

      {/* 메인 콘텐츠 */}
      <main style={{ flex: 1, overflow: 'auto' }}>
        <StoreProvider>
          <Outlet />
        </StoreProvider>
      </main>

      <Toaster position="top-right" richColors />
    </div>
  );
}
