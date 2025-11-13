"use strict";
const model = require("../models/index");
const { ReE, ReS } = require("../utils/util.service.js");

/**
 * Register a new Organization
 * req.file can contain bank_passbook_pic
 */
var addOrganization = async (req, res) => {
  try {
    const {
      userId,
      name,
      email,
      phone,
      website,
      address,
      purpose,
      mission,
      category,
      bank_name,
      account_number,
      ifsc_code,
      branch_name,
      gst_number,
      registration_number,
      tax_exemption_status,
      contact_person_name,
      contact_person_email,
      contact_person_phone,
    } = req.body;

    if (!userId || !name || !email || !phone) {
      return ReE(res, "Missing required fields: userId, name, email, or phone", 400);
    }

    // Check uniqueness
    const existingOrg = await model.Organization.findOne({
      where: {
        [model.Sequelize.Op.or]: [{ email }, { phone }, { account_number }],
      },
    });
    if (existingOrg) return ReE(res, "Organization with same email, phone, or account number already exists", 409);

    let bank_passbook_pic = null;
    if (req.file) bank_passbook_pic = req.file.path;

    const organization = await model.Organization.create({
      userId,
      name,
      email,
      phone,
      website,
      address,
      purpose,
      mission,
      category,
      bank_name,
      account_number,
      ifsc_code,
      branch_name,
      gst_number,
      registration_number,
      tax_exemption_status: tax_exemption_status || false,
      contact_person_name,
      contact_person_email,
      contact_person_phone,
      bank_passbook_pic,
      isActive: true,
      isDeleted: false,
    });

    return ReS(res, {
      message: "Organization registered successfully",
      data: organization,
    }, 201);

  } catch (err) {
    return ReE(res, err.message, 500);
  }
};

module.exports.addOrganization = addOrganization;

/**
 * Update Organization details
 * Can also update bank_passbook_pic
 */
var updateOrganization = async (req, res) => {
  try {
    const { id } = req.params;
    const organization = await model.Organization.findByPk(id);
    if (!organization || organization.isDeleted) return ReE(res, "Organization not found", 404);

    const updateFields = { ...req.body };
    if (req.file) updateFields.bank_passbook_pic = req.file.path;

    await organization.update(updateFields);

    return ReS(res, {
      message: "Organization updated successfully",
      data: organization,
    }, 200);
  } catch (err) {
    return ReE(res, err.message, 500);
  }
};

module.exports.updateOrganization = updateOrganization;

/**
 * List all Organizations (optional: filter by category)
 */
var listOrganizations = async (req, res) => {
  try {
    const { category } = req.query;
    const whereClause = { isDeleted: false };
    if (category) whereClause.category = category;

    const organizations = await model.Organization.findAll({
      where: whereClause,
      order: [["createdAt", "DESC"]],
    });

    return ReS(res, {
      message: "Organizations fetched successfully",
      data: organizations,
    }, 200);
  } catch (err) {
    return ReE(res, err.message, 500);
  }
};
module.exports.listOrganizations = listOrganizations;

/**
 * Soft delete an organization
 */
var deleteOrganization = async (req, res) => {
  try {
    const { id } = req.params;
    const organization = await model.Organization.findByPk(id);
    if (!organization) return ReE(res, "Organization not found", 404);

    await organization.update({ isDeleted: true });
    return ReS(res, "Organization deleted successfully", 200);
  } catch (err) {
    return ReE(res, err.message, 500);
  }
};
module.exports.deleteOrganization = deleteOrganization;
