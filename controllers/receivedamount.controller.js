"use strict";
const model = require("../models/index");
const { ReE, ReS } = require("../utils/util.service.js");
const { Op } = require("sequelize");

/**
 * List all received amounts for a given userId
 */
var listReceivedAmounts = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) return ReE(res, "userId is required", 400);

    // Fetch all received amounts linked to the user
    const receivedAmounts = await model.ReceivedAmount.findAll({
      where: {
        [Op.or]: [
          { donatorId: userId }, // donations made by this user
          { userId: userId },    // platform user who processed transfers
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
      order: [["receivedDate", "DESC"]],
    });

    return ReS(res, {
      message: "Received amounts fetched successfully",
      data: receivedAmounts,
    }, 200);

  } catch (err) {
    return ReE(res, err.message, 500);
  }
};

module.exports.listReceivedAmounts = listReceivedAmounts;
