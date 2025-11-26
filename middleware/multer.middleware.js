const multer = require("multer");
const multerS3 = require("multer-s3");
const { S3Client } = require("@aws-sdk/client-s3");
const CONFIG = require("../config/config");

// ✅ Initialize S3 Client
const s3Client = new S3Client({
  region: CONFIG.s3Region || "ap-south-1",
  credentials: {
    accessKeyId: CONFIG.s3AccessKeyId,
    secretAccessKey: CONFIG.s3SecretAccessKey,
  },
});

// 🔹 S3 Storage Builder for KYC files
const buildS3Storage = (pathPrefix) =>
  multerS3({
    s3: s3Client,
    bucket: CONFIG.s3Bucket, // "eduroom-registration-details"
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (req, file, cb) => {
      const fileName = `${Date.now()}-${file.originalname}`;
      cb(null, `${pathPrefix}/${fileName}`);
    },
  });

// ✅ Accept only images
const imageFileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png/;
  const ext = file.originalname.toLowerCase().match(/\.(jpeg|jpg|png)$/);
  const mime = allowedTypes.test(file.mimetype);

  if (ext && mime) cb(null, true);
  else cb(new Error("Only PNG, JPEG, JPG files are allowed"));
};

// ✅ KYC Upload Middleware
const uploadKYCFile = multer({
  storage: buildS3Storage("registration-details"),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: imageFileFilter,
});

module.exports = { uploadKYCFile };
