-- Recruweb Global Workforce operational tables
-- The backend also creates these automatically through ensureDatabaseSchema.js.
CREATE TABLE IF NOT EXISTS workforce_actions (
 id INT AUTO_INCREMENT PRIMARY KEY, user_id INT NOT NULL, action_type VARCHAR(100) NOT NULL,
 payload LONGTEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 INDEX idx_wa_user (user_id), INDEX idx_wa_type (action_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS workforce_bulk_requests (
 id INT AUTO_INCREMENT PRIMARY KEY, created_by INT NOT NULL, role VARCHAR(180) NOT NULL, country VARCHAR(120), workers INT DEFAULT 0,
 notes TEXT, status ENUM('submitted','screening','verification','interview','selection','deployment','closed') DEFAULT 'submitted',
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 INDEX idx_wbr_creator (created_by), INDEX idx_wbr_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS admin_permissions (
 id INT AUTO_INCREMENT PRIMARY KEY, admin_user_id INT NOT NULL, permission_key VARCHAR(120) NOT NULL, enabled BOOLEAN DEFAULT TRUE,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 UNIQUE KEY uq_admin_permission (admin_user_id, permission_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS admin_audit_logs (
 id INT AUTO_INCREMENT PRIMARY KEY, admin_user_id INT NOT NULL, action VARCHAR(160) NOT NULL, target_type VARCHAR(80), target_id VARCHAR(80), details LONGTEXT,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, INDEX idx_aal_admin (admin_user_id), INDEX idx_aal_action (action)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
