const { validationResult } = require("express-validator");
const axios = require("axios");
const moment = require("moment-timezone");
const { spawn } = require("child_process");
const path = require("path");

const HttpError = require("../models/httpError");
const Scan = require("../models/scan");
const User = require("../models/user");
const logger = require("../configuration/logger");
const {
  AnalyzeHeaders,
} = require("../utils/penTestChecklists/httpsHeaders/httpHeaders");
// const {
//   SSLTLSCheck,
// } = require("../utils/penTestChecklists/sslTlsCheck/sslTlsCheck");

const StartScan = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => ({
      param: error.param,
      message: error.msg,
    }));
    return next(new HttpError(JSON.stringify(errorMessages), 422));
  }

  const { url, userId, scanType, applicationName } = req.body;

  const targetedUrl = url;

  if (userId !== req.userData.userId) {
    return next(new HttpError("Forbidden", 403));
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return next(new HttpError("User not found", 404));
    }

    // let headers;
    // try {
    //   const response = await axios.get(url);
    //   headers = response.headers;
    //   console.log("headers:", headers);
    // } catch (err) {
    //   return next(
    //     new HttpError("Failed to fetch headers from the provided URL.", 500)
    //   );
    // }

    const issues = [];

    try {
      const AnalyzeHeadersIssues = await AnalyzeHeaders(url);
      // const AnalyzeHeadersIssues = spawn("python", [
      //   path.join(
      //     __dirname,
      //     "..",
      //     "utils",
      //     "pentestChecklists",
      //     "SudarshanaChakra",
      //     "SudarshanaChakra.py"
      //   ),
      //   "--url",
      //   url,
      //   "--output",
      //   "json",
      // ]);
      // let output = "";
      // let errorOutput = "";
      // AnalyzeHeadersIssues.stdout.on("data", (data) => {
      //   output += data.toString();
      // });
      // AnalyzeHeadersIssues.stderr.on("data", (data) => {
      //   errorOutput += data.toString();
      // });
      // AnalyzeHeadersIssues.on("close", (code) => {
      //   if (code === 0) {
      //     try {
      //       const parsedOutput = JSON.parse(output);
      //       if (parsedOutput && parsedOutput.length > 0) {
      //         issues.push(...parsedOutput);
      //         logger.info(`Header issues found for URL: ${url}`);
      //       } else {
      //         logger.info(`No header issues found for URL: ${url}`);
      //       }
      //     } catch (parseError) {
      //       logger.error("Error parsing JSON output:", parseError.message);
      //     }
      //   } else {
      //     console.error(`Process exited with code ${code}`);
      //     if (errorOutput) logger.error("Error:", errorOutput);
      //   }
      // });
      if (AnalyzeHeadersIssues && AnalyzeHeadersIssues.length > 0) {
        issues.push(...AnalyzeHeadersIssues);
        logger.info(`Header issues found for URL: ${url}`);
      } else {
        logger.info(`No header issues found for URL: ${url}`);
      }
    } catch (err) {
      logger.warn(`Error analyzing headers for URL ${url}: ${err}`);
    }

    // SSL/TLS checks
    // if (url.startsWith("https://")) {
    //   try {
    //     const SSLTLSCheckIssues = await SSLTLSCheck(url);
    //     if (SSLTLSCheckIssues && SSLTLSCheckIssues.length > 0) {
    //       issues.push(...SSLTLSCheckIssues);
    //       logger.info(
    //         `SSLTLSCheck completed. Issues found: ${SSLTLSCheckIssues.length}`
    //       );
    //     } else {
    //       logger.info(`No SSL/TLS issues found for URL: ${url}`);
    //     }
    //   } catch (err) {
    //     logger.warn(`Error performing SSL/TLS check for URL ${url}: ${err}`);
    //   }
    // }
    // .length > 0 ? issues : [{ Message: "No issues found" }]
    const newScan = new Scan({
      userId,
      issues: issues,
      scanType,
      targetedUrl,
      applicationName,
      timestamp: new Date(),
    });

    try {
      const savedScan = await newScan.save();
      user.scans.push(savedScan._id);
      await user.save();

      res.status(201).json({
        success: true,
        scan: {
          scanId: savedScan._id,
          issues: savedScan.issues,
          scanType: savedScan.scanType,
          targetedUrl,
          applicationName,
          timestamp: savedScan.timestamp,
        },
      });
    } catch (err) {
      return next(
        new HttpError(
          "Failed to save scan details, please try again later.",
          500
        )
      );
    }
  } catch (error) {
    return next(new HttpError("Error performing scan!", 500));
  }
};

const UploadPDF = async (req, res, next) => {
  const scanId = req.body.scanId;
  const pdfFile = req.file;
  try {
    if (!scanId || !pdfFile) {
      return res.status(400).json({ message: "Missing scanId or pdfFile" });
    }

    const scan = await Scan.findById(scanId);
    if (!scan) {
      return next(new HttpError("Scan not found", 404));
    }

    scan.pdfFile = pdfFile.buffer;
    await scan.save();

    res
      .status(200)
      .json({ success: true, message: "PDF uploaded successfully" });
  } catch (err) {
    console.error(`Error uploading PDF for scanId: ${scanId}`, err);
    return next(new HttpError("Error uploading PDF", 500));
  }
};

const DownloadPDF = async (req, res, next) => {
  try {
    const { scanId } = req.params;

    const scanRecord = await Scan.findById(scanId);

    if (!scanRecord || !scanRecord.pdfFile) {
      return next(new HttpError("PDF file not found.", 404));
    }

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=${scanRecord.applicationName}.pdf`,
    });

    res.send(scanRecord.pdfFile);
  } catch (err) {
    logger.error("Error downloading PDF:", err);
    next(new HttpError("Downloading PDF failed!", 500));
  }
};

const DeleteScan = async (req, res, next) => {
  const { scanId, userId } = req.params;

  try {
    const scan = await Scan.findById(scanId);

    if (!scan) {
      logger.warn(`Scan not found with scanId: ${scanId}`);
      return next(new HttpError("Scan not found", 404));
    }

    if (scan.userId.toString() !== userId) {
      logger.warn(
        `Unauthorized deletion attempt for scanId: ${scanId} by userId: ${userId}`
      );
      return next(new HttpError("Unauthorized", 403));
    }

    await User.updateOne({ _id: userId }, { $pull: { scans: scanId } });

    await Scan.findByIdAndDelete(scanId);

    res.status(200).json({ message: "Scan deleted successfully" });
  } catch (err) {
    logger.error(`Error deleting scan with scanId: ${scanId}`, err);
    return next(new HttpError(err, 500));
  }
};

module.exports = {
  StartScan,
  UploadPDF,
  DownloadPDF,
  DeleteScan,
};
