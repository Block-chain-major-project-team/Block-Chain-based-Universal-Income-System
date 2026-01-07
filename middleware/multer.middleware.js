const multer = require("multer");
const path = require("path");
const fs = require("fs");

console.log("💡 MULTER MIDDLEWARE LOADED");

// Ensure upload directory exists
const uploadDir = path.join(__dirname, "../uploads/kyc");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("📂 Created upload directory:", uploadDir);
} else {
  console.log("📂 Upload directory exists:", uploadDir);
}

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log("📁 MULTER DESTINATION HIT - storing file in:", uploadDir);
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    console.log("📝 FILENAME GENERATED:", uniqueName + ext);
    cb(null, uniqueName + ext);
  }
});

// File filter with detailed logs
const fileFilter = (req, file, cb) => {
  console.log("📥 FILE RECEIVED IN MULTER =>", {
    fieldname: file.fieldname,
    originalname: file.originalname,
    mimetype: file.mimetype,
    size: file.size
  });

  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "application/pdf"
  ];

  if (allowedTypes.includes(file.mimetype)) {
    console.log("✅ File type allowed:", file.mimetype);
    cb(null, true);
  } else {
    console.log("❌ File blocked by filter. Not allowed type:", file.mimetype);
    cb(new Error("Only JPEG, PNG, or PDF files are allowed"), false);
  }
};

// Initialize multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max
  }
});

module.exports = upload;
