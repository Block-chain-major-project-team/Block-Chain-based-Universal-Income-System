const multer = require("multer");
const path = require("path");
const fs = require("fs");

console.log("💡 MULTER MIDDLEWARE LOADED");

// Ensure upload directory exists
const uploadDir = path.join(__dirname, "../uploads/kyc");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        console.log("📁 MULTER DESTINATION HIT");
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        console.log("📝 FILENAME GENERATED:", uniqueName + ext);
        cb(null, uniqueName + ext);
    }
});

// File filter logging
const fileFilter = (req, file, cb) => {
    console.log("📥 FILE RECEIVED IN MULTER =>", {
        fieldname: file.fieldname,
        originalname: file.originalname,
        mimetype: file.mimetype
    });

    const allowedTypes = ["image/jpeg", "image/png", "application/pdf", "application/octet-stream"];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        console.log("❌ FILE BLOCKED BY FILTER", file.mimetype);
        cb(new Error("Only JPEG, PNG, or PDF files are allowed"), false);
    }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
