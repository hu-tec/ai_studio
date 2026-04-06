import {
  BookOpen,
  Sparkles,
  Globe,
  ShieldCheck,
  CheckCircle2,
  Layers,
  Star,
  ChevronRight,
  TrendingUp,
  Cpu,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface CurriculumLevel {
  type: string;
  range: string;
  content: string;
}

interface CurriculumItem {
  category: string;
  icon: LucideIcon;
  color: string;
  description: string;
  levels: CurriculumLevel[];
}

const curriculumData: CurriculumItem[] = [
  {
    category: "TESOL",
    icon: Globe,
    color: "blue",
    description: "AI 기반 영어 교육 전문가 양성 과정",
    levels: [
      {
        type: "교육용",
        range: "1급 ~ 8급",
        content:
          "AI 보조 도구를 활용한 기초 교수법 및 교실 운영 실습",
      },
      {
        type: "일반",
        range: "1급 ~ 3급",
        content:
          "비즈니스 영어 및 성인 대상 특화 교수법 및 커뮤니케이션",
      },
      {
        type: "전문",
        range: "1급 ~ 2급",
        content:
          "고급 TESOL 이론 및 AI 기술 통합 영어 교육 전략 개발",
      },
    ],
  },
  {
    category: "프롬프트",
    icon: Sparkles,
    color: "purple",
    description: "LLM 활용 및 프롬프트 엔지니어링 실무",
    levels: [
      {
        type: "교육용",
        range: "1급 ~ 8급",
        content:
          "초중등 교육 현장에서의 AI 리터러시 및 프롬프트 기본 활용",
      },
      {
        type: "일반",
        range: "1급 ~ 3급",
        content:
          "사무 업무 효율화 및 문서 작성을 위한 중급 프롬프트 기술",
      },
      {
        type: "전문",
        range: "1급 ~ 2급",
        content:
          "복합 에이전트 구축 및 도메인 특화 고급 프롬프트 설계",
      },
    ],
  },
  {
    category: "번역",
    icon: Layers,
    color: "orange",
    description: "기계 번역 사후 편집 및 전문 번역 역량",
    levels: [
      {
        type: "교육용",
        range: "1급 ~ 8급",
        content: "번역기 원리 이해 및 기초 번역 에러 분석 및 수정",
      },
      {
        type: "일반",
        range: "1급 ~ 3급",
        content: "분야별 실무 번역 및 CAT Tool 활용 능력 배양",
      },
      {
        type: "전문",
        range: "1급 ~ 2급",
        content:
          "기술/의료/법률 등 전문 분야 심화 번역 및 품질 관리",
      },
    ],
  },
  {
    category: "윤리",
    icon: ShieldCheck,
    color: "emerald",
    description: "AI 기술 윤리 및 저작권 준수 가이드",
    levels: [
      {
        type: "교육용",
        range: "1급 ~ 8급",
        content: "디지털 시민 의식 및 AI 활용의 기초 윤리 수칙",
      },
      {
        type: "일반",
        range: "1급 ~ 3급",
        content:
          "저작권법 이해 및 데이터 프라이버시 보호 실무 가이드",
      },
      {
        type: "전문",
        range: "1급 ~ 2급",
        content:
          "AI 거버넌스 및 윤리적 알고리즘 설계 및 정책 대응",
      },
    ],
  },
];

// Color mappings for dynamic Tailwind classes
const colorMap: Record<string, { bg50: string; bg600: string; text700: string; border100: string; shadow200: string }> = {
  blue: {
    bg50: "bg-blue-50",
    bg600: "bg-blue-600",
    text700: "text-blue-700",
    border100: "border-blue-100/50",
    shadow200: "shadow-blue-200",
  },
  purple: {
    bg50: "bg-purple-50",
    bg600: "bg-purple-600",
    text700: "text-purple-700",
    border100: "border-purple-100/50",
    shadow200: "shadow-purple-200",
  },
  orange: {
    bg50: "bg-orange-50",
    bg600: "bg-orange-600",
    text700: "text-orange-700",
    border100: "border-orange-100/50",
    shadow200: "shadow-orange-200",
  },
  emerald: {
    bg50: "bg-emerald-50",
    bg600: "bg-emerald-600",
    text700: "text-emerald-700",
    border100: "border-emerald-100/50",
    shadow200: "shadow-emerald-200",
  },
};

export function CurriculumDescriptionView() {
  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-200 pb-10">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
            <BookOpen className="text-blue-600" size={32} />
            교육 과정 커리큘럼
          </h2>
          <p className="mt-2 text-gray-500">
            AI 기술이 융합된 4대 핵심 분야의 체계적인 교육 과정을 소개합니다.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400 font-medium">
          <TrendingUp size={16} />
          2026년 상반기 개편 완료
        </div>
      </div>

      {/* Grid of Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {curriculumData.map((item) => {
          const colors = colorMap[item.color] ?? colorMap.blue;
          return (
            <div
              key={item.category}
              className="group flex flex-col bg-white rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-blue-50/50 transition-all duration-500 overflow-hidden"
            >
              <div
                className={`p-8 ${colors.bg50} flex items-center gap-6 border-b ${colors.border100} transition-colors group-hover:bg-white`}
              >
                <div
                  className={`w-16 h-16 rounded-2xl ${colors.bg600} text-white flex items-center justify-center shadow-lg ${colors.shadow200} transition-transform group-hover:scale-110`}
                >
                  <item.icon size={32} />
                </div>
                <div className="flex-1 space-y-1">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {item.category}
                  </h3>
                  <p className="text-sm font-medium text-gray-500">
                    {item.description}
                  </p>
                </div>
              </div>

              <div className="p-8 space-y-6">
                {item.levels.map((level, idx) => (
                  <div
                    key={idx}
                    className="relative pl-6 space-y-2 border-l-2 border-gray-100 group-hover:border-blue-100 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-3 py-1 ${colors.bg50} ${colors.text700} text-xs font-bold rounded-full`}
                        >
                          {level.type}
                        </span>
                        <span className="text-sm font-bold text-gray-900">
                          {level.range}
                        </span>
                      </div>
                      <ChevronRight
                        size={16}
                        className="text-gray-300 group-hover:text-blue-400 transition-colors"
                      />
                    </div>
                    <p className="text-sm text-gray-500 leading-relaxed group-hover:text-gray-600">
                      {level.content}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-auto p-6 bg-gray-50/50 border-t border-gray-50">
                <button className="w-full flex items-center justify-center gap-2 text-sm font-bold text-gray-400 hover:text-blue-600 transition-colors">
                  상세 커리큘럼 보기
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Additional Info Section */}
      <div className="bg-gray-900 rounded-[2.5rem] p-10 md:p-16 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 blur-[100px] -mr-32 -mt-32 rounded-full" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/20 blur-[100px] -ml-32 -mb-32 rounded-full" />

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-full text-xs font-bold border border-blue-500/30">
              <Sparkles size={14} />
              AI-Powered Education
            </div>
            <h3 className="text-4xl font-bold leading-tight">
              미래를 선도하는
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                AI 교육 생태계
              </span>
            </h3>
            <p className="text-gray-400 leading-relaxed text-lg">
              단순한 기술 전달을 넘어, AI와 인간이 공존하며 시너지를 내는 최상의
              커리큘럼을 제공합니다. 각 등급별 체계적인 역량 로드맵을 통해 최고의
              강사진으로 성장하세요.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="text-blue-500" size={18} />
                <span className="text-sm font-medium">검증된 AI 도구 활용</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="text-blue-500" size={18} />
                <span className="text-sm font-medium">실전 중심 실습 환경</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="text-blue-500" size={18} />
                <span className="text-sm font-medium">글로벌 표준 준수</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-sm space-y-4">
              <Cpu className="text-blue-400" size={32} />
              <h4 className="font-bold text-xl">LMS 통합</h4>
              <p className="text-xs text-gray-500">
                자체 학습 관리 시스템을 통한 데이터 기반 성과 추적
              </p>
            </div>
            <div className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-sm space-y-4 mt-8">
              <Star className="text-yellow-400" size={32} />
              <h4 className="font-bold text-xl">인증서 발급</h4>
              <p className="text-xs text-gray-500">
                전 과정 이수 시 공신력 있는 급수별 자격증 발급
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
