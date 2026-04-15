import React, { useState, useMemo, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  List,
  Download, 
  FileSpreadsheet, 
  FileText, 
  Plus, 
  Edit, 
  Trash2, 
  Lock, 
  Star, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  Filter,
  Eye,
  Settings2,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  X,
  PieChart,
  Tag,
  Share2,
  ExternalLink,
  Check,
  TrendingUp,
  Briefcase,
  User,
  Activity,
  LayoutGrid
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays, 
  eachDayOfInterval,
  parseISO,
  isToday
} from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { 
  PieChart as RePieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip as ReTooltip,
  Legend
} from 'recharts';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** 
 * Utility for Tailwind classes
 */
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---

type Duration = '10' | '30' | '60';
type CategoryType = 'personal' | 'work';
type AppMode = 'VIEW' | 'ADD' | 'EDIT' | 'DELETE';

interface Category {
  id: string;
  name: string;
  type: CategoryType;
  emoji: string;
}

interface Schedule {
  id: string;
  title: string;
  categoryId: string;
  date: string; // ISO format
  time: string; // HH:mm
  duration: Duration;
  location: string;
  note: string;
  isImportant: boolean;
  status: 'pending' | 'confirmed';
}

// --- Mock Data ---

const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat-1', name: '병원', type: 'personal', emoji: '🏥' },
  { id: 'cat-2', name: '강사미팅', type: 'work', emoji: '👨‍🏫' },
  { id: 'cat-3', name: '거래처', type: 'work', emoji: '🤝' },
];

const INITIAL_SCHEDULES: Schedule[] = [
  {
    id: 's-1',
    title: '정기 검진',
    categoryId: 'cat-1',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: '10:30',
    duration: '30',
    location: '서울대학교병원',
    note: '공복 유지 필요',
    isImportant: true,
    status: 'confirmed'
  },
  {
    id: 's-2',
    title: '전략 미팅',
    categoryId: 'cat-2',
    date: format(addDays(new Date(), 2), 'yyyy-MM-dd'),
    time: '14:00',
    duration: '60',
    location: '본사 소회의실',
    note: 'Q3 보고서 지참',
    isImportant: false,
    status: 'pending'
  },
  {
    id: 's-3',
    title: 'ABC 파트너스 오찬',
    categoryId: 'cat-3',
    date: format(addDays(new Date(), 3), 'yyyy-MM-dd'),
    time: '12:00',
    duration: '60',
    location: '파크하얏트 호텔',
    note: '대표님 채식 선호 확인',
    isImportant: true,
    status: 'confirmed'
  }
];

// --- Helper Components ---

const getDurationColor = (duration: Duration) => {
  switch (duration) {
    case '10': return 'bg-emerald-50 border-emerald-100 text-emerald-700';
    case '30': return 'bg-sky-50 border-sky-100 text-sky-700';
    case '60': return 'bg-slate-50 border-slate-200 text-slate-700';
    default: return 'bg-slate-50 border-slate-100';
  }
};

// --- Components ---

// --- API helpers ---
function saveMeetingToServer(id: string, data: any) {
  fetch('/api/meetings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ meeting_id: id, data })
  }).catch(() => {});
}

function deleteMeetingFromServer(id: string) {
  fetch(`/api/meetings/${id}`, { method: 'DELETE' }).catch(() => {});
}

export default function MeetingsPage() {
  const [mode, setMode] = useState<AppMode>('VIEW');
  const [viewType, setViewType] = useState<'calendar' | 'list'>('calendar');
  const [showPreview, setShowPreview] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [schedules, setSchedules] = useState<Schedule[]>(INITIAL_SCHEDULES);

  // Load from API on mount
  useEffect(() => {
    fetch('/api/meetings').then(r => r.json()).then((rows: any[]) => {
      if (rows.length > 0) {
        // Restore categories if saved separately
        const catRow = rows.find((r: any) => r.meeting_id === '_categories');
        if (catRow?.data && Array.isArray(catRow.data) && catRow.data.length > 0) {
          setCategories(catRow.data);
        }
        // Load schedules (exclude the categories meta-row)
        const scheduleRows = rows.filter((r: any) => r.meeting_id !== '_categories');
        const loaded = scheduleRows.map((r: any) => r.data).filter(Boolean);
        if (loaded.length > 0) {
          setSchedules(loaded as Schedule[]);
        }
      }
    }).catch(() => {}); // silent fallback to mock
  }, []);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [activeFilters, setActiveFilters] = useState<string[]>(INITIAL_CATEGORIES.map(c => c.id));
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  // Export handlers
  const handleDownload = (type: 'EXCEL' | 'WORD') => {
    alert(`${type} 형식으로 모든 자료를 다운로드합니다.`);
  };

  const handleShareLink = () => {
    const mockUrl = `https://booking.ceo.com/schedule/${format(new Date(), 'yyyyMMdd')}`;
    navigator.clipboard.writeText(mockUrl);
    toast.success('신청용 링크가 복사되었습니다!', {
      description: '이 링크를 신청자에게 전달하여 미팅을 요청받을 수 있습니다.',
      duration: 3000,
    });
    setShowPreview(true);
  };

  // Availability logic
  const getDayAvailability = (day: Date) => {
    const isWeekend = day.getDay() === 0 || day.getDay() === 6;
    const daySchedules = schedules.filter(s => isSameDay(parseISO(s.date), day));
    if (isWeekend) return 'CLOSED';
    if (daySchedules.length > 0) return 'CLOSED'; 
    return 'OPEN';
  };

  const filteredSchedules = useMemo(() => {
    return schedules.filter(s => activeFilters.includes(s.categoryId));
  }, [schedules, activeFilters]);

  const statsData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredSchedules.forEach(s => {
      const cat = categories.find(c => c.id === s.categoryId);
      if (cat) {
        counts[cat.name] = (counts[cat.name] || 0) + 1;
      }
    });
    return Object.entries(counts).map(([name, value], i) => ({
      name,
      value,
      color: ['#1e293b', '#6366f1', '#f59e0b', '#10b981', '#ef4444'][i % 5]
    }));
  }, [filteredSchedules, categories]);

  if (showPreview) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-2 sm:p-1 font-sans">

        <button 
          onClick={() => setShowPreview(false)}
          className="fixed top-8 left-8 flex items-center gap-2 bg-white/10 hover:bg-white/20 px-2 py-1 rounded-full text-sm font-bold transition-all border border-white/10 backdrop-blur-md"
        >
          <ChevronLeft size={16} /> 대시보드로 돌아가기
        </button>
        
        <main className="w-full max-w-6xl bg-white text-slate-900 rounded-[3rem] shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[700px]">
          {/* Left: Calendar Preview */}
          <div className="flex-1 p-2 border-r border-slate-100 overflow-y-auto">
            <div className="mb-1 flex items-center justify-between">
              <div>
                <h1 className="text-base font-black tracking-tight text-slate-800">미팅 예약 신청</h1>
                <p className="text-slate-400 font-bold mt-1 uppercase tracking-widest text-xs">CEO Secretary Schedule Service</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-black text-slate-400 uppercase">Current Month</p>
                <p className="text-sm font-bold text-slate-800">{format(new Date(), 'yyyy년 MM월')}</p>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                <div key={`head-${i}`} className="text-center text-[10px] font-black text-slate-300 py-1 uppercase tracking-widest">{d}</div>
              ))}
              {(() => {
                const monthStart = startOfMonth(new Date());
                const monthEnd = endOfMonth(monthStart);
                const startDate = startOfWeek(monthStart);
                const endDate = endOfWeek(monthEnd);
                const days = eachDayOfInterval({ start: startDate, end: endDate });

                return days.map((day, i) => {
                  const availability = getDayAvailability(day);
                  const isCurrentMonth = isSameMonth(day, monthStart);
                  const isSelected = isSameDay(day, selectedDate);
                  const isPast = day < startOfDay(new Date()) && !isToday(day);
                  
                  return (
                    <div
                      key={`preview-day-${i}`}
                      onClick={() => availability === 'OPEN' && setSelectedDate(day)}
                      className={cn(
                        "aspect-square p-2 flex flex-col items-center justify-center rounded-md transition-all relative border border-transparent",
                        !isCurrentMonth ? "opacity-20" : "opacity-100",
                        availability === 'OPEN' ? "cursor-pointer hover:border-slate-200 hover:bg-slate-50 active:scale-95" : "cursor-not-allowed bg-slate-50/30",
                        isSelected && "bg-slate-800 text-white hover:bg-slate-800 ring-2 ring-inset ring-slate-800 z-10 shadow-sm",
                        availability === 'CLOSED' && "cursor-not-allowed"
                      )}
                    >
                      <span className="text-xs font-bold">{format(day, 'd')}</span>
                      {isCurrentMonth && !isPast && (
                        <div className={cn(
                          "mt-auto px-2 py-1 rounded-lg text-[10px] font-black flex items-center gap-1.5 transition-all shadow-sm border",
                          isSelected 
                            ? "bg-white/20 border-white/20 text-white" 
                            : (availability === 'OPEN' 
                                ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                                : "bg-slate-100 text-slate-400 border-slate-200")
                        )}>
                          <span className="text-[14px] leading-none shrink-0">
                            {availability === 'OPEN' ? '🟢' : '🔘'}
                          </span>
                          <span className="tracking-tight">{availability === 'OPEN' ? '요청가능' : '요청불가'}</span>
                        </div>
                      )}
                    </div>
                  );
                });
              })()}
            </div>
          </div>

          {/* Right: Request Form */}
          <div className="w-full md:w-[400px] bg-slate-50/50 p-2 flex flex-col overflow-y-auto">
            <div className="mb-1">
              <h2 className="text-sm font-bold text-slate-800 mb-1">신청 폼</h2>
              <p className="text-sm text-slate-500 font-medium">{format(selectedDate, 'yyyy년 MM월 dd일')} 미팅 요청</p>
            </div>

            <div className="space-y-2">
              <div>
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">미팅 제목</label>
                <input type="text" placeholder="예: 사업 제안 및 협력 논의" className="w-full bg-white border border-slate-200 rounded-md px-2 py-1 text-sm font-medium focus:ring-2 focus:ring-slate-800 outline-none transition-all shadow-sm" />
              </div>

              <div>
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">분류 선택</label>
                <div className="grid grid-cols-2 gap-2">
                  {['개인', '업무'].map(type => (
                    <button key={type} className="flex items-center justify-center gap-2 py-1 bg-white border border-slate-200 rounded-md text-sm font-bold text-slate-600 hover:border-slate-800 hover:text-slate-800 transition-all shadow-sm">
                      {type === '업무' ? '🏢 업무' : '👤 개인'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">희망 소요 시간</label>
                <div className="grid grid-cols-3 gap-2">
                  {['10분', '30분', '1시간'].map(time => (
                    <button key={time} className="flex items-center justify-center py-1 bg-white border border-slate-200 rounded-md text-[11px] font-bold text-slate-600 hover:border-slate-800 hover:text-slate-800 transition-all shadow-sm">
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">미팅 장소 요청</label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" placeholder="예: 판교 사옥 3층 미팅실" className="w-full bg-white border border-slate-200 rounded-md pl-11 pr-2 py-1 text-sm font-medium focus:ring-2 focus:ring-slate-800 outline-none transition-all shadow-sm" />
                </div>
              </div>

              <div>
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">코멘트 / 추가 요청사항</label>
                <textarea rows={4} placeholder="비서에게 전달할 메모를 입력해주세요." className="w-full bg-white border border-slate-200 rounded-md px-2 py-1 text-sm font-medium focus:ring-2 focus:ring-slate-800 outline-none transition-all resize-none shadow-sm" />
              </div>

              <button 
                onClick={() => {
                  toast.success('미팅 요청이 완료되었습니다!', { description: '비서 확인 후 일정이 확정됩니다.' });
                  setShowPreview(false);
                }}
                className="w-full bg-slate-800 text-white py-1 rounded-md font-bold text-md shadow-sm shadow-slate-200 hover:bg-slate-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 size={20} /> 미팅 요청하기
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 flex flex-col">

      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-2 py-1.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-slate-800 rounded-lg text-white">
            <Settings2 size={18} />
          </div>
          <div>
            <h1 className="text-sm font-bold">스케줄링 대시보드</h1>
            <p className="text-[9px] text-slate-500 font-medium uppercase tracking-wider">CEO Secretary Dashboard</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-1.5 text-slate-400 hover:text-slate-800 transition-colors"><Star size={16} /></button>
          <button className="p-1.5 text-slate-400 hover:text-slate-800 transition-colors"><Activity size={16} /></button>
          <div className="w-7 h-7 rounded-full bg-slate-200 border border-slate-300 overflow-hidden">
            <ImageWithFallback src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=100&h=100&fit=crop" alt="avatar" />
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden flex flex-col md:flex-row p-1 gap-1">
        {/* Main Content Area */}
        <section className="flex-1 bg-white rounded-md border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          <div className="p-1 border-b border-slate-100 bg-slate-50/30">
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-slate-800 text-white rounded-lg shadow-sm">
                    <CalendarIcon size={18} />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-800">통합 스케줄러</h2>
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Master Scheduling Engine</p>
                  </div>
                </div>

                {/* Regulation 2: Mode Toggle */}
                <div className="flex items-center bg-slate-200/50 p-1 rounded-lg border border-slate-200/50">
                  <button
                    onClick={() => setViewType('calendar')}
                    className={cn(
                      "flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-black transition-all",
                      viewType === 'calendar' ? "bg-white text-slate-800 shadow-md" : "text-slate-400 hover:text-slate-600"
                    )}
                  >
                    <LayoutGrid size={14} /> 캘린더형
                  </button>
                  <button
                    onClick={() => setViewType('list')}
                    className={cn(
                      "flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-black transition-all",
                      viewType === 'list' ? "bg-white text-slate-800 shadow-md" : "text-slate-400 hover:text-slate-600"
                    )}
                  >
                    <List size={14} /> 리스트형
                  </button>
                </div>
              </div>

              {/* Regulation 1: Visualized Summary Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {[
                  { label: '전체 일정', value: schedules.length, icon: Briefcase, color: 'indigo', trend: '+12%' },
                  { label: '확정된 미팅', value: schedules.filter(s => s.status === 'confirmed').length, icon: CheckCircle2, color: 'emerald', trend: '최적' },
                  { label: '평균 소요', value: '35분', icon: Clock, color: 'amber', trend: '적정' },
                  { label: '예약 점유율', value: '84%', icon: TrendingUp, color: 'rose', trend: '+5.2%' },
                ].map((stat, i) => (
                  <div key={i} className="bg-white p-2.5 rounded-md border border-slate-100 shadow-sm hover:shadow-md transition-all flex items-center gap-2.5 group">
                    <div className={cn(
                      "p-2 rounded-lg transition-transform group-hover:scale-110",
                      stat.color === 'indigo' ? "bg-indigo-50 text-indigo-600" :
                      stat.color === 'emerald' ? "bg-emerald-50 text-emerald-600" :
                      stat.color === 'amber' ? "bg-amber-50 text-amber-600" : "bg-rose-50 text-rose-600"
                    )}>
                      <stat.icon size={16} />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                        <span className="text-[8px] font-bold text-emerald-500 bg-emerald-50 px-1 py-0 rounded-full">{stat.trend}</span>
                      </div>
                      <p className="text-xs font-bold text-slate-800 leading-none mt-0.5">{stat.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Toolbar: Navigation & Filter */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 shadow-sm">
                  <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-1.5 hover:bg-slate-50 rounded-md transition-colors">
                    <ChevronLeft size={16} className="text-slate-400" />
                  </button>
                  <span className="text-xs font-black px-2 min-w-[110px] text-center text-slate-700">
                    {format(currentMonth, 'yyyy년 MM월')}
                  </span>
                  <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-1.5 hover:bg-slate-50 rounded-md transition-colors">
                    <ChevronRight size={16} className="text-slate-400" />
                  </button>
                </div>

                <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 shadow-sm">
                  <Filter size={12} className="text-slate-400" />
                  <div className="flex items-center gap-2.5">
                    {categories.map((cat, idx) => (
                      <label key={`filter-cat-${cat.id}-${idx}`} className="flex items-center gap-2 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          checked={activeFilters.includes(cat.id)}
                          onChange={() => {
                            setActiveFilters(prev => 
                              prev.includes(cat.id) ? prev.filter(id => id !== cat.id) : [...prev, cat.id]
                            );
                          }}
                          className="h-4 w-4 rounded-md border-slate-300 text-slate-800 focus:ring-slate-800 transition-all cursor-pointer"
                        />
                        <span className="text-xs font-bold text-slate-600 group-hover:text-slate-900 flex items-center gap-1">
                          {cat.emoji} {cat.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic Content View */}
          <div className="flex-1 overflow-y-auto p-1 bg-white">
            {viewType === 'calendar' ? (
              <div className="flex flex-col h-full">
                <div className="grid grid-cols-7 border-b border-slate-100 pb-1.5">
                  {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((d, i) => (
                    <div key={`weekday-${i}`} className={cn(
                      "text-center text-[10px] font-black uppercase tracking-[0.2em]",
                      i === 0 ? "text-rose-400" : i === 6 ? "text-indigo-400" : "text-slate-400"
                    )}>
                      {d}
                    </div>
                  ))}
                </div>
                
                <div className="grid grid-cols-7 flex-1 border-l border-t border-slate-100 mt-1">
                  {(() => {
                    const monthStart = startOfMonth(currentMonth);
                    const monthEnd = endOfMonth(monthStart);
                    const startDate = startOfWeek(monthStart);
                    const endDate = endOfWeek(monthEnd);
                    const days = eachDayOfInterval({ start: startDate, end: endDate });

                    return days.map(day => {
                      const daySchedules = filteredSchedules.filter(s => isSameDay(parseISO(s.date), day));
                      const isCurrentMonth = isSameMonth(day, monthStart);
                      const isToday = isSameDay(day, new Date());
                      const isSelected = isSameDay(day, selectedDate);
                      const availability = getDayAvailability(day);

                      return (
                        <div
                          key={day.toISOString()}
                          onClick={() => setSelectedDate(day)}
                          className={cn(
                            "min-h-[100px] p-1.5 border-r border-b border-slate-100 transition-all flex flex-col gap-1 relative group cursor-pointer",
                            !isCurrentMonth ? "bg-slate-50/40 opacity-50" : "bg-white",
                            isSelected ? "ring-2 ring-inset ring-slate-800 bg-slate-50/50 z-10" : "hover:bg-slate-50/80"
                          )}
                        >
                          {isCurrentMonth && (
                            <div className="absolute top-0 left-0 right-0 h-1 flex">
                              <div className={cn(
                                "h-full flex-1 transition-all",
                                availability === 'OPEN' ? "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.3)]" : "bg-slate-200"
                              )} />
                            </div>
                          )}

                          <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                              <span className={cn(
                                "text-xs font-bold w-6 h-6 flex items-center justify-center rounded-lg transition-all",
                                isToday ? "bg-slate-800 text-white shadow-sm shadow-slate-200" : "text-slate-600",
                                !isCurrentMonth && "text-slate-300"
                              )}>
                                {format(day, 'd')}
                              </span>
                              {isCurrentMonth && (
                                <div className={cn(
                                  "mt-0.5 px-1.5 py-0.5 rounded-md text-[8px] font-black flex items-center gap-1 w-fit shadow-sm border transition-transform group-hover:scale-105",
                                  availability === 'OPEN' 
                                    ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                                    : "bg-slate-50 text-slate-400 border-slate-100 opacity-60"
                                )}>
                                  <span className="text-[10px] leading-none shrink-0">
                                    {availability === 'OPEN' ? '🟢' : '🔘'}
                                  </span>
                                  <span className="tracking-tighter">{availability === 'OPEN' ? '가능' : '불가'}</span>
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                              <button onClick={(e) => { e.stopPropagation(); setMode('ADD'); setSelectedDate(day); }} className="p-1.5 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-800 hover:text-white transition-all"><Plus size={12} /></button>
                            </div>
                          </div>

                          <div className="space-y-1 overflow-hidden mt-0.5">
                            {daySchedules.slice(0, 3).map((s, idx) => {
                              const cat = categories.find(c => c.id === s.categoryId);
                              return (
                                <motion.div
                                  layoutId={`schedule-${s.id}`}
                                  key={`cell-${day.toISOString()}-${s.id}-${idx}`}
                                  onClick={(e) => { e.stopPropagation(); setSelectedSchedule(s); }}
                                  className={cn(
                                    "p-1.5 rounded-lg border text-[9px] font-bold flex flex-col gap-0.5 shadow-sm transition-all active:scale-95 cursor-pointer hover:shadow-md border-l-4",
                                    getDurationColor(s.duration)
                                  )}
                                >
                                  <div className="flex items-center justify-between gap-1">
                                    <span className="truncate text-slate-800 flex items-center gap-1">
                                      {cat?.emoji} {s.title}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between opacity-60 text-[9px]">
                                    <span>{s.time}</span>
                                    {s.status === 'confirmed' && <Check size={10} />}
                                  </div>
                                </motion.div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            ) : (
              /* List View Rendering */
              <div className="max-w-4xl mx-auto space-y-2 pb-2">
                {filteredSchedules.sort((a, b) => a.date.localeCompare(b.date)).map((s, idx) => {
                  const cat = categories.find(c => c.id === s.categoryId);
                  const sDate = parseISO(s.date);
                  return (
                    <motion.div
                      key={`list-item-${s.id}-${idx}`}
                      layoutId={`schedule-${s.id}`}
                      onClick={() => setSelectedSchedule(s)}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="group bg-white p-1 rounded-md border border-slate-100 shadow-sm hover:border-slate-800 hover:shadow-sm transition-all cursor-pointer flex items-center gap-2"
                    >
                      <div className="flex flex-col items-center justify-center w-14 h-14 bg-slate-50 rounded-md border border-slate-100 text-slate-400 group-hover:bg-slate-800 group-hover:text-white transition-all">
                        <span className="text-[9px] font-black uppercase tracking-wider">{format(sDate, 'MMM')}</span>
                        <span className="text-sm font-black leading-none">{format(sDate, 'd')}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs">{cat?.emoji}</span>
                          <h4 className="font-bold text-slate-800 text-sm tracking-tight">{s.title}</h4>
                          <span className={cn(
                            "px-2 py-0.5 rounded-full text-[9px] font-black border tracking-wider uppercase",
                            cat?.type === 'work' ? "bg-indigo-50 text-indigo-600 border-indigo-100" : "bg-orange-50 text-orange-600 border-orange-100"
                          )}>
                            {cat?.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-500 text-xs font-bold opacity-70">
                          <div className="flex items-center gap-1.5"><Clock size={13} /> <span>{s.time} ({s.duration}분)</span></div>
                          <div className="flex items-center gap-1.5"><MapPin size={13} /> <span className="truncate">{s.location}</span></div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "px-2.5 py-1 rounded-lg text-[10px] font-black border shadow-sm transition-all",
                          s.status === 'confirmed' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-50 text-slate-400 border-slate-100"
                        )}>
                          {s.status === 'confirmed' ? 'CONFIRMED' : 'PENDING'}
                        </div>
                        <ChevronRight size={18} className="text-slate-200 group-hover:text-slate-800 transition-all" />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Sidebar */}
        <section className="w-full md:w-[280px] flex flex-col gap-1">
          <div className="bg-white rounded-md border border-slate-200 shadow-sm p-1 flex flex-col h-full overflow-hidden">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-1">
              <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg"><PieChart size={16} /></div>
              분석 리포트
            </h2>
            <div className="flex-1 overflow-y-auto space-y-1 pr-1">
              <div>
                <p className="text-[9px] font-black text-slate-400 mb-2 uppercase tracking-widest">일정 타입 분포</p>
                <div className="h-[160px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Pie
                        data={statsData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={65}
                        paddingAngle={8}
                        dataKey="value"
                        nameKey="name"
                        stroke="none"
                      >
                        {statsData.map((entry, index) => <Cell key={`pie-${index}`} fill={entry.color} />)}
                      </Pie>
                      <ReTooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} />
                    </RePieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="space-y-2 pt-1 border-t border-slate-100">
                <button onClick={handleShareLink} className="w-full flex items-center justify-between p-1 bg-slate-800 text-white rounded-md shadow-sm hover:bg-slate-700 transition-all group">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-white/10 rounded-lg"><Share2 size={16} /></div>
                    <div className="text-left">
                      <p className="text-xs font-bold">신청 링크 복사</p>
                      <p className="text-[9px] opacity-60 italic">Booking Link</p>
                    </div>
                  </div>
                  <ChevronRight size={14} className="opacity-40" />
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => handleDownload('EXCEL')} className="flex flex-col items-start gap-2 p-1 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-100 hover:bg-emerald-100 transition-all group">
                    <div className="p-1.5 bg-emerald-600 text-white rounded-lg"><FileSpreadsheet size={14} /></div>
                    <p className="text-[10px] font-black uppercase tracking-widest">Excel</p>
                  </button>
                  <button onClick={() => handleDownload('WORD')} className="flex flex-col items-start gap-2 p-1 bg-blue-50 text-blue-700 rounded-md border border-blue-100 hover:bg-blue-100 transition-all group">
                    <div className="p-1.5 bg-blue-600 text-white rounded-lg"><FileText size={14} /></div>
                    <p className="text-[10px] font-black uppercase tracking-widest">Word</p>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Regulation 3: Details Preview Modal */}
      <AnimatePresence>
        {selectedSchedule && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-2">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedSchedule(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="relative w-full max-w-[380px] bg-white rounded-md overflow-hidden shadow-sm border border-slate-200"
            >
              <div className="h-40 relative overflow-hidden bg-slate-100">
                <ImageWithFallback 
                  src="https://images.unsplash.com/photo-1722082839841-45473f5a15cf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYXAlMjBzYXRlbGxpdGUlMjB2aWV3JTIwY2l0eXxlbnwxfHx8fDE3NzMxMTA1Nzd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Location Map"
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                <button onClick={() => setSelectedSchedule(null)} className="absolute top-3 right-3 bg-white/90 backdrop-blur-md p-1.5 rounded-md shadow-sm hover:bg-slate-800 hover:text-white transition-all"><X size={16} /></button>
                <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-white/90 backdrop-blur-md px-2 py-1.5 rounded-md shadow-sm border border-white/50">
                  <MapPin size={14} className="text-slate-800" />
                  <span className="text-[11px] font-black text-slate-800 tracking-tight">{selectedSchedule.location}</span>
                </div>
              </div>

              <div className="p-2 space-y-1">
                <div className="flex items-center justify-between">
                  <div className={cn(
                    "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border shadow-sm",
                    categories.find(c => c.id === selectedSchedule.categoryId)?.type === 'work' 
                      ? "bg-slate-800 text-white border-slate-800" 
                      : "bg-orange-50 text-orange-600 border-orange-100"
                  )}>
                    {categories.find(c => c.id === selectedSchedule.categoryId)?.name}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Schedule</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-sm font-black text-slate-800 leading-tight">
                    {categories.find(c => c.id === selectedSchedule.categoryId)?.emoji} {selectedSchedule.title}
                  </h3>
                  <div className="flex items-center gap-2 text-slate-500 font-bold text-xs">
                    <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100"><Clock size={13} className="text-slate-400" /> {selectedSchedule.time}</div>
                    <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100"><Tag size={13} className="text-slate-400" /> {selectedSchedule.duration}분 소요</div>
                  </div>
                </div>

                {selectedSchedule.note && (
                  <div className="p-1 bg-slate-50 rounded-md border border-slate-100 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity"><Lock size={18} /></div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">비서 전용 메모 (Private)</p>
                    <p className="text-xs text-slate-600 leading-relaxed font-bold italic">"{selectedSchedule.note}"</p>
                  </div>
                )}

                <div className="flex items-center gap-2 pt-1">
                  <button className="flex-1 bg-slate-800 text-white py-1 rounded-md font-black text-sm shadow-sm hover:bg-slate-700 transition-all flex items-center justify-center gap-2">
                    <Edit size={16} /> 일정 편집
                  </button>
                  <button className="p-2.5 bg-white border border-slate-200 rounded-md shadow-sm hover:border-slate-800 transition-all"><Trash2 size={16} className="text-slate-400 hover:text-red-500 transition-colors" /></button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Utility to get start of day for comparisons
function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}
