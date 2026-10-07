import { Router } from "express";
import {
   initiatePayment,
   verifyPayment,
   webhookPayment,
} from "../controller/index.js";
import { verifyToken } from "../../../middlewares/authMiddleware.js";
import {
   createPaymentValidation,
   handleValidationErrors,
} from "../../../middlewares/validation.js";

const router = Router();

// Initialize payment routes
router.post(
   "/initiate",
   verifyToken,
   createPaymentValidation,
   handleValidationErrors,
   initiatePayment
);

// Verify payment routes
router.get("/verify/:reference", verifyToken, verifyPayment);

// Webhook payment routes
router.post("/webhook", webhookPayment);

export default router;
