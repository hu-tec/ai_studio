import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import {
  Upload, Trash2, Download, Eye, X, FolderOpen, File, Image as ImageIcon,
  ChevronRight, Home, Search, RefreshCw, HardDrive, ArrowLeft,
  FileText, FileSpreadsheet, FileVideo, FileAudio, Archive,
} from 'lucide-react';

/* ── types ── */
interface S3File {
  key: string;
  size: number;
  lastModified: string;
  url: string;
}

interface S3Info {
  totalSize: number;
  totalCount: number;
  categories: Record<string, { count: number; size: number }>;
}

/* ── helpers ── */
const fmtSize = (b: number) => {
  if (b < 1024) return `${b}B`;
  if (b < 1048576) return `${(b / 1024).toFixed(1)}KB`;
  if (b < 1073741824) return `${(b / 1048576).toFixed(1)}MB`;
  return `${(b / 1073741824).toFixed(2)}GB`;
};

const fmtDate = (iso: string) => {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

const getFileName = (key: string) => {
  const parts = key.split('/');
  const raw = parts[parts.length - 1];
  // strip timestamp prefix (e.g. 1712345678901_)
  return raw.replace(/^\d{13}_/, '');
};

const getExt = (key: string) => {
  const name = key.split('/').pop() || '';
  const dot = name.lastIndexOf('.');
  return dot >= 0 ? name.slice(dot + 1).toLowerCase() : '';
};

const isImage = (key: string) => ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(getExt(key));
const isPdf = (key: string) => getExt(key) === 'pdf';

const getFileIcon = (key: string) => {
  const ext = getExt(key);
  if (isImage(key)) return ImageIcon;
  if (isPdf(key)) return FileText;
  if (['xlsx', 'xls', 'csv'].includes(ext)) return FileSpreadsheet;
  if (['mp4', 'avi', 'mov', 'webm'].includes(ext)) return FileVideo;
  if (['mp3', 'wav', 'ogg', 'aac'].includes(ext)) return FileAudio;
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return Archive;
  return File;
};

/* ── category buttons ── */
const CATEGORIES = [
  { id: 'general', label: '일반', color: '#6366f1' },
  { id: 'work-materials', label: '업무자료', color: '#0ea5e9' },
  { id: 'photos', label: '사진', color: '#f59e0b' },
  { id: 'documents', label: '문서', color: '#10b981' },
  { id: 'meetings', label: '미팅', color: '#8b5cf6' },
  { id: 'interviews', label: '면접', color: '#ef4444' },
  { id: 'education', label: '교육', color: '#ec4899' },
];

/* ══════════════════════════════════════════════════════════
   StoragePanel — 임베드 가능한 S3 파일 브라우저
   ══════════════════════════════════════════════════════════ */
export default function StoragePanel() {
  const [files, setFiles] = useState<S3File[]>([]);
  const [folders, setFolders] = useState<string[]>([]);
  const [prefix, setPrefix] = useState('');
  const [info, setInfo] = useState<S3Info | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadCategory, setUploadCategory] = useState('general');
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchFiles = useCallback(async (p = prefix) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/storage?prefix=${encodeURIComponent(p)}`);
      const data = await res.json();
      setFiles(data.files || []);
      setFolders(data.folders || []);
    } catch { toast.error('파일 목록 로드 실패'); }
    finally { setLoading(false); }
  }, [prefix]);

  const fetchInfo = useCallback(async () => {
    try {
      const res = await fetch('/api/storage/info');
      setInfo(await res.json());
    } catch {}
  }, []);

  useEffect(() => { fetchFiles(prefix); }, [prefix]);
  useEffect(() => { fetchInfo(); }, []);

  const navigate = (p: string) => { setPrefix(p); setSearchText(''); };

  const goUp = () => {
    if (!prefix) return;
    const parts = prefix.replace(/\/$/, '').split('/');
    parts.pop();
    navigate(parts.length ? parts.join('/') + '/' : '');
  };

  const breadcrumbs = prefix ? prefix.replace(/\/$/, '').split('/') : [];

  /* ── upload ── */
  const doUpload = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setUploading(true);
    let ok = 0;
    for (const file of Array.from(fileList)) {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('category', uploadCategory);
      try {
        const res = await fetch('/api/storage/upload', { method: 'POST', body: fd });
        const data = await res.json();
        if (data.success) ok++;
        else toast.error(`${file.name}: ${data.error}`);
      } catch { toast.error(`${file.name}: 업로드 실패`); }
    }
    if (ok > 0) {
      toast.success(`${ok}개 파일 업로드 완료`);
      fetchFiles(prefix);
      fetchInfo();
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    doUpload(e.dataTransfer.files);
  };

  /* ── delete ── */
  const handleDelete = async (key: string) => {
    if (!confirm(`삭제하시겠습니까?\n${getFileName(key)}`)) return;
    try {
      await fetch('/api/storage', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key }),
      });
      setFiles(prev => prev.filter(f => f.key !== key));
      toast.success('삭제되었습니다');
      fetchInfo();
    } catch { toast.error('삭제 실패'); }
  };

  /* ── filter ── */
  const filtered = searchText
    ? files.filter(f => getFileName(f.key).toLowerCase().includes(searchText.toLowerCase()))
    : files;

  /* ── styles ── */
  const cardStyle: React.CSSProperties = {
    background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0',
    padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  };
  const btnStyle = (active?: boolean): React.CSSProperties => ({
    padding: '6px 14px', borderRadius: 8, border: '1px solid',
    borderColor: active ? '#6366f1' : '#e2e8f0',
    background: active ? '#eef2ff' : '#fff',
    color: active ? '#4338ca' : '#475569',
    fontWeight: active ? 600 : 400,
    fontSize: 13, cursor: 'pointer', transition: 'all 0.15s',
  });

  return (
    <div>
      {/* ── ��로고침 ── */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
        <button onClick={() => { fetchFiles(prefix); fetchInfo(); }}
          style={{ ...btnStyle(), display: 'flex', alignItems: 'center', gap: 6 }}>
          <RefreshCw size={14} /> 새로고침
        </button>
      </div>

      {/* ── S3 용량 정보 ── */}
      {info && (
        <div style={{ ...cardStyle, marginBottom: 16, display: 'flex', gap: 32, alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 2 }}>총 사용량</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#1e293b' }}>{fmtSize(info.totalSize)}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 2 }}>파일 수</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#1e293b' }}>{info.totalCount}개</div>
          </div>
          <div style={{ flex: 1, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {Object.entries(info.categories || {}).map(([cat, d]) => (
              <button key={cat} onClick={() => navigate(`uploads/${cat}/`)}
                style={{ ...btnStyle(), fontSize: 12, padding: '4px 10px' }}>
                {cat} <span style={{ color: '#94a3b8', marginLeft: 4 }}>{d.count}개 · {fmtSize(d.size)}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── 업로드 카테고리 + 업로드 영역 ── */}
      <div style={{ ...cardStyle, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#475569' }}>업로드 카테고리:</span>
          {CATEGORIES.map(c => (
            <button key={c.id} onClick={() => setUploadCategory(c.id)}
              style={{
                ...btnStyle(uploadCategory === c.id),
                borderColor: uploadCategory === c.id ? c.color : '#e2e8f0',
                background: uploadCategory === c.id ? c.color + '18' : '#fff',
                color: uploadCategory === c.id ? c.color : '#475569',
              }}>
              {c.label}
            </button>
          ))}
        </div>

        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          style={{
            border: `2px dashed ${dragOver ? '#6366f1' : '#cbd5e1'}`,
            borderRadius: 10, padding: '24px 0', textAlign: 'center',
            background: dragOver ? '#eef2ff' : '#f8fafc',
            transition: 'all 0.2s', cursor: 'pointer',
          }}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload size={28} color={dragOver ? '#6366f1' : '#94a3b8'} style={{ marginBottom: 8 }} />
          <div style={{ color: '#64748b', fontSize: 14 }}>
            {uploading ? '업로드 중...' : '파일을 드래그하거나 클릭하여 업로드'}
          </div>
          <input ref={fileInputRef} type="file" multiple hidden onChange={e => doUpload(e.target.files)} />
        </div>
      </div>

      {/* ── 탐색: 경로 + 검색 ── */}
      <div style={{ ...cardStyle, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {/* breadcrumb */}
          <button onClick={() => navigate('')} style={{ ...btnStyle(!prefix), padding: '4px 10px' }}>
            <Home size={14} />
          </button>
          {prefix && (
            <button onClick={goUp} style={{ ...btnStyle(), padding: '4px 10px' }}>
              <ArrowLeft size={14} />
            </button>
          )}
          {breadcrumbs.map((seg, i) => (
            <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <ChevronRight size={14} color="#94a3b8" />
              <button
                onClick={() => navigate(breadcrumbs.slice(0, i + 1).join('/') + '/')}
                style={{ ...btnStyle(i === breadcrumbs.length - 1), padding: '4px 10px', fontSize: 13 }}>
                {seg}
              </button>
            </span>
          ))}

          <div style={{ flex: 1 }} />

          {/* 검색 */}
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input value={searchText} onChange={e => setSearchText(e.target.value)}
              placeholder="파일명 검색..."
              style={{ paddingLeft: 32, padding: '6px 12px 6px 32px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, width: 200, outline: 'none' }}
            />
          </div>
        </div>
      </div>

      {/* ── 파일 리스트 ── */}
      <div style={cardStyle}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>로딩 중...</div>
        ) : (
          <>
            {/* 폴더 */}
            {folders.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: folders.length && filtered.length ? 16 : 0 }}>
                {folders.map(f => {
                  const name = f.replace(/\/$/, '').split('/').pop();
                  return (
                    <button key={f} onClick={() => navigate(f)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '10px 16px', borderRadius: 10,
                        border: '1px solid #e2e8f0', background: '#f8fafc',
                        cursor: 'pointer', transition: 'all 0.15s',
                        fontSize: 13, fontWeight: 500, color: '#334155',
                      }}
                      onMouseOver={e => { (e.currentTarget as HTMLElement).style.background = '#eef2ff'; }}
                      onMouseOut={e => { (e.currentTarget as HTMLElement).style.background = '#f8fafc'; }}
                    >
                      <FolderOpen size={18} color="#f59e0b" />
                      {name}
                    </button>
                  );
                })}
              </div>
            )}

            {/* 파일 */}
            {filtered.length === 0 && folders.length === 0 && (
              <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>
                {searchText ? '검색 결과 없음' : '비어 있음'}
              </div>
            )}

            {filtered.length > 0 && (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                    <th style={{ textAlign: 'left', padding: '8px 12px', color: '#64748b', fontWeight: 600 }}>파일명</th>
                    <th style={{ textAlign: 'right', padding: '8px 12px', color: '#64748b', fontWeight: 600, width: 100 }}>크기</th>
                    <th style={{ textAlign: 'right', padding: '8px 12px', color: '#64748b', fontWeight: 600, width: 150 }}>수정일</th>
                    <th style={{ textAlign: 'center', padding: '8px 12px', color: '#64748b', fontWeight: 600, width: 120 }}>액션</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(f => {
                    const Icon = getFileIcon(f.key);
                    return (
                      <tr key={f.key} style={{ borderBottom: '1px solid #f1f5f9' }}
                        onMouseOver={e => { (e.currentTarget as HTMLElement).style.background = '#f8fafc'; }}
                        onMouseOut={e => { (e.currentTarget as HTMLElement).style.background = ''; }}
                      >
                        <td style={{ padding: '10px 12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Icon size={16} color="#64748b" />
                            <span style={{ color: '#1e293b', fontWeight: 500 }}>{getFileName(f.key)}</span>
                            <span style={{ color: '#cbd5e1', fontSize: 11 }}>.{getExt(f.key)}</span>
                          </div>
                        </td>
                        <td style={{ textAlign: 'right', padding: '10px 12px', color: '#64748b' }}>{fmtSize(f.size)}</td>
                        <td style={{ textAlign: 'right', padding: '10px 12px', color: '#64748b' }}>{fmtDate(f.lastModified)}</td>
                        <td style={{ textAlign: 'center', padding: '10px 12px' }}>
                          <div style={{ display: 'flex', justifyContent: 'center', gap: 4 }}>
                            {(isImage(f.key) || isPdf(f.key)) && (
                              <button onClick={() => setPreviewUrl(f.url)} title="미리보기"
                                style={{ padding: 6, borderRadius: 6, border: 'none', background: '#f1f5f9', cursor: 'pointer' }}>
                                <Eye size={14} color="#6366f1" />
                              </button>
                            )}
                            <a href={f.url} target="_blank" rel="noreferrer" download title="다운로드"
                              style={{ padding: 6, borderRadius: 6, border: 'none', background: '#f1f5f9', cursor: 'pointer', display: 'inline-flex' }}>
                              <Download size={14} color="#10b981" />
                            </a>
                            <button onClick={() => handleDelete(f.key)} title="삭제"
                              style={{ padding: 6, borderRadius: 6, border: 'none', background: '#fef2f2', cursor: 'pointer' }}>
                              <Trash2 size={14} color="#ef4444" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </>
        )}
      </div>

      {/* ── 미리보기 모달 ── */}
      {previewUrl && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }} onClick={() => setPreviewUrl(null)}>
          <div style={{
            background: '#fff', borderRadius: 16, padding: 16, maxWidth: '90vw', maxHeight: '90vh',
            overflow: 'auto', position: 'relative',
          }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setPreviewUrl(null)}
              style={{ position: 'absolute', top: 8, right: 8, padding: 6, borderRadius: 8, border: 'none', background: '#f1f5f9', cursor: 'pointer' }}>
              <X size={18} />
            </button>
            {previewUrl.toLowerCase().endsWith('.pdf') ? (
              <iframe src={previewUrl} style={{ width: '80vw', height: '80vh', border: 'none' }} />
            ) : (
              <img src={previewUrl} alt="preview" style={{ maxWidth: '85vw', maxHeight: '85vh', borderRadius: 8 }} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
