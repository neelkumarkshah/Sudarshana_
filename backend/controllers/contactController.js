const Contact = require("../models/Contact");
const nodemailer = require("nodemailer");
const { validationResult } = require("express-validator");
const logger = require("../configuration/logger");

const submitContactForm = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { firstName, lastName, email, companyName, phone, vaptType, message } =
    req.body;

  try {
    const newContact = new Contact({
      firstName,
      lastName,
      email,
      companyName,
      phone,
      vaptType,
      message,
    });
    await newContact.save();

    await sendEmail(email, firstName);
    logger.info("Email sent successfully");
    res.status(200).json({ message: "Contact details saved and email sent" });
  } catch (error) {
    next(error);
  }
};

async function sendEmail(userEmail, userName) {
  let transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: "Thank you for contacting us!",
    text: `Hello ${userName},\n\nThank you for reaching out. We have received your message and will respond shortly.\n\nBest regards,\nSudarshana`,
  };

  return transporter.sendMail(mailOptions);
}

module.exports = { submitContactForm };
