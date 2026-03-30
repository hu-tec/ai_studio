import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Save, FileDown } from 'lucide-react';
import { AIDetailModal } from './AIDetailModal';
import type { DailyLog, TimeSlotEntry, AIDetail, Position } from './data';
import { homepageCategories, departmentCategories, positions, currentEmployee, employees, createEmptyTimeSlots } from './data';
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

  useEffect(() => {
    if (log) {
      setPosition(log.position || emp.position);
      setHpCategories(log.homepageCategories);
      setDeptCategories(log.departmentCategories);
      setTimeInterval(log.timeInterval);
      setTimeSlots(log.timeSlots);
      setDetail(log.detail || '');
    } else {
      setPosition(emp.position);
      setHpCategories([]);
      setDeptCategories([]);
      setTimeInterval('1hour');
      setTimeSlots(createEmptyTimeSlots('1hour'));
      setDetail('');
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

  const updateSlot = (index: number, field: keyof TimeSlotEntry, value: string) => {
    setTimeSlots(prev => prev.map((s, i) => i === index ? { ...s, [field]: value } : s));
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

  const handleSave = () => {
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
    };
    const filledTitles = timeSlots.filter(s => s.title).map(s => s.title);
    newLog.summary = filledTitles.length > 0
      ? `${emp.name} - ${filledTitles.slice(0, 3).join(', ')}${filledTitles.length > 3 ? ' 외' : ''}`
      : '';
    onSave(newLog);
    toast.success('저장되었습니다.');
  };

  const handleExport = () => {
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
    };
    const filledTitles = timeSlots.filter(s => s.title).map(s => s.title);
    newLog.summary = filledTitles.length > 0
      ? `${emp.name} - ${filledTitles.slice(0, 3).join(', ')}${filledTitles.length > 3 ? ' 외' : ''}`
      : '';
    exportDailyLogToWord(newLog, date);
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

      <div className="p-3 space-y-3">

        {/* ① 직급 */}
        <div>
          <label className="block mb-1 text-muted-foreground">① 직급</label>
          <div className="flex flex-wrap gap-1">
            {positions.map(pos => (
              <button
                key={pos}
                onClick={() => setPosition(pos)}
                className={`px-2.5 py-1 rounded border transition-colors ${
                  position === pos
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border hover:bg-accent'
                }`}
              >
                {pos}
              </button>
            ))}
          </div>
        </div>

        {/* ② 작성 정보 */}
        <div>
          <label className="block mb-1 text-muted-foreground">② 작성 정보</label>
          <div className="border border-border rounded overflow-hidden">
            <div className="grid grid-cols-2 md:grid-cols-4">
              <div className="border-r border-b md:border-b-0 border-border">
                <div className="bg-accent/40 px-2 py-1 text-muted-foreground border-b border-border">작성일자</div>
                <div className="px-2 py-1">{format(date, 'yyyy-MM-dd (EEE)', { locale: ko })}</div>
              </div>
              <div className="border-b md:border-b-0 md:border-r border-border">
                <div className="bg-accent/40 px-2 py-1 text-muted-foreground border-b border-border">작성자</div>
                <div className="px-2 py-1">{emp.name}</div>
              </div>
              <div className="border-r border-border">
                <div className="bg-accent/40 px-2 py-1 text-muted-foreground border-b border-border">부서</div>
                <div className="px-2 py-1">{emp.department}</div>
              </div>
              <div>
                <div className="bg-accent/40 px-2 py-1 text-muted-foreground border-b border-border">직무직급</div>
                <div className="px-2 py-1">{position}</div>
              </div>
            </div>
          </div>
        </div>

        {/* ③ 홈페이지 */}
        <div>
          <label className="block mb-1 text-muted-foreground">③ 홈페이지</label>
          <div className="border border-border rounded overflow-hidden">
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7">
              {homepageCategories.map(cat => {
                const checked = hpCategories.includes(cat);
                return (
                  <label
                    key={cat}
                    className={`flex items-center gap-1.5 px-2 py-1.5 border-r border-b border-border cursor-pointer transition-colors hover:bg-accent/30 text-xs ${
                      checked ? 'bg-primary/5' : ''
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleCheckbox(hpCategories, setHpCategories, cat)}
                      className="w-3 h-3 rounded border-border accent-[var(--color-primary)]"
                    />
                    <span className={checked ? 'text-primary' : ''}>{cat}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* ④ 부서 */}
        <div>
          <label className="block mb-1 text-muted-foreground">④ 부서</label>
          <div className="border border-border rounded overflow-hidden">
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7">
              {departmentCategories.map(cat => {
                const checked = deptCategories.includes(cat);
                return (
                  <label
                    key={cat}
                    className={`flex items-center gap-1.5 px-2 py-1.5 border-r border-b border-border cursor-pointer transition-colors hover:bg-accent/30 text-xs ${
                      checked ? 'bg-primary/5' : ''
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleCheckbox(deptCategories, setDeptCategories, cat)}
                      className="w-3 h-3 rounded border-border accent-[var(--color-primary)]"
                    />
                    <span className={checked ? 'text-primary' : ''}>{cat}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* ⑤ 시간 간격 */}
        <div>
          <label className="block mb-1 text-muted-foreground">⑤ 입력 간격</label>
          <div className="flex gap-1">
            {([
              { value: '30min', label: '30분' },
              { value: '1hour', label: '1시간' },
              { value: 'half-day', label: '오전/오후' },
            ] as const).map(opt => (
              <button
                key={opt.value}
                onClick={() => handleIntervalChange(opt.value)}
                className={`px-2.5 py-1 rounded border transition-colors ${
                  timeInterval === opt.value
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border hover:bg-accent'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* ⑥ 시간대별 업무 일지 */}
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
          {timeSlots.map((slot, index) => (
            <div
              key={slot.id}
              className="border-b border-border last:border-b-0"
            >
              {/* Main row */}
              <div className="md:grid md:grid-cols-[100px_1fr_1fr_90px_4px_1fr] flex flex-col">
                <div className="px-2 py-1.5 md:border-r border-border bg-accent/20 flex items-center">
                  <span className="text-muted-foreground">{slot.timeSlot}</span>
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
          ))}
        </div>

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