import { format, startOfWeek, addDays } from 'date-fns';
import { ko } from 'date-fns/locale';
import type { DailyLog, Task } from './data';
import { taskSlots, FRANKLIN_PRIORITY_CONFIG, FRANKLIN_STATUS_CONFIG } from './data';

interface WeeklyViewProps {
  date: Date;            // 선택된 날짜 (주에 속하는 아무 날짜)
  logs: DailyLog[];      // 직원의 모든 일지
  onSelectDate: (d: Date) => void; // 일자 헤더 클릭 → 해당 일자로 이동
}

function flatTasks(log: DailyLog | undefined): Task[] {
  if (!log) return [];
  return (log.tasks || []).flatMap(t => [t, ...(t.children || [])]).filter(t => t.task?.trim());
}

export function WeeklyView({ date, logs, onSelectDate }: WeeklyViewProps) {
  const weekStart = startOfWeek(date, { weekStartsOn: 1 }); // 월요일 시작
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const today = format(new Date(), 'yyyy-MM-dd');

  // 일자별 데이터 집계
  const dailyData = days.map(d => {
    const dateStr = format(d, 'yyyy-MM-dd');
    const log = logs.find(l => l.date === dateStr);
    const tasks = flatTasks(log);
    const ranges = tasks.flatMap(t => taskSlots(t));
    const start = ranges.length > 0 ? ranges.map(r => r.startTime).sort()[0] : '';
    const end = ranges.length > 0 ? ranges.map(r => r.endTime).sort().reverse()[0] : '';
    const scoreTotal = tasks.reduce((s, t) => s + (t.achievement || 0) * 0.2, 0);
    return {
      date: d,
      dateStr,
      tasks,
      start,
      end,
      score: Math.round(scoreTotal * 10) / 10,
    };
  });

  // 이월 업무 전체 누적 (완료/취소 제외 + 미배정/forwarded/queued)
  const carryMap = new Map<string, { task: Task; fromDate: string }>();
  for (const l of logs) {
    for (const t of flatTasks(l)) {
      if (t.status === 'done' || t.status === 'cancelled') continue;
      const isUnassigned = taskSlots(t).length === 0;
      const isForwarded = t.status === 'forwarded';
      const isQueued = !!t.queued;
      if (!isUnassigned && !isForwarded && !isQueued) continue;
      const key = t.rolledFromId || `${t.task.trim()}|${t.priority}`;
      const existing = carryMap.get(key);
      if (!existing || l.date > existing.fromDate) {
        carryMap.set(key, { task: t, fromDate: l.date });
      }
    }
  }
  const carryover = Array.from(carryMap.values()).sort((a, b) => a.fromDate.localeCompare(b.fromDate));

  const weekTotal = dailyData.reduce((s, d) => s + d.score, 0);

  return (
    <div className="flex flex-col gap-2">
      {/* 주간 그리드 */}
      <div className="border border-border rounded overflow-hidden">
        {/* 날짜 헤더 */}
        <div className="grid grid-cols-7 bg-accent/40 border-b-2 border-border text-[11px] font-bold">
          {dailyData.map(d => {
            const dow = d.date.getDay();
            const isWeekend = dow === 0 || dow === 6;
            return (
              <button key={d.dateStr} onClick={() => onSelectDate(d.date)}
                title="클릭 → 해당 일자 상세 이동"
                className={`px-2 py-1.5 border-r border-border last:border-r-0 text-center hover:bg-accent/70
                  ${d.dateStr === today ? 'bg-yellow-100' : ''}
                  ${isWeekend && d.dateStr !== today ? 'text-rose-600' : ''}`}>
                {format(d.date, 'M월 d일(E)', { locale: ko })}
              </button>
            );
          })}
        </div>

        {/* 시간 범위 · 점수 */}
        <div className="grid grid-cols-7 bg-yellow-50/70 border-b border-border text-[10px]">
          {dailyData.map(d => (
            <div key={d.dateStr} className="px-2 py-1 border-r border-border last:border-r-0 flex items-center justify-center gap-1">
              {d.start && d.end ? (
                <>
                  <span className="font-mono text-muted-foreground">{d.start}~{d.end}</span>
                  <span className="font-bold text-blue-600">· {d.score}</span>
                </>
              ) : (
                <span className="text-muted-foreground/40">-</span>
              )}
            </div>
          ))}
        </div>

        {/* 일자별 task 리스트 (세로 컬럼) */}
        <div className="grid grid-cols-7 min-h-[300px]">
          {dailyData.map(d => (
            <div key={d.dateStr} className="border-r border-border last:border-r-0 divide-y divide-border/30">
              {d.tasks.length === 0 ? (
                <div className="text-[9px] text-muted-foreground/40 italic text-center py-3">없음</div>
              ) : (
                d.tasks.map(t => {
                  const pCfg = FRANKLIN_PRIORITY_CONFIG[t.priority];
                  const stCfg = FRANKLIN_STATUS_CONFIG[t.status];
                  const score = ((t.achievement || 0) * 0.2).toFixed(1);
                  const r = taskSlots(t)[0];
                  return (
                    <div key={t.id} className="flex items-start gap-1 px-1.5 py-1 text-[10px] hover:bg-accent/20"
                      title={t.task}>
                      <span className="font-bold shrink-0 mt-[1px]" style={{ color: pCfg.color }}>{t.priority}{t.number}</span>
                      <span className="shrink-0 mt-[1px]" style={{ color: stCfg.color }}>{stCfg.icon}</span>
                      <span className={`flex-1 break-words ${t.status === 'cancelled' ? 'line-through text-muted-foreground/50' : ''}`}>
                        {t.task}
                        {r && <span className="ml-1 text-[8px] font-mono text-muted-foreground">{r.startTime}</span>}
                      </span>
                      {(t.achievement || 0) > 0 && (
                        <span className={`text-[9px] font-bold shrink-0 ${(t.achievement||0)>=4 ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {score}
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          ))}
        </div>

        {/* 총 합계 row */}
        <div className="grid grid-cols-7 bg-accent/50 border-t-2 border-border text-[11px] font-bold">
          {dailyData.map(d => (
            <div key={d.dateStr} className="px-2 py-1.5 border-r border-border last:border-r-0 text-center">
              총 <span className="text-blue-700">{d.score}</span>
            </div>
          ))}
        </div>
        {/* 주간 합계 */}
        <div className="bg-blue-50 border-t border-blue-200 px-2 py-1 flex items-center justify-between text-[11px]">
          <span className="text-muted-foreground">주간 합계</span>
          <span className="font-bold text-blue-700">{Math.round(weekTotal * 10) / 10}</span>
        </div>
      </div>

      {/* 이월 업무 섹션 — 한 번에 전부 나열 */}
      <div className="border border-rose-300 rounded overflow-hidden">
        <div className="px-2 py-1.5 bg-rose-100/70 border-b border-rose-300 flex items-center justify-between">
          <span className="text-[12px] font-bold text-rose-700">이월 업무 ({carryover.length}건)</span>
          <span className="text-[10px] text-rose-500 italic">완료/취소 제외 · 미배정/forwarded/queued 모음 — 다음 주 배정용</span>
        </div>
        {carryover.length === 0 ? (
          <div className="text-[10px] text-rose-300 italic text-center py-4">이월 업무 없음 — 모두 완료되었습니다 ✓</div>
        ) : (
          <div className="p-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-1">
            {carryover.map(({ task: t, fromDate }) => {
              const pCfg = FRANKLIN_PRIORITY_CONFIG[t.priority];
              const stCfg = FRANKLIN_STATUS_CONFIG[t.status];
              const tag = t.status === 'forwarded' ? '이월' : t.queued ? '대기' : taskSlots(t).length === 0 ? '미배정' : '';
              return (
                <div key={`${fromDate}-${t.id}`} className="flex items-center gap-1 px-2 py-1 bg-white border border-rose-100 rounded text-[10px] hover:shadow-sm"
                  title={`${t.task} (${fromDate})`}>
                  <span className="font-bold shrink-0" style={{ color: pCfg.color }}>{t.priority}{t.number}</span>
                  <span className="shrink-0" style={{ color: stCfg.color }}>{stCfg.icon}</span>
                  <span className={`flex-1 truncate ${t.status === 'cancelled' ? 'line-through' : ''}`}>{t.task}</span>
                  <span className="text-[8px] font-mono text-gray-500 shrink-0">{fromDate.slice(5)}</span>
                  {tag && <span className="text-[8px] px-1 rounded bg-rose-100 text-rose-600 font-bold shrink-0">{tag}</span>}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
