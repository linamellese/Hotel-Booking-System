import React, { useState } from "react";
import styles from "./Contact.module.css";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { toast } from "react-hot-toast";

const Contact = () => {
   const [formData, setFormData] = useState({
      name: "",
      email: "",
      subject: "",
      message: "",
   });

   const handleSubmit = (e) => {
      e.preventDefault();
      // Simulate form submission
      toast.success("Message sent successfully! We'll get back to you soon.");
      setFormData({ name: "", email: "", subject: "", message: "" });
   };

   const handleChange = (e) =>
      setFormData({ ...formData, [e.target.name]: e.target.value });

   return (
      <div className={styles.contact}>
         <div className={styles.container}>
            <header className={styles.header}>
               <h1 className={styles.title}>Get in Touch</h1>
               <p className={styles.subtitle}>
                  Have questions or feedback? We'd love to hear from you. Our
                  team is here to help.
               </p>
            </header>

            <div className={styles.layout}>
               {/* Contact Info */}
               <aside className={styles.contactInfoCard}>
                  <div className={styles.infoItem}>
                     <div className={styles.infoIcon}>
                        <MapPin size={24} />
                     </div>
                     <div>
                        <span className={styles.infoLabel}>Visit Us</span>
                        <p className={styles.infoValue}>
                           Bole Atlas, 4th Floor
                           <br />
                           Addis Ababa, Ethiopia
                        </p>
                     </div>
                  </div>

                  <div className={styles.infoItem}>
                     <div className={styles.infoIcon}>
                        <Phone size={24} />
                     </div>
                     <div>
                        <span className={styles.infoLabel}>Call Us</span>
                        <p className={styles.infoValue}>+251 911 234 567</p>
                        <p className={styles.infoValue}>+251 116 789 012</p>
                     </div>
                  </div>

                  <div className={styles.infoItem}>
                     <div className={styles.infoIcon}>
                        <Mail size={24} />
                     </div>
                     <div>
                        <span className={styles.infoLabel}>Email Us</span>
                        <p className={styles.infoValue}>
                           support@engdamarefya.com
                        </p>
                        <p className={styles.infoValue}>
                           partners@engdamarefya.com
                        </p>
                     </div>
                  </div>
               </aside>

               {/* Contact Form */}
               <section className={styles.formCard}>
                  <form onSubmit={handleSubmit}>
                     <div className={styles.formGrid}>
                        <div className={styles.formGroup}>
                           <label className={styles.label}>Name</label>
                           <input
                              type="text"
                              name="name"
                              required
                              value={formData.name}
                              onChange={handleChange}
                              className={styles.input}
                              placeholder="Your name"
                           />
                        </div>
                        <div className={styles.formGroup}>
                           <label className={styles.label}>Email</label>
                           <input
                              type="email"
                              name="email"
                              required
                              value={formData.email}
                              onChange={handleChange}
                              className={styles.input}
                              placeholder="your@email.com"
                           />
                        </div>
                     </div>

                     <div className={styles.formGroup}>
                        <label className={styles.label}>Subject</label>
                        <input
                           type="text"
                           name="subject"
                           required
                           value={formData.subject}
                           onChange={handleChange}
                           className={styles.input}
                           placeholder="How can we help?"
                        />
                     </div>

                     <div className={styles.formGroup}>
                        <label className={styles.label}>Message</label>
                        <textarea
                           name="message"
                           required
                           value={formData.message}
                           onChange={handleChange}
                           className={styles.textarea}
                           placeholder="Tell us more about your inquiry..."
                        />
                     </div>

                     <button type="submit" className={styles.submitButton}>
                        <span
                           style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "8px",
                           }}
                        >
                           <Send size={18} />
                           Send Message
                        </span>
                     </button>
                  </form>
               </section>
            </div>
         </div>
      </div>
   );
};

export default Contact;
