import mysql from "mysql2";
import dotenv from "dotenv";
dotenv.config();

export const connection = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || process.env.DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const rowOrNull = (rows) => (rows.length > 0 ? { ...rows[0], _id: rows[0].id } : null);

// =============== USERS ===============
export const UserModel = {
  create: async (data) => {
    const keys = [];
    const values = [];
    
    // Prepare stringified values for JSON fields
    const safeData = { ...data };
    if (safeData.candidateProfile !== undefined) {
      safeData.candidateProfile = safeData.candidateProfile ? JSON.stringify(safeData.candidateProfile) : null;
    }
    if (safeData.recruiterProfile !== undefined) {
      safeData.recruiterProfile = safeData.recruiterProfile ? JSON.stringify(safeData.recruiterProfile) : null;
    }

    // Convert skills array to string if needed
    if (Array.isArray(safeData.skills)) {
      safeData.skills = safeData.skills.join(", ");
    }

    for (const [key, val] of Object.entries(safeData)) {
      if (val !== undefined) {
        keys.push(key);
        values.push(val);
      }
    }

    const placeholders = keys.map(() => "?").join(", ");
    const columns = keys.join(", ");

    const [result] = await connection
      .promise()
      .query(`INSERT INTO users (${columns}) VALUES (${placeholders})`, values);
    return UserModel.findById(result.insertId);
  },
  findByEmail: async (email) => {
    const [rows] = await connection.promise().query("SELECT * FROM users WHERE email = ? LIMIT 1", [email]);
    return rowOrNull(rows);
  },
  findByResetToken: async (token) => {
    const [rows] = await connection.promise().query(
      "SELECT * FROM users WHERE resetPasswordToken = ? AND resetPasswordExpires > NOW() LIMIT 1",
      [token]
    );
    return rowOrNull(rows);
  },
  findById: async (id) => {
    const [rows] = await connection.promise().query("SELECT * FROM users WHERE id = ? LIMIT 1", [id]);
    return rowOrNull(rows);
  },
  findByRole: async (role) => {
    const [rows] = await connection.promise().query("SELECT * FROM users WHERE role = ?", [role]);
    return rows.map((r) => ({ ...r, _id: r.id }));
  },
  updateById: async (id, data) => {
    const keys = [];
    const values = [];

    // Filter out properties that don't belong to the SQL columns (like save function)
    const validColumns = [
      'fullname', 'email', 'phoneNumber', 'password', 'pancard', 'adharcard', 'role',
      'dateOfBirth', 'companyName', 'gstNumber', 'adminCode', 'profilePhoto',
      'resume', 'resumeOriginalName', 'bio', 'skills', 'city', 'experience', 'education',
      'profileRole', 'isBlocked', 'otp', 'otpExpiry', 'isVerified', 'candidateProfile',
      'recruiterProfile', 'verificationStatus', 'resetPasswordToken', 'resetPasswordExpires'
    ];

    const safeData = { ...data };
    
    if (safeData.candidateProfile !== undefined && safeData.candidateProfile !== null && typeof safeData.candidateProfile === 'object') {
      safeData.candidateProfile = JSON.stringify(safeData.candidateProfile);
    }
    if (safeData.recruiterProfile !== undefined && safeData.recruiterProfile !== null && typeof safeData.recruiterProfile === 'object') {
      safeData.recruiterProfile = JSON.stringify(safeData.recruiterProfile);
    }
    if (Array.isArray(safeData.skills)) {
      safeData.skills = safeData.skills.join(", ");
    }

    for (const [key, val] of Object.entries(safeData)) {
      if (validColumns.includes(key) && val !== undefined) {
        keys.push(key);
        values.push(val);
      }
    }

    if (keys.length === 0) return UserModel.findById(id);

    const setClause = keys.map((k) => `${k} = ?`).join(", ");
    await connection.promise().query(`UPDATE users SET ${setClause} WHERE id = ?`, [...values, id]);
    return UserModel.findById(id);
  },
  findByRecruiter: async (recruiterId) => {
    const [rows] = await connection.promise().query(
      `SELECT a.*, u.id as applicantId, u.fullname as applicantFullname, u.email as applicantEmail, u.phoneNumber as applicantPhone,
              u.resume as profileResume, u.resumeOriginalName as profileResumeOriginalName, u.bio, u.skills, u.city, u.experience, u.education, u.profilePhoto,
              j.id as jobId, j.title as jobTitle, j.description as jobDescription, j.salary as jobSalary, j.location as jobLocation, j.company as jobCompany,
              c.id as companyId, c.name as companyName, c.logo as companyLogo
       FROM applications a
       LEFT JOIN users u ON u.id = a.applicant
       JOIN jobs j ON j.id = a.job
       LEFT JOIN companies c ON c.id = j.company
       WHERE j.created_by = ? AND (a.adminApprovalStatus IS NULL OR a.adminApprovalStatus != 'rejected')
       ORDER BY a.created_at DESC`, [recruiterId]
    );
    return rows.map((r) => ({
      ...r,
      _id: r.id,
      createdAt: r.created_at,
      resume: r.resume || r.profileResume,
      resumeOriginalName: r.resumeOriginalName || r.profileResumeOriginalName,
      applicant: r.applicantId ? { id: r.applicantId, fullname: r.applicantFullname, email: r.applicantEmail, phoneNumber: r.applicantPhone, profilePhoto: r.profilePhoto, bio: r.bio, skills: r.skills ? r.skills.split(",").map(s => s.trim()).filter(Boolean) : [], city: r.city, experience: r.experience, education: r.education } : null,
      job: r.jobId ? { id: r.jobId, title: r.jobTitle, description: r.jobDescription, salary: r.jobSalary, location: r.jobLocation, company: r.companyId ? { id: r.companyId, name: r.companyName, logo: r.companyLogo } : null } : null,
    }));
  },

  count: async (query = {}) => {
    if (query.role) {
      const [rows] = await connection.promise().query("SELECT COUNT(*) AS count FROM users WHERE role = ?", [query.role]);
      return rows[0]?.count || 0;
    }
    const [rows] = await connection.promise().query("SELECT COUNT(*) AS count FROM users");
    return rows[0]?.count || 0;
  },
  find: async (query = {}) => {
    if (query.role) {
      const [rows] = await connection.promise().query("SELECT * FROM users WHERE role = ?", [query.role]);
      return rows.map((r) => ({ ...r, _id: r.id, id: r.id }));
    }
    const [rows] = await connection.promise().query("SELECT * FROM users");
    return rows.map((r) => ({ ...r, _id: r.id, id: r.id }));
  }
};

// =============== COMPANIES ===============
export const CompanyModel = {
  create: async (data) => {
    const { name, description, website, location, logo, userId } = data;
    const [result] = await connection
      .promise()
      .query(
        "INSERT INTO companies (name, description, website, location, logo, userId) VALUES (?, ?, ?, ?, ?, ?)",
        [name, description, website, location, logo, userId]
      );
    return CompanyModel.findById(result.insertId);
  },
  findById: async (id) => {
    const [rows] = await connection.promise().query("SELECT * FROM companies WHERE id = ? LIMIT 1", [id]);
    return rowOrNull(rows);
  },
  findOneByName: async (name) => {
    const [rows] = await connection.promise().query("SELECT * FROM companies WHERE name = ? LIMIT 1", [name]);
    return rowOrNull(rows);
  },
  findByUserId: async (userId) => {
    const [rows] = await connection.promise().query("SELECT * FROM companies WHERE userId = ?", [userId]);
    return rows.map((row) => ({ ...row, _id: row.id }));
  },
  findAll: async () => {
    const [rows] = await connection.promise().query("SELECT * FROM companies ORDER BY created_at DESC");
    return rows.map((r) => ({ ...r, _id: r.id }));
  },
  updateById: async (id, data) => {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const setClause = keys.map((k) => `${k} = ?`).join(", ");
    await connection.promise().query(`UPDATE companies SET ${setClause} WHERE id = ?`, [...values, id]);
    return CompanyModel.findById(id);
  },
};

export const attachApplicationsToJobs = async (rows) => {
  if (!rows || rows.length === 0) return [];
  const jobIds = rows.map((r) => r.id || r._id).filter(Boolean);
  if (jobIds.length === 0) return rows.map((row) => ({ ...row, _id: row.id, createdAt: row.created_at, applications: [] }));

  let appRows = [];
  try {
    const [result] = await connection.promise().query(
      `SELECT a.id, a.job, a.applicant, a.status, a.adminApprovalStatus, a.created_at,
              u.fullname as applicantFullname, u.email as applicantEmail
       FROM applications a
       LEFT JOIN users u ON u.id = a.applicant
       WHERE a.job IN (?) AND a.adminApprovalStatus = 'approved'
       ORDER BY a.created_at DESC`,
      [jobIds]
    );
    appRows = result;
  } catch (e) {
    console.error("attachApplicationsToJobs query error:", e.message);
  }

  const appsMap = {};
  for (const app of appRows) {
    if (!appsMap[app.job]) appsMap[app.job] = [];
    appsMap[app.job].push({
      _id: String(app.id),
      id: String(app.id),
      job: app.job,
      applicant: app.applicant ? { _id: String(app.applicant), fullname: app.applicantFullname, email: app.applicantEmail } : null,
      status: app.status || "pending",
      createdAt: app.created_at
    });
  }

  return rows.map((row) => ({
    ...row,
    _id: row.id,
    createdAt: row.created_at,
    applications: appsMap[row.id] || []
  }));
};

// =============== JOBS ===============
export const JobModel = {
  create: async (data) => {
    const {
      title,
      description,
      requirements,
      salary,
      location,
      jobType,
      experienceLevel,
      position,
      company,
      created_by,
      status,
      jobDetails,
      jobCode,
      approvalStatus,
      jdUrl,
      industryType
    } = data;

    const [result] = await connection
      .promise()
      .query(
        `INSERT INTO jobs (
          title,description,requirements,salary,location,jobType,experienceLevel,position,company,created_by,status,jobDetails,jobCode,approvalStatus,jdUrl,industryType
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          title,
          description,
          Array.isArray(requirements) ? requirements.join(",") : requirements,
          salary,
          location,
          jobType,
          experienceLevel,
          position,
          company,
          created_by,
          status || "open",
          jobDetails ? (typeof jobDetails === "string" ? jobDetails : JSON.stringify(jobDetails)) : null,
          jobCode || null,
          approvalStatus || "pending",
          jdUrl || null,
          industryType || null
        ]
      );

    const created = await JobModel.findById(result.insertId);
    return created;
  },

  findAll: async (keyword) => {
    const k = keyword ? `%${keyword}%` : "%";
    const [rows] = await connection
      .promise()
      .query(
        `SELECT j.*, c.id as companyId, c.name as companyName, c.description as companyDescription, c.website as companyWebsite, c.location as companyLocation, c.logo as companyLogo
         FROM jobs j
         LEFT JOIN companies c ON c.id = j.company
         WHERE (j.title LIKE ? OR j.description LIKE ?) AND j.approvalStatus = 'approved' AND (j.isDeleted IS NULL OR j.isDeleted = false)
         ORDER BY j.created_at DESC`,
        [k, k]
      );
    return attachApplicationsToJobs(rows);
  },

  findById: async (id) => {
    const [rows] = await connection
      .promise()
      .query(
        `SELECT j.*, 
                c.id as companyId, c.name as companyName, c.description as companyDescription, c.website as companyWebsite, c.location as companyLocation, c.logo as companyLogo,
                u.fullname as creatorName, u.email as creatorEmail, u.profilePhoto as creatorPhoto, u.companyName as creatorCompany, u.recruiterProfile as creatorProfile
         FROM jobs j
         LEFT JOIN companies c ON c.id = j.company
         LEFT JOIN users u ON u.id = j.created_by
         WHERE j.id = ?
         LIMIT 1`,
        [id]
      );
    const job = rowOrNull(rows);
    if (!job) return null;

    if (job.creatorProfile && typeof job.creatorProfile === "string") {
      try { job.creatorProfile = JSON.parse(job.creatorProfile); } catch(e){}
    }

    const appRowsResult = await connection
      .promise()
      .query(
        `SELECT a.*, u.id as applicantId, u.fullname as applicantFullname, u.email as applicantEmail
         FROM applications a
         LEFT JOIN users u ON u.id = a.applicant
         WHERE a.job = ? AND a.adminApprovalStatus = 'approved'
         ORDER BY a.created_at DESC`,
        [id]
      );

    job.applications = appRowsResult[0];
    job.requirements = job.requirements ? String(job.requirements).split(",").map((s) => s.trim()).filter(Boolean) : [];
    return job;
  },

  findAllAdmin: async () => {
    const [rows] = await connection.promise().query(
      `SELECT j.*, c.id as companyId, c.name as companyName, c.description as companyDescription, c.website as companyWebsite, c.location as companyLocation, c.logo as companyLogo
       FROM jobs j
       LEFT JOIN companies c ON c.id = j.company
       ORDER BY j.created_at DESC`
    );
    return attachApplicationsToJobs(rows);
  },

  findByAdminId: async (adminId) => {
    const [rows] = await connection
      .promise()
      .query(
        `SELECT j.*, c.id as companyId, c.name as companyName, c.description as companyDescription, c.website as companyWebsite, c.location as companyLocation, c.logo as companyLogo
         FROM jobs j
         LEFT JOIN companies c ON c.id = j.company
         WHERE j.created_by = ?
         ORDER BY j.created_at DESC`,
        [adminId]
      );
    return attachApplicationsToJobs(rows);
  },

  findByApprovalStatus: async (status) => {
    const [rows] = await connection
      .promise()
      .query(
        `SELECT j.*, c.id as companyId, c.name as companyName, c.description as companyDescription, c.website as companyWebsite, c.location as companyLocation, c.logo as companyLogo
         FROM jobs j
         LEFT JOIN companies c ON c.id = j.company
         WHERE j.approvalStatus = ?
         ORDER BY j.created_at DESC`,
        [status]
      );
    return attachApplicationsToJobs(rows);
  },

  updateById: async (id, data) => {
    const keys = Object.keys(data);
    const values = Object.values(data);
    if (keys.length === 0) return null;
    const setClause = keys.map((k) => `${k} = ?`).join(", ");
    await connection.promise().query(`UPDATE jobs SET ${setClause} WHERE id = ?`, [...values, id]);
    return JobModel.findById(id);
  },

  deleteById: async (id) => {
    await connection.promise().query("DELETE FROM applications WHERE job = ?", [id]);
    const [result] = await connection.promise().query("DELETE FROM jobs WHERE id = ?", [id]);
    return result;
  },

  count: async () => {
    const [rows] = await connection.promise().query("SELECT COUNT(*) AS count FROM jobs");
    return rows[0]?.count || 0;
  },

  // Mock Mongoose save/populate functionality if needed, though typically we just update via queries.
};

// =============== NOTIFICATIONS ===============
export const NotificationModel = {
  create: async (data) => {
    const { recipient, title, body, type, priority, meta } = data;
    const [result] = await connection
      .promise()
      .query(
        "INSERT INTO notifications (recipient, title, body, type, priority, meta) VALUES (?, ?, ?, ?, ?, ?)",
        [recipient, title, body, type || "general", priority || "normal", meta ? JSON.stringify(meta) : null]
      );
    return NotificationModel.findById(result.insertId);
  },
  findById: async (id) => {
    const [rows] = await connection.promise().query("SELECT * FROM notifications WHERE id = ? LIMIT 1", [id]);
    return rowOrNull(rows);
  },
  findByUser: async (userId) => {
    const [rows] = await connection
      .promise()
      .query("SELECT * FROM notifications WHERE recipient = ? ORDER BY created_at DESC", [userId]);
    return rows.map((r) => ({ ...r, _id: r.id }));
  },
  markAsRead: async (userId) => {
    await connection.promise().query("UPDATE notifications SET isRead = true WHERE recipient = ?", [userId]);
  },
};

// =============== APPLICATIONS ===============
export const ApplicationModel = {
  create: async (data) => {
    const { job, applicant, status, resume, resumeOriginalName, audioIntro } = data;
    const [result] = await connection
      .promise()
      .query(
        "INSERT INTO applications (job, applicant, status, resume, resumeOriginalName, audioIntro) VALUES (?, ?, ?, ?, ?, ?)",
        [job, applicant, status || "pending", resume || "", resumeOriginalName || "", audioIntro || null]
      );
    return ApplicationModel.findById(result.insertId);
  },
  findById: async (id) => {
    const [rows] = await connection.promise().query("SELECT * FROM applications WHERE id = ? LIMIT 1", [id]);
    return rowOrNull(rows);
  },
  findByJobAndApplicant: async (jobId, applicantId) => {
    const [rows] = await connection
      .promise()
      .query("SELECT * FROM applications WHERE job = ? AND applicant = ? LIMIT 1", [jobId, applicantId]);
    return rowOrNull(rows);
  },
  findByApplicant: async (applicantId) => {
    const [rows] = await connection.promise().query(
      `SELECT a.*, 
              j.id as jobId, j.title as jobTitle, j.description as jobDescription, j.salary as jobSalary, j.location as jobLocation, j.company as jobCompany,
              c.id as companyId, c.name as companyName, c.logo as companyLogo
       FROM applications a
       LEFT JOIN jobs j ON j.id = a.job
       LEFT JOIN companies c ON c.id = j.company
       WHERE a.applicant = ?
       ORDER BY a.created_at DESC`,
      [applicantId]
    );

    return rows.map((r) => ({
      ...r,
      _id: r.id,
      createdAt: r.created_at,
      job: r.jobId
        ? {
            id: r.jobId,
            title: r.jobTitle,
            description: r.jobDescription,
            salary: r.jobSalary,
            location: r.jobLocation,
            company: r.companyId ? {
              id: r.companyId,
              name: r.companyName,
              logo: r.companyLogo,
            } : null,
          }
        : null,
      audioIntro: r.audioIntro || null,
    }));
  },
  updateStatus: async (id, status) => {
    await connection.promise().query(`UPDATE applications SET status = ? WHERE id = ?`, [status, id]);
    return ApplicationModel.findById(id);
  },

  // Note: We use UPDATE on specific rows for interviews
  requestInterview: async ({ applicationId, applicantId, date, time, day }) => {
    const metaStr = JSON.stringify({ interview: { date, time, day, requestedAt: new Date().toISOString() } });
    await connection.promise().query(
      `UPDATE applications SET status = 'interview_requested', meta = ? WHERE id = ? AND applicant = ?`,
      [metaStr, applicationId, applicantId]
    );
    const [rows] = await connection.promise().query("SELECT * FROM applications WHERE id = ? LIMIT 1", [applicationId]);
    return rowOrNull(rows);
  },

  updateInterviewStatus: async ({ applicationId, recruiterId, status }) => {
    // Requires a join to verify recruiter owns the job.
    const [result] = await connection.promise().query(
      `UPDATE applications a
       JOIN jobs j ON j.id = a.job
       SET a.status = ?
       WHERE a.id = ? AND j.created_by = ? AND a.status = 'interview_requested'`,
      [status, applicationId, recruiterId]
    );

    if (result.affectedRows === 0) return null;

    const [rows] = await connection.promise().query("SELECT * FROM applications WHERE id = ? LIMIT 1", [applicationId]);
    return rowOrNull(rows);
  },

  findAll: async () => {
    const [rows] = await connection.promise().query(
      `SELECT a.*, u.id as applicantId, u.fullname as applicantFullname, u.email as applicantEmail, u.phoneNumber as applicantPhone,
              u.resume as profileResume, u.resumeOriginalName as profileResumeOriginalName, u.bio, u.skills, u.city, u.experience, u.education, u.profilePhoto,
              j.id as jobId, j.title as jobTitle, j.description as jobDescription, j.salary as jobSalary, j.location as jobLocation, j.company as jobCompany,
              c.id as companyId, c.name as companyName, c.logo as companyLogo
       FROM applications a
       LEFT JOIN users u ON u.id = a.applicant
       LEFT JOIN jobs j ON j.id = a.job
       LEFT JOIN companies c ON c.id = j.company
       ORDER BY a.created_at DESC`
    );

    return rows.map((r) => ({
      ...r,
      _id: r.id,
      createdAt: r.created_at,
      resume: r.resume || r.profileResume, // The application's resume or fallback
      resumeOriginalName: r.resumeOriginalName || r.profileResumeOriginalName,
      audioIntro: r.audioIntro || null,
      applicant: r.applicantId
        ? {
            id: r.applicantId,
            fullname: r.applicantFullname,
            email: r.applicantEmail,
            phoneNumber: r.applicantPhone,
            profilePhoto: r.profilePhoto,
            profile: {
              resume: r.profileResume,
              resumeOriginalName: r.profileResumeOriginalName,
              bio: r.bio,
              skills: r.skills ? r.skills.split(",").map(s => s.trim()).filter(Boolean) : [],
              city: r.city,
              experience: r.experience,
              education: r.education,
            }
          }
        : null,
      job: r.jobId
        ? {
            id: r.jobId,
            title: r.jobTitle,
            description: r.jobDescription,
            salary: r.jobSalary,
            location: r.jobLocation,
            company: r.companyId ? {
              id: r.companyId,
              name: r.companyName,
              logo: r.companyLogo,
            } : null,
          }
        : null,
    }));
  },
  count: async () => {
    const [rows] = await connection.promise().query("SELECT COUNT(*) AS count FROM applications WHERE adminApprovalStatus = 'approved'");
    return rows[0]?.count || 0;
  },

  findByRecruiter: async (recruiterId) => {
    const [rows] = await connection.promise().query(
      `SELECT a.*, 
              u.id as applicantId, u.fullname as applicantFullname, u.email as applicantEmail, u.phoneNumber as applicantPhone,
              u.resume as profileResume, u.resumeOriginalName as profileResumeOriginalName, u.bio, u.skills, u.city, u.experience, u.education, u.profilePhoto,
              j.id as jobId, j.title as jobTitle, j.description as jobDescription, j.salary as jobSalary, j.location as jobLocation, j.company as jobCompany,
              c.id as companyId, c.name as companyName, c.logo as companyLogo
       FROM applications a
       JOIN jobs j ON j.id = a.job
       LEFT JOIN users u ON u.id = a.applicant
       LEFT JOIN companies c ON c.id = j.company
       WHERE j.created_by = ? AND (a.adminApprovalStatus IS NULL OR a.adminApprovalStatus != 'rejected')
       ORDER BY a.created_at DESC`,
      [recruiterId]
    );

    return rows.map((r) => ({
      ...r,
      _id: r.id,
      createdAt: r.created_at,
      resume: r.resume || r.profileResume, // The application's resume or fallback
      resumeOriginalName: r.resumeOriginalName || r.profileResumeOriginalName,
      audioIntro: r.audioIntro || null,
      applicant: r.applicantId
        ? {
            id: r.applicantId,
            fullname: r.applicantFullname,
            email: r.applicantEmail,
            phoneNumber: r.applicantPhone,
            profilePhoto: r.profilePhoto,
            profile: {
              resume: r.profileResume,
              resumeOriginalName: r.profileResumeOriginalName,
              bio: r.bio,
              skills: r.skills ? r.skills.split(",").map(s => s.trim()).filter(Boolean) : [],
              city: r.city,
              experience: r.experience,
              education: r.education,
            }
          }
        : null,
      job: r.jobId
        ? {
            id: r.jobId,
            title: r.jobTitle,
            description: r.jobDescription,
            salary: r.jobSalary,
            location: r.jobLocation,
            company: r.companyId ? {
              id: r.companyId,
              name: r.companyName,
              logo: r.companyLogo,
            } : null,
          }
        : null,
    }));
  },

  // Full applicant data for recruiter view – includes resume from application AND user profile
  _getApplicantsForJob: async (jobId) => {
    return connection.promise().query(
      `SELECT a.id as appId, a.status, a.resume as appResume, a.resumeOriginalName as appResumeOriginalName, a.created_at as appCreatedAt, a.audioIntro as appAudioIntro,
              a.interviewDate, a.interviewTime, a.interviewDay, a.interviewStatus, a.interviewRequestedAt, a.interviewRespondedAt,
              u.id as userId, u.fullname, u.email, u.phoneNumber, u.role,
              u.resume as profileResume, u.resumeOriginalName as profileResumeOriginalName,
              u.bio, u.skills, u.city, u.experience, u.education, u.profilePhoto
       FROM applications a
       LEFT JOIN users u ON u.id = a.applicant
       WHERE a.job = ? AND (a.adminApprovalStatus IS NULL OR a.adminApprovalStatus != 'rejected')
       ORDER BY a.created_at DESC`,
      [jobId]
    );
  },
};

// =============== SAVED JOBS ===============
export const SavedJobModel = {
  toggle: async (userId, jobId) => {
    const [rows] = await connection.promise().query("SELECT id FROM saved_jobs WHERE user_id = ? AND job_id = ?", [userId, jobId]);
    if (rows.length > 0) {
      await connection.promise().query("DELETE FROM saved_jobs WHERE id = ?", [rows[0].id]);
      return { saved: false };
    } else {
      await connection.promise().query("INSERT INTO saved_jobs (user_id, job_id) VALUES (?, ?)", [userId, jobId]);
      return { saved: true };
    }
  },
  findByUser: async (userId) => {
    const [rows] = await connection.promise().query(
      `SELECT sj.job_id, sj.created_at as saved_at,
              j.*, c.id as companyId, c.name as companyName, c.description as companyDescription, c.website as companyWebsite, c.location as companyLocation, c.logo as companyLogo
       FROM saved_jobs sj
       JOIN jobs j ON j.id = sj.job_id
       LEFT JOIN companies c ON c.id = j.company
       WHERE sj.user_id = ? AND (j.isDeleted IS NULL OR j.isDeleted = false)
       ORDER BY sj.created_at DESC`,
      [userId]
    );
    return rows.map((r) => ({
      ...r,
      _id: r.id,
      createdAt: r.created_at,
      company: r.companyId ? { id: r.companyId, name: r.companyName, logo: r.companyLogo } : null,
    }));
  }
};

// =============== CHAT: CONVERSATIONS & MESSAGES ===============
export const ConversationModel = {
  create: async ({ type, jobId, applicationId, userOneId, userTwoId, status }) => {
    const uid1 = Math.min(Number(userOneId), Number(userTwoId));
    const uid2 = Math.max(Number(userOneId), Number(userTwoId));
    const pairKey = `${type}_${uid1}_${uid2}`;
    const [result] = await connection.promise().query(
      `INSERT INTO conversations (type, jobId, applicationId, userOneId, userTwoId, status, pairKey)
       VALUES (?,?,?,?,?,?,?)`,
      [type, jobId || null, applicationId || null, userOneId, userTwoId, status || "pending", pairKey]
    );
    return ConversationModel.findById(result.insertId);
  },

  findById: async (id) => {
    const [rows] = await connection.promise().query(
      `SELECT c.*,
          j.title AS jobTitle, j.jobCode AS jobCode,
          u1.fullname AS userOneName, u1.profilePhoto AS userOnePhoto, u1.role AS userOneRole,
          u2.fullname AS userTwoName, u2.profilePhoto AS userTwoPhoto, u2.role AS userTwoRole
       FROM conversations c
       LEFT JOIN jobs j ON j.id = c.jobId
       LEFT JOIN users u1 ON u1.id = c.userOneId
       LEFT JOIN users u2 ON u2.id = c.userTwoId
       WHERE c.id = ? LIMIT 1`,
      [id]
    );
    return rowOrNull(rows);
  },

  // existing pending/accepted candidate<->recruiter conversation for a given job+candidate
  findExisting: async ({ type, jobId, userOneId, userTwoId }) => {
    const [rows] = await connection.promise().query(
      `SELECT * FROM conversations WHERE type = ? AND userOneId = ? AND userTwoId = ? AND (jobId <=> ?) LIMIT 1`,
      [type, userOneId, userTwoId, jobId || null]
    );
    return rowOrNull(rows);
  },

  findAnyBetweenUsers: async ({ type, userOneId, userTwoId }) => {
    const [rows] = await connection.promise().query(
      `SELECT * FROM conversations 
       WHERE type = ? 
         AND ((userOneId = ? AND userTwoId = ?) OR (userOneId = ? AND userTwoId = ?)) 
       LIMIT 1`,
      [type, userOneId, userTwoId, userTwoId, userOneId]
    );
    return rowOrNull(rows);
  },

  findForUser: async (userId) => {
    const [rows] = await connection.promise().query(
      `SELECT c.*,
          j.title AS jobTitle, j.jobCode AS jobCode,
          u1.fullname AS userOneName, u1.profilePhoto AS userOnePhoto, u1.role AS userOneRole,
          u2.fullname AS userTwoName, u2.profilePhoto AS userTwoPhoto, u2.role AS userTwoRole,
          (SELECT COUNT(*) FROM messages m WHERE m.conversationId = c.id AND m.senderId != ? AND m.readAt IS NULL) AS unreadCount
       FROM conversations c
       LEFT JOIN jobs j ON j.id = c.jobId
       LEFT JOIN users u1 ON u1.id = c.userOneId
       LEFT JOIN users u2 ON u2.id = c.userTwoId
       WHERE c.userOneId = ? OR c.userTwoId = ?
       ORDER BY COALESCE(c.lastMessageAt, c.created_at) DESC`,
      [userId, userId, userId]
    );
    return rows;
  },

  updateStatus: async (id, status) => {
    await connection.promise().query(`UPDATE conversations SET status = ? WHERE id = ?`, [status, id]);
    return ConversationModel.findById(id);
  },

  touchLastMessage: async (id, message) => {
    await connection.promise().query(
      `UPDATE conversations SET lastMessage = ?, lastMessageAt = NOW() WHERE id = ?`,
      [message, id]
    );
  },
};

export const MessageModel = {
  create: async ({ conversationId, senderId, message, attachmentUrl, attachmentType, attachmentName }) => {
    const [result] = await connection.promise().query(
      `INSERT INTO messages (conversationId, senderId, message, attachmentUrl, attachmentType, attachmentName) VALUES (?,?,?,?,?,?)`,
      [conversationId, senderId, message || "", attachmentUrl || null, attachmentType || null, attachmentName || null]
    );
    const [rows] = await connection.promise().query(`SELECT * FROM messages WHERE id = ?`, [result.insertId]);
    return rowOrNull(rows);
  },

  findByConversation: async (conversationId) => {
    const [rows] = await connection.promise().query(
      `SELECT m.*, u.fullname AS senderName, u.profilePhoto AS senderPhoto
       FROM messages m
       LEFT JOIN users u ON u.id = m.senderId
       WHERE m.conversationId = ?
       ORDER BY m.created_at ASC`,
      [conversationId]
    );
    return rows;
  },

  markRead: async (conversationId, readerId) => {
    await connection.promise().query(
      `UPDATE messages SET readAt = NOW() WHERE conversationId = ? AND senderId != ? AND readAt IS NULL`,
      [conversationId, readerId]
    );
  },
};

// =============== ADMIN ACCESS KEYS (shared super-admin login IDs) ===============
export const AdminAccessKeyModel = {
  create: async ({ adminUserId, label, email, hashedPassword }) => {
    const [result] = await connection.promise().query(
      `INSERT INTO admin_access_keys (admin_user_id, label, email, password, is_active)
       VALUES (?, ?, ?, ?, true)`,
      [adminUserId, label, email, hashedPassword]
    );
    return AdminAccessKeyModel.findById(result.insertId);
  },
  findById: async (id) => {
    const [rows] = await connection.promise().query("SELECT * FROM admin_access_keys WHERE id = ? LIMIT 1", [id]);
    return rowOrNull(rows);
  },
  findByEmail: async (email) => {
    const [rows] = await connection.promise().query("SELECT * FROM admin_access_keys WHERE email = ? LIMIT 1", [email]);
    return rowOrNull(rows);
  },
  findByAdminUserId: async (adminUserId) => {
    const [rows] = await connection.promise().query(
      "SELECT * FROM admin_access_keys WHERE admin_user_id = ? ORDER BY created_at DESC",
      [adminUserId]
    );
    return rows.map((r) => ({ ...r, _id: r.id }));
  },
  setActive: async (id, isActive) => {
    await connection.promise().query(
      `UPDATE admin_access_keys SET is_active = ?, revoked_at = ? WHERE id = ?`,
      [isActive, isActive ? null : new Date(), id]
    );
    return AdminAccessKeyModel.findById(id);
  },
  touchLastUsed: async (id) => {
    await connection.promise().query("UPDATE admin_access_keys SET last_used_at = NOW() WHERE id = ?", [id]);
  },
  deleteById: async (id) => {
    await connection.promise().query("DELETE FROM admin_access_keys WHERE id = ?", [id]);
  },
};

// =============== INTERVIEW TEMPLATES (recruiter's reusable question sets) ===============
export const InterviewTemplateModel = {
  create: async ({ recruiterId, jobId, title, questions, prepTimeSec, timeLimitSec }) => {
    const [result] = await connection.promise().query(
      `INSERT INTO interview_templates (recruiter_id, job_id, title, questions, prep_time_sec, time_limit_sec)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [recruiterId, jobId || null, title, JSON.stringify(questions), prepTimeSec || 15, timeLimitSec || 90]
    );
    return InterviewTemplateModel.findById(result.insertId);
  },
  findById: async (id) => {
    const [rows] = await connection.promise().query("SELECT * FROM interview_templates WHERE id = ? LIMIT 1", [id]);
    return rowOrNull(rows);
  },
  findByRecruiterId: async (recruiterId) => {
    const [rows] = await connection.promise().query(
      "SELECT * FROM interview_templates WHERE recruiter_id = ? ORDER BY created_at DESC",
      [recruiterId]
    );
    return rows.map((r) => ({ ...r, _id: r.id }));
  },
  update: async (id, { title, questions, prepTimeSec, timeLimitSec }) => {
    await connection.promise().query(
      `UPDATE interview_templates SET title = ?, questions = ?, prep_time_sec = ?, time_limit_sec = ? WHERE id = ?`,
      [title, JSON.stringify(questions), prepTimeSec || 15, timeLimitSec || 90, id]
    );
    return InterviewTemplateModel.findById(id);
  },
  deleteById: async (id) => {
    await connection.promise().query("DELETE FROM interview_templates WHERE id = ?", [id]);
  },
};

// =============== AI INTERVIEWS (one video-interview session) ===============
export const AiInterviewModel = {
  create: async ({
    mode, candidateId, recruiterId, jobId, applicationId, templateId, roleTitle,
    questions, allowRetryOnFailure, prepTimeSec, timeLimitSec, deadline,
  }) => {
    const [result] = await connection.promise().query(
      `INSERT INTO ai_interviews
        (mode, candidate_id, recruiter_id, job_id, application_id, template_id, role_title,
         questions, allow_retry_on_failure, prep_time_sec, time_limit_sec, deadline, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [
        mode || "assessment", candidateId, recruiterId || null, jobId || null, applicationId || null,
        templateId || null, roleTitle || null, JSON.stringify(questions),
        !!allowRetryOnFailure, prepTimeSec || 15, timeLimitSec || 90, deadline || null,
      ]
    );
    return AiInterviewModel.findById(result.insertId);
  },
  findById: async (id) => {
    const [rows] = await connection.promise().query("SELECT * FROM ai_interviews WHERE id = ? LIMIT 1", [id]);
    return rowOrNull(rows);
  },
  findByCandidateId: async (candidateId) => {
    const [rows] = await connection.promise().query(
      "SELECT * FROM ai_interviews WHERE candidate_id = ? ORDER BY created_at DESC",
      [candidateId]
    );
    return rows.map((r) => ({ ...r, _id: r.id }));
  },
  findByRecruiterId: async (recruiterId) => {
    const [rows] = await connection.promise().query(
      "SELECT * FROM ai_interviews WHERE recruiter_id = ? ORDER BY created_at DESC",
      [recruiterId]
    );
    return rows.map((r) => ({ ...r, _id: r.id }));
  },
  findByJobId: async (jobId) => {
    const [rows] = await connection.promise().query(
      "SELECT * FROM ai_interviews WHERE job_id = ? ORDER BY created_at DESC",
      [jobId]
    );
    return rows.map((r) => ({ ...r, _id: r.id }));
  },
  findAll: async () => {
    const [rows] = await connection.promise().query("SELECT * FROM ai_interviews ORDER BY created_at DESC");
    return rows.map((r) => ({ ...r, _id: r.id }));
  },
  updateStatus: async (id, status, extra = {}) => {
    const fields = ["status = ?"];
    const values = [status];
    if (extra.startedAt !== undefined) { fields.push("started_at = ?"); values.push(extra.startedAt); }
    if (extra.completedAt !== undefined) { fields.push("completed_at = ?"); values.push(extra.completedAt); }
    if (extra.answers !== undefined) { fields.push("answers = ?"); values.push(JSON.stringify(extra.answers)); }
    if (extra.overallScore !== undefined) { fields.push("overall_score = ?"); values.push(extra.overallScore); }
    if (extra.categoryScores !== undefined) { fields.push("category_scores = ?"); values.push(JSON.stringify(extra.categoryScores)); }
    if (extra.aiSummary !== undefined) { fields.push("ai_summary = ?"); values.push(extra.aiSummary); }
    if (extra.recommendation !== undefined) { fields.push("recommendation = ?"); values.push(extra.recommendation); }
    values.push(id);
    await connection.promise().query(`UPDATE ai_interviews SET ${fields.join(", ")} WHERE id = ?`, values);
    return AiInterviewModel.findById(id);
  },
  saveAnswers: async (id, answers) => {
    await connection.promise().query("UPDATE ai_interviews SET answers = ? WHERE id = ?", [JSON.stringify(answers), id]);
    return AiInterviewModel.findById(id);
  },
};

// =============== EXPORTS (Mimic mongoose models) ===============
export const formatId = (v) => String(v);
