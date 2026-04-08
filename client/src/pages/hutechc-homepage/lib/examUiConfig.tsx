'use client';

import { useEffect, useState } from 'react';

export type ExamType = 'AI번역' | '프롬프트' | 'ITT 시험' | '윤리시험' | '기타';

export type ExamUiMode = 'candidate' | 'author';

// 패널 내부의 슬롯(행) 정의 - 어떤 기능 조합을 한 줄에 배치할지
export type PanelWidgetType =
  | '영상 보기'
  | '요약 보기'
  | '목차 만들기'
  | '문단 보기'
  | 'AI 도우미'
  | '하이라이트'
  | '옵션 없음';

export interface PanelRowConfig {
  id: string; // 고유 ID (클라이언트에서 생성)
  col1: PanelWidgetType;
  col2: PanelWidgetType;
  col3: PanelWidgetType;
  enableTooltip: boolean;
  enableAiSummary: boolean;
}

export interface ExamUiConfig {
  // 기존 메타/시험 정보 (지금은 화면 상단 요약용/호환용으로만 보관, UI에서는 숨길 수 있음)
  examType: ExamType;
  examNameMajor: string;
  examNameMiddle: string;
  examNameMinor: string;
  purpose: string;

  targetCandidate: '개인' | '그룹' | '개인/그룹';

  siteType: string;
  memberType: string;

  period1: string;
  period2: string;
  period3: string;
  period4: string;

  editorType:
    | '에디터'
    | '영상 에디터'
    | '코딩 에디터'
    | '번역 에디터'
    | '문서 에디터'
    | '프롬프트 에디터';

  rolePermission: string;

  region: string;

  certificateType: string;
  amount: number;

  ethicsCommon: string;
  gradeCategory: string;

  // 응시 화면 UI 레이아웃 (원문/AI/비교/에디터 4패널) - 패널의 표시 여부/순서
  showOriginalPanel: boolean;
  showAiPanel: boolean;
  showComparePanel: boolean;
  showEditorPanel: boolean;
  originalOrder: number;
  aiOrder: number;
  compareOrder: number;
  editorOrder: number;

  // 왼쪽 사이드바 "바로가기" 설정 - 활성화된 항목 id 리스트
  quickMenuEnabledIds: string[];

  // 업로드 화면에서 사용할 기능 id 리스트 (예: 요약, 분리, 도구 등)
  uploadOptionEnabledIds: string[];

  // 오른쪽 메뉴 탭 구성
  rightMenuTabs: {
    menu1: string; // 기능 id
    menu2: string;
    menu3: string;
    menu4: string;
  };

  // 패널별 슬롯/행 구성
  originalPanelRows: PanelRowConfig[];
  aiPanelRows: PanelRowConfig[];
  comparePanelRows: PanelRowConfig[];
  editorPanelRows: PanelRowConfig[];
}

const STORAGE_KEY_PREFIX = 'examUiConfig:';

const DEFAULT_PANEL_ROWS: PanelRowConfig[] = [
  {
    id: 'row-1',
    col1: '영상 보기',
    col2: '요약 보기',
    col3: '목차 만들기',
    enableTooltip: true,
    enableAiSummary: true,
  },
];

const DEFAULT_CONFIG: ExamUiConfig = {
  examType: 'AI번역',
  examNameMajor: '',
  examNameMiddle: '',
  examNameMinor: '',
  purpose: '',
  targetCandidate: '개인/그룹',
  siteType: '',
  memberType: '',
  period1: '1교시 객관',
  period2: '2교시 주관',
  period3: '3교시 윤리',
  period4: '4교시는 특수전문가',
  editorType: '에디터',
  rolePermission: '응시자',
  region: '',
  certificateType: '',
  amount: 0,
  ethicsCommon: '',
  gradeCategory: '',
  showOriginalPanel: true,
  showAiPanel: true,
  showComparePanel: true,
  showEditorPanel: true,
  originalOrder: 1,
  aiOrder: 2,
  compareOrder: 3,
  editorOrder: 4,
  quickMenuEnabledIds: [],
  uploadOptionEnabledIds: [],
  rightMenuTabs: {
    menu1: 'none',
    menu2: 'none',
    menu3: 'none',
    menu4: 'none',
  },
  originalPanelRows: DEFAULT_PANEL_ROWS,
  aiPanelRows: DEFAULT_PANEL_ROWS,
  comparePanelRows: DEFAULT_PANEL_ROWS,
  editorPanelRows: DEFAULT_PANEL_ROWS,
};

export function useExamUiConfig(mode: ExamUiMode) {
  const storageKey = `${STORAGE_KEY_PREFIX}${mode}`;
  const [config, setConfig] = useState<ExamUiConfig>(DEFAULT_CONFIG);
  const [loaded, setLoaded] = useState(false);

  // load from localStorage
  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      const raw = window.localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<ExamUiConfig>;
        setConfig({ ...DEFAULT_CONFIG, ...parsed });
      }
      setLoaded(true);
    } catch (e) {
      console.error('Failed to load exam UI config', e);
      setLoaded(true);
    }
  }, [storageKey]);

  const update = (patch: Partial<ExamUiConfig>) => {
    setConfig((prev) => {
      const next = { ...prev, ...patch };
      try {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(storageKey, JSON.stringify(next));
        }
      } catch (e) {
        console.error('Failed to save exam UI config', e);
      }
      return next;
    });
  };

  const reset = () => {
    setConfig(DEFAULT_CONFIG);
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(storageKey);
      }
    } catch (e) {
      console.error('Failed to reset exam UI config', e);
    }
  };

  return { config, update, reset, loaded } as const;
}
