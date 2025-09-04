require("dotenv").config();

const https = require("https");
const fs = require("fs");
const express = require("express");
const mongoose = require("mongoose");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const cors = require("cors");
const session = require("express-session");
const MongoStore = require("connect-mongo");

const config = require("./configuration/config");
const logger = require("./configuration/logger");
const userRoutes = require("./routes/userRoute");
const scanRoutes = require("./routes/scanRoute");
const HttpError = require("./models/httpError");

const app = express();

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Load SSL certificate and key
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
      styleSrc: ["'self'", "https:", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:"],
      fontSrc: ["'self'", "https:"],
      connectSrc: ["'self'", "http://localhost:3000"],
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

// CORS
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
    optionsSuccessStatus: 204,
  })
);

const ThirtyMinutes = 30 * 60 * 1000;

// Session Middleware
app.use(
  session({
    name: "chakra",
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: config.mongoURI,
      dbName: "sudarshana",
      collectionName: "sessions",
      ttl: ThirtyMinutes / 1000,
      crypto: { secret: process.env.SECRET },
    }),
    cookie: {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: ThirtyMinutes,
      path: "/",
    },
    rolling: false,
  })
);

// Routes
app.use("/users", userRoutes);
app.use("/pentesting", scanRoutes);

// Not found
app.use((req, res, next) => {
  const error = new HttpError("Could not find this route.", 404);
  throw error;
});

// Error handler
app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  res.status(error.statusCode || 500).json({
    message: error.message || "An unexpected error occurred.",
    data: error.data,
  });
});

// Start server
mongoose
  .connect(config.mongoURI, { dbName: "sudarshana" })
  .then(() => {
    // const server = https.createServer(certData, app);
    app.listen(config.port, () => {
      logger.info(`Server is running...`);
    });
  })
  .catch((err) => {
    logger.error("MongoDB connection error: ", err);
  });
