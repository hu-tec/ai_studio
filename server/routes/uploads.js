const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const upload = require('../middleware/upload');
const { uploadToS3, makeS3Key } = require('../utils/s3');

const UPLOAD_DIR = path.join(__dirname, '..', '..', 'public', 'uploads');

// POST /api/upload — S3 업로드, 실패 시 로컬 저장
router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const category = req.body.category || 'general';
    const s3Key = makeS3Key(category, req.file.originalname);

    // S3 업로드 시도
    let s3Url = null;
    try {
      s3Url = await uploadToS3(req.file.buffer, s3Key, req.file.mimetype);
    } catch (s3Err) {
      console.warn('S3 upload failed, saving locally:', s3Err.message);
    }

    // S3 실패 시 로컬 저장
    if (!s3Url) {
      const date = new Date().toISOString().slice(0, 10);
      const localDir = path.join(UPLOAD_DIR, category, date);
      fs.mkdirSync(localDir, { recursive: true });
      const safeName = `${Date.now()}_${req.file.originalname.replace(/[^a-zA-Z0-9가-힣._-]/g, '_')}`;
      const localPath = path.join(localDir, safeName);
      fs.writeFileSync(localPath, req.file.buffer);
      s3Url = `/uploads/${category}/${date}/${safeName}`;
    }

    res.json({
      success: true,
      s3_key: s3Key,
      s3_url: s3Url,
      original_name: req.file.originalname,
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
