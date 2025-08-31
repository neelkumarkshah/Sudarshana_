const mongoose = require("mongoose");

const scanSchema = new mongoose.Schema(
  {
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
  },
  { versionKey: false }
);

scanSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await mongoose
      .model("User")
      .updateOne({ _id: doc.userId }, { $pull: { scans: doc._id } });
  }
});

scanSchema.post("remove", async function (doc) {
  if (doc) {
    await mongoose
      .model("User")
      .updateOne({ _id: doc.userId }, { $pull: { scans: doc._id } });
  }
});

module.exports = mongoose.model("Scan", scanSchema);
