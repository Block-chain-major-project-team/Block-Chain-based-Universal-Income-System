"use strict";
const express = require("express");
const router = express.Router();
const didController= require("../controllers/did.controller");

// Optionally add auth middleware here
router.post("/did/request-code", didController.requestDidCode);
router.post("/did/verify", didController.verifyDidCode);

module.exports = router;
