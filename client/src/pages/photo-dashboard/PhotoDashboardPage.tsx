import React, { useState, useMemo, useEffect } from 'react';
import { 
  Download, 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  FileText, 
  Award, 
  CheckCircle2, 
  Search,
  Grid,
  FileSpreadsheet,
  FileText as FileWordIcon,
  Save,
  X,
  LayoutGrid,
  List,
  BarChart3,
  ChevronRight,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip as RechartsTooltip,
  Legend
} from 'recharts';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';

// --- Assets ---
// @ts-ignore
import img1 from "figma:asset/632b32d4c56afea021e8e464ef157a20259d2c2f.png";
// @ts-ignore
import img2 from "figma:asset/158f439f38074ec6c636d16327502bc5c50d9b40.png";
// @ts-ignore
import img3 from "figma:asset/f924f835a12e1715aedfaf1d9cbd3fe20ceb81c2.png";
// @ts-ignore
import img4 from "figma:asset/fa9464a2ba454b5d9454292d03a1db47810a4a40.png";
// @ts-ignore
import img5 from "figma:asset/44146a0bced6d0625b6611cb069fb0441598ce11.png";
// @ts-ignore
import img6 from "figma:asset/fbbfc907842ec804aa5f08d7d54dee92a3fad1a9.png";
// @ts-ignore
import img7 from "figma:asset/077b48673c977569619911b08e0c9c152c4af280.png";
// @ts-ignore
import img8 from "figma:asset/a490847678318edb19ea57142835738d43612e43.png";
// @ts-ignore
import img9 from "figma:asset/633d5d434ea6e6fca69eca484434aa27ad4f2b5b.png";
// @ts-ignore
import img10 from "figma:asset/4850bae1305885afb3e5fe0a89ac6bcf69c655a8.png";
// @ts-ignore
import img11 from "figma:asset/514b292089faf966fb87b51e727259259e069b27.png";
// @ts-ignore
import img12 from "figma:asset/40955f27c15b920af34ad89dec4860f8d5abb627.png";
// @ts-ignore
import img13 from "figma:asset/4cf259b1b2d49b92078fcfec5b8534f2ff1cb066.png";
// @ts-ignore
import img14 from "figma:asset/59aa02f184df058439cc714510a656ac21937c0b.png";
// @ts-ignore
import img15 from "figma:asset/06c174071f251358c3eaf356c40043dc650416a3.png";
// @ts-ignore
import img16 from "figma:asset/5a5e68f97f5382dcb1ed19b8e97aede220d36905.png";
// @ts-ignore
import img17 from "figma:asset/15e458a84b9177b7069c25bd588db38f0061a10f.png";
// @ts-ignore
import img18 from "figma:asset/a3ae32e5eff5250c2fd0250b0f47843b5ece569e.png";
// @ts-ignore
import img19 from "figma:asset/c47fb3ee056c64daa65a7d2e3c0632335a74f5b9.png";
// @ts-ignore
import img20 from "figma:asset/f8362560f211f1a8748122720439b6118adbdc23.png";
// @ts-ignore
import img21 from "figma:asset/eff7d9f934a0f6b716644f6d085e8ca6b06be206.png";
// @ts-ignore
import img22 from "figma:asset/72d44252af9085a57ff0680663eec625d16909b9.png";
// @ts-ignore
import img23 from "figma:asset/7bc5531d27acfe90240a0dd42a351e6dadcf614d.png";
// @ts-ignore
import img24 from "figma:asset/ef6dd4e63014318b4426dae31a7da7c25671e017.png";
// @ts-ignore
import img25 from "figma:asset/b965adf1ce33bf26a6e39e432e2ca5b261900ab6.png";
// @ts-ignore
import img26 from "figma:asset/fb17610f9e3ba5cedabe59bb56e2a9932b6f0152.png";
// @ts-ignore
import img27 from "figma:asset/a658bb2ed6919f0fdb4c9c7a1a30a6d44aa875c4.png";
// @ts-ignore
import img28 from "figma:asset/b1d358d6781a572cb3fc9ee8869d3096b725bdda.png";
// @ts-ignore
import img29 from "figma:asset/4a104c798f6e72750fdfca7fd661faa231bab784.png";
// @ts-ignore
import img30 from "figma:asset/a1d6d7ad8553917472401c0f23584e571a7b44be.png";
// @ts-ignore
import img31 from "figma:asset/1b5ef7fc6f4ae55fbc3633969eb99e68c5d9015b.png";
// @ts-ignore
import img32 from "figma:asset/a900f957b7e0ab0fa2d0bc0e5fec1833410c827b.png";
// @ts-ignore
import img33 from "figma:asset/0d6b803d565aa1189874bfa7ecd3e76c2e6a6a9d.png";

// --- Types ---
type Category = '협약서' | '특허출원' | '증명서' | '기타';
type Mode = 'VIEW' | 'ADD' | 'EDIT' | 'DELETE';

interface PhotoItem {
  id: string;
  title: string;
  category: Category;
  url: string;
  date: string;
}

// --- Mock Data ---
const CATEGORIES: { label: Category; emoji: string; color: string }[] = [
  { label: '협약서', emoji: '🤝', color: 'blue' },
  { label: '특허출원', emoji: '💡', color: 'amber' },
  { label: '증명서', emoji: '📜', color: 'emerald' },
  { label: '기타', emoji: '📁', color: 'slate' },
];

const INITIAL_DATA: PhotoItem[] = [
  { id: '1', title: '국제통번역사절단협회 협약서', category: '협약서', url: img1, date: '2018-09-18' },
  { id: '2', title: '신한대학교 산학협력협약서', category: '협약서', url: img2, date: '2021-08-10' },
  { id: '3', title: '연세대학교 언어연구교육원 협약서', category: '협약서', url: img3, date: '2018-08-03' },
  { id: '4', title: 'Babe Cosmetics Inc MOU', category: '협약서', url: img4, date: '2022-05-01' },
  { id: '5', title: 'IAE Edu Net MOU', category: '협약서', url: img5, date: '2021-08-01' },
  { id: '6', title: '와이즈에스티글로벌 협약서', category: '협약서', url: img6, date: '2019-02-18' },
  { id: '7', title: 'Juillet Beauty Centre MOU', category: '협약서', url: img7, date: '2021-08-01' },
  { id: '8', title: 'Global Partners MOU (Green)', category: '협약서', url: img8, date: '2021-09-01' },
  { id: '9', title: '민간자격등록증 (인공지능 언어전문가)', category: '증명서', url: img9, date: '2021-09-08' },
  { id: '10', title: '휴텍씨-국제통번역사절단협회 교육협약', category: '협약서', url: img10, date: '2018-09-18' },
  { id: '11', title: '휴텍씨-국제통번역사절단협회 전략적업무제휴', category: '협약서', url: img11, date: '2018-09-18' },
  { id: '12', title: '법무부 번역문 인증사무지침 설명자료', category: '기타', url: img12, date: '2013-10-11' },
  { id: '13', title: '벤처기업확인서 (혁신성장유형)', category: '증명서', url: img13, date: '2022-07-13' },
  { id: '14', title: '수출수입실적의 확인 및 증명서 (캐나다)', category: '증명서', url: img14, date: '2022-04-26' },
  { id: '15', title: '수출수입실적의 확인 및 증명서 (홍콩)', category: '증명서', url: img15, date: '2022-04-14' },
  { id: '16', title: '국제통번역사절단협회-시스트란 협약서', category: '협약서', url: img16, date: '2020-06-04' },
  { id: '17', title: '휴텍씨-시스트란 전략적업무제휴 협약서', category: '협약서', url: img17, date: '2020-05-18' },
  { id: '18', title: '국제통번역사절단협회-엑스와이씨비 협약서', category: '협약서', url: img18, date: '2022-07-14' },
  { id: '19', title: '여성기업 확인서 (서울지방중소벤처기업청)', category: '증명서', url: img19, date: '2021-07-15' },
  { id: '20', title: '여성친화기업 협약서 (서초여성새로일하기센터)', category: '협약서', url: img20, date: '2021-06-16' },
  { id: '21', title: '특허증 (통역서비스 제공 시스템)', category: '특허출원', url: img21, date: '2023-04-24' },
  { id: '22', title: '트위그팜 전략적 업무제휴 협약서', category: '협약서', url: img22, date: '2022-05-02' },
  { id: '23', title: '여성친화기업 협약서 (서초새일센터)', category: '협약서', url: img23, date: '2021-06-16' },
  { id: '24', title: '연구개발전담부서 인정서 (과학기술정보통신부)', category: '증명서', url: img24, date: '2021-10-22' },
  { id: '25', title: '와이즈에스티글로벌 협약서 (업무제휴)', category: '협약서', url: img25, date: '2019-04-15' },
  { id: '26', title: '이즈커뮤니케이션즈 전략적 업무제휴 협약서', category: '협약서', url: img26, date: '2018-09-18' },
  { id: '27', title: '중소기업 확인서 (소기업/소상공인)', category: '증명서', url: img27, date: '2022-03-31' },
  { id: '28', title: '창업기업 확인서 (중소벤처기업부)', category: '증명서', url: img28, date: '2022-03-03' },
  { id: '29', title: '출원사실증명원 (특허 출원 증명)', category: '증명서', url: img29, date: '2021-09-30' },
  { id: '30', title: '특허증 (번역서비스 제공 시스템)', category: '특허출원', url: img30, date: '2023-04-24' },
  { id: '31', title: '휴텍씨-한국정보통신윤리지도자협회 협약서', category: '협약서', url: img31, date: '2022-06-20' },
  { id: '32', title: '출원사실증명원 (LLM 프롬프팅 최적화)', category: '증명서', url: img32, date: '2024-02-28' },
  { id: '33', title: '출원사실증명원 (본-프롬프팅 최적화)', category: '증명서', url: img33, date: '2024-02-28' },
];

const MOCK_ITEMS: PhotoItem[] = INITIAL_DATA;

// --- API helpers ---
function savePhotoToServer(id: string, data: any) {
  fetch('/api/photos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ photo_id: id, data })
  }).catch(() => {});
}

function deletePhotoFromServer(id: string) {
  fetch(`/api/photos/${id}`, { method: 'DELETE' }).catch(() => {});
}

export function PhotoDashboardPage() {
  const [items, setItems] = useState<PhotoItem[]>(MOCK_ITEMS);

  // Load from API on mount
  useEffect(() => {
    fetch('/api/photos').then(r => r.json()).then((rows: any[]) => {
      if (rows.length > 0) {
        const loaded = rows.map((r: any) => r.data).filter(Boolean);
        if (loaded.length > 0) {
          setItems(loaded as PhotoItem[]);
        }
      }
    }).catch(() => {}); // silent fallback to mock (photos have embedded image refs)
  }, []);
  const [mode, setMode] = useState<Mode>('VIEW');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'ALL'>('ALL');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [previewItem, setPreviewItem] = useState<PhotoItem | null>(null);
  const [layout, setLayout] = useState<'GRID' | 'LIST'>('GRID');
  const [showStats, setShowStats] = useState(true);

  // Statistics Calculation
  const statsData = useMemo(() => {
    return CATEGORIES.map(cat => ({
      name: cat.label,
      value: items.filter(i => i.category === cat.label).length,
      emoji: cat.emoji
    }));
  }, [items]);

  const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#64748b'];

  // Filtered data
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [items, searchTerm, selectedCategory]);

  const isAllSelected = filteredItems.length > 0 && filteredItems.every(item => selectedIds.has(item.id));

  // --- Handlers ---
  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (isAllSelected) {
      const newSelected = new Set(selectedIds);
      filteredItems.forEach(item => newSelected.delete(item.id));
      setSelectedIds(newSelected);
    } else {
      const newSelected = new Set(selectedIds);
      filteredItems.forEach(item => newSelected.add(item.id));
      setSelectedIds(newSelected);
    }
  };

  const handleDeleteSelected = () => {
    if (selectedIds.size === 0) return;
    setItems(items.filter(item => !selectedIds.has(item.id)));
    selectedIds.forEach(id => deletePhotoFromServer(id));
    setSelectedIds(new Set());
    toast.error(`${selectedIds.size}개의 항목이 삭제되었습니다.`);
  };

  const handleAddItem = () => {
    const newItem: PhotoItem = {
      id: Date.now().toString(),
      title: '새로운 이미지 항목',
      category: '기타',
      url: 'https://images.unsplash.com/photo-1695041712957-45634f4fa759?q=80&w=400',
      date: new Date().toISOString().split('T')[0]
    };
    setItems([newItem, ...items]);
    savePhotoToServer(newItem.id, newItem);
    toast.success('새 항목이 추가되었습니다.');
  };

  const handleDeleteItem = (id: string) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    setItems(items.filter(item => item.id !== id));
    deletePhotoFromServer(id);
    toast.error('항목이 삭제되었습니다.');
  };

  const handleUpdateItem = (id: string, updates: Partial<PhotoItem>) => {
    const updated = items.map(item => item.id === id ? { ...item, ...updates } : item);
    setItems(updated);
    const updatedItem = updated.find(item => item.id === id);
    if (updatedItem) savePhotoToServer(id, updatedItem);
  };

  const exportToExcel = () => {
    const data = filteredItems.map(item => ({
      ID: item.id,
      제목: item.title,
      카테고리: item.category,
      날짜: item.date,
      URL: item.url
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '사진목록');
    XLSX.writeFile(workbook, `사진모음방_목록_${new Date().toLocaleDateString()}.xlsx`);
    toast.success('Excel 파일 다운로드가 시작되었습니다.');
  };

  const exportToWord = async () => {
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            children: [
              new TextRun({ text: '사진모음방 보관 현황 리포트', bold: true, size: 32 }),
            ],
          }),
          ...filteredItems.map(item => new Paragraph({
            children: [
              new TextRun({ text: `\n[${item.category}] ${item.title}`, bold: true }),
              new TextRun({ text: `\n등록일: ${item.date}` }),
              new TextRun({ text: `\nURL: ${item.url}\n` }),
            ]
          }))
        ],
      }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `사진모음방_리포트_${new Date().toLocaleDateString()}.docx`);
    toast.success('Word 파일 다운로드가 시작되었습니다.');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-6">
      
      {/* Header Section */}
      <header className="max-w-[1800px] mx-auto mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2 mb-2">
            🖼️ 사진모음방 대시보드
          </h1>
          <p className="text-slate-500">이미지 보관 현황 및 카테고리별 분류 (총 {items.length}개)</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Stats Toggle */}
          <button 
            onClick={() => setShowStats(!showStats)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${
              showStats 
                ? 'bg-indigo-50 text-indigo-700 border-indigo-200' 
                : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
            }`}
          >
            <BarChart3 size={16} /> 통계 {showStats ? '숨기기' : '보기'}
          </button>

          {/* Layout Switcher */}
          <div className="flex bg-slate-100 rounded-xl p-1 border border-slate-200">
            <button 
              onClick={() => setLayout('GRID')}
              className={`p-2 rounded-lg transition-all ${layout === 'GRID' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
              title="그리드 보기"
            >
              <LayoutGrid size={18} />
            </button>
            <button 
              onClick={() => setLayout('LIST')}
              className={`p-2 rounded-lg transition-all ${layout === 'LIST' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
              title="리스트 보기"
            >
              <List size={18} />
            </button>
          </div>

          {/* Download Buttons */}
          <div className="flex bg-white rounded-xl shadow-sm border border-slate-200 p-1">
            <button 
              onClick={exportToExcel}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium hover:bg-emerald-50 text-emerald-700 rounded-lg transition-colors"
            >
              <FileSpreadsheet size={16} /> 엑셀 다운
            </button>
            <div className="w-[1px] bg-slate-200 my-1 mx-1" />
            <button 
              onClick={exportToWord}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium hover:bg-blue-50 text-blue-700 rounded-lg transition-colors"
            >
              <FileWordIcon size={16} /> 워드 다운
            </button>
          </div>

          {/* Mode Switchers */}
          <div className="flex bg-slate-200/50 rounded-xl p-1 border border-slate-200">
            {[
              { id: 'VIEW', label: '보기', icon: Eye },
              { id: 'ADD', label: '추가', icon: Plus },
              { id: 'EDIT', label: '수정', icon: Edit3 },
              { id: 'DELETE', label: '삭제', icon: Trash2 },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setMode(m.id as Mode)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  mode === m.id 
                    ? 'bg-white text-slate-900 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <m.icon size={16} />
                {m.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Statistics Section */}
      <AnimatePresence>
        {showStats && (
          <motion.section 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-[1800px] mx-auto mb-10 overflow-hidden"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm flex flex-col items-center min-h-[300px]">
                <h3 className="text-sm font-bold text-slate-500 mb-4 self-start flex items-center gap-2">
                  <Info size={14} /> 카테고리별 비중
                </h3>
                <div className="w-full h-[200px] min-h-[200px]">
                  <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={100}>
                    <PieChart>
                      <Pie
                        data={statsData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {statsData.map((entry, index) => (
                          <Cell key={`pie-cell-${entry.name}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-2">
                  {statsData.map((entry, index) => (
                    <div key={`stat-legend-${entry.name}`} className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      <span>{entry.emoji} {entry.name}: {entry.value}개</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-2 bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm min-h-[300px]">
                <h3 className="text-sm font-bold text-slate-500 mb-4 flex items-center gap-2">
                  <BarChart3 size={14} /> 데이터 분포 현황
                </h3>
                <div className="w-full h-[220px] min-h-[220px]">
                  <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={100}>
                    <BarChart data={statsData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis fontSize={12} tickLine={false} axisLine={false} />
                      <RechartsTooltip cursor={{ fill: '#f8fafc' }} />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                        {statsData.map((entry, index) => (
                          <Cell key={`bar-cell-${entry.name}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Filter & Search */}
      <div className="max-w-[1800px] mx-auto mb-8 flex flex-col md:flex-row gap-4 items-center">
        <div className="flex items-center gap-3 bg-white border border-slate-200 px-4 py-3 rounded-2xl shadow-sm min-w-[140px]">
          <input 
            type="checkbox" 
            checked={isAllSelected}
            onChange={toggleSelectAll}
            className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
          />
          <span className="text-sm font-semibold text-slate-700">전체 선택</span>
        </div>
        
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="파일 제목으로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-hidden focus:ring-2 focus:ring-slate-400 transition-all shadow-sm"
          />
        </div>
        
        {selectedIds.size > 0 && mode === 'DELETE' && (
          <button 
            onClick={handleDeleteSelected}
            className="flex items-center gap-2 px-4 py-3 bg-red-50 text-red-600 border border-red-100 rounded-2xl text-sm font-bold hover:bg-red-100 transition-colors"
          >
            <Trash2 size={16} /> {selectedIds.size}개 삭제하기
          </button>
        )}

        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
          <button 
            onClick={() => setSelectedCategory('ALL')}
            className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium border transition-all ${
              selectedCategory === 'ALL' 
                ? 'bg-slate-900 text-white border-slate-900' 
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
            }`}
          >
            모두보기
          </button>
          {CATEGORIES.map(cat => (
            <button 
              key={cat.label}
              onClick={() => setSelectedCategory(cat.label)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium border transition-all ${
                selectedCategory === cat.label 
                  ? 'bg-slate-900 text-white border-slate-900' 
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              }`}
            >
              <span>{cat.emoji}</span>
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Dashboard Content */}
      <main className="max-w-[1800px] mx-auto pb-24">
        {layout === 'GRID' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <AnimatePresence mode="popLayout">
              {mode === 'ADD' && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="group relative border-2 border-dashed border-slate-300 rounded-3xl p-6 flex flex-col items-center justify-center gap-4 hover:border-slate-400 hover:bg-slate-100/50 transition-all cursor-pointer min-h-[320px]"
                  onClick={handleAddItem}
                >
                  <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center text-slate-500 group-hover:scale-110 transition-transform">
                    <Plus size={24} />
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-slate-700">새 항목 추가</p>
                    <p className="text-xs text-slate-400">클릭하여 새로운 이미지를 등록하세요</p>
                  </div>
                </motion.div>
              )}

              {filteredItems.map((item) => (
                <motion.div
                  key={`grid-${item.id}`}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={`group relative bg-white border rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col ${
                    selectedIds.has(item.id) ? 'border-slate-900 ring-2 ring-slate-900/5' : 'border-slate-200'
                  }`}
                >
                  {/* Image Preview Area - Clickable for popup */}
                  <div 
                    className="relative aspect-video overflow-hidden bg-slate-100 cursor-zoom-in"
                    onClick={() => setPreviewItem(item)}
                  >
                    <ImageWithFallback 
                      src={item.url} 
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div 
                      className="absolute top-3 left-3 flex items-center gap-2 z-10" 
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input 
                        type="checkbox"
                        checked={selectedIds.has(item.id)}
                        onChange={() => toggleSelect(item.id)}
                        className="w-5 h-5 rounded-lg border-slate-300 bg-white/90 backdrop-blur-sm text-slate-900 focus:ring-slate-900 shadow-sm cursor-pointer"
                      />
                      <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[11px] font-bold shadow-sm flex items-center gap-1.5 pointer-events-none">
                        {CATEGORIES.find(c => c.label === item.category)?.emoji} {item.category}
                      </span>
                    </div>
                    
                    {mode === 'DELETE' && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteItem(item.id);
                        }}
                        className="absolute top-3 right-3 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>

                  {/* Content - Clickable for popup too, except in EDIT mode */}
                  <div 
                    className={`p-4 flex-1 flex flex-col ${mode !== 'EDIT' ? 'cursor-pointer' : ''}`}
                    onClick={() => mode !== 'EDIT' && setPreviewItem(item)}
                  >
                    {mode === 'EDIT' ? (
                      <div className="space-y-2">
                        <input 
                          type="text" 
                          value={item.title}
                          onChange={(e) => handleUpdateItem(item.id, { title: e.target.value })}
                          className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:ring-1 focus:ring-slate-400 focus:outline-hidden font-bold"
                        />
                        <div className="flex flex-wrap gap-1">
                          {CATEGORIES.map(c => (
                            <button
                              key={c.label}
                              type="button"
                              onClick={(e) => { e.stopPropagation(); handleUpdateItem(item.id, { category: c.label as Category }); }}
                              className={`px-1.5 py-0.5 text-[11px] rounded-md border ${item.category === c.label ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'}`}
                            >
                              {c.emoji} {c.label}
                            </button>
                          ))}
                        </div>
                        <input 
                          type="date" 
                          value={item.date}
                          onChange={(e) => handleUpdateItem(item.id, { date: e.target.value })}
                          className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:ring-1 focus:ring-slate-400 focus:outline-hidden"
                        />
                      </div>
                    ) : (
                      <>
                        <h3 className="font-bold text-slate-800 line-clamp-1 mb-0.5 text-sm">{item.title}</h3>
                        <p className="text-[11px] text-slate-400 flex items-center gap-1">
                          🗓️ {item.date}
                        </p>
                        
                        {/* Subtitle/Description placeholder */}
                        <p className="mt-2 text-[12px] text-slate-500 line-clamp-2 leading-tight">
                          해당 문서는 {item.category} 관련 보관 자료입니다. 고유 식별번호 #{item.id.slice(-4)}로 관리되고 있습니다.
                        </p>
                      </>
                    )}
                  </div>

                  {/* Hover Action (View Mode) */}
                  {mode === 'VIEW' && (
                    <div className="px-4 py-3 border-t border-slate-50 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setPreviewItem(item); }}
                        className="text-[11px] font-bold text-slate-400 hover:text-slate-900 transition-colors flex items-center gap-1.5"
                      >
                        <FileText size={12} /> 상세보기
                      </button>
                      <div className="flex gap-2">
                         <button 
                           onClick={(e) => e.stopPropagation()}
                           className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors"
                         >
                          <Download size={14} />
                         </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {filteredItems.map((item) => (
                <motion.div
                  key={`list-${item.id}`}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`group relative bg-white border rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all flex items-center gap-4 p-3 cursor-pointer ${
                    selectedIds.has(item.id) ? 'border-slate-900 ring-2 ring-slate-900/5' : 'border-slate-200'
                  }`}
                  onClick={() => setPreviewItem(item)}
                >
                  <div className="flex items-center gap-4 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <input 
                      type="checkbox"
                      checked={selectedIds.has(item.id)}
                      onChange={() => toggleSelect(item.id)}
                      className="w-5 h-5 rounded-lg border-slate-300 text-slate-900 focus:ring-slate-900 shadow-sm cursor-pointer"
                    />
                    <div className="w-20 h-14 bg-slate-100 rounded-xl overflow-hidden border border-slate-100">
                      <ImageWithFallback 
                        src={item.url} 
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="shrink-0 bg-slate-100 px-2.5 py-0.5 rounded-lg text-[10px] font-bold text-slate-600 flex items-center gap-1">
                        {CATEGORIES.find(c => c.label === item.category)?.emoji} {item.category}
                      </span>
                      <h3 className="font-bold text-slate-800 text-sm truncate">{item.title}</h3>
                    </div>
                    <p className="text-[11px] text-slate-400 flex items-center gap-2">
                      <span className="flex items-center gap-1">🗓️ {item.date}</span>
                      <span className="w-[1px] h-2.5 bg-slate-200" />
                      <span className="truncate">관리번호: #{item.id.slice(-4)}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 pr-2">
                    <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all">
                      <ChevronRight size={18} />
                    </button>
                    {mode === 'DELETE' && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteItem(item.id);
                        }}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {filteredItems.length === 0 && (
          <div className="py-20 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
              <Search size={32} />
            </div>
            <p className="text-slate-400">검색 결과가 없습니다.</p>
          </div>
        )}
      </main>

      {/* Image Preview Modal */}
      <AnimatePresence>
        {previewItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-slate-900/90 backdrop-blur-sm"
            onClick={() => setPreviewItem(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-5xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setPreviewItem(null)}
                className="absolute top-4 right-4 z-10 p-2 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full text-white transition-colors"
              >
                <X size={24} />
              </button>

              <div className="flex flex-col md:flex-row h-full max-h-[85vh]">
                {/* Large Image View */}
                <div className="md:w-2/3 bg-slate-100 flex items-center justify-center min-h-[300px]">
                  <ImageWithFallback 
                    src={previewItem.url} 
                    alt={previewItem.title}
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Info Panel */}
                <div className="md:w-1/3 p-8 flex flex-col justify-between border-l border-slate-100">
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="bg-slate-100 px-3 py-1 rounded-full text-xs font-bold text-slate-600 flex items-center gap-1.5">
                        {CATEGORIES.find(c => c.label === previewItem.category)?.emoji} {previewItem.category}
                      </span>
                      <span className="text-xs text-slate-400 font-medium tracking-tight">#{previewItem.id}</span>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2 leading-tight">{previewItem.title}</h2>
                    <p className="text-slate-400 text-sm mb-6 flex items-center gap-2">
                      <FileText size={14} /> 등록일: {previewItem.date}
                    </p>
                    <div className="space-y-4 text-sm text-slate-600">
                      <div className="p-4 bg-slate-50 rounded-2xl">
                        <p className="leading-relaxed font-medium">문서 설명</p>
                        <p className="mt-1 text-slate-500 leading-relaxed">
                          해당 문서는 {previewItem.category} 분류의 증빙 자료입니다. 
                          원본 파일이 안전하게 보관되어 있으며, 관련 업무의 핵심 레퍼런스로 활용 가능합니다.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 flex gap-3">
                    <button 
                      onClick={() => setPreviewItem(null)}
                      className="flex-1 px-6 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-colors"
                    >
                      닫기
                    </button>
                    <button className="flex-1 px-6 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">
                      <Download size={18} /> 다운로드
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Stats Floating bar */}
      <footer className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-md border border-slate-200 px-6 py-3 rounded-2xl shadow-xl flex items-center gap-8 z-50">
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total Files</span>
          <span className="text-lg font-bold leading-none">{items.length}</span>
        </div>
        <div className="w-[1px] h-6 bg-slate-200" />
        <div className="flex gap-4">
          {CATEGORIES.map(cat => (
            <div key={cat.label} className="flex flex-col items-center">
              <span className="text-lg">{cat.emoji}</span>
              <span className="text-[10px] font-bold text-slate-500">
                {items.filter(i => i.category === cat.label).length}
              </span>
            </div>
          ))}
        </div>
      </footer>
    </div>
  );
}

export default PhotoDashboardPage;
