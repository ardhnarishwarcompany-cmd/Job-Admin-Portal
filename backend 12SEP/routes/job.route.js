import express from "express";

import authenticateToken from "../middleware/isAuthenticated.js";
import { singleUpload } from "../middleware/multer.js";
import {
  getAdminJobs,
  getAllJobs,
  getJobById,
  postJob,
  updateJob,
  deleteJob,
  closeJob,
  requestReopenJob,
} from "../controllers/job.controller.js";

const router = express.Router();

router.route("/post").post(authenticateToken, singleUpload, postJob);
router.route("/get").get(getAllJobs);
router.route("/getadminjobs").get(authenticateToken, getAdminJobs);
router.route("/get/:id").get(getJobById);
router.route("/update/:id").put(authenticateToken, singleUpload, updateJob);
router.route("/delete/:id").delete(authenticateToken, deleteJob);
router.route("/close/:id").put(authenticateToken, closeJob);
router.route("/reopen-request/:id").post(authenticateToken, requestReopenJob);
export default router;
