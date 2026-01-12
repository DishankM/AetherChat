import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Message from "../models/Message.js";
import Conversation from "../models/Conversation.js";
import groqService from "../services/groqService.js";

// userId => Set(socketIds)
const onlineUsers = new Map();

export const initializeSocketHandlers = (io) => {
  // 🔐 Socket authentication
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) throw new Error("No token");

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "your_jwt_secret"
      );

      const user = await User.findById(decoded.userId);
      if (!user) throw new Error("User not found");

      socket.user = user;
      next();
    } catch (err) {
      console.error("Socket auth error:", err.message);
      next(new Error("Authentication failed"));
    }
  });

  io.on("connection", async (socket) => {
    const userId = socket.user._id.toString();
    console.log(`🟢 User connected: ${socket.user.username}`);

    // Track sockets per user
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId).add(socket.id);

    await User.findByIdAndUpdate(userId, {
      isOnline: true,
      lastSeen: new Date()
    });

    socket.join(`user_${userId}`);
    broadcastStatus(io, userId, true);

    // ======================
    // Conversation handlers
    // ======================

    socket.on("join_conversation", (conversationId) => {
      socket.join(`conversation_${conversationId}`);
    });

    socket.on("leave_conversation", (conversationId) => {
      socket.leave(`conversation_${conversationId}`);
    });

    // ======================
    // Messaging
    // ======================

    socket.on("send_message", async ({ conversationId, text }) => {
      try {
        const message = await Message.create({
          conversationId,
          sender: userId,
          text,
          messageType: "text"
        });

        await message.populate("sender", "username avatar");

        io.to(`conversation_${conversationId}`).emit(
          "receive_message",
          message
        );
      } catch (err) {
        console.error("Send message error:", err);
      }
    });

    // ======================
    // AI Chat
    // ======================

    socket.on("ask_ai", async ({ conversationId, text }) => {
      if (!text?.trim()) return;

      try {
        io.to(`conversation_${conversationId}`).emit("ai_thinking", {
          isThinking: true
        });

        const contextMessages = await Message.find({
          conversationId,
          messageType: "text"
        })
          .sort({ createdAt: -1 })
          .limit(10)
          .lean();

        const aiReply = await groqService.getChatCompletion(
          text,
          contextMessages
        );

        const aiMessage = await Message.create({
          conversationId,
          sender: userId,
          text: aiReply,
          messageType: "ai_response",
          aiContext: text
        });

        await aiMessage.populate("sender", "username avatar");

        io.to(`conversation_${conversationId}`).emit(
          "receive_message",
          aiMessage
        );
      } catch (err) {
        console.error("AI error:", err);
      } finally {
        io.to(`conversation_${conversationId}`).emit("ai_thinking", {
          isThinking: false
        });
      }
    });

    // ======================
    // Typing indicator
    // ======================

    socket.on("typing_start", ({ conversationId }) => {
      socket.to(`conversation_${conversationId}`).emit("user_typing", {
        userId,
        username: socket.user.username,
        isTyping: true
      });
    });

    socket.on("typing_stop", ({ conversationId }) => {
      socket.to(`conversation_${conversationId}`).emit("user_typing", {
        userId,
        username: socket.user.username,
        isTyping: false
      });
    });

    // ======================
    // Disconnect
    // ======================

    socket.on("disconnect", async () => {
      console.log(`🔴 User disconnected: ${socket.user.username}`);

      const sockets = onlineUsers.get(userId);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          onlineUsers.delete(userId);
          await User.findByIdAndUpdate(userId, {
            isOnline: false,
            lastSeen: new Date()
          });
          broadcastStatus(io, userId, false);
        }
      }
    });
  });
};

// 🔁 Online status broadcast
async function broadcastStatus(io, userId, isOnline) {
  const conversations = await Conversation.find({
    participants: userId,
    isAIContact: false
  });

  conversations.forEach((conv) => {
    conv.participants.forEach((pid) => {
      if (pid.toString() !== userId) {
        io.to(`user_${pid}`).emit("user_status", {
          userId,
          isOnline,
          lastSeen: new Date()
        });
      }
    });
  });
}
