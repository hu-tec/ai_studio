const express = require('express');
const router = express.Router();
const { getDB } = require('../db/init');

// GET /api/tesol — 전체 신청자 목록
router.get('/', (req, res) => {
  const db = getDB();
  const rows = db.prepare('SELECT * FROM tesol_applicants ORDER BY created_at DESC').all();
  const result = rows.map((r) => ({
    ...r,
    basic: JSON.parse(r.basic || '{}'),
    application: JSON.parse(r.application || '{}'),
    extra: JSON.parse(r.extra || '{}'),
  }));
  res.json(result);
});

// GET /api/tesol/:id — 신청자 상세
router.get('/:id', (req, res) => {
  const db = getDB();
  const row = db.prepare('SELECT * FROM tesol_applicants WHERE applicant_id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json({
    ...row,
    basic: JSON.parse(row.basic || '{}'),
    application: JSON.parse(row.application || '{}'),
    extra: JSON.parse(row.extra || '{}'),
  });
});

// POST /api/tesol — 신규 신청
router.post('/', (req, res) => {
  try {
    const db = getDB();
    const b = req.body;

    db.prepare(`
      INSERT INTO tesol_applicants (applicant_id, status, applied_at, basic, application, extra)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      b.applicant_id,
      b.status || 'pending',
      b.applied_at || new Date().toISOString(),
      JSON.stringify(b.basic || {}),
      JSON.stringify(b.application || {}),
      JSON.stringify(b.extra || {})
    );

    res.json({ success: true, applicant_id: b.applicant_id });
  } catch (err) {
    console.error('TESOL save error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/tesol/:id — 상태 변경 (승인/거절)
router.put('/:id', (req, res) => {
  try {
    const db = getDB();
    const b = req.body;

    db.prepare(`
      UPDATE tesol_applicants
      SET status = ?, rejection_reason = ?, updated_at = datetime('now')
      WHERE applicant_id = ?
    `).run(b.status || 'pending', b.rejection_reason || null, req.params.id);

    res.json({ success: true });
  } catch (err) {
    console.error('TESOL update error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/tesol/:id — 삭제
router.delete('/:id', (req, res) => {
  try {
    const db = getDB();
    db.prepare('DELETE FROM tesol_applicants WHERE applicant_id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error('TESOL delete error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
