import { connection } from "../models/dbModels.js";

// ─── Find Candidates by JD Text ──────────────────────────────
// Parses JD text for keywords and matches against candidate profiles
export const findCandidatesByJD = async (req, res) => {
  try {
    const { jd_text, filters = {} } = req.body;

    if (!jd_text || jd_text.trim().length < 10) {
      return res.status(400).json({ success: false, message: "Please provide a job description with at least 10 characters." });
    }

    // Extract keywords from JD (simple NLP: nouns, tech terms, skill words)
    const keywords = extractKeywords(jd_text);

    // Build candidate query from profile data
    let query = `
      SELECT 
        u.id, u.fullname, u.email, u.candidateProfile,
        u.skills, u.experience, u.city as location
      FROM users u
      WHERE u.role = 'Employee' AND u.isBlocked = 0
    `;
    const params = [];

    // Apply hard filters from the filter card
    if (filters.location && filters.location.length > 0) {
      const locationPlaceholders = filters.location.map(() => "u.city LIKE ?").join(" OR ");
      query += ` AND (${locationPlaceholders})`;
      filters.location.forEach(loc => params.push(`%${loc}%`));
    }

    if (filters.experience) {
      // experience ranges like "0-3 years", "3-5 years"
      const [minY, maxY] = parseExperienceRange(filters.experience);
      if (minY !== null) query += ` AND CAST(COALESCE(JSON_UNQUOTE(JSON_EXTRACT(u.candidateProfile, '$.experience')), '0') AS UNSIGNED) >= ?` && params.push(minY);
      if (maxY !== null) query += ` AND CAST(COALESCE(JSON_UNQUOTE(JSON_EXTRACT(u.candidateProfile, '$.experience')), '0') AS UNSIGNED) <= ?` && params.push(maxY);
    }

    const [candidates] = await connection.promise().query(query, params);

    // Score candidates against JD keywords
    const scored = candidates.map(candidate => {
      const profile = safeParseJSON(candidate.candidateProfile);
      const candidateText = buildCandidateText(candidate, profile);
      const score = computeMatchScore(keywords, candidateText);

      // Apply skill filter (post-query)
      if (filters.skills && filters.skills.length > 0) {
        const hasSkill = filters.skills.some(skill =>
          candidateText.toLowerCase().includes(skill.toLowerCase())
        );
        if (!hasSkill) return null;
      }

      // Apply salary filter
      if (filters.salary) {
        const [minS, maxS] = parseSalaryRange(filters.salary);
        const candidateSalary = parseFloat(profile?.expectedSalary || profile?.salary || 0);
        if (minS && candidateSalary < minS) return null;
        if (maxS && candidateSalary > maxS) return null;
      }

      return {
        id: candidate.id,
        fullname: candidate.fullname,
        email: candidate.email,
        location: candidate.location || profile?.location,
        skills: profile?.skills || candidate.skills,
        experience: profile?.experience,
        expectedSalary: profile?.expectedSalary || profile?.salary,
        bio: profile?.bio,
        profilePhoto: profile?.profilePhoto,
        matchScore: score,
        matchedKeywords: keywords.filter(kw =>
          candidateText.toLowerCase().includes(kw.toLowerCase())
        ),
        candidateProfile: profile,
      };
    }).filter(Boolean).sort((a, b) => b.matchScore - a.matchScore);

    return res.json({
      success: true,
      candidates: scored,
      extractedKeywords: keywords,
      total: scored.length,
    });
  } catch (err) {
    console.error("findCandidatesByJD error:", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ─── Find Candidates by Filters Only ─────────────────────────
export const findCandidatesByFilter = async (req, res) => {
  try {
    const { jobTitle, skills, location, experience, salary, gender, maritalStatus, employmentType, workMode, qualification, shift } = req.query;

    let query = `
      SELECT u.id, u.fullname, u.email, u.candidateProfile, u.skills, u.experience, u.city as location
      FROM users u
      WHERE u.role = 'Employee' AND u.isBlocked = 0
    `;
    const [candidates] = await connection.promise().query(query);

    // Combine form inputs into a keyword array
    const manualKeywords = [];
    if (jobTitle) manualKeywords.push(...jobTitle.split(/[,\s]+/).filter(Boolean));
    if (skills) manualKeywords.push(...skills.split(/[,\s]+/).filter(Boolean));
    if (location) manualKeywords.push(...location.split(/[,\s]+/).filter(Boolean));
    if (experience) manualKeywords.push(...experience.split(/[,\s]+/).filter(Boolean));
    
    const keywords = [...new Set(manualKeywords.map(k => k.toLowerCase().trim()).filter(k => k.length > 1))];

    const scored = candidates.map(candidate => {
      const profile = safeParseJSON(candidate.candidateProfile);
      const candidateText = buildCandidateText(candidate, profile);
      
      let score = 0;
      if (keywords.length > 0) {
        score = computeMatchScore(keywords, candidateText);
        // Only return candidates with >0 score if keywords are provided
        if (score === 0) return null;
      }

      // Filter by Gender
      if (gender && profile?.personal?.gender && profile.personal.gender.toLowerCase() !== gender.toLowerCase()) {
        return null;
      }
      
      // Filter by Marital Status
      if (maritalStatus && profile?.personal?.maritalStatus && profile.personal.maritalStatus.toLowerCase() !== maritalStatus.toLowerCase()) {
        return null;
      }

      // Filter by Employment Type
      if (employmentType && profile?.career?.employmentType && profile.career.employmentType.toLowerCase() !== employmentType.toLowerCase()) {
        return null;
      }

      // Filter by Work Mode
      if (workMode && profile?.career?.workMode && profile.career.workMode.toLowerCase() !== workMode.toLowerCase()) {
        return null;
      }

      // Filter by Preferred Shift
      if (shift && profile?.workPrefs?.shift && profile.workPrefs.shift.toLowerCase() !== shift.toLowerCase()) {
        return null;
      }

      // Filter by Qualification (case-insensitive substring match)
      if (qualification && profile?.education?.qualification) {
        if (!profile.education.qualification.toLowerCase().includes(qualification.toLowerCase())) {
          return null;
        }
      }

      // Optional: Filter strictly by salary if provided, otherwise leave it flexible
      if (salary) {
        const [minS, maxS] = parseSalaryRange(salary);
        const candidateSalary = parseFloat(profile?.expectedSalary || profile?.salary || 0);
        if (minS && candidateSalary > 0 && candidateSalary < minS) return null;
      }

      return {
        id: candidate.id,
        fullname: candidate.fullname,
        email: candidate.email,
        location: candidate.location || profile?.location,
        skills: profile?.skills || candidate.skills,
        experience: profile?.experience,
        expectedSalary: profile?.expectedSalary || profile?.salary,
        bio: profile?.bio,
        profilePhoto: profile?.profilePhoto,
        matchScore: score,
        matchedKeywords: keywords.filter(kw => candidateText.toLowerCase().includes(kw)),
        candidateProfile: profile,
      };
    }).filter(Boolean).sort((a, b) => b.matchScore - a.matchScore);

    return res.json({ success: true, candidates: scored, extractedKeywords: keywords, total: scored.length });
  } catch (err) {
    console.error("findCandidatesByFilter error:", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ─── Helpers ──────────────────────────────────────────────────

function extractKeywords(text) {
  // Tech skills, roles, tools - common patterns
  const techPattern = /\b(react|node|python|java|javascript|typescript|angular|vue|mongodb|mysql|postgresql|sql|aws|docker|kubernetes|rest|graphql|redux|express|django|flask|spring|android|ios|swift|kotlin|php|laravel|css|html|tailwind|figma|git|agile|scrum|devops|machine learning|deep learning|nlp|ai|data science|tensorflow|pytorch)\b/gi;
  const rolePattern = /\b(developer|engineer|designer|analyst|manager|architect|lead|consultant|specialist|scientist|intern|senior|junior|full.?stack|front.?end|back.?end|mobile|cloud|data|security|qa|devops)\b/gi;
  const expPattern = /\b(\d+\+?\s*(?:years?|yrs?))\b/gi;

  const found = new Set();
  [...(text.match(techPattern) || []),
   ...(text.match(rolePattern) || []),
   ...(text.match(expPattern) || [])
  ].forEach(kw => found.add(kw.toLowerCase().trim()));

  // Also extract words between 3-20 chars that aren't stop words
  const stopWords = new Set(["the","and","for","with","that","this","have","from","they","will","been","your","about","when","which","their","there","more","also","into","then","than","some","what","over","after","other","through","should","would","could","might","must","these","those","where","while","both","each","only","even","such","just","much","any"]);
  const words = text.toLowerCase().match(/\b[a-z]{3,20}\b/g) || [];
  words.forEach(w => { if (!stopWords.has(w)) found.add(w); });

  return [...found].slice(0, 40); // limit to 40 keywords
}

function buildCandidateText(candidate, profile) {
  const skillsArray = [];
  if (candidate.skills) {
    skillsArray.push(candidate.skills);
  }
  if (profile?.skills) {
    if (Array.isArray(profile.skills)) {
      profile.skills.forEach(s => {
        if (typeof s === "object" && s !== null) {
          if (s.skill) skillsArray.push(s.skill);
        } else {
          skillsArray.push(String(s));
        }
      });
    } else if (typeof profile.skills === "string") {
      skillsArray.push(profile.skills);
    }
  }
  const skillsText = skillsArray.join(" ");

  const locationsArray = [
    candidate.location,
    profile?.location,
    profile?.personal?.city,
    profile?.personal?.state,
    profile?.personal?.country
  ];
  if (Array.isArray(profile?.career?.locations)) {
    locationsArray.push(...profile.career.locations);
  }
  const locationText = locationsArray.filter(Boolean).join(" ");

  const experienceText = [
    candidate.experience,
    profile?.experience?.total,
    profile?.experience?.years,
    profile?.experience?.employmentType
  ].filter(Boolean).join(" ");

  const rolesArray = [
    profile?.career?.title,
    profile?.career?.jobTitle
  ];
  if (Array.isArray(profile?.career?.titles)) {
    rolesArray.push(...profile.career.titles);
  }
  const rolesText = rolesArray.filter(Boolean).join(" ");

  return [
    candidate.fullname,
    locationText,
    skillsText,
    experienceText,
    profile?.bio,
    rolesText,
    profile?.education?.qualification,
    profile?.education?.college,
  ].filter(Boolean).join(" ").toLowerCase();
}

function computeMatchScore(keywords, candidateText) {
  if (!keywords.length) return 0;
  const text = candidateText.toLowerCase();
  const matched = keywords.filter(kw => text.includes(kw.toLowerCase()));
  return Math.round((matched.length / keywords.length) * 100);
}

function safeParseJSON(str) {
  try { return typeof str === "string" ? JSON.parse(str) : str; }
  catch { return {}; }
}

function parseExperienceRange(exp) {
  if (!exp) return [null, null];
  const match = exp.match(/(\d+)\s*[-–]\s*(\d+)/);
  if (match) return [parseInt(match[1]), parseInt(match[2])];
  const singleMatch = exp.match(/(\d+)\+/);
  if (singleMatch) return [parseInt(singleMatch[1]), null];
  return [null, null];
}

function parseSalaryRange(salary) {
  if (!salary) return [null, null];
  const cleanMap = { "k": 1000, "l": 100000, "lpa": 100000 };
  const num = (s) => {
    const m = s.match(/([\d.]+)\s*(k|l|lpa)?/i);
    if (!m) return null;
    return parseFloat(m[1]) * (cleanMap[m[2]?.toLowerCase()] || 1);
  };
  const parts = salary.split(/[-–]/);
  return [num(parts[0]), parts[1] ? num(parts[1]) : null];
}
