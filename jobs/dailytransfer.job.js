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

    // 2️⃣ Fetch pending donation splits scheduled for today
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

    // 3️⃣ Process each split
    for (const split of splitsToProcess) {
      await split.update({ status: "completed" });

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

    console.log("✅ Donation transfer job completed.");
  } catch (err) {
    console.error("❌ Error in donation transfer job:", err.message);
  }
}

// 4️⃣ Schedule cron to run every 2 minutes for testing
cron.schedule("*/2 * * * *", runDonationTransfer);

// 5️⃣ Export the function so it can be called manually if needed
module.exports = { runDonationTransfer };
