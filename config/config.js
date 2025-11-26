if (process.env.NODE_ENV !== "production") {
  require("dotenv").config(); // Load .env only in development
}

const CONFIG = {};

// General
CONFIG.app = process.env.APP || "dev";
CONFIG.port = parseInt(process.env.PORT, 10) || 3000;

// Database
CONFIG.db_dialect     = process.env.DB_DIALECT || "postgres";
CONFIG.db_host        = process.env.DB_HOST || "localhost";
CONFIG.db_port        = parseInt(process.env.DB_PORT, 10) || 5432;
CONFIG.db_name        = process.env.DB_NAME || "ubi_blockchain";
CONFIG.db_user        = process.env.DB_USER || "postgres";
CONFIG.db_password    = String(process.env.DB_PASSWORD || ""); // always a string
CONFIG.db_usePassword = process.env.DB_USE_PASSWORD !== "false"; // boolean true unless explicitly "false"

CONFIG.mailHost     = process.env.MAIL_HOST || "";
CONFIG.mailPort     = parseInt(process.env.MAIL_PORT, 10) || 587;
CONFIG.mailSecure   = process.env.MAIL_SECURE === "true";
CONFIG.mailUser     = process.env.MAIL_USER || "";
CONFIG.mailPassword = process.env.MAIL_PASSWORD || "";


module.exports = CONFIG;
