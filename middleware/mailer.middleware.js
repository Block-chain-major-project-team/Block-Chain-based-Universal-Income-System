"use strict";

const nodemailer = require("nodemailer");
const CONFIG = require("../config/config");

// Use SendGrid SMTP
const transporter = nodemailer.createTransport({
  host: CONFIG.mailHost,      // smtp.sendgrid.net
  port: CONFIG.mailPort,      // 587 for TLS, 465 for SSL
  secure: CONFIG.mailSecure,  // false for TLS (STARTTLS)
  auth: {
    user: CONFIG.mailUser,    // must be 'apikey'
    pass: CONFIG.mailPassword // your SendGrid API key
  }
});

// Generic mail sender (function name unchanged)
const sendMail = async (to, subject, html) => {
  const mailOptions = {
    from: `"BLOCKCHAINUBI TEAM" <${CONFIG.mailUser}>`, // your sender name
    to,
    subject,
    html
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Mail sent: ", info.response);
    return { success: true, info };
  } catch (error) {
    console.error("Mail error:", error);
    return { success: false, error };
  }
};

module.exports = { sendMail };
