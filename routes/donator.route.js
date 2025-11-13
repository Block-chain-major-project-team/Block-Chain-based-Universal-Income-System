const express = require("express");
const router = express.Router();
const donatorController = require("../controllers/donator.controller");
const multer = require("multer");
const path = require("path");

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/bank_passbooks/"); // save files in this folder
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Donator routes
router.post("/add", upload.single("bank_passbook_pic"), donatorController.addDonator);
router.put("/update/:id", upload.single("bank_passbook_pic"), donatorController.updateDonator);
router.get("/list", donatorController.listDonators);
router.delete("/delete/:id", donatorController.deleteDonator);
router.post("/login", donatorController.loginDonator);

// If you want a simple logout endpoint
router.post("/logout", donatorController.logoutDonator);

module.exports = router;
