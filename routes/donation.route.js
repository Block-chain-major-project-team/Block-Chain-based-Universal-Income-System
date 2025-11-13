const express = require("express");
const router = express.Router();
const donationController = require("../controllers/donation.controller");

// Create a donation with splits
router.post("/create", donationController.createDonation);

// List all donations, optionally filter by userId or organizationId
router.get("/list", donationController.listDonations);

// Get a single donation by ID with splits
router.get("/:id", donationController.getDonation);

// Update a donation and/or its splits
router.put("/update/:id", donationController.updateDonation);

// Soft delete a donation
router.delete("/delete/:id", donationController.deleteDonation);

module.exports = router;
