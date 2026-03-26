import React from "react";
import { RulesProvider, useRules } from "./RulesContext";
import { Sidebar } from "./Sidebar";
import { TeamFilterBar } from "./TeamFilterBar";
import { DashboardPage } from "./pages/DashboardPage";
import { CompanyPage } from "./pages/CompanyPage";
import { DepartmentsPage } from "./pages/DepartmentsPage";
import { RanksPage } from "./pages/RanksPage";
import { Download } from "lucide-react";

function Layout() {
  const { editMode, toggleEditMode, state, currentPage } = useRules();

  const pageTitles: Record<string, { title: string; desc: string }> = {
    "/": { title: "📊 전체 대시보드", desc: "회사 전체 · 부서별 · 직급별 업무 지침을 한눈에 관리합니다" },
    "/company": { title: "🏛️ 회사 전체 지침", desc: "회사 공통으로 적용되는 규정 · 준규정 · 선택사항을 관리합니다" },
    "/departments": { title: "👥 부서별 지침", desc: "14개 부서별 업무 지침을 관리합니다" },
    "/ranks": { title: "🥇 직급별 지침", desc: "직급별 업무 지침을 관리합니다" },
  };

  const current = pageTitles[currentPage] || pageTitles["/"];

  const handleExcelDownload = () => {
    const rows: string[][] = [["섹션", "그룹", "유형", "내용", "적용팀"]];
    const pushRuleSet = (section: string, group: string, rs: { 규정: any[]; 준규정: any[]; 선택사항: any[] }) => {
      (["규정", "준규정", "선택사항"] as const).forEach((type) => {
        rs[type].forEach((item: any) => {
          rows.push([section, group, type, item.text, (item.teams || []).join(", ")]);
        });
      });
    };
    pushRuleSet("회사 전체", "-", state.company);
    Object.entries(state.departments).forEach(([name, rs]) => pushRuleSet("부서별", name, rs));
    Object.entries(state.ranks).forEach(([name, rs]) => pushRuleSet("직급별", name, rs));
    const BOM = "\uFEFF";
    const csv = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([BOM + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `업무지침_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  let pageContent: React.ReactNode;
  switch (currentPage) {
    case "/company":
      pageContent = <CompanyPage />;
      break;
    case "/departments":
      pageContent = <DepartmentsPage />;
      break;
    case "/ranks":
      pageContent = <RanksPage />;
      break;
    default:
      pageContent = <DashboardPage />;
  }

  return (
    <div className="flex min-h-screen bg-[#f5f5f7]">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="bg-white border-b border-[#e8e8e8] px-6 py-3 flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-[16px] text-[#111]" style={{ fontWeight: 700 }}>
              {current.title}
            </h1>
            <p className="text-[11px] text-[#aaa] mt-0.5" style={{ fontWeight: 400 }}>
              {current.desc}
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleExcelDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] text-[#555] border border-[#ddd] rounded-md hover:bg-[#f5f5f5] hover:border-[#ccc] transition-colors"
              style={{ fontWeight: 500 }}
            >
              <Download size={14} className="text-[#888]" />
              엑셀 다운로드
            </button>
            <button
              onClick={toggleEditMode}
              className={`flex items-center gap-2 px-4 py-1.5 text-[12px] rounded-md transition-all ${
                editMode
                  ? "bg-[#e53935] text-white shadow-md hover:bg-[#c62828]"
                  : "bg-[#333] text-white hover:bg-[#555]"
              }`}
              style={{ fontWeight: 600 }}
            >
              <span className="relative flex items-center">
                <span className={`inline-block w-8 h-4 rounded-full transition-colors ${editMode ? "bg-white/30" : "bg-white/20"}`}>
                  <span className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${editMode ? "translate-x-4.5" : "translate-x-0.5"}`} />
                </span>
              </span>
              {editMode ? "✏️ 편집 모드 ON" : "🔒 읽기 모드"}
            </button>
          </div>
        </header>

        {/* Edit Mode Banner */}
        {editMode && (
          <div className="bg-[#fff3e0] border-b border-[#ffcc80] px-6 py-2 flex items-center gap-2 shrink-0">
            <span className="text-[12px] text-[#e65100]" style={{ fontWeight: 500 }}>
              ⚠️ 편집 모드가 활성화되었습니다 — 모든 항목을 수정/추가/삭제할 수 있습니다.
            </span>
          </div>
        )}

        {/* Team Filter Bar */}
        <TeamFilterBar />

        {/* Page Content */}
        <main className="flex-1 p-5 space-y-5 overflow-y-auto">
          {pageContent}
        </main>
      </div>
    </div>
  );
}

function RulesMgmtPage() {
  return (
    <RulesProvider>
      <Layout />
    </RulesProvider>
  );
}

export default RulesMgmtPage;
