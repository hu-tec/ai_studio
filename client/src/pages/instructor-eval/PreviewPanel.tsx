import React from "react";
import { Eye } from "lucide-react";
import type { Applicant } from "./interviewStore";
import { calculateGrade } from "./interviewStore";

interface PreviewPanelProps {
  applicant: Partial<Applicant>;
}

const gradeColors: Record<string, { bg: string; text: string; border: string }> = {
  A: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-300" },
  B: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-300" },
  C: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-300" },
  D: { bg: "bg-red-50", text: "text-red-700", border: "border-red-300" },
};

export function PreviewPanel({ applicant }: PreviewPanelProps) {
  const { grade, totalScore, details } = calculateGrade(applicant);
  const colors = gradeColors[grade] || gradeColors.D;

  const scoreItems = applicant.factors ? [
    { label: "1. 판단력", value: applicant.factors.judgment?.score || 0 },
    { label: "2. 성실성", value: applicant.factors.sincerity?.score || 0 },
    { label: "3. 센스", value: applicant.factors.sense?.score || 0 },
    { label: "4. 장기근무", value: applicant.factors.retention?.score || 0 },
    { label: "5. 업무경력", value: applicant.factors.experience?.score || 0 },
    { label: "6. 학벌/관리", value: applicant.factors.academic?.score || 0 },
    { label: "7. 강의경력", value: applicant.factors.teaching?.score || 0 },
    { label: "8. 자격/전문", value: applicant.factors.expertCert?.score || 0 },
  ] : [];

  const allSkills = applicant.skills
    ? Object.values(applicant.skills).flat()
    : [];

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100 bg-gray-50 rounded-t-lg">
        <Eye className="w-3.5 h-3.5 text-gray-700 font-black" />
        <span className="text-gray-900 font-black" style={{ fontSize: "0.8rem" }}>미리보기</span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* Grade Display */}
        <div className={`${colors.bg} ${colors.border} border-2 rounded-lg p-3 text-center`}>
          <div className={`${colors.text}`} style={{ fontSize: "0.7rem", fontWeight: 800 }}>평가 등급</div>
          <div className={`${colors.text} mt-1`} style={{ fontSize: "2.5rem", fontWeight: 900, lineHeight: 1 }}>
            {grade}
          </div>
          <div className={`${colors.text} mt-1 font-black`} style={{ fontSize: "0.75rem" }}>{details}</div>
          <div className="mt-1 text-gray-800" style={{ fontSize: "0.75rem", fontWeight: 700 }}>
            총점: <span style={{ fontWeight: 900 }}>{totalScore}</span>점
          </div>
        </div>

        {/* Applicant Info */}
        <div className="bg-gray-50 rounded-lg p-2.5 space-y-1.5">
          <div style={{ fontSize: "0.75rem", fontWeight: 900 }} className="text-gray-900">지원자 정보</div>
          <div className="grid grid-cols-2 gap-x-2 gap-y-1" style={{ fontSize: "0.7rem" }}>
            <span className="text-gray-600 font-bold">이름:</span>
            <span className="text-gray-900 font-black text-right">{applicant.name || "-"}</span>
            <span className="text-gray-600 font-bold">분류:</span>
            <span className="text-gray-900 font-black text-right">{applicant.type || "-"}</span>
            <span className="text-gray-600 font-bold">경력:</span>
            <span className="text-gray-900 font-black text-right">
              {applicant.career === "경력" ? `경력 ${applicant.careerYears || 0}년` : applicant.career || "-"}
            </span>
            <span className="text-gray-600 font-bold">학력:</span>
            <span className="text-gray-900 font-black text-right">{applicant.education || "-"}</span>
            <span className="text-gray-600 font-bold">자격증:</span>
            <span className="text-gray-900 font-black text-right truncate">{applicant.certificates || "-"}</span>
          </div>
        </div>

        {/* Score Bars */}
        <div className="space-y-1.5">
          <div style={{ fontSize: "0.75rem", fontWeight: 900 }} className="text-gray-900">평가 점수</div>
          {scoreItems.map((item) => (
            <div key={item.label}>
              <div className="flex justify-between mb-0.5" style={{ fontSize: "0.65rem" }}>
                <span className="text-gray-700 font-bold">{item.label}</span>
                <span className="text-gray-900 font-black">{item.value}/5</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 shadow-inner">
                <div
                  className="h-2 rounded-full transition-all duration-300 shadow-sm"
                  style={{
                    width: `${(item.value / 5) * 100}%`,
                    backgroundColor:
                      item.value >= 4 ? "#059669" : item.value >= 3 ? "#2563eb" : item.value >= 2 ? "#d97706" : "#dc2626",
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Skills */}
        {allSkills.length > 0 && (
          <div className="space-y-1.5">
            <div style={{ fontSize: "0.75rem", fontWeight: 900 }} className="text-gray-900">보유 스킬</div>
            <div className="flex flex-wrap gap-1">
              {allSkills.map((skill) => (
                <span
                  key={skill}
                  className="bg-indigo-50 text-indigo-800 border-2 border-indigo-200 rounded-full px-2 py-0.5 font-black"
                  style={{ fontSize: "0.65rem" }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* MBTI */}
        {applicant.mbti && (
          <div className="bg-purple-50 rounded-lg p-2 text-center border-2 border-purple-100">
            <div style={{ fontSize: "0.65rem", fontWeight: 800 }} className="text-purple-600">MBTI</div>
            <div style={{ fontSize: "1rem", fontWeight: 900 }} className="text-purple-800">{applicant.mbti}</div>
          </div>
        )}

        {/* Special Notes */}
        {applicant.specialNotes && (
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-2">
            <div style={{ fontSize: "0.65rem", fontWeight: 800 }} className="text-yellow-700">특이사항</div>
            <div style={{ fontSize: "0.75rem", fontWeight: 700 }} className="text-yellow-900 mt-0.5">{applicant.specialNotes}</div>
          </div>
        )}

        {/* Date */}
        <div className="text-center pt-1.5 border-t border-gray-200">
          <div style={{ fontSize: "0.65rem", fontWeight: 800 }} className="text-gray-500">
            면접일: {applicant.date || new Date().toISOString().split("T")[0]}
          </div>
        </div>
      </div>
    </div>
  );
}
