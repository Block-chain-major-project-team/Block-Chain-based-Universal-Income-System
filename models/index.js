"use strict";
const CONFIG = require("../config/config");
const logger = require("../utils/logger.service");

const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const basename = path.basename(__filename);
const db = {};

let sequelize;
const sequelizeOptions = {
    host: CONFIG.db_host,
    port: CONFIG.db_port,
    dialect: CONFIG.db_dialect || "postgres", // Ensure a default dialect if not supplied in config
    pool: { max: 20, min: 0, acquire: 30000, idle: 10000 },
    logging: msg => logger.debug(msg),
};

if (CONFIG.db_usePassword === "true") {
    sequelize = new Sequelize(CONFIG.db_name, CONFIG.db_user, CONFIG.db_password, sequelizeOptions);
} else {
    sequelize = new Sequelize(CONFIG.db_name, CONFIG.db_user, null, sequelizeOptions);
}

fs.readdirSync(__dirname)
    .filter(file => {
        return (
            file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js"
        );
    })
    .forEach(file => {
        const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
        db[model.name] = model;
    });

Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;