const express = require("express");
const router = express.Router();
const receivedamountController = require("../controllers/receivedamount.controller");

// List all received amounts for a user
router.get("/list/:userId", receivedamountController.listReceivedAmounts);

module.exports = router;
