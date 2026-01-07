const express = require("express");
const router = express.Router();
const kycController = require("../controllers/kyc.controller");
const upload = require("../middleware/multer.middleware");


router.post("/create", 
    upload.single("file"), 
    (req, res, next) => {
        console.log("🔍 Debug Multer req.file:", req.file);  // file info
        console.log("🔍 Debug Multer req.body:", req.body);  // form fields
        next(); // pass control to controller
    }, 
    kycController.create
);
router.get("/list", kycController.getAll);
router.put("/update/:id", kycController.updateStatus);

module.exports = router;
