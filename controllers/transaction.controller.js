"use strict";
const model = require("../models/index");
const { ReE, ReS } = require("../utils/util.service.js");
const { sendMail } = require("../middleware/mailer.middleware.js");
const crypto = require("crypto");

// ✅ Claim UBI
const claimUBI = async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) return ReE(res, "User ID is required.", 400);

        const user = await model.User.findByPk(userId);
        if (!user || user.isDeleted) return ReE(res, "User not found", 404);

        if (user.kyc_status !== "approved") {
            return ReE(res, "User is not KYC verified.", 403);
        }

        // Mock UBI logic
        const ubiAmount = "100";
        const txHash = "0x" + crypto.randomBytes(32).toString("hex");

        const transaction = await model.Transaction.create({
            userId: user.id,
            type: "ubi",
            amount: ubiAmount,
            txHash
        });

        const newBalance = parseFloat(user.balance || 0) + parseFloat(ubiAmount);
        await user.update({ balance: newBalance });

        // ✅ Send email to user after successful UBI claim
        if (user.email) {
            const subject = `UBI Claim Successful – ${ubiAmount} Credited`;
            const html = `
                <p>Dear ${user.firstName || "User"},</p>
                <p>You have successfully claimed your Universal Basic Income (UBI).</p>
                <p><strong>Amount:</strong> ${ubiAmount} USDC<br/>
                <strong>Transaction Hash:</strong> ${txHash}</p>
                <p>You can now view this in your wallet or on our platform.</p>
                <br/>
                <p>Regards,<br/><strong>BLOCKCHAINUBI TEAM</strong></p>
            `;

            await sendMail(user.email, subject, html);
        }

        return ReS(res, {
            message: `UBI of ${ubiAmount} credited successfully.`,
            transaction
        }, 200);

    } catch (err) {
        console.error("UBI Claim Error:", err);
        return ReE(res, err.message || "Something went wrong", 500);
    }
};

module.exports.claimUBI = claimUBI;

// ✅ Get Balance Endpoint
const getBalance = async (req, res) => {
    try {
        const userId = req.params.userId;
        
        // Check if user exists
        const user = await model.User.findByPk(userId);
        if (!user) return ReE(res, "User not found", 404);

        return ReS(res, { balance: user.balance || 0 }, 200);
    } catch (err) {
        return ReE(res, err.message, 500);
    }
};
module.exports.getBalance = getBalance;

// ✅ Get Transaction History Endpoint
const getTransactionHistory = async (req, res) => {
    try {
        const userId = req.params.userId;
        
        // Check if user exists
        const user = await model.User.findByPk(userId);
        if (!user) return ReE(res, "User not found", 404);

        // Fetch transactions for the user
        const transactions = await model.Transaction.findAll({
            where: { userId: user.id },
            order: [["createdAt", "DESC"]]  // Ordering by latest transactions first
        });

        // If no transactions found
        if (!transactions.length) {
            return ReE(res, "No transactions found for this user.", 200);
        }

        return ReS(res, { transactions }, 200);
    } catch (err) {
        return ReE(res, err.message, 500);
    }
};
module.exports.getTransactionHistory = getTransactionHistory;

