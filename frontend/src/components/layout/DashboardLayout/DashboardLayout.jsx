import { useState } from "react";
import PropTypes from "prop-types";
import { Outlet } from "react-router-dom";
import useAuthStore from "../../../store/authStore";
import styles from "./DashboardLayout.module.css";
import Sidebar from "../../shared/Sidebar/Sidebar";
import classNames from "classnames";
import { Moon, Sun } from "lucide-react";
import useThemeStore from "../../../store/themeStore";

const DashboardLayout = ({ menuItems, role, title = "Dashboard" }) => {
   const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
   const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);
   const user = useAuthStore((state) => state.user);
   const { isDarkMode, toggleDarkMode } = useThemeStore();

   const handleSidebarToggle = () => {
      setSidebarCollapsed(!sidebarCollapsed);
   };

   const handleMobileToggle = (open) => {
      setSidebarMobileOpen(open !== undefined ? open : !sidebarMobileOpen);
   };

   const handleMenuItemClick = (item) => {
      if (window.innerWidth < 769) {
         setSidebarMobileOpen(false);
      }
   };

   const getGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) return "Good morning";
      if (hour < 18) return "Good afternoon";
      return "Good evening";
   };

   return (
      <div className={styles.dashboard}>
         {/* Sidebar */}
         <Sidebar
            menuItems={menuItems}
            role={role}
            collapsed={sidebarCollapsed}
            mobileOpen={sidebarMobileOpen}
            onCollapseToggle={handleSidebarToggle}
            onMobileToggle={handleMobileToggle}
            onMenuItemClick={handleMenuItemClick}
         />

         {/* Main Content */}
         <div
            className={classNames(
               styles.dashboard__main,
               sidebarCollapsed && styles["dashboard__main--collapsed"]
            )}
         >
            {/* Top Header */}
            <header className={styles.dashboard__header}>
               <div className={styles.dashboard__headerContents}>
                  <h1 className={styles.dashboard__title}>{title}</h1>
                  <p className={styles.dashboard__greeting}>
                     {getGreeting()},{" "}
                     <span className="font-semibold">
                        {user?.first_name || "User"}
                     </span>
                  </p>
               </div>
               <button
                  onClick={toggleDarkMode}
                  className={styles.navbar__themeToggle}
                  aria-label={
                     isDarkMode ? "Switch to light mode" : "Switch to dark mode"
                  }
               >
                  {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
               </button>
            </header>

            {/* Main Content Area */}
            <main className={styles.dashboard__content}>
               <Outlet />
            </main>

            {/* Footer */}
            <footer className={styles.dashboard__footer}>
               <div className={styles.dashboard__footerContent}>
                  <p className={styles.dashboard__footerText}>
                     © {new Date().getFullYear()} EngdaMarefya. All rights
                     reserved.
                  </p>
                  <div className={styles.dashboard__footerLinks}>
                     <a
                        href="/privacy"
                        className={styles.dashboard__footerLink}
                     >
                        Privacy Policy
                     </a>
                     <a href="/terms" className={styles.dashboard__footerLink}>
                        Terms of Service
                     </a>
                     <a
                        href="/support"
                        className={styles.dashboard__footerLink}
                     >
                        Support
                     </a>
                  </div>
               </div>
            </footer>
         </div>
      </div>
   );
};

DashboardLayout.propTypes = {
   menuItems: PropTypes.arrayOf(
      PropTypes.shape({
         path: PropTypes.string.isRequired,
         label: PropTypes.string.isRequired,
         icon: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
         badge: PropTypes.number,
      })
   ).isRequired,
   role: PropTypes.oneOf(["customer", "hotel_owner", "admin", "super_admin"])
      .isRequired,
   title: PropTypes.string,
};

export default DashboardLayout;
