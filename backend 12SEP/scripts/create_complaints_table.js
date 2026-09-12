import { connection } from "../models/dbModels.js";

const migrate = async () => {
  try {
    await connection.promise().query(`
      CREATE TABLE IF NOT EXISTS complaints (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        user_role ENUM('Employee', 'Recruiter') NOT NULL,
        subject VARCHAR(255) NOT NULL,
        category ENUM('Harassment', 'Technical Issue', 'Payment Issue', 'Job Related', 'Account Issue', 'Other') NOT NULL,
        description TEXT NOT NULL,
        status ENUM('Submitted', 'Under Review', 'In Progress', 'Resolved', 'Closed') DEFAULT 'Submitted',
        admin_note TEXT,
        resolved_by INT DEFAULT NULL,
        created_at DATETIME DEFAULT NOW(),
        updated_at DATETIME DEFAULT NOW() ON UPDATE NOW(),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log("✅ complaints table created (or already exists).");
    process.exit(0);
  } catch (err) {
    console.error("❌ Migration failed:", err);
    process.exit(1);
  }
};

migrate();
