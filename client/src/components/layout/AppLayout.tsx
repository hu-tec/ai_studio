import { Outlet, NavLink, useLocation } from 'react-router';
import { useState } from 'react';
import { Toaster } from 'sonner';
import {
  ClipboardCheck, ShieldCheck, Clock, ClipboardList,
  Calendar, FileText, Image, Phone, ChevronLeft, ChevronRight, Home,
  BarChart3, LayoutDashboard, FileInput, GraduationCap, BookOpen,
  Users, CalendarClock, Settings, Scale, FileEdit, ListChecks, Construction
} from 'lucide-react';
import { StoreProvider } from '../../pages/interview/interviewStore';

const C = Construction; // 공사중 아이콘 약어

const NAV_SECTIONS = [
  {
    title: '소비자 접수',
    items: [
      { to: '/tesol', icon: GraduationCap, label: 'TESOL 신청' },
      { to: '/level-test', icon: BookOpen, label: '레벨테스트' },
      { to: '/coming/exam', icon: C, label: '시험지(응시자)' },
      { to: '/coming/expert-apply', icon: C, label: '전문가 지원' },
      { to: '/coming/expert-step1', icon: C, label: '전문가 신청 1단계' },
      { to: '/coming/translator-apply', icon: C, label: '번역가 지원' },
      { to: '/coming/instructor-apply', icon: C, label: '강사 지원(출력)' },
      { to: '/coming/instructor-apply-v3', icon: C, label: '강사 지원 v3' },
    ],
  },
  {
    title: '직원 도구',
    items: [
      { to: '/work-log', icon: ClipboardList, label: '업무일지(직원-new)' },
      { to: '/work-log-old', icon: ClipboardList, label: '업무일지(직원-old)' },
      { to: '/work-log/admin', icon: ClipboardList, label: '업무일지(관리)' },
      { to: '/pledge', icon: ShieldCheck, label: '서약서' },
      { to: '/guidelines', icon: FileText, label: '사내업무지침' },
      { to: '/lesson-plan', icon: BookOpen, label: '레슨플랜' },
      { to: '/coming/prompt-guide', icon: C, label: '프롬사용법' },
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
      { to: '/coming/app-forms', icon: C, label: '신청서모음' },
      { to: '/coming/instructor-eval', icon: C, label: '강사채점' },
      { to: '/coming/expert-admin', icon: C, label: '전문가 관리' },
      { to: '/coming/expert-consult', icon: C, label: '상담관리' },
      { to: '/coming/instructor-flow', icon: C, label: '면접플로우' },
      { to: '/coming/expert-1page', icon: C, label: '전문가지원서' },
      { to: '/coming/meeting-form', icon: C, label: '미팅신폼' },
    ],
  },
  {
    title: '규정/DB',
    items: [
      { to: '/coming/rules-layout', icon: C, label: '규정 레이아웃' },
      { to: '/coming/rules-manual', icon: C, label: '규정매뉴얼' },
      { to: '/coming/rules-jungeol', icon: C, label: '규정관리(준걸)' },
      { to: '/coming/db-page', icon: C, label: 'DB 분류' },
      { to: '/coming/instructor-curri', icon: C, label: '강사커리' },
      { to: '/coming/marketing', icon: C, label: '마케팅' },
      { to: '/coming/question-bank', icon: C, label: '문제은행' },
    ],
  },
  {
    title: '홈페이지/랜딩',
    items: [
      { to: '/coming/tesol-landing', icon: C, label: 'TESOL 랜딩v4' },
      { to: '/coming/ceo-homepage', icon: C, label: '대표님 홈페이지' },
      { to: '/coming/hutechc-homepage', icon: C, label: '휴텍씨 홈페이지' },
      { to: '/coming/ceo-v3-deploy', icon: C, label: '대표님 v3(배포)' },
      { to: '/coming/combined-homepage', icon: C, label: '결합홈페이지' },
      { to: '/coming/classic-translation', icon: C, label: '고전번역 서비스' },
      { to: '/coming/translation-all', icon: C, label: '번역전체' },
      { to: '/coming/arabic-translation', icon: C, label: '번역_아랍 v3' },
      { to: '/coming/tongdok', icon: C, label: '통독-전체 v3' },
      { to: '/coming/aite', icon: C, label: 'AITE' },
      { to: '/coming/iita', icon: C, label: 'IITA협회' },
      { to: '/coming/ai-studio', icon: C, label: 'AI STUDIO v3' },
      { to: '/coming/onepage', icon: C, label: '원페이지' },
      { to: '/coming/semiconductor', icon: C, label: '반도체/조선/방산' },
      { to: '/coming/physical', icon: C, label: '피지컬' },
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
