import { connection } from "../models/dbModels.js";

// ─── Submit a Complaint ────────────────────────────────────────
export const submitComplaint = async (req, res) => {
  try {
    const { subject, category, description } = req.body;
    const userId = req.id;

    if (!subject || !category || !description) {
      return res.status(400).json({ success: false, message: "Subject, category, and description are required." });
    }

    const [userRows] = await connection.promise().query("SELECT role FROM users WHERE id = ? LIMIT 1", [userId]);
    if (!userRows.length) return res.status(404).json({ success: false, message: "User not found." });

    const userRole = userRows[0].role;

    const [result] = await connection.promise().query(
      `INSERT INTO complaints (user_id, user_role, subject, category, description) VALUES (?, ?, ?, ?, ?)`,
      [userId, userRole, subject, category, description]
    );

    const [rows] = await connection.promise().query("SELECT * FROM complaints WHERE id = ? LIMIT 1", [result.insertId]);
    return res.status(201).json({ success: true, message: "Complaint submitted successfully.", complaint: rows[0] });
  } catch (err) {
    console.error("submitComplaint error:", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ─── Get My Complaints (Candidate / Recruiter) ────────────────
export const getMyComplaints = async (req, res) => {
  try {
    const userId = req.id;
    const [rows] = await connection.promise().query(
      `SELECT c.*, u.fullname as user_name 
       FROM complaints c 
       JOIN users u ON c.user_id = u.id 
       WHERE c.user_id = ? 
       ORDER BY c.created_at DESC`,
      [userId]
    );
    return res.json({ success: true, complaints: rows });
  } catch (err) {
    console.error("getMyComplaints error:", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ─── Get All Complaints (Admin) ───────────────────────────────
export const getAllComplaints = async (req, res) => {
  try {
    const { role } = req.query; // 'Employee' or 'Recruiter' filter
    let query = `SELECT c.*, u.fullname as user_name, u.email as user_email 
                 FROM complaints c 
                 JOIN users u ON c.user_id = u.id`;
    const params = [];

    if (role && (role === "Employee" || role === "Recruiter")) {
      query += ` WHERE c.user_role = ?`;
      params.push(role);
    }

    query += ` ORDER BY c.created_at DESC`;

    const [rows] = await connection.promise().query(query, params);
    return res.json({ success: true, complaints: rows });
  } catch (err) {
    console.error("getAllComplaints error:", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ─── Update Complaint Status (Admin) ─────────────────────────
export const updateComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, admin_note } = req.body;
    const adminId = req.id;

    const validStatuses = ["Submitted", "Under Review", "In Progress", "Resolved", "Closed"];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value." });
    }

    const updates = {};
    if (status) updates.status = status;
    if (admin_note !== undefined) updates.admin_note = admin_note;
    if (status === "Resolved" || status === "Closed") updates.resolved_by = adminId;

    const setClause = Object.keys(updates).map(k => `${k} = ?`).join(", ");
    const values = [...Object.values(updates), id];

    await connection.promise().query(`UPDATE complaints SET ${setClause} WHERE id = ?`, values);

    const [rows] = await connection.promise().query("SELECT * FROM complaints WHERE id = ? LIMIT 1", [id]);
    return res.json({ success: true, message: "Complaint updated.", complaint: rows[0] });
  } catch (err) {
    console.error("updateComplaintStatus error:", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ─── Get Complaint Stats (Admin) ──────────────────────────────
export const getComplaintStats = async (req, res) => {
  try {
    const [rows] = await connection.promise().query(
      `SELECT 
        COUNT(*) as total,
        SUM(status = 'Submitted') as submitted,
        SUM(status = 'Under Review') as under_review,
        SUM(status = 'In Progress') as in_progress,
        SUM(status = 'Resolved') as resolved,
        SUM(status = 'Closed') as closed,
        SUM(user_role = 'Employee') as from_candidates,
        SUM(user_role = 'Recruiter') as from_recruiters
       FROM complaints`
    );
    return res.json({ success: true, stats: rows[0] });
  } catch (err) {
    console.error("getComplaintStats error:", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};
