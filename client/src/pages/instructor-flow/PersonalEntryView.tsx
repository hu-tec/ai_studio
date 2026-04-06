import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Send,
  MapPin,
  Mail,
  Phone,
  Calendar,
  User,
  Briefcase,
  GraduationCap,
  Award,
  Languages,
} from "lucide-react";
import { toast } from "sonner";

const categories: Record<string, Record<string, string[]>> = {
  TESOL: {
    Educational: ["1급", "2급", "3급", "4급", "5급", "6급", "7급", "8급"],
    General: ["1급", "2급", "3급"],
    Professional: ["1급", "2급"],
  },
  Prompt: {
    Educational: ["1급", "2급", "3급", "4급", "5급", "6급", "7급", "8급"],
    General: ["1급", "2급", "3급"],
    Professional: ["1급", "2급"],
  },
  Translation: {
    Educational: ["1급", "2급", "3급", "4급", "5급", "6급", "7급", "8급"],
    General: ["1급", "2급", "3급"],
    Professional: ["1급", "2급"],
  },
  Ethics: {
    Educational: ["1급", "2급", "3급", "4급", "5급", "6급", "7급", "8급"],
    General: ["1급", "2급", "3급"],
    Professional: ["1급", "2급"],
  },
};

export function PersonalEntryView() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedCategory = watch("category");
  const selectedType = watch("type");

  const onSubmit = (data: unknown) => {
    setIsSubmitting(true);
    console.log(data);
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success("지원이 완료되었습니다.");
    }, 1500);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-200 pb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
            강사 채용 지원서
          </h2>
          <p className="mt-2 text-gray-500">
            AI 기술을 활용한 교육 및 통번역 서비스의 리더, 새로운 강사님을
            모십니다.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-blue-600 font-semibold bg-blue-50 px-4 py-2 rounded-full border border-blue-100">
          <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
          현재 채용 중
        </div>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        {/* Left Column: Basic Info */}
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-6">
              <User className="text-blue-600" size={20} />
              인적사항
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  성명
                </label>
                <input
                  {...register("name", { required: true })}
                  type="text"
                  placeholder="홍길동"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-gray-50/50"
                />
                {errors.name && (
                  <span className="text-xs text-red-500">
                    필수 항목입니다.
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  생년월일
                </label>
                <div className="relative">
                  <input
                    {...register("birthDate", { required: true })}
                    type="date"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-gray-50/50"
                  />
                  <Calendar
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                    size={18}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  연락처
                </label>
                <div className="relative">
                  <input
                    {...register("phone", { required: true })}
                    type="tel"
                    placeholder="010-0000-0000"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-gray-50/50"
                  />
                  <Phone
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                    size={18}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  이메일
                </label>
                <div className="relative">
                  <input
                    {...register("email", { required: true })}
                    type="email"
                    placeholder="example@email.com"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-gray-50/50"
                  />
                  <Mail
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                    size={18}
                  />
                </div>
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  주소
                </label>
                <div className="relative">
                  <input
                    {...register("address", { required: true })}
                    type="text"
                    placeholder="주소를 입력하세요"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-gray-50/50"
                  />
                  <MapPin
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                    size={18}
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-6">
              <Award className="text-blue-600" size={20} />
              지원 분야
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  대분류
                </label>
                <select
                  {...register("category", { required: true })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-gray-50/50"
                >
                  <option value="">선택하세요</option>
                  {Object.keys(categories).map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  중분류
                </label>
                <select
                  {...register("type", { required: true })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-gray-50/50"
                  disabled={!selectedCategory}
                >
                  <option value="">선택하세요</option>
                  <option value="Educational">교육용</option>
                  <option value="General">일반</option>
                  <option value="Professional">전문</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  소분류 (급수)
                </label>
                <select
                  {...register("grade", { required: true })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-gray-50/50"
                  disabled={!selectedType || !selectedCategory}
                >
                  <option value="">선택하세요</option>
                  {selectedCategory &&
                    selectedType &&
                    categories[selectedCategory]?.[selectedType]?.map(
                      (grade: string) => (
                        <option key={grade} value={grade}>
                          {grade}
                        </option>
                      )
                    )}
                </select>
              </div>
            </div>
          </section>

          <section className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-6">
              <GraduationCap className="text-blue-600" size={20} />
              학력 및 경력
            </h3>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  최종학력
                </label>
                <select
                  {...register("education")}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-gray-50/50"
                >
                  <option value="bachelor">학사 졸업</option>
                  <option value="master">석사 졸업</option>
                  <option value="doctor">박사 졸업</option>
                  <option value="other">기타</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  주요 경력사항
                </label>
                <textarea
                  {...register("experience")}
                  rows={4}
                  placeholder="관련 분야 경력 위주로 작성해 주세요."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-gray-50/50 resize-none"
                />
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Additional Info & Submit */}
        <div className="space-y-8">
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-6">
              <Languages className="text-blue-600" size={20} />
              어학 및 자격증
            </h3>

            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {["TOEIC", "TOEFL", "JLPT", "HSK", "OPIC", "IELTS"].map(
                  (lang) => (
                    <label
                      key={lang}
                      className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100 cursor-pointer hover:border-blue-200 transition-colors"
                    >
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <span className="text-sm text-gray-700">{lang}</span>
                    </label>
                  )
                )}
              </div>
              <input
                type="text"
                placeholder="기타 자격증 입력"
                className="w-full px-4 py-2 text-sm rounded-lg border border-gray-200 outline-none focus:border-blue-500 bg-gray-50/50"
              />
            </div>
          </section>

          <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-6">
              <Briefcase className="text-blue-600" size={20} />
              지원 경로
            </h3>

            <div className="space-y-3">
              {[
                "사람인/잡코리아",
                "링크드인",
                "지인 추천",
                "공식 홈페이지",
                "기타",
              ].map((path) => (
                <label
                  key={path}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <input
                    type="radio"
                    name="source"
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                    {path}
                  </span>
                </label>
              ))}
            </div>
          </section>

          <div className="sticky top-8 space-y-4">
            <div className="bg-blue-600 p-6 rounded-2xl shadow-lg shadow-blue-200 text-white">
              <h4 className="font-bold mb-2">제출 안내</h4>
              <p className="text-sm text-blue-50 opacity-90 leading-relaxed">
                작성하신 정보는 채용 목적으로만 사용되며, 허위 사실이 있을 경우
                채용이 취소될 수 있습니다.
              </p>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`
                  mt-6 w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all
                  ${
                    isSubmitting
                      ? "bg-white/20 cursor-not-allowed"
                      : "bg-white text-blue-600 hover:bg-blue-50 shadow-sm"
                  }
                `}
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Send size={18} />
                    지원하기
                  </>
                )}
              </button>
            </div>

            <div className="bg-gray-900 p-6 rounded-2xl text-white">
              <p className="text-xs text-gray-400 mb-1">문의처</p>
              <p className="text-sm font-medium">hr@aiedu.co.kr</p>
              <p className="text-xs text-gray-500 mt-4">
                &copy; 2026 AI Edu Co. Ltd.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
