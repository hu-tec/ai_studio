import { useState, useCallback, useMemo } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { RightPanel } from './RightPanel';
import { ListView } from './ListView';
import { DashboardView } from './DashboardView';
import { GuidelineResult } from './GuidelineResult';
import { MOCK_DATA, LargeCategory, Regulation } from './mockData';
import { Toaster, toast } from 'sonner';

export default function RulesManualPage() {
  const [viewMode, setViewMode] = useState<'dashboard' | 'list' | 'result'>('list');
  const [actionMode, setActionMode] = useState<'view' | 'edit' | 'add' | 'delete'>('view');
  const [activeCategory, setActiveCategory] = useState<string>('A_FIELD');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [dbData, setDbData] = useState<Record<string, LargeCategory[]>>(MOCK_DATA);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);
  const [guidelineInfo, setGuidelineInfo] = useState<{rules: Regulation[], categoryInfo: any, comment: string} | null>(null);
  const [history, setHistory] = useState<any[]>([]);

  const activeData = useMemo(() => {
    const categories = dbData[activeCategory] || [];
    return categories.flatMap(l =>
      l.mediumCategories.flatMap(m =>
        m.smallCategories.flatMap(s => s.regulations)));
  }, [dbData, activeCategory]);

  const handleToggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleToggleAll = useCallback(() => {
    if (selectedIds.size >= activeData.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(activeData.map(r => r.id)));
    }
  }, [activeData, selectedIds.size]);

  const handleGenerateGuideline = useCallback((rules: Regulation[], categoryInfo: any, comment: string) => {
    setGuidelineInfo({ rules, categoryInfo, comment });
    setViewMode('result');

    // Add to history
    const newHistory = {
      id: Date.now(),
      type: 'issue',
      title: `${categoryInfo.small} 지시서 발행`,
      category: categoryInfo.small,
      time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toLocaleDateString('ko-KR'),
      count: rules.length
    };
    setHistory(prev => [newHistory, ...prev]);
  }, []);

  const handleUpdateRegulation = useCallback((reg: Regulation) => {
    setDbData(prev => {
      const newData = JSON.parse(JSON.stringify(prev));
      const cats = newData[activeCategory];

      cats.forEach((l: LargeCategory) => {
        l.mediumCategories.forEach(m => {
          m.smallCategories.forEach(s => {
            const index = s.regulations.findIndex(r => r.id === reg.id);
            if (index !== -1) {
              s.regulations[index] = { ...reg, lastUpdated: '2026-03-12' };
            }
          });
        });
      });

      return newData;
    });
  }, [activeCategory]);

  const handleAddRegulation = useCallback((smallId: string, type: 'fixed' | 'semi' | 'optional') => {
    setDbData(prev => {
      const newData = JSON.parse(JSON.stringify(prev));
      const cats = newData[activeCategory];

      cats.forEach((l: LargeCategory) => {
        l.mediumCategories.forEach(m => {
          const small = m.smallCategories.find(s => s.id === smallId);
          if (small) {
            const newReg: Regulation = {
              id: `reg-${Date.now()}`,
              title: `신규 ${type === 'fixed' ? '규정' : type === 'semi' ? '준규정' : '선택규정'}`,
              type,
              content: '',
              lastUpdated: '2026-03-12',
              options: [
                { id: `opt-${Date.now()}-1`, label: '적용 여부', type: 'toggle', value: true },
                { id: `opt-${Date.now()}-2`, label: '범위 설정', type: 'select', value: '전체' }
              ]
            };
            small.regulations.push(newReg);
            toast.success('신규 항목이 추가되었습니다.');
          }
        });
      });

      return newData;
    });
  }, [activeCategory]);

  const handleDeleteRegulation = useCallback((regId: string) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    setDbData(prev => {
      const newData = JSON.parse(JSON.stringify(prev));
      const cats = newData[activeCategory];

      cats.forEach((l: LargeCategory) => {
        l.mediumCategories.forEach(m => {
          m.smallCategories.forEach(s => {
            const index = s.regulations.findIndex(r => r.id === regId);
            if (index !== -1) {
              s.regulations.splice(index, 1);
              toast.error('항목이 삭제되었습니다.');
            }
          });
        });
      });

      return newData;
    });
  }, [activeCategory]);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#FBFBFC]">
      <Toaster position="top-right" expand={true} richColors />
      {/* T9 SoT 배너 */}
      <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 border-b border-amber-200 text-[11px] text-amber-800">
        <span>⚠</span>
        <span>대중소 카테고리(분야·급수·홈페이지·부서·직급) 정의는 <a href="/app/work-class-demo" className="font-bold text-blue-700 underline">업무 분류(최종DB) — T9</a> 에서만. 이 페이지는 규정 항목 작성 전용 (좌측 카테고리는 read-only 마이그레이션 대상).</span>
      </div>
      <div className="flex flex-1 min-h-0">

      {/* 1. Left Sidebar (Category Navigation) */}
      <Sidebar activeCategory={activeCategory} setActiveCategory={setActiveCategory} />

      {/* 2. Main Center Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          viewMode={viewMode === 'result' ? 'list' : viewMode}
          setViewMode={(mode: any) => setViewMode(mode)}
          actionMode={actionMode}
          setActionMode={setActionMode}
          allSelected={selectedIds.size > 0 && selectedIds.size >= activeData.length}
          onToggleAll={handleToggleAll}
          onToggleRightPanel={() => setIsRightPanelOpen(!isRightPanelOpen)}
        />

        <main className="flex-1 overflow-hidden relative">
          {viewMode === 'dashboard' ? (
            <DashboardView data={dbData} />
          ) : viewMode === 'result' && guidelineInfo ? (
            <GuidelineResult
              selectedRules={guidelineInfo.rules}
              categoryInfo={guidelineInfo.categoryInfo}
              comment={guidelineInfo.comment}
              onBack={() => setViewMode('list')}
            />
          ) : (
            <ListView
              data={dbData}
              activeType={activeCategory}
              actionMode={actionMode}
              selectedIds={selectedIds}
              onToggleSelect={handleToggleSelect}
              onUpdateRegulation={handleUpdateRegulation}
              onAddRegulation={handleAddRegulation}
              onDeleteRegulation={handleDeleteRegulation}
              onGenerateGuideline={handleGenerateGuideline}
            />
          )}
        </main>
      </div>

      {/* 3. Right Sidebar (History & Favorites) */}
      <RightPanel isOpen={isRightPanelOpen} setIsOpen={setIsRightPanelOpen} history={history} />
      </div>

      {/* Mode Status Indicator */}
      {viewMode !== 'result' && (
        <div className="fixed bottom-6 right-8 z-[60]">
          <div className={`
            flex items-center gap-2 px-4 py-2 rounded-full shadow-xl border transition-all duration-500 transform scale-100 backdrop-blur-md
            ${actionMode === 'view' ? 'bg-white text-gray-800 border-gray-200' :
              actionMode === 'edit' ? 'bg-amber-500 text-white border-amber-400' :
              actionMode === 'add' ? 'bg-blue-600 text-white border-blue-500' :
              'bg-red-600 text-white border-red-500'}
          `}>
            <div className="w-2 h-2 rounded-full bg-current animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest">{actionMode} MODE ACTIVE</span>
          </div>
        </div>
      )}
    </div>
  );
}
