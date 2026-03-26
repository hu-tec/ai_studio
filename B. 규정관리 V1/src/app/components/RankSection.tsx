import React, { useState } from "react";
import { useRules, RANK_EMOJI } from "./RulesContext";
import { RuleColumns } from "./RuleColumns";

export function RankSection() {
  const { state, editMode, addGroup, deleteGroup } = useRules();
  const [collapsed, setCollapsed] = useState(false);
  const [collapsedRanks, setCollapsedRanks] = useState<Record<string, boolean>>({});
  const [addingRank, setAddingRank] = useState(false);
  const [newRankName, setNewRankName] = useState("");

  const rankNames = Object.keys(state.ranks);
  const totalItems = rankNames.reduce((sum, r) => {
    const rs = state.ranks[r];
    return sum + rs.규정.length + rs.준규정.length + rs.선택사항.length;
  }, 0);

  const toggleRank = (name: string) => {
    setCollapsedRanks((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const handleAddRank = () => {
    if (newRankName.trim() && !state.ranks[newRankName.trim()]) {
      addGroup("ranks", newRankName.trim());
      setNewRankName("");
      setAddingRank(false);
    }
  };

  const handleDeleteRank = (name: string) => {
    if (window.confirm(`"${name}" 직급의 모든 지침이 삭제됩니다. 계속하시겠습니까?`)) {
      deleteGroup("ranks", name);
    }
  };

  return (
    <section className="border border-[#ddd] rounded-lg bg-white overflow-hidden">
      {/* Section Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-[#e8e8e8] bg-[#fafafa]">
        <div className="flex items-center gap-3">
          <h2 className="text-[16px] text-[#111]" style={{ fontWeight: 700 }}>
            🥇 직급별 업무 지침
          </h2>
          <span className="text-[12px] text-[#999] bg-[#f0f0f0] px-2 py-0.5 rounded-full" style={{ fontWeight: 500 }}>
            {rankNames.length}개 직급 · 총 {totalItems}건
          </span>
        </div>
        <div className="flex items-center gap-2">
          {editMode && (
            <button
              onClick={() => setAddingRank(true)}
              className="text-[12px] text-[#555] hover:text-[#111] transition-colors px-2.5 py-1 rounded-md hover:bg-[#eee] border border-[#ddd]"
              style={{ fontWeight: 500 }}
            >
              ➕ 직급 추가
            </button>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-[12px] text-[#888] hover:text-[#333] transition-colors px-2.5 py-1 rounded-md hover:bg-[#eee]"
            style={{ fontWeight: 500 }}
          >
            {collapsed ? "🔽 펼치기" : "🔼 접기"}
          </button>
        </div>
      </div>

      {/* Content */}
      {!collapsed && (
        <div className="divide-y divide-[#e8e8e8]">
          {/* Add new rank input */}
          {addingRank && (
            <div className="px-5 py-3 bg-[#fffde7] flex items-center gap-3">
              <span className="text-[14px]">🏅</span>
              <input
                autoFocus
                value={newRankName}
                onChange={(e) => setNewRankName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddRank();
                  if (e.key === "Escape") { setAddingRank(false); setNewRankName(""); }
                }}
                placeholder="새 직급명을 입력하세요..."
                className="text-[13px] border border-[#ccc] rounded-md px-3 py-1.5 outline-none focus:border-[#888] bg-white w-[240px]"
                style={{ fontWeight: 400 }}
              />
              <button
                onClick={handleAddRank}
                className="text-[12px] text-white bg-[#444] px-3 py-1.5 rounded-md hover:bg-[#666] transition-colors"
                style={{ fontWeight: 500 }}
              >
                ✅ 추가
              </button>
              <button
                onClick={() => { setAddingRank(false); setNewRankName(""); }}
                className="text-[12px] text-[#999] px-2 py-1.5 rounded hover:bg-[#f0f0f0] transition-colors"
                style={{ fontWeight: 500 }}
              >
                취소
              </button>
            </div>
          )}

          {rankNames.map((rankName) => {
            const rs = state.ranks[rankName];
            const rankTotal = rs.규정.length + rs.준규정.length + rs.선택사항.length;
            const isCollapsed = collapsedRanks[rankName];
            const emoji = RANK_EMOJI[rankName] || "🔹";

            return (
              <div key={rankName}>
                {/* Rank Sub-header */}
                <div className="flex items-center justify-between px-5 py-2.5 bg-white hover:bg-[#fcfcfc] transition-colors cursor-pointer" onClick={() => toggleRank(rankName)}>
                  <div className="flex items-center gap-2.5">
                    <span className="text-[15px]">{emoji}</span>
                    <span className="text-[14px] text-[#222]" style={{ fontWeight: 600 }}>
                      {rankName}
                    </span>
                    <span className="text-[11px] text-[#bbb] bg-[#f5f5f5] px-1.5 py-0.5 rounded" style={{ fontWeight: 400 }}>
                      {rankTotal}건
                    </span>
                    <span className="text-[10px] text-[#ccc]" style={{ fontWeight: 400 }}>
                      {isCollapsed ? "▶" : "▼"}
                    </span>
                  </div>
                  {editMode && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteRank(rankName); }}
                      className="text-[10px] text-[#ccc] hover:text-[#e53935] px-2 py-0.5 rounded hover:bg-[#fff0f0] transition-colors"
                      style={{ fontWeight: 500 }}
                    >
                      🗑️ 직급 삭제
                    </button>
                  )}
                </div>

                {/* Rank RuleColumns */}
                {!isCollapsed && (
                  <div className="px-5 pb-4 pt-1">
                    <RuleColumns section="ranks" group={rankName} ruleSet={rs} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
