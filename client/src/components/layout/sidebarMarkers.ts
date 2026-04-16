import { useCallback, useEffect, useState } from 'react';

export type PageMarker = '#' | '!' | '$';

export const MARKER_COLORS: Record<PageMarker, { border: string; bg: string; text: string }> = {
  '#': { border: '#eab308', bg: '#fef9c3', text: '#854d0e' },
  '!': { border: '#ef4444', bg: '#fee2e2', text: '#b91c1c' },
  '$': { border: '#10b981', bg: '#d1fae5', text: '#047857' },
};

export const MARKER_LABELS: Record<PageMarker, string> = {
  '#': '주요',
  '!': '이슈',
  '$': '돈',
};

/* ── 전 직원 공용 DB 저장 — localStorage 캐시는 오프라인/첫 프레임용 ── */
const API_URL = '/api/sidebar-markers';
const MARKER_ID = 'global';
const CACHE_KEY = 'sidebar-page-markers-cache';
const EVENT_NAME = 'sidebar-page-markers-changed';

type MarkerMap = Record<string, PageMarker>;

function sanitize(obj: unknown): MarkerMap {
  if (!obj || typeof obj !== 'object') return {};
  const cleaned: MarkerMap = {};
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    if (v === '#' || v === '!' || v === '$') cleaned[k] = v;
  }
  return cleaned;
}

function loadCache(): MarkerMap {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? sanitize(JSON.parse(raw)) : {};
  } catch {
    return {};
  }
}

function writeCache(map: MarkerMap) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(map));
  } catch {
    /* noop */
  }
}

async function fetchFromServer(): Promise<MarkerMap | null> {
  try {
    const res = await fetch(`${API_URL}/${encodeURIComponent(MARKER_ID)}`, { credentials: 'include' });
    if (!res.ok) return null;
    const json = await res.json();
    const d = json?.data;
    if (typeof d === 'string') return sanitize(JSON.parse(d));
    return sanitize(d);
  } catch {
    return null;
  }
}

async function saveToServer(map: MarkerMap): Promise<boolean> {
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ marker_id: MARKER_ID, data: map }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export function nextMarker(current: PageMarker | undefined): PageMarker | undefined {
  if (!current) return '#';
  if (current === '#') return '!';
  if (current === '!') return '$';
  return undefined;
}

export function useSidebarMarkers() {
  // 캐시(localStorage)로 즉시 렌더 → 이후 서버 데이터로 갱신 (DB가 진실 소스)
  const [markers, setMarkers] = useState<MarkerMap>(() => loadCache());

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const fromServer = await fetchFromServer();
      if (cancelled) return;
      if (fromServer) {
        setMarkers(fromServer);
        writeCache(fromServer);
      }
    };
    load();
    const onChanged = () => setMarkers(loadCache());
    window.addEventListener(EVENT_NAME, onChanged);
    return () => {
      cancelled = true;
      window.removeEventListener(EVENT_NAME, onChanged);
    };
  }, []);

  const cycleMarker = useCallback((code: string) => {
    setMarkers((prev) => {
      const next: MarkerMap = { ...prev };
      const n = nextMarker(prev[code]);
      if (n) next[code] = n;
      else delete next[code];
      // Optimistic: 캐시 즉시 갱신 + 이벤트 + 서버 저장
      writeCache(next);
      window.dispatchEvent(new CustomEvent(EVENT_NAME));
      saveToServer(next);
      return next;
    });
  }, []);

  return { markers, cycleMarker };
}
