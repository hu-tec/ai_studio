/* 원본: hutechc_hompage_real/app/(client-layout)/admin/sites/page.tsx */
import { Link } from 'react-router';
import { useState } from 'react';

type Tenant = {
  id: string;
  name: string;
  domain: string;
  siteType: string;
  status: 'active' | 'inactive';
  modules: string[];
  plugins: string[];
};

const MOCK_TENANTS: Tenant[] = [
  { id: '1', name: '메타시험', domain: 'meta-exam.hutechc.com', siteType: '시험', status: 'active', modules: ['A', 'D', 'E'], plugins: ['F', 'G'] },
  { id: '2', name: '번역 플랫폼', domain: 'translate.hutechc.com', siteType: '번역', status: 'active', modules: ['A', 'B', 'C', 'E'], plugins: ['F', 'G', 'H', 'I'] },
  { id: '3', name: '전시 가이드', domain: 'exhibition.hutechc.com', siteType: '전시/가이드', status: 'inactive', modules: ['D', 'E'], plugins: ['F'] },
];

function Badge({ children }: { children: string }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 border border-gray-200 text-xs">
      {children}
    </span>
  );
}

export default function SitesPage() {
  const [tenants] = useState<Tenant[]>(MOCK_TENANTS);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-[1440px] mx-auto px-6 h-16 flex items-center justify-between">
          <div>
            <div className="text-lg font-semibold text-gray-900">사이트(테넌트) 관리</div>
            <div className="text-xs text-gray-500">통합 플랫폼 필수 화면</div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/hutechc-homepage/admin/sites/new"
              className="px-4 py-2 rounded-lg bg-black text-white text-sm"
            >
              + 사이트 추가
            </Link>
            <Link to="/hutechc-homepage/admin/dashboard" className="text-sm text-gray-600 hover:underline">
              대시보드
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900">사이트 목록</h1>
          <p className="text-sm text-gray-600">
            필수 노출 항목: 사이트명/도메인/사이트타입/상태/활성모듈(A~E)/플러그인(F~I)
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">검색/필터(추후)</div>
            <div className="text-xs text-gray-500">총 {tenants.length}개</div>
          </div>

          {tenants.length === 0 ? (
            <div className="p-6 text-sm text-gray-600">
              아직 생성된 사이트가 없습니다.{' '}
              <Link to="/hutechc-homepage/admin/sites/new" className="underline">
                사이트 추가(마법사)
              </Link>
              에서 새 사이트를 생성하세요.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="text-left font-medium px-4 py-3">사이트</th>
                    <th className="text-left font-medium px-4 py-3">도메인</th>
                    <th className="text-left font-medium px-4 py-3">타입</th>
                    <th className="text-left font-medium px-4 py-3">상태</th>
                    <th className="text-left font-medium px-4 py-3">모듈</th>
                    <th className="text-left font-medium px-4 py-3">플러그인</th>
                  </tr>
                </thead>
                <tbody>
                  {tenants.map((t) => (
                    <tr key={t.id} className="border-t border-gray-200">
                      <td className="px-4 py-3 font-semibold text-gray-900">{t.name}</td>
                      <td className="px-4 py-3 text-gray-700">{t.domain}</td>
                      <td className="px-4 py-3 text-gray-700">{t.siteType}</td>
                      <td className="px-4 py-3">
                        <Badge>{t.status === 'active' ? '활성' : '비활성'}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {t.modules.length ? t.modules.map((m) => <Badge key={m}>{m}</Badge>) : <span className="text-gray-400">-</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {t.plugins.length ? t.plugins.map((p) => <Badge key={p}>{p}</Badge>) : <span className="text-gray-400">-</span>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
