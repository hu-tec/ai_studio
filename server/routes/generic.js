const express = require('express');
const { getDB } = require('../db/init');

// 범용 CRUD 라우터 팩토리: JSON blob 테이블용
// 사용법: app.use('/api/meetings', createGenericRouter('meetings', 'meeting_id'))
function createGenericRouter(tableName, idColumn) {
  const router = express.Router();

  // GET / — 전체 목록
  router.get('/', (req, res) => {
    try {
      const db = getDB();
      const rows = db.prepare(`SELECT * FROM ${tableName} ORDER BY rowid DESC`).all();
      const result = rows.map((r) => {
        try { return { ...r, data: JSON.parse(r.data) }; } catch { return r; }
      });
      res.json(result);
    } catch (err) {
      console.error(`${tableName} list error:`, err);
      res.status(500).json({ error: err.message });
    }
  });

  // GET /:id — 단건 조회
  router.get('/:id', (req, res) => {
    try {
      const db = getDB();
      const row = db.prepare(`SELECT * FROM ${tableName} WHERE ${idColumn} = ?`).get(req.params.id);
      if (!row) return res.status(404).json({ error: 'Not found' });
      try { row.data = JSON.parse(row.data); } catch {}
      res.json(row);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // POST / — 생성 (upsert)
  router.post('/', (req, res) => {
    try {
      const db = getDB();
      const b = req.body;
      const id = b[idColumn] || `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const data = JSON.stringify(b.data || b);

      db.prepare(`
        INSERT INTO ${tableName} (${idColumn}, data, ${tableName === 'level_tests' || tableName === 'pledges' ? 'created_at' : 'updated_at'})
        VALUES (?, ?, datetime('now'))
        ON CONFLICT(${idColumn}) DO UPDATE SET data = excluded.data, ${tableName === 'level_tests' || tableName === 'pledges' ? 'created_at' : 'updated_at'} = datetime('now')
      `).run(id, data);

      res.json({ success: true, [idColumn]: id });
    } catch (err) {
      console.error(`${tableName} save error:`, err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // PUT /:id — 수정
  router.put('/:id', (req, res) => {
    try {
      const db = getDB();
      const data = JSON.stringify(req.body.data || req.body);
      const col = tableName === 'level_tests' || tableName === 'pledges' ? 'created_at' : 'updated_at';
      db.prepare(`UPDATE ${tableName} SET data = ?, ${col} = datetime('now') WHERE ${idColumn} = ?`).run(data, req.params.id);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // DELETE /:id — 삭제
  router.delete('/:id', (req, res) => {
    try {
      const db = getDB();
      db.prepare(`DELETE FROM ${tableName} WHERE ${idColumn} = ?`).run(req.params.id);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  return router;
}

module.exports = { createGenericRouter };
