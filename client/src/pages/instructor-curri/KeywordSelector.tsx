import { useCallback } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  COMMON_KEYWORDS,
  PROMPT_KEYWORDS,
  ETHICS_KEYWORDS,
  TRANSLATION_KEYWORDS,
} from "./constants";
import type { CurriculumKeywords, CurriculumTitles } from "./types";

/* ───────── 키워드 패널 (공용) ───────── */
interface KeywordPanelProps {
  label: string;
  emoji: string;
  allItems: string[];
  selected: string[];
  onChange: (items: string[]) => void;
}

function KeywordPanel({
  label,
  emoji,
  allItems,
  selected,
  onChange,
}: KeywordPanelProps) {
  const allChecked = selected.length === allItems.length && allItems.length > 0;

  const handleToggle = (item: string) => {
    if (selected.includes(item)) {
      onChange(selected.filter((i) => i !== item));
    } else {
      onChange([...selected, item]);
    }
  };

  const handleSelectAll = () => {
    onChange(allChecked ? [] : [...allItems]);
  };

  return (
    <div className="border border-neutral-200 rounded-md overflow-hidden">
      {/* Panel header */}
      <div className="bg-[#f4f4f5] border-b border-neutral-200 px-2 py-1 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <span className="text-[0.75rem]">{emoji}</span>
          <span className="text-[0.75rem]" style={{ fontWeight: 700 }}>{label}</span>
          {selected.length > 0 && (
            <span className="text-[0.625rem] bg-black text-white rounded-md px-1 py-0">
              {selected.length}/{allItems.length}
            </span>
          )}
        </div>
        <button
          onClick={handleSelectAll}
          className="text-[0.625rem] text-neutral-500 hover:text-black px-1 py-0.5 rounded-md hover:bg-white transition-colors"
        >
          {allChecked ? "☐ 해제" : "☑ 전체"}
        </button>
      </div>

      {/* Keyword grid */}
      <div className="p-2 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-2 gap-y-1">
        {allItems.map((item) => (
          <label
            key={item}
            className="flex items-center gap-1 cursor-pointer text-[0.75rem] whitespace-nowrap"
          >
            <Checkbox
              checked={selected.includes(item)}
              onCheckedChange={() => handleToggle(item)}
            />
            {item}
          </label>
        ))}
      </div>
    </div>
  );
}

/* ───────── 메인 Step3 ───────── */
interface KeywordSelectorProps {
  selectedField: string;
  keywords: CurriculumKeywords;
  titles: CurriculumTitles;
  onKeywordsChange: (keywords: CurriculumKeywords) => void;
  onTitlesChange: (titles: CurriculumTitles) => void;
}

export function KeywordSelector({
  selectedField,
  keywords,
  titles,
  onKeywordsChange,
  onTitlesChange,
}: KeywordSelectorProps) {
  const updateKeywords = useCallback(
    (field: keyof CurriculumKeywords, items: string[]) => {
      onKeywordsChange({ ...keywords, [field]: items });
    },
    [keywords, onKeywordsChange]
  );

  return (
    <div className="space-y-2">
      {/* 공통 */}
      <KeywordPanel
        label="공통항목"
        emoji="🏷️"
        allItems={COMMON_KEYWORDS}
        selected={keywords.common}
        onChange={(items) => updateKeywords("common", items)}
      />

      {/* 분야별 전용 */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5">
          <span className="text-[0.75rem]" style={{ fontWeight: 700 }}>분야별 전용(비공통)</span>
          {selectedField && (
            <span className="text-[0.625rem] border border-neutral-300 rounded-md px-1 py-0">{selectedField}</span>
          )}
        </div>

        {!selectedField ? (
          <p className="text-[0.75rem] text-neutral-400">
            ← ②에서 분야를 먼저 선택
          </p>
        ) : (
          <>
            {selectedField === "프롬" && (
              <KeywordPanel
                label="AI 프롬프트 전용"
                emoji="✨"
                allItems={PROMPT_KEYWORDS}
                selected={keywords.prompt}
                onChange={(items) => updateKeywords("prompt", items)}
              />
            )}
            {selectedField === "윤리" && (
              <KeywordPanel
                label="윤리 전용"
                emoji="⚖️"
                allItems={ETHICS_KEYWORDS}
                selected={keywords.ethics}
                onChange={(items) => updateKeywords("ethics", items)}
              />
            )}
            {selectedField === "번역" && (
              <KeywordPanel
                label="번역 전용"
                emoji="🌐"
                allItems={TRANSLATION_KEYWORDS}
                selected={keywords.translation}
                onChange={(items) => updateKeywords("translation", items)}
              />
            )}
          </>
        )}
      </div>

      {/* 제목 입력 */}
      <div className="grid grid-cols-2 gap-2">
        <div className="border border-neutral-200 rounded-md overflow-hidden">
          <div className="bg-[#f4f4f5] border-b border-neutral-200 px-2 py-1">
            <span className="text-[0.75rem]">📖 기본 수업 커리</span>
          </div>
          <div className="p-2">
            <Input
              placeholder="제목 입력 (추후)"
              value={titles.basicClass}
              onChange={(e) => onTitlesChange({ ...titles, basicClass: e.target.value })}
              className="h-8 text-[0.75rem]"
            />
          </div>
        </div>
        <div className="border border-neutral-200 rounded-md overflow-hidden">
          <div className="bg-[#f4f4f5] border-b border-neutral-200 px-2 py-1">
            <span className="text-[0.75rem]">🏋️ 실습 커리</span>
          </div>
          <div className="p-2">
            <Input
              placeholder="제목 입력 (추후)"
              value={titles.practiceClass}
              onChange={(e) => onTitlesChange({ ...titles, practiceClass: e.target.value })}
              className="h-8 text-[0.75rem]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
