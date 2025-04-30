const express = require("express");
const router = express.Router();
const Report = require("../database/Schema/reportSchema");

// GET all reports (sorted by newest first)
router.get("/allreport", async (req, res) => {
  try {
    const reports = await Report.find().sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch reports" });
  }
});

// Example Express route to fetch reports for a specific user
router.get("/user/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const reports = await Report.find({ userId }); // Assuming 'userId' is stored in the report model
    res.json(reports);
  } catch (error) {
    console.error("Error fetching reports:", error);
    res.status(500).json({ message: "Error fetching reports" });
  }
});

router.post("/", async (req, res) => {
  const { userId, employee, task, date } = req.body;

  if (!userId || !employee || !task || !date) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const newReport = new Report({
      userId,
      employee,
      task,
      date,
    });

    const savedReport = await newReport.save(); // Save the report to the database
    res.status(201).json(savedReport); // Return the saved report
  } catch (error) {
    console.error("Error saving report:", error);
    res.status(500).json({ error: "Failed to save report" });
  }
});

module.exports = router;
