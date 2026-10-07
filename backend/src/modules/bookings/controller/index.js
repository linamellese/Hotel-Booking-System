import { HTTP_STATUS } from "../../../constants/http.js";
import { successResponse } from "../../../utils/responseFormatter.js";
import { BookingService } from "../service/index.js";
import AppError from "../../../utils/AppError.js";

// Create booking controller
export const createBooking = async (req, res, next) => {
   try {
      const { room_id, check_in, check_out } = req?.body;
      const user_id = req?.user?.id;
      if (!user_id) {
         throw new AppError(
            "Authentication required",
            HTTP_STATUS.UNAUTHORIZED
         );
      }
      const data = await BookingService.createBooking(
         user_id,
         room_id,
         check_in,
         check_out
      );

      return successResponse(res, {
         message: "Booking created successfully",
         data,
         statusCode: HTTP_STATUS.OK,
      });
   } catch (error) {
      next(error);
   }
};

// Get booking details controller
export const getBookingDetails = async (req, res, next) => {
   try {
      const id = req?.params?.id;
      if (!id) {
         throw new AppError("Booking id is required", HTTP_STATUS.BAD_REQUEST);
      }
      const data = await BookingService.getBookingDetails(id);

      return successResponse(res, {
         message: "Booking details retrieved successfully",
         data,
         statusCode: HTTP_STATUS.OK,
      });
   } catch (error) {
      next(error);
   }
};

// Cancel booking controller
export const cancelBooking = async (req, res, next) => {
   try {
      const id = req?.params?.id;
      if (!id) {
         throw new AppError("Booking id is required", HTTP_STATUS.BAD_REQUEST);
      }
      const data = await BookingService.cancelBooking(id);

      return successResponse(res, {
         message: "Booking cancelled successfully",
         data,
         statusCode: HTTP_STATUS.OK,
      });
   } catch (error) {
      next(error);
   }
};

// Get user bookings controller
export const getUserBookings = async (req, res, next) => {
   try {
      const id = req?.params?.id;
      const status = req?.query?.status;
      const page = req?.query?.page;
      const limit = req?.query?.limit;
      if (!id) {
         throw new AppError("User id is required", HTTP_STATUS.BAD_REQUEST);
      }
      if (status) {
         if (!["pending", "paid", "cancelled"].includes(status)) {
            throw new AppError(
               "Invalid status. Status must be 'pending', 'paid', or 'cancelled'",
               HTTP_STATUS.BAD_REQUEST
            );
         }
      }
      const { bookings, pagination } = await BookingService.getUserBookings(
         id,
         status,
         page,
         limit
      );

      return successResponse(res, {
         message: "User bookings retrieved successfully",
         data: { bookings, pagination },
         statusCode: HTTP_STATUS.OK,
      });
   } catch (error) {
      next(error);
   }
};

// Get hotel bookings controller
export const getHotelBookings = async (req, res, next) => {
   try {
      const id = req?.params?.id;
      const search = req?.query?.search;
      const check_in = req?.query?.check_in;
      const check_out = req?.query?.check_out;
      const status = req?.query?.status;
      const page = req?.query?.page;
      const limit = req?.query?.limit;
      if (!id) {
         throw new AppError("Hotel id is required", HTTP_STATUS.BAD_REQUEST);
      }
      if (status) {
         if (!["pending", "paid"].includes(status)) {
            throw new AppError(
               "Invalid status. Status must be 'pending' or 'paid'",
               HTTP_STATUS.BAD_REQUEST
            );
         }
      }
      const { bookings, pagination } = await BookingService.getHotelBookings(
         id,
         search,
         check_in,
         check_out,
         status,
         page,
         limit
      );

      return successResponse(res, {
         message: "Hotel bookings retrieved successfully",
         data: { bookings, pagination },
         statusCode: HTTP_STATUS.OK,
      });
   } catch (error) {
      next(error);
   }
};

// Get all bookings controller
export const getAllBookings = async (req, res, next) => {
   try {
      const search = req?.query?.search;
      const check_in = req?.query?.check_in;
      const check_out = req?.query?.check_out;
      const status = req?.query?.status;
      const page = req?.query?.page;
      const limit = req?.query?.limit;
      const { bookings, pagination } = await BookingService.getAllBookings(
         search,
         check_in,
         check_out,
         status,
         page,
         limit
      );

      return successResponse(res, {
         message: "All bookings retrieved successfully",
         data: { bookings, pagination },
         statusCode: HTTP_STATUS.OK,
      });
   } catch (error) {
      next(error);
   }
};

// Add review to booking controller
export const addReviewToBooking = async (req, res, next) => {
   try {
      const booking_id = req?.params?.id;
      const { rating, comment } = req?.body;
      const user_id = req?.user?.id;
      if (!user_id) {
         throw new AppError(
            "Authentication required",
            HTTP_STATUS.UNAUTHORIZED
         );
      }
      if (!booking_id) {
         throw new AppError("Booking id is required", HTTP_STATUS.BAD_REQUEST);
      }
      const data = await BookingService.addReviewToBooking(
         user_id,
         booking_id,
         rating,
         comment
      );

      return successResponse(res, {
         message: "Review added successfully",
         data,
         statusCode: HTTP_STATUS.OK,
      });
   } catch (error) {
      next(error);
   }
};
