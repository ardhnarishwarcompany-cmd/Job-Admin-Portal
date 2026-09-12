import express from "express";
import {
  register,
  login,
  logout,
  updateProfile,
  sendEmailOtp,
  verifyEmailOtp,
  sendLoginOtp,
  verifyLoginOtp,
  toggleSavedJob,
  getSavedJobs,
  forgotPassword,
  resetPassword,
  getProfile,
} from "../controllers/user.controller.js";

import authenticateToken from "../middleware/isAuthenticated.js";
import { singleUpload, multiUpload } from "../middleware/multer.js";

const router = express.Router();

router.post("/register", multiUpload, register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/profile/update", authenticateToken, multiUpload, updateProfile);
router.get("/profile", getProfile);
router.post("/otp/email/send", sendEmailOtp);
router.post("/otp/email/verify", verifyEmailOtp);
router.post("/otp/login/send", sendLoginOtp);
router.post("/otp/login/verify", verifyLoginOtp);
router.post("/saved-jobs/:id", authenticateToken, toggleSavedJob);
router.get("/saved-jobs", authenticateToken, getSavedJobs);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

export default router;