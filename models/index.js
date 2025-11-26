"use strict";

const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const basename = path.basename(__filename);
const db = {};

const CONFIG = require("../config/config");
const logger = require("../utils/logger.service");

// Initialize Sequelize
const sequelize = CONFIG.db.url
  ? new Sequelize(CONFIG.db.url, {
      dialect: CONFIG.db.dialect,
      pool: {
        max: 20,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
      logging: msg => logger.debug(msg),
    })
  : new Sequelize(
      CONFIG.db.name,
      CONFIG.db.user,
      CONFIG.db.usePassword ? String(CONFIG.db.password) : null,
      {
        host: CONFIG.db.host,
        port: CONFIG.db.port,
        dialect: CONFIG.db.dialect,
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
  .filter(
    file =>
      file.indexOf(".") !== 0 &&
      file !== basename &&
      file.endsWith(".js")
  )
  .forEach(file => {
    const model = require(path.join(__dirname, file))(
      sequelize,
      Sequelize.DataTypes
    );
    db[model.name] = model;
  });

// Apply associations if any
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
