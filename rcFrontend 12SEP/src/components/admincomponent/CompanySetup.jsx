import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Navbar from "../components_lite/Navbar.jsx";
import { ArrowLeft, Loader2, Building2, Globe, MapPin, FileText, Upload, Save } from "lucide-react";
import axios from "axios";
import { COMPANY_API_ENDPOINT } from "../../utils/data.js";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import useGetCompanyById from "@/hooks/useGetCompanyById.jsx";

const fields = [
  { name: "name", label: "Company Name", placeholder: "Acme Technologies", icon: Building2 },
  { name: "description", label: "Description", placeholder: "What does your company do?", icon: FileText },
  { name: "website", label: "Website", placeholder: "https://yourcompany.com", icon: Globe },
  { name: "location", label: "Location", placeholder: "Mumbai, India", icon: MapPin },
];

const CompanySetup = () => {
  const params = useParams();
  useGetCompanyById(params.id);
  const [input, setInput] = useState({ name: "", description: "", website: "", location: "", file: null });
  const { singleCompany } = useSelector((store) => store.company);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const changeEventHandler = (e) => setInput({ ...input, [e.target.name]: e.target.value });
  const changeFileHandler = (e) => setInput({ ...input, file: e.target.files?.[0] });

  const submitHandler = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", input.name);
    formData.append("description", input.description);
    formData.append("website", input.website);
    formData.append("location", input.location);
    if (input.file) formData.append("file", input.file);

    try {
      setLoading(true);
      const res = await axios.put(`${COMPANY_API_ENDPOINT}/update/${params.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
      if (res.status === 200 && res.data.message) {
        toast.success(res.data.message);
        navigate("/recruiter/companies");
      } else {
        throw new Error("Unexpected response");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setInput({
      name: singleCompany.name || "",
      description: singleCompany.description || "",
      website: singleCompany.website || "",
      location: singleCompany.location || "",
      file: null,
    });
  }, [singleCompany]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-cyan-50/10">
      <Navbar />
      <div className="mx-auto max-w-2xl px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-3xl border border-slate-200 bg-white p-8 shadow-2xl shadow-slate-100"
        >
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/recruiter/companies")}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </motion.button>
            <div>
              <h1 className="text-2xl font-black text-slate-900">Company Setup</h1>
              <p className="text-slate-500 text-sm">Update your company profile</p>
            </div>
          </div>

          <form onSubmit={submitHandler} className="space-y-5">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {fields.map((field, i) => (
                <motion.div
                  key={field.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.07 }}
                >
                  <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">{field.label}</label>
                  <div className="relative">
                    <field.icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      name={field.name}
                      value={input[field.name]}
                      onChange={changeEventHandler}
                      placeholder={field.placeholder}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-400/20 transition-all duration-200"
                    />
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Logo upload */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Company Logo</label>
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 px-4 py-3 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200">
                <Upload className="h-5 w-5 text-slate-400" />
                <span className="text-sm text-slate-500">{input.file ? input.file.name : "Click to upload logo"}</span>
                <input type="file" accept="image/*" onChange={changeFileHandler} className="sr-only" />
              </label>
            </motion.div>

            {/* Submit */}
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-200 hover:shadow-blue-300 transition-all duration-200 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</> : <><Save className="h-4 w-4" /> Save Changes</>}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default CompanySetup;
