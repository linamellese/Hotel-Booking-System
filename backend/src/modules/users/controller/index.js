import { HTTP_STATUS } from "../../../constants/http.js";
import AppError from "../../../utils/AppError.js";
import { successResponse } from "../../../utils/responseFormatter.js";
import { UserService } from "../service/index.js";

// Get user profile controller
export const getUserProfile = async (req, res, next) => {
   try {
      const id = req.params?.id;
      if (!id) {
         throw new AppError("User id is required", HTTP_STATUS.BAD_REQUEST);
      }

      const data = await UserService.getUserProfile(id);

      return successResponse(res, {
         message: "Success",
         data,
         statusCode: HTTP_STATUS.OK,
      });
   } catch (error) {
      next(error);
   }
};

// Update user profile controller
export const updateUserProfile = async (req, res, next) => {
   try {
      const id = req.params?.id;
      const userData = req.body;

      if (!id) {
         throw new AppError("User id is required", HTTP_STATUS.BAD_REQUEST);
      }

      const data = await UserService.updateUserProfile(id, userData);

      return successResponse(res, {
         message: "User profile updated successfully",
         data,
         statusCode: HTTP_STATUS.OK,
      });
   } catch (error) {
      next(error);
   }
};
