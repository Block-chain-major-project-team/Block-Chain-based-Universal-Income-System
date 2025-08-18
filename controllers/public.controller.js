controllers / public.controller.js
"use strict";
const model = require("../models");
const { ReE, ReS } = require("../utils/util.service");
const { Sequelize } = require("sequelize");

// GET /public/stats/summary
const getSummary = async (req, res) => {
    try {
        const totalUsers = await model.User.count({ where: { isDeleted: false } });
        const approvedUsers = await model.User.count({
            where: { isDeleted: false, kyc_status: "approved" },
        });
        const totals = await model.Transaction.findAll({
            attributes: [
                [Sequelize.fn("COALESCE", Sequelize.fn("SUM", Sequelize.col("amount")), 0), "totalAmount"],
                [Sequelize.fn("COUNT", Sequelize.col("id")), "txCount"],
            ],
            where: { type: "ubi" },
            raw: true,
        });

        const totalAmount = String(totals?.totalAmount || 0);
        const txCount = Number(totals?.txCount || 0);

        return ReS(
            res,
            {
                total_users: totalUsers,
                kyc_approved_users: approvedUsers,
                total_distributed_amount: totalAmount,
                total_transactions: txCount,
            },
            200
        );
    } catch (err) {
        return ReE(res, err.message, 500);
    }
};

// GET /public/stats/monthly
const getMonthly = async (req, res) => {
    try {
        const rows = await model.Transaction.findAll({
            attributes: [
                "period",
                [Sequelize.fn("COUNT", Sequelize.col("id")), "transactions"],
                [Sequelize.fn("COALESCE", Sequelize.fn("SUM", Sequelize.col("amount")), 0), "amount"],
            ],
            where: { type: "ubi" },
            group: ["period"],
            order: [["period", "ASC"]],
            raw: true,
        });
        // Normalize to strings
        const data = rows.map((r) => ({
            period: r.period,
            transactions: Number(r.transactions || 0),
            amount: String(r.amount || 0),
        }));

        return ReS(res, data, 200);
    } catch (err) {
        return ReE(res, err.message, 500);
    }
};

// GET /public/ledger?period=YYYY-MM
const getLedger = async (req, res) => {
    try {
        const { period } = req.query;
        const where = { type: "ubi" };
        if (period) where.period = String(period);
        const rows = await model.Transaction.findAll({
            attributes: ["txHash", "amount", "token", "createdAt", "period"],
            where,
            order: [["createdAt", "DESC"]],
            raw: true,
        });

        const data = rows.map((r) => ({
            txHash: r.txHash,
            amount: String(r.amount),
            token: r.token || "USDC-SIM",
            createdAt: r.createdAt,
            period: r.period,
        }));

        return ReS(res, data, 200);
    } catch (err) {
        return ReE(res, err.message, 500);
    }
};

module.exports = { getSummary, getMonthly, getLedger };