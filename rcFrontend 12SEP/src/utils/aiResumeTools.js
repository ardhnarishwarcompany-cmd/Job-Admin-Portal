// Thin wrappers around the backend's real AI endpoints (Groq-powered) used by
// the CV Maker and Resume Scanner. Same backend as the rest of the app.
import axios from "axios";
import { AI_API_ENDPOINT } from "@/utils/data.js";

// Uploads a PDF file and gets back extracted plain text (server-side parsing,
// works reliably for real PDFs — no client-side extraction guesswork).
export const parseResumePdf = async (file) => {
  const formData = new FormData();
  formData.append("pdf", file);
  const res = await axios.post(`${AI_API_ENDPOINT}/parse-pdf`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data; // { success, text, pages }
};

// Real AI ATS score for a resume, optionally matched against a job description.
export const getAtsScore = async (resumeText, jobDescription = "") => {
  const res = await axios.post(`${AI_API_ENDPOINT}/ats-score`, { resumeText, jobDescription });
  return res.data; // { success, result: {...} }
};

// Best-effort local extraction to pre-fill a few CV Maker fields from raw
// extracted resume text. Heuristic only — the user always reviews/edits.
export const guessFieldsFromText = (text) => {
  if (!text) return {};
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const phoneMatch = text.match(/(\+?\d[\d\s-]{8,}\d)/);
  const linkedinMatch = text.match(/(https?:\/\/)?(www\.)?linkedin\.com\/[^\s,]+/i);
  const firstLine = text.split("\n").map((l) => l.trim()).find(Boolean) || "";
  // A name line is usually short, has no digits/@ and isn't a section header.
  const looksLikeName = firstLine.length > 0 && firstLine.length < 45 && !/[@\d]/.test(firstLine);

  return {
    name: looksLikeName ? firstLine : "",
    email: emailMatch ? emailMatch[0] : "",
    phone: phoneMatch ? phoneMatch[0].trim() : "",
    linkedin: linkedinMatch ? linkedinMatch[0] : "",
  };
};
