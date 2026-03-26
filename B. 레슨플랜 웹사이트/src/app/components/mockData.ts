export interface LessonPlan {
  id: number;
  center: string;
  category: string;
  courseName: string;
  cohort: string;
  tags: string;
  topic: string;
  author: string;
  level: string;
  studentCount: string;
  timeLength: string;
  createdAt: string;
  views: number;
  hasAttachment: boolean;
  instructorName: string;
  dateFrom: string;
  dateTo: string;
  gender: string;
  password: string;
  categories: CategoryItem[];
  steps: StepItem[];
}

export interface CategoryItem {
  id: string;
  title: string;
  contents: string;
  remark: string;
  timeLength: string;
  mediaTypes: string[];
  teachingAids: string[];
}

export interface StepItem {
  id: string;
  title: string;
  time: string;
  setUp: string;
  description: string;
  remark: string;
  mediaTypes: string[];
  teachingAids: string[];
}

export const cohortOptions = [
  { value: "2026-1-TESOL", label: "2026 1기 - TESOL" },
  { value: "2026-1-TRANS", label: "2026 1기 - 통번역" },
  { value: "2025-2-TESOL", label: "2025 2기 - TESOL" },
  { value: "2025-2-TRANS", label: "2025 2기 - 통번역" },
  { value: "2025-1-TESOL", label: "2025 1기 - TESOL" },
  { value: "2025-1-BIZ", label: "2025 1기 - 비즈니스영어" },
];

export const topicOptions = ["Reading", "Writing", "Listening", "Speaking", "Vocabulary", "Grammar"];

export const groupOptions = ["개인", "5명이하", "6-10명", "11-20명", "21명이상", "100명이상"];

export const timeLengthOptions = ["30분", "31-59분", "1시간-2시간", "2시간이상", "직접입력"];

export const categoryCheckboxes = [
  "Materials",
  "Aims",
  "Language Skills",
  "Language Systems",
  "Assumptions",
  "Anticipated Errors and Solutions",
  "Reference",
];

export const stepCheckboxes = [
  "Lead-in",
  "Pre-Activity",
  "Main-Activity",
  "Presentation",
  "Practice",
  "Production",
];

export const mockLessonPlans: LessonPlan[] = [
  {
    id: 1,
    center: "서울센터",
    category: "TESOL",
    courseName: "TESOL 과정",
    cohort: "2026-1-TESOL",
    tags: "grammar, beginner",
    topic: "Grammar",
    author: "김영희",
    level: "Beginner",
    studentCount: "11-20명",
    timeLength: "1시간-2시간",
    createdAt: "2026-02-28",
    views: 45,
    hasAttachment: true,
    instructorName: "Kim Younghee",
    dateFrom: "2026-03-01",
    dateTo: "2026-03-15",
    gender: "Mixed",
    password: "",
    categories: [
      { id: "c1", title: "Materials", contents: "Textbook Chapter 5, Handout A", remark: "Print 20 copies", timeLength: "10", mediaTypes: ["Textbook", "Handout"], teachingAids: ["Printer"] },
      { id: "c2", title: "Aims", contents: "Students will be able to use present perfect tense correctly", remark: "", timeLength: "5", mediaTypes: [], teachingAids: [] },
    ],
    steps: [
      { id: "s1", title: "Lead-in", time: "10", setUp: "Whole class discussion", description: "Ask students about their recent experiences using target language", remark: "", mediaTypes: ["Discussion"], teachingAids: [] },
      { id: "s2", title: "Presentation", time: "20", setUp: "Teacher-led", description: "Present grammar rules with examples on the board", remark: "Use colored markers", mediaTypes: ["Board"], teachingAids: ["Colored Markers"] },
      { id: "s3", title: "Practice", time: "25", setUp: "Pair work", description: "Complete worksheet exercises in pairs, then check answers", remark: "", mediaTypes: ["Worksheet"], teachingAids: [] },
    ],
  },
  {
    id: 2,
    center: "부산센터",
    category: "통번역",
    courseName: "통번역 과정",
    cohort: "2026-1-TRANS",
    tags: "reading, intermediate",
    topic: "Reading",
    author: "이철수",
    level: "Intermediate",
    studentCount: "6-10명",
    timeLength: "2시간이상",
    createdAt: "2026-02-25",
    views: 32,
    hasAttachment: false,
    instructorName: "Lee Cheolsu",
    dateFrom: "2026-03-05",
    dateTo: "2026-03-20",
    gender: "Female",
    password: "",
    categories: [
      { id: "c1", title: "Materials", contents: "Article from NY Times, Vocabulary list", remark: "", timeLength: "15", mediaTypes: ["Article", "Vocabulary List"], teachingAids: [] },
      { id: "c2", title: "Language Skills", contents: "Skimming, scanning, detailed reading", remark: "Focus on scanning", timeLength: "10", mediaTypes: [], teachingAids: [] },
    ],
    steps: [
      { id: "s1", title: "Pre-Activity", time: "15", setUp: "Individual", description: "Pre-reading vocabulary matching exercise", remark: "", mediaTypes: ["Vocabulary Matching Exercise"], teachingAids: [] },
      { id: "s2", title: "Main-Activity", time: "40", setUp: "Group work", description: "Read the article and answer comprehension questions", remark: "Groups of 3-4", mediaTypes: ["Article"], teachingAids: [] },
    ],
  },
  {
    id: 3,
    center: "서울센터",
    category: "TESOL",
    courseName: "TESOL 과정",
    cohort: "2025-2-TESOL",
    tags: "speaking, advanced",
    topic: "Speaking",
    author: "박민수",
    level: "Advanced",
    studentCount: "5명이하",
    timeLength: "1시간-2시간",
    createdAt: "2026-02-20",
    views: 67,
    hasAttachment: true,
    instructorName: "Park Minsu",
    dateFrom: "2026-02-20",
    dateTo: "2026-03-10",
    gender: "Male",
    password: "",
    categories: [
      { id: "c1", title: "Aims", contents: "Develop fluency in debate-style speaking", remark: "", timeLength: "5", mediaTypes: [], teachingAids: [] },
    ],
    steps: [
      { id: "s1", title: "Lead-in", time: "5", setUp: "Whole class", description: "Introduce debate topic and show video clip", remark: "", mediaTypes: ["Video Clip"], teachingAids: [] },
      { id: "s2", title: "Main-Activity", time: "45", setUp: "Team-based", description: "Structured debate with timed arguments and rebuttals", remark: "Timer needed", mediaTypes: ["Debate"], teachingAids: ["Timer"] },
      { id: "s3", title: "Production", time: "20", setUp: "Individual", description: "Each student presents a 2-minute summary of their position", remark: "", mediaTypes: ["Presentation"], teachingAids: [] },
    ],
  },
  {
    id: 4,
    center: "대전센터",
    category: "비즈니스영어",
    courseName: "비즈니스영어 과정",
    cohort: "2025-1-BIZ",
    tags: "writing, email",
    topic: "Writing",
    author: "정소연",
    level: "Intermediate",
    studentCount: "11-20명",
    timeLength: "1시간-2시간",
    createdAt: "2026-02-15",
    views: 89,
    hasAttachment: true,
    instructorName: "Jung Soyeon",
    dateFrom: "2026-02-15",
    dateTo: "2026-03-01",
    gender: "Mixed",
    password: "",
    categories: [
      { id: "c1", title: "Materials", contents: "Sample business emails, Template handout", remark: "Color print", timeLength: "10", mediaTypes: ["Emails", "Template"], teachingAids: ["Printer"] },
      { id: "c2", title: "Aims", contents: "Write professional business emails with appropriate tone", remark: "", timeLength: "5", mediaTypes: [], teachingAids: [] },
      { id: "c3", title: "Language Systems", contents: "Formal register, hedging language, polite requests", remark: "", timeLength: "10", mediaTypes: [], teachingAids: [] },
    ],
    steps: [
      { id: "s1", title: "Lead-in", time: "10", setUp: "Whole class", description: "Discuss common email mistakes in business context", remark: "", mediaTypes: ["Discussion"], teachingAids: [] },
      { id: "s2", title: "Presentation", time: "15", setUp: "Teacher-led", description: "Analyze sample emails - good vs bad examples", remark: "", mediaTypes: ["Emails"], teachingAids: [] },
      { id: "s3", title: "Practice", time: "20", setUp: "Pair work", description: "Rewrite poorly written emails using target language", remark: "", mediaTypes: ["Emails"], teachingAids: [] },
      { id: "s4", title: "Production", time: "25", setUp: "Individual", description: "Write an original business email based on given scenario", remark: "Peer review after", mediaTypes: ["Emails"], teachingAids: [] },
    ],
  },
  {
    id: 5,
    center: "부산센터",
    category: "TESOL",
    courseName: "TESOL 과정",
    cohort: "2025-1-TESOL",
    tags: "listening, music",
    topic: "Listening",
    author: "최준호",
    level: "Beginner",
    studentCount: "21명이상",
    timeLength: "31-59분",
    createdAt: "2026-02-10",
    views: 23,
    hasAttachment: false,
    instructorName: "Choi Junho",
    dateFrom: "2026-02-10",
    dateTo: "2026-02-28",
    gender: "Mixed",
    password: "",
    categories: [
      { id: "c1", title: "Materials", contents: "Audio recordings, Gap-fill worksheet", remark: "Check audio equipment", timeLength: "5", mediaTypes: ["Audio Recording", "Worksheet"], teachingAids: ["Audio Equipment"] },
      { id: "c2", title: "Assumptions", contents: "Students have basic vocabulary of 500 words", remark: "", timeLength: "", mediaTypes: [], teachingAids: [] },
    ],
    steps: [
      { id: "s1", title: "Lead-in", time: "5", setUp: "Whole class", description: "Play a short music clip and discuss", remark: "", mediaTypes: ["Music Clip"], teachingAids: [] },
      { id: "s2", title: "Pre-Activity", time: "10", setUp: "Individual", description: "Pre-teach key vocabulary from the listening", remark: "", mediaTypes: ["Vocabulary"], teachingAids: [] },
      { id: "s3", title: "Main-Activity", time: "20", setUp: "Individual then pairs", description: "Listen twice - first for gist, second for detail. Complete gap-fill", remark: "", mediaTypes: ["Audio Recording", "Worksheet"], teachingAids: [] },
    ],
  },
  {
    id: 6,
    center: "서울센터",
    category: "통번역",
    courseName: "통번역 과정",
    cohort: "2025-2-TRANS",
    tags: "vocabulary, academic",
    topic: "Vocabulary",
    author: "한지민",
    level: "Advanced",
    studentCount: "6-10명",
    timeLength: "1시간-2시간",
    createdAt: "2026-02-05",
    views: 41,
    hasAttachment: true,
    instructorName: "Han Jimin",
    dateFrom: "2026-02-05",
    dateTo: "2026-02-25",
    gender: "Female",
    password: "",
    categories: [
      { id: "c1", title: "Materials", contents: "Vocabulary cards, Collocation dictionary", remark: "", timeLength: "10", mediaTypes: ["Vocabulary Cards", "Dictionary"], teachingAids: [] },
      { id: "c2", title: "Reference", contents: "Oxford Advanced Learner's Dictionary, Academic Word List", remark: "", timeLength: "", mediaTypes: ["Dictionary", "Word List"], teachingAids: [] },
    ],
    steps: [
      { id: "s1", title: "Lead-in", time: "10", setUp: "Pair work", description: "Word association game with target vocabulary", remark: "", mediaTypes: ["Game"], teachingAids: [] },
      { id: "s2", title: "Presentation", time: "20", setUp: "Teacher-led", description: "Present new vocabulary in context with example sentences", remark: "", mediaTypes: ["Board"], teachingAids: [] },
      { id: "s3", title: "Practice", time: "30", setUp: "Group work", description: "Create sentences using new vocabulary, then present to class", remark: "", mediaTypes: ["Sentence Creation"], teachingAids: [] },
    ],
  },
];