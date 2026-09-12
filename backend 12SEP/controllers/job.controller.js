import { Job } from "../models/job.model.js";
import { User } from "../models/user.model.js";
import { Notification } from "../models/notification.model.js";
import { CompanyModel, connection } from "../models/dbModels.js";
import jwt from "jsonwebtoken";
//Admin job posting
export const postJob = async (req, res) => {
  try {
    const userId = req.id;
    const requester = await User.findById(userId);
    if (requester?.role === "Recruiter" && requester?.verificationStatus === "pending") {
      return res.status(403).json({
        success: false,
        message: "Your company is still pending Super Admin verification. You'll be able to post jobs once approved.",
      });
    }
    if (requester?.verificationStatus === "rejected") {
      return res.status(403).json({
        success: false,
        message: "Your company verification was rejected. Please contact support.",
      });
    }

    const title = req.body.title?.trim();
    const description = req.body.description?.trim();
    const requirements = req.body.requirements?.trim();
    const salary = req.body.salary?.toString().trim();
    const location = req.body.location?.trim();
    const jobType = req.body.jobType?.trim();
    const experience = req.body.experience?.toString().trim();
    const position = req.body.position?.toString().trim();
    const companyId = req.body.companyId?.trim();

    let jobDetails;
    if (req.body.jobDetails) {
      try {
        jobDetails = typeof req.body.jobDetails === "string" ? JSON.parse(req.body.jobDetails) : req.body.jobDetails;
      } catch (e) {
        return res.status(400).json({ success: false, message: "Invalid jobDetails JSON" });
      }
    }

    const companyName = req.body.companyName?.trim();

    let finalCompanyId = companyId;
    if (!finalCompanyId && companyName) {
      const newCompany = await CompanyModel.create({
        name: companyName,
        userId: userId,
      });
      finalCompanyId = newCompany.id.toString();
    }

    const missingFields = [];
    if (!title) missingFields.push("title");
    if (!description) missingFields.push("description");
    if (!requirements) missingFields.push("requirements");
    if (!salary) missingFields.push("salary");
    if (!location) missingFields.push("location");
    if (!jobType) missingFields.push("job type");
    if (!experience) missingFields.push("experience");
    if (!position) missingFields.push("position");
    if (!finalCompanyId) missingFields.push("company");

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `Please fill: ${missingFields.join(", ")}`,
        success: false,
      });
    }

    const salaryNumber = Number(salary);
    const experienceNumber = Number(experience);
    const positionNumber = Number(position);

    if (
      Number.isNaN(salaryNumber) ||
      Number.isNaN(experienceNumber) ||
      Number.isNaN(positionNumber)
    ) {
      return res.status(400).json({
        message: "Salary, experience, and position must be valid numbers",
        success: false,
      });
    }

    const jobCode = `JOB-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

    const jdUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const job = await Job.create({
      title,
      description,
      requirements: requirements.split(",").map((item) => item.trim()).filter(Boolean),
      salary: salaryNumber,
      location,
      jobType,
      experienceLevel: experienceNumber,
      position: positionNumber,
      company: finalCompanyId,
      created_by: userId,
      jobDetails,
      jobCode,
      approvalStatus: "pending",
      jdUrl,
      industryType: req.body.industryType?.trim() || null
    });

    // Notify every Admin that a new job is awaiting approval.
    try {
      const admins = await User.find({ role: "Admin" });
      await Promise.all(
        (admins || []).map((admin) =>
          Notification.create({
            recipient: admin.id || admin._id,
            title: "New job awaiting approval",
            body: `${requester?.fullname || "A recruiter"} submitted "${title}" (${jobCode}) for approval.`,
            type: "job_approval",
            priority: "medium",
          })
        )
      );
    } catch (e) {
      console.log("admin notify failed:", e.message);
    }

    try {
      await connection.promise().query(
        "INSERT INTO recruiter_action_logs (recruiter_id, action_type, details) VALUES (?, 'POST_JOB', ?)",
        [userId, `Submitted new job: "${title}" (${jobCode})`]
      );
    } catch (logErr) {
      console.log("recruiter action log failed:", logErr.message);
    }

    res.status(201).json({
      message: "Job submitted for admin approval. You'll be notified once it's reviewed.",
      job,
      success: true,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error", success: false });
  }
};

export const transformJobRow = (row) => ({
  _id: String(row.id || row._id),
  id: String(row.id || row._id),
  title: row.title,
  description: row.description,
  requirements: row.requirements
    ? String(row.requirements).split(",").map((s) => s.trim()).filter(Boolean)
    : [],
  salary: row.salary,
  location: row.location,
  jobType: row.jobType,
  experienceLevel: row.experienceLevel,
  position: row.position,
  status: row.status || "open",
  jobCode: row.jobCode || null,
  approvalStatus: row.approvalStatus || "approved",
  rejectionReason: row.rejectionReason || null,
  createdAt: row.created_at || row.createdAt,
  applications: row.applications || [],
  jobDetails: row.jobDetails || null,
  jdUrl: row.jdUrl || null,
  isDeleted: row.isDeleted ? true : false,
  company: row.companyId
    ? {
        _id: String(row.companyId),
        id: String(row.companyId),
        name: row.companyName || "",
        description: row.companyDescription || "",
        website: row.companyWebsite || "",
        location: row.companyLocation || "",
        logo: row.companyLogo || "",
      }
    : null,
});

//Users
export const getAllJobs = async (req, res) => {
  try {
    const keyword = req.query.keyword || "";
    const query = {
      $or: [
        { title: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
      ],
    };
    const jobsResult = await Job.find(query);
    const rawJobs = Array.isArray(jobsResult) ? jobsResult : [];

    // Transform flat SQL rows into nested objects the frontend expects
    const jobs = rawJobs.map(transformJobRow);

    return res.status(200).json({ jobs, status: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error", status: false });
  }
};

//Users
export const getJobById = async (req, res) => {
  try {
    const jobId = req.params.id;
    const row = await Job.findById(jobId);
    if (!row) {
      return res.status(404).json({ message: "Job not found", status: false });
    }
    let isOwnerOrAdmin = false;
    try {
      const token = req.cookies?.token;
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded?.userId) {
          if (row.created_by?.toString() === decoded.userId?.toString()) {
            isOwnerOrAdmin = true;
          } else {
            const user = await User.findById(decoded.userId);
            if (user?.role === "Admin") isOwnerOrAdmin = true;
          }
        }
      }
    } catch (err) {
      // ignore invalid token for optional auth
    }

    if ((row.isDeleted || (row.approvalStatus && row.approvalStatus !== "approved")) && !isOwnerOrAdmin) {
      return res.status(404).json({ message: "Job not found", status: false });
    }

    const job = {
      _id: String(row.id || row._id),
      id: String(row.id || row._id),
      title: row.title,
      description: row.description,
      requirements: row.requirements
        ? (Array.isArray(row.requirements) ? row.requirements : String(row.requirements).split(",").map((s) => s.trim()).filter(Boolean))
        : [],
      salary: row.salary,
      location: row.location,
      jobType: row.jobType,
      experienceLevel: row.experienceLevel,
      position: row.position,
      status: row.status || "open",
      jobCode: row.jobCode || null,
      approvalStatus: row.approvalStatus || "approved",
      rejectionReason: row.rejectionReason || null,
      createdAt: row.created_at || row.createdAt,
      applications: (row.applications || []).map((a) => ({
        _id: String(a.id || a._id),
        applicant: a.applicantId ? { _id: String(a.applicantId), fullname: a.applicantFullname, email: a.applicantEmail } : a.applicant,
        status: a.status,
      })),
      company: row.companyId
        ? {
            _id: String(row.companyId),
            id: String(row.companyId),
            name: row.companyName || "",
            description: row.companyDescription || "",
            website: row.companyWebsite || "",
            location: row.companyLocation || "",
            logo: row.companyLogo || "",
          }
        : null,
      creatorName: row.creatorName || null,
      creatorEmail: row.creatorEmail || null,
      creatorPhoto: row.creatorPhoto || null,
      creatorCompany: row.creatorCompany || null,
      creatorProfile: row.creatorProfile || null,
      jobDetails: row.jobDetails || null,
      jdUrl: row.jdUrl || null,
    };

    return res.status(200).json({ job, status: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error", status: false });
  }
};

export const getAdminJobs = async (req, res) => {
  try {
    const adminId = req.id;
    const rawJobs = await Job.findByAdminId(adminId);

    const jobs = rawJobs.map((row) => ({
      _id: String(row.id || row._id),
      id: String(row.id || row._id),
      title: row.title,
      description: row.description,
      requirements: row.requirements
        ? String(row.requirements).split(",").map((s) => s.trim()).filter(Boolean)
        : [],
      salary: row.salary,
      location: row.location,
      jobType: row.jobType,
      experienceLevel: row.experienceLevel,
      position: row.position,
      status: row.status || "open",
      jobCode: row.jobCode || null,
      approvalStatus: row.approvalStatus || "approved",
      rejectionReason: row.rejectionReason || null,
      createdAt: row.created_at || row.createdAt,
      applications: row.applications || [],
      jobDetails: row.jobDetails || null,
      jdUrl: row.jdUrl || null,
      isDeleted: row.isDeleted ? true : false,
      company: row.companyId
        ? {
            _id: String(row.companyId),
            id: String(row.companyId),
            name: row.companyName || "",
            description: row.companyDescription || "",
            website: row.companyWebsite || "",
            location: row.companyLocation || "",
            logo: row.companyLogo || "",
          }
        : null,
    }));

    return res.status(200).json({ jobs, status: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error", status: false });
  }
};

export const updateJob = async (req, res) => {
  try {
    const jobId = req.params.id;
    const userId = req.id;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        message: "Job not found",
        success: false,
      });
    }

    const requester = await User.findById(userId);
    const isAdmin = requester?.role === "Admin";
    if (job.created_by?.toString() !== userId?.toString() && !isAdmin) {
      return res.status(403).json({
        message: "You can only update your own jobs",
        success: false,
      });
    }

    // Capture all incoming fields
    const editedFields = { ...req.body };
    if (req.file) {
      editedFields.jdUrl = `/uploads/${req.file.filename}`;
    }
    
    // Save to job_edit_requests table
    await connection.promise().query(
      "INSERT INTO job_edit_requests (job_id, edited_fields, status) VALUES (?, ?, 'pending')",
      [jobId, JSON.stringify(editedFields)]
    );

    // Update job approvalStatus to 'edit_pending'
    await connection.promise().query(
      "UPDATE jobs SET approvalStatus = 'edit_pending' WHERE id = ?",
      [jobId]
    );

    // Log the recruiter action
    await connection.promise().query(
      "INSERT INTO recruiter_action_logs (recruiter_id, action_type, details) VALUES (?, 'EDIT_JOB_REQUEST', ?)",
      [userId, `Submitted edits for job "${job.title}" (Job Code: ${job.jobCode || jobId})`]
    );

    return res.status(200).json({
      message: "Job edit request submitted for admin approval",
      success: true,
    });
  } catch (error) {
    console.error("updateJob error:", error);
    return res.status(500).json({
      message: "Server error",
      success: false,
    });
  }
};

export const deleteJob = async (req, res) => {
  try {
    const jobId = req.params.id;
    const userId = req.id;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        message: "Job not found",
        success: false,
      });
    }

    if (String(job.created_by) !== String(userId)) {
      const user = await User.findById(userId);
      if (!user || user.role !== "Admin") {
        return res.status(403).json({
          message: "You can only delete your own jobs",
          success: false,
        });
      }
    }

    // Actually we are asked to remove delete job option, but we will leave the backend logic here just fixed.
    await Job.deleteById(jobId);

    const io = req.app.get("io");
    if (io) {
      io.emit("jobStatusUpdated", { jobId, status: "removed" });
    }

    return res.status(200).json({
      message: "Job deleted successfully",
      success: true,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server error",
      success: false,
    });
  }
};

export const closeJob = async (req, res) => {
  try {
    const jobId = req.params.id;
    const userId = req.id;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        message: "Job not found",
        success: false,
      });
    }

    console.log("closeJob debug:", { 
      jobCreatedBy: job.created_by, 
      userId, 
      match: String(job.created_by) === String(userId) 
    });

    if (String(job.created_by) !== String(userId)) {
      const user = await User.findById(userId);
      console.log("closeJob admin check:", { userFound: !!user, role: user?.role });
      
      if (!user || user.role !== "Admin") {
        return res.status(403).json({
          message: "You can only close your own jobs",
          success: false,
        });
      }
    }

    await Job.updateById(jobId, { status: "closed" });
    job.status = "closed";

    const io = req.app.get("io");
    if (io) {
      io.emit("jobStatusUpdated", { jobId, status: "closed" });
    }

    return res.status(200).json({
      message: "Job closed successfully",
      job,
      success: true,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server error",
      success: false,
    });
  }
};

export const requestReopenJob = async (req, res) => {
  try {
    const jobId = req.params.id;
    const userId = req.id;
    const { reason } = req.body;

    if (!reason?.trim()) {
      return res.status(400).json({ message: "Reason for reopen is required", success: false });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found", success: false });
    }

    if (String(job.created_by) !== String(userId)) {
      return res.status(403).json({ message: "You can only reopen your own jobs", success: false });
    }

    await connection.promise().query(
      "UPDATE jobs SET reopenRequest = 'requested', reopenReason = ? WHERE id = ?",
      [reason.trim(), jobId]
    );

    // Log action
    await connection.promise().query(
      "INSERT INTO recruiter_action_logs (recruiter_id, action_type, details) VALUES (?, 'REOPEN_REQUEST', ?)",
      [userId, `Requested reopen for job "${job.title}". Reason: ${reason.trim()}`]
    );

    return res.status(200).json({
      message: "Reopen request submitted successfully",
      success: true,
    });
  } catch (error) {
    console.error("requestReopenJob error:", error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};
