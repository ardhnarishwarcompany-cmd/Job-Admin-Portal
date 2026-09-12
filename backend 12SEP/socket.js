import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { ConversationModel } from "./models/dbModels.js";
import { persistMessage } from "./controllers/chat.controller.js";

const parseCookies = (cookieHeader = "") =>
  Object.fromEntries(
    cookieHeader
      .split(";")
      .map((p) => p.trim())
      .filter(Boolean)
      .map((p) => {
        const idx = p.indexOf("=");
        return [decodeURIComponent(p.slice(0, idx)), decodeURIComponent(p.slice(idx + 1))];
      })
  );

export const initSocket = (server, corsOptions) => {
  const io = new Server(server, {
    cors: corsOptions,
  });

  io.use((socket, next) => {
    try {
      const cookies = parseCookies(socket.handshake.headers.cookie);
      const token = cookies.token;
      if (!token) return next(new Error("Unauthorized"));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = String(decoded.userId);
      next();
    } catch (err) {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    // Personal room — lets the server push notifications/updates to a user regardless
    // of which conversation window (if any) they currently have open.
    socket.join(`user:${socket.userId}`);

    socket.on("join_conversation", async (conversationId) => {
      try {
        if (String(conversationId).startsWith("virtual_")) {
          socket.join(`conversation:${conversationId}`);
          return;
        }
        const conversation = await ConversationModel.findById(conversationId);
        if (!conversation) return;
        const isParticipant =
          String(conversation.userOneId) === socket.userId || String(conversation.userTwoId) === socket.userId;
        if (!isParticipant) return;
        socket.join(`conversation:${conversationId}`);
      } catch (err) {
        // ignore — silently refuse to join on any error
      }
    });

    socket.on("leave_conversation", (conversationId) => {
      socket.leave(`conversation:${conversationId}`);
    });

    socket.on("send_message", async ({ conversationId, message }, ack) => {
      try {
        if (!message || !message.trim()) return ack?.({ success: false, message: "Empty message" });
        const { message: saved, conversation, recipientId } = await persistMessage({
          conversationId, senderId: socket.userId, message: message.trim(),
        });
        
        io.to(`conversation:${conversationId}`).emit("new_message", saved);
        if (conversationId !== String(conversation.id)) {
          io.to(`conversation:${conversation.id}`).emit("new_message", saved);
        }
        
        io.to(`user:${recipientId}`).emit("conversation_updated", { conversationId: String(conversation.id) });
        io.to(`user:${socket.userId}`).emit("conversation_updated", { conversationId: String(conversation.id) });
        
        ack?.({ success: true, message: saved, conversationId: String(conversation.id) });
      } catch (err) {
        ack?.({ success: false, message: err.message || "Could not send message" });
      }
    });

    socket.on("typing", ({ conversationId, isTyping }) => {
      socket.to(`conversation:${conversationId}`).emit("typing", { conversationId, userId: socket.userId, isTyping });
    });
  });

  return io;
};
