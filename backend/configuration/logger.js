const { createLogger, transports, format } = require("winston");

const consoleLogFormat = format.combine(
  format.colorize(),
  format.timestamp({ format: "DD-MMM-YYYY HH:mm:ss" }),
  format.printf(({ level, message, timestamp }) => {
    let color = "";
    if (level === "info") color = "\x1b[32m";
    else if (level === "error") color = "\x1b[31m";
    else if (level === "warn") color = "\x1b[33m";
    return `${color}${level}:\x1b[0m ${timestamp}: ${message}`;
  })
);

const fileLogFormat = format.combine(
  format.timestamp({ format: "DD-MMM-YYYY HH:mm:ss" }),
  format.printf(({ level, message, timestamp }) => {
    return `${level}:\x1b[0m ${timestamp}: ${message}`;
  })
);

const logger = createLogger({
  transports: [
    new transports.Console({ format: consoleLogFormat }),
    new transports.File({ filename: "activity.log", format: fileLogFormat }),
  ],
});

module.exports = logger;
