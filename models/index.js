"use strict";

const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const basename = path.basename(__filename);
const db = {};
const logger = console; // replace with your logger.service if needed

// Pool & logging options
const sequelizeOptions = {
  pool: {
    max: 20,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  logging: msg => logger.debug ? logger.debug(msg) : console.log(msg),
};

// ✅ Determine DB connection
const dbPassword = process.env.DB_USE_PASSWORD === "true" ? process.env.DB_PASSWORD : null;

const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: "postgres",
      dialectOptions: {
        ssl: {
          rejectUnauthorized: false, // Required for Neon
        },
      },
      pool: sequelizeOptions.pool,
      logging: sequelizeOptions.logging,
    })
  : new Sequelize(
      process.env.DB_NAME || "jaya",
      process.env.DB_USER || "postgres",
      dbPassword,
      {
        host: process.env.DB_HOST || "localhost",
        port: process.env.DB_PORT || 5432,
        dialect: process.env.DB_DIALECT || "postgres",
        pool: sequelizeOptions.pool,
        logging: sequelizeOptions.logging,
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
