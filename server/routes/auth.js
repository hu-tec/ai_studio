const express = require('express');
const { getDB } = require('../db/init');
const { hashPassword, verifyPassword, generateToken } = require('../utils/password');
const { requireAuth, requireTier, getCookieToken, loadUser, SESSION_COOKIE } = require('../middleware/auth');

const router = express.Router();

const TIERS = ['admin', 'manager', 'user', 'external'];
const SESSION_TTL_MS = 14 * 24 * 60 * 60 * 1000; // 14일

function setSessionCookie(res, token) {
  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.COOKIE_SECURE === 'true',
    maxAge: SESSION_TTL_MS,
    path: '/',
  });
}

function sanitizeUser(u) {
  return { id: u.id, email: u.email, name: u.name, tier: u.tier, status: u.status, last_login_at: u.last_login_at, created_at: u.created_at };
}

// POST /api/auth/login
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: '이메일과 비밀번호를 입력하세요' });

    const db = getDB();
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user || user.status !== 'active') return res.status(401).json({ error: '계정을 찾을 수 없거나 비활성 상태입니다' });
    if (!verifyPassword(password, user.password_hash)) return res.status(401).json({ error: '비밀번호가 일치하지 않습니다' });

    const token = generateToken();
    const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString();
    db.prepare('INSERT INTO user_sessions (user_id, token, expires_at) VALUES (?, ?, ?)').run(user.id, token, expiresAt);
    db.prepare("UPDATE users SET last_login_at = datetime('now') WHERE id = ?").run(user.id);

    setSessionCookie(res, token);
    res.json(sanitizeUser(user));
  } catch (err) {
    console.error('login error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  try {
    const token = getCookieToken(req);
    if (token) {
      const db = getDB();
      db.prepare('DELETE FROM user_sessions WHERE token = ?').run(token);
    }
    res.clearCookie(SESSION_COOKIE, { path: '/' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/me
router.get('/me', (req, res) => {
  const user = loadUser(getCookieToken(req));
  if (!user) return res.json(null);
  res.json(sanitizeUser(user));
});

// GET /api/auth/users — admin/manager
router.get('/users', requireAuth, requireTier('admin', 'manager'), (req, res) => {
  const db = getDB();
  const rows = db.prepare(`
    SELECT id, email, name, tier, status, last_login_at, created_at, updated_at
    FROM users ORDER BY created_at DESC
  `).all();
  res.json(rows);
});

// POST /api/auth/users — admin
router.post('/users', requireAuth, requireTier('admin'), (req, res) => {
  try {
    const { email, password, name, tier } = req.body || {};
    if (!email || !password || !name || !tier) return res.status(400).json({ error: 'email, password, name, tier 모두 필수' });
    if (!TIERS.includes(tier)) return res.status(400).json({ error: `tier는 ${TIERS.join('/')} 중 하나` });

    const db = getDB();
    const info = db.prepare(
      'INSERT INTO users (email, password_hash, name, tier) VALUES (?, ?, ?, ?)'
    ).run(email, hashPassword(password), name, tier);
    res.json({ id: info.lastInsertRowid });
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') return res.status(409).json({ error: '이미 존재하는 이메일' });
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/auth/users/:id — admin
router.put('/users/:id', requireAuth, requireTier('admin'), (req, res) => {
  try {
    const { email, password, name, tier, status } = req.body || {};
    const db = getDB();
    const existing = db.prepare('SELECT id FROM users WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: '사용자 없음' });

    const sets = [];
    const vals = [];
    if (email) { sets.push('email = ?'); vals.push(email); }
    if (password) { sets.push('password_hash = ?'); vals.push(hashPassword(password)); }
    if (name) { sets.push('name = ?'); vals.push(name); }
    if (tier) {
      if (!TIERS.includes(tier)) return res.status(400).json({ error: `tier는 ${TIERS.join('/')} 중 하나` });
      sets.push('tier = ?'); vals.push(tier);
    }
    if (status) { sets.push('status = ?'); vals.push(status); }
    if (!sets.length) return res.json({ success: true, noop: true });

    sets.push("updated_at = datetime('now')");
    vals.push(req.params.id);
    db.prepare(`UPDATE users SET ${sets.join(', ')} WHERE id = ?`).run(...vals);
    res.json({ success: true });
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') return res.status(409).json({ error: '이미 존재하는 이메일' });
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/auth/users/:id — admin
router.delete('/users/:id', requireAuth, requireTier('admin'), (req, res) => {
  try {
    const db = getDB();
    db.prepare('DELETE FROM user_sessions WHERE user_id = ?').run(req.params.id);
    db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
