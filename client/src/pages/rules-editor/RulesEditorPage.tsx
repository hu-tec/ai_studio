import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { CategorySelector } from "./category-selector";
import { FixedRulesColumn } from "./fixed-rules-column";
import { SemiFixedColumn } from "./semi-fixed-column";
import { OptionalColumn } from "./optional-column";
import { SubRuleSection } from "./sub-rule-section";
import {
  categoryTree,
  generateRuleSet,
  type RuleSet,
  type RuleField,
} from "./rule-data";

// ============================================
// Helpers
// ============================================

function getDefaults() {
  const major = Object.keys(categoryTree)[0];
  const mid = Object.keys(categoryTree[major])[0];
  const minor = categoryTree[major][mid][0];
  return { major, mid, minor };
}

let idSeq = 10000;
const nextId = () => `gen-${++idSeq}`;

// ============================================
// Generic handlers for SubRule (Type B/C)
// ============================================

function updateItemInType(
  subRules: RuleSet["typeB"],
  subRuleId: string,
  fieldId: string,
  itemId: string,
  value: string
) {
  return subRules.map((sr) =>
    sr.id === subRuleId
      ? {
          ...sr,
          fields: sr.fields.map((f) =>
            f.id === fieldId
              ? {
                  ...f,
                  items: f.items.map((item) =>
                    item.id === itemId ? { ...item, value } : item
                  ),
                }
              : f
          ),
        }
      : sr
  );
}

function toggleItemInType(
  subRules: RuleSet["typeB"],
  subRuleId: string,
  fieldId: string,
  itemId: string
) {
  return subRules.map((sr) =>
    sr.id === subRuleId
      ? {
          ...sr,
          fields: sr.fields.map((f) =>
            f.id === fieldId
              ? {
                  ...f,
                  items: f.items.map((item) =>
                    item.id === itemId ? { ...item, enabled: !item.enabled } : item
                  ),
                }
              : f
          ),
        }
      : sr
  );
}

function addItemInType(
  subRules: RuleSet["typeB"],
  subRuleId: string,
  fieldId: string,
  value: string
) {
  return subRules.map((sr) =>
    sr.id === subRuleId
      ? {
          ...sr,
          fields: sr.fields.map((f) =>
            f.id === fieldId
              ? {
                  ...f,
                  items: [
                    ...f.items,
                    { id: nextId(), value, enabled: true },
                  ],
                }
              : f
          ),
        }
      : sr
  );
}

function deleteItemInType(
  subRules: RuleSet["typeB"],
  subRuleId: string,
  fieldId: string,
  itemId: string
) {
  return subRules.map((sr) =>
    sr.id === subRuleId
      ? {
          ...sr,
          fields: sr.fields.map((f) =>
            f.id === fieldId
              ? { ...f, items: f.items.filter((item) => item.id !== itemId) }
              : f
          ),
        }
      : sr
  );
}

function addFieldInType(
  subRules: RuleSet["typeB"],
  subRuleId: string,
  label: string,
  fieldType: RuleField["fieldType"] = "tags"
) {
  return subRules.map((sr) =>
    sr.id === subRuleId
      ? {
          ...sr,
          fields: [
            ...sr.fields,
            { id: nextId(), label, fieldType, items: [] },
          ],
        }
      : sr
  );
}

function deleteFieldInType(
  subRules: RuleSet["typeB"],
  subRuleId: string,
  fieldId: string
) {
  return subRules.map((sr) =>
    sr.id === subRuleId
      ? {
          ...sr,
          fields: sr.fields.filter((f) => f.id !== fieldId),
        }
      : sr
  );
}

function renameFieldInType(
  subRules: RuleSet["typeB"],
  subRuleId: string,
  fieldId: string,
  newLabel: string
) {
  return subRules.map((sr) =>
    sr.id === subRuleId
      ? {
          ...sr,
          fields: sr.fields.map((f) =>
            f.id === fieldId ? { ...f, label: newLabel } : f
          ),
        }
      : sr
  );
}

// ============================================
// Generic helpers for Parent fields (RuleField[])
// ============================================

function updateParentItem(
  fields: RuleSet["typeBParent"],
  fieldId: string,
  itemId: string,
  value: string
) {
  return fields.map((f) =>
    f.id === fieldId
      ? {
          ...f,
          items: f.items.map((item) =>
            item.id === itemId ? { ...item, value } : item
          ),
        }
      : f
  );
}

function toggleParentItem(
  fields: RuleSet["typeBParent"],
  fieldId: string,
  itemId: string
) {
  return fields.map((f) =>
    f.id === fieldId
      ? {
          ...f,
          items: f.items.map((item) =>
            item.id === itemId ? { ...item, enabled: !item.enabled } : item
          ),
        }
      : f
  );
}

function addParentItem(
  fields: RuleSet["typeBParent"],
  fieldId: string,
  value: string
) {
  return fields.map((f) =>
    f.id === fieldId
      ? {
          ...f,
          items: [...f.items, { id: nextId(), value, enabled: true }],
        }
      : f
  );
}

function deleteParentItem(
  fields: RuleSet["typeBParent"],
  fieldId: string,
  itemId: string
) {
  return fields.map((f) =>
    f.id === fieldId
      ? { ...f, items: f.items.filter((item) => item.id !== itemId) }
      : f
  );
}

// ============================================
// App
// ============================================

function RulesEditorPage() {
  const defaults = useMemo(() => getDefaults(), []);

  const [major, setMajor] = useState(defaults.major);
  const [mid, setMid] = useState(defaults.mid);
  const [minor, setMinor] = useState(defaults.minor);

  const [ruleSet, setRuleSet] = useState<RuleSet>(() =>
    generateRuleSet(defaults.major, defaults.mid, defaults.minor)
  );
  const [hasChanges, setHasChanges] = useState(false);
  const loadedRef = useRef(false);

  // Build a storage key from category selection
  const editorRuleId = `editor-rules-${major}-${mid}-${minor}`.replace(/\s+/g, '_');

  // Load from API on mount and category change
  useEffect(() => {
    fetch(`/api/rules/${encodeURIComponent(editorRuleId)}`)
      .then((r) => r.json())
      .then((row: any) => {
        if (row && row.data && row.data.ruleSet) {
          setRuleSet(row.data.ruleSet);
          setHasChanges(false);
        }
      })
      .catch(() => {});
  }, [editorRuleId]);

  // Save helper
  const saveEditorToServer = useCallback((rs: RuleSet) => {
    fetch('/api/rules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rule_id: editorRuleId,
        data: { ruleSet: rs, major, mid, minor },
      }),
    }).catch(() => {});
  }, [editorRuleId, major, mid, minor]);

  // Toggle states for sub-rules (default: closed)
  const [isBSubRulesOpen, setIsBSubRulesOpen] = useState(false);
  const [isCSubRulesOpen, setIsCSubRulesOpen] = useState(false);

  // Global toggle
  const [isAllOpen, setIsAllOpen] = useState(true);

  // Per-regulation toggles (default: open)
  const [isTypeAOpen, setIsTypeAOpen] = useState(true);
  const [isTypeBOpen, setIsTypeBOpen] = useState(true);
  const [isTypeCOpen, setIsTypeCOpen] = useState(true);

  // ---- Category changes ----
  const handleMajorChange = useCallback((v: string) => {
    setMajor(v);
    const newMid = Object.keys(categoryTree[v])[0];
    setMid(newMid);
    const newMinor = categoryTree[v][newMid][0];
    setMinor(newMinor);
    setRuleSet(generateRuleSet(v, newMid, newMinor));
    setHasChanges(false);
  }, []);

  const handleMidChange = useCallback(
    (v: string) => {
      setMid(v);
      const newMinor = categoryTree[major][v][0];
      setMinor(newMinor);
      setRuleSet(generateRuleSet(major, v, newMinor));
      setHasChanges(false);
    },
    [major]
  );

  const handleMinorChange = useCallback(
    (v: string) => {
      setMinor(v);
      setRuleSet(generateRuleSet(major, mid, v));
      setHasChanges(false);
    },
    [major, mid]
  );

  // ---- Type A updates ----
  const handleTypeAUpdate = useCallback((fieldId: string, value: string) => {
    setRuleSet((prev) => ({
      ...prev,
      typeA: prev.typeA.map((f) => (f.id === fieldId ? { ...f, value } : f)),
    }));
    setHasChanges(true);
  }, []);

  // ---- Type B handlers ----
  const handleTypeBItemUpdate = useCallback(
    (subRuleId: string, fieldId: string, itemId: string, value: string) => {
      setRuleSet((prev) => ({
        ...prev,
        typeB: updateItemInType(prev.typeB, subRuleId, fieldId, itemId, value),
      }));
      setHasChanges(true);
    },
    []
  );

  const handleTypeBItemToggle = useCallback(
    (subRuleId: string, fieldId: string, itemId: string) => {
      setRuleSet((prev) => ({
        ...prev,
        typeB: toggleItemInType(prev.typeB, subRuleId, fieldId, itemId),
      }));
      setHasChanges(true);
    },
    []
  );

  const handleTypeBItemAdd = useCallback(
    (subRuleId: string, fieldId: string, value: string) => {
      setRuleSet((prev) => ({
        ...prev,
        typeB: addItemInType(prev.typeB, subRuleId, fieldId, value),
      }));
      setHasChanges(true);
    },
    []
  );

  const handleTypeBItemDelete = useCallback(
    (subRuleId: string, fieldId: string, itemId: string) => {
      setRuleSet((prev) => ({
        ...prev,
        typeB: deleteItemInType(prev.typeB, subRuleId, fieldId, itemId),
      }));
      setHasChanges(true);
    },
    []
  );

  const handleTypeBFieldAdd = useCallback(
    (subRuleId: string, label: string, fieldType: RuleField["fieldType"] = "tags") => {
      setRuleSet((prev) => ({
        ...prev,
        typeB: addFieldInType(prev.typeB, subRuleId, label, fieldType),
      }));
      setHasChanges(true);
    },
    []
  );

  const handleTypeBFieldDelete = useCallback(
    (subRuleId: string, fieldId: string) => {
      setRuleSet((prev) => ({
        ...prev,
        typeB: deleteFieldInType(prev.typeB, subRuleId, fieldId),
      }));
      setHasChanges(true);
    },
    []
  );

  const handleTypeBFieldRename = useCallback(
    (subRuleId: string, fieldId: string, newLabel: string) => {
      setRuleSet((prev) => ({
        ...prev,
        typeB: renameFieldInType(prev.typeB, subRuleId, fieldId, newLabel),
      }));
      setHasChanges(true);
    },
    []
  );

  // ---- Type C handlers ----
  const handleTypeCItemUpdate = useCallback(
    (subRuleId: string, fieldId: string, itemId: string, value: string) => {
      setRuleSet((prev) => ({
        ...prev,
        typeC: updateItemInType(prev.typeC, subRuleId, fieldId, itemId, value),
      }));
      setHasChanges(true);
    },
    []
  );

  const handleTypeCItemToggle = useCallback(
    (subRuleId: string, fieldId: string, itemId: string) => {
      setRuleSet((prev) => ({
        ...prev,
        typeC: toggleItemInType(prev.typeC, subRuleId, fieldId, itemId),
      }));
      setHasChanges(true);
    },
    []
  );

  const handleTypeCItemAdd = useCallback(
    (subRuleId: string, fieldId: string, value: string) => {
      setRuleSet((prev) => ({
        ...prev,
        typeC: addItemInType(prev.typeC, subRuleId, fieldId, value),
      }));
      setHasChanges(true);
    },
    []
  );

  const handleTypeCItemDelete = useCallback(
    (subRuleId: string, fieldId: string, itemId: string) => {
      setRuleSet((prev) => ({
        ...prev,
        typeC: deleteItemInType(prev.typeC, subRuleId, fieldId, itemId),
      }));
      setHasChanges(true);
    },
    []
  );

  const handleTypeCFieldAdd = useCallback(
    (subRuleId: string, label: string, fieldType: RuleField["fieldType"] = "tags") => {
      setRuleSet((prev) => ({
        ...prev,
        typeC: addFieldInType(prev.typeC, subRuleId, label, fieldType),
      }));
      setHasChanges(true);
    },
    []
  );

  const handleTypeCFieldDelete = useCallback(
    (subRuleId: string, fieldId: string) => {
      setRuleSet((prev) => ({
        ...prev,
        typeC: deleteFieldInType(prev.typeC, subRuleId, fieldId),
      }));
      setHasChanges(true);
    },
    []
  );

  const handleTypeCFieldRename = useCallback(
    (subRuleId: string, fieldId: string, newLabel: string) => {
      setRuleSet((prev) => ({
        ...prev,
        typeC: renameFieldInType(prev.typeC, subRuleId, fieldId, newLabel),
      }));
      setHasChanges(true);
    },
    []
  );

  // ---- Type A field CRUD ----
  const handleTypeAAddField = useCallback(
    (label: string, value: string) => {
      setRuleSet((prev) => ({
        ...prev,
        typeA: [
          ...prev.typeA,
          { id: nextId(), label, value, type: "text" as const },
        ],
      }));
      setHasChanges(true);
    },
    []
  );

  const handleTypeADeleteField = useCallback(
    (fieldId: string) => {
      if (!window.confirm('정말 삭제하시겠습니까?')) return;
      setRuleSet((prev) => ({
        ...prev,
        typeA: prev.typeA.filter((f) => f.id !== fieldId),
      }));
      setHasChanges(true);
    },
    []
  );

  const handleTypeARenameField = useCallback(
    (fieldId: string, newLabel: string) => {
      setRuleSet((prev) => ({
        ...prev,
        typeA: prev.typeA.map((f) =>
          f.id === fieldId ? { ...f, label: newLabel } : f
        ),
      }));
      setHasChanges(true);
    },
    []
  );

  // ---- Type B Parent handlers ----
  const handleTypeBParentItemUpdate = useCallback(
    (fieldId: string, itemId: string, value: string) => {
      setRuleSet((prev) => ({
        ...prev,
        typeBParent: updateParentItem(prev.typeBParent, fieldId, itemId, value),
      }));
      setHasChanges(true);
    },
    []
  );

  const handleTypeBParentItemToggle = useCallback(
    (fieldId: string, itemId: string) => {
      setRuleSet((prev) => ({
        ...prev,
        typeBParent: toggleParentItem(prev.typeBParent, fieldId, itemId),
      }));
      setHasChanges(true);
    },
    []
  );

  const handleTypeBParentItemAdd = useCallback(
    (fieldId: string, value: string) => {
      setRuleSet((prev) => ({
        ...prev,
        typeBParent: addParentItem(prev.typeBParent, fieldId, value),
      }));
      setHasChanges(true);
    },
    []
  );

  const handleTypeBParentItemDelete = useCallback(
    (fieldId: string, itemId: string) => {
      setRuleSet((prev) => ({
        ...prev,
        typeBParent: deleteParentItem(prev.typeBParent, fieldId, itemId),
      }));
      setHasChanges(true);
    },
    []
  );

  const handleTypeBParentFieldAdd = useCallback(
    (label: string, fieldType: RuleField["fieldType"] = "tags") => {
      setRuleSet((prev) => ({
        ...prev,
        typeBParent: [...prev.typeBParent, { id: nextId(), label, fieldType, items: [] }],
      }));
      setHasChanges(true);
    },
    []
  );

  const handleTypeBParentFieldDelete = useCallback(
    (fieldId: string) => {
      setRuleSet((prev) => ({
        ...prev,
        typeBParent: prev.typeBParent.filter((f) => f.id !== fieldId),
      }));
      setHasChanges(true);
    },
    []
  );

  const handleTypeBParentFieldRename = useCallback(
    (fieldId: string, newLabel: string) => {
      setRuleSet((prev) => ({
        ...prev,
        typeBParent: prev.typeBParent.map((f) =>
          f.id === fieldId ? { ...f, label: newLabel } : f
        ),
      }));
      setHasChanges(true);
    },
    []
  );

  // ---- Type C Parent handlers ----
  const handleTypeCParentItemUpdate = useCallback(
    (fieldId: string, itemId: string, value: string) => {
      setRuleSet((prev) => ({
        ...prev,
        typeCParent: updateParentItem(prev.typeCParent, fieldId, itemId, value),
      }));
      setHasChanges(true);
    },
    []
  );

  const handleTypeCParentItemToggle = useCallback(
    (fieldId: string, itemId: string) => {
      setRuleSet((prev) => ({
        ...prev,
        typeCParent: toggleParentItem(prev.typeCParent, fieldId, itemId),
      }));
      setHasChanges(true);
    },
    []
  );

  const handleTypeCParentItemAdd = useCallback(
    (fieldId: string, value: string) => {
      setRuleSet((prev) => ({
        ...prev,
        typeCParent: addParentItem(prev.typeCParent, fieldId, value),
      }));
      setHasChanges(true);
    },
    []
  );

  const handleTypeCParentItemDelete = useCallback(
    (fieldId: string, itemId: string) => {
      setRuleSet((prev) => ({
        ...prev,
        typeCParent: deleteParentItem(prev.typeCParent, fieldId, itemId),
      }));
      setHasChanges(true);
    },
    []
  );

  const handleTypeCParentFieldAdd = useCallback(
    (label: string, fieldType: RuleField["fieldType"] = "tags") => {
      setRuleSet((prev) => ({
        ...prev,
        typeCParent: [...prev.typeCParent, { id: nextId(), label, fieldType, items: [] }],
      }));
      setHasChanges(true);
    },
    []
  );

  const handleTypeCParentFieldDelete = useCallback(
    (fieldId: string) => {
      setRuleSet((prev) => ({
        ...prev,
        typeCParent: prev.typeCParent.filter((f) => f.id !== fieldId),
      }));
      setHasChanges(true);
    },
    []
  );

  const handleTypeCParentFieldRename = useCallback(
    (fieldId: string, newLabel: string) => {
      setRuleSet((prev) => ({
        ...prev,
        typeCParent: prev.typeCParent.map((f) =>
          f.id === fieldId ? { ...f, label: newLabel } : f
        ),
      }));
      setHasChanges(true);
    },
    []
  );

  // ---- Actions ----
  const handleSave = () => {
    saveEditorToServer(ruleSet);
    setHasChanges(false);
  };

  const handleReset = () => {
    setRuleSet(generateRuleSet(major, mid, minor));
    setHasChanges(false);
  };

  // Count items
  const totalBParentItems = ruleSet.typeBParent.reduce(
    (a, f) => a + f.items.length,
    0
  );
  const totalBItems = ruleSet.typeB.reduce(
    (acc, sr) => acc + sr.fields.reduce((a, f) => a + f.items.length, 0),
    0
  );
  const totalCParentItems = ruleSet.typeCParent.reduce(
    (a, f) => a + f.items.length,
    0
  );
  const totalCItems = ruleSet.typeC.reduce(
    (acc, sr) => acc + sr.fields.reduce((a, f) => a + f.items.length, 0),
    0
  );

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* ===== Top Bar ===== */}
      <header className="bg-white border-b border-gray-200 px-2.5 py-1.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-[20px]" style={{ fontWeight: 600 }}>AI 규정 관리</span>
          <span className="text-[10px] text-gray-400 ml-1">
            {major} › {mid} › {minor}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {hasChanges && (
            <span className="text-[10px] text-black border border-gray-300 rounded-md px-2 py-0.5">
              미저장
            </span>
          )}
          <span className="text-[10px] text-gray-400">
            {ruleSet.typeA.length}+{totalBParentItems + totalBItems}+{totalCParentItems + totalCItems}
          </span>
          <button
            onClick={handleReset}
            className="text-[12px] text-gray-500 border border-gray-200 rounded-md px-2 hover:bg-[#f4f4f5] transition-colors"
            style={{ height: 28 }}
          >
            ↩ 초기화
          </button>
          <button
            onClick={handleSave}
            className="text-[12px] text-white bg-black rounded-md px-2 hover:bg-gray-800 transition-colors"
            style={{ height: 28 }}
          >
            저장
          </button>
        </div>
      </header>

      {/* ===== Category Finder ===== */}
      <div className="bg-white border-b border-gray-200 px-2 py-1.5 shrink-0">
        <CategorySelector
          major={major}
          mid={mid}
          minor={minor}
          onMajorChange={handleMajorChange}
          onMidChange={handleMidChange}
          onMinorChange={handleMinorChange}
        />
      </div>

      {/* ===== Main Content ===== */}
      <div className="flex-1 overflow-auto px-2 py-1 min-h-0 space-y-2">
        {/* Global toggle bar */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAllOpen(!isAllOpen)}
            className="flex items-center gap-1 text-[11px] text-gray-500 hover:text-black transition-colors"
          >
            <span className="text-[10px]">{isAllOpen ? "▾" : "▸"}</span>
            <span>{isAllOpen ? "전체 접기" : "전체 펼치기"}</span>
          </button>
          {isAllOpen && (
            <div className="flex items-center gap-1 ml-auto">
              {(
                [
                  { label: "① 고정", open: isTypeAOpen, toggle: () => setIsTypeAOpen(!isTypeAOpen) },
                  { label: "② 준고정", open: isTypeBOpen, toggle: () => setIsTypeBOpen(!isTypeBOpen) },
                  { label: "③ 선택", open: isTypeCOpen, toggle: () => setIsTypeCOpen(!isTypeCOpen) },
                ] as const
              ).map((s) => (
                <button
                  key={s.label}
                  onClick={s.toggle}
                  className={`text-[10px] px-1.5 py-0.5 border rounded-md transition-colors ${
                    s.open
                      ? "border-black text-black bg-white"
                      : "border-gray-200 text-gray-400 bg-[#f4f4f5]"
                  }`}
                  style={{ height: 22 }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {isAllOpen && (
          <>
            {/* Row 1: 3-Column (고정 + 준고정 공통 + 선택 공통) */}
            <div className="grid grid-cols-3 gap-2 items-start">
              {/* Col 1: 고정 규정 */}
              <FixedRulesColumn
                fields={ruleSet.typeA}
                onUpdate={handleTypeAUpdate}
                onAddField={handleTypeAAddField}
                onDeleteField={handleTypeADeleteField}
                onRenameField={handleTypeARenameField}
                isOpen={isTypeAOpen}
                onToggle={() => setIsTypeAOpen(!isTypeAOpen)}
              />

              {/* Col 2: 준고정 규정 (공통 항목 + 토글 버튼) */}
              <SemiFixedColumn
                parentFields={ruleSet.typeBParent}
                isSubRulesOpen={isBSubRulesOpen}
                onToggleSubRules={() => setIsBSubRulesOpen(!isBSubRulesOpen)}
                totalParentItems={totalBParentItems}
                totalSubItems={totalBItems}
                onParentItemUpdate={handleTypeBParentItemUpdate}
                onParentItemToggle={handleTypeBParentItemToggle}
                onParentItemAdd={handleTypeBParentItemAdd}
                onParentItemDelete={handleTypeBParentItemDelete}
                onParentFieldAdd={handleTypeBParentFieldAdd}
                onParentFieldDelete={handleTypeBParentFieldDelete}
                onParentFieldRename={handleTypeBParentFieldRename}
                isOpen={isTypeBOpen}
                onToggle={() => setIsTypeBOpen(!isTypeBOpen)}
              />

              {/* Col 3: 선택 규정 (공통 항목 + 토글 버튼) */}
              <OptionalColumn
                parentFields={ruleSet.typeCParent}
                isSubRulesOpen={isCSubRulesOpen}
                onToggleSubRules={() => setIsCSubRulesOpen(!isCSubRulesOpen)}
                totalParentItems={totalCParentItems}
                totalSubItems={totalCItems}
                onParentItemUpdate={handleTypeCParentItemUpdate}
                onParentItemToggle={handleTypeCParentItemToggle}
                onParentItemAdd={handleTypeCParentItemAdd}
                onParentItemDelete={handleTypeCParentItemDelete}
                onParentFieldAdd={handleTypeCParentFieldAdd}
                onParentFieldDelete={handleTypeCParentFieldDelete}
                onParentFieldRename={handleTypeCParentFieldRename}
                isOpen={isTypeCOpen}
                onToggle={() => setIsTypeCOpen(!isTypeCOpen)}
              />
            </div>

            {/* Row 2: 준고정 세부 규정 (B-1 ~ B-3) — 토글 시 전체 폭으로 펼침 */}
            {isBSubRulesOpen && (
              <div className="border border-gray-200 rounded-md overflow-hidden">
                <div className="bg-[#f4f4f5] border-b border-gray-200 px-2.5 py-1.5 flex items-center gap-2">
                  <span className="text-[12px] text-black" style={{ fontWeight: 600 }}>② 준고정 세부 규정</span>
                  <span className="text-[10px] text-gray-400">B-1 ~ B-3</span>
                  <span className="text-[10px] text-gray-400 ml-auto">{totalBItems}개</span>
                </div>
                <div className="bg-white p-1.5">
                  <div className="grid grid-cols-3 gap-1.5">
                    {ruleSet.typeB.map((sr) => (
                      <SubRuleSection
                        key={sr.id}
                        subRule={sr}
                        onItemUpdate={handleTypeBItemUpdate}
                        onItemToggle={handleTypeBItemToggle}
                        onItemAdd={handleTypeBItemAdd}
                        onItemDelete={handleTypeBItemDelete}
                        onFieldAdd={handleTypeBFieldAdd}
                        onFieldDelete={handleTypeBFieldDelete}
                        onFieldRename={handleTypeBFieldRename}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Row 3: 선택 세부 규정 (C-1 ~ C-3) — 토글 시 전체 폭으로 펼침 */}
            {isCSubRulesOpen && (
              <div className="border border-gray-200 rounded-md overflow-hidden">
                <div className="bg-[#f4f4f5] border-b border-gray-200 px-2.5 py-1.5 flex items-center gap-2">
                  <span className="text-[12px] text-black" style={{ fontWeight: 600 }}>③ 선택 세부 규정</span>
                  <span className="text-[10px] text-gray-400">C-1 ~ C-3</span>
                  <span className="text-[10px] text-gray-400 ml-auto">{totalCItems}개</span>
                </div>
                <div className="bg-white p-1.5">
                  <div className="grid grid-cols-3 gap-1.5">
                    {ruleSet.typeC.map((sr) => (
                      <SubRuleSection
                        key={sr.id}
                        subRule={sr}
                        onItemUpdate={handleTypeCItemUpdate}
                        onItemToggle={handleTypeCItemToggle}
                        onItemAdd={handleTypeCItemAdd}
                        onItemDelete={handleTypeCItemDelete}
                        onFieldAdd={handleTypeCFieldAdd}
                        onFieldDelete={handleTypeCFieldDelete}
                        onFieldRename={handleTypeCFieldRename}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default RulesEditorPage;