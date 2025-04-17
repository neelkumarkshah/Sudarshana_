require("dotenv").config();

const https = require("https");
const fs = require("fs");
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const cors = require("cors");

const config = require("./configuration/config");
const logger = require("./configuration/logger");
const userRoutes = require("./routes/userRoute");
const contactRoutes = require("./routes/contactRoute");
const scanRoutes = require("./routes/scanRoute");
const HttpError = require("./models/httpError");

const app = express();

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Load SSL certificate and key from file system
const certData = {
  key: fs.readFileSync(config.certKey),
  cert: fs.readFileSync(config.httpsCert),
};

// Rate Limiting
const limit = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limit);

// Compression
app.use(compression());

// Security Headers with Helmet
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "same-site" },
    crossOriginEmbedderPolicy: true,
    dnsPrefetchControl: true,
    hidePoweredBy: true,
    hsts: { maxAge: 31536000, includeSubDomains: true },
    ieNoOpen: true,
    noSniff: true,
    permittedCrossDomainPolicies: { permittedPolicies: "none" },
    referrerPolicy: { policy: "no-referrer" },
    xssFilter: true,
  })
);

// Strong Content Security Policy (CSP)
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-eval'"],
      styleSrc: ["'self'", "https:"],
      imgSrc: ["'self'", "data:"],
      fontSrc: ["'self'", "https:"],
      connectSrc: ["'self'"],
      frameSrc: ["'self'"],
      frameAncestors: ["'none'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      upgradeInsecureRequests: [],
      blockAllMixedContent: [],
    },
  })
);

// Clickjacking Protection
app.use(helmet.frameguard({ action: "sameorigin" }));

// CORS Configuration – Strict and Controlled
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    optionsSuccessStatus: 204,
  })
);

// // Manual CORS Headers
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, DELETE, OPTIONS"
  );
  next();
});

// Routes
app.use("/users", userRoutes);
app.use("/pentesting", scanRoutes);
app.use("/contact", contactRoutes);

// Route not found handler
app.use((req, res, next) => {
  const error = new HttpError("Could not find this route.", 404);
  throw error;
});

// Global error handler
app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  const status = error.statusCode || 500;
  const message = error.message || "An unexpected error occurred.";
  const data = error.data;
  res.status(status).json({ message, data });
});

// Connect to DB and start HTTPS server
mongoose
  .connect(config.mongoURI, { dbName: "sudarshana" })
  .then(() => {
    // https.createServer(certData, app).listen(config.port, ...
    app.listen(config.port, () => {
      logger.info(`Server is up and running...`);
    });
  })
  .catch((err) => {
    logger.error("MongoDB connection error: ", err);
  });
