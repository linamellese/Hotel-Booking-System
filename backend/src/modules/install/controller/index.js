import { HTTP_STATUS } from "../../../constants/http.js";
import AppError from "../../../utils/AppError.js";
import { successResponse } from "../../../utils/responseFormatter.js";
import { InstallService } from "../service/index.js";

// Get user profile controller
export const installSystem = async (req, res, next) => {
   try {
      const first_name = req?.body?.first_name;
      const last_name = req?.body?.last_name;
      const email = req?.body?.email;
      const password = req?.body?.password;
      if (!first_name || !last_name || !email || !password) {
         throw new AppError("All fields are required", HTTP_STATUS.BAD_REQUEST);
      }

      const installDb = await InstallService.installDb();

      const isInstalled = await InstallService.isInstalled();
      if (isInstalled) {
         throw new AppError(
            "System already installed",
            HTTP_STATUS.BAD_REQUEST
         );
      }

      const superAdmin = await InstallService.createSuperAdmin(
         first_name,
         last_name,
         email,
         password
      );

      return successResponse(res, {
         message: "System installed successfully",
         data: superAdmin,
         statusCode: HTTP_STATUS.OK,
      });
   } catch (error) {
      next(error);
   }
};
