import React, { useState, useRef, useEffect } from "react";
import Navbar from "../components_lite/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Calendar, Loader, Briefcase, CheckCircle2, Clock } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { APPLICATION_API_ENDPOINT } from "@/utils/data";
import useGetAppliedJobs from "@/hooks/useGetAllAppliedJobs";
import { setAllAppliedJobs } from "@/redux/jobSlice";

const AiInterview = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your AI Interview Assistant. Let's begin your interview session. Are you ready?",
      sender: "ai",
      timestamp: new Date(),
    },
  ]);

  const [userMessage, setUserMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showScheduling, setShowScheduling] = useState(false);
  const [scheduleLoading, setScheduleLoading] = useState(false);

  const [scheduleData, setScheduleData] = useState({
    applicationId: "",
    date: "",
    time: "",
    day: "",
  });

  useGetAppliedJobs();
  const dispatch = useDispatch();
  const { allAppliedJobs } = useSelector((store) => store.job);
  const { user } = useSelector((store) => store.auth);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // =========================
  // AI API FUNCTION
  // =========================

  const callGroqApi = async (userMsg) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/api/ai-interview`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message: userMsg }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error("AI Interview API error", errorData || response.statusText);
        throw new Error("API Error");
      }

      const data = await response.json();

      return data.reply || "AI Interview Assistant is currently unavailable.";
    } catch (error) {
      console.error(error);

      return "AI Interview Assistant is currently unavailable.";
    }
  };

  // =========================
  // SEND MESSAGE
  // =========================

  const handleSendMessage = async () => {
    if (!userMessage.trim()) return;

    const newUserMessage = {
      id: messages.length + 1,
      text: userMessage,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newUserMessage]);

    setUserMessage("");

    setLoading(true);

    const aiResponse = await callGroqApi(userMessage);

    const newAiMessage = {
      id: messages.length + 2,
      text: aiResponse,
      sender: "ai",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newAiMessage]);

    setLoading(false);
  };

  // =========================
  // SCHEDULE INTERVIEW
  // =========================

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    if (
      !scheduleData.applicationId ||
      !scheduleData.date ||
      !scheduleData.time ||
      !scheduleData.day
    ) {
      toast.error("Please select job, date, time and day");

      return;
    }

    try {
      setScheduleLoading(true);
      const res = await axios.post(
        `${APPLICATION_API_ENDPOINT}/interview/request/${scheduleData.applicationId}`,
        {
          date: scheduleData.date,
          time: scheduleData.time,
          day: scheduleData.day,
        },
        { withCredentials: true }
      );

      if (res.data.success) {
        toast.success(res.data.message || "Interview request sent to recruiter");
        dispatch(
          setAllAppliedJobs(
            allAppliedJobs.map((application) =>
              String(application._id || application.id) === String(scheduleData.applicationId)
                ? {
                    ...application,
                    interviewDate: scheduleData.date,
                    interviewTime: scheduleData.time,
                    interviewDay: scheduleData.day,
                    interviewStatus: "requested",
                  }
                : application
            )
          )
        );
        setShowScheduling(false);
        setScheduleData({
          applicationId: "",
          date: "",
          time: "",
          day: "",
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Interview request failed");
    } finally {
      setScheduleLoading(false);
    }
  };

  const selectedApplication = allAppliedJobs?.find(
    (application) => String(application._id || application.id) === String(scheduleData.applicationId)
  );

  const getInterviewStatusText = (application) => {
    if (!application?.interviewStatus || application.interviewStatus === "none") return "No request sent";
    if (application.interviewStatus === "requested") return "Waiting for recruiter";
    if (application.interviewStatus === "confirmed") return "Confirmed by recruiter";
    return "Rejected by recruiter";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100">
      <Navbar />

      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* HEADER */}

          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-6 text-white">
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-3xl font-bold flex items-center gap-2"
            >
              <span className="text-3xl">🤖</span>

              AI Interview Assistant
            </motion.h1>

            <p className="text-blue-100 mt-2">
              Practice your interview skills with AI
            </p>
          </div>

          {/* CHAT AREA */}

          <div className="h-96 sm:h-[500px] bg-gray-50 p-4 overflow-y-auto">
            <div className="space-y-4">
              <AnimatePresence>
                {messages.map((msg, idx) => (
                  <motion.div
                    key={msg.id}
                    initial={{
                      opacity: 0,
                      y: 10,
                      scale: 0.95,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      scale: 1,
                    }}
                    exit={{
                      opacity: 0,
                      y: -10,
                    }}
                    transition={{
                      delay: idx * 0.1,
                    }}
                    className={`flex ${
                      msg.sender === "user"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-xs px-4 py-3 rounded-2xl ${
                        msg.sender === "user"
                          ? "bg-blue-500 text-white rounded-br-none"
                          : "bg-gray-200 text-gray-800 rounded-bl-none"
                      }`}
                    >
                      <p className="text-sm">{msg.text}</p>

                      <p className="text-xs opacity-70 mt-1">
                        {msg.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-gray-200 px-4 py-3 rounded-2xl rounded-bl-none">
                    <Loader className="w-5 h-5 animate-spin text-gray-600" />
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* INPUT AREA */}

          <div className="border-t border-gray-200 p-4 bg-white">
            <div className="flex gap-2">
              <input
                type="text"
                value={userMessage}
                onChange={(e) =>
                  setUserMessage(e.target.value)
                }
                onKeyDown={(e) =>
                  e.key === "Enter" && handleSendMessage()
                }
                placeholder="Type your response..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSendMessage}
                disabled={loading}
                className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
              </motion.button>
            </div>
          </div>

          {/* SCHEDULE BUTTON */}

          <div className="border-t border-gray-200 p-4 bg-gray-50">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() =>
                setShowScheduling(!showScheduling)
              }
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-3 rounded-lg font-semibold transition-all"
            >
              <Calendar className="w-5 h-5" />

              Schedule Interview
            </motion.button>

            <AnimatePresence>
              {showScheduling && (
                <motion.form
                  initial={{ opacity: 0, y: 14, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: 14, height: 0 }}
                  onSubmit={handleScheduleSubmit}
                  className="mt-4 overflow-hidden rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm"
                >
                  {!user ? (
                    <div className="rounded-xl bg-amber-50 p-4 text-sm font-semibold text-amber-700">
                      Please login as a candidate to send interview scheduling requests.
                    </div>
                  ) : allAppliedJobs?.length === 0 ? (
                    <div className="rounded-xl bg-slate-50 p-4 text-sm font-semibold text-slate-600">
                      Apply to a job first. Then you can send an interview request to that recruiter.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <label className="block">
                        <span className="mb-1.5 block text-xs font-black uppercase tracking-wider text-slate-500">
                          Select Applied Job
                        </span>
                        <select
                          value={scheduleData.applicationId}
                          onChange={(e) => setScheduleData({ ...scheduleData, applicationId: e.target.value })}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                        >
                          <option value="">Choose job application</option>
                          {allAppliedJobs.map((application) => (
                            <option key={application._id || application.id} value={application._id || application.id}>
                              {application.job?.title || "Job"} - {getInterviewStatusText(application)}
                            </option>
                          ))}
                        </select>
                      </label>

                      {selectedApplication && (
                        <div className="flex items-start gap-3 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">
                          <Briefcase className="mt-0.5 h-4 w-4 flex-shrink-0" />
                          <div>
                            <p className="font-black">{selectedApplication.job?.title || "Selected Job"}</p>
                            <p className="text-xs font-semibold opacity-80">
                              Current interview status: {getInterviewStatusText(selectedApplication)}
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="grid gap-3 sm:grid-cols-3">
                        <label className="block">
                          <span className="mb-1.5 block text-xs font-black uppercase tracking-wider text-slate-500">Date</span>
                          <input
                            type="date"
                            value={scheduleData.date}
                            onChange={(e) => setScheduleData({ ...scheduleData, date: e.target.value })}
                            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-700"
                          />
                        </label>
                        <label className="block">
                          <span className="mb-1.5 block text-xs font-black uppercase tracking-wider text-slate-500">Time</span>
                          <input
                            type="time"
                            value={scheduleData.time}
                            onChange={(e) => setScheduleData({ ...scheduleData, time: e.target.value })}
                            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-700"
                          />
                        </label>
                        <label className="block">
                          <span className="mb-1.5 block text-xs font-black uppercase tracking-wider text-slate-500">Day</span>
                          <input
                            type="text"
                            value={scheduleData.day}
                            onChange={(e) => setScheduleData({ ...scheduleData, day: e.target.value })}
                            placeholder="Monday"
                            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-700"
                          />
                        </label>
                      </div>

                      <button
                        type="submit"
                        disabled={scheduleLoading}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-black text-white disabled:opacity-60"
                      >
                        {scheduleLoading ? (
                          <>
                            <Loader className="h-4 w-4 animate-spin" />
                            Sending request...
                          </>
                        ) : (
                          <>
                            <Clock className="h-4 w-4" />
                            Send Request to Recruiter
                          </>
                        )}
                      </button>

                      <p className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        Recruiter will confirm or reject this request from their applications panel.
                      </p>
                    </div>
                  )}
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AiInterview;
