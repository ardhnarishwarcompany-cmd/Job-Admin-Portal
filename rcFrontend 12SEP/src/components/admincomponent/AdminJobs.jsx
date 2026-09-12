import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Navbar from "../components_lite/Navbar";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import AdminJobsTable from "./AdminJobsTable";
import useGetAllAdminJobs from "@/hooks/useGetAllJAdminobs";
import { setSearchJobByText } from "@/redux/jobSlice";
import { Briefcase, Plus, Search } from "lucide-react";

const AdminJobs = () => {
  useGetAllAdminJobs();
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const dispatch = useDispatch();

  useEffect(() => { dispatch(setSearchJobByText(input)); }, [input]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-cyan-50/10">
      <Navbar />
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <Briefcase className="h-6 w-6 text-blue-600" /> My Job Postings
            </h1>
            <p className="text-slate-500 text-sm mt-1">Manage all your posted jobs</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/recruiter/jobs/create")}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-200 hover:shadow-emerald-300 transition-all"
          >
            <Plus className="h-4 w-4" /> Post New Job
          </motion.button>
        </motion.div>

        {/* Search */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-6">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm max-w-md">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Search by job title or company..."
              className="flex-1 bg-transparent text-sm outline-none text-slate-700 placeholder-slate-400"
            />
          </div>
        </motion.div>

        <AdminJobsTable />
      </div>
    </div>
  );
};

export default AdminJobs;
