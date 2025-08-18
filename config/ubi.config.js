"use strict";

module.exports = {
// Base amount credited per successful claim
baseAmount: process.env.UBI_BASE_AMOUNT || "100",

// Token label used in emails/transactions (simulation)
tokenSymbol: process.env.UBI_TOKEN_SYMBOL || "USDC-SIM",

// Informational (used by UI and policy endpoint)
frequency: process.env.UBI_FREQUENCY || "monthly",
};