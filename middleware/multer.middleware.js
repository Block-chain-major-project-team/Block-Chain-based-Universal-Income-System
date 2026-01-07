const multer = require("multer");
const multerS3 = require("multer-s3");
const { S3Client } = require("@aws-sdk/client-s3");
require("dotenv").config();

console.log("💡 S3 MULTER MIDDLEWARE LOADED");

// Configure AWS S3 Client
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

console.log("🔧 S3 Client configured for region:", process.env.AWS_REGION);
console.log("📦 Target bucket:", process.env.S3_BUCKET_NAME);

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
    bucket: process.env.S3_BUCKET_NAME,
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

// Error handling wrapper
const uploadSingleWithErrorHandling = (fieldName) => {
  return (req, res, next) => {
    console.log("🚀 S3 Upload middleware executing for field:", fieldName);
    
    upload.single(fieldName)(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        console.log("❌ Multer Error:", err.message);
        return res.status(400).json({
          success: false,
          error: `Upload error: ${err.message}`
        });
      } else if (err) {
        console.log("❌ Unknown Error:", err.message);
        return res.status(400).json({
          success: false,
          error: err.message
        });
      }
      
      console.log("✅ S3 Upload successful");
      console.log("📎 req.file:", req.file);
      next();
    });
  };
};

module.exports = upload;
module.exports.uploadSingle = uploadSingleWithErrorHandling;