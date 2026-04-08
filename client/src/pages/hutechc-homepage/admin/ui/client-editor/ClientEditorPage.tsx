/* 원본: hutechc_hompage_real/app/(client-layout)/admin/ui/client-editor/page.tsx */
import { Link } from 'react-router';

export default function ClientEditorPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="text-lg font-bold">번역 의뢰자 에디터 UI 설정</div>
          <Link to="/hutechc-homepage/admin/ui" className="text-xs text-gray-600 hover:text-gray-900">
            ← 사용자 UI관리로 돌아가기
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-6 space-y-4 text-sm">
        <p className="text-gray-600">
          이 페이지에서는 번역 의뢰자가 사용하는 전체 의뢰/에디터 화면의 섹션 구성, 기본값, 강조 색상 등을
          설정할 수 있도록 확장할 예정입니다.
        </p>
        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-6 text-xs text-gray-500">
          TODO: 의뢰자 에디터 UI 옵션 (예: 카테고리 섹션 on/off, 가격 요약 위치, 추천 배너 노출 등)
        </div>
        <div className="pt-2 text-xs text-indigo-600">
          미리보기: <Link to="/hutechc-homepage/translate/client/request/all" className="underline">/translate/client/request/all</Link>
        </div>
      </main>
    </div>
  );
}
