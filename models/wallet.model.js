"use strict";
module.exports = (sequelize, Sequelize) => {
  const Wallet = sequelize.define(
    "Wallet",
    {
      id: { autoIncrement: true, primaryKey: true, type: Sequelize.BIGINT },

      // Foreign key to User
      userId: { type: Sequelize.BIGINT, allowNull: false },

      // Simulated wallet address (required & unique)
      address: { type: Sequelize.STRING, allowNull: false, unique: true },

      // Verification flags and code/expiry for OTP flow
      verified: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      verificationCode: { type: Sequelize.STRING, allowNull: true },
      verificationExpiresAt: { type: Sequelize.DATE, allowNull: true },

      // Soft flags
      isDeleted: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },

      // Timestamps
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    },
    { timestamps: true }
  );

  // Associations
  Wallet.associate = (models) => {
    Wallet.belongsTo(models.User, { foreignKey: "userId", as: "user" });
  };

  return Wallet;
};
