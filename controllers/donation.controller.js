"use strict";
const model = require("../models/index");
const { ReE, ReS } = require("../utils/util.service.js");
const { Op } = require("sequelize");




const createDonation = async (req, res) => {
  try {
    const { organizationName, userId, totalAmount, contactPersonName, contactPersonEmail, splits } = req.body;

    // 1️⃣ Validate required fields
    if (!organizationName || !userId || !totalAmount || !splits || splits.length === 0) {
      return ReE(res, "Missing required fields", 400);
    }

    // 2️⃣ Find organization by name (case-insensitive)
    const organization = await model.Organization.findOne({
      where: {
        name: { [model.Sequelize.Op.iLike]: `%${organizationName.trim()}%` },
        isDeleted: false,
      },
    });

    if (!organization) {
      return ReE(res, `Organization not found for name: "${organizationName}"`, 404);
    }

    // 3️⃣ Verify sum of splits equals totalAmount
    const sumSplits = splits.reduce((sum, s) => sum + parseFloat(s.splitAmount), 0);
    if (parseFloat(totalAmount) !== sumSplits) {
      return ReE(res, "Sum of splits does not match totalAmount", 400);
    }

    // 4️⃣ Create Donation
    const donation = await model.Donation.create({
      organizationId: organization.id,
      userId,
      organizationName: organization.name,
      totalAmount,
      contactPersonName,
      contactPersonEmail,
    });

    // 5️⃣ Create DonationSplits
    const donationSplitsData = splits.map((s) => ({
      donationId: donation.id,
      splitAmount: s.splitAmount,
      message: s.message,
      purpose: s.purpose || null, // ensure null if not provided
      transferDate: s.transferDate,
      status: "pending",
    }));

    await model.DonationSplit.bulkCreate(donationSplitsData);

    // 6️⃣ Fetch the donation with splits (purpose included explicitly)
    const result = await model.Donation.findByPk(donation.id, {
      include: [
        {
          model: model.DonationSplit,
          attributes: [
            "id",
            "donationId",
            "splitAmount",
            "message",
            "purpose",
            "transferDate",
            "status",
            "createdAt",
            "updatedAt",
          ],
        },
      ],
    });

    // 7️⃣ Return response
    return ReS(res, { message: "Donation created successfully", data: result }, 201);

  } catch (err) {
    console.error(err);
    return ReE(res, err.message, 500);
  }
};

module.exports.createDonation = createDonation;



/**
 * List all Donations with their splits
 * Optionally filter by userId or organizationId
 */
var listDonations = async (req, res) => {
  try {
    const { userId, organizationId } = req.query;
    const whereClause = { isDeleted: false };
    if (userId) whereClause.userId = userId;
    if (organizationId) whereClause.organizationId = organizationId;

    const donations = await model.Donation.findAll({
      where: whereClause,
      include: [model.DonationSplit],
      order: [["createdAt", "DESC"]],
    });

    return ReS(res, { message: "Donations fetched successfully", data: donations }, 200);
  } catch (err) {
    return ReE(res, err.message, 500);
  }
};
module.exports.listDonations = listDonations;

/**
 * Get a single Donation by ID with splits
 */
var getDonation = async (req, res) => {
  try {
    const donation = await model.Donation.findByPk(req.params.id, {
      include: [model.DonationSplit],
    });

    if (!donation || donation.isDeleted) return ReE(res, "Donation not found", 404);

    return ReS(res, { message: "Donation fetched successfully", data: donation }, 200);
  } catch (err) {
    return ReE(res, err.message, 500);
  }
};
module.exports.getDonation = getDonation;

/**
 * Update a Donation or its splits
 * req.body can contain any Donation fields or splits array
 */
var updateDonation = async (req, res) => {
  try {
    const donation = await model.Donation.findByPk(req.params.id);
    if (!donation || donation.isDeleted) return ReE(res, "Donation not found", 404);

    const { splits, ...donationFields } = req.body;

    // Update main donation fields
    await donation.update(donationFields);

    // Update splits if provided
    if (splits && splits.length > 0) {
      for (const s of splits) {
        if (s.id) {
          // Update existing split
          await model.DonationSplit.update(
            {
              splitAmount: s.splitAmount,
              message: s.message,
              transferDate: s.transferDate,
              status: s.status,
            },
            { where: { id: s.id, donationId: donation.id } }
          );
        } else {
          // Create new split
          await model.DonationSplit.create({
            donationId: donation.id,
            splitAmount: s.splitAmount,
            message: s.message,
            transferDate: s.transferDate,
            status: s.status || "pending",
          });
        }
      }
    }

    const result = await model.Donation.findByPk(donation.id, { include: [model.DonationSplit] });
    return ReS(res, { message: "Donation updated successfully", data: result }, 200);
  } catch (err) {
    return ReE(res, err.message, 500);
  }
};
module.exports.updateDonation = updateDonation;

/**
 * Soft delete a Donation
 */
var deleteDonation = async (req, res) => {
  try {
    const donation = await model.Donation.findByPk(req.params.id);
    if (!donation) return ReE(res, "Donation not found", 404);

    await donation.update({ isDeleted: true });

    return ReS(res, { message: "Donation deleted successfully" }, 200);
  } catch (err) {
    return ReE(res, err.message, 500);
  }
};
module.exports.deleteDonation = deleteDonation;

