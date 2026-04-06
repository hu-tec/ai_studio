import React, { useState } from "react";
import { Save, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  useStore,
  createEmptyApplicant,
  SKILL_OPTIONS,
  CATEGORY_OPTIONS,
  CERTIFICATE_OPTIONS,
  calculateGrade,
  type Applicant,
  type ApplicantType,
  type EvaluationFactor,
} from "./interviewStore";
import { PreviewPanel } from "./PreviewPanel";

interface FactorEvaluationProps {
  label: string;
  desc: string;
  factor: EvaluationFactor;
  onChange: (f: EvaluationFactor) => void;
  color?: "indigo" | "emerald" | "amber";
  tags: {
    deduction: string[];
    solution: string[];
    bonus: string[];
  };
}

function FactorEvaluation({
  label,
  desc,
  factor,
  onChange,
  tags,
}: FactorEvaluationProps) {
  const update = (key: keyof EvaluationFactor, value: unknown) => {
    onChange({ ...factor, [key]: value });
  };

  const toggleTag = (key: "deductionTags" | "solutionTags" | "bonusTags", tag: string) => {
    const currentTags = factor[key] || [];
    if (currentTags.includes(tag)) {
      update(key, currentTags.filter((t: string) => t !== tag));
    } else {
      update(key, [...currentTags, tag]);
    }
  };

  const scoreLabels = ["매우 미흡", "미흡", "보통", "보통", "우수", "매우 우수"];

  return (
    <div className="space-y-4 p-4 border border-gray-100 rounded-xl bg-white shadow-sm transition-all hover:shadow-md h-full flex flex-col">
      {/* Header */}
      <div className="space-y-1">
        <span className="text-[11px] font-black text-gray-900 block">{label}</span>
        <p className="text-[9px] text-gray-500 font-bold leading-tight h-5 overflow-hidden">{desc}</p>
      </div>

      {/* Score Selection */}
      <div className="space-y-1.5 pt-2">
        <span className="text-[9px] font-black text-gray-500 uppercase tracking-tighter">점수 선택 (0~5)</span>
        <div className="flex gap-0.5 w-full">
          {[0, 1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => update("score", n)}
              className={`flex-1 aspect-square rounded-md flex flex-col items-center justify-center transition-all border-1.5 ${
                factor.score === n
                  ? "bg-gray-100 border-gray-900 shadow-sm"
                  : "border-gray-100 bg-white hover:border-gray-200"
              }`}
            >
              <span className={`text-[11px] font-black ${factor.score === n ? "text-gray-900" : "text-gray-500"}`}>{n}</span>
              <span className={`text-[7.5px] ${factor.score === n ? "text-gray-900 font-black" : "text-gray-500 font-bold"}`}>{scoreLabels[n]}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 space-y-4 pt-2 border-t border-gray-50 overflow-hidden">
        {/* Deduction */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1">
             <span className="text-red-500 text-[10px] font-bold">-</span>
             <span className="text-[10px] font-bold text-red-600">감점 요인</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {tags.deduction.map(tag => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag("deductionTags", tag)}
                className={`px-1.5 py-0.5 rounded text-[8.5px] font-black border transition-all ${factor.deductionTags.includes(tag) ? "bg-red-50 border-red-300 text-red-700" : "bg-white border-gray-100 text-gray-500 hover:border-gray-200"}`}
              >
                {tag}
              </button>
            ))}
          </div>
          <textarea
            value={factor.deductionOpinion}
            onChange={(e) => update("deductionOpinion", e.target.value)}
            className="w-full h-10 bg-gray-50/50 border border-gray-100 rounded-md p-2 text-[10px] font-bold focus:outline-none focus:ring-1 focus:ring-red-100 resize-none placeholder:text-gray-400"
            placeholder="감점 근거..."
          />
        </div>

        {/* Solutions */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1">
             <span className="text-blue-500 text-[10px] font-black">*</span>
             <span className="text-[10px] font-black text-blue-700">해결안</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {tags.solution.map(tag => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag("solutionTags", tag)}
                className={`px-1.5 py-0.5 rounded text-[8.5px] font-black border transition-all ${factor.solutionTags.includes(tag) ? "bg-blue-50 border-blue-300 text-blue-700" : "bg-white border-gray-100 text-gray-500 hover:border-gray-200"}`}
              >
                {tag}
              </button>
            ))}
          </div>
          <textarea
            value={factor.solutionOpinion}
            onChange={(e) => update("solutionOpinion", e.target.value)}
            className="w-full h-10 bg-gray-50/50 border border-gray-100 rounded-md p-2 text-[10px] font-bold focus:outline-none focus:ring-1 focus:ring-blue-100 resize-none placeholder:text-gray-400"
            placeholder="개선 제안..."
          />
        </div>

        {/* Bonus */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1">
             <span className="text-green-500 text-[10px] font-black">+</span>
             <span className="text-[10px] font-black text-green-700">가점 요인</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {tags.bonus.map(tag => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag("bonusTags", tag)}
                className={`px-1.5 py-0.5 rounded text-[8.5px] font-black border transition-all ${factor.bonusTags.includes(tag) ? "bg-green-50 border-green-300 text-green-700" : "bg-white border-gray-100 text-gray-500 hover:border-gray-200"}`}
              >
                {tag}
              </button>
            ))}
          </div>
          <textarea
            value={factor.bonusOpinion}
            onChange={(e) => update("bonusOpinion", e.target.value)}
            className="w-full h-10 bg-gray-50/50 border border-gray-100 rounded-md p-2 text-[10px] font-bold focus:outline-none focus:ring-1 focus:ring-green-100 resize-none placeholder:text-gray-400"
            placeholder="가점 근거..."
          />
        </div>

        {/* Expert Opinion */}
        <div className="space-y-1.5 mt-auto border-t border-gray-50 pt-2">
           <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black text-gray-600">전문가 종합 의견</span>
           </div>
           <textarea
             value={factor.opinion}
             onChange={(e) => update("opinion", e.target.value)}
             className="w-full h-12 bg-gray-100/30 border border-gray-100 rounded-md p-2 text-[10px] focus:outline-none focus:ring-1 focus:ring-gray-200 resize-none font-black text-gray-800"
             placeholder="수정 제안 및 총평..."
           />
        </div>
      </div>
    </div>
  );
}

export function InterviewForm() {
  const { addApplicant, updateApplicant } = useStore();
  const [form, setForm] = useState<Applicant>(createEmptyApplicant());
  const [editingId, setEditingId] = useState<string | null>(null);

  const update = (key: keyof Applicant, value: unknown) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateFactor = (key: keyof Applicant["factors"], factor: EvaluationFactor) => {
    setForm((prev) => ({
      ...prev,
      factors: { ...prev.factors, [key]: factor },
    }));
  };

  const selectedCerts = form.certificates
    ? form.certificates.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  const handleSave = () => {
    if (!form.name.trim()) {
      toast.error("지원자 이름을 입력해 주세요.");
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

  const handleNew = () => {
    setForm(createEmptyApplicant());
    setEditingId(null);
  };

  const categoryOpts = CATEGORY_OPTIONS[form.type];

  return (
    <div className="flex gap-3 h-auto p-4 bg-white">
      {/* Left: Form */}
      <div className="flex-1 min-w-0">
        <div className="space-y-4 pb-8">
          {/* Header for Print */}
          <div className="hidden print:block mb-6 border-b-2 border-gray-900 pb-2">
            <h1 className="text-2xl font-black text-center uppercase tracking-widest">면접 평가 기록지</h1>
            <div className="flex justify-between mt-2 text-xs font-bold">
              <span>면접관: ____________________</span>
              <span>날짜: {new Date().toISOString().split("T")[0]}</span>
            </div>
          </div>

          {/* ============================================ */}
          {/* SECTION A: Fixed (Required) - 4 Card Groups */}
          {/* ============================================ */}
          <div className="border-2 border-gray-900 p-4 rounded-xl">
            <div className="flex items-center gap-2 mb-4 border-b-2 border-gray-100 pb-2">
              <span className="bg-gray-900 text-white w-6 h-6 flex items-center justify-center rounded" style={{ fontSize: "0.8rem", fontWeight: 900 }}>A</span>
              <span className="text-gray-900 font-black uppercase tracking-tight" style={{ fontSize: "1rem" }}>인적사항 및 고정 평가 항목</span>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Left Column: Basic Info */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-700 block mb-1 font-black" style={{ fontSize: "0.75rem" }}>지원자명</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => update("name", e.target.value)}
                      className="h-10 border-b-2 border-gray-400 w-full bg-transparent font-black text-xl text-gray-900 focus:outline-none focus:border-indigo-500 px-1"
                      placeholder="이름 입력"
                    />
                  </div>
                  <div>
                    <label className="text-gray-700 block mb-1 font-black" style={{ fontSize: "0.75rem" }}>지원 분류</label>
                    <div className="flex gap-4 mt-2">
                      {(["강사", "직원"] as ApplicantType[]).map(t => (
                        <button key={t} type="button" onClick={() => update("type", t)} className="flex items-center gap-2">
                          <div className={`w-5 h-5 border-2 border-gray-500 rounded flex items-center justify-center ${form.type === t ? "bg-gray-900 border-gray-900" : ""}`}>
                            {form.type === t && <div className="w-2 h-2 bg-white rounded-full" />}
                          </div>
                          <span className="text-sm font-black text-gray-800">{t}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-gray-700 block mb-2 font-black" style={{ fontSize: "0.75rem" }}>지원 분야 (대분류 체크 및 상세 기록)</label>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {categoryOpts.large.map(cat => (
                      <button key={cat} type="button" onClick={() => update("categoryLarge", cat)} className="flex items-center gap-1.5 px-3 py-1.5 border-2 border-gray-200 rounded-lg">
                         <div className={`w-4 h-4 border-2 border-gray-400 rounded flex items-center justify-center ${form.categoryLarge === cat ? "bg-gray-900 border-gray-900" : ""}`}>
                           {form.categoryLarge === cat && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                         </div>
                         <span className="text-xs font-black text-gray-800">{cat}</span>
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <span className="text-[10px] text-gray-500 font-black block mb-1">중분류: ________________</span>
                    </div>
                    <div className="flex-1">
                      <span className="text-[10px] text-gray-500 font-black block mb-1">소분류: ________________</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-gray-700 block mb-2 font-black" style={{ fontSize: "0.75rem" }}>경력 사항</label>
                  <div className="flex items-center gap-6">
                    {["신입", "경력"].map(c => (
                      <button key={c} type="button" onClick={() => update("career", c)} className="flex items-center gap-2">
                        <div className={`w-5 h-5 border-2 border-gray-500 rounded flex items-center justify-center ${form.career === c ? "bg-gray-900 border-gray-900" : ""}`}>
                          {form.career === c && <div className="w-2 h-2 bg-white rounded-full" />}
                        </div>
                        <span className="text-sm font-black text-gray-800">{c === "경력" ? "경력 (____년)" : c}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Education & Certs */}
              <div className="space-y-4">
                <div>
                  <label className="text-gray-700 block mb-2 font-black" style={{ fontSize: "0.75rem" }}>최종 학력</label>
                  <div className="grid grid-cols-3 gap-y-2">
                    {["고졸", "전문대졸", "대졸(학사)", "석사", "박사"].map(edu => (
                      <button key={edu} type="button" onClick={() => update("education", edu)} className="flex items-center gap-2">
                        <div className={`w-4 h-4 border-2 border-gray-400 rounded flex items-center justify-center ${form.education === edu ? "bg-gray-900 border-gray-900" : ""}`}>
                           {form.education === edu && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                        </div>
                        <span className="text-xs font-black text-gray-800">{edu}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-gray-700 block mb-2 font-black" style={{ fontSize: "0.75rem" }}>주요 자격증 (보유 시 체크)</label>
                  <div className="grid grid-cols-3 gap-y-1.5 gap-x-2">
                    {CERTIFICATE_OPTIONS.slice(0, 12).map(cert => (
                      <button
                        key={cert}
                        type="button"
                        onClick={() => {
                          const next = selectedCerts.includes(cert)
                            ? selectedCerts.filter((c) => c !== cert)
                            : [...selectedCerts, cert];
                          update("certificates", next.join(", "));
                        }}
                        className="flex items-center gap-1.5"
                      >
                        <div className="w-4 h-4 border-2 border-gray-400 rounded flex items-center justify-center">
                          {selectedCerts.includes(cert) && <div className="w-2.5 h-2.5 bg-indigo-600 rounded-sm" />}
                        </div>
                        <span className="text-[10px] text-gray-800 font-black truncate">{cert}</span>
                      </button>
                    ))}
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-gray-500 font-black italic">기타: ________________</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ================================================ */}
          {/* SECTION B: 평가 점수 (2 PARTS - 통합)            */}
          {/* ================================================ */}
          <div className="border-2 border-gray-900 p-5 rounded-xl space-y-8 bg-gray-50/30">
            <div className="flex items-center gap-2 mb-2 border-b-2 border-gray-900 pb-2">
              <span className="bg-gray-900 text-white w-6 h-6 flex items-center justify-center rounded" style={{ fontSize: "0.8rem", fontWeight: 900 }}>B</span>
              <span className="text-gray-900 font-black uppercase tracking-tight" style={{ fontSize: "1.1rem" }}>평가 점수 (수기 기록 및 상세 분석)</span>
            </div>

            {/* PART 1: 기본 역량 및 인성 */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] font-black bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded uppercase tracking-wider">PART 1</span>
                <span className="text-sm font-black text-gray-800">기본 역량 및 인성 태도</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                <FactorEvaluation
                  label="1. 판단력"
                  desc="논리적 상황 대처, 가치관 일관성, 최적의 문제 해결 능력"
                  factor={form.factors.judgment}
                  onChange={(f) => updateFactor("judgment", f)}
                  color="indigo"
                  tags={{
                    deduction: ["논리결여", "감정적대응", "기준모호"],
                    solution: ["팩트체크", "대안제시", "의사결정"],
                    bonus: ["신속한판단", "합리적근거", "통찰력"],
                  }}
                />
                <FactorEvaluation
                  label="2. 성실성/태도"
                  desc="답변의 진실성, 면접 예절 및 경청, 목표 완수 의지와 책임감"
                  factor={form.factors.sincerity}
                  onChange={(f) => updateFactor("sincerity", f)}
                  color="indigo"
                  tags={{
                    deduction: ["지각/불성실", "답변번복", "태도불량"],
                    solution: ["예절교육", "태도개선", "마인드셋"],
                    bonus: ["정직한답변", "강한책임감", "신뢰감"],
                  }}
                />
                <FactorEvaluation
                  label="3. 센스/소통"
                  desc="대화 맥락 파악, 유연한 임기응변, 상대의 의도 파악 및 대응"
                  factor={form.factors.sense}
                  onChange={(f) => updateFactor("sense", f)}
                  color="indigo"
                  tags={{
                    deduction: ["맥락오해", "경직된사고", "소통단절"],
                    solution: ["경청훈련", "화법교정", "유연성"],
                    bonus: ["빠른상황파악", "높은공감도", "전달력"],
                  }}
                />
                <FactorEvaluation
                  label="4. 장기근무"
                  desc="이직 사유의 타당성, 커리어 목표 구체성, 조직 문화 적응 의지"
                  factor={form.factors.retention}
                  onChange={(f) => updateFactor("retention", f)}
                  color="indigo"
                  tags={{
                    deduction: ["퇴사우려", "목표불분명", "적응미흡"],
                    solution: ["비전제시", "복지상담", "적응지원"],
                    bonus: ["장기성장성", "협업마인드", "애사심"],
                  }}
                />
              </div>
            </div>

            {/* PART 2: 직무 및 경력 전문성 */}
            <div className="space-y-4 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] font-black bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded uppercase tracking-wider">PART 2</span>
                <span className="text-sm font-black text-gray-800">직무 및 경력 역량 전문성</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                <FactorEvaluation
                  label="5. 업무경력"
                  desc="핵심 프로젝트 기여도, 실무 프로세스 이해도, 성과 창출 사례"
                  factor={form.factors.experience}
                  onChange={(f) => updateFactor("experience", f)}
                  color="emerald"
                  tags={{
                    deduction: ["경력부족", "성과미비", "기술낙후"],
                    solution: ["실무교육", "OJT", "직무재배치"],
                    bonus: ["성과입증", "풍부한경험", "트렌드파악"],
                  }}
                />
                <FactorEvaluation
                  label="6. 학벌 및 조직관리"
                  desc="학위 적합성, 조직 관리 경험, 리더십 및 팀워크 역량"
                  factor={form.factors.academic}
                  onChange={(f) => updateFactor("academic", f)}
                  color="emerald"
                  tags={{
                    deduction: ["학위부족", "관리경험무", "리더십결여"],
                    solution: ["관리교육", "역량강화", "멘토링"],
                    bonus: ["우수학벌", "검증된리더십", "인사이트"],
                  }}
                />
                <FactorEvaluation
                  label="7. 강의경력"
                  desc="교육 전달력, 커리큘럼 구성, 청중 피드백 및 강의 성과"
                  factor={form.factors.teaching}
                  onChange={(f) => updateFactor("teaching", f)}
                  color="emerald"
                  tags={{
                    deduction: ["전달력부족", "자료부실", "피드백저조"],
                    solution: ["스피치교육", "교안개선", "시강훈련"],
                    bonus: ["강의평가우수", "명쾌한전달", "실무위주"],
                  }}
                />
                <FactorEvaluation
                  label="8. 자격증/전문성"
                  desc="보유 자격의 실무 적용성, 지식의 깊이, 지속적 역량 개발 노력"
                  factor={form.factors.expertCert}
                  onChange={(f) => updateFactor("expertCert", f)}
                  color="emerald"
                  tags={{
                    deduction: ["자격미보유", "전문성부족", "응용불가"],
                    solution: ["자격취득권고", "기술연수", "심화학습"],
                    bonus: ["핵심자격보유", "기술적깊이", "실무활용"],
                  }}
                />
              </div>
            </div>
          </div>

          {/* ================================================ */}
          {/* SECTION C: Skills Checklist                      */}
          {/* ================================================ */}
          <div className="border-2 border-gray-900 p-4 rounded-xl">
             <div className="flex items-center gap-2 mb-4 border-b-2 border-gray-100 pb-2">
              <span className="bg-gray-900 text-white w-6 h-6 flex items-center justify-center rounded" style={{ fontSize: "0.8rem", fontWeight: 900 }}>C</span>
              <span className="text-gray-900 font-black uppercase tracking-tight" style={{ fontSize: "1rem" }}>보유 스킬 및 상세 체크리스트</span>
            </div>

            <div className="grid grid-cols-4 gap-x-8 gap-y-4">
              {Object.entries(SKILL_OPTIONS).map(([key, options]) => {
                const labels: Record<string, string> = {
                  aiVibeCoding: "AI 바이브코딩",
                  prompt: "프롬프트 활용",
                  design: "디자인 툴",
                  program: "기타 프로그램",
                  etc: "기타 역량",
                  documentWriting: "문서 작성",
                  translationSystem: "번역 시스템",
                  usageExperience: "사용 경력",
                  workExperience: "업무 경력",
                  videoEditing: "영상 편집",
                  onlinePlatform: "온라인 강의",
                  whiteboard: "화이트보드",
                  quizAssessment: "퀴즈/평가",
                  screenRecording: "화면 녹화",
                  presentationTool: "발표 도구",
                  contentCreation: "콘텐츠 제작",
                  survey: "설문조사",
                };
                const selected = form.skills[key as keyof typeof form.skills] || [];
                return (
                  <div key={key} className="space-y-1.5">
                    <div className="text-[11px] font-black text-gray-800 bg-gray-200 px-2 py-0.5 rounded inline-block">{labels[key] || key}</div>
                    <div className="flex flex-wrap gap-y-1.5 gap-x-4 pl-1">
                      {options.map(opt => {
                        const isSelected = selected.includes(opt);
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => {
                              const newSelected = isSelected
                                ? selected.filter((s: string) => s !== opt)
                                : [...selected, opt];
                              setForm((prev) => ({
                                ...prev,
                                skills: { ...prev.skills, [key]: newSelected },
                              }));
                            }}
                            className="flex items-center gap-1.5"
                          >
                            <div className={`w-4 h-4 border-2 rounded flex items-center justify-center ${isSelected ? "bg-indigo-600 border-indigo-600 shadow-sm" : "border-gray-400"}`}>
                              {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                            </div>
                            <span className="text-[10.5px] text-gray-900 font-black">{opt}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200" />
          </div>

          {/* Action Buttons (Hidden on Print) */}
          <div className="flex justify-end gap-3 print:hidden pt-4 pb-10">
            <Button variant="outline" onClick={handleNew} className="gap-2">
              <Plus className="w-4 h-4" /> 초기화
            </Button>
            <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700 gap-2">
              <Save className="w-4 h-4" /> 시스템 저장
            </Button>
          </div>
        </div>
      </div>

      {/* Right: Preview Panel (Hidden on Print) */}
      <div className="w-80 shrink-0 print:hidden">
        <div className="sticky top-0 space-y-3">
          <PreviewPanel applicant={form} />
        </div>
      </div>
    </div>
  );
}
