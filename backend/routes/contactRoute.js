const express = require("express");
const { body, validationResult } = require("express-validator");
const { submitContactForm } = require("../controllers/contactController");

const router = express.Router();

const validateContactForm = [
  body("firstName").notEmpty().withMessage("First name is required."),
  body("lastName").notEmpty().withMessage("Last name is required."),
  body("email").isEmail().withMessage("Please enter a valid email address."),
  body("companyName").notEmpty().withMessage("Company name is required."),
  body("phone")
    .notEmpty()
    .withMessage("Phone number is required.")
    .isMobilePhone()
    .withMessage("Please enter a valid phone number."),
  body("vaptType")
    .isIn(["web", "network", "mobile", "cloud", "api", "iot"])
    .withMessage("Please select a valid VAPT type."),
  body("message")
    .isLength({ min: 10 })
    .withMessage("Message should be at least 10 characters long."),
];

router.post("/", validateContactForm, submitContactForm);

module.exports = router;
