/* 원본: hutechc_hompage_real/app/(client-layout)/admin/ui/exam-grader/page.tsx */
import { Link } from 'react-router';

export default function ExamGraderPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="text-lg font-bold">출제자 UI 설정 - 채점</div>
          <Link to="/hutechc-homepage/admin/ui" className="text-xs text-gray-600 hover:text-gray-900">
            ← 사용자 UI관리로 돌아가기
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-6 space-y-4 text-sm">
        <p className="text-gray-600">
          이 페이지에서는 채점자가 보는 리스트/상세 채점 화면의 구성, 필터, 상태 배지 등을 설정할 수 있도록
          추후에 확장할 예정입니다.
        </p>
        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-6 text-xs text-gray-500">
          TODO: 채점 UI 옵션 (예: 채점 상태 색상, 필터/검색 바, 점수 입력 컴포넌트 설정 등)
        </div>
        <div className="pt-2 text-xs text-indigo-600">
          미리보기: <Link to="/hutechc-homepage/mypage/exam/author/completed" className="underline">/mypage/exam/author/completed</Link>
        </div>
      </main>
    </div>
  );
}
