const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { uploadToS3, makeS3Key } = require('../utils/s3');

// POST /api/upload — 단일 파일 S3 업로드
router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const category = req.body.category || 'general';
    const s3Key = makeS3Key(category, req.file.originalname);
    const s3Url = await uploadToS3(req.file.buffer, s3Key, req.file.mimetype);

    res.json({
      success: true,
      s3_key: s3Key,
      s3_url: s3Url || 'local_only',
      original_name: req.file.originalname,
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
