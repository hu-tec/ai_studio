// ============================================
// Types
// ============================================

export interface CategoryTree {
  [major: string]: {
    [mid: string]: string[];
  };
}

/** Type A: 고정 규정 - 단순 필드 */
export interface FieldEntry {
  id: string;
  label: string;
  value: string;
  type?: "text" | "textarea" | "select";
  options?: string[];
}

/** Type B/C: 각 필드 안의 개별 아이템 (관리자가 추가/수정/삭제) */
export interface RuleItem {
  id: string;
  value: string;
  enabled: boolean;
}

/** Type B/C: 하위 규정의 필드 (각 필드에 여러 아이템 보유) */
export interface RuleField {
  id: string;
  label: string;
  fieldType: "tags" | "radio" | "checkbox";
  items: RuleItem[];
}

/** Type B/C: 하위 규정 (B-1, B-2, B-3, C-1, C-2, C-3) */
export interface SubRule {
  id: string;
  label: string;
  description: string;
  fields: RuleField[];
}

export interface RuleSet {
  typeA: FieldEntry[];
  typeBParent: RuleField[]; // 준고정 규정 자체 항목
  typeB: SubRule[]; // B-1, B-2, B-3
  typeCParent: RuleField[]; // 선택 규정 자체 항목
  typeC: SubRule[]; // C-1, C-2, C-3
}

// ============================================
// Category Tree
// ============================================

export const categoryTree: CategoryTree = {
  "영상": {
    "번역": ["일반 영상 번역", "자막 번역", "더빙 번역"],
    "편집": ["컷 편집", "색보정", "모션 그래픽"],
    "검수": ["자막 검수", "싱크 검수", "품질 검수"],
  },
  "텍스트": {
    "번역": ["법률 문서 번역", "기술 문서 번역", "마케팅 번역"],
    "교정": ["맞춤법 교정", "스타일 교정", "용어 통일"],
    "작성": ["보고서 작성", "매뉴얼 작성", "카피라이팅"],
  },
  "음성": {
    "번역": ["동시통역", "순차통역", "녹음 번역"],
    "처리": ["음성 인식", "노이즈 제거", "음성 합성"],
    "검수": ["발음 검수", "톤 검수", "내용 검수"],
  },
};

// ============================================
// Mock Rule Data Generator
// ============================================

let _idCounter = 0;
const uid = () => `f-${++_idCounter}`;

function makeFieldEntry(label: string, value: string, type: FieldEntry["type"] = "text", options?: string[]): FieldEntry {
  return { id: uid(), label, value, type, options };
}

function makeItem(value: string, enabled = true): RuleItem {
  return { id: uid(), value, enabled };
}

function makeRuleField(label: string, fieldType: RuleField["fieldType"], items: string[]): RuleField {
  return {
    id: uid(),
    label,
    fieldType,
    items: items.map((v, i) =>
      makeItem(v, fieldType === "radio" ? i === 0 : true)
    ),
  };
}

// Type A fields by context
function generateTypeA(major: string, mid: string, minor: string): FieldEntry[] {
  if (major === "영상") {
    return [
      makeFieldEntry("목적", `${minor}의 정확성과 자연스러움 확보`),
      makeFieldEntry("대상", `${mid} 관련 ${minor} 작업물`),
      makeFieldEntry("금지사항", "비속어, 차별적 표현, 저작권 침해 콘텐츠 사용 금지", "textarea"),
      makeFieldEntry("윤리 기준", "문화적 민감성 고려, 원작 의도 존중, 정치적 중립 유지", "textarea"),
      makeFieldEntry("품질 기준", "오역률 1% 미만, 자연스러운 표현, 맥락 일관성 유지"),
      makeFieldEntry("참고사항", "클라이언트 가이드라인 우선 적용, 용어집 준수"),
    ];
  } else if (major === "텍스트") {
    return [
      makeFieldEntry("목적", `${minor} 작업의 정확성과 전문성 확보`),
      makeFieldEntry("대상", `${mid} 관련 ${minor} 작업물`),
      makeFieldEntry("금지사항", "비공식 약어 사용 금지, 출처 미기재 인용 금지", "textarea"),
      makeFieldEntry("윤리 기준", "저작권 준수, 기밀 정보 보호, 표절 금지", "textarea"),
      makeFieldEntry("품질 기준", "오류율 0.5% 미만, 일관된 용어 사용, 가독성 확보"),
      makeFieldEntry("참고사항", "산업별 전문 용어집 참조, 클라이언트 스타일 가이드 준수"),
    ];
  }
  return [
    makeFieldEntry("목적", `${minor}의 품질 및 정확성 확보`),
    makeFieldEntry("대상", `${mid} 관련 ${minor} 작업물`),
    makeFieldEntry("금지사항", "품질 저해 행위 일체 금지", "textarea"),
    makeFieldEntry("윤리 기준", "전문가 윤리 기준 준수", "textarea"),
    makeFieldEntry("품질 기준", "업계 표준 품질 기준 충족"),
    makeFieldEntry("참고사항", "최신 가이드라인 참조"),
  ];
}

// Type B Parent - 준고정 규정 자체 항목
function generateTypeBParent(major: string): RuleField[] {
  if (major === "영상") {
    return [
      makeRuleField("적용 범위", "tags", ["전체 자막", "대사 자막만", "자막+캡션"]),
      makeRuleField("우선순위", "radio", ["클라이언트 설정 우선", "프로젝트 기본값 우선"]),
      makeRuleField("예외 조건", "checkbox", ["라이브 방송 제외", "광고 영상 제외"]),
    ];
  } else if (major === "텍스트") {
    return [
      makeRuleField("적용 범위", "tags", ["본문 전체", "본문+부록", "본문+각주+부록"]),
      makeRuleField("우선순위", "radio", ["원문 스타일 우선", "대상 언어 관습 우선"]),
      makeRuleField("예외 조건", "checkbox", ["법률 조항 원문 유지", "고유명사 번역 제외"]),
    ];
  }
  return [
    makeRuleField("적용 범위", "tags", ["전체 음성", "주요 화자만", "전체+배경음"]),
    makeRuleField("우선순위", "radio", ["원본 품질 우선", "가공 편의 우선"]),
    makeRuleField("예외 조건", "checkbox", ["배경 노이즈 구간 제외", "무음 구간 제외"]),
  ];
}

// Type B - 준고정 규정
function generateTypeB(major: string): SubRule[] {
  if (major === "영상") {
    return [
      {
        id: uid(),
        label: "B-1 고정",
        description: "형식, 레이아웃 등 기본 구조",
        fields: [
          makeRuleField("자막 형식", "tags", ["SRT", "VTT", "ASS", "SSA", "SUB"]),
          makeRuleField("인코딩", "tags", ["UTF-8", "EUC-KR", "ASCII", "UTF-16"]),
          makeRuleField("프레임레이트", "tags", ["23.976fps", "24fps", "25fps", "29.97fps", "30fps", "60fps"]),
          makeRuleField("해상도 기준", "tags", ["1280x720", "1920x1080", "3840x2160"]),
          makeRuleField("자막 위치", "tags", ["하단 중앙", "하단 좌측", "상단 중앙"]),
        ],
      },
      {
        id: uid(),
        label: "B-2 준고정",
        description: "B-1의 조절 가능 범위",
        fields: [
          makeRuleField("최대 줄 수", "tags", ["1줄", "2줄", "3줄"]),
          makeRuleField("줄당 최대 글자수", "tags", ["32자", "42자"]),
          makeRuleField("최소 표시 시간", "tags", ["0.8초", "1.0초"]),
          makeRuleField("최대 표시 시간", "tags", ["7.0초", "10.0초"]),
          makeRuleField("줄 간격", "tags", ["기본값", "1.5배"]),
        ],
      },
      {
        id: uid(),
        label: "B-3 선택",
        description: "추가 선택 옵션",
        fields: [
          makeRuleField("타임코드 자동조정", "radio", ["활성", "비활성"]),
          makeRuleField("화자 구분 레이블", "radio", ["사용", "미사용"]),
          makeRuleField("효과음 자막 포함", "radio", ["포함", "미포함"]),
          makeRuleField("자동 줄바꿈", "radio", ["활성", "비활성"]),
        ],
      },
    ];
  } else if (major === "텍스트") {
    return [
      {
        id: uid(),
        label: "B-1 고정",
        description: "문서 형식, 레이아웃 등 기본 구조",
        fields: [
          makeRuleField("문서 형식", "tags", ["PDF", "DOCX", "HWP", "TXT", "PPTX"]),
          makeRuleField("페이지 레이아웃", "tags", ["A4 세로", "A4 가로", "Letter 세로", "Letter 가로", "B5 세로"]),
          makeRuleField("폰트 스타일", "tags", ["나눔명조 11pt", "맑은고딕 10pt", "바탕 10pt"]),
          makeRuleField("머리말/꼬리말", "tags", ["페이지 번호 하단 중앙", "문서 제목 상단 좌측 + 페이지 번호 하단 우측", "없음"]),
          makeRuleField("여백 간격", "tags", ["상하 25mm, 좌우 30mm", "상하 20mm, 좌우 25mm", "상하 15mm, 좌우 20mm"]),
        ],
      },
      {
        id: uid(),
        label: "B-2 준고정",
        description: "B-1의 조절 가능 범위",
        fields: [
          makeRuleField("번역 일치율", "tags", ["95%", "98%", "100%"]),
          makeRuleField("표 구조 처리", "tags", ["셀 병합 유지", "셀 병합 재구성", "텍스트 변환"]),
          makeRuleField("이미지 내 텍스트", "tags", ["번역 필수", "번역 선택", "번역 제외"]),
          makeRuleField("각주/미주 처리", "tags", ["원문 유지 + 번역 추가", "번역 대체"]),
          makeRuleField("목차 자동 갱신", "radio", ["활성", "비활성"]),
        ],
      },
      {
        id: uid(),
        label: "B-3 선택",
        description: "추가 선택 옵션",
        fields: [
          makeRuleField("용어 하이라이트", "radio", ["활성", "비활성"]),
          makeRuleField("변경 추적", "radio", ["활성", "비활성"]),
          makeRuleField("주석 달기", "radio", ["활성", "비활성"]),
          makeRuleField("양식 필드 보존", "tags", ["유지", "제거", "변환"]),
        ],
      },
    ];
  }
  // 음성
  return [
    {
      id: uid(),
      label: "B-1 고정",
      description: "음성 파일 형식 및 기본 설정",
      fields: [
        makeRuleField("파일 형식", "tags", ["WAV", "MP3", "FLAC", "AAC", "OGG"]),
        makeRuleField("샘플레이트", "tags", ["22050Hz", "44100Hz", "48000Hz", "96000Hz"]),
        makeRuleField("비트 뎁스", "tags", ["16bit", "24bit", "32bit"]),
        makeRuleField("채널", "tags", ["모노", "스테레오", "5.1채널"]),
        makeRuleField("비트레이트", "tags", ["128kbps", "192kbps", "320kbps"]),
      ],
    },
    {
      id: uid(),
      label: "B-2 준고정",
      description: "B-1의 조절 가능 범위",
      fields: [
        makeRuleField("최소 음량", "tags", ["-24dB", "-18dB", "-12dB"]),
        makeRuleField("최대 음량", "tags", ["-6dB", "-3dB", "0dB"]),
        makeRuleField("무음 구간 처리", "tags", ["유지", "0.5초 이상 제거", "1초 이상 제거"]),
        makeRuleField("속도 범위", "tags", ["0.8x ~ 1.2x", "0.5x ~ 2.0x"]),
      ],
    },
    {
      id: uid(),
      label: "B-3 선택",
      description: "추가 선택 옵션",
      fields: [
        makeRuleField("노이즈 게이트", "radio", ["활성", "비활성"]),
        makeRuleField("컴프레서", "radio", ["활성", "비활성"]),
        makeRuleField("EQ 보정", "radio", ["활성", "비활성"]),
        makeRuleField("자동 레벨링", "radio", ["활성", "비활성"]),
      ],
    },
  ];
}

// Type C Parent - 선택 규정 자체 항목
function generateTypeCParent(major: string): RuleField[] {
  if (major === "영상") {
    return [
      makeRuleField("선택 조건", "tags", ["클라이언트 요청 시", "접근성 필수 프로젝트"]),
      makeRuleField("기본 상태", "tags", ["전체 비활성", "C-1만 활성"]),
      makeRuleField("추가 비용", "tags", ["옵션별 별도 과금", "패키지 포함"]),
    ];
  } else if (major === "텍스트") {
    return [
      makeRuleField("선택 조건", "tags", ["프리미엄 서비스 선택 시", "클라이언트 요청 시"]),
      makeRuleField("기본 상태", "tags", ["전체 비활성", "용어집만 활성"]),
      makeRuleField("추가 비용", "tags", ["항목별 별도 견적", "기본 요금 포함"]),
    ];
  }
  return [
    makeRuleField("선택 조건", "tags", ["고품질 패키지 선택 시", "개별 요청 시"]),
    makeRuleField("기본 상태", "tags", ["전체 비활성", "스크립트만 활성"]),
    makeRuleField("추가 비용", "tags", ["옵션별 추가 과금", "번들 할인 적용"]),
  ];
}

// Type C - 선택 규정
function generateTypeC(major: string): SubRule[] {
  if (major === "영상") {
    return [
      {
        id: uid(),
        label: "C-1 고정",
        description: "선택 시 반드시 포함되는 항목",
        fields: [
          makeRuleField("폐쇄 자막(CC)", "tags", ["KS 표준 준수", "FCC 표준 준수"]),
          makeRuleField("SDH 자막", "tags", ["청각장애인용 설명 포함", "간략 설명만"]),
          makeRuleField("오디오 디스크립션", "tags", ["시각장애인용 장면 묘사 포함", "핵심 장면만"]),
          makeRuleField("접근성 검증", "tags", ["WCAG 2.1 AA 기준", "WCAG 2.1 AAA 기준"]),
        ],
      },
      {
        id: uid(),
        label: "C-2 준고정",
        description: "C-1의 조절 가능 범위",
        fields: [
          makeRuleField("자막 색상 범위", "tags", ["흰색", "노랑", "연두", "하늘색"]),
          makeRuleField("자막 크기 범위", "tags", ["18px ~ 28px", "14px ~ 36px"]),
          makeRuleField("배경 투명도", "tags", ["60% ~ 90%", "40% ~ 100%"]),
          makeRuleField("외곽선 두께", "tags", ["1px ~ 3px", "0px ~ 5px"]),
        ],
      },
      {
        id: uid(),
        label: "C-3 선택",
        description: "추가 선택 옵션",
        fields: [
          makeRuleField("자막 애니메이션", "tags", ["없음", "페이드인", "슬라이드", "타이핑"]),
          makeRuleField("가라오케 효과", "radio", ["활성", "비활성"]),
          makeRuleField("자막 그림자", "radio", ["활성", "비활성"]),
          makeRuleField("배경 블러", "radio", ["활성", "비활성"]),
        ],
      },
    ];
  } else if (major === "텍스트") {
    return [
      {
        id: uid(),
        label: "C-1 고정",
        description: "선택 시 반드시 포함되는 항목",
        fields: [
          makeRuleField("용어집 적용", "tags", ["프로젝트 전용 용어집 필수 적용", "범용 용어집 적용"]),
          makeRuleField("TM 적용", "tags", ["기존 번역 데이터 95% 이상 활용", "기존 데이터 80% 이상 활용"]),
          makeRuleField("QA 체크리스트", "tags", ["15항목 필수 확인", "10항목 필수 확인"]),
          makeRuleField("스타일 가이드 준수", "tags", ["클라이언트 제공 가이드 필수", "자사 가이드 적용"]),
        ],
      },
      {
        id: uid(),
        label: "C-2 준고정",
        description: "C-1의 조절 가능 범위",
        fields: [
          makeRuleField("번역 톤", "tags", ["격식체", "비격식체", "중립체"]),
          makeRuleField("의역 허용 범위", "tags", ["최소", "중간", "최대"]),
          makeRuleField("현지화 수준", "tags", ["언어만", "부분 현지화", "완전 현지화"]),
          makeRuleField("단위 변환", "tags", ["원문 유지", "현지 단위 변환"]),
        ],
      },
      {
        id: uid(),
        label: "C-3 선택",
        description: "추가 선택 옵션",
        fields: [
          makeRuleField("역번역 제공", "radio", ["활성", "비활성"]),
          makeRuleField("DTP 작업", "radio", ["활성", "비활성"]),
          makeRuleField("공증 번역", "radio", ["활성", "비활성"]),
          makeRuleField("급행 처리", "radio", ["활성", "비활성"]),
        ],
      },
    ];
  }
  // 음성
  return [
    {
      id: uid(),
      label: "C-1 고정",
      description: "선택 시 반드시 포함되는 항목",
      fields: [
        makeRuleField("음성 스크립트 제공", "tags", ["타임스탬프 포함 스크립트 필수", "기본 스크립트만"]),
        makeRuleField("화자 분리", "tags", ["AI 자동 화자 분리 적용", "수동 화자 분리"]),
        makeRuleField("감정 태그", "tags", ["긍정/부정/중립 태깅 필수", "태깅 선택"]),
        makeRuleField("품질 검증", "tags", ["SNR 40dB 이상 필수", "SNR 30dB 이상"]),
      ],
    },
    {
      id: uid(),
      label: "C-2 준고정",
      description: "C-1의 조절 가능 범위",
      fields: [
        makeRuleField("화자 수 범위", "tags", ["1명 ~ 5명", "1명 ~ 10명", "제한 없음"]),
        makeRuleField("배경음 혼합 비율", "tags", ["0% ~ 10%", "0% ~ 30%"]),
        makeRuleField("속도 조절 범위", "tags", ["0.8x ~ 1.2x", "0.5x ~ 2.0x"]),
        makeRuleField("음높이 조절", "tags", ["-3 ~ +3 반음", "-5 ~ +5 반음"]),
      ],
    },
    {
      id: uid(),
      label: "C-3 선택",
      description: "추가 선택 옵션",
      fields: [
        makeRuleField("배경 음악 삽입", "radio", ["활성", "비활성"]),
        makeRuleField("효과음 삽입", "radio", ["활성", "비활성"]),
        makeRuleField("음성 변조", "radio", ["활성", "비활성"]),
        makeRuleField("ASMR 모드", "radio", ["활성", "비활성"]),
      ],
    },
  ];
}

// Main generator
export function generateRuleSet(major: string, _mid: string, minor: string): RuleSet {
  return {
    typeA: generateTypeA(major, _mid, minor),
    typeBParent: generateTypeBParent(major),
    typeB: generateTypeB(major),
    typeCParent: generateTypeCParent(major),
    typeC: generateTypeC(major),
  };
}
