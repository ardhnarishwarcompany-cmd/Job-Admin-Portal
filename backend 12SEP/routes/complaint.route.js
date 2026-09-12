import express from "express";
import authenticateToken from "../middleware/isAuthenticated.js";
import {
  submitComplaint,
  getMyComplaints,
  getAllComplaints,
  updateComplaintStatus,
  getComplaintStats,
} from "../controllers/complaint.controller.js";

const router = express.Router();

// Candidate / Recruiter routes
router.post("/submit", authenticateToken, submitComplaint);
router.get("/my", authenticateToken, getMyComplaints);

// Admin routes
router.get("/all", authenticateToken, getAllComplaints);
router.get("/stats", authenticateToken, getComplaintStats);
router.put("/:id/status", authenticateToken, updateComplaintStatus);

export default router;
