"use strict";
module.exports = (sequelize, Sequelize) => {
  const ReceivedAmount = sequelize.define(
    "ReceivedAmount",
    {
      id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true },

      donationSplitId: { type: Sequelize.BIGINT, allowNull: false }, // FK to DonationSplit
      donationId: { type: Sequelize.BIGINT, allowNull: false },      // FK to Donation (optional for quick access)
      donatorId: { type: Sequelize.BIGINT, allowNull: false },       // FK to Donator/User
      organizationId: { type: Sequelize.BIGINT, allowNull: false },  // FK to Organization
      userId: { type: Sequelize.BIGINT, allowNull: false },          // FK to User who initiated transfer

      receivedAmount: { type: Sequelize.DECIMAL(18, 2), allowNull: false },
      receivedDate: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },

      remarks: { type: Sequelize.STRING, allowNull: true }, // optional message or note about payment

      isDeleted: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },

      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    },
    { timestamps: true }
  );

  ReceivedAmount.associate = (models) => {
    // Links to DonationSplit
    ReceivedAmount.belongsTo(models.DonationSplit, { foreignKey: "donationSplitId" });

    // Links to Donation
    ReceivedAmount.belongsTo(models.Donation, { foreignKey: "donationId" });

    // Links to Donator/User
    ReceivedAmount.belongsTo(models.User, { foreignKey: "donatorId" });

    // Links to Organization
    ReceivedAmount.belongsTo(models.Organization, { foreignKey: "organizationId" });

    // User who initiated the transfer (admin/platform user)
    ReceivedAmount.belongsTo(models.User, { foreignKey: "userId" });
  };

  return ReceivedAmount;
};
