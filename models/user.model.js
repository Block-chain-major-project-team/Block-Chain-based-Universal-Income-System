"use strict";
module.exports = (sequelize, Sequelize) => {
    const User = sequelize.define(
        "User",
        {
            id: { autoIncrement: true, primaryKey: true, type: Sequelize.BIGINT },
            wallet: { type: Sequelize.STRING, allowNull: false, unique: true },
            did: { type: Sequelize.STRING, allowNull: true },
            password: { type: Sequelize.STRING, allowNull: false },
            email: { type: Sequelize.STRING, allowNull: false, unique: true, validate: { isEmail: true } },
            mobile: { type: Sequelize.STRING, allowNull: false, unique: true },
            kyc_status: { type: Sequelize.ENUM("pending", "approved", "rejected"), defaultValue: "pending" },
            balance: { type: Sequelize.DECIMAL(18, 4), allowNull: false, defaultValue: 0.0 },
            isVerified: { type: Sequelize.BOOLEAN, defaultValue: false },
            isFlagged: { type: Sequelize.BOOLEAN, defaultValue: false },
            isDeleted: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
            createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
            updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
        },
        { timestamps: true }
    );
    
    return User;
};
