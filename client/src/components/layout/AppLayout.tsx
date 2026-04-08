import { Outlet } from 'react-router';
import { Toaster } from 'sonner';
import { StoreProvider } from '../../pages/interview/interviewStore';
import { MemoPanel } from '../memo/MemoPanel';
import { CategorySidebar } from './CategorySidebar';


export function AppLayout() {
  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 58px)', overflow: 'hidden', background: '#f3f6fb' }}>
      {/* 카테고리 사이드바 (DnD 그룹 섹션 지원) */}
      <CategorySidebar />

      {/* 메인 콘텐츠 */}
      <main style={{ flex: 1, overflow: 'auto', position: 'relative' }}>
        <StoreProvider>
          <Outlet />
        </StoreProvider>
        <MemoPanel />
      </main>

      <Toaster position="top-right" richColors />
    </div>
  );
}
