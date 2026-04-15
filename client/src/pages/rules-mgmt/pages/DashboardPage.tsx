import React from "react";

import { useRules, DEPT_EMOJI, RANK_EMOJI, SERVICE_EMOJI } from "../RulesContext";
import { SummaryCards } from "../SummaryCards";
import { FeedbackSection } from "../FeedbackSection";

export function DashboardPage() {
  const { state, selectedTeam, navigateTo } = useRules();

  const countFiltered = (rs: { 규정: any[]; 준규정: any[]; 선택사항: any[] }, type: "규정" | "준규정" | "선택사항") => {
    if (!selectedTeam) return rs[type].length;
    return rs[type].filter((item: any) => item.teams?.includes(selectedTeam)).length;
  };

  const countAllFiltered = (rs: { 규정: any[]; 준규정: any[]; 선택사항: any[] }) =>
    countFiltered(rs, "규정") + countFiltered(rs, "준규정") + countFiltered(rs, "선택사항");

  const deptNames = Object.keys(state.departments);
  const rankNames = Object.keys(state.ranks);
  const svcNames = Object.keys(state.services);

  const renderCard = (name: string, rs: { 규정: any[]; 준규정: any[]; 선택사항: any[] }, emojiMap: Record<string, string>, onClick: () => void) => {
    const total = countAllFiltered(rs);
    const r = countFiltered(rs, "규정");
    const s = countFiltered(rs, "준규정");
    const o = countFiltered(rs, "선택사항");
    const emoji = emojiMap[name] || "📁";
    return (
      <div
        key={name}
        className="border border-[#e8e8e8] rounded p-1.5 hover:shadow-sm hover:border-[#ccc] transition-all cursor-pointer"
        onClick={onClick}
      >
        <div className="flex items-center gap-1 mb-0.5">
          <span className="text-[11px]">{emoji}</span>
          <span className="text-[10px] text-[#333] font-semibold truncate">{name}</span>
        </div>
        <span className="text-[14px] text-[#222] font-bold block leading-none">{total}</span>
        <div className="flex items-center gap-0.5 mt-0.5">
          <span className="text-[8px] px-0.5 py-px rounded bg-[#eef0f4] text-[#555] font-medium">📋{r}</span>
          <span className="text-[8px] px-0.5 py-px rounded bg-[#f0efe8] text-[#555] font-medium">📝{s}</span>
          <span className="text-[8px] px-0.5 py-px rounded bg-[#eef5ee] text-[#555] font-medium">✅{o}</span>
        </div>
      </div>
    );
  };

  const sectionHeader = (title: string, target: () => void) => (
    <div className="px-2 py-1 border-b border-[#e8e8e8] bg-[#fafafa] flex items-center justify-between">
      <h2 className="text-[12px] text-[#111] font-semibold">{title}</h2>
      <button
        onClick={target}
        className="text-[10px] text-[#888] hover:text-[#333] px-1.5 py-0.5 rounded hover:bg-[#eee] transition-colors font-medium"
      >
        자세히 →
      </button>
    </div>
  );

  return (
    <>
      <SummaryCards />

      {/* 회사 전체 요약 */}
      <section className="border border-[#ddd] rounded bg-white overflow-hidden">
        {sectionHeader("🏛️ 회사 전체 공통 지침 요약", () => navigateTo("/company"))}
        <div className="p-1.5 grid grid-cols-3 gap-1.5">
          {(["규정", "준규정", "선택사항"] as const).map((type) => {
            const styles = {
              규정: { bg: "bg-[#eef0f4]", border: "border-[#d5d9e2]", emoji: "📋", sub: "고정" },
              준규정: { bg: "bg-[#f0efe8]", border: "border-[#ddd8c8]", emoji: "📝", sub: "준고정" },
              선택사항: { bg: "bg-[#eef5ee]", border: "border-[#c8dcc8]", emoji: "✅", sub: "선택" },
            }[type];
            const count = countFiltered(state.company, type);
            return (
              <div key={type} className={`${styles.bg} border ${styles.border} rounded px-2 py-1.5`}>
                <div className="flex items-center gap-1">
                  <span className="text-[11px] text-[#444] font-semibold">{styles.emoji} {type}</span>
                  <span className="text-[9px] text-[#777]">{styles.sub}</span>
                </div>
                <span className="text-[16px] text-[#222] block leading-tight font-bold">{count}건</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* 부서별 */}
      <section className="border border-[#ddd] rounded bg-white overflow-hidden">
        {sectionHeader("👥 부서별 지침 현황", () => navigateTo("/departments"))}
        <div className="p-1.5">
          <div className="grid grid-cols-7 gap-1">
            {deptNames.map((name) => renderCard(name, state.departments[name], DEPT_EMOJI, () => navigateTo("/departments")))}
          </div>
        </div>
      </section>

      {/* 직급별 */}
      <section className="border border-[#ddd] rounded bg-white overflow-hidden">
        {sectionHeader("🥇 직급별 지침 현황", () => navigateTo("/ranks"))}
        <div className="p-1.5">
          <div className="grid grid-cols-5 gap-1">
            {rankNames.map((name) => renderCard(name, state.ranks[name], RANK_EMOJI, () => navigateTo("/ranks")))}
          </div>
        </div>
      </section>

      {/* 홈페이지 서비스 */}
      <section className="border border-[#ddd] rounded bg-white overflow-hidden">
        {sectionHeader("🌐 홈페이지 서비스 지침 현황", () => navigateTo("/services"))}
        <div className="p-1.5">
          <div className="grid grid-cols-4 gap-1">
            {svcNames.map((name) => renderCard(name, state.services[name], SERVICE_EMOJI, () => navigateTo("/services")))}
          </div>
        </div>
      </section>

      <FeedbackSection />
    </>
  );
}
