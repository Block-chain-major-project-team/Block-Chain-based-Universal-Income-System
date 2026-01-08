const express = require("express");
const router = express.Router();
const amountController = require("../controllers/amount.controller");

// List all amounts for a user
router.get("/list/:userId", amountController.listAmounts);

module.exports = router;
