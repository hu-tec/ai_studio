import React from "react";
import { useRules } from "./RulesContext";

export function SummaryCards() {
  const { state, selectedTeam } = useRules();

  const countFiltered = (rs: { 규정: any[]; 준규정: any[]; 선택사항: any[] }, type: "규정" | "준규정" | "선택사항") => {
    if (!selectedTeam) return rs[type].length;
    return rs[type].filter((item: any) => item.teams?.includes(selectedTeam)).length;
  };

  const countAll = (type: "규정" | "준규정" | "선택사항") => {
    let total = countFiltered(state.company, type);
    Object.values(state.departments).forEach((rs) => (total += countFiltered(rs, type)));
    Object.values(state.ranks).forEach((rs) => (total += countFiltered(rs, type)));
    Object.values(state.services).forEach((rs) => (total += countFiltered(rs, type)));
    return total;
  };

  const totalRules = countAll("규정");
  const totalSemi = countAll("준규정");
  const totalOptional = countAll("선택사항");
  const grandTotal = totalRules + totalSemi + totalOptional;

  const deptCount = Object.keys(state.departments).length;
  const rankCount = Object.keys(state.ranks).length;
  const svcCount = Object.keys(state.services).length;

  const filterLabel = selectedTeam ? ` (${selectedTeam} 필터)` : "";

  const cards = [
    { emoji: "📦", label: "전체 지침", value: grandTotal.toLocaleString(), unit: "건", sub: `${deptCount}부서 · ${rankCount}직급 · ${svcCount}서비스${filterLabel}`, accent: "border-l-[#666]" },
    { emoji: "📋", label: "규정 (고정)", value: totalRules.toLocaleString(), unit: "건", sub: "변경 금지 항목", accent: "border-l-[#7986cb]" },
    { emoji: "📝", label: "준규정 (준고정)", value: totalSemi.toLocaleString(), unit: "건", sub: "조건부 변경 가능", accent: "border-l-[#c9a84c]" },
    { emoji: "✅", label: "선택사항", value: totalOptional.toLocaleString(), unit: "건", sub: "자율 선택 항목", accent: "border-l-[#66bb6a]" },
  ];

  return (
    <div className="grid grid-cols-4 gap-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`bg-white border border-[#e8e8e8] ${card.accent} border-l-[3px] rounded-lg px-5 py-4`}
        >
          <div className="flex items-center gap-1.5">
            <span className="text-[13px]">{card.emoji}</span>
            <p className="text-[11px] text-[#999]" style={{ fontWeight: 400 }}>
              {card.label}
            </p>
          </div>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-[26px] text-[#222]" style={{ fontWeight: 700, lineHeight: 1.2 }}>
              {card.value}
            </span>
            <span className="text-[12px] text-[#bbb]" style={{ fontWeight: 400 }}>
              {card.unit}
            </span>
          </div>
          <p className="text-[11px] text-[#aaa] mt-1" style={{ fontWeight: 400 }}>
            {card.sub}
          </p>
        </div>
      ))}
    </div>
  );
}
