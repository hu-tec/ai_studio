import React, { useState, useMemo, useEffect } from "react";
import { 
  Calendar, 
  Clock, 
  BookOpen, 
  Settings2, 
  PlusCircle, 
  Edit3, 
  Trash2, 
  FileSpreadsheet, 
  FileText,
  CheckCircle2,
  AlertCircle,
  Coffee,
  ChevronRight,
  Download,
  History,
  Timer,
  LayoutDashboard,
  X,
  Printer,
  ChevronDown,
  LayoutList,
  BarChart3,
  Users,
  Search,
  Eye,
  ArrowRight,
  ArrowUpDown,
  Filter
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Today is Monday, March 9, 2026
const TODAY = new Date("2026-03-09");

// --- Types ---
type LargeCategory = "TESOL" | "번역" | "AI번역" | "프롬프트" | "윤리";
type MiddleCategory = "교육" | "일반" | "전문";
type Mode = "add" | "edit" | "delete";
type ViewMode = "dashboard" | "list";
type SortKey = "category" | "lecturer" | "date" | "grade";

interface PeriodSetting {
  duration: number;
  breakAfter: number;
}

interface Schedule {
  id: string;
  largeCategory: LargeCategory;
  middleCategory: MiddleCategory;
  grade: string;
  lecturer: string;
  fixedDayCount: 2 | 3 | 4;
  selectedDays: string[];
  startTime: string; // "HH:mm"
  lunchTime: number; // mins
  includeHolidays: boolean;
  periods: PeriodSetting[]; // [p1, p2, p3]
  startDate: string; // "YYYY-MM-DD"
  endDate: string; // "YYYY-MM-DD"
}

const CATEGORY_MAP: Record<MiddleCategory, string[]> = {
  "교육": ["1급", "2급", "3급", "4급", "5급", "6급", "7급", "8급"],
  "일반": ["1급", "2급", "3급"],
  "전문": ["1급", "2급"]
};

const MOCK_DATA: Schedule[] = [
  {
    id: "1",
    largeCategory: "TESOL",
    middleCategory: "교육",
    grade: "1급",
    lecturer: "김태솔 강사",
    fixedDayCount: 3,
    selectedDays: ["월", "수", "금"],
    startTime: "10:00",
    lunchTime: 30,
    includeHolidays: false,
    periods: [
      { duration: 45, breakAfter: 10 },
      { duration: 45, breakAfter: 0 },
      { duration: 45, breakAfter: 20 }
    ],
    startDate: "2026-03-09",
    endDate: "2026-05-30"
  },
  {
    id: "2",
    largeCategory: "번역",
    middleCategory: "전문",
    grade: "2급",
    lecturer: "이지현 강사",
    fixedDayCount: 2,
    selectedDays: ["화", "목"],
    startTime: "13:00",
    lunchTime: 0,
    includeHolidays: true,
    periods: [
      { duration: 50, breakAfter: 10 },
      { duration: 50, breakAfter: 10 },
      { duration: 20, breakAfter: 0 }
    ],
    startDate: "2026-03-10",
    endDate: "2026-06-15"
  }
];

const DAYS_MAP = ["월", "화", "수", "목", "금", "토", "일"];

// --- API helpers ---
function saveScheduleToServer(id: string, data: any) {
  fetch('/api/schedules', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ schedule_id: id, data })
  }).catch(() => {});
}

function deleteScheduleFromServer(id: string) {
  fetch(`/api/schedules/${id}`, { method: 'DELETE' }).catch(() => {});
}

function SchedulePage() {
  const [mode, setMode] = useState<Mode>("add");
  const [viewMode, setViewMode] = useState<ViewMode>("dashboard");
  const [schedules, setSchedules] = useState<Schedule[]>(MOCK_DATA);

  // Load from API on mount
  useEffect(() => {
    fetch('/api/schedules').then(r => r.json()).then((rows: any[]) => {
      if (rows.length > 0) {
        const loaded = rows.map((r: any) => r.data).filter(Boolean);
        if (loaded.length > 0) {
          setSchedules(loaded as Schedule[]);
        }
      }
    }).catch(() => {}); // silent fallback to mock
  }, []);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [showTimetable, setShowTimetable] = useState(false);
  const [selectedDayOfWeek, setSelectedDayOfWeek] = useState<string>("월");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewType, setPreviewType] = useState<"excel" | "word">("excel");
  const [selectedDetailId, setSelectedDetailId] = useState<string | null>(null);
  
  // Search & Sort State
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState<{key: SortKey, direction: 'asc' | 'desc'}>({ key: 'date', direction: 'desc' });

  // Form State
  const [formData, setFormData] = useState<Schedule>({
    id: Math.random().toString(36).substr(2, 9),
    largeCategory: "TESOL",
    middleCategory: "교육",
    grade: "1급",
    lecturer: "",
    fixedDayCount: 2,
    selectedDays: [],
    startTime: "10:00",
    lunchTime: 30,
    includeHolidays: false,
    periods: [
      { duration: 45, breakAfter: 10 },
      { duration: 45, breakAfter: 10 },
      { duration: 45, breakAfter: 10 }
    ],
    startDate: TODAY.toISOString().split("T")[0],
    endDate: new Date(new Date(TODAY).setMonth(TODAY.getMonth() + 2)).toISOString().split("T")[0]
  });

  // Statistics Calculation
  const stats = useMemo(() => {
    const totalLectures = schedules.length;
    const uniqueLecturers = new Set(schedules.map(s => s.lecturer)).size;
    const totalWeeklyMinutes = schedules.reduce((acc, s) => {
      const dayCount = s.selectedDays.length;
      const dailyMinutes = s.periods.reduce((pAcc, p) => pAcc + p.duration, 0);
      return acc + (dailyMinutes * dayCount);
    }, 0);
    const avgWeeklyHours = totalLectures > 0 ? (totalWeeklyMinutes / totalLectures / 60).toFixed(1) : "0";
    
    return {
      totalLectures,
      uniqueLecturers,
      avgWeeklyHours,
      totalWeeklyMinutes
    };
  }, [schedules]);

  // Mode Handlers
  const handleModeChange = (newMode: Mode) => {
    setMode(newMode);
    if (newMode === "add") {
      setFormData({
        id: Math.random().toString(36).substr(2, 9),
        largeCategory: "TESOL",
        middleCategory: "교육",
        grade: "1급",
        lecturer: "",
        fixedDayCount: 2,
        selectedDays: [],
        startTime: "10:00",
        lunchTime: 30,
        includeHolidays: false,
        periods: [
          { duration: 45, breakAfter: 10 },
          { duration: 45, breakAfter: 10 },
          { duration: 45, breakAfter: 10 }
        ],
        startDate: TODAY.toISOString().split("T")[0],
        endDate: new Date(new Date(TODAY).setMonth(TODAY.getMonth() + 2)).toISOString().split("T")[0]
      });
      setCurrentId(null);
    }
    setShowTimetable(false);
  };

  const handleSelectSchedule = (s: Schedule) => {
    setFormData(s);
    setCurrentId(s.id);
    setShowTimetable(true);
    setViewMode("dashboard");
  };

  const handleSubmit = () => {
    if (mode === "add") {
      const newSchedule = { ...formData, id: Math.random().toString(36).substr(2, 9) };
      setSchedules([...schedules, newSchedule]);
      saveScheduleToServer(newSchedule.id, newSchedule);
      setShowTimetable(true);
      alert("✅ 새 강의 시간표가 추가되었습니다.");
    } else if (mode === "edit" && currentId) {
      setSchedules(schedules.map(s => s.id === currentId ? formData : s));
      saveScheduleToServer(currentId, formData);
      setShowTimetable(true);
      alert("📝 강의 시간표가 수정되었습니다.");
    } else if (mode === "delete" && currentId) {
      if (!window.confirm('정말 삭제하시겠습니까?')) return;
      setSchedules(schedules.filter(s => s.id !== currentId));
      deleteScheduleFromServer(currentId);
      alert("🗑️ 강의 시간표가 삭제되었습니다.");
      handleModeChange("add");
    }
  };

  // Calculations for Time
  const calculateScheduleTimes = (schedule: Schedule) => {
    const startMins = parseInt(schedule.startTime.split(":")[0]) * 60 + parseInt(schedule.startTime.split(":")[1]);
    const formatTime = (totalMins: number) => {
      const h = Math.floor(totalMins / 60) % 24;
      const m = totalMins % 60;
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    };

    const p1Start = startMins;
    const p1End = p1Start + schedule.periods[0].duration;
    const b1End = p1End + schedule.periods[0].breakAfter;

    const isMerged = schedule.periods[1].breakAfter === 0;
    
    let p2Start = b1End;
    let p2End = p2Start + schedule.periods[1].duration;
    let b2End = p2End + schedule.periods[1].breakAfter;

    let p3Start = b2End;
    let p3End = p3Start + schedule.periods[2].duration;

    if (isMerged) {
      p3Start = p2End;
      p3End = p3Start + schedule.periods[2].duration;
    }

    return {
      p1: { start: formatTime(p1Start), end: formatTime(p1End), dur: schedule.periods[0].duration, b: schedule.periods[0].breakAfter },
      p2: { start: formatTime(p2Start), end: formatTime(p2End), dur: schedule.periods[1].duration, b: schedule.periods[1].breakAfter },
      p3: { start: formatTime(p3Start), end: formatTime(p3End), dur: schedule.periods[2].duration, b: schedule.periods[2].breakAfter },
      isMerged,
      mergedBlock: isMerged ? {
        start: formatTime(p2Start),
        end: formatTime(p3End),
        dur: schedule.periods[1].duration + schedule.periods[2].duration
      } : null,
      totalEnd: formatTime(p3End),
      totalDur: schedule.periods.reduce((acc, p) => acc + p.duration, 0)
    };
  };

  const currentCalculations = useMemo(() => calculateScheduleTimes(formData), [formData]);

  // Filtering & Sorting Logic
  const filteredAndSortedSchedules = useMemo(() => {
    let result = [...schedules];
    
    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(s => 
        s.lecturer.toLowerCase().includes(q) || 
        s.largeCategory.toLowerCase().includes(q) ||
        s.middleCategory.toLowerCase().includes(q) ||
        s.grade.toLowerCase().includes(q)
      );
    }

    // Sort
    result.sort((a, b) => {
      let valA: any = a[sortConfig.key as keyof Schedule];
      let valB: any = b[sortConfig.key as keyof Schedule];
      
      if (sortConfig.key === 'date') {
        valA = new Date(a.startDate).getTime();
        valB = new Date(b.startDate).getTime();
      }

      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [schedules, searchQuery, sortConfig]);

  const handleSort = (key: SortKey) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Specific Day Preview Logic
  const selectedDayInfo = useMemo(() => {
    const dayIndex = DAYS_MAP.indexOf(selectedDayOfWeek);
    const targetDate = new Date(TODAY);
    targetDate.setDate(TODAY.getDate() + dayIndex); 
    
    const dateStr = targetDate.toISOString().split("T")[0];
    const isPast = targetDate < TODAY;
    const status = isPast ? "record" : "scheduled";
    const hasClass = formData.selectedDays.includes(selectedDayOfWeek);

    return {
      date: dateStr,
      day: selectedDayOfWeek,
      status,
      hasClass
    };
  }, [selectedDayOfWeek, formData.selectedDays]);

  const handleOpenPreview = (type: "excel" | "word") => {
    setPreviewType(type);
    setIsPreviewOpen(true);
  };

  const updatePeriod = (index: number, field: "duration" | "breakAfter", value: number) => {
    const newPeriods = [...formData.periods];
    newPeriods[index] = { ...newPeriods[index], [field]: value };
    setFormData({ ...formData, periods: newPeriods });
  };

  const selectedDetailSchedule = useMemo(() => 
    schedules.find(s => s.id === selectedDetailId), 
  [schedules, selectedDetailId]);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#334155] p-2 font-sans">
      <header className="max-w-[1600px] mx-auto mb-2 flex items-center justify-between bg-white/50 p-2 rounded-md backdrop-blur-sm border border-white/50">
        <div className="flex items-center gap-2">
          <h1 className="text-sm font-black flex items-center gap-2 text-slate-900 uppercase tracking-tighter">
            <Calendar className="w-6 h-6 text-blue-600" />
            Academy Scheduler
          </h1>
          
          <div className="h-8 w-px bg-slate-200" />

          {/* Stat Summary Widget */}
          <div className="flex items-center gap-2">
            <StatSmall icon={<BookOpen size={14}/>} label="Total Lectures" value={stats.totalLectures} />
            <StatSmall icon={<Users size={14}/>} label="Active Lecturers" value={stats.uniqueLecturers} />
            <StatSmall icon={<BarChart3 size={14}/>} label="Avg. Weekly Hrs" value={`${stats.avgWeeklyHours}h`} />
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <button 
            onClick={() => handleOpenPreview("excel")}
            className="flex items-center gap-2 px-2 py-1 text-xs font-bold text-emerald-700 bg-white border border-emerald-100 rounded-md hover:shadow-md transition-all active:scale-95"
          >
            <FileSpreadsheet size={16} />
            전체 Excel
          </button>
          <button 
            onClick={() => handleOpenPreview("word")}
            className="flex items-center gap-2 px-2 py-1 text-xs font-bold text-blue-700 bg-white border border-blue-100 rounded-md hover:shadow-md transition-all active:scale-95"
          >
            <FileText size={16} />
            전체 Word
          </button>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto grid grid-cols-12 gap-2 items-start">
        <div className="col-span-9 space-y-2">
          
          {/* Top Control Bar */}
          <div className="flex items-center justify-between bg-white border border-slate-200 p-2 rounded-md shadow-sm">
            <div className="flex gap-2 flex-1 max-w-xl">
              <ModeTab 
                active={mode === "add"} 
                onClick={() => handleModeChange("add")}
                icon={<PlusCircle size={20} />}
                label="신규 추가"
                desc="New Schedule"
                activeClass="bg-slate-900 text-white shadow-sm shadow-slate-200"
              />
              <ModeTab 
                active={mode === "edit"} 
                onClick={() => handleModeChange("edit")}
                icon={<Edit3 size={20} />}
                label="정보 수정"
                desc="Edit Existing"
                activeClass="bg-blue-600 text-white shadow-sm shadow-blue-100"
              />
              <ModeTab 
                active={mode === "delete"} 
                onClick={() => handleModeChange("delete")}
                icon={<Trash2 size={20} />}
                label="데이터 삭제"
                desc="Remove Data"
                activeClass="bg-red-500 text-white shadow-sm shadow-red-100"
              />
            </div>

            <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-md border border-slate-100 mx-1.5">
              <button 
                onClick={() => setViewMode("dashboard")}
                className={cn(
                  "flex items-center gap-2 px-2 py-1 rounded-lg text-xs font-bold transition-all",
                  viewMode === "dashboard" ? "bg-white text-slate-900 shadow-sm border border-slate-100" : "text-slate-400 hover:text-slate-600"
                )}
              >
                <LayoutDashboard size={14} />
                Dashboard
              </button>
              <button 
                onClick={() => setViewMode("list")}
                className={cn(
                  "flex items-center gap-2 px-2 py-1 rounded-lg text-xs font-bold transition-all",
                  viewMode === "list" ? "bg-white text-slate-900 shadow-sm border border-slate-100" : "text-slate-400 hover:text-slate-600"
                )}
              >
                <LayoutList size={14} />
                List View
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {viewMode === "dashboard" ? (
              <motion.div 
                key="dashboard-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-2"
              >
                {/* 4-Column (Responsive) Inputs */}
                <div className="grid grid-cols-4 gap-2">
                  {/* Expanded Lecture Info - Col Span 2 */}
                  <SectionContainer icon={<BookOpen size={18} />} title="강의 정보" className="col-span-2">
                    <div className="grid grid-cols-2 gap-2 h-full">
                      {/* Left side: Classification */}
                      <div className="space-y-1 pr-1 border-r border-slate-50">
                        <InputWrapper label="📚 대분류 (강의 과목)">
                          <div className="flex flex-wrap gap-1">
                            {(["TESOL", "번역", "AI번역", "프롬프트", "윤리"] as const).map(cat => (
                              <button
                                key={cat}
                                type="button"
                                onClick={() => setFormData({...formData, largeCategory: cat as LargeCategory})}
                                className={`px-2 py-1 text-[11px] rounded-md border ${formData.largeCategory === cat ? 'bg-blue-600 text-white border-blue-600 font-black' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-400'}`}
                              >
                                {cat}
                              </button>
                            ))}
                          </div>
                        </InputWrapper>
                        <InputWrapper label="👥 중분류 (대상)">
                          <div className="flex gap-1">
                            {(["교육", "일반", "전문"] as const).map(mid => (
                              <button
                                key={mid}
                                type="button"
                                onClick={() => setFormData({
                                  ...formData,
                                  middleCategory: mid as MiddleCategory,
                                  grade: CATEGORY_MAP[mid as MiddleCategory][0],
                                })}
                                className={`px-2 py-1 text-[11px] rounded-md border ${formData.middleCategory === mid ? 'bg-slate-800 text-white border-slate-800 font-bold' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-500'}`}
                              >
                                {mid}
                              </button>
                            ))}
                          </div>
                        </InputWrapper>
                        <InputWrapper label="🏅 소분류 (급수)">
                          <div className="flex flex-wrap gap-1">
                            {CATEGORY_MAP[formData.middleCategory].map(grade => (
                              <button
                                key={grade}
                                type="button"
                                onClick={() => setFormData({...formData, grade})}
                                className={`px-2 py-1 text-[11px] rounded-md border ${formData.grade === grade ? 'bg-slate-700 text-white border-slate-700 font-bold' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-500'}`}
                              >
                                {grade}
                              </button>
                            ))}
                          </div>
                        </InputWrapper>
                      </div>

                      {/* Right side: Lecturer & Dates */}
                      <div className="space-y-1">
                        <InputWrapper label="👨‍🏫 강사명">
                          <input 
                            type="text"
                            placeholder="강사 입력"
                            className="w-full bg-white border border-slate-200 rounded-md px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-slate-100"
                            value={formData.lecturer}
                            onChange={(e) => setFormData({...formData, lecturer: e.target.value})}
                          />
                        </InputWrapper>
                        <div className="grid grid-cols-2 gap-1">
                          <InputWrapper label="📅 시작일">
                            <input 
                              type="date"
                              className="w-full bg-white border border-slate-200 rounded-md px-2 py-1.5 text-xs outline-none focus:ring-2 focus:ring-slate-100"
                              value={formData.startDate}
                              onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                            />
                          </InputWrapper>
                          <InputWrapper label="📅 종료일">
                            <input 
                              type="date"
                              className="w-full bg-white border border-slate-200 rounded-md px-2 py-1.5 text-xs outline-none focus:ring-2 focus:ring-slate-100"
                              value={formData.endDate}
                              onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                            />
                          </InputWrapper>
                        </div>
                      </div>
                    </div>
                  </SectionContainer>

                  <SectionContainer icon={<Calendar size={18} />} title="요일 설정">
                    <div className="space-y-1">
                      <InputWrapper label="🗓️ 고정 요일 수">
                        <div className="grid grid-cols-3 gap-1">
                          {[2, 3, 4].map(count => (
                            <button
                              key={count}
                              onClick={() => setFormData({...formData, fixedDayCount: count as 2|3|4, selectedDays: []})}
                              className={cn(
                                "py-1.5 text-xs rounded-md border transition-all",
                                formData.fixedDayCount === count 
                                  ? "bg-slate-700 text-white border-slate-700 font-bold" 
                                  : "bg-white border-slate-200 hover:bg-slate-50"
                              )}
                            >
                              {count}일
                            </button>
                          ))}
                        </div>
                      </InputWrapper>
                      <InputWrapper label={`📍 요일 선택 (${formData.selectedDays.length}/${formData.fixedDayCount})`}>
                        <div className="grid grid-cols-4 gap-1">
                          {DAYS_MAP.map(day => {
                            const isSelected = formData.selectedDays.includes(day);
                            return (
                              <button
                                key={day}
                                disabled={!isSelected && formData.selectedDays.length >= formData.fixedDayCount}
                                onClick={() => {
                                  if (isSelected) {
                                    setFormData({...formData, selectedDays: formData.selectedDays.filter(d => d !== day)});
                                  } else {
                                    setFormData({...formData, selectedDays: [...formData.selectedDays, day]});
                                  }
                                }}
                                className={cn(
                                  "py-1.5 text-[10px] rounded-md border transition-all",
                                  isSelected 
                                    ? "bg-slate-100 border-slate-400 font-bold text-slate-900" 
                                    : "bg-white border-slate-200 hover:bg-slate-50 opacity-60 disabled:opacity-20"
                                )}
                              >
                                {day}
                              </button>
                            );
                          })}
                        </div>
                      </InputWrapper>
                    </div>
                  </SectionContainer>

                  <SectionContainer icon={<Clock size={18} />} title="상세 시간 설정">
                    <div className="space-y-1">
                      <InputWrapper label="⏰ 전체 시작 시각">
                        <input 
                          type="time"
                          className="w-full bg-white border border-slate-200 rounded-md px-2 py-1 text-[11px] outline-none focus:ring-1 focus:ring-slate-300"
                          value={formData.startTime}
                          onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                        />
                      </InputWrapper>
                      
                      <div className="space-y-2 border-t border-slate-50 pt-1">
                        {formData.periods.map((p, idx) => (
                          <div key={idx} className="bg-slate-50/50 p-2 rounded-lg border border-slate-100 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-black text-slate-400 uppercase">{idx + 1}교시</span>
                              <div className="flex items-center gap-1">
                                <Coffee size={10} className="text-amber-500" />
                                <span className="text-[9px] font-bold text-slate-400">쉬는시간</span>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="relative">
                                <input 
                                  type="number"
                                  className="w-full bg-white border border-slate-200 rounded px-1.5 py-0.5 text-[10px] outline-none pr-2"
                                  value={p.duration}
                                  onChange={(e) => updatePeriod(idx, "duration", parseInt(e.target.value) || 0)}
                                />
                                <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[8px] font-bold text-slate-300">m</span>
                              </div>
                              <div className="flex flex-wrap gap-0.5">
                                {[0, 5, 10, 15, 20, 30, 40, 50, 60].map(m => (
                                  <button
                                    key={m}
                                    type="button"
                                    onClick={() => updatePeriod(idx, "breakAfter", m)}
                                    className={`px-1 py-0.5 text-[9px] rounded border ${p.breakAfter === m ? 'bg-amber-500 text-white border-amber-500' : 'bg-white text-slate-500 border-slate-200'}`}
                                  >
                                    {m === 0 ? '없음' : `${m}m`}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </SectionContainer>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  <div className="col-span-3">
                    {showTimetable && (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white border border-slate-200 rounded-md overflow-hidden shadow-sm"
                      >
                        <div className="px-2 py-1 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-sm flex items-center gap-2 text-slate-700">
                              <Calendar className="w-4 h-4 text-slate-400" />
                              주간 강의 스케줄 뷰어
                            </h3>
                            <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full font-medium">요일을 클릭하여 상세 일정을 확인하세요</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => handleOpenPreview("excel")}
                              className="flex items-center gap-2 px-2 py-1.5 text-[10px] font-bold text-emerald-700 bg-white border border-emerald-100 rounded-lg hover:bg-emerald-50 transition-all"
                            >
                              <FileSpreadsheet size={12} />
                              스케줄 Excel
                            </button>
                            <button 
                              onClick={() => handleOpenPreview("word")}
                              className="flex items-center gap-2 px-2 py-1.5 text-[10px] font-bold text-blue-700 bg-white border border-blue-100 rounded-lg hover:bg-blue-50 transition-all"
                            >
                              <FileText size={12} />
                              스케줄 Word
                            </button>
                          </div>
                        </div>
                        <div className="p-2">
                          <TimetableGrid 
                            schedule={formData} 
                            calculations={currentCalculations} 
                            selectedDayOfWeek={selectedDayOfWeek}
                            onSelectDay={setSelectedDayOfWeek}
                          />
                        </div>
                      </motion.div>
                    )}
                  </div>
                  
                  <SectionContainer icon={<Settings2 size={18} />} title="제어 센터">
                    <div className="space-y-1 h-full flex flex-col">
                      {mode === "add" ? (
                        <div className="flex-1 flex flex-col justify-center">
                          <div className="p-2bg-slate-50 border border-dashed border-slate-200 rounded-md text-center mb-1.5">
                            <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Status</p>
                            <p className="text-xs text-slate-600 font-medium">새로운 정보를 입력 중입니다</p>
                          </div>
                          <button 
                            onClick={handleSubmit}
                            className="w-full bg-slate-900 text-white py-1 rounded-md text-xs font-bold hover:bg-slate-800 transition-all shadow-sm shadow-slate-200 flex items-center justify-center gap-2 active:scale-[0.98]"
                          >
                            <PlusCircle size={14} />
                            정보 저장하기
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2 flex-1 flex flex-col">
                          <div className="flex-1 max-h-[150px] overflow-y-auto space-y-1 pr-1 custom-scrollbar bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                            {schedules.map(s => (
                              <button
                                key={s.id}
                                onClick={() => handleSelectSchedule(s)}
                                className={cn(
                                  "w-full text-left p-2 rounded text-[10px] border transition-all flex items-center justify-between",
                                  currentId === s.id 
                                    ? "bg-white border-slate-400 font-bold shadow-sm" 
                                    : "bg-transparent border-transparent hover:bg-white hover:border-slate-100"
                                )}
                              >
                                <span className="truncate">{s.lecturer || "강사 미정"} ({s.largeCategory})</span>
                                {currentId === s.id && <CheckCircle2 size={10} className="text-slate-500" />}
                              </button>
                            ))}
                          </div>
                          <button 
                            onClick={handleSubmit}
                            disabled={!currentId}
                            className={cn(
                              "w-full py-1 rounded-lg text-xs font-bold transition-all mt-auto shadow-sm",
                              mode === "edit" ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-red-500 text-white hover:bg-red-600",
                              !currentId && "opacity-50 cursor-not-allowed"
                            )}
                          >
                            {mode === "edit" ? "📝 수정 반영" : "🗑️ 즉시 삭제"}
                          </button>
                        </div>
                      )}
                    </div>
                  </SectionContainer>
                </div>
              </motion.div>
            ) : (
              /* List View Mode */
              <motion.div 
                key="list-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white border border-slate-200 rounded-md overflow-hidden shadow-sm"
              >
                <div className="p-2border-b border-slate-100 bg-slate-50/30">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="font-black text-slate-800 text-sm tracking-tight">전체 강의 시간표 리스트</h3>
                      <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Total {filteredAndSortedSchedules.length} schedules registered</p>
                    </div>
                    {/* Search Bar on Top Right */}
                    <div className="relative">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="강사명 또는 분류 검색..." 
                        className="pl-9 pr-2 py-1 bg-white border border-slate-200 rounded-md text-xs outline-none focus:ring-2 focus:ring-blue-100 w-72 shadow-sm"
                      />
                    </div>
                  </div>
                  
                  {/* Sorting Buttons on Top Left */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2 flex items-center gap-1">
                      <Filter size={10} /> 정렬 필터:
                    </span>
                    <SortButton active={sortConfig.key === 'grade'} onClick={() => handleSort('grade')} label="급수순" />
                    <SortButton active={sortConfig.key === 'category'} onClick={() => handleSort('category')} label="분류순" />
                    <SortButton active={sortConfig.key === 'lecturer'} onClick={() => handleSort('lecturer')} label="강사순" />
                    <SortButton active={sortConfig.key === 'date'} onClick={() => handleSort('date')} label="날짜순" />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                        <th className="px-2 py-1 text-left">급수/분류</th>
                        <th className="px-2 py-1 text-left">강사명</th>
                        <th className="px-2 py-1 text-left">수강 기간</th>
                        <th className="px-2 py-1 text-left">수업 요일</th>
                        <th className="px-2 py-1 text-left">총 수업량</th>
                        <th className="px-2 py-1 text-right">관리</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredAndSortedSchedules.map(s => {
                        const calcs = calculateScheduleTimes(s);
                        return (
                          <tr key={s.id} className="hover:bg-slate-50/50 transition-colors group">
                            <td className="px-2 py-1">
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-blue-600 text-white uppercase">{s.grade}</span>
                                  <span className="text-[10px] font-bold text-slate-400">{s.middleCategory}</span>
                                </div>
                                <span className="text-xs font-black text-slate-700">{s.largeCategory}</span>
                              </div>
                            </td>
                            <td className="px-2 py-1 font-bold text-slate-700 text-sm">{s.lecturer || "미지정"}</td>
                            <td className="px-2 py-1 text-[11px] text-slate-400 font-medium">
                              {s.startDate} ~ {s.endDate}
                            </td>
                            <td className="px-2 py-1">
                              <div className="flex gap-1">
                                {s.selectedDays.map(d => (
                                  <span key={d} className="w-5 h-5 flex items-center justify-center bg-slate-100 rounded text-[9px] font-black text-slate-500">
                                    {d}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="px-2 py-1 text-xs font-bold text-slate-900">
                              {calcs.totalDur}분 <span className="text-[10px] text-slate-400 font-medium">/ 1일</span>
                            </td>
                            <td className="px-2 py-1 text-right">
                              <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                  onClick={() => setSelectedDetailId(s.id)}
                                  className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                  title="세부내용 보기"
                                >
                                  <Eye size={14} />
                                </button>
                                <button 
                                  onClick={() => handleSelectSchedule(s)}
                                  className="p-2 bg-slate-50 text-slate-600 rounded-lg hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                                  title="수정"
                                >
                                  <Edit3 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {filteredAndSortedSchedules.length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-2 py-1 text-center">
                            <div className="text-slate-300 mb-2 flex justify-center"><Search size={40} /></div>
                            <p className="text-sm font-bold text-slate-400">검색 결과가 없습니다.</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Preview Area */}
        <div className="col-span-3 sticky top-6">
          <div className="bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden flex flex-col h-[calc(100vh-120px)]">
            <div className="p-2bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h2 className="font-bold text-xs flex items-center gap-1.5 uppercase tracking-wider text-slate-500">
                <Clock size={14} /> LIVE PREVIEW
              </h2>
              <div className="flex gap-2">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedDayInfo.status}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className={cn(
                      "text-[9px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1",
                      selectedDayInfo.status === "record" ? "bg-slate-200 text-slate-600" : "bg-emerald-100 text-emerald-700"
                    )}
                  >
                    {selectedDayInfo.status === "record" ? <History size={10} /> : <Timer size={10} />}
                    {selectedDayInfo.status === "record" ? "기록" : "예정"}
                  </motion.div>
                </AnimatePresence>
                <span className="animate-pulse flex items-center gap-1 text-[9px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-bold">● LIVE</span>
              </div>
            </div>

            <div className="p-2flex-1 overflow-y-auto space-y-2 custom-scrollbar">
              <div className="bg-slate-50 rounded-md p-2border border-slate-100">
                <div className="flex items-center gap-1 mb-1.5">
                  <div className="w-12 h-12 bg-white rounded-md shadow-sm border border-slate-100 flex items-center justify-center text-xs relative">
                    <span className="absolute -top-1 -left-1 text-[8px] bg-blue-600 text-white px-1 rounded font-black">{formData.grade}</span>
                    {formData.largeCategory === "TESOL" ? "🎓" : 
                     formData.largeCategory === "번역" ? "📖" :
                     formData.largeCategory === "AI번역" ? "🤖" :
                     formData.largeCategory === "프롬프트" ? "⌨️" : "⚖️"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">{formData.middleCategory} / {formData.largeCategory}</div>
                    <div className="font-bold text-slate-800 leading-tight truncate">{formData.lecturer || "강사 미지정"}</div>
                    <div className="text-[10px] text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                      <Calendar size={10} /> {selectedDayInfo.date} ({selectedDayInfo.day})
                    </div>
                  </div>
                </div>
                <div className="space-y-2 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-400">수강 기간</span>
                    <span className="text-slate-600 font-bold">{formData.startDate} ~ {formData.endDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">강의 요일</span>
                    <span className="text-slate-600 font-bold">{formData.selectedDays.join(", ") || "—"}</span>
                  </div>
                </div>
              </div>

              {selectedDayInfo.hasClass ? (
                <div className="space-y-2.5">
                  <p className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1 px-1">
                    <ChevronRight size={12} /> 구성 상세 ({currentCalculations.totalDur}분)
                  </p>
                  
                  <TimeRowMini label="1교시" length={`${currentCalculations.p1.dur}분`} time={`${currentCalculations.p1.start} ~ ${currentCalculations.p1.end}`} />
                  
                  {currentCalculations.p1.b > 0 && (
                    <div className="flex items-center justify-between py-1.5 px-2 bg-amber-50 rounded-lg border border-amber-100 text-amber-700 text-[10px] font-bold">
                      <div className="flex items-center gap-1.5"><Coffee size={12} /> 휴식</div>
                      <span>{currentCalculations.p1.b}분</span>
                    </div>
                  )}

                  {currentCalculations.isMerged ? (
                    <TimeRowMini 
                      label="2~3교시(연강)" 
                      length={`${currentCalculations.mergedBlock?.dur}분`} 
                      time={`${currentCalculations.mergedBlock?.start} ~ ${currentCalculations.mergedBlock?.end}`} 
                      isLast 
                      variant="highlight"
                    />
                  ) : (
                    <>
                      <TimeRowMini label="2교시" length={`${currentCalculations.p2.dur}분`} time={`${currentCalculations.p2.start} ~ ${currentCalculations.p2.end}`} />
                      {currentCalculations.p2.b > 0 && (
                        <div className="flex items-center justify-between py-1.5 px-2 bg-amber-50 rounded-lg border border-amber-100 text-amber-700 text-[10px] font-bold">
                          <div className="flex items-center gap-1.5"><Coffee size={12} /> 휴식</div>
                          <span>{currentCalculations.p2.b}분</span>
                        </div>
                      )}
                      <TimeRowMini label="3교시" length={`${currentCalculations.p3.dur}분`} time={`${currentCalculations.p3.start} ~ ${currentCalculations.p3.end}`} isLast />
                    </>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-1 px-2 bg-slate-50/50 rounded-md border border-dashed border-slate-200">
                  <div className="text-xs mb-2 opacity-30">📅</div>
                  <p className="text-xs font-bold text-slate-400 text-center">해당 일자({selectedDayInfo.day})에는<br/>강의가 예정되어 있지 않습니다.</p>
                </div>
              )}

              {selectedDayInfo.hasClass && (
                <div className="pt-2 border-t border-dashed border-slate-200 grid grid-cols-2 gap-2">
                  <div className="bg-slate-50 p-1 rounded-lg text-center border border-slate-100">
                    <div className="text-[9px] text-slate-400 font-bold uppercase">총 수업</div>
                    <div className="text-sm font-bold text-slate-800 uppercase">{currentCalculations.totalDur}M</div>
                  </div>
                  <div className="bg-slate-900 p-1 rounded-lg text-center shadow-sm shadow-slate-200">
                    <div className="text-[9px] text-slate-300 font-bold uppercase">종료 시각</div>
                    <div className="text-sm font-bold text-white uppercase">{currentCalculations.totalEnd}</div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-2bg-slate-900 text-white mt-auto">
              <div className="text-[9px] opacity-50 mb-1 flex items-center gap-1 uppercase font-bold tracking-widest"><Download size={10} /> Final Report</div>
              <div className="text-xs font-bold tracking-tight">2026년 04월 15일 (수)</div>
            </div>
          </div>
        </div>
      </main>

      {/* Export Preview Modal */}
      <SchedulePreviewModal 
        isOpen={isPreviewOpen} 
        onClose={() => setIsPreviewOpen(false)} 
        schedule={formData} 
        calculations={currentCalculations}
        type={previewType}
      />

      {/* Detail View Modal */}
      <AnimatePresence>
        {selectedDetailId && selectedDetailSchedule && (
          <DetailViewModal 
            schedule={selectedDetailSchedule} 
            onClose={() => setSelectedDetailId(null)}
            calculations={calculateScheduleTimes(selectedDetailSchedule)}
          />
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>
    </div>
  );
}

// --- Sub Components ---

function StatSmall({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | number }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
        {icon}
      </div>
      <div>
        <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5">{label}</div>
        <div className="text-xs font-black text-slate-900 leading-none">{value}</div>
      </div>
    </div>
  );
}

function ModeTab({ active, onClick, icon, label, desc, activeClass }: { 
  active: boolean; 
  onClick: () => void; 
  icon: React.ReactNode; 
  label: string; 
  desc: string;
  activeClass: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1 px-2 py-1 rounded-md transition-all flex-1 text-left active:scale-[0.98]",
        active 
          ? activeClass 
          : "bg-white text-slate-400 hover:text-slate-600 hover:bg-slate-50 border border-slate-100"
      )}
    >
      <div className={cn(
        "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
        active ? "bg-white/20" : "bg-slate-50"
      )}>
        {icon}
      </div>
      <div className="truncate">
        <div className="text-sm font-black">{label}</div>
        <div className={cn("text-[10px] font-medium opacity-70", active ? "text-white" : "text-slate-400")}>{desc}</div>
      </div>
    </button>
  );
}

function SectionContainer({ children, title, icon, className }: { children: React.ReactNode; title: string; icon: React.ReactNode; className?: string }) {
  return (
    <div className={cn("bg-white border border-slate-200 rounded-md p-2shadow-sm hover:shadow-md transition-all h-full flex flex-col min-h-[220px]", className)}>
      <div className="flex items-center gap-2 mb-1 pb-2 border-b border-slate-50">
        <div className="text-slate-500">{icon}</div>
        <h3 className="font-bold text-[11px] tracking-widest text-slate-500 uppercase">{title}</h3>
      </div>
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}

function InputWrapper({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-wider">{label}</label>
      {children}
    </div>
  );
}

function SortButton({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all border",
        active ? "bg-slate-900 text-white border-slate-900 shadow-sm" : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
      )}
    >
      {label}
    </button>
  );
}

function TimeRowMini({ label, length, time, isLast, variant }: { label: string; length: string; time: string; isLast?: boolean; variant?: "highlight" }) {
  return (
    <div className={cn(
      "bg-white border border-slate-100 rounded-lg p-1 flex items-center justify-between shadow-sm relative",
      !isLast && "after:content-[''] after:absolute after:-bottom-2 after:left-1/2 after:-translate-x-1/2 after:w-px after:h-2 after:bg-slate-100",
      variant === "highlight" && "bg-blue-50/30 border-blue-100"
    )}>
      <div className="flex items-center gap-1">
        <div className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0",
          variant === "highlight" ? "bg-blue-100 text-blue-600" : "bg-slate-50 border border-slate-100 text-slate-400"
        )}>
          {label[0]}
        </div>
        <div>
          <div className={cn("text-[10px] font-bold", variant === "highlight" ? "text-blue-700" : "text-slate-700")}>{label}</div>
          <div className="text-[9px] text-slate-400">{length} 수업</div>
        </div>
      </div>
      <div className={cn(
        "text-[11px] font-mono font-bold px-2 py-1 rounded border",
        variant === "highlight" ? "bg-blue-600 text-white border-blue-700" : "bg-slate-50 text-slate-600 border-slate-100"
      )}>
        {time}
      </div>
    </div>
  );
}

function TimetableGrid({ 
  schedule, 
  calculations, 
  selectedDayOfWeek, 
  onSelectDay 
}: { 
  schedule: Schedule, 
  calculations: any, 
  selectedDayOfWeek: string,
  onSelectDay: (day: string) => void
}) {
  const timeSlots = [
    "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"
  ];

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[700px] border border-slate-100 rounded-md">
        <div className="grid grid-cols-8 bg-slate-50/50 border-b border-slate-100">
          <div className="p-1 text-[11px] font-bold text-slate-400 border-r border-slate-100 text-center flex items-center justify-center">
            <Clock size={12} className="mr-1" /> TIME
          </div>
          {DAYS_MAP.map(day => (
            <button
              key={day}
              onClick={() => onSelectDay(day)}
              className={cn(
                "p-1 text-xs font-bold text-center border-r border-slate-100 last:border-r-0 transition-all outline-none",
                selectedDayOfWeek === day ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-100",
                schedule.selectedDays.includes(day) && selectedDayOfWeek !== day && "bg-slate-50"
              )}
            >
              {day}
              {schedule.selectedDays.includes(day) && (
                <div className={cn(
                  "mt-1 w-1 h-1 rounded-full mx-auto",
                  selectedDayOfWeek === day ? "bg-emerald-400" : "bg-slate-400"
                )} />
              )}
            </button>
          ))}
        </div>
        <div className="relative">
          {timeSlots.map(time => (
            <div key={time} className="grid grid-cols-8 border-b border-slate-100 last:border-b-0">
              <div className="p-1 text-[10px] font-mono font-bold text-slate-400 border-r border-slate-100 text-center bg-slate-50/20">{time}</div>
              {DAYS_MAP.map(day => (
                <div 
                  key={`${time}-${day}`} 
                  onClick={() => onSelectDay(day)}
                  className={cn(
                    "p-1 border-r border-slate-100 last:border-r-0 h-16 relative transition-all cursor-pointer group",
                    selectedDayOfWeek === day ? "bg-slate-50" : "hover:bg-slate-50/50"
                  )}
                >
                  <div className={cn(
                    "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center",
                    selectedDayOfWeek === day ? "hidden" : ""
                  )}>
                    <div className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">Select</div>
                  </div>
                  {schedule.selectedDays.includes(day) && time === schedule.startTime.split(':')[0] + ":00" && (
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className="absolute inset-x-1 top-1 z-10 bg-slate-900 text-white rounded-lg p-2 shadow-sm border border-white/20 h-[110px] cursor-pointer"
                    >
                      <div className="text-[10px] font-bold truncate opacity-60 mb-0.5">{schedule.largeCategory}</div>
                      <div className="text-[11px] font-black leading-tight mb-1 truncate">{schedule.lecturer || "강사 미정"}</div>
                      <div className="flex flex-col gap-0.5 mt-auto">
                        <div className="text-[9px] bg-white/20 px-1.5 py-0.5 rounded-full inline-flex items-center gap-1 w-fit">
                          <Clock size={8} /> {calculations.p1.start}~{calculations.totalEnd}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SchedulePreviewModal({ isOpen, onClose, schedule, calculations, type }: { 
  isOpen: boolean; 
  onClose: () => void; 
  schedule: Schedule; 
  calculations: any;
  type: "excel" | "word";
}) {
  if (!isOpen) return null;

  const weeklyHrs = (schedule.selectedDays.length * calculations.totalDur) / 60;
  const start = new Date(schedule.startDate);
  const end = new Date(schedule.endDate);
  const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const totalLectures = Math.floor(totalDays / 7) * schedule.selectedDays.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative bg-white w-full max-w-2xl rounded-md shadow-sm overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="p-2border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-1">
            <div className={cn(
              "w-10 h-10 rounded-md flex items-center justify-center shadow-sm",
              type === "excel" ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"
            )}>
              {type === "excel" ? <FileSpreadsheet size={20} /> : <FileText size={20} />}
            </div>
            <div>
              <h3 className="font-black text-slate-800 tracking-tight">강의 시간표 추출 미리보기</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{type} format delivery</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-white hover:shadow-md transition-all flex items-center justify-center text-slate-400"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-3overflow-y-auto custom-scrollbar bg-white">
          <div className="mb-2 flex justify-between items-end border-b-2 border-slate-900 pb-2">
            <h4 className="text-sm font-black text-slate-900">
              {totalDays > 30 ? Math.floor(totalDays/7) : 1} Weeks {schedule.selectedDays.length > 5 ? "Weekends" : "Weekdays"} ({schedule.selectedDays.join(", ")})
            </h4>
            <span className="text-[10px] font-bold text-slate-400">Generated: 2026.03.10</span>
          </div>

          <table className="w-full border-collapse text-[11px] font-medium mb-1.5">
            <thead>
              <tr className="bg-slate-50 text-slate-400 border-y border-slate-200 uppercase tracking-tighter text-[9px] font-black">
                <th className="p-1 text-left w-1/4">교시 구분 (Class Hour)</th>
                <th className="p-1 text-center">시간 (Time Range)</th>
                <th className="p-1 text-right w-1/4">수업량 (Duration)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100">
                <td className="p-1 font-bold text-slate-800">1st Class Hour</td>
                <td className="p-1 text-center text-slate-600 font-mono">{calculations.p1.start} ~ {calculations.p1.end}</td>
                <td className="p-1 text-right text-slate-400">{calculations.p1.dur}m</td>
              </tr>
              
              {calculations.p1.b > 0 && (
                <tr className="bg-amber-50/30 border-b border-amber-100">
                  <td className="p-1 font-bold text-amber-700 italic flex items-center gap-1.5">
                    <Coffee size={12} /> Break/Rest
                  </td>
                  <td className="p-1 text-center text-amber-600 font-mono italic">—</td>
                  <td className="p-1 text-right text-amber-500 font-bold">{calculations.p1.b}m</td>
                </tr>
              )}

              {calculations.isMerged ? (
                <tr className="border-b border-slate-100 bg-blue-50/20">
                  <td className="p-1 font-bold text-blue-700">2~3rd Class Hour (Merged)</td>
                  <td className="p-1 text-center text-blue-600 font-mono font-black">{calculations.mergedBlock?.start} ~ {calculations.mergedBlock?.end}</td>
                  <td className="p-1 text-right text-blue-500 font-black">{calculations.mergedBlock?.dur}m</td>
                </tr>
              ) : (
                <>
                  <tr className="border-b border-slate-100">
                    <td className="p-1 font-bold text-slate-800">2nd Class Hour</td>
                    <td className="p-1 text-center text-slate-600 font-mono">{calculations.p2.start} ~ {calculations.p2.end}</td>
                    <td className="p-1 text-right text-slate-400">{calculations.p2.dur}m</td>
                  </tr>
                  {calculations.p2.b > 0 && (
                    <tr className="bg-amber-50/30 border-b border-amber-100">
                      <td className="p-1 font-bold text-amber-700 italic flex items-center gap-1.5">
                        <Coffee size={12} /> Break/Rest
                      </td>
                      <td className="p-1 text-center text-amber-600 font-mono italic">—</td>
                      <td className="p-1 text-right text-amber-500 font-bold">{calculations.p2.b}m</td>
                    </tr>
                  )}
                  <tr className="border-b border-slate-100">
                    <td className="p-1 font-bold text-slate-800">3rd Class Hour</td>
                    <td className="p-1 text-center text-slate-600 font-mono">{calculations.p3.start} ~ {calculations.p3.end}</td>
                    <td className="p-1 text-right text-slate-400">{calculations.p3.dur}m</td>
                  </tr>
                </>
              )}
            </tbody>
          </table>

          <div className="bg-slate-50 rounded-md p-2border border-slate-100">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Calculated Total</p>
                <div className="text-sm font-black text-slate-900 leading-tight">
                  {calculations.totalDur}m × {totalLectures} Days = {(calculations.totalDur * totalLectures)}m
                  <span className="text-slate-400 text-xs ml-2 font-bold">({Math.floor((calculations.totalDur * totalLectures) / 60)}Hrs)</span>
                </div>
              </div>
              <div className="space-y-1 text-right border-l border-slate-200 pl-1">
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Weekly Load</p>
                <div className="text-sm font-black text-slate-900">
                  Weekly {Math.floor(weeklyHrs)}Hrs {weeklyHrs % 1 !== 0 ? Math.round((weeklyHrs % 1) * 60) + "m" : ""}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-2border-t border-slate-100 flex gap-1 bg-slate-50/30">
          <button onClick={onClose} className="flex-1 px-2 py-1 rounded-md text-xs font-bold text-slate-500 bg-white border border-slate-200">취소</button>
          <button 
            onClick={() => { alert("다운로드 시작"); onClose(); }}
            className={cn(
              "flex-[2] px-2 py-1 rounded-md text-xs font-bold text-white shadow-sm flex items-center justify-center gap-2",
              type === "excel" ? "bg-emerald-600 shadow-emerald-100" : "bg-blue-600 shadow-blue-100"
            )}
          >
            <Download size={16} /> 파일 다운로드
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function DetailViewModal({ schedule, onClose, calculations }: { 
  schedule: Schedule; 
  onClose: () => void; 
  calculations: any;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, rotateY: 20 }}
        animate={{ opacity: 1, scale: 1, rotateY: 0 }}
        exit={{ opacity: 0, scale: 0.9, rotateY: -20 }}
        className="relative bg-white w-full max-w-4xl rounded-[40px] shadow-sm overflow-hidden grid grid-cols-12 max-h-[85vh]"
      >
        <div className="col-span-8 p-3overflow-y-auto custom-scrollbar">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <div className="w-14 h-14 bg-blue-600 rounded-md flex items-center justify-center shadow-sm shadow-blue-100 text-white relative">
                <span className="absolute -top-2 -left-2 bg-slate-900 text-[10px] font-black px-2 py-0.5 rounded-full">{schedule.grade}</span>
                <BookOpen size={28} />
              </div>
              <div>
                <div className="text-[11px] font-black text-blue-600 uppercase tracking-[0.2em] mb-1">{schedule.middleCategory} / {schedule.largeCategory}</div>
                <h2 className="text-xs font-black text-slate-900 tracking-tight">{schedule.lecturer || "미지정 강사"}</h2>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Status</div>
              <div className="px-2 py-1.5 bg-slate-100 rounded-full text-xs font-black text-slate-600 inline-block">Active</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-1">
            <div className="space-y-2">
              <DetailField label="수강 기간" value={`${schedule.startDate} ~ ${schedule.endDate}`} icon={<Calendar size={14}/>} />
              <DetailField label="수업 요일" value={schedule.selectedDays.join(", ") + " (주 " + schedule.selectedDays.length + "회)"} icon={<Clock size={14}/>} />
              <DetailField label="시작 시각" value={schedule.startTime} icon={<Timer size={14}/>} />
            </div>
            <div className="space-y-2">
              <DetailField label="휴일 수업" value={schedule.includeHolidays ? "포함 (진행)" : "제외 (휴강)"} icon={<AlertCircle size={14}/>} />
              <DetailField label="일일 총 수업" value={`${calculations.totalDur}분`} icon={<BarChart3 size={14}/>} />
              <DetailField label="종료 시각" value={calculations.totalEnd} icon={<ArrowRight size={14}/>} />
            </div>
          </div>

          <div className="border-t border-slate-100 pt-1">
            <h4 className="text-sm font-black text-slate-900 mb-1.5 uppercase tracking-wider flex items-center gap-2">
              <LayoutList size={16} className="text-blue-600" />
              세부 교시 구성
            </h4>
            <div className="grid grid-cols-3 gap-2">
              {schedule.periods.map((p, i) => (
                <div key={i} className="bg-slate-50 border border-slate-100 rounded-md p-2">
                  <div className="text-[10px] font-black text-slate-400 uppercase mb-2">{i+1}교시</div>
                  <div className="text-sm font-black text-slate-900 mb-1">{p.duration}m</div>
                  <div className="text-[10px] text-slate-500 font-bold">쉬는시간: {p.breakAfter}분</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-4 bg-slate-900 p-3flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full -mr-32 -mt-1 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/10 rounded-full -ml-32 -mb-1 blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <div className="mb-1">
              <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1.5">Quick Summary</div>
              <div className="space-y-2">
                <SummaryItem label="Weekly Total" value={`${((calculations.totalDur * schedule.selectedDays.length)/60).toFixed(1)}h`} />
                <SummaryItem label="Sessions/Week" value={`${schedule.selectedDays.length} Times`} />
                <SummaryItem label="Grade Class" value={schedule.grade} color="text-emerald-400" />
              </div>
            </div>
          </div>

          <div className="relative z-10 space-y-1">
            <button className="w-full py-1 bg-blue-600 text-white rounded-md font-black text-sm shadow-sm shadow-blue-900/40 hover:bg-blue-500 transition-all flex items-center justify-center gap-2">
              <Printer size={18} />
              강사 배포용 출력
            </button>
            <button 
              onClick={onClose}
              className="w-full py-1 bg-white/10 text-white border border-white/10 rounded-md font-black text-sm hover:bg-white/20 transition-all"
            >
              닫기
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function DetailField({ label, value, icon }: { label: string, value: string, icon: React.ReactNode }) {
  return (
    <div className="flex items-start gap-1">
      <div className="mt-1 text-blue-500 bg-blue-50 p-2 rounded-lg">
        {icon}
      </div>
      <div>
        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{label}</div>
        <div className="text-sm font-bold text-slate-700">{value}</div>
      </div>
    </div>
  );
}

function SummaryItem({ label, value, color = "text-white" }: { label: string, value: string, color?: string }) {
  return (
    <div className="flex items-center justify-between border-b border-white/5 pb-2">
      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>
      <span className={cn("text-sm font-black tracking-tight", color)}>{value}</span>
    </div>
  );
}

export default SchedulePage;
