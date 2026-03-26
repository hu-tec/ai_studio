import { useExam } from "./exam-context";
import { getExamByType } from "./exam-data";
import { CheckCircle2, Mail, Clock } from "lucide-react";
import { motion } from "motion/react";
import logo from "figma:asset/64fabebe4c3543be23256b5d663a331523d0c13c.png";

export function ResultPage() {
  const { state } = useExam();

  const exam = getExamByType(state.examType);
  const questions = exam.readingQuestions;
  const answeredCount = Object.keys(state.answers).length;

  const selectedTopic = exam.essayTopics.find(
    (t) => t.id === state.selectedTopic
  );

  const wordCount = state.essay
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0).length;

  const submittedAt = new Date().toLocaleString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="min-h-screen bg-[#faf8f6]" style={{ fontFamily: "Pretendard, sans-serif" }}>
      {/* Top Bar */}
      <div className="bg-[#1a1a2e] text-white shadow-md">
        <div className="max-w-[960px] mx-auto px-6 py-3 flex items-center gap-3">
          <img src={logo} alt="Times Media" className="h-6 object-contain block" />
          <span className="text-white/20">|</span>
          <span className="text-[13px] text-[#e8a0a0] leading-none" style={{ fontWeight: 500 }}>
            제출 완료
          </span>
        </div>
      </div>

      <div className="max-w-[960px] mx-auto px-6 py-16">
        {/* Confirmation */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 mb-6">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h1
            className="text-[#1a1a2e] text-[28px] mb-2"
            style={{ fontWeight: 800 }}
          >
            시험이 제출되었습니다
          </h1>
          <p className="text-gray-500 text-[15px]" style={{ fontWeight: 400 }}>
            답안이 정상적으로 접수되었습니다. 감사합니다.
          </p>
        </motion.div>

        {/* Two Column: Summary + Notice */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-12">
          {/* Submission Summary */}
          <motion.div
            className="bg-white shadow-sm border border-gray-100 p-7"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <span
              className="text-[#8B1A2B] text-[12px] tracking-[0.2em] uppercase mb-2 block"
              style={{ fontWeight: 600 }}
            >
              Submission Summary
            </span>
            <h2
              className="text-[#1a1a2e] text-[22px] mb-6"
              style={{ fontWeight: 800 }}
            >
              제출 요약
            </h2>

            <div className="space-y-0">
              {[
                { label: "응시자", value: state.name },
                { label: "프로그램", value: state.program },
                { label: "시험 날짜", value: state.date },
                {
                  label: "Section 1 — Reading",
                  value: `${answeredCount}/${questions.length}문제 응답`,
                },
                {
                  label: "Section 2 — Essay",
                  value: selectedTopic
                    ? `${selectedTopic.title} 선택 · ${wordCount}단어 작성`
                    : "미작성",
                },
                { label: "제출 시각", value: submittedAt },
              ].map((row, i, arr) => (
                <div
                  key={i}
                  className={`flex justify-between items-center py-4 ${
                    i < arr.length - 1 ? "border-b border-gray-100" : ""
                  }`}
                >
                  <span className="text-[14px] text-gray-500" style={{ fontWeight: 400 }}>
                    {row.label}
                  </span>
                  <span className="text-[14px] text-[#1a1a2e]" style={{ fontWeight: 600 }}>
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Notice */}
          <motion.div
            className="bg-white shadow-sm border border-gray-100 p-7"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <span
              className="text-[#8B1A2B] text-[12px] tracking-[0.2em] uppercase mb-2 block"
              style={{ fontWeight: 600 }}
            >
              Notice
            </span>
            <h2
              className="text-[#1a1a2e] text-[22px] mb-5"
              style={{ fontWeight: 800 }}
            >
              안내 사항
            </h2>

            <div className="space-y-3">
              <div className="flex items-start gap-3 p-4 bg-[#faf8f6] border border-gray-100">
                <div className="w-9 h-9 rounded-full bg-[#1a1a2e] flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4 text-[#e8a0a0]" />
                </div>
                <p className="text-[14px] text-gray-600 pt-1.5" style={{ fontWeight: 400 }}>
                  시험 결과는 채점 후 별도로 안내드립니다.
                </p>
              </div>
              <div className="flex items-start gap-3 p-4 bg-[#faf8f6] border border-gray-100">
                <div className="w-9 h-9 rounded-full bg-[#1a1a2e] flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4 text-[#e8a0a0]" />
                </div>
                <p className="text-[14px] text-gray-600 pt-1.5" style={{ fontWeight: 400 }}>
                  문의 사항이 있으시면 Times TESOL 사무실로 연락해 주세요.
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-[12px] text-gray-400" style={{ fontWeight: 400 }}>
            © {new Date().getFullYear()} Times TESOL. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}