const express = require("express");
const router = express.Router();

// Import route modules
const userRouter = require("./user.route");

// Health Check Route
router.get("/health", (req, res) => {
  res.status(200).send("Healthy Server!");
});

// Register the user routes with a valid path prefix
router.use("/user", userRouter);  // ✅ This becomes: /api/v1/user/register, etc.

module.exports = router;
