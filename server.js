const express          = require("express");
const path             = require("path");
const fs               = require("fs");
const cors             = require("cors");
const compression      = require("compression");
const expressWinston   = require("express-winston");
const serveIndex       = require("serve-index");

const model            = require("./models/index");
const CONFIG           = require("./config/config");
const v1               = require("./routes/v1");
const logger           = require("./utils/logger.service");

const app = express();

require("./jobs/dailytransfer.job");


// ────── GLOBAL MIDDLEWARE ────────────────────────────────────────────
// JSON & URL-encoded body parsing
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Enable Gzip compression
app.use(compression());

// Fully permissive CORS
app.use(cors({
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
  allowedHeaders: "*",
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// ────── REQUEST LOGGING (skip healthz) ──────────────────────────────
app.use(
  expressWinston.logger({
    winstonInstance: logger,
    expressFormat: true,
    colorize: false,
    ignoreRoute: req => req.path === "/api/healthz"
  })
);

// ────── HEALTH CHECK ────────────────────────────────────────────────
app.get("/api/healthz", async (req, res) => {
  try {
    const result = await model.sequelize.query(
      "SELECT 1+1 AS result",
      { type: model.sequelize.QueryTypes.SELECT }
    );
    return result[0].result === 2
      ? res.status(200).send("OK")
      : res.status(500).send("Database Error");
  } catch {
    return res.status(500).send("Database Error");
  }
});

// ────── API ROUTES ───────────────────────────────────────────────────
app.use("/api/v1", v1);

// ────── 404 HANDLER ─────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).send("Not Found");
});

// ────── ERROR LOGGING ───────────────────────────────────────────────
app.use(
  expressWinston.errorLogger({
    winstonInstance: logger,
    expressFormat: true,
    colorize: false
  })
);

// ────── DATABASE SYNC ───────────────────────────────────────────────
model.sequelize
  .sync()
  .then(() => logger.info("sequelize: Database Sync Success"))
  .catch(err => logger.error("sequelize: Database Sync Failed", err));

// ────── START SERVER ────────────────────────────────────────────────
app.listen(CONFIG.port, () => {
  logger.info(`express: Listening on port ${CONFIG.port}`);
});

module.exports = app;
