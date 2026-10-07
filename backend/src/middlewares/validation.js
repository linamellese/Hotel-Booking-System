import { body, validationResult } from "express-validator";
import { HTTP_STATUS } from "../constants/http.js";
import { ERROR_TEMPLATES } from "../constants/errors.js";
import AppError from "../utils/AppError.js";

// Handle validation errors
export const handleValidationErrors = (req, res, next) => {
   const errors = validationResult(req);
   if (!errors.isEmpty()) {
      throw new AppError(
         ERROR_TEMPLATES[400].message,
         HTTP_STATUS.BAD_REQUEST,
         true,
         errors.array()
      );
   }
   next();
};

// Register validation
export const registerValidation = [
   body("first_name")
      .notEmpty()
      .withMessage("First name is required")
      .isLength({ min: 2, max: 100 })
      .withMessage("First name must be between 2 and 100 characters")
      .matches(/^[A-Za-z\u1200-\u137F]+([ '-][A-Za-z\u1200-\u137F]+)*$/)
      .withMessage("First name contains invalid characters"),

   body("last_name")
      .notEmpty()
      .withMessage("Last name is required")
      .isLength({ min: 2, max: 100 })
      .withMessage("Last name must be between 2 and 100 characters")
      .matches(/^[A-Za-z\u1200-\u137F]+([ '-][A-Za-z\u1200-\u137F]+)*$/)
      .withMessage("Last name contains invalid characters"),

   body("email").isEmail().withMessage("Valid email is required"),

   body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters")
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage(
         "Password must contain at least one lowercase letter, one uppercase letter, and one number"
      ),

   body("phone_number")
      .optional()
      .custom((value) => {
         const ethiopianPhoneRegex = /^(?:\+251|0)?9\d{8}$/;
         if (!ethiopianPhoneRegex.test(value)) {
            throw new Error("Enter a valid Ethiopian phone number");
         }
         return true;
      }),

   body("role")
      .notEmpty()
      .withMessage("Role is required")
      .isIn(["customer", "hotel_owner"])
      .withMessage("Invalid role"),
];

// Create admin validation
export const createAdminValidation = [
   body("first_name")
      .notEmpty()
      .withMessage("First name is required")
      .isLength({ min: 2, max: 100 })
      .withMessage("First name must be between 2 and 100 characters")
      .matches(/^[A-Za-z\u1200-\u137F]+([ '-][A-Za-z\u1200-\u137F]+)*$/)
      .withMessage("First name contains invalid characters"),

   body("last_name")
      .notEmpty()
      .withMessage("Last name is required")
      .isLength({ min: 2, max: 100 })
      .withMessage("Last name must be between 2 and 100 characters")
      .matches(/^[A-Za-z\u1200-\u137F]+([ '-][A-Za-z\u1200-\u137F]+)*$/)
      .withMessage("Last name contains invalid characters"),

   body("email").isEmail().withMessage("Valid email is required"),

   body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters")
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage(
         "Password must contain at least one lowercase letter, one uppercase letter, and one number"
      ),

   body("phone_number").custom((value) => {
      const ethiopianPhoneRegex = /^(?:\+251|0)?9\d{8}$/;
      if (!ethiopianPhoneRegex.test(value)) {
         throw new Error("Enter a valid Ethiopian phone number");
      }
      return true;
   }),

   body("role")
      .notEmpty()
      .withMessage("Role is required")
      .isIn(["customer", "hotel_owner", "admin"])
      .withMessage("Invalid role"),
];

// Update user profile validation all fields are optional but if they are include in the request body they have to validate
export const updateUserProfileValidation = [
   body("first_name")
      .optional()
      .matches(/^[A-Za-z\u1200-\u137F]+([ '-][A-Za-z\u1200-\u137F]+)*$/)
      .withMessage("First name contains invalid characters")
      .notEmpty()
      .withMessage("First name cannot be empty"),

   body("last_name")
      .optional()
      .matches(/^[A-Za-z\u1200-\u137F]+([ '-][A-Za-z\u1200-\u137F]+)*$/)
      .withMessage("Last name contains invalid characters")
      .notEmpty()
      .withMessage("Last name cannot be empty"),

   body("phone_number")
      .optional()
      .custom((value) => {
         const ethiopianPhoneRegex = /^(?:\+251|0)?9\d{8}$/;
         if (!ethiopianPhoneRegex.test(value)) {
            throw new Error("Enter a valid Ethiopian phone number");
         }
         return true;
      }),

   body("profile_pic_url")
      .optional()
      .isString()
      .withMessage("Profile pic url must be a string")
      .notEmpty()
      .withMessage("Profile pic url cannot be empty"),

   body("profile_pic_id")
      .optional()
      .isString()
      .withMessage("Profile pic id must be a string")
      .notEmpty()
      .withMessage("Profile pic id cannot be empty"),
];

// Login validation
export const loginValidation = [
   body("email").isEmail().withMessage("Valid email is required"),

   body("password").notEmpty().withMessage("Password is required"),
];

// Reset password validation
export const resetPassValidation = [
   body("token").notEmpty().withMessage("Reset token is required"),
   body("new_password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters")
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage(
         "Password must contain at least one lowercase letter, one uppercase letter, and one number"
      ),
];

// Create hotel validation
export const createHotelValidation = [
   body("name").notEmpty().withMessage("Hotel name is required"),
   body("location").notEmpty().withMessage("Hotel location is required"),
   body("contact_info").custom((value) => {
      const ethiopianPhoneRegex = /^(?:\+251|0)?9\d{8}$/;
      if (!ethiopianPhoneRegex.test(value)) {
         throw new Error("Enter a valid Ethiopian phone number");
      }
      return true;
   }),
   body("description").notEmpty().withMessage("Hotel description is required"),
   body("latitude").notEmpty().withMessage("Hotel latitude is required"),
   body("longitude").notEmpty().withMessage("Hotel longitude is required"),
   body("business_license")
      .notEmpty()
      .withMessage("Hotel business license is required"),
   body("business_license_public_id")
      .notEmpty()
      .withMessage("Hotel business license is required"),
   body("profile_pic_url")
      .notEmpty()
      .withMessage("Hotel profile pic url is required"),
   body("profile_pic_public_id")
      .notEmpty()
      .withMessage("Hotel profile pic public id is required"),
];

// Update hotel validation
export const updateHotelValidation = [
   body("name")
      .isString()
      .notEmpty()
      .optional()
      .withMessage("Hotel name is required"),

   body("location")
      .isString()
      .notEmpty()
      .optional()
      .withMessage("Hotel location is required"),

   body("latitude").notEmpty().withMessage("Hotel latitude is required"),

   body("longitude").notEmpty().withMessage("Hotel longitude is required"),

   body("contact_info")
      .optional()
      .custom((value) => {
         const ethiopianPhoneRegex = /^(?:\+251|0)?9\d{8}$/;
         if (!ethiopianPhoneRegex.test(value)) {
            throw new Error("Enter a valid Ethiopian phone number");
         }
         return true;
      }),

   body("description")
      .isString()
      .notEmpty()
      .optional()
      .withMessage("Hotel description is required"),

   body("business_license")
      .isString()
      .notEmpty()
      .optional()
      .withMessage("Hotel business license is required"),

   body("business_license_public_id")
      .isString()
      .notEmpty()
      .optional()
      .withMessage("Hotel business license is required"),

   body("profile_pic")
      .isString()
      .notEmpty()
      .optional()
      .withMessage("Hotel profile pic is required"),

   body("profile_pic_public_id")
      .isString()
      .notEmpty()
      .optional()
      .withMessage("Hotel profile pic public id is required"),
];

// Create room type validation
export const createRoomTypeValidation = [
   body("name").notEmpty().withMessage("Room type name is required"),
   body("description")
      .notEmpty()
      .withMessage("Room type description is required"),
   body("price_per_night")
      .notEmpty()
      .withMessage("Price per night is required"),
   body("main_image_url").notEmpty().withMessage("Main image url is required"),
   body("main_image_public_id")
      .optional()
      .isString()
      .notEmpty()
      .withMessage("Main image public id is required"),
   body("bed_type").notEmpty().withMessage("Bed type is required"),
   body("number_of_beds").notEmpty().withMessage("Number of beds is required"),
];

// Update room type validation
export const updateRoomTypeValidation = [
   body("name")
      .optional()
      .isString()
      .notEmpty()
      .withMessage("Room type name is required"),

   body("description")
      .optional()
      .isString()
      .notEmpty()
      .withMessage("Room type description is required"),

   body("price_per_night")
      .optional()
      .isNumeric()
      .withMessage("Price per night must be a number")
      .notEmpty()
      .withMessage("Price per night is required"),

   body("main_image_url")
      .optional()
      .isString()
      .notEmpty()
      .withMessage("Main image url is required"),

   body("main_image_public_id")
      .optional()
      .isString()
      .notEmpty()
      .withMessage("Main image public id is required"),

   body("bed_type")
      .optional()
      .isString()
      .withMessage("Bed type must be a string")
      .notEmpty()
      .withMessage("Bed type is required"),

   body("number_of_beds")
      .optional()
      .isNumeric()
      .withMessage("Number of beds must be a number")
      .notEmpty()
      .withMessage("Number of beds is required"),

   body("status")
      .optional()
      .isString()
      .notEmpty()
      .withMessage("Status is required"),
];

// Add amenities to a room type validation
export const addRoomTypeAmenitiesValidation = [
   body("amenities").notEmpty().withMessage("Amenity ids are required"),
];

// Add rooms to a room type validation
export const addRoomTypeRoomsValidation = [
   body("room_numbers").notEmpty().withMessage("Room numbers are required"),
];

// Add room type images validation
export const addRoomTypeImagesValidation = [
   body("image_url").notEmpty().withMessage("Image urls are required"),
   body("image_public_id")
      .notEmpty()
      .withMessage("Image public ids are required"),
];

// Update room type room status validation
export const updateRoomTypeRoomStatusValidation = [
   body("status").notEmpty().withMessage("Status is required"),
];

// Update user status validation
export const updateUserStatusValidation = [
   body("status").notEmpty().withMessage("Status is required"),
];

// Update amenity validation all fields are optional but one field is required to update
export const updateAmenityValidation = [
   body("name")
      .optional()
      .isString()
      .withMessage("Name must be a string")
      .notEmpty()
      .withMessage("Name is required"),

   body("icon_url")
      .optional()
      .isString()
      .withMessage("Icon url must be a string")
      .notEmpty()
      .withMessage("Icon url is required"),

   body("icon_public_id")
      .optional()
      .isString()
      .withMessage("Icon public id must be a string")
      .notEmpty()
      .withMessage("Icon public id is required"),
];

// Create booking validation
export const createBookingValidation = [
   body("room_id").notEmpty().withMessage("Room id is required"),
   body("check_in").notEmpty().withMessage("Check in date is required"),
   body("check_out").notEmpty().withMessage("Check out date is required"),
];

// Create payment validation
export const createPaymentValidation = [
   body("booking_id").notEmpty().withMessage("Booking id is required"),
];

// Refresh token validation
export const refreshTokenValidation = [
   body("refresh_token").notEmpty().withMessage("Refresh token is required"),
];

// Add review to booking validation
export const addReviewToBookingValidation = [
   body("rating")
      .notEmpty()
      .withMessage("Rating is required")
      .isInt({ min: 1, max: 5 }),
   body("comment").isString().notEmpty().withMessage("Comment is required"),
];

// Add bank details validation
export const addBankDetailsValidation = [
   body("bank_name").notEmpty().withMessage("Bank name is required"),
   body("account_number").notEmpty().withMessage("Account number is required"),
   body("account_holder_name")
      .notEmpty()
      .withMessage("Account holder name is required"),
];

// Update user role validation
export const updateUserRoleValidation = [
   body("role")
      .notEmpty()
      .withMessage("Role is required")
      .isIn(["customer", "hotel_owner", "admin"])
      .withMessage("Invalid role"),
];

// Update hotel status validation
export const updateHotelStatusValidation = [
   body("status")
      .notEmpty()
      .withMessage("Status is required")
      .isIn(["pending", "approved", "rejected"])
      .withMessage("Invalid status (pending, approved, rejected)"),
];

// Create bed type validation
export const createBedTypeValidation = [
   body("name").notEmpty().withMessage("Bed type name is required"),
];

// Update bed type validation
export const updateBedTypeValidation = [
   body("name").notEmpty().withMessage("Bed type name is required"),
];
