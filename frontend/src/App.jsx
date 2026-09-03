import { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import Router from "./router";
import ToastWrapper from "./components/shared/ToastWrapper/ToastWrapper";
import useThemeStore from "./store/themeStore";

export default function App() {
   const { isDarkMode } = useThemeStore();

   useEffect(() => {
      if (isDarkMode) {
         document.documentElement.classList.add("dark");
      } else {
         document.documentElement.classList.remove("dark");
      }
   }, [isDarkMode]);

   return (
      <>
         <ToastWrapper>
            <Toaster
               position="top-right"
               toastOptions={{
                  duration: 4000,
                  success: {
                     style: {
                        background: "#10b981",
                        color: "white",
                     },
                  },
                  error: {
                     style: {
                        background: "#ef4444",
                        color: "white",
                     },
                  },
               }}
            />
            <Router />
         </ToastWrapper>
      </>
   );
}
