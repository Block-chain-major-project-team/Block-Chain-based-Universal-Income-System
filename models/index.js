"use strict";

const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const basename = path.basename(__filename);
const db = {};

const CONFIG = require("../config/config");
const logger = require("../utils/logger.service");

// Use DATABASE_URL if available (Render internal URL), otherwise fall back to old config
const sequelize = CONFIG.db.url
  ? new Sequelize(CONFIG.db.url, {
      dialect: "postgres",
      pool: {
        max: 20,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
      logging: msg => logger.debug(msg),
    })
  : new Sequelize(
      CONFIG.db_name,
      CONFIG.db_user,
      CONFIG.db_usePassword ? String(CONFIG.db_password || "") : null,
      {
        host: CONFIG.db_host,
        port: CONFIG.db_port,
        dialect: CONFIG.db_dialect || "postgres",
        pool: {
          max: 20,
          min: 0,
          acquire: 30000,
          idle: 10000,
        },
        logging: msg => logger.debug(msg),
      }
    );

// Load all models in this folder
fs.readdirSync(__dirname)
  .filter(file => file.indexOf(".") !== 0 && file !== basename && file.endsWith(".js"))
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

// Apply associations
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
