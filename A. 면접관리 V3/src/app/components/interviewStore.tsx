import React, { createContext, useContext, useState, ReactNode } from "react";

// Types
export type ApplicantType = "강사" | "직원";

export interface SkillChecks {
  aiVibeCoding: string[];
  prompt: string[];
  design: string[];
  program: string[];
  etc: string[];
  documentWriting: string[];
  translationSystem: string[];
  usageExperience: string[];
  workExperience: string[];
}

export interface InstructorSkills {
  language: string[];
  usage: string[];
  strength: string[];
}

export interface StaffSkills {
  language: string[];
  usage: string[];
  strength: string[];
}

export interface Applicant {
  id: string;
  name: string;
  type: ApplicantType;
  date: string;
  // Category filters
  categoryLarge: string;
  categoryMedium: string;
  categorySmall: string;
  // Fixed evaluation
  career: string; // 신입 or 경력
  careerYears: number;
  education: string;
  certificates: string;
  availableAI: string;
  // Semi-fixed (1-5)
  judgment: number;
  sincerity: number;
  sense: number;
  longTermWork: number;
  specialNotes: string;
  // Optional
  mbti: string;
  // Skills
  skills: SkillChecks;
  typeSkills: InstructorSkills | StaffSkills;
  // Status check
  situationCheck: string;
  // Pass status
  passStatus: "미정" | "합격" | "불합격";
  // Computed
  grade: string;
  totalScore: number;
  memo: string;
}

export const SKILL_OPTIONS = {
  aiVibeCoding: ["피그마 AI", "커서", "와프", "엔티"],
  prompt: ["제미나이", "GPT", "클로드"],
  design: ["감마", "미드저니"],
  program: ["MCP", "노트북 LM", "노션"],
  etc: ["깃허브", "슬랙", "서버(아마존등)", "까페 24", "워드프레스"],
  documentWriting: ["글쓰기", "글정리", "맥락파악"],
  translationSystem: ["SDL", "멤소스"],
  usageExperience: ["미리 캔퍼스"],
  workExperience: ["사무", "상담", "문서정리관리", "데이터 정리", "관리-조직학생"],
};

export const CERTIFICATE_OPTIONS = [
  "TESOL", "TOEIC 900+", "JLPT N1", "JLPT N2", "HSK 5급+",
  "정보처리기사", "정보처리산업기사", "컴퓨터활용능력 1급", "컴퓨터활용능력 2급",
  "GTQ 1급", "웹디자인기능사", "사무자동화산업기사",
  "공인회계사(CPA)", "세무사", "SHRM-CP",
  "AWS 자격증", "TOPIK",
];

export const INSTRUCTOR_SKILL_OPTIONS = {
  language: ["읽기", "말하기", "듣기"],
  usage: ["엑셀가능", "엑셀 함수", "맥락파악", "중간역할", "사람관리"],
  strength: ["단어기억", "숫자 기억"],
};

export const STAFF_SKILL_OPTIONS = {
  language: ["영어 쓰기", "읽기"],
  usage: ["엑셀가능", "엑셀 함수", "맥락파악", "중간역할", "사람관리"],
  strength: ["단어기억", "숫자 기억"],
};

export const CATEGORY_OPTIONS: Record<ApplicantType, { large: string[]; medium: Record<string, string[]>; small: Record<string, string[]> }> = {
  강사: {
    large: ["어학", "IT", "자격증", "취미/교양"],
    medium: {
      어학: ["영어", "일본어", "중국어", "한국어"],
      IT: ["프로그래밍", "디자인", "데이터"],
      자격증: ["국가자격", "민간자격"],
      "취미/교양": ["음악", "미술", "체육"],
    },
    small: {
      영어: ["회화", "문법", "토익", "토플"],
      일본어: ["회화", "JLPT", "비즈니스"],
      중국어: ["회화", "HSK"],
      한국어: ["TOPIK", "회화"],
      프로그래밍: ["웹개발", "앱개발", "AI/ML"],
      디자인: ["UI/UX", "그래픽", "영상"],
      데이터: ["분석", "엔지니어링"],
      국가자격: ["기사", "산업기사"],
      민간자격: ["컴퓨터활용", "기타"],
      음악: ["피아노", "기타", "보컬"],
      미술: ["회화", "공예"],
      체육: ["요가", "필라테스", "수영"],
    },
  },
  직원: {
    large: ["관리", "영업", "기술", "지원"],
    medium: {
      관리: ["인사", "총무", "재무"],
      영업: ["국내영업", "해외영업", "마케팅"],
      기술: ["개발", "인프라", "QA"],
      지원: ["고객지원", "교육지원"],
    },
    small: {
      인사: ["채용", "교육", "급여"],
      총무: ["시설관리", "구매"],
      재무: ["회계", "세무"],
      국내영업: ["B2B", "B2C"],
      해외영업: ["아시아", "유럽", "북미"],
      마케팅: ["디지털", "오프라인"],
      개발: ["프론트엔드", "백엔드", "풀스택"],
      인프라: ["서버", "네트워크", "보안"],
      QA: ["기능테스트", "자동화"],
      고객지원: ["전화상담", "온라인상담"],
      교육지원: ["운영", "콘텐츠"],
    },
  },
};

export function calculateGrade(applicant: Partial<Applicant>): { grade: string; totalScore: number; details: string } {
  let score = 0;
  let maxScore = 0;

  // Career scoring (max 15)
  maxScore += 15;
  if (applicant.career === "경력") {
    const years = applicant.careerYears || 0;
    if (years >= 10) score += 15;
    else if (years >= 5) score += 12;
    else if (years >= 3) score += 9;
    else if (years >= 1) score += 6;
    else score += 3;
  } else if (applicant.career === "신입") {
    score += 3;
  }

  // Education scoring (max 10)
  maxScore += 10;
  if (applicant.education) {
    if (applicant.education.includes("석사") || applicant.education.includes("박사")) score += 10;
    else if (applicant.education.includes("대졸") || applicant.education.includes("학사")) score += 8;
    else if (applicant.education.includes("전문대")) score += 6;
    else if (applicant.education.includes("고졸")) score += 4;
    else score += 2;
  }

  // Certificate scoring (max 5)
  maxScore += 5;
  if (applicant.certificates && applicant.certificates.trim().length > 0) {
    const certCount = applicant.certificates.split(",").length;
    score += Math.min(certCount * 2, 5);
  }

  // AI scoring (max 5)
  maxScore += 5;
  if (applicant.availableAI && applicant.availableAI.trim().length > 0) {
    score += 5;
  }

  // Semi-fixed scores (max 25)
  maxScore += 25;
  score += (applicant.judgment || 0);
  score += (applicant.sincerity || 0);
  score += (applicant.sense || 0);
  score += (applicant.longTermWork || 0);

  // Skills bonus (max 10)
  maxScore += 10;
  if (applicant.skills) {
    const totalSkills = Object.values(applicant.skills).reduce((acc, arr) => acc + arr.length, 0);
    score += Math.min(totalSkills * 0.5, 10);
  }

  const totalScore = score;
  const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;

  let grade = "D";
  let details = "";

  if (percentage >= 85) {
    grade = "A";
    details = "우수 - 즉시 채용 추천";
  } else if (percentage >= 70) {
    grade = "B";
    details = "양호 - 채용 고려";
  } else if (percentage >= 50) {
    grade = "C";
    details = "보통 - 추가 검토 필요";
  } else {
    grade = "D";
    details = "미달 - 채용 보류";
  }

  return { grade, totalScore: Math.round(totalScore * 10) / 10, details };
}

function makeSample(
  id: string, name: string, type: ApplicantType, date: string,
  catL: string, catM: string, catS: string,
  career: string, careerYears: number, education: string,
  certificates: string, availableAI: string,
  judgment: number, sincerity: number, sense: number, longTermWork: number,
  specialNotes: string, mbti: string,
  skills: SkillChecks, memo: string
): Applicant {
  const base: Applicant = {
    id, name, type, date,
    categoryLarge: catL, categoryMedium: catM, categorySmall: catS,
    career, careerYears, education, certificates, availableAI,
    judgment, sincerity, sense, longTermWork, specialNotes,
    mbti, skills,
    typeSkills: { language: [], usage: [], strength: [] },
    situationCheck: "", passStatus: "미정", grade: "D", totalScore: 0, memo,
  };
  const { grade, totalScore } = calculateGrade(base);
  return { ...base, grade, totalScore };
}

const SAMPLE_APPLICANTS: Applicant[] = [
  makeSample("s1", "김민수", "강사", "2026-03-01", "어학", "영어", "회화", "경력", 7, "대졸(학사)", "TESOL, TOEIC 990", "GPT, 클로드", 5, 5, 4, 5, "원어민 수준 발음", "ENFJ",
    { aiVibeCoding: ["커서"], prompt: ["GPT", "클로드"], design: ["감마"], program: ["노션"], etc: ["슬랙"], documentWriting: ["글쓰기", "글정리", "맥락파악"], translationSystem: ["SDL"], usageExperience: ["미리 캔퍼스"], workExperience: ["상담", "관리-조직학생"] }, "우수 강사 후보"),
  makeSample("s2", "이정희", "강사", "2026-03-02", "IT", "프로그래밍", "웹개발", "경력", 5, "석사", "정보처리기사, AWS", "GPT, 커서", 4, 4, 5, 4, "풀스택 가능", "INTJ",
    { aiVibeCoding: ["피그마 AI", "커서", "와프"], prompt: ["GPT", "클로드", "제미나이"], design: ["미드저니"], program: ["MCP", "노트북 LM", "노션"], etc: ["깃허브", "슬랙", "서버(아마존등)"], documentWriting: ["글쓰기", "맥락파악"], translationSystem: [], usageExperience: [], workExperience: ["사무"] }, "기술 강사 적합"),
  makeSample("s3", "박서연", "직원", "2026-03-03", "관리", "인사", "채용", "경력", 3, "대졸(학사)", "SHRM-CP", "GPT", 4, 5, 4, 5, "채용 프로세스 경험 풍부", "ESFJ",
    { aiVibeCoding: [], prompt: ["GPT"], design: [], program: ["노션"], etc: ["슬랙"], documentWriting: ["글쓰기", "글정리", "맥락파악"], translationSystem: [], usageExperience: ["미리 캔퍼스"], workExperience: ["사무", "상담", "문서정리관리"] }, "인사팀 추천"),
  makeSample("s4", "최윤호", "강사", "2026-02-28", "어학", "일본어", "JLPT", "경력", 10, "석사", "JLPT N1, 통역사", "GPT", 5, 4, 3, 4, "일본 거주 8년", "ISTJ",
    { aiVibeCoding: [], prompt: ["GPT"], design: [], program: ["노션"], etc: [], documentWriting: ["글쓰기", "글정리"], translationSystem: ["SDL", "멤소스"], usageExperience: [], workExperience: ["상담"] }, "일본어 전문 강사"),
  makeSample("s5", "장미영", "직원", "2026-03-04", "기술", "개발", "프론트엔드", "경력", 4, "대졸(학사)", "정보처리기사", "GPT, 커서, 클로드", 4, 4, 5, 3, "React/Next.js 전문", "INTP",
    { aiVibeCoding: ["피그마 AI", "커서", "엔티"], prompt: ["GPT", "클로드", "제미나이"], design: ["감마", "미드저니"], program: ["MCP", "노션"], etc: ["깃허브", "슬랙"], documentWriting: ["글쓰기"], translationSystem: [], usageExperience: [], workExperience: ["사무"] }, "개발팀 적합"),
  makeSample("s6", "홍길동", "직원", "2026-03-05", "영업", "마케팅", "디지털", "경력", 2, "대졸(학사)", "", "GPT", 3, 4, 4, 3, "SNS 마케팅 경험", "ENFP",
    { aiVibeCoding: [], prompt: ["GPT"], design: ["감마"], program: ["노션"], etc: ["슬랙"], documentWriting: ["글쓰기", "글정리"], translationSystem: [], usageExperience: ["미리 캔퍼스"], workExperience: ["사무", "상담"] }, "마케팅 경험자"),
  makeSample("s7", "윤서진", "강사", "2026-03-01", "취미/교양", "음악", "피아노", "경력", 15, "석사", "피아노 연주 자격증", "", 5, 5, 5, 5, "콩쿨 수상 경력", "ISFP",
    { aiVibeCoding: [], prompt: [], design: [], program: [], etc: [], documentWriting: ["글쓰기"], translationSystem: [], usageExperience: [], workExperience: ["관리-조직학생"] }, "예술 분야 최우수"),
  makeSample("s8", "한지우", "직원", "2026-03-06", "지원", "고객지원", "온라인상담", "신입", 0, "전문대졸", "", "", 2, 3, 3, 2, "", "ISFJ",
    { aiVibeCoding: [], prompt: [], design: [], program: [], etc: [], documentWriting: ["글쓰기"], translationSystem: [], usageExperience: [], workExperience: ["상담"] }, "신입 지원자"),
  makeSample("s9", "오태현", "강사", "2026-02-27", "IT", "디자인", "UI/UX", "경력", 6, "대졸(학사)", "GTQ 1급, 웹디자인기능사", "GPT, 미드저니", 4, 3, 5, 4, "포트폴리오 우수", "ENTP",
    { aiVibeCoding: ["피그마 AI"], prompt: ["GPT", "클로드"], design: ["감마", "미드저니"], program: ["노션"], etc: ["슬랙"], documentWriting: ["글쓰기", "맥락파악"], translationSystem: [], usageExperience: ["미리 캔퍼스"], workExperience: ["사무"] }, "디자인 강사 후보"),
  makeSample("s10", "정다은", "직원", "2026-03-04", "관리", "재무", "회계", "경력", 8, "대졸(학사)", "공인회계사, 세무사", "GPT", 4, 5, 3, 5, "대기업 경력", "ESTJ",
    { aiVibeCoding: [], prompt: ["GPT"], design: [], program: ["노션"], etc: ["슬랙"], documentWriting: ["글쓰기", "글정리", "맥락파악"], translationSystem: [], usageExperience: [], workExperience: ["사무", "문서정리관리", "데이터 정리"] }, "재무팀 우선 채용 추천"),
];

export function createEmptyApplicant(): Applicant {
  return {
    id: crypto.randomUUID(),
    name: "",
    type: "강사",
    date: new Date().toISOString().split("T")[0],
    categoryLarge: "",
    categoryMedium: "",
    categorySmall: "",
    career: "신입",
    careerYears: 0,
    education: "",
    certificates: "",
    availableAI: "",
    judgment: 0,
    sincerity: 0,
    sense: 0,
    longTermWork: 0,
    specialNotes: "",
    mbti: "",
    skills: {
      aiVibeCoding: [],
      prompt: [],
      design: [],
      program: [],
      etc: [],
      documentWriting: [],
      translationSystem: [],
      usageExperience: [],
      workExperience: [],
    },
    typeSkills: {
      language: [],
      usage: [],
      strength: [],
    },
    situationCheck: "",
    passStatus: "미정",
    grade: "D",
    totalScore: 0,
    memo: "",
  };
}

interface StoreContextType {
  applicants: Applicant[];
  addApplicant: (a: Applicant) => void;
  updateApplicant: (id: string, a: Partial<Applicant>) => void;
  deleteApplicant: (id: string) => void;
  currentApplicant: Applicant | null;
  setCurrentApplicant: (a: Applicant | null) => void;
}

const StoreContext = createContext<StoreContextType | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [applicants, setApplicants] = useState<Applicant[]>(SAMPLE_APPLICANTS);
  const [currentApplicant, setCurrentApplicant] = useState<Applicant | null>(null);

  const addApplicant = (a: Applicant) => {
    const { grade, totalScore } = calculateGrade(a);
    const updated = { ...a, grade, totalScore };
    setApplicants((prev) => [...prev, updated]);
  };

  const updateApplicant = (id: string, updates: Partial<Applicant>) => {
    setApplicants((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          const merged = { ...a, ...updates };
          const { grade, totalScore } = calculateGrade(merged);
          return { ...merged, grade, totalScore };
        }
        return a;
      })
    );
  };

  const deleteApplicant = (id: string) => {
    setApplicants((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <StoreContext.Provider value={{ applicants, addApplicant, updateApplicant, deleteApplicant, currentApplicant, setCurrentApplicant }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}