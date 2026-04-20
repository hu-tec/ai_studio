// PersonHub 공통 타입 — 강사·상담·거래처·면접 4개 영역 공용 프레임
// 규정 준수: #3 프레임 우선, #7 UI 규칙, #22 preserve_title

export type HubFieldType = 'text' | 'number' | 'chip' | 'multiline';

export interface HubColumn {
  key: string;
  label: string;
  type?: HubFieldType;
  width?: string;          // 테이블 컬럼 css width class (w-24 등)
  required?: boolean;      // 항상 표시 (숨김 불가)
  options?: string[];      // chip 타입 옵션
  drilldown?: boolean;     // 셀 클릭 시 필터
  sortable?: boolean;      // 정렬 가능 (기본 true)
  showInList?: boolean;    // 리스트에 표시 (기본 true)
  showInDetail?: boolean;  // 펼침 상세에 표시 (기본 true)
  colSpan?: 1 | 2 | 3;     // 펼침 상세에서 그리드 span (기본 1)
  placeholder?: string;
}

export interface HubConfig<T = any> {
  title: string;                  // 한글 타이틀 (원본 폴더명 등 preserve)
  subtitle?: string;
  emoji?: string;
  idField: string;                // id 필드명
  timeField: string;              // 시간 필드 (첫 열)
  noteField: string;              // 비고 필드 (마지막 열)
  fieldKey?: string;              // 분야 필터 대상 필드
  fieldOptions?: string[];        // 분야 옵션 목록
  statusKey?: string;
  statusOptions?: string[];
  columns: HubColumn[];
  statsGroupBy?: string;          // 통계 그룹 기준 (분야별 카운트 등)
  createEmpty: () => T;
}
