import React, { useState, useEffect } from "react";
import { useRules, type RuleSet, type GroupSection as GroupSectionType } from "./RulesContext";
import { RuleColumns } from "./RuleColumns";

interface GroupSectionProps {
  section: GroupSectionType;
  title: string;
  icon: string;
  addLabel: string;
  unitLabel: string;
  groups: Record<string, RuleSet>;
  emojiMap: Record<string, string>;
}

/** Shared section for Department / Rank / Service — compact, search-aware, allExpanded-aware. */
export function GroupSection({
  section,
  title,
  icon,
  addLabel,
  unitLabel,
  groups,
  emojiMap,
}: GroupSectionProps) {
  const { editMode, addGroup, deleteGroup, allExpanded, searchQuery, selectedTeam } = useRules();
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");

  // Whenever allExpanded flips, reset per-group state so they follow the global setting.
  useEffect(() => {
    setCollapsedGroups({});
  }, [allExpanded]);

  const names = Object.keys(groups);
  const totalItems = names.reduce((sum, n) => {
    const rs = groups[n];
    return sum + rs.규정.length + rs.준규정.length + rs.선택사항.length;
  }, 0);

  const q = searchQuery.trim().toLowerCase();
  const matchesAnyRule = (rs: RuleSet): boolean => {
    if (!q && !selectedTeam) return true;
    const types = ["규정", "준규정", "선택사항"] as const;
    return types.some((t) =>
      rs[t].some((item) => {
        if (selectedTeam && !item.teams.includes(selectedTeam)) return false;
        if (q && !item.text.toLowerCase().includes(q)) return false;
        return true;
      })
    );
  };

  const toggleGroup = (name: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [name]: !isGroupCollapsed(name) }));
  };

  const isGroupCollapsed = (name: string): boolean => {
    if (name in collapsedGroups) return collapsedGroups[name];
    return !allExpanded;
  };

  const handleAdd = () => {
    const trimmed = newName.trim();
    if (trimmed && !groups[trimmed]) {
      addGroup(section, trimmed);
      setNewName("");
      setAdding(false);
    }
  };

  const handleDelete = (name: string) => {
    if (window.confirm(`"${name}"의 모든 지침이 삭제됩니다. 계속하시겠습니까?`)) {
      deleteGroup(section, name);
    }
  };

  return (
    <section className="border border-[#ddd] rounded bg-white overflow-hidden">
      {/* Section Header */}
      <div className="flex items-center justify-between px-2 py-1 border-b border-[#e8e8e8] bg-[#fafafa]">
        <div className="flex items-center gap-1.5">
          <h2 className="text-[12px] text-[#111] font-semibold">{icon} {title}</h2>
          <span className="text-[10px] text-[#999] bg-[#f0f0f0] px-1.5 py-px rounded-full">
            {names.length}개 {unitLabel} · 총 {totalItems}건
          </span>
        </div>
        {editMode && (
          <button
            onClick={() => setAdding(true)}
            className="text-[10px] text-[#555] hover:text-[#111] transition-colors px-1.5 py-0.5 rounded hover:bg-[#eee] border border-[#ddd]"
          >
            + {addLabel}
          </button>
        )}
      </div>

      {/* Content */}
      <div className="divide-y divide-[#e8e8e8]">
        {adding && (
          <div className="px-2 py-1 bg-[#fffde7] flex items-center gap-1">
            <span className="text-[11px]">{icon}</span>
            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAdd();
                if (e.key === "Escape") { setAdding(false); setNewName(""); }
              }}
              placeholder={`새 ${unitLabel}명…`}
              className="flex-1 max-w-[200px] text-[11px] border border-[#ccc] rounded px-1.5 py-0.5 outline-none focus:border-[#888] bg-white"
            />
            <button
              onClick={handleAdd}
              className="text-[10px] text-white bg-[#444] px-2 py-0.5 rounded hover:bg-[#666] transition-colors"
            >
              추가
            </button>
            <button
              onClick={() => { setAdding(false); setNewName(""); }}
              className="text-[10px] text-[#999] px-1.5 py-0.5 rounded hover:bg-[#f0f0f0] transition-colors"
            >
              취소
            </button>
          </div>
        )}

        {names.map((name) => {
          const rs = groups[name];
          const grpTotal = rs.규정.length + rs.준규정.length + rs.선택사항.length;
          const collapsed = isGroupCollapsed(name);
          const emoji = emojiMap[name] || "📁";

          // When searching/filtering, hide groups without any matching rule
          if ((q || selectedTeam) && !matchesAnyRule(rs)) return null;

          return (
            <div key={name}>
              <div
                className="flex items-center justify-between px-2 py-1 bg-white hover:bg-[#fcfcfc] transition-colors cursor-pointer"
                onClick={() => toggleGroup(name)}
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-[12px]">{emoji}</span>
                  <span className="text-[12px] text-[#222] font-semibold">{name}</span>
                  <span className="text-[10px] text-[#bbb] bg-[#f5f5f5] px-1 py-px rounded">
                    {grpTotal}건
                  </span>
                  <span className="text-[9px] text-[#ccc]">{collapsed ? "▶" : "▼"}</span>
                </div>
                {editMode && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(name); }}
                    className="text-[9px] text-[#ccc] hover:text-[#e53935] px-1 py-px rounded hover:bg-[#fff0f0] transition-colors"
                  >
                    🗑️ 삭제
                  </button>
                )}
              </div>

              {!collapsed && (
                <div className="px-2 pb-1.5 pt-0.5">
                  <RuleColumns section={section} group={name} ruleSet={rs} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
