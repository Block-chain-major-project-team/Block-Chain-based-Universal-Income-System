if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config(); // Load .env only in non-production
}

let CONFIG = {};

// General
CONFIG.app = process.env.APP || "dev";
CONFIG.port = process.env.PORT || "3000";

// Database
CONFIG.db_dialect = process.env.DB_DIALECT || "postgres";
CONFIG.db_host = process.env.DB_HOST || "localhost";
CONFIG.db_port = process.env.DB_PORT || "5432";
CONFIG.db_name = process.env.DB_NAME || "hrcrm_db";
CONFIG.db_user = process.env.DB_USER || "root";
CONFIG.db_password = process.env.DB_PASSWORD || "password";
CONFIG.db_usePassword = process.env.DB_USE_PASSWORD || "true";
