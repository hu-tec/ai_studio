import { useState } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { ColumnOne, ColumnTwo, ColumnThree, ColumnFour } from "./dashboard-panels";
import {
  Bell,
  User,
  ChevronDown,
  RefreshCcw,
  Plus,
  Save,
  Filter,
  Search as SearchIcon,
} from "lucide-react";
import { toast } from "sonner";

// ---------------------------------------------------------------------------
// GlobalFilterBar -- top filter strip
// ---------------------------------------------------------------------------

const GlobalFilterBar = () => {
  return (
    <div className="bg-white border-b border-slate-200 px-4 py-2 flex items-center gap-4 shrink-0 shadow-xs">
      <div className="flex items-center gap-2 text-slate-400 mr-2">
        <Filter className="w-4 h-4" />
        <span className="text-[11px] font-bold uppercase tracking-wider">Global Filter</span>
      </div>

      <div className="flex items-center gap-6 flex-1">
        {[
          { label: "대분류", options: ["문서", "음성", "영상/SNS", "IT/개발", "창의적활동"] },
          { label: "중분류", options: ["개발/보안", "디자인/기획", "비즈니스", "법률", "의료"] },
          { label: "소분류", options: ["AI", "에이전트", "DB", "빅데이터", "백엔드", "프론트"] },
        ].map((filter) => (
          <div key={filter.label} className="flex items-center gap-2">
            <label className="text-[11px] font-bold text-slate-400 whitespace-nowrap">
              {filter.label}
            </label>
            <div className="relative group min-w-[140px]">
              <select className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-[12px] text-slate-700 appearance-none outline-none focus:border-slate-900 transition-colors cursor-pointer">
                <option>{filter.label} 선택</option>
                {filter.options.map((opt) => (
                  <option key={opt}>{opt}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-2 w-3.5 h-3.5 text-slate-400 pointer-events-none group-hover:text-slate-900 transition-colors" />
            </div>
          </div>
        ))}
      </div>

      <div className="relative min-w-[240px]">
        <SearchIcon className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-400" />
        <input
          type="text"
          placeholder="통합 검색 (분야, 급수, 이름 등)"
          className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-[11px] outline-none focus:border-slate-900 focus:bg-white transition-all"
        />
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Main page component
// ---------------------------------------------------------------------------

export default function RulesLayoutPage() {
  const [activeTab, setActiveTab] = useState("시험 사이트");
  const tabs = [
    { label: "AI 번역 (TTT)" },
    { label: "음성 (TTS)" },
    { label: "교육 센터" },
    { label: "전시/행사" },
    { label: "시험 사이트" },
  ];

  return (
    <div className="flex flex-col h-screen w-full bg-slate-100 font-sans text-slate-900 overflow-hidden">
      {/* 글로벌 헤더 */}
      <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 shrink-0 z-10 shadow-sm">
        <div className="flex items-center gap-6">
          <div
            className="flex items-center gap-2 group cursor-pointer"
            onClick={() => toast.info("홈으로 이동합니다.")}
          >
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center group-hover:bg-blue-600 transition-colors">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <h1 className="text-sm font-bold tracking-tight">마케팅 타겟 DB</h1>
          </div>

          <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.label}
                onClick={() => {
                  setActiveTab(tab.label);
                  toast(`모드 전환: ${tab.label}`);
                }}
                className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-all whitespace-nowrap active:scale-95 ${
                  activeTab === tab.label
                    ? "bg-slate-900 text-white shadow-md"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-50 rounded-lg p-1 border border-slate-200">
            <button
              onClick={() =>
                toast.promise(new Promise((r) => setTimeout(r, 1000)), {
                  loading: "동기화 중...",
                  success: "최신 데이터로 업데이트되었습니다.",
                })
              }
              className="p-1.5 hover:bg-white rounded transition-all active:bg-slate-100"
            >
              <RefreshCcw className="w-4 h-4 text-slate-500" />
            </button>
            <button
              onClick={() => toast.info("새로운 작업을 시작합니다.")}
              className="p-1.5 hover:bg-white rounded transition-all active:bg-slate-100"
            >
              <Plus className="w-4 h-4 text-slate-500" />
            </button>
            <div className="w-px h-4 bg-slate-200 mx-1"></div>
            <button
              onClick={() => toast.success("현재 작업 설정이 저장되었습니다.")}
              className="flex items-center gap-2 px-3 py-1 bg-slate-900 text-white rounded font-medium text-[12px] shadow-sm hover:bg-slate-800 active:scale-95 transition-all"
            >
              <Save className="w-3.5 h-3.5" />
              저장
            </button>
          </div>
          <div className="flex items-center gap-3 ml-2 border-l border-slate-200 pl-4">
            <button
              onClick={() => toast("새로운 알림이 없습니다.")}
              className="relative p-1.5 text-slate-400 hover:text-slate-600 active:bg-slate-50 rounded-full transition-colors"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <button
              onClick={() => toast.info("마이페이지로 이동합니다.")}
              className="flex items-center gap-2 group cursor-pointer hover:bg-slate-50 p-1 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center border border-blue-200 group-hover:border-blue-400 transition-colors">
                <User className="w-4 h-4 text-blue-600" />
              </div>
              <div className="hidden md:block">
                <p className="text-[11px] font-bold text-slate-800 leading-none">이진혁 이사</p>
                <p className="text-[10px] text-slate-400">총괄 관리자</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-colors" />
            </button>
          </div>
        </div>
      </header>

      {/* 최상단 글로벌 필터 바 */}
      <GlobalFilterBar />

      {/* 메인 4구역 레이아웃 (1행 4단) */}
      <main className="flex-1 overflow-hidden">
        <PanelGroup direction="horizontal">
          <Panel defaultSize={20} minSize={15} maxSize={25}>
            <ColumnOne />
          </Panel>

          <PanelResizeHandle className="w-1.5 hover:bg-slate-400 transition-colors bg-slate-100 relative group flex items-center justify-center">
            <div className="w-0.5 h-8 bg-slate-300 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </PanelResizeHandle>

          <Panel defaultSize={20} minSize={15} maxSize={30}>
            <ColumnTwo />
          </Panel>

          <PanelResizeHandle className="w-1.5 hover:bg-slate-400 transition-colors bg-slate-100 relative group flex items-center justify-center">
            <div className="w-0.5 h-8 bg-slate-300 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </PanelResizeHandle>

          <Panel defaultSize={35} minSize={30}>
            <ColumnThree />
          </Panel>

          <PanelResizeHandle className="w-1.5 hover:bg-slate-400 transition-colors bg-slate-100 relative group flex items-center justify-center">
            <div className="w-0.5 h-8 bg-slate-300 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </PanelResizeHandle>

          <Panel defaultSize={25} minSize={20} maxSize={35}>
            <ColumnFour />
          </Panel>
        </PanelGroup>
      </main>

      {/* 하단 상태바 */}
      <footer className="h-8 bg-slate-900 text-slate-400 border-t border-slate-800 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] font-medium tracking-wide">DB SYSTEM ONLINE</span>
          </div>
          <span className="text-[10px] opacity-40">|</span>
          <span className="text-[10px]">VER 2.4.12-STABLE</span>
        </div>
        <div className="flex items-center gap-4 text-[10px]">
          <span className="hover:text-white cursor-pointer transition-colors">시스템 매뉴얼</span>
          <span className="hover:text-white cursor-pointer transition-colors">업데이트 노트</span>
          <div className="flex items-center gap-1 text-slate-500">
            <RefreshCcw className="w-2.5 h-2.5" />
            <span>LAST SYNC: 14:22:01</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
