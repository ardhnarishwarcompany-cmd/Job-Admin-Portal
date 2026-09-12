import React from "react";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { Building2, MapPin, UserRound, Briefcase, Receipt, ShieldCheck, Mail, Phone, FileText } from "lucide-react";
import Navbar from "../components_lite/Navbar";
import { getFileUrl } from "@/utils/data";

const SectionTitle = ({ icon: Icon, title }) => (
  <h3 className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-2 text-lg font-bold text-slate-800">
    <Icon className="h-5 w-5 text-blue-600" /> {title}
  </h3>
);

const DetailRow = ({ label, value }) => (
  <div className="py-2 border-b border-slate-50 last:border-0">
    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p>
    <p className="mt-0.5 text-sm font-medium text-slate-900">{value || "N/A"}</p>
  </div>
);

const RecruiterProfile = () => {
  const { user } = useSelector((store) => store.auth);
  
  if (!user || user.role !== "Recruiter") {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex items-center justify-center py-20 text-slate-500">
          Profile data not available.
        </div>
      </div>
    );
  }

  let profile = {};
  try {
    profile = typeof user.recruiterProfile === "string" 
      ? JSON.parse(user.recruiterProfile) 
      : (user.recruiterProfile || {});
  } catch (e) {
    console.error("Failed to parse recruiter profile", e);
  }

  const { company, address, contact, hiring, billing, subscription, agreements } = profile;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/20">
      <Navbar />
      <div className="mx-auto max-w-5xl px-4 py-8">
        
        {/* Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl bg-white p-8 shadow-xl shadow-slate-200/50 mb-8 border border-slate-100"
        >
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-4 border-slate-50 bg-slate-100 shadow-sm">
              <img
                src={getFileUrl(profile.companyLogo) || "/default-avatar.svg"}
                alt="Company Logo"
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                  user.verificationStatus === "approved" 
                    ? "bg-emerald-100 text-emerald-700" 
                    : "bg-amber-100 text-amber-700"
                }`}>
                  {user.verificationStatus === "approved" ? "Verified" : "Verification Pending"}
                </span>
                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                  {subscription?.plan || "Free Plan"}
                </span>
              </div>
              <h1 className="text-3xl font-black text-slate-900">{company?.name || user.extraDetails?.companyName || "No Company Name"}</h1>
              <p className="mt-1 flex items-center gap-2 text-slate-500">
                <Mail className="h-4 w-4" /> {user.email} &nbsp;•&nbsp; <Phone className="h-4 w-4" /> {user.phoneNumber}
              </p>
            </div>
          </div>
          <p className="mt-6 text-sm leading-relaxed text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100">
            {company?.description || "No description provided."}
          </p>
        </motion.div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <SectionTitle icon={Building2} title="Company Overview" />
            <div className="space-y-1">
              <DetailRow label="Website" value={company?.website ? <a href={company.website} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">{company.website}</a> : "N/A"} />
              <DetailRow label="Industry" value={company?.industry} />
              <DetailRow label="Company Type" value={company?.type} />
              <DetailRow label="Company Size" value={company?.size} />
              <DetailRow label="Year Established" value={company?.yearEstablished} />
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <SectionTitle icon={UserRound} title="Primary Contact" />
            <div className="space-y-1">
              <DetailRow label="Contact Person" value={contact?.fullname || user.fullname} />
              <DetailRow label="Designation" value={contact?.designation} />
              <DetailRow label="Department" value={contact?.department} />
              <DetailRow label="Official Email" value={contact?.email} />
              <DetailRow label="Mobile & WhatsApp" value={`${contact?.mobile || "N/A"} ${contact?.whatsapp ? ` / ${contact.whatsapp} (WA)` : ""}`} />
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <SectionTitle icon={MapPin} title="Registered Address" />
            <div className="space-y-1">
              <DetailRow label="City & State" value={`${address?.city || "N/A"}, ${address?.state || "N/A"}`} />
              <DetailRow label="Country" value={address?.country} />
              <DetailRow label="Area / Sector" value={address?.area} />
              <DetailRow label="Building / Landmark" value={`${address?.building || ""} ${address?.landmark ? `(${address.landmark})` : ""}`} />
              <DetailRow label="PIN Code" value={address?.pinCode} />
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <SectionTitle icon={Briefcase} title="Hiring Profile" />
            <div className="space-y-1">
              <DetailRow label="Hiring For" value={hiring?.hiringFor} />
              <DetailRow label="Hiring Volume" value={hiring?.volume} />
              <DetailRow label="Hiring Frequency" value={hiring?.frequency} />
              <DetailRow label="Preferred Locations" value={hiring?.locations} />
              <DetailRow label="Industries" value={hiring?.industries?.join(", ")} />
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <SectionTitle icon={Receipt} title="Billing & Compliance" />
            <div className="space-y-1">
              <DetailRow label="GST Number" value={billing?.gst || user.extraDetails?.gstNumber} />
              <DetailRow label="PAN Number" value={billing?.pan || user.pancard} />
              <DetailRow label="CIN Number" value={billing?.cin} />
              <DetailRow label="MSME Registration" value={billing?.msme} />
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <SectionTitle icon={FileText} title="Documents & Terms" />
            <div className="space-y-1">
              <DetailRow label="Mandatory Docs" value={profile.verificationDocs?.length ? `${profile.verificationDocs.length} files uploaded` : "None"} />
              <DetailRow label="Agreements" value={
                <div className="flex flex-col gap-1 mt-1 text-slate-500">
                  {agreements?.accuracy && <span>✓ Information Accuracy Confirmed</span>}
                  {agreements?.authorized && <span>✓ Authorized Representative</span>}
                  {agreements?.terms && <span>✓ Terms Accepted</span>}
                </div>
              } />
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
};

export default RecruiterProfile;
