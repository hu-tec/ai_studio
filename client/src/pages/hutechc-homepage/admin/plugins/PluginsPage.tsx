/* 원본: hutechc_hompage_real/app/(client-layout)/admin/plugins/page.tsx */
import { Link } from 'react-router';

const plugins = [
  { key: 'F', name: 'FAQ/문의', desc: 'FAQ, 문의/CS 플러그인' },
  { key: 'G', name: '가격정책', desc: '요금/할인/쿠폰 등 가격 정책 플러그인' },
  { key: 'H', name: '워크플로우', desc: '상태/승인/배정 등 운영 워크플로우 확장' },
  { key: 'I', name: '알림', desc: '이메일/문자/앱 알림 템플릿 및 발송' },
];

export default function PluginsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-[1440px] mx-auto px-6 h-16 flex items-center justify-between">
          <div>
            <div className="text-lg font-semibold text-gray-900">플러그인 관리</div>
            <div className="text-xs text-gray-500">플러그인 카탈로그/사이트 적용 (연동 전 UI)</div>
          </div>
          <Link to="/hutechc-homepage/admin/dashboard" className="text-sm text-gray-600 hover:underline">
            대시보드
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {plugins.map((p) => (
            <div key={p.key} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm text-gray-500">Plugin {p.key}</div>
                  <div className="text-xl font-bold text-gray-900 mt-1">{p.name}</div>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
                  연동 예정
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-3">{p.desc}</p>
              <div className="mt-4 text-xs text-gray-500">
                (향후 표시) routes / db_tables / admin_menus / events / billing_items
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
