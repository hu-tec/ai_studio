// 분류체계 (대분류 → 중분류 → 소분류)
export interface CategorySelection {
  large: string;   // 대분류: 문서, 음성, 영상, ...
  medium: string;  // 중분류
  small: string;   // 소분류 (optional - 없을 수 있음)
}

// 급수 (분야 → 중 → 소)
export interface InstructorGrade {
  field: string;   // 분야: 프롬, 번역, 윤리
  mid: string;     // 중: 교육, 일반, 전문
  level: string;   // 소: 1급~8급
}

// 커리큘럼 키워드 선택
export interface CurriculumKeywords {
  common: string[];       // 공통항목
  prompt: string[];       // AI 프롬프트 전용(비공통)
  ethics: string[];       // 윤리 전용(비공통)
  translation: string[];  // 번역 전용(비공통)
}

// 커리큘럼 제목
export interface CurriculumTitles {
  basicClass: string;     // 기본 수업 커리
  practiceClass: string;  // 실습 커리
}

export interface SavedCurriculum {
  id: string;
  created_at: string;
  category: CategorySelection;
  instructor_grade: InstructorGrade;
  targets: string[];
  keywords: CurriculumKeywords;
  titles: CurriculumTitles;
}
