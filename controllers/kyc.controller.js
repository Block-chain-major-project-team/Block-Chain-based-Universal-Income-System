
"use strict";
const model = require("../models/index");
const { ReE, ReS } = require("../utils/util.service.js");
const { Op } = require("sequelize");
const verifyKycMock = require("../utils/verification.service.js");
const { sendMail } = require("../middleware/mailer.middleware.js");



// ✅ Create KYC entry and internally update status
var create = async (req, res) => {
    console.log("🔵 [KYC] Controller reached - /create");

    try {
        console.log("📥 Request Body:", req.body);
        console.log("📎 Uploaded File:", req.file);

        const { userId, documentType } = req.body;

        if (!userId || !documentType) {
            console.log("⛔ Missing required fields");
            return ReE(res, "Missing required fields", 400);
        }

        if (!req.file) {
            console.log("⛔ No file uploaded");
            return ReE(res, "No file uploaded", 400);
        }

        console.log("🔍 Checking user:", userId);
        const user = await model.User.findByPk(userId);

        if (!user || user.isDeleted) {
            console.log("⛔ User not found or deleted");
            return ReE(res, "User not found", 404);
        }

        const filePath = req.file.path;
        console.log("📂 File saved at:", filePath);

        // Step 1: Create KYC
        console.log("📝 Creating KYC entry...");
        const kyc = await model.KYC.create({
            userId,
            documentType,
            filePath,
            status: "pending"
        });

        console.log("✅ KYC created:", kyc.id);

        // Step 2: Update user's KYC status
        console.log("🔄 Updating user kyc_status = pending...");
        await user.update({ kyc_status: "pending" });

        // Step 3: Auto-verification
        console.log("🤖 Running auto-verification mock...");
        const autoStatus = verifyKycMock(req.file.filename);
        console.log("⚡ Auto verification result:", autoStatus);

        // Step 4: Update KYC status
        console.log("🔄 Updating KYC record...");
        await kyc.update({ status: autoStatus });

        console.log("🔄 Updating user status...");
        await user.update({ kyc_status: autoStatus });

        // Step 5: Email
        if (user.email) {
            console.log("📧 Sending email to:", user.email);

            const subject = `Your KYC submission has been ${autoStatus}`;
            const html = `
                <p>Dear ${user.firstName || "User"},</p>
                <p>We have received your KYC submission for <strong>${documentType.toUpperCase()}</strong>.</p>
                <p>Status: <strong>${autoStatus.toUpperCase()}</strong></p>
                <p>Thank you for using <strong>BLOCKCHAINUBI</strong>.</p>
                <br/>
                <p>Regards,</p>
                <p><strong>BLOCKCHAIN UBI TEAM</strong></p>
            `;

            try {
                await sendMail(user.email, subject, html);
                console.log("📨 Email sent successfully");
            } catch (e) {
                console.log("⚠️ Email sending failed:", e.message);
            }
        }

        console.log("✅ Final response sending...");
        return ReS(res, {
            message: `KYC submitted and ${autoStatus}`,
            data: kyc
        }, 201);

    } catch (err) {
        console.log("🔥 ERROR in KYC create:", err);
        return ReE(res, err.message, 500);
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
