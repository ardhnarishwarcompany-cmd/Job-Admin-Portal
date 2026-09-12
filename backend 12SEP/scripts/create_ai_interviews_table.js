import { connection } from "../models/dbModels.js";

const migrate = async () => {
  try {
    // Reusable question sets a recruiter builds (per job, or a general template).
    await connection.promise().query(`
      CREATE TABLE IF NOT EXISTS interview_templates (
        id INT AUTO_INCREMENT PRIMARY KEY,
        recruiter_id INT NOT NULL,
        job_id INT NULL,
        title VARCHAR(255) NOT NULL,
        questions JSON NOT NULL,
        prep_time_sec INT DEFAULT 15,
        time_limit_sec INT DEFAULT 90,
        created_at DATETIME DEFAULT NOW(),
        updated_at DATETIME DEFAULT NOW() ON UPDATE NOW(),
        FOREIGN KEY (recruiter_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_interview_templates_recruiter (recruiter_id)
      )
    `);
    console.log("✅ interview_templates table ready.");

    // One actual interview session — either a candidate's own practice run,
    // or a recruiter-sent assessment tied to a specific job application.
    await connection.promise().query(`
      CREATE TABLE IF NOT EXISTS ai_interviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        mode ENUM('practice','assessment') NOT NULL DEFAULT 'assessment',
        candidate_id INT NOT NULL,
        recruiter_id INT NULL,
        job_id INT NULL,
        application_id INT NULL,
        template_id INT NULL,
        role_title VARCHAR(255) NULL,
        questions JSON NOT NULL,
        allow_retry_on_failure BOOLEAN DEFAULT false,
        prep_time_sec INT DEFAULT 15,
        time_limit_sec INT DEFAULT 90,
        deadline DATETIME NULL,
        status ENUM('pending','in_progress','completed','expired') DEFAULT 'pending',
        answers JSON NULL,
        overall_score INT NULL,
        category_scores JSON NULL,
        ai_summary TEXT NULL,
        recommendation VARCHAR(50) NULL,
        started_at DATETIME NULL,
        completed_at DATETIME NULL,
        created_at DATETIME DEFAULT NOW(),
        FOREIGN KEY (candidate_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_ai_interviews_candidate (candidate_id),
        INDEX idx_ai_interviews_recruiter (recruiter_id),
        INDEX idx_ai_interviews_job (job_id),
        INDEX idx_ai_interviews_status (status)
      )
    `);
    console.log("✅ ai_interviews table ready.");

    process.exit(0);
  } catch (err) {
    console.error("❌ Migration failed:", err);
    process.exit(1);
  }
};

migrate();
