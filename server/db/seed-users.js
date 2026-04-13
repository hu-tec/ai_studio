require('dotenv').config();
const { initDB, getDB, closeDB } = require('./init');
const { hashPassword } = require('../utils/password');

const SEED_USERS = [
  {
    email: process.env.SEED_ADMIN_EMAIL || 'admin@hutechc.local',
    password: process.env.SEED_ADMIN_PASSWORD || 'admin123!',
    name: '관리자(개발자/수연)',
    tier: 'admin',
  },
  {
    email: process.env.SEED_MANAGER_EMAIL || 'manager@hutechc.local',
    password: process.env.SEED_MANAGER_PASSWORD || 'manager123!',
    name: '팀장(가연)',
    tier: 'manager',
  },
  {
    email: process.env.SEED_USER_EMAIL || 'user@hutechc.local',
    password: process.env.SEED_USER_PASSWORD || 'user123!',
    name: '내부 사용자',
    tier: 'user',
  },
  {
    email: process.env.SEED_EXTERNAL_EMAIL || 'guest@hutechc.local',
    password: process.env.SEED_EXTERNAL_PASSWORD || 'guest123!',
    name: '외부인',
    tier: 'external',
  },
];

function main() {
  initDB();
  const db = getDB();

  const upsert = db.prepare(`
    INSERT INTO users (email, password_hash, name, tier, status)
    VALUES (?, ?, ?, ?, 'active')
    ON CONFLICT(email) DO UPDATE SET
      password_hash = excluded.password_hash,
      name = excluded.name,
      tier = excluded.tier,
      status = 'active',
      updated_at = datetime('now')
  `);

  console.log('=== 시드 계정 생성/업데이트 ===');
  for (const u of SEED_USERS) {
    upsert.run(u.email, hashPassword(u.password), u.name, u.tier);
    console.log(`  ✓ [${u.tier.padEnd(8)}] ${u.email}  —  ${u.name}`);
  }

  const rows = db.prepare('SELECT id, email, tier, status FROM users ORDER BY id').all();
  console.log('\n=== 현재 users 테이블 ===');
  console.table(rows);

  closeDB();
  console.log('\n완료. 배포 전 반드시 비밀번호 변경할 것.');
}

main();
