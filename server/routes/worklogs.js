const express = require('express');
const router = express.Router();
const { getDB } = require('../db/init');

// GET /api/worklogs — 전체 업무일지 조회
router.get('/', (req, res) => {
  const db = getDB();
  const rows = db.prepare('SELECT log_key, data, updated_at FROM work_logs ORDER BY log_key DESC').all();
  const result = {};
  for (const row of rows) {
    try {
      result[row.log_key] = JSON.parse(row.data);
    } catch {
      result[row.log_key] = row.data;
    }
  }
  res.json(result);
});

// GET /api/worklogs/:key — 특정 일자 조회
router.get('/:key', (req, res) => {
  const db = getDB();
  const row = db.prepare('SELECT * FROM work_logs WHERE log_key = ?').get(req.params.key);
  if (!row) return res.status(404).json({ error: 'Not found' });
  try {
    res.json({ log_key: row.log_key, data: JSON.parse(row.data), updated_at: row.updated_at });
  } catch {
    res.json(row);
  }
});

// POST /api/worklogs/:key — 업무일지 저장/수정 (upsert)
router.post('/:key', (req, res) => {
  try {
    const db = getDB();
    const key = req.params.key;
    const logData = req.body.data;

    if (!logData || !logData.employeeId || !logData.date) {
      return res.status(400).json({ success: false, error: 'employeeId and date are required' });
    }

    const data = JSON.stringify(logData);

    db.prepare(`
      INSERT INTO work_logs (log_key, data, updated_at)
      VALUES (?, ?, datetime('now'))
      ON CONFLICT(log_key) DO UPDATE SET data = excluded.data, updated_at = datetime('now')
    `).run(key, data);

    res.json({ success: true, log_key: key });
  } catch (err) {
    console.error('Worklog save error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
