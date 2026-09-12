import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import connection from "../utils/db.js";

dotenv.config();

const query = (sql, params = []) => connection.promise().query(sql, params);

async function tableExists(tableName) {
  const [rows] = await query(
    `SELECT 1 FROM information_schema.tables
     WHERE table_schema = DATABASE() AND table_name = ? LIMIT 1`,
    [tableName]
  );
  return rows.length > 0;
}

async function columnExists(tableName, columnName) {
  const [rows] = await query(
    `SELECT 1 FROM information_schema.columns
     WHERE table_schema = DATABASE()
       AND table_name = ?
       AND column_name = ?
     LIMIT 1`,
    [tableName, columnName]
  );
  return rows.length > 0;
}

async function addColumnIfMissing(tableName, columnName, definition) {
  if (await columnExists(tableName, columnName)) return;
  await query(`ALTER TABLE \`${tableName}\` ADD COLUMN \`${columnName}\` ${definition}`);
  console.log(`✅ Added missing column ${tableName}.${columnName}`);
}

async function ensureDatabaseSchema() {
  console.log("🔧 Checking Job Portal database schema...");

  // The application already expects these core tables. Only CREATE IF NOT EXISTS
  // is used, so existing production data is preserved.
  const usersReady = await tableExists("users");
  const jobsReady = await tableExists("jobs");
  const applicationsReady = await tableExists("applications");

  if (!usersReady) {
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        fullname VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phoneNumber VARCHAR(20) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        pancard VARCHAR(50),
        adharcard VARCHAR(50),
        role ENUM('Employee','Recruiter','Admin') DEFAULT 'Employee',
        dateOfBirth VARCHAR(50),
        companyName VARCHAR(255),
        gstNumber VARCHAR(100),
        adminCode VARCHAR(100),
        profilePhoto TEXT,
        resume TEXT,
        resumeOriginalName TEXT,
        bio TEXT,
        skills TEXT,
        city VARCHAR(255),
        experience VARCHAR(255),
        education VARCHAR(255),
        profileRole VARCHAR(255),
        isBlocked BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log("✅ Created missing users table.");
  }

  // Keep user schema compatible with the current SQL models.
  const userColumns = [
    ["candidateProfile", "JSON NULL"],
    ["recruiterProfile", "JSON NULL"],
    ["emailVerified", "BOOLEAN DEFAULT false"],
    ["verificationStatus", "ENUM('pending','approved','rejected') DEFAULT 'approved'"],
    ["resetPasswordToken", "VARCHAR(255) NULL"],
    ["resetPasswordExpires", "DATETIME NULL"],
    ["gstNumber", "VARCHAR(100) NULL"],
    ["adminCode", "VARCHAR(100) NULL"],
    ["profilePhoto", "TEXT NULL"],
    ["resumeOriginalName", "TEXT NULL"],
    ["bio", "TEXT NULL"],
    ["skills", "TEXT NULL"],
    ["city", "VARCHAR(255) NULL"],
    ["experience", "VARCHAR(255) NULL"],
    ["education", "VARCHAR(255) NULL"],
    ["profileRole", "VARCHAR(255) NULL"],
    ["isBlocked", "BOOLEAN DEFAULT false"],
  ];
  for (const [name, definition] of userColumns) {
    await addColumnIfMissing("users", name, definition);
  }

  // If the database was empty, the following tables are also needed before
  // conversations can be created. We create only what is absent.
  if (!await tableExists("companies")) {
    await query(`
      CREATE TABLE IF NOT EXISTS companies (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        description TEXT,
        website TEXT,
        location VARCHAR(255),
        logo TEXT,
        userId INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_companies_userId (userId)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log("✅ Created missing companies table.");
  }

  if (!await tableExists("jobs")) {
    await query(`
      CREATE TABLE IF NOT EXISTS jobs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        requirements TEXT,
        salary VARCHAR(100),
        experienceLevel INT,
        location VARCHAR(255),
        jobType VARCHAR(100),
        position INT,
        company INT NOT NULL,
        created_by INT NOT NULL,
        status ENUM('open','closed') DEFAULT 'open',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_jobs_company (company),
        INDEX idx_jobs_created_by (created_by),
        INDEX idx_jobs_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log("✅ Created missing jobs table.");
  }

  for (const [name, definition] of [
    ["jobDetails", "JSON NULL"],
    ["jobCode", "VARCHAR(30) UNIQUE NULL"],
    ["approvalStatus", "ENUM('pending','approved','rejected') DEFAULT 'approved'"],
    ["rejectionReason", "TEXT NULL"],
    ["approvedBy", "INT NULL"],
    ["approvedAt", "DATETIME NULL"],
    ["jdUrl", "VARCHAR(500) NULL"],
  ]) {
    await addColumnIfMissing("jobs", name, definition);
  }

  if (!await tableExists("applications")) {
    await query(`
      CREATE TABLE IF NOT EXISTS applications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        job INT NOT NULL,
        applicant INT NOT NULL,
        status ENUM('pending','accepted','rejected') DEFAULT 'pending',
        resume TEXT,
        resumeOriginalName TEXT,
        interviewDate DATE NULL,
        interviewTime VARCHAR(20) NULL,
        interviewDay VARCHAR(30) NULL,
        interviewStatus ENUM('none','requested','confirmed','rejected') DEFAULT 'none',
        interviewRequestedAt TIMESTAMP NULL,
        interviewRespondedAt TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_applications_job (job),
        INDEX idx_applications_applicant (applicant),
        INDEX idx_applications_status (status),
        INDEX idx_applications_interview_status (interviewStatus)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log("✅ Created missing applications table.");
  }

  // CRITICAL FIX #1: conversations was missing in jobportal1.
  if (!await tableExists("conversations")) {
    await query(`
      CREATE TABLE conversations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        type ENUM('candidate_recruiter','recruiter_admin') NOT NULL,
        jobId INT NULL,
        applicationId INT NULL,
        userOneId INT NOT NULL,
        userTwoId INT NOT NULL,
        status ENUM('pending','accepted','rejected') DEFAULT 'pending',
        lastMessage TEXT NULL,
        lastMessageAt DATETIME NULL,
        pairKey VARCHAR(255) UNIQUE NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_conversations_userOne (userOneId),
        INDEX idx_conversations_userTwo (userTwoId),
        INDEX idx_conversations_job (jobId),
        INDEX idx_conversations_type (type)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log("✅ Created missing conversations table.");
  } else {
    await addColumnIfMissing("conversations", "pairKey", "VARCHAR(255) UNIQUE NULL");
  }

  // CRITICAL FIX #2: messages is required by findForUser() unreadCount.
  if (!await tableExists("messages")) {
    await query(`
      CREATE TABLE messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        conversationId INT NOT NULL,
        senderId INT NOT NULL,
        message TEXT NOT NULL,
        readAt DATETIME NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        attachmentUrl VARCHAR(500) NULL,
        attachmentType VARCHAR(30) NULL,
        attachmentName VARCHAR(255) NULL,
        INDEX idx_messages_conversation (conversationId),
        INDEX idx_messages_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log("✅ Created missing messages table.");
  } else {
    await addColumnIfMissing("messages", "attachmentUrl", "VARCHAR(500) NULL");
    await addColumnIfMissing("messages", "attachmentType", "VARCHAR(30) NULL");
    await addColumnIfMissing("messages", "attachmentName", "VARCHAR(255) NULL");
  }

  // CRITICAL FIX #3: admin access-key table used by the Admin login fallback
  // and by admin access-key management.
  if (!await tableExists("admin_access_keys")) {
    await query(`
      CREATE TABLE admin_access_keys (
        id INT AUTO_INCREMENT PRIMARY KEY,
        admin_user_id INT NOT NULL,
        label VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        revoked_at DATETIME DEFAULT NULL,
        last_used_at DATETIME DEFAULT NULL,
        INDEX idx_admin_access_keys_admin_user_id (admin_user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log("✅ Created missing admin_access_keys table.");
  }


  // NOVA AI interview approval + recording schema.
  // Existing rows are preserved; missing columns are added in-place.
  if (!await tableExists("ai_screening_interviews")) {
    await query(`
      CREATE TABLE ai_screening_interviews (
        id INT NOT NULL AUTO_INCREMENT,
        user_id INT NOT NULL,
        candidate_id INT NULL,
        initiated_by_user_id INT NULL,
        hr_user_id INT NULL,
        job_id INT NULL,
        job_title VARCHAR(255) NULL,
        candidate_name VARCHAR(255) NULL,
        company_logo TEXT NULL,
        phase VARCHAR(32) NOT NULL DEFAULT 'core',
        phase_turns INT NOT NULL DEFAULT 0,
        turns INT NOT NULL DEFAULT 0,
        question_index INT NOT NULL DEFAULT 0,
        question_started_at DATETIME NULL,
        question_time_limit_seconds INT NOT NULL DEFAULT 10,
        timed_out_questions JSON NOT NULL,
        transcript JSON NOT NULL,
        question_plan JSON NOT NULL,
        asked_questions JSON NOT NULL,
        scores JSON NOT NULL,
        answer_evaluations JSON NOT NULL,
        avg_score DECIMAL(5,2) NULL,
        ai_recommendation VARCHAR(64) NULL,
        evaluation_summary JSON NULL,
        status ENUM('pending_approval','approved','in_progress','completed','terminated','rejected') NOT NULL DEFAULT 'pending_approval',
        started_at DATETIME NULL,
        completed_at DATETIME NULL,
        proctoring JSON NOT NULL,
        review_score DECIMAL(5,2) NULL,
        review_decision ENUM('PENDING','HIRE','HOLD','REJECT') NOT NULL DEFAULT 'PENDING',
        reviewed_by_user_id INT NULL,
        reviewed_at DATETIME NULL,
        video_recording_url VARCHAR(1000) NULL,
        video_mime_type VARCHAR(128) NULL,
        video_duration_seconds INT NULL,
        answer_videos JSON NOT NULL,
        hr_approval_status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
        admin_approval_status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
        hr_approved_by_user_id INT NULL,
        admin_approved_by_user_id INT NULL,
        hr_approved_at DATETIME NULL,
        admin_approved_at DATETIME NULL,
        approval_requested_at DATETIME NULL,
        approval_rejection_reason TEXT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY idx_nova_user (user_id),
        KEY idx_nova_candidate (candidate_id),
        KEY idx_nova_initiator (initiated_by_user_id),
        KEY idx_nova_hr (hr_user_id),
        KEY idx_nova_job (job_id),
        KEY idx_nova_status (status),
        KEY idx_nova_hr_approval (hr_approval_status),
        KEY idx_nova_admin_approval (admin_approval_status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log("✅ Created missing ai_screening_interviews table.");
  } else {
    // Older builds created a smaller ai_screening_interviews table. The NOVA
    // routes below use the complete schema, so repair every required column
    // in-place instead of only adding the approval columns.
    const novaColumns = [
      ["candidate_id", "INT NULL"],
      ["initiated_by_user_id", "INT NULL"],
      ["hr_user_id", "INT NULL"],
      ["job_id", "INT NULL"],
      ["job_title", "VARCHAR(255) NULL"],
      ["candidate_name", "VARCHAR(255) NULL"],
      ["company_logo", "TEXT NULL"],
      ["phase", "VARCHAR(32) NOT NULL DEFAULT 'core'"],
      ["phase_turns", "INT NOT NULL DEFAULT 0"],
      ["turns", "INT NOT NULL DEFAULT 0"],
      ["question_index", "INT NOT NULL DEFAULT 0"],
      ["question_started_at", "DATETIME NULL"],
      ["question_time_limit_seconds", "INT NOT NULL DEFAULT 10"],
      ["timed_out_questions", "JSON NULL"],
      ["transcript", "JSON NULL"],
      ["question_plan", "JSON NULL"],
      ["asked_questions", "JSON NULL"],
      ["scores", "JSON NULL"],
      ["answer_evaluations", "JSON NULL"],
      ["avg_score", "DECIMAL(5,2) NULL"],
      ["ai_recommendation", "VARCHAR(64) NULL"],
      ["evaluation_summary", "JSON NULL"],
      ["status", "ENUM('pending_approval','approved','in_progress','completed','terminated','rejected') NOT NULL DEFAULT 'pending_approval'"],
      ["started_at", "DATETIME NULL"],
      ["completed_at", "DATETIME NULL"],
      ["proctoring", "JSON NULL"],
      ["review_score", "DECIMAL(5,2) NULL"],
      ["review_decision", "ENUM('PENDING','HIRE','HOLD','REJECT') NOT NULL DEFAULT 'PENDING'"],
      ["reviewed_by_user_id", "INT NULL"],
      ["reviewed_at", "DATETIME NULL"],
      ["video_recording_url", "VARCHAR(1000) NULL"],
      ["video_mime_type", "VARCHAR(128) NULL"],
      ["video_duration_seconds", "INT NULL"],
      ["answer_videos", "JSON NULL"],
      ["hr_approval_status", "ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending'"],
      ["admin_approval_status", "ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending'"],
      ["hr_approved_by_user_id", "INT NULL"],
      ["admin_approved_by_user_id", "INT NULL"],
      ["hr_approved_at", "DATETIME NULL"],
      ["admin_approved_at", "DATETIME NULL"],
      ["approval_requested_at", "DATETIME NULL"],
      ["approval_rejection_reason", "TEXT NULL"],
    ];
    for (const [name, definition] of novaColumns) {
      await addColumnIfMissing("ai_screening_interviews", name, definition);
    }
    await query(`
      ALTER TABLE ai_screening_interviews
      MODIFY COLUMN status ENUM('pending_approval','approved','in_progress','completed','terminated','rejected')
      NOT NULL DEFAULT 'pending_approval'
    `);
    await query(`
      UPDATE ai_screening_interviews
      SET question_time_limit_seconds = 10
      WHERE question_time_limit_seconds IS NULL OR question_time_limit_seconds > 10
    `);
  }

  // Repair the seeded Admin account only if it does not already exist.
  // Existing accounts/passwords are NEVER overwritten.
  const adminEmail = process.env.ADMIN_EMAIL || "admin@jobportal.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "Test@1234";
  const [adminRows] = await query(
    "SELECT id FROM users WHERE email = ? LIMIT 1",
    [adminEmail]
  );

  if (adminRows.length === 0) {
    let phone = process.env.ADMIN_PHONE || "9000000001";
    for (let i = 0; i < 100; i++) {
      const [phoneRows] = await query(
        "SELECT id FROM users WHERE phoneNumber = ? LIMIT 1",
        [phone]
      );
      if (phoneRows.length === 0) break;
      phone = String(Number(phone) + 1);
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    await query(
      `INSERT INTO users
        (fullname, email, phoneNumber, password, role, adminCode, verificationStatus, emailVerified)
       VALUES (?, ?, ?, ?, 'Admin', ?, 'approved', true)`,
      ["Super Admin", adminEmail, phone, hashedPassword, "ADMIN2024"]
    );
    console.log(`✅ Created missing Admin account: ${adminEmail}`);
  } else {
    console.log(`ℹ️ Admin account already exists: ${adminEmail} (password unchanged)`);
  }

  // Razorpay payment records. Safe to run on every startup; existing data is preserved.
  await query(`
    CREATE TABLE IF NOT EXISTS jobportal_payments (
      id INT NOT NULL AUTO_INCREMENT,
      user_id INT NOT NULL,
      plan_name VARCHAR(64) NOT NULL,
      billing_cycle ENUM('monthly','yearly') NOT NULL DEFAULT 'monthly',
      amount INT NOT NULL,
      currency VARCHAR(8) NOT NULL DEFAULT 'INR',
      razorpay_order_id VARCHAR(128) NULL,
      razorpay_payment_id VARCHAR(128) NULL,
      razorpay_signature VARCHAR(255) NULL,
      status ENUM('created','paid','failed','refunded') NOT NULL DEFAULT 'created',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      paid_at TIMESTAMP NULL,
      PRIMARY KEY (id),
      UNIQUE KEY uq_razorpay_order (razorpay_order_id),
      KEY idx_payment_user (user_id),
      KEY idx_payment_status (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  // Add global fields to existing jobs table.
  const jobFields = [
    ['region', "ENUM('INDIA','INTERNATIONAL') DEFAULT 'INDIA'"], ['country','VARCHAR(100) NULL'], ['stateProvince','VARCHAR(150) NULL'], ['city','VARCHAR(150) NULL'], ['pincode','VARCHAR(30) NULL'], ['remoteType',"ENUM('ONSITE','REMOTE','HYBRID') DEFAULT 'ONSITE'"], ['visaSponsorship','BOOLEAN DEFAULT false'], ['workPermit','BOOLEAN DEFAULT false'], ['relocationSupport','BOOLEAN DEFAULT false'], ['accommodationProvided','BOOLEAN DEFAULT false'], ['foodProvided','BOOLEAN DEFAULT false'], ['transportationProvided','BOOLEAN DEFAULT false'], ['medicalInsurance','BOOLEAN DEFAULT false'], ['airTicket','BOOLEAN DEFAULT false'], ['contractDuration','VARCHAR(100) NULL'], ['currency',"VARCHAR(8) DEFAULT 'INR'"], ['salaryPeriod',"ENUM('MONTHLY','ANNUAL') DEFAULT 'MONTHLY'"], ['overtime','VARCHAR(120) NULL'], ['bonus','VARCHAR(120) NULL'], ['commission','VARCHAR(120) NULL'], ['workingHours','VARCHAR(120) NULL'], ['weeklyOff','VARCHAR(120) NULL'], ['requiredVisaType','VARCHAR(120) NULL'], ['permitNumber','VARCHAR(180) NULL'], ['recruitmentAgentId','INT NULL'], ['jobOrderReference','VARCHAR(180) NULL'], ['contractAvailable','BOOLEAN DEFAULT false'], ['jobVerificationStatus',"ENUM('VERIFIED','UNDER_VERIFICATION','SUSPENDED') DEFAULT 'UNDER_VERIFICATION'"], ['urgentHiring','BOOLEAN DEFAULT false'], ['companyVerificationStatus','VARCHAR(80) NULL'],
    ['isClosed', 'BOOLEAN DEFAULT false'],
    ['isDeleted', 'BOOLEAN DEFAULT false'],
    ['reopenRequest', "ENUM('none','requested','approved','rejected') DEFAULT 'none'"],
    ['reopenReason', 'TEXT NULL'],
    ['industryType', 'VARCHAR(100) NULL']
  ];
  for (const [n,d] of jobFields) await addColumnIfMissing('jobs',n,d);

  // Add adminApprovalStatus to applications
  await addColumnIfMissing('applications', 'adminApprovalStatus', "ENUM('pending','approved','rejected') DEFAULT 'pending'");

  // Create job_edit_requests table
  await query(`
    CREATE TABLE IF NOT EXISTS job_edit_requests (
      id INT AUTO_INCREMENT PRIMARY KEY,
      job_id INT NOT NULL,
      edited_fields JSON NOT NULL,
      status ENUM('pending','approved','rejected') DEFAULT 'pending',
      admin_reply TEXT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_jer_job (job_id),
      INDEX idx_jer_status (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  // Create recruiter_features table
  await query(`
    CREATE TABLE IF NOT EXISTS recruiter_features (
      id INT AUTO_INCREMENT PRIMARY KEY,
      recruiter_id INT NOT NULL UNIQUE,
      chat_status ENUM('not_requested','pending','approved','revoked') DEFAULT 'not_requested',
      nova_status ENUM('not_requested','pending','approved','revoked') DEFAULT 'not_requested',
      find_candidates_status ENUM('not_requested','pending','approved','revoked') DEFAULT 'not_requested',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_rf_recruiter (recruiter_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  // Create recruiter_action_logs table
  await query(`
    CREATE TABLE IF NOT EXISTS recruiter_action_logs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      recruiter_id INT NOT NULL,
      action_type VARCHAR(100) NOT NULL,
      details TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_ral_recruiter (recruiter_id),
      INDEX idx_ral_action (action_type)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  // Ensure jobs.approvalStatus supports 'edit_pending'
  try {
    await query("ALTER TABLE jobs MODIFY COLUMN approvalStatus ENUM('pending','approved','rejected','edit_pending') DEFAULT 'approved'");
    console.log("✅ Ensured jobs.approvalStatus supports 'edit_pending'.");
  } catch (err) {
    console.error("Failed to alter approvalStatus enum:", err.message);
  }

  // Global Workforce Platform
  await query(`CREATE TABLE IF NOT EXISTS workforce_passports (
    id INT AUTO_INCREMENT PRIMARY KEY, user_id INT NOT NULL, workforce_id VARCHAR(80) UNIQUE, profession VARCHAR(160), experience_years DECIMAL(5,2) DEFAULT 0, education VARCHAR(255),
    skills LONGTEXT, certifications LONGTEXT, languages LONGTEXT, work_eligibility VARCHAR(255), target_country VARCHAR(120), salary_expectation VARCHAR(120), bio TEXT, preferences LONGTEXT,
    ai_skill_score INT DEFAULT 0, verification_status VARCHAR(30) DEFAULT 'pending', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_workforce_user (user_id), INDEX idx_workforce_country (target_country), INDEX idx_workforce_verification (verification_status)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);

  // Advanced Global Workforce operational tables
  await query(`CREATE TABLE IF NOT EXISTS workforce_actions (
    id INT AUTO_INCREMENT PRIMARY KEY, user_id INT NOT NULL, action_type VARCHAR(100) NOT NULL, payload LONGTEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_wa_user (user_id), INDEX idx_wa_type (action_type)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);

  await query(`CREATE TABLE IF NOT EXISTS workforce_bulk_requests (
    id INT AUTO_INCREMENT PRIMARY KEY, created_by INT NOT NULL, role VARCHAR(180) NOT NULL, country VARCHAR(120), workers INT DEFAULT 0, notes TEXT,
    salary VARCHAR(100) DEFAULT NULL, category VARCHAR(100) DEFAULT NULL,
    status ENUM('submitted','screening','verification','interview','selection','deployment','closed') DEFAULT 'submitted',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_wbr_creator (created_by), INDEX idx_wbr_status (status)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);

  try { await query(`ALTER TABLE workforce_bulk_requests ADD COLUMN salary VARCHAR(100) DEFAULT NULL`); } catch (err) {}
  try { await query(`ALTER TABLE workforce_bulk_requests ADD COLUMN category VARCHAR(100) DEFAULT NULL`); } catch (err) {}

  await query(`CREATE TABLE IF NOT EXISTS workforce_mass_applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bulk_request_id INT NOT NULL,
    applicant_id INT NOT NULL,
    status ENUM('applied','under_review','accepted','rejected') DEFAULT 'applied',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_bulk_applicant (bulk_request_id, applicant_id),
    INDEX idx_wma_bulk (bulk_request_id),
    INDEX idx_wma_applicant (applicant_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);

  await query(`CREATE TABLE IF NOT EXISTS admin_permissions (
    id INT AUTO_INCREMENT PRIMARY KEY, admin_user_id INT NOT NULL, permission_key VARCHAR(120) NOT NULL, enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_admin_permission (admin_user_id, permission_key), INDEX idx_ap_admin (admin_user_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);

  await query(`CREATE TABLE IF NOT EXISTS admin_audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY, admin_user_id INT NOT NULL, action VARCHAR(160) NOT NULL, target_type VARCHAR(80), target_id VARCHAR(80), details LONGTEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, INDEX idx_aal_admin (admin_user_id), INDEX idx_aal_action (action)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);

  // Ensure companies has trust_score and verification_checklist
  try {
    await query(`ALTER TABLE companies ADD COLUMN trust_score INT DEFAULT 50`);
  } catch (err) {
    // Column might already exist, ignore
  }
  try {
    await query(`ALTER TABLE companies ADD COLUMN verification_checklist LONGTEXT NULL`);
  } catch (err) {
    // Column might already exist, ignore
  }

  // Support Partners Table
  await query(`CREATE TABLE IF NOT EXISTS workforce_support_partners (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(180) NOT NULL,
    category ENUM('accommodation','insurance','travel','banking','sim','orientation') NOT NULL,
    country VARCHAR(100) NOT NULL,
    description TEXT,
    logo_url VARCHAR(255) NULL,
    referral_code VARCHAR(50) NULL,
    is_verified BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);

  // Seed support partners if empty
  try {
    const [partnerRows] = await query("SELECT COUNT(*) AS total FROM workforce_support_partners");
    if (partnerRows && partnerRows[0] && partnerRows[0].total === 0) {
      await query(`INSERT INTO workforce_support_partners (name, category, country, description, referral_code) VALUES
        ('Global Stay Solutions', 'accommodation', 'Germany', 'Verified student and worker apartments across Germany.', 'RW-GER-STAY'),
        ('EuroCare Insurance', 'insurance', 'Germany', 'Comprehensive health and travel insurance matching visa requirements.', 'RW-GER-INS'),
        ('Apex Mobility Transit', 'travel', 'Germany', 'Corporate relocation and flight booking assistance.', 'RW-GER-TRAVEL'),
        ('UAE Oasis Living', 'accommodation', 'UAE', 'Affordable worker hostels and executive rooms in Dubai and Abu Dhabi.', 'RW-UAE-STAY'),
        ('Gulf Health Shield', 'insurance', 'UAE', 'Mandatory local health coverage support for expatriate workers.', 'RW-UAE-INS'),
        ('Canada Pioneer Housing', 'accommodation', 'Canada', 'Temporary housing search support for immigrants.', 'RW-CAN-STAY'),
        ('Royal Maple Financials', 'banking', 'Canada', 'Assistance setting up bank accounts prior to arrival.', 'RW-CAN-BANK')
      `);
    }
  } catch (err) {
    console.error("Failed to seed support partners:", err.message);
  }

  // Create workforce_settings table and seed
  await query(`CREATE TABLE IF NOT EXISTS workforce_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    module_id VARCHAR(50) NOT NULL UNIQUE,
    is_enabled BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);

  try {
    const [settingsRows] = await query("SELECT COUNT(*) AS total FROM workforce_settings");
    if (settingsRows && settingsRows[0] && settingsRows[0].total === 0) {
      const modulesToSeed = ["01","02","03","04","05","06","07","08","09","10","11","12","13","14","15","16","17","18","19","20","21","22","23","24","25","26","27","28"];
      for (const m of modulesToSeed) {
        await query(`INSERT INTO workforce_settings (module_id, is_enabled) VALUES (?, TRUE)`, [m]);
      }
    }
  } catch (err) {
    console.error("Failed to seed workforce settings:", err.message);
  }

  console.log("✅ Job Portal database schema check complete.");
}

export default ensureDatabaseSchema;
