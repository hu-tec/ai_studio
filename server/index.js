require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const { initDB, closeDB } = require('./db/init');

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Initialize database
initDB();

// Serve static HTML files
app.use(express.static(path.join(__dirname, '..', 'public')));

// API routes
app.use('/api/interviews', require('./routes/interviews'));
app.use('/api/worklogs', require('./routes/worklogs'));
app.use('/api/upload', require('./routes/uploads'));
app.use('/api/storage', require('./routes/storage'));
// tesol, level-test → work_studio로 이관 완료

// 범용 CRUD API (JSON blob 테이블)
const { createGenericRouter } = require('./routes/generic');
app.use('/api/pledges', createGenericRouter('pledges', 'pledge_id'));
app.use('/api/lesson-plans', createGenericRouter('lesson_plans', 'plan_id'));
app.use('/api/attendance', createGenericRouter('attendance_records', 'record_key'));
app.use('/api/meetings', createGenericRouter('meetings', 'meeting_id'));
app.use('/api/outbound-calls', createGenericRouter('outbound_calls', 'call_id'));
app.use('/api/photos', createGenericRouter('photos', 'photo_id'));
app.use('/api/schedules', createGenericRouter('schedules', 'schedule_id'));
app.use('/api/rules', createGenericRouter('rules', 'rule_id'));
app.use('/api/eval-criteria', createGenericRouter('eval_criteria', 'criteria_id'));
app.use('/api/work-materials', createGenericRouter('work_materials', 'material_id'));
app.use('/api/company-guidelines', createGenericRouter('company_guidelines', 'guideline_id'));
app.use('/api/page-memos', createGenericRouter('page_memos', 'memo_id'));
app.use('/api/work-hub', createGenericRouter('work_hub', 'post_id'));
app.use('/api/work-hub-comments', createGenericRouter('work_hub_comments', 'comment_id'));

// app_settings API (localStorage → DB 이관)
app.get('/api/settings', (req, res) => {
  const db = require('./db/init').getDB();
  const rows = db.prepare('SELECT key, data, updated_at FROM app_settings').all();
  const result = {};
  for (const r of rows) { try { result[r.key] = JSON.parse(r.data); } catch { result[r.key] = r.data; } }
  res.json(result);
});
app.get('/api/settings/:key', (req, res) => {
  const db = require('./db/init').getDB();
  const row = db.prepare('SELECT data FROM app_settings WHERE key = ?').get(req.params.key);
  if (!row) return res.json(null);
  try { res.json(JSON.parse(row.data)); } catch { res.json(row.data); }
});
app.put('/api/settings/:key', (req, res) => {
  const db = require('./db/init').getDB();
  const data = JSON.stringify(req.body);
  db.prepare('INSERT OR REPLACE INTO app_settings (key, data, updated_at) VALUES (?, ?, datetime(\'now\'))').run(req.params.key, data);
  res.json({ success: true });
});
app.delete('/api/settings/:key', (req, res) => {
  const db = require('./db/init').getDB();
  db.prepare('DELETE FROM app_settings WHERE key = ?').run(req.params.key);
  res.json({ success: true });
});

// 서버 디스크 용량 API
app.get('/api/disk-usage', async (req, res) => {
  const { execSync } = require('child_process');
  try {
    // df: 전체 디스크
    const dfOut = execSync("df -B1 / | tail -1").toString().trim();
    const dfParts = dfOut.split(/\s+/);
    const total = parseInt(dfParts[1]) || 0;
    const used = parseInt(dfParts[2]) || 0;
    const available = parseInt(dfParts[3]) || 0;

    // uploads 폴더 크기
    let uploadsSize = 0;
    try {
      const duOut = execSync("du -sb public/uploads 2>/dev/null || echo '0'").toString().trim();
      uploadsSize = parseInt(duOut.split(/\s/)[0]) || 0;
    } catch {}

    // DB 파일 크기
    let dbSize = 0;
    try {
      const fs = require('fs');
      const dbPath = require('path').join(__dirname, 'db', 'hutechc.db');
      if (fs.existsSync(dbPath)) dbSize = fs.statSync(dbPath).size;
    } catch {}

    // S3 버킷 사용량
    let s3Size = 0, s3Count = 0;
    try {
      const { listAllS3Objects } = require('./utils/s3');
      const objs = await listAllS3Objects();
      s3Count = objs.length;
      s3Size = objs.reduce((sum, o) => sum + (o.size || 0), 0);
    } catch {}

    res.json({ total, used, available, uploadsSize, dbSize, s3Size, s3Count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// React SPA fallback (/app/*)
app.get('/app/*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'app', 'index.html'));
});

// Root → home.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'home.html'));
});

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Graceful shutdown — PM2 reload/stop 시 DB 안전 종료
function gracefulShutdown(signal) {
  console.log(`${signal} received — shutting down gracefully...`);
  server.close(() => {
    console.log('HTTP server closed');
    closeDB();
    process.exit(0);
  });
  // 5초 안에 안 끝나면 강제 종료
  setTimeout(() => {
    console.error('Forced shutdown after timeout');
    closeDB();
    process.exit(1);
  }, 4500);
}
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
