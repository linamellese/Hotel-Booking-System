import pool from "../../../config/db.js";
import { HTTP_STATUS } from "../../../constants/http.js";
import AppError from "../../../utils/AppError.js";

class EmailLogModel {
   /**
    * Create a new email log
    */
   static async create(emailLogData) {
      const {
         id,
         to_email,
         subject,
         body,
         email_type = "other",
         status = "pending",
      } = emailLogData;

      const query = `
      INSERT INTO email_logs (id, to_email, subject, body, email_type, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

      const values = [id, to_email, subject, body, email_type, status];

      try {
         const [result] = await pool.execute(query, values);

         if (result.affectedRows === 0) {
            throw new AppError(
               "Failed to create email log",
               HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
         }

         return { id, ...emailLogData };
      } catch (error) {
         // Handle MySQL duplicate entry errors
         if (error.code === "ER_DUP_ENTRY") {
            throw new AppError(
               "Email log with this ID already exists",
               HTTP_STATUS.CONFLICT
            );
         }

         // Re-throw AppError, otherwise wrap
         if (error instanceof AppError) {
            throw error;
         }

         throw new AppError(
            "Failed to create email log",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }

   /**
    * Update email log status
    */
   static async updateStatus(id, status) {
      const query =
         "UPDATE email_logs SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?";

      try {
         const [result] = await pool.execute(query, [status, id]);

         if (result.affectedRows === 0) {
            throw new AppError("Email log not found", HTTP_STATUS.NOT_FOUND);
         }

         return true;
      } catch (error) {
         // Re-throw AppError, otherwise wrap
         if (error instanceof AppError) {
            throw error;
         }

         throw new AppError(
            "Failed to update email log status",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }

   /**
    * Find email log by ID
    */
   static async findById(id) {
      const query = "SELECT * FROM email_logs WHERE id = ?";

      try {
         const [rows] = await pool.execute(query, [id]);

         if (!rows[0]) {
            throw new AppError("Email log not found", HTTP_STATUS.NOT_FOUND);
         }

         return rows[0];
      } catch (error) {
         // Re-throw AppError, otherwise wrap
         if (error instanceof AppError) {
            throw error;
         }

         throw new AppError(
            "Failed to find email log",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }

   /**
    * Find email logs by type
    */
   static async findByType(emailType, limit = 50, offset = 0) {
      const query =
         "SELECT * FROM email_logs WHERE email_type = ? ORDER BY created_at DESC LIMIT ? OFFSET ?";

      try {
         const [rows] = await pool.execute(query, [emailType, limit, offset]);
         return rows;
      } catch (error) {
         throw new AppError(
            "Failed to fetch email logs by type",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }

   /**
    * Find email logs by status
    */
   static async findByStatus(status, limit = 50, offset = 0) {
      const query =
         "SELECT * FROM email_logs WHERE status = ? ORDER BY created_at DESC LIMIT ? OFFSET ?";

      try {
         const [rows] = await pool.execute(query, [status, limit, offset]);
         return rows;
      } catch (error) {
         throw new AppError(
            "Failed to fetch email logs by status",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }

   /**
    * Delete old email logs (for cleanup)
    */
   static async deleteOldLogs(days = 90) {
      const query =
         "DELETE FROM email_logs WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)";

      try {
         const [result] = await pool.execute(query, [days]);
         return result.affectedRows;
      } catch (error) {
         throw new AppError(
            "Failed to delete old email logs",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }
}

export default EmailLogModel;
