"use strict";
const express = require("express");
const router = express.Router();
const walletController = require("../controllers/wallet.controller");

router.post("/wallet/request-code", walletController.requestCode);
router.post("/wallet/verify", walletController.verify);

module.exports = router;
