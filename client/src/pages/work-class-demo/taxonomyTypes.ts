// 업무 분류 최종 DB (T9) — 타입 정의
// 편집 탭 / api.ts / 모든 consumer 에서 공유.

export type TaxonomyScope = 'ai-studio' | 'work-studio' | 'homepage' | 'common';
export type TaxonomyGov = 'company-rule' | 'work-guide' | 'homepage' | 'common';
export type TaxonomyLevel = 'large' | 'medium' | 'small' | 'flat';

// scope × gov 별로 허용되는 axis 화이트리스트.
// 프론트/백 양쪽에서 동일 소스 참조.
export const ALLOWED_AXES: Record<string, string[]> = {
  // 사내규정 (company-rule) — 사내업무지침 > 사내규정 탭 기반
  'ai-studio|company-rule': ['유형', '업무별', '부서별', '직급별', '계약', '작성자'],
  // 업무지침 (work-guide) — 사내업무지침 > 업무지침 탭 기반
  'ai-studio|work-guide':   ['분류별', '교육별', '급수별', '세부급수', 'DB별'],
  // 홈페이지 분류
  'ai-studio|homepage':     ['홈페이지타입', '분야', '급수'],

  'work-studio|company-rule': ['유형', '업무별', '부서별', '직급별'],
  'work-studio|work-guide':   ['분류별', '교육별', '급수별', '세부급수', 'DB별'],
  'work-studio|homepage':     ['홈페이지타입', '분야', '급수'],

  'homepage|homepage':        ['홈페이지타입', '분야', '급수'],

  // common — 원본 분류표 (scripts/seed-data/분류표_260402.txt) 5 축
  'common|common':            ['분야', '급수', '홈페이지', '부서', '등급'],
  'common|company-rule':      ['유형', '업무별', '부서별', '직급별', '계약', '작성자'],
  'common|work-guide':        ['분류별', '교육별', '급수별', '세부급수', 'DB별'],
  'common|homepage':          ['홈페이지타입', '분야', '급수'],
};

export function allowedAxes(scope: TaxonomyScope, gov: TaxonomyGov): string[] {
  return ALLOWED_AXES[`${scope}|${gov}`] || [];
}

export interface TaxonomyNode {
  taxonomy_id: string;
  scope: TaxonomyScope;
  gov: TaxonomyGov;
  axis: string;
  level: TaxonomyLevel;
  parent_id: string | null;
  label: string;
  emoji?: string | null;
  sort_order: number;
  source: 'seed' | 'user' | 'migration';
  locked: 0 | 1;
  removed: 0 | 1;
  revision: number;
  created_by?: string;
  updated_by?: string;
  data?: any;           // 규정등급/색상/비고 JSON
  updated_at?: string;
}

export interface TaxonomyTreeNode extends TaxonomyNode {
  children: TaxonomyTreeNode[];
}

export interface TaxonomyItem {
  item_id: string;
  label: string;
  scope: TaxonomyScope;
  facets: Record<string, string>; // axis → taxonomy_id
  gov_matrix?: { translation?: string; ethics?: string; security?: string };
  mandalart_cell_id?: string;
  worklog_task_id?: string;
  note?: string;
  source: 'seed' | 'user' | 'migration';
  locked: 0 | 1;
  removed: 0 | 1;
  revision: number;
}

export interface TaxonomyMandalart {
  mandalart_id: string;           // `${scope}|${gov}|${rows}x${cols}`
  data: {
    size: { rows: number; cols: number };
    cells: Array<{
      id: string;
      text: string;
      taxonomy_id?: string;
      axis?: string;
      level?: TaxonomyLevel;
      children?: any[];
    }>;
    importedFromWorklog?: { at: string; count: number } | null;
  };
  revision: number;
}
