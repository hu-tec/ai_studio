/* 원본: hutechc_hompage_real/app/mypage/available/page.tsx */
import { Link } from 'react-router';
import type { ExamType } from '../../types/exam';

interface ExamCard {
  id: number;
  title: string;
  type: ExamType;
  description: string;
  category: string;
  level: string;
  instructor: string;
  duration: number;
  questionCount: number;
}

// TODO: 이후에 실제 관리자/시험 데이터와 연동
const mockExams: ExamCard[] = [
  {
    id: 999,
    title: 'test',
    type: '프롬프트',
    description: '프롬프트 시험 형식제출',
    category: '프롬프트',
    level: '2급',
    instructor: '테스트',
    duration: 5,
    questionCount: 1,
  },
  {
    id: 1,
    title: '시험명이 나오는 영역',
    type: '번역',
    description: 'A형 태국 여행에 대해 기획서를 작성해보시고.',
    category: '비즈니스 문서',
    level: '전문1급',
    instructor: '홍길동',
    duration: 60,
    questionCount: 1,
  },
  {
    id: 2,
    title: '시험명이 나오는 영역',
    type: '프롬프트',
    description: 'AI 시대의 교육 변화에 대해 논술하시오.',
    category: '일반 에세이',
    level: '2급',
    instructor: '김영희',
    duration: 90,
    questionCount: 1,
  },
  {
    id: 3,
    title: '시험명이 나오는 영역',
    type: '번역',
    description: '마케팅 전략 보고서를 번역하시오.',
    category: '비즈니스 문서',
    level: '전문1급',
    instructor: '이순신',
    duration: 120,
    questionCount: 2,
  },
  {
    id: 4,
    title: '시험명이 나오는 영역',
    type: '번역',
    description: '기술 문서 번역 시험',
    category: '기술 문서',
    level: '1급',
    instructor: '박민수',
    duration: 75,
    questionCount: 1,
  },
  {
    id: 5,
    title: '시험명이 나오는 영역',
    type: '프롬프트',
    description: '창의적인 글쓰기 능력 평가',
    category: '창의 글쓰기',
    level: '1급',
    instructor: '최지은',
    duration: 60,
    questionCount: 1,
  },
  {
    id: 6,
    title: '시험명이 나오는 영역',
    type: '번역',
    description: '뉴스 기사 번역 실력 측정',
    category: '뉴스/미디어',
    level: '2급',
    instructor: '정준호',
    duration: 50,
    questionCount: 1,
  },
  {
    id: 7,
    title: '오프라인 시험',
    type: '오프라인',
    description: '오프라인 시험장에서 진행하는 번역 자격증 시험',
    category: '오프라인 시험',
    level: '전문1급',
    instructor: '시험관',
    duration: 120,
    questionCount: 3,
  },
];

export default function AvailablePage() {
  const getExamLink = (exam: ExamCard) => {
    if (exam.type === '번역') {
      return `/mypage/exam/test?id=${exam.id}`;
    }

    if (exam.type === '오프라인') {
      return `/mypage/exam/test?id=${exam.id}&type=offline`;
    }

    // 임시: "test" 시험만 신규 프롬프트 시험 형태로 라우팅
    if (exam.id === 999) {
      return `/mypage/exam/prompt_test`;
    }

    return `/mypage/exam/prompt`;
  };

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <span>홈</span>
        <span>{'>'}</span>
        <span>마이페이지</span>
        <span>{'>'}</span>
        <span className="text-gray-900 font-semibold">시험응시</span>
      </div>

      {/* Page Title */}
      <h1 className="text-3xl font-bold mb-8 text-gray-900">시험응시</h1>

      {/* Exam Cards - Vertical Stack */}
      <div className="space-y-4">
        {mockExams.map((exam) => (
          <div
            key={exam.id}
            className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              {/* Left: Avatar + Info */}
              <div className="flex items-start gap-6 flex-1">
                <div className="w-20 h-20 rounded-lg bg-gray-200 overflow-hidden">
                  <img
                    src="https://via.placeholder.com/80"
                    alt="프로필"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-gray-500 mb-1">
                    <span className="text-gray-700">자격증</span>
                    <span className="ml-2 text-blue-600 font-semibold">{exam.level}</span>
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-2">{exam.title}</h3>
                  <div className="text-xs text-gray-500 mb-2">
                    <span className="text-gray-600">{exam.type}</span>
                    <span className="mx-2">·</span>
                    <span className="text-gray-600">{exam.category}</span>
                  </div>
                  <p className="text-sm text-gray-600">{exam.description}</p>
                </div>
              </div>

              {/* Right: Timer + Button */}
              <div className="flex flex-col items-end gap-3 flex-shrink-0">
                <Link to={getExamLink(exam)}>
                  <span className="inline-block px-4 py-1.5 rounded-md text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700">
                    시험보기
                  </span>
                </Link>
                <div className="text-right">
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center ml-auto">
                    <div className="text-blue-600 font-bold">5:00</div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">09:00 ~ 09:15</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
