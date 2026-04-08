/* 원본: hutechc_hompage_real/app/(client-layout)/admin/settings/page.tsx */
import { useEffect, useMemo, useState } from 'react';
import * as XLSX from 'xlsx';

const STORAGE_KEY = 'hutechc-admin-settings';

type SettingsTab = 'common' | 'pages' | 'curriculum';

type PageConfig = {
  key: string;
  name: string;
  status: '준비중' | '적용중' | '미적용';
};

type CurriculumStatus = '준비중' | '적용중' | '미적용';
type CurriculumLevelSelection = {
  large: string | null;
  mid: string | null;
  small: string | null;
};
type CurriculumWeekRow = {
  id: string;
  week: number;
  cells: Record<string, string>; // key = columnId
};
type CurriculumColumn = {
  id: string;
  title: string;
};
type CurriculumStage = {
  id: string;
  stepTitle: string; // 예: 1단계
  hours: number; // 예: 60
  className: string; // 반명
  courseName: string; // 과정 명칭
  targets: string[]; // 대상(checkbox item ids)
  field: CurriculumLevelSelection; // 분야 선택(대/중/소)
  level: CurriculumLevelSelection; // 급수 선택(대/중/소)
  /** 커리큘럼 편집: 공통데이터 블록 연결(카테고리=상단, 체크/드롭=대상 옆) */
  commonTopBlockIds?: string[]; // category block ids
  commonSideBlockIds?: string[]; // checkbox/dropdown block ids
  categorySelections?: Record<string, CurriculumLevelSelection>; // blockId -> selection
  dropdownSelections?: Record<string, string>; // blockId -> optionId
  checkboxSelections?: Record<string, string[]>; // blockId -> itemIds
  columns: CurriculumColumn[]; // 주차표 컬럼(주제/교육목표/교육내용 등) - 수정/추가 가능
  rows: CurriculumWeekRow[]; // 주차표
};
type CurriculumConfig = {
  key: string;
  title: string;
  status: CurriculumStatus;
  stages: CurriculumStage[];
};

type CategoryTree = Record<string, Record<string, string[]>>;

type CheckboxItem = {
  id: string;
  label: string;
  defaultChecked: boolean;
};

type QuestionKind = 'mcq' | 'short' | 'essay' | 'ox';

type QuestionItem = {
  id: string;
  kind: QuestionKind;
  /** 문제 제목(사용자 입력) */
  title: string;
  /** 4지선다 보기 4개 */
  choices?: [string, string, string, string];
  /** OX 선택 */
  oxValue?: 'O' | 'X' | null;
};

type CommonBlock =
  | {
      id: string;
      type: 'category';
      title: string;
      tree: CategoryTree;
      selectedLarge: string | null;
      selectedMid: string | null;
      /** true면 페이지별 설정 진입 시 해당 블록이 자동 활성화됨(해제 가능) */
      requiredActivation?: boolean;
    }
  | {
      id: string;
      type: 'checkbox';
      title: string;
      items: CheckboxItem[];
      requiredActivation?: boolean;
    }
  | {
      id: string;
      type: 'dropdown';
      title: string;
      options: { id: string; label: string }[];
      placeholder?: string;
      requiredActivation?: boolean;
    }
  | {
      id: string;
      type: 'questionType';
      title: string;
      /** 문제 리스트 */
      questions: QuestionItem[];
      requiredActivation?: boolean;
    };

/** 공통/추가 설정 블록 렌더 시 사용할 수 있는 옵션 (미제공 시 공통 데이터용 기본값 사용) */
type BlockRenderOptions = {
  updateBlock: (id: string, updater: (b: CommonBlock) => CommonBlock) => void;
  removeBlock: (id: string) => void;
  isEditing: boolean;
  /** true면 한 줄에 5개 배치용으로 가로 폭을 줄인 레이아웃(대/중/소 세로 배치 등) */
  compact?: boolean;
  /** 문제유형 블록에서 "문제 추가하기" 모달 스코프 */
  scope?: 'common' | 'extra';
  pageKey?: string;
};

// 기본 카테고리 구조: 대분류 > 중분류 > 소분류 (입력 데이터 자동 분류용)
const DEFAULT_CATEGORY_TREE: CategoryTree = {
  문서: {
    비즈니스: ['사업계획서', '회사소개', 'PPT', '엑셀', '기획서'],
    법률: ['소송장', '준비서면', '형사', '민사'],
    의료: [],
    특허: [],
    노무: [],
    교재: [],
    논문: [],
    기사: [],
    고전: [],
    기타: [],
  },
  음성: {
    아나운서: [],
    관광가이드: [],
    큐레이터: [],
    안내방송: [],
    교육강의: [],
    실시간: [],
    화상수업: [],
  },
  '영상/SNS': {
    '미디어/장르': ['유튜브', '다큐멘터리', '영화', '드라마', '예능'],
  },
  'IT/개발': {
    '개발/보안': ['AI', '에이전트', 'DB', '빅데이터', '백엔드', '프론트', '프로그램'],
    '디자인/기획': ['웹모바일디자인', '웹기획', '홈페이지UIUX', '콘텐츠'],
  },
  창의적활동: {
    콘텐츠: ['드라마', '웹툰', '웹툰소설', '시', '음악', '미술'],
  },
  번역: {
    통번역방식: ['순차통역', '동시통역', '음성번역', '자가선택'],
  },
  프롬프트: {},
  확장영역: {
    '라이프/전문': [
      '암',
      '요리',
      '재무',
      '주식',
      '부동산',
      '자녀',
      '연애',
      '입시',
      '사주',
      '결혼',
      '영어',
      '직장찾기',
      '운동',
      '사업',
    ],
  },
};

// 급수 기본 카테고리 (프롬프트 / 번역 / 윤리)
const LEVEL_CATEGORY_TREE: CategoryTree = {
  프롬프트: {
    교육: ['1급', '2급', '3급', '4급', '5급', '6급', '7급', '8급'],
    일반: ['1급', '2급', '3급'],
    전문: ['1급', '2급'],
  },
  번역: {
    교육: ['1급', '2급', '3급', '4급', '5급', '6급', '7급', '8급'],
    일반: ['1급', '2급', '3급'],
    전문: ['1급', '2급'],
  },
  윤리: {
    교육: ['1급', '2급', '3급', '4급', '5급', '6급', '7급', '8급'],
    일반: ['1급', '2급', '3급'],
    전문: ['1급', '2급'],
  },
};

const INITIAL_COMMON_BLOCKS: CommonBlock[] = [
  {
    id: 'cat-default-1',
    type: 'category',
    title: '분야',
    tree: DEFAULT_CATEGORY_TREE,
    selectedLarge: null,
    selectedMid: null,
  },
  {
    id: 'cat-default-2',
    type: 'category',
    title: '급수',
    tree: LEVEL_CATEGORY_TREE,
    selectedLarge: null,
    selectedMid: null,
  },
  {
    id: 'cb-default-1',
    type: 'checkbox',
    title: '대상',
    items: [
      { id: 'target-adult', label: '일반성인', defaultChecked: false },
      { id: 'target-nonmajor', label: '비전공대학생', defaultChecked: false },
      { id: 'target-prompt-beginner', label: '프롬프트 입문자', defaultChecked: false },
    ],
  },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('common');
  const [isEditingCommon, setIsEditingCommon] = useState(false);
  const [blocks, setBlocks] = useState<CommonBlock[]>(INITIAL_COMMON_BLOCKS);
  const [pages, setPages] = useState<PageConfig[]>([]);
  const [curriculums, setCurriculums] = useState<CurriculumConfig[]>([]);
  const [editingCurriculumKey, setEditingCurriculumKey] = useState<string | null>(null);
  const [pageQuery, setPageQuery] = useState('');
  const [curriculumQuery, setCurriculumQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  /** 페이지별 설정 화면: 편집 중인 페이지 key (null이면 목록) */
  const [editingPageKey, setEditingPageKey] = useState<string | null>(null);
  /** 페이지별 설정 미리보기 화면: 선택된 페이지 key */
  const [previewPageKey, setPreviewPageKey] = useState<string | null>(null);
  /**
   * 페이지별 공통 블록 활성화 override
   * - value가 없으면(undef) 공통데이터의 기본(requiredActivation) 적용
   * - value가 있으면 해당 값(true/false)로 강제
   */
  const [pageBlockOverrides, setPageBlockOverrides] = useState<Record<string, Record<string, boolean>>>({});
  /** 페이지별 추가 설정 블록 (공통과 동일한 블록 타입) */
  const [pageExtraBlocks, setPageExtraBlocks] = useState<Record<string, CommonBlock[]>>({});
  /** 문제유형 블록 내 "문제 추가하기" 모달 컨텍스트 */
  const [qtAddCtx, setQtAddCtx] = useState<null | { scope: 'common' | 'extra'; pageKey?: string; blockId: string }>(null);
  /** 추가 설정 - 블록 추가 모달 열림 */
  const [isAddExtraModalOpen, setIsAddExtraModalOpen] = useState(false);
  /** 저장 후 토스트 */
  const [saveToast, setSaveToast] = useState(false);
  /** 미리보기 UI 상태(저장 X) */
  const [previewCategoryState, setPreviewCategoryState] = useState<
    Record<string, { depth: 1 | 2 | 3; large: string | null; mid: string | null; small: string | null }>
  >({});
  const [previewCheckboxPick, setPreviewCheckboxPick] = useState<Record<string, string[]>>({});
  const [previewDropdownPick, setPreviewDropdownPick] = useState<Record<string, string>>({});
  const [previewQuestionAnswers, setPreviewQuestionAnswers] = useState<Record<string, unknown>>({});
  /** 커리큘럼 편집 UI: 대상 펼침 상태 */
  const [curriculumTargetOpen, setCurriculumTargetOpen] = useState<Record<string, boolean>>({});
  /** 커리큘럼 편집 UI: 공통데이터 불러오기 모달 */
  const [curriculumImportCtx, setCurriculumImportCtx] = useState<null | { currKey: string; stageId: string }>(null);

  const [previewOnlyKey, setPreviewOnlyKey] = useState<string | null>(null);
  const isPreviewOnly = Boolean(previewOnlyKey);

  const getDefaultFieldLevelBlockIds = () => {
    const field = blocks.find((b) => b.type === 'category' && (b.title ?? '').includes('분야'))?.id ?? null;
    const level = blocks.find((b) => b.type === 'category' && (b.title ?? '').includes('급수'))?.id ?? null;
    return { field, level };
  };

  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      const key = new URLSearchParams(window.location.search).get('preview');
      setPreviewOnlyKey(key);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (!previewOnlyKey) return;
    setActiveTab('pages');
    setPreviewPageKey(previewOnlyKey);
  }, [previewOnlyKey]);

  // 커리큘럼 편집 진입 시: 분야/급수 카테고리를 기본으로 항상 표시되도록 stage에 자동 주입
  useEffect(() => {
    if (activeTab !== 'curriculum') return;
    if (!editingCurriculumKey) return;
    const { field, level } = getDefaultFieldLevelBlockIds();
    if (!field && !level) return;
    setCurriculums((prev) =>
      prev.map((c) => {
        if (c.key !== editingCurriculumKey) return c;
        const nextStages = (c.stages ?? []).map((s) => {
          const top = s.commonTopBlockIds ?? [];
          const nextTop = [...top];
          if (field && !nextTop.includes(field)) nextTop.unshift(field);
          if (level && !nextTop.includes(level)) nextTop.push(level);
          const nextCatSel: Record<string, CurriculumLevelSelection> = { ...(s.categorySelections ?? {}) };
          if (field && !nextCatSel[field]) nextCatSel[field] = s.field ?? { large: null, mid: null, small: null };
          if (level && !nextCatSel[level]) nextCatSel[level] = s.level ?? { large: null, mid: null, small: null };
          return {
            ...s,
            commonTopBlockIds: nextTop,
            categorySelections: nextCatSel,
            // 요청사항: 처음 들어오면 드롭다운/추가 체크박스는 기본으로 보이지 않게
            commonSideBlockIds: [],
          };
        });
        return { ...c, stages: nextStages };
      }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, editingCurriculumKey, blocks]);

  const loadFromStorage = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw) as {
        pages?: PageConfig[];
        curriculums?: CurriculumConfig[];
        blocks?: CommonBlock[];
        pageBlockOverrides?: Record<string, Record<string, boolean>>;
        // 구버전
        pageActiveBlocks?: Record<string, string[]>;
        pageActiveCustomized?: Record<string, boolean>;
        pageExtraBlocks?: Record<string, CommonBlock[]>;
      };

      // 구버전 questionType(단일 문제) -> questions[] 로 마이그레이션
      const migrateQuestionType = (list: CommonBlock[] | undefined) => {
        if (!list) return list;
        return list.map((b) => {
          if (b.type !== 'questionType') return b;
          // 이미 신버전(questions[])이면 그대로
          if (Array.isArray(b.questions)) return b;

          const legacy = b as unknown as {
            id?: string;
            title?: string;
            requiredActivation?: boolean;
            kind?: unknown;
            choices?: unknown;
            oxValue?: unknown;
          };
          if (legacy.kind === 'mcq' || legacy.kind === 'short' || legacy.kind === 'essay' || legacy.kind === 'ox') {
            const q: QuestionItem = {
              id: `q-${Date.now()}-0`,
              kind: legacy.kind,
              title: legacy.title ?? '',
              choices: Array.isArray(legacy.choices)
                ? ([
                    String(legacy.choices[0] ?? '보기 1'),
                    String(legacy.choices[1] ?? '보기 2'),
                    String(legacy.choices[2] ?? '보기 3'),
                    String(legacy.choices[3] ?? '보기 4'),
                  ] as [string, string, string, string])
                : undefined,
              oxValue: legacy.oxValue === 'O' || legacy.oxValue === 'X' ? legacy.oxValue : null,
            };
            return {
              id: legacy.id ?? b.id,
              type: 'questionType' as const,
              title: legacy.title ?? '문제유형 설정',
              questions: [q],
              requiredActivation: legacy.requiredActivation,
            };
          }
          return { ...b, questions: [] };
        });
      };

      if (data.pages != null) setPages(data.pages);
      if (data.curriculums != null) {
        const rawCurriculums = data.curriculums as unknown;
        const migrated: CurriculumConfig[] = (Array.isArray(rawCurriculums) ? rawCurriculums : []).map((raw) => {
          const c = raw as Partial<CurriculumConfig> & { stages?: unknown };
          const rawStages = c.stages;
          const stages: CurriculumStage[] = (Array.isArray(rawStages) ? rawStages : []).map((rawStage) => {
            const s = rawStage as Partial<CurriculumStage> & {
              rows?: unknown;
              columns?: unknown;
              field?: unknown;
              level?: unknown;
              targets?: unknown;
            };
            // 이미 columns/cells 구조면 그대로
            if (
              Array.isArray(s.columns) &&
              Array.isArray(s.rows) &&
              (s.rows as unknown[])[0] &&
              typeof (s.rows as unknown[])[0] === 'object' &&
              (s.rows as Array<{ cells?: unknown }>)[0]?.cells
            ) {
              return s as CurriculumStage;
            }

            const cols: CurriculumColumn[] =
              Array.isArray(s.columns) && s.columns.length > 0
                ? (s.columns as CurriculumColumn[])
                : [
                    { id: `col-${Date.now()}-topic`, title: '주제' },
                    { id: `col-${Date.now()}-goal`, title: '교육목표' },
                    { id: `col-${Date.now()}-content`, title: '교육내용' },
                  ];
            const rawRows = (Array.isArray(s.rows) ? s.rows : []) as Array<
              Partial<CurriculumWeekRow> & { topic?: unknown; goal?: unknown; content?: unknown }
            >;
            const rows: CurriculumWeekRow[] = rawRows.map((r, idx) => {
              const cells: Record<string, string> = {};
              cols.forEach((cc) => {
                if (cc.title === '주제') cells[cc.id] = String((r as { topic?: unknown }).topic ?? '');
                else if (cc.title === '교육목표') cells[cc.id] = String((r as { goal?: unknown }).goal ?? '');
                else if (cc.title === '교육내용') cells[cc.id] = String((r as { content?: unknown }).content ?? '');
                else cells[cc.id] = '';
              });
              return {
                id: r.id ?? `row-${Date.now()}-${idx}`,
                week: typeof r.week === 'number' ? r.week : idx + 1,
                cells,
              };
            });
            return {
              id: s.id ?? `stage-${Date.now()}`,
              stepTitle: s.stepTitle ?? '1단계',
              hours: typeof s.hours === 'number' ? s.hours : 60,
              className: s.className ?? '',
              courseName: s.courseName ?? '',
              targets: Array.isArray(s.targets) ? (s.targets as string[]) : [],
              field: (s.field as CurriculumLevelSelection) ?? { large: null, mid: null, small: null },
              level: (s.level as CurriculumLevelSelection) ?? { large: null, mid: null, small: null },
              commonTopBlockIds: s.commonTopBlockIds ?? ['cat-default-1', 'cat-default-2'],
              commonSideBlockIds: s.commonSideBlockIds ?? [],
              categorySelections: s.categorySelections ?? {
                'cat-default-1': s.field ?? { large: null, mid: null, small: null },
                'cat-default-2': s.level ?? { large: null, mid: null, small: null },
              },
              dropdownSelections: s.dropdownSelections ?? {},
              checkboxSelections: s.checkboxSelections ?? { 'cb-default-1': s.targets ?? [] },
              columns: cols,
              rows,
            } as CurriculumStage;
          });
          return {
            key: c.key ?? `curr-${Date.now()}`,
            title: c.title ?? '커리큘럼',
            status: (c.status as CurriculumStatus) ?? '준비중',
            stages,
          };
        });
        setCurriculums(migrated);
      }
      if (data.blocks != null) setBlocks(migrateQuestionType(data.blocks) ?? []);

      // overrides
      if (data.pageBlockOverrides != null) {
        setPageBlockOverrides(data.pageBlockOverrides);
      } else if (data.pageActiveBlocks != null) {
        // 구버전 마이그레이션: pageActiveBlocks(+ optional customized) -> overrides
        const overrides: Record<string, Record<string, boolean>> = {};
        Object.entries(data.pageActiveBlocks).forEach(([pageKey, list]) => {
          const set = new Set(Array.isArray(list) ? list : []);
          const customized = data.pageActiveCustomized?.[pageKey] ?? true;
          if (customized) {
            const m: Record<string, boolean> = {};
            (data.blocks ?? []).forEach((b) => {
              if (b.requiredActivation) m[b.id] = set.has(b.id);
            });
            set.forEach((id) => {
              m[id] = true;
            });
            overrides[pageKey] = m;
          }
        });
        setPageBlockOverrides(overrides);
      }

      if (data.pageExtraBlocks != null) {
        const next: Record<string, CommonBlock[]> = {};
        (Object.entries(data.pageExtraBlocks) as Array<[string, CommonBlock[]]>).forEach(([k, v]) => {
          next[k] = migrateQuestionType(v) ?? [];
        });
        setPageExtraBlocks(next);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadFromStorage();
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return;
      loadFromStorage();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveSettings = () => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          pages,
          curriculums,
          blocks,
          pageBlockOverrides,
          pageExtraBlocks,
        }),
      );
      setSaveToast(true);
      setTimeout(() => setSaveToast(false), 2000);
    } catch {
      // ignore
    }
  };

  const saveAndGoToPageList = () => {
    saveSettings();
    setPreviewPageKey(null);
    setEditingPageKey(null);
    setActiveTab('pages');
  };

  const saveAndGoToCurriculumList = () => {
    saveSettings();
    setPreviewPageKey(null);
    setEditingPageKey(null);
    setEditingCurriculumKey(null);
    setActiveTab('curriculum');
  };

  const getEffectiveActiveForPage = (pageKey: string, b: CommonBlock) => {
    const ov = pageBlockOverrides[pageKey]?.[b.id];
    if (ov !== undefined) return ov;
    return Boolean((b as { requiredActivation?: boolean }).requiredActivation);
  };

  const renderPagePreview = (pageKey: string) => {
    const page = pages.find((p) => p.key === pageKey);
    if (!page) return null;

    const commonActive = blocks.filter((b) => getEffectiveActiveForPage(pageKey, b));
    const extras = pageExtraBlocks[pageKey] ?? [];
    const settingsBlocks = [...commonActive, ...extras].filter(
      (b) => b.type === 'category' || b.type === 'checkbox' || b.type === 'dropdown',
    ) as CommonBlock[];
    const questionBlocks = [...commonActive, ...extras].filter((b) => b.type === 'questionType') as Extract<
      CommonBlock,
      { type: 'questionType' }
    >[];

    const renderCategoryWidget = (b: Extract<CommonBlock, { type: 'category' }>) => {
      const state =
        previewCategoryState[b.id] ?? { depth: 3 as const, large: null, mid: null, small: null };
      const tree = b.tree ?? {};
      const largeList = Object.keys(tree);
      const midList = state.large ? Object.keys(tree[state.large] ?? {}) : [];
      const smallList = state.large && state.mid ? (tree[state.large]?.[state.mid] ?? []) : [];

      return (
        <div key={b.id} className="bg-white border border-gray-200 rounded-lg p-3 min-w-0">
          <div className="text-sm font-semibold text-gray-900 truncate">{b.title || '카테고리'}</div>
          <div className="mt-3 grid grid-cols-1 gap-2">
            <select
              className="w-full border border-gray-300 rounded-md px-2 py-1 text-xs bg-white"
              value={state.large ?? ''}
              onChange={(e) => {
                const v = e.target.value || null;
                setPreviewCategoryState((prev) => ({
                  ...prev,
                  [b.id]: { ...state, large: v, mid: null, small: null },
                }));
              }}
            >
              <option value="" disabled>
                대 카테고리 선택
              </option>
              {largeList.map((x) => (
                <option key={x} value={x}>
                  {x}
                </option>
              ))}
            </select>

            <select
              className="w-full border border-gray-300 rounded-md px-2 py-1 text-xs bg-white"
              value={state.mid ?? ''}
              disabled={!state.large}
              onChange={(e) => {
                const v = e.target.value || null;
                setPreviewCategoryState((prev) => ({
                  ...prev,
                  [b.id]: { ...state, mid: v, small: null },
                }));
              }}
            >
              <option value="">
                중 카테고리 (선택)
              </option>
              {midList.map((x) => (
                <option key={x} value={x}>
                  {x}
                </option>
              ))}
            </select>

            <select
              className="w-full border border-gray-300 rounded-md px-2 py-1 text-xs bg-white"
              value={state.small ?? ''}
              disabled={!state.large || !state.mid}
              onChange={(e) => {
                const v = e.target.value || null;
                setPreviewCategoryState((prev) => ({
                  ...prev,
                  [b.id]: { ...state, small: v },
                }));
              }}
            >
              <option value="">
                소 카테고리 (선택)
              </option>
              {smallList.map((x, idx) => (
                <option key={`${x}-${idx}`} value={x}>
                  {x}
                </option>
              ))}
            </select>
          </div>
        </div>
      );
    };

    const renderCheckboxWidget = (b: Extract<CommonBlock, { type: 'checkbox' }>) => {
      const picked = previewCheckboxPick[b.id] ?? [];
      return (
        <div key={b.id} className="bg-white border border-gray-200 rounded-lg p-3 min-w-0">
          <div className="text-sm font-semibold text-gray-900 truncate">{b.title || '체크박스'}</div>
          <div className="mt-2 space-y-2">
            {b.items.length === 0 ? (
              <div className="text-xs text-gray-400">항목 없음</div>
            ) : (
              b.items.map((it) => (
                <label key={it.id} className="flex items-center gap-2 text-xs text-gray-800">
                  <input
                    type="checkbox"
                    checked={picked.includes(it.id)}
                    onChange={() =>
                      setPreviewCheckboxPick((prev) => {
                        const cur = prev[b.id] ?? [];
                        const next = cur.includes(it.id) ? cur.filter((x) => x !== it.id) : [...cur, it.id];
                        return { ...prev, [b.id]: next };
                      })
                    }
                  />
                  <span className="truncate">{it.label}</span>
                </label>
              ))
            )}
          </div>
        </div>
      );
    };

    const renderDropdownWidget = (b: Extract<CommonBlock, { type: 'dropdown' }>) => {
      const v = previewDropdownPick[b.id] ?? '';
      return (
        <div key={b.id} className="bg-white border border-gray-200 rounded-lg p-3 min-w-0">
          <div className="text-sm font-semibold text-gray-900 truncate">{b.title || '드롭다운'}</div>
          <div className="mt-2">
            <select
              className="w-full border border-gray-300 rounded-md px-2 py-1 text-xs bg-white"
              value={v}
              onChange={(e) => setPreviewDropdownPick((prev) => ({ ...prev, [b.id]: e.target.value }))}
            >
              <option value="" disabled>
                {b.placeholder || '선택'}
              </option>
              {b.options.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      );
    };

    const renderQuestionPreview = (qb: Extract<CommonBlock, { type: 'questionType' }>) => {
      return (
        <div key={qb.id} className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-gray-900">{qb.title || '문제유형'}</div>
              <div className="text-xs text-gray-500 mt-0.5">설정된 문제를 실제 화면처럼 미리봅니다.</div>
            </div>
          </div>

          {qb.questions.length === 0 ? (
            <div className="text-sm text-gray-400 py-6 text-center border border-dashed border-gray-200 rounded-md bg-gray-50">
              추가된 문제가 없습니다.
            </div>
          ) : (
            <div className="space-y-3">
              {qb.questions.map((q, idx) => (
                <div key={q.id} className="border border-gray-200 rounded-md p-4 bg-gray-50 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-sm font-semibold text-gray-900">
                      {idx + 1}. {q.title || '제목 없음'}
                    </div>
                    <span className="text-[11px] px-2 py-0.5 rounded-full border border-gray-200 bg-white text-gray-700">
                      {q.kind === 'mcq' && '4지선다'}
                      {q.kind === 'short' && '단답형'}
                      {q.kind === 'essay' && '주관식'}
                      {q.kind === 'ox' && 'OX'}
                    </span>
                  </div>

                  {q.kind === 'mcq' && (
                    <div className="space-y-2">
                      {(q.choices ?? ['보기 1', '보기 2', '보기 3', '보기 4']).map((c, cIdx) => (
                        <label key={cIdx} className="flex items-center gap-2 text-sm text-gray-800">
                          <input
                            type="radio"
                            name={`ans-${q.id}`}
                            checked={previewQuestionAnswers[q.id] === cIdx}
                            onChange={() => setPreviewQuestionAnswers((prev) => ({ ...prev, [q.id]: cIdx }))}
                          />
                          <span className="truncate">
                            {cIdx + 1}. {c}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}

                  {(q.kind === 'short' || q.kind === 'essay') && (
                    <input
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white"
                      value={(() => {
                        const ans = previewQuestionAnswers[q.id];
                        return typeof ans === 'string' ? ans : '';
                      })()}
                      onChange={(e) => setPreviewQuestionAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
                      placeholder="답안을 입력하세요"
                    />
                  )}

                  {q.kind === 'ox' && (
                    <div className="flex items-center gap-2">
                      {(['O', 'X'] as const).map((v) => (
                        <button
                          key={v}
                          type="button"
                          className={`px-4 py-2 rounded-md border text-sm ${
                            previewQuestionAnswers[q.id] === v
                              ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                              : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                          }`}
                          onClick={() => setPreviewQuestionAnswers((prev) => ({ ...prev, [q.id]: v }))}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    };

    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-8">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-gray-900">{page.name} 미리보기</h2>
          </div>
        </div>

        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-900">설정</h3>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {settingsBlocks.length === 0 ? (
                <div className="col-span-full text-sm text-gray-400 text-center py-8">
                  활성화된 설정 블록이 없습니다.
                </div>
              ) : (
                settingsBlocks.map((b) => {
                  if (b.type === 'category') return renderCategoryWidget(b);
                  if (b.type === 'checkbox') return renderCheckboxWidget(b);
                  return renderDropdownWidget(b as Extract<CommonBlock, { type: 'dropdown' }>);
                })
              )}
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-900">문제</h3>
          <div className="space-y-4">
            {questionBlocks.length === 0 ? (
              <div className="text-sm text-gray-400 text-center py-10 border border-dashed border-gray-200 rounded-lg bg-gray-50">
                문제유형 설정 블록이 없습니다.
              </div>
            ) : (
              questionBlocks.map(renderQuestionPreview)
            )}
          </div>
        </section>
      </div>
    );
  };

  const filteredPages = useMemo(() => {
    const q = pageQuery.trim().toLowerCase();
    if (!q) return pages;
    return pages.filter((p) => {
      return p.name.toLowerCase().includes(q) || p.key.toLowerCase().includes(q);
    });
  }, [pageQuery, pages]);

  const filteredCurriculums = useMemo(() => {
    const q = curriculumQuery.trim().toLowerCase();
    if (!q) return curriculums;
    return curriculums.filter((c) => {
      return c.title.toLowerCase().includes(q) || c.key.toLowerCase().includes(q);
    });
  }, [curriculumQuery, curriculums]);

  const getTargetBlock = () =>
    blocks.find((b) => b.type === 'checkbox' && (b.title ?? '').includes('대상')) as
      | Extract<CommonBlock, { type: 'checkbox' }>
      | undefined;
  const getFieldBlock = () =>
    blocks.find((b) => b.type === 'category' && (b.title ?? '').includes('분야')) as
      | Extract<CommonBlock, { type: 'category' }>
      | undefined;
  const getLevelBlock = () =>
    blocks.find((b) => b.type === 'category' && (b.title ?? '').includes('급수')) as
      | Extract<CommonBlock, { type: 'category' }>
      | undefined;

  const addCurriculumStage = (currKey: string) => {
    setCurriculums((prev) =>
      prev.map((c) => {
        if (c.key !== currKey) return c;
        const nextIndex = (c.stages?.length ?? 0) + 1;
        const stageId = `stage-${Date.now()}-${nextIndex}`;
        const cols: CurriculumColumn[] = [
          { id: `col-${Date.now()}-topic`, title: '주제' },
          { id: `col-${Date.now()}-goal`, title: '교육목표' },
          { id: `col-${Date.now()}-content`, title: '교육내용' },
        ];
        const newStage: CurriculumStage = {
          id: stageId,
          stepTitle: `${nextIndex}단계`,
          hours: 60,
          className: '',
          courseName: '',
          targets: [],
          field: { large: null, mid: null, small: null },
          level: { large: null, mid: null, small: null },
          commonTopBlockIds: ['cat-default-1', 'cat-default-2'],
          commonSideBlockIds: [],
          categorySelections: {
            'cat-default-1': { large: null, mid: null, small: null },
            'cat-default-2': { large: null, mid: null, small: null },
          },
          dropdownSelections: {},
          checkboxSelections: { 'cb-default-1': [] },
          columns: cols,
          rows: Array.from({ length: 8 }).map((_, i) => ({
            id: `row-${Date.now()}-${i}`,
            week: i + 1,
            cells: Object.fromEntries(cols.map((cc) => [cc.id, ''])),
          })),
        };
        return { ...c, stages: [...(c.stages ?? []), newStage] };
      }),
    );
  };

  const updateCurriculumStage = (
    currKey: string,
    stageId: string,
    updater: (s: CurriculumStage) => CurriculumStage,
  ) => {
    setCurriculums((prev) =>
      prev.map((c) => {
        if (c.key !== currKey) return c;
        return { ...c, stages: (c.stages ?? []).map((s) => (s.id === stageId ? updater(s) : s)) };
      }),
    );
  };

  const removeCurriculumStage = (currKey: string, stageId: string) => {
    setCurriculums((prev) =>
      prev.map((c) => {
        if (c.key !== currKey) return c;
        return { ...c, stages: (c.stages ?? []).filter((s) => s.id !== stageId) };
      }),
    );
  };

  const updateCurriculumRow = (
    currKey: string,
    stageId: string,
    rowId: string,
    updater: (r: CurriculumWeekRow) => CurriculumWeekRow,
  ) => {
    updateCurriculumStage(currKey, stageId, (s) => ({
      ...s,
      rows: s.rows.map((r) => (r.id === rowId ? updater(r) : r)),
    }));
  };

  const addCurriculumRow = (currKey: string, stageId: string) => {
    updateCurriculumStage(currKey, stageId, (s) => {
      const nextWeek = (s.rows[s.rows.length - 1]?.week ?? 0) + 1;
      const baseCells: Record<string, string> = Object.fromEntries((s.columns ?? []).map((c) => [c.id, '']));
      return {
        ...s,
        rows: [
          ...s.rows,
          { id: `row-${Date.now()}-${nextWeek}`, week: nextWeek, cells: baseCells },
        ],
      };
    });
  };

  const removeCurriculumRow = (currKey: string, stageId: string, rowId: string) => {
    updateCurriculumStage(currKey, stageId, (s) => ({ ...s, rows: s.rows.filter((r) => r.id !== rowId) }));
  };

  const addCurriculumColumn = (currKey: string, stageId: string) => {
    const title = (window.prompt('추가할 열 제목을 입력하세요') ?? '').trim();
    if (!title) return;
    updateCurriculumStage(currKey, stageId, (s) => {
      const colId = `col-${Date.now()}-${s.columns.length}`;
      const nextCols = [...(s.columns ?? []), { id: colId, title }];
      const nextRows = s.rows.map((r) => ({ ...r, cells: { ...r.cells, [colId]: '' } }));
      return { ...s, columns: nextCols, rows: nextRows };
    });
  };

  const removeCurriculumColumn = (currKey: string, stageId: string, colId: string) => {
    updateCurriculumStage(currKey, stageId, (s) => {
      const nextCols = (s.columns ?? []).filter((c) => c.id !== colId);
      const nextRows = s.rows.map((r) => {
        const { [colId]: _, ...rest } = r.cells;
        return { ...r, cells: rest };
      });
      return { ...s, columns: nextCols, rows: nextRows };
    });
  };

  const importCurriculumFromExcel = async (file: File, currKey: string, stageId: string) => {
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf, { type: 'array' });
    const ws = wb.Sheets[wb.SheetNames[0]];
    if (!ws) return;
    const rows = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, defval: '' }) as unknown[][];
    if (!rows || rows.length === 0) return;

    const header = (rows[0] ?? []).map((v) => String(v ?? '').trim());
    const weekColIdx = header.findIndex((h) => h === '주차');
    if (weekColIdx < 0) {
      window.alert('엑셀 1행(헤더)에 "주차" 컬럼이 필요합니다.');
      return;
    }

    const colDefs: { idx: number; title: string; id: string }[] = [];
    header.forEach((h, idx) => {
      if (!h) return;
      if (idx === weekColIdx) return;
      const id = `col-${Date.now()}-${idx}`;
      colDefs.push({ idx, title: h, id });
    });
    if (colDefs.length === 0) {
      window.alert('엑셀 헤더에서 "주차" 외에 최소 1개 컬럼이 필요합니다.');
      return;
    }

    const dataRows = rows.slice(1).filter((r) => r.some((v) => String(v ?? '').trim() !== ''));
    const stageRows: CurriculumWeekRow[] = dataRows.map((r, i) => {
      const rawWeek = r[weekColIdx];
      const week = Number(String(rawWeek ?? '').replace(/[^0-9]/g, '')) || i + 1;
      const cells: Record<string, string> = {};
      colDefs.forEach((c) => {
        cells[c.id] = String(r[c.idx] ?? '').trim();
      });
      return { id: `row-${Date.now()}-${i}`, week, cells };
    });

    updateCurriculumStage(currKey, stageId, (s) => ({
      ...s,
      columns: colDefs.map((c) => ({ id: c.id, title: c.title })),
      rows: stageRows,
    }));
  };

  const handleSaveCommon = () => {
    setIsEditingCommon((prev) => !prev);
    saveSettings();
  };

  const addCategoryBlock = () => {
    const id = `cat-${Date.now()}-${blocks.length}`;
    const newBlock: CommonBlock = {
      id,
      type: 'category',
      title: '카테고리 트리 설정 (대/중/소)',
      tree: {},
      selectedLarge: null,
      selectedMid: null,
    };
    setBlocks((prev) => [...prev, newBlock]);
  };

  const addCheckboxBlock = () => {
    const id = `cb-group-${Date.now()}-${blocks.length}`;
    const newBlock: CommonBlock = {
      id,
      type: 'checkbox',
      title: '체크박스 설정',
      items: [],
    };
    setBlocks((prev) => [...prev, newBlock]);
  };

  const addDropdownBlock = () => {
    const id = `dd-${Date.now()}-${blocks.length}`;
    const newBlock: CommonBlock = {
      id,
      type: 'dropdown',
      title: '드롭다운 설정',
      options: [],
      placeholder: '항목을 선택하세요',
    };
    setBlocks((prev) => [...prev, newBlock]);
  };

  const addQuestionTypeBlock = () => {
    const title = (window.prompt('문제유형 설정 블록 제목을 입력하세요') ?? '').trim();
    if (!title) return;
    const id = `qt-${Date.now()}-${blocks.length}`;
    const newBlock: CommonBlock = { id, type: 'questionType', title, questions: [] };
    setBlocks((prev) => [...prev, newBlock]);
  };

  const updateBlock = (id: string, updater: (block: CommonBlock) => CommonBlock) => {
    setBlocks((prev) => prev.map((b) => (b.id === id ? updater(b) : b)));
  };

  const removeBlock = (id: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
  };

  const updatePageExtraBlock = (pageKey: string, blockId: string, updater: (b: CommonBlock) => CommonBlock) => {
    setPageExtraBlocks((prev) => {
      const list = prev[pageKey] ?? [];
      return { ...prev, [pageKey]: list.map((b) => (b.id === blockId ? updater(b) : b)) };
    });
  };
  const removePageExtraBlock = (pageKey: string, blockId: string) => {
    setPageExtraBlocks((prev) => {
      const list = (prev[pageKey] ?? []).filter((b) => b.id !== blockId);
      return { ...prev, [pageKey]: list };
    });
  };
  const addPageExtraBlock = (type: 'category' | 'checkbox' | 'dropdown') => {
    if (!editingPageKey) return;
    const list = pageExtraBlocks[editingPageKey] ?? [];
    const id = `extra-${Date.now()}-${list.length}`;
    const newBlock: CommonBlock =
      type === 'category'
        ? { id, type: 'category', title: '카테고리 트리 설정 (대/중/소)', tree: {}, selectedLarge: null, selectedMid: null }
        : type === 'checkbox'
          ? { id, type: 'checkbox', title: '체크박스 설정', items: [] }
          : { id, type: 'dropdown', title: '드롭다운 설정', options: [], placeholder: '항목을 선택하세요' };
    setPageExtraBlocks((prev) => ({ ...prev, [editingPageKey]: [...list, newBlock] }));
    setIsAddExtraModalOpen(false);
  };

  const addPageExtraQuestionTypeBlock = () => {
    if (!editingPageKey) return;
    const title = (window.prompt('문제유형 설정 블록 제목을 입력하세요') ?? '').trim();
    if (!title) return;
    const list = pageExtraBlocks[editingPageKey] ?? [];
    const id = `extra-${Date.now()}-${list.length}`;
    setPageExtraBlocks((prev) => ({
      ...prev,
      [editingPageKey]: [...list, ({ id, type: 'questionType', title, questions: [] } as CommonBlock)],
    }));
    setIsAddExtraModalOpen(false);
  };

  /** 공통 블록 데이터 읽기 전용 미리보기 (설정 화면에서 활성화 시, 공통데이터 UI와 동일하게 표시) */
  const renderBlockPreview = (block: CommonBlock) => {
    if (block.type === 'category') {
      const largeCategories = Object.keys(block.tree);
      const midCategories = block.selectedLarge ? Object.keys(block.tree[block.selectedLarge] ?? {}) : [];
      const smallCategories =
        block.selectedLarge && block.selectedMid
          ? block.tree[block.selectedLarge]?.[block.selectedMid] ?? []
          : [];

      return (
        <div className="mt-2 border-t border-green-100 pt-2">
          <div className="grid grid-cols-1 gap-2">
            {/* 대 카테고리 */}
            <div className="border border-gray-200 rounded-md bg-gray-50 min-w-0">
              <div className="flex items-center justify-between mb-1 px-2 py-1.5 bg-indigo-50 rounded-t-md border-b border-indigo-100">
                <h4 className="text-xs font-semibold text-gray-900">대 카테고리</h4>
              </div>
              <div className="p-2 space-y-0.5 max-h-32 overflow-y-auto">
                {largeCategories.length === 0 ? (
                  <div className="text-[11px] text-gray-400 py-4 text-center">아직 대 카테고리가 없습니다.</div>
                ) : (
                  largeCategories.map((name) => {
                    const isActive = block.selectedLarge === name;
                    return (
                      <button
                        key={name}
                        type="button"
                        onClick={() =>
                          updateBlock(block.id, (b) =>
                            b.type === 'category'
                              ? { ...b, selectedLarge: name, selectedMid: null }
                              : b,
                          )
                        }
                        className={`w-full text-left px-2 py-1 rounded-md text-xs ${
                          isActive ? 'bg-indigo-50 text-indigo-700' : 'bg-white text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {name}
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* 중 카테고리 */}
            <div className="border border-gray-200 rounded-md bg-gray-50 min-w-0">
              <div className="flex items-center justify-between mb-1 px-2 py-1.5 bg-indigo-50 rounded-t-md border-b border-indigo-100">
                <h4 className="text-xs font-semibold text-gray-900">중 카테고리</h4>
              </div>
              <div className="text-[11px] text-gray-500 mb-0.5 px-2 pt-1">
                {block.selectedLarge ? `대: ${block.selectedLarge}` : '대 카테고리를 선택하세요.'}
              </div>
              <div className="px-2 pb-2 space-y-0.5 max-h-32 overflow-y-auto">
                {block.selectedLarge && midCategories.length === 0 ? (
                  <div className="text-[11px] text-gray-400 py-4 text-center">아직 중 카테고리가 없습니다.</div>
                ) : (
                  midCategories.map((name) => {
                    const isActive = block.selectedMid === name;
                    return (
                      <button
                        key={name}
                        type="button"
                        onClick={() =>
                          updateBlock(block.id, (b) =>
                            b.type === 'category' ? { ...b, selectedMid: name } : b,
                          )
                        }
                        className={`w-full text-left px-2 py-1 rounded-md text-xs ${
                          isActive ? 'bg-indigo-50 text-indigo-700' : 'bg-white text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {name}
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* 소 카테고리 */}
            <div className="border border-gray-200 rounded-md bg-gray-50 min-w-0">
              <div className="flex items-center justify-between mb-1 px-2 py-1.5 bg-indigo-50 rounded-t-md border-b border-indigo-100">
                <h4 className="text-xs font-semibold text-gray-900">소 카테고리</h4>
              </div>
              <div className="text-[11px] text-gray-500 mb-0.5 px-2 pt-1">
                {block.selectedLarge && block.selectedMid
                  ? `대: ${block.selectedLarge} / 중: ${block.selectedMid}`
                  : '대/중 카테고리를 선택하세요.'}
              </div>
              <div className="px-2 pb-2 space-y-0.5 max-h-32 overflow-y-auto">
                {block.selectedLarge && block.selectedMid && smallCategories.length === 0 ? (
                  <div className="text-[11px] text-gray-400 py-4 text-center">아직 소 카테고리가 없습니다.</div>
                ) : (
                  smallCategories.map((name, idx) => (
                    <div
                      key={`${name}-${idx}`}
                      className="w-full px-2 py-1 rounded-md text-xs bg-white text-gray-700 border border-gray-200"
                    >
                      {name}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }
    if (block.type === 'checkbox') {
      return (
        <div className="mt-2 border-t border-green-100 pt-2">
          <div className="border border-gray-200 rounded-md bg-gray-50 p-2 space-y-1 max-h-40 overflow-y-auto">
            {block.items.length === 0 ? (
              <div className="text-[11px] text-gray-400 text-center py-2">
                아직 체크박스 항목이 없습니다.
              </div>
            ) : (
              <div className="flex flex-wrap gap-1">
                {block.items.map((item, idx) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-2 bg-white border border-gray-200 rounded-md px-2 py-1 text-xs md:text-sm w-full sm:w-[48%] md:w-[32%] lg:w-[18%]"
                  >
                    <span className="text-[10px] text-gray-400">{idx + 1}.</span>
                    <label className="flex items-center gap-1 flex-1">
                      <input
                        type="checkbox"
                        className="h-3 w-3 md:h-4 md:w-4"
                        checked={item.defaultChecked}
                        readOnly
                      />
                      <span className="text-xs md:text-sm text-gray-800 truncate">{item.label}</span>
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    }
    if (block.type === 'dropdown') {
      return (
        <div className="mt-2 border-t border-green-100 pt-2">
          <div className="border border-gray-200 rounded-md bg-gray-50 p-2 space-y-2 max-h-40 overflow-y-auto">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-gray-600">미리보기</span>
              <select
                className="border border-gray-300 rounded-md px-1.5 py-0.5 text-xs bg-white w-24"
                defaultValue=""
                disabled
              >
                <option value="" disabled>
                  {block.placeholder || '선택'}
                </option>
                {block.options.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="border border-gray-200 rounded-md bg-white p-2 space-y-0.5">
              {block.options.length === 0 ? (
                <div className="text-[11px] text-gray-400 text-center py-2">
                  아직 옵션이 없습니다.
                </div>
              ) : (
                block.options.map((opt, idx) => (
                  <div key={opt.id} className="flex items-center gap-1 text-[11px]">
                    <span className="w-4 text-gray-400 text-right">{idx + 1}.</span>
                    <span className="flex-1 text-gray-800 truncate">{opt.label}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      );
    }
    if (block.type === 'questionType') {
      return (
        <div className="mt-2 border-t border-green-100 pt-2">
          <div className="border border-gray-200 rounded-md bg-gray-50 p-2 space-y-2 max-h-40 overflow-y-auto">
            <div className="text-[11px] text-gray-500">문제유형</div>
            {block.questions.length === 0 ? (
              <div className="text-[11px] text-gray-400 text-center py-2">추가된 문제가 없습니다.</div>
            ) : (
              <div className="space-y-1">
                {block.questions.slice(0, 3).map((q) => (
                  <div key={q.id} className="bg-white border border-gray-200 rounded-md px-2 py-1 text-[11px] min-w-0">
                    <span className="text-gray-500 mr-1">
                      {q.kind === 'mcq' && '4지선다'}
                      {q.kind === 'short' && '단답형'}
                      {q.kind === 'essay' && '주관식'}
                      {q.kind === 'ox' && 'OX'}
                    </span>
                    <span className="text-gray-800 truncate inline-block max-w-full align-bottom">{q.title || '제목 없음'}</span>
                  </div>
                ))}
                {block.questions.length > 3 && (
                  <div className="text-[11px] text-gray-500">… 외 {block.questions.length - 3}개</div>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  const renderQuestionTypeBlock = (
    block: Extract<CommonBlock, { type: 'questionType' }>,
    opts?: BlockRenderOptions,
  ) => {
    const updateFn = opts?.updateBlock ?? updateBlock;
    const removeFn = opts?.removeBlock ?? removeBlock;
    const isEdit = opts?.isEditing ?? isEditingCommon;
    const compact = opts?.compact ?? false;

    return (
      <div
        key={block.id}
        className={`bg-white border border-gray-200 rounded-lg min-w-0 overflow-hidden ${
          compact ? 'p-3 space-y-2' : 'mt-6 space-y-4 p-4'
        }`}
      >
        <div className="flex flex-col gap-2 min-w-0">
          <div className="min-w-0 w-full">
            {isEdit ? (
              <input
                className="w-full min-w-0 border border-gray-300 rounded-md px-2 py-1 text-sm font-semibold text-gray-900 bg-white"
                value={block.title}
                onChange={(e) =>
                  updateFn(block.id, (b) =>
                    b.type === 'questionType' ? { ...b, title: e.target.value } : b,
                  )
                }
                placeholder="예: 4지선다"
              />
            ) : (
              <h3 className="text-sm font-semibold text-gray-900">{block.title || '문제유형 설정'}</h3>
            )}
          </div>

          {isEdit && (
            <div className="flex flex-col gap-1">
              {!compact && (
                <p className="text-xs text-gray-600">문제유형별 입력 UI를 설정합니다.</p>
              )}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  className="px-2 py-0.5 text-[10px] rounded border border-red-200 text-red-700 hover:bg-red-50 whitespace-nowrap"
                  onClick={() => {
                    if (!window.confirm('이 문제유형 설정 전체를 삭제하시겠습니까?')) return;
                    removeFn(block.id);
                  }}
                >
                  전체 삭제
                </button>
                <button
                  type="button"
                  className={`px-1.5 py-0.5 text-[10px] rounded font-medium whitespace-nowrap ${
                    block.requiredActivation ? 'bg-green-600 text-white' : 'bg-green-100 text-green-800 border border-green-300'
                  }`}
                  onClick={() =>
                    updateFn(block.id, (b) =>
                      b.type === 'questionType' ? { ...b, requiredActivation: !b.requiredActivation } : b,
                    )
                  }
                >
                  활성화
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="border border-gray-200 rounded-md bg-gray-50 p-3 space-y-2 min-w-0 overflow-hidden">
          {block.questions.length === 0 ? (
            <div className="text-xs text-gray-400 text-center py-4">아직 추가된 문제가 없습니다.</div>
          ) : (
            <div className="space-y-3">
              {block.questions.map((q, idx) => (
                <div key={q.id} className="bg-white border border-gray-200 rounded-md p-3 space-y-2 min-w-0">
                  <div className="flex items-center justify-between gap-2 min-w-0">
                    <span className="text-[11px] px-2 py-0.5 rounded-full border border-gray-200 bg-gray-50 text-gray-700 flex-shrink-0">
                      {q.kind === 'mcq' && '4지선다'}
                      {q.kind === 'short' && '단답형'}
                      {q.kind === 'essay' && '주관식'}
                      {q.kind === 'ox' && 'OX'}
                    </span>
                    {isEdit && (
                      <button
                        type="button"
                        className="text-[11px] text-red-600 hover:text-red-800 flex-shrink-0"
                        onClick={() =>
                          updateFn(block.id, (b) => {
                            if (b.type !== 'questionType') return b;
                            return { ...b, questions: b.questions.filter((x) => x.id !== q.id) };
                          })
                        }
                      >
                        삭제
                      </button>
                    )}
                  </div>

                  {q.kind === 'mcq' ? (
                    <>
                      <input
                        className="w-full min-w-0 border border-gray-300 rounded-md px-2 py-1 text-xs bg-white"
                        value={q.title}
                        onChange={(e) =>
                          updateFn(block.id, (b) => {
                            if (b.type !== 'questionType') return b;
                            const next = b.questions.map((x) => (x.id === q.id ? { ...x, title: e.target.value } : x));
                            return { ...b, questions: next };
                          })
                        }
                        placeholder="4지선다 제목을 입력하세요"
                      />
                      <div className="grid grid-cols-1 gap-2">
                        {(q.choices ?? ['보기 1', '보기 2', '보기 3', '보기 4']).map((c, cIdx) => (
                          <input
                            key={cIdx}
                            className="w-full min-w-0 border border-gray-300 rounded-md px-2 py-1 text-xs bg-white"
                            value={c}
                            onChange={(e) =>
                              updateFn(block.id, (b) => {
                                if (b.type !== 'questionType') return b;
                                const next = b.questions.map((x) => {
                                  if (x.id !== q.id) return x;
                                  const base = x.choices ?? ['보기 1', '보기 2', '보기 3', '보기 4'];
                                  const arr: [string, string, string, string] = [
                                    base[0] ?? '보기 1',
                                    base[1] ?? '보기 2',
                                    base[2] ?? '보기 3',
                                    base[3] ?? '보기 4',
                                  ];
                                  arr[cIdx] = e.target.value;
                                  return { ...x, choices: arr };
                                });
                                return { ...b, questions: next };
                              })
                            }
                            placeholder={`보기 ${cIdx + 1}`}
                          />
                        ))}
                      </div>
                    </>
                  ) : q.kind === 'ox' ? (
                    <>
                      <input
                        className="w-full min-w-0 border border-gray-300 rounded-md px-2 py-1 text-xs bg-white"
                        value={q.title}
                        onChange={(e) =>
                          updateFn(block.id, (b) => {
                            if (b.type !== 'questionType') return b;
                            const next = b.questions.map((x) => (x.id === q.id ? { ...x, title: e.target.value } : x));
                            return { ...b, questions: next };
                          })
                        }
                        placeholder="OX 제목을 입력하세요"
                      />
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className={`px-3 py-1.5 text-xs rounded-md border ${
                            q.oxValue === 'O'
                              ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                              : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                          }`}
                          onClick={() =>
                            updateFn(block.id, (b) => {
                              if (b.type !== 'questionType') return b;
                              const next: QuestionItem[] = b.questions.map((x) =>
                                x.id === q.id ? { ...x, oxValue: 'O' as const } : x,
                              );
                              return { ...b, questions: next };
                            })
                          }
                        >
                          O
                        </button>
                        <button
                          type="button"
                          className={`px-3 py-1.5 text-xs rounded-md border ${
                            q.oxValue === 'X'
                              ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                              : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                          }`}
                          onClick={() =>
                            updateFn(block.id, (b) => {
                              if (b.type !== 'questionType') return b;
                              const next: QuestionItem[] = b.questions.map((x) =>
                                x.id === q.id ? { ...x, oxValue: 'X' as const } : x,
                              );
                              return { ...b, questions: next };
                            })
                          }
                        >
                          X
                        </button>
                      </div>
                    </>
                  ) : (
                    <input
                      className="w-full min-w-0 border border-gray-300 rounded-md px-2 py-1 text-xs bg-white"
                      value={q.title}
                      onChange={(e) =>
                        updateFn(block.id, (b) => {
                          if (b.type !== 'questionType') return b;
                          const next = b.questions.map((x) => (x.id === q.id ? { ...x, title: e.target.value } : x));
                          return { ...b, questions: next };
                        })
                      }
                      placeholder={(q.kind === 'short' ? '단답형 제목' : '주관식 제목') + '을 입력하세요'}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {isEdit && (
            <div className="flex justify-end">
              <button
                type="button"
                className="px-3 py-1.5 text-xs rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                onClick={() =>
                  setQtAddCtx({
                    scope: opts?.scope ?? 'common',
                    pageKey: opts?.pageKey,
                    blockId: block.id,
                  })
                }
              >
                문제 추가하기
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderCategoryBlock = (
    block: Extract<CommonBlock, { type: 'category' }>,
    opts?: BlockRenderOptions,
  ) => {
    const updateFn = opts?.updateBlock ?? updateBlock;
    const removeFn = opts?.removeBlock ?? removeBlock;
    const isEdit = opts?.isEditing ?? isEditingCommon;

    const largeCategories = Object.keys(block.tree);
    const midCategories = block.selectedLarge ? Object.keys(block.tree[block.selectedLarge] ?? {}) : [];
    const smallCategories =
      block.selectedLarge && block.selectedMid
        ? block.tree[block.selectedLarge]?.[block.selectedMid] ?? []
        : [];

    const handleAddLarge = () => {
      if (!isEdit) return;
      const name = window.prompt('대 카테고리 이름을 입력하세요');
      if (!name?.trim()) return;
      const key = name.trim();
      updateFn(block.id, (b) => {
        if (b.type !== 'category') return b;
        if (b.tree[key]) return b;
        return {
          ...b,
          tree: { ...b.tree, [key]: {} },
          selectedLarge: key,
          selectedMid: null,
        };
      });
    };

    const handleAddMid = () => {
      if (!isEdit) return;
      if (!block.selectedLarge) {
        window.alert('먼저 대 카테고리를 선택하세요.');
        return;
      }
      const name = window.prompt('중 카테고리 이름을 입력하세요');
      if (!name?.trim()) return;
      const key = name.trim();
      updateFn(block.id, (b) => {
        if (b.type !== 'category') return b;
        const large = b.tree[block.selectedLarge!] ?? {};
        return {
          ...b,
          tree: {
            ...b.tree,
            [block.selectedLarge!]: {
              ...large,
              [key]: [],
            },
          },
          selectedMid: key,
        };
      });
    };

    const handleAddSmall = () => {
      if (!isEdit) return;
      if (!block.selectedLarge || !block.selectedMid) {
        window.alert('먼저 대/중 카테고리를 선택하세요.');
        return;
      }
      const name = window.prompt('소 카테고리 이름을 입력하세요');
      if (!name?.trim()) return;
      const value = name.trim();
      updateFn(block.id, (b) => {
        if (b.type !== 'category') return b;
        const large = b.tree[block.selectedLarge!] ?? {};
        const mids = { ...large };
        const smalls = mids[block.selectedMid!] ?? [];
        mids[block.selectedMid!] = [...smalls, value];
        return {
          ...b,
          tree: {
            ...b.tree,
            [block.selectedLarge!]: mids,
          },
        };
      });
    };

    const compact = opts?.compact ?? false;
    return (
      <div key={block.id} className={`bg-white border border-gray-200 rounded-lg p-3 ${compact ? 'space-y-2' : 'mt-6 space-y-4'} min-w-0`}>
        <div className="flex flex-col gap-2 min-w-0">
          <div className="min-w-0 w-full">
            {isEdit ? (
              <input
                className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm font-semibold text-gray-900 bg-white"
                value={block.title}
                onChange={(e) =>
                  updateFn(block.id, (b) =>
                    b.type === 'category' ? { ...b, title: e.target.value } : b,
                  )
                }
                placeholder="카테고리 설정 이름을 입력하세요"
              />
            ) : (
              <h3 className="text-sm font-semibold text-gray-900 truncate">
                {block.title || '카테고리 트리 설정 (대/중/소)'}
              </h3>
            )}
          </div>
          {isEdit && (
            <div className="flex flex-col gap-1 min-w-0">
              {!compact && (
                <p className="text-xs text-gray-600">
                  대 카테고리를 먼저 추가하고, 각 대 카테고리 안에 중·소 카테고리를 계층적으로 추가하세요.
                </p>
              )}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  className="px-3 py-1.5 text-xs rounded-md border border-red-200 text-red-700 hover:bg-red-50 whitespace-nowrap"
                  onClick={() => {
                    if (!window.confirm('이 카테고리 설정 전체를 삭제하시겠습니까?')) return;
                    removeFn(block.id);
                  }}
                >
                  전체 삭제
                </button>
                <button
                  type="button"
                  className={`px-2 py-0.5 text-[11px] rounded-md font-medium whitespace-nowrap ${
                    block.requiredActivation ? 'bg-green-600 text-white' : 'bg-green-100 text-green-800 border border-green-300'
                  }`}
                  onClick={() =>
                    updateFn(block.id, (b) =>
                      b.type === 'category' ? { ...b, requiredActivation: !b.requiredActivation } : b,
                    )
                  }
                >
                  활성화
                </button>
              </div>
            </div>
          )}
        </div>

        <div className={compact ? 'grid grid-cols-1 gap-2' : 'grid grid-cols-1 md:grid-cols-3 gap-4'}>
          {/* 대 카테고리 */}
          <div className="border border-gray-200 rounded-md bg-gray-50 min-w-0">
            <div className={`flex items-center justify-between ${compact ? 'mb-1 px-2 py-1.5' : 'mb-2 px-3 py-2'} bg-indigo-50 rounded-t-md border-b border-indigo-100`}>
              <h4 className="text-sm font-semibold text-gray-900">대 카테고리</h4>
              {isEdit && (
                <button
                  type="button"
                  className="text-[11px] px-2 py-0.5 rounded-md border border-indigo-200 text-indigo-700 hover:bg-indigo-100"
                  onClick={handleAddLarge}
                >
                  + 추가
                </button>
              )}
            </div>
            <div className={`p-2 space-y-1 overflow-y-auto ${compact ? 'max-h-40' : 'max-h-64'}`}>
              {largeCategories.length === 0 ? (
                <div className="text-[11px] text-gray-400 py-2 text-center">아직 대 카테고리가 없습니다.</div>
              ) : (
                largeCategories.map((name) => {
                  const isActive = block.selectedLarge === name;
                  return (
                    <button
                      key={name}
                      type="button"
                      onClick={() =>
                        updateFn(block.id, (b) =>
                          b.type === 'category'
                            ? { ...b, selectedLarge: name, selectedMid: null }
                            : b,
                        )
                      }
                      className={`w-full text-left px-2 py-1 rounded-md text-xs ${
                        isActive ? 'bg-indigo-50 text-indigo-700' : 'bg-white text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {name}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* 중 카테고리 */}
          <div className="border border-gray-200 rounded-md bg-gray-50 min-w-0">
            <div className={`flex items-center justify-between ${compact ? 'mb-1 px-2 py-1.5' : 'mb-2 px-3 py-2'} bg-indigo-50 rounded-t-md border-b border-indigo-100`}>
              <h4 className="text-sm font-semibold text-gray-900">중 카테고리</h4>
              {isEdit && (
                <button
                  type="button"
                  className="text-[11px] px-2 py-0.5 rounded-md border border-indigo-200 text-indigo-700 hover:bg-indigo-100"
                  onClick={handleAddMid}
                >
                  + 추가
                </button>
              )}
            </div>
            <div className="text-[11px] text-gray-500 mb-1 px-2 pt-1">
              {block.selectedLarge ? `대: ${block.selectedLarge}` : '대 카테고리를 선택하세요.'}
            </div>
            <div className={`px-2 pb-2 space-y-1 overflow-y-auto ${compact ? 'max-h-40' : 'max-h-64'}`}>
              {block.selectedLarge && midCategories.length === 0 ? (
                <div className="text-[11px] text-gray-400 py-2 text-center">아직 중 카테고리가 없습니다.</div>
              ) : (
                midCategories.map((name) => {
                  const isActive = block.selectedMid === name;
                  return (
                    <button
                      key={name}
                      type="button"
                      onClick={() =>
                        updateFn(block.id, (b) =>
                          b.type === 'category' ? { ...b, selectedMid: name } : b,
                        )
                      }
                      className={`w-full text-left px-2 py-1 rounded-md text-xs ${
                        isActive ? 'bg-indigo-50 text-indigo-700' : 'bg-white text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {name}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* 소 카테고리 */}
          <div className="border border-gray-200 rounded-md bg-gray-50 min-w-0">
            <div className={`flex items-center justify-between ${compact ? 'mb-1 px-2 py-1.5' : 'mb-2 px-3 py-2'} bg-indigo-50 rounded-t-md border-b border-indigo-100`}>
              <h4 className="text-sm font-semibold text-gray-900">소 카테고리</h4>
              {isEdit && (
                <button
                  type="button"
                  className="text-[11px] px-2 py-0.5 rounded-md border border-indigo-200 text-indigo-700 hover:bg-indigo-100"
                  onClick={handleAddSmall}
                >
                  + 추가
                </button>
              )}
            </div>
            <div className="text-[11px] text-gray-500 mb-1 px-2 pt-1">
              {block.selectedLarge && block.selectedMid
                ? `대: ${block.selectedLarge} / 중: ${block.selectedMid}`
                : '대/중 카테고리를 선택하세요.'}
            </div>
            <div className={`px-2 pb-2 space-y-1 overflow-y-auto ${compact ? 'max-h-40' : 'max-h-64'}`}>
              {block.selectedLarge && block.selectedMid && smallCategories.length === 0 ? (
                <div className="text-[11px] text-gray-400 py-2 text-center">아직 소 카테고리가 없습니다.</div>
              ) : (
                smallCategories.map((name, idx) => (
                  <div
                    key={`${name}-${idx}`}
                    className="w-full px-2 py-1 rounded-md text-xs bg-white text-gray-700 border border-gray-200"
                  >
                    {name}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {isEdit && (
          <div className="mt-2 text-[11px] text-gray-500">
            ※ 현재는 컴포넌트 로컬 상태로만 관리되며, 추후 공통 설정 스키마/저장소와 연결 예정입니다.
          </div>
        )}
      </div>
    );
  };

  const renderCheckboxBlock = (
    block: Extract<CommonBlock, { type: 'checkbox' }>,
    opts?: BlockRenderOptions,
  ) => {
    const updateFn = opts?.updateBlock ?? updateBlock;
    const removeFn = opts?.removeBlock ?? removeBlock;
    const isEdit = opts?.isEditing ?? isEditingCommon;
    const compact = opts?.compact ?? false;
    const hasItems = block.items.length > 0;

    return (
      <div key={block.id} className={`bg-white border border-gray-200 rounded-lg min-w-0 overflow-hidden ${compact ? 'p-3 space-y-2' : 'mt-6 space-y-4 p-4'}`}>
        <div className="flex flex-col gap-2 min-w-0">
          <div className="min-w-0 w-full">
            {isEdit ? (
              <input
                className="w-full min-w-0 border border-gray-300 rounded-md px-2 py-1 text-sm font-semibold text-gray-900 bg-white"
                value={block.title}
                onChange={(e) =>
                  updateFn(block.id, (b) =>
                    b.type === 'checkbox' ? { ...b, title: e.target.value } : b,
                  )
                }
                placeholder="체크박스 설정 이름을 입력하세요"
              />
            ) : (
              <h3 className="text-sm font-semibold text-gray-900">
                {block.title || '체크박스 설정'}
              </h3>
            )}
          </div>
          {isEdit && (
            <div className="flex flex-col gap-1">
              {!compact && (
                <p className="text-xs text-gray-600">
                  제목 아래에 노출될 체크박스 항목들을 추가하고, 기본 선택 여부를 설정합니다.
                </p>
              )}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  className="px-2 py-0.5 text-[10px] rounded border border-red-200 text-red-700 hover:bg-red-50 whitespace-nowrap"
                  onClick={() => {
                    if (!window.confirm('이 체크박스 설정 전체를 삭제하시겠습니까?')) return;
                    removeFn(block.id);
                  }}
                >
                  전체 삭제
                </button>
                <button
                  type="button"
                  className={`px-1.5 py-0.5 text-[10px] rounded font-medium whitespace-nowrap ${
                    block.requiredActivation ? 'bg-green-600 text-white' : 'bg-green-100 text-green-800 border border-green-300'
                  }`}
                  onClick={() =>
                    updateFn(block.id, (b) =>
                      b.type === 'checkbox' ? { ...b, requiredActivation: !b.requiredActivation } : b,
                    )
                  }
                >
                  활성화
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="border border-gray-200 rounded-md bg-gray-50 p-3 space-y-2 min-w-0 overflow-hidden">
          {!hasItems ? (
            <div className="text-xs text-gray-400 text-center py-4">
              아직 체크박스 항목이 없습니다. 아래 추가하기 버튼으로 항목을 만들어주세요.
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {block.items.map((item, idx) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2 bg-white border border-gray-200 rounded-md px-2 py-1.5 text-xs md:text-sm min-w-0 w-full"
                >
                  <span className="text-[10px] text-gray-400 flex-shrink-0">{idx + 1}.</span>
                  <label className="flex items-center gap-1.5 flex-1 min-w-0">
                    <input
                      type="checkbox"
                      className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0"
                      checked={item.defaultChecked}
                      onChange={(e) =>
                        updateFn(block.id, (b) => {
                          if (b.type !== 'checkbox') return b;
                          const next = b.items.map((it) =>
                            it.id === item.id ? { ...it, defaultChecked: e.target.checked } : it,
                          );
                          return { ...b, items: next };
                        })
                      }
                    />
                    {isEdit ? (
                      <input
                        className="flex-1 min-w-0 border border-gray-300 rounded-md px-1.5 py-0.5 text-[11px]"
                        value={item.label}
                        onChange={(e) =>
                          updateFn(block.id, (b) => {
                            if (b.type !== 'checkbox') return b;
                            const next = b.items.map((it) =>
                              it.id === item.id ? { ...it, label: e.target.value } : it,
                            );
                            return { ...b, items: next };
                          })
                        }
                        placeholder="체크박스 항목 이름"
                      />
                    ) : (
                      <span className="text-xs md:text-sm text-gray-800 truncate">{item.label}</span>
                    )}
                  </label>
                  {isEdit && (
                    <button
                      type="button"
                      className="flex-shrink-0 text-[10px] text-red-600 hover:text-red-800"
                      onClick={() =>
                        updateFn(block.id, (b) => {
                          if (b.type !== 'checkbox') return b;
                          return { ...b, items: b.items.filter((it) => it.id !== item.id) };
                        })
                      }
                    >
                      삭제
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {isEdit && (
            <div className="flex justify-end">
              <button
                type="button"
                className="px-3 py-1.5 text-xs rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                onClick={() => {
                  const label = window.prompt('체크박스 항목 이름을 입력하세요') ?? '';
                  const trimmed = label.trim();
                  if (!trimmed) return;
                  updateFn(block.id, (b) => {
                    if (b.type !== 'checkbox') return b;
                    const newItem: CheckboxItem = {
                      id: `cb-${Date.now()}-${b.items.length}`,
                      label: trimmed,
                      defaultChecked: false,
                    };
                    return { ...b, items: [...b.items, newItem] };
                  });
                }}
              >
                체크박스 항목 추가
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderDropdownBlock = (
    block: Extract<CommonBlock, { type: 'dropdown' }>,
    opts?: BlockRenderOptions,
  ) => {
    const updateFn = opts?.updateBlock ?? updateBlock;
    const removeFn = opts?.removeBlock ?? removeBlock;
    const isEdit = opts?.isEditing ?? isEditingCommon;
    const compact = opts?.compact ?? false;
    const hasOptions = block.options.length > 0;

    return (
      <div className={`bg-white border border-gray-200 rounded-lg min-w-0 overflow-hidden ${compact ? 'space-y-2 p-3' : 'space-y-4 p-4'}`}>
        <div className="flex flex-col gap-2 min-w-0">
          <div className="min-w-0 w-full">
            {isEdit ? (
              <input
                className="w-full min-w-0 border border-gray-300 rounded-md px-2 py-1 text-sm font-semibold text-gray-900 bg-white"
                value={block.title}
                onChange={(e) =>
                  updateFn(block.id, (b) =>
                    b.type === 'dropdown' ? { ...b, title: e.target.value } : b,
                  )
                }
                placeholder="드롭다운 제목을 입력하세요"
              />
            ) : (
              <h3 className="text-sm font-semibold text-gray-900">
                {block.title || '드롭다운 설정'}
              </h3>
            )}
          </div>
          {isEdit && (
            <div className="flex flex-col gap-1">
              {!compact && (
                <p className="text-xs text-gray-600">
                  드롭다운에 들어갈 옵션들을 추가하고, 제목을 설정합니다.
                </p>
              )}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  className="px-2 py-0.5 text-[10px] rounded border border-red-200 text-red-700 hover:bg-red-50 whitespace-nowrap"
                  onClick={() => {
                    if (!window.confirm('이 드롭다운 설정 전체를 삭제하시겠습니까?')) return;
                    removeFn(block.id);
                  }}
                >
                  전체 삭제
                </button>
                <button
                  type="button"
                  className={`px-1.5 py-0.5 text-[10px] rounded font-medium whitespace-nowrap ${
                    block.requiredActivation ? 'bg-green-600 text-white' : 'bg-green-100 text-green-800 border border-green-300'
                  }`}
                  onClick={() =>
                    updateFn(block.id, (b) =>
                      b.type === 'dropdown' ? { ...b, requiredActivation: !b.requiredActivation } : b,
                    )
                  }
                >
                  활성화
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="border border-gray-200 rounded-md bg-gray-50 p-3 space-y-2 min-w-0 overflow-hidden">
          {/* 미리보기: 실제 드롭다운 */}
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs text-gray-600 flex-shrink-0">미리보기</span>
            <select
              className="border border-gray-300 rounded-md px-2 py-1 text-sm bg-white min-w-0 flex-1 max-w-full"
              defaultValue=""
            >
              <option value="" disabled>
                {block.placeholder || '항목을 선택하세요'}
              </option>
              {block.options.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* 옵션 편집 리스트 */}
          <div className="border border-gray-200 rounded-md bg-white p-3 space-y-2 min-w-0 overflow-hidden">
            {block.options.length === 0 ? (
              <div className="text-xs text-gray-400 text-center py-3">
                아직 옵션이 없습니다. 아래 버튼으로 옵션을 추가하세요.
              </div>
            ) : (
              block.options.map((opt, idx) => (
                <div
                  key={opt.id}
                  className="flex items-center gap-2 text-xs min-w-0"
                >
                  <span className="w-5 flex-shrink-0 text-[11px] text-gray-400 text-right">{idx + 1}.</span>
                  {isEdit ? (
                    <input
                      className="flex-1 min-w-0 border border-gray-300 rounded-md px-2 py-1"
                      value={opt.label}
                      onChange={(e) =>
                        updateFn(block.id, (b) => {
                          if (b.type !== 'dropdown') return b;
                          const next = b.options.map((o) =>
                            o.id === opt.id ? { ...o, label: e.target.value } : o,
                          );
                          return { ...b, options: next };
                        })
                      }
                      placeholder="옵션 이름"
                    />
                  ) : (
                    <span className="flex-1 min-w-0 text-gray-800 truncate">{opt.label}</span>
                  )}
                  {isEdit && (
                    <button
                      type="button"
                      className="flex-shrink-0 text-[11px] text-red-600 hover:text-red-800"
                      onClick={() =>
                        updateFn(block.id, (b) => {
                          if (b.type !== 'dropdown') return b;
                          return {
                            ...b,
                            options: b.options.filter((o) => o.id !== opt.id),
                          };
                        })
                      }
                    >
                      삭제
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          {isEdit && (
            <div className="flex items-center gap-2 text-xs min-w-0 flex-wrap">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <input
                  className="flex-1 min-w-0 max-w-full border border-gray-300 rounded-md px-2 py-1 text-xs bg-white"
                  value={block.placeholder ?? ''}
                  onChange={(e) =>
                    updateFn(block.id, (b) =>
                      b.type === 'dropdown' ? { ...b, placeholder: e.target.value } : b,
                    )
                  }
                  placeholder="예: 항목을 선택하세요"
                />
              </div>
              <button
                type="button"
                className="flex-shrink-0 px-3 py-1.5 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                onClick={() => {
                  const label = window.prompt('드롭다운 옵션 이름을 입력하세요') ?? '';
                  const trimmed = label.trim();
                  if (!trimmed) return;
                  updateFn(block.id, (b) => {
                    if (b.type !== 'dropdown') return b;
                    const id = `opt-${Date.now()}-${b.options.length}`;
                    return {
                      ...b,
                      options: [...b.options, { id, label: trimmed }],
                    };
                  });
                }}
              >
                옵션 추가
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="text-2xl font-bold">설정관리</div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <div className={isPreviewOnly ? '' : 'grid grid-cols-[220px,minmax(0,1fr)] gap-6 items-start'}>
          {!isPreviewOnly && (
            <aside className="bg-white rounded-lg border border-gray-200 p-4 space-y-2 text-sm">
              <button
                type="button"
                onClick={saveAndGoToPageList}
                className={`w-full text-left px-3 py-2 rounded-md font-semibold ${
                  activeTab === 'pages'
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                    : 'bg-white text-gray-700 border border-transparent hover:bg-gray-50'
                }`}
              >
                페이지별 설정관리
              </button>
              <button
                type="button"
                onClick={saveAndGoToCurriculumList}
                className={`w-full text-left px-3 py-2 rounded-md font-semibold ${
                  activeTab === 'curriculum'
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                    : 'bg-white text-gray-700 border border-transparent hover:bg-gray-50'
                }`}
              >
                커리큘럼
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('common')}
                className={`w-full text-left px-3 py-2 rounded-md font-semibold ${
                  activeTab === 'common'
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                    : 'bg-white text-gray-700 border border-transparent hover:bg-gray-50'
                }`}
              >
                공통 데이터 설정
              </button>
            </aside>
          )}

          <section className="space-y-6">
            {activeTab === 'common' ? (
              <>
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">공통 데이터 설정</h2>
                      <p className="text-xs text-gray-600 mt-1">
                        여러 페이지가 공유하는 설정의 기본값을 정의합니다. 이후 페이지별 설정에서 필요한 항목만
                        오버라이드할 수 있습니다.
                      </p>
                    </div>
                    <button
                      type="button"
                      className="text-xs px-3 py-1.5 rounded-md bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
                      onClick={handleSaveCommon}
                    >
                      {isEditingCommon ? '저장하기' : '수정하기'}
                    </button>
                  </div>

                  {blocks.length === 0 && (
                    <div className="border border-dashed border-gray-200 rounded-lg bg-gray-50 px-6 py-14 text-center">
                      <div className="text-sm font-semibold text-gray-700 mb-1">
                        {isEditingCommon ? '공통 데이터 설정 편집 모드' : '내용 없음'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {isEditingCommon
                          ? '여기에 공통 데이터 설정 블록(카테고리, 체크박스 등)을 추가할 수 있습니다.'
                          : '공통 데이터 설정 항목은 요청 주시면 여기부터 구성하겠습니다.'}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {blocks.map((block) => {
                      const compactOpts: BlockRenderOptions | undefined = {
                        updateBlock,
                        removeBlock,
                        isEditing: isEditingCommon,
                        compact: true,
                        scope: 'common',
                      };
                      return (
                        <div key={block.id} className="min-w-0">
                          {block.type === 'category'
                            ? renderCategoryBlock(block, compactOpts)
                            : block.type === 'checkbox'
                              ? renderCheckboxBlock(block, compactOpts)
                              : block.type === 'dropdown'
                                ? renderDropdownBlock(block, compactOpts)
                                : renderQuestionTypeBlock(block, compactOpts)}
                        </div>
                      );
                    })}
                  </div>

                  {isEditingCommon && (
                    <div className="mt-4 flex justify-end">
                      <button
                        type="button"
                        className="px-3 py-1.5 text-xs rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                        onClick={() => setIsAddModalOpen(true)}
                      >
                        추가하기
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : previewPageKey ? (
              renderPagePreview(previewPageKey)
            ) : editingPageKey ? (
              /* 페이지 설정 화면 (설정 편집 진입 시) */
              (() => {
                const page = pages.find((p) => p.key === editingPageKey);
                if (!page) {
                  return (
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <p className="text-sm text-gray-500 mb-2">해당 페이지를 찾을 수 없습니다.</p>
                      <button
                        type="button"
                        className="text-sm text-indigo-600 hover:underline"
                        onClick={() => setEditingPageKey(null)}
                      >
                        목록으로 돌아가기
                      </button>
                    </div>
                  );
                }
                const getEffectiveActive = (b: CommonBlock) => {
                  const ov = pageBlockOverrides[editingPageKey]?.[b.id];
                  if (ov !== undefined) return ov;
                  return Boolean((b as { requiredActivation?: boolean }).requiredActivation);
                };
                const toggleBlock = (blockId: string) => {
                  const b = blocks.find((x) => x.id === blockId);
                  const current = b ? getEffectiveActive(b) : false;
                  setPageBlockOverrides((prev) => ({
                    ...prev,
                    [editingPageKey]: { ...(prev[editingPageKey] ?? {}), [blockId]: !current },
                  }));
                };
                return (
                  <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-8">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          className="text-sm text-gray-600 hover:text-gray-900"
                          onClick={() => setEditingPageKey(null)}
                        >
                          ← 목록으로
                        </button>
                        <h2 className="text-lg font-semibold text-gray-900">{page.name} 설정</h2>
                      </div>
                      <div className="flex items-center gap-2">
                        {saveToast && (
                          <span className="text-xs text-green-600 font-medium">저장되었습니다.</span>
                        )}
                        <button
                          type="button"
                          className="px-3 py-2 text-sm rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
                          onClick={saveAndGoToPageList}
                        >
                          저장
                        </button>
                      </div>
                    </div>

                    <section>
                      <h3 className="text-sm font-semibold text-gray-900 mb-2">공통 데이터 설정</h3>
                      <p className="text-xs text-gray-600 mb-4">
                        공통 데이터 설정에서 저장한 블록을 이 페이지에 불러옵니다. 활성화하면 해당 데이터가 이 페이지에 적용됩니다.
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {blocks.length === 0 ? (
                          <div className="col-span-full text-xs text-gray-400 py-4 border border-dashed border-gray-200 rounded-md text-center">
                            공통 데이터 설정에 블록이 없습니다. 공통 데이터 설정 탭에서 먼저 추가하세요.
                          </div>
                        ) : (
                          blocks.map((b) => {
                            const title = b.type === 'category' ? b.title : b.type === 'checkbox' ? b.title : b.title;
                            const isActive = getEffectiveActive(b);
                            return (
                              <div
                                key={b.id}
                                className="border border-gray-200 rounded-md overflow-hidden bg-gray-50 min-w-0"
                              >
                                <div className="flex items-center justify-between px-3 py-2 gap-2">
                                  <div className="min-w-0 flex-1">
                                    <span className="text-sm font-medium text-gray-900 truncate block">{title}</span>
                                    <span className="text-[11px] text-gray-500">
                                      {b.type === 'category' && '카테고리'}
                                      {b.type === 'checkbox' && '체크박스'}
                                      {b.type === 'dropdown' && '드롭다운'}
                                    </span>
                                  </div>
                                  <button
                                    type="button"
                                    className={`flex-shrink-0 px-2 py-1 text-xs rounded-md font-medium ${
                                      isActive
                                        ? 'bg-green-600 text-white hover:bg-green-700'
                                        : 'border border-gray-300 text-gray-700 hover:bg-gray-100'
                                    }`}
                                    onClick={() => toggleBlock(b.id)}
                                  >
                                    {isActive ? '활성화됨' : '활성화'}
                                  </button>
                                </div>
                                {isActive && <div className="border-t border-gray-100">{renderBlockPreview(b)}</div>}
                              </div>
                            );
                          })
                        )}
                      </div>
                    </section>

                    <section>
                      <h3 className="text-sm font-semibold text-gray-900 mb-2">추가 설정</h3>
                      <p className="text-xs text-gray-600 mb-4">
                        이 페이지만을 위한 추가 설정 항목입니다. 카테고리/체크박스/드롭다운 블록을 추가하고, 공통 데이터 설정과 동일한 UI로 내용을 편집할 수 있습니다.
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {(pageExtraBlocks[editingPageKey] ?? []).map((b) => {
                          const extraOpts: BlockRenderOptions = {
                            updateBlock: (id, updater) => updatePageExtraBlock(editingPageKey, id, updater),
                            removeBlock: (id) => removePageExtraBlock(editingPageKey, id),
                            isEditing: true,
                            compact: true,
                            scope: 'extra',
                            pageKey: editingPageKey,
                          };
                          return (
                            <div key={b.id} className="min-w-0">
                              {b.type === 'category'
                                ? renderCategoryBlock(b, extraOpts)
                                : b.type === 'checkbox'
                                  ? renderCheckboxBlock(b, extraOpts)
                                  : b.type === 'dropdown'
                                    ? renderDropdownBlock(b, extraOpts)
                                    : renderQuestionTypeBlock(b, extraOpts)}
                            </div>
                          );
                        })}
                        <button
                          type="button"
                          className="min-h-[120px] py-3 border border-dashed border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-50 flex items-center justify-center"
                          onClick={() => setIsAddExtraModalOpen(true)}
                        >
                          추가하기
                        </button>
                      </div>
                    </section>
                  </div>
                );
              })()
            ) : activeTab === 'curriculum' && editingCurriculumKey ? (
              (() => {
                const curriculum = curriculums.find((c) => c.key === editingCurriculumKey);
                if (!curriculum) {
                  setEditingCurriculumKey(null);
                  return null;
                }
                const targetBlock = getTargetBlock();
                const fieldBlock = getFieldBlock();
                const levelBlock = getLevelBlock();
                const allCommonBlocks = blocks.filter(
                  (b) => b.type === 'category' || b.type === 'checkbox' || b.type === 'dropdown',
                ) as CommonBlock[];

                const renderCategoryPicker = (
                  label: string,
                  catBlock: Extract<CommonBlock, { type: 'category' }> | undefined,
                  value: CurriculumLevelSelection | undefined,
                  onChange: (next: CurriculumLevelSelection) => void,
                ) => {
                  if (!catBlock) {
                    return (
                      <div className="text-xs text-gray-400">
                        공통 데이터 설정에 “{label}” 카테고리 블록이 없습니다.
                      </div>
                    );
                  }
                  const safeValue: CurriculumLevelSelection = value ?? { large: null, mid: null, small: null };
                  const tree = catBlock.tree ?? {};
                  const largeList = Object.keys(tree);
                  const midList = safeValue.large ? Object.keys(tree[safeValue.large] ?? {}) : [];
                  const smallList =
                    safeValue.large && safeValue.mid ? (tree[safeValue.large]?.[safeValue.mid] ?? []) : [];
                  return (
                    <div className="space-y-2">
                      <div className="text-xs font-semibold text-gray-900">{label}</div>
                      <div className="grid grid-cols-1 gap-2">
                        <select
                          className="w-full border border-gray-300 rounded-md px-2 py-1 text-xs bg-white"
                          value={safeValue.large ?? ''}
                          onChange={(e) => {
                            const v = e.target.value || null;
                            onChange({ large: v, mid: null, small: null });
                          }}
                        >
                          <option value="" disabled>
                            대 선택
                          </option>
                          {largeList.map((x) => (
                            <option key={x} value={x}>
                              {x}
                            </option>
                          ))}
                        </select>
                        <select
                          className="w-full border border-gray-300 rounded-md px-2 py-1 text-xs bg-white"
                          value={safeValue.mid ?? ''}
                          disabled={!safeValue.large}
                          onChange={(e) => {
                            const v = e.target.value || null;
                            onChange({ ...safeValue, mid: v, small: null });
                          }}
                        >
                          <option value="">중 (선택)</option>
                          {midList.map((x) => (
                            <option key={x} value={x}>
                              {x}
                            </option>
                          ))}
                        </select>
                        <select
                          className="w-full border border-gray-300 rounded-md px-2 py-1 text-xs bg-white"
                          value={safeValue.small ?? ''}
                          disabled={!safeValue.large || !safeValue.mid}
                          onChange={(e) => {
                            const v = e.target.value || null;
                            onChange({ ...safeValue, small: v });
                          }}
                        >
                          <option value="">소 (선택)</option>
                          {smallList.map((x, idx) => (
                            <option key={`${x}-${idx}`} value={x}>
                              {x}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  );
                };

                const renderTargetPicker = (stage: CurriculumStage) => {
                  const targetId = targetBlock?.id ?? 'cb-default-1';
                  const sideIds = (stage.commonSideBlockIds ?? [])
                    .filter((id) => id !== targetId)
                    .filter((id) => Boolean(allCommonBlocks.find((x) => x.id === id)));
                  const targetPicked = stage.checkboxSelections?.[targetId] ?? stage.targets ?? [];
                  return (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-xs font-semibold text-gray-900">공통데이터</div>
                        <button
                          type="button"
                          className="text-[11px] px-2 py-1 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                          onClick={() => setCurriculumImportCtx({ currKey: curriculum.key, stageId: stage.id })}
                        >
                          공통데이터에서 불러오기
                        </button>
                      </div>

                      <div className="flex items-start gap-3">
                        {/* 대상(항상 표시) */}
                        <div className="border border-gray-200 bg-white rounded-md p-3 text-xs w-[120px] flex-shrink-0">
                          <div className="text-xs font-semibold text-gray-900 mb-2">{targetBlock?.title ?? '대상'}</div>
                          {!targetBlock ? (
                            <div className="text-[11px] text-gray-400">공통 데이터 설정에 “대상” 체크박스 블록이 없습니다.</div>
                          ) : (
                            <div className="space-y-1 max-h-32 overflow-y-auto">
                              {targetBlock.items.map((it) => {
                                const checked = targetPicked.includes(it.id);
                                return (
                                  <label key={it.id} className="flex items-center gap-2 text-[11px] text-gray-800">
                                    <input
                                      type="checkbox"
                                      checked={checked}
                                      onChange={() =>
                                        updateCurriculumStage(curriculum.key, stage.id, (s) => {
                                          const cur = s.checkboxSelections?.[targetId] ?? s.targets ?? [];
                                          const next = checked ? cur.filter((x) => x !== it.id) : [...cur, it.id];
                                          return {
                                            ...s,
                                            checkboxSelections: { ...(s.checkboxSelections ?? {}), [targetId]: next },
                                            targets: next,
                                          };
                                        })
                                      }
                                    />
                                    <span className="truncate">{it.label}</span>
                                  </label>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        {/* 공통데이터(체크/드롭) 작은 선택 UI - 대상 옆 가로 한 줄 */}
                        <div className="flex items-stretch gap-2 overflow-x-auto min-w-0 flex-1">
                          {sideIds.map((bid) => {
                            const b = allCommonBlocks.find((x) => x.id === bid);
                            if (!b) return null;
                            if (b.type === 'dropdown') {
                              const v = stage.dropdownSelections?.[b.id] ?? '';
                              return (
                                <div
                                  key={b.id}
                                  className="border border-gray-200 bg-white rounded-md px-3 py-2 text-xs w-44 flex-shrink-0"
                                >
                                  <div className="flex items-center justify-between gap-2">
                                    <div className="font-semibold text-gray-900 truncate">{b.title || '드롭다운'}</div>
                                    <button
                                      type="button"
                                      className="text-[11px] text-red-600 hover:text-red-800 flex-shrink-0"
                                      onClick={() =>
                                        updateCurriculumStage(curriculum.key, stage.id, (s) => ({
                                          ...s,
                                          commonSideBlockIds: (s.commonSideBlockIds ?? []).filter((x) => x !== b.id),
                                          dropdownSelections: Object.fromEntries(
                                            Object.entries(s.dropdownSelections ?? {}).filter(([k]) => k !== b.id),
                                          ),
                                        }))
                                      }
                                    >
                                      제거
                                    </button>
                                  </div>
                                  <select
                                    className="mt-2 w-full border border-gray-300 rounded-md px-2 py-1 text-xs bg-white"
                                    value={v}
                                    onChange={(e) =>
                                      updateCurriculumStage(curriculum.key, stage.id, (s) => ({
                                        ...s,
                                        dropdownSelections: { ...(s.dropdownSelections ?? {}), [b.id]: e.target.value },
                                      }))
                                    }
                                  >
                                    <option value="" disabled>
                                      {b.placeholder || '선택'}
                                    </option>
                                    {b.options.map((o) => (
                                      <option key={o.id} value={o.id}>
                                        {o.label}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              );
                            }
                            if (b.type === 'checkbox') {
                              const picked = stage.checkboxSelections?.[b.id] ?? [];
                              return (
                                <div
                                  key={b.id}
                                  className="border border-gray-200 bg-white rounded-md px-3 py-2 text-xs w-44 flex-shrink-0"
                                >
                                  <div className="flex items-center justify-between gap-2">
                                    <div className="font-semibold text-gray-900 truncate">{b.title}</div>
                                    <button
                                      type="button"
                                      className="text-[11px] text-red-600 hover:text-red-800"
                                      onClick={() =>
                                        updateCurriculumStage(curriculum.key, stage.id, (s) => ({
                                          ...s,
                                          commonSideBlockIds: (s.commonSideBlockIds ?? []).filter((x) => x !== b.id),
                                        }))
                                      }
                                    >
                                      제거
                                    </button>
                                  </div>
                                  <div className="mt-2 space-y-1 max-h-28 overflow-y-auto">
                                    {b.items.map((it) => {
                                      const checked = (picked ?? []).includes(it.id);
                                      return (
                                        <label key={it.id} className="flex items-center gap-2 text-[11px] text-gray-800">
                                          <input
                                            type="checkbox"
                                            checked={checked}
                                            onChange={() =>
                                              updateCurriculumStage(curriculum.key, stage.id, (s) => {
                                                const cur = s.checkboxSelections?.[b.id] ?? [];
                                                const next = checked ? cur.filter((x) => x !== it.id) : [...cur, it.id];
                                                const nextMap = { ...(s.checkboxSelections ?? {}), [b.id]: next };
                                                return { ...s, checkboxSelections: nextMap };
                                              })
                                            }
                                          />
                                          <span className="truncate">{it.label}</span>
                                        </label>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          })}
                        </div>
                      </div>
                    </div>
                  );
                };

                return (
                  <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          className="text-sm text-gray-600 hover:text-gray-900"
                          onClick={saveAndGoToCurriculumList}
                        >
                          ← 커리큘럼 목록
                        </button>
                        <h2 className="text-lg font-semibold text-gray-900">{curriculum.title} 편집</h2>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="px-3 py-2 text-sm rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
                          onClick={() => addCurriculumStage(curriculum.key)}
                        >
                          단계 추가
                        </button>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <div className="flex gap-4 min-w-max">
                        {(curriculum.stages ?? []).length === 0 ? (
                          <div className="text-sm text-gray-400 border border-dashed border-gray-200 rounded-lg bg-gray-50 px-8 py-10">
                            단계가 없습니다. “단계 추가”를 눌러 시작하세요.
                          </div>
                        ) : (
                          (curriculum.stages ?? []).map((stage) => (
                            <div
                              key={stage.id}
                              className="w-[420px] bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <input
                                  className="w-24 border border-gray-300 rounded-md px-2 py-1 text-xs bg-white font-semibold"
                                  value={stage.stepTitle}
                                  onChange={(e) =>
                                    updateCurriculumStage(curriculum.key, stage.id, (s) => ({
                                      ...s,
                                      stepTitle: e.target.value,
                                    }))
                                  }
                                  placeholder="1단계"
                                />
                                <div className="flex items-center gap-2">
                                  <input
                                    type="number"
                                    className="w-24 border border-gray-300 rounded-md px-2 py-1 text-xs bg-white"
                                    value={stage.hours}
                                    onChange={(e) =>
                                      updateCurriculumStage(curriculum.key, stage.id, (s) => ({
                                        ...s,
                                        hours: Number(e.target.value || 0),
                                      }))
                                    }
                                    placeholder="60"
                                  />
                                  <span className="text-xs text-gray-500">시간</span>
                                </div>
                                <button
                                  type="button"
                                  className="text-xs text-red-600 hover:text-red-800"
                                  onClick={() => {
                                    if (!window.confirm('이 단계를 삭제하시겠습니까?')) return;
                                    removeCurriculumStage(curriculum.key, stage.id);
                                  }}
                                >
                                  삭제
                                </button>
                              </div>

                              <div className="grid grid-cols-1 gap-2">
                                <input
                                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-xs bg-white"
                                  value={stage.className}
                                  onChange={(e) =>
                                    updateCurriculumStage(curriculum.key, stage.id, (s) => ({
                                      ...s,
                                      className: e.target.value,
                                    }))
                                  }
                                  placeholder="반명"
                                />
                                <input
                                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-xs bg-white"
                                  value={stage.courseName}
                                  onChange={(e) =>
                                    updateCurriculumStage(curriculum.key, stage.id, (s) => ({
                                      ...s,
                                      courseName: e.target.value,
                                    }))
                                  }
                                  placeholder="과정 명칭"
                                />
                              </div>

                              {/* 카테고리(공통데이터) 불러온 항목들은 대상 위에 표시 */}
                              <div className="grid grid-cols-1 gap-3">
                                {(stage.commonTopBlockIds ?? []).map((bid) => {
                                  const b = allCommonBlocks.find((x) => x.id === bid && x.type === 'category') as
                                    | Extract<CommonBlock, { type: 'category' }>
                                    | undefined;
                                  if (!b) return null;
                                  const val = stage.categorySelections?.[bid] ?? { large: null, mid: null, small: null };
                                  return (
                                    <div key={bid} className="bg-white border border-gray-200 rounded-md p-3">
                                      <div className="flex items-center justify-between gap-2 mb-2">
                                        <div className="text-xs font-semibold text-gray-900 truncate">{b.title}</div>
                                        <button
                                          type="button"
                                          className="text-[11px] text-red-600 hover:text-red-800"
                                          onClick={() =>
                                            updateCurriculumStage(curriculum.key, stage.id, (s) => ({
                                              ...s,
                                              commonTopBlockIds: (s.commonTopBlockIds ?? []).filter((x) => x !== bid),
                                            }))
                                          }
                                        >
                                          제거
                                        </button>
                                      </div>
                                      {renderCategoryPicker(
                                        b.title,
                                        b,
                                        val,
                                        (next) =>
                                          updateCurriculumStage(curriculum.key, stage.id, (s) => ({
                                            ...s,
                                            categorySelections: { ...(s.categorySelections ?? {}), [bid]: next },
                                            field: bid === 'cat-default-1' ? next : s.field,
                                            level: bid === 'cat-default-2' ? next : s.level,
                                          })),
                                      )}
                                    </div>
                                  );
                                })}
                              </div>

                              <div className="grid grid-cols-1 gap-4">
                                <div className="bg-white border border-gray-200 rounded-md p-3">
                                  {renderTargetPicker(stage)}
                                </div>
                              </div>

                              <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
                                <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-200">
                                  <div className="text-xs font-semibold text-gray-900">주차표</div>
                                  <div className="flex items-center gap-2">
                                    <label className="text-xs px-2 py-1 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 cursor-pointer">
                                      업로드
                                      <input
                                        type="file"
                                        accept=".xlsx,.xls"
                                        className="hidden"
                                        onChange={async (e) => {
                                          const f = e.target.files?.[0];
                                          if (!f) return;
                                          try {
                                            await importCurriculumFromExcel(f, curriculum.key, stage.id);
                                          } finally {
                                            e.currentTarget.value = '';
                                          }
                                        }}
                                      />
                                    </label>
                                    <button
                                      type="button"
                                      className="text-xs px-2 py-1 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100"
                                      onClick={() => addCurriculumRow(curriculum.key, stage.id)}
                                    >
                                      행 추가
                                    </button>
                                    <button
                                      type="button"
                                      className="text-xs px-2 py-1 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100"
                                      onClick={() => addCurriculumColumn(curriculum.key, stage.id)}
                                    >
                                      열 추가
                                    </button>
                                  </div>
                                </div>
                                <div className="overflow-x-auto">
                                  <table className="min-w-full divide-y divide-gray-200 text-xs">
                                    <thead className="bg-gray-50">
                                      <tr>
                                        <th className="px-2 py-2 text-left font-medium text-gray-500 w-14">주차</th>
                                        {(stage.columns ?? []).map((col) => (
                                          <th key={col.id} className="px-2 py-2 text-left font-medium text-gray-500">
                                            <div className="flex items-center gap-1 min-w-0">
                                              <input
                                                className="w-32 min-w-0 border border-gray-300 rounded-md px-2 py-1 text-xs bg-white"
                                                value={col.title}
                                                onChange={(e) =>
                                                  updateCurriculumStage(curriculum.key, stage.id, (s) => ({
                                                    ...s,
                                                    columns: s.columns.map((c) =>
                                                      c.id === col.id ? { ...c, title: e.target.value } : c,
                                                    ),
                                                  }))
                                                }
                                              />
                                              <button
                                                type="button"
                                                className="text-[11px] text-red-600 hover:text-red-800 flex-shrink-0"
                                                onClick={() => {
                                                  if (!window.confirm('이 열을 삭제하시겠습니까?')) return;
                                                  removeCurriculumColumn(curriculum.key, stage.id, col.id);
                                                }}
                                              >
                                                삭제
                                              </button>
                                            </div>
                                          </th>
                                        ))}
                                        <th className="px-2 py-2 text-center font-medium text-gray-500 w-12">관리</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 bg-white">
                                      {stage.rows.map((r) => (
                                        <tr key={r.id} className="align-top">
                                          <td className="px-2 py-2">
                                            <input
                                              type="number"
                                              className="w-14 border border-gray-300 rounded-md px-2 py-1 text-xs"
                                              value={r.week}
                                              onChange={(e) =>
                                                updateCurriculumRow(curriculum.key, stage.id, r.id, (x) => ({
                                                  ...x,
                                                  week: Number(e.target.value || 0),
                                                }))
                                              }
                                            />
                                          </td>
                                          {(stage.columns ?? []).map((col) => (
                                            <td key={col.id} className="px-2 py-2">
                                              <textarea
                                                className="w-44 border border-gray-300 rounded-md px-2 py-1 text-xs"
                                                rows={2}
                                                value={r.cells?.[col.id] ?? ''}
                                                onChange={(e) =>
                                                  updateCurriculumRow(curriculum.key, stage.id, r.id, (x) => ({
                                                    ...x,
                                                    cells: { ...(x.cells ?? {}), [col.id]: e.target.value },
                                                  }))
                                                }
                                                placeholder={col.title}
                                              />
                                            </td>
                                          ))}
                                          <td className="px-2 py-2 text-center">
                                            <button
                                              type="button"
                                              className="text-[11px] text-red-600 hover:text-red-800"
                                              onClick={() => removeCurriculumRow(curriculum.key, stage.id, r.id)}
                                            >
                                              삭제
                                            </button>
                                          </td>
                                        </tr>
                                      ))}
                                      {stage.rows.length === 0 ? (
                                        <tr>
                                          <td colSpan={5} className="px-4 py-8 text-center text-xs text-gray-400">
                                            행이 없습니다.
                                          </td>
                                        </tr>
                                      ) : null}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()
            ) : activeTab === 'curriculum' ? (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">커리큘럼 관리</h2>
                    <p className="text-xs text-gray-600 mt-1">
                      커리큘럼 제목/상태를 관리합니다.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {saveToast && (
                      <span className="text-xs text-green-600 font-medium">저장되었습니다.</span>
                    )}
                    <input
                      value={curriculumQuery}
                      onChange={(e) => setCurriculumQuery(e.target.value)}
                      placeholder="커리큘럼 검색 (제목/key)"
                      className="w-64 border border-gray-300 rounded-md px-3 py-2 text-xs"
                    />
                    <button
                      type="button"
                      className="px-3 py-2 text-xs rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                      onClick={() => {
                        const title = window.prompt('커리큘럼 제목을 입력하세요')?.trim();
                        if (!title) return;
                        const baseKey =
                          title
                            .toLowerCase()
                            .replace(/\\s+/g, '-')
                            .replace(/[^a-z0-9가-힣\\-]/g, '')
                            .slice(0, 40) || 'curriculum';
                        setCurriculums((prev) => {
                          let key = baseKey;
                          let n = 0;
                          while (prev.some((c) => c.key === key)) {
                            n += 1;
                            key = `${baseKey}-${n}`;
                          }
                          return [...prev, { key, title, status: '준비중', stages: [] }];
                        });
                      }}
                    >
                      커리큘럼 추가
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium text-gray-500">커리큘럼 제목</th>
                        <th className="px-4 py-3 text-center font-medium text-gray-500">상태</th>
                        <th className="px-4 py-3 text-center font-medium text-gray-500">관리</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {filteredCurriculums.map((c) => {
                        let badgeClass = 'bg-gray-100 text-gray-700 border-gray-200';
                        if (c.status === '적용중') badgeClass = 'bg-green-100 text-green-800 border-green-200';
                        if (c.status === '준비중') badgeClass = 'bg-indigo-100 text-indigo-800 border-indigo-200';
                        return (
                          <tr key={c.key} className="hover:bg-gray-50">
                            <td className="px-4 py-3 align-top">
                              <div className="font-medium text-gray-900">{c.title}</div>
                            </td>
                            <td className="px-4 py-3 align-top text-center">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${badgeClass}`}
                              >
                                {c.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 align-top text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  type="button"
                                  className="px-3 py-1.5 text-xs rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                                  onClick={() => setEditingCurriculumKey(c.key)}
                                >
                                  편집
                                </button>
                                <button
                                  type="button"
                                  className="px-3 py-1.5 text-xs rounded-md border border-red-200 text-red-700 hover:bg-red-50"
                                  onClick={() => {
                                    if (!window.confirm(`"${c.title}" 커리큘럼을 삭제하시겠습니까?`)) return;
                                    setCurriculums((prev) => prev.filter((x) => x.key !== c.key));
                                  }}
                                >
                                  삭제
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {filteredCurriculums.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="px-4 py-12 text-center text-sm text-gray-500">
                            등록된 커리큘럼이 없습니다.
                          </td>
                        </tr>
                      ) : null}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">페이지별 설정관리</h2>
                    <p className="text-xs text-gray-600 mt-1">
                      공통 설정을 기반으로 페이지별로 다른 값이 필요한 항목만 오버라이드합니다.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {saveToast && (
                      <span className="text-xs text-green-600 font-medium">저장되었습니다.</span>
                    )}
                    <button
                      type="button"
                      className="px-3 py-2 text-sm rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
                      onClick={saveAndGoToPageList}
                    >
                      저장
                    </button>
                    <input
                      value={pageQuery}
                      onChange={(e) => setPageQuery(e.target.value)}
                      placeholder="페이지 검색 (이름/key)"
                      className="w-64 border border-gray-300 rounded-md px-3 py-2 text-xs"
                    />
                    <button
                      type="button"
                      className="px-3 py-2 text-xs rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                      onClick={() => {
                        const name = window.prompt('페이지 이름을 입력하세요')?.trim();
                        if (!name) return;
                        const baseKey = name
                          .toLowerCase()
                          .replace(/\s+/g, '-')
                          .replace(/[^a-z0-9가-힣\-]/g, '')
                          .slice(0, 40) || 'page';
                        setPages((prev) => {
                          let key = baseKey;
                          let n = 0;
                          while (prev.some((p) => p.key === key)) {
                            n += 1;
                            key = `${baseKey}-${n}`;
                          }
                          return [...prev, { key, name, status: '준비중' }];
                        });
                      }}
                    >
                      페이지 추가
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium text-gray-500">페이지</th>
                        <th className="px-4 py-3 text-center font-medium text-gray-500">상태</th>
                        <th className="px-4 py-3 text-center font-medium text-gray-500">관리</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {filteredPages.map((p) => {
                        let badgeClass = 'bg-gray-100 text-gray-700 border-gray-200';
                        if (p.status === '적용중') badgeClass = 'bg-green-100 text-green-800 border-green-200';
                        if (p.status === '준비중') badgeClass = 'bg-indigo-100 text-indigo-800 border-indigo-200';
                        return (
                          <tr key={p.key} className="hover:bg-gray-50">
                            <td className="px-4 py-3 align-top">
                              <button
                                type="button"
                                className="font-medium text-gray-900 hover:underline text-left"
                                onClick={() => window.open(`/admin/settings?preview=${encodeURIComponent(p.key)}`, '_blank')}
                              >
                                {p.name}
                              </button>
                            </td>
                            <td className="px-4 py-3 align-top text-center">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${badgeClass}`}
                              >
                                {p.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 align-top text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  type="button"
                                  className="px-3 py-1.5 text-xs rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                                  onClick={() => setEditingPageKey(p.key)}
                                >
                                  설정 편집
                                </button>
                                <button
                                  type="button"
                                  className="px-3 py-1.5 text-xs rounded-md border border-red-200 text-red-700 hover:bg-red-50"
                                  onClick={() => {
                                    if (!window.confirm(`"${p.name}" 페이지를 삭제하시겠습니까?`)) return;
                                    setPages((prev) => prev.filter((page) => page.key !== p.key));
                                  }}
                                >
                                  삭제
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {filteredPages.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="px-4 py-12 text-center text-sm text-gray-500">
                            등록된 페이지가 없습니다.
                          </td>
                        </tr>
                      ) : null}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* 추가 설정 - 블록 추가 모달 (페이지 설정 화면) */}
      {editingPageKey && isAddExtraModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-3xl bg-white rounded-lg shadow-lg p-6 text-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-900">추가 설정 블록 추가</h2>
              <button
                type="button"
                className="text-gray-400 hover:text-gray-600"
                onClick={() => setIsAddExtraModalOpen(false)}
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-gray-600 mb-4">추가할 블록 종류를 선택하세요.</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                className="border border-gray-200 rounded-md p-4 text-left hover:bg-gray-50"
                onClick={() => addPageExtraBlock('category')}
              >
                <div className="font-semibold text-gray-900 mb-1">카테고리 블록 추가</div>
                <div className="text-xs text-gray-600">
                  대/중/소 카테고리 구조 블록을 추가합니다.
                </div>
              </button>
              <button
                type="button"
                className="border border-gray-200 rounded-md p-4 text-left hover:bg-gray-50"
                onClick={() => addPageExtraBlock('checkbox')}
              >
                <div className="font-semibold text-gray-900 mb-1">체크박스 블록 추가</div>
                <div className="text-xs text-gray-600">
                  제목과 여러 개의 체크박스를 포함한 설정 블록을 추가합니다.
                </div>
              </button>
              <button
                type="button"
                className="border border-gray-200 rounded-md p-4 text-left hover:bg-gray-50"
                onClick={() => addPageExtraBlock('dropdown')}
              >
                <div className="font-semibold text-gray-900 mb-1">드롭다운 블록 추가</div>
                <div className="text-xs text-gray-600">
                  제목과 선택 가능한 옵션 목록을 가진 드롭다운 설정 블록을 추가합니다.
                </div>
              </button>
              <button
                type="button"
                className="border border-gray-200 rounded-md p-4 text-left hover:bg-gray-50"
                onClick={addPageExtraQuestionTypeBlock}
              >
                <div className="font-semibold text-gray-900 mb-1">문제유형 블록 추가</div>
                <div className="text-xs text-gray-600">
                  4지선다/단답형/주관식/OX 등 문제유형을 켜고 끌 수 있는 설정 블록을 추가합니다.
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 공통 데이터 설정 - 블록 추가 모달 */}
      {isEditingCommon && isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-3xl bg-white rounded-lg shadow-lg p-6 text-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-900">공통 데이터 설정 블록 추가</h2>
              <button
                className="text-xs text-gray-500 hover:text-gray-700"
                onClick={() => setIsAddModalOpen(false)}
              >
                닫기
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-gray-600">어떤 종류의 공통 설정 블록을 추가할지 선택하세요.</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button
                  type="button"
                  className="border border-gray-200 rounded-md p-4 text-left hover:bg-gray-50"
                  onClick={() => {
                    addCategoryBlock();
                    setIsAddModalOpen(false);
                  }}
                >
                  <div className="font-semibold text-gray-900 mb-1">카테고리 블록 추가</div>
                  <div className="text-xs text-gray-600">
                    시험/가격 등에서 공통으로 사용할 대/중/소 카테고리 구조 블록을 하나 더 만듭니다.
                  </div>
                </button>
                <button
                  type="button"
                  className="border border-gray-200 rounded-md p-4 text-left hover:bg-gray-50"
                  onClick={() => {
                    addCheckboxBlock();
                    setIsAddModalOpen(false);
                  }}
                >
                  <div className="font-semibold text-gray-900 mb-1">체크박스 블록 추가</div>
                  <div className="text-xs text-gray-600">
                    제목과 여러 개의 체크박스를 포함한 설정 블록을 하나 더 만듭니다.
                  </div>
                </button>
                <button
                  type="button"
                  className="border border-gray-200 rounded-md p-4 text-left hover:bg-gray-50"
                  onClick={() => {
                    addDropdownBlock();
                    setIsAddModalOpen(false);
                  }}
                >
                  <div className="font-semibold text-gray-900 mb-1">드롭다운 블록 추가</div>
                  <div className="text-xs text-gray-600">
                    제목과 선택 가능한 옵션 목록을 가진 드롭다운 설정 블록을 추가합니다.
                  </div>
                </button>
                <button
                  type="button"
                  className="border border-gray-200 rounded-md p-4 text-left hover:bg-gray-50"
                  onClick={() => {
                    addQuestionTypeBlock();
                    setIsAddModalOpen(false);
                  }}
                >
                  <div className="font-semibold text-gray-900 mb-1">문제유형 블록 추가</div>
                  <div className="text-xs text-gray-600">
                    4지선다/단답형/주관식/OX 등 문제유형을 켜고 끌 수 있는 설정 블록을 추가합니다.
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 문제유형 - 문제 추가 모달 */}
      {qtAddCtx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-xl bg-white rounded-lg shadow-lg p-6 text-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-900">문제 추가하기</h2>
              <button
                type="button"
                className="text-xs text-gray-500 hover:text-gray-700"
                onClick={() => setQtAddCtx(null)}
              >
                닫기
              </button>
            </div>
            <p className="text-xs text-gray-600 mb-4">추가할 문제 유형을 선택하세요.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { kind: 'mcq' as const, title: '4지선다', desc: '제목 + 보기 4개' },
                { kind: 'short' as const, title: '단답형', desc: '제목만' },
                { kind: 'essay' as const, title: '주관식', desc: '제목만' },
                { kind: 'ox' as const, title: 'OX', desc: '제목 + OX 선택' },
              ].map((opt) => (
                <button
                  key={opt.kind}
                  type="button"
                  className="border border-gray-200 rounded-md p-4 text-left hover:bg-gray-50"
                  onClick={() => {
                    const addQuestion = (updateFn: (id: string, up: (b: CommonBlock) => CommonBlock) => void, blockId: string) => {
                      updateFn(blockId, (b) => {
                        if (b.type !== 'questionType') return b;
                        const newQ: QuestionItem = {
                          id: `q-${Date.now()}-${b.questions.length}`,
                          kind: opt.kind,
                          title: '',
                          choices:
                            opt.kind === 'mcq'
                              ? (['보기 1', '보기 2', '보기 3', '보기 4'] as [string, string, string, string])
                              : undefined,
                          oxValue: opt.kind === 'ox' ? null : undefined,
                        };
                        return { ...b, questions: [...b.questions, newQ] };
                      });
                    };

                    if (qtAddCtx.scope === 'common') {
                      addQuestion(updateBlock, qtAddCtx.blockId);
                    } else if (qtAddCtx.scope === 'extra' && qtAddCtx.pageKey) {
                      addQuestion((id, up) => updatePageExtraBlock(qtAddCtx.pageKey!, id, up), qtAddCtx.blockId);
                    }
                    setQtAddCtx(null);
                  }}
                >
                  <div className="font-semibold text-gray-900 mb-1">{opt.title}</div>
                  <div className="text-xs text-gray-600">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 커리큘럼 - 공통데이터 불러오기 모달 */}
      {curriculumImportCtx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-3xl bg-white rounded-lg shadow-lg p-6 text-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-900">공통데이터에서 불러오기</h2>
              <button
                type="button"
                className="text-xs text-gray-500 hover:text-gray-700"
                onClick={() => setCurriculumImportCtx(null)}
              >
                닫기
              </button>
            </div>
            <p className="text-xs text-gray-600 mb-4">
              카테고리는 대상 위에 추가되고, 체크박스/드롭다운은 대상 옆에 작게 추가됩니다.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {blocks
                .filter((b) => b.type === 'category' || b.type === 'checkbox' || b.type === 'dropdown')
                .map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    className="border border-gray-200 rounded-md p-4 text-left hover:bg-gray-50"
                    onClick={() => {
                      const { currKey, stageId } = curriculumImportCtx;
                      updateCurriculumStage(currKey, stageId, (s) => {
                        // "대상" 체크박스는 기본으로 항상 표시되므로, 사이드 추가 대상으로 취급하지 않음
                        if (b.type === 'checkbox' && (b.title ?? '').includes('대상')) return s;
                        if (b.type === 'category') {
                          const ids = s.commonTopBlockIds ?? [];
                          if (ids.includes(b.id)) return s;
                          return {
                            ...s,
                            commonTopBlockIds: [...ids, b.id],
                            categorySelections: {
                              ...(s.categorySelections ?? {}),
                              [b.id]: s.categorySelections?.[b.id] ?? { large: null, mid: null, small: null },
                            },
                          };
                        }
                        if (b.type === 'dropdown') {
                          const ids = s.commonSideBlockIds ?? [];
                          if (ids.includes(b.id)) return s;
                          return {
                            ...s,
                            commonSideBlockIds: [...ids, b.id],
                            dropdownSelections: { ...(s.dropdownSelections ?? {}), [b.id]: s.dropdownSelections?.[b.id] ?? '' },
                          };
                        }
                        // checkbox
                        const ids = s.commonSideBlockIds ?? [];
                        if (ids.includes(b.id)) return s;
                        return {
                          ...s,
                          commonSideBlockIds: [...ids, b.id],
                          checkboxSelections: { ...(s.checkboxSelections ?? {}), [b.id]: s.checkboxSelections?.[b.id] ?? [] },
                        };
                      });
                      setCurriculumImportCtx(null);
                    }}
                  >
                    <div className="font-semibold text-gray-900 mb-1">{b.title || '이름 없음'}</div>
                    <div className="text-xs text-gray-600">
                      {b.type === 'category' && '카테고리'}
                      {b.type === 'checkbox' && '체크박스'}
                      {b.type === 'dropdown' && '드롭다운'}
                    </div>
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

