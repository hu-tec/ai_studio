/* 원본: hutechc_hompage_real/app/(client-layout)/admin/exams/page.tsx */
import { useState } from 'react';
import { addDraft, type ExamDraft, getDrafts, approveDraft } from '../../lib/examDraftStore';

interface QuestionTypeSetting {
  id: string;
  kind: '객관식' | '주관식' | '서술형' | '번역' | '프롬프트' | 'custom';
  customLabel?: string; // kind === 'custom' 일 때 표시용 이름
  count: number;
  // 이 유형 안에서 상/중/하 난이도 비율(%)
  difficultyHigh?: number;
  difficultyMedium?: number;
  difficultyLow?: number;
}

interface EvaluationCriteria {
  id: string;
  name: string; // 대 평가 기준 이름 (예: 정확성, 적절성, 효율성, 윤리)
  ratio: number; // 비율 (%)
  subCriteria: Array<{
    id: string;
    definition: string; // 정의
    factor: string; // 요인
    ratio: number; // 소 평가 기준 비율 (%)
  }>;
}

interface ExamTemplate {
  id: string;
  name: string;
  type: '번역' | '프롬프트';
  mainCategory: string; // 대 카테고리
  middleCategory?: string; // 중 카테고리
  subCategory?: string; // 소 카테고리
  questionCount: number;
  questionTypes?: QuestionTypeSetting[]; // 문항 유형별 개수
  durationMinutes: number;
  status: 'draft' | 'ready' | 'open' | 'closed'; // 템플릿 자체 상태 (작성 중/출시 대기 등)
  assignedTranslatorId?: string; // 배정된 출제자 ID

  // 사용 에디터 선택
  editorType?: '에디터' | '영상 에디터' | '코딩 에디터' | '번역 에디터' | '문서 에디터' | '프롬프트 에디터';
  // 응시생
  targetCandidate?: '개인' | '그룹' | '개인/그룹';
  // 시험등급
  examGrade?: string;
  // 시험 교시
  examPeriod?: number; // 1~8교시

  // 채점 비율
  autoGradingRatio?: number; // 자동채점 비율 (%)
  humanGradingRatio?: number; // 휴먼채점 비율 (%)

  // 전체 문항 기준 상/중/하 난이도 비율(%)
  overallDifficultyHigh?: number;
  overallDifficultyMedium?: number;
  overallDifficultyLow?: number;

  // 평가 기준 / 파일 종류
  evaluationMetric?:
    | '단어수'
    | '검색허용횟수'
    | '문장부호수'
    | '수정단어수'
    | '전체문장수'
    | '단계'
    | '전체문자수';
  allowedSearchCount?: number; // 검색 허용 횟수 (공통영역 등에서 사용)
  fileType?: string; // 출제 파일 종류 (PDF, DOCX 등)
  
  // 대/소 평가 기준 구조
  evaluationCriteria?: EvaluationCriteria[];

  // 일정 & 조건 요약 (실제 저장 구조는 이후 확장)
  examDate?: string;
  scoringEndDate?: string;
  resultPublishDate?: string;
  registrationStart?: string;
  registrationEnd?: string;
  authorDeadline?: string;
  minApplicants?: number;
  baseFee?: number; // 단순 접수
  reviewFee?: number; // 검수 옵션
  passScore?: number;

  // 관리 시스템용 메타 정보
  registrationWeeks?: number; // 기본 접수 기간 (주)
  registrationDeadlineOffsetDays?: number; // 시험일 기준 접수 마감 일수 (예: 10일 전)
  scoringEndOffsetDays?: number; // 시험일 기준 채점 완료 기한 (예: 10일 후)
  managementStatus?:
    | '임시저장'
    | '진행중'
    | '진행완료'
    | '진행취소'
    | '자동완료'
    | '휴면완료'
    | '자동+휴면완료'
    | '승인완료';
}

// 카테고리 트리 (대 / 중 / 소)
const CATEGORY_TREE: Record<string, Record<string, string[]>> = {
  비즈니스: {
    '마케팅/기획': ['마케팅 제안서', '브랜딩 전략서'],
    '계약/법무': ['국내 계약서', '국제 계약서'],
  },
  일반: {
    '에세이/논술': ['시사 에세이', '자기소개서'],
  },
  기술: {
    '기술 문서': ['사용 설명서', '제품 스펙'],
  },
};

interface TranslatorInfo {
  id: string;
  name: string;
  languages: string;
  specialties: string;
  level: string;
}

const MOCK_TRANSLATORS: TranslatorInfo[] = [
  {
    id: 'tr-001',
    name: '김번역',
    languages: '한국어 → 영어, 영어 → 한국어',
    specialties: '비즈니스, 계약/법무',
    level: '전문1급',
  },
  {
    id: 'tr-002',
    name: '이프롬프트',
    languages: '한국어, 영어',
    specialties: '에세이/논술, 창의 글쓰기',
    level: '2급',
  },
  {
    id: 'tr-003',
    name: '박기술',
    languages: '한국어 → 영어',
    specialties: '기술 문서, 매뉴얼',
    level: '1급',
  },
];

const mockTemplates: ExamTemplate[] = [
  {
    id: 'exam-001',
    name: '전문1급 번역 시험 A형',
    type: '번역',
    mainCategory: '비즈니스',
    middleCategory: '마케팅/기획',
    subCategory: '마케팅 제안서',
    questionCount: 6,
    questionTypes: [
      { id: 'qt-1', kind: '객관식', count: 3 },
      { id: 'qt-2', kind: '주관식', count: 3 },
    ],
    durationMinutes: 90,
    status: 'open',
    assignedTranslatorId: 'tr-001',
    examDate: '2025-01-15',
    scoringEndDate: '2025-01-20',
    resultPublishDate: '2025-01-22',
    registrationStart: '2025-01-01',
    registrationEnd: '2025-01-10',
    authorDeadline: '2024-12-28',
    minApplicants: 10,
    baseFee: 30000,
    reviewFee: 50000,
    passScore: 60,
  },
  {
    id: 'exam-002',
    name: '프롬프트 작성 시험 B형',
    type: '프롬프트',
    mainCategory: '일반',
    middleCategory: '에세이/논술',
    subCategory: '시사 에세이',
    questionCount: 3,
    questionTypes: [{ id: 'qt-3', kind: '서술형', count: 3 }],
    durationMinutes: 60,
    status: 'draft',
    assignedTranslatorId: undefined,
    examDate: '2025-02-10',
    scoringEndDate: '2025-02-15',
    resultPublishDate: '2025-02-18',
    registrationStart: '2025-01-25',
    registrationEnd: '2025-02-05',
    authorDeadline: '2025-01-20',
    minApplicants: 5,
    baseFee: 20000,
    reviewFee: 40000,
    passScore: 70,
  },
];

export default function ExamsPage() {
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [pendingTranslatorId, setPendingTranslatorId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'create' | 'createNew' | 'list'>('create');
  const [draftVersion, setDraftVersion] = useState(0); // 변경 트리거용
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);

  const selectedExam = mockTemplates.find((e) => e.id === selectedExamId) ?? mockTemplates[0];
  const drafts = getDrafts();

  // 문항 유형 설정 상태 (간단히 컴포넌트 로컬에서만 관리)
  const [questionTypes, setQuestionTypes] = useState<QuestionTypeSetting[]>(
    selectedExam.questionTypes ?? [{ id: 'qt-init', kind: '객관식', count: selectedExam.questionCount }],
  );
  const totalQuestionCount = questionTypes.reduce((sum, qt) => sum + qt.count, 0);

  // 카테고리 선택 상태 (대/중/소)
  const [mainCategory, setMainCategory] = useState<string>(selectedExam.mainCategory);
  const [middleCategory, setMiddleCategory] = useState<string | ''>(selectedExam.middleCategory ?? '');
  const [subCategory, setSubCategory] = useState<string | ''>(selectedExam.subCategory ?? '');

  const middleOptions = mainCategory ? Object.keys(CATEGORY_TREE[mainCategory] ?? {}) : [];
  const subOptions =
    mainCategory && middleCategory
      ? CATEGORY_TREE[mainCategory]?.[middleCategory] ?? []
      : [];

  // 평가 기준 상태
  const [evaluationCriteria, setEvaluationCriteria] = useState<EvaluationCriteria[]>(
    selectedExam.evaluationCriteria ?? [
      { id: 'ec-1', name: '정확성', ratio: 25, subCriteria: [] },
      { id: 'ec-2', name: '적절성', ratio: 25, subCriteria: [] },
      { id: 'ec-3', name: '효율성', ratio: 25, subCriteria: [] },
      { id: 'ec-4', name: '윤리', ratio: 25, subCriteria: [] },
    ],
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="text-2xl font-bold">시험 관리</div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* 페이지 상단 헤더 */}
        <section className="bg-white rounded-lg border border-gray-200 p-6 flex items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">시험 관리</h1>
            <p className="text-sm text-gray-600">
              왼쪽 메뉴에서 &quot;시험 출제하기&quot;와 &quot;출제한 시험 리스트&quot;를 전환하여 시험을 설정하고 진행 상황을 확인합니다.
            </p>
          </div>
        </section>

        <div className="grid grid-cols-[220px,minmax(0,1fr)] gap-6 items-start">
          {/* 좌측: 로컬 사이드바 */}
          <aside className="bg-white rounded-lg border border-gray-200 p-4 space-y-2 text-sm">
            <button
              type="button"
              onClick={() => setActiveTab('create')}
              className={`w-full text-left px-3 py-2 rounded-md font-semibold ${
                activeTab === 'create'
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                  : 'bg-white text-gray-700 border border-transparent hover:bg-gray-50'
              }`}
            >
              시험 출제하기
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('createNew')}
              className={`w-full text-left px-3 py-2 rounded-md font-semibold ${
                activeTab === 'createNew'
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                  : 'bg-white text-gray-700 border border-transparent hover:bg-gray-50'
              }`}
            >
              시험 출제하기 (new)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('list')}
              className={`w-full text-left px-3 py-2 rounded-md font-semibold ${
                activeTab === 'list'
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                  : 'bg-white text-gray-700 border border-transparent hover:bg-gray-50'
              }`}
            >
              출제한 시험 리스트
            </button>
          </aside>

          {/* 우측: 탭별 내용 */}
          <section className="space-y-6">
            {activeTab === 'create' || activeTab === 'createNew' ? (
              <>
                {/* 상단: 템플릿 불러오기 / 새 시험 / 출시 */}
                <div className="bg-white rounded-lg border border-gray-200 p-6 flex items-center justify-between gap-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-1">시험 출제 설정</h2>
                    <p className="text-sm text-gray-600 mb-2">
                      시험 템플릿을 선택하고, 카테고리 · 문항 유형 · 일정 · 출제자를 설정한 뒤 &quot;출시&quot;를 눌러 출제자에게 전달합니다.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-semibold text-gray-700 hover:bg-gray-50"
                      onClick={() => setIsTemplateModalOpen(true)}
                    >
                      템플릿 불러오기
                    </button>
                    <button
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-semibold hover:bg-indigo-700"
                      onClick={() => {
                        // TODO: 서버 연동 시 실제 저장 로직으로 교체
                        alert('현재 시험 정보가 (mock) 저장되었습니다.');
                      }}
                    >
                      현재 시험정보 저장하기
                    </button>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* 선택된 시험 상세 설정 */}
                  <section className="space-y-6">
                    {/* 1. 기본 정보 */}
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <h2 className="text-sm font-semibold text-gray-900 mb-4">1. 기본 정보</h2>
              <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">시험명</label>
                  <input
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    defaultValue={selectedExam.name}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">유형</label>
                  <select
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white"
                    defaultValue={selectedExam.type}
                  >
                    <option value="번역">번역</option>
                    <option value="프롬프트">프롬프트</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">시험 교시 선택하기</label>
                  <select
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white"
                    defaultValue={selectedExam.examPeriod ?? 1}
                  >
                    {Array.from({ length: 8 }, (_, i) => i + 1).map((period) => (
                      <option key={period} value={period}>
                        {period}교시
                      </option>
                    ))}
                  </select>
                </div>
                {/* 카테고리 선택 (대/중/소 한 줄) */}
                <div className="col-span-2 flex flex-wrap gap-4 items-end">
                  <div className="flex-1 min-w-[160px]">
                    <label className="block text-xs text-gray-600 mb-1">대 카테고리</label>
                    <select
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white"
                      value={mainCategory}
                      onChange={(e) => {
                        const nextMain = e.target.value;
                        setMainCategory(nextMain);
                        const mids = Object.keys(CATEGORY_TREE[nextMain] ?? {});
                        const firstMid = mids[0] ?? '';
                        setMiddleCategory(firstMid);
                        const firstSub = firstMid
                          ? CATEGORY_TREE[nextMain]?.[firstMid]?.[0] ?? ''
                          : '';
                        setSubCategory(firstSub);
                      }}
                    >
                      {Object.keys(CATEGORY_TREE).map((key) => (
                        <option key={key} value={key}>
                          {key}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex-1 min-w-[160px]">
                    <label className="block text-xs text-gray-600 mb-1">중 카테고리 (선택)</label>
                    <select
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white"
                      value={middleCategory}
                      onChange={(e) => {
                        const nextMid = e.target.value;
                        setMiddleCategory(nextMid);
                        const firstSub =
                          nextMid && mainCategory
                            ? CATEGORY_TREE[mainCategory]?.[nextMid]?.[0] ?? ''
                            : '';
                        setSubCategory(firstSub);
                      }}
                    >
                      <option value="">선택 안 함</option>
                      {middleOptions.map((mid) => (
                        <option key={mid} value={mid}>
                          {mid}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex-1 min-w-[160px]">
                    <label className="block text-xs text-gray-600 mb-1">소 카테고리</label>
                    <select
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white"
                      value={subCategory}
                      onChange={(e) => setSubCategory(e.target.value)}
                      disabled={!middleCategory}
                    >
                      {subOptions.map((sub) => (
                        <option key={sub} value={sub}>
                          {sub}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 사용에디터 선택, 응시생, 시험등급 */}
                <div className="grid grid-cols-3 gap-4 text-sm mt-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">사용에디터 선택</label>
                    <select
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white"
                      defaultValue={selectedExam.editorType ?? '에디터'}
                    >
                      <option value="에디터">에디터</option>
                      <option value="영상 에디터">영상 에디터</option>
                      <option value="코딩 에디터">코딩 에디터</option>
                      <option value="번역 에디터">번역 에디터</option>
                      <option value="문서 에디터">문서 에디터</option>
                      <option value="프롬프트 에디터">프롬프트 에디터</option>
                      <option value="타사: 멤소스">타사: 멤소스</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">응시생</label>
                    <select
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white"
                      defaultValue={selectedExam.targetCandidate ?? '개인'}
                    >
                      <option value="개인">개인</option>
                      <option value="그룹">그룹</option>
                      <option value="개인/그룹">개인/그룹</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">시험등급</label>
                    <select
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white"
                      defaultValue={selectedExam.examGrade ?? ''}
                    >
                      <option value="">선택하세요</option>
                      <optgroup label="전문">
                        <option value="전문 1급">전문 1급</option>
                        <option value="전문 2급">전문 2급</option>
                      </optgroup>
                      <optgroup label="일반">
                        <option value="일반 1급">일반 1급</option>
                        <option value="일반 2급">일반 2급</option>
                        <option value="일반 3급">일반 3급</option>
                      </optgroup>
                      <optgroup label="교육급수">
                        <option value="교육급수 1급">교육급수 1급</option>
                        <option value="교육급수 2급">교육급수 2급</option>
                        <option value="교육급수 3급">교육급수 3급</option>
                        <option value="교육급수 4급">교육급수 4급</option>
                        <option value="교육급수 5급">교육급수 5급</option>
                        <option value="교육급수 6급">교육급수 6급</option>
                        <option value="교육급수 7급">교육급수 7급</option>
                        <option value="교육급수 8급">교육급수 8급</option>
                      </optgroup>
                    </select>
                  </div>
                </div>
              </div>

              {/* 자동채점 / 휴먼채점 비율 */}
              <div className="mt-4 border-t border-gray-100 pt-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-xs font-semibold text-gray-900">채점 비율 설정</h3>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-700">
                  <div className="flex items-center gap-2">
                    <label className="text-[11px] text-gray-600">자동채점</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      className="w-16 border border-gray-300 rounded-md px-2 py-1 text-xs"
                      defaultValue={selectedExam.autoGradingRatio ?? 80}
                    />
                    <span className="text-[11px] text-gray-500">%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-[11px] text-gray-600">휴먼채점</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      className="w-16 border border-gray-300 rounded-md px-2 py-1 text-xs"
                      defaultValue={selectedExam.humanGradingRatio ?? 20}
                    />
                    <span className="text-[11px] text-gray-500">%</span>
                  </div>
                  <span className="text-[11px] text-gray-400">(합계 100% 기준으로 설정)</span>
                </div>
              </div>

              {/* 문항 유형 / 수 / 시험 시간 */}
              <div className="mt-4 border-t border-gray-100 pt-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-xs font-semibold text-gray-900">문항 유형 및 수</h3>
                  <div className="ml-auto flex items-center gap-2">
                    <select
                      className="border border-gray-300 rounded-md px-2 py-1 text-[11px] bg-white"
                      defaultValue=""
                      onChange={(e) => {
                        const preset = e.target.value;
                        if (!preset) return;
                        if (preset === '공통영역') {
                          // 객관식 50문제 중 20개 랜덤 (기본 50문항으로 설정)
                          setQuestionTypes([{ id: 'qt-common', kind: '객관식', count: 50 }]);
                        } else if (preset === '번역시험') {
                          setQuestionTypes([{ id: 'qt-trans', kind: '주관식', count: 5 }]);
                        } else if (preset === '프롬프트시험') {
                          setQuestionTypes([{ id: 'qt-prompt', kind: '주관식', count: 5 }]);
                        } else if (preset === '윤리시험') {
                          setQuestionTypes([{ id: 'qt-ethic', kind: '객관식', count: 20 }]);
                        }
                        e.target.value = '';
                      }}
                    >
                      <option value="" disabled>
                        출제 규칙 프리셋 선택
                      </option>
                      <option value="공통영역">공통 영역 (객관식 50문제 중 20개 랜덤)</option>
                      <option value="번역시험">번역 시험 (주관식 5개 중 공용 2개)</option>
                      <option value="프롬프트시험">프롬프트 시험 (주관식 5개 중 공용 2개)</option>
                      <option value="윤리시험">윤리 시험 (객관식 20문제)</option>
                    </select>
                    <button
                      type="button"
                      className="px-2 py-1 rounded-md border border-gray-300 text-[11px] text-gray-700 hover:bg-gray-50"
                      onClick={() =>
                        setQuestionTypes((prev) => [
                          ...prev,
                          { id: `qt-${Date.now()}`, kind: '객관식', count: 1 },
                        ])
                      }
                    >
                      + 문항 추가
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  {questionTypes.map((qt, idx) => (
                    <div key={qt.id} className="flex items-center gap-2 text-xs">
                      <span className="w-10 text-gray-400">#{idx + 1}</span>
                      <select
                        className="w-28 border border-gray-300 rounded-md px-2 py-1 bg-white"
                        value={qt.kind}
                        onChange={(e) => {
                          const next = [...questionTypes];
                          next[idx] = { ...next[idx], kind: e.target.value as QuestionTypeSetting['kind'] };
                          setQuestionTypes(next);
                        }}
                      >
                        <option value="객관식">객관식</option>
                        <option value="주관식">주관식</option>
                        <option value="서술형">서술형</option>
                        <option value="번역">번역</option>
                        <option value="프롬프트">프롬프트</option>
                        <option value="custom">직접 입력</option>
                      </select>

                      {qt.kind === 'custom' && (
                        <input
                          type="text"
                          placeholder="문항 유형 입력"
                          className="w-32 border border-gray-300 rounded-md px-2 py-1 text-xs"
                          value={qt.customLabel ?? ''}
                          onChange={(e) => {
                            const next = [...questionTypes];
                            next[idx] = { ...next[idx], customLabel: e.target.value };
                            setQuestionTypes(next);
                          }}
                        />
                      )}

                      <div className="flex items-center gap-1">
                        <span className="text-gray-500">문항 수</span>
                        <input
                          type="number"
                          min={1}
                          className="w-16 border border-gray-300 rounded-md px-2 py-1 text-xs"
                          value={qt.count}
                          onChange={(e) => {
                            const value = Number(e.target.value) || 0;
                            const next = [...questionTypes];
                            next[idx] = { ...next[idx], count: value };
                            setQuestionTypes(next);
                          }}
                        />
                      </div>

                      {/* 유형별 난이도 비율 */}
                      <div className="flex items-center gap-1 text-[11px] text-gray-500">
                        <span>상</span>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          className="w-12 border border-gray-300 rounded-md px-1 py-0.5"
                          value={qt.difficultyHigh ?? ''}
                          onChange={(e) => {
                            const value = e.target.value === '' ? undefined : Number(e.target.value) || 0;
                            const next = [...questionTypes];
                            next[idx] = { ...next[idx], difficultyHigh: value };
                            setQuestionTypes(next);
                          }}
                        />
                        <span>중</span>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          className="w-12 border border-gray-300 rounded-md px-1 py-0.5"
                          value={qt.difficultyMedium ?? ''}
                          onChange={(e) => {
                            const value = e.target.value === '' ? undefined : Number(e.target.value) || 0;
                            const next = [...questionTypes];
                            next[idx] = { ...next[idx], difficultyMedium: value };
                            setQuestionTypes(next);
                          }}
                        />
                        <span>하</span>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          className="w-12 border border-gray-300 rounded-md px-1 py-0.5"
                          value={qt.difficultyLow ?? ''}
                          onChange={(e) => {
                            const value = e.target.value === '' ? undefined : Number(e.target.value) || 0;
                            const next = [...questionTypes];
                            next[idx] = { ...next[idx], difficultyLow: value };
                            setQuestionTypes(next);
                          }}
                        />
                      </div>
                      <button
                        type="button"
                        className="ml-auto px-2 py-1 text-[11px] text-gray-500 hover:text-red-600"
                        onClick={() =>
                          setQuestionTypes((prev) => prev.filter((item) => item.id !== qt.id))
                        }
                      >
                        삭제
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs text-gray-700 mt-2">
                  <div>
                    <span className="font-semibold">총 문항 수: </span>
                    <span>{totalQuestionCount}문항</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-700">시험 시간</span>
                    <input
                      type="number"
                      min={10}
                      className="w-20 border border-gray-300 rounded-md px-2 py-1 text-xs"
                      defaultValue={selectedExam.durationMinutes}
                    />
                    <span className="text-[11px] text-gray-500">분</span>
                  </div>
                </div>

                {/* 전체 문항 기준 난이도 비율 */}
                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-700">
                  <span className="font-semibold">전체 난이도 비율 (상/중/하, %)</span>
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] text-gray-500">상</span>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      className="w-16 border border-gray-300 rounded-md px-2 py-1 text-xs"
                      defaultValue={selectedExam.overallDifficultyHigh ?? 30}
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] text-gray-500">중</span>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      className="w-16 border border-gray-300 rounded-md px-2 py-1 text-xs"
                      defaultValue={selectedExam.overallDifficultyMedium ?? 50}
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] text-gray-500">하</span>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      className="w-16 border border-gray-300 rounded-md px-2 py-1 text-xs"
                      defaultValue={selectedExam.overallDifficultyLow ?? 20}
                    />
                  </div>
                  <span className="text-[11px] text-gray-400">(합계 100% 기준으로 설정)</span>
                </div>

                {/* 평가 기준 / 파일 종류 - createNew 탭에서는 제외 */}
                {activeTab === 'create' && (
                <div className="mt-4 border-t border-gray-100 pt-4 space-y-3 text-xs text-gray-700">
                  <h3 className="text-xs font-semibold text-gray-900">평가 기준 · 파일 종류</h3>
                  
                  {/* 대 평가 기준 설정 */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[11px] font-semibold text-gray-800">대 평가 기준</h4>
                      <button
                        type="button"
                        className="px-2 py-1 rounded-md border border-gray-300 text-[11px] text-gray-700 hover:bg-gray-50"
                        onClick={() => {
                          const newId = `ec-${Date.now()}`;
                          setEvaluationCriteria((prev) => [
                            ...prev,
                            { id: newId, name: '', ratio: 0, subCriteria: [] },
                          ]);
                        }}
                      >
                        + 대 평가 기준 추가
                      </button>
                    </div>
                    
                    <div className="space-y-2">
                      {evaluationCriteria.map((criteria, idx) => (
                        <div key={criteria.id} className="border border-gray-200 rounded-md p-3 bg-gray-50">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-[11px] text-gray-500 w-8">#{idx + 1}</span>
                            <input
                              type="text"
                              placeholder="대 평가 기준 이름 (예: 정확성, 적절성, 효율성, 윤리)"
                              className="flex-1 border border-gray-300 rounded-md px-2 py-1 text-xs"
                              value={criteria.name}
                              onChange={(e) => {
                                const next = [...evaluationCriteria];
                                next[idx] = { ...next[idx], name: e.target.value };
                                setEvaluationCriteria(next);
                              }}
                            />
                            <div className="flex items-center gap-1">
                              <label className="text-[11px] text-gray-600">비율:</label>
                              <input
                                type="number"
                                min={0}
                                max={100}
                                className="w-16 border border-gray-300 rounded-md px-2 py-1 text-xs"
                                value={criteria.ratio}
                                onChange={(e) => {
                                  const value = Number(e.target.value) || 0;
                                  const next = [...evaluationCriteria];
                                  next[idx] = { ...next[idx], ratio: value };
                                  setEvaluationCriteria(next);
                                }}
                              />
                              <span className="text-[11px] text-gray-500">%</span>
                            </div>
                            <button
                              type="button"
                              className="px-2 py-1 text-[11px] text-red-600 hover:text-red-800"
                              onClick={() => {
                                setEvaluationCriteria((prev) => prev.filter((_, i) => i !== idx));
                              }}
                            >
                              삭제
                            </button>
                          </div>
                          
                          {/* 소 평가 기준 (세부 체점지표) */}
                          <div className="ml-8 mt-2">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[11px] font-medium text-gray-700">소 평가 기준 (세부 체점지표)</span>
                              <button
                                type="button"
                                className="px-2 py-0.5 rounded border border-gray-300 text-[10px] text-gray-600 hover:bg-gray-100"
                                onClick={() => {
                                  const newSubId = `sub-${Date.now()}`;
                                  const next = [...evaluationCriteria];
                                  next[idx] = {
                                    ...next[idx],
                                    subCriteria: [
                                      ...next[idx].subCriteria,
                                      { id: newSubId, definition: '', factor: '', ratio: 0 },
                                    ],
                                  };
                                  setEvaluationCriteria(next);
                                }}
                              >
                                + 추가
                              </button>
                            </div>
                            {criteria.subCriteria.length > 0 ? (
                              <>
                                <div className="grid grid-cols-5 gap-2">
                                  {criteria.subCriteria.map((sub, subIdx) => {
                                    const subTotalRatio = criteria.subCriteria.reduce((sum, s) => sum + (s.ratio || 0), 0);
                                    const isOverLimit = subTotalRatio > criteria.ratio;
                                    return (
                                      <div key={sub.id} className="border border-gray-200 rounded-md p-1.5 bg-white">
                                        <div className="flex items-center justify-between mb-1">
                                          <span className="text-[9px] text-gray-500">#{subIdx + 1}</span>
                                          <button
                                            type="button"
                                            className="px-1 py-0.5 text-[9px] text-red-600 hover:text-red-800"
                                            onClick={() => {
                                              const next = [...evaluationCriteria];
                                              next[idx].subCriteria = next[idx].subCriteria.filter((_, i) => i !== subIdx);
                                              setEvaluationCriteria(next);
                                            }}
                                          >
                                            삭제
                                          </button>
                                        </div>
                                        <div className="space-y-1">
                                          <div>
                                            <label className="block text-[9px] text-gray-600 mb-0.5">정의</label>
                                            <input
                                              type="text"
                                              placeholder="정의"
                                              className="w-full border border-gray-300 rounded-md px-1.5 py-0.5 text-[10px]"
                                              value={sub.definition}
                                              onChange={(e) => {
                                                const next = [...evaluationCriteria];
                                                next[idx].subCriteria[subIdx] = { ...next[idx].subCriteria[subIdx], definition: e.target.value };
                                                setEvaluationCriteria(next);
                                              }}
                                            />
                                          </div>
                                          <div>
                                            <label className="block text-[9px] text-gray-600 mb-0.5">요인</label>
                                            <input
                                              type="text"
                                              placeholder="요인"
                                              className="w-full border border-gray-300 rounded-md px-1.5 py-0.5 text-[10px]"
                                              value={sub.factor}
                                              onChange={(e) => {
                                                const next = [...evaluationCriteria];
                                                next[idx].subCriteria[subIdx] = { ...next[idx].subCriteria[subIdx], factor: e.target.value };
                                                setEvaluationCriteria(next);
                                              }}
                                            />
                                          </div>
                                          <div>
                                            <label className="block text-[9px] text-gray-600 mb-0.5">비율</label>
                                            <div className="flex items-center gap-1">
                                              <input
                                                type="number"
                                                min={0}
                                                max={criteria.ratio}
                                                className="w-full border border-gray-300 rounded-md px-1.5 py-0.5 text-[10px]"
                                                value={sub.ratio || ''}
                                                onChange={(e) => {
                                                  const value = Math.min(Number(e.target.value) || 0, criteria.ratio);
                                                  const next = [...evaluationCriteria];
                                                  next[idx].subCriteria[subIdx] = { ...next[idx].subCriteria[subIdx], ratio: value };
                                                  setEvaluationCriteria(next);
                                                }}
                                              />
                                              <span className="text-[9px] text-gray-500">%</span>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                                <div className="mt-2 text-[10px] text-gray-600">
                                  소 평가 기준 비율 합계: {criteria.subCriteria.reduce((sum, s) => sum + (s.ratio || 0), 0)}% / 대 평가 기준 비율: {criteria.ratio}%
                                  {criteria.subCriteria.reduce((sum, s) => sum + (s.ratio || 0), 0) > criteria.ratio && (
                                    <span className="text-red-600 ml-2">(대 평가 기준 비율을 초과했습니다)</span>
                                  )}
                                </div>
                              </>
                            ) : (
                              <div className="text-[11px] text-gray-400 text-center py-2 border border-dashed border-gray-200 rounded-md">
                                소 평가 기준이 없습니다. &quot;+ 추가&quot; 버튼을 클릭하여 추가하세요.
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* 비율 합계 표시 */}
                    <div className="text-[11px] text-gray-600 mt-2">
                      총 비율: {evaluationCriteria.reduce((sum, c) => sum + c.ratio, 0)}%
                      {evaluationCriteria.reduce((sum, c) => sum + c.ratio, 0) !== 100 && (
                        <span className="text-red-600 ml-2">(합계가 100%가 되도록 설정하세요)</span>
                      )}
                    </div>
                  </div>

                  {/* 파일 종류 및 기타 설정 */}
                  <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-gray-200">
                    <div>
                      <label className="block mb-1 text-[11px] text-gray-500">검색 허용횟수</label>
                      <input
                        type="number"
                        min={0}
                        className="w-full border border-gray-300 rounded-md px-2 py-1"
                        defaultValue={selectedExam.allowedSearchCount ?? 0}
                      />
                      <p className="mt-1 text-[11px] text-gray-400">공통 영역 등에서 사용</p>
                    </div>
                    <div>
                      <label className="block mb-1 text-[11px] text-gray-500">파일 종류 (출제파일)</label>
                      <input
                        type="text"
                        placeholder="예: PDF, DOCX 등"
                        className="w-full border border-gray-300 rounded-md px-2 py-1"
                        defaultValue={selectedExam.fileType ?? ''}
                      />
                    </div>
                  </div>
                </div>
                )}
              </div>
            </div>

            {/* 2. 일정 / 접수 / 응시 조건 */}
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <h2 className="text-sm font-semibold text-gray-900 mb-4">2. 일정 · 접수 · 응시 조건</h2>
              <div className="grid grid-cols-2 gap-4 text-xs text-gray-700">
                {/* 왼쪽: 날짜 관련 */}
                <div className="space-y-4">
                  <div>
                    <p className="font-semibold mb-2">시험일 · 채점기간 · 결과 공개일</p>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block mb-1 text-[11px] text-gray-500">시험일</label>
                        <input
                          type="date"
                          defaultValue={selectedExam.examDate}
                          className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block mb-1 text-[11px] text-gray-500">채점 마감일</label>
                        <input
                          type="date"
                          defaultValue={selectedExam.scoringEndDate}
                          className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block mb-1 text-[11px] text-gray-500">결과 공개일</label>
                        <input
                          type="date"
                          defaultValue={selectedExam.resultPublishDate}
                          className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="font-semibold mb-2">접수 기간 · 출제 마감</p>
                    <div className="grid grid-cols-[1.2fr,1.2fr,1fr] gap-2 items-end">
                      <div>
                        <label className="block mb-1 text-[11px] text-gray-500">접수 시작</label>
                        <input
                          type="date"
                          defaultValue={selectedExam.registrationStart}
                          className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block mb-1 text-[11px] text-gray-500">접수 종료</label>
                        <input
                          type="date"
                          defaultValue={selectedExam.registrationEnd}
                          className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block mb-1 text-[11px] text-gray-500">출제 마감</label>
                        <input
                          type="date"
                          defaultValue={selectedExam.authorDeadline}
                          className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 오른쪽: 인원 / 비용 / 합격점수 */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 items-end">
                    <div>
                      <p className="font-semibold mb-1">최소 응시 인원</p>
                      <input
                        type="number"
                        min={1}
                        defaultValue={selectedExam.minApplicants ?? 0}
                        className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-xs"
                      />
                      <p className="mt-1 text-[11px] text-gray-500">미달 시 시험이 자동 취소될 수 있습니다.</p>
                    </div>
                    <div>
                      <p className="font-semibold mb-1">합격 점수</p>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          defaultValue={selectedExam.passScore ?? 60}
                          className="w-20 border border-gray-300 rounded-md px-2 py-1.5 text-xs"
                        />
                        <span className="text-[11px] text-gray-500">/ 100점</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="font-semibold mb-2">접수 비용</p>
                    <div className="grid grid-cols-2 gap-3 items-end">
                      <div>
                        <label className="block mb-1 text-[11px] text-gray-500">단순 접수</label>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min={0}
                            defaultValue={selectedExam.baseFee ?? 0}
                            className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-xs"
                          />
                          <span className="text-[11px] text-gray-500">원</span>
                        </div>
                      </div>
                      <div>
                        <label className="block mb-1 text-[11px] text-gray-500">전문가 검수 옵션</label>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min={0}
                            defaultValue={selectedExam.reviewFee ?? 0}
                            className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-xs"
                          />
                          <span className="text-[11px] text-gray-500">원</span>
                        </div>
                      </div>
                    </div>
                    <p className="mt-1 text-[11px] text-gray-500">
                      수험자는 접수 시 단순 접수 / 검수 옵션을 선택하고 결제합니다.
                    </p>
                  </div>
                </div>
              </div>

              {/* 관리 규칙 메타 정보 (접수 기간, 마감 기준 등) */}
              <div className="mt-4 border-t border-gray-100 pt-4 grid grid-cols-3 gap-3 text-xs text-gray-700">
                <div>
                  <label className="block mb-1 text-[11px] text-gray-500">기본 접수 기간 (주)</label>
                  <input
                    type="number"
                    min={1}
                    className="w-full border border-gray-300 rounded-md px-2 py-1.5"
                    defaultValue={selectedExam.registrationWeeks ?? 3}
                  />
                  <p className="mt-1 text-[11px] text-gray-400">예: 3주</p>
                </div>
                <div>
                  <label className="block mb-1 text-[11px] text-gray-500">접수 마감 기준 (시험 전 일수)</label>
                  <input
                    type="number"
                    min={0}
                    className="w-full border border-gray-300 rounded-md px-2 py-1.5"
                    defaultValue={selectedExam.registrationDeadlineOffsetDays ?? 10}
                  />
                  <p className="mt-1 text-[11px] text-gray-400">예: 시험 전 10일</p>
                </div>
                <div>
                  <label className="block mb-1 text-[11px] text-gray-500">채점 완료 기한 (시험 후 일수)</label>
                  <input
                    type="number"
                    min={0}
                    className="w-full border border-gray-300 rounded-md px-2 py-1.5"
                    defaultValue={selectedExam.scoringEndOffsetDays ?? 10}
                  />
                  <p className="mt-1 text-[11px] text-gray-400">예: 시험 후 10일</p>
                </div>
              </div>
            </div>

            {/* 3. 출제자 배정 / 상태 */}
            <div className="bg-white rounded-lg border border-gray-200 p-5 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-gray-900 mb-1">3. 출제자 배정 및 시험 상태</h2>
                <p className="text-xs text-gray-600 mb-2">
                  어떤 출제자에게 문제 출제를 맡길지 결정하고, 시험을 출시하거나 마감할 수 있습니다.
                </p>
                <div className="text-xs text-gray-700 space-y-1">
                  <div>
                    <span className="font-semibold">현재 배정된 출제자: </span>
                    {selectedExam.assignedTranslatorId
                      ? MOCK_TRANSLATORS.find((t) => t.id === selectedExam.assignedTranslatorId)?.name ||
                        '알 수 없음'
                      : '배정되지 않음'}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-700">관리 상태</span>
                    <select
                      className="border border-gray-300 rounded-md px-2 py-1 text-[11px] bg-white"
                      defaultValue={selectedExam.managementStatus ?? '임시저장'}
                    >
                      <option value="임시저장">임시 저장</option>
                      <option value="진행중">진행중</option>
                      <option value="진행완료">진행완료</option>
                      <option value="진행취소">진행취소</option>
                      <option value="자동완료">자동완료</option>
                      <option value="휴면완료">휴면완료</option>
                      <option value="자동+휴면완료">자동 + 휴면완료</option>
                      <option value="승인완료">승인완료</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 text-xs">
                <button
                  className="px-3 py-1.5 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  onClick={() => {
                    setPendingTranslatorId(selectedExam.assignedTranslatorId ?? null);
                    setIsAssignModalOpen(true);
                  }}
                >
                  출제자 배정
                </button>
                <button className="px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700">
                  출시
                </button>
              </div>
            </div>
                  </section>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">출제한 시험 리스트</h2>
                    <p className="text-xs text-gray-600 mt-1">
                      관리자에서 출시한 시험의 출제 진행 상태를 확인하고, 출제 완료된 시험을 최종 승인할 수 있습니다.
                    </p>
                  </div>
                  <span className="text-xs text-gray-500">총 {drafts.length}건</span>
                </div>

                {drafts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 border border-dashed border-gray-200 rounded-lg bg-gray-50">
                    <p className="text-gray-500 mb-2">아직 출시한 시험이 없습니다.</p>
                    <p className="text-xs text-gray-400 mb-4">
                      상단 메뉴에서 &quot;시험 출제하기&quot;를 선택하고, 출시 버튼을 눌러 출제자를 배정할 시험을 생성하세요.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left font-medium text-gray-500">시험명</th>
                          <th className="px-4 py-3 text-left font-medium text-gray-500">유형</th>
                          <th className="px-4 py-3 text-left font-medium text-gray-500">카테고리</th>
                          <th className="px-4 py-3 text-center font-medium text-gray-500">문항 수</th>
                          <th className="px-4 py-3 text-center font-medium text-gray-500">시험 시간</th>
                          <th className="px-4 py-3 text-left font-medium text-gray-500">출제자</th>
                          <th className="px-4 py-3 text-center font-medium text-gray-500">상태</th>
                          <th className="px-4 py-3 text-center font-medium text-gray-500">관리</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 bg-white">
                        {drafts.map((draft) => {
                          const categoryLabel = [
                            draft.mainCategory,
                            draft.middleCategory,
                            draft.subCategory,
                          ]
                            .filter(Boolean)
                            .join(' / ');

                          let statusBadgeClass = 'bg-gray-100 text-gray-700 border-gray-200';
                          let statusLabel: string = draft.status;
                          if (draft.status === '출제자전달완료') {
                            statusBadgeClass = 'bg-yellow-100 text-yellow-800 border-yellow-200';
                            statusLabel = '출제자에게 전달완료';
                          } else if (draft.status === '출제중') {
                            statusBadgeClass = 'bg-indigo-100 text-indigo-800 border-indigo-200';
                            statusLabel = '출제중';
                          } else if (draft.status === '출제완료') {
                            statusBadgeClass = 'bg-blue-100 text-blue-800 border-blue-200';
                          } else if (draft.status === '최종승인') {
                            statusBadgeClass = 'bg-green-100 text-green-800 border-green-200';
                          }

                          return (
                            <tr key={draft.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 align-top">
                                <div className="font-medium text-gray-900">{draft.title}</div>
                                <div className="text-xs text-gray-400">ID: {draft.id}</div>
                              </td>
                              <td className="px-4 py-3 align-top text-gray-700">{draft.type}</td>
                              <td className="px-4 py-3 align-top text-gray-700">{categoryLabel}</td>
                              <td className="px-4 py-3 align-top text-center text-gray-700">{draft.questionCount}문항</td>
                              <td className="px-4 py-3 align-top text-center text-gray-700">{draft.durationMinutes}분</td>
                              <td className="px-4 py-3 align-top text-gray-700">
                                {draft.assignedTranslatorId ? draft.assignedTranslatorId : '-'}
                              </td>
                              <td className="px-4 py-3 align-top text-center">
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusBadgeClass}`}
                                >
                                  {statusLabel}
                                </span>
                              </td>
                              <td className="px-4 py-3 align-top text-center">
                                {draft.status === '출제완료' ? (
                                  <button
                                    className="px-3 py-1.5 text-xs rounded-md bg-green-600 text-white font-semibold hover:bg-green-700"
                                    onClick={() => {
                                      approveDraft(draft.id);
                                      setDraftVersion((v) => v + 1);
                                    }}
                                  >
                                    최종 승인하기
                                  </button>
                                ) : draft.status === '최종승인' ? (
                                  <span className="text-xs text-gray-400">승인 완료</span>
                                ) : (
                                  <span className="text-xs text-gray-400">출제 진행 중</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* 템플릿 불러오기 모달 */}
      {isTemplateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6 text-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-900">시험 템플릿 불러오기</h2>
              <button
                className="text-xs text-gray-500 hover:text-gray-700"
                onClick={() => setIsTemplateModalOpen(false)}
              >
                닫기
              </button>
            </div>

            <p className="text-xs text-gray-600 mb-3">
              아래 목록에서 템플릿을 선택하면 해당 시험의 기본 정보, 카테고리, 문항 수, 일정이 현재 설정 화면에 불러와집니다.
            </p>

            <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-md mb-4 divide-y divide-gray-100">
              {mockTemplates.map((exam) => (
                <button
                  key={exam.id}
                  type="button"
                  onClick={() => {
                    setSelectedExamId(exam.id);
                    // 템플릿 기준으로 관련 상태 동기화
                    setMainCategory(exam.mainCategory);
                    setMiddleCategory(exam.middleCategory ?? '');
                    setSubCategory(exam.subCategory ?? '');
                    setQuestionTypes(
                      exam.questionTypes ?? [
                        { id: `qt-from-${exam.id}`, kind: '객관식', count: exam.questionCount },
                      ],
                    );
                    setIsTemplateModalOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 flex flex-col gap-1 text-xs bg-white hover:bg-gray-50"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-900 text-sm">{exam.name}</span>
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full ${
                        exam.status === 'open'
                          ? 'bg-green-100 text-green-700'
                          : exam.status === 'ready'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {exam.status === 'open'
                        ? '공개 중'
                        : exam.status === 'ready'
                        ? '출시 대기'
                        : '작성 중'}
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-600">
                    {exam.type} · {exam.mainCategory}{' '}
                    {exam.middleCategory ? `· ${exam.middleCategory}` : ''}{' '}
                    {exam.subCategory ? `· ${exam.subCategory}` : ''}
                  </div>
                  <div className="text-[11px] text-gray-500">
                    {exam.questionCount}문항 · {exam.durationMinutes}분
                  </div>
                </button>
              ))}
            </div>

            <div className="flex justify-end">
              <button
                className="px-3 py-1.5 border border-gray-300 rounded-md text-xs text-gray-700 hover:bg-gray-50"
                onClick={() => setIsTemplateModalOpen(false)}
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 출제자 배정 모달 */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-xl bg-white rounded-lg shadow-lg p-6 text-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-900">출제자 배정</h2>
              <button
                className="text-xs text-gray-500 hover:text-gray-700"
                onClick={() => setIsAssignModalOpen(false)}
              >
                닫기
              </button>
            </div>

            <p className="text-xs text-gray-600 mb-3">
              현재 등록된 출제자 목록입니다. 한 명을 선택해 이 시험의 출제자로 배정하세요.
            </p>

            <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-md mb-4 divide-y divide-gray-100">
              {MOCK_TRANSLATORS.map((t) => {
                const isSelected = pendingTranslatorId === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setPendingTranslatorId(t.id)}
                    className={`w-full text-left px-3 py-2 flex items-start gap-3 text-xs ${
                      isSelected ? 'bg-indigo-50' : 'bg-white hover:bg-gray-50'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-semibold text-gray-700">
                      {t.name.slice(0, 2)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-gray-900 text-sm">{t.name}</span>
                        <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px]">
                          {t.level}
                        </span>
                      </div>
                      <div className="text-[11px] text-gray-600 mb-0.5">언어: {t.languages}</div>
                      <div className="text-[11px] text-gray-600">전문 분야: {t.specialties}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* 선택 요약 + 제출 버튼 */}
            <div className="flex items-center justify-between text-xs">
              <div className="text-gray-700">
                <span className="font-semibold">선택된 출제자: </span>
                {pendingTranslatorId
                  ? MOCK_TRANSLATORS.find((t) => t.id === pendingTranslatorId)?.name || '알 수 없음'
                  : '아직 선택되지 않음'}
              </div>
              <div className="flex gap-2">
                <button
                  className="px-3 py-1.5 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  onClick={() => setIsAssignModalOpen(false)}
                >
                  취소
                </button>
                <button
                  className="px-3 py-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  disabled={!pendingTranslatorId}
                  onClick={() => {
                    // TODO: 실제 저장 로직 연결 (지금은 콘솔에만 출력)
                    console.log('Assign translator', pendingTranslatorId, 'to exam', selectedExam.id);
                    setIsAssignModalOpen(false);
                  }}
                >
                  최종 배정
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
