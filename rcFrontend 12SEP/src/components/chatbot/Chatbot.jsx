import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Mic, X, MicOff } from "lucide-react";

// ─── Shared Girl Avatar SVG ───────────────────────────────────────────────────
const GirlAvatar = ({ size = 40, className = "" }) => (
  <img
    src="/download.jpg"
    alt="avatar"
    width={size}
    height={size}
    className={`rounded-full object-cover ${className}`}
  />
);

const QUICK_REPLIES = [
  "How to apply for a job?",
  "How to update my resume?",
  "How to contact a recruiter?",
  "What is AI job matching?",
];

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);

  const [messages, setMessages] = useState([
    {
      from: "bot",
      text: "Hi! I'm Aria, your Job Assistant 👋\nHow can I help you today?",
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]);

  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [listening, setListening] = useState(false);

  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, typing]);

  // ─── Simple Bot Replies ─────────────────────────────────────
  const getBotReply = (text) => {
    const msg = text.toLowerCase();

    if (msg.includes("job")) {
      return "You can apply for jobs directly from the Jobs page 🚀";
    }

    if (msg.includes("resume")) {
      return "Go to Profile section to upload or update your resume 📄";
    }

    if (msg.includes("recruiter")) {
      return "Recruiters can be contacted through the company profile page 👨‍💼";
    }

    if (msg.includes("ai")) {
      return "AI Job Matching helps you find jobs based on your skills 🤖";
    }

    return "Thanks for your message 😊";
  };

  // ─── Add Bot Message ────────────────────────────────────────
  const addBotMsg = (text) => {
    setMessages((prev) => [
      ...prev,
      {
        from: "bot",
        text,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);
  };

  // ─── Voice Recognition ──────────────────────────────────────
  const handleVoice = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech Recognition not supported in this browser");
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";
    recognition.start();

    setListening(true);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setListening(false);
    };

    recognition.onerror = () => {
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };
  };

  // ─── Speak Function ─────────────────────────────────────────
  const speak = (text) => {
    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = "en-US";
    window.speechSynthesis.speak(speech);
  };

  // ─── Send Message ───────────────────────────────────────────
//   const sendMessage = async (msg) => {
//     const text = (msg || input).trim();

//     if (!text) return;

//     const time = new Date().toLocaleTimeString([], {
//       hour: "2-digit",
//       minute: "2-digit",
//     });

//     setMessages((prev) => [
//       ...prev,
//       {
//         from: "user",
//         text,
//         time,
//       },
//     ]);

//     setInput("");
//     setTyping(true);

//     // setTimeout(() => {
//     //   const reply = getBotReply(text);

//     //   setTyping(false);

//     //   addBotMsg(reply);

//     //   speak(reply);
//     // }, 800);
//     try {
//   const response = await fetch(
//     `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/api/chat/message`,
//     {
//       method: "POST",

//       headers: {
//         "Content-Type": "application/json",
//       },

//       body: JSON.stringify({
//         message: text,
//       }),
//     }
//   );

//   const data = await response.json();

//   setTyping(false);

//   if (data.success) {
//     addBotMsg(data.reply);

//     speak(data.reply);
//   } else {
//     addBotMsg("Something went wrong");
//   }
// } catch (error) {
//   console.log(error);

//   setTyping(false);

//   addBotMsg("Server Error");
// }
//   };

const sendMessage = async (msg) => {
  const text = (msg || input).trim();

  if (!text) return;

  const time = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  setMessages((prev) => [
    ...prev,
    {
      from: "user",
      text,
      time,
    },
  ]);

  setInput("");

  setTyping(true);

  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/api/chat/message`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          message: text,
        }),
      }
    );

    const data = await response.json();

    setTyping(false);

    if (data.success) {
      addBotMsg(data.reply);

      speak(data.reply);
    } else {
      addBotMsg("Something went wrong");
    }
  } catch (error) {
    console.log(error);

    setTyping(false);

    addBotMsg("Server Error");
  }
};

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 20 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 25,
            }}
            className="w-[calc(100vw-2.5rem)] max-w-[360px] rounded-3xl overflow-hidden shadow-2xl shadow-blue-300/40 border border-blue-200 bg-white flex flex-col"
            style={{ maxHeight: "520px" }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-4 py-3 flex items-center gap-3">
              <div className="relative flex-shrink-0">
                <GirlAvatar
                  size={42}
                  className="rounded-full ring-2 ring-white/40"
                />

                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-400 border-2 border-white" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-black text-white text-sm">Aria</p>

                <p className="text-white/70 text-xs">
                  Job Assistant • Online
                </p>
              </div>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
              >
                <X className="h-4 w-4" />
              </motion.button>
            </div>

            {/* Messages */}
            <div
              className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-gradient-to-b from-blue-50/50 to-white"
              style={{ minHeight: 0 }}
            >
              <AnimatePresence initial={false}>
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
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
                    transition={{ duration: 0.25 }}
                    className={`flex gap-2 ${
                      msg.from === "user"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    {msg.from === "bot" && (
                      <GirlAvatar
                        size={28}
                        className="flex-shrink-0 mt-1 rounded-full"
                      />
                    )}

                    <div
                      className={`max-w-[75%] flex flex-col gap-0.5 ${
                        msg.from === "user"
                          ? "items-end"
                          : "items-start"
                      }`}
                    >
                      <div
                        className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-line ${
                          msg.from === "user"
                            ? "bg-gradient-to-br from-blue-600 to-cyan-600 text-white rounded-br-sm shadow-md"
                            : "bg-white border border-slate-200 text-slate-800 rounded-bl-sm shadow-sm"
                        }`}
                      >
                        {msg.text}
                      </div>

                      <span className="text-[10px] text-slate-400 px-1">
                        {msg.time}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              <AnimatePresence>
                {typing && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex gap-2 items-end"
                  >
                    <GirlAvatar
                      size={28}
                      className="flex-shrink-0 rounded-full"
                    />

                    <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm flex gap-1 items-center">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          animate={{ y: [0, -5, 0] }}
                          transition={{
                            duration: 0.6,
                            repeat: Infinity,
                            delay: i * 0.15,
                          }}
                          className="h-2 w-2 rounded-full bg-blue-400"
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div ref={bottomRef} />
            </div>

            {/* Quick replies */}
            {messages.length <= 2 && (
              <div className="px-3 pb-2 flex flex-wrap gap-1.5">
                {QUICK_REPLIES.map((q) => (
                  <motion.button
                    key={q}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => sendMessage(q)}
                    className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition-colors"
                  >
                    {q}
                  </motion.button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="border-t border-slate-100 bg-white px-3 py-3">
              <div
                className={`flex items-center gap-2 rounded-2xl border bg-slate-50 px-3 py-2 transition-all ${
                  listening
                    ? "border-rose-400 ring-2 ring-rose-400/20"
                    : "border-slate-200 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-400/20"
                }`}
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && sendMessage()
                  }
                  placeholder={
                    listening
                      ? "Listening..."
                      : "Ask me anything..."
                  }
                  className="flex-1 bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none min-w-0"
                />

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleVoice}
                  className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full transition-colors ${
                    listening
                      ? "bg-rose-500 text-white animate-pulse"
                      : "bg-emerald-100 text-emerald-600 hover:bg-emerald-200"
                  }`}
                >
                  {listening ? (
                    <MicOff className="h-3.5 w-3.5" />
                  ) : (
                    <Mic className="h-3.5 w-3.5" />
                  )}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => sendMessage()}
                  className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 text-white shadow-md hover:shadow-blue-300 transition-all"
                >
                  <Send className="h-3.5 w-3.5" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => setIsOpen((v) => !v)}
        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 shadow-xl shadow-blue-400/40 hover:shadow-blue-400/60 transition-all"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="x"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="h-6 w-6 text-white" />
            </motion.div>
          ) : (
            <motion.div
              key="av"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <GirlAvatar size={40} className="rounded-full" />
            </motion.div>
          )}
        </AnimatePresence>

        {!isOpen && (
          <motion.span
            animate={{ /* scale animation removed to prevent layout growth */
              opacity: [0.6, 0, 0.6],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
            className="absolute inset-0 rounded-full bg-blue-500 pointer-events-none"
          />
        )}
      </motion.button>
    </div>
  );
};

export default Chatbot;
