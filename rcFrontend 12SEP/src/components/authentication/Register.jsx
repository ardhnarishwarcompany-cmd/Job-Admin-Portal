import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import FloatingThemeToggle from "../components_lite/FloatingThemeToggle";
import axios from "axios";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { setLoading } from "@/redux/authSlice";
import {
  UserPlus, Briefcase, Users, Eye, EyeOff, User, Phone, MapPin, Wallet,
  GraduationCap, Award, FileText, Globe2, Sparkles, ShieldCheck, ArrowLeft, KeyRound,
} from "lucide-react";
import { USER_API_ENDPOINT } from "@/utils/data";
import Navbar from "../components_lite/Navbar";
import Footer from "../components_lite/Footer";
import StepWizard from "../wizard/StepWizard";
import AddressAutocomplete from "../wizard/AddressAutocomplete";
import {
  Field, TextInput, TextArea, SelectInput, PillGroup, ChipMultiSelect,
  ToggleYesNo, CheckboxRow, FileDrop, SectionCard, RepeatableList,
} from "../wizard/formFields";

const INDUSTRIES = ["IT", "Healthcare", "Education", "Manufacturing", "Banking", "Finance", "Retail", "Construction", "Hospitality", "Telecom", "Others"];
const JOB_TYPES = ["Full-Time", "Part-Time", "Internship", "Contract", "Freelance", "Temporary"];
const WORK_MODES = ["Work From Office", "Work From Home", "Hybrid", "Remote"];
const RADII = ["5 km", "10 km", "25 km", "50 km", "Any"];
const NOTICE_PERIODS = ["Immediate", "15 Days", "30 Days", "60 Days", "90 Days"];
const QUALIFICATIONS = [
  "10th","12th","ITI","Diploma","Polytechnic","Certificate Course",
  "Graduate","B.A.","B.Com","B.Sc.","BBA","BCA","B.E.","B.Tech","B.Arch",
  "LLB","MBBS","B.Pharm","B.Ed.","Postgraduate","M.A.","M.Com","M.Sc.",
  "MBA","MCA","M.E.","M.Tech","M.Arch","LLM","MD","MS","M.Pharm","M.Ed.",
  "PG Diploma","PhD","Doctorate","Other"
];
const SKILL_LEVELS = ["Beginner", "Intermediate", "Advanced", "Expert"];
const SHIFTS = ["Day Shift", "Night Shift", "Rotational", "Flexible"];
const WEEKLY_OFFS = ["Sunday", "Saturday-Sunday", "Rotational", "Custom"];
const ALERT_CHANNELS = ["Email", "WhatsApp", "SMS", "Push Notification"];
const ALERT_FREQ = ["Instant", "Daily Digest", "Weekly Digest"];

const emptyProfile = {
  personal: {
    fullname: "", gender: "", dob: "", age: "", maritalStatus: "", nationality: "",
    city: "", state: "", country: "", houseAddress: "", pinCode: "",
    houseNumber: "", street: "", area: "",
  },
  contact: {
    mobile: "",
    whatsapp: "", sameAsMobile: false, email: "", emailOtp: "", emailOtpSent: false, emailVerified: false,
  },
  career: {
    jobTitle: "", industries: [], jobType: "Full-Time", workMode: "Hybrid", locations: "", radius: "Any",
  },
  salary: { current: "", expected: "", min: "", max: "", negotiable: true },
  experience: {
    employmentType: "Experienced", years: "", months: "", status: "", company: "", designation: "", noticePeriod: "",
    reasonForChange: "",
  },
  education: { qualification: "", otherQualification: "", college: "", passingYear: "", percentage: "" },
  skills: [],
  certifications: [],
  portfolioLinks: { github: "", linkedin: "", behance: "", youtube: "", dribbble: "", portfolioWebsite: "", otherLinks: "" },
  workPrefs: {
    languages: [],
    relocate: false, travel: false, passport: false, ownVehicle: false, drivingLicense: false,
    shift: "Day Shift", weeklyOff: "",
  },
  platform: {
    alertChannels: [], alertFrequency: "Instant",
    aiResume: false, aiSkillTest: false, aiMockInterview: false,
    aiVoiceInterview: false, aiVideoInterview: false, aiCodingTest: false, aiAptitudeTest: false,
    backgroundVerification: false,
  },
};

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [role, setRole] = useState("Employee");
  const [account, setAccount] = useState({ email: "johndoe@example.com", password: "Password@123" });
  const [showPass, setShowPass] = useState(false);
  const [profile, setProfile] = useState(emptyProfile);
  const [photo, setPhoto] = useState(null);
  const [resume, setResume] = useState(null);
  const [videoIntro, setVideoIntro] = useState(null);
  const [verificationDocs, setVerificationDocs] = useState([]);
  const [docUploads, setDocUploads] = useState({
    aadhaarCard: null,
    panCard: null,
    passport: null,
    drivingLicenseDoc: null,
    experienceLetter: null,
    offerLetter: null,
    salarySlip: null,
    educationalCertificates: null,
    passportSizePhoto: null,
  });
  const [certFiles, setCertFiles] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);

  const set = (section, key, value) =>
    setProfile((p) => ({ ...p, [section]: { ...p[section], [key]: value } }));

  const onDobChange = (value) => {
    let age = "";
    if (value) {
      const diff = Date.now() - new Date(value).getTime();
      age = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
    }
    setProfile((p) => ({ ...p, personal: { ...p.personal, dob: value, age } }));
  };

  const [sendingEmailOtp, setSendingEmailOtp] = useState(false);
  const sendEmailOtp = async () => {
    if (!account.email) return toast.error("Enter your email first");
    setSendingEmailOtp(true);
    try {
      const res = await axios.post(`${USER_API_ENDPOINT}/otp/email/send`, { email: account.email });
      if (res.data.success) {
        set("contact", "emailOtpSent", true);
        toast.success(res.data.mocked ? `OTP generated (mock mode). Your code: ${res.data.devOtp}` : "OTP sent to your email");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not send OTP email");
    } finally {
      setSendingEmailOtp(false);
    }
  };

  const verifyEmailOtp = async () => {
    try {
      const res = await axios.post(`${USER_API_ENDPOINT}/otp/email/verify`, {
        email: account.email, otp: profile.contact.emailOtp,
      });
      if (res.data.success) {
        set("contact", "emailVerified", true);
        toast.success("Email verified");
      } else {
        toast.error(res.data.message || "Invalid OTP");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Verification failed");
    }
  };

  const validateForm = () => {
    const missing = [];
    if (!account.email) missing.push("Account Email");
    if (!account.password) missing.push("Password");
    if (!profile.personal.fullname) missing.push("Full Name");
    if (!profile.personal.gender) missing.push("Gender");
    if (!profile.personal.dob) missing.push("Date of Birth");
    if (!profile.personal.nationality) missing.push("Nationality");
    if (!profile.personal.city) missing.push("City");
    if (!profile.personal.state) missing.push("State");
    if (!profile.personal.country) missing.push("Country");
    if (!profile.contact.mobile) missing.push("Mobile Number");
    if (!profile.career.jobTitle) missing.push("Job Title");
    if (!agreedTerms) missing.push("Terms Acceptance");

    if (missing.length > 0) {
      toast.error(`Required fields missing: ${missing.slice(0, 3).join(", ")}${missing.length > 3 ? "..." : ""}`);
      return false;
    }
    
    // Additional global validations before submit
    if (account.password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return false;
    }
    return true;
  };

  const validateStep = (currentStepIndex) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10}$/;
    const pinRegex = /^[0-9]{6}$/;

    if (currentStepIndex === 0) {
      if (!profile.personal.fullname || profile.personal.fullname.length < 2) return "Valid Full Name is required.";
      if (!profile.personal.gender) return "Gender is required.";
      if (!profile.personal.dob) return "Date of Birth is required.";
      if (profile.personal.age && (profile.personal.age < 16 || profile.personal.age > 100)) return "Age must be between 16 and 100 years.";
      if (!profile.personal.nationality) return "Nationality is required.";
      if (!profile.personal.city) return "City is required.";
      if (!profile.personal.state) return "State is required.";
      if (!profile.personal.country) return "Country is required.";
      if (profile.personal.pinCode && !pinRegex.test(profile.personal.pinCode)) return "Valid 6-digit PIN Code is required.";
    }

    if (currentStepIndex === 1) {
      if (!account.email || !emailRegex.test(account.email)) return "Valid Email Address is required.";
      if (!account.password || account.password.length < 6) return "Password must be at least 6 characters long.";
      if (!profile.contact.mobile || !phoneRegex.test(profile.contact.mobile)) return "Valid 10-digit Mobile Number is required.";
      if (profile.contact.whatsapp && !phoneRegex.test(profile.contact.whatsapp)) return "WhatsApp Number must be a valid 10-digit number.";
      if (!profile.contact.emailVerified) return "Please verify your email using the OTP before proceeding.";
    }

    if (currentStepIndex === 2) {
      if (!profile.career.jobTitle) return "Job Title is required.";
      if (!profile.career.industries || profile.career.industries.length === 0) return "Please select at least one preferred industry.";
      if (!profile.career.jobType) return "Preferred Job Type is required.";
      if (!profile.career.workMode) return "Preferred Work Mode is required.";
    }

    if (currentStepIndex === 3) {
      const { min, max, current, expected } = profile.salary;
      if (current && Number(current) < 0) return "Current salary cannot be negative.";
      if (expected && Number(expected) < 0) return "Expected salary cannot be negative.";
      if (min && Number(min) < 0) return "Minimum salary cannot be negative.";
      if (max && Number(max) < 0) return "Maximum salary cannot be negative.";
      if (min && max && Number(min) > Number(max)) return "Maximum salary must be greater than or equal to Minimum salary.";
    }

    if (currentStepIndex === 4) {
      if (!profile.experience.employmentType) return "Employment Type is required.";
      if (profile.experience.employmentType === "Experienced") {
        const yrs = Number(profile.experience.years || 0);
        const mos = Number(profile.experience.months || 0);
        if (yrs === 0 && mos === 0) return "Please enter valid years or months of experience.";
        if (mos < 0 || mos > 11) return "Months of experience should be between 0 and 11.";
        if (yrs < 0 || yrs > 50) return "Please enter a valid number of years of experience.";
        
        if (profile.experience.status === "Working" || profile.experience.status === "Notice Period") {
          if (!profile.experience.company) return "Current Company is required if you are currently working.";
          if (!profile.experience.designation) return "Current Designation is required if you are currently working.";
        }
      }
    }

    if (currentStepIndex === 5) {
      if (!profile.education.qualification) return "Highest Qualification is required.";
      if (!profile.education.college) return "College/University name is required.";
      if (profile.education.passingYear) {
        const year = Number(profile.education.passingYear);
        const currentYear = new Date().getFullYear();
        if (year < 1950 || year > currentYear + 7) return "Please enter a valid passing year.";
      }
    }

    if (currentStepIndex === 6) {
      if (profile.skills.length > 0) {
        for (const skillObj of profile.skills) {
          if (!skillObj.skill || skillObj.skill.trim().length === 0) return "Skill names cannot be empty. Please fill or remove them.";
        }
      }
      if (profile.certifications.length > 0) {
        for (const cert of profile.certifications) {
          if (!cert.name || cert.name.trim().length === 0) return "Certification names cannot be empty.";
          if (!cert.issuer || cert.issuer.trim().length === 0) return "Certification issuer cannot be empty.";
        }
      }
    }

    if (currentStepIndex === 7) {
      // Made optional at step verification
    }

    if (currentStepIndex === 9) {
      if (!agreedTerms) return "You must agree to the Terms and Privacy Policy.";
    }

    return true;
  };

  const submitHandler = async () => {
    if (role === "Recruiter") {
      navigate("/recruiter/register");
      return;
    }
    if (!validateForm()) return;

    const formData = new FormData();
    formData.append("fullname", profile.personal.fullname);
    formData.append("email", account.email);
    formData.append("password", account.password);
    formData.append("phoneNumber", profile.contact.mobile);
    formData.append("role", "Employee");
    formData.append("dateOfBirth", profile.personal.dob);
    formData.append("profileData", JSON.stringify(profile));
    if (photo) formData.append("profilePhoto", photo);
    if (resume) formData.append("resume", resume);
    if (videoIntro) formData.append("videoIntro", videoIntro);
    Object.values(docUploads).forEach((f) => f && formData.append("verificationDocs", f));
    Object.values(certFiles).forEach((f) => f && formData.append("certificationFiles", f));

    try {
      setSubmitting(true);
      dispatch(setLoading(true));
      const res = await axios.post(`${USER_API_ENDPOINT}/register`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
      if (res.data.success) {
        toast.success("Account created! Please log in.");
        navigate("/login");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Registration failed");
    } finally {
      setSubmitting(false);
      dispatch(setLoading(false));
    }
  };

  const steps = [
    {
      title: "Personal Info",
      subtitle: "Tell us a bit about yourself",
      content: (
        <>
          <SectionCard title="Personal Information" icon={User}>
            <Field label="Full Name" required>
              <TextInput value={profile.personal.fullname} onChange={(e) => set("personal", "fullname", e.target.value)} placeholder="Your full name" />
            </Field>
            <Field label="Profile Photo">
              <FileDrop label="Upload a photo (JPG/PNG)" accept="image/*" onChange={(e) => setPhoto(e.target.files?.[0])} fileNames={photo ? [photo.name] : []} />
            </Field>
            <Field label="Gender" required>
              <PillGroup options={["Male", "Female", "Other", "Prefer not to say"]} value={profile.personal.gender} onChange={(v) => set("personal", "gender", v)} />
            </Field>
            <Field label="Date of Birth" required>
              <TextInput type="date" value={profile.personal.dob} onChange={(e) => onDobChange(e.target.value)} />
            </Field>
            <Field label="Age" hint="Auto-calculated from date of birth">
              <TextInput value={profile.personal.age} readOnly className="bg-slate-50" />
            </Field>
            <Field label="Marital Status">
              <SelectInput options={["Single", "Married", "Divorced", "Widowed", "Prefer not to say"]} value={profile.personal.maritalStatus} onChange={(e) => set("personal", "maritalStatus", e.target.value)} />
            </Field>
            <Field label="Nationality" required>
              <TextInput value={profile.personal.nationality} onChange={(e) => set("personal", "nationality", e.target.value)} placeholder="e.g. Indian" />
            </Field>
          </SectionCard>

          <SectionCard title="Complete Address" icon={MapPin} description="Powered by Google Maps — type the street address to auto-fill the rest">
            <Field label="City" required><TextInput maxLength={50} value={profile.personal.city} onChange={(e) => set("personal", "city", e.target.value)} /></Field>
            <Field label="State" required><TextInput maxLength={50} value={profile.personal.state} onChange={(e) => set("personal", "state", e.target.value)} /></Field>
            <Field label="Country" required><TextInput maxLength={50} value={profile.personal.country} onChange={(e) => set("personal", "country", e.target.value)} /></Field>
            <Field label="PIN Code"><TextInput maxLength={6} value={profile.personal.pinCode} onChange={(e) => set("personal", "pinCode", e.target.value.replace(/\D/g, ""))} /></Field>
            <Field label="House Number"><TextInput value={profile.personal.houseNumber} onChange={(e) => set("personal", "houseNumber", e.target.value)} placeholder="e.g. Flat 101" /></Field>
            <Field label="Street"><TextInput value={profile.personal.street} onChange={(e) => set("personal", "street", e.target.value)} placeholder="e.g. MG Road" /></Field>
            <Field label="Area"><TextInput value={profile.personal.area} onChange={(e) => set("personal", "area", e.target.value)} placeholder="e.g. Indiranagar" /></Field>
            <Field label="Search Location Address" className="sm:col-span-2" hint="Start typing — city/state/pin auto-fill from Google Maps">
              <AddressAutocomplete
                value={profile.personal.houseAddress}
                onChange={(v) => set("personal", "houseAddress", v)}
                onPlaceSelect={(p) => setProfile((prev) => ({
                  ...prev,
                  personal: {
                    ...prev.personal,
                    city: p.city || prev.personal.city,
                    state: p.state || prev.personal.state,
                    country: p.country || prev.personal.country,
                    pinCode: p.pinCode || prev.personal.pinCode,
                    street: p.formatted ? p.formatted.split(",")[0] : prev.personal.street
                  },
                }))}
              />
            </Field>
          </SectionCard>
        </>
      ),
    },
    {
      title: "Contact Info",
      subtitle: "How employers can reach you",
      content: (
        <>
        <SectionCard title="Contact Information" icon={Phone}>
          <Field label="Mobile Number" required hint="We verify your account by email — this number is just for recruiters to reach you">
            <TextInput maxLength={10} value={profile.contact.mobile} onChange={(e) => set("contact", "mobile", e.target.value.replace(/\D/g, ""))} placeholder="+91 98765 43210" />
          </Field>
          <Field label="WhatsApp Number">
            <TextInput
              maxLength={10}
              value={profile.contact.sameAsMobile ? profile.contact.mobile : profile.contact.whatsapp}
              disabled={profile.contact.sameAsMobile}
              onChange={(e) => set("contact", "whatsapp", e.target.value.replace(/\D/g, ""))}
              className={profile.contact.sameAsMobile ? "bg-slate-50" : ""}
            />
            <CheckboxRow checked={profile.contact.sameAsMobile} onChange={(v) => set("contact", "sameAsMobile", v)} label="Same as mobile number" />
          </Field>
          <Field label="Email Address" required hint="We'll email you a verification code">
            <TextInput type="email" value={account.email} onChange={(e) => setAccount({ ...account, email: e.target.value })} placeholder="you@example.com" disabled={profile.contact.emailVerified} className={profile.contact.emailVerified ? "bg-slate-50" : ""} />
          </Field>
          <Field label="Verify Email">
            {profile.contact.emailVerified ? (
              <span className="inline-flex w-fit items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">Email verified ✓</span>
            ) : (
              <div className="flex flex-col gap-2 sm:flex-row">
                <button type="button" onClick={sendEmailOtp} disabled={sendingEmailOtp} className="flex-shrink-0 rounded-xl bg-blue-600 px-3 py-2.5 text-xs font-bold text-white disabled:opacity-50">
                  {sendingEmailOtp ? "Sending..." : profile.contact.emailOtpSent ? "Resend Code" : "Send Code"}
                </button>
                {profile.contact.emailOtpSent && (
                  <>
                    <TextInput value={profile.contact.emailOtp} onChange={(e) => set("contact", "emailOtp", e.target.value)} placeholder="6-digit code" />
                    <button type="button" onClick={verifyEmailOtp} className="flex-shrink-0 rounded-xl bg-emerald-600 px-3 py-2.5 text-xs font-bold text-white">Verify</button>
                  </>
                )}
              </div>
            )}
          </Field>
        </SectionCard>
        <SectionCard title="Account Credentials" icon={KeyRound}>
          <Field label="Password" required>
            <div className="relative max-w-sm">
              <TextInput type={showPass ? "text" : "password"} value={account.password} onChange={(e) => setAccount({ ...account, password: e.target.value })} placeholder="Create a strong password" />
              <button type="button" onClick={() => setShowPass((s) => !s)} className="absolute right-3 top-2.5 text-slate-400">
                {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </Field>
        </SectionCard>
        </>
      ),
    },
    {
      title: "Career Preference",
      subtitle: "What kind of role are you looking for?",
      content: (
        <SectionCard title="Career Preference" icon={Briefcase}>
          <Field label="Job Title You Are Looking For" required className="sm:col-span-2">
            <TextInput value={profile.career.jobTitle} onChange={(e) => set("career", "jobTitle", e.target.value)} placeholder="e.g. Frontend Developer" />
          </Field>
          <Field label="Preferred Industry" className="sm:col-span-2">
            <ChipMultiSelect options={INDUSTRIES} value={profile.career.industries} onChange={(v) => set("career", "industries", v)} />
          </Field>
          <Field label="Preferred Job Type">
            <PillGroup options={JOB_TYPES} value={profile.career.jobType} onChange={(v) => set("career", "jobType", v)} />
          </Field>
          <Field label="Preferred Work Mode">
            <PillGroup options={WORK_MODES} value={profile.career.workMode} onChange={(v) => set("career", "workMode", v)} />
          </Field>
          <Field label="Preferred Job Location(s)"><TextInput value={profile.career.locations} onChange={(e) => set("career", "locations", e.target.value)} placeholder="e.g. Delhi, Bangalore, Remote" /></Field>
          <Field label="Search Radius"><SelectInput options={RADII} value={profile.career.radius} onChange={(e) => set("career", "radius", e.target.value)} /></Field>
        </SectionCard>
      ),
    },
    {
      title: "Salary Expectation",
      subtitle: "Set your salary range",
      content: (
        <SectionCard title="Salary Expectation" icon={Wallet}>
          <Field label="Current Salary (₹ / year)"><TextInput maxLength={12} type="number" value={profile.salary.current} onChange={(e) => set("salary", "current", e.target.value)} /></Field>
          <Field label="Expected Salary (₹ / year)"><TextInput maxLength={12} type="number" value={profile.salary.expected} onChange={(e) => set("salary", "expected", e.target.value)} /></Field>
          <Field label="Minimum Salary (₹ / year)"><TextInput maxLength={12} type="number" value={profile.salary.min} onChange={(e) => set("salary", "min", e.target.value)} /></Field>
          <Field label="Maximum Salary (₹ / year)"><TextInput maxLength={12} type="number" value={profile.salary.max} onChange={(e) => set("salary", "max", e.target.value)} /></Field>
          <Field label="Salary Negotiable?"><ToggleYesNo value={profile.salary.negotiable} onChange={(v) => set("salary", "negotiable", v)} /></Field>
        </SectionCard>
      ),
    },
    {
      title: "Experience",
      subtitle: "Your work history",
      content: (
        <SectionCard title="Experience" icon={Briefcase}>
          <Field label="Employment Type">
            <PillGroup options={["Fresher", "Experienced"]} value={profile.experience.employmentType} onChange={(v) => set("experience", "employmentType", v)} />
          </Field>
          <Field label="Years / Months of Experience">
            <div className="flex gap-2">
              <TextInput type="number" placeholder="Years" value={profile.experience.years} onChange={(e) => set("experience", "years", e.target.value)} />
              <TextInput type="number" placeholder="Months" value={profile.experience.months} onChange={(e) => set("experience", "months", e.target.value)} />
            </div>
          </Field>
          {profile.experience.employmentType === "Experienced" && (
            <>
              <Field label="Current Employment Status">
                <SelectInput options={["Working", "Notice Period", "Serving Notice", "Unemployed", "Student"]} value={profile.experience.status} onChange={(e) => set("experience", "status", e.target.value)} />
              </Field>
              <Field label="Notice Period">
                <SelectInput options={NOTICE_PERIODS} value={profile.experience.noticePeriod} onChange={(e) => set("experience", "noticePeriod", e.target.value)} />
              </Field>
              <Field label="Current Company"><TextInput value={profile.experience.company} onChange={(e) => set("experience", "company", e.target.value)} /></Field>
              <Field label="Current Designation"><TextInput value={profile.experience.designation} onChange={(e) => set("experience", "designation", e.target.value)} /></Field>
              <Field label="Reason for Job Change" className="col-span-full">
                <TextArea value={profile.experience.reasonForChange} onChange={(e) => set("experience", "reasonForChange", e.target.value)} placeholder="e.g. Looking for better growth opportunities and exposure to modern technical stacks." />
              </Field>
            </>
          )}
        </SectionCard>
      ),
    },
    {
      title: "Education",
      subtitle: "Your academic background",
      content: (
        <SectionCard title="Education" icon={GraduationCap}>
          <Field label="Highest Qualification">
            <SelectInput options={QUALIFICATIONS} value={profile.education.qualification} onChange={(e) => set("education", "qualification", e.target.value)} />
            {profile.education.qualification === "Other" && (
              <TextInput className="mt-2" placeholder="Enter your qualification manually" value={profile.education.otherQualification} onChange={(e) => set("education", "otherQualification", e.target.value)} />
            )}
          </Field>
          <Field label="College / University"><TextInput value={profile.education.college} onChange={(e) => set("education", "college", e.target.value)} /></Field>
          <Field label="Passing Year"><TextInput type="number" placeholder="e.g. 2024" value={profile.education.passingYear} onChange={(e) => set("education", "passingYear", e.target.value)} /></Field>
          <Field label="Percentage / CGPA"><TextInput value={profile.education.percentage} onChange={(e) => set("education", "percentage", e.target.value)} /></Field>
        </SectionCard>
      ),
    },
    {
      title: "Skills & Certifications",
      subtitle: "Showcase your expertise",
      content: (
        <SectionCard title="Technical Skills & Certifications" icon={Award}>
          <Field label="Skills" className="col-span-full">
            <RepeatableList
              items={profile.skills}
              addLabel="Add skill"
              onAdd={() => setProfile((p) => ({ ...p, skills: [...p.skills, { skill: "", level: "Intermediate" }] }))}
              onRemove={(i) => setProfile((p) => ({ ...p, skills: p.skills.filter((_, idx) => idx !== i) }))}
              renderItem={(item, i) => (
                <>
                  <TextInput className="sm:col-span-2" placeholder="e.g. React.js" value={item.skill} onChange={(e) => setProfile((p) => { const s = [...p.skills]; s[i] = { ...s[i], skill: e.target.value }; return { ...p, skills: s }; })} />
                  <SelectInput options={SKILL_LEVELS} value={item.level} onChange={(e) => setProfile((p) => { const s = [...p.skills]; s[i] = { ...s[i], level: e.target.value }; return { ...p, skills: s }; })} />
                </>
              )}
            />
          </Field>
          <Field label="Certifications" className="col-span-full">
            <RepeatableList
              items={profile.certifications}
              addLabel="Add certification"
              onAdd={() => setProfile((p) => ({ ...p, certifications: [...p.certifications, { name: "", issuer: "", issueDate: "", expiryDate: "" }] }))}
              onRemove={(i) => setProfile((p) => ({ ...p, certifications: p.certifications.filter((_, idx) => idx !== i) }))}
              renderItem={(item, i) => (
                <>
                  <TextInput placeholder="Certificate Name" value={item.name} onChange={(e) => setProfile((p) => { const c = [...p.certifications]; c[i] = { ...c[i], name: e.target.value }; return { ...p, certifications: c }; })} />
                  <TextInput placeholder="Issuing Organization" value={item.issuer} onChange={(e) => setProfile((p) => { const c = [...p.certifications]; c[i] = { ...c[i], issuer: e.target.value }; return { ...p, certifications: c }; })} />
                  <TextInput type="date" placeholder="Issue Date" value={item.issueDate} onChange={(e) => setProfile((p) => { const c = [...p.certifications]; c[i] = { ...c[i], issueDate: e.target.value }; return { ...p, certifications: c }; })} />
                  <TextInput type="date" placeholder="Expiry Date" value={item.expiryDate} onChange={(e) => setProfile((p) => { const c = [...p.certifications]; c[i] = { ...c[i], expiryDate: e.target.value }; return { ...p, certifications: c }; })} />
                  <div className="col-span-full mt-1.5">
                    <FileDrop label="Upload Certificate PDF/Image" accept="image/*,.pdf" onChange={(e) => setCertFiles({...certFiles, [i]: e.target.files?.[0]})} fileNames={certFiles[i] ? [certFiles[i].name] : []} />
                  </div>
                </>
              )}
            />
          </Field>
        </SectionCard>
      ),
    },
    {
      title: "Documents & Portfolio",
      subtitle: "Upload your resume and showcase your work",
      content: (
        <SectionCard title="Documents & Portfolio" icon={FileText}>
          <Field label="Resume Upload" required hint="PDF/DOCX, max 10MB">
            <FileDrop label="Upload resume" accept=".pdf,.doc,.docx" onChange={(e) => setResume(e.target.files?.[0])} fileNames={resume ? [resume.name] : []} />
          </Field>
          <Field label="Video Introduction" hint="Max 60 seconds">
            <FileDrop label="Upload short video" accept="video/*" onChange={(e) => setVideoIntro(e.target.files?.[0])} fileNames={videoIntro ? [videoIntro.name] : []} />
          </Field>
          <Field label="LinkedIn"><TextInput value={profile.portfolioLinks.linkedin} onChange={(e) => setProfile((p) => ({ ...p, portfolioLinks: { ...p.portfolioLinks, linkedin: e.target.value } }))} placeholder="https://linkedin.com/in/you" /></Field>
          <Field label="GitHub"><TextInput value={profile.portfolioLinks.github} onChange={(e) => setProfile((p) => ({ ...p, portfolioLinks: { ...p.portfolioLinks, github: e.target.value } }))} placeholder="https://github.com/you" /></Field>
          <Field label="Portfolio Website"><TextInput value={profile.portfolioLinks.portfolioWebsite} onChange={(e) => setProfile((p) => ({ ...p, portfolioLinks: { ...p.portfolioLinks, portfolioWebsite: e.target.value } }))} placeholder="https://yourportfolio.com" /></Field>
          <Field label="Behance"><TextInput value={profile.portfolioLinks.behance} onChange={(e) => setProfile((p) => ({ ...p, portfolioLinks: { ...p.portfolioLinks, behance: e.target.value } }))} /></Field>
          <Field label="Dribbble"><TextInput value={profile.portfolioLinks.dribbble} onChange={(e) => setProfile((p) => ({ ...p, portfolioLinks: { ...p.portfolioLinks, dribbble: e.target.value } }))} /></Field>
          <Field label="YouTube"><TextInput value={profile.portfolioLinks.youtube} onChange={(e) => setProfile((p) => ({ ...p, portfolioLinks: { ...p.portfolioLinks, youtube: e.target.value } }))} /></Field>
          <Field label="Other Links" className="sm:col-span-2"><TextInput value={profile.portfolioLinks.otherLinks} onChange={(e) => setProfile((p) => ({ ...p, portfolioLinks: { ...p.portfolioLinks, otherLinks: e.target.value } }))} placeholder="Any other links" /></Field>
          
          <div className="col-span-full border-t border-slate-100 dark:border-slate-800 pt-5 mt-3">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Official Verification Documents</h4>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3">
              <Field label="Aadhaar Card" required>
                <FileDrop label="Aadhaar PDF/Image" accept=".pdf,image/*" onChange={(e) => setDocUploads({...docUploads, aadhaarCard: e.target.files?.[0]})} fileNames={docUploads.aadhaarCard ? [docUploads.aadhaarCard.name] : []} />
              </Field>
              <Field label="PAN Card" required>
                <FileDrop label="PAN PDF/Image" accept=".pdf,image/*" onChange={(e) => setDocUploads({...docUploads, panCard: e.target.files?.[0]})} fileNames={docUploads.panCard ? [docUploads.panCard.name] : []} />
              </Field>
              <Field label="Passport">
                <FileDrop label="Passport PDF/Image" accept=".pdf,image/*" onChange={(e) => setDocUploads({...docUploads, passport: e.target.files?.[0]})} fileNames={docUploads.passport ? [docUploads.passport.name] : []} />
              </Field>
              <Field label="Driving License">
                <FileDrop label="License PDF/Image" accept=".pdf,image/*" onChange={(e) => setDocUploads({...docUploads, drivingLicenseDoc: e.target.files?.[0]})} fileNames={docUploads.drivingLicenseDoc ? [docUploads.drivingLicenseDoc.name] : []} />
              </Field>
              <Field label="Experience Letter">
                <FileDrop label="Experience Letter" accept=".pdf,image/*" onChange={(e) => setDocUploads({...docUploads, experienceLetter: e.target.files?.[0]})} fileNames={docUploads.experienceLetter ? [docUploads.experienceLetter.name] : []} />
              </Field>
              <Field label="Offer Letter">
                <FileDrop label="Offer Letter" accept=".pdf,image/*" onChange={(e) => setDocUploads({...docUploads, offerLetter: e.target.files?.[0]})} fileNames={docUploads.offerLetter ? [docUploads.offerLetter.name] : []} />
              </Field>
              <Field label="Salary Slip">
                <FileDrop label="Salary Slip" accept=".pdf,image/*" onChange={(e) => setDocUploads({...docUploads, salarySlip: e.target.files?.[0]})} fileNames={docUploads.salarySlip ? [docUploads.salarySlip.name] : []} />
              </Field>
              <Field label="Educational Certificates">
                <FileDrop label="Educational Certificates" accept=".pdf,image/*" onChange={(e) => setDocUploads({...docUploads, educationalCertificates: e.target.files?.[0]})} fileNames={docUploads.educationalCertificates ? [docUploads.educationalCertificates.name] : []} />
              </Field>
              <Field label="Passport Size Photo">
                <FileDrop label="Passport Size Photo" accept="image/*" onChange={(e) => setDocUploads({...docUploads, passportSizePhoto: e.target.files?.[0]})} fileNames={docUploads.passportSizePhoto ? [docUploads.passportSizePhoto.name] : []} />
              </Field>
            </div>
          </div>
        </SectionCard>
      ),
    },
    {
      title: "Preferences & Languages",
      subtitle: "Work preferences and languages you know",
      content: (
        <SectionCard title="Work Preferences & Languages" icon={Globe2}>
          <Field label="Languages Known" className="col-span-full">
            <RepeatableList
              items={profile.workPrefs.languages}
              addLabel="Add language"
              onAdd={() => setProfile((p) => ({ ...p, workPrefs: { ...p.workPrefs, languages: [...p.workPrefs.languages, { language: "", speaking: true, reading: true, writing: true, fluency: "Fluent" }] } }))}
              onRemove={(i) => setProfile((p) => ({ ...p, workPrefs: { ...p.workPrefs, languages: p.workPrefs.languages.filter((_, idx) => idx !== i) } }))}
              renderItem={(item, i) => (
                <>
                  <TextInput placeholder="Language" value={item.language} onChange={(e) => setProfile((p) => { const l = [...p.workPrefs.languages]; l[i] = { ...l[i], language: e.target.value }; return { ...p, workPrefs: { ...p.workPrefs, languages: l } }; })} />
                  <SelectInput placeholder="Fluency" options={["Beginner", "Intermediate", "Fluent", "Native"]} value={item.fluency} onChange={(e) => setProfile((p) => { const l = [...p.workPrefs.languages]; l[i] = { ...l[i], fluency: e.target.value }; return { ...p, workPrefs: { ...p.workPrefs, languages: l } }; })} />
                  <div className="flex items-center gap-3 sm:col-span-2">
                    {["speaking", "reading", "writing"].map((k) => (
                      <CheckboxRow key={k} checked={item[k]} label={k[0].toUpperCase() + k.slice(1)} onChange={(v) => setProfile((p) => { const l = [...p.workPrefs.languages]; l[i] = { ...l[i], [k]: v }; return { ...p, workPrefs: { ...p.workPrefs, languages: l } }; })} />
                    ))}
                  </div>
                </>
              )}
            />
          </Field>
          <Field label="Preferred Shift"><SelectInput options={SHIFTS} value={profile.workPrefs.shift} onChange={(e) => setProfile((p) => ({ ...p, workPrefs: { ...p.workPrefs, shift: e.target.value } }))} /></Field>
          <Field label="Weekly Off"><SelectInput options={WEEKLY_OFFS} value={profile.workPrefs.weeklyOff} onChange={(e) => setProfile((p) => ({ ...p, workPrefs: { ...p.workPrefs, weeklyOff: e.target.value } }))} /></Field>
          <Field label="Other Preferences" className="col-span-full">
            <div className="flex flex-wrap gap-4">
              <CheckboxRow checked={profile.workPrefs.relocate} label="Ready to Relocate" onChange={(v) => setProfile((p) => ({ ...p, workPrefs: { ...p.workPrefs, relocate: v } }))} />
              <CheckboxRow checked={profile.workPrefs.travel} label="Ready to Travel" onChange={(v) => setProfile((p) => ({ ...p, workPrefs: { ...p.workPrefs, travel: v } }))} />
              <CheckboxRow checked={profile.workPrefs.passport} label="Passport Available" onChange={(v) => setProfile((p) => ({ ...p, workPrefs: { ...p.workPrefs, passport: v } }))} />
              <CheckboxRow checked={profile.workPrefs.drivingLicense} label="Driving License Available" onChange={(v) => setProfile((p) => ({ ...p, workPrefs: { ...p.workPrefs, drivingLicense: v } }))} />
              <CheckboxRow checked={profile.workPrefs.ownVehicle} label="Own Vehicle" onChange={(v) => setProfile((p) => ({ ...p, workPrefs: { ...p.workPrefs, ownVehicle: v } }))} />
            </div>
          </Field>
        </SectionCard>
      ),
    },
    {
      title: "AI Tools & Review",
      subtitle: "Fine-tune your job alerts and AI features, then submit",
      content: (
        <>
          <SectionCard title="AI & Advanced Platform Features" icon={Sparkles}>
            <Field label="Job Alerts Via" className="sm:col-span-2"><ChipMultiSelect options={ALERT_CHANNELS} value={profile.platform.alertChannels} onChange={(v) => set("platform", "alertChannels", v)} /></Field>
            <Field label="Alert Frequency"><PillGroup options={ALERT_FREQ} value={profile.platform.alertFrequency} onChange={(v) => set("platform", "alertFrequency", v)} /></Field>
            <Field label="AI Feature Opt-ins" className="col-span-full">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                <CheckboxRow checked={profile.platform.aiResume} label="Generate AI Resume" onChange={(v) => set("platform", "aiResume", v)} />
                <CheckboxRow checked={profile.platform.aiSkillTest} label="Take Skill Test" onChange={(v) => set("platform", "aiSkillTest", v)} />
                <CheckboxRow checked={profile.platform.aiMockInterview} label="AI Mock Interview" onChange={(v) => set("platform", "aiMockInterview", v)} />
                <CheckboxRow checked={profile.platform.aiVoiceInterview} label="AI Voice Interview Practice" onChange={(v) => set("platform", "aiVoiceInterview", v)} />
                <CheckboxRow checked={profile.platform.aiVideoInterview} label="AI Video Interview Practice" onChange={(v) => set("platform", "aiVideoInterview", v)} />
                <CheckboxRow checked={profile.platform.aiCodingTest} label="AI Coding Test Practice" onChange={(v) => set("platform", "aiCodingTest", v)} />
                <CheckboxRow checked={profile.platform.aiAptitudeTest} label="AI Aptitude Test Practice" onChange={(v) => set("platform", "aiAptitudeTest", v)} />
              </div>
              <p className="mt-2 text-xs text-slate-400">AI-generated content activates automatically once an AI provider key is configured on the backend — your opt-in is saved either way.</p>
            </Field>
          </SectionCard>

          <SectionCard title="Consent & Review" icon={ShieldCheck}>
            <Field label="Background Verification" className="col-span-full">
              <CheckboxRow checked={profile.platform.backgroundVerification} label="I consent to background verification checks by prospective employers" onChange={(v) => set("platform", "backgroundVerification", v)} />
            </Field>
            <Field label="Terms" className="col-span-full">
              <CheckboxRow checked={agreedTerms} label="I agree to the Terms of Service and Privacy Policy" onChange={setAgreedTerms} />
            </Field>
          </SectionCard>
        </>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300">
      <Navbar />
      <div className="border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-slate-900 via-blue-950 to-cyan-950 dark:from-slate-950 dark:via-blue-950 dark:to-slate-950 px-4 py-12 text-center relative overflow-hidden">
        {/* Background shimmers */}
        <div className="absolute top-0 left-0 h-40 w-40 rounded-full bg-blue-600/10 blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 h-40 w-40 rounded-full bg-cyan-600/10 blur-2xl pointer-events-none" />

        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="relative z-10">
          <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/10 dark:bg-slate-900/40 border border-white/20 dark:border-slate-800 px-4 py-1.5 text-xs font-bold text-blue-200 backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5" /> Free candidate profile in minutes
          </span>
          <h1 className="font-display text-3xl font-black text-white sm:text-4xl tracking-tight">Create Your Candidate Profile</h1>
          <p className="mx-auto mt-2 max-w-xl text-sm text-slate-300 font-display">
            A complete profile gets 3x more recruiter views. It only takes a few minutes.
          </p>
        </motion.div>

        <div className="mx-auto mt-6 inline-flex rounded-2xl border border-white/10 dark:border-slate-800 bg-white/5 dark:bg-slate-900/30 p-1 backdrop-blur-sm relative z-10">
          {[
            { value: "Employee", label: "I'm a Job Seeker", icon: Briefcase },
            { value: "Recruiter", label: "I'm Hiring", icon: Users },
          ].map((r) => (
            <button
              key={r.value}
              onClick={() => (r.value === "Recruiter" ? navigate("/recruiter/register") : setRole(r.value))}
              className={`flex items-center gap-2 rounded-xl px-5 py-2 text-sm font-bold transition-all ${
                role === r.value 
                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-lg" 
                  : "text-slate-300 hover:text-white dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              <r.icon className="h-4 w-4" /> {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-10">
        <Link to="/login" className="mb-6 inline-flex items-center gap-1.5 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Already have an account? Log in
        </Link>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 md:p-8 shadow-xl">
          <StepWizard steps={steps} onSubmit={submitHandler} submitting={submitting} submitLabel="Create My Profile" validateStep={validateStep} />
        </div>
      </div>
      <Footer />
      <FloatingThemeToggle />
    </div>
  );
};

export default Register;
