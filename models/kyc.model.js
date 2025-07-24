"use strict";
module.exports = (sequelize, Sequelize) => {
    const KYC = sequelize.define(
        "KYC",
        {
            id: { autoIncrement: true, primaryKey: true, type: Sequelize.BIGINT },
            userId: { type: Sequelize.BIGINT, allowNull: false },
            documentType: { type: Sequelize.STRING, allowNull: false },
            filePath: { type: Sequelize.STRING, allowNull: false },
            status: {
                type: Sequelize.ENUM("pending", "approved", "rejected"),
                allowNull: false,
                defaultValue: "pending"
            },
            createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
            updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
        },
        {
            timestamps: true,
            tableName: "KYC"
        }
    );

    // Define association: each KYC belongs to one User
    KYC.associate = function(models) {
        KYC.belongsTo(models.User, {
            foreignKey: "userId",
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
        });
    };

    return KYC;
};
