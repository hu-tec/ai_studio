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

const STORAGE_KEY = 'sidebar-page-markers-v1';
const EVENT_NAME = 'sidebar-page-markers-changed';

type MarkerMap = Record<string, PageMarker>;

function load(): MarkerMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return {};
    const cleaned: MarkerMap = {};
    for (const [k, v] of Object.entries(parsed)) {
      if (v === '#' || v === '!' || v === '$') cleaned[k] = v;
    }
    return cleaned;
  } catch {
    return {};
  }
}

function save(map: MarkerMap) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
    window.dispatchEvent(new CustomEvent(EVENT_NAME));
  } catch {
    /* noop */
  }
}

export function nextMarker(current: PageMarker | undefined): PageMarker | undefined {
  if (!current) return '#';
  if (current === '#') return '!';
  if (current === '!') return '$';
  return undefined;
}

export function useSidebarMarkers() {
  const [markers, setMarkers] = useState<MarkerMap>(() => load());

  useEffect(() => {
    const sync = () => setMarkers(load());
    window.addEventListener(EVENT_NAME, sync);
    window.addEventListener('storage', (e) => {
      if (e.key === STORAGE_KEY) sync();
    });
    return () => {
      window.removeEventListener(EVENT_NAME, sync);
    };
  }, []);

  const cycleMarker = useCallback((code: string) => {
    setMarkers((prev) => {
      const next: MarkerMap = { ...prev };
      const n = nextMarker(prev[code]);
      if (n) next[code] = n;
      else delete next[code];
      save(next);
      return next;
    });
  }, []);

  return { markers, cycleMarker };
}
