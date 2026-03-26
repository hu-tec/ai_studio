import { Link, Outlet, useLocation } from 'react-router';
import { ClipboardList, LayoutDashboard, User } from 'lucide-react';
import { currentEmployee } from './data';

export function Layout() {
  const location = useLocation();
  const isAdmin = location.pathname === '/admin';

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-3 h-11 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-primary" />
            <span className="hidden sm:block">업무일지 시스템</span>
            <span className="sm:hidden">업무일지</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <Link
              to="/"
              className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors ${
                !isAdmin ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent'
              }`}
            >
              <ClipboardList className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">업무 일지</span>
            </Link>
            <Link
              to="/admin"
              className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors ${
                isAdmin ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">관리자</span>
            </Link>
            <div className="flex items-center gap-1 ml-1 pl-2 border-l border-border">
              <User className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-muted-foreground hidden sm:inline">{currentEmployee.name}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}