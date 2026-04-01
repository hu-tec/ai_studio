import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Save, FileDown, List, Target, Grid2x2 } from 'lucide-react';
import { AIDetailModal } from './AIDetailModal';
import { FranklinView } from './FranklinView';
import { EisenhowerView } from './EisenhowerView';
import type { DailyLog, TimeSlotEntry, AIDetail, Position, ViewMode, FranklinTask } from './data';
import { homepageCategories, departmentCategories, positions, currentEmployee, employees, createEmptyTimeSlots, createEmptyFranklinTasks, syncFranklinToSlots, syncSlotToFranklin, FRANKLIN_STATUS_CONFIG, FRANKLIN_PRIORITY_CONFIG } from './data';
import { exportDailyLogToWord } from './exportWord';
import { toast } from 'sonner';

interface DailyDetailProps {
  date: Date;
  log: DailyLog | undefined;
  onSave: (log: DailyLog) => void;
}

export function DailyDetail({ date, log, onSave }: DailyDetailProps) {
  const dateStr = format(date, 'yyyy-MM-dd');
  const emp = employees.find(e => e.id === currentEmployee.id) || currentEmployee;

  const [position, setPosition] = useState<Position>(emp.position);
  const [hpCategories, setHpCategories] = useState<string[]>([]);
  const [deptCategories, setDeptCategories] = useState<string[]>([]);
  const [timeInterval, setTimeInterval] = useState<'30min' | '1hour' | 'half-day'>('1hour');
  const [timeSlots, setTimeSlots] = useState<TimeSlotEntry[]>([]);
  const [detail, setDetail] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [activeSlotIndex, setActiveSlotIndex] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('classic');
  const [franklinTasks, setFranklinTasks] = useState<FranklinTask[]>([]);

  useEffect(() => {
    if (log) {
      setPosition(log.position || emp.position);
      setHpCategories(log.homepageCategories);
      setDeptCategories(log.departmentCategories);
      setTimeInterval(log.timeInterval);
      setTimeSlots(log.timeSlots);
      setDetail(log.detail || '');
      setViewMode(log.viewMode || 'classic');
      setFranklinTasks(log.franklinTasks || []);
    } else {
      setPosition(emp.position);
      setHpCategories([]);
      setDeptCategories([]);
      setTimeInterval('1hour');
      setTimeSlots(createEmptyTimeSlots('1hour'));
      setDetail('');
      setViewMode('classic');
      setFranklinTasks([]);
    }
  }, [dateStr, log]);

  const handleIntervalChange = useCallback((newInterval: '30min' | '1hour' | 'half-day') => {
    setTimeSlots(prev => {
      const filledSlots = prev.filter(s => s.title || s.content || s.planned || s.aiDetail);
      if (filledSlots.length === 0) {
        return createEmptyTimeSlots(newInterval);
      }
      const newSlots = createEmptyTimeSlots(newInterval);
      // 기존 작성 데이터를 시간대 기준으로 매핑
      for (const filled of filledSlots) {
        const oldStart = filled.timeSlot.split('~')[0]?.trim().split(':').map(Number);
        if (!oldStart || oldStart.length < 2) continue;
        const oldMinutes = oldStart[0] * 60 + oldStart[1];
        // 가장 가까운 새 슬롯 찾기
        let bestIdx = 0, bestDist = Infinity;
        for (let i = 0; i < newSlots.length; i++) {
          const ns = newSlots[i].timeSlot.split('~')[0]?.trim().split(':').map(Number);
          if (!ns || ns.length < 2) continue;
          const dist = Math.abs((ns[0] * 60 + ns[1]) - oldMinutes);
          if (dist < bestDist) { bestDist = dist; bestIdx = i; }
        }
        newSlots[bestIdx] = { ...newSlots[bestIdx], title: filled.title, content: filled.content, planned: filled.planned, aiDetail: filled.aiDetail };
      }
      return newSlots;
    });
    setTimeInterval(newInterval);
  }, []);

  // Franklin → TimeSlots 정방향 동기화 핸들러
  const handleFranklinTasksChange = useCallback((newTasks: FranklinTask[]) => {
    setFranklinTasks(prev => {
      // 동기화: 연결된 과업 변경 → 타임슬롯 자동 반영
      setTimeSlots(slots => syncFranklinToSlots(newTasks, slots, prev));
      return newTasks;
    });
  }, []);

  const updateSlot = (index: number, field: keyof TimeSlotEntry, value: string) => {
    setTimeSlots(prev => prev.map((s, i) => i === index ? { ...s, [field]: value } : s));
    // Classic → Franklin 역방향 동기화: 연결된 과업 자동 업데이트
    const slotId = timeSlots[index]?.id;
    if (slotId) {
      setFranklinTasks(prev => syncSlotToFranklin(prev, slotId, field, value));
    }
  };

  const openModal = (index: number) => {
    setActiveSlotIndex(index);
    setModalOpen(true);
  };

  const handleAISave = (aiData: AIDetail) => {
    if (activeSlotIndex === null) return;
    setTimeSlots(prev =>
      prev.map((s, i) => i === activeSlotIndex ? { ...s, aiDetail: aiData } : s)
    );
  };

  const toggleCheckbox = (
    list: string[],
    setList: (v: string[]) => void,
    item: string
  ) => {
    if (list.includes(item)) {
      setList(list.filter(s => s !== item));
    } else {
      setList([...list, item]);
    }
  };

  const buildLog = (): DailyLog => {
    const newLog: DailyLog = {
      date: dateStr,
      summary: '',
      position,
      homepageCategories: hpCategories,
      departmentCategories: deptCategories,
      timeInterval,
      timeSlots,
      employeeId: currentEmployee.id,
      detail,
      viewMode,
      franklinTasks,
    };
    const filledTitles = viewMode === 'franklin'
      ? franklinTasks.filter(t => t.task).map(t => `${t.priority}${t.number} ${t.task}`)
      : timeSlots.filter(s => s.title).map(s => s.title);
    newLog.summary = filledTitles.length > 0
      ? `${emp.name} - ${filledTitles.slice(0, 3).join(', ')}${filledTitles.length > 3 ? ' 외' : ''}`
      : '';
    return newLog;
  };

  const handleSave = () => {
    onSave(buildLog());
    toast.success('저장되었습니다.');
  };

  const handleExport = () => {
    exportDailyLogToWord(buildLog(), date);
    toast.success('워드 파일로 내보내졌습니다.');
  };

  return (
    <div className="bg-card rounded border border-border overflow-hidden">
      {/* Header */}
      <div className="px-3 py-2 border-b border-border bg-accent/20 flex items-center justify-between">
        <span>{format(date, 'yyyy.M.d (EEE)', { locale: ko })} 업무일지</span>
        <div className="flex items-center gap-1">
          <button
            onClick={handleSave}
            className="flex items-center gap-1 px-2.5 py-1 bg-primary text-primary-foreground rounded hover:opacity-90"
          >
            <Save className="w-3.5 h-3.5" />
            저장
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-1 px-2.5 py-1 bg-primary text-primary-foreground rounded hover:opacity-90"
          >
            <FileDown className="w-3.5 h-3.5" />
            내보내기
          </button>
        </div>
      </div>

      <div className="p-3 space-y-2">

        {/* Compact toolbar: ①직급 + ②정보 + ③홈피 + ④부서 + ⑤간격 + 모드 */}
        <div className="space-y-1.5 bg-accent/10 rounded-lg p-2">

          {/* Row 1: 작성정보 + 직급 */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-[10px] font-bold text-muted-foreground w-10 shrink-0">② 정보</span>
            <div className="flex items-center gap-1 text-xs">
              <span className="px-2 py-0.5 bg-background border border-border rounded">{format(date, 'MM/dd (EEE)', { locale: ko })}</span>
              <span className="px-2 py-0.5 bg-background border border-border rounded">{emp.name}</span>
              <span className="px-2 py-0.5 bg-background border border-border rounded">{emp.department}</span>
            </div>
            <div className="w-px h-5 bg-border" />
            <span className="text-[10px] font-bold text-muted-foreground shrink-0">① 직급</span>
            <div className="flex gap-0.5">
              {positions.map(pos => (
                <button
                  key={pos}
                  onClick={() => setPosition(pos)}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                    position === pos
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                  }`}
                >
                  {pos}
                </button>
              ))}
            </div>
          </div>

          {/* Row 2: 홈페이지 */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-[10px] font-bold text-muted-foreground w-10 shrink-0">③ 홈피</span>
            <div className="flex gap-0.5 flex-wrap">
              {homepageCategories.map(cat => {
                const checked = hpCategories.includes(cat);
                return (
                  <button
                    key={cat}
                    onClick={() => toggleCheckbox(hpCategories, setHpCategories, cat)}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                      checked
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Row 3: 부서 */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-[10px] font-bold text-muted-foreground w-10 shrink-0">④ 부서</span>
            <div className="flex gap-0.5 flex-wrap">
              {departmentCategories.map(cat => {
                const checked = deptCategories.includes(cat);
                return (
                  <button
                    key={cat}
                    onClick={() => toggleCheckbox(deptCategories, setDeptCategories, cat)}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                      checked
                        ? 'bg-violet-600 text-white shadow-sm'
                        : 'bg-violet-50 text-violet-600 hover:bg-violet-100'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Row 4: 간격 + 모드 */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-[10px] font-bold text-muted-foreground w-10 shrink-0">⑤ 간격</span>
            <div className="flex gap-0.5">
              {([
                { value: '30min' as const, label: '30분' },
                { value: '1hour' as const, label: '1시간' },
                { value: 'half-day' as const, label: '오전·오후' },
              ]).map(opt => (
                <button
                  key={opt.value}
                  onClick={() => handleIntervalChange(opt.value)}
                  className={`px-2.5 py-0.5 rounded text-[11px] font-medium transition-all ${
                    timeInterval === opt.value
                      ? 'bg-orange-500 text-white shadow-sm'
                      : 'bg-orange-50 text-orange-600 hover:bg-orange-100'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <div className="w-px h-5 bg-border" />
            <span className="text-[10px] font-bold text-muted-foreground shrink-0">모드</span>
            <div className="flex gap-0.5">
              <button
                onClick={() => setViewMode('classic')}
                className={`flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-medium transition-all ${
                  viewMode === 'classic'
                    ? 'bg-slate-700 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <List className="w-3 h-3" />
                Classic
              </button>
              <button
                onClick={() => setViewMode('franklin')}
                className={`flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-medium transition-all ${
                  viewMode === 'franklin'
                    ? 'bg-slate-700 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Target className="w-3 h-3" />
                Franklin
              </button>
              <button
                onClick={() => setViewMode('eisenhower')}
                className={`flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-medium transition-all ${
                  viewMode === 'eisenhower'
                    ? 'bg-slate-700 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Grid2x2 className="w-3 h-3" />
                Eisenhower
              </button>
            </div>
          </div>
        </div>

        {/* ⑥ 업무 일지 — Classic / Franklin / Eisenhower */}
        {viewMode === 'eisenhower' ? (
          <EisenhowerView
            tasks={franklinTasks}
            timeSlots={timeSlots}
            onTasksChange={handleFranklinTasksChange}
            onSlotTitleChange={(idx, title) => updateSlot(idx, 'title', title)}
          />
        ) : viewMode === 'franklin' ? (
          <FranklinView
            tasks={franklinTasks}
            timeSlots={timeSlots}
            onTasksChange={handleFranklinTasksChange}
            onSlotTitleChange={(idx, title) => updateSlot(idx, 'title', title)}
          />
        ) : (
          <div className="border border-border rounded overflow-hidden">
            {/* Table Header */}
            <div className="hidden md:grid grid-cols-[100px_1fr_1fr_90px_4px_1fr] bg-accent/40 border-b border-border text-muted-foreground">
              <div className="px-2 py-1.5 border-r border-border">시간대</div>
              <div className="px-2 py-1.5 border-r border-border">제목</div>
              <div className="px-2 py-1.5 border-r border-border">업무 내용</div>
              <div className="px-2 py-1.5 border-r border-border text-center">AI 활용</div>
              <div className="bg-border" />
              <div className="px-2 py-1.5 bg-amber-50/60">예정 사항</div>
            </div>

            {/* Rows */}
            {timeSlots.map((slot, index) => {
              const linkedTask = franklinTasks.find(t => t.timeSlotId === slot.id);
              const pCfg = linkedTask ? FRANKLIN_PRIORITY_CONFIG[linkedTask.priority] : null;
              const stCfg = linkedTask ? FRANKLIN_STATUS_CONFIG[linkedTask.status] : null;
              return (
              <div
                key={slot.id}
                className="border-b border-border last:border-b-0"
              >
                {/* Main row */}
                <div className="md:grid md:grid-cols-[100px_1fr_1fr_90px_4px_1fr] flex flex-col">
                  <div className="px-2 py-1.5 md:border-r border-border bg-accent/20 flex items-center gap-1">
                    <span className="text-muted-foreground">{slot.timeSlot}</span>
                    {linkedTask && pCfg && stCfg && (
                      <span
                        className="text-[9px] font-bold px-1 rounded shrink-0"
                        style={{ background: pCfg.bg, color: pCfg.color }}
                        title={`${linkedTask.priority}${linkedTask.number} ${stCfg.label}`}
                      >
                        {linkedTask.priority}{linkedTask.number}{stCfg.icon}
                      </span>
                    )}
                  </div>
                  <div className="px-1 py-0.5 md:border-r border-border">
                    <input
                      type="text"
                      value={slot.title}
                      onChange={e => updateSlot(index, 'title', e.target.value)}
                      className="w-full bg-transparent border-none outline-none px-1 py-0.5"
                      placeholder="제목"
                    />
                  </div>
                  <div className="px-1 py-0.5 md:border-r border-border">
                    <input
                      type="text"
                      value={slot.content}
                      onChange={e => updateSlot(index, 'content', e.target.value)}
                      className="w-full bg-transparent border-none outline-none px-1 py-0.5"
                      placeholder="내용"
                    />
                  </div>
                  <div className="px-1 py-1 md:border-r border-border flex items-center justify-center">
                    <button
                      onClick={() => openModal(index)}
                      className={`px-1.5 py-0.5 rounded border w-full text-center transition-colors ${
                        slot.aiDetail
                          ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'
                          : 'border-border hover:bg-accent text-muted-foreground'
                      }`}
                    >
                      {slot.aiDetail ? 'AI 작성됨' : 'AI 작성'}
                    </button>
                  </div>
                  <div className="bg-border hidden md:block" />
                  <div className="px-1 py-0.5">
                    <input
                      type="text"
                      value={slot.planned}
                      onChange={e => updateSlot(index, 'planned', e.target.value)}
                      className="w-full bg-transparent border-none outline-none px-1 py-0.5"
                      placeholder="예정"
                    />
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        )}

        {/* ⑦ 세부 내용 */}
        <div>
          <label className="block mb-1 text-muted-foreground">⑦ 세부 내용</label>
          <textarea
            value={detail}
            onChange={e => setDetail(e.target.value)}
            className="w-full border border-border rounded px-2 py-1.5 bg-transparent outline-none resize-none min-h-[80px]"
            rows={4}
            placeholder="오늘 하루 업무에 대한 세부 내용을 입력하세요."
            onInput={e => {
              const t = e.target as HTMLTextAreaElement;
              t.style.height = 'auto';
              t.style.height = Math.max(80, t.scrollHeight) + 'px';
            }}
          />
        </div>
      </div>

      {/* AI Detail Modal */}
      <AIDetailModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        timeSlot={activeSlotIndex !== null ? timeSlots[activeSlotIndex]?.timeSlot || '' : ''}
        initialData={activeSlotIndex !== null ? timeSlots[activeSlotIndex]?.aiDetail : undefined}
        onSave={handleAISave}
      />
    </div>
  );
}