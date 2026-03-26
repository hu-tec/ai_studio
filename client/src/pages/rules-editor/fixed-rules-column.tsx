import { useState } from "react";
import type { FieldEntry } from "./rule-data";
import { EditableField } from "./editable-field";

interface FixedRulesColumnProps {
  fields: FieldEntry[];
  onUpdate: (id: string, value: string) => void;
  onAddField?: (label: string, value: string) => void;
  onDeleteField?: (id: string) => void;
  onRenameField?: (id: string, newLabel: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export function FixedRulesColumn({
  fields,
  onUpdate,
  onAddField,
  onDeleteField,
  onRenameField,
  isOpen,
  onToggle,
}: FixedRulesColumnProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newValue, setNewValue] = useState("");

  const handleAdd = () => {
    const trimmedLabel = newLabel.trim();
    if (trimmedLabel && onAddField) {
      onAddField(trimmedLabel, newValue.trim() || "");
      setNewLabel("");
      setNewValue("");
      setIsAdding(false);
    }
  };

  const handleAddKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleAdd();
    else if (e.key === "Escape") { setNewLabel(""); setNewValue(""); setIsAdding(false); }
  };

  return (
    <div className="border border-gray-200 rounded-md overflow-hidden">
      {/* Header — clickable toggle */}
      <button
        onClick={onToggle}
        className="w-full bg-[#f4f4f5] border-b border-gray-200 px-2.5 py-1.5 flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-gray-400">{isOpen ? "▾" : "▸"}</span>
          <span className="text-[12px] text-black" style={{ fontWeight: 600 }}>① 고정 규정</span>
        </div>
        <span className="text-[10px] text-gray-400">{fields.length}개 항목</span>
      </button>

      {/* Content */}
      {isOpen && (
        <div className="bg-white divide-y divide-gray-100">
          {fields.map((field) => (
            <FieldCell
              key={field.id}
              field={field}
              onUpdate={onUpdate}
              onDeleteField={onDeleteField}
              onRenameField={onRenameField}
            />
          ))}

          {isAdding ? (
            <div className="flex flex-col p-1.5 gap-1 bg-[#f4f4f5]">
              <input
                type="text"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                onKeyDown={handleAddKeyDown}
                autoFocus
                placeholder="항목명"
                className="text-[12px] px-1.5 py-0.5 border border-gray-200 rounded-md bg-white focus:outline-none focus:border-black w-full"
                style={{ height: 28 }}
              />
              <input
                type="text"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                onKeyDown={handleAddKeyDown}
                placeholder="값"
                className="text-[12px] px-1.5 py-0.5 border border-gray-200 rounded-md bg-white focus:outline-none focus:border-black w-full"
                style={{ height: 28 }}
              />
              <div className="flex items-center gap-1">
                <button onClick={handleAdd} className="text-[10px] text-black px-1.5 py-0.5 border border-gray-200 rounded-md hover:bg-white transition-colors" style={{ height: 24 }}>추가</button>
                <button onClick={() => { setIsAdding(false); setNewLabel(""); setNewValue(""); }} className="text-[10px] text-gray-400 px-1.5 py-0.5 hover:text-black transition-colors" style={{ height: 24 }}>취소</button>
              </div>
            </div>
          ) : (
            onAddField && (
              <button
                onClick={() => setIsAdding(true)}
                className="w-full flex items-center justify-center gap-1 text-[12px] text-gray-400 py-2 hover:bg-[#f4f4f5] hover:text-black transition-colors"
              >
                +
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}

function FieldCell({
  field,
  onUpdate,
  onDeleteField,
  onRenameField,
}: {
  field: FieldEntry;
  onUpdate: (id: string, value: string) => void;
  onDeleteField?: (id: string) => void;
  onRenameField?: (id: string, newLabel: string) => void;
}) {
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [editLabel, setEditLabel] = useState(field.label);

  const handleRenameSubmit = () => {
    const trimmed = editLabel.trim();
    if (trimmed && trimmed !== field.label && onRenameField) onRenameField(field.id, trimmed);
    setIsEditingLabel(false);
  };

  const handleRenameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleRenameSubmit();
    else if (e.key === "Escape") { setEditLabel(field.label); setIsEditingLabel(false); }
  };

  return (
    <div className="flex border-b border-gray-100 group/cell hover:bg-[#f4f4f5] transition-colors">
      {/* Label */}
      <div className="px-1.5 py-1.5 text-[12px] text-gray-500 whitespace-nowrap shrink-0 border-r border-gray-100 flex items-start gap-0.5">
        {isEditingLabel ? (
          <input
            type="text"
            value={editLabel}
            onChange={(e) => setEditLabel(e.target.value)}
            onKeyDown={handleRenameKeyDown}
            onBlur={handleRenameSubmit}
            autoFocus
            className="w-full text-[12px] px-1 py-0 border border-gray-300 rounded-md bg-white focus:outline-none focus:border-black"
          />
        ) : (
          <>
            <span
              className="flex-1 cursor-default"
              onDoubleClick={() => { if (onRenameField) { setEditLabel(field.label); setIsEditingLabel(true); } }}
              title="더블클릭하여 수정"
            >
              {field.label}
            </span>
            <div className="flex items-center opacity-0 group-hover/cell:opacity-100 transition-opacity shrink-0">
              {onRenameField && (
                <button onClick={() => { setEditLabel(field.label); setIsEditingLabel(true); }} className="p-0.5 rounded hover:bg-gray-200 text-[10px] text-gray-400 hover:text-black" title="수정">
                  수정
                </button>
              )}
              {onDeleteField && (
                <button onClick={() => onDeleteField(field.id)} className="p-0.5 rounded hover:bg-red-50 text-[10px] text-gray-400 hover:text-red-500" title="삭제">
                  ×
                </button>
              )}
            </div>
          </>
        )}
      </div>
      {/* Value */}
      <div className="flex-1 px-1 py-0.5 min-w-0">
        <EditableField field={field} onUpdate={onUpdate} />
      </div>
    </div>
  );
}
