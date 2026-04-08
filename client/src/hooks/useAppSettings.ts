import { useState, useEffect, useCallback } from 'react';

/**
 * useAppSettings — localStorage 대신 DB에 설정 저장
 *
 * 사용법:
 *   const [value, setValue] = useAppSettings<string[]>('custom-employees', []);
 *   setValue([...value, '새 직원']);  // DB에 자동 저장
 *
 * 초기 로드: DB에서 가져옴. 없으면 localStorage fallback 후 DB에 마이그레이션.
 */
export function useAppSettings<T>(key: string, defaultValue: T): [T, (v: T) => void, boolean] {
  const [value, setValueState] = useState<T>(defaultValue);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/settings/${encodeURIComponent(key)}`)
      .then(r => r.json())
      .then(data => {
        if (data !== null && data !== undefined) {
          setValueState(data as T);
        } else {
          // DB에 없으면 localStorage fallback + 마이그레이션
          try {
            const local = localStorage.getItem(key);
            if (local) {
              const parsed = JSON.parse(local) as T;
              setValueState(parsed);
              // DB에 자동 마이그레이션
              fetch(`/api/settings/${encodeURIComponent(key)}`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(parsed),
              });
            }
          } catch {}
        }
      })
      .catch(() => {
        // API 실패 시 localStorage fallback
        try {
          const local = localStorage.getItem(key);
          if (local) setValueState(JSON.parse(local) as T);
        } catch {}
      })
      .finally(() => setLoading(false));
  }, [key]);

  const setValue = useCallback((newValue: T) => {
    setValueState(newValue);
    // DB에 저장
    fetch(`/api/settings/${encodeURIComponent(key)}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newValue),
    }).catch(() => {});
    // localStorage에도 백업 (오프라인 대비)
    try { localStorage.setItem(key, JSON.stringify(newValue)); } catch {}
  }, [key]);

  return [value, setValue, loading];
}
