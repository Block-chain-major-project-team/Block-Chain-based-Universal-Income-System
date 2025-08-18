controllers/policy.controller.js
"use strict";
const { ReS } = require("../utils/util.service");
const UBI = require("../config/ubi.config");

function currentPeriodYYYYMM(date = new Date()) {
const y = date.getFullYear();
const m = String(date.getMonth() + 1).padStart(2, "0");
return `${y}-${m}`;
}

// GET /policy
const getPolicy = async (req, res) => {
try {
const period = currentPeriodYYYYMM();
return ReS(res, {
baseAmount: String(UBI.baseAmount),
tokenSymbol: UBI.tokenSymbol,
frequency: UBI.frequency,
currentPeriod: period,
}, 200);
} catch (err) {
// Should not usually fail, but keep consistent error handling
return ReE(res, err.message || "Failed to fetch policy", 500);
}
};

module.exports = { getPolicy };