// 거래처 아웃콜 이력 v2
// 공통 프레임 <PersonHub /> 시범 구현 (강사·상담·면접 확장 대상)
// 원본 데이터 32건을 그대로 노출, 규정 전부 준수

import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { PersonHub } from './PersonHub';
import type { HubConfig } from './types';

// 거래처 엔트리 — 원본 7필드 충실 + 호환 필드
interface ContactEntry {
  id: string;
  field: string;
  meetingDate: string;
  agency: string;
  name: string;
  phone: string;
  feature: string;
  email: string;
  status: string;
  callCount: number;
  lastCallDate: string;
  notes: string;
  history: string;
  // 호환 필드 (서버 기존 UI용)
  catLarge?: string;
  catMid?: string;
  catSmall?: string;
  // 비고 파일 첨부
  _notesFiles?: { name: string; url: string }[];
}

const FIELD_OPTIONS = [
  '기획', '개발', '컨설팅', '사업계획서',
  '인테리어 및 대표님 댁수리',
  '번역강사', '윤리강사', '프롬프트강사', '외국인강사',
  '개발알바',
];

const STATUS_OPTIONS = ['대기', '진행중', '보류', '완료', '거절'];

// 미팅일자 느슨 파서 — 원본은 보존, UI 레이어에서만 정규화 (#21 no_fake_data)
// 지원 포맷: "03월 14일", "3월 08일", "3/26", "5/", "9/5?", "" 등
function parseMtgDate(s: string | null | undefined): { m: number | null; d: number | null; raw: string } {
  const raw = (s ?? '').toString().trim();
  if (!raw) return { m: null, d: null, raw };
  const kr = raw.match(/(\d{1,2})\s*월\s*(\d{1,2})\s*일/);
  if (kr) return { m: +kr[1], d: +kr[2], raw };
  const krM = raw.match(/(\d{1,2})\s*월/);
  const slash = raw.match(/^\s*(\d{1,2})\s*\/\s*(\d{1,2})?/);
  if (slash) return { m: +slash[1], d: slash[2] ? +slash[2] : null, raw };
  if (krM) return { m: +krM[1], d: null, raw };
  return { m: null, d: null, raw };
}

function formatMtgDate(s: string | null | undefined): string {
  const { m, d, raw } = parseMtgDate(s);
  if (m == null) return raw ? `⚠ ${raw}` : '';
  const mm = String(m).padStart(2, '0');
  if (d == null) return `${mm}월`;
  const dd = String(d).padStart(2, '0');
  return `${mm}/${dd}`;
}

function sortMtgDate(s: string | null | undefined): number {
  const { m, d } = parseMtgDate(s);
  if (m == null) return 999999; // 빈값·파싱실패 = 맨 뒤
  return m * 100 + (d ?? 0);
}

const CONFIG: HubConfig<ContactEntry> = {
  title: '거래처 아웃콜 이력 v2',
  subtitle: '외부 인물·조직 통합 관리 공통 프레임 (강사·상담·면접 확장 시범)',
  emoji: '🏢',
  idField: 'id',
  timeField: 'meetingDate',
  noteField: 'notes',
  fieldKey: 'field',
  fieldOptions: FIELD_OPTIONS,
  statusKey: 'status',
  statusOptions: STATUS_OPTIONS,
  statsGroupBy: 'field',
  columns: [
    { key: 'meetingDate', label: '미팅일자', width: 'w-20', required: true, colSpan: 1,
      format: (v) => formatMtgDate(v),
      sortValue: (e) => sortMtgDate(e.meetingDate),
      tooltip: (e) => e.meetingDate ? `원본: ${e.meetingDate}` : '',
      placeholder: '예: 03월 14일 또는 3/26',
    },
    { key: 'field',       label: '분야',     width: 'w-28', required: true, type: 'chip', options: FIELD_OPTIONS, drilldown: true, colSpan: 1 },
    { key: 'agency',      label: '회사명',   width: 'w-32', drilldown: true, colSpan: 1 },
    { key: 'name',        label: '이름',     width: 'w-24', required: true, colSpan: 1 },
    { key: 'phone',       label: '번호',     width: 'w-28', colSpan: 1 },
    { key: 'status',      label: '상태',     width: 'w-20', type: 'chip', options: STATUS_OPTIONS, drilldown: true, colSpan: 1 },
    { key: 'email',       label: '이메일',   showInList: false, colSpan: 1 },
    { key: 'callCount',   label: '시도횟수', type: 'number', showInList: false, colSpan: 1 },
    { key: 'lastCallDate', label: '최종통화일', showInList: false, colSpan: 1 },
    { key: 'feature',     label: '특징',     type: 'multiline', showInList: false, colSpan: 2 },
    { key: 'history',     label: '미팅 이력', type: 'multiline', showInList: false, colSpan: 3 },
    { key: 'notes',       label: '비고',     type: 'multiline', required: true, colSpan: 3 },
  ],
  createEmpty: () => ({
    id: `oc_new_${Date.now()}`,
    field: '', meetingDate: '', agency: '', name: '', phone: '', feature: '',
    email: '', status: '대기',
    callCount: 0, lastCallDate: '', notes: '', history: '',
    catLarge: '', catMid: '', catSmall: '',
  }),
};

async function fetchEntries(): Promise<ContactEntry[]> {
  try {
    const res = await fetch('/api/outbound-calls');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const rows: any[] = await res.json();
    return rows
      .map(r => r.data)
      .filter(Boolean) as ContactEntry[];
  } catch (e) {
    console.warn('outbound-calls load failed', e);
    return [];
  }
}

async function saveEntry(entry: ContactEntry): Promise<void> {
  const body = {
    call_id: entry.id,
    data: { ...entry, catLarge: entry.field },
  };
  const res = await fetch('/api/outbound-calls', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`저장 실패 HTTP ${res.status}`);
}

async function deleteEntry(id: string): Promise<void> {
  const res = await fetch(`/api/outbound-calls/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error(`삭제 실패 HTTP ${res.status}`);
}

async function uploadFile(file: File): Promise<{ name: string; url: string }> {
  const fd = new FormData();
  fd.append('file', file);
  const res = await fetch('/api/uploads', { method: 'POST', body: fd });
  if (!res.ok) throw new Error(`업로드 실패 HTTP ${res.status}`);
  const json = await res.json();
  return { name: file.name, url: json.url || json.location || json.path || '' };
}

export function OutboundCallsV2Page() {
  const [entries, setEntries] = useState<ContactEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await fetchEntries();
    setEntries(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleSave = useCallback(
    async (entry: ContactEntry) => {
      try {
        await saveEntry(entry);
        setEntries(prev => {
          const idx = prev.findIndex(e => e.id === entry.id);
          if (idx === -1) return [...prev, entry];
          const next = [...prev];
          next[idx] = entry;
          return next;
        });
      } catch (e: any) {
        toast.error(e?.message || '저장 실패');
      }
    },
    []
  );

  const handleDelete = useCallback(async (id: string) => {
    try {
      await deleteEntry(id);
      setEntries(prev => prev.filter(e => e.id !== id));
    } catch (e: any) {
      toast.error(e?.message || '삭제 실패');
    }
  }, []);

  return (
    <div className="h-full w-full">
      <PersonHub
        config={CONFIG}
        entries={entries}
        onSave={handleSave}
        onDelete={handleDelete}
        onUpload={uploadFile}
        loading={loading}
      />
    </div>
  );
}

export default OutboundCallsV2Page;
