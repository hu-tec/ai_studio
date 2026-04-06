import { useState } from "react";
import {
  Bell, ShoppingCart, User, Users,
  LayoutGrid, FolderClosed, FileText, Bookmark, Settings, Menu,
  Upload, SlidersHorizontal, QrCode, MessageCircle
} from "lucide-react";
import { Toaster } from "sonner";
import { WorkspaceContent } from "./components/WorkspaceContent";
import { ResultPage } from "./components/ResultPage";
import { ExpertDashboard } from "./components/ExpertDashboard";
import { Page2 } from "./components/Page2";
import { Page3 } from "./components/Page3";
import { Page4 } from "./components/Page4";

type AppView = "workspace" | "page2" | "page3" | "page4" | "result" | "expert";

/* ── Left Sidebar ─────────────────────────────────────────── */
const sidebarIcons = [
  { icon: Menu, label: "메뉴" },
  { icon: LayoutGrid, label: "대시보드", active: true },
  { icon: FolderClosed, label: "폴더" },
  { icon: FileText, label: "문서" },
  { icon: Bookmark, label: "북마크" },
];

function LeftSidebar() {
  return (
    <aside className="w-14 border-r border-gray-200 flex flex-col items-center py-3 gap-4 bg-white shrink-0">
      {sidebarIcons.map((item, i) => (
        <div
          key={i}
          className={`w-9 h-9 rounded-lg flex items-center justify-center cursor-pointer ${
            item.active ? "bg-gray-100 text-black" : "text-gray-400 hover:text-gray-600"
          }`}
        >
          <item.icon className="w-5 h-5" />
        </div>
      ))}
      <div className="mt-auto">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center cursor-pointer text-gray-400 hover:text-gray-600">
          <Settings className="w-5 h-5" />
        </div>
      </div>
    </aside>
  );
}

/* ── Right Sidebar ────────────────────────────────────────── */
function RightSidebar() {
  return (
    <aside className="w-14 border-l border-gray-200 flex flex-col items-center py-3 gap-4 bg-white shrink-0">
      <div className="w-9 h-9 rounded-lg flex items-center justify-center cursor-pointer text-gray-400 hover:text-gray-600">
        <Upload className="w-5 h-5" />
      </div>
      <div className="w-9 h-9 rounded-lg flex items-center justify-center cursor-pointer text-gray-400 hover:text-gray-600">
        <SlidersHorizontal className="w-5 h-5" />
      </div>
      <div className="w-9 h-9 rounded-lg flex items-center justify-center cursor-pointer text-gray-400 hover:text-gray-600">
        <QrCode className="w-5 h-5" />
      </div>
      <div className="mt-auto">
        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center cursor-pointer text-white">
          <MessageCircle className="w-5 h-5" />
        </div>
      </div>
    </aside>
  );
}

/* ── Top Nav ──────────────────────────────────────────────── */
function TopNav({
  onPageChange,
  currentPage,
}: {
  onPageChange: (page: AppView) => void;
  currentPage: AppView;
}) {
  const isWorkspaceArea = currentPage === "workspace" || currentPage === "page2" || currentPage === "page3" || currentPage === "page4" || currentPage === "result";

  return (
    <header className="h-14 border-b border-gray-200 flex items-center justify-between px-6 bg-white shrink-0 shadow-sm z-30">
      <div className="flex items-center gap-10">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => onPageChange("workspace")}>
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">A</div>
          <span className="text-[17px] font-extrabold tracking-tight text-slate-900">AI STUDIO</span>
        </div>
        <nav className="flex items-center gap-8 text-[14px] font-medium text-slate-500 h-14">
          <span
            className={`cursor-pointer transition-colors hover:text-blue-600 ${isWorkspaceArea ? "text-blue-600 border-b-2 border-blue-600 h-14 flex items-center" : "flex items-center"}`}
            onClick={() => onPageChange("workspace")}
          >
            창작작업실
          </span>
          <span
            className={`cursor-pointer transition-colors hover:text-blue-600 flex items-center gap-1.5 ${currentPage === "expert" ? "text-blue-600 border-b-2 border-blue-600 h-14" : ""}`}
            onClick={() => onPageChange("expert")}
          >
            <Users className="w-4 h-4" />
            전문가 관리
          </span>
          <span className="cursor-pointer hover:text-blue-600 flex items-center">창작마켓</span>
          <span className="cursor-pointer hover:text-blue-600 flex items-center">요금제</span>
          <span className="cursor-pointer hover:text-blue-600 flex items-center">고객센터</span>
        </nav>
      </div>
      <div className="flex items-center gap-5 text-slate-400">
        <div className="relative cursor-pointer hover:text-slate-600 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
        </div>
        <ShoppingCart className="w-5 h-5 cursor-pointer hover:text-slate-600 transition-colors" />
        <div className="flex items-center gap-2 cursor-pointer bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100 hover:bg-slate-100 transition-colors">
          <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
            <User className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <span className="text-[13px] font-semibold text-slate-700">관리자님</span>
        </div>
      </div>
    </header>
  );
}

/* ── Main Page ────────────────────────────────────────────── */
export default function AiWorkspacePage() {
  const [page, setPage] = useState<AppView>("workspace");

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <TopNav onPageChange={setPage} currentPage={page} />
      <div className="flex flex-1 overflow-hidden">
        {page !== "expert" && <LeftSidebar />}
        <main className="flex-1 overflow-auto bg-[#F8FAFC]">
          {page === "workspace" && (
            <WorkspaceContent onGenerate={() => setPage("page2")} />
          )}
          {page === "page2" && (
            <Page2
              onNext={() => setPage("page3")}
              onEdit={() => setPage("page4")}
              onBack={() => setPage("workspace")}
            />
          )}
          {page === "page3" && (
            <Page3 onNext={() => setPage("page4")} onBack={() => setPage("page2")} />
          )}
          {page === "page4" && (
            <Page4 onNext={() => setPage("result")} onBack={() => setPage("page3")} />
          )}
          {page === "result" && (
            <ResultPage onBack={() => setPage("workspace")} />
          )}
          {page === "expert" && (
            <ExpertDashboard />
          )}
        </main>
        {page !== "expert" && <RightSidebar />}
      </div>
      <Toaster position="top-center" richColors />
    </div>
  );
}
