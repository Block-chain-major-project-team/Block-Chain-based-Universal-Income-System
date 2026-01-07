if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const CONFIG = {};

// App
CONFIG.app  = process.env.APP || "dev";
CONFIG.port = Number(process.env.PORT) || 3000;

// Database
CONFIG.db_dialect = process.env.DB_DIALECT || "postgres";
CONFIG.db_host    = process.env.DB_HOST || "localhost";
CONFIG.db_port    = Number(process.env.DB_PORT) || 5432;
CONFIG.db_name    = process.env.DB_NAME || "ubi_blockchain";
CONFIG.db_user    = process.env.DB_USER || "postgres";

/**
 * IMPORTANT:
 * - undefined → null
 * - empty string → null
 * - only real strings allowed
 */
const rawPassword = process.env.DB_PASSWORD;

CONFIG.db_password =
  typeof rawPassword === "string" && rawPassword.trim() !== ""
    ? rawPassword
    : null;

/**
 * Use password unless explicitly disabled
 */
CONFIG.db_usePassword = process.env.DB_USE_PASSWORD !== "false";

// Mail
CONFIG.mailHost     = process.env.MAIL_HOST || "";
CONFIG.mailPort     = Number(process.env.MAIL_PORT) || 587;
CONFIG.mailSecure   = process.env.MAIL_SECURE === "true";
CONFIG.mailUser     = process.env.MAIL_USER || "";
CONFIG.mailPassword = process.env.MAIL_PASSWORD || "";

module.exports = CONFIG;
