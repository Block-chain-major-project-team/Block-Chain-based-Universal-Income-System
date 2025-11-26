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
// Use DATABASE_URL if available (Render internal/external URL)
CONFIG.db = {
  url: process.env.DATABASE_URL || null,   // Internal/external URL for Render
  dialect: process.env.DB_DIALECT || "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  name: process.env.DB_NAME || "ubi_blockchain",
  user: process.env.DB_USER || "postgres",
  password: String(process.env.DB_PASSWORD || ""),
  usePassword: process.env.DB_USE_PASSWORD !== "false", // true unless explicitly "false"
};

// ────── Mail / SMTP ──────
CONFIG.mailHost     = process.env.MAIL_HOST || "";
CONFIG.mailPort     = parseInt(process.env.MAIL_PORT, 10) || 587;
CONFIG.mailSecure   = process.env.MAIL_SECURE === "true";
CONFIG.mailUser     = process.env.MAIL_USER || "";
CONFIG.mailPassword = process.env.MAIL_PASSWORD || "";


CONFIG.awsRegion = process.env.AWS_REGION || "us-east-1";
CONFIG.awsAccessKeyId = process.env.AWS_ACCESS_KEY_ID || "your-aws-access-key-id";
CONFIG.awsSecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || "your-aws-secret-access-key";


CONFIG.s3Region = process.env.S3_REGION || 'ap-south-1';
CONFIG.s3AccessKeyId = process.env.S3_ACCESS_KEY_ID || 'your-access-key-id';
CONFIG.s3SecretAccessKey = process.env.S3_SECRET_ACCESS_KEY || 'your-secret-access-key';
CONFIG.s3Bucket = process.env.S3_BUCKET || 'your-bucket-name';


module.exports = CONFIG;
