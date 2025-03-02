const express = require("express");
const { body } = require("express-validator");
const multer = require("multer");
const upload = multer({ limits: { fileSize: 10 * 1024 * 1024 } });

const scanController = require("../controllers/scanController");
const isAuth = require("../middleware/checkAuth");

const router = express.Router();

router.use(isAuth);

router.post(
  "/startScan",
  [
    body("url").isURL().withMessage("Please provide a valid URL."),
    body("applicationName")
      .not()
      .isEmpty()
      .withMessage("Application name cannot be empty."),
    body("userId").not().isEmpty().withMessage("User ID cannot be empty."),
    body("scanType")
      .isIn(["Web Application", "API"])
      .withMessage("Please select a valid scan type: 'web' or 'api'."),
  ],
  scanController.StartScan
);

router.post("/uploadPdf", upload.single("pdfFile"), scanController.UploadPDF);

router.get("/downloadPdf/:scanId", scanController.DownloadPDF);

router.post("/deleteScan", scanController.DeleteScan);

module.exports = router;
