import React from "react";
import { useNavigate } from "react-router";
import { useRules, ALL_TEAMS, DEPT_EMOJI, RANK_EMOJI } from "../components/RulesContext";
import { SummaryCards } from "../components/SummaryCards";
import { FeedbackSection } from "../components/FeedbackSection";

export function DashboardPage() {
  const { state, selectedTeam } = useRules();
  const navigate = useNavigate();

  const countFiltered = (rs: { 규정: any[]; 준규정: any[]; 선택사항: any[] }, type: "규정" | "준규정" | "선택사항") => {
    if (!selectedTeam) return rs[type].length;
    return rs[type].filter((item: any) => item.teams?.includes(selectedTeam)).length;
  };

  const countAllFiltered = (rs: { 규정: any[]; 준규정: any[]; 선택사항: any[] }) =>
    countFiltered(rs, "규정") + countFiltered(rs, "준규정") + countFiltered(rs, "선택사항");

  // Department stats
  const deptNames = Object.keys(state.departments);
  const rankNames = Object.keys(state.ranks);

  return (
    <>
      <SummaryCards />

      {/* Quick Overview Grid */}
      <section className="border border-[#ddd] rounded-lg bg-white overflow-hidden">
        <div className="px-5 py-3 border-b border-[#e8e8e8] bg-[#fafafa] flex items-center justify-between">
          <h2 className="text-[15px] text-[#111]" style={{ fontWeight: 700 }}>
            🏛️ 회사 전체 공통 지침 요약
          </h2>
          <button
            onClick={() => navigate("/company")}
            className="text-[11px] text-[#888] hover:text-[#333] px-2 py-1 rounded hover:bg-[#eee] transition-colors"
            style={{ fontWeight: 500 }}
          >
            자세히 보기 →
          </button>
        </div>
        <div className="p-4 grid grid-cols-3 gap-3">
          {(["규정", "준규정", "선택사항"] as const).map((type) => {
            const styles = {
              규정: { bg: "bg-[#eef0f4]", border: "border-[#d5d9e2]", emoji: "📋" },
              준규정: { bg: "bg-[#f0efe8]", border: "border-[#ddd8c8]", emoji: "📝" },
              선택사항: { bg: "bg-[#eef5ee]", border: "border-[#c8dcc8]", emoji: "✅" },
            };
            const s = styles[type];
            const count = countFiltered(state.company, type);
            return (
              <div key={type} className={`${s.bg} border ${s.border} rounded-lg px-4 py-3`}>
                <span className="text-[13px] text-[#444]" style={{ fontWeight: 600 }}>
                  {s.emoji} {type}
                </span>
                <span className="text-[20px] text-[#222] block mt-1" style={{ fontWeight: 700 }}>
                  {count}건
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Department Overview Grid */}
      <section className="border border-[#ddd] rounded-lg bg-white overflow-hidden">
        <div className="px-5 py-3 border-b border-[#e8e8e8] bg-[#fafafa] flex items-center justify-between">
          <h2 className="text-[15px] text-[#111]" style={{ fontWeight: 700 }}>
            👥 부서별 지침 현황
          </h2>
          <button
            onClick={() => navigate("/departments")}
            className="text-[11px] text-[#888] hover:text-[#333] px-2 py-1 rounded hover:bg-[#eee] transition-colors"
            style={{ fontWeight: 500 }}
          >
            자세히 보기 →
          </button>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-7 gap-2">
            {deptNames.map((name) => {
              const rs = state.departments[name];
              const total = countAllFiltered(rs);
              const ruleCount = countFiltered(rs, "규정");
              const semiCount = countFiltered(rs, "준규정");
              const optCount = countFiltered(rs, "선택사항");
              const emoji = DEPT_EMOJI[name] || "📁";
              return (
                <div
                  key={name}
                  className="border border-[#e8e8e8] rounded-lg p-3 hover:shadow-sm hover:border-[#ccc] transition-all cursor-pointer"
                  onClick={() => navigate("/departments")}
                >
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="text-[14px]">{emoji}</span>
                    <span className="text-[12px] text-[#333] truncate" style={{ fontWeight: 600 }}>
                      {name}
                    </span>
                  </div>
                  <span className="text-[18px] text-[#222] block" style={{ fontWeight: 700 }}>
                    {total}
                  </span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-[9px] px-1 py-0.5 rounded bg-[#eef0f4] text-[#555]" style={{ fontWeight: 500 }}>📋{ruleCount}</span>
                    <span className="text-[9px] px-1 py-0.5 rounded bg-[#f0efe8] text-[#555]" style={{ fontWeight: 500 }}>📝{semiCount}</span>
                    <span className="text-[9px] px-1 py-0.5 rounded bg-[#eef5ee] text-[#555]" style={{ fontWeight: 500 }}>✅{optCount}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Rank Overview Grid */}
      <section className="border border-[#ddd] rounded-lg bg-white overflow-hidden">
        <div className="px-5 py-3 border-b border-[#e8e8e8] bg-[#fafafa] flex items-center justify-between">
          <h2 className="text-[15px] text-[#111]" style={{ fontWeight: 700 }}>
            🥇 직급별 지침 현황
          </h2>
          <button
            onClick={() => navigate("/ranks")}
            className="text-[11px] text-[#888] hover:text-[#333] px-2 py-1 rounded hover:bg-[#eee] transition-colors"
            style={{ fontWeight: 500 }}
          >
            자세히 보기 →
          </button>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-5 gap-2">
            {rankNames.map((name) => {
              const rs = state.ranks[name];
              const total = countAllFiltered(rs);
              const ruleCount = countFiltered(rs, "규정");
              const semiCount = countFiltered(rs, "준규정");
              const optCount = countFiltered(rs, "선택사항");
              const emoji = RANK_EMOJI[name] || "🔹";
              return (
                <div
                  key={name}
                  className="border border-[#e8e8e8] rounded-lg p-3 hover:shadow-sm hover:border-[#ccc] transition-all cursor-pointer"
                  onClick={() => navigate("/ranks")}
                >
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="text-[14px]">{emoji}</span>
                    <span className="text-[12px] text-[#333]" style={{ fontWeight: 600 }}>
                      {name}
                    </span>
                  </div>
                  <span className="text-[18px] text-[#222] block" style={{ fontWeight: 700 }}>
                    {total}
                  </span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-[9px] px-1 py-0.5 rounded bg-[#eef0f4] text-[#555]" style={{ fontWeight: 500 }}>📋{ruleCount}</span>
                    <span className="text-[9px] px-1 py-0.5 rounded bg-[#f0efe8] text-[#555]" style={{ fontWeight: 500 }}>📝{semiCount}</span>
                    <span className="text-[9px] px-1 py-0.5 rounded bg-[#eef5ee] text-[#555]" style={{ fontWeight: 500 }}>✅{optCount}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <FeedbackSection />
    </>
  );
}
