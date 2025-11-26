"use strict";

const sgMail = require("@sendgrid/mail");
const CONFIG = require("../config/config");

// Set SendGrid API key
sgMail.setApiKey(CONFIG.mailPassword); // your SendGrid API Key

// Generic mail sender (function name unchanged)
const sendMail = async (to, subject, html) => {
  const msg = {
    to,
    from: `"BLOCKCHAINUBI TEAM" <${CONFIG.mailUser}>`, // verified sender
    subject,
    html,
  };

  try {
    const info = await sgMail.send(msg);
    console.log("Mail sent:", info);
    return { success: true, info };
  } catch (error) {
    console.error("Mail error:", error);
    return { success: false, error };
  }
};

module.exports = { sendMail };
