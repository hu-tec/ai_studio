const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { uploadToS3, listS3Objects, listAllS3Objects, deleteS3Object, makeS3Key } = require('../utils/s3');

// GET /api/storage?prefix=uploads/general/
router.get('/', async (req, res) => {
  try {
    const prefix = req.query.prefix || '';
    const result = await listS3Objects(prefix);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/storage/info — 전체 S3 사용량
router.get('/info', async (req, res) => {
  try {
    const all = await listAllS3Objects();
    const totalSize = all.reduce((sum, o) => sum + (o.size || 0), 0);
    const totalCount = all.length;

    // 카테고리별 집계
    const categories = {};
    for (const obj of all) {
      const parts = obj.key.split('/');
      const cat = parts.length >= 2 ? parts[1] : '(root)';
      if (!categories[cat]) categories[cat] = { count: 0, size: 0 };
      categories[cat].count++;
      categories[cat].size += obj.size || 0;
    }

    res.json({ totalSize, totalCount, categories });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/storage/upload — 카테고리 지정 업로드
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file' });

    const category = req.body.category || 'general';
    const key = makeS3Key(category, req.file.originalname);
    const url = await uploadToS3(req.file.buffer, key, req.file.mimetype);

    if (!url) return res.status(500).json({ error: 'S3 not configured' });

    res.json({ success: true, key, url, name: req.file.originalname, size: req.file.size });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/storage — body: { key: "uploads/..." }
router.delete('/', async (req, res) => {
  try {
    const { key } = req.body;
    if (!key) return res.status(400).json({ error: 'key required' });
    await deleteS3Object(key);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
