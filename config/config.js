// Load .env only in development (Vercel provides env vars automatically)
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const CONFIG = {};

// General
CONFIG.app  = process.env.APP || "dev";
CONFIG.port = parseInt(process.env.PORT, 10) || 3000;

// ==========================
// Database Configuration
// ==========================

// If DATABASE_URL exists (Neon / Vercel) → use it automatically
CONFIG.database_url = process.env.DATABASE_URL || null;

// Standard local DB configuration (used only when DATABASE_URL is not set)
CONFIG.db_dialect     = process.env.DB_DIALECT || "postgres";
CONFIG.db_host        = process.env.DB_HOST || "localhost";
CONFIG.db_port        = parseInt(process.env.DB_PORT, 10) || 5432;
CONFIG.db_name        = process.env.DB_NAME || "jaya";
CONFIG.db_user        = process.env.DB_USER || "postgres";

CONFIG.db_password    = String(process.env.DB_PASSWORD || "");
CONFIG.db_usePassword = process.env.DB_USE_PASSWORD !== "false";

// ==========================
// Mail Configuration
// ==========================
CONFIG.mailHost     = process.env.MAIL_HOST || "";
CONFIG.mailPort     = parseInt(process.env.MAIL_PORT, 10) || 587;
CONFIG.mailSecure   = process.env.MAIL_SECURE === "true";
CONFIG.mailUser     = process.env.MAIL_USER || "";
CONFIG.mailPassword = process.env.MAIL_PASSWORD || "";

// Export
module.exports = CONFIG;
