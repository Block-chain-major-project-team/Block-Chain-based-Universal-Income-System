
"use strict";
const express = require("express");
const router = express.Router();
const publicController= require("../controllers/public.controller");

// Public transparency endpoints
router.get("/public/stats/summary", publicController.getSummary);
router.get("/public/stats/monthly", publicController.getMonthly);
router.get("/public/ledger", publicController.getLedger);

module.exports = router;