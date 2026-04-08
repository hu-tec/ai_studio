/* 원본: hutechc_hompage_real/app/(client-layout)/admin/quote/page.tsx */
export default function QuotePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 상단: 햄버거, Q검색, 관리자, 로그아웃 */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button type="button" className="p-2 hover:bg-gray-100 rounded" aria-label="메뉴">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </span>
              <input type="search" placeholder="Q 검색" className="pl-9 pr-3 py-2 w-48 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-600">관리자</span>
            <button type="button" className="text-gray-500 hover:text-gray-700">로그아웃</button>
          </div>
        </div>
        <div className="max-w-[1600px] mx-auto px-6 py-2 border-t border-gray-100">
          <span className="text-xs text-gray-500">홈 &gt; 회원관리 &gt; 화면관리 상세</span>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-6 py-4">
        {/* 제목 + 액션(목록/사각/다운로드 + 저장) */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-900">견적서 관리</h1>
          <div className="flex items-center gap-2">
            <button type="button" className="p-2 hover:bg-gray-100 rounded" title="목록">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
            </button>
            <button type="button" className="p-2 hover:bg-gray-100 rounded" title="사각">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z" /></svg>
            </button>
            <button type="button" className="p-2 hover:bg-gray-100 rounded" title="다운로드">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            </button>
            <button type="button" className="ml-1 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded hover:bg-blue-700">저장</button>
          </div>
        </div>

        {/* 2열: 좌 기본정보 | 우 견적정보+견적내용 */}
        <div className="grid grid-cols-12 gap-4">
          {/* ─── 1열: 기본 정보 ─── */}
          <div className="col-span-4">
            <section className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <h2 className="bg-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-800">기본 정보</h2>
              <div className="p-4 space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                  <span className="text-gray-500">화면 관리 번호</span>
                  <input type="text" className="px-2 py-1 border border-gray-300 rounded bg-gray-50" />
                  <span className="text-gray-500">사이트 구분</span>
                  <input type="text" className="px-2 py-1 border border-gray-300 rounded bg-gray-50" />
                  <span className="text-gray-500">회원 유형</span>
                  <div className="flex gap-1 flex-wrap">
                    <label className="flex items-center gap-1"><input type="radio" name="memberType" value="meta" className="w-3 h-3" />메타시험</label>
                    <label className="flex items-center gap-1"><input type="radio" name="memberType" value="regular" className="w-3 h-3" />정식 회원</label>
                    <label className="flex items-center gap-1"><input type="radio" name="memberType" value="premium" defaultChecked className="w-3 h-3" />Premium</label>
                  </div>
                  <span className="text-gray-500">구독 상태</span>
                  <input type="text" className="px-2 py-1 border border-gray-300 rounded bg-gray-50" />
                </div>

                <div className="grid grid-cols-2 gap-x-3 gap-y-2 pt-2 border-t border-gray-100">
                  <span className="text-gray-500">이름</span>
                  <span className="text-gray-900">홍길동</span>
                  <span className="text-gray-500">나이</span>
                  <span className="text-gray-900">30</span>
                  <span className="text-gray-500">생년월일</span>
                  <span className="text-gray-900">YYYY.MM.DD</span>
                  <span className="text-gray-500">성별</span>
                  <span className="text-gray-900">남</span>
                  <span className="text-gray-500">휴대폰</span>
                  <span className="text-gray-900">01012345678</span>
                  <span className="text-gray-500">비상 연락처</span>
                  <span className="text-gray-900">01012345678</span>
                  <span className="text-gray-500">이메일</span>
                  <span className="text-gray-900">abcd@gmail.com</span>
                </div>

                <div className="grid grid-cols-2 gap-x-3 gap-y-2 pt-2 border-t border-gray-100">
                  <span className="text-gray-500">본인인증</span>
                  <input type="text" className="px-2 py-1 border border-gray-300 rounded bg-gray-50" />
                  <span className="text-gray-500">국적</span>
                  <span className="text-gray-900">대한민국</span>
                </div>

                <div className="pt-2 border-t border-gray-100">
                  <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                    <span className="text-gray-500">주소</span>
                    <span className="text-gray-900">서울시 무슨구 무슨동 0000빌딩 000호</span>
                    <span className="text-gray-500">상세 주소</span>
                    <input type="text" className="px-2 py-1 border border-gray-300 rounded bg-gray-50" />
                  </div>
                  <div className="mt-2">
                    <span className="text-gray-500 block mb-1">추후 사용</span>
                    <div className="h-10 bg-gray-100 rounded flex items-center justify-center text-gray-400 text-[11px]">추후 사용</div>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-100 flex flex-wrap items-center gap-2">
                  <label className="flex items-center gap-1.5">
                    <input type="checkbox" defaultChecked className="w-3.5 h-3.5 border-gray-300 rounded" />
                    <span className="text-gray-600">그룹</span>
                  </label>
                  <span className="text-gray-500">그룹명</span>
                  <span className="text-gray-900 font-medium">삼성</span>
                </div>

                <div className="grid grid-cols-2 gap-x-3 gap-y-2 pt-2 border-t border-gray-100">
                  <span className="text-gray-500">가입일</span>
                  <span className="text-gray-900">YYYY.MM.DD</span>
                  <span className="text-gray-500">가입채널</span>
                  <span className="text-gray-900">카카오</span>
                  <span className="text-gray-500">최초접근기기</span>
                  <span className="text-gray-900">모바일</span>
                  <span className="text-gray-500">최근 로그인</span>
                  <span className="text-gray-900">YYYY.MM.DD hh:mm:ss</span>
                  <span className="text-gray-500">체류시간</span>
                  <input type="text" className="px-2 py-1 border border-gray-300 rounded bg-gray-50" />
                  <span className="text-gray-500">사진</span>
                  <input type="text" className="px-2 py-1 border border-gray-300 rounded bg-gray-50" />
                </div>

                <div className="pt-2 border-t border-gray-100">
                  <div className="text-gray-500 mb-1.5">알림 설정</div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1">
                    <label className="flex items-center gap-1"><input type="checkbox" className="w-3 h-3 border-gray-300 rounded" />문자</label>
                    <label className="flex items-center gap-1"><input type="checkbox" className="w-3 h-3 border-gray-300 rounded" />카카오톡</label>
                    <label className="flex items-center gap-1"><input type="checkbox" className="w-3 h-3 border-gray-300 rounded" />이메일</label>
                  </div>
                </div>
                <div>
                  <div className="text-gray-500 mb-1.5">마케팅 알림 설정</div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1">
                    <label className="flex items-center gap-1"><input type="checkbox" className="w-3 h-3 border-gray-300 rounded" />문자</label>
                    <label className="flex items-center gap-1"><input type="checkbox" className="w-3 h-3 border-gray-300 rounded" />카카오톡</label>
                    <label className="flex items-center gap-1"><input type="checkbox" className="w-3 h-3 border-gray-300 rounded" />이메일</label>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* ─── 2열: 견적 정보 + 견적 내용 ─── */}
          <div className="col-span-8 space-y-4">
            {/* 견적 정보: 가로 배치 */}
            <section className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <h2 className="bg-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-800">견적 정보</h2>
              <div className="p-4">
                <div className="flex flex-wrap gap-x-6 gap-y-3 text-xs">
                  <div><span className="text-gray-500 block">결제 관리 번호</span><span className="text-gray-900 font-medium">자동 생성</span></div>
                  <div><span className="text-gray-500 block">결제일</span><span className="text-gray-900">YY.MM.DD.DOW</span></div>
                  <div><span className="text-gray-500 block">결제 내용</span><span className="text-gray-900">시험응시</span></div>
                  <div><span className="text-gray-500 block">이용 금액</span><span className="text-gray-900">100,000</span></div>
                  <div><span className="text-gray-500 block">혜택</span><select className="px-2 py-0.5 border border-gray-300 rounded bg-gray-50 text-xs mt-0.5"><option>이벤트 할인</option></select></div>
                  <div><span className="text-gray-500 block">혜택 금액</span><span className="text-gray-900">-10,000</span></div>
                  <div><span className="text-gray-500 block">결제 금액</span><span className="text-blue-600 font-semibold">90,000</span></div>
                  <div><span className="text-gray-500 block">보유 포인트</span><span className="text-gray-900">12,000</span></div>
                  <div><span className="text-gray-500 block">결제 방법</span><span className="text-gray-900">카드결제 OO카드</span></div>
                  <div><span className="text-gray-500 block">결제 정보</span><span className="text-gray-900">XXXXXX-XXXXXX-XXXXXXXXX</span></div>
                </div>
              </div>
            </section>

            {/* 견적 내용: 테이블 + 합계 + 추가사항 + 최종견적 */}
            <section className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <h2 className="bg-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-800">견적 내용</h2>
              <div className="p-4">
                <div className="overflow-x-auto -mx-4 px-4">
                  <table className="w-full text-xs border-collapse min-w-[720px]">
                    <thead>
                      <tr className="bg-gray-50 border-y border-gray-200">
                        <th className="px-2 py-1.5 text-left font-semibold text-gray-700">요청파일</th>
                        <th className="px-2 py-1.5 text-left font-semibold text-gray-700">번역량</th>
                        <th className="px-2 py-1.5 text-left font-semibold text-gray-700">출발어 도착어</th>
                        <th className="px-2 py-1.5 text-left font-semibold text-gray-700">번역유형</th>
                        <th className="px-2 py-1.5 text-left font-semibold text-gray-700">전문가레벨</th>
                        <th className="px-2 py-1.5 text-center font-semibold text-gray-700" colSpan={3}>견적금액(금액/부가세/총액)</th>
                      </tr>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th colSpan={5} className="px-2 py-0.5" />
                        <th className="px-2 py-0.5 text-center font-medium text-gray-600">금액</th>
                        <th className="px-2 py-0.5 text-center font-medium text-gray-600">부가세</th>
                        <th className="px-2 py-0.5 text-center font-medium text-gray-600">총액</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[1, 2, 3].map((i) => (
                        <tr key={i} className="border-b border-gray-100">
                          <td className="px-2 py-1.5 text-gray-900">filename.dox</td>
                          <td className="px-2 py-1.5 text-gray-900">50,000wk</td>
                          <td className="px-2 py-1.5 text-gray-900">한&gt;영, 한&gt;중, 한&gt;일</td>
                          <td className="px-2 py-1.5"><select className="w-full px-1.5 py-0.5 border border-gray-300 rounded bg-gray-50 text-xs"><option>AI휴먼번역</option></select></td>
                          <td className="px-2 py-1.5"><select className="w-full px-1.5 py-0.5 border border-gray-300 rounded bg-gray-50 text-xs"><option>특수전문가</option></select></td>
                          <td className="px-2 py-1.5 text-right text-gray-900">100,000</td>
                          <td className="px-2 py-1.5 text-right text-gray-900">10,000</td>
                          <td className="px-2 py-1.5 text-right text-gray-900">110,000</td>
                        </tr>
                      ))}
                      <tr className="bg-gray-50 border-y-2 border-gray-200 font-semibold">
                        <td className="px-2 py-1.5" colSpan={5}>합계</td>
                        <td className="px-2 py-1.5 text-right text-gray-900">300,000</td>
                        <td className="px-2 py-1.5 text-right text-gray-900">30,000</td>
                        <td className="px-2 py-1.5 text-right text-gray-900">330,000</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100 space-y-2 text-xs">
                  <div>
                    <span className="text-gray-600 font-medium">추가사항</span>
                    <span className="ml-2 text-gray-500">긴급</span>
                    <span className="ml-1 text-gray-900">비용*2</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-600 font-medium">최종견적</span>
                    <span className="text-gray-900">100,000</span>
                    <span className="text-gray-900">10,000</span>
                    <span className="text-gray-900 font-semibold">110,000</span>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* 전폭: 견적조건 */}
        <section className="mt-4 bg-white border border-gray-200 rounded-lg overflow-hidden">
          <h2 className="bg-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-800">견적조건</h2>
          <div className="p-4">
            <textarea
              placeholder="견적서 하단에 들어갈 특약 내용 입력"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </section>

        {/* 전폭: 관리자 메모 */}
        <section className="mt-4 bg-white border border-gray-200 rounded-lg overflow-hidden">
          <h2 className="bg-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-800">관리자 메모</h2>
          <div className="p-4">
            <textarea placeholder="메모 입력" rows={4} className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </section>
      </main>
    </div>
  );
}
