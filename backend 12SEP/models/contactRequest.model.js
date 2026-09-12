import connection from "../utils/db.js";

export class ContactRequest {
  static async create(data) {
    const { name, email, topic, message } = data;
    const [result] = await connection
      .promise()
      .query(
        `INSERT INTO contact_requests (name, email, topic, message) VALUES (?, ?, ?, ?)`,
        [name, email, topic, message]
      );

    return ContactRequest.findById(result.insertId);
  }

  static async find() {
    const [rows] = await connection
      .promise()
      .query(`SELECT * FROM contact_requests ORDER BY created_at DESC`);
    return rows;
  }

  static async findById(id) {
    const [rows] = await connection
      .promise()
      .query(`SELECT * FROM contact_requests WHERE id = ? LIMIT 1`, [id]);
    return rows[0] || null;
  }

  static async findByIdAndUpdate(id, patch) {
    const keys = Object.keys(patch).filter((key) => patch[key] !== undefined);
    if (!keys.length) {
      return ContactRequest.findById(id);
    }

    const setClause = keys.map((key) => `${key} = ?`).join(", ");
    const values = keys.map((key) => patch[key]);

    await connection
      .promise()
      .query(`UPDATE contact_requests SET ${setClause} WHERE id = ?`, [...values, id]);

    return ContactRequest.findById(id);
  }
}

