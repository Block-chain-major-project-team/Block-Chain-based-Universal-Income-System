const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const organisationController = require("../controllers/organisation.controller");

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/organization"); // make sure this folder exists
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Routes
// Add organization (with optional bank_passbook_pic)
router.post("/add", upload.single("bank_passbook_pic"), organisationController.addOrganization);

// Update organization (can also update bank_passbook_pic)
router.put("/update/:id", upload.single("bank_passbook_pic"), organisationController.updateOrganization);

// List organizations
router.get("/list", organisationController.listOrganizations);

// Soft delete organization
router.delete("/delete/:id", organisationController.deleteOrganization);

module.exports = router;
