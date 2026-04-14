// Types and Mock Data

export interface TimeSlotEntry {
  id: string;
  timeSlot: string;
  title: string;
  content: string;
  planned: string;
  aiDetail?: AIDetail;
}

export interface PromptRow {
  id: string;
  content: string;
  note: string;
}

export interface AIDetail {
  workTypes: string[];
  aiTools: string[];
  instructions: string;
  instructionNote: string;
  importantNotes: string;
  promptGrid1: PromptRow[];
  promptGrid2: PromptRow[];
  beforeImage: string | null;
  afterImage: string | null;
  securityPrompt1: string;
  securityPrompt2: string;
  regulations: string;
  semiRegulations: string;
  optionalRegulations: string;
  fieldRegulations: string;
}

export interface PromptTemplate {
  id: string;
  name: string;
  prompt1: string;
  prompt2: string;
}

export const defaultTemplates: PromptTemplate[] = [
  {
    id: 'template-default',
    name: '기본 프롬프트 세트',
    prompt1: `1차 프롬프트 지시사항\n1.\n2.\n3.\n4. 작업 범위\n- 포함:\n- 제외:\n[필요 기능]\n1. (Must)\n2. (Must)\n3. (Should)\n[고려사항]\n1.\n2.\n3.\n( 진행할때 가장중요한것)\n1.\n2.\n3.\n[회사 고정 규정 – 반드시 적용]- 이건 항상 프롬프트가 인지 해야하는내용입니다 \n- 간격:\n- 색상:\n- 형식:\n- 이모지:\n- 톤:\n- 적용 범위:\n([준 규정]  \n([선택 규정]  \n\n위 조건을 반영하여 1차 구조 설계로 작성해줘.\n완성본이 아니라 구조 중심으로.`,
    prompt2: `2차 프롬프트 지시사항 \n위 1차 구조를 기반으로 UX 흐름을 개선해줘.\n\n[보완 요청]\n1.\n2.\n3.\n\n[유지해야 할 요소]\n1.\n2.\n3.\n( 진행할때 가장중요한것)\n1.\n2.\n3.\n회사 고정, 준고정, 선택 규정은 그대로 유지.\n완성 코드가 아니라 UX 개선 중심으로 작성.`
  }
];

export function loadTemplates(): PromptTemplate[] {
  try {
    const stored = localStorage.getItem('prompt-templates');
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  return defaultTemplates;
}

export function saveTemplates(templates: PromptTemplate[]) {
  localStorage.setItem('prompt-templates', JSON.stringify(templates));
}

export type Position = '알바' | '신입' | '강사' | '팀장' | '개발' | '외부' | '임원' | '대표';

export const positions: Position[] = ['알바', '신입', '강사', '팀장', '개발', '외부', '임원', '대표'];

export type ViewMode = 'classic' | 'franklin' | 'eisenhower' | 'mandalart' | 'list';

// 만다라트 셀: N×N 격자의 각 칸
export interface MandalartCell {
  id: string;
  text: string;
  children?: MandalartCell[]; // 하위 N×N (center 제외, 홀수 N일 경우)
  taskId?: string;           // 연결된 Task ID
  achievement?: number;      // 달성률 1~5 (1·2·3=양, 4·5=질)
  status?: FranklinStatus;   // 진행 상태 (프랭클린과 동기화)
  color?: string;            // 셀 색깔 (부모→자식 전부 상속)
}

// 만다라트 기간 모드
export type MandalartPeriod = 'daily' | 'weekly' | 'monthly';

// 만다라트 한 축 크기 (3~9)
export type MandalartDim = 3 | 4 | 5 | 6 | 7 | 8 | 9;
export const MANDALART_DIMS: readonly MandalartDim[] = [3, 4, 5, 6, 7, 8, 9] as const;

// 만다라트 그리드 크기 (R×C 직사각형 허용)
export interface MandalartSize { rows: MandalartDim; cols: MandalartDim }

/** 레거시 number(N) → {rows:N, cols:N} 변환 (null/undefined/bad input도 안전) */
export function normalizeMandalartSize(raw: any): MandalartSize {
  if (raw == null) return { rows: 3, cols: 3 };
  if (typeof raw === 'number' && raw >= 3 && raw <= 9) {
    const n = Math.round(raw) as MandalartDim;
    return { rows: n, cols: n };
  }
  if (typeof raw === 'object' && typeof raw.rows === 'number' && typeof raw.cols === 'number') {
    const r = Math.max(3, Math.min(9, Math.round(raw.rows))) as MandalartDim;
    const c = Math.max(3, Math.min(9, Math.round(raw.cols))) as MandalartDim;
    return { rows: r, cols: c };
  }
  return { rows: 3, cols: 3 };
}

export function sameMandalartSize(a: MandalartSize, b: MandalartSize): boolean {
  return a.rows === b.rows && a.cols === b.cols;
}

// 만다라트 색상 팔레트 (부모 셀 색 선택용) — 8가지 + 해제
export const MANDALART_COLOR_PALETTE: { value: string; bg: string; border: string; light: string }[] = [
  { value: 'pink',   bg: '#ec4899', border: '#db2777', light: '#fce7f3' },
  { value: 'red',    bg: '#ef4444', border: '#dc2626', light: '#fee2e2' },
  { value: 'orange', bg: '#f97316', border: '#ea580c', light: '#ffedd5' },
  { value: 'amber',  bg: '#f59e0b', border: '#d97706', light: '#fef3c7' },
  { value: 'green',  bg: '#10b981', border: '#059669', light: '#d1fae5' },
  { value: 'cyan',   bg: '#06b6d4', border: '#0891b2', light: '#cffafe' },
  { value: 'blue',   bg: '#3b82f6', border: '#2563eb', light: '#dbeafe' },
  { value: 'purple', bg: '#a855f7', border: '#9333ea', light: '#f3e8ff' },
];
export function mandalartColor(value?: string): typeof MANDALART_COLOR_PALETTE[number] | null {
  if (!value) return null;
  return MANDALART_COLOR_PALETTE.find(c => c.value === value) || null;
}

// 만다라트 타입 (업무일지/규정/미팅/...) — 타입별로 독립 저장, 크기 선택 가능
export interface MandalartTypeConfig {
  id: string;
  label: string;
  size: MandalartSize;
}

// 고정 타입 id — 이 id 의 만다라트만 Task/타임테이블과 동기화
export const WORKLOG_MANDALART_ID = 'worklog';

export const DEFAULT_MANDALART_TYPES: MandalartTypeConfig[] = [
  { id: WORKLOG_MANDALART_ID, label: '업무일지', size: { rows: 3, cols: 3 } },
  { id: 'regulation',         label: '규정',     size: { rows: 3, cols: 3 } },
  { id: 'meeting',            label: '미팅',     size: { rows: 3, cols: 3 } },
];

// R×C 그리드 헬퍼
export function mandalartCellCount(size: MandalartSize): number { return size.rows * size.cols; }
export function mandalartCenterIdx(size: MandalartSize): number {
  // rows·cols 둘 다 홀수일 때만 중앙 1칸을 "목표"로 예약
  if (size.rows % 2 === 1 && size.cols % 2 === 1) {
    const cr = Math.floor(size.rows / 2);
    const cc = Math.floor(size.cols / 2);
    return cr * size.cols + cc;
  }
  return -1;
}
export function mandalartChildCount(size: MandalartSize): number {
  const c = mandalartCenterIdx(size);
  return mandalartCellCount(size) - (c >= 0 ? 1 : 0);
}

// (type, period, size) 조합 → 저장 키
export function mandalartKey(typeId: string, period: MandalartPeriod, size: MandalartSize): string {
  return `${typeId}|${period}|${size.rows}x${size.cols}`;
}

/** 빈 MandalartCell 생성 (resize 시 빈자리 채움용) */
function emptyResizedCell(): MandalartCell {
  return { id: `mc-rs-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, text: '', children: [], achievement: 0 };
}

/**
 * 만다라트 루트 그리드 2D 위치 보존 resize.
 * - 기존 셀의 (row, col) 좌표가 신규 그리드의 같은 좌표로 매핑됨
 * - 행 확장: 기존 데이터는 그대로, 추가 행은 빈칸
 * - 열 확장: 기존 데이터는 그대로, 추가 열은 빈칸
 * - 축소: 범위 밖 셀은 드랍
 * - 자식 서브그리드도 재귀적으로 resize
 */
export function resizeMandalartCells(
  oldCells: MandalartCell[],
  oldSize: MandalartSize,
  newSize: MandalartSize,
): MandalartCell[] {
  const newCount = mandalartCellCount(newSize);
  const result: MandalartCell[] = Array.from({ length: newCount }, emptyResizedCell);
  const R = Math.min(oldSize.rows, newSize.rows);
  const C = Math.min(oldSize.cols, newSize.cols);
  for (let r = 0; r < R; r++) {
    for (let c = 0; c < C; c++) {
      const oldIdx = r * oldSize.cols + c;
      const newIdx = r * newSize.cols + c;
      const src = oldCells[oldIdx];
      if (!src) continue;
      const cloned: MandalartCell = { ...src };
      if (src.children && src.children.length > 0) {
        cloned.children = resizeMandalartChildren(src.children, oldSize, newSize);
      }
      result[newIdx] = cloned;
    }
  }
  return result;
}

/**
 * 자식 그리드(센터 제외 저장) 2D 위치 보존 resize.
 * - 자식 배열은 visual grid 에서 center 를 건너뛴 flat array
 * - 이 함수는 (flat idx → visual (r,c)) 변환 후 신규 size 의 visual 좌표로 매핑,
 *   신규 size 의 center 슬롯에 떨어지는 셀은 드랍
 */
export function resizeMandalartChildren(
  oldChildren: MandalartCell[],
  oldSize: MandalartSize,
  newSize: MandalartSize,
): MandalartCell[] {
  const oldCenterIdx = mandalartCenterIdx(oldSize);
  const newCenterIdx = mandalartCenterIdx(newSize);
  const oldHasCenter = oldCenterIdx >= 0;
  const newHasCenter = newCenterIdx >= 0;
  const newChildCount = mandalartChildCount(newSize);
  const result: MandalartCell[] = Array.from({ length: newChildCount }, emptyResizedCell);
  const R = Math.min(oldSize.rows, newSize.rows);
  const C = Math.min(oldSize.cols, newSize.cols);
  for (let i = 0; i < oldChildren.length; i++) {
    const src = oldChildren[i];
    if (!src) continue;
    // flat idx → visual idx (센터를 skip한 저장이므로 되돌림)
    const oldVisual = oldHasCenter ? (i < oldCenterIdx ? i : i + 1) : i;
    const r = Math.floor(oldVisual / oldSize.cols);
    const c = oldVisual % oldSize.cols;
    if (r >= R || c >= C) continue; // 축소 범위 밖 → 드랍
    const newVisual = r * newSize.cols + c;
    if (newHasCenter && newVisual === newCenterIdx) continue; // 새 센터 슬롯 → 드랍
    const newChildIdx = newHasCenter && newVisual > newCenterIdx ? newVisual - 1 : newVisual;
    const cloned: MandalartCell = { ...src };
    if (src.children && src.children.length > 0) {
      cloned.children = resizeMandalartChildren(src.children, oldSize, newSize);
    }
    result[newChildIdx] = cloned;
  }
  return result;
}

/** 레거시 key(`type|period|N`) → 신규 key(`type|period|NxN`) 마이그레이션 */
export function migrateMandalartKeys(byKey: Record<string, MandalartCell[]>): Record<string, MandalartCell[]> {
  const out: Record<string, MandalartCell[]> = {};
  for (const [k, v] of Object.entries(byKey)) {
    const parts = k.split('|');
    if (parts.length === 3 && /^\d+$/.test(parts[2])) {
      const n = parts[2];
      out[`${parts[0]}|${parts[1]}|${n}x${n}`] = v;
    } else {
      out[k] = v;
    }
  }
  return out;
}

export type FranklinPriority = 'A' | 'B' | 'C' | 'D';
export type FranklinStatus = 'pending' | 'done' | 'progress' | 'forwarded' | 'cancelled';

export interface Task {
  id: string;
  priority: FranklinPriority;
  number: number;           // A1, A2, B1...
  task: string;
  status: FranklinStatus;
  timeSlotId?: string;      // Classic 모드: 슬롯 연결
  startTime?: string;       // Franklin/Eisenhower: "09:00" 자유 시간
  endTime?: string;         // Franklin/Eisenhower: "14:37"
  note?: string;
  files?: string[];         // 첨부 파일 URLs
  isIssue?: boolean;        // ⚠ 이슈 표시
  urgent?: boolean;         // 아이젠하워: 긴급
  important?: boolean;      // 아이젠하워: 중요
  achievement?: number;     // 달성률 0-5 (1-3=양, 4-5=질)
  children?: Task[]; // 서브태스크
  parentId?: string;        // 부모 태스크 ID
  period?: MandalartPeriod; // 일간/주간/월간
  queued?: boolean;         // 대기함에 명시적으로 넣은 태스크
  hubPostId?: string;       // 업무 총괄 연결 (work_hub post_id)
  rolledFromDate?: string;  // 이월된 경우 원래 날짜 (YYYY-MM-DD)
  rolledFromId?: string;    // 이월 원본 task id (중복 이월 방지)
}

export type EisenhowerQuadrant = 'q1' | 'q2' | 'q3' | 'q4';

export const EISENHOWER_CONFIG: Record<EisenhowerQuadrant, { label: string; desc: string; action: string; color: string; bg: string; border: string }> = {
  q1: { label: 'A', desc: '중요 + 긴급',      action: '즉시 실행',  color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
  q2: { label: 'B', desc: '중요 + 긴급하지않음', action: '계획/예약',  color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
  q3: { label: 'C', desc: '긴급 + 중요하지않음', action: '위임',      color: '#f59e0b', bg: '#fffbeb', border: '#fde68a' },
  q4: { label: 'D', desc: '긴급하지도 중요하지도', action: '제거/보류', color: '#6b7280', bg: '#f9fafb', border: '#e5e7eb' },
};

export function getQuadrant(task: Task): EisenhowerQuadrant {
  if (task.important && task.urgent) return 'q1';
  if (task.important && !task.urgent) return 'q2';
  if (!task.important && task.urgent) return 'q3';
  return 'q4';
}

export function setQuadrant(task: Task, q: EisenhowerQuadrant): Partial<Task> {
  const priorityMap: Record<EisenhowerQuadrant, FranklinPriority> = { q1: 'A', q2: 'B', q3: 'C', q4: 'D' };
  switch (q) {
    case 'q1': return { important: true, urgent: true, priority: priorityMap[q] };
    case 'q2': return { important: true, urgent: false, priority: priorityMap[q] };
    case 'q3': return { important: false, urgent: true, priority: priorityMap[q] };
    case 'q4': return { important: false, urgent: false, priority: priorityMap[q] };
  }
}

/** Franklin priority → Eisenhower flags 동기화 */
export function syncPriorityToEisenhower(priority: FranklinPriority): { urgent: boolean; important: boolean } {
  switch (priority) {
    case 'A': return { important: true, urgent: true };
    case 'B': return { important: true, urgent: false };
    case 'C': return { important: false, urgent: true };
    case 'D': return { important: false, urgent: false };
  }
}

export const FRANKLIN_STATUS_CONFIG: Record<FranklinStatus, { icon: string; label: string; color: string; bg: string }> = {
  pending:   { icon: '○', label: '대기',   color: '#9ca3af', bg: '#f3f4f6' },
  progress:  { icon: '◐', label: '진행중', color: '#3b82f6', bg: '#eff6ff' },
  done:      { icon: '●', label: '완료',   color: '#16a34a', bg: '#f0fdf4' },
  forwarded: { icon: '→', label: '이월',   color: '#f59e0b', bg: '#fffbeb' },
  cancelled: { icon: '✕', label: '취소',   color: '#ef4444', bg: '#fef2f2' },
};

export const FRANKLIN_PRIORITY_CONFIG: Record<FranklinPriority, { label: string; desc: string; color: string; bg: string; quadrant: EisenhowerQuadrant }> = {
  A: { label: 'A', desc: '즉시 실행',   color: '#dc2626', bg: '#fef2f2', quadrant: 'q1' },
  B: { label: 'B', desc: '계획/예약',   color: '#2563eb', bg: '#eff6ff', quadrant: 'q2' },
  C: { label: 'C', desc: '위임',       color: '#f59e0b', bg: '#fffbeb', quadrant: 'q3' },
  D: { label: 'D', desc: '보류/제거',   color: '#6b7280', bg: '#f9fafb', quadrant: 'q4' },
};

export function createEmptyTasks(): Task[] {
  return [];
}

/** Franklin → TimeSlots 정방향 동기화: 연결된 과업의 텍스트/노트를 타임슬롯에 반영 */
export function syncFranklinToSlots(
  tasks: Task[],
  slots: TimeSlotEntry[],
  prevTasks?: Task[],
): TimeSlotEntry[] {
  const taskBySlotId = new Map<string, Task>();
  const collectLinked = (t: Task) => {
    if (t.timeSlotId) taskBySlotId.set(t.timeSlotId, t);
    t.children?.forEach(collectLinked);
  };
  tasks.forEach(collectLinked);

  // 이전에 연결되었다가 해제된 슬롯 파악 (top-level + children 모두)
  const unlinkedSlotIds = new Set<string>();
  if (prevTasks) {
    const collectUnlinked = (t: Task) => {
      if (t.timeSlotId && !taskBySlotId.has(t.timeSlotId)) {
        unlinkedSlotIds.add(t.timeSlotId);
      }
      t.children?.forEach(collectUnlinked);
    };
    prevTasks.forEach(collectUnlinked);
  }

  return slots.map(slot => {
    const task = taskBySlotId.get(slot.id);
    if (task) {
      return { ...slot, title: task.task, content: task.note || '' };
    }
    if (unlinkedSlotIds.has(slot.id)) {
      return { ...slot, title: '', content: '' };
    }
    return slot;
  });
}

/** TimeSlots → Franklin 역방향 동기화: 타임슬롯 편집 시 연결된 과업 업데이트 (서브태스크 포함) */
export function syncSlotToFranklin(
  tasks: Task[],
  slotId: string,
  field: string,
  value: string,
): Task[] {
  const patch: Partial<Task> | null =
    field === 'title' ? { task: value } :
    field === 'content' ? { note: value } :
    null;
  if (!patch) return tasks;

  // top-level 우선 검색
  const topIdx = tasks.findIndex(t => t.timeSlotId === slotId);
  if (topIdx >= 0) {
    return tasks.map((t, i) => i === topIdx ? { ...t, ...patch } : t);
  }

  // 서브태스크 검색
  for (let i = 0; i < tasks.length; i++) {
    const cIdx = tasks[i].children?.findIndex(c => c.timeSlotId === slotId) ?? -1;
    if (cIdx >= 0) {
      return tasks.map((t, ti) => ti === i
        ? { ...t, children: t.children!.map((c, ci) => ci === cIdx ? { ...c, ...patch } : c) }
        : t);
    }
  }
  return tasks;
}

export function getNextNumber(tasks: Task[], priority: FranklinPriority): number {
  const nums = tasks.filter(t => t.priority === priority).map(t => t.number);
  return nums.length > 0 ? Math.max(...nums) + 1 : 1;
}

/** 시간 문자열 → 분 변환 ("14:37" → 877) */
export function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

/** 분 → 시간 문자열 (877 → "14:37") */
export function minutesToTime(m: number): string {
  const h = Math.floor(m / 60);
  const min = m % 60;
  return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
}

/** 타임라인 바 위치 계산 (0~100%) */
export function getTimelinePosition(time: string, dayStart = 9, dayEnd = 18): number {
  const mins = timeToMinutes(time);
  const startMins = dayStart * 60;
  const endMins = dayEnd * 60;
  return Math.max(0, Math.min(100, ((mins - startMins) / (endMins - startMins)) * 100));
}

export function cycleStatus(current: FranklinStatus): FranklinStatus {
  const order: FranklinStatus[] = ['pending', 'progress', 'done', 'forwarded', 'cancelled'];
  return order[(order.indexOf(current) + 1) % order.length];
}

// ── 공용 달성도 상수 ──
export const ACH_COLORS = ['#e2e8f0','#f59e0b','#f59e0b','#f59e0b','#10B981','#10B981'];
export const ACH_LABELS = ['','1(양)','2(양)','3(양)','4(질)','5(질)'];

/** 서브태스크 가져오기 (children 배열 기반) */
export function getSubTasks(task: Task): Task[] {
  return task.children || [];
}

/** 태스크 달성도 계산 — 자식 있으면 평균, 없으면 자기 값 */
export function calcTaskAchievement(task: Task): number {
  const subs = getSubTasks(task);
  if (subs.length === 0) return task.achievement || 0;
  const filled = subs.filter(s => (s.achievement || 0) > 0);
  if (filled.length === 0) return task.achievement || 0;
  return Math.round(filled.reduce((s, t) => s + (t.achievement || 0), 0) / filled.length * 10) / 10;
}

/** 서브태스크 추가 */
export function addSubTask(tasks: Task[], parentId: string, subText: string): Task[] {
  return tasks.map(t => {
    if (t.id !== parentId) return t;
    const children = [...(t.children || [])];
    const subNum = children.length + 1;
    children.push({
      id: `${parentId}-sub-${Date.now()}`,
      priority: t.priority,
      number: subNum,
      task: subText,
      status: 'pending',
      achievement: 0,
      parentId: parentId,
    });
    return { ...t, children };
  });
}

/** 서브태스크 업데이트 */
export function updateSubTask(tasks: Task[], parentId: string, subId: string, updates: Partial<Task>): Task[] {
  return tasks.map(t => {
    if (t.id !== parentId) return t;
    const children = (t.children || []).map(c => c.id === subId ? { ...c, ...updates } : c);
    return { ...t, children };
  });
}

/** 서브태스크 삭제 */
export function removeSubTask(tasks: Task[], parentId: string, subId: string): Task[] {
  return tasks.map(t => {
    if (t.id !== parentId) return t;
    const children = (t.children || []).filter(c => c.id !== subId);
    return { ...t, children };
  });
}

export interface DailyLog {
  date: string; // YYYY-MM-DD
  summary: string;
  detail: string;
  position: Position;
  homepageCategories: string[];
  departmentCategories: string[];
  timeInterval: '30min' | '1hour' | 'half-day';
  timeSlots: TimeSlotEntry[];
  employeeId: string;
  viewMode?: ViewMode;
  tasks?: Task[];
  todayTasks?: string;
  tomorrowTasks?: string;
  mandalartByPeriod?: Record<MandalartPeriod, MandalartCell[]>; // legacy 1 — 초기 단일 타입 구조
  mandalartByTypeAndPeriod?: Record<string, Record<MandalartPeriod, MandalartCell[]>>; // legacy 2 — 타입별, 크기별 미분리
  // 현재: 크기별 독립 저장 — key = `${typeId}|${period}|${size}`
  mandalartTypes?: MandalartTypeConfig[];
  mandalartCellsByKey?: Record<string, MandalartCell[]>;
  mandalartActiveType?: string;
  mandalartActiveSize?: MandalartSize;
}

export interface Employee {
  id: string;
  name: string;
  department: string;
  position: Position;
}

// Classification Data — flat lists, no depth
export const homepageCategories = [
  '교육', '번역', '통독 문서', '시험', '전시회', '전문가 매칭', '그 외'
];

export const departmentCategories = [
  '기획', '홈피', '영업', '마케팅', '회계', '개발', '인사', '관리', '상담', '총무', '강사 팀', '커리교재팀', '문제은행', '그 외'
];

export const workTypes = [
  '문서/개발', '기획/업무 기획', '마케팅', '상담관리', '회계/총무', '전문가 관리', '강사커리', '기타'
];

export const aiToolsList = [
  'ChatGPT', 'Claude', 'Gemini', 'Copilot', 'Cursor', 'Midjourney', 'DALL-E', '기타'
];

export const employees: Employee[] = [
  { id: 'emp-ceo', name: '대표님', department: '경영', position: '대표' },
  { id: 'emp-suyeon', name: '수연', department: '관리', position: '팀장' },
  { id: 'emp-gayeon', name: '가연', department: '관리', position: '팀장' },
  { id: 'emp-jiye', name: '지예', department: '디자인', position: '알바' },
  { id: 'emp-minhyuk', name: '민혁', department: '개발', position: '알바' },
];

// localStorage 기반 현재 직원 선택
export function getCurrentEmployee(): Employee {
  try {
    const stored = localStorage.getItem('current-employee-id');
    if (stored) {
      const found = employees.find(e => e.id === stored);
      if (found) return found;
    }
  } catch {}
  return employees[0];
}

export function setCurrentEmployee(id: string) {
  localStorage.setItem('current-employee-id', id);
}

export function addEmployee(emp: Employee) {
  employees.push(emp);
  try { localStorage.setItem('custom-employees', JSON.stringify(employees.filter(e => e.id.startsWith('emp-custom')))); } catch {}
}

export function removeEmployee(id: string) {
  const idx = employees.findIndex(e => e.id === id);
  if (idx >= 0) employees.splice(idx, 1);
  try { localStorage.setItem('custom-employees', JSON.stringify(employees.filter(e => e.id.startsWith('emp-custom')))); } catch {}
}

// 커스텀 직원 로드
try {
  const custom = localStorage.getItem('custom-employees');
  if (custom) {
    const parsed = JSON.parse(custom);
    parsed.forEach((e: Employee) => { if (!employees.find(x => x.id === e.id)) employees.push(e); });
  }
} catch {}

export const currentEmployee = getCurrentEmployee();

function generateTimeSlots(interval: '30min' | '1hour' | 'half-day'): string[] {
  if (interval === 'half-day') return ['오전 (09:00~12:00)', '오후 (13:00~18:00)'];
  const slots: string[] = [];
  const step = interval === '30min' ? 30 : 60;
  for (let h = 9; h < 18; h++) {
    for (let m = 0; m < 60; m += step) {
      const start = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      const endM = m + step;
      const endH = endM >= 60 ? h + 1 : h;
      const endMin = endM >= 60 ? endM - 60 : endM;
      if (endH > 18 || (endH === 18 && endMin > 0)) break;
      const end = `${String(endH).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`;
      slots.push(`${start} ~ ${end}`);
    }
  }
  return slots;
}

export function createEmptyTimeSlots(interval: '30min' | '1hour' | 'half-day'): TimeSlotEntry[] {
  const slots = generateTimeSlots(interval);
  return slots.map((slot, i) => ({
    id: `ts-${Date.now()}-${i}`,
    timeSlot: slot,
    title: '',
    content: '',
    planned: '',
  }));
}

// Mock Data Generator
export function generateMockData(): DailyLog[] {
  const logs: DailyLog[] = [];
  const dates = ['2026-03-01', '2026-03-02', '2026-03-03', '2026-02-28', '2026-02-27'];

  const mockEntries: Record<string, { title: string; content: string; planned: string; workTypes: string[]; aiTools: string[]; }[]> = {
    emp1: [
      { title: '프로젝트 기획서 작성', content: 'AI 교육 플랫폼 기획서 초안 작성', planned: '기획서 검토 미팅', workTypes: ['기획/업무 기획'], aiTools: ['ChatGPT', 'Claude'] },
      { title: 'UI/UX 와이어프레임', content: '교육 대시보드 화면 설계', planned: '디자인팀 리뷰', workTypes: ['문서/개발'], aiTools: ['Midjourney', 'ChatGPT'] },
      { title: '시장 조사 분석', content: '경쟁사 AI 교육 서비스 분석', planned: '보고서 제출', workTypes: ['기획/업무 기획', '마케팅'], aiTools: ['Gemini', 'ChatGPT'] },
    ],
    emp2: [
      { title: '마케팅 캠페인 기획', content: 'SNS 광고 소재 제작', planned: '광고 집행 시작', workTypes: ['마케팅'], aiTools: ['DALL-E', 'ChatGPT'] },
      { title: '블로그 콘텐츠 작성', content: 'AI 활용 사례 블로그 포스팅', planned: '편집 및 퍼블리싱', workTypes: ['마케팅'], aiTools: ['Claude', 'Gemini'] },
    ],
    emp3: [
      { title: '홈페이지 리뉴얼', content: '메인 페이지 퍼블리싱 작업', planned: 'QA 테스트', workTypes: ['문서/개발'], aiTools: ['Copilot', 'Cursor'] },
      { title: 'API 연동 개발', content: '번역 서비스 API 연동', planned: '통합 테스트', workTypes: ['문서/개발'], aiTools: ['Cursor', 'ChatGPT'] },
    ],
    emp4: [
      { title: '신규 고객 미팅', content: 'A사 번역 서비스 제안', planned: '견적서 발송', workTypes: ['상담관리'], aiTools: ['ChatGPT'] },
      { title: '견적서 작성', content: '번역 프로젝트 견적서 작성', planned: '고객 피드백 대기', workTypes: ['문서/개발', '상담관리'], aiTools: ['Claude'] },
    ],
    emp5: [
      { title: '인사 관리 시스템 점검', content: '직원 출결 데이터 정리', planned: '월말 보고서', workTypes: ['회계/총무'], aiTools: ['ChatGPT', 'Gemini'] },
      { title: '시설 관리 점검', content: '사무실 환경 개선 계획', planned: '업체 미팅', workTypes: ['회계/총무'], aiTools: [] },
    ],
  };

  for (const emp of employees) {
    for (let di = 0; di < dates.length; di++) {
      const date = dates[di];
      const entries = mockEntries[emp.id] || [];
      const interval: '1hour' = '1hour';
      const timeSlots = generateTimeSlots(interval);
      const slotEntries: TimeSlotEntry[] = timeSlots.map((slot, i) => {
        const entry = entries[i % entries.length];
        const hasContent = i < entries.length + 1;
        return {
          id: `mock-${emp.id}-${date}-${i}`,
          timeSlot: slot,
          title: hasContent ? entry.title : '',
          content: hasContent ? entry.content : '',
          planned: hasContent ? entry.planned : '',
          aiDetail: hasContent ? {
            workTypes: entry.workTypes,
            aiTools: entry.aiTools,
            instructions: '1. 기존 자료 분석\n2. AI 도구로 초안 생성\n3. 검토 및 수정',
            instructionNote: '팀장님 지시사항 반영 완료',
            importantNotes: '프롬프트는 항상 회사 규정을 반영해야 합니다.',
            promptGrid1: [
              { id: '1', content: '데이터 분석 수행', note: '가장 먼저 진행' },
              { id: '2', content: '보고서 템플릿 적용', note: '신규 버전 사용' }
            ],
            promptGrid2: [
              { id: '1', content: '톤앤매너 검수', note: '격식 있는 표현' }
            ],
            beforeImage: null,
            afterImage: null,
            securityPrompt1: '민감 정보 제거 후 프롬프트 입력',
            securityPrompt2: '결과물 내 개인정보 검토 완료',
            regulations: '기본 회사 규정 준수',
            semiRegulations: '권고 사항 적용',
            optionalRegulations: '추가 선택 옵션',
            fieldRegulations: '특수 분야 규정 반영',
          } : undefined,
        };
      });

      const hpOptions = ['교육', '번역', '통독 문서', '시험'];
      const deptOptions = ['기획', '홈피', '영업', '개발'];

      logs.push({
        date,
        summary: `${emp.name} - ${date} 업무 요약: ${entries[0]?.title || '일반 업무'}`,
        detail: `${emp.name} - ${date} 업무 세부 내용: ${entries[0]?.content || '일반 업무'}`,
        position: emp.position,
        homepageCategories: [hpOptions[di % hpOptions.length]],
        departmentCategories: [emp.department, deptOptions[di % deptOptions.length]],
        timeInterval: interval,
        timeSlots: slotEntries,
        employeeId: emp.id,
      });
    }
  }

  return logs;
}

// ── 자동 이월 (Rollover) ──
/**
 * 이전 날 로그의 forwarded(→) 상태 태스크를 오늘 tasks로 이월.
 * - 중복 방지: rolledFromId로 이미 이월된 태스크는 skip
 * - 원본 태스크는 건드리지 않음 — 복제본을 생성해 status='pending'으로 추가
 * - children(서브태스크)은 현재 flat 이월만 (최상위만 이월)
 * @returns 이월된 태스크를 포함한 새로운 tasks 배열 (변경 없으면 원본 반환)
 */
export function rolloverPendingTasks(
  currentTasks: Task[],
  prevDayTasks: Task[] | undefined,
  prevDateStr: string,
): Task[] {
  if (!prevDayTasks || prevDayTasks.length === 0) return currentTasks;
  const alreadyRolledIds = new Set(currentTasks.map(t => t.rolledFromId).filter(Boolean));
  const toRoll = prevDayTasks.filter(t =>
    t.status === 'forwarded' &&
    t.task?.trim() &&
    !alreadyRolledIds.has(t.id)
  );
  if (toRoll.length === 0) return currentTasks;
  const nextTasks = [...currentTasks];
  for (const src of toRoll) {
    const newId = `ft-rol-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    nextTasks.push({
      id: newId,
      priority: src.priority,
      number: getNextNumber(nextTasks, src.priority),
      task: src.task,
      status: 'pending',
      note: src.note,
      important: src.important,
      urgent: src.urgent,
      achievement: 0,
      period: src.period || 'daily',
      rolledFromDate: prevDateStr,
      rolledFromId: src.id,
    });
  }
  return nextTasks;
}

/** YYYY-MM-DD 문자열에서 하루 전 날짜 문자열 반환 */
export function prevDateStr(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() - 1);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
}

// LocalStorage helpers
const STORAGE_KEY = 'work-log-data';
const DATA_VERSION = 'v4-detail-field';

export function loadLogs(): DailyLog[] {
  try {
    const version = localStorage.getItem(STORAGE_KEY + '-version');
    if (version === DATA_VERSION) {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].position) {
          return parsed;
        }
      }
    }
  } catch { /* ignore */ }
  const mock = generateMockData();
  saveLogs(mock);
  return mock;
}

export function saveLogs(logs: DailyLog[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
  localStorage.setItem(STORAGE_KEY + '-version', DATA_VERSION);
}

// ── API helpers ──

export async function fetchLogsFromAPI(): Promise<DailyLog[] | null> {
  try {
    const res = await fetch('/api/worklogs');
    if (!res.ok) return null;
    const data = await res.json(); // { key: logData, key: logData, ... }
    const logs: DailyLog[] = (Object.values(data) as DailyLog[]).filter(
      log => log.employeeId && log.date
    );
    if (logs.length === 0) return null;
    return logs;
  } catch {
    return null;
  }
}

export async function saveLogToAPI(log: DailyLog): Promise<boolean> {
  try {
    const key = `${log.employeeId}_${log.date}`;
    const res = await fetch(`/api/worklogs/${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: log }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
