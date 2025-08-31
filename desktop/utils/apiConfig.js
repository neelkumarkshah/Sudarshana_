const API_BASE_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8080"
    : "http://127.0.0.1:8080";

module.exports = API_BASE_URL;
