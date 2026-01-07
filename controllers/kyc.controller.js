
"use strict";
const model = require("../models/index");
const { ReE, ReS } = require("../utils/util.service.js");
const { Op } = require("sequelize");
const verifyKycMock = require("../utils/verification.service.js");
const { sendMail } = require("../middleware/mailer.middleware.js");




const create = async (req, res) => {
  console.log("🔵 [KYC] Controller reached");
  console.log("📥 Body:", req.body);
  console.log("📎 File:", req.file);

  try {
    const { userId, documentType } = req.body;

    // Validate file
    if (!req.file) {
      console.log("❌ No file uploaded");
      return res.status(400).json({
        success: false,
        error: "No file uploaded"
      });
    }

    // Validate required fields
    if (!userId || !documentType) {
      console.log("❌ Missing userId or documentType");
      return res.status(400).json({
        success: false,
        error: "Missing required fields: userId and documentType"
      });
    }

    // Find user
    const user = await model.User.findByPk(userId);
    if (!user || user.isDeleted) {
      console.log("❌ User not found or deleted");
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }

    console.log("✅ User found:", user.email || user.mobile);

    // Get S3 file info
    const filePath = req.file.location; // S3 URL
    const s3Key = req.file.key; // S3 object key
    
    console.log("📂 File uploaded to S3:", filePath);
    console.log("🔑 S3 Key:", s3Key);

    // Create KYC entry
    const kyc = await model.KYC.create({
      userId,
      documentType,
      filePath,
      s3Key,
      status: "pending"
    });

    console.log("✅ KYC entry created with ID:", kyc.id);

    // Update user KYC status to pending
    await user.update({ kyc_status: "pending" });
    console.log("✅ User kyc_status updated to: pending");

    // Auto-verification (mock)
    console.log("🤖 Running auto-verification mock...");
    const autoStatus = verifyKycMock(s3Key);
    console.log("⚡ Auto verification result:", autoStatus);

    // Update KYC and user status based on verification
    await kyc.update({ status: autoStatus });
    await user.update({ kyc_status: autoStatus });
    console.log(`✅ KYC and user status updated to: ${autoStatus}`);

    // Send email notification
    if (user.email) {
      console.log(`📧 Sending email to: ${user.email}`);
      const subject = `Your KYC submission has been ${autoStatus}`;
      const html = `
        <p>Dear ${user.firstName || "User"},</p>
        <p>We have received your KYC submission for <strong>${documentType.toUpperCase()}</strong>.</p>
        <p>Status: <strong>${autoStatus.toUpperCase()}</strong></p>
        ${autoStatus === "approved" ? "<p>You can now access all features of the platform.</p>" : ""}
        ${autoStatus === "rejected" ? "<p>Please contact support for more information.</p>" : ""}
        <p>Thank you for using <strong>BLOCKCHAINUBI</strong>.</p>
        <br/>
        <p>Regards,</p>
        <p><strong>BLOCKCHAIN UBI TEAM</strong></p>
      `;

      try {
        await sendMail(user.email, subject, html);
        console.log("📨 Email sent successfully");
      } catch (emailError) {
        console.log("⚠️ Email sending failed:", emailError.message);
      }
    } else {
      console.log("⚠️ User has no email, skipping notification");
    }

    // Return response
    return res.status(201).json({
      success: true,
      message: `KYC submitted and ${autoStatus}`,
      data: {
        id: kyc.id,
        userId: kyc.userId,
        documentType: kyc.documentType,
        status: kyc.status,
        fileUrl: filePath,
        s3Key: s3Key,
        createdAt: kyc.createdAt
      }
    });

  } catch (err) {
    console.log("🔥 ERROR in KYC create:", err);
    return res.status(500).json({
      success: false,
      error: err.message || "Internal server error"
    });
  }
};

module.exports.create = create;

// ✅ Get all KYC records
var getAll = async (req, res) => {
    try {
        const kycList = await model.KYC.findAll({
            include: [{ model: model.User, attributes: ["id", "email", "mobile", "wallet"] }]
        });

        return ReS(res, { success: true, data: kycList }, 200);
    } catch (err) {
        return ReE(res, err.message, 500);
    }
};
module.exports.getAll = getAll;

// ✅ Update KYC status manually
var updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!["pending", "approved", "rejected"].includes(status)) {
            return ReE(res, "Invalid status value", 400);
        }

        const kyc = await model.KYC.findByPk(id, {
            include: [{ model: model.User }]
        });
        if (!kyc) return ReE(res, "KYC record not found", 404);

        await kyc.update({ status });

        // Also update user.kyc_status
        if (kyc.User) {
            await kyc.User.update({ kyc_status: status });

            // Optionally notify user
            if (kyc.User.email) {
                const subject = `Your KYC status was updated to ${status}`;
                const html = `
                    <p>Hello ${kyc.User.firstName || "User"},</p>
                    <p>Your KYC verification status has been manually updated to <strong>${status.toUpperCase()}</strong>.</p>
                    <br/>
                    <p>Regards,<br/><strong>BLOCKCHAINUBI TEAM</strong></p>
                `;

                await sendMail(kyc.User.email, subject, html);
            }
        }

        return ReS(res, { message: `KYC status updated to ${status}`, kyc }, 200);
    } catch (err) {
        return ReE(res, err.message, 500);
    }
};
module.exports.updateStatus = updateStatus;
