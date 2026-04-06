import React, { useState, useMemo } from 'react';
import {
  LayoutDashboard,
  FileSpreadsheet,
  FileText,
  Plus,
  Edit3,
  Trash2,
  Search,
  ChevronDown,
  ChevronUp,
  Eye,
  Settings,
  User,
  ArrowRight,
  BarChart3,
  List,
  Maximize2,
  X,
  PieChart as PieChartIcon,
  TrendingUp
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend
} from 'recharts';
import { toast } from 'sonner';

// --- Types ---
type DepositResult = '완료' | '연기' | '미납' | '문제';
type Frequency = '매주' | '2주' | '3주' | '월';

interface PaymentRecord {
  id: string;
  manager: string;
  name: string;
  frequency: Frequency;
  contractDate: string;
  expenseAmount: number;
  firstDepositDate: string;
  depositDay: string;
  deadline: string;
  singleDepositAmount: number;
  result: DepositResult;
  principalRecovered: number;
  principalUnpaid: number;
  totalFrequency: number;
  remainingFrequency: number;
  totalProfit: number;
}

type DashboardMode = 'view' | 'add' | 'edit' | 'delete';

// --- Mock Data ---
const INITIAL_DATA: PaymentRecord[] = [
  {
    id: '1',
    manager: '김을동',
    name: '홍길동',
    frequency: '매주',
    contractDate: '2024-01-10',
    expenseAmount: 1000000,
    firstDepositDate: '2024-01-15',
    depositDay: '수',
    deadline: '2024-06-15',
    singleDepositAmount: 50000,
    result: '완료',
    principalRecovered: 200000,
    principalUnpaid: 10000,
    totalFrequency: 20,
    remainingFrequency: 16,
    totalProfit: 1100000,
  },
  {
    id: '2',
    manager: '이순신',
    name: '강감찬',
    frequency: '월',
    contractDate: '2024-02-05',
    expenseAmount: 2500000,
    firstDepositDate: '2024-02-28',
    depositDay: '금',
    deadline: '2025-02-28',
    singleDepositAmount: 250000,
    result: '미납',
    principalRecovered: 500000,
    principalUnpaid: 250000,
    totalFrequency: 10,
    remainingFrequency: 8,
    totalProfit: 2750000,
  },
  {
    id: '3',
    manager: '김을동',
    name: '유관순',
    frequency: '2주',
    contractDate: '2024-03-01',
    expenseAmount: 500000,
    firstDepositDate: '2024-03-15',
    depositDay: '월',
    deadline: '2024-08-15',
    singleDepositAmount: 100000,
    result: '연기',
    principalRecovered: 100000,
    principalUnpaid: 0,
    totalFrequency: 5,
    remainingFrequency: 4,
    totalProfit: 600000,
  }
];

// --- Utility Functions ---
const formatCurrency = (amount: number) => {
  return (amount / 10000).toLocaleString() + '만원';
};

// --- Sub-Components ---

const StatCard = ({ title, value, emoji, subtitle }: { title: string; value: string; emoji: string; subtitle?: string }) => (
  <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start">
      <span className="text-slate-500 text-sm font-medium">{title}</span>
      <span className="text-xl">{emoji}</span>
    </div>
    <div className="mt-2">
      <div className="text-2xl font-bold text-slate-800">{value}</div>
      {subtitle && <div className="text-xs text-slate-400 mt-1">{subtitle}</div>}
    </div>
  </div>
);

function DetailItem({ label, value, isBold, isGreen, isRed, isBadge }: { label: string; value: any; isBold?: boolean; isGreen?: boolean; isRed?: boolean; isBadge?: boolean }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-slate-400 font-medium">{label}</span>
      {isBadge ? (
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
          value === '완료' ? 'bg-green-100 text-green-700' :
          value === '미납' ? 'bg-red-100 text-red-700' :
          value === '연기' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
        }`}>
          {value}
        </span>
      ) : (
        <span className={`font-semibold ${isBold ? 'text-slate-800 text-base' : 'text-slate-600'} ${isGreen ? 'text-green-600' : ''} ${isRed ? 'text-red-600' : ''}`}>
          {value || '-'}
        </span>
      )}
    </div>
  );
}

function FormGroup({
  label,
  value,
  field,
  mode,
  setFormData,
  type = 'text',
  options = []
}: {
  label: string;
  value: any;
  field: keyof PaymentRecord;
  mode: DashboardMode;
  setFormData: React.Dispatch<React.SetStateAction<Partial<PaymentRecord>>>;
  type?: string;
  options?: string[];
}) {
  const isEditable = mode === 'add' || mode === 'edit';
  if (!isEditable) {
    return (
      <div className="space-y-1">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{label}</label>
        <div className="text-sm font-semibold text-slate-700 border-b border-slate-50 pb-1">
          {type === 'number' ? Number(value).toLocaleString() : value || '-'}
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{label}</label>
      {type === 'select' ? (
        <select
          className="w-full text-sm bg-white border border-slate-200 rounded-lg px-3 py-2 focus:ring-1 focus:ring-slate-400 outline-none"
          value={value}
          onChange={(e) => setFormData(prev => ({ ...prev, [field]: e.target.value }))}
        >
          <option value="">선택</option>
          {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      ) : (
        <input
          type={type}
          className="w-full text-sm bg-white border border-slate-200 rounded-lg px-3 py-2 focus:ring-1 focus:ring-slate-400 outline-none"
          value={value}
          onChange={(e) => setFormData(prev => ({ ...prev, [field]: type === 'number' ? Number(e.target.value) : e.target.value }))}
        />
      )}
    </div>
  );
}

// --- Main Page Component ---

export default function OverduePage() {
  const [data, setData] = useState<PaymentRecord[]>(INITIAL_DATA);
  const [mode, setMode] = useState<DashboardMode>('view');
  const [viewLayout, setViewLayout] = useState<'dashboard' | 'list'>('dashboard');
  const [isStatsExpanded, setIsStatsExpanded] = useState(false);
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<PaymentRecord>>({});

  const stats = useMemo(() => {
    const managers = Array.from(new Set(data.map(d => d.manager)));
    const summaryByManager = managers.map(mgr => {
      const mgrData = data.filter(d => d.manager === mgr);
      return {
        manager: mgr,
        count: mgrData.length,
        totalAmount: mgrData.reduce((sum, d) => sum + d.expenseAmount, 0),
        recovered: mgrData.reduce((sum, d) => sum + d.principalRecovered, 0),
        unpaid: mgrData.reduce((sum, d) => sum + d.principalUnpaid, 0),
        completedCount: mgrData.filter(d => d.result === '완료').length,
        delayedCount: mgrData.filter(d => d.result === '연기').length,
        unpaidCount: mgrData.filter(d => d.result === '미납').length,
      };
    });

    const resultCounts = [
      { name: '완료', value: data.filter(d => d.result === '완료').length, color: '#16a34a' },
      { name: '미납', value: data.filter(d => d.result === '미납').length, color: '#dc2626' },
      { name: '연기', value: data.filter(d => d.result === '연기').length, color: '#d97706' },
      { name: '문제', value: data.filter(d => d.result === '문제').length, color: '#475569' },
    ];

    const managerChartData = summaryByManager.map(mgr => ({
      name: mgr.manager,
      recovered: mgr.recovered / 10000,
      unpaid: mgr.unpaid / 10000,
      total: mgr.totalAmount / 10000
    }));

    return {
      totalPeople: data.length,
      totalAmount: data.reduce((sum, d) => sum + d.expenseAmount, 0),
      totalRecovered: data.reduce((sum, d) => sum + d.principalRecovered, 0),
      totalUnpaid: data.reduce((sum, d) => sum + d.principalUnpaid, 0),
      managerStats: summaryByManager,
      resultChartData: resultCounts,
      managerChartData: managerChartData
    };
  }, [data]);

  const handleDownload = (type: 'Excel' | 'Word') => {
    toast.success(`${type} 파일 다운로드를 시작합니다.`, {
      description: `미수금 관리 대시보드 데이터_${new Date().toLocaleDateString()}. ${type === 'Excel' ? 'xlsx' : 'docx'}`,
    });
  };

  const handleRecordAction = (record: PaymentRecord) => {
    if (mode === 'edit') {
      setFormData(record);
      setSelectedRecordId(record.id);
    } else if (mode === 'delete') {
      if (confirm(`'${record.name}' 님의 데이터를 삭제하시겠습니까?`)) {
        setData(data.filter(d => d.id !== record.id));
        toast.info('데이터가 삭제되었습니다.');
      }
    } else {
      setSelectedRecordId(record.id);
    }
  };

  const handleSave = () => {
    if (mode === 'add') {
      const newRecord: PaymentRecord = {
        ...formData as PaymentRecord,
        id: Math.random().toString(36).substr(2, 9),
        manager: formData.manager || '미지정',
        name: formData.name || '무명',
        frequency: formData.frequency || '매주',
        result: formData.result || '미납',
        expenseAmount: Number(formData.expenseAmount) || 0,
        principalRecovered: Number(formData.principalRecovered) || 0,
        principalUnpaid: Number(formData.principalUnpaid) || 0,
      };
      setData([...data, newRecord]);
      setFormData({});
      toast.success('신규 데이터가 추가되었습니다.');
    } else if (mode === 'edit' && selectedRecordId) {
      setData(data.map(d => d.id === selectedRecordId ? { ...d, ...formData } : d));
      setMode('view');
      setFormData({});
      toast.success('데이터가 수정되었습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans p-4 md:p-8">
      <div className="max-w-[1800px] mx-auto mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-100">
              <LayoutDashboard className="w-6 h-6 text-slate-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">미수금 관리 대시보드</h1>
              <p className="text-slate-500 text-sm">실시간 채권 회수 및 미수 현황을 관리합니다.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-slate-200/50 p-1 rounded-lg mr-2">
              <button
                onClick={() => setViewLayout('dashboard')}
                className={`p-1.5 rounded-md flex items-center gap-2 text-xs font-bold transition-all ${viewLayout === 'dashboard' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" /> 대시보드
              </button>
              <button
                onClick={() => setViewLayout('list')}
                className={`p-1.5 rounded-md flex items-center gap-2 text-xs font-bold transition-all ${viewLayout === 'list' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <List className="w-3.5 h-3.5" /> 전체목록
              </button>
            </div>
            <button
              onClick={() => handleDownload('Excel')}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm"
            >
              <FileSpreadsheet className="w-4 h-4 text-green-600" />
              Excel 다운받기
            </button>
            <button
              onClick={() => handleDownload('Word')}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm"
            >
              <FileText className="w-4 h-4 text-blue-600" />
              Word 다운받기
            </button>
          </div>
        </div>

        <div className="bg-white p-1 rounded-xl border border-slate-200 inline-flex shadow-sm mb-6">
          <button
            onClick={() => { setMode('view'); setSelectedRecordId(null); }}
            className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${mode === 'view' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Eye className="w-4 h-4" /> 조회 모드
          </button>
          <button
            onClick={() => { setMode('add'); setFormData({}); setSelectedRecordId(null); }}
            className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${mode === 'add' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Plus className="w-4 h-4" /> 추가 모드
          </button>
          <button
            onClick={() => { setMode('edit'); setFormData({}); setSelectedRecordId(null); }}
            className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${mode === 'edit' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Edit3 className="w-4 h-4" /> 수정 모드
          </button>
          <button
            onClick={() => { setMode('delete'); setSelectedRecordId(null); }}
            className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${mode === 'delete' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Trash2 className="w-4 h-4" /> 삭제 모드
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard title="총 미수금액" value={formatCurrency(stats.totalUnpaid)} emoji="💸" subtitle={`전체 ${formatCurrency(stats.totalAmount)} 중`} />
          <StatCard title="회수 완료" value={formatCurrency(stats.totalRecovered)} emoji="✅" subtitle={`${((stats.totalRecovered / stats.totalAmount) * 100 || 0).toFixed(1)}% 회수율`} />
          <StatCard title="전체 관리 대상" value={`${stats.totalPeople}명`} emoji="👥" subtitle="현재 등록된 전체 인원" />
          <StatCard title="미납/문제 건수" value={`${data.filter(d => d.result === '미납' || d.result === '문제').length}건`} emoji="🚨" subtitle="집중 관리 필요" />
        </div>

        {/* Visualized Statistics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
              <PieChartIcon className="w-4 h-4 text-slate-400" /> 수납 결과 분포
            </h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.resultChartData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {stats.resultChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-slate-400" /> 담당자별 회수 현황 (단위: 만원)
            </h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.managerChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                  <RechartsTooltip
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: '10px', top: -10 }} />
                  <Bar dataKey="recovered" name="회수금액" fill="#1e293b" radius={[4, 4, 0, 0]} barSize={40} />
                  <Bar dataKey="unpaid" name="미수금액" fill="#cbd5e1" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Main Content Area: Dashboard vs Full List Toggle */}
        {viewLayout === 'dashboard' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
            <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col max-h-[700px]">
              <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <h3 className="font-bold text-slate-700 flex items-center gap-2">
                  <User className="w-4 h-4" /> 개인별 현황 리스트
                </h3>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="이름 검색"
                    className="pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-slate-400 outline-none w-32"
                  />
                </div>
              </div>
              <div className="overflow-y-auto flex-1 p-2 space-y-1">
                {data.map(record => (
                  <div key={record.id} className="relative group">
                    <button
                      onClick={() => handleRecordAction(record)}
                      className={`w-full text-left p-3 rounded-xl transition-all border ${
                        selectedRecordId === record.id
                          ? 'bg-slate-800 text-white border-slate-800'
                          : 'hover:bg-slate-50 border-transparent text-slate-600'
                      } ${mode === 'delete' ? 'hover:bg-red-50 hover:text-red-600' : ''}`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-sm">{record.name}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${
                          selectedRecordId === record.id
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-100 text-slate-500'
                        }`}>
                          {record.manager}
                        </span>
                      </div>
                      <div className="flex justify-between items-end">
                        <span className={`text-xs ${selectedRecordId === record.id ? 'text-slate-300' : 'text-slate-400'}`}>
                          {record.frequency} / {formatCurrency(record.expenseAmount)}
                        </span>
                        <span className="text-xs font-medium">
                          {record.result === '완료' ? '✅' : record.result === '미납' ? '❌' : record.result === '연기' ? '⏳' : '⚠️'}
                        </span>
                      </div>
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setPreviewId(record.id); }}
                      className="absolute right-2 top-2 p-1.5 bg-white/10 hover:bg-white/30 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Maximize2 className="w-3 h-3 text-white" />
                    </button>
                  </div>
                ))}
                {mode === 'add' && (
                  <div className="p-3 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-400 text-sm">
                    <Plus className="w-4 h-4 mr-1" /> 신규 입력 대기 중
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <h3 className="font-bold text-slate-700 flex items-center gap-2 text-sm uppercase">
                  {mode === 'add' ? '신규 등록' : mode === 'edit' ? '정보 수정' : '상세 정보'}
                </h3>
                {(mode === 'add' || mode === 'edit') && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setMode('view'); setFormData({}); setSelectedRecordId(null); }}
                      className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-sm font-medium transition-colors"
                    >
                      취소
                    </button>
                    <button
                      onClick={handleSave}
                      className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-sm font-medium shadow-sm transition-colors"
                    >
                      저장하기
                    </button>
                  </div>
                )}
              </div>
              <div className="p-6">
                {(!selectedRecordId && mode !== 'add') ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-300 py-20">
                    <Eye className="w-12 h-12 mb-4 opacity-20" />
                    <p className="text-sm font-medium">왼쪽 리스트에서 인원을 선택해주세요.</p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <span className="w-4 h-px bg-slate-200"></span> 계약내용
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <FormGroup label="담당자" value={formData.manager || (selectedRecordId ? data.find(d => d.id === selectedRecordId)?.manager : '')} field="manager" mode={mode} setFormData={setFormData} />
                        <FormGroup label="이름" value={formData.name || (selectedRecordId ? data.find(d => d.id === selectedRecordId)?.name : '')} field="name" mode={mode} setFormData={setFormData} />
                        <FormGroup label="횟수(주기)" value={formData.frequency || (selectedRecordId ? data.find(d => d.id === selectedRecordId)?.frequency : '')} field="frequency" mode={mode} setFormData={setFormData} type="select" options={['매주', '2주', '3주', '월']} />
                        <FormGroup label="계약일" value={formData.contractDate || (selectedRecordId ? data.find(d => d.id === selectedRecordId)?.contractDate : '')} field="contractDate" mode={mode} setFormData={setFormData} type="date" />
                        <FormGroup label="지출액(원금)" value={formData.expenseAmount?.toString() || (selectedRecordId ? data.find(d => d.id === selectedRecordId)?.expenseAmount.toString() : '')} field="expenseAmount" mode={mode} setFormData={setFormData} type="number" />
                        <FormGroup label="첫 입금일" value={formData.firstDepositDate || (selectedRecordId ? data.find(d => d.id === selectedRecordId)?.firstDepositDate : '')} field="firstDepositDate" mode={mode} setFormData={setFormData} type="date" />
                        <FormGroup label="입금요일" value={formData.depositDay || (selectedRecordId ? data.find(d => d.id === selectedRecordId)?.depositDay : '')} field="depositDay" mode={mode} setFormData={setFormData} />
                        <FormGroup label="마감일" value={formData.deadline || (selectedRecordId ? data.find(d => d.id === selectedRecordId)?.deadline : '')} field="deadline" mode={mode} setFormData={setFormData} type="date" />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <span className="w-4 h-px bg-slate-200"></span> 진행사항
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <FormGroup label="1회 입금액" value={formData.singleDepositAmount?.toString() || (selectedRecordId ? data.find(d => d.id === selectedRecordId)?.singleDepositAmount.toString() : '')} field="singleDepositAmount" mode={mode} setFormData={setFormData} type="number" />
                        <FormGroup label="입금결과" value={formData.result || (selectedRecordId ? data.find(d => d.id === selectedRecordId)?.result : '')} field="result" mode={mode} setFormData={setFormData} type="select" options={['완료', '연기', '미납', '문제']} />
                        <FormGroup label="원금회수금액" value={formData.principalRecovered?.toString() || (selectedRecordId ? data.find(d => d.id === selectedRecordId)?.principalRecovered.toString() : '')} field="principalRecovered" mode={mode} setFormData={setFormData} type="number" />
                        <FormGroup label="원금미납금액" value={formData.principalUnpaid?.toString() || (selectedRecordId ? data.find(d => d.id === selectedRecordId)?.principalUnpaid.toString() : '')} field="principalUnpaid" mode={mode} setFormData={setFormData} type="number" />
                        <FormGroup label="총 횟수" value={formData.totalFrequency?.toString() || (selectedRecordId ? data.find(d => d.id === selectedRecordId)?.totalFrequency.toString() : '')} field="totalFrequency" mode={mode} setFormData={setFormData} type="number" />
                        <FormGroup label="남은 횟수" value={formData.remainingFrequency?.toString() || (selectedRecordId ? data.find(d => d.id === selectedRecordId)?.remainingFrequency.toString() : '')} field="remainingFrequency" mode={mode} setFormData={setFormData} type="number" />
                      </div>
                    </div>
                    <div className="pt-6 border-t border-slate-100">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                        <div>
                          <div className="text-xs text-slate-400 mb-1">총 수익 예상액</div>
                          <div className="text-2xl font-bold text-slate-800">
                            {mode === 'add' || mode === 'edit' ? (
                              <input
                                type="number"
                                className="bg-white border border-slate-200 rounded px-2 py-1 w-full text-lg"
                                value={formData.totalProfit || ''}
                                onChange={(e) => setFormData({ ...formData, totalProfit: Number(e.target.value) })}
                              />
                            ) : (
                              formatCurrency(data.find(d => d.id === selectedRecordId)?.totalProfit || 0)
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-end">
                           <span className={`px-4 py-2 rounded-xl font-bold text-sm ${
                             (selectedRecordId && data.find(d => d.id === selectedRecordId)?.result === '완료') ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'
                           }`}>
                             상태: {selectedRecordId ? data.find(d => d.id === selectedRecordId)?.result : '대기'}
                           </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h3 className="font-bold text-slate-700 flex items-center gap-2">
                <List className="w-4 h-4" /> 전체 개인별 채권 현황 목록
              </h3>
              <div className="flex items-center gap-4">
                 <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="이름/담당자 검색"
                      className="pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-slate-400 outline-none w-48"
                    />
                  </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-bold uppercase tracking-tight">
                    <th className="px-6 py-3 border-b border-slate-100">성함 / 담당자</th>
                    <th className="px-6 py-3 border-b border-slate-100 text-center">계약 정보</th>
                    <th className="px-6 py-3 border-b border-slate-100 text-center">회수 상태</th>
                    <th className="px-6 py-3 border-b border-slate-100 text-center text-green-600">회수액</th>
                    <th className="px-6 py-3 border-b border-slate-100 text-center text-red-500">미수액</th>
                    <th className="px-6 py-3 border-b border-slate-100 text-center">남은 횟수</th>
                    <th className="px-6 py-3 border-b border-slate-100 text-center">관리</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((record) => (
                    <tr key={record.id} className="hover:bg-slate-50/50 transition-colors border-b border-slate-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-slate-800">{record.name}</div>
                        <div className="text-[10px] text-slate-400 font-medium">{record.manager}</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="text-[11px] font-bold text-slate-700">{formatCurrency(record.expenseAmount)}</div>
                        <div className="text-[10px] text-slate-400">{record.frequency} / {record.contractDate}</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          record.result === '완료' ? 'bg-green-100 text-green-700' :
                          record.result === '미납' ? 'bg-red-100 text-red-700' :
                          record.result === '연기' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {record.result}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center text-[11px] font-bold text-green-600">
                        {formatCurrency(record.principalRecovered)}
                      </td>
                      <td className="px-6 py-4 text-center text-[11px] font-bold text-red-500">
                        {formatCurrency(record.principalUnpaid)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="text-xs font-bold text-slate-600">{record.remainingFrequency} / {record.totalFrequency}회</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-1">
                          <button
                            onClick={() => setPreviewId(record.id)}
                            className="p-1.5 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 transition-colors"
                          >
                            <Maximize2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => { setViewLayout('dashboard'); handleRecordAction(record); setMode('edit'); }}
                            className="p-1.5 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Manager Statistics Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white">
            <h2 className="text-base font-bold flex items-center gap-2">
              <Settings className="w-4 h-4 text-slate-400" />
              전체 및 현황 통계
            </h2>
            <button
              onClick={() => setIsStatsExpanded(!isStatsExpanded)}
              className="text-slate-600 hover:text-slate-900 flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 hover:bg-slate-50 rounded-lg transition-colors border border-slate-100"
            >
              {isStatsExpanded ? '접기' : '펼쳐보기'}
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 text-slate-500 text-[11px] font-bold uppercase tracking-tight">
                  <th className="px-6 py-3 border-b border-slate-100">담당자별</th>
                  <th className="px-6 py-3 border-b border-slate-100 text-center">인원 / 금액</th>
                  <th className="px-6 py-3 border-b border-slate-100 text-center text-green-600">완료</th>
                  <th className="px-6 py-3 border-b border-slate-100 text-center text-red-500">미납</th>
                  <th className="px-6 py-3 border-b border-slate-100 text-center text-amber-500">연기</th>
                  <th className="px-6 py-3 border-b border-slate-100">회수율</th>
                </tr>
              </thead>
              <tbody>
                {stats.managerStats.map((mgr) => (
                  <React.Fragment key={mgr.manager}>
                    <tr className="hover:bg-slate-50/30 transition-colors border-b border-slate-50">
                      <td className="px-6 py-5 font-bold text-slate-700 text-sm">{mgr.manager}</td>
                      <td className="px-6 py-5 text-center">
                        <div className="text-sm font-bold text-slate-800">{mgr.count}명</div>
                        <div className="text-[10px] text-slate-400 font-medium">{formatCurrency(mgr.totalAmount)}</div>
                      </td>
                      <td className="px-6 py-5 text-center text-green-600">
                        <div className="text-sm font-bold">{mgr.completedCount}건</div>
                        <div className="text-[10px] text-slate-400 font-medium">{formatCurrency(mgr.recovered)}</div>
                      </td>
                      <td className="px-6 py-5 text-center text-red-500">
                        <div className="text-sm font-bold">{mgr.unpaidCount}건</div>
                        <div className="text-[10px] text-slate-400 font-medium">{formatCurrency(mgr.unpaid)}</div>
                      </td>
                      <td className="px-6 py-5 text-center text-amber-500">
                        <div className="text-sm font-bold">{mgr.delayedCount}건</div>
                        <div className="text-[10px] text-slate-400 font-medium">요청 건</div>
                      </td>
                      <td className="px-6 py-5 min-w-[200px]">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-slate-800 h-full rounded-full transition-all duration-700 ease-out"
                              style={{ width: `${(mgr.recovered / mgr.totalAmount) * 100}%` }}
                            />
                          </div>
                          <span className="text-[11px] font-bold text-slate-500 min-w-[30px]">
                            {((mgr.recovered / mgr.totalAmount) * 100 || 0).toFixed(0)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                    {isStatsExpanded && data.filter(d => d.manager === mgr.manager).map(person => (
                      <tr key={person.id} className="bg-slate-50/50 border-b border-slate-100/50">
                        <td className="px-6 py-3 pl-10">
                          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                             <ArrowRight className="w-3 h-3 text-slate-400" /> {person.name}
                          </div>
                        </td>
                        <td className="px-6 py-3 text-center text-[10px] text-slate-500">
                          {person.frequency} / {formatCurrency(person.expenseAmount)}
                        </td>
                        <td className="px-6 py-3" colSpan={4}>
                          <div className="flex items-center gap-6">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              person.result === '완료' ? 'bg-green-100 text-green-700' :
                              person.result === '미납' ? 'bg-red-100 text-red-700' :
                              person.result === '연기' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                            }`}>
                              {person.result}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">회수: {formatCurrency(person.principalRecovered)} | 미수: {formatCurrency(person.principalUnpaid)} | 잔여: {person.remainingFrequency}회</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-800 text-white font-bold border-t border-slate-700">
                  <td className="px-6 py-5 text-sm">합계</td>
                  <td className="px-6 py-5 text-center">
                    <div className="text-sm">{stats.totalPeople}명</div>
                    <div className="text-[10px] text-slate-300 font-normal">{formatCurrency(stats.totalAmount)}</div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <div className="text-sm">{data.filter(d => d.result === '완료').length}건</div>
                    <div className="text-[10px] text-slate-300 font-normal">{formatCurrency(stats.totalRecovered)}</div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <div className="text-sm">{data.filter(d => d.result === '미납').length}건</div>
                    <div className="text-[10px] text-slate-300 font-normal">{formatCurrency(stats.totalUnpaid)}</div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <div className="text-sm">{data.filter(d => d.result === '연기').length}건</div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="text-sm font-bold">평균 회수율: {((stats.totalRecovered / stats.totalAmount) * 100 || 0).toFixed(1)}%</div>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Individual Detail Quick Preview Modal */}
        {previewId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-800 rounded-xl">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">{data.find(d => d.id === previewId)?.name} 님의 상세 정보</h3>
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-tight">담당 관리자: {data.find(d => d.id === previewId)?.manager}</p>
                  </div>
                </div>
                <button
                  onClick={() => setPreviewId(null)}
                  className="p-2 hover:bg-slate-200 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
              <div className="p-8 grid grid-cols-2 gap-8">
                <div className="space-y-6">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">기본 정보</h4>
                  <div className="grid grid-cols-1 gap-4">
                    <DetailItem label="계약일" value={data.find(d => d.id === previewId)?.contractDate} />
                    <DetailItem label="지출액" value={formatCurrency(data.find(d => d.id === previewId)?.expenseAmount || 0)} isBold />
                    <DetailItem label="입금 주기" value={data.find(d => d.id === previewId)?.frequency} />
                    <DetailItem label="마감일" value={data.find(d => d.id === previewId)?.deadline} />
                  </div>
                </div>
                <div className="space-y-6">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">회수 현황</h4>
                  <div className="grid grid-cols-1 gap-4">
                    <DetailItem label="현재 결과" value={data.find(d => d.id === previewId)?.result} isBadge />
                    <DetailItem label="회수 완료" value={formatCurrency(data.find(d => d.id === previewId)?.principalRecovered || 0)} isGreen />
                    <DetailItem label="미수 금액" value={formatCurrency(data.find(d => d.id === previewId)?.principalUnpaid || 0)} isRed />
                    <DetailItem label="잔여 횟수" value={`${data.find(d => d.id === previewId)?.remainingFrequency} / ${data.find(d => d.id === previewId)?.totalFrequency}회`} />
                  </div>
                </div>
              </div>
              <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                <button
                  onClick={() => {
                    const record = data.find(d => d.id === previewId);
                    if (record) {
                      setViewLayout('dashboard');
                      handleRecordAction(record);
                      setMode('edit');
                    }
                    setPreviewId(null);
                  }}
                  className="px-6 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-bold shadow-lg shadow-slate-200 hover:bg-slate-900 transition-all flex items-center gap-2"
                >
                  <Edit3 className="w-4 h-4" /> 정보 수정하기
                </button>
                <button
                  onClick={() => setPreviewId(null)}
                  className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-100 transition-all"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
