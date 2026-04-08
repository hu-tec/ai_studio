import { ExternalLink, Globe, Code2, FolderOpen, Users, BookOpen, FileText } from 'lucide-react';

const FEATURES = [
  { icon: Users, label: '회원 관리', desc: '회원가입, 로그인, 마이페이지' },
  { icon: BookOpen, label: '시험 시스템', desc: '시험 출제, 응시, 채점' },
  { icon: Globe, label: '번역 플랫폼', desc: '번역 요청/수행, 번역가 관리' },
  { icon: FileText, label: '전시 시스템', desc: '전시 작품 업로드, 뮤지엄' },
  { icon: Code2, label: '관리자 패널', desc: '대시보드, 결제, 사이트 설정' },
];

export default function HutechcHomepagePage() {
  return (
    <div style={{ padding: 32, maxWidth: 900, margin: '0 auto' }}>
      {/* 헤더 */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Globe size={22} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1e293b', margin: 0 }}>
              영규-hutechc
            </h1>
            <span style={{ fontSize: 12, color: '#94a3b8' }}>hutechc_hompage_real</span>
          </div>
        </div>
        <p style={{ fontSize: 14, color: '#64748b', margin: '8px 0 0' }}>
          Next.js 15 기반 번역/시험/전시 통합 플랫폼 (Tailwind CSS, TypeScript)
        </p>
      </div>

      {/* 프로젝트 정보 */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 12, marginBottom: 28,
      }}>
        {[
          { label: '프레임워크', value: 'Next.js 15.5' },
          { label: '스타일', value: 'Tailwind CSS 3' },
          { label: '언어', value: 'TypeScript 5' },
          { label: 'GitHub', value: 'hu-tec/hutechc_hompage_real' },
        ].map(item => (
          <div key={item.label} style={{
            padding: '14px 16px', borderRadius: 10, border: '1px solid #e2e8f0',
            background: '#fff',
          }}>
            <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, marginBottom: 4 }}>{item.label}</div>
            <div style={{ fontSize: 13, color: '#334155', fontWeight: 600 }}>{item.value}</div>
          </div>
        ))}
      </div>

      {/* 기능 목록 */}
      <h2 style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', marginBottom: 12 }}>주요 기능</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 28 }}>
        {FEATURES.map(f => (
          <div key={f.label} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '12px 16px', borderRadius: 10, border: '1px solid #e2e8f0',
            background: '#fff',
          }}>
            <f.icon size={18} color="#6366f1" />
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>{f.label}</div>
              <div style={{ fontSize: 12, color: '#94a3b8' }}>{f.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* 파일 경로 */}
      <div style={{
        padding: '14px 16px', borderRadius: 10, background: '#f8fafc',
        border: '1px solid #e2e8f0', marginBottom: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <FolderOpen size={14} color="#64748b" />
          <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>프로젝트 경로</span>
        </div>
        <code style={{ fontSize: 12, color: '#334155' }}>ai_studio/hutechc_hompage_real/</code>
      </div>

      {/* GitHub 링크 */}
      <a
        href="https://github.com/hu-tec/hutechc_hompage_real"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '8px 16px', borderRadius: 8,
          background: '#6366f1', color: '#fff',
          fontSize: 13, fontWeight: 600, textDecoration: 'none',
        }}
      >
        <ExternalLink size={14} />
        GitHub 열기
      </a>
    </div>
  );
}
