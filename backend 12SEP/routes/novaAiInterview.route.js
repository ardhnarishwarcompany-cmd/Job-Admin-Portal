import express from "express";
import fs from "fs";
import FormData from "form-data";
import axios from "axios";
import authenticateToken from "../middleware/isAuthenticated.js";
import { interviewAnswerUpload } from "../middleware/multer.js";
import { connection, UserModel } from "../models/dbModels.js";
import { User } from "../models/user.model.js";
import { Job } from "../models/job.model.js";
import { startNovaInterview, processNovaAnswer } from "../utils/novaInterviewConductor.js";
import { Notification } from "../models/notification.model.js";
import { sendInterviewDecisionEmail } from "../utils/mailer.js";

const router = express.Router();

import { checkRecruiterFeature } from "../middleware/checkRecruiterFeature.js";
router.use(authenticateToken);
router.use(checkRecruiterFeature("nova"));

const parseJson = (value, fallback = []) => {
  if (value === null || value === undefined) return fallback;
  if (typeof value !== "string") return value;
  try { return JSON.parse(value); } catch { return fallback; }
};

const getSession = async (id) => {
  const [rows] = await connection.promise().query(
    "SELECT * FROM ai_screening_interviews WHERE id = ? LIMIT 1", [id]
  );
  return rows[0] || null;
};

const safeSession = (row, includePrivate = false) => {
  if (!row) return null;
  const out = {
    id: row.id,
    userId: row.user_id,
    candidateId: row.candidate_id,
    initiatedByUserId: row.initiated_by_user_id,
    jobId: row.job_id,
    jobTitle: row.job_title,
    candidateName: row.candidate_name,
    companyLogo: row.company_logo,
    phase: row.phase,
    phaseTurns: row.phase_turns,
    turns: row.turns,
    questionIndex: row.question_index,
    questionStartedAt: row.question_started_at,
    questionTimeLimitSeconds: row.question_time_limit_seconds,
    timedOutQuestions: parseJson(row.timed_out_questions, []),
    transcript: parseJson(row.transcript, []),
    questionPlan: parseJson(row.question_plan, []),
    askedQuestions: parseJson(row.asked_questions, []),
    scores: parseJson(row.scores, []),
    answerEvaluations: parseJson(row.answer_evaluations, []),
    avgScore: row.avg_score,
    aiRecommendation: row.ai_recommendation,
    evaluationSummary: parseJson(row.evaluation_summary, null),
    status: row.status,
    startedAt: row.started_at,
    completedAt: row.completed_at,
    proctoring: parseJson(row.proctoring, {}),
    reviewScore: row.review_score,
    reviewDecision: row.review_decision,
    reviewedByUserId: row.reviewed_by_user_id,
    reviewedAt: row.reviewed_at,
    videoRecordingUrl: row.video_recording_url,
    videoMimeType: row.video_mime_type,
    videoDurationSeconds: row.video_duration_seconds,
    answerVideos: parseJson(row.answer_videos, []),
    hrApprovalStatus: row.hr_approval_status || "pending",
    adminApprovalStatus: row.admin_approval_status || "pending",
    hrApprovedByUserId: row.hr_approved_by_user_id,
    adminApprovedByUserId: row.admin_approved_by_user_id,
    hrApprovedAt: row.hr_approved_at,
    adminApprovedAt: row.admin_approved_at,
    approvalRequestedAt: row.approval_requested_at,
    approvalRejectionReason: row.approval_rejection_reason,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
  if (!includePrivate) {
    // Candidates can use the transcript/question data while the interview is active.
    // After completion, the candidate-facing result is intentionally minimal: final decision,
    // job title and completion status. Scores, recordings, transcript and answer details remain
    // private for Admin/HR/Recruiter review.
    if (out.status !== "completed") {
      delete out.reviewScore;
      delete out.reviewDecision;
      delete out.reviewedByUserId;
      delete out.reviewedAt;
    } else {
      delete out.reviewScore;
      delete out.avgScore;
      delete out.scores;
      delete out.answerEvaluations;
      delete out.answerVideos;
      delete out.videoRecordingUrl;
      delete out.videoMimeType;
      delete out.videoDurationSeconds;
      delete out.transcript;
      delete out.questionPlan;
      delete out.askedQuestions;
      delete out.proctoring;
      delete out.aiRecommendation;
      delete out.evaluationSummary;
      delete out.reviewedByUserId;
    }
  }
  return out;
};

const candidateNameFor = async (id) => {
  const u = await User.findById(id);
  return u?.fullname || u?.name || "Candidate";
};

const roleFor = async (id) => {
  const u = await User.findById(id);
  return u?.role || null;
};

const updateSession = async (id, patch) => {
  const allowed = {
    phase: "phase", phaseTurns: "phase_turns", turns: "turns",
    questionIndex: "question_index", questionStartedAt: "question_started_at",
    questionTimeLimitSeconds: "question_time_limit_seconds",
    timedOutQuestions: "timed_out_questions", transcript: "transcript",
    questionPlan: "question_plan", askedQuestions: "asked_questions",
    scores: "scores", answerEvaluations: "answer_evaluations",
    avgScore: "avg_score", aiRecommendation: "ai_recommendation",
    evaluationSummary: "evaluation_summary", status: "status",
    hrUserId: "hr_user_id",
    hrApprovalStatus: "hr_approval_status",
    adminApprovalStatus: "admin_approval_status",
    hrApprovedByUserId: "hr_approved_by_user_id",
    adminApprovedByUserId: "admin_approved_by_user_id",
    hrApprovedAt: "hr_approved_at",
    adminApprovedAt: "admin_approved_at",
    approvalRequestedAt: "approval_requested_at",
    approvalRejectionReason: "approval_rejection_reason",
    startedAt: "started_at", completedAt: "completed_at",
    proctoring: "proctoring", reviewScore: "review_score",
    reviewDecision: "review_decision", reviewedByUserId: "reviewed_by_user_id",
    reviewedAt: "reviewed_at", videoRecordingUrl: "video_recording_url",
    answerVideos: "answer_videos",
    videoMimeType: "video_mime_type", videoDurationSeconds: "video_duration_seconds",
  };
  const fields = [], values = [];
  for (const [key, column] of Object.entries(allowed)) {
    if (patch[key] !== undefined) {
      fields.push(`\`${column}\` = ?`);
      let v = patch[key];
      if (["timedOutQuestions","transcript","questionPlan","askedQuestions","scores","answerEvaluations","evaluationSummary","proctoring","answerVideos"].includes(key)) {
        v = v === null ? null : JSON.stringify(v);
      }
      values.push(v);
    }
  }
  if (!fields.length) return getSession(id);
  values.push(id);
  await connection.promise().query(
    `UPDATE ai_screening_interviews SET ${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, values
  );
  return getSession(id);
};

const createSession = async ({ candidateId, initiatedByUserId, jobId, jobTitle }) => {
  const candidateName = await candidateNameFor(candidateId);
  let resolvedTitle = jobTitle || null;
  let hrUserId = null;
  let companyLogo = null;

  if (jobId) {
    const [jobRows] = await connection.promise().query(
      `SELECT j.title, j.created_by, c.logo AS company_logo
       FROM jobs j LEFT JOIN companies c ON c.id = j.company
       WHERE j.id = ? LIMIT 1`,
      [jobId]
    );
    const job = jobRows[0];
    resolvedTitle = job?.title || resolvedTitle;
    hrUserId = job?.created_by ? Number(job.created_by) : null;
    companyLogo = job?.company_logo || null;
  }

  const started = await startNovaInterview({ candidateName, jobTitle: resolvedTitle });
  const now = new Date();
  const transcript = [
    { role: "robot", content: started.greeting, timestamp: now.toISOString(), phase: "approval" },
    { role: "robot", content: started.firstQuestion, category: started.questionPlan?.[0]?.category, questionIndex: 0, timestamp: now.toISOString() },
  ];
  const proctoring = {
    cameraRequired: true,
    microphoneRequired: true,
    fullscreenRequired: true,
    screenShareRequired: true,
    violations: [],
    violationCount: 0,
    status: "waiting_for_approval",
  };

  // Prevent duplicate pending/live requests for the same candidate.
  const [existing] = await connection.promise().query(
    `SELECT id FROM ai_screening_interviews
     WHERE user_id = ?
       AND status IN ('pending_approval','approved','in_progress')
     ORDER BY created_at DESC LIMIT 1`,
    [candidateId]
  );
  if (existing[0]?.id) return getSession(existing[0].id);

  const [result] = await connection.promise().query(
    `INSERT INTO ai_screening_interviews
      (user_id,candidate_id,initiated_by_user_id,hr_user_id,job_id,job_title,candidate_name,company_logo,
       phase,phase_turns,turns,question_index,question_started_at,question_time_limit_seconds,
       timed_out_questions,transcript,question_plan,asked_questions,scores,answer_evaluations,
       answer_videos,status,started_at,proctoring,hr_approval_status,admin_approval_status,approval_requested_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      candidateId, candidateId, initiatedByUserId || null, hrUserId, jobId || null, resolvedTitle, candidateName,
      companyLogo, started.phase || "core", 0, 0, 0, null, 10,
      JSON.stringify([]), JSON.stringify(transcript), JSON.stringify(started.questionPlan || []),
      JSON.stringify([started.firstQuestion]), JSON.stringify([]), JSON.stringify([]), JSON.stringify([]),
      "pending_approval", null, JSON.stringify(proctoring), "pending", "pending", now
    ]
  );
  const row = await getSession(result.insertId);

  // Notify assigned HR and all connected admins immediately.
  const io = globalThis.__JOBPORTAL_IO__ || null;
  if (io) {
    if (hrUserId) io.to(`user:${hrUserId}`).emit("nova_interview_request", { interviewId: row.id });
    io.emit("nova_interview_admin_request", { interviewId: row.id });
  }
  return row;
};

const canAccess = async (req, row) => {
  if (!row) return false;
  if (Number(row.user_id) === Number(req.id)) return true;
  const role = await roleFor(req.id);
  if (role === "Admin") return true;
  if (role === "Recruiter" || role === "Client") {
    return !row.hr_user_id || Number(row.hr_user_id) === Number(req.id) || Number(row.initiated_by_user_id) === Number(req.id);
  }
  return false;
};

// Candidate submits a NOVA interview request. The request is sent to BOTH the assigned HR/recruiter and Admin.
// Only ONE approval is required to start the interview.
router.post("/start", authenticateToken, async (req, res) => {
  try {
    const role = await roleFor(req.id);
    if (role !== "Employee") return res.status(403).json({ success:false, message:"Candidate access required." });
    const row = await createSession({
      candidateId: req.id,
      initiatedByUserId: null,
      jobId: req.body.jobId || null,
      jobTitle: String(req.body.jobTitle || "General Job Interview").trim(),
    });
    res.status(201).json({ success:true, data:safeSession(row), message:"Interview request sent to HR and Admin." });
  } catch (error) {
    console.error("NOVA request error:", error);
    res.status(500).json({ success:false, message:"Could not send NOVA AI interview request.", error:error.message });
  }
});

// Recruiter/admin/client starts a candidate interview.
router.post("/start-for-candidate", authenticateToken, async (req, res) => {
  try {
    const role = await roleFor(req.id);
    if (!["Recruiter","Admin","Client"].includes(role)) return res.status(403).json({ success:false,message:"Recruiter/admin access required." });
    const candidateId = Number(req.body.candidateId);
    if (!candidateId) return res.status(400).json({ success:false,message:"candidateId is required." });
    const candidate = await User.findById(candidateId);
    if (!candidate || candidate.role !== "Employee") return res.status(404).json({ success:false,message:"Candidate not found." });
    const row = await createSession({
      candidateId, initiatedByUserId:req.id,
      jobId:req.body.jobId || null, jobTitle:req.body.jobTitle || null
    });
    res.status(201).json({ success:true,data:safeSession(row,true) });
  } catch (error) {
    console.error("NOVA recruiter start error:", error);
    res.status(500).json({ success:false,message:"Could not create candidate NOVA interview.",error:error.message });
  }
});


const emitApprovalUpdate = (req, row) => {
  const io = req.app.get("io");
  if (!io || !row) return;
  io.to(`user:${row.user_id}`).emit("nova_interview_approval_updated", { interviewId: row.id });
  if (row.hr_user_id) io.to(`user:${row.hr_user_id}`).emit("nova_interview_approval_updated", { interviewId: row.id });
  io.emit("nova_interview_admin_approval_updated", { interviewId: row.id });
};

router.get("/hr/pending", authenticateToken, async (req,res)=>{
  try {
    const role = await roleFor(req.id);
    if(!["Recruiter","Client"].includes(role)) return res.status(403).json({success:false,message:"HR access required."});
    const [rows] = await connection.promise().query(
      `SELECT * FROM ai_screening_interviews
       WHERE status = 'pending_approval'
         AND hr_approval_status = 'pending'
         AND (hr_user_id IS NULL OR hr_user_id = ?)
       ORDER BY created_at ASC`,[req.id]
    );
    res.json({success:true,data:rows.map(r=>safeSession(r,true))});
  } catch(e){res.status(500).json({success:false,message:"Could not load pending HR approvals."});}
});

router.post("/:id/hr-approval", authenticateToken, async (req,res)=>{
  try {
    const role = await roleFor(req.id);
    if(!["Recruiter","Client"].includes(role)) return res.status(403).json({success:false,message:"HR access required."});
    const row = await getSession(req.params.id);
    if(!row || row.status !== "pending_approval") return res.status(404).json({success:false,message:"Interview request not found."});
    if(row.hr_user_id && Number(row.hr_user_id)!==Number(req.id)) return res.status(403).json({success:false,message:"This interview is assigned to another HR user."});
    const decision=String(req.body.decision||"approved").toLowerCase();
    if(!["approved","rejected"].includes(decision)) return res.status(400).json({success:false,message:"Decision must be approved or rejected."});
    const patch={
      hrApprovalStatus:decision,
      hrUserId:req.id,
      hrApprovedByUserId:req.id,
      hrApprovedAt:new Date(),
      approvalRejectionReason:decision==="rejected"?String(req.body.reason||"Rejected by HR"):(row.approval_rejection_reason||null),
    };
    const next=await updateSession(row.id,patch);
    // ONE approval is enough. If the other reviewer later rejects, an already
    // approved interview remains approved; a rejection only wins when nobody
    // has approved it. This keeps both reviewers notified without blocking the
    // candidate on the second response.
    if(decision==="approved"){
      await updateSession(row.id,{status:"approved",proctoring:{...parseJson(next.proctoring,{}),status:"approved_waiting_to_start",approvedBy:"hr"}});
    } else if(next.admin_approval_status==="rejected"){
      await updateSession(row.id,{status:"rejected"});
    } else {
      await updateSession(row.id,{status:"pending_approval"});
    }
    const finalRow=await getSession(row.id);
    emitApprovalUpdate(req,finalRow);
    res.json({success:true,data:safeSession(finalRow,true),message:finalRow.status==="approved"?"HR approval received. Interview is ready to start.":"HR response saved. Waiting for an approval."});
  } catch(e){console.error("NOVA HR approval error:",e);res.status(500).json({success:false,message:"Could not save HR approval.",error:e.message});}
});

router.get("/admin/pending", authenticateToken, async (req,res)=>{
  try {
    if(await roleFor(req.id)!=="Admin") return res.status(403).json({success:false,message:"Admin access required."});
    const [rows] = await connection.promise().query(
      `SELECT * FROM ai_screening_interviews
       WHERE status = 'pending_approval' AND admin_approval_status = 'pending'
       ORDER BY created_at ASC`
    );
    res.json({success:true,data:rows.map(r=>safeSession(r,true))});
  } catch(e){res.status(500).json({success:false,message:"Could not load pending Admin approvals."});}
});

router.post("/:id/admin-approval", authenticateToken, async (req,res)=>{
  try {
    if(await roleFor(req.id)!=="Admin") return res.status(403).json({success:false,message:"Admin access required."});
    const row=await getSession(req.params.id);
    if(!row || row.status!=="pending_approval") return res.status(404).json({success:false,message:"Interview request not found."});
    const decision=String(req.body.decision||"approved").toLowerCase();
    if(!["approved","rejected"].includes(decision)) return res.status(400).json({success:false,message:"Decision must be approved or rejected."});
    const patch={
      adminApprovalStatus:decision,
      adminApprovedByUserId:req.id,
      adminApprovedAt:new Date(),
      approvalRejectionReason:decision==="rejected"?String(req.body.reason||"Rejected by Admin"):(row.approval_rejection_reason||null),
    };
    const next=await updateSession(row.id,patch);
    // ONE approval is enough. If HR has already approved, Admin approval is
    // immediately reflected as approved too; otherwise Admin approval alone
    // starts the interview.
    if(decision==="approved"){
      await updateSession(row.id,{status:"approved",proctoring:{...parseJson(next.proctoring,{}),status:"approved_waiting_to_start",approvedBy:"admin"}});
    } else if(next.hr_approval_status==="rejected"){
      await updateSession(row.id,{status:"rejected"});
    } else {
      await updateSession(row.id,{status:"pending_approval"});
    }
    const finalRow=await getSession(row.id);
    emitApprovalUpdate(req,finalRow);
    res.json({success:true,data:safeSession(finalRow,true),message:finalRow.status==="approved"?"Admin approval received. Interview is ready to start.":"Admin response saved. Waiting for an approval."});
  } catch(e){console.error("NOVA Admin approval error:",e);res.status(500).json({success:false,message:"Could not save Admin approval.",error:e.message});}
});

router.get("/candidate", authenticateToken, async (req,res)=>{
  try {
    const role = await roleFor(req.id);
    if(role !== "Employee") return res.status(403).json({success:false,message:"Candidate access required."});
    const [rows] = await connection.promise().query(
      "SELECT * FROM ai_screening_interviews WHERE user_id = ? ORDER BY created_at DESC",[req.id]
    );
    res.json({success:true,data:rows.map(r=>safeSession(r))});
  } catch(e){ res.status(500).json({success:false,message:"Could not load interviews."}); }
});

router.get("/recruiter", authenticateToken, async (req,res)=>{
  try {
    const role = await roleFor(req.id);
    if(!["Recruiter","Client"].includes(role)) return res.status(403).json({success:false,message:"HR access required."});
    const [rows] = await connection.promise().query(
      `SELECT * FROM ai_screening_interviews
       WHERE hr_user_id = ? OR hr_user_id IS NULL OR initiated_by_user_id = ?
       ORDER BY created_at DESC`,[req.id,req.id]
    );
    res.json({success:true,data:rows.map(r=>safeSession(r,true))});
  } catch(e){ res.status(500).json({success:false,message:"Could not load HR NOVA interviews."}); }
});

router.get("/admin/all", authenticateToken, async (req,res)=>{
  try {
    if(await roleFor(req.id) !== "Admin") return res.status(403).json({success:false,message:"Admin access required."});
    const [rows] = await connection.promise().query("SELECT * FROM ai_screening_interviews ORDER BY created_at DESC");
    res.json({success:true,data:rows.map(r=>safeSession(r,true))});
  } catch(e){ res.status(500).json({success:false,message:"Could not load AI interviews."}); }
});

router.get("/:id", authenticateToken, async (req,res)=>{
  try {
    const row = await getSession(req.params.id);
    if(!await canAccess(req,row)) return res.status(404).json({success:false,message:"Interview not found."});
    res.json({success:true,data:safeSession(row, await roleFor(req.id) !== "Employee")});
  } catch(e){ res.status(500).json({success:false,message:"Could not load interview."}); }
});

router.post("/:id/begin", authenticateToken, async (req,res)=>{
  try {
    const row=await getSession(req.params.id);
    if(!row || Number(row.user_id)!==Number(req.id)) return res.status(404).json({success:false,message:"Interview not found."});
    if(row.status !== "approved" && row.status !== "in_progress") {
      return res.status(409).json({success:false,message:"Interview is waiting for HR or Admin approval."});
    }
    const p=parseJson(row.proctoring,{});
    const updated=await updateSession(row.id,{
      proctoring:{...p,status:"live",beganAt:new Date().toISOString()},
      questionStartedAt:new Date(),
      startedAt:row.started_at||new Date(),
      status:"in_progress"
    });
    res.json({success:true,data:safeSession(updated)});
  }catch(e){res.status(500).json({success:false,message:"Could not begin interview."});}
});

router.post("/:id/violation", authenticateToken, async (req,res)=>{
  try{
    const row=await getSession(req.params.id);
    if(!row || Number(row.user_id)!==Number(req.id)) return res.status(404).json({success:false,message:"Interview not found."});
    const p=parseJson(row.proctoring,{violations:[],violationCount:0});
    const event={
      type:String(req.body.type||"unknown"),
      detail:String(req.body.detail||""),
      timestamp:new Date().toISOString()
    };
    const violations=[...(p.violations||[]),event];
    const updated=await updateSession(row.id,{proctoring:{...p,violations,violationCount:violations.length}});
    res.json({success:true,data:{violationCount:violations.length}});
  }catch(e){res.status(500).json({success:false,message:"Could not record proctoring event."});}
});

const transcribe = async (filePath) => {
  if (!process.env.GROQ_API_KEY) throw new Error("GROQ_API_KEY is missing.");
  const form = new FormData();
  form.append("file", fs.createReadStream(filePath));
  form.append("model","whisper-large-v3");
  const response=await axios.post("https://api.groq.com/openai/v1/audio/transcriptions",form,{
    headers:{Authorization:`Bearer ${process.env.GROQ_API_KEY}`,...form.getHeaders()},
    maxBodyLength:Infinity,
  });
  return response.data?.text || "";
};

router.post("/:id/answer", authenticateToken, interviewAnswerUpload, async (req,res)=>{
  try{
    const row=await getSession(req.params.id);
    if(!row || Number(row.user_id)!==Number(req.id)) return res.status(404).json({success:false,message:"Interview not found."});
    if(row.status!=="in_progress") return res.status(400).json({success:false,message:"Interview is not active."});
    const ctx={
      candidateName:row.candidate_name, jobTitle:row.job_title,
      questionPlan:parseJson(row.question_plan,[]), questionIndex:Number(row.question_index||0),
      phase:row.phase, phaseTurns:Number(row.phase_turns||0), turns:Number(row.turns||0),
      questionStartedAt:row.question_started_at, transcript:parseJson(row.transcript,[]),
      scores:parseJson(row.scores,[]), answerEvaluations:parseJson(row.answer_evaluations,[]),
      askedQuestions:parseJson(row.asked_questions,[])
    };
    let answer=String(req.body.answerText||"").trim();
    if(!answer && req.file){
      try { answer=await transcribe(req.file.path); } catch(e){ console.error("NOVA transcription error:",e.response?.data||e.message); }
    }
    const timedOut=String(req.body.timedOut||"false")==="true";
    const result=await processNovaAnswer(ctx,answer,{timedOut,timeoutReason:timedOut?"max_time":"manual"});
    const currentVideoUrls=Array.isArray(parseJson(row.answer_videos,[]))?parseJson(row.answer_videos,[]):[];
    if(req.file) currentVideoUrls.push({questionIndex:ctx.questionIndex,url:`/uploads/${req.file.filename}`,mimeType:req.file.mimetype});
    const nextProctoring=parseJson(row.proctoring,{});
    const patch={
      phase:result.phase,phaseTurns:result.phaseTurns,turns:result.turns,questionIndex:result.questionIndex,
      questionStartedAt:result.questionStartedAt||null, questionTimeLimitSeconds:10,
      timedOutQuestions:result.answerEvaluations?.filter(a=>a.timedOut).map(a=>a.questionIndex)||[],
      transcript:result.transcript,questionPlan:result.questionPlan,askedQuestions:result.askedQuestions,
      scores:result.scores,answerEvaluations:result.answerEvaluations,
      avgScore:result.avgScore??null,evaluationSummary:result.evaluationSummary??null,
      aiRecommendation:result.aiRecommendation??null,
      status:result.done?"completed":"in_progress",
      completedAt:result.done?new Date():null,
      answerVideos:currentVideoUrls,
    };
    const updated=await updateSession(row.id,patch);
    if(req.file && fs.existsSync(req.file.path) && !process.env.KEEP_INTERVIEW_TEMP_FILES) {
      // Keep recordings by default because recruiters may need them.
    }
    res.json({success:true,data:{
      ...safeSession(updated,true),
      response:result.response,action:result.action,advance:result.advance,done:result.done,
      score:result.score??null,transcript:answer,
    }});
  }catch(e){
    console.error("NOVA answer error:",e.response?.data||e.stack||e.message);
    res.status(500).json({success:false,message:"Could not process the AI interview answer.",error:e.message});
  }
});

router.post("/:id/final-video", authenticateToken, interviewAnswerUpload, async (req,res)=>{
  try{
    const row=await getSession(req.params.id);
    if(!row || Number(row.user_id)!==Number(req.id)) return res.status(404).json({success:false,message:"Interview not found."});
    if(!req.file) return res.status(400).json({success:false,message:"Video file is required."});
    const updated=await updateSession(row.id,{
      videoRecordingUrl:`/uploads/${req.file.filename}`,
      videoMimeType:req.file.mimetype,
      videoDurationSeconds:req.body.durationSeconds?Number(req.body.durationSeconds):null,
    });
    res.json({success:true,data:safeSession(updated)});
  }catch(e){res.status(500).json({success:false,message:"Could not save final recording."});}
});

router.post("/:id/review", authenticateToken, async (req,res)=>{
  try{
    const row=await getSession(req.params.id);
    const role=await roleFor(req.id);
    if(!row || !["Recruiter","Admin","Client"].includes(role)) return res.status(404).json({success:false,message:"Interview not found."});
    if(!await canAccess(req,row)) return res.status(403).json({success:false,message:"You are not authorized to review this interview."});
    if(row.status !== "completed") return res.status(409).json({success:false,message:"Interview must be completed before a hiring decision."});

    const decision=String(req.body.decision||"HOLD").toUpperCase();
    if(!["HIRE","HOLD","REJECT"].includes(decision)) return res.status(400).json({success:false,message:"Invalid decision."});
    const score=req.body.score===undefined||req.body.score===null?null:Number(req.body.score);
    const previousDecision=String(row.review_decision || "PENDING").toUpperCase();
    const updated=await updateSession(row.id,{
      reviewScore:Number.isFinite(score)?score:null,
      reviewDecision:decision,
      reviewedByUserId:req.id,
      reviewedAt:new Date()
    });

    // Final hiring decision: create an in-app notification and send an email to
    // the candidate. Email failure must never make the successful DB decision fail.
    const candidate=await User.findById(row.user_id);
    const candidateEmail=candidate?.email || null;
    const candidateName=candidate?.fullname || candidate?.name || row.candidate_name || "Candidate";
    const jobTitle=row.job_title || "the position";
    let notificationTitle="Interview decision updated";
    let notificationBody=`Your NOVA AI interview decision for ${jobTitle} has been updated.`;
    if(decision === "HIRE") {
      notificationTitle="🎉 Congratulations! You have been hired";
      notificationBody=`Congratulations ${candidateName}! You have been selected for ${jobTitle}. Your interview has been approved for hiring. Welcome to the next step of your career with the company.`;
    } else if(decision === "REJECT") {
      notificationTitle="NOVA AI interview result";
      notificationBody=`Thank you ${candidateName} for completing your interview for ${jobTitle}. We regret to inform you that you were not selected for this position. We wish you the very best in your job search.`;
    }

    if(previousDecision !== decision) try {
      await Notification.create({
        recipient: Number(row.user_id),
        title: notificationTitle,
        body: notificationBody,
        type: "interview",
        priority: decision === "HIRE" ? "high" : "medium",
        read: false,
      });
    } catch(notificationError) {
      console.error("NOVA decision notification failed:", notificationError.message);
    }

    let decisionEmailSent = false;
    if(previousDecision !== decision && candidateEmail && (decision === "HIRE" || decision === "REJECT")) {
      try {
        const emailResult = await sendInterviewDecisionEmail(candidateEmail, candidateName, jobTitle, decision);
        decisionEmailSent = Boolean(emailResult?.sent);
      } catch (emailError) {
        console.error("NOVA decision email failed:", emailError.message);
      }
    }

    const io=req.app.get("io") || globalThis.__JOBPORTAL_IO__ || null;
    if(io) {
      io.to(`user:${row.user_id}`).emit("nova_interview_decision", {
        interviewId: row.id, decision, jobTitle, candidateName
      });
    }

    res.json({
      success:true,
      data:safeSession(updated,true),
      emailSent: decisionEmailSent,
      message: decision === "HIRE"
        ? `Candidate hired. In-app notification sent${decisionEmailSent ? " and result email sent." : ". Result email could not be sent; check SMTP configuration."}`
        : decision === "REJECT"
          ? `Candidate marked as not hired. Notification sent${decisionEmailSent ? " and regret email sent." : ". Regret email could not be sent; check SMTP configuration."}`
          : "Interview decision saved."
    });
  }catch(e){
    console.error("NOVA review error:",e);
    res.status(500).json({success:false,message:"Could not save review decision.",error:e.message});
  }
});

export default router;
