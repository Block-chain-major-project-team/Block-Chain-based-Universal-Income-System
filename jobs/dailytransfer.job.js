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

    // 2️⃣ Fetch pending donation splits for today using transferDate
    const splitsToProcess = await model.DonationSplit.findAll({
      where: {
        transferDate: { [Op.between]: [startOfDay, endOfDay] }, // <- fixed
        status: "pending",
        // isDeleted is not in your model, remove it if unnecessary
      },
      include: [
        {
          model: model.Donation,
          attributes: ["id", "organizationId", "userId", "organizationName", "totalAmount"],
        },
      ],
    });

    if (splitsToProcess.length === 0) {
      console.log("ℹ️ No pending donation splits found for today.");
    }

    // 3️⃣ Process each split
    for (const split of splitsToProcess) {
      await split.update({ status: "completed" });

      await model.ReceivedAmount.create({
        donationSplitId: split.id,
        donationId: split.Donation.id,
        donatorId: split.userId,
        organizationId: split.Donation.organizationId,
        userId: split.userId,
        receivedAmount: split.splitAmount,
        receivedDate: new Date(),
        remarks: "Transferred successfully by cron job",
      });

      console.log(`✅ Donation split ${split.id} transferred successfully`);
    }

    console.log("✅ Donation transfer job completed.");
  } catch (err) {
    console.error("❌ Error in donation transfer job:", err.message);
  }
}

// 4️⃣ Schedule cron to run every 2 minutes for testing
cron.schedule("*/2 * * * *", runDonationTransfer);

// 5️⃣ Export the function so it can be run manually if needed
module.exports = { runDonationTransfer };
