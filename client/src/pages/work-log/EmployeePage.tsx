import { useState, useEffect, useCallback, useRef } from 'react';
import { Calendar } from './Calendar';
import { DailyDetail } from './DailyDetail';
import { loadLogs, saveLogs, currentEmployee, loadTemplates, saveTemplates, fetchLogsFromAPI, saveLogToAPI } from './data';
import type { DailyLog, PromptTemplate } from './data';
import { format } from 'date-fns';
import { PanelLeftClose, PanelLeftOpen, FileText, Settings, Plus, Trash2, Save, Download, FileSpreadsheet, FileCode, ImageIcon, ListFilter, LayoutGrid } from 'lucide-react';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType } from 'docx';
import { toPng } from 'html-to-image';
import { toast } from 'sonner';

function PromptTemplateManager() {
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    setTemplates(loadTemplates());
  }, []);

  const currentTemplate = templates.find(t => t.id === selectedId);

  const handleSave = () => {
    saveTemplates(templates);
    alert('프롬프트 템플릿이 저장되었습니다.');
  };

  const addTemplate = () => {
    const newT: PromptTemplate = {
      id: Date.now().toString(),
      name: '새 템플릿',
      prompt1: '',
      prompt2: ''
    };
    setTemplates([...templates, newT]);
    setSelectedId(newT.id);
  };

  const updateTemplate = (field: keyof PromptTemplate, value: string) => {
    setTemplates(prev => prev.map(t => t.id === selectedId ? { ...t, [field]: value } : t));
  };

  return (
    <div className="border border-border rounded-lg bg-card overflow-hidden flex flex-col h-[400px]">
      <div className="bg-muted/50 px-3 py-2 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-semibold">프롬프트 템플릿 관리</span>
        </div>
        <div className="flex gap-2">
          <button onClick={addTemplate} className="p-1 hover:bg-accent rounded text-muted-foreground">
            <Plus className="w-4 h-4" />
          </button>
          <button onClick={handleSave} className="p-1 hover:bg-accent rounded text-primary">
            <Save className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="flex-1 flex min-h-0">
        <div className="w-48 border-r border-border overflow-y-auto bg-muted/20 p-2 space-y-1">
          {templates.map(t => (
            <button
              key={t.id}
              onClick={() => setSelectedId(t.id)}
              className={`w-full text-left px-2 py-1.5 rounded text-xs transition-colors ${
                selectedId === t.id ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
              }`}
            >
              {t.name}
            </button>
          ))}
        </div>
        <div className="flex-1 p-3 overflow-y-auto space-y-4">
          {currentTemplate ? (
            <>
              <div>
                <label className="block text-[11px] font-medium text-muted-foreground mb-1 uppercase">템플릿 이름</label>
                <input
                  type="text"
                  value={currentTemplate.name}
                  onChange={(e) => updateTemplate('name', e.target.value)}
                  className="w-full border border-border rounded px-2 py-1.5 text-sm bg-input-background focus:ring-1 focus:ring-primary/30 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3 h-[250px]">
                <div className="flex flex-col">
                  <label className="block text-[11px] font-medium text-muted-foreground mb-1 uppercase">1차 프롬프트 베이스</label>
                  <textarea
                    value={currentTemplate.prompt1}
                    onChange={(e) => updateTemplate('prompt1', e.target.value)}
                    className="w-full flex-1 border border-border rounded p-2 text-xs bg-input-background resize-none focus:ring-1 focus:ring-primary/30 outline-none"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="block text-[11px] font-medium text-muted-foreground mb-1 uppercase">2차 프롬프트 베이스</label>
                  <textarea
                    value={currentTemplate.prompt2}
                    onChange={(e) => updateTemplate('prompt2', e.target.value)}
                    className="w-full flex-1 border border-border rounded p-2 text-xs bg-input-background resize-none focus:ring-1 focus:ring-primary/30 outline-none"
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
              <FileText className="w-10 h-10 mb-2 opacity-20" />
              <p className="text-xs">템플릿을 선택하거나 새로 만드세요.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function EmployeePage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [calendarExpanded, setCalendarExpanded] = useState(true);
  const [calendarMode, setCalendarMode] = useState<'monthly' | 'daily'>('monthly');
  const appRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const apiLogs = await fetchLogsFromAPI();
      if (!cancelled && apiLogs && apiLogs.length > 0) {
        setLogs(apiLogs);
        saveLogs(apiLogs); // sync to localStorage
      } else if (!cancelled) {
        setLogs(loadLogs()); // fallback to localStorage / mock
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const myLogs = logs.filter(l => l.employeeId === currentEmployee.id);
  const dateStr = format(selectedDate, 'yyyy-MM-dd');
  const currentLog = myLogs.find(l => l.date === dateStr);

  const handleSaveLog = useCallback(async (log: DailyLog) => {
    setLogs(prev => {
      const existing = prev.findIndex(
        l => l.date === log.date && l.employeeId === log.employeeId
      );
      let updated: DailyLog[];
      if (existing >= 0) {
        updated = [...prev];
        updated[existing] = log;
      } else {
        updated = [...prev, log];
      }
      saveLogs(updated);
      return updated;
    });
    const ok = await saveLogToAPI(log);
    if (!ok) {
      toast.error('서버 저장 실패 — 로컬에만 저장되었습니다.');
    }
  }, []);

  const downloadExcel = () => {
    const data = myLogs.flatMap(log => 
      log.timeSlots.filter(s => s.title.trim()).map(slot => ({
        날짜: log.date,
        시간대: slot.timeSlot,
        제목: slot.title,
        내용: slot.content,
        계획: slot.planned,
        AI도구: slot.aiDetail?.aiTools.join(', ') || '-'
      }))
    );
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "업무일지");
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const fileData = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(fileData, `업무일지_${currentEmployee.name}_${format(new Date(), 'yyyyMMdd')}.xlsx`);
  };

  const downloadWord = async () => {
    const rows = myLogs.flatMap(log => 
      log.timeSlots.filter(s => s.title.trim()).map(slot => 
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph(log.date)] }),
            new TableCell({ children: [new Paragraph(slot.timeSlot)] }),
            new TableCell({ children: [new Paragraph(slot.title)] }),
            new TableCell({ children: [new Paragraph(slot.content)] }),
          ],
        })
      )
    );

    const doc = new Document({
      sections: [{
        children: [
          new Paragraph({
            children: [new TextRun({ text: `업무일지 - ${currentEmployee.name}`, bold: true, size: 32 })],
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "날짜", bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "시간", bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "제목", bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "내용", bold: true })] })] }),
                ],
              }),
              ...rows
            ],
          }),
        ],
      }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `업무일지_${currentEmployee.name}.docx`);
  };

  const downloadImage = async () => {
    if (appRef.current) {
      const dataUrl = await toPng(appRef.current, { cacheBust: true, backgroundColor: '#ffffff' });
      saveAs(dataUrl, `업무일지_스크린샷_${format(new Date(), 'yyyyMMdd')}.png`);
    }
  };

  return (
    <div ref={appRef} className="max-w-[1920px] mx-auto px-1 py-3 bg-background">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <h1 className="text-xl font-black text-primary tracking-tight">AI 업무일지 시스템</h1>
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">Employee Productivity Dashboard</p>
          </div>
          <div className="flex bg-muted rounded-lg p-1 shadow-inner">
            <button
              onClick={() => setCalendarMode('monthly')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs transition-all ${calendarMode === 'monthly' ? 'bg-white shadow-sm font-bold text-primary scale-105' : 'text-muted-foreground hover:bg-white/50'}`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              월별 그리드
            </button>
            <button
              onClick={() => setCalendarMode('daily')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs transition-all ${calendarMode === 'daily' ? 'bg-white shadow-sm font-bold text-primary scale-105' : 'text-muted-foreground hover:bg-white/50'}`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              일별 리스트
            </button>
          </div>

          <div className="hidden xl:flex items-center gap-3 border-l border-border pl-6">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">이번 달 작성률</span>
              {(() => {
                const currentMonth = format(selectedDate, 'yyyy-MM');
                const monthLogs = myLogs.filter(l => l.date.startsWith(currentMonth));
                const rate = Math.min(100, Math.round((monthLogs.length / 22) * 100));
                return (
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${rate}%` }} />
                    </div>
                    <span className="text-xs font-black">{rate}%</span>
                  </div>
                );
              })()}
            </div>
            <div className="flex flex-col border-l border-border pl-4">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">누적 업무 수</span>
              <span className="text-sm font-black text-blue-600">{myLogs.reduce((acc, log) => acc + log.timeSlots.filter(s => s.title.trim()).length, 0)}건</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={downloadExcel}
            className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded text-xs font-semibold hover:bg-green-100 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" />
            엑셀 다운받기
          </button>
          <button
            onClick={downloadWord}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded text-xs font-semibold hover:bg-blue-100 transition-colors"
          >
            <FileCode className="w-4 h-4" />
            워드 다운받기
          </button>
          <button
            onClick={downloadImage}
            className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 text-orange-700 border border-orange-200 rounded text-xs font-semibold hover:bg-orange-100 transition-colors"
          >
            <ImageIcon className="w-4 h-4" />
            이미지로 저장
          </button>
        </div>
      </div>

      <div className="flex gap-0 items-start">
        {/* Calendar - left column */}
        <div
          className="shrink-0 sticky top-3 transition-all duration-300 ease-in-out flex flex-col gap-3"
          style={{ width: calendarExpanded ? '55%' : '220px' }}
        >
          <div className="pr-2">
            <Calendar
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              logs={myLogs}
              onUpdateLog={handleSaveLog}
              compact={!calendarExpanded}
              mode={calendarMode}
            />
          </div>

          {calendarExpanded && (
            <div className="pr-2 animate-in fade-in slide-in-from-left-2 duration-300">
              <PromptTemplateManager />
            </div>
          )}
        </div>

        {/* Toggle button & Side tools */}
        <div className="shrink-0 sticky top-3 z-10 flex flex-col items-center gap-2 pt-0.5">
          <button
            onClick={() => setCalendarExpanded(prev => !prev)}
            className="flex items-center justify-center w-6 h-14 bg-accent/80 hover:bg-accent border border-border rounded-md text-muted-foreground hover:text-foreground transition-colors shadow-sm"
            title={calendarExpanded ? '캘린더 축소' : '캘린더 펼치기'}
          >
            {calendarExpanded ? (
              <PanelLeftClose className="w-3.5 h-3.5" />
            ) : (
              <PanelLeftOpen className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* Daily Detail - right column */}
        <div className="flex-1 min-w-0 pl-1">
          <DailyDetail
            date={selectedDate}
            log={currentLog}
            onSave={handleSaveLog}
          />
        </div>
      </div>
    </div>
  );
}

export default EmployeePage;
