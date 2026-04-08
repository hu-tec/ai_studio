/* 원본: hutechc_hompage_real/app/(client-layout)/admin/market/page.tsx */
export default function MarketPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 상단 네비: 다크 그레이, 홈>회원관리>화면관리 상세 | 아이콘들 + 저장 */}
      <header className="bg-gray-700 text-gray-200">
        <div className="max-w-[1600px] mx-auto px-6 h-12 flex items-center justify-between">
          <div className="text-sm">홈 &gt; 회원관리 &gt; 화면관리 상세</div>
          <div className="flex items-center gap-3">
            <button type="button" className="p-1.5 hover:bg-gray-600 rounded" title="목록">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
            </button>
            <button type="button" className="p-1.5 hover:bg-gray-600 rounded" title="사각">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
            </button>
            <button type="button" className="p-1.5 hover:bg-gray-600 rounded" title="폴더">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
            </button>
            <button type="button" className="ml-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded hover:bg-blue-700">저장</button>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-6 py-4">
        <h1 className="text-xl font-bold text-gray-900 mb-4">마켓관리</h1>

        {/* 3열 그리드: 좌 회원+전문가 | 중 창작물 | 우 활동+관리자메모, 하단 정산(2열스팬) | 빈칸 */}
        <div className="grid grid-cols-12 gap-4">
          {/* ─── 1열: 회원 기본 정보 ─── */}
          <div className="col-span-3 space-y-4">
            <section className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <h2 className="bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-800">회원 기본 정보</h2>
              <div className="p-4">
                <div className="grid grid-cols-3 gap-x-3 gap-y-2 text-xs">
                  <div className="text-gray-500">화면 관리 번호</div>
                  <div className="col-span-2 text-gray-900">자동 생성</div>
                  <div className="text-gray-500">사이트 구분</div>
                  <div className="col-span-2"><span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">메타시험</span></div>
                  <div className="text-gray-500">회원 유형</div>
                  <div className="col-span-2 text-gray-900">정식 회원</div>
                  <div className="text-gray-500">구독 상태</div>
                  <div className="col-span-2"><span className="inline-block px-2 py-0.5 bg-blue-600 text-white rounded text-xs">Premium</span></div>
                  <div className="text-gray-500">이름</div>
                  <div className="col-span-2 text-gray-900">홍길동</div>
                  <div className="text-gray-500">나이</div>
                  <div className="col-span-2 text-gray-900">30</div>
                  <div className="text-gray-500">생년월일</div>
                  <div className="col-span-2"><input type="text" placeholder="YYYY.MM.DD" className="w-full px-2 py-1 border border-gray-300 rounded bg-gray-50 text-xs" /></div>
                  <div className="text-gray-500">성별</div>
                  <div className="col-span-2 text-gray-900">남</div>
                  <div className="text-gray-500">휴대폰</div>
                  <div className="col-span-2 text-gray-900">01012345678</div>
                  <div className="text-gray-500">비상 연락처</div>
                  <div className="col-span-2 text-gray-900">01012345678</div>
                  <div className="text-gray-500">이메일</div>
                  <div className="col-span-2 text-gray-900">abcd@gmail.com</div>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <div className="bg-gray-100 -mx-4 px-4 py-1.5 text-xs font-medium text-gray-600">알림 설정</div>
                  <div className="pt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                    <label className="flex items-center gap-1.5"><input type="checkbox" className="w-3.5 h-3.5 border-gray-300 rounded" />문자</label>
                    <label className="flex items-center gap-1.5"><input type="checkbox" className="w-3.5 h-3.5 border-gray-300 rounded" />카카오톡</label>
                    <label className="flex items-center gap-1.5"><input type="checkbox" className="w-3.5 h-3.5 border-gray-300 rounded" />이메일</label>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="bg-gray-100 -mx-4 px-4 py-1.5 text-xs font-medium text-gray-600">마케팅 알림 설정</div>
                  <div className="pt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                    <label className="flex items-center gap-1.5"><input type="checkbox" className="w-3.5 h-3.5 border-gray-300 rounded" />문자</label>
                    <label className="flex items-center gap-1.5"><input type="checkbox" className="w-3.5 h-3.5 border-gray-300 rounded" />카카오톡</label>
                    <label className="flex items-center gap-1.5"><input type="checkbox" className="w-3.5 h-3.5 border-gray-300 rounded" />이메일</label>
                  </div>
                </div>
              </div>
            </section>

            {/* 전문가 정보 */}
            <section className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <h2 className="bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-800">전문가 정보</h2>
              <div className="p-4">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-gray-500">전문가 레벨</span>
                  <span className="text-gray-900 font-medium">A</span>
                </div>
              </div>
            </section>
          </div>

          {/* ─── 2열: 창작물 정보 ─── */}
          <div className="col-span-6">
            <section className="bg-white border border-gray-200 rounded-lg overflow-hidden h-full flex flex-col">
              <h2 className="bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-800">창작물 정보</h2>
              <div className="p-4 flex-1 flex flex-col gap-4">
                {/* 상단 통계 행 */}
                <div className="grid grid-cols-4 gap-2 text-xs">
                  <div><div className="text-gray-500">창작물 관리 번호</div><div className="text-gray-900 font-medium">자동 생성</div></div>
                  <div><div className="text-gray-500">판매 희망금액</div><div className="text-gray-900 font-medium">100,000</div></div>
                  <div><div className="text-gray-500">판매수</div><div className="text-gray-900 font-medium">100</div></div>
                  <div><div className="text-gray-500">조회수</div><div className="text-gray-900 font-medium">200</div></div>
                  <div><div className="text-gray-500">후기</div><div className="text-gray-900 font-medium">100</div></div>
                  <div><div className="text-gray-500">평점</div><div className="text-gray-900 font-medium">4.0</div></div>
                  <div><div className="text-gray-500">판매 금액</div><input type="text" defaultValue="100,000" className="w-full px-2 py-1 border border-gray-300 rounded bg-gray-50 text-xs mt-0.5" /></div>
                  <div><div className="text-gray-500">파일형식</div><div className="text-gray-900 font-medium">docx</div></div>
                </div>

                <div>
                  <div className="bg-gray-100 -mx-4 px-4 py-1.5 text-xs font-medium text-gray-600">연관 내용</div>
                  <div className="pt-2 flex gap-2">
                    <input type="text" defaultValue="#연관 내용 #연관 내용 #연관 내용 #연관 내용 #연관 내용 #연관 내용" className="flex-1 px-2 py-1.5 border border-gray-300 rounded bg-gray-50 text-xs" />
                    <button type="button" className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded whitespace-nowrap">AI 자동생성</button>
                  </div>
                </div>

                <div>
                  <div className="bg-gray-100 -mx-4 px-4 py-1.5 text-xs font-medium text-gray-600">제목</div>
                  <div className="pt-2 flex gap-2">
                    <input type="text" placeholder="회원이 입력한 내용을 기본으로 보여주고, 관리자에서 수정이 가능한 화면" className="flex-1 px-2 py-1.5 border border-gray-300 rounded bg-gray-50 text-xs" />
                    <button type="button" className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded whitespace-nowrap">AI 자동생성</button>
                  </div>
                </div>

                <div>
                  <div className="bg-gray-100 -mx-4 px-4 py-1.5 text-xs font-medium text-gray-600">내용</div>
                  <div className="pt-2 flex gap-2">
                    <textarea
                      rows={4}
                      placeholder="회원이 입력한 내용을 기본으로 보여주고, 관리자에서 수정이 가능한 화면입니다. 회원이 입력한 내용을 기본으로 보여주고, 관리자에서 수정이 가능한 화면입니다. 회원이 입력한 내용을 기본으로 보여주고, 관리자에서 수정이 가능한 화면입니다. 회원이 입력한 내용을 기본으로 보여주고, 관리자에서 수정이 가능한 화면입니다."
                      className="flex-1 px-2 py-1.5 border border-gray-300 rounded bg-gray-50 text-xs resize-none"
                    />
                    <button type="button" className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded whitespace-nowrap self-start">AI 자동생성</button>
                  </div>
                </div>

                <div className="flex-1 min-h-[120px]">
                  <div className="bg-gray-100 -mx-4 px-4 py-1.5 text-xs font-medium text-gray-600">창작물</div>
                  <div className="pt-2 border-2 border-dashed border-gray-200 rounded bg-gray-50 flex items-center justify-center min-h-[100px] text-gray-400 text-xs">
                    창작물이 보여지는 영역
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* ─── 3열: 활동 정보 + 관리자 메모 ─── */}
          <div className="col-span-3 space-y-4">
            <section className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <h2 className="bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-800">활동 정보</h2>
              <div className="p-4 space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                  <span className="text-gray-500">활동 관리 번호</span>
                  <span className="text-gray-900">자동 생성</span>
                  <span className="text-gray-500">활동일</span>
                  <input type="text" placeholder="YYYY.MM.DD" className="px-2 py-1 border border-gray-300 rounded bg-gray-50 text-xs" />
                  <span className="text-gray-500">완료일</span>
                  <input type="text" placeholder="YYYY.MM.DD" className="px-2 py-1 border border-gray-300 rounded bg-gray-50 text-xs" />
                  <span className="text-gray-500">서비스 유형</span>
                  <span className="text-gray-900">AI</span>
                </div>
                <div>
                  <div className="bg-gray-100 -mx-4 px-4 py-1.5 text-xs font-medium text-gray-600">카테고리</div>
                  <div className="pt-2 grid grid-cols-3 gap-2">
                    <select className="px-2 py-1 border border-gray-300 rounded bg-gray-50 text-xs"><option>카테고리대</option></select>
                    <select className="px-2 py-1 border border-gray-300 rounded bg-gray-50 text-xs"><option>카테고리중</option></select>
                    <select className="px-2 py-1 border border-gray-300 rounded bg-gray-50 text-xs"><option>카테고리소</option></select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                  <span className="text-gray-500">출발어</span>
                  <span className="text-gray-900">한국어</span>
                  <span className="text-gray-500">도착어</span>
                  <span className="text-blue-600 font-medium">English</span>
                  <span className="text-gray-500">업로드 파일</span>
                  <span className="text-gray-900">filename.gif</span>
                  <span className="text-gray-500">최종파일</span>
                  <span className="text-gray-900">filename.gif</span>
                  <span className="text-gray-500">문서제작목적</span>
                  <span className="text-gray-900">판매</span>
                </div>
              </div>
            </section>

            <section className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <h2 className="bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-800">관리자 메모</h2>
              <div className="p-4">
                <textarea placeholder="메모 입력" rows={6} className="w-full px-2 py-1.5 border border-gray-300 rounded bg-gray-50 text-xs resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </section>
          </div>

          {/* ─── 하단: 정산 정보 (1+2열 스팬) ─── */}
          <div className="col-span-9">
            <section className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <h2 className="bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-800">정산 정보</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gray-50 border-y border-gray-200">
                      <th className="px-3 py-2 text-left font-semibold text-gray-700">환불 관리 번호</th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-700">환불 요청일</th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-700">환불 상태</th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-700">환불 요청 금액</th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-700">환불 금액</th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-700">환불 방법</th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-700">환불 계좌 정보</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100">
                      <td className="px-3 py-2 text-gray-900">자동 생성</td>
                      <td className="px-3 py-2 text-gray-900">YY.MM.DD.DOW</td>
                      <td className="px-3 py-2">
                        <select className="px-2 py-0.5 border border-gray-300 rounded bg-gray-50 text-xs"><option>환불 요청</option></select>
                      </td>
                      <td className="px-3 py-2 text-gray-900">100,000</td>
                      <td className="px-3 py-2"><input type="text" defaultValue="90,000" className="w-20 px-1.5 py-0.5 border border-amber-300 bg-amber-50 rounded text-xs text-gray-900" /></td>
                      <td className="px-3 py-2 text-gray-900">계좌 입금</td>
                      <td className="px-3 py-2 text-gray-900">oo은행 XXXXXX-XXX-XXXXXX 홍길동</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </div>
          <div className="col-span-3" />
        </div>
      </main>
    </div>
  );
}
