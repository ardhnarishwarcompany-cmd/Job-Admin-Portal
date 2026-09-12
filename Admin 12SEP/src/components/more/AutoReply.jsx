import React, { useState } from "react";
import Navbar from "../components_lite/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Trash2,
  Edit2,
  ToggleRight,
  ToggleLeft,
  Copy,
  Check,
} from "lucide-react";
import { toast } from "sonner";

const AutoReply = () => {
  const [autoReplies, setAutoReplies] = useState([
    {
      id: 1,
      trigger: "hello|hi|hey",
      reply: "Hello! Thanks for reaching out. We'll get back to you shortly.",
      enabled: true,
    },
    {
      id: 2,
      trigger: "interested|apply|job",
      reply: "Great! We're excited about your interest. Please fill out the application form.",
      enabled: true,
    },
    {
      id: 3,
      trigger: "pricing|cost|price",
      reply: "Check our pricing plans page for more details on our offerings.",
      enabled: true,
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ trigger: "", reply: "" });
  const [copiedId, setCopiedId] = useState(null);

  const handleAddOrUpdate = () => {
    if (!formData.trigger.trim() || !formData.reply.trim()) {
      toast.error("Please fill all fields");
      return;
    }

    if (editingId) {
      setAutoReplies((prev) =>
        prev.map((item) =>
          item.id === editingId
            ? { ...item, trigger: formData.trigger, reply: formData.reply }
            : item
        )
      );
      toast.success("Auto-reply updated!");
    } else {
      const newReply = {
        id: Date.now(),
        trigger: formData.trigger,
        reply: formData.reply,
        enabled: true,
      };
      setAutoReplies((prev) => [...prev, newReply]);
      toast.success("Auto-reply added!");
    }

    setFormData({ trigger: "", reply: "" });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (item) => {
    setFormData({ trigger: item.trigger, reply: item.reply });
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    setAutoReplies((prev) => prev.filter((item) => item.id !== id));
    toast.success("Auto-reply deleted!");
  };

  const handleToggle = (id) => {
    setAutoReplies((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, enabled: !item.enabled } : item
      )
    );
  };

  const handleCopy = (reply, id) => {
    navigator.clipboard.writeText(reply);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-sky-900 to-slate-900">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-white">Auto Reply System</h1>
              <p className="text-gray-400 mt-2">
                Automatically respond to common messages
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setShowForm(!showForm);
                setEditingId(null);
                setFormData({ trigger: "", reply: "" });
              }}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-sky-600 hover:from-blue-600 hover:to-sky-700 text-white px-6 py-3 rounded-lg font-semibold"
            >
              <Plus className="w-5 h-5" />
              New Auto Reply
            </motion.button>
          </div>
        </motion.div>

        {/* Add/Edit Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8 backdrop-blur-xl bg-white/10 border border-white/20 p-8 rounded-2xl"
            >
              <h2 className="text-2xl font-bold text-white mb-6">
                {editingId ? "Edit Auto Reply" : "Create Auto Reply"}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-white font-semibold mb-2">
                    Trigger Keywords (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.trigger}
                    onChange={(e) =>
                      setFormData({ ...formData, trigger: e.target.value })
                    }
                    placeholder="e.g., hello|hi|hey"
                    className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-gray-400 text-xs mt-2">
                    Use | to separate keywords. Match is case-insensitive.
                  </p>
                </div>

                <div>
                  <label className="block text-white font-semibold mb-2">
                    Trigger Type
                  </label>
                  <select className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>Contains Any Keyword</option>
                    <option>Exact Match</option>
                    <option>Starts With</option>
                  </select>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-white font-semibold mb-2">
                  Auto Reply Message
                </label>
                <textarea
                  value={formData.reply}
                  onChange={(e) =>
                    setFormData({ ...formData, reply: e.target.value })
                  }
                  placeholder="Enter your auto reply message..."
                  rows="4"
                  className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAddOrUpdate}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-3 rounded-lg font-bold"
                >
                  {editingId ? "Update Reply" : "Add Reply"}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setFormData({ trigger: "", reply: "" });
                  }}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-bold"
                >
                  Cancel
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Auto Replies List */}
        <div className="grid gap-6">
          <AnimatePresence>
            {autoReplies.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: idx * 0.05 }}
                className="backdrop-blur-xl bg-white/10 border border-white/20 p-6 rounded-2xl hover:border-white/30 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-sky-600 text-white text-sm font-bold rounded-full">
                        {item.trigger.split("|")[0]}
                      </span>
                      {item.trigger.split("|").length > 1 && (
                        <span className="text-gray-400 text-sm">
                          +{item.trigger.split("|").length - 1} more
                        </span>
                      )}
                    </div>
                    <p className="text-white text-lg leading-relaxed">
                      {item.reply}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleToggle(item.id)}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {item.enabled ? (
                        <ToggleRight className="w-6 h-6 text-green-500" />
                      ) : (
                        <ToggleLeft className="w-6 h-6 text-gray-500" />
                      )}
                    </motion.button>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t border-white/10">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleCopy(item.reply, item.id)}
                    className="flex items-center gap-2 flex-1 bg-gray-700 hover:bg-gray-600 text-gray-300 py-2 rounded-lg transition-colors text-sm"
                  >
                    {copiedId === item.id ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy
                      </>
                    )}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleEdit(item)}
                    className="flex items-center gap-2 flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors text-sm font-medium"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDelete(item.id)}
                    className="flex items-center gap-2 flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition-colors text-sm font-medium"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {autoReplies.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl"
          >
            <p className="text-gray-400 text-lg">
              No auto-replies yet. Create one to get started!
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AutoReply;
