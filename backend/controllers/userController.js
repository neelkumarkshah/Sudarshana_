const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");

const Scan = require("../models/scan");
const HttpError = require("../models/httpError");
const User = require("../models/user");
const logger = require("../configuration/logger");

const GetUsers = async (req, res, next) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ userExists: false });
    }

    const user = await User.findById(req.session.userId).lean().exec();
    if (!user) return res.status(404).json({ userExists: false });

    return res.status(200).json({
      userExists: true,
      userId: user._id.toString(),
      email: user.email,
    });
  } catch (err) {
    logger.error("Error in GetUsers: ", err);
    next(new HttpError("User verification failed!", 500));
  }
};

const GetUserRecords = async (req, res, next) => {
  try {
    const authedUserId = req.sessionUserId || req.session?.userId;
    if (!authedUserId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const scans = await Scan.find({ userId: authedUserId })
      .sort({ timestamp: -1 })
      .lean()
      .exec();

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
      name,
      email,
      password: hashedPassword,
      phoneNumber,
      profileImage,
      scans: [],
    });

    await newUser.save();

    req.session.userId = newUser._id.toString();

    res
      .status(201)
      .json({ userId: newUser._id.toString(), email: newUser.email });
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
    logger.error("Error in Getting User: ", err);
    return next(
      new HttpError("Logging in failed, please try again later.", 500)
    );
  }

  if (!existingUser) {
    return next(
      new HttpError("User does not exist. Please sign up first...", 403)
    );
  }

  let isValidPWD = false;
  try {
    isValidPWD = await bcrypt.compare(password, existingUser.password);
  } catch (err) {
    logger.error("Error in Password Verification: ", err);
    return next(
      new HttpError(
        "Could not log you in, please check your credentials and try again.",
        500
      )
    );
  }

  if (!isValidPWD) {
    return next(
      new HttpError("Invalid credentials, could not log you in.", 403)
    );
  }

  try {
    req.session.userId = existingUser._id.toString();
  } catch (err) {
    logger.error("Error: ", err);
    return next(
      new HttpError("Logging in failed, please try again later.", 500)
    );
  }

  res
    .status(200)
    .json({ userId: existingUser._id.toString(), email: existingUser.email });
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
