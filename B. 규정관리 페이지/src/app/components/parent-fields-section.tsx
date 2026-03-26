import { useState } from "react";
import type { RuleField, RuleItem } from "./rule-data";

/* ====== Inline styled type indicators ====== */
function TypeIndicator({ type }: { type: RuleField["fieldType"] }) {
  if (type === "radio") {
    return (
      <span className="inline-flex items-center justify-center w-[10px] h-[10px] rounded-full border border-gray-400 shrink-0" title="단일선택">
        <span className="w-[4px] h-[4px] rounded-full bg-gray-400" />
      </span>
    );
  }
  if (type === "checkbox") {
    return (
      <span className="inline-flex items-center justify-center w-[10px] h-[10px] rounded-[2px] border border-gray-400 shrink-0" title="다중선택">
        <span className="text-[7px] text-gray-400 leading-none">✓</span>
      </span>
    );
  }
  return (
    <span className="inline-block w-[10px] h-[4px] rounded-full bg-gray-300 shrink-0" title="태그" />
  );
}

const FIELD_TYPE_LABELS: Record<RuleField["fieldType"], string> = {
  tags: "태그",
  radio: "단일선택",
  checkbox: "다중선택",
};

interface ParentFieldsSectionProps {
  fields: RuleField[];
  onItemUpdate: (fieldId: string, itemId: string, value: string) => void;
  onItemToggle: (fieldId: string, itemId: string) => void;
  onItemAdd: (fieldId: string, value: string) => void;
  onItemDelete: (fieldId: string, itemId: string) => void;
  onFieldAdd?: (label: string, fieldType: RuleField["fieldType"]) => void;
  onFieldDelete?: (fieldId: string) => void;
  onFieldRename?: (fieldId: string, newLabel: string) => void;
}

export function ParentFieldsSection({
  fields,
  onItemUpdate,
  onItemToggle,
  onItemAdd,
  onItemDelete,
  onFieldAdd,
  onFieldDelete,
  onFieldRename,
}: ParentFieldsSectionProps) {
  const [isAddingField, setIsAddingField] = useState(false);
  const [newFieldLabel, setNewFieldLabel] = useState("");
  const [newFieldType, setNewFieldType] = useState<RuleField["fieldType"]>("tags");

  const totalItems = fields.reduce((acc, f) => acc + f.items.length, 0);

  const handleAddField = () => {
    const trimmed = newFieldLabel.trim();
    if (trimmed && onFieldAdd) {
      onFieldAdd(trimmed, newFieldType);
      setNewFieldLabel("");
      setNewFieldType("tags");
      setIsAddingField(false);
    }
  };

  const handleAddFieldKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleAddField();
    else if (e.key === "Escape") { setNewFieldLabel(""); setIsAddingField(false); }
  };

  return (
    <div className="border border-gray-200 rounded-md overflow-hidden">
      {/* Header */}
      <div className="bg-[#f4f4f5] border-b border-gray-200 px-2 py-1 flex items-center justify-between">
        <span className="text-[12px] text-black" style={{ fontWeight: 600 }}>공통 항목</span>
        <span className="text-[10px] text-gray-400">{fields.length}·{totalItems}</span>
      </div>

      {/* Fields */}
      <div className="divide-y divide-gray-100 bg-white">
        {fields.map((field) => (
          <ParentFieldRow
            key={field.id}
            field={field}
            onItemUpdate={onItemUpdate}
            onItemToggle={onItemToggle}
            onItemAdd={onItemAdd}
            onItemDelete={onItemDelete}
            onFieldDelete={onFieldDelete}
            onFieldRename={onFieldRename}
          />
        ))}

        {isAddingField ? (
          <div className="px-2 py-1.5 space-y-1">
            {/* Type selector */}
            <div className="flex items-center gap-0.5">
              {(["tags", "radio", "checkbox"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setNewFieldType(t)}
                  className={`flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md border transition-colors ${
                    newFieldType === t
                      ? "border-black bg-black text-white"
                      : "border-gray-200 text-gray-500 hover:bg-[#f4f4f5]"
                  }`}
                  style={{ height: 20 }}
                >
                  <TypeIndicator type={t} />
                  {FIELD_TYPE_LABELS[t]}
                </button>
              ))}
            </div>
            {/* Label input */}
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={newFieldLabel}
                onChange={(e) => setNewFieldLabel(e.target.value)}
                onKeyDown={handleAddFieldKeyDown}
                autoFocus
                placeholder="항목명"
                className="text-[12px] px-1.5 py-0.5 border border-gray-200 rounded-md bg-white focus:outline-none focus:border-black w-[100px]"
                style={{ height: 28 }}
              />
              <button onClick={handleAddField} className="text-[10px] text-black px-1.5 py-0.5 border border-gray-200 rounded-md hover:bg-[#f4f4f5]" style={{ height: 24 }}>확인</button>
              <button onClick={() => { setIsAddingField(false); setNewFieldLabel(""); }} className="text-[10px] text-gray-400 px-1 py-0.5 hover:text-black" style={{ height: 24 }}>취소</button>
            </div>
          </div>
        ) : (
          onFieldAdd && (
            <button
              onClick={() => setIsAddingField(true)}
              className="w-full text-center text-[10px] text-gray-400 py-1 hover:bg-[#f4f4f5] hover:text-black transition-colors"
            >
              +
            </button>
          )
        )}
      </div>
    </div>
  );
}

function ParentFieldRow({
  field,
  onItemUpdate,
  onItemToggle,
  onItemAdd,
  onItemDelete,
  onFieldDelete,
  onFieldRename,
}: {
  field: RuleField;
  onItemUpdate: (fieldId: string, itemId: string, value: string) => void;
  onItemToggle: (fieldId: string, itemId: string) => void;
  onItemAdd: (fieldId: string, value: string) => void;
  onItemDelete: (fieldId: string, itemId: string) => void;
  onFieldDelete?: (fieldId: string) => void;
  onFieldRename?: (fieldId: string, newLabel: string) => void;
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [newValue, setNewValue] = useState("");
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [editLabel, setEditLabel] = useState(field.label);
  const [isItemsExpanded, setIsItemsExpanded] = useState(false);

  const COLLAPSE_THRESHOLD = 4;
  const PREVIEW_COUNT = 3;
  const shouldCollapse = field.items.length >= COLLAPSE_THRESHOLD && !isItemsExpanded;
  const visibleItems = shouldCollapse ? field.items.slice(0, PREVIEW_COUNT) : field.items;
  const hiddenCount = field.items.length - PREVIEW_COUNT;

  const handleAdd = () => {
    const trimmed = newValue.trim();
    if (trimmed) { onItemAdd(field.id, trimmed); setNewValue(""); setIsAdding(false); }
  };

  const handleAddKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleAdd();
    else if (e.key === "Escape") { setNewValue(""); setIsAdding(false); }
  };

  const handleRenameSubmit = () => {
    const trimmed = editLabel.trim();
    if (trimmed && trimmed !== field.label && onFieldRename) onFieldRename(field.id, trimmed);
    setIsEditingLabel(false);
  };

  const handleRenameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleRenameSubmit();
    else if (e.key === "Escape") { setEditLabel(field.label); setIsEditingLabel(false); }
  };

  const handleRadioSelect = (itemId: string) => {
    field.items.forEach((item) => {
      if (item.id === itemId && !item.enabled) {
        onItemToggle(field.id, item.id);
      } else if (item.id !== itemId && item.enabled) {
        onItemToggle(field.id, item.id);
      }
    });
  };

  return (
    <div className="flex group/field">
      <div className="shrink-0 px-1.5 py-1.5 text-[12px] text-gray-500 bg-[#fafafa] border-r border-gray-100 flex items-start gap-1 whitespace-nowrap">
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
            <span className="mt-[3px]"><TypeIndicator type={field.fieldType} /></span>
            <span
              className="flex-1 cursor-default"
              onDoubleClick={() => { if (onFieldRename) { setEditLabel(field.label); setIsEditingLabel(true); } }}
              title="더블클릭하여 수정"
            >
              {field.label}
            </span>
            <div className="flex items-center opacity-0 group-hover/field:opacity-100 transition-opacity shrink-0">
              {onFieldRename && (
                <button onClick={() => { setEditLabel(field.label); setIsEditingLabel(true); }} className="p-0.5 rounded hover:bg-gray-200 text-[9px] text-gray-400 hover:text-black">
                  수정
                </button>
              )}
              {onFieldDelete && (
                <button onClick={() => onFieldDelete(field.id)} className="p-0.5 rounded hover:bg-red-50 text-[9px] text-gray-400 hover:text-red-500">
                  ×
                </button>
              )}
            </div>
          </>
        )}
      </div>

      <div className="flex-1 px-1.5 py-1 flex flex-wrap items-center gap-1 min-h-[28px]">
        {field.fieldType === "radio" && visibleItems.map((item) => (
          <PRadioItem
            key={item.id}
            item={item}
            onSelect={() => handleRadioSelect(item.id)}
            onUpdate={(value) => onItemUpdate(field.id, item.id, value)}
            onDelete={() => onItemDelete(field.id, item.id)}
          />
        ))}

        {field.fieldType === "checkbox" && visibleItems.map((item) => (
          <PCheckboxItem
            key={item.id}
            item={item}
            onToggle={() => onItemToggle(field.id, item.id)}
            onUpdate={(value) => onItemUpdate(field.id, item.id, value)}
            onDelete={() => onItemDelete(field.id, item.id)}
          />
        ))}

        {field.fieldType === "tags" && visibleItems.map((item) => (
          <PTagItem
            key={item.id}
            item={item}
            onUpdate={(value) => onItemUpdate(field.id, item.id, value)}
            onToggle={() => onItemToggle(field.id, item.id)}
            onDelete={() => onItemDelete(field.id, item.id)}
          />
        ))}

        {shouldCollapse && (
          <button
            onClick={() => setIsItemsExpanded(true)}
            className="text-[9px] text-gray-500 hover:text-black px-1 rounded hover:bg-[#f4f4f5]"
          >
            {hiddenCount}개 더보기
          </button>
        )}

        {isItemsExpanded && field.items.length >= COLLAPSE_THRESHOLD && (
          <button
            onClick={() => setIsItemsExpanded(false)}
            className="text-[9px] text-gray-500 hover:text-black px-1 rounded hover:bg-[#f4f4f5]"
          >
            접기
          </button>
        )}

        {isAdding ? (
          <div className="flex items-center gap-0.5">
            <input
              type="text"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              onKeyDown={handleAddKeyDown}
              onBlur={() => { if (!newValue.trim()) setIsAdding(false); }}
              autoFocus
              placeholder="값 입력"
              className="text-[12px] px-1.5 py-0.5 border border-gray-200 rounded-md bg-white focus:outline-none focus:border-black w-[90px]"
              style={{ height: 24 }}
            />
            <button onClick={handleAdd} className="text-[9px] text-gray-500 hover:text-black px-1 rounded hover:bg-[#f4f4f5]">확인</button>
            <button onClick={() => { setIsAdding(false); setNewValue(""); }} className="text-[9px] text-gray-400 hover:text-black px-0.5 rounded hover:bg-[#f4f4f5]">취소</button>
          </div>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="text-[10px] text-gray-400 border border-dashed border-gray-300 rounded-md px-1.5 py-0 hover:bg-[#f4f4f5] hover:text-black transition-colors"
            style={{ height: 22 }}
          >
            +
          </button>
        )}
      </div>
    </div>
  );
}

/* ====== Shared edit input ====== */
function EditInput({ value, onSubmit, onCancel }: { value: string; onSubmit: (v: string) => void; onCancel: () => void }) {
  const [v, setV] = useState(value);
  const handle = () => { const t = v.trim(); if (t && t !== value) onSubmit(t); onCancel(); };
  return (
    <div className="flex items-center border border-gray-300 rounded-md bg-[#f4f4f5]" style={{ height: 22 }}>
      <input type="text" value={v} onChange={(e) => setV(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") handle(); else if (e.key === "Escape") onCancel(); }}
        onBlur={handle} autoFocus
        className="text-[12px] px-1.5 py-0 bg-transparent focus:outline-none w-[90px] min-w-0" />
      <button onClick={handle} className="px-1 text-[9px] text-gray-500 hover:text-black hover:bg-white/50 rounded-r">확인</button>
    </div>
  );
}

/* ====== Radio Item ====== */
function PRadioItem({ item, onSelect, onUpdate, onDelete }: {
  item: RuleItem; onSelect: () => void; onUpdate: (v: string) => void; onDelete: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  if (isEditing) return <EditInput value={item.value} onSubmit={onUpdate} onCancel={() => setIsEditing(false)} />;

  return (
    <div
      className={`group/chip flex items-center gap-1 border rounded-md text-[12px] px-1.5 transition-all cursor-pointer ${
        item.enabled ? "border-black bg-black text-white" : "border-gray-300 text-gray-600 bg-white hover:bg-[#f4f4f5]"
      }`}
      style={{ height: 22 }}
      onClick={onSelect}
    >
      <span className={`flex items-center justify-center w-[10px] h-[10px] rounded-full border shrink-0 ${item.enabled ? "border-white" : "border-gray-400"}`}>
        {item.enabled && <span className="w-[4px] h-[4px] rounded-full bg-white" />}
      </span>
      <span className="cursor-pointer select-none" onDoubleClick={(e) => { e.stopPropagation(); setIsEditing(true); }} title="더블클릭하여 수정">{item.value}</span>
      <div className="flex items-center gap-0.5 opacity-0 group-hover/chip:opacity-100 transition-opacity">
        <button onClick={(e) => { e.stopPropagation(); setIsEditing(true); }} className={`p-0 rounded text-[9px] ${item.enabled ? "text-white/60 hover:text-white" : "text-gray-400 hover:text-black"}`}>수정</button>
        <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className={`p-0 rounded text-[9px] ${item.enabled ? "text-white/60 hover:text-red-300" : "text-gray-400 hover:text-red-500"}`}>×</button>
      </div>
    </div>
  );
}

/* ====== Checkbox Item ====== */
function PCheckboxItem({ item, onToggle, onUpdate, onDelete }: {
  item: RuleItem; onToggle: () => void; onUpdate: (v: string) => void; onDelete: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  if (isEditing) return <EditInput value={item.value} onSubmit={onUpdate} onCancel={() => setIsEditing(false)} />;

  return (
    <div
      className={`group/chip flex items-center gap-1 border rounded-md text-[12px] px-1.5 transition-all cursor-pointer ${
        item.enabled ? "border-gray-400 text-black bg-[#f4f4f5]" : "border-gray-200 text-gray-400 bg-white hover:bg-[#f4f4f5]"
      }`}
      style={{ height: 22 }}
      onClick={onToggle}
    >
      <span className={`flex items-center justify-center w-[10px] h-[10px] rounded-[2px] border shrink-0 ${item.enabled ? "border-black bg-black" : "border-gray-300 bg-white"}`}>
        {item.enabled && <span className="text-[7px] text-white leading-none">✓</span>}
      </span>
      <span className={`cursor-pointer select-none ${!item.enabled ? "line-through" : ""}`} onDoubleClick={(e) => { e.stopPropagation(); setIsEditing(true); }} title="더블클릭하여 수정">{item.value}</span>
      <div className="flex items-center gap-0.5 opacity-0 group-hover/chip:opacity-100 transition-opacity">
        <button onClick={(e) => { e.stopPropagation(); setIsEditing(true); }} className="p-0 rounded text-[9px] text-gray-400 hover:text-black">수정</button>
        <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-0 rounded text-[9px] text-gray-400 hover:text-red-500">×</button>
      </div>
    </div>
  );
}

/* ====== Tag Item ====== */
function PTagItem({ item, onUpdate, onToggle, onDelete }: {
  item: RuleItem; onUpdate: (v: string) => void; onToggle: () => void; onDelete: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  if (isEditing) return <EditInput value={item.value} onSubmit={onUpdate} onCancel={() => setIsEditing(false)} />;

  return (
    <div
      className={`group/chip flex items-center gap-1 border rounded-md text-[12px] px-1.5 transition-all ${
        item.enabled ? "border-gray-300 text-black bg-white" : "border-gray-200 text-gray-400 bg-[#f4f4f5]"
      }`}
      style={{ height: 22 }}
    >
      <button
        onClick={onToggle}
        className={`w-2 h-2 rounded-full shrink-0 transition-colors border ${item.enabled ? "bg-black border-black" : "bg-white border-gray-300"}`}
        title={item.enabled ? "비활성화" : "활성화"}
      />
      <span className={`cursor-default select-none ${!item.enabled ? "line-through" : ""}`} onDoubleClick={() => setIsEditing(true)} title="더블클릭하여 수정">{item.value}</span>
      <div className="flex items-center gap-0.5 opacity-0 group-hover/chip:opacity-100 transition-opacity">
        <button onClick={() => setIsEditing(true)} className="p-0 rounded text-[9px] text-gray-400 hover:text-black">수정</button>
        <button onClick={onDelete} className="p-0 rounded text-[9px] text-gray-400 hover:text-red-500">×</button>
      </div>
    </div>
  );
}