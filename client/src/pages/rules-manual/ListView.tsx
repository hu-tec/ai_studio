import React, { useState, useEffect } from 'react';
import { LargeCategory, Regulation, RegulationType } from './mockData';
import {
  Search,
  ChevronRight,
  ChevronDown,
  Maximize2,
  Minimize2,
  RotateCcw,
  MoreVertical,
  PlusCircle,
  Plus,
  X,
  Trash2,
  FileCheck2
} from 'lucide-react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'motion/react';
import { OnOFFToggle } from './RegulationControls';
import { toast } from 'sonner';

interface ListViewProps {
  data: Record<string, LargeCategory[]>;
  actionMode: 'view' | 'edit' | 'add' | 'delete';
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onUpdateRegulation: (reg: Regulation) => void;
  onAddRegulation: (smallId: string, type: 'fixed' | 'semi' | 'optional') => void;
  onDeleteRegulation: (id: string) => void;
  onGenerateGuideline: (rules: Regulation[], categoryInfo: any, comment: string) => void;
  activeType: string;
}

export function ListView({
  data,
  onUpdateRegulation,
  onAddRegulation,
  onDeleteRegulation,
  onGenerateGuideline,
  onToggleSelect,
  selectedIds,
  activeType,
  actionMode
}: ListViewProps) {
  const [activeLargeId, setActiveLargeId] = useState<string | null>(null);
  const [activeMediumId, setActiveMediumId] = useState<string | null>(null);
  const [activeSmallId, setActiveSmallId] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    const firstLarge = data[activeType]?.[0];
    const firstMedium = firstLarge?.mediumCategories[0];
    const firstSmall = firstMedium?.smallCategories[0];

    setActiveLargeId(firstLarge?.id || null);
    setActiveMediumId(firstMedium?.id || null);
    setActiveSmallId(firstSmall?.id || null);
  }, [activeType, data]);

  const currentTypeData = data[activeType] || [];
  const activeLarge = currentTypeData.find(l => l.id === activeLargeId);
  const activeMedium = activeLarge?.mediumCategories.find(m => m.id === activeMediumId);
  const activeSmall = activeMedium?.smallCategories.find(s => s.id === activeSmallId);

  const fixedRules = activeSmall?.regulations?.filter(r => r.type === 'fixed') || [];
  const semiRules = activeSmall?.regulations?.filter(r => r.type === 'semi') || [];
  const optionalRules = activeSmall?.regulations?.filter(r => r.type === 'optional') || [];

  // Create mock special rules column purely for UI, not persistent in this simple demo
  const [specialRules, setSpecialRules] = useState<Regulation[]>([]);

  useEffect(() => {
    if (activeSmall) {
      setSpecialRules([
        {
          id: `spec-${activeSmall.id}-1`,
          title: `${activeSmall.name} 분야 특이 규정`,
          type: 'fixed' as RegulationType,
          content: '해당 분야에만 국한되어 적용되는 예외적 고정 지침입니다.',
          lastUpdated: '2026-03-11',
          options: [{ id: 'opt-1', label: '특수성 인정', type: 'toggle', value: true }]
        }
      ]);
    }
  }, [activeSmall]);

  return (
    <div className="flex flex-col h-full bg-[#F4F5F7] overflow-hidden p-3 gap-3">

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden shrink-0">
        <div className="grid grid-cols-3 divide-x divide-gray-100 h-[100px]">
          <CategoryNavColumn title="대분류 (Field)" items={currentTypeData} activeId={activeLargeId} onSelect={(id) => {
            setActiveLargeId(id);
            const firstMedium = currentTypeData.find(l => l.id === id)?.mediumCategories[0];
            setActiveMediumId(firstMedium?.id || null);
            setActiveSmallId(firstMedium?.smallCategories[0]?.id || null);
          }} />
          <CategoryNavColumn title="중분류 (Scope)" items={activeLarge?.mediumCategories || []} activeId={activeMediumId} onSelect={(id) => {
            setActiveMediumId(id);
            setActiveSmallId(activeLarge?.mediumCategories.find(m => m.id === id)?.smallCategories[0]?.id || null);
          }} />
          <CategoryNavColumn title="소분류 (Target)" items={activeMedium?.smallCategories || []} activeId={activeSmallId} onSelect={setActiveSmallId} />
        </div>

        <div className="px-4 py-2 bg-white flex items-center justify-between border-t border-gray-100">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-[9px] font-black text-gray-400 hover:text-blue-600 flex items-center gap-1.5 transition-all uppercase tracking-tighter"
            >
              {isExpanded ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
              {isExpanded ? '모든 카드 접기' : '모든 카드 펼치기'}
            </button>
            <div className="h-2 w-px bg-gray-200" />
            <div className="flex items-center gap-2">
               <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Selected:</span>
               <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 shadow-sm">{activeSmall?.name || 'Selection Required'}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1 max-w-xs">
              <input
                type="text"
                placeholder="지시 코멘트 추가... (예: 기한 엄수 요망)"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded text-[10px] font-bold focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1 text-[9px] font-black text-gray-400 hover:text-gray-900 flex items-center gap-1.5 transition-colors uppercase tracking-widest">
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
              <button
                onClick={() => {
                  const selectedRules = [...fixedRules, ...semiRules, ...optionalRules].filter(r => selectedIds.has(r.id));
                  if (selectedRules.length === 0) {
                    toast.error('선택된 규정이 없습니다. 체크박스를 확인해주세요.');
                    return;
                  }
                  onGenerateGuideline(selectedRules, {
                    large: activeLarge?.name,
                    medium: activeMedium?.name,
                    small: activeSmall?.name
                  }, comment);
                }}
                className="px-4 py-1.5 bg-blue-600 text-white text-[9px] font-black rounded flex items-center gap-1.5 hover:bg-blue-700 transition-all active:scale-95 uppercase tracking-widest shadow-sm shadow-blue-100"
              >
                <FileCheck2 className="w-3 h-3" /> 지시서 발행 (Generate)
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-16">
        <AnimatePresence mode="wait">
          {activeSmall ? (
            <motion.div
              key={activeSmall.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="h-full"
            >
              <div className="grid grid-cols-4 gap-3 h-full items-start">
                <RuleStageColumn
                   title="규정 (Fixed)"
                   emoji="🔒"
                   desc="변경 불가, 고정 규칙"
                   rules={fixedRules}
                   prefix="A"
                   isExpanded={isExpanded}
                   onUpdate={onUpdateRegulation}
                   onAdd={() => onAddRegulation(activeSmall.id, 'fixed')}
                   onDelete={onDeleteRegulation}
                   onToggleSelect={onToggleSelect}
                   selectedIds={selectedIds}
                   actionMode={actionMode}
                   color="border-red-100"
                />

                <RuleStageColumn
                   title="준규정 (Semi)"
                   emoji="⚖️"
                   desc="조건부 변경 가능"
                   rules={semiRules}
                   prefix="B"
                   isExpanded={isExpanded}
                   onUpdate={onUpdateRegulation}
                   onAdd={() => onAddRegulation(activeSmall.id, 'semi')}
                   onDelete={onDeleteRegulation}
                   onToggleSelect={onToggleSelect}
                   selectedIds={selectedIds}
                   actionMode={actionMode}
                   color="border-amber-100"
                />

                <RuleStageColumn
                   title="선택규정 (Opt)"
                   emoji="✨"
                   desc="필수 아님, 공란 가능"
                   rules={optionalRules}
                   prefix="C"
                   isExpanded={isExpanded}
                   onUpdate={onUpdateRegulation}
                   onAdd={() => onAddRegulation(activeSmall.id, 'optional')}
                   onDelete={onDeleteRegulation}
                   onToggleSelect={onToggleSelect}
                   selectedIds={selectedIds}
                   actionMode={actionMode}
                   color="border-emerald-100"
                />

                <RuleStageColumn
                   title="분야별 특이규정 (Spec)"
                   emoji="⚡"
                   desc="해당 분야 전용 지침"
                   rules={specialRules}
                   prefix="D"
                   isExpanded={isExpanded}
                   onUpdate={() => {}} // Non-persistent in demo
                   onAdd={() => toast.info('특이규정 추가는 관리자 전용 기능입니다.')}
                   onDelete={() => {}}
                   onToggleSelect={onToggleSelect}
                   selectedIds={selectedIds}
                   actionMode={actionMode}
                   color="border-blue-100"
                />
              </div>
            </motion.div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-300 gap-4 opacity-30 py-12">
              <Search className="w-10 h-10" />
              <div className="text-center space-y-1">
                <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Selection Required</p>
                <p className="text-[10px] font-bold text-gray-300">왼쪽 메뉴와 상단 분류를 통해 규정을 선택하세요.</p>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function CategoryNavColumn({ title, items, activeId, onSelect }: { title: string, items: any[], activeId: string | null, onSelect: (id: string) => void }) {
  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      <div className="bg-gray-50 border-b border-gray-100 text-gray-500 px-3 py-1.5 flex items-center justify-between">
        <span className="text-[9px] font-black uppercase tracking-widest leading-none">{title}</span>
        <button className="text-gray-400 hover:text-gray-900 transition-colors">
          <MoreVertical className="w-3 h-3" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto no-scrollbar p-1.5 space-y-0.5">
        {items.map((item: any) => (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            className={clsx(
              "w-full text-left px-3 py-1.5 rounded-md text-[10px] font-black transition-all flex items-center justify-between group",
              activeId === item.id ? "bg-blue-50 text-blue-700 shadow-sm border border-blue-100/50" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
            )}
          >
            <span className="truncate flex items-center gap-2">
               <span className={clsx("transition-transform", activeId === item.id ? "grayscale-0" : "grayscale opacity-50")}>{item.emoji}</span>
               {item.name}
            </span>
            {activeId === item.id && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />}
          </button>
        ))}
      </div>
    </div>
  );
}

function RuleStageColumn({ title, emoji, desc, rules, prefix, isExpanded, onUpdate, onAdd, onDelete, onToggleSelect, selectedIds, actionMode, color }: {
  title: string,
  emoji: string,
  desc: string,
  rules: Regulation[],
  prefix: string,
  isExpanded: boolean,
  onUpdate: (reg: Regulation) => void,
  onAdd: () => void,
  onDelete: (id: string) => void,
  onToggleSelect: (id: string) => void,
  selectedIds: Set<string>,
  actionMode: string,
  color: string
}) {
  return (
    <div className="flex flex-col gap-3 min-w-0">
       <div className={clsx("bg-white rounded-xl border p-3 shadow-sm", color)}>
          <div className="flex items-center gap-2.5 mb-1">
             <span className="text-lg">{emoji}</span>
             <h3 className="text-[11px] font-black text-gray-900 uppercase tracking-widest">{title}</h3>
          </div>
          <p className="text-[9px] font-bold text-gray-400 pl-7">{desc}</p>
       </div>
       <div className="space-y-3">
          {rules.length > 0 ? (
            rules.map((reg, idx) => (
              <RegulationBox
                key={`${reg.id}-${idx}`}
                regulation={reg}
                isExpanded={isExpanded}
                prefix={`${prefix}-${idx + 1}`}
                onUpdate={onUpdate}
                onDelete={onDelete}
                onToggleSelect={onToggleSelect}
                isSelected={selectedIds.has(reg.id)}
                actionMode={actionMode}
              />
            ))
          ) : (
            <div className="bg-white/40 border-2 border-dashed border-gray-100 rounded-xl h-40 flex flex-col items-center justify-center text-gray-300 gap-2 opacity-50">
               <PlusCircle className="w-5 h-5" />
               <span className="text-[8px] font-black uppercase tracking-widest">입력 대기중</span>
            </div>
          )}

          {actionMode !== 'view' && actionMode !== 'delete' && (
            <button
              onClick={onAdd}
              className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-300 hover:text-blue-500 hover:border-blue-100 transition-all flex flex-col items-center gap-1 group bg-white/50"
            >
               <PlusCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
               <span className="text-[8px] font-black uppercase tracking-widest">항목 추가 (Add Item)</span>
            </button>
          )}
       </div>
    </div>
  );
}

function RegulationBox({ regulation, isExpanded, prefix, onUpdate, onDelete, onToggleSelect, isSelected, actionMode }: {
  regulation: Regulation,
  isExpanded: boolean,
  prefix: string,
  onUpdate: (reg: Regulation) => void,
  onDelete: (id: string) => void,
  onToggleSelect: (id: string) => void,
  isSelected: boolean,
  actionMode: string
}) {
  const [collapsed, setCollapsed] = useState(!isExpanded);
  const [showNotes, setShowNotes] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [scope, setScope] = useState<number>(0);
  const [subDirectives, setSubDirectives] = useState(regulation.subDirectives || []);
  const [showSubEditor, setShowSubEditor] = useState(false);

  useEffect(() => {
    setCollapsed(!isExpanded);
  }, [isExpanded]);

  const addSubDirective = (type: RegulationType) => {
    const newSub = { id: `sd-${Date.now()}`, type, content: '' };
    const updated = [...subDirectives, newSub];
    setSubDirectives(updated);
    onUpdate({ ...regulation, subDirectives: updated });
    setShowSubEditor(false);
  };

  const updateSubDirective = (id: string, content: string) => {
    const updated = subDirectives.map(sd => sd.id === id ? { ...sd, content } : sd);
    setSubDirectives(updated);
    onUpdate({ ...regulation, subDirectives: updated });
  };

  const deleteSubDirective = (id: string) => {
    const updated = subDirectives.filter(sd => sd.id !== id);
    setSubDirectives(updated);
    onUpdate({ ...regulation, subDirectives: updated });
  };

  const typeColor = {
    fixed: 'bg-red-500',
    semi: 'bg-amber-500',
    optional: 'bg-emerald-500'
  };

  const isViewMode = actionMode === 'view';
  const isDeleteMode = actionMode === 'delete';

  return (
    <div className={clsx(
      "bg-white rounded-xl border overflow-hidden shadow-sm flex flex-col h-fit group transition-all",
      isSelected ? "border-blue-400 ring-2 ring-blue-500/10" : "border-gray-200",
      isDeleteMode ? "hover:border-red-400 hover:shadow-red-50/50" : "hover:shadow-md hover:border-blue-100"
    )}>
      <div className="bg-white p-3 flex items-center justify-between transition-colors border-b border-gray-50">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div className="flex items-center gap-2 shrink-0">
             <input
               type="checkbox"
               checked={isSelected}
               onChange={() => onToggleSelect(regulation.id)}
               className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
             />
             <div className={clsx("w-5 h-5 rounded flex items-center justify-center text-[10px] font-black text-white shadow-sm shrink-0", typeColor[regulation.type] || 'bg-blue-500')}>
               {prefix}
             </div>
          </div>
          <div className="space-y-0.5 overflow-hidden flex-1">
            <input
              disabled={isViewMode}
              value={regulation.title}
              onChange={(e) => onUpdate({ ...regulation, title: e.target.value })}
              className="text-[11px] font-black text-gray-800 tracking-tight leading-none truncate w-full bg-transparent border-none focus:ring-0 p-0"
            />
            <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">{regulation.lastUpdated}</p>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {isDeleteMode ? (
            <button
              onClick={() => onDelete(regulation.id)}
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-50 transition-all text-gray-400 hover:text-blue-600"
            >
              {collapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {!collapsed && !isDeleteMode && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 space-y-5">
              {/* (2) On/Off Toggle */}
              <div className="space-y-3">
                 <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">적용 활성화 (ON/OFF)</span>
                    <OnOFFToggle value={isActive} onChange={setIsActive} />
                 </div>
                 {/* (3) Content Input */}
                 <div className="space-y-1.5">
                   <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">규정 상세 기재</span>
                   <textarea
                      disabled={isViewMode}
                      value={regulation.content}
                      onChange={(e) => onUpdate({...regulation, content: e.target.value})}
                      className="w-full text-[10px] font-bold text-gray-700 bg-gray-50 border border-gray-100 focus:border-blue-200 focus:bg-white focus:ring-4 focus:ring-blue-500/5 rounded-lg p-3 min-h-[60px] resize-none transition-all placeholder:text-gray-300 disabled:opacity-70 disabled:cursor-not-allowed"
                      placeholder="내용을 입력하세요..."
                   />
                 </div>
              </div>

              {/* (5) 4지선다 객관식 체크용 */}
              <div className="space-y-2">
                 <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">적용 범위 설정 (4지선다)</span>
                 <div className="grid grid-cols-2 gap-1.5">
                    {['전사', '부서', '직군', '예외'].map((opt, i) => (
                      <button
                         key={opt}
                         disabled={isViewMode}
                         onClick={() => setScope(i)}
                         className={clsx(
                           "px-2.5 py-1.5 rounded-lg text-[9px] font-bold border transition-all flex items-center gap-2",
                           scope === i ? "bg-blue-50 border-blue-200 text-blue-700 shadow-sm" : "bg-white border-gray-100 text-gray-500 hover:border-gray-200"
                         )}
                      >
                         <div className={clsx("w-2 h-2 rounded-full border", scope === i ? "bg-blue-500 border-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.3)]" : "bg-gray-100 border-gray-200")} />
                         {opt}
                      </button>
                    ))}
                 </div>
              </div>

              {/* (4) 특이사항 추가 기재란 */}
              <div className="space-y-2 pt-2 border-t border-gray-50">
                 {!showNotes ? (
                   <button
                      disabled={isViewMode}
                      onClick={() => setShowNotes(true)}
                      className="w-full py-2 border-2 border-dashed border-gray-100 rounded-lg text-[9px] font-black text-gray-300 hover:text-blue-500 hover:border-blue-100 transition-all flex items-center justify-center gap-2"
                   >
                      <PlusCircle className="w-3 h-3" /> 특이사항 추가 (Selectable)
                   </button>
                 ) : (
                   <div className="space-y-1.5 animate-in fade-in slide-in-from-top-1">
                      <div className="flex items-center justify-between">
                         <span className="text-[9px] font-black text-red-400 uppercase tracking-widest">특이사항 (Added)</span>
                         <button onClick={() => setShowNotes(false)} className="text-[9px] font-black text-gray-300 hover:text-gray-600 transition-colors">제거</button>
                      </div>
                      <textarea
                        disabled={isViewMode}
                        className="w-full text-[10px] font-bold text-amber-700 bg-amber-50/30 border border-amber-100 rounded-lg p-2 min-h-[40px] resize-none focus:ring-2 focus:ring-amber-200 transition-all"
                        placeholder="특이사항 기재..."
                      />
                   </div>
                 )}
              </div>

              {/* (11) 하위 규정 펼쳐보기 */}
              <div className="pt-2 border-t border-gray-50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">하위 세부 지침 (Sub-Directives)</span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => addSubDirective('fixed')}
                      className="w-5 h-5 rounded bg-red-50 text-red-500 border border-red-100 flex items-center justify-center hover:bg-red-100 transition-all"
                      title="필수 지침 추가"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => addSubDirective('semi')}
                      className="w-5 h-5 rounded bg-amber-50 text-amber-500 border border-amber-100 flex items-center justify-center hover:bg-amber-100 transition-all"
                      title="준규정 지침 추가"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => addSubDirective('optional')}
                      className="w-5 h-5 rounded bg-emerald-50 text-emerald-500 border border-emerald-100 flex items-center justify-center hover:bg-emerald-100 transition-all"
                      title="선택 지침 추가"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  {subDirectives.map((sd) => (
                    <div key={sd.id} className="flex items-start gap-2 group/sd">
                      <div className={clsx(
                        "w-1 h-full min-h-[24px] rounded-full shrink-0 mt-1",
                        sd.type === 'fixed' ? 'bg-red-400' : sd.type === 'semi' ? 'bg-amber-400' : 'bg-emerald-400'
                      )} />
                      <input
                        value={sd.content}
                        onChange={(e) => updateSubDirective(sd.id, e.target.value)}
                        placeholder={`${sd.type.toUpperCase()} 지침 입력...`}
                        className="flex-1 bg-transparent text-[10px] font-bold text-gray-600 focus:outline-none border-b border-transparent focus:border-gray-200 py-0.5"
                      />
                      <button
                        onClick={() => deleteSubDirective(sd.id)}
                        className="opacity-0 group-hover/sd:opacity-100 text-gray-300 hover:text-red-500 transition-all"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {subDirectives.length === 0 && (
                    <p className="text-[9px] font-bold text-gray-300 text-center py-2 italic">등록된 하위 지침이 없습니다.</p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
