import express from "express";
import authenticateToken from "../middleware/isAuthenticated.js";
import { Job } from "../models/job.model.js";
import { transformJobRow } from "../controllers/job.controller.js";
import { User } from "../models/user.model.js";
import { Application } from "../models/application.model.js";
import { Notification } from "../models/notification.model.js";
import { connection, AdminAccessKeyModel } from "../models/dbModels.js";
import bcrypt from "bcryptjs";

const router = express.Router();

const safeUser = (user) => {
  if (!user) return null;
  const { password, ...rest } = user;
  return rest;
};

const parseJsonField = (value) => {
  if (!value || typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

const requireAdmin = async (req, res, next) => {
  const me = await User.findById(req.id);
  if (!me || me.role !== "Admin") {
    return res.status(403).json({ success: false, message: "Admin access required" });
  }
  req.adminUser = me;
  next();
};

/* ================= DASHBOARD STATS ================= */
router.get("/stats", authenticateToken, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalCandidates = await User.countDocuments({ role: "Employee" });
    const totalRecruiters = await User.countDocuments({ role: "Recruiter" });
    const totalApplications = await Application.countDocuments();

    // Query Open, Closed, and Removed Jobs from database precisely
    const [openJobsRows] = await connection.promise().query(
      "SELECT COUNT(*) AS count FROM jobs WHERE approvalStatus = 'approved' AND status = 'open' AND isClosed = 0 AND (isDeleted IS NULL OR isDeleted = 0)"
    );
    const openJobs = openJobsRows[0]?.count || 0;

    const [closedJobsRows] = await connection.promise().query(
      "SELECT COUNT(*) AS count FROM jobs WHERE (status = 'closed' OR isClosed = 1) AND (isDeleted IS NULL OR isDeleted = 0)"
    );
    const closedJobs = closedJobsRows[0]?.count || 0;

    const [removedJobsRows] = await connection.promise().query(
      "SELECT COUNT(*) AS count FROM jobs WHERE isDeleted = 1"
    );
    const removedJobs = removedJobsRows[0]?.count || 0;

    const totalJobs = openJobs + closedJobs + removedJobs;

    // Fetch real recent users and jobs
    const [recentUsersRows] = await connection.promise().query(
      "SELECT fullname, created_at FROM users ORDER BY id DESC LIMIT 5"
    );
    const [recentJobsRows] = await connection.promise().query(
      "SELECT title, created_at FROM jobs ORDER BY id DESC LIMIT 5"
    );

    const recentActivity = [];
    recentUsersRows.forEach(u => {
      recentActivity.push({
        action: "New user registered",
        user: u.fullname,
        time: u.created_at,
        type: "user"
      });
    });
    recentJobsRows.forEach(j => {
      recentActivity.push({
        action: "New job posted",
        user: j.title,
        time: j.created_at,
        type: "job"
      });
    });

    // Sort by time descending
    recentActivity.sort((a, b) => new Date(b.time) - new Date(a.time));

    return res.json({
      success: true,
      stats: {
        totalUsers,
        totalCandidates,
        totalRecruiters,
        totalApplications,
        totalJobs,
        openJobs,
        closedJobs,
        removedJobs,
      },
      recentActivity: recentActivity.slice(0, 5),
    });
  } catch (error) {
    console.error("stats error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* ================= BADGE COUNTS FOR SIDEBAR NOTIFICATIONS ================= */
router.get("/badge-counts", authenticateToken, async (req, res) => {
  try {
    // 1. Pending Jobs
    const [pendingJobsRows] = await connection.promise().query(
      "SELECT COUNT(*) AS count FROM jobs WHERE approvalStatus = 'pending' AND (isDeleted IS NULL OR isDeleted = 0)"
    );
    // 2. Job Edit Requests
    const [pendingJobEditsRows] = await connection.promise().query(
      "SELECT COUNT(*) AS count FROM job_edit_requests WHERE status = 'pending'"
    );
    // 3. Recruiter Approvals
    const totalRecruiterApprovals = await User.countDocuments({ role: "Recruiter", verificationStatus: "pending" });

    // 4. Recruiter Feature Requests
    const [pendingFeaturesRows] = await connection.promise().query(
      `SELECT COUNT(*) AS count FROM recruiter_features 
       WHERE chat_status = 'pending' 
          OR nova_status = 'pending' 
          OR find_candidates_status = 'pending'`
    );

    // 5. Admin Complaints
    let complaintsCount = 0;
    try {
      const [complaintsRows] = await connection.promise().query(
        "SELECT COUNT(*) AS count FROM complaints WHERE status = 'Submitted'"
      );
      complaintsCount = complaintsRows[0]?.count || 0;
    } catch (e) {}

    // 6. Contact Requests
    let contactRequestsCount = 0;
    try {
      const [contactRows] = await connection.promise().query(
        "SELECT COUNT(*) AS count FROM contact_requests WHERE status = 'pending' OR status = 'unread'"
      );
      contactRequestsCount = contactRows[0]?.count || 0;
    } catch (e) {}

    res.json({
      success: true,
      badgeCounts: {
        jobApprovals: pendingJobsRows[0]?.count || 0,
        jobEdits: pendingJobEditsRows[0]?.count || 0,
        recruiterApprovals: totalRecruiterApprovals || 0,
        featureRequests: pendingFeaturesRows[0]?.count || 0,
        complaints: complaintsCount,
        contactRequests: contactRequestsCount,
      }
    });
  } catch (error) {
    console.error("badge-counts error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* ================= GET ALL USERS ================= */
router.get("/users", authenticateToken, async (req, res) => {
  try {
    const users = await User.find();
    const [passports] = await connection.promise().query("SELECT * FROM workforce_passports");
    
    const merged = users.map(u => {
      const parsed = safeUser(u);
      const passport = passports.find(p => String(p.user_id) === String(u._id) || String(p.user_id) === String(u.id));
      
      let candidateProfileObj = {};
      try {
        candidateProfileObj = typeof u.candidateProfile === "string" ? JSON.parse(u.candidateProfile) : (u.candidateProfile || {});
      } catch(e) {
        candidateProfileObj = {};
      }

      if (passport) {
        let skills = [];
        try {
          skills = typeof passport.skills === 'string' ? JSON.parse(passport.skills || '[]') : (passport.skills || []);
        } catch (e) {}
        
        let docs = [];
        try {
          const pref = typeof passport.preferences === 'string' ? JSON.parse(passport.preferences || '{}') : (passport.preferences || {});
          if (pref.docLink) {
            docs.push(pref.docLink);
          }
        } catch(e) {}

        candidateProfileObj = {
          ...candidateProfileObj,
          experience: {
            years: passport.experience_years,
            months: 0,
            employmentType: passport.profession || "Employee"
          },
          education: {
            qualification: passport.education || "Graduate",
            college: "Verified Institution"
          },
          skills: skills,
          verificationDocs: docs
        };
      }

      let permittedModules = [];
      if (passport) {
        try {
          const pref = typeof passport.preferences === 'string' ? JSON.parse(passport.preferences || '{}') : (passport.preferences || {});
          permittedModules = pref.permittedModules || [];
        } catch(e) {}
      } else if (u.role === "Recruiter") {
        try {
          const recProf = typeof u.recruiterProfile === 'string' ? JSON.parse(u.recruiterProfile || '{}') : (u.recruiterProfile || {});
          const validRecruiterModules = ["dashboard", "13", "15", "16"];
          permittedModules = (recProf.permittedModules || []).filter(m => validRecruiterModules.includes(m));
        } catch(e) {}
      }

      let status = u.verificationStatus || "pending";
      if (passport) {
        status = passport.verification_status === "verified" ? "approved" : passport.verification_status;
      }

      return {
        ...parsed,
        candidateProfile: candidateProfileObj,
        permittedModules,
        verificationStatus: status
      };
    });

    res.json({ success: true, users: merged });
  } catch (error) {
    console.error("GET users error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* ================= GET SINGLE USER (full profile) ================= */
router.get("/users/:id", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    const full = {
      ...safeUser(user),
      candidateProfile: parseJsonField(user.candidateProfile),
      recruiterProfile: parseJsonField(user.recruiterProfile),
    };
    res.json({ success: true, user: full });
  } catch (error) {
    console.error("get user error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* ================= BLOCK / UNBLOCK USER ================= */
router.put("/block/:id", authenticateToken, async (req, res) => {
  try {
    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).json({ success: false, message: "User not found" });

    await User.findByIdAndUpdate(req.params.id, { isBlocked: true });
    await Notification.create({
      recipient: req.params.id,
      title: "Your account has been blocked",
      body: req.body?.reason?.trim()
        ? `Your access has been suspended by the admin team. Reason: ${req.body.reason.trim()}`
        : "Your access has been suspended by the admin team. Contact support if you think this is a mistake.",
      type: "account",
      priority: "high",
    }).catch(() => {});

    res.json({ success: true, message: `${target.fullname || "User"} has been blocked` });
  } catch (error) {
    console.error("block user error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.put("/unblock/:id", authenticateToken, async (req, res) => {
  try {
    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).json({ success: false, message: "User not found" });

    await User.findByIdAndUpdate(req.params.id, { isBlocked: false });
    await Notification.create({
      recipient: req.params.id,
      title: "Your account has been unblocked",
      body: "Your access has been restored. You can now log in as usual.",
      type: "account",
      priority: "medium",
    }).catch(() => {});

    res.json({ success: true, message: `${target.fullname || "User"} has been unblocked` });
  } catch (error) {
    console.error("unblock user error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* ================= RECRUITER ANALYTICS ================= */
router.get("/recruiters", authenticateToken, async (req, res) => {
  try {
    const [rows] = await connection.promise().query(
      "SELECT id, fullname, email, phoneNumber, companyName, gstNumber, verificationStatus, created_at, isBlocked FROM users WHERE role = 'Recruiter' ORDER BY id DESC"
    );
    res.json({ success: true, recruiters: rows });
  } catch (error) {
    console.error("Get recruiters list error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.get("/recruiters/:id/analytics", authenticateToken, async (req, res) => {
  try {
    const recruiterId = req.params.id;
    const [userRows] = await connection.promise().query(
      "SELECT id, fullname, email, phoneNumber, companyName, gstNumber, verificationStatus, created_at, isBlocked FROM users WHERE id = ? AND role = 'Recruiter' LIMIT 1",
      [recruiterId]
    );
    if (userRows.length === 0) {
      return res.status(404).json({ success: false, message: "Recruiter not found" });
    }
    const recruiter = userRows[0];

    const [jobsRows] = await connection.promise().query(
      "SELECT id, title, created_at, status, approvalStatus FROM jobs WHERE created_by = ? AND isDeleted = false ORDER BY created_at DESC",
      [recruiterId]
    );

    const jobsWithStats = await Promise.all(
      jobsRows.map(async (job) => {
        const [appStatsRows] = await connection.promise().query(
          `SELECT 
            COUNT(*) as totalApplicants,
            SUM(CASE WHEN status IN ('accepted', 'hired') THEN 1 ELSE 0 END) as hiredCount,
            SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejectedCount
           FROM applications WHERE job = ?`,
          [job.id]
        );
        const stats = appStatsRows[0] || { totalApplicants: 0, hiredCount: 0, rejectedCount: 0 };
        return {
          ...job,
          totalApplicants: Number(stats.totalApplicants) || 0,
          hiredCount: Number(stats.hiredCount) || 0,
          rejectedCount: Number(stats.rejectedCount) || 0,
        };
      })
    );

    const totalJobs = jobsWithStats.length;
    const totalApplicants = jobsWithStats.reduce((sum, j) => sum + j.totalApplicants, 0);
    const totalHired = jobsWithStats.reduce((sum, j) => sum + j.hiredCount, 0);
    const totalRejected = jobsWithStats.reduce((sum, j) => sum + j.rejectedCount, 0);

    const [logsRows] = await connection.promise().query(
      "SELECT action_type, details, created_at FROM recruiter_action_logs WHERE recruiter_id = ? ORDER BY created_at DESC LIMIT 50",
      [recruiterId]
    );

    // Fetch feature permissions for this recruiter
    let features = {
      chat_status: "not_requested",
      nova_status: "not_requested",
      find_candidates_status: "not_requested"
    };
    try {
      const [featureRows] = await connection.promise().query(
        "SELECT chat_status, nova_status, find_candidates_status FROM recruiter_features WHERE recruiter_id = ? LIMIT 1",
        [recruiterId]
      );
      if (featureRows && featureRows.length > 0) {
        features = featureRows[0];
      } else {
        // Idempotently initialize recruiter features record
        await connection.promise().query(
          "INSERT INTO recruiter_features (recruiter_id) VALUES (?)",
          [recruiterId]
        ).catch(err => console.error("Recruiter features init fail:", err.message));
      }
    } catch (featErr) {
      console.error("Failed to query features table:", featErr.message);
    }

    res.json({
      success: true,
      analytics: {
        recruiter,
        features,
        totalJobs,
        totalApplicants,
        totalHired,
        totalRejected,
        jobs: jobsWithStats,
        logs: logsRows,
      }
    });
  } catch (error) {
    console.error("Get recruiter analytics error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.put("/verify/:id/approve", authenticateToken, async (req, res) => {
  const user = await User.findById(req.params.id);
  const { permittedModules } = req.body || {};
  if (user) {
    user.verificationStatus = "approved";
    
    if (user.role === "Employee") {
      const workforceId = `RW-${Math.floor(10000 + Math.random() * 90000)}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;
      const [passRows] = await connection.promise().query("SELECT preferences FROM workforce_passports WHERE user_id=?", [req.params.id]);
      let preferences = {};
      if (passRows.length > 0 && passRows[0].preferences) {
        try {
          preferences = typeof passRows[0].preferences === "string" ? JSON.parse(passRows[0].preferences) : passRows[0].preferences;
        } catch(e) {}
      }
      preferences.permittedModules = permittedModules || [];
      await connection.promise().query(
        `UPDATE workforce_passports SET verification_status='verified', workforce_id=COALESCE(workforce_id, ?), preferences=?, updated_at=NOW() WHERE user_id=?`,
        [workforceId, JSON.stringify(preferences), req.params.id]
      );
    } else if (user.role === "Recruiter") {
      let recProfile = {};
      if (user.recruiterProfile) {
        try {
          recProfile = typeof user.recruiterProfile === "string" ? JSON.parse(user.recruiterProfile) : user.recruiterProfile;
        } catch(e) {}
      }
      recProfile.permittedModules = permittedModules || [];
      user.recruiterProfile = JSON.stringify(recProfile);
    }
    await user.save();
  }

  await Notification.create({
    recipient: req.params.id,
    title: "Your verification request is approved ✅",
    body: user?.role === "Employee" ? "Your Workforce Passport is now verified and active." : "You can now post jobs and chat with our support team.",
    type: "verification",
    priority: "high",
  });
  res.json({ success: true, message: "Verification approved" });
});

router.put("/verify/:id/reject", authenticateToken, async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    user.verificationStatus = "rejected";
    await user.save();

    if (user.role === "Employee") {
      await connection.promise().query(
        `UPDATE workforce_passports SET verification_status='rejected', updated_at=NOW() WHERE user_id=?`,
        [req.params.id]
      );
    }
  }

  await Notification.create({
    recipient: req.params.id,
    title: "Verification request rejected",
    body: "Please contact support for details on why your verification was rejected.",
    type: "verification",
    priority: "high",
  });
  res.json({ success: true, message: "Verification rejected" });
});

/* ================= JOB DELETE & REOPEN ================= */
router.delete("/job/:id", authenticateToken, async (req, res) => {
  try {
    const jobId = req.params.id;
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    // Soft delete
    await connection.promise().query(
      "UPDATE jobs SET isDeleted = true WHERE id = ?",
      [jobId]
    );

    // Notify candidate browsers via Socket.IO
    const io = req.app.get("io");
    if (io) {
      io.emit("jobStatusUpdated", { jobId, status: "removed" });
    }

    // Notify recruiter
    await Notification.create({
      recipient: job.created_by,
      title: "Your job was removed by admin",
      body: `Your job "${job.title}" has been deleted/removed from candidate listings by the Admin.`,
      type: "job",
      priority: "high"
    }).catch(() => {});

    // Log action
    await connection.promise().query(
      "INSERT INTO recruiter_action_logs (recruiter_id, action_type, details) VALUES (?, 'JOB_DELETED', ?)",
      [job.created_by, `Job "${job.title}" (Job Code: ${job.jobCode || jobId}) was removed by Admin.`]
    ).catch(() => {});

    res.json({ success: true, message: "Job removed successfully" });
  } catch (error) {
    console.error("Remove job error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.put("/jobs/:id/approve-reopen", authenticateToken, async (req, res) => {
  try {
    const jobId = req.params.id;
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    // Reset status to open, isClosed = false, reopenRequest = approved, reset created_at to current time
    await connection.promise().query(
      "UPDATE jobs SET status = 'open', isClosed = false, reopenRequest = 'approved', created_at = CURRENT_TIMESTAMP WHERE id = ?",
      [jobId]
    );

    // Notify recruiter
    await Notification.create({
      recipient: job.created_by,
      title: "Job Reopen Approved",
      body: `Your request to reopen job "${job.title}" has been approved. The job is now active for another 7 days.`,
      type: "job",
      priority: "high"
    }).catch(() => {});

    // Log action
    await connection.promise().query(
      "INSERT INTO recruiter_action_logs (recruiter_id, action_type, details) VALUES (?, 'JOB_REOPENED', ?)",
      [job.created_by, `Job "${job.title}" (Job Code: ${job.jobCode || jobId}) reopen request was approved by Admin.`]
    ).catch(() => {});

    res.json({ success: true, message: "Job reopened successfully" });
  } catch (error) {
    console.error("Approve job reopen error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.put("/jobs/:id/reject-reopen", authenticateToken, async (req, res) => {
  try {
    const jobId = req.params.id;
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    await connection.promise().query(
      "UPDATE jobs SET reopenRequest = 'rejected' WHERE id = ?",
      [jobId]
    );

    // Notify recruiter
    await Notification.create({
      recipient: job.created_by,
      title: "Job Reopen Rejected",
      body: `Your request to reopen job "${job.title}" was rejected by admin.`,
      type: "job",
      priority: "medium"
    }).catch(() => {});

    // Log action
    await connection.promise().query(
      "INSERT INTO recruiter_action_logs (recruiter_id, action_type, details) VALUES (?, 'REOPEN_REJECTED', ?)",
      [job.created_by, `Job "${job.title}" (Job Code: ${job.jobCode || jobId}) reopen request was rejected by Admin.`]
    ).catch(() => {});

    res.json({ success: true, message: "Job reopen rejected successfully" });
  } catch (error) {
    console.error("Reject job reopen error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* ================= RECRUITER FEATURES MANAGEMENT ================= */
router.get("/recruiters/feature-requests", authenticateToken, async (req, res) => {
  try {
    const [rows] = await connection.promise().query(
      `SELECT rf.*, u.fullname as recruiterName, u.email as recruiterEmail, u.companyName
       FROM recruiter_features rf
       JOIN users u ON u.id = rf.recruiter_id
       WHERE rf.chat_status = 'pending' 
          OR rf.nova_status = 'pending' 
          OR rf.find_candidates_status = 'pending'
       ORDER BY rf.updated_at DESC`
    );
    res.json({ success: true, requests: rows });
  } catch (error) {
    console.error("Get feature requests error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.put("/recruiters/:id/features", authenticateToken, async (req, res) => {
  try {
    const recruiterId = req.params.id;
    const { chat_status, nova_status, find_candidates_status } = req.body;

    const [rows] = await connection.promise().query(
      "SELECT id FROM users WHERE id = ? AND role = 'Recruiter' LIMIT 1",
      [recruiterId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Recruiter not found" });
    }

    const updates = [];
    const values = [];

    if (chat_status) { updates.push("chat_status = ?"); values.push(chat_status); }
    if (nova_status) { updates.push("nova_status = ?"); values.push(nova_status); }
    if (find_candidates_status) { updates.push("find_candidates_status = ?"); values.push(find_candidates_status); }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: "No feature status provided" });
    }

    values.push(recruiterId);
    
    // Check if features row exists
    const [featureRows] = await connection.promise().query(
      "SELECT id FROM recruiter_features WHERE recruiter_id = ? LIMIT 1",
      [recruiterId]
    );

    if (featureRows.length === 0) {
      await connection.promise().query("INSERT INTO recruiter_features (recruiter_id) VALUES (?)", [recruiterId]);
    }

    await connection.promise().query(
      `UPDATE recruiter_features SET ${updates.join(', ')} WHERE recruiter_id = ?`,
      values
    );

    // Notify recruiter of feature permission updates
    await Notification.create({
      recipient: recruiterId,
      title: "Feature Permissions Updated",
      body: "Admin has updated your feature access permissions for Chat, Nova AI Tests, and Candidate Finder.",
      type: "account",
      priority: "high"
    }).catch(() => {});

    // Log action
    const statusLabels = {
      approved: "Granted",
      revoked: "Revoked",
      pending: "Pending",
      not_requested: "Not Requested"
    };

    const loggedFeatures = [];
    if (chat_status) {
      loggedFeatures.push(`Chat Panel status set to '${statusLabels[chat_status] || chat_status}'`);
    }
    if (nova_status) {
      loggedFeatures.push(`NOVA AI Video Interview status set to '${statusLabels[nova_status] || nova_status}'`);
    }
    if (find_candidates_status) {
      loggedFeatures.push(`Candidate Smart Finder status set to '${statusLabels[find_candidates_status] || find_candidates_status}'`);
    }
    const cleanDetails = `Admin updated feature access permissions: ${loggedFeatures.join(', ')}`;

    await connection.promise().query(
      "INSERT INTO recruiter_action_logs (recruiter_id, action_type, details) VALUES (?, 'PERMISSIONS_UPDATED', ?)",
      [recruiterId, cleanDetails]
    ).catch(() => {});

    res.json({ success: true, message: "Feature permissions updated successfully" });
  } catch (error) {
    console.error("Update feature permissions error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.get("/jobs", authenticateToken, async (req, res) => {
  try {
    const rows = await Job.findAllAdmin();
    res.json({ success: true, jobs: rows.map(transformJobRow) });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* ================= JOB APPROVAL WORKFLOW ================= */
router.get("/jobs/pending", authenticateToken, async (req, res) => {
  try {
    const jobs = await Job.findByApprovalStatus("pending");
    res.json({ success: true, jobs });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.put("/jobs/:id/approve", authenticateToken, async (req, res) => {
  try {
    await connection.promise().query(
      "UPDATE jobs SET approvalStatus = 'approved', status = 'open', isClosed = false, rejectionReason = NULL, approvedBy = ?, approvedAt = NOW(), created_at = CURRENT_TIMESTAMP WHERE id = ?",
      [req.id, req.params.id]
    );
    const job = await Job.findById(req.params.id);

    const io = req.app.get("io") || globalThis.__JOBPORTAL_IO__;
    if (io) {
      io.emit("jobStatusUpdated", { jobId: req.params.id, status: "open", approvalStatus: "approved" });
    }

    if (job?.created_by) {
      await Notification.create({
        recipient: job.created_by,
        title: "Your job was approved 🎉",
        body: `"${job.title}" (${job.jobCode || ""}) is now live and active with today's date.`,
        type: "job_approval",
        priority: "high",
      });
    }
    res.json({ success: true, message: "Job approved and published with today's date", job });
  } catch (error) {
    console.error("Approve job error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.put("/jobs/:id/reject", authenticateToken, async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason || !reason.trim()) {
      return res.status(400).json({ success: false, message: "A rejection reason is required" });
    }
    const job = await Job.updateById(req.params.id, {
      approvalStatus: "rejected",
      rejectionReason: reason.trim(),
      approvedBy: req.id,
      approvedAt: new Date(),
    });
    if (job?.created_by) {
      await Notification.create({
        recipient: job.created_by,
        title: "Your job posting was rejected",
        body: `"${job.title}" was rejected: ${reason.trim()}`,
        type: "job_approval",
        priority: "high",
      });
    }
    res.json({ success: true, message: "Job rejected", job });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* ================= APPLICATIONS ================= */
router.get("/applications", authenticateToken, async (req, res) => {
  const apps = await Application.find();
  res.json({ success: true, apps });
});

router.put("/applications/:id/approve", authenticateToken, async (req, res) => {
  try {
    const applicationId = req.params.id;
    const [rows] = await connection.promise().query("SELECT * FROM applications WHERE id = ? LIMIT 1", [applicationId]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }
    const app = rows[0];
    if (app.adminApprovalStatus === "rejected") {
      return res.status(400).json({ success: false, message: "Cannot approve a rejected application" });
    }
    await connection.promise().query("UPDATE applications SET adminApprovalStatus = 'approved' WHERE id = ?", [applicationId]);
    
    // Create notification for user
    const [jobRows] = await connection.promise().query("SELECT title FROM jobs WHERE id = ? LIMIT 1", [app.job]);
    const jobTitle = jobRows[0]?.title || "Job";
    await Notification.create({
      recipient: app.applicant,
      title: "Application Approved by Admin",
      body: `Your application for "${jobTitle}" has been approved by admin and is now visible to the recruiter.`,
      type: "application",
      priority: "high"
    });

    res.json({ success: true, message: "Application approved successfully" });
  } catch (error) {
    console.error("Approve application error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.put("/applications/:id/reject", authenticateToken, async (req, res) => {
  try {
    const applicationId = req.params.id;
    const [rows] = await connection.promise().query("SELECT * FROM applications WHERE id = ? LIMIT 1", [applicationId]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }
    const app = rows[0];
    if (app.adminApprovalStatus === "approved") {
      return res.status(400).json({ success: false, message: "Cannot reject an approved application" });
    }
    await connection.promise().query("UPDATE applications SET adminApprovalStatus = 'rejected' WHERE id = ?", [applicationId]);
    
    // Create notification for user
    const [jobRows] = await connection.promise().query("SELECT title FROM jobs WHERE id = ? LIMIT 1", [app.job]);
    const jobTitle = jobRows[0]?.title || "Job";
    await Notification.create({
      recipient: app.applicant,
      title: "Application Rejected by Admin",
      body: `Your application for "${jobTitle}" has been rejected by admin.`,
      type: "application",
      priority: "medium"
    });

    res.json({ success: true, message: "Application rejected successfully" });
  } catch (error) {
    console.error("Reject application error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* ================= JOB EDIT APPROVALS ================= */
router.get("/job-edits", authenticateToken, async (req, res) => {
  try {
    const [rows] = await connection.promise().query(
      `SELECT jer.*, j.title as jobTitle, j.jobDetails as originalJobDetails, j.jobCode, u.fullname as recruiterName, c.name as companyName
       FROM job_edit_requests jer
       JOIN jobs j ON j.id = jer.job_id
       LEFT JOIN users u ON u.id = j.created_by
       LEFT JOIN companies c ON c.id = j.company
       ORDER BY jer.created_at DESC`
    );

    const requests = rows.map(r => {
      let editedFieldsObj = {};
      try {
        editedFieldsObj = typeof r.edited_fields === "string" ? JSON.parse(r.edited_fields) : (r.edited_fields || {});
      } catch(e) {}

      let editedDetails = editedFieldsObj.jobDetails || {};
      if (typeof editedDetails === "string") {
        try { editedDetails = JSON.parse(editedDetails); } catch(e){}
      }

      let originalDetails = r.originalJobDetails || {};
      if (typeof originalDetails === "string") {
        try { originalDetails = JSON.parse(originalDetails); } catch(e){}
      }

      const orig_data = {
        title: r.jobTitle,
        ...originalDetails
      };

      const edit_data = {
        title: editedFieldsObj.title || r.jobTitle,
        ...editedDetails
      };

      return {
        id: r.id,
        job_id: r.job_id,
        jobTitle: r.jobTitle,
        companyName: r.companyName || "Unknown Company",
        created_at: r.created_at,
        status: r.status,
        admin_reply: r.admin_reply,
        original_data: JSON.stringify(orig_data),
        edited_data: JSON.stringify(edit_data)
      };
    });

    res.json({ success: true, requests });
  } catch (error) {
    console.error("Get job edits error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.put("/job-edits/:id/approve", authenticateToken, async (req, res) => {
  try {
    const editRequestId = req.params.id;
    const [editRows] = await connection.promise().query(
      "SELECT * FROM job_edit_requests WHERE id = ? LIMIT 1",
      [editRequestId]
    );
    if (editRows.length === 0) {
      return res.status(404).json({ success: false, message: "Edit request not found" });
    }
    const editReq = editRows[0];
    if (editReq.status !== "pending") {
      return res.status(400).json({ success: false, message: "This edit request has already been processed" });
    }

    const [jobRows] = await connection.promise().query(
      "SELECT * FROM jobs WHERE id = ? LIMIT 1",
      [editReq.job_id]
    );
    if (jobRows.length === 0) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }
    const job = jobRows[0];

    const editedFields = typeof editReq.edited_fields === "string" 
      ? JSON.parse(editReq.edited_fields) 
      : editReq.edited_fields;

    const allowedKeys = [
      'title', 'description', 'requirements', 'salary', 'location', 
      'jobType', 'experienceLevel', 'position', 'status',
      'region', 'country', 'stateProvince', 'city', 'pincode',
      'remoteType', 'visaSponsorship', 'workPermit', 'relocationSupport',
      'accommodationProvided', 'foodProvided', 'transportationProvided',
      'medicalInsurance', 'airTicket', 'contractDuration', 'currency',
      'salaryPeriod', 'overtime', 'bonus', 'commission', 'workingHours',
      'weeklyOff', 'requiredVisaType', 'permitNumber', 'recruitmentAgentId',
      'jobOrderReference', 'contractAvailable', 'jobVerificationStatus',
      'urgentHiring', 'companyVerificationStatus', 'isClosed', 'isDeleted',
      'reopenRequest', 'reopenReason', 'industryType', 'jobDetails', 'jdUrl'
    ];

    const explicitKeys = ['status', 'isClosed', 'approvalStatus', 'reopenRequest', 'reopenReason', 'created_at', 'createdAt'];

    const updateFields = [];
    const updateValues = [];

    Object.keys(editedFields).forEach(key => {
      let mappedKey = key;
      if (key === 'experience') mappedKey = 'experienceLevel';
      if (key === 'requirements' && Array.isArray(editedFields[key])) {
        editedFields[key] = editedFields[key].join(',');
      }
      if (key === 'jobDetails' || key === 'proctoringSettings' || key === 'customQuestions') {
        editedFields[key] = JSON.stringify(editedFields[key]);
      }

      if (allowedKeys.includes(mappedKey) && !explicitKeys.includes(mappedKey)) {
        updateFields.push(`${mappedKey} = ?`);
        updateValues.push(editedFields[key]);
      }
    });

    // Enforce: When edited job is approved by Admin, reset status to 'open',
    // isClosed to false, and update created_at to CURRENT_TIMESTAMP so the job is reposted with today's date!
    updateFields.push("status = 'open'");
    updateFields.push("isClosed = false");
    updateFields.push("created_at = CURRENT_TIMESTAMP");
    updateFields.push("approvalStatus = 'approved'");
    updateFields.push("reopenRequest = 'approved'");
    updateFields.push("reopenReason = NULL");

    if (updateFields.length > 0) {
      updateValues.push(editReq.job_id);
      await connection.promise().query(
        `UPDATE jobs SET ${updateFields.join(', ')} WHERE id = ?`,
        updateValues
      );
    }

    await connection.promise().query(
      "UPDATE job_edit_requests SET status = 'approved', admin_reply = ? WHERE id = ?",
      [req.body.adminReply || "Approved", editRequestId]
    );

    // Socket.IO real-time notification
    const io = req.app.get("io") || globalThis.__JOBPORTAL_IO__;
    if (io) {
      io.emit("jobStatusUpdated", {
        jobId: editReq.job_id,
        status: "open",
        approvalStatus: "approved",
        createdAt: new Date().toISOString()
      });
    }

    await Notification.create({
      recipient: job.created_by,
      title: "Job Edit Approved & Reposted 🎉",
      body: `Your edits for job "${job.title}" have been approved. The job is now active and reposted as an open vacancy with today's date.`,
      type: "job",
      priority: "high"
    });

    await connection.promise().query(
      "INSERT INTO recruiter_action_logs (recruiter_id, action_type, details) VALUES (?, 'EDIT_JOB_APPROVED', ?)",
      [job.created_by, `Admin approved edits for job "${job.title}" (Job Code: ${job.jobCode || job.id}). Reposted as open job with today's date.`]
    );

    res.json({ success: true, message: "Job edits approved and reposted as open job with today's date" });
  } catch (error) {
    console.error("Approve job edits error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.put("/job-edits/:id/reject", authenticateToken, async (req, res) => {
  try {
    const editRequestId = req.params.id;
    const adminReply = req.body.adminReply || "Rejected by admin";

    const [editRows] = await connection.promise().query(
      "SELECT * FROM job_edit_requests WHERE id = ? LIMIT 1",
      [editRequestId]
    );
    if (editRows.length === 0) {
      return res.status(404).json({ success: false, message: "Edit request not found" });
    }
    const editReq = editRows[0];
    if (editReq.status !== "pending") {
      return res.status(400).json({ success: false, message: "This edit request has already been processed" });
    }

    const [jobRows] = await connection.promise().query(
      "SELECT * FROM jobs WHERE id = ? LIMIT 1",
      [editReq.job_id]
    );
    if (jobRows.length === 0) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }
    const job = jobRows[0];

    await connection.promise().query(
      "UPDATE job_edit_requests SET status = 'rejected', admin_reply = ? WHERE id = ?",
      [adminReply, editRequestId]
    );

    await connection.promise().query(
      "UPDATE jobs SET approvalStatus = 'approved' WHERE id = ?",
      [editReq.job_id]
    );

    await Notification.create({
      recipient: job.created_by,
      title: "Job Edit Request Rejected",
      body: `Your edits for job "${job.title}" were rejected. Reason: ${adminReply}`,
      type: "job",
      priority: "medium"
    });

    await connection.promise().query(
      "INSERT INTO recruiter_action_logs (recruiter_id, action_type, details) VALUES (?, 'EDIT_JOB_REJECTED', ?)",
      [job.created_by, `Admin rejected edits for job "${job.title}" (Job Code: ${job.jobCode || job.id}). Reason: ${adminReply}`]
    );

    res.json({ success: true, message: "Job edits rejected successfully" });
  } catch (error) {
    console.error("Reject job edits error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* ================= AI INTERVIEWS (platform-wide oversight) ================= */
/* This legacy endpoint now reads the NOVA table so the old Admin AI Interviews
   screen and the dedicated NOVA screen show the same source of truth. */
router.get("/ai-interviews", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [rows] = await connection.promise().query(
      "SELECT * FROM ai_screening_interviews ORDER BY created_at DESC"
    );
    const withNames = await Promise.all(rows.map(async (r) => {
      const candidate = await User.findById(r.candidate_id || r.user_id);
      const recruiter = r.hr_user_id ? await User.findById(r.hr_user_id) : null;
      return {
        id: r.id,
        mode: "nova",
        status: r.status,
        candidateName: r.candidate_name || candidate?.fullname || "Unknown",
        candidateEmail: candidate?.email || "",
        recruiterName: recruiter?.fullname || null,
        recruiterCompany: recruiter?.companyName || null,
        role_title: r.job_title || "General",
        overall_score: r.avg_score,
        recommendation: r.ai_recommendation,
        questions: parseJsonField(r.question_plan),
        answers: parseJsonField(r.answer_evaluations),
        categoryScores: parseJsonField(r.evaluation_summary),
        transcript: parseJsonField(r.transcript),
        companyLogo: r.company_logo,
        hrApprovalStatus: r.hr_approval_status,
        adminApprovalStatus: r.admin_approval_status,
        answerVideos: parseJsonField(r.answer_videos),
        videoRecordingUrl: r.video_recording_url,
        proctoring: parseJsonField(r.proctoring),
      };
    }));
    res.json({ success: true, interviews: withNames });
  } catch (error) {
    console.error("admin list ai-interviews error:", error);
    res.status(500).json({ success: false, message: "Could not load NOVA AI interviews.", error: error.message });
  }
});

router.get("/ai-interviews/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [rows] = await connection.promise().query(
      "SELECT * FROM ai_screening_interviews WHERE id = ? LIMIT 1", [req.params.id]
    );
    const interview = rows[0];
    if (!interview) return res.status(404).json({ success: false, message: "Interview not found" });
    const candidate = await User.findById(interview.candidate_id || interview.user_id);
    const recruiter = interview.hr_user_id ? await User.findById(interview.hr_user_id) : null;
    res.json({
      success: true,
      interview: {
        id: interview.id,
        mode: "nova",
        status: interview.status,
        candidateName: interview.candidate_name || candidate?.fullname,
        candidateEmail: candidate?.email,
        recruiterName: recruiter?.fullname || null,
        role_title: interview.job_title || "General",
        overall_score: interview.avg_score,
        recommendation: interview.ai_recommendation,
        questions: parseJsonField(interview.question_plan),
        answers: parseJsonField(interview.answer_evaluations),
        categoryScores: parseJsonField(interview.evaluation_summary),
        transcript: parseJsonField(interview.transcript),
        answerVideos: parseJsonField(interview.answer_videos),
        videoRecordingUrl: interview.video_recording_url,
        proctoring: parseJsonField(interview.proctoring),
        hrApprovalStatus: interview.hr_approval_status,
        adminApprovalStatus: interview.admin_approval_status,
      },
    });
  } catch (error) {
    console.error("admin ai-interview detail error:", error);
    res.status(500).json({ success: false, message: "Could not load interview.", error: error.message });
  }
});

/* ================= SUPER ADMIN ACCESS KEYS =================
   Lets the logged-in admin create additional email/password login IDs that all
   sign in to THIS SAME admin account (no separate profile is created). Any key
   can be revoked or re-activated at any time by the owning admin. */

router.get("/access-keys", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const keys = await AdminAccessKeyModel.findByAdminUserId(req.id);
    res.json({
      success: true,
      keys: keys.map(({ password, ...k }) => k),
    });
  } catch (error) {
    console.error("list access keys error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.post("/access-keys", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { label, email, password } = req.body;
    if (!label?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ success: false, message: "Label, email and password are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
    }

    const existingUser = await User.findOne({ email: email.trim() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "This email is already registered as a user account" });
    }
    const existingKey = await AdminAccessKeyModel.findByEmail(email.trim());
    if (existingKey) {
      return res.status(400).json({ success: false, message: "This email is already used as a login ID" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const key = await AdminAccessKeyModel.create({
      adminUserId: req.id,
      label: label.trim(),
      email: email.trim(),
      hashedPassword,
    });
    const { password: _pw, ...safeKey } = key;
    res.status(201).json({ success: true, message: "Login ID created", key: safeKey });
  } catch (error) {
    console.error("create access key error:", error);
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ success: false, message: "This email is already in use" });
    }
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.put("/access-keys/:id/revoke", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const key = await AdminAccessKeyModel.findById(req.params.id);
    if (!key || key.admin_user_id !== req.id) {
      return res.status(404).json({ success: false, message: "Login ID not found" });
    }
    const updated = await AdminAccessKeyModel.setActive(req.params.id, false);
    const { password, ...safeKey } = updated;
    res.json({ success: true, message: "Login ID revoked", key: safeKey });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.put("/access-keys/:id/reactivate", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const key = await AdminAccessKeyModel.findById(req.params.id);
    if (!key || key.admin_user_id !== req.id) {
      return res.status(404).json({ success: false, message: "Login ID not found" });
    }
    const updated = await AdminAccessKeyModel.setActive(req.params.id, true);
    const { password, ...safeKey } = updated;
    res.json({ success: true, message: "Login ID re-activated", key: safeKey });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.delete("/access-keys/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const key = await AdminAccessKeyModel.findById(req.params.id);
    if (!key || key.admin_user_id !== req.id) {
      return res.status(404).json({ success: false, message: "Login ID not found" });
    }
    await AdminAccessKeyModel.deleteById(req.params.id);
    res.json({ success: true, message: "Login ID deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});



/* ================= GLOBAL WORKFORCE PERMISSIONS / AUDIT ================= */
const WORKFORCE_PERMISSIONS = [
  ["workforce.dashboard", "Global Workforce Dashboard"],
  ["workforce.jobs", "Global Job Marketplace"],
  ["workforce.matching", "AI Matching"],
  ["workforce.skill_gap", "Skill Gap Engine"],
  ["workforce.verification", "Worker & Employer Verification"],
  ["workforce.mobility", "International Mobility"],
  ["workforce.salary", "Salary Intelligence"],
  ["workforce.support", "Worker Support"],
  ["workforce.recruiter", "Recruiter Marketplace"],
  ["workforce.bulk", "Mass Workforce"],
  ["workforce.passport", "Workforce Passport"],
  ["workforce.intelligence", "Workforce Intelligence"],
  ["workforce.audit", "Audit & Compliance"],
  ["workforce.settings", "Global Workforce Settings"],
];

router.get("/workforce-controls", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [rows] = await connection.promise().query("SELECT permission_key, enabled FROM admin_permissions WHERE admin_user_id=?", [req.id]);
    const saved = new Map(rows.map(r => [r.permission_key, Boolean(r.enabled)]));
    const permissions = WORKFORCE_PERMISSIONS.map(([key,label]) => ({ key, label, enabled: saved.has(key) ? saved.get(key) : true }));
    res.json({ success:true, permissions, modules: WORKFORCE_PERMISSIONS.length });
  } catch(e) { res.status(500).json({success:false,message:e.message}); }
});

router.put("/workforce-controls/:permissionKey", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const key = req.params.permissionKey;
    if (!WORKFORCE_PERMISSIONS.some(([k]) => k === key)) return res.status(400).json({success:false,message:"Unknown permission"});
    const enabled = Boolean(req.body?.enabled);
    await connection.promise().query(`INSERT INTO admin_permissions (admin_user_id,permission_key,enabled) VALUES (?,?,?) ON DUPLICATE KEY UPDATE enabled=VALUES(enabled),updated_at=NOW()`, [req.id,key,enabled]);
    await connection.promise().query("INSERT INTO admin_audit_logs (admin_user_id,action,target_type,target_id,details) VALUES (?,?,?,?,?)", [req.id, "permission_updated", "workforce_permission", key, JSON.stringify({enabled})]);
    res.json({success:true,permission:{key,enabled}});
  } catch(e) { res.status(500).json({success:false,message:e.message}); }
});

router.get("/workforce-audit", authenticateToken, requireAdmin, async (req,res) => {
  try {
    const [rows] = await connection.promise().query(`SELECT a.id,a.action,a.target_type,a.target_id,a.details,a.created_at,u.fullname adminName FROM admin_audit_logs a LEFT JOIN users u ON u.id=a.admin_user_id ORDER BY a.id DESC LIMIT 100`);
    res.json({success:true,logs:rows});
  } catch(e) { res.status(500).json({success:false,message:e.message}); }
});

router.get("/workforce-oversight", authenticateToken, requireAdmin, async (req,res) => {
  try {
    const [[pendingVerification]] = await connection.promise().query("SELECT COUNT(*) total FROM workforce_passports WHERE verification_status='pending'");
    const [[verifiedWorkers]] = await connection.promise().query("SELECT COUNT(*) total FROM workforce_passports WHERE verification_status='verified'");
    const [[bulkRequests]] = await connection.promise().query("SELECT COUNT(*) total FROM workforce_bulk_requests WHERE status NOT IN ('closed')");
    const [[actions]] = await connection.promise().query("SELECT COUNT(*) total FROM workforce_actions WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)");
    res.json({success:true,overview:{pendingVerification:Number(pendingVerification?.total||0),verifiedWorkers:Number(verifiedWorkers?.total||0),activeBulkRequests:Number(bulkRequests?.total||0),activity24h:Number(actions?.total||0)}});
  } catch(e) { res.status(500).json({success:false,message:e.message}); }
});

/* ================= COMPANY TRUST SCORE & VERIFICATION CONTROLS ================= */
router.get("/companies-verification", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [rows] = await connection.promise().query(
      `SELECT id, name, description, website, location, logo, userId, trust_score, verification_checklist 
       FROM companies ORDER BY id DESC`
    );
    res.json({ success: true, companies: rows.map(r => ({
      ...r,
      verification_checklist: r.verification_checklist ? (typeof r.verification_checklist === "string" ? JSON.parse(r.verification_checklist) : r.verification_checklist) : {}
    })) });
  } catch(e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

router.put("/companies-verification/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const companyId = req.params.id;
    const checklist = req.body.checklist || {};
    let score = 50; 
    let checkedCount = 0;
    const items = ["registration", "website", "domain", "identity"];
    items.forEach(x => {
      if (checklist[x]) checkedCount++;
    });
    score = 50 + (checkedCount * 12.5); 
    
    await connection.promise().query(
      `UPDATE companies SET trust_score = ?, verification_checklist = ? WHERE id = ?`,
      [Math.round(score), JSON.stringify(checklist), companyId]
    );

    await connection.promise().query(
      `INSERT INTO admin_audit_logs (admin_user_id, action, target_type, target_id, details) 
       VALUES (?, 'company_verified', 'company', ?, ?)`,
      [req.id, companyId, JSON.stringify({ checklist, trust_score: Math.round(score) })]
    );

    res.json({ success: true, trust_score: Math.round(score), verification_checklist: checklist });
  } catch(e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

router.get("/workforce-settings", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [rows] = await connection.promise().query(
      `SELECT * FROM workforce_settings ORDER BY module_id ASC`
    );
    res.json({ success: true, settings: rows });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

router.put("/workforce-settings/:module_id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const moduleId = req.params.module_id;
    const { is_enabled } = req.body;
    
    await connection.promise().query(
      `UPDATE workforce_settings SET is_enabled = ? WHERE module_id = ?`,
      [is_enabled ? 1 : 0, moduleId]
    );

    await connection.promise().query(
      `INSERT INTO admin_audit_logs (admin_user_id, action, target_type, target_id, details) 
       VALUES (?, 'toggle_workforce_module', 'workforce_setting', ?, ?)`,
      [req.id, moduleId, JSON.stringify({ is_enabled: !!is_enabled })]
    );

    res.json({ success: true, module_id: moduleId, is_enabled: !!is_enabled });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

router.get("/workforce-settings", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [rows] = await connection.promise().query(
      `SELECT * FROM workforce_settings ORDER BY module_id ASC`
    );
    res.json({ success: true, settings: rows });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

router.put("/workforce-settings/:module_id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const moduleId = req.params.module_id;
    const { is_enabled } = req.body;
    
    await connection.promise().query(
      `UPDATE workforce_settings SET is_enabled = ? WHERE module_id = ?`,
      [is_enabled ? 1 : 0, moduleId]
    );

    await connection.promise().query(
      `INSERT INTO admin_audit_logs (admin_user_id, action, target_type, target_id, details) 
       VALUES (?, 'toggle_workforce_module', 'workforce_setting', ?, ?)`,
      [req.id, moduleId, JSON.stringify({ is_enabled: !!is_enabled })]
    );

    res.json({ success: true, module_id: moduleId, is_enabled: !!is_enabled });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

/* ================= GOVERNANCE CONTROLS MAPPED TO WORKFORCE_SETTINGS ================= */

const ADMIN_MODULES = [
  "Global Job Marketplace", "Global Jobs by Country", "AI Job Matching Engine", "Global Skill Gap Engine",
  "Employer & Job Verification", "International Workforce Mobility", "AI Career Assistant", "AI Interview Platform",
  "AI CV & Profile Builder", "Multilingual Employment", "Global Salary Intelligence", "Worker Support Ecosystem",
  "Employer Workforce Management", "Global Recruiter Marketplace", "Mass Workforce Solutions", "Blue + White Collar Marketplace",
  "Worker Trust Profile", "Recruweb Workforce Passport", "Complete Recruweb Ecosystem", "Business Model",
  "Worker Portal", "Employer Portal", "Recruiter Portal", "AI Workforce Engine", "Global Workforce Intelligence",
  "Global Launch Roadmap", "Long-Term Workforce Vision", "Learn → Verify → Match → Apply → Work → Grow"
];

router.get("/workforce-controls", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [rows] = await connection.promise().query("SELECT module_id AS `key`, is_enabled AS enabled FROM workforce_settings ORDER BY module_id ASC");
    const mapped = rows.map(r => {
      const idx = Number(r.key) - 1;
      const label = ADMIN_MODULES[idx] || `Module ${r.key}`;
      return { key: r.key, label, enabled: !!r.enabled };
    });
    res.json({ success: true, permissions: mapped });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

router.put("/workforce-controls/:key", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const key = req.params.key;
    const { enabled } = req.body;
    await connection.promise().query("UPDATE workforce_settings SET is_enabled = ? WHERE module_id = ?", [enabled ? 1 : 0, key]);

    // Audit log
    await connection.promise().query(
      `INSERT INTO admin_audit_logs (admin_user_id, action, target_type, target_id, details) 
       VALUES (?, 'toggle_workforce_module', 'workforce_setting', ?, ?)`,
      [req.id, key, JSON.stringify({ is_enabled: !!enabled })]
    );

    res.json({ success: true, key, enabled: !!enabled });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

router.get("/workforce-audit", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [rows] = await connection.promise().query(
      `SELECT a.*, u.fullname AS adminName FROM admin_audit_logs a 
       LEFT JOIN users u ON u.id = a.admin_user_id 
       ORDER BY a.id DESC LIMIT 100`
    );
    res.json({ success: true, logs: rows });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

router.get("/workforce-oversight", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [[pendingVerification]] = await connection.promise().query("SELECT COUNT(*) total FROM workforce_passports WHERE verification_status='pending'");
    const [[verifiedWorkers]] = await connection.promise().query("SELECT COUNT(*) total FROM workforce_passports WHERE verification_status='verified'");
    const [[activeBulkRequests]] = await connection.promise().query("SELECT COUNT(*) total FROM workforce_bulk_requests WHERE status != 'completed'");
    const [[activity24h]] = await connection.promise().query("SELECT COUNT(*) total FROM workforce_actions WHERE created_at >= NOW() - INTERVAL 1 DAY");

    res.json({
      success: true,
      overview: {
        pendingVerification: pendingVerification?.total || 0,
        verifiedWorkers: verifiedWorkers?.total || 0,
        activeBulkRequests: activeBulkRequests?.total || 0,
        activity24h: activity24h?.total || 0
      }
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// Admin Mass Hiring Dashboard List (with Recruiter info and applied Worker profiles)
router.get("/mass-hiring", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [jobs] = await connection.promise().query(
      `SELECT b.*, 
              u.id AS recruiterId, u.fullname AS recruiterName, u.email AS recruiterEmail, 
              u.phoneNumber AS recruiterPhone, u.companyName,
              MAX(c.trust_score) AS companyTrustScore, u.verificationStatus AS companyVerificationStatus
       FROM workforce_bulk_requests b
       LEFT JOIN users u ON u.id = b.created_by
       LEFT JOIN companies c ON c.userId = u.id
       GROUP BY b.id
       ORDER BY b.id DESC`
    );

    // Fetch applied workers for all jobs
    const jobsWithApplicants = await Promise.all(
      jobs.map(async (j) => {
        const [applicants] = await connection.promise().query(
          `SELECT a.id AS applicationId, a.status AS applicationStatus, a.notes AS applicantNotes, a.created_at AS appliedAt,
                  w.id AS workerId, w.fullname AS workerName, w.email AS workerEmail, w.phoneNumber AS workerPhone,
                  w.verificationStatus AS workerVerificationStatus,
                  p.profession, p.skills, p.experience_years, p.target_country, p.education, p.languages, p.bio, p.workforce_id
           FROM workforce_mass_applications a
           JOIN users w ON w.id = a.applicant_id
           LEFT JOIN workforce_passports p ON p.user_id = w.id
           WHERE a.bulk_request_id = ?
           ORDER BY a.id DESC`,
          [j.id]
        );
        return {
          ...j,
          applicantCount: applicants.length,
          applicants
        };
      })
    );

    res.json({ success: true, massHiringJobs: jobsWithApplicants });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// Admin update Mass Hiring Job Status
router.patch("/mass-hiring/:id/status", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const jobId = Number(req.params.id);
    const { status } = req.body || {};
    const validStatuses = ['submitted', 'screening', 'verification', 'interview', 'selection', 'deployment', 'closed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value for mass hiring job." });
    }

    await connection.promise().query(
      `UPDATE workforce_bulk_requests SET status = ?, updated_at = NOW() WHERE id = ?`,
      [status, jobId]
    );

    // Log admin audit action
    await connection.promise().query(
      `INSERT INTO admin_audit_logs (admin_user_id, action, target_type, target_id, details) VALUES (?, ?, ?, ?, ?)`,
      [req.id, "UPDATE_MASS_HIRING_STATUS", "mass_hiring_job", String(jobId), `Status changed to ${status}`]
    );

    res.json({ success: true, message: `Mass hiring job status updated to ${status}` });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

export default router;