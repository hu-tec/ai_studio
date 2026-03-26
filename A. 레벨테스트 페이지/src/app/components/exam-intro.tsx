import { useState } from "react";
import { useNavigate } from "react-router";
import { useExam } from "./exam-context";
import { examTypes } from "./exam-data";
import { Clock, FileText, AlertCircle } from "lucide-react";
import { motion } from "motion/react";
import logo from "figma:asset/64fabebe4c3543be23256b5d663a331523d0c13c.png";

export function ExamIntro() {
  const { state, setName, setProgram, setDate, setExamType, startExam } = useExam();
  const navigate = useNavigate();
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  const handleStart = () => {
    const newErrors: Record<string, boolean> = {};
    if (!state.name.trim()) newErrors.name = true;
    if (!state.program.trim()) newErrors.program = true;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const randomType = examTypes[Math.floor(Math.random() * examTypes.length)];
    setExamType(randomType.id);
    startExam();
    navigate("/section1");
  };

  return (
    <div className="min-h-screen bg-[#faf8f6] flex items-center justify-center p-6" style={{ fontFamily: "Pretendard, sans-serif" }}>
      <div className="w-full max-w-[960px]">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <img src={logo} alt="Times Media" className="h-16 object-contain mb-5 mx-auto block" />
          <span
            className="text-[#8B1A2B] text-[12px] tracking-[0.2em] uppercase mb-3 block"
            style={{ fontWeight: 600 }}
          >
            Placement Test
          </span>
          <h1
            className="text-[#1a1a2e] text-[34px] mb-2 tracking-tight"
            style={{ fontWeight: 800 }}
          >
            Times TESOL
          </h1>
          <p
            className="text-[#1a1a2e]/50 text-[14px]"
            style={{ fontWeight: 400 }}
          >
            입학 레벨테스트
          </p>
          <div className="mt-5 mx-auto w-16 h-[2px] bg-[#8B1A2B]/30" />
        </motion.div>

        {/* Two Column: Exam Info + Student Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
          {/* Exam Info */}
          <motion.div
            className="bg-white shadow-sm border border-gray-100 p-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <span
              className="text-[#8B1A2B] text-[12px] tracking-[0.2em] uppercase mb-2 block"
              style={{ fontWeight: 600 }}
            >
              Exam Overview
            </span>
            <h2
              className="text-[#1a1a2e] text-[22px] mb-5"
              style={{ fontWeight: 800 }}
            >
              시험 안내
            </h2>

            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-start gap-3 p-4 bg-[#faf8f6] border border-gray-100">
                <div className="w-10 h-10 rounded-full bg-[#8B1A2B] flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-[15px] text-[#1a1a2e]" style={{ fontWeight: 600 }}>
                    Section 1
                  </p>
                  <p className="text-[11px] text-[#8B1A2B] tracking-[0.1em] uppercase" style={{ fontWeight: 600 }}>
                    Reading Comprehension
                  </p>
                  <p className="text-[14px] text-gray-500 mt-1" style={{ fontWeight: 400 }}>
                    객관식 10문제
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-[#faf8f6] border border-gray-100">
                <div className="w-10 h-10 rounded-full bg-[#8B1A2B] flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-[15px] text-[#1a1a2e]" style={{ fontWeight: 600 }}>
                    Section 2
                  </p>
                  <p className="text-[11px] text-[#8B1A2B] tracking-[0.1em] uppercase" style={{ fontWeight: 600 }}>
                    Essay Writing
                  </p>
                  <p className="text-[14px] text-gray-500 mt-1" style={{ fontWeight: 400 }}>
                    주제 1개 선택 후 에세이 작성
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-[#faf8f6] border border-gray-100">
                <div className="w-10 h-10 rounded-full bg-[#1a1a2e] flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-[15px] text-[#1a1a2e]" style={{ fontWeight: 600 }}>
                    시간 제한 없음
                  </p>
                  <p className="text-[14px] text-gray-500 mt-1" style={{ fontWeight: 400 }}>
                    차분히 문제를 읽고 답변해 주세요.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Student Info */}
          <motion.div
            className="bg-white shadow-sm border border-gray-100 p-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <span
              className="text-[#8B1A2B] text-[12px] tracking-[0.2em] uppercase mb-2 block"
              style={{ fontWeight: 600 }}
            >
              Applicant Information
            </span>
            <h2
              className="text-[#1a1a2e] text-[22px] mb-6"
              style={{ fontWeight: 800 }}
            >
              응시자 정보
            </h2>

            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label
                    className="block text-[14px] text-[#1a1a2e]/60 mb-1.5"
                    style={{ fontWeight: 500 }}
                  >
                    이름 (Full Name) <span className="text-[#8B1A2B]">*</span>
                  </label>
                  <input
                    type="text"
                    value={state.name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setErrors((prev) => ({ ...prev, name: false }));
                    }}
                    placeholder="Enter your full name"
                    className={`w-full px-4 py-3 border text-[15px] ${
                      errors.name
                        ? "border-red-400 bg-red-50"
                        : "border-gray-200 bg-[#faf8f6]"
                    } focus:outline-none focus:ring-2 focus:ring-[#8B1A2B]/20 focus:border-[#8B1A2B]/40 transition-all`}
                    style={{ fontWeight: 400 }}
                  />
                  {errors.name && (
                    <p className="text-[#8B1A2B] text-[13px] mt-1.5 flex items-center gap-1" style={{ fontWeight: 500 }}>
                      <AlertCircle className="w-3.5 h-3.5" /> 이름을 입력해주세요
                    </p>
                  )}
                </div>

                <div>
                  <label
                    className="block text-[14px] text-[#1a1a2e]/60 mb-1.5"
                    style={{ fontWeight: 500 }}
                  >
                    프로그램 (Program) <span className="text-[#8B1A2B]">*</span>
                  </label>
                  <input
                    type="text"
                    value={state.program}
                    onChange={(e) => {
                      setProgram(e.target.value);
                      setErrors((prev) => ({ ...prev, program: false }));
                    }}
                    placeholder="e.g., TESOL Certificate Program"
                    className={`w-full px-4 py-3 border text-[15px] ${
                      errors.program
                        ? "border-red-400 bg-red-50"
                        : "border-gray-200 bg-[#faf8f6]"
                    } focus:outline-none focus:ring-2 focus:ring-[#8B1A2B]/20 focus:border-[#8B1A2B]/40 transition-all`}
                    style={{ fontWeight: 400 }}
                  />
                  {errors.program && (
                    <p className="text-[#8B1A2B] text-[13px] mt-1.5 flex items-center gap-1" style={{ fontWeight: 500 }}>
                      <AlertCircle className="w-3.5 h-3.5" /> 프로그램을 입력해주세요
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label
                  className="block text-[14px] text-[#1a1a2e]/60 mb-1.5"
                  style={{ fontWeight: 500 }}
                >
                  시험 날짜 (Date)
                </label>
                <input
                  type="date"
                  value={state.date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 bg-[#faf8f6] focus:outline-none focus:ring-2 focus:ring-[#8B1A2B]/20 focus:border-[#8B1A2B]/40 transition-all text-[15px]"
                  style={{ fontWeight: 400 }}
                />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Start Button */}
        <motion.button
          onClick={handleStart}
          className="w-full py-4 bg-[#8B1A2B] hover:bg-[#6d1422] text-white transition-colors cursor-pointer text-[15px]"
          style={{ fontWeight: 700 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          시험 시작하기
        </motion.button>

        <p className="text-center text-[12px] text-[#1a1a2e]/30 mt-5" style={{ fontWeight: 400 }}>
          © {new Date().getFullYear()} Times TESOL. All rights reserved.
        </p>
      </div>
    </div>
  );
}