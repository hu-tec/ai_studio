import React from "react";
import { useRules } from "./RulesContext";
import { RuleColumns } from "./RuleColumns";

export function CompanySection() {
  const { state, allExpanded } = useRules();

  const total =
    state.company.규정.length +
    state.company.준규정.length +
    state.company.선택사항.length;

  return (
    <section className="border border-[#ddd] rounded bg-white overflow-hidden">
      {/* Section Header */}
      <div className="flex items-center justify-between px-2 py-1 border-b border-[#e8e8e8] bg-[#fafafa]">
        <div className="flex items-center gap-1.5">
          <h2 className="text-[12px] text-[#111] font-semibold">🏛️ 회사 전체 공통 지침</h2>
          <span className="text-[10px] text-[#999] bg-[#f0f0f0] px-1.5 py-px rounded-full">
            총 {total}건
          </span>
        </div>
      </div>

      {/* Content — respects global allExpanded */}
      {allExpanded && (
        <div className="p-1.5">
          <RuleColumns section="company" group={null} ruleSet={state.company} />
        </div>
      )}
    </section>
  );
}
