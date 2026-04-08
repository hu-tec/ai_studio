const { S3Client, PutObjectCommand, ListObjectsV2Command, DeleteObjectCommand } = require('@aws-sdk/client-s3');

let s3;

function getS3Client() {
  if (!s3) {
    s3 = new S3Client({
      region: process.env.AWS_REGION || 'ap-northeast-2',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }
  return s3;
}

function getBucket() {
  return process.env.S3_BUCKET;
}

function getRegion() {
  return process.env.AWS_REGION || 'ap-northeast-2';
}

async function uploadToS3(fileBuffer, key, contentType) {
  const client = getS3Client();
  const bucket = getBucket();

  if (!bucket || !process.env.AWS_ACCESS_KEY_ID) {
    console.warn('S3 not configured, skipping upload for:', key);
    return null;
  }

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: fileBuffer,
      ContentType: contentType,
    })
  );

  return `https://${bucket}.s3.${getRegion()}.amazonaws.com/${key}`;
}

async function listS3Objects(prefix = '') {
  const client = getS3Client();
  const bucket = getBucket();
  if (!bucket) return { files: [], folders: [] };

  const files = [];
  const folderSet = new Set();
  let continuationToken;

  do {
    const res = await client.send(new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: prefix,
      Delimiter: '/',
      ContinuationToken: continuationToken,
    }));

    for (const p of res.CommonPrefixes || []) {
      folderSet.add(p.Prefix);
    }
    for (const obj of res.Contents || []) {
      if (obj.Key === prefix) continue; // skip folder itself
      files.push({
        key: obj.Key,
        size: obj.Size,
        lastModified: obj.LastModified,
        url: `https://${bucket}.s3.${getRegion()}.amazonaws.com/${encodeURIComponent(obj.Key).replace(/%2F/g, '/')}`,
      });
    }
    continuationToken = res.NextContinuationToken;
  } while (continuationToken);

  return { files, folders: [...folderSet] };
}

async function listAllS3Objects() {
  const client = getS3Client();
  const bucket = getBucket();
  if (!bucket) return [];

  const all = [];
  let continuationToken;
  do {
    const res = await client.send(new ListObjectsV2Command({
      Bucket: bucket,
      ContinuationToken: continuationToken,
    }));
    for (const obj of res.Contents || []) {
      all.push({ key: obj.Key, size: obj.Size, lastModified: obj.LastModified });
    }
    continuationToken = res.NextContinuationToken;
  } while (continuationToken);

  return all;
}

async function deleteS3Object(key) {
  const client = getS3Client();
  const bucket = getBucket();
  if (!bucket) throw new Error('S3 not configured');

  await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}

function makeS3Key(formType, originalName) {
  const date = new Date().toISOString().slice(0, 10);
  const timestamp = Date.now();
  const safeName = originalName.replace(/[^a-zA-Z0-9가-힣._-]/g, '_');
  return `uploads/${formType}/${date}/${timestamp}_${safeName}`;
}

module.exports = { uploadToS3, listS3Objects, listAllS3Objects, deleteS3Object, makeS3Key };
