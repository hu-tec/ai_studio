import React, { useState, useMemo, useEffect, useRef } from "react";
import { 
  ChevronRight, 
  Settings2, 
  CheckCircle2, 
  LayoutDashboard, 
  RotateCcw, 
  Save, 
  ShieldCheck, 
  Zap, 
  Check,
  PlusCircle,
  PencilLine,
  Trash2,
  Search
} from "lucide-react";
import * as Checkbox from "@radix-ui/react-checkbox";
import { motion, AnimatePresence } from "motion/react";

// --- Types & Data ---

type DashboardMode = "VIEW" | "ADD" | "EDIT" | "DELETE";

interface EvaluationData {
  id: string;
  name: string;
  emoji: string;
  subs: {
    id: string;
    name: string;
    details: string[];
  }[];
}

const INITIAL_DATA: EvaluationData[] = [
  {
    id: "info",
    name: "정보성/정확도",
    emoji: "📝",
    subs: [
      { id: "clear", name: "명확성", details: ["용어의 정확성", "문장 구조의 명료함", "의미 전달의 직접성"] },
      { id: "spec", name: "특수성", details: ["고유 명사 사용", "데이터의 구체성", "수치 정보의 정확도"] },
      { id: "comp", name: "완전성", details: ["육하원칙 준수", "생략된 정보 유무", "결론의 유무"] },
      { id: "suff", name: "충분성", details: ["정보의 양적 만족도", "추가 설명의 필요성", "배경지식 제공"] },
      { id: "open", name: "개방성", details: ["다양한 관점 수용", "정보의 확장성", "외부 참조 가능성"] },
    ],
  },
  {
    id: "adj",
    name: "적절성",
    emoji: "✅",
    subs: [
      { id: "ctx", name: "상황정보/단서", details: ["맥락 파악 능력", "지시사항 준수", "사용자 의도 반영"] },
      { id: "cons", name: "일관성(표현)", details: ["톤앤매너 유지", "경어체/평어체 일관성", "단어 선택의 일관성"] },
      { id: "complex", name: "복잡성", details: ["난이도 조절", "구조적 체계성", "추상화 수준"] },
      { id: "tone", name: "색조/문체", details: ["감정적 중립도", "문체적 우아함", "목적 부합성"] },
      { id: "error", name: "오류처리", details: ["예외 케이스 대응", "오류 메시지의 친절함", "복구 가이드"] },
    ],
  },
  {
    id: "eff",
    name: "효율성",
    emoji: "⚡",
    subs: [
      { id: "sys", name: "체계성", details: ["단계별 구성", "분류의 논리성", "계층 구조의 명확성"] },
      { id: "cons2", name: "일관성", details: ["프로세스 일관성", "입출력 포맷 유지", "시간적 효율"] },
      { id: "accept", name: "수용성", details: ["사용자 편의성", "학습 곡선의 완만함", "범용성"] },
      { id: "apply", name: "적용례", details: ["실사례 포함 여부", "응용 가능성", "템플릿화 수준"] },
    ],
  },
  {
    id: "ethic",
    name: "윤리",
    emoji: "⚖️",
    subs: [
      { id: "neutral", name: "중립성", details: ["편향성 배제", "정치적 중립", "문화적 감수성"] },
      { id: "safety", name: "안전성", details: ["유해 콘텐츠 배제", "심리적 안정감", "위험 요소 차단"] },
    ],
  },
  {
    id: "sec",
    name: "보안",
    emoji: "🛡️",
    subs: [
      { id: "sec_item", name: "보안성", details: ["민감 정보 필터링", "개인정보 보호", "암호화 수준"] },
      { id: "expert", name: "전문성", details: ["지식의 깊이", "검증된 출처", "최신 트렌드 반영"] },
    ],
  },
];

// --- Sub Components ---

const ColumnHeader = ({ 
  title, 
  emoji, 
  targetValue, 
  onTargetChange 
}: { 
  title: string; 
  emoji: string; 
  targetValue: number;
  onTargetChange: (val: number) => void;
}) => {
  const [inputValue, setInputValue] = useState<string>(targetValue.toString());

  React.useEffect(() => {
    setInputValue(targetValue.toString());
  }, [targetValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || /^[0-9]+$/.test(value)) {
      setInputValue(value);
      const numValue = parseInt(value, 10);
      onTargetChange(isNaN(numValue) ? 0 : numValue);
    }
  };

  return (
    <div className="flex items-center justify-between p-2 border-b border-slate-200 bg-slate-50 sticky top-0 z-10 h-[68px]">
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-sm">{emoji}</span>
        <h3 className="font-bold text-slate-800 text-sm whitespace-nowrap">{title}</h3>
      </div>
      <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-1.5 focus-within:ring-2 focus-within:ring-slate-900/10 focus-within:border-slate-400 transition-all ml-2 w-[90px] shadow-sm">
        <input 
          type="text" 
          inputMode="numeric"
          value={inputValue}
          onChange={handleChange}
          className="w-full text-sm font-bold text-slate-900 focus:outline-none bg-transparent text-center appearance-none"
          placeholder="0"
        />
        <span className="text-xs font-bold text-slate-400 shrink-0">개</span>
      </div>
    </div>
  );
};

const CustomItem = ({ 
  checked, 
  onCheckedChange, 
  label, 
  isActive, 
  onLabelClick,
  mode,
  onDelete,
  onEdit
}: { 
  checked: boolean; 
  onCheckedChange: (checked: boolean) => void; 
  label: string; 
  isActive?: boolean;
  onLabelClick?: () => void;
  mode: DashboardMode;
  onDelete?: () => void;
  onEdit?: (newName: string) => void;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(label);

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onEdit && editValue.trim() && editValue !== label) {
      onEdit(editValue.trim());
    }
    setIsEditing(false);
  };

  return (
    <div 
      className={`group flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer relative border ${
        isActive ? "bg-slate-100 border-slate-200 shadow-sm" : "bg-transparent border-transparent hover:bg-slate-50"
      }`}
      onClick={() => !isEditing && onLabelClick && onLabelClick()}
    >
      <div className="flex items-center gap-3 flex-1 overflow-hidden">
        {mode === "VIEW" && (
          <Checkbox.Root
            className={`flex h-5 w-5 shrink-0 appearance-none items-center justify-center rounded border outline-none transition-colors ${
              checked ? "bg-slate-900 border-slate-900" : "bg-white border-slate-300 group-hover:border-slate-400"
            }`}
            checked={checked}
            onCheckedChange={onCheckedChange}
            onClick={(e) => e.stopPropagation()}
          >
            <Checkbox.Indicator className="text-white">
              <Check size={14} strokeWidth={3} />
            </Checkbox.Indicator>
          </Checkbox.Root>
        )}

        {isEditing ? (
          <form onSubmit={handleEditSubmit} className="flex-1" onClick={e => e.stopPropagation()}>
            <input
              autoFocus
              className="w-full text-sm font-bold text-slate-900 bg-white border border-slate-900 rounded px-2 py-0.5 outline-none"
              value={editValue}
              onChange={e => setEditValue(e.target.value)}
              onBlur={handleEditSubmit}
            />
          </form>
        ) : (
          <span className={`text-sm truncate ${checked ? "text-slate-900 font-bold" : "text-slate-600"} ${mode === "EDIT" ? "group-hover:text-blue-600" : ""} ${mode === "DELETE" ? "group-hover:text-rose-600" : ""}`}>
            {label}
          </span>
        )}
      </div>

      <div className="flex items-center gap-1 ml-2 shrink-0">
        {mode === "EDIT" && !isEditing && (
          <button 
            onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
            className="p-1.5 text-blue-500 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-blue-100"
          >
            <PencilLine size={14} />
          </button>
        )}
        {mode === "DELETE" && (
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete && onDelete(); }}
            className="p-1.5 text-rose-500 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-rose-100"
          >
            <Trash2 size={14} />
          </button>
        )}
        {isActive !== undefined && mode === "VIEW" && (
          <ChevronRight size={16} className={isActive ? "text-slate-900" : "text-slate-300"} />
        )}
      </div>
    </div>
  );
};

// --- Main App Component ---

const saveEvalToServer = (data: EvaluationData[]) => {
  fetch('/api/eval-criteria', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ criteria_id: 'main', data }),
  }).catch(() => {});
};

function EvalCriteriaPage() {
  const [data, setData] = useState<EvaluationData[]>(INITIAL_DATA);
  const [appMode, setAppMode] = useState<DashboardMode>("VIEW");
  const loadedRef = useRef(false);
  const isInitialMount = useRef(true);

  // Load from API on mount
  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;
    fetch('/api/eval-criteria/main')
      .then((r) => r.json())
      .then((row: any) => {
        if (row && row.data && Array.isArray(row.data)) {
          setData(row.data);
        }
      })
      .catch(() => {});
  }, []);

  // Save to API on data changes
  useEffect(() => {
    if (isInitialMount.current) { isInitialMount.current = false; return; }
    saveEvalToServer(data);
  }, [data]);

  // Selection
  const [selectedMainIds, setSelectedMainIds] = useState<string[]>([]);
  const [selectedSubIds, setSelectedSubIds] = useState<string[]>([]);
  const [selectedDetailIds, setSelectedDetailIds] = useState<Record<string, string[]>>({});

  // Focus
  const [activeMainId, setActiveMainId] = useState<string>(INITIAL_DATA[0].id);
  const [activeSubId, setActiveSubId] = useState<string>(INITIAL_DATA[0].subs[0].id);

  // Targets
  const [targetMainCount, setTargetMainCount] = useState<number>(3);
  const [targetSubCount, setTargetSubCount] = useState<number>(2);
  const [targetDetailCount, setTargetDetailCount] = useState<number>(5);

  const activeMain = useMemo(() => data.find(m => m.id === activeMainId) || data[0], [data, activeMainId]);
  const activeSub = useMemo(() => activeMain?.subs.find(s => s.id === activeSubId) || activeMain?.subs[0], [activeMain, activeSubId]);

  // --- Handlers ---

  const addItem = (type: 'MAIN' | 'SUB' | 'DETAIL') => {
    const name = window.prompt(`추가할 ${type === 'MAIN' ? '대분류' : type === 'SUB' ? '중분류' : '소분류'} 명칭을 입력하세요:`);
    if (!name) return;

    setData(prev => {
      const newData = [...prev];
      if (type === 'MAIN') {
        newData.push({ id: `main-${Date.now()}`, name, emoji: "📁", subs: [] });
      } else if (type === 'SUB') {
        const m = newData.find(item => item.id === activeMainId);
        if (m) m.subs.push({ id: `sub-${Date.now()}`, name, details: [] });
      } else if (type === 'DETAIL') {
        const m = newData.find(item => item.id === activeMainId);
        const s = m?.subs.find(item => item.id === activeSubId);
        if (s) s.details.push(name);
      }
      return newData;
    });
  };

  const deleteItem = (type: 'MAIN' | 'SUB' | 'DETAIL', id: string, detailIdx?: number) => {
    if (!window.confirm("항목을 삭제하시겠습니까?")) return;
    setData(prev => {
      let newData = [...prev];
      if (type === 'MAIN') newData = newData.filter(m => m.id !== id);
      else if (type === 'SUB') {
        const m = newData.find(item => item.id === activeMainId);
        if (m) m.subs = m.subs.filter(s => s.id !== id);
      } else if (type === 'DETAIL') {
        const m = newData.find(item => item.id === activeMainId);
        const s = m?.subs.find(item => item.id === activeSubId);
        if (s) s.details = s.details.filter((_, i) => i !== detailIdx);
      }
      return newData;
    });
  };

  const editItem = (type: 'MAIN' | 'SUB' | 'DETAIL', id: string, newName: string, detailIdx?: number) => {
    setData(prev => {
      const newData = [...prev];
      if (type === 'MAIN') {
        const m = newData.find(item => item.id === id);
        if (m) m.name = newName;
      } else if (type === 'SUB') {
        const m = newData.find(item => item.id === activeMainId);
        const s = m?.subs.find(item => item.id === id);
        if (s) s.name = newName;
      } else if (type === 'DETAIL') {
        const m = newData.find(item => item.id === activeMainId);
        const s = m?.subs.find(item => item.id === activeSubId);
        if (s) s.details[detailIdx!] = newName;
      }
      return newData;
    });
  };

  const resetAll = () => {
    setSelectedMainIds([]);
    setSelectedSubIds([]);
    setSelectedDetailIds({});
    setAppMode("VIEW");
  };

  const totalSelectedCount = selectedMainIds.length + selectedSubIds.length + Object.values(selectedDetailIds).flat().length;

  return (
    <div className="h-screen bg-slate-50 flex flex-col font-sans text-slate-900 overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-3 py-2 flex items-center justify-between z-20 shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-slate-900 text-white p-2 rounded-lg">
            <LayoutDashboard size={20} />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-sm font-bold leading-tight">평가 지표 통합 마스터</h1>
            <p className="text-[11px] text-slate-500 font-medium">데이터의 수정/추가/삭제를 실시간으로 관리합니다.</p>
          </div>
        </div>

        {/* Mode Transformation Control */}
        <div className="flex items-center bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-inner">
          {[
            { id: "VIEW", label: "조회", emoji: "🔍" },
            { id: "ADD", label: "추가", emoji: "➕" },
            { id: "EDIT", label: "수정", emoji: "✏️" },
            { id: "DELETE", label: "삭제", emoji: "🗑️" },
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => setAppMode(m.id as DashboardMode)}
              className={`flex items-center gap-2 px-2 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                appMode === m.id 
                  ? "bg-white text-slate-900 shadow-md scale-105 ring-1 ring-slate-200/50" 
                  : "text-slate-500 hover:text-slate-800 hover:bg-white/40"
              }`}
            >
              <span>{m.emoji}</span>
              <span className="hidden md:inline">{m.label}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
            <CheckCircle2 size={14} className="text-slate-900" />
            <span className="text-xs font-bold">{totalSelectedCount}</span>
          </div>
          <button onClick={resetAll} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
            <RotateCcw size={18} />
          </button>
          <button className="flex items-center gap-2 px-2 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-lg hover:bg-slate-800 transition-all shadow-sm">
            <Save size={16} /> 저장
          </button>
        </div>
      </header>

      {/* Grid Content */}
      <main className="flex-1 flex overflow-hidden">
        {/* Col 1 */}
        <div className="w-1/4 min-w-[240px] border-r border-slate-200 bg-white overflow-y-auto flex flex-col">
          <ColumnHeader title="대분류" emoji="📁" targetValue={targetMainCount} onTargetChange={setTargetMainCount} />
          <div className="p-3 space-y-1">
            {data.map((main) => (
              <CustomItem
                key={main.id}
                mode={appMode}
                checked={selectedMainIds.includes(main.id)}
                onCheckedChange={() => setSelectedMainIds(prev => prev.includes(main.id) ? prev.filter(i => i !== main.id) : [...prev, main.id])}
                label={`${main.emoji} ${main.name}`}
                isActive={activeMainId === main.id}
                onLabelClick={() => { setActiveMainId(main.id); if (main.subs.length > 0) setActiveSubId(main.subs[0].id); }}
                onDelete={() => deleteItem('MAIN', main.id)}
                onEdit={(name) => editItem('MAIN', main.id, name)}
              />
            ))}
            {appMode === "ADD" && (
              <button onClick={() => addItem('MAIN')} className="w-full mt-2 p-3 border border-dashed border-slate-300 rounded-xl text-slate-400 text-xs font-bold hover:bg-slate-50 flex items-center justify-center gap-2">
                <PlusCircle size={14} /> 대분류 추가
              </button>
            )}
          </div>
        </div>

        {/* Col 2 */}
        <div className="w-1/4 min-w-[240px] border-r border-slate-200 bg-white overflow-y-auto flex flex-col">
          <ColumnHeader title="중분류" emoji="📂" targetValue={targetSubCount} onTargetChange={setTargetSubCount} />
          <div className="p-3 space-y-1">
            <AnimatePresence mode="wait">
              <motion.div key={activeMainId} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-1">
                {activeMain?.subs.map((sub) => (
                  <CustomItem
                    key={sub.id}
                    mode={appMode}
                    checked={selectedSubIds.includes(sub.id)}
                    onCheckedChange={() => setSelectedSubIds(prev => prev.includes(sub.id) ? prev.filter(i => i !== sub.id) : [...prev, sub.id])}
                    label={sub.name}
                    isActive={activeSubId === sub.id}
                    onLabelClick={() => setActiveSubId(sub.id)}
                    onDelete={() => deleteItem('SUB', sub.id)}
                    onEdit={(name) => editItem('SUB', sub.id, name)}
                  />
                ))}
                {appMode === "ADD" && (
                  <button onClick={() => addItem('SUB')} className="w-full mt-2 p-3 border border-dashed border-slate-300 rounded-xl text-slate-400 text-xs font-bold hover:bg-slate-50 flex items-center justify-center gap-2">
                    <PlusCircle size={14} /> 중분류 추가
                  </button>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Col 3 */}
        <div className="w-1/4 min-w-[280px] border-r border-slate-200 bg-slate-50/50 overflow-y-auto flex flex-col">
          <ColumnHeader title="소분류 상세" emoji="🗒️" targetValue={targetDetailCount} onTargetChange={setTargetDetailCount} />
          <div className="p-3 space-y-1">
            <AnimatePresence mode="wait">
              <motion.div key={activeSubId} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-1">
                {activeSub?.details.map((detail, idx) => (
                  <CustomItem
                    key={`${activeSubId}-${idx}`}
                    mode={appMode}
                    checked={selectedDetailIds[activeSubId]?.includes(detail) || false}
                    onCheckedChange={() => setSelectedDetailIds(prev => {
                      const cur = prev[activeSubId] || [];
                      const upd = cur.includes(detail) ? cur.filter(d => d !== detail) : [...cur, detail];
                      return { ...prev, [activeSubId]: upd };
                    })}
                    label={detail}
                    onDelete={() => deleteItem('DETAIL', activeSubId, idx)}
                    onEdit={(name) => editItem('DETAIL', activeSubId, name, idx)}
                  />
                ))}
                {appMode === "ADD" && (
                  <button onClick={() => addItem('DETAIL')} className="w-full mt-2 p-3 border border-dashed border-slate-300 rounded-xl text-slate-400 text-xs font-bold hover:bg-slate-50 flex items-center justify-center gap-2">
                    <PlusCircle size={14} /> 상세지표 추가
                  </button>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Col 4 */}
        <div className="w-1/4 min-w-[280px] bg-white overflow-y-auto">
          <div className="p-2 border-b border-slate-200 bg-slate-50 h-[68px] flex items-center shrink-0">
            <div className="flex items-center gap-2">
              <Zap size={18} className="text-slate-900" />
              <h3 className="font-bold text-slate-800 text-sm">마스터 요약</h3>
            </div>
          </div>
          <div className="p-2 space-y-2">
            <div className="p-2 rounded-2xl bg-slate-900 text-white space-y-4 shadow-xl">
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">현재 모드</span>
                <span className="text-xs font-bold bg-white/20 px-2 py-0.5 rounded uppercase">{appMode}</span>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-white/60">목표 달성도</span>
                  <span className="font-bold">{Math.min(100, (totalSelectedCount / (targetDetailCount || 1) * 100)).toFixed(0)}%</span>
                </div>
                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                  <motion.div className="bg-white h-full" initial={{ width: 0 }} animate={{ width: `${Math.min(100, (totalSelectedCount / (targetDetailCount || 1) * 100))}%` }} />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck size={12} /> 관리 기능 안내
              </label>
              <div className="p-2 rounded-xl border border-slate-100 bg-slate-50/50 space-y-3 text-[11px] text-slate-600 font-medium leading-relaxed">
                <p>🔍 <b>조회:</b> 항목 선택 및 요약 확인</p>
                <p>➕ <b>추가:</b> 하단 버튼으로 새 항목 생성</p>
                <p>✏️ <b>수정:</b> 아이콘 클릭 후 이름 직접 변경</p>
                <p>🗑️ <b>삭제:</b> 불필요한 데이터 즉시 제거</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-2 bg-white border border-slate-200 rounded-xl text-center shadow-sm">
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">총 분류</p>
                <p className="text-sm font-black">{data.length}</p>
              </div>
              <div className="p-2 bg-white border border-slate-200 rounded-xl text-center shadow-sm">
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">총 지표</p>
                <p className="text-sm font-black">{data.reduce((a, m) => a + m.subs.reduce((s, d) => s + d.details.length, 0), 0)}</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 py-1.5 px-3 flex justify-between items-center text-[10px] font-bold text-slate-400 shrink-0">
        <div className="flex gap-2">
          <span>DASHBOARD v3.5</span>
          <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> LIVE SYNC</span>
        </div>
        <span className="uppercase">{appMode} MODE ENABLED</span>
      </footer>
    </div>
  );
}

export default EvalCriteriaPage;
