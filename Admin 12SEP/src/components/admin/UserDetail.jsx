import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { toast } from "sonner";
import { useParams, useNavigate, Link } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import { getFileUrl, ADMIN_API_ENDPOINT } from "@/utils/data";
import {
  ArrowLeft, Shield, Briefcase, Users, Mail, Phone, MapPin, Calendar, FileText,
  Download, CheckCircle2, XCircle, Clock, Ban, Link2, Loader2, IdCard, Building2, UserCheck, UserX,
} from "lucide-react";

const roleColors = {
  Admin: "bg-rose-100 text-rose-700",
  Recruiter: "bg-emerald-100 text-emerald-700",
  Employee: "bg-blue-100 text-blue-700",
};
const roleIcons = { Admin: Shield, Recruiter: Briefcase, Employee: Users };

const humanizeKey = (key) =>
  key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .replace(/^./, (c) => c.toUpperCase())
    .trim();

const isUrl = (value) => typeof value === "string" && /^(https?:\/\/|www\.)/i.test(value.trim());

const Chip = ({ children }) => (
  <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
    {children}
  </span>
);

// Renders any JSON value into a sensible UI fragment — keeps the page robust
// even if the candidate/recruiter profile shape changes over time.
const ValueDisplay = ({ value }) => {
  if (value === null || value === undefined || value === "") {
    return <span className="text-slate-400">—</span>;
  }
  if (typeof value === "boolean") {
    return value ? (
      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600"><CheckCircle2 className="h-3.5 w-3.5" /> Yes</span>
    ) : (
      <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-400"><XCircle className="h-3.5 w-3.5" /> No</span>
    );
  }
  if (isUrl(value)) {
    const href = value.startsWith("http") ? value : `https://${value}`;
    return (
      <a href={href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline break-all">
        <Link2 className="h-3 w-3 flex-shrink-0" /> {value}
      </a>
    );
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return <span className="text-slate-400">—</span>;
    if (value.every((v) => typeof v !== "object")) {
      return (
        <div className="flex flex-wrap gap-1.5">
          {value.map((v, i) => <Chip key={i}>{String(v)}</Chip>)}
        </div>
      );
    }
    // array of objects (e.g. skills, languages, branches, certifications)
    return (
      <div className="space-y-2">
        {value.map((item, i) => (
          <div key={i} className="rounded-lg border border-slate-100 bg-slate-50 p-2.5">
            <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
              {Object.entries(item).map(([k, v]) => (
                <div key={k} className="text-xs">
                  <span className="font-semibold text-slate-500">{humanizeKey(k)}: </span>
                  <span className="text-slate-700"><ValueDisplay value={v} /></span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }
  if (typeof value === "object") {
    return (
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {Object.entries(value).map(([k, v]) => (
          <div key={k} className="text-xs">
            <span className="font-semibold text-slate-500">{humanizeKey(k)}: </span>
            <span className="text-slate-700"><ValueDisplay value={v} /></span>
          </div>
        ))}
      </div>
    );
  }
  return <span className="text-sm text-slate-800">{String(value)}</span>;
};

const ProfileSection = ({ title, data, icon: Icon }) => {
  if (!data || typeof data !== "object" || Object.keys(data).length === 0) return null;
  const entries = Object.entries(data).filter(([k]) => !["emailOtp", "emailOtpSent"].includes(k));
  if (entries.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <h3 className="mb-4 flex items-center gap-2 text-sm font-black uppercase tracking-wide text-slate-700">
        {Icon && <Icon className="h-4 w-4 text-blue-600" />} {title}
      </h3>
      <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
        {entries.map(([key, value]) => (
          <div key={key} className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{humanizeKey(key)}</p>
            <div className="mt-0.5">
              <ValueDisplay value={value} />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

const InfoStat = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
    <Icon className="h-4 w-4 flex-shrink-0 text-slate-400" />
    <div className="min-w-0">
      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="truncate text-sm font-bold text-slate-800">{value || "—"}</p>
    </div>
  </div>
);

const UserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [blockBusy, setBlockBusy] = useState(false);

  useEffect(() => {
    setLoading(true);
    axios
      .get(`${ADMIN_API_ENDPOINT}/users/${id}`, { withCredentials: true })
      .then((res) => {
        if (res.data.success) setUser(res.data.user);
        else setError(res.data.message || "User not found");
      })
      .catch((err) => setError(err?.response?.data?.message || "Could not load this user"))
      .finally(() => setLoading(false));
  }, [id]);

  const toggleBlock = async () => {
    if (!user) return;
    const action = user.isBlocked ? "unblock" : "block";
    if (action === "block") {
      const confirmed = window.confirm(
        `Block ${user.fullname}? They will be signed out immediately and won't be able to log in until you unblock them.`
      );
      if (!confirmed) return;
    }
    setBlockBusy(true);
    try {
      const res = await axios.put(`${ADMIN_API_ENDPOINT}/${action}/${user._id}`, {}, { withCredentials: true });
      if (res.data.success) {
        setUser((prev) => ({ ...prev, isBlocked: action === "block" }));
        toast.success(res.data.message, {
          description: action === "block"
            ? "This user has been notified and can no longer sign in."
            : "This user has been notified and can sign in again.",
        });
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || `Could not ${action} this user.`);
    } finally {
      setBlockBusy(false);
    }
  };

  const RoleIcon = user ? roleIcons[user.role] || Users : Users;

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-cyan-50/10">
      <AdminSidebar />
      <div className="flex-1 md:ml-64">
        <AdminHeader />
        <div className="p-4 sm:p-6">
          <button
            onClick={() => navigate("/admin/users")}
            className="mb-4 inline-flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Manage Users
          </button>

          {loading && (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400">
              <Loader2 className="mb-3 h-8 w-8 animate-spin" />
              <p className="text-sm font-semibold">Loading profile...</p>
            </div>
          )}

          {!loading && error && (
            <div className="flex flex-col items-center justify-center py-24 text-center text-slate-400">
              <Ban className="mb-3 h-12 w-12 opacity-30" />
              <p className="text-lg font-bold text-slate-600">{error}</p>
              <Link to="/admin/users" className="mt-3 text-sm font-bold text-blue-600 hover:underline">
                Return to Manage Users
              </Link>
            </div>
          )}

          {!loading && !error && user && (
            <div className="space-y-5">
              {/* Header card */}
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-md sm:p-6"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    {user.profilePhoto ? (
                      <img src={getFileUrl(user.profilePhoto)} alt={user.fullname} className="h-16 w-16 flex-shrink-0 rounded-2xl object-cover shadow-md sm:h-20 sm:w-20" />
                    ) : (
                      <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 text-2xl font-black text-white shadow-md sm:h-20 sm:w-20">
                        {(user.fullname || "U")[0].toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <h1 className="truncate text-xl font-black text-slate-900 sm:text-2xl">{user.fullname}</h1>
                      <div className="mt-1.5 flex flex-wrap items-center gap-2">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${roleColors[user.role] || "bg-slate-100 text-slate-600"}`}>
                          <RoleIcon className="h-3 w-3" /> {user.role === "Employee" ? "Candidate" : user.role}
                        </span>
                        {user.isBlocked ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-bold text-rose-600">
                            <Ban className="h-3 w-3" /> Blocked
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-600">
                            <CheckCircle2 className="h-3 w-3" /> Active
                          </span>
                        )}
                        {user.role === "Recruiter" && user.verificationStatus && (
                          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                            user.verificationStatus === "approved" ? "bg-emerald-100 text-emerald-600"
                              : user.verificationStatus === "rejected" ? "bg-rose-100 text-rose-600"
                              : "bg-amber-100 text-amber-700"
                          }`}>
                            <Clock className="h-3 w-3" /> {user.verificationStatus}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {(user.resume) && (
                      <a
                        href={getFileUrl(user.resume)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:shadow-blue-200 transition-all"
                      >
                        <Download className="h-3.5 w-3.5" /> Download Resume
                      </a>
                    )}
                    {user.role !== "Admin" && (
                      <button
                        onClick={toggleBlock}
                        disabled={blockBusy}
                        className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold shadow-md transition-all disabled:opacity-60 ${
                          user.isBlocked
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                            : "bg-gradient-to-r from-rose-500 to-orange-500 text-white hover:shadow-rose-200"
                        }`}
                      >
                        {blockBusy ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : user.isBlocked ? (
                          <><UserCheck className="h-3.5 w-3.5" /> Unblock User</>
                        ) : (
                          <><UserX className="h-3.5 w-3.5" /> Block User</>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Quick stats */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <InfoStat icon={Mail} label="Email" value={user.email} />
                <InfoStat icon={Phone} label="Phone" value={user.phoneNumber} />
                <InfoStat icon={MapPin} label="City" value={user.city} />
                <InfoStat icon={Calendar} label="Joined" value={user.created_at ? new Date(user.created_at).toLocaleDateString() : "—"} />
              </div>

              {(user.bio || user.skills || user.experience || user.education) && user.role === "Employee" && !user.candidateProfile && (
                <ProfileSection
                  title="Basic Profile"
                  icon={Users}
                  data={{ bio: user.bio, skills: user.skills, experience: user.experience, education: user.education }}
                />
              )}

              {user.role === "Admin" && (
                <ProfileSection title="Admin Details" icon={Shield} data={{ adminCode: user.adminCode }} />
              )}

              {user.role === "Employee" && user.candidateProfile && typeof user.candidateProfile === "object" && (
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                  <ProfileSection title="Personal Info" icon={IdCard} data={user.candidateProfile.personal} />
                  <ProfileSection title="Contact Details" icon={Phone} data={user.candidateProfile.contact} />
                  <ProfileSection title="Career Preference" icon={Briefcase} data={user.candidateProfile.career} />
                  <ProfileSection title="Salary Expectation" icon={FileText} data={user.candidateProfile.salary} />
                  <ProfileSection title="Experience" icon={Briefcase} data={user.candidateProfile.experience} />
                  <ProfileSection title="Education" icon={FileText} data={user.candidateProfile.education} />
                  <ProfileSection title="Skills" icon={CheckCircle2} data={{ skills: user.candidateProfile.skills }} />
                  <ProfileSection title="Certifications" icon={FileText} data={{ certifications: user.candidateProfile.certifications }} />
                  <ProfileSection title="Portfolio Links" icon={Link2} data={user.candidateProfile.portfolioLinks} />
                  <ProfileSection title="Work Preferences" icon={Clock} data={user.candidateProfile.workPrefs} />
                  <ProfileSection title="Platform Preferences" icon={Shield} data={user.candidateProfile.platform} />
                </div>
              )}

              {user.role === "Recruiter" && user.recruiterProfile && typeof user.recruiterProfile === "object" && (
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                  <ProfileSection title="Company Info" icon={Building2} data={user.recruiterProfile.company} />
                  <ProfileSection title="Address" icon={MapPin} data={user.recruiterProfile.address} />
                  <ProfileSection title="Branches" icon={Building2} data={{ branches: user.recruiterProfile.branches }} />
                  <ProfileSection title="Contact Person" icon={Users} data={user.recruiterProfile.contact} />
                  <ProfileSection title="Hiring Preferences" icon={Briefcase} data={user.recruiterProfile.hiring} />
                  <ProfileSection title="Billing / Compliance" icon={FileText} data={user.recruiterProfile.billing} />
                  <ProfileSection title="Subscription" icon={CheckCircle2} data={user.recruiterProfile.subscription} />
                  <ProfileSection title="Agreements" icon={Shield} data={user.recruiterProfile.agreements} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDetail;
