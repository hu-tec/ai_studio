import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Trash2, 
  Edit2, 
  FileSpreadsheet, 
  FileText, 
  LayoutDashboard, 
  Filter, 
  ChevronRight,
  ChevronUp,
  ChevronDown,
  ArrowUpDown,
  Save,
  X,
  Phone,
  Mail,
  Building2,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  BarChart3,
  Download,
  MoreVertical,
  CheckSquare,
  Square,
  User,
  MessageSquare,
  PieChart as PieIcon,
  RefreshCcw,
  Settings2,
  Activity,
  History as HistoryIcon,
  Eye,
  RotateCcw
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { toast } from 'sonner';

// --- TYPES ---
type CallStatus = '부재중' | '재통화필요' | '처리완료' | '거절' | '대기';

interface ContactEntry {
  id: string;
  agency: string;
  name: string;
  phone: string;
  email: string;
  status: CallStatus;
  catLarge: string;
  catMid: string;
  catSmall: string;
  callCount: number;
  lastCallDate: string;
  notes: string;
  history: string;
}

type DashboardMode = 'view' | 'add' | 'edit' | 'delete';

// --- MOCK DATA ---
const INITIAL_DATA: ContactEntry[] = [
  { id: '1', agency: '(주)미래디자인', name: '김철수', phone: '010-1234-5678', email: 'kim@mirae.com', status: '대기', catLarge: '마케팅', catMid: '신규개척', catSmall: 'A이벤트', callCount: 0, lastCallDate: '-', notes: '', history: '' },
  { id: '2', agency: '글로벌테크', name: '이영희', phone: '010-9876-5432', email: 'lee@global.com', status: '처리완료', catLarge: '영업', catMid: '기존관리', catSmall: 'B이벤트', callCount: 2, lastCallDate: '2026-03-09', notes: '도입 긍정적 검토 중', history: '1회차: 부재\n2회차: 상담완료' },
  { id: '3', agency: '에이치소프트', name: '박민준', phone: '010-1111-2222', email: 'park@hsoft.com', status: '부재중', catLarge: '마케팅', catMid: '잠재고객', catSmall: '일반조사', callCount: 1, lastCallDate: '2026-03-10', notes: '전화 안받음', history: '1회차: 부재' },
  { id: '4', agency: '대원상사', name: '최지우', phone: '010-3333-4444', email: 'choi@dw.com', status: '거절', catLarge: '영업', catMid: '신규개척', catSmall: 'A이벤트', callCount: 1, lastCallDate: '2026-03-08', notes: '관심 없음', history: '1회차: 즉시거절' },
  { id: '5', agency: '넥스트아이티', name: '정현우', phone: '010-5555-6666', email: 'jung@next.com', status: '재통화필요', catLarge: '마케팅', catMid: '기존관리', catSmall: 'B이벤트', callCount: 3, lastCallDate: '2026-03-10', notes: '오후 4시 이후 통화 희망', history: '1회차: 통화중\n2회차: 부재\n3회차: 시간약속' },
];

const STATUS_OPTIONS: CallStatus[] = ['부재중', '재통화필요', '처리완료', '거절', '대기'];
const STATUS_COLORS = ['#94a3b8', '#3b82f6', '#10b981', '#f43f5e', '#facc15'];

// --- COMPONENTS ---

// --- API helpers ---
function saveCallToServer(id: string, data: any) {
  fetch('/api/outbound-calls', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ call_id: id, data })
  }).catch(() => {});
}

function deleteCallFromServer(id: string) {
  fetch(`/api/outbound-calls/${id}`, { method: 'DELETE' }).catch(() => {});
}

export function OutboundCallsPage() {
  const [entries, setEntries] = useState<ContactEntry[]>(INITIAL_DATA);

  // Load from API on mount
  useEffect(() => {
    fetch('/api/outbound-calls').then(r => r.json()).then((rows: any[]) => {
      if (rows.length > 0) {
        const loaded = rows.map((r: any) => r.data).filter(Boolean);
        if (loaded.length > 0) {
          setEntries(loaded as ContactEntry[]);
        }
      }
    }).catch(() => {}); // silent fallback to mock
  }, []);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [activeId, setActiveId] = useState<string | null>(null);
  const [mode, setMode] = useState<DashboardMode>('view');
  const [viewType, setViewType] = useState<'dashboard' | 'full-list'>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  // Filters
  const [filterLarge, setFilterLarge] = useState<string[]>([]);
  const [filterMid, setFilterMid] = useState<string[]>([]);
  const [filterSmall, setFilterSmall] = useState<string[]>([]);
  const [showFilterOverlay, setShowFilterOverlay] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<ContactEntry>>({});

  // Sorting
  const [sortConfig, setSortConfig] = useState<{ key: keyof ContactEntry; direction: 'asc' | 'desc' } | null>(null);

  const downloadFile = (type: 'excel' | 'word') => {
    toast.success(`${type === 'excel' ? '엑셀' : '워드'} 다운로드 (미구현)`);
  };

  // Derived Values
  const categories = useMemo(() => {
    return {
      large: Array.from(new Set(entries.map(e => e.catLarge))),
      mid: Array.from(new Set(entries.map(e => e.catMid))),
      small: Array.from(new Set(entries.map(e => e.catSmall))),
    };
  }, [entries]);

  const filteredEntries = useMemo(() => {
    let result = entries.filter(e => {
      const matchSearch = e.agency.includes(searchTerm) || e.name.includes(searchTerm) || e.phone.includes(searchTerm);
      const matchLarge = filterLarge.length === 0 || filterLarge.includes(e.catLarge);
      const matchMid = filterMid.length === 0 || filterMid.includes(e.catMid);
      const matchSmall = filterSmall.length === 0 || filterSmall.includes(e.catSmall);
      return matchSearch && matchLarge && matchMid && matchSmall;
    });

    if (sortConfig) {
      result.sort((a, b) => {
        const aVal = String(a[sortConfig.key]);
        const bVal = String(b[sortConfig.key]);
        return sortConfig.direction === 'asc' ? aVal.localeCompare(bVal, 'ko') : bVal.localeCompare(aVal, 'ko');
      });
    }
    return result;
  }, [entries, searchTerm, filterLarge, filterMid, filterSmall, sortConfig]);

  const stats = useMemo(() => {
    const total = filteredEntries.length;
    const completed = filteredEntries.filter(e => e.status === '처리완료').length;
    const pending = total - completed;
    const statusData = STATUS_OPTIONS.map(s => ({
      name: s,
      value: filteredEntries.filter(e => e.status === s).length
    }));
    return { total, completed, pending, statusData };
  }, [filteredEntries]);

  // Handlers
  const handleEntryClick = (entry: ContactEntry) => {
    if (mode === 'delete') {
      handleSelectOne(entry.id);
      return;
    }
    setActiveId(entry.id);
    setFormData(entry);
    if (mode === 'add') setMode('view');
  };

  const handleSelectOne = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const handleModeChange = (newMode: DashboardMode) => {
    if (newMode === 'add') {
      setActiveId(null);
      setFormData({
        id: Math.random().toString(36).substr(2, 9),
        agency: '', name: '', phone: '', email: '', status: '대기',
        catLarge: '마케팅', catMid: '신규', catSmall: '기본',
        callCount: 0, lastCallDate: '-', notes: '', history: ''
      });
    } else if (newMode === 'edit') {
      if (!activeId) {
        toast.error('수정할 항목을 먼저 선택해주세요.');
        return;
      }
    } else if (newMode === 'delete') {
      setSelectedIds(new Set());
    }
    setMode(newMode);
  };

  const handleSave = () => {
    if (!formData.agency || !formData.name) {
      toast.error('거래처명과 담당자명을 입력해주세요.');
      return;
    }

    if (mode === 'add') {
      setEntries(prev => [...prev, formData as ContactEntry]);
      saveCallToServer(formData.id!, formData);
      toast.success('신규 등록이 완료되었습니다.');
      setActiveId(formData.id!);
    } else {
      setEntries(prev => prev.map(e => e.id === activeId ? (formData as ContactEntry) : e));
      saveCallToServer(activeId!, formData);
      toast.success('수정사항이 저장되었습니다.');
    }
    setMode('view');
  };

  const handleDelete = () => {
    const idsToDelete = Array.from(selectedIds);
    if (idsToDelete.length === 0) return;
    setEntries(prev => prev.filter(e => !idsToDelete.includes(e.id)));
    idsToDelete.forEach(id => deleteCallFromServer(id));
    setSelectedIds(new Set());
    setActiveId(null);
    toast.success(`${idsToDelete.length}건이 삭제되었습니다.`);
    setMode('view');
  };

  const toggleFilter = (list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>, item: string) => {
    if (list.includes(item)) setList(list.filter(i => i !== item));
    else setList([...list, item]);
  };

  const handleOpenDetailModal = (e: React.MouseEvent, entry: ContactEntry) => {
    e.stopPropagation();
    setActiveId(entry.id);
    setFormData(entry);
    setShowDetailModal(true);
  };

  const getStatusStyles = (status: CallStatus) => {
    switch (status) {
      case '처리완료': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case '재통화필요': return 'bg-blue-50 text-blue-600 border-blue-100';
      case '부재중': return 'bg-slate-50 text-slate-500 border-slate-100';
      case '거절': return 'bg-rose-50 text-rose-600 border-rose-100';
      default: return 'bg-amber-50 text-amber-600 border-amber-100';
    }
  };

  if (viewType === 'full-list') {
    return (
      <div className="flex flex-col h-screen bg-[#f1f3f6] text-slate-900 overflow-hidden font-sans">
        <header className="h-14 bg-white border-b border-gray-200 px-6 flex items-center justify-between shrink-0 shadow-sm z-50">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-slate-800 rounded-xl flex items-center justify-center text-white">
              <Phone className="w-5 h-5" />
            </div>
            <h1 className="text-base font-black tracking-tight text-slate-800 uppercase">Full Contact List 📑</h1>
          </div>
          <button 
            onClick={() => setViewType('dashboard')}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-black transition-all"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>대시보드로 돌아가기</span>
          </button>
        </header>

        <main className="flex-grow p-6 overflow-hidden flex flex-col">
          <div className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden flex flex-col flex-grow">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h2 className="text-sm font-black text-slate-800">전체 고객 데이터베이스</h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs w-80 focus:ring-2 focus:ring-slate-800 focus:bg-white outline-none transition-all"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button onClick={() => downloadFile('excel')} className="flex items-center space-x-2 px-4 py-2 bg-green-50 text-green-700 rounded-xl text-xs font-bold border border-green-100">
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>엑셀</span>
                </button>
                <button onClick={() => downloadFile('word')} className="flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-xs font-bold border border-blue-100">
                  <FileText className="w-4 h-4" />
                  <span>워드</span>
                </button>
              </div>
            </div>
            <div className="flex-grow overflow-auto p-4">
              <table className="w-full text-left border-collapse table-fixed">
                <thead className="sticky top-0 bg-white shadow-sm z-10 border-b-2 border-slate-100">
                  <tr>
                    <SortableHeader label="거래처명" sortKey="agency" config={sortConfig} setConfig={setSortConfig} className="w-64" />
                    <SortableHeader label="담당자" sortKey="name" config={sortConfig} setConfig={setSortConfig} className="w-32" />
                    <SortableHeader label="연락처" sortKey="phone" config={sortConfig} setConfig={setSortConfig} className="w-48" />
                    <SortableHeader label="상태" sortKey="status" config={sortConfig} setConfig={setSortConfig} className="w-32" />
                    <SortableHeader label="분류" sortKey="catLarge" config={sortConfig} setConfig={setSortConfig} className="w-32" />
                    <th className="px-4 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center w-24">미리보기</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredEntries.map(entry => (
                    <tr key={entry.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-4 py-4 text-sm font-bold text-slate-800">{entry.agency}</td>
                      <td className="px-4 py-4 text-sm text-slate-600">{entry.name}</td>
                      <td className="px-4 py-4 text-sm text-slate-500 font-mono">{entry.phone}</td>
                      <td className="px-4 py-4 text-xs font-bold">
                        <span className={`px-2 py-1 rounded-full border ${getStatusStyles(entry.status)}`}>{entry.status}</span>
                      </td>
                      <td className="px-4 py-4 text-xs text-gray-400 font-bold">{entry.catLarge}</td>
                      <td className="px-4 py-4 text-center">
                        <button 
                          onClick={(e) => handleOpenDetailModal(e, entry)}
                          className="p-2 hover:bg-slate-800 hover:text-white rounded-full transition-all text-slate-300"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#f1f3f6] text-slate-900 overflow-hidden font-sans">
      
      {/* Detail Preview Modal */}
      {showDetailModal && activeId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 bg-slate-800 text-white flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                  <Eye className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black tracking-tight">{formData.agency} 상세 미리보기</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">Customer Quick View</p>
                </div>
              </div>
              <button onClick={() => setShowDetailModal(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-grow overflow-y-auto p-8 space-y-8">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4">
                  <ModalInfoItem label="거래처명" value={formData.agency} icon={<Building2 className="w-4 h-4" />} />
                  <ModalInfoItem label="담당자명" value={formData.name} icon={<User className="w-4 h-4" />} />
                  <ModalInfoItem label="연락처" value={formData.phone} icon={<Phone className="w-4 h-4" />} />
                  <ModalInfoItem label="이메일" value={formData.email} icon={<Mail className="w-4 h-4" />} />
                </div>
                <div className="space-y-4">
                  <ModalInfoItem label="현재 상태" value={formData.status} icon={<Activity className="w-4 h-4" />} />
                  <ModalInfoItem label="통화 횟수" value={`${formData.callCount}회`} icon={<RotateCcw className="w-4 h-4" />} />
                  <ModalInfoItem label="최종 통화일" value={formData.lastCallDate} icon={<Calendar className="w-4 h-4" />} />
                  <ModalInfoItem label="분류" value={`${formData.catLarge} > ${formData.catMid}`} icon={<Settings2 className="w-4 h-4" />} />
                </div>
              </div>
              
              <div className="border-t border-gray-100 pt-6 space-y-4">
                <div className="space-y-2">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">상담 히스토리 요약</h4>
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 text-xs text-slate-600 font-mono whitespace-pre-wrap leading-relaxed">
                    {formData.history || '기존 기록이 없습니다.'}
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">최근 작성 메모</h4>
                  <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-5 text-xs text-amber-900 font-medium leading-relaxed">
                    {formData.notes || '작성된 메모가 없습니다.'}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end space-x-3">
              <button 
                onClick={() => { setShowDetailModal(false); setMode('edit'); }}
                className="px-6 py-2.5 bg-slate-800 text-white rounded-xl text-xs font-black hover:bg-slate-700 transition-all flex items-center space-x-2"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>이 정보 수정하기</span>
              </button>
              <button onClick={() => setShowDetailModal(false)} className="px-6 py-2.5 bg-white border border-gray-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-gray-50 transition-all">
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Top Header */}
      <header className="h-14 bg-white border-b border-gray-200 px-6 flex items-center justify-between shrink-0 shadow-sm z-50">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 bg-slate-800 rounded-xl flex items-center justify-center text-white shadow-md shadow-slate-200">
            <Phone className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-black tracking-tight leading-none text-slate-800">CALL CENTER DASHBOARD 📞</h1>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Marketing Outbound System</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* View Toggler */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-gray-200">
            <button 
              onClick={() => setViewType('dashboard')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${viewType === 'dashboard' ? 'bg-white text-slate-800 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <LayoutDashboard className="w-3 h-3" />
              <span>DASHBOARD</span>
            </button>
            <button 
              onClick={() => setViewType('full-list')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${(viewType as string) === 'full-list' ? 'bg-white text-slate-800 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <FileSpreadsheet className="w-3 h-3" />
              <span>FULL LIST</span>
            </button>
          </div>

          <div className="h-6 w-px bg-gray-200 mx-1" />

          {/* Mode Switchers */}
          <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200">
            <ModeButton active={mode === 'view'} onClick={() => handleModeChange('view')} icon={<LayoutDashboard className="w-3.5 h-3.5" />} label="조회" />
            <ModeButton active={mode === 'add'} onClick={() => handleModeChange('add')} icon={<Plus className="w-3.5 h-3.5" />} label="추가" />
            <ModeButton active={mode === 'edit'} onClick={() => handleModeChange('edit')} icon={<Edit2 className="w-3.5 h-3.5" />} label="수정" />
            <ModeButton active={mode === 'delete'} onClick={() => handleModeChange('delete')} icon={<Trash2 className="w-3.5 h-3.5" />} label="삭제" />
          </div>

          <div className="h-6 w-px bg-gray-200 mx-1" />

          {/* Download Buttons */}
          <div className="flex items-center space-x-1.5">
            <button className="flex items-center space-x-1.5 px-3 py-2 bg-white text-slate-600 border border-gray-200 rounded-lg text-xs font-bold hover:bg-gray-50 transition-all">
              <FileSpreadsheet className="w-3.5 h-3.5 text-green-600" />
              <span>엑셀 다운받기</span>
            </button>
            <button className="flex items-center space-x-1.5 px-3 py-2 bg-white text-slate-600 border border-gray-200 rounded-lg text-xs font-bold hover:bg-gray-50 transition-all">
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              <span>워드 다운받기</span>
            </button>
          </div>
        </div>
      </header>

      {/* Summary Stats Bar (Moved from right to top) */}
      <section className="px-4 pt-4 shrink-0">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-3 flex items-center justify-between gap-6 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-4 border-r border-gray-100 pr-6 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter leading-none">업무 처리 현황</p>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-sm font-black text-slate-800">{stats.total}</span>
                  <span className="text-[10px] text-gray-400 font-bold">건 할당됨</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-grow flex items-center justify-center gap-10 shrink-0">
            <StatBarItem label="전체 건수" value={stats.total} icon={<LayoutDashboard className="w-3.5 h-3.5" />} />
            <StatBarItem label="완료 건수" value={stats.completed} icon={<CheckCircle2 className="w-3.5 h-3.5" />} color="text-emerald-600" />
            <StatBarItem label="미처리 건수" value={stats.pending} icon={<Clock className="w-3.5 h-3.5" />} color="text-amber-600" />
            <StatBarItem label="나의 처리율" value={`${stats.total ? Math.round((stats.completed/stats.total)*100) : 0}%`} icon={<User className="w-3.5 h-3.5" />} color="text-slate-800" />
          </div>

          <div className="flex items-center gap-6 border-l border-gray-100 pl-6 shrink-0">
            {/* Compact Pie Chart */}
            <div className="h-12 w-24">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.statusData}
                    innerRadius={15}
                    outerRadius={22}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {stats.statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={STATUS_COLORS[index % 5]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
              {stats.statusData.map((s, idx) => (
                <div key={s.name} className="flex items-center space-x-1">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: STATUS_COLORS[idx % 5] }} />
                  <span className="text-[9px] text-gray-500 font-bold whitespace-nowrap">{s.name} {s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Layout - 3 Remaining Columns */}
      <main className="flex-grow flex p-4 gap-4 overflow-hidden">
        
        {/* COL 1: SELECTED CUSTOMER INFO & STATUS */}
        <section className="w-[320px] flex flex-col gap-4 shrink-0">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col h-1/2 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h2 className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center">
                <Building2 className="w-3.5 h-3.5 mr-1.5" /> 거래처 상세 정보 🏢
              </h2>
            </div>
            <div className="flex-grow overflow-y-auto p-4 space-y-4">
              {activeId || mode === 'add' ? (
                <>
                  <EditableField label="거래처명" value={formData.agency} onChange={(v) => setFormData({...formData, agency: v})} disabled={mode === 'view'} icon={<Building2 className="w-3 h-3" />} />
                  <EditableField label="담당자" value={formData.name} onChange={(v) => setFormData({...formData, name: v})} disabled={mode === 'view'} icon={<User className="w-3 h-3" />} />
                  <EditableField label="연락처" value={formData.phone} onChange={(v) => setFormData({...formData, phone: v})} disabled={mode === 'view'} icon={<Phone className="w-3 h-3" />} />
                  <EditableField label="이메일" value={formData.email} onChange={(v) => setFormData({...formData, email: v})} disabled={mode === 'view'} icon={<Mail className="w-3 h-3" />} />
                  <div className="grid grid-cols-2 gap-3">
                    <EditableField label="대분류" type="select" options={categories.large} value={formData.catLarge} onChange={(v) => setFormData({...formData, catLarge: v})} disabled={mode === 'view'} />
                    <EditableField label="시도횟수" type="number" value={formData.callCount} onChange={(v) => setFormData({...formData, callCount: Number(v)})} disabled={mode === 'view'} />
                  </div>
                </>
              ) : (
                <EmptyState icon={<RefreshCcw className="w-8 h-8" />} text="목록에서 거래처를 선택해주세요" />
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col h-1/2 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center bg-gray-50/50">
              <h2 className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> 처리 결과 선택 ✅
              </h2>
            </div>
            <div className="flex-grow p-5 flex flex-col justify-center space-y-3">
              {STATUS_OPTIONS.map(status => (
                <button
                  key={status}
                  disabled={mode === 'view' || (!activeId && mode !== 'add')}
                  onClick={() => setFormData({...formData, status})}
                  className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all ${
                    formData.status === status 
                    ? 'border-slate-800 bg-slate-50 text-slate-800 font-bold' 
                    : 'border-gray-100 bg-white text-gray-400 hover:border-gray-200'
                  }`}
                >
                  <span className="text-xs">{status}</span>
                  {formData.status === status ? <CheckCircle2 className="w-4 h-4 text-slate-800" /> : <div className="w-4 h-4 rounded-full border-2 border-gray-100" />}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* COL 2: WORK LIST & CONSULTATION ENTRY (REORGANIZED) */}
        <section className="flex-grow flex flex-col gap-4 min-w-[500px] overflow-hidden">
          
          {/* Top: Work List Table */}
          <div className="flex-grow bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col min-h-[300px]">
            <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-20">
              <div className="flex items-center space-x-3">
                <h2 className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center">
                  <LayoutDashboard className="w-3.5 h-3.5 mr-1.5" /> 업무 할당 목록 📋
                </h2>
                <div className="relative group">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="실시간 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-[11px] w-48 focus:outline-none focus:ring-2 focus:ring-slate-800 transition-all"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => setShowFilterOverlay(!showFilterOverlay)}
                  className={`p-2 rounded-lg border transition-all ${showFilterOverlay ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}
                >
                  <Filter className="w-3.5 h-3.5" />
                </button>
                {mode === 'delete' && (
                  <button onClick={handleDelete} className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-700 shadow-sm">삭제 실행</button>
                )}
              </div>
            </div>

            <div className="flex-grow overflow-auto relative">
              {showFilterOverlay && (
                <div className="absolute inset-0 z-30 bg-white/95 backdrop-blur-sm p-6 flex flex-col animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-sm font-black text-slate-800">상세 필터 설정 🔍</h3>
                    <button onClick={() => setShowFilterOverlay(false)} className="p-2 hover:bg-gray-100 rounded-full"><X className="w-4 h-4" /></button>
                  </div>
                  <div className="grid grid-cols-3 gap-8">
                    <FilterSection title="대분류 (복수선택)" items={categories.large} selected={filterLarge} onToggle={(v) => toggleFilter(filterLarge, setFilterLarge, v)} />
                    <FilterSection title="중분류 (복수선택)" items={categories.mid} selected={filterMid} onToggle={(v) => toggleFilter(filterMid, setFilterMid, v)} />
                    <FilterSection title="소분류 (복수선택)" items={categories.small} selected={filterSmall} onToggle={(v) => toggleFilter(filterSmall, setFilterSmall, v)} />
                  </div>
                  <div className="mt-auto pt-6 border-t border-gray-100 flex justify-end">
                    <button onClick={() => setShowFilterOverlay(false)} className="bg-slate-800 text-white px-6 py-2 rounded-xl text-xs font-bold">필터 적용하기</button>
                  </div>
                </div>
              )}

              <table className="w-full text-left border-collapse table-fixed">
                <thead className="sticky top-0 bg-white shadow-xs z-10 border-b border-gray-50">
                  <tr>
                    <th className="w-12 px-4 py-3">
                      {mode === 'delete' && (
                        <button onClick={() => {
                          if (selectedIds.size === filteredEntries.length) setSelectedIds(new Set());
                          else setSelectedIds(new Set(filteredEntries.map(e => e.id)));
                        }}>
                          {selectedIds.size === filteredEntries.length && filteredEntries.length > 0 ? <CheckSquare className="w-4 h-4 text-slate-800" /> : <Square className="w-4 h-4 text-gray-300" />}
                        </button>
                      )}
                    </th>
                    <SortableHeader label="거래처명" sortKey="agency" config={sortConfig} setConfig={setSortConfig} className="w-1/3" />
                    <SortableHeader label="담당자" sortKey="name" config={sortConfig} setConfig={setSortConfig} className="w-24" />
                    <SortableHeader label="상태" sortKey="status" config={sortConfig} setConfig={setSortConfig} className="w-28" />
                    <SortableHeader label="시도" sortKey="callCount" config={sortConfig} setConfig={setSortConfig} className="w-16 text-center" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredEntries.map(entry => (
                    <tr 
                      key={entry.id}
                      onClick={() => handleEntryClick(entry)}
                      className={`group cursor-pointer hover:bg-slate-50 transition-colors ${activeId === entry.id ? 'bg-slate-50' : ''}`}
                    >
                      <td className="px-4 py-3" onClick={(e) => { e.stopPropagation(); handleSelectOne(entry.id); }}>
                        {mode === 'delete' ? (
                          selectedIds.has(entry.id) ? <CheckSquare className="w-4 h-4 text-slate-800" /> : <Square className="w-4 h-4 text-gray-300 group-hover:text-gray-400" />
                        ) : (
                          <div className={`w-1.5 h-1.5 rounded-full transition-all ${activeId === entry.id ? 'bg-slate-800 scale-125' : 'bg-transparent group-hover:bg-gray-200'}`} />
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs font-bold text-slate-800 truncate">{entry.agency}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">{entry.name}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusStyles(entry.status)}`}>
                          {entry.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-center text-gray-400 font-mono">{entry.callCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bottom: Consultation Entry Area (NEW) */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col h-[350px] shrink-0 overflow-hidden relative">
            <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between bg-slate-800 text-white">
              <h2 className="text-[11px] font-black uppercase tracking-widest flex items-center">
                <MessageSquare className="w-3.5 h-3.5 mr-1.5" /> 금일 상담 내용 기재창 📝
              </h2>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => {
                    const now = new Date().toLocaleString('ko-KR', { hour12: false });
                    setFormData(prev => ({ ...prev, notes: (prev.notes || '') + `\n[${now}] ` }));
                  }}
                  disabled={mode === 'view' || !activeId}
                  className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-[10px] font-bold transition-colors disabled:opacity-30"
                >
                  시간 입력
                </button>
                <button 
                  onClick={handleSave} 
                  disabled={mode === 'view' || !activeId}
                  className="flex items-center space-x-1.5 px-4 py-1.5 bg-white text-slate-800 rounded-lg text-[11px] font-black hover:bg-gray-100 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>내용 저장하기</span>
                </button>
              </div>
            </div>
            
            <div className="flex-grow p-5 relative">
              {activeId || mode === 'add' ? (
                <div className="h-full flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">실시간 상담 로그 작성</span>
                    <span className="text-[10px] text-slate-300 italic">{mode === 'view' ? '※ 조회 모드에서는 수정이 불가능합니다.' : '※ 입력 후 우측 상단 저장 버튼을 눌러주세요.'}</span>
                  </div>
                  <textarea 
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    disabled={mode === 'view'}
                    className="flex-grow w-full p-5 bg-gray-50 border border-gray-100 rounded-2xl text-[13px] text-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-800/5 focus:bg-white disabled:bg-gray-50/50 disabled:text-slate-400 transition-all resize-none leading-relaxed font-medium"
                    placeholder="고객과의 상담 내용을 여기에 상세히 기록하세요. 상담 종료 후 상태값 변경과 함께 저장해주세요."
                  />
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-gray-50/30 rounded-2xl border-2 border-dashed border-gray-100">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                    <Edit2 className="w-8 h-8 text-gray-200" />
                  </div>
                  <p className="text-xs font-black text-slate-300 uppercase tracking-widest">상담 작성 대기 중</p>
                  <p className="text-[10px] text-gray-400 mt-2">상단 목록에서 거래처를 선택하면<br/>상담 내용을 입력할 수 있는 창이 활성화됩니다.</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* COL 3: CALL LOG HISTORY & CHARTS */}
        <section className="w-[380px] flex flex-col gap-4 shrink-0 overflow-hidden">
          <div className="flex-grow bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h2 className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center">
                <HistoryIcon className="w-3.5 h-3.5 mr-1.5" /> 상담 히스토리 아카이브 📂
              </h2>
            </div>
            <div className="flex-grow p-5 overflow-y-auto">
              {activeId ? (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">누적 기록</p>
                    <div className="text-[11px] text-slate-600 font-mono whitespace-pre-wrap leading-relaxed">
                      {formData.history || '이전 상담 기록이 없습니다.'}
                    </div>
                  </div>
                  <div className="p-4 border border-dashed border-gray-200 rounded-2xl bg-gray-50/30">
                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-2">기록 요약</p>
                    <p className="text-[11px] text-gray-400 italic leading-relaxed">
                      과거 상담 이력은 수정이 불가능하며,<br/>조회용으로만 제공됩니다.
                    </p>
                  </div>
                </div>
              ) : (
                <EmptyState icon={<MessageSquare className="w-10 h-10" />} text="상담 기록을 확인하려면 항목을 선택해주세요" />
              )}
            </div>
          </div>

          {/* Moved Bar Chart here for compact display */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 flex flex-col h-48 shrink-0">
            <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">상담 빈도 TOP 📊</h2>
            <div className="flex-grow w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={filteredEntries.slice(0, 4).sort((a,b) => b.callCount - a.callCount)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="agency" type="category" width={70} tick={{ fontSize: 9, fontWeight: 'bold' }} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} />
                  <Bar dataKey="callCount" fill="#1e293b" radius={[0, 4, 4, 0]} barSize={12} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

// --- UTILS & SUB-COMPONENTS ---

function ModeButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
        active 
        ? 'bg-white text-slate-800 shadow-sm border border-gray-200' 
        : 'text-gray-400 hover:text-gray-600'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function StatBarItem({ label, value, icon, color = "text-slate-800" }: { label: string, value: string | number, icon: React.ReactNode, color?: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-300">
        {icon}
      </div>
      <div>
        <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter leading-none">{label}</p>
        <p className={`text-xs font-black mt-1 ${color}`}>{value}</p>
      </div>
    </div>
  );
}

function EditableField({ label, value, onChange, type = 'text', options = [], disabled = false, icon }: { label: string, value: any, onChange: (v: string) => void, type?: 'text' | 'number' | 'select', options?: string[], disabled?: boolean, icon?: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center space-x-1.5">
        {icon && <span className="text-gray-400">{icon}</span>}
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</label>
      </div>
      {type === 'select' ? (
        <select 
          value={value} 
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="w-full p-2.5 bg-gray-50 border border-gray-100 rounded-xl text-[11px] font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-800 focus:bg-white disabled:bg-transparent disabled:border-transparent transition-all"
        >
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input 
          type={type} 
          value={value} 
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="w-full p-2.5 bg-gray-50 border border-gray-100 rounded-xl text-[11px] font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-800 focus:bg-white disabled:bg-transparent disabled:border-transparent transition-all"
        />
      )}
    </div>
  );
}

function SortableHeader({ label, sortKey, config, setConfig, className = "" }: { label: string, sortKey: keyof ContactEntry, config: any, setConfig: any, className?: string }) {
  const isActive = config?.key === sortKey;
  const toggle = () => {
    let direction: 'asc' | 'desc' = 'asc';
    if (config?.key === sortKey && config.direction === 'asc') direction = 'desc';
    setConfig({ key: sortKey, direction });
  };
  return (
    <th onClick={toggle} className={`px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest cursor-pointer hover:bg-gray-100 transition-colors group ${className}`}>
      <div className="flex items-center space-x-1">
        <span>{label}</span>
        <div className={`transition-opacity ${isActive ? 'opacity-100 text-slate-800' : 'opacity-0 group-hover:opacity-40'}`}>
          {isActive ? (config.direction === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3" />}
        </div>
      </div>
    </th>
  );
}

function FilterSection({ title, items, selected, onToggle }: { title: string, items: string[], selected: string[], onToggle: (v: string) => void }) {
  return (
    <div className="space-y-3">
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{title}</p>
      <div className="space-y-1 max-h-[200px] overflow-y-auto pr-2 no-scrollbar">
        {items.map(item => (
          <button 
            key={item}
            onClick={() => onToggle(item)}
            className={`w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-[11px] transition-all ${selected.includes(item) ? 'bg-slate-800 text-white font-bold' : 'bg-gray-50 text-slate-600 hover:bg-gray-100'}`}
          >
            {selected.includes(item) ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
            <span className="truncate">{item}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function EmptyState({ icon, text }: { icon: React.ReactNode, text: string }) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-30 space-y-4">
      <div className="p-4 bg-gray-50 rounded-full">{icon}</div>
      <p className="text-xs font-black text-slate-800 leading-relaxed">{text}</p>
    </div>
  );
}

function getStatusStyles(status: CallStatus) {
  switch (status) {
    case '처리완료': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    case '재통화필요': return 'bg-blue-50 text-blue-600 border-blue-100';
    case '부재중': return 'bg-slate-50 text-slate-500 border-slate-100';
    case '거절': return 'bg-rose-50 text-rose-600 border-rose-100';
    default: return 'bg-amber-50 text-amber-600 border-amber-100';
  }
}

function ModalInfoItem({ label, value, icon }: { label: string, value: any, icon: React.ReactNode }) {
  return (
    <div className="flex items-start space-x-3">
      <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 shrink-0 shadow-sm">
        {icon}
      </div>
      <div className="space-y-0.5">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">{label}</p>
        <p className="text-[13px] font-bold text-slate-800">{value || '-'}</p>
      </div>
    </div>
  );
}

export default OutboundCallsPage;
