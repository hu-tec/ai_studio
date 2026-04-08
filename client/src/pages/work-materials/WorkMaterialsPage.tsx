import { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react';
import { toast } from 'sonner';
import {
  Plus, Trash2, Pencil, X, Upload, Link as LinkIcon,
  Image as ImageIcon, ChevronDown, ChevronUp,
  Search, File, ExternalLink, Download, Eye, Paperclip, HardDrive, Database
} from 'lucide-react';

const StoragePanel = lazy(() => import('../storage/StoragePage'));

/* ── types ── */
interface Attachment {
  type: 'image' | 'link' | 'file';
  url: string;
  name: string;
  size?: number;
}

interface MaterialData {
  department: string[];   // 대분류 (멀티)
  category2: string[];    // 중분류 (멀티)
  category3: string[];    // 소분류 (멀티)
  position: string[];     // 직급 (멀티)
  title: string;
  content: string;
  attachments: Attachment[];
  author: string;
  note: string;         // 비고
  created_at: string;
}

/* ── helpers ── */
const toArr = (v: unknown): string[] => Array.isArray(v) ? v : typeof v === 'string' && v ? [v] : [];
const arrLabel = (v: string[]) => v.length ? v.join(', ') : '—';

interface MaterialRow {
  id: number;
  material_id: string;
  data: MaterialData;
  updated_at: string;
}

/* ── defaults ── */
const DEF_DEPTS = ['경영', '개발', '마케팅', '인사', '영업', '강사팀', '기획', '홈페이지', '상담', '총무', '관리'];
const DEF_POS = ['대표', '임원', '팀장', '강사', '신입', '알바', '외부'];
const DEF_CAT2 = ['규정', '교육', '홍보', '기술', '운영'];
const DEF_CAT3 = ['급여', '복무', '교안', '브로슈어', '서버', '시스템', '기타'];

const LS_KEY = 'wm-custom-filters';

function loadCustom(): Record<string, string[]> {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '{}'); } catch { return {}; }
}
function saveCustom(c: Record<string, string[]>) { localStorage.setItem(LS_KEY, JSON.stringify(c)); }

function fmtDate(iso: string) { const d = new Date(iso); return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`; }
function fmtSize(b: number) { if(b<1024) return `${b}B`; if(b<1048576) return `${(b/1024).toFixed(0)}KB`; return `${(b/1048576).toFixed(1)}MB`; }

// 더미 데이터 제목 목록 (기존 DB에 남아있는 더미 자동 삭제용)
const DUMMY_TITLES = ['Work Studio API 가이드','TESOL 홍보 브로슈어 초안','AI번역 교육 3급 교안 자료','2026년 2분기 사업 방향','2026 급여 규정 개정안','EC2 서버 접속 정보'];

/* ══════════════════════════════════════════════════════════════
   Main Page
   ══════════════════════════════════════════════════════════════ */
export default function WorkMaterialsPage() {
  const [activeTab, setActiveTab] = useState<'materials'|'storage'>('materials');
  const [rows, setRows] = useState<MaterialRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string|null>(null);
  const [previewRow, setPreviewRow] = useState<MaterialRow|null>(null);
  const [diskInfo, setDiskInfo] = useState<{total:number;used:number;available:number;uploadsSize:number;dbSize:number}|null>(null);

  // filters (빈 배열 = 전체)
  const [filterDept, setFilterDept] = useState<string[]>([]);
  const [filterCat2, setFilterCat2] = useState<string[]>([]);
  const [filterCat3, setFilterCat3] = useState<string[]>([]);
  const [filterPos, setFilterPos] = useState<string[]>([]);
  const [filterAuthor, setFilterAuthor] = useState('전체');
  const [searchText, setSearchText] = useState('');

  // custom filter options
  const [custom, setCustom] = useState<Record<string,string[]>>(loadCustom);
  const updateCustom = (key: string, items: string[]) => { const next = {...custom, [key]: items}; setCustom(next); saveCustom(next); };

  // inline content editing
  const [editingContentId, setEditingContentId] = useState<string|null>(null);
  const [editingContentValue, setEditingContentValue] = useState('');
  // inline note editing
  const [editingNoteId, setEditingNoteId] = useState<string|null>(null);
  const [editingNoteValue, setEditingNoteValue] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/work-materials');
      const raw = await res.json();
      const data: MaterialRow[] = Array.isArray(raw) ? raw.map((r: any) => {
        const d = typeof r.data === 'string' ? JSON.parse(r.data) : r.data;
        return { ...r, data: { ...d, department: toArr(d.department), category2: toArr(d.category2), category3: toArr(d.category3), position: toArr(d.position), attachments: d.attachments||[], content: d.content||'', author: d.author||'', created_at: d.created_at||r.updated_at||'', note: d.note||'' } };
      }) : [];

      // 기존 더미 데이터 자동 삭제 (한 번만 실행)
      const cleaned = localStorage.getItem('wm-dummy-cleaned');
      if (!cleaned && data.length > 0) {
        const dummies = data.filter(r => DUMMY_TITLES.includes(r.data.title));
        for (const d of dummies) {
          try { await fetch(`/api/work-materials/${d.material_id}`, { method: 'DELETE' }); } catch {}
        }
        localStorage.setItem('wm-dummy-cleaned', '1');
        if (dummies.length > 0) {
          setRows(data.filter(r => !DUMMY_TITLES.includes(r.data.title)));
          setLoading(false);
          return;
        }
      }

      setRows(data);
    } catch { setRows([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { fetch('/api/disk-usage').then(r=>r.json()).then(setDiskInfo).catch(()=>{}); }, []);

  // gather unique authors from data
  const allAuthors = [...new Set(rows.map(r=>r.data.author).filter(Boolean))];

  const filtered = rows.filter(r => {
    const d = r.data;
    if (filterDept.length && !filterDept.some(f => d.department.includes(f))) return false;
    if (filterCat2.length && !filterCat2.some(f => d.category2.includes(f))) return false;
    if (filterCat3.length && !filterCat3.some(f => d.category3.includes(f))) return false;
    if (filterPos.length && !filterPos.some(f => d.position.includes(f))) return false;
    if (filterAuthor !== '전체' && d.author !== filterAuthor) return false;
    if (searchText) { const s = searchText.toLowerCase(); if (!d.title.toLowerCase().includes(s) && !d.content.toLowerCase().includes(s) && !d.author.toLowerCase().includes(s) && !(d.note||'').toLowerCase().includes(s)) return false; }
    return true;
  });

  const handleDelete = async (mid: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try { await fetch(`/api/work-materials/${mid}`, { method:'DELETE' }); setRows(p=>p.filter(r=>r.material_id!==mid)); toast.success('삭제되었습니다'); } catch { toast.error('삭제 실패'); }
  };

  const handleInlineContentSave = async (row: MaterialRow) => {
    if (editingContentValue === row.data.content) { setEditingContentId(null); return; }
    const payload = { ...row.data, content: editingContentValue };
    try {
      await fetch(`/api/work-materials/${row.material_id}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
      setRows(prev => prev.map(r => r.material_id === row.material_id ? { ...r, data: { ...r.data, content: editingContentValue } } : r));
      toast.success('내용이 수정되었습니다');
    } catch { toast.error('수정 실패'); }
    setEditingContentId(null);
  };

  const handleInlineNoteSave = async (row: MaterialRow) => {
    if (editingNoteValue === (row.data.note||'')) { setEditingNoteId(null); return; }
    const payload = { ...row.data, note: editingNoteValue };
    try {
      await fetch(`/api/work-materials/${row.material_id}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
      setRows(prev => prev.map(r => r.material_id === row.material_id ? { ...r, data: { ...r.data, note: editingNoteValue } } : r));
      toast.success('비고가 수정되었습니다');
    } catch { toast.error('수정 실패'); }
    setEditingNoteId(null);
  };

  const anyFilterActive = filterDept.length>0||filterCat2.length>0||filterCat3.length>0||filterPos.length>0||filterAuthor!=='전체'||!!searchText;

  if (loading) return <div style={{padding:40,textAlign:'center',color:'#94a3b8'}}>로딩 중...</div>;

  const mergedDepts = [...DEF_DEPTS, ...(custom['dept']||[])];
  const mergedCat2 = [...DEF_CAT2, ...(custom['cat2']||[])];
  const mergedCat3 = [...DEF_CAT3, ...(custom['cat3']||[])];
  const mergedPos = [...DEF_POS, ...(custom['pos']||[])];

  return (
    <div style={{display:'flex',gap:0,padding:'10px 16px',margin:'0 auto'}}>
    {/* ── 왼쪽: 테이블 영역 ── */}
    <div style={{flex:1,minWidth:0}}>
      {/* header + tabs */}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <h2 style={{fontSize:14,fontWeight:700,color:'#1e293b',margin:0}}>업무 자료</h2>
          <div style={{display:'flex',gap:2,background:'#f1f5f9',borderRadius:6,padding:2}}>
            {([['materials','자료 목록'],['storage','서버 저장소 (S3)']] as const).map(([key,label])=>(
              <button key={key} onClick={()=>setActiveTab(key)}
                style={{padding:'3px 10px',borderRadius:4,border:'none',fontSize:11,fontWeight:activeTab===key?600:400,
                  background:activeTab===key?'#fff':'transparent',
                  color:activeTab===key?'#1e293b':'#64748b',
                  boxShadow:activeTab===key?'0 1px 2px rgba(0,0,0,0.06)':'none',
                  cursor:'pointer',transition:'all 0.15s'}}>
                {key==='storage'&&<HardDrive size={11} style={{marginRight:3,verticalAlign:'-2px'}}/>}{label}
              </button>
            ))}
          </div>
          {/* 디스크 상태 — 컴팩트 */}
          {diskInfo&&(()=>{
            const pct = diskInfo.total>0?Math.round(diskInfo.used/diskInfo.total*100):0;
            const gb = (b:number)=>(b/1073741824).toFixed(1);
            const barColor = pct>90?'#EF4444':pct>70?'#F59E0B':'#3B82F6';
            return (
              <div style={{display:'flex',alignItems:'center',gap:6,fontSize:10,color:'#94a3b8',marginLeft:8}}>
                <HardDrive size={11} color={barColor}/>
                <div style={{width:80,height:5,background:'#e2e8f0',borderRadius:3,overflow:'hidden'}}>
                  <div style={{height:'100%',width:`${pct}%`,background:barColor,borderRadius:3}}/>
                </div>
                <span>{gb(diskInfo.used)}/{gb(diskInfo.total)}GB ({pct}%)</span>
              </div>
            );
          })()}
        </div>
        {activeTab==='materials'&&(
        <div style={{display:'flex',gap:4}}>
          {anyFilterActive && <button onClick={()=>{setFilterDept([]);setFilterCat2([]);setFilterCat3([]);setFilterPos([]);setFilterAuthor('전체');setSearchText('');}} style={{display:'flex',alignItems:'center',gap:3,padding:'4px 10px',background:'#FEF2F2',border:'1px solid #FECACA',borderRadius:6,fontSize:11,cursor:'pointer',color:'#EF4444'}}><X size={11}/>초기화</button>}
          <button onClick={()=>{
            const allIds = filtered.map(r=>r.material_id);
            const allExpanded = allIds.every(id=>expandedIds.has(id));
            if(allExpanded) setExpandedIds(new Set());
            else setExpandedIds(new Set(allIds));
          }} style={{display:'flex',alignItems:'center',gap:3,padding:'4px 10px',background:'#f1f5f9',border:'1px solid #e2e8f0',borderRadius:6,fontSize:11,cursor:'pointer',color:'#475569'}}>
            {filtered.length>0 && filtered.every(r=>expandedIds.has(r.material_id)) ? '접기' : '펼치기'}
          </button>
          <button onClick={()=>{setEditingId(null);setShowForm(true);}} style={{display:'flex',alignItems:'center',gap:4,padding:'4px 12px',background:'#3B82F6',color:'#fff',border:'none',borderRadius:6,fontSize:11,fontWeight:600,cursor:'pointer'}}><Plus size={12}/>새 자료</button>
        </div>
        )}
      </div>

      {/* ── 서버 저장소 탭 ── */}
      {activeTab==='storage'&&(
        <Suspense fallback={<div style={{padding:20,textAlign:'center',color:'#94a3b8',fontSize:12}}>로딩 중...</div>}>
          <StoragePanel/>
        </Suspense>
      )}

      {/* ── 자료 목록 탭 ── */}
      {activeTab==='materials'&&(<>

      {/* 필터 */}
      <div style={{display:'flex',flexDirection:'column',gap:5,marginBottom:10}}>
        <div style={{position:'relative',maxWidth:300}}>
          <Search size={13} style={{position:'absolute',left:8,top:7,color:'#94a3b8'}}/>
          <input value={searchText} onChange={e=>setSearchText(e.target.value)} placeholder="제목, 내용, 작성자, 비고 검색..." style={{width:'100%',padding:'5px 10px 5px 28px',border:'1px solid #e2e8f0',borderRadius:6,fontSize:12,outline:'none',background:'#fff'}}/>
        </div>
        <DynFilter label="대분류" items={mergedDepts} defaults={DEF_DEPTS} value={filterDept} onChange={setFilterDept} customKey="dept" custom={custom} updateCustom={updateCustom} multi/>
        <DynFilter label="중분류" items={mergedCat2} defaults={DEF_CAT2} value={filterCat2} onChange={setFilterCat2} customKey="cat2" custom={custom} updateCustom={updateCustom} multi/>
        <DynFilter label="소분류" items={mergedCat3} defaults={DEF_CAT3} value={filterCat3} onChange={setFilterCat3} customKey="cat3" custom={custom} updateCustom={updateCustom} multi/>
        <DynFilter label="직급" items={mergedPos} defaults={DEF_POS} value={filterPos} onChange={setFilterPos} customKey="pos" custom={custom} updateCustom={updateCustom} multi/>
        <div style={{display:'flex',alignItems:'center',gap:4,flexWrap:'wrap'}}>
          <span style={{fontSize:11,color:'#64748b',fontWeight:600,minWidth:40}}>작성자</span>
          <button onClick={()=>setFilterAuthor('전체')} style={{padding:'2px 8px',borderRadius:12,border:'1px solid',borderColor:filterAuthor==='전체'?'#3B82F6':'#e2e8f0',background:filterAuthor==='전체'?'#EFF6FF':'#fff',color:filterAuthor==='전체'?'#3B82F6':'#64748b',fontSize:11,cursor:'pointer',fontWeight:filterAuthor==='전체'?600:400}}>전체</button>
          {allAuthors.map(a=>(
            <button key={a} onClick={()=>setFilterAuthor(a)} style={{padding:'2px 8px',borderRadius:12,border:'1px solid',borderColor:filterAuthor===a?'#3B82F6':'#e2e8f0',background:filterAuthor===a?'#EFF6FF':'#fff',color:filterAuthor===a?'#3B82F6':'#64748b',fontSize:11,cursor:'pointer',fontWeight:filterAuthor===a?600:400}}>{a}</button>
          ))}
        </div>
      </div>

      {/* 테이블 */}
      <div style={{background:'#fff',borderRadius:8,border:'1px solid #e2e8f0',overflow:'hidden'}}>
        <div style={{display:'grid',gridTemplateColumns:'60px 60px 60px 140px 1fr 70px 100px 50px 64px 56px',padding:'6px 10px',background:'#f8fafc',borderBottom:'1px solid #e2e8f0',fontSize:10,fontWeight:600,color:'#64748b',gap:4}}>
          <div>대분류</div><div>중분류</div><div>소분류</div><div>제목</div><div>내용</div><div>첨부</div><div>비고</div><div>작성자</div><div>날짜</div><div></div>
        </div>
        {filtered.length===0 ? (
          <div style={{padding:20,textAlign:'center',color:'#94a3b8',fontSize:12}}>등록된 자료가 없습니다</div>
        ) : filtered.map(row=>{
          const atts = row.data.attachments||[];
          const isOpen = expandedIds.has(row.material_id);
          return (
          <div key={row.material_id}>
            <div onClick={()=>setExpandedIds(prev=>{const next=new Set(prev);if(next.has(row.material_id))next.delete(row.material_id);else next.add(row.material_id);return next;})} style={{display:'grid',gridTemplateColumns:'60px 60px 60px 140px 1fr 70px 100px 50px 64px 56px',padding:'5px 10px',borderBottom:'1px solid #f1f5f9',cursor:'pointer',alignItems:'center',background:isOpen?'#F8FAFC':'#fff',transition:'background 0.15s',gap:4}} onMouseEnter={e=>{if(!isOpen)e.currentTarget.style.background='#fafbfd'}} onMouseLeave={e=>{if(!isOpen)e.currentTarget.style.background='#fff'}}>
              <div style={{display:'flex',gap:2,flexWrap:'wrap'}}>{row.data.department.map((dep,i)=><span key={i} style={{padding:'1px 5px',borderRadius:10,fontSize:9,fontWeight:500,background:'#EFF6FF',color:'#3B82F6'}}>{dep}</span>)}</div>
              <div style={{fontSize:10,color:'#64748b'}}>{arrLabel(row.data.category2)}</div>
              <div style={{fontSize:10,color:'#64748b'}}>{arrLabel(row.data.category3)}</div>
              <div style={{fontSize:12,fontWeight:500,color:'#1e293b',display:'flex',alignItems:'center',gap:3,overflow:'hidden'}}>
                <span style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{row.data.title}</span>
                {isOpen?<ChevronUp size={13} color="#94a3b8" style={{flexShrink:0}}/>:<ChevronDown size={13} color="#94a3b8" style={{flexShrink:0}}/>}
              </div>
              {/* 내용 — 클릭 시 인라인 수정 */}
              <div onClick={e=>{e.stopPropagation();if(editingContentId!==row.material_id){setEditingContentId(row.material_id);setEditingContentValue(row.data.content);}}} style={{fontSize:12,color:'#94a3b8',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',cursor:'text',minHeight:20,borderRadius:4,padding:'2px 4px'}} title="클릭하여 수정">
                <span style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',display:'block'}}>{row.data.content.split('\n')[0]||<span style={{color:'#cbd5e1',fontStyle:'italic'}}>내용 없음</span>}</span>
              </div>
              {/* 첨부 — 개수 + 다운 */}
              <div style={{display:'flex',alignItems:'center',gap:4,fontSize:11,color:'#64748b'}} onClick={e=>e.stopPropagation()}>
                {atts.length===0?<span style={{color:'#cbd5e1'}}>—</span>:(
                  <>
                    <Paperclip size={12} color="#94a3b8"/>
                    <span style={{fontWeight:600}}>{atts.length}</span>
                    {atts.slice(0,2).map((a,i)=>(
                      <a key={i} href={a.url} {...(a.type==='link'?{target:'_blank',rel:'noopener noreferrer'}:{download:a.name})} title={a.name} style={{color:a.type==='link'?'#10B981':a.type==='image'?'#3B82F6':'#F59E0B',display:'inline-flex'}}>
                        {a.type==='link'?<ExternalLink size={11}/>:<Download size={11}/>}
                      </a>
                    ))}
                    {atts.length>2&&<span style={{color:'#94a3b8'}}>+{atts.length-2}</span>}
                  </>
                )}
              </div>
              {/* 비고 — 클릭 시 인라인 수정 */}
              <div onClick={e=>{e.stopPropagation();if(editingNoteId!==row.material_id){setEditingNoteId(row.material_id);setEditingNoteValue(row.data.note||'');}}} style={{fontSize:11,color:'#64748b',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',cursor:'text',borderRadius:4,padding:'2px 4px'}} title="클릭하여 수정">
                {editingNoteId===row.material_id?(
                  <input value={editingNoteValue} onChange={e=>setEditingNoteValue(e.target.value)} onBlur={()=>handleInlineNoteSave(row)} onKeyDown={e=>{if(e.key==='Escape')setEditingNoteId(null);if(e.key==='Enter'){e.preventDefault();handleInlineNoteSave(row);}}} autoFocus style={{width:'100%',fontSize:11,border:'1px solid #3B82F6',outline:'none',borderRadius:4,padding:'2px 4px',background:'#fff',boxSizing:'border-box'}}/>
                ):(
                  <span>{row.data.note||'—'}</span>
                )}
              </div>
              <div style={{fontSize:12,color:'#64748b'}}>{row.data.author}</div>
              <div style={{fontSize:11,color:'#94a3b8'}}>{fmtDate(row.data.created_at)}</div>
              <div style={{display:'flex',gap:2}} onClick={e=>e.stopPropagation()}>
                <button onClick={()=>setPreviewRow(prev=>prev?.material_id===row.material_id?null:row)} style={{background:'none',border:'none',cursor:'pointer',padding:3}} title="미리보기"><Eye size={13} color={previewRow?.material_id===row.material_id?'#1D4ED8':'#3B82F6'}/></button>
                <button onClick={()=>{setEditingId(row.material_id);setShowForm(true);}} style={{background:'none',border:'none',cursor:'pointer',padding:3}} title="수정"><Pencil size={13} color="#94a3b8"/></button>
                <button onClick={()=>handleDelete(row.material_id)} style={{background:'none',border:'none',cursor:'pointer',padding:3}} title="삭제"><Trash2 size={13} color="#ef4444"/></button>
              </div>
            </div>
            {/* 인라인 내용 수정 영역 */}
            {editingContentId===row.material_id&&(
              <div style={{padding:'12px 24px 16px',background:'#FFFBEB',borderBottom:'1px solid #FDE68A'}} onClick={e=>e.stopPropagation()}>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8}}>
                  <span style={{fontSize:13,fontWeight:600,color:'#92400E'}}>내용 수정</span>
                  <div style={{display:'flex',gap:6}}>
                    <button onClick={()=>setEditingContentId(null)} style={{padding:'4px 12px',fontSize:12,background:'#f1f5f9',border:'1px solid #e2e8f0',borderRadius:6,cursor:'pointer',color:'#64748b'}}>취소 (Esc)</button>
                    <button onClick={()=>handleInlineContentSave(row)} style={{padding:'4px 12px',fontSize:12,background:'#3B82F6',color:'#fff',border:'none',borderRadius:6,cursor:'pointer',fontWeight:600}}>저장 (Ctrl+Enter)</button>
                  </div>
                </div>
                <textarea value={editingContentValue} onChange={e=>setEditingContentValue(e.target.value)} onKeyDown={e=>{if(e.key==='Escape')setEditingContentId(null);if(e.key==='Enter'&&(e.ctrlKey||e.metaKey)){e.preventDefault();handleInlineContentSave(row);}}} autoFocus rows={Math.max(5,editingContentValue.split('\n').length+1)} style={{width:'100%',fontSize:14,border:'1px solid #FDE68A',outline:'none',resize:'vertical',lineHeight:1.7,fontFamily:'inherit',padding:'10px 12px',background:'#fff',borderRadius:8,boxSizing:'border-box'}}/>
              </div>
            )}
            {/* 펼침 상세 */}
            {isOpen&&(
              <div style={{padding:'16px 24px 20px',background:'#fafbfd',borderBottom:'1px solid #e2e8f0'}}>
                <div style={{fontSize:14,color:'#334155',lineHeight:1.7,whiteSpace:'pre-wrap',marginBottom:atts.length>0?16:0}}>{row.data.content}</div>
                {row.data.note&&<div style={{fontSize:13,color:'#64748b',marginBottom:atts.length>0?12:0}}><strong>비고:</strong> {row.data.note}</div>}
                {atts.length>0&&(
                  <div style={{display:'flex',flexDirection:'column',gap:8}}>
                    <div style={{fontSize:13,fontWeight:600,color:'#64748b'}}>첨부 ({atts.length})</div>
                    {atts.map((att,i)=><AttItem key={i} a={att}/>)}
                  </div>
                )}
              </div>
            )}
          </div>
          );
        })}
      </div>
      <div style={{marginTop:6,fontSize:11,color:'#94a3b8'}}>총 {filtered.length}건{anyFilterActive?` (필터 적용 · 전체 ${rows.length}건)`:''}</div>

      {showForm&&<MaterialForm editData={editingId?rows.find(r=>r.material_id===editingId):undefined} onClose={()=>{setShowForm(false);setEditingId(null);}} onSaved={()=>{setShowForm(false);setEditingId(null);fetchData();}} custom={custom} updateCustom={updateCustom}/>}
    </>)}
    </div>
    {/* ── 오른쪽: 미리보기 패널 ── */}
    {activeTab==='materials'&&previewRow&&<PreviewPanel row={previewRow} onClose={()=>setPreviewRow(null)}/>}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   Dynamic Filter Chips with +추가 / 삭제
   ══════════════════════════════════════════════════════════════ */
function DynFilter({label,items,defaults,value,onChange,customKey,custom,updateCustom,multi}:{label:string;items:string[];defaults:string[];value:string|string[];onChange:(v:any)=>void;customKey:string;custom:Record<string,string[]>;updateCustom:(k:string,v:string[])=>void;multi?:boolean}) {
  const [adding, setAdding] = useState(false);
  const [newVal, setNewVal] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const sel = multi ? (Array.isArray(value) ? value : []) : value;
  const isAll = multi ? (sel as string[]).length === 0 : sel === '전체';
  const isActive = (d: string) => multi ? (sel as string[]).includes(d) : sel === d;

  const toggle = (d: string) => {
    if (multi) {
      const arr = sel as string[];
      onChange(arr.includes(d) ? arr.filter(x=>x!==d) : [...arr, d]);
    } else {
      onChange(d);
    }
  };
  const clearAll = () => onChange(multi ? [] : '전체');

  const handleAdd = () => {
    const v = newVal.trim();
    if (!v || items.includes(v)) { setNewVal(''); setAdding(false); return; }
    updateCustom(customKey, [...(custom[customKey]||[]), v]);
    setNewVal(''); setAdding(false);
  };

  const handleRemove = (item: string) => {
    if (defaults.includes(item)) return;
    updateCustom(customKey, (custom[customKey]||[]).filter(c=>c!==item));
    if (multi) { onChange((sel as string[]).filter(x=>x!==item)); } else { if (value === item) onChange('전체'); }
  };

  useEffect(()=>{ if(adding) inputRef.current?.focus(); }, [adding]);

  return (
    <div style={{display:'flex',alignItems:'center',gap:4,flexWrap:'wrap'}}>
      <span style={{fontSize:11,color:'#64748b',fontWeight:600,minWidth:40}}>{label}</span>
      <button onClick={clearAll} style={{padding:'2px 8px',borderRadius:12,border:'1px solid',borderColor:isAll?'#3B82F6':'#e2e8f0',background:isAll?'#EFF6FF':'#fff',color:isAll?'#3B82F6':'#64748b',fontSize:11,cursor:'pointer',fontWeight:isAll?600:400}}>전체</button>
      {items.map(d=>(
        <span key={d} style={{display:'inline-flex',alignItems:'center',position:'relative'}}>
          <button onClick={()=>toggle(d)} style={{padding:'2px 8px',borderRadius:12,border:'1px solid',borderColor:isActive(d)?'#3B82F6':'#e2e8f0',background:isActive(d)?'#EFF6FF':'#fff',color:isActive(d)?'#3B82F6':'#64748b',fontSize:11,cursor:'pointer',fontWeight:isActive(d)?600:400,paddingRight:defaults.includes(d)?undefined:20}}>{d}</button>
          {!defaults.includes(d)&&<button onClick={e=>{e.stopPropagation();handleRemove(d);}} style={{position:'absolute',right:3,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',padding:0,display:'flex',lineHeight:1}}><X size={9} color="#EF4444"/></button>}
        </span>
      ))}
      {adding ? (
        <span style={{display:'inline-flex',alignItems:'center',gap:3}}>
          <input ref={inputRef} value={newVal} onChange={e=>setNewVal(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')handleAdd();if(e.key==='Escape'){setAdding(false);setNewVal('');}}} placeholder="입력 후 Enter" style={{padding:'2px 8px',borderRadius:12,border:'1px solid #3B82F6',fontSize:11,outline:'none',width:80}}/>
          <button onClick={()=>{setAdding(false);setNewVal('');}} style={{background:'none',border:'none',cursor:'pointer',padding:0}}><X size={11} color="#94a3b8"/></button>
        </span>
      ) : (
        <button onClick={()=>setAdding(true)} style={{padding:'2px 8px',borderRadius:12,border:'1px dashed #cbd5e1',background:'#fff',color:'#94a3b8',fontSize:10,cursor:'pointer',display:'flex',alignItems:'center',gap:2}}><Plus size={10}/>추가</button>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   Attachment item
   ══════════════════════════════════════════════════════════════ */
function AttItem({a}:{a:Attachment}) {
  const icons = {image:<ImageIcon size={16} color="#3B82F6"/>,link:<ExternalLink size={16} color="#10B981"/>,file:<File size={16} color="#F59E0B"/>};
  const broken = !a.url || a.url==='#' || a.url==='local_only' || a.url.startsWith('blob:');
  if (broken) {
    return (
      <div style={{display:'flex',alignItems:'center',gap:10,padding:'10px 14px',background:'#FEF2F2',borderRadius:8,border:'1px solid #FECACA',color:'#991B1B',fontSize:13}}>
        {icons[a.type]}<span style={{flex:1}}>{a.name}</span>
        <span style={{fontSize:11,color:'#EF4444'}}>파일 재업로드 필요</span>
      </div>
    );
  }
  return (
    <a href={a.url} {...(a.type==='link'?{target:'_blank',rel:'noopener noreferrer'}:{download:a.name})} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 14px',background:'#fff',borderRadius:8,border:'1px solid #e2e8f0',textDecoration:'none',color:'#334155',fontSize:13,transition:'border-color 0.15s'}} onMouseEnter={e=>e.currentTarget.style.borderColor='#3B82F6'} onMouseLeave={e=>e.currentTarget.style.borderColor='#e2e8f0'}>
      {icons[a.type]}
      <span style={{flex:1}}>{a.name}</span>
      {a.type==='file'&&a.size&&<span style={{fontSize:12,color:'#94a3b8'}}>{fmtSize(a.size)}</span>}
      {a.type!=='link'&&<Download size={14} color="#94a3b8"/>}
      {a.type==='image'&&<img src={a.url} alt={a.name} style={{width:48,height:32,objectFit:'cover',borderRadius:4}}/>}
    </a>
  );
}

/* ══════════════════════════════════════════════════════════════
   Preview Panel (right side, Notion-like)
   ══════════════════════════════════════════════════════════════ */
function PreviewPanel({row, onClose}:{row:MaterialRow;onClose:()=>void}) {
  const d = row.data;
  const atts = d.attachments||[];
  const images = atts.filter(a=>a.type==='image');
  const files = atts.filter(a=>a.type==='file');
  const links = atts.filter(a=>a.type==='link');
  const isPdf = (name: string) => name.toLowerCase().endsWith('.pdf');

  return (
    <div style={{width:440,flexShrink:0,marginLeft:20,background:'#fff',borderRadius:12,border:'1px solid #e2e8f0',height:'calc(100vh - 100px)',position:'sticky',top:24,display:'flex',flexDirection:'column',boxShadow:'0 4px 20px rgba(0,0,0,0.06)'}}>
      {/* header */}
      <div style={{padding:'16px 20px',borderBottom:'1px solid #f1f5f9',flexShrink:0}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
          <div style={{display:'flex',gap:5,flexWrap:'wrap'}}>
            {d.department.map((dep,i)=><span key={i} style={{padding:'2px 8px',borderRadius:12,fontSize:10,fontWeight:500,background:'#EFF6FF',color:'#3B82F6'}}>{dep}</span>)}
            {d.category2.map((c,i)=><span key={i} style={{padding:'2px 8px',borderRadius:12,fontSize:10,fontWeight:500,background:'#F0FDF4',color:'#22C55E'}}>{c}</span>)}
            {d.category3.map((c,i)=><span key={i} style={{padding:'2px 8px',borderRadius:12,fontSize:10,fontWeight:500,background:'#FFFBEB',color:'#F59E0B'}}>{c}</span>)}
          </div>
          <button onClick={onClose} style={{background:'none',border:'none',cursor:'pointer',padding:2,flexShrink:0}}><X size={18} color="#94a3b8"/></button>
        </div>
        <h3 style={{fontSize:17,fontWeight:700,color:'#1e293b',margin:0,lineHeight:1.3}}>{d.title}</h3>
        <div style={{fontSize:12,color:'#94a3b8',marginTop:6}}>{d.author} · {fmtDate(d.created_at)}{d.position.length?` · ${d.position.join(', ')}`:''}</div>
      </div>

      {/* scrollable body */}
      <div style={{flex:1,overflow:'auto',padding:'16px 20px'}}>
        {d.content && (
          <div style={{fontSize:14,color:'#334155',lineHeight:1.8,whiteSpace:'pre-wrap',padding:'16px',background:'#f8fafc',borderRadius:10,marginBottom:16,border:'1px solid #f1f5f9'}}>{d.content}</div>
        )}

        {d.note && (
          <div style={{fontSize:13,color:'#64748b',padding:'10px 14px',background:'#FFFBEB',borderRadius:8,marginBottom:16,border:'1px solid #FDE68A'}}>
            <strong style={{color:'#92400E'}}>비고</strong> &nbsp;{d.note}
          </div>
        )}

        {/* images inline */}
        {images.length>0&&(
          <div style={{marginBottom:16}}>
            <div style={{fontSize:13,fontWeight:600,color:'#475569',marginBottom:8}}>이미지</div>
            {images.map((img,i)=>(
              <div key={i} style={{borderRadius:8,overflow:'hidden',border:'1px solid #e2e8f0',background:'#f8fafc',marginBottom:8}}>
                <img src={img.url} alt={img.name} style={{width:'100%',maxHeight:250,objectFit:'contain',display:'block',background:'#fff'}}/>
                <div style={{padding:'6px 10px',fontSize:11,color:'#64748b',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <span>{img.name}</span>
                  <a href={img.url} download={img.name} style={{color:'#3B82F6'}}><Download size={13}/></a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* PDF embed */}
        {files.filter(f=>isPdf(f.name)).map((f,i)=>(
          <div key={i} style={{marginBottom:16}}>
            <div style={{fontSize:13,fontWeight:600,color:'#475569',marginBottom:6}}>PDF — {f.name}</div>
            {f.url==='#' ? (
              <div style={{padding:20,background:'#f8fafc',borderRadius:8,border:'1px solid #e2e8f0',textAlign:'center',color:'#94a3b8',fontSize:12}}>데모 파일 — 실제 URL이 필요합니다</div>
            ) : (
              <iframe src={f.url} style={{width:'100%',height:360,borderRadius:8,border:'1px solid #e2e8f0'}}/>
            )}
          </div>
        ))}

        {/* other files */}
        {files.filter(f=>!isPdf(f.name)).length>0&&(
          <div style={{marginBottom:16}}>
            <div style={{fontSize:13,fontWeight:600,color:'#475569',marginBottom:6}}>파일</div>
            {files.filter(f=>!isPdf(f.name)).map((f,i)=>(
              <a key={i} href={f.url} download={f.name} style={{display:'flex',alignItems:'center',gap:8,padding:'10px 12px',background:'#f8fafc',borderRadius:8,border:'1px solid #e2e8f0',textDecoration:'none',color:'#334155',fontSize:13,marginBottom:6}}>
                <File size={16} color="#F59E0B"/><span style={{flex:1}}>{f.name}</span>{f.size&&<span style={{fontSize:11,color:'#94a3b8'}}>{fmtSize(f.size)}</span>}<Download size={14} color="#3B82F6"/>
              </a>
            ))}
          </div>
        )}

        {/* links */}
        {links.length>0&&(
          <div>
            <div style={{fontSize:13,fontWeight:600,color:'#475569',marginBottom:6}}>링크</div>
            {links.map((l,i)=>(
              <a key={i} href={l.url} target="_blank" rel="noopener noreferrer" style={{display:'flex',alignItems:'center',gap:8,padding:'10px 12px',background:'#f0fdf4',borderRadius:8,border:'1px solid #BBF7D0',textDecoration:'none',color:'#15803D',fontSize:13,marginBottom:6}}>
                <ExternalLink size={14}/><span style={{flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{l.name}</span>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   Material Form (create / edit)
   ══════════════════════════════════════════════════════════════ */
function MaterialForm({editData,onClose,onSaved,custom,updateCustom}:{editData?:MaterialRow;onClose:()=>void;onSaved:()=>void;custom:Record<string,string[]>;updateCustom:(k:string,v:string[])=>void}) {
  const isEdit = !!editData;
  const [dept,setDept] = useState<string[]>(editData?.data.department||[]);
  const [cat2,setCat2] = useState<string[]>(editData?.data.category2||[]);
  const [cat3,setCat3] = useState<string[]>(editData?.data.category3||[]);
  const [pos,setPos] = useState<string[]>(editData?.data.position||[]);
  const [title,setTitle] = useState(editData?.data.title||'');
  const [content,setContent] = useState(editData?.data.content||'');
  const [author,setAuthor] = useState(editData?.data.author||'');
  const [note,setNote] = useState(editData?.data.note||'');
  const [attachments,setAttachments] = useState<Attachment[]>(editData?.data.attachments||[]);
  const [saving,setSaving] = useState(false);
  const [showLink,setShowLink] = useState(false);
  const [linkUrl,setLinkUrl] = useState('');
  const [linkName,setLinkName] = useState('');
  const [uploading, setUploading] = useState<{name:string;progress:number}[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const addLink = () => { if(!linkUrl)return; setAttachments([...attachments,{type:'link',url:linkUrl,name:linkName||linkUrl}]); setLinkUrl('');setLinkName('');setShowLink(false); };

  const uploadOne = (f: globalThis.File): Promise<{success:boolean;s3_url?:string}> => {
    return new Promise((resolve) => {
      const fd = new FormData(); fd.append('file',f); fd.append('category','work-materials');
      const xhr = new XMLHttpRequest();
      xhr.upload.onprogress = (ev) => {
        if (ev.lengthComputable) {
          const pct = Math.round((ev.loaded / ev.total) * 100);
          setUploading(prev => prev.map(u => u.name === f.name ? { ...u, progress: pct } : u));
        }
      };
      xhr.onload = () => {
        try { resolve(JSON.parse(xhr.responseText)); } catch { resolve({ success: false }); }
      };
      xhr.onerror = () => resolve({ success: false });
      xhr.open('POST', '/api/upload');
      xhr.send(fd);
    });
  };

  const handleFile = async (e:React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files; if(!files) return;
    const fileList = Array.from(files);
    setUploading(prev=>[...prev, ...fileList.map(f=>({name:f.name,progress:0}))]);
    for (const f of fileList) {
      const isImg = f.type.startsWith('image/');
      const j = await uploadOne(f);
      if(j.success && j.s3_url) { setAttachments(p=>[...p,{type:isImg?'image':'file' as const,url:j.s3_url!,name:f.name,size:f.size}]); toast.success(`${f.name} 업로드 완료`); }
      else { toast.error(`${f.name} 업로드 실패`); }
      setUploading(prev=>prev.filter(u=>u.name!==f.name));
    }
    e.target.value='';
  };

  const save = async () => {
    if(!dept.length||!title||!author){toast.error('대분류, 제목, 작성자를 입력해주세요');return;}
    setSaving(true);
    const payload:MaterialData = {department:dept,category2:cat2,category3:cat3,position:pos,title,content,attachments,author,note,created_at:editData?.data.created_at||new Date().toISOString()};
    try {
      if(isEdit&&editData) { await fetch(`/api/work-materials/${editData.material_id}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)}); toast.success('수정되었습니다'); }
      else { await fetch('/api/work-materials',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)}); toast.success('등록되었습니다'); }
      onSaved();
    } catch { toast.error('저장 실패'); } finally { setSaving(false); }
  };

  const depts = [...DEF_DEPTS,...(custom['dept']||[])];
  const cat2s = [...DEF_CAT2,...(custom['cat2']||[])];
  const cat3s = [...DEF_CAT3,...(custom['cat3']||[])];
  const poss = [...DEF_POS,...(custom['pos']||[])];

  const chipRow = (label:string, items:string[], val:string[], set:(v:string[])=>void, customKey:string) => (
    <div>
      <label style={{fontSize:13,fontWeight:600,color:'#475569',marginBottom:6,display:'block'}}>{label} {val.length>0&&<span style={{fontSize:11,color:'#3B82F6',fontWeight:400}}>({val.length}개 선택)</span>}</label>
      <FormChips items={items} defaults={customKey==='dept'?DEF_DEPTS:customKey==='cat2'?DEF_CAT2:customKey==='cat3'?DEF_CAT3:DEF_POS} value={val} onChange={set} customKey={customKey} custom={custom} updateCustom={updateCustom}/>
    </div>
  );

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.4)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{background:'#fff',borderRadius:16,width:640,maxHeight:'90vh',overflow:'auto',boxShadow:'0 20px 60px rgba(0,0,0,0.15)'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'20px 24px',borderBottom:'1px solid #f1f5f9'}}>
          <h2 style={{fontSize:18,fontWeight:700,margin:0,color:'#1e293b'}}>{isEdit?'자료 수정':'새 자료 등록'}</h2>
          <button onClick={onClose} style={{background:'none',border:'none',cursor:'pointer'}}><X size={20} color="#94a3b8"/></button>
        </div>
        <div style={{padding:'20px 24px',display:'flex',flexDirection:'column',gap:14}}>
          {chipRow('대분류 *', depts, dept, setDept, 'dept')}
          {chipRow('중분류', cat2s, cat2, setCat2, 'cat2')}
          {chipRow('소분류', cat3s, cat3, setCat3, 'cat3')}
          {chipRow('직급', poss, pos, setPos, 'pos')}
          <div><label style={{fontSize:13,fontWeight:600,color:'#475569',marginBottom:6,display:'block'}}>작성자 *</label><input value={author} onChange={e=>setAuthor(e.target.value)} placeholder="이름" style={{width:'100%',padding:'8px 12px',border:'1px solid #e2e8f0',borderRadius:8,fontSize:14,outline:'none'}}/></div>
          <div><label style={{fontSize:13,fontWeight:600,color:'#475569',marginBottom:6,display:'block'}}>제목 *</label><input value={title} onChange={e=>setTitle(e.target.value)} placeholder="자료 제목" style={{width:'100%',padding:'8px 12px',border:'1px solid #e2e8f0',borderRadius:8,fontSize:14,outline:'none'}}/></div>
          <div><label style={{fontSize:13,fontWeight:600,color:'#475569',marginBottom:6,display:'block'}}>내용</label><textarea value={content} onChange={e=>setContent(e.target.value)} placeholder="텍스트 내용을 입력하세요..." rows={5} style={{width:'100%',padding:'10px 12px',border:'1px solid #e2e8f0',borderRadius:8,fontSize:14,outline:'none',resize:'vertical',lineHeight:1.6,fontFamily:'inherit'}}/></div>
          <div><label style={{fontSize:13,fontWeight:600,color:'#475569',marginBottom:6,display:'block'}}>비고</label><input value={note} onChange={e=>setNote(e.target.value)} placeholder="비고 사항" style={{width:'100%',padding:'8px 12px',border:'1px solid #e2e8f0',borderRadius:8,fontSize:14,outline:'none'}}/></div>
          <div>
            <label style={{fontSize:13,fontWeight:600,color:'#475569',marginBottom:8,display:'block'}}>첨부</label>
            {attachments.length>0&&<div style={{display:'flex',flexDirection:'column',gap:6,marginBottom:10}}>{attachments.map((att,i)=>(<div key={i} style={{display:'flex',alignItems:'center',gap:8,padding:'8px 12px',background:'#f8fafc',borderRadius:8,fontSize:13}}>{att.type==='image'&&<ImageIcon size={14} color="#3B82F6"/>}{att.type==='link'&&<ExternalLink size={14} color="#10B981"/>}{att.type==='file'&&<File size={14} color="#F59E0B"/>}<span style={{flex:1,color:'#334155'}}>{att.name}</span>{att.size&&<span style={{fontSize:11,color:'#94a3b8'}}>{fmtSize(att.size)}</span>}<button onClick={()=>setAttachments(attachments.filter((_,j)=>j!==i))} style={{background:'none',border:'none',cursor:'pointer'}}><X size={14} color="#ef4444"/></button></div>))}</div>}
            {uploading.length>0&&<div style={{display:'flex',flexDirection:'column',gap:6,marginBottom:10}}>{uploading.map((u,i)=>(<div key={i} style={{padding:'8px 12px',background:'#EFF6FF',borderRadius:8,fontSize:13,border:'1px solid #BFDBFE'}}>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}>
                <div style={{width:14,height:14,border:'2px solid #3B82F6',borderTopColor:'transparent',borderRadius:'50%',animation:'spin 0.8s linear infinite',flexShrink:0}}/>
                <span style={{flex:1,color:'#3B82F6'}}>{u.name}</span>
                <span style={{fontSize:12,fontWeight:600,color:'#2563EB'}}>{u.progress}%</span>
              </div>
              <div style={{height:4,background:'#BFDBFE',borderRadius:2,overflow:'hidden'}}>
                <div style={{height:'100%',width:`${u.progress}%`,background:'#3B82F6',borderRadius:2,transition:'width 0.2s ease'}}/>
              </div>
            </div>))}<style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>}
            <div style={{display:'flex',gap:8}}>
              <input ref={fileRef} type="file" multiple hidden onChange={handleFile}/>
              <button onClick={()=>fileRef.current?.click()} disabled={uploading.length>0} style={{display:'flex',alignItems:'center',gap:4,padding:'6px 12px',background:uploading.length>0?'#E0E7FF':'#f1f5f9',border:'1px solid #e2e8f0',borderRadius:8,fontSize:13,cursor:uploading.length>0?'not-allowed':'pointer',color:'#475569',opacity:uploading.length>0?0.6:1}}><Upload size={14}/>{uploading.length>0?`업로드 중 (${uploading.length}건)`:'파일/이미지'}</button>
              <button onClick={()=>setShowLink(!showLink)} style={{display:'flex',alignItems:'center',gap:4,padding:'6px 12px',background:'#f1f5f9',border:'1px solid #e2e8f0',borderRadius:8,fontSize:13,cursor:'pointer',color:'#475569'}}><LinkIcon size={14}/>링크 추가</button>
            </div>
            {showLink&&<div style={{display:'flex',gap:8,marginTop:8}}><input value={linkUrl} onChange={e=>setLinkUrl(e.target.value)} placeholder="URL (https://...)" style={{flex:1,padding:'6px 10px',border:'1px solid #e2e8f0',borderRadius:8,fontSize:13}}/><input value={linkName} onChange={e=>setLinkName(e.target.value)} placeholder="표시 이름" style={{width:140,padding:'6px 10px',border:'1px solid #e2e8f0',borderRadius:8,fontSize:13}}/><button onClick={addLink} style={{padding:'6px 12px',background:'#10B981',color:'#fff',border:'none',borderRadius:8,fontSize:13,cursor:'pointer'}}>추가</button></div>}
          </div>
        </div>
        <div style={{display:'flex',justifyContent:'flex-end',gap:8,padding:'16px 24px',borderTop:'1px solid #f1f5f9'}}>
          <button onClick={onClose} style={{padding:'8px 20px',background:'#f1f5f9',border:'none',borderRadius:8,fontSize:14,cursor:'pointer',color:'#64748b'}}>취소</button>
          <button onClick={save} disabled={saving} style={{padding:'8px 20px',background:'#3B82F6',color:'#fff',border:'none',borderRadius:8,fontSize:14,fontWeight:600,cursor:saving?'not-allowed':'pointer',opacity:saving?0.6:1}}>{saving?'저장 중...':isEdit?'수정':'등록'}</button>
        </div>
      </div>
    </div>
  );
}

/* ── Form Chips (멀티선택 + 추가) ── */
function FormChips({items,defaults,value,onChange,customKey,custom,updateCustom}:{items:string[];defaults:string[];value:string[];onChange:(v:string[])=>void;customKey:string;custom:Record<string,string[]>;updateCustom:(k:string,v:string[])=>void}) {
  const [adding, setAdding] = useState(false);
  const [newVal, setNewVal] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const toggle = (d:string) => onChange(value.includes(d) ? value.filter(x=>x!==d) : [...value, d]);
  const handleAdd = () => { const v=newVal.trim(); if(!v||items.includes(v)){setNewVal('');setAdding(false);return;} updateCustom(customKey,[...(custom[customKey]||[]),v]); onChange([...value,v]); setNewVal('');setAdding(false); };
  useEffect(()=>{ if(adding) inputRef.current?.focus(); },[adding]);
  return (
    <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
      {items.map(d=>(
        <button key={d} type="button" onClick={()=>toggle(d)} style={{padding:'6px 14px',borderRadius:16,border:'1px solid',borderColor:value.includes(d)?'#3B82F6':'#e2e8f0',background:value.includes(d)?'#EFF6FF':'#fff',color:value.includes(d)?'#3B82F6':'#64748b',fontSize:13,cursor:'pointer',fontWeight:value.includes(d)?600:400}}>{d}</button>
      ))}
      {adding?(
        <span style={{display:'inline-flex',alignItems:'center',gap:4}}>
          <input ref={inputRef} value={newVal} onChange={e=>setNewVal(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();handleAdd();}if(e.key==='Escape'){setAdding(false);setNewVal('');}}} placeholder="입력" style={{padding:'5px 10px',borderRadius:16,border:'1px solid #3B82F6',fontSize:13,outline:'none',width:80}}/>
          <button type="button" onClick={()=>{setAdding(false);setNewVal('');}} style={{background:'none',border:'none',cursor:'pointer',padding:0}}><X size={14} color="#94a3b8"/></button>
        </span>
      ):(
        <button type="button" onClick={()=>setAdding(true)} style={{padding:'5px 10px',borderRadius:16,border:'1px dashed #cbd5e1',background:'#fff',color:'#94a3b8',fontSize:12,cursor:'pointer',display:'flex',alignItems:'center',gap:2}}><Plus size={12}/>추가</button>
      )}
    </div>
  );
}
