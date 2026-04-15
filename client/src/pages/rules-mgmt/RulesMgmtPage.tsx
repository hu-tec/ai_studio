import React from "react";
import { RulesProvider, useRules } from "./RulesContext";
import { Sidebar } from "./Sidebar";
import { TeamFilterBar } from "./TeamFilterBar";
import { DashboardPage } from "./pages/DashboardPage";
import { CompanyPage } from "./pages/CompanyPage";
import { DepartmentsPage } from "./pages/DepartmentsPage";
import { RanksPage } from "./pages/RanksPage";
import { ServicesPage } from "./pages/ServicesPage";
import { Download } from "lucide-react";

function Layout() {
  const { editMode, toggleEditMode, state, currentPage } = useRules();

  const pageTitles: Record<string, { title: string; desc: string }> = {
    "/": { title: "📊 전체 대시보드", desc: "회사 전체 · 부서별 · 직급별 · 홈페이지 서비스 업무 지침을 한눈에 관리합니다" },
    "/company": { title: "🏛️ 회사 전체 지침", desc: "회사 공통으로 적용되는 규정 · 준규정 · 선택사항을 관리합니다" },
    "/departments": { title: "👥 부서별 지침", desc: "13개 부서별 업무 지침을 관리합니다" },
    "/ranks": { title: "🥇 직급별 지침", desc: "직급별 업무 지침을 관리합니다" },
    "/services": { title: "🌐 홈페이지 서비스 지침", desc: "홈페이지 서비스 카테고리별(교육·번역·통독·시험·전시회·전문가매칭 등) 운영 지침을 관리합니다" },
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
    Object.entries(state.services).forEach(([name, rs]) => pushRuleSet("홈페이지 서비스", name, rs));
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
    case "/services":
      pageContent = <ServicesPage />;
      break;
    default:
      pageContent = <DashboardPage />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#f5f5f7]">
      {/* T9 SoT 배너 */}
      <div className="flex items-center gap-2 px-2 py-1 bg-amber-50 border-b border-amber-200 text-[10px] text-amber-800">
        <span>⚠</span>
        <span>부서·직급·서비스 등 카테고리 정의는 <a href="/app/work-class-demo" className="font-bold text-blue-700 underline">업무 분류(최종DB) — T9</a> 에서만. 이 페이지는 규정 항목 작성/편집 전용 (카테고리 자체는 read-only).</span>
      </div>
      <div className="flex flex-1 min-h-0">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="bg-white border-b border-[#e8e8e8] px-2 py-1.5 flex items-center justify-between shrink-0">
          <div className="min-w-0">
            <h1 className="text-[13px] text-[#111] font-bold truncate">{current.title}</h1>
            <p className="text-[10px] text-[#aaa] truncate">{current.desc}</p>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleExcelDownload}
              className="flex items-center gap-1 px-2 py-1 text-[11px] text-[#555] border border-[#ddd] rounded hover:bg-[#f5f5f5] hover:border-[#ccc] transition-colors font-medium"
            >
              <Download size={12} className="text-[#888]" />
              엑셀
            </button>
            <button
              onClick={toggleEditMode}
              className={`flex items-center gap-1 px-2 py-1 text-[11px] rounded transition-all font-semibold ${
                editMode
                  ? "bg-[#e53935] text-white hover:bg-[#c62828]"
                  : "bg-[#333] text-white hover:bg-[#555]"
              }`}
            >
              {editMode ? "✏️ 편집 ON" : "🔒 읽기"}
            </button>
          </div>
        </header>

        {/* Edit Mode Banner */}
        {editMode && (
          <div className="bg-[#fff3e0] border-b border-[#ffcc80] px-2 py-0.5 flex items-center gap-1 shrink-0">
            <span className="text-[10px] text-[#e65100] font-medium">
              ⚠️ 편집 모드 — 모든 항목 수정/추가/삭제 가능
            </span>
          </div>
        )}

        {/* Team Filter Bar */}
        <TeamFilterBar />

        {/* Page Content */}
        <main className="flex-1 p-2 space-y-2 overflow-y-auto">
          {pageContent}
        </main>
      </div>
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
