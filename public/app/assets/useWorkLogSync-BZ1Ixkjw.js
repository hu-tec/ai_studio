import{c as m,r as n}from"./index-Dk3W5IAs.js";/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const b=[["path",{d:"M12 17v5",key:"bb1du9"}],["path",{d:"M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z",key:"1nkz8b"}]],_=m("pin",b);/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const M=[["path",{d:"M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18",key:"gugj83"}]],I=m("table-2",M);function W(){const[r,d]=n.useState({}),[f,g]=n.useState(!0);n.useEffect(()=>{fetch("/api/worklogs").then(t=>t.json()).then(t=>d(t||{})).catch(()=>d({})).finally(()=>g(!1))},[]);const h=n.useMemo(()=>{const t=new Map;return Object.entries(r).forEach(([u,o])=>{if(!o||!o.tasks)return;const i=o.employeeId||u.split("_")[0]||"",p=o.date||u.split("_").slice(1).join("_")||"";o.tasks.forEach(e=>{if(!e.hubPostId)return;const c=e.hubPostId;let s=t.get(c);if(s||(s={hubPostId:c,totalTasks:0,doneTasks:0,progressTasks:0,avgAchievement:0,assignees:[],lastWorked:void 0,totalHours:0},t.set(c,s)),s.totalTasks++,e.status==="done"&&s.doneTasks++,e.status==="progress"&&s.progressTasks++,e.achievement&&(s.avgAchievement=(s.avgAchievement*(s.totalTasks-1)+e.achievement)/s.totalTasks),i&&!s.assignees.includes(i)&&s.assignees.push(i),(!s.lastWorked||p>s.lastWorked)&&(s.lastWorked=p),e.startTime&&e.endTime){const[a,T]=e.startTime.split(":").map(Number),[k,v]=e.endTime.split(":").map(Number),l=(k*60+v-a*60-T)/60;l>0&&(s.totalHours+=l)}e.children&&e.children.forEach(a=>{a.status==="done"&&s.doneTasks++,a.status==="progress"&&s.progressTasks++,s.totalTasks++})})}),t},[r]);return{workLogs:r,loading:f,progressMap:h,getProgress:t=>h.get(t)}}export{_ as P,I as T,W as u};
