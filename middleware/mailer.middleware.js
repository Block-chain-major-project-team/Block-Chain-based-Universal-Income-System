const nodemailer = require("nodemailer");
const CONFIG = require("../config/config");

const transporter = nodemailer.createTransport({
  host: CONFIG.mailHost,
  port: CONFIG.mailPort,
  secure: CONFIG.mailSecure, // true for 465, false for 587
  auth: {
    user: CONFIG.mailUser,
    pass: CONFIG.mailPassword
  },
  logger: true,        
  debug: true           
});

// Generic mail sender
const sendMail = async (to, subject, html) => {
  const mailOptions = {
    from: CONFIG.mailUser,
    to,
    subject,
    html
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return { success: true, info };
  } catch (error) {
    console.error(" GoDaddy Mail Error:", error);
    return { success: false, error };
  }
};

module.exports = { sendMail };
