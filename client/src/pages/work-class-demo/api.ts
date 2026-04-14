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
    body: JSON.stringify(node),
  });
}

export async function updateTaxonomyNode(
  id: string,
  patch: Partial<TaxonomyNode> & { revision: number },
): Promise<{ success: boolean; revision?: number; error?: string }> {
  return http(`${BASE}/work-class-taxonomy/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(patch),
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
  return http(`${BASE}/work-class-items`, { method: 'POST', body: JSON.stringify(item) });
}

export async function updateItem(id: string, patch: any) {
  return http(`${BASE}/work-class-items/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(patch) });
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
function unwrapTaxonomyRow(r: any): TaxonomyNode {
  const merged = { ...r, ...(typeof r.data === 'object' && r.data !== null ? r.data : {}) };
  return {
    taxonomy_id: r.taxonomy_id,
    scope: merged.scope, gov: merged.gov, axis: merged.axis, level: merged.level,
    parent_id: merged.parent_id ?? null,
    label: merged.label,
    emoji: merged.emoji ?? null,
    sort_order: Number(merged.sort_order || 0),
    source: merged.source || 'user',
    locked: Number(merged.locked || 0) as 0 | 1,
    removed: Number(merged.removed || 0) as 0 | 1,
    revision: Number(merged.revision || 1),
    created_by: merged.created_by, updated_by: merged.updated_by,
    data: merged.data, updated_at: r.updated_at,
  };
}
function unwrapItemRow(r: any) {
  const merged = { ...r, ...(typeof r.data === 'object' && r.data !== null ? r.data : {}) };
  return {
    item_id: r.item_id,
    label: merged.label,
    scope: merged.scope,
    facets: merged.facets || {},
    gov_matrix: merged.gov_matrix,
    mandalart_cell_id: merged.mandalart_cell_id,
    worklog_task_id: merged.worklog_task_id,
    note: merged.note,
    source: merged.source || 'user',
    locked: Number(merged.locked || 0) as 0 | 1,
    removed: Number(merged.removed || 0) as 0 | 1,
    revision: Number(merged.revision || 1),
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
