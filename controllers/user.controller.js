"use strict";
const model = require("../models/index");
const { ReE, ReS } = require("../utils/util.service.js");
const bcrypt = require("bcryptjs");
const { Op } = require("sequelize");

// ✅ Register a new user
var register = async (req, res) => {
    try {
        const { wallet, email, mobile, password, did } = req.body;

        if (!wallet || !email || !mobile || !password) return ReE(res, "Missing required fields", 400);

        const exists = await model.User.findOne({
            where: {
                [Op.or]: [{ wallet }, { email }, { mobile }]
            }
        });
        if (exists) return ReE(res, "User already exists", 409);

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await model.User.create({
            wallet,
            email,
            mobile,
            password: hashedPassword,
            did
        });

        return ReS(res, user, 201);
    } catch (err) {
        return ReE(res, err.message, 422);
    }
};
module.exports.register = register;

// ✅ Login user
var login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) return ReE(res, "Email and password are required", 400);

        const user = await model.User.findOne({ where: { email } });

        if (!user || user.isDeleted) return ReE(res, "User not found", 404);

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return ReE(res, "Invalid credentials", 401);

        return ReS(res, { message: "Login successful", user }, 200);
    } catch (err) {
        return ReE(res, err.message, 500);
    }
};
module.exports.login = login;

// ✅ Fetch all users (not deleted)
var fetchAll = async (req, res) => {
    try {
        const users = await model.User.findAll({
            where: { isDeleted: false },
            attributes: { exclude: ["password"] }
        });
        return ReS(res, { success: true, data: users }, 200);
    } catch (err) {
        return ReE(res, err.message, 500);
    }
};
module.exports.fetchAll = fetchAll;

// ✅ Fetch a single user by ID
var fetchSingle = async (req, res) => {
    try {
        const user = await model.User.findByPk(req.params.id, {
            attributes: { exclude: ["password"] }
        });

        if (!user || user.isDeleted) return ReE(res, "User not found", 404);

        return ReS(res, user, 200);
    } catch (err) {
        return ReE(res, err.message, 500);
    }
};
module.exports.fetchSingle = fetchSingle;

// ✅ Update a user
var updateUser = async (req, res) => {
    try {
        const user = await model.User.findByPk(req.params.id);
        if (!user || user.isDeleted) return ReE(res, "User not found", 404);

        const { email, mobile, password } = req.body;
        let updates = {};

        if (email) updates.email = email;
        if (mobile) updates.mobile = mobile;
        if (password) updates.password = await bcrypt.hash(password, 10);

        await user.update(updates);

        return ReS(res, user, 200);
    } catch (err) {
        return ReE(res, err.message, 500);
    }
};
module.exports.updateUser = updateUser;

// ✅ Soft delete a user
var deleteUser = async (req, res) => {
    try {
        const user = await model.User.findByPk(req.params.id);
        if (!user) return ReE(res, "User not found", 404);

        await user.update({ isDeleted: true });

        return ReS(res, "User deleted successfully", 200);
    } catch (err) {
        return ReE(res, err.message, 500);
    }
};
module.exports.deleteUser = deleteUser;
