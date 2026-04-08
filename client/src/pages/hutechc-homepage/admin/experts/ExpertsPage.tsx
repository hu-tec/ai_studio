/* 원본: hutechc_hompage_real/app/(client-layout)/admin/experts/page.tsx */
export default function ExpertsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <input
              type="search"
              placeholder="검색"
              className="w-48 px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-xs text-gray-500 flex-shrink-0">홈 &gt; 회원관리 &gt; 화면관리 상세</span>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <h1 className="text-lg font-bold text-gray-900">전문가 관리</h1>
            <button className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700">저장</button>
            <span className="text-sm text-gray-600">관리자</span>
            <button className="text-sm text-gray-500 hover:text-gray-700">로그아웃</button>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-6 py-6">
        {/* 상단 3열: 전문가관리(좁) | 카테고리블록 | 매칭정보·요청사항(제일 오른쪽) */}
        <div className="flex gap-4 items-start">
          {/* 1. 전문가 관리 (가로폭 줄임) */}
          <div className="w-[320px] flex-shrink-0 space-y-4">
            {/* 전문가 정보 */}
            <section className="bg-white border border-gray-200 rounded-lg p-4">
              <h2 className="text-sm font-semibold text-gray-900 mb-3">전문가 정보</h2>
              <div className="space-y-2 text-xs">
                <div className="flex gap-2">
                  <span className="w-20 text-gray-500 flex-shrink-0">전문가 관리 번호</span>
                  <span className="text-gray-900">자동 생성</span>
                </div>
                <div className="flex gap-2">
                  <span className="w-20 text-gray-500 flex-shrink-0">사이트 구분</span>
                  <input type="text" defaultValue="메타시험" className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs" />
                </div>
                <div className="flex gap-2">
                  <span className="w-20 text-gray-500 flex-shrink-0">회원 유형</span>
                  <span className="text-gray-900">정식 회원</span>
                </div>
                <div className="flex gap-2">
                  <span className="w-20 text-gray-500 flex-shrink-0">구독 상태</span>
                  <button className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">Premium</button>
                </div>
                <div className="flex gap-2">
                  <span className="w-20 text-gray-500 flex-shrink-0">이름</span>
                  <input type="text" defaultValue="홍길동" className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs" />
                </div>
                <div className="flex gap-2">
                  <span className="w-20 text-gray-500 flex-shrink-0">나이</span>
                  <input type="text" defaultValue="30" className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs w-16" />
                </div>
                <div className="flex gap-2">
                  <span className="w-20 text-gray-500 flex-shrink-0">생년월일</span>
                  <input type="text" placeholder="YYYY.MM.DD" className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs" />
                </div>
                <div className="flex gap-2">
                  <span className="w-20 text-gray-500 flex-shrink-0">성별</span>
                  <select className="px-2 py-1 border border-gray-300 rounded text-xs">
                    <option>남</option>
                    <option>여</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <span className="w-20 text-gray-500 flex-shrink-0">휴대폰</span>
                  <input type="text" defaultValue="01012345678" className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs" />
                </div>
                <div className="flex gap-2">
                  <span className="w-20 text-gray-500 flex-shrink-0">비상 연락처</span>
                  <input type="text" className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs" />
                </div>
                <div className="flex gap-2">
                  <span className="w-20 text-gray-500 flex-shrink-0">이메일</span>
                  <input type="text" defaultValue="abcd@gmail.com" className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs" />
                </div>
                <div className="flex gap-2">
                  <span className="w-20 text-gray-500 flex-shrink-0">본인인증</span>
                  <span className="text-gray-900">휴대폰</span>
                </div>
                <div className="flex gap-2">
                  <span className="w-20 text-gray-500 flex-shrink-0">국적</span>
                  <input type="text" defaultValue="대한민국" className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs" />
                </div>
                <div className="flex gap-2">
                  <span className="w-20 text-gray-500 flex-shrink-0">주소</span>
                  <input type="text" defaultValue="서울시 무슨구 무슨동" className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs" />
                </div>
                <div className="flex gap-2">
                  <span className="w-20 text-gray-500 flex-shrink-0">상세주소</span>
                  <input type="text" defaultValue="0000빌딩 000호" className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs" />
                </div>
                <div className="flex gap-2">
                  <span className="w-20 text-gray-500 flex-shrink-0">가입일</span>
                  <input type="text" placeholder="YYYY.MM.DD" className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs" />
                </div>
                <div className="flex gap-2">
                  <span className="w-20 text-gray-500 flex-shrink-0">가입채널</span>
                  <input type="text" defaultValue="카카오" className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs" />
                </div>
                <div className="flex gap-2">
                  <span className="w-20 text-gray-500 flex-shrink-0">최초접근기기</span>
                  <span className="text-gray-900">모바일</span>
                </div>
                <div className="flex gap-2">
                  <span className="w-20 text-gray-500 flex-shrink-0">최근 로그인</span>
                  <input type="text" placeholder="YYYY.MM.DD" className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs" />
                </div>
                <div className="flex gap-2">
                  <span className="w-20 text-gray-500 flex-shrink-0">체류시간</span>
                  <input type="text" placeholder="hh:mm:ss" className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs" />
                </div>
                <div className="flex gap-2">
                  <span className="w-20 text-gray-500 flex-shrink-0">사진</span>
                  <span className="text-gray-900">모바일</span>
                </div>
                <div className="flex gap-2 pt-1">
                  <span className="w-20 text-gray-500 flex-shrink-0">알림 설정</span>
                  <div className="flex gap-3">
                    <label className="flex items-center gap-1"><input type="checkbox" className="w-3 h-3" />문자</label>
                    <label className="flex items-center gap-1"><input type="checkbox" className="w-3 h-3" />카카오톡</label>
                    <label className="flex items-center gap-1"><input type="checkbox" className="w-3 h-3" />이메일</label>
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className="w-20 text-gray-500 flex-shrink-0">마케팅 알림</span>
                  <div className="flex gap-3">
                    <label className="flex items-center gap-1"><input type="checkbox" className="w-3 h-3" />문자</label>
                    <label className="flex items-center gap-1"><input type="checkbox" className="w-3 h-3" />카카오톡</label>
                    <label className="flex items-center gap-1"><input type="checkbox" className="w-3 h-3" />이메일</label>
                  </div>
                </div>
              </div>
            </section>

            {/* 이력서 */}
            <section className="bg-white border border-gray-200 rounded-lg p-4">
              <h2 className="text-sm font-semibold text-gray-900 mb-3">이력서</h2>
              <div className="space-y-2 text-xs">
                <div className="flex gap-2 items-center">
                  <span className="w-24 text-gray-500 flex-shrink-0">파일</span>
                  <input type="file" className="flex-1 text-xs" />
                </div>
                <div className="text-gray-400">filename.docx</div>
                <div className="flex gap-2">
                  <span className="w-24 text-gray-500 flex-shrink-0">전문가 승인</span>
                  <select className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs">
                    <option>전문가 승인</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <span className="w-24 text-gray-500 flex-shrink-0">승인일</span>
                  <input type="text" placeholder="YY.MM.DD.DOW" className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs" />
                </div>
                <div className="flex gap-2">
                  <span className="w-24 text-gray-500 flex-shrink-0">우선 순위</span>
                  <input type="text" defaultValue="1" className="w-14 px-2 py-1 border border-gray-300 rounded text-xs" />
                </div>
                <div className="flex gap-2">
                  <span className="w-24 text-gray-500 flex-shrink-0">전문가 레벨</span>
                  <input type="text" defaultValue="A" className="w-14 px-2 py-1 border border-gray-300 rounded text-xs" />
                </div>
                <div className="flex gap-2">
                  <span className="w-24 text-gray-500 flex-shrink-0">평점</span>
                  <input type="text" defaultValue="4.5" className="w-14 px-2 py-1 border border-gray-300 rounded text-xs" />
                </div>
                <div className="flex gap-2">
                  <span className="w-24 text-gray-500 flex-shrink-0">리뷰</span>
                  <input type="text" defaultValue="10" className="w-14 px-2 py-1 border border-gray-300 rounded text-xs" />
                </div>
                <div className="flex gap-2">
                  <span className="w-24 text-gray-500 flex-shrink-0">활동 횟수</span>
                  <input type="text" defaultValue="10" className="w-14 px-2 py-1 border border-gray-300 rounded text-xs" />
                </div>
                <div className="flex gap-2">
                  <span className="w-24 text-gray-500 flex-shrink-0">매칭 거절</span>
                  <input type="text" defaultValue="1" className="w-14 px-2 py-1 border border-gray-300 rounded text-xs" />
                </div>
              </div>
            </section>
          </div>

          {/* 2. 카테고리 + 서비스가능유형/시간 + 학력 + 경력 + 해외거주 + 저서역서 (한 블록) */}
          <div className="flex-1 min-w-0">
            <section className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
              {/* 카테고리 */}
              <div>
                <h2 className="text-sm font-semibold text-gray-900 mb-2">카테고리</h2>
                <div className="grid grid-cols-4 gap-2 text-xs">
                  <div>
                    <label className="block text-gray-500 mb-0.5">카테고리 대</label>
                    <select className="w-full px-2 py-1 border border-gray-300 rounded text-xs"><option>선택</option></select>
                  </div>
                  <div>
                    <label className="block text-gray-500 mb-0.5">카테고리 중</label>
                    <select className="w-full px-2 py-1 border border-gray-300 rounded text-xs"><option>선택</option></select>
                  </div>
                  <div>
                    <label className="block text-gray-500 mb-0.5">카테고리 소</label>
                    <select className="w-full px-2 py-1 border border-gray-300 rounded text-xs"><option>선택</option></select>
                  </div>
                  <div>
                    <label className="block text-gray-500 mb-0.5">관련 파일</label>
                    <input type="file" className="w-full text-xs" />
                  </div>
                </div>
                <div className="text-gray-400 text-xs mt-1">filename.gif</div>
              </div>

              {/* 서비스 가능 유형 & 서비스 가능 시간 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-xs font-semibold text-gray-900 mb-1.5">서비스 가능 유형</h3>
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs">
                    {['문서 작성', '구두 통역', '동시 통역', '영상 번역', '기타'].map((t) => (
                      <label key={t} className="flex items-center gap-1 cursor-pointer">
                        <input type="checkbox" className="w-3 h-3" />{t}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-gray-900 mb-1.5">서비스 가능 시간</h3>
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs">
                    {['언제든지', '오전', '오후', '저녁', '주말'].map((t) => (
                      <label key={t} className="flex items-center gap-1 cursor-pointer">
                        <input type="checkbox" className="w-3 h-3" />{t}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* 학력 */}
              <div>
                <h3 className="text-xs font-semibold text-gray-900 mb-2">학력</h3>
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="grid grid-cols-6 gap-2 text-xs">
                      <input type="text" placeholder="학교명" className="px-2 py-1 border border-gray-300 rounded" />
                      <input type="text" placeholder="학부/학과" className="px-2 py-1 border border-gray-300 rounded" />
                      <input type="text" placeholder="YYYY.MM.DD" className="px-2 py-1 border border-gray-300 rounded" />
                      <input type="text" placeholder="YYYY.MM.DD" className="px-2 py-1 border border-gray-300 rounded" />
                      <select className="px-2 py-1 border border-gray-300 rounded"><option>졸업</option><option>졸업 예정</option></select>
                      <input type="file" className="text-xs" />
                    </div>
                  ))}
                </div>
              </div>

              {/* 경력 */}
              <div>
                <h3 className="text-xs font-semibold text-gray-900 mb-2">경력</h3>
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="grid grid-cols-6 gap-2 text-xs">
                      <input type="text" placeholder="회사명" className="px-2 py-1 border border-gray-300 rounded" />
                      <input type="text" placeholder="부서" className="px-2 py-1 border border-gray-300 rounded" />
                      <input type="text" placeholder="직위" className="px-2 py-1 border border-gray-300 rounded" />
                      <input type="text" placeholder="YYYY.MM.DD" className="px-2 py-1 border border-gray-300 rounded" />
                      <input type="text" placeholder="YYYY.MM.DD" className="px-2 py-1 border border-gray-300 rounded" />
                      <input type="file" className="text-xs" />
                    </div>
                  ))}
                </div>
              </div>

              {/* 해외 거주 경험 */}
              <div>
                <h3 className="text-xs font-semibold text-gray-900 mb-2">해외 거주 경험</h3>
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="grid grid-cols-4 gap-2 text-xs">
                      <input type="text" placeholder="해외 거주지" className="px-2 py-1 border border-gray-300 rounded" />
                      <input type="text" placeholder="거주 이유" className="px-2 py-1 border border-gray-300 rounded" />
                      <input type="text" placeholder="YYYY.MM.DD" className="px-2 py-1 border border-gray-300 rounded" />
                      <input type="text" placeholder="YYYY.MM.DD" className="px-2 py-1 border border-gray-300 rounded" />
                    </div>
                  ))}
                </div>
              </div>

              {/* 저서 및 역서 */}
              <div>
                <h3 className="text-xs font-semibold text-gray-900 mb-2">저서 및 역서</h3>
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="grid grid-cols-4 gap-2 text-xs">
                      <input type="text" placeholder="저서명" className="px-2 py-1 border border-gray-300 rounded" />
                      <input type="text" placeholder="출판사" className="px-2 py-1 border border-gray-300 rounded" />
                      <input type="text" placeholder="YYYY.MM.DD" className="px-2 py-1 border border-gray-300 rounded" />
                      <input type="file" className="text-xs" />
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>

          {/* 3. 매칭 정보 + 요청 사항 (제일 오른쪽, 글씨·여백 줄임) */}
          <div className="w-[280px] flex-shrink-0 space-y-3">
            <section className="bg-white border border-gray-200 rounded-lg p-3">
              <h2 className="text-xs font-semibold text-gray-900 mb-2">매칭 정보</h2>
              <div className="space-y-1 text-[11px]">
                <div className="flex gap-1.5">
                  <span className="w-24 text-gray-500 flex-shrink-0">매칭 관리 번호</span>
                  <span className="text-gray-900">자동 생성</span>
                </div>
                <div className="flex gap-1.5">
                  <span className="w-24 text-gray-500 flex-shrink-0">매칭 요청일</span>
                  <input type="text" placeholder="YYYY.MM.DD" className="flex-1 px-1.5 py-0.5 border border-gray-300 rounded text-[11px] min-w-0" />
                </div>
                <div className="flex gap-1.5">
                  <span className="w-24 text-gray-500 flex-shrink-0">매칭 완료일</span>
                  <input type="text" placeholder="YYYY.MM.DD" className="flex-1 px-1.5 py-0.5 border border-gray-300 rounded text-[11px] min-w-0" />
                </div>
                <div className="flex gap-1.5">
                  <span className="w-24 text-gray-500 flex-shrink-0">완료희망일</span>
                  <input type="text" placeholder="YY.MM.DD.DOW" className="flex-1 px-1.5 py-0.5 border border-gray-300 rounded text-[11px] min-w-0" />
                </div>
                <div className="flex gap-1.5">
                  <span className="w-24 text-gray-500 flex-shrink-0">서비스 완료일</span>
                  <input type="text" placeholder="YY.MM.DD.DOW" className="flex-1 px-1.5 py-0.5 border border-gray-300 rounded text-[11px] min-w-0" />
                </div>
                <div className="flex gap-1.5">
                  <span className="w-24 text-gray-500 flex-shrink-0">매칭 상태</span>
                  <select className="flex-1 px-1.5 py-0.5 border border-gray-300 rounded text-[11px] min-w-0"><option>매칭 요청</option></select>
                </div>
                <div className="flex gap-1.5">
                  <span className="w-24 text-gray-500 flex-shrink-0">매칭 방법</span>
                  <input type="text" defaultValue="대면" className="flex-1 px-1.5 py-0.5 border border-gray-300 rounded text-[11px] min-w-0" />
                </div>
                <div className="flex gap-1.5">
                  <span className="w-24 text-gray-500 flex-shrink-0">서비스 유형</span>
                  <input type="text" defaultValue="문서 작성" className="flex-1 px-1.5 py-0.5 border border-gray-300 rounded text-[11px] min-w-0" />
                </div>
                <div className="flex gap-1.5">
                  <span className="w-24 text-gray-500 flex-shrink-0">서비스 방법</span>
                  <input type="text" defaultValue="채팅" className="flex-1 px-1.5 py-0.5 border border-gray-300 rounded text-[11px] min-w-0" />
                </div>
                <div className="flex gap-1.5">
                  <span className="w-24 text-gray-500 flex-shrink-0">카톡아이디</span>
                  <input type="text" defaultValue="XXXXXXXXXXXX" className="flex-1 px-1.5 py-0.5 border border-gray-300 rounded text-[11px] min-w-0" />
                </div>
                <div className="flex gap-1.5">
                  <span className="w-24 text-gray-500 flex-shrink-0">활동 요청 시간</span>
                  <input type="text" defaultValue="언제든지" className="flex-1 px-1.5 py-0.5 border border-gray-300 rounded text-[11px] min-w-0" />
                </div>
                <div className="flex gap-1.5">
                  <span className="w-24 text-gray-500 flex-shrink-0">긴급 여부</span>
                  <input type="text" defaultValue="긴급" className="flex-1 px-1.5 py-0.5 border border-gray-300 rounded text-[11px] min-w-0" />
                </div>
                <div className="flex gap-1.5">
                  <span className="w-24 text-gray-500 flex-shrink-0">지역</span>
                  <input type="text" defaultValue="대한민국 서울" className="flex-1 px-1.5 py-0.5 border border-gray-300 rounded text-[11px] min-w-0" />
                </div>
                <div className="flex gap-1.5">
                  <span className="w-24 text-gray-500 flex-shrink-0">작업 분량</span>
                  <input type="text" defaultValue="100,000" className="flex-1 px-1.5 py-0.5 border border-gray-300 rounded text-[11px] min-w-0" />
                </div>
                <div className="flex gap-1.5">
                  <span className="w-24 text-gray-500 flex-shrink-0">단위</span>
                  <input type="text" defaultValue="글자수" className="flex-1 px-1.5 py-0.5 border border-gray-300 rounded text-[11px] min-w-0" />
                </div>
                <div className="flex gap-1.5">
                  <span className="w-24 text-gray-500 flex-shrink-0">완료파일</span>
                  <input type="text" defaultValue="filename.docx" className="flex-1 px-1.5 py-0.5 border border-gray-300 rounded text-[11px] min-w-0" />
                </div>
                <div className="flex gap-1.5">
                  <span className="w-24 text-gray-500 flex-shrink-0">희망 금액</span>
                  <input type="text" defaultValue="100,000" className="flex-1 px-1.5 py-0.5 border border-gray-300 rounded text-[11px] min-w-0" />
                </div>
                <div className="flex gap-1.5">
                  <span className="w-24 text-gray-500 flex-shrink-0">작업 소요 시간</span>
                  <input type="text" defaultValue="시험 완료" className="flex-1 px-1.5 py-0.5 border border-gray-300 rounded text-[11px] min-w-0" />
                </div>
                <div className="flex gap-1.5">
                  <span className="w-24 text-gray-500 flex-shrink-0">최종 금액</span>
                  <input type="text" defaultValue="200,000" className="flex-1 px-1.5 py-0.5 border border-gray-300 rounded text-[11px] min-w-0" />
                </div>
              </div>
            </section>
            <section className="bg-white border border-gray-200 rounded-lg p-3">
              <h2 className="text-xs font-semibold text-gray-900 mb-1.5">요청 사항</h2>
              <textarea
                placeholder="요청 사항을 입력하세요. (예: 번역 품질, 전문 분야, 마감일 등)"
                rows={6}
                className="w-full px-2 py-1.5 text-[11px] border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </section>
          </div>
        </div>

        {/* 하단: 정산 정보 (전체 폭) */}
        <div className="mt-6 flex gap-4">
          <section className="flex-1 bg-white border border-gray-200 rounded-lg overflow-hidden">
            <h2 className="text-sm font-semibold text-gray-900 p-4 pb-2">정산 정보</h2>
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
                      <select className="px-2 py-0.5 border border-gray-300 rounded text-xs"><option>환불 요청</option></select>
                    </td>
                    <td className="px-3 py-2 text-gray-900">100,000</td>
                    <td className="px-3 py-2 text-red-600">90,000</td>
                    <td className="px-3 py-2 text-gray-900">계좌 입금</td>
                    <td className="px-3 py-2 text-gray-900">OO은행 XXXXXX-XXX-XXXXXX 홍길동</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
          <section className="w-64 flex-shrink-0 bg-white border border-gray-200 rounded-lg p-4">
            <h2 className="text-sm font-semibold text-gray-900 mb-2">관리자 메모</h2>
            <textarea
              placeholder="메모 입력"
              rows={6}
              className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </section>
        </div>
      </main>
    </div>
  );
}
