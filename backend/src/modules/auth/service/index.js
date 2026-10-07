import { HTTP_STATUS } from "../../../constants/http.js";
import { USER_ROLES, USER_STATUS } from "../../../constants/user.js";
import AppError from "../../../utils/AppError.js";
import emailService from "../../../utils/emailService.js";
import { generateId } from "../../../utils/idGenerator.js";
import JWTUtils from "../../../utils/JWTUtils.js";
import PasswordUtils from "../../../utils/PasswordUtils.js";
import UserModel from "../model/UserModel.js";

export class AuthService {
   // Register user service
   static async registerUser(userData) {
      try {
         const {
            first_name,
            last_name,
            email,
            password,
            phone_number = null,
            role,
         } = userData;

         // Hash password
         const password_hash = await PasswordUtils.hashPassword(
            password,
            process.env.SALT_ROUNDS || 10
         );
         // Generate Object Id
         const id = generateId();

         // Create user
         const user = await UserModel.create({
            id,
            first_name,
            last_name,
            email,
            phone_number,
            password_hash,
            role,
            status: "active",
            is_email_verified: false,
         });

         // Create token for email verification
         const token = JWTUtils.createToken(
            {
               id: user.id,
               email: user.email,
               type: "email_verification",
            },
            {
               expiresIn: "24h",
            }
         );
         // Send verification email
         await emailService.sendVerificationEmail(user.email, token);

         return {
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            phone_number: user.phone_number,
            role: user.role,
         };
      } catch (error) {
         // Re-throw AppError instances, otherwise wrap in AppError
         if (error instanceof AppError) {
            throw error;
         }

         throw new AppError(
            "Registration failed. Please try again.",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }

   // Verify email service
   static async verifyEmail(token) {
      try {
         // Verify the JWT token
         const decoded = JWTUtils.verifyToken(token);

         if (decoded.type !== "email_verification") {
            throw new AppError("Invalid token type", HTTP_STATUS.UNAUTHORIZED);
         }

         // Find user by ID from token
         const user = await UserModel.findById(decoded.id);
         if (!user) {
            throw new AppError("User not found", HTTP_STATUS.NOT_FOUND);
         }

         // Check if email is already verified
         if (user.is_email_verified) {
            throw new AppError(
               "Email is already verified",
               HTTP_STATUS.BAD_REQUEST
            );
         }

         // Update user's email verification status
         await UserModel.updateEmailVerificationStatus(decoded.id, {
            is_email_verified: true,
         });

         // Send welcome email
         await emailService.sendWelcomeEmail(
            user.email,
            `${user.first_name} ${user.last_name}`
         );

         return {
            id: user.id,
            email: user.email,
            is_email_verified: true,
         };
      } catch (error) {
         // Re-throw AppError instances, otherwise create new AppError
         if (error instanceof AppError) {
            throw error;
         }

         throw new AppError(
            "Email verification failed",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }

   // Login user service
   static async loginUser(email, password) {
      try {
         // Validate input
         if (!email || !password) {
            throw new AppError(
               "Email and password are required",
               HTTP_STATUS.BAD_REQUEST
            );
         }

         // Find user by email
         const user = await UserModel.findByEmail(email);
         if (!user) {
            throw new AppError(
               "Invalid email or password",
               HTTP_STATUS.UNAUTHORIZED
            );
         }

         // Check if user is active
         if (user.status !== USER_STATUS.ACTIVE) {
            throw new AppError(
               "Your account has been deactivated. Please contact support.",
               HTTP_STATUS.FORBIDDEN
            );
         }

         // Verify password
         const isPasswordValid = await PasswordUtils.verifyPassword(
            password,
            user.password_hash
         );
         if (!isPasswordValid) {
            throw new AppError(
               "Invalid email or password",
               HTTP_STATUS.UNAUTHORIZED
            );
         }

         // Check if email is verified
         if (!user.is_email_verified) {
            const token = JWTUtils.createToken(
               {
                  id: user.id,
                  email: user.email,
                  type: "email_verification",
               },
               {
                  expiresIn: "24h",
               }
            );

            // sending verification email goes here
            await emailService.sendVerificationEmail(user.email, token);

            throw new AppError(
               "Please check your email and verify before logging in",
               HTTP_STATUS.FORBIDDEN
            );
         }
         const userRefreshToken = await UserModel.findRefreshToken(user.id);

         if (userRefreshToken) {
            await UserModel.deleteRefreshToken(user.id);
         }

         const refresh_token = JWTUtils.createToken(
            {
               id: user.id,
               email: user.email,
               type: "refresh",
            },
            {
               expiresIn: "30d",
            }
         );

         await UserModel.createRefreshToken(user.id, refresh_token);

         // Generate access token using JWTUtils
         const accessToken = JWTUtils.createToken(
            {
               id: user.id,
               email: user.email,
               role: user.role,
               type: "access",
            },
            {
               expiresIn: "15m",
            }
         );

         // Prepare user data for response (exclude sensitive fields)
         const userResponse = {
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            phone_number: user.phone_number,
            role: user.role,
            is_email_verified: user.is_email_verified,
            profile_pic_url: user.profile_pic_url,
            status: user.status,
         };

         return {
            user: userResponse,
            access_token: accessToken,
            refresh_token,
         };
      } catch (error) {
         // Re-throw AppError instances, otherwise wrap in AppError
         if (error instanceof AppError) {
            throw error;
         }

         throw new AppError(
            "Login failed. Please try again.",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }

   // Logout user service
   static async logoutUser(user_id) {
      try {
         // Find user by ID
         const user = await UserModel.findById(user_id);
         if (!user) {
            throw new AppError("User not found", HTTP_STATUS.NOT_FOUND);
         }

         // Delete refresh token
         const result = await UserModel.deleteRefreshToken(user_id);
         if (!result) {
            throw new AppError(
               "Logout failed. Please try again.",
               HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
         }

         return result;
      } catch (error) {
         // Re-throw AppError instances, otherwise wrap in AppError
         if (error instanceof AppError) {
            throw error;
         }

         throw new AppError(
            "Logout failed. Please try again.",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }

   // Refresh token service
   static async refreshToken(refresh_token) {
      try {
         // Verify the JWT token
         const decoded = JWTUtils.verifyToken(refresh_token);

         if (decoded.type !== "refresh") {
            throw new AppError("Invalid token type", HTTP_STATUS.UNAUTHORIZED);
         }

         // Find user by ID from token
         const user = await UserModel.findById(decoded.id);
         if (!user) {
            throw new AppError("User not found", HTTP_STATUS.NOT_FOUND);
         }

         // Check if user is active
         if (user.status !== "active") {
            throw new AppError(
               "Your account has been deactivated. Please contact support.",
               HTTP_STATUS.FORBIDDEN
            );
         }

         const { refresh_token: userRefreshToken } =
            await UserModel.findRefreshToken(decoded.id);
         if (!userRefreshToken) {
            throw new AppError("User not found", HTTP_STATUS.NOT_FOUND);
         }

         if (userRefreshToken !== refresh_token) {
            throw new AppError(
               "Invalid refresh token",
               HTTP_STATUS.UNAUTHORIZED
            );
         }

         // Generate access token using JWTUtils
         const accessToken = JWTUtils.createToken(
            {
               id: user.id,
               email: user.email,
               role: user.role,
               type: "access",
            },
            {
               expiresIn: "15m",
            }
         );

         return {
            access_token: accessToken,
            refresh_token,
         };
      } catch (error) {
         // Re-throw AppError instances, otherwise wrap in AppError
         if (error instanceof AppError) {
            throw error;
         }

         throw new AppError(
            "Refresh token failed. Please try again.",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }

   // Forgot password service
   static async forgotPassword(email) {
      try {
         // Validate email
         if (!email) {
            throw new AppError("Email is required", HTTP_STATUS.BAD_REQUEST);
         }

         // Find user by email
         const user = await UserModel.findByEmail(email);

         // For security reasons, we don't reveal if the email exists or not
         if (!user) {
            return;
         }

         // Check if user is active
         if (user.status !== "active") {
            throw new AppError(
               "Your account has been deactivated. Please contact support.",
               HTTP_STATUS.FORBIDDEN
            );
         }

         // Check if email is verified
         if (!user.is_email_verified) {
            const token = JWTUtils.createToken(
               {
                  userId: user.id,
                  email: user.email,
                  type: "email_verification",
               },
               {
                  expiresIn: "24h",
               }
            );

            // sending verification email goes here
            await emailService.sendVerificationEmail(user.email, token);

            throw new AppError(
               "Please verify your email before resetting password. check your email to verify",
               HTTP_STATUS.FORBIDDEN
            );
         }

         // Generate password reset token using JWTUtils
         const resetToken = JWTUtils.createToken(
            {
               id: user.id,
               email: user.email,
               type: "reset_password",
            },
            {
               expiresIn: "24h",
            }
         );

         // Send password reset email
         await emailService.sendPasswordResetEmail(user.email, resetToken);

         return;
      } catch (error) {
         // Re-throw AppError instances, otherwise wrap in AppError
         if (error instanceof AppError) {
            throw error;
         }

         throw new AppError(
            "Failed to process password reset request",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }

   // Reset password service
   static async resetPassword(token, newPassword) {
      try {
         // Validate inputs
         if (!token) {
            throw new AppError(
               "Reset token is required",
               HTTP_STATUS.BAD_REQUEST
            );
         }

         if (!newPassword) {
            throw new AppError(
               "New password is required",
               HTTP_STATUS.BAD_REQUEST
            );
         }

         // Verify password reset token using JWTUtils
         const decoded = JWTUtils.verifyToken(token);

         if (decoded.type !== "reset_password") {
            throw new AppError("Invalid token type", HTTP_STATUS.UNAUTHORIZED);
         }

         // Find user by ID from token
         const user = await UserModel.findById(decoded.id);
         if (!user) {
            throw new AppError("User not found", HTTP_STATUS.NOT_FOUND);
         }

         // Check if user is active
         if (user.status !== USER_STATUS.ACTIVE) {
            throw new AppError(
               "Your account has been deactivated. Please contact support.",
               HTTP_STATUS.FORBIDDEN
            );
         }

         // Check if user is active
         if (!user.is_email_verified) {
            throw new AppError(
               "Please verify your email before resetting password. check your email to verify",
               HTTP_STATUS.FORBIDDEN
            );
         }

         // Verify that the token email matches user email (extra security)
         if (decoded.email !== user.email) {
            throw new AppError("Invalid reset token", HTTP_STATUS.BAD_REQUEST);
         }

         const isPreviousPassword = await PasswordUtils.verifyPassword(
            newPassword,
            user.password_hash
         );

         if (isPreviousPassword) {
            throw new AppError(
               "The new password must be different from the previous",
               HTTP_STATUS.BAD_REQUEST
            );
         }

         // Hash new password
         const password_hash = await PasswordUtils.hashPassword(
            newPassword,
            process.env.SALT_ROUNDS || 10
         );

         // Update user password
         await UserModel.updateUserPassword(user.id, {
            password_hash,
         });

         // Send password changed confirmation email goes here
         await emailService.sendPasswordChangedEmail(user.email);

         return;
      } catch (error) {
         // Handle specific JWT errors
         if (error.name === "TokenExpiredError") {
            throw new AppError(
               "Password reset token has expired. Please request a new one.",
               HTTP_STATUS.BAD_REQUEST
            );
         }

         if (error.name === "JsonWebTokenError") {
            throw new AppError("Invalid reset token", HTTP_STATUS.BAD_REQUEST);
         }

         // Re-throw AppError instances, otherwise wrap in AppError
         if (error instanceof AppError) {
            throw error;
         }

         throw new AppError(
            "Failed to reset password",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }
}
