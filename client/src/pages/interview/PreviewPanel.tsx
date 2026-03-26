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

  const scoreItems = [
    { label: "판단력", value: applicant.judgment || 0 },
    { label: "성실성/태도", value: applicant.sincerity || 0 },
    { label: "센스", value: applicant.sense || 0 },
    { label: "장기근무", value: applicant.longTermWork || 0 },
  ];

  const allSkills = applicant.skills
    ? Object.values(applicant.skills).flat()
    : [];

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100 bg-gray-50 rounded-t-lg">
        <Eye className="w-3.5 h-3.5 text-gray-500" />
        <span className="text-gray-700" style={{ fontSize: "0.8rem" }}>{"\uBBF8\uB9AC\uBCF4\uAE30"}</span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* Grade Display */}
        <div className={`${colors.bg} ${colors.border} border-2 rounded-lg p-3 text-center`}>
          <div className={`${colors.text}`} style={{ fontSize: "0.7rem", fontWeight: 500 }}>{"\uD3C9\uAC00 \uB4F1\uAE09"}</div>
          <div className={`${colors.text} mt-1`} style={{ fontSize: "2.5rem", fontWeight: 700, lineHeight: 1 }}>
            {grade}
          </div>
          <div className={`${colors.text} mt-1`} style={{ fontSize: "0.7rem" }}>{details}</div>
          <div className="mt-1 text-gray-600" style={{ fontSize: "0.75rem" }}>
            {"\uCD1D\uC810"}: <span style={{ fontWeight: 600 }}>{totalScore}</span>{"\uC810"}
          </div>
        </div>

        {/* Applicant Info */}
        <div className="bg-gray-50 rounded-lg p-2.5 space-y-1.5">
          <div style={{ fontSize: "0.75rem", fontWeight: 600 }} className="text-gray-700">{"\uC9C0\uC6D0\uC790 \uC815\uBCF4"}</div>
          <div className="grid grid-cols-2 gap-0.5" style={{ fontSize: "0.7rem" }}>
            <span className="text-gray-500">이름:</span>
            <span className="text-gray-800">{applicant.name || "-"}</span>
            <span className="text-gray-500">분류:</span>
            <span className="text-gray-800">{applicant.type || "-"}</span>
            <span className="text-gray-500">경력:</span>
            <span className="text-gray-800">
              {applicant.career === "경력" ? `경력 ${applicant.careerYears || 0}년` : applicant.career || "-"}
            </span>
            <span className="text-gray-500">학력:</span>
            <span className="text-gray-800">{applicant.education || "-"}</span>
            <span className="text-gray-500">자격증:</span>
            <span className="text-gray-800">{applicant.certificates || "-"}</span>
          </div>
        </div>

        {/* Score Bars */}
        <div className="space-y-1.5">
          <div style={{ fontSize: "0.75rem", fontWeight: 600 }} className="text-gray-700">{"\uD3C9\uAC00 \uC810\uC218"}</div>
          {scoreItems.map((item) => (
            <div key={item.label}>
              <div className="flex justify-between mb-0.5" style={{ fontSize: "0.65rem" }}>
                <span className="text-gray-600">{item.label}</span>
                <span className="text-gray-800" style={{ fontWeight: 500 }}>{item.value}/5</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className="h-1.5 rounded-full transition-all duration-300"
                  style={{
                    width: `${(item.value / 5) * 100}%`,
                    backgroundColor:
                      item.value >= 4 ? "#10b981" : item.value >= 3 ? "#3b82f6" : item.value >= 2 ? "#f59e0b" : "#ef4444",
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Skills */}
        {allSkills.length > 0 && (
          <div className="space-y-1.5">
            <div style={{ fontSize: "0.75rem", fontWeight: 600 }} className="text-gray-700">{"\uBCF4\uC720 \uC2A4\uD0AC"}</div>
            <div className="flex flex-wrap gap-1">
              {allSkills.map((skill) => (
                <span
                  key={skill}
                  className="bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full px-2 py-0.5"
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
          <div className="bg-purple-50 rounded-lg p-2 text-center">
            <div style={{ fontSize: "0.65rem" }} className="text-purple-500">MBTI</div>
            <div style={{ fontSize: "1rem", fontWeight: 600 }} className="text-purple-700">{applicant.mbti}</div>
          </div>
        )}

        {/* Special Notes */}
        {applicant.specialNotes && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2">
            <div style={{ fontSize: "0.65rem", fontWeight: 500 }} className="text-yellow-700">{"\uD2B9\uC774\uC0AC\uD56D"}</div>
            <div style={{ fontSize: "0.7rem" }} className="text-yellow-800 mt-0.5">{applicant.specialNotes}</div>
          </div>
        )}

        {/* Date */}
        <div className="text-center pt-1.5 border-t border-gray-100">
          <div style={{ fontSize: "0.65rem" }} className="text-gray-400">
            {"\uBA74\uC811\uC77C"}: {applicant.date || new Date().toISOString().split("T")[0]}
          </div>
        </div>
      </div>
    </div>
  );
}
