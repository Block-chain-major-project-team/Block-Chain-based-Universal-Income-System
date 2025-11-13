"use strict";
const model = require("../models/index");
const { ReE, ReS } = require("../utils/util.service.js");
const { Op } = require("sequelize");
const { sendMail } = require("../middleware/mailer.middleware.js");

/**
 * Add a new Donator and notify the User via email
 */
var addDonator = async (req, res) => {
  try {
    const {
      userId,
      email,
      phone_number,
      address,
      designation,
      aadhaar_number,
      pan_number,
      bank_name,
      bank_address,
      ifsc_code,
      branch,
      account_number,
      account_holder_name,
      gst_number,
    } = req.body;

    if (!userId || !email || !phone_number) {
      return ReE(res, "Missing required fields: userId, email, or phone_number", 400);
    }

    const user = await model.User.findByPk(userId);
    if (!user || user.isDeleted) return ReE(res, "User not found", 404);

    const existingDonator = await model.Donator.findOne({
      where: {
        [Op.or]: [
          { email },
          { phone_number },
          { account_number },
          { aadhaar_number },
          { pan_number },
        ],
      },
    });
    if (existingDonator) return ReE(res, "Donator with same details already exists", 400);

    let bank_passbook_pic = null;
    if (req.file) bank_passbook_pic = req.file.path;

    const donator = await model.Donator.create({
      userId,
      email,
      phone_number,
      address,
      designation,
      aadhaar_number,
      pan_number,
      bank_name,
      bank_address,
      ifsc_code,
      branch,
      account_number,
      account_holder_name,
      gst_number,
      bank_passbook_pic,
      isVerified: false,
      isFlagged: false,
      isDeleted: false,
    });

    // Send email to user
    if (user.email) {
      const subject = "Donator Added Successfully";
      const html = `
        <p>Dear ${user.firstName || "User"},</p>
        <p>A new donator has been successfully added and linked to your account.</p>
        <p><strong>Donator Details:</strong></p>
        <ul>
          <li>Email: ${donator.email}</li>
          <li>Phone: ${donator.phone_number}</li>
          <li>Designation: ${donator.designation || "N/A"}</li>
        </ul>
        <p>Thank you for using <strong>BLOCKCHAINUBI</strong>.</p>
        <br/>
        <p>Regards,</p>
        <p><strong>BLOCKCHAIN UBI TEAM</strong></p>
      `;

      await sendMail(user.email, subject, html);
    }

    return ReS(res, {
      message: "Donator added successfully and user notified via email",
      data: donator,
    }, 201);

  } catch (err) {
    return ReE(res, err.message, 500);
  }
};

module.exports.addDonator = addDonator;

var updateDonator = async (req, res) => {
  try {
    const { id } = req.params;
    const donator = await model.Donator.findByPk(id);
    if (!donator || donator.isDeleted) return ReE(res, "Donator not found", 404);

    const updateFields = { ...req.body };
    if (req.file) updateFields.bank_passbook_pic = req.file.path;

    await donator.update(updateFields);

    return ReS(res, {
      message: "Donator updated successfully",
      data: donator,
    }, 200);

  } catch (err) {
    return ReE(res, err.message, 500);
  }
};

module.exports.updateDonator = updateDonator;

/**
 * List all Donators (optionally filter by userId)
 */
var listDonators = async (req, res) => {
  try {
    const { userId } = req.query;
    const whereClause = { isDeleted: false };
    if (userId) whereClause.userId = userId;

    const donators = await model.Donator.findAll({
      where: whereClause,
      include: [{ model: model.User, as: "user", attributes: ["id", "firstName", "email"] }],
      order: [["createdAt", "DESC"]],
    });

    return ReS(res, {
      message: "Donators fetched successfully",
      data: donators,
    }, 200);

  } catch (err) {
    return ReE(res, err.message, 500);
  }
};

module.exports.listDonators = listDonators;

/**
 * Soft delete a Donator
 */
var deleteDonator = async (req, res) => {
  try {
    const donator = await model.Donator.findByPk(req.params.id);
    if (!donator) return ReE(res, "Donator not found", 404);

    await donator.update({ isDeleted: true });

    return ReS(res, "Donator deleted successfully", 200);
  } catch (err) {
    return ReE(res, err.message, 500);
  }
};

module.exports.deleteDonator = deleteDonator;

var loginDonator = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return ReE(res, "Email and password are required", 400);

    const donator = await model.Donator.findOne({ where: { email, isDeleted: false } });
    if (!donator) return ReE(res, "Donator not found", 404);

    // If password field exists (assumes password is hashed)
    if (!donator.password) return ReE(res, "Password not set for this Donator", 403);

    const isMatch = await bcrypt.compare(password, donator.password);
    if (!isMatch) return ReE(res, "Invalid credentials", 401);

    // Optionally, generate a token here if using JWT/session
    return ReS(res, { message: "Login successful", donator }, 200);

  } catch (err) {
    return ReE(res, err.message, 500);
  }
};
module.exports.loginDonator = loginDonator;
