/* 원본: hutechc_hompage_real/app/(client-layout)/admin/roles/page.tsx */
import { Link } from 'react-router';

export default function RolesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-[1440px] mx-auto px-6 h-16 flex items-center justify-between">
          <div>
            <div className="text-lg font-semibold text-gray-900">권한/역할(관리자)</div>
            <div className="text-xs text-gray-500">플랫폼 운영자 권한 템플릿 (연동 전 UI)</div>
          </div>
          <Link to="/hutechc-homepage/admin/dashboard" className="text-sm text-gray-600 hover:underline">
            대시보드
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900">역할 템플릿</h1>
          <p className="text-sm text-gray-600 mt-2">
            문서 기준으로는 모듈/플러그인 활성화에 따라 permissions가 붙고, 관리자 화면/기능 노출이
            결정됩니다. 지금은 UI만 먼저 고정해두는 페이지입니다.
          </p>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="font-semibold text-gray-900">Platform Admin</div>
              <div className="text-sm text-gray-600 mt-1">사이트 생성/모듈/플러그인/정책 관리</div>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="font-semibold text-gray-900">(향후) Tenant Admin</div>
              <div className="text-sm text-gray-600 mt-1">사이트 운영(메뉴/페이지/사용자/콘텐츠)</div>
            </div>
          </div>

          <div className="mt-6 text-xs text-gray-500">
            다음 단계: 권한 키(permissions) 네이밍 규칙 확정 → 모듈 Manifest에서 자동 등록 → UI 가드 적용
          </div>
        </div>
      </main>
    </div>
  );
}
