import { useNavigate } from "react-router";
import { useExam } from "./exam-context";
import { getExamByType } from "./exam-data";
import { ChevronLeft, CheckCircle2, Circle } from "lucide-react";
import { motion } from "motion/react";
import logo from "figma:asset/64fabebe4c3543be23256b5d663a331523d0c13c.png";

export function WritingSection() {
  const { state, setSelectedTopic, setEssay } = useExam();
  const navigate = useNavigate();

  const exam = getExamByType(state.examType);
  const topics = exam.essayTopics;

  const wordCount = state.essay
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0).length;

  const handleSubmit = () => {
    navigate("/result");
  };

  return (
    <div className="min-h-screen bg-[#faf8f6]" style={{ fontFamily: "Pretendard, sans-serif" }}>
      {/* Top Bar */}
      <div className="sticky top-0 z-10 bg-[#1a1a2e] text-white shadow-md">
        <div className="max-w-[1200px] mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={logo} alt="Times Media" className="h-6 object-contain block" />
            <span className="text-white/20">|</span>
            <span className="text-[13px] text-[#e8a0a0] leading-none" style={{ fontWeight: 500 }}>
              Section 2 — Essay Writing
            </span>
          </div>
          <span className="text-[13px] text-white/50" style={{ fontWeight: 400 }}>
            {wordCount} 단어
          </span>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Instructions + Topic Selection */}
          <div className="space-y-6">
            {/* Instructions */}
            <motion.div
              className="bg-white shadow-sm border border-gray-100 p-7"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span
                className="text-[#8B1A2B] text-[12px] tracking-[0.2em] uppercase mb-2 block"
                style={{ fontWeight: 600 }}
              >
                Writing Instructions
              </span>
              <h2
                className="text-[#1a1a2e] text-[22px] mb-5"
                style={{ fontWeight: 800 }}
              >
                작성 안내
              </h2>
              <ul className="space-y-2.5">
                {[
                  "아래 두 주제 중 하나를 선택하세요.",
                  "조직된 문단 구조를 사용하여 에세이를 작성하세요.",
                  "최소 150단어 이상 작성을 권장합니다.",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span
                      className="text-[#8B1A2B] text-[14px] mt-0.5"
                      style={{ fontWeight: 700 }}
                    >
                      {i + 1}.
                    </span>
                    <span className="text-[14px] text-gray-600" style={{ fontWeight: 400 }}>
                      {item}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-5 p-4 bg-[#faf8f6] border border-gray-100">
                <p className="text-[14px] text-gray-600" style={{ fontWeight: 400 }}>
                  <span className="text-[#1a1a2e]" style={{ fontWeight: 700 }}>
                    평가 기준:
                  </span>{" "}
                  어휘 사용, 문법 사용, 세부 사항 표현 능력, 아이디어 연결 능력
                </p>
              </div>
            </motion.div>

            {/* Topic Selection */}
            <div className="space-y-4">
              {topics.map((topic, idx) => {
                const isSelected = state.selectedTopic === topic.id;
                return (
                  <motion.button
                    key={topic.id}
                    onClick={() => setSelectedTopic(topic.id)}
                    className={`w-full text-left p-7 border transition-all cursor-pointer ${
                      isSelected
                        ? "border-[#8B1A2B] bg-[#8B1A2B]/5 shadow-md"
                        : "border-gray-200 bg-white hover:border-[#8B1A2B]/30 shadow-sm"
                    }`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 + idx * 0.1 }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className={`px-3 py-1.5 text-[13px] ${
                          isSelected
                            ? "bg-[#8B1A2B] text-white"
                            : "bg-[#faf8f6] text-gray-500 border border-gray-100"
                        }`}
                        style={{ fontWeight: 600 }}
                      >
                        {topic.title}
                      </span>
                      {isSelected ? (
                        <CheckCircle2 className="w-5 h-5 text-[#8B1A2B]" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-300" />
                      )}
                    </div>
                    <p
                      className={`text-[14px] leading-relaxed ${
                        isSelected ? "text-[#1a1a2e]" : "text-gray-500"
                      }`}
                      style={{ fontWeight: isSelected ? 500 : 400 }}
                    >
                      {topic.prompt}
                    </p>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Essay Writing Area */}
          <div className="space-y-6">
            {state.selectedTopic ? (
              <motion.div
                className="bg-white shadow-sm border border-gray-100 p-7 lg:sticky lg:top-16 lg:self-start"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <span
                      className="text-[#8B1A2B] text-[12px] tracking-[0.15em] uppercase block mb-1"
                      style={{ fontWeight: 600 }}
                    >
                      Your Essay
                    </span>
                    <h3
                      className="text-[#1a1a2e] text-[18px]"
                      style={{ fontWeight: 700 }}
                    >
                      에세이 작성
                    </h3>
                  </div>
                  <span
                    className={`text-[13px] px-3 py-1.5 ${
                      wordCount >= 150
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}
                    style={{ fontWeight: 600 }}
                  >
                    {wordCount}/150+
                  </span>
                </div>
                <textarea
                  value={state.essay}
                  onChange={(e) => setEssay(e.target.value)}
                  placeholder="Write your essay here..."
                  rows={20}
                  className="w-full p-5 border border-gray-200 bg-[#faf8f6] focus:outline-none focus:ring-2 focus:ring-[#8B1A2B]/15 focus:border-[#8B1A2B]/30 resize-none transition-all text-[15px] text-[#333] leading-[1.8]"
                  style={{ fontWeight: 400 }}
                />
              </motion.div>
            ) : (
              <motion.div
                className="bg-white shadow-sm border border-gray-100 p-7 flex flex-col items-center justify-center text-center lg:sticky lg:top-16 lg:min-h-[400px]"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <Circle className="w-12 h-12 text-gray-200 mb-4" />
                <p className="text-[15px] text-gray-400" style={{ fontWeight: 500 }}>
                  좌측에서 주제를 선택하면
                </p>
                <p className="text-[15px] text-gray-400" style={{ fontWeight: 500 }}>
                  여기에 에세이를 작성할 수 있습니다.
                </p>
              </motion.div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pb-8 mt-6">
          <button
            onClick={() => navigate("/section1")}
            className="flex items-center gap-2 px-5 py-3 bg-white border border-gray-200 text-[#1a1a2e]/60 hover:bg-gray-50 transition-all cursor-pointer text-[14px]"
            style={{ fontWeight: 500 }}
          >
            <ChevronLeft className="w-4 h-4" />
            Reading으로 돌아가기
          </button>

          <button
            onClick={handleSubmit}
            disabled={!state.selectedTopic || !state.essay.trim()}
            className="px-8 py-3 bg-[#8B1A2B] hover:bg-[#6d1422] text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer text-[15px]"
            style={{ fontWeight: 700 }}
          >
            시험 제출하기
          </button>
        </div>
      </div>
    </div>
  );
}