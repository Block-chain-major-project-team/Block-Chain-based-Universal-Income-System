const express        = require("express");
const path           = require("path");
const fs             = require("fs");
const cors           = require("cors");
const compression    = require("compression");
const expressWinston = require("express-winston");

const model  = require("./models/index");
const CONFIG = require("./config/config");
const v1     = require("./routes/v1");
const logger = require("./utils/logger.service");

const app = express();

const { runDonationTransfer } = require("./jobs/dailytransfer.job");
runDonationTransfer(); 

// ────── GLOBAL MIDDLEWARE ──────
app.use(express.json({ limit: "50mb" }));

// ✅ REMOVED: express.urlencoded to prevent interference with multipart/form-data
// If you need it for specific routes, apply it conditionally

app.use(compression());

app.use(cors({
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
  allowedHeaders: "*",
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// ────── REQUEST LOGGING (skip healthz) ──────
app.use(expressWinston.logger({
  winstonInstance: logger,
  expressFormat: true,
  colorize: false,
  ignoreRoute: req => req.path === "/api/healthz"
}));

// ────── ROOT ROUTE (quick test) ──────
app.get("/", (req, res) => {
  res.send("Backend is running on EC2!");
});

// ────── HEALTH CHECK ──────
app.get("/api/healthz", async (req, res) => {
  try {
    const result = await model.sequelize.query(
      "SELECT 1+1 AS result",
      { type: model.sequelize.QueryTypes.SELECT }
    );
    return result[0].result === 2
      ? res.status(200).send("OK")
      : res.status(500).send("Database Error");
  } catch (err) {
    logger.error("Health check DB error", err);
    return res.status(500).send("Database Error");
  }
});

// ────── API ROUTES ──────
app.use("/api/v1", v1);

// ────── 404 HANDLER ──────
app.use((req, res) => {
  res.status(404).send("Not Found");
});

// ────── ERROR LOGGING ──────
app.use(expressWinston.errorLogger({
  winstonInstance: logger,
  expressFormat: true,
  colorize: false
}));

// ────── DATABASE SYNC ──────
model.sequelize
  .sync()
  .then(() => logger.info("sequelize: Database Sync Success"))
  .catch(err => logger.error("sequelize: Database Sync Failed", err));

// ────── START SERVER ──────
app.listen(CONFIG.port, () => {
  logger.info(`express: Listening on port ${CONFIG.port}`);
});

module.exports = app;



