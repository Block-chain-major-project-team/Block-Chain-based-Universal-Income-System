"use strict";

module.exports = (sequelize, Sequelize) => {
  const Amount = sequelize.define(
    "Amount",
    {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },

      donationSplitId: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },

      donationId: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },

      donatorId: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },

      organizationId: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },

      userId: {
        type: Sequelize.BIGINT,
        allowNull: false, // platform/admin user
      },

      amount: {
        type: Sequelize.DECIMAL(18, 2),
        allowNull: false,
      },

      amountDate: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },

      remarks: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      isDeleted: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      timestamps: true,
    }
  );

  Amount.associate = (models) => {
    Amount.belongsTo(models.DonationSplit, {
      foreignKey: "donationSplitId",
    });

    Amount.belongsTo(models.Donation, {
      foreignKey: "donationId",
    });

    Amount.belongsTo(models.User, {
      foreignKey: "donatorId",
      as: "Donator",
    });

    Amount.belongsTo(models.Organization, {
      foreignKey: "organizationId",
    });

    Amount.belongsTo(models.User, {
      foreignKey: "userId",
      as: "ProcessedBy",
    });
  };

  return Amount;
};
