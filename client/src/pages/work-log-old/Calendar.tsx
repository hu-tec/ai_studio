import { useState, useRef, useEffect, useCallback } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { ko } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';
import type { DailyLog, TimeSlotEntry } from './data';
import { createEmptyTimeSlots, currentEmployee } from './data';

interface CalendarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  logs: DailyLog[];
  onUpdateLog: (log: DailyLog) => void;
  compact?: boolean;
  mode?: 'monthly' | 'daily';
}

export function Calendar({ selectedDate, onSelectDate, logs, onUpdateLog, compact = false, mode = 'monthly' }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(selectedDate));
  const [editingSlotId, setEditingSlotId] = useState<string | null>(null);

  // Sync currentMonth when selectedDate changes significantly (like different month)
  useEffect(() => {
    if (!isSameMonth(currentMonth, selectedDate)) {
      setCurrentMonth(startOfMonth(selectedDate));
    }
  }, [selectedDate]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const days: Date[] = [];
  let day = calStart;
  while (day <= calEnd) {
    days.push(day);
    day = addDays(day, 1);
  }

  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  const getLogForDate = (date: Date): DailyLog | undefined => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return logs.find(l => l.date === dateStr);
  };

  const ensureLog = (date: Date): DailyLog => {
    const existing = getLogForDate(date);
    if (existing) return existing;
    return {
      date: format(date, 'yyyy-MM-dd'),
      summary: '',
      detail: '',
      position: '신입',
      homepageCategories: [],
      departmentCategories: [],
      timeInterval: '1hour',
      timeSlots: createEmptyTimeSlots('1hour'),
      employeeId: currentEmployee.id,
    };
  };

  const handleSlotTitleChange = useCallback((date: Date, slotId: string, value: string) => {
    const log = ensureLog(date);
    const updatedSlots = log.timeSlots.map(s =>
      s.id === slotId ? { ...s, title: value } : s
    );
    onUpdateLog({ ...log, timeSlots: updatedSlots });
  }, [logs, onUpdateLog]);

  const handleSlotBlur = useCallback((date: Date, slotId: string, finalValue: string) => {
    if (slotId === editingSlotId) {
      setEditingSlotId(null);
    }
    handleSlotTitleChange(date, slotId, finalValue);
  }, [logs, onUpdateLog, editingSlotId, handleSlotTitleChange]);

  const handleAddSlot = (date: Date) => {
    const log = ensureLog(date);
    const emptySlot = log.timeSlots.find(s => !s.title.trim());
    if (emptySlot) {
      setEditingSlotId(emptySlot.id);
      if (!getLogForDate(date)) {
        onUpdateLog(log);
      }
    } else {
      onSelectDate(date);
    }
  };

  const handleClearSlot = (date: Date, slotId: string) => {
    const log = ensureLog(date);
    const updatedSlots = log.timeSlots.map(s =>
      s.id === slotId ? { ...s, title: '', content: '', planned: '', aiDetail: undefined } : s
    );
    onUpdateLog({ ...log, timeSlots: updatedSlots });
    if (slotId === editingSlotId) setEditingSlotId(null);
  };

  return (
    <div className="bg-card rounded border border-border overflow-hidden flex flex-col h-full max-h-[1200px]">
      {/* Month Navigation */}
      <div className="flex items-center justify-between px-2 py-1 bg-accent/30 border-b border-border shrink-0">
        <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-1 hover:bg-accent rounded transition-colors">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="flex flex-col items-center">
          <span className="text-sm font-bold">{format(currentMonth, 'yyyy년 M월', { locale: ko })}</span>
          <span className="text-[10px] text-muted-foreground">{mode === 'monthly' ? '달력 그리드' : '업무 리스트'}</span>
        </div>
        <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-1 hover:bg-accent rounded transition-colors">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {mode === 'monthly' ? (
        <>
          {/* Week Days Header */}
          <div className="grid grid-cols-7 border-b border-border shrink-0">
            {weekDays.map(wd => (
              <div key={wd} className="py-1 text-center text-[11px] font-medium text-muted-foreground border-r border-border last:border-r-0 bg-muted/20">
                {wd}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 flex-1 overflow-y-auto min-h-0">
            {days.map((d, i) => {
              const isCurrentMonth = isSameMonth(d, currentMonth);
              const isSelected = isSameDay(d, selectedDate);
              const isToday = isSameDay(d, new Date());
              const log = getLogForDate(d);
              const allSlots = log?.timeSlots || [];
              const filledSlots = allSlots.filter(ts => ts.title.trim());
              const displaySlots = allSlots.filter(ts => ts.title.trim() || ts.id === editingSlotId);

              // ── Compact mode: 미니 셀 ──
              if (compact) {
                return (
                  <div
                    key={i}
                    className={`h-11 border-r border-b border-border flex flex-col items-center justify-center cursor-pointer transition-all
                      ${!isCurrentMonth ? 'bg-muted/30' : 'hover:bg-accent/30'}
                      ${isSelected ? 'bg-primary/10 ring-1 ring-primary ring-inset z-10' : ''}
                      ${i % 7 === 6 ? 'border-r-0' : ''}
                    `}
                    onClick={() => onSelectDate(d)}
                  >
                    <span className={`text-[11px] leading-none mb-1 ${
                      isToday ? 'bg-primary text-primary-foreground w-5 h-5 flex items-center justify-center rounded-full font-bold' : ''
                    } ${!isCurrentMonth ? 'text-muted-foreground/40' : ''}`}>
                      {format(d, 'd')}
                    </span>
                    {isCurrentMonth && filledSlots.length > 0 && (
                      <div className="flex items-center gap-[2px]">
                        {filledSlots.slice(0, 3).map((_, idx) => (
                          <span key={idx} className="w-1 h-1 rounded-full bg-blue-500 shadow-sm" />
                        ))}
                        {filledSlots.length > 3 && <span className="text-[8px] text-blue-600 font-bold">+{filledSlots.length - 3}</span>}
                      </div>
                    )}
                  </div>
                );
              }

              // ── Full mode: 기존 셀 ──
              return (
                <div
                  key={i}
                  className={`min-h-[120px] border-r border-b border-border p-1 transition-all flex flex-col
                    ${!isCurrentMonth ? 'bg-muted/10' : ''}
                    ${isSelected ? 'bg-primary/5 ring-1 ring-primary ring-inset z-10' : ''}
                    ${i % 7 === 6 ? 'border-r-0' : ''}
                  `}
                >
                  {/* Date number row */}
                  <div
                    className="flex items-center justify-between mb-1 shrink-0 cursor-pointer hover:bg-accent/30 rounded px-1"
                    onClick={() => onSelectDate(d)}
                  >
                    <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-medium ${
                      isToday ? 'bg-primary text-primary-foreground shadow-sm' : ''
                    } ${!isCurrentMonth ? 'text-muted-foreground/30' : ''}`}>
                      {format(d, 'd')}
                    </span>
                    <div className="flex items-center gap-1">
                      {filledSlots.length > 0 && (
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full border border-blue-100">
                          {filledSlots.length}
                        </span>
                      )}
                      {isCurrentMonth && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleAddSlot(d); }}
                          className="w-5 h-5 flex items-center justify-center rounded hover:bg-accent text-muted-foreground hover:text-primary transition-colors"
                          title="업무 추가"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Mini slot table */}
                  {isCurrentMonth && displaySlots.length > 0 && (
                    <div className="flex-1 overflow-y-auto scrollbar-thin space-y-0.5">
                      {displaySlots.slice(0, 5).map((slot) => (
                        <CalendarSlotRow
                          key={slot.id}
                          slot={slot}
                          startEditing={slot.id === editingSlotId}
                          onTitleChange={(val) => handleSlotTitleChange(d, slot.id, val)}
                          onBlur={(val) => handleSlotBlur(d, slot.id, val)}
                          onClear={() => handleClearSlot(d, slot.id)}
                        />
                      ))}
                      {displaySlots.length > 5 && (
                        <div
                          className="px-1 py-[2px] text-[10px] text-muted-foreground text-center bg-accent/30 cursor-pointer hover:bg-accent/50 rounded"
                          onClick={() => onSelectDate(d)}
                        >
                          +{displaySlots.length - 5}건 더보기
                        </div>
                      )}
                    </div>
                  )}

                  {/* Empty state */}
                  {isCurrentMonth && displaySlots.length === 0 && (
                    <div
                      className="flex-1 flex items-center justify-center cursor-pointer hover:bg-accent/20 rounded border border-transparent hover:border-border/30"
                      onClick={() => onSelectDate(d)}
                    >
                      <span className="text-xs text-muted-foreground/10">-</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      ) : (
        /* Daily View: List View of the current month */
        <div className="flex-1 overflow-y-auto bg-muted/5 p-2 space-y-2">
          {days.filter(d => isSameMonth(d, currentMonth)).map((d, i) => {
            const isSelected = isSameDay(d, selectedDate);
            const isToday = isSameDay(d, new Date());
            const log = getLogForDate(d);
            const filledSlots = log?.timeSlots.filter(ts => ts.title.trim()) || [];
            
            return (
              <div
                key={i}
                onClick={() => onSelectDate(d)}
                className={`group flex items-start gap-1 p-1 rounded-lg border transition-all cursor-pointer ${
                  isSelected ? 'bg-white border-primary shadow-md ring-1 ring-primary' : 'bg-white border-border hover:border-primary/50 hover:shadow-sm'
                }`}
              >
                <div className={`shrink-0 w-12 flex flex-col items-center justify-center py-1 rounded-md ${
                  isToday ? 'bg-primary text-primary-foreground' : 'bg-muted/50 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'
                }`}>
                  <span className="text-[10px] font-bold uppercase leading-none mb-1">{format(d, 'eee', { locale: ko })}</span>
                  <span className="text-xs font-black leading-none">{format(d, 'd')}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-muted-foreground">{format(d, 'yyyy.MM.dd')}</span>
                    {filledSlots.length > 0 && (
                      <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                        {filledSlots.length}건
                      </span>
                    )}
                  </div>
                  <div className="space-y-1">
                    {filledSlots.length > 0 ? (
                      filledSlots.slice(0, 3).map(slot => (
                        <div key={slot.id} className="flex items-center gap-2 text-xs">
                          <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-blue-400" />
                          <span className="text-muted-foreground shrink-0 w-14 font-mono">[{slot.timeSlot.split(' ~ ')[0]}]</span>
                          <span className="truncate font-medium">{slot.title}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-[11px] text-muted-foreground/40 italic">작성된 업무가 없습니다.</p>
                    )}
                    {filledSlots.length > 3 && (
                      <p className="text-[10px] text-blue-500 font-semibold pl-1.5">+ {filledSlots.length - 3}건의 업무가 더 있습니다.</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function CalendarSlotRow({
  slot,
  startEditing,
  onTitleChange,
  onBlur,
  onClear,
}: {
  slot: TimeSlotEntry;
  startEditing?: boolean;
  onTitleChange: (val: string) => void;
  onBlur: (val: string) => void;
  onClear: () => void;
}) {
  const [isEditing, setIsEditing] = useState(!!startEditing);
  const [draft, setDraft] = useState(slot.title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setDraft(slot.title); }, [slot.title]);
  useEffect(() => { if (isEditing && inputRef.current) inputRef.current.focus(); }, [isEditing]);
  useEffect(() => {
    if (startEditing && !isEditing) {
      setIsEditing(true);
      setDraft(slot.title);
    }
  }, [startEditing]);

  const commit = () => {
    onBlur(draft);
    setIsEditing(false);
  };

  return (
    <div className="group/row flex items-stretch border-b border-border/40 last:border-b-0 relative">
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={e => {
            if (e.key === 'Enter') commit();
            if (e.key === 'Escape') { setDraft(slot.title); setIsEditing(false); }
          }}
          className="w-full bg-blue-50/60 text-sm px-1 py-[2px] outline-none border-none"
          placeholder="제목 입력"
          onClick={e => e.stopPropagation()}
        />
      ) : (
        <div
          className="px-1 py-[2px] text-sm truncate flex-1 cursor-text hover:bg-accent/40 transition-colors flex items-center gap-0.5"
          onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
          title={`${slot.timeSlot ? `[${slot.timeSlot}] ` : ''}${slot.title}`}
        >
          {slot.aiDetail && slot.aiDetail.aiTools.length > 0 && (
            <span className="w-1 h-1 rounded-full bg-blue-500 shrink-0" />
          )}
          <span className="truncate"><span className="text-muted-foreground mr-0.5">{slot.timeSlot?.split(' ~ ')[0]}</span>{slot.title || '(없음)'}</span>
        </div>
      )}
      <button
        className="absolute right-0 top-0 bottom-0 w-4 flex items-center justify-center opacity-0 group-hover/row:opacity-100 bg-red-50 hover:bg-red-100 transition-opacity"
        onClick={(e) => { e.stopPropagation(); onClear(); }}
        title="삭제"
      >
        <X className="w-2.5 h-2.5 text-red-500" />
      </button>
    </div>
  );
}