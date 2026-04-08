/* 원본: hutechc_hompage_real/app/translate/translator/available/page.tsx */
const availableRequests = [
  {
    id: 1,
    title: '기술 문서 번역',
    language: '한국어 → 영어',
    field: '기술/IT',
    wordCount: 3200,
    deadline: '2024-12-10',
    price: 480000,
    urgent: true,
  },
  {
    id: 2,
    title: '법률 계약서 번역',
    language: '영어 → 한국어',
    field: '법률',
    wordCount: 1800,
    deadline: '2024-12-15',
    price: 360000,
    urgent: false,
  },
];

export default function AvailablePage() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">신규 번역 요청</h1>
        <p className="text-gray-600">내 전문 분야에 맞는 번역 요청을 찾아보세요</p>
      </div>

      {/* 필터 */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">언어 조합</label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-md">
              <option>전체</option>
              <option>한국어 → 영어</option>
              <option>영어 → 한국어</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">전문 분야</label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-md">
              <option>전체</option>
              <option>기술/IT</option>
              <option>법률</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">분량</label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-md">
              <option>전체</option>
              <option>1000 단어 이하</option>
              <option>1000-5000 단어</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">긴급</label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-md">
              <option>전체</option>
              <option>긴급 요청만</option>
            </select>
          </div>
        </div>
      </div>

      {/* 요청 목록 */}
      <div className="space-y-4">
        {availableRequests.map((request) => (
          <div key={request.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-gray-900">{request.title}</h3>
                  {request.urgent && (
                    <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                      긴급
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600">{request.language}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-purple-600">₩{request.price.toLocaleString()}</div>
                <div className="text-xs text-gray-500">견적 금액</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4 pb-4 border-b border-gray-200">
              <div>
                <div className="text-xs text-gray-600 mb-1">전문 분야</div>
                <div className="font-semibold">{request.field}</div>
              </div>
              <div>
                <div className="text-xs text-gray-600 mb-1">분량</div>
                <div className="font-semibold">{request.wordCount.toLocaleString()} 단어</div>
              </div>
              <div>
                <div className="text-xs text-gray-600 mb-1">마감일</div>
                <div className="font-semibold">{request.deadline}</div>
              </div>
            </div>

            <div className="flex gap-3">
              <button className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-md font-semibold hover:bg-purple-700 transition-colors">
                지원하기
              </button>
              <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md font-semibold hover:bg-gray-50 transition-colors">
                상세보기
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
