import { create } from "zustand";
import { persist } from "zustand/middleware";

const useThemeStore = create(
   persist(
      (set) => ({
         isDarkMode: false,
         toggleDarkMode: () =>
            set((state) => ({ isDarkMode: !state.isDarkMode })),
         setDarkMode: (value) => set({ isDarkMode: value }),
      }),
      {
         name: "theme-storage",
      }
   )
);

export default useThemeStore;
