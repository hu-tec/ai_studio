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

function ScoreSelector({ label, value, onChange, compact }: { label: string; value: number; onChange: (v: number) => void; compact?: boolean }) {
  return (
    <div>
      <label className="text-gray-600 block mb-1" style={{ fontSize: "0.72rem" }}>{label}</label>
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`w-8 h-8 rounded-md border transition-all ${
              value >= n
                ? "bg-indigo-500 border-indigo-500 text-white"
                : "bg-white border-gray-200 text-gray-400 hover:border-indigo-300"
            }`}
            style={{ fontSize: "0.75rem", fontWeight: 500 }}
          >
            {n}
          </button>
        ))}
        <span className="ml-1 text-gray-400 self-center" style={{ fontSize: "0.65rem" }}>{value}/5</span>
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

const inputCls = "w-full border border-gray-200 rounded-md px-2.5 py-1.5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300";
const labelCls = "text-gray-500 block mb-0.5";
const labelStyle = { fontSize: "0.72rem" as const };
const inputStyle = { fontSize: "0.78rem" as const };

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

  // Parse certificates string into array for toggle state
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

  // Derive selected skills from ALL skill checklist categories + type skills
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
      toast.error("\uC9C0\uC6D0\uC790 \uC774\uB984\uC744 \uC785\uB825\uD574\uC8FC\uC138\uC694.");
      return;
    }
    const { grade, totalScore } = calculateGrade(form);
    const saved = { ...form, grade, totalScore };

    if (editingId) {
      updateApplicant(editingId, saved);
      toast.success("\uD3C9\uAC00\uD45C\uAC00 \uC218\uC815\uB418\uC5C8\uC2B5\uB2C8\uB2E4.");
    } else {
      addApplicant(saved);
      toast.success("\uD3C9\uAC00\uD45C\uAC00 \uC800\uC7A5\uB418\uC5C8\uC2B5\uB2C8\uB2E4.");
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
    toast.success("\uC0AD\uC81C\uB418\uC5C8\uC2B5\uB2C8\uB2E4.");
  };

  const categoryOpts = CATEGORY_OPTIONS[form.type];
  const mediumOpts = form.categoryLarge ? categoryOpts.medium[form.categoryLarge] || [] : [];
  const smallOpts = form.categoryMedium ? categoryOpts.small[form.categoryMedium] || [] : [];
  const typeSkillOpts = form.type === "\uAC15\uC0AC" ? INSTRUCTOR_SKILL_OPTIONS : STAFF_SKILL_OPTIONS;

  return (
    <div className="flex gap-3 h-[calc(100vh-60px)]">
      {/* Left: Form */}
      <div className="flex-1 min-w-0 overflow-y-auto">
        <div className="space-y-3 pb-4">
          {/* Applicant List Toggle */}
          {applicants.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <button
                onClick={() => setShowList(!showList)}
                className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <span className="text-gray-700" style={{ fontSize: "0.8rem", fontWeight: 500 }}>
                  {"\uD83D\uDCCB"} {"\uC9C0\uC6D0\uC790 \uBAA9\uB85D"} ({applicants.length}{"\uBA85"})
                </span>
                {showList ? <ChevronUp className="w-3.5 h-3.5 text-gray-400" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-400" />}
              </button>
              {showList && (
                <div className="divide-y divide-gray-100 max-h-36 overflow-y-auto">
                  {applicants.map((a) => {
                    const gradeColor =
                      a.grade === "A" ? "text-emerald-600 bg-emerald-50" :
                      a.grade === "B" ? "text-blue-600 bg-blue-50" :
                      a.grade === "C" ? "text-amber-600 bg-amber-50" :
                      "text-red-600 bg-red-50";
                    return (
                      <div
                        key={a.id}
                        className={`flex items-center justify-between px-3 py-1.5 hover:bg-blue-50 cursor-pointer transition-colors ${
                          editingId === a.id ? "bg-indigo-50" : ""
                        }`}
                        onClick={() => handleEdit(a)}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`px-1.5 py-0.5 rounded ${gradeColor}`} style={{ fontSize: "0.65rem", fontWeight: 600 }}>
                            {a.grade}
                          </span>
                          <span className="text-gray-800" style={{ fontSize: "0.75rem" }}>{a.name}</span>
                          <span className="text-gray-400" style={{ fontSize: "0.65rem" }}>{a.type}</span>
                          {a.categoryLarge && (
                            <span className="text-gray-400" style={{ fontSize: "0.6rem" }}>
                              {a.categoryLarge} &gt; {a.categoryMedium}
                            </span>
                          )}
                          {a.passStatus && (
                            <span
                              className={`px-1.5 py-0.5 rounded ${
                                a.passStatus === "\uD569\uACA9" ? "text-emerald-600 bg-emerald-50" :
                                a.passStatus === "\uBD88\uD569\uACA9" ? "text-red-600 bg-red-50" :
                                "text-gray-500 bg-gray-100"
                              }`}
                              style={{ fontSize: "0.6rem", fontWeight: 600 }}
                            >
                              {a.passStatus === "\uD569\uACA9" ? "\u2705" : a.passStatus === "\uBD88\uD569\uACA9" ? "\u274C" : "\u23F8\uFE0F"} {a.passStatus}
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
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
              style={{ fontSize: "0.75rem" }}
            >
              <Plus className="w-3.5 h-3.5" />
              {"\uC0C8 \uC9C0\uC6D0\uC790 \uD3C9\uAC00"}
            </button>
          )}

          {/* ============================================ */}
          {/* Pass Status Bar                              */}
          {/* ============================================ */}
          <div className="flex items-center justify-between bg-white rounded-lg border border-gray-100 px-4 py-2">
            <div className="flex items-center gap-2">
              <span className="text-gray-500" style={{ fontSize: "0.72rem", fontWeight: 500 }}>
                {form.name ? form.name : "\uC9C0\uC6D0\uC790"}
              </span>
              <span className="text-gray-300" style={{ fontSize: "0.65rem" }}>{"\uBA74\uC811 \uACB0\uACFC"}</span>
            </div>
            <div className="flex gap-1.5">
              {([
                { value: "\uD569\uACA9" as const, icon: "\u2705", activeClass: "bg-emerald-500 border-emerald-500 text-white shadow-sm shadow-emerald-200", hoverClass: "hover:border-emerald-300 hover:text-emerald-600" },
                { value: "\uBD88\uD569\uACA9" as const, icon: "\u274C", activeClass: "bg-red-500 border-red-500 text-white shadow-sm shadow-red-200", hoverClass: "hover:border-red-300 hover:text-red-600" },
                { value: "\uBBF8\uC815" as const, icon: "\u23F8\uFE0F", activeClass: "bg-gray-500 border-gray-500 text-white shadow-sm shadow-gray-200", hoverClass: "hover:border-gray-400 hover:text-gray-600" },
              ]).map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => update("passStatus", opt.value)}
                  className={`px-3 py-1.5 rounded-lg border-2 transition-all ${
                    form.passStatus === opt.value
                      ? opt.activeClass
                      : `bg-white border-gray-200 text-gray-400 ${opt.hoverClass}`
                  }`}
                  style={{ fontSize: "0.75rem", fontWeight: 600 }}
                >
                  {opt.icon} {opt.value}
                </button>
              ))}
            </div>
          </div>

          {/* ============================================ */}
          {/* SECTION A: Fixed (Required) - 4 Card Groups */}
          {/* ============================================ */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-red-500" style={{ fontSize: "0.7rem", fontWeight: 700 }}>A</span>
              <span className="text-gray-800" style={{ fontSize: "0.8rem", fontWeight: 600 }}>{"\uACE0\uC815 \uD3C9\uAC00"}</span>
              <span className="text-gray-400" style={{ fontSize: "0.65rem" }}>{"\uD544\uC218 \uC785\uB825"}</span>
            </div>

            {/* Row 1: 4 cards */}
            <div className="grid grid-cols-4 gap-2">
              {/* Card 1: 인적사항 */}
              <div className="bg-white rounded-lg border border-gray-100 p-3 space-y-2">
                <div className="text-gray-500" style={{ fontSize: "0.68rem", fontWeight: 600 }}>{"\uD83D\uDC64"} {"\uC778\uC801\uC0AC\uD56D"}</div>
                <div>
                  <label className={labelCls} style={labelStyle}>{"\uC9C0\uC6D0\uC790\uBA85"} *</label>
                  {applicants.length > 0 && (
                    <select
                      value=""
                      onChange={(e) => {
                        const selected = applicants.find((a) => a.id === e.target.value);
                        if (selected) {
                          handleEdit(selected);
                        }
                      }}
                      className={`${inputCls} mb-1`}
                      style={inputStyle}
                    >
                      <option value="">{"\uAE30\uC874 \uC9C0\uC6D0\uC790 \uBD88\uB7EC\uC624\uAE30 (" + applicants.length + "\uBA85)"}</option>
                      {applicants.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name} ({a.type}{a.categoryLarge ? " · " + a.categoryLarge : ""}) - {a.grade}\uB4F1\uAE09
                        </option>
                      ))}
                    </select>
                  )}
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    placeholder={"\uC774\uB984 \uC785\uB825"}
                    className={inputCls}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className={labelCls} style={labelStyle}>{"\uBA74\uC811\uC77C"}</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => update("date", e.target.value)}
                    className={inputCls}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className={labelCls} style={labelStyle}>{"\uC9C0\uC6D0 \uBD84\uB958"} *</label>
                  <div className="flex gap-1">
                    {(["\uAC15\uC0AC", "\uC9C1\uC6D0"] as ApplicantType[]).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => handleTypeChange(t)}
                        className={`flex-1 py-1.5 rounded-md border transition-all ${
                          form.type === t
                            ? "bg-indigo-500 border-indigo-500 text-white"
                            : "bg-white border-gray-200 text-gray-500 hover:border-indigo-200"
                        }`}
                        style={{ fontSize: "0.75rem", fontWeight: 500 }}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card 2: 카테고리 */}
              <div className="bg-white rounded-lg border border-gray-100 p-3 space-y-2">
                <div className="text-gray-500" style={{ fontSize: "0.68rem", fontWeight: 600 }}>{"\uD83D\uDCC1"} {"\uCE74\uD14C\uACE0\uB9AC"}</div>
                <div>
                  <label className={labelCls} style={labelStyle}>{"\uB300\uBD84\uB958"}</label>
                  <select
                    value={form.categoryLarge}
                    onChange={(e) => {
                      setForm((prev) => ({ ...prev, categoryLarge: e.target.value, categoryMedium: "", categorySmall: "" }));
                    }}
                    className={inputCls}
                    style={inputStyle}
                  >
                    <option value="">{"\uC120\uD0DD"}</option>
                    {categoryOpts.large.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls} style={labelStyle}>{"\uC911\uBD84\uB958"}</label>
                  <select
                    value={form.categoryMedium}
                    onChange={(e) => {
                      setForm((prev) => ({ ...prev, categoryMedium: e.target.value, categorySmall: "" }));
                    }}
                    className={inputCls}
                    style={inputStyle}
                    disabled={!form.categoryLarge}
                  >
                    <option value="">{"\uC120\uD0DD"}</option>
                    {mediumOpts.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls} style={labelStyle}>{"\uC18C\uBD84\uB958"}</label>
                  <select
                    value={form.categorySmall}
                    onChange={(e) => update("categorySmall", e.target.value)}
                    className={inputCls}
                    style={inputStyle}
                    disabled={!form.categoryMedium}
                  >
                    <option value="">{"\uC120\uD0DD"}</option>
                    {smallOpts.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Card 3: 경력/학력 */}
              <div className="bg-white rounded-lg border border-gray-100 p-3 space-y-2">
                <div className="text-gray-500" style={{ fontSize: "0.68rem", fontWeight: 600 }}>{"\uD83D\uDCBC"} {"\uACBD\uB825 / \uD559\uB825"}</div>
                <div>
                  <label className={labelCls} style={labelStyle}>{"\uC5C5\uBB34 \uACBD\uB825"} *</label>
                  <div className="flex gap-1">
                    <select
                      value={form.career}
                      onChange={(e) => update("career", e.target.value)}
                      className={inputCls}
                      style={inputStyle}
                    >
                      <option value={"\uC2E0\uC785"}>{"\uC2E0\uC785"}</option>
                      <option value={"\uACBD\uB825"}>{"\uACBD\uB825"}</option>
                    </select>
                    {form.career === "\uACBD\uB825" && (
                      <div className="flex items-center gap-0.5 shrink-0">
                        <input
                          type="number"
                          min={0}
                          max={50}
                          value={form.careerYears}
                          onChange={(e) => update("careerYears", parseInt(e.target.value) || 0)}
                          className="w-14 border border-gray-200 rounded-md px-2 py-1.5 bg-gray-50"
                          style={inputStyle}
                        />
                        <span className="text-gray-500" style={{ fontSize: "0.72rem" }}>{"\uB144"}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className={labelCls} style={labelStyle}>{"\uD559\uB825"} *</label>
                  <select
                    value={form.education}
                    onChange={(e) => update("education", e.target.value)}
                    className={inputCls}
                    style={inputStyle}
                  >
                    <option value="">{"\uC120\uD0DD"}</option>
                    <option value={"\uACE0\uC878"}>{"\uACE0\uC878"}</option>
                    <option value={"\uC804\uBB38\uB300\uC878"}>{"\uC804\uBB38\uB300\uC878"}</option>
                    <option value={"\uB300\uC878(\uD559\uC0AC)"}>{"\uB300\uC878(\uD559\uC0AC)"}</option>
                    <option value={"\uC11D\uC0AC"}>{"\uC11D\uC0AC"}</option>
                    <option value={"\uBC15\uC0AC"}>{"\uBC15\uC0AC"}</option>
                  </select>
                </div>
              </div>

              {/* Card 4: 자격증/AI */}
              <div className="bg-white rounded-lg border border-gray-100 p-3 space-y-2">
                <div className="text-gray-500" style={{ fontSize: "0.68rem", fontWeight: 600 }}>{"\uD83D\uDCDC"} {"\uC790\uACA9\uC99D / AI"}</div>
                <div>
                  <label className={labelCls} style={labelStyle}>{"\uC790\uACA9\uC99D"}</label>
                  <div className="flex flex-wrap gap-1">
                    {CERTIFICATE_OPTIONS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => toggleCert(c)}
                        className={`px-2 py-0.5 rounded-full border transition-all ${
                          selectedCerts.includes(c)
                            ? "bg-indigo-100 border-indigo-300 text-indigo-700"
                            : "bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300"
                        }`}
                        style={{ fontSize: "0.67rem" }}
                      >
                        {c}
                      </button>
                    ))}
                    {/* Custom certs (not in predefined list) */}
                    {selectedCerts.filter((c) => !CERTIFICATE_OPTIONS.includes(c)).map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => removeCustomCert(c)}
                        className="px-2 py-0.5 rounded-full border bg-amber-100 border-amber-300 text-amber-700 transition-all"
                        style={{ fontSize: "0.67rem" }}
                        title={"\uD074\uB9AD\uD558\uC5EC \uC81C\uAC70"}
                      >
                        {c} {"\u00D7"}
                      </button>
                    ))}
                    {/* 기타(직접입력) toggle */}
                    {!showCertInput ? (
                      <button
                        type="button"
                        onClick={() => setShowCertInput(true)}
                        className="px-2 py-0.5 rounded-full border border-dashed border-gray-300 text-gray-400 hover:border-indigo-300 hover:text-indigo-500 transition-all"
                        style={{ fontSize: "0.67rem" }}
                      >
                        {"\uAE30\uD0C0(\uC9C1\uC811\uC785\uB825)"}
                      </button>
                    ) : (
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={certCustom}
                          onChange={(e) => setCertCustom(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") addCustomCert(); }}
                          placeholder={"\uC790\uACA9\uC99D\uBA85"}
                          autoFocus
                          className="w-24 border border-indigo-300 rounded-md px-2 py-0.5 bg-white text-indigo-700 focus:outline-none"
                          style={{ fontSize: "0.67rem" }}
                        />
                        <button
                          type="button"
                          onClick={addCustomCert}
                          className="px-1.5 py-0.5 rounded-md bg-indigo-500 text-white"
                          style={{ fontSize: "0.65rem" }}
                        >
                          {"\uCD94\uAC00"}
                        </button>
                        <button
                          type="button"
                          onClick={() => { setShowCertInput(false); setCertCustom(""); }}
                          className="px-1.5 py-0.5 rounded-md bg-gray-200 text-gray-500"
                          style={{ fontSize: "0.65rem" }}
                        >
                          {"\uCDE8\uC18C"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className={labelCls} style={labelStyle}>{"\uD83E\uDD16 \uC0AC\uC6A9\uAC00\uB2A5 AI"} <span className="text-gray-300" style={{ fontSize: "0.6rem" }}>({"\uC2A4\uD0AC\uC5D0\uC11C \uC790\uB3D9 \uBC18\uC601"})</span></label>
                  <div className="min-h-[28px] border border-gray-100 rounded-md px-2.5 py-1.5 bg-gray-50">
                    {allSelectedSkills.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {allSelectedSkills.map((skill, idx) => (
                          <span
                            key={`${skill}-${idx}`}
                            className="bg-indigo-50 text-indigo-600 border border-indigo-200 rounded-full px-1.5 py-0"
                            style={{ fontSize: "0.63rem" }}
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-300" style={{ fontSize: "0.7rem" }}>{"\uC544\uB798 \uC2A4\uD0AC\uC5D0\uC11C \uC120\uD0DD\uD558\uC138\uC694"}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ================================================ */}
          {/* SECTION B: Semi-fixed (Score) - 4 Card Groups    */}
          {/* ================================================ */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-amber-600" style={{ fontSize: "0.7rem", fontWeight: 700 }}>B</span>
              <span className="text-gray-800" style={{ fontSize: "0.8rem", fontWeight: 600 }}>{"\uC900\uACE0\uC815 \uD3C9\uAC00"}</span>
              <span className="text-gray-400" style={{ fontSize: "0.65rem" }}>{"1~5\uC810 \uD3C9\uAC00"}</span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {/* Score Card 1: 판단력 */}
              <div className="bg-white rounded-lg border border-gray-100 p-3">
                <ScoreSelector label={"\uD83E\uDDD0 \uD310\uB2E8\uB825"} value={form.judgment} onChange={(v) => update("judgment", v)} />
              </div>
              {/* Score Card 2: 성실성/태도 */}
              <div className="bg-white rounded-lg border border-gray-100 p-3">
                <ScoreSelector label={"\uD83D\uDCAA \uC131\uC2E4\uC131/\uD0DC\uB3C4"} value={form.sincerity} onChange={(v) => update("sincerity", v)} />
              </div>
              {/* Score Card 3: 센스 */}
              <div className="bg-white rounded-lg border border-gray-100 p-3">
                <ScoreSelector label={"\u2728 \uC13C\uC2A4"} value={form.sense} onChange={(v) => update("sense", v)} />
              </div>
              {/* Score Card 4: 장기근무 */}
              <div className="bg-white rounded-lg border border-gray-100 p-3">
                <ScoreSelector label={"\uD83C\uDFE0 \uC7A5\uAE30\uADFC\uBB34"} value={form.longTermWork} onChange={(v) => update("longTermWork", v)} />
              </div>
            </div>

            {/* Extra fields row */}
            <div className="grid grid-cols-1 gap-2 mt-2">
              <div className="bg-white rounded-lg border border-gray-100 p-3">
                <label className={labelCls} style={labelStyle}>{"\uD83D\uDCA1 \uD2B9\uC774\uC0AC\uD56D"}</label>
                <textarea
                  value={form.specialNotes}
                  onChange={(e) => update("specialNotes", e.target.value)}
                  placeholder={"\uD2B9\uC774\uC0AC\uD56D\uC744 \uC785\uB825\uD558\uC138\uC694"}
                  className={`${inputCls} resize-none`}
                  rows={2}
                  style={inputStyle}
                />
              </div>
            </div>
          </div>

          {/* ============================= */}
          {/* SECTION C: Optional           */}
          {/* ============================= */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-green-600" style={{ fontSize: "0.7rem", fontWeight: 700 }}>C</span>
              <span className="text-gray-800" style={{ fontSize: "0.8rem", fontWeight: 600 }}>{"\uC120\uD0DD \uC0AC\uD56D"}</span>
              <span className="text-gray-400" style={{ fontSize: "0.65rem" }}>{"\uACF5\uB780 \uAC00\uB2A5"}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white rounded-lg border border-gray-100 p-3">
                <label className={labelCls} style={labelStyle}>{"\uD83E\uDDE0"} MBTI</label>
                <select
                  value={form.mbti}
                  onChange={(e) => update("mbti", e.target.value)}
                  className={inputCls}
                  style={inputStyle}
                >
                  <option value="">{"\uC120\uD0DD \uC548\uD568"}</option>
                  {["ISTJ","ISFJ","INFJ","INTJ","ISTP","ISFP","INFP","INTP","ESTP","ESFP","ENFP","ENTP","ESTJ","ESFJ","ENFJ","ENTJ"].map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div className="bg-white rounded-lg border border-gray-100 p-3">
                <label className={labelCls} style={labelStyle}>{"\uD83D\uDCDD \uBA54\uBAA8"}</label>
                <input
                  type="text"
                  value={form.memo}
                  onChange={(e) => update("memo", e.target.value)}
                  placeholder={"\uCD94\uAC00 \uBA54\uBAA8"}
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
              className="w-full flex items-center justify-between px-3 py-2 bg-indigo-50/60 hover:bg-indigo-50 transition-colors"
            >
              <span className="text-indigo-700" style={{ fontSize: "0.75rem", fontWeight: 500 }}>{"\uD83D\uDEE0\uFE0F \uC2A4\uD0AC \uCCB4\uD06C\uB9AC\uC2A4\uD2B8"}</span>
              {skillsExpanded ? <ChevronUp className="w-3.5 h-3.5 text-indigo-400" /> : <ChevronDown className="w-3.5 h-3.5 text-indigo-400" />}
            </button>
            {skillsExpanded && (
              <div className="p-3 space-y-2">
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  <SkillCheckGroup title={"AI \uBC14\uC774\uBE0C \uCF54\uB529"} options={SKILL_OPTIONS.aiVibeCoding} selected={form.skills.aiVibeCoding} onChange={(v) => updateSkill("aiVibeCoding", v)} />
                  <SkillCheckGroup title={"\uD504\uB86C\uD504\uD2B8"} options={SKILL_OPTIONS.prompt} selected={form.skills.prompt} onChange={(v) => updateSkill("prompt", v)} />
                  <SkillCheckGroup title={"\uB514\uC790\uC778"} options={SKILL_OPTIONS.design} selected={form.skills.design} onChange={(v) => updateSkill("design", v)} />
                  <SkillCheckGroup title={"\uD504\uB85C\uADF8\uB7A8"} options={SKILL_OPTIONS.program} selected={form.skills.program} onChange={(v) => updateSkill("program", v)} />
                  <SkillCheckGroup title={"\uADF8 \uC678"} options={SKILL_OPTIONS.etc} selected={form.skills.etc} onChange={(v) => updateSkill("etc", v)} />
                  <SkillCheckGroup title={"\uBB38\uC11C \uC791\uC131"} options={SKILL_OPTIONS.documentWriting} selected={form.skills.documentWriting} onChange={(v) => updateSkill("documentWriting", v)} />
                  <SkillCheckGroup title={"\uBC88\uC5ED \uC2DC\uC2A4\uD15C"} options={SKILL_OPTIONS.translationSystem} selected={form.skills.translationSystem} onChange={(v) => updateSkill("translationSystem", v)} />
                  <SkillCheckGroup title={"\uC0AC\uC6A9 \uACBD\uB825"} options={SKILL_OPTIONS.usageExperience} selected={form.skills.usageExperience} onChange={(v) => updateSkill("usageExperience", v)} />
                  <SkillCheckGroup title={"\uC5C5\uBB34 \uACBD\uB825"} options={SKILL_OPTIONS.workExperience} selected={form.skills.workExperience} onChange={(v) => updateSkill("workExperience", v)} />
                </div>

                {/* Type-specific skills */}
                <div className="border-t border-gray-100 pt-2 mt-2">
                  <div className="text-indigo-600 mb-1.5" style={{ fontSize: "0.7rem", fontWeight: 600 }}>
                    {form.type} {"\uC804\uC6A9 \uC2A4\uD0AC"}
                  </div>
                  <div className="grid grid-cols-3 gap-x-4 gap-y-2">
                    <SkillCheckGroup title={"\uC5B8\uC5B4"} options={typeSkillOpts.language} selected={(form.typeSkills as any).language || []} onChange={(v) => updateTypeSkill("language", v)} />
                    <SkillCheckGroup title={"\uC0AC\uC6A9"} options={typeSkillOpts.usage} selected={(form.typeSkills as any).usage || []} onChange={(v) => updateTypeSkill("usage", v)} />
                    <SkillCheckGroup title={"\uC7A5\uC810"} options={typeSkillOpts.strength} selected={(form.typeSkills as any).strength || []} onChange={(v) => updateTypeSkill("strength", v)} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
            style={{ fontSize: "0.85rem", fontWeight: 500 }}
          >
            <Save className="w-4 h-4" />
            {editingId ? "\uD3C9\uAC00\uD45C \uC218\uC815" : "\uD3C9\uAC00\uD45C \uC800\uC7A5"}
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