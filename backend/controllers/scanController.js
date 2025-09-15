const { validationResult } = require("express-validator");
const axios = require("axios");

const HttpError = require("../models/httpError");
const Scan = require("../models/scan");
const User = require("../models/user");
const logger = require("../configuration/logger");
const {
  AnalyzeHeaders,
} = require("../utils/penTestChecklists/httpsHeaders/httpHeaders");
const {
  SSLTLSCheck,
} = require("../utils/penTestChecklists/sslTlsCheck/sslTlsCheck");

const StartScan = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors
      .array()
      .map((error) => ({ param: error.param, message: error.msg }));
    return next(new HttpError(JSON.stringify(errorMessages), 422));
  }

  const { url, scanType, applicationName } = req.body;
  const userId = req.sessionUserId || req.session?.userId;

  if (!userId) {
    return next(new HttpError("Not authenticated", 401));
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return next(new HttpError("User not found", 404));
    }

    let headers;
    try {
      const response = await axios.get(url, { timeout: 10_000 });
      headers = response.headers;
    } catch (err) {
      logger.warn("Failed to fetch URL headers:", err.message || err);
      return next(
        new HttpError("Failed to fetch headers from the provided URL.", 500)
      );
    }

    const issues = [];
    try {
      const AnalyzeHeadersIssues = await AnalyzeHeaders(headers, url);
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
    if (url.startsWith("https://")) {
      try {
        const SSLTLSCheckIssues = await SSLTLSCheck(url);
        if (
          SSLTLSCheckIssues &&
          SSLTLSCheckIssues.length > 0 &&
          !(
            SSLTLSCheckIssues.length === 1 &&
            SSLTLSCheckIssues[0].Message === "No SSL/TLS issues found"
          )
        ) {
          issues.push(...SSLTLSCheckIssues);
          logger.info(
            `SSLTLSCheck completed. Issues found: ${SSLTLSCheckIssues.length}`
          );
        } else {
          logger.info(`No SSL/TLS issues found for URL: ${url}`);
        }
      } catch (err) {
        logger.warn(`Error performing SSL/TLS check for URL ${url}: ${err}`);
      }
    }

    const newScan = new Scan({
      userId,
      issues,
      scanType,
      targetedUrl: url,
      applicationName,
      timestamp: new Date(),
    });

    const savedScan = await newScan.save();
    user.scans.push(savedScan._id);
    await user.save();

    const scanResponse = {
      success: true,
      scan: {
        scanId: savedScan._id,
        issues: savedScan.issues,
        scanType: savedScan.scanType,
        targetedUrl: savedScan.targetedUrl,
        applicationName: savedScan.applicationName,
        timestamp: savedScan.timestamp,
      },
    };

    return res.status(201).json(scanResponse);
  } catch (error) {
    logger.error("Error performing scan:", error);
    return next(new HttpError("Error performing scan!", 500));
  }
};

const UploadPDF = async (req, res, next) => {
  const { scanId } = req.body;
  const pdfFile = req.file;
  const userId = req.sessionUserId || req.session?.userId;

  try {
    if (!scanId || !pdfFile) {
      return res.status(400).json({ message: "Missing scanId or pdfFile" });
    }

    const scan = await Scan.findOne({ _id: scanId, userId });
    if (!scan) {
      return next(new HttpError("Scan not found or unauthorized", 404));
    }

    scan.pdfFile = pdfFile.buffer;
    await scan.save();

    return res
      .status(200)
      .json({ success: true, message: "PDF uploaded successfully" });
  } catch (err) {
    logger.error(`Error uploading PDF for scanId: ${scanId}`, err);
    return next(new HttpError("Error uploading PDF", 500));
  }
};

const DownloadPDF = async (req, res, next) => {
  try {
    const { scanId } = req.params;
    const userId = req.sessionUserId || req.session?.userId;

    const scanRecord = await Scan.findOne({ _id: scanId, userId });
    if (!scanRecord || !scanRecord.pdfFile) {
      return next(new HttpError("PDF file not found or unauthorized", 404));
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${scanRecord.applicationName}.pdf"`
    );

    res.send(scanRecord.pdfFile);
  } catch (err) {
    logger.error("Error downloading PDF:", err);
    next(new HttpError("Downloading PDF failed!", 500));
  }
};

const DeleteScans = async (req, res, next) => {
  const { scanIds } = req.body;
  const userId = req.sessionUserId || req.session?.userId;

  try {
    if (!Array.isArray(scanIds) || scanIds.length === 0) {
      return next(new HttpError("No scan IDs provided", 400));
    }

    const scans = await Scan.find({ _id: { $in: scanIds }, userId });
    if (scans.length === 0) {
      return next(new HttpError("No matching scans found for this user", 404));
    }

    const foundIds = scans.map((s) => s._id.toString());

    await User.updateOne(
      { _id: userId },
      { $pull: { scans: { $in: foundIds } } }
    );
    await Scan.deleteMany({ _id: { $in: foundIds }, userId });

    return res.status(200).json({
      message: `${foundIds.length} scan(s) deleted successfully`,
      deletedIds: foundIds,
    });
  } catch (err) {
    logger.error(`Error deleting scans:`, err);
    return next(new HttpError("Error deleting scans", 500));
  }
};

module.exports = {
  StartScan,
  UploadPDF,
  DownloadPDF,
  DeleteScans,
};
