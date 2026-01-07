"use strict";

const cron = require("node-cron");
const model = require("../models/index");
const { Op } = require("sequelize");

// Cron job: runs every day at 04:30 AM
cron.schedule("30 4 * * *", async () => {
  console.log("⏰ Starting daily donation transfer job at 4:30 AM...");

  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    // 1️⃣ Fetch all donation splits scheduled for today and pending
    const splitsToProcess = await model.DonationSplit.findAll({
      where: {
        scheduledDate: { [Op.between]: [startOfDay, endOfDay] },
        status: "pending",
        isDeleted: false,
      },
      include: [
        {
          model: model.Donation,
          attributes: ["id", "organizationId", "userId", "organizationName", "totalAmount"],
        },
      ],
    });

    for (const split of splitsToProcess) {
      // 2️⃣ Mark split as completed
      await split.update({ status: "completed" });

      // 3️⃣ Create received amount entry
      await model.ReceivedAmount.create({
        donationSplitId: split.id,
        donationId: split.Donation.id,
        donatorId: split.userId,
        organizationId: split.Donation.organizationId,
        userId: split.userId,
        receivedAmount: split.amount,
        receivedDate: new Date(),
        remarks: "Transferred successfully by cron job",
      });

      console.log(`✅ Donation split ${split.id} transferred successfully`);
    }

    console.log("✅ Daily donation transfer job completed.");
  } catch (err) {
    console.error("❌ Error in daily donation transfer cron job:", err.message);
  }
});
