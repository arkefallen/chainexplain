require('../../env');
const { Storage } = require('@google-cloud/storage');
const Minio = require('minio');
const path = require('path');

const storageType = process.env.STORAGE_TYPE || 'minio';

let storageClient;
let minioClient;

if (storageType === 'minio') {
  minioClient = new Minio.Client({
    endPoint: process.env.MINIO_ENDPOINT || 'localhost',
    port: parseInt(process.env.MINIO_PORT || '9000', 10),
    useSSL: process.env.MINIO_USE_SSL === 'true',
    accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
    secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
  });
} else {
  storageClient = new Storage({
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    projectId: process.env.GCP_PROJECT_ID,
  });
}

const bucketName = process.env.STORAGE_BUCKET || process.env.MINIO_BUCKET || 'chainexplain-uploads';

const ensureBucketExists = async () => {
  if (storageType === 'minio') {
    const exists = await minioClient.bucketExists(bucketName);
    if (!exists) {
      await minioClient.makeBucket(bucketName, 'us-east-1');
    }
  } else {
    const bucket = storageClient.bucket(bucketName);
    const [exists] = await bucket.exists();
    if (!exists) {
      await bucket.create();
    }
  }
};

const uploadFile = async (filePath, destination) => {
  if (storageType === 'minio') {
    await minioClient.fPutObject(bucketName, destination, filePath);
    return `minio://${bucketName}/${destination}`;
  } else {
    await storageClient.bucket(bucketName).upload(filePath, {
      destination: destination,
    });
    return `gs://${bucketName}/${destination}`;
  }
};

const getFileStream = async (fileUrl) => {
  const dest = fileUrl.replace(`minio://${bucketName}/`, '').replace(`gs://${bucketName}/`, '');
  if (storageType === 'minio') {
    return await minioClient.getObject(bucketName, dest);
  } else {
    return storageClient.bucket(bucketName).file(dest).createReadStream();
  }
};

module.exports = {
  storageClient,
  minioClient,
  ensureBucketExists,
  uploadFile,
  getFileStream,
  bucketName,
  storageType
};
