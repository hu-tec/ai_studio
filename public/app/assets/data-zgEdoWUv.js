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
완성 코드가 아니라 UX 개선 중심으로 작성.`}];function O(){try{const t=localStorage.getItem("prompt-templates");if(t)return JSON.parse(t)}catch{}return I}function $(t){localStorage.setItem("prompt-templates",JSON.stringify(t))}const q=["알바","신입","강사","팀장","개발","외부","임원","대표"],G={q1:{label:"A",desc:"중요 + 긴급",action:"즉시 실행",color:"#dc2626",bg:"#fef2f2",border:"#fecaca"},q2:{label:"B",desc:"중요 + 긴급하지않음",action:"계획/예약",color:"#2563eb",bg:"#eff6ff",border:"#bfdbfe"},q3:{label:"C",desc:"긴급 + 중요하지않음",action:"위임",color:"#f59e0b",bg:"#fffbeb",border:"#fde68a"},q4:{label:"D",desc:"긴급하지도 중요하지도",action:"제거/보류",color:"#6b7280",bg:"#f9fafb",border:"#e5e7eb"}};function v(t){return t.important&&t.urgent?"q1":t.important&&!t.urgent?"q2":!t.important&&t.urgent?"q3":"q4"}function P(t,e){const n={q1:"A",q2:"B",q3:"C",q4:"D"};switch(e){case"q1":return{important:!0,urgent:!0,priority:n[e]};case"q2":return{important:!0,urgent:!1,priority:n[e]};case"q3":return{important:!1,urgent:!0,priority:n[e]};case"q4":return{important:!1,urgent:!1,priority:n[e]}}}function M(t){switch(t){case"A":return{important:!0,urgent:!0};case"B":return{important:!0,urgent:!1};case"C":return{important:!1,urgent:!0};case"D":return{important:!1,urgent:!1}}}const L={pending:{icon:"○",label:"대기",color:"#9ca3af",bg:"#f3f4f6"},progress:{icon:"◐",label:"진행중",color:"#3b82f6",bg:"#eff6ff"},done:{icon:"●",label:"완료",color:"#16a34a",bg:"#f0fdf4"},forwarded:{icon:"→",label:"이월",color:"#f59e0b",bg:"#fffbeb"},cancelled:{icon:"✕",label:"취소",color:"#ef4444",bg:"#fef2f2"}},D={A:{label:"A",desc:"즉시 실행",color:"#dc2626",bg:"#fef2f2",quadrant:"q1"},B:{label:"B",desc:"계획/예약",color:"#2563eb",bg:"#eff6ff",quadrant:"q2"},C:{label:"C",desc:"위임",color:"#f59e0b",bg:"#fffbeb",quadrant:"q3"},D:{label:"D",desc:"보류/제거",color:"#6b7280",bg:"#f9fafb",quadrant:"q4"}};function R(t,e,n){const o=new Map;t.forEach(r=>{r.timeSlotId&&o.set(r.timeSlotId,r)});const a=new Set;return n&&n.forEach(r=>{r.timeSlotId&&!o.has(r.timeSlotId)&&a.add(r.timeSlotId)}),e.map(r=>{const i=o.get(r.id);return i?{...r,title:i.task,content:i.note||""}:a.has(r.id)?{...r,title:"",content:""}:r})}function B(t,e,n,o){const a=t.find(r=>r.timeSlotId===e);return a?n==="title"?t.map(r=>r.id===a.id?{...r,task:o}:r):n==="content"?t.map(r=>r.id===a.id?{...r,note:o}:r):t:t}function _(t,e){const n=t.filter(o=>o.priority===e).map(o=>o.number);return n.length>0?Math.max(...n)+1:1}function C(t){const[e,n]=t.split(":").map(Number);return(e||0)*60+(n||0)}function F(t,e=9,n=18){const o=C(t),a=e*60,r=n*60;return Math.max(0,Math.min(100,(o-a)/(r-a)*100))}function x(t){const e=["pending","progress","done","forwarded","cancelled"];return e[(e.indexOf(t)+1)%e.length]}const J=["#e2e8f0","#f59e0b","#f59e0b","#f59e0b","#10B981","#10B981"],j=["","1(양)","2(양)","3(양)","4(질)","5(질)"];function k(t){return t.children||[]}function H(t){const e=k(t);if(e.length===0)return t.achievement||0;const n=e.filter(o=>(o.achievement||0)>0);return n.length===0?t.achievement||0:Math.round(n.reduce((o,a)=>o+(a.achievement||0),0)/n.length*10)/10}function U(t,e,n){return t.map(o=>{if(o.id!==e)return o;const a=[...o.children||[]],r=a.length+1;return a.push({id:`${e}-sub-${Date.now()}`,priority:o.priority,number:r,task:n,status:"pending",achievement:0,parentId:e}),{...o,children:a}})}function K(t,e,n,o){return t.map(a=>{if(a.id!==e)return a;const r=(a.children||[]).map(i=>i.id===n?{...i,...o}:i);return{...a,children:r}})}function Q(t,e,n){return t.map(o=>{if(o.id!==e)return o;const a=(o.children||[]).filter(r=>r.id!==n);return{...o,children:a}})}const W=["교육","번역","통독 문서","시험","전시회","전문가 매칭","그 외"],X=["기획","홈피","영업","마케팅","회계","개발","인사","관리","상담","총무","강사 팀","커리교재팀","문제은행","그 외"],Y=["문서/개발","기획/업무 기획","마케팅","상담관리","회계/총무","전문가 관리","강사커리","기타"],z=["ChatGPT","Claude","Gemini","Copilot","Cursor","Midjourney","DALL-E","기타"],s=[{id:"emp-ceo",name:"대표님",department:"경영",position:"대표"},{id:"emp-suyeon",name:"수연",department:"관리",position:"팀장"},{id:"emp-gayeon",name:"가연",department:"관리",position:"팀장"},{id:"emp-minhyuk",name:"민혁",department:"개발",position:"알바"}];function w(){try{const t=localStorage.getItem("current-employee-id");if(t){const e=s.find(n=>n.id===t);if(e)return e}}catch{}return s[0]}function V(t){localStorage.setItem("current-employee-id",t)}function Z(t){s.push(t);try{localStorage.setItem("custom-employees",JSON.stringify(s.filter(e=>e.id.startsWith("emp-custom"))))}catch{}}function tt(t){const e=s.findIndex(n=>n.id===t);e>=0&&s.splice(e,1);try{localStorage.setItem("custom-employees",JSON.stringify(s.filter(n=>n.id.startsWith("emp-custom"))))}catch{}}try{const t=localStorage.getItem("custom-employees");t&&JSON.parse(t).forEach(n=>{s.find(o=>o.id===n.id)||s.push(n)})}catch{}const et=w();function y(t){if(t==="half-day")return["오전 (09:00~12:00)","오후 (13:00~18:00)"];const e=[],n=t==="30min"?30:60;for(let o=9;o<18;o++)for(let a=0;a<60;a+=n){const r=`${String(o).padStart(2,"0")}:${String(a).padStart(2,"0")}`,i=a+n,c=i>=60?o+1:o,l=i>=60?i-60:i;if(c>18||c===18&&l>0)break;const d=`${String(c).padStart(2,"0")}:${String(l).padStart(2,"0")}`;e.push(`${r} ~ ${d}`)}return e}function nt(t){return y(t).map((n,o)=>({id:`ts-${Date.now()}-${o}`,timeSlot:n,title:"",content:"",planned:""}))}function A(){var o,a;const t=[],e=["2026-03-01","2026-03-02","2026-03-03","2026-02-28","2026-02-27"],n={emp1:[{title:"프로젝트 기획서 작성",content:"AI 교육 플랫폼 기획서 초안 작성",planned:"기획서 검토 미팅",workTypes:["기획/업무 기획"],aiTools:["ChatGPT","Claude"]},{title:"UI/UX 와이어프레임",content:"교육 대시보드 화면 설계",planned:"디자인팀 리뷰",workTypes:["문서/개발"],aiTools:["Midjourney","ChatGPT"]},{title:"시장 조사 분석",content:"경쟁사 AI 교육 서비스 분석",planned:"보고서 제출",workTypes:["기획/업무 기획","마케팅"],aiTools:["Gemini","ChatGPT"]}],emp2:[{title:"마케팅 캠페인 기획",content:"SNS 광고 소재 제작",planned:"광고 집행 시작",workTypes:["마케팅"],aiTools:["DALL-E","ChatGPT"]},{title:"블로그 콘텐츠 작성",content:"AI 활용 사례 블로그 포스팅",planned:"편집 및 퍼블리싱",workTypes:["마케팅"],aiTools:["Claude","Gemini"]}],emp3:[{title:"홈페이지 리뉴얼",content:"메인 페이지 퍼블리싱 작업",planned:"QA 테스트",workTypes:["문서/개발"],aiTools:["Copilot","Cursor"]},{title:"API 연동 개발",content:"번역 서비스 API 연동",planned:"통합 테스트",workTypes:["문서/개발"],aiTools:["Cursor","ChatGPT"]}],emp4:[{title:"신규 고객 미팅",content:"A사 번역 서비스 제안",planned:"견적서 발송",workTypes:["상담관리"],aiTools:["ChatGPT"]},{title:"견적서 작성",content:"번역 프로젝트 견적서 작성",planned:"고객 피드백 대기",workTypes:["문서/개발","상담관리"],aiTools:["Claude"]}],emp5:[{title:"인사 관리 시스템 점검",content:"직원 출결 데이터 정리",planned:"월말 보고서",workTypes:["회계/총무"],aiTools:["ChatGPT","Gemini"]},{title:"시설 관리 점검",content:"사무실 환경 개선 계획",planned:"업체 미팅",workTypes:["회계/총무"],aiTools:[]}]};for(const r of s)for(let i=0;i<e.length;i++){const c=e[i],l=n[r.id]||[],d="1hour",S=y(d).map((T,m)=>{const u=l[m%l.length],p=m<l.length+1;return{id:`mock-${r.id}-${c}-${m}`,timeSlot:T,title:p?u.title:"",content:p?u.content:"",planned:p?u.planned:"",aiDetail:p?{workTypes:u.workTypes,aiTools:u.aiTools,instructions:`1. 기존 자료 분석
2. AI 도구로 초안 생성
3. 검토 및 수정`,instructionNote:"팀장님 지시사항 반영 완료",importantNotes:"프롬프트는 항상 회사 규정을 반영해야 합니다.",promptGrid1:[{id:"1",content:"데이터 분석 수행",note:"가장 먼저 진행"},{id:"2",content:"보고서 템플릿 적용",note:"신규 버전 사용"}],promptGrid2:[{id:"1",content:"톤앤매너 검수",note:"격식 있는 표현"}],beforeImage:null,afterImage:null,securityPrompt1:"민감 정보 제거 후 프롬프트 입력",securityPrompt2:"결과물 내 개인정보 검토 완료",regulations:"기본 회사 규정 준수",semiRegulations:"권고 사항 적용",optionalRegulations:"추가 선택 옵션",fieldRegulations:"특수 분야 규정 반영"}:void 0}}),g=["교육","번역","통독 문서","시험"],h=["기획","홈피","영업","개발"];t.push({date:c,summary:`${r.name} - ${c} 업무 요약: ${((o=l[0])==null?void 0:o.title)||"일반 업무"}`,detail:`${r.name} - ${c} 업무 세부 내용: ${((a=l[0])==null?void 0:a.content)||"일반 업무"}`,position:r.position,homepageCategories:[g[i%g.length]],departmentCategories:[r.department,h[i%h.length]],timeInterval:d,timeSlots:S,employeeId:r.id})}return t}const f="work-log-data",b="v4-detail-field";function ot(){try{if(localStorage.getItem(f+"-version")===b){const n=localStorage.getItem(f);if(n){const o=JSON.parse(n);if(Array.isArray(o)&&o.length>0&&o[0].position)return o}}}catch{}const t=A();return N(t),t}function N(t){localStorage.setItem(f,JSON.stringify(t)),localStorage.setItem(f+"-version",b)}async function rt(){try{const t=await fetch("/api/worklogs");if(!t.ok)return null;const e=await t.json(),n=Object.values(e).filter(o=>o.employeeId&&o.date);return n.length===0?null:n}catch{return null}}async function at(t){try{const e=`${t.employeeId}_${t.date}`;return(await fetch(`/api/worklogs/${e}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({data:t})})).ok}catch{return!1}}export{J as A,_ as B,U as C,K as D,G as E,L as F,Q as G,M as H,P as I,D as a,et as b,nt as c,X as d,s as e,B as f,v as g,W as h,w as i,rt as j,N as k,ot as l,at as m,V as n,Z as o,q as p,O as q,tt as r,R as s,$ as t,z as u,F as v,Y as w,x,H as y,j as z};
