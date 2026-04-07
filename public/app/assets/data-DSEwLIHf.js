const I=[{id:"template-default",name:"기본 프롬프트 세트",prompt1:`1차 프롬프트 지시사항
1.
2.
3.
4. 작업 범위
- 포함:
- 제외:
[필요 기능]
1. (Must)
2. (Must)
3. (Should)
[고려사항]
1.
2.
3.
( 진행할때 가장중요한것)
1.
2.
3.
[회사 고정 규정 – 반드시 적용]- 이건 항상 프롬프트가 인지 해야하는내용입니다 
- 간격:
- 색상:
- 형식:
- 이모지:
- 톤:
- 적용 범위:
([준 규정]  
([선택 규정]  

위 조건을 반영하여 1차 구조 설계로 작성해줘.
완성본이 아니라 구조 중심으로.`,prompt2:`2차 프롬프트 지시사항 
위 1차 구조를 기반으로 UX 흐름을 개선해줘.

[보완 요청]
1.
2.
3.

[유지해야 할 요소]
1.
2.
3.
( 진행할때 가장중요한것)
1.
2.
3.
회사 고정, 준고정, 선택 규정은 그대로 유지.
완성 코드가 아니라 UX 개선 중심으로 작성.`}];function q(){try{const t=localStorage.getItem("prompt-templates");if(t)return JSON.parse(t)}catch{}return I}function E(t){localStorage.setItem("prompt-templates",JSON.stringify(t))}const O=["알바","신입","강사","팀장","개발","외부","임원","대표"],G={q1:{label:"A",desc:"중요 + 긴급",action:"즉시 실행",color:"#dc2626",bg:"#fef2f2",border:"#fecaca"},q2:{label:"B",desc:"중요 + 긴급하지않음",action:"계획/예약",color:"#2563eb",bg:"#eff6ff",border:"#bfdbfe"},q3:{label:"C",desc:"긴급 + 중요하지않음",action:"위임",color:"#f59e0b",bg:"#fffbeb",border:"#fde68a"},q4:{label:"D",desc:"긴급하지도 중요하지도",action:"제거/보류",color:"#6b7280",bg:"#f9fafb",border:"#e5e7eb"}};function P(t){return t.important&&t.urgent?"q1":t.important&&!t.urgent?"q2":!t.important&&t.urgent?"q3":"q4"}function v(t,n){const o={q1:"A",q2:"B",q3:"C",q4:"D"};switch(n){case"q1":return{important:!0,urgent:!0,priority:o[n]};case"q2":return{important:!0,urgent:!1,priority:o[n]};case"q3":return{important:!1,urgent:!0,priority:o[n]};case"q4":return{important:!1,urgent:!1,priority:o[n]}}}function M(t){switch(t){case"A":return{important:!0,urgent:!0};case"B":return{important:!0,urgent:!1};case"C":return{important:!1,urgent:!0};case"D":return{important:!1,urgent:!1}}}const L={pending:{icon:"○",label:"대기",color:"#9ca3af",bg:"#f3f4f6"},progress:{icon:"◐",label:"진행중",color:"#3b82f6",bg:"#eff6ff"},done:{icon:"●",label:"완료",color:"#16a34a",bg:"#f0fdf4"},forwarded:{icon:"→",label:"이월",color:"#f59e0b",bg:"#fffbeb"},cancelled:{icon:"✕",label:"취소",color:"#ef4444",bg:"#fef2f2"}},D={A:{label:"A",desc:"즉시 실행",color:"#dc2626",bg:"#fef2f2",quadrant:"q1"},B:{label:"B",desc:"계획/예약",color:"#2563eb",bg:"#eff6ff",quadrant:"q2"},C:{label:"C",desc:"위임",color:"#f59e0b",bg:"#fffbeb",quadrant:"q3"},D:{label:"D",desc:"보류/제거",color:"#6b7280",bg:"#f9fafb",quadrant:"q4"}};function R(t,n,o){const e=new Map;t.forEach(r=>{r.timeSlotId&&e.set(r.timeSlotId,r)});const a=new Set;return o&&o.forEach(r=>{r.timeSlotId&&!e.has(r.timeSlotId)&&a.add(r.timeSlotId)}),n.map(r=>{const i=e.get(r.id);return i?{...r,title:i.task,content:i.note||""}:a.has(r.id)?{...r,title:"",content:""}:r})}function B(t,n,o,e){const a=t.find(r=>r.timeSlotId===n);return a?o==="title"?t.map(r=>r.id===a.id?{...r,task:e}:r):o==="content"?t.map(r=>r.id===a.id?{...r,note:e}:r):t:t}function _(t,n){const o=t.filter(e=>e.priority===n).map(e=>e.number);return o.length>0?Math.max(...o)+1:1}function C(t){const[n,o]=t.split(":").map(Number);return(n||0)*60+(o||0)}function F(t,n=9,o=18){const e=C(t),a=n*60,r=o*60;return Math.max(0,Math.min(100,(e-a)/(r-a)*100))}function J(t){const n=["pending","progress","done","forwarded","cancelled"];return n[(n.indexOf(t)+1)%n.length]}const j=["#e2e8f0","#f59e0b","#f59e0b","#f59e0b","#10B981","#10B981"],x=["","1(양)","2(양)","3(양)","4(질)","5(질)"];function k(t){return t.children||[]}function H(t){const n=k(t);if(n.length===0)return t.achievement||0;const o=n.filter(e=>(e.achievement||0)>0);return o.length===0?t.achievement||0:Math.round(o.reduce((e,a)=>e+(a.achievement||0),0)/o.length*10)/10}function U(t,n,o){return t.map(e=>{if(e.id!==n)return e;const a=[...e.children||[]],r=a.length+1;return a.push({id:`${n}-sub-${Date.now()}`,priority:e.priority,number:r,task:o,status:"pending",achievement:0,parentId:n}),{...e,children:a}})}function K(t,n,o,e){return t.map(a=>{if(a.id!==n)return a;const r=(a.children||[]).map(i=>i.id===o?{...i,...e}:i);return{...a,children:r}})}function Q(t,n,o){return t.map(e=>{if(e.id!==n)return e;const a=(e.children||[]).filter(r=>r.id!==o);return{...e,children:a}})}const X=["교육","번역","통독 문서","시험","전시회","전문가 매칭","그 외"],W=["기획","홈피","영업","마케팅","회계","개발","인사","관리","상담","총무","강사 팀","커리교재팀","문제은행","그 외"],Y=["문서/개발","기획/업무 기획","마케팅","상담관리","회계/총무","전문가 관리","강사커리","기타"],z=["ChatGPT","Claude","Gemini","Copilot","Cursor","Midjourney","DALL-E","기타"],l=[{id:"emp-ceo",name:"대표님",department:"경영",position:"대표"},{id:"emp-suyeon",name:"수연",department:"관리",position:"팀장"},{id:"emp-gayeon",name:"가연",department:"관리",position:"팀장"},{id:"emp-minhyuk",name:"민혁",department:"개발",position:"알바"}];function w(){try{const t=localStorage.getItem("current-employee-id");if(t){const n=l.find(o=>o.id===t);if(n)return n}}catch{}return l[0]}function V(t){localStorage.setItem("current-employee-id",t)}function Z(t){l.push(t);try{localStorage.setItem("custom-employees",JSON.stringify(l.filter(n=>n.id.startsWith("emp-custom"))))}catch{}}try{const t=localStorage.getItem("custom-employees");t&&JSON.parse(t).forEach(o=>{l.find(e=>e.id===o.id)||l.push(o)})}catch{}const tt=w();function y(t){if(t==="half-day")return["오전 (09:00~12:00)","오후 (13:00~18:00)"];const n=[],o=t==="30min"?30:60;for(let e=9;e<18;e++)for(let a=0;a<60;a+=o){const r=`${String(e).padStart(2,"0")}:${String(a).padStart(2,"0")}`,i=a+o,s=i>=60?e+1:e,c=i>=60?i-60:i;if(s>18||s===18&&c>0)break;const d=`${String(s).padStart(2,"0")}:${String(c).padStart(2,"0")}`;n.push(`${r} ~ ${d}`)}return n}function et(t){return y(t).map((o,e)=>({id:`ts-${Date.now()}-${e}`,timeSlot:o,title:"",content:"",planned:""}))}function A(){var e,a;const t=[],n=["2026-03-01","2026-03-02","2026-03-03","2026-02-28","2026-02-27"],o={emp1:[{title:"프로젝트 기획서 작성",content:"AI 교육 플랫폼 기획서 초안 작성",planned:"기획서 검토 미팅",workTypes:["기획/업무 기획"],aiTools:["ChatGPT","Claude"]},{title:"UI/UX 와이어프레임",content:"교육 대시보드 화면 설계",planned:"디자인팀 리뷰",workTypes:["문서/개발"],aiTools:["Midjourney","ChatGPT"]},{title:"시장 조사 분석",content:"경쟁사 AI 교육 서비스 분석",planned:"보고서 제출",workTypes:["기획/업무 기획","마케팅"],aiTools:["Gemini","ChatGPT"]}],emp2:[{title:"마케팅 캠페인 기획",content:"SNS 광고 소재 제작",planned:"광고 집행 시작",workTypes:["마케팅"],aiTools:["DALL-E","ChatGPT"]},{title:"블로그 콘텐츠 작성",content:"AI 활용 사례 블로그 포스팅",planned:"편집 및 퍼블리싱",workTypes:["마케팅"],aiTools:["Claude","Gemini"]}],emp3:[{title:"홈페이지 리뉴얼",content:"메인 페이지 퍼블리싱 작업",planned:"QA 테스트",workTypes:["문서/개발"],aiTools:["Copilot","Cursor"]},{title:"API 연동 개발",content:"번역 서비스 API 연동",planned:"통합 테스트",workTypes:["문서/개발"],aiTools:["Cursor","ChatGPT"]}],emp4:[{title:"신규 고객 미팅",content:"A사 번역 서비스 제안",planned:"견적서 발송",workTypes:["상담관리"],aiTools:["ChatGPT"]},{title:"견적서 작성",content:"번역 프로젝트 견적서 작성",planned:"고객 피드백 대기",workTypes:["문서/개발","상담관리"],aiTools:["Claude"]}],emp5:[{title:"인사 관리 시스템 점검",content:"직원 출결 데이터 정리",planned:"월말 보고서",workTypes:["회계/총무"],aiTools:["ChatGPT","Gemini"]},{title:"시설 관리 점검",content:"사무실 환경 개선 계획",planned:"업체 미팅",workTypes:["회계/총무"],aiTools:[]}]};for(const r of l)for(let i=0;i<n.length;i++){const s=n[i],c=o[r.id]||[],d="1hour",S=y(d).map((T,m)=>{const u=c[m%c.length],p=m<c.length+1;return{id:`mock-${r.id}-${s}-${m}`,timeSlot:T,title:p?u.title:"",content:p?u.content:"",planned:p?u.planned:"",aiDetail:p?{workTypes:u.workTypes,aiTools:u.aiTools,instructions:`1. 기존 자료 분석
2. AI 도구로 초안 생성
3. 검토 및 수정`,instructionNote:"팀장님 지시사항 반영 완료",importantNotes:"프롬프트는 항상 회사 규정을 반영해야 합니다.",promptGrid1:[{id:"1",content:"데이터 분석 수행",note:"가장 먼저 진행"},{id:"2",content:"보고서 템플릿 적용",note:"신규 버전 사용"}],promptGrid2:[{id:"1",content:"톤앤매너 검수",note:"격식 있는 표현"}],beforeImage:null,afterImage:null,securityPrompt1:"민감 정보 제거 후 프롬프트 입력",securityPrompt2:"결과물 내 개인정보 검토 완료",regulations:"기본 회사 규정 준수",semiRegulations:"권고 사항 적용",optionalRegulations:"추가 선택 옵션",fieldRegulations:"특수 분야 규정 반영"}:void 0}}),g=["교육","번역","통독 문서","시험"],h=["기획","홈피","영업","개발"];t.push({date:s,summary:`${r.name} - ${s} 업무 요약: ${((e=c[0])==null?void 0:e.title)||"일반 업무"}`,detail:`${r.name} - ${s} 업무 세부 내용: ${((a=c[0])==null?void 0:a.content)||"일반 업무"}`,position:r.position,homepageCategories:[g[i%g.length]],departmentCategories:[r.department,h[i%h.length]],timeInterval:d,timeSlots:S,employeeId:r.id})}return t}const f="work-log-data",b="v4-detail-field";function nt(){try{if(localStorage.getItem(f+"-version")===b){const o=localStorage.getItem(f);if(o){const e=JSON.parse(o);if(Array.isArray(e)&&e.length>0&&e[0].position)return e}}}catch{}const t=A();return N(t),t}function N(t){localStorage.setItem(f,JSON.stringify(t)),localStorage.setItem(f+"-version",b)}async function ot(){try{const t=await fetch("/api/worklogs");if(!t.ok)return null;const n=await t.json(),o=Object.values(n).filter(e=>e.employeeId&&e.date);return o.length===0?null:o}catch{return null}}async function rt(t){try{const n=`${t.employeeId}_${t.date}`;return(await fetch(`/api/worklogs/${n}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({data:t})})).ok}catch{return!1}}export{j as A,U as B,K as C,Q as D,G as E,L as F,M as G,v as H,D as a,tt as b,et as c,W as d,l as e,B as f,P as g,X as h,w as i,ot as j,N as k,nt as l,rt as m,V as n,Z as o,O as p,q,E as r,R as s,z as t,F as u,J as v,Y as w,H as x,x as y,_ as z};
