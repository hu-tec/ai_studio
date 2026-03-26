import React from "react";
import { useRules, ALL_TEAMS, DEPT_EMOJI } from "./RulesContext";

export function TeamFilterBar() {
  const { selectedTeam, setSelectedTeam } = useRules();

  return (
    <div className="bg-white border-b border-[#e8e8e8] px-6 py-2 flex items-center gap-1.5 overflow-x-auto shrink-0">
      <span className="text-[11px] text-[#aaa] mr-1 shrink-0" style={{ fontWeight: 500 }}>
        🏷️ 팀 필터 :
      </span>
      <button
        onClick={() => setSelectedTeam(null)}
        className={`shrink-0 px-2.5 py-1 rounded-full text-[11px] transition-all border ${
          selectedTeam === null
            ? "bg-[#333] text-white border-[#333]"
            : "bg-white text-[#666] border-[#ddd] hover:bg-[#f5f5f5] hover:border-[#bbb]"
        }`}
        style={{ fontWeight: selectedTeam === null ? 600 : 400 }}
      >
        전체
      </button>
      {ALL_TEAMS.map((team) => {
        const emoji = DEPT_EMOJI[team] || "📁";
        const isActive = selectedTeam === team;
        return (
          <button
            key={team}
            onClick={() => setSelectedTeam(isActive ? null : team)}
            className={`shrink-0 px-2.5 py-1 rounded-full text-[11px] transition-all border ${
              isActive
                ? "bg-[#333] text-white border-[#333]"
                : "bg-white text-[#666] border-[#ddd] hover:bg-[#f5f5f5] hover:border-[#bbb]"
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
