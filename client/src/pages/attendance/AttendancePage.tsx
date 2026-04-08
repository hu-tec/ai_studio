import React, { useState, useMemo, useEffect } from 'react';
import { 
  Users, 
  Clock, 
  Calendar, 
  FileSpreadsheet, 
  FileText, 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  ChevronRight,
  AlertCircle,
  Search,
  Filter,
  Download,
  Info,
  History,
  TrendingUp,
  UserCheck,
  Timer,
  Maximize2,
  CalendarDays,
  CalendarRange
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Resizable } from 're-resizable';

// Tailwind utility
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Types
type Department = '기획' | '전문가' | '개발자';
type SubDept = '번역사' | '프롬프트' | '일반';
type JobType = '직원' | '알바' | '프리랜서' | '강사' | '재택근무';
type Mode = 'view' | 'add' | 'edit' | 'delete';
type SummaryView = 'day' | 'month';

interface Employee {
  id: string;
  name: string;
  dept: Department;
  subDept: SubDept;
  jobType: JobType;
  workDays: string[];
  plannedTime: string;
}

interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  clockIn: string;
  clockOut: string;
  lunchStart: string;
  lunchEnd: string;
  actualIn: string;
  reason: string;
  remarks: string;
}

// Mock Data
const INITIAL_EMPLOYEES: Employee[] = [
  { id: '1', name: '김기획', dept: '기획', subDept: '일반', jobType: '직원', workDays: ['월', '화', '수', '목', '금'], plannedTime: '09:00 - 18:00' },
  { id: '2', name: '이번역', dept: '전문가', subDept: '번역사', jobType: '프리랜서', workDays: ['월', '수', '금'], plannedTime: '10:00 - 17:00' },
  { id: '3', name: '박프롬', dept: '전문가', subDept: '프롬프트', jobType: '알바', workDays: ['화', '목'], plannedTime: '13:00 - 18:00' },
  { id: '4', name: '최개발', dept: '개발자', subDept: '일반', jobType: '재택근무', workDays: ['월', '화', '수', '목', '금'], plannedTime: '09:00 - 18:00' },
];

const INITIAL_RECORDS: AttendanceRecord[] = [
  { 
    id: 'r1', 
    employeeId: '1', 
    date: '2026-03-09', 
    clockIn: '09:00', 
    clockOut: '18:05', 
    lunchStart: '12:00', 
    lunchEnd: '13:00', 
    actualIn: '08:55', 
    reason: '', 
    remarks: '정상 출근' 
  },
  { 
    id: 'r2', 
    employeeId: '2', 
    date: '2026-03-09', 
    clockIn: '10:00', 
    clockOut: '17:10', 
    lunchStart: '12:30', 
    lunchEnd: '13:30', 
    actualIn: '10:05', 
    reason: '교통 체증', 
    remarks: '업무 집중도 높음' 
  },
];

// --- API helpers ---
function saveAttendanceToServer(key: string, data: any) {
  fetch('/api/attendance', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ record_key: key, data })
  }).catch(() => {});
}

export function AttendancePage() {
  const [mode, setMode] = useState<Mode>('view');
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [records, setRecords] = useState<AttendanceRecord[]>(INITIAL_RECORDS);

  // Load from API on mount
  useEffect(() => {
    fetch('/api/attendance').then(r => r.json()).then((rows: any[]) => {
      if (rows.length > 0) {
        const empRow = rows.find((r: any) => r.record_key === 'employees');
        const recRow = rows.find((r: any) => r.record_key === 'records');
        if (empRow?.data && Array.isArray(empRow.data) && empRow.data.length > 0) {
          setEmployees(empRow.data);
        }
        if (recRow?.data && Array.isArray(recRow.data) && recRow.data.length > 0) {
          setRecords(recRow.data);
        }
      }
    }).catch(() => {}); // silent fallback to mock
  }, []);
  const [selectedId, setSelectedId] = useState<string | null>(employees[0].id);
  const [searchTerm, setSearchTerm] = useState('');
  const [jobTypeFilter, setJobTypeFilter] = useState<string>('전체');
  const [summaryView, setSummaryView] = useState<SummaryView>('day');
  const [historySearchTerm, setHistorySearchTerm] = useState('');
  const [historyStatusFilter, setHistoryStatusFilter] = useState('전체');

  // Form State
  const [formData, setFormData] = useState<Partial<AttendanceRecord>>({
    date: new Date().toISOString().split('T')[0],
    clockIn: '09:00',
    clockOut: '18:00',
    lunchStart: '12:00',
    lunchEnd: '13:00',
    actualIn: '',
    reason: '',
    remarks: ''
  });

  const selectedEmployee = useMemo(() => 
    employees.find(e => e.id === selectedId), [selectedId, employees]
  );

  const filteredEmployees = useMemo(() => 
    employees.filter(e => {
      const matchesSearch = e.name.includes(searchTerm) || e.dept.includes(searchTerm);
      const matchesFilter = jobTypeFilter === '전체' || e.jobType === jobTypeFilter;
      return matchesSearch && matchesFilter;
    }), [employees, searchTerm, jobTypeFilter]
  );

  const employeeRecords = useMemo(() => 
    records
      .filter(r => r.employeeId === selectedId)
      .filter(r => {
        const matchesHistorySearch = r.date.includes(historySearchTerm) || r.remarks.includes(historySearchTerm);
        const isLate = r.actualIn > r.clockIn;
        const matchesStatus = historyStatusFilter === '전체' || (historyStatusFilter === '지각' && isLate) || (historyStatusFilter === '정상' && !isLate);
        return matchesHistorySearch && matchesStatus;
      })
      .sort((a, b) => b.date.localeCompare(a.date)), 
    [records, selectedId, historySearchTerm, historyStatusFilter]
  );

  // Stats for Summary Column
  const summaryStats = useMemo(() => ({
    total: employees.length,
    todayPresent: records.filter(r => r.date === new Date().toISOString().split('T')[0]).length,
    late: records.filter(r => r.actualIn > r.clockIn).length,
    monthlyAttendance: Math.round(Math.random() * 20 + 80) // Mock monthly data
  }), [employees, records]);

  // Export functions
  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(records);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendance");
    XLSX.writeFile(wb, `attendance_report_${new Date().toLocaleDateString()}.xlsx`);
  };

  const exportWord = () => {
    const content = records.map(r => 
      `날짜: ${r.date}\n사원ID: ${r.employeeId}\n출근: ${r.actualIn}\n퇴근: ${r.clockOut}\n사유: ${r.reason}\n-------------------\n`
    ).join('\n');
    const blob = new Blob([content], { type: 'application/msword' });
    saveAs(blob, `attendance_report_${new Date().toLocaleDateString()}.doc`);
  };

  const handleSubmit = () => {
    if (!selectedId) return;

    if (mode === 'add') {
      const newRecord: AttendanceRecord = {
        ...formData as AttendanceRecord,
        id: `r${Date.now()}`,
        employeeId: selectedId,
      };
      const newRecords = [...records, newRecord];
      setRecords(newRecords);
      saveAttendanceToServer('records', newRecords);
      alert('📌 출퇴근 기록이 추가되었습니다.');
    } else if (mode === 'edit') {
      const recordIdx = records.findIndex(r => r.employeeId === selectedId && r.date === formData.date);
      if (recordIdx > -1) {
        const updated = [...records];
        updated[recordIdx] = { ...updated[recordIdx], ...formData };
        setRecords(updated);
        saveAttendanceToServer('records', updated);
        alert('✏️ 기록이 수정되었습니다.');
      } else {
        alert('⚠️ 해당 날짜의 기록을 찾을 수 없습니다.');
      }
    } else if (mode === 'delete') {
      const filtered = records.filter(r => !(r.employeeId === selectedId && r.date === formData.date));
      setRecords(filtered);
      saveAttendanceToServer('records', filtered);
      alert('🗑️ 기록이 삭제되었습니다.');
    }
    setMode('view');
  };

  // Reusable card header buttons
  const CardActions = ({ title, onAdd, onEdit, onDelete }: { title: string, onAdd: () => void, onEdit: () => void, onDelete: () => void }) => (
    <div className="flex items-center justify-between mb-2">
      <h2 className="text-xs font-bold text-gray-500 flex items-center gap-1.5">
        {title.includes('직원') ? <Users size={14} /> :
         title.includes('규정') ? <Calendar size={14} /> :
         title.includes('기록') ? <Clock size={14} /> : <TrendingUp size={14} />}
        {title}
      </h2>
      <div className="flex gap-0.5">
        <button onClick={onAdd} className="p-1 hover:bg-green-100 text-green-600 rounded-md transition-colors" title="추가"><Plus size={13} /></button>
        <button onClick={onEdit} className="p-1 hover:bg-amber-100 text-amber-600 rounded-md transition-colors" title="수정"><Edit3 size={13} /></button>
        <button onClick={onDelete} className="p-1 hover:bg-red-100 text-red-600 rounded-md transition-colors" title="삭제"><Trash2 size={13} /></button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-4 font-sans text-[#333] flex flex-col gap-3">
      {/* Header & Mode Switcher */}
      <header className="flex items-center justify-between bg-white px-4 py-2.5 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-1.5 rounded-lg">
            <Clock className="text-white w-5 h-5" />
          </div>
          <h1 className="text-base font-bold tracking-tight">출퇴근 통합 관리</h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Mode Controls */}
          <div className="flex bg-gray-100 p-0.5 rounded-lg border border-gray-200">
            <button
              onClick={() => setMode('view')}
              className={cn("px-3 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1.5", mode === 'view' ? "bg-white shadow-sm text-blue-600" : "text-gray-500 hover:text-gray-700")}
            >
              <Eye size={14} /> 조회
            </button>
            <button
              onClick={() => setMode('add')}
              className={cn("px-3 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1.5", mode === 'add' ? "bg-white shadow-sm text-green-600" : "text-gray-500 hover:text-gray-700")}
            >
              <Plus size={14} /> 추가
            </button>
            <button
              onClick={() => setMode('edit')}
              className={cn("px-3 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1.5", mode === 'edit' ? "bg-white shadow-sm text-amber-600" : "text-gray-500 hover:text-gray-700")}
            >
              <Edit3 size={14} /> 수정
            </button>
            <button
              onClick={() => setMode('delete')}
              className={cn("px-3 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1.5", mode === 'delete' ? "bg-white shadow-sm text-red-600" : "text-gray-500 hover:text-gray-700")}
            >
              <Trash2 size={14} /> 삭제
            </button>
          </div>

          <div className="h-5 w-[1px] bg-gray-300" />

          {/* Export Buttons */}
          <div className="flex gap-1.5">
            <button onClick={exportExcel} className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-medium hover:bg-emerald-100 transition-colors">
              <FileSpreadsheet size={14} /> 엑셀
            </button>
            <button onClick={exportWord} className="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-medium hover:bg-indigo-100 transition-colors">
              <FileText size={14} /> 워드
            </button>
          </div>
        </div>
      </header>

      {/* Top Grid: 4 Sections Layout */}
      <div className="grid grid-cols-4 gap-3 h-[380px]">

        {/* 1st Column: Employee List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
          <div className="p-3 border-b border-gray-100 bg-gray-50/50">
            <CardActions
              title="직원 목록"
              onAdd={() => alert('직원 추가')}
              onEdit={() => alert('직원 수정')}
              onDelete={() => alert('직원 삭제')}
            />

            <div className="relative mb-2">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={13} />
              <input
                type="text"
                placeholder="이름 또는 부서 검색..."
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap gap-1">
              {['전체', '직원', '알바', '프리랜서', '강사', '재택근무'].map(filter => (
                <button
                  key={filter}
                  onClick={() => setJobTypeFilter(filter)}
                  className={cn(
                    "px-1.5 py-0.5 rounded text-[10px] font-bold transition-all border cursor-pointer",
                    jobTypeFilter === filter ? "bg-gray-800 text-white border-gray-800" : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"
                  )}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-1.5">
            {filteredEmployees.map(emp => (
              <button
                key={emp.id}
                onClick={() => setSelectedId(emp.id)}
                className={cn(
                  "w-full flex items-center gap-2 px-2 py-1.5 rounded-lg mb-0.5 transition-all text-left group border border-transparent",
                  selectedId === emp.id ? "bg-blue-50 border-blue-100" : "hover:bg-gray-50"
                )}
              >
                <span className={cn(
                  "text-[10px] px-1.5 py-0.5 rounded font-bold shrink-0 min-w-[48px] text-center",
                  emp.jobType === '직원' ? "bg-blue-100 text-blue-700" :
                  emp.jobType === '알바' ? "bg-orange-100 text-orange-700" :
                  emp.jobType === '프리랜서' ? "bg-purple-100 text-purple-700" :
                  emp.jobType === '재택근무' ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"
                )}>
                  {emp.jobType}
                </span>
                <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0", selectedId === emp.id ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-500 group-hover:bg-gray-300")}>
                  {emp.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-xs text-gray-800">{emp.name}</div>
                  <div className="text-[10px] text-gray-500 truncate">{emp.dept} · {emp.subDept}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 2nd Column: Planned Schedule */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col p-3">
          <CardActions
            title="근무 규정 및 계획"
            onAdd={() => alert('규정 추가')}
            onEdit={() => alert('규정 수정')}
            onDelete={() => alert('규정 삭제')}
          />

          {selectedEmployee ? (
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">고정 설정값 (규정)</div>
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">근무 요일</span>
                    <div className="flex gap-0.5">
                      {['월', '화', '수', '목', '금'].map(day => (
                        <span key={day} className={cn("w-6 h-6 flex items-center justify-center rounded-full text-[10px] font-bold", selectedEmployee.workDays.includes(day) ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-400")}>{day}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">표준 근무시간</span>
                    <span className="text-xs font-bold text-gray-800">{selectedEmployee.plannedTime}</span>
                  </div>
                </div>
              </div>
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                <div className="text-[10px] font-semibold text-amber-600 uppercase tracking-wider mb-1">변경 가능값 (준규정)</div>
                <p className="text-[11px] text-amber-700 leading-relaxed">실제 출근 시간은 당일 상황에 따라 유동적으로 입력 가능하며, 사유 발생 시 상세 내용을 기록해야 합니다.</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
              <Users size={36} strokeWidth={1} className="mb-1" />
              <p className="text-xs text-center">직원을 선택하면<br/>계획이 표시됩니다.</p>
            </div>
          )}
        </div>

        {/* 3rd Column: Form / Action Area */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col p-3">
          <CardActions
            title={mode === 'view' ? '기록 요약' : mode === 'add' ? '기록 추가' : mode === 'edit' ? '기록 수정' : '기록 삭제'}
            onAdd={() => setMode('add')}
            onEdit={() => setMode('edit')}
            onDelete={() => setMode('delete')}
          />

          <div className="space-y-2.5 overflow-y-auto pr-1">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 ml-0.5">날짜</label>
              <input type="date" disabled={mode === 'view'} value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:opacity-60" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 ml-0.5">실제 출근</label>
                <input type="time" disabled={mode === 'view'} value={formData.actualIn} onChange={(e) => setFormData({...formData, actualIn: e.target.value})} className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:opacity-60" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 ml-0.5">실제 퇴근</label>
                <input type="time" disabled={mode === 'view'} value={formData.clockOut} onChange={(e) => setFormData({...formData, clockOut: e.target.value})} className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:opacity-60" />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 ml-0.5">점심 시간</label>
              <div className="flex items-center gap-1.5">
                <input type="time" disabled={mode === 'view'} value={formData.lunchStart} onChange={(e) => setFormData({...formData, lunchStart: e.target.value})} className="flex-1 p-2 bg-gray-50 border border-gray-200 rounded-lg text-xs disabled:opacity-60" />
                <span className="text-gray-300 text-xs">~</span>
                <input type="time" disabled={mode === 'view'} value={formData.lunchEnd} onChange={(e) => setFormData({...formData, lunchEnd: e.target.value})} className="flex-1 p-2 bg-gray-50 border border-gray-200 rounded-lg text-xs disabled:opacity-60" />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 ml-0.5">변경 사유</label>
              <textarea rows={1} disabled={mode === 'view'} value={formData.reason} onChange={(e) => setFormData({...formData, reason: e.target.value})} placeholder="사유..." className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-xs disabled:opacity-60 resize-none" />
            </div>
            {mode !== 'view' && (
              <button onClick={handleSubmit} className={cn("w-full py-2 rounded-lg text-white text-xs font-bold shadow-sm mt-1 active:scale-95", mode === 'add' ? "bg-green-500 hover:bg-green-600" : mode === 'edit' ? "bg-amber-500 hover:bg-amber-600" : "bg-red-500 hover:bg-red-600")}>
                {mode === 'add' ? '등록' : mode === 'edit' ? '저장' : '삭제'}
              </button>
            )}
          </div>
        </div>

        {/* 4th Column: Dashboard Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
          <div className="bg-blue-600 px-3 py-2.5 text-white">
            <div className="flex items-center justify-between mb-1.5">
              <h2 className="text-xs font-bold flex items-center gap-1.5"><TrendingUp size={14} /> 대시보드 요약</h2>
              <div className="flex gap-0.5">
                <button onClick={() => alert('요약 추가')} className="p-0.5 hover:bg-white/20 rounded"><Plus size={11} /></button>
                <button onClick={() => alert('요약 수정')} className="p-0.5 hover:bg-white/20 rounded"><Edit3 size={11} /></button>
                <button onClick={() => alert('요약 삭제')} className="p-0.5 hover:bg-white/20 rounded"><Trash2 size={11} /></button>
              </div>
            </div>
            <div className="flex bg-white/10 p-0.5 rounded-lg">
              <button
                onClick={() => setSummaryView('day')}
                className={cn("flex-1 py-0.5 rounded-md text-[10px] font-bold transition-all flex items-center justify-center gap-1", summaryView === 'day' ? "bg-white text-blue-600 shadow-sm" : "text-white/70 hover:text-white")}
              >
                <CalendarDays size={11} /> 일별
              </button>
              <button
                onClick={() => setSummaryView('month')}
                className={cn("flex-1 py-0.5 rounded-md text-[10px] font-bold transition-all flex items-center justify-center gap-1", summaryView === 'month' ? "bg-white text-blue-600 shadow-sm" : "text-white/70 hover:text-white")}
              >
                <CalendarRange size={11} /> 월별
              </button>
            </div>
          </div>
          <div className="p-3 flex-1 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-blue-100 text-blue-600 rounded-md"><Users size={14}/></div>
                  <span className="text-xs font-medium text-gray-500">{summaryView === 'day' ? '금일 총 인원' : '당월 총 인원'}</span>
                </div>
                <span className="text-base font-bold">{summaryStats.total}명</span>
              </div>

              <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-green-100 text-green-600 rounded-md"><UserCheck size={14}/></div>
                  <span className="text-xs font-medium text-gray-500">{summaryView === 'day' ? '금일 출근' : '당월 평균 출근'}</span>
                </div>
                <span className="text-base font-bold text-green-600">{summaryView === 'day' ? summaryStats.todayPresent : summaryStats.monthlyAttendance}명</span>
              </div>

              <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-amber-100 text-amber-600 rounded-md"><Timer size={14}/></div>
                  <span className="text-xs font-medium text-gray-500">{summaryView === 'day' ? '금일 지각' : '당월 지각 건수'}</span>
                </div>
                <span className="text-base font-bold text-amber-600">{summaryStats.late}건</span>
              </div>
            </div>

            <div className="mt-auto">
              <div className="flex justify-between items-end mb-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{summaryView === 'day' ? '오늘의 출근율' : '이번 달 목표 달성'}</span>
                <span className="text-xs font-bold text-blue-600">
                  {summaryView === 'day' ? Math.round((summaryStats.todayPresent / summaryStats.total) * 100) : 92}%
                </span>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full transition-all duration-1000" style={{ width: `${summaryView === 'day' ? (summaryStats.todayPresent / summaryStats.total) * 100 : 92}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Cumulative History (Resizable) */}
      <Resizable
        defaultSize={{ width: '100%', height: 280 }}
        minHeight={160}
        maxHeight={600}
        enable={{ top: true }}
        handleComponent={{ top: <div className="w-full h-1.5 hover:bg-blue-400/30 cursor-ns-resize transition-colors absolute -top-1" title="드래그하여 높이 조절" /> }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden relative"
      >
        <div className="px-3 py-2 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-xs font-bold text-gray-600 flex items-center gap-1.5">
              <History size={14} className="text-blue-500" /> 최근 근무 기록
            </h2>
            <div className="h-3.5 w-[1px] bg-gray-300" />
            <div className="text-[10px] text-gray-400">
              선택: <span className="font-bold text-gray-700">{selectedEmployee?.name || '없음'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" size={11} />
              <input
                type="text"
                placeholder="기록 검색..."
                value={historySearchTerm}
                onChange={(e) => setHistorySearchTerm(e.target.value)}
                className="pl-7 pr-2 py-1 bg-white border border-gray-200 rounded-lg text-[11px] w-32 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div className="flex bg-gray-100 p-0.5 rounded-lg border border-gray-200">
              {['전체', '정상', '지각'].map(status => (
                <button
                  key={status}
                  onClick={() => setHistoryStatusFilter(status)}
                  className={cn("px-2 py-0.5 rounded-md text-[10px] font-bold transition-all", historyStatusFilter === status ? "bg-white shadow-sm text-blue-600" : "text-gray-500 hover:text-gray-700")}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-white z-10 shadow-sm">
              <tr className="bg-gray-50/50 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                <th className="px-3 py-2 border-b border-gray-100">날짜</th>
                <th className="px-3 py-2 border-b border-gray-100">계획 시간</th>
                <th className="px-3 py-2 border-b border-gray-100">실제 출근</th>
                <th className="px-3 py-2 border-b border-gray-100">실제 퇴근</th>
                <th className="px-3 py-2 border-b border-gray-100">점심 시간</th>
                <th className="px-3 py-2 border-b border-gray-100">변경 사유</th>
                <th className="px-3 py-2 border-b border-gray-100">특이사항</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {employeeRecords.length > 0 ? (
                employeeRecords.map(rec => (
                  <tr key={rec.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-3 py-2"><div className="text-xs font-bold text-gray-700">{rec.date}</div></td>
                    <td className="px-3 py-2"><div className="text-[11px] text-gray-500">{rec.clockIn} - {rec.clockOut}</div></td>
                    <td className="px-3 py-2">
                      <div className={cn("text-xs font-bold", rec.actualIn > rec.clockIn ? "text-red-500" : "text-green-600")}>
                        {rec.actualIn} {rec.actualIn > rec.clockIn && <span className="ml-1 text-[10px] font-normal">(지각)</span>}
                      </div>
                    </td>
                    <td className="px-3 py-2 text-xs font-medium text-gray-700">{rec.clockOut}</td>
                    <td className="px-3 py-2 text-[11px] text-gray-500">{rec.lunchStart} ~ {rec.lunchEnd}</td>
                    <td className="px-3 py-2">{rec.reason ? <span className="px-1.5 py-0.5 bg-amber-50 text-amber-700 rounded text-[10px] font-medium border border-amber-100">{rec.reason}</span> : <span className="text-gray-300 text-[11px]">-</span>}</td>
                    <td className="px-3 py-2 text-xs text-gray-500 italic max-w-xs truncate">{rec.remarks || '-'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-3 py-8 text-center text-gray-400">
                    <div className="flex flex-col items-center gap-1">
                      <AlertCircle size={24} strokeWidth={1} />
                      <p className="text-xs">기록이 없거나 필터와 일치하는 데이터가 없습니다.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Resizable>
    </div>
  );
}

export default AttendancePage;
