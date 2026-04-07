const API_BASE = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  if (!res.ok) throw new Error(`API Error: ${res.status}`);
  return res.json();
}

export const api = {
  interviews: {
    list: () => request<any[]>('/interviews'),
    get: (id: number) => request<any>(`/interviews/${id}`),
    create: (data: FormData) =>
      fetch(`${API_BASE}/interviews`, { method: 'POST', body: data }).then((r) => r.json()),
  },
  workLogs: {
    list: () => request<Record<string, any>>('/worklogs'),
    get: (key: string) => request<any>(`/worklogs/${encodeURIComponent(key)}`),
    save: (key: string, data: any) =>
      request(`/worklogs/${encodeURIComponent(key)}`, {
        method: 'POST',
        body: JSON.stringify({ data }),
      }),
  },
  upload: {
    file: (formData: FormData) =>
      fetch(`${API_BASE}/upload`, { method: 'POST', body: formData }).then((r) => r.json()),
  },
  pageMemos: {
    get: (pageKey: string) =>
      request<any>(`/page-memos/${encodeURIComponent(pageKey)}`).catch(() => null),
    save: (pageKey: string, data: any) =>
      request('/page-memos', {
        method: 'POST',
        body: JSON.stringify({ memo_id: pageKey, data }),
      }),
  },
  // 향후 확장: 각 모듈별 API
  meetings: {},
  attendance: {},
  outboundCalls: {},
  pledges: {},
  guidelines: {},
  photos: {},
};
