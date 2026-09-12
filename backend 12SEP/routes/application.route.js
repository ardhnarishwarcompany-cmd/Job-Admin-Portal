import express from "express";
import { singleUpload, applicationUpload } from "../middleware/multer.js";
import authenticateToken from "../middleware/isAuthenticated.js";
import {
  applyJob,
  getApplicants,
  getAppliedJobs,
  getApplicationsForRecruiter,
  requestInterviewSchedule,
  updateInterviewScheduleStatus,
  updateStatus,
} from "../controllers/application.controller.js";

const router = express.Router();

router.route("/apply/:id").post(authenticateToken, applicationUpload, applyJob);
router.route("/get").get(authenticateToken, getAppliedJobs);
router.route("/interview/request/:id").post(authenticateToken, requestInterviewSchedule);
router.route("/interview/status/:id").post(authenticateToken, updateInterviewScheduleStatus);
router.route("/:id/applicants").get(authenticateToken, getApplicants);
router.route("/status/:id/update").post(authenticateToken, updateStatus);
router.route("/recruiter/applications").get(authenticateToken, getApplicationsForRecruiter);

export default router;
