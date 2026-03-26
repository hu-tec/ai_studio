const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { getDB } = require('../db/init');
const { uploadToS3, makeS3Key } = require('../utils/s3');

const FILE_FIELDS = [
  { name: 'docResume', maxCount: 1 },
  { name: 'docPortfolio', maxCount: 1 },
  { name: 'docEtc', maxCount: 1 },
];

// POST /api/interviews — 면접 폼 제출
router.post('/', upload.fields(FILE_FIELDS), async (req, res) => {
  try {
    const db = getDB();
    const b = req.body;

    const insertInterview = db.prepare(`
      INSERT INTO interviews (
        form_type, name, interview_date, start_date, available_months,
        website_viewed, support_field, work_type, commute_method, commute_time,
        birth_date, age, experience, driving, car_owned,
        religion, pt, family, marriage, children,
        skills, english, schedule_mon, schedule_tue, schedule_wed,
        schedule_thu, schedule_fri, mbti, mbti_scores, personality_answers,
        summary1, summary2, summary3, edu_feedback, contract_data,
        submitted_html, lecture_type
      ) VALUES (
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?
      )
    `);

    const insertFile = db.prepare(`
      INSERT INTO interview_files (interview_id, file_type, original_name, s3_key, s3_url)
      VALUES (?, ?, ?, ?, ?)
    `);

    // 면접 데이터 저장 (동기)
    const result = insertInterview.run(
      b.form_type || 'unknown',
      b.name || null,
      b.interview_date || null,
      b.start_date || null,
      b.available_months || null,
      b.website_viewed || null,
      b.support_field || null,
      b.work_type || null,
      b.commute_method || null,
      b.commute_time || null,
      b.birth_date || null,
      b.age || null,
      b.experience || null,
      b.driving || null,
      b.car_owned || null,
      b.religion || null,
      b.pt || null,
      b.family || null,
      b.marriage || null,
      b.children || null,
      b.skills || null,
      b.english || null,
      b.schedule_mon || null,
      b.schedule_tue || null,
      b.schedule_wed || null,
      b.schedule_thu || null,
      b.schedule_fri || null,
      b.mbti || null,
      b.mbti_scores || null,
      b.personality_answers || null,
      b.summary1 || null,
      b.summary2 || null,
      b.summary3 || null,
      b.edu_feedback || null,
      b.contract_data || null,
      b.submitted_html || null,
      b.lecture_type || null
    );

    const interviewId = result.lastInsertRowid;

    // 파일 업로드 (비동기, DB 저장 후 별도 처리)
    if (req.files) {
      for (const fieldName of ['docResume', 'docPortfolio', 'docEtc']) {
        const files = req.files[fieldName];
        if (files && files.length > 0) {
          const file = files[0];
          const s3Key = makeS3Key(b.form_type || 'unknown', file.originalname);
          let s3Url = null;
          try {
            s3Url = await uploadToS3(file.buffer, s3Key, file.mimetype);
          } catch (uploadErr) {
            console.error('S3 upload failed for', fieldName, uploadErr.message);
          }
          insertFile.run(
            interviewId,
            fieldName,
            file.originalname,
            s3Key,
            s3Url || 'local_only'
          );
        }
      }
    }

    res.json({ success: true, id: Number(interviewId) });
  } catch (err) {
    console.error('Interview save error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/interviews — 면접 목록
router.get('/', (req, res) => {
  const db = getDB();
  const rows = db.prepare(`
    SELECT id, form_type, name, interview_date, support_field, mbti, created_at
    FROM interviews ORDER BY created_at DESC
  `).all();
  res.json(rows);
});

// GET /api/interviews/:id — 면접 상세
router.get('/:id', (req, res) => {
  const db = getDB();
  const interview = db.prepare('SELECT * FROM interviews WHERE id = ?').get(req.params.id);
  if (!interview) return res.status(404).json({ error: 'Not found' });

  const files = db.prepare('SELECT * FROM interview_files WHERE interview_id = ?').all(req.params.id);
  res.json({ ...interview, files });
});

module.exports = router;
