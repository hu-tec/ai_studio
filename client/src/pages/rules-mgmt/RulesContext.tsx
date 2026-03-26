import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";

export const ALL_TEAMS = [
  "기획", "홈피", "영업", "마케팅", "회계", "개발", "인사",
  "관리", "상담", "총무", "강사 팀", "커리교재 팀", "문제은행", "그외",
];

export const DEPT_EMOJI: Record<string, string> = {
  기획: "📌", 홈피: "🌐", 영업: "💼", 마케팅: "📣", 회계: "🧾", 개발: "💻",
  인사: "👤", 관리: "🔧", 상담: "🎧", 총무: "🏢", "강사 팀": "🎓",
  "커리교재 팀": "📚", 문제은행: "🏦", 그외: "📂",
};

export const RANK_EMOJI: Record<string, string> = {
  신입: "🌱", 사원: "👔", 주임: "📋", 대리: "📎", 과장: "📊",
  차장: "📈", 부장: "🏅", 팀장: "⭐", 이사: "🎯", 임원: "👑",
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

interface DeptRuleSet {
  [deptName: string]: RuleSet;
}

export interface FeedbackItem {
  id: string;
  author: string;
  text: string;
  date: string;
}

export type PagePath = "/" | "/company" | "/departments" | "/ranks";

interface RulesState {
  company: RuleSet;
  departments: DeptRuleSet;
  ranks: DeptRuleSet;
}

interface RulesContextType {
  state: RulesState;
  editMode: boolean;
  toggleEditMode: () => void;
  selectedTeam: string | null;
  setSelectedTeam: (team: string | null) => void;
  addRule: (section: "company" | "departments" | "ranks", group: string | null, type: RuleType, text: string, teams?: string[]) => void;
  deleteRule: (section: "company" | "departments" | "ranks", group: string | null, type: RuleType, id: string) => void;
  updateRule: (section: "company" | "departments" | "ranks", group: string | null, type: RuleType, id: string, text: string) => void;
  updateRuleTeams: (section: "company" | "departments" | "ranks", group: string | null, type: RuleType, id: string, teams: string[]) => void;
  addAttachment: (section: "company" | "departments" | "ranks", group: string | null, type: RuleType, id: string, fileName: string) => void;
  addGroup: (section: "departments" | "ranks", name: string) => void;
  deleteGroup: (section: "departments" | "ranks", name: string) => void;
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

function createInitialState(): RulesState {
  return {
    company: {
      규정: [
        makeItem("모든 임직원은 출퇴근 시 근태관리 시스템에 기록해야 한다"),
        makeItem("업무 관련 자료의 외부 반출 시 사전 승인을 받아야 한다"),
        makeItem("고객 개인정보는 개인정보보호법에 따라 처리한다"),
        makeItem("사내 보안 서약서를 연 1회 이상 갱신해야 한다"),
        makeItem("업무용 PC에 허가되지 않은 소프트웨어 설치를 금지한다"),
        makeItem("월간 업무보고서는 매월 마지막 영업일까지 제출한다"),
      ],
      준규정: [
        makeItem("재택근무 시 업무 시작/종료 시 메신저로 보고한다"),
        makeItem("부서 간 협업 시 공유 문서를 사용하여 진행 상황을 기록한다"),
        makeItem("외부 미팅 시 회의록을 작성하여 48시간 내 공유한다"),
        makeItem("사내 메신저는 업무 시간 중 항시 접속 상태를 유지한다"),
        makeItem("분기별 자기 역량 평가서를 작성하여 팀장에게 제출한다"),
      ],
      선택사항: [
        makeItem("업무 효율화를 위한 자동화 도구 사용을 권장한다"),
        makeItem("사내 동호회 활동 참여를 장려한다"),
        makeItem("개인 업무 일지 작성을 권장한다"),
        makeItem("사내 지식 공유 세미나에 자발적으로 참여할 수 있다"),
      ],
    },
    departments: {
      기획: {
        규정: [
          makeItem("연간 사업계획서는 전년도 12월 15일까지 완성한다", ["기획"]),
          makeItem("신규 프로젝트 착수 시 기획안 승인을 받아야 한다", ["기획"]),
          makeItem("KPI 산정 기준표를 분기 초에 확정한다", ["기획"]),
        ],
        준규정: [
          makeItem("분기별 성과 보고서를 경영진에게 제출한다", ["기획"]),
          makeItem("프로젝트 일정 관리는 사내 PM 도구를 활용한다", ["기획"]),
        ],
        선택사항: [
          makeItem("시장 동향 보고서를 월간 발행할 수 있다", ["기획"]),
          makeItem("외부 컨설팅 참여를 신청할 수 있다", ["기획"]),
        ],
      },
      홈피: {
        규정: [
          makeItem("웹사이트 콘텐츠 업로드 시 검수 절차를 거쳐야 한다", ["홈피"]),
          makeItem("디자인 시스템 가이드라인을 준수해야 한다", ["홈피"]),
          makeItem("개인정보 수집 페이지는 법적 고지 사항을 포함해야 한다", ["홈피"]),
        ],
        준규정: [
          makeItem("이미지 사용 시 저작권 확인 절차를 따른다", ["홈피"]),
          makeItem("웹 접근성 점검을 분기별 1회 실시한다", ["홈피"]),
        ],
        선택사항: [
          makeItem("SEO 최적화 체크리스트를 활용할 수 있다", ["홈피"]),
          makeItem("A/B 테스트를 통한 UX 개선을 시도할 수 있다", ["홈피"]),
        ],
      },
      영업: {
        규정: [
          makeItem("고객사 계약 체결 시 법무 검토를 받아야 한다", ["영업"]),
          makeItem("할인 정책 적용은 승인 권한자의 결재를 받아야 한다", ["영업"]),
          makeItem("환불/취소 처리는 규정된 절차에 따라야 한다", ["영업"]),
        ],
        준규정: [
          makeItem("영업 실적 보고서를 주간 단위로 제출한다", ["영업"]),
          makeItem("고객 상담 내역을 CRM 시스템에 기록한다", ["영업"]),
        ],
        선택사항: [
          makeItem("제휴 파트너 발굴 활동을 자율적으로 진행할 수 있다", ["영업"]),
        ],
      },
      마케팅: {
        규정: [
          makeItem("광고 집행 시 마케팅 팀장의 사전 승인을 받아야 한다", ["마케팅"]),
          makeItem("브랜드 가이드라인(CI/BI)을 반드시 준수해야 한다", ["마케팅"]),
        ],
        준규정: [
          makeItem("SNS 콘텐츠는 사내 톤앤매너 가이드를 따른다", ["마케팅"]),
          makeItem("프로모션 기획 시 예산안을 사전 제출한다", ["마케팅"]),
        ],
        선택사항: [
          makeItem("경품 지급 이벤트를 기획할 수 있다", ["마케팅"]),
          makeItem("외부 마케팅 세미나 참여를 신청할 수 있다", ["마케팅"]),
        ],
      },
      회계: {
        규정: [
          makeItem("월별 결산 마감은 익월 5영업일 이내에 완료한다", ["회계"]),
          makeItem("전표 처리 기준에 따라 증빙 서류를 첨부해야 한다", ["회계"]),
          makeItem("부가세 신고는 법정 기한 내 완료해야 한다", ["회계"]),
        ],
        준규정: [
          makeItem("부서별 예산 편성안을 연초에 제출한다", ["회계"]),
          makeItem("초과 지출 시 사전 승인 절차를 따른다", ["회계"]),
        ],
        선택사항: [
          makeItem("세무 조사 대응 모의 훈련에 참여할 수 있다", ["회계"]),
        ],
      },
      개발: {
        규정: [
          makeItem("모든 코드는 코드 리뷰를 거친 후 머지해야 한다", ["개발"]),
          makeItem("코딩 컨벤션 가이드를 준수해야 한다", ["개발"]),
          makeItem("프로덕션 배포 시 배포 승인 절차를 따라야 한다", ["개발"]),
          makeItem("서버 보안 점검을 월 1회 이상 실시해야 한다", ["개발"]),
        ],
        준규정: [
          makeItem("API 설계 시 사내 표준 스펙을 따른다", ["개발"]),
          makeItem("백업 및 복구 정책에 따라 주간 백업을 실시한다", ["개발"]),
        ],
        선택사항: [
          makeItem("기술 부채 관리 현황을 월간 공유할 수 있다", ["개발"]),
          makeItem("사내 기술 블로그에 기고할 수 있다", ["개발"]),
        ],
      },
      인사: {
        규정: [
          makeItem("채용 프로세스는 규정된 절차에 따라 진행해야 한다", ["인사"]),
          makeItem("인사평가는 연 2회 정기적으로 실시해야 한다", ["인사"]),
        ],
        준규정: [
          makeItem("면접 평가는 표준 평가 기준표를 활용한다", ["인사"]),
          makeItem("성과급 산정 기준을 사전 공지한다", ["인사"]),
        ],
        선택사항: [
          makeItem("직원 교육 프로그램을 자율적으로 이수할 수 있다", ["인사"]),
          makeItem("복리후생 지원을 신청할 수 있다", ["인사"]),
        ],
      },
      관리: {
        규정: [
          makeItem("시스템 접근 권한은 직급/역할에 따라 부여해야 한다", ["관리"]),
          makeItem("데이터 보관 기한 규정을 준수해야 한다", ["관리"]),
          makeItem("소프트웨어 라이선스를 합법적으로 관리해야 한다", ["관리"]),
        ],
        준규정: [
          makeItem("IT 자산 관리 대장을 분기별 갱신한다", ["관리"]),
        ],
        선택사항: [
          makeItem("업무 효율화 제안을 자유롭게 제출할 수 있다", ["관리"]),
        ],
      },
      상담: {
        규정: [
          makeItem("상담 접수 시 배정 절차를 따라야 한다", ["상담"]),
          makeItem("상담 기록은 표준 양식에 따라 작성해야 한다", ["상담"]),
          makeItem("VOC 처리 기한(48시간 이내)을 준수해야 한다", ["상담"]),
        ],
        준규정: [
          makeItem("진로 상담 매뉴얼에 따라 상담을 진행한다", ["상담"]),
          makeItem("불만 접수 대응 시 표준 매뉴얼을 참고한다", ["상담"]),
        ],
        선택사항: [
          makeItem("상담 만족도 조사를 분기별 실시할 수 있다", ["상담"]),
        ],
      },
      총무: {
        규정: [
          makeItem("안전 점검 체크리스트를 월 1회 이상 실시해야 한다", ["총무"]),
        ],
        준규정: [
          makeItem("시설물 관리 지침에 따라 정기 점검을 실시한다", ["총무"]),
          makeItem("업체 선정 시 3곳 이상 비교 견적을 받는다", ["총무"]),
        ],
        선택사항: [
          makeItem("사무용품 구매를 자율적으로 신청할 수 있다", ["총무"]),
        ],
      },
      "강사 팀": {
        규정: [
          makeItem("강사 채용 및 계약은 표준 계약서를 사용해야 한다", ["강사 팀"]),
          makeItem("강사 평가는 학기별 1회 이상 실시해야 한다", ["강사 팀"]),
          makeItem("강사 수당은 규정된 지급 기준에 따라야 한다", ["강사 팀"]),
        ],
        준규정: [
          makeItem("수업 편성 가이드라인을 참고하여 시간표를 구성한다", ["강사 팀"]),
          makeItem("보강/대강 처리 시 사전 승인을 받는다", ["강사 팀"]),
        ],
        선택사항: [
          makeItem("수업 모니터링 결과를 강사에게 피드백할 수 있다", ["강사 팀"]),
          makeItem("학생 피드백 설문을 자율적으로 실시할 수 있다", ["강사 팀"]),
        ],
      },
      "커리교재 팀": {
        규정: [
          makeItem("커리큘럼 개발 시 표준 프로세스를 따라야 한다", ["커리교재 팀"]),
          makeItem("과정 개편 시 승인 절차를 거쳐야 한다", ["커리교재 팀"]),
          makeItem("교재 제작 시 가이드라인을 준수해야 한다", ["커리교재 팀"]),
        ],
        준규정: [
          makeItem("교재 검수 체크리스트를 활용하여 품질을 확인한다", ["커리교재 팀"]),
        ],
        선택사항: [
          makeItem("교재 재고 관리를 정기적으로 실시할 수 있다", ["커리교재 팀"]),
        ],
      },
      문제은행: {
        규정: [
          makeItem("출제 기준 및 난이도 분류표를 따라야 한다", ["문제은행"]),
          makeItem("문제 검수 프로세스(2인 이상 검수)를 거쳐야 한다", ["문제은행"]),
          makeItem("시험 편성 및 배포는 규정된 절차에 따라야 한다", ["문제은행"]),
        ],
        준규정: [
          makeItem("성적 처리 기준을 사전 공지하고 적용한다", ["문제은행"]),
          makeItem("문항 폐기/갱신 규정에 따라 DB를 관리한다", ["문제은행"]),
        ],
        선택사항: [
          makeItem("신규 문항 유형 개발을 제안할 수 있다", ["문제은행"]),
        ],
      },
      그외: {
        규정: [
          makeItem("사내 보안 서약 규정을 준수해야 한다", ["그외"]),
          makeItem("개인정보 처리 방침을 숙지해야 한다", ["그외"]),
        ],
        준규정: [
          makeItem("미분류 항목은 분기별 정리하여 재분류한다", ["그외"]),
        ],
        선택사항: [
          makeItem("임시 규정 등록 절차를 활용할 수 있다", ["그외"]),
        ],
      },
    },
    ranks: {
      신입: { 규정: [makeItem("입사 후 2주 이내 OJT 교육을 이수해야 한다"), makeItem("수습 기간(3개월) 동안 월간 업무 보고서를 제출해야 한다"), makeItem("멘토 배정을 받고 주 1회 면담에 참여해야 한다")], 준규정: [makeItem("사내 시스템 사용법 교육에 참여한다"), makeItem("부서 내 업무 프로세스 문서를 숙지한다")], 선택사항: [makeItem("사내 동호회에 가입할 수 있다"), makeItem("자기계발 지원 프로그램을 신청할 수 있다")] },
      사원: { 규정: [makeItem("담당 업무에 대한 주간 보고서를 제출해야 한다"), makeItem("연간 필수 교육을 이수해야 한다")], 준규정: [makeItem("업무 개선 제안을 분기별 1건 이상 제출한다"), makeItem("팀 내 지식 공유 활동에 참여한다")], 선택사항: [makeItem("외부 교육 프로그램에 참여할 수 있다")] },
      주임: { 규정: [makeItem("신입 사원 OJT 멘토링에 참여해야 한다"), makeItem("담당 프로젝트의 진행 현황을 주간 보고해야 한다")], 준규정: [makeItem("팀 내 업무 매뉴얼 갱신에 기여한다")], 선택사항: [makeItem("사내 강의/세미나 진행을 신청할 수 있다")] },
      대리: { 규정: [makeItem("팀 내 업무 배분 및 조율에 참여해야 한다"), makeItem("프로젝트 중간 보고서를 작성해야 한다")], 준규정: [makeItem("후배 직원 업무 코칭을 실시한다"), makeItem("부서 간 협업 회의에 참석한다")], 선택사항: [makeItem("리더십 교육 프로그램에 참여할 수 있다")] },
      과장: { 규정: [makeItem("팀 내 프로젝트 관리 책임을 수행해야 한다"), makeItem("분기별 팀 성과 보고서를 작성해야 한다")], 준규정: [makeItem("팀원 인사평가에 참여한다"), makeItem("예산 집행 현황을 월간 보고한다")], 선택사항: [makeItem("외부 네트워킹 활동에 참여할 수 있다")] },
      차장: { 규정: [makeItem("부서 업무 기획 및 전략 수립에 참여해야 한다"), makeItem("팀장 부재 시 업무를 대행해야 한다")], 준규정: [makeItem("부서 간 이슈 조율 역할을 수행한다")], 선택사항: [makeItem("경영 전략 세미나에 참여할 수 있다")] },
      부장: { 규정: [makeItem("부서 연간 업무 계획을 수립하고 보고해야 한다"), makeItem("부서원 인사평가를 최종 확정해야 한다"), makeItem("부서 예산을 관리하고 집행 결과를 보고해야 한다")], 준규정: [makeItem("경영진 회의에 참석하여 부서 현황을 보고한다")], 선택사항: [makeItem("사내 멘토링 프로그램의 멘토로 참여할 수 있다")] },
      팀장: { 규정: [makeItem("팀 운영 계획을 수립하고 이행해야 한다"), makeItem("팀원 근태 관리 및 승인을 처리해야 한다"), makeItem("팀 성과 목표를 설정하고 관리해야 한다")], 준규정: [makeItem("팀 내 업무 프로세스 개선을 주도한다"), makeItem("팀원 경력 개발 상담을 실시한다")], 선택사항: [makeItem("타 팀과의 합동 프로젝트를 기획할 수 있다")] },
      이사: { 규정: [makeItem("사업부 전략 수립 및 실행을 총괄해야 한다"), makeItem("이사회 보고 자료를 작성해야 한다")], 준규정: [makeItem("주요 계약 건에 대한 최종 검토를 수행한다")], 선택사항: [makeItem("외부 자문 위원 활동에 참여할 수 있다")] },
      임원: { 규정: [makeItem("회사 경영 전략 의사결정에 참여해야 한다"), makeItem("연간 경영 실적 보고를 수행해야 한다"), makeItem("주요 인사 결정에 참여해야 한다")], 준규정: [makeItem("산업 동향 분석 및 전략 제안을 수행한다"), makeItem("대외 협력 및 네트워킹 활동에 참여한다")], 선택사항: [makeItem("사내 비전/미션 공유 특강을 진행할 수 있다")] },
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

const saveRulesToServer = (state: RulesState, feedbacks: FeedbackItem[]) => {
  fetch('/api/rules', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      rule_id: 'company-rules',
      data: { companyData: state.company, deptData: state.departments, rankData: state.ranks, feedbacks },
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
          if (d.companyData) setState({ company: d.companyData, departments: d.deptData, ranks: d.rankData });
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
    (section: "company" | "departments" | "ranks", group: string | null, type: RuleType, text: string, teams?: string[]) => {
      setState((prev) => {
        const next = structuredClone(prev);
        const rs = section === "company" ? next.company : (section === "departments" ? next.departments : next.ranks)[group!];
        if (rs) rs[type].push({ id: genId(), text, teams: teams || [...ALL_TEAMS], attachments: [] });
        return next;
      });
    },
    []
  );

  const deleteRule = useCallback(
    (section: "company" | "departments" | "ranks", group: string | null, type: RuleType, id: string) => {
      setState((prev) => {
        const next = structuredClone(prev);
        const rs = section === "company" ? next.company : (section === "departments" ? next.departments : next.ranks)[group!];
        if (rs) rs[type] = rs[type].filter((r) => r.id !== id);
        return next;
      });
    },
    []
  );

  const updateRule = useCallback(
    (section: "company" | "departments" | "ranks", group: string | null, type: RuleType, id: string, text: string) => {
      setState((prev) => {
        const next = structuredClone(prev);
        const rs = section === "company" ? next.company : (section === "departments" ? next.departments : next.ranks)[group!];
        if (rs) { const item = rs[type].find((r) => r.id === id); if (item) item.text = text; }
        return next;
      });
    },
    []
  );

  const updateRuleTeams = useCallback(
    (section: "company" | "departments" | "ranks", group: string | null, type: RuleType, id: string, teams: string[]) => {
      setState((prev) => {
        const next = structuredClone(prev);
        const rs = section === "company" ? next.company : (section === "departments" ? next.departments : next.ranks)[group!];
        if (rs) { const item = rs[type].find((r) => r.id === id); if (item) item.teams = teams; }
        return next;
      });
    },
    []
  );

  const addAttachment = useCallback(
    (section: "company" | "departments" | "ranks", group: string | null, type: RuleType, id: string, fileName: string) => {
      setState((prev) => {
        const next = structuredClone(prev);
        const rs = section === "company" ? next.company : (section === "departments" ? next.departments : next.ranks)[group!];
        if (rs) { const item = rs[type].find((r) => r.id === id); if (item) item.attachments.push(fileName); }
        return next;
      });
    },
    []
  );

  const addGroup = useCallback(
    (section: "departments" | "ranks", name: string) => {
      setState((prev) => {
        const next = structuredClone(prev);
        const map = section === "departments" ? next.departments : next.ranks;
        if (!map[name]) map[name] = emptyRuleSet();
        return next;
      });
    },
    []
  );

  const deleteGroup = useCallback(
    (section: "departments" | "ranks", name: string) => {
      setState((prev) => {
        const next = structuredClone(prev);
        const map = section === "departments" ? next.departments : next.ranks;
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
