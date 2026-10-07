import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { customerApi } from "../../../api/customer";
import Card from "../../../components/shared/Card/Card";
import Button from "../../../components/shared/Button/Button";
import LoadingSpinner from "../../../components/shared/Loading/LoadingSpinner";
import Modal from "../../../components/shared/Modal/Modal";
import styles from "./BookingDetails.module.css";
import { Bed, Hotel, MapPin, Star } from "lucide-react";
import { formatCurrency } from "../../../utils/helpers";
import { showToast } from "../../../components/shared/ToastWrapper/ToastWrapper";
import useAuthStore from "../../../store/authStore";

const BookingDetails = () => {
   const { id } = useParams();
   const navigate = useNavigate();

   // Rating & Review
   const [rating, setRating] = useState(0);
   const [comment, setComment] = useState("");
   const [hoveredRating, setHoveredRating] = useState(0);

   // Modals
   const [showCancelModal, setShowCancelModal] = useState(false);
   const [showPayModal, setShowPayModal] = useState(false);
   const [showReceipt, setShowReceipt] = useState(false);

   // Location state
   const [from, setFrom] = useState(null);

   // Fetch booking details
   const {
      data: booking,
      isLoading,
      refetch,
   } = useQuery({
      queryKey: ["booking-details", id],
      queryFn: async () => {
         const response = await customerApi.getBookingDetails(id);

         return response.data;
      },
      enabled: Boolean(id),
   });

   // Cancel booking mutation
   const cancelMutation = useMutation({
      mutationFn: () => customerApi.cancelBooking(id),
      onSuccess: () => {
         toast.success("Booking cancelled successfully");
         setShowCancelModal(false);
         navigate("/customer/bookings");
      },
   });

   // Pay for booking mutation
   const paymentMutation = useMutation({
      mutationFn: async () => {
         const response = await customerApi.payForBooking(id);
         return response.data;
      },
      onSuccess: (data) => {
         setShowPayModal(false);
         showToast.info("Confirm payment to confirm booking");
         window.open(data.checkout_url, "_blank");
         refetch();
      },
   });

   // Add review mutation
   const reviewMutation = useMutation({
      mutationFn: async () => {
         const response = await customerApi.addReview(id, {
            rating,
            comment,
         });
         return response.data;
      },
      onSuccess: () => {
         toast.success("Review added successfully");
         setRating(0);
         setComment("");
      },
      onError: () => {
         toast.error("you already added review");
         setRating(0);
         setComment("");
      },
   });

   useEffect(() => {
      setFrom(location.pathname);
   }, []);

   // Print receipt function
   const handlePrintReceipt = () => {
      setShowReceipt(true);
      // make only print the receipt
      setTimeout(() => {
         window.print();
         setShowReceipt(false);
      }, 100);
   };

   // Navigate to room details page
   const handleRoomClick = (roomId) => {
      // add state to know where it come from
      navigate(`/room-types/${roomId}`, {
         state: { from: from },
      });
   };

   // Submit review function
   const handleSubmitReview = () => {
      if (rating === 0) {
         toast.error("Please select a rating");
         return;
      }
      if (!comment) {
         toast.error("Please write a comment");
         return;
      }
      reviewMutation.mutate();
   };

   const totalPrice =
      booking?.nights * booking?.room?.room_type?.price_per_night || 0;
   const tax = totalPrice * 0.1; // 10% tax
   const serviceFee = totalPrice * 0.05;
   const grandTotal = booking?.total_amount || 0;

   if (isLoading) {
      return <LoadingSpinner fullScreen />;
   }

   if (!booking) {
      return (
         <div className={styles.bookingDetails__error}>
            <div className={styles.bookingDetails__errorIcon}>❌</div>
            <h2 className={styles.bookingDetails__errorTitle}>
               Booking Not Found
            </h2>
            <p className={styles.bookingDetails__errorMessage}>
               The booking you're looking for doesn't exist or you don't have
               permission to view it.
            </p>
            <Link
               to="/customer/bookings"
               className={styles.bookingDetails__errorButton}
            >
               Back to Bookings
            </Link>
         </div>
      );
   }

   // Calculate nights
   const checkInDate = new Date(booking.check_in);
   const checkOutDate = new Date(booking.check_out);
   const nights = Math.ceil(
      (checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)
   );

   // Status badges configuration
   const statusConfig = {
      pending: { label: "Pending", color: "amber", icon: "⏳" },
      paid: { label: "paid", color: "green", icon: "✅" },
   };

   const statusInfo = statusConfig[booking.status] || statusConfig.pending;

   return (
      <div className={styles.bookingDetails}>
         {/* Header */}
         <div className={styles.bookingDetails__header}>
            <div>
               <div className={styles.bookingDetails__breadcrumb}>
                  <Link
                     to="/customer/bookings"
                     className={styles.bookingDetails__breadcrumbLink}
                  >
                     Bookings
                  </Link>
                  <span className={styles.bookingDetails__breadcrumbSeparator}>
                     /
                  </span>
                  <span className={styles.bookingDetails__breadcrumbCurrent}>
                     {booking.booking_reference}
                  </span>
               </div>
               <h1 className={styles.bookingDetails__title}>
                  Booking Details
                  <span
                     className={`${styles.bookingDetails__status} ${
                        styles[`bookingDetails__status--${statusInfo.color}`]
                     }`}
                  >
                     {statusInfo.icon} {statusInfo.label}
                  </span>
               </h1>
            </div>
            <div className={styles.bookingDetails__headerActions}>
               {booking.status === "pending" && (
                  <>
                     <Button
                        variant="outline"
                        onClick={() => setShowPayModal(true)}
                     >
                        Pay Now
                     </Button>
                     <Button
                        variant="danger"
                        onClick={() => setShowCancelModal(true)}
                     >
                        Cancel Booking
                     </Button>
                  </>
               )}
               {booking.status === "paid" && (
                  <Button onClick={() => handlePrintReceipt()}>
                     Print Receipt
                  </Button>
               )}
            </div>
         </div>

         <div className={styles.bookingDetails__grid}>
            {/* Left Column - Booking Info */}
            <div className={styles.bookingDetails__column}>
               {/* Hotel Info Card */}
               <Card className={styles.bookingDetails__card}>
                  <div className={styles.bookingDetails__cardHeader}>
                     <h2 className={styles.bookingDetails__cardTitle}>
                        Hotel Information
                     </h2>
                  </div>

                  <div className={styles.bookingDetails__hotelInfo}>
                     <div className={styles.bookingDetails__hotelHeader}>
                        <div className={styles.bookingDetails__hotelImage}>
                           {booking.hotel?.profile_pic_url ? (
                              <img
                                 src={booking.hotel?.profile_pic_url}
                                 alt={booking.hotel.name}
                                 className={styles.bookingDetails__hotelImg}
                              />
                           ) : (
                              <div
                                 className={
                                    styles.bookingDetails__hotelPlaceholder
                                 }
                              >
                                 🏨
                              </div>
                           )}
                        </div>
                        <div>
                           <h3 className={styles.bookingDetails__hotelName}>
                              {booking.hotel.name}
                           </h3>
                           <p className={styles.bookingDetails__hotelLocation}>
                              {booking.hotel.contact_number}
                           </p>
                           <p className={styles.bookingDetails__hotelLocation}>
                              {booking.hotel.location}
                           </p>

                           <div className={styles.bookingDetails__hotelRating}>
                              {"⭐".repeat(
                                 Math.floor(booking.hotel?.average_rating || 5)
                              )}
                              <span
                                 className={styles.bookingDetails__ratingText}
                              >
                                 {booking.hotel?.average_rating || 5}
                              </span>
                           </div>
                        </div>
                     </div>
                  </div>
               </Card>

               {/* Room Details Card */}
               <Card
                  className={styles.roomCard}
                  onClick={() => handleRoomClick(booking.room.room_type.id)}
               >
                  <div className={styles.roomCard__image}>
                     <img
                        src={
                           booking.room.room_type.main_image_url ||
                           "https://images.unsplash.com/photo-1611892440504-42a792e24d32?ixlib=rb-4.0.3"
                        }
                        alt={booking.room.room_type.name}
                        className={styles.roomCard__img}
                     />
                     <div className={styles.roomCard__badge}>
                        <Star size={12} fill="currentColor" />
                        <span>
                           {booking.room.room_type.average_rating || 5}
                        </span>
                     </div>
                  </div>
                  <div className={styles.roomCard__content}>
                     <div className={styles.roomCard__header}>
                        <h3 className={styles.roomCard__title}>
                           {booking.room.room_type.name}
                        </h3>
                        <p className={styles.roomCard__bedType}>
                           <span className={styles.roomCard__numberOfBed}>
                              {booking.room.room_type.number_of_beds}
                           </span>
                           <Bed size={14} />
                           {booking.room.room_type.bed_type
                              .charAt(0)
                              .toUpperCase() +
                              booking.room.room_type.bed_type.slice(1)}{" "}
                           Bed
                        </p>
                     </div>
                     <p className={styles.roomCard__location}>
                        <MapPin size={14} />
                        {booking.hotel.location}
                     </p>

                     <div className={styles.roomCard__location}>
                        <Hotel size={14} />
                        {booking.hotel.name}
                     </div>
                     <div className={styles.roomCard__footer}>
                        <div>
                           <span className={styles.roomCard__price}>
                              ${booking.room.room_type.price_per_night}
                           </span>
                           <span className={styles.roomCard__period}>
                              {" "}
                              / night
                           </span>
                        </div>
                        <Button
                           variant="outline"
                           size="small"
                           onClick={() =>
                              handleRoomClick(booking.room.room_type.id)
                           }
                        >
                           View Details
                        </Button>
                     </div>
                  </div>
               </Card>

               {/* Rating & Review Section */}
               {booking.status === "paid" && (
                  <Card className={styles.reviewCard}>
                     <h2 className={styles.reviewCard__title}>
                        Rate Your Stay
                     </h2>

                     {/* Star Rating */}
                     <div className={styles.reviewCard__stars}>
                        {[1, 2, 3, 4, 5].map((star) => (
                           <Star
                              key={star}
                              size={28}
                              className={`${styles.reviewCard__star} ${
                                 (hoveredRating || rating) >= star
                                    ? styles.reviewCard__starActive
                                    : ""
                              }`}
                              onMouseEnter={() => setHoveredRating(star)}
                              onMouseLeave={() => setHoveredRating(0)}
                              onClick={() => setRating(star)}
                           />
                        ))}
                        <span className={styles.reviewCard__ratingText}>
                           {rating ? `${rating}/5` : "Select rating"}
                        </span>
                     </div>

                     {/* Comment Box */}
                     <textarea
                        className={styles.reviewCard__textarea}
                        placeholder="Share your experience with this room..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows={4}
                     />

                     {/* Submit */}
                     <div className={styles.reviewCard__actions}>
                        <Button variant="primary" onClick={handleSubmitReview}>
                           Submit Review
                        </Button>
                     </div>
                  </Card>
               )}
            </div>

            {/* Right Column - Booking Summary */}
            <div className={styles.bookingDetails__column}>
               {/* Booking Summary Card */}
               <Card className={styles.bookingDetails__card}>
                  <h2 className={styles.bookingDetails__cardTitle}>
                     Booking Summary
                  </h2>

                  <div className={styles.bookingDetails__summary}>
                     <div className={styles.bookingDetails__summaryItem}>
                        <span className={styles.bookingDetails__summaryLabel}>
                           Confirmation #
                        </span>
                        <span className={styles.bookingDetails__summaryValue}>
                           {booking?.booking_reference}
                        </span>
                     </div>

                     <div className={styles.bookingDetails__summaryItem}>
                        <span className={styles.bookingDetails__summaryLabel}>
                           Booking Date
                        </span>
                        <span className={styles.bookingDetails__summaryValue}>
                           {new Date(booking.created_at).toLocaleDateString()}
                        </span>
                     </div>

                     <div className={styles.bookingDetails__summaryItem}>
                        <span className={styles.bookingDetails__summaryLabel}>
                           Check-in
                        </span>
                        <span className={styles.bookingDetails__summaryValue}>
                           {new Date(booking.check_in).toLocaleDateString()} at
                           3:00 PM
                        </span>
                     </div>

                     <div className={styles.bookingDetails__summaryItem}>
                        <span className={styles.bookingDetails__summaryLabel}>
                           Check-out
                        </span>
                        <span className={styles.bookingDetails__summaryValue}>
                           {new Date(booking.check_out).toLocaleDateString()} at
                           11:00 AM
                        </span>
                     </div>

                     <div className={styles.bookingDetails__summaryItem}>
                        <span className={styles.bookingDetails__summaryLabel}>
                           Duration
                        </span>
                        <span className={styles.bookingDetails__summaryValue}>
                           {nights} {nights === 1 ? "night" : "nights"}
                        </span>
                     </div>
                  </div>
               </Card>

               {/* Price Breakdown Card */}
               <Card className={styles.bookingDetails__card}>
                  <h2 className={styles.bookingDetails__cardTitle}>
                     Price Breakdown
                  </h2>
                  <div className={styles.priceBreakdown}>
                     <div className={styles.priceBreakdown__item}>
                        <span>
                           {formatCurrency(
                              booking.room.room_type.price_per_night
                           )}{" "}
                           × {booking.nights} nights
                        </span>
                        <span>{formatCurrency(totalPrice)}</span>
                     </div>
                     <div className={styles.priceBreakdown__item}>
                        <span>Tax (10%)</span>
                        <span>{formatCurrency(tax)}</span>
                     </div>
                     <div className={styles.priceBreakdown__item}>
                        <span>Service Fee (5%)</span>
                        <span>{formatCurrency(serviceFee)}</span>
                     </div>
                     <div className={styles.priceBreakdown__total}>
                        <span>Total</span>
                        <span>{formatCurrency(grandTotal)}</span>
                     </div>
                  </div>
               </Card>

               {/* Support Card */}
               <Card className={styles.bookingDetails__card}>
                  <h2 className={styles.bookingDetails__cardTitle}>
                     Need Help?
                  </h2>

                  <div className={styles.bookingDetails__supportInfo}>
                     <p className={styles.bookingDetails__supportText}>
                        Our customer support team is available 24/7 to assist
                        you.
                     </p>

                     <div className={styles.bookingDetails__supportActions}>
                        <Button
                           variant="outline"
                           onClick={() => window.open("tel:+11234567890")}
                        >
                           Call Support
                        </Button>
                     </div>

                     <div className={styles.bookingDetails__cancellationPolicy}>
                        <h4 className={styles.bookingDetails__policyTitle}>
                           Cancellation Policy
                        </h4>
                        <p className={styles.bookingDetails__policyText}>
                           Free cancellation up to 48 hours before check-in.
                           After that, 50% of the total amount will be charged.
                        </p>
                     </div>
                  </div>
               </Card>
            </div>
         </div>

         {/* Cancel Booking Modal */}
         <Modal
            isOpen={showCancelModal}
            onClose={() => {
               setShowCancelModal(false);
            }}
            title="Cancel Booking"
            size="md"
         >
            <div className={styles.bookings__cancelModalContent}>
               <p className={styles.bookings__cancelWarning}>
                  Are you sure you want to cancel this booking?
               </p>

               <div className={styles.bookings__cancelDetails}>
                  <div className={styles.bookings__cancelDetail}>
                     <span className={styles.bookings__cancelLabel}>
                        Hotel:
                     </span>
                     <span className={styles.bookings__cancelValue}>
                        {booking.hotel.name}
                     </span>
                  </div>
                  <div className={styles.bookings__cancelDetail}>
                     <span className={styles.bookings__cancelLabel}>Room:</span>
                     <span className={styles.bookings__cancelValue}>
                        {booking.room.room_type.name} (Room #{" "}
                        {booking.room.room_number})
                     </span>
                  </div>
                  <div className={styles.bookings__cancelDetail}>
                     <span className={styles.bookings__cancelLabel}>
                        Dates:
                     </span>
                     <span className={styles.bookings__cancelValue}>
                        {new Date(booking.check_in).toLocaleDateString()} -{" "}
                        {new Date(booking.check_out).toLocaleDateString()}
                     </span>
                  </div>
                  <div className={styles.bookings__cancelDetail}>
                     <span className={styles.bookings__cancelLabel}>
                        Total:
                     </span>
                     <span className={styles.bookings__cancelValue}>
                        {formatCurrency(booking.total_amount)}
                     </span>
                  </div>
                  <div className={styles.bookings__cancelDetail}>
                     <span className={styles.bookings__cancelLabel}>
                        Reference:
                     </span>
                     <span className={styles.bookings__cancelValue}>
                        {booking.booking_reference}
                     </span>
                  </div>
               </div>

               <div className={styles.bookings__cancelPolicy}>
                  <h4 className={styles.bookings__cancelPolicyTitle}>
                     Cancellation Policy
                  </h4>
                  <p className={styles.bookings__cancelPolicyText}>
                     Cancellations made within 48 hours of check-in may be
                     subject to a fee. Please check your booking confirmation
                     for specific cancellation terms.
                  </p>
               </div>

               <div className={styles.bookings__cancelActions}>
                  <Button
                     variant="outline"
                     onClick={() => {
                        setShowCancelModal(false);
                     }}
                     loading={cancelMutation.isLoading}
                  >
                     Keep Booking
                  </Button>
                  <Button
                     variant="danger"
                     onClick={() => cancelMutation.mutate()}
                     loading={cancelMutation.isLoading}
                  >
                     Cancel Booking
                  </Button>
               </div>
            </div>
         </Modal>

         {/* Pay Now Modal */}
         <Modal
            isOpen={showPayModal}
            onClose={() => {
               setShowPayModal(false);
            }}
            title="Pay for Booking"
            size="md"
         >
            <div className={styles.bookings__paymentModalContent}>
               <p className={styles.bookings__paymentNotice}>
                  Are you sure you want to pay for this booking?
               </p>

               <div className={styles.bookings__paymentDetails}>
                  <div className={styles.bookings__paymentDetail}>
                     <span className={styles.bookings__paymentLabel}>
                        Hotel:
                     </span>
                     <span className={styles.bookings__paymentValue}>
                        {booking.hotel.name}
                     </span>
                  </div>

                  <div className={styles.bookings__paymentDetail}>
                     <span className={styles.bookings__paymentLabel}>
                        Room:
                     </span>
                     <span className={styles.bookings__paymentValue}>
                        {booking.room.room_type.name} (Room #
                        {booking.room.room_number})
                     </span>
                  </div>

                  <div className={styles.bookings__paymentDetail}>
                     <span className={styles.bookings__paymentLabel}>
                        Dates:
                     </span>
                     <span className={styles.bookings__paymentValue}>
                        {new Date(booking.check_in).toLocaleDateString()} –{" "}
                        {new Date(booking.check_out).toLocaleDateString()}
                     </span>
                  </div>

                  <div className={styles.bookings__paymentDetail}>
                     <span className={styles.bookings__paymentLabel}>
                        Total:
                     </span>
                     <span className={styles.bookings__paymentValue}>
                        {formatCurrency(booking.total_amount)}
                     </span>
                  </div>

                  <div className={styles.bookings__paymentDetail}>
                     <span className={styles.bookings__paymentLabel}>
                        Reference:
                     </span>
                     <span className={styles.bookings__paymentValue}>
                        {booking.booking_reference}
                     </span>
                  </div>
               </div>

               <div className={styles.bookings__paymentPolicy}>
                  <h4 className={styles.bookings__paymentPolicyTitle}>
                     Payment Policy
                  </h4>
                  <p className={styles.bookings__paymentPolicyText}>
                     Please pay for your booking to confirm your stay.
                  </p>
               </div>

               <div className={styles.bookings__paymentActions}>
                  <Button
                     variant="outline"
                     onClick={() => setShowPayModal(false)}
                     loading={paymentMutation.isLoading}
                  >
                     Cancel
                  </Button>

                  <Button
                     variant="primary"
                     onClick={() => {
                        paymentMutation.mutate();
                     }}
                     loading={paymentMutation.isLoading}
                  >
                     Pay Now
                  </Button>
               </div>
            </div>
         </Modal>

         {/* Receipt for printing */}
         {showReceipt && (
            <div className={styles.receiptPrint}>
               <div className={styles.receipt}>
                  {/* Header */}
                  <div className={styles.receipt__header}>
                     <h2 className={styles.receipt__title}>Engda Marefya</h2>
                     <p className={styles.receipt__subtitle}>
                        Official Receipt
                     </p>
                  </div>

                  <div className={styles.receipt__divider} />

                  {/* Meta */}
                  <div className={styles.receipt__meta}>
                     <div className={styles.receipt__row}>
                        <span>Booking Date</span>
                        <span>
                           {new Date(booking.created_at).toLocaleDateString()}
                        </span>
                     </div>
                     <div className={styles.receipt__row}>
                        <span>Booking Reference</span>
                        <span>{booking.booking_reference}</span>
                     </div>
                  </div>

                  <div className={styles.receipt__divider} />

                  {/* Details */}
                  <div className={styles.receipt__details}>
                     <div className={styles.receipt__row}>
                        <span>Room Type</span>
                        <span>{booking.room.room_type.name}</span>
                     </div>
                     <div className={styles.receipt__row}>
                        <span>Check-in</span>
                        <span>
                           {new Date(booking.check_in).toLocaleDateString()}
                        </span>
                     </div>
                     <div className={styles.receipt__row}>
                        <span>Check-out</span>
                        <span>
                           {new Date(booking.check_out).toLocaleDateString()}
                        </span>
                     </div>
                     <div className={styles.receipt__row}>
                        <span>Nights</span>
                        <span>{booking.nights}</span>
                     </div>
                     <div className={styles.receipt__row}>
                        <span>Price / Night</span>
                        <span>
                           {booking.room.room_type.price_per_night} ETB
                        </span>
                     </div>
                  </div>

                  <div className={styles.receipt__divider} />

                  {/* Total */}
                  <div className={styles.receipt__total}>
                     <span className={styles.receipt__totalLabel}>TOTAL</span>
                     <span className={styles.receipt__totalAmount}>
                        {formatCurrency(booking.total_amount)}
                     </span>
                  </div>

                  <div className={styles.receipt__divider} />

                  {/* Footer */}
                  <div className={styles.receipt__footer}>
                     <p>Thank you for your booking</p>
                     <p>Powered by {booking.hotel.name}</p>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
};

export default BookingDetails;
