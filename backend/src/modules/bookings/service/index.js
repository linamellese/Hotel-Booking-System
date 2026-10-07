import { HTTP_STATUS } from "../../../constants/http.js";
import AppError from "../../../utils/AppError.js";
import BookingModel from "../model/BookingModel.js";
import {
   generateBookingReference,
   generateId,
} from "../../../utils/idGenerator.js";
import { PAGINATION } from "../../../constants/pagination.js";
import HotelModel from "../../hotels/model/HotelModel.js";
import emailService from "../../../utils/emailService.js";

export class BookingService {
   // Create booking service
   static async createBooking(user_id, room_id, check_in, check_out) {
      try {
         const id = generateId();
         const booking_reference = generateBookingReference(id);
         const price_per_night = await HotelModel.getRoomPrice(room_id);

         const checkInDate = new Date(check_in);
         const checkOutDate = new Date(check_out);
         const timeDiff = Math.abs(
            checkOutDate.getTime() - checkInDate.getTime()
         );
         const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));

         const taxRate = 0.1;
         const total = parseFloat(price_per_night) * nights;
         const tax = total * taxRate;
         const service_fee = total * 0.05;
         const grand_total = total + tax + service_fee;

         const booking = await BookingModel.createBooking({
            id,
            user_id,
            room_id,
            check_in,
            check_out,
            total_amount: grand_total,
            booking_reference,
         });
         if (!booking) {
            throw new AppError(
               "Failed to create booking. Please try again.",
               HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
         }

         return booking;
      } catch (error) {
         // Re-throw AppError instances, otherwise wrap in AppError
         if (error instanceof AppError) {
            throw error;
         }

         throw new AppError(
            "Failed to create booking. Please try again.",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }

   // Get booking details service
   static async getBookingDetails(id) {
      try {
         const booking = await BookingModel.getBookingDetails(id);

         if (!booking) {
            throw new AppError("Booking not found.", HTTP_STATUS.NOT_FOUND);
         }

         return booking;
      } catch (error) {
         // Re-throw AppError instances, otherwise wrap in AppError
         if (error instanceof AppError) {
            throw error;
         }

         throw new AppError(
            "Failed to get booking details. Please try again.",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }

   // Cancel booking service
   static async cancelBooking(id) {
      try {
         const booking = await BookingModel.getBookingDetails(id);
         if (!booking) {
            throw new AppError("Booking not found.", HTTP_STATUS.NOT_FOUND);
         }

         if (booking.status !== "pending") {
            throw new AppError(
               "Booking cannot be cancelled.",
               HTTP_STATUS.BAD_REQUEST
            );
         }

         const cancelledBooking = await BookingModel.cancelBooking(id);

         if (!cancelledBooking) {
            throw new AppError("Booking not found.", HTTP_STATUS.NOT_FOUND);
         }

         return cancelledBooking;
      } catch (error) {
         // Re-throw AppError instances, otherwise wrap in AppError
         if (error instanceof AppError) {
            throw error;
         }

         throw new AppError(
            "Failed to cancel booking. Please try again.",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }

   // Get user bookings service with pagination
   static async getUserBookings(
      id,
      status,
      page = PAGINATION.DEFAULT_PAGE,
      limit = PAGINATION.DEFAULT_LIMIT
   ) {
      try {
         const totalBookings = await BookingModel.countUserBookings(id, status);
         const totalPages = Math.ceil(totalBookings / limit);
         // page should not exceed total pages
         if (page > totalPages && page != 1) {
            throw new AppError("Page not found.", HTTP_STATUS.NOT_FOUND);
         }

         const bookings = await BookingModel.getUserBookings(
            id,
            status,
            page,
            limit
         );

         // prepare pagination
         const pagination = {
            page,
            limit,
            total: totalBookings,
            total_pages: totalPages,
         };

         return { bookings, pagination };
      } catch (error) {
         // Re-throw AppError instances, otherwise wrap in AppError
         if (error instanceof AppError) {
            throw error;
         }

         throw new AppError(
            "Failed to get user bookings. Please try again.",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }

   // Get hotel bookings service with pagination
   static async getHotelBookings(
      id,
      search,
      check_in,
      check_out,
      status,
      page = PAGINATION.DEFAULT_PAGE,
      limit = PAGINATION.DEFAULT_LIMIT
   ) {
      try {
         const totalBookings = await BookingModel.countHotelBookings(
            id,
            search,
            check_in,
            check_out,
            status
         );
         const totalPages = Math.ceil(totalBookings / limit);
         // page should not exceed total pages
         if (page > totalPages && page != 1) {
            throw new AppError("Page not found.", HTTP_STATUS.NOT_FOUND);
         }

         const result = await BookingModel.getHotelBookings(
            id,
            search,
            check_in,
            check_out,
            status,
            page,
            limit
         );

         if (!result) {
            throw new AppError("Hotel not found.", HTTP_STATUS.NOT_FOUND);
         }
         // prepare bookings
         const bookings = result.map((booking) => {
            return {
               id: booking.id,
               booking_reference: booking.booking_reference,
               room: {
                  id: booking.room_id,
                  room_number: booking.room_number,
                  room_type: {
                     id: booking.room_type_id,
                     name: booking.room_type_name,
                     price_per_night: booking.price_per_night,
                  },
               },
               user: {
                  id: booking.user_id,
                  first_name: booking.first_name,
                  last_name: booking.last_name,
                  email: booking.email,
               },
               hotel: {
                  id: booking.hotel_id,
                  name: booking.hotel_name,
                  location: booking.hotel_location,
               },
               check_in: booking.check_in,
               check_out: booking.check_out,
               total_amount: booking.total_amount,
               status: booking.status,
               created_at: booking.created_at,
               updated_at: booking.updated_at,
            };
         });

         // prepare pagination
         const pagination = {
            page,
            limit,
            total: totalBookings,
            total_pages: totalPages,
         };

         return { bookings, pagination };
      } catch (error) {
         // Re-throw AppError instances, otherwise wrap in AppError
         if (error instanceof AppError) {
            throw error;
         }

         throw new AppError(
            "Failed to get hotel bookings. Please try again.",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }

   // Get all bookings service with pagination
   static async getAllBookings(
      search,
      check_in,
      check_out,
      status,
      page = PAGINATION.DEFAULT_PAGE,
      limit = PAGINATION.DEFAULT_LIMIT
   ) {
      try {
         const totalBookings = await BookingModel.countAllBookings(
            search,
            check_in,
            check_out,
            status
         );
         const totalPages = Math.ceil(totalBookings / limit);
         // page should not exceed total pages
         if (page > totalPages && page != 1) {
            throw new AppError("Page not found.", HTTP_STATUS.NOT_FOUND);
         }

         const bookings = await BookingModel.getAllBookings(
            search,
            check_in,
            check_out,
            status,
            page,
            limit
         );

         // prepare pagination
         const pagination = {
            page,
            limit,
            total: totalBookings,
            total_pages: totalPages,
         };

         return { bookings, pagination };
      } catch (error) {
         // Re-throw AppError instances, otherwise wrap in AppError
         if (error instanceof AppError) {
            throw error;
         }

         throw new AppError(
            "Failed to get all bookings. Please try again.",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }

   // Add review to booking service
   static async addReviewToBooking(user_id, booking_id, rating, comment) {
      try {
         const booking = await BookingModel.getBookingDetails(booking_id);
         if (!booking) {
            throw new AppError("Booking not found.", HTTP_STATUS.NOT_FOUND);
         }
         if (booking.user.id !== user_id || booking.status !== "paid") {
            throw new AppError(
               "You are not authorized to add a review.",
               HTTP_STATUS.UNAUTHORIZED
            );
         }
         const hotel_id = booking.hotel.id;
         const room_type_id = booking.room.room_type.id;

         const review = await BookingModel.addReviewToBooking(
            hotel_id,
            booking_id,
            room_type_id,
            rating,
            comment
         );
         if (!review) {
            throw new AppError(
               "Failed to add review to booking. Please try again.",
               HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
         }
         return review;
      } catch (error) {
         // Re-throw AppError instances, otherwise wrap in AppError
         if (error instanceof AppError) {
            throw error;
         }

         throw new AppError(
            "Failed to add review to booking. Please try again.",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }

   // Update booking status with booking reference
   static async updateBookingStatusWithBookingReference(reference, status) {
      try {
         const booking =
            await BookingModel.updateBookingStatusWithBookingReference(
               reference,
               status
            );
         if (!booking) {
            throw new AppError("Booking not found.", HTTP_STATUS.NOT_FOUND);
         }
         const bookingDetails = await BookingModel.getBookingDetailsByReference(
            reference
         );
         if (bookingDetails) {
            // send confirmation email
            await emailService.sendBookingConfirmationEmail(
               bookingDetails?.user?.email,
               {
                  booking_reference: bookingDetails?.booking_reference,
                  hotel_name: bookingDetails?.hotel?.name,
                  hotel_location: bookingDetails?.hotel?.location,
                  hotel_phone: bookingDetails?.hotel?.contact_number,
                  room_type: bookingDetails?.room?.room_type?.name,
                  room_number: bookingDetails?.room?.room_number,
                  check_in: bookingDetails?.check_in,
                  check_out: bookingDetails?.check_out,
                  total_amount: bookingDetails?.total_amount,
                  status: bookingDetails?.status,
               }
            );
         }

         return bookingDetails;
      } catch (error) {
         // Re-throw AppError instances, otherwise wrap in AppError
         if (error instanceof AppError) {
            throw error;
         }

         throw new AppError(
            "Failed to update booking status. Please try again.",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }
}
