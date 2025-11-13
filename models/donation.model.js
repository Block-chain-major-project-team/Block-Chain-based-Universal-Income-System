"use strict";
module.exports = (sequelize, Sequelize) => {
  const Donation = sequelize.define(
    "Donation",
    {
      id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true },

      organizationId: { type: Sequelize.BIGINT, allowNull: false }, // FK to Organization
      userId: { type: Sequelize.BIGINT, allowNull: false },       // FK to Donator/User
      organizationName: { type: Sequelize.STRING, allowNull: false }, 
      totalAmount: { type: Sequelize.DECIMAL(18, 2), allowNull: false },

      contactPersonName: { type: Sequelize.STRING, allowNull: true },
      contactPersonEmail: { type: Sequelize.STRING, allowNull: true },

      isDeleted: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },

      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    },
    { timestamps: true }
  );

  Donation.associate = (models) => {
    // Donation has many DonationSplits
    Donation.hasMany(models.DonationSplit,
         { 
            foreignKey: "donationId" ,
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
        });


    // Donation belongs to Donator/User
    Donation.belongsTo(models.User,
        { 
            foreignKey: "userId",
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
         });

    // Donation belongs to Organization
    Donation.belongsTo(models.Organization, 
        { foreignKey: "organizationId",
          onDelete: "CASCADE",
          onUpdate: "CASCADE",
        });
  };

  return Donation;
};
