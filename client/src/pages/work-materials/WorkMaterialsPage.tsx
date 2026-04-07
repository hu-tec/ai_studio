import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import {
  Plus, Trash2, Pencil, X, Upload, Link as LinkIcon,
  FileText, Image as ImageIcon, ChevronDown, ChevronUp,
  Search, File, ExternalLink, Download
} from 'lucide-react';

interface Attachment {
  type: 'image' | 'link' | 'file';
  url: string;
  name: string;
  size?: number;
}

interface MaterialData {
  department: string;
  position: string;
  title: string;
  content: string;
  attachments: Attachment[];
  author: string;
  created_at: string;
}

interface MaterialRow {
  id: number;
  material_id: string;
  data: MaterialData;
  updated_at: string;
}

const DEPARTMENTS = ['전체', '경영', '개발', '마케팅', '인사', '영업', '강사팀', '기획', '홈페이지', '상담', '총무', '관리'];
const POSITIONS = ['전체', '대표', '임원', '팀장', '강사', '신입', '알바', '외부'];

const DUMMY: MaterialData[] = [
  { department: '개발', position: '개발', title: 'Work Studio API 가이드', content: 'Work Studio의 범용 CRUD API 사용법입니다.\n\nGET /api/:table — 전체 조회\nPOST /api/:table — 생성\nPUT /api/:table/:id — 수정\nDELETE /api/:table/:id — 삭제', attachments: [{ type: 'link', url: 'http://54.116.15.136', name: 'Work Studio 관리자' }], author: '박개발', created_at: '2026-04-05T09:00:00' },
  { department: '마케팅', position: '신입', title: 'TESOL 홍보 브로슈어 초안', content: '2026년 상반기 TESOL 과정 홍보용 브로슈어 초안입니다.', attachments: [{ type: 'file', url: '#', name: 'TESOL_브로슈어_v1.pdf', size: 2400000 }, { type: 'image', url: 'https://placehold.co/600x400/3B82F6/white?text=TESOL', name: '브로슈어_표지.png' }], author: '최신입', created_at: '2026-04-04T14:00:00' },
  { department: '강사팀', position: '강사', title: 'AI번역 교육 3급 교안 자료', content: 'AI번역 교육 3급 강의에 사용할 교안 자료 모음입니다.\n\n1장: 기계번역 개론\n2장: MTPE 기초\n3장: 용어집 관리', attachments: [{ type: 'file', url: '#', name: 'AI번역_3급_교안.pptx', size: 5200000 }, { type: 'link', url: 'https://deepl.com', name: 'DeepL 공식 사이트' }], author: '이강사', created_at: '2026-04-03T10:30:00' },
  { department: '경영', position: '대표', title: '2026년 2분기 사업 방향', content: '2분기 핵심 추진 방향:\n\n1. AI프롬프트 자격시험 런칭\n2. 번역 홈페이지 109개 언어 확장\n3. 전문가 매칭 플랫폼 베타\n4. CBT 시험 시스템 고도화', attachments: [], author: '대표님', created_at: '2026-04-01T09:00:00' },
  { department: '개발', position: '팀장', title: 'EC2 서버 접속 정보', content: 'EC2 서버 접속 정보 공유합니다.\n\nIP: 54.116.15.136\n포트 80: Work Studio\n포트 81: AI Studio\n포트 82: CBT', attachments: [{ type: 'link', url: 'http://54.116.15.136:81/app/', name: 'AI Studio' }, { type: 'link', url: 'http://54.116.15.136', name: 'Work Studio' }], author: '김팀장', created_at: '2026-04-02T11:00:00' },
];

function fmtDate(iso: string) { const d = new Date(iso); return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`; }
function fmtSize(b: number) { if(b<1024) return `${b}B`; if(b<1048576) return `${(b/1024).toFixed(0)}KB`; return `${(b/1048576).toFixed(1)}MB`; }

export default function WorkMaterialsPage() {
  const [rows, setRows] = useState<MaterialRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [filterDept, setFilterDept] = useState('전체');
  const [filterPos, setFilterPos] = useState('전체');
  const [searchText, setSearchText] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string|null>(null);
  const [editingContentId, setEditingContentId] = useState<string|null>(null);
  const [editingContentValue, setEditingContentValue] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/work-materials');
      const raw = await res.json();
      const data = Array.isArray(raw) ? raw.map((r: any) => {
        const d = typeof r.data === 'string' ? JSON.parse(r.data) : r.data;
        return { ...r, data: { ...d, attachments: d.attachments || [], content: d.content || '', author: d.author || '', created_at: d.created_at || r.updated_at || '' } };
      }) : [];
      if (data.length > 0) { setRows(data); }
      else {
        for (const d of DUMMY) {
          const id = `mat-${Date.now()}-${Math.random().toString(36).slice(2,7)}`;
          try { await fetch('/api/work-materials', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ material_id: id, data: d }) }); } catch {}
        }
        const r2 = await fetch('/api/work-materials');
        const d2 = await r2.json();
        setRows(Array.isArray(d2) && d2.length > 0 ? d2 : DUMMY.map((d,i)=>({ id:i+1, material_id:`local-${i}`, data:d, updated_at:d.created_at })));
      }
    } catch { setRows(DUMMY.map((d,i)=>({ id:i+1, material_id:`local-${i}`, data:d, updated_at:d.created_at }))); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = rows.filter(r => {
    const d = r.data;
    if (filterDept !== '전체' && d.department !== filterDept) return false;
    if (filterPos !== '전체' && d.position !== filterPos) return false;
    if (searchText) { const s = searchText.toLowerCase(); if (!d.title.toLowerCase().includes(s) && !d.content.toLowerCase().includes(s) && !d.author.toLowerCase().includes(s)) return false; }
    return true;
  });

  const handleDelete = async (mid: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try { await fetch(`/api/work-materials/${mid}`, { method:'DELETE' }); setRows(p=>p.filter(r=>r.material_id!==mid)); setExpandedIds(prev=>{const next=new Set(prev);next.delete(mid);return next;}); toast.success('삭제되었습니다'); } catch { toast.error('삭제 실패'); }
  };

  const handleInlineContentSave = async (row: MaterialRow) => {
    if (editingContentValue === row.data.content) { setEditingContentId(null); return; }
    const payload = { ...row.data, content: editingContentValue };
    try {
      await fetch(`/api/work-materials/${row.material_id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      setRows(prev => prev.map(r => r.material_id === row.material_id ? { ...r, data: { ...r.data, content: editingContentValue } } : r));
      toast.success('내용이 수정되었습니다');
    } catch { toast.error('수정 실패'); }
    setEditingContentId(null);
  };

  if (loading) return <div style={{padding:40,textAlign:'center',color:'#94a3b8'}}>로딩 중...</div>;

  return (
    <div style={{padding:'24px 32px',maxWidth:1200,margin:'0 auto'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
        <h1 style={{fontSize:22,fontWeight:700,color:'#1e293b',margin:0}}>업무 자료</h1>
        <div style={{display:'flex',gap:8}}>
          <button onClick={()=>{
            const allIds = filtered.map(r=>r.material_id);
            const allExpanded = allIds.every(id=>expandedIds.has(id));
            if(allExpanded) setExpandedIds(new Set());
            else setExpandedIds(new Set(allIds));
          }} style={{display:'flex',alignItems:'center',gap:4,padding:'8px 14px',background:'#f1f5f9',border:'1px solid #e2e8f0',borderRadius:8,fontSize:13,cursor:'pointer',color:'#475569'}}>
            {filtered.length>0 && filtered.every(r=>expandedIds.has(r.material_id)) ? '전체 접기' : '전체 펼치기'}
          </button>
          <button onClick={()=>{setEditingId(null);setShowForm(true);}} style={{display:'flex',alignItems:'center',gap:6,padding:'8px 16px',background:'#3B82F6',color:'#fff',border:'none',borderRadius:8,fontSize:14,fontWeight:600,cursor:'pointer'}}><Plus size={16}/>새 자료</button>
        </div>
      </div>

      {/* 필터 */}
      <div style={{display:'flex',flexDirection:'column',gap:12,marginBottom:20}}>
        <div style={{position:'relative',maxWidth:360}}>
          <Search size={16} style={{position:'absolute',left:10,top:10,color:'#94a3b8'}}/>
          <input value={searchText} onChange={e=>setSearchText(e.target.value)} placeholder="제목, 내용, 작성자 검색..." style={{width:'100%',padding:'8px 12px 8px 32px',border:'1px solid #e2e8f0',borderRadius:8,fontSize:14,outline:'none',background:'#fff'}}/>
        </div>
        <FilterChips label="부서" items={DEPARTMENTS} value={filterDept} onChange={setFilterDept}/>
        <FilterChips label="직급" items={POSITIONS} value={filterPos} onChange={setFilterPos}/>
      </div>

      {/* 테이블 */}
      <div style={{background:'#fff',borderRadius:12,border:'1px solid #e2e8f0',overflow:'hidden'}}>
        <div style={{display:'grid',gridTemplateColumns:'80px 64px 160px 1fr 180px 72px 72px 48px',padding:'12px 16px',background:'#f8fafc',borderBottom:'1px solid #e2e8f0',fontSize:13,fontWeight:600,color:'#64748b',gap:8}}>
          <div>부서</div><div>직급</div><div>제목</div><div>내용</div><div>첨부/다운</div><div>작성자</div><div>날짜</div><div></div>
        </div>
        {filtered.length===0 ? (
          <div style={{padding:40,textAlign:'center',color:'#94a3b8',fontSize:14}}>등록된 자료가 없습니다</div>
        ) : filtered.map(row=>{
          const atts = row.data.attachments||[];
          const isOpen = expandedIds.has(row.material_id);
          return (
          <div key={row.material_id}>
            <div onClick={()=>setExpandedIds(prev=>{const next=new Set(prev);if(next.has(row.material_id))next.delete(row.material_id);else next.add(row.material_id);return next;})} style={{display:'grid',gridTemplateColumns:'80px 64px 160px 1fr 180px 72px 72px 48px',padding:'12px 16px',borderBottom:'1px solid #f1f5f9',cursor:'pointer',alignItems:'center',background:isOpen?'#F8FAFC':'#fff',transition:'background 0.15s',gap:8}} onMouseEnter={e=>{if(!isOpen)e.currentTarget.style.background='#fafbfd'}} onMouseLeave={e=>{if(!isOpen)e.currentTarget.style.background='#fff'}}>
              <div><span style={{padding:'2px 8px',borderRadius:12,fontSize:11,fontWeight:500,background:'#EFF6FF',color:'#3B82F6'}}>{row.data.department}</span></div>
              <div style={{fontSize:12,color:'#64748b'}}>{row.data.position}</div>
              <div style={{fontSize:13,fontWeight:500,color:'#1e293b',display:'flex',alignItems:'center',gap:4}}>
                {row.data.title}
                {isOpen?<ChevronUp size={13} color="#94a3b8"/>:<ChevronDown size={13} color="#94a3b8"/>}
              </div>
              <div onClick={e=>{e.stopPropagation();setEditingContentId(row.material_id);setEditingContentValue(row.data.content);}} style={{fontSize:12,color:editingContentId===row.material_id?'#1e293b':'#94a3b8',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',cursor:'text',minHeight:20,borderRadius:4,padding:'2px 4px',background:editingContentId===row.material_id?'#fff':'transparent',border:editingContentId===row.material_id?'1px solid #3B82F6':'1px solid transparent',transition:'all 0.15s'}}>
                {editingContentId===row.material_id?(
                  <textarea value={editingContentValue} onChange={e=>setEditingContentValue(e.target.value)} onBlur={()=>handleInlineContentSave(row)} onKeyDown={e=>{if(e.key==='Escape'){setEditingContentId(null);}if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();handleInlineContentSave(row);}}} autoFocus rows={3} style={{width:'100%',fontSize:12,border:'none',outline:'none',resize:'vertical',lineHeight:1.5,fontFamily:'inherit',padding:0,background:'transparent'}}/>
                ):(
                  <span title="클릭하여 수정" style={{display:'block',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{row.data.content.split('\n')[0]||<span style={{color:'#cbd5e1',fontStyle:'italic'}}>내용 없음</span>}</span>
                )}
              </div>
              <div style={{fontSize:11,color:'#94a3b8',display:'flex',gap:4,flexWrap:'wrap',overflow:'hidden',maxHeight:20,alignItems:'center'}} onClick={e=>e.stopPropagation()}>
                {atts.length===0?<span>—</span>:atts.map((a,i)=>(
                  <span key={i} style={{display:'inline-flex',alignItems:'center',gap:2}}>
                    {a.type==='link'&&<a href={a.url} target="_blank" rel="noopener noreferrer" title={a.name} style={{display:'inline-flex',alignItems:'center',gap:2,color:'#10B981',textDecoration:'none'}} onMouseEnter={e=>e.currentTarget.style.textDecoration='underline'} onMouseLeave={e=>e.currentTarget.style.textDecoration='none'}><ExternalLink size={10}/><span style={{maxWidth:60,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{a.name}</span></a>}
                    {a.type==='file'&&<a href={a.url} download={a.name} title={`${a.name} 다운로드`} style={{display:'inline-flex',alignItems:'center',gap:2,color:'#F59E0B',textDecoration:'none',cursor:'pointer'}} onMouseEnter={e=>e.currentTarget.style.textDecoration='underline'} onMouseLeave={e=>e.currentTarget.style.textDecoration='none'}><Download size={10}/><span style={{maxWidth:60,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{a.name}</span></a>}
                    {a.type==='image'&&<a href={a.url} download={a.name} title={`${a.name} 다운로드`} style={{display:'inline-flex',alignItems:'center',gap:2,color:'#3B82F6',textDecoration:'none',cursor:'pointer'}} onMouseEnter={e=>e.currentTarget.style.textDecoration='underline'} onMouseLeave={e=>e.currentTarget.style.textDecoration='none'}><Download size={10}/><span style={{maxWidth:60,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{a.name}</span></a>}
                  </span>
                ))}
              </div>
              <div style={{fontSize:12,color:'#64748b'}}>{row.data.author}</div>
              <div style={{fontSize:11,color:'#94a3b8'}}>{fmtDate(row.data.created_at)}</div>
              <div style={{display:'flex',gap:2}} onClick={e=>e.stopPropagation()}>
                <button onClick={()=>{setEditingId(row.material_id);setShowForm(true);}} style={{background:'none',border:'none',cursor:'pointer',padding:3}}><Pencil size={13} color="#94a3b8"/></button>
                <button onClick={()=>handleDelete(row.material_id)} style={{background:'none',border:'none',cursor:'pointer',padding:3}}><Trash2 size={13} color="#ef4444"/></button>
              </div>
            </div>
            {isOpen&&(
              <div style={{padding:'16px 24px 20px',background:'#fafbfd',borderBottom:'1px solid #e2e8f0'}}>
                <div style={{fontSize:14,color:'#334155',lineHeight:1.7,whiteSpace:'pre-wrap',marginBottom:atts.length>0?16:0}}>{row.data.content}</div>
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
      <div style={{marginTop:12,fontSize:13,color:'#94a3b8'}}>총 {filtered.length}건{(filterDept!=='전체'||filterPos!=='전체'||searchText)?` (필터 적용 · 전체 ${rows.length}건)`:''}</div>

      {showForm&&<MaterialForm editData={editingId?rows.find(r=>r.material_id===editingId):undefined} onClose={()=>{setShowForm(false);setEditingId(null);}} onSaved={()=>{setShowForm(false);setEditingId(null);fetchData();}}/>}
    </div>
  );
}

function FilterChips({label,items,value,onChange}:{label:string;items:string[];value:string;onChange:(v:string)=>void}) {
  return (
    <div style={{display:'flex',alignItems:'center',gap:6,flexWrap:'wrap'}}>
      <span style={{fontSize:13,color:'#64748b',fontWeight:600,minWidth:36}}>{label}</span>
      {items.map(d=>(
        <button key={d} onClick={()=>onChange(d)} style={{padding:'4px 12px',borderRadius:16,border:'1px solid',borderColor:value===d?'#3B82F6':'#e2e8f0',background:value===d?'#EFF6FF':'#fff',color:value===d?'#3B82F6':'#64748b',fontSize:13,cursor:'pointer',fontWeight:value===d?600:400}}>{d}</button>
      ))}
    </div>
  );
}

function AttItem({a}:{a:Attachment}) {
  const icons = {image:<ImageIcon size={16} color="#3B82F6"/>,link:<ExternalLink size={16} color="#10B981"/>,file:<File size={16} color="#F59E0B"/>};
  return (
    <a href={a.url} target="_blank" rel="noopener noreferrer" style={{display:'flex',alignItems:'center',gap:10,padding:'10px 14px',background:'#fff',borderRadius:8,border:'1px solid #e2e8f0',textDecoration:'none',color:'#334155',fontSize:13,transition:'border-color 0.15s'}} onMouseEnter={e=>e.currentTarget.style.borderColor='#3B82F6'} onMouseLeave={e=>e.currentTarget.style.borderColor='#e2e8f0'}>
      {icons[a.type]}<span style={{flex:1}}>{a.name}</span>
      {a.type==='file'&&a.size&&<span style={{fontSize:12,color:'#94a3b8'}}>{fmtSize(a.size)}</span>}
      {a.type==='image'&&<img src={a.url} alt={a.name} style={{width:48,height:32,objectFit:'cover',borderRadius:4}}/>}
    </a>
  );
}

function MaterialForm({editData,onClose,onSaved}:{editData?:MaterialRow;onClose:()=>void;onSaved:()=>void}) {
  const isEdit = !!editData;
  const [dept,setDept] = useState(editData?.data.department||'');
  const [pos,setPos] = useState(editData?.data.position||'');
  const [title,setTitle] = useState(editData?.data.title||'');
  const [content,setContent] = useState(editData?.data.content||'');
  const [author,setAuthor] = useState(editData?.data.author||'');
  const [attachments,setAttachments] = useState<Attachment[]>(editData?.data.attachments||[]);
  const [saving,setSaving] = useState(false);
  const [showLink,setShowLink] = useState(false);
  const [linkUrl,setLinkUrl] = useState('');
  const [linkName,setLinkName] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const addLink = () => { if(!linkUrl)return; setAttachments([...attachments,{type:'link',url:linkUrl,name:linkName||linkUrl}]); setLinkUrl('');setLinkName('');setShowLink(false); };

  const handleFile = async (e:React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files; if(!files) return;
    for (const f of Array.from(files)) {
      const isImg = f.type.startsWith('image/');
      const fd = new FormData(); fd.append('file',f); fd.append('category','work-materials');
      try {
        const r = await fetch('/api/upload',{method:'POST',body:fd});
        const j = await r.json();
        if(j.success) { setAttachments(p=>[...p,{type:isImg?'image':'file',url:j.s3_url,name:f.name,size:f.size}]); toast.success(`${f.name} 업로드 완료`); }
      } catch {
        const u = URL.createObjectURL(f);
        setAttachments(p=>[...p,{type:isImg?'image':'file',url:u,name:f.name,size:f.size}]);
      }
    }
    e.target.value='';
  };

  const save = async () => {
    if(!dept||!pos||!title||!author){toast.error('부서, 직급, 제목, 작성자를 입력해주세요');return;}
    setSaving(true);
    const payload:MaterialData = {department:dept,position:pos,title,content,attachments,author,created_at:editData?.data.created_at||new Date().toISOString()};
    try {
      if(isEdit&&editData) { await fetch(`/api/work-materials/${editData.material_id}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)}); toast.success('수정되었습니다'); }
      else { await fetch('/api/work-materials',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)}); toast.success('등록되었습니다'); }
      onSaved();
    } catch { toast.error('저장 실패'); } finally { setSaving(false); }
  };

  const depts = DEPARTMENTS.filter(d=>d!=='전체');
  const poss = POSITIONS.filter(p=>p!=='전체');

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.4)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{background:'#fff',borderRadius:16,width:600,maxHeight:'90vh',overflow:'auto',boxShadow:'0 20px 60px rgba(0,0,0,0.15)'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'20px 24px',borderBottom:'1px solid #f1f5f9'}}>
          <h2 style={{fontSize:18,fontWeight:700,margin:0,color:'#1e293b'}}>{isEdit?'자료 수정':'새 자료 등록'}</h2>
          <button onClick={onClose} style={{background:'none',border:'none',cursor:'pointer'}}><X size={20} color="#94a3b8"/></button>
        </div>
        <div style={{padding:'20px 24px',display:'flex',flexDirection:'column',gap:16}}>
          <div><label style={{fontSize:13,fontWeight:600,color:'#475569',marginBottom:6,display:'block'}}>부서 *</label><div style={{display:'flex',gap:6,flexWrap:'wrap'}}>{depts.map(d=><button key={d} onClick={()=>setDept(d)} style={{padding:'6px 14px',borderRadius:16,border:'1px solid',borderColor:dept===d?'#3B82F6':'#e2e8f0',background:dept===d?'#EFF6FF':'#fff',color:dept===d?'#3B82F6':'#64748b',fontSize:13,cursor:'pointer',fontWeight:dept===d?600:400}}>{d}</button>)}</div></div>
          <div><label style={{fontSize:13,fontWeight:600,color:'#475569',marginBottom:6,display:'block'}}>직급 *</label><div style={{display:'flex',gap:6,flexWrap:'wrap'}}>{poss.map(p=><button key={p} onClick={()=>setPos(p)} style={{padding:'6px 14px',borderRadius:16,border:'1px solid',borderColor:pos===p?'#3B82F6':'#e2e8f0',background:pos===p?'#EFF6FF':'#fff',color:pos===p?'#3B82F6':'#64748b',fontSize:13,cursor:'pointer',fontWeight:pos===p?600:400}}>{p}</button>)}</div></div>
          <div><label style={{fontSize:13,fontWeight:600,color:'#475569',marginBottom:6,display:'block'}}>작성자 *</label><input value={author} onChange={e=>setAuthor(e.target.value)} placeholder="이름" style={{width:'100%',padding:'8px 12px',border:'1px solid #e2e8f0',borderRadius:8,fontSize:14,outline:'none'}}/></div>
          <div><label style={{fontSize:13,fontWeight:600,color:'#475569',marginBottom:6,display:'block'}}>제목 *</label><input value={title} onChange={e=>setTitle(e.target.value)} placeholder="자료 제목" style={{width:'100%',padding:'8px 12px',border:'1px solid #e2e8f0',borderRadius:8,fontSize:14,outline:'none'}}/></div>
          <div><label style={{fontSize:13,fontWeight:600,color:'#475569',marginBottom:6,display:'block'}}>내용</label><textarea value={content} onChange={e=>setContent(e.target.value)} placeholder="텍스트 내용을 입력하세요..." rows={6} style={{width:'100%',padding:'10px 12px',border:'1px solid #e2e8f0',borderRadius:8,fontSize:14,outline:'none',resize:'vertical',lineHeight:1.6,fontFamily:'inherit'}}/></div>
          <div>
            <label style={{fontSize:13,fontWeight:600,color:'#475569',marginBottom:8,display:'block'}}>첨부</label>
            {attachments.length>0&&<div style={{display:'flex',flexDirection:'column',gap:6,marginBottom:10}}>{attachments.map((att,i)=>(<div key={i} style={{display:'flex',alignItems:'center',gap:8,padding:'8px 12px',background:'#f8fafc',borderRadius:8,fontSize:13}}>{att.type==='image'&&<ImageIcon size={14} color="#3B82F6"/>}{att.type==='link'&&<ExternalLink size={14} color="#10B981"/>}{att.type==='file'&&<File size={14} color="#F59E0B"/>}<span style={{flex:1,color:'#334155'}}>{att.name}</span>{att.size&&<span style={{fontSize:11,color:'#94a3b8'}}>{fmtSize(att.size)}</span>}<button onClick={()=>setAttachments(attachments.filter((_,j)=>j!==i))} style={{background:'none',border:'none',cursor:'pointer'}}><X size={14} color="#ef4444"/></button></div>))}</div>}
            <div style={{display:'flex',gap:8}}>
              <input ref={fileRef} type="file" multiple hidden onChange={handleFile}/>
              <button onClick={()=>fileRef.current?.click()} style={{display:'flex',alignItems:'center',gap:4,padding:'6px 12px',background:'#f1f5f9',border:'1px solid #e2e8f0',borderRadius:8,fontSize:13,cursor:'pointer',color:'#475569'}}><Upload size={14}/>파일/이미지</button>
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
