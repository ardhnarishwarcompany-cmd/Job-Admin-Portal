import { Application } from "../models/application.model.js";
import { Job } from "../models/job.model.js";
import { User } from "../models/user.model.js";
import { Notification } from "../models/notification.model.js";

export const applyJob = async (req, res) => {
  try {
    const userId = req.id;
    const jobId = req.params.id;
    const file = req.files && req.files.file ? req.files.file[0] : req.file;
    const audioIntroFile = req.files && req.files.audioIntro ? req.files.audioIntro[0] : null;

    // Check user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found", success: false });
    }

    // Check already applied
    const existingApplication = await Application.findOne({ job: jobId, applicant: userId });
    if (existingApplication) {
      return res.status(400).json({ message: "Already applied", success: false });
    }

    // Check job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found", success: false });
    }

    // Determine resume path — use newly uploaded file, else fall back to user's saved resume
    const resumePath = file
      ? `/uploads/${file.filename}`
      : (user.resume || user.profile?.resume || null);
    const resumeName = file
      ? file.originalname
      : (user.resumeOriginalName || user.profile?.resumeOriginalName || null);

    const audioIntroPath = audioIntroFile ? `/uploads/${audioIntroFile.filename}` : null;

    if (!resumePath) {
      return res.status(400).json({
        message: "Please upload a resume before applying",
        success: false,
      });
    }

    const newApplication = await Application.create({
      job: jobId,
      applicant: userId,
      resume: resumePath,
      resumeOriginalName: resumeName,
      audioIntro: audioIntroPath,
    });

    return res.status(201).json({
      message: "Applied successfully",
      success: true,
      application: {
        ...newApplication,
        _id: String(newApplication.id || newApplication._id),
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};
export const getAppliedJobs = async (req, res) => {
  try {
    const userId = req.id;
    const { ApplicationModel } = await import("../models/dbModels.js");
    const rows = await ApplicationModel.findByApplicant(userId);

    // Shape data to match what frontend expects
    const application = rows.map((row) => ({
      _id: String(row.id || row._id),
      id: String(row.id || row._id),
      status: row.status || "pending",
      resume: row.resume || null,
      interviewDate: row.interviewDate || null,
      interviewTime: row.interviewTime || null,
      interviewDay: row.interviewDay || null,
      interviewStatus: row.interviewStatus || "none",
      interviewRequestedAt: row.interviewRequestedAt || null,
      interviewRespondedAt: row.interviewRespondedAt || null,
      audioIntro: row.audioIntro || null,
      createdAt: row.created_at || row.createdAt,
      job: row.job
        ? {
            ...row.job,
            _id: String(row.job.id || row.job._id),
          }
        : null,
    }));

    return res.status(200).json({ application, success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", success: false });
  }
};

export const getApplicants = async (req, res) => {
  try {
    const jobId = req.params.id;

    // Get job basic info
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found", success: false });
    }

    // Get all applications for this job with full applicant + resume data
    const { ApplicationModel } = await import("../models/dbModels.js");
    const [rows] = await ApplicationModel._getApplicantsForJob(jobId);

    const applications = rows.map((row) => ({
      _id: String(row.appId || row.id),
      id: String(row.appId || row.id),
      status: row.status || "pending",
      resume: row.appResume || null,
      resumeOriginalName: row.appResumeOriginalName || null,
      audioIntro: row.appAudioIntro || null,
      createdAt: row.appCreatedAt || row.created_at,
      interviewDate: row.interviewDate || null,
      interviewTime: row.interviewTime || null,
      interviewDay: row.interviewDay || null,
      interviewStatus: row.interviewStatus || "none",
      interviewRequestedAt: row.interviewRequestedAt || null,
      interviewRespondedAt: row.interviewRespondedAt || null,
      applicant: {
        _id: String(row.userId),
        id: String(row.userId),
        fullname: row.fullname || "",
        email: row.email || "",
        phoneNumber: row.phoneNumber || "",
        profile: {
          resume: row.appResume || row.profileResume || null,
          resumeOriginalName: row.appResumeOriginalName || row.profileResumeOriginalName || null,
          bio: row.bio || "",
          skills: row.skills ? row.skills.split(",").map(s => s.trim()).filter(Boolean) : [],
          city: row.city || "",
          experience: row.experience || "",
          education: row.education || "",
          profilePhoto: row.profilePhoto || "",
        },
      },
    }));

    return res.status(200).json({
      job: { ...job, applications },
      success: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", success: false });
  }
};

export const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const applicationId = req.params.id;

    if (!status) {
      return res.status(400).json({ message: "status is required", success: false });
    }

    // Direct DB update — no broken findOne needed
    const { ApplicationModel } = await import("../models/dbModels.js");
    await ApplicationModel.updateStatus(applicationId, status.toLowerCase());

    return res.status(200).json({ message: "Application status updated", success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", success: false });
  }
};

export const requestInterviewSchedule = async (req, res) => {
  try {
    const applicantId = req.id;
    const applicationId = req.params.id;
    const { date, time, day } = req.body;

    if (!date || !time || !day) {
      return res.status(400).json({
        message: "date, time and day are required",
        success: false,
      });
    }

    const application = await Application.requestInterview({
      applicationId,
      applicantId,
      date,
      time,
      day,
    });

    if (!application) {
      return res.status(404).json({
        message: "Application not found for this candidate",
        success: false,
      });
    }

    const [job, applicant] = await Promise.all([
      Job.findById(application.job),
      User.findById(applicantId),
    ]);

    if (job?.created_by) {
      await Notification.create({
        recipient: job.created_by,
        title: "Interview schedule request",
        body: `${applicant?.fullname || "A candidate"} requested an interview for ${job.title || "your job"} on ${day}, ${date} at ${time}. Application #${application.id || application._id}`,
        type: "application",
        priority: "high",
      });
    }

    return res.status(200).json({
      message: "Interview request sent to recruiter",
      success: true,
      application,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", success: false });
  }
};

export const updateInterviewScheduleStatus = async (req, res) => {
  try {
    const recruiterId = req.id;
    const applicationId = req.params.id;
    const normalizedStatus = String(req.body?.status || "").toLowerCase();

    if (!["confirmed", "rejected"].includes(normalizedStatus)) {
      return res.status(400).json({
        message: "status must be confirmed or rejected",
        success: false,
      });
    }

    const application = await Application.updateInterviewStatusForRecruiter({
      applicationId,
      recruiterId,
      status: normalizedStatus,
    });

    if (!application) {
      return res.status(404).json({
        message: "Interview request not found for your job",
        success: false,
      });
    }

    const job = await Job.findById(application.job);
    await Notification.create({
      recipient: application.applicant,
      title: `Interview ${normalizedStatus}`,
      body: `Your interview request for ${job?.title || "the job"} has been ${normalizedStatus}.`,
      type: "application",
      priority: normalizedStatus === "confirmed" ? "high" : "medium",
    });

    return res.status(200).json({
      message: `Interview ${normalizedStatus}`,
      success: true,
      application,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", success: false });
  }
};

export const getApplicationsForRecruiter = async (req, res) => {
  try {
    const { ApplicationModel } = await import("../models/dbModels.js");
    const recruiterId = req.id;
    const applications = await Application.findByRecruiter(recruiterId);

    return res.status(200).json({
      applications: applications,
      success: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", success: false });
  }
};
