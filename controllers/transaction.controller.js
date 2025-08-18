"use strict";
const model = require("../models/index");
const { ReE, ReS } = require("../utils/util.service.js");
const { sendMail } = require("../middleware/mailer.middleware.js");
const crypto = require("crypto");
const UBI = require("../config/ubi.config");

// ✅ Claim UBI
// at top of file
function currentPeriodYYYYMM(date = new Date()) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    return `${y}-${m}`;
}

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

        // ✅ Require verified wallet (simulation guard)
        const walletRecord = await model.Wallet.findOne({
            where: { userId: user.id, isDeleted: false },
        });
        if (!walletRecord || !walletRecord.verified) {
            return ReE(res, "Wallet not verified. Please complete wallet verification before claiming.", 403);
        }

        // ✅ Require verified DID (simulation guard)
        if (!user.did_verified) {
            return ReE(res, "DID not verified. Please complete DID verification before claiming.", 403);
        }

        // ✅ Per-period guard: only one claim per month
        const period = currentPeriodYYYYMM();
        const alreadyClaimed = await model.Transaction.findOne({
            where: { userId: user.id, type: "ubi", period },
        });
        if (alreadyClaimed) {
            return ReE(res, `Already claimed for period ${period}.`, 409);
        }

        // Mock UBI logic
        const ubiAmount = String(UBI.baseAmount);
        const tokenSymbol = UBI.tokenSymbol;
        const txHash = "0x" + crypto.randomBytes(32).toString("hex");

        const transaction = await model.Transaction.create({
            userId: user.id,
            type: "ubi",
            amount: ubiAmount,
            token: tokenSymbol,
            txHash,
            period,
            status: "confirmed", // optional
        });

        const newBalance = parseFloat(user.balance || 0) + parseFloat(ubiAmount);
        await user.update({ balance: newBalance });

        // ✅ Send email to user after successful UBI claim
        if (user.email) {
            const subject = `UBI Claim Successful – ${ubiAmount} ${tokenSymbol} Credited`;
            const html = `
        <p>Dear ${user.firstName || "User"},</p>
        <p>You have successfully claimed your Universal Basic Income (UBI) for <strong>${period}</strong>.</p>
        <p><strong>Amount:</strong> ${ubiAmount} ${tokenSymbol}<br/>
        <strong>Transaction Hash:</strong> ${txHash}</p>
        <p>You can now view this in your portal.</p>
        <br/>
        <p>Regards,<br/><strong>BLOCKCHAINUBI TEAM</strong></p>
      `;
            await sendMail(user.email, subject, html);
        }

        return ReS(res, {
            message: `UBI of ${ubiAmount} ${tokenSymbol} credited successfully for ${period}.`,
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

