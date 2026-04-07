import { useState, useEffect, useCallback, useRef } from 'react';
import { Calendar } from './Calendar';
import { DailyDetail } from './DailyDetail';
import { loadLogs, saveLogs, currentEmployee, getCurrentEmployee, setCurrentEmployee, employees, addEmployee, loadTemplates, saveTemplates, fetchLogsFromAPI, saveLogToAPI } from './data';
import type { DailyLog, PromptTemplate, Employee } from './data';
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
  const [pageMode, setPageMode] = useState<'today' | 'calendar'>('today');
  const [calendarMode, setCalendarMode] = useState<'monthly' | 'daily'>('monthly');
  const appRef = useRef<HTMLDivElement>(null);
  const [activeEmpId, setActiveEmpId] = useState(getCurrentEmployee().id);
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [newEmpName, setNewEmpName] = useState('');

  const activeEmployee = employees.find(e => e.id === activeEmpId) || employees[0];

  const handleSwitchEmployee = (id: string) => {
    setActiveEmpId(id);
    setCurrentEmployee(id);
    window.location.reload(); // currentEmployee가 모듈 레벨이라 reload 필요
  };

  const handleAddEmployee = () => {
    if (!newEmpName.trim()) return;
    const newEmp: Employee = { id: `emp-custom-${Date.now()}`, name: newEmpName.trim(), department: '기타', position: '알바' };
    addEmployee(newEmp);
    setNewEmpName('');
    setShowAddEmployee(false);
    handleSwitchEmployee(newEmp.id);
  };

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
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-3 px-2">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-black text-primary tracking-tight">업무일지</h1>
          {/* 작성자 선택 */}
          <div className="flex items-center gap-1">
            {employees.map(emp => (
              <button key={emp.id} onClick={() => handleSwitchEmployee(emp.id)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all ${
                  activeEmpId === emp.id
                    ? 'bg-blue-50 text-blue-600 border-blue-300 font-bold'
                    : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                }`}>
                {emp.name}
              </button>
            ))}
            {showAddEmployee ? (
              <div className="flex items-center gap-1">
                <input value={newEmpName} onChange={e => setNewEmpName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddEmployee()}
                  placeholder="이름" autoFocus
                  className="w-16 px-2 py-0.5 text-[11px] border border-gray-300 rounded-full outline-none" />
                <button onClick={handleAddEmployee} className="text-[10px] text-blue-500 font-bold">확인</button>
                <button onClick={() => { setShowAddEmployee(false); setNewEmpName(''); }} className="text-[10px] text-gray-400">취소</button>
              </div>
            ) : (
              <button onClick={() => setShowAddEmployee(true)}
                className="px-2 py-1 rounded-full text-[11px] text-gray-400 border border-dashed border-gray-300 hover:bg-gray-50">
                +추가
              </button>
            )}
          </div>
          <div className="flex bg-muted rounded-lg p-0.5">
            <button
              onClick={() => { setPageMode('today'); setSelectedDate(new Date()); }}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${pageMode === 'today' ? 'bg-white shadow-sm text-primary' : 'text-muted-foreground hover:bg-white/50'}`}
            >오늘</button>
            <button
              onClick={() => setPageMode('calendar')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${pageMode === 'calendar' ? 'bg-white shadow-sm text-primary' : 'text-muted-foreground hover:bg-white/50'}`}
            >캘린더</button>
          </div>
          {pageMode === 'calendar' && (
            <div className="flex bg-muted/50 rounded p-0.5">
              <button onClick={() => setCalendarMode('monthly')}
                className={`px-2 py-0.5 rounded text-[10px] ${calendarMode === 'monthly' ? 'bg-white shadow-sm font-bold' : 'text-muted-foreground'}`}>월별</button>
              <button onClick={() => setCalendarMode('daily')}
                className={`px-2 py-0.5 rounded text-[10px] ${calendarMode === 'daily' ? 'bg-white shadow-sm font-bold' : 'text-muted-foreground'}`}>일별</button>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button onClick={downloadExcel} className="px-2 py-1 bg-green-50 text-green-700 border border-green-200 rounded text-[10px] font-semibold hover:bg-green-100">엑셀</button>
          <button onClick={downloadWord} className="px-2 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded text-[10px] font-semibold hover:bg-blue-100">워드</button>
          <button onClick={downloadImage} className="px-2 py-1 bg-orange-50 text-orange-700 border border-orange-200 rounded text-[10px] font-semibold hover:bg-orange-100">이미지</button>
        </div>
      </div>

      {pageMode === 'today' ? (
        /* Today mode — full width DailyDetail */
        <DailyDetail date={selectedDate} log={currentLog} onSave={handleSaveLog} />
      ) : (
        /* Calendar mode — left calendar + right detail */
        <div className="flex gap-0 items-start">
          <div className="shrink-0 sticky top-3 flex flex-col gap-3" style={{ width: '50%' }}>
            <div className="pr-2">
              <Calendar selectedDate={selectedDate} onSelectDate={setSelectedDate} logs={myLogs} onUpdateLog={handleSaveLog} compact={false} mode={calendarMode} />
            </div>
            <div className="pr-2">
              <PromptTemplateManager />
            </div>
          </div>
          <div className="flex-1 min-w-0 pl-1">
            <DailyDetail date={selectedDate} log={currentLog} onSave={handleSaveLog} />
          </div>
        </div>
      )}
    </div>
  );
}

export default EmployeePage;
