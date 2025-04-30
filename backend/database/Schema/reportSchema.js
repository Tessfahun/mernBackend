const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      ref: "vendors", // Reference to User model (if you have a User collection)
    },
    employee: {
      type: String,
      required: true,
      trim: true,
    },
    task: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date, // Changed to Date type
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Report", reportSchema);
