import React from "react";
import { useNavigate } from "react-router-dom";
import { ShieldAlert, ArrowLeft, Home } from "lucide-react";
import Button from "../../../components/shared/Button/Button";
import useAuthStore from "../../../store/authStore";
import styles from "./Unauthorized.module.css";

const Unauthorized = () => {
   const navigate = useNavigate();
   const { user, role } = useAuthStore();

   const handleGoBack = () => {
      navigate(-1);
   };

   const handleGoHome = () => {
      // Redirect based on role
      if (role === "admin" || role === "super_admin") {
         navigate("/admin");
      } else if (role === "hotel_owner") {
         navigate("/hotel-owner");
      } else if (role === "customer") {
         navigate("/customer");
      } else {
         navigate("/");
      }
   };

   return (
      <div className={styles.container}>
         <div className={styles.content}>
            <ShieldAlert className={styles.icon} strokeWidth={1.5} />

            <h1 className={styles.title}>Access Denied</h1>

            <p className={styles.description}>
               Sorry, you don't have permission to access this page. This area
               is restricted to authorized users only.
            </p>

            <div className={styles.details}>
               <div className={styles.detailsTitle}>Logged in as</div>
               <div className={styles.detailsText}>
                  {user ? (
                     <>
                        <span className="font-semibold">
                           {user.first_name} {user.last_name}
                        </span>
                        <span className="mx-2">•</span>
                        <span className="capitalize bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-xs">
                           {role?.replace("_", " ")}
                        </span>
                     </>
                  ) : (
                     "Guest"
                  )}
               </div>
            </div>

            <div className={styles.buttons}>
               <Button
                  variant="outline"
                  onClick={handleGoBack}
                  className="flex items-center gap-2"
               >
                  <ArrowLeft size={18} />
                  Go Back
               </Button>

               <Button
                  onClick={handleGoHome}
                  className="flex items-center gap-2"
               >
                  <Home size={18} />
                  Dashboard
               </Button>
            </div>
         </div>
      </div>
   );
};

export default Unauthorized;
