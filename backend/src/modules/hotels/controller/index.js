import { HTTP_STATUS } from "../../../constants/http.js";
import AppError from "../../../utils/AppError.js";
import { successResponse } from "../../../utils/responseFormatter.js";
import { HotelService } from "../service/index.js";

// Create a new hotel
export const createHotel = async (req, res, next) => {
   try {
      const {
         name,
         location,
         latitude,
         longitude,
         contact_info,
         description,
         business_license,
         business_license_public_id,
         profile_pic_url,
         profile_pic_public_id,
      } = req?.body;

      if (
         !name ||
         !location ||
         !latitude ||
         !longitude ||
         !contact_info ||
         !description ||
         !business_license ||
         !profile_pic_url ||
         !business_license_public_id ||
         !profile_pic_public_id
      ) {
         throw new AppError("All fields are required", HTTP_STATUS.BAD_REQUEST);
      }

      const owner_id = req?.user?.id;
      if (!owner_id) {
         throw new AppError("Owner ID is required", HTTP_STATUS.BAD_REQUEST);
      }

      const data = await HotelService.createHotel({
         owner_id,
         name,
         location,
         latitude,
         longitude,
         contact_info,
         description,
         business_license,
         business_license_public_id,
         profile_pic_url,
         profile_pic_public_id,
      });

      return successResponse(res, {
         message: "Hotel created successfully",
         data,
         statusCode: HTTP_STATUS.CREATED,
      });
   } catch (error) {
      next(error);
   }
};

// Update hotel status
export const updateHotelStatus = async (req, res, next) => {
   try {
      const id = req?.params?.id;
      const status = req?.body?.status;
      const rejection_reason = req?.body?.rejection_reason;

      if (!id || !status) {
         throw new AppError(
            "Hotel ID and status are required",
            HTTP_STATUS.BAD_REQUEST
         );
      }

      const data = await HotelService.updateHotelStatus(
         id,
         status,
         rejection_reason
      );

      return successResponse(res, {
         message: "Hotel status updated successfully",
         data,
         statusCode: HTTP_STATUS.OK,
      });
   } catch (error) {
      next(error);
   }
};

// Update a Hotel
export const updateHotel = async (req, res, next) => {
   try {
      const { id } = req.params;
      const updateData = req.body;

      if (Object.keys(updateData).length === 0) {
         throw new AppError("No update data provided", HTTP_STATUS.BAD_REQUEST);
      }

      const data = await HotelService.updateHotel(id, updateData);

      return successResponse(res, {
         message: "Hotel updated successfully",
         data,
         statusCode: HTTP_STATUS.OK,
      });
   } catch (error) {
      next(error);
   }
};

// Create a new room type for a hotel
export const createRoomType = async (req, res, next) => {
   try {
      const id = req?.params?.id;
      const {
         name,
         description,
         price_per_night,
         main_image_url,
         main_image_public_id,
         bed_type,
         number_of_beds,
      } = req.body;

      if (!id) {
         throw new AppError("Hotel ID is required", HTTP_STATUS.BAD_REQUEST);
      }

      const data = await HotelService.createRoomType({
         hotelId: id,
         name,
         description,
         price_per_night,
         main_image_url,
         main_image_public_id,
         bed_type,
         number_of_beds,
      });

      return successResponse(res, {
         message: "Room type created successfully",
         data,
         statusCode: HTTP_STATUS.CREATED,
      });
   } catch (error) {
      next(error);
   }
};

// get room types details
export const getRoomTypesById = async (req, res, next) => {
   try {
      const { id } = req.params;
      const data = await HotelService.getRoomTypeById(id);

      return successResponse(res, {
         message: "Room type fetched successfully",
         data,
         statusCode: HTTP_STATUS.OK,
      });
   } catch (error) {
      next(error);
   }
};

// update room type
export const updateRoomType = async (req, res, next) => {
   try {
      const id = req?.params?.id;
      const updateData = req.body;

      if (!id) {
         throw new AppError(
            "Room type ID is required",
            HTTP_STATUS.BAD_REQUEST
         );
      }

      if (Object.keys(updateData).length === 0) {
         throw new AppError("No update data provided", HTTP_STATUS.BAD_REQUEST);
      }

      const data = await HotelService.updateRoomType(id, updateData);

      return successResponse(res, {
         message: "Room type updated successfully",
         data,
         statusCode: HTTP_STATUS.OK,
      });
   } catch (error) {
      next(error);
   }
};

// get amenities
export const getAmenities = async (req, res, next) => {
   try {
      const data = await HotelService.getAmenities();

      return successResponse(res, {
         message: "Amenities fetched successfully",
         data: { amenities: data },
         statusCode: HTTP_STATUS.OK,
      });
   } catch (error) {
      next(error);
   }
};

// get bed types
export const getBedTypes = async (req, res, next) => {
   try {
      const data = await HotelService.getBedTypes();

      return successResponse(res, {
         message: "Bed types fetched successfully",
         data,
         statusCode: HTTP_STATUS.OK,
      });
   } catch (error) {
      next(error);
   }
};

// Add amenities for the room
export const addRoomTypeAmenities = async (req, res, next) => {
   try {
      const { id } = req.params;
      const { amenities } = req.body;

      // Basic validation
      if (!amenities.length) {
         throw new AppError(
            "Select at least one amenities",
            HTTP_STATUS.BAD_REQUEST
         );
      }
      // Call service to create room type
      const data = await HotelService.addRoomTypeAmenities(id, amenities);

      return successResponse(res, {
         message: "Amenities added successfully",
         data,
         statusCode: HTTP_STATUS.CREATED,
      });
   } catch (error) {
      next(error);
   }
};

// Add rooms for a room type
export const addRoomTypeRooms = async (req, res, next) => {
   try {
      const { id } = req.params;
      const { room_numbers } = req.body;

      // Basic validation
      if (!room_numbers.length) {
         throw new AppError(
            "Select at least one room",
            HTTP_STATUS.BAD_REQUEST
         );
      }
      // Call service to create room type
      const data = await HotelService.addRoomTypeRooms(id, room_numbers);

      return successResponse(res, {
         message: "Rooms added successfully",
         data,
         statusCode: HTTP_STATUS.CREATED,
      });
   } catch (error) {
      next(error);
   }
};

// Add room type images
export const addRoomTypeImages = async (req, res, next) => {
   try {
      const roomTypeId = req.params.id;
      const { image_url, image_public_id } = req.body;

      // Call service to create room type
      const data = await HotelService.addRoomTypeImages(
         roomTypeId,
         image_url,
         image_public_id
      );

      return successResponse(res, {
         message: "Images added successfully",
         data,
         statusCode: HTTP_STATUS.CREATED,
      });
   } catch (error) {
      next(error);
   }
};

// Get hotel by id
export const getHotelById = async (req, res, next) => {
   try {
      const { id } = req.params;
      const data = await HotelService.getHotelById(id);

      return successResponse(res, {
         message: "Hotel fetched successfully",
         data,
         statusCode: HTTP_STATUS.OK,
      });
   } catch (error) {
      next(error);
   }
};

// Get hotel by owner id
export const getHotelsByOwnerId = async (req, res, next) => {
   try {
      const { id } = req.params;
      const data = await HotelService.getHotelsByOwnerId(id);

      return successResponse(res, {
         message: "Hotels fetched successfully",
         data,
         statusCode: HTTP_STATUS.OK,
      });
   } catch (error) {
      next(error);
   }
};

// Update room type room status
export const updateRoomTypeRoomStatus = async (req, res, next) => {
   try {
      const { roomId } = req.params;
      const updateData = req.body;

      if (!roomId) {
         throw new AppError("Room id is required", HTTP_STATUS.BAD_REQUEST);
      }
      if (!Object.keys(updateData).length) {
         throw new AppError("Update data is required", HTTP_STATUS.BAD_REQUEST);
      }
      // Call service to create room type
      const data = await HotelService.updateRoomTypeRoomStatus(
         roomId,
         updateData.status
      );

      return successResponse(res, {
         message: "Room status updated successfully",
         data,
         statusCode: HTTP_STATUS.OK,
      });
   } catch (error) {
      next(error);
   }
};

// Delete image from a room type
export const deleteRoomTypeImage = async (req, res, next) => {
   try {
      const { imageId } = req.params;
      const data = await HotelService.deleteRoomTypeImage(imageId);

      return successResponse(res, {
         message: "Image deleted successfully",
         data,
         statusCode: HTTP_STATUS.OK,
      });
   } catch (error) {
      next(error);
   }
};

// Get all hotels with pagination and search
export const getAllHotels = async (req, res, next) => {
   try {
      const search = req?.query?.search;
      const status = req?.query?.status;
      const page = req?.query?.page;
      const limit = req?.query?.limit;

      const { hotels, pagination } = await HotelService.getAllHotels(
         search,
         status,
         page,
         limit
      );

      return successResponse(res, {
         message: "Hotels fetched successfully",
         data: { hotels, pagination },
         statusCode: HTTP_STATUS.OK,
      });
   } catch (error) {
      next(error);
   }
};

// Get all room types with filter, pagination and search
export const getAllRoomTypes = async (req, res, next) => {
   try {
      const search = req?.query?.search;
      const location = req?.query?.location;
      const minPrice = req?.query?.minPrice;
      const maxPrice = req?.query?.maxPrice;
      const bedType = req?.query?.bedType;
      const numberOfBeds = req?.query?.numberOfBeds;
      const page = req?.query?.page;
      const limit = req?.query?.limit;

      const { roomTypes, pagination } = await HotelService.getAllRoomTypes(
         search,
         location,
         minPrice,
         maxPrice,
         bedType,
         numberOfBeds,
         page,
         limit
      );

      return successResponse(res, {
         message: "Room types fetched successfully",
         data: { roomTypes, pagination },
         statusCode: HTTP_STATUS.OK,
      });
   } catch (error) {
      next(error);
   }
};

// Get available rooms for a room type
export const getAvailableRooms = async (req, res, next) => {
   try {
      const { id } = req.params;
      const check_in = req?.query?.check_in;
      const check_out = req?.query?.check_out;

      if (!id) {
         throw new AppError(
            "Room type id is required",
            HTTP_STATUS.BAD_REQUEST
         );
      }
      if (!check_in || !check_out) {
         throw new AppError(
            "Check in and check out dates are required",
            HTTP_STATUS.BAD_REQUEST
         );
      }

      const data = await HotelService.getAvailableRooms(
         id,
         check_in,
         check_out
      );

      return successResponse(res, {
         message: "Available rooms fetched successfully",
         data,
         statusCode: HTTP_STATUS.OK,
      });
   } catch (error) {
      next(error);
   }
};

// Toggle room type in wishlist
export const toggleWishlist = async (req, res, next) => {
   try {
      const id = req.params?.id;
      const userId = req?.user?.id;
      if (!id) {
         throw new AppError(
            "Room type id is required",
            HTTP_STATUS.BAD_REQUEST
         );
      }
      if (!userId) {
         throw new AppError(
            "Authentication required",
            HTTP_STATUS.UNAUTHORIZED
         );
      }
      const data = await HotelService.toggleWishlist(id, userId);

      return successResponse(res, {
         message: "Room type toggled in wishlist successfully",
         data,
         statusCode: HTTP_STATUS.OK,
      });
   } catch (error) {
      next(error);
   }
};

// Check if room type is in wishlist
export const checkIfRoomTypeInWishlist = async (req, res, next) => {
   try {
      const id = req.params?.id;
      const userId = req?.user?.id;
      if (!id) {
         throw new AppError(
            "Room type id is required",
            HTTP_STATUS.BAD_REQUEST
         );
      }
      if (!userId) {
         throw new AppError(
            "Authentication required",
            HTTP_STATUS.UNAUTHORIZED
         );
      }
      const data = await HotelService.checkIfRoomTypeInWishlist(id, userId);

      return successResponse(res, {
         message: "Room type wishlist status fetched successfully",
         data,
         statusCode: HTTP_STATUS.OK,
      });
   } catch (error) {
      next(error);
   }
};

// Get reviews for a room type with pagination with sorting
export const getRoomTypeReviews = async (req, res, next) => {
   try {
      const id = req.params?.id;
      const page = req?.query?.page;
      const limit = req?.query?.limit;
      const sort = req?.query?.sort_by;
      if (!id) {
         throw new AppError(
            "Room type id is required",
            HTTP_STATUS.BAD_REQUEST
         );
      }
      const data = await HotelService.getRoomTypeReviews(id, page, limit, sort);

      return successResponse(res, {
         message: "Room type reviews fetched successfully",
         data,
         statusCode: HTTP_STATUS.OK,
      });
   } catch (error) {
      next(error);
   }
};

// Get user wishlist
export const getUserWishlist = async (req, res, next) => {
   try {
      const userId = req?.user?.id;
      if (!userId) {
         throw new AppError(
            "Authentication required",
            HTTP_STATUS.UNAUTHORIZED
         );
      }
      const data = await HotelService.getUserWishlist(userId);

      return successResponse(res, {
         message: "User wishlist fetched successfully",
         data,
         statusCode: HTTP_STATUS.OK,
      });
   } catch (error) {
      next(error);
   }
};

// Add bank details
export const addBankDetails = async (req, res, next) => {
   try {
      const userId = req?.user?.id;
      const hotel_id = req.params?.id;
      const { bank_name, account_number, account_holder_name } = req.body;

      if (!userId) {
         throw new AppError(
            "Authentication required",
            HTTP_STATUS.UNAUTHORIZED
         );
      }

      if (!hotel_id) {
         throw new AppError("Hotel ID is required", HTTP_STATUS.BAD_REQUEST);
      }

      const data = await HotelService.addBankDetails(
         hotel_id,
         bank_name,
         account_number,
         account_holder_name
      );

      return successResponse(res, {
         message: "Bank details added successfully",
         data,
         statusCode: HTTP_STATUS.CREATED,
      });
   } catch (error) {
      next(error);
   }
};

// Get my hotels
export const getMyHotels = async (req, res, next) => {
   try {
      const userId = req?.user?.id;
      if (!userId) {
         throw new AppError(
            "Authentication required",
            HTTP_STATUS.UNAUTHORIZED
         );
      }
      const data = await HotelService.getMyHotels(userId);

      return successResponse(res, {
         message: "User hotels fetched successfully",
         data,
         statusCode: HTTP_STATUS.OK,
      });
   } catch (error) {
      next(error);
   }
};

// Get all room types by hotel id
export const getAllRoomTypesByHotelId = async (req, res, next) => {
   try {
      const hotelId = req?.params?.id;
      if (!hotelId) {
         throw new AppError("Hotel ID is required", HTTP_STATUS.BAD_REQUEST);
      }
      const data = await HotelService.getAllRoomTypesByHotelId(hotelId);

      return successResponse(res, {
         message: "Room types fetched successfully",
         data,
         statusCode: HTTP_STATUS.OK,
      });
   } catch (error) {
      next(error);
   }
};

// Get room type rooms
export const getRoomTypeRooms = async (req, res, next) => {
   try {
      const roomTypeId = req?.params?.id;
      if (!roomTypeId) {
         throw new AppError(
            "Room type ID is required",
            HTTP_STATUS.BAD_REQUEST
         );
      }
      const data = await HotelService.getRoomTypeRooms(roomTypeId);

      return successResponse(res, {
         message: "Room type rooms fetched successfully",
         data,
         statusCode: HTTP_STATUS.OK,
      });
   } catch (error) {
      next(error);
   }
};

// Get room type images
export const getRoomTypeImages = async (req, res, next) => {
   try {
      const roomTypeId = req?.params?.id;
      if (!roomTypeId) {
         throw new AppError(
            "Room type ID is required",
            HTTP_STATUS.BAD_REQUEST
         );
      }
      const data = await HotelService.getRoomTypeImages(roomTypeId);

      return successResponse(res, {
         message: "Room type images fetched successfully",
         data,
         statusCode: HTTP_STATUS.OK,
      });
   } catch (error) {
      next(error);
   }
};

// Get room type amenities
export const getRoomTypeAmenities = async (req, res, next) => {
   try {
      const roomTypeId = req?.params?.id;
      if (!roomTypeId) {
         throw new AppError(
            "Room type ID is required",
            HTTP_STATUS.BAD_REQUEST
         );
      }
      const data = await HotelService.getRoomTypeAmenities(roomTypeId);

      return successResponse(res, {
         message: "Room type amenities fetched successfully",
         data,
         statusCode: HTTP_STATUS.OK,
      });
   } catch (error) {
      next(error);
   }
};

// Delete room type amenities
export const deleteRoomTypeAmenities = async (req, res, next) => {
   try {
      const roomTypeId = req?.params?.id;
      const amenityId = req?.params?.amenityId;
      if (!roomTypeId || !amenityId) {
         throw new AppError(
            "Room type ID and amenity ID are required",
            HTTP_STATUS.BAD_REQUEST
         );
      }
      const data = await HotelService.deleteRoomTypeAmenities(
         roomTypeId,
         amenityId
      );

      return successResponse(res, {
         message: "Room type amenities deleted successfully",
         data,
         statusCode: HTTP_STATUS.OK,
      });
   } catch (error) {
      next(error);
   }
};

// Delete room type room
export const deleteRoomTypeRoom = async (req, res, next) => {
   try {
      const roomTypeId = req?.params?.id;
      const roomId = req?.params?.roomId;
      if (!roomTypeId || !roomId) {
         throw new AppError(
            "Room type ID and room ID are required",
            HTTP_STATUS.BAD_REQUEST
         );
      }
      const data = await HotelService.deleteRoomTypeRoom(roomTypeId, roomId);

      return successResponse(res, {
         message: "Room type room deleted successfully",
         data,
         statusCode: HTTP_STATUS.OK,
      });
   } catch (error) {
      next(error);
   }
};

// Update bank details
export const updateBankDetails = async (req, res, next) => {
   try {
      const { id } = req.params;
      const { bank_name, account_number, account_holder_name } = req.body;
      if (!id) {
         throw new AppError("Hotel ID is required", HTTP_STATUS.BAD_REQUEST);
      }
      const data = await HotelService.updateBankDetails(
         id,
         bank_name,
         account_number,
         account_holder_name
      );

      return successResponse(res, {
         message: "Bank details updated successfully",
         data,
         statusCode: HTTP_STATUS.OK,
      });
   } catch (error) {
      next(error);
   }
};

// Get hotel analytics
export const getHotelAnalytics = async (req, res, next) => {
   try {
      const id = req?.params?.id;
      if (!id) {
         throw new AppError("Hotel ID is required", HTTP_STATUS.BAD_REQUEST);
      }
      const data = await HotelService.getHotelAnalytics(id);

      return successResponse(res, {
         message: "Hotel analytics fetched successfully",
         data,
         statusCode: HTTP_STATUS.OK,
      });
   } catch (error) {
      next(error);
   }
};

// Get hotel location for search suggestions
export const getHotelsLocation = async (req, res, next) => {
   try {
      const search = req?.query?.search;
      const data = await HotelService.getHotelsLocation(search);

      return successResponse(res, {
         message: "Hotel location fetched successfully",
         data,
         statusCode: HTTP_STATUS.OK,
      });
   } catch (error) {
      next(error);
   }
};
