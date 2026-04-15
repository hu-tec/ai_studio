import { Outlet, Link, useLocation } from "react-router";
import { BookOpen, List, PenSquare } from "lucide-react";

function LessonPlanPage() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-white sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-2">
          <div className="flex items-center justify-between h-11">
            <Link to="/lesson-plan" className="flex items-center gap-1.5 text-primary no-underline">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span className="text-sm">레슨플랜</span>
            </Link>
            <nav className="flex items-center gap-0.5">
              <Link
                to="/lesson-plan"
                className={`flex items-center gap-1 px-2.5 py-1 rounded no-underline transition-colors text-sm ${
                  location.pathname === "/lesson-plan"
                    ? "bg-blue-50 text-blue-700"
                    : "text-muted-foreground hover:bg-accent"
                }`}
              >
                <List className="w-3.5 h-3.5" />
                목록
              </Link>
              <Link
                to="/lesson-plan/write"
                className={`flex items-center gap-1 px-2.5 py-1 rounded no-underline transition-colors text-sm ${
                  location.pathname === "/lesson-plan/write"
                    ? "bg-blue-50 text-blue-700"
                    : "text-muted-foreground hover:bg-accent"
                }`}
              >
                <PenSquare className="w-3.5 h-3.5" />
                등록
              </Link>
            </nav>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="max-w-[1400px] mx-auto px-2 py-1">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default LessonPlanPage;
