const fs = require('fs');
const path = 'e:\\RECRUWEBPROJECTS\\ChatFJobPortal\\Chat F JobPortal\\ArdhNarishwarJobPortal\\Backend\\models\\dbModels.js';
let content = fs.readFileSync(path, 'utf8');

const beforeFixIndex = content.indexOf('  updateById: async (id, patch) => {');
const afterFixIndex = content.indexOf('  findAllAdmin: async () => {');

const beforeFix = content.substring(0, beforeFixIndex);
const afterFix = content.substring(afterFixIndex);

const fixCode = `  updateById: async (id, patch) => {
    const keys = Object.keys(patch).filter((k) => patch[k] !== undefined && typeof patch[k] !== "function");
    if (!keys.length) return UserModel.findById(id);

    const setClause = keys.map((k) => \`\${k} = ?\`).join(", ");
    const values = keys.map((k) => {
      const v = patch[k];
      return v && typeof v === "object" ? JSON.stringify(v) : v;
    });

    await connection.promise().query(\`UPDATE users SET \${setClause} WHERE id = ?\`, [...values, id]);
    return UserModel.findById(id);
  },
};

// =============== COMPANIES ===============
export const CompanyModel = {
  findById: async (id) => {
    const [rows] = await connection.promise().query("SELECT * FROM companies WHERE id = ? LIMIT 1", [id]);
    return rowOrNull(rows);
  },
  findOneByName: async (name) => {
    const [rows] = await connection.promise().query("SELECT * FROM companies WHERE name = ? LIMIT 1", [name]);
    return rowOrNull(rows);
  },
  create: async (data) => {
    const { name, description, website, location, logo, userId } = data;
    const [result] = await connection
      .promise()
      .query(
        \`INSERT INTO companies (name,description,website,location,logo,userId) VALUES (?,?,?,?,?,?)\`,
        [name, description || null, website || null, location || null, logo || null, userId]
      );
    return CompanyModel.findById(result.insertId);
  },
  findByUserId: async (userId) => {
    const [rows] = await connection.promise().query("SELECT * FROM companies WHERE userId = ?", [userId]);
    return rows;
  },
  updateById: async (id, patch) => {
    const keys = Object.keys(patch).filter((k) => patch[k] !== undefined);
    if (!keys.length) return CompanyModel.findById(id);

    const setClause = keys.map((k) => \`\${k} = ?\`).join(", ");
    const values = keys.map((k) => patch[k]);

    await connection.promise().query(\`UPDATE companies SET \${setClause} WHERE id = ?\`, [...values, id]);
    return CompanyModel.findById(id);
  },
};

// =============== JOBS ===============
export const JobModel = {
  create: async (data) => {
    const {
      title,
      description,
      requirements,
      salary,
      location,
      jobType,
      experienceLevel,
      position,
      company,
      created_by,
      status,
      jobDetails,
      jobCode,
      approvalStatus,
      jdUrl
    } = data;

    const [result] = await connection
      .promise()
      .query(
        \`INSERT INTO jobs (
          title,description,requirements,salary,location,jobType,experienceLevel,position,company,created_by,status,jobDetails,jobCode,approvalStatus,jdUrl
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)\`,
        [
          title,
          description,
          Array.isArray(requirements) ? requirements.join(",") : requirements,
          salary,
          location,
          jobType,
          experienceLevel,
          position,
          company,
          created_by,
          status || "open",
          jobDetails ? JSON.stringify(jobDetails) : null,
          jobCode || null,
          approvalStatus || "pending",
          jdUrl || null
        ]
      );

    const created = await JobModel.findById(result.insertId);
    return created;
  },

  findAll: async (keyword) => {
    const k = keyword ? \`%\${keyword}%\` : "%";
    const [rows] = await connection
      .promise()
      .query(
        \`SELECT j.*, c.id as companyId, c.name as companyName, c.description as companyDescription, c.website as companyWebsite, c.location as companyLocation, c.logo as companyLogo
         FROM jobs j
         LEFT JOIN companies c ON c.id = j.company
         WHERE (j.title LIKE ? OR j.description LIKE ?) AND j.approvalStatus = 'approved' AND j.status = 'open'
         ORDER BY j.created_at DESC\`,
        [k, k]
      );
    return rows.map((row) => ({ ...row, _id: row.id, createdAt: row.created_at }));
  },

  findById: async (id) => {
    const [rows] = await connection
      .promise()
      .query(
        \`SELECT j.*, c.id as companyId, c.name as companyName, c.description as companyDescription, c.website as companyWebsite, c.location as companyLocation, c.logo as companyLogo
         FROM jobs j
         LEFT JOIN companies c ON c.id = j.company
         WHERE j.id = ?
         LIMIT 1\`,
        [id]
      );
    const job = rowOrNull(rows);
    if (!job) return null;

    const appRowsResult = await connection
      .promise()
      .query(
        \`SELECT a.*, u.id as applicantId, u.fullname as applicantFullname
         FROM applications a
         LEFT JOIN users u ON u.id = a.applicant
         WHERE a.job = ?
         ORDER BY a.created_at DESC\`,
        [id]
      );

    job.applications = appRowsResult[0];
    job.requirements = job.requirements ? String(job.requirements).split(",").map((s) => s.trim()).filter(Boolean) : [];
    return job;
  },

`;

if (beforeFixIndex !== -1 && afterFixIndex !== -1 && afterFixIndex > beforeFixIndex) {
  const newContent = beforeFix + fixCode + afterFix;
  fs.writeFileSync(path, newContent);
  console.log("Reconstructed successfully.");
} else {
  console.log("Indices not found", beforeFixIndex, afterFixIndex);
}
