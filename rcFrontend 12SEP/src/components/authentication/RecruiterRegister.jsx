import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import FloatingThemeToggle from "../components_lite/FloatingThemeToggle";
import axios from "axios";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { setLoading } from "@/redux/authSlice";
import {
  Building2, MapPin, UserRound, Briefcase, Receipt, KeyRound, CreditCard,
  FileText, ShieldCheck, ArrowLeft, Eye, EyeOff, Sparkles, Phone, HelpCircle
} from "lucide-react";
import { USER_API_ENDPOINT } from "@/utils/data";
import Navbar from "../components_lite/Navbar";
import Footer from "../components_lite/Footer";
import StepWizard from "../wizard/StepWizard";
import AddressAutocomplete from "../wizard/AddressAutocomplete";
import {
  Field, TextInput, TextArea, SelectInput, PillGroup, ChipMultiSelect,
  CheckboxRow, FileDrop, SectionCard, RepeatableList,
} from "../wizard/formFields";

const COMPANY_TYPES = [
  "Private Limited Company", "Public Limited Company", "LLP", "Partnership Firm", 
  "Proprietorship", "Startup", "MSME", "Government Organization", "NGO", 
  "Educational Institution", "Hospital", "Recruitment Consultancy", "Staffing Company", "MNC", "Other"
];

const INDUSTRIES = [
  "Information Technology", "Artificial Intelligence", "Software Development", 
  "Manufacturing", "Healthcare", "Banking", "Finance", "Education", "Retail", 
  "E-commerce", "Construction", "Hospitality", "Telecom", "Logistics", 
  "Automobile", "Real Estate", "Pharmaceutical", "Media", "Marketing", "Other"
];

const COMPANY_SIZES = ["1-10", "11-25", "26-50", "51-100", "101-250", "251-500", "501-1000", "1000+"];
const HIRING_FOR = ["Your Own Company", "Client Companies (Consultancy)", "Both"];
const HIRING_VOLUME = ["1-5 Candidates", "5-20 Candidates", "20-50 Candidates", "50-100 Candidates", "100+ Candidates"];
const HIRING_FREQ = ["Daily", "Weekly", "Monthly", "Quarterly", "Occasionally"];
const PLANS = ["Free", "Basic", "Professional", "Enterprise"];
const PAYMENT_METHODS = ["UPI", "Credit Card", "Debit Card", "Net Banking", "Bank Transfer"];

const SECURITY_QUESTIONS = [
  "What is your mother's maiden name?",
  "What was the name of your first pet?",
  "What was the name of your first school?",
  "In what city were you born?",
  "What is your favorite book?"
];

const DESIGNATIONS = [
  "HR Manager", "HR Executive", "Recruiter", "Director", "CEO", "Founder", "Owner", "Hiring Manager", "Team Lead", "Other"
];

const YEARS = Array.from({ length: 2026 - 1950 + 1 }, (_, i) => String(2026 - i));

const emptyForm = {
  company: {
    name: "", website: "", email: "", mobile: "", whatsapp: "", sameAsMobile: false,
    type: "Private Limited Company", industry: "Information Technology", size: "1-10", description: "", yearEstablished: "2024",
    emailOtp: "", emailOtpSent: false, emailVerified: false,
    mobileOtp: "", mobileOtpSent: false, mobileVerified: false,
  },
  address: {
    country: "", state: "", city: "", area: "", sector: "", building: "", floor: "", pinCode: "", landmark: "", googleMapsUrl: "",
  },
  branches: [],
  contact: { fullname: "", designation: "HR Manager", department: "", email: "", mobile: "", whatsapp: "" },
  hiring: { hiringFor: "Your Own Company", volume: "1-5 Candidates", frequency: "Monthly", locations: "", industries: [] },
  billing: { gst: "", pan: "", cin: "", msme: "", billingAddress: "" },
  account: { username: "", securityQuestion: SECURITY_QUESTIONS[0], securityAnswer: "" },
  subscription: { plan: "Free", paymentMethod: "UPI" },
  agreements: { accuracy: false, authorized: false, terms: false, privacy: false, antiDiscrimination: false, antiViolation: false },
  verificationStatus: "Pending",
};

const RecruiterRegister = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [form, setForm] = useState(emptyForm);
  const [account, setAccount] = useState({ password: "", confirmPassword: "" });
  const [showPass, setShowPass] = useState(false);
  const [logo, setLogo] = useState(null);
  
  const [docs, setDocs] = useState({
    regCertificate: null,
    panCard: null,
    gstCertificate: null,
    signatoryIdProof: null,
    addressProof: null,
    cinCertificate: null,
    msmeCertificate: null,
    startupIndiaCert: null,
    isoCertificate: null,
    shopEstCert: null,
    iecCode: null,
    tradeLicence: null,
    labourLicence: null
  });

  const [submitting, setSubmitting] = useState(false);

  const set = (section, key, value) => setForm((f) => ({ ...f, [section]: { ...f[section], [key]: value } }));

  // Email OTP
  const [sendingEmailOtp, setSendingEmailOtp] = useState(false);
  const sendCompanyEmailOtp = async () => {
    if (!form.company.email) return toast.error("Enter your company email first");
    setSendingEmailOtp(true);
    try {
      const res = await axios.post(`${USER_API_ENDPOINT}/otp/email/send`, { email: form.company.email });
      if (res.data.success) {
        set("company", "emailOtpSent", true);
        toast.success(res.data.mocked ? `OTP generated (mock mode). Your code: ${res.data.devOtp}` : "OTP sent to your email");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not send OTP email");
    } finally {
      setSendingEmailOtp(false);
    }
  };

  const verifyCompanyEmailOtp = async () => {
    try {
      const res = await axios.post(`${USER_API_ENDPOINT}/otp/email/verify`, { email: form.company.email, otp: form.company.emailOtp });
      if (res.data.success) {
        set("company", "emailVerified", true);
        toast.success("Company email verified");
      } else {
        toast.error(res.data.message || "Invalid OTP");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Verification failed");
    }
  };

  // Mobile OTP (Simulated)
  const [sendingMobileOtp, setSendingMobileOtp] = useState(false);
  const sendCompanyMobileOtp = async () => {
    if (!form.company.mobile || form.company.mobile.length < 10) return toast.error("Enter a valid 10-digit company mobile number first");
    setSendingMobileOtp(true);
    setTimeout(() => {
      setSendingMobileOtp(false);
      set("company", "mobileOtpSent", true);
      const mockCode = String(Math.floor(100000 + Math.random() * 900000));
      window.devMobileOtp = mockCode;
      toast.success(`Mobile OTP generated (mock mode). Your code: ${mockCode}`);
    }, 800);
  };

  const verifyCompanyMobileOtp = async () => {
    if (form.company.mobileOtp === window.devMobileOtp || form.company.mobileOtp === "123456") {
      set("company", "mobileVerified", true);
      toast.success("Mobile number verified ✓");
    } else {
      toast.error("Invalid mobile OTP. Please try again.");
    }
  };

  const allAgreed = useMemo(() => Object.values(form.agreements).every(Boolean), [form.agreements]);
  
  const validateForm = () => {
    const missing = [];
    if (!form.company.name) missing.push("Company Name");
    if (!form.company.email) missing.push("Company Email");
    if (!form.company.mobile) missing.push("Company Mobile");
    if (!form.company.type) missing.push("Company Type");
    if (!form.company.industry) missing.push("Industry");
    if (!form.company.size) missing.push("Company Size");
    if (!form.company.description) missing.push("Company Description");
    if (!form.address.country) missing.push("Country");
    if (!form.address.state) missing.push("State");
    if (!form.address.city) missing.push("City");
    if (!form.contact.fullname) missing.push("Contact Person Name");
    if (!form.contact.designation) missing.push("Designation");
    if (!form.contact.email) missing.push("Contact Email");
    if (!form.contact.mobile) missing.push("Contact Mobile");
    if (!account.password) missing.push("Password");
    if (!form.account.username) missing.push("Username");
    if (!allAgreed) missing.push("Terms Acceptance");

    if (missing.length > 0) {
      toast.error(`Required fields missing: ${missing.slice(0, 3).join(", ")}${missing.length > 3 ? "..." : ""}`);
      return false;
    }
    
    // Additional global validations before submit
    if (account.password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return false;
    }
    if (account.password !== account.confirmPassword) {
      toast.error("Passwords do not match.");
      return false;
    }
    return true;
  };

  const validateStep = (currentStepIndex) => {
    // Regex Patterns
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10}$/;
    const pinRegex = /^[0-9]{6}$/;
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    
    if (currentStepIndex === 0) {
      if (!form.company.name || form.company.name.length < 2) return "Valid Company Name is required.";
      if (!form.company.email || !emailRegex.test(form.company.email)) return "Valid Company Email is required.";
      if (!form.company.emailVerified) return "Please verify your company email using the OTP before proceeding.";
      if (!form.company.mobile || !phoneRegex.test(form.company.mobile)) return "Valid 10-digit Mobile Number is required.";
      if (form.company.whatsapp && !phoneRegex.test(form.company.whatsapp)) return "WhatsApp Number must be a valid 10-digit number.";
      if (!form.company.type) return "Company Type is required.";
      if (!form.company.industry) return "Industry is required.";
      if (!form.company.size) return "Company Size is required.";
      if (!form.company.description || form.company.description.length < 10) return "Company Description is required (min 10 characters).";
    }
    
    if (currentStepIndex === 1) {
      if (!form.address.country) return "Country is required.";
      if (!form.address.state) return "State is required.";
      if (!form.address.city) return "City is required.";
      if (!form.address.pinCode || !pinRegex.test(form.address.pinCode)) return "Valid 6-digit PIN code is required.";
      
      if (form.branches.length > 0) {
        for (const branch of form.branches) {
          if (!branch.city || !branch.state) return "Branch city and state cannot be empty.";
          if (branch.pinCode && !pinRegex.test(branch.pinCode)) return "Branch PIN code must be a valid 6-digit number.";
        }
      }
    }
    
    if (currentStepIndex === 2) {
      if (!form.contact.fullname || form.contact.fullname.length < 2) return "Valid Contact Person Name is required.";
      if (!form.contact.designation) return "Designation is required.";
      if (!form.contact.email || !emailRegex.test(form.contact.email)) return "Valid Contact Email is required.";
      if (!form.contact.mobile || !phoneRegex.test(form.contact.mobile)) return "Valid 10-digit Contact Mobile is required.";
    }
    
    if (currentStepIndex === 3) {
      if (!form.hiring.hiringFor) return "Please specify who you are hiring for.";
      if (!form.hiring.volume) return "Please specify the hiring volume.";
      if (!form.hiring.frequency) return "Please specify the hiring frequency.";
    }
    
    if (currentStepIndex === 4) {
      if (form.billing.gst && !gstRegex.test(form.billing.gst)) return "Invalid GST Number format.";
      if (form.billing.pan && form.billing.pan.length !== 10) return "Invalid PAN format (must be 10 characters).";
    }
    
    if (currentStepIndex === 5) {
      if (!form.account.username || form.account.username.trim().length < 3) return "Username must be at least 3 characters long.";
      if (!account.password || account.password.length < 6) return "Password must be at least 6 characters long.";
      if (account.password !== account.confirmPassword) return "Passwords do not match.";
      if (!form.account.securityAnswer) return "Security question answer is required.";
    }

    if (currentStepIndex === 6) {
      if (!allAgreed) return "You must accept all terms, conditions, and compliance checks to register.";
    }

    return true;
  };

  const submitHandler = async () => {
    if (!validateForm()) return;

    const formData = new FormData();
    formData.append("fullname", form.contact.fullname || form.company.name);
    formData.append("email", form.company.email);
    formData.append("password", account.password);
    formData.append("phoneNumber", form.company.mobile);
    formData.append("role", "Recruiter");
    formData.append("companyName", form.company.name);
    formData.append("gstNumber", form.billing.gst);
    
    // Save docs metadata mapping inside profileData JSON
    const updatedForm = {
      ...form,
      documents: {
        regCertificate: docs.regCertificate ? docs.regCertificate.name : null,
        panCard: docs.panCard ? docs.panCard.name : null,
        gstCertificate: docs.gstCertificate ? docs.gstCertificate.name : null,
        signatoryIdProof: docs.signatoryIdProof ? docs.signatoryIdProof.name : null,
        addressProof: docs.addressProof ? docs.addressProof.name : null,
        cinCertificate: docs.cinCertificate ? docs.cinCertificate.name : null,
        msmeCertificate: docs.msmeCertificate ? docs.msmeCertificate.name : null,
        startupIndiaCert: docs.startupIndiaCert ? docs.startupIndiaCert.name : null,
        isoCertificate: docs.isoCertificate ? docs.isoCertificate.name : null,
        shopEstCert: docs.shopEstCert ? docs.shopEstCert.name : null,
        iecCode: docs.iecCode ? docs.iecCode.name : null,
        tradeLicence: docs.tradeLicence ? docs.tradeLicence.name : null,
        labourLicence: docs.labourLicence ? docs.labourLicence.name : null
      }
    };
    formData.append("profileData", JSON.stringify(updatedForm));
    if (logo) formData.append("companyLogo", logo);
    
    // Append all selected docs to verificationDocs array
    Object.values(docs).forEach((file) => {
      if (file) {
        formData.append("verificationDocs", file);
      }
    });

    try {
      setSubmitting(true);
      dispatch(setLoading(true));
      const res = await axios.post(`${USER_API_ENDPOINT}/register`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
      if (res.data.success) {
        toast.success("Employer account created — pending Super Admin verification");
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
      title: "Company Info",
      subtitle: "Tell us about your organization",
      content: (
        <SectionCard title="Company Information" icon={Building2}>
          <Field label="Company Name" required><TextInput value={form.company.name} onChange={(e) => set("company", "name", e.target.value)} /></Field>
          <Field label="Company Logo"><FileDrop label="Upload logo (JPG/PNG/SVG)" accept="image/*" onChange={(e) => setLogo(e.target.files?.[0])} fileNames={logo ? [logo.name] : []} /></Field>
          <Field label="Company Website"><TextInput value={form.company.website} onChange={(e) => set("company", "website", e.target.value)} placeholder="https://" /></Field>
          
          <Field label="Company Email" required hint="We'll email you a verification code">
            <TextInput type="email" value={form.company.email} onChange={(e) => set("company", "email", e.target.value)} disabled={form.company.emailVerified} className={form.company.emailVerified ? "bg-slate-50" : ""} />
          </Field>
          <Field label="Verify Email">
            {form.company.emailVerified ? (
              <span className="inline-flex w-fit items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">Email verified ✓</span>
            ) : (
              <div className="flex flex-col gap-2 sm:flex-row">
                <button type="button" onClick={sendCompanyEmailOtp} disabled={sendingEmailOtp} className="flex-shrink-0 rounded-xl bg-blue-600 px-3 py-2.5 text-xs font-bold text-white disabled:opacity-50">
                  {sendingEmailOtp ? "Sending..." : form.company.emailOtpSent ? "Resend Code" : "Send Code"}
                </button>
                {form.company.emailOtpSent && (
                  <>
                    <TextInput value={form.company.emailOtp} onChange={(e) => set("company", "emailOtp", e.target.value)} placeholder="6-digit code" />
                    <button type="button" onClick={verifyCompanyEmailOtp} className="flex-shrink-0 rounded-xl bg-emerald-600 px-3 py-2.5 text-xs font-bold text-white">Verify</button>
                  </>
                )}
              </div>
            )}
          </Field>

          <Field label="Mobile Number" required>
            <TextInput maxLength={10} value={form.company.mobile} onChange={(e) => set("company", "mobile", e.target.value.replace(/\D/g, ""))} placeholder="Enter 10-digit mobile number" />
          </Field>

          <Field label="WhatsApp Number">
            <TextInput maxLength={10} value={form.company.sameAsMobile ? form.company.mobile : form.company.whatsapp} disabled={form.company.sameAsMobile} onChange={(e) => set("company", "whatsapp", e.target.value.replace(/\D/g, ""))} className={form.company.sameAsMobile ? "bg-slate-50 animate-pulse" : ""} />
            <CheckboxRow checked={form.company.sameAsMobile} label="Same as mobile" onChange={(v) => set("company", "sameAsMobile", v)} />
          </Field>

          <Field label="Company Type" required><SelectInput options={COMPANY_TYPES} value={form.company.type} onChange={(e) => set("company", "type", e.target.value)} /></Field>
          <Field label="Industry" required><SelectInput options={INDUSTRIES} value={form.company.industry} onChange={(e) => set("company", "industry", e.target.value)} /></Field>
          <Field label="Company Size" required><PillGroup options={COMPANY_SIZES} value={form.company.size} onChange={(v) => set("company", "size", v)} /></Field>
          <Field label="Year Established"><SelectInput options={YEARS} value={form.company.yearEstablished} onChange={(e) => set("company", "yearEstablished", e.target.value)} /></Field>
          <Field label="Company Description" required className="col-span-full"><TextArea value={form.company.description} onChange={(e) => set("company", "description", e.target.value)} placeholder="Briefly describe your company..." /></Field>
        </SectionCard>
      ),
    },
    {
      title: "Company Address",
      subtitle: "Registered office & branches",
      content: (
        <>
          <SectionCard title="Registered Office Address" icon={MapPin} description="Powered by Google Maps — type the street address to auto-fill the rest">
            <Field label="Country" required><TextInput maxLength={50} value={form.address.country} onChange={(e) => set("address", "country", e.target.value)} /></Field>
            <Field label="State" required><TextInput maxLength={50} value={form.address.state} onChange={(e) => set("address", "state", e.target.value)} /></Field>
            <Field label="City" required><TextInput maxLength={50} value={form.address.city} onChange={(e) => set("address", "city", e.target.value)} /></Field>
            <Field label="Area / Sector"><TextInput value={form.address.area} onChange={(e) => set("address", "area", e.target.value)} /></Field>
            <Field label="Sector"><TextInput value={form.address.sector} onChange={(e) => set("address", "sector", e.target.value)} placeholder="e.g. Sector 62" /></Field>
            
            <Field label="Building / Office Search" className="sm:col-span-2" hint="Start typing — city/state/pin auto-fill from Google Maps">
              <AddressAutocomplete
                value={form.address.building}
                onChange={(v) => set("address", "building", v)}
                onPlaceSelect={(p) => setForm((prev) => ({
                  ...prev,
                  address: { 
                    ...prev.address, 
                    city: p.city || prev.address.city, 
                    state: p.state || prev.address.state, 
                    country: p.country || prev.address.country, 
                    pinCode: p.pinCode || prev.address.pinCode,
                    googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.formatted)}`
                  },
                }))}
              />
            </Field>
            <Field label="Floor / Suite"><TextInput value={form.address.floor} onChange={(e) => set("address", "floor", e.target.value)} placeholder="e.g. 4th Floor" /></Field>
            <Field label="PIN Code"><TextInput maxLength={6} value={form.address.pinCode} onChange={(e) => set("address", "pinCode", e.target.value.replace(/\D/g, ""))} /></Field>
            <Field label="Landmark" className="sm:col-span-2"><TextInput value={form.address.landmark} onChange={(e) => set("address", "landmark", e.target.value)} /></Field>
            {form.address.googleMapsUrl && (
              <div className="col-span-full mt-1.5 p-3 rounded-2xl bg-blue-50/50 border border-blue-100 flex items-center justify-between text-xs text-blue-700">
                <span className="font-semibold">Google Maps URL Attached Successfully ✓</span>
                <a href={form.address.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="font-bold underline hover:text-blue-800">Preview Location →</a>
              </div>
            )}
          </SectionCard>
          <SectionCard title="Branch Offices" icon={Building2} description="Add any additional branch locations">
            <Field label="Branches" className="col-span-full">
              <RepeatableList
                items={form.branches}
                addLabel="Add branch"
                onAdd={() => setForm((f) => ({ ...f, branches: [...f.branches, { city: "", state: "", pinCode: "" }] }))}
                onRemove={(i) => setForm((f) => ({ ...f, branches: f.branches.filter((_, idx) => idx !== i) }))}
                renderItem={(item, i) => (
                  <>
                    <TextInput placeholder="City" value={item.city} onChange={(e) => setForm((f) => { const b = [...f.branches]; b[i] = { ...b[i], city: e.target.value }; return { ...f, branches: b }; })} />
                    <TextInput placeholder="State" value={item.state} onChange={(e) => setForm((f) => { const b = [...f.branches]; b[i] = { ...b[i], state: e.target.value }; return { ...f, branches: b }; })} />
                    <TextInput placeholder="PIN Code" maxLength={6} value={item.pinCode} onChange={(e) => setForm((f) => { const b = [...f.branches]; b[i] = { ...b[i], pinCode: e.target.value.replace(/\D/g, "") }; return { ...f, branches: b }; })} />
                  </>
                )}
              />
            </Field>
          </SectionCard>
        </>
      ),
    },
    {
      title: "Primary Contact",
      subtitle: "Who should candidates & our team reach out to?",
      content: (
        <SectionCard title="Primary Contact Person" icon={UserRound}>
          <Field label="Full Name" required><TextInput maxLength={100} value={form.contact.fullname} onChange={(e) => set("contact", "fullname", e.target.value)} /></Field>
          <Field label="Designation" required><SelectInput options={DESIGNATIONS} value={form.contact.designation} onChange={(e) => set("contact", "designation", e.target.value)} /></Field>
          <Field label="Department"><TextInput maxLength={50} value={form.contact.department} onChange={(e) => set("contact", "department", e.target.value)} /></Field>
          <Field label="Official Email" required><TextInput type="email" maxLength={100} value={form.contact.email} onChange={(e) => set("contact", "email", e.target.value)} /></Field>
          <Field label="Mobile Number" required><TextInput maxLength={10} value={form.contact.mobile} onChange={(e) => set("contact", "mobile", e.target.value.replace(/\D/g, ""))} /></Field>
          <Field label="WhatsApp Number"><TextInput maxLength={10} value={form.contact.whatsapp} onChange={(e) => set("contact", "whatsapp", e.target.value.replace(/\D/g, ""))} /></Field>
        </SectionCard>
      ),
    },
    {
      title: "Hiring Info",
      subtitle: "Tell us about your hiring needs",
      content: (
        <SectionCard title="Hiring Information" icon={Briefcase}>
          <Field label="Are you hiring for?"><PillGroup options={HIRING_FOR} value={form.hiring.hiringFor} onChange={(v) => set("hiring", "hiringFor", v)} /></Field>
          <Field label="Average Hiring Requirement"><SelectInput options={HIRING_VOLUME} value={form.hiring.volume} onChange={(e) => set("hiring", "volume", e.target.value)} /></Field>
          <Field label="Hiring Frequency"><SelectInput options={HIRING_FREQ} value={form.hiring.frequency} onChange={(e) => set("hiring", "frequency", e.target.value)} /></Field>
          <Field label="Preferred Hiring Locations (Worldwide Allowed)"><TextInput value={form.hiring.locations} onChange={(e) => set("hiring", "locations", e.target.value)} placeholder="e.g. Delhi NCR, Remote, Noida, London" /></Field>
          <Field label="Industries You Hire For" className="col-span-full"><ChipMultiSelect options={INDUSTRIES} value={form.hiring.industries} onChange={(v) => set("hiring", "industries", v)} /></Field>
        </SectionCard>
      ),
    },
    {
      title: "Billing Info",
      subtitle: "Business credentials & invoice details",
      content: (
        <SectionCard title="Billing Information" icon={Receipt}>
          <Field label="GST Number (Optional)"><TextInput maxLength={15} value={form.billing.gst} onChange={(e) => set("billing", "gst", e.target.value)} /></Field>
          <Field label="PAN Number (Optional)"><TextInput maxLength={10} value={form.billing.pan} onChange={(e) => set("billing", "pan", e.target.value)} /></Field>
          <Field label="CIN Number (For Companies)"><TextInput maxLength={21} value={form.billing.cin} onChange={(e) => set("billing", "cin", e.target.value)} placeholder="e.g. U72200DL2021PTC384950" /></Field>
          <Field label="MSME Registration Number (Optional)"><TextInput value={form.billing.msme} onChange={(e) => set("billing", "msme", e.target.value)} placeholder="e.g. UDYAM-XX-00-1234567" /></Field>
          <Field label="Billing Address" className="col-span-full"><TextArea value={form.billing.billingAddress} onChange={(e) => set("billing", "billingAddress", e.target.value)} /></Field>
        </SectionCard>
      ),
    },
    {
      title: "Account Credentials",
      subtitle: "Credentials, plan options & security questions",
      content: (
        <>
          <SectionCard title="Account Credentials" icon={KeyRound}>
            <Field label="Username / Handle" required>
              <TextInput value={form.account.username} onChange={(e) => set("account", "username", e.target.value.replace(/[^a-zA-Z0-9_-]/g, ""))} placeholder="e.g. google_recruitment" />
            </Field>
            <div className="col-span-full grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Password" required>
                <div className="relative">
                  <TextInput type={showPass ? "text" : "password"} value={account.password} onChange={(e) => setAccount({ ...account, password: e.target.value })} placeholder="Create a strong password" />
                  <button type="button" onClick={() => setShowPass((s) => !s)} className="absolute right-3 top-2.5 text-slate-400">
                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </Field>
              <Field label="Confirm Password" required>
                <TextInput type={showPass ? "text" : "password"} value={account.confirmPassword} onChange={(e) => setAccount({ ...account, confirmPassword: e.target.value })} placeholder="Confirm your password" />
              </Field>
            </div>
          </SectionCard>

          <SectionCard title="Security Question" icon={HelpCircle} description="To recover your account in case of password loss">
            <Field label="Choose Security Question" className="col-span-full">
              <SelectInput options={SECURITY_QUESTIONS} value={form.account.securityQuestion} onChange={(e) => set("account", "securityQuestion", e.target.value)} />
            </Field>
            <Field label="Security Answer" className="col-span-full" required>
              <TextInput value={form.account.securityAnswer} onChange={(e) => set("account", "securityAnswer", e.target.value)} placeholder="Type your secret answer here" />
            </Field>
          </SectionCard>

          <SectionCard title="Subscription Plan & Payment" icon={CreditCard}>
            <Field label="Subscription Plan" className="col-span-full"><PillGroup options={PLANS} value={form.subscription.plan} onChange={(v) => set("subscription", "plan", v)} /></Field>
            <Field label="Payment Method"><SelectInput options={PAYMENT_METHODS} value={form.subscription.paymentMethod} onChange={(e) => set("subscription", "paymentMethod", e.target.value)} /></Field>
            <p className="col-span-full text-xs text-slate-400">Payment collection activates once a payment gateway key is added — Free plan requires no payment now.</p>
          </SectionCard>
        </>
      ),
    },
    {
      title: "Documents & Compliance",
      subtitle: "Upload verification files and sign agreements",
      content: (
        <>
          <SectionCard title="Mandatory Uploads (Checklist)" icon={FileText} description="Verification certificates for security & candidate compliance checks">
            <Field label="Company Registration Certificate" required>
              <FileDrop label="Upload PDF/Image" accept=".pdf,image/*" onChange={(e) => setDocs(d => ({ ...d, regCertificate: e.target.files?.[0] }))} fileNames={docs.regCertificate ? [docs.regCertificate.name] : []} />
            </Field>
            <Field label="PAN Card (Company/Firm)" required>
              <FileDrop label="Upload PDF/Image" accept=".pdf,image/*" onChange={(e) => setDocs(d => ({ ...d, panCard: e.target.files?.[0] }))} fileNames={docs.panCard ? [docs.panCard.name] : []} />
            </Field>
            <Field label="GST Certificate (if applicable)">
              <FileDrop label="Upload PDF/Image" accept=".pdf,image/*" onChange={(e) => setDocs(d => ({ ...d, gstCertificate: e.target.files?.[0] }))} fileNames={docs.gstCertificate ? [docs.gstCertificate.name] : []} />
            </Field>
            <Field label="Authorized Signatory ID Proof" required hint="Aadhaar Card, Passport, or Driving License">
              <FileDrop label="Upload PDF/Image" accept=".pdf,image/*" onChange={(e) => setDocs(d => ({ ...d, signatoryIdProof: e.target.files?.[0] }))} fileNames={docs.signatoryIdProof ? [docs.signatoryIdProof.name] : []} />
            </Field>
            <Field label="Business Address Proof" required hint="Electricity Bill, Rent Agreement, Utility Bill">
              <FileDrop label="Upload PDF/Image" accept=".pdf,image/*" onChange={(e) => setDocs(d => ({ ...d, addressProof: e.target.files?.[0] }))} fileNames={docs.addressProof ? [docs.addressProof.name] : []} />
            </Field>
          </SectionCard>

          <SectionCard title="Optional Business Certificates" icon={FileText} description="Add extra certificates for faster trust verification and a Verified Employer badge.">
            <Field label="CIN Certificate">
              <FileDrop label="Upload PDF/Image" accept=".pdf,image/*" onChange={(e) => setDocs(d => ({ ...d, cinCertificate: e.target.files?.[0] }))} fileNames={docs.cinCertificate ? [docs.cinCertificate.name] : []} />
            </Field>
            <Field label="MSME Certificate">
              <FileDrop label="Upload PDF/Image" accept=".pdf,image/*" onChange={(e) => setDocs(d => ({ ...d, msmeCertificate: e.target.files?.[0] }))} fileNames={docs.msmeCertificate ? [docs.msmeCertificate.name] : []} />
            </Field>
            <Field label="Startup India Certificate">
              <FileDrop label="Upload PDF/Image" accept=".pdf,image/*" onChange={(e) => setDocs(d => ({ ...d, startupIndiaCert: e.target.files?.[0] }))} fileNames={docs.startupIndiaCert ? [docs.startupIndiaCert.name] : []} />
            </Field>
            <Field label="ISO Certificate">
              <FileDrop label="Upload PDF/Image" accept=".pdf,image/*" onChange={(e) => setDocs(d => ({ ...d, isoCertificate: e.target.files?.[0] }))} fileNames={docs.isoCertificate ? [docs.isoCertificate.name] : []} />
            </Field>
            <Field label="Shop & Establishment Certificate">
              <FileDrop label="Upload PDF/Image" accept=".pdf,image/*" onChange={(e) => setDocs(d => ({ ...d, shopEstCert: e.target.files?.[0] }))} fileNames={docs.shopEstCert ? [docs.shopEstCert.name] : []} />
            </Field>
            <Field label="Import Export Code (IEC)">
              <FileDrop label="Upload PDF/Image" accept=".pdf,image/*" onChange={(e) => setDocs(d => ({ ...d, iecCode: e.target.files?.[0] }))} fileNames={docs.iecCode ? [docs.iecCode.name] : []} />
            </Field>
            <Field label="Trade Licence">
              <FileDrop label="Upload PDF/Image" accept=".pdf,image/*" onChange={(e) => setDocs(d => ({ ...d, tradeLicence: e.target.files?.[0] }))} fileNames={docs.tradeLicence ? [docs.tradeLicence.name] : []} />
            </Field>
            <Field label="Labour Licence">
              <FileDrop label="Upload PDF/Image" accept=".pdf,image/*" onChange={(e) => setDocs(d => ({ ...d, labourLicence: e.target.files?.[0] }))} fileNames={docs.labourLicence ? [docs.labourLicence.name] : []} />
            </Field>
          </SectionCard>

          <SectionCard title="Terms & Compliance" icon={ShieldCheck}>
            <div className="col-span-full flex flex-col gap-3">
              <CheckboxRow checked={form.agreements.accuracy} label="I confirm that all information provided is accurate." onChange={(v) => set("agreements", "accuracy", v)} />
              <CheckboxRow checked={form.agreements.authorized} label="I am authorized to represent this organization." onChange={(v) => set("agreements", "authorized", v)} />
              <CheckboxRow checked={form.agreements.terms} label="I agree to the Terms & Conditions." onChange={(v) => set("agreements", "terms", v)} />
              <CheckboxRow checked={form.agreements.privacy} label="I agree to the Privacy Policy." onChange={(v) => set("agreements", "privacy", v)} />
              <CheckboxRow checked={form.agreements.antiDiscrimination} label="I agree not to post fake, misleading, or discriminatory job advertisements." onChange={(v) => set("agreements", "antiDiscrimination", v)} />
              <CheckboxRow checked={form.agreements.antiViolation} label="I understand that my account may be suspended for policy violations." onChange={(v) => set("agreements", "antiViolation", v)} />
            </div>
            
            <div className="col-span-full mt-4 p-4 rounded-3xl border border-amber-200 bg-amber-50/50 dark:border-amber-900/50 dark:bg-amber-950/20 text-xs text-amber-800 dark:text-amber-300 space-y-2">
              <span className="font-black uppercase tracking-wider block">Employer Verification Panel Summary</span>
              <p className="leading-relaxed">
                After registration, the Super Admin will review your: Company Registration Certificate, GST, PAN, Business Email, Mobile Number, Website Domain, Company Address, and Recruiter Identity.
              </p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 font-bold pt-1 text-slate-500 dark:text-slate-400">
                <span>🔄 Status: <span className="text-amber-600 dark:text-amber-400">{form.verificationStatus}</span></span>
                <span>Verification Checklist: Pending Review</span>
              </div>
            </div>
          </SectionCard>
        </>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300">
      <Navbar />
      <div className="border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-slate-900 via-blue-950 to-cyan-950 dark:from-slate-950 dark:via-blue-950 dark:to-slate-950 px-4 py-12 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 h-40 w-40 rounded-full bg-blue-600/10 blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 h-40 w-40 rounded-full bg-cyan-600/10 blur-2xl pointer-events-none" />

        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="relative z-10">
          <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/10 dark:bg-slate-900/40 border border-white/20 dark:border-slate-800 px-4 py-1.5 text-xs font-bold text-blue-200 backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5" /> Employer Onboarding
          </span>
          <h1 className="font-display text-3xl font-black text-white sm:text-4xl tracking-tight">Register Your Company</h1>
          <p className="mx-auto mt-2 max-w-xl text-sm text-slate-300 font-display">
            Complete your employer profile to start posting jobs and hiring top talent.
          </p>
        </motion.div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-10">
        <Link to="/login" className="mb-6 inline-flex items-center gap-1.5 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Already have an account? Log in
        </Link>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 md:p-8 shadow-xl">
          <StepWizard steps={steps} onSubmit={submitHandler} submitting={submitting} submitLabel="Register Company" validateStep={validateStep} />
        </div>
      </div>
      <Footer />
      <FloatingThemeToggle />
    </div>
  );
};

export default RecruiterRegister;
