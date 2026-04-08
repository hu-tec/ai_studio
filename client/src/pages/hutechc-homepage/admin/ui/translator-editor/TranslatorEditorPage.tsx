/* 원본: hutechc_hompage_real/app/(client-layout)/admin/ui/translator-editor/page.tsx */
import { Link } from 'react-router';

export default function TranslatorEditorPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="text-lg font-bold">번역사 에디터 UI 설정</div>
          <Link to="/hutechc-homepage/admin/ui" className="text-xs text-gray-600 hover:text-gray-900">
            ← 사용자 UI관리로 돌아가기
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-6 space-y-4 text-sm">
        <p className="text-gray-600">
          이 페이지에서는 번역사가 작업을 수행하는 화면(요청 상세, 에디터, 진행 바 등)의 구성을 추후 세부적으로
          설정할 수 있습니다.
        </p>
        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-6 text-xs text-gray-500">
          TODO: 번역사 에디터 UI 옵션 (예: 작업 카드 레이아웃, 에디터 폭, 검수 상태 표시 방식 등)
        </div>
        <div className="pt-2 text-xs text-indigo-600">
          미리보기: <Link to="/hutechc-homepage/translate/translator/working" className="underline">/translate/translator/working</Link>
        </div>
      </main>
    </div>
  );
}
