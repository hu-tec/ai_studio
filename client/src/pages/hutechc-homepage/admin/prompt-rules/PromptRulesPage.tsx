/* 원본: hutechc_hompage_real/app/(client-layout)/admin/prompt-rules/page.tsx */
import { useState, useEffect } from "react";
import { Link } from 'react-router';
import { Plus, Trash2, ChevronUp, ChevronDown, Edit2, Save, X } from "lucide-react";
import { 
  DEFAULT_RULES, 
  type PromptRule, 
  type MainCategory, 
  type PresetType, 
  MAIN_CATEGORY_LABELS, 
  PRESET_LABELS, 
  loadStored, 
  saveStored,
  type FixedRuleA,
  type FixedRuleB1,
  type SemiFixedRuleB2,
  type OptionalRuleB3,
  type FixedRuleC1,
  type SemiFixedRuleC2,
  type OptionalRuleC3,
  type CustomField,
  type RuleStatus,
} from '../../lib/promptRules";

type RuleSectionType = "A" | "B1" | "B2" | "B3" | "C1" | "C2" | "C3";

// 섹션별 아이템 타입 (유니온 대신 Record 사용)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SectionItem = any;

// 섹션 데이터 타입
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SectionData = any;

// 동적 옵션을 localStorage에서 로드/저장
function loadDynamicOptions() {
  if (typeof window === "undefined") {
    return {
      categories: Object.keys(MAIN_CATEGORY_LABELS) as MainCategory[],
      presets: Object.keys(PRESET_LABELS) as PresetType[],
      statuses: ["always", "default", "enhanced"] as const,
      categoryLabels: MAIN_CATEGORY_LABELS,
      presetLabels: PRESET_LABELS,
    };
  }
  try {
    const stored = localStorage.getItem("admin-prompt-options");
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        categories: parsed.categories || Object.keys(MAIN_CATEGORY_LABELS) as MainCategory[],
        presets: parsed.presets || Object.keys(PRESET_LABELS) as PresetType[],
        statuses: parsed.statuses || ["always", "default", "enhanced"],
        categoryLabels: { ...MAIN_CATEGORY_LABELS, ...parsed.categoryLabels },
        presetLabels: { ...PRESET_LABELS, ...parsed.presetLabels },
      };
    }
  } catch {}
  return {
    categories: Object.keys(MAIN_CATEGORY_LABELS) as MainCategory[],
    presets: Object.keys(PRESET_LABELS) as PresetType[],
    statuses: ["always", "default", "enhanced"] as const,
    categoryLabels: MAIN_CATEGORY_LABELS,
    presetLabels: PRESET_LABELS,
  };
}

function saveDynamicOptions(options: {
  categories: MainCategory[];
  presets: PresetType[];
  statuses: string[];
  categoryLabels: Record<string, string>;
  presetLabels: Record<string, string>;
}) {
  if (typeof window === "undefined") return;
  localStorage.setItem("admin-prompt-options", JSON.stringify(options));
}

export default function PromptRulesPage() {
  const initialOptions = loadDynamicOptions();
  const [dynamicCategories, setDynamicCategories] = useState<MainCategory[]>(initialOptions.categories);
  const [dynamicPresets, setDynamicPresets] = useState<PresetType[]>(initialOptions.presets);
  const [dynamicStatuses, setDynamicStatuses] = useState<string[]>(initialOptions.statuses);
  const [categoryLabels, setCategoryLabels] = useState<Record<string, string>>(initialOptions.categoryLabels);
  const [presetLabels, setPresetLabels] = useState<Record<string, string>>(initialOptions.presetLabels);
  const [rules, setRules] = useState<PromptRule[]>(() => {
    const loaded = loadStored();
    if (loaded.length === 0) {
      saveStored(DEFAULT_RULES);
      return DEFAULT_RULES;
    }
    return loaded;
  });
  const [selectedCategory, setSelectedCategory] = useState<MainCategory | "all">("all");
  const [expandedRule, setExpandedRule] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSection, setEditingSection] = useState<{ ruleId: string; section: RuleSectionType } | null>(null);
  const [editingField, setEditingField] = useState<{ ruleId: string; section: RuleSectionType; field: string } | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showPresetModal, setShowPresetModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);

  useEffect(() => {
    saveStored(rules);
  }, [rules]);

  const restoreDefaults = () => {
    if (confirm("기본 규정으로 완전히 복원하시겠습니까? 현재 모든 규정이 기본값으로 대체됩니다.")) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("admin-prompt-rules");
      }
      setRules(DEFAULT_RULES);
      saveStored(DEFAULT_RULES);
    }
  };

  const filteredRules = selectedCategory === "all" 
    ? rules 
    : rules.filter(r => r.mainCategory === selectedCategory);

  const removeRule = (id: string) => {
    if (confirm("이 규정을 삭제하시겠습니까?")) {
      setRules(rules.filter(r => r.id !== id));
    }
  };

  const updateRule = (id: string, updates: Partial<PromptRule>) => {
    const newRules = rules.map(r => 
      r.id === id 
        ? { ...r, ...updates, updatedAt: new Date().toISOString() }
        : r
    );
    setRules(newRules);
    // localStorage에도 즉시 저장
    saveStored(newRules);
  };

  const moveRule = (id: string, direction: "up" | "down") => {
    const index = rules.findIndex(r => r.id === id);
    if (index === -1) return;
    
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= rules.length) return;

    const newRules = [...rules];
    [newRules[index], newRules[newIndex]] = [newRules[newIndex], newRules[index]];
    newRules[index].order = index + 1;
    newRules[newIndex].order = newIndex + 1;
    setRules(newRules);
  };

  // 섹션이 없을 때 첫 항목 추가
  const addSection = (ruleId: string, sectionType: RuleSectionType) => {
    const rule = rules.find(r => r.id === ruleId);
    if (!rule) return;

    const updates: Partial<PromptRule> = {};
    const timestamp = Date.now();

    switch (sectionType) {
      case "A":
        updates.ruleA = [{
          id: `${ruleId}-a-${timestamp}`,
          purpose: "",
          target: "",
          prohibition: "",
          safety: "",
          ethics: "",
          security: "",
          checklist: "",
        }];
        break;
      case "B1":
        updates.ruleB1 = [{
          id: `${ruleId}-b1-${timestamp}`,
          format: "",
          layout: "",
          volume: "",
          expressionRestrictions: "",
          verification: "",
          basis: "",
          responsibilityNotice: "",
        }];
        break;
      case "B2":
        updates.ruleB2 = [{
          id: `${ruleId}-b2-${timestamp}`,
          volume: "normal",
          technicalTerms: "medium",
          factualityVerification: true,
          logicVerification: true,
          consistencyVerification: true,
          basisStrength: "recommended",
          internalStandards: true,
          noticeLocation: "bottom",
        }];
        break;
      case "B3":
        updates.ruleB3 = [{
          id: `${ruleId}-b3-${timestamp}`,
          summaryFirst: false,
          fixedTableTemplate: false,
          glossary: false,
          citationMethod: "parentheses",
          verificationReport: false,
        }];
        break;
      case "C1":
        updates.ruleC1 = [{
          id: `${ruleId}-c1-${timestamp}`,
          fixedOutputStructure: true,
          checklistApplication: true,
          historyManagement: true,
          reviewNotation: true,
        }];
        break;
      case "C2":
        updates.ruleC2 = [{
          id: `${ruleId}-c2-${timestamp}`,
          structureDepth: "basic",
          checkStrictness: "medium",
          institutionGuideReflection: true,
          institutionGuideRange: "기본",
          brandTone: true,
          brandToneStrength: "medium",
          readabilityEnhancement: true,
          readabilityStrength: "medium",
          sensitiveFilter: true,
          sensitiveFilterStrength: "medium",
          regionalCulturalScope: "kr",
          historyNotationLevel: "display",
          reviewBadge: true,
        }];
        break;
      case "C3":
        updates.ruleC3 = [{
          id: `${ruleId}-c3-${timestamp}`,
          sensitiveTopicFilter: false,
          countrySpecificStandards: false,
          versionControl: false,
          sensitiveWarningBox: true,
          changeHighlight: true,
          brandExamples: false,
          checklistResultReport: false,
        }];
        break;
    }

    updateRule(ruleId, updates);
    setEditingSection({ ruleId, section: sectionType });
  };

  // 수정 모드에서 새 항목 추가
  const addItemToSection = (ruleId: string, sectionType: RuleSectionType) => {
    const rule = rules.find(r => r.id === ruleId);
    if (!rule) return;

    const timestamp = Date.now();
    const updates: Partial<PromptRule> = {};

    switch (sectionType) {
      case "A": {
        const newItem: FixedRuleA = {
          id: `${ruleId}-a-${timestamp}`,
          purpose: "",
          target: "",
          prohibition: "",
          safety: "",
          ethics: "",
          security: "",
          checklist: "",
        };
        updates.ruleA = [...(rule.ruleA || []), newItem];
        break;
      }
      case "B1": {
        const newItem: FixedRuleB1 = {
          id: `${ruleId}-b1-${timestamp}`,
          format: "",
          layout: "",
          volume: "",
          expressionRestrictions: "",
          verification: "",
          basis: "",
          responsibilityNotice: "",
        };
        updates.ruleB1 = [...(rule.ruleB1 || []), newItem];
        break;
      }
      case "B2": {
        const newItem: SemiFixedRuleB2 = {
          id: `${ruleId}-b2-${timestamp}`,
          volume: "normal",
          technicalTerms: "medium",
          factualityVerification: true,
          logicVerification: true,
          consistencyVerification: true,
          basisStrength: "recommended",
          internalStandards: true,
          noticeLocation: "bottom",
        };
        updates.ruleB2 = [...(rule.ruleB2 || []), newItem];
        break;
      }
      case "B3": {
        const newItem: OptionalRuleB3 = {
          id: `${ruleId}-b3-${timestamp}`,
          summaryFirst: false,
          fixedTableTemplate: false,
          glossary: false,
          citationMethod: "parentheses",
          verificationReport: false,
        };
        updates.ruleB3 = [...(rule.ruleB3 || []), newItem];
        break;
      }
      case "C1": {
        const newItem: FixedRuleC1 = {
          id: `${ruleId}-c1-${timestamp}`,
          fixedOutputStructure: true,
          checklistApplication: true,
          historyManagement: true,
          reviewNotation: true,
        };
        updates.ruleC1 = [...(rule.ruleC1 || []), newItem];
        break;
      }
      case "C2": {
        const newItem: SemiFixedRuleC2 = {
          id: `${ruleId}-c2-${timestamp}`,
          structureDepth: "basic",
          checkStrictness: "medium",
          institutionGuideReflection: true,
          institutionGuideRange: "기본",
          brandTone: true,
          brandToneStrength: "medium",
          readabilityEnhancement: true,
          readabilityStrength: "medium",
          sensitiveFilter: true,
          sensitiveFilterStrength: "medium",
          regionalCulturalScope: "kr",
          historyNotationLevel: "display",
          reviewBadge: true,
        };
        updates.ruleC2 = [...(rule.ruleC2 || []), newItem];
        break;
      }
      case "C3": {
        const newItem: OptionalRuleC3 = {
          id: `${ruleId}-c3-${timestamp}`,
          sensitiveTopicFilter: false,
          countrySpecificStandards: false,
          versionControl: false,
          sensitiveWarningBox: true,
          changeHighlight: true,
          brandExamples: false,
          checklistResultReport: false,
        };
        updates.ruleC3 = [...(rule.ruleC3 || []), newItem];
        break;
      }
    }

    updateRule(ruleId, updates);
  };

  const removeSection = (ruleId: string, sectionType: RuleSectionType) => {
    if (!confirm("이 섹션을 삭제하시겠습니까?")) return;

    const updates: Partial<PromptRule> = {};
    switch (sectionType) {
      case "A": updates.ruleA = undefined; break;
      case "B1": updates.ruleB1 = undefined; break;
      case "B2": updates.ruleB2 = undefined; break;
      case "B3": updates.ruleB3 = undefined; break;
      case "C1": updates.ruleC1 = undefined; break;
      case "C2": updates.ruleC2 = undefined; break;
      case "C3": updates.ruleC3 = undefined; break;
    }

    updateRule(ruleId, updates);
  };

  // 섹션 내 항목 삭제
  const removeItemFromSection = (ruleId: string, sectionType: RuleSectionType, itemId: string) => {
    if (!confirm("이 항목을 삭제하시겠습니까?")) return;

    const rule = rules.find(r => r.id === ruleId);
    if (!rule) return;

    const updates: Partial<PromptRule> = {};
    switch (sectionType) {
      case "A":
        updates.ruleA = rule.ruleA?.filter(item => item.id !== itemId);
        if (updates.ruleA?.length === 0) updates.ruleA = undefined;
        break;
      case "B1":
        updates.ruleB1 = rule.ruleB1?.filter(item => item.id !== itemId);
        if (updates.ruleB1?.length === 0) updates.ruleB1 = undefined;
        break;
      case "B2":
        updates.ruleB2 = rule.ruleB2?.filter(item => item.id !== itemId);
        if (updates.ruleB2?.length === 0) updates.ruleB2 = undefined;
        break;
      case "B3":
        updates.ruleB3 = rule.ruleB3?.filter(item => item.id !== itemId);
        if (updates.ruleB3?.length === 0) updates.ruleB3 = undefined;
        break;
      case "C1":
        updates.ruleC1 = rule.ruleC1?.filter(item => item.id !== itemId);
        if (updates.ruleC1?.length === 0) updates.ruleC1 = undefined;
        break;
      case "C2":
        updates.ruleC2 = rule.ruleC2?.filter(item => item.id !== itemId);
        if (updates.ruleC2?.length === 0) updates.ruleC2 = undefined;
        break;
      case "C3":
        updates.ruleC3 = rule.ruleC3?.filter(item => item.id !== itemId);
        if (updates.ruleC3?.length === 0) updates.ruleC3 = undefined;
        break;
    }

    updateRule(ruleId, updates);
  };

  const saveNewRule = (newRule: Omit<PromptRule, "id" | "createdAt" | "updatedAt" | "order">) => {
    const rule: PromptRule = {
      ...newRule,
      id: `rule-${Date.now()}`,
      order: rules.length + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setRules([...rules, rule]);
    setShowAddModal(false);
  };

  const addCategory = (newCategory: string) => {
    if (!newCategory.trim()) return;
    const categoryKey = newCategory.toLowerCase().replace(/\s+/g, "-") as MainCategory;
    if (!dynamicCategories.includes(categoryKey)) {
      const newCategories = [...dynamicCategories, categoryKey];
      const newLabels = { ...categoryLabels, [categoryKey]: newCategory };
      setDynamicCategories(newCategories);
      setCategoryLabels(newLabels);
      saveDynamicOptions({
        categories: newCategories,
        presets: dynamicPresets,
        statuses: dynamicStatuses,
        categoryLabels: newLabels,
        presetLabels: presetLabels,
      });
    }
  };

  const addPreset = (newPreset: string) => {
    if (!newPreset.trim()) return;
    const presetKey = newPreset.toLowerCase().replace(/\s+/g, "-") as PresetType;
    if (!dynamicPresets.includes(presetKey)) {
      const newPresets = [...dynamicPresets, presetKey];
      const newLabels = { ...presetLabels, [presetKey]: newPreset };
      setDynamicPresets(newPresets);
      setPresetLabels(newLabels);
      saveDynamicOptions({
        categories: dynamicCategories,
        presets: newPresets,
        statuses: dynamicStatuses,
        categoryLabels: categoryLabels,
        presetLabels: newLabels,
      });
    }
  };

  const addStatus = (newStatus: string) => {
    if (!newStatus.trim()) return;
    const statusKey = newStatus.toLowerCase().replace(/\s+/g, "-");
    if (!dynamicStatuses.includes(statusKey)) {
      const newStatuses = [...dynamicStatuses, statusKey];
      setDynamicStatuses(newStatuses);
      saveDynamicOptions({
        categories: dynamicCategories,
        presets: dynamicPresets,
        statuses: newStatuses,
        categoryLabels: categoryLabels,
        presetLabels: presetLabels,
      });
    }
  };

  const inputCls = "w-full px-2 py-1 border border-gray-200 rounded text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent";

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-[1440px] mx-auto px-6 h-16 flex items-center justify-between">
          <div>
            <div className="text-lg font-semibold text-gray-900">프롬프트 규정 설정</div>
            <div className="text-xs text-gray-500">프롬프트 번역 규정 관리 및 설정</div>
          </div>
          <Link to="/hutechc-homepage/admin/dashboard" className="text-sm text-gray-600 hover:underline">
            대시보드
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">프롬프트 규정 관리</h1>
            <p className="text-gray-600">카테고리별 규정을 추가, 수정, 삭제하고 배치 순서를 조정할 수 있습니다.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={restoreDefaults}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              기본값 복원
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4" />
              규정 추가
            </button>
          </div>
        </div>

        {/* 필터 */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-4 py-2 rounded-lg text-sm ${
              selectedCategory === "all"
                ? "bg-indigo-600 text-white"
                : "bg-white text-gray-700 border border-gray-200"
            }`}
          >
            전체
          </button>
          {dynamicCategories.map((key) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              className={`px-4 py-2 rounded-lg text-sm ${
                selectedCategory === key
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-gray-700 border border-gray-200"
              }`}
            >
              {categoryLabels[key] || key}
            </button>
          ))}
        </div>

        {/* 규정 목록 */}
        <div className="space-y-4">
          {filteredRules.map((rule) => (
            <div
              key={rule.id}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden"
            >
              <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => moveRule(rule.id, "up")}
                    className="p-1 text-gray-400 hover:text-gray-600"
                    disabled={rules.findIndex(r => r.id === rule.id) === 0}
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => moveRule(rule.id, "down")}
                    className="p-1 text-gray-400 hover:text-gray-600"
                    disabled={rules.findIndex(r => r.id === rule.id) === rules.length - 1}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-900">
                      {categoryLabels[rule.mainCategory] || rule.mainCategory} - {presetLabels[rule.preset] || rule.preset}
                    </span>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={rule.enabled}
                        onChange={(e) => updateRule(rule.id, { enabled: e.target.checked })}
                        className="rounded"
                      />
                      <span className="text-xs text-gray-600">활성화</span>
                    </label>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setExpandedRule(expandedRule === rule.id ? null : rule.id)}
                    className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900"
                  >
                    {expandedRule === rule.id ? "접기" : "펼치기"}
                  </button>
                  <button
                    onClick={() => removeRule(rule.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {expandedRule === rule.id && (
                <div className="p-4 space-y-6">
                  {/* 기본 정보 - 드롭다운에서 직접 수정 가능하고 옵션 추가 가능 */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <label className="block text-xs text-gray-600">대분류</label>
                        <button
                          onClick={() => setShowCategoryModal(true)}
                          className="text-xs text-indigo-600 hover:underline"
                        >
                          + 추가
                        </button>
                      </div>
                      <select
                        value={rule.mainCategory}
                        onChange={(e) => updateRule(rule.id, { mainCategory: e.target.value as MainCategory })}
                        className={inputCls}
                      >
                        {dynamicCategories.map((key) => (
                          <option key={key} value={key}>{categoryLabels[key] || key}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <label className="block text-xs text-gray-600">프리셋</label>
                        <button
                          onClick={() => setShowPresetModal(true)}
                          className="text-xs text-indigo-600 hover:underline"
                        >
                          + 추가
                        </button>
                      </div>
                      <select
                        value={rule.preset}
                        onChange={(e) => updateRule(rule.id, { preset: e.target.value as PresetType })}
                        className={inputCls}
                      >
                        {dynamicPresets.map((key) => (
                          <option key={key} value={key}>{presetLabels[key] || key}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <label className="block text-xs text-gray-600">상태</label>
                        <button
                          onClick={() => setShowStatusModal(true)}
                          className="text-xs text-indigo-600 hover:underline"
                        >
                          + 추가
                        </button>
                      </div>
                      <select
                        value={rule.status}
                        onChange={(e) => updateRule(rule.id, { status: e.target.value as "always" | "default" | "enhanced" })}
                        className={inputCls}
                      >
                        {dynamicStatuses.map((key) => (
                          <option key={key} value={key}>
                            {key === "always" ? "A 항상적용" : key === "default" ? "B 기본설정" : "C 강화모드"}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* 각 섹션 - 아래에 추가 버튼 하나만 */}
                  <SectionDisplay
                    title="A. 고정 규정"
                    hasSection={!!rule.ruleA && Array.isArray(rule.ruleA) && rule.ruleA.length > 0}
                    items={Array.isArray(rule.ruleA) ? rule.ruleA : []}
                    onAdd={() => addSection(rule.id, "A")}
                    onRemove={() => removeSection(rule.id, "A")}
                    onRemoveItem={(itemId) => removeItemFromSection(rule.id, "A", itemId)}
                    onSaveItem={(itemId, data) => {
                      const updated = (Array.isArray(rule.ruleA) ? rule.ruleA : []).map(item => item.id === itemId ? data : item);
                      updateRule(rule.id, { ruleA: updated });
                    }}
                    sectionType="A"
                    ruleId={rule.id}
                  />

                  <SectionDisplay
                    title="B1. 고정 규정"
                    hasSection={!!rule.ruleB1 && Array.isArray(rule.ruleB1) && rule.ruleB1.length > 0}
                    items={Array.isArray(rule.ruleB1) ? rule.ruleB1 : []}
                    onAdd={() => addSection(rule.id, "B1")}
                    onRemove={() => removeSection(rule.id, "B1")}
                    onRemoveItem={(itemId) => removeItemFromSection(rule.id, "B1", itemId)}
                    onSaveItem={(itemId, data) => {
                      const updated = (Array.isArray(rule.ruleB1) ? rule.ruleB1 : []).map(item => item.id === itemId ? data : item);
                      updateRule(rule.id, { ruleB1: updated });
                    }}
                    sectionType="B1"
                    ruleId={rule.id}
                  />

                  <SectionDisplay
                    title="B2. 준고정 규정"
                    hasSection={!!rule.ruleB2 && Array.isArray(rule.ruleB2) && rule.ruleB2.length > 0}
                    items={Array.isArray(rule.ruleB2) ? rule.ruleB2 : []}
                    onAdd={() => addSection(rule.id, "B2")}
                    onRemove={() => removeSection(rule.id, "B2")}
                    onRemoveItem={(itemId) => removeItemFromSection(rule.id, "B2", itemId)}
                    onSaveItem={(itemId, data) => {
                      const updated = (Array.isArray(rule.ruleB2) ? rule.ruleB2 : []).map(item => item.id === itemId ? data : item);
                      updateRule(rule.id, { ruleB2: updated });
                    }}
                    sectionType="B2"
                    ruleId={rule.id}
                  />

                  <SectionDisplay
                    title="B3. 선택 규정"
                    hasSection={!!rule.ruleB3 && Array.isArray(rule.ruleB3) && rule.ruleB3.length > 0}
                    items={Array.isArray(rule.ruleB3) ? rule.ruleB3 : []}
                    onAdd={() => addSection(rule.id, "B3")}
                    onRemove={() => removeSection(rule.id, "B3")}
                    onRemoveItem={(itemId) => removeItemFromSection(rule.id, "B3", itemId)}
                    onSaveItem={(itemId, data) => {
                      const updated = (Array.isArray(rule.ruleB3) ? rule.ruleB3 : []).map(item => item.id === itemId ? data : item);
                      updateRule(rule.id, { ruleB3: updated });
                    }}
                    sectionType="B3"
                    ruleId={rule.id}
                  />

                  <SectionDisplay
                    title="C1. 고정 규정 (강화 모드)"
                    hasSection={!!rule.ruleC1 && Array.isArray(rule.ruleC1) && rule.ruleC1.length > 0}
                    items={Array.isArray(rule.ruleC1) ? rule.ruleC1 : []}
                    onAdd={() => addSection(rule.id, "C1")}
                    onRemove={() => removeSection(rule.id, "C1")}
                    onRemoveItem={(itemId) => removeItemFromSection(rule.id, "C1", itemId)}
                    onSaveItem={(itemId, data) => {
                      const updated = (Array.isArray(rule.ruleC1) ? rule.ruleC1 : []).map(item => item.id === itemId ? data : item);
                      updateRule(rule.id, { ruleC1: updated });
                    }}
                    sectionType="C1"
                    ruleId={rule.id}
                  />

                  <SectionDisplay
                    title="C2. 준고정 규정 (강화 모드)"
                    hasSection={!!rule.ruleC2 && Array.isArray(rule.ruleC2) && rule.ruleC2.length > 0}
                    items={Array.isArray(rule.ruleC2) ? rule.ruleC2 : []}
                    onAdd={() => addSection(rule.id, "C2")}
                    onRemove={() => removeSection(rule.id, "C2")}
                    onRemoveItem={(itemId) => removeItemFromSection(rule.id, "C2", itemId)}
                    onSaveItem={(itemId, data) => {
                      const updated = (Array.isArray(rule.ruleC2) ? rule.ruleC2 : []).map(item => item.id === itemId ? data : item);
                      updateRule(rule.id, { ruleC2: updated });
                    }}
                    sectionType="C2"
                    ruleId={rule.id}
                  />

                  <SectionDisplay
                    title="C3. 선택 규정 (강화 모드)"
                    hasSection={!!rule.ruleC3 && Array.isArray(rule.ruleC3) && rule.ruleC3.length > 0}
                    items={Array.isArray(rule.ruleC3) ? rule.ruleC3 : []}
                    onAdd={() => addSection(rule.id, "C3")}
                    onRemove={() => removeSection(rule.id, "C3")}
                    onRemoveItem={(itemId) => removeItemFromSection(rule.id, "C3", itemId)}
                    onSaveItem={(itemId, data) => {
                      const updated = (Array.isArray(rule.ruleC3) ? rule.ruleC3 : []).map(item => item.id === itemId ? data : item);
                      updateRule(rule.id, { ruleC3: updated });
                    }}
                    sectionType="C3"
                    ruleId={rule.id}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredRules.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            선택한 카테고리에 규정이 없습니다.
          </div>
        )}
      </main>

      {/* 규정 추가 모달 - 대분류, 프리셋, 상태만 설정 */}
      {showAddModal && (
        <AddRuleModal
          onSave={(rule) => {
            saveNewRule(rule);
          }}
          onCancel={() => {
            setShowAddModal(false);
          }}
          categories={dynamicCategories}
          presets={dynamicPresets}
          statuses={dynamicStatuses}
          categoryLabels={categoryLabels}
          presetLabels={presetLabels}
        />
      )}

      {/* 대분류 추가 모달 */}
      {showCategoryModal && (
        <AddOptionModal
          title="대분류 추가"
          onSave={(value) => {
            addCategory(value);
            setShowCategoryModal(false);
          }}
          onCancel={() => setShowCategoryModal(false)}
        />
      )}

      {/* 프리셋 추가 모달 */}
      {showPresetModal && (
        <AddOptionModal
          title="프리셋 추가"
          onSave={(value) => {
            addPreset(value);
            setShowPresetModal(false);
          }}
          onCancel={() => setShowPresetModal(false)}
        />
      )}

      {/* 상태 추가 모달 */}
      {showStatusModal && (
        <AddOptionModal
          title="상태 추가"
          onSave={(value) => {
            addStatus(value);
            setShowStatusModal(false);
          }}
          onCancel={() => setShowStatusModal(false)}
        />
      )}
    </div>
  );
}

// 섹션 표시 컴포넌트 - 내용 표시 + 아래에 추가 버튼 하나
function SectionDisplay({
  title,
  hasSection,
  items,
  onAdd,
  onRemove,
  onRemoveItem,
  onSaveItem,
  sectionType,
  ruleId,
}: {
  title: string;
  hasSection: boolean;
  items: SectionItem[];
  onAdd: () => void;
  onRemove: () => void;
  onRemoveItem: (itemId: string) => void;
  onSaveItem: (itemId: string, data: SectionData) => void;
  sectionType: RuleSectionType;
  ruleId: string;
}) {
  const inputCls = "w-full px-2 py-1 border border-gray-200 rounded text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent";
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  // 섹션 내용 표시 - 배열을 순회하며 표시
  const renderSectionContent = () => {
    if (!items || items.length === 0) return null;

    return items.map((item, index) => {
      const renderItem = () => {
        switch (sectionType) {
          case "A":
            return (
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-gray-500">목적:</span> <span className="text-gray-900">{item.purpose || "-"}</span>
                </div>
                <div>
                  <span className="text-gray-500">대상:</span> <span className="text-gray-900">{item.target || "-"}</span>
                </div>
                <div>
                  <span className="text-gray-500">금지:</span> <span className="text-gray-900">{item.prohibition || "-"}</span>
                </div>
                <div>
                  <span className="text-gray-500">안전:</span> <span className="text-gray-900">{item.safety || "-"}</span>
                </div>
                <div>
                  <span className="text-gray-500">윤리:</span> <span className="text-gray-900">{item.ethics || "-"}</span>
                </div>
                <div>
                  <span className="text-gray-500">보안:</span> <span className="text-gray-900">{item.security || "-"}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-500">체크리스트:</span> <span className="text-gray-900">{item.checklist || "-"}</span>
                </div>
              </div>
            );
          case "B1":
            return (
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-gray-500">형식:</span> <span className="text-gray-900">{item.format || "-"}</span>
                </div>
                <div>
                  <span className="text-gray-500">레이아웃:</span> <span className="text-gray-900">{item.layout || "-"}</span>
                </div>
                <div>
                  <span className="text-gray-500">분량:</span> <span className="text-gray-900">{item.volume || "-"}</span>
                </div>
                <div>
                  <span className="text-gray-500">표현 제약:</span> <span className="text-gray-900">{item.expressionRestrictions || "-"}</span>
                </div>
                <div>
                  <span className="text-gray-500">검증:</span> <span className="text-gray-900">{item.verification || "-"}</span>
                </div>
                <div>
                  <span className="text-gray-500">근거:</span> <span className="text-gray-900">{item.basis || "-"}</span>
                </div>
          <div className="col-span-2">
            <span className="text-gray-500">책임·용도 고지:</span> <span className="text-gray-900">{item.responsibilityNotice || "-"}</span>
          </div>
          {/* 동적 필드 표시 */}
          {(item.customFields || []).length > 0 && (
            <div className="col-span-2 border-t pt-2 mt-2">
              <div className="text-xs font-semibold text-gray-700 mb-1">추가 필드</div>
              {(item.customFields || []).map((field: CustomField) => (
                <div key={field.id} className="mb-1">
                  <span className="text-gray-500">{field.label}:</span> <span className="text-gray-900">{field.value || "-"}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    case "B2":
            return (
              <div className="grid grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-gray-500">분량:</span> <span className="text-gray-900">
                    {item.volume === "short" ? "짧음" : item.volume === "normal" ? "보통" : item.volume === "detailed" ? "상세" : "-"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">전문용어:</span> <span className="text-gray-900">
                    {item.technicalTerms === "low" ? "낮음" : item.technicalTerms === "medium" ? "중간" : item.technicalTerms === "high" ? "높음" : "-"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">근거 강도:</span> <span className="text-gray-900">
                    {item.basisStrength === "none" ? "없음" : item.basisStrength === "recommended" ? "권장" : item.basisStrength === "required" ? "필수" : "-"}
                  </span>
                </div>
                <div className="col-span-3 flex gap-4">
                  <span className="text-gray-500">검증:</span>
                  <span className={item.factualityVerification ? "text-green-600" : "text-gray-400"}>사실성 {item.factualityVerification ? "ON" : "OFF"}</span>
                  <span className={item.logicVerification ? "text-green-600" : "text-gray-400"}>논리성 {item.logicVerification ? "ON" : "OFF"}</span>
                  <span className={item.consistencyVerification ? "text-green-600" : "text-gray-400"}>일관성 {item.consistencyVerification ? "ON" : "OFF"}</span>
                  <span className={item.internalStandards ? "text-green-600" : "text-gray-400"}>내부 기준 {item.internalStandards ? "ON" : "OFF"}</span>
                </div>
                <div>
                  <span className="text-gray-500">고지 위치:</span> <span className="text-gray-900">
                    {item.noticeLocation === "top" ? "상단" : item.noticeLocation === "bottom" ? "하단" : item.noticeLocation === "eachSection" ? "각 섹션 말미" : "-"}
                  </span>
                </div>
              </div>
            );
          case "B3":
            return (
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="col-span-2 flex gap-4 flex-wrap">
                  <span className="text-gray-500">옵션:</span>
                  {item.summaryFirst && <span className="text-green-600">요약 먼저 배치</span>}
                  {item.fixedTableTemplate && <span className="text-green-600">표 템플릿 고정</span>}
                  {item.glossary && <span className="text-green-600">용어집 추가</span>}
                  {item.verificationReport && <span className="text-green-600">검증 리포트 섹션</span>}
                </div>
                <div>
                  <span className="text-gray-500">인용 방식:</span> <span className="text-gray-900">
                    {item.citationMethod === "footnote" ? "각주" : item.citationMethod === "parentheses" ? "괄호" : item.citationMethod === "references" ? "참고문헌" : "-"}
                  </span>
                </div>
              </div>
            );
          case "C1":
            return (
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="col-span-2 flex gap-4 flex-wrap">
                  <span className="text-gray-500">옵션:</span>
                  {item.fixedOutputStructure && <span className="text-green-600">결과물 구조 고정</span>}
                  {item.checklistApplication && <span className="text-green-600">체크리스트 적용</span>}
                  {item.historyManagement && <span className="text-green-600">이력 관리 기본</span>}
                  {item.reviewNotation && <span className="text-green-600">검수 표기 기본</span>}
                </div>
              </div>
            );
          case "C2":
            return (
              <div className="grid grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-gray-500">구조 깊이:</span> <span className="text-gray-900">
                    {item.structureDepth === "shallow" ? "얕게" : item.structureDepth === "basic" ? "기본" : item.structureDepth === "deep" ? "깊게" : "-"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">체크 엄격도:</span> <span className="text-gray-900">
                    {item.checkStrictness === "low" ? "낮음" : item.checkStrictness === "medium" ? "중간" : item.checkStrictness === "high" ? "높음" : "-"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">지역·문화 범위:</span> <span className="text-gray-900">
                    {item.regionalCulturalScope === "kr" ? "KR" : item.regionalCulturalScope === "global" ? "글로벌" : "-"}
                  </span>
                </div>
                <div className="col-span-3 flex gap-4 flex-wrap">
                  <span className="text-gray-500">활성 옵션:</span>
                  {item.institutionGuideReflection && <span className="text-green-600">기관 가이드 반영</span>}
                  {item.brandTone && <span className="text-green-600">브랜드 톤</span>}
                  {item.readabilityEnhancement && <span className="text-green-600">가독성 강화</span>}
                  {item.sensitiveFilter && <span className="text-green-600">민감 필터</span>}
                  {item.reviewBadge && <span className="text-green-600">검수 배지</span>}
                </div>
              </div>
            );
          case "C3":
            return (
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="col-span-2 flex gap-4 flex-wrap">
                  <span className="text-gray-500">옵션:</span>
                  {item.sensitiveTopicFilter && <span className="text-green-600">민감 주제 필터 강화</span>}
                  {item.countrySpecificStandards && <span className="text-green-600">국가별 법·문화 기준</span>}
                  {item.versionControl && <span className="text-green-600">버전관리/수정이력</span>}
                  {item.sensitiveWarningBox && <span className="text-green-600">민감 경고 박스</span>}
                  {item.changeHighlight && <span className="text-green-600">변경점 하이라이트</span>}
                  {item.brandExamples && <span className="text-green-600">브랜드 예문</span>}
                  {item.checklistResultReport && <span className="text-green-600">체크리스트 결과 리포트</span>}
                </div>
              </div>
            );
          default:
            return <div className="text-xs text-gray-500">내용 없음</div>;
        }
      };

      return (
        <div key={item.id} className="mb-4 pb-4 border-b border-gray-200 last:border-0">
          <div className="flex items-center justify-between mb-2">
            {editingItemId === item.id ? (
              <input
                type="text"
                value={item.title || `항목 ${index + 1}`}
                onChange={(e) => {
                  const updated = { ...item, title: e.target.value };
                  onSaveItem(item.id, updated);
                }}
                className="text-xs font-medium text-gray-700 px-2 py-1 border border-gray-300 rounded bg-white"
                placeholder={`항목 ${index + 1}`}
              />
            ) : (
              <span className="text-xs font-medium text-gray-700">{item.title || `항목 ${index + 1}`}</span>
            )}
            <div className="flex gap-2">
              {editingItemId === item.id ? (
                <>
                  <button
                    onClick={() => setEditingItemId(null)}
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-400 text-white rounded hover:bg-gray-500"
                  >
                    <X className="w-3 h-3" />
                    취소
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setEditingItemId(item.id)}
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700"
                  >
                    <Edit2 className="w-3 h-3" />
                    수정
                  </button>
                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    <Trash2 className="w-3 h-3" />
                    삭제
                  </button>
                </>
              )}
            </div>
          </div>
          {editingItemId === item.id ? (
            <ItemEditForm
              item={item}
              sectionType={sectionType}
              onSave={(data) => {
                console.log("저장 호출:", item.id, data); // 디버깅용
                onSaveItem(item.id, data);
                setEditingItemId(null);
              }}
              onCancel={() => setEditingItemId(null)}
            />
          ) : (
            <div className="p-3 bg-gray-50 rounded">
              {renderItem()}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="border-t pt-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        {hasSection && (
          <button
            onClick={onRemove}
            className="flex items-center gap-1 px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
          >
            <Trash2 className="w-3 h-3" />
            섹션 삭제
          </button>
        )}
      </div>
      {hasSection && (
        <div className="mb-3">
          {renderSectionContent()}
        </div>
      )}
      {/* 섹션이 없을 때만 섹션 추가 버튼 표시 */}
      {!hasSection && (
        <div className="flex justify-end">
          <button
            onClick={onAdd}
            className="flex items-center gap-1 px-3 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            <Plus className="w-3 h-3" />
            추가
          </button>
        </div>
      )}
    </div>
  );
}

// 수정 모드 컴포넌트 - 기존 항목 표시 + 새 항목 추가 가능
function SectionEditMode({
  title,
  items,
  sectionType,
  onAddItem,
  onRemoveItem,
  onSaveItem,
  onCancel,
  editingItemId,
  setEditingItemId,
}: {
  title: string;
  items: SectionItem[];
  sectionType: RuleSectionType;
  onAddItem: () => void;
  onRemoveItem: (itemId: string) => void;
  onSaveItem: (itemId: string, data: SectionData) => void;
  onCancel: () => void;
  editingItemId: string | null;
  setEditingItemId: (id: string | null) => void;
}) {
  return (
    <div className="border-t pt-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        <button
          onClick={onCancel}
          className="flex items-center gap-1 px-3 py-1 text-xs bg-gray-400 text-white rounded hover:bg-gray-500"
        >
          <X className="w-3 h-3" />
          취소
        </button>
      </div>
      
      {/* 기존 항목들 표시 */}
      {(items || []).map((item, index) => (
        <div key={item.id} className="mb-4 p-4 bg-gray-50 rounded border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-700">항목 {index + 1}</span>
            <button
              onClick={() => onRemoveItem(item.id)}
              className="flex items-center gap-1 px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
            >
              <Trash2 className="w-3 h-3" />
              삭제
            </button>
          </div>
          {editingItemId === item.id ? (
            <ItemEditForm
              item={item}
              sectionType={sectionType}
              onSave={(data) => {
                onSaveItem(item.id, data);
                setEditingItemId(null);
              }}
              onCancel={() => setEditingItemId(null)}
            />
          ) : (
            <div>
              <ItemDisplay item={item} sectionType={sectionType} />
              <button
                onClick={() => setEditingItemId(item.id)}
                className="mt-2 flex items-center gap-1 px-2 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                <Edit2 className="w-3 h-3" />
                수정
              </button>
            </div>
          )}
        </div>
      ))}
      
      {/* 새 항목 추가 버튼 */}
      <div className="flex justify-end">
        <button
          onClick={onAddItem}
          className="flex items-center gap-1 px-3 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          <Plus className="w-3 h-3" />
          추가하기
        </button>
      </div>
    </div>
  );
}

// 항목 표시 컴포넌트
function ItemDisplay({ item, sectionType }: { item: SectionItem; sectionType: RuleSectionType }) {
  switch (sectionType) {
    case "A":
      const defaultLabelsA_display = {
        purpose: "목적",
        target: "대상",
        prohibition: "금지",
        safety: "안전",
        ethics: "윤리",
        security: "보안",
        checklist: "체크리스트",
      };
      const labelsA_display = { ...defaultLabelsA_display, ...(item.fieldLabels || {}) };
      return (
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-gray-500">{labelsA_display.purpose}:</span> <span className="text-gray-900">{item.purpose || "-"}</span>
          </div>
          <div>
            <span className="text-gray-500">{labelsA_display.target}:</span> <span className="text-gray-900">{item.target || "-"}</span>
          </div>
          <div>
            <span className="text-gray-500">{labelsA_display.prohibition}:</span> <span className="text-gray-900">{item.prohibition || "-"}</span>
          </div>
          <div>
            <span className="text-gray-500">{labelsA_display.safety}:</span> <span className="text-gray-900">{item.safety || "-"}</span>
          </div>
          <div>
            <span className="text-gray-500">{labelsA_display.ethics}:</span> <span className="text-gray-900">{item.ethics || "-"}</span>
          </div>
          <div>
            <span className="text-gray-500">{labelsA_display.security}:</span> <span className="text-gray-900">{item.security || "-"}</span>
          </div>
          <div className="col-span-2">
            <span className="text-gray-500">{labelsA_display.checklist}:</span> <span className="text-gray-900">{item.checklist || "-"}</span>
          </div>
          {/* 동적 필드 표시 */}
          {(item.customFields || []).length > 0 && (
            <div className="col-span-2 border-t pt-2 mt-2">
              <div className="text-xs font-semibold text-gray-700 mb-1">추가 필드</div>
              {(item.customFields || []).map((field: CustomField) => (
                <div key={field.id} className="mb-1">
                  <span className="text-gray-500">{field.label}:</span> <span className="text-gray-900">{field.value || "-"}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    case "B1":
      return (
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-gray-500">형식:</span> <span className="text-gray-900">{item.format || "-"}</span>
          </div>
          <div>
            <span className="text-gray-500">레이아웃:</span> <span className="text-gray-900">{item.layout || "-"}</span>
          </div>
          <div>
            <span className="text-gray-500">분량:</span> <span className="text-gray-900">{item.volume || "-"}</span>
          </div>
          <div>
            <span className="text-gray-500">표현 제약:</span> <span className="text-gray-900">{item.expressionRestrictions || "-"}</span>
          </div>
          <div>
            <span className="text-gray-500">검증:</span> <span className="text-gray-900">{item.verification || "-"}</span>
          </div>
          <div>
            <span className="text-gray-500">근거:</span> <span className="text-gray-900">{item.basis || "-"}</span>
          </div>
          <div className="col-span-2">
            <span className="text-gray-500">책임·용도 고지:</span> <span className="text-gray-900">{item.responsibilityNotice || "-"}</span>
          </div>
          {/* 동적 필드 표시 */}
          {(item.customFields || []).length > 0 && (
            <div className="col-span-2 border-t pt-2 mt-2">
              <div className="text-xs font-semibold text-gray-700 mb-1">추가 필드</div>
              {(item.customFields || []).map((field: CustomField) => (
                <div key={field.id} className="mb-1">
                  <span className="text-gray-500">{field.label}:</span> <span className="text-gray-900">{field.value || "-"}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    case "B2":
      return (
        <div className="grid grid-cols-3 gap-4 text-xs">
          <div>
            <span className="text-gray-500">분량:</span> <span className="text-gray-900">
              {item.volume === "short" ? "짧음" : item.volume === "normal" ? "보통" : item.volume === "detailed" ? "상세" : "-"}
            </span>
          </div>
          <div>
            <span className="text-gray-500">전문용어:</span> <span className="text-gray-900">
              {item.technicalTerms === "low" ? "낮음" : item.technicalTerms === "medium" ? "중간" : item.technicalTerms === "high" ? "높음" : "-"}
            </span>
          </div>
          <div>
            <span className="text-gray-500">근거 강도:</span> <span className="text-gray-900">
              {item.basisStrength === "none" ? "없음" : item.basisStrength === "recommended" ? "권장" : item.basisStrength === "required" ? "필수" : "-"}
            </span>
          </div>
          <div className="col-span-3 flex gap-4">
            <span className="text-gray-500">검증:</span>
            <span className={item.factualityVerification ? "text-green-600" : "text-gray-400"}>사실성 {item.factualityVerification ? "ON" : "OFF"}</span>
            <span className={item.logicVerification ? "text-green-600" : "text-gray-400"}>논리성 {item.logicVerification ? "ON" : "OFF"}</span>
            <span className={item.consistencyVerification ? "text-green-600" : "text-gray-400"}>일관성 {item.consistencyVerification ? "ON" : "OFF"}</span>
            <span className={item.internalStandards ? "text-green-600" : "text-gray-400"}>내부 기준 {item.internalStandards ? "ON" : "OFF"}</span>
          </div>
          <div>
            <span className="text-gray-500">고지 위치:</span> <span className="text-gray-900">
              {item.noticeLocation === "top" ? "상단" : item.noticeLocation === "bottom" ? "하단" : item.noticeLocation === "eachSection" ? "각 섹션 말미" : "-"}
            </span>
          </div>
          {/* 동적 필드 표시 */}
          {(item.customFields || []).length > 0 && (
            <div className="col-span-3 border-t pt-2 mt-2">
              <div className="text-xs font-semibold text-gray-700 mb-1">추가 필드</div>
              {(item.customFields || []).map((field: CustomField) => (
                <div key={field.id} className="mb-1">
                  <span className="text-gray-500">{field.label}:</span> <span className="text-gray-900">{field.value || "-"}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    case "B3":
      return (
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="col-span-2 flex gap-4 flex-wrap">
            <span className="text-gray-500">옵션:</span>
            {item.summaryFirst && <span className="text-green-600">요약 먼저 배치</span>}
            {item.fixedTableTemplate && <span className="text-green-600">표 템플릿 고정</span>}
            {item.glossary && <span className="text-green-600">용어집 추가</span>}
            {item.verificationReport && <span className="text-green-600">검증 리포트 섹션</span>}
          </div>
          <div>
            <span className="text-gray-500">인용 방식:</span> <span className="text-gray-900">
              {item.citationMethod === "footnote" ? "각주" : item.citationMethod === "parentheses" ? "괄호" : item.citationMethod === "references" ? "참고문헌" : "-"}
            </span>
          </div>
          {/* 동적 필드 표시 */}
          {(item.customFields || []).length > 0 && (
            <div className="col-span-2 border-t pt-2 mt-2">
              <div className="text-xs font-semibold text-gray-700 mb-1">추가 필드</div>
              {(item.customFields || []).map((field: CustomField) => (
                <div key={field.id} className="mb-1">
                  <span className="text-gray-500">{field.label}:</span> <span className="text-gray-900">{field.value || "-"}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    case "C1":
      return (
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="col-span-2 flex gap-4 flex-wrap">
            <span className="text-gray-500">옵션:</span>
            {item.fixedOutputStructure && <span className="text-green-600">결과물 구조 고정</span>}
            {item.checklistApplication && <span className="text-green-600">체크리스트 적용</span>}
            {item.historyManagement && <span className="text-green-600">이력 관리 기본</span>}
            {item.reviewNotation && <span className="text-green-600">검수 표기 기본</span>}
          </div>
          {/* 동적 필드 표시 */}
          {(item.customFields || []).map((field: CustomField) => (
            <div key={field.id} className="col-span-2">
              <span className="text-gray-500">{field.label}:</span> <span className="text-gray-900">{field.value || "-"}</span>
            </div>
          ))}
        </div>
      );
    case "C2":
      return (
        <div className="grid grid-cols-3 gap-4 text-xs">
          <div>
            <span className="text-gray-500">구조 깊이:</span> <span className="text-gray-900">
              {item.structureDepth === "shallow" ? "얕게" : item.structureDepth === "basic" ? "기본" : item.structureDepth === "deep" ? "깊게" : "-"}
            </span>
          </div>
          <div>
            <span className="text-gray-500">체크 엄격도:</span> <span className="text-gray-900">
              {item.checkStrictness === "low" ? "낮음" : item.checkStrictness === "medium" ? "중간" : item.checkStrictness === "high" ? "높음" : "-"}
            </span>
          </div>
          <div>
            <span className="text-gray-500">지역·문화 범위:</span> <span className="text-gray-900">
              {item.regionalCulturalScope === "kr" ? "KR" : item.regionalCulturalScope === "global" ? "글로벌" : "-"}
            </span>
          </div>
          <div className="col-span-3 flex gap-4 flex-wrap">
            <span className="text-gray-500">활성 옵션:</span>
            {item.institutionGuideReflection && <span className="text-green-600">기관 가이드 반영</span>}
            {item.brandTone && <span className="text-green-600">브랜드 톤</span>}
            {item.readabilityEnhancement && <span className="text-green-600">가독성 강화</span>}
            {item.sensitiveFilter && <span className="text-green-600">민감 필터</span>}
            {item.reviewBadge && <span className="text-green-600">검수 배지</span>}
          </div>
          {/* 동적 필드 표시 */}
          {(item.customFields || []).length > 0 && (
            <div className="col-span-3 border-t pt-2 mt-2">
              <div className="text-xs font-semibold text-gray-700 mb-1">추가 필드</div>
              {(item.customFields || []).map((field: CustomField) => (
                <div key={field.id} className="mb-1">
                  <span className="text-gray-500">{field.label}:</span> <span className="text-gray-900">{field.value || "-"}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    case "C3":
      return (
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="col-span-2 flex gap-4 flex-wrap">
            <span className="text-gray-500">옵션:</span>
            {item.sensitiveTopicFilter && <span className="text-green-600">민감 주제 필터 강화</span>}
            {item.countrySpecificStandards && <span className="text-green-600">국가별 법·문화 기준</span>}
            {item.versionControl && <span className="text-green-600">버전관리/수정이력</span>}
            {item.sensitiveWarningBox && <span className="text-green-600">민감 경고 박스</span>}
            {item.changeHighlight && <span className="text-green-600">변경점 하이라이트</span>}
            {item.brandExamples && <span className="text-green-600">브랜드 예문</span>}
            {item.checklistResultReport && <span className="text-green-600">체크리스트 결과 리포트</span>}
          </div>
          {/* 동적 필드 표시 */}
          {(item.customFields || []).length > 0 && (
            <div className="col-span-2 border-t pt-2 mt-2">
              <div className="text-xs font-semibold text-gray-700 mb-1">추가 필드</div>
              {(item.customFields || []).map((field: CustomField) => (
                <div key={field.id} className="mb-1">
                  <span className="text-gray-500">{field.label}:</span> <span className="text-gray-900">{field.value || "-"}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    default:
      return <div className="text-xs text-gray-500">내용 없음</div>;
  }
}

// 항목 편집 폼 컴포넌트
function ItemEditForm({
  item,
  sectionType,
  onSave,
  onCancel,
}: {
  item: SectionItem;
  sectionType: RuleSectionType;
  onSave: (data: SectionData) => void;
  onCancel: () => void;
}) {
  const [data, setData] = useState(item);
  const [showAddFieldModal, setShowAddFieldModal] = useState(false);
  const [newFieldLabel, setNewFieldLabel] = useState("");
  const inputCls = "w-full px-2 py-1 border border-gray-200 rounded text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent";

  // item이 변경되면 data도 업데이트
  useEffect(() => {
    if (item) {
      setData({
        ...item,
        customFields: item.customFields || [],
      });
    }
  }, [item]);

  const addCustomField = () => {
    if (!newFieldLabel.trim()) return;
    const newField = {
      id: `field-${Date.now()}`,
      label: newFieldLabel.trim(),
      value: "",
      type: "text" as const,
    };
    setData({
      ...data,
      customFields: [...(data.customFields || []), newField],
    });
    setNewFieldLabel("");
    setShowAddFieldModal(false);
  };

  const removeCustomField = (fieldId: string) => {
    setData({
      ...data,
      customFields: (data.customFields || []).filter((f: CustomField) => f.id !== fieldId),
    });
  };

  const updateCustomField = (fieldId: string, value: string) => {
    setData({
      ...data,
      customFields: (data.customFields || []).map((f: CustomField) =>
        f.id === fieldId ? { ...f, value } : f
      ),
    });
  };

  const renderForm = () => {
    switch (sectionType) {
      case "A":
        const defaultLabelsA = {
          purpose: "목적",
          target: "대상",
          prohibition: "금지",
          safety: "안전",
          ethics: "윤리",
          security: "보안",
          checklist: "체크리스트",
        };
        const labelsA = { ...defaultLabelsA, ...(data.fieldLabels || {}) };
        return (
          <div className="grid grid-cols-2 gap-4">
            {["purpose", "target", "prohibition", "safety", "ethics", "security"].map((field) => (
              <div key={field}>
                <div className="flex items-center gap-2 mb-1">
                  <input
                    type="text"
                    value={labelsA[field as keyof typeof labelsA] || ""}
                    onChange={(e) => setData({
                      ...data,
                      fieldLabels: {
                        ...(data.fieldLabels || {}),
                        [field]: e.target.value
                      }
                    })}
                    className="flex-1 px-2 py-1 border border-gray-200 rounded text-xs"
                    placeholder={defaultLabelsA[field as keyof typeof defaultLabelsA]}
                  />
                </div>
                <input 
                  type="text" 
                  value={data[field] || ""} 
                  onChange={(e) => setData({...data, [field]: e.target.value})} 
                  className={inputCls} 
                />
              </div>
            ))}
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-1">
                <input
                  type="text"
                  value={labelsA.checklist || ""}
                  onChange={(e) => setData({
                    ...data,
                    fieldLabels: {
                      ...(data.fieldLabels || {}),
                      checklist: e.target.value
                    }
                  })}
                  className="flex-1 px-2 py-1 border border-gray-200 rounded text-xs"
                  placeholder="체크리스트"
                />
              </div>
              <input 
                type="text" 
                value={data.checklist || ""} 
                onChange={(e) => setData({...data, checklist: e.target.value})} 
                className={inputCls} 
              />
            </div>
          </div>
        );
      case "B1":
        return (
          <div className="grid grid-cols-2 gap-4">
            {["format", "layout", "volume", "expressionRestrictions", "verification", "basis"].map((field) => (
              <div key={field}>
                <label className="block text-xs text-gray-600 mb-1">
                  {field === "format" ? "형식(템플릿)" : field === "layout" ? "레이아웃" : field === "volume" ? "분량" : field === "expressionRestrictions" ? "표현 제약" : field === "verification" ? "검증" : "근거"}
                </label>
                <input 
                  type="text" 
                  value={data[field] || ""} 
                  onChange={(e) => setData({...data, [field]: e.target.value})} 
                  className={inputCls} 
                />
              </div>
            ))}
            <div className="col-span-2">
              <label className="block text-xs text-gray-600 mb-1">책임·용도 고지</label>
              <input 
                type="text" 
                value={data.responsibilityNotice || ""} 
                onChange={(e) => setData({...data, responsibilityNotice: e.target.value})} 
                className={inputCls} 
              />
            </div>
          </div>
        );
      case "B2":
        return (
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-600 mb-1">분량</label>
              <select value={data.volume || "normal"} onChange={(e) => setData({...data, volume: e.target.value})} className={inputCls}>
                <option value="short">짧음</option>
                <option value="normal">보통</option>
                <option value="detailed">상세</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">전문용어</label>
              <select value={data.technicalTerms || "medium"} onChange={(e) => setData({...data, technicalTerms: e.target.value})} className={inputCls}>
                <option value="low">낮음</option>
                <option value="medium">중간</option>
                <option value="high">높음</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">근거 강도</label>
              <select value={data.basisStrength || "recommended"} onChange={(e) => setData({...data, basisStrength: e.target.value})} className={inputCls}>
                <option value="none">없음</option>
                <option value="recommended">권장</option>
                <option value="required">필수</option>
              </select>
            </div>
            <div className="col-span-3 flex gap-4">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={data.factualityVerification || false} onChange={(e) => setData({...data, factualityVerification: e.target.checked})} />
                <span className="text-xs">사실성 검증</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={data.logicVerification || false} onChange={(e) => setData({...data, logicVerification: e.target.checked})} />
                <span className="text-xs">논리성 검증</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={data.consistencyVerification || false} onChange={(e) => setData({...data, consistencyVerification: e.target.checked})} />
                <span className="text-xs">일관성 검증</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={data.internalStandards || false} onChange={(e) => setData({...data, internalStandards: e.target.checked})} />
                <span className="text-xs">내부 기준</span>
              </label>
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">고지 위치</label>
              <select value={data.noticeLocation || "bottom"} onChange={(e) => setData({...data, noticeLocation: e.target.value})} className={inputCls}>
                <option value="top">상단</option>
                <option value="bottom">하단</option>
                <option value="eachSection">각 섹션 말미</option>
              </select>
            </div>
          </div>
        );
      case "B3":
        return (
          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={data.summaryFirst || false} onChange={(e) => setData({...data, summaryFirst: e.target.checked})} />
              <span className="text-xs">요약 먼저 배치</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={data.fixedTableTemplate || false} onChange={(e) => setData({...data, fixedTableTemplate: e.target.checked})} />
              <span className="text-xs">표 템플릿 고정</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={data.glossary || false} onChange={(e) => setData({...data, glossary: e.target.checked})} />
              <span className="text-xs">용어집 추가</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={data.verificationReport || false} onChange={(e) => setData({...data, verificationReport: e.target.checked})} />
              <span className="text-xs">검증 리포트 섹션</span>
            </label>
            <div>
              <label className="block text-xs text-gray-600 mb-1">인용 방식</label>
              <select value={data.citationMethod || "parentheses"} onChange={(e) => setData({...data, citationMethod: e.target.value})} className={inputCls}>
                <option value="footnote">각주</option>
                <option value="parentheses">괄호</option>
                <option value="references">참고문헌</option>
              </select>
            </div>
          </div>
        );
      case "C1":
        return (
          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={data.fixedOutputStructure || false} onChange={(e) => setData({...data, fixedOutputStructure: e.target.checked})} />
              <span className="text-xs">결과물 구조 고정</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={data.checklistApplication || false} onChange={(e) => setData({...data, checklistApplication: e.target.checked})} />
              <span className="text-xs">체크리스트 적용</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={data.historyManagement || false} onChange={(e) => setData({...data, historyManagement: e.target.checked})} />
              <span className="text-xs">이력 관리 기본</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={data.reviewNotation || false} onChange={(e) => setData({...data, reviewNotation: e.target.checked})} />
              <span className="text-xs">검수 표기 기본</span>
            </label>
          </div>
        );
      case "C2":
        return (
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-600 mb-1">구조 깊이</label>
              <select value={data.structureDepth || "basic"} onChange={(e) => setData({...data, structureDepth: e.target.value})} className={inputCls}>
                <option value="shallow">얕게</option>
                <option value="basic">기본</option>
                <option value="deep">깊게</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">체크 엄격도</label>
              <select value={data.checkStrictness || "medium"} onChange={(e) => setData({...data, checkStrictness: e.target.value})} className={inputCls}>
                <option value="low">낮음</option>
                <option value="medium">중간</option>
                <option value="high">높음</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">지역·문화 범위</label>
              <select value={data.regionalCulturalScope || "kr"} onChange={(e) => setData({...data, regionalCulturalScope: e.target.value})} className={inputCls}>
                <option value="kr">KR</option>
                <option value="global">글로벌</option>
              </select>
            </div>
            <div className="col-span-3 flex gap-4 flex-wrap">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={data.institutionGuideReflection || false} onChange={(e) => setData({...data, institutionGuideReflection: e.target.checked})} />
                <span className="text-xs">기관 가이드 반영</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={data.brandTone || false} onChange={(e) => setData({...data, brandTone: e.target.checked})} />
                <span className="text-xs">브랜드 톤</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={data.readabilityEnhancement || false} onChange={(e) => setData({...data, readabilityEnhancement: e.target.checked})} />
                <span className="text-xs">가독성 강화</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={data.sensitiveFilter || false} onChange={(e) => setData({...data, sensitiveFilter: e.target.checked})} />
                <span className="text-xs">민감 필터</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={data.reviewBadge || false} onChange={(e) => setData({...data, reviewBadge: e.target.checked})} />
                <span className="text-xs">검수 배지 표시</span>
              </label>
            </div>
            {data.institutionGuideReflection && (
              <div>
                <label className="block text-xs text-gray-600 mb-1">적용 범위</label>
                <input type="text" value={data.institutionGuideRange || ""} onChange={(e) => setData({...data, institutionGuideRange: e.target.value})} className={inputCls} placeholder="기본" />
              </div>
            )}
            {data.brandTone && (
              <div>
                <label className="block text-xs text-gray-600 mb-1">톤 강도</label>
                <select value={data.brandToneStrength || "medium"} onChange={(e) => setData({...data, brandToneStrength: e.target.value})} className={inputCls}>
                  <option value="weak">약</option>
                  <option value="medium">중</option>
                  <option value="strong">강</option>
                </select>
              </div>
            )}
            {data.readabilityEnhancement && (
              <div>
                <label className="block text-xs text-gray-600 mb-1">가독성 강도</label>
                <select value={data.readabilityStrength || "medium"} onChange={(e) => setData({...data, readabilityStrength: e.target.value})} className={inputCls}>
                  <option value="weak">약</option>
                  <option value="medium">중</option>
                  <option value="strong">강</option>
                </select>
              </div>
            )}
            {data.sensitiveFilter && (
              <div>
                <label className="block text-xs text-gray-600 mb-1">민감 필터 강도</label>
                <select value={data.sensitiveFilterStrength || "medium"} onChange={(e) => setData({...data, sensitiveFilterStrength: e.target.value})} className={inputCls}>
                  <option value="weak">약</option>
                  <option value="medium">중</option>
                  <option value="strong">강</option>
                </select>
              </div>
            )}
            <div>
              <label className="block text-xs text-gray-600 mb-1">이력 표기 수준</label>
              <select value={data.historyNotationLevel || "display"} onChange={(e) => setData({...data, historyNotationLevel: e.target.value})} className={inputCls}>
                <option value="internal">내부민</option>
                <option value="display">표시</option>
                <option value="detailed">상세표시</option>
              </select>
            </div>
          </div>
        );
      case "C3":
        return (
          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={data.sensitiveTopicFilter || false} onChange={(e) => setData({...data, sensitiveTopicFilter: e.target.checked})} />
              <span className="text-xs">민감 주제 필터 강화</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={data.countrySpecificStandards || false} onChange={(e) => setData({...data, countrySpecificStandards: e.target.checked})} />
              <span className="text-xs">국가별 법·문화 기준 적용</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={data.versionControl || false} onChange={(e) => setData({...data, versionControl: e.target.checked})} />
              <span className="text-xs">버전관리/수정이력 표시</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={data.sensitiveWarningBox || false} onChange={(e) => setData({...data, sensitiveWarningBox: e.target.checked})} />
              <span className="text-xs">민감 경고 박스</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={data.changeHighlight || false} onChange={(e) => setData({...data, changeHighlight: e.target.checked})} />
              <span className="text-xs">변경점 하이라이트</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={data.brandExamples || false} onChange={(e) => setData({...data, brandExamples: e.target.checked})} />
              <span className="text-xs">브랜드 예문 삽입</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={data.checklistResultReport || false} onChange={(e) => setData({...data, checklistResultReport: e.target.checked})} />
              <span className="text-xs">체크리스트 결과 리포트</span>
            </label>
          </div>
        );
      default:
        return <div className="text-xs text-gray-500">편집 폼 준비 중...</div>;
    }
  };

  return (
    <div className="space-y-4 p-3 bg-white border border-gray-200 rounded">
      {/* 타이틀 입력 */}
      <div>
        <label className="block text-xs text-gray-600 mb-1">항목 타이틀</label>
        <input
          type="text"
          value={data.title || ""}
          onChange={(e) => setData({...data, title: e.target.value})}
          className={inputCls}
          placeholder="항목 1"
        />
      </div>

      {/* 기본 필드들 */}
      {renderForm()}

      {/* 동적 필드들 */}
      {(data.customFields || []).length > 0 && (
        <div className="border-t pt-4 mt-4">
          <div className="text-xs font-semibold text-gray-700 mb-2">추가 필드</div>
          <div className="space-y-3">
            {(data.customFields || []).map((field: CustomField) => (
              <div key={field.id} className="flex items-center gap-2">
                <div className="flex-1">
                  <label className="block text-xs text-gray-600 mb-1">{field.label}</label>
                  <input
                    type="text"
                    value={field.value || ""}
                    onChange={(e) => updateCustomField(field.id, e.target.value)}
                    className={inputCls}
                  />
                </div>
                <button
                  onClick={() => removeCustomField(field.id)}
                  className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 추가하기 버튼 */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowAddFieldModal(true)}
          className="flex items-center gap-1 px-3 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          <Plus className="w-3 h-3" />
          추가하기
        </button>
      </div>

      {/* 저장/취소 버튼 */}
      <div className="flex justify-end gap-2 pt-2 border-t">
        <button onClick={onCancel} className="px-3 py-1 text-xs bg-gray-400 text-white rounded hover:bg-gray-500">
          취소
        </button>
        <button onClick={() => {
          const saveData = { 
            ...data, 
            id: item.id,
            customFields: data.customFields || []
          };
          console.log("저장할 데이터:", saveData); // 디버깅용
          onSave(saveData);
        }} className="px-3 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700">
          저장
        </button>
      </div>

      {/* 필드 추가 모달 */}
      {showAddFieldModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">필드 추가</h2>
              <button
                onClick={() => {
                  setShowAddFieldModal(false);
                  setNewFieldLabel("");
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">필드 이름</label>
                <input
                  type="text"
                  value={newFieldLabel}
                  onChange={(e) => setNewFieldLabel(e.target.value)}
                  className={inputCls}
                  placeholder="예: 형식2, 추가 옵션 등"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      addCustomField();
                    }
                  }}
                />
              </div>
              <div className="pt-4 border-t flex justify-end gap-2">
                <button
                  onClick={() => {
                    setShowAddFieldModal(false);
                    setNewFieldLabel("");
                  }}
                  className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                  취소
                </button>
                <button
                  onClick={addCustomField}
                  className="px-4 py-2 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700"
                >
                  추가
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 섹션 편집 폼 컴포넌트 - 각 필드별로 추가 가능
function SectionEditForm({
  title,
  sectionData,
  sectionType,
  onSave,
  onCancel,
  onRemove,
  ruleId,
  onFieldAdd,
  editingField,
}: {
  title: string;
  sectionData: SectionData;
  sectionType: RuleSectionType;
  onSave: (data: SectionData) => void;
  onCancel: () => void;
  onRemove: () => void;
  ruleId: string;
  onFieldAdd: (field: string) => void;
  editingField: { ruleId: string; section: RuleSectionType; field: string } | null;
}) {
  const inputCls = "w-full px-2 py-1 border border-gray-200 rounded text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent";
  const [data, setData] = useState(sectionData || {});

  const renderForm = () => {
    switch (sectionType) {
      case "A":
        return (
          <div className="grid grid-cols-2 gap-4">
            {["purpose", "target", "prohibition", "safety", "ethics", "security"].map((field) => (
              <div key={field}>
                <div className="flex items-center gap-2 mb-1">
                  <label className="block text-xs text-gray-600">
                    {field === "purpose" ? "목적" : field === "target" ? "대상" : field === "prohibition" ? "금지" : field === "safety" ? "안전" : field === "ethics" ? "윤리" : "보안"}
                  </label>
                  <button
                    onClick={() => onFieldAdd(field)}
                    className="text-xs text-indigo-600 hover:underline"
                  >
                    + 추가
                  </button>
                </div>
                <input 
                  type="text" 
                  value={data[field] || ""} 
                  onChange={(e) => setData({...data, [field]: e.target.value})} 
                  className={inputCls} 
                />
              </div>
            ))}
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-1">
                <label className="block text-xs text-gray-600">체크리스트</label>
                <button
                  onClick={() => onFieldAdd("checklist")}
                  className="text-xs text-indigo-600 hover:underline"
                >
                  + 추가
                </button>
              </div>
              <input 
                type="text" 
                value={data.checklist || ""} 
                onChange={(e) => setData({...data, checklist: e.target.value})} 
                className={inputCls} 
              />
            </div>
          </div>
        );
      case "B1":
        return (
          <div className="grid grid-cols-2 gap-4">
            {["format", "layout", "volume", "expressionRestrictions", "verification", "basis"].map((field) => (
              <div key={field}>
                <div className="flex items-center gap-2 mb-1">
                  <label className="block text-xs text-gray-600">
                    {field === "format" ? "형식(템플릿)" : field === "layout" ? "레이아웃" : field === "volume" ? "분량" : field === "expressionRestrictions" ? "표현 제약" : field === "verification" ? "검증" : "근거"}
                  </label>
                  <button
                    onClick={() => onFieldAdd(field)}
                    className="text-xs text-indigo-600 hover:underline"
                  >
                    + 추가
                  </button>
                </div>
                <input 
                  type="text" 
                  value={data[field] || ""} 
                  onChange={(e) => setData({...data, [field]: e.target.value})} 
                  className={inputCls} 
                />
              </div>
            ))}
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-1">
                <label className="block text-xs text-gray-600">책임·용도 고지</label>
                <button
                  onClick={() => onFieldAdd("responsibilityNotice")}
                  className="text-xs text-indigo-600 hover:underline"
                >
                  + 추가
                </button>
              </div>
              <input 
                type="text" 
                value={data.responsibilityNotice || ""} 
                onChange={(e) => setData({...data, responsibilityNotice: e.target.value})} 
                className={inputCls} 
              />
            </div>
          </div>
        );
      case "B2":
        return (
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <label className="block text-xs text-gray-600">분량</label>
                <button
                  onClick={() => onFieldAdd("volume")}
                  className="text-xs text-indigo-600 hover:underline"
                >
                  + 추가
                </button>
              </div>
              <select value={data.volume || "normal"} onChange={(e) => setData({...data, volume: e.target.value})} className={inputCls}>
                <option value="short">짧음</option>
                <option value="normal">보통</option>
                <option value="detailed">상세</option>
              </select>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <label className="block text-xs text-gray-600">전문용어</label>
                <button
                  onClick={() => onFieldAdd("technicalTerms")}
                  className="text-xs text-indigo-600 hover:underline"
                >
                  + 추가
                </button>
              </div>
              <select value={data.technicalTerms || "medium"} onChange={(e) => setData({...data, technicalTerms: e.target.value})} className={inputCls}>
                <option value="low">낮음</option>
                <option value="medium">중간</option>
                <option value="high">높음</option>
              </select>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <label className="block text-xs text-gray-600">근거 강도</label>
                <button
                  onClick={() => onFieldAdd("basisStrength")}
                  className="text-xs text-indigo-600 hover:underline"
                >
                  + 추가
                </button>
              </div>
              <select value={data.basisStrength || "recommended"} onChange={(e) => setData({...data, basisStrength: e.target.value})} className={inputCls}>
                <option value="none">없음</option>
                <option value="recommended">권장</option>
                <option value="required">필수</option>
              </select>
            </div>
            <div className="col-span-3 flex gap-4">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={data.factualityVerification || false} onChange={(e) => setData({...data, factualityVerification: e.target.checked})} />
                <span className="text-xs">사실성 검증</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={data.logicVerification || false} onChange={(e) => setData({...data, logicVerification: e.target.checked})} />
                <span className="text-xs">논리성 검증</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={data.consistencyVerification || false} onChange={(e) => setData({...data, consistencyVerification: e.target.checked})} />
                <span className="text-xs">일관성 검증</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={data.internalStandards || false} onChange={(e) => setData({...data, internalStandards: e.target.checked})} />
                <span className="text-xs">내부 기준</span>
              </label>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <label className="block text-xs text-gray-600">고지 위치</label>
                <button
                  onClick={() => onFieldAdd("noticeLocation")}
                  className="text-xs text-indigo-600 hover:underline"
                >
                  + 추가
                </button>
              </div>
              <select value={data.noticeLocation || "bottom"} onChange={(e) => setData({...data, noticeLocation: e.target.value})} className={inputCls}>
                <option value="top">상단</option>
                <option value="bottom">하단</option>
                <option value="eachSection">각 섹션 말미</option>
              </select>
            </div>
          </div>
        );
      case "B3":
        return (
          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={data.summaryFirst || false} onChange={(e) => setData({...data, summaryFirst: e.target.checked})} />
              <span className="text-xs">요약 먼저 배치</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={data.fixedTableTemplate || false} onChange={(e) => setData({...data, fixedTableTemplate: e.target.checked})} />
              <span className="text-xs">표 템플릿 고정</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={data.glossary || false} onChange={(e) => setData({...data, glossary: e.target.checked})} />
              <span className="text-xs">용어집 추가</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={data.verificationReport || false} onChange={(e) => setData({...data, verificationReport: e.target.checked})} />
              <span className="text-xs">검증 리포트 섹션</span>
            </label>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <label className="block text-xs text-gray-600">인용 방식</label>
                <button
                  onClick={() => onFieldAdd("citationMethod")}
                  className="text-xs text-indigo-600 hover:underline"
                >
                  + 추가
                </button>
              </div>
              <select value={data.citationMethod || "parentheses"} onChange={(e) => setData({...data, citationMethod: e.target.value})} className={inputCls}>
                <option value="footnote">각주</option>
                <option value="parentheses">괄호</option>
                <option value="references">참고문헌</option>
              </select>
            </div>
          </div>
        );
      case "C1":
        return (
          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={data.fixedOutputStructure || false} onChange={(e) => setData({...data, fixedOutputStructure: e.target.checked})} />
              <span className="text-xs">결과물 구조 고정</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={data.checklistApplication || false} onChange={(e) => setData({...data, checklistApplication: e.target.checked})} />
              <span className="text-xs">체크리스트 적용</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={data.historyManagement || false} onChange={(e) => setData({...data, historyManagement: e.target.checked})} />
              <span className="text-xs">이력 관리 기본</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={data.reviewNotation || false} onChange={(e) => setData({...data, reviewNotation: e.target.checked})} />
              <span className="text-xs">검수 표기 기본</span>
            </label>
          </div>
        );
      case "C2":
        return (
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <label className="block text-xs text-gray-600">구조 깊이</label>
                <button
                  onClick={() => onFieldAdd("structureDepth")}
                  className="text-xs text-indigo-600 hover:underline"
                >
                  + 추가
                </button>
              </div>
              <select value={data.structureDepth || "basic"} onChange={(e) => setData({...data, structureDepth: e.target.value})} className={inputCls}>
                <option value="shallow">얕게</option>
                <option value="basic">기본</option>
                <option value="deep">깊게</option>
              </select>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <label className="block text-xs text-gray-600">체크 엄격도</label>
                <button
                  onClick={() => onFieldAdd("checkStrictness")}
                  className="text-xs text-indigo-600 hover:underline"
                >
                  + 추가
                </button>
              </div>
              <select value={data.checkStrictness || "medium"} onChange={(e) => setData({...data, checkStrictness: e.target.value})} className={inputCls}>
                <option value="low">낮음</option>
                <option value="medium">중간</option>
                <option value="high">높음</option>
              </select>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <label className="block text-xs text-gray-600">지역·문화 범위</label>
                <button
                  onClick={() => onFieldAdd("regionalCulturalScope")}
                  className="text-xs text-indigo-600 hover:underline"
                >
                  + 추가
                </button>
              </div>
              <select value={data.regionalCulturalScope || "kr"} onChange={(e) => setData({...data, regionalCulturalScope: e.target.value})} className={inputCls}>
                <option value="kr">KR</option>
                <option value="global">글로벌</option>
              </select>
            </div>
            <div className="col-span-3 flex gap-4 flex-wrap">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={data.institutionGuideReflection || false} onChange={(e) => setData({...data, institutionGuideReflection: e.target.checked})} />
                <span className="text-xs">기관 가이드 반영</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={data.brandTone || false} onChange={(e) => setData({...data, brandTone: e.target.checked})} />
                <span className="text-xs">브랜드 톤</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={data.readabilityEnhancement || false} onChange={(e) => setData({...data, readabilityEnhancement: e.target.checked})} />
                <span className="text-xs">가독성 강화</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={data.sensitiveFilter || false} onChange={(e) => setData({...data, sensitiveFilter: e.target.checked})} />
                <span className="text-xs">민감 필터</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={data.reviewBadge || false} onChange={(e) => setData({...data, reviewBadge: e.target.checked})} />
                <span className="text-xs">검수 배지 표시</span>
              </label>
            </div>
            {data.institutionGuideReflection && (
              <div>
                <label className="block text-xs text-gray-600 mb-1">적용 범위</label>
                <input type="text" value={data.institutionGuideRange || ""} onChange={(e) => setData({...data, institutionGuideRange: e.target.value})} className={inputCls} placeholder="기본" />
              </div>
            )}
            {data.brandTone && (
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <label className="block text-xs text-gray-600">톤 강도</label>
                  <button
                    onClick={() => onFieldAdd("brandToneStrength")}
                    className="text-xs text-indigo-600 hover:underline"
                  >
                    + 추가
                  </button>
                </div>
                <select value={data.brandToneStrength || "medium"} onChange={(e) => setData({...data, brandToneStrength: e.target.value})} className={inputCls}>
                  <option value="weak">약</option>
                  <option value="medium">중</option>
                  <option value="strong">강</option>
                </select>
              </div>
            )}
            {data.readabilityEnhancement && (
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <label className="block text-xs text-gray-600">가독성 강도</label>
                  <button
                    onClick={() => onFieldAdd("readabilityStrength")}
                    className="text-xs text-indigo-600 hover:underline"
                  >
                    + 추가
                  </button>
                </div>
                <select value={data.readabilityStrength || "medium"} onChange={(e) => setData({...data, readabilityStrength: e.target.value})} className={inputCls}>
                  <option value="weak">약</option>
                  <option value="medium">중</option>
                  <option value="strong">강</option>
                </select>
              </div>
            )}
            {data.sensitiveFilter && (
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <label className="block text-xs text-gray-600">민감 필터 강도</label>
                  <button
                    onClick={() => onFieldAdd("sensitiveFilterStrength")}
                    className="text-xs text-indigo-600 hover:underline"
                  >
                    + 추가
                  </button>
                </div>
                <select value={data.sensitiveFilterStrength || "medium"} onChange={(e) => setData({...data, sensitiveFilterStrength: e.target.value})} className={inputCls}>
                  <option value="weak">약</option>
                  <option value="medium">중</option>
                  <option value="strong">강</option>
                </select>
              </div>
            )}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <label className="block text-xs text-gray-600">이력 표기 수준</label>
                <button
                  onClick={() => onFieldAdd("historyNotationLevel")}
                  className="text-xs text-indigo-600 hover:underline"
                >
                  + 추가
                </button>
              </div>
              <select value={data.historyNotationLevel || "display"} onChange={(e) => setData({...data, historyNotationLevel: e.target.value})} className={inputCls}>
                <option value="internal">내부민</option>
                <option value="display">표시</option>
                <option value="detailed">상세표시</option>
              </select>
            </div>
          </div>
        );
      case "C3":
        return (
          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={data.sensitiveTopicFilter || false} onChange={(e) => setData({...data, sensitiveTopicFilter: e.target.checked})} />
              <span className="text-xs">민감 주제 필터 강화</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={data.countrySpecificStandards || false} onChange={(e) => setData({...data, countrySpecificStandards: e.target.checked})} />
              <span className="text-xs">국가별 법·문화 기준 적용</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={data.versionControl || false} onChange={(e) => setData({...data, versionControl: e.target.checked})} />
              <span className="text-xs">버전관리/수정이력 표시</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={data.sensitiveWarningBox || false} onChange={(e) => setData({...data, sensitiveWarningBox: e.target.checked})} />
              <span className="text-xs">민감 경고 박스</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={data.changeHighlight || false} onChange={(e) => setData({...data, changeHighlight: e.target.checked})} />
              <span className="text-xs">변경점 하이라이트</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={data.brandExamples || false} onChange={(e) => setData({...data, brandExamples: e.target.checked})} />
              <span className="text-xs">브랜드 예문 삽입</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={data.checklistResultReport || false} onChange={(e) => setData({...data, checklistResultReport: e.target.checked})} />
              <span className="text-xs">체크리스트 결과 리포트</span>
            </label>
          </div>
        );
      default:
        return <div className="text-xs text-gray-500">편집 폼 준비 중...</div>;
    }
  };

  return (
    <div className="border-t pt-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        <div className="flex gap-2">
          <button
            onClick={() => onSave({ ...data, id: sectionData?.id || `section-${Date.now()}` })}
            className="flex items-center gap-1 px-3 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            <Save className="w-3 h-3" />
            저장
          </button>
          <button
            onClick={onCancel}
            className="flex items-center gap-1 px-3 py-1 text-xs bg-gray-400 text-white rounded hover:bg-gray-500"
          >
            <X className="w-3 h-3" />
            취소
          </button>
          <button
            onClick={onRemove}
            className="flex items-center gap-1 px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
          >
            <Trash2 className="w-3 h-3" />
            삭제
          </button>
        </div>
      </div>
      {renderForm()}
    </div>
  );
}

// 규정 추가 모달 - 대분류, 프리셋, 상태만 설정
function AddRuleModal({
  onSave,
  onCancel,
  categories,
  presets,
  statuses,
  categoryLabels,
  presetLabels,
}: {
  onSave: (rule: Omit<PromptRule, "id" | "createdAt" | "updatedAt" | "order">) => void;
  onCancel: () => void;
  categories: MainCategory[];
  presets: PresetType[];
  statuses: string[];
  categoryLabels: Record<string, string>;
  presetLabels: Record<string, string>;
}) {
  const [formData, setFormData] = useState<Omit<PromptRule, "id" | "createdAt" | "updatedAt" | "order">>({
    mainCategory: categories[0] || "document",
    preset: presets[0] || "basic",
    status: (statuses[0] || "default") as RuleStatus,
    enabled: true,
  });

  const inputCls = "w-full px-2 py-1 border border-gray-200 rounded text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent';
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">규정 추가</h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs text-gray-600 mb-1">대분류</label>
            <select
              value={formData.mainCategory}
              onChange={(e) => setFormData({...formData, mainCategory: e.target.value as MainCategory})}
              className={inputCls}
            >
              {categories.map((key) => (
                <option key={key} value={key}>{categoryLabels[key] || key}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">프리셋</label>
            <select
              value={formData.preset}
              onChange={(e) => setFormData({...formData, preset: e.target.value as PresetType})}
              className={inputCls}
            >
              {presets.map((key) => (
                <option key={key} value={key}>{presetLabels[key] || key}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">상태</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value as "always" | "default" | "enhanced"})}
              className={inputCls}
            >
              {statuses.map((key) => (
                <option key={key} value={key}>
                  {key === "always" ? "A 항상적용" : key === "default" ? "B 기본설정" : "C 강화모드"}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.enabled}
                onChange={(e) => setFormData({...formData, enabled: e.target.checked})}
              />
              <span className="text-xs text-gray-600">활성화</span>
            </label>
          </div>

          <div className="pt-4 border-t flex justify-end gap-2">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              취소
            </button>
            <button
              onClick={() => onSave(formData)}
              className="px-4 py-2 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              저장
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// 옵션 추가 모달 (대분류, 프리셋, 상태)
function AddOptionModal({
  title,
  onSave,
  onCancel,
}: {
  title: string;
  onSave: (value: string) => void;
  onCancel: () => void;
}) {
  const [value, setValue] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs text-gray-600 mb-1">이름</label>
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full px-2 py-1 border border-gray-200 rounded text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="새 항목 이름 입력"
            />
          </div>

          <div className="pt-4 border-t flex justify-end gap-2">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              취소
            </button>
            <button
              onClick={() => {
                if (value.trim()) {
                  onSave(value.trim());
                }
              }}
              className="px-4 py-2 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              저장
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
