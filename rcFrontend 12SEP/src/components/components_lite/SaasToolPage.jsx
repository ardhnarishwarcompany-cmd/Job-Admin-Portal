import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, FileSearch, Users, Bell, Headphones, MessageCircle, Star, LayoutDashboard, CheckCircle2, Send, Zap, ArrowRight, TrendingUp } from "lucide-react";
import Navbar from "./Navbar";
import JdMakerPage from "../tools/JdMakerPage";
import ResumeMatchingPage from "../tools/ResumeMatchingPage";
import AiRecruiterPage from "../tools/AiRecruiterPage";

import ContactUsPage from "../more/ContactUsPage";
import ClientInquiryPage from "../more/ClientInquiryPage";
import FeedbackPage from "../more/FeedbackPage";
import RatingPage from "../more/RatingPage";
import HrDashboardPage from "../more/HrDashboardPage";


const SaasToolPage = ({ type }) => {
  const pageMap = {
    "jd-maker": <JdMakerPage />,
    "resume-matching": <ResumeMatchingPage />,
    "ai-recruiter": <AiRecruiterPage />,

    "contact-us": <ContactUsPage />,
    "client-inquiry": <ClientInquiryPage />,
    feedback: <FeedbackPage />,
    rating: <RatingPage />,
    "hr-dashboard": <HrDashboardPage />,

  };

  const page = pageMap[type];
  if (page) return page;

  // Fallback for any unmapped type
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-cyan-950">
      <Navbar />
      <div className="flex items-center justify-center py-32 text-white">
        <div className="text-center">
          <Sparkles className="h-16 w-16 mx-auto mb-4 text-blue-400 opacity-50" />
          <h1 className="text-2xl font-black">Page Coming Soon</h1>
          <p className="text-slate-400 mt-2">This feature is under development</p>
        </div>
      </div>
    </div>
  );
};

export default SaasToolPage;
