/* ──────────────────────────────────────────────────────
   3단 구조: 고정(A) / 준고정(B) / 선택(C)

   A (고정)   — 무조건 적용, 변경 불가, 단순 KV
   B (준고정) — 기본 적용, 조건부 변경 가능
     ├ B-공통  : 묶음 전체 설정
     ├ B-1 확정 : 선택하면 반드시 따라옴
     ├ B-2 조절 : 파라미터 범위 조정 가능
     └ B-3 옵션 : 있어도 되고 없어도 됨
   C (선택)   — 기본 미적용, 필요 시 켜기
     ├ C-공통  : 묶음 전체 설정
     ├ C-1 확정
     ├ C-2 조절
     └ C-3 옵션
   ────────────────────────────────────────────────────── */

export interface FieldItem {
  id: string;
  label: string;
  type: "text" | "date" | "textarea" | "select" | "number";
  placeholder?: string;
  options?: string[];
}

export interface DepthLevel {
  key: string;            // "common" | "confirmed" | "adjustable" | "option"
  label: string;          // "공통" | "확정" | "조절" | "옵션"
  description: string;
  suggestedFields: FieldItem[];
}

export interface FixedSection {
  type: "fixed";
  title: string;
  description: string;
  fields: FieldItem[];    // 항상 표시, 제거 불가
}

export interface DepthSection {
  type: "semifixed" | "optional";
  title: string;
  description: string;
  depths: DepthLevel[];
}

export type DocSection = FixedSection | DepthSection;

export interface DocumentTemplate {
  sections: [FixedSection, DepthSection, DepthSection];  // A, B, C
  guide: string[];
}

/* ──────────────── 공통 필드 풀 ──────────────── */

const f = {
  name:       { id: "name",       label: "성명",        type: "text"     as const, placeholder: "홍길동" },
  empId:      { id: "empId",      label: "사번",        type: "text"     as const, placeholder: "EMP-2024-001" },
  dept:       { id: "dept",       label: "소속 부서",    type: "text"     as const, placeholder: "예: 개발팀" },
  position:   { id: "position",   label: "직위/직책",    type: "text"     as const, placeholder: "예: 대리" },
  issueDate:  { id: "issueDate",  label: "발급일",      type: "date"     as const },
  joinDate:   { id: "joinDate",   label: "입사일",      type: "date"     as const },
  endDate:    { id: "endDate",    label: "퇴사일",      type: "date"     as const },
  empType:    { id: "empType",    label: "고용 형태",    type: "select"   as const, options: ["정직원","계약직","파트타임","프리랜서"] },
  purpose:    { id: "purpose",    label: "발급 목적/용도", type: "text"   as const, placeholder: "예: 비자 신청용" },
  receiver:   { id: "receiver",   label: "수신처",       type: "text"    as const, placeholder: "예: ○○기관" },
  note:       { id: "note",       label: "비고",         type: "textarea" as const, placeholder: "추가 참고 사항" },
  phone:      { id: "phone",      label: "연락처",       type: "text"    as const, placeholder: "010-0000-0000" },
  email:      { id: "email",      label: "이메일",       type: "text"    as const, placeholder: "email@example.com" },
  address:    { id: "address",    label: "주소",         type: "text"    as const, placeholder: "거주지 주소" },
  birthDate:  { id: "birthDate",  label: "생년월일",     type: "date"    as const },
  salary:     { id: "salary",     label: "급여/보수",    type: "text"    as const, placeholder: "예: 월 3,000,000원" },
  workHours:  { id: "workHours",  label: "근무 시간",    type: "text"    as const, placeholder: "09:00~18:00" },
  workDays:   { id: "workDays",   label: "근무 요일",    type: "text"    as const, placeholder: "월~금" },
  probation:  { id: "probation",  label: "수습 기간",    type: "text"    as const, placeholder: "예: 3개월" },
  specTerms:  { id: "specTerms",  label: "특약 사항",    type: "textarea" as const, placeholder: "특별 약정 내용" },
  author:     { id: "author",     label: "작성자",       type: "text"    as const, placeholder: "작성자 이름" },
  reportDate: { id: "reportDate", label: "보고 일자",    type: "date"    as const },
  planDate:   { id: "planDate",   label: "작성 일자",    type: "date"    as const },
  periodS:    { id: "periodS",    label: "기간 시작일",   type: "date"   as const },
  periodE:    { id: "periodE",    label: "기간 종료일",   type: "date"   as const },
  summary:    { id: "summary",    label: "요약/개요",    type: "textarea" as const, placeholder: "핵심 요약" },
  content:    { id: "content",    label: "상세 내용",    type: "textarea" as const, placeholder: "본문 내용" },
  conclusion: { id: "conclusion", label: "결론/제안",    type: "textarea" as const, placeholder: "향후 개선 사항" },
  attachment: { id: "attachment", label: "첨부 파일명",   type: "text"   as const, placeholder: "파일명" },
  objective:  { id: "objective",  label: "목적/목표",    type: "textarea" as const, placeholder: "목적과 목표" },
  details:    { id: "details",    label: "세부 실행 내용", type: "textarea" as const, placeholder: "구체적 실행 방안" },
  budget:     { id: "budget",     label: "예산",         type: "text"    as const, placeholder: "예: 5,000,000원" },
  expected:   { id: "expected",   label: "기대 효과",     type: "textarea" as const, placeholder: "기대 성과" },
  title:      { id: "docTitle",   label: "문서 제목",     type: "text"   as const, placeholder: "제목을 입력하세요" },
  resignDate: { id: "resignDate", label: "희망 퇴사일",   type: "date"   as const },
  reason:     { id: "reason",     label: "사직 사유",     type: "select" as const, options: ["개인 사유","건강 문제","학업","이직","가사","기타"] },
  reasonDtl:  { id: "reasonDtl",  label: "상세 사유",     type: "textarea" as const, placeholder: "구체적 사유" },
  handover:   { id: "handover",   label: "인수인계 계획",  type: "textarea" as const, placeholder: "인수인계 일정과 내용" },
  payMonth:   { id: "payMonth",   label: "급여 해당 월",   type: "text"  as const, placeholder: "예: 2026년 3월" },
  baseSalary: { id: "baseSalary", label: "기본급",        type: "number" as const, placeholder: "숫자만 입력" },
  overtime:   { id: "overtime",   label: "시간외 수당",    type: "number" as const, placeholder: "숫자만 입력" },
  bonus:      { id: "bonus",      label: "상여금",        type: "number" as const, placeholder: "숫자만 입력" },
  deduction:  { id: "deduction",  label: "공제 합계",     type: "number" as const, placeholder: "숫자만 입력" },
  mealAllow:  { id: "mealAllow",  label: "식대",          type: "number" as const, placeholder: "숫자만 입력" },
  transAllow: { id: "transAllow", label: "교통비",        type: "number" as const, placeholder: "숫자만 입력" },
  version:    { id: "version",    label: "버전",          type: "text"   as const, placeholder: "v1.0" },
  logoUsage:  { id: "logoUsage",  label: "로고 사용 규정", type: "textarea" as const, placeholder: "로고 가이드라인" },
  colorSpec:  { id: "colorSpec",  label: "색상 규격",      type: "textarea" as const, placeholder: "색상 코드" },
  fontSpec:   { id: "fontSpec",   label: "폰트/타이포그래피", type: "textarea" as const, placeholder: "폰트 규격" },
  tmplNote:   { id: "tmplNote",   label: "템플릿 참고",    type: "textarea" as const, placeholder: "레이아웃 안내" },
  compName:   { id: "compName",   label: "거래처명",       type: "text"   as const, placeholder: "회사명" },
  contPerson: { id: "contPerson", label: "담당자명",       type: "text"   as const, placeholder: "담당자" },
  contPhone:  { id: "contPhone",  label: "거래처 연락처",   type: "text"  as const, placeholder: "02-000-0000" },
  contEmail:  { id: "contEmail",  label: "거래처 이메일",   type: "text"  as const, placeholder: "example@co.kr" },
  bizType:    { id: "bizType",    label: "업종/분야",      type: "text"   as const, placeholder: "IT 서비스" },
  contStatus: { id: "contStatus", label: "계약 상태",      type: "select" as const, options: ["계약 전","진행 중","완료","만료"] },
  bankInfo:   { id: "bankInfo",   label: "입금 계좌 정보",  type: "text"  as const, placeholder: "은행명 + 계좌번호" },
  certField:  { id: "certField",  label: "인증 분야",      type: "text"  as const, placeholder: "영한 번역 등" },
  certNo:     { id: "certNo",     label: "인증 번호",      type: "text"  as const, placeholder: "CERT-2026-001" },
  certLevel:  { id: "certLevel",  label: "인증 등급",      type: "select" as const, options: ["초급","중급","고급","전문가"] },
  validS:     { id: "validS",     label: "유효 시작일",    type: "date"   as const },
  validE:     { id: "validE",     label: "유효 만료일",    type: "date"   as const },
  certDtl:    { id: "certDtl",    label: "인증 상세 내역",  type: "textarea" as const, placeholder: "인증 범위와 조건" },
  // 상담 전용
  counselor:  { id: "counselor",  label: "상담사",         type: "text"   as const, placeholder: "상담사 이름" },
  counselDate:{ id: "counselDate",label: "상담 일자",      type: "date"   as const },
  counselType:{ id: "counselType",label: "상담 유형",      type: "select" as const, options: ["온라인","방문","불만접수","레벨테스트 예약","레벨테스트 완료"] },
  clientName: { id: "clientName", label: "고객/학생명",    type: "text"   as const, placeholder: "이름" },
  clientPhone:{ id: "clientPhone",label: "고객 연락처",    type: "text"   as const, placeholder: "010-0000-0000" },
  counselCont:{ id: "counselCont",label: "상담 내용",      type: "textarea" as const, placeholder: "상세 기재" },
  counselRes: { id: "counselRes", label: "상담 결과/조치",  type: "textarea" as const, placeholder: "결과와 후속 조치" },
  followUp:   { id: "followUp",   label: "후속 상담 일자",  type: "date"  as const },
  contractS:  { id: "contractS",  label: "계약 시작일",    type: "date"   as const },
  contractE:  { id: "contractE",  label: "계약 종료일",    type: "date"   as const },
};


/* ═══════════════════════════════════════════════════════
   템플릿 정의
   ═══════════════════════════════════════════════════════ */

const certificateTemplate: DocumentTemplate = {
  sections: [
    {
      type: "fixed",
      title: "A. 고정 (Fixed)",
      description: "변경 불가 — 반드시 포함되는 핵심 인적사항입니다.",
      fields: [f.name, f.empId, f.dept, f.position, f.issueDate],
    },
    {
      type: "semifixed",
      title: "B. 준고정 (Semi-fixed)",
      description: "기본 적용 · 조건부 변경 가능 — 증명서에 표기되는 근무 정보입니다.",
      depths: [
        { key: "common",     label: "공통",  description: "이 묶음 전체에 걸리는 설정", suggestedFields: [f.empType] },
        { key: "confirmed",  label: "확정",  description: "선택하면 반드시 따라오는 항목", suggestedFields: [f.joinDate, f.endDate] },
        { key: "adjustable", label: "조절",  description: "파라미터 범위를 조정할 수 있는 항목", suggestedFields: [f.workHours, f.workDays, f.salary] },
        { key: "option",     label: "옵션",  description: "있어도 되고 없어도 되는 항목", suggestedFields: [f.phone, f.email, f.address] },
      ],
    },
    {
      type: "optional",
      title: "C. 선택 (Optional)",
      description: "기본 미적용 · 필요 시 켜기 — 부가 정보입니다.",
      depths: [
        { key: "common",     label: "공통",  description: "묶음 전체 설정", suggestedFields: [f.purpose] },
        { key: "confirmed",  label: "확정",  description: "선택 시 필수 동반 항목", suggestedFields: [f.receiver] },
        { key: "adjustable", label: "조절",  description: "값 조정 가능 항목", suggestedFields: [f.probation] },
        { key: "option",     label: "옵션",  description: "자유 입력 항목", suggestedFields: [f.note, f.attachment] },
      ],
    },
  ],
  guide: [
    "고정(A) 항목은 자동 포함되며 제거할 수 없습니다.",
    "준고정(B)에서 필요한 항목 버튼을 클릭하면 양식에 추가됩니다.",
    "입사일·퇴사일은 인사 기록과 동일해야 합니다.",
    "발급 목적을 기재하면 증명서에 용도가 표기됩니다.",
    "수신처를 입력하면 '위 사실을 증명함' 문구 위에 표기됩니다.",
  ],
};

const contractTemplate: DocumentTemplate = {
  sections: [
    {
      type: "fixed",
      title: "A. 고정 (Fixed)",
      description: "변경 불가 — 계약 당사자 핵심 정보입니다.",
      fields: [f.name, f.birthDate, f.phone, f.address, f.contractS, f.contractE],
    },
    {
      type: "semifixed",
      title: "B. 준고정 (Semi-fixed)",
      description: "기본 적용 · 조건부 변경 — 계약 조건 및 근무 정보입니다.",
      depths: [
        { key: "common",     label: "공통",  description: "계약 전체에 걸리는 설정", suggestedFields: [f.dept, f.position] },
        { key: "confirmed",  label: "확정",  description: "계약 시 필수 동반 항목", suggestedFields: [f.salary, f.empType] },
        { key: "adjustable", label: "조절",  description: "조정 가능한 근무 조건", suggestedFields: [f.workHours, f.workDays] },
        { key: "option",     label: "옵션",  description: "선택적 계약 조건", suggestedFields: [f.probation, f.email] },
      ],
    },
    {
      type: "optional",
      title: "C. 선택 (Optional)",
      description: "기본 미적용 · 필요 시 추가 — 특약 및 부가 조건입니다.",
      depths: [
        { key: "common",     label: "공통",  description: "선택 묶음 공통", suggestedFields: [] },
        { key: "confirmed",  label: "확정",  description: "특약 선택 시 필수", suggestedFields: [f.specTerms] },
        { key: "adjustable", label: "조절",  description: "조건 조정", suggestedFields: [f.bankInfo] },
        { key: "option",     label: "옵션",  description: "자유 추가", suggestedFields: [f.note, f.attachment] },
      ],
    },
  ],
  guide: [
    "계약 당사자 인적사항은 고정(A)으로 반드시 입력됩니다.",
    "급여·근무시간은 근로기준법을 준수해야 합니다.",
    "특약 사항은 양 당사자 합의 하에 자유롭게 기재 가능합니다.",
    "수습 기간 설정 시 준고정(B) 옵션에서 추가하세요.",
  ],
};

const reportTemplate: DocumentTemplate = {
  sections: [
    {
      type: "fixed",
      title: "A. 고정 (Fixed)",
      description: "변경 불가 — 보고서 기본 정보입니다.",
      fields: [f.title, f.author, f.dept, f.reportDate],
    },
    {
      type: "semifixed",
      title: "B. 준고정 (Semi-fixed)",
      description: "기본 적용 · 조건부 변경 — 보고서 본문 구성입니다.",
      depths: [
        { key: "common",     label: "공통",  description: "보고서 전체 설정", suggestedFields: [f.periodS, f.periodE] },
        { key: "confirmed",  label: "확정",  description: "보고 시 필수 항목", suggestedFields: [f.summary] },
        { key: "adjustable", label: "조절",  description: "내용 범위 조정", suggestedFields: [f.content] },
        { key: "option",     label: "옵션",  description: "선택적 본문 항목", suggestedFields: [f.conclusion, f.objective] },
      ],
    },
    {
      type: "optional",
      title: "C. 선택 (Optional)",
      description: "기본 미적용 · 필요 시 추가 — 부가 정보입니다.",
      depths: [
        { key: "common",     label: "공통",  description: "선택 묶음 공통", suggestedFields: [] },
        { key: "confirmed",  label: "확정",  description: "선택 시 필수 동반", suggestedFields: [] },
        { key: "adjustable", label: "조절",  description: "자유 조정", suggestedFields: [f.budget, f.expected] },
        { key: "option",     label: "옵션",  description: "자유 추가", suggestedFields: [f.attachment, f.note, f.receiver] },
      ],
    },
  ],
  guide: [
    "보고서 제목·작성자·부서·일자는 고정(A) 항목입니다.",
    "대상 기간을 설정하면 보고서 상단에 표기됩니다.",
    "요약란에 핵심 성과·이슈를 먼저 기재해 주세요.",
    "첨부 파일이 있으면 선택(C) 옵션에서 추가하세요.",
  ],
};

const planTemplate: DocumentTemplate = {
  sections: [
    {
      type: "fixed",
      title: "A. 고정 (Fixed)",
      description: "변경 불가 — 계획서 기본 정보입니다.",
      fields: [f.title, f.author, f.dept, f.planDate],
    },
    {
      type: "semifixed",
      title: "B. 준고정 (Semi-fixed)",
      description: "기본 적용 · 조건부 변경 — 계획 세부 내용입니다.",
      depths: [
        { key: "common",     label: "공통",  description: "계획 전체 설정", suggestedFields: [f.objective] },
        { key: "confirmed",  label: "확정",  description: "계획 수립 시 필수", suggestedFields: [f.periodS, f.periodE] },
        { key: "adjustable", label: "조절",  description: "범위 조정 가능", suggestedFields: [f.details, f.budget] },
        { key: "option",     label: "옵션",  description: "선택적 항목", suggestedFields: [f.expected, f.summary] },
      ],
    },
    {
      type: "optional",
      title: "C. 선택 (Optional)",
      description: "기본 미적용 · 필요 시 추가 — 부가 참고 사항입니다.",
      depths: [
        { key: "common",     label: "공통",  description: "선택 묶음 공통", suggestedFields: [] },
        { key: "confirmed",  label: "확정",  description: "선택 시 필수", suggestedFields: [] },
        { key: "adjustable", label: "조절",  description: "자유 조정", suggestedFields: [f.conclusion] },
        { key: "option",     label: "옵션",  description: "자유 추가", suggestedFields: [f.note, f.attachment, f.receiver] },
      ],
    },
  ],
  guide: [
    "목적과 목표를 구분하여 명확히 기재하세요.",
    "일정은 마일스톤 단위로 설정하는 것을 권장합니다.",
    "예산은 세부 항목별로 나눠 기재하세요.",
    "기대 효과는 정량적 수치를 포함하면 좋습니다.",
  ],
};

const resignationTemplate: DocumentTemplate = {
  sections: [
    {
      type: "fixed",
      title: "A. 고정 (Fixed)",
      description: "변경 불가 — 사직자 인적사항입니다.",
      fields: [f.name, f.empId, f.dept, f.position, f.issueDate],
    },
    {
      type: "semifixed",
      title: "B. 준고정 (Semi-fixed)",
      description: "기본 적용 · 조건부 변경 — 사직 관련 정보입니다.",
      depths: [
        { key: "common",     label: "공통",  description: "사직 전체 설정", suggestedFields: [f.resignDate] },
        { key: "confirmed",  label: "확정",  description: "사직 시 필수 항목", suggestedFields: [f.reason] },
        { key: "adjustable", label: "조절",  description: "상세 조정 가능", suggestedFields: [f.reasonDtl] },
        { key: "option",     label: "옵션",  description: "선택적 항목", suggestedFields: [f.handover] },
      ],
    },
    {
      type: "optional",
      title: "C. 선택 (Optional)",
      description: "기본 미적용 · 필요 시 추가 — 부가 사항입니다.",
      depths: [
        { key: "common",     label: "공통",  description: "묶음 공통", suggestedFields: [] },
        { key: "confirmed",  label: "확정",  description: "선택 시 필수", suggestedFields: [] },
        { key: "adjustable", label: "조절",  description: "자유 조정", suggestedFields: [f.phone, f.email] },
        { key: "option",     label: "옵션",  description: "자유 추가", suggestedFields: [f.note] },
      ],
    },
  ],
  guide: [
    "사직서는 최소 30일 전에 제출 권장합니다.",
    "희망 퇴사일은 인수인계 기간을 고려하세요.",
    "인수인계 계획을 미리 작성하면 처리가 빠릅니다.",
  ],
};

const salaryTemplate: DocumentTemplate = {
  sections: [
    {
      type: "fixed",
      title: "A. 고정 (Fixed)",
      description: "변경 불가 — 대상자 인적사항입니다.",
      fields: [f.name, f.empId, f.dept, f.position, f.payMonth],
    },
    {
      type: "semifixed",
      title: "B. 준고정 (Semi-fixed)",
      description: "기본 적용 · 조건부 변경 — 급여 세부 항목입니다.",
      depths: [
        { key: "common",     label: "공통",  description: "급여 전체 설정", suggestedFields: [] },
        { key: "confirmed",  label: "확정",  description: "급여 필수 항목", suggestedFields: [f.baseSalary, f.deduction] },
        { key: "adjustable", label: "조절",  description: "변동 가능 수당", suggestedFields: [f.overtime, f.bonus] },
        { key: "option",     label: "옵션",  description: "선택적 수당", suggestedFields: [f.mealAllow, f.transAllow] },
      ],
    },
    {
      type: "optional",
      title: "C. 선택 (Optional)",
      description: "기본 미적용 · 필요 시 추가 — 기타 항목입니다.",
      depths: [
        { key: "common",     label: "공통",  description: "묶음 공통", suggestedFields: [] },
        { key: "confirmed",  label: "확정",  description: "선택 시 필수", suggestedFields: [] },
        { key: "adjustable", label: "조절",  description: "자유 조정", suggestedFields: [f.bankInfo] },
        { key: "option",     label: "옵션",  description: "자유 추가", suggestedFields: [f.note] },
      ],
    },
  ],
  guide: [
    "급여 해당 월을 정확히 기재해 주세요.",
    "모든 금액은 원(₩) 단위입니다.",
    "공제 합계는 4대 보험·소득세를 포함합니다.",
    "추가 수당은 준고정(B) 옵션에서 추가하세요.",
  ],
};

const counselingRecordTemplate: DocumentTemplate = {
  sections: [
    {
      type: "fixed",
      title: "A. 고정 (Fixed)",
      description: "변경 불가 — 상담 기본 정보입니다.",
      fields: [f.counselor, f.counselDate, f.counselType],
    },
    {
      type: "semifixed",
      title: "B. 준고정 (Semi-fixed)",
      description: "기본 적용 · 조건부 변경 — 상담 내용을 기록합니다.",
      depths: [
        { key: "common",     label: "공통",  description: "상담 전체 설정", suggestedFields: [f.clientName, f.clientPhone] },
        { key: "confirmed",  label: "확정",  description: "상담 시 필수 기록", suggestedFields: [f.counselCont] },
        { key: "adjustable", label: "조절",  description: "내용 범위 조정", suggestedFields: [f.counselRes] },
        { key: "option",     label: "옵션",  description: "선택적 기록", suggestedFields: [f.email, f.address] },
      ],
    },
    {
      type: "optional",
      title: "C. 선택 (Optional)",
      description: "기본 미적용 · 필요 시 추가 — 후속 및 부가 정보입니다.",
      depths: [
        { key: "common",     label: "공통",  description: "묶음 공통", suggestedFields: [f.followUp] },
        { key: "confirmed",  label: "확정",  description: "후속 선택 시 필수", suggestedFields: [] },
        { key: "adjustable", label: "조절",  description: "자유 조정", suggestedFields: [f.purpose] },
        { key: "option",     label: "옵션",  description: "자유 추가", suggestedFields: [f.note] },
      ],
    },
  ],
  guide: [
    "상담 유형을 정확히 선택해 주세요.",
    "온라인/방문 여부와 레벨테스트 상태를 구분합니다.",
    "상담 내용은 추후 참고할 수 있도록 구체적으로 작성하세요.",
    "후속 상담이 필요한 경우 선택(C)에서 일정을 추가하세요.",
  ],
};

const brandingTemplate: DocumentTemplate = {
  sections: [
    {
      type: "fixed",
      title: "A. 고정 (Fixed)",
      description: "변경 불가 — 문서 기본 정보입니다.",
      fields: [f.title, f.author, f.version, f.issueDate],
    },
    {
      type: "semifixed",
      title: "B. 준고정 (Semi-fixed)",
      description: "기본 적용 · 조건부 변경 — 디자인 규정입니다.",
      depths: [
        { key: "common",     label: "공통",  description: "디자인 전체 설정", suggestedFields: [] },
        { key: "confirmed",  label: "확정",  description: "규정 필수 항목", suggestedFields: [f.logoUsage] },
        { key: "adjustable", label: "조절",  description: "조정 가능 규격", suggestedFields: [f.colorSpec, f.fontSpec] },
        { key: "option",     label: "옵션",  description: "선택적 지침", suggestedFields: [f.tmplNote] },
      ],
    },
    {
      type: "optional",
      title: "C. 선택 (Optional)",
      description: "기본 미적용 · 필요 시 추가 — 부가 지침입니다.",
      depths: [
        { key: "common",     label: "공통",  description: "묶음 공��", suggestedFields: [] },
        { key: "confirmed",  label: "확정",  description: "선택 시 필수", suggestedFields: [] },
        { key: "adjustable", label: "조절",  description: "자유 조정", suggestedFields: [] },
        { key: "option",     label: "옵션",  description: "자유 추가", suggestedFields: [f.note, f.attachment] },
      ],
    },
  ],
  guide: [
    "버전 번호를 명확히 기재하세요.",
    "로고 최소 크기·여백 규정을 포함해 주세요.",
    "색상 코드는 HEX, RGB 모두 기재하면 좋습니다.",
  ],
};

const vendorTemplate: DocumentTemplate = {
  sections: [
    {
      type: "fixed",
      title: "A. 고정 (Fixed)",
      description: "변경 불가 — 거래처 기본 정보입니다.",
      fields: [f.compName, f.contPerson, f.contPhone, f.contEmail],
    },
    {
      type: "semifixed",
      title: "B. 준고정 (Semi-fixed)",
      description: "기본 적용 · 조건부 변경 — 거래처 상세 정보입니다.",
      depths: [
        { key: "common",     label: "공통",  description: "거래 전체 설정", suggestedFields: [f.contStatus] },
        { key: "confirmed",  label: "확정",  description: "거래 시 필수 항목", suggestedFields: [f.bizType] },
        { key: "adjustable", label: "조절",  description: "조정 가능 항목", suggestedFields: [f.address] },
        { key: "option",     label: "옵션",  description: "선택적 항목", suggestedFields: [f.bankInfo] },
      ],
    },
    {
      type: "optional",
      title: "C. 선택 (Optional)",
      description: "기본 미적용 · 필요 시 추가 — 부가 정보입니다.",
      depths: [
        { key: "common",     label: "공통",  description: "묶음 공통", suggestedFields: [] },
        { key: "confirmed",  label: "확정",  description: "선택 시 필수", suggestedFields: [] },
        { key: "adjustable", label: "조절",  description: "자유 조정", suggestedFields: [] },
        { key: "option",     label: "옵션",  description: "자유 추가", suggestedFields: [f.note] },
      ],
    },
  ],
  guide: [
    "거래처명은 사업자등록증과 동일하게 기재하세요.",
    "담당자 변경 시 즉시 업데이트해 주세요.",
    "계약 상태를 정확히 선택하세요.",
  ],
};

const certificationTemplate: DocumentTemplate = {
  sections: [
    {
      type: "fixed",
      title: "A. 고정 (Fixed)",
      description: "변경 불가 — 인증 대상자 정보입니다.",
      fields: [f.name, f.certField, f.issueDate, f.certNo],
    },
    {
      type: "semifixed",
      title: "B. 준고정 (Semi-fixed)",
      description: "기본 적용 · 조건부 변경 — 인증 세부 내역입니다.",
      depths: [
        { key: "common",     label: "공통",  description: "인증 전체 설정", suggestedFields: [f.certLevel] },
        { key: "confirmed",  label: "확정",  description: "인증 시 필수", suggestedFields: [f.validS, f.validE] },
        { key: "adjustable", label: "조절",  description: "범위 조정", suggestedFields: [f.certDtl] },
        { key: "option",     label: "옵션",  description: "선택적 항목", suggestedFields: [f.dept, f.position] },
      ],
    },
    {
      type: "optional",
      title: "C. 선택 (Optional)",
      description: "기본 미적용 · 필요 시 추가 — 부가 정보입니다.",
      depths: [
        { key: "common",     label: "공통",  description: "묶음 공통", suggestedFields: [f.purpose] },
        { key: "confirmed",  label: "확정",  description: "선택 시 필수", suggestedFields: [f.receiver] },
        { key: "adjustable", label: "조절",  description: "자유 조정", suggestedFields: [] },
        { key: "option",     label: "옵션",  description: "자유 추가", suggestedFields: [f.note] },
      ],
    },
  ],
  guide: [
    "인증 번호는 자동 채번 규칙에 따라 부여됩니다.",
    "유효 기간 설정 시 만료 전 갱신 알림이 가능합니다.",
    "인증 등급은 내부 심사 결과에 따라 선택합니다.",
  ],
};


/* ══════════════════════════════════════════════════════
   서류 ID → 템플릿 매핑
   ══════════════════════════════════════════════════════ */

export function getDocumentTemplate(docId: string): DocumentTemplate {
  const m: Record<string, DocumentTemplate> = {
    // 기업관리팀
    "26": contractTemplate,
    "27": reportTemplate,
    // 상담팀
    "28": counselingRecordTemplate,
    "29": counselingRecordTemplate,
    // 기획팀
    "30": planTemplate,
    // 개발팀
    "31": planTemplate,
    // 비서팀
    "32": planTemplate,
    "33": planTemplate,
    "34": vendorTemplate,
    // 회계/총무팀
    "35": certificateTemplate,
    "36": certificateTemplate,
    "37": certificateTemplate,
    "38": certificateTemplate,
    "39": resignationTemplate,
    "40": salaryTemplate,
    "41": certificateTemplate,
    // 디자인
    "42": brandingTemplate,
    "43": planTemplate,
    "44": planTemplate,
    // 인사팀
    "45": contractTemplate,
    "46": contractTemplate,
    "47": contractTemplate,
    "48": contractTemplate,
    "49": contractTemplate,
    "50": contractTemplate,
    "51": contractTemplate,
    "52": contractTemplate,
    // 마케팅팀
    "53": planTemplate,
    "54": reportTemplate,
    // 영업팀
    "55": planTemplate,
    "56": reportTemplate,
    "57": reportTemplate,
    "58": contractTemplate,
    // 헤드헌팅팀
    "59": planTemplate,
    // 강사팀
    "60": planTemplate,
    "61": planTemplate,
    // 커리큘럼·교재팀
    "62": planTemplate,
    // 문제은행팀
    "63": planTemplate,
    // 인증증명
    "64": certificationTemplate,
    "65": certificationTemplate,
    "66": certificationTemplate,
  };
  return m[docId] || certificateTemplate;
}
