import { HTTP_STATUS } from "../constants/http.js";
import AppError from "../utils/AppError.js";
import JWTUtils from "../utils/JWTUtils.js";

// Verify JWT token middleware
export const verifyToken = (req, res, next) => {
   try {
      const token = req.headers.authorization;
      if (!token) {
         throw new AppError(
            "Authentication required",
            HTTP_STATUS.UNAUTHORIZED
         );
      }

      const decoded = JWTUtils.verifyToken(token);
      req.user = decoded;
      next();
   } catch (error) {
      if (error instanceof AppError) {
         return next(error);
      }

      return next(
         new AppError("Authentication required", HTTP_STATUS.UNAUTHORIZED)
      );
   }
};

// Require role middleware
export const requireRole = (allowedRoles) => {
   return (req, res, next) => {
      try {
         if (!req.user) {
            throw new AppError(
               "Authentication required",
               HTTP_STATUS.UNAUTHORIZED
            );
         }

         const userRole = req.user.role;
         const roles = Array.isArray(allowedRoles)
            ? allowedRoles
            : [allowedRoles];

         if (!roles.includes(userRole)) {
            throw new AppError("Permission denied", HTTP_STATUS.FORBIDDEN);
         }

         next();
      } catch (error) {
         next(error);
      }
   };
};

// Require ownership middleware
export const requireHotelOwnership = (allowedRoles) => {
   return async (req, res, next) => {
      try {
         if (!req.user) {
            throw new AppError(
               "Authentication required",
               HTTP_STATUS.UNAUTHORIZED
            );
         }

         const { id } = req.params;
         const userId = req.user.id;
         const userRole = req.user.role;

         if (!id) {
            throw new AppError("Missing id parameter", HTTP_STATUS.BAD_REQUEST);
         }

         // Admin can access any hotel
         if (allowedRoles.includes(userRole)) {
            return next();
         }

         // Get hotel service
         const hotelService = req.app.get("hotelService");

         if (!hotelService) {
            throw new AppError(
               "HotelService not found",
               HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
         }

         // Get hotel with owner information
         const hotel = await hotelService.getHotelById(id);

         if (!hotel) {
            throw new AppError("Hotel not found", HTTP_STATUS.NOT_FOUND);
         }

         // Check if user owns the hotel
         if (hotel.owner.id !== userId) {
            throw new AppError(
               "You can only manage your own hotels",
               HTTP_STATUS.FORBIDDEN
            );
         }

         // Attach hotel to request for use in controllers
         req.hotel = hotel;

         next();
      } catch (error) {
         next(error);
      }
   };
};

// Require ownership middleware
export const requireRoomTypeOwnership = (allowedRoles) => {
   return async (req, res, next) => {
      try {
         if (!req.user) {
            throw new AppError(
               "Authentication required",
               HTTP_STATUS.UNAUTHORIZED
            );
         }

         const { id } = req.params;
         const userId = req.user.id;
         const userRole = req.user.role;

         if (!id) {
            throw new AppError("Missing id parameter", HTTP_STATUS.BAD_REQUEST);
         }

         // Admin can access any room type
         if (allowedRoles.includes(userRole)) {
            return next();
         }

         // Get hotel service
         const hotelService = req.app.get("hotelService");

         if (!hotelService) {
            throw new AppError(
               "HotelService not found",
               HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
         }

         // Get hotel with owner information
         const roomType = await hotelService.getRoomTypeById(id);
         const { hotels } = await hotelService.getHotelsByOwnerId(userId);

         if (!roomType) {
            throw new AppError("Room type not found", HTTP_STATUS.NOT_FOUND);
         }
         if (!hotels) {
            throw new AppError("Hotels not found", HTTP_STATUS.NOT_FOUND);
         }

         // Check if user owns the room type
         if (!hotels.some((hotel) => hotel.id === roomType?.hotel?.id)) {
            throw new AppError(
               "You can only manage your own hotels room types",
               HTTP_STATUS.FORBIDDEN
            );
         }

         // Attach room type to request for use in controllers
         req.roomType = roomType;

         next();
      } catch (error) {
         next(error);
      }
   };
};

// Require ownership middleware
export const requireUserOwnership = (allowedRoles) => {
   return async (req, res, next) => {
      try {
         if (!req.user) {
            throw new AppError(
               "Authentication required",
               HTTP_STATUS.UNAUTHORIZED
            );
         }

         const { id } = req.params;
         const user_id = req.user.id;
         const userRole = req.user.role;

         if (!id) {
            throw new AppError("Missing id parameter", HTTP_STATUS.BAD_REQUEST);
         }

         // Admin can access any user
         if (allowedRoles.includes(userRole)) {
            return next();
         }

         // Get user service
         const userService = req.app.get("userService");

         if (!userService) {
            throw new AppError(
               "UserService not found",
               HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
         }

         // Get user with owner information
         const user = await userService.getUserProfile(id);

         if (!user) {
            throw new AppError("User not found", HTTP_STATUS.NOT_FOUND);
         }

         // Check if user owns the hotel
         if (user.id !== user_id) {
            throw new AppError(
               "You can only manage your own profile",
               HTTP_STATUS.FORBIDDEN
            );
         }

         next();
      } catch (error) {
         next(error);
      }
   };
};
