import jwt from "jsonwebtoken";
import AppError from "./AppError.js";
import { HTTP_STATUS } from "../constants/http.js";

/**
 * JWT Utility Class
 * Provides methods for creating and verifying JWT tokens
 */
class JWTUtils {
   /**
    * Create a JWT token
    * @param {Object} payload - Token payload
    * @param {Object} options - Token options
    * @returns {string} - JWT token
    */
   static createToken(payload, options = {}) {
      try {
         const {
            expiresIn = process.env.JWT_EXPIRES_IN || "30d",
            secret = process.env.JWT_SECRET,
         } = options;

         // Validate required parameters
         if (!payload) {
            throw new AppError(
               "Payload is required for token creation",
               HTTP_STATUS.BAD_REQUEST
            );
         }

         if (!secret) {
            throw new AppError(
               "JWT secret is not configured",
               HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
         }

         // Create token
         const token = jwt.sign(payload, secret, {
            expiresIn: expiresIn,
            issuer: process.env.JWT_ISSUER || "engda-marefya-api",
            audience: process.env.JWT_AUDIENCE || "engda-marefya-client",
         });

         return token;
      } catch (error) {
         if (error instanceof AppError) {
            throw error;
         }

         throw new AppError(
            "Failed to create authentication token",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }

   /**
    * Verify a JWT token
    * @param {string} token - JWT token to verify
    * @param {Object} options - Verification options
    * @returns {Object} - Decoded token payload
    */
   static verifyToken(token, options = {}) {
      try {
         const { secret = process.env.JWT_SECRET, ignoreExpiration = false } =
            options;

         // Validate token
         if (!token) {
            throw new AppError(
               "Token is required for verification",
               HTTP_STATUS.BAD_REQUEST
            );
         }

         if (!secret) {
            throw new AppError(
               "JWT secret is not configured",
               HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
         }

         // Extract token from Bearer token
         if (token.startsWith("Bearer ")) {
            token = token.slice(7).trim();
         }

         // Verify token
         const decoded = jwt.verify(token, secret, {
            issuer: process.env.JWT_ISSUER || "engda-marefya-api",
            audience: process.env.JWT_AUDIENCE || "engda-marefya-client",
            ignoreExpiration: ignoreExpiration,
         });

         return decoded;
      } catch (error) {
         // Handle specific JWT errors
         if (error.name === "TokenExpiredError") {
            throw new AppError("Token has expired", HTTP_STATUS.UNAUTHORIZED);
         }

         if (error.name === "JsonWebTokenError") {
            throw new AppError("Invalid token", HTTP_STATUS.UNAUTHORIZED);
         }

         if (error.name === "NotBeforeError") {
            throw new AppError("Token not active", HTTP_STATUS.UNAUTHORIZED);
         }

         // Re-throw AppError instances
         if (error instanceof AppError) {
            throw error;
         }

         throw new AppError(
            "Failed to verify authentication token",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }
}

export default JWTUtils;
