const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Create upload directory if it doesn't exist
const uploadDir = path.join(__dirname, "../uploads/kyc");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log("📁 Multer: Saving file to:", uploadDir);
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + file.originalname;
    console.log("📝 Multer: Generated filename:", uniqueName);
    cb(null, uniqueName);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  console.log("📥 Multer: File received:", file.originalname, file.mimetype);
  
  const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
  
  if (allowedTypes.includes(file.mimetype)) {
    console.log("✅ Multer: File type allowed");
    cb(null, true);
  } else {
    console.log("❌ Multer: File type rejected");
    cb(new Error("Only JPEG, PNG, or PDF files are allowed"), false);
  }
};

// Initialize multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

module.exports = upload;