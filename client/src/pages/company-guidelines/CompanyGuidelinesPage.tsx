import { useState, useEffect, useRef, useCallback, DragEvent } from 'react';
import { toast } from 'sonner';
import {
  Plus, Trash2, Pencil, X, Search, Eye, ChevronDown, ChevronUp,
  List, Target, Grid2x2, LayoutGrid, AlertTriangle, ChevronRight,
  ArrowLeft, GripVertical, BarChart3, Paperclip,
} from 'lucide-react';

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
  value: string; onChange: (v: string) => void;
  customKey: string; custom: Record<string, string[]>; updateCustom: (k: string, v: string[]) => void;
}) {
  const [adding, setAdding] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
      <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600, minWidth: 48 }}>{label}</span>
      <button onClick={() => onChange('전체')} style={{ padding: '4px 12px', borderRadius: 16, border: '1px solid', borderColor: value === '전체' ? '#3B82F6' : '#e2e8f0', background: value === '전체' ? '#EFF6FF' : '#fff', color: value === '전체' ? '#3B82F6' : '#64748b', fontSize: 13, cursor: 'pointer', fontWeight: value === '전체' ? 600 : 400 }}>전체</button>
      {items.map(item => (
        <span key={item} style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
          <button onClick={() => onChange(item)} style={{ padding: '4px 12px', borderRadius: 16, border: '1px solid', borderColor: value === item ? '#3B82F6' : '#e2e8f0', background: value === item ? '#EFF6FF' : '#fff', color: value === item ? '#3B82F6' : '#64748b', fontSize: 13, cursor: 'pointer', fontWeight: value === item ? 600 : 400 }}>{item}</button>
          {!defaults.includes(item) && <button onClick={() => { updateCustom(customKey, (custom[customKey] || []).filter(x => x !== item)); if (value === item) onChange('전체'); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: 11, padding: 0, lineHeight: 1 }}>✕</button>}
        </span>
      ))}
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
   Classic View (업무자료 테이블 스타일)
   ══════════════════════════════════════════════════════════════ */
function ClassicView({ items, onUpdate, onDelete, onEdit }: {
  items: GuidelineItem[];
  onUpdate: (id: string, updates: Partial<GuidelineItem>) => void;
  onDelete: (id: string) => void;
  onEdit: (item: GuidelineItem) => void;
}) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [editingContentId, setEditingContentId] = useState<string | null>(null);
  const [editingContentValue, setEditingContentValue] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteValue, setEditingNoteValue] = useState('');

  const fmtDate = (iso: string) => { const d = new Date(iso); return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`; };

  return (
    <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ display: 'grid', gridTemplateColumns: '64px 64px 64px 64px 180px 1fr 80px 60px 64px 48px', padding: '10px 12px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontSize: 11, fontWeight: 600, color: '#64748b', gap: 4 }}>
        <div>유형</div><div>대분류</div><div>중분류</div><div>소분류</div><div>제목</div><div>내용</div><div>비고</div><div>작성자</div><div>날짜</div><div></div>
      </div>
      {items.length === 0 ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>등록된 지침이 없습니다</div>
      ) : items.map(item => {
        const isOpen = expandedIds.has(item.id);
        const rc = RULE_COLORS[item.ruleType];
        return (
          <div key={item.id}>
            <div onClick={() => setExpandedIds(prev => { const n = new Set(prev); if (n.has(item.id)) n.delete(item.id); else n.add(item.id); return n; })}
              style={{ display: 'grid', gridTemplateColumns: '64px 64px 64px 64px 180px 1fr 80px 60px 64px 48px', padding: '8px 12px', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', alignItems: 'center', background: isOpen ? '#F8FAFC' : '#fff', transition: 'background 0.15s', gap: 4 }}
              onMouseEnter={e => { if (!isOpen) e.currentTarget.style.background = '#fafbfd'; }} onMouseLeave={e => { if (!isOpen) e.currentTarget.style.background = '#fff'; }}>
              <div><span style={{ padding: '2px 8px', borderRadius: 12, fontSize: 10, fontWeight: 600, background: rc.bg, color: rc.color, border: `1px solid ${rc.border}` }}>{item.ruleType}</span></div>
              <div><span style={{ padding: '2px 6px', borderRadius: 12, fontSize: 10, background: '#EFF6FF', color: '#3B82F6' }}>{item.department}</span></div>
              <div style={{ fontSize: 11, color: '#64748b' }}>{item.category2 || '—'}</div>
              <div style={{ fontSize: 11, color: '#64748b' }}>{item.category3 || '—'}</div>
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
   Franklin View (업무일지에서 그대로 가져옴)
   ══════════════════════════════════════════════════════════════ */
function FranklinViewPanel({ items, onUpdate, onDelete }: {
  items: GuidelineItem[];
  onUpdate: (id: string, updates: Partial<GuidelineItem>) => void;
  onDelete: (id: string) => void;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<FranklinPriority | null>(null);
  const priorities: FranklinPriority[] = ['A', 'B', 'C', 'D'];

  const onDragStart = (e: DragEvent, id: string) => { setDragId(id); e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', id); };
  const onDragOver = (e: DragEvent, target: FranklinPriority) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setDropTarget(target); };
  const onDragLeave = () => setDropTarget(null);
  const onDropPriority = (e: DragEvent, priority: FranklinPriority) => {
    e.preventDefault(); setDropTarget(null);
    if (!dragId) return;
    const eis = syncPriorityToEisenhower(priority);
    onUpdate(dragId, { priority, number: getNextNumber(items, priority), ...eis });
    setDragId(null);
  };

  const sorted = [...items].sort((a, b) => {
    const po = { A: 0, B: 1, C: 2, D: 3 };
    if (po[a.priority] !== po[b.priority]) return po[a.priority] - po[b.priority];
    return a.number - b.number;
  });

  return (
    <div className="space-y-3">
      {/* Task list */}
      <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden' }}>
        <div style={{ background: 'rgba(0,0,0,0.03)', padding: '6px 12px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 11, fontWeight: 600 }}>업무 지침 목록 (Franklin)</span>
          <div style={{ display: 'flex', gap: 8, fontSize: 10 }}>
            {priorities.map(p => {
              const cnt = items.filter(t => t.priority === p).length;
              return cnt > 0 ? <span key={p} style={{ color: FRANKLIN_PRIORITY_CONFIG[p].color, fontWeight: 700 }}>{p}:{cnt}</span> : null;
            })}
            <span style={{ color: '#9ca3af' }}>
              {FRANKLIN_STATUS_CONFIG.done.icon}{items.filter(t => t.status === 'done').length}{' '}
              {FRANKLIN_STATUS_CONFIG.progress.icon}{items.filter(t => t.status === 'progress').length}{' '}
              {FRANKLIN_STATUS_CONFIG.pending.icon}{items.filter(t => t.status === 'pending').length}
            </span>
          </div>
        </div>

        <div style={{ maxHeight: 'calc(100vh - 350px)', overflowY: 'auto', scrollbarWidth: 'none' as any }}>
          {sorted.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', fontSize: 11, color: '#94a3b8' }}>지침을 추가하세요</div>
          ) : sorted.map(task => {
            const pCfg = FRANKLIN_PRIORITY_CONFIG[task.priority];
            const stCfg = FRANKLIN_STATUS_CONFIG[task.status];
            const isExpanded = expandedId === task.id;
            const rc = RULE_COLORS[task.ruleType];

            return (
              <div key={task.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}
                onDragOver={e => onDragOver(e, task.priority)} onDragLeave={onDragLeave} onDrop={e => onDropPriority(e, task.priority)}>
                <div draggable onDragStart={e => onDragStart(e, task.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 8px', cursor: 'grab' }}
                  className="hover:bg-accent/10 group">
                  <button onClick={() => setExpandedId(isExpanded ? null : task.id)} style={{ width: 16, height: 16, flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
                    {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </button>
                  <button onClick={() => onUpdate(task.id, { status: cycleStatus(task.status) })}
                    style={{ width: 20, height: 20, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0, background: stCfg.bg, color: stCfg.color, border: 'none', cursor: 'pointer' }}>{stCfg.icon}</button>
                  <span style={{ fontSize: 10, fontWeight: 700, width: 20, flexShrink: 0, color: pCfg.color }}>{task.priority}{task.number}</span>
                  <span style={{ padding: '1px 6px', borderRadius: 8, fontSize: 9, fontWeight: 600, background: rc.bg, color: rc.color, flexShrink: 0 }}>{task.ruleType}</span>
                  {editingId === task.id ? (
                    <input value={task.title} onChange={e => onUpdate(task.id, { title: e.target.value })}
                      onBlur={() => setEditingId(null)} onKeyDown={e => e.key === 'Enter' && setEditingId(null)}
                      autoFocus style={{ flex: 1, fontSize: 12, padding: '2px 4px', border: '1px solid #3B82F6', borderRadius: 4, outline: 'none' }} />
                  ) : (
                    <span onClick={() => setEditingId(task.id)}
                      style={{ flex: 1, fontSize: 12, cursor: 'pointer', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textDecoration: task.status === 'done' || task.status === 'cancelled' ? 'line-through' : 'none', color: task.status === 'cancelled' ? '#9ca3af' : '#1e293b' }}>
                      {task.title}
                    </span>
                  )}
                  <button onClick={() => onDelete(task.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: 10, opacity: 0 }} className="group-hover:!opacity-100">✕</button>
                </div>

                {isExpanded && (
                  <div style={{ padding: '8px 32px 12px', background: 'rgba(0,0,0,0.02)', borderTop: '1px solid rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }}>
                      <span style={{ color: '#64748b', width: 50 }}>우선순위</span>
                      {priorities.map(p => (
                        <button key={p} onClick={() => { const eis = syncPriorityToEisenhower(p); onUpdate(task.id, { priority: p, number: getNextNumber(items, p), ...eis }); }}
                          style={{ width: 24, height: 24, borderRadius: 4, fontSize: 10, fontWeight: 700, border: 'none', cursor: 'pointer', background: task.priority === p ? FRANKLIN_PRIORITY_CONFIG[p].color : FRANKLIN_PRIORITY_CONFIG[p].bg, color: task.priority === p ? '#fff' : FRANKLIN_PRIORITY_CONFIG[p].color }}>{p}</button>
                      ))}
                    </div>
                    {task.content && <div style={{ fontSize: 12, color: '#475569', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{task.content}</div>}
                    <div style={{ display: 'flex', gap: 8, fontSize: 11 }}>
                      <span style={{ color: '#64748b', width: 50, paddingTop: 4 }}>메모</span>
                      <textarea value={task.note} onChange={e => onUpdate(task.id, { note: e.target.value })}
                        placeholder="상세 내용, 피드백, 결과..."
                        style={{ flex: 1, padding: '4px 8px', border: '1px solid #e2e8f0', borderRadius: 4, fontSize: 11, outline: 'none', resize: 'none', minHeight: 40, fontFamily: 'inherit', scrollbarWidth: 'none' as any }} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {items.some(t => t.status === 'forwarded') && (
          <div style={{ padding: '6px 12px', background: '#FFFBEB', borderTop: '1px solid #FDE68A', fontSize: 10, color: '#D97706' }}>
            <strong>이월:</strong> {items.filter(t => t.status === 'forwarded').map(t => `${t.priority}${t.number} ${t.title}`).join(', ')}
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   Eisenhower View (업무일지에서 그대로 가져옴)
   ══════════════════════════════════════════════════════════════ */
function EisenhowerViewPanel({ items, onUpdate, onDelete }: {
  items: GuidelineItem[];
  onUpdate: (id: string, updates: Partial<GuidelineItem>) => void;
  onDelete: (id: string) => void;
}) {
  const [dragId, setDragId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<EisenhowerQuadrant | null>(null);

  const grouped: Record<EisenhowerQuadrant, GuidelineItem[]> = { q1: [], q2: [], q3: [], q4: [] };
  items.forEach(t => grouped[getQuadrant(t)].push(t));

  const onDragStart = (e: DragEvent, id: string) => { setDragId(id); e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', id); };
  const onDropQuadrant = (e: DragEvent, q: EisenhowerQuadrant) => {
    e.preventDefault(); setDropTarget(null);
    if (!dragId) return;
    const flags = setQuadrant(q);
    onUpdate(dragId, { ...flags, number: getNextNumber(items, flags.priority) });
    setDragId(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {(['q1', 'q2', 'q3', 'q4'] as EisenhowerQuadrant[]).map(q => {
          const cfg = EISENHOWER_CONFIG[q];
          const qItems = grouped[q];
          const isDrop = dropTarget === q;
          return (
            <div key={q} style={{ border: `1px solid ${isDrop ? cfg.color : cfg.border}`, borderRadius: 8, overflow: 'hidden', minHeight: 140, maxHeight: 'calc(40vh - 40px)', display: 'flex', flexDirection: 'column', boxShadow: isDrop ? `0 0 0 2px ${cfg.color}30` : 'none' }}
              onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setDropTarget(q); }} onDragLeave={() => setDropTarget(null)} onDrop={e => onDropQuadrant(e, q)}>
              <div style={{ padding: '6px 10px', background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 10, fontWeight: 900, padding: '2px 6px', borderRadius: 4, background: cfg.color, color: '#fff' }}>{cfg.label}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: cfg.color }}>{cfg.desc}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: cfg.color }}>{cfg.action}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: cfg.border }}>{qItems.length}</span>
                </div>
              </div>
              <div style={{ flex: 1, overflowY: 'auto' }}>
                {qItems.length === 0 ? (
                  <div style={{ padding: 16, textAlign: 'center', fontSize: 11, color: '#9ca3af' }}>드래그하여 배치</div>
                ) : qItems.map(task => {
                  const stCfg = FRANKLIN_STATUS_CONFIG[task.status];
                  const pCfg = FRANKLIN_PRIORITY_CONFIG[task.priority];
                  const rc = RULE_COLORS[task.ruleType];
                  return (
                    <div key={task.id} draggable onDragStart={e => onDragStart(e, task.id)}
                      style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 8px', borderBottom: '1px solid rgba(0,0,0,0.05)', cursor: 'grab' }}
                      className="hover:bg-accent/20 group">
                      <button onClick={() => onUpdate(task.id, { status: cycleStatus(task.status) })}
                        style={{ width: 20, height: 20, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0, background: stCfg.bg, color: stCfg.color, border: 'none', cursor: 'pointer' }}>{stCfg.icon}</button>
                      <span style={{ fontSize: 10, fontWeight: 700, flexShrink: 0, color: pCfg.color }}>{task.priority}{task.number}</span>
                      <span style={{ padding: '1px 5px', borderRadius: 8, fontSize: 9, fontWeight: 600, background: rc.bg, color: rc.color, flexShrink: 0 }}>{task.ruleType}</span>
                      <span style={{ flex: 1, fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textDecoration: task.status === 'done' ? 'line-through' : 'none', color: task.status === 'cancelled' ? '#9ca3af80' : undefined }}>{task.title}</span>
                      <button onClick={() => onDelete(task.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: 10, opacity: 0 }} className="group-hover:!opacity-100">✕</button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
        {(['q1', 'q2', 'q3', 'q4'] as EisenhowerQuadrant[]).map(q => {
          const cfg = EISENHOWER_CONFIG[q];
          const done = grouped[q].filter(t => t.status === 'done').length;
          const total = grouped[q].length;
          return (
            <div key={q} style={{ textAlign: 'center', padding: 8, borderRadius: 8, background: cfg.bg, border: `1px solid ${cfg.border}` }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: cfg.color }}>{cfg.action}</div>
              <div style={{ fontSize: 18, fontWeight: 900, color: cfg.color }}>{done}/{total}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   Mandalart View (업무일지에서 그대로 가져옴)
   ══════════════════════════════════════════════════════════════ */
function MandalartViewPanel({ cells, items, onCellsChange, onItemAdd }: {
  cells: MandalartCell[];
  items: GuidelineItem[];
  onCellsChange: (cells: MandalartCell[]) => void;
  onItemAdd: (title: string) => void;
}) {
  const [drillId, setDrillId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dragCellId, setDragCellId] = useState<string | null>(null);
  const [period, setPeriod] = useState<MandalartPeriod>('daily');
  const [showStats, setShowStats] = useState(false);
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current && (!cells || cells.length < 9)) {
      initialized.current = true;
      onCellsChange(createInitialRoot());
    }
  }, []);

  if (!cells || cells.length < 9) return <div style={{ padding: 20, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>만다라트 초기화 중...</div>;

  const root = cells;
  const drillCell = drillId ? root.find(c => c.id === drillId) : null;
  const currentGrid = drillCell
    ? [...(drillCell.children || []).slice(0, 4), { ...drillCell }, ...(drillCell.children || []).slice(4, 8)]
    : root;
  while (currentGrid.length < 9) currentGrid.push(emptyCell());

  const updateCell = (id: string, text: string) => {
    if (drillCell) {
      const newRoot = root.map(c => {
        if (c.id !== drillId) return c;
        if (id === c.id) return { ...c, text };
        const children = [...(c.children || [])];
        const surroundIdx = currentGrid.findIndex(g => g.id === id);
        const childIdx = surroundIdx < 4 ? surroundIdx : surroundIdx - 1;
        if (childIdx >= 0 && childIdx < children.length) children[childIdx] = { ...children[childIdx], text };
        else { while (children.length <= childIdx) children.push(emptyCell()); children[childIdx] = { ...children[childIdx], text }; }
        return { ...c, children };
      });
      onCellsChange(newRoot);
    } else {
      onCellsChange(root.map(c => c.id === id ? { ...c, text } : c));
    }
  };

  const setAchievement = (id: string, value: number) => {
    const updateAch = (c: MandalartCell): MandalartCell => {
      if (c.id === id) return { ...c, achievement: c.achievement === value ? 0 : value };
      if (c.children) return { ...c, children: c.children.map(updateAch) };
      return c;
    };
    onCellsChange(root.map(updateAch));
  };

  const handleDrillDown = (cell: MandalartCell, idx: number) => {
    if (drillId) return;
    if (idx === 4 || !cell.text.trim()) return;
    if (!cell.children || cell.children.length === 0) {
      onCellsChange(root.map(c => c.id === cell.id ? { ...c, children: Array.from({ length: 8 }, () => emptyCell()) } : c));
    }
    setDrillId(cell.id);
  };

  const onDragStart = (e: DragEvent, cell: MandalartCell) => {
    if (!cell.text.trim()) return;
    setDragCellId(cell.id);
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('text/plain', cell.text);
  };

  const isCenter = (idx: number) => idx === 4;
  const stats = calcGridAchievement(currentGrid);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        {drillId && (
          <button onClick={() => setDrillId(null)} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 12, cursor: 'pointer', color: '#475569' }}>
            <ArrowLeft size={14} /> 상위로
          </button>
        )}
        <span style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>
          {drillId ? `만다라트 — ${drillCell?.text}` : '만다라트'}
        </span>
        <div style={{ display: 'flex', gap: 2, marginLeft: 'auto' }}>
          {([['daily', '일간'], ['weekly', '주간'], ['monthly', '월간']] as const).map(([key, label]) => (
            <button key={key} onClick={() => setPeriod(key)}
              style={{ padding: '3px 10px', borderRadius: 12, border: '1px solid', fontSize: 11, cursor: 'pointer', borderColor: period === key ? '#3B82F6' : '#e2e8f0', background: period === key ? '#EFF6FF' : '#fff', color: period === key ? '#3B82F6' : '#94a3b8', fontWeight: period === key ? 600 : 400 }}>
              {label}
            </button>
          ))}
          <button onClick={() => setShowStats(!showStats)}
            style={{ padding: '3px 8px', borderRadius: 12, border: '1px solid', fontSize: 11, cursor: 'pointer', borderColor: showStats ? '#10B981' : '#e2e8f0', background: showStats ? '#ecfdf5' : '#fff', color: showStats ? '#10B981' : '#94a3b8' }}>
            <BarChart3 size={12} />
          </button>
        </div>
      </div>

      {/* Achievement bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 8px', background: '#f8fafc', borderRadius: 6, border: '1px solid #e2e8f0' }}>
        <span style={{ fontSize: 10, color: '#64748b', fontWeight: 600 }}>달성</span>
        <div style={{ flex: 1, height: 6, background: '#e2e8f0', borderRadius: 3, overflow: 'hidden', position: 'relative' }}>
          <div style={{ width: `${stats.total > 0 ? Math.round(stats.yang / stats.total * 100) : 0}%`, height: '100%', background: '#f59e0b', borderRadius: 3, transition: 'width 0.3s', position: 'absolute', left: 0, top: 0 }} />
          <div style={{ width: `${stats.total > 0 ? Math.round(stats.jil / stats.total * 100) : 0}%`, height: '100%', background: '#10B981', borderRadius: 3, transition: 'width 0.3s', position: 'absolute', left: 0, top: 0 }} />
        </div>
        <span style={{ fontSize: 10, color: '#f59e0b', fontWeight: 700 }}>양 {stats.yang}/{stats.total}</span>
        <span style={{ fontSize: 10, color: '#10B981', fontWeight: 700 }}>질 {stats.jil}/{stats.total}</span>
      </div>

      {/* Stats */}
      {showStats && (
        <div style={{ padding: '6px 8px', background: '#fff', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 11 }}>
          <div style={{ fontWeight: 600, color: '#1e293b', marginBottom: 4 }}>
            {period === 'daily' ? '오늘' : period === 'weekly' ? '이번 주' : '이번 달'} 통계
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 4 }}>
            <StatCard label="작성" value={`${stats.filled}`} sub="/8" color="#3B82F6" />
            <StatCard label="양(1~3)" value={`${stats.yang}`} sub={`/${stats.total}`} color="#f59e0b" />
            <StatCard label="질(4~5)" value={`${stats.jil}`} sub={`/${stats.total}`} color="#10B981" />
            <StatCard label="달성률" value={`${stats.total > 0 ? Math.round(stats.jil / stats.total * 100) : 0}`} sub="%" color={stats.jil >= stats.total && stats.total > 0 ? '#10B981' : '#f59e0b'} />
          </div>
          <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {currentGrid.filter((_, i) => i !== 4).filter(c => c.text.trim()).map(c => {
              const ach = c.achievement || 0;
              const pct = Math.round((ach / 5) * 100);
              return (
                <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 10, color: '#475569', minWidth: 70, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.text}</span>
                  <div style={{ flex: 1, height: 5, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: ach >= 4 ? '#10B981' : ach >= 1 ? '#f59e0b' : '#e2e8f0', borderRadius: 3 }} />
                  </div>
                  <span style={{ fontSize: 9, color: ach >= 4 ? '#10B981' : ach >= 1 ? '#f59e0b' : '#94a3b8', fontWeight: 600, minWidth: 20 }}>{ach > 0 ? ACH_LABELS[ach] : '-'}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Layout */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        {/* Minimap */}
        {drillId && (
          <div style={{ flexShrink: 0, width: 130 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', marginBottom: 4 }}>메인</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 3, background: '#f1f5f9', padding: 4, borderRadius: 8, border: '1px solid #e2e8f0' }}>
              {root.map((c, i) => (
                <div key={c.id}
                  onClick={() => {
                    if (i === 4) { setDrillId(null); return; }
                    if (c.text.trim()) {
                      if (!c.children || c.children.length === 0) onCellsChange(root.map(r => r.id === c.id ? { ...r, children: Array.from({ length: 8 }, () => emptyCell()) } : r));
                      setDrillId(c.id); setEditingId(null);
                    }
                  }}
                  style={{ minHeight: 32, padding: '2px 3px', background: i === 4 ? '#1e293b' : c.id === drillId ? '#3B82F6' : '#fff', borderRadius: 4, fontSize: 9, color: i === 4 ? '#fff' : c.id === drillId ? '#fff' : c.text ? '#475569' : '#cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', wordBreak: 'break-word', cursor: i === 4 || c.text.trim() ? 'pointer' : 'default', border: c.id === drillId ? '2px solid #3B82F6' : '1px solid #e2e8f0', fontWeight: c.id === drillId ? 700 : 400 }}>
                  {c.text || (i === 4 ? '목표' : '')}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3x3 Grid */}
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, background: '#f1f5f9', padding: 6, borderRadius: 12, border: '1px solid #e2e8f0' }}>
          {currentGrid.map((cell, idx) => {
            const center = isCenter(idx);
            const ach = cell.achievement || 0;
            return (
              <div key={cell.id}
                draggable={!center && !!cell.text.trim()}
                onDragStart={e => onDragStart(e, cell)}
                onDragEnd={() => setDragCellId(null)}
                onDoubleClick={() => !drillId && cell.text.trim() && handleDrillDown(cell, idx)}
                onClick={() => setEditingId(cell.id)}
                style={{ position: 'relative', minHeight: 90, background: center ? '#1e293b' : dragCellId === cell.id ? '#dbeafe' : '#fff', borderRadius: 8, border: `2px solid ${center ? '#1e293b' : '#e2e8f0'}`, display: 'flex', flexDirection: 'column', cursor: center ? 'text' : cell.text.trim() ? (drillId ? 'grab' : 'pointer') : 'text', transition: 'all 0.15s', overflow: 'hidden' }}>
                {!center && cell.text.trim() && <div style={{ position: 'absolute', top: 4, right: 4, opacity: 0.3 }}><GripVertical size={12} /></div>}
                {editingId === cell.id ? (
                  <textarea autoFocus value={cell.text}
                    onChange={e => updateCell(cell.id, e.target.value)}
                    onBlur={() => setEditingId(null)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); setEditingId(null); } }}
                    style={{ flex: 1, width: '100%', padding: '6px 8px', border: 'none', outline: 'none', fontSize: center ? 13 : 11, fontWeight: center ? 700 : 400, color: center ? '#fff' : '#1e293b', background: 'transparent', resize: 'none', fontFamily: 'inherit', lineHeight: 1.4 }} />
                ) : (
                  <div style={{ flex: 1, padding: '6px 8px', fontSize: center ? 13 : 11, fontWeight: center ? 700 : 400, color: center ? '#fff' : cell.text ? '#1e293b' : '#cbd5e1', lineHeight: 1.4, wordBreak: 'break-word', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                    {cell.text || (center ? '목표 입력' : '+')}
                  </div>
                )}
                {!center && cell.text.trim() && (
                  <div style={{ padding: '0 4px 3px', display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <div style={{ display: 'flex', gap: 2, justifyContent: 'center' }} onClick={e => e.stopPropagation()}>
                      {[1, 2, 3, 4, 5].map(v => (
                        <button key={v} onClick={() => setAchievement(cell.id, v)} title={ACH_LABELS[v]}
                          style={{ width: 14, height: 14, borderRadius: '50%', border: 'none', cursor: 'pointer', padding: 0, background: ach >= v ? ACH_COLORS[v] : '#e2e8f0', opacity: ach >= v ? 1 : 0.4, transition: 'all 0.15s' }} />
                      ))}
                    </div>
                    {!drillId && (cell.children?.filter(c => c.text).length || 0) > 0 && (
                      <div style={{ fontSize: 9, paddingTop: 1 }}>
                        <span style={{ color: '#3B82F6' }}>▦ {cell.children?.filter(c => c.text).length || 0}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {!drillId && (
        <div style={{ fontSize: 10, color: '#94a3b8', textAlign: 'center' }}>
          {'셀 클릭→편집 | 더블클릭→하위 분해 | 달성률 설정 | 드래그→재배치'}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  return (
    <div style={{ padding: '4px 6px', background: '#f8fafc', borderRadius: 4, textAlign: 'center' }}>
      <div style={{ fontSize: 14, fontWeight: 700, color, lineHeight: 1.2 }}>{value}<span style={{ fontSize: 10, color: '#94a3b8' }}>{sub}</span></div>
      <div style={{ fontSize: 9, color: '#64748b' }}>{label}</div>
    </div>
  );
}

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

  // Filters (업무자료 패턴)
  const [filterDept, setFilterDept] = useState('전체');
  const [filterCat2, setFilterCat2] = useState('전체');
  const [filterCat3, setFilterCat3] = useState('전체');
  const [filterPos, setFilterPos] = useState('전체');
  const [filterAuthor, setFilterAuthor] = useState('전체');
  const [filterRuleType, setFilterRuleType] = useState<RuleType | '전체'>('전체');
  const [searchText, setSearchText] = useState('');
  const [custom, setCustom] = useState<Record<string, string[]>>(loadCustom);
  const updateCustom = (key: string, vals: string[]) => { const next = { ...custom, [key]: vals }; setCustom(next); saveCustom(next); };

  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load data
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/company-guidelines');
        const raw = await res.json();
        if (Array.isArray(raw) && raw.length > 0) {
          // Find the single data row
          const row = raw[0];
          const d = typeof row.data === 'string' ? JSON.parse(row.data) : row.data;
          setItems(d.items || []);
          setMandalartCells(d.mandalartCells || []);
        } else {
          // Load from localStorage fallback
          try {
            const ls = localStorage.getItem(DATA_KEY);
            if (ls) { const d = JSON.parse(ls); setItems(d.items || []); setMandalartCells(d.mandalartCells || []); }
          } catch {}
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
      id: `gi-${Date.now()}`, department: DEF_DEPTS[0], category2: '', category3: '', position: '', author: '',
      title, content: '', ruleType: '규정', priority: 'B', number: getNextNumber(items, 'B'),
      status: 'pending', urgent: false, important: true, note: '', created_at: new Date().toISOString(),
    };
    updateItems(prev => [...prev, item]);
  };

  // Filtering
  const allAuthors = [...new Set(items.map(i => i.author).filter(Boolean))];
  const filtered = items.filter(i => {
    if (filterDept !== '전체' && i.department !== filterDept) return false;
    if (filterCat2 !== '전체' && i.category2 !== filterCat2) return false;
    if (filterCat3 !== '전체' && i.category3 !== filterCat3) return false;
    if (filterPos !== '전체' && i.position !== filterPos) return false;
    if (filterAuthor !== '전체' && i.author !== filterAuthor) return false;
    if (filterRuleType !== '전체' && i.ruleType !== filterRuleType) return false;
    if (searchText) {
      const s = searchText.toLowerCase();
      if (!i.title.toLowerCase().includes(s) && !i.content.toLowerCase().includes(s) && !i.author.toLowerCase().includes(s) && !i.note.toLowerCase().includes(s)) return false;
    }
    return true;
  });

  const anyFilterActive = filterDept !== '전체' || filterCat2 !== '전체' || filterCat3 !== '전체' || filterPos !== '전체' || filterAuthor !== '전체' || filterRuleType !== '전체' || !!searchText;
  const resetFilters = () => { setFilterDept('전체'); setFilterCat2('전체'); setFilterCat3('전체'); setFilterPos('전체'); setFilterAuthor('전체'); setFilterRuleType('전체'); setSearchText(''); };

  const mergedDepts = [...DEF_DEPTS, ...(custom['dept'] || [])];
  const mergedCat2 = [...DEF_CAT2, ...(custom['cat2'] || [])];
  const mergedCat3 = [...DEF_CAT3, ...(custom['cat3'] || [])];
  const mergedPos = [...DEF_POS, ...(custom['pos'] || [])];

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
          <button onClick={() => { setEditingItem(null); setShowForm(true); }} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: '#3B82F6', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}><Plus size={16} />새 지침</button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
        <div style={{ position: 'relative', maxWidth: 360 }}>
          <Search size={16} style={{ position: 'absolute', left: 10, top: 10, color: '#94a3b8' }} />
          <input value={searchText} onChange={e => setSearchText(e.target.value)} placeholder="제목, 내용, 작성자, 비고 검색..." style={{ width: '100%', padding: '8px 12px 8px 32px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, outline: 'none', background: '#fff' }} />
        </div>
        {/* 규정 유형 필터 */}
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
        <DynFilter label="대분류" items={mergedDepts} defaults={DEF_DEPTS} value={filterDept} onChange={setFilterDept} customKey="dept" custom={custom} updateCustom={updateCustom} />
        <DynFilter label="중분류" items={mergedCat2} defaults={DEF_CAT2} value={filterCat2} onChange={setFilterCat2} customKey="cat2" custom={custom} updateCustom={updateCustom} />
        <DynFilter label="소분류" items={mergedCat3} defaults={DEF_CAT3} value={filterCat3} onChange={setFilterCat3} customKey="cat3" custom={custom} updateCustom={updateCustom} />
        <DynFilter label="직급" items={mergedPos} defaults={DEF_POS} value={filterPos} onChange={setFilterPos} customKey="pos" custom={custom} updateCustom={updateCustom} />
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
        <ClassicView items={filtered} onUpdate={handleUpdate} onDelete={handleDelete} onEdit={item => { setEditingItem(item); setShowForm(true); }} />
      ) : viewMode === 'franklin' ? (
        <FranklinViewPanel items={filtered} onUpdate={handleUpdate} onDelete={handleDelete} />
      ) : viewMode === 'eisenhower' ? (
        <EisenhowerViewPanel items={filtered} onUpdate={handleUpdate} onDelete={handleDelete} />
      ) : (
        <MandalartViewPanel cells={mandalartCells} items={filtered} onCellsChange={updateCells} onItemAdd={handleItemAdd} />
      )}

      {/* Form Modal */}
      {showForm && (
        <GuidelineForm
          item={editingItem}
          depts={mergedDepts} cat2s={mergedCat2} cat3s={mergedCat3} positions={mergedPos}
          onSave={handleAddOrEdit}
          onClose={() => { setShowForm(false); setEditingItem(null); }}
        />
      )}
    </div>
  );
}
