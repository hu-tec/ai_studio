import { useState } from "react";
import {
  ClipboardCheck,
  User,
  Star,
  MessageSquare,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Globe,
  Award,
  Zap,
  Calendar,
  Briefcase,
} from "lucide-react";
import { toast } from "sonner";

const ratingLabels = ["매우 부족", "부족", "보통", "우수", "매우 우수"];

function RatingRow({
  title,
  value,
  onRate,
}: {
  title: string;
  value: number;
  onRate: (v: number) => void;
}) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all hover:shadow-md">
      <div className="space-y-1">
        <h4 className="font-bold text-gray-900">{title}</h4>
        <p className="text-xs text-gray-500">
          1점에서 5점 사이로 평가해 주세요.
        </p>
      </div>
      <div className="flex items-center gap-1 md:gap-3">
        {[1, 2, 3, 4, 5].map((num) => (
          <button
            key={num}
            onClick={() => onRate(num)}
            className={`
              w-10 h-10 md:w-12 md:h-12 rounded-xl flex flex-col items-center justify-center transition-all border
              ${
                value === num
                  ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200"
                  : "bg-gray-50 text-gray-400 border-gray-100 hover:bg-gray-100"
              }
            `}
          >
            <span className="text-sm font-bold">{num}</span>
          </button>
        ))}
        <div className="ml-2 px-3 py-1 bg-gray-100 rounded-lg text-xs font-medium text-gray-600 min-w-16 text-center">
          {ratingLabels[value - 1]}
        </div>
      </div>
    </div>
  );
}

export function InterviewEvaluationView() {
  const [ratings, setRatings] = useState<Record<string, number>>({
    appearance: 3,
    attitude: 3,
    potential: 3,
    professionalism: 3,
    communication: 3,
  });

  const [skills] = useState({
    ai: ["Figma AI", "ChatGPT", "Midjourney"],
    lang: ["English (C1)", "Korean (Native)"],
    tool: ["Slack", "Notion", "Github"],
  });

  const handleRating = (key: string, value: number) => {
    setRatings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    toast.success("평가표가 저장되었습니다.");
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
            <ClipboardCheck className="text-blue-600" size={32} />
            면접 평가표
          </h2>
          <p className="mt-2 text-gray-500">
            면접관은 지원자의 역량을 객관적으로 평가해 주세요.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            className="px-6 py-2.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all shadow-sm"
          >
            중간 저장
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
          >
            평가 완료
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Section A: Applicant Overview */}
          <section className="bg-gray-900 p-8 rounded-3xl text-white shadow-xl flex flex-col md:flex-row items-center gap-8">
            <div className="w-24 h-24 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
              <User size={48} className="text-blue-400" />
            </div>
            <div className="flex-1 space-y-4 text-center md:text-left">
              <div>
                <h3 className="text-2xl font-bold">
                  홍길동{" "}
                  <span className="text-blue-400 text-lg font-normal ml-2">
                    지원자
                  </span>
                </h3>
                <p className="text-gray-400">TESOL / 일반 / 1급</p>
              </div>
              <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm">
                <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                  <Calendar size={14} className="text-blue-400" /> 2026-03-13
                </span>
                <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                  <Globe size={14} className="text-blue-400" /> 서울시 강남구
                </span>
                <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                  <Briefcase size={14} className="text-blue-400" /> 경력 5년
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="px-4 py-2 bg-green-500/20 text-green-400 rounded-xl border border-green-500/30 text-xs font-bold">
                1차 합격
              </div>
              <div className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-xl border border-blue-500/30 text-xs font-bold">
                화상 면접
              </div>
            </div>
          </section>

          {/* Section B: Evaluation Ratings */}
          <section className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Star className="text-blue-600" size={20} />
                항목별 상세 평가
              </h3>
              <span className="text-xs text-gray-400">
                총점: {Object.values(ratings).reduce((a, b) => a + b, 0)} / 25
              </span>
            </div>

            <RatingRow
              title="첫인상 및 복장 상태"
              value={ratings.appearance}
              onRate={(v) => handleRating("appearance", v)}
            />
            <RatingRow
              title="지원 동기 및 성실도"
              value={ratings.attitude}
              onRate={(v) => handleRating("attitude", v)}
            />
            <RatingRow
              title="강의 역량 및 전문성"
              value={ratings.professionalism}
              onRate={(v) => handleRating("professionalism", v)}
            />
            <RatingRow
              title="의사소통 및 센스"
              value={ratings.communication}
              onRate={(v) => handleRating("communication", v)}
            />
            <RatingRow
              title="조직 융화 및 잠재력"
              value={ratings.potential}
              onRate={(v) => handleRating("potential", v)}
            />
          </section>

          {/* Section C: Memo */}
          <section className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <MessageSquare className="text-blue-600" size={20} />
              종합 의견
            </h3>
            <textarea
              placeholder="지원자에 대한 전반적인 의견을 자유롭게 작성해 주세요."
              rows={5}
              className="w-full p-6 rounded-2xl border border-gray-100 bg-gray-50/50 focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all resize-none"
            />
          </section>
        </div>

        {/* Right Column: Skills & Decision */}
        <div className="space-y-8">
          {/* Skill Checklist */}
          <section className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Zap className="text-blue-600" size={20} />
              역량 체크리스트
            </h3>

            <div className="space-y-6">
              <div className="space-y-3">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  AI Tools
                </p>
                <div className="flex flex-wrap gap-2">
                  {skills.ai.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-lg border border-blue-100"
                    >
                      {skill}
                    </span>
                  ))}
                  <button className="px-3 py-1.5 bg-gray-50 text-gray-400 text-xs font-medium rounded-lg border border-dashed border-gray-200 hover:bg-gray-100 transition-colors">
                    + 추가
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Languages
                </p>
                <div className="flex flex-wrap gap-2">
                  {skills.lang.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1.5 bg-green-50 text-green-700 text-xs font-medium rounded-lg border border-green-100"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Collaboration Tools
                </p>
                <div className="flex flex-wrap gap-2">
                  {skills.tool.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1.5 bg-purple-50 text-purple-700 text-xs font-medium rounded-lg border border-purple-100"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Final Result Select */}
          <section className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6 sticky top-8">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Award className="text-blue-600" size={20} />
              최종 판정
            </h3>

            <div className="space-y-3">
              <button className="w-full flex items-center justify-between p-4 rounded-2xl border-2 border-green-500 bg-green-50 text-green-700 group transition-all">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="text-green-500" />
                  <span className="font-bold">합격</span>
                </div>
                <div className="w-4 h-4 rounded-full border-2 border-green-500 bg-green-500" />
              </button>

              <button className="w-full flex items-center justify-between p-4 rounded-2xl border border-gray-100 bg-gray-50 text-gray-500 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all">
                <div className="flex items-center gap-3">
                  <XCircle />
                  <span className="font-bold">불합격</span>
                </div>
                <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
              </button>

              <button className="w-full flex items-center justify-between p-4 rounded-2xl border border-gray-100 bg-gray-50 text-gray-500 hover:bg-orange-50 hover:border-orange-200 hover:text-orange-600 transition-all">
                <div className="flex items-center gap-3">
                  <HelpCircle />
                  <span className="font-bold">보류</span>
                </div>
                <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
              </button>
            </div>

            <div className="pt-4 border-t border-gray-50">
              <p className="text-xs text-center text-gray-400 leading-relaxed">
                판정 결과는 인사팀에 즉시 전달됩니다.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
