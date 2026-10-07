import { useState, useEffect } from "react";
import { MapPin, Calendar, Users } from "lucide-react";
import Button from "../../shared/Button/Button";
import styles from "./SearchForm.module.css";

const SearchForm = ({
   initialValues = {},
   onSubmit,
   className = "",
   layout = "horizontal",
   showLabels = false,
}) => {
   const [searchParams, setSearchParams] = useState(() => {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      return {
         location: "",
         checkIn: today.toISOString().split("T")[0],
         checkOut: tomorrow.toISOString().split("T")[0],
         guests: 1,
         ...initialValues,
      };
   });

   // Update only when initialValues changes meaningfully
   useEffect(() => {
      const hasChanged = Object.keys(initialValues).some(
         (key) => searchParams[key] !== initialValues[key]
      );

      if (hasChanged && Object.keys(initialValues).length > 0) {
         const today = new Date();
         const tomorrow = new Date(today);
         tomorrow.setDate(tomorrow.getDate() + 1);

         setSearchParams((prev) => ({
            ...prev,
            location: initialValues.location ?? prev.location,
            checkIn: initialValues.checkIn || today.toISOString().split("T")[0],
            checkOut:
               initialValues.checkOut || tomorrow.toISOString().split("T")[0],
            guests: initialValues.guests || 1,
         }));
      }
   }, [
      initialValues.location,
      initialValues.checkIn,
      initialValues.checkOut,
      initialValues.guests,
   ]);

   const handleSubmit = (e) => {
      e.preventDefault();
      if (onSubmit) {
         onSubmit(searchParams);
      }
   };

   const handleInputChange = (e) => {
      const { name, value } = e.target;
      setSearchParams((prev) => ({ ...prev, [name]: value }));
   };

   const handleIncrementGuests = () => {
      if (searchParams.guests < 10) {
         setSearchParams((prev) => ({ ...prev, guests: prev.guests + 1 }));
      }
   };

   const handleDecrementGuests = () => {
      if (searchParams.guests > 1) {
         setSearchParams((prev) => ({ ...prev, guests: prev.guests - 1 }));
      }
   };

   return (
      <form
         onSubmit={handleSubmit}
         className={`${styles.searchForm} ${styles[layout]} ${className}`}
      >
         <div className={styles.searchForm__grid}>
            {/* Location Field */}
            <div className={styles.searchForm__field}>
               {showLabels && (
                  <label
                     htmlFor="location"
                     className={styles.searchForm__label}
                  >
                     Location
                  </label>
               )}
               <div className={styles.searchForm__inputWrapper}>
                  <MapPin size={20} className={styles.searchForm__icon} />
                  <input
                     id="location"
                     type="text"
                     name="location"
                     value={searchParams.location}
                     onChange={handleInputChange}
                     placeholder="Where are you going?"
                     className={styles.searchForm__input}
                     required
                  />
               </div>
            </div>

            {/* Check-in Field */}
            <div className={styles.searchForm__field}>
               {showLabels && (
                  <label htmlFor="checkIn" className={styles.searchForm__label}>
                     Check-in
                  </label>
               )}
               <div className={styles.searchForm__inputWrapper}>
                  <Calendar size={20} className={styles.searchForm__icon} />
                  <input
                     id="checkIn"
                     type="date"
                     name="checkIn"
                     value={searchParams.checkIn}
                     onChange={handleInputChange}
                     className={styles.searchForm__input}
                     min={new Date().toISOString().split("T")[0]}
                     required
                  />
               </div>
            </div>

            {/* Check-out Field */}
            <div className={styles.searchForm__field}>
               {showLabels && (
                  <label
                     htmlFor="checkOut"
                     className={styles.searchForm__label}
                  >
                     Check-out
                  </label>
               )}
               <div className={styles.searchForm__inputWrapper}>
                  <Calendar size={20} className={styles.searchForm__icon} />
                  <input
                     id="checkOut"
                     type="date"
                     name="checkOut"
                     value={searchParams.checkOut}
                     onChange={handleInputChange}
                     className={styles.searchForm__input}
                     min={
                        searchParams.checkIn ||
                        new Date().toISOString().split("T")[0]
                     }
                     required
                  />
               </div>
            </div>

            {/* Guests Field */}
            <div className={styles.searchForm__field}>
               {showLabels && (
                  <label htmlFor="guests" className={styles.searchForm__label}>
                     Guests
                  </label>
               )}
               <div className={styles.searchForm__inputWrapper}>
                  <Users size={20} className={styles.searchForm__icon} />
                  <div className={styles.searchForm__guestSelector}>
                     <button
                        type="button"
                        onClick={handleDecrementGuests}
                        className={styles.searchForm__guestButton}
                        disabled={searchParams.guests <= 1}
                     >
                        -
                     </button>
                     <span className={styles.searchForm__guestCount}>
                        {searchParams.guests}{" "}
                        {searchParams.guests === 1 ? "Guest" : "Guests"}
                     </span>
                     <button
                        type="button"
                        onClick={handleIncrementGuests}
                        className={styles.searchForm__guestButton}
                        disabled={searchParams.guests >= 10}
                     >
                        +
                     </button>
                  </div>
               </div>
            </div>

            {/* Submit Button */}
            <div className={styles.searchForm__submit}>
               <Button
                  type="submit"
                  variant="primary"
                  size={layout === "vertical" ? "medium" : "large"}
                  fullWidth={layout === "vertical"}
                  className={styles.searchForm__button}
               >
                  Search
               </Button>
            </div>
         </div>
      </form>
   );
};

export default SearchForm;
