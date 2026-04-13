const { getDB } = require('../db/init');

const SESSION_COOKIE = 'ws_session';

function getCookieToken(req) {
  const cookie = req.headers.cookie || '';
  const match = cookie.match(/(?:^|;\s*)ws_session=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

function loadUser(token) {
  if (!token) return null;
  const db = getDB();
  return db.prepare(`
    SELECT u.id, u.email, u.name, u.tier, u.status
    FROM user_sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.token = ? AND s.expires_at > datetime('now') AND u.status = 'active'
  `).get(token) || null;
}

function requireAuth(req, res, next) {
  const user = loadUser(getCookieToken(req));
  if (!user) return res.status(401).json({ error: '로그인이 필요합니다' });
  req.user = user;
  next();
}

function requireTier(...tiers) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: '로그인이 필요합니다' });
    if (!tiers.includes(req.user.tier)) {
      return res.status(403).json({ error: `권한이 없습니다 (필요: ${tiers.join('/')})` });
    }
    next();
  };
}

module.exports = { requireAuth, requireTier, getCookieToken, loadUser, SESSION_COOKIE };
