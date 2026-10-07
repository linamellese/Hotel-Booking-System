import { HTTP_STATUS } from "../../../constants/http.js";
import { USER_ROLES } from "../../../constants/user.js";
import AppError from "../../../utils/AppError.js";
import { successResponse } from "../../../utils/responseFormatter.js";
import { AuthService } from "../service/index.js";

// Register customer controller
export const register = async (req, res, next) => {
   try {
      const { first_name, last_name, email, password, phone_number, role } =
         req.body;
      if (![USER_ROLES.CUSTOMER, USER_ROLES.HOTEL_OWNER].includes(role)) {
         throw new AppError("Invalid role", HTTP_STATUS.BAD_REQUEST);
      }

      const data = await AuthService.registerUser({
         first_name,
         last_name,
         email,
         password,
         phone_number,
         role,
      });

      return successResponse(res, {
         message: "User created successfully. Verification email sent.",
         data: { user: data },
         statusCode: HTTP_STATUS.CREATED,
      });
   } catch (error) {
      next(error);
   }
};

// Verify Email controller
export const verifyEmail = async (req, res, next) => {
   try {
      const { token } = req?.body;

      if (!token) {
         throw new AppError(
            "Verification token is required",
            HTTP_STATUS.BAD_REQUEST
         );
      }

      await AuthService.verifyEmail(token);

      return successResponse(res, {
         message: "Email verified successfully",
         statusCode: HTTP_STATUS.OK,
      });
   } catch (error) {
      next(error);
   }
};

// Login user controller
export const loginUser = async (req, res, next) => {
   try {
      const { email, password } = req.body;

      const result = await AuthService.loginUser(email, password);

      return successResponse(res, {
         message: "User login successful",
         data: result,
         statusCode: HTTP_STATUS.OK,
      });
   } catch (error) {
      next(error);
   }
};

// Logout user controller
export const logoutUser = async (req, res, next) => {
   try {
      const user_id = req?.user?.id;
      if (!user_id) {
         throw new AppError(
            "Authentication required",
            HTTP_STATUS.UNAUTHORIZED
         );
      }

      const result = await AuthService.logoutUser(user_id);

      return successResponse(res, {
         message: "User logout successful",
         data: result,
         statusCode: HTTP_STATUS.OK,
      });
   } catch (error) {
      next(error);
   }
};

// Refresh Token controller
export const refreshToken = async (req, res, next) => {
   try {
      const { refresh_token } = req.body;

      const result = await AuthService.refreshToken(refresh_token);

      return successResponse(res, {
         message: "Refresh token successful",
         data: result,
         statusCode: HTTP_STATUS.OK,
      });
   } catch (error) {
      next(error);
   }
};

// Forgot Password controller
export const forgotPassword = async (req, res, next) => {
   try {
      const { email } = req.body;

      if (!email) {
         throw new AppError("Email is required", HTTP_STATUS.BAD_REQUEST);
      }

      await AuthService.forgotPassword(email);

      return successResponse(res, {
         message: "Password reset email sent",
         statusCode: HTTP_STATUS.OK,
      });
   } catch (error) {
      next(error);
   }
};

// Reset Password controller
export const resetPassword = async (req, res, next) => {
   try {
      const token = req?.body?.token;
      const new_password = req?.body?.new_password;

      await AuthService.resetPassword(token, new_password);

      return successResponse(res, {
         message: "Password reset successfully",
         statusCode: HTTP_STATUS.OK,
      });
   } catch (error) {
      next(error);
   }
};
