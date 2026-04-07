import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router';
import { api } from '@/api/api';
import type { MemoItemData, PageMemoData } from './memoTypes';

function toPageKey(pathname: string): string {
  return pathname.replace(/^\//, '').replace(/\//g, '--') || 'home';
}

export function useMemos() {
  const location = useLocation();
  const pageKey = toPageKey(location.pathname);
  const [items, setItems] = useState<MemoItemData[]>([]);
  const [loading, setLoading] = useState(true);

  // 페이지 변경 시 메모 로드
  useEffect(() => {
    setLoading(true);
    api.pageMemos.get(pageKey).then((res) => {
      if (res?.data) {
        const data: PageMemoData = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
        setItems(data.items || []);
      } else {
        setItems([]);
      }
    }).catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [pageKey]);

  const persist = useCallback(
    (newItems: MemoItemData[]) => {
      const data: PageMemoData = { items: newItems };
      api.pageMemos.save(pageKey, data).catch(console.error);
    },
    [pageKey],
  );

  const addMemo = useCallback(
    (item: Omit<MemoItemData, 'id' | 'created_at'>) => {
      const newItem: MemoItemData = {
        ...item,
        id: `memo_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        created_at: new Date().toISOString(),
      };
      setItems((prev) => {
        const next = [newItem, ...prev];
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const updateMemo = useCallback(
    (id: string, updates: Partial<Omit<MemoItemData, 'id' | 'created_at'>>) => {
      setItems((prev) => {
        const next = prev.map((m) => (m.id === id ? { ...m, ...updates } : m));
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const deleteMemo = useCallback(
    (id: string) => {
      setItems((prev) => {
        const next = prev.filter((m) => m.id !== id);
        persist(next);
        return next;
      });
    },
    [persist],
  );

  return { items, loading, addMemo, updateMemo, deleteMemo, pageKey };
}
