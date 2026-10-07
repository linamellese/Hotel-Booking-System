import axios from "axios";
import useAuthStore from "../store/authStore";

const apiClient = axios.create({
   baseURL: import.meta.env.VITE_API_BASE_URL,
   timeout: 5000,
});

let isRefreshing = false;
let failedQueue = [];

// Queue processing helper
const processQueue = (error, token = null) => {
   failedQueue.forEach((prom) => {
      if (error) prom.reject(error);
      else prom.resolve(token);
   });
   failedQueue = [];
};

/**
 * REQUEST INTERCEPTOR
 */
apiClient.interceptors.request.use(
   (config) => {
      const { accessToken } = useAuthStore.getState();

      if (accessToken && !config.url.includes("/auth/refresh-token")) {
         config.headers.Authorization = `Bearer ${accessToken}`;
      } else if (!config.url.includes("/auth/refresh-token")) {
         delete config.headers.Authorization;
      }

      return config;
   },
   (error) => Promise.reject(error)
);

/**
 * RESPONSE INTERCEPTOR
 */
apiClient.interceptors.response.use(
   (response) => response.data,
   async (error) => {
      const originalRequest = error.config;
      const store = useAuthStore.getState();

      // Only handle 401s if refresh token exists and request not retried
      if (
         error.response?.status === 401 &&
         !originalRequest._retry &&
         store.refreshToken
      ) {
         if (isRefreshing) {
            // Queue subsequent requests while refresh is in progress
            return new Promise((resolve, reject) => {
               failedQueue.push({ resolve, reject });
            }).then((token) => {
               originalRequest.headers.Authorization = `Bearer ${token}`;
               return apiClient(originalRequest);
            });
         }

         originalRequest._retry = true;
         isRefreshing = true;

         try {
            // Use plain axios to avoid infinite interceptor loop
            const res = await axios.post(
               `${import.meta.env.VITE_API_BASE_URL}/auth/refresh-token`,
               { refresh_token: store.refreshToken }
            );

            // Handle double .data if your backend wraps response in { data: {...} }
            const newAccessToken = res.data?.data?.access_token;
            const newRefreshToken = res.data?.data?.refresh_token;

            if (!newAccessToken) throw new Error("Failed to refresh token");

            // Update Zustand store
            useAuthStore.getState().updateAccessToken(newAccessToken);
            if (newRefreshToken) {
               useAuthStore.getState().setAuth({
                  ...store,
                  access_token: newAccessToken,
                  refresh_token: newRefreshToken,
               });
            }

            // Process queued requests
            processQueue(null, newAccessToken);

            // Retry original request
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return apiClient(originalRequest);
         } catch (refreshError) {
            processQueue(refreshError, null);

            // Clear auth and persisted storage
            useAuthStore.getState().clearAuth();

            window.location.href = "/";
            return Promise.reject(refreshError);
         } finally {
            isRefreshing = false;
         }
      }

      // If not 401 or refresh not possible, reject
      return Promise.reject(error);
   }
);

export default apiClient;
