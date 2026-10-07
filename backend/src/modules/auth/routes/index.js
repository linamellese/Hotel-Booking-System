import { Router } from "express";
import {
   registerValidation,
   loginValidation,
   resetPassValidation,
   handleValidationErrors,
   refreshTokenValidation,
} from "../../../middlewares/validation.js";
import {
   register,
   verifyEmail,
   loginUser,
   logoutUser,
   forgotPassword,
   resetPassword,
   refreshToken,
} from "../controller/index.js";
import { verifyToken } from "../../../middlewares/authMiddleware.js";

const router = Router();

// Register customer route
router.post("/register", registerValidation, handleValidationErrors, register);

// Verify Email route
router.post("/verify-email", verifyEmail);

// Login user route
router.post("/login", loginValidation, handleValidationErrors, loginUser);

// Logout user route
router.post("/logout", verifyToken, logoutUser);

// Forgot Password route
router.post("/forgot-password", forgotPassword);

// Reset Password route
router.post(
   "/reset-password",
   resetPassValidation,
   handleValidationErrors,
   resetPassword
);

// Refresh Token route
router.post(
   "/refresh-token",
   refreshTokenValidation,
   handleValidationErrors,
   refreshToken
);

export default router;
