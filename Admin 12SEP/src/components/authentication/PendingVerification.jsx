import React from "react";
import { motion } from "framer-motion";
import { Clock, RefreshCw, AlertCircle, LogOut } from "lucide-react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setUser } from "@/redux/authSlice";
import axios from "axios";
import { USER_API_ENDPOINT } from "@/utils/data";
import { toast } from "sonner";

const PendingVerification = ({ user }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = React.useState(false);

  const handleReload = async () => {
    try {
      setIsChecking(true);
      const res = await axios.get(`${USER_API_ENDPOINT}/profile`, { withCredentials: true });
      if (res.data.success) {
        dispatch(setUser(res.data.user));
        if (res.data.user.verificationStatus === "approved") {
          toast.success("Your application has been approved!");
        } else if (res.data.user.verificationStatus === "rejected") {
          toast.error("Your application was rejected.");
        } else {
          toast.info("Application is still pending review.");
        }
      }
    } catch (error) {
      toast.error("Could not fetch latest profile status");
    } finally {
      setIsChecking(false);
    }
  };

  const handleLogout = async () => {
    try {
      const res = await axios.get(`${USER_API_ENDPOINT}/logout`, { withCredentials: true });
      if (res.data.success) {
        dispatch(setUser(null));
        navigate("/");
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error("Logout failed");
    }
  };

  const isRejected = user?.verificationStatus === "rejected";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/20 to-cyan-50/10 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md overflow-hidden rounded-3xl border border-white/50 bg-white/70 p-8 text-center shadow-xl backdrop-blur-xl"
      >
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-slate-50 shadow-inner">
          {isRejected ? (
            <AlertCircle className="h-10 w-10 text-rose-500" />
          ) : (
            <Clock className="h-10 w-10 text-amber-500 animate-pulse" />
          )}
        </div>

        <h1 className="mb-2 font-display text-2xl font-black text-slate-900">
          {isRejected ? "Application Rejected" : "Application Pending"}
        </h1>
        
        <p className="mb-8 text-sm text-slate-600 leading-relaxed">
          {isRejected
            ? "Unfortunately, your application to join the platform has been rejected by the admin team. Please contact support for further assistance."
            : "Your application is currently under review by our admin team. Once approved, you'll be granted full access to the platform."}
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={handleReload}
            disabled={isChecking}
            className="group flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg transition-all hover:bg-blue-700 hover:shadow-blue-500/25 disabled:opacity-70"
          >
            <RefreshCw className={`h-4 w-4 ${isChecking ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"}`} />
            {isChecking ? "Checking Status..." : "Reload to Check Status"}
          </button>
          
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-bold text-slate-600 transition-all hover:bg-slate-50"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default PendingVerification;
