import jsPDF from "jspdf";

export const TEMPLATES = [
  {
    id: "modern",
    name: "Modern",
    description:
      "Clean single column, strong visual hierarchy, and recruiter-friendly spacing.",
    accent: "#2563eb",
  },
  {
    id: "classic",
    name: "Classic ATS-Safe",
    description:
      "Minimal black-and-white structure designed for strict ATS parsing and clean exports.",
    accent: "#111827",
  },
  {
    id: "professional",
    name: "Professional",
    description:
      "Executive-style layout with a clear sidebar and polished section rhythm.",
    accent: "#0f766e",
  },
];

export const splitResumeList = (value) =>
  (value || "")
    .split(/[,\n]/)
    .map((v) => v.trim())
    .filter(Boolean);

export const splitBulletLines = (value) =>
  (value || "")
    .split(/\n+/)
    .map((line) => line.replace(/^[\s•\-*]+/, "").trim())
    .filter(Boolean);

export const calculateResumeCompleteness = (cv) => {
  const checks = [
    Boolean(cv.name?.trim()),
    Boolean(cv.title?.trim()),
    Boolean(cv.email?.trim()),
    Boolean(cv.phone?.trim()),
    Boolean(cv.location?.trim()),
    Boolean(cv.summary?.trim()),
    (cv.experience || []).some((e) => e.role || e.company || e.description),
    (cv.education || []).some((e) => e.degree || e.school),
    splitResumeList(cv.skills).length > 0,
  ];

  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
};

export const getResumeHealthChecks = (cv, jobDescription = "") => {
  const summaryWords = (cv.summary || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  const skillsCount = splitResumeList(cv.skills).length;
  const certificationsCount = splitResumeList(cv.certifications).length;
  const languagesCount = splitResumeList(cv.languages).length;
  const achievementsCount = splitBulletLines(cv.achievements).length;
  const experience = (cv.experience || []).filter(
    (e) => e.role || e.company || e.description,
  );
  const experienceBulletCount = experience.reduce(
    (count, item) => count + splitBulletLines(item.description).length,
    0,
  );
  const projectsCount = (cv.projects || []).filter(
    (p) => p.title || p.description,
  ).length;
  const linksCount = [
    cv.linkedin,
    cv.portfolio,
    ...(cv.links || []).map((link) => link.url),
  ].filter(Boolean).length;

  return [
    {
      label: "Core profile",
      status: cv.name && cv.title && cv.email && cv.phone ? "good" : "warning",
      detail:
        cv.name && cv.title && cv.email && cv.phone
          ? "Essential recruiter-facing details are present."
          : "Add your name, title, email, and phone for a complete header.",
    },
    {
      label: "Summary length",
      status:
        summaryWords >= 40 && summaryWords <= 90
          ? "good"
          : summaryWords > 0
            ? "warning"
            : "empty",
      detail:
        summaryWords === 0
          ? "Add a 40-80 word summary tailored to your target role."
          : `${summaryWords} words detected. Aim for 40-80 words for best readability.`,
    },
    {
      label: "Experience bullets",
      status:
        experienceBulletCount >= Math.max(2, experience.length * 2)
          ? "good"
          : experience.length
            ? "warning"
            : "empty",
      detail: experience.length
        ? `${experienceBulletCount} bullet points found across ${experience.length} experience entr${experience.length === 1 ? "y" : "ies"}.`
        : "Add at least one work experience entry.",
    },
    {
      label: "Skills coverage",
      status: skillsCount >= 6 ? "good" : skillsCount > 0 ? "warning" : "empty",
      detail: skillsCount
        ? `${skillsCount} skills listed.`
        : "Add relevant technical and role-specific skills.",
    },
    {
      label: "Supporting sections",
      status:
        projectsCount +
          certificationsCount +
          achievementsCount +
          languagesCount >=
        2
          ? "good"
          : "warning",
      detail: `${projectsCount} projects, ${certificationsCount} certifications, ${achievementsCount} achievements, ${languagesCount} languages.`,
    },
    {
      label: "Professional links",
      status: linksCount >= 1 ? "good" : "warning",
      detail: linksCount
        ? `${linksCount} professional link${linksCount > 1 ? "s" : ""} added.`
        : "Add LinkedIn, portfolio, GitHub, or other relevant links.",
    },
    {
      label: "Target alignment",
      status: jobDescription.trim() ? "good" : "warning",
      detail: jobDescription.trim()
        ? "A job description is present, so ATS keyword matching can be more precise."
        : "Paste the target job description for stronger ATS analysis.",
    },
  ];
};

export const buildResumeText = (cv) => {
  const lines = [];
  const contactBits = [cv.email, cv.phone, cv.location].filter(Boolean);
  const socialBits = [cv.linkedin, cv.portfolio].filter(Boolean);
  const experience = (cv.experience || []).filter(
    (e) => e.role || e.company || e.description,
  );
  const education = (cv.education || []).filter((e) => e.degree || e.school);
  const skills = splitResumeList(cv.skills);
  const projects = (cv.projects || []).filter((p) => p.title || p.description);
  const certifications = splitResumeList(cv.certifications);
  const achievements = splitBulletLines(cv.achievements);
  const languages = splitResumeList(cv.languages);
  const links = (cv.links || []).filter((link) => link.label || link.url);

  lines.push(cv.name || "Your Name");
  if (cv.title) lines.push(cv.title);
  if (contactBits.length) lines.push(contactBits.join(" | "));
  if (socialBits.length) lines.push(socialBits.join(" | "));
  lines.push("");

  if (cv.summary?.trim()) {
    lines.push("SUMMARY");
    lines.push(cv.summary.trim());
    lines.push("");
  }

  if (experience.length) {
    lines.push("EXPERIENCE");
    experience.forEach((e) => {
      lines.push(
        `${e.role || "Role"} - ${e.company || "Company"}${e.duration ? ` (${e.duration})` : ""}`,
      );
      splitBulletLines(e.description).forEach((bullet) =>
        lines.push(`- ${bullet}`),
      );
      lines.push("");
    });
  }

  if (education.length) {
    lines.push("EDUCATION");
    education.forEach((e) => {
      lines.push(
        `${e.degree || "Degree"} - ${e.school || "Institution"}${e.year ? ` (${e.year})` : ""}`,
      );
    });
    lines.push("");
  }

  if (skills.length) {
    lines.push("SKILLS");
    lines.push(skills.join(", "));
    lines.push("");
  }

  if (projects.length) {
    lines.push("PROJECTS");
    projects.forEach((p) => {
      lines.push(p.title || "Project");
      splitBulletLines(p.description).forEach((bullet) =>
        lines.push(`- ${bullet}`),
      );
    });
    lines.push("");
  }

  if (certifications.length) {
    lines.push("CERTIFICATIONS");
    lines.push(certifications.join(", "));
    lines.push("");
  }

  if (achievements.length) {
    lines.push("ACHIEVEMENTS");
    achievements.forEach((item) => lines.push(`- ${item}`));
    lines.push("");
  }

  if (languages.length) {
    lines.push("LANGUAGES");
    lines.push(languages.join(", "));
    lines.push("");
  }

  if (links.length) {
    lines.push("LINKS");
    links.forEach((link) =>
      lines.push(`${link.label || "Link"}: ${link.url || ""}`.trim()),
    );
  }

  return lines.join("\n").trim();
};

const PAGE_WIDTH = 210;
const MARGIN = 16;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

function hexToRgb(hex) {
  const clean = hex.replace("#", "");
  const bigint = parseInt(clean, 16);
  return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
}

function addWrapped(doc, text, x, y, maxWidth, lineHeight) {
  const lines = doc.splitTextToSize(text, maxWidth);
  lines.forEach((line) => {
    doc.text(line, x, y);
    y += lineHeight;
  });
  return y;
}

function addBullets(doc, items, x, y, maxWidth, lineHeight, indent = 4) {
  items.forEach((item) => {
    const lines = doc.splitTextToSize(item, maxWidth - indent);
    lines.forEach((line, index) => {
      if (index === 0) {
        doc.text(`• ${line}`, x, y);
      } else {
        doc.text(line, x + indent, y);
      }
      y += lineHeight;
    });
  });
  return y;
}

function ensureSpace(doc, y, needed) {
  const pageHeight = doc.internal.pageSize.getHeight();
  if (y + needed > pageHeight - MARGIN) {
    doc.addPage();
    return MARGIN;
  }
  return y;
}

function getStructuredSections(cv) {
  return {
    contactBits: [
      cv.title,
      cv.email,
      cv.phone,
      cv.location,
      cv.linkedin,
      cv.portfolio,
    ].filter(Boolean),
    experience: (cv.experience || []).filter(
      (e) => e.role || e.company || e.description,
    ),
    education: (cv.education || []).filter((e) => e.degree || e.school),
    skills: splitResumeList(cv.skills),
    projects: (cv.projects || []).filter((p) => p.title || p.description),
    certifications: splitResumeList(cv.certifications),
    achievements: splitBulletLines(cv.achievements),
    languages: splitResumeList(cv.languages),
    links: (cv.links || []).filter((link) => link.label || link.url),
  };
}

function drawModern(doc, cv, accent) {
  const [r, g, b] = hexToRgb(accent);
  const {
    experience,
    education,
    skills,
    projects,
    certifications,
    achievements,
    languages,
    links,
  } = getStructuredSections(cv);
  const contactBits = [cv.email, cv.phone, cv.location].filter(Boolean);
  const socialBits = [cv.linkedin, cv.portfolio].filter(Boolean);
  let y = MARGIN;

  // Header: Name
  doc.setFont("helvetica", "bold");
  doc.setFontSize(21);
  doc.setTextColor(20, 20, 20);
  doc.text(cv.name || "Your Name", MARGIN, y);
  y += 6;

  // Header: Title
  if (cv.title) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(r, g, b);
    y = addWrapped(doc, cv.title, MARGIN, y, CONTENT_WIDTH, 4);
    y += 2;
  }

  // Header: Contact info
  if (contactBits.length) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    y = addWrapped(
      doc,
      contactBits.join("   |   "),
      MARGIN,
      y,
      CONTENT_WIDTH,
      4,
    );
    y += 1;
  }

  // Header: Social links
  if (socialBits.length) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    y = addWrapped(
      doc,
      socialBits.join("   |   "),
      MARGIN,
      y,
      CONTENT_WIDTH,
      4,
    );
    y += 1;
  }

  // Header border
  doc.setDrawColor(r, g, b);
  doc.setLineWidth(1.2);
  doc.line(MARGIN, y + 1, PAGE_WIDTH - MARGIN, y + 1);
  y += 6;

  const sectionTitle = (title) => {
    y = ensureSpace(doc, y, 8);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(r, g, b);
    doc.text(title.toUpperCase(), MARGIN, y);
    y += 4;
    doc.setTextColor(30, 30, 30);
  };

  // Summary
  if (cv.summary?.trim()) {
    sectionTitle("Summary");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(80, 80, 80);
    y = addWrapped(doc, cv.summary.trim(), MARGIN, y, CONTENT_WIDTH, 5);
    y += 4;
  }

  // Experience
  if (experience.length) {
    sectionTitle("Experience");
    experience.forEach((e, index) => {
      y = ensureSpace(doc, y, 14);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(30, 30, 30);

      // Role and duration on same line (with right alignment)
      if (e.duration) {
        doc.text(e.role || "Role", MARGIN, y);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(120, 120, 120);
        doc.text(e.duration, PAGE_WIDTH - MARGIN, y, { align: "right" });
      } else {
        doc.text(e.role || "Role", MARGIN, y);
      }
      y += 4;

      // Company
      doc.setFont("helvetica", "italic");
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text(e.company || "Company", MARGIN, y);
      y += 4;

      // Description bullets
      if (e.description) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.5);
        doc.setTextColor(50, 50, 50);
        y = addBullets(
          doc,
          splitBulletLines(e.description),
          MARGIN,
          y,
          CONTENT_WIDTH,
          4.5,
        );
      }

      // Spacing between experience items
      if (index < experience.length - 1) {
        y += 3;
      }
    });
    y += 2;
  }

  // Education
  if (education.length) {
    sectionTitle("Education");
    education.forEach((e, index) => {
      y = ensureSpace(doc, y, 10);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(30, 30, 30);
      doc.text(e.degree || "Degree", MARGIN, y);
      if (e.year) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(120, 120, 120);
        doc.text(e.year, PAGE_WIDTH - MARGIN, y, { align: "right" });
      }
      y += 4;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text(e.school || "Institution", MARGIN, y);
      y += 4;

      if (index < education.length - 1) {
        y += 2;
      }
    });
    y += 2;
  }

  // Skills
  if (skills.length) {
    sectionTitle("Skills");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(50, 50, 50);
    y = addWrapped(doc, skills.join("   •   "), MARGIN, y, CONTENT_WIDTH, 4.5);
    y += 3;
  }

  // Projects
  if (projects.length) {
    sectionTitle("Projects");
    projects.forEach((p, index) => {
      y = ensureSpace(doc, y, 10);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(30, 30, 30);
      doc.text(p.title || "Project", MARGIN, y);
      y += 4;
      if (p.description) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.5);
        doc.setTextColor(50, 50, 50);
        y = addBullets(
          doc,
          splitBulletLines(p.description),
          MARGIN,
          y,
          CONTENT_WIDTH,
          4.5,
        );
      }

      if (index < projects.length - 1) {
        y += 2;
      }
    });
    y += 2;
  }

  // Certifications
  if (certifications.length) {
    sectionTitle("Certifications");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(50, 50, 50);
    y = addWrapped(
      doc,
      certifications.join("   •   "),
      MARGIN,
      y,
      CONTENT_WIDTH,
      4.5,
    );
    y += 3;
  }

  // Achievements
  if (achievements.length) {
    sectionTitle("Achievements");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(50, 50, 50);
    y = addBullets(doc, achievements, MARGIN, y, CONTENT_WIDTH, 4.5);
    y += 3;
  }

  // Languages
  if (languages.length) {
    sectionTitle("Languages");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(50, 50, 50);
    y = addWrapped(
      doc,
      languages.join("   •   "),
      MARGIN,
      y,
      CONTENT_WIDTH,
      4.5,
    );
    y += 3;
  }

  // Links
  if (links.length) {
    sectionTitle("Links");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(50, 50, 50);
    links.forEach((link) => {
      y = addWrapped(
        doc,
        `${link.label || "Link"}: ${link.url || ""}`,
        MARGIN,
        y,
        CONTENT_WIDTH,
        4.5,
      );
    });
  }
}

function drawClassic(doc, cv) {
  const {
    experience,
    education,
    skills,
    projects,
    certifications,
    achievements,
    languages,
    links,
  } = getStructuredSections(cv);
  const contactBits = [cv.email, cv.phone, cv.location].filter(Boolean);
  const socialBits = [cv.linkedin, cv.portfolio].filter(Boolean);
  let y = MARGIN;

  doc.setFont("times", "bold");
  doc.setFontSize(18);
  doc.setTextColor(0, 0, 0);
  doc.text(cv.name || "Your Name", MARGIN, y);
  y += 7;

  // Header: Contact info
  if (contactBits.length) {
    doc.setFont("times", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(40, 40, 40);
    y = addWrapped(doc, contactBits.join(" | "), MARGIN, y, CONTENT_WIDTH, 4);
    y += 1;
  }

  // Header: Social links
  if (socialBits.length) {
    doc.setFont("times", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(40, 40, 40);
    y = addWrapped(doc, socialBits.join(" | "), MARGIN, y, CONTENT_WIDTH, 4);
    y += 1;
  }

  // Header border
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.line(MARGIN, y + 1, PAGE_WIDTH - MARGIN, y + 1);
  y += 4;

  const sectionTitle = (title) => {
    y = ensureSpace(doc, y, 8);
    doc.setFont("times", "bold");
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(title.toUpperCase(), MARGIN, y);
    y += 2.5;
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.3);
    doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
    y += 3;
  };

  if (cv.summary?.trim()) {
    sectionTitle("Professional Summary");
    doc.setFont("times", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(30, 30, 30);
    y = addWrapped(doc, cv.summary.trim(), MARGIN, y, CONTENT_WIDTH, 4.8);
    y += 3;
  }

  if (experience.length) {
    sectionTitle("Professional Experience");
    experience.forEach((e, index) => {
      y = ensureSpace(doc, y, 12);
      doc.setFont("times", "bold");
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(e.role || "Role", MARGIN, y);
      if (e.duration) {
        doc.setFont("times", "normal");
        doc.setFontSize(9);
        doc.setTextColor(80, 80, 80);
        doc.text(e.duration, PAGE_WIDTH - MARGIN, y, { align: "right" });
      }
      y += 3.5;

      doc.setFont("times", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(40, 40, 40);
      doc.text(e.company || "Company", MARGIN, y);
      y += 3.5;

      if (e.description) {
        doc.setFont("times", "normal");
        doc.setFontSize(9.5);
        doc.setTextColor(30, 30, 30);
        y = addBullets(
          doc,
          splitBulletLines(e.description),
          MARGIN,
          y,
          CONTENT_WIDTH,
          4.2,
        );
      }

      if (index < experience.length - 1) {
        y += 2;
      }
    });
    y += 1;
  }

  if (education.length) {
    sectionTitle("Education");
    education.forEach((e) => {
      y = ensureSpace(doc, y, 8);
      doc.setFont("times", "bold");
      doc.setFontSize(10.5);
      doc.text(
        `${e.degree || "Degree"}, ${e.school || "Institution"}`,
        MARGIN,
        y,
      );
      if (e.year) {
        doc.setFont("times", "normal");
        doc.setFontSize(9.5);
        doc.text(e.year, PAGE_WIDTH - MARGIN, y, { align: "right" });
      }
      y += 6;
    });
  }

  if (skills.length) {
    sectionTitle("Skills");
    doc.setFont("times", "normal");
    doc.setFontSize(10);
    y = addWrapped(doc, skills.join(", "), MARGIN, y, CONTENT_WIDTH, 5);
    y += 4;
  }

  if (projects.length) {
    sectionTitle("Projects");
    projects.forEach((p) => {
      y = ensureSpace(doc, y, 12);
      doc.setFont("times", "bold");
      doc.setFontSize(10.5);
      doc.text(p.title || "Project", MARGIN, y);
      y += 5;
      if (p.description) {
        doc.setFont("times", "normal");
        doc.setFontSize(10);
        y = addBullets(
          doc,
          splitBulletLines(p.description),
          MARGIN,
          y,
          CONTENT_WIDTH,
          4.8,
        );
      }
      y += 3;
    });
  }

  if (certifications.length) {
    sectionTitle("Certifications");
    doc.setFont("times", "normal");
    doc.setFontSize(10);
    y = addWrapped(doc, certifications.join(", "), MARGIN, y, CONTENT_WIDTH, 5);
    y += 3;
  }

  if (achievements.length) {
    sectionTitle("Achievements");
    doc.setFont("times", "normal");
    doc.setFontSize(10);
    y = addBullets(doc, achievements, MARGIN, y, CONTENT_WIDTH, 4.8);
    y += 3;
  }

  if (languages.length) {
    sectionTitle("Languages");
    doc.setFont("times", "normal");
    doc.setFontSize(10);
    y = addWrapped(doc, languages.join(", "), MARGIN, y, CONTENT_WIDTH, 5);
    y += 3;
  }

  if (links.length) {
    sectionTitle("Links");
    doc.setFont("times", "normal");
    doc.setFontSize(10);
    links.forEach((link) => {
      y = addWrapped(
        doc,
        `${link.label || "Link"}: ${link.url || ""}`,
        MARGIN,
        y,
        CONTENT_WIDTH,
        5,
      );
    });
  }
}

function drawProfessional(doc, cv, accent) {
  const [r, g, b] = hexToRgb(accent);
  const {
    experience,
    education,
    skills,
    projects,
    certifications,
    achievements,
    languages,
    links,
  } = getStructuredSections(cv);
  const contactBits = [cv.email, cv.phone, cv.location].filter(Boolean);
  const socialBits = [cv.linkedin, cv.portfolio].filter(Boolean);
  const sidebarWidth = 62;
  const pageHeight = doc.internal.pageSize.getHeight();

  doc.setFillColor(r, g, b);
  doc.rect(0, 0, sidebarWidth, pageHeight, "F");

  let sy = MARGIN;
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  sy = addWrapped(doc, cv.name || "Your Name", 10, sy, sidebarWidth - 16, 6.5);
  sy += 3;

  if (cv.title) {
    doc.setFont("helvetica", "semibold");
    doc.setFontSize(9);
    sy = addWrapped(doc, cv.title, 10, sy, sidebarWidth - 16, 4.5);
    sy += 3;
  }

  if (contactBits.length) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    contactBits.forEach((bit) => {
      sy = addWrapped(doc, bit, 10, sy, sidebarWidth - 16, 4.5);
    });
    sy += 2;
  }

  if (socialBits.length) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    socialBits.forEach((bit) => {
      sy = addWrapped(doc, bit, 10, sy, sidebarWidth - 16, 4.5);
    });
    sy += 4;
  }

  if (skills.length) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("SKILLS", 10, sy);
    sy += 5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    skills.forEach((skill) => {
      sy = addWrapped(doc, `• ${skill}`, 10, sy, sidebarWidth - 16, 4.5);
    });
    sy += 4;
  }

  if (education.length) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("EDUCATION", 10, sy);
    sy += 5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    education.forEach((e) => {
      sy = addWrapped(
        doc,
        e.degree || "Degree",
        10,
        sy,
        sidebarWidth - 16,
        4.5,
      );
      sy = addWrapped(
        doc,
        `${e.school || ""}${e.year ? ` (${e.year})` : ""}`,
        10,
        sy,
        sidebarWidth - 16,
        4.5,
      );
      sy += 2;
    });
  }

  if (certifications.length) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("CERTIFICATIONS", 10, sy);
    sy += 5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    certifications.forEach((cert) => {
      sy = addWrapped(doc, `• ${cert}`, 10, sy, sidebarWidth - 16, 4.5);
    });
    sy += 4;
  }

  if (languages.length) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("LANGUAGES", 10, sy);
    sy += 5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    languages.forEach((language) => {
      sy = addWrapped(doc, `• ${language}`, 10, sy, sidebarWidth - 16, 4.5);
    });
  }

  const mainX = sidebarWidth + 10;
  const mainWidth = PAGE_WIDTH - mainX - MARGIN;
  let y = MARGIN;

  const sectionTitle = (title) => {
    y = ensureSpace(doc, y, 12);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(r, g, b);
    doc.text(title.toUpperCase(), mainX, y);
    y += 2;
    doc.setDrawColor(r, g, b);
    doc.setLineWidth(0.6);
    doc.line(mainX, y, PAGE_WIDTH - MARGIN, y);
    y += 6;
    doc.setTextColor(30, 30, 30);
  };

  if (cv.summary?.trim()) {
    sectionTitle("Profile");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.5);
    y = addWrapped(doc, cv.summary.trim(), mainX, y, mainWidth, 5);
    y += 4;
  }

  if (experience.length) {
    sectionTitle("Experience");
    experience.forEach((e) => {
      y = ensureSpace(doc, y, 18);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(30, 30, 30);
      doc.text(e.role || "Role", mainX, y);
      if (e.duration) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.5);
        doc.setTextColor(120, 120, 120);
        doc.text(e.duration, PAGE_WIDTH - MARGIN, y, { align: "right" });
      }
      y += 5;
      doc.setFont("helvetica", "italic");
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      doc.text(e.company || "Company", mainX, y);
      y += 5;
      if (e.description) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(40, 40, 40);
        y = addBullets(
          doc,
          splitBulletLines(e.description),
          mainX,
          y,
          mainWidth,
          4.8,
        );
      }
      y += 4;
    });
  }

  if (projects.length) {
    sectionTitle("Projects");
    projects.forEach((p) => {
      y = ensureSpace(doc, y, 12);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);
      doc.text(p.title || "Project", mainX, y);
      y += 5;
      if (p.description) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        y = addBullets(
          doc,
          splitBulletLines(p.description),
          mainX,
          y,
          mainWidth,
          4.8,
        );
      }
      y += 3;
    });
  }

  if (achievements.length) {
    sectionTitle("Achievements");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    y = addBullets(doc, achievements, mainX, y, mainWidth, 4.8);
    y += 3;
  }

  if (links.length) {
    sectionTitle("Links");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    links.forEach((link) => {
      y = addWrapped(
        doc,
        `${link.label || "Link"}: ${link.url || ""}`,
        mainX,
        y,
        mainWidth,
        5,
      );
    });
  }
}

export function generateResumePdf(cv, templateId) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const template =
    TEMPLATES.find((item) => item.id === templateId) || TEMPLATES[0];

  if (templateId === "classic") {
    drawClassic(doc, cv);
  } else if (templateId === "professional") {
    drawProfessional(doc, cv, template.accent);
  } else {
    drawModern(doc, cv, template.accent);
  }

  return doc;
}

export function downloadResumePdf(cv, templateId) {
  const doc = generateResumePdf(cv, templateId);
  const filename = `${(cv.name || "resume").trim().replace(/\s+/g, "_")}_resume.pdf`;
  doc.save(filename);
}
