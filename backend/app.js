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

const limit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20,
});

// -------Security middlewares-------
// CORS
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Authorization"],
    credentials: true,
  })
);

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");

  next();
});

app.use(helmet());
app.use(compression());
app.use(limit); // Apply rate limiter to all requests
app.use(helmet.frameguard({ action: "same-origin" }));
// app.use(
//   helmet.contentSecurityPolicy({
//     directives: {
//       defaultSrc: ["'self'"],
//       scriptSrc: ["'self'"],
//       styleSrc: ["'self'"],
//       scriptSrcAttr: ["'self'"],
//       imgSrc: ["'self'", "data:"],
//       fontSrc: ["'self'"],
//       connectSrc: ["'self'", "https://sudarshana.vercel.app"],
//       frameSrc: ["'self'"],
//       frameAncestors: ["'self'"],
//       objectSrc: ["'none'"],
//       mediaSrc: ["'self'"],
//       baseUri: ["'self'"],
//       formAction: ["'self'"],
//       // upgradeInsecureRequests: [],
//       // // Automatically upgrade HTTP requests to HTTPS

//       // blockAllMixedContent: [],
//       // Block loading mixed (HTTP) content when on HTTPS
//     },
//     //  reportOnly: false,
//     // Set to true during testing to monitor violations without enforcing
//   })
// );

// Routes
app.use("/users", userRoutes);
app.use("/pentesting", scanRoutes);
app.use("/contact", contactRoutes);

app.use((req, res, next) => {
  const error = new HttpError("Could not find this route.", 404);
  throw error;
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  const status = error.statusCode || 500;
  const message = error.message || "An unexpected error occurred.";
  const data = error.data;
  res.status(status).json({ message, data });
});

// Connect to MongoDB and start HTTPS server
mongoose
  .connect(config.mongoURI, { dbName: "sudarshana" })
  .then(() => {
    // Start HTTPS server once MongoDB connection is established
    // const server = https.createServer(certData, app);
    app.listen(config.port, () => {
      logger.info(`Server is up and running...`);
    });
  })
  .catch((err) => {
    logger.error("MongoDB connection error: ", err);
  });
