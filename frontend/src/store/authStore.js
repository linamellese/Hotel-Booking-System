// src/store/useAuthStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";

const useAuthStore = create(
   persist(
      (set, get) => ({
         user: null,
         accessToken: null,
         refreshToken: null,
         isAuthenticated: false,
         role: null,
         hasHydrated: false,

         setAuth: (data) =>
            set({
               user: data.user,
               accessToken: data.access_token,
               refreshToken: data.refresh_token,
               isAuthenticated: true,
               role: data.user.role,
            }),

         updateAccessToken: (accessToken) => set({ accessToken }),

         updateUser: (userData) =>
            set((state) => ({
               user: { ...state.user, ...userData },
            })),

         clearAuth: async () => {
            set({
               user: null,
               accessToken: null,
               refreshToken: null,
               isAuthenticated: false,
               role: null,
            });

            // Remove persisted state from localStorage
            const persistStorageKey = "auth-storage";
            localStorage.removeItem(persistStorageKey);
         },

         setHasHydrated: () => set({ hasHydrated: true }),

         // UI State for AuthModal
         isAuthModalOpen: false,
         authModalMode: "login", // 'login' or 'signup'
         openAuthModal: (mode = "login") =>
            set({ isAuthModalOpen: true, authModalMode: mode }),
         closeAuthModal: () => set({ isAuthModalOpen: false }),
      }),
      {
         name: "auth-storage",
         partialize: (state) => ({
            user: state.user,
            role: state.role,
            accessToken: state.accessToken,
            refreshToken: state.refreshToken,
            isAuthenticated: state.isAuthenticated,
            // Don't persist UI state
         }),
         onRehydrateStorage: () => (state) => {
            state?.setHasHydrated();
         },
      }
   )
);

export default useAuthStore;
