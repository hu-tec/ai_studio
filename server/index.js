require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const { initDB } = require('./db/init');

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

// 서버 디스크 용량 API
app.get('/api/disk-usage', (req, res) => {
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

    res.json({ total, used, available, uploadsSize, dbSize });
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
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
