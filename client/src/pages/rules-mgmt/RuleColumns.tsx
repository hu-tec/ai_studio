import React, { useState, useRef } from "react";
import { Paperclip, Trash2, X } from "lucide-react";
import { useRules, ALL_TEAMS, type RuleItem, type RuleType, type RuleSet, type SectionName } from "./RulesContext";

interface RuleColumnsProps {
  section: SectionName;
  group: string | null;
  ruleSet: RuleSet;
}

/* ─── Single Rule Card ─── */
function RuleCard({
  item,
  section,
  group,
  type,
}: {
  item: RuleItem;
  section: SectionName;
  group: string | null;
  type: RuleType;
}) {
  const { editMode, deleteRule, updateRule, updateRuleTeams, addAttachment } = useRules();
  const fileRef = useRef<HTMLInputElement>(null);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateRule(section, group, type, item.id, e.target.value);
  };

  const handleTeamToggle = (team: string) => {
    const next = item.teams.includes(team)
      ? item.teams.filter((t) => t !== team)
      : [...item.teams, team];
    updateRuleTeams(section, group, type, item.id, next);
  };

  const handleFileSelect = () => {
    fileRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      addAttachment(section, group, type, item.id, f.name);
      e.target.value = "";
    }
  };

  const handleDelete = () => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    deleteRule(section, group, type, item.id);
  };

  return (
    <div className="border border-[#e0e0e0] rounded bg-white hover:shadow-sm transition-shadow">
      {/* Text + Action Row */}
      <div className="flex items-start gap-1 px-1.5 py-1">
        <textarea
          value={item.text}
          onChange={handleTextChange}
          readOnly={!editMode}
          rows={2}
          className={`flex-1 min-w-0 px-1 py-0.5 text-[11px] text-[#333] resize-none outline-none rounded transition-colors ${
            editMode
              ? "bg-white border border-[#e0e0e0] focus:border-[#666] cursor-text"
              : "bg-transparent cursor-default"
          }`}
          style={{ fontWeight: 400, lineHeight: 1.45 }}
        />
        {editMode && (
          <div className="flex flex-col gap-0.5 shrink-0">
            <button
              onClick={handleFileSelect}
              className="p-0.5 text-[#bbb] hover:text-[#666] hover:bg-[#f0f0f0] rounded transition-colors"
              title="첨부파일"
            >
              <Paperclip size={11} />
            </button>
            <button
              onClick={handleDelete}
              className="p-0.5 text-[#bbb] hover:text-[#e53935] hover:bg-[#fff0f0] rounded transition-colors"
              title="삭제 (확인 후)"
            >
              <Trash2 size={11} />
            </button>
            <input ref={fileRef} type="file" className="hidden" onChange={handleFileChange} />
          </div>
        )}
      </div>

      {/* Attachments (always visible) */}
      {item.attachments.length > 0 && (
        <div className="px-1.5 py-0.5 border-t border-[#f0f0f0] flex flex-wrap gap-0.5">
          {item.attachments.map((a, i) => (
            <span key={i} className="inline-flex items-center gap-0.5 px-1 py-px bg-[#f5f5f5] rounded text-[9px] text-[#666]">
              📎 {a}
            </span>
          ))}
        </div>
      )}

      {/* Team Chips — always visible (no hidden toggle) */}
      <div className="px-1.5 py-1 border-t border-[#f0f0f0] flex flex-wrap gap-0.5 items-center">
        <span className="text-[9px] text-[#aaa] mr-0.5">팀:</span>
        {ALL_TEAMS.map((team) => {
          const active = item.teams.includes(team);
          return (
            <button
              key={team}
              type="button"
              onClick={() => editMode && handleTeamToggle(team)}
              disabled={!editMode}
              className={`px-1 py-px rounded-full text-[9px] border transition-colors ${
                active
                  ? "bg-[#e8f0fe] text-[#1a73e8] border-[#cfe1fc]"
                  : "bg-white text-[#bbb] border-[#eee] line-through"
              } ${editMode ? "cursor-pointer hover:border-[#999]" : "cursor-default opacity-80"}`}
            >
              {team}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Column Block ─── */
function ColumnBlock({
  type,
  items,
  section,
  group,
}: {
  type: RuleType;
  items: RuleItem[];
  section: SectionName;
  group: string | null;
}) {
  const { editMode, addRule, selectedTeam, searchQuery } = useRules();
  const [adding, setAdding] = useState(false);
  const [newText, setNewText] = useState("");

  // Filter items by selected team + search query
  const q = searchQuery.trim().toLowerCase();
  const filteredItems = items.filter((item) => {
    if (selectedTeam && !item.teams.includes(selectedTeam)) return false;
    if (q && !item.text.toLowerCase().includes(q)) return false;
    return true;
  });

  const headerStyles: Record<RuleType, { bg: string; text: string; border: string; label: string; sub: string }> = {
    규정: {
      bg: "bg-[#eef0f4]",
      text: "text-[#3a3f4b]",
      border: "border-[#d5d9e2]",
      label: "📋 규정",
      sub: "고정",
    },
    준규정: {
      bg: "bg-[#f0efe8]",
      text: "text-[#5a5540]",
      border: "border-[#ddd8c8]",
      label: "📝 준규정",
      sub: "준고정",
    },
    선택사항: {
      bg: "bg-[#eef5ee]",
      text: "text-[#3a5a3a]",
      border: "border-[#c8dcc8]",
      label: "✅ 선택사항",
      sub: "선택",
    },
  };

  const h = headerStyles[type];

  const handleAdd = () => {
    if (newText.trim()) {
      addRule(section, group, type, newText.trim());
      setNewText("");
      setAdding(false);
    }
  };

  return (
    <div className={`border ${h.border} rounded overflow-hidden flex flex-col`}>
      {/* Column Header */}
      <div className={`${h.bg} ${h.text} px-1.5 py-1 flex items-center justify-between border-b ${h.border}`}>
        <div className="flex items-center gap-1">
          <span className="text-[11px] font-semibold">{h.label}</span>
          <span className="text-[9px] opacity-60">{h.sub}</span>
        </div>
        <span className="text-[9px] opacity-70 font-medium">{filteredItems.length}건</span>
      </div>

      {/* Items */}
      <div className="flex-1 bg-[#fafafa] p-1 space-y-1">
        {filteredItems.length === 0 && !adding && (
          <div className="py-2 text-center text-[10px] text-[#ccc]">항목 없음</div>
        )}
        {filteredItems.map((item) => (
          <RuleCard key={item.id} item={item} section={section} group={group} type={type} />
        ))}

        {/* Add new item */}
        {editMode && (
          <>
            {adding ? (
              <div className="border border-dashed border-[#ccc] rounded p-1 bg-white">
                <textarea
                  autoFocus
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleAdd(); }
                    if (e.key === "Escape") { setNewText(""); setAdding(false); }
                  }}
                  placeholder="새 항목 (Enter=추가, Esc=취소)"
                  rows={2}
                  className="w-full text-[11px] text-[#333] border border-[#ddd] rounded px-1 py-0.5 outline-none focus:border-[#999] resize-none bg-white"
                />
                <div className="flex items-center gap-1 mt-0.5">
                  <button
                    onClick={handleAdd}
                    className="text-[10px] text-white bg-[#444] px-1.5 py-0.5 rounded hover:bg-[#666] transition-colors"
                  >
                    추가
                  </button>
                  <button
                    onClick={() => { setNewText(""); setAdding(false); }}
                    className="text-[10px] text-[#999] px-1 py-0.5 rounded hover:bg-[#f0f0f0] transition-colors"
                  >
                    취소
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setAdding(true)}
                className="w-full text-center py-1 text-[10px] text-[#bbb] hover:text-[#666] border border-dashed border-[#ddd] hover:border-[#aaa] rounded bg-white hover:bg-[#fafafa] transition-colors"
              >
                + 새 항목
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export function RuleColumns({ section, group, ruleSet }: RuleColumnsProps) {
  const types: RuleType[] = ["규정", "준규정", "선택사항"];
  return (
    <div className="grid grid-cols-3 gap-1.5">
      {types.map((type) => (
        <ColumnBlock key={type} type={type} items={ruleSet[type]} section={section} group={group} />
      ))}
    </div>
  );
}
