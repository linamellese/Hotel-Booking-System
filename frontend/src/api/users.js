import apiClient from "./apiClient";

export const usersApi = {
   // Get user profile
   getUserProfile: (userId) => apiClient.get(`/users/${userId}`),

   // Update user profile
   updateUserProfile: (userId, data) => apiClient.put(`/users/${userId}`, data),
};
