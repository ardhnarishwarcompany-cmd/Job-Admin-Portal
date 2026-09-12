import express from "express";
import axios from "axios";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "groq/compound-mini",
        messages: [
          {
            role: "system",
            content: `You are an advanced AI Interview Assistant.

Your responsibilities:
- Conduct technical interviews
- Ask interview questions one by one
- Evaluate answers
- Give improvement tips
- Support Java, MERN Stack, React, Node.js, HR and DSA interviews
- Keep responses professional and short
- Give a score out of 10 occasionally
`,
          },
          {
            role: "user",
            content: message,
          },
        ],
        temperature: 0.7,
        max_tokens: 300,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const reply = response.data?.choices?.[0]?.message?.content;

    if (!reply) {
      return res.status(500).json({
        success: false,
        message: "No reply received from AI service",
      });
    }

    res.json({ success: true, reply });
  } catch (error) {
    console.error("AI Interview Error:", error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: "AI Interview service is currently unavailable.",
    });
  }
});

export default router;
