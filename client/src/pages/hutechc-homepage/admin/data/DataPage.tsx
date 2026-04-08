/* 원본: hutechc_hompage_real/app/(client-layout)/admin/data/page.tsx */
import { Link } from 'react-router';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Trash2, ChevronDown } from 'lucide-react';
import { adminTranslators } from '../../lib/adminTranslatorsMock';

type DataSection =
  | 'curriculum'
  | 'editing'
  | 'prompt-review'
  | 'expert-review'
  | 'translation'
  | 'tesol'
  | 'marketing';

const SIDEBAR_ITEMS: { id: DataSection; label: string }[] = [
  { id: 'curriculum', label: '1. 캉사들 커리큘럼' },
  { id: 'editing', label: '2. 에디팅 모듬' },
  { id: 'prompt-review', label: '3. 프롬프트 감수' },
  { id: 'expert-review', label: '4. 전문가 감수 모음' },
  { id: 'translation', label: '5. 번역 자료 모음' },
  { id: 'tesol', label: '6. 테솔 교사 레슨 자료' },
  { id: 'marketing', label: '7. 마케팅 디비 정리' },
];

const STORAGE_KEY = 'admin-data-management';

// --- 초기 데이터 ---
const INIT_CURRICULUM = [
  { id: 'tesol', name: '테솔', category: '교육', desc: '테솔 과정 커리큘럼' },
  { id: 'prompt', name: '프롬프트', category: '교육', desc: '프롬프트 과정' },
  { id: 'ai-trans', name: 'AI통번역', category: '교육', desc: 'AI 통번역 입문·심화' },
  { id: 'itt', name: 'ITT시험', category: '시험', desc: 'ITT 시험 대비' },
  { id: 'ethics', name: '윤리', category: '교육', desc: '윤리 교육' },
  { id: 'ai-translation', name: 'AI번역', category: '시험', desc: 'AI번역 검정' },
  { id: 'prompt-exam', name: '프롬프트 검정', category: '시험', desc: '프롬프트 시험' },
];

// 에디팅 결과 데이터 (DB)
const INIT_EDITING_DATA = [
  { id: 'ed-1', title: '계약서 문서폼 편집', editorType: '문서폼 에디터', docSummary: '법률 계약 초안 → 최종본', status: '완료', createdAt: '2024-01-10' },
  { id: 'ed-2', title: '뉴스레터 번역문 수정', editorType: '번역에디터', docSummary: '영문 원고 → 한글 배포용', status: '진행중', createdAt: '2024-01-12' },
  { id: 'ed-3', title: '프롬프트 톤 조정', editorType: '프롬프트 에디터', docSummary: '기술 문서용 톤 통일', status: '완료', createdAt: '2024-01-08' },
];

// 프롬프트 감수 데이터 (DB)
const INIT_PROMPT_REVIEW_DATA = [
  { id: 'pr-1', requestId: 'REQ-101', sourceSnippet: 'Please confirm the delivery schedule.', reviewedSnippet: '배송 일정 확인 부탁드립니다.', tone: '공식적인', model: 'ChatGPT', status: '완료', createdAt: '2024-01-11' },
  { id: 'pr-2', requestId: 'REQ-102', sourceSnippet: 'Let\'s grab coffee tomorrow.', reviewedSnippet: '내일 커피 한잔 할까요?', tone: '일상적인', model: 'Clova', status: '완료', createdAt: '2024-01-13' },
  { id: 'pr-3', requestId: 'REQ-103', sourceSnippet: 'API rate limit: 100 req/min.', reviewedSnippet: 'API 호출 제한: 분당 100회.', tone: '기술적', model: 'Gemini', status: '대기', createdAt: '2024-01-14' },
];

// 전문가 감수 의뢰 데이터 (DB)
const INIT_EXPERT_REVIEW_REQUESTS = [
  { id: 'er-1', expertName: '김전문', documentTitle: '의료 논문 초안', status: '완료', requestedAt: '2024-01-05', completedAt: '2024-01-09' },
  { id: 'er-2', expertName: '이감수', documentTitle: '법률 계약서 검토', status: '진행중', requestedAt: '2024-01-10', completedAt: '' },
  { id: 'er-3', expertName: '박교수', documentTitle: '기술 스펙 감수', status: '대기', requestedAt: '2024-01-12', completedAt: '' },
];

// 번역 데이터 (DB) — 원문·번역문 등 실제 번역 결과물
const INIT_TRANSLATION_DATA = [
  { id: 'tr-1', requestId: 'T-1001', sourceText: 'This Agreement is entered into as of the date above.', translatedText: '본 계약은 상기 날짜에 체결된다.', sourceLang: 'en', targetLang: 'ko', field: '법률/계약', status: '완료', createdAt: '2024-01-08', wordCount: 12, clientName: 'A법무사', translatorName: '김영희' },
  { id: 'tr-2', requestId: 'T-1002', sourceText: '부품 번호 및 수량을 확인해 주세요.', translatedText: 'Please confirm the part numbers and quantities.', sourceLang: 'ko', targetLang: 'en', field: '기술/IT', status: '완료', createdAt: '2024-01-09', wordCount: 8, clientName: 'B산업', translatorName: '이철수' },
  { id: 'tr-3', requestId: 'T-1003', sourceText: '마케팅 캠페인 결과 보고서 초안', translatedText: 'Draft report on marketing campaign results', sourceLang: 'ko', targetLang: 'en', field: '마케팅', status: '진행중', createdAt: '2024-01-12', wordCount: 6, clientName: 'C광고', translatorName: '미배정' },
];

const INIT_TESOL = [
  { id: 1, unit: '1단원', title: '언어학 기초', category: '비즈니스', difficulty: '중급', duration: '45분' },
  { id: 2, unit: '2단원', title: '문법 지도법', category: '비즈니스', difficulty: '중급', duration: '50분' },
  { id: 3, unit: '3단원', title: '듣기·말하기 활동', category: '비즈니스', difficulty: '고급', duration: '55분' },
  { id: 4, unit: '4단원', title: '읽기·쓰기 지도', category: '비즈니스', difficulty: '고급', duration: '50분' },
  { id: 5, unit: '5단원', title: '교실 영어', category: '비즈니스', difficulty: '중급', duration: '45분' },
];

// 마케팅 DB 옵션 데이터
const MARKETING_OPTIONS = {
  useTech: ['TTT', 'SSS'],
  majorCategory: ['일반', '전문'],
  middleCategory: [
    '비즈니스', '교육', '메타', '작성', '기획서', '번역/통역', '문서', '노무', 
    '법률', '주식', '부동산', '세금', '방송', '성장', '경쟁', '콘텐츠', '개발', '보안', '예술 및 문화'
  ],
  minorCategory: [
    '사업계획서', '회사소개', 'PPT', '엑셀', '기획서', '법률(소송장, 준비서면, 형사, 민사)', 
    '의료', '특허', '노무', '교재', '논문', '기사', '고전', '각 업무별 분야별 전문분야',
    '아나운서', '관광가이드', '큐레이터', '안내 방송', '교육', '실시간', '화상수업',
    'SNS', '유튜브', '다큐멘터리', '영화', '드라마', '예능', '웹디자인', '모바일디자인',
    '랜딩페이지', '웹기획', '사업기획', '홍보기획', '백엔드', '프론트', '디비(DB)', '빅데이터',
    '컨텐츠', '개인정보', '드라마', '웹툰소설', '소설', '시', '음악', '미술', '자가 선택'
  ],
  age: ['10대', '20대', '30대', '40대', '50대+'],
  situationTop: [
    '커리어 상향', '학업/학습 상향', '문서/업무 상향', '번역/통역 상향', 
    '전문직 스킬 상향', '의사결정/구매 단계', '인정/동기 상태'
  ],
  needsTop: [
    '자격증 필요(스킬)', '검색 SEO(데이타)', '공식(정부/회사)', '공개 경쟁(뉴스/위키)', 
    '오피셜(교사/시드백)', '번역/통역(공식)', '문서 작성 속도'
  ],
  needsBottom: [
    '정확성', '속도', '차별화', '직무확장', '재택', '실무경험', '범용자격'
  ],
  keyPointAction: [
    'AI 써도, 틀리지는 않을까 한번 더 체크!', '오류를 먼저 없애고, 내 생각에 집중하여 최종본을 완성합니다.'
  ],
  keyPointThought: [
    'AI 써도, 틀리지는 않을까 한번 더 체크!'
  ],
  keyPointApproval: [
    '감사', '평가', '승인'
  ],
  aiKnowledge: [
    '① 연관성(정확성)', '① 오류(정확성)'
  ],
  content: [
    '① 서비스 소개서', '① FAQ'
  ],
  request: [
    '① 법률 고수 확인', '① 개인정보 수집 여부'
  ],
  verification: ['검증 항목'],
  evaluation: ['평가 항목'],
  approval: ['승인 항목'],
  usage: [
    'ChatGPT(GPT/OpenAI)', 'Gemini', 'Copilot', 'DeepL', 'Google Translate', 'Papago', 
    'Whisper(STT)', 'Google STT', 'Azure TTS', 'Google TTS', 'OCN(음성 TTS)', 
    'RAW(실시간 기념 영상)', 'TMS'
  ],
};

// 대중소 분류 구조 (두 번째 이미지 기준) - 향후 사용 예정
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const CATEGORY_STRUCTURE: Record<string, Record<string, string[]>> = {
  '공통 - 프롬, 번역': {
    '문서': ['일반', '전문', '분야'],
    '음성': ['방송 및 안내', '강의'],
    '영상': ['콘텐츠'],
    '개발': ['디자인', '기획', '프로그램', '보안'],
    '창의적 활동': ['예술 및 문학'],
  },
  '프롬프트 별도': {
    '이미지 제작': ['홍보물(브로셔, 포스터)'],
    '영상': ['분야선택'],
    '음성': ['분야 선택'],
    '문서': ['분야 선택'],
  },
  '통역별도': {
    '순차 통역': ['회의 통역'],
    '동시 통역': ['회의통역'],
    '음성통역': ['회의 통역'],
  },
  '번역 별도': {
    '전문': ['화장품', '반도체', '방산', '뉴스', '정치', '경제', '문학', '공학', '부동산', '로봇', '바이오등'],
  },
  '확장분야': {
    '건강': ['암', '요리'],
    '돈': ['재무', '주식', '부동산'],
    '사람': ['자녀', '연애', '입시', '사주', '결혼'],
    '취업': ['영어', '직장찾기'],
    '기타': ['요리', '운동'],
  },
};

// 마케팅 DB 데이터 (타겟별 마케팅 전략 DB)
const INIT_MARKETING_DATA: MarketingDataRow[] = [
  {
    id: 'mk-1',
    useTech: ['TTT'],
    majorCategory: ['일반'],
    middleCategory: ['비즈니스'],
    minorCategory: ['사업계획서'],
    age: ['20대', '30대'],
    situationTop: ['커리어 상향'],
    situationMiddle: '취업 준비 중이거나 이직 준비 중인 주니어/경력직이 커리어 전환을 위해 필요한 정보를 얻고 싶을 때',
    needsTop: ['자격증 필요(스킬)'],
    needsBottom: ['차별화'],
    keyPointAction: [],
    keyPointThought: ['AI 써도, 틀리지는 않을까 한번 더 체크!'],
    keyPointApproval: [],
    chatbotCopy: '오류를 먼저 없애고, 내 생각에 집중하여 최종본을 완성합니다.',
    aiKnowledge: ['① 연관성(정확성)'],
    content: ['① 서비스 소개서'],
    request: ['① 법률 고수 확인'],
    verification: [],
    evaluation: [],
    approval: [],
    usage: ['ChatGPT(GPT/OpenAI)', 'Gemini'],
  },
  {
    id: 'mk-2',
    useTech: ['SSS'],
    majorCategory: ['일반'],
    middleCategory: ['번역/통역'],
    minorCategory: ['자가 선택'],
    age: ['30대', '40대'],
    situationTop: ['문서/업무 상향'],
    situationMiddle: '',
    needsTop: ['번역/통역(공식)'],
    needsBottom: ['직무확장'],
    keyPointAction: [],
    keyPointThought: [],
    keyPointApproval: [],
    chatbotCopy: '',
    aiKnowledge: [],
    content: [],
    request: [],
    verification: [],
    evaluation: [],
    approval: [],
    usage: ['DeepL', 'Google Translate'],
  },
];

function loadStored<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const v = parsed[key];
    return (v !== undefined && v !== null ? v : fallback) as T;
  } catch {
    return fallback;
  }
}

function saveStored(key: string, value: unknown) {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const prev = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
    prev[key] = value;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prev));
  } catch {
    /* noop */
  }
}

type CurriculumRow = { id: string; name: string; category: string; desc: string };
type EditingDataRow = { id: string; title: string; editorType: string; docSummary: string; status: string; createdAt: string };
type PromptReviewDataRow = { id: string; requestId: string; sourceSnippet: string; reviewedSnippet: string; tone: string; model: string; status: string; createdAt: string };
type ExpertReviewRequestRow = { id: string; expertName: string; documentTitle: string; status: string; requestedAt: string; completedAt: string };
type TranslationDataRow = { id: string; requestId: string; sourceText: string; translatedText: string; sourceLang: string; targetLang: string; field: string; status: string; createdAt: string; wordCount: number; clientName: string; translatorName: string };
type TesolRow = { id: number; unit: string; title: string; category: string; difficulty: string; duration: string };
type MarketingDataRow = {
  id: string;
  // 사용기술 (토글)
  useTech: string[]; // TTT, SSS
  // 대분류 (토글)
  majorCategory: string[]; // 일반, 전문
  // 중분류 (체크박스)
  middleCategory: string[]; // 비즈니스, 교육, 메타, 작성, 기획서, 번역/통역, 문서, 노무, 법률, 주식, 부동산, 세금, 방송, 성장, 경쟁, 콘텐츠, 개발, 보안, 예술 및 문화
  // 소분류 (체크박스)
  minorCategory: string[]; // 사업계획서, 회사소개, 대학생, 전문직, 주니어, 시니어 등
  // 나이 (체크박스)
  age: string[]; // 10대, 20대, 30대, 40대, 50대+
  // 상황 상 (체크박스)
  situationTop: string[]; // 커리어 상향, 학업/학습 상향, 문서/업무 상향, 번역/통역 상향, 전문직 스킬 상향, 의사결정/구매 단계, 인정/동기 상태
  // 상황 중 (텍스트)
  situationMiddle: string; // 긴 문장
  // 니즈 상 (체크박스)
  needsTop: string[]; // 자격증 필요(스킬), 검색 SEO(데이타), 공식(정부/회사), 공개 경쟁(뉴스/위키), 오피셜(교사/시드백), 번역/통역(공식), 문서 작성 속도 등
  // 니즈 하 (체크박스)
  needsBottom: string[]; // 체크박스 항목들
  // 핵심포인트(행동) (체크박스)
  keyPointAction: string[]; // 체크박스 항목들
  // 핵심포인트(생각) (체크박스)
  keyPointThought: string[]; // AI 써도, 틀리지는 않을까 한번 더 체크! 등
  // 핵심포인트(감사, 평가, 승인) (체크박스)
  keyPointApproval: string[]; // 체크박스 항목들
  // 챗봇카피 (텍스트)
  chatbotCopy: string; // 오류를 먼저 없애고, 내 생각에 집중하여 최종본을 완성합니다. 등
  // AI 지식(챗봇) (체크박스)
  aiKnowledge: string[]; // ① 연관성(정확성), ① 오류(정확성) 등
  // 콘텐츠 (체크박스)
  content: string[]; // ① 서비스 소개서, ① FAQ 등
  // 요청사항 (체크박스)
  request: string[]; // ① 법률 고수 확인, ① 개인정보 수집 여부 등
  // 검증 (체크박스)
  verification: string[]; // 체크박스 항목들
  // 평가 (체크박스)
  evaluation: string[]; // 체크박스 항목들
  // 승인 (체크박스)
  approval: string[]; // 체크박스 항목들
  // 사용 (체크박스)
  usage: string[]; // ChatGPT(GPT/OpenAI), Gemini, Copilot, DeepL, Google Translate, Papago, Whisper(STT), Google STT, Azure TTS, Google TTS, OCN(음성 TTS), RAW(실시간 기념 영상), TMS
};

export default function DataPage() {
  const [active, setActive] = useState<DataSection>('curriculum');

  const [curriculum, setCurriculum] = useState<CurriculumRow[]>(() =>
    loadStored('curriculum', INIT_CURRICULUM)
  );
  const [editingData, setEditingData] = useState<EditingDataRow[]>(() =>
    loadStored('editingData', INIT_EDITING_DATA)
  );
  const [promptReviewData, setPromptReviewData] = useState<PromptReviewDataRow[]>(() =>
    loadStored('promptReviewData', INIT_PROMPT_REVIEW_DATA)
  );
  const [expertReviewRequests, setExpertReviewRequests] = useState<ExpertReviewRequestRow[]>(() =>
    loadStored('expertReviewRequests', INIT_EXPERT_REVIEW_REQUESTS)
  );
  const [translationData, setTranslationData] = useState<TranslationDataRow[]>(() =>
    loadStored('translationData', INIT_TRANSLATION_DATA)
  );
  const [tesol, setTesol] = useState<TesolRow[]>(() => loadStored('tesol', INIT_TESOL));
  const [marketingData, setMarketingData] = useState<MarketingDataRow[]>(() =>
    loadStored('marketingData', INIT_MARKETING_DATA)
  );
  const [expandedMarketingItems, setExpandedMarketingItems] = useState<Set<number>>(new Set());

  const persist = useCallback(() => {
    saveStored('curriculum', curriculum);
    saveStored('editingData', editingData);
    saveStored('promptReviewData', promptReviewData);
    saveStored('expertReviewRequests', expertReviewRequests);
    saveStored('translationData', translationData);
    saveStored('tesol', tesol);
    saveStored('marketingData', marketingData);
  }, [
    curriculum,
    editingData,
    promptReviewData,
    expertReviewRequests,
    translationData,
    tesol,
    marketingData,
  ]);

  useEffect(() => {
    persist();
  }, [persist]);

  const addRow = (
    type:
      | 'curriculum'
      | 'editing'
      | 'promptReview'
      | 'expertReview'
      | 'translation'
      | 'tesol'
      | 'marketing'
  ) => {
    if (type === 'curriculum') {
      setCurriculum((prev) => [
        ...prev,
        { id: `new-${Date.now()}`, name: '', category: '', desc: '' },
      ]);
    }
    if (type === 'editing') {
      setEditingData((prev) => [
        ...prev,
        { id: `ed-${Date.now()}`, title: '', editorType: '', docSummary: '', status: '', createdAt: new Date().toISOString().slice(0, 10) },
      ]);
    }
    if (type === 'promptReview') {
      setPromptReviewData((prev) => [
        ...prev,
        { id: `pr-${Date.now()}`, requestId: '', sourceSnippet: '', reviewedSnippet: '', tone: '', model: '', status: '', createdAt: new Date().toISOString().slice(0, 10) },
      ]);
    }
    if (type === 'expertReview') {
      setExpertReviewRequests((prev) => [
        ...prev,
        { id: `er-${Date.now()}`, expertName: '', documentTitle: '', status: '', requestedAt: '', completedAt: '' },
      ]);
    }
    if (type === 'translation') {
      setTranslationData((prev) => [
        ...prev,
        { id: `tr-${Date.now()}`, requestId: '', sourceText: '', translatedText: '', sourceLang: '', targetLang: '', field: '', status: '', createdAt: new Date().toISOString().slice(0, 10), wordCount: 0, clientName: '', translatorName: '' },
      ]);
    }
    if (type === 'tesol') {
      const maxId = Math.max(0, ...tesol.map((r) => r.id));
      setTesol((prev) => [
        ...prev,
        {
          id: maxId + 1,
          unit: '',
          title: '',
          category: '',
          difficulty: '',
          duration: '',
        },
      ]);
    }
    if (type === 'marketing') {
      setMarketingData((prev) => [
        ...prev,
        {
          id: `mk-${Date.now()}`,
          useTech: [],
          majorCategory: [],
          middleCategory: [],
          minorCategory: [],
          age: [],
          situationTop: [],
          situationMiddle: '',
          needsTop: [],
          needsBottom: [],
          keyPointAction: [],
          keyPointThought: [],
          keyPointApproval: [],
          chatbotCopy: '',
          aiKnowledge: [],
          content: [],
          request: [],
          verification: [],
          evaluation: [],
          approval: [],
          usage: [],
        },
      ]);
    }
  };

  const removeRow = (
    type:
      | 'curriculum'
      | 'editing'
      | 'promptReview'
      | 'expertReview'
      | 'translation'
      | 'tesol'
      | 'marketing',
    index: number
  ) => {
    if (type === 'curriculum') setCurriculum((prev) => prev.filter((_, i) => i !== index));
    if (type === 'editing') setEditingData((prev) => prev.filter((_, i) => i !== index));
    if (type === 'promptReview') setPromptReviewData((prev) => prev.filter((_, i) => i !== index));
    if (type === 'expertReview') setExpertReviewRequests((prev) => prev.filter((_, i) => i !== index));
    if (type === 'translation') setTranslationData((prev) => prev.filter((_, i) => i !== index));
    if (type === 'tesol') setTesol((prev) => prev.filter((_, i) => i !== index));
    if (type === 'marketing') setMarketingData((prev) => prev.filter((_, i) => i !== index));
  };

  const updateCurriculum = (index: number, patch: Partial<CurriculumRow>) => {
    setCurriculum((prev) =>
      prev.map((r, i) => (i === index ? { ...r, ...patch } : r))
    );
  };
  const updateEditing = (index: number, patch: Partial<EditingDataRow>) => {
    setEditingData((prev) =>
      prev.map((r, i) => (i === index ? { ...r, ...patch } : r))
    );
  };
  const updatePromptReview = (index: number, patch: Partial<PromptReviewDataRow>) => {
    setPromptReviewData((prev) =>
      prev.map((r, i) => (i === index ? { ...r, ...patch } : r))
    );
  };
  const updateExpertReview = (index: number, patch: Partial<ExpertReviewRequestRow>) => {
    setExpertReviewRequests((prev) =>
      prev.map((r, i) => (i === index ? { ...r, ...patch } : r))
    );
  };
  const updateTranslation = (index: number, patch: Partial<TranslationDataRow>) => {
    setTranslationData((prev) =>
      prev.map((r, i) => (i === index ? { ...r, ...patch } : r))
    );
  };
  const updateTesol = (index: number, patch: Partial<TesolRow>) => {
    setTesol((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  };
  const updateMarketing = (index: number, patch: Partial<MarketingDataRow>) => {
    setMarketingData((prev) =>
      prev.map((r, i) => (i === index ? { ...r, ...patch } : r))
    );
  };

  const inputCls =
    'w-full px-2 py-1 border border-gray-200 rounded text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent';

  // 커스텀 멀티 셀렉트 드롭다운 컴포넌트 (컴팩트 버전)
  const MultiSelectDropdown = ({
    options,
    selected,
    onChange,
    placeholder = '선택하세요',
    label,
  }: {
    options: string[];
    selected: string[];
    onChange: (selected: string[]) => void;
    placeholder?: string;
    label: string;
  }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleOption = (option: string) => {
      const newSelected = selected.includes(option)
        ? selected.filter((s) => s !== option)
        : [...selected, option];
      onChange(newSelected);
    };

    return (
      <div className="relative" ref={dropdownRef}>
        <label className="block text-[10px] font-medium text-gray-600 mb-1">{label}</label>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-2 py-1 text-left border border-gray-300 rounded bg-white text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent flex items-center justify-between"
        >
          <span className={`truncate ${selected.length === 0 ? 'text-gray-400' : 'text-gray-900'}`}>
            {selected.length === 0 ? placeholder : selected.join(', ')}
          </span>
          <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform shrink-0 ml-1 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        {isOpen && (
          <div className="absolute z-50 w-full mt-0.5 bg-white border border-gray-300 rounded shadow-lg max-h-48 overflow-auto">
            {options.map((option) => (
              <label
                key={option}
                className="flex items-center px-2 py-1 hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(option)}
                  onChange={() => toggleOption(option)}
                  className="w-3 h-3 text-indigo-600 rounded focus:ring-indigo-500"
                />
                <span className="ml-1.5 text-xs text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-[1440px] mx-auto px-6 h-16 flex items-center justify-between">
          <div>
            <div className="text-lg font-semibold text-gray-900">데이터 관리</div>
            <div className="text-xs text-gray-500">데이터 조회·수정·추가 (변경 시 자동 저장)</div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={persist}
              className="px-3 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700"
            >
              저장
            </button>
            <Link to="/hutechc-homepage/admin/dashboard" className="text-sm text-gray-600 hover:underline">
              대시보드
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 flex gap-6">
        <aside className="w-52 min-w-[13rem] flex-shrink-0 bg-white border border-gray-200 rounded-lg p-3 h-fit sticky top-24">
          <h2 className="text-xs font-semibold text-gray-700 mb-2">데이터 관리</h2>
          <nav>
            <ul className="space-y-0.5">
              {SIDEBAR_ITEMS.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => setActive(item.id)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      active === item.id
                        ? 'bg-indigo-50 text-indigo-700 font-semibold'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        <main className="flex-1 min-w-0 space-y-6">
          {active === 'curriculum' && (
            <section className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                <div>
                  <h2 className="text-base font-semibold text-gray-900">1. 캉사들 커리큘럼</h2>
                  <p className="text-xs text-gray-500 mt-0.5">커리큘럼 데이터 (과정·시험 DB)</p>
                </div>
                <button
                  type="button"
                  onClick={() => addRow('curriculum')}
                  className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700"
                >
                  <Plus className="w-4 h-4" /> 추가
                </button>
              </div>
              <div className="p-4 overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 px-3 font-medium text-gray-700">ID</th>
                      <th className="text-left py-2 px-3 font-medium text-gray-700">과정명</th>
                      <th className="text-left py-2 px-3 font-medium text-gray-700">카테고리</th>
                      <th className="text-left py-2 px-3 font-medium text-gray-700">설명</th>
                      <th className="w-10" />
                    </tr>
                  </thead>
                  <tbody>
                    {curriculum.map((r, i) => (
                      <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                        <td className="py-1 px-2">
                          <input
                            value={r.id}
                            onChange={(e) => updateCurriculum(i, { id: e.target.value })}
                            className={inputCls}
                          />
                        </td>
                        <td className="py-1 px-2">
                          <input
                            value={r.name}
                            onChange={(e) => updateCurriculum(i, { name: e.target.value })}
                            className={inputCls}
                          />
                        </td>
                        <td className="py-1 px-2">
                          <input
                            value={r.category}
                            onChange={(e) => updateCurriculum(i, { category: e.target.value })}
                            className={inputCls}
                          />
                        </td>
                        <td className="py-1 px-2">
                          <input
                            value={r.desc}
                            onChange={(e) => updateCurriculum(i, { desc: e.target.value })}
                            className={inputCls}
                          />
                        </td>
                        <td className="py-1 px-2">
                          <button
                            type="button"
                            onClick={() => removeRow('curriculum', i)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {active === 'editing' && (
            <section className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                <div>
                  <h2 className="text-base font-semibold text-gray-900">2. 에디팅 모듬</h2>
                  <p className="text-xs text-gray-500 mt-0.5">에디팅 결과 데이터 (편집된 문서·컨텐츠 DB)</p>
                </div>
                <button
                  type="button"
                  onClick={() => addRow('editing')}
                  className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700"
                >
                  <Plus className="w-4 h-4" /> 추가
                </button>
              </div>
              <div className="p-4 overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 px-3 font-medium text-gray-700">ID</th>
                      <th className="text-left py-2 px-3 font-medium text-gray-700">제목</th>
                      <th className="text-left py-2 px-3 font-medium text-gray-700">에디터 유형</th>
                      <th className="text-left py-2 px-3 font-medium text-gray-700">요약</th>
                      <th className="text-left py-2 px-3 font-medium text-gray-700">상태</th>
                      <th className="text-left py-2 px-3 font-medium text-gray-700">등록일</th>
                      <th className="w-10" />
                    </tr>
                  </thead>
                  <tbody>
                    {editingData.map((r, i) => (
                      <tr key={r.id} className="border-b border-gray-100">
                        <td className="py-1 px-2">
                          <input value={r.id} onChange={(e) => updateEditing(i, { id: e.target.value })} className={`${inputCls} font-mono text-xs w-20`} />
                        </td>
                        <td className="py-1 px-2">
                          <input value={r.title} onChange={(e) => updateEditing(i, { title: e.target.value })} className={inputCls} placeholder="제목" />
                        </td>
                        <td className="py-1 px-2">
                          <input value={r.editorType} onChange={(e) => updateEditing(i, { editorType: e.target.value })} className={inputCls} placeholder="에디터" />
                        </td>
                        <td className="py-1 px-2">
                          <input value={r.docSummary} onChange={(e) => updateEditing(i, { docSummary: e.target.value })} className={inputCls} placeholder="요약" />
                        </td>
                        <td className="py-1 px-2">
                          <input value={r.status} onChange={(e) => updateEditing(i, { status: e.target.value })} className={inputCls} placeholder="상태" />
                        </td>
                        <td className="py-1 px-2">
                          <input value={r.createdAt} onChange={(e) => updateEditing(i, { createdAt: e.target.value })} className={inputCls} placeholder="YYYY-MM-DD" />
                        </td>
                        <td className="py-1 px-2">
                          <button type="button" onClick={() => removeRow('editing', i)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {active === 'prompt-review' && (
            <section className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                <div>
                  <h2 className="text-base font-semibold text-gray-900">3. 프롬프트 감수</h2>
                  <p className="text-xs text-gray-500 mt-0.5">프롬프트 감수 데이터 (요청·결과 DB)</p>
                </div>
                <button
                  type="button"
                  onClick={() => addRow('promptReview')}
                  className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700"
                >
                  <Plus className="w-4 h-4" /> 추가
                </button>
              </div>
              <div className="p-4 overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 px-3 font-medium text-gray-700">ID</th>
                      <th className="text-left py-2 px-3 font-medium text-gray-700">의뢰ID</th>
                      <th className="text-left py-2 px-3 font-medium text-gray-700">원문 일부</th>
                      <th className="text-left py-2 px-3 font-medium text-gray-700">감수 후 일부</th>
                      <th className="text-left py-2 px-3 font-medium text-gray-700">톤</th>
                      <th className="text-left py-2 px-3 font-medium text-gray-700">모델</th>
                      <th className="text-left py-2 px-3 font-medium text-gray-700">상태</th>
                      <th className="text-left py-2 px-3 font-medium text-gray-700">일자</th>
                      <th className="w-10" />
                    </tr>
                  </thead>
                  <tbody>
                    {promptReviewData.map((r, i) => (
                      <tr key={r.id} className="border-b border-gray-100">
                        <td className="py-1 px-2">
                          <input value={r.id} onChange={(e) => updatePromptReview(i, { id: e.target.value })} className={`${inputCls} font-mono text-xs w-16`} />
                        </td>
                        <td className="py-1 px-2">
                          <input value={r.requestId} onChange={(e) => updatePromptReview(i, { requestId: e.target.value })} className={inputCls} />
                        </td>
                        <td className="py-1 px-2">
                          <input value={r.sourceSnippet} onChange={(e) => updatePromptReview(i, { sourceSnippet: e.target.value })} className={inputCls} placeholder="원문" />
                        </td>
                        <td className="py-1 px-2">
                          <input value={r.reviewedSnippet} onChange={(e) => updatePromptReview(i, { reviewedSnippet: e.target.value })} className={inputCls} placeholder="감수문" />
                        </td>
                        <td className="py-1 px-2">
                          <input value={r.tone} onChange={(e) => updatePromptReview(i, { tone: e.target.value })} className={inputCls} />
                        </td>
                        <td className="py-1 px-2">
                          <input value={r.model} onChange={(e) => updatePromptReview(i, { model: e.target.value })} className={inputCls} />
                        </td>
                        <td className="py-1 px-2">
                          <input value={r.status} onChange={(e) => updatePromptReview(i, { status: e.target.value })} className={inputCls} />
                        </td>
                        <td className="py-1 px-2">
                          <input value={r.createdAt} onChange={(e) => updatePromptReview(i, { createdAt: e.target.value })} className={inputCls} />
                        </td>
                        <td className="py-1 px-2">
                          <button type="button" onClick={() => removeRow('promptReview', i)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {active === 'expert-review' && (
            <section className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                <div>
                  <h2 className="text-base font-semibold text-gray-900">4. 전문가 감수 모음</h2>
                  <p className="text-xs text-gray-500 mt-0.5">감수 의뢰 데이터 (DB) + 전문가 샘플</p>
                </div>
                <button
                  type="button"
                  onClick={() => addRow('expertReview')}
                  className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700"
                >
                  <Plus className="w-4 h-4" /> 추가
                </button>
              </div>
              <div className="p-4 space-y-6">
                <div className="overflow-x-auto">
                  <h3 className="text-sm font-medium text-gray-800 mb-2">감수 의뢰 데이터</h3>
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 px-3 font-medium text-gray-700">ID</th>
                        <th className="text-left py-2 px-3 font-medium text-gray-700">전문가</th>
                        <th className="text-left py-2 px-3 font-medium text-gray-700">문서 제목</th>
                        <th className="text-left py-2 px-3 font-medium text-gray-700">상태</th>
                        <th className="text-left py-2 px-3 font-medium text-gray-700">의뢰일</th>
                        <th className="text-left py-2 px-3 font-medium text-gray-700">완료일</th>
                        <th className="w-10" />
                      </tr>
                    </thead>
                    <tbody>
                      {expertReviewRequests.map((r, i) => (
                        <tr key={r.id} className="border-b border-gray-100">
                          <td className="py-1 px-2">
                            <input value={r.id} onChange={(e) => updateExpertReview(i, { id: e.target.value })} className={`${inputCls} font-mono text-xs w-16`} />
                          </td>
                          <td className="py-1 px-2">
                            <input value={r.expertName} onChange={(e) => updateExpertReview(i, { expertName: e.target.value })} className={inputCls} />
                          </td>
                          <td className="py-1 px-2">
                            <input value={r.documentTitle} onChange={(e) => updateExpertReview(i, { documentTitle: e.target.value })} className={inputCls} />
                          </td>
                          <td className="py-1 px-2">
                            <input value={r.status} onChange={(e) => updateExpertReview(i, { status: e.target.value })} className={inputCls} />
                          </td>
                          <td className="py-1 px-2">
                            <input value={r.requestedAt} onChange={(e) => updateExpertReview(i, { requestedAt: e.target.value })} className={inputCls} />
                          </td>
                          <td className="py-1 px-2">
                            <input value={r.completedAt} onChange={(e) => updateExpertReview(i, { completedAt: e.target.value })} className={inputCls} />
                          </td>
                          <td className="py-1 px-2">
                            <button type="button" onClick={() => removeRow('expertReview', i)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="overflow-x-auto">
                  <h3 className="text-sm font-medium text-gray-800 mb-2">전문가 샘플 (읽기 전용)</h3>
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 px-3 font-medium text-gray-700">이름</th>
                        <th className="text-left py-2 px-3 font-medium text-gray-700">레벨</th>
                        <th className="text-left py-2 px-3 font-medium text-gray-700">유형</th>
                        <th className="text-left py-2 px-3 font-medium text-gray-700">분야</th>
                        <th className="text-left py-2 px-3 font-medium text-gray-700">채널</th>
                        <th className="text-left py-2 px-3 font-medium text-gray-700">평점</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adminTranslators.slice(0, 8).map((e) => (
                        <tr key={e.id} className="border-b border-gray-100">
                          <td className="py-2 px-3 font-medium text-gray-900">{e.name}</td>
                          <td className="py-2 px-3 text-gray-600">{e.level}</td>
                          <td className="py-2 px-3 text-gray-600">{e.expertType}</td>
                          <td className="py-2 px-3 text-gray-600">{e.area} / {e.subArea}</td>
                          <td className="py-2 px-3 text-gray-600">{e.serviceChannels.join(', ')}</td>
                          <td className="py-2 px-3 text-gray-600">{e.rating}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {active === 'translation' && (
            <section className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                <div>
                  <h2 className="text-base font-semibold text-gray-900">5. 번역 자료 모음</h2>
                  <p className="text-xs text-gray-500 mt-0.5">번역 데이터 (원문·번역문 등 번역 결과물 DB)</p>
                </div>
                <button
                  type="button"
                  onClick={() => addRow('translation')}
                  className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700"
                >
                  <Plus className="w-4 h-4" /> 추가
                </button>
              </div>
              <div className="p-4 overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 px-3 font-medium text-gray-700">ID</th>
                      <th className="text-left py-2 px-3 font-medium text-gray-700">의뢰ID</th>
                      <th className="text-left py-2 px-3 font-medium text-gray-700">원문 일부</th>
                      <th className="text-left py-2 px-3 font-medium text-gray-700">번역문 일부</th>
                      <th className="text-left py-2 px-3 font-medium text-gray-700">원→대상</th>
                      <th className="text-left py-2 px-3 font-medium text-gray-700">분야</th>
                      <th className="text-left py-2 px-3 font-medium text-gray-700">상태</th>
                      <th className="text-left py-2 px-3 font-medium text-gray-700">등록일</th>
                      <th className="text-left py-2 px-3 font-medium text-gray-700">워드</th>
                      <th className="text-left py-2 px-3 font-medium text-gray-700">의뢰자</th>
                      <th className="text-left py-2 px-3 font-medium text-gray-700">번역사</th>
                      <th className="w-10" />
                    </tr>
                  </thead>
                  <tbody>
                    {translationData.map((r, i) => (
                      <tr key={r.id} className="border-b border-gray-100">
                        <td className="py-1 px-2">
                          <input value={r.id} onChange={(e) => updateTranslation(i, { id: e.target.value })} className={`${inputCls} font-mono text-xs w-16`} />
                        </td>
                        <td className="py-1 px-2">
                          <input value={r.requestId} onChange={(e) => updateTranslation(i, { requestId: e.target.value })} className={inputCls} />
                        </td>
                        <td className="py-1 px-2 max-w-[140px]">
                          <input value={r.sourceText} onChange={(e) => updateTranslation(i, { sourceText: e.target.value })} className={inputCls} placeholder="원문" />
                        </td>
                        <td className="py-1 px-2 max-w-[140px]">
                          <input value={r.translatedText} onChange={(e) => updateTranslation(i, { translatedText: e.target.value })} className={inputCls} placeholder="번역문" />
                        </td>
                        <td className="py-1 px-2">
                          <div className="flex gap-1 items-center">
                            <input value={r.sourceLang} onChange={(e) => updateTranslation(i, { sourceLang: e.target.value })} className={`${inputCls} w-12 text-xs`} placeholder="원" />
                            <span className="text-gray-400">→</span>
                            <input value={r.targetLang} onChange={(e) => updateTranslation(i, { targetLang: e.target.value })} className={`${inputCls} w-12 text-xs`} placeholder="대상" />
                          </div>
                        </td>
                        <td className="py-1 px-2">
                          <input value={r.field} onChange={(e) => updateTranslation(i, { field: e.target.value })} className={inputCls} />
                        </td>
                        <td className="py-1 px-2">
                          <input value={r.status} onChange={(e) => updateTranslation(i, { status: e.target.value })} className={inputCls} />
                        </td>
                        <td className="py-1 px-2">
                          <input value={r.createdAt} onChange={(e) => updateTranslation(i, { createdAt: e.target.value })} className={inputCls} />
                        </td>
                        <td className="py-1 px-2">
                          <input type="number" value={r.wordCount} onChange={(e) => updateTranslation(i, { wordCount: Number(e.target.value) || 0 })} className={`${inputCls} w-14`} />
                        </td>
                        <td className="py-1 px-2">
                          <input value={r.clientName} onChange={(e) => updateTranslation(i, { clientName: e.target.value })} className={inputCls} />
                        </td>
                        <td className="py-1 px-2">
                          <input value={r.translatorName} onChange={(e) => updateTranslation(i, { translatorName: e.target.value })} className={inputCls} />
                        </td>
                        <td className="py-1 px-2">
                          <button type="button" onClick={() => removeRow('translation', i)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {active === 'tesol' && (
            <section className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                <div>
                  <h2 className="text-base font-semibold text-gray-900">6. 테솔 교사 레슨 자료</h2>
                  <p className="text-xs text-gray-500 mt-0.5">테솔 레슨 자료 데이터 (단원·카테고리 DB)</p>
                </div>
                <button
                  type="button"
                  onClick={() => addRow('tesol')}
                  className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700"
                >
                  <Plus className="w-4 h-4" /> 추가
                </button>
              </div>
              <div className="p-4 overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 px-3 font-medium text-gray-700">단원</th>
                      <th className="text-left py-2 px-3 font-medium text-gray-700">제목</th>
                      <th className="text-left py-2 px-3 font-medium text-gray-700">카테고리</th>
                      <th className="text-left py-2 px-3 font-medium text-gray-700">난이도</th>
                      <th className="text-left py-2 px-3 font-medium text-gray-700">소요</th>
                      <th className="w-10" />
                    </tr>
                  </thead>
                  <tbody>
                    {tesol.map((r, i) => (
                      <tr key={r.id} className="border-b border-gray-100">
                        <td className="py-1 px-2">
                          <input
                            value={r.unit}
                            onChange={(e) => updateTesol(i, { unit: e.target.value })}
                            className={inputCls}
                          />
                        </td>
                        <td className="py-1 px-2">
                          <input
                            value={r.title}
                            onChange={(e) => updateTesol(i, { title: e.target.value })}
                            className={inputCls}
                          />
                        </td>
                        <td className="py-1 px-2">
                          <input
                            value={r.category}
                            onChange={(e) => updateTesol(i, { category: e.target.value })}
                            className={inputCls}
                          />
                        </td>
                        <td className="py-1 px-2">
                          <input
                            value={r.difficulty}
                            onChange={(e) => updateTesol(i, { difficulty: e.target.value })}
                            className={inputCls}
                          />
                        </td>
                        <td className="py-1 px-2">
                          <input
                            value={r.duration}
                            onChange={(e) => updateTesol(i, { duration: e.target.value })}
                            className={inputCls}
                          />
                        </td>
                        <td className="py-1 px-2">
                          <button
                            type="button"
                            onClick={() => removeRow('tesol', i)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {active === 'marketing' && (
            <section className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                <div>
                  <h2 className="text-base font-semibold text-gray-900">7. 마케팅 디비 정리</h2>
                  <p className="text-xs text-gray-500 mt-0.5">타겟별 마케팅 전략 DB (토글·체크박스·대중소 분류)</p>
                </div>
                <button
                  type="button"
                  onClick={() => addRow('marketing')}
                  className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700"
                >
                  <Plus className="w-4 h-4" /> 추가
                </button>
              </div>
              <div className="p-3 space-y-3">
                {marketingData.map((r, i) => {
                  const isExpanded = expandedMarketingItems.has(i);
                  return (
                  <div key={r.id} className="border border-gray-200 rounded-lg overflow-hidden">
                    {/* 헤더 */}
                    <div className="flex items-center justify-between gap-2 p-2 bg-gray-50 hover:bg-gray-100 cursor-pointer" onClick={() => {
                      const newExpanded = new Set(expandedMarketingItems);
                      if (isExpanded) {
                        newExpanded.delete(i);
                      } else {
                        newExpanded.add(i);
                      }
                      setExpandedMarketingItems(newExpanded);
                    }}>
                      <div className="flex items-center gap-2 flex-1">
                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        <input 
                          value={r.id} 
                          onChange={(e) => {
                            e.stopPropagation();
                            updateMarketing(i, { id: e.target.value });
                          }} 
                          onClick={(e) => e.stopPropagation()}
                          className={`${inputCls} font-mono text-xs w-24`} 
                          placeholder="ID"
                        />
                        <span className="text-xs text-gray-500">
                          {r.useTech?.length ? `사용기술: ${r.useTech.join(', ')}` : ''}
                          {r.majorCategory?.length ? ` | 대분류: ${r.majorCategory.join(', ')}` : ''}
                        </span>
                      </div>
                      <button 
                        type="button" 
                        onClick={(e) => {
                          e.stopPropagation();
                          removeRow('marketing', i);
                        }} 
                        className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    
                    {/* 내용 */}
                    {isExpanded && (
                    <div className="p-3 space-y-2">
                    
                    {/* 첫 번째 줄: 사용기술, 대분류, 나이 */}
                    <div className="grid grid-cols-3 gap-2">
                      <MultiSelectDropdown
                        label="사용기술"
                        options={MARKETING_OPTIONS.useTech}
                        selected={r.useTech || []}
                        onChange={(selected: string[]) => updateMarketing(i, { useTech: selected })}
                        placeholder="선택"
                      />
                      <MultiSelectDropdown
                        label="대분류"
                        options={MARKETING_OPTIONS.majorCategory}
                        selected={r.majorCategory || []}
                        onChange={(selected: string[]) => updateMarketing(i, { majorCategory: selected })}
                        placeholder="선택"
                      />
                      <div>
                        <label className="block text-[10px] font-medium text-gray-600 mb-1">나이</label>
                        <div className="flex flex-wrap gap-1">
                          {MARKETING_OPTIONS.age.map((age) => (
                            <label key={age} className="flex items-center px-1.5 py-0.5 border border-gray-300 rounded hover:bg-gray-50 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={(r.age || []).includes(age)}
                                onChange={(e) => {
                                  const current = r.age || [];
                                  const newValue = e.target.checked
                                    ? [...current, age]
                                    : current.filter((a) => a !== age);
                                  updateMarketing(i, { age: newValue });
                                }}
                                className="w-3 h-3 text-indigo-600 rounded focus:ring-indigo-500"
                              />
                              <span className="ml-1 text-[10px] text-gray-700">{age}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* 중분류, 소분류 */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-medium text-gray-600 mb-1">중분류</label>
                        <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto p-1.5 border border-gray-200 rounded">
                          {MARKETING_OPTIONS.middleCategory.map((cat) => (
                            <label key={cat} className="flex items-center px-1.5 py-0.5 border border-gray-300 rounded hover:bg-gray-50 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={(r.middleCategory || []).includes(cat)}
                                onChange={(e) => {
                                  const current = r.middleCategory || [];
                                  const newValue = e.target.checked
                                    ? [...current, cat]
                                    : current.filter((c) => c !== cat);
                                  updateMarketing(i, { middleCategory: newValue });
                                }}
                                className="w-3 h-3 text-indigo-600 rounded focus:ring-indigo-500"
                              />
                              <span className="ml-1 text-[10px] text-gray-700">{cat}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-medium text-gray-600 mb-1">소분류</label>
                        <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto p-1.5 border border-gray-200 rounded">
                          {MARKETING_OPTIONS.minorCategory.map((cat) => (
                            <label key={cat} className="flex items-center px-1.5 py-0.5 border border-gray-300 rounded hover:bg-gray-50 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={(r.minorCategory || []).includes(cat)}
                                onChange={(e) => {
                                  const current = r.minorCategory || [];
                                  const newValue = e.target.checked
                                    ? [...current, cat]
                                    : current.filter((c) => c !== cat);
                                  updateMarketing(i, { minorCategory: newValue });
                                }}
                                className="w-3 h-3 text-indigo-600 rounded focus:ring-indigo-500"
                              />
                              <span className="ml-1 text-[10px] text-gray-700">{cat}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* 상황 상, 니즈 상, 니즈 하 */}
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[10px] font-medium text-gray-600 mb-1">상황 상</label>
                        <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto p-1 border border-gray-200 rounded">
                          {MARKETING_OPTIONS.situationTop.map((sit) => (
                            <label key={sit} className="flex items-center px-1 py-0.5 border border-gray-300 rounded hover:bg-gray-50 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={(r.situationTop || []).includes(sit)}
                                onChange={(e) => {
                                  const current = r.situationTop || [];
                                  const newValue = e.target.checked
                                    ? [...current, sit]
                                    : current.filter((s) => s !== sit);
                                  updateMarketing(i, { situationTop: newValue });
                                }}
                                className="w-3 h-3 text-indigo-600 rounded focus:ring-indigo-500"
                              />
                              <span className="ml-1 text-[10px] text-gray-700">{sit}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-medium text-gray-600 mb-1">니즈 상</label>
                        <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto p-1 border border-gray-200 rounded">
                          {MARKETING_OPTIONS.needsTop.map((need) => (
                            <label key={need} className="flex items-center px-1 py-0.5 border border-gray-300 rounded hover:bg-gray-50 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={(r.needsTop || []).includes(need)}
                                onChange={(e) => {
                                  const current = r.needsTop || [];
                                  const newValue = e.target.checked
                                    ? [...current, need]
                                    : current.filter((n) => n !== need);
                                  updateMarketing(i, { needsTop: newValue });
                                }}
                                className="w-3 h-3 text-indigo-600 rounded focus:ring-indigo-500"
                              />
                              <span className="ml-1 text-[10px] text-gray-700">{need}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-medium text-gray-600 mb-1">니즈 하</label>
                        <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto p-1 border border-gray-200 rounded">
                          {MARKETING_OPTIONS.needsBottom.map((need) => (
                            <label key={need} className="flex items-center px-1 py-0.5 border border-gray-300 rounded hover:bg-gray-50 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={(r.needsBottom || []).includes(need)}
                                onChange={(e) => {
                                  const current = r.needsBottom || [];
                                  const newValue = e.target.checked
                                    ? [...current, need]
                                    : current.filter((n) => n !== need);
                                  updateMarketing(i, { needsBottom: newValue });
                                }}
                                className="w-3 h-3 text-indigo-600 rounded focus:ring-indigo-500"
                              />
                              <span className="ml-1 text-[10px] text-gray-700">{need}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* 상황 중 (텍스트) */}
                    <div>
                      <label className="block text-[10px] font-medium text-gray-600 mb-1">상황 중</label>
                      <textarea
                        value={r.situationMiddle || ''}
                        onChange={(e) => updateMarketing(i, { situationMiddle: e.target.value })}
                        className={`${inputCls} w-full h-16 text-xs`}
                        placeholder="상황 설명을 입력하세요"
                      />
                    </div>

                    {/* 핵심포인트들 */}
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[10px] font-medium text-gray-600 mb-1">핵심포인트(행동)</label>
                        <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto p-1 border border-gray-200 rounded">
                          {MARKETING_OPTIONS.keyPointAction.map((kp) => (
                            <label key={kp} className="flex items-center px-1 py-0.5 border border-gray-300 rounded hover:bg-gray-50 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={(r.keyPointAction || []).includes(kp)}
                                onChange={(e) => {
                                  const current = r.keyPointAction || [];
                                  const newValue = e.target.checked
                                    ? [...current, kp]
                                    : current.filter((k) => k !== kp);
                                  updateMarketing(i, { keyPointAction: newValue });
                                }}
                                className="w-3 h-3 text-indigo-600 rounded focus:ring-indigo-500"
                              />
                              <span className="ml-1 text-[10px] text-gray-700">{kp}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-medium text-gray-600 mb-1">핵심포인트(생각)</label>
                        <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto p-1 border border-gray-200 rounded">
                          {MARKETING_OPTIONS.keyPointThought.map((kp) => (
                            <label key={kp} className="flex items-center px-1 py-0.5 border border-gray-300 rounded hover:bg-gray-50 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={(r.keyPointThought || []).includes(kp)}
                                onChange={(e) => {
                                  const current = r.keyPointThought || [];
                                  const newValue = e.target.checked
                                    ? [...current, kp]
                                    : current.filter((k) => k !== kp);
                                  updateMarketing(i, { keyPointThought: newValue });
                                }}
                                className="w-3 h-3 text-indigo-600 rounded focus:ring-indigo-500"
                              />
                              <span className="ml-1 text-[10px] text-gray-700">{kp}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-medium text-gray-600 mb-1">핵심포인트(승인)</label>
                        <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto p-1 border border-gray-200 rounded">
                          {MARKETING_OPTIONS.keyPointApproval.map((kp) => (
                            <label key={kp} className="flex items-center px-1 py-0.5 border border-gray-300 rounded hover:bg-gray-50 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={(r.keyPointApproval || []).includes(kp)}
                                onChange={(e) => {
                                  const current = r.keyPointApproval || [];
                                  const newValue = e.target.checked
                                    ? [...current, kp]
                                    : current.filter((k) => k !== kp);
                                  updateMarketing(i, { keyPointApproval: newValue });
                                }}
                                className="w-3 h-3 text-indigo-600 rounded focus:ring-indigo-500"
                              />
                              <span className="ml-1 text-[10px] text-gray-700">{kp}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* 챗봇카피, AI 지식, 콘텐츠 */}
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[10px] font-medium text-gray-600 mb-1">챗봇카피</label>
                        <textarea
                          value={r.chatbotCopy || ''}
                          onChange={(e) => updateMarketing(i, { chatbotCopy: e.target.value })}
                          className={`${inputCls} w-full h-16 text-xs`}
                          placeholder="챗봇 응답"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-medium text-gray-600 mb-1">AI 지식</label>
                        <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto p-1 border border-gray-200 rounded">
                          {MARKETING_OPTIONS.aiKnowledge.map((ai) => (
                            <label key={ai} className="flex items-center px-1 py-0.5 border border-gray-300 rounded hover:bg-gray-50 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={(r.aiKnowledge || []).includes(ai)}
                                onChange={(e) => {
                                  const current = r.aiKnowledge || [];
                                  const newValue = e.target.checked
                                    ? [...current, ai]
                                    : current.filter((a) => a !== ai);
                                  updateMarketing(i, { aiKnowledge: newValue });
                                }}
                                className="w-3 h-3 text-indigo-600 rounded focus:ring-indigo-500"
                              />
                              <span className="ml-1 text-[10px] text-gray-700">{ai}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-medium text-gray-600 mb-1">콘텐츠</label>
                        <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto p-1 border border-gray-200 rounded">
                          {MARKETING_OPTIONS.content.map((cont) => (
                            <label key={cont} className="flex items-center px-1 py-0.5 border border-gray-300 rounded hover:bg-gray-50 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={(r.content || []).includes(cont)}
                                onChange={(e) => {
                                  const current = r.content || [];
                                  const newValue = e.target.checked
                                    ? [...current, cont]
                                    : current.filter((c) => c !== cont);
                                  updateMarketing(i, { content: newValue });
                                }}
                                className="w-3 h-3 text-indigo-600 rounded focus:ring-indigo-500"
                              />
                              <span className="ml-1 text-[10px] text-gray-700">{cont}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* 요청사항, 검증, 평가, 승인 */}
                    <div className="grid grid-cols-4 gap-2">
                      <div>
                        <label className="block text-[10px] font-medium text-gray-600 mb-1">요청사항</label>
                        <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto p-1 border border-gray-200 rounded">
                          {MARKETING_OPTIONS.request.map((req) => (
                            <label key={req} className="flex items-center px-1 py-0.5 border border-gray-300 rounded hover:bg-gray-50 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={(r.request || []).includes(req)}
                                onChange={(e) => {
                                  const current = r.request || [];
                                  const newValue = e.target.checked
                                    ? [...current, req]
                                    : current.filter((r) => r !== req);
                                  updateMarketing(i, { request: newValue });
                                }}
                                className="w-3 h-3 text-indigo-600 rounded focus:ring-indigo-500"
                              />
                              <span className="ml-1 text-[10px] text-gray-700">{req}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-medium text-gray-600 mb-1">검증</label>
                        <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto p-1 border border-gray-200 rounded">
                          {MARKETING_OPTIONS.verification.map((ver) => (
                            <label key={ver} className="flex items-center px-1 py-0.5 border border-gray-300 rounded hover:bg-gray-50 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={(r.verification || []).includes(ver)}
                                onChange={(e) => {
                                  const current = r.verification || [];
                                  const newValue = e.target.checked
                                    ? [...current, ver]
                                    : current.filter((v) => v !== ver);
                                  updateMarketing(i, { verification: newValue });
                                }}
                                className="w-3 h-3 text-indigo-600 rounded focus:ring-indigo-500"
                              />
                              <span className="ml-1 text-[10px] text-gray-700">{ver}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-medium text-gray-600 mb-1">평가</label>
                        <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto p-1 border border-gray-200 rounded">
                          {MARKETING_OPTIONS.evaluation.map((evalItem) => (
                            <label key={evalItem} className="flex items-center px-1 py-0.5 border border-gray-300 rounded hover:bg-gray-50 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={(r.evaluation || []).includes(evalItem)}
                                onChange={(e) => {
                                  const current = r.evaluation || [];
                                  const newValue = e.target.checked
                                    ? [...current, evalItem]
                                    : current.filter((item) => item !== evalItem);
                                  updateMarketing(i, { evaluation: newValue });
                                }}
                                className="w-3 h-3 text-indigo-600 rounded focus:ring-indigo-500"
                              />
                              <span className="ml-1 text-[10px] text-gray-700">{evalItem}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-medium text-gray-600 mb-1">승인</label>
                        <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto p-1 border border-gray-200 rounded">
                          {MARKETING_OPTIONS.approval.map((app) => (
                            <label key={app} className="flex items-center px-1 py-0.5 border border-gray-300 rounded hover:bg-gray-50 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={(r.approval || []).includes(app)}
                                onChange={(e) => {
                                  const current = r.approval || [];
                                  const newValue = e.target.checked
                                    ? [...current, app]
                                    : current.filter((a) => a !== app);
                                  updateMarketing(i, { approval: newValue });
                                }}
                                className="w-3 h-3 text-indigo-600 rounded focus:ring-indigo-500"
                              />
                              <span className="ml-1 text-[10px] text-gray-700">{app}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* 사용 (체크박스) */}
                    <div>
                      <label className="block text-[10px] font-medium text-gray-600 mb-1">사용</label>
                      <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto p-1 border border-gray-200 rounded">
                        {MARKETING_OPTIONS.usage.map((use) => (
                          <label key={use} className="flex items-center px-1.5 py-0.5 border border-gray-300 rounded hover:bg-gray-50 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={(r.usage || []).includes(use)}
                              onChange={(e) => {
                                const current = r.usage || [];
                                const newValue = e.target.checked
                                  ? [...current, use]
                                  : current.filter((u) => u !== use);
                                updateMarketing(i, { usage: newValue });
                              }}
                              className="w-3 h-3 text-indigo-600 rounded focus:ring-indigo-500"
                            />
                            <span className="ml-1 text-[10px] text-gray-700">{use}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    </div>
                    )}
                  </div>
                );
                })}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
