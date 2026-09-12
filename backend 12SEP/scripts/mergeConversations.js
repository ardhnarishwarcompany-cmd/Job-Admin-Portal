import connection from "../utils/db.js";

const mergeAllDuplicates = async () => {
  try {
    console.log("🔍 Looking for duplicate conversations...");

    // Find all pairs of users with more than 1 candidate_recruiter conversation
    const [duplicates] = await connection.promise().query(`
      SELECT 
        LEAST(userOneId, userTwoId) AS uid1, 
        GREATEST(userOneId, userTwoId) AS uid2, 
        COUNT(*) AS cnt
      FROM conversations
      WHERE type = 'candidate_recruiter'
      GROUP BY uid1, uid2
      HAVING cnt > 1
    `);

    if (duplicates.length === 0) {
      console.log("✅ No duplicates found. DB is clean.");
      process.exit(0);
    }

    console.log(`⚠️  Found ${duplicates.length} user pair(s) with duplicates. Merging...`);

    for (const pair of duplicates) {
      const { uid1, uid2 } = pair;

      // Fetch conversations for this pair. Prefer 'accepted', then oldest id.
      const [convs] = await connection.promise().query(
        `SELECT * FROM conversations
         WHERE type = 'candidate_recruiter'
           AND ((userOneId = ? AND userTwoId = ?) OR (userOneId = ? AND userTwoId = ?))
         ORDER BY 
           CASE WHEN status = 'accepted' THEN 0 ELSE 1 END ASC,
           id ASC`,
        [uid1, uid2, uid2, uid1]
      );

      if (convs.length <= 1) continue;

      const primary = convs[0];
      const duplicatesToDelete = convs.slice(1);

      console.log(`  → Keeping conversation ID ${primary.id} (${uid1} ↔ ${uid2})`);
      console.log(`    Merging and deleting IDs: ${duplicatesToDelete.map(c => c.id).join(", ")}`);

      for (const dup of duplicatesToDelete) {
        // Move all messages from duplicate into primary
        await connection.promise().query(
          "UPDATE messages SET conversationId = ? WHERE conversationId = ?",
          [primary.id, dup.id]
        );
        // Delete the duplicate conversation
        await connection.promise().query(
          "DELETE FROM conversations WHERE id = ?",
          [dup.id]
        );
      }

      // Ensure primary conversation is 'accepted'
      if (primary.status !== "accepted") {
        await connection.promise().query(
          "UPDATE conversations SET status = 'accepted' WHERE id = ?",
          [primary.id]
        );
      }

      // Refresh lastMessage and lastMessageAt from actual messages
      const [latest] = await connection.promise().query(
        `SELECT message, created_at FROM messages 
         WHERE conversationId = ? 
         ORDER BY id DESC LIMIT 1`,
        [primary.id]
      );

      if (latest.length > 0) {
        await connection.promise().query(
          "UPDATE conversations SET lastMessage = ?, lastMessageAt = ? WHERE id = ?",
          [latest[0].message, latest[0].created_at, primary.id]
        );
      }
    }

    console.log("✨ Merge complete! All duplicate conversations cleaned up.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error during merge:", err);
    process.exit(1);
  }
};

mergeAllDuplicates();
