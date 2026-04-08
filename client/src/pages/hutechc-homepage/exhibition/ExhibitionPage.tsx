/* 원본: hutechc_hompage_real/app/(client-layout)/exhibition/page.tsx
   Next.js → React Router 변환 */

export default function ExhibitionPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-12">
      {/* Hero */}
      <section className="text-center space-y-4">
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">
          당신이 발견하지 못한 감동, 스마트 가이드가 열어 드립니다
        </h1>
        <p className="text-sm md:text-base text-gray-600">
          전문 도슨트의 해설을 통해 작품과 유물 속 숨겨진 이야기를 발견해 보세요.
        </p>
      </section>

      {/* Category tiles */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {["박물관", "미술관", "전시회", "관광지", "유적지", "건축물", "익스트림", "여행"].map((label) => (
          <div
            key={label}
            className="aspect-[4/3] border rounded-lg flex flex-col items-center justify-center gap-3 bg-white hover:shadow-sm transition"
          >
            <div className="w-10 h-10 border-2 border-gray-900 flex items-center justify-center text-lg font-bold">
              M
            </div>
            <div className="text-sm font-medium text-gray-900">{label}</div>
          </div>
        ))}
      </section>

      {/* Festival highlight */}
      <section className="space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-xl font-semibold text-gray-900">경주가 만발하는 4월에 볼 만한 축제</h2>
          <p className="text-sm text-gray-600">국내 벚꽃 축제 TOP3</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, idx) => (
            <article key={idx} className="border rounded-lg bg-white p-4 flex flex-col justify-between">
              <div className="space-y-2 text-sm">
                <h3 className="font-semibold">01 어디어디 축제</h3>
                <p className="text-gray-600">기간: YY.MM.DD~YY.MM.DD</p>
                <p className="text-gray-600">추천 가이드: 휴일풍 전문가</p>
              </div>
              <button className="mt-4 inline-flex items-center justify-center border border-gray-300 rounded px-3 py-1 text-xs text-gray-700 hover:bg-gray-50">
                전체 가이드 보기
              </button>
            </article>
          ))}
        </div>
      </section>

      {/* World map style section */}
      <section className="space-y-6">
        <div className="text-sm font-semibold text-gray-900">세계 곳곳의 문화 예술 가이드</div>
        <div className="h-56 md:h-72 border rounded-xl bg-gradient-to-r from-slate-50 to-slate-100 flex items-center justify-center text-gray-400 text-xs">
          지도/이미지 영역 (실제 지도 기능은 나중에 구현)
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          {["여행코스", "계절별여행", "맞춤여행", "체험코스", "관광지여행", "지식수업으로", "미술관", "전시장", "박물관", "유적지"].map((tag) => (
            <button
              key={tag}
              className="px-3 py-1 rounded-full border border-gray-300 bg-white hover:bg-gray-50"
            >
              {tag}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
