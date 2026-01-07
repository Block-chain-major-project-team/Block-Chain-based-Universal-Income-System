"use strict";

const CONFIG = require("../config/config");
const logger = require("../utils/logger.service");

const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");

const basename = path.basename(__filename);
const db = {};

// Sequelize options
const sequelizeOptions = {
  host: CONFIG.db_host,
  port: CONFIG.db_port,
  dialect: CONFIG.db_dialect,
  pool: {
    max: 20,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  logging: msg => logger.debug(msg),
};

// ✅ Only pass password if explicitly allowed and valid
const password =
  CONFIG.db_usePassword && typeof CONFIG.db_password === "string"
    ? CONFIG.db_password
    : null;

// ✅ Safe Sequelize initialization
const sequelize = new Sequelize(
  CONFIG.db_name,
  CONFIG.db_user,
  password,
  sequelizeOptions
);

// Load models
fs.readdirSync(__dirname)
  .filter(file => file.endsWith(".js") && file !== basename)
  .forEach(file => {
    const model = require(path.join(__dirname, file))(
      sequelize,
      Sequelize.DataTypes
    );
    db[model.name] = model;
  });

// Associations
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
