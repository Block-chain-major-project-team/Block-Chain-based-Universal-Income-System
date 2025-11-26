"use strict";

// Load .env only in development
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const CONFIG = {};

// ────── General ──────
CONFIG.app = process.env.APP || "dev";
CONFIG.port = parseInt(process.env.PORT, 10) || 3000;

// ────── Database ──────
// If DATABASE_URL is provided (Render internal/external URL), use it directly
CONFIG.db = {
  url: process.env.DATABASE_URL || null,  // Render internal URL or local URL
  dialect: process.env.DB_DIALECT || "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  name: process.env.DB_NAME || "ubi_blockchain",
  user: process.env.DB_USER || "postgres",
  password: String(process.env.DB_PASSWORD || ""),
  usePassword: process.env.DB_USE_PASSWORD !== "false", // boolean, true unless explicitly "false"
};

// ────── Mail / SMTP ──────
CONFIG.mailHost     = process.env.MAIL_HOST || "";
CONFIG.mailPort     = parseInt(process.env.MAIL_PORT, 10) || 587;
CONFIG.mailSecure   = process.env.MAIL_SECURE === "true";
CONFIG.mailUser     = process.env.MAIL_USER || "";
CONFIG.mailPassword = process.env.MAIL_PASSWORD || "";

module.exports = CONFIG;
