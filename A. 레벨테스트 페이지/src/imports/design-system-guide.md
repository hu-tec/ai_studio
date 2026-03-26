전체 프로젝트를 분석했습니다. 아래에 다른 개발자가 동일한 디자인을 재현하는 데 필요한 핵심 정보를 정리해 드립니다.

1. 기술 스택
영역	기술	버전
프레임워크	React	18.3.1
라우팅	react-router (Data mode)	7.13.0
스타일링	Tailwind CSS v4	4.1.12
애니메이션	Motion (구 Framer Motion)	12.23.24
아이콘	lucide-react	0.487.0
빌드 도구	Vite	6.3.5
2. 컬러 시스템
Primary (딥 마룬)  : #8B1A2B  → CTA 버튼, 강조 텍스트, 아이콘 배경
Primary Hover      : #6d1422  → 버튼 hover 상태
Navy (다크 배경)    : #1a1a2e  → 헤더 탑바, 다크 섹션 배경, 텍스트 제목
Cream (밝은 배경)   : #faf8f6  → 섹션 교대 배경색
Soft Pink          : #e8a0a0  → 다크 배경 위 강조 텍스트, 뱃지
Gold               : #c19a3e  → 비전/미래 항목 별 아이콘
White              : #ffffff  → 카드 배경
Text Dark          : #1a1a2e / #333  → 제목/본문
Text Gray          : gray-500 ~ gray-700  → 서브 텍스트
Border             : gray-100 ~ gray-200  → 카드 테두리
다크 섹션 내부 텍스트 투명도 규칙:

제목: text-white (100%)
강조 서브: text-[#e8a0a0]
설명: text-white/60~70
부가 정보: text-white/45~50
3. 타이포그래피
폰트: Pretendard (CDN)

@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css');
font-weight 규칙 (inline style로 적용):

800 → 페이지 대제목 (h1, h2)
700 → 섹션 제목, 카드 제목, CTA 버튼
600 → 영문 라벨, 서브 CTA, 네비게이션
500 → 일반 네비게이션, 본문 강조
400 → 일반 본문
font-size 규칙 (Tailwind 클래스 대신 직접 지정):

text-[34px~38px]  → 페이지 메인 제목 (lg 브레이크포인트)
text-[26px~28px]  → 섹션 제목 (모바일)
text-[22px~24px]  → 서브 섹션 제목
text-[17px~18px]  → 카드 제목
text-[15px~16px]  → 본문, CTA 버튼
text-[14px]       → 서브 텍스트, 네비게이션
text-[13px]       → 태그, 캡션
text-[12px]       → 영문 라벨 (uppercase + tracking)
text-[11px]       → 카드 내 작은 라벨
핵심: Tailwind의 text-2xl, font-bold 등 유틸리티 클래스를 사용하지 않고, text-[00px] + style={{ fontWeight: 000 }}로 직접 제어합니다.

4. 레이아웃 원칙
최대 너비         : max-w-[1200px] mx-auto px-6
섹션 패딩         : py-20 lg:py-28 (일반), py-16 (컴팩트)
그리드 간격       : gap-5~6 (카드), gap-14~16 (콘텐츠 좌우 분할)
카드 내부 패딩    : p-7~8
반응형 그리드 패턴:

2단 분할 콘텐츠   : grid lg:grid-cols-2 gap-16 items-center
4열 카드          : grid grid-cols-2 lg:grid-cols-4 gap-5
3열 카드          : grid md:grid-cols-3 gap-6
2열 카드          : grid md:grid-cols-2 gap-6
5. 디자인 패턴 (반복되는 섹션 구조)
5-1. 히어로 섹션 (각 과정 페이지 공통)
구조: 풀와이드 이미지 + 반투명 네이비 오버레이 박스
이미지: absolute inset-0 + object-cover
오버레이: absolute inset-0 bg-black/45~50
텍스트 박스: bg-[#1a1a2e]/85 backdrop-blur-sm p-8 lg:p-12 max-w-xl
    ├─ 영문 라벨: text-[#e8a0a0] text-[12px] tracking-[0.2em] uppercase
    ├─ 대제목: text-white + text-[#e8a0a0] 강조 span
    ├─ 서브 텍스트: text-white/60
    └─ CTA 버튼: bg-[#8B1A2B] text-white
5-2. 좌우 분할 소개 섹션
구조: grid lg:grid-cols-2 gap-16 items-center
왼쪽: 영문 라벨 + 대제목 + 본문 + (선택) CTA
오른쪽: 이미지 (h-[380px] overflow-hidden object-cover)
5-3. 다크 배경 강조 섹션
배경: bg-[#1a1a2e] py-20
    ├─ 영문 라벨: text-[#e8a0a0]
    ├─ 제목: text-white + 강조 span text-[#e8a0a0]
    ├─ 불릿 리스트: CheckCircle 아이콘 + text-white/60
    └─ 카드 그리드: bg-white/5 border border-white/10 hover:bg-white/10
        └─ 아이콘: bg-[#8B1A2B]/30 rounded-full 안에 text-[#e8a0a0]
5-4. 역사/비전 2단 분할
구조: grid lg:grid-cols-2 gap-14
왼쪽 (역사): CheckCircle 아이콘 (text-[#8B1A2B]) + 항목 리스트
오른쪽 (비전): Star 아이콘 (text-[#c19a3e]) + 항목 리스트
5-5. 와이드 이미지 배너 (섹션 전환부)
구조: relative h-[280px] lg:h-[360px]
이미지: w-full h-full object-cover
오버레이: bg-[#1a1a2e]/70
중앙 텍스트: absolute inset-0 flex items-center justify-center
5-6. 강점 카드 (2x2 그리드)
구조: grid md:grid-cols-2 gap-6
카드: bg-white border border-gray-100 p-8 hover:shadow-md
    ├─ 아이콘 + 라벨: w-14 h-14 bg-[#8B1A2B] rounded-full
    ├─ 영문 라벨: text-[#8B1A2B] text-[11px] tracking-[0.15em] uppercase
    ├─ 제목: text-[#1a1a2e] text-[18px] fontWeight:800
    ├─ 서브타이틀: text-[#8B1A2B] text-[14px] fontWeight:600
    └─ 설명: text-gray-500 text-[14px]
5-7. 아웃컴/진로 카드 (3열)
구조: grid md:grid-cols-3 gap-6, text-center
카드: bg-white border border-gray-100 p-8
    ├─ 아이콘: w-16 h-16 bg-red-50 rounded-full
    ├─ 제목: text-[#1a1a2e] text-[17px] fontWeight:700
    └─ 항목: text-gray-500 text-[14px]
5-8. 최종 CTA 섹션
배경: bg-[#1a1a2e] py-20
중앙 정렬: max-w-3xl mx-auto text-center
    ├─ 제목: text-white + text-[#e8a0a0] 강조
    ├─ 설명: text-white/50
    ├─ 주 CTA: bg-[#8B1A2B] text-white px-8 py-4
    └─ 보조 CTA: border-2 border-white/20 text-white
6. 영문 라벨 패턴 (모든 섹션 공통)
<span
  className="text-[#8B1A2B] text-[12px] tracking-[0.2em] uppercase mb-4 block"
  style={{ fontWeight: 600 }}
>
  About the Course
</span>
다크 배경에서는 text-[#e8a0a0]으로 변경
항상 섹션 제목 위에 배치
7. 애니메이션 패턴
// 페이지 진입 (히어로)
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.6 }}

// 스크롤 트리거 (카드)
initial={{ opacity: 0, y: 20 }}
whileInView={{ opacity: 1, y: 0 }}
viewport={{ once: true }}
transition={{ delay: index * 0.1 }}
8. 둥근 모서리 규칙
버튼/카드     : 둥근 모서리 없음 (rounded 미적용) → 학술적·포멀한 느낌
아이콘 원      : rounded-full (원형만 예외)
네비게이션 CTA : rounded (최소한의 둥근 모서리)
드롭다운      : rounded-md
9. 파일 구조
/src
├── styles/
│   ├── fonts.css          ← Pretendard CDN import
│   ├── tailwind.css       ← Tailwind 기본
│   ├── theme.css          ← CSS 변수 + 기본 타이포그래피
│   └── index.css          ← 진입점 (위 3개 import)
└── app/
    ├── App.tsx            ← RouterProvider
    ├── routes.ts          ← createBrowserRouter 설정
    └── components/
        ├── Layout.tsx     ← Header + Outlet + Footer + Floating CTA
        ├── Header.tsx     ← 탑바 + 스티키 네비 + 드롭다운 + 모바일 메뉴
        ├── Footer.tsx     ← CTA 배너 + 4열 링크 + 저작권
        ├── HomePage.tsx   ← 히어로 슬라이더 + 과정 카드 + 통계 카운트업
        ├── AboutPage.tsx
        ├── AdmissionPage.tsx
        ├── TesolCoursePage.tsx
        ├── AiTranslationPage.tsx
        ├── AiPromptPage.tsx
        ├── AiEthicsPage.tsx
        ├── IttCoursePage.tsx
        ├── CommunityPage.tsx
        ├── ContactPage.tsx
        └── CoursePlaceholder.tsx
