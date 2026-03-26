import imgCalendar from "figma:asset/940411f6c0d02d0c73e6a9b5fe529ee8f659baa1.png";
import imgForm from "figma:asset/3c5d17d0908842c23ebcb611dab514479fb44a98.png";
import imgInterview from "figma:asset/05058dcf8f8597731b21ab0d89bd99b02737b900.png";
import imgStats from "figma:asset/30754d8fea35d4da637aa647085e74c718044612.png";
import imgList from "figma:asset/33bd9c54c3f5d137768e0153fcf80f36342458ff.png";
import imgBoard from "figma:asset/79fa15522524b503ac901b7344fb03b503944cf4.png";

export interface PromptSample {
  id: string;
  date: string;
  title: string;
  category: 'UIUX' | 'DB' | '홈페이지' | '관리자페이지';
  summary: string;
  primaryPrompt: string;
  supplementaryPrompts: string[];
  keyPoint: string;
  imageUrl: string;
  requirements?: string[];
}

export const promptSamples: PromptSample[] = [
  {
    id: '1',
    date: '2026-03-13',
    title: '웹 배포용 홈페이지 디자인',
    category: 'UIUX',
    summary: '외부 공개용 디자인 완성도 중심의 사용자 경험 최적화 홈페이지',
    primaryPrompt: '외부 공개용 홈페이지를 제작하려고 해. 디자인 완성도가 가장 중요하고 사용자 경험(UX)을 최우선으로 고려해줘.',
    supplementaryPrompts: [
      '헤더 메뉴 구성 및 페이지 연결 기능을 추가해줘. 각 메뉴 클릭 시 독립 페이지로 진입하고 펼쳐보기 세부 목록이 보여야 해.',
      '대/중/소분류 카드형 신청 페이지를 만들어줘. 분야별 카드 클릭 시 신청 폼이 활성화되고 계층 필터와 연동되게 해줘.'
    ],
    keyPoint: '버전별 비교를 통한 통합 최적안 도출 및 렌딩페이지 인터랙션 강화',
    imageUrl: imgForm,
    requirements: [
      '헤더 메뉴 구성 및 페이지 연결',
      '대·중·소분류 카드형 신청 페이지',
      '랜딩페이지 인터랙션 효과 (5가지 교육과정)',
      '레퍼런스 사이트 벤치마킹 (특정 URL 컬러감)',
      'FAQ / Q&A 필터링 기능',
      '신청 폼 연동 (번역-견적-전문가)',
      '버전별 비교 → 통합 최적안 도출'
    ]
  },
  {
    id: '2',
    date: '2026-03-13',
    title: '데이터베이스 관리 프로그램',
    category: 'DB',
    summary: '규정, 커리큘럼 등 데이터 보관 및 관리 중심의 고도화 시스템',
    primaryPrompt: '우리 기관의 규정과 커리큘럼 데이터를 체계적으로 관리할 수 있는 DB 프로그램을 구축해줘.',
    supplementaryPrompts: [
      '규정/준규정/선택규정/분야규정 4단 구성을 만들어줘. 각 구역에 체크박스, 라디오, 주관식, 4지선다 입력이 가능해야 해.',
      '중첩 규정 펼쳐보기 구조를 적용해줘. 규정 안에 또 규정이 있을 수 있는 계층형 버튼이 필요해.'
    ],
    keyPoint: '결과물 추출 화면 및 History 반영, 엑셀/워드/이미지 다운로드 지원',
    imageUrl: imgList,
    requirements: [
      '규정 / 준규정 / 선택규정 / 분야규정 4단',
      '중첩 규정 펼쳐보기 구조',
      '결과물 추출 화면 + history 반영',
      '공통 레이아웃 프레임 통일',
      '프롬프트 샘플 카드형 대시보드',
      '대·중·소분류 필터 (AI창작소)',
      '엑셀 / 워드 / 이미지 다운로드',
      '즐겨찾기 / 보관함 / 세팅 우측 메뉴바'
    ]
  },
  {
    id: '3',
    date: '2026-03-13',
    title: '관리자용 업무 프로그램',
    category: '홈페이지',
    summary: '내부 직원 및 관리자 전용 기능 중심 대시보드 시스템',
    primaryPrompt: '내부 직원들이 업무 효율을 높일 수 있는 관리자 전용 대시보드를 만들어줘. 기능 구현이 최우선이야.',
    supplementaryPrompts: [
      '개별/전체 선택 체크박스 기능을 넣어줘. 카드와 리스트 각각 체크하고 일괄 처리할 수 있어야 해.',
      '숫자 입력창과 통계 그래프를 시각화해줘. 수치가 중요한 DB는 전체/개별 통계와 그래프 3종이 필수야.'
    ],
    keyPoint: '실시간 미리보기 및 등급 자동 반영, 캘린더형 대시보드(미팅 신청) 연동',
    imageUrl: imgCalendar,
    requirements: [
      '개별 / 전체 선택 체크박스',
      '숫자 입력창 + 통계 + 그래프 시각화',
      '실시간 미리보기 / 등급 자동 반영',
      '필터 조회 기능 (각 요소별)',
      '면접 / 출퇴근 / 스케줄 이중 구조',
      '링크 공유 / 신청폼 외부 전달',
      '자동 계산 연동 (시간·금액·등급)',
      '캘린더형 대시보드 (미팅 신청)',
      '이모지 색 완화 요청 (톤 다운)'
    ]
  },
  {
    id: '4',
    date: '2026-03-13',
    title: '공통 레이아웃 규정',
    category: '관리자페이지',
    summary: '모든 카테고리에 반복 적용되는 핵심 UIUX 가이드라인',
    primaryPrompt: '우리 프로젝트 전체에 적용될 공통 레이아웃 규정을 정리해줘. 모든 화면에서 일관된 경험을 주는 것이 목적이야.',
    supplementaryPrompts: [
      '1행 4단 구성(카드 4개 배치)을 기본으로 해줘. 모든 화면에서 가로로 4개의 구역이 배치되게.',
      '이모지 사용 시 화려한 컬러를 금지하고 가독성을 향상시키는 톤 다운된 색상을 사용해줘.'
    ],
    keyPoint: '한 화면 구현(Max-w 1800~1900) 및 여백 최소화로 스크롤 없는 전체 파악 가능',
    imageUrl: imgStats,
    requirements: [
      '규정 / 준규정 / 선택규정 구분 (3단계)',
      '1행 4단 구성 (카드 4개 배치)',
      '이모지 사용 (화려한 컬러 금지)',
      '엑셀 / 워드 개별 다운로드 버튼',
      '수정 / 추가 / 삭제 모드 변환 버튼',
      '대분류 / 중분류 / 소분류 복수선택',
      '한 화면 구현 + 여백 최소화',
      '대시보드 3요소 (통계/목록전환/세부보기)',
      '미리보기 / 요약 미니창',
      '모든 버튼 활성화 요청'
    ]
  }
];
