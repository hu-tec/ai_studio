import { useState, useEffect } from 'react';
import { HardDrive, Database, Upload } from 'lucide-react';

export default function SystemSection() {
  const [disk, setDisk] = useState<any>(null);
  useEffect(() => { fetch('/api/disk-usage').then(r => r.json()).then(setDisk).catch(() => {}); }, []);

  const gb = (b: number) => (b / 1073741824).toFixed(1);
  const mb = (b: number) => (b / 1048576).toFixed(1);

  return (
    <div style={{ padding: '8px 12px', overflow: 'auto' }}>
      <span style={{ fontSize: 12, fontWeight: 700, color: '#1e293b' }}>시스템</span>

      {/* 디스크 */}
      {disk && (() => {
        const pct = Math.round(disk.used / disk.total * 100);
        const barColor = pct > 90 ? '#EF4444' : pct > 70 ? '#F59E0B' : '#3B82F6';
        return (
          <div style={{ marginTop: 8, padding: '8px 12px', background: '#fff', borderRadius: 8, border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: '#475569', marginBottom: 6 }}>서버 디스크</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <HardDrive size={14} color={barColor} />
              <div style={{ flex: 1, height: 8, background: '#e2e8f0', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: barColor, borderRadius: 4 }} />
              </div>
              <span style={{ fontSize: 10, color: '#475569' }}>{gb(disk.used)}/{gb(disk.total)}GB ({pct}%)</span>
            </div>
            <div style={{ display: 'flex', gap: 12, fontSize: 10, color: '#64748b' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Upload size={10} color="#F59E0B" />업로드: {mb(disk.uploadsSize)}MB</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Database size={10} color="#8B5CF6" />DB: {mb(disk.dbSize)}MB</span>
              <span>여유: {gb(disk.available)}GB</span>
            </div>
          </div>
        );
      })()}

      {/* 계정 관리 */}
      <div style={{ marginTop: 12, padding: '8px 12px', background: '#fff', borderRadius: 8, border: '1px solid #e2e8f0' }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: '#475569', marginBottom: 6 }}>계정/비밀번호 (보안 주의)</div>
        <div style={{ fontSize: 9, color: '#94a3b8', marginBottom: 6 }}>* 별도 암호화 저장 필요 — 현재는 참고용 표시만</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
              <th style={{ padding: '3px 6px', textAlign: 'left', fontSize: 9, fontWeight: 600, color: '#64748b' }}>서비스</th>
              <th style={{ padding: '3px 6px', textAlign: 'left', fontSize: 9, fontWeight: 600, color: '#64748b' }}>용도</th>
              <th style={{ padding: '3px 6px', textAlign: 'left', fontSize: 9, fontWeight: 600, color: '#64748b' }}>비고</th>
            </tr>
          </thead>
          <tbody>
            {[
              { name: 'AWS EC2', use: 'EC2 서버', note: '54.116.15.136, ec2-user, t3.small' },
              { name: 'AWS S3', use: '파일 업로드', note: 'work-studio-uploads' },
              { name: 'GitHub', use: '코드 관리', note: 'hu-tec org' },
              { name: 'Figma', use: '디자인', note: '차지예/황준걸 프로젝트' },
              { name: 'Notion', use: '업무 문서', note: 'jennyy.kim@mail.utoronto.ca' },
              { name: 'Google', use: '메일/캘린더', note: '—' },
            ].map((row, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '3px 6px', fontWeight: 500, color: '#1e293b' }}>{row.name}</td>
                <td style={{ padding: '3px 6px', color: '#64748b' }}>{row.use}</td>
                <td style={{ padding: '3px 6px', color: '#94a3b8' }}>{row.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
