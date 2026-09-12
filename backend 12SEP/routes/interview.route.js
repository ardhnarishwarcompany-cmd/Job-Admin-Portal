import express from "express";
import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import path from "path";
import authenticateToken from "../middleware/isAuthenticated.js";
import { interviewAnswerUpload } from "../middleware/multer.js";
import {
  InterviewTemplateModel, AiInterviewModel,
} from "../models/dbModels.js";
import { User } from "../models/user.model.js";
import { Job } from "../models/job.model.js";
import { Notification } from "../models/notification.model.js";

const router = express.Router();

const parseJson = (v, fallback) => {
  if (v === null || v === undefined) return fallback;
  if (typeof v !== "string") return v;
  try { return JSON.parse(v); } catch { return fallback; }
};

const callGroqChat = async (systemPrompt, userPrompt) => {
  const response = await axios.post(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      model: "groq/compound-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    },
    { headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}`, "Content-Type": "application/json" } }
  );
  const content = response.data.choices[0].message.content;
  return content ? content.replace(/<think>[\s\S]*?<\/think>/gi, "").trim() : "";
};

// Transcribes a locally-saved audio/video file using Groq's Whisper endpoint.
const transcribeWithGroq = async (filePath) => {
  const form = new FormData();
  form.append("file", fs.createReadStream(filePath));
  form.append("model", "whisper-large-v3");
  const response = await axios.post(
    "https://api.groq.com/openai/v1/audio/transcriptions",
    form,
    { headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}`, ...form.getHeaders() }, maxBodyLength: Infinity }
  );
  return response.data.text || "";
};

const requireRole = (role) => async (req, res, next) => {
  const me = await User.findById(req.id);
  if (!me || me.role !== role) {
    return res.status(403).json({ success: false, message: `${role} access required` });
  }
  req.currentUser = me;
  next();
};

/* =====================================================================
   RECRUITER — question templates (AI-generated, then editable)
   ===================================================================== */

// POST /api/interviews/templates/generate  { jobTitle, jobDescription, focus, count }
router.post("/templates/generate", authenticateToken, requireRole("Recruiter"), async (req, res) => {
  try {
    const { jobTitle, jobDescription, focus = "Mixed", count = 8 } = req.body;
    if (!jobTitle?.trim()) {
      return res.status(400).json({ success: false, message: "Job title is required." });
    }
    const content = await callGroqChat(
      `You are an expert technical interviewer. Generate interview questions for a video-recorded, one-question-at-a-time
AI interview. Reply with ONLY a valid JSON array — no markdown, no extra text. Format:
[{ "text": "question text", "timeLimitSec": 90 }]
Rules:
- Generate exactly ${count} questions.
- Focus: ${focus} (Technical, Behavioral, or Mixed — mix technical depth + behavioral/situational questions if "Mixed").
- Questions must be answerable out loud in under the given time limit (60-150 seconds each).
- Make them specific to the role, not generic ("tell me about yourself" is fine as ONE opener, not all of them).
- timeLimitSec should reflect question complexity (simple = 60-75, complex/technical = 90-150).`,
      `Job title: ${jobTitle}\nJob description: ${jobDescription?.trim() || "Not provided — write general questions for this role."}`
    );
    let questions;
    try {
      questions = JSON.parse(content.match(/\[[\s\S]*\]/)?.[0] || content);
    } catch {
      return res.status(502).json({ success: false, message: "AI response could not be parsed. Please try again." });
    }
    const withIds = questions.map((q, i) => ({ id: `q-${Date.now()}-${i}`, order: i, text: q.text, timeLimitSec: q.timeLimitSec || 90 }));
    res.json({ success: true, questions: withIds });
  } catch (error) {
    console.error("generate questions error:", error.response?.data || error.message);
    res.status(500).json({ success: false, message: "Could not generate questions right now." });
  }
});

// POST /api/interviews/templates  { jobId, title, questions, prepTimeSec, timeLimitSec }
router.post("/templates", authenticateToken, requireRole("Recruiter"), async (req, res) => {
  try {
    const { jobId, title, questions, prepTimeSec, timeLimitSec } = req.body;
    if (!title?.trim() || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ success: false, message: "Title and at least one question are required." });
    }
    const template = await InterviewTemplateModel.create({
      recruiterId: req.id, jobId, title: title.trim(), questions, prepTimeSec, timeLimitSec,
    });
    res.status(201).json({ success: true, template: { ...template, questions: parseJson(template.questions, []) } });
  } catch (error) {
    console.error("create template error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.get("/templates", authenticateToken, requireRole("Recruiter"), async (req, res) => {
  try {
    const templates = await InterviewTemplateModel.findByRecruiterId(req.id);
    res.json({ success: true, templates: templates.map((t) => ({ ...t, questions: parseJson(t.questions, []) })) });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.put("/templates/:id", authenticateToken, requireRole("Recruiter"), async (req, res) => {
  try {
    const existing = await InterviewTemplateModel.findById(req.params.id);
    if (!existing || existing.recruiter_id !== req.id) {
      return res.status(404).json({ success: false, message: "Template not found" });
    }
    const { title, questions, prepTimeSec, timeLimitSec } = req.body;
    const template = await InterviewTemplateModel.update(req.params.id, { title, questions, prepTimeSec, timeLimitSec });
    res.json({ success: true, template: { ...template, questions: parseJson(template.questions, []) } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.delete("/templates/:id", authenticateToken, requireRole("Recruiter"), async (req, res) => {
  try {
    const existing = await InterviewTemplateModel.findById(req.params.id);
    if (!existing || existing.recruiter_id !== req.id) {
      return res.status(404).json({ success: false, message: "Template not found" });
    }
    await InterviewTemplateModel.deleteById(req.params.id);
    res.json({ success: true, message: "Template deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* =====================================================================
   RECRUITER — sending an assessment interview to a candidate
   ===================================================================== */

// POST /api/interviews/send
// { candidateId, jobId, applicationId, questions, allowRetryOnFailure, deadline, prepTimeSec, timeLimitSec, templateId }
router.post("/send", authenticateToken, requireRole("Recruiter"), async (req, res) => {
  try {
    const {
      candidateId, jobId, applicationId, questions, allowRetryOnFailure,
      deadline, prepTimeSec, timeLimitSec, templateId,
    } = req.body;

    if (!candidateId || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ success: false, message: "Candidate and at least one question are required." });
    }
    const candidate = await User.findById(candidateId);
    if (!candidate || candidate.role !== "Employee") {
      return res.status(404).json({ success: false, message: "Candidate not found" });
    }

    let jobTitle = "";
    if (jobId) {
      const job = await Job.findById(jobId);
      jobTitle = job?.title || "";
    }

    const interview = await AiInterviewModel.create({
      mode: "assessment",
      candidateId,
      recruiterId: req.id,
      jobId: jobId || null,
      applicationId: applicationId || null,
      templateId: templateId || null,
      roleTitle: jobTitle || null,
      questions,
      allowRetryOnFailure: !!allowRetryOnFailure,
      prepTimeSec,
      timeLimitSec,
      deadline: deadline || null,
    });

    await Notification.create({
      recipient: candidateId,
      title: "AI Interview Invitation",
      body: jobTitle
        ? `You've been invited to a video AI interview for "${jobTitle}". ${deadline ? `Complete it before ${new Date(deadline).toLocaleDateString()}.` : ""}`
        : "You've been invited to a video AI interview.",
      type: "interview",
      priority: "high",
    }).catch(() => {});

    res.status(201).json({ success: true, message: "Interview sent to candidate", interview: { ...interview, questions: parseJson(interview.questions, []) } });
  } catch (error) {
    console.error("send interview error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// GET /api/interviews/recruiter — everything this recruiter has sent
router.get("/recruiter", authenticateToken, requireRole("Recruiter"), async (req, res) => {
  try {
    const rows = await AiInterviewModel.findByRecruiterId(req.id);
    const withCandidates = await Promise.all(
      rows.map(async (r) => {
        const candidate = await User.findById(r.candidate_id);
        return {
          ...r,
          questions: parseJson(r.questions, []),
          answers: parseJson(r.answers, []),
          categoryScores: parseJson(r.category_scores, null),
          candidateName: candidate?.fullname || "Unknown",
          candidateEmail: candidate?.email || "",
        };
      })
    );
    res.json({ success: true, interviews: withCandidates });
  } catch (error) {
    console.error("list recruiter interviews error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* =====================================================================
   CANDIDATE — practice mode + taking an assessment
   ===================================================================== */

// POST /api/interviews/practice/start  { roleTitle, focus }
router.post("/practice/start", authenticateToken, requireRole("Employee"), async (req, res) => {
  try {
    const { roleTitle, focus = "Mixed" } = req.body;
    if (!roleTitle?.trim()) {
      return res.status(400).json({ success: false, message: "Enter the role you want to practice for." });
    }
    const content = await callGroqChat(
      `You are an expert interview coach. Generate practice interview questions for a video-recorded, one-question-at-a-time
mock interview. Reply with ONLY a valid JSON array — no markdown. Format:
[{ "text": "question text", "timeLimitSec": 90 }]
Generate exactly 6 questions, focus: ${focus}. Keep them realistic for this role and answerable out loud in under the time limit.`,
      `Role to practice for: ${roleTitle}`
    );
    let questions;
    try {
      questions = JSON.parse(content.match(/\[[\s\S]*\]/)?.[0] || content);
    } catch {
      return res.status(502).json({ success: false, message: "Could not generate practice questions. Please try again." });
    }
    const withIds = questions.map((q, i) => ({ id: `q-${Date.now()}-${i}`, order: i, text: q.text, timeLimitSec: q.timeLimitSec || 90 }));

    const interview = await AiInterviewModel.create({
      mode: "practice",
      candidateId: req.id,
      roleTitle: roleTitle.trim(),
      questions: withIds,
      allowRetryOnFailure: true, // practice mode is always forgiving
      prepTimeSec: 15,
      timeLimitSec: 90,
    });
    res.status(201).json({ success: true, interview: { ...interview, questions: withIds } });
  } catch (error) {
    console.error("practice start error:", error.response?.data || error.message);
    res.status(500).json({ success: false, message: "Could not start practice interview." });
  }
});

// GET /api/interviews/candidate — this candidate's own history (practice + assessment)
router.get("/candidate", authenticateToken, requireRole("Employee"), async (req, res) => {
  try {
    const rows = await AiInterviewModel.findByCandidateId(req.id);
    res.json({
      success: true,
      interviews: rows.map((r) => ({
        ...r,
        questions: parseJson(r.questions, []),
        answers: parseJson(r.answers, []),
        categoryScores: parseJson(r.category_scores, null),
      })),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Shared visibility check: candidate who owns it, the recruiter who sent it, or an admin.
const canView = async (interview, userId) => {
  if (interview.candidate_id === userId) return true;
  if (interview.recruiter_id === userId) return true;
  const me = await User.findById(userId);
  return me?.role === "Admin";
};

// GET /api/interviews/:id — fetch one session (used by candidate to resume, recruiter/admin to review)
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const interview = await AiInterviewModel.findById(req.params.id);
    if (!interview) return res.status(404).json({ success: false, message: "Interview not found" });
    if (!(await canView(interview, req.id))) {
      return res.status(403).json({ success: false, message: "You don't have access to this interview" });
    }
    const candidate = await User.findById(interview.candidate_id);
    res.json({
      success: true,
      interview: {
        ...interview,
        questions: parseJson(interview.questions, []),
        answers: parseJson(interview.answers, []),
        categoryScores: parseJson(interview.category_scores, null),
        candidateName: candidate?.fullname,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// POST /api/interviews/:id/start — candidate begins the session
router.post("/:id/start", authenticateToken, requireRole("Employee"), async (req, res) => {
  try {
    const interview = await AiInterviewModel.findById(req.params.id);
    if (!interview || interview.candidate_id !== req.id) {
      return res.status(404).json({ success: false, message: "Interview not found" });
    }
    if (interview.status === "completed") {
      return res.status(400).json({ success: false, message: "This interview has already been completed." });
    }
    if (interview.deadline && new Date(interview.deadline) < new Date() && interview.status === "pending") {
      await AiInterviewModel.updateStatus(interview.id, "expired");
      return res.status(400).json({ success: false, message: "The deadline for this interview has passed." });
    }
    const updated = await AiInterviewModel.updateStatus(interview.id, "in_progress", { startedAt: new Date() });
    res.json({ success: true, interview: { ...updated, questions: parseJson(updated.questions, []) } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// POST /api/interviews/:id/answer — multipart: field "answer" (video blob) + questionId + attemptNumber
router.post("/:id/answer", authenticateToken, requireRole("Employee"), interviewAnswerUpload, async (req, res) => {
  try {
    const interview = await AiInterviewModel.findById(req.params.id);
    if (!interview || interview.candidate_id !== req.id) {
      return res.status(404).json({ success: false, message: "Interview not found" });
    }
    if (interview.status !== "in_progress") {
      return res.status(400).json({ success: false, message: "This interview is not currently active." });
    }
    const { questionId, failed } = req.body;
    if (!questionId) return res.status(400).json({ success: false, message: "questionId is required" });

    const answers = parseJson(interview.answers, []);
    const priorAttempts = answers.filter((a) => a.questionId === questionId).length;
    const attemptNumber = priorAttempts + 1;

    if (priorAttempts >= 1 && !interview.allow_retry_on_failure) {
      return res.status(400).json({ success: false, message: "Retries are not allowed for this interview." });
    }
    if (priorAttempts >= 2) {
      return res.status(400).json({ success: false, message: "Maximum attempts reached for this question." });
    }

    // Candidate/client reported the recording itself failed (e.g. camera dropped, 0-byte blob) —
    // record it as a failed attempt without needing a valid video file.
    const wasClientReportedFailure = failed === "true" || failed === true;

    let videoUrl = null;
    let transcript = "";
    let transcribeError = null;

    if (!wasClientReportedFailure && req.file) {
      videoUrl = `/uploads/${req.file.filename}`;
      try {
        transcript = await transcribeWithGroq(req.file.path);
      } catch (err) {
        console.error("Whisper transcription error:", err.response?.data || err.message);
        transcribeError = "Could not transcribe this answer automatically.";
      }
    }

    const entry = {
      questionId,
      attemptNumber,
      videoUrl,
      transcript,
      failedAttempt: wasClientReportedFailure || (!videoUrl && !wasClientReportedFailure),
      transcribeError,
      answeredAt: new Date().toISOString(),
    };

    // Replace a prior failed attempt for the same question rather than stacking entries,
    // so only the latest attempt per question counts toward scoring.
    const filtered = answers.filter((a) => a.questionId !== questionId);
    const updated = await AiInterviewModel.saveAnswers(interview.id, [...filtered, entry]);

    res.json({
      success: true,
      canRetry: entry.failedAttempt && interview.allow_retry_on_failure && attemptNumber < 2,
      answer: entry,
    });
  } catch (error) {
    console.error("save answer error:", error);
    res.status(500).json({ success: false, message: "Could not save this answer. Please try again." });
  }
});

// POST /api/interviews/:id/submit — final submission, triggers AI scoring
router.post("/:id/submit", authenticateToken, requireRole("Employee"), async (req, res) => {
  try {
    const interview = await AiInterviewModel.findById(req.params.id);
    if (!interview || interview.candidate_id !== req.id) {
      return res.status(404).json({ success: false, message: "Interview not found" });
    }
    if (interview.status === "completed") {
      return res.json({ success: true, message: "Already submitted." });
    }

    const questions = parseJson(interview.questions, []);
    const answers = parseJson(interview.answers, []);

    const transcriptBlock = questions
      .map((q, i) => {
        const a = answers.find((ans) => ans.questionId === q.id);
        return `Q${i + 1}: ${q.text}\nA${i + 1}: ${a?.transcript?.trim() || "(No answer recorded — technical failure or skipped.)"}`;
      })
      .join("\n\n");

    let scoreResult = {
      score: null,
      categoryScores: null,
      summary: "Scoring unavailable — the interview was submitted but AI evaluation failed. A human reviewer should assess the transcript manually.",
      recommendation: "Review Manually",
    };

    try {
      const content = await callGroqChat(
        `You are an expert interview assessor. Evaluate this candidate's video interview transcript.
Reply with ONLY valid JSON — no markdown. Format:
{
  "score": <integer 0-100>,
  "categoryScores": { "communication": <0-100>, "technicalDepth": <0-100>, "confidence": <0-100>, "relevance": <0-100> },
  "summary": "3-4 sentence professional summary of how the candidate performed",
  "recommendation": "Strong Hire" | "Consider" | "Not a Fit"
}
Base scores only on the transcript content — communication clarity, structure (STAR method where relevant), technical accuracy,
relevance to the question, and confidence conveyed through the language used. If many answers are missing (technical failures),
factor that into a lower confidence score but note it fairly in the summary rather than penalizing the candidate unfairly.`,
        `Role: ${interview.role_title || "Not specified"}\n\n${transcriptBlock}`
      );
      const parsed = JSON.parse(content.match(/\{[\s\S]*\}/)?.[0] || content);
      scoreResult = {
        score: parsed.score,
        categoryScores: parsed.categoryScores,
        summary: parsed.summary,
        recommendation: parsed.recommendation,
      };
    } catch (err) {
      console.error("interview scoring error:", err.response?.data || err.message);
    }

    const updated = await AiInterviewModel.updateStatus(interview.id, "completed", {
      completedAt: new Date(),
      overallScore: scoreResult.score,
      categoryScores: scoreResult.categoryScores,
      aiSummary: scoreResult.summary,
      recommendation: scoreResult.recommendation,
    });

    if (interview.recruiter_id) {
      const candidate = await User.findById(interview.candidate_id);
      await Notification.create({
        recipient: interview.recruiter_id,
        title: "AI Interview Completed",
        body: `${candidate?.fullname || "A candidate"} has completed their AI interview${interview.role_title ? ` for "${interview.role_title}"` : ""}.`,
        type: "interview",
        priority: "medium",
      }).catch(() => {});
    }

    res.json({
      success: true,
      message: "Interview submitted",
      interview: { ...updated, questions: parseJson(updated.questions, []), answers: parseJson(updated.answers, []) },
    });
  } catch (error) {
    console.error("submit interview error:", error);
    res.status(500).json({ success: false, message: "Could not submit the interview. Please try again." });
  }
});

export default router;
