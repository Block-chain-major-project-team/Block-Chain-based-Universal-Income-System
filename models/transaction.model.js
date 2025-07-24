"use strict";
module.exports = (sequelize, Sequelize) => {
    const Transaction = sequelize.define(
        "Transaction",
        {
            id: { autoIncrement: true, primaryKey: true, type: Sequelize.BIGINT },
            userId: { type: Sequelize.BIGINT, allowNull: false },
            type: {
                type: Sequelize.ENUM("ubi", "admin-transfer", "reward"),
                allowNull: false,
                defaultValue: "ubi"
            },
            amount: { type: Sequelize.STRING, allowNull: false },
            txHash: { type: Sequelize.STRING, allowNull: true },

            createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
            updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
        },
        {
            timestamps: true,
            tableName: "Transactions"
        }
    );

    // Define association: each transaction belongs to a user
    Transaction.associate = function(models) {
        Transaction.belongsTo(models.User, {
            foreignKey: "userId",
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
        });
    };

    return Transaction;
};
