import React from "react";
import styles from "./About.module.css";
import { Target, Eye, Users, Building2 } from "lucide-react";

const About = () => {
   return (
      <div className={styles.about}>
         {/* Hero Section */}
         <header className={styles.hero}>
            <div>
               <h1 className={styles.heroTitle}>About Engda Marefya</h1>
               <p className={styles.heroSubtitle}>
                  Revolutionizing the hospitality industry in Ethiopia by
                  connecting guests with their perfect stays.
               </p>
            </div>
         </header>

         {/* Mission & Vision */}
         <section className={styles.section}>
            <div className={styles.missionGrid}>
               <div className={styles.missionCard}>
                  <div className={styles.cardIcon}>
                     <Target size={24} />
                  </div>
                  <h2 className={styles.cardTitle}>Our Mission</h2>
                  <p className={styles.cardText}>
                     To provide a seamless, reliable, and user-friendly platform
                     that simplifies the hotel booking process for both guests
                     and hotel owners, ensuring memorable experiences and
                     sustainable business growth.
                  </p>
               </div>

               <div className={styles.missionCard}>
                  <div className={styles.cardIcon}>
                     <Eye size={24} />
                  </div>
                  <h2 className={styles.cardTitle}>Our Vision</h2>
                  <p className={styles.cardText}>
                     To become the leading digital hospitality marketplace in
                     East Africa, recognized for innovation, trust, and
                     exceptional service quality.
                  </p>
               </div>
            </div>
         </section>

         {/* Stats Section */}
         <section className={styles.statsSection}>
            <div className={styles.statsGrid}>
               <div className={styles.statItem}>
                  <div className={styles.statNumber}>500+</div>
                  <div className={styles.statLabel}>Partner Hotels</div>
               </div>
               <div className={styles.statItem}>
                  <div className={styles.statNumber}>10k+</div>
                  <div className={styles.statLabel}>Happy Guests</div>
               </div>
               <div className={styles.statItem}>
                  <div className={styles.statNumber}>50+</div>
                  <div className={styles.statLabel}>Cities Covered</div>
               </div>
               <div className={styles.statItem}>
                  <div className={styles.statNumber}>24/7</div>
                  <div className={styles.statLabel}>Customer Support</div>
               </div>
            </div>
         </section>

         {/* Our Story Section */}
         <section className={`${styles.section} ${styles.story}`}>
            <div className={styles.storyContent}>
               <h2 className={styles.storyTitle}>Our Story</h2>
               <p className={styles.storyText}>
                  Founded in 2024, Engda Marefya emerged from a simple desire:
                  to make travel within Ethiopia accessible and stress-free. We
                  saw the gap between beautiful local accommodations and the
                  digital travelers looking for them. Today, we bridge that gap
                  with technology that empowers local businesses and delights
                  travelers.
               </p>
            </div>
         </section>
      </div>
   );
};

export default About;
