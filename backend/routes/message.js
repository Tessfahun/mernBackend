const express = require("express");
const router = express.Router();
const Message = require("../database/Schema/Message");

router.post("/", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: "Please fill in all fields" });
    }

    const newMessage = new Message({ name, email, subject, message });
    await newMessage.save();

    return res.status(201).json({ message: "Message sent successfully!" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
});

// GET all messages
router.get("/", async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 }); // latest first
    res.status(200).json(messages);
  } catch (error) {
    console.error("Failed to fetch messages:", error.message);
    res.status(500).json({ message: "Failed to fetch messages" });
  }
});

module.exports = router;
