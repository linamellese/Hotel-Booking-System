import { Router } from "express";
import {
   createHotel,
   updateHotel,
   createRoomType,
   addRoomTypeAmenities,
   addRoomTypeRooms,
   addRoomTypeImages,
   getHotelById,
   getAmenities,
   getRoomTypesById,
   updateRoomType,
   getHotelsByOwnerId,
   updateRoomTypeRoomStatus,
   deleteRoomTypeImage,
   getAllHotels,
   getAllRoomTypes,
   getAvailableRooms,
   checkIfRoomTypeInWishlist,
   toggleWishlist,
   getRoomTypeReviews,
   getUserWishlist,
   addBankDetails,
   getMyHotels,
   getAllRoomTypesByHotelId,
   getRoomTypeImages,
   getRoomTypeRooms,
   getRoomTypeAmenities,
   deleteRoomTypeAmenities,
   deleteRoomTypeRoom,
   updateBankDetails,
   getHotelAnalytics,
   updateHotelStatus,
   getBedTypes,
   getHotelsLocation,
} from "../controller/index.js";
import {
   verifyToken,
   requireRole,
   requireUserOwnership,
   requireHotelOwnership,
   requireRoomTypeOwnership,
} from "../../../middlewares/authMiddleware.js";
import {
   addRoomTypeAmenitiesValidation,
   addRoomTypeImagesValidation,
   addRoomTypeRoomsValidation,
   createHotelValidation,
   createRoomTypeValidation,
   handleValidationErrors,
   updateHotelValidation,
   updateRoomTypeRoomStatusValidation,
   updateRoomTypeValidation,
   addBankDetailsValidation,
   updateHotelStatusValidation,
} from "../../../middlewares/validation.js";
import { USER_ROLES } from "../../../constants/user.js";

const router = Router();

// Get hotel location for search suggestions
router.get("/location", getHotelsLocation);

// Get hotel analytics
router.get(
   "/:id/analytics",
   verifyToken,
   requireRole([
      USER_ROLES.HOTEL_OWNER,
      USER_ROLES.ADMIN,
      USER_ROLES.SUPER_ADMIN,
   ]),
   getHotelAnalytics
);

// Get hotels by owner id
router.get(
   "/me",
   verifyToken,
   requireRole([
      USER_ROLES.HOTEL_OWNER,
      USER_ROLES.ADMIN,
      USER_ROLES.SUPER_ADMIN,
   ]),
   getMyHotels
);

// Get all hotels with pagination and search
router.get("/", getAllHotels);

// Get amenities
router.get(
   "/amenities",
   verifyToken,
   requireRole([
      USER_ROLES.HOTEL_OWNER,
      USER_ROLES.ADMIN,
      USER_ROLES.SUPER_ADMIN,
   ]),
   getAmenities
);

// Get bed types
router.get(
   "/bed-types",
   verifyToken,
   requireRole([
      USER_ROLES.HOTEL_OWNER,
      USER_ROLES.ADMIN,
      USER_ROLES.SUPER_ADMIN,
   ]),
   getBedTypes
);

// Get room types with filter, pagination and search
router.get("/room-types", getAllRoomTypes);

// Create a new hotel route
router.post(
   "/",
   verifyToken,
   requireRole([USER_ROLES.HOTEL_OWNER]),
   createHotelValidation,
   handleValidationErrors,
   createHotel
);

// Update hotel status
router.put(
   "/:id/status",
   verifyToken,
   requireRole([USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN]),
   updateHotelStatusValidation,
   handleValidationErrors,
   updateHotelStatus
);

// Add Bank details
router.post(
   "/:id/bank-details",
   verifyToken,
   requireRole([USER_ROLES.HOTEL_OWNER]),
   requireHotelOwnership([USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN]),
   addBankDetailsValidation,
   handleValidationErrors,
   addBankDetails
);

// Update bank details
router.put(
   "/:id/bank-details",
   verifyToken,
   requireRole([USER_ROLES.HOTEL_OWNER]),
   requireHotelOwnership([USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN]),
   addBankDetailsValidation,
   handleValidationErrors,
   updateBankDetails
);

// Update hotel info
router.put(
   "/:id",
   verifyToken,
   requireRole([USER_ROLES.HOTEL_OWNER]),
   requireHotelOwnership([USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN]),
   updateHotelValidation,
   handleValidationErrors,
   updateHotel
);

// Get hotel by id
router.get("/:id", getHotelById);

// Get hotel by owner id
router.get(
   "/owner/:id",
   verifyToken,
   requireUserOwnership([USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN]),
   getHotelsByOwnerId
);

// Create a new room type for a hotel
router.post(
   "/:id/room-types",
   verifyToken,
   requireRole([USER_ROLES.HOTEL_OWNER]),
   requireHotelOwnership([USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN]),
   createRoomTypeValidation,
   handleValidationErrors,
   createRoomType
);

// Get room types by hotel id
router.get(
   "/:id/room-types",
   verifyToken,
   requireRole([USER_ROLES.HOTEL_OWNER]),
   requireHotelOwnership([USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN]),
   getAllRoomTypesByHotelId
);

// Update room type
router.put(
   "/room-types/:id",
   verifyToken,
   requireRole([USER_ROLES.HOTEL_OWNER]),
   requireRoomTypeOwnership([USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN]),
   updateRoomTypeValidation,
   handleValidationErrors,
   updateRoomType
);

// Get room type details
router.get("/room-types/:id", getRoomTypesById);

// Get available rooms for a room type
router.get("/room-types/:id/available-rooms", getAvailableRooms);

// Add or remove room type to wishlist
router.post("/room-types/:id/wishlist", verifyToken, toggleWishlist);

// Is room type in wishlist
router.get("/room-types/:id/wishlist", verifyToken, checkIfRoomTypeInWishlist);

// Get user wishlist
router.get("/user/wishlist", verifyToken, getUserWishlist);

// Get reviews for a room type
router.get("/room-types/:id/reviews", getRoomTypeReviews);

// Add amenities to a room type
router.post(
   "/room-types/:id/amenities",
   verifyToken,
   requireRole([USER_ROLES.HOTEL_OWNER]),
   requireRoomTypeOwnership([USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN]),
   addRoomTypeAmenitiesValidation,
   handleValidationErrors,
   addRoomTypeAmenities
);

// Get room type amenities
router.get("/room-types/:id/amenities", getRoomTypeAmenities);

// Delete room type amenities
router.delete(
   "/room-types/:id/amenities/:amenityId",
   verifyToken,
   requireRole([USER_ROLES.HOTEL_OWNER]),
   requireRoomTypeOwnership([USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN]),
   deleteRoomTypeAmenities
);

// Add rooms for a room type
router.post(
   "/room-types/:id/rooms",
   verifyToken,
   requireRole([USER_ROLES.HOTEL_OWNER]),
   requireRoomTypeOwnership([USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN]),
   addRoomTypeRoomsValidation,
   handleValidationErrors,
   addRoomTypeRooms
);

// Get all rooms for a room type
router.get("/room-types/:id/rooms", getRoomTypeRooms);

// Add room type images
router.post(
   "/room-types/:id/images",
   verifyToken,
   requireRole([USER_ROLES.HOTEL_OWNER]),
   requireRoomTypeOwnership([USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN]),
   addRoomTypeImagesValidation,
   handleValidationErrors,
   addRoomTypeImages
);

// Get all room types images
router.get("/room-types/:id/images", getRoomTypeImages);

// Update rooms status
router.put(
   "/room-types/:id/rooms/:roomId",
   verifyToken,
   requireRole([USER_ROLES.HOTEL_OWNER]),
   requireRoomTypeOwnership([USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN]),
   updateRoomTypeRoomStatusValidation,
   handleValidationErrors,
   updateRoomTypeRoomStatus
);

// Delete room of the room type
router.delete(
   "/room-types/:id/rooms/:roomId",
   verifyToken,
   requireRole([USER_ROLES.HOTEL_OWNER]),
   requireRoomTypeOwnership([USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN]),
   deleteRoomTypeRoom
);

// Delete image from a room type
router.delete(
   "/room-types/:id/images/:imageId",
   verifyToken,
   requireRole([USER_ROLES.HOTEL_OWNER]),
   requireRoomTypeOwnership([USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN]),
   deleteRoomTypeImage
);

export default router;
