import { format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';
import type { DailyLog, MandalartCell, Task } from './data';
import { mandalartKey, WORKLOG_MANDALART_ID, mandalartColor, mandalartCenterIdx, FRANKLIN_STATUS_CONFIG, FRANKLIN_PRIORITY_CONFIG } from './data';

interface ListViewProps {
  logs: DailyLog[];
  onSelectDate: (date: Date) => void;
}

// 업무일지 타입의 daily 3×3 만다라트 미니 프리뷰
function MandalartMiniPreview({ log }: { log: DailyLog }) {
  const size = { rows: 3 as const, cols: 3 as const };
  const key = mandalartKey(WORKLOG_MANDALART_ID, 'daily', size);
  const cells: MandalartCell[] = log.mandalartCellsByKey?.[key] || [];
  if (cells.length !== 9) return <span className="text-[9px] text-muted-foreground/50">-</span>;
  const centerIdx = mandalartCenterIdx(size);
  return (
    <div className="inline-grid grid-cols-3 gap-[1px] bg-slate-200 p-[1px] rounded" style={{ width: 54 }}>
      {cells.map((c, i) => {
        const isCenter = i === centerIdx;
        const cfg = mandalartColor(c.color);
        return (
          <div
            key={i}
            title={c.text || ''}
            style={{
              width: 16, height: 16, borderRadius: 2,
              background: isCenter ? '#1e293b' : cfg?.bg || (c.text ? '#fff' : '#f1f5f9'),
              color: isCenter ? '#fff' : '#1e293b',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 6, fontWeight: 700, overflow: 'hidden',
            }}
          >
            {c.text ? c.text.slice(0, 2) : ''}
          </div>
        );
      })}
    </div>
  );
}

export function ListView({ logs, onSelectDate }: ListViewProps) {
  const sorted = [...logs].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="bg-card rounded border border-border overflow-hidden">
      <div className="px-2 py-1 border-b border-border bg-accent/20 flex items-center justify-between">
        <span className="font-semibold">리스트 — 날짜별 요약 ({sorted.length}일)</span>
        <span className="text-[10px] text-muted-foreground">행 클릭 → 해당 날짜로 이동</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-accent/10 sticky top-0 z-10">
            <tr className="border-b border-border">
              <th className="px-2 py-1.5 text-left font-semibold w-[110px]">날짜</th>
              <th className="px-2 py-1.5 text-left font-semibold">제목</th>
              <th className="px-2 py-1.5 text-left font-semibold">내용</th>
              <th className="px-2 py-1.5 text-left font-semibold w-[70px]">만다라트</th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 && (
              <tr>
                <td colSpan={4} className="px-2 py-1 text-center text-muted-foreground text-[11px]">
                  기록된 일지가 없습니다.
                </td>
              </tr>
            )}
            {sorted.map(log => {
              const tasks: Task[] = log.tasks || [];
              const title = tasks[0]?.task || log.timeSlots.find(s => s.title.trim())?.title || log.summary || '-';
              const firstChild = tasks[0]?.children?.[0]?.task;
              const content = firstChild || tasks[0]?.note || log.timeSlots.find(s => s.content.trim())?.content || '';
              return (
                <tr key={`${log.employeeId}_${log.date}`}
                    onClick={() => onSelectDate(parseISO(log.date))}
                    className="border-b border-border/40 hover:bg-accent/10 cursor-pointer">
                  <td className="px-2 py-1.5 font-mono text-[10px] whitespace-nowrap">
                    {format(parseISO(log.date), 'yyyy.M.d(EEE)', { locale: ko })}
                  </td>
                  <td className="px-2 py-1.5 text-foreground truncate max-w-[260px]">
                    <div className="flex items-center gap-1">
                      {tasks[0] && (
                        <span className="text-[9px] font-bold shrink-0" style={{ color: FRANKLIN_PRIORITY_CONFIG[tasks[0].priority].color }}>
                          {tasks[0].priority}{tasks[0].number}
                        </span>
                      )}
                      {tasks[0] && (
                        <span className="text-[9px] shrink-0" style={{ color: FRANKLIN_STATUS_CONFIG[tasks[0].status].color }}>
                          {FRANKLIN_STATUS_CONFIG[tasks[0].status].icon}
                        </span>
                      )}
                      <span className="truncate">{title}</span>
                    </div>
                  </td>
                  <td className="px-2 py-1.5 text-muted-foreground truncate max-w-[260px]">{content}</td>
                  <td className="px-2 py-1.5">
                    <MandalartMiniPreview log={log} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
