"use strict";
module.exports = (sequelize, Sequelize) => {
  const DonationSplit = sequelize.define(
    "DonationSplit",
    {
      id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true },

      donationId: { type: Sequelize.BIGINT, allowNull: false }, // FK to Donation
      splitAmount: { type: Sequelize.DECIMAL(18, 2), allowNull: false },
      message: { type: Sequelize.TEXT, allowNull: true },
      purpose: { type: Sequelize.STRING, allowNull: true },
      transferDate: { type: Sequelize.DATE, allowNull: true },
      status: { 
        type: Sequelize.ENUM("pending", "completed", "failed"), 
        allowNull: false, 
        defaultValue: "pending" 
      },

      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    },
    { timestamps: true }
  );

  DonationSplit.associate = (models) => {
    DonationSplit.belongsTo(models.Donation, 
        { 
            
            foreignKey: "donationId", 
            onDelete: "CASCADE",
            onUpdate: "CASCADE",

         });
  };

  return DonationSplit;
};
