import { Router } from "express";
import {
   createBooking,
   getBookingDetails,
   cancelBooking,
   getUserBookings,
   getHotelBookings,
   getAllBookings,
   addReviewToBooking,
} from "../controller/index.js";
import {
   requireHotelOwnership,
   requireRole,
   verifyToken,
} from "../../../middlewares/authMiddleware.js";
import {
   addReviewToBookingValidation,
   createBookingValidation,
   handleValidationErrors,
} from "../../../middlewares/validation.js";
import { USER_ROLES } from "../../../constants/user.js";

const router = Router();

// Create booking
router.post(
   "/",
   verifyToken,
   createBookingValidation,
   handleValidationErrors,
   createBooking
);

// Get all bookings
router.get(
   "/",
   verifyToken,
   requireRole([USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN]),
   getAllBookings
);

// Get booking details
router.get("/:id", verifyToken, getBookingDetails);

// Cancel booking
router.delete("/:id", verifyToken, cancelBooking);

// Get user bookings
router.get("/user/:id", verifyToken, getUserBookings);

// Get hotel bookings
router.get(
   "/hotel/:id",
   verifyToken,
   requireRole([
      USER_ROLES.HOTEL_OWNER,
      USER_ROLES.ADMIN,
      USER_ROLES.SUPER_ADMIN,
   ]),
   requireHotelOwnership([USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN]),
   getHotelBookings
);

// Add review to booking
router.post(
   "/:id/reviews",
   verifyToken,
   addReviewToBookingValidation,
   handleValidationErrors,
   addReviewToBooking
);

export default router;
