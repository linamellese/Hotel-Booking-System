import { useEffect } from "react";
import PropTypes from "prop-types";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import styles from "./ToastWrapper.module.css";
import classNames from "classnames";

// Custom toast component
const CustomToast = ({ toastType, title, message, onClose }) => {
   const getIcon = () => {
      switch (toastType) {
         case "success":
            return "✅";
         case "error":
            return "❌";
         case "warning":
            return "⚠️";
         case "info":
            return "ℹ️";
         default:
            return "💡";
      }
   };

   const getStyles = () => {
      switch (toastType) {
         case "success":
            return styles.toast__success;
         case "error":
            return styles.toast__error;
         case "warning":
            return styles.toast__warning;
         case "info":
            return styles.toast__info;
         default:
            return styles.toast__default;
      }
   };

   return (
      <div className={classNames(styles.toast, getStyles())}>
         <div className={styles.toast__content}>
            <div className={styles.toast__icon}>{getIcon()}</div>
            <div className={styles.toast__message}>
               {title && <div className={styles.toast__title}>{title}</div>}
               <div className={styles.toast__description}>{message}</div>
            </div>
         </div>
         <button
            onClick={onClose}
            className={styles.toast__close}
            aria-label="Close notification"
         >
            ✕
         </button>
      </div>
   );
};

CustomToast.propTypes = {
   toastType: PropTypes.oneOf([
      "success",
      "error",
      "warning",
      "info",
      "default",
   ]),
   title: PropTypes.string,
   message: PropTypes.string.isRequired,
   onClose: PropTypes.func.isRequired,
};

// Global error handler
const setupGlobalErrorHandling = (queryClient) => {
   // Handle unhandled promise rejections
   window.addEventListener("unhandledrejection", (event) => {
      console.error("Unhandled rejection:", event.reason);

      if (event.reason?.response?.data?.message) {
         toast.error(event.reason.response.data.message);
      } else if (event.reason?.message) {
         toast.error(event.reason.message);
      } else {
         toast.error("An unexpected error occurred");
      }
   });

   // Handle network errors
   window.addEventListener("offline", () => {
      toast.error("You are offline. Please check your internet connection.");
   });

   window.addEventListener("online", () => {
      toast.success("You are back online!");
   });

   // Setup React Query error handler
   queryClient.setDefaultOptions({
      queries: {
         onError: (error) => {
            if (error.response?.status !== 401) {
               const message =
                  error.response?.data?.message || "Failed to fetch data";
               toast.error(message);
            }
         },
      },
      mutations: {
         onError: (error) => {
            if (error.response?.status !== 401) {
               const message =
                  error.response?.data?.message || "Operation failed";
               toast.error(message);
            }
         },
      },
   });
};

// Toast methods
export const showToast = {
   success: (message, options = {}) => {
      toast.custom(
         (t) => (
            <CustomToast
               toastType="success"
               title={options.title || "Success!"}
               message={message}
               onClose={() => toast.dismiss(t.id)}
            />
         ),
         {
            duration: options.duration || 4000,
            position: options.position || "top-right",
         }
      );
   },

   error: (message, options = {}) => {
      toast.custom(
         (t) => (
            <CustomToast
               toastType="error"
               title={options.title || "Error!"}
               message={message}
               onClose={() => toast.dismiss(t.id)}
            />
         ),
         {
            duration: options.duration || 5000,
            position: options.position || "top-right",
         }
      );
   },

   warning: (message, options = {}) => {
      toast.custom(
         (t) => (
            <CustomToast
               toastType="warning"
               title={options.title || "Warning!"}
               message={message}
               onClose={() => toast.dismiss(t.id)}
            />
         ),
         {
            duration: options.duration || 4000,
            position: options.position || "top-right",
         }
      );
   },

   info: (message, options = {}) => {
      toast.custom(
         (t) => (
            <CustomToast
               toastType="info"
               title={options.title || "Information"}
               message={message}
               onClose={() => toast.dismiss(t.id)}
            />
         ),
         {
            duration: options.duration || 3000,
            position: options.position || "top-right",
         }
      );
   },

   loading: (message, options = {}) => {
      return toast.loading(message, {
         duration: options.duration || 3000,
         position: options.position || "top-right",
      });
   },

   dismiss: (toastId) => {
      toast.dismiss(toastId);
   },

   remove: () => {
      toast.remove();
   },
};

// Main ToastWrapper component
const ToastWrapper = ({ children }) => {
   const queryClient = useQueryClient();

   useEffect(() => {
      setupGlobalErrorHandling(queryClient);

      // Show welcome toast on first load
      const hasSeenWelcome = sessionStorage.getItem("hasSeenWelcome");
      if (!hasSeenWelcome) {
         setTimeout(() => {
            showToast.info("Welcome to Hotel Booking System!");
            sessionStorage.setItem("hasSeenWelcome", "true");
         }, 1000);
      }

      // Cleanup
      return () => {
         toast.remove();
      };
   }, [queryClient]);

   return <>{children}</>;
};

ToastWrapper.propTypes = {
   children: PropTypes.node.isRequired,
};

export default ToastWrapper;
