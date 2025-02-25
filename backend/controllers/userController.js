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
    const userId = req.userData.userId;
    const existingUser = await User.findById(userId);

    if (!existingUser) {
      return next(new HttpError("User does not exist!", 404));
    }

    res.status(200).json({ userExists: true });
  } catch (err) {
    logger.error("Error in GetUsers: ", err);
    next(new HttpError("User verification failed!", 500));
  }
};

const GetUserRecords = async (req, res, next) => {
  try {
    const userId = req.userData.userId;

    const userScanRecords = await Scan.find({ userId: userId });

    if (!userScanRecords || userScanRecords.length === 0) {
      return res.status(200).json({
        scanRecords: [],
      });
    }

    res.status(200).json({
      scanRecords: userScanRecords,
    });
  } catch (err) {
    logger.error("Error fetching user records: ", err);
    next(new HttpError("Fetching user records failed!", 500));
  }
};

const Signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => ({
      param: error.param,
      message: error.msg,
    }));

    return next(new HttpError(JSON.stringify(errorMessages), 422));
  }

  const { name, email, password, phoneNumber } = req.body;

  try {
    let existingUser = await User.findOne({ email: email });

    if (existingUser) {
      return next(new HttpError(`User already exists with this email`, 422));
    }

    let hashedPassword;
    try {
      hashedPassword = await bcrypt.hash(password, 12);
    } catch (err) {
      const error = new HttpError(
        "Could not create user, please try again.",
        500
      );
      logger.error("Error in Password Hashing: ", err);
      return next(error);
    }

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

    try {
      await newUser.save();
    } catch (err) {
      const error = new HttpError(
        "Signing up failed, please try again later.",
        500
      );
      logger.error("Error in User Creation: ", err);
      return next(error);
    }

    let token;
    try {
      token = jwt.sign(
        { userId: newUser.id, email: newUser.email },
        config.JWT_SECRET,
        { expiresIn: "30m" }
      );
    } catch (err) {
      const error = new HttpError(
        "Signing up failed, please try again later.",
        500
      );
      logger.error("Error in Token Generation: ", err);
      return next(error);
    }

    res.status(201).json({ userId: newUser.id, email: newUser.email, token });
  } catch (error) {
    logger.error("Unexpected error in signup process: ", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
    next(error);
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
      "Invalid credentials, could not log you in.",
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

  let token;
  try {
    token = jwt.sign(
      { userId: existingUser.id, email: existingUser.email },
      config.JWT_SECRET,
      { expiresIn: "30m" }
    );
  } catch (err) {
    const error = new HttpError(
      "Logging in failed, please try again later.",
      500
    );
    logger.error("Error in JWT Token: ", err);

    return next(error);
  }

  res.json({
    userId: existingUser.id,
    email: existingUser.email,
    token: token,
  });
};

module.exports = {
  GetUsers,
  GetUserRecords,
  Signup,
  Login,
};
