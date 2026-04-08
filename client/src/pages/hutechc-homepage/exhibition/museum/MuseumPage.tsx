/* 원본: hutechc_hompage_real/app/(client-layout)/exhibition/museum/page.tsx */
export default function MuseumPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-8 text-xs md:text-sm">
      <header className="mb-4 flex items-center gap-2 text-[11px] text-gray-500">
        <span>홈</span>
        <span>&gt;</span>
        <span>도슨트 메이커</span>
        <span>&gt;</span>
        <span className="text-gray-800">박물관</span>
      </header>

      <h1 className="text-xl md:text-2xl font-semibold text-gray-900 mb-4">박물관</h1>
      <p className="text-gray-600 mb-6">박물관 도슨트 템플릿</p>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)] gap-4">
        {/* Left form */}
        <section className="bg-white border rounded-xl p-4 space-y-4">
          {/* 카테고리 / 언어 */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-medium text-gray-800">카테고리 *</label>
              <div className="flex gap-2">
                <select className="border rounded px-2 py-1 flex-1">
                  <option>카테고리 (대)</option>
                </select>
                <select className="border rounded px-2 py-1 flex-1">
                  <option>카테고리 (중)</option>
                </select>
                <select className="border rounded px-2 py-1 flex-1">
                  <option>카테고리 (소)</option>
                </select>
              </div>
            </div>
            <div className="space-y-1">
              <label className="font-medium text-gray-800">언어 *</label>
              <input className="border rounded px-2 py-1 w-full" placeholder="쓰시는 언어를 입력해 주세요" />
            </div>
          </div>

          {/* 작품 번호 / 작가명 */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-medium text-gray-800">작품 번호 *</label>
              <input className="border rounded px-2 py-1 w-full" placeholder="작품의 관리 번호를 입력해 주세요" />
            </div>
            <div className="space-y-1">
              <label className="font-medium text-gray-800">작가명 *</label>
              <input className="border rounded px-2 py-1 w-full" placeholder="작가명을 입력해 주세요" />
            </div>
          </div>

          {/* 관련 이미지 / 음성 설정 */}
          <div className="grid md:grid-cols-2 gap-4 items-start">
            <div className="space-y-1">
              <label className="font-medium text-gray-800">관련 이미지</label>
              <div className="flex gap-2">
                <input className="border rounded px-2 py-1 flex-1" placeholder="관련 이미지 파일을 업로드 해 주세요" />
                <button className="border rounded px-3 py-1 text-[11px]">파일 찾기</button>
              </div>
            </div>
            <div className="space-y-1">
              <label className="font-medium text-gray-800">음성 설정 *</label>
              <div className="flex flex-wrap gap-2 text-[11px]">
                {["남성", "여성", "중성톤", "정중한", "친근한"].map((label, idx) => (
                  <button
                    key={label}
                    className={`px-3 py-1 rounded border ${
                      idx === 0 ? "bg-gray-900 text-white" : "bg-white text-gray-700"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 다운로드 설정 */}
          <div className="space-y-1">
            <label className="font-medium text-gray-800">다운로드 설정 *</label>
            <div className="flex flex-wrap gap-2 text-[11px]">
              {["MP3 형식", "고화질", "문장", "답변"].map((label, idx) => (
                <button
                  key={label}
                  className={`px-3 py-1 rounded border ${
                    idx === 0 ? "bg-gray-900 text-white" : "bg-white text-gray-700"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* 제목 / 내용 */}
          <div className="space-y-1">
            <label className="font-medium text-gray-800">제목 *</label>
            <input className="border rounded px-2 py-1 w-full" placeholder="도슨트 제목을 입력해 주세요" />
          </div>
          <div className="space-y-1">
            <label className="font-medium text-gray-800">내용 *</label>
            <textarea
              className="border rounded px-2 py-2 w-full h-40 resize-none"
              placeholder="도슨트 내용을 입력해 주세요"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t text-xs">
            <button className="border rounded px-4 py-1">초기화</button>
            <button className="border rounded px-4 py-1">저장</button>
            <button className="border rounded px-4 py-1">목록</button>
            <button className="bg-gray-900 text-white rounded px-4 py-1">적용</button>
          </div>
        </section>

        {/* Right preview placeholder */}
        <aside className="bg-white border rounded-xl flex flex-col items-center justify-center text-center text-xs text-gray-500 p-6 min-h-[340px]">
          <div className="mb-4">클릭 한 번으로 결과를 보여드려요</div>
          <div className="w-20 h-20 border-2 border-dashed rounded-full flex items-center justify-center text-3xl">
            ✨
          </div>
        </aside>
      </div>
    </div>
  );
}
