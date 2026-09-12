import express from "express";
import authenticateToken from "../middleware/isAuthenticated.js";
import { connection } from "../models/dbModels.js";
import { checkRecruiterFeature } from "../middleware/checkRecruiterFeature.js";
import {
  findCandidatesByJD,
  findCandidatesByFilter,
} from "../controllers/recruiter.controller.js";

const router = express.Router();

// AI JD-based candidate search (POST with JD text + filters)
router.post("/find-candidates", authenticateToken, checkRecruiterFeature("find_candidates"), findCandidatesByJD);

// Filter-only candidate search (GET with query params)
router.get("/find-candidates", authenticateToken, checkRecruiterFeature("find_candidates"), findCandidatesByFilter);

// Get recruiter's active feature access permissions status
router.get("/features", authenticateToken, async (req, res) => {
  try {
    const [rows] = await connection.promise().query(
      "SELECT * FROM recruiter_features WHERE recruiter_id = ? LIMIT 1",
      [req.id]
    );
    let features = rows[0];
    if (!features) {
      await connection.promise().query("INSERT INTO recruiter_features (recruiter_id) VALUES (?)", [req.id]);
      features = {
        chat_status: "not_requested",
        nova_status: "not_requested",
        find_candidates_status: "not_requested"
      };
    }
    res.json({ success: true, features });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Request access permission for a restricted feature
router.post("/features/request", authenticateToken, async (req, res) => {
  try {
    const { feature } = req.body; // 'chat', 'nova', 'find_candidates'
    if (!["chat", "nova", "find_candidates"].includes(feature)) {
      return res.status(400).json({ success: false, message: "Invalid feature name" });
    }
    const field = `${feature}_status`;
    await connection.promise().query(
      `UPDATE recruiter_features SET ${field} = 'pending' WHERE recruiter_id = ?`,
      [req.id]
    );
    
    // Log action
    await connection.promise().query(
      "INSERT INTO recruiter_action_logs (recruiter_id, action_type, details) VALUES (?, 'FEATURE_ACCESS_REQUEST', ?)",
      [req.id, `Requested access permission for feature: ${feature}`]
    );

    res.json({ success: true, message: `Access request for ${feature} submitted successfully` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
