const express = require('express');
const { getDB } = require('../db/init');

// 범용 CRUD 라우터 팩토리: JSON blob 테이블용
// 사용법: app.use('/api/meetings', createGenericRouter('meetings', 'meeting_id'))
//
// opts:
//   softDelete  → DELETE 요청을 UPDATE removed=1 로 변환 (hard delete 금지)
//   listFilter  → GET / 시 removed=0 필터 자동 적용
//   revisionLock → PUT 시 req.body.revision 검사 후 revision+1
function createGenericRouter(tableName, idColumn, opts = {}) {
  const router = express.Router();
  const softDelete = !!opts.softDelete;
  const listFilter = !!opts.listFilter;
  const revisionLock = !!opts.revisionLock;
  const tsCol = (tableName === 'level_tests' || tableName === 'pledges') ? 'created_at' : 'updated_at';

  // GET / — 전체 목록 (소프트 삭제 제외 옵션)
  router.get('/', (req, res) => {
    try {
      const db = getDB();
      const where = listFilter ? 'WHERE removed = 0' : '';
      const rows = db.prepare(`SELECT * FROM ${tableName} ${where} ORDER BY rowid DESC`).all();
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
        INSERT INTO ${tableName} (${idColumn}, data, ${tsCol})
        VALUES (?, ?, datetime('now'))
        ON CONFLICT(${idColumn}) DO UPDATE SET data = excluded.data, ${tsCol} = datetime('now')
      `).run(id, data);

      res.json({ success: true, [idColumn]: id });
    } catch (err) {
      console.error(`${tableName} save error:`, err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // PUT /:id — 수정 (revisionLock 옵션 시 낙관적 락 적용)
  router.put('/:id', (req, res) => {
    try {
      const db = getDB();
      const data = JSON.stringify(req.body.data || req.body);
      if (revisionLock) {
        const expected = Number(req.body.revision) || 0;
        const row = db.prepare(`SELECT revision FROM ${tableName} WHERE ${idColumn} = ?`).get(req.params.id);
        if (row && expected && row.revision !== expected) {
          return res.status(409).json({ success: false, error: 'revision conflict', currentRevision: row.revision });
        }
        db.prepare(`UPDATE ${tableName} SET data = ?, revision = revision + 1, ${tsCol} = datetime('now') WHERE ${idColumn} = ?`).run(data, req.params.id);
        const after = db.prepare(`SELECT revision FROM ${tableName} WHERE ${idColumn} = ?`).get(req.params.id);
        return res.json({ success: true, revision: after && after.revision });
      }
      db.prepare(`UPDATE ${tableName} SET data = ?, ${tsCol} = datetime('now') WHERE ${idColumn} = ?`).run(data, req.params.id);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // DELETE /:id — 삭제 (softDelete 옵션 시 removed=1 플래그만)
  router.delete('/:id', (req, res) => {
    try {
      const db = getDB();
      if (softDelete) {
        db.prepare(`UPDATE ${tableName} SET removed = 1, revision = revision + 1, ${tsCol} = datetime('now') WHERE ${idColumn} = ?`).run(req.params.id);
      } else {
        db.prepare(`DELETE FROM ${tableName} WHERE ${idColumn} = ?`).run(req.params.id);
      }
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  return router;
}

module.exports = { createGenericRouter };
