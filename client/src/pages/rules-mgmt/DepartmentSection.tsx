import React, { useState } from "react";
import { useRules, DEPT_EMOJI } from "./RulesContext";
import { RuleColumns } from "./RuleColumns";

export function DepartmentSection() {
  const { state, editMode, addGroup, deleteGroup } = useRules();
  const [collapsed, setCollapsed] = useState(false);
  const [collapsedDepts, setCollapsedDepts] = useState<Record<string, boolean>>({});
  const [addingDept, setAddingDept] = useState(false);
  const [newDeptName, setNewDeptName] = useState("");

  const deptNames = Object.keys(state.departments);
  const totalItems = deptNames.reduce((sum, d) => {
    const rs = state.departments[d];
    return sum + rs.규정.length + rs.준규정.length + rs.선택사항.length;
  }, 0);

  const toggleDept = (name: string) => {
    setCollapsedDepts((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const handleAddDept = () => {
    if (newDeptName.trim() && !state.departments[newDeptName.trim()]) {
      addGroup("departments", newDeptName.trim());
      setNewDeptName("");
      setAddingDept(false);
    }
  };

  const handleDeleteDept = (name: string) => {
    if (window.confirm(`"${name}" 부서의 모든 지침이 삭제됩니다. 계속하시겠습니까?`)) {
      deleteGroup("departments", name);
    }
  };

  return (
    <section className="border border-[#ddd] rounded-lg bg-white overflow-hidden">
      {/* Section Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-[#e8e8e8] bg-[#fafafa]">
        <div className="flex items-center gap-3">
          <h2 className="text-[16px] text-[#111]" style={{ fontWeight: 700 }}>
            👥 부서별 업무 지침
          </h2>
          <span className="text-[12px] text-[#999] bg-[#f0f0f0] px-2 py-0.5 rounded-full" style={{ fontWeight: 500 }}>
            {deptNames.length}개 부서 · 총 {totalItems}건
          </span>
        </div>
        <div className="flex items-center gap-2">
          {editMode && (
            <button
              onClick={() => setAddingDept(true)}
              className="text-[12px] text-[#555] hover:text-[#111] transition-colors px-2.5 py-1 rounded-md hover:bg-[#eee] border border-[#ddd]"
              style={{ fontWeight: 500 }}
            >
              ➕ 부서 추가
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
          {/* Add new department input */}
          {addingDept && (
            <div className="px-5 py-3 bg-[#fffde7] flex items-center gap-3">
              <span className="text-[14px]">🏢</span>
              <input
                autoFocus
                value={newDeptName}
                onChange={(e) => setNewDeptName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddDept();
                  if (e.key === "Escape") { setAddingDept(false); setNewDeptName(""); }
                }}
                placeholder="새 부서명을 입력하세요..."
                className="text-[13px] border border-[#ccc] rounded-md px-3 py-1.5 outline-none focus:border-[#888] bg-white w-[240px]"
                style={{ fontWeight: 400 }}
              />
              <button
                onClick={handleAddDept}
                className="text-[12px] text-white bg-[#444] px-3 py-1.5 rounded-md hover:bg-[#666] transition-colors"
                style={{ fontWeight: 500 }}
              >
                ✅ 추가
              </button>
              <button
                onClick={() => { setAddingDept(false); setNewDeptName(""); }}
                className="text-[12px] text-[#999] px-2 py-1.5 rounded hover:bg-[#f0f0f0] transition-colors"
                style={{ fontWeight: 500 }}
              >
                취소
              </button>
            </div>
          )}

          {deptNames.map((deptName) => {
            const rs = state.departments[deptName];
            const deptTotal = rs.규정.length + rs.준규정.length + rs.선택사항.length;
            const isCollapsed = collapsedDepts[deptName];
            const emoji = DEPT_EMOJI[deptName] || "📁";

            return (
              <div key={deptName}>
                {/* Department Sub-header */}
                <div className="flex items-center justify-between px-5 py-2.5 bg-white hover:bg-[#fcfcfc] transition-colors cursor-pointer" onClick={() => toggleDept(deptName)}>
                  <div className="flex items-center gap-2.5">
                    <span className="text-[15px]">{emoji}</span>
                    <span className="text-[14px] text-[#222]" style={{ fontWeight: 600 }}>
                      {deptName}
                    </span>
                    <span className="text-[11px] text-[#bbb] bg-[#f5f5f5] px-1.5 py-0.5 rounded" style={{ fontWeight: 400 }}>
                      {deptTotal}건
                    </span>
                    <span className="text-[10px] text-[#ccc]" style={{ fontWeight: 400 }}>
                      {isCollapsed ? "▶" : "▼"}
                    </span>
                  </div>
                  {editMode && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteDept(deptName); }}
                      className="text-[10px] text-[#ccc] hover:text-[#e53935] px-2 py-0.5 rounded hover:bg-[#fff0f0] transition-colors"
                      style={{ fontWeight: 500 }}
                    >
                      🗑️ 부서 삭제
                    </button>
                  )}
                </div>

                {/* Department RuleColumns */}
                {!isCollapsed && (
                  <div className="px-5 pb-4 pt-1">
                    <RuleColumns section="departments" group={deptName} ruleSet={rs} />
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
