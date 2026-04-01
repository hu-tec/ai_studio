import { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { ko } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { employees } from './data';
import type { DailyLog, TimeSlotEntry } from './data';

interface AdminCalendarProps {
  filteredRows: {
    date: string;
    department: string;
    employeeName: string;
    timeSlot: string;
    title: string;
    content: string;
    aiTools: string[];
    log: DailyLog;
    slotEntry: TimeSlotEntry;
  }[];
  onViewDetail: (slot: TimeSlotEntry, timeSlot: string) => void;
}

const empColors: Record<string, { bg: string; text: string; dot: string }> = {
  emp1: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  emp2: { bg: 'bg-pink-50', text: 'text-pink-700', dot: 'bg-pink-500' },
  emp3: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  emp4: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  emp5: { bg: 'bg-purple-50', text: 'text-purple-700', dot: 'bg-purple-500' },
};

function getEmpColor(employeeId: string) {
  return empColors[employeeId] || { bg: 'bg-gray-50', text: 'text-gray-700', dot: 'bg-gray-500' };
}

export function AdminCalendar({ filteredRows, onViewDetail }: AdminCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));
  const [expandedCell, setExpandedCell] = useState<string | null>(null);

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

  const rowsByDate = useMemo(() => {
    const map: Record<string, typeof filteredRows> = {};
    for (const row of filteredRows) {
      if (!map[row.date]) map[row.date] = [];
      map[row.date].push(row);
    }
    return map;
  }, [filteredRows]);

  return (
    <div className="bg-card rounded border border-border overflow-hidden">
      {/* Month Navigation */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-accent/30">
        <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-1 hover:bg-accent rounded">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-sm">{format(currentMonth, 'yyyy년 M월', { locale: ko })}</span>
        <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-1 hover:bg-accent rounded">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2 px-3 py-1 border-b border-border bg-accent/10">
        {employees.map(emp => {
          const c = getEmpColor(emp.id);
          return (
            <div key={emp.id} className="flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${c.dot}`} />
              <span className="text-xs text-muted-foreground">{emp.name}</span>
            </div>
          );
        })}
      </div>

      {/* Week Days Header */}
      <div className="grid grid-cols-7 border-b border-border">
        {weekDays.map(wd => (
          <div key={wd} className="py-1 text-center text-xs text-muted-foreground border-r border-border last:border-r-0">
            {wd}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7">
        {days.map((d, i) => {
          const dateStr = format(d, 'yyyy-MM-dd');
          const isCurrentMonth = isSameMonth(d, currentMonth);
          const isToday = isSameDay(d, new Date());
          const dayRows = rowsByDate[dateStr] || [];
          const isExpanded = expandedCell === dateStr;

          const byEmployee: { empId: string; empName: string; rows: typeof dayRows }[] = [];
          const empMap = new Map<string, typeof dayRows>();
          for (const row of dayRows) {
            const empId = row.log.employeeId;
            if (!empMap.has(empId)) {
              empMap.set(empId, []);
              byEmployee.push({ empId, empName: row.employeeName, rows: empMap.get(empId)! });
            }
            empMap.get(empId)!.push(row);
          }

          const totalCount = dayRows.length;
          const MAX_VISIBLE_ROWS = 4;
          let remainingSlots = isExpanded ? Infinity : MAX_VISIBLE_ROWS;

          return (
            <div
              key={i}
              className={`min-h-[100px] border-r border-b border-border p-0.5 transition-colors flex flex-col
                ${!isCurrentMonth ? 'bg-muted/30' : ''}
                ${i % 7 === 6 ? 'border-r-0' : ''}
              `}
            >
              {/* Date number */}
              <div className="flex items-center justify-between mb-0.5 shrink-0 px-0.5">
                <span className={`w-5 h-5 flex items-center justify-center rounded-full text-xs ${
                  isToday ? 'bg-primary text-primary-foreground' : ''
                } ${!isCurrentMonth ? 'text-muted-foreground/50' : ''}`}>
                  {format(d, 'd')}
                </span>
                {totalCount > 0 && (
                  <span className="text-[10px] text-muted-foreground bg-accent px-1 rounded-full">
                    {totalCount}
                  </span>
                )}
              </div>

              {/* Grouped entries */}
              {isCurrentMonth && byEmployee.length > 0 && (
                <div className="flex-1 overflow-y-auto scrollbar-thin space-y-0.5">
                  {byEmployee.map(({ empId, empName, rows }) => {
                    if (remainingSlots <= 0 && !isExpanded) return null;
                    const c = getEmpColor(empId);
                    const visibleRows = isExpanded ? rows : rows.slice(0, remainingSlots);
                    remainingSlots -= visibleRows.length;

                    return (
                      <div key={empId} className={`rounded overflow-hidden ${c.bg}`}>
                        <div className={`flex items-center gap-0.5 px-1 py-[1px]`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${c.dot} shrink-0`} />
                          <span className={`text-xs ${c.text} truncate`}>{empName}</span>
                          <span className={`text-[10px] ${c.text} opacity-50 ml-auto shrink-0`}>{rows.length}</span>
                        </div>
                        {visibleRows.map((row, idx) => (
                          <div
                            key={`${row.slotEntry.id}-${idx}`}
                            className="group/item flex items-center gap-0.5 px-1 py-[1px] cursor-pointer hover:bg-white/60 transition-colors border-t border-border/20"
                            onClick={() => {
                              if (row.slotEntry.aiDetail) {
                                onViewDetail(row.slotEntry, row.timeSlot);
                              }
                            }}
                            title={`[${row.timeSlot}] ${row.title}`}
                          >
                            <span className={`text-sm truncate flex-1 ${c.text}`}><span className="text-muted-foreground mr-0.5">{row.timeSlot.split(' ~ ')[0]}</span>{row.title}</span>
                            {row.slotEntry.aiDetail && (
                              <Eye className={`w-2.5 h-2.5 shrink-0 opacity-0 group-hover/item:opacity-100 ${c.text}`} />
                            )}
                          </div>
                        ))}
                      </div>
                    );
                  })}
                  {(() => {
                    if (!isExpanded) {
                      const actualHidden = totalCount - Math.min(totalCount, MAX_VISIBLE_ROWS);
                      if (actualHidden > 0) {
                        return (
                          <button
                            className="w-full text-center text-xs text-muted-foreground hover:text-primary py-[1px] hover:bg-accent/40 rounded"
                            onClick={() => setExpandedCell(dateStr)}
                          >
                            +{actualHidden}
                          </button>
                        );
                      }
                    }
                    if (isExpanded && totalCount > MAX_VISIBLE_ROWS) {
                      return (
                        <button
                          className="w-full text-center text-xs text-muted-foreground hover:text-primary py-[1px] hover:bg-accent/40 rounded"
                          onClick={() => setExpandedCell(null)}
                        >
                          접기
                        </button>
                      );
                    }
                    return null;
                  })()}
                </div>
              )}

              {isCurrentMonth && byEmployee.length === 0 && (
                <div className="flex-1 flex items-center justify-center">
                  <span className="text-[9px] text-muted-foreground/20">-</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}