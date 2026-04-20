#!/usr/bin/env node
const path = require('path');
const Database = require('better-sqlite3');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'server', 'db', 'hutechc.db');

const ENTRIES = [
  { field: '기획', meetingDate: '03월 14일', agency: '', name: '김윤아', phone: '010-8721-2143', notes: '', feature: '' },
  { field: '기획', meetingDate: '03월 18일', agency: '', name: '윤희정', phone: '010-3299-2522',
    notes: '- 포트폴리오 링크 : https://drive.google.com/file/d/10L2zmdsvJjYvTMsAOCb-4WTlOSfHbFRZ/view?usp=sharing',
    feature: '- 피그마링크 : https://www.figma.com/file/4Ki8tTVHdHFtenb0dzgMAC/%ED%9C%B4%ED%85%8D%EC%94%A8-%EC%83%98%ED%94%8C?type=design&node-id=2107%3A2&mode=design&t=R1FC13fGar0IU2kq-1' },
  { field: '기획', meetingDate: '04월 30일', agency: '', name: '김진희', phone: '010-5003-1874',
    notes: '외국 살다 온 UX/UI 기획자, 우리랑은 안맞으나 대표님 개인 친분 쌓고자함', feature: '' },
  { field: '기획', meetingDate: '5/', agency: '선스튜디오', name: '', phone: '',
    notes: '업무공유가 제때 안된다며 불평, 기획은 내용 없이 붙여넣기만 해준 느낌 디자인x', feature: '' },
  { field: '기획', meetingDate: '9/5?', agency: '', name: '이은정', phone: '010-7329-1052',
    notes: '오산에 사시는 은정님, 우리랑 기획작업 같이 하시기로 함', feature: '우리은행 1002-333-268371' },
  { field: '기획', meetingDate: '09월 30일', agency: '', name: '허진성', phone: '',
    notes: '개발 기획 다 함/ 숨고에는 개발자등록됨 / 35살 미만', feature: '' },
  { field: '기획', meetingDate: '', agency: '그리너스', name: '', phone: '010-8292-7007', notes: '', feature: '' },
  { field: '기획', meetingDate: '', agency: '서양화', name: '', phone: '010-2082-3292', notes: '', feature: '' },

  { field: '개발', meetingDate: '', agency: '팀 래피드', name: '강준모', phone: '',
    notes: '', feature: '기업은행 07822153404016' },
  { field: '개발', meetingDate: '', agency: '', name: '이원진', phone: '010-5412-4189', notes: '', feature: '' },
  { field: '개발', meetingDate: '3/26', agency: '에이사이드(Aside)', name: '정윤성', phone: '010-3304-1935',
    notes: '', feature: '' },

  { field: '컨설팅', meetingDate: '02월 16일', agency: '', name: '이희수팀장(비즈파트너즈)', phone: '010-4798-6312',
    notes: '500만원 불렀나? 그리고 커미션 따로인가 여튼그럼, 대표님이 별로라고 함', feature: '' },
  { field: '컨설팅', meetingDate: '03월 25일', agency: '', name: '전영석(세무사)', phone: '010-7130-3133',
    notes: '컨설팅 방향 제시, 아이디어 제공까지만 가능, ntc처럼 컨반적인 컨설팅은 전문 업체 찾아야 한다 해서 미팅 캔슬함', feature: '' },
  { field: '컨설팅', meetingDate: '', agency: '', name: '권종원 기술사님', phone: '010-2670-7871',
    notes: '', feature: '' },

  { field: '사업계획서', meetingDate: '01월 30일', agency: '', name: '천세철', phone: '010-8964-0625',
    notes: '본인 퇴근 후에 대표님이 따로 보심, 대표님이 별로라 하심', feature: '' },
  { field: '사업계획서', meetingDate: '03월 08일', agency: '', name: '엄정호(낭랑행정사)', phone: '010-3054-1409',
    notes: '피드백 해주심, 인천에서 오심, 첫번째 피드백 그냥 그래서 다음번 서류에 피드백 부탁하고 비용지불 예정',
    feature: '주소 : 인천광역시 연수구 청능대로 175 110/1202\n신한 62802235734 엄정호\n주민번호 : 871124 1528035' },
  { field: '사업계획서', meetingDate: '', agency: '', name: '김명수', phone: '', notes: '', feature: '' },

  { field: '인테리어 및 대표님 댁수리', meetingDate: '', agency: '', name: '정리사', phone: '010-2853-7423', notes: '', feature: '' },
  { field: '인테리어 및 대표님 댁수리', meetingDate: '', agency: '', name: '화장실 누수', phone: '010-9070-3443', notes: '', feature: '' },
  { field: '인테리어 및 대표님 댁수리', meetingDate: '', agency: '', name: '탁송차', phone: '010-6410-7141', notes: '', feature: '' },
  { field: '인테리어 및 대표님 댁수리', meetingDate: '', agency: '', name: '용달아저씨', phone: '010-3667-0471', notes: '', feature: '' },
  { field: '인테리어 및 대표님 댁수리', meetingDate: '', agency: '', name: '조명갈아준 홈플러스 아저씨', phone: '010-2459-7477', notes: '', feature: '' },
  { field: '인테리어 및 대표님 댁수리', meetingDate: '', agency: '', name: '인테리어 소장님', phone: '010-3703-1597', notes: '', feature: '' },
  { field: '인테리어 및 대표님 댁수리', meetingDate: '', agency: '', name: '민윤경', phone: '010-3703-1597', notes: '', feature: '' },
  { field: '인테리어 및 대표님 댁수리', meetingDate: '', agency: '', name: '현관문설치', phone: '010-8474-3983',
    notes: '', feature: '김치호 농협 352-2194-0345-93' },
  { field: '인테리어 및 대표님 댁수리', meetingDate: '', agency: '', name: '차키', phone: '010-2931-1309', notes: '', feature: '' },

  { field: '번역강사', meetingDate: '', agency: '', name: '이주희', phone: '010-8637-3541', notes: '', feature: '' },

  { field: '프롬프트강사', meetingDate: '', agency: '', name: '송해영', phone: '010-7658-2848', notes: '', feature: 'songhawk@gmail.com' },
  { field: '프롬프트강사', meetingDate: '', agency: '', name: '박기형', phone: '', notes: '', feature: 'disgnbox@gmail.com' },

  { field: '외국인강사', meetingDate: '', agency: '', name: '데이비드', phone: '010-5357-4671', notes: '', feature: '' },

  { field: '개발알바', meetingDate: '', agency: '', name: '표영규', phone: '010-5646-5097', notes: '', feature: '' },
  { field: '개발알바', meetingDate: '', agency: '', name: '황준걸', phone: '010-5252-6920', notes: '', feature: '' },
];

function toRecord(e, idx) {
  return {
    id: `oc_${String(idx + 1).padStart(3, '0')}`,
    field: e.field,
    meetingDate: e.meetingDate,
    agency: e.agency,
    name: e.name,
    phone: e.phone,
    feature: e.feature,
    email: '',
    status: '대기',
    catLarge: e.field,
    catMid: '',
    catSmall: '',
    callCount: 0,
    lastCallDate: '',
    notes: e.notes,
    history: '',
  };
}

function main() {
  console.log(`[seed] DB: ${DB_PATH}`);
  const db = new Database(DB_PATH);

  const before = db.prepare('SELECT COUNT(*) AS n FROM outbound_calls').get().n;
  console.log(`[seed] 기존 레코드: ${before}건 — 전량 삭제 후 재시드`);

  const tx = db.transaction(() => {
    db.prepare('DELETE FROM outbound_calls').run();
    const stmt = db.prepare(`
      INSERT INTO outbound_calls (call_id, data, updated_at)
      VALUES (?, ?, datetime('now'))
    `);
    for (let i = 0; i < ENTRIES.length; i++) {
      const rec = toRecord(ENTRIES[i], i);
      stmt.run(rec.id, JSON.stringify(rec));
    }
  });
  tx();

  const after = db.prepare('SELECT COUNT(*) AS n FROM outbound_calls').get().n;
  console.log(`[seed] 삽입 완료: ${after}건`);
  db.close();
}

main();
