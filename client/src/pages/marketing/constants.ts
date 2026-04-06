// ============================================================
// 마케팅 타겟 DB 관리 - 데이터 상수 정의
// ============================================================

// Step 1: 홈페이지 목록
export const HOMEPAGES = [
  "AI 번역",
  "통독 (문서)",
  "교육 센터",
  "전시/행사",
  "시험 사이트",
] as const;

// Step 2: 콘텐츠 카테고리 (3단 종속 구조)
export const CATEGORY_DATA: Record<string, Record<string, string[]>> = {
  "문서 (TTT)": {
    "일반": ["비즈니스", "사업계획서", "회사소개"],
    "전문": ["법률(소송/형사/민사)", "의료", "특허", "노무"],
    "분야": ["교재", "논문", "기사", "고전", "각 업무별 전문분야"],
  },
  "음성 (TTS)": {
    "방송 및 안내": ["아나운서", "관광가이드", "큐레이터", "안내방송"],
    "강의": ["교육", "실시간", "화상수업"],
    "통역": ["순차통역", "회의통역"],
  },
  "영상 (STS)": {
    "콘텐츠": ["SNS", "유튜브", "다큐멘터리", "영화", "드라마", "예능"],
    "통역": ["동시통역", "음성통역"],
  },
  "개발": {
    "디자인": ["웹디자인", "모바일디자인", "랜딩페이지"],
    "기획": ["웹기획", "사업기획", "홍보기획"],
    "프로그램": ["백엔드", "프론트엔드", "DB", "빅데이터"],
    "보안": ["컨텐츠", "개인정보", "DB"],
  },
  "창의적 활동": {
    "예술 및 문학": ["드라마", "웹툰소설", "소설", "시", "음악", "미술"],
    "이미지 제작": ["홍보물(브로셔, 포스터)"],
  },
};

// Step 3-A: 타겟 대분류
export const TARGET_CLASSES: Record<string, string[]> = {
  "일반인": [],
  "일반인(취업/이직/커리어)": [],
  "취준생": ["대졸신입", "중고신입", "비전공 전환", "공기업/공무원", "인턴/대외활동"],
  "직장인": ["주니어", "미들", "시니어", "경력단절"],
  "대학생": ["저학년", "고학년", "휴학생", "복학생", "편입준비", "대학원준비"],
  "전문가": ["변호사", "세무사", "회계사", "노무사", "의사", "약사", "교수", "연구자", "번역가", "통역사"],
  "자영업/프리랜서": ["디자인", "영상", "강사", "카페/식음", "뷰티", "스마트스토어"],
  "주부": ["재취업", "자기계발"],
};

// Step 3-B: 연령대
export const AGE_GROUPS = [
  "10대",
  "20대 초",
  "20대 중",
  "20대 후",
  "30대",
  "40대",
  "50대+",
] as const;

// Step 3-C: 상황 카테고리 (토글 + 체크박스)
export const SITUATION_OPTIONS: Record<string, string[]> = {
  "커리어 상태": [
    "취업 준비", "이직 준비", "재직 중", "휴직/경력단절",
    "프리랜서 활동", "창업 준비", "부업/사이드프로젝트 운영",
  ],
  "학업/학습 상태": [
    "전공 탐색", "과제/리포트 많음", "공모전/대외활동 중", "팀프로젝트 중",
    "자격증 준비 중", "시험 직전(1~2주)", "장기 학습 루틴 필요", "학습 시간 부족",
  ],
  "문서/업무 상황": [
    "보고서/제안서 작성", "이메일/공지 작성", "회의록/요약 필요",
    "자료조사/리서치 필요", "고객응대/CS 템플릿 필요",
    "반복 업무 자동화 필요", "문서 품질/오탈자 리스크 있음",
  ],
  "번역/언어 상황": [
    "번역 업무 수행", "자막/영상 번역", "영문 서류 작성(지원서/이메일)",
    "용어집/스타일가이드 필요", "다국어 콘텐츠 운영", "통역 준비",
  ],
  "전문직/리스크 상황": [
    "정확성 최우선(오류 비용 큼)", "규정/컴플라이언스 고려",
    "법률/의료 고지문 필요", "개인정보/보안 주의",
    "출처·근거 표시 필요", "검수/감수 프로세스 필요",
  ],
  "의사결정/구매 단계": [
    "정보 탐색", "비교 분석", "최종 결정", "구매 후 활용",
  ],
  "감정/동기 상태": [
    "방향이 안 잡힘", "시간 압박", "완성/마감 압박",
    "자신감 부족", "반복 실패 경험",
  ],
  "실무 생산성/자동화": [
    "요약/정리 자동화", "이메일/응대 자동화", "자료조사 효율",
    "회의록 정리", "프롬프트 최적화",
  ],
  "교육/학습/성장": [
    "기초부터 단계학습", "학습 루틴/코칭", "이해 쉬운 설명",
    "과제/리포트 도움", "발표/대본/스토리",
  ],
};

// Step 3-D: 니즈 카테고리 (토글 + 체크박스)
export const NEEDS_OPTIONS: Record<string, string[]> = {
  "시험·자격·검증": [
    "자격증 필요(스펙)", "검색-SEO(구글)", "GPT(ChatGPT)", "랜딩페이지",
    "법률 고지 필수", "공신력(인증)", "책임있는AI", "오류탐지",
  ],
  "실력 검증": [
    "점수/등급 확인", "검색-SEO(네이버)", "Gemini", "서비스 소개서",
    "의료 고지 필수", "객관적 평가", "신뢰가능한AI", "환각감지", "책임승인",
  ],
  "포트폴리오/결과물": [
    "포트폴리오용 결과물", "검색광고(키워드)", "Claude", "가격/패키지 표",
    "세무회계 고지", "실무 즉시 적용", "증명가능한AI", "품질모니터링",
  ],
  "단기 합격/효율": [
    "단기 합격 전략", "리타게팅 광고", "Copilot", "FAQ",
    "투자재무 고지", "업무 효율", "검증형AI", "리스크스캐닝", "서명(승인마크)",
  ],
  "전문성/리스크 관리": [
    "모의고사/피드백", "블로그", "Perplexity", "후기/리뷰",
    "개인정보 주의", "결과물 품질 향상", "감사가능(Audit-ready)", "편향점검",
  ],
  "공신력/인증": [
    "공식 인증", "브런치", "DeepL", "사례(케이스스터디)",
    "민감정보 수집 금지", "초보 친화", "추적가능(Traceable)", "안전필터", "승인권한관리",
  ],
  "속도/생산성": [
    "문서 작성 속도", "네이버 카페", "Google Translate", "전/후 비교",
    "저작권 주의", "단계형 커리큘럼", "투명성", "민감정보탐지",
  ],
  "비용/가성비": [
    "비용 효율", "빠른 도입", "커뮤니티 피드백", "무료 진단/테스트",
  ],
};

// Step 3-E: 홍보 채널
export const CHANNELS = [
  "인스타그램(피드/릴스)",
  "유튜브(숏츠/롱폼/라이브)",
  "블로그(네이버/티스토리)",
  "링크드인",
  "페이스북",
  "X(트위터)",
  "틱톡",
  "카카오(채널/오픈채팅)",
  "슬랙/디스코드 커뮤니티",
  "브런치/미디엄",
] as const;

// Step 3-F: 사용 AI 도구
export const AI_TOOLS = [
  "ChatGPT",
  "Gemini",
  "Claude",
  "Copilot",
  "Perplexity",
  "DeepL",
  "Papago",
  "Google Translate",
  "Whisper (STT)",
  "Google TTS/STT",
  "Azure TTS",
  "Midjourney(이미지용)",
] as const;

// Step 3-G: 콘텐츠 형태
export const CONTENT_TYPES = [
  "릴스/쇼츠(숏폼)",
  "카드뉴스",
  "블로그 긴글",
  "유튜브 롱폼",
  "전자책/PDF",
  "웨비나/설명회",
  "모의고사/문제풀이",
  "템플릿/가이드",
  "사례/인터뷰",
] as const;

// ======================
// 데이터 타입 정의
// ======================
export interface MarketingEntry {
  id: string;
  homepage: string;
  category: {
    big: string;
    mid: string;
    small: string;
  };
  target_persona: {
    classes: string[];
    subclasses: string[];
    ages: string[];
    situations: Record<string, string[]>;
    needs: Record<string, string[]>;
    channel: string[];
    used_ai: string;
    content_type: string;
    exceptions: string;
  };
  marketing_copy: {
    headline: string;
    subcopy: string;
    hook: string;
    ai_prompt: string;
    points: {
      surveillance: string;
      evaluation: string;
      approval: string;
    };
  };
  created_at: string;
  updated_at: string;
}

// LocalStorage key
export const STORAGE_KEY = "marketing_db_list";

// ============================================================
// 더미 데이터 (초기 시연용)
// ============================================================
export const DUMMY_ENTRIES: MarketingEntry[] = [
  {
    id: "demo-001",
    homepage: "AI 번역",
    category: { big: "문서 (TTT)", mid: "전문", small: "법률(소송/형사/민사)" },
    target_persona: {
      classes: ["전문가"],
      subclasses: ["변호사"],
      ages: ["30대"],
      situations: {
        "번역/언어 상황": ["번역 업무 수행", "용어집/스타일가이드 필요"],
        "전문직/리스크 상황": ["정확성 최우선(오류 비용 큼)", "규정/컴플라이언스 고려", "법률/의료 고지문 필요"],
      },
      needs: {
        "전문성/리스크 관리": ["모의고사/피드백", "결과물 품질 향상", "감사가능(Audit-ready)"],
        "공신력/인증": ["공식 인증", "추적가능(Traceable)"],
      },
      channel: ["링크드인", "블로그(네이버/티스토리)"],
      used_ai: "DeepL",
      content_type: "블로그 긴글",
      exceptions: "법률 전문용어 번역 시 원문 병기 필수",
    },
    marketing_copy: {
      headline: "법률 문서, 한 글자의 오역도 허용할 수 없다면",
      subcopy: "AI 번역 + 전문 감수 프로세스로 법률 번역의 정확성과 속도를 동시에 잡으세요.",
      hook: "계약서 오역 한 줄이 수억 원의 리스크가 됩니다",
      ai_prompt: "법률 전문가 대상, 정확성/신뢰성 중심 마케팅 카피. 리스크 회피 심리를 자극하되 전문적 톤 유지",
      points: {
        surveillance: "법률 용어 오역률 모니터링 대시보드",
        evaluation: "전문 감수자 2인 크로스 체크 시스템",
        approval: "최종 법률 검토 승인 마크 부여",
      },
    },
    created_at: "2026-01-15T09:30:00.000Z",
    updated_at: "2026-02-08T14:20:00.000Z",
  },
  {
    id: "demo-002",
    homepage: "AI 번역",
    category: { big: "음성 (TTS)", mid: "통역", small: "회의통역" },
    target_persona: {
      classes: ["직장인"],
      subclasses: ["미들"],
      ages: ["30대"],
      situations: {
        "문서/업무 상황": ["회의록/요약 필요", "자료조사/리서치 필요"],
        "번역/언어 상황": ["다국어 콘텐츠 운영", "통역 준비"],
      },
      needs: {
        "속도/생산성": ["문서 작성 속도"],
        "비용/가성비": ["비용 효율", "빠른 도입"],
      },
      channel: ["링크드인", "카카오(채널/오픈채팅)"],
      used_ai: "Whisper (STT)",
      content_type: "카드뉴스",
      exceptions: "",
    },
    marketing_copy: {
      headline: "글로벌 회의, 이제 언어 장벽 없이 실시간으로",
      subcopy: "AI 동시통역으로 해외 파트너 미팅을 매끄럽게. 회의록까지 자동 생성됩니다.",
      hook: "통역사 없이도 해외 화상회의를 진행할 수 있다면?",
      ai_prompt: "글로벌 업무를 하는 직장인 대상, 효율성/비용절감 포인트 강조. 실제 업무 시나리오 기반 카피",
      points: {
        surveillance: "통역 정확도 실시간 신뢰도 지표",
        evaluation: "회의 참석자 만족도 평가",
        approval: "통역 품질 기준 충족 시 자동 승인",
      },
    },
    created_at: "2026-01-22T11:00:00.000Z",
    updated_at: "2026-02-05T16:45:00.000Z",
  },
  {
    id: "demo-003",
    homepage: "교육 센터",
    category: { big: "문서 (TTT)", mid: "분야", small: "교재" },
    target_persona: {
      classes: ["대학생"],
      subclasses: ["고학년"],
      ages: ["20대 중"],
      situations: {
        "학업/학습 상태": ["과제/리포트 많음", "자격증 준비 중", "학습 시간 부족"],
        "감정/동기 상태": ["시간 압박", "완성/마감 압박"],
      },
      needs: {
        "단기 합격/효율": ["단기 합격 전략"],
        "시험·자격·검증": ["자격증 필요(스펙)", "GPT(ChatGPT)"],
      },
      channel: ["인스타그램(피드/릴스)", "유튜브(숏츠/롱폼/라이브)", "카카오(채널/오픈채팅)"],
      used_ai: "ChatGPT",
      content_type: "릴스/쇼츠(숏폼)",
      exceptions: "",
    },
    marketing_copy: {
      headline: "시험 2주 전, AI가 만든 나만의 벼락치기 커리큘럼",
      subcopy: "학습 패턴을 분석해 취약 포인트만 집중 공략. 최소 시간으로 최대 효율을 경험하세요.",
      hook: "같은 시간 공부해도 성적이 다른 이유, AI 학습법에 있습니다",
      ai_prompt: "시험 직전 대학생 타겟, 시간 부족 + 불안 심리 공감 후 효율적 학습 솔루션 제시. 숏폼 친화적 후킹",
      points: {
        surveillance: "학습 진도율 및 취약점 자동 탐지",
        evaluation: "모의 테스트 기반 실력 진단 리포트",
        approval: "목표 점수 도달 시 학습 완료 인증",
      },
    },
    created_at: "2026-01-28T08:15:00.000Z",
    updated_at: "2026-02-10T10:30:00.000Z",
  },
  {
    id: "demo-004",
    homepage: "통독 (문서)",
    category: { big: "문서 (TTT)", mid: "일반", small: "사업계획서" },
    target_persona: {
      classes: ["자영업/프리랜서"],
      subclasses: ["스마트스토어"],
      ages: ["30대"],
      situations: {
        "커리어 상태": ["창업 준비", "부업/사이드프로젝트 운영"],
        "문서/업무 상황": ["보고서/제안서 작성", "자료조사/리서치 필요"],
      },
      needs: {
        "속도/생산성": ["문서 작성 속도"],
        "포트폴리오/결과물": ["포트폴리오용 결과물"],
        "비용/가성비": ["비용 효율", "빠른 도입"],
      },
      channel: ["유튜브(숏츠/롱폼/라이브)", "블로그(네이버/티스토리)", "카카오(채널/오픈채팅)"],
      used_ai: "ChatGPT",
      content_type: "템플릿/가이드",
      exceptions: "업종별 맞춤 템플릿 제공 필요",
    },
    marketing_copy: {
      headline: "사업계획서 3일 완성, AI가 초안부터 함께합니다",
      subcopy: "업종별 맞춤 템플릿과 AI 자동 작성으로 투자 유치용 사업계획서를 빠르게 완성하세요.",
      hook: "사업 아이디어는 있는데 사업계획서에서 막혔다면",
      ai_prompt: "소상공인/자영업자 대상, 문서 작성 부담감 해소. 쉽고 빠르게 완성 가능하다는 메시지. 실용적 톤",
      points: {
        surveillance: "문서 구조 완성도 자동 체크",
        evaluation: "업종별 벤치마크 대비 품질 평가",
        approval: "투자 심사 기준 충족 여부 확인",
      },
    },
    created_at: "2026-02-01T13:00:00.000Z",
    updated_at: "2026-02-09T09:15:00.000Z",
  },
  {
    id: "demo-005",
    homepage: "전시/행사",
    category: { big: "영상 (STS)", mid: "콘텐츠", small: "유튜브" },
    target_persona: {
      classes: ["일반인"],
      subclasses: [],
      ages: ["20대 후"],
      situations: {
        "의사결정/구매 단계": ["정보 탐색", "비교 분석"],
        "감정/동기 상태": ["방향이 안 잡힘"],
      },
      needs: {
        "비용/가성비": ["비용 효율", "커뮤니티 피드백", "무료 진단/테스트"],
      },
      channel: ["유튜브(숏츠/롱폼/라이브)", "인스타그램(피드/릴스)", "틱톡"],
      used_ai: "Gemini",
      content_type: "릴스/쇼츠(숏폼)",
      exceptions: "",
    },
    marketing_copy: {
      headline: "AI 전시회 현장, 3분 영상으로 미리 체험하세요",
      subcopy: "최신 AI 기술 트렌드를 숏폼 하이라이트로 빠르게 확인. 직접 가지 않아도 핵심만 쏙!",
      hook: "AI 전시회 가기 전에 이 영상 먼저 보세요",
      ai_prompt: "20대 일반인 타겟, 호기심/FOMO 자극. 가볍고 트렌디한 톤. 숏폼 플랫폼 최적화 카피",
      points: {
        surveillance: "영상 조회수 및 참여율 모니터링",
        evaluation: "콘텐츠 도달률 및 전환율 분석",
        approval: "브랜드 가이드라인 준수 확인",
      },
    },
    created_at: "2026-02-03T15:30:00.000Z",
    updated_at: "2026-02-11T11:00:00.000Z",
  },
  {
    id: "demo-006",
    homepage: "시험 사이트",
    category: { big: "개발", mid: "프로그램", small: "프론트엔드" },
    target_persona: {
      classes: ["취준생"],
      subclasses: ["비전공 전환"],
      ages: ["20대 후"],
      situations: {
        "커리어 상태": ["취업 준비"],
        "학업/학습 상태": ["자격증 준비 중", "장기 학습 루틴 필요"],
        "감정/동기 상태": ["자신감 부족", "반복 실패 경험"],
      },
      needs: {
        "시험·자격·검증": ["자격증 필요(스펙)", "GPT(ChatGPT)"],
        "실력 검증": ["점수/등급 확인", "객관적 평가"],
        "단기 합격/효율": ["단기 합격 전략"],
      },
      channel: ["유튜브(숏츠/롱폼/라이브)", "슬랙/디스코드 커뮤니티", "블로그(네이버/티스토리)"],
      used_ai: "ChatGPT",
      content_type: "모의고사/문제풀이",
      exceptions: "비전공자 눈높이에 맞춘 난이도 조절 필요",
    },
    marketing_copy: {
      headline: "비전공자도 합격하는 코딩 테스트, AI 맞춤 문제로 시작",
      subcopy: "실력에 맞는 문제를 AI가 골라주고, 풀이 과정까지 코칭. 혼자 공부해도 방향을 잃지 않습니다.",
      hook: "코딩 테스트 3번 떨어졌다면, 공부법이 잘못된 겁니다",
      ai_prompt: "비전공 취준생 타겟, 실패 경험 공감 + 체계적 학습 솔루션 제시. 자신감 회복 메시지 포함",
      points: {
        surveillance: "문제 풀이 정확도 및 시간 추적",
        evaluation: "실전 모의고사 등급 산출",
        approval: "목표 기업 코딩테스트 기준 통과 인증",
      },
    },
    created_at: "2026-02-05T10:00:00.000Z",
    updated_at: "2026-02-10T17:30:00.000Z",
  },
  {
    id: "demo-007",
    homepage: "AI 번역",
    category: { big: "문서 (TTT)", mid: "전문", small: "의료" },
    target_persona: {
      classes: ["전문가"],
      subclasses: ["의사"],
      ages: ["40대"],
      situations: {
        "번역/언어 상황": ["번역 업무 수행", "영문 서류 작성(지원서/이메일)"],
        "전문직/리스크 상황": ["정확성 최우선(오류 비용 큼)", "규정/컴플라이언스 고려", "출처·근거 표시 필요"],
      },
      needs: {
        "전문성/리스크 관리": ["결과물 품질 향상", "감사가능(Audit-ready)", "편향점검"],
        "공신력/인증": ["공식 인증", "추적가능(Traceable)", "안전필터"],
      },
      channel: ["링크드인", "블로그(네이버/티스토리)", "브런치/미디엄"],
      used_ai: "Claude",
      content_type: "사례/인터뷰",
      exceptions: "의학 용어 및 약품명 원문 병기, 환자 정보 비식별화 필수",
    },
    marketing_copy: {
      headline: "의료 논문 번역, 전문 용어 하나까지 정확하게",
      subcopy: "의학 전문 AI 번역 엔진이 용어 일관성을 보장하고, 전문 감수 프로세스로 신뢰도를 높입니다.",
      hook: "의료 번역 오류는 환자 안전과 직결됩니다",
      ai_prompt: "의료 전문가 대상, 안전/정확성 최우선 메시지. 권위적이면서 신뢰감 있는 톤. 리스크 최소화 강조",
      points: {
        surveillance: "의학 용어 일관성 자동 검증",
        evaluation: "전문의 감수 기반 품질 등급 평가",
        approval: "의료 문서 품질 인증 마크 발급",
      },
    },
    created_at: "2026-02-07T08:45:00.000Z",
    updated_at: "2026-02-11T08:00:00.000Z",
  },
  {
    id: "demo-008",
    homepage: "교육 센터",
    category: { big: "창의적 활동", mid: "예술 및 문학", small: "웹툰소설" },
    target_persona: {
      classes: ["주부"],
      subclasses: ["자기계발"],
      ages: ["40대"],
      situations: {
        "커리어 상태": ["부업/사이드프로젝트 운영"],
        "교육/학습/성장": ["기초부터 단계학습", "발표/대본/스토리"],
      },
      needs: {
        "비용/가성비": ["비용 효율", "무료 진단/테스트"],
        "포트폴리오/결과물": ["포트폴리오용 결과물"],
      },
      channel: ["인스타그램(피드/릴스)", "카카오(채널/오픈채팅)", "블로그(네이버/티스토리)"],
      used_ai: "ChatGPT",
      content_type: "전자책/PDF",
      exceptions: "",
    },
    marketing_copy: {
      headline: "나만의 웹소설, AI와 함께 첫 장을 열어보세요",
      subcopy: "플롯 구성부터 캐릭터 설정까지 AI가 도와드립니다. 글쓰기 경험이 없어도 괜찮아요.",
      hook: "머릿속 이야기를 꺼내지 못하고 있다면, AI가 첫 문장을 써드립니다",
      ai_prompt: "창작 입문자 대상, 심리적 장벽 낮추기. 따뜻하고 격려하는 톤. 부담 없는 시작 강조",
      points: {
        surveillance: "창작 진행률 및 일관성 체크",
        evaluation: "스토리 구조 완성도 피드백",
        approval: "출판 가능 수준 도달 시 인증",
      },
    },
    created_at: "2026-02-08T16:20:00.000Z",
    updated_at: "2026-02-11T09:00:00.000Z",
  },
];

// Helper: Load from LocalStorage (더미 데이터 포함)
export function loadEntries(): MarketingEntry[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      // 구 형식(class/subclass/age가 string) 데이터 감지 시 초기화
      if (
        parsed.length > 0 &&
        parsed[0].target_persona &&
        !Array.isArray(parsed[0].target_persona.classes)
      ) {
        saveEntries(DUMMY_ENTRIES);
        return [...DUMMY_ENTRIES];
      }
      if (parsed.length > 0) return parsed;
    }
    // localStorage가 비어있으면 더미 데이터 세팅
    saveEntries(DUMMY_ENTRIES);
    return [...DUMMY_ENTRIES];
  } catch {
    saveEntries(DUMMY_ENTRIES);
    return [...DUMMY_ENTRIES];
  }
}

// Helper: Save to LocalStorage
export function saveEntries(entries: MarketingEntry[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}
