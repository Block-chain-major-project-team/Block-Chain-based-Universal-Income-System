const express = require("express");
const router = express.Router();
const kycController = require("../controllers/kyc.controller");
const upload = require("../middleware/multer.middleware");


router.post("/create", upload.single("file"), kycController.create);
router.get("/list", kycController.getAll);
router.put("/update/:id", kycController.updateStatus);

module.exports = router;
