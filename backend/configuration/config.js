require("dotenv").config();
const path = require("path");

module.exports = {
  mongoURI: process.env.MONGODB_URI,
  port: process.env.PORT || 8080,
  certKey: process.env.KEY || path.join(__dirname, "./https/cert.key"),
  httpsCert: process.env.CERT || path.join(__dirname, "./https/cert.crt"),
  SECRET: process.env.SECRET,
};
