import { HTTP_STATUS } from "../../../constants/http.js";
import AppError from "../../../utils/AppError.js";
import HotelModel from "../../hotels/model/HotelModel.js";
import UserModel from "../../auth/model/UserModel.js";
import BookingModel from "../../bookings/model/BookingModel.js";

class AdminModel {
   // Get admin dashboard data
   static async getAdminDashboardData() {
      try {
         const total_hotels_count = await HotelModel.getAllHotelsCount();
         const total_hotel_owner_count = await UserModel.countAllUsers({
            role: "hotel_owner",
         });
         const total_customers_count = await UserModel.countAllUsers({
            role: "customer",
         });
         const total_bookings_count = await BookingModel.getAllBookingsCount();
         const pending_hotels_count = await HotelModel.getAllHotelsCount(
            "pending"
         );
         const total_revenue = await BookingModel.getTotalRevenue();

         return {
            total_hotels_count,
            total_hotel_owner_count,
            total_customers_count,
            total_bookings_count,
            pending_hotels_count,
            total_revenue,
         };
      } catch (error) {
         // Re-throw AppError instances, otherwise wrap in AppError
         if (error instanceof AppError) {
            throw error;
         }

         throw new AppError(
            "Failed to fetch admin dashboard data. Please try again.",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }
}

export default AdminModel;
