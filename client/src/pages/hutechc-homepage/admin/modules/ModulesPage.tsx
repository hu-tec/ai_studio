/* 원본: hutechc_hompage_real/app/(client-layout)/admin/modules/page.tsx */
import { Link } from 'react-router';

const modules = [
  { key: 'A', name: 'AI Writing Actions', desc: '작성/교정/요약 등 작성 계열 액션' },
  { key: 'B', name: 'AI Translation Actions', desc: '번역 계열 액션' },
  { key: 'C', name: 'Work Order (Lite)', desc: '의뢰/배정/상태 기반 운영 워크플로우' },
  { key: 'D', name: 'Site Contents', desc: '사이트 타입별 기본 콘텐츠/운영 기능' },
  { key: 'E', name: 'Platform Core', desc: '상품/권한/알림 등 공통 코어' },
];

export default function ModulesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-[1440px] mx-auto px-6 h-16 flex items-center justify-between">
          <div>
            <div className="text-lg font-semibold text-gray-900">모듈 관리</div>
            <div className="text-xs text-gray-500">모듈 카탈로그/정책/사이트 적용 (연동 전 UI)</div>
          </div>
          <Link to="/hutechc-homepage/admin/dashboard" className="text-sm text-gray-600 hover:underline">
            대시보드
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {modules.map((m) => (
            <div key={m.key} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm text-gray-500">Module {m.key}</div>
                  <div className="text-xl font-bold text-gray-900 mt-1">{m.name}</div>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
                  연동 예정
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-3">{m.desc}</p>
              <div className="mt-4 text-xs text-gray-500">
                (향후 표시) permissions / search doc_type / events / billing_items
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
