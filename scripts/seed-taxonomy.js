/* eslint-disable no-console */
// 업무 분류 최종 DB 시드 (T9) — 진짜 원본 DB 기반 (분류표_260402.txt)
// source of truth: scripts/seed-data/분류표_260402.txt (5 축 × 대/중/소 트리)
//                  scripts/seed-data/taxonomy_common.json (파싱 결과, 이 스크립트가 직접 로드)
// - 대표님 만다라트 분류표 4 영역 → work_class_mandalart 시드
// - 사내규정/업무지침/홈페이지 flat 칩 → work_class_taxonomy (기존 유지)
// - 결정론적 taxonomy_id (sha1) + INSERT OR IGNORE 로 idempotent.
// - source='seed', locked=1 로 저장. 사용자가 편집하면 런타임에서 source='user' 로 승격.

const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const Database = require('better-sqlite3');

const DB_PATH = path.join(__dirname, '..', 'server', 'db', 'hutechc.db');
const SEED_DATA_DIR = path.join(__dirname, 'seed-data');

function sha1(s) { return crypto.createHash('sha1').update(s).digest('hex').slice(0, 16); }
function tid(parts) { return 'wct-' + sha1(parts.join('|')); }

/* ─────────────────────────────────────────────────────────
   1) 원본 분류표 (분류표_260402.txt) — scope=common, gov=common
      axis: 분야 / 급수 / 홈페이지 / 부서 / 등급
      5 축 × 대/중/소 tree. 총 177 노드.
   ───────────────────────────────────────────────────────── */
const TAXONOMY_COMMON = JSON.parse(
  fs.readFileSync(path.join(SEED_DATA_DIR, 'taxonomy_common.json'), 'utf8'),
);

const COMMON_AXIS_META = {
  '분야':     { levels: ['large', 'medium', 'small'] },
  '급수':     { levels: ['large', 'medium', 'small'] },
  '홈페이지': { levels: ['large', 'medium'] },
  '부서':     { levels: ['large', 'medium'] },
  '등급':     { levels: ['flat'] },
};

/* ─────────────────────────────────────────────────────────
   2) 사내규정/업무지침/홈페이지 flat 칩 (CompanyGuidelinesPage 기반)
   ───────────────────────────────────────────────────────── */
const FLAT_CHIPS = [
  // 업무지침
  { scope: 'ai-studio', gov: 'work-guide', axis: '분류별',   labels: ['문서', '영상', '음성', '이미지'] },
  { scope: 'ai-studio', gov: 'work-guide', axis: '교육별',   labels: ['프롬프트', '번역', '윤리', '개발'] },
  { scope: 'ai-studio', gov: 'work-guide', axis: '급수별',   labels: ['일반', '전문', '교육'] },
  { scope: 'ai-studio', gov: 'work-guide', axis: '세부급수', labels: ['1급','2급','3급','4급','5급','6급','7급','8급'] },
  { scope: 'ai-studio', gov: 'work-guide', axis: 'DB별',     labels: ['커리큘럼','문제은행','교재','마케팅'] },

  // 사내규정 — 유형(거버넌스 3단계) + 5축
  { scope: 'ai-studio', gov: 'company-rule', axis: '유형',   labels: ['규정','준규정','선택규정'] },
  { scope: 'ai-studio', gov: 'company-rule', axis: '업무별', labels: ['문서','영상','음성','교육','마케팅','상담','기획','개발','거래처','면접','신청서','매뉴얼','시험','워크','전문가매칭','컨탠츠','커리','기타'] },
  { scope: 'ai-studio', gov: 'company-rule', axis: '부서별', labels: ['경영','개발','마케팅','인사','영업','강사팀','기획','홈페이지','상담','총무','관리','회계','교육','TF비서팀'] },
  { scope: 'ai-studio', gov: 'company-rule', axis: '직급별', labels: ['대표','임원','이사','고문','위원','팀장','사원','과장','강사','신입','알바','외부','수습'] },
  { scope: 'ai-studio', gov: 'company-rule', axis: '계약',   labels: ['정규직','계약형','프리랜서','수습','파트타임','외주','패밀리-타임스','관공서','제휴업무처','기타'] },
  { scope: 'ai-studio', gov: 'company-rule', axis: '작성자', labels: ['회사','경영','영업','홈페이지','마케팅','개발','인사','관리','상담','강사팀','신입','팀장','임원','대표'] },

  // 홈페이지 분류 (consumer 용 컬럼 세트)
  { scope: 'ai-studio', gov: 'homepage', axis: '홈페이지타입', labels: ['교육 홈페이지','AI 홈페이지','회사 홈페이지','전문가 매칭','원페이지','전시 홈페이지'] },
];

/* ─────────────────────────────────────────────────────────
   3) 만다라트 시드 — 대표님 xlsx 의 4 영역 (유지)
   ───────────────────────────────────────────────────────── */
const MANDALARTS = [
  {
    id: 'common|common|9x9',
    label: '대표님 분류표 #1 — 산업·문화·언어',
    cells: [
      ['반도체','조선','방산','창의적','시·문학·음악·창의적컨탠츠','음악','교육','자녀','부모'],
      ['자율주행','산업별 대중소','피지컬','드라마','컨탠츠','소설','생활','생활별','음식'],
      ['우주','기술','로봇','영화','시나리오','그림','건강','운동','직업'],
      ['웹툰','K문화','유투브','산업별','컨탠츠','생활별','정치','경제','사회'],
      ['K드라마','이슈별','노래','이슈별','프롬·번역 윤리','영역별','예술','영역별','문화'],
      ['영화','K음식','K교육','언어별','기능별','전문가별','음식','주식','비즈니스'],
      ['1안 영어·일어·중국어','2안 히브리어·마우리어·제주어','3안 인구어·스페인·아랍·독어','영상','음성','동시통역','의료','법률','노무'],
      ['고전','언어별 109개','유럽어','컨탠츠','기능별','이미지','회계','전문가','특허'],
      ['예술적·창의적 언어','이슈언어(아랍어)','전문가 언어','문화·국적·연령','프롬프트','개발','창의적활동','과학자','개발자'],
    ],
  },
  {
    id: 'ai-studio|company-rule|9x9',
    label: '대표님 분류표 #2 — 인물·직급·거래처',
    cells: [
      ['직원','강사','알바','사원','과장','팀장','기획','개발·디자인-AI','강사팀'],
      ['팀장','계약형','프리랜서','수습','직급','임원','영업·마케팅','부서','관리·상담·회계·총무'],
      ['임원','대표','외부','위원','이사','고문','인사·교육','TF비서팀',''],
      ['거래처','패밀리-타임스','관공서','계약형','직급','부서','커리','교제','문제은행'],
      ['','외부','제휴업무처','외부','회사','강사','테솔 외국인','강사 및 교제','방과후·기업교육 강사'],
      ['','','','','영업처','전문가','','',''],
      ['','','','기업','관공서','','','',''],
      ['','','','','영업처','','','',''],
      ['','','','','','','','',''],
    ],
  },
  {
    id: 'ai-studio|work-guide|9x9',
    label: '대표님 분류표 #3 — 인물 세부정보·자격·경력',
    cells: [
      ['이름·국적','연락처·주소·메일','직업','','','','해당업무 세부','통장내역','이력서 첨부'],
      ['업무 가능부문','전문가(규정)','','자격증','전문가(준규정)','마케팅','경력 세부','전문가(선택규정)','경력 첨부'],
      ['업무가능시간·요일·상황','경력·학력','SNS: 카톡·인스타·페북','해당 업무자격증','사용가능 툴','','학력 세부','자격증 세부','학력 첨부'],
      ['경력기준','학위(박사·해외)','분야 선택(특수)','규정','준규정','선택','각 영역 경력 20년','기술·출판·박사·퇴직자','교수나 연구'],
      ['자격증 보유','전문가 등급','이슈 분야','전문가 등급','전문가','경력','분야별·예체능','경력 기준','전문 자격증'],
      ['데이터·보유내용','A~D (4등급)','이력 특이','','','','이슈·인맥·공공 등 전문 분야','해외 전문가·로비리스트','데이터·리스트·업체 보유'],
      ['번역활동','언어','출판 번역책','사용 이력','강의 이력','전공 이력','교사 자격증','테솔 자격증','강의 경력'],
      ['특이한 번역분야','번역사','번역 사용툴','AI 자격증','프롬프트','기능 업무 경력','','윤리/방과후',''],
      ['','','','다양한 강의처','','','','',''],
    ],
  },
  {
    id: 'ai-studio|homepage|9x9',
    label: '대표님 분류표 #4 — 시스템 통합·모듈화',
    cells: [
      ['4단(가로·세로·위·아래)','통합 리스트(이모지) 한꺼번에','통합','','','','','',''],
      ['','규정','다운·수정·변경·추가','','','','','',''],
      ['','','DB 활성화·리스트 정리','','','','','',''],
      ['면접(강사·직원 등)','업무일지(규정들)','상담(교육·전문가·기업)','규정','','','전체 구성·서버 세팅','랜딩·공통(홈피 확장 5개)',''],
      ['신청서(사용·전문·관리·학생)','사내용','매뉴얼·거래처·자료 보관','사내용','개발','전문 개발자','원페이지 AI 에디팅','전문 개발','전문가 활성화'],
      ['컨탠츠와 커리','공용 관리(업무·사이트별)','확인서·홈피 관리','워크','통합할 것','','DB와 컨탠츠 보관 활동','AI 분석·확장성','관리툴·평가툴·시험방법'],
      ['시험(온오프·종이 레벨)','원페이지(번역·통독·전시)','랜딩·공통 활성','컨탠츠(커리·문제·교제)','사용자·전문가·B2B 통합관리·면접·진행','테스트(레벨·시험 진행 결과)','','',''],
      ['전문가 매칭','워크','확인서·홈피 관리','DB','통합할 것','랜딩·공통 관리','','',''],
      ['AI 분석(원페이지·전문가·콘텐츠)','DB와 사용 컨탠츠 모으기','','AI 분석(원페이지·전문가·콘텐츠)','사내(매뉴얼·평가)','프롬·공통·고정','','',''],
    ],
  },
];

/* ─────────────────────────────────────────────────────────
   DB helpers
   ───────────────────────────────────────────────────────── */
function openDb() {
  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  return db;
}

function insertNode(db, row) {
  const stmt = db.prepare(`
    INSERT OR IGNORE INTO work_class_taxonomy
    (taxonomy_id, scope, gov, axis, level, parent_id, label, emoji, sort_order, source, locked, removed, revision, data, updated_at)
    VALUES (@taxonomy_id, @scope, @gov, @axis, @level, @parent_id, @label, @emoji, @sort_order, 'seed', 1, 0, 1, NULL, datetime('now'))
  `);
  stmt.run(row);
}

// 재귀: node.children 있으면 medium→small 로 내려감
function seedTreeRec(db, { axis, scope, gov, levels }, nodes, parentPath, parentId, depth) {
  let order = 0;
  for (const n of nodes) {
    const level = levels[depth] || 'flat';
    const pathArr = [...parentPath, n.label];
    const id = tid([scope, gov, axis, ...pathArr]);
    insertNode(db, {
      taxonomy_id: id,
      scope, gov, axis, level,
      parent_id: parentId,
      label: n.label,
      emoji: null,
      sort_order: order++,
    });
    if (n.children && n.children.length && depth + 1 < levels.length) {
      seedTreeRec(db, { axis, scope, gov, levels }, n.children, pathArr, id, depth + 1);
    }
  }
}

function seedFlat(db, { scope, gov, axis, labels }) {
  labels.forEach((label, i) => {
    const id = tid([scope, gov, axis, label]);
    insertNode(db, {
      taxonomy_id: id,
      scope, gov, axis, level: 'flat',
      parent_id: null,
      label,
      emoji: null,
      sort_order: i,
    });
  });
}

function seedMandalart(db, m) {
  const cells = [];
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const text = (m.cells[r] && m.cells[r][c]) || '';
      cells.push({ id: `seed-mc-${m.id}-${r}-${c}`, text });
    }
  }
  const data = JSON.stringify({
    label: m.label, size: { rows: 9, cols: 9 }, cells, seed: true,
  });
  db.prepare(`
    INSERT OR IGNORE INTO work_class_mandalart
    (mandalart_id, data, source, locked, removed, revision, updated_at)
    VALUES (?, ?, 'seed', 1, 0, 1, datetime('now'))
  `).run(m.id, data);
}

function ensureSeedFlag(db) {
  db.prepare(`INSERT OR REPLACE INTO app_settings (key, data, updated_at)
              VALUES ('work_class_seed_done', ?, datetime('now'))`)
    .run(JSON.stringify({
      at: new Date().toISOString(),
      source: '분류표_260402.txt + 대표님 만다라트 xlsx',
      version: 2,
    }));
}

function main() {
  const db = openDb();
  const beforeT = db.prepare('SELECT COUNT(*) c FROM work_class_taxonomy').get().c;
  const beforeM = db.prepare('SELECT COUNT(*) c FROM work_class_mandalart').get().c;

  const tx = db.transaction(() => {
    // 0) cleanup: 이전 버전의 seed 노드 제거 (user 편집은 보존)
    // 원본 분류표_260402.txt 기반 새 seed 를 깨끗하게 올리기 위함.
    const cleanupCommon = db.prepare(
      `DELETE FROM work_class_taxonomy WHERE scope='common' AND source='seed'`
    ).run();
    if (cleanupCommon.changes) {
      console.log(`[cleanup] removed ${cleanupCommon.changes} old seed rows from common scope`);
    }

    // 1) 원본 분류표 — 5 축 common|common tree
    for (const [axis, tree] of Object.entries(TAXONOMY_COMMON)) {
      const meta = COMMON_AXIS_META[axis];
      if (!meta) { console.warn('unknown axis', axis); continue; }
      seedTreeRec(
        db,
        { axis, scope: 'common', gov: 'common', levels: meta.levels },
        tree, [], null, 0,
      );
    }

    // 2) 사내규정/업무지침 flat 칩
    FLAT_CHIPS.forEach((f) => seedFlat(db, f));

    // 3) 만다라트
    MANDALARTS.forEach((m) => seedMandalart(db, m));

    ensureSeedFlag(db);
  });
  tx();

  const afterT = db.prepare('SELECT COUNT(*) c FROM work_class_taxonomy').get().c;
  const afterM = db.prepare('SELECT COUNT(*) c FROM work_class_mandalart').get().c;
  console.log(`[seed-taxonomy] taxonomy: ${beforeT} → ${afterT} (+${afterT - beforeT})`);
  console.log(`[seed-taxonomy] mandalart: ${beforeM} → ${afterM} (+${afterM - beforeM})`);
  console.log('[seed-taxonomy] done.');
  db.close();
}

if (require.main === module) main();
