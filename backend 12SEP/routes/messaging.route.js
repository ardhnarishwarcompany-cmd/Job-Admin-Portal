import express from "express";
import authenticateToken from "../middleware/isAuthenticated.js";
import { chatAttachmentUpload } from "../middleware/multer.js";
import { checkRecruiterFeature } from "../middleware/checkRecruiterFeature.js";
import {
  requestCandidateChat,
  respondToChatRequest,
  startRecruiterAdminChat,
  startRecruiterCandidateChat,
  getMyConversations,
  getMessages,
  sendMessage,
} from "../controllers/chat.controller.js";

const router = express.Router();

// Guard chat features for recruiter role
router.use(authenticateToken);

// Exclude conversations list route from feature block to allow navbar unread badge check
router.get("/conversations", getMyConversations);
router.post("/request", requestCandidateChat);

// Apply feature guard to all other chat/message endpoints
router.use(checkRecruiterFeature("chat"));
router.put("/:id/respond", respondToChatRequest);
router.post("/recruiter-admin/start", startRecruiterAdminChat);
router.post("/recruiter-candidate/start", startRecruiterCandidateChat);
router.get("/:id/messages", getMessages);
router.post("/:id/messages", chatAttachmentUpload, sendMessage);

export default router;
