import connection from "../utils/db.js";

// Helper to convert database rows to notification objects
const formatNotification = (row) => {
  if (!row) return null;
  return {
    _id: String(row.id),
    id: String(row.id),
    recipient: row.recipient,
    title: row.title,
    body: row.body,
    type: row.type,
    priority: row.priority,
    read: row.read === 1 || row.read === true,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

// Notification model with Mongoose-like API for MySQL
export const Notification = {
  create: async (data = {}) => {
    try {
      const {
        recipient,
        title,
        body,
        type = "system",
        priority = "medium",
        read = false,
      } = data;

      const [result] = await connection.promise().query(
        "INSERT INTO notifications (recipient,title,body,type,priority,`read`) VALUES (?,?,?,?,?,?)",
        [recipient, title, body, type, priority, read ? 1 : 0]
      );

      const [rows] = await connection.promise().query("SELECT * FROM notifications WHERE id = ? LIMIT 1", [result.insertId]);
      return rows.length > 0 ? formatNotification(rows[0]) : null;
    } catch (error) {
      console.error("Notification.create error:", error);
      throw error;
    }
  },

  // Find notifications with filter and return a chainable object
  find: (filter = {}) => {
    return {
      sort: async (sortConfig = {}) => {
        try {
          let query = "SELECT * FROM notifications WHERE 1=1";
          let values = [];

          // Apply filters
          if (filter.recipient !== undefined) {
            query += " AND recipient = ?";
            values.push(filter.recipient);
          }

          // Apply sorting
          const sortKeys = Object.keys(sortConfig);
          if (sortKeys.length > 0) {
            const orderBy = sortKeys.map((key) => {
              const direction = sortConfig[key] === -1 ? "DESC" : "ASC";
              // Map MongoDB field names to MySQL field names
              const mysqlKey = key === "createdAt" ? "created_at" : key;
              return `${mysqlKey} ${direction}`;
            });
            query += ` ORDER BY ${orderBy.join(", ")}`;
          }

          const [rows] = await connection.promise().query(query, values);
          return rows.map(formatNotification);
        } catch (error) {
          console.error("Notification.find error:", error);
          throw error;
        }
      },
    };
  },

  // Find one notification and update it
  findOneAndUpdate: async (filter = {}, update = {}, options = {}) => {
    try {
      let query = "UPDATE notifications SET ";
      const updateValues = [];

      // Build SET clause
      const updateKeys = Object.keys(update);
      if (updateKeys.length > 0) {
        const setClause = updateKeys.map((key) => `${key} = ?`).join(", ");
        query += setClause;
        updateValues.push(...Object.values(update));
      } else {
        return null;
      }

      // Build WHERE clause
      let whereClause = "WHERE 1=1";
      const whereValues = [];

      if (filter._id !== undefined) {
        whereClause += " AND id = ?";
        whereValues.push(filter._id);
      }
      if (filter.recipient !== undefined) {
        whereClause += " AND recipient = ?";
        whereValues.push(filter.recipient);
      }

      query += ` ${whereClause}`;
      const finalValues = [...updateValues, ...whereValues];

      await connection.promise().query(query, finalValues);

      // If new: true, fetch and return the updated document
      if (options.new) {
        // Rebuild filter for SELECT (use id instead of _id)
        const selectFilter = { ...filter };
        if (selectFilter._id !== undefined) {
          selectFilter.id = selectFilter._id;
          delete selectFilter._id;
        }
        return await Notification.findOne(selectFilter);
      }

      return null;
    } catch (error) {
      console.error("Notification.findOneAndUpdate error:", error);
      throw error;
    }
  },

  // Find one notification
  findOne: async (filter = {}) => {
    try {
      let query = "SELECT * FROM notifications WHERE 1=1";
      let values = [];

      if (filter.recipient !== undefined) {
        query += " AND recipient = ?";
        values.push(filter.recipient);
      }
      if (filter.id !== undefined) {
        query += " AND id = ?";
        values.push(filter.id);
      }
      if (filter._id !== undefined) {
        query += " AND id = ?";
        values.push(filter._id);
      }

      query += " LIMIT 1";

      const [rows] = await connection.promise().query(query, values);
      return rows.length > 0 ? formatNotification(rows[0]) : null;
    } catch (error) {
      console.error("Notification.findOne error:", error);
      throw error;
    }
  },

  // Update many notifications
  updateMany: async (filter = {}, update = {}) => {
    try {
      let query = "UPDATE notifications SET ";
      const updateValues = [];

      // Build SET clause
      const updateKeys = Object.keys(update);
      if (updateKeys.length > 0) {
        const setClause = updateKeys.map((key) => `${key} = ?`).join(", ");
        query += setClause;
        updateValues.push(...Object.values(update));
      } else {
        return { modifiedCount: 0 };
      }

      // Build WHERE clause
      let whereClause = "WHERE 1=1";
      const whereValues = [];

      if (filter.recipient !== undefined) {
        whereClause += " AND recipient = ?";
        whereValues.push(filter.recipient);
      }
      if (filter.read !== undefined) {
        whereClause += " AND read = ?";
        whereValues.push(filter.read ? 1 : 0);
      }

      query += ` ${whereClause}`;
      const finalValues = [...updateValues, ...whereValues];

      const [result] = await connection.promise().query(query, finalValues);
      return { modifiedCount: result.affectedRows };
    } catch (error) {
      console.error("Notification.updateMany error:", error);
      throw error;
    }
  },

  // Find one and delete
  findOneAndDelete: async (filter = {}) => {
    try {
      // First, find the document
      const notification = await Notification.findOne(filter);
      if (!notification) {
        return null;
      }

      // Then delete it
      let query = "DELETE FROM notifications WHERE 1=1";
      let values = [];

      if (filter._id !== undefined) {
        query += " AND id = ?";
        values.push(filter._id);
      }
      if (filter.recipient !== undefined) {
        query += " AND recipient = ?";
        values.push(filter.recipient);
      }

      await connection.promise().query(query, values);

      return notification;
    } catch (error) {
      console.error("Notification.findOneAndDelete error:", error);
      throw error;
    }
  },
};
