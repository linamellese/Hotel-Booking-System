import apiClient from "./apiClient";

export const hotelOwnerApi = {
   // Get dashboard analytics
   getDashboardAnalytics: (hotelId) =>
      apiClient.get(`/hotels/${hotelId}/analytics`),

   // Step 1: Create Hotel (Business Info)
   createHotel: (data) => apiClient.post("/hotels", data),

   // Step 2: Add Bank Details
   addBankDetails: (hotelId, data) =>
      apiClient.post(`/hotels/${hotelId}/bank-details`, data),

   // Update Bank Details
   updateBankDetails: (hotelId, data) =>
      apiClient.put(`/hotels/${hotelId}/bank-details`, data),

   // Get current hotel info (for resumption)
   getMyHotel: () => apiClient.get("/hotels/me"),

   // Update Hotel Details
   updateHotel: (id, data) => apiClient.put(`/hotels/${id}`, data),

   // --- Room Types Management ---

   // Get all room types
   getRoomTypes: (hotelId) => apiClient.get(`/hotels/${hotelId}/room-types`),

   // Create room type
   createRoomType: (hotelId, data) =>
      apiClient.post(`/hotels/${hotelId}/room-types`, data),

   // Get room type details
   getRoomTypeDetails: (id) => apiClient.get(`/hotels/room-types/${id}`),

   // Update room type
   updateRoomType: (id, data) =>
      apiClient.put(`/hotels/room-types/${id}`, data),

   // --- Amenities ---
   // Get all amenities (for selection list)
   getAllAmenities: () => apiClient.get("/hotels/amenities"),

   // Get distinct room type amenities
   getRoomTypeAmenities: (roomTypeId) =>
      apiClient.get(`/hotels/room-types/${roomTypeId}/amenities`),

   // Add amenities to room type
   addRoomTypeAmenities: (roomTypeId, data) =>
      apiClient.post(`/hotels/room-types/${roomTypeId}/amenities`, data),

   // Delete amenity from room type
   deleteRoomTypeAmenity: (roomTypeId, amenityId) =>
      apiClient.delete(
         `/hotels/room-types/${roomTypeId}/amenities/${amenityId}`
      ),

   // --- Room Images ---
   getRoomTypeImages: (roomTypeId) =>
      apiClient.get(`/hotels/room-types/${roomTypeId}/images`),

   addRoomTypeImage: (id, data) =>
      apiClient.post(`/hotels/room-types/${id}/images`, data),

   deleteRoomTypeImage: (id, publicId) =>
      apiClient.delete(`/hotels/room-types/${id}/images/${publicId}`),

   // --- Rooms (Inventory) ---
   getRooms: (roomTypeId) =>
      apiClient.get(`/hotels/room-types/${roomTypeId}/rooms`),
   addRooms: (roomTypeId, data) =>
      apiClient.post(`/hotels/room-types/${roomTypeId}/rooms`, data),
   updateRoomStatus: (roomTypeId, roomId, data) =>
      apiClient.put(`/hotels/room-types/${roomTypeId}/rooms/${roomId}`, data),
   deleteRoom: (roomTypeId, roomId) =>
      apiClient.delete(`/hotels/room-types/${roomTypeId}/rooms/${roomId}`),

   // --- Bookings ---
   getHotelBookings: (hotelId, params) =>
      apiClient.get(`/bookings/hotel/${hotelId}`, { params }),

   // --- Reviews ---
   getRoomTypeReviews: (roomTypeId, params) =>
      apiClient.get(`/hotels/room-types/${roomTypeId}/reviews`, { params }),
};
