import { connection } from "../models/dbModels.js";
import { Notification } from "../models/notification.model.js";

export async function checkAndCloseExpiredJobs() {
  try {
    // Find all open jobs older than 7 days that are not already closed/deleted
    const [jobs] = await connection.promise().query(
      `SELECT id, title, created_by, jobCode, created_at 
       FROM jobs 
       WHERE created_at <= DATE_SUB(NOW(), INTERVAL 7 DAY) 
         AND status = 'open' 
         AND isClosed = false 
         AND isDeleted = false`
    );

    if (jobs.length === 0) return;

    console.log(`⏳ Found ${jobs.length} jobs to auto-close...`);

    for (const job of jobs) {
      // Update job status to closed
      await connection.promise().query(
        "UPDATE jobs SET status = 'closed', isClosed = true WHERE id = ?",
        [job.id]
      );

      // Create notification for recruiter
      await Notification.create({
        recipient: job.created_by,
        title: "Your job posting has been closed",
        body: `Your job "${job.title}" has been automatically closed because it has been 7 days or more than 7 days from the job posted date time.`,
        type: "job",
        priority: "medium"
      }).catch(err => console.error("Auto-close notify error:", err));

      // Log the recruiter action
      await connection.promise().query(
        "INSERT INTO recruiter_action_logs (recruiter_id, action_type, details) VALUES (?, 'JOB_CLOSED', ?)",
        [job.created_by, `Job "${job.title}" (Job Code: ${job.jobCode || job.id}) was auto-closed after 7 days.`]
      ).catch(err => console.error("Auto-close log error:", err));

      console.log(`✅ Auto-closed job: "${job.title}" (ID: ${job.id})`);
    }
  } catch (error) {
    console.error("Error checking expired jobs:", error);
  }
}
