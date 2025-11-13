"use strict";

module.exports = (sequelize, Sequelize) => {
  const Donator = sequelize.define(
    "Donator",
    {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },

      // Foreign key to User
      userId: {
        type: Sequelize.BIGINT,
        allowNull: false,
        },

      // Contact / identity
      email: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      phone_number: {
        type: Sequelize.STRING,
        allowNull: false
      },
      address: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      designation: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      // Government IDs
      aadhaar_number: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true,
      },
      pan_number: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true,
      },

      // Bank details
      bank_name: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      bank_address: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      ifsc_code: {
        type: Sequelize.STRING(11),
        allowNull: true,
      },
      branch: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      account_number: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true,
      },
      account_holder_name: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      // GST (optional)
      gst_number: {
        type: Sequelize.STRING(15),
        allowNull: true,
      },

      bank_passbook_pic: {
        type: Sequelize.STRING,
        allowNull: true, // store URL or file path
      },

      // Metadata flags
      isVerified: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      isFlagged: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      isDeleted: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    },
    {
      timestamps: true,
      indexes: [
        { fields: ["aadhaar_number"] },
        { fields: ["pan_number"] },
        { fields: ["account_number"] },
      ],
    }
  );

  // Define association (each Donator belongs to a User)
  Donator.associate = (models) => {
    Donator.belongsTo(models.User, {
      foreignKey: "userId",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });
  };

  return Donator;
};
