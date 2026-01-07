const nodemailer = require("nodemailer");
const CONFIG = require("../config/config");

const transporter = nodemailer.createTransport({
  host: CONFIG.mailHost,
  port: CONFIG.mailPort,
  secure: CONFIG.mailSecure,
  auth: {
    user: CONFIG.mailUser,
    pass: CONFIG.mailPassword
  }
});

// Generic mail sender
const sendMail = async (to, subject, html) => {
  const mailOptions = {
    from: `"BLOCKCHAINUBI TEAM" <${CONFIG.mailUser}>`, // 👈 Custom sender name
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
