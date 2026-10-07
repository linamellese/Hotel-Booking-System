import pool from "../../../config/db.js";
import { HTTP_STATUS } from "../../../constants/http.js";
import AppError from "../../../utils/AppError.js";

class UserModel {
   // Create a new user
   static async create(userData) {
      const {
         id,
         first_name,
         last_name,
         email,
         phone_number = null,
         password_hash,
         profile_pic_url = null,
         profile_pic_public_id = null,
         role = "customer",
         status = "active",
         is_email_verified = false,
      } = userData;

      const query = `
      INSERT INTO users (id, first_name, last_name, email, phone_number, password_hash, profile_pic_url, profile_pic_public_id, role, status, is_email_verified)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

      const values = [
         id,
         first_name,
         last_name,
         email,
         phone_number,
         password_hash,
         profile_pic_url,
         profile_pic_public_id,
         role,
         status,
         is_email_verified,
      ];

      try {
         const [result] = await pool.execute(query, values);
         if (result.affectedRows === 0) {
            return null;
         }

         return { id, ...userData };
      } catch (error) {
         if (error.code === "ER_DUP_ENTRY") {
            if (error.message.includes("email")) {
               throw new AppError(
                  "User already exists with this email",
                  HTTP_STATUS.BAD_REQUEST
               );
            } else if (error.message.includes("phone_number")) {
               throw new AppError(
                  "User already exists with this phone number",
                  HTTP_STATUS.BAD_REQUEST
               );
            }
         }
         throw new AppError(
            "Internal server error",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }

   // Find user by email
   static async findByEmail(email) {
      const query = "SELECT * FROM users WHERE email = ?";

      try {
         const [rows] = await pool.execute(query, [email]);
         return rows[0] || null;
      } catch (error) {
         throw new AppError(
            "Internal server error",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }

   // Find user by phone number
   static async findByPhoneNumber(phoneNumber) {
      const query = "SELECT * FROM users WHERE phone_number = ?";

      try {
         const [rows] = await pool.execute(query, [phoneNumber]);
         return rows[0] || null;
      } catch (error) {
         throw new AppError(
            "Internal server error",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }

   // Find user by ID
   static async findById(id) {
      const query = "SELECT * FROM users WHERE id = ?";

      try {
         const [rows] = await pool.execute(query, [id]);
         return rows[0] || null;
      } catch (error) {
         throw new AppError(
            "Internal server error",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }

   // Create refresh token
   static async createRefreshToken(user_id, refresh_token) {
      const query =
         "INSERT INTO refresh_tokens (user_id, refresh_token) VALUES (?, ?)";

      try {
         const [result] = await pool.execute(query, [user_id, refresh_token]);
         if (result.affectedRows === 0) {
            return null;
         }
         return {
            user_id,
            refresh_token,
         };
      } catch (error) {
         throw new AppError(
            "Internal server error",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }

   // Find user by refresh token
   static async findRefreshToken(user_id) {
      const query =
         "SELECT refresh_token FROM refresh_tokens WHERE user_id = ?";

      try {
         const [rows] = await pool.execute(query, [user_id]);
         return rows[0] || null;
      } catch (error) {
         throw new AppError(
            "Internal server error",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }

   // Delete refresh token
   static async deleteRefreshToken(user_id) {
      const query = "DELETE FROM refresh_tokens WHERE user_id = ?";

      try {
         const [result] = await pool.execute(query, [user_id]);
         if (result.affectedRows === 0) {
            return null;
         }
         return { user_id };
      } catch (error) {
         throw new AppError(
            "Internal server error",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }

   // Update Refresh Token
   static async updateRefreshToken(user_id, refresh_token) {
      const query =
         "UPDATE refresh_tokens SET refresh_token = ? WHERE user_id = ?";

      try {
         const [result] = await pool.execute(query, [refresh_token, user_id]);
         if (result.affectedRows === 0) {
            return null;
         }

         return { user_id, refresh_token };
      } catch (error) {
         throw new AppError(
            "Internal server error",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }

   // find users with filters
   static async getAllUsers(
      { role, status, search },
      isSuperAdmin,
      { page, limit }
   ) {
      const offset = (page - 1) * limit;
      let query = "SELECT * FROM users WHERE 1=1";
      let values = [];

      // Restrict roles if not super admin
      if (!isSuperAdmin) {
         query += " AND role IN (?, ?)";
         values.push("customer", "hotel_owner");
      }

      // Optional role filter
      if (role) {
         query += " AND role = ?";
         values.push(role);
      }

      // Optional status filter
      if (status) {
         query += " AND status = ?";
         values.push(status);
      }

      // Optional search filter
      if (search) {
         query +=
            " AND (first_name LIKE ? OR last_name LIKE ? OR phone_number LIKE ? OR email LIKE ?)";
         values.push(
            `%${search}%`,
            `%${search}%`,
            `%${search}%`,
            `%${search}%`
         );
      }

      // Apply pagination
      query += ` LIMIT ${Number(limit)} OFFSET ${Number(offset)}`;

      try {
         const [rows] = await pool.execute(query, values);

         return rows;
      } catch (error) {
         throw new AppError(
            "Internal server error",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }

   // Count users with filters
   static async countAllUsers({ role, status, search }, isSuperAdmin) {
      let query = "SELECT COUNT(*) AS count FROM users WHERE 1=1";
      const values = [];

      // Restrict roles if not super admin
      if (!isSuperAdmin) {
         query += " AND role IN (?, ?)";
         values.push("customer", "hotel_owner");
      }

      // Optional role filter
      if (role) {
         query += " AND role = ?";
         values.push(role);
      }

      // Optional status filter
      if (status) {
         query += " AND status = ?";
         values.push(status);
      }

      // Optional search filter
      if (search) {
         query +=
            " AND (first_name LIKE ? OR last_name LIKE ? OR phone_number LIKE ? OR email LIKE ?)";
         values.push(
            `%${search}%`,
            `%${search}%`,
            `%${search}%`,
            `%${search}%`
         );
      }

      try {
         const [rows] = await pool.execute(query, values);

         return rows[0].count;
      } catch (error) {
         console.error(error);
         throw new AppError(
            "Internal server error",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }

   // Update user profile
   static async updateUserProfile(id, updateData) {
      const allowedFields = [
         "first_name",
         "last_name",
         "phone_number",
         "profile_pic_url",
         "profile_pic_public_id",
         "password_hash",
      ];

      const setClause = [];
      const values = [];

      allowedFields.forEach((field) => {
         if (updateData[field] !== undefined) {
            setClause.push(`${field} = ?`);
            values.push(updateData[field]);
         }
      });

      if (setClause.length === 0) {
         throw new AppError(
            "No valid fields to update",
            HTTP_STATUS.BAD_REQUEST
         );
      }

      setClause.push("updated_at = CURRENT_TIMESTAMP");
      values.push(id);

      const query = `UPDATE users SET ${setClause.join(", ")} WHERE id = ?`;

      try {
         const [result] = await pool.execute(query, values);

         if (result.affectedRows === 0) {
            return null;
         }

         // Return updated user data
         return {
            id,
            ...updateData,
         };
      } catch (error) {
         if (error.code === "ER_DUP_ENTRY") {
            if (error.message.includes("phone_number")) {
               throw new AppError(
                  "Phone number already exists",
                  HTTP_STATUS.BAD_REQUEST
               );
            }
         }
         throw new AppError(
            "Internal server error",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }

   // Update user status
   static async updateUserStatus(id, updateData) {
      const allowedFields = ["status"];

      const setClause = [];
      const values = [];

      allowedFields.forEach((field) => {
         if (updateData[field] !== undefined) {
            setClause.push(`${field} = ?`);
            values.push(updateData[field]);
         }
      });

      if (setClause.length === 0) {
         throw new AppError(
            "No valid fields to update",
            HTTP_STATUS.BAD_REQUEST
         );
      }

      setClause.push("updated_at = CURRENT_TIMESTAMP");
      values.push(id);

      const query = `UPDATE users SET ${setClause.join(", ")} WHERE id = ?`;

      try {
         const [result] = await pool.execute(query, values);

         if (result.affectedRows === 0) {
            return null;
         }

         // Return updated user data
         return {
            id,
            ...updateData,
         };
      } catch (error) {
         throw new AppError(
            "Internal server error",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }

   // Update user role
   static async updateUserRole(id, updateData) {
      const allowedFields = ["role"];

      const setClause = [];
      const values = [];

      allowedFields.forEach((field) => {
         if (updateData[field] !== undefined) {
            setClause.push(`${field} = ?`);
            values.push(updateData[field]);
         }
      });

      if (setClause.length === 0) {
         throw new AppError(
            "No valid fields to update",
            HTTP_STATUS.BAD_REQUEST
         );
      }

      setClause.push("updated_at = CURRENT_TIMESTAMP");
      values.push(id);

      const query = `UPDATE users SET ${setClause.join(", ")} WHERE id = ?`;

      try {
         const [result] = await pool.execute(query, values);

         if (result.affectedRows === 0) {
            return null;
         }

         // Return updated user data
         return {
            id,
            ...updateData,
         };
      } catch (error) {
         throw new AppError(
            "Internal server error",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }

   // Update user email verification status
   static async updateEmailVerificationStatus(id, updateData) {
      const allowedFields = ["is_email_verified"];

      const setClause = [];
      const values = [];

      allowedFields.forEach((field) => {
         if (updateData[field] !== undefined) {
            setClause.push(`${field} = ?`);
            values.push(updateData[field]);
         }
      });

      if (setClause.length === 0) {
         throw new AppError(
            "No valid fields to update",
            HTTP_STATUS.BAD_REQUEST
         );
      }

      setClause.push("updated_at = CURRENT_TIMESTAMP");
      values.push(id);

      const query = `UPDATE users SET ${setClause.join(", ")} WHERE id = ?`;

      try {
         const [result] = await pool.execute(query, values);

         if (result.affectedRows === 0) {
            return null;
         }

         // Return updated user data
         return {
            id,
            ...updateData,
         };
      } catch (error) {
         throw new AppError(
            "Internal server error",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }

   // Update user password
   static async updateUserPassword(id, updateData) {
      const allowedFields = ["password_hash"];

      const setClause = [];
      const values = [];

      allowedFields.forEach((field) => {
         if (updateData[field] !== undefined) {
            setClause.push(`${field} = ?`);
            values.push(updateData[field]);
         }
      });

      if (setClause.length === 0) {
         throw new AppError(
            "No valid fields to update",
            HTTP_STATUS.BAD_REQUEST
         );
      }

      setClause.push("updated_at = CURRENT_TIMESTAMP");
      values.push(id);

      const query = `UPDATE users SET ${setClause.join(", ")} WHERE id = ?`;

      try {
         const [result] = await pool.execute(query, values);

         if (result.affectedRows === 0) {
            return null;
         }

         // Return updated user data
         return {
            id,
            ...updateData,
         };
      } catch (error) {
         throw new AppError(
            "Internal server error",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }
   // Remove user
   static async remove(id) {
      const query = "DELETE FROM users WHERE id = ?";

      try {
         const [result] = await pool.execute(query, [id]);

         if (result.affectedRows === 0) {
            return null;
         }

         return { id };
      } catch (error) {
         throw new AppError(
            "Internal server error",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }

   // check if super admin exists
   static async isSuperAdminExists() {
      try {
         const [superAdmin] = await pool.query(
            "SELECT * FROM users WHERE role = 'super_admin'"
         );
         if (superAdmin.length > 0) {
            return true;
         }
         return false;
      } catch (error) {
         // Re-throw AppError instances, otherwise wrap in AppError
         if (error instanceof AppError) {
            throw error;
         }

         throw new AppError(
            "Internal server error",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }
}

export default UserModel;
