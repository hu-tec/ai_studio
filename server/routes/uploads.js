const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const upload = require('../middleware/upload');
const { uploadToS3, makeS3Key, getS3Object } = require('../utils/s3');

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

// GET /api/upload/download?url=<s3_url>&name=<filename>
// S3 객체를 IAM 인증으로 읽어 Content-Disposition: attachment로 스트리밍
router.get('/download', async (req, res) => {
  try {
    const { url, name } = req.query;
    if (!url || typeof url !== 'string') return res.status(400).json({ error: 'url required' });
    const allowedHosts = ['work-studio-uploads.s3.ap-northeast-2.amazonaws.com'];
    let u;
    try { u = new URL(url); } catch { return res.status(400).json({ error: 'invalid url' }); }
    if (!allowedHosts.includes(u.host)) return res.status(403).json({ error: 'host not allowed' });

    const key = decodeURIComponent(u.pathname.replace(/^\//, ''));
    const obj = await getS3Object(key);

    const fileName = (typeof name === 'string' && name) ? name : path.basename(key);
    res.setHeader('Content-Type', obj.contentType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`);
    if (obj.contentLength) res.setHeader('Content-Length', String(obj.contentLength));

    // obj.body is a Node.js Readable stream (from AWS SDK v3)
    obj.body.pipe(res);
    obj.body.on('error', (err) => {
      console.error('S3 stream error:', err);
      if (!res.headersSent) res.status(500).end();
    });
  } catch (err) {
    console.error('Download proxy error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
