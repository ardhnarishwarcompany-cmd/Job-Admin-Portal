import express from "express";
import authenticateToken from "../middleware/isAuthenticated.js";
import { Notification } from "../models/notification.model.js";
import connection from "../utils/db.js";

const router = express.Router();

const syncInterviewRequestNotifications = async (recipientId) => {
  await connection.promise().query(
    `INSERT INTO notifications (recipient,title,body,type,priority,\`read\`)
     SELECT
       j.created_by,
       'Interview schedule request',
       CONCAT(
         COALESCE(u.fullname, 'A candidate'),
         ' requested an interview for ',
         COALESCE(j.title, 'your job'),
         ' on ',
         COALESCE(a.interviewDay, 'selected day'),
         ', ',
         COALESCE(DATE_FORMAT(a.interviewDate, '%Y-%m-%d'), 'selected date'),
         ' at ',
         COALESCE(a.interviewTime, 'selected time'),
         '. Application #',
         a.id
       ),
       'application',
       'high',
       false
     FROM applications a
     INNER JOIN jobs j ON j.id = a.job
     LEFT JOIN users u ON u.id = a.applicant
     WHERE j.created_by = ?
       AND a.interviewStatus = 'requested'
       AND NOT EXISTS (
         SELECT 1 FROM notifications n
         WHERE n.recipient = j.created_by
           AND n.title = 'Interview schedule request'
           AND n.body LIKE CONCAT('%Application #', a.id)
       )`,
    [recipientId]
  );
};

router.get("/", authenticateToken, async (req, res) => {
  try {
    await syncInterviewRequestNotifications(req.id);
    const notifications = await Notification.find({ recipient: req.id }).sort({ createdAt: -1 });
    return res.json({ success: true, notifications });
  } catch (error) {
    console.error("Fetch notifications error:", error);
    return res.status(500).json({ success: false, message: "Server error while fetching notifications." });
  }
});

router.put("/:id/read", authenticateToken, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.id },
      { read: true },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found." });
    }
    return res.json({ success: true, notification });
  } catch (error) {
    console.error("Mark notification read error:", error);
    return res.status(500).json({ success: false, message: "Server error while marking notification read." });
  }
});

router.put("/read-all", authenticateToken, async (req, res) => {
  try {
    await Notification.updateMany({ recipient: req.id, read: false }, { read: true });
    return res.json({ success: true, message: "All notifications marked read." });
  } catch (error) {
    console.error("Mark all read error:", error);
    return res.status(500).json({ success: false, message: "Server error while marking all notifications read." });
  }
});

router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({ _id: req.params.id, recipient: req.id });
    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found." });
    }
    return res.json({ success: true, message: "Notification deleted.", notification });
  } catch (error) {
    console.error("Delete notification error:", error);
    return res.status(500).json({ success: false, message: "Server error while deleting notification." });
  }
});

export default router;
