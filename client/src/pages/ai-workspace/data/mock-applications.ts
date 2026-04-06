export interface ExpertApplication {
  id: string;
  name: string;
  email: string;
  status: 'pending' | 'approved' | 'rejected';
  field: {
    large: string;
    middle: string;
    small: string;
  };
  dept: {
    large: string;
    middle: string;
  };
  appliedAt: string;
  experience: number;
  portfolio: string;
  description: string;
}

export const MOCK_APPLICATIONS: ExpertApplication[] = [
  {
    id: "1",
    name: "김민수",
    email: "minsu@example.com",
    status: 'pending',
    field: { large: "문서", middle: "비즈니스", small: "사업계획서" },
    dept: { large: "기획", middle: "" },
    appliedAt: "2026-03-05",
    experience: 5,
    portfolio: "https://portfolio.com/minsu",
    description: "10년차 비즈니스 기획 전문가입니다."
  },
  {
    id: "2",
    name: "이영희",
    email: "young@example.com",
    status: 'approved',
    field: { large: "IT/개발", middle: "개발/보안", small: "AI" },
    dept: { large: "강사 팀", middle: "테솔" },
    appliedAt: "2026-03-01",
    experience: 3,
    portfolio: "https://portfolio.com/young",
    description: "AI 교육 및 챗봇 개발 전문가입니다."
  },
  {
    id: "3",
    name: "박지성",
    email: "js@example.com",
    status: 'rejected',
    field: { large: "영상/SNS", middle: "미디어/장르", small: "유튜브" },
    dept: { large: "마케팅", middle: "" },
    appliedAt: "2026-02-28",
    experience: 7,
    portfolio: "https://portfolio.com/js",
    description: "유튜브 콘텐츠 기획 및 영상 편집 전문가입니다."
  },
  {
    id: "4",
    name: "최수연",
    email: "sy@example.com",
    status: 'pending',
    field: { large: "확장영역", middle: "라이프/전문", small: "재무" },
    dept: { large: "영업", middle: "" },
    appliedAt: "2026-03-08",
    experience: 4,
    portfolio: "https://portfolio.com/sy",
    description: "금융 자문 및 자산 관리 전문가입니다."
  },
  {
    id: "5",
    name: "정우진",
    email: "wj@example.com",
    status: 'pending',
    field: { large: "창의적활동", middle: "콘텐츠", small: "웹툰소설" },
    dept: { large: "커리 교제 팀", middle: "프롬프트" },
    appliedAt: "2026-03-09",
    experience: 6,
    portfolio: "https://portfolio.com/wj",
    description: "웹소설 작가 및 시나리오 기획자입니다."
  }
];
