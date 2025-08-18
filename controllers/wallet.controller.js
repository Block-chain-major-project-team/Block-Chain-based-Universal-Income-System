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

// POST /wallet/request-code
const requestCode = async (req, res) => {
  try {
    const { userId, wallet } = req.body;
    if (!userId || !wallet) return ReE(res, "Missing userId or wallet", 400);

    const user = await model.User.findByPk(userId);
    if (!user || user.isDeleted) return ReE(res, "User not found", 404);

    // Ensure address not used by another user
    const existingWallet = await model.Wallet.findOne({
      where: { address: wallet, isDeleted: false },
    });
    if (existingWallet && existingWallet.userId !== Number(userId)) {
      return ReE(res, "Wallet address already linked to another user", 409);
    }

    // Find wallet for this user (if any)
    let userWallet = await model.Wallet.findOne({
      where: { userId: userId, isDeleted: false },
    });

    const code = generateNumericCode(6);
    const expiresAt = expiryFromNow(10);

    if (!userWallet) {
      // Create new wallet record
      userWallet = await model.Wallet.create({
        userId,
        address: wallet.trim(),
        verified: false,
        verificationCode: code,
        verificationExpiresAt: expiresAt,
      });
    } else {
      // If address differs, decide policy (here we allow update)
      if (userWallet.address.toLowerCase() !== wallet.toLowerCase()) {
        userWallet.address = wallet.trim();
      }
      userWallet.verified = false;
      userWallet.verificationCode = code;
      userWallet.verificationExpiresAt = expiresAt;
      await userWallet.save();
    }

    // Email the code (simulation; keep code in response for dev)
    if (user.email) {
      const subject = "Wallet Verification Code";
      const html = `
        <p>Dear ${user.firstName || "User"},</p>
        <p>Your wallet verification code is: <strong>${code}</strong></p>
        <p>This code will expire at ${expiresAt.toISOString()}.</p>
        <br/>
        <p>Regards,<br/><strong>BLOCKCHAINUBI TEAM</strong></p>
      `;
      await sendMail(user.email, subject, html);
    }

    // Return code for simulation/dev use
    return ReS(res, { message: "Code generated", data: { code, expiresAt } }, 200);
  } catch (err) {
    return ReE(res, err.message, 500);
  }
};

// POST /wallet/verify
const verify = async (req, res) => {
  try {
    const { userId, wallet, code } = req.body;
    if (!userId || !wallet || !code) {
      return ReE(res, "Missing userId, wallet, or code", 400);
    }

    const user = await model.User.findByPk(userId);
    if (!user || user.isDeleted) return ReE(res, "User not found", 404);

    const userWallet = await model.Wallet.findOne({
      where: { userId: userId, isDeleted: false },
    });
    if (!userWallet) return ReE(res, "No wallet pending verification", 404);

    if (userWallet.address.toLowerCase() !== wallet.toLowerCase()) {
      return ReE(res, "Wallet address mismatch", 400);
    }

    if (!userWallet.verificationCode || !userWallet.verificationExpiresAt) {
      return ReE(res, "No active verification code. Please request a new one.", 400);
    }

    const now = new Date();
    if (now > new Date(userWallet.verificationExpiresAt)) {
      return ReE(res, "Verification code expired. Please request a new one.", 400);
    }

    if (String(code).trim() !== String(userWallet.verificationCode).trim()) {
      return ReE(res, "Invalid verification code", 400);
    }

    // Success: mark verified and clear code data
    userWallet.verified = true;
    userWallet.verificationCode = null;
    userWallet.verificationExpiresAt = null;
    await userWallet.save();

    return ReS(res, { message: "Wallet verified successfully" }, 200);
  } catch (err) {
    return ReE(res, err.message, 500);
  }
};

module.exports = { requestCode, verify };
