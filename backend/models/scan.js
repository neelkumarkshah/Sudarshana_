const mongoose = require("mongoose");

const scanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  issues: {
    type: [
      {
        Vulnerability: String,
        Description: String,
        Severity: {
          type: String,
          enum: ["Critical", "High", "Medium", "Low", "Info", "Errors"],
        },
        POC: String,
        Remediation: String,
        Refer: [String],
        Error: String,
      },
    ],
    default: [{ Message: "No issues found" }],
  },
  scanType: {
    type: String,
    enum: ["Web Application", "API"],
    required: true,
  },
  targetedUrl: {
    type: String,
    required: true,
  },
  applicationName: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  pdfFile: {
    type: Buffer,
  },
});

module.exports = mongoose.model("Scan", scanSchema);

scanSchema.pre("findByIdAndDelete", async function (next) {
  try {
    const scan = await this.model.findOne(this.getQuery());
    if (scan) {
      await mongoose
        .model("User")
        .updateOne({ _id: scan.userId }, { $pull: { scans: scan._id } });
    }
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model("Scan", scanSchema);
