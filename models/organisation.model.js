"use strict";
module.exports = (sequelize, Sequelize) => {
  const Organization = sequelize.define(
    "Organization",
    {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },

      // Basic Info
      userId: {type: Sequelize.BIGINT, allowNull: false},
      name: { type: Sequelize.STRING, allowNull: false }, // Organization name
      email: { type: Sequelize.STRING, allowNull: false, unique: true, validate: { isEmail: true } },
      phone: { type: Sequelize.STRING, allowNull: false, unique: true },
      website: { type: Sequelize.STRING, allowNull: true }, // optional
      address: { type: Sequelize.TEXT, allowNull: true }, // physical address

      // Purpose & Mission
      purpose: { type: Sequelize.TEXT, allowNull: true }, // why they need funding
      mission: { type: Sequelize.TEXT, allowNull: true }, // long-term goal
      category: { type: Sequelize.STRING, allowNull: true }, // e.g., "Education", "Healthcare", "Development"

      // Bank Details (can be added/verified later)
      bank_name: { type: Sequelize.STRING, allowNull: true },
      account_number: { type: Sequelize.STRING, allowNull: true, unique: true },
      bank_passbook_pic: { type: Sequelize.STRING, allowNull: true }, // path to uploaded image
      ifsc_code: { type: Sequelize.STRING, allowNull: true },
      branch_name: { type: Sequelize.STRING, allowNull: true },

      // Compliance & Tax
      gst_number: { type: Sequelize.STRING, allowNull: true }, // optional for donations
      registration_number: { type: Sequelize.STRING, allowNull: true }, // e.g., NGO registration number
      tax_exemption_status: { type: Sequelize.BOOLEAN, defaultValue: false }, // eligible for tax-exempt donations

      // Admin / Contact Person
      contact_person_name: { type: Sequelize.STRING, allowNull: true },
      contact_person_email: { type: Sequelize.STRING, allowNull: true },
      contact_person_phone: { type: Sequelize.STRING, allowNull: true },

      // Platform Flags
      isActive: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      isDeleted: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },

      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    },
    { timestamps: true }
  );
   


  Organization.associate = function(models) {
        Organization.belongsTo(models.User, {
            foreignKey: "userId",
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
        });
    };
  return Organization;
};
