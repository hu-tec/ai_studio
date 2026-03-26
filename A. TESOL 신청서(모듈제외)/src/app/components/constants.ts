// 가능 언어 (복수 선택)
export const LANGUAGES = [
  "영어",
  "일본어",
  "중국어",
  "한국어",
  "기타 언어",
] as const;

// 번역 가능 시간 (단일 선택)
export const AVAILABLE_TIMES = [
  "종일",
  "오전 (09:00~12:00)",
  "오후 (12:00~18:00)",
  "저녁 (18:00~22:00)",
] as const;

// 번역 경력 (단일 선택)
export const EXPERIENCE_LEVELS = [
  "신입 (경험 없음)",
  "1년 미만",
  "1년~3년",
  "3년~5년",
  "5년 이상",
] as const;

// 직업 (복수 선택)
export const OCCUPATIONS = [
  "학생",
  "취준생",
  "전문번역사",
  "번역프리랜서",
  "직장인",
] as const;

// 학력 (단일 선택)
export const EDUCATION_LEVELS = [
  "고졸",
  "전문학사",
  "학사",
  "석사",
  "박사",
] as const;

// 통화 가능 시간 (단일 선택)
export const CALL_TIMES = [
  "오전 (09:00~12:00)",
  "오후 (12:00~18:00)",
  "저녁 (18:00~22:00)",
  "언제나 가능",
] as const;

// 번역 작업 목표 (복수 선택)
export const WORK_GOALS = [
  "전문번역 프리랜서",
  "영어공부",
  "추가 부수입",
] as const;

// 해외 경험 (양자 택일)
export const OVERSEAS_OPTIONS = ["있음", "없음"] as const;

// MT(기계번역) 경험 (단일 선택)
export const MT_EXPERIENCE_OPTIONS = [
  "있음",
  "없음",
  "전혀 모름",
] as const;

// 상태 라벨
export const STATUS_LABELS: Record<string, string> = {
  pending: "대기",
  approved: "승인",
  rejected: "반려",
};
