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
  videoEditing: string[];
  onlinePlatform: string[];
  whiteboard: string[];
  quizAssessment: string[];
  screenRecording: string[];
  presentationTool: string[];
  contentCreation: string[];
  survey: string[];
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

export interface EvaluationFactor {
  score: number;
  deductionTags: string[];
  deductionOpinion: string;
  solutionTags: string[];
  solutionOpinion: string;
  bonusTags: string[];
  bonusOpinion: string;
  opinion: string;
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
  // Basic Info
  career: string;
  careerYears: number;
  education: string;
  certificates: string;
  availableAI: string;
  mbti: string;

  // Evaluation Factors (Consolidated)
  factors: {
    // PART 1: Personality & Attitude
    judgment: EvaluationFactor;
    sincerity: EvaluationFactor;
    sense: EvaluationFactor;
    retention: EvaluationFactor;
    // PART 2: Job & Career
    experience: EvaluationFactor;
    academic: EvaluationFactor;
    teaching: EvaluationFactor;
    expertCert: EvaluationFactor;
  };

  specialNotes: string;
  skills: SkillChecks;
  typeSkills: InstructorSkills | StaffSkills;
  situationCheck: string;
  passStatus: "미정" | "합격" | "불합격";
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
  translationSystem: ["SDL", "멘소스"],
  usageExperience: ["미리 캔퍼스"],
  workExperience: ["사무", "상담", "문서정리관리", "데이터 정리", "관리-조직학생"],
  videoEditing: ["캡컷", "프리미어 프로", "파이널 컷", "DaVinci Resolve"],
  onlinePlatform: ["Zoom", "MS Teams", "Google Meet", "Webex"],
  whiteboard: ["Miro", "Jamboard", "Padlet", "Mural"],
  quizAssessment: ["Kahoot", "Quizizz", "Mentimeter", "Slido"],
  screenRecording: ["OBS", "Loom", "Bandicam", "Camtasia"],
  presentationTool: ["Prezi", "Canva 프레젠테이션", "PowerPoint", "Keynote"],
  contentCreation: ["Canva", "Adobe Express", "블로그", "유튜브"],
  survey: ["Google Forms", "Typeform", "SurveyMonkey", "네이버 폼"],
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

  // Evaluation scoring (Factors)
  if (applicant.factors) {
    Object.values(applicant.factors).forEach(f => {
      maxScore += 5;
      score += (f.score || 0);
    });
  }

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

export function createEmptyApplicant(): Applicant {
  const emptyFactor = (): EvaluationFactor => ({
    score: 0,
    deductionTags: [],
    deductionOpinion: "",
    solutionTags: [],
    solutionOpinion: "",
    bonusTags: [],
    bonusOpinion: "",
    opinion: "",
  });

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
    mbti: "",
    factors: {
      judgment: emptyFactor(),
      sincerity: emptyFactor(),
      sense: emptyFactor(),
      retention: emptyFactor(),
      experience: emptyFactor(),
      academic: emptyFactor(),
      teaching: emptyFactor(),
      expertCert: emptyFactor(),
    },
    specialNotes: "",
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
      videoEditing: [],
      onlinePlatform: [],
      whiteboard: [],
      quizAssessment: [],
      screenRecording: [],
      presentationTool: [],
      contentCreation: [],
      survey: [],
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
  const [applicants, setApplicants] = useState<Applicant[]>([]);
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
