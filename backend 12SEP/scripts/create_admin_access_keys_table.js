import { connection } from "../models/dbModels.js";

const migrate = async () => {
  try {
    await connection.promise().query(`
      CREATE TABLE IF NOT EXISTS admin_access_keys (
        id INT AUTO_INCREMENT PRIMARY KEY,
        admin_user_id INT NOT NULL,
        label VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at DATETIME DEFAULT NOW(),
        revoked_at DATETIME DEFAULT NULL,
        last_used_at DATETIME DEFAULT NULL,
        FOREIGN KEY (admin_user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_admin_access_keys_admin_user_id (admin_user_id)
      )
    `);
    console.log("✅ admin_access_keys table created (or already exists).");
    process.exit(0);
  } catch (err) {
    console.error("❌ Migration failed:", err);
    process.exit(1);
  }
};

migrate();
