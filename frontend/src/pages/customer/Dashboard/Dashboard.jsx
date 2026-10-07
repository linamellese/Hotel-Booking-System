import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { customerApi } from "../../../api/customer";
import useAuthStore from "../../../store/authStore";
import Card from "../../../components/shared/Card/Card";
import LoadingSpinner from "../../../components/shared/Loading/LoadingSpinner";
import styles from "./Dashboard.module.css";
import { formatCurrency } from "../../../utils/helpers";

const Dashboard = () => {
   const { user } = useAuthStore();

   // Fetch recent bookings
   const { data: recentBookings, isLoading: isLoadingBookings } = useQuery({
      queryKey: ["customer-recent-bookings"],
      queryFn: async () => {
         const response = await customerApi.getBookings(user.id, { limit: 5 });
         return response.data.bookings;
      },
   });

   return (
      <div className={styles.dashboard}>
         {/* Welcome Section */}
         <div className={`${styles.dashboard__welcome} mb-8`}>
            <h1 className={styles.dashboard__title}>
               Welcome back,{" "}
               <span className={styles.dashboard__userName}>
                  {user?.first_name}!
               </span>
            </h1>
            <p className={styles.dashboard__subtitle}>
               Here's what's happening with your bookings and account.
            </p>
         </div>

         {/* Quick Actions */}
         <div className={`${styles.dashboard__quickActions} mb-8`}>
            <div className={styles.dashboard__quickActionsGrid}>
               <Link
                  to="/room-types"
                  className={styles.dashboard__quickActionCard}
               >
                  <div className={styles.dashboard__quickActionIcon}>🔍</div>
                  <h3 className={styles.dashboard__quickActionTitle}>
                     Find Rooms
                  </h3>
                  <p className={styles.dashboard__quickActionDesc}>
                     Search and book new accommodations
                  </p>
               </Link>

               <Link
                  to="/customer/bookings"
                  className={styles.dashboard__quickActionCard}
               >
                  <div className={styles.dashboard__quickActionIcon}>📋</div>
                  <h3 className={styles.dashboard__quickActionTitle}>
                     View All Bookings
                  </h3>
                  <p className={styles.dashboard__quickActionDesc}>
                     Check all your reservations
                  </p>
               </Link>

               <Link
                  to="/customer/profile"
                  className={styles.dashboard__quickActionCard}
               >
                  <div className={styles.dashboard__quickActionIcon}>👤</div>
                  <h3 className={styles.dashboard__quickActionTitle}>
                     Update Profile
                  </h3>
                  <p className={styles.dashboard__quickActionDesc}>
                     Manage your personal information
                  </p>
               </Link>
            </div>
         </div>

         {/* Recent Bookings */}
         <div className={styles.dashboard__recentBookings}>
            <div className={styles.dashboard__sectionHeader}>
               <h2 className={styles.dashboard__sectionTitle}>
                  Recent Bookings
               </h2>
               <Link
                  to="/customer/bookings"
                  className={styles.dashboard__viewAllLink}
               >
                  View All →
               </Link>
            </div>

            {isLoadingBookings ? (
               <div className={styles.dashboard__loading}>
                  <LoadingSpinner />
               </div>
            ) : recentBookings?.length > 0 ? (
               <div className={styles.dashboard__bookingsList}>
                  {recentBookings.map((booking) => (
                     <Card
                        key={booking.id}
                        className={styles.dashboard__bookingCard}
                     >
                        <div className={styles.dashboard__bookingHeader}>
                           <div>
                              <h3 className={styles.dashboard__bookingTitle}>
                                 {booking.room_type_name}
                              </h3>
                              <p className={styles.dashboard__bookingHotel}>
                                 {booking.hotel_name} • {booking.hotel_location}
                              </p>
                           </div>
                           <span
                              className={`${styles.dashboard__bookingStatus} ${
                                 styles[
                                    `dashboard__bookingStatus--${booking.status}`
                                 ]
                              }`}
                           >
                              {booking.status}
                           </span>
                        </div>

                        <div className={styles.dashboard__bookingDetails}>
                           <div className={styles.dashboard__bookingDetail}>
                              <span className={styles.dashboard__bookingLabel}>
                                 Check-in:
                              </span>
                              <span className={styles.dashboard__bookingValue}>
                                 {new Date(
                                    booking.check_in
                                 ).toLocaleDateString()}
                              </span>
                           </div>
                           <div className={styles.dashboard__bookingDetail}>
                              <span className={styles.dashboard__bookingLabel}>
                                 Check-out:
                              </span>
                              <span className={styles.dashboard__bookingValue}>
                                 {new Date(
                                    booking.check_out
                                 ).toLocaleDateString()}
                              </span>
                           </div>
                           <div className={styles.dashboard__bookingDetail}>
                              <span className={styles.dashboard__bookingLabel}>
                                 Room Number:
                              </span>
                              <span className={styles.dashboard__bookingValue}>
                                 {booking.room_number}
                              </span>
                           </div>
                           <div className={styles.dashboard__bookingDetail}>
                              <span className={styles.dashboard__bookingLabel}>
                                 Total:
                              </span>
                              <span
                                 className={`${styles.dashboard__bookingValue} ${styles.dashboard__bookingPrice}`}
                              >
                                 {formatCurrency(booking.total_amount)}
                              </span>
                           </div>
                        </div>

                        <div className={styles.dashboard__bookingActions}>
                           <Link
                              to={`/customer/bookings/${booking.id}`}
                              className={styles.dashboard__bookingAction}
                           >
                              View Details
                           </Link>
                        </div>
                     </Card>
                  ))}
               </div>
            ) : (
               <div className={styles.dashboard__emptyState}>
                  <div className={styles.dashboard__emptyIcon}>📋</div>
                  <h3 className={styles.dashboard__emptyTitle}>
                     No Bookings Yet
                  </h3>
                  <p className={styles.dashboard__emptyDesc}>
                     Start your journey by booking your first stay!
                  </p>
                  <Link
                     to="/room-types"
                     className={styles.dashboard__emptyAction}
                  >
                     Find Rooms
                  </Link>
               </div>
            )}
         </div>
      </div>
   );
};

export default Dashboard;
