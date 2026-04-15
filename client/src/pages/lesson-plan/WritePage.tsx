import { useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router";
import { Save, ArrowLeft, X, Upload, FileText, Plus, Trash2, FileDown } from "lucide-react";
import {
  cohortOptions, topicOptions, groupOptions, timeLengthOptions,
  categoryCheckboxes, stepCheckboxes, mockLessonPlans,
  saveLessonPlanToAPI, deleteLessonPlanFromAPI,
  type CategoryItem, type StepItem, type LessonPlan,
} from "./mockData";
import { ExportWordModal, type ExportData } from "./ExportWordModal";

let idCounter = 100;
function uid() { return `item-${idCounter++}`; }

function toggleMulti<T>(arr: T[], val: T): T[] {
  return arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val];
}

const levelOptions = ["Beginner", "Elementary", "Pre-Intermediate", "Intermediate", "Upper-Intermediate", "Advanced"];
const targetOptions = ["유아", "초등", "중등", "고등", "성인"];
const gradeOptionsMap: Record<string, string[]> = {
  "초등": ["초1", "초2", "초3", "초4", "초5", "초6"],
  "중등": ["중1", "중2", "중3"],
  "고등": ["고1", "고2", "고3"],
};
const extraGradeOptions = ["기타"];
const aiToolOptions = ["ChatGPT", "Gemini", "Claude", "Copilot", "뤼튼", "기타AI"];
const mediaOptions = ["PPT", "동영상", "음원", "이미지", "웹사이트", "앱"];

export function WritePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const existing = id ? mockLessonPlans.find((lp) => lp.id === Number(id)) : undefined;
  const isEdit = !!existing;

  /* ── 기본 정보 ── */
  const [tags, setTags] = useState(existing?.tags ?? "");
  const [author, setAuthor] = useState(existing?.author ?? "");
  const [password, setPassword] = useState(existing?.password ?? "");
  const [cohort, setCohort] = useState(existing?.cohort ?? "");
  const [instructorName, setInstructorName] = useState(existing?.instructorName ?? "");
  const [gender, setGender] = useState(existing?.gender ?? "");

  /* ── 수업 정보 ── */
  const [level, setLevel] = useState(existing?.level ?? "");
  const [dateFrom, setDateFrom] = useState(existing?.dateFrom ?? "");
  const [dateTo, setDateTo] = useState(existing?.dateTo ?? "");
  const [topics, setTopics] = useState<string[]>(existing?.topic ? [existing.topic] : []);
  const [groups, setGroups] = useState<string[]>(existing?.studentCount ? [existing.studentCount] : []);
  const [timeLength, setTimeLength] = useState(existing?.timeLength ?? "");
  const [customTime, setCustomTime] = useState("");
  const [targetLevels, setTargetLevels] = useState<string[]>([]);
  const [detailGrades, setDetailGrades] = useState<string[]>([]);
  const [units, setUnits] = useState<number[]>([]);
  const [aiTools, setAiTools] = useState<string[]>([]);
  const [customAiTool, setCustomAiTool] = useState("");
  const [mediaTypes, setMediaTypes] = useState<string[]>([]);
  const [customMedia, setCustomMedia] = useState("");
  const [teachingAids, setTeachingAids] = useState<string[]>([]);
  const [customAid, setCustomAid] = useState("");
  const [mainTextbook, setMainTextbook] = useState("");
  const [subTextbook, setSubTextbook] = useState("");

  /* ── 범주 / 단계 ── */
  const [categories, setCategories] = useState<CategoryItem[]>(existing?.categories ?? []);
  const [steps, setSteps] = useState<StepItem[]>(existing?.steps ?? []);
  const [customCategoryName, setCustomCategoryName] = useState("");
  const [customStepName, setCustomStepName] = useState("");

  /* ── 첨부파일 ── */
  const [files, setFiles] = useState<File[]>([]);

  /* ── 저장 ── */
  const handleSave = async () => {
    const plan: LessonPlan = {
      id: existing?.id ?? Date.now(),
      center: "",
      category: cohortOptions.find(o => o.value === cohort)?.label?.includes("TESOL") ? "TESOL" : cohortOptions.find(o => o.value === cohort)?.label?.includes("통번역") ? "통번역" : "기타",
      courseName: cohortOptions.find(o => o.value === cohort)?.label ?? cohort,
      cohort,
      tags,
      topic: topics.join(", "),
      author,
      level,
      studentCount: groups.join(", "),
      timeLength: timeLength === "직접입력" ? customTime : timeLength,
      createdAt: existing?.createdAt ?? new Date().toISOString().slice(0, 10),
      views: existing?.views ?? 0,
      hasAttachment: files.length > 0 || (existing?.hasAttachment ?? false),
      instructorName,
      dateFrom,
      dateTo,
      gender,
      password,
      categories,
      steps,
    };
    const ok = await saveLessonPlanToAPI(plan);
    if (ok) {
      navigate("/lesson-plan");
    } else {
      alert("저장에 실패했습니다. 다시 시도해주세요.");
    }
  };

  /* ── Word 다운로드 모달 ── */
  const [showExportModal, setShowExportModal] = useState(false);
  const exportData: ExportData = {
    tags, author, cohort,
    cohortLabel: cohortOptions.find((o) => o.value === cohort)?.label ?? cohort,
    instructorName, gender, level, dateFrom, dateTo,
    topics, groups, timeLength, customTime,
    targetLevels, detailGrades, units, aiTools,
    mediaTypes, teachingAids, mainTextbook, subTextbook,
    categories, steps,
  };

  /* ── helpers ── */
  const isCatChecked = (t: string) => categories.some((c) => c.title === t);
  const isStepChecked = (t: string) => steps.some((s) => s.title === t);

  const toggleCat = (title: string) => {
    if (isCatChecked(title)) setCategories((p) => p.filter((c) => c.title !== title));
    else setCategories((p) => [...p, { id: uid(), title, contents: "", remark: "", timeLength: "", mediaTypes: [], teachingAids: [] }]);
  };
  const toggleStep = (title: string) => {
    if (isStepChecked(title)) setSteps((p) => p.filter((s) => s.title !== title));
    else setSteps((p) => [...p, { id: uid(), title, time: "", setUp: "", description: "", remark: "", mediaTypes: [], teachingAids: [] }]);
  };
  const addCustomCat = () => {
    const n = customCategoryName.trim();
    if (!n) return;
    setCategories((p) => [...p, { id: uid(), title: n, contents: "", remark: "", timeLength: "", mediaTypes: [], teachingAids: [] }]);
    setCustomCategoryName("");
  };
  const addCustomStep = () => {
    const n = customStepName.trim();
    if (!n) return;
    setSteps((p) => [...p, { id: uid(), title: n, time: "", setUp: "", description: "", remark: "", mediaTypes: [], teachingAids: [] }]);
    setCustomStepName("");
  };

  const updateCat = (id: string, f: keyof CategoryItem, v: string) => setCategories((p) => p.map((c) => (c.id === id ? { ...c, [f]: v } : c)));
  const updateStep = (id: string, f: keyof StepItem, v: string) => setSteps((p) => p.map((s) => (s.id === id ? { ...s, [f]: v } : s)));

  const toggleCatArray = (id: string, field: "mediaTypes" | "teachingAids", val: string) =>
    setCategories((p) => p.map((c) => c.id === id ? { ...c, [field]: toggleMulti(c[field], val) } : c));
  const addCatArrayItem = (id: string, field: "mediaTypes" | "teachingAids", val: string) => {
    const n = val.trim();
    if (!n) return;
    setCategories((p) => p.map((c) => c.id === id ? { ...c, [field]: c[field].includes(n) ? c[field] : [...c[field], n] } : c));
    if (field === "mediaTypes") setCatMediaInputs((p) => ({ ...p, [id]: "" }));
    else setCatAidInputs((p) => ({ ...p, [id]: "" }));
  };
  const removeCatArrayItem = (id: string, field: "mediaTypes" | "teachingAids", val: string) =>
    setCategories((p) => p.map((c) => c.id === id ? { ...c, [field]: c[field].filter((v) => v !== val) } : c));

  const toggleStepArray = (id: string, field: "mediaTypes" | "teachingAids", val: string) =>
    setSteps((p) => p.map((s) => s.id === id ? { ...s, [field]: toggleMulti(s[field], val) } : s));
  const addStepArrayItem = (id: string, field: "mediaTypes" | "teachingAids", val: string) => {
    const n = val.trim();
    if (!n) return;
    setSteps((p) => p.map((s) => s.id === id ? { ...s, [field]: s[field].includes(n) ? s[field] : [...s[field], n] } : s));
    if (field === "mediaTypes") setStepMediaInputs((p) => ({ ...p, [id]: "" }));
    else setStepAidInputs((p) => ({ ...p, [id]: "" }));
  };
  const removeStepArrayItem = (id: string, field: "mediaTypes" | "teachingAids", val: string) =>
    setSteps((p) => p.map((s) => s.id === id ? { ...s, [field]: s[field].filter((v) => v !== val) } : s));

  const [catMediaInputs, setCatMediaInputs] = useState<Record<string, string>>({});
  const [catAidInputs, setCatAidInputs] = useState<Record<string, string>>({});
  const [stepMediaInputs, setStepMediaInputs] = useState<Record<string, string>>({});
  const [stepAidInputs, setStepAidInputs] = useState<Record<string, string>>({});

  /* ── file handling ── */
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const dropped = Array.from(e.dataTransfer.files);
    setFiles((p) => [...p, ...dropped].slice(0, 4));
  }, []);
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setFiles((p) => [...p, ...Array.from(e.target.files!)].slice(0, 4));
  };

  /* ── custom AI / media / aid adders ── */
  const addCustomAi = () => { const n = customAiTool.trim(); if (n && !aiTools.includes(n)) { setAiTools((p) => [...p, n]); setCustomAiTool(""); } };
  const addCustomMedia = () => { const n = customMedia.trim(); if (n && !mediaTypes.includes(n)) { setMediaTypes((p) => [...p, n]); setCustomMedia(""); } };
  const addCustomAidItem = () => { const n = customAid.trim(); if (n && !teachingAids.includes(n)) { setTeachingAids((p) => [...p, n]); setCustomAid(""); } };

  /* ── computed ── */
  const availableGrades = [
    ...targetLevels.flatMap((t) => gradeOptionsMap[t] ?? []),
    ...extraGradeOptions,
  ];
  const hasSchoolTarget = targetLevels.some((v) => ["초등", "중등", "고등"].includes(v));

  /* ── styling ── */
  const lbl = "block text-xs text-muted-foreground mb-0.5";
  const inp = "w-full px-2 py-1 border border-border rounded bg-[var(--input-background)] text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/30";

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate("/lesson-plan")} className="p-1 rounded hover:bg-accent">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h2 className="text-sm">{isEdit ? "레슨플랜 수정" : "레슨플랜 등록"}</h2>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowExportModal(true)}
            className="flex items-center gap-1 px-2 py-1.5 border border-border rounded hover:bg-gray-50 text-sm transition-colors">
            <FileDown className="w-3 h-3" />
            Word 다운로드
          </button>
          <button onClick={handleSave} className="flex items-center gap-1 px-2 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">
            <Save className="w-3 h-3" />
            {isEdit ? "수정" : "저장"}
          </button>
        </div>
      </div>

      {/* 2-column layout */}
      <div className="grid grid-cols-[minmax(340px,420px)_1fr] gap-2 items-start">
        {/* ====== LEFT COLUMN ====== */}
        <div className="space-y-2">
          {/* Section 1: 기본 정보 */}
          <section className="bg-white border border-border rounded-lg p-1">
            <h3 className="text-sm text-blue-700 pb-1.5 mb-2 border-b border-border flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs">1</span>
              기본 정보
            </h3>
            <div className="space-y-1.5">
              <div>
                <label className={lbl}>태그</label>
                <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} className={inp} placeholder="쉼표로 구분" />
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <div>
                  <label className={lbl}>작성자</label>
                  <input type="text" value={author} onChange={(e) => setAuthor(e.target.value)} className={inp} />
                </div>
                <div>
                  <label className={lbl}>비밀번호</label>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={inp} />
                </div>
              </div>
              <div>
                <label className={lbl}>기수</label>
                <div className="flex flex-wrap gap-1">
                  {cohortOptions.map((o) => (
                    <button
                      key={o.value}
                      type="button"
                      onClick={() => setCohort(cohort === o.value ? '' : o.value)}
                      className={`px-2 py-0.5 text-xs rounded-md border ${cohort === o.value ? 'bg-orange-600 text-white border-orange-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <div>
                  <label className={lbl}>강사명</label>
                  <input type="text" value={instructorName} onChange={(e) => setInstructorName(e.target.value)} className={inp} />
                </div>
                <div>
                  <label className={lbl}>성별</label>
                  <input type="text" value={gender} onChange={(e) => setGender(e.target.value)} className={inp} placeholder="Male / Female / Mixed" />
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: 수업 정보 */}
          <section className="bg-white border border-border rounded-lg p-1">
            <h3 className="text-sm text-orange-700 pb-1.5 mb-2 border-b border-border flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center text-xs">2</span>
              수업 정보
            </h3>
            {/* Level */}
            <div>
              <label className={lbl}>레벨</label>
              <div className="flex flex-wrap gap-1">
                {levelOptions.map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setLevel(level === l ? '' : l)}
                    className={`px-2 py-0.5 text-xs rounded-md border ${level === l ? 'bg-orange-600 text-white border-orange-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
            {/* Dates */}
            <div className="grid grid-cols-2 gap-1.5 mt-1.5">
              <div>
                <label className={lbl}>시작일</label>
                <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className={inp} />
              </div>
              <div>
                <label className={lbl}>종료일</label>
                <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className={inp} />
              </div>
            </div>
            {/* Topics (multi) */}
            <div className="mt-2">
              <label className={lbl}>학습영역 <span className="text-muted-foreground">(다중선택)</span></label>
              <div className="flex flex-wrap gap-1">
                {topicOptions.map((t) => (
                  <button key={t} type="button"
                    onClick={() => setTopics((p) => toggleMulti(p, t))}
                    className={`px-2 py-0.5 rounded border text-sm transition-colors ${topics.includes(t) ? "border-blue-500 bg-blue-50 text-blue-700" : "border-border hover:bg-gray-50"}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            {/* Groups (multi) */}
            <div className="mt-2">
              <label className={lbl}>그룹(학생수) <span className="text-muted-foreground">(다중선택)</span></label>
              <div className="flex flex-wrap gap-1">
                {groupOptions.map((g) => (
                  <button key={g} type="button"
                    onClick={() => setGroups((p) => toggleMulti(p, g))}
                    className={`px-2 py-0.5 rounded border text-sm transition-colors ${groups.includes(g) ? "border-blue-500 bg-blue-50 text-blue-700" : "border-border hover:bg-gray-50"}`}>
                    {g}
                  </button>
                ))}
              </div>
            </div>
            {/* Time Length */}
            <div className="mt-2">
              <label className={lbl}>총 수업시간</label>
              <div className="flex flex-wrap gap-1">
                {timeLengthOptions.map((t) => (
                  <button key={t} type="button"
                    onClick={() => { setTimeLength(t); if (t !== "직접입력") setCustomTime(""); }}
                    className={`px-2 py-0.5 rounded border text-sm transition-colors ${timeLength === t ? "border-blue-500 bg-blue-50 text-blue-700" : "border-border hover:bg-gray-50"}`}>
                    {t}
                  </button>
                ))}
                {timeLength === "직접입력" && (
                  <input type="text" value={customTime} onChange={(e) => setCustomTime(e.target.value)}
                    className="px-2 py-0.5 border border-border rounded bg-[var(--input-background)] text-sm w-20 focus:outline-none focus:ring-1 focus:ring-blue-500/30"
                    placeholder="예: 90분" />
                )}
              </div>
            </div>
            {/* Target Level */}
            <div className="mt-2">
              <label className={lbl}>대상</label>
              <div className="flex flex-wrap gap-1">
                {targetOptions.map((t) => (
                  <button key={t} type="button"
                    onClick={() => {
                      const next = toggleMulti(targetLevels, t);
                      setTargetLevels(next);
                      const removed = targetLevels.filter((v) => !next.includes(v));
                      const removedGrades = removed.flatMap((v) => gradeOptionsMap[v] ?? []);
                      if (removedGrades.length) setDetailGrades((p) => p.filter((g) => !removedGrades.includes(g)));
                      if (!next.some((v) => ["초등", "중등", "고등"].includes(v))) setUnits([]);
                    }}
                    className={`px-2 py-0.5 rounded border text-sm transition-colors ${targetLevels.includes(t) ? "border-blue-500 bg-blue-50 text-blue-700" : "border-border hover:bg-gray-50"}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            {/* Detail Grades */}
            <div className="mt-2">
              <label className={lbl}>세부학년 <span className="text-muted-foreground">(다중선택)</span></label>
              <div className="flex flex-wrap gap-1">
                {availableGrades.map((g) => (
                  <button key={g} type="button"
                    onClick={() => setDetailGrades((p) => toggleMulti(p, g))}
                    className={`px-2 py-0.5 rounded border text-sm transition-colors ${detailGrades.includes(g) ? "border-blue-500 bg-blue-50 text-blue-700" : "border-border hover:bg-gray-50"}`}>
                    {g}
                  </button>
                ))}
                {availableGrades.length === extraGradeOptions.length && (
                  <span className="text-xs text-muted-foreground self-center ml-1">대상을 선택하면 학년이 표시됩니다</span>
                )}
              </div>
            </div>
            {/* Units */}
            {hasSchoolTarget && (
              <div className="mt-2">
                <label className={lbl}>단원 <span className="text-muted-foreground">(다중선택)</span></label>
                <div className="flex flex-wrap gap-1">
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((u) => (
                    <button key={u} type="button"
                      onClick={() => setUnits((p) => toggleMulti(p, u))}
                      className={`w-8 py-0.5 rounded border text-sm text-center transition-colors ${units.includes(u) ? "border-blue-500 bg-blue-50 text-blue-700" : "border-border hover:bg-gray-50"}`}>
                      {u}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {/* AI Tools */}
            <div className="mt-2">
              <label className={lbl}>활용 AI <span className="text-muted-foreground">(다중선택)</span></label>
              <div className="flex flex-wrap items-center gap-1">
                {aiToolOptions.map((ai) => (
                  <button key={ai} type="button"
                    onClick={() => setAiTools((p) => toggleMulti(p, ai))}
                    className={`px-2 py-0.5 rounded border text-sm transition-colors ${aiTools.includes(ai) ? "border-blue-500 bg-blue-50 text-blue-700" : "border-border hover:bg-gray-50"}`}>
                    {ai}
                  </button>
                ))}
                {aiTools.filter((a) => !aiToolOptions.includes(a)).map((a) => (
                  <button key={a} type="button"
                    onClick={() => setAiTools((p) => p.filter((v) => v !== a))}
                    className="px-2 py-0.5 rounded border border-blue-500 bg-blue-50 text-blue-700 text-sm flex items-center gap-1">
                    {a}<X className="w-3 h-3" />
                  </button>
                ))}
                <div className="flex items-center gap-1">
                  <input type="text" placeholder="직접입력..." value={customAiTool} onChange={(e) => setCustomAiTool(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addCustomAi()}
                    className="px-2 py-0.5 border border-border rounded bg-[var(--input-background)] text-sm w-24 focus:outline-none focus:ring-1 focus:ring-blue-500/30" />
                  <button onClick={addCustomAi} type="button" className="p-0.5 bg-blue-100 text-blue-700 rounded hover:bg-blue-200">
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
            {/* Media */}
            <div className="mt-2">
              <label className={lbl}>활용 미디어 <span className="text-muted-foreground">(다중선택)</span></label>
              <div className="flex flex-wrap items-center gap-1">
                {mediaOptions.map((m) => (
                  <button key={m} type="button"
                    onClick={() => setMediaTypes((p) => toggleMulti(p, m))}
                    className={`px-2 py-0.5 rounded border text-sm transition-colors ${mediaTypes.includes(m) ? "border-blue-500 bg-blue-50 text-blue-700" : "border-border hover:bg-gray-50"}`}>
                    {m}
                  </button>
                ))}
                {mediaTypes.filter((m) => !mediaOptions.includes(m)).map((m) => (
                  <button key={m} type="button"
                    onClick={() => setMediaTypes((p) => p.filter((v) => v !== m))}
                    className="px-2 py-0.5 rounded border border-blue-500 bg-blue-50 text-blue-700 text-sm flex items-center gap-1">
                    {m}<X className="w-3 h-3" />
                  </button>
                ))}
                <div className="flex items-center gap-1">
                  <input type="text" placeholder="직접입력..." value={customMedia} onChange={(e) => setCustomMedia(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addCustomMedia()}
                    className="px-2 py-0.5 border border-border rounded bg-[var(--input-background)] text-sm w-24 focus:outline-none focus:ring-1 focus:ring-blue-500/30" />
                  <button onClick={addCustomMedia} type="button" className="p-0.5 bg-blue-100 text-blue-700 rounded hover:bg-blue-200">
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
            {/* Teaching Aids */}
            <div className="mt-2">
              <label className={lbl}>교구 <span className="text-muted-foreground">(다중선택 / 직접입력)</span></label>
              <div className="flex flex-wrap items-center gap-1">
                {teachingAids.map((a) => (
                  <button key={a} type="button"
                    onClick={() => setTeachingAids((p) => p.filter((v) => v !== a))}
                    className="px-2 py-0.5 rounded border border-blue-500 bg-blue-50 text-blue-700 text-sm flex items-center gap-1">
                    {a}<X className="w-3 h-3" />
                  </button>
                ))}
                <div className="flex items-center gap-1">
                  <input type="text" placeholder="직접입력..." value={customAid} onChange={(e) => setCustomAid(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addCustomAidItem()}
                    className="px-2 py-0.5 border border-border rounded bg-[var(--input-background)] text-sm w-24 focus:outline-none focus:ring-1 focus:ring-blue-500/30" />
                  <button onClick={addCustomAidItem} type="button" className="p-0.5 bg-blue-100 text-blue-700 rounded hover:bg-blue-200">
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
            {/* Textbooks */}
            <div className="grid grid-cols-2 gap-1.5 mt-2">
              <div>
                <label className={lbl}>주교재</label>
                <input type="text" value={mainTextbook} onChange={(e) => setMainTextbook(e.target.value)} className={inp} />
              </div>
              <div>
                <label className={lbl}>부교재</label>
                <input type="text" value={subTextbook} onChange={(e) => setSubTextbook(e.target.value)} className={inp} />
              </div>
            </div>
          </section>
        </div>

        {/* ====== RIGHT COLUMN ====== */}
        <div className="space-y-2">
          {/* Section 3: Categories */}
          <section className="bg-white border border-border rounded-lg p-1">
            <h3 className="text-sm text-emerald-700 pb-1.5 mb-2 border-b border-border flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs">3</span>
              범주형 상세 내용
            </h3>
            <div className="flex flex-wrap gap-1 mb-2">
              {categoryCheckboxes.map((cb) => (
                <label key={cb}
                  className={`flex items-center gap-1 px-2 py-0.5 border rounded cursor-pointer text-sm transition-colors ${isCatChecked(cb) ? "border-emerald-400 bg-emerald-50 text-emerald-700" : "border-border hover:bg-gray-50"}`}>
                  <input type="checkbox" checked={isCatChecked(cb)} onChange={() => toggleCat(cb)} className="w-3 h-3 accent-emerald-600" />
                  {cb}
                </label>
              ))}
              {/* custom-added categories not in preset */}
              {categories.filter((c) => !categoryCheckboxes.includes(c.title)).map((c) => (
                <label key={c.id}
                  className="flex items-center gap-1 px-2 py-0.5 border border-emerald-400 bg-emerald-50 text-emerald-700 rounded cursor-pointer text-sm transition-colors">
                  <input type="checkbox" checked onChange={() => setCategories((p) => p.filter((x) => x.id !== c.id))} className="w-3 h-3 accent-emerald-600" />
                  {c.title}
                </label>
              ))}
              <div className="flex items-center gap-1">
                <input type="text" placeholder="직접입력..." value={customCategoryName} onChange={(e) => setCustomCategoryName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addCustomCat()}
                  className="px-2 py-0.5 border border-border rounded bg-[var(--input-background)] text-sm w-28 focus:outline-none focus:ring-1 focus:ring-emerald-500/30" />
                <button onClick={addCustomCat} className="p-0.5 bg-emerald-100 text-emerald-700 rounded hover:bg-emerald-200">
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            {categories.length > 0 && (
              <div className="space-y-1.5">
                {categories.map((cat) => (
                  <div key={cat.id} className="border border-emerald-200 rounded p-2 bg-emerald-50/20">
                    <div className="flex items-center justify-between mb-1.5">
                      <input
                        type="text"
                        value={cat.title}
                        onChange={(e) => updateCat(cat.id, "title", e.target.value)}
                        className="text-sm text-emerald-700 bg-transparent border-b border-transparent hover:border-emerald-300 focus:border-emerald-500 focus:outline-none px-0 py-0"
                      />
                      <button onClick={() => setCategories((p) => p.filter((c) => c.id !== cat.id))} className="p-0.5 text-red-400 hover:text-red-600">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="grid grid-cols-[1fr_140px_60px] gap-1.5">
                      <div>
                        <label className={lbl}>내용</label>
                        <textarea rows={2} value={cat.contents} onChange={(e) => updateCat(cat.id, "contents", e.target.value)} className={`${inp} resize-y`} />
                      </div>
                      <div>
                        <label className={lbl}>비고</label>
                        <textarea rows={2} value={cat.remark} onChange={(e) => updateCat(cat.id, "remark", e.target.value)} className={`${inp} resize-y`} />
                      </div>
                      <div>
                        <label className={lbl}>시간(분)</label>
                        <input type="text" value={cat.timeLength} onChange={(e) => updateCat(cat.id, "timeLength", e.target.value)} className={inp} placeholder="10" />
                      </div>
                    </div>
                    {/* Category-level Media */}
                    <div className="mt-1.5">
                      <label className={lbl}>미디어 <span className="text-muted-foreground">(다중선택)</span></label>
                      <div className="flex flex-wrap items-center gap-1">
                        {mediaOptions.map((m) => (
                          <button key={m} type="button"
                            onClick={() => toggleCatArray(cat.id, "mediaTypes", m)}
                            className={`px-2 py-0.5 rounded border text-sm transition-colors ${cat.mediaTypes.includes(m) ? "border-blue-500 bg-blue-50 text-blue-700" : "border-border hover:bg-gray-50"}`}>
                            {m}
                          </button>
                        ))}
                        {cat.mediaTypes.filter((m) => !mediaOptions.includes(m)).map((m) => (
                          <button key={m} type="button"
                            onClick={() => removeCatArrayItem(cat.id, "mediaTypes", m)}
                            className="px-2 py-0.5 rounded border border-blue-500 bg-blue-50 text-blue-700 text-sm flex items-center gap-1">
                            {m}<X className="w-3 h-3" />
                          </button>
                        ))}
                        <div className="flex items-center gap-1">
                          <input type="text" placeholder="직접입력..." value={catMediaInputs[cat.id] ?? ""} onChange={(e) => setCatMediaInputs({ ...catMediaInputs, [cat.id]: e.target.value })}
                            onKeyDown={(e) => e.key === "Enter" && addCatArrayItem(cat.id, "mediaTypes", catMediaInputs[cat.id] ?? "")}
                            className="px-2 py-0.5 border border-border rounded bg-[var(--input-background)] text-sm w-24 focus:outline-none focus:ring-1 focus:ring-blue-500/30" />
                          <button onClick={() => addCatArrayItem(cat.id, "mediaTypes", catMediaInputs[cat.id] ?? "")} type="button" className="p-0.5 bg-blue-100 text-blue-700 rounded hover:bg-blue-200">
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                    {/* Category-level Teaching Aids */}
                    <div className="mt-1.5">
                      <label className={lbl}>교구 <span className="text-muted-foreground">(다중선택)</span></label>
                      <div className="flex flex-wrap items-center gap-1">
                        {teachingAids.map((a) => (
                          <button key={a} type="button"
                            onClick={() => toggleCatArray(cat.id, "teachingAids", a)}
                            className={`px-2 py-0.5 rounded border text-sm transition-colors ${cat.teachingAids.includes(a) ? "border-blue-500 bg-blue-50 text-blue-700" : "border-border hover:bg-gray-50"}`}>
                            {a}
                          </button>
                        ))}
                        {cat.teachingAids.filter((a) => !teachingAids.includes(a)).map((a) => (
                          <button key={a} type="button"
                            onClick={() => removeCatArrayItem(cat.id, "teachingAids", a)}
                            className="px-2 py-0.5 rounded border border-blue-500 bg-blue-50 text-blue-700 text-sm flex items-center gap-1">
                            {a}<X className="w-3 h-3" />
                          </button>
                        ))}
                        <div className="flex items-center gap-1">
                          <input type="text" placeholder="직접입력..." value={catAidInputs[cat.id] ?? ""} onChange={(e) => setCatAidInputs({ ...catAidInputs, [cat.id]: e.target.value })}
                            onKeyDown={(e) => e.key === "Enter" && addCatArrayItem(cat.id, "teachingAids", catAidInputs[cat.id] ?? "")}
                            className="px-2 py-0.5 border border-border rounded bg-[var(--input-background)] text-sm w-24 focus:outline-none focus:ring-1 focus:ring-blue-500/30" />
                          <button onClick={() => addCatArrayItem(cat.id, "teachingAids", catAidInputs[cat.id] ?? "")} type="button" className="p-0.5 bg-blue-100 text-blue-700 rounded hover:bg-blue-200">
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Section 4: Steps */}
          <section className="bg-white border border-border rounded-lg p-1">
            <h3 className="text-sm text-violet-700 pb-1.5 mb-2 border-b border-border flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center text-xs">4</span>
              단계별 활동 내용
            </h3>
            <div className="flex flex-wrap gap-1 mb-2">
              {stepCheckboxes.map((cb) => (
                <label key={cb}
                  className={`flex items-center gap-1 px-2 py-0.5 border rounded cursor-pointer text-sm transition-colors ${isStepChecked(cb) ? "border-violet-400 bg-violet-50 text-violet-700" : "border-border hover:bg-gray-50"}`}>
                  <input type="checkbox" checked={isStepChecked(cb)} onChange={() => toggleStep(cb)} className="w-3 h-3 accent-violet-600" />
                  {cb}
                </label>
              ))}
              {/* custom-added steps not in preset */}
              {steps.filter((s) => !stepCheckboxes.includes(s.title)).map((s) => (
                <label key={s.id}
                  className="flex items-center gap-1 px-2 py-0.5 border border-violet-400 bg-violet-50 text-violet-700 rounded cursor-pointer text-sm transition-colors">
                  <input type="checkbox" checked onChange={() => setSteps((p) => p.filter((x) => x.id !== s.id))} className="w-3 h-3 accent-violet-600" />
                  {s.title}
                </label>
              ))}
              <div className="flex items-center gap-1">
                <input type="text" placeholder="직접입력..." value={customStepName} onChange={(e) => setCustomStepName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addCustomStep()}
                  className="px-2 py-0.5 border border-border rounded bg-[var(--input-background)] text-sm w-28 focus:outline-none focus:ring-1 focus:ring-violet-500/30" />
                <button onClick={addCustomStep} className="p-0.5 bg-violet-100 text-violet-700 rounded hover:bg-violet-200">
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            {steps.length > 0 && (
              <div className="space-y-1.5">
                {steps.map((step, idx) => (
                  <div key={step.id} className="border border-violet-200 rounded p-2 bg-violet-50/20">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1 text-sm text-violet-700">
                        <span className="text-violet-400">단계{idx + 1}</span>
                        <input
                          type="text"
                          value={step.title}
                          onChange={(e) => updateStep(step.id, "title", e.target.value)}
                          className="text-sm text-violet-700 bg-transparent border-b border-transparent hover:border-violet-300 focus:border-violet-500 focus:outline-none px-0 py-0"
                        />
                      </div>
                      <button onClick={() => setSteps((p) => p.filter((s) => s.id !== step.id))} className="p-0.5 text-red-400 hover:text-red-600">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="grid grid-cols-[60px_1fr_1fr] gap-1.5">
                      <div>
                        <label className={lbl}>시간</label>
                        <input type="text" value={step.time} onChange={(e) => updateStep(step.id, "time", e.target.value)} className={inp} placeholder="15분" />
                      </div>
                      <div>
                        <label className={lbl}>수업 형태</label>
                        <input type="text" value={step.setUp} onChange={(e) => updateStep(step.id, "setUp", e.target.value)} className={inp} />
                      </div>
                      <div>
                        <label className={lbl}>비고</label>
                        <input type="text" value={step.remark} onChange={(e) => updateStep(step.id, "remark", e.target.value)} className={inp} />
                      </div>
                    </div>
                    <div className="mt-1.5">
                      <label className={lbl}>활동 내용</label>
                      <textarea rows={2} value={step.description} onChange={(e) => updateStep(step.id, "description", e.target.value)} className={`${inp} resize-y`} />
                    </div>
                    {/* Step-level Media */}
                    <div className="mt-1.5">
                      <label className={lbl}>미디어 <span className="text-muted-foreground">(다중선택)</span></label>
                      <div className="flex flex-wrap items-center gap-1">
                        {mediaOptions.map((m) => (
                          <button key={m} type="button"
                            onClick={() => toggleStepArray(step.id, "mediaTypes", m)}
                            className={`px-2 py-0.5 rounded border text-sm transition-colors ${step.mediaTypes.includes(m) ? "border-blue-500 bg-blue-50 text-blue-700" : "border-border hover:bg-gray-50"}`}>
                            {m}
                          </button>
                        ))}
                        {step.mediaTypes.filter((m) => !mediaOptions.includes(m)).map((m) => (
                          <button key={m} type="button"
                            onClick={() => removeStepArrayItem(step.id, "mediaTypes", m)}
                            className="px-2 py-0.5 rounded border border-blue-500 bg-blue-50 text-blue-700 text-sm flex items-center gap-1">
                            {m}<X className="w-3 h-3" />
                          </button>
                        ))}
                        <div className="flex items-center gap-1">
                          <input type="text" placeholder="직접입력..." value={stepMediaInputs[step.id] ?? ""} onChange={(e) => setStepMediaInputs({ ...stepMediaInputs, [step.id]: e.target.value })}
                            onKeyDown={(e) => e.key === "Enter" && addStepArrayItem(step.id, "mediaTypes", stepMediaInputs[step.id] ?? "")}
                            className="px-2 py-0.5 border border-border rounded bg-[var(--input-background)] text-sm w-24 focus:outline-none focus:ring-1 focus:ring-blue-500/30" />
                          <button onClick={() => addStepArrayItem(step.id, "mediaTypes", stepMediaInputs[step.id] ?? "")} type="button" className="p-0.5 bg-blue-100 text-blue-700 rounded hover:bg-blue-200">
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                    {/* Step-level Teaching Aids */}
                    <div className="mt-1.5">
                      <label className={lbl}>교구 <span className="text-muted-foreground">(다중선택)</span></label>
                      <div className="flex flex-wrap items-center gap-1">
                        {teachingAids.map((a) => (
                          <button key={a} type="button"
                            onClick={() => toggleStepArray(step.id, "teachingAids", a)}
                            className={`px-2 py-0.5 rounded border text-sm transition-colors ${step.teachingAids.includes(a) ? "border-blue-500 bg-blue-50 text-blue-700" : "border-border hover:bg-gray-50"}`}>
                            {a}
                          </button>
                        ))}
                        {step.teachingAids.filter((a) => !teachingAids.includes(a)).map((a) => (
                          <button key={a} type="button"
                            onClick={() => removeStepArrayItem(step.id, "teachingAids", a)}
                            className="px-2 py-0.5 rounded border border-blue-500 bg-blue-50 text-blue-700 text-sm flex items-center gap-1">
                            {a}<X className="w-3 h-3" />
                          </button>
                        ))}
                        <div className="flex items-center gap-1">
                          <input type="text" placeholder="직접입력..." value={stepAidInputs[step.id] ?? ""} onChange={(e) => setStepAidInputs({ ...stepAidInputs, [step.id]: e.target.value })}
                            onKeyDown={(e) => e.key === "Enter" && addStepArrayItem(step.id, "teachingAids", stepAidInputs[step.id] ?? "")}
                            className="px-2 py-0.5 border border-border rounded bg-[var(--input-background)] text-sm w-24 focus:outline-none focus:ring-1 focus:ring-blue-500/30" />
                          <button onClick={() => addStepArrayItem(step.id, "teachingAids", stepAidInputs[step.id] ?? "")} type="button" className="p-0.5 bg-blue-100 text-blue-700 rounded hover:bg-blue-200">
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Section 5: Attachments */}
          <section className="bg-white border border-border rounded-lg p-1">
            <h3 className="text-sm text-amber-700 pb-1.5 mb-2 border-b border-border flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs">5</span>
              첨부파일
            </h3>

            {/* 더미 썸네일 미리보기 */}
            <div className="grid grid-cols-4 gap-2 mb-2">
              {[
                { name: "lesson_activity.png", size: "340KB", url: "https://images.unsplash.com/photo-1652856173688-442aa6001b29?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsZXNzb24lMjBwbGFuJTIwZG9jdW1lbnQlMjBwYXBlcnxlbnwxfHx8fDE3NzI1MTgyMzh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" },
                { name: "textbook_p12.png", size: "520KB", url: "https://images.unsplash.com/photo-1760636381941-b6b8e871d268?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlZHVjYXRpb24lMjB0ZXh0Ym9vayUyMHBhZ2VzfGVufDF8fHx8MTc3MjUxODIzOXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" },
                { name: "whiteboard_note.jpg", size: "280KB", url: "https://images.unsplash.com/photo-1643982102543-bc057db646cf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbmdsaXNoJTIwY2xhc3MlMjB3aGl0ZWJvYXJkfGVufDF8fHx8MTc3MjUxODI0Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" },
                { name: "worksheet_colors.png", size: "410KB", url: "https://images.unsplash.com/photo-1672306325342-8373e06baf99?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2xvcmZ1bCUyMHdvcmtzaGVldCUyMGFjdGl2aXR5fGVufDF8fHx8MTc3MjUxODI0Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" },
              ].map((dummy) => (
                <div key={dummy.name} className="group relative border border-border rounded-lg overflow-hidden bg-gray-50">
                  <div className="aspect-[4/3] overflow-hidden">
                    <img src={dummy.url} alt={dummy.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="px-1.5 py-1">
                    <p className="text-xs truncate" title={dummy.name}>{dummy.name}</p>
                    <p className="text-xs text-muted-foreground">{dummy.size}</p>
                  </div>
                  <button className="absolute top-1 right-1 p-0.5 bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>

            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="border-2 border-dashed border-border rounded-lg p-1 text-center hover:border-blue-400 hover:bg-blue-50/30 transition-colors cursor-pointer"
              onClick={() => document.getElementById("file-input")?.click()}
            >
              <Upload className="w-4 h-4 mx-auto mb-0.5 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">파일을 끌어다 놓거나 클릭하여 선택 (최대 4개)</p>
              <p className="text-xs text-muted-foreground mt-0.5">Please name the file in English.</p>
              <input id="file-input" type="file" multiple className="hidden" onChange={handleFileInput} />
            </div>
            {files.length > 0 && (
              <div className="mt-1.5 grid grid-cols-4 gap-2">
                {files.map((f, i) => {
                  const isImage = f.type.startsWith("image/");
                  const previewUrl = isImage ? URL.createObjectURL(f) : null;
                  return (
                    <div key={i} className="group relative border border-border rounded-lg overflow-hidden bg-gray-50">
                      <div className="aspect-[4/3] overflow-hidden flex items-center justify-center bg-gray-100">
                        {previewUrl ? (
                          <img src={previewUrl} alt={f.name} className="w-full h-full object-cover" />
                        ) : (
                          <FileText className="w-8 h-8 text-muted-foreground/40" />
                        )}
                      </div>
                      <div className="px-1.5 py-1">
                        <p className="text-xs truncate" title={f.name}>{f.name}</p>
                        <p className="text-xs text-muted-foreground">{(f.size / 1024).toFixed(0)}KB</p>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); setFiles((p) => p.filter((_, j) => j !== i)); }}
                        className="absolute top-1 right-1 p-0.5 bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
      <ExportWordModal open={showExportModal} onClose={() => setShowExportModal(false)} data={exportData} />
    </div>
  );
}