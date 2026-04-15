import React from "react";
import { useRules, type PagePath } from "./RulesContext";

interface NavItem {
  emoji: string;
  label: string;
  to: PagePath;
}

const navItems: NavItem[] = [
  { emoji: "🏢", label: "전체 대시보드", to: "/" },
  { emoji: "🏛️", label: "회사 전체 지침", to: "/company" },
  { emoji: "👥", label: "부서별 지침", to: "/departments" },
  { emoji: "🥇", label: "직급별 지침", to: "/ranks" },
  { emoji: "🌐", label: "홈페이지 서비스 지침", to: "/services" },
];

export function Sidebar() {
  const { currentPage, navigateTo } = useRules();

  return (
    <aside className="w-[160px] bg-white border-r border-[#e8e8e8] flex flex-col shrink-0 h-screen sticky top-0">
      {/* Logo */}
      <div className="px-2 py-1.5 border-b border-[#e8e8e8] flex items-center gap-1.5">
        <div className="w-5 h-5 rounded bg-[#333] flex items-center justify-center">
          <span className="text-white text-[9px] font-bold">DB</span>
        </div>
        <div className="min-w-0">
          <span className="text-[11px] text-[#222] block font-semibold truncate">업무지침 관리</span>
          <span className="text-[9px] text-[#bbb] block truncate">v1.0</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-1 py-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = currentPage === item.to;
          return (
            <button
              key={item.label}
              onClick={() => navigateTo(item.to)}
              className={`w-full flex items-center gap-1.5 px-1.5 py-1 rounded text-left transition-all mb-0.5 ${
                isActive
                  ? "bg-[#f0f0f0] text-[#111]"
                  : "text-[#666] hover:bg-[#f8f8f8] hover:text-[#333]"
              }`}
            >
              <span className="text-[12px] shrink-0">{item.emoji}</span>
              <span className={`text-[11px] flex-1 truncate ${isActive ? "font-semibold" : "font-normal"}`}>
                {item.label}
              </span>
              {isActive && <span className="w-1 h-1 rounded-full bg-[#333] shrink-0" />}
            </button>
          );
        })}
      </nav>

      {/* Divider + Info */}
      <div className="border-t border-[#e8e8e8] px-2 py-1">
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded-full bg-[#e8e8e8] flex items-center justify-center">
            <span className="text-[9px] text-[#888] font-semibold">A</span>
          </div>
          <div className="min-w-0">
            <span className="text-[10px] text-[#555] block font-medium truncate">관리자</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
