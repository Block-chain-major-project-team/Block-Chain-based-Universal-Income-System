"use strict";

const cron = require("node-cron");
const model = require("../models/index");
const { Op } = require("sequelize");

console.log("💡 dailytransfer.job file loaded");

// 1️⃣ Define the job function
async function runDonationTransfer() {
  console.log("⏰ Running donation transfer job at", new Date().toISOString());

  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    // 2️⃣ Fetch pending donation splits for today
    const splitsToProcess = await model.DonationSplit.findAll({
      where: {
        transferDate: { [Op.between]: [startOfDay, endOfDay] },
        status: "pending",
      },
      include: [
        {
          model: model.Donation,
          attributes: [
            "id",
            "organizationId",
            "userId",
            "organizationName",
            "totalAmount",
          ],
        },
      ],
    });

    if (splitsToProcess.length === 0) {
      console.log("ℹ️ No pending donation splits found for today.");
      return;
    }

    // 3️⃣ Process each split
    for (const split of splitsToProcess) {
      // mark split as completed
      await split.update({ status: "completed" });

      // create Amount entry
      await model.Amount.create({
        donationSplitId: split.id,
        donationId: split.Donation.id,
        donatorId: split.Donation.userId,          // donor
        organizationId: split.Donation.organizationId,
        userId: split.Donation.userId,             // admin / platform user (adjust if different)
        amount: split.splitAmount,
        amountDate: new Date(),
        remarks: "Transferred successfully by cron job",
        isDeleted: false,
      });

      console.log(`✅ Donation split ${split.id} transferred successfully`);
    }

    console.log("✅ Donation transfer job completed.");
  } catch (err) {
    console.error("❌ Error in donation transfer job:", err.message);
  }
}

// 4️⃣ Schedule cron to run every 2 minutes (testing)
cron.schedule("*/2 * * * *", runDonationTransfer);

// 5️⃣ Export for manual trigger
module.exports = { runDonationTransfer };
