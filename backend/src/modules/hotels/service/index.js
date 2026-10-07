import cloudinary from "../../../config/cloudinary.js";
import { HTTP_STATUS } from "../../../constants/http.js";
import { PAGINATION } from "../../../constants/pagination.js";
import AppError from "../../../utils/AppError.js";
import emailService from "../../../utils/emailService.js";
import { generateId } from "../../../utils/idGenerator.js";
import HotelModel from "../model/HotelModel.js";

export class HotelService {
   // Create hotel
   static async createHotel({
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
   }) {
      try {
         // Generate Object Id
         const id = generateId();

         const newHotel = await HotelModel.create({
            id,
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
         if (!newHotel) {
            throw new AppError(
               "Failed to create hotel.",
               HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
         }

         return newHotel;
      } catch (error) {
         // Re-throw AppError instances, otherwise wrap in AppError
         if (error instanceof AppError) {
            throw error;
         }

         throw new AppError(
            "Failed to create hotel. Please try again.",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }

   // Update hotel status
   static async updateHotelStatus(hotelId, status, rejection_reason = null) {
      try {
         const updatedHotel = await HotelModel.updateHotelStatus(
            hotelId,
            status,
            rejection_reason
         );

         if (!updatedHotel) {
            throw new AppError("Hotel not found.", HTTP_STATUS.NOT_FOUND);
         }

         if (updatedHotel.status === "approved") {
            const hotel = await HotelModel.getHotelById(updatedHotel.id);
            await emailService.sendHotelApprovedEmail(hotel.email);
         }

         if (updatedHotel.status === "rejected") {
            const hotel = await HotelModel.getHotelById(updatedHotel.id);
            await emailService.sendHotelRejectedEmail(
               hotel.email,
               hotel.name,
               updatedHotel?.rejection_reason
            );
         }

         return updatedHotel;
      } catch (error) {
         if (error instanceof AppError) {
            throw error;
         }

         throw new AppError(
            "Failed to update hotel status. Please try again.",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }

   // Update hotel
   static async updateHotel(hotelId, updateData) {
      try {
         const hotel = await HotelModel.getHotelById(hotelId);
         if (!hotel) {
            throw new AppError("Hotel not found.", HTTP_STATUS.NOT_FOUND);
         }
         if (updateData?.profile_pic_url) {
            if (hotel?.profile_pic_public_id) {
               await cloudinary.uploader.destroy(hotel?.profile_pic_public_id);
            }
         }
         if (updateData?.business_license) {
            if (hotel?.business_license_public_id) {
               await cloudinary.uploader.destroy(
                  hotel?.business_license_public_id,
                  {
                     resource_type: "raw",
                  }
               );
            }
            const updateHotelStatus = await HotelModel.updateHotelStatus(
               hotelId,
               "pending",
               null
            );
         }

         const updatedHotel = await HotelModel.updateHotel(hotelId, updateData);

         if (!updatedHotel) {
            throw new AppError("Hotel not found.", HTTP_STATUS.NOT_FOUND);
         }

         return updatedHotel;
      } catch (error) {
         if (error instanceof AppError) {
            throw error;
         }

         throw new AppError(
            "Failed to update hotel. Please try again.",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }

   // Create room type
   static async createRoomType({
      hotelId,
      name,
      description,
      price_per_night,
      main_image_url,
      main_image_public_id,
      bed_type,
      number_of_beds,
   }) {
      try {
         // Generate Object Id
         const id = generateId();

         const newRoomType = await HotelModel.createRoomType({
            id,
            hotel_id: hotelId,
            name,
            description,
            price_per_night,
            main_image_url,
            main_image_public_id,
            bed_type,
            number_of_beds,
         });
         if (!newRoomType) {
            throw new AppError(
               "Failed to create room type.",
               HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
         }

         return newRoomType;
      } catch (error) {
         // Re-throw AppError instances, otherwise wrap in AppError
         if (error instanceof AppError) {
            throw error;
         }

         throw new AppError(
            "Failed to create room type. Please try again.",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }

   // Get room type by id
   static async getRoomTypeById(roomTypeId) {
      try {
         let roomType = await HotelModel.getRoomTypeById(roomTypeId);
         let amenities = await HotelModel.getRoomTypeAmenities(roomTypeId);
         let images = await HotelModel.getRoomTypeImages(roomTypeId);

         // Check if room type exists
         if (!roomType) {
            throw new AppError("Room type not found", HTTP_STATUS.NOT_FOUND);
         }

         // Check if amenities exist
         if (!amenities) {
            amenities = [];
         }

         // Check if images exist
         if (!images) {
            images = [];
         }

         return {
            id: roomType.id,
            name: roomType.name,
            description: roomType.description,
            price_per_night: roomType.price_per_night,
            main_image_url: roomType.main_image_url,
            main_image_public_id: roomType.main_image_public_id,
            status: roomType.status,
            bed_type: roomType.bed_type,
            number_of_beds: roomType.number_of_beds,
            reviews_count: roomType.reviews_count,
            average_rating: roomType.average_rating,
            hotel: {
               id: roomType.hotel_id,
               name: roomType.hotel_name,
               location: roomType.hotel_location,
               latitude: roomType.latitude,
               longitude: roomType.longitude,
               contact_info: roomType.contact_info,
               description: roomType.hotel_description,
               profile_pic_url: roomType.profile_pic_url,
            },
            images: images
               ? images.map((image) => ({
                    id: image.id,
                    image_url: image.image_url,
                    image_public_id: image.image_public_id,
                 }))
               : [],
            amenities: amenities
               ? amenities.map((amenity) => ({
                    id: amenity.id,
                    name: amenity.name,
                    icon_url: amenity.icon_url,
                 }))
               : [],
            created_at: roomType.created_at,
            updated_at: roomType.updated_at,
         };
      } catch (error) {
         if (error instanceof AppError) {
            throw error;
         }

         throw new AppError(
            "Failed to retrieve room type. Please try again.",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }

   // update room type
   static async updateRoomType(roomTypeId, updateData) {
      try {
         const updatedRoomType = await HotelModel.updateRoomType(
            roomTypeId,
            updateData
         );

         if (!updatedRoomType) {
            throw new AppError("Room type not found.", HTTP_STATUS.NOT_FOUND);
         }

         return updatedRoomType;
      } catch (error) {
         if (error instanceof AppError) {
            throw error;
         }

         throw new AppError(
            "Failed to update room type. Please try again.",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }

   // Get amenities
   static async getAmenities() {
      try {
         const amenities = await HotelModel.getAmenities();
         return amenities;
      } catch (error) {
         throw new AppError(
            "Failed to get amenities. Please try again.",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }

   // Get bed types
   static async getBedTypes() {
      try {
         const bed_types = await HotelModel.getBedTypes();

         return { bed_types };
      } catch (error) {
         throw new AppError(
            "Failed to get bed types. Please try again.",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }

   // Add room type amenities
   static async addRoomTypeAmenities(roomTypeId, amenity_ids) {
      try {
         let amenities = [];
         if (amenity_ids.length) {
            const promises = amenity_ids.map(async (amenity_id) => {
               // Generate Object Id
               const id = generateId();
               const newAmenity = await HotelModel.addRoomTypeAmenity({
                  id,
                  room_type_id: roomTypeId,
                  amenity_id,
               });
               if (newAmenity) {
                  return newAmenity.id;
               }
            });

            amenities = await Promise.all(promises);
         }
         if (!amenities) {
            throw new AppError(
               "Failed to add room type amenities.",
               HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
         }

         return { amenities };
      } catch (error) {
         // Re-throw AppError instances, otherwise wrap in AppError
         if (error instanceof AppError) {
            throw error;
         }

         throw new AppError(
            "Failed to add room type amenities. Please try again.",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }

   // Add room type rooms
   static async addRoomTypeRooms(roomTypeId, room_numbers) {
      try {
         let rooms = [];
         if (room_numbers.length) {
            const promises = room_numbers.map(async (room_number) => {
               // Generate Object Id
               const id = generateId();
               const newRoom = await HotelModel.addRoomTypeRoom({
                  id,
                  room_type_id: roomTypeId,
                  room_number,
               });
               if (newRoom) {
                  return newRoom?.id;
               }
            });

            rooms = await Promise.all(promises);
         }
         if (!rooms) {
            throw new AppError(
               "Failed to add room type rooms.",
               HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
         }

         return { rooms };
      } catch (error) {
         // Re-throw AppError instances, otherwise wrap in AppError
         if (error instanceof AppError) {
            throw error;
         }

         throw new AppError(
            "Failed to add room type rooms. Please try again.",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }

   // Add room type images
   static async addRoomTypeImages(roomTypeId, image_url, image_public_id) {
      try {
         // Generate Object Id
         const id = generateId();

         const newImage = await HotelModel.addRoomTypeImage(
            id,
            roomTypeId,
            image_url,
            image_public_id
         );
         if (!newImage) {
            throw new AppError(
               "Failed to add room type images.",
               HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
         }
         return newImage;
      } catch (error) {
         // Re-throw AppError instances, otherwise wrap in AppError
         if (error instanceof AppError) {
            throw error;
         }

         throw new AppError(
            "Failed to add room type images. Please try again.",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }

   // Get hotel by id
   static async getHotelById(hotelId) {
      try {
         const hotel = await HotelModel.getHotelById(hotelId);

         if (!hotel) {
            throw new AppError("Hotel not found.", HTTP_STATUS.NOT_FOUND);
         }

         let roomTypesData = await HotelModel.getHotelRoomTypes(hotelId);

         if (!roomTypesData) {
            roomTypesData = [];
         }

         const roomTypesWithDetails = await Promise.all(
            roomTypesData.map(async (roomType) => {
               let amenities = await HotelModel.getRoomTypeAmenities(
                  roomType.id
               );
               let rooms = await HotelModel.getRoomTypeRooms(roomType.id);

               if (!amenities) {
                  amenities = [];
               }

               if (!rooms) {
                  rooms = [];
               }

               return {
                  id: roomType.id,
                  name: roomType.name,
                  description: roomType.description,
                  price_per_night: roomType.price_per_night,
                  main_image_url: roomType.main_image_url,
                  status: roomType.status,
                  amenities: amenities.map((a) => a.name),
                  available_rooms: rooms.length,
               };
            })
         );

         return {
            id: hotel.id,
            name: hotel.name,
            location: hotel.location,
            contact_info: hotel.contact_info,
            description: hotel.description,
            business_license: hotel.business_license,
            profile_pic_url: hotel.profile_pic_url,
            status: hotel.status,
            owner: {
               id: hotel.owner_id,
               first_name: hotel.first_name,
               last_name: hotel.last_name,
               email: hotel.email,
               phone_number: hotel.phone_number,
            },
            room_types: roomTypesWithDetails,
            created_at: hotel.created_at,
            updated_at: hotel.updated_at,
         };
      } catch (error) {
         if (error instanceof AppError) {
            throw error;
         }

         throw new AppError(
            "Failed to retrieve hotel details. Please try again.",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }

   // Get hotels by owner id
   static async getHotelsByOwnerId(ownerId) {
      try {
         const hotels = await HotelModel.getHotelsByOwnerId(ownerId);

         if (!hotels) {
            throw new AppError("Hotels not found.", HTTP_STATUS.NOT_FOUND);
         }

         return { hotels };
      } catch (error) {
         if (error instanceof AppError) {
            throw error;
         }

         throw new AppError(
            "Failed to retrieve hotels. Please try again.",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }

   // Update room type room status
   static async updateRoomTypeRoomStatus(room_id, status) {
      try {
         const room = await HotelModel.updateRoomTypeRoomStatus({
            room_id,
            status,
         });

         if (!room) {
            throw new AppError("Room not found.", HTTP_STATUS.NOT_FOUND);
         }

         return { room };
      } catch (error) {
         if (error instanceof AppError) {
            throw error;
         }

         throw new AppError(
            "Failed to update room status. Please try again.",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }

   // Delete image from a room type
   static async deleteRoomTypeImage(imageId) {
      try {
         const image = await HotelModel.getRoomTypeImageById(imageId);

         if (!image) {
            throw new AppError("Image not found.", HTTP_STATUS.NOT_FOUND);
         }
         if (image?.image_public_id) {
            // delete image from cloudinary
            await cloudinary.uploader.destroy(image?.image_public_id);
         }

         const deletedImage = await HotelModel.deleteRoomTypeImage(imageId);

         return { deletedImage };
      } catch (error) {
         if (error instanceof AppError) {
            throw error;
         }

         throw new AppError(
            "Failed to delete image. Please try again.",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }

   // Get all hotels with pagination and search
   static async getAllHotels(
      search = "",
      status = "",
      page = PAGINATION.DEFAULT_PAGE,
      limit = PAGINATION.DEFAULT_LIMIT
   ) {
      try {
         const totalHotels = await HotelModel.countAllHotels(search, status);
         const totalPages = Math.ceil(totalHotels / limit);

         // page should not exced from the totalPages
         if (page > totalPages && page != 1) {
            throw new AppError("Page not found.", HTTP_STATUS.NOT_FOUND);
         }

         const hotels = await HotelModel.getAllHotels(
            search,
            status,
            page,
            limit
         );

         // prepare pagination
         const pagination = {
            page,
            limit,
            total: totalHotels,
            total_pages: totalPages,
         };

         return { hotels, pagination };
      } catch (error) {
         if (error instanceof AppError) {
            throw error;
         }

         throw new AppError(
            "Failed to retrieve hotels. Please try again.",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }

   // Get all room types with filter, pagination and search
   static async getAllRoomTypes(
      search = "",
      location = "",
      minPrice,
      maxPrice,
      bedType,
      numberOfBeds,
      page = PAGINATION.DEFAULT_PAGE,
      limit = PAGINATION.DEFAULT_LIMIT
   ) {
      try {
         const totalRoomTypes = await HotelModel.countAllRoomTypes(
            search,
            location,
            minPrice,
            maxPrice,
            bedType,
            numberOfBeds
         );
         const totalPages = Math.ceil(totalRoomTypes / limit);

         // page should not exced from the totalPages
         if ((page > totalPages) & (page > 1)) {
            throw new AppError("Page not found.", HTTP_STATUS.NOT_FOUND);
         }

         const roomTypes = await HotelModel.getAllRoomTypes(
            search,
            location,
            minPrice,
            maxPrice,
            bedType,
            numberOfBeds,
            page,
            limit
         );

         // prepare pagination
         const pagination = {
            page,
            limit,
            total: totalRoomTypes,
            total_pages: totalPages,
         };

         return { roomTypes, pagination };
      } catch (error) {
         if (error instanceof AppError) {
            throw error;
         }

         throw new AppError(
            "Failed to retrieve room types. Please try again.",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }

   // Get available rooms for a room type
   static async getAvailableRooms(roomTypeId, checkIn, checkOut) {
      try {
         const availableRooms = await HotelModel.getAvailableRooms(
            roomTypeId,
            checkIn,
            checkOut
         );

         return availableRooms;
      } catch (error) {
         if (error instanceof AppError) {
            throw error;
         }

         throw new AppError(
            "Failed to retrieve available rooms. Please try again.",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }

   // Toggle room type in wishlist
   static async toggleWishlist(roomTypeId, userId) {
      try {
         const isWishlist = await HotelModel.toggleWishlist(roomTypeId, userId);

         return { is_in_wishlist: isWishlist };
      } catch (error) {
         if (error instanceof AppError) {
            throw error;
         }

         throw new AppError(
            "Failed to retrieve room type wishlist status. Please try again.",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }

   // Check if room type is in wishlist
   static async checkIfRoomTypeInWishlist(roomTypeId, userId) {
      try {
         const isWishlist = await HotelModel.checkIfRoomTypeInWishlist(
            roomTypeId,
            userId
         );

         return { is_in_wishlist: isWishlist };
      } catch (error) {
         if (error instanceof AppError) {
            throw error;
         }

         throw new AppError(
            "Failed to retrieve room type wishlist status. Please try again.",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }

   // Get reviews for a room type
   static async getRoomTypeReviews(
      roomTypeId,
      page = PAGINATION.DEFAULT_PAGE,
      limit = PAGINATION.DEFAULT_LIMIT,
      sort = "relevant"
   ) {
      try {
         const totalReviews = await HotelModel.countRoomTypeReviews(roomTypeId);
         const totalPages = Math.ceil(totalReviews / limit);

         // page should not exced from the totalPages
         if (page > totalPages && page > 1) {
            throw new AppError("Page not found.", HTTP_STATUS.NOT_FOUND);
         }

         const reviews = await HotelModel.getRoomTypeReviews(
            roomTypeId,
            page,
            limit,
            sort
         );

         // prepare pagination
         const pagination = {
            page,
            limit,
            total: totalReviews,
            total_pages: totalPages,
         };

         return { reviews, pagination };
      } catch (error) {
         if (error instanceof AppError) {
            throw error;
         }

         throw new AppError(
            "Failed to retrieve room type reviews. Please try again.",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }

   // Get user wishlist
   static async getUserWishlist(userId) {
      try {
         const wishlist = await HotelModel.getUserWishlist(userId);

         return wishlist;
      } catch (error) {
         if (error instanceof AppError) {
            throw error;
         }

         throw new AppError(
            "Failed to retrieve user wishlist. Please try again.",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }

   // Get user hotels
   static async getMyHotels(userId) {
      try {
         const hotels = await HotelModel.getMyHotels(userId);

         return hotels;
      } catch (error) {
         if (error instanceof AppError) {
            throw error;
         }

         throw new AppError(
            "Failed to retrieve user hotels. Please try again.",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }

   // Add bank details
   static async addBankDetails(
      hotelId,
      bankName,
      accountNumber,
      accountHolderName
   ) {
      try {
         const bankDetails = await HotelModel.addBankDetails(
            hotelId,
            bankName,
            accountNumber,
            accountHolderName
         );
         if (!bankDetails) {
            throw new AppError(
               "Failed to add bank details. Please try again.",
               HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
         }

         return bankDetails;
      } catch (error) {
         if (error instanceof AppError) {
            throw error;
         }

         throw new AppError(
            "Failed to add bank details. Please try again.",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }

   // Get all room types by hotel id
   static async getAllRoomTypesByHotelId(hotelId) {
      try {
         const roomTypes = await HotelModel.getAllRoomTypesByHotelId(hotelId);

         return { room_types: roomTypes };
      } catch (error) {
         if (error instanceof AppError) {
            throw error;
         }

         throw new AppError(
            "Failed to retrieve room types. Please try again.",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }

   // Get room type images
   static async getRoomTypeImages(roomTypeId) {
      try {
         const images = await HotelModel.getRoomTypeImages(roomTypeId);

         return { images };
      } catch (error) {
         if (error instanceof AppError) {
            throw error;
         }

         throw new AppError(
            "Failed to retrieve room type images. Please try again.",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }

   // Get room type rooms
   static async getRoomTypeRooms(roomTypeId) {
      try {
         const rooms = await HotelModel.getRoomTypeRooms(roomTypeId);

         return rooms;
      } catch (error) {
         if (error instanceof AppError) {
            throw error;
         }

         throw new AppError(
            "Failed to retrieve room type rooms. Please try again.",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }

   // Get room type amenities
   static async getRoomTypeAmenities(roomTypeId) {
      try {
         const amenities = await HotelModel.getRoomTypeAmenities(roomTypeId);

         return { amenities };
      } catch (error) {
         if (error instanceof AppError) {
            throw error;
         }

         throw new AppError(
            "Failed to retrieve room type amenities. Please try again.",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }

   // Delete room type amenities
   static async deleteRoomTypeAmenities(roomTypeId, amenityId) {
      try {
         const amenities = await HotelModel.deleteRoomTypeAmenities(
            roomTypeId,
            amenityId
         );

         return { amenities };
      } catch (error) {
         if (error instanceof AppError) {
            throw error;
         }

         throw new AppError(
            "Failed to retrieve room type amenities. Please try again.",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }

   // Delete room type room
   static async deleteRoomTypeRoom(roomTypeId, roomId) {
      try {
         const room = await HotelModel.deleteRoomTypeRoom(roomTypeId, roomId);

         return { room };
      } catch (error) {
         if (error instanceof AppError) {
            throw error;
         }

         throw new AppError(
            "Failed to retrieve room type room. Please try again.",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }

   // Update bank details
   static async updateBankDetails(
      hotelId,
      bankName,
      accountNumber,
      accountHolderName
   ) {
      try {
         const bankDetails = await HotelModel.updateBankDetails(
            hotelId,
            bankName,
            accountNumber,
            accountHolderName
         );
         if (!bankDetails) {
            throw new AppError(
               "Failed to update bank details. Please try again.",
               HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
         }

         return bankDetails;
      } catch (error) {
         if (error instanceof AppError) {
            throw error;
         }

         throw new AppError(
            "Failed to update bank details. Please try again.",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }

   // Get hotel analytics
   static async getHotelAnalytics(hotelId) {
      try {
         const analytics = await HotelModel.getHotelAnalytics(hotelId);
         if (!analytics) {
            throw new AppError(
               "Failed to retrieve hotel analytics. Please try again.",
               HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
         }

         return analytics;
      } catch (error) {
         if (error instanceof AppError) {
            throw error;
         }

         throw new AppError(
            "Failed to retrieve hotel analytics. Please try again.",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }

   // Get hotel location for search suggestions
   static async getHotelsLocation(search) {
      try {
         const hotels = await HotelModel.getHotelsLocation(search);

         return hotels;
      } catch (error) {
         if (error instanceof AppError) {
            throw error;
         }

         throw new AppError(
            "Failed to retrieve hotel location. Please try again.",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }
}
