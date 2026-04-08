import { ClipboardList, MessageCircle, Table2, FolderOpen, ExternalLink, HardDrive, BarChart3 } from 'lucide-react';
import { PIPELINES } from '../data/pipeline-data';
import type { SectionKey } from '../types';

const SECTIONS: { key: SectionKey; icon: typeof ClipboardList; label: string }[] = [
  { key: 'board',    icon: ClipboardList,  label: '업무보드' },
  { key: 'feed',     icon: MessageCircle,   label: '피드' },
  { key: 'pipeline', icon: BarChart3,       label: '파이프라인' },
  { key: 'status',   icon: Table2,          label: '현황표' },
  { key: 'archive',  icon: FolderOpen,      label: '자료실' },
  { key: 'links',    icon: ExternalLink,    label: '바로가기' },
  { key: 'system',   icon: HardDrive,       label: '시스템' },
];

interface Props {
  activePipeline: string;
  setActivePipeline: (v: string) => void;
  activeSection: SectionKey;
  setActiveSection: (v: SectionKey) => void;
  postCount: number;
}

export default function NavRail({ activePipeline, setActivePipeline, activeSection, setActiveSection, postCount }: Props) {
  return (
    <div style={{ width: 56, flexShrink: 0, borderRight: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', flexDirection: 'column', overflow: 'auto', padding: '6px 0' }}>
      {/* 파이프라인 전역 필터 */}
      <div style={{ padding: '0 4px', marginBottom: 6 }}>
        <div style={{ fontSize: 8, fontWeight: 700, color: '#94a3b8', textAlign: 'center', marginBottom: 3 }}>파이프라인</div>
        <button onClick={() => setActivePipeline('')}
          style={{ display: 'block', width: '100%', padding: '3px 2px', borderRadius: 4, border: 'none', background: !activePipeline ? '#EFF6FF' : 'transparent', color: !activePipeline ? '#3B82F6' : '#94a3b8', fontSize: 8, fontWeight: !activePipeline ? 700 : 400, cursor: 'pointer', marginBottom: 1, textAlign: 'center' }}>
          전체
        </button>
        {PIPELINES.map(pl => {
          const active = activePipeline === pl.id;
          return (
            <button key={pl.id} onClick={() => setActivePipeline(active ? '' : pl.id)}
              style={{ display: 'block', width: '100%', padding: '3px 2px', borderRadius: 4, border: 'none', background: active ? `${pl.color}15` : 'transparent', color: active ? pl.color : '#64748b', fontSize: 8, fontWeight: active ? 700 : 400, cursor: 'pointer', marginBottom: 1, textAlign: 'center' }}>
              {pl.icon} {pl.name}
            </button>
          );
        })}
      </div>

      <div style={{ borderTop: '1px solid #e2e8f0', margin: '0 6px' }} />

      {/* 섹션 네비게이션 */}
      <div style={{ padding: '6px 4px', flex: 1 }}>
        {SECTIONS.map(sec => {
          const active = activeSection === sec.key;
          return (
            <button key={sec.key} onClick={() => setActiveSection(sec.key)}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, width: '100%', padding: '5px 2px', borderRadius: 6, border: 'none', background: active ? '#EFF6FF' : 'transparent', color: active ? '#3B82F6' : '#64748b', fontSize: 8, fontWeight: active ? 700 : 400, cursor: 'pointer', marginBottom: 2 }}>
              <sec.icon size={14} />
              {sec.label}
              {sec.key === 'board' && postCount > 0 && <span style={{ fontSize: 7, color: '#3B82F6', fontWeight: 700 }}>{postCount}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
