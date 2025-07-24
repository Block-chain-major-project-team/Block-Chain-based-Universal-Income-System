const express = require("express");
const router = express.Router();
const transactionController = require("../controllers/transaction.controller");

router.post("/claim", transactionController.claimUBI);
router.get('/transactions/:userId', transactionController.getTransactionHistory);
router.get('/balance/:userId', transactionController.getBalance);

module.exports = router;
