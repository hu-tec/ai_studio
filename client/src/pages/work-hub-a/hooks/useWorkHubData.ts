import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import type { HubPost, HubComment, PostType, Attachment } from '../types';
import { toArr, genId } from '../constants';

export function useWorkHubData() {
  const [posts, setPosts] = useState<HubPost[]>([]);
  const [comments, setComments] = useState<HubComment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [postsRes, commentsRes, matRes] = await Promise.all([
        fetch('/api/work-hub'), fetch('/api/work-hub-comments'), fetch('/api/work-materials')
      ]);
      const postsRaw = await postsRes.json();
      const commentsRaw = await commentsRes.json();
      const matRaw = await matRes.json();

      const hubPosts: HubPost[] = (Array.isArray(postsRaw) ? postsRaw : []).map((r: any) => {
        const d = typeof r.data === 'string' ? JSON.parse(r.data) : r.data;
        let path = d.path;
        if (!path && d.department) {
          const dept = Array.isArray(d.department) ? d.department[0] : d.department;
          const c2 = Array.isArray(d.category2) ? d.category2[0] : d.category2;
          const c3 = Array.isArray(d.category3) ? d.category3[0] : d.category3;
          path = [dept, c2, c3].filter(Boolean);
        }
        return { ...r, post_id: r.post_id, data: { ...d, type: d.type || '메모', path: path || ['미분류_창고'], position: toArr(d.position), attachments: d.attachments || [], content: d.content || '', author: d.author || '', pinned: !!d.pinned, created_at: d.created_at || r.updated_at || '', status: d.status || '할당대기', assignee: d.assignee || '', note: d.note || '' } };
      });

      const matPosts: HubPost[] = (Array.isArray(matRaw) ? matRaw : []).map((r: any) => {
        const d = typeof r.data === 'string' ? JSON.parse(r.data) : r.data;
        const dept = Array.isArray(d.department) ? d.department[0] : (d.department || '');
        const c2 = Array.isArray(d.category2) ? d.category2[0] : (d.category2 || '');
        const c3 = Array.isArray(d.category3) ? d.category3[0] : (d.category3 || '');
        return { id: r.id, post_id: `mat_${r.material_id}`, data: { type: '파일' as PostType, path: [dept, c2, c3].filter(Boolean) as any, position: toArr(d.position), title: d.title || '', content: d.content || '', attachments: d.attachments || [], author: d.author || '', pinned: false, note: d.note || '', created_at: d.created_at || r.updated_at || '', status: '완료' as any, assignee: d.author || '' }, updated_at: r.updated_at } as HubPost;
      });

      const parsedComments: HubComment[] = (Array.isArray(commentsRaw) ? commentsRaw : []).map((r: any) => {
        const d = typeof r.data === 'string' ? JSON.parse(r.data) : r.data;
        return { ...r, post_id: d.post_id, data: d };
      });

      setPosts([...hubPosts, ...matPosts]);
      setComments(parsedComments);
    } catch { setPosts([]); setComments([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDelete = async (pid: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
      const isMat = pid.startsWith('mat_');
      const apiPath = isMat ? `/api/work-materials/${pid.replace('mat_', '')}` : `/api/work-hub/${pid}`;
      await fetch(apiPath, { method: 'DELETE' });
      setPosts(p => p.filter(r => r.post_id !== pid));
      const related = comments.filter(c => c.data.post_id === pid);
      for (const c of related) { try { await fetch(`/api/work-hub-comments/${c.comment_id}`, { method: 'DELETE' }); } catch {} }
      setComments(p => p.filter(c => c.data.post_id !== pid));
      toast.success('삭제됨');
    } catch { toast.error('실패'); }
  };

  const handleTogglePin = async (post: HubPost) => {
    if (post.post_id.startsWith('mat_')) return;
    const payload = { ...post.data, pinned: !post.data.pinned };
    try {
      await fetch(`/api/work-hub/${post.post_id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      setPosts(prev => prev.map(p => p.post_id === post.post_id ? { ...p, data: { ...p.data, pinned: !p.data.pinned } } : p));
    } catch { toast.error('실패'); }
  };

  const handleSaveField = async (post: HubPost, field: string, value: any) => {
    if (post.post_id.startsWith('mat_')) { toast.error('업무 자료는 원본 페이지에서 수정'); return; }
    const payload = { ...post.data, [field]: value };
    try {
      await fetch(`/api/work-hub/${post.post_id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      setPosts(prev => prev.map(p => p.post_id === post.post_id ? { ...p, data: { ...p.data, [field]: value } } : p));
    } catch { toast.error('실패'); }
  };

  const getPostComments = (pid: string) => comments.filter(c => c.data.post_id === pid).sort((a, b) => new Date(a.data.created_at).getTime() - new Date(b.data.created_at).getTime());

  return { posts, comments, loading, fetchData, handleDelete, handleTogglePin, handleSaveField, getPostComments };
}
