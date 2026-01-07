const multer = require("multer");
const multerS3 = require("multer-s3");
const { S3Client } = require("@aws-sdk/client-s3");
const CONFIG = require("../config/config"); // ✅ Import config

console.log("💡 S3 MULTER MIDDLEWARE LOADED");

// Debug: Check if configuration is loaded
console.log("🔍 AWS_REGION:", CONFIG.aws_region);
console.log("🔍 AWS_ACCESS_KEY_ID:", CONFIG.aws_access_key_id ? "✅ Set" : "❌ Missing");
console.log("🔍 AWS_SECRET_ACCESS_KEY:", CONFIG.aws_secret_access_key ? "✅ Set" : "❌ Missing");
console.log("🔍 S3_BUCKET_NAME:", CONFIG.s3_bucket_name);

// Validate required S3 configuration
if (!CONFIG.aws_region || !CONFIG.aws_access_key_id || !CONFIG.aws_secret_access_key || !CONFIG.s3_bucket_name) {
  console.error("❌ ERROR: Missing AWS S3 configuration in .env file!");
  console.error("Required: AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, S3_BUCKET_NAME");
  throw new Error("AWS S3 configuration is incomplete");
}

// Configure AWS S3 Client
const s3 = new S3Client({
  region: CONFIG.aws_region,
  credentials: {
    accessKeyId: CONFIG.aws_access_key_id,
    secretAccessKey: CONFIG.aws_secret_access_key,
  },
});

console.log("🔧 S3 Client configured for region:", CONFIG.aws_region);
console.log("📦 Target bucket:", CONFIG.s3_bucket_name);

// File filter with logging
const fileFilter = (req, file, cb) => {
  console.log("📥 S3 Multer: File received", {
    fieldname: file.fieldname,
    originalname: file.originalname,
    mimetype: file.mimetype,
    size: file.size
  });
  
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "application/pdf"
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    console.log("✅ S3 Multer: File type allowed");
    cb(null, true);
  } else {
    console.log("❌ S3 Multer: File type rejected:", file.mimetype);
    cb(new Error("Only JPEG, PNG, or PDF files are allowed"), false);
  }
};

// Configure multer-s3 storage
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: CONFIG.s3_bucket_name,
    acl: "private", // Change to "public-read" if you want files publicly accessible
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: function (req, file, cb) {
      console.log("📝 S3 Multer: Adding metadata for file");
      cb(null, { 
        fieldName: file.fieldname,
        uploadedBy: req.body.userId || "unknown",
        uploadedAt: new Date().toISOString()
      });
    },
    key: function (req, file, cb) {
      // Organize files: kyc/userId/timestamp-filename
      const userId = req.body.userId || "unknown";
      const timestamp = Date.now();
      const sanitizedFilename = file.originalname.replace(/\s+/g, "-");
      const uniqueKey = `kyc/${userId}/${timestamp}-${sanitizedFilename}`;
      
      console.log("🔑 S3 Multer: Generated S3 key:", uniqueKey);
      cb(null, uniqueKey);
    },
  }),
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
});

module.exports = upload;