import React from "react";
import { Search as SearchIcon, X } from "lucide-react";
import { useRules, ALL_TEAMS, DEPT_EMOJI } from "./RulesContext";

export function TeamFilterBar() {
  const { selectedTeam, setSelectedTeam, searchQuery, setSearchQuery, allExpanded, toggleAllExpanded } = useRules();

  return (
    <div className="bg-white border-b border-[#e8e8e8] px-2 py-1 flex flex-wrap items-center gap-1 shrink-0">
      {/* 검색 */}
      <div className="relative min-w-[200px] max-w-[260px] flex-1">
        <SearchIcon size={12} className="absolute left-1.5 top-1.5 text-[#aaa]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="규정 본문 검색…"
          className="w-full pl-2 pr-2 py-1 text-[11px] bg-[#f8f8f8] border border-[#e0e0e0] rounded outline-none focus:bg-white focus:border-[#999] transition-colors"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-1 top-1 p-0.5 text-[#aaa] hover:text-[#333]"
            title="검색 초기화"
          >
            <X size={11} />
          </button>
        )}
      </div>

      {/* 전체 펼치기/접기 */}
      <button
        onClick={toggleAllExpanded}
        className="shrink-0 px-2 py-1 rounded text-[10px] border border-[#ddd] bg-white text-[#555] hover:bg-[#f5f5f5] transition-colors"
        style={{ fontWeight: 500 }}
      >
        {allExpanded ? "🔼 전체 접기" : "🔽 전체 펼치기"}
      </button>

      {/* 구분자 */}
      <span className="shrink-0 text-[9px] text-[#ccc] mx-1">|</span>

      {/* 팀 필터 라벨 */}
      <span className="shrink-0 text-[10px] text-[#888] font-medium">🏷️ 팀:</span>

      {/* 전체 (싱글 선택) */}
      <button
        onClick={() => setSelectedTeam(null)}
        className={`shrink-0 px-1.5 py-0.5 rounded-md text-[10px] transition-all border ${
          selectedTeam === null
            ? "bg-[#333] text-white border-[#333]"
            : "bg-white text-[#666] border-[#ddd] hover:bg-[#f5f5f5]"
        }`}
        style={{ fontWeight: selectedTeam === null ? 600 : 400 }}
      >
        전체
      </button>

      {/* 팀 칩 — 싱글 선택이므로 rounded-md */}
      {ALL_TEAMS.map((team) => {
        const emoji = DEPT_EMOJI[team] || "📁";
        const isActive = selectedTeam === team;
        return (
          <button
            key={team}
            onClick={() => setSelectedTeam(isActive ? null : team)}
            className={`shrink-0 px-1.5 py-0.5 rounded-md text-[10px] transition-all border ${
              isActive
                ? "bg-[#333] text-white border-[#333]"
                : "bg-white text-[#666] border-[#ddd] hover:bg-[#f5f5f5]"
            }`}
            style={{ fontWeight: isActive ? 600 : 400 }}
          >
            {emoji} {team}
          </button>
        );
      })}
    </div>
  );
}
