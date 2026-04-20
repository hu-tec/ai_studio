import { useState } from 'react';
import { useNavigate } from 'react-router';
import type { NavItem } from '@/components/layout/navData';

export default function CategoryHubLayout({
  title,
  category,
  tabs,
}: {
  title: string;
  category: string;
  tabs: NavItem[];
}) {
  const navigate = useNavigate();
  const [activeCode, setActiveCode] = useState<string>(tabs[0]?.code ?? '');
  const active = tabs.find(t => t.code === activeCode) ?? tabs[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#f8fafc' }}>
      {/* 헤더 */}
      <div style={{ padding: '8px 14px', borderBottom: '1px solid #e2e8f0', background: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
        <h1 style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', margin: 0 }}>{title}</h1>
        <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, background: '#f1f5f9', color: '#64748b', fontWeight: 600 }}>{category}</span>
        <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, background: '#fef3c7', color: '#b45309', fontWeight: 600 }}>🚧 공사중</span>
      </div>

      {/* 상단 카테고리 탭 (G1~G8 / H1~H6 / I1~I5) */}
      <div style={{ display: 'flex', gap: 4, padding: '6px 12px', borderBottom: '1px solid #e2e8f0', background: '#fff', flexWrap: 'wrap' }}>
        {tabs.map(tab => {
          const isActive = tab.code === activeCode;
          const Icon = tab.icon;
          return (
            <button
              key={tab.code}
              type="button"
              onClick={() => setActiveCode(tab.code)}
              style={{
                padding: '4px 10px',
                borderRadius: 6,
                border: '1px solid',
                borderColor: isActive ? '#3b82f6' : '#e2e8f0',
                background: isActive ? '#eff6ff' : '#fff',
                color: isActive ? '#2563eb' : '#475569',
                fontSize: 11,
                fontWeight: isActive ? 700 : 500,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <span style={{ fontSize: 9, color: isActive ? '#93c5fd' : '#94a3b8', fontWeight: 700 }}>{tab.code}</span>
              <Icon size={11} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 본문 — 공사중 푯말 */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🚧</div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>{active?.label ?? title}</h2>
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, background: '#f1f5f9', color: '#64748b', fontWeight: 600 }}>{category}</span>
            <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, background: '#94a3b8', color: '#fff', fontWeight: 600 }}>보류</span>
            {active?.code && <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, background: '#eff6ff', color: '#2563eb', fontWeight: 700 }}>{active.code}</span>}
          </div>
          <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 10 }}>이 페이지는 준비 중입니다.</p>
          {active && (
            <button
              type="button"
              onClick={() => navigate(active.to)}
              style={{ fontSize: 11, padding: '4px 10px', borderRadius: 6, border: '1px solid #e2e8f0', background: '#fff', color: '#475569', cursor: 'pointer', fontWeight: 600 }}
            >
              개별 페이지로 이동 →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
