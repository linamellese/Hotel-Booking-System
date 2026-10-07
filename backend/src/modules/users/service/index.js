import cloudinary from "../../../config/cloudinary.js";
import { HTTP_STATUS } from "../../../constants/http.js";
import AppError from "../../../utils/AppError.js";
import UserModel from "../../auth/model/UserModel.js";

export class UserService {
   // get user profile service
   static async getUserProfile(id) {
      try {
         const user = await UserModel.findById(id);
         if (!user) {
            throw new AppError("User not found", HTTP_STATUS.NOT_FOUND);
         }

         return {
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            phone_number: user.phone_number,
            profile_pic_url: user.profile_pic_url,
            profile_pic_public_id: user.profile_pic_public_id,
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
            "Failed to fetch user profile. Please try again.",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }

   // update user profile service
   static async updateUserProfile(id, userData) {
      try {
         const user = await UserModel.findById(id);
         if (!user) {
            throw new AppError("User not found", HTTP_STATUS.NOT_FOUND);
         }
         // if update user profile pic url
         if (userData?.profile_pic_url) {
            // delete old profile pic from cloudinary
            if (user?.profile_pic_public_id) {
               await cloudinary.uploader.destroy(user?.profile_pic_public_id);
            }
         }
         const updatedUser = await UserModel.updateUserProfile(id, userData);
         if (!updatedUser) {
            throw new AppError(
               "Failed to update user profile",
               HTTP_STATUS.BAD_REQUEST
            );
         }

         return updatedUser;
      } catch (error) {
         // Re-throw AppError instances, otherwise wrap in AppError
         if (error instanceof AppError) {
            throw error;
         }

         throw new AppError(
            "Failed to update user profile. Please try again.",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }
}
