import apiClient from "./apiClient";

export const adminApi = {
   // Dashboard
   getDashboardData: () => apiClient.get("/admin/dashboard/data"),

   // Hotel Status Management
   getHotels: (params) => apiClient.get("/hotels", { params }),
   getHotelById: (id) => apiClient.get(`/hotels/${id}`),
   updateHotelStatus: (id, status) =>
      apiClient.put(`/hotels/${id}/status`, { status }),

   // Users Management
   getUsers: (params) => apiClient.get("/admin/users", { params }),
   updateUserStatus: (id, status) =>
      apiClient.put(`/admin/users/${id}/status`, { status }),
   updateUserRole: (id, role) =>
      apiClient.put(`/admin/users/${id}/role`, { role }),
   createAdmin: (data) => apiClient.post("/admin", data),

   // Property Setup (Amenities & Bed Types)
   getAmenities: () => apiClient.get("/hotels/amenities"),
   createAmenity: (data) => apiClient.post("/admin/amenities", data),
   updateAmenity: (id, data) => apiClient.put(`/admin/amenities/${id}`, data),
   deleteAmenity: (id) => apiClient.delete(`/admin/amenities/${id}`),

   getBedTypes: () => apiClient.get("/hotels/bed-types"),
   createBedType: (data) => apiClient.post("/admin/bed-types", data),
   updateBedType: (id, data) => apiClient.put(`/admin/bed-types/${id}`, data),
   deleteBedType: (id) => apiClient.delete(`/admin/bed-types/${id}`),
   // Bookings Management
   getAllBookings: (params) => apiClient.get("/bookings", { params }),
   getBookingById: (id) => apiClient.get(`/bookings/${id}`),
};
