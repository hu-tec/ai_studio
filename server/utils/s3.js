const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

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

async function uploadToS3(fileBuffer, key, contentType) {
  const client = getS3Client();
  const bucket = process.env.S3_BUCKET;

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

  return `https://${bucket}.s3.${process.env.AWS_REGION || 'ap-northeast-2'}.amazonaws.com/${key}`;
}

function makeS3Key(formType, originalName) {
  const date = new Date().toISOString().slice(0, 10);
  const timestamp = Date.now();
  const safeName = originalName.replace(/[^a-zA-Z0-9가-힣._-]/g, '_');
  return `uploads/${formType}/${date}/${timestamp}_${safeName}`;
}

module.exports = { uploadToS3, makeS3Key };
