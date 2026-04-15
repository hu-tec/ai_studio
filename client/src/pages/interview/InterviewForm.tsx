import React, { useState } from "react";
import { Save, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import {
  useStore,
  createEmptyApplicant,
  SKILL_OPTIONS,
  INSTRUCTOR_SKILL_OPTIONS,
  STAFF_SKILL_OPTIONS,
  CATEGORY_OPTIONS,
  CERTIFICATE_OPTIONS,
  calculateGrade,
  type Applicant,
  type ApplicantType,
} from "./interviewStore";
import { PreviewPanel } from "./PreviewPanel";

function ScoreSelector({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <label className="text-gray-600 block" style={{ fontSize: "0.68rem" }}>{label}</label>
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`w-7 h-7 rounded-md border transition-all ${
              value >= n
                ? "bg-indigo-500 border-indigo-500 text-white"
                : "bg-white border-gray-200 text-gray-400 hover:border-indigo-300"
            }`}
            style={{ fontSize: "0.72rem", fontWeight: 500 }}
          >
            {n}
          </button>
        ))}
        <span className="ml-1 text-gray-400 self-center" style={{ fontSize: "0.63rem" }}>{value}/5</span>
      </div>
    </div>
  );
}

function SkillCheckGroup({
  title,
  options,
  selected,
  onChange,
}: {
  title: string;
  options: string[];
  selected: string[];
  onChange: (v: string[]) => void;
}) {
  const toggle = (opt: string) => {
    onChange(selected.includes(opt) ? selected.filter((s) => s !== opt) : [...selected, opt]);
  };

  return (
    <div className="space-y-0.5">
      <div className="text-gray-600" style={{ fontSize: "0.7rem", fontWeight: 500 }}>{title}</div>
      <div className="flex flex-wrap gap-1">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            className={`px-2 py-0.5 rounded-full border transition-all ${
              selected.includes(opt)
                ? "bg-indigo-100 border-indigo-300 text-indigo-700"
                : "bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300"
            }`}
            style={{ fontSize: "0.67rem" }}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

const chipCls = (active: boolean) =>
  `px-2 py-0.5 rounded-full border transition-all ${
    active
      ? "bg-indigo-100 border-indigo-300 text-indigo-700"
      : "bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300"
  }`;
const chipStyle = { fontSize: "0.67rem" as const };

const inputCls = "w-full border border-gray-200 rounded px-2 py-1 bg-gray-50 focus:outline-none focus:ring-1 focus:ring-indigo-200 focus:border-indigo-300";
const labelCls = "text-gray-500 block";
const labelStyle = { fontSize: "0.68rem" as const };
const inputStyle = { fontSize: "0.74rem" as const };

export function InterviewForm() {
  const { applicants, addApplicant, updateApplicant, deleteApplicant } = useStore();
  const [form, setForm] = useState<Applicant>(createEmptyApplicant());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showList, setShowList] = useState(true);
  const [skillsExpanded, setSkillsExpanded] = useState(true);
  const [certCustom, setCertCustom] = useState("");
  const [showCertInput, setShowCertInput] = useState(false);

  const update = (key: keyof Applicant, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateSkill = (key: keyof typeof SKILL_OPTIONS, value: string[]) => {
    setForm((prev) => ({ ...prev, skills: { ...prev.skills, [key]: value } }));
  };

  const updateTypeSkill = (key: string, value: string[]) => {
    setForm((prev) => ({ ...prev, typeSkills: { ...prev.typeSkills, [key]: value } }));
  };

  const selectedCerts = form.certificates
    ? form.certificates.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  const toggleCert = (cert: string) => {
    let next: string[];
    if (selectedCerts.includes(cert)) {
      next = selectedCerts.filter((c) => c !== cert);
    } else {
      next = [...selectedCerts, cert];
    }
    update("certificates", next.join(", "));
  };

  const addCustomCert = () => {
    const trimmed = certCustom.trim();
    if (trimmed && !selectedCerts.includes(trimmed)) {
      const next = [...selectedCerts, trimmed];
      update("certificates", next.join(", "));
    }
    setCertCustom("");
    setShowCertInput(false);
  };

  const removeCustomCert = (cert: string) => {
    const next = selectedCerts.filter((c) => c !== cert);
    update("certificates", next.join(", "));
  };

  const allSelectedSkills = React.useMemo(() => {
    const fromSkills = Object.values(form.skills).flat();
    const fromTypeSkills = Object.values(form.typeSkills).flat();
    return [...fromSkills, ...fromTypeSkills];
  }, [form.skills, form.typeSkills]);

  const handleTypeChange = (type: ApplicantType) => {
    setForm((prev) => ({
      ...prev,
      type,
      categoryLarge: "",
      categoryMedium: "",
      categorySmall: "",
      typeSkills: { language: [], usage: [], strength: [] },
    }));
  };

  const handleSave = () => {
    if (!form.name.trim()) {
      toast.error("지원자 이름을 입력해주세요.");
      return;
    }
    const { grade, totalScore } = calculateGrade(form);
    const saved = { ...form, grade, totalScore };

    if (editingId) {
      updateApplicant(editingId, saved);
      toast.success("평가표가 수정되었습니다.");
    } else {
      addApplicant(saved);
      toast.success("평가표가 저장되었습니다.");
    }
    setForm(createEmptyApplicant());
    setEditingId(null);
  };

  const handleEdit = (a: Applicant) => {
    setForm({ ...a });
    setEditingId(a.id);
  };

  const handleNew = () => {
    setForm(createEmptyApplicant());
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    deleteApplicant(id);
    if (editingId === id) {
      setForm(createEmptyApplicant());
      setEditingId(null);
    }
    toast.success("삭제되었습니다.");
  };

  const categoryOpts = CATEGORY_OPTIONS[form.type];
  const mediumOpts = form.categoryLarge ? categoryOpts.medium[form.categoryLarge] || [] : [];
  const smallOpts = form.categoryMedium ? categoryOpts.small[form.categoryMedium] || [] : [];
  const typeSkillOpts = form.type === "강사" ? INSTRUCTOR_SKILL_OPTIONS : STAFF_SKILL_OPTIONS;

  return (
    <div className="flex gap-2 h-[calc(100vh-60px)]">
      {/* Left: Form */}
      <div className="flex-1 min-w-0 overflow-y-auto">
        <div className="space-y-1.5 pb-1">
          {/* Applicant List Toggle */}
          {applicants.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <button
                onClick={() => setShowList(!showList)}
                className="w-full flex items-center justify-between px-2.5 py-1 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <span className="text-gray-700" style={{ fontSize: "0.78rem", fontWeight: 500 }}>
                  {"📋"} {"지원자 목록"} ({applicants.length}{"명"})
                </span>
                {showList ? <ChevronUp className="w-3.5 h-3.5 text-gray-400" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-400" />}
              </button>
              {showList && (
                <div className="divide-y divide-gray-100 max-h-28 overflow-y-auto">
                  {applicants.map((a) => {
                    const gradeColor =
                      a.grade === "A" ? "text-emerald-600 bg-emerald-50" :
                      a.grade === "B" ? "text-blue-600 bg-blue-50" :
                      a.grade === "C" ? "text-amber-600 bg-amber-50" :
                      "text-red-600 bg-red-50";
                    return (
                      <div
                        key={a.id}
                        className={`flex items-center justify-between px-2 py-1 hover:bg-blue-50 cursor-pointer transition-colors ${
                          editingId === a.id ? "bg-indigo-50" : ""
                        }`}
                        onClick={() => handleEdit(a)}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`px-1.5 py-0.5 rounded ${gradeColor}`} style={{ fontSize: "0.65rem", fontWeight: 600 }}>
                            {a.grade}
                          </span>
                          <span className="text-gray-800" style={{ fontSize: "0.73rem" }}>{a.name}</span>
                          <span className="text-gray-400" style={{ fontSize: "0.63rem" }}>{a.type}</span>
                          {a.categoryLarge && (
                            <span className="text-gray-400" style={{ fontSize: "0.6rem" }}>
                              {a.categoryLarge} &gt; {a.categoryMedium}
                            </span>
                          )}
                          {a.passStatus && (
                            <span
                              className={`px-1.5 py-0.5 rounded ${
                                a.passStatus === "합격" ? "text-emerald-600 bg-emerald-50" :
                                a.passStatus === "불합격" ? "text-red-600 bg-red-50" :
                                "text-gray-500 bg-gray-100"
                              }`}
                              style={{ fontSize: "0.6rem", fontWeight: 600 }}
                            >
                              {a.passStatus === "합격" ? "✅" : a.passStatus === "불합격" ? "❌" : "⏸️"} {a.passStatus}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(a.id); }}
                          className="text-gray-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* New Button */}
          {editingId && (
            <button
              onClick={handleNew}
              className="flex items-center gap-1 px-2.5 py-0.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
              style={{ fontSize: "0.73rem" }}
            >
              <Plus className="w-3.5 h-3.5" />
              {"새 지원자 평가"}
            </button>
          )}

          {/* Pass Status Bar */}
          <div className="flex items-center justify-between bg-white rounded-lg border border-gray-100 px-2.5 py-1">
            <div className="flex items-center gap-2">
              <span className="text-gray-500" style={{ fontSize: "0.72rem", fontWeight: 500 }}>
                {form.name ? form.name : "지원자"}
              </span>
              <span className="text-gray-300" style={{ fontSize: "0.63rem" }}>{"면접 결과"}</span>
            </div>
            <div className="flex gap-1">
              {([
                { value: "합격" as const, icon: "✅", activeClass: "bg-emerald-500 border-emerald-500 text-white shadow-sm shadow-emerald-200", hoverClass: "hover:border-emerald-300 hover:text-emerald-600" },
                { value: "불합격" as const, icon: "❌", activeClass: "bg-red-500 border-red-500 text-white shadow-sm shadow-red-200", hoverClass: "hover:border-red-300 hover:text-red-600" },
                { value: "미정" as const, icon: "⏸️", activeClass: "bg-gray-500 border-gray-500 text-white shadow-sm shadow-gray-200", hoverClass: "hover:border-gray-400 hover:text-gray-600" },
              ]).map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => update("passStatus", opt.value)}
                  className={`px-2 py-0.5 rounded-lg border-2 transition-all ${
                    form.passStatus === opt.value
                      ? opt.activeClass
                      : `bg-white border-gray-200 text-gray-400 ${opt.hoverClass}`
                  }`}
                  style={{ fontSize: "0.72rem", fontWeight: 600 }}
                >
                  {opt.icon} {opt.value}
                </button>
              ))}
            </div>
          </div>

          {/* ============================================ */}
          {/* SECTION A: 고정 평가 - 4 Cards with Toggles  */}
          {/* ============================================ */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-red-500" style={{ fontSize: "0.7rem", fontWeight: 700 }}>A</span>
              <span className="text-gray-800" style={{ fontSize: "0.78rem", fontWeight: 600 }}>{"고정 평가"}</span>
              <span className="text-gray-400" style={{ fontSize: "0.63rem" }}>{"필수 입력"}</span>
            </div>

            <div className="grid grid-cols-4 gap-1.5">
              {/* Card 1: 인적사항 */}
              <div className="bg-white rounded-lg border border-gray-100 p-2 space-y-1">
                <div className="text-gray-500" style={{ fontSize: "0.68rem", fontWeight: 600 }}>{"👤"} {"인적사항"}</div>
                <div>
                  <label className={labelCls} style={labelStyle}>{"지원자명"} *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    placeholder={"이름 입력"}
                    className={inputCls}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className={labelCls} style={labelStyle}>{"면접일"}</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => update("date", e.target.value)}
                    className={inputCls}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className={labelCls} style={labelStyle}>{"지원 분류"} *</label>
                  <div className="flex gap-1">
                    {(["강사", "직원"] as ApplicantType[]).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => handleTypeChange(t)}
                        className={`flex-1 py-1 rounded-md border transition-all ${
                          form.type === t
                            ? "bg-indigo-500 border-indigo-500 text-white"
                            : "bg-white border-gray-200 text-gray-500 hover:border-indigo-200"
                        }`}
                        style={{ fontSize: "0.73rem", fontWeight: 500 }}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card 2: 카테고리 — 토글 칩 */}
              <div className="bg-white rounded-lg border border-gray-100 p-2 space-y-1">
                <div className="text-gray-500" style={{ fontSize: "0.68rem", fontWeight: 600 }}>{"📁"} {"카테고리"}</div>
                <div>
                  <label className={labelCls} style={labelStyle}>{"대분류"}</label>
                  <div className="flex flex-wrap gap-0.5">
                    {categoryOpts.large.map((o) => (
                      <button
                        key={o}
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, categoryLarge: prev.categoryLarge === o ? "" : o, categoryMedium: "", categorySmall: "" }))}
                        className={chipCls(form.categoryLarge === o)}
                        style={chipStyle}
                      >
                        {o}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className={labelCls} style={labelStyle}>{"중분류"}</label>
                  {mediumOpts.length > 0 ? (
                    <div className="flex flex-wrap gap-0.5">
                      {mediumOpts.map((o) => (
                        <button
                          key={o}
                          type="button"
                          onClick={() => setForm((prev) => ({ ...prev, categoryMedium: prev.categoryMedium === o ? "" : o, categorySmall: "" }))}
                          className={chipCls(form.categoryMedium === o)}
                          style={chipStyle}
                        >
                          {o}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-300 py-0.5" style={{ fontSize: "0.63rem" }}>{"대분류 선택 필요"}</div>
                  )}
                </div>
                <div>
                  <label className={labelCls} style={labelStyle}>{"소분류"}</label>
                  {smallOpts.length > 0 ? (
                    <div className="flex flex-wrap gap-0.5">
                      {smallOpts.map((o) => (
                        <button
                          key={o}
                          type="button"
                          onClick={() => update("categorySmall", form.categorySmall === o ? "" : o)}
                          className={chipCls(form.categorySmall === o)}
                          style={chipStyle}
                        >
                          {o}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-300 py-0.5" style={{ fontSize: "0.63rem" }}>{"중분류 선택 필요"}</div>
                  )}
                </div>
              </div>

              {/* Card 3: 경력/학력 — 토글 */}
              <div className="bg-white rounded-lg border border-gray-100 p-2 space-y-1">
                <div className="text-gray-500" style={{ fontSize: "0.68rem", fontWeight: 600 }}>{"💼"} {"경력 / 학력"}</div>
                <div>
                  <label className={labelCls} style={labelStyle}>{"업무 경력"} *</label>
                  <div className="flex gap-1 items-center">
                    {(["신입", "경력"] as const).map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => update("career", c)}
                        className={`flex-1 py-1 rounded-md border transition-all ${
                          form.career === c
                            ? "bg-indigo-500 border-indigo-500 text-white"
                            : "bg-white border-gray-200 text-gray-500 hover:border-indigo-200"
                        }`}
                        style={{ fontSize: "0.73rem", fontWeight: 500 }}
                      >
                        {c}
                      </button>
                    ))}
                    {form.career === "경력" && (
                      <div className="flex items-center gap-0.5 shrink-0">
                        <input
                          type="number"
                          min={0}
                          max={50}
                          value={form.careerYears}
                          onChange={(e) => update("careerYears", parseInt(e.target.value) || 0)}
                          className="w-12 border border-gray-200 rounded-md px-1.5 py-1 bg-gray-50"
                          style={inputStyle}
                        />
                        <span className="text-gray-500" style={{ fontSize: "0.7rem" }}>{"년"}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className={labelCls} style={labelStyle}>{"학력"} *</label>
                  <div className="flex flex-wrap gap-0.5">
                    {(["고졸", "전문대졸", "대졸(학사)", "석사", "박사"] as const).map((e) => (
                      <button
                        key={e}
                        type="button"
                        onClick={() => update("education", form.education === e ? "" : e)}
                        className={chipCls(form.education === e)}
                        style={chipStyle}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card 4: 자격증/AI */}
              <div className="bg-white rounded-lg border border-gray-100 p-2 space-y-1">
                <div className="text-gray-500" style={{ fontSize: "0.68rem", fontWeight: 600 }}>{"📜"} {"자격증 / AI"}</div>
                <div>
                  <label className={labelCls} style={labelStyle}>{"자격증"}</label>
                  <div className="flex flex-wrap gap-0.5">
                    {CERTIFICATE_OPTIONS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => toggleCert(c)}
                        className={chipCls(selectedCerts.includes(c))}
                        style={chipStyle}
                      >
                        {c}
                      </button>
                    ))}
                    {selectedCerts.filter((c) => !CERTIFICATE_OPTIONS.includes(c)).map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => removeCustomCert(c)}
                        className="px-2 py-0.5 rounded-full border bg-amber-100 border-amber-300 text-amber-700 transition-all"
                        style={chipStyle}
                        title={"클릭하여 제거"}
                      >
                        {c} {"×"}
                      </button>
                    ))}
                    {!showCertInput ? (
                      <button
                        type="button"
                        onClick={() => setShowCertInput(true)}
                        className="px-2 py-0.5 rounded-full border border-dashed border-gray-300 text-gray-400 hover:border-indigo-300 hover:text-indigo-500 transition-all"
                        style={chipStyle}
                      >
                        {"기타(직접입력)"}
                      </button>
                    ) : (
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={certCustom}
                          onChange={(e) => setCertCustom(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") addCustomCert(); }}
                          placeholder={"자격증명"}
                          autoFocus
                          className="w-20 border border-indigo-300 rounded-md px-1.5 py-0.5 bg-white text-indigo-700 focus:outline-none"
                          style={chipStyle}
                        />
                        <button type="button" onClick={addCustomCert} className="px-1.5 py-0.5 rounded-md bg-indigo-500 text-white" style={{ fontSize: "0.63rem" }}>
                          {"추가"}
                        </button>
                        <button type="button" onClick={() => { setShowCertInput(false); setCertCustom(""); }} className="px-1.5 py-0.5 rounded-md bg-gray-200 text-gray-500" style={{ fontSize: "0.63rem" }}>
                          {"취소"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className={labelCls} style={labelStyle}>{"🤖 사용가능 AI"} <span className="text-gray-300" style={{ fontSize: "0.58rem" }}>({"스킬에서 자동 반영"})</span></label>
                  <div className="min-h-[20px] border border-gray-100 rounded px-1.5 py-0.5 bg-gray-50">
                    {allSelectedSkills.length > 0 ? (
                      <div className="flex flex-wrap gap-0.5">
                        {allSelectedSkills.map((skill, idx) => (
                          <span
                            key={`${skill}-${idx}`}
                            className="bg-indigo-50 text-indigo-600 border border-indigo-200 rounded-full px-1.5 py-0"
                            style={{ fontSize: "0.6rem" }}
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-300" style={{ fontSize: "0.65rem" }}>{"아래 스킬에서 선택하세요"}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ============================================ */}
          {/* SECTION B: 준고정 평가 + 기타 (B+C 병합)     */}
          {/* ============================================ */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-amber-600" style={{ fontSize: "0.7rem", fontWeight: 700 }}>B</span>
              <span className="text-gray-800" style={{ fontSize: "0.78rem", fontWeight: 600 }}>{"준고정 평가"}</span>
              <span className="text-gray-400" style={{ fontSize: "0.63rem" }}>{"1~5점 + 기타"}</span>
            </div>

            {/* 4 scores in one card */}
            <div className="bg-white rounded-lg border border-gray-100 p-2">
              <div className="grid grid-cols-4 gap-2">
                <ScoreSelector label={"🧐 판단력"} value={form.judgment} onChange={(v) => update("judgment", v)} />
                <ScoreSelector label={"💪 성실성/태도"} value={form.sincerity} onChange={(v) => update("sincerity", v)} />
                <ScoreSelector label={"✨ 센스"} value={form.sense} onChange={(v) => update("sense", v)} />
                <ScoreSelector label={"🏠 장기근무"} value={form.longTermWork} onChange={(v) => update("longTermWork", v)} />
              </div>
            </div>

            {/* 특이사항 + MBTI + 메모 in one row */}
            <div className="grid grid-cols-4 gap-1.5 mt-1">
              <div className="col-span-2 bg-white rounded-lg border border-gray-100 p-2">
                <label className={labelCls} style={labelStyle}>{"💡 특이사항"}</label>
                <textarea
                  value={form.specialNotes}
                  onChange={(e) => update("specialNotes", e.target.value)}
                  placeholder={"특이사항을 입력하세요"}
                  className={`${inputCls} resize-none`}
                  rows={1}
                  style={inputStyle}
                />
              </div>
              <div className="bg-white rounded-lg border border-gray-100 p-2">
                <label className={labelCls} style={labelStyle}>{"🧠"} MBTI</label>
                <select
                  value={form.mbti}
                  onChange={(e) => update("mbti", e.target.value)}
                  className={inputCls}
                  style={inputStyle}
                >
                  <option value="">{"선택 안함"}</option>
                  {["ISTJ","ISFJ","INFJ","INTJ","ISTP","ISFP","INFP","INTP","ESTP","ESFP","ENFP","ENTP","ESTJ","ESFJ","ENFJ","ENTJ"].map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div className="bg-white rounded-lg border border-gray-100 p-2">
                <label className={labelCls} style={labelStyle}>{"📝 메모"}</label>
                <input
                  type="text"
                  value={form.memo}
                  onChange={(e) => update("memo", e.target.value)}
                  placeholder={"추가 메모"}
                  className={inputCls}
                  style={inputStyle}
                />
              </div>
            </div>
          </div>

          {/* ============================= */}
          {/* Skills Section                */}
          {/* ============================= */}
          <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
            <button
              type="button"
              onClick={() => setSkillsExpanded(!skillsExpanded)}
              className="w-full flex items-center justify-between px-2.5 py-1 bg-indigo-50/60 hover:bg-indigo-50 transition-colors"
            >
              <span className="text-indigo-700" style={{ fontSize: "0.73rem", fontWeight: 500 }}>{"🛠️ 스킬 체크리스트"}</span>
              {skillsExpanded ? <ChevronUp className="w-3.5 h-3.5 text-indigo-400" /> : <ChevronDown className="w-3.5 h-3.5 text-indigo-400" />}
            </button>
            {skillsExpanded && (
              <div className="p-2 space-y-1">
                <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                  <SkillCheckGroup title={"AI 바이브 코딩"} options={SKILL_OPTIONS.aiVibeCoding} selected={form.skills.aiVibeCoding} onChange={(v) => updateSkill("aiVibeCoding", v)} />
                  <SkillCheckGroup title={"프롬프트"} options={SKILL_OPTIONS.prompt} selected={form.skills.prompt} onChange={(v) => updateSkill("prompt", v)} />
                  <SkillCheckGroup title={"디자인"} options={SKILL_OPTIONS.design} selected={form.skills.design} onChange={(v) => updateSkill("design", v)} />
                  <SkillCheckGroup title={"프로그램"} options={SKILL_OPTIONS.program} selected={form.skills.program} onChange={(v) => updateSkill("program", v)} />
                  <SkillCheckGroup title={"그 외"} options={SKILL_OPTIONS.etc} selected={form.skills.etc} onChange={(v) => updateSkill("etc", v)} />
                  <SkillCheckGroup title={"문서 작성"} options={SKILL_OPTIONS.documentWriting} selected={form.skills.documentWriting} onChange={(v) => updateSkill("documentWriting", v)} />
                  <SkillCheckGroup title={"번역 시스템"} options={SKILL_OPTIONS.translationSystem} selected={form.skills.translationSystem} onChange={(v) => updateSkill("translationSystem", v)} />
                  <SkillCheckGroup title={"사용 경력"} options={SKILL_OPTIONS.usageExperience} selected={form.skills.usageExperience} onChange={(v) => updateSkill("usageExperience", v)} />
                  <SkillCheckGroup title={"업무 경력"} options={SKILL_OPTIONS.workExperience} selected={form.skills.workExperience} onChange={(v) => updateSkill("workExperience", v)} />
                </div>

                {/* Type-specific skills */}
                <div className="border-t border-gray-100 pt-1 mt-1">
                  <div className="text-indigo-600 mb-1" style={{ fontSize: "0.68rem", fontWeight: 600 }}>
                    {form.type} {"전용 스킬"}
                  </div>
                  <div className="grid grid-cols-3 gap-x-3 gap-y-1">
                    <SkillCheckGroup title={"언어"} options={typeSkillOpts.language} selected={(form.typeSkills as any).language || []} onChange={(v) => updateTypeSkill("language", v)} />
                    <SkillCheckGroup title={"사용"} options={typeSkillOpts.usage} selected={(form.typeSkills as any).usage || []} onChange={(v) => updateTypeSkill("usage", v)} />
                    <SkillCheckGroup title={"장점"} options={typeSkillOpts.strength} selected={(form.typeSkills as any).strength || []} onChange={(v) => updateTypeSkill("strength", v)} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            className="w-full flex items-center justify-center gap-2 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
            style={{ fontSize: "0.82rem", fontWeight: 500 }}
          >
            <Save className="w-4 h-4" />
            {editingId ? "평가표 수정" : "평가표 저장"}
          </button>
        </div>
      </div>

      {/* Right: Preview Panel */}
      <div className="w-72 flex-shrink-0 sticky top-0 h-full">
        <PreviewPanel applicant={form} />
      </div>
    </div>
  );
}

export default InterviewForm;
