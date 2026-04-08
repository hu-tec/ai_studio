/* 원본: hutechc_hompage_real/app/(client-layout)/admin/ui/page.tsx */
import { Link } from 'react-router';
import { useLocation } from 'react-router';

const SECTIONS = [
  {
    id: 'exam-candidate',
    label: '시험 응시자 UI',
    href: '/admin/ui/exam-candidate',
    description: '시험 응시자가 보는 시험 화면(UI)의 공통 요소를 설정합니다.',
  },
  {
    id: 'exam-author',
    label: '출제자 UI - 출제',
    href: '/admin/ui/exam-author',
    description: '출제자가 시험을 출제하는 화면의 레이아웃과 옵션을 설정합니다.',
  },
  {
    id: 'exam-grader',
    label: '출제자 UI - 채점',
    href: '/admin/ui/exam-grader',
    description: '채점 UI(채점자 화면)의 구성을 설정합니다.',
  },
  {
    id: 'client-editor',
    label: '번역 의뢰자 에디터 UI',
    href: '/admin/ui/client-editor',
    description: '번역 의뢰자가 사용하는 에디터/폼 UI를 설정합니다.',
  },
  {
    id: 'translator-editor',
    label: '번역사 에디터 UI',
    href: '/admin/ui/translator-editor',
    description: '번역사 작업/에디터 화면 구성을 설정합니다.',
  },
  {
    id: 'editor',
    label: '에디터 UI',
    href: '/admin/ui/editor',
    description: '일반 에디터 UI의 구성과 옵션을 설정합니다.',
  },
];

export default function UiPage() {
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="text-2xl font-bold">사용자 UI 관리</div>
          <Link to="/hutechc-homepage/admin/dashboard"
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            ← 관리자 대시보드로 돌아가기
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 flex gap-6">
        {/* Sidebar */}
        <aside className="w-64 bg-white border border-gray-200 rounded-lg p-4 space-y-2 text-sm">
          <div className="text-xs font-semibold text-gray-500 mb-2">UI 카테고리</div>
          {SECTIONS.map((section) => {
            const isActive = pathname === section.href || pathname.startsWith(section.href + '/');
            return (
              <Link
                key={section.id}
                href={section.href}
                className={`block px-3 py-2 rounded-md mb-1 ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {section.label}
              </Link>
            );
          })}
        </aside>

        {/* Main description */}
        <section className="flex-1">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">사용자 UI 관리</h1>
            <p className="text-sm text-gray-600">
              시험/번역 서비스의 각 사용자 종류별 화면(UI)을 빠르게 미리보고, 추후에는 이곳에서 공통 컴포넌트와 레이아웃을 설정할 수 있습니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SECTIONS.map((section) => (
              <Link
                key={section.id}
                href={section.href}
                className="block bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow text-sm"
              >
                <div className="font-semibold text-gray-900 mb-1">{section.label}</div>
                <p className="text-xs text-gray-600">{section.description}</p>
                <p className="mt-3 text-xs text-indigo-600 font-semibold">해당 UI로 이동 →</p>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
