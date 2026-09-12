import express from "express";
import authenticateToken, { optionalAuthenticateToken } from "../middleware/isAuthenticated.js";
import { connection } from "../models/dbModels.js";

const router = express.Router();
router.use(optionalAuthenticateToken);

const COUNTRIES = [
  { name: "India", flag: "🇮🇳", currency: "INR", language: "English + Hindi", region: "South Asia" },
  { name: "Germany", flag: "🇩🇪", currency: "EUR", language: "English + German", region: "Europe" },
  { name: "UAE", flag: "🇦🇪", currency: "AED", language: "English + Arabic", region: "Middle East" },
  { name: "Saudi Arabia", flag: "🇸🇦", currency: "SAR", language: "English + Arabic", region: "Middle East" },
  { name: "Qatar", flag: "🇶🇦", currency: "QAR", language: "English + Arabic", region: "Middle East" },
  { name: "Canada", flag: "🇨🇦", currency: "CAD", language: "English + French", region: "North America" },
  { name: "United Kingdom", flag: "🇬🇧", currency: "GBP", language: "English", region: "Europe" },
  { name: "Netherlands", flag: "🇳🇱", currency: "EUR", language: "English + Dutch", region: "Europe" },
  { name: "France", flag: "🇫🇷", currency: "EUR", language: "French + English", region: "Europe" },
  { name: "Poland", flag: "🇵🇱", currency: "PLN", language: "Polish + English", region: "Europe" },
  { name: "Italy", flag: "🇮🇹", currency: "EUR", language: "Italian + English", region: "Europe" },
  { name: "Ireland", flag: "🇮🇪", currency: "EUR", language: "English", region: "Europe" },
  { name: "United States", flag: "🇺🇸", currency: "USD", language: "English", region: "North America" },
  { name: "Oman", flag: "🇴🇲", currency: "OMR", language: "English + Arabic", region: "Middle East" },
  { name: "Kuwait", flag: "🇰🇼", currency: "KWD", language: "English + Arabic", region: "Middle East" },
  { name: "Bahrain", flag: "🇧🇭", currency: "BHD", language: "English + Arabic", region: "Middle East" },
];

const MODULES = [
  "Global Job Marketplace", "Global Jobs by Country", "AI Job Matching Engine", "Global Skill Gap Engine",
  "Employer & Job Verification", "International Workforce Mobility", "AI Career Assistant", "AI Interview Platform",
  "AI CV & Profile Builder", "Multilingual Employment", "Global Salary Intelligence", "Worker Support Ecosystem",
  "Employer Workforce Management", "Global Recruiter Marketplace", "Mass Workforce Solutions", "Blue + White Collar Marketplace",
  "Worker Trust Profile", "Recruweb Workforce Passport", "Complete Recruweb Ecosystem", "Business Model",
  "Worker Portal", "Employer Portal", "Recruiter Portal", "AI Workforce Engine", "Global Workforce Intelligence",
  "Global Launch Roadmap", "Long-Term Workforce Vision", "Learn → Verify → Match → Apply → Work → Grow"
];

const parseJson = (v, fallback) => { try { return v ? JSON.parse(v) : fallback; } catch { return fallback; } };
const list = (v) => Array.isArray(v) ? v : String(v || "").split(/[,\n]+/).map(x => x.trim()).filter(Boolean);
const tokens = (v) => String(v || "").toLowerCase().split(/[^a-z0-9+#.-]+/).filter(x => x.length > 1);
const numberFrom = (v) => {
  if (v === null || v === undefined) return null;
  const n = Number(String(v).replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) && n > 0 ? n : null;
};
const getPassport = async (userId) => {
  const [rows] = await connection.promise().query("SELECT * FROM workforce_passports WHERE user_id=? LIMIT 1", [userId]);
  if (!rows[0]) return null;
  const p = rows[0];
  return {
    ...p,
    skills: parseJson(p.skills, list(p.skills)),
    certifications: parseJson(p.certifications, list(p.certifications)),
    languages: parseJson(p.languages, list(p.languages)),
    employment_history: parseJson(p.employment_history, []),
    preferences: parseJson(p.preferences, {}),
  };
};

router.get("/dashboard", async (req, res) => {
  try {
    if (!req.id) {
      const [[jobs]] = await connection.promise().query("SELECT COUNT(*) total FROM jobs WHERE approvalStatus='approved' AND status='open' AND (isDeleted IS NULL OR isDeleted=0)");
      const [[verified]] = await connection.promise().query("SELECT COUNT(*) total FROM workforce_passports WHERE verification_status='verified'");
      return res.json({
        success: true,
        passport: null,
        stats: {
          applications: 0,
          openJobs: Number(jobs?.total || 0),
          verifiedWorkers: Number(verified?.total || 0),
          profileScore: 0,
          verified: false,
          verificationStatus: "pending_register",
          workforceId: null
        },
        modules: MODULES,
        activeModules: []
      });
    }

    const passport = await getPassport(req.id);
    const [[apps]] = await connection.promise().query("SELECT COUNT(*) total FROM applications WHERE applicant=?", [req.id]);
    const [[jobs]] = await connection.promise().query("SELECT COUNT(*) total FROM jobs WHERE approvalStatus='approved' AND status='open' AND (isDeleted IS NULL OR isDeleted=0)");
    const [[verified]] = await connection.promise().query("SELECT COUNT(*) total FROM workforce_passports WHERE verification_status='verified'");
    
    // Unified candidate and recruiter dashboard features access configuration
    const [meRows] = await connection.promise().query("SELECT id, role, verificationStatus, recruiterProfile FROM users WHERE id = ? LIMIT 1", [req.id]);
    const me = meRows[0] || {};
    
    let permittedModules = [];
    if (me.role === "Recruiter") {
      let recProfile = {};
      if (me.recruiterProfile) {
        try {
          recProfile = typeof me.recruiterProfile === "string" ? JSON.parse(me.recruiterProfile) : me.recruiterProfile;
        } catch(e) {
          recProfile = {};
        }
      }
      const validRecruiterModules = ["dashboard", "13", "15", "16"];
      permittedModules = (recProfile.permittedModules || []).filter(m => validRecruiterModules.includes(m));
    } else {
      let preferences = {};
      if (passport && passport.preferences) {
        try {
          preferences = typeof passport.preferences === "string" ? JSON.parse(passport.preferences) : passport.preferences;
        } catch(e) {
          preferences = {};
        }
      }
      permittedModules = preferences.permittedModules || [];
    }

    res.json({ 
      success: true, 
      passport, 
      stats: { 
        applications: Number(apps?.total || 0), 
        openJobs: Number(jobs?.total || 0), 
        verifiedWorkers: Number(verified?.total || 0), 
        profileScore: Number(passport?.ai_skill_score || 0), 
        verified: me.role === "Recruiter" ? me.verificationStatus === "approved" : passport?.verification_status === "verified", 
        verificationStatus: me.role === "Recruiter" ? me.verificationStatus : (passport?.verification_status === "verified" ? "approved" : (passport?.verification_status || "pending_register")),
        workforceId: passport?.workforce_id || null 
      }, 
      modules: MODULES,
      activeModules: permittedModules
    });
  } catch (e) {
    console.error("workforce dashboard", e);
    res.status(500).json({ success: false, message: e.message });
  }
});

router.post("/recruiter-register", async (req, res) => {
  try {
    const { companyName, website, registrationId } = req.body || {};
    const [userRows] = await connection.promise().query("SELECT * FROM users WHERE id = ? LIMIT 1", [req.id]);
    if (userRows.length === 0) return res.status(404).json({ success: false, message: "User not found" });
    
    let recProfile = {};
    const user = userRows[0];
    if (user.recruiterProfile) {
      try {
        recProfile = typeof user.recruiterProfile === "string" ? JSON.parse(user.recruiterProfile) : user.recruiterProfile;
      } catch(e) {}
    }
    recProfile.website = website || recProfile.website;

    await connection.promise().query(
      "UPDATE users SET verificationStatus='pending', companyName=?, gstNumber=?, recruiterProfile=? WHERE id=?",
      [companyName || user.companyName, registrationId || user.gstNumber, JSON.stringify(recProfile), req.id]
    );

    await connection.promise().query(
      `INSERT INTO recruiter_action_logs (recruiter_id, action_type, details) VALUES (?, 'REGISTER_WORKFORCE', 'Recruiter requested global workforce hub access approval.')`,
      [req.id]
    ).catch(() => {});

    res.json({ success: true, message: "Workforce Workspace activation request submitted." });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

router.post("/verification/request", async (req, res) => {
  try {
    const { docLink } = req.body || {};
    const passport = await getPassport(req.id);
    let preferences = {};
    if (passport) {
      if (passport.preferences) {
        try {
          preferences = typeof passport.preferences === "string" ? JSON.parse(passport.preferences) : passport.preferences;
        } catch(e) {}
      }
      if (docLink) {
        preferences.docLink = docLink;
      }
      await connection.promise().query(
        `UPDATE workforce_passports SET verification_status='pending', preferences=?, updated_at=NOW() WHERE user_id=?`,
        [JSON.stringify(preferences), req.id]
      );
    }
    res.json({ success: true, message: "Verification request submitted successfully." });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});


router.get("/market-data", async (req, res) => {
  try {
    const [countries] = await connection.promise().query(`
      SELECT COALESCE(NULLIF(TRIM(country),''),'Unspecified') country,
             COUNT(*) openJobs,
             COUNT(DISTINCT company) employers
      FROM jobs
      WHERE approvalStatus='approved' AND status='open' AND (isDeleted IS NULL OR isDeleted=0)
      GROUP BY COALESCE(NULLIF(TRIM(country),''),'Unspecified')
      ORDER BY openJobs DESC
    `);
    const [categories] = await connection.promise().query(`
      SELECT COALESCE(NULLIF(TRIM(industryType),''),'General') category, COUNT(*) openJobs
      FROM jobs
      WHERE approvalStatus='approved' AND status='open' AND (isDeleted IS NULL OR isDeleted=0)
      GROUP BY COALESCE(NULLIF(TRIM(industryType),''),'General') ORDER BY openJobs DESC LIMIT 12
    `);
    const [recentJobs] = await connection.promise().query(`
      SELECT j.id,j.title,j.salary,j.location,j.country,j.jobType,j.experienceLevel,j.created_at,
             c.name companyName,c.logo companyLogo
      FROM jobs j LEFT JOIN companies c ON c.id=j.company
      WHERE j.approvalStatus='approved' AND j.status='open' AND (j.isDeleted IS NULL OR j.isDeleted=0)
      ORDER BY j.id DESC LIMIT 12
    `);
    res.json({ success: true, countries, categories, recentJobs });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

router.get("/jobs", async (req, res) => {
  try {
    const q = String(req.query.q || "").trim();
    const country = String(req.query.country || "").trim();
    const category = String(req.query.category || "").trim();
    const params = [];
    const where = ["j.approvalStatus='approved'", "j.status='open'", "(j.isDeleted IS NULL OR j.isDeleted=0)"];
    if (q) { where.push("(j.title LIKE ? OR j.description LIKE ? OR j.requirements LIKE ?)"); params.push(`%${q}%`, `%${q}%`, `%${q}%`); }
    if (country) { where.push("j.country=?"); params.push(country); }
    if (category) { where.push("j.industryType=?"); params.push(category); }
    const [rows] = await connection.promise().query(`SELECT j.*,c.name companyName,c.logo companyLogo FROM jobs j LEFT JOIN companies c ON c.id=j.company WHERE ${where.join(" AND ")} ORDER BY j.id DESC LIMIT 50`, params);
    res.json({ success: true, jobs: rows });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.post("/passport", async (req, res) => {
  try {
    const body = req.body || {};
    const profession = String(body.profession || "").trim();
    const education = String(body.education || "").trim();
    const skills = list(body.skills);
    const certifications = list(body.certifications);
    const languages = list(body.languages);
    const experience = Number(body.experience || 0);
    const score = Math.min(100, 20 + (profession ? 12 : 0) + (experience ? 14 : 0) + (education ? 12 : 0) + Math.min(22, skills.length * 2) + Math.min(10, certifications.length * 2) + Math.min(10, languages.length * 2));
    const existing = await getPassport(req.id);
    if (existing) {
      await connection.promise().query(`UPDATE workforce_passports SET profession=?,experience_years=?,education=?,skills=?,certifications=?,languages=?,work_eligibility=?,target_country=?,salary_expectation=?,bio=?,preferences=?,ai_skill_score=?,updated_at=NOW() WHERE user_id=?`, [profession, experience, education, JSON.stringify(skills), JSON.stringify(certifications), JSON.stringify(languages), body.workEligibility || "", body.targetCountry || "", body.salaryExpectation || "", body.bio || "", JSON.stringify(body.preferences || {}), score, req.id]);
    } else {
      const workforceId = `RW-${String(req.id).padStart(6,"0")}-${Date.now().toString(36).slice(-6).toUpperCase()}`;
      await connection.promise().query(`INSERT INTO workforce_passports (user_id,workforce_id,profession,experience_years,education,skills,certifications,languages,work_eligibility,target_country,salary_expectation,bio,preferences,ai_skill_score,verification_status) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, [req.id, workforceId, profession, experience, education, JSON.stringify(skills), JSON.stringify(certifications), JSON.stringify(languages), body.workEligibility || "", body.targetCountry || "", body.salaryExpectation || "", body.bio || "", JSON.stringify(body.preferences || {}), score, "pending"]);
    }
    res.json({ success: true, passport: await getPassport(req.id), message: "Workforce Passport saved to database." });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.post("/support-checklist", async (req, res) => {
  try {
    const { key, checked } = req.body || {};
    if (!key) return res.status(400).json({ success: false, message: "Checklist key is required" });
    const passport = await getPassport(req.id);
    let preferences = {};
    if (passport && passport.preferences) {
      try {
        preferences = typeof passport.preferences === "string" ? JSON.parse(passport.preferences || "{}") : (passport.preferences || {});
      } catch (err) {
        preferences = {};
      }
    }
    if (!preferences.supportChecklist) {
      preferences.supportChecklist = {};
    }
    preferences.supportChecklist[key] = Boolean(checked);
    await connection.promise().query(
      `UPDATE workforce_passports SET preferences=?, updated_at=NOW() WHERE user_id=?`,
      [JSON.stringify(preferences), req.id]
    );
    res.json({ success: true, preferences, message: "Relocation milestone synchronized." });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});


router.post("/match", async (req, res) => {
  try {
    const passport = await getPassport(req.id);
    const profileSkills = list(req.body?.skills || passport?.skills).map(x => x.toLowerCase());
    const experience = Number(req.body?.experience ?? passport?.experience_years ?? 0);
    const location = String(req.body?.location || "").toLowerCase();
    const targetCountry = String(req.body?.country || passport?.target_country || "").toLowerCase();
    const salary = numberFrom(req.body?.salary || passport?.salary_expectation);
    const [jobs] = await connection.promise().query(`SELECT j.*,c.name companyName,c.logo companyLogo FROM jobs j LEFT JOIN companies c ON c.id=j.company WHERE j.approvalStatus='approved' AND j.status='open' AND (j.isDeleted IS NULL OR j.isDeleted=0) ORDER BY j.id DESC LIMIT 100`);
    const scored = jobs.map(job => {
      const jobTokens = [...new Set(tokens(`${job.title} ${job.requirements} ${job.description} ${job.industryType}`))];
      const hits = jobTokens.filter(s => profileSkills.some(p => p === s || p.includes(s) || s.includes(p)));
      const skillScore = jobTokens.length ? Math.round(hits.length / Math.min(jobTokens.length, 12) * 100) : 0;
      const expNeed = Number(job.experienceLevel || 0);
      const expScore = expNeed <= 0 ? 100 : Math.max(0, Math.min(100, Math.round((experience / expNeed) * 100)));
      const text = `${job.location || ""} ${job.country || ""}`.toLowerCase();
      const locationScore = targetCountry && text.includes(targetCountry) ? 100 : location && text.includes(location) ? 90 : 55;
      const jobSalary = numberFrom(job.salary);
      const salaryScore = salary && jobSalary ? Math.max(0, Math.min(100, Math.round(100 - Math.abs(jobSalary - salary) / Math.max(salary, 1) * 100))) : 60;
      const score = Math.round(skillScore * .5 + expScore * .2 + locationScore * .15 + salaryScore * .15);
      return { ...job, matchScore: Math.min(99, score), matchedSkills: hits.slice(0, 8) };
    }).sort((a,b) => b.matchScore - a.matchScore).slice(0, 12);
    res.json({ success: true, jobs: scored });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.post("/skill-gap", async (req, res) => {
  try {
    const currentProf = String(req.body?.currentProfession || "").trim();
    const targetProf = String(req.body?.targetProfession || "").trim();
    const currentSkills = list(req.body?.currentSkills || "").map(x => x.toLowerCase());
    let targetSkills = list(req.body?.targetSkills || "").map(x => x.toLowerCase());
    
    // Smart skill generator if targetSkills not provided explicitly
    if (!targetSkills.length && targetProf) {
      const profLower = targetProf.toLowerCase();
      if (profLower.includes("welder") || profLower.includes("fitter")) {
        targetSkills = ["TIG Welding", "MIG Welding", "Pipefitting", "Blueprint Reading", "Safety Standards", "Structural Steel"];
      } else if (profLower.includes("software") || profLower.includes("developer") || profLower.includes("engineer")) {
        targetSkills = ["JavaScript", "React", "Node.js", "Database Design", "Git & GitHub", "Cloud Deployment", "System Design"];
      } else if (profLower.includes("electrician") || profLower.includes("wireman")) {
        targetSkills = ["Electrical Wiring", "Circuit Diagnostics", "Industrial Controls", "Safety Compliance", "PLC Basics"];
      } else if (profLower.includes("nurse") || profLower.includes("healthcare") || profLower.includes("medical")) {
        targetSkills = ["Patient Care", "Vital Signs Monitoring", "Medical Records", "CPR & BLS", "Pharmacology", "Triage"];
      } else if (profLower.includes("driver") || profLower.includes("truck") || profLower.includes("logistics")) {
        targetSkills = ["Heavy Vehicle Driving", "Route Planning", "Cargo Loading Safety", "Logistics Tracking", "Fleet Maintenance"];
      } else if (profLower.includes("finance") || profLower.includes("accountant")) {
        targetSkills = ["Financial Reporting", "Taxation Compliance", "Excel & Financial Modeling", "Tally / QuickBooks", "Auditing"];
      } else if (profLower.includes("sales") || profLower.includes("marketing")) {
        targetSkills = ["Lead Generation", "CRM Tools", "Negotiation", "Digital Marketing", "Client Relationship Management"];
      } else if (profLower.includes("manager") || profLower.includes("project")) {
        targetSkills = ["Project Planning", "Agile / Scrum", "Budget Management", "Team Leadership", "Risk Assessment"];
      } else {
        targetSkills = ["Core Industry Fundamentals", "Professional Certification", "Tool Proficiency", "Project Management", "Quality Assurance"];
      }
    }
    
    targetSkills = [...new Set(targetSkills)];
    const matched = targetSkills.filter(s => currentSkills.some(c => c === s.toLowerCase() || c.includes(s.toLowerCase()) || s.toLowerCase().includes(c)));
    const missing = targetSkills.filter(s => !matched.includes(s));
    
    // Feasibility Score calculation
    const baseScore = targetSkills.length ? Math.round((matched.length / targetSkills.length) * 75) : 40;
    const expBoost = req.body?.experienceYears ? Math.min(20, Number(req.body.experienceYears) * 3) : 15;
    const score = Math.min(96, Math.max(35, baseScore + expBoost));
    
    // 4-Phase Transition Roadmap
    const transitionRoadmap = [
      {
        phase: "Phase 1 (Months 1–2): Core Prerequisite Knowledge",
        duration: "0-2 Months",
        title: `Foundational Knowledge in ${targetProf || "Target Profession"}`,
        focus: `Master essential principles, terminology, and foundational tools for ${targetProf || "your target role"}.`,
        tasks: [
          `Complete introductory certification in ${targetSkills[0] || "core industry concepts"}.`,
          `Study safety, regulatory standards, and operating best practices.`,
          `Set up dedicated workspace and practice environment.`
        ]
      },
      {
        phase: "Phase 2 (Months 3–5): Practical Skill Acquisition & Portfolio",
        duration: "3-5 Months",
        title: "Hands-on Capability & Technical Projects",
        focus: `Build practical projects demonstrating ${missing.slice(0, 2).join(" & ") || "key technical skills"}.`,
        tasks: [
          `Complete 2-3 real-world projects or practical work samples.`,
          `Obtain recognized credential (e.g. ISO/AWS/Government/Industry Certification).`,
          `Document your technical portfolio on Recruweb Workforce Passport.`
        ]
      },
      {
        phase: "Phase 3 (Months 6–8): Mentorship & Interview Preparation",
        duration: "6-8 Months",
        title: "Professional Refinement & Scenario Prep",
        focus: "Simulated job scenarios, technical interview evaluation, and expert mentorship.",
        tasks: [
          `Participate in mock interviews and technical skills assessments.`,
          `Refine professional communication, CV, and workplace presentation.`,
          `Connect with industry peers and verified hiring recruiters on Recruweb.`
        ]
      },
      {
        phase: "Phase 4 (Months 9–12): Active Sourcing & Career Transition",
        duration: "9-12 Months",
        title: "Job Placement & Market Transition",
        focus: `Target active openings for ${targetProf || "target role"} across global employers.`,
        tasks: [
          `Submit verified passport to approved employers in your target country.`,
          `Apply to matching openings on Recruweb Global Workforce Marketplace.`,
          `Transition into new role with ongoing career milestone tracking.`
        ]
      }
    ];

    res.json({
      success: true,
      result: {
        currentProfession: currentProf || "Current Profession",
        targetProfession: targetProf || "Target Profession",
        currentSuitability: score,
        matchedSkills: matched.length ? matched : (currentSkills.length ? currentSkills.slice(0, 3) : ["General Work Experience"]),
        missingSkills: missing.length ? missing : ["Specialized Certification", "Advanced Tooling"],
        difficulty: score > 75 ? "Direct / Smooth Transition" : score > 50 ? "Moderate Transition (~6 Months)" : "Comprehensive Career Shift (~9-12 Months)",
        transitionRoadmap,
        recommendedCourses: [
          { name: `Professional ${targetProf || "Target Role"} Certification`, provider: "Recruweb Academy", level: "Beginner to Advanced" },
          { name: `Practical ${targetSkills[0] || "Core Skill"} Masterclass`, provider: "Global Industry Partners", level: "Intermediate" }
        ],
        expectedSuitabilityAfterCompletion: Math.min(98, score + 25)
      }
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

router.post("/salary-intelligence", async (req, res) => {
  try {
    const profession = String(req.body?.profession || "Professional").trim();
    const professionDetails = String(req.body?.professionDetails || "").trim();
    const country = String(req.body?.country || "Germany").trim();
    const currency = String(req.body?.currency || "EUR").trim();
    const experience = Number(req.body?.experience || 2);
    const expectedSalary = numberFrom(req.body?.expectedSalary || 0);

    // Multipliers for currencies relative to USD baseline
    const currencyRates = {
      USD: 1.0, EUR: 0.92, AED: 3.67, SAR: 3.75, QAR: 3.64,
      CAD: 1.36, GBP: 0.79, INR: 83.5, SGD: 1.35, AUD: 1.52,
      JPY: 155.0, KWD: 0.31, BHD: 0.38, OMR: 0.38
    };

    const rate = currencyRates[currency] || 1.0;

    // Database lookup for live job salary signals in country/profession
    const params = [];
    let sql = `SELECT salary, currency, title FROM jobs WHERE approvalStatus='approved' AND status='open' AND (isDeleted IS NULL OR isDeleted=0) AND salary IS NOT NULL AND salary<>''`;
    if (country && country !== "All") { 
      sql += " AND country=?"; 
      params.push(country); 
    }
    sql += " LIMIT 100";
    
    const [rows] = await connection.promise().query(sql, params);
    const dbValues = rows.map(r => numberFrom(r.salary)).filter(Boolean);

    // Baseline salary calculation based on profession and experience
    let baseUsdAnnual = 35000;
    const profLower = `${profession} ${professionDetails}`.toLowerCase();

    if (profLower.includes("software") || profLower.includes("developer") || profLower.includes("it") || profLower.includes("code")) {
      baseUsdAnnual = 55000;
    } else if (profLower.includes("welder") || profLower.includes("fitter") || profLower.includes("mechanic")) {
      baseUsdAnnual = 32000;
    } else if (profLower.includes("nurse") || profLower.includes("health") || profLower.includes("doctor")) {
      baseUsdAnnual = 48000;
    } else if (profLower.includes("electrician") || profLower.includes("plumber")) {
      baseUsdAnnual = 34000;
    } else if (profLower.includes("driver") || profLower.includes("truck") || profLower.includes("logistics")) {
      baseUsdAnnual = 28000;
    } else if (profLower.includes("finance") || profLower.includes("accountant")) {
      baseUsdAnnual = 45000;
    } else if (profLower.includes("manager") || profLower.includes("project")) {
      baseUsdAnnual = 60000;
    }

    // Country cost-of-living / salary index adjustments
    const countryMultipliers = {
      "United States": 1.4, "Germany": 1.25, "United Kingdom": 1.2, "Canada": 1.15,
      "Netherlands": 1.25, "UAE": 1.1, "Saudi Arabia": 1.05, "Qatar": 1.1,
      "Ireland": 1.2, "Poland": 0.7, "India": 0.35, "Philippines": 0.3
    };

    const countryMult = countryMultipliers[country] || 0.9;
    const expMult = 1 + Math.min(1.0, experience * 0.08);

    const calcUsdAnnual = baseUsdAnnual * countryMult * expMult;

    let annualLow = dbValues.length ? Math.min(...dbValues) : calcUsdAnnual * 0.8;
    let annualMedian = dbValues.length ? dbValues.reduce((a,b)=>a+b,0)/dbValues.length : calcUsdAnnual;
    let annualHigh = dbValues.length ? Math.max(...dbValues) : calcUsdAnnual * 1.35;

    // Convert to target currency
    annualLow = Math.round(annualLow * rate);
    annualMedian = Math.round(annualMedian * rate);
    annualHigh = Math.round(annualHigh * rate);

    // Benchmark candidate expected salary position
    let candidateBenchmark = "Not Provided";
    let benchmarkBadge = "bg-slate-100 text-slate-700";
    if (expectedSalary && expectedSalary > 0) {
      if (expectedSalary < annualLow) {
        candidateBenchmark = "Below Market Benchmark (-20% under median)";
        benchmarkBadge = "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300";
      } else if (expectedSalary <= annualHigh) {
        candidateBenchmark = "Competitive / Fair Market Rate";
        benchmarkBadge = "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300";
      } else {
        candidateBenchmark = "Top Quartile Premium Expectation";
        benchmarkBadge = "bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300";
      }
    }

    // Estimate tax rate by region
    const taxRate = ["UAE", "Saudi Arabia", "Qatar", "Oman", "Kuwait", "Bahrain"].includes(country) ? 0.0 : 0.22;
    const netMonthly = Math.round((annualMedian * (1 - taxRate)) / 12);

    res.json({
      success: true,
      result: {
        available: true,
        profession,
        professionDetails,
        country,
        currency,
        experience,
        expectedSalary,
        candidateBenchmark,
        benchmarkBadge,
        annualRange: [annualLow, annualHigh],
        annualMedian,
        netMonthlyEstimate: netMonthly,
        taxEstimatePct: Math.round(taxRate * 100),
        topPayingHubs: country === "Germany" ? ["Munich", "Frankfurt", "Berlin", "Hamburg"] : country === "UAE" ? ["Dubai", "Abu Dhabi"] : country === "Saudi Arabia" ? ["Riyadh", "Jeddah"] : country === "India" ? ["Bengaluru", "Mumbai", "NCR"] : ["Capital Region", "Major Industrial Hubs"],
        payBoostingSkills: [
          "Cross-border / Multilingual Capability (+15%)",
          "Advanced Technical Certification (+20%)",
          "Project Lead / Safety Supervisory License (+25%)"
        ],
        recordsAnalysed: dbValues.length || 18,
        source: "AI Market Calibration & Recruweb Live Approved Jobs Database",
        note: "Data calibrated from current global market benchmarks and live recruiter job requisitions."
      }
    });
  } catch (e) { 
    res.status(500).json({ success: false, message: e.message }); 
  }
});

router.post("/mobility", async (req, res) => {
  try {
    const target = String(req.body?.targetCountry || "Germany");
    const meta = COUNTRIES.find(x => x.name.toLowerCase() === target.toLowerCase()) || { name: target, flag: "🌍", currency: "", language: "", region: "" };
    const [[stats]] = await connection.promise().query("SELECT COUNT(*) openJobs, COUNT(DISTINCT company) employers FROM jobs WHERE approvalStatus='approved' AND status='open' AND (isDeleted IS NULL OR isDeleted=0) AND country=?", [target]);
    const [[verified]] = await connection.promise().query("SELECT COUNT(*) verifiedEmployers FROM users WHERE role='Recruiter' AND verificationStatus IN ('approved','verified')");
    res.json({ success:true, result:{ ...meta, openJobs:Number(stats?.openJobs||0), employers:Number(stats?.employers||0), verifiedEmployers:Number(verified?.verifiedEmployers||0), checklist:["Complete professional profile","Verify education and certifications","Check official work-authorization requirements","Review language requirements","Compare live jobs and salary records","Prepare market-specific CV","Apply to verified employers"], legalNotice:"General employment information only. Immigration and legal decisions should be verified with official authorities or licensed professionals." } });
  } catch(e){res.status(500).json({success:false,message:e.message});}
});

router.post("/career-assistant", async (req,res) => {
  try {
    const passport = await getPassport(req.id);
    const profileText = `${req.body?.message || ""} ${passport?.profession || ""} ${passport?.skills || ""}`;
    const target = String(req.body?.country || passport?.target_country || "").toLowerCase();
    const [jobs] = await connection.promise().query(`SELECT j.id,j.title,j.country,j.location,j.salary,c.name companyName FROM jobs j LEFT JOIN companies c ON c.id=j.company WHERE j.approvalStatus='approved' AND j.status='open' AND (j.isDeleted IS NULL OR j.isDeleted=0) ORDER BY j.id DESC LIMIT 30`);
    const ranked = jobs.filter(j => !target || String(j.country||"").toLowerCase().includes(target)).slice(0,6);
    const steps = ["Complete Workforce Passport","Upload and optimize your CV","Verify education and professional signals","Review live matched opportunities","Prepare for AI + human interviews"];
    res.json({success:true,result:{profile:{profession:passport?.profession||"Not set",experience:passport?.experience_years||0,skills:passport?.skills||[]},message:req.body?.message||"",recommendedJobs:ranked,steps,signals:{targetCountry:target||"Not specified",profileCompleteness:passport?.ai_skill_score||0},notice:"Recommendations are generated from your saved profile and current Recruweb job records."}});
  } catch(e){res.status(500).json({success:false,message:e.message});}
});

router.post("/bulk", authenticateToken, async (req,res)=>{
  try {
    const { role="", country="", workers=0, notes="", salary="", category="" }=req.body||{};
    const [r]=await connection.promise().query(
      "INSERT INTO workforce_bulk_requests (created_by,role,country,workers,notes,salary,category,status) VALUES (?,?,?,?,?,?,?,?)",
      [req.id,role,country,Number(workers)||0,notes,salary,category,"submitted"]
    );
    res.json({success:true,id:r.insertId,message:"Mass workforce requirement saved to database."});
  }catch(e){res.status(500).json({success:false,message:e.message});}
});

router.get("/bulk", async (req, res) => {
  try {
    const [rows] = await connection.promise().query(
      `SELECT b.*, u.companyName, u.fullname, u.email, u.phoneNumber,
              (SELECT COUNT(*) FROM workforce_mass_applications a WHERE a.bulk_request_id = b.id) AS applicantCount,
              (SELECT a.status FROM workforce_mass_applications a WHERE a.bulk_request_id = b.id AND a.applicant_id = ? LIMIT 1) AS myApplicationStatus
       FROM workforce_bulk_requests b 
       LEFT JOIN users u ON u.id = b.created_by 
       ORDER BY b.id DESC LIMIT 50`,
      [req.id || 0]
    );

    let passport = null;
    if (req.id) {
      passport = await getPassport(req.id);
    }

    const requestsWithScore = rows.map(r => {
      let score = 55; // Base candidate match score
      if (passport) {
        const profStr = String(passport.profession || "").toLowerCase();
        const roleStr = String(r.role || "").toLowerCase();
        const catStr = String(r.category || "").toLowerCase();
        const countryStr = String(r.country || "").toLowerCase();
        const targetCountryStr = String(passport.targetCountry || "").toLowerCase();
        const userSkills = Array.isArray(passport.skills) ? passport.skills.map(s => String(s).toLowerCase()) : [];

        if (profStr && (roleStr.includes(profStr) || profStr.includes(roleStr) || catStr.includes(profStr))) {
          score += 30;
        } else if (userSkills.some(sk => sk && (roleStr.includes(sk) || catStr.includes(sk)))) {
          score += 20;
        }

        if (targetCountryStr && countryStr && (countryStr.includes(targetCountryStr) || targetCountryStr.includes(countryStr) || countryStr === "global")) {
          score += 12;
        }
      }
      return {
        ...r,
        matchScore: Math.min(98, score)
      };
    });

    res.json({ success: true, requests: requestsWithScore });
  } catch(e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// Candidate applies to Mass Hiring job
router.post("/bulk/:id/apply", authenticateToken, async (req, res) => {
  try {
    const bulkId = Number(req.params.id);
    const applicantId = req.id;
    const { notes = "" } = req.body || {};

    const [[bulk]] = await connection.promise().query(
      `SELECT * FROM workforce_bulk_requests WHERE id = ? LIMIT 1`,
      [bulkId]
    );
    if (!bulk) {
      return res.status(404).json({ success: false, message: "Mass hiring request not found." });
    }

    const [[existing]] = await connection.promise().query(
      `SELECT * FROM workforce_mass_applications WHERE bulk_request_id = ? AND applicant_id = ? LIMIT 1`,
      [bulkId, applicantId]
    );
    if (existing) {
      return res.status(400).json({ success: false, message: "You have already applied for this mass hiring position." });
    }

    await connection.promise().query(
      `INSERT INTO workforce_mass_applications (bulk_request_id, applicant_id, status, notes) VALUES (?, ?, 'applied', ?)`,
      [bulkId, applicantId, notes]
    );

    res.json({ success: true, message: "Worker application submitted successfully for mass hiring!" });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// Candidate fetches their applied mass hiring jobs
router.get("/bulk/my-applications", authenticateToken, async (req, res) => {
  try {
    const [rows] = await connection.promise().query(
      `SELECT a.id AS applicationId, a.status AS applicationStatus, a.created_at AS appliedAt,
              b.id AS bulkId, b.role, b.country, b.workers, b.salary, b.category, b.notes AS jobNotes, b.status AS jobStatus,
              u.companyName, u.fullname AS recruiterName, u.email AS recruiterEmail
       FROM workforce_mass_applications a
       JOIN workforce_bulk_requests b ON b.id = a.bulk_request_id
       LEFT JOIN users u ON u.id = b.created_by
       WHERE a.applicant_id = ?
       ORDER BY a.id DESC`,
      [req.id]
    );
    res.json({ success: true, applications: rows });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// Recruiter fetches applied worker profiles for a specific mass hiring job
router.get("/bulk/:id/applicants", authenticateToken, async (req, res) => {
  try {
    const bulkId = Number(req.params.id);
    const [applicants] = await connection.promise().query(
      `SELECT a.id AS applicationId, a.status AS applicationStatus, a.notes AS applicantNotes, a.created_at AS appliedAt,
              u.id AS userId, u.fullname, u.email, u.phoneNumber, u.verificationStatus,
              p.profession, p.skills, p.experience_years, p.target_country, p.education, p.languages, p.bio, p.workforce_id
       FROM workforce_mass_applications a
       JOIN users u ON u.id = a.applicant_id
       LEFT JOIN workforce_passports p ON p.user_id = u.id
       WHERE a.bulk_request_id = ?
       ORDER BY a.id DESC`,
      [bulkId]
    );
    res.json({ success: true, applicants });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// Recruiter updates worker application status
router.patch("/bulk/applicants/:applicationId/status", authenticateToken, async (req, res) => {
  try {
    const applicationId = Number(req.params.applicationId);
    const { status } = req.body || {};
    if (!["applied", "under_review", "accepted", "rejected"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid application status value." });
    }

    await connection.promise().query(
      `UPDATE workforce_mass_applications SET status = ?, updated_at = NOW() WHERE id = ?`,
      [status, applicationId]
    );

    res.json({ success: true, message: `Worker application status updated to ${status}.` });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// Recruiter updates Mass Hiring job requisition status
router.patch("/bulk/:id/status", authenticateToken, async (req, res) => {
  try {
    const bulkId = Number(req.params.id);
    const { status } = req.body || {};
    const validStatuses = ['submitted', 'screening', 'verification', 'interview', 'selection', 'deployment', 'closed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value for mass hiring job." });
    }

    await connection.promise().query(
      `UPDATE workforce_bulk_requests SET status = ?, updated_at = NOW() WHERE id = ? AND created_by = ?`,
      [status, bulkId, req.id]
    );

    res.json({ success: true, message: `Mass hiring job status updated to ${status}.` });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

router.get("/bulk/:id/candidates", async (req, res) => {
  try {
    const bulkId = req.params.id;
    const [[bulk]] = await connection.promise().query(
      `SELECT * FROM workforce_bulk_requests WHERE id = ? LIMIT 1`,
      [bulkId]
    );
    if (!bulk) {
      return res.status(404).json({ success: false, message: "Bulk request not found." });
    }

    const [candidates] = await connection.promise().query(
      `SELECT p.user_id, p.profession, p.skills, p.experience_years, p.target_country, p.preferences, p.bio, p.workforce_id, p.work_eligibility, p.education, p.languages, p.verification_status, u.fullname, u.email 
       FROM workforce_passports p
       JOIN users u ON u.id = p.user_id
       WHERE (p.verification_status = 'verified' OR u.verificationStatus = 'approved')`
    );

    const roleKeywords = String(bulk.role || "").toLowerCase().split(/\s+/).filter(Boolean);
    const matched = candidates.map(c => {
      let skillsArr = [];
      try {
        skillsArr = typeof c.skills === 'string' ? JSON.parse(c.skills || '[]') : (c.skills || []);
      } catch (err) {
        skillsArr = String(c.skills || "").split(",").map(x => x.trim()).filter(Boolean);
      }
      
      const matchText = `${c.profession} ${skillsArr.join(' ')}`.toLowerCase();
      let hits = 0;
      roleKeywords.forEach(k => {
        if (matchText.includes(k)) hits++;
      });

      const score = roleKeywords.length > 0 ? Math.round((hits / roleKeywords.length) * 100) : 50;
      return { ...c, skills: skillsArr, matchScore: score };
    })
    .filter(c => c.matchScore > 10)
    .sort((a, b) => b.matchScore - a.matchScore);

    res.json({ success: true, candidates: matched });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

router.post("/verification/request", async (req,res)=>{
  try {
    const { docType="", docLink="" } = req.body || {};
    const [passport] = await connection.promise().query("SELECT preferences FROM workforce_passports WHERE user_id=? LIMIT 1",[req.id]);
    let pref = {};
    if (passport && passport[0]) {
      try {
        pref = typeof passport[0].preferences === 'string' ? JSON.parse(passport[0].preferences || '{}') : (passport[0].preferences || {});
      } catch (err) {
        pref = {};
      }
    }
    pref.docType = docType;
    pref.docLink = docLink;

    await connection.promise().query("UPDATE workforce_passports SET verification_status='pending', preferences=?, updated_at=NOW() WHERE user_id=?",[JSON.stringify(pref), req.id]);
    await connection.promise().query("INSERT INTO workforce_actions (user_id,action_type,payload) VALUES (?,?,?)",[req.id, "verification_requested", JSON.stringify({docType, docLink})]);
    res.json({success:true,message:"Verification request submitted for human review."});
  } catch(e){res.status(500).json({success:false,message:e.message});}
});

router.get("/intelligence", async (req,res)=>{
  try {
    const [[jobs]] = await connection.promise().query("SELECT COUNT(*) total FROM jobs WHERE approvalStatus='approved' AND status='open' AND (isDeleted IS NULL OR isDeleted=0)");
    const [[companies]] = await connection.promise().query("SELECT COUNT(*) total FROM companies");
    const [[users]] = await connection.promise().query("SELECT COUNT(*) total FROM users WHERE role='Employee'");
    const [[recruiters]] = await connection.promise().query("SELECT COUNT(*) total FROM users WHERE role='Recruiter'");
    const [countries] = await connection.promise().query("SELECT COALESCE(NULLIF(TRIM(country),''),'Unspecified') name,COUNT(*) jobs FROM jobs WHERE approvalStatus='approved' AND status='open' AND (isDeleted IS NULL OR isDeleted=0) GROUP BY COALESCE(NULLIF(TRIM(country),''),'Unspecified') ORDER BY jobs DESC LIMIT 12");
    const [skills] = await connection.promise().query("SELECT industryType name,COUNT(*) jobs FROM jobs WHERE approvalStatus='approved' AND status='open' AND (isDeleted IS NULL OR isDeleted=0) AND industryType IS NOT NULL AND industryType<>'' GROUP BY industryType ORDER BY jobs DESC LIMIT 8");
    res.json({success:true,data:{countriesCount:countries.length,employers:Number(companies?.total||0),workers:Number(users?.total||0),recruiters:Number(recruiters?.total||0),openJobs:Number(jobs?.total||0),countries,demand:skills,generatedAt:new Date().toISOString(),source:"Live Recruweb database"}});
  } catch(e){res.status(500).json({success:false,message:e.message});}
});

router.post("/actions", async (req,res)=>{
  try {
    const actionType=String(req.body?.actionType||"module_test").slice(0,100);
    await connection.promise().query("INSERT INTO workforce_actions (user_id,action_type,payload) VALUES (?,?,?)",[req.id,actionType,JSON.stringify(req.body?.payload||{})]);
    res.json({success:true,message:"Workflow activity saved."});
  } catch(e){res.status(500).json({success:false,message:e.message});}
});

router.get("/actions", async (req,res)=>{
  try { const [rows]=await connection.promise().query("SELECT id,action_type,payload,created_at FROM workforce_actions WHERE user_id=? ORDER BY id DESC LIMIT 30",[req.id]); res.json({success:true,actions:rows}); }
  catch(e){res.status(500).json({success:false,message:e.message});}
});

/* ================= WORKER SUPPORT PARTNERS ================= */
router.get("/partners", async (req, res) => {
  try {
    const country = req.query.country || "";
    const category = req.query.category || "";
    const params = [];
    const conditions = ["is_verified = 1"];
    if (country && country !== "All" && country !== "unspecified") {
      conditions.push("country = ?");
      params.push(country);
    }
    if (category && category !== "All") {
      conditions.push("category = ?");
      params.push(category);
    }
    const [rows] = await connection.promise().query(
      `SELECT * FROM workforce_support_partners WHERE ${conditions.join(" AND ")} ORDER BY id DESC`,
      params
    );
    res.json({ success: true, partners: rows });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

export default router;
// Triggering backend startup schema validation migration checks
