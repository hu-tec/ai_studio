import { useState, useCallback, useMemo } from 'react';
import { StickyNote, MessageSquare, ArrowUpDown } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { useMemos } from './useMemos';
import { MemoItem } from './MemoItem';
import { MemoInput } from './MemoInput';
import { ElementTargetOverlay } from './ElementTargetOverlay';
import { MEMO_CATEGORIES, type MemoTarget, type MemoCategory } from './memoTypes';

type SortMode = 'newest' | 'oldest' | 'category';

const SORT_OPTIONS: { key: SortMode; label: string }[] = [
  { key: 'newest', label: '최신순' },
  { key: 'oldest', label: '오래된순' },
  { key: 'category', label: '분류별' },
];

export function MemoPanel() {
  const { items, loading, addMemo, updateMemo, deleteMemo, pageKey } = useMemos();
  const [open, setOpen] = useState(false);
  const [targeting, setTargeting] = useState(false);
  const [pendingTarget, setPendingTarget] = useState<MemoTarget | null>(null);
  const [targetingFor, setTargetingFor] = useState<string>('new');
  const [filterCategory, setFilterCategory] = useState<MemoCategory | 'all'>('all');
  const [sortMode, setSortMode] = useState<SortMode>('newest');
  const [hidden, setHidden] = useState(() => localStorage.getItem('memo-btn-hidden') === '1');

  // 필터 + 정렬 적용
  const filteredItems = useMemo(() => {
    let result = filterCategory === 'all'
      ? items
      : items.filter((m) => (m.category || 'memo') === filterCategory);

    if (sortMode === 'oldest') {
      result = [...result].reverse();
    } else if (sortMode === 'category') {
      const order = MEMO_CATEGORIES.map((c) => c.key);
      result = [...result].sort((a, b) =>
        order.indexOf(a.category || 'memo') - order.indexOf(b.category || 'memo')
      );
    }
    return result;
  }, [items, filterCategory, sortMode]);

  const handleStartTargeting = useCallback(() => {
    setTargetingFor('new');
    setOpen(false);
    setTimeout(() => setTargeting(true), 350);
  }, []);

  const handleEditTargeting = useCallback((editId: string) => {
    setTargetingFor(editId);
    setOpen(false);
    setTimeout(() => setTargeting(true), 350);
  }, []);

  const handleTargetSelect = useCallback((target: MemoTarget) => {
    setTargeting(false);
    if (targetingFor === 'new') {
      setPendingTarget(target);
    } else {
      updateMemo(targetingFor, { target });
    }
    setTimeout(() => setOpen(true), 100);
  }, [targetingFor, updateMemo]);

  const handleTargetCancel = useCallback(() => {
    setTargeting(false);
    setTimeout(() => setOpen(true), 100);
  }, []);

  // 정렬 순환
  const cycleSortMode = () => {
    const idx = SORT_OPTIONS.findIndex((o) => o.key === sortMode);
    setSortMode(SORT_OPTIONS[(idx + 1) % SORT_OPTIONS.length].key);
  };

  const pageName = pageKey.replace(/--/g, ' / ');
  const currentSortLabel = SORT_OPTIONS.find((o) => o.key === sortMode)!.label;

  return (
    <>
      {/* 플로팅 메모 버튼 — 숨기기/보이기 토글 */}
      {hidden ? (
        <button
          onClick={() => { setHidden(false); localStorage.setItem('memo-btn-hidden', '0'); }}
          className="fixed top-[72px] right-0 z-40 flex items-center justify-center w-6 h-10 rounded-l-md bg-slate-200/80 text-slate-400 hover:bg-blue-100 hover:text-blue-500 transition-all"
          title="Memo 버튼 보이기"
        >
          <StickyNote size={12} />
        </button>
      ) : (
        <div className="fixed top-[72px] right-4 z-40 flex items-center gap-0">
          <button
            onClick={() => { setHidden(true); localStorage.setItem('memo-btn-hidden', '1'); }}
            className="flex items-center justify-center w-5 h-8 rounded-l-full bg-slate-100 border border-r-0 border-slate-200 text-slate-300 hover:text-slate-500 hover:bg-slate-200 transition-all"
            title="Memo 버튼 숨기기"
          >
            <span style={{ fontSize: 10, lineHeight: 1 }}>&rsaquo;</span>
          </button>
          <button
            data-memo-panel
            onClick={() => setOpen(true)}
            className="flex items-center gap-1.5 rounded-r-full bg-white px-3 py-2 text-sm font-medium text-slate-600 shadow-md border border-slate-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all"
            title="페이지 메모"
          >
            <StickyNote size={16} />
            Memo
            {items.length > 0 && (
              <span className="ml-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-blue-500 px-1.5 text-[11px] font-semibold text-white">
                {items.length}
              </span>
            )}
          </button>
        </div>
      )}

      {/* Sheet 패널 */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="sm:max-w-md flex flex-col p-0">
          <SheetHeader className="border-b border-slate-200 px-4 py-3">
            <SheetTitle className="flex items-center gap-2 text-base">
              <MessageSquare size={18} className="text-blue-500" />
              페이지 메모
            </SheetTitle>
            <SheetDescription className="text-xs">
              {pageName}
            </SheetDescription>
          </SheetHeader>

          {/* 필터 + 정렬 바 */}
          {items.length > 0 && (
            <div className="border-b border-slate-100 px-3 py-2 space-y-1.5">
              {/* 분류 필터 */}
              <div className="flex flex-wrap gap-1">
                <button
                  onClick={() => setFilterCategory('all')}
                  className={`rounded-full px-2 py-0.5 text-[11px] font-medium transition-all ${
                    filterCategory === 'all'
                      ? 'bg-slate-200 text-slate-700 ring-1 ring-slate-300'
                      : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                  }`}
                >
                  전체 ({items.length})
                </button>
                {MEMO_CATEGORIES.map((cat) => {
                  const count = items.filter((m) => (m.category || 'memo') === cat.key).length;
                  if (count === 0) return null;
                  return (
                    <button
                      key={cat.key}
                      onClick={() => setFilterCategory(cat.key)}
                      className={`rounded-full px-2 py-0.5 text-[11px] font-medium transition-all ${
                        filterCategory === cat.key
                          ? `${cat.color} ring-1 ring-current`
                          : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                      }`}
                    >
                      {cat.label} ({count})
                    </button>
                  );
                })}
              </div>

              {/* 정렬 */}
              <button
                onClick={cycleSortMode}
                className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-600 transition-colors"
              >
                <ArrowUpDown size={11} />
                {currentSortLabel}
              </button>
            </div>
          )}

          {/* 메모 리스트 */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {loading ? (
              <div className="flex items-center justify-center py-12 text-sm text-slate-400">
                불러오는 중...
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <StickyNote size={32} className="mb-2 opacity-30" />
                <p className="text-sm">이 페이지에 메모가 없습니다</p>
                <p className="text-xs mt-1">아래에서 메모를 작성하세요</p>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="flex items-center justify-center py-8 text-sm text-slate-400">
                해당 분류의 메모가 없습니다
              </div>
            ) : (
              filteredItems.map((item) => (
                <MemoItem
                  key={item.id}
                  item={item}
                  onUpdate={updateMemo}
                  onDelete={deleteMemo}
                  onStartTargeting={handleEditTargeting}
                />
              ))
            )}
          </div>

          {/* 입력 영역 */}
          <MemoInput
            onSubmit={addMemo}
            onStartTargeting={handleStartTargeting}
            pendingTarget={pendingTarget}
            onClearTarget={() => setPendingTarget(null)}
          />
        </SheetContent>
      </Sheet>

      {/* 대상 지정 오버레이 */}
      {targeting && (
        <ElementTargetOverlay
          onSelect={handleTargetSelect}
          onCancel={handleTargetCancel}
        />
      )}
    </>
  );
}
