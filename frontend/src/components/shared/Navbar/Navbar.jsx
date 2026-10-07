import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
   Search,
   User,
   MapPin,
   Calendar,
   Moon,
   Sun,
   Menu,
   X,
} from "lucide-react";
import useAuthStore from "../../../store/authStore";
import styles from "./Navbar.module.css";
import classNames from "classnames";
import Button from "../Button/Button";
import useThemeStore from "../../../store/themeStore";
import { useMutation } from "@tanstack/react-query";
import { authApi } from "../../../api/auth";
import { customerApi } from "../../../api/customer";
import AuthModal from "../AuthModal/AuthModal";

const Navbar = () => {
   const [isScrolled, setIsScrolled] = useState(false);
   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
   const { isDarkMode, toggleDarkMode } = useThemeStore();
   const [searchQuery, setSearchQuery] = useState("");
   const [suggestions, setSuggestions] = useState([]);
   const [showSuggestions, setShowSuggestions] = useState(false);
   const {
      isAuthenticated,
      user,
      role,
      clearAuth,
      isAuthModalOpen,
      authModalMode,
      openAuthModal,
      closeAuthModal,
   } = useAuthStore();
   const navigate = useNavigate();
   const location = useLocation();

   // Logout mutation
   const logoutMutation = useMutation({
      mutationFn: () => authApi.logout(),
      onSuccess: () => {
         clearAuth();
         toast.success("Logged out successfully");
         navigate("/");
      },
      onError: () => {
         clearAuth();
         toast.error("Logged out");
         navigate("/");
      },
   });

   const handleLogout = () => {
      logoutMutation.mutate();
   };

   // Handle scroll effect
   useEffect(() => {
      const handleScroll = () => {
         setIsScrolled(window.scrollY > 10);
      };
      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
   }, []);

   // Close mobile menu on route change
   useEffect(() => {
      setIsMobileMenuOpen(false);
   }, [location.pathname]);

   const handleSearch = (e) => {
      e.preventDefault();
      if (searchQuery.trim()) {
         navigate(`/room-types?search=${encodeURIComponent(searchQuery)}`);
      }
   };

   const toggleMobileMenu = () => {
      setIsMobileMenuOpen(!isMobileMenuOpen);
   };

   // Fetch suggestions
   useEffect(() => {
      const timer = setTimeout(async () => {
         if (searchQuery.length > 1 && showSuggestions) {
            try {
               const response = await customerApi.getLocations({
                  search: searchQuery,
               });
               // Handle response which could be array of strings or objects
               let data = response.data;
               // If response has a data property (nested), use it
               if (response && response.data) data = response.data;

               if (Array.isArray(data)) {
                  const formattedSuggestions = data.map((item, index) => {
                     if (typeof item === "string") {
                        return { display_name: item, place_id: `loc-${index}` };
                     }
                     // Assume object has 'location' or similar field
                     return {
                        display_name: item.location || item,
                        place_id: `loc-${index}`,
                     };
                  });
                  setSuggestions(formattedSuggestions);
               }
            } catch (error) {
               console.error("Failed to fetch suggestions", error);
            }
         }
      }, 500);

      return () => clearTimeout(timer);
   }, [searchQuery, showSuggestions]);

   const handleSelectSuggestion = (suggestion) => {
      setSearchQuery(suggestion.display_name);
      setShowSuggestions(false);
   };

   const getDashboardLink = () => {
      switch (role) {
         case "customer":
            return "/customer";
         case "hotel_owner":
            return "/hotel-owner";
         case "admin":
            return "/admin";
         case "super_admin":
            return "/admin";
         default:
            return "/";
      }
   };

   const navLinks = [
      { path: "/", label: "Home" },
      { path: "/room-types", label: "Find Rooms" },
      { path: "/about", label: "About" },
      { path: "/contact", label: "Contact" },
   ];

   // Use global store actions instead of local function
   // But we might want to keep closeMobileMenu logic
   const handleOpenAuthModal = (mode = "login") => {
      openAuthModal(mode);
      setIsMobileMenuOpen(false);
   };

   // ... existing authLinks logic ...

   const authLinks = isAuthenticated ? (
      <div className="flex items-center gap-4">
         <div className="relative group">
            <button
               onClick={() => navigate(getDashboardLink())}
               className={styles.navbar__userButton}
               aria-label="User menu"
            >
               <div className={styles.navbar__userAvatar}>
                  {user?.profile_pic_url ? (
                     <img
                        src={user?.profile_pic_url}
                        alt="User"
                        className={styles.navbar__userAvatarImage}
                     />
                  ) : (
                     <User size={20} />
                  )}
               </div>
               <span className={styles.navbar__userName}>
                  {user?.first_name || "User"}
               </span>
            </button>
            <div className={styles.navbar__dropdown}>
               <Link
                  to={getDashboardLink()}
                  className={styles.navbar__dropdownItem}
               >
                  Dashboard
               </Link>
               <Link to="/profile" className={styles.navbar__dropdownItem}>
                  Profile
               </Link>
               <button
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                  className={classNames(
                     styles.navbar__dropdownItem,
                     styles["navbar__dropdownItem--logout"]
                  )}
               >
                  Logout
               </button>
            </div>
         </div>
      </div>
   ) : (
      <div className="flex items-center gap-3">
         <Button
            variant="ghost"
            size="small"
            onClick={() => handleOpenAuthModal("login")}
            className="hidden sm:inline-flex"
         >
            Sign In
         </Button>
         <Button
            variant="primary"
            size="small"
            onClick={() => handleOpenAuthModal("signup")}
         >
            Sign Up
         </Button>
      </div>
   );

   return (
      <>
         <nav
            className={classNames(
               styles.navbar,
               isScrolled && styles["navbar--scrolled"],
               "dark:bg-gray-900 dark:border-gray-800"
            )}
         >
            <div className={styles.navbar__container}>
               {/* Logo */}
               <Link to="/" className={styles.navbar__logo}>
                  <div className={styles.navbar__logoIcon}>
                     <MapPin size={24} />
                  </div>
                  <span className={styles.navbar__logoText}>EngdaMarefya</span>
               </Link>

               {/* Search Bar */}
               <form onSubmit={handleSearch} className={styles.navbar__search}>
                  <div className={styles.navbar__searchWrapper}>
                     <Search size={18} className={styles.navbar__searchIcon} />
                     <input
                        type="text"
                        placeholder="Search rooms by location"
                        value={searchQuery}
                        onChange={(e) => {
                           setSearchQuery(e.target.value);
                           setShowSuggestions(true);
                        }}
                        onFocus={() => setShowSuggestions(true)}
                        onBlur={() =>
                           setTimeout(() => setShowSuggestions(false), 200)
                        }
                        className={styles.navbar__searchInput}
                     />
                     <button
                        type="submit"
                        className={styles.navbar__searchButton}
                        aria-label="Search"
                     >
                        Search
                     </button>
                  </div>
                  {showSuggestions && suggestions.length > 0 && (
                     <div className={styles.suggestionsList}>
                        {suggestions.map((item) => (
                           <div
                              key={item.place_id}
                              className={styles.suggestionItem}
                              onClick={() => handleSelectSuggestion(item)}
                           >
                              <MapPin
                                 size={16}
                                 className={styles.suggestionIcon}
                              />
                              <span className="truncate">
                                 {item.display_name}
                              </span>
                           </div>
                        ))}
                     </div>
                  )}
               </form>

               {/* Desktop Navigation */}
               <div className={styles.navbar__desktopNav}>
                  <div className={styles.navbar__links}>
                     {navLinks.map((link) => (
                        <Link
                           key={link.path}
                           to={link.path}
                           className={classNames(
                              styles.navbar__link,
                              location.pathname === link.path &&
                                 styles["navbar__link--active"]
                           )}
                        >
                           {link.label}
                        </Link>
                     ))}
                  </div>

                  <div className="flex items-center gap-4">
                     <button
                        onClick={toggleDarkMode}
                        className={styles.navbar__themeToggle}
                        aria-label={
                           isDarkMode
                              ? "Switch to light mode"
                              : "Switch to dark mode"
                        }
                     >
                        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                     </button>
                     {authLinks}
                  </div>
               </div>

               {/* Mobile menu button */}
               <button
                  onClick={toggleMobileMenu}
                  className={styles.navbar__mobileToggle}
                  aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
               >
                  {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
               </button>
            </div>
         </nav>

         {/* Mobile menu */}
         <div
            className={classNames(
               styles.navbar__mobileMenu,
               isMobileMenuOpen && styles["navbar__mobileMenu--open"],
               "dark:bg-gray-900"
            )}
         >
            <div className={styles.navbar__mobileMenuContent}>
               {/* Search in mobile */}
               <form onSubmit={handleSearch} className="mb-6">
                  <div className={styles.navbar__mobileSearch}>
                     <Search
                        size={18}
                        className={styles.navbar__mobileSearchIcon}
                     />
                     <input
                        type="text"
                        placeholder="Search rooms..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={styles.navbar__mobileSearchInput}
                     />
                  </div>
               </form>

               {/* Mobile links */}
               <div className={styles.navbar__mobileLinks}>
                  {navLinks.map((link) => (
                     <Link
                        key={link.path}
                        to={link.path}
                        className={classNames(
                           styles.navbar__mobileLink,
                           location.pathname === link.path &&
                              styles["navbar__mobileLink--active"]
                        )}
                        onClick={() => setIsMobileMenuOpen(false)}
                     >
                        {link.label}
                     </Link>
                  ))}
               </div>

               {/* Mobile auth links */}
               <div className={styles.navbar__mobileAuth}>
                  {isAuthenticated ? (
                     <>
                        <Link
                           to={getDashboardLink()}
                           className={styles.navbar__mobileAuthLink}
                           onClick={() => setIsMobileMenuOpen(false)}
                        >
                           <Calendar size={18} />
                           Dashboard
                        </Link>

                        <button
                           onClick={() => {
                              handleLogout();
                              setIsMobileMenuOpen(false);
                           }}
                           disabled={logoutMutation.isPending}
                           className={classNames(
                              styles.navbar__mobileAuthLink,
                              styles["navbar__mobileAuthLink--logout"]
                           )}
                        >
                           Logout
                        </button>
                     </>
                  ) : (
                     <>
                        <Button
                           variant="ghost"
                           fullWidth
                           onClick={() => handleOpenAuthModal("login")}
                           className="mb-3"
                        >
                           Sign In
                        </Button>
                        <Button
                           variant="primary"
                           fullWidth
                           onClick={() => handleOpenAuthModal("signup")}
                        >
                           Sign Up
                        </Button>
                     </>
                  )}
               </div>

               {/* Theme toggle in mobile */}
               <button
                  onClick={toggleDarkMode}
                  className={styles.navbar__mobileThemeToggle}
               >
                  {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                  <span>{isDarkMode ? "Light Mode" : "Dark Mode"}</span>
               </button>
            </div>
         </div>
         <AuthModal
            isOpen={isAuthModalOpen}
            onClose={closeAuthModal}
            initialMode={authModalMode}
         />
      </>
   );
};

export default Navbar;
