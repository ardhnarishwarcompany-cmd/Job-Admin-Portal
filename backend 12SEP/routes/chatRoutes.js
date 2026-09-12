import express from "express";
import axios from "axios";

const router = express.Router();

router.post("/message", async (req, res) => {
  try {
    const { message } = req.body;

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "groq/compound-mini",

        messages: [
          {
            role: "system",
            content:
              "You are a helpful AI Job Assistant for interview and job preparation.",
          },
          {
            role: "user",
            content: message,
          },
        ],
      },
      {
        headers: {
          Authorization:
            `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const reply =
      response.data.choices[0].message.content;

    res.json({
      success: true,
      reply,
    });
  } catch (error) {
    console.log(
      error.response?.data || error.message
    );

    res.status(500).json({
      success: false,
      message: "AI Error",
    });
  }
});

export default router;