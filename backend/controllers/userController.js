const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");

const Scan = require("../models/scan");
const config = require("../configuration/config");
const HttpError = require("../models/httpError");
const User = require("../models/user");
const logger = require("../configuration/logger");

const GetUsers = async (req, res, next) => {
  try {
    const user = await User.findById(req.userData.userId).lean().exec();
    if (!user) return res.status(404).json({ userExists: false });

    return res.status(200).json({
      userExists: true,
      userId: user.id,
      email: user.email,
    });
  } catch (err) {
    logger.error("Error in GetUsers: ", err);
    next(new HttpError("User verification failed!", 500));
  }
};

const GetUserRecords = async (req, res, next) => {
  try {
    const authedUserId = req.userData.userId;
    const requestedUserId = req.params.userId;

    if (requestedUserId !== authedUserId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const scans = await Scan.find({ userId: authedUserId }).lean().exec();
    return res.status(200).json({ scanRecords: scans || [] });
  } catch (err) {
    logger.error("Error fetching user records: ", err);
    next(new HttpError("Fetching user records failed!", 500));
  }
};

const Signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError("Validation failed", 422));
  }

  const { name, email, password, phoneNumber } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return next(new HttpError("User already exists", 422));

    const hashedPassword = await bcrypt.hash(password, 12);

    const profileImage = req.file ? req.file.path : null;

    const newUser = new User({
      id: uuidv4(),
      name,
      email,
      password: hashedPassword,
      phoneNumber,
      profileImage,
      scans: [],
    });

    await newUser.save();

    req.session.userId = newUser.id;

    res.status(201).json({ userId: newUser.id, email: newUser.email });
  } catch (error) {
    logger.error("Unexpected error in signup: ", error);
    next(new HttpError("Signup failed", 500));
  }
};

const Login = async (req, res, next) => {
  const { email, password } = req.body;

  let existingUser;

  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError(
      "Logging in failed, please try again later.",
      500
    );
    logger.error("Error in Getting User: ", err);

    return next(error);
  }

  if (!existingUser) {
    const error = new HttpError(
      "User does not exist. Please sign up first...",
      403
    );
    return next(error);
  }

  let isValidPWD = false;
  try {
    isValidPWD = await bcrypt.compare(password, existingUser.password);
  } catch (err) {
    const error = new HttpError(
      "Could not log you in, please check your credentials and try again.",
      500
    );

    logger.error("Error in Password Verification: ", err);

    return next(error);
  }

  if (!isValidPWD) {
    const error = new HttpError(
      "Invalid credentials, could not log you in.",
      403
    );
    return next(error);
  }

  try {
    req.session.userId = existingUser.id;
  } catch (err) {
    const error = new HttpError(
      "Logging in failed, please try again later.",
      500
    );
    logger.error("Error: ", err);

    return next(error);
  }

  res.status(200).json({ userId: existingUser.id, email: existingUser.email });
};

const Logout = (req, res) => {
  try {
    req.session.destroy((err) => {
      if (err) return res.status(500).json({ message: "Error logging out" });

      res.clearCookie("chakra", {
        httpOnly: true,
        secure: false,
        sameSite: "strict",
        path: "/",
      });

      return res.status(200).json({ message: "Logged out successfully" });
    });
  } catch {
    return res.status(500).json({ message: "Error logging out" });
  }
};

module.exports = {
  GetUsers,
  GetUserRecords,
  Signup,
  Login,
  Logout,
};
