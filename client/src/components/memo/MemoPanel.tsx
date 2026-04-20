import { useState, useCallback, useMemo } from 'react';
import { StickyNote, MessageSquare, ArrowUpDown, LayoutGrid, List, Pin, PinOff, Crosshair, Pencil, Trash2, Paperclip } from 'lucide-react';
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
import { MEMO_CATEGORIES, type MemoTarget, type MemoCategory, type MemoItemData } from './memoTypes';

type SortMode = 'newest' | 'oldest' | 'category';
type ViewMode = 'card' | 'table';

const SORT_OPTIONS: { key: SortMode; label: string }[] = [
  { key: 'newest', label: '최신순' },
  { key: 'oldest', label: '오래된순' },
  { key: 'category', label: '분류별' },
];

const VIEW_KEY = 'memo_view_mode';

function timeShort(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const sameYear = d.getFullYear() === now.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return sameYear ? `${m}/${day} ${hh}:${mm}` : `${d.getFullYear().toString().slice(2)}/${m}/${day}`;
}

export function MemoPanel() {
  const { items, loading, addMemo, updateMemo, deleteMemo, pageKey } = useMemos();
  const [open, setOpen] = useState(false);
  const [targeting, setTargeting] = useState(false);
  const [pendingTarget, setPendingTarget] = useState<MemoTarget | null>(null);
  const [targetingFor, setTargetingFor] = useState<string>('new');
  const [filterCategory, setFilterCategory] = useState<MemoCategory | 'all'>('all');
  const [sortMode, setSortMode] = useState<SortMode>('newest');
  const [viewMode, setViewMode] = useState<ViewMode>(() => (localStorage.getItem(VIEW_KEY) as ViewMode) || 'card');
  const [hidden, setHidden] = useState(() => localStorage.getItem('memo-btn-hidden') === '1');

  const changeViewMode = (m: ViewMode) => {
    setViewMode(m);
    localStorage.setItem(VIEW_KEY, m);
  };

  // 필터 + 정렬 + 핀 우선 적용
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
    // 핀 고정 항목 항상 최상단
    const pinned = result.filter((m) => m.isPinned);
    const rest = result.filter((m) => !m.isPinned);
    return [...pinned, ...rest];
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

              {/* 정렬 + 뷰 토글 */}
              <div className="flex items-center justify-between">
                <button
                  onClick={cycleSortMode}
                  className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <ArrowUpDown size={11} />
                  {currentSortLabel}
                </button>
                <div className="inline-flex items-center gap-0.5">
                  <button
                    onClick={() => changeViewMode('card')}
                    className={`inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[10px] font-medium transition-all ${
                      viewMode === 'card'
                        ? 'bg-blue-500 text-white'
                        : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-100'
                    }`}
                    title="카드 뷰"
                  >
                    <LayoutGrid size={10} />
                    카드
                  </button>
                  <button
                    onClick={() => changeViewMode('table')}
                    className={`inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[10px] font-medium transition-all ${
                      viewMode === 'table'
                        ? 'bg-blue-500 text-white'
                        : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-100'
                    }`}
                    title="테이블(리스트) 뷰"
                  >
                    <List size={10} />
                    표
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 메모 리스트 */}
          <div className={`flex-1 overflow-y-auto ${viewMode === 'card' ? 'p-3 space-y-2' : 'p-2'}`}>
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
            ) : viewMode === 'card' ? (
              filteredItems.map((item) => (
                <MemoItem
                  key={item.id}
                  item={item}
                  onUpdate={updateMemo}
                  onDelete={deleteMemo}
                  onStartTargeting={handleEditTargeting}
                />
              ))
            ) : (
              <MemoTable
                items={filteredItems}
                onUpdate={updateMemo}
                onDelete={deleteMemo}
                onSwitchToCard={() => changeViewMode('card')}
              />
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

interface MemoTableProps {
  items: MemoItemData[];
  onUpdate: (id: string, updates: Partial<Omit<MemoItemData, 'id' | 'created_at'>>) => void;
  onDelete: (id: string) => void;
  onSwitchToCard: () => void;
}

function MemoTable({ items, onUpdate, onDelete, onSwitchToCard }: MemoTableProps) {
  const scrollToTarget = (selector: string) => {
    try {
      const el = document.querySelector(selector);
      if (!el) return;
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      (el as HTMLElement).style.outline = '3px solid #3b82f6';
      (el as HTMLElement).style.outlineOffset = '2px';
      setTimeout(() => {
        (el as HTMLElement).style.outline = '';
        (el as HTMLElement).style.outlineOffset = '';
      }, 2000);
    } catch { /* invalid selector */ }
  };

  return (
    <div className="overflow-hidden rounded-md border border-slate-200 bg-white">
      {/* 헤더 */}
      <div className="grid grid-cols-[22px_48px_46px_1fr_62px_58px] items-center gap-1 border-b border-slate-200 bg-slate-50 px-1.5 py-1 text-[10px] font-semibold text-slate-500">
        <span></span>
        <span>시간</span>
        <span>분류</span>
        <span>내용</span>
        <span>작성/대상</span>
        <span className="text-right">작업</span>
      </div>
      {/* 행 */}
      <div className="divide-y divide-slate-100">
        {items.map((item) => {
          const cat = MEMO_CATEGORIES.find((c) => c.key === (item.category || 'memo'));
          return (
            <div
              key={item.id}
              className={`grid grid-cols-[22px_48px_46px_1fr_62px_58px] items-center gap-1 px-1.5 py-1 text-[11px] hover:bg-slate-50 ${
                item.isPinned ? 'bg-amber-50/40' : ''
              }`}
            >
              <button
                onClick={() => onUpdate(item.id, { isPinned: !item.isPinned })}
                className={`rounded p-0.5 transition-colors ${
                  item.isPinned ? 'text-amber-500' : 'text-slate-300 hover:text-amber-500'
                }`}
                title={item.isPinned ? '핀 해제' : '상단 핀 고정'}
              >
                {item.isPinned ? <Pin size={11} className="fill-amber-400" /> : <Pin size={11} />}
              </button>
              <span className="text-[10px] text-slate-500 tabular-nums">{timeShort(item.created_at)}</span>
              <span className={`inline-block rounded-full px-1 py-0.5 text-center text-[9px] font-medium ${cat?.color || 'bg-slate-100 text-slate-600'}`}>
                {cat?.label || '메모'}
              </span>
              <div className="min-w-0">
                <p className="truncate text-slate-700" title={item.text}>
                  {item.subCategory && (
                    <span className="mr-1 rounded bg-blue-50 px-1 text-[9px] text-blue-600">{item.subCategory}</span>
                  )}
                  {item.text || <span className="text-slate-300">(내용 없음)</span>}
                </p>
                <div className="flex items-center gap-1 text-[9px] text-slate-400">
                  {item.target && (
                    <button
                      onClick={() => scrollToTarget(item.target!.selector)}
                      className="inline-flex items-center gap-0.5 text-blue-500 hover:text-blue-600"
                      title={item.target.label}
                    >
                      <Crosshair size={9} />
                      <span className="max-w-[90px] truncate">{item.target.label}</span>
                    </button>
                  )}
                  {item.attachments.length > 0 && (
                    <span className="inline-flex items-center gap-0.5">
                      <Paperclip size={9} />
                      {item.attachments.length}
                    </span>
                  )}
                  {(item.replies?.length || 0) > 0 && (
                    <span>💬 {item.replies!.length}</span>
                  )}
                </div>
              </div>
              <div className="min-w-0 text-[10px]">
                {item.author && <div className="truncate font-medium text-slate-700">{item.author}</div>}
                {item.toName && <div className="truncate text-purple-500">→ {item.toName}</div>}
              </div>
              <div className="flex items-center justify-end gap-0.5">
                <button
                  onClick={() => onUpdate(item.id, { isPinned: !item.isPinned })}
                  className={`rounded p-0.5 transition-colors ${
                    item.isPinned
                      ? 'text-amber-500 hover:bg-amber-100'
                      : 'text-slate-300 hover:bg-amber-50 hover:text-amber-500'
                  }`}
                  title={item.isPinned ? '핀 해제' : '상단 핀 고정'}
                >
                  {item.isPinned ? <PinOff size={11} /> : <Pin size={11} />}
                </button>
                <button
                  onClick={onSwitchToCard}
                  className="rounded p-0.5 text-slate-300 hover:bg-blue-50 hover:text-blue-500 transition-colors"
                  title="편집 (카드 뷰로 전환)"
                >
                  <Pencil size={11} />
                </button>
                <button
                  onClick={() => { if (confirm('정말 삭제하시겠습니까?')) onDelete(item.id); }}
                  className="rounded p-0.5 text-slate-300 hover:bg-red-50 hover:text-red-500 transition-colors"
                  title="삭제"
                >
                  <Trash2 size={11} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
