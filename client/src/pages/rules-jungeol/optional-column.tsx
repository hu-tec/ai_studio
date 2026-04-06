import type { RuleField } from "./rule-data";
import { ParentFieldsSection } from "./parent-fields-section";

interface OptionalColumnProps {
  parentFields: RuleField[];
  isSubRulesOpen: boolean;
  onToggleSubRules: () => void;
  totalParentItems: number;
  totalSubItems: number;
  onParentItemUpdate: (fieldId: string, itemId: string, value: string) => void;
  onParentItemToggle: (fieldId: string, itemId: string) => void;
  onParentItemAdd: (fieldId: string, value: string) => void;
  onParentItemDelete: (fieldId: string, itemId: string) => void;
  onParentFieldAdd?: (label: string, fieldType: RuleField["fieldType"]) => void;
  onParentFieldDelete?: (fieldId: string) => void;
  onParentFieldRename?: (fieldId: string, newLabel: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export function OptionalColumn({
  parentFields,
  isSubRulesOpen,
  onToggleSubRules,
  totalParentItems,
  totalSubItems,
  onParentItemUpdate,
  onParentItemToggle,
  onParentItemAdd,
  onParentItemDelete,
  onParentFieldAdd,
  onParentFieldDelete,
  onParentFieldRename,
  isOpen,
  onToggle,
}: OptionalColumnProps) {
  return (
    <div className="border border-gray-200 rounded-md overflow-hidden">
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full bg-[#f4f4f5] border-b border-gray-200 px-2.5 py-1.5 flex items-center gap-2 cursor-pointer hover:bg-gray-100 transition-colors"
      >
        <span className="text-[10px] text-gray-400">{isOpen ? "▾" : "▸"}</span>
        <span className="text-[12px] text-black" style={{ fontWeight: 600 }}>③ 선택 규정</span>
        <span className="text-[10px] text-gray-400">C · 완전 선택</span>
        <span className="text-[10px] text-gray-400 ml-auto">{totalParentItems + totalSubItems}개</span>
      </button>

      {/* Content */}
      {isOpen && (
        <div className="bg-white p-1.5 space-y-1.5">
          <ParentFieldsSection
            fields={parentFields}
            onItemUpdate={onParentItemUpdate}
            onItemToggle={onParentItemToggle}
            onItemAdd={onParentItemAdd}
            onItemDelete={onParentItemDelete}
            onFieldAdd={onParentFieldAdd}
            onFieldDelete={onParentFieldDelete}
            onFieldRename={onParentFieldRename}
          />

          {/* 세부 규정 토글 버튼 */}
          <button
            onClick={onToggleSubRules}
            className="w-full flex items-center justify-center gap-1.5 text-[11px] border border-gray-200 rounded-md py-1.5 hover:bg-[#f4f4f5] transition-colors cursor-pointer"
          >
            <span className="text-[10px] text-gray-400">{isSubRulesOpen ? "▾" : "▸"}</span>
            <span className={isSubRulesOpen ? "text-black" : "text-gray-500"}>
              세부 규정 (C-1 ~ C-3)
            </span>
            <span className="text-[10px] text-gray-400">{totalSubItems}개</span>
          </button>
        </div>
      )}
    </div>
  );
}
