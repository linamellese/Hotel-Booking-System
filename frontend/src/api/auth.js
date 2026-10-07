import apiClient from "./apiClient";

export const authApi = {
   // Login
   login: (data) => apiClient.post("/auth/login", data),

   // Logout
   logout: () => apiClient.post("/auth/logout"),

   // Register Customer
   register: (data) => apiClient.post("/auth/register", data),

   // Verify Email
   verifyEmail: (data) => apiClient.post("/auth/verify-email", data),

   // Refresh token
   refreshToken: (refreshToken) =>
      apiClient.post("/auth/refresh-token", { refresh_token: refreshToken }),

   // Forgot Password
   forgotPassword: (data) => apiClient.post("/auth/forgot-password", data),

   // Reset Password
   resetPassword: (data) => apiClient.post("/auth/reset-password", data),
};
