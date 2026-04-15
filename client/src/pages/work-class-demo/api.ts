// 업무 분류 최종 DB (T9) — 공용 API 클라이언트
// 편집 탭 및 외부 consumer 가 import 하는 단일 진입점.
// 중요:
//   - 쓰기 함수(save/softDelete)는 편집 탭 전용. 다른 페이지는 read 함수만 사용.
//   - API 실패 시 fallback 금지. 빈 배열 + 에러 리턴. (틀린 값 > 공백)
//   - 모든 DELETE 는 soft delete (removed=1).

import { useEffect, useState } from 'react';
import type {
  TaxonomyNode, TaxonomyTreeNode, TaxonomyMandalart,
  TaxonomyScope, TaxonomyGov, TaxonomyLevel,
} from './taxonomyTypes';

const BASE = '/api';

async function http<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

// 서버가 관리하는 필드와 blob 포장은 절대 클라이언트에서 다시 보내지 않는다.
// 특히 `data` 를 그대로 보내면 구 서버 PUT 의 `req.body.data || req.body` 가
// nested blob 을 저장해 outer 의 새 label 을 버리는 버그를 유발한다.
const SERVER_MANAGED = new Set(['data', 'updated_at', 'created_at']);
function sanitizePayload<T extends Record<string, any>>(p: T): Partial<T> {
  const out: any = {};
  for (const [k, v] of Object.entries(p)) {
    if (SERVER_MANAGED.has(k)) continue;
    if (v === undefined) continue;
    out[k] = v;
  }
  return out;
}

// ─── Taxonomy ─────────────────────────────────────────────
export async function fetchAllTaxonomy(): Promise<TaxonomyNode[]> {
  const rows: any[] = await http(`${BASE}/work-class-taxonomy`);
  return rows.map(unwrapTaxonomyRow).filter((n) => n.removed === 0);
}

export async function fetchTaxonomy(
  filter: Partial<Pick<TaxonomyNode, 'scope' | 'gov' | 'axis' | 'level'>> = {},
): Promise<TaxonomyNode[]> {
  const all = await fetchAllTaxonomy();
  return all.filter((n) =>
    (!filter.scope || n.scope === filter.scope) &&
    (!filter.gov   || n.gov === filter.gov) &&
    (!filter.axis  || n.axis === filter.axis) &&
    (!filter.level || n.level === filter.level),
  );
}

export async function fetchTaxonomyTree(
  scope: TaxonomyScope,
  axis: string,
  gov?: TaxonomyGov,
): Promise<TaxonomyTreeNode[]> {
  const nodes = await fetchTaxonomy({ scope, axis, ...(gov ? { gov } : {}) });
  return buildTree(nodes);
}

export async function saveTaxonomyNode(node: Partial<TaxonomyNode>): Promise<{ success: boolean; taxonomy_id?: string; revision?: number; error?: string }> {
  // POST upsert — 신규는 taxonomy_id 생략, 서버가 생성
  return http(`${BASE}/work-class-taxonomy`, {
    method: 'POST',
    body: JSON.stringify(sanitizePayload(node)),
  });
}

export async function updateTaxonomyNode(
  id: string,
  patch: Partial<TaxonomyNode> & { revision: number },
): Promise<{ success: boolean; revision?: number; error?: string }> {
  return http(`${BASE}/work-class-taxonomy/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(sanitizePayload(patch)),
  });
}

export async function softDeleteTaxonomyNode(id: string): Promise<{ success: boolean }> {
  return http(`${BASE}/work-class-taxonomy/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

// ─── Items ────────────────────────────────────────────────
export async function fetchItems(scope?: TaxonomyScope) {
  const rows: any[] = await http(`${BASE}/work-class-items`);
  return rows.map(unwrapItemRow).filter((i) => i.removed === 0 && (!scope || i.scope === scope));
}

export async function saveItem(item: any) {
  return http(`${BASE}/work-class-items`, { method: 'POST', body: JSON.stringify(sanitizePayload(item)) });
}

export async function updateItem(id: string, patch: any) {
  return http(`${BASE}/work-class-items/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(sanitizePayload(patch)) });
}

export async function softDeleteItem(id: string) {
  return http(`${BASE}/work-class-items/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

// ─── Mandalart ────────────────────────────────────────────
export function mandalartKey(scope: TaxonomyScope, gov: TaxonomyGov, rows: number, cols: number) {
  return `${scope}|${gov}|${rows}x${cols}`;
}

export async function fetchMandalart(id: string): Promise<TaxonomyMandalart | null> {
  try {
    const row: any = await http(`${BASE}/work-class-mandalart/${encodeURIComponent(id)}`);
    return unwrapMandalartRow(row);
  } catch {
    return null;
  }
}

export async function saveMandalart(m: Partial<TaxonomyMandalart>) {
  return http(`${BASE}/work-class-mandalart`, { method: 'POST', body: JSON.stringify(m) });
}

// ─── Helpers ──────────────────────────────────────────────
// revision/removed 는 항상 SQL 실제 컬럼에서만 읽는다 (blob 에 stale 값이 남아 있어도 무시 — 이전 버그 원인).
// 나머지 mutable 필드는 blob → flat fallback 순으로 읽어 버그 수정 이전에 blob 에만 저장된 편집을 복구.
// 새 서버 경로는 flat 과 blob 양쪽에 같은 값을 쓰므로 순서가 무관.
function unwrapTaxonomyRow(r: any): TaxonomyNode {
  const data = (typeof r.data === 'object' && r.data !== null) ? r.data : {};
  const pref = (d: any, f: any) => (d !== undefined && d !== null ? d : f);
  return {
    taxonomy_id: r.taxonomy_id,
    scope: pref(data.scope, r.scope),
    gov: pref(data.gov, r.gov),
    axis: pref(data.axis, r.axis),
    level: pref(data.level, r.level),
    parent_id: pref(data.parent_id, r.parent_id) ?? null,
    label: pref(data.label, r.label),
    emoji: pref(data.emoji, r.emoji) ?? null,
    sort_order: Number(pref(data.sort_order, r.sort_order) || 0),
    source: pref(data.source, r.source) || 'user',
    locked: Number(pref(data.locked, r.locked) || 0) as 0 | 1,
    removed: Number(r.removed || 0) as 0 | 1,
    revision: Number(r.revision || 1),
    created_by: r.created_by, updated_by: r.updated_by,
    data, updated_at: r.updated_at,
  };
}
function unwrapItemRow(r: any) {
  return {
    item_id: r.item_id,
    label: r.label,
    scope: r.scope,
    facets: r.facets || {},
    gov_matrix: r.gov_matrix,
    mandalart_cell_id: r.mandalart_cell_id,
    worklog_task_id: r.worklog_task_id,
    note: r.note,
    source: r.source || 'user',
    locked: Number(r.locked || 0) as 0 | 1,
    removed: Number(r.removed || 0) as 0 | 1,
    revision: Number(r.revision || 1),
  };
}
function unwrapMandalartRow(r: any): TaxonomyMandalart {
  const merged = typeof r.data === 'object' && r.data !== null ? r.data : {};
  return {
    mandalart_id: r.mandalart_id,
    data: merged,
    revision: Number(r.revision || 1),
  };
}

function buildTree(nodes: TaxonomyNode[]): TaxonomyTreeNode[] {
  const map = new Map<string, TaxonomyTreeNode>();
  const roots: TaxonomyTreeNode[] = [];
  nodes.forEach((n) => map.set(n.taxonomy_id, { ...n, children: [] }));
  map.forEach((n) => {
    if (n.parent_id && map.has(n.parent_id)) map.get(n.parent_id)!.children.push(n);
    else roots.push(n);
  });
  const sortRec = (arr: TaxonomyTreeNode[]) => {
    arr.sort((a, b) => a.sort_order - b.sort_order || a.label.localeCompare(b.label));
    arr.forEach((x) => sortRec(x.children));
  };
  sortRec(roots);
  return roots;
}

// ─── Hook (read-only, 편집 탭 외부 consumer 용) ─────────────
export function useTaxonomy(
  filter: Partial<Pick<TaxonomyNode, 'scope' | 'gov' | 'axis' | 'level'>> = {},
) {
  const [nodes, setNodes] = useState<TaxonomyNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const key = JSON.stringify(filter);
  useEffect(() => {
    let alive = true;
    setLoading(true);
    fetchTaxonomy(filter)
      .then((n) => { if (alive) { setNodes(n); setError(null); } })
      .catch((e) => { if (alive) { setNodes([]); setError(String(e.message || e)); } })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return { nodes, loading, error };
}
