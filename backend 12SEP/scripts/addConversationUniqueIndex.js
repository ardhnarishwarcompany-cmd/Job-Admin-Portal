import connection from "../utils/db.js";

// Instead of a generated column (which MySQL rejects on FK tables),
// we add a plain VARCHAR column 'pairKey' that we compute in the app
// and write on INSERT, then index it UNIQUE.
const addUniqueIndex = async () => {
  try {
    console.log("Adding pair key column + unique index...");

    await connection.promise().query("SET FOREIGN_KEY_CHECKS = 0");

    // Add pairKey column if missing
    await connection.promise().query(`
      ALTER TABLE conversations ADD COLUMN pairKey VARCHAR(150) NULL
    `).catch(err => {
      if (err.code !== "ER_DUP_FIELDNAME") throw err;
      console.log("pairKey column already exists, skipping ADD.");
    });

    // Backfill pairKey for existing rows (using LEAST/GREATEST in SQL)
    await connection.promise().query(`
      UPDATE conversations
      SET pairKey = CONCAT(type, '_', LEAST(userOneId, userTwoId), '_', GREATEST(userOneId, userTwoId))
      WHERE pairKey IS NULL
    `);

    // Create the unique index
    await connection.promise().query(`
      CREATE UNIQUE INDEX idx_conv_pairKey ON conversations (pairKey)
    `).catch(err => {
      if (err.code !== "ER_DUP_KEYNAME") throw err;
      console.log("Index idx_conv_pairKey already exists, skipping.");
    });

    await connection.promise().query("SET FOREIGN_KEY_CHECKS = 1");

    console.log("✅ Done! pairKey column added and unique index created.");
    process.exit(0);
  } catch (err) {
    await connection.promise().query("SET FOREIGN_KEY_CHECKS = 1").catch(() => {});
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
};

addUniqueIndex();
