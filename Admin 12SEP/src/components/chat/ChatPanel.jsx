import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import { getFileUrl } from "@/utils/data";
import {
  Send, MessageCircle, Loader2, Check, CheckCheck, X, Clock, Briefcase,
  ShieldCheck, Paperclip, FileText, WifiOff, ArrowLeft, ChevronRight,
} from "lucide-react";
import { MESSAGING_API_ENDPOINT } from "@/utils/data";
import { getSocket } from "@/utils/socket";
import { useLocation, useNavigate } from "react-router-dom";

/* ─── Helpers ─────────────────────────────────────────────────────────────── */
const timeAgo = (dateStr) => {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

const messageTime = (dateStr) => {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const dateLabel = (dateStr) => {
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const sameDay = (a, b) => a.toDateString() === b.toDateString();
  if (sameDay(d, today)) return "Today";
  if (sameDay(d, yesterday)) return "Yesterday";
  return d.toLocaleDateString([], {
    day: "numeric",
    month: "short",
    year: d.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
  });
};

const avatarUrl = (photo) => {
  if (!photo) return null;
  return getFileUrl(photo);
};

const MAX_MB = 10;

/* ─── Reusable Avatar ─────────────────────────────────────────────────────── */
const Avatar = ({ photo, name, size = "md" }) => {
  const sizeClass =
    size === "sm" ? "h-8 w-8 text-xs" : size === "lg" ? "h-12 w-12 text-base" : "h-10 w-10 text-sm";
  const url = avatarUrl(photo);
  if (url) {
    return (
      <img src={url} alt={name}
        className={`${sizeClass} flex-shrink-0 rounded-full object-cover ring-2 ring-white`} />
    );
  }
  return (
    <div className={`${sizeClass} flex flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 font-bold text-white`}>
      {name?.[0]?.toUpperCase() || "?"}
    </div>
  );
};

/* ─── Typing Bubble ───────────────────────────────────────────────────────── */
const TypingBubble = () => (
  <div className="flex justify-start">
    <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-white px-4 py-3 shadow-sm border border-slate-100">
      {[0, 1, 2].map((i) => (
        <motion.span key={i} className="h-2 w-2 rounded-full bg-slate-400"
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.18 }} />
      ))}
    </div>
  </div>
);

/* ─── ChatPanel ───────────────────────────────────────────────────────────── */
const ChatPanel = ({
  emptyStateLabel = "Select a conversation to start chatting",
  headerAction,
}) => {
  const { user } = useSelector((store) => store.auth);
  const myId = String(user?._id || user?.id || "");

  const location = useLocation();
  const navigate = useNavigate();
  const initialSelectId = location.state?.selectConversationId ? String(location.state.selectConversationId) : null;

  const [conversations, setConversations] = useState([]);
  const [loadingConvos, setLoadingConvos] = useState(true);
  const [selectedId, setSelectedId] = useState(initialSelectId);
  const [activeTab, setActiveTab] = useState("candidates"); // "candidates" | "support"

  useEffect(() => {
    if (location.state?.selectConversationId) {
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [attachment, setAttachment] = useState(null);
  const [otherTyping, setOtherTyping] = useState(false);
  const [connected, setConnected] = useState(true);
  const [mobileView, setMobileView] = useState("list"); // "list" | "thread"

  const bottomRef = useRef(null);
  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  /**
   * KEY FIX: tracks IDs of every message already in state.
   * When we send via HTTP POST we register the returned ID here BEFORE
   * the socket broadcast arrives, so the socket handler skips it.
   * Recipients see real-time updates because their set doesn't contain the ID.
   */
  const messageIdsRef = useRef(new Set());

  const selected = conversations.find((c) => String(c._id) === String(selectedId)) || null;

  useEffect(() => {
    if (selected && user?.role === "Recruiter") {
      if (selected.type === "recruiter_admin") {
        setActiveTab("support");
      } else {
        setActiveTab("candidates");
      }
    }
  }, [selectedId, selected, user?.role]);

  const filteredConversations = conversations.filter((c) => {
    if (user?.role === "Recruiter") {
      if (activeTab === "candidates") {
        return c.type === "candidate_recruiter";
      } else {
        return c.type === "recruiter_admin";
      }
    } else if (user?.role === "Admin") {
      return c.type === "recruiter_admin";
    } else {
      return c.type === "candidate_recruiter";
    }
  });

  /* ── Fetch conversations ── */
  const fetchConversations = useCallback(async (silent = true) => {
    try {
      const res = await axios.get(`${MESSAGING_API_ENDPOINT}/conversations`, { withCredentials: true });
      if (res.data.success) setConversations(res.data.conversations);
    } catch { /* silent */ } finally {
      if (!silent) setLoadingConvos(false);
    }
  }, []);

  /* ── Fetch messages for current conversation (silent background refresh) ── */
  const selectedIdRef = useRef(null);
  selectedIdRef.current = selectedId;

  const refreshMessages = useCallback(async (convId) => {
    if (!convId) return;
    try {
      const res = await axios.get(`${MESSAGING_API_ENDPOINT}/${convId}/messages`, { withCredentials: true });
      if (res.data.success && convId === selectedIdRef.current) {
        const msgs = res.data.messages;
        // Add any new messages we don't yet have (safe merge)
        msgs.forEach((m) => messageIdsRef.current.add(String(m._id || m.id)));
        setMessages(msgs);
      }
    } catch { /* silent */ }
  }, []);

  /* ── Socket lifecycle + polling fallback for conversations ── */
  useEffect(() => {
    fetchConversations(false);
    const socket = getSocket();
    socketRef.current = socket;

    const onUpdated = () => fetchConversations();
    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);

    socket.on("conversation_updated", onUpdated);
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    setConnected(socket.connected);

    // Polling fallback: refresh conversation list every 8 seconds
    const convoPollInterval = setInterval(() => fetchConversations(), 8000);

    return () => {
      socket.off("conversation_updated", onUpdated);
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      clearInterval(convoPollInterval);
    };
  }, [fetchConversations]);

  /* ── Load messages + room listeners + polling on selectedId change ── */
  useEffect(() => {
    if (!selectedId) return;
    const socket = socketRef.current;
    messageIdsRef.current = new Set(); // reset for new conversation

    // Immediately zero out this conversation's unread count in local state
    // so the sidebar badge clears without waiting for the server response
    setConversations((prev) =>
      prev.map((c) => (String(c._id) === String(selectedId) ? { ...c, unreadCount: 0 } : c))
    );

    setLoadingMessages(true);
    setOtherTyping(false);

    // Initial load
    axios
      .get(`${MESSAGING_API_ENDPOINT}/${selectedId}/messages`, { withCredentials: true })
      .then((res) => {
        if (res.data.success) {
          const msgs = res.data.messages;
          msgs.forEach((m) => messageIdsRef.current.add(String(m._id || m.id)));
          setMessages(msgs);
        }
      })
      .finally(() => setLoadingMessages(false));

    socket?.emit("join_conversation", selectedId);

    /* Real-time: new message from socket */
    const onNewMessage = (msg) => {
      if (String(msg.conversationId) !== String(selectedId)) return;
      const msgId = String(msg._id || msg.id);
      if (messageIdsRef.current.has(msgId)) return; // already have it
      messageIdsRef.current.add(msgId);
      setOtherTyping(false);
      setMessages((prev) => [...prev, msg]);
      // Clear unread for this convo immediately when we receive a message (we're viewing it)
      setConversations((prev) =>
        prev.map((c) => (String(c._id) === String(selectedId) ? { ...c, unreadCount: 0, lastMessage: msg.message || "📎 Attachment", lastMessageAt: msg.createdAt } : c))
      );
    };

    /* Real-time: read receipts */
    const onMessagesRead = ({ conversationId, readerId }) => {
      if (String(conversationId) !== String(selectedId)) return;
      if (String(readerId) === myId) return;
      setMessages((prev) =>
        prev.map((m) =>
          String(m.senderId) === myId ? { ...m, readAt: m.readAt || new Date().toISOString() } : m
        )
      );
    };

    /* Real-time: typing */
    const onTyping = ({ conversationId, userId, isTyping }) => {
      if (String(conversationId) !== String(selectedId)) return;
      if (String(userId) === myId) return;
      setOtherTyping(isTyping);
    };

    socket?.on("new_message", onNewMessage);
    socket?.on("messages_read", onMessagesRead);
    socket?.on("typing", onTyping);

    // Polling fallback: re-fetch messages every 4 seconds in case socket misses anything
    const msgPollInterval = setInterval(() => refreshMessages(selectedId), 4000);

    return () => {
      socket?.emit("leave_conversation", selectedId);
      socket?.off("new_message", onNewMessage);
      socket?.off("messages_read", onMessagesRead);
      socket?.off("typing", onTyping);
      clearInterval(msgPollInterval);
    };
  }, [selectedId, myId, fetchConversations, refreshMessages]);

  /* ── Auto-scroll ── */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, otherTyping]);

  /* ── Typing emit ── */
  const emitTyping = useCallback((isTyping) => {
    if (!selectedId || !socketRef.current) return;
    socketRef.current.emit("typing", { conversationId: selectedId, isTyping });
  }, [selectedId]);

  const handleInputChange = (e) => {
    setInput(e.target.value);
    if (!selected || selected.status !== "accepted") return;
    emitTyping(true);
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => emitTyping(false), 1500);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + "px";
    }
  };

  /* ── File attachment ── */
  const pickAttachment = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > MAX_MB * 1024 * 1024) { toast.error(`File must be under ${MAX_MB}MB`); return; }
    const isImage = file.type.startsWith("image/");
    setAttachment({ file, isImage, previewUrl: isImage ? URL.createObjectURL(file) : null });
  };

  const clearAttachment = () => {
    if (attachment?.previewUrl) URL.revokeObjectURL(attachment.previewUrl);
    setAttachment(null);
  };

  /* ── Send message ── */
  const sendMessage = async () => {
    if ((!input.trim() && !attachment) || !selected) return;
    if (selected.status !== "accepted") return;

    const text = input.trim();
    const pendingAttachment = attachment;
    setInput("");
    clearAttachment();
    clearTimeout(typingTimeoutRef.current);
    emitTyping(false);
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setSending(true);

    try {
      let res;
      if (pendingAttachment) {
        const formData = new FormData();
        formData.append("message", text);
        formData.append("attachment", pendingAttachment.file);
        res = await axios.post(
          `${MESSAGING_API_ENDPOINT}/${selectedId}/messages`, formData,
          { withCredentials: true, headers: { "Content-Type": "multipart/form-data" } }
        );
      } else {
        res = await axios.post(
          `${MESSAGING_API_ENDPOINT}/${selectedId}/messages`,
          { message: text }, { withCredentials: true }
        );
      }

      if (res.data.success) {
        const savedMsg = res.data.message;
        const msgId = String(savedMsg._id || savedMsg.id);
        // Register BEFORE socket broadcast arrives — prevents duplicate
        if (!messageIdsRef.current.has(msgId)) {
          messageIdsRef.current.add(msgId);
          setMessages((prev) => [...prev, savedMsg]);
        }
        
        if (res.data.conversationId && String(res.data.conversationId) !== String(selectedId)) {
          setSelectedId(String(res.data.conversationId));
        }
        
        fetchConversations();
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not send message");
      setInput(text);
      if (pendingAttachment) setAttachment(pendingAttachment);
    } finally {
      setSending(false);
    }
  };

  /* ── Accept / Reject request ── */
  const respond = async (conversationId, action) => {
    try {
      const res = await axios.put(
        `${MESSAGING_API_ENDPOINT}/${conversationId}/respond`,
        { action }, { withCredentials: true }
      );
      if (res.data.success) {
        toast.success(action === "accept" ? "Chat request accepted" : "Chat request declined");
        fetchConversations();
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Something went wrong");
    }
  };

  /* ── Build render list (messages + date separators) ── */
  const renderItems = [];
  let lastDate = null;
  messages.forEach((m) => {
    const label = dateLabel(m.createdAt);
    if (label !== lastDate) {
      renderItems.push({ type: "date", label, key: `date-${m._id || m.id}` });
      lastDate = label;
    }
    renderItems.push({ type: "message", data: m, key: m._id || m.id });
  });

  /* ─────────────────────────────── RENDER ─────────────────────────────────── */
  return (
    <div className="flex flex-1 min-h-0 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">

      {/* ═══════════════ LEFT: Conversation List ═══════════════════════════ */}
      <div className={`flex-col border-r border-slate-100 bg-slate-50/70 w-full sm:w-80 sm:flex-shrink-0 ${mobileView === "list" ? "flex" : "hidden sm:flex"}`}>
        <div className="flex flex-shrink-0 items-center justify-between border-b border-slate-100 bg-white px-4 py-3.5 shadow-sm">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Conversations</h2>
            {!connected && (
              <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-600">
                <WifiOff className="h-3 w-3" /> Reconnecting…
              </span>
            )}
          </div>
          {headerAction}
        </div>

        {user?.role === "Recruiter" && (
          <div className="flex border-b border-slate-100 bg-white p-2 gap-1.5 flex-shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab("candidates")}
              className={`flex-1 text-center py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === "candidates"
                  ? "bg-blue-50 text-blue-600"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              Candidate Chats
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("support")}
              className={`flex-1 text-center py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === "support"
                  ? "bg-blue-50 text-blue-600"
                  : "text-slate-400 hover:text-slate-650"
              }`}
            >
              Admin Support
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {loadingConvos ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-400">
              <MessageCircle className="h-10 w-10 opacity-30" />
              <p className="text-xs font-semibold">No conversations yet</p>
            </div>
          ) : (
            filteredConversations.map((c) => (
              <button key={c._id}
                onClick={() => { setSelectedId(c._id); setMobileView("thread"); }}
                className={`flex w-full items-start gap-3 border-b border-slate-100 px-4 py-3.5 text-left transition-all duration-150 ${selectedId === c._id ? "border-l-[3px] border-l-blue-500 bg-blue-50" : "hover:bg-white"}`}>
                <div className="relative flex-shrink-0">
                  <Avatar photo={c.otherParticipant.profilePhoto} name={c.otherParticipant.fullname} />
                  {c.unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white">
                      {c.unreadCount > 9 ? "9+" : c.unreadCount}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-1">
                    <p className={`truncate text-sm ${c.unreadCount > 0 ? "font-bold text-slate-900" : "font-semibold text-slate-700"}`}>
                      {c.otherParticipant.fullname || "Unknown"}
                    </p>
                    <div className="flex flex-shrink-0 items-center gap-1">
                      {c.lastMessageAt && <span className="text-[10px] text-slate-400">{timeAgo(c.lastMessageAt)}</span>}
                      <ChevronRight className="h-3.5 w-3.5 text-slate-300 sm:hidden" />
                    </div>
                  </div>
                  {c.jobTitle && (
                    <p className="mb-0.5 flex items-center gap-1 truncate text-[11px] font-semibold text-blue-600">
                      <Briefcase className="h-2.5 w-2.5 flex-shrink-0" />{c.jobTitle}
                    </p>
                  )}
                  <p className={`truncate text-xs ${c.unreadCount > 0 ? "font-semibold text-slate-700" : "text-slate-400"}`}>
                    {c.status === "pending" ? (c.iInitiated ? "Waiting for acceptance…" : "📩 New chat request") :
                     c.status === "rejected" ? "Request declined" :
                     (c.lastMessage || "Say hello 👋")}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* ═══════════════ RIGHT: Message Thread ══════════════════════════════ */}
      <div className={`flex-col flex-1 min-w-0 ${mobileView === "thread" ? "flex" : "hidden sm:flex"}`}>
        {!selected ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-slate-50/50">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-100 to-cyan-100">
              <MessageCircle className="h-10 w-10 text-blue-400" />
            </div>
            <div className="text-center px-4">
              <p className="text-base font-bold text-slate-600">No conversation selected</p>
              <p className="mt-1 max-w-xs text-xs text-slate-400">{emptyStateLabel}</p>
            </div>
          </div>
        ) : (
          <>
            {/* Thread header */}
            <div className="flex flex-shrink-0 items-center justify-between border-b border-slate-100 bg-white px-4 py-3 shadow-sm">
              <div className="flex min-w-0 items-center gap-3">
                <button onClick={() => setMobileView("list")}
                  className="mr-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full hover:bg-slate-100 sm:hidden">
                  <ArrowLeft className="h-5 w-5 text-slate-600" />
                </button>
                <Avatar photo={selected.otherParticipant.profilePhoto} name={selected.otherParticipant.fullname} size="sm" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-900">{selected.otherParticipant.fullname}</p>
                  <p className="flex items-center gap-1 text-[11px] text-slate-400">
                    {otherTyping ? (
                      <span className="font-semibold text-blue-500">typing…</span>
                    ) : (
                      <>
                        {selected.otherParticipant.role === "Admin" && <ShieldCheck className="h-3 w-3 text-blue-500" />}
                        <span className="truncate">
                          {selected.jobTitle
                            ? `Re: ${selected.jobTitle}${selected.jobCode ? ` (${selected.jobCode})` : ""}`
                            : (selected.otherParticipant.role === "Employee" ? "Candidate" : selected.otherParticipant.role)}
                        </span>
                      </>
                    )}
                  </p>
                </div>
              </div>
              {selected.type === "candidate_recruiter" && selected.status === "pending" && !selected.iInitiated && (
                <div className="flex flex-shrink-0 gap-2">
                  <button onClick={() => respond(selected._id, "accept")} className="inline-flex items-center gap-1 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-600 transition-colors">
                    <Check className="h-3.5 w-3.5" /> Accept
                  </button>
                  <button onClick={() => respond(selected._id, "reject")} className="inline-flex items-center gap-1 rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors">
                    <X className="h-3.5 w-3.5" /> Decline
                  </button>
                </div>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4" style={{ background: "linear-gradient(180deg,#f8fafc 0%,#ffffff 100%)" }}>
              {loadingMessages ? (
                <div className="flex h-full items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <AnimatePresence initial={false}>
                    {renderItems.map((item) => {
                      if (item.type === "date") {
                        return (
                          <div key={item.key} className="my-3 flex items-center justify-center">
                            <span className="rounded-full bg-slate-200/80 px-4 py-1 text-[10px] font-bold text-slate-500">{item.label}</span>
                          </div>
                        );
                      }
                      const m = item.data;
                      const mine = String(m.senderId) === myId;
                      return (
                        <motion.div key={item.key}
                          initial={{ opacity: 0, y: 10, scale: 0.97 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ duration: 0.18, ease: "easeOut" }}
                          className={`flex items-end gap-2 ${mine ? "flex-row-reverse" : "flex-row"}`}>
                          {!mine && <Avatar photo={selected.otherParticipant.profilePhoto} name={selected.otherParticipant.fullname} size="sm" />}
                          <div className={`max-w-[70%] sm:max-w-[60%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${mine ? "rounded-br-sm bg-gradient-to-br from-blue-600 to-cyan-600 text-white" : "rounded-bl-sm bg-white text-slate-800 border border-slate-100"}`}>
                            {m.attachmentUrl && m.attachmentType === "image" && (
                              <a href={getFileUrl(m.attachmentUrl)} target="_blank" rel="noreferrer" download={m.attachmentName || "image"} onClick={(e) => e.stopPropagation()}>
                                <img src={getFileUrl(m.attachmentUrl)} alt={m.attachmentName} className="mb-1.5 max-h-56 w-full rounded-lg object-cover" />
                              </a>
                            )}
                            {m.attachmentUrl && m.attachmentType !== "image" && (
                              <a href={getFileUrl(m.attachmentUrl)} target="_blank" rel="noreferrer" download={m.attachmentName || "file"} onClick={(e) => e.stopPropagation()}
                                className={`mb-1.5 flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold ${mine ? "bg-white/20 text-white" : "bg-slate-100 text-slate-700"}`}>
                                <FileText className="h-4 w-4 flex-shrink-0" />
                                <span className="truncate">{m.attachmentName || "Attachment"}</span>
                              </a>
                            )}
                            {m.message && <p className="whitespace-pre-wrap break-words leading-relaxed">{m.message}</p>}
                            <div className={`mt-1 flex items-center gap-1 text-[10px] ${mine ? "justify-end text-blue-100" : "text-slate-400"}`}>
                              <span>{messageTime(m.createdAt)}</span>
                              {mine && (m.readAt ? <CheckCheck className="h-3 w-3" /> : <Check className="h-3 w-3" />)}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                  {otherTyping && <TypingBubble />}
                  <div ref={bottomRef} />
                </div>
              )}
            </div>

            {/* Input */}
            <div className="flex-shrink-0 border-t border-slate-100 bg-white px-4 py-3">
              {selected.status === "pending" ? (
                <div className="flex items-center justify-center gap-2 rounded-xl bg-amber-50 py-3 text-xs font-semibold text-amber-700">
                  <Clock className="h-4 w-4" />
                  {selected.iInitiated ? "Waiting for the recruiter to accept your request" : "Accept the request above to start chatting"}
                </div>
              ) : selected.status === "rejected" ? (
                <div className="flex items-center justify-center gap-2 rounded-xl bg-rose-50 py-3 text-xs font-semibold text-rose-500">
                  <X className="h-4 w-4" /> This chat request was declined
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {attachment && (
                    <div className="flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                      {attachment.isImage ? (
                        <img src={attachment.previewUrl} className="h-10 w-10 rounded-lg object-cover" alt="preview" />
                      ) : (
                        <FileText className="h-5 w-5 text-slate-400" />
                      )}
                      <span className="max-w-[160px] truncate text-xs font-semibold text-slate-600">{attachment.file.name}</span>
                      <button onClick={clearAttachment} className="text-slate-400 transition-colors hover:text-rose-500">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                  <div className="flex items-end gap-2">
                    <input ref={fileInputRef} type="file" accept="image/*,.pdf" className="hidden" onChange={pickAttachment} />
                    <button onClick={() => fileInputRef.current?.click()}
                      className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-400 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
                      title="Attach file">
                      <Paperclip className="h-4 w-4" />
                    </button>
                    <textarea ref={textareaRef} rows={1} value={input} onChange={handleInputChange}
                      onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendMessage())}
                      placeholder="Type a message… (Enter to send)"
                      className="max-h-[120px] flex-1 resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm transition-colors focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 scrollbar-hide"
                      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }} />
                    <motion.button whileTap={{ scale: 0.9 }} onClick={sendMessage}
                      disabled={sending || (!input.trim() && !attachment)}
                      className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 text-white shadow-md transition-opacity disabled:opacity-50">
                      {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </motion.button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatPanel;
