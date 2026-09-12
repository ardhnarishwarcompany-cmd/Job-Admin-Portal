const fs = require('fs');
const path = 'e:\\RECRUWEBPROJECTS\\ChatFJobPortal\\Chat F JobPortal\\ArdhNarishwarJobPortal\\Backend\\models\\dbModels.js';
let content = fs.readFileSync(path, 'utf8');

// I will just use a regex to find everything from `// =============== COMPANIES ===============`
// to `  findById: async (id) => {` and replace it with the correct code.

const fixCode = `// =============== COMPANIES ===============
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

  findById: async (id) => {`;

// Let's find exactly where it broke.
// In the current file, it has:
//     await connection.promise().query(`UPDATE users SET ${setClause} WHERE id = ?`, [...values, id]);
//     return UserModel.findById(id);
//   },
// };
//       .query(
//         `SELECT j.*, c.id as companyId, c.name as companyName, c.description as companyDescription, c.website as companyWebsite, c.location as companyLocation, c.logo as companyLogo

const fixStr = `    await connection.promise().query(\`UPDATE users SET \${setClause} WHERE id = ?\`, [...values, id]);
    return UserModel.findById(id);
  },
};`;

// replace from after UserModel.findById(id); }, }; to findById: async (id) => {
const startIndex = content.indexOf(fixStr) + fixStr.length;
const endIndex = content.indexOf('  findById: async (id) => {', startIndex);

if (startIndex > fixStr.length && endIndex > startIndex) {
  content = content.substring(0, startIndex) + '\n\n' + fixCode + content.substring(endIndex + '  findById: async (id) => {'.length);
  fs.writeFileSync(path, content);
  console.log('Fixed successfully!');
} else {
  console.log('Could not find indices', startIndex, endIndex);
}
