const express = require("express");
const router = express.Router();
const kycController = require("../controllers/kyc.controller");

// Import the S3 uploader properly
const {
    uploadRegistrationDetails
} = require("../middleware/multer.middleware");

// Log every time router loads
console.log("KYC Router Loaded");

// POST /create with logs + S3 file upload
router.post(
    "/create",

    // BEFORE multer: log request
    (req, res, next) => {
        console.log("🔵 [KYC] Incoming POST /create");
        console.log("Headers:", req.headers["content-type"]);
        next();
    },

    // S3 uploader
    uploadRegistrationDetails.single("file"),

    // AFTER multer: log parsed data
    (req, res, next) => {
        console.log("🟢 Multer finished.");
        console.log("Uploaded File:", req.file);
        console.log("Body:", req.body);
        next();
    },

    // Controller
    kycController.create
);

// GET /list
router.get(
    "/list",
    (req, res, next) => {
        console.log("🔵 GET /kyc/list");
        next();
    },
    kycController.getAll
);

// PUT /update/:id
router.put(
    "/update/:id",
    (req, res, next) => {
        console.log(`🔵 PUT /kyc/update/${req.params.id}`);
        next();
    },
    kycController.updateStatus
);

module.exports = router;
