import { Navigate, Outlet, useLocation } from 'react-router';
import { Toaster } from 'sonner';
import { StoreProvider } from '../../pages/interview/interviewStore';
import { MemoPanel } from '../memo/MemoPanel';
import { TopNavBar } from './TopNavBar';
import { CategorySidebar } from './CategorySidebar';
import { useAuth } from '@/contexts/AuthContext';

/** 로그인 없이 접근 가능한 공개 경로 (회사 홈페이지 + 로그인/로그아웃) */
function isPublicPath(pathname: string): boolean {
  if (pathname === '/hutechc-homepage/login' || pathname === '/hutechc-homepage/logout') return true;
  // /hutechc-homepage/* 는 공개 (admin 하위는 개별 RouteGuard로 보호됨)
  if (pathname.startsWith('/hutechc-homepage')) return true;
  return false;
}

export function AppLayout() {
  const { user, loading } = useAuth();
  const location = useLocation();

  // 인증 확인 중
  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#64748b' }}>
        인증 확인 중...
      </div>
    );
  }

  // 미로그인 + 보호 경로 → 로그인 페이지로
  if (!user && !isPublicPath(location.pathname)) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/hutechc-homepage/login?next=${next}`} replace />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      {/* 상단 카테고리 바 (호버 → 메가메뉴) — 로그인 상태일 때만 */}
      {user && <TopNavBar />}

      {/* 사이드바 + 메인 콘텐츠 */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', background: '#f3f6fb' }}>
        {user && <CategorySidebar />}

        <main style={{ flex: 1, overflow: 'auto', position: 'relative' }}>
          <StoreProvider>
            <Outlet />
          </StoreProvider>
          {user && <MemoPanel />}
        </main>
      </div>

      <Toaster position="top-right" richColors />
    </div>
  );
}
