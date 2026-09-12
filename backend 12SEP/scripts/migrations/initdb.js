import connection from "./utils/db.js";

const createUsersTable = "CREATE TABLE IF NOT EXISTS users (" +
"    id INT AUTO_INCREMENT PRIMARY KEY," +
"    fullname VARCHAR(255) NOT NULL," +
"    email VARCHAR(255) UNIQUE NOT NULL," +
"    phoneNumber VARCHAR(20) UNIQUE NOT NULL," +
"    password VARCHAR(255) NOT NULL," +
"    pancard VARCHAR(50)," +
"    adharcard VARCHAR(50)," +
"    role ENUM('Employee','Recruiter','Admin') DEFAULT 'Employee'," +
"    dateOfBirth VARCHAR(50)," +
"    companyName VARCHAR(255)," +
"    gstNumber VARCHAR(100)," +
"    adminCode VARCHAR(100)," +
"    profilePhoto TEXT," +
"    resume TEXT," +
"    resumeOriginalName TEXT," +
"    bio TEXT," +
"    skills TEXT," +
"    city VARCHAR(255)," +
"    experience VARCHAR(255)," +
"    education VARCHAR(255)," +
"    profileRole VARCHAR(255)," +
"    isBlocked BOOLEAN DEFAULT false," +
"    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP," +
"    updated_at DATETIME DEFAULT NULL" +
")";

const createCompaniesTable = "CREATE TABLE IF NOT EXISTS companies (" +
"    id INT AUTO_INCREMENT PRIMARY KEY," +
"    name VARCHAR(255) UNIQUE NOT NULL," +
"    description TEXT," +
"    website TEXT," +
"    location VARCHAR(255)," +
"    logo TEXT," +
"    userId INT," +
"    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP," +
"    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE," +
"    INDEX idx_companies_userId (userId)" +
")";

const createJobsTable = "CREATE TABLE IF NOT EXISTS jobs (" +
"    id INT AUTO_INCREMENT PRIMARY KEY," +
"    title VARCHAR(255) NOT NULL," +
"    description TEXT NOT NULL," +
"    requirements TEXT," +
"    salary VARCHAR(100)," +
"    experienceLevel INT," +
"    location VARCHAR(255)," +
"    jobType VARCHAR(100)," +
"    position INT," +
"    company INT NOT NULL," +
"    created_by INT NOT NULL," +
"    status ENUM('open','closed') DEFAULT 'open'," +
"    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP," +
"    FOREIGN KEY (company) REFERENCES companies(id) ON DELETE CASCADE," +
"    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE," +
"    INDEX idx_jobs_company (company)," +
"    INDEX idx_jobs_created_by (created_by)," +
"    INDEX idx_jobs_status (status)" +
")";

const createApplicationsTable = "CREATE TABLE IF NOT EXISTS applications (" +
"    id INT AUTO_INCREMENT PRIMARY KEY," +
"    job INT NOT NULL," +
"    applicant INT NOT NULL," +
"    status ENUM('pending','accepted','rejected') DEFAULT 'pending'," +
"    resume TEXT," +
"    resumeOriginalName TEXT," +
"    interviewDate DATE NULL," +
"    interviewTime VARCHAR(20) NULL," +
"    interviewDay VARCHAR(30) NULL," +
"    interviewStatus ENUM('none','requested','confirmed','rejected') DEFAULT 'none'," +
"    interviewRequestedAt TIMESTAMP NULL," +
"    interviewRespondedAt TIMESTAMP NULL," +
"    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP," +
"    FOREIGN KEY (job) REFERENCES jobs(id) ON DELETE CASCADE," +
"    FOREIGN KEY (applicant) REFERENCES users(id) ON DELETE CASCADE," +
"    INDEX idx_applications_job (job)," +
"    INDEX idx_applications_applicant (applicant)," +
"    INDEX idx_applications_status (status)," +
"    INDEX idx_applications_interview_status (interviewStatus)" +
")";

const createNotificationsTable = "CREATE TABLE IF NOT EXISTS notifications (" +
"    id INT AUTO_INCREMENT PRIMARY KEY," +
"    recipient INT NOT NULL," +
"    title VARCHAR(255) NOT NULL," +
"    body TEXT NOT NULL," +
"    type VARCHAR(100) DEFAULT 'system'," +
"    priority ENUM('high','medium','low') DEFAULT 'medium'," +
"    `read` BOOLEAN DEFAULT false," +
"    meta JSON NULL," +
"    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP," +
"    FOREIGN KEY (recipient) REFERENCES users(id) ON DELETE CASCADE," +
"    INDEX idx_notifications_recipient (recipient)," +
"    INDEX idx_notifications_read (`read`)" +
")";

const createContactRequestsTable = "CREATE TABLE IF NOT EXISTS contact_requests (" +
"    id INT AUTO_INCREMENT PRIMARY KEY," +
"    name VARCHAR(255) NOT NULL," +
"    email VARCHAR(255) NOT NULL," +
"    topic VARCHAR(255) DEFAULT 'General'," +
"    message TEXT NOT NULL," +
"    status ENUM('Open','Closed') DEFAULT 'Open'," +
"    resolvedAt DATETIME NULL," +
"    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP," +
"    updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP," +
"    INDEX idx_contact_requests_email (email)," +
"    INDEX idx_contact_requests_status (status)," +
"    INDEX idx_contact_requests_created_at (created_at)" +
")";

const createConversationsTable = "CREATE TABLE IF NOT EXISTS conversations (" +
"    id INT AUTO_INCREMENT PRIMARY KEY," +
"    type ENUM('candidate_recruiter','recruiter_admin') NOT NULL," +
"    jobId INT NULL," +
"    applicationId INT NULL," +
"    userOneId INT NOT NULL," +
"    userTwoId INT NOT NULL," +
"    status ENUM('pending','accepted','rejected') DEFAULT 'pending'," +
"    lastMessage TEXT NULL," +
"    lastMessageAt DATETIME NULL," +
"    pairKey VARCHAR(255) UNIQUE NULL," +
"    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP," +
"    FOREIGN KEY (jobId) REFERENCES jobs(id) ON DELETE SET NULL," +
"    FOREIGN KEY (applicationId) REFERENCES applications(id) ON DELETE SET NULL," +
"    FOREIGN KEY (userOneId) REFERENCES users(id) ON DELETE CASCADE," +
"    FOREIGN KEY (userTwoId) REFERENCES users(id) ON DELETE CASCADE," +
"    INDEX idx_conversations_userOne (userOneId)," +
"    INDEX idx_conversations_userTwo (userTwoId)," +
"    INDEX idx_conversations_job (jobId)," +
"    INDEX idx_conversations_type (type)" +
")";

const createMessagesTable = "CREATE TABLE IF NOT EXISTS messages (" +
"    id INT AUTO_INCREMENT PRIMARY KEY," +
"    conversationId INT NOT NULL," +
"    senderId INT NOT NULL," +
"    message TEXT NOT NULL," +
"    readAt DATETIME NULL," +
"    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP," +
"    FOREIGN KEY (conversationId) REFERENCES conversations(id) ON DELETE CASCADE," +
"    FOREIGN KEY (senderId) REFERENCES users(id) ON DELETE CASCADE," +
"    INDEX idx_messages_conversation (conversationId)," +
"    INDEX idx_messages_created_at (created_at)" +
")";

const createSavedJobsTable = "CREATE TABLE IF NOT EXISTS saved_jobs (" +
"    id INT AUTO_INCREMENT PRIMARY KEY," +
"    user_id INT NOT NULL," +
"    job_id INT NOT NULL," +
"    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP," +
"    UNIQUE KEY user_job_unique (user_id, job_id)," +
"    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE," +
"    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE," +
"    INDEX idx_saved_jobs_user (user_id)," +
"    INDEX idx_saved_jobs_job (job_id)" +
")";

const alterStatements = [
  "ALTER TABLE users ADD COLUMN candidateProfile JSON NULL",
  "ALTER TABLE users ADD COLUMN recruiterProfile JSON NULL",
  "ALTER TABLE users ADD COLUMN emailVerified BOOLEAN DEFAULT false",
  "ALTER TABLE users ADD COLUMN verificationStatus ENUM('pending','approved','rejected') DEFAULT 'approved'",
  "ALTER TABLE users ADD COLUMN resetPasswordToken VARCHAR(255) NULL",
  "ALTER TABLE users ADD COLUMN resetPasswordExpires DATETIME NULL",
];

const alterJobStatements = [
  "ALTER TABLE jobs ADD COLUMN jobDetails JSON NULL",
  "ALTER TABLE jobs ADD COLUMN jobCode VARCHAR(30) UNIQUE NULL",
  "ALTER TABLE jobs ADD COLUMN approvalStatus ENUM('pending','approved','rejected') DEFAULT 'approved'",
  "ALTER TABLE jobs ADD COLUMN rejectionReason TEXT NULL",
  "ALTER TABLE jobs ADD COLUMN approvedBy INT NULL",
  "ALTER TABLE jobs ADD COLUMN approvedAt DATETIME NULL",
  "ALTER TABLE jobs ADD COLUMN jdUrl VARCHAR(500) NULL",
];

function runAlterStatements(statements, label) {
  statements.forEach((sql) => {
    connection.query(sql, (err) => {
      if (err) {
        if (err.errno !== 1060) console.log(label + " alter warning:", err.message);
      } else {
        console.log(label + " alter applied:", sql);
      }
    });
  });
}

connection.query(createUsersTable, (err) => {
    if (err) {
        console.log("Users Table Error:", err);
    } else {
        console.log("Users Table Created");
        runAlterStatements(alterStatements, "users");
    }
});

connection.query(createCompaniesTable, (err) => {
    if (err) {
        console.log("Companies Table Error:", err);
    } else {
        console.log("Companies Table Created");
    }
});

connection.query(createJobsTable, (err) => {
    if (err) {
        console.log("Jobs Table Error:", err);
    } else {
        console.log("Jobs Table Created");
        runAlterStatements(alterJobStatements, "jobs");
    }
});

connection.query(createApplicationsTable, (err) => {
    if (err) {
        console.log("Applications Table Error:", err);
    } else {
        console.log("Applications Table Created");
    }
});

connection.query(createNotificationsTable, (err) => {
    if (err) {
        console.log("Notifications Table Error:", err);
    } else {
        console.log("Notifications Table Created");
    }
});

connection.query(createContactRequestsTable, (err) => {
    if (err) {
        console.log("Contact Requests Table Error:", err);
    } else {
        console.log("Contact Requests Table Created");
    }
});

connection.query(createConversationsTable, (err) => {
    if (err) {
        console.log("Conversations Table Error:", err);
    } else {
        console.log("Conversations Table Created");
    }
});

const alterMessageStatements = [
  "ALTER TABLE messages ADD COLUMN attachmentUrl VARCHAR(500) NULL",
  "ALTER TABLE messages ADD COLUMN attachmentType VARCHAR(30) NULL",
  "ALTER TABLE messages ADD COLUMN attachmentName VARCHAR(255) NULL",
];

connection.query(createMessagesTable, (err) => {
    if (err) {
        console.log("Messages Table Error:", err);
    } else {
        console.log("Messages Table Created");
        runAlterStatements(alterMessageStatements, "messages");
    }
});

connection.query(createSavedJobsTable, (err) => {
    if (err) {
        console.log("Saved Jobs Table Error:", err);
    } else {
        console.log("Saved Jobs Table Created");
    }
});

console.log("All Tables Setup Complete");
