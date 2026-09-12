import React, { useState, useRef, useEffect } from "react";
import Navbar from "../components_lite/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Search,
  MoreVertical,
  Phone,
  Video,
  Plus,
  Paperclip,
  Smile,
} from "lucide-react";

const Chat = () => {
  const [contacts, setContacts] = useState([
    { id: 1, name: "John Doe", avatar: "JD", status: "online" },
    { id: 2, name: "Sarah Smith", avatar: "SS", status: "online" },
    { id: 3, name: "Mike Johnson", avatar: "MJ", status: "away" },
    { id: 4, name: "Emma Wilson", avatar: "EW", status: "offline" },
    { id: 5, name: "David Lee", avatar: "DL", status: "online" },
  ]);

  const [selectedContact, setSelectedContact] = useState(contacts[0]);
  const [messages, setMessages] = useState({
    1: [
      { id: 1, sender: "other", text: "Hey! How are you?", timestamp: "10:30" },
      { id: 2, sender: "user", text: "I'm doing great! How about you?", timestamp: "10:32" },
      {
        id: 3,
        sender: "other",
        text: "All good. Ready for the interview tomorrow?",
        timestamp: "10:35",
      },
      { id: 4, sender: "user", text: "Yes, definitely prepared!", timestamp: "10:36" },
    ],
    2: [
      { id: 1, sender: "user", text: "Hi Sarah!", timestamp: "09:15" },
      { id: 2, sender: "other", text: "Hello! 👋", timestamp: "09:16" },
    ],
    3: [{ id: 1, sender: "other", text: "Available for a call?", timestamp: "08:45" }],
    4: [],
    5: [
      { id: 1, sender: "other", text: "Great work on the project!", timestamp: "07:30" },
    ],
  });

  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const newMsg = {
      id: Math.random(),
      sender: "user",
      text: newMessage,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => ({
      ...prev,
      [selectedContact.id]: [...(prev[selectedContact.id] || []), newMsg],
    }));
    setNewMessage("");

    // Simulate auto-reply
    setTimeout(() => {
      const autoReply = {
        id: Math.random(),
        sender: "other",
        text: "Thanks for your message! We'll get back to you soon.",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => ({
        ...prev,
        [selectedContact.id]: [...(prev[selectedContact.id] || []), autoReply],
      }));
    }, 1000);
  };

  const filteredContacts = contacts.filter((contact) =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentMessages = messages[selectedContact?.id] || [];

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />

      <div className="max-w-6xl mx-auto h-[calc(100vh-80px)] flex gap-0 sm:gap-4 p-2 sm:p-4">
        {/* Contacts Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`w-full sm:w-80 bg-gray-800 rounded-2xl border border-gray-700 flex flex-col ${
            isMobileOpen ? "block" : "hidden sm:flex"
          }`}
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4">Messages</h2>
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search contacts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-700 text-white pl-10 pr-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Contacts List */}
          <div className="flex-1 overflow-y-auto">
            {filteredContacts.map((contact) => (
              <motion.button
                key={contact.id}
                whileHover={{ backgroundColor: "rgba(55, 65, 81, 0.8)" }}
                onClick={() => {
                  setSelectedContact(contact);
                  setIsMobileOpen(false);
                }}
                className={`w-full p-4 text-left border-b border-gray-700 transition-colors ${
                  selectedContact?.id === contact.id
                    ? "bg-blue-600"
                    : "hover:bg-gray-700"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-sky-600 flex items-center justify-center text-white font-bold">
                      {contact.avatar}
                    </div>
                    {contact.status === "online" && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800" />
                    )}
                    {contact.status === "away" && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-yellow-500 rounded-full border-2 border-gray-800" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white truncate">
                      {contact.name}
                    </p>
                    <p className="text-xs text-gray-400 capitalize">
                      {contact.status}
                    </p>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Chat Area */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`flex-1 bg-gray-800 rounded-2xl border border-gray-700 flex flex-col ${
            !isMobileOpen ? "flex" : "hidden sm:flex"
          }`}
        >
          {selectedContact && (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsMobileOpen(true)}
                    className="sm:hidden text-gray-400 hover:text-white"
                  >
                    ←
                  </button>
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-sky-600 flex items-center justify-center text-white font-bold">
                      {selectedContact.avatar}
                    </div>
                    {selectedContact.status === "online" && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-white">
                      {selectedContact.name}
                    </p>
                    <p className="text-xs text-gray-400 capitalize">
                      {selectedContact.status}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 hover:bg-gray-700 rounded-full text-gray-400 hover:text-white transition-colors"
                  >
                    <Phone className="w-5 h-5" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 hover:bg-gray-700 rounded-full text-gray-400 hover:text-white transition-colors"
                  >
                    <Video className="w-5 h-5" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 hover:bg-gray-700 rounded-full text-gray-400 hover:text-white transition-colors"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-900">
                <AnimatePresence>
                  {currentMessages.map((msg, idx) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      className={`flex ${
                        msg.sender === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-xs px-4 py-2 rounded-2xl ${
                          msg.sender === "user"
                            ? "bg-blue-600 text-white rounded-br-none"
                            : "bg-gray-700 text-gray-100 rounded-bl-none"
                        }`}
                      >
                        <p className="text-sm">{msg.text}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {msg.timestamp}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-gray-700 bg-gray-800">
                <div className="flex items-center gap-2 bg-gray-700 rounded-full px-4 py-3">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="text-gray-400 hover:text-white"
                  >
                    <Plus className="w-5 h-5" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="text-gray-400 hover:text-white"
                  >
                    <Paperclip className="w-5 h-5" />
                  </motion.button>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" && handleSendMessage()
                    }
                    placeholder="Message..."
                    className="flex-1 bg-transparent text-white placeholder-gray-400 focus:outline-none"
                  />
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="text-gray-400 hover:text-white"
                  >
                    <Smile className="w-5 h-5" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleSendMessage}
                    className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full"
                  >
                    <Send className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Chat;
