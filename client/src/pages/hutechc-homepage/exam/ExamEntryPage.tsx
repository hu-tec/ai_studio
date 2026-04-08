/* 원본: hutechc_hompage_real/app/exam/page.tsx
   Next.js → React Router 변환 */
import { Link } from 'react-router';

export default function ExamEntryPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-6">
      <h1 className="text-3xl font-bold mb-2 text-gray-900">시험</h1>
      <p className="text-sm text-gray-600 mb-8">수험자 / 출제자 역할을 선택하세요.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link to="/hutechc-homepage/mypage/available" className="block">
          <div className="h-full bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow cursor-pointer flex flex-col justify-between">
            <div>
              <div className="text-4xl mb-3">🎓</div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">시험 응시</h2>
              <p className="text-sm text-gray-600 mb-4">
                공개된 시험을 확인하고 접수 및 응시합니다.
              </p>
            </div>
            <div className="mt-2 text-sm font-semibold text-blue-600 flex items-center gap-1">
              <span>시험 응시 화면으로 이동</span>
              <span>→</span>
            </div>
          </div>
        </Link>

        <Link to="/hutechc-homepage/mypage/exam-author" className="block">
          <div className="h-full bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow cursor-pointer flex flex-col justify-between">
            <div>
              <div className="text-4xl mb-3">✏️</div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">출제자</h2>
              <p className="text-sm text-gray-600 mb-4">
                관리자에게 배정된 시험을 확인하고 문제를 출제합니다.
              </p>
            </div>
            <div className="mt-2 text-sm font-semibold text-blue-600 flex items-center gap-1">
              <span>출제자 대시보드로 이동</span>
              <span>→</span>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
