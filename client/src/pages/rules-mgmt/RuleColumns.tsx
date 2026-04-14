import React, { useState, useRef } from "react";
import { Paperclip, Trash2 } from "lucide-react";
import { useRules, ALL_TEAMS, type RuleItem, type RuleType, type RuleSet, type SectionName } from "./RulesContext";

interface RuleColumnsProps {
  section: SectionName;
  group: string | null;
  ruleSet: RuleSet;
}

/* ─── Single Rule Card (Form-style) ─── */
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
  const [showTeams, setShowTeams] = useState(false);
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

  return (
    <div className="border border-[#e0e0e0] rounded-md bg-white hover:shadow-sm transition-shadow">
      {/* Text Area */}
      <div className="relative">
        <textarea
          value={item.text}
          onChange={handleTextChange}
          readOnly={!editMode}
          rows={2}
          className={`w-full px-3 py-2.5 text-[12px] text-[#333] resize-none outline-none rounded-t-md transition-colors ${
            editMode
              ? "bg-white border-b border-[#e0e0e0] focus:border-[#999] cursor-text"
              : "bg-[#fafafa] cursor-default"
          }`}
          style={{ fontWeight: 400, lineHeight: 1.6 }}
        />
        {/* Action Icons */}
        <div className="absolute top-2 right-2 flex items-center gap-1">
          {editMode && (
            <>
              <button
                onClick={handleFileSelect}
                className="p-1 text-[#bbb] hover:text-[#666] hover:bg-[#f0f0f0] rounded transition-colors"
                title="첨부파일"
              >
                <Paperclip size={13} />
              </button>
              <button
                onClick={() => deleteRule(section, group, type, item.id)}
                className="p-1 text-[#bbb] hover:text-[#e53935] hover:bg-[#fff0f0] rounded transition-colors"
                title="삭제"
              >
                <Trash2 size={13} />
              </button>
            </>
          )}
          <input ref={fileRef} type="file" className="hidden" onChange={handleFileChange} />
        </div>
      </div>

      {/* Attachments (if any) */}
      {item.attachments.length > 0 && (
        <div className="px-3 py-1.5 border-b border-[#f0f0f0] flex flex-wrap gap-1">
          {item.attachments.map((a, i) => (
            <span key={i} className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-[#f5f5f5] rounded text-[10px] text-[#666]" style={{ fontWeight: 400 }}>
              📎 {a}
            </span>
          ))}
        </div>
      )}

      {/* Team Checkboxes */}
      <div className="px-3 py-1.5">
        <button
          onClick={() => setShowTeams(!showTeams)}
          className="text-[10px] text-[#999] hover:text-[#555] transition-colors"
          style={{ fontWeight: 500 }}
        >
          🏷️ 적용 팀 ({item.teams.length}/{ALL_TEAMS.length}) {showTeams ? "▲" : "▼"}
        </button>
        {showTeams && (
          <div className="mt-1.5 flex flex-wrap gap-x-1 gap-y-1">
            {ALL_TEAMS.map((team) => (
              <label
                key={team}
                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] cursor-pointer transition-colors ${
                  item.teams.includes(team)
                    ? "bg-[#e8f0fe] text-[#1a73e8]"
                    : "bg-[#f5f5f5] text-[#aaa]"
                } ${editMode ? "hover:bg-[#e0e7ff]" : ""}`}
                style={{ fontWeight: 400 }}
              >
                <input
                  type="checkbox"
                  checked={item.teams.includes(team)}
                  onChange={() => handleTeamToggle(team)}
                  disabled={!editMode}
                  className="w-3 h-3 accent-[#1a73e8]"
                />
                {team}
              </label>
            ))}
          </div>
        )}
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
  const { editMode, addRule, selectedTeam } = useRules();
  const [adding, setAdding] = useState(false);
  const [newText, setNewText] = useState("");

  // Filter items by selected team
  const filteredItems = selectedTeam
    ? items.filter((item) => item.teams.includes(selectedTeam))
    : items;

  const headerStyles: Record<RuleType, { bg: string; text: string; border: string; label: string; sub: string; emoji: string }> = {
    규정: {
      bg: "bg-[#eef0f4]",
      text: "text-[#3a3f4b]",
      border: "border-[#d5d9e2]",
      label: "📋 규정",
      sub: "고정 (변경금지)",
      emoji: "🔒",
    },
    준규정: {
      bg: "bg-[#f0efe8]",
      text: "text-[#5a5540]",
      border: "border-[#ddd8c8]",
      label: "📝 준규정",
      sub: "준고정 (조건부변경가능)",
      emoji: "🔑",
    },
    선택사항: {
      bg: "bg-[#eef5ee]",
      text: "text-[#3a5a3a]",
      border: "border-[#c8dcc8]",
      label: "✅ 선택사항",
      sub: "선택고정 (언제든변경가능)",
      emoji: "✨",
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
    <div className={`border ${h.border} rounded-lg overflow-hidden flex flex-col`}>
      {/* Column Header */}
      <div className={`${h.bg} ${h.text} px-3 py-2.5 flex items-center justify-between border-b ${h.border}`}>
        <div>
          <span className="text-[13px]" style={{ fontWeight: 600 }}>
            {h.label}
          </span>
          <span className="text-[10px] ml-1.5 opacity-60" style={{ fontWeight: 400 }}>
            {h.sub}
          </span>
        </div>
        <span className="text-[11px] opacity-50" style={{ fontWeight: 500 }}>
          {filteredItems.length}건
        </span>
      </div>

      {/* Items */}
      <div className="flex-1 bg-[#fafafa] p-2 space-y-2">
        {filteredItems.length === 0 && !adding && (
          <div className="py-6 text-center text-[11px] text-[#ccc]" style={{ fontWeight: 400 }}>
            등록된 항목이 없습니다
          </div>
        )}
        {filteredItems.map((item) => (
          <RuleCard key={item.id} item={item} section={section} group={group} type={type} />
        ))}

        {/* Add new item */}
        {editMode && (
          <>
            {adding ? (
              <div className="border border-dashed border-[#ccc] rounded-md p-2 bg-white">
                <textarea
                  autoFocus
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleAdd(); }
                    if (e.key === "Escape") { setNewText(""); setAdding(false); }
                  }}
                  placeholder="새 항목을 입력하세요... (Enter로 추가, Esc로 취소)"
                  rows={2}
                  className="w-full text-[12px] text-[#333] border border-[#ddd] rounded px-2 py-1.5 outline-none focus:border-[#999] resize-none bg-white"
                  style={{ fontWeight: 400, lineHeight: 1.5 }}
                />
                <div className="flex items-center gap-2 mt-1.5">
                  <button
                    onClick={handleAdd}
                    className="text-[11px] text-white bg-[#444] px-3 py-1 rounded hover:bg-[#666] transition-colors"
                    style={{ fontWeight: 500 }}
                  >
                    ✅ 추가
                  </button>
                  <button
                    onClick={() => { setNewText(""); setAdding(false); }}
                    className="text-[11px] text-[#999] px-2 py-1 rounded hover:bg-[#f0f0f0] transition-colors"
                    style={{ fontWeight: 500 }}
                  >
                    취소
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setAdding(true)}
                className="w-full text-center py-2 text-[11px] text-[#bbb] hover:text-[#666] border border-dashed border-[#ddd] hover:border-[#aaa] rounded-md bg-white hover:bg-[#fafafa] transition-colors"
                style={{ fontWeight: 500 }}
              >
                ➕ 새 항목 추가
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
    <div className="grid grid-cols-3 gap-3">
      {types.map((type) => (
        <ColumnBlock key={type} type={type} items={ruleSet[type]} section={section} group={group} />
      ))}
    </div>
  );
}