import React, { useState } from "react";
import { useRules } from "./RulesContext";
import { RuleColumns } from "./RuleColumns";

export function CompanySection() {
  const { state } = useRules();
  const [collapsed, setCollapsed] = useState(false);

  const total =
    state.company.규정.length +
    state.company.준규정.length +
    state.company.선택사항.length;

  return (
    <section className="border border-[#ddd] rounded-lg bg-white overflow-hidden">
      {/* Section Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-[#e8e8e8] bg-[#fafafa]">
        <div className="flex items-center gap-3">
          <h2 className="text-[16px] text-[#111]" style={{ fontWeight: 700 }}>
            🏛️ 회사 전체 공통 지침
          </h2>
          <span className="text-[12px] text-[#999] bg-[#f0f0f0] px-2 py-0.5 rounded-full" style={{ fontWeight: 500 }}>
            총 {total}건
          </span>
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-[12px] text-[#888] hover:text-[#333] transition-colors px-2.5 py-1 rounded-md hover:bg-[#eee]"
          style={{ fontWeight: 500 }}
        >
          {collapsed ? "🔽 펼치기" : "🔼 접기"}
        </button>
      </div>

      {/* Content */}
      {!collapsed && (
        <div className="p-4">
          <RuleColumns section="company" group={null} ruleSet={state.company} />
        </div>
      )}
    </section>
  );
}
