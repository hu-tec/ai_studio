import { useState, useCallback } from 'react';
import { StickyNote, MessageSquare } from 'lucide-react';
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
import type { MemoTarget } from './memoTypes';

export function MemoPanel() {
  const { items, loading, addMemo, updateMemo, deleteMemo, pageKey } = useMemos();
  const [open, setOpen] = useState(false);
  const [targeting, setTargeting] = useState(false);
  const [pendingTarget, setPendingTarget] = useState<MemoTarget | null>(null);
  // 편집 중 대상 지정: 어떤 메모를 편집 중인지 ('new' = 새 메모, memo id = 기존 메모 편집)
  const [targetingFor, setTargetingFor] = useState<string>('new');

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
      // 편집 중인 메모에 대상 직접 업데이트
      updateMemo(targetingFor, { target });
    }
    setTimeout(() => setOpen(true), 100);
  }, [targetingFor, updateMemo]);

  const handleTargetCancel = useCallback(() => {
    setTargeting(false);
    setTimeout(() => setOpen(true), 100);
  }, []);

  const pageName = pageKey.replace(/--/g, ' / ');

  return (
    <>
      {/* 플로팅 메모 버튼 */}
      <button
        data-memo-panel
        onClick={() => setOpen(true)}
        className="fixed top-[72px] right-4 z-40 flex items-center gap-1.5 rounded-full bg-white px-3 py-2 text-sm font-medium text-slate-600 shadow-md border border-slate-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all"
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
            ) : (
              items.map((item) => (
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
