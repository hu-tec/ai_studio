import { useState, useMemo } from 'react';
import type { HubPost, PostType, SectionKey } from '../types';
import { matchesPath, PIPELINE_DEPT_MAP } from '../constants';

export function useGlobalFilter(posts: HubPost[]) {
  const [activeSection, setActiveSection] = useState<SectionKey>('board');
  const [activePipeline, setActivePipeline] = useState<string>(''); // '' = 전체
  const [filterType, setFilterType] = useState<PostType | '전체'>('전체');
  const [filterPos, setFilterPos] = useState<string[]>([]);
  const [filterAuthor, setFilterAuthor] = useState('');
  const [activePath, setActivePath] = useState<string[]>([]);
  const [searchText, setSearchText] = useState('');

  const allAuthors = useMemo(() => [...new Set(posts.map(r => r.data.author).filter(Boolean))], [posts]);

  const filtered = useMemo(() => {
    return posts.filter(r => {
      const d = r.data;
      if (filterType !== '전체' && d.type !== filterType) return false;
      if (!matchesPath(d, activePath)) return false;
      if (filterPos.length && !filterPos.some(f => d.position.includes(f))) return false;
      if (filterAuthor && d.author !== filterAuthor) return false;
      // 파이프라인 필터: pipelineId가 있으면 직접 매칭, 없으면 부서명으로 추론
      if (activePipeline) {
        if (d.pipelineId) {
          if (d.pipelineId !== activePipeline) return false;
        } else {
          const depts = PIPELINE_DEPT_MAP[activePipeline] || [];
          if (depts.length && !depts.includes(d.path[0] || '')) return false;
        }
      }
      if (searchText) {
        const s = searchText.toLowerCase();
        if (!d.title.toLowerCase().includes(s) && !d.content.toLowerCase().includes(s) && !d.author.toLowerCase().includes(s) && !(d.note || '').toLowerCase().includes(s)) return false;
      }
      return true;
    });
  }, [posts, filterType, activePath, filterPos, filterAuthor, activePipeline, searchText]);

  const sorted = useMemo(() => [...filtered].sort((a, b) => {
    if (a.data.pinned && !b.data.pinned) return -1;
    if (!a.data.pinned && b.data.pinned) return 1;
    return new Date(b.data.created_at).getTime() - new Date(a.data.created_at).getTime();
  }), [filtered]);

  const anyFilterActive = filterType !== '전체' || activePath.length > 0 || filterPos.length > 0 || !!filterAuthor || !!activePipeline || !!searchText;

  const resetFilters = () => { setFilterType('전체'); setActivePath([]); setFilterPos([]); setFilterAuthor(''); setActivePipeline(''); setSearchText(''); };

  return {
    activeSection, setActiveSection,
    activePipeline, setActivePipeline,
    filterType, setFilterType,
    filterPos, setFilterPos,
    filterAuthor, setFilterAuthor,
    activePath, setActivePath,
    searchText, setSearchText,
    allAuthors, filtered, sorted, anyFilterActive, resetFilters,
  };
}
