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
const { sendMail } = require("../utils/mailer"); // your existing mailer

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
          include: [
            {
              model: model.Organization,
              attributes: ["id", "name", "email", "contact_person_name"],
            },
          ],
        },
      ],
    });

    if (splitsToProcess.length === 0) {
      console.log("ℹ️ No pending donation splits found for today.");
      return;
    }

    for (const split of splitsToProcess) {
      await split.update({ status: "completed" });

      const adjustedAmount = adjustAmount(split.splitAmount);
      const purpose = split.purpose || "General";
      const shops = PURPOSE_SHOPS[purpose] || ["Local Vendor"];
      const shopName = pickRandom(shops);
      const message = `₹${adjustedAmount.toFixed(2)} sent to ${shopName} for ${purpose}`;

      // Save Amount record
      const amountRecord = await model.Amount.create({
        donationSplitId: split.id,
        donationId: split.Donation.id,
        donatorId: split.Donation.userId,
        organizationId: split.Donation.organizationId,
        userId: split.Donation.userId,
        amount: adjustedAmount,
        amountDate: new Date(),
        remarks: message,
        reciept: message,
        isDeleted: false,
      });

      console.log(`✅ ${message}`);

      // -----------------------------
      // Send HTML email to the organization
      // -----------------------------
      const org = split.Donation.Organization;
      if (org && org.email) {
        const subject = `Donation Received: ₹${adjustedAmount.toFixed(2)}`;
        const html = `
          <p>Dear ${org.contact_person_name || org.name},</p>
          <p>We are pleased to inform you that your organization <strong>${org.name}</strong> has received a donation.</p>
          <table style="border-collapse: collapse; width: 100%;">
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;">Amount Funded</td>
              <td style="padding: 8px; border: 1px solid #ddd;">₹${adjustedAmount.toFixed(2)}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;">Purpose</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${purpose}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;">Shop/Vendor</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${shopName}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;">Remarks</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${message}</td>
            </tr>
          </table>
          <br/>
          <p>Thank you for your work and dedication!</p>
          <p><strong>BlockchainUBI Team</strong></p>
        `;

        await sendMail(org.email, subject, html);
        console.log(`✉️ HTML email sent to ${org.email}`);
      }
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
