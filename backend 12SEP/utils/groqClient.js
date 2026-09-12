import axios from "axios";

export const isGroqConfigured = () => Boolean(process.env.GROQ_API_KEY);

export const groqChat = async ({
  system,
  messages = [],
  maxTokens = 500,
  temperature = 0.7,
  json = false,
}) => {
  if (!process.env.GROQ_API_KEY) {
    const err = new Error("GROQ_API_KEY missing in backend .env");
    err.code = "NO_GROQ_KEY";
    throw err;
  }
  const body = {
    model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
    messages: [{ role: "system", content: system }, ...messages],
    max_tokens: maxTokens,
    temperature,
  };
  if (json) body.response_format = { type: "json_object" };
  const response = await axios.post("https://api.groq.com/openai/v1/chat/completions", body, {
    headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}`, "Content-Type": "application/json" },
    timeout: 60000,
  });
  return response.data?.choices?.[0]?.message?.content || "";
};
