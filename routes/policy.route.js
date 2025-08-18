"use strict";
const express = require("express");
const router = express.Router();
const policyController= require("../controllers/policy.controller");

// GET /api/policy
router.get("/policy", policyController.getPolicy);

module.exports = router;