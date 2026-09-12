import { ConversationModel, MessageModel, connection } from "../models/dbModels.js";
import { Application } from "../models/application.model.js";
import { Job } from "../models/job.model.js";
import { User } from "../models/user.model.js";
import { Notification } from "../models/notification.model.js";

const formatConversation = (row, viewerId) => {
  if (!row) return null;
  const iAmOne = String(row.userOneId) === String(viewerId);
  return {
    _id: String(row.id),
    id: String(row.id),
    type: row.type,
    jobId: row.jobId ? String(row.jobId) : null,
    jobTitle: row.jobTitle || null,
    jobCode: row.jobCode || null,
    status: row.status,
    lastMessage: row.lastMessage,
    lastMessageAt: row.lastMessageAt,
    createdAt: row.created_at,
    unreadCount: row.unreadCount || 0,
    otherParticipant: {
      _id: String(iAmOne ? row.userTwoId : row.userOneId),
      fullname: iAmOne ? row.userTwoName : row.userOneName,
      profilePhoto: iAmOne ? row.userTwoPhoto : row.userOnePhoto,
      role: iAmOne ? row.userTwoRole : row.userOneRole,
    },
    iInitiated: iAmOne,
  };
};

const formatMessage = (row) => ({
  _id: String(row.id),
  id: String(row.id),
  conversationId: String(row.conversationId),
  senderId: String(row.senderId),
  senderName: row.senderName,
  senderPhoto: row.senderPhoto,
  message: row.message,
  attachmentUrl: row.attachmentUrl || null,
  attachmentType: row.attachmentType || null,
  attachmentName: row.attachmentName || null,
  createdAt: row.created_at,
  readAt: row.readAt,
});

/* Candidate -> Recruiter: request a chat after applying to a job */
export const requestCandidateChat = async (req, res) => {
  try {
    const candidateId = req.id;
    const { jobId } = req.body;
    if (!jobId) return res.status(400).json({ success: false, message: "jobId is required" });

    const application = await Application.findOne({ job: jobId, applicant: candidateId });
    if (!application) {
      return res.status(403).json({ success: false, message: "You can only chat with a recruiter after applying to their job" });
    }

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ success: false, message: "Job not found" });
    const recruiterId = job.created_by;

    const existing = await ConversationModel.findAnyBetweenUsers({
      type: "candidate_recruiter", userOneId: candidateId, userTwoId: recruiterId,
    });
    if (existing) {
      if (Number(existing.jobId) !== Number(jobId)) {
        await connection.promise().query(
          `UPDATE conversations SET jobId = ?, applicationId = ? WHERE id = ?`,
          [jobId, application.id || application._id, existing.id]
        );
      }
      return res.json({ success: true, message: "Chat request already exists", conversation: formatConversation(await ConversationModel.findById(existing.id), candidateId) });
    }

    const conversation = await ConversationModel.create({
      type: "candidate_recruiter",
      jobId,
      applicationId: application.id || application._id,
      userOneId: candidateId,
      userTwoId: recruiterId,
      status: "pending",
    });

    // Only create notification if recruiter has approved chat panel access
    const [featRows] = await connection.promise().query(
      "SELECT chat_status FROM recruiter_features WHERE recruiter_id = ? LIMIT 1",
      [recruiterId]
    );
    const hasChatAccess = featRows[0]?.chat_status === "approved";

    if (hasChatAccess) {
      const candidate = await User.findById(candidateId);
      await Notification.create({
        recipient: recruiterId,
        title: "New chat request",
        body: `${candidate?.fullname || "A candidate"} wants to chat about "${job.title}"`,
        type: "chat_request",
        priority: "medium",
      });
    }

    const io = req.app.get("io");
    if (io) {
      io.to(`user:${recruiterId}`).emit("conversation_updated", {
        conversationId: String(conversation.id || conversation._id),
      });
    }

    return res.status(201).json({ success: true, conversation: formatConversation(conversation, candidateId) });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/* Recruiter accepts/rejects a candidate's chat request */
export const respondToChatRequest = async (req, res) => {
  try {
    const recruiterId = req.id;
    const { action } = req.body; // "accept" | "reject"
    const conversation = await ConversationModel.findById(req.params.id);
    if (!conversation) return res.status(404).json({ success: false, message: "Conversation not found" });
    if (String(conversation.userTwoId) !== String(recruiterId)) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    const updated = await ConversationModel.updateStatus(conversation.id, action === "accept" ? "accepted" : "rejected");

    if (action === "accept") {
      await Notification.create({
        recipient: conversation.userOneId,
        title: "Chat request accepted",
        body: `The recruiter accepted your chat request for "${conversation.jobTitle || "the job"}"`,
        type: "chat_request",
        priority: "medium",
      });
    }

    return res.json({ success: true, conversation: formatConversation(updated, recruiterId) });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/* Recruiter -> Admin: start (or resume) a support chat, only once approved */
export const startRecruiterAdminChat = async (req, res) => {
  try {
    const recruiterId = req.id;
    const recruiter = await User.findById(recruiterId);
    if (recruiter?.verificationStatus !== "approved") {
      return res.status(403).json({ success: false, message: "You can chat with our team once your company is verified" });
    }

    const admins = await User.find({ role: "Admin" });
    if (!admins || admins.length === 0) {
      return res.status(503).json({ success: false, message: "No admin is available right now" });
    }
    const adminId = admins[0].id || admins[0]._id;

    let conversation = await ConversationModel.findExisting({
      type: "recruiter_admin", jobId: null, userOneId: recruiterId, userTwoId: adminId,
    });
    if (!conversation) {
      conversation = await ConversationModel.create({
        type: "recruiter_admin",
        userOneId: recruiterId,
        userTwoId: adminId,
        status: "accepted",
      });
      await Notification.create({
        recipient: adminId,
        title: "New recruiter conversation",
        body: `${recruiter?.fullname || "A recruiter"} started a support chat`,
        type: "chat_request",
        priority: "low",
      });
    } else {
      conversation = await ConversationModel.findById(conversation.id);
    }

    return res.json({ success: true, conversation: formatConversation(conversation, recruiterId) });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/* Recruiter -> Candidate: start (or resume) a chat directly */
export const startRecruiterCandidateChat = async (req, res) => {
  try {
    const recruiterId = req.id;
    const { candidateId } = req.body;
    if (!candidateId) {
      return res.status(400).json({ success: false, message: "candidateId is required" });
    }

    const recruiter = await User.findById(recruiterId);
    console.log("DEBUG: startRecruiterCandidateChat - recruiterId:", recruiterId, "role:", recruiter?.role, "candidateId:", candidateId);
    if (recruiter?.role !== "Recruiter") {
      return res.status(403).json({ success: false, message: "Only recruiters can initiate chats with candidates" });
    }

    const candidate = await User.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({ success: false, message: "Candidate not found" });
    }

    // Check if any existing candidate_recruiter chat exists between them (in either direction, ignoring jobId)
    let conversation = await ConversationModel.findAnyBetweenUsers({
      type: "candidate_recruiter", userOneId: recruiterId, userTwoId: candidateId,
    });

    if (!conversation) {
      conversation = await ConversationModel.create({
        type: "candidate_recruiter",
        userOneId: recruiterId,
        userTwoId: candidateId,
        status: "accepted",
      });
      
      await Notification.create({
        recipient: candidateId,
        title: "Recruiter initiated a chat",
        body: `${recruiter?.fullname || "A recruiter"} has initiated a conversation with you`,
        type: "message",
        priority: "medium",
      });
    } else {
      if (conversation.status !== "accepted") {
        conversation = await ConversationModel.updateStatus(conversation.id, "accepted");
      } else {
        conversation = await ConversationModel.findById(conversation.id);
      }
    }

    const io = req.app.get("io");
    if (io) {
      io.to(`user:${candidateId}`).emit("conversation_updated", {
        conversationId: String(conversation.id || conversation._id),
      });
      io.to(`user:${recruiterId}`).emit("conversation_updated", {
        conversationId: String(conversation.id || conversation._id),
      });
    }

    return res.json({ success: true, conversation: formatConversation(conversation, recruiterId) });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


export const getMyConversations = async (req, res) => {
  try {
    const userId = req.id;
    const user = await User.findById(userId);
    const rows = await ConversationModel.findForUser(userId);

    if (user && user.role === "Admin") {
      const recruiters = await User.find({ role: "Recruiter" });

      const existingConversationsByRecruiter = new Map();
      rows.forEach(row => {
        if (row.type === "recruiter_admin") {
          const otherId = String(row.userOneId) === String(userId) ? String(row.userTwoId) : String(row.userOneId);
          existingConversationsByRecruiter.set(otherId, row);
        }
      });

      const synthesized = [];
      for (const rec of recruiters) {
        const recIdStr = String(rec.id || rec._id);
        const existing = existingConversationsByRecruiter.get(recIdStr);
        if (existing) {
          synthesized.push(formatConversation(existing, userId));
        } else {
          synthesized.push({
            _id: `virtual_${recIdStr}`,
            id: `virtual_${recIdStr}`,
            type: "recruiter_admin",
            jobId: null,
            jobTitle: null,
            jobCode: null,
            status: "accepted",
            lastMessage: "No messages yet",
            lastMessageAt: null,
            createdAt: new Date(),
            unreadCount: 0,
            otherParticipant: {
              _id: recIdStr,
              fullname: rec.fullname,
              profilePhoto: rec.profilePhoto,
              role: "Recruiter",
            },
            iInitiated: true,
            isVirtual: true,
          });
        }
      }

      // Add non-recruiter_admin conversations
      rows.forEach(row => {
        if (row.type !== "recruiter_admin") {
          synthesized.push(formatConversation(row, userId));
        }
      });

      return res.json({ success: true, conversations: synthesized });
    }

    return res.json({ success: true, conversations: rows.map((r) => formatConversation(r, userId)) });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const assertParticipant = (conversation, userId) => {
  return String(conversation.userOneId) === String(userId) || String(conversation.userTwoId) === String(userId);
};

export const getMessages = async (req, res) => {
  try {
    const userId = req.id;
    const conversationId = req.params.id;

    if (String(conversationId).startsWith("virtual_")) {
      const recruiterId = conversationId.replace("virtual_", "");
      const recruiter = await User.findById(recruiterId);
      if (!recruiter) {
        return res.status(404).json({ success: false, message: "Recruiter not found" });
      }
      return res.json({
        success: true,
        messages: [],
        conversation: {
          _id: conversationId,
          id: conversationId,
          type: "recruiter_admin",
          jobId: null,
          status: "accepted",
          lastMessage: "No messages yet",
          unreadCount: 0,
          otherParticipant: {
            _id: String(recruiter.id || recruiter._id),
            fullname: recruiter.fullname,
            profilePhoto: recruiter.profilePhoto,
            role: "Recruiter",
          },
          iInitiated: true,
          isVirtual: true
        }
      });
    }

    const conversation = await ConversationModel.findById(conversationId);
    if (!conversation || !assertParticipant(conversation, userId)) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }
    const rows = await MessageModel.findByConversation(conversation.id);
    await MessageModel.markRead(conversation.id, userId);

    const io = req.app.get("io");
    if (io) {
      // Tell both sides in the conversation room that messages were read
      io.to(`conversation:${conversation.id}`).emit("messages_read", {
        conversationId: String(conversation.id),
        readerId: String(userId),
      });
      // Also emit conversation_updated to the READER's own personal room
      // so their Navbar badge and sidebar unread count refresh immediately
      io.to(`user:${userId}`).emit("conversation_updated", {
        conversationId: String(conversation.id),
      });
      // Notify the other participant too (their read-receipt ticks update)
      const otherId =
        String(conversation.userOneId) === String(userId)
          ? conversation.userTwoId
          : conversation.userOneId;
      io.to(`user:${otherId}`).emit("conversation_updated", {
        conversationId: String(conversation.id),
      });
    }

    return res.json({ success: true, messages: rows.map(formatMessage), conversation: formatConversation(conversation, userId) });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Exported so the Socket.IO layer can reuse the exact same persistence + auth rules.
export const persistMessage = async ({ conversationId, senderId, message, attachmentUrl, attachmentType, attachmentName }) => {
  let conversation;
  let finalConversationId = conversationId;

  if (String(conversationId).startsWith("virtual_")) {
    const recruiterId = conversationId.replace("virtual_", "");
    let existing = await ConversationModel.findExisting({
      type: "recruiter_admin", jobId: null, userOneId: recruiterId, userTwoId: senderId,
    });
    if (!existing) {
      existing = await ConversationModel.create({
        type: "recruiter_admin",
        userOneId: recruiterId,
        userTwoId: senderId,
        status: "accepted",
      });
    }
    conversation = await ConversationModel.findById(existing.id);
    finalConversationId = conversation.id;
  } else {
    conversation = await ConversationModel.findById(conversationId);
  }

  if (!conversation) throw new Error("Conversation not found");
  if (!assertParticipant(conversation, senderId)) throw new Error("Not authorized");
  if (conversation.status !== "accepted") throw new Error("This chat request hasn't been accepted yet");
  if (!message?.trim() && !attachmentUrl) throw new Error("Message cannot be empty");

  const saved = await MessageModel.create({ conversationId: finalConversationId, senderId, message: message || "", attachmentUrl, attachmentType, attachmentName });
  await ConversationModel.touchLastMessage(finalConversationId, message?.trim() ? message : attachmentType === "image" ? "📷 Photo" : "📎 Attachment");

  const recipientId = String(conversation.userOneId) === String(senderId) ? conversation.userTwoId : conversation.userOneId;
  await Notification.create({
    recipient: recipientId,
    title: "New message",
    body: message?.trim() ? (message.length > 80 ? message.slice(0, 77) + "..." : message) : "Sent an attachment",
    type: "message",
    priority: "low",
  });

  return { message: formatMessage(saved), conversation, recipientId };
};

export const sendMessage = async (req, res) => {
  try {
    const userId = req.id;
    const { message } = req.body;
    const file = req.file;
    if ((!message || !message.trim()) && !file) {
      return res.status(400).json({ success: false, message: "Message cannot be empty" });
    }

    let attachmentUrl, attachmentType, attachmentName;
    if (file) {
      attachmentUrl = `/uploads/${file.filename}`;
      attachmentType = file.mimetype.startsWith("image/") ? "image" : "file";
      attachmentName = file.originalname;
    }

    const { message: saved, conversation, recipientId } = await persistMessage({
      conversationId: req.params.id, senderId: userId, message: message?.trim(), attachmentUrl, attachmentType, attachmentName,
    });

    const io = req.app.get("io");
    if (io) {
      // Broadcast new message to everyone in the conversation room (sender + recipient)
      io.to(`conversation:${req.params.id}`).emit("new_message", saved);
      
      // If it was virtual, also broadcast to the new real conversation room
      if (req.params.id !== String(conversation.id)) {
        io.to(`conversation:${conversation.id}`).emit("new_message", saved);
      }
      
      // Push conversation_updated to the recipient's personal room
      io.to(`user:${recipientId}`).emit("conversation_updated", { conversationId: String(conversation.id) });
      // Also push to the sender's personal room so their own sidebar refreshes
      io.to(`user:${userId}`).emit("conversation_updated", { conversationId: String(conversation.id) });
    }

    return res.status(201).json({ success: true, message: saved, conversationId: String(conversation.id) });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ success: false, message: error.message || "Could not send message" });
  }
};
