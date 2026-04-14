import React, { useState } from "react";
import { useRules, SERVICE_EMOJI } from "./RulesContext";
import { RuleColumns } from "./RuleColumns";

export function ServicesSection() {
  const { state, editMode, addGroup, deleteGroup } = useRules();
  const [collapsed, setCollapsed] = useState(false);
  const [collapsedSvcs, setCollapsedSvcs] = useState<Record<string, boolean>>({});
  const [addingSvc, setAddingSvc] = useState(false);
  const [newSvcName, setNewSvcName] = useState("");

  const svcNames = Object.keys(state.services);
  const totalItems = svcNames.reduce((sum, s) => {
    const rs = state.services[s];
    return sum + rs.규정.length + rs.준규정.length + rs.선택사항.length;
  }, 0);

  const toggleSvc = (name: string) => {
    setCollapsedSvcs((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const handleAddSvc = () => {
    if (newSvcName.trim() && !state.services[newSvcName.trim()]) {
      addGroup("services", newSvcName.trim());
      setNewSvcName("");
      setAddingSvc(false);
    }
  };

  const handleDeleteSvc = (name: string) => {
    if (window.confirm(`"${name}" 서비스의 모든 지침이 삭제됩니다. 계속하시겠습니까?`)) {
      deleteGroup("services", name);
    }
  };

  return (
    <section className="border border-[#ddd] rounded-lg bg-white overflow-hidden">
      {/* Section Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-[#e8e8e8] bg-[#fafafa]">
        <div className="flex items-center gap-3">
          <h2 className="text-[16px] text-[#111]" style={{ fontWeight: 700 }}>
            🌐 홈페이지 서비스 지침
          </h2>
          <span className="text-[12px] text-[#999] bg-[#f0f0f0] px-2 py-0.5 rounded-full" style={{ fontWeight: 500 }}>
            {svcNames.length}개 서비스 · 총 {totalItems}건
          </span>
        </div>
        <div className="flex items-center gap-2">
          {editMode && (
            <button
              onClick={() => setAddingSvc(true)}
              className="text-[12px] text-[#555] hover:text-[#111] transition-colors px-2.5 py-1 rounded-md hover:bg-[#eee] border border-[#ddd]"
              style={{ fontWeight: 500 }}
            >
              ➕ 서비스 추가
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
          {addingSvc && (
            <div className="px-5 py-3 bg-[#fffde7] flex items-center gap-3">
              <span className="text-[14px]">🌐</span>
              <input
                autoFocus
                value={newSvcName}
                onChange={(e) => setNewSvcName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddSvc();
                  if (e.key === "Escape") { setAddingSvc(false); setNewSvcName(""); }
                }}
                placeholder="새 서비스명을 입력하세요..."
                className="text-[13px] border border-[#ccc] rounded-md px-3 py-1.5 outline-none focus:border-[#888] bg-white w-[240px]"
                style={{ fontWeight: 400 }}
              />
              <button
                onClick={handleAddSvc}
                className="text-[12px] text-white bg-[#444] px-3 py-1.5 rounded-md hover:bg-[#666] transition-colors"
                style={{ fontWeight: 500 }}
              >
                ✅ 추가
              </button>
              <button
                onClick={() => { setAddingSvc(false); setNewSvcName(""); }}
                className="text-[12px] text-[#999] px-2 py-1.5 rounded hover:bg-[#f0f0f0] transition-colors"
                style={{ fontWeight: 500 }}
              >
                취소
              </button>
            </div>
          )}

          {svcNames.map((svcName) => {
            const rs = state.services[svcName];
            const svcTotal = rs.규정.length + rs.준규정.length + rs.선택사항.length;
            const isCollapsed = collapsedSvcs[svcName];
            const emoji = SERVICE_EMOJI[svcName] || "📄";

            return (
              <div key={svcName}>
                <div className="flex items-center justify-between px-5 py-2.5 bg-white hover:bg-[#fcfcfc] transition-colors cursor-pointer" onClick={() => toggleSvc(svcName)}>
                  <div className="flex items-center gap-2.5">
                    <span className="text-[15px]">{emoji}</span>
                    <span className="text-[14px] text-[#222]" style={{ fontWeight: 600 }}>
                      {svcName}
                    </span>
                    <span className="text-[11px] text-[#bbb] bg-[#f5f5f5] px-1.5 py-0.5 rounded" style={{ fontWeight: 400 }}>
                      {svcTotal}건
                    </span>
                    <span className="text-[10px] text-[#ccc]" style={{ fontWeight: 400 }}>
                      {isCollapsed ? "▶" : "▼"}
                    </span>
                  </div>
                  {editMode && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteSvc(svcName); }}
                      className="text-[10px] text-[#ccc] hover:text-[#e53935] px-2 py-0.5 rounded hover:bg-[#fff0f0] transition-colors"
                      style={{ fontWeight: 500 }}
                    >
                      🗑️ 서비스 삭제
                    </button>
                  )}
                </div>

                {!isCollapsed && (
                  <div className="px-5 pb-4 pt-1">
                    <RuleColumns section="services" group={svcName} ruleSet={rs} />
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
