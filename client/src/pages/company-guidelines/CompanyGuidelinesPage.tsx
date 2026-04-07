import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import {
  Plus, Trash2, Pencil, X, Search, ChevronDown, ChevronUp,
  List, Target, Grid2x2, LayoutGrid,
} from 'lucide-react';
import { FranklinView } from '../work-log/FranklinView';
import { EisenhowerView } from '../work-log/EisenhowerView';
import { MandalartView } from '../work-log/MandalartView';
import type { FranklinTask, TimeSlotEntry, MandalartCell as WLMandalartCell } from '../work-log/data';
import { createEmptyTimeSlots } from '../work-log/data';

/* ══════════════════════════════════════════════════════════════
   Types  (업무자료 분류 + 업무일지 Franklin/Eisenhower/Mandalart)
   ══════════════════════════════════════════════════════════════ */

type RuleType = '규정' | '준규정' | '선택규정';
type ViewMode = 'classic' | 'franklin' | 'eisenhower' | 'mandalart';
type FranklinPriority = 'A' | 'B' | 'C' | 'D';
type FranklinStatus = 'pending' | 'progress' | 'done' | 'forwarded' | 'cancelled';
type EisenhowerQuadrant = 'q1' | 'q2' | 'q3' | 'q4';
type MandalartPeriod = 'daily' | 'weekly' | 'monthly';

interface GuidelineItem {
  id: string;
  tab: GuidelineTab;    // 프롬프트 / 업무지침 / 사내규정
  // 업무지침 필터
  workCat1: string;     // 분류별
  workCat2: string;     // 교육별
  workCat3: string;     // 급수별
  workCat4: string;     // 세부급수
  workDb: string;       // DB별
  // 사내규정 필터
  compWork: string;     // 업무별
  compDept: string;     // 부서별
  compPos: string;      // 직급별
  compContract: string; // 계약
  // 공통
  author: string;
  title: string;
  content: string;
  ruleType: RuleType;
  // Franklin / Eisenhower
  priority: FranklinPriority;
  number: number;
  status: FranklinStatus;
  urgent: boolean;
  important: boolean;
  note: string;
  created_at: string;
}

interface MandalartCell {
  id: string;
  text: string;
  children?: MandalartCell[];
  taskId?: string;
  achievement?: number;
}

interface GuidelineRow {
  id: number;
  guideline_id: string;
  data: {
    items: GuidelineItem[];
    mandalartCells: MandalartCell[];
  };
  updated_at: string;
}

/* ── Config ── */
const RULE_COLORS: Record<RuleType, { bg: string; color: string; border: string }> = {
  '규정': { bg: '#EFF6FF', color: '#2563EB', border: '#BFDBFE' },
  '준규정': { bg: '#FEF3C7', color: '#D97706', border: '#FDE68A' },
  '선택규정': { bg: '#ECFDF5', color: '#059669', border: '#A7F3D0' },
};

const FRANKLIN_STATUS_CONFIG: Record<FranklinStatus, { icon: string; label: string; color: string; bg: string }> = {
  pending:   { icon: '○', label: '대기',   color: '#9ca3af', bg: '#f3f4f6' },
  progress:  { icon: '◐', label: '진행중', color: '#3b82f6', bg: '#eff6ff' },
  done:      { icon: '●', label: '완료',   color: '#16a34a', bg: '#f0fdf4' },
  forwarded: { icon: '→', label: '이월',   color: '#f59e0b', bg: '#fffbeb' },
  cancelled: { icon: '✕', label: '취소',   color: '#ef4444', bg: '#fef2f2' },
};

const FRANKLIN_PRIORITY_CONFIG: Record<FranklinPriority, { label: string; desc: string; color: string; bg: string }> = {
  A: { label: 'A', desc: '즉시 실행',   color: '#dc2626', bg: '#fef2f2' },
  B: { label: 'B', desc: '계획/예약',   color: '#2563eb', bg: '#eff6ff' },
  C: { label: 'C', desc: '위임',       color: '#f59e0b', bg: '#fffbeb' },
  D: { label: 'D', desc: '보류/제거',   color: '#6b7280', bg: '#f9fafb' },
};

const EISENHOWER_CONFIG: Record<EisenhowerQuadrant, { label: string; desc: string; action: string; color: string; bg: string; border: string }> = {
  q1: { label: 'A', desc: '중요 + 긴급',      action: '즉시 실행',  color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
  q2: { label: 'B', desc: '중요 + 긴급하지않음', action: '계획/예약',  color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
  q3: { label: 'C', desc: '긴급 + 중요하지않음', action: '위임',      color: '#f59e0b', bg: '#fffbeb', border: '#fde68a' },
  q4: { label: 'D', desc: '긴급하지도 중요하지도', action: '제거/보류', color: '#6b7280', bg: '#f9fafb', border: '#e5e7eb' },
};

/* ── Helpers ── */
function syncPriorityToEisenhower(p: FranklinPriority) {
  switch (p) {
    case 'A': return { important: true, urgent: true };
    case 'B': return { important: true, urgent: false };
    case 'C': return { important: false, urgent: true };
    case 'D': return { important: false, urgent: false };
  }
}

function getQuadrant(t: GuidelineItem): EisenhowerQuadrant {
  if (t.important && t.urgent) return 'q1';
  if (t.important && !t.urgent) return 'q2';
  if (!t.important && t.urgent) return 'q3';
  return 'q4';
}

function setQuadrant(q: EisenhowerQuadrant): { important: boolean; urgent: boolean; priority: FranklinPriority } {
  switch (q) {
    case 'q1': return { important: true, urgent: true, priority: 'A' };
    case 'q2': return { important: true, urgent: false, priority: 'B' };
    case 'q3': return { important: false, urgent: true, priority: 'C' };
    case 'q4': return { important: false, urgent: false, priority: 'D' };
  }
}

function cycleStatus(s: FranklinStatus): FranklinStatus {
  const o: FranklinStatus[] = ['pending', 'progress', 'done', 'forwarded', 'cancelled'];
  return o[(o.indexOf(s) + 1) % o.length];
}

function getNextNumber(items: GuidelineItem[], priority: FranklinPriority) {
  const nums = items.filter(t => t.priority === priority).map(t => t.number);
  return nums.length > 0 ? Math.max(...nums) + 1 : 1;
}

const ACH_COLORS = ['#e2e8f0','#f59e0b','#f59e0b','#f59e0b','#10B981','#10B981'];
const ACH_LABELS = ['','1(양)','2(양)','3(양)','4(질)','5(질)'];

function calcGridAchievement(grid: MandalartCell[]) {
  const surrounding = grid.filter((_, i) => i !== 4);
  const filled = surrounding.filter(c => c.text.trim());
  const total = filled.length;
  const yang = filled.filter(c => (c.achievement || 0) >= 1).length;
  const jil = filled.filter(c => (c.achievement || 0) >= 4).length;
  return { filled: filled.length, total, yang, jil };
}

function emptyCell(text = ''): MandalartCell {
  return { id: `mc-${Date.now()}-${Math.random().toString(36).slice(2,6)}`, text, children: [], achievement: 0 };
}

function createInitialRoot(): MandalartCell[] {
  return Array.from({ length: 9 }, (_, i) => emptyCell(i === 4 ? '업무 목표' : ''));
}

/* ── 탭별 분류 체계 ── */
type GuidelineTab = '프롬프트' | '업무지침' | '사내규정';

// 업무지침 탭 필터
const WORK_CAT1 = ['문서', '영상', '음성'];                                              // 분류별
const WORK_CAT2 = ['프롬프트', '번역', '윤리'];                                           // 교육별
const WORK_CAT3 = ['일반', '전문', '교육'];                                               // 급수별
const WORK_CAT4 = ['1급', '2급', '3급', '4급', '5급', '6급', '7급', '8급'];                // 세부급수
const WORK_DB   = ['커리큘럼', '문제은행', '교재', '마케팅'];                                // DB별

// 사내규정 탭 필터
const COMPANY_WORK = ['문서', '영상', '음성', '교육', '마케팅', '상담', '기획', '기타'];      // 업무별
const COMPANY_DEPT = ['경영', '개발', '마케팅', '인사', '영업', '강사팀', '기획', '홈페이지', '상담', '총무', '관리']; // 부서별
const COMPANY_POS  = ['대표', '임원', '팀장', '강사', '신입', '알바', '외부'];                // 직급별
const COMPANY_CONTRACT = ['정규직', '계약직', '파트타임', '외부', '기타'];                     // 계약

// 프롬프트 탭은 별도 필터 없이 규정유형만 사용 (필요 시 추가 가능)

const LS_KEY = 'cg-custom-filters';
function loadCustom(): Record<string, string[]> { try { return JSON.parse(localStorage.getItem(LS_KEY) || '{}'); } catch { return {}; } }
function saveCustom(c: Record<string, string[]>) { localStorage.setItem(LS_KEY, JSON.stringify(c)); }

const DATA_KEY = 'company-guidelines-data';

/* ══════════════════════════════════════════════════════════════
   DynFilter (업무자료에서 그대로)
   ══════════════════════════════════════════════════════════════ */
function DynFilter({ label, items, defaults, value, onChange, customKey, custom, updateCustom }: {
  label: string; items: string[]; defaults: string[];
  value: string[]; onChange: (v: string[]) => void;
  customKey: string; custom: Record<string, string[]>; updateCustom: (k: string, v: string[]) => void;
}) {
  const [adding, setAdding] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const allSelected = value.length === 0;
  const toggle = (item: string) => {
    if (value.includes(item)) { const next = value.filter(v => v !== item); onChange(next); }
    else onChange([...value, item]);
  };
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
      <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600, minWidth: 48 }}>{label}</span>
      <button onClick={() => onChange([])} style={{ padding: '4px 12px', borderRadius: 16, border: '1px solid', borderColor: allSelected ? '#3B82F6' : '#e2e8f0', background: allSelected ? '#EFF6FF' : '#fff', color: allSelected ? '#3B82F6' : '#64748b', fontSize: 13, cursor: 'pointer', fontWeight: allSelected ? 600 : 400 }}>전체</button>
      {items.map(item => {
        const sel = value.includes(item);
        return (
          <span key={item} style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
            <button onClick={() => toggle(item)} style={{ padding: '4px 12px', borderRadius: 16, border: '1px solid', borderColor: sel ? '#3B82F6' : '#e2e8f0', background: sel ? '#EFF6FF' : '#fff', color: sel ? '#3B82F6' : '#64748b', fontSize: 13, cursor: 'pointer', fontWeight: sel ? 600 : 400 }}>{item}</button>
            {!defaults.includes(item) && <button onClick={() => { updateCustom(customKey, (custom[customKey] || []).filter(x => x !== item)); if (sel) onChange(value.filter(v => v !== item)); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: 11, padding: 0, lineHeight: 1 }}>✕</button>}
          </span>
        );
      })}
      {adding ? (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <input ref={inputRef} autoFocus placeholder="새 항목" onKeyDown={e => { if (e.key === 'Enter') { const v = inputRef.current?.value.trim(); if (v && !items.includes(v)) updateCustom(customKey, [...(custom[customKey] || []), v]); setAdding(false); } if (e.key === 'Escape') setAdding(false); }} style={{ width: 80, padding: '3px 8px', fontSize: 12, border: '1px solid #3B82F6', borderRadius: 12, outline: 'none' }} />
          <button onClick={() => setAdding(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: 11 }}>취소</button>
        </span>
      ) : (
        <button onClick={() => setAdding(true)} style={{ padding: '3px 10px', borderRadius: 16, border: '1px dashed #cbd5e1', background: '#fff', color: '#94a3b8', fontSize: 12, cursor: 'pointer' }}>+ 추가</button>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   GuidelineForm (생성/수정 모달)
   ══════════════════════════════════════════════════════════════ */
function GuidelineForm({ item, activeTab, onSave, onClose }: {
  item: GuidelineItem | null;
  activeTab: GuidelineTab;
  onSave: (item: GuidelineItem) => void;
  onClose: () => void;
}) {
  const isEdit = !!item;
  const [form, setForm] = useState<GuidelineItem>(item || {
    id: `gi-${Date.now()}`,
    tab: activeTab,
    workCat1: '', workCat2: '', workCat3: '', workCat4: '', workDb: '',
    compWork: '', compDept: '', compPos: '', compContract: '',
    author: '',
    title: '',
    content: '',
    ruleType: '규정',
    priority: 'B',
    number: 1,
    status: 'pending',
    urgent: false,
    important: true,
    note: '',
    created_at: new Date().toISOString(),
  });

  const set = (k: keyof GuidelineItem, v: any) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = () => {
    if (!form.title || !form.author) { toast.error('제목, 작성자는 필수입니다'); return; }
    onSave(form);
    onClose();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <div style={{ background: '#fff', borderRadius: 16, width: 640, maxHeight: '90vh', overflow: 'auto', padding: 24 }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{isEdit ? '지침 수정' : '새 지침 추가'} — {form.tab}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* 탭 선택 */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 4, display: 'block' }}>분류 탭</label>
            <div style={{ display: 'flex', gap: 4 }}>
              {(['프롬프트', '업무지침', '사내규정'] as GuidelineTab[]).map(t => (
                <button key={t} onClick={() => set('tab', t)}
                  style={{ padding: '6px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: `1px solid ${form.tab === t ? '#1e293b' : '#e2e8f0'}`, background: form.tab === t ? '#1e293b' : '#f8fafc', color: form.tab === t ? '#fff' : '#64748b' }}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          {/* 규정 유형 */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 4, display: 'block' }}>규정 유형 *</label>
            <div style={{ display: 'flex', gap: 6 }}>
              {(['규정', '준규정', '선택규정'] as RuleType[]).map(rt => {
                const c = RULE_COLORS[rt];
                return (
                  <button key={rt} onClick={() => set('ruleType', rt)}
                    style={{ padding: '6px 16px', borderRadius: 20, border: `1px solid ${form.ruleType === rt ? c.color : c.border}`, background: form.ruleType === rt ? c.color : c.bg, color: form.ruleType === rt ? '#fff' : c.color, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                    {rt}
                  </button>
                );
              })}
            </div>
          </div>
          {/* 탭별 분류 필드 */}
          {form.tab === '업무지침' && (<>
            <FormChips label="분류별" items={WORK_CAT1} value={form.workCat1} onChange={v => set('workCat1', v)} />
            <FormChips label="교육별" items={WORK_CAT2} value={form.workCat2} onChange={v => set('workCat2', v)} />
            <FormChips label="급수별" items={WORK_CAT3} value={form.workCat3} onChange={v => set('workCat3', v)} />
            <FormChips label="세부급수" items={WORK_CAT4} value={form.workCat4} onChange={v => set('workCat4', v)} />
            <FormChips label="DB별" items={WORK_DB} value={form.workDb} onChange={v => set('workDb', v)} />
          </>)}
          {form.tab === '사내규정' && (<>
            <FormChips label="업무별" items={COMPANY_WORK} value={form.compWork} onChange={v => set('compWork', v)} />
            <FormChips label="부서별" items={COMPANY_DEPT} value={form.compDept} onChange={v => set('compDept', v)} />
            <FormChips label="직급별" items={COMPANY_POS} value={form.compPos} onChange={v => set('compPos', v)} />
            <FormChips label="계약" items={COMPANY_CONTRACT} value={form.compContract} onChange={v => set('compContract', v)} />
          </>)}
          {/* 우선순위 */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 4, display: 'block' }}>우선순위</label>
            <div style={{ display: 'flex', gap: 4 }}>
              {(['A', 'B', 'C', 'D'] as FranklinPriority[]).map(p => {
                const cfg = FRANKLIN_PRIORITY_CONFIG[p];
                return (
                  <button key={p} onClick={() => { set('priority', p); set('number', 1); const eis = syncPriorityToEisenhower(p); set('important', eis.important); set('urgent', eis.urgent); }}
                    style={{ width: 32, height: 32, borderRadius: 8, fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer', background: form.priority === p ? cfg.color : cfg.bg, color: form.priority === p ? '#fff' : cfg.color }}>
                    {p}
                  </button>
                );
              })}
            </div>
          </div>
          {/* 텍스트 필드 */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 4, display: 'block' }}>작성자 *</label>
            <input value={form.author} onChange={e => set('author', e.target.value)} style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 4, display: 'block' }}>제목 *</label>
            <input value={form.title} onChange={e => set('title', e.target.value)} style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 4, display: 'block' }}>내용</label>
            <textarea value={form.content} onChange={e => set('content', e.target.value)} rows={5} style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 4, display: 'block' }}>비고</label>
            <input value={form.note} onChange={e => set('note', e.target.value)} style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
          <button onClick={onClose} style={{ padding: '8px 20px', border: '1px solid #e2e8f0', borderRadius: 8, background: '#f8fafc', cursor: 'pointer', fontSize: 14, color: '#64748b' }}>취소</button>
          <button onClick={handleSubmit} style={{ padding: '8px 20px', border: 'none', borderRadius: 8, background: '#3B82F6', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>{isEdit ? '수정' : '추가'}</button>
        </div>
      </div>
    </div>
  );
}

function FormChips({ label, items, value, onChange }: { label: string; items: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 4, display: 'block' }}>{label}</label>
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {items.map(item => (
          <button key={item} onClick={() => onChange(value === item ? '' : item)}
            style={{ padding: '4px 12px', borderRadius: 16, border: '1px solid', borderColor: value === item ? '#3B82F6' : '#e2e8f0', background: value === item ? '#EFF6FF' : '#fff', color: value === item ? '#3B82F6' : '#64748b', fontSize: 12, cursor: 'pointer', fontWeight: value === item ? 600 : 400 }}>
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   Classic View (업무자료 테이블 스타일 — 동적 분류 열)
   ══════════════════════════════════════════════════════════════ */

// 탭별 분류 열 정의: { key: GuidelineItem 필드명, label: 표시 이름 }
interface CatColumn { key: keyof GuidelineItem; label: string }

const WORK_COLUMNS: CatColumn[] = [
  { key: 'workCat1', label: '분류별' },
  { key: 'workCat2', label: '교육별' },
  { key: 'workCat3', label: '급수별' },
  { key: 'workCat4', label: '세부급수' },
  { key: 'workDb', label: 'DB별' },
];
const COMPANY_COLUMNS: CatColumn[] = [
  { key: 'compWork', label: '업무별' },
  { key: 'compDept', label: '부서별' },
  { key: 'compPos', label: '직급별' },
  { key: 'compContract', label: '계약' },
];

function getActiveColumns(tab: GuidelineTab, activeFilters: Record<string, string[]>): CatColumn[] {
  const defs = tab === '업무지침' ? WORK_COLUMNS : tab === '사내규정' ? COMPANY_COLUMNS : [];
  // 선택된 필터가 있는 열만 표시 (아무것도 선택 안 하면 전체 열 표시)
  const active = defs.filter(c => {
    const filterKey = c.key as string;
    return (activeFilters[filterKey]?.length ?? 0) > 0;
  });
  return active.length > 0 ? active : defs;
}

function ClassicView({ items, onUpdate, onDelete, onEdit, activeTab, activeFilters, expandAll }: {
  items: GuidelineItem[];
  onUpdate: (id: string, updates: Partial<GuidelineItem>) => void;
  onDelete: (id: string) => void;
  onEdit: (item: GuidelineItem) => void;
  activeTab: GuidelineTab;
  activeFilters: Record<string, string[]>;
  expandAll: boolean;
}) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  useEffect(() => {
    if (expandAll) setExpandedIds(new Set(items.map(i => i.id)));
    else setExpandedIds(new Set());
  }, [expandAll, items]);
  const [editingContentId, setEditingContentId] = useState<string | null>(null);
  const [editingContentValue, setEditingContentValue] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteValue, setEditingNoteValue] = useState('');

  const fmtDate = (iso: string) => { const d = new Date(iso); return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`; };

  const catCols = getActiveColumns(activeTab, activeFilters);
  const catColTemplate = catCols.map(() => '64px').join(' ');
  const gridTemplate = `64px ${catColTemplate} 180px 1fr 80px 60px 64px 48px`;

  return (
    <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ display: 'grid', gridTemplateColumns: gridTemplate, padding: '10px 12px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontSize: 11, fontWeight: 600, color: '#64748b', gap: 4 }}>
        <div>유형</div>
        {catCols.map(c => <div key={c.key as string}>{c.label}</div>)}
        <div>제목</div><div>내용</div><div>비고</div><div>작성자</div><div>날짜</div><div></div>
      </div>
      {items.length === 0 ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>등록된 지침이 없습니다</div>
      ) : items.map(item => {
        const isOpen = expandedIds.has(item.id);
        const rc = RULE_COLORS[item.ruleType];
        return (
          <div key={item.id}>
            <div onClick={() => setExpandedIds(prev => { const n = new Set(prev); if (n.has(item.id)) n.delete(item.id); else n.add(item.id); return n; })}
              style={{ display: 'grid', gridTemplateColumns: gridTemplate, padding: '8px 12px', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', alignItems: 'center', background: isOpen ? '#F8FAFC' : '#fff', transition: 'background 0.15s', gap: 4 }}
              onMouseEnter={e => { if (!isOpen) e.currentTarget.style.background = '#fafbfd'; }} onMouseLeave={e => { if (!isOpen) e.currentTarget.style.background = '#fff'; }}>
              <div><span style={{ padding: '2px 8px', borderRadius: 12, fontSize: 10, fontWeight: 600, background: rc.bg, color: rc.color, border: `1px solid ${rc.border}` }}>{item.ruleType}</span></div>
              {catCols.map(c => {
                const val = (item as any)[c.key] as string;
                return <div key={c.key as string}><span style={{ padding: '1px 6px', borderRadius: 10, fontSize: 10, background: val ? '#EFF6FF' : 'transparent', color: val ? '#3B82F6' : '#cbd5e1' }}>{val || '—'}</span></div>;
              })}
              <div style={{ fontSize: 13, fontWeight: 500, color: '#1e293b', overflow: 'hidden', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</span>
                {isOpen ? <ChevronUp size={13} color="#94a3b8" style={{ flexShrink: 0 }} /> : <ChevronDown size={13} color="#94a3b8" style={{ flexShrink: 0 }} />}
              </div>
              {/* 내용 인라인 편집 */}
              <div onClick={e => { e.stopPropagation(); setEditingContentId(item.id); setEditingContentValue(item.content); }}
                style={{ fontSize: 12, color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', cursor: 'text', padding: '2px 4px' }}>
                {item.content.split('\n')[0] || <span style={{ color: '#cbd5e1', fontStyle: 'italic' }}>내용 없음</span>}
              </div>
              {/* 비고 인라인 편집 */}
              <div onClick={e => { e.stopPropagation(); setEditingNoteId(item.id); setEditingNoteValue(item.note); }}
                style={{ fontSize: 11, color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', cursor: 'text', padding: '2px 4px' }}>
                {editingNoteId === item.id ? (
                  <input value={editingNoteValue} onChange={e => setEditingNoteValue(e.target.value)}
                    onBlur={() => { onUpdate(item.id, { note: editingNoteValue }); setEditingNoteId(null); }}
                    onKeyDown={e => { if (e.key === 'Enter') { onUpdate(item.id, { note: editingNoteValue }); setEditingNoteId(null); } if (e.key === 'Escape') setEditingNoteId(null); }}
                    autoFocus style={{ width: '100%', fontSize: 11, border: '1px solid #3B82F6', outline: 'none', borderRadius: 4, padding: '2px 4px', background: '#fff', boxSizing: 'border-box' }} />
                ) : (item.note || '—')}
              </div>
              <div style={{ fontSize: 12, color: '#64748b' }}>{item.author}</div>
              <div style={{ fontSize: 10, color: '#94a3b8' }}>{fmtDate(item.created_at)}</div>
              <div style={{ display: 'flex', gap: 2 }} onClick={e => e.stopPropagation()}>
                <button onClick={() => onEdit(item)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 3 }}><Pencil size={13} color="#94a3b8" /></button>
                <button onClick={() => { if (confirm('삭제하시겠습니까?')) onDelete(item.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 3 }}><Trash2 size={13} color="#ef4444" /></button>
              </div>
            </div>
            {/* 인라인 내용 편집 */}
            {editingContentId === item.id && (
              <div style={{ padding: '12px 24px 16px', background: '#FFFBEB', borderBottom: '1px solid #FDE68A' }} onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#92400E' }}>내용 수정</span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => setEditingContentId(null)} style={{ padding: '4px 12px', fontSize: 12, background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 6, cursor: 'pointer', color: '#64748b' }}>취소</button>
                    <button onClick={() => { onUpdate(item.id, { content: editingContentValue }); setEditingContentId(null); }} style={{ padding: '4px 12px', fontSize: 12, background: '#3B82F6', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>저장</button>
                  </div>
                </div>
                <textarea value={editingContentValue} onChange={e => setEditingContentValue(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Escape') setEditingContentId(null); if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { onUpdate(item.id, { content: editingContentValue }); setEditingContentId(null); } }}
                  autoFocus rows={Math.max(5, editingContentValue.split('\n').length + 1)}
                  style={{ width: '100%', fontSize: 14, border: '1px solid #FDE68A', outline: 'none', resize: 'vertical', lineHeight: 1.7, fontFamily: 'inherit', padding: '10px 12px', background: '#fff', borderRadius: 8, boxSizing: 'border-box' }} />
              </div>
            )}
            {/* 펼침 상세 */}
            {isOpen && editingContentId !== item.id && (
              <div style={{ padding: '12px 24px', background: '#FAFBFC', borderBottom: '1px solid #e2e8f0', fontSize: 13 }}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                  <span style={{ ...chipStyle(rc.bg, rc.color, rc.border) }}>{item.ruleType}</span>
                  <span style={{ ...chipStyle(FRANKLIN_PRIORITY_CONFIG[item.priority].bg, FRANKLIN_PRIORITY_CONFIG[item.priority].color, '#e2e8f0') }}>우선순위: {item.priority}</span>
                  <span style={{ ...chipStyle(FRANKLIN_STATUS_CONFIG[item.status].bg, FRANKLIN_STATUS_CONFIG[item.status].color, '#e2e8f0') }}>{FRANKLIN_STATUS_CONFIG[item.status].icon} {FRANKLIN_STATUS_CONFIG[item.status].label}</span>
                </div>
                {item.content && <div style={{ whiteSpace: 'pre-wrap', color: '#475569', lineHeight: 1.7, marginBottom: 8 }}>{item.content}</div>}
                {item.note && <div style={{ padding: '6px 10px', background: '#FEF9C3', borderRadius: 6, fontSize: 12, color: '#854D0E' }}>비고: {item.note}</div>}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function chipStyle(bg: string, color: string, border: string) {
  return { padding: '2px 10px', borderRadius: 12, fontSize: 11, fontWeight: 600, background: bg, color, border: `1px solid ${border}`, display: 'inline-block' } as const;
}

/* ══════════════════════════════════════════════════════════════
   Adapter: GuidelineItem[] ↔ FranklinTask[] (업무일지 뷰 재사용)
   ══════════════════════════════════════════════════════════════ */
function itemsToTasks(items: GuidelineItem[]): FranklinTask[] {
  return items.map(i => ({
    id: i.id, priority: i.priority, number: i.number, task: i.title,
    status: i.status, note: i.content, urgent: i.urgent, important: i.important,
    achievement: 0,
  }));
}

function tasksToItemUpdates(tasks: FranklinTask[], items: GuidelineItem[]): GuidelineItem[] {
  const taskMap = new Map(tasks.map(t => [t.id, t]));
  const updated = items.map(i => {
    const t = taskMap.get(i.id);
    if (!t) return i;
    return { ...i, priority: t.priority, number: t.number, title: t.task, status: t.status, urgent: t.urgent ?? i.urgent, important: t.important ?? i.important };
  });
  // 새로 추가된 태스크
  for (const t of tasks) {
    if (!items.find(i => i.id === t.id)) {
      updated.push({
        id: t.id, tab: '사내규정' as GuidelineTab,
        workCat1: '', workCat2: '', workCat3: '', workCat4: '', workDb: '',
        compWork: '', compDept: '', compPos: '', compContract: '',
        author: '', title: t.task, content: t.note || '', ruleType: '규정',
        priority: t.priority, number: t.number, status: t.status,
        urgent: t.urgent ?? false, important: t.important ?? true,
        note: '', created_at: new Date().toISOString(),
      });
    }
  }
  return updated;
}

/* 복사된 뷰 제거됨 — work-log 컴포넌트 직접 import */

/* ══════════════════════════════════════════════════════════════
   Main Page
   ══════════════════════════════════════════════════════════════ */
export default function CompanyGuidelinesPage() {
  const [items, setItems] = useState<GuidelineItem[]>([]);
  const [mandalartCells, setMandalartCells] = useState<MandalartCell[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('classic');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<GuidelineItem | null>(null);
  const [expandAll, setExpandAll] = useState(false);

  // Tab
  const [activeTab, setActiveTab] = useState<GuidelineTab>('사내규정');

  // Filters
  const [filterRuleType, setFilterRuleType] = useState<RuleType | '전체'>('전체');
  const [filterAuthor, setFilterAuthor] = useState('전체');
  const [searchText, setSearchText] = useState('');
  // 업무지침 필터 (다중선택: 빈 배열 = 전체)
  const [fWorkCat1, setFWorkCat1] = useState<string[]>([]);
  const [fWorkCat2, setFWorkCat2] = useState<string[]>([]);
  const [fWorkCat3, setFWorkCat3] = useState<string[]>([]);
  const [fWorkCat4, setFWorkCat4] = useState<string[]>([]);
  const [fWorkDb, setFWorkDb] = useState<string[]>([]);
  // 사내규정 필터 (다중선택)
  const [fCompWork, setFCompWork] = useState<string[]>([]);
  const [fCompDept, setFCompDept] = useState<string[]>([]);
  const [fCompPos, setFCompPos] = useState<string[]>([]);
  const [fCompContract, setFCompContract] = useState<string[]>([]);

  const [custom, setCustom] = useState<Record<string, string[]>>(loadCustom);
  const updateCustom = (key: string, vals: string[]) => { const next = { ...custom, [key]: vals }; setCustom(next); saveCustom(next); };

  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 기존 규정관리 초기 데이터를 새 포맷으로 생성
  const generateInitialData = (): GuidelineItem[] => {
    const migrated: GuidelineItem[] = [];
    let counter = 0;
    const ruleTypeMap: Record<string, RuleType> = { '규정': '규정', '준규정': '준규정', '선택사항': '선택규정' };
    const makeGuideline = (text: string, ruleType: RuleType, tab: GuidelineTab, opts: {
      dept?: string; pos?: string; author?: string; note?: string;
      wc1?: string; wc2?: string; wc3?: string; wc4?: string; wdb?: string;
    } = {}) => {
      counter++;
      const priority: FranklinPriority = ruleType === '규정' ? 'A' : ruleType === '준규정' ? 'B' : 'C';
      migrated.push({
        id: `init-${counter}`, tab,
        workCat1: opts.wc1 || '', workCat2: opts.wc2 || '', workCat3: opts.wc3 || '', workCat4: opts.wc4 || '', workDb: opts.wdb || '',
        compWork: '', compDept: opts.dept || '', compPos: opts.pos || '', compContract: '',
        author: opts.author || '', title: text.length > 60 ? text.slice(0, 60) + '...' : text, content: text,
        ruleType, priority, number: counter, status: 'pending',
        urgent: ruleType === '규정', important: ruleType !== '선택규정',
        note: opts.note || '', created_at: new Date().toISOString(),
      });
    };
    const addSet = (rules: Record<string, string[]>, tab: GuidelineTab, opts: { dept?: string; pos?: string; author?: string; note?: string; wc1?: string; wc2?: string; wc3?: string; wdb?: string } = {}) => {
      for (const [oldType, texts] of Object.entries(rules)) {
        const rt = ruleTypeMap[oldType] || '규정';
        for (const text of texts) makeGuideline(text, rt, tab, opts);
      }
    };

    // ═══════════════════════════════════
    // 프롬프트 탭 초기 데이터
    // ═══════════════════════════════════
    addSet({
      '규정': [
        '프롬프트 작성 시 회사 고정 규정(간격/색상/형식/이모지/톤)을 반드시 포함해야 한다',
        '민감 정보(개인정보, 기밀자료)를 프롬프트에 입력하지 않는다',
        'AI 생성 결과물은 반드시 사람이 검수 후 사용한다',
        'AI 도구 사용 시 보안 프롬프트(1차/2차)를 적용해야 한다',
        '프롬프트에 저작권 침해 소지가 있는 콘텐츠를 포함하지 않는다',
      ],
      '준규정': [
        '1차 프롬프트는 구조 설계 중심, 2차 프롬프트는 UX 개선 중심으로 작성한다',
        '프롬프트 결과물 내 개인정보 포함 여부를 검토한다',
        '프롬프트 템플릿은 사내 표준 양식을 참고하여 작성한다',
        '업무 지시사항과 중요사항을 프롬프트에 명시한다',
      ],
      '선택사항': [
        '프롬프트 작성 후 동료 검토를 권장한다',
        'AI 도구별 최적화된 프롬프트 패턴을 공유한다',
        '프롬프트 결과물의 before/after 비교를 기록한다',
      ],
    }, '프롬프트', { author: '회사', note: '프롬프트 사용 규정' });

    // ═══════════════════════════════════
    // 업무지침 탭 초기 데이터 (규정편집 기반)
    // ═══════════════════════════════════
    // 영상 분류
    addSet({
      '규정': [
        '영상 번역의 정확성과 자연스러움을 확보해야 한다',
        '비속어, 차별적 표현, 저작권 침해 콘텐츠 사용을 금지한다',
        '문화적 민감성을 고려하고 원작 의도를 존중한다',
        '오역률 1% 미만, 자연스러운 표현, 맥락 일관성을 유지한다',
        '자막 형식(SRT/VTT/ASS)과 인코딩(UTF-8) 기준을 준수한다',
      ],
      '준규정': [
        '클라이언트 가이드라인을 우선 적용하고 용어집을 준수한다',
        '자막 최대 2줄, 줄당 42자 이내로 작성한다',
        '최소 표시 시간 0.8초, 최대 표시 시간 7초를 준수한다',
        '프레임레이트와 해상도 기준에 맞게 작업한다',
      ],
      '선택사항': [
        '타임코드 자동조정 기능을 활용할 수 있다',
        '화자 구분 레이블을 사용할 수 있다',
        '효과음 자막을 포함할 수 있다',
      ],
    }, '업무지침', { author: '업무', note: '영상 업무 지침', wc1: '영상' });

    // 텍스트 분류
    addSet({
      '규정': [
        '텍스트 번역/교정 작업의 정확성과 전문성을 확보해야 한다',
        '비공식 약어 사용 금지, 출처 미기재 인용을 금지한다',
        '저작권을 준수하고 기밀 정보를 보호하며 표절을 금지한다',
        '오류율 0.5% 미만, 일관된 용어 사용, 가독성을 확보한다',
        '문서 형식(PDF/DOCX/HWP) 및 페이지 레이아웃 기준을 준수한다',
      ],
      '준규정': [
        '산업별 전문 용어집을 참조하고 클라이언트 스타일 가이드를 준수한다',
        '번역 일치율 95% 이상을 유지한다',
        '이미지 내 텍스트 번역 기준을 따른다',
        '각주/미주 처리 시 원문 유지 + 번역 추가를 기본으로 한다',
      ],
      '선택사항': [
        '용어 하이라이트 기능을 활용할 수 있다',
        '변경 추적 기능을 활성화할 수 있다',
        '주석 달기를 활용할 수 있다',
      ],
    }, '업무지침', { author: '업무', note: '텍스트 업무 지침', wc1: '문서' });

    // 음성 분류
    addSet({
      '규정': [
        '음성 번역/처리의 품질 및 정확성을 확보해야 한다',
        '품질 저해 행위 일체를 금지한다',
        '전문가 윤리 기준을 준수한다',
        '업계 표준 품질 기준을 충족해야 한다',
        '음성 파일 형식(WAV/MP3/FLAC)과 샘플레이트 기준을 준수한다',
      ],
      '준규정': [
        '샘플레이트 44100Hz 이상, 비트뎁스 16bit 이상을 기본으로 한다',
        '노이즈 게이트, 컴프레서, EQ 설정 기준을 따른다',
        '화자 분리 정확도 95% 이상을 유지한다',
      ],
      '선택사항': [
        '실시간 자막 생성을 활용할 수 있다',
        '감정 분석 태깅을 적용할 수 있다',
        '배경음 분리 기능을 사용할 수 있다',
      ],
    }, '업무지침', { author: '업무', note: '음성 업무 지침', wc1: '음성' });

    // ═══════════════════════════════════
    // 사내규정 탭 초기 데이터
    // ═══════════════════════════════════
    // 회사 전체 지침
    addSet({
      '규정': ['모든 임직원은 출퇴근 시 근태관리 시스템에 기록해야 한다', '업무 관련 자료의 외부 반출 시 사전 승인을 받아야 한다', '고객 개인정보는 개인정보보호법에 따라 처리한다', '사내 보안 서약서를 연 1회 이상 갱신해야 한다', '업무용 PC에 허가되지 않은 소프트웨어 설치를 금지한다', '월간 업무보고서는 매월 마지막 영업일까지 제출한다'],
      '준규정': ['재택근무 시 업무 시작/종료 시 메신저로 보고한다', '부서 간 협업 시 공유 문서를 사용하여 진행 상황을 기록한다', '외부 미팅 시 회의록을 작성하여 48시간 내 공유한다', '사내 메신저는 업무 시간 중 항시 접속 상태를 유지한다', '분기별 자기 역량 평가서를 작성하여 팀장에게 제출한다'],
      '선택사항': ['업무 효율화를 위한 자동화 도구 사용을 권장한다', '사내 동호회 활동 참여를 장려한다', '개인 업무 일지 작성을 권장한다', '사내 지식 공유 세미나에 자발적으로 참여할 수 있다'],
    }, '사내규정', { author: '회사', note: '회사 전체 지침' });

    // 부서별 지침
    const depts: Record<string, Record<string, string[]>> = {
      '기획': { '규정': ['연간 사업계획서는 전년도 12월 15일까지 완성한다', '신규 프로젝트 착수 시 기획안 승인을 받아야 한다', 'KPI 산정 기준표를 분기 초에 확정한다'], '준규정': ['분기별 성과 보고서를 경영진에게 제출한다', '프로젝트 일정 관리는 사내 PM 도구를 활용한다'], '선택사항': ['시장 동향 보고서를 월간 발행할 수 있다'] },
      '홈페이지': { '규정': ['웹사이트 콘텐츠 업로드 시 검수 절차를 거쳐야 한다', '디자인 시스템 가이드라인을 준수해야 한다'], '준규정': ['이미지 사용 시 저작권 확인 절차를 따른다', '웹 접근성 점검을 분기별 1회 실시한다'], '선택사항': ['A/B 테스트를 통한 UX 개선을 시도할 수 있다'] },
      '영업': { '규정': ['고객사 계약 체결 시 법무 검토를 받아야 한다', '할인 정책 적용은 승인 권한자의 결재를 받아야 한다'], '준규정': ['영업 실적 보고서를 주간 단위로 제출한다', '고객 상담 내역을 CRM 시스템에 기록한다'], '선택사항': ['제휴 파트너 발굴 활동을 자율적으로 진행할 수 있다'] },
      '마케팅': { '규정': ['광고 집행 시 마케팅 팀장의 사전 승인을 받아야 한다', '브랜드 가이드라인(CI/BI)을 반드시 준수해야 한다'], '준규정': ['SNS 콘텐츠는 사내 톤앤매너 가이드를 따른다'], '선택사항': ['경품 지급 이벤트를 기획할 수 있다'] },
      '개발': { '규정': ['모든 코드는 코드 리뷰를 거친 후 머지해야 한다', '코딩 컨벤션 가이드를 준수해야 한다', '프로덕션 배포 시 배포 승인 절차를 따라야 한다'], '준규정': ['API 설계 시 사내 표준 스펙을 따른다', '백업 및 복구 정책에 따라 주간 백업을 실시한다'], '선택사항': ['사내 기술 블로그에 기고할 수 있다'] },
      '인사': { '규정': ['채용 프로세스는 규정된 절차에 따라 진행해야 한다', '인사평가는 연 2회 정기적으로 실시해야 한다'], '준규정': ['면접 평가는 표준 평가 기준표를 활용한다'], '선택사항': ['직원 교육 프로그램을 자율적으로 이수할 수 있다'] },
      '관리': { '규정': ['시스템 접근 권한은 직급/역할에 따라 부여해야 한다', '데이터 보관 기한 규정을 준수해야 한다'], '준규정': ['IT 자산 관리 대장을 분기별 갱신한다'], '선택사항': ['업무 효율화 제안을 자유롭게 제출할 수 있다'] },
      '상담': { '규정': ['상담 접수 시 배정 절차를 따라야 한다', '상담 기록은 표준 양식에 따라 작성해야 한다'], '준규정': ['진로 상담 매뉴얼에 따라 상담을 진행한다'], '선택사항': ['상담 만족도 조사를 분기별 실시할 수 있다'] },
      '총무': { '규정': ['안전 점검 체크리스트를 월 1회 이상 실시해야 한다'], '준규정': ['시설물 관리 지침에 따라 정기 점검을 실시한다', '업체 선정 시 3곳 이상 비교 견적을 받는다'], '선택사항': ['사무용품 구매를 자율적으로 신청할 수 있다'] },
      '강사팀': { '규정': ['강사 채용 및 계약은 표준 계약서를 사용해야 한다', '강사 평가는 학기별 1회 이상 실시해야 한다'], '준규정': ['수업 편성 가이드라인을 참고하여 시간표를 구성한다'], '선택사항': ['학생 피드백 설문을 자율적으로 실시할 수 있다'] },
    };
    for (const [dept, rules] of Object.entries(depts)) {
      addSet(rules, '사내규정', { dept, author: dept, note: `${dept} 부서 지침` });
    }

    // 직급별 지침
    const ranks: Record<string, Record<string, string[]>> = {
      '신입': { '규정': ['입사 후 2주 이내 OJT 교육을 이수해야 한다', '수습 기간 동안 월간 업무 보고서를 제출해야 한다'], '준규정': ['사내 시스템 사용법 교육에 참여한다'], '선택사항': ['사내 동호회에 가입할 수 있다'] },
      '팀장': { '규정': ['팀 운영 계획을 수립하고 이행해야 한다', '팀원 근태 관리 및 승인을 처리해야 한다', '팀 성과 목표를 설정하고 관리해야 한다'], '준규정': ['팀 내 업무 프로세스 개선을 주도한다'], '선택사항': ['타 팀과의 합동 프로젝트를 기획할 수 있다'] },
      '임원': { '규정': ['회사 경영 전략 의사결정에 참여해야 한다', '연간 경영 실적 보고를 수행해야 한다'], '준규정': ['산업 동향 분석 및 전략 제안을 수행한다'], '선택사항': ['사내 비전/미션 공유 특강을 진행할 수 있다'] },
      '대표': { '규정': ['회사 경영 총괄 및 최종 의사결정을 수행해야 한다'], '준규정': ['대외 협력 및 네트워킹 활동에 참여한다'], '선택사항': [] },
    };
    for (const [rank, rules] of Object.entries(ranks)) {
      addSet(rules, '사내규정', { pos: rank, author: rank, note: `${rank} 직급 지침` });
    }

    return migrated;
  };

  // Load data
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/company-guidelines');
        const raw = await res.json();
        if (Array.isArray(raw) && raw.length > 0) {
          const row = raw[0];
          const d = typeof row.data === 'string' ? JSON.parse(row.data) : row.data;
          setItems(d.items || []);
          setMandalartCells(d.mandalartCells || []);
        } else {
          // 새 테이블이 비어있으면 → 초기 데이터 생성
          const initial = generateInitialData();
          setItems(initial);
          const payload = { items: initial, mandalartCells: [] };
          localStorage.setItem(DATA_KEY, JSON.stringify(payload));
          await fetch('/api/company-guidelines', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ guideline_id: 'main', data: payload }) });
          toast.success(`기존 규정관리 데이터 ${initial.length}건이 초기 등록되었습니다`);
        }
      } catch {
        try {
          const ls = localStorage.getItem(DATA_KEY);
          if (ls) { const d = JSON.parse(ls); setItems(d.items || []); setMandalartCells(d.mandalartCells || []); }
        } catch {}
      }
      setLoading(false);
    })();
  }, []);

  // Auto-save
  const doSave = useCallback(async (newItems: GuidelineItem[], newCells: MandalartCell[]) => {
    const payload = { items: newItems, mandalartCells: newCells };
    localStorage.setItem(DATA_KEY, JSON.stringify(payload));
    try {
      const res = await fetch('/api/company-guidelines');
      const raw = await res.json();
      if (Array.isArray(raw) && raw.length > 0) {
        await fetch(`/api/company-guidelines/${raw[0].guideline_id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ data: payload }) });
      } else {
        await fetch('/api/company-guidelines', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ guideline_id: 'main', data: payload }) });
      }
    } catch {}
  }, []);

  const scheduleAutoSave = useCallback((newItems: GuidelineItem[], newCells: MandalartCell[]) => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => doSave(newItems, newCells), 500);
  }, [doSave]);

  const updateItems = useCallback((updater: (prev: GuidelineItem[]) => GuidelineItem[]) => {
    setItems(prev => {
      const next = updater(prev);
      scheduleAutoSave(next, mandalartCells);
      return next;
    });
  }, [scheduleAutoSave, mandalartCells]);

  const updateCells = useCallback((newCells: MandalartCell[]) => {
    setMandalartCells(newCells);
    scheduleAutoSave(items, newCells);
  }, [scheduleAutoSave, items]);

  // CRUD
  const handleAddOrEdit = (item: GuidelineItem) => {
    updateItems(prev => {
      const idx = prev.findIndex(i => i.id === item.id);
      if (idx >= 0) { const next = [...prev]; next[idx] = item; return next; }
      return [...prev, { ...item, number: getNextNumber(prev, item.priority) }];
    });
    toast.success(editingItem ? '수정되었습니다' : '추가되었습니다');
  };

  const handleUpdate = (id: string, updates: Partial<GuidelineItem>) => {
    updateItems(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
  };

  const handleDelete = (id: string) => {
    updateItems(prev => prev.filter(i => i.id !== id));
    toast.success('삭제되었습니다');
  };

  const handleItemAdd = (title: string) => {
    const item: GuidelineItem = {
      id: `gi-${Date.now()}`, tab: activeTab,
      workCat1: '', workCat2: '', workCat3: '', workCat4: '', workDb: '',
      compWork: '', compDept: '', compPos: '', compContract: '',
      author: '', title, content: '', ruleType: '규정', priority: 'B', number: getNextNumber(items, 'B'),
      status: 'pending', urgent: false, important: true, note: '', created_at: new Date().toISOString(),
    };
    updateItems(prev => [...prev, item]);
  };

  // Filtering
  const allAuthors = [...new Set(items.map(i => i.author).filter(Boolean))];
  const filtered = items.filter(i => {
    // 탭 필터 (항상 적용)
    if (i.tab !== activeTab) return false;
    if (filterRuleType !== '전체' && i.ruleType !== filterRuleType) return false;
    if (filterAuthor !== '전체' && i.author !== filterAuthor) return false;
    // 업무지침 탭 필터 (다중선택: 빈 배열=전체)
    if (activeTab === '업무지침') {
      if (fWorkCat1.length > 0 && !fWorkCat1.includes(i.workCat1)) return false;
      if (fWorkCat2.length > 0 && !fWorkCat2.includes(i.workCat2)) return false;
      if (fWorkCat3.length > 0 && !fWorkCat3.includes(i.workCat3)) return false;
      if (fWorkCat4.length > 0 && !fWorkCat4.includes(i.workCat4)) return false;
      if (fWorkDb.length > 0 && !fWorkDb.includes(i.workDb)) return false;
    }
    // 사내규정 탭 필터 (다중선택)
    if (activeTab === '사내규정') {
      if (fCompWork.length > 0 && !fCompWork.includes(i.compWork)) return false;
      if (fCompDept.length > 0 && !fCompDept.includes(i.compDept)) return false;
      if (fCompPos.length > 0 && !fCompPos.includes(i.compPos)) return false;
      if (fCompContract.length > 0 && !fCompContract.includes(i.compContract)) return false;
    }
    if (searchText) {
      const s = searchText.toLowerCase();
      if (!i.title.toLowerCase().includes(s) && !i.content.toLowerCase().includes(s) && !i.author.toLowerCase().includes(s) && !i.note.toLowerCase().includes(s)) return false;
    }
    return true;
  });

  const anyFilterActive = filterRuleType !== '전체' || filterAuthor !== '전체' || !!searchText ||
    (activeTab === '업무지침' && (fWorkCat1.length > 0 || fWorkCat2.length > 0 || fWorkCat3.length > 0 || fWorkCat4.length > 0 || fWorkDb.length > 0)) ||
    (activeTab === '사내규정' && (fCompWork.length > 0 || fCompDept.length > 0 || fCompPos.length > 0 || fCompContract.length > 0));
  const resetFilters = () => {
    setFilterRuleType('전체'); setFilterAuthor('전체'); setSearchText('');
    setFWorkCat1([]); setFWorkCat2([]); setFWorkCat3([]); setFWorkCat4([]); setFWorkDb([]);
    setFCompWork([]); setFCompDept([]); setFCompPos([]); setFCompContract([]);
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>로딩 중...</div>;

  return (
    <div style={{ maxWidth: 1800, margin: '0 auto', padding: '24px 32px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1e293b', margin: 0 }}>사내업무지침(통합-new)</h1>
          <span style={{ fontSize: 12, color: '#94a3b8' }}>자동저장</span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {anyFilterActive && (
            <button onClick={resetFilters} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '8px 14px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, fontSize: 13, cursor: 'pointer', color: '#EF4444' }}><X size={14} />필터 초기화</button>
          )}
          <button onClick={() => setExpandAll(p => !p)} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '8px 14px', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, cursor: 'pointer', color: '#475569' }}>
            {expandAll ? '전체 접기' : '전체 펼치기'}
          </button>
          <button onClick={() => { setEditingItem(null); setShowForm(true); }} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: '#3B82F6', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}><Plus size={16} />새 지침</button>
        </div>
      </div>

      {/* 탭 선택 */}
      <div style={{ display: 'flex', gap: 2, marginBottom: 12 }}>
        {(['프롬프트', '업무지침', '사내규정'] as GuidelineTab[]).map(tab => (
          <button key={tab} onClick={() => { setActiveTab(tab); resetFilters(); }}
            style={{ padding: '8px 20px', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', border: `1px solid ${activeTab === tab ? '#1e293b' : '#e2e8f0'}`, background: activeTab === tab ? '#1e293b' : '#fff', color: activeTab === tab ? '#fff' : '#64748b', transition: 'all 0.15s' }}>
            {tab}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
        <div style={{ position: 'relative', maxWidth: 360 }}>
          <Search size={16} style={{ position: 'absolute', left: 10, top: 10, color: '#94a3b8' }} />
          <input value={searchText} onChange={e => setSearchText(e.target.value)} placeholder="제목, 내용, 작성자, 비고 검색..." style={{ width: '100%', padding: '8px 12px 8px 32px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, outline: 'none', background: '#fff' }} />
        </div>
        {/* 규정 유형 필터 (공통) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600, minWidth: 48 }}>유형</span>
          <button onClick={() => setFilterRuleType('전체')} style={{ padding: '4px 12px', borderRadius: 16, border: '1px solid', borderColor: filterRuleType === '전체' ? '#3B82F6' : '#e2e8f0', background: filterRuleType === '전체' ? '#EFF6FF' : '#fff', color: filterRuleType === '전체' ? '#3B82F6' : '#64748b', fontSize: 13, cursor: 'pointer', fontWeight: filterRuleType === '전체' ? 600 : 400 }}>전체</button>
          {(['규정', '준규정', '선택규정'] as RuleType[]).map(rt => {
            const c = RULE_COLORS[rt];
            return (
              <button key={rt} onClick={() => setFilterRuleType(filterRuleType === rt ? '전체' : rt)}
                style={{ padding: '4px 12px', borderRadius: 16, border: `1px solid ${filterRuleType === rt ? c.color : c.border}`, background: filterRuleType === rt ? c.color : c.bg, color: filterRuleType === rt ? '#fff' : c.color, fontSize: 13, cursor: 'pointer', fontWeight: filterRuleType === rt ? 600 : 400 }}>
                {rt}
              </button>
            );
          })}
        </div>
        {/* 업무지침 탭 필터 */}
        {activeTab === '업무지침' && (<>
          <DynFilter label="분류별" items={[...WORK_CAT1, ...(custom['wc1'] || [])]} defaults={WORK_CAT1} value={fWorkCat1} onChange={setFWorkCat1} customKey="wc1" custom={custom} updateCustom={updateCustom} />
          <DynFilter label="교육별" items={[...WORK_CAT2, ...(custom['wc2'] || [])]} defaults={WORK_CAT2} value={fWorkCat2} onChange={setFWorkCat2} customKey="wc2" custom={custom} updateCustom={updateCustom} />
          <DynFilter label="급수별" items={[...WORK_CAT3, ...(custom['wc3'] || [])]} defaults={WORK_CAT3} value={fWorkCat3} onChange={setFWorkCat3} customKey="wc3" custom={custom} updateCustom={updateCustom} />
          <DynFilter label="세부급수" items={[...WORK_CAT4, ...(custom['wc4'] || [])]} defaults={WORK_CAT4} value={fWorkCat4} onChange={setFWorkCat4} customKey="wc4" custom={custom} updateCustom={updateCustom} />
          <DynFilter label="DB별" items={[...WORK_DB, ...(custom['wdb'] || [])]} defaults={WORK_DB} value={fWorkDb} onChange={setFWorkDb} customKey="wdb" custom={custom} updateCustom={updateCustom} />
        </>)}
        {/* 사내규정 탭 필터 */}
        {activeTab === '사내규정' && (<>
          <DynFilter label="업무별" items={[...COMPANY_WORK, ...(custom['cw'] || [])]} defaults={COMPANY_WORK} value={fCompWork} onChange={setFCompWork} customKey="cw" custom={custom} updateCustom={updateCustom} />
          <DynFilter label="부서별" items={[...COMPANY_DEPT, ...(custom['cd'] || [])]} defaults={COMPANY_DEPT} value={fCompDept} onChange={setFCompDept} customKey="cd" custom={custom} updateCustom={updateCustom} />
          <DynFilter label="직급별" items={[...COMPANY_POS, ...(custom['cp'] || [])]} defaults={COMPANY_POS} value={fCompPos} onChange={setFCompPos} customKey="cp" custom={custom} updateCustom={updateCustom} />
          <DynFilter label="계약" items={[...COMPANY_CONTRACT, ...(custom['cc'] || [])]} defaults={COMPANY_CONTRACT} value={fCompContract} onChange={setFCompContract} customKey="cc" custom={custom} updateCustom={updateCustom} />
        </>)}
        {/* 작성자 필터 (공통) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600, minWidth: 48 }}>작성자</span>
          <button onClick={() => setFilterAuthor('전체')} style={{ padding: '4px 12px', borderRadius: 16, border: '1px solid', borderColor: filterAuthor === '전체' ? '#3B82F6' : '#e2e8f0', background: filterAuthor === '전체' ? '#EFF6FF' : '#fff', color: filterAuthor === '전체' ? '#3B82F6' : '#64748b', fontSize: 13, cursor: 'pointer', fontWeight: filterAuthor === '전체' ? 600 : 400 }}>전체</button>
          {allAuthors.map(a => (
            <button key={a} onClick={() => setFilterAuthor(a)} style={{ padding: '4px 12px', borderRadius: 16, border: '1px solid', borderColor: filterAuthor === a ? '#3B82F6' : '#e2e8f0', background: filterAuthor === a ? '#EFF6FF' : '#fff', color: filterAuthor === a ? '#3B82F6' : '#64748b', fontSize: 13, cursor: 'pointer', fontWeight: filterAuthor === a ? 600 : 400 }}>{a}</button>
          ))}
        </div>
      </div>

      {/* View Mode Toggle (업무일지 패턴) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 2 }}>
          {([
            { mode: 'classic' as ViewMode, icon: List, label: 'Classic' },
            { mode: 'franklin' as ViewMode, icon: Target, label: 'Franklin' },
            { mode: 'eisenhower' as ViewMode, icon: Grid2x2, label: 'Eisenhower' },
            { mode: 'mandalart' as ViewMode, icon: LayoutGrid, label: 'Mandalart' },
          ]).map(({ mode, icon: Icon, label }) => (
            <button key={mode} onClick={() => setViewMode(mode)}
              style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: 'pointer', border: 'none', transition: 'all 0.15s', background: viewMode === mode ? '#1e293b' : '#f1f5f9', color: viewMode === mode ? '#fff' : '#64748b' }}>
              <Icon size={14} />{label}
            </button>
          ))}
        </div>
        <span style={{ fontSize: 11, color: '#94a3b8' }}>
          {filtered.length}건{anyFilterActive ? ` (전체 ${items.length}건)` : ''}
        </span>
      </div>

      {/* View Content */}
      {viewMode === 'classic' ? (
        <ClassicView items={filtered} onUpdate={handleUpdate} onDelete={handleDelete} onEdit={item => { setEditingItem(item); setShowForm(true); }}
          activeTab={activeTab}
          activeFilters={{
            workCat1: fWorkCat1, workCat2: fWorkCat2, workCat3: fWorkCat3, workCat4: fWorkCat4, workDb: fWorkDb,
            compWork: fCompWork, compDept: fCompDept, compPos: fCompPos, compContract: fCompContract,
          }}
          expandAll={expandAll}
        />
      ) : viewMode === 'franklin' ? (
        <FranklinView
          tasks={itemsToTasks(filtered)}
          timeSlots={createEmptyTimeSlots('1hour')}
          timeInterval="1hour"
          onTasksChange={(tasks) => { const updated = tasksToItemUpdates(tasks, filtered); updateItems(() => { const rest = items.filter(i => i.tab !== activeTab || !filtered.find(f => f.id === i.id)); return [...rest, ...updated]; }); }}
          onSlotTitleChange={() => {}}
        />
      ) : viewMode === 'eisenhower' ? (
        <EisenhowerView
          tasks={itemsToTasks(filtered)}
          timeSlots={createEmptyTimeSlots('1hour')}
          onTasksChange={(tasks) => { const updated = tasksToItemUpdates(tasks, filtered); updateItems(() => { const rest = items.filter(i => i.tab !== activeTab || !filtered.find(f => f.id === i.id)); return [...rest, ...updated]; }); }}
          onSlotTitleChange={() => {}}
        />
      ) : (
        <MandalartView
          cells={mandalartCells as WLMandalartCell[]}
          tasks={itemsToTasks(filtered)}
          onCellsChange={(cells) => updateCells(cells as MandalartCell[])}
          onTasksChange={(tasks) => { const updated = tasksToItemUpdates(tasks, filtered); updateItems(() => { const rest = items.filter(i => i.tab !== activeTab || !filtered.find(f => f.id === i.id)); return [...rest, ...updated]; }); }}
          onSlotTitleChange={() => {}}
        />
      )}

      {/* Form Modal */}
      {showForm && (
        <GuidelineForm
          item={editingItem}
          activeTab={activeTab}
          onSave={handleAddOrEdit}
          onClose={() => { setShowForm(false); setEditingItem(null); }}
        />
      )}
    </div>
  );
}
