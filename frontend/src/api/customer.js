import apiClient from "./apiClient";

export const customerApi = {
   // Fetch room types based on search parameters
   searchRoomTypes: (params) => apiClient.get("/hotels/room-types", { params }),

   // Fetch detailed information about a specific room type
   getRoomTypeDetails: (roomTypeId) =>
      apiClient.get(`/hotels/room-types/${roomTypeId}`),

   // Fetch available rooms for a specific room type
   getAvailableRooms: (roomTypeId, params) =>
      apiClient.get(`/hotels/room-types/${roomTypeId}/available-rooms`, {
         params,
      }),

   // Is room type in wishlist
   isInWishlist: (roomTypeId) =>
      apiClient.get(`/hotels/room-types/${roomTypeId}/wishlist`),

   // Get wishlist
   getWishlist: (params) => apiClient.get("hotels/user/wishlist"),

   // Add room type to wishlist
   toggleWishlist: (roomTypeId) =>
      apiClient.post(`/hotels/room-types/${roomTypeId}/wishlist`),

   // Book a room
   bookRoom: (data) => apiClient.post("/bookings", data),

   // Get bookings
   getBookings: (userId, params) =>
      apiClient.get(`/bookings/user/${userId}`, { params }),

   // Get booking details
   getBookingDetails: (bookingId) => apiClient.get(`/bookings/${bookingId}`),

   // Cancel booking
   cancelBooking: (bookingId) => apiClient.delete(`/bookings/${bookingId}`),

   // Pay for booking
   payForBooking: (bookingId) =>
      apiClient.post("/payments/initiate", { booking_id: bookingId }),

   // Add review for booking
   addReview: (bookingId, data) =>
      apiClient.post(`/bookings/${bookingId}/reviews`, data),

   // Get reviews for room type
   getRoomTypeReviews: (roomTypeId) =>
      apiClient.get(`/hotels/room-types/${roomTypeId}/reviews`),

   // Get hotel locations for search suggestions
   getLocations: (params) => apiClient.get("/hotels/location", { params }),
};
