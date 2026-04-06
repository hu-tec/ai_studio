// 3-depth grade hierarchy: 분야 → 중 → 소(급수)
export const GRADE_FIELD_OPTIONS = ["프롬", "번역", "윤리"] as const;
export const GRADE_MID_OPTIONS = ["교육", "일반", "전문"] as const;

export const GRADE_LEVELS: Record<string, string[]> = {
  교육: ["1급", "2급", "3급", "4급", "5급", "6급", "7급", "8급"],
  일반: ["1급", "2급", "3급"],
  전문: ["1급", "2급"],
};

// ─── 급수별 대상 목록 (중 + 소 기준) ───
export const GRADE_TARGETS: Record<string, Record<string, string[]>> = {
  교육: {
    "1급": ["초등"],
    "2급": ["초등"],
    "3급": ["중등"],
    "4급": ["중등"],
    "5급": ["고등"],
    "6급": ["고등"],
    "7급": ["고3+대학신입"],
    "8급": ["고3+대학신입"],
  },
  일반: {
    "1급": ["대학생"],
    "2급": ["대학생", "실무자"],
    "3급": ["실무자"],
  },
  전문: {
    "1급": [],
    "2급": [],
  },
};

// ─── 분류체계 (대분류 → 중분류 → 소분류) ───
export interface CategoryNode {
  name: string;
  children?: CategoryNode[];
}

export const CATEGORY_TREE: CategoryNode[] = [
  {
    name: "문서",
    children: [
      { name: "비즈니스" },
      { name: "사업계획서" },
      { name: "회사소개" },
      { name: "PPT" },
      { name: "엑셀" },
      { name: "기획서" },
      {
        name: "법률",
        children: [
          { name: "소송장" },
          { name: "준비서면" },
          { name: "형사" },
          { name: "민사" },
        ],
      },
      { name: "의료" },
      { name: "특허" },
      { name: "노무" },
      { name: "교재" },
      { name: "논문" },
      { name: "기사" },
      { name: "고전" },
      { name: "그외" },
    ],
  },
  {
    name: "음성",
    children: [
      { name: "아나운서" },
      { name: "관광가이드" },
      { name: "큐레이터" },
      { name: "안내 방송" },
      { name: "교육 강의" },
      { name: "실시간" },
      { name: "화상수업" },
    ],
  },
  {
    name: "영상",
    children: [
      { name: "SNS" },
      { name: "유튜브" },
      { name: "다큐멘터리" },
      { name: "영화" },
      { name: "드라마" },
      { name: "예능" },
    ],
  },
  {
    name: "개발",
    children: [
      { name: "보안" },
      { name: "AI" },
      { name: "에이전트" },
      { name: "디자인-웹, 모바일" },
      { name: "기획 - 웹" },
      { name: "웹기획" },
      { name: "홈페이지 UIUX" },
      { name: "디비(DB)" },
      { name: "빅데이터" },
      { name: "컨텐츠" },
      { name: "백엔드" },
      { name: "프론트" },
      { name: "프로그램" },
    ],
  },
  {
    name: "창의적활동",
    children: [
      { name: "드라마" },
      { name: "웹툰소설" },
      { name: "소설" },
      { name: "시" },
      { name: "음악" },
      { name: "미술" },
    ],
  },
  {
    name: "번역추가",
    children: [
      { name: "순차통역" },
      { name: "동시통역" },
      { name: "음성번역" },
      { name: "자가선택" },
    ],
  },
  {
    name: "프롬프트추가",
    children: [],
  },
  {
    name: "확장영역",
    children: [
      { name: "암" },
      { name: "요리" },
      { name: "재무" },
      { name: "주식" },
      { name: "부동산" },
      { name: "자녀" },
      { name: "연애" },
      { name: "입시" },
      { name: "사주" },
      { name: "결혼" },
      { name: "영어" },
      { name: "직장찾기" },
      { name: "운동" },
      { name: "사업" },
    ],
  },
];

// ─── 커리큘럼 키워드 데이터 (Step 3) ───

/** 공통항목 키워드 */
export const COMMON_KEYWORDS: string[] = [
  "AI 기초 이해",
  "프롬프트 기초",
  "결과 검증",
  "윤리 기초",
  "품질 관리",
  "안전/보안",
  "저작권",
  "개인정보",
  "팩트체크",
  "문서화",
];

/** AI 프롬프트 커리 전용(비공통) 키워드 */
export const PROMPT_KEYWORDS: string[] = [
  "다단계 지시",
  "조건 관리",
  "템플릿 설계",
  "체인 프롬프트",
  "시스템 프롬프트",
  "Few-shot",
  "Zero-shot",
  "컨텍스트 관리",
  "토큰 최적화",
  "에이전트 활용",
];

/** 윤리 커리 전용(비공통) 키워드 */
export const ETHICS_KEYWORDS: string[] = [
  "편향 감지",
  "허위정보 대응",
  "공정성 평가",
  "투명성",
  "책임성",
  "프라이버시",
  "레드팀",
  "공격 방어",
  "윤리 가이드라인",
  "사회적 영향",
];

/** 번역 커리 전용(비공통) 키워드 */
export const TRANSLATION_KEYWORDS: string[] = [
  "용어 관리",
  "스타일 가이드",
  "로컬라이제이션",
  "후편집(PE)",
  "CAT 도구",
  "기계번역 활용",
  "품질 평가(QA)",
  "분야별 전문용어",
  "문체 변환",
  "문화 적응",
];

/** 제목 카테고리 */
export const TITLE_CATEGORIES = ["기본 수업 커리", "실습 커리"] as const;
