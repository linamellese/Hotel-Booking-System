import { HTTP_STATUS } from "../../../constants/http.js";
import AppError from "../../../utils/AppError.js";
import { generateId } from "../../../utils/idGenerator.js";
import PasswordUtils from "../../../utils/PasswordUtils.js";
import UserModel from "../../auth/model/UserModel.js";
import InstallModel from "../model/InstallModel.js";

export class InstallService {
   // install database service
   static async installDb() {
      try {
         const isInstalled = await InstallModel.installDb();

         return isInstalled;
      } catch (error) {
         // Re-throw AppError instances, otherwise wrap in AppError
         if (error instanceof AppError) {
            throw error;
         }

         throw new AppError(
            "Failed to install database. Please try again.",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }

   // get user profile service
   static async createSuperAdmin(first_name, last_name, email, password) {
      try {
         const id = generateId();
         const password_hash = await PasswordUtils.hashPassword(
            password,
            process.env.SALT_ROUNDS || 10
         );
         const user = await UserModel.create({
            id,
            first_name,
            last_name,
            email,
            password_hash,
            role: "super_admin",
            status: "active",
            is_email_verified: true,
         });
         if (!user) {
            throw new AppError("User not found", HTTP_STATUS.NOT_FOUND);
         }

         return {
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            role: user.role,
            status: user.status,
            is_email_verified: user.is_email_verified,
            created_at: user.created_at,
            updated_at: user.updated_at,
         };
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

   //    check if system is installed
   static async isInstalled() {
      try {
         const isInstalled = await UserModel.isSuperAdminExists();

         return isInstalled;
      } catch (error) {
         // Re-throw AppError instances, otherwise wrap in AppError
         if (error instanceof AppError) {
            throw error;
         }

         throw new AppError(
            "Failed to check if system is installed. Please try again.",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }
}
