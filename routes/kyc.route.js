const express = require("express");
const router = express.Router();
const kycController = require("../controllers/kyc.controller");
const upload = require("../middleware/multer.middleware");

// Log every time router loads
console.log("KYC Router Loaded");

// Add logs before multer runs
router.post("/create",
    (req, res, next) => {
        console.log("🔵 [KYC] Incoming POST /create");
        console.log("Headers:", req.headers["content-type"]);
        next();
    },

    upload.single("file"),

    (req, res, next) => {
        console.log("🟢 Multer finished. File info:");
        console.log("File:", req.file);
        console.log("Body:", req.body);
        next();
    },

    kycController.create
);

router.get("/list", (req, res, next) => {
    console.log("🔵 GET /kyc/list");
    next();
}, kycController.getAll);

router.put("/update/:id", (req, res, next) => {
    console.log(`🔵 PUT /kyc/update/${req.params.id}`);
    next();
}, kycController.updateStatus);

module.exports = router;
