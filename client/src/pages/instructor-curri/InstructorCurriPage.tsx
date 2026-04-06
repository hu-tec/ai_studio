import { useState, useEffect, useCallback, useMemo } from "react";
import { CategorySelector } from "./CategorySelector";
import { GradeSelector } from "./GradeSelector";
import { KeywordSelector } from "./KeywordSelector";
import { SavedList } from "./SavedList";
import type {
  SavedCurriculum,
  CurriculumKeywords,
  CurriculumTitles,
} from "./types";
import { toast } from "sonner";

const STORAGE_KEY = "instructor-curriculum-data-v6";

const emptyKeywords: CurriculumKeywords = {
  common: [],
  prompt: [],
  ethics: [],
  translation: [],
};

const emptyTitles: CurriculumTitles = {
  basicClass: "",
  practiceClass: "",
};

function createDummyData(): SavedCurriculum[] {
  return [
    {
      id: "demo-001",
      created_at: "2026-02-03",
      category: { large: "문서", medium: "법률", small: "민사" },
      instructor_grade: { field: "프롬", mid: "교육", level: "3급" },
      targets: ["중등"],
      keywords: {
        common: ["AI 기초 이해", "프롬프트 기초", "결과 검증", "저작권"],
        prompt: ["다단계 지시", "템플릿 설계", "Few-shot"],
        ethics: [],
        translation: [],
      },
      titles: { basicClass: "", practiceClass: "" },
    },
    {
      id: "demo-002",
      created_at: "2026-02-05",
      category: { large: "개발", medium: "AI", small: "" },
      instructor_grade: { field: "번역", mid: "일반", level: "1급" },
      targets: ["대학생"],
      keywords: {
        common: ["AI 기초 이해", "품질 관리", "팩트체크"],
        prompt: [],
        ethics: [],
        translation: ["용어 관리", "CAT 도구", "기계번역 활용", "품질 평가(QA)"],
      },
      titles: { basicClass: "", practiceClass: "" },
    },
    {
      id: "demo-003",
      created_at: "2026-02-07",
      category: { large: "영상", medium: "유튜브", small: "" },
      instructor_grade: { field: "윤리", mid: "전문", level: "2급" },
      targets: [],
      keywords: {
        common: ["윤리 기초", "안전/보안", "개인정보"],
        prompt: [],
        ethics: ["편향 감지", "허위정보 대응", "공정성 평가", "레드팀", "윤리 가이드라인"],
        translation: [],
      },
      titles: { basicClass: "", practiceClass: "" },
    },
    {
      id: "demo-004",
      created_at: "2026-02-09",
      category: { large: "음성", medium: "교육 강의", small: "" },
      instructor_grade: { field: "프롬", mid: "교육", level: "7급" },
      targets: ["고3+대학신입"],
      keywords: {
        common: ["AI 기초 이해", "프롬프트 기초"],
        prompt: ["시스템 프롬프트", "Zero-shot"],
        ethics: ["투명성", "책임성"],
        translation: [],
      },
      titles: { basicClass: "", practiceClass: "" },
    },
    {
      id: "demo-005",
      created_at: "2026-02-11",
      category: { large: "문서", medium: "비즈니스", small: "" },
      instructor_grade: { field: "번역", mid: "일반", level: "2급" },
      targets: ["대학생", "실무자"],
      keywords: {
        common: ["프롬프트 기초", "결과 검증", "문서화"],
        prompt: ["컨텍스트 관리"],
        ethics: [],
        translation: ["스타일 가이드", "로컬라이제이션", "문체 변환"],
      },
      titles: { basicClass: "", practiceClass: "" },
    },
  ];
}

function loadFromStorage(): SavedCurriculum[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (
        parsed.length > 0 &&
        parsed[0]?.category?.large &&
        parsed[0]?.instructor_grade?.field &&
        parsed[0]?.keywords
      ) {
        return parsed;
      }
    }
    localStorage.removeItem(STORAGE_KEY);
    const dummy = createDummyData();
    saveToStorage(dummy);
    return dummy;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    const dummy = createDummyData();
    saveToStorage(dummy);
    return dummy;
  }
}

function saveToStorage(data: SavedCurriculum[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export default function InstructorCurriPage() {
  const [savedItems, setSavedItems] = useState<SavedCurriculum[]>([]);
  const [catLarge, setCatLarge] = useState("");
  const [catMedium, setCatMedium] = useState("");
  const [catSmall, setCatSmall] = useState("");
  const [selectedField, setSelectedField] = useState("");
  const [selectedMid, setSelectedMid] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedTargets, setSelectedTargets] = useState<string[]>([]);
  const [keywords, setKeywords] = useState<CurriculumKeywords>({ ...emptyKeywords });
  const [titles, setTitles] = useState<CurriculumTitles>({ ...emptyTitles });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    setSavedItems(loadFromStorage());
  }, []);

  const totalKeywordCount = useMemo(
    () =>
      keywords.common.length +
      keywords.prompt.length +
      keywords.ethics.length +
      keywords.translation.length,
    [keywords]
  );

  const canSave =
    catLarge &&
    catMedium &&
    selectedField &&
    selectedMid &&
    selectedLevel &&
    totalKeywordCount > 0;

  const handleSave = useCallback(() => {
    if (!canSave) return;
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    const newItem: SavedCurriculum = {
      id: editingId || crypto.randomUUID(),
      created_at: dateStr,
      category: { large: catLarge, medium: catMedium, small: catSmall },
      instructor_grade: { field: selectedField, mid: selectedMid, level: selectedLevel },
      targets: selectedTargets,
      keywords,
      titles,
    };
    setSavedItems((prev) => {
      let next: SavedCurriculum[];
      if (editingId) {
        next = prev.map((item) => (item.id === editingId ? newItem : item));
      } else {
        next = [newItem, ...prev];
      }
      saveToStorage(next);
      return next;
    });
    toast.success(editingId ? "수정 완료" : "저장 완료");
    handleReset();
  }, [canSave, editingId, catLarge, catMedium, catSmall, selectedField, selectedMid, selectedLevel, selectedTargets, keywords, titles]);

  const handleReset = useCallback(() => {
    setCatLarge("");
    setCatMedium("");
    setCatSmall("");
    setSelectedField("");
    setSelectedMid("");
    setSelectedLevel("");
    setSelectedTargets([]);
    setKeywords({ ...emptyKeywords });
    setTitles({ ...emptyTitles });
    setEditingId(null);
  }, []);

  const handleEdit = useCallback(
    (id: string) => {
      const item = savedItems.find((i) => i.id === id);
      if (!item) return;
      setEditingId(id);
      setCatLarge(item.category.large);
      setCatMedium(item.category.medium);
      setCatSmall(item.category.small);
      setSelectedField(item.instructor_grade.field);
      setSelectedMid(item.instructor_grade.mid);
      setSelectedLevel(item.instructor_grade.level);
      setSelectedTargets(item.targets ?? []);
      setKeywords(item.keywords ?? { ...emptyKeywords });
      setTitles(item.titles ?? { ...emptyTitles });
      window.scrollTo({ top: 0, behavior: "smooth" });
      toast.info("수정 모드");
    },
    [savedItems]
  );

  const handleDelete = useCallback((id: string) => {
    setSavedItems((prev) => {
      const next = prev.filter((item) => item.id !== id);
      saveToStorage(next);
      return next;
    });
    toast.success("삭제 완료");
  }, []);

  const summaryParts: string[] = [];
  if (catLarge) summaryParts.push(catLarge);
  if (catMedium) summaryParts.push(catMedium);
  if (catSmall) summaryParts.push(catSmall);
  const summaryText = summaryParts.join(" › ");

  return (
    <div>
      {/* ── Header ── */}
      <header className="border-b border-neutral-200 sticky top-0 z-10 bg-white">
        <div className="px-3 py-2 flex items-center justify-between">
          <span className="text-[1.25rem]">📋 강사 급수 & 커리큘럼 관리</span>
          {editingId && (
            <div className="flex items-center gap-2">
              <span className="text-[0.75rem]">⚠️ 수정 중</span>
              <button
                onClick={() => { handleReset(); toast.info("취소됨"); }}
                className="text-[0.625rem] border border-neutral-300 rounded-md px-1.5 py-0.5 hover:bg-[#f4f4f5]"
              >
                ✕ 취소
              </button>
            </div>
          )}
        </div>
      </header>

      {/* ── Main ── */}
      <main className="px-3 py-2">
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-2 items-start">

          {/* Left: Form */}
          <div className="space-y-2 min-w-0">

            {/* Step 1 + Step 2 side-by-side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">

              {/* Step 1: 분류체계 */}
              <div className="border border-neutral-200 rounded-md overflow-hidden">
                <div className="bg-[#f4f4f5] border-b border-neutral-200 px-2.5 py-1.5">
                  <span className="text-[0.75rem]" style={{ fontWeight: 700 }}>① 분류체계 📂</span>
                </div>
                <div className="p-2.5">
                  <CategorySelector
                    selectedLarge={catLarge}
                    selectedMedium={catMedium}
                    selectedSmall={catSmall}
                    onLargeChange={setCatLarge}
                    onMediumChange={setCatMedium}
                    onSmallChange={setCatSmall}
                  />
                </div>
              </div>

              {/* Step 2: 급수 */}
              <div className="border border-neutral-200 rounded-md overflow-hidden">
                <div className="bg-[#f4f4f5] border-b border-neutral-200 px-2.5 py-1.5">
                  <span className="text-[0.75rem]" style={{ fontWeight: 700 }}>② 급수 🎓</span>
                </div>
                <div className="p-2.5">
                  <GradeSelector
                    selectedField={selectedField}
                    selectedMid={selectedMid}
                    selectedLevel={selectedLevel}
                    selectedTargets={selectedTargets}
                    onFieldChange={setSelectedField}
                    onMidChange={setSelectedMid}
                    onLevelChange={setSelectedLevel}
                    onTargetsChange={setSelectedTargets}
                  />
                </div>
              </div>
            </div>

            {/* Step 3: 커리큘럼 */}
            <div className="border border-neutral-200 rounded-md overflow-hidden">
              <div className="bg-[#f4f4f5] border-b border-neutral-200 px-2.5 py-1.5 flex items-center justify-between">
                <span className="text-[0.75rem]" style={{ fontWeight: 700 }}>③ 커리큘럼 구성 📝</span>
                {totalKeywordCount > 0 && (
                  <span className="text-[0.625rem] border border-neutral-300 rounded-md px-1.5 py-0.5">
                    🏷️ {totalKeywordCount}개
                  </span>
                )}
              </div>
              <div className="p-2.5">
                <KeywordSelector
                  selectedField={selectedField}
                  keywords={keywords}
                  titles={titles}
                  onKeywordsChange={setKeywords}
                  onTitlesChange={setTitles}
                />
              </div>
            </div>

            {/* Bottom Action Bar */}
            <div className="sticky bottom-0 bg-white border border-neutral-200 rounded-md px-2.5 py-2">
              <div className="flex items-center justify-between gap-2">
                {/* Summary */}
                <div className="flex items-center gap-1.5 flex-wrap text-[0.625rem] text-neutral-500 min-w-0">
                  {summaryText && selectedLevel && (
                    <>
                      <span className="border border-neutral-300 rounded-md px-1.5 py-0.5 text-black">📌 {summaryText}</span>
                      <span className="border border-neutral-300 rounded-md px-1 py-0.5">{selectedField}</span>
                      <span className="border border-neutral-300 rounded-md px-1 py-0.5">{selectedMid}</span>
                      <span className="bg-black text-white rounded-md px-1 py-0.5">{selectedLevel}</span>
                      <span>· 🏷️{totalKeywordCount}</span>
                    </>
                  )}
                </div>
                {/* Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={handleReset}
                    className="text-[0.75rem] border border-neutral-300 rounded-md px-2 py-1 hover:bg-[#f4f4f5]"
                  >
                    🔄 초기화
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={!canSave}
                    className="text-[0.75rem] rounded-md px-3 py-1 bg-black text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-neutral-800"
                  >
                    💾 {editingId ? "수정" : "저장"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Saved List */}
          <div className="xl:sticky xl:top-[45px] xl:max-h-[calc(100vh-45px-1rem)] xl:overflow-y-auto">
            <div className="border border-neutral-200 rounded-md overflow-hidden">
              <div className="bg-[#f4f4f5] border-b border-neutral-200 px-2.5 py-1.5 flex items-center justify-between">
                <span className="text-[0.75rem]" style={{ fontWeight: 700 }}>📦 저장 목록</span>
                {savedItems.length > 0 && (
                  <span className="text-[0.625rem] bg-black text-white rounded-md px-1.5 py-0.5 min-w-[1.2rem] text-center">
                    {savedItems.length}
                  </span>
                )}
              </div>
              <div className="p-2">
                <SavedList
                  items={savedItems}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
