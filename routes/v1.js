const express = require("express");
const router = express.Router();

// Import route modules
const userRouter = require("./user.route");
const kycRouter = require("./kyc.route");
const transactionRouter = require("./transaction.route");
const publicRouter = require("./public.route");
const policyRouter = require("./policy.route");
const didRouter= require("./did.route");
const adminRouter = require("./admin.route");
const walletRouter = require("./wallet.route");



// Health Check Route
router.get("/health", (req, res) => {
  res.status(200).send("Healthy Server!");
});

// Register the user routes with a valid path prefix
router.use("/user", userRouter);
router.use("/kyc", kycRouter);
router.use("/transaction", transactionRouter);
router.use("/public", publicRouter);
router.use("/policy", policyRouter);
router.use("/did", didRouter);
router.use("/admin", adminRouter);
router.use("/wallet", walletRouter);

module.exports = router; 
