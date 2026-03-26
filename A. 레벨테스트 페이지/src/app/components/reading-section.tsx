import { useState } from "react";
import { useNavigate } from "react-router";
import { useExam } from "./exam-context";
import { getExamByType } from "./exam-data";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Circle,
} from "lucide-react";
import { motion } from "motion/react";
import logo from "figma:asset/64fabebe4c3543be23256b5d663a331523d0c13c.png";

export function ReadingSection() {
  const { state, setAnswer } = useExam();
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const exam = getExamByType(state.examType);
  const questions = exam.readingQuestions;
  const question = questions[currentQuestion];

  const text1MaxId = parseInt(exam.text1Range.split("–")[1]);
  const isText1 = question.id <= text1MaxId;
  const passage = isText1 ? exam.text1Passage : exam.text2Passage;
  const passageTitle = isText1 ? exam.text1Title : exam.text2Title;
  const passageRange = isText1 ? exam.text1Range : exam.text2Range;

  const answeredCount = Object.keys(state.answers).length;
  const progress = (answeredCount / questions.length) * 100;

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleFinishSection = () => {
    navigate("/section2");
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
              Section 1 — Reading Comprehension
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[13px] text-white/50" style={{ fontWeight: 400 }}>
              {answeredCount}/{questions.length} 답변 완료
            </span>
            <div className="w-32 h-1.5 bg-white/10 overflow-hidden">
              <div
                className="h-full bg-[#e8a0a0] transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Passage */}
          <motion.div
            className="bg-white shadow-sm border border-gray-100 p-7 lg:sticky lg:top-16 lg:self-start lg:max-h-[calc(100vh-5rem)] lg:overflow-y-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <span
                className="px-3 py-1.5 bg-[#8B1A2B] text-white text-[13px]"
                style={{ fontWeight: 600 }}
              >
                {passageTitle}
              </span>
              <span className="text-[13px] text-gray-400" style={{ fontWeight: 400 }}>
                Questions {passageRange}
              </span>
            </div>
            <div className="w-full h-[2px] bg-gray-100 mb-5" />
            <p className="text-[15px] text-[#333] leading-[1.8] whitespace-pre-line" style={{ fontWeight: 400 }}>
              {passage}
            </p>
          </motion.div>

          {/* Question */}
          <div className="space-y-5">
            {/* Question Navigation Dots */}
            <motion.div
              className="bg-white shadow-sm border border-gray-100 p-5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <p
                className="text-[12px] text-[#8B1A2B] tracking-[0.15em] uppercase mb-3"
                style={{ fontWeight: 600 }}
              >
                Question Navigation
              </p>
              <div className="flex flex-wrap gap-2">
                {questions.map((q, idx) => (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQuestion(idx)}
                    className={`w-9 h-9 flex items-center justify-center text-[13px] transition-all cursor-pointer ${
                      idx === currentQuestion
                        ? "bg-[#8B1A2B] text-white shadow-md"
                        : state.answers[q.id]
                        ? "bg-[#8B1A2B]/10 text-[#8B1A2B] border border-[#8B1A2B]/20"
                        : "bg-[#faf8f6] text-gray-400 hover:bg-gray-100 border border-gray-200"
                    }`}
                    style={{ fontWeight: 600 }}
                  >
                    {q.id}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Current Question */}
            <motion.div
              className="bg-white shadow-sm border border-gray-100 p-7"
              key={question.id}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center gap-3 mb-5">
                <span
                  className="w-9 h-9 bg-[#1a1a2e] text-white flex items-center justify-center text-[13px]"
                  style={{ fontWeight: 700 }}
                >
                  {question.id}
                </span>
                <span className="text-[13px] text-gray-400" style={{ fontWeight: 400 }}>
                  of {questions.length}
                </span>
              </div>

              <p className="text-[15px] text-[#1a1a2e] mb-6 leading-relaxed" style={{ fontWeight: 500 }}>
                {question.text}
              </p>

              <div className="space-y-2.5">
                {question.options.map((option) => {
                  const isSelected =
                    state.answers[question.id] === option.label;
                  return (
                    <button
                      key={option.label}
                      onClick={() => setAnswer(question.id, option.label)}
                      className={`w-full text-left p-4 border transition-all flex items-center gap-3 cursor-pointer ${
                        isSelected
                          ? "border-[#8B1A2B] bg-[#8B1A2B]/5"
                          : "border-gray-200 hover:border-[#8B1A2B]/30 bg-[#faf8f6] hover:bg-[#8B1A2B]/3"
                      }`}
                    >
                      {isSelected ? (
                        <CheckCircle2 className="w-5 h-5 text-[#8B1A2B] shrink-0" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-300 shrink-0" />
                      )}
                      <span
                        className={`text-[14px] ${
                          isSelected ? "text-[#1a1a2e]" : "text-gray-600"
                        }`}
                        style={{ fontWeight: isSelected ? 600 : 400 }}
                      >
                        <span className="inline-block w-7" style={{ fontWeight: 600 }}>
                          ({option.label})
                        </span>{" "}
                        {option.value}
                      </span>
                    </button>
                  );
                })}
              </div>
            </motion.div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={handlePrev}
                disabled={currentQuestion === 0}
                className="flex items-center gap-2 px-5 py-3 bg-white border border-gray-200 text-[#1a1a2e]/60 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer text-[14px]"
                style={{ fontWeight: 500 }}
              >
                <ChevronLeft className="w-4 h-4" />
                이전
              </button>

              {currentQuestion === questions.length - 1 ? (
                <button
                  onClick={handleFinishSection}
                  className="flex items-center gap-2 px-6 py-3 bg-[#8B1A2B] hover:bg-[#6d1422] text-white transition-all cursor-pointer text-[14px]"
                  style={{ fontWeight: 700 }}
                >
                  Section 2로 이동
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-5 py-3 bg-[#8B1A2B] hover:bg-[#6d1422] text-white transition-all cursor-pointer text-[14px]"
                  style={{ fontWeight: 600 }}
                >
                  다음
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}