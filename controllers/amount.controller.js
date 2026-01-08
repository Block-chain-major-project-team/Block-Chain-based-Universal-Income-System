"use strict";

const model = require("../models/index");
const { ReE, ReS } = require("../utils/util.service.js");
const { Op } = require("sequelize");

/**
 * List all amounts for a given userId
 */
const listAmounts = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) return ReE(res, "userId is required", 400);

    const amounts = await model.Amount.findAll({
      where: {
        isDeleted: false,
        [Op.or]: [
          { donatorId: userId }, // donor
          { userId: userId },    // admin/platform user
        ],
      },
      include: [
        {
          model: model.DonationSplit,
          attributes: ["id", "splitAmount", "message", "transferDate", "status"],
        },
        {
          model: model.Donation,
          attributes: ["id", "organizationId", "organizationName", "totalAmount"],
        },
        {
          model: model.Organization,
          attributes: ["id", "name", "email", "contact_person_name", "contact_person_email"],
        },
      ],
      order: [["amountDate", "DESC"]],
    });

    return ReS(
      res,
      {
        message: "Amounts fetched successfully",
        data: amounts,
      },
      200
    );
  } catch (err) {
    return ReE(res, err.message, 500);
  }
};

module.exports. listAmounts = listAmounts;
