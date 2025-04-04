const jwt = require("jsonwebtoken");

const HttpError = require("../models/httpError");
const config = require("../configuration/config");

module.exports = async (req, res, next) => {
  if (req.method === "OPTIONS") {
    return next();
  }

  try {
    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader) {
      const error = new HttpError("Authorization header missing!", 401);
      return next(error);
    }

    const token = await authorizationHeader.split(" ")[1];

    if (!token) {
      const error = new HttpError("Token missing!", 401);
      return next(error);
    }

    const decodedToken = jwt.verify(token, config.JWT_SECRET);
    req.userData = { userId: decodedToken.userId };

    next();
  } catch (err) {
    const error = new HttpError("Authentication failed!", 403);
    return next(error);
  }
};
