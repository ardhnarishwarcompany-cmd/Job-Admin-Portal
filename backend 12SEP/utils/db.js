import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "jobportal",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  connectTimeout: 10000,
});

pool.on("error", (err) => {
  console.error("❌ Pool error:", err.message);
});

pool.on("connection", (connection) => {
  connection.on("error", (err) => {
    console.error("❌ Connection error:", err.message);
  });
});

// Test connection on startup
pool.getConnection((err, conn) => {
  if (err) {
    console.error("❌ DB Connection Failed:", err.message);
  } else {
    console.log("✅ MySQL Connected Successfully");
    conn.release();
  }
});

export default pool;