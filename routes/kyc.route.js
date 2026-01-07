const express = require("express");
const router = express.Router();
const kycController = require("../controllers/kyc.controller");
const upload = require("../middleware/multer.middleware");

// Test upload route (optional, for debugging)
router.post("/test-upload", upload.single("file"), (req, res) => {
  console.log("🧪 TEST ROUTE - Body:", req.body);
  console.log("🧪 TEST ROUTE - File:", req.file);
  
  if (req.file) {
    return res.json({
      success: true,
      message: "File uploaded successfully to S3!",
      file: req.file
    });
  } else {
    return res.status(400).json({
      success: false,
      message: "No file received"
    });
  }
});

// Main KYC routes
router.post("/create", upload.single("file"), kycController.create);
router.get("/list", kycController.getAll);
router.put("/update/:id", kycController.updateStatus);

module.exports = router;