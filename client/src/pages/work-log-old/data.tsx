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
  { id: 'emp1', name: '김민수', department: '기획', position: '팀장' },
  { id: 'emp2', name: '이지은', department: '마케팅', position: '신입' },
  { id: 'emp3', name: '박서준', department: '홈피', position: '개발' },
  { id: 'emp4', name: '최유나', department: '영업', position: '강사' },
  { id: 'emp5', name: '정현우', department: '관리', position: '임원' },
];

export const currentEmployee = employees[0];

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
    const logs: DailyLog[] = Object.values(data);
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
