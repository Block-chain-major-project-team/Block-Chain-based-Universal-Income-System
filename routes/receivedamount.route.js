const express = require("express");
const router = express.Router();
const receivedController = require("../controllers/receivedAmount.controller");

// List all received amounts for a user
router.get("/list/:userId", receivedController.listReceivedAmounts);

module.exports = router;
