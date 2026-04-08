import { Outlet } from 'react-router';
import { Toaster } from 'sonner';
import { StoreProvider } from '../../pages/interview/interviewStore';
import { MemoPanel } from '../memo/MemoPanel';
import { TopNavBar } from './TopNavBar';
import { CategorySidebar } from './CategorySidebar';


export function AppLayout() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 58px)', overflow: 'hidden' }}>
      {/* 상단 카테고리 바 (호버 → 메가메뉴) */}
      <TopNavBar />

      {/* 사이드바 + 메인 콘텐츠 */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', background: '#f3f6fb' }}>
        <CategorySidebar />

        <main style={{ flex: 1, overflow: 'auto', position: 'relative' }}>
          <StoreProvider>
            <Outlet />
          </StoreProvider>
          <MemoPanel />
        </main>
      </div>

      <Toaster position="top-right" richColors />
    </div>
  );
}
