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
];

export function Sidebar() {
  const { currentPage, navigateTo } = useRules();

  return (
    <aside className="w-[210px] bg-white border-r border-[#e8e8e8] flex flex-col shrink-0 h-screen sticky top-0">
      {/* Logo */}
      <div className="px-5 py-4 border-b border-[#e8e8e8] flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-md bg-[#333] flex items-center justify-center">
          <span className="text-white text-[11px]" style={{ fontWeight: 700 }}>DB</span>
        </div>
        <div>
          <span className="text-[14px] text-[#222] block" style={{ fontWeight: 600 }}>업무지침 관리</span>
          <span className="text-[10px] text-[#bbb] block" style={{ fontWeight: 400 }}>Dashboard v1.0</span>
        </div>
      </div>

      {/* Section Label */}
      <div className="px-5 pt-4 pb-1">
        <span className="text-[10px] text-[#bbb] tracking-wider" style={{ fontWeight: 600 }}>
          메뉴
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = currentPage === item.to;
          return (
            <button
              key={item.label}
              onClick={() => navigateTo(item.to)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all mb-0.5 ${
                isActive
                  ? "bg-[#f0f0f0] text-[#111] shadow-sm"
                  : "text-[#666] hover:bg-[#f8f8f8] hover:text-[#333]"
              }`}
            >
              <span className="text-[16px] shrink-0">{item.emoji}</span>
              <span className="text-[13px] flex-1" style={{ fontWeight: isActive ? 600 : 400 }}>
                {item.label}
              </span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#333] shrink-0" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Divider + Info */}
      <div className="border-t border-[#e8e8e8] px-5 py-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-[#e8e8e8] flex items-center justify-center">
            <span className="text-[10px] text-[#888]" style={{ fontWeight: 600 }}>A</span>
          </div>
          <div>
            <span className="text-[11px] text-[#555] block" style={{ fontWeight: 500 }}>관리자</span>
            <span className="text-[9px] text-[#bbb] block" style={{ fontWeight: 400 }}>admin@company.kr</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
