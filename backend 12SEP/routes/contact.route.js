import express from "express";
import authenticateToken from "../middleware/isAuthenticated.js";
import { ContactRequest } from "../models/contactRequest.model.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { name, email, topic, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: "Name, email and message are required." });
    }

    const contactRequest = await ContactRequest.create({
      name,
      email,
      topic: topic || "General",
      message,
    });

    return res.status(201).json({
      success: true,
      message: "Your message has been submitted successfully.",
      request: contactRequest,
    });
  } catch (error) {
    console.error("Contact request error:", error);
    return res.status(500).json({ success: false, message: "Server error while saving contact request." });
  }
});

router.get("/requests", authenticateToken, async (req, res) => {
  try {
    const requests = await ContactRequest.find();
    return res.json({ success: true, requests });
  } catch (error) {
    console.error("Fetch contact requests error:", error);
    return res.status(500).json({ success: false, message: "Server error while fetching contact requests." });
  }
});

router.put("/requests/:id/resolve", authenticateToken, async (req, res) => {
  try {
    const request = await ContactRequest.findByIdAndUpdate(
      req.params.id,
      { status: "Closed", resolvedAt: new Date() },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({ success: false, message: "Contact request not found." });
    }

    return res.json({ success: true, request });
  } catch (error) {
    console.error("Resolve contact request error:", error);
    return res.status(500).json({ success: false, message: "Server error while updating request status." });
  }
});

export default router;
