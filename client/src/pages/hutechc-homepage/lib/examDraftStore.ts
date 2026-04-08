'use client';

// 간단한 인메모리 스토어 (mock)
// 새로고침하면 초기값으로 리셋됩니다.

// 출제자와 관리자의 전체 흐름을 표현하는 상태
export type DraftStatus =
  | '출제자전달완료' // 관리자 -> 출제자에게 시험 출제를 의뢰한 상태
  | '출제중' // 출제자가 문제를 작성 중인 상태
  | '출제완료' // 출제자가 출제를 완료해 관리자 검토를 기다리는 상태
  | '최종승인'; // 관리자가 최종 승인한 상태

export interface ExamDraft {
  id: string;
  templateId?: string;
  title: string;
  type: '번역' | '프롬프트';
  mainCategory: string;
  middleCategory?: string;
  subCategory?: string;
  questionCount: number;
  durationMinutes: number;
  assignedTranslatorId?: string;
  status: DraftStatus;
}

let drafts: ExamDraft[] = [
  {
    id: 'draft-001',
    templateId: 'exam-001',
    title: '전문1급 번역 시험 A형',
    type: '번역',
    mainCategory: '비즈니스',
    middleCategory: '마케팅/기획',
    subCategory: '마케팅 제안서',
    questionCount: 6,
    durationMinutes: 90,
    assignedTranslatorId: 'tr-001',
    status: '출제자전달완료',
  },
  {
    id: 'draft-002',
    templateId: 'exam-001',
    title: '전문1급 번역 시험 A형 - 출제 진행본',
    type: '번역',
    mainCategory: '비즈니스',
    middleCategory: '마케팅/기획',
    subCategory: '마케팅 제안서',
    questionCount: 6,
    durationMinutes: 90,
    assignedTranslatorId: 'tr-001',
    status: '출제중',
  },
  {
    id: 'draft-003',
    templateId: 'exam-001',
    title: '전문1급 번역 시험 A형 - 출제 완료본',
    type: '번역',
    mainCategory: '비즈니스',
    middleCategory: '마케팅/기획',
    subCategory: '마케팅 제안서',
    questionCount: 6,
    durationMinutes: 90,
    assignedTranslatorId: 'tr-001',
    status: '출제완료',
  },
  {
    id: 'draft-004',
    templateId: 'exam-002',
    title: '프롬프트 작성 시험 B형 - 최종 승인본',
    type: '프롬프트',
    mainCategory: '일반',
    middleCategory: '에세이/논술',
    subCategory: '시사 에세이',
    questionCount: 3,
    durationMinutes: 60,
    assignedTranslatorId: 'tr-002',
    status: '최종승인',
  },
];

export function getDrafts(): ExamDraft[] {
  return drafts;
}

export function addDraft(draft: ExamDraft) {
  drafts = [...drafts, draft];
}

export function updateDraft(id: string, patch: Partial<ExamDraft>) {
  drafts = drafts.map((d) => (d.id === id ? { ...d, ...patch } : d));
}

export function approveDraft(id: string) {
  updateDraft(id, { status: '최종승인' });
}
