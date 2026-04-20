/* 원본: hutechc_hompage_real/app/page.tsx
   Next.js → React Router 변환 */
import { Link } from 'react-router';

export default function HutechcHomepagePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Link
            to="/hutechc-homepage/admin"
            className="px-3 py-1.5 rounded-md bg-black text-white text-h4 font-semibold"
          >
            관리자 대시보드
          </Link>
        </div>

        <h1 className="text-h1 text-gray-900 mb-1">통합 플랫폼</h1>
        <p className="text-h3 text-gray-600 mb-6">시험, 번역, 전시/가이드를 한 곳에서</p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-w-5xl mx-auto">
          <Link
            to="/hutechc-homepage/exam"
            className="block p-3 bg-white rounded-lg shadow hover:shadow-md transition-all"
          >
            <div className="text-3xl mb-1">📝</div>
            <h2 className="text-h2 text-gray-900 mb-0.5">시험</h2>
            <p className="text-meta text-gray-600">시험 응시 / 출제자 모드 선택</p>
          </Link>

          <Link
            to="/hutechc-homepage/translate"
            className="block p-3 bg-white rounded-lg shadow hover:shadow-md transition-all"
          >
            <div className="text-3xl mb-1">🌐</div>
            <h2 className="text-h2 text-gray-900 mb-0.5">번역 서비스</h2>
            <p className="text-meta text-gray-600">번역 의뢰 및 번역가 관리</p>
          </Link>

          <Link
            to="/hutechc-homepage/exhibition"
            className="block p-3 bg-white rounded-lg shadow hover:shadow-md transition-all"
          >
            <div className="text-3xl mb-1">🏛️</div>
            <h2 className="text-h2 text-gray-900 mb-0.5">전시 / 스마트 가이드</h2>
            <p className="text-meta text-gray-600">박물관·전시 도슨트 & 여행 가이드</p>
          </Link>

          <Link
            to="/hutechc-homepage/question-bank"
            className="block p-3 bg-white rounded-lg shadow hover:shadow-md transition-all"
          >
            <div className="text-3xl mb-1">📚</div>
            <h2 className="text-h2 text-gray-900 mb-0.5">문제은행</h2>
            <p className="text-meta text-gray-600">문제 관리 및 출제</p>
          </Link>

          <Link
            to="/hutechc-homepage/admin"
            className="block p-3 bg-white rounded-lg shadow hover:shadow-md transition-all"
          >
            <div className="text-3xl mb-1">⚙️</div>
            <h2 className="text-h2 text-gray-900 mb-0.5">관리자</h2>
            <p className="text-meta text-gray-600">시스템 및 서비스 관리</p>
          </Link>

          <Link
            to="/hutechc-homepage/payment-guide"
            className="block p-3 bg-white rounded-lg shadow hover:shadow-md transition-all"
          >
            <div className="text-3xl mb-1">💰</div>
            <h2 className="text-h2 text-gray-900 mb-0.5">결제 시스템 안내</h2>
            <p className="text-meta text-gray-600">번역 서비스 요금 산정 방식 안내</p>
          </Link>

          <Link
            to="/hutechc-homepage/expert"
            className="block p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg shadow hover:shadow-md transition-all text-white"
          >
            <div className="text-3xl mb-1">⭐</div>
            <h2 className="text-h2 mb-0.5">전문가 신청</h2>
            <p className="text-meta text-purple-100">번역 전문가로 등록하고 프로젝트에 참여하세요</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
