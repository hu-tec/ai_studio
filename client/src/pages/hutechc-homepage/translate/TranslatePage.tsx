/* 원본: hutechc_hompage_real/app/translate/page.tsx
   Next.js → React Router 변환 */
import { Link } from 'react-router';

export default function TranslatePage() {
  return (
    <div className="max-w-6xl mx-auto px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Meta 번역 서비스</h1>
        <p className="text-lg text-gray-600">원하는 서비스를 선택하세요</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <Link to="/hutechc-homepage/translate/request-new">
          <div className="block h-full p-8 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105 cursor-pointer border-2 border-transparent hover:border-blue-400">
            <div className="text-6xl mb-6 text-center">📝</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3 text-center">번역 의뢰</h2>
            <p className="text-gray-600 text-center mb-6">
              AI 번역부터 휴먼 검수까지, 원하는 대로 설정하고 신청하세요
            </p>
            <div className="flex items-center justify-center text-blue-600 font-semibold">
              의뢰 시작 →
            </div>
          </div>
        </Link>

        <Link to="/hutechc-homepage/translate/request-all">
          <div className="block h-full p-8 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105 cursor-pointer border-2 border-transparent hover:border-green-400">
            <div className="text-6xl mb-6 text-center">📦</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3 text-center">전체 의뢰 페이지</h2>
            <p className="text-gray-600 text-center mb-6">
              STEP 1 · STEP 2 모든 설정을 한 화면에서 입력하고 바로 의뢰합니다.
            </p>
            <div className="flex items-center justify-center text-green-600 font-semibold">
              원페이지 의뢰 시작 →
            </div>
          </div>
        </Link>

        <Link to="/hutechc-homepage/translate/translator-requests">
          <div className="block h-full p-8 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105 cursor-pointer border-2 border-transparent hover:border-purple-400">
            <div className="text-6xl mb-6 text-center">🌐</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3 text-center">번역가</h2>
            <p className="text-gray-600 text-center mb-6">
              신규 요청을 확인하고 번역 작업을 수행하세요
            </p>
            <div className="flex items-center justify-center text-purple-600 font-semibold">
              번역 작업 보기 →
            </div>
          </div>
        </Link>

        <Link to="/hutechc-homepage/translate/meta-new">
          <div className="block h-full p-8 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105 cursor-pointer border-2 border-transparent hover:border-orange-400">
            <div className="text-6xl mb-6 text-center">🔮</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3 text-center">메타번역</h2>
            <p className="text-gray-600 text-center mb-6">
              AI와 에디터를 활용하여 문서를 작성하고 번역합니다.
            </p>
            <div className="flex items-center justify-center text-orange-600 font-semibold">
              메타번역 시작 →
            </div>
          </div>
        </Link>

        <Link to="/hutechc-homepage/translate/prompt-translation">
          <div className="block h-full p-8 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105 cursor-pointer border-2 border-transparent hover:border-indigo-400">
            <div className="text-6xl mb-6 text-center">💬</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3 text-center">프롬프트 번역</h2>
            <p className="text-gray-600 text-center mb-6">
              STEP 1 · STEP 2 모든 설정을 한 화면에서 입력하고 바로 의뢰합니다.
            </p>
            <div className="flex items-center justify-center text-indigo-600 font-semibold">
              프롬프트 번역 시작 →
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
