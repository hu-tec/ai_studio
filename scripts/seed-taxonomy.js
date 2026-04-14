/* eslint-disable no-console */
// 업무 분류 최종 DB 시드 (T9)
// - rules-manual/mockData.ts 의 대/중/소 트리 (우선)
// - company-guidelines 의 flat 칩 상수 (보조)
// - 결정론적 taxonomy_id (sha1) + INSERT OR IGNORE 로 idempotent.
// - source='seed', locked=1 로 저장. 사용자가 편집하면 런타임에서 source='user' 로 승격.
//
// 사용:  npm run seed-taxonomy

const path = require('path');
const crypto = require('crypto');
const Database = require('better-sqlite3');

const DB_PATH = path.join(__dirname, '..', 'server', 'db', 'hutechc.db');

function sha1(s) { return crypto.createHash('sha1').update(s).digest('hex').slice(0, 16); }
function tid(parts) { return 'wct-' + sha1(parts.join('|')); }

/* ─────────────────────────────────────────────────────────
   1) 대/중/소 트리 (rules-manual/mockData.ts 기반)
   5축: 분야·급수·부서·직급·홈페이지타입
   ───────────────────────────────────────────────────────── */
const LMS_TREES = [
  // axis, label, children
  {
    axis: '분야', scope: 'common', gov: 'common',
    items: [
      { label: '문서', emoji: '📄', children: [
        { label: '비즈니스', emoji: '💼', children: [
          { label: '사업계획서', emoji: '📝' },
          { label: '회사소개',   emoji: '🏢' },
          { label: 'PPT/기획서', emoji: '📊' },
        ] },
        { label: '법률', emoji: '⚖️', children: [
          { label: '소송장',   emoji: '📂' },
          { label: '형사/민사', emoji: '📁' },
        ] },
      ] },
      { label: '영상/SNS', emoji: '🎬', children: [
        { label: '미디어/장르', emoji: '🎥', children: [
          { label: '유튜브',     emoji: '🔴' },
          { label: '다큐멘터리', emoji: '🌍' },
        ] },
      ] },
      { label: 'IT/개발', emoji: '💻', children: [
        { label: '개발/보안', emoji: '🛡️', children: [
          { label: 'AI/에이전트',   emoji: '🤖' },
          { label: '프론트/백엔드', emoji: '⛓️' },
        ] },
      ] },
    ],
  },
  {
    axis: '급수', scope: 'common', gov: 'common',
    items: [
      { label: '교육', emoji: '🎓', children: [
        { label: '일반교육', emoji: '📚', children: [
          { label: '1급~3급', emoji: '🥇' },
        ] },
      ] },
    ],
  },
  {
    axis: '홈페이지타입', scope: 'common', gov: 'common',
    items: [
      { label: '교육 홈페이지', emoji: '🎓', children: [
        { label: '메인 영역', emoji: '🖥️', children: [
          { label: '헤더 디자인', emoji: '🎨' },
        ] },
      ] },
      { label: 'AI 홈페이지',   emoji: '🤖', children: [] },
      { label: '회사 홈페이지', emoji: '🏢', children: [] },
    ],
  },
  {
    axis: '부서', scope: 'common', gov: 'common',
    items: [
      { label: '기획부서', emoji: '📝', children: [
        { label: '운영팀', emoji: '⚙️', children: [
          { label: '강사팀', emoji: '👨‍🏫' },
        ] },
      ] },
      { label: '영업부서', emoji: '💰', children: [
        { label: '국내영업', emoji: '🇰🇷', children: [
          { label: 'B2B 영업', emoji: '🤝' },
        ] },
      ] },
    ],
  },
  {
    axis: '직급', scope: 'common', gov: 'common',
    items: [
      { label: '임원/대표', emoji: '👑', children: [
        { label: '의사결정', emoji: '📢', children: [
          { label: '결재 라인', emoji: '✍️' },
        ] },
      ] },
    ],
  },
];

/* ─────────────────────────────────────────────────────────
   2) flat 칩 (CompanyGuidelinesPage 상수 기반)
   scope=ai-studio, gov 별로 분리
   ───────────────────────────────────────────────────────── */
const FLAT_CHIPS = [
  // 업무지침
  { scope: 'ai-studio', gov: 'work-guide', axis: '분류별',   labels: ['문서', '영상', '음성'] },
  { scope: 'ai-studio', gov: 'work-guide', axis: '교육별',   labels: ['프롬프트', '번역', '윤리'] },
  { scope: 'ai-studio', gov: 'work-guide', axis: '급수별',   labels: ['일반', '전문', '교육'] },
  { scope: 'ai-studio', gov: 'work-guide', axis: '세부급수', labels: ['1급','2급','3급','4급','5급','6급','7급','8급'] },
  { scope: 'ai-studio', gov: 'work-guide', axis: 'DB별',     labels: ['커리큘럼','문제은행','교재','마케팅'] },
  // 사내규정
  { scope: 'ai-studio', gov: 'company-rule', axis: '유형',    labels: ['규정','준규정','선택규정'] },
  { scope: 'ai-studio', gov: 'company-rule', axis: '업무별',  labels: ['문서','영상','음성','교육','마케팅','상담','기획','기타'] },
  { scope: 'ai-studio', gov: 'company-rule', axis: '부서별',  labels: ['경영','개발','마케팅','인사','영업','강사팀','기획','홈페이지','상담','총무','관리'] },
  { scope: 'ai-studio', gov: 'company-rule', axis: '직급별',  labels: ['대표','임원','팀장','강사','신입','알바','외부'] },
  { scope: 'ai-studio', gov: 'company-rule', axis: '계약',    labels: ['정규직','계약직','파트타임','외주','기타'] },
  { scope: 'ai-studio', gov: 'company-rule', axis: '작성자',  labels: ['회사','경영','영업','홈페이지','마케팅','개발','인사','관리','상담','강사팀','신입','팀장','임원','대표'] },
];

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

function seedTree(db, { axis, scope, gov, items }) {
  let order = 0;
  const walk = (node, parentPath, parentId, level) => {
    const path = [...parentPath, node.label];
    const id = tid([scope, gov, axis, ...path]);
    insertNode(db, {
      taxonomy_id: id,
      scope, gov, axis, level,
      parent_id: parentId,
      label: node.label,
      emoji: node.emoji || null,
      sort_order: order++,
    });
    if (node.children) {
      const childLevel = level === 'large' ? 'medium' : 'small';
      node.children.forEach((c) => walk(c, path, id, childLevel));
    }
  };
  items.forEach((n) => walk(n, [], null, 'large'));
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

function ensureSeedFlag(db) {
  db.prepare(`INSERT OR IGNORE INTO app_settings (key, data, updated_at)
              VALUES ('work_class_seed_done', ?, datetime('now'))`).run(JSON.stringify({ at: new Date().toISOString() }));
}

function main() {
  const db = openDb();
  const before = db.prepare('SELECT COUNT(*) c FROM work_class_taxonomy').get().c;

  const tx = db.transaction(() => {
    LMS_TREES.forEach((t) => seedTree(db, t));
    FLAT_CHIPS.forEach((f) => seedFlat(db, f));
    ensureSeedFlag(db);
  });
  tx();

  const after = db.prepare('SELECT COUNT(*) c FROM work_class_taxonomy').get().c;
  console.log(`[seed-taxonomy] before=${before} after=${after} inserted=${after - before}`);
  console.log('[seed-taxonomy] done. source=seed, locked=1 — 사용자 편집 시 런타임에서 승격됩니다.');
  db.close();
}

if (require.main === module) main();
