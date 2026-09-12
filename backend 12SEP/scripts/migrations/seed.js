/**
 * seed.js — Populate the database with test data for manual testing.
 *
 * Run with:  node seed.js
 *
 * What it seeds:
 *  - 1 Admin user
 *  - 1 Recruiter user  +  1 Company owned by that recruiter
 *  - 2 Employee users
 *  - 3 sample Jobs linked to the recruiter's company
 *
 * All passwords are:  Test@1234
 * Admin code used:    ADMIN2024
 */

import bcrypt from "bcryptjs";
import connection from "./utils/db.js";

/* ------------------- helpers ------------------- */
const query = (sql, params = []) => connection.promise().query(sql, params);
const row = ([rows]) => (rows?.length ? rows[0] : null);
const log = (msg) => console.log(`  ${msg}`);

async function userExists(email) {
  const result = await query("SELECT id FROM users WHERE email = ? LIMIT 1", [email]);
  return row(result);
}

async function companyExists(name) {
  const result = await query("SELECT id FROM companies WHERE name = ? LIMIT 1", [name]);
  return row(result);
}

/* ------------------- seed data ------------------- */
const PLAIN_PASSWORD = "Test@1234";

const USERS = [
  {
    fullname: "Super Admin",
    email: "admin@jobportal.com",
    phoneNumber: "9000000001",
    role: "Admin",
    adminCode: "ADMIN2024",
    bio: "Platform administrator with full access.",
    city: "Mumbai",
  },
  {
    fullname: "Ravi Sharma",
    email: "recruiter@jobportal.com",
    phoneNumber: "9000000002",
    role: "Recruiter",
    companyName: "TechNova Solutions",
    gstNumber: "27AABCT1332L1ZV",
    bio: "Senior talent acquisition specialist at TechNova Solutions.",
    city: "Bangalore",
  },
  {
    fullname: "Priya Mehta",
    email: "employee1@jobportal.com",
    phoneNumber: "9000000003",
    role: "Employee",
    dateOfBirth: "1998-05-14",
    bio: "Full-stack developer with 3 years of experience in React and Node.js.",
    skills: "JavaScript,React,Node.js,MySQL,Git",
    city: "Pune",
    experience: "3 years",
    education: "B.Tech Computer Science",
    profileRole: "Full Stack Developer",
  },
  {
    fullname: "Arjun Verma",
    email: "employee2@jobportal.com",
    phoneNumber: "9000000004",
    role: "Employee",
    dateOfBirth: "2000-11-22",
    bio: "Fresh graduate passionate about UI/UX and frontend development.",
    skills: "HTML,CSS,JavaScript,Figma,React",
    city: "Delhi",
    experience: "0 years",
    education: "B.Sc Information Technology",
    profileRole: "Frontend Developer",
  },
];

const COMPANY = {
  name: "TechNova Solutions",
  description:
    "TechNova Solutions is a leading IT services company specializing in enterprise software, cloud infrastructure, and AI-driven products.",
  website: "https://technova.example.com",
  location: "Bangalore, Karnataka",
};

const JOBS = [
  {
    title: "Senior React Developer",
    description:
      "We are looking for an experienced React Developer to join our frontend team. You will be responsible for building scalable web applications and mentoring junior developers.",
    requirements: "React,JavaScript,TypeScript,REST APIs,Git",
    salary: "18-25 LPA",
    location: "Bangalore (Hybrid)",
    jobType: "Full-time",
    experienceLevel: 3,
    position: 2,
    status: "open",
  },
  {
    title: "Node.js Backend Engineer",
    description:
      "Join our backend team to design and maintain RESTful APIs, work with MySQL and Redis, and ensure high availability of our services.",
    requirements: "Node.js,Express,MySQL,Redis,Docker",
    salary: "15-22 LPA",
    location: "Bangalore (On-site)",
    jobType: "Full-time",
    experienceLevel: 2,
    position: 3,
    status: "open",
  },
  {
    title: "UI/UX Designer",
    description:
      "We need a creative UI/UX Designer to craft beautiful and intuitive user interfaces. Experience with Figma and user research is a must.",
    requirements: "Figma,Adobe XD,User Research,Prototyping,HTML/CSS",
    salary: "10-16 LPA",
    location: "Remote",
    jobType: "Full-time",
    experienceLevel: 1,
    position: 1,
    status: "open",
  },
];

/* ------------------- main ------------------- */
async function seed() {
  console.log("\n?? Starting database seed...\n");

  const hashedPassword = await bcrypt.hash(PLAIN_PASSWORD, 10);

  /* -- 1. Users -- */
  console.log("?? Seeding users...");
  const createdUserIds = {};

  for (const u of USERS) {
    const existing = await userExists(u.email);
    if (existing) {
      log(`??  Skipped (already exists): ${u.email}  [id: ${existing.id}]`);
      createdUserIds[u.email] = existing.id;
      continue;
    }

    const [result] = await query(
      `INSERT INTO users
        (fullname, email, phoneNumber, password, role,
         dateOfBirth, companyName, gstNumber, adminCode,
         bio, skills, city, experience, education, profileRole)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        u.fullname,
        u.email,
        u.phoneNumber,
        hashedPassword,
        u.role,
        u.dateOfBirth || null,
        u.companyName || null,
        u.gstNumber || null,
        u.adminCode || null,
        u.bio || null,
        u.skills || null,
        u.city || null,
        u.experience || null,
        u.education || null,
        u.profileRole || null,
      ]
    );

    createdUserIds[u.email] = result.insertId;
    log(`? Created [${u.role}]: ${u.fullname} <${u.email}>  [id: ${result.insertId}]`);
  }

  /* -- 2. Company -- */
  console.log("\n?? Seeding company...");
  const recruiterId = createdUserIds["recruiter@jobportal.com"];

  let companyId;
  const existingCompany = await companyExists(COMPANY.name);
  if (existingCompany) {
    companyId = existingCompany.id;
    log(`??  Skipped (already exists): ${COMPANY.name}  [id: ${companyId}]`);
  } else {
    const [result] = await query(
      `INSERT INTO companies (name, description, website, location, userId)
       VALUES (?,?,?,?,?)`,
      [COMPANY.name, COMPANY.description, COMPANY.website, COMPANY.location, recruiterId]
    );
    companyId = result.insertId;
    log(`? Created company: ${COMPANY.name}  [id: ${companyId}]`);
  }

  /* -- 3. Jobs -- */
  console.log("\n?? Seeding jobs...");
  for (const job of JOBS) {
    const [existing] = await query("SELECT id FROM jobs WHERE title = ? AND created_by = ? LIMIT 1", [
      job.title,
      recruiterId,
    ]);
    if (existing?.length) {
      log(`??  Skipped (already exists): ${job.title}`);
      continue;
    }

    const [result] = await query(
      `INSERT INTO jobs
        (title, description, requirements, salary, location, jobType, experienceLevel, position, company, created_by, status)
       VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
      [
        job.title,
        job.description,
        job.requirements,
        job.salary,
        job.location,
        job.jobType,
        job.experienceLevel,
        job.position,
        companyId,
        recruiterId,
        job.status,
      ]
    );
    log(`? Created job: "${job.title}"  [id: ${result.insertId}]`);
  }

  /* -- Summary -- */
  console.log("\n??????????????????????????????????????????????");
  console.log("?? Seed complete! Login credentials:\n");
  console.log("  Role       | Email                         | Password");
  console.log("  -----------+-------------------------------+-------------");
  console.log("  Admin      | admin@jobportal.com           | Test@1234");
  console.log("  Recruiter  | recruiter@jobportal.com       | Test@1234");
  console.log("  Employee 1 | employee1@jobportal.com       | Test@1234");
  console.log("  Employee 2 | employee2@jobportal.com       | Test@1234");
  console.log("??????????????????????????????????????????????\n");

  /* close pool */
  await connection.promise().end();
  process.exit(0);
}

seed().catch((err) => {
  console.error("\n? Seed failed:", err.message);
  connection.end();
  process.exit(1);
});
