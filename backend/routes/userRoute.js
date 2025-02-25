const express = require("express");
const { body } = require("express-validator");

const fileStorage = require("../middleware/fileStorage");
const userController = require("../controllers/userController");
const isAuth = require("../middleware/checkAuth");

const router = express.Router();

router.get("/verifyUsers", isAuth, userController.GetUsers);

router.post(
  "/signup",
  fileStorage.single("profileImage"),
  [
    body("name")
      .trim()
      .not()
      .isEmpty()
      .withMessage("Name is required")
      .isString()
      .withMessage("Name must be a string"),
    body("email")
      .isEmail()
      .withMessage("Invalid email address")
      .normalizeEmail()
      .toLowerCase(),
    body("password")
      .isLength({ min: 6, max: 12 })
      .withMessage("Password must be between 6 and 12 characters long")
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+{};:,<.>])/)
      .withMessage(
        "Password must contain at least one lowercase letter, one uppercase letter, one special character, and one numeric digit"
      ),
    body("phoneNumber")
      .isMobilePhone("any", { strictMode: false })
      .withMessage("Invalid phone number"),
  ],
  userController.Signup
);

router.post("/login", userController.Login);

router.get("/scans/:userId", isAuth, userController.GetUserRecords);

module.exports = router;
