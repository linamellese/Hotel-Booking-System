import React from "react";
import { Link } from "react-router-dom";
import styles from "./Footer.module.css";
import { Facebook, Instagram, Linkedin, MapPin, Twitter } from "lucide-react";

const Footer = ({
   variant = "default",
   className = "",
   showSocial = true,
   showNewsletter = false,
   showLinks = true,
}) => {
   const currentYear = new Date().getFullYear();

   // Common links for all variants
   const links = [
      { label: "About", to: "/about" },
      { label: "Contact", to: "/contact" },
      { label: "Privacy Policy", to: "/privacy" },
      { label: "Terms", to: "/terms" },
      { label: "Help", to: "/help" },
   ];

   // Social media icons
   const socialLinks = [
      { icon: <Facebook />, label: "Facebook", url: "https://facebook.com" },
      { icon: <Twitter />, label: "Twitter", url: "https://twitter.com" },
      { icon: <Instagram />, label: "Instagram", url: "https://instagram.com" },
      { icon: <Linkedin />, label: "LinkedIn", url: "https://linkedin.com" },
   ];

   // Render based on variant
   if (variant === "minimal") {
      return (
         <footer className={`${styles.footer} ${styles.minimal} ${className}`}>
            <div className={styles.container}>
               <div className={styles.minimalContent}>
                  <div className={styles.logo}>
                     <span className={styles.logoIcon}>
                        <MapPin />
                     </span>
                     <span className={styles.logoText}>EngdaMarefya</span>
                  </div>
                  <div className={styles.copyright}>
                     © {currentYear} EngdaMarefya. All rights reserved.
                  </div>
               </div>
            </div>
         </footer>
      );
   }

   if (variant === "dashboard") {
      return (
         <footer
            className={`${styles.footer} ${styles.dashboard} ${className}`}
         >
            <div className={styles.container}>
               <div className={styles.dashboardContent}>
                  <div className={styles.dashboardLeft}>
                     <span>EngdaMarefya Dashboard</span>
                     <span className={styles.version}>v2.0.1</span>
                  </div>
                  <div className={styles.dashboardRight}>
                     <span>© {currentYear}</span>
                     <div className={styles.dashboardLinks}>
                        <Link to="/terms">Terms</Link>
                        <Link to="/privacy">Privacy</Link>
                     </div>
                  </div>
               </div>
            </div>
         </footer>
      );
   }

   // Default variant
   return (
      <footer
         className={`${styles.footer} ${styles.default} ${className} dark:bg-gray-900 dark:text-gray-300`}
      >
         <div className={styles.container}>
            {/* Top section with logo and description */}
            <div className={styles.topSection}>
               <div className={styles.logoSection}>
                  <div className={styles.logo}>
                     <span className={styles.logoIcon}>
                        <MapPin />
                     </span>
                     <span className={styles.logoText}>EngdaMarefya</span>
                  </div>
                  <p className={styles.description}>
                     Find your perfect stay. Book with confidence.
                  </p>
               </div>

               {/* Links section */}
               {showLinks && (
                  <div className={styles.linksSection}>
                     <div className={styles.linkGroup}>
                        <h4 className={styles.linkTitle}>Company</h4>
                        {links.slice(0, 3).map((link, index) => (
                           <Link
                              key={index}
                              to={link.to}
                              className={styles.link}
                           >
                              {link.label}
                           </Link>
                        ))}
                     </div>
                     <div className={styles.linkGroup}>
                        <h4 className={styles.linkTitle}>Legal</h4>
                        {links.slice(3).map((link, index) => (
                           <Link
                              key={index}
                              to={link.to}
                              className={styles.link}
                           >
                              {link.label}
                           </Link>
                        ))}
                     </div>
                  </div>
               )}
            </div>

            {/* Divider */}
            <div className={styles.divider}></div>

            {/* Bottom section */}
            <div className={styles.bottomSection}>
               <div className={styles.copyright}>
                  © {currentYear} HotelBooking. All rights reserved.
               </div>

               {/* Social links */}
               {showSocial && (
                  <div className={styles.socialLinks}>
                     {socialLinks.map((social, index) => (
                        <a
                           key={index}
                           href={social.url}
                           target="_blank"
                           rel="noopener noreferrer"
                           className={styles.socialLink}
                           aria-label={social.label}
                           title={social.label}
                        >
                           {social.icon}
                        </a>
                     ))}
                  </div>
               )}

               {/* Newsletter signup */}
               {showNewsletter && (
                  <div className={styles.newsletter}>
                     <p>Get the best deals</p>
                     <form className={styles.newsletterForm}>
                        <input
                           type="email"
                           placeholder="Your email"
                           className={styles.newsletterInput}
                        />
                        <button
                           type="submit"
                           className={styles.newsletterButton}
                        >
                           Subscribe
                        </button>
                     </form>
                  </div>
               )}
            </div>
         </div>
      </footer>
   );
};

export default Footer;
