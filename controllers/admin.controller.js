"use strict";
const model = require("../models");
const { ReE, ReS } = require("../utils/util.service");

// POST /admin/users/:id/freeze
const freezeUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await model.User.findByPk(id);
        if (!user || user.isDeleted) return ReE(res, "User not found", 404);
        await user.update({ isFlagged: true });

        return ReS(res, { message: "User frozen (flagged) successfully" }, 200);
    } catch (err) {
        return ReE(res, err.message || "Failed to freeze user", 500);
    }
};

// POST /admin/users/:id/unfreeze
const unfreezeUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await model.User.findByPk(id);
        if (!user || user.isDeleted) return ReE(res, "User not found", 404);
        await user.update({ isFlagged: false });

        return ReS(res, { message: "User unfrozen (unflagged) successfully" }, 200);
    } catch (err) {
        return ReE(res, err.message || "Failed to unfreeze user", 500);
    }
};

// Optional: list users with filters (e.g., kyc_status, did_verified, flagged)
const listUsers = async (req, res) => {
    try {
        const { kyc, flagged } = req.query;
        const where = { isDeleted: false };
        if (kyc) where.kyc_status = kyc; // "pending" | "approved" | "rejected"
        if (typeof flagged !== "undefined") where.isFlagged = flagged === "true";

        const users = await model.User.findAll({
            where,
            attributes: { exclude: ["password"] },
            order: [["createdAt", "DESC"]],
        });

        return ReS(res, users, 200);
    } catch (err) {
        return ReE(res, err.message || "Failed to list users", 500);
    }
};

module.exports = { freezeUser, unfreezeUser, listUsers };