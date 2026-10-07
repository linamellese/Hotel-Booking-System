import PropTypes from "prop-types";
import { NavLink, useNavigate } from "react-router-dom";
import {
   ChevronLeft,
   ChevronRight,
   Home,
   Building,
   Users,
   LogOut,
   Menu,
   X,
} from "lucide-react";
import useAuthStore from "../../../store/authStore";
import { authApi } from "../../../api/auth";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import styles from "./Sidebar.module.css";
import classNames from "classnames";

const Sidebar = ({
   menuItems,
   onMenuItemClick,
   role,
   collapsed,
   mobileOpen,
   onCollapseToggle,
   onMobileToggle,
}) => {
   const clearAuth = useAuthStore((state) => state.clearAuth);
   const user = useAuthStore((state) => state.user);
   const navigate = useNavigate();

   const logoutMutation = useMutation({
      mutationFn: () => authApi.logout(),
      onSuccess: () => {
         clearAuth();
         toast.success("Logged out successfully");
         navigate("/", { replace: true });
      },
      onError: () => {
         clearAuth();
         toast.error("Logged out");
         navigate("/", { replace: true });
      },
   });

   const handleLogout = () => {
      logoutMutation.mutate();
   };

   const handleNavClick = () => {
      if (window.innerWidth < 769) {
         onMobileToggle(false);
      }
   };

   const sidebarClasses = classNames(
      styles.sidebar,
      collapsed && styles["sidebar--collapsed"],
      mobileOpen && styles["sidebar--mobileOpen"]
   );

   return (
      <>
         {/* Mobile menu button */}
         <button
            onClick={() => onMobileToggle(!mobileOpen)}
            className={classNames(
               styles.sidebar__mobileToggle,
               "md:hidden fixed top-4 left-4 z-50"
            )}
         >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
         </button>

         {/* Overlay for mobile */}
         {mobileOpen && (
            <div
               className={styles.sidebar__overlay}
               onClick={() => onMobileToggle(false)}
            />
         )}

         {/* Sidebar */}
         <aside className={sidebarClasses}>
            <div className={styles.sidebar__inner}>
               {/* Logo and toggle */}
               <div className={styles.sidebar__header}>
                  {!collapsed || mobileOpen ? (
                     <div className={styles.sidebar__logo}>
                        <Building
                           size={24}
                           className={styles.sidebar__logoIcon}
                        />
                        <h2 className={styles.sidebar__logoText}>
                           {role === "customer" && "EngdaMarefya"}
                           {role === "hotel_owner" && "Hotel Owner"}
                           {role === "admin" && "Admin Panel"}
                           {role === "super_admin" && "Super Admin"}
                        </h2>
                     </div>
                  ) : (
                     <div className={styles.sidebar__logoCollapsed}>
                        <Building size={24} />
                     </div>
                  )}
                  <button
                     onClick={onCollapseToggle}
                     className={styles.sidebar__toggle}
                     aria-label={
                        collapsed ? "Expand sidebar" : "Collapse sidebar"
                     }
                  >
                     {collapsed ? (
                        <ChevronRight size={20} />
                     ) : (
                        <ChevronLeft size={20} />
                     )}
                  </button>
               </div>

               {/* Navigation */}
               <nav className={styles.sidebar__nav}>
                  <ul className={styles.sidebar__menu}>
                     {menuItems.map((item) => (
                        <li
                           key={item.path}
                           className={styles.sidebar__menuItem}
                        >
                           <NavLink
                              to={item.path}
                              end
                              onClick={() => {
                                 handleNavClick();
                                 onMenuItemClick?.(item);
                              }}
                              className={({ isActive }) =>
                                 classNames(
                                    styles.sidebar__link,
                                    isActive && styles["sidebar__link--active"]
                                 )
                              }
                           >
                              <span className={styles.sidebar__linkIcon}>
                                 {item.icon ? item.icon : <Home size={20} />}
                              </span>
                              {!collapsed || mobileOpen ? (
                                 <span className={styles.sidebar__linkText}>
                                    {item.label}
                                 </span>
                              ) : null}
                              {item.badge && !collapsed && (
                                 <span className={styles.sidebar__badge}>
                                    {item.badge}
                                 </span>
                              )}
                           </NavLink>
                        </li>
                     ))}
                  </ul>
               </nav>

               {/* User section */}
               <div className={styles.sidebar__user}>
                  <div
                     className={styles.sidebar__userInfo}
                     onClick={() => {
                        handleNavClick();
                        navigate(
                           `/${
                              role === "customer"
                                 ? "customer"
                                 : role === "hotel_owner"
                                 ? "hotel-owner"
                                 : role === "admin"
                                 ? "admin"
                                 : "admin"
                           }/profile`
                        );
                     }}
                  >
                     {!collapsed || mobileOpen ? (
                        <>
                           <div className={styles.sidebar__userAvatar}>
                              {user?.profile_pic_url ? (
                                 <img
                                    src={user?.profile_pic_url}
                                    alt="User"
                                    className={styles.sidebar__userAvatarImage}
                                 />
                              ) : (
                                 <Users size={24} />
                              )}
                           </div>
                           <div className={styles.sidebar__userDetails}>
                              <p className={styles.sidebar__userName}>
                                 {user?.first_name || "User"}
                              </p>
                              <p className={styles.sidebar__userRole}>
                                 {role?.replace("_", " ").toUpperCase()}
                              </p>
                           </div>
                        </>
                     ) : null}
                  </div>

                  {/* Logout button */}
                  <button
                     onClick={handleLogout}
                     className={classNames(
                        styles.sidebar__logout,
                        collapsed && styles["sidebar__logout--collapsed"]
                     )}
                     disabled={logoutMutation.isLoading}
                  >
                     <LogOut size={20} />
                     {!collapsed && (
                        <span className={styles.sidebar__logoutText}>
                           {logoutMutation.isLoading
                              ? "Logging out..."
                              : "Logout"}
                        </span>
                     )}
                  </button>
               </div>
            </div>
         </aside>
      </>
   );
};

Sidebar.propTypes = {
   menuItems: PropTypes.arrayOf(
      PropTypes.shape({
         path: PropTypes.string.isRequired,
         label: PropTypes.string.isRequired,
         icon: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
         badge: PropTypes.number,
      })
   ).isRequired,
   onMenuItemClick: PropTypes.func,
   role: PropTypes.string.isRequired,
   collapsed: PropTypes.bool.isRequired,
   mobileOpen: PropTypes.bool.isRequired,
   onCollapseToggle: PropTypes.func.isRequired,
   onMobileToggle: PropTypes.func.isRequired,
};

export default Sidebar;
