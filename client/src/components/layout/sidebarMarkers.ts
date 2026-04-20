import { useCallback, useEffect, useState } from 'react';

export type PrimaryMarker = '#' | '$';
export type StatusMarker = '!' | '?';
export type PageMarker = PrimaryMarker | StatusMarker;

export type PageMarkerSet = {
  primary?: PrimaryMarker;
  status?: StatusMarker;
};

export const PRIMARY_MARKERS: PrimaryMarker[] = ['#', '$'];
export const STATUS_MARKERS: StatusMarker[] = ['!', '?'];

export const MARKER_COLORS: Record<PageMarker, { border: string; bg: string; text: string }> = {
  '#': { border: '#eab308', bg: '#fef9c3', text: '#854d0e' },
  '$': { border: '#10b981', bg: '#d1fae5', text: '#047857' },
  '!': { border: '#ef4444', bg: '#fee2e2', text: '#b91c1c' },
  '?': { border: '#8b5cf6', bg: '#ede9fe', text: '#6d28d9' },
};

export const MARKER_LABELS: Record<PageMarker, string> = {
  '#': '주요',
  '$': '돈',
  '!': '이슈',
  '?': '피드백',
};

/* ── 전 직원 공용 DB 저장 — localStorage 캐시는 오프라인/첫 프레임용 ── */
const API_URL = '/api/sidebar-markers';
const MARKER_ID = 'global';
const CACHE_KEY = 'sidebar-page-markers-cache';
const EVENT_NAME = 'sidebar-page-markers-changed';

type MarkerMap = Record<string, PageMarkerSet>;

function isPrimary(v: unknown): v is PrimaryMarker {
  return v === '#' || v === '$';
}
function isStatus(v: unknown): v is StatusMarker {
  return v === '!' || v === '?';
}

function sanitize(obj: unknown): MarkerMap {
  if (!obj || typeof obj !== 'object') return {};
  const cleaned: MarkerMap = {};
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    // 구버전 호환: 단일 문자열 → 2차원 구조로 마이그레이션
    if (typeof v === 'string') {
      if (isPrimary(v)) cleaned[k] = { primary: v };
      else if (isStatus(v)) cleaned[k] = { status: v };
      continue;
    }
    // 신버전: { primary?, status? }
    if (v && typeof v === 'object') {
      const raw = v as Record<string, unknown>;
      const set: PageMarkerSet = {};
      if (isPrimary(raw.primary)) set.primary = raw.primary;
      if (isStatus(raw.status)) set.status = raw.status;
      if (set.primary || set.status) cleaned[k] = set;
    }
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

export function nextPrimary(cur: PrimaryMarker | undefined): PrimaryMarker | undefined {
  if (!cur) return '#';
  if (cur === '#') return '$';
  return undefined;
}

export function nextStatus(cur: StatusMarker | undefined): StatusMarker | undefined {
  if (!cur) return '!';
  if (cur === '!') return '?';
  return undefined;
}

/* ── 섹션 내 정렬 키 ── */
// [primaryRank, statusRank] 사전식 비교
// primary: # < $ < 없음 / status: ! < ? < 없음
export function markerSortKey(set: PageMarkerSet | undefined): [number, number] {
  const p = set?.primary === '#' ? 0 : set?.primary === '$' ? 1 : 9;
  const s = set?.status === '!' ? 0 : set?.status === '?' ? 1 : 9;
  return [p, s];
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

  const applyCycle = useCallback(
    (code: string, dim: 'primary' | 'status') => {
      setMarkers((prev) => {
        const next: MarkerMap = { ...prev };
        const cur = prev[code];
        const updated: PageMarkerSet = { ...(cur ?? {}) };
        if (dim === 'primary') {
          const n = nextPrimary(updated.primary);
          if (n) updated.primary = n;
          else delete updated.primary;
        } else {
          const n = nextStatus(updated.status);
          if (n) updated.status = n;
          else delete updated.status;
        }
        if (!updated.primary && !updated.status) delete next[code];
        else next[code] = updated;
        writeCache(next);
        window.dispatchEvent(new CustomEvent(EVENT_NAME));
        saveToServer(next);
        return next;
      });
    },
    [],
  );

  const cyclePrimary = useCallback((code: string) => applyCycle(code, 'primary'), [applyCycle]);
  const cycleStatus = useCallback((code: string) => applyCycle(code, 'status'), [applyCycle]);

  return { markers, cyclePrimary, cycleStatus };
}
