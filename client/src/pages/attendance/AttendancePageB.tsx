import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Clock, Calendar, Plus, Edit3, Trash2, Search, Download,
  FileSpreadsheet, FileText, Users, ChevronLeft, ChevronRight,
  Check, X, AlertCircle, UserCheck,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Types ───
type Department = '기획' | '전문가' | '개발자';
type SubDept = '번역사' | '프롬프트' | '일반';
type JobType = '직원' | '알바' | '프리랜서' | '강사' | '재택근무';

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

// ─── Mock Data ───
const INITIAL_EMPLOYEES: Employee[] = [
  { id: '1', name: '김기획', dept: '기획', subDept: '일반', jobType: '직원', workDays: ['월', '화', '수', '목', '금'], plannedTime: '09:00 - 18:00' },
  { id: '2', name: '이번역', dept: '전문가', subDept: '번역사', jobType: '프리랜서', workDays: ['월', '수', '금'], plannedTime: '10:00 - 17:00' },
  { id: '3', name: '박프롬', dept: '전문가', subDept: '프롬프트', jobType: '알바', workDays: ['화', '목'], plannedTime: '13:00 - 18:00' },
  { id: '4', name: '최개발', dept: '개발자', subDept: '일반', jobType: '재택근무', workDays: ['월', '화', '수', '목', '금'], plannedTime: '09:00 - 18:00' },
];

const INITIAL_RECORDS: AttendanceRecord[] = [
  { id: 'r1', employeeId: '1', date: '2026-04-01', clockIn: '09:00', clockOut: '18:05', lunchStart: '12:00', lunchEnd: '13:00', actualIn: '08:55', reason: '', remarks: '정상 출근' },
  { id: 'r2', employeeId: '1', date: '2026-04-02', clockIn: '09:00', clockOut: '18:10', lunchStart: '12:00', lunchEnd: '13:00', actualIn: '09:05', reason: '교통 체증', remarks: '5분 지각' },
  { id: 'r3', employeeId: '1', date: '2026-04-03', clockIn: '09:00', clockOut: '15:30', lunchStart: '12:00', lunchEnd: '13:00', actualIn: '09:00', reason: '', remarks: '면접날' },
  { id: 'r4', employeeId: '2', date: '2026-04-01', clockIn: '10:00', clockOut: '17:10', lunchStart: '12:30', lunchEnd: '13:30', actualIn: '10:05', reason: '교통 체증', remarks: '' },
  { id: 'r5', employeeId: '2', date: '2026-04-03', clockIn: '10:00', clockOut: '17:00', lunchStart: '12:30', lunchEnd: '13:30', actualIn: '09:55', reason: '', remarks: '업무 집중' },
  { id: 'r6', employeeId: '3', date: '2026-04-01', clockIn: '13:00', clockOut: '18:00', lunchStart: '', lunchEnd: '', actualIn: '13:00', reason: '', remarks: '' },
  { id: 'r7', employeeId: '4', date: '2026-04-01', clockIn: '09:00', clockOut: '18:00', lunchStart: '12:00', lunchEnd: '13:00', actualIn: '08:50', reason: '', remarks: '재택' },
  { id: 'r8', employeeId: '4', date: '2026-04-02', clockIn: '09:00', clockOut: '18:30', lunchStart: '12:00', lunchEnd: '13:00', actualIn: '09:00', reason: '', remarks: '재택/야근' },
];

// ─── Helpers ───
const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function formatDate(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

function getDayName(y: number, m: number, d: number) {
  return DAY_NAMES[new Date(y, m, d).getDay()];
}

function saveAttendanceToServer(key: string, data: any) {
  fetch('/api/attendance', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ record_key: key, data }),
  }).catch(() => {});
}

// ─── Component ───
export function AttendancePageB() {
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [records, setRecords] = useState<AttendanceRecord[]>(INITIAL_RECORDS);
  const [selectedEmpId, setSelectedEmpId] = useState<string | null>(null); // null = 전체
  const [searchTerm, setSearchTerm] = useState('');

  // Month navigation
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  // Inline editing
  const [editingCell, setEditingCell] = useState<{ recordId: string; field: string } | null>(null);
  const [editValue, setEditValue] = useState('');
  const editRef = useRef<HTMLInputElement>(null);

  // Add row
  const [addingRow, setAddingRow] = useState<{ empId: string; date: string } | null>(null);
  const [addForm, setAddForm] = useState({ actualIn: '', clockOut: '', remarks: '' });

  // Load from API
  useEffect(() => {
    fetch('/api/attendance').then(r => r.json()).then((rows: any[]) => {
      if (rows.length > 0) {
        const empRow = rows.find((r: any) => r.record_key === 'employees');
        const recRow = rows.find((r: any) => r.record_key === 'records');
        if (empRow?.data && Array.isArray(empRow.data) && empRow.data.length > 0) setEmployees(empRow.data);
        if (recRow?.data && Array.isArray(recRow.data) && recRow.data.length > 0) setRecords(recRow.data);
      }
    }).catch(() => {});
  }, []);

  // Focus edit input
  useEffect(() => {
    if (editingCell && editRef.current) editRef.current.focus();
  }, [editingCell]);

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);

  // Filter employees
  const visibleEmployees = useMemo(() => {
    if (selectedEmpId) return employees.filter(e => e.id === selectedEmpId);
    if (searchTerm) return employees.filter(e => e.name.includes(searchTerm) || e.dept.includes(searchTerm));
    return employees;
  }, [employees, selectedEmpId, searchTerm]);

  // Build date rows for each employee
  const buildDateRows = (empId: string) => {
    const rows: { date: string; day: string; dayNum: number; record: AttendanceRecord | null; isWorkDay: boolean }[] = [];
    const emp = employees.find(e => e.id === empId);
    if (!emp) return rows;

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = formatDate(viewYear, viewMonth, d);
      const dayName = getDayName(viewYear, viewMonth, d);
      const record = records.find(r => r.employeeId === empId && r.date === dateStr) || null;
      const isWorkDay = emp.workDays.includes(dayName);
      rows.push({ date: dateStr, day: dayName, dayNum: d, record, isWorkDay });
    }
    return rows;
  };

  // Month navigation
  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(viewYear - 1); setViewMonth(11); }
    else setViewMonth(viewMonth - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(viewYear + 1); setViewMonth(0); }
    else setViewMonth(viewMonth + 1);
  };

  // Inline edit handlers
  const startEdit = (recordId: string, field: string, currentValue: string) => {
    setEditingCell({ recordId, field });
    setEditValue(currentValue);
  };

  const commitEdit = () => {
    if (!editingCell) return;
    const updated = records.map(r => {
      if (r.id === editingCell.recordId) {
        return { ...r, [editingCell.field]: editValue };
      }
      return r;
    });
    setRecords(updated);
    saveAttendanceToServer('records', updated);
    setEditingCell(null);
  };

  const cancelEdit = () => setEditingCell(null);

  // Add record
  const handleAdd = (empId: string, dateStr: string) => {
    setAddingRow({ empId, date: dateStr });
    const emp = employees.find(e => e.id === empId);
    const [start, end] = (emp?.plannedTime || '09:00 - 18:00').split(' - ');
    setAddForm({ actualIn: start || '09:00', clockOut: end || '18:00', remarks: '' });
  };

  const confirmAdd = () => {
    if (!addingRow) return;
    const emp = employees.find(e => e.id === addingRow.empId);
    const [planIn, planOut] = (emp?.plannedTime || '09:00 - 18:00').split(' - ');
    const newRecord: AttendanceRecord = {
      id: `r${Date.now()}`,
      employeeId: addingRow.empId,
      date: addingRow.date,
      clockIn: planIn || '09:00',
      clockOut: addForm.clockOut,
      lunchStart: '12:00',
      lunchEnd: '13:00',
      actualIn: addForm.actualIn,
      reason: '',
      remarks: addForm.remarks,
    };
    const updated = [...records, newRecord];
    setRecords(updated);
    saveAttendanceToServer('records', updated);
    setAddingRow(null);
  };

  // Delete record
  const handleDelete = (recordId: string) => {
    if (!confirm('이 기록을 삭제하시겠습니까?')) return;
    const updated = records.filter(r => r.id !== recordId);
    setRecords(updated);
    saveAttendanceToServer('records', updated);
  };

  // Export
  const exportExcel = () => {
    const exportData = visibleEmployees.flatMap(emp => {
      return buildDateRows(emp.id)
        .filter(row => row.record)
        .map(row => ({
          이름: emp.name,
          날짜: row.date,
          요일: row.day,
          출근: row.record!.actualIn,
          퇴근: row.record!.clockOut,
          특이사항: row.record!.remarks,
        }));
    });
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '출퇴근');
    XLSX.writeFile(wb, `출퇴근_${viewYear}년${viewMonth + 1}월.xlsx`);
  };

  // Stats
  const monthRecords = records.filter(r => r.date.startsWith(`${viewYear}-${String(viewMonth + 1).padStart(2, '0')}`));
  const lateCount = monthRecords.filter(r => {
    const emp = employees.find(e => e.id === r.employeeId);
    if (!emp) return false;
    const planIn = emp.plannedTime.split(' - ')[0];
    return r.actualIn > planIn;
  }).length;

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-4 font-sans text-[#333] flex flex-col gap-3">
      {/* ── Header ── */}
      <header className="flex items-center justify-between bg-white px-4 py-2.5 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-1.5 rounded-lg">
            <Clock className="text-white w-5 h-5" />
          </div>
          <h1 className="text-base font-bold tracking-tight">출퇴근 관리 <span className="text-xs font-normal text-gray-400 ml-1">ver.B — 날짜별 뷰</span></h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Month Nav */}
          <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-lg border border-gray-200">
            <button onClick={prevMonth} className="p-0.5 hover:bg-gray-200 rounded"><ChevronLeft size={16} /></button>
            <span className="text-sm font-bold min-w-[100px] text-center">{viewYear}년 {viewMonth + 1}월</span>
            <button onClick={nextMonth} className="p-0.5 hover:bg-gray-200 rounded"><ChevronRight size={16} /></button>
          </div>

          <div className="h-5 w-[1px] bg-gray-300" />

          {/* Export */}
          <button onClick={exportExcel} className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-medium hover:bg-emerald-100 transition-colors">
            <FileSpreadsheet size={14} /> 엑셀
          </button>
        </div>
      </header>

      {/* ── Member Filter Bar ── */}
      <div className="bg-white px-4 py-2.5 rounded-xl shadow-sm border border-gray-200 flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
          <Users size={14} /> 멤버:
        </div>

        <button
          onClick={() => setSelectedEmpId(null)}
          className={cn(
            "px-3 py-1 rounded-lg text-xs font-bold transition-all border",
            !selectedEmpId ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
          )}
        >
          전체 ({employees.length})
        </button>

        {employees.map(emp => (
          <button
            key={emp.id}
            onClick={() => setSelectedEmpId(selectedEmpId === emp.id ? null : emp.id)}
            className={cn(
              "px-3 py-1 rounded-lg text-xs font-bold transition-all border flex items-center gap-1.5",
              selectedEmpId === emp.id ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
            )}
          >
            <span className={cn(
              "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold",
              selectedEmpId === emp.id ? "bg-white/30 text-white" : "bg-gray-100 text-gray-500"
            )}>
              {emp.name[0]}
            </span>
            {emp.name}
            <span className={cn(
              "text-[10px] px-1 py-0.5 rounded",
              selectedEmpId === emp.id ? "bg-white/20" :
              emp.jobType === '직원' ? "bg-blue-50 text-blue-600" :
              emp.jobType === '알바' ? "bg-orange-50 text-orange-600" :
              emp.jobType === '프리랜서' ? "bg-purple-50 text-purple-600" :
              emp.jobType === '재택근무' ? "bg-emerald-50 text-emerald-600" : "bg-gray-50 text-gray-500"
            )}>
              {emp.jobType}
            </span>
          </button>
        ))}

        <div className="ml-auto relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={13} />
          <input
            type="text"
            placeholder="이름 검색..."
            className="pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-100 w-36"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* ── Summary Bar ── */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-4 py-3 flex items-center gap-3">
          <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg"><Users size={18} /></div>
          <div>
            <div className="text-[10px] font-bold text-gray-400 uppercase">이번 달 총 인원</div>
            <div className="text-lg font-bold">{visibleEmployees.length}명</div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-4 py-3 flex items-center gap-3">
          <div className="p-2 bg-green-100 text-green-600 rounded-lg"><UserCheck size={18} /></div>
          <div>
            <div className="text-[10px] font-bold text-gray-400 uppercase">이번 달 출근 기록</div>
            <div className="text-lg font-bold text-green-600">{monthRecords.length}건</div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-4 py-3 flex items-center gap-3">
          <div className="p-2 bg-amber-100 text-amber-600 rounded-lg"><AlertCircle size={18} /></div>
          <div>
            <div className="text-[10px] font-bold text-gray-400 uppercase">이번 달 지각</div>
            <div className="text-lg font-bold text-amber-600">{lateCount}건</div>
          </div>
        </div>
      </div>

      {/* ── Per-Employee Tables ── */}
      {visibleEmployees.map(emp => {
        const dateRows = buildDateRows(emp.id);
        const [startTime, endTime] = emp.plannedTime.split(' - ');

        return (
          <div key={emp.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Employee Header */}
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                  emp.jobType === '직원' ? "bg-blue-100 text-blue-700" :
                  emp.jobType === '알바' ? "bg-orange-100 text-orange-700" :
                  emp.jobType === '프리랜서' ? "bg-purple-100 text-purple-700" :
                  emp.jobType === '재택근무' ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"
                )}>
                  {emp.name[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">{emp.name}</span>
                    <span className={cn(
                      "text-[10px] px-1.5 py-0.5 rounded font-bold",
                      emp.jobType === '직원' ? "bg-blue-100 text-blue-700" :
                      emp.jobType === '알바' ? "bg-orange-100 text-orange-700" :
                      emp.jobType === '프리랜서' ? "bg-purple-100 text-purple-700" :
                      emp.jobType === '재택근무' ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"
                    )}>
                      {emp.jobType}
                    </span>
                    <span className="text-[11px] text-gray-400">{emp.dept} · {emp.subDept}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <div className="flex items-center gap-1 text-[11px] text-gray-500">
                      <span className="font-medium">출퇴근 요일:</span>
                      <div className="flex gap-0.5">
                        {['월', '화', '수', '목', '금'].map(day => (
                          <span
                            key={day}
                            className={cn(
                              "w-5 h-5 flex items-center justify-center rounded text-[10px] font-bold",
                              emp.workDays.includes(day) ? "bg-indigo-100 text-indigo-700" : "bg-gray-100 text-gray-300"
                            )}
                          >
                            {day}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-[11px] text-gray-500">
                      <span className="font-medium">시간:</span>{' '}
                      <span className="font-bold text-gray-700">{startTime}</span>
                      <span className="mx-1">~</span>
                      <span className="font-bold text-gray-700">{endTime}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-xs text-gray-400">
                출근 {dateRows.filter(r => r.record).length}일 / 근무일 {dateRows.filter(r => r.isWorkDay).length}일
              </div>
            </div>

            {/* Date Table */}
            <div className="overflow-auto max-h-[400px]">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-white z-10">
                  <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                    <th className="px-4 py-2 w-[130px]">날짜</th>
                    <th className="px-3 py-2 w-[50px]">요일</th>
                    <th className="px-3 py-2 w-[90px]">출근</th>
                    <th className="px-3 py-2 w-[90px]">퇴근</th>
                    <th className="px-3 py-2">특이사항</th>
                    <th className="px-3 py-2 w-[70px] text-center">관리</th>
                  </tr>
                </thead>
                <tbody>
                  {dateRows.map(row => {
                    const isToday = row.date === today.toISOString().split('T')[0];
                    const isWeekend = row.day === '토' || row.day === '일';
                    const isLate = row.record && row.record.actualIn > row.record.clockIn;
                    const isAdding = addingRow?.empId === emp.id && addingRow?.date === row.date;

                    return (
                      <tr
                        key={row.date}
                        className={cn(
                          "border-b border-gray-50 transition-colors",
                          isToday && "bg-indigo-50/50",
                          isWeekend && !row.record && "bg-gray-50/50",
                          !isWeekend && !row.record && row.isWorkDay && "hover:bg-gray-50"
                        )}
                      >
                        {/* 날짜 */}
                        <td className="px-4 py-1.5">
                          <div className="flex items-center gap-1.5">
                            {isToday && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />}
                            <span className={cn("text-xs", isToday ? "font-bold text-indigo-700" : "text-gray-700")}>
                              {viewYear}년 {viewMonth + 1}월 {row.dayNum}일
                            </span>
                          </div>
                        </td>

                        {/* 요일 */}
                        <td className="px-3 py-1.5">
                          <span className={cn(
                            "text-xs font-bold",
                            row.day === '일' ? "text-red-500" : row.day === '토' ? "text-blue-500" : "text-gray-600"
                          )}>
                            {row.day}
                          </span>
                        </td>

                        {/* 출근 */}
                        <td className="px-3 py-1.5">
                          {isAdding ? (
                            <input
                              type="time"
                              value={addForm.actualIn}
                              onChange={e => setAddForm({ ...addForm, actualIn: e.target.value })}
                              className="w-full p-1 border border-indigo-200 rounded text-xs bg-indigo-50"
                            />
                          ) : row.record ? (
                            <div
                              className={cn(
                                "text-xs font-bold cursor-pointer hover:underline",
                                isLate ? "text-red-500" : "text-green-600"
                              )}
                              onClick={() => startEdit(row.record!.id, 'actualIn', row.record!.actualIn)}
                            >
                              {editingCell?.recordId === row.record.id && editingCell.field === 'actualIn' ? (
                                <div className="flex items-center gap-1">
                                  <input
                                    ref={editRef}
                                    type="time"
                                    value={editValue}
                                    onChange={e => setEditValue(e.target.value)}
                                    onKeyDown={e => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') cancelEdit(); }}
                                    className="w-20 p-0.5 border border-indigo-300 rounded text-xs"
                                  />
                                  <button onClick={commitEdit} className="text-green-500 hover:text-green-700"><Check size={12} /></button>
                                  <button onClick={cancelEdit} className="text-red-400 hover:text-red-600"><X size={12} /></button>
                                </div>
                              ) : (
                                <>
                                  {row.record.actualIn}
                                  {isLate && <span className="ml-1 text-[10px] font-normal">(지각)</span>}
                                </>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-300 text-xs">-</span>
                          )}
                        </td>

                        {/* 퇴근 */}
                        <td className="px-3 py-1.5">
                          {isAdding ? (
                            <input
                              type="time"
                              value={addForm.clockOut}
                              onChange={e => setAddForm({ ...addForm, clockOut: e.target.value })}
                              className="w-full p-1 border border-indigo-200 rounded text-xs bg-indigo-50"
                            />
                          ) : row.record ? (
                            <div
                              className="text-xs font-medium text-gray-700 cursor-pointer hover:underline"
                              onClick={() => startEdit(row.record!.id, 'clockOut', row.record!.clockOut)}
                            >
                              {editingCell?.recordId === row.record.id && editingCell.field === 'clockOut' ? (
                                <div className="flex items-center gap-1">
                                  <input
                                    ref={editRef}
                                    type="time"
                                    value={editValue}
                                    onChange={e => setEditValue(e.target.value)}
                                    onKeyDown={e => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') cancelEdit(); }}
                                    className="w-20 p-0.5 border border-indigo-300 rounded text-xs"
                                  />
                                  <button onClick={commitEdit} className="text-green-500 hover:text-green-700"><Check size={12} /></button>
                                  <button onClick={cancelEdit} className="text-red-400 hover:text-red-600"><X size={12} /></button>
                                </div>
                              ) : (
                                row.record.clockOut
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-300 text-xs">-</span>
                          )}
                        </td>

                        {/* 특이사항 */}
                        <td className="px-3 py-1.5">
                          {isAdding ? (
                            <input
                              type="text"
                              value={addForm.remarks}
                              onChange={e => setAddForm({ ...addForm, remarks: e.target.value })}
                              placeholder="특이사항 입력..."
                              className="w-full p-1 border border-indigo-200 rounded text-xs bg-indigo-50"
                              onKeyDown={e => { if (e.key === 'Enter') confirmAdd(); if (e.key === 'Escape') setAddingRow(null); }}
                            />
                          ) : row.record ? (
                            <div
                              className="text-xs text-gray-500 cursor-pointer hover:underline min-h-[20px]"
                              onClick={() => startEdit(row.record!.id, 'remarks', row.record!.remarks)}
                            >
                              {editingCell?.recordId === row.record.id && editingCell.field === 'remarks' ? (
                                <div className="flex items-center gap-1">
                                  <input
                                    ref={editRef}
                                    type="text"
                                    value={editValue}
                                    onChange={e => setEditValue(e.target.value)}
                                    onKeyDown={e => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') cancelEdit(); }}
                                    className="flex-1 p-0.5 border border-indigo-300 rounded text-xs"
                                  />
                                  <button onClick={commitEdit} className="text-green-500 hover:text-green-700"><Check size={12} /></button>
                                  <button onClick={cancelEdit} className="text-red-400 hover:text-red-600"><X size={12} /></button>
                                </div>
                              ) : (
                                row.record.remarks || <span className="text-gray-300">-</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-300 text-xs">-</span>
                          )}
                        </td>

                        {/* 관리 */}
                        <td className="px-3 py-1.5 text-center">
                          {isAdding ? (
                            <div className="flex items-center justify-center gap-1">
                              <button onClick={confirmAdd} className="p-0.5 text-green-500 hover:text-green-700"><Check size={14} /></button>
                              <button onClick={() => setAddingRow(null)} className="p-0.5 text-red-400 hover:text-red-600"><X size={14} /></button>
                            </div>
                          ) : row.record ? (
                            <button
                              onClick={() => handleDelete(row.record!.id)}
                              className="p-0.5 text-gray-300 hover:text-red-500 transition-colors"
                              title="삭제"
                            >
                              <Trash2 size={13} />
                            </button>
                          ) : row.isWorkDay ? (
                            <button
                              onClick={() => handleAdd(emp.id, row.date)}
                              className="p-0.5 text-gray-300 hover:text-indigo-500 transition-colors"
                              title="출근 기록 추가"
                            >
                              <Plus size={13} />
                            </button>
                          ) : null}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default AttendancePageB;
