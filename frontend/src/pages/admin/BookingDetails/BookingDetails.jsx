import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "../../../api/admin";
import Card from "../../../components/shared/Card/Card";
import LoadingSpinner from "../../../components/shared/Loading/LoadingSpinner";
import {
   User,
   Hotel as HotelIcon,
   Bed,
   Calendar,
   CreditCard,
   MapPin,
   Phone,
   Mail,
   Building,
} from "lucide-react";
import styles from "./BookingDetails.module.css";
import { formatCurrency } from "../../../utils/helpers";

const AdminBookingDetails = () => {
   const { id } = useParams();

   const { data: booking, isLoading } = useQuery({
      queryKey: ["admin-booking-details", id],
      queryFn: () => adminApi.getBookingById(id).then((res) => res.data),
   });

   const totalPrice =
      booking?.nights * booking?.room?.room_type?.price_per_night || 0;
   const tax = totalPrice * 0.1; // 10% tax
   const serviceFee = totalPrice * 0.05;
   const grandTotal = booking?.total_amount || 0;

   if (isLoading) return <LoadingSpinner fullScreen />;
   if (!booking)
      return <div className="p-8 text-center">Booking not found.</div>;

   return (
      <div className={styles.details}>
         {/* Header */}
         <div className={styles.header}>
            <div>
               <div className={styles.breadcrumb}>
                  <Link to="/admin/bookings" className={styles.breadcrumbLink}>
                     Bookings
                  </Link>
                  <span className={styles.breadcrumbSeparator}>/</span>
                  <span
                     className={`${styles.breadcrumbCurrent} dark:text-gray-100`}
                  >
                     {booking.booking_reference}
                  </span>
               </div>
               <h1 className={`${styles.title} dark:text-gray-100`}>
                  Booking Details
                  <span
                     className={`${styles.status} ${
                        styles[`status--${booking.status.toLowerCase()}`]
                     } dark:text-gray-100`}
                  >
                     {booking.status}
                  </span>
               </h1>
            </div>
         </div>

         <div className={styles.grid}>
            {/* Left Column */}
            <div className={styles.section}>
               {/* Guest Information */}
               <Card className={styles.card}>
                  <div className={styles.guestHeader}>
                     <img
                        src={
                           booking.user.profile_pic_url ||
                           `https://ui-avatars.com/api/?name=${booking.user.first_name}+${booking.user.last_name}&background=random`
                        }
                        onError={(e) => {
                           e.target.src = `https://ui-avatars.com/api/?name=${booking.user.first_name}+${booking.user.last_name}&background=random`;
                        }}
                        alt=""
                        className={styles.guestAvatar}
                     />
                     <div className={styles.guestMeta}>
                        <h2 className={styles.cardTitle}>
                           <User size={20} /> Guest Information
                        </h2>
                        <span className={`${styles.guestSubtitle}`}>
                           Personal and contact details
                        </span>
                     </div>
                  </div>
                  <div className={styles.infoGrid}>
                     <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Full Name</span>
                        <span className={styles.infoValue}>
                           {booking.user.first_name} {booking.user.last_name}
                        </span>
                     </div>
                     <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Email Address</span>
                        <span className={styles.infoValue}>
                           <Mail size={14} className="inline mr-1" />
                           {booking.user.email}
                        </span>
                     </div>
                     <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Phone Number</span>
                        <span className={styles.infoValue}>
                           <Phone size={14} />
                           {booking.user.phone_number || "N/A"}
                        </span>
                     </div>
                  </div>
               </Card>

               {/* Hotel & Room Information */}
               <Card className={styles.card}>
                  <h2 className={styles.cardTitle}>
                     <Building size={20} /> Property & Room
                  </h2>
                  <div className={styles.hotelHeader}>
                     <img
                        src={
                           booking.hotel.profile_pic_url ||
                           "https://ui-avatars.com/api/?name=" +
                              booking.hotel.name
                        }
                        alt={booking.hotel.name}
                        className={styles.hotelImage}
                     />
                     <div className={styles.hotelMeta}>
                        <span className={styles.hotelName}>
                           {booking.hotel.name}
                        </span>
                        <span className={styles.hotelLocation}>
                           <MapPin size={14} className="inline mr-1" />
                           {booking.hotel.location}
                        </span>
                     </div>
                  </div>

                  <div className={styles.infoGrid}>
                     <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Room Type</span>
                        <span className={styles.infoValue}>
                           <Bed size={14} className="inline mr-1" />
                           {booking.room.room_type.name}
                        </span>
                     </div>
                     <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Room Number</span>
                        <span className={styles.infoValue}>
                           #{booking.room.room_number}
                        </span>
                     </div>
                     <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Check-in</span>
                        <span className={styles.infoValue}>
                           {new Date(booking.check_in).toLocaleDateString()}
                        </span>
                     </div>
                     <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Check-out</span>
                        <span className={styles.infoValue}>
                           {new Date(booking.check_out).toLocaleDateString()}
                        </span>
                     </div>
                  </div>
               </Card>
            </div>

            {/* Right Column */}
            <div className={styles.section}>
               {/* Stay Summary */}
               <Card className={styles.card}>
                  <h2 className={styles.cardTitle}>
                     <Calendar size={20} /> Stay Summary
                  </h2>
                  <div className={styles.priceList}>
                     <div className={styles.priceRow}>
                        <span>Nights</span>
                        <span>{booking.nights}</span>
                     </div>
                     <div className={styles.priceRow}>
                        <span>Rate / Night</span>
                        <span>{formatCurrency(totalPrice)}</span>
                     </div>
                     <div className={styles.priceRow}>
                        <span>Tax</span>
                        <span>{formatCurrency(tax)}</span>
                     </div>
                     <div className={styles.priceRow}>
                        <span>Service Fee</span>
                        <span>{formatCurrency(serviceFee)}</span>
                     </div>
                     <div className={styles.priceTotal}>
                        <span>Grand Total</span>
                        <span>{formatCurrency(grandTotal)}</span>
                     </div>
                  </div>
               </Card>

               {/* Payment Info */}
               <Card className={styles.card}>
                  <h2 className={styles.cardTitle}>
                     <CreditCard size={20} /> Payment Status
                  </h2>
                  <div className={styles.infoGrid}>
                     <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Status</span>
                        <span className={styles.infoValue}>
                           {booking.status}
                        </span>
                     </div>
                     <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Reference</span>
                        <span className={styles.infoValue}>
                           {booking.booking_reference}
                        </span>
                     </div>
                  </div>
               </Card>
            </div>
         </div>
      </div>
   );
};

export default AdminBookingDetails;
