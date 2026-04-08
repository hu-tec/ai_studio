/* 원본: hutechc_hompage_real/app/(client-layout)/admin/ui/exam-author/page.tsx */
import { Link } from 'react-router';
import { useExamUiConfig } from '../../../lib/examUiConfig';

export default function ExamAuthorPage() {
  const { config, update, reset } = useExamUiConfig('author');
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="text-lg font-bold">출제자 UI 설정 - 출제</div>
          <Link to="/hutechc-homepage/admin/ui" className="text-xs text-gray-600 hover:text-gray-900">
            ← 사용자 UI관리로 돌아가기
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-6 space-y-6 text-sm">
        {/* 시험 정보 (출제용) */}
        <section className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
          <h2 className="text-base font-semibold text-gray-900">시험 정보 (출제자 시점)</h2>
          <div className="grid md:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block mb-1 text-gray-600">시험 종류</label>
              <input
                className="w-full border border-gray-300 rounded-md px-2 py-1.5"
                value={config.examType}
                disabled
              />
              <p className="mt-1 text-[10px] text-gray-400">응시자 UI에서 설정한 시험 종류를 사용합니다.</p>
            </div>
            <div>
              <label className="block mb-1 text-gray-600">시험명-대</label>
              <input
                className="w-full border border-gray-300 rounded-md px-2 py-1.5"
                value={config.examNameMajor}
                onChange={(e) => update({ examNameMajor: e.target.value })}
              />
            </div>
            <div>
              <label className="block mb-1 text-gray-600">시험명-중</label>
              <input
                className="w-full border border-gray-300 rounded-md px-2 py-1.5"
                value={config.examNameMiddle}
                onChange={(e) => update({ examNameMiddle: e.target.value })}
              />
            </div>
            <div>
              <label className="block mb-1 text-gray-600">시험명-소</label>
              <input
                className="w-full border border-gray-300 rounded-md px-2 py-1.5"
                value={config.examNameMinor}
                onChange={(e) => update({ examNameMinor: e.target.value })}
              />
            </div>
          </div>
        </section>

        {/* 출제 목적 / 에디터 / 권한 */}
        <section className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
          <h2 className="text-base font-semibold text-gray-900">출제 화면 설정</h2>
          <div className="grid md:grid-cols-3 gap-3 text-xs mb-3">
            <div>
              <label className="block mb-1 text-gray-600">출제 목적</label>
              <input
                className="w-full border border-gray-300 rounded-md px-2 py-1.5"
                value={config.purpose}
                onChange={(e) => update({ purpose: e.target.value })}
                placeholder="예: 모의 시험 / 본 시험용 문제은행 구축"
              />
            </div>
            <div>
              <label className="block mb-1 text-gray-600">사용 에디터</label>
              <select
                className="w-full border border-gray-300 rounded-md px-2 py-1.5"
                value={config.editorType}
                onChange={(e) => update({ editorType: e.target.value as typeof config.editorType })}
              >
                <option value="에디터">에디터</option>
                <option value="영상 에디터">영상 에디터</option>
                <option value="코딩 에디터">코딩 에디터</option>
                <option value="번역 에디터">번역 에디터</option>
                <option value="문서 에디터">문서 에디터</option>
                <option value="프롬프트 에디터">프롬프트 에디터</option>
              </select>
            </div>
            <div>
              <label className="block mb-1 text-gray-600">출제자 권한</label>
              <input
                className="w-full border border-gray-300 rounded-md px-2 py-1.5"
                value={config.rolePermission}
                onChange={(e) => update({ rolePermission: e.target.value })}
                placeholder="예: 전문가=출제자 / 관리자 검수 필요 등"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block mb-1 text-gray-600">언어/지역</label>
              <input
                className="w-full border border-gray-300 rounded-md px-2 py-1.5"
                value={config.region}
                onChange={(e) => update({ region: e.target.value })}
                placeholder="예: 언어=한국어, 지역=서울"
              />
            </div>
            <div>
              <label className="block mb-1 text-gray-600">자격증 종류</label>
              <input
                className="w-full border border-gray-300 rounded-md px-2 py-1.5"
                value={config.certificateType}
                onChange={(e) => update({ certificateType: e.target.value })}
              />
            </div>
            <div>
              <label className="block mb-1 text-gray-600">금액 (원)</label>
              <input
                type="number"
                className="w-full border border-gray-300 rounded-md px-2 py-1.5"
                value={config.amount}
                onChange={(e) => update({ amount: Number(e.target.value) || 0 })}
              />
            </div>
          </div>
        </section>

        {/* 윤리시험/등급 */}
        <section className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
          <h2 className="text-base font-semibold text-gray-900">윤리시험 / 등급 분류</h2>
          <div className="grid md:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block mb-1 text-gray-600">윤리시험 공통</label>
              <input
                className="w-full border border-gray-300 rounded-md px-2 py-1.5"
                value={config.ethicsCommon}
                onChange={(e) => update({ ethicsCommon: e.target.value })}
                placeholder="예: 성인 / 고등학생 / 초등학생"
              />
            </div>
            <div>
              <label className="block mb-1 text-gray-600">등급 분류</label>
              <input
                className="w-full border border-gray-300 rounded-md px-2 py-1.5"
                value={config.gradeCategory}
                onChange={(e) => update({ gradeCategory: e.target.value })}
                placeholder="예: 전문 1급 / 일반 1급 / 교육급수 1급 등"
              />
            </div>
          </div>
        </section>

        <div className="flex items-center justify-between text-xs">
          <div className="text-indigo-600">
            미리보기:{' '}
            <Link to="/hutechc-homepage/mypage/exam/author" className="underline">
              /mypage/exam/author
            </Link>
          </div>
          <div className="space-x-2">
            <button
              type="button"
              onClick={() => reset()}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              기본값으로 초기화
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
