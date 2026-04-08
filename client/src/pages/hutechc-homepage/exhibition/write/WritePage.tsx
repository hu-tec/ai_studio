/* 원본: hutechc_hompage_real/app/(client-layout)/exhibition/write/page.tsx */
export default function WritePage() {
  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 text-xs md:text-sm">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
        <div className="space-y-1">
          <p className="text-[11px] text-gray-500">홈 &gt; 도슨트 메이커 &gt; 작성하기</p>
          <h1 className="text-xl md:text-2xl font-semibold text-gray-900">작성하기</h1>
        </div>
        <div className="flex gap-2 text-[11px] text-gray-500">
          <button>알림</button>
          <button>작성 가이드</button>
        </div>
      </header>

      {/* Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 lg:gap-4 min-h-[480px]">
        {/* 요청 내용 */}
        <section className="bg-white border rounded-lg p-3 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold text-gray-900 text-sm">요청 내용</h2>
            <button className="border rounded px-2 py-0.5 text-[11px]">설명 보기</button>
          </div>
          <textarea
            className="flex-1 border rounded px-2 py-2 text-xs resize-none"
            placeholder="국립 OO박 박물관에 있는 명작의 첫 작품에 대한 설명을 만들어 주세요."
          />
          <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
            <button className="border rounded px-2 py-1 bg-gray-50">전체 적용 사항</button>
            <button className="border rounded px-2 py-1">전문적</button>
            <button className="border rounded px-2 py-1">창의적</button>
            <button className="border rounded px-2 py-1">발랄함</button>
          </div>
        </section>

        {/* AI 초안 */}
        <section className="bg-white border rounded-lg p-3 flex flex-col">
          <h2 className="font-semibold text-gray-900 text-sm mb-2">AI 초안</h2>
          <div className="flex-1 border rounded px-2 py-2 text-xs bg-slate-50 overflow-auto leading-relaxed">
            <p className="text-gray-700">
              AI 초안이 표시되는 영역입니다. AI 초안이 표시되는 영역입니다. AI 초안이 표시되는 영역입니다.
            </p>
          </div>
          <div className="mt-2 flex justify-end gap-2 text-[11px]">
            <button className="border rounded px-3 py-1">다시 생성</button>
            <button className="bg-gray-900 text-white rounded px-3 py-1">적용</button>
          </div>
        </section>

        {/* AI 작성 History */}
        <section className="bg-white border rounded-lg p-3 flex flex-col">
          <h2 className="font-semibold text-gray-900 text-sm mb-2">AI 작성_HISTORY</h2>
          <div className="flex gap-1 flex-wrap mb-2 text-[11px]">
            {['230307_003번', '230307_002번', '230307_001번'].map((chip) => (
              <button key={chip} className="px-2 py-0.5 rounded-full border bg-gray-50">
                {chip}
              </button>
            ))}
          </div>
          <div className="flex-1 border rounded bg-slate-50 flex items-center justify-center text-gray-400">
            이미지 / 카드 영역
          </div>
          <div className="mt-2 text-[11px] text-gray-500">
            선택한 히스토리의 내용이 오른쪽 편집 영역에 표시됩니다.
          </div>
        </section>

        {/* 휴먼 에디터 */}
        <section className="bg-white border rounded-lg p-3 flex flex-col">
          <h2 className="font-semibold text-gray-900 text-sm mb-2">휴먼 에디터</h2>
          <div className="flex gap-2 mb-2 text-[11px]">
            <button className="px-2 py-1 rounded border bg-gray-900 text-white">음성 제작</button>
            <button className="px-2 py-1 rounded border">표절 검사</button>
          </div>
          <textarea
            className="flex-1 border rounded px-2 py-2 text-xs resize-none"
            defaultValue={"여기에 최종 원고가 이렇게 들어갑니다..."}
          />
          <div className="mt-2 text-[11px] text-gray-500 space-y-1">
            <p>표절 유사도 <span className="text-blue-600 font-semibold">안심</span></p>
            <p>해당 문장의 문헌 표절 유사도는 0% 입니다.</p>
          </div>
        </section>
      </div>

      <div className="mt-6 flex justify-end gap-2 text-xs border-t pt-4">
        <button className="border rounded px-4 py-1">초기화</button>
        <button className="border rounded px-4 py-1">저장</button>
        <button className="border rounded px-4 py-1">목록</button>
        <button className="bg-gray-900 text-white rounded px-4 py-1">적용</button>
      </div>
    </div>
  );
}
