import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';
import type { DailyLog, MandalartCell, MandalartTypeConfig, Task } from './data';
import { mandalartKey, WORKLOG_MANDALART_ID, mandalartColor, mandalartCenterIdx, FRANKLIN_STATUS_CONFIG, FRANKLIN_PRIORITY_CONFIG, findTypePathInTree, loadPersistentCells } from './data';

interface ListViewProps {
  logs: DailyLog[];
  onSelectDate: (date: Date) => void;
  mandalartTypes?: MandalartTypeConfig[];
  employeeId?: string;
}

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
          <div key={i} title={c.text || ''}
            style={{
              width: 16, height: 16, borderRadius: 2,
              background: isCenter ? '#1e293b' : cfg?.bg || (c.text ? '#fff' : '#f1f5f9'),
              color: isCenter ? '#fff' : '#1e293b',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 6, fontWeight: 700, overflow: 'hidden',
            }}>
            {c.text ? c.text.slice(0, 2) : ''}
          </div>
        );
      })}
    </div>
  );
}

interface CellRow {
  typePath: string[];
  cellText: string;
  achievement: number;
  color?: string;
  isPersistent: boolean;
}

function collectCellRows(types: MandalartTypeConfig[], cellsByKey: Record<string, MandalartCell[]>, isPersistent: boolean): CellRow[] {
  const rows: CellRow[] = [];
  const walk = (node: MandalartTypeConfig, pathLabels: string[]) => {
    const period = node.id === WORKLOG_MANDALART_ID ? 'daily' : 'always';
    const key = mandalartKey(node.id, period as any, node.size);
    const cells = cellsByKey[key] || [];
    const centerIdx = mandalartCenterIdx(node.size);
    cells.forEach((c, i) => {
      if (centerIdx >= 0 && i === centerIdx) return;
      if (!c.text?.trim()) return;
      rows.push({ typePath: pathLabels, cellText: c.text, achievement: c.achievement || 0, color: c.color, isPersistent });
    });
    node.children?.forEach(ch => walk(ch, [...pathLabels, ch.label]));
  };
  types.forEach(t => walk(t, [t.label]));
  return rows;
}

export function ListView({ logs, onSelectDate, mandalartTypes, employeeId }: ListViewProps) {
  const [tab, setTab] = useState<'worklog' | 'cells'>('worklog');
  const sorted = [...logs].sort((a, b) => b.date.localeCompare(a.date));

  const persistentCells = employeeId ? loadPersistentCells(employeeId) : {};
  const cellRows: CellRow[] = mandalartTypes
    ? collectCellRows(mandalartTypes, persistentCells, true)
    : [];

  return (
    <div className="bg-card rounded border border-border overflow-hidden">
      <div className="px-2 py-1 border-b border-border bg-accent/20 flex items-center gap-3">
        <button onClick={() => setTab('worklog')}
          style={{ padding: '2px 8px', borderRadius: 6, border: '1px solid', fontSize: 10, fontWeight: 600, cursor: 'pointer',
            borderColor: tab === 'worklog' ? '#3B82F6' : '#e2e8f0',
            background: tab === 'worklog' ? '#3B82F6' : '#fff',
            color: tab === 'worklog' ? '#fff' : '#64748b' }}>
          업무일지 ({sorted.length})
        </button>
        <button onClick={() => setTab('cells')}
          style={{ padding: '2px 8px', borderRadius: 6, border: '1px solid', fontSize: 10, fontWeight: 600, cursor: 'pointer',
            borderColor: tab === 'cells' ? '#3B82F6' : '#e2e8f0',
            background: tab === 'cells' ? '#3B82F6' : '#fff',
            color: tab === 'cells' ? '#fff' : '#64748b' }}>
          만다라트 셀 ({cellRows.length})
        </button>
        {tab === 'worklog' && (
          <span className="text-[10px] text-muted-foreground ml-auto">행 클릭 → 해당 날짜로 이동</span>
        )}
      </div>

      {tab === 'worklog' ? (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-accent/10 sticky top-0 z-10">
              <tr className="border-b border-border">
                <th className="px-2 py-1.5 text-left font-semibold w-[100px]">날짜</th>
                <th className="px-2 py-1.5 text-left font-semibold">제목</th>
                <th className="px-2 py-1.5 text-left font-semibold">내용</th>
                <th className="px-2 py-1.5 text-left font-semibold w-[60px]">만다라트</th>
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0 && (
                <tr><td colSpan={4} className="px-2 py-1 text-center text-muted-foreground text-[11px]">기록된 일지가 없습니다.</td></tr>
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
                    <td className="px-2 py-1.5"><MandalartMiniPreview log={log} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-accent/10 sticky top-0 z-10">
              <tr className="border-b border-border">
                <th className="px-2 py-1.5 text-left font-semibold w-[80px]">대분류</th>
                <th className="px-2 py-1.5 text-left font-semibold w-[80px]">중분류</th>
                <th className="px-2 py-1.5 text-left font-semibold w-[80px]">소분류</th>
                <th className="px-2 py-1.5 text-left font-semibold">셀 내용</th>
                <th className="px-2 py-1.5 text-left font-semibold w-[50px]">달성</th>
                <th className="px-2 py-1.5 text-left font-semibold">비고</th>
              </tr>
            </thead>
            <tbody>
              {cellRows.length === 0 && (
                <tr><td colSpan={6} className="px-2 py-1 text-center text-muted-foreground text-[11px]">만다라트 셀이 없습니다.</td></tr>
              )}
              {cellRows.map((r, i) => {
                const cfg = mandalartColor(r.color);
                return (
                  <tr key={i} className="border-b border-border/40 hover:bg-accent/10">
                    <td className="px-2 py-1">{r.typePath[0] || '-'}</td>
                    <td className="px-2 py-1">{r.typePath[1] || '-'}</td>
                    <td className="px-2 py-1">{r.typePath[2] || '-'}</td>
                    <td className="px-2 py-1 text-foreground">
                      <div className="flex items-center gap-1">
                        {cfg && <span style={{ width: 8, height: 8, borderRadius: '50%', background: cfg.bg, flexShrink: 0 }} />}
                        <span className="truncate max-w-[300px]">{r.cellText}</span>
                      </div>
                    </td>
                    <td className="px-2 py-1 text-center">
                      {r.achievement > 0 && (
                        <span style={{ color: r.achievement >= 4 ? '#10B981' : '#f59e0b', fontWeight: 700 }}>{r.achievement}</span>
                      )}
                    </td>
                    <td className="px-2 py-1 text-muted-foreground">
                      {r.isPersistent && <span className="text-[8px] bg-blue-100 text-blue-600 px-1 rounded">상시</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
