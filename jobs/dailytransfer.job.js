"use strict";

const cron = require("node-cron");
const model = require("../models/index");
const { Op } = require("sequelize");

console.log("💡 dailytransfer.job file loaded");

// -----------------------------
// Hardcoded Purpose → Shop/NGO mapping
// -----------------------------
const PURPOSE_SHOPS = {
  Pens: ["Snaa Stationeries", "Jaya Stationeries", "Rithik Stationeries", "A1 Stationeries"],
  Books: ["Jaya Book Store", "Snaa Book Store", "Rithik Books", "A1 Books"],
  Clothes: ["Fashion Hub", "Snaa Garments", "Urban Wear", "Kids World"],
  Bricks: ["BuildMart", "Snaa Construction", "Rithik Traders", "Urban Bricks Co."],
  Benches: ["Urban Furniture", "Snaa Benches", "Rithik Benches", "Park Furniture Co."],
  Benche: ["Urban Furniture", "Snaa Benches", "Rithik Benches", "Park Furniture Co."],
  Notebooks: ["PaperWorld", "Snaa Notebooks", "Rithik Stationeries", "BookPoint"],
  Shoes: ["StepUp Shoes", "Snaa Footwear", "Rithik Shoes", "Urban Steps"],
  Toys: ["FunLand Toys", "Snaa Toys", "Rithik Toys", "KidsPlay Store"],
  Food: ["FoodMart", "Snaa Foods", "Rithik Groceries", "Urban Deli"],
  Medicines: ["HealthPlus Pharmacy", "Snaa Pharma", "Rithik Meds", "Urban HealthStore"],
  Bags: ["BagMart", "Snaa Bags", "Rithik Bags", "Urban Bags Co."],
  WaterBottles: ["HydroStore", "Snaa Bottles", "Rithik Hydration", "Urban Bottles"],
  Stationery: ["Snaa Stationeries", "Jaya Stationeries", "Rithik Stationeries", "PaperPoint"],
  Computers: ["TechMart", "Snaa Computers", "Rithik IT Store", "Urban TechCo"],
  Chairs: ["Furniture Hub", "Snaa Chairs", "Rithik Furniture", "Urban Office Co."],
  SolarLights: ["SolarWorld", "Snaa Solar", "Rithik Energy", "GreenLight Co."],
  Blankets: ["Warmth Store", "Snaa Blankets", "Rithik Comforts", "Urban Warmth"],
  Masks: ["HealthStore", "Snaa Masks", "Rithik Health Supplies", "SafeMasks Co."],
  HygieneKits: ["CareMart", "Snaa Hygiene", "Rithik Health Supplies", "CleanKit Store"],
  SportsEquipment: ["SportsHub", "Snaa Sports", "Rithik Gear", "Urban Sports Co."]
};

// -----------------------------
// Helper: pick random shop
// -----------------------------
function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// -----------------------------
// Helper: adjust amount based on ranges
// -----------------------------
function adjustAmount(originalAmount) {
  if (originalAmount < 1000) {
    return originalAmount * 0.85; // reduce 15% for hundreds
  } else if (originalAmount < 10000) {
    const thousands = Math.floor(originalAmount / 1000);
    return originalAmount * (1 - 0.01 * thousands); // 1% per 1k
  } else if (originalAmount <= 100000) {
    const tensOfThousands = Math.floor(originalAmount / 10000);
    return originalAmount * (1 - 0.02 * tensOfThousands); // 2% per 10k
  }
  return originalAmount; // above 1 lakh, no reduction
}

// -----------------------------
// Main cron job function
// -----------------------------
async function runDonationTransfer() {
  console.log("⏰ Running donation transfer job at", new Date().toISOString());

  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const splitsToProcess = await model.DonationSplit.findAll({
      where: {
        transferDate: { [Op.between]: [startOfDay, endOfDay] },
        status: "pending",
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
      return;
    }

    // Process each split
    for (const split of splitsToProcess) {
      await split.update({ status: "completed" });

      // Adjust amount
      const adjustedAmount = adjustAmount(split.splitAmount);

      // Pick random shop for purpose
      const purpose = split.purpose || "General";
      const shops = PURPOSE_SHOPS[purpose] || ["Local Vendor"];
      const shopName = pickRandom(shops);

      // Create message
      const message = `₹${adjustedAmount.toFixed(2)} sent to ${shopName} for ${purpose}`;

      // Save Amount record
      await model.Amount.create({
        donationSplitId: split.id,
        donationId: split.Donation.id,
        donatorId: split.Donation.userId,
        organizationId: split.Donation.organizationId,
        userId: split.Donation.userId,
        amount: adjustedAmount,
        amountDate: new Date(),
        remarks: message,
        reciept: message, // store the message here only
        isDeleted: false,
      });

      console.log(`✅ ${message}`);
    }

    console.log("✅ Donation transfer job completed.");
  } catch (err) {
    console.error("❌ Error in donation transfer job:", err.message);
  }
}

// -----------------------------
// Schedule cron
// -----------------------------
cron.schedule("*/2 * * * *", runDonationTransfer);

// -----------------------------
// Export
// -----------------------------
module.exports = { runDonationTransfer };
