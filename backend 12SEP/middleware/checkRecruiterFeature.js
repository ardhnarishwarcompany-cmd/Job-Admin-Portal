import { connection } from "../models/dbModels.js";

export const checkRecruiterFeature = (featureName) => {
  return async (req, res, next) => {
    try {
      const userId = req.id;
      const userRole = req.role; // Set by isAuthenticated middleware if available, else fetch

      let role = userRole;
      if (!role) {
        const [userRows] = await connection.promise().query(
          "SELECT role FROM users WHERE id = ? LIMIT 1",
          [userId]
        );
        role = userRows[0]?.role;
      }

      // If not a recruiter, bypass feature access checks
      if (role !== "Recruiter") {
        return next();
      }

      // Check features table
      const [featureRows] = await connection.promise().query(
        "SELECT * FROM recruiter_features WHERE recruiter_id = ? LIMIT 1",
        [userId]
      );

      let features = featureRows[0];
      if (!features) {
        // Insert a default row
        await connection.promise().query(
          "INSERT INTO recruiter_features (recruiter_id) VALUES (?)",
          [userId]
        );
        features = {
          chat_status: "not_requested",
          nova_status: "not_requested",
          find_candidates_status: "not_requested",
        };
      }

      const statusKey = `${featureName}_status`;
      const featureStatus = features[statusKey] || "not_requested";

      if (featureStatus === "approved") {
        return next();
      }

      return res.status(403).json({
        success: false,
        message: `You do not have permission to access ${featureName}. Please send a request to the admin.`,
        featureStatus,
        feature: featureName,
      });
    } catch (error) {
      console.error("checkRecruiterFeature error:", error);
      res.status(500).json({ success: false, message: "Server check error" });
    }
  };
};
