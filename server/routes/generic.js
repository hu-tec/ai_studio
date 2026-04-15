const express = require('express');
const { getDB } = require('../db/init');

// 범용 CRUD 라우터 팩토리
// 사용법:
//   app.use('/api/meetings', createGenericRouter('meetings', 'meeting_id'))          // blob-only
//   app.use('/api/work-class-taxonomy',
//     createGenericRouter('work_class_taxonomy', 'taxonomy_id', {
//       flatColumns: ['scope','gov','axis','level','parent_id','label','emoji','sort_order','source','locked'],
//       hasDataBlob: true,
//     }))
//
// opts:
//   softDelete     → DELETE 요청을 UPDATE removed=1 로 변환 (hard delete 금지)
//   listFilter     → GET / 시 removed=0 필터 자동 적용
//   revisionLock   → PUT 시 req.body.revision 검사 후 revision+1
//   flatColumns    → 본문에서 이 컬럼들을 blob 이 아닌 실제 SQL 컬럼으로 기록 (flat 스키마 테이블)
//   jsonFlatColumns→ flatColumns 중 JSON TEXT 로 저장되는 컬럼 (예: facets, gov_matrix) — 기록 시 stringify, 읽기 시 parse
//   hasDataBlob    → flatColumns 사용 시 data TEXT 컬럼이 존재하는지 (기본 true)
function createGenericRouter(tableName, idColumn, opts = {}) {
  const router = express.Router();
  const softDelete = !!opts.softDelete;
  const listFilter = !!opts.listFilter;
  const revisionLock = !!opts.revisionLock;
  const flatColumns = Array.isArray(opts.flatColumns) ? opts.flatColumns : null;
  const flatSet = new Set(flatColumns || []);
  const jsonFlatColumns = new Set(opts.jsonFlatColumns || []);
  const hasDataBlob = flatColumns ? (opts.hasDataBlob !== false) : true;
  const tsCol = (tableName === 'level_tests' || tableName === 'pledges') ? 'created_at' : 'updated_at';

  // 시스템/관리 필드 — 본문에 섞여 있어도 flat 컬럼이나 blob 에 기록하지 않음 (서버가 관리)
  const SYSTEM_FIELDS = new Set([
    'id', idColumn, 'revision', 'removed', 'updated_at', 'created_at',
  ]);

  // 본문을 flat 컬럼 / data blob 으로 분리
  function splitBody(body) {
    const flat = {};
    const blob = {};
    for (const [k, v] of Object.entries(body || {})) {
      if (SYSTEM_FIELDS.has(k)) continue;
      if (flatSet.has(k)) {
        flat[k] = jsonFlatColumns.has(k) ? (v == null ? null : JSON.stringify(v)) : v;
      } else if (k === 'data' && hasDataBlob) {
        if (v && typeof v === 'object') Object.assign(blob, v);
      } else if (hasDataBlob) {
        blob[k] = v;
      }
    }
    return { flat, blob };
  }

  function parseRow(r) {
    if (!r) return r;
    const out = { ...r };
    if (hasDataBlob && typeof out.data === 'string') {
      try { out.data = JSON.parse(out.data); } catch {}
    }
    for (const c of jsonFlatColumns) {
      if (typeof out[c] === 'string') {
        try { out[c] = JSON.parse(out[c]); } catch {}
      }
    }
    return out;
  }

  // GET / — 전체 목록 (소프트 삭제 제외 옵션)
  router.get('/', (req, res) => {
    try {
      const db = getDB();
      const where = listFilter ? 'WHERE removed = 0' : '';
      const rows = db.prepare(`SELECT * FROM ${tableName} ${where} ORDER BY rowid DESC`).all();
      if (flatColumns) {
        return res.json(rows.map(parseRow));
      }
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
      if (flatColumns) return res.json(parseRow(row));
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

      if (flatColumns) {
        const { flat, blob } = splitBody(b);
        const cols = Object.keys(flat);
        const insertCols = [idColumn, ...cols, ...(hasDataBlob ? ['data'] : []), tsCol];
        const placeholders = [
          '?',
          ...cols.map(() => '?'),
          ...(hasDataBlob ? ['?'] : []),
          `datetime('now')`,
        ];
        const values = [
          id,
          ...cols.map((c) => flat[c]),
          ...(hasDataBlob ? [JSON.stringify(blob)] : []),
        ];
        const updateParts = [
          ...cols.map((c) => `${c} = excluded.${c}`),
          ...(hasDataBlob ? [`data = excluded.data`] : []),
          `${tsCol} = datetime('now')`,
        ];
        db.prepare(`
          INSERT INTO ${tableName} (${insertCols.join(', ')})
          VALUES (${placeholders.join(', ')})
          ON CONFLICT(${idColumn}) DO UPDATE SET ${updateParts.join(', ')}
        `).run(...values);

        return res.json({ success: true, [idColumn]: id });
      }

      // blob-only 레거시 경로
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

      if (revisionLock) {
        const expected = Number(req.body.revision) || 0;
        const row = db.prepare(`SELECT revision FROM ${tableName} WHERE ${idColumn} = ?`).get(req.params.id);
        if (row && expected && row.revision !== expected) {
          return res.status(409).json({ success: false, error: 'revision conflict', currentRevision: row.revision });
        }
      }

      if (flatColumns) {
        const { flat, blob } = splitBody(req.body);
        const cols = Object.keys(flat);
        const setParts = [
          ...cols.map((c) => `${c} = ?`),
          ...(hasDataBlob ? [`data = ?`] : []),
          ...(revisionLock ? [`revision = revision + 1`] : []),
          `${tsCol} = datetime('now')`,
        ];
        const values = [
          ...cols.map((c) => flat[c]),
          ...(hasDataBlob ? [JSON.stringify(blob)] : []),
          req.params.id,
        ];
        db.prepare(`UPDATE ${tableName} SET ${setParts.join(', ')} WHERE ${idColumn} = ?`).run(...values);

        if (revisionLock) {
          const after = db.prepare(`SELECT revision FROM ${tableName} WHERE ${idColumn} = ?`).get(req.params.id);
          return res.json({ success: true, revision: after && after.revision });
        }
        return res.json({ success: true });
      }

      // blob-only 레거시 경로
      const data = JSON.stringify(req.body.data || req.body);
      if (revisionLock) {
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
