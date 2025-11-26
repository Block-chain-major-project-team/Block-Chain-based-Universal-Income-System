"use strict";
const model = require("../models");
const { ReE, ReS } = require("../utils/util.service");
const { Op } = require("sequelize");
const { sendMail } = require("../middleware/mailer.middleware");

// Helpers
function generateNumericCode(length = 6) {
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  return String(Math.floor(Math.random() * (max - min + 1)) + min);
}
function expiryFromNow(minutes = 10) {
  const d = new Date();
  d.setMinutes(d.getMinutes() + minutes);
  return d;
}

// Example function to generate a DID (simple placeholder; in production use DID method)
function generateDID(userId) {
  return `did:example:${userId}-${Date.now()}`;
}

// POST /did/request-code
const requestDidCode = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return ReE(res, "Missing userId", 400);

    const user = await model.User.findByPk(userId);
    if (!user || user.isDeleted) return ReE(res, "User not found", 404);

    // Generate a DID automatically
    const did = generateDID(userId);

    // Enforce uniqueness of DID across users (should rarely happen)
    const duplicate = await model.User.findOne({
      where: { did, id: { [Op.ne]: userId }, isDeleted: false },
    });
    if (duplicate) return ReE(res, "Generated DID already exists. Try again.", 500);

    // Generate verification code
    const code = generateNumericCode(6);
    const expiresAt = expiryFromNow(10);

    // Update user with DID and code
    await user.update({
      did,
      did_verified: false,
      did_verification_code: code,
      did_verification_expires_at: expiresAt,
    });

    // Send code via email
    if (user.email) {
      const subject = "DID Verification Code";
      const html = `
        <p>Dear ${user.firstName || "User"},</p>
        <p>Your new DID is: <strong>${did}</strong></p>
        <p>Your verification code is: <strong>${code}</strong></p>
        <p>This code will expire at ${expiresAt.toISOString()}.</p>
        <br/>
        <p>Regards,<br/><strong>BLOCKCHAINUBI TEAM</strong></p>
      `;
      await sendMail(user.email, subject, html);
    }

    return ReS(res, {
      message: "DID generated and code sent",
      data: { did, code, expiresAt },
    }, 200);
  } catch (err) {
    return ReE(res, err.message, 500);
  }
};

// POST /did/verify
const verifyDidCode = async (req, res) => {
  try {
    const { userId, code } = req.body;
    if (!userId || !code) return ReE(res, "Missing userId or code", 400);

    const user = await model.User.findByPk(userId);
    if (!user || user.isDeleted) return ReE(res, "User not found", 404);

    if (!user.did || !user.did_verification_code || !user.did_verification_expires_at) {
      return ReE(res, "No active DID verification code. Please request a new one.", 400);
    }

    const now = new Date();
    if (now > new Date(user.did_verification_expires_at)) {
      return ReE(res, "DID verification code expired. Please request a new one.", 400);
    }

    if (String(code).trim() !== String(user.did_verification_code).trim()) {
      return ReE(res, "Invalid DID verification code", 400);
    }

    // Mark DID as verified
    await user.update({
      did_verified: true,
      did_verification_code: null,
      did_verification_expires_at: null,
    });

    return ReS(res, { message: "DID verified successfully", data: { did: user.did } }, 200);
  } catch (err) {
    return ReE(res, err.message, 500);
  }
};

module.exports = { requestDidCode, verifyDidCode };

