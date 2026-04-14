import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";

export const ALL_TEAMS = [
  "기획", "홈피", "영업", "마케팅", "회계", "인사",
  "관리", "상담", "총무", "강사팀", "커리교재팀", "문제은행팀",
];

export const DEPT_EMOJI: Record<string, string> = {
  부서공통: "🗂️", 기획: "📌", 홈피: "🌐", 영업: "💼", 마케팅: "📣", 회계: "🧾",
  인사: "👤", 관리: "🔧", 상담: "🎧", 총무: "🏢", 강사팀: "🎓", 커리교재팀: "📚",
  문제은행팀: "🏦",
};

export const RANK_EMOJI: Record<string, string> = {
  알바: "⏱️", 신입: "🌱", 프리랜서: "💻", 강사: "🎯", 팀장: "⭐",
  센터장: "🏅", 외부거래처: "🤝", 임원: "👑",
};

export const SERVICE_EMOJI: Record<string, string> = {
  홈페이지공통: "🌐", 교육: "🎓", 번역: "🌏", "통독 문서": "📖",
  시험: "🧪", 전시회: "🖼️", "전문가 매칭": "🧭", 그외: "📂",
};

export interface RuleItem {
  id: string;
  text: string;
  teams: string[];
  attachments: string[];
}

export interface RuleSet {
  규정: RuleItem[];
  준규정: RuleItem[];
  선택사항: RuleItem[];
}

export type RuleType = "규정" | "준규정" | "선택사항";
export type SectionName = "company" | "departments" | "ranks" | "services";
export type GroupSection = "departments" | "ranks" | "services";

interface DeptRuleSet {
  [deptName: string]: RuleSet;
}

export interface FeedbackItem {
  id: string;
  author: string;
  text: string;
  date: string;
}

export type PagePath = "/" | "/company" | "/departments" | "/ranks" | "/services";

interface RulesState {
  company: RuleSet;
  departments: DeptRuleSet;
  ranks: DeptRuleSet;
  services: DeptRuleSet;
}

interface RulesContextType {
  state: RulesState;
  editMode: boolean;
  toggleEditMode: () => void;
  selectedTeam: string | null;
  setSelectedTeam: (team: string | null) => void;
  addRule: (section: SectionName, group: string | null, type: RuleType, text: string, teams?: string[]) => void;
  deleteRule: (section: SectionName, group: string | null, type: RuleType, id: string) => void;
  updateRule: (section: SectionName, group: string | null, type: RuleType, id: string, text: string) => void;
  updateRuleTeams: (section: SectionName, group: string | null, type: RuleType, id: string, teams: string[]) => void;
  addAttachment: (section: SectionName, group: string | null, type: RuleType, id: string, fileName: string) => void;
  addGroup: (section: GroupSection, name: string) => void;
  deleteGroup: (section: GroupSection, name: string) => void;
  feedbacks: FeedbackItem[];
  addFeedback: (author: string, text: string) => void;
  currentPage: PagePath;
  navigateTo: (page: PagePath) => void;
}

let idCounter = 1000;
function genId() {
  return `r_${idCounter++}`;
}

function makeItem(text: string, teams?: string[]): RuleItem {
  return { id: genId(), text, teams: teams || [...ALL_TEAMS], attachments: [] };
}

function mk(fixed: string[], semi: string[], opt: string[], teams?: string[]): RuleSet {
  return {
    규정: fixed.map((t) => makeItem(t, teams)),
    준규정: semi.map((t) => makeItem(t, teams)),
    선택사항: opt.map((t) => makeItem(t, teams)),
  };
}

function createInitialState(): RulesState {
  return {
    // 회사 전체 공통 — 가연님 인사규정 시트1 "직급 공통" (모든 구성원 공통)
    company: mk(
      [
        "1. 업무 시작·끝 업무일지 작성",
        "2. 지시·수정·회의 내용 기록",
        "3. 막힘·지연·오류 바로 공유",
        "4. 회사자료·고객정보 외부 공유 금지",
        "5. 잠수·무응답 금지",
      ],
      [
        "1. 공용폴더·파일명·버전 규칙 우선",
        "2. 보고 방식은 기본 양식 우선",
        "3. 일 순서는 기본 배정 순서 우선",
        "4. 기존 양식·템플릿·작업순서 우선",
      ],
      [
        "1. 체크리스트 추가 사용 가능",
        "2. 회의 요약본 추가 공유 가능",
        "3. 정리 가이드 추가 운영 가능",
        "4. 예시자료·샘플 추가 제공 가능",
      ]
    ),

    // 가연님 인사규정 시트2 "부서규정" (13개 그룹)
    departments: {
      부서공통: mk(
        [
          "1. 결과물 이름·상태·버전 구분",
          "2. 다른 부서 넘기기 전 정리 필수",
          "3. 회사 분류체계 그대로 사용",
          "4. 표준 양식·체크표 먼저 사용",
        ],
        [
          "1. 결과물 형식은 부서에 맞게 조정 가능",
          "2. 확인 순서·넘기는 순서 조정 가능",
          "3. 점검 주기 조정 가능",
          "4. 과목별·프로젝트별 따로 운영 가능",
        ],
        [
          "1. FAQ·사례집 운영 가능",
          "2. 현황표·요약표 운영 가능",
          "3. 테스트안 따로 운영 가능",
          "4. 인수인계 문서 따로 운영 가능",
        ]
      ),
      기획: mk(
        [
          "1. 기획안에 목적·대상·범위 꼭 넣기",
          "2. 과목·급수·기능 없는 기획안 금지",
          "3. 바뀐 안건은 영향 범위 같이 적기",
          "4. 확정 전 다른 부서 전달 금지",
        ],
        [
          "1. 기획안 목차는 규모 따라 조정 가능",
          "2. A안·B안 제시 여부 조정 가능",
          "3. 파일럿 범위 조정 가능",
          "4. 회의 올리는 순서 조정 가능",
        ],
        [
          "1. 흐름도 추가 가능",
          "2. 샘플 문구·예시 화면 추가 가능",
          "3. MVP안·확장안 같이 제시 가능",
          "4. 문서형·시트형 혼합 제출 가능",
        ],
        ["기획"]
      ),
      홈피: mk(
        [
          "1. 바뀌는 화면·문구·버튼 위치 표시",
          "2. 입력값과 관리자 출력값 맞추기",
          "3. 실서버 전 링크·버튼 꼭 확인",
          "4. 관리자 용어와 실제 용어 맞추기",
        ],
        [
          "1. 메뉴 순서 조정 가능",
          "2. 입력항목 수 조정 가능",
          "3. 테스트 범위 조정 가능",
          "4. 이벤트 페이지 기간 조정 가능",
        ],
        [
          "1. 조건별 화면 추가 가능",
          "2. 문구 A/B 테스트 가능",
          "3. 대시보드 지표 추가 가능",
          "4. 팝업·공지영역 추가 가능",
        ],
        ["홈피"]
      ),
      영업: mk(
        [
          "1. 제안 전 범위·가격 먼저 확인",
          "2. 문의 상태·후속 일정 구분",
          "3. 승인 없는 할인 약속 금지",
          "4. 확정 문구와 검토 문구 구분",
        ],
        [
          "1. 제안 순서 조정 가능",
          "2. 후속 연락 주기 조정 가능",
          "3. 패키지 구성 조정 가능",
          "4. 미팅 방식 조정 가능",
        ],
        [
          "1. 비교 견적표 제공 가능",
          "2. 샘플안·패키지안 제시 가능",
          "3. 업셀링안 제시 가능",
          "4. 후속 대상 리스트 운영 가능",
        ],
        ["영업"]
      ),
      마케팅: mk(
        [
          "1. 캠페인 목표·타깃 먼저 잡기",
          "2. 과장·오해 문구 금지",
          "3. 성과값·유입경로 기록",
          "4. 게시 전 문구·링크 재확인",
        ],
        [
          "1. 채널별 말투 조정 가능",
          "2. 예산 배분 조정 가능",
          "3. 운영 기간 조정 가능",
          "4. 지표 우선순위 조정 가능",
        ],
        [
          "1. 카드뉴스·릴스 병행 가능",
          "2. 문구·썸네일 테스트 가능",
          "3. 후기형 콘텐츠 추가 가능",
          "4. 리마케팅 운영 가능",
        ],
        ["마케팅"]
      ),
      회계: mk(
        [
          "1. 지출 근거·증빙 확인",
          "2. 승인 없는 비용 처리 금지",
          "3. 영수증·이체내역·계약 근거 맞추기",
          "4. 강사료·외주비·환불 구분",
        ],
        [
          "1. 마감 일정 조정 가능",
          "2. 정산 순서 조정 가능",
          "3. 계정과목 세부 조정 가능",
          "4. 보고 형식 조정 가능",
        ],
        [
          "1. 비용 요약표 추가 가능",
          "2. 예산 점검표 운영 가능",
          "3. 지급 히스토리표 운영 가능",
          "4. 미지급표 운영 가능",
        ],
        ["회계"]
      ),
      인사: mk(
        [
          "1. 채용·면접·수습 단계 기록",
          "2. 계약조건·소속·직급 정리",
          "3. 합격·보류·불합격 사유 구분",
          "4. 종료 시 권한 회수·자료 반환 확인",
        ],
        [
          "1. 채용 절차 순서 조정 가능",
          "2. 수습 점검 주기 조정 가능",
          "3. 평가 항목 비중 조정 가능",
          "4. 안내 방식 조정 가능",
        ],
        [
          "1. 사전과제 운영 가능",
          "2. 온보딩 자료집 추가 가능",
          "3. 인재풀 표 운영 가능",
          "4. 조직도·직무맵 정리 가능",
        ],
        ["인사"]
      ),
      관리: mk(
        [
          "1. 내부 요청 접수·배정·완료 상태 관리",
          "2. 계정 발급·변경·회수 흐름 관리",
          "3. 운영 이슈 원인·영향·조치 정리",
          "4. 공용 시스템 목록 최신화",
        ],
        [
          "1. 처리 창구 방식 조정 가능",
          "2. 요청별 처리시간 차등 가능",
          "3. 권한 그룹 세분화 조정 가능",
          "4. 정기 점검 주기 조정 가능",
        ],
        [
          "1. 운영 점검표 운영 가능",
          "2. 반복 요청 FAQ 운영 가능",
          "3. 권한 변경표 운영 가능",
          "4. 병목 정리표 운영 가능",
        ],
        ["관리"]
      ),
      상담: mk(
        [
          "1. 문의 유형·고객 상태 기록",
          "2. 미확정 내용 단정 안내 금지",
          "3. 다음 단계·재연락 일정 표시",
          "4. 불만·환불 문의 분리 처리",
        ],
        [
          "1. 상담 말투 조정 가능",
          "2. 넘기는 시점 조정 가능",
          "3. 연락 채널 조정 가능",
          "4. 처리 순서 조정 가능",
        ],
        [
          "1. 상담 요약문 발송 가능",
          "2. FAQ 추가 운영 가능",
          "3. 재문의 고객표 운영 가능",
          "4. 응대 금지 표현집 운영 가능",
        ],
        ["상담"]
      ),
      총무: mk(
        [
          "1. 비품·소모품 입출고 관리",
          "2. 계약서·인쇄물 위치 구분",
          "3. 회의실·공용장비 상태 점검",
          "4. 택배·우편 전달 기준 유지",
        ],
        [
          "1. 발주 주기 조정 가능",
          "2. 보관 방식 조정 가능",
          "3. 예약 방식 조정 가능",
          "4. 전달 순서 조정 가능",
        ],
        [
          "1. 사용 통계표 운영 가능",
          "2. 문서 라벨 규칙 운영 가능",
          "3. 공용공간 체크표 운영 가능",
          "4. 행사 준비 체크표 운영 가능",
        ],
        ["총무"]
      ),
      강사팀: mk(
        [
          "1. 강사풀 과목·급수·가능 시간 정리",
          "2. 테솔·프롬프트·AI번역·윤리 구분 운영",
          "3. 배정 전 프로필·샘플 확인",
          "4. 평가 이력·배정 이력 누적",
        ],
        [
          "1. 배정 순서 조정 가능",
          "2. 과목 겸임 여부 조정 가능",
          "3. 평가 비중 조정 가능",
          "4. 재배정 기준 조정 가능",
        ],
        [
          "1. 예비 강사풀 운영 가능",
          "2. 시범강의 운영 가능",
          "3. 우수강사표 운영 가능",
          "4. 수업 팁 공유 가능",
        ],
        ["강사팀"]
      ),
      커리교재팀: mk(
        [
          "1. 과목·급수별 교재·목표 맞추기",
          "2. 테솔·프롬프트·AI번역·윤리 교안 분리",
          "3. 개정 사유·버전 꼭 남기기",
          "4. 출처 불명 자료 반영 금지",
        ],
        [
          "1. 구성 순서 조정 가능",
          "2. 공통 틀 안에서 과목별 차이 가능",
          "3. 개정 주기 조정 가능",
          "4. 예시·연습문제 비중 조정 가능",
        ],
        [
          "1. 축약본·보충본 제작 가능",
          "2. 체험자료 제작 가능",
          "3. 개정 비교표 제작 가능",
          "4. 강사용·수강생용 요약본 제작 가능",
        ],
        ["커리교재팀"]
      ),
      문제은행팀: mk(
        [
          "1. 문항·정답·해설·난이도 분리",
          "2. 프롬프트·AI번역·윤리 문제은행 분리",
          "3. 승인 전 문항 외부 공유 금지",
          "4. 사용·폐기·수정예정 상태 구분",
        ],
        [
          "1. 문항 비율 조정 가능",
          "2. 과목 따라 문항 형식 조정 가능",
          "3. 확인 단계 조정 가능",
          "4. 교체 주기 조정 가능",
        ],
        [
          "1. 예비문항 따로 운영 가능",
          "2. 유형별 세트 구성 가능",
          "3. 오답유형표 운영 가능",
          "4. 실전형·연습형 세트 구성 가능",
        ],
        ["문제은행팀"]
      ),
    },

    // 가연님 인사규정 시트1 "직급규정" (8개 직급)
    ranks: {
      알바: mk(
        [
          "1. 보조·정리·실행 일 중심",
          "2. 가격·정책·계약 단독 안내 금지",
          "3. 최종본·원본 직접 수정 금지",
        ],
        [
          "1. 비슷한 보조 일 추가 가능",
          "2. 짧은 보고·자세한 보고 조정 가능",
          "3. 필요한 만큼만 권한 확대 가능",
          "4. 출력·정리 전담 역할 조정 가능",
        ],
        [
          "1. 반복 일 체크리스트 사용 가능",
          "2. 당일 처리내역 짧게 제출 가능",
          "3. 짧은 교육·샘플 테스트 가능",
          "4. 행사·프로젝트 보조 투입 가능",
        ]
      ),
      신입: mk(
        [
          "1. 회사 보고 방식 먼저 익히기",
          "2. 최종 제출 전 상급자 확인",
          "3. 혼자 끝까지 밀지 않기",
          "4. 적응기간엔 회사 방식 우선",
        ],
        [
          "1. 초반 보고 횟수 더 자주 가능",
          "2. 익숙한 반복 일은 확인 단계 줄일 수 있음",
          "3. 익숙해지면 맡는 일 늘릴 수 있음",
          "4. 적응 점검 방식은 부서별 조정 가능",
        ],
        [
          "1. 멘토 붙이기 가능",
          "2. 동행 보고·리허설 보고 가능",
          "3. 샘플 파일·예시 제공 가능",
          "4. 적응용 보완 가이드 제공 가능",
        ]
      ),
      프리랜서: mk(
        [
          "1. 결과물 품질·기한 직접 책임",
          "2. 맡지 않은 일 임의 추가·삭제 금지",
          "3. 초안·원본·최종본 요청 형식 제출",
        ],
        [
          "1. 작업 시간 자율 가능",
          "2. 제출 형식은 링크·파일·문서 조정 가능",
          "3. 수정 횟수는 건별 협의 가능",
          "4. 급할 때 대체 연락수단 사용 가능",
        ],
        [
          "1. 작업 전 샘플 제출 가능",
          "2. 진행 중 짧은 메모 공유 가능",
          "3. 사용 방법 같이 전달 가능",
          "4. 추가 보완·임시 회의 참여 가능",
        ]
      ),
      강사: mk(
        [
          "1. 팀 일 배분·순서·마감 책임",
          "2. 팀원 결과물 1차 확인 책임",
          "3. 지연·반복 실수 막기 책임",
          "4. 내 결정과 윗선 확인 구분 책임",
        ],
        [
          "1. 인력 상황 따라 일 나누기 조정 가능",
          "2. 회의·보고 간격 조정 가능",
          "3. 반복 일은 확인 강도 줄일 수 있음",
          "4. 집중기간 운영 방식 조정 가능",
        ],
        [
          "1. 팀 체크리스트 따로 운영 가능",
          "2. 주간 피드백 회의 가능",
          "3. 임시 담당자 지정 가능",
          "4. 팀 정리 기준 따로 만들기 가능",
        ]
      ),
      팀장: mk(
        [
          "1. 팀 일 배분·순서·마감 책임",
          "2. 팀원 결과물 1차 확인 책임",
          "3. 지연·반복 실수 막기 책임",
          "4. 내 결정과 윗선 확인 구분 책임",
        ],
        [
          "1. 인력 상황 따라 일 나누기 조정 가능",
          "2. 회의·보고 간격 조정 가능",
          "3. 반복 일은 확인 강도 줄일 수 있음",
          "4. 집중기간 운영 방식 조정 가능",
        ],
        [
          "1. 팀 체크리스트 따로 운영 가능",
          "2. 주간 피드백 회의 가능",
          "3. 임시 담당자 지정 가능",
          "4. 팀 정리 기준 따로 만들기 가능",
        ]
      ),
      센터장: mk(
        [
          "1. 인력·일정·운영 흐름 총괄",
          "2. 실적·문제·이슈 정기 점검",
          "3. 부서끼리 충돌 나면 조정",
          "4. 정리 안 된 안건 그대로 올리기 금지",
        ],
        [
          "1. 시기 따라 인력 비중 조정 가능",
          "2. 프로젝트별 협업라인 조정 가능",
          "3. 점검회의 범위 조정 가능",
          "4. 센터별 보조 지표 추가 가능",
        ],
        [
          "1. 특별 점검회의 열 수 있음",
          "2. 역할표·인수인계표 만들 수 있음",
          "3. 외부 자문 요청 가능",
          "4. 월간 운영표 추가 제출 가능",
        ]
      ),
      외부거래처: mk(
        [
          "1. 계약·발주·납기 기준대로 진행",
          "2. 범위·기한·형식 임의 변경 금지",
          "3. 받은 자료 다른 용도 사용 금지",
          "4. 회사 승인 없는 직접 협상 금지",
        ],
        [
          "1. 세부 일정은 협의해 조정 가능",
          "2. 결과물 형식은 효율 맞춰 협의 가능",
          "3. 참조 인원 범위 조정 가능",
          "4. 중간검수·최종검수 방식 조정 가능",
        ],
        [
          "1. 중간 시안 미리 제출 가능",
          "2. 일정표·수정표 추가 제출 가능",
          "3. 종료 후 사용가이드 제공 가능",
          "4. 설명회의 참여 가능",
        ]
      ),
      임원: mk(
        [
          "1. 정책·가격·계약 최종 결정",
          "2. 예외 처리 승인과 사유 기록",
          "3. 부서 해석 차이 정리",
          "4. 큰 리스크 때 중단·회수·종료 결정",
        ],
        [
          "1. 일부 승인권 아래로 넘길 수 있음",
          "2. 리스크 따라 규정 강도 조정 가능",
          "3. 급한 건 먼저 처리 후 정리 가능",
          "4. 전략 과제는 별도 승인선 가능",
        ],
        [
          "1. 특별 점검 진행 가능",
          "2. 운영 기준 교육 가능",
          "3. 전담 TF 운영 가능",
          "4. 월간·분기 리뷰 진행 가능",
        ]
      ),
    },

    // 가연님 인사규정 시트3 "홈페이지 규정" (8개 서비스 카테고리, 이사님 수정본)
    services: {
      홈페이지공통: mk(
        [
          "1. 서비스 목적·대상 표시",
          "2. 신청 전 준비자료 표시",
          "3. 진행 단계·완료 기준 표시",
          "4. 안내 문구와 실제 제공 범위 맞추기",
          "5. 과목(프롬/테솔/번역/윤리) → 급수(일반/전문/교육) → 기능(문서/영상/음성) → 분야(산업/콘텐츠/전문영역) + 번역윤리·보안 얹는 구조 유지",
          "6. 시장조사 3회 반복(주인공·컨셉·후킹·확인)",
          "7. 서비스 목적·대상, 육하원칙 내용 확인",
          "8. 신청서·전문가·FAQ·상담자료 동일성 확인",
          "9. 랜딩·카드뉴스·마케팅·영업 부문 공유",
        ],
        [
          "1. 입력항목 수 조정 가능",
          "2. 단계 수 조정 가능",
          "3. 페이지 순서 조정 가능",
          "4. 노출 정보 깊이 조정 가능",
        ],
        [
          "1. FAQ 추가 가능",
          "2. 샘플 결과물 추가 가능",
          "3. 추천 서비스 연결 가능",
          "4. 팝업·사전등록 영역 추가 가능",
        ]
      ),
      교육: mk(
        [
          "1. 대상·급수·목표 표시",
          "2. 회차·기간·진도 표시",
          "3. 과제·첨삭·수료 여부 구분",
          "4. 수강 전 준비사항 표시",
        ],
        [
          "1. 커리 순서 조정 가능",
          "2. 실시간·녹화형 조정 가능",
          "3. 과제 비중 조정 가능",
          "4. 단과·패키지 구조 조정 가능",
        ],
        [
          "1. 레벨 테스트 연결 가능",
          "2. 학습 순서 가이드 제공 가능",
          "3. 체험 강의 노출 가능",
          "4. 후속 과정 추천 가능",
        ]
      ),
      번역: mk(
        [
          "1. 원문 109개 언어·번역 언어 표시",
          "2. 번역 목적·문체 입력 받기",
          "3. 파일 형식·분량·기한 표시",
          "4. 결과물 범위 구분",
        ],
        [
          "1. 문서형·통역형 구분 조정 가능",
          "2. 일반·긴급 납기 구분 조정 가능",
          "3. 번역·교정·감수 단계 조정 가능",
          "4. 용어집 반영 범위 조정 가능",
        ],
        [
          "1. 샘플 번역본 노출 가능",
          "2. 긴급 옵션 추가 가능",
          "3. 참고자료 첨부 기능 가능",
          "4. 후속 교정 요청 가능",
        ]
      ),
      "통독 문서": mk(
        [
          "1. 원문 범위·쪽수 표시",
          "2. 결과물 종류 구분",
          "3. 전달 단위 표시",
          "4. 원문 판독 가능 상태 확인",
        ],
        [
          "1. 해설 깊이 조정 가능",
          "2. 한 번 전달·나눠 전달 조정 가능",
          "3. 문서형·표형 조정 가능",
          "4. 용어 설명 비중 조정 가능",
        ],
        [
          "1. 하이라이트본 제공 가능",
          "2. 질문정리표 제공 가능",
          "3. 장별 요약표 제공 가능",
          "4. 복습용 정리본 제공 가능",
        ]
      ),
      시험: mk(
        [
          "1. 응시 조건·합격 기준 표시",
          "2. 시험 형식·시간 표시",
          "3. 결과 안내 방식 구분",
          "4. 재응시·유효기간 표시",
        ],
        [
          "1. 문항 비율 조정 가능",
          "2. 모의·정규·실전형 조정 가능",
          "3. 결과 제공 시점 조정 가능",
          "4. 접수 회차 구조 조정 가능",
        ],
        [
          "1. 예시 문항 제공 가능",
          "2. 응시 전 체크표 제공 가능",
          "3. 성적 분석표 제공 가능",
          "4. 후속 교육 추천 가능",
        ]
      ),
      전시회: mk(
        [
          "1. 주제·기간·장소 표시",
          "2. 입장·예약 방식 표시",
          "3. 작가·작품·행사 정보 구분",
          "4. 촬영·연령·관람 주의사항 표시",
        ],
        [
          "1. 회차형·자유관람형 조정 가능",
          "2. 페이지 구성 중심 조정 가능",
          "3. 온라인·오프라인 정보 비중 조정 가능",
          "4. 공지영역 운영 기간 조정 가능",
        ],
        [
          "1. 전시장 맵 제공 가능",
          "2. 작가 인터뷰 노출 가능",
          "3. 워크숍·도슨트 신청 추가 가능",
          "4. 후기·뉴스레터 연결 가능",
        ]
      ),
      "전문가 매칭": mk(
        [
          "1. 요청 분야·목적·조건 입력 받기",
          "2. 전문가 프로필 핵심 항목 표시",
          "3. 매칭은 추천 구조임을 표시",
          "4. 신청→검토→추천→연결 단계 구분",
        ],
        [
          "1. 매칭 기준 조정 가능",
          "2. 리스트형·추천형 조정 가능",
          "3. 질문지 깊이 조정 가능",
          "4. 공개 정보 범위 조정 가능",
        ],
        [
          "1. 전문가 비교표 제공 가능",
          "2. 자료 업로드 기능 가능",
          "3. 재매칭 요청 가능",
          "4. 테마별 추천 운영 가능",
        ]
      ),
      그외: mk(
        [
          "1. 임시 서비스 상태 표시",
          "2. 포함·제외 범위 구분",
          "3. 신청 후 개별 확인 구조 표시",
          "4. 파일럿·맞춤형 여부 표시",
        ],
        [
          "1. 임시 카테고리명 조정 가능",
          "2. 입력폼 구조 조정 가능",
          "3. 노출 기간 조정 가능",
          "4. 대표 서비스 연결 여부 조정 가능",
        ],
        [
          "1. 사전 등록 기능 가능",
          "2. 참고자료 첨부 기능 가능",
          "3. 추천 서비스 연결 가능",
          "4. 파일럿 참여 모집 가능",
        ]
      ),
    },
  };
}

const RulesContext = createContext<RulesContextType | null>(null);

export function useRules() {
  const ctx = useContext(RulesContext);
  if (!ctx) throw new Error("useRules must be inside RulesProvider");
  return ctx;
}

function emptyRuleSet(): RuleSet {
  return { 규정: [], 준규정: [], 선택사항: [] };
}

function pickRuleSet(state: RulesState, section: SectionName, group: string | null): RuleSet | undefined {
  if (section === "company") return state.company;
  const map = section === "departments" ? state.departments : section === "ranks" ? state.ranks : state.services;
  return group ? map[group] : undefined;
}

const saveRulesToServer = (state: RulesState, feedbacks: FeedbackItem[]) => {
  fetch('/api/rules', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      rule_id: 'company-rules',
      data: {
        companyData: state.company,
        deptData: state.departments,
        rankData: state.ranks,
        serviceData: state.services,
        feedbacks,
      },
    }),
  }).catch(() => {});
};

export function RulesProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<RulesState>(createInitialState);
  const [editMode, setEditMode] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<PagePath>("/");
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([
    { id: "fb1", author: "김민수 (개발팀)", text: "코드 리뷰 프로세스에서 긴급 핫픽스 예외 조항이 필요합니다.", date: "2026-03-04" },
    { id: "fb2", author: "이지현 (마케팅팀)", text: "SNS 콘텐츠 가이드라인이 너무 제한적입니다. 완화를 요청드립니다.", date: "2026-03-05" },
    { id: "fb3", author: "박성호 (영업팀)", text: "할인 정책 승인 절차가 영업 현장에서 너무 오래 걸립니다. 간소화 검토 부탁드립니다.", date: "2026-03-06" },
  ]);
  const loadedRef = useRef(false);

  // Load from API on mount
  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;
    fetch('/api/rules/company-rules')
      .then((r) => r.json())
      .then((row: any) => {
        if (row && row.data) {
          const d = row.data;
          if (d.companyData) {
            setState({
              company: d.companyData,
              departments: d.deptData || {},
              ranks: d.rankData || {},
              services: d.serviceData || createInitialState().services,
            });
          }
          if (d.feedbacks) setFeedbacks(d.feedbacks);
        }
      })
      .catch(() => {});
  }, []);

  // Save to API on changes (skip initial render)
  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) { isInitialMount.current = false; return; }
    saveRulesToServer(state, feedbacks);
  }, [state, feedbacks]);

  const toggleEditMode = useCallback(() => setEditMode((p) => !p), []);
  const navigateTo = useCallback((page: PagePath) => setCurrentPage(page), []);

  const addRule = useCallback(
    (section: SectionName, group: string | null, type: RuleType, text: string, teams?: string[]) => {
      setState((prev) => {
        const next = structuredClone(prev);
        const rs = pickRuleSet(next, section, group);
        if (rs) rs[type].push({ id: genId(), text, teams: teams || [...ALL_TEAMS], attachments: [] });
        return next;
      });
    },
    []
  );

  const deleteRule = useCallback(
    (section: SectionName, group: string | null, type: RuleType, id: string) => {
      setState((prev) => {
        const next = structuredClone(prev);
        const rs = pickRuleSet(next, section, group);
        if (rs) rs[type] = rs[type].filter((r) => r.id !== id);
        return next;
      });
    },
    []
  );

  const updateRule = useCallback(
    (section: SectionName, group: string | null, type: RuleType, id: string, text: string) => {
      setState((prev) => {
        const next = structuredClone(prev);
        const rs = pickRuleSet(next, section, group);
        if (rs) { const item = rs[type].find((r) => r.id === id); if (item) item.text = text; }
        return next;
      });
    },
    []
  );

  const updateRuleTeams = useCallback(
    (section: SectionName, group: string | null, type: RuleType, id: string, teams: string[]) => {
      setState((prev) => {
        const next = structuredClone(prev);
        const rs = pickRuleSet(next, section, group);
        if (rs) { const item = rs[type].find((r) => r.id === id); if (item) item.teams = teams; }
        return next;
      });
    },
    []
  );

  const addAttachment = useCallback(
    (section: SectionName, group: string | null, type: RuleType, id: string, fileName: string) => {
      setState((prev) => {
        const next = structuredClone(prev);
        const rs = pickRuleSet(next, section, group);
        if (rs) { const item = rs[type].find((r) => r.id === id); if (item) item.attachments.push(fileName); }
        return next;
      });
    },
    []
  );

  const addGroup = useCallback(
    (section: GroupSection, name: string) => {
      setState((prev) => {
        const next = structuredClone(prev);
        const map = section === "departments" ? next.departments : section === "ranks" ? next.ranks : next.services;
        if (!map[name]) map[name] = emptyRuleSet();
        return next;
      });
    },
    []
  );

  const deleteGroup = useCallback(
    (section: GroupSection, name: string) => {
      setState((prev) => {
        const next = structuredClone(prev);
        const map = section === "departments" ? next.departments : section === "ranks" ? next.ranks : next.services;
        delete map[name];
        return next;
      });
    },
    []
  );

  const addFeedback = useCallback((author: string, text: string) => {
    setFeedbacks((prev) => [
      ...prev,
      { id: genId(), author, text, date: new Date().toISOString().slice(0, 10) },
    ]);
  }, []);

  return (
    <RulesContext.Provider
      value={{
        state, editMode, toggleEditMode, selectedTeam, setSelectedTeam,
        addRule, deleteRule, updateRule, updateRuleTeams, addAttachment,
        addGroup, deleteGroup, feedbacks, addFeedback, currentPage, navigateTo,
      }}
    >
      {children}
    </RulesContext.Provider>
  );
}
