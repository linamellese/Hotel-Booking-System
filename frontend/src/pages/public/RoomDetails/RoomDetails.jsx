import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { MapContainer, TileLayer, Marker, LayersControl } from "react-leaflet";
import L from "leaflet";

// Fix for missing marker icons
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
   iconUrl: icon,
   shadowUrl: iconShadow,
   iconSize: [25, 41],
   iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

import {
   MapPin,
   Star,
   Users,
   Bed,
   Share2,
   Heart,
   Calendar,
   CheckCircle,
   XCircle,
   Clock,
   ChevronLeft,
   Phone,
   Building,
} from "lucide-react";
import toast from "react-hot-toast";
import { customerApi } from "../../../api/customer";
import Button from "../../../components/shared/Button/Button";
import Card from "../../../components/shared/Card/Card";
import Modal from "../../../components/shared/Modal/Modal";
import LoadingSpinner from "../../../components/shared/Loading/LoadingSpinner";
import { addDays, formatCurrency, formatDate } from "../../../utils/helpers";
import styles from "./RoomDetails.module.css";
import useAuthStore from "../../../store/authStore";

const RoomDetails = () => {
   const { id } = useParams();
   const navigate = useNavigate();
   const location = useLocation();
   const [showReviews, setShowReviews] = useState(false);
   const [showBookingModal, setShowBookingModal] = useState(false);
   const [selectedImage, setSelectedImage] = useState(0);
   const [bookingData, setBookingData] = useState({
      checkIn: "",
      checkOut: "",
      roomId: "",
   });
   const [isInWishlist, setIsInWishlist] = useState(false);
   const { isAuthenticated, openAuthModal } = useAuthStore();
   const [pendingAction, setPendingAction] = useState(null); // 'wishlist' | 'booking'

   const reviewsRef = useRef(null);

   // Fetch room details
   const { data: roomType, isLoading } = useQuery({
      queryKey: ["roomTypeDetails", id],
      queryFn: async () => {
         const response = await customerApi.getRoomTypeDetails(id);
         return response.data;
      },
      enabled: Boolean(id),
   });

   // Fetch reviews
   const {
      data: reviews,
      isLoading: isReviewsLoading,
      refetch: fetchReviews,
   } = useQuery({
      queryKey: ["roomTypeReviews", id],
      queryFn: async () => {
         const response = await customerApi.getRoomTypeReviews(id);
         return response.data.reviews;
      },
      enabled: false, // IMPORTANT: fetch only on click
   });

   // Fetch available rooms for selected dates
   const {
      data: availableRooms,
      isLoading: isAvailableRoomsLoading,
      refetch: refetchAvailableRooms,
   } = useQuery({
      queryKey: [
         "availableRooms",
         id,
         bookingData.checkIn,
         bookingData.checkOut,
      ],
      queryFn: async () => {
         if (!bookingData.checkIn || !bookingData.checkOut) {
            return [];
         }
         const response = await customerApi.getAvailableRooms(id, {
            check_in: bookingData.checkIn,
            check_out: bookingData.checkOut,
         });
         return response.data;
      },
      enabled:
         Boolean(bookingData.checkIn) &&
         Boolean(bookingData.checkOut) &&
         Boolean(id),
   });

   // Check if in wishlist
   const { data: wishlistData, refetch: refetchIsInWishlist } = useQuery({
      queryKey: ["isInWishlist", id],
      queryFn: async () => {
         const response = await customerApi.isInWishlist(id);
         return response.data.is_in_wishlist;
      },
      enabled: isAuthenticated && Boolean(id),
   });

   // Add or remove from wishlist mutation
   const wishlistMutation = useMutation({
      mutationFn: () => customerApi.toggleWishlist(id).then((res) => res.data),
      onSuccess: () => {
         refetchIsInWishlist();
         toast.success(
            isInWishlist ? "Removed from wishlist" : "Added to wishlist"
         );
      },
   });

   // Book room mutation
   const bookingMutation = useMutation({
      mutationFn: async (data) => {
         const response = await customerApi.bookRoom(data);
         return response.data;
      },
      onSuccess: () => {
         toast.success("Booking successful!");
         setShowBookingModal(false);
         navigate("/customer/bookings");
      },
   });

   // Set default dates
   useEffect(() => {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const todayStr = today.toISOString().split("T")[0];
      const tomorrowStr = tomorrow.toISOString().split("T")[0];

      setBookingData((prev) => ({
         ...prev,
         checkIn: todayStr,
         checkOut: tomorrowStr,
      }));
   }, []);

   // Refetch available rooms when check-in/check-out changes
   useEffect(() => {
      if (bookingData.checkIn && bookingData.checkOut) {
         refetchAvailableRooms();
      }
   }, [bookingData.checkIn, bookingData.checkOut, refetchAvailableRooms]);

   // Update wishlist status
   useEffect(() => {
      if (wishlistData !== undefined) {
         setIsInWishlist(wishlistData);
      }
   }, [wishlistData]);

   // Scroll to top when page changes
   useEffect(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
   }, []);

   // Scroll to reviews section when showReviews is true
   useEffect(() => {
      if (showReviews && reviewsRef.current) {
         reviewsRef.current.scrollIntoView({ behavior: "smooth" });
      }
   }, [showReviews]);

   // Handle pending actions after login
   useEffect(() => {
      if (isAuthenticated && pendingAction) {
         if (pendingAction === "wishlist") {
            wishlistMutation.mutate();
            setPendingAction(null);
         } else if (pendingAction === "booking") {
            setShowBookingModal(true);
            setPendingAction(null);
         }
      }
   }, [isAuthenticated, pendingAction, wishlistMutation]);

   const handleBookingSubmit = (e) => {
      e.preventDefault();

      if (!bookingData.roomId) {
         toast.error("Please select a room number");
         return;
      }

      const payload = {
         room_id: bookingData.roomId,
         check_in: bookingData.checkIn,
         check_out: bookingData.checkOut,
      };
      bookingMutation.mutate(payload);
   };

   const handleInputChange = (e) => {
      const { name, value } = e.target;

      setBookingData((prev) => {
         // If check-in changes
         if (name === "checkIn") {
            const minCheckOut = addDays(value, 1);

            return {
               ...prev,
               checkIn: value,
               checkOut:
                  !prev.checkOut || prev.checkOut < minCheckOut
                     ? minCheckOut
                     : prev.checkOut,
               roomId: "", // reset selected room
            };
         }

         // If check-out changes
         if (name === "checkOut") {
            const minCheckOut = addDays(prev.checkIn, 1);

            return {
               ...prev,
               checkOut: value < minCheckOut ? minCheckOut : value,
               roomId: "", // reset selected room
            };
         }

         return { ...prev, [name]: value };
      });
   };

   const handleRoomSelection = (roomId) => {
      setBookingData((prev) => ({ ...prev, roomId: roomId }));
   };

   const handleShare = async () => {
      try {
         await navigator.share({
            title: roomType?.name,
            text: `Check out ${roomType?.name} on Hotel Booking System`,
            url: window.location.href,
         });
      } catch (err) {
         // Fallback to clipboard
         await navigator.clipboard.writeText(window.location.href);
         toast.success("Link copied to clipboard!");
      }
   };

   const policies = [
      {
         icon: <CheckCircle size={18} />,
         label: "Free cancellation up to 24 hours before check-in",
      },
      { icon: <XCircle size={18} />, label: "No smoking allowed" },
      {
         icon: <Clock size={18} />,
         label: "Check-in: 2:00 PM, Check-out: 11:00 AM",
      },
   ];

   const totalNights = Math.ceil(
      (new Date(bookingData.checkOut) - new Date(bookingData.checkIn)) /
         (1000 * 60 * 60 * 24)
   );
   const totalPrice = totalNights * roomType?.price_per_night || 0;
   const tax = totalPrice * 0.1; // 10% tax
   const serviceFee = totalPrice * 0.05; // 5% service fee
   const grandTotal = totalPrice + tax + serviceFee;

   if (isLoading) {
      return (
         <div className={styles.loading}>
            <LoadingSpinner size="large" text="Loading room details..." />
         </div>
      );
   }

   if (!roomType) {
      return (
         <div className={styles.notFound}>
            <h2 className={`${styles.notFound__title} dark:text-white`}>
               Room not found
            </h2>
            <Button onClick={() => navigate("/room-types", { replace: true })}>
               Back to Search
            </Button>
         </div>
      );
   }

   return (
      <div className={styles.roomDetails}>
         {/* Back Button */}
         <div className={styles.backButton}>
            <Button
               variant="ghost"
               onClick={() =>
                  navigate(location?.state?.from || "/room-types", {
                     replace: true,
                  })
               }
            >
               <ChevronLeft size={20} />
               Back
            </Button>
         </div>

         {/* Image Gallery */}
         <div className={styles.gallery}>
            <div className={styles.gallery__main}>
               <img
                  src={
                     roomType.images?.[selectedImage]?.image_url ||
                     "https://images.unsplash.com/photo-1611892440504-42a792e24d32?ixlib=rb-4.0.3"
                  }
                  alt={roomType.name}
                  className={styles.gallery__mainImage}
               />
            </div>
            <div className={styles.gallery__thumbnails}>
               {roomType?.images?.slice(0, 4).map((image, index) => (
                  <button
                     key={index}
                     className={`${styles.gallery__thumbnail} ${
                        selectedImage === index
                           ? styles["gallery__thumbnail--active"]
                           : ""
                     }`}
                     onClick={() => setSelectedImage(index)}
                  >
                     <img
                        src={image?.image_url}
                        alt={`${image?.alt_text} ${index + 1}`}
                     />
                  </button>
               ))}
            </div>
         </div>

         <div className={styles.content}>
            {/* Main Content */}
            <div className={styles.mainContent}>
               {/* Header */}
               <div className={styles.header}>
                  <div>
                     <h1 className={styles.title}>{roomType.name}</h1>
                     <div className={styles.location}>
                        <MapPin size={18} />
                        <span>{roomType.hotel?.location}</span>
                     </div>
                     <div className={styles.rating}>
                        <Star size={18} fill="currentColor" />
                        <span>{roomType.average_rating || "4.5"}</span>
                        <span className={styles.reviews}>
                           ({roomType.reviews_count || 24} reviews)
                        </span>
                     </div>
                  </div>
                  <div className={styles.headerActions}>
                     <Button
                        variant="ghost"
                        onClick={handleShare}
                        aria-label="Share"
                     >
                        <Share2 size={20} />
                     </Button>
                     <Button
                        variant="ghost"
                        onClick={() => {
                           if (!isAuthenticated) {
                              setPendingAction("wishlist");
                              openAuthModal("login");
                           } else {
                              wishlistMutation.mutate();
                           }
                        }}
                        loading={wishlistMutation.isLoading}
                        aria-label={
                           isInWishlist ? "In wishlist" : "Add to wishlist"
                        }
                     >
                        <Heart
                           size={20}
                           fill={isInWishlist ? "currentColor" : "none"}
                        />
                     </Button>
                  </div>
               </div>

               {/* Details */}
               <div className={styles.details}>
                  <div className={styles.details__item}>
                     <Bed size={20} />
                     <div>
                        <span className={styles.details__label}>Bed Type</span>
                        <span className={styles.details__value}>
                           {roomType.bed_type || "King Bed"}
                        </span>
                     </div>
                  </div>
                  <div className={styles.details__item}>
                     <Users size={20} />
                     <div>
                        <span className={styles.details__label}>No of Bed</span>
                        <span className={styles.details__value}>
                           {roomType.number_of_beds || 1}
                        </span>
                     </div>
                  </div>
               </div>

               {/* Description */}
               <Card title="Description" className={styles.description}>
                  <p className={styles.description__text}>
                     {roomType.description}
                  </p>
               </Card>

               {/* Amenities */}
               <Card title="Amenities" className={styles.amenities}>
                  <div className={styles.amenities__grid}>
                     {roomType?.amenities.length > 0 ? (
                        roomType?.amenities?.map((amenity, index) => (
                           <div key={index} className={`${styles.amenity}`}>
                              <img
                                 width={20}
                                 height={20}
                                 src={amenity.icon_url}
                                 alt=""
                              />
                              <span>{amenity.name}</span>
                           </div>
                        ))
                     ) : (
                        <>
                           {/* no amenities */}
                           <div
                              className={`${styles.amenity} ${styles["amenity--unavailable"]}`}
                           >
                              <span>No amenities</span>
                           </div>
                        </>
                     )}
                  </div>
               </Card>

               {/* Policies */}
               <Card title="Policies" className={styles.policies}>
                  <ul className={styles.policies__list}>
                     {policies.map((policy, index) => (
                        <li key={index} className={styles.policy}>
                           {policy.icon}
                           <span>{policy.label}</span>
                        </li>
                     ))}
                  </ul>
               </Card>

               {/* Reviews (placeholder) */}
               <Card title="Guest Reviews" className={styles.reviews}>
                  <div className={styles.reviews__summary}>
                     <div className={styles.reviews__rating}>
                        <span className={styles.reviews__ratingValue}>
                           {roomType.average_rating || "4.5"}
                        </span>
                     </div>
                     <div className={styles.reviews__stats}>
                        <div className={styles.reviews__stat}>
                           <span>Review</span>
                           <div className={styles.reviews__bar}>
                              <div
                                 className={styles.reviews__barFill}
                                 style={{
                                    width: roomType.average_rating * 20 + "%",
                                 }}
                              />
                           </div>
                        </div>
                     </div>
                  </div>
                  {!showReviews && (
                     <Button
                        variant="outline"
                        onClick={async () => {
                           setShowReviews(true);
                           await fetchReviews();
                        }}
                     >
                        View Reviews
                     </Button>
                  )}
               </Card>
            </div>

            {/* Booking Sidebar */}
            <div className={styles.sidebar}>
               <Card className={styles.bookingCard}>
                  <div className={styles.bookingCard__header}>
                     <div className={styles.bookingCard__price}>
                        <span className={styles.bookingCard__priceValue}>
                           {formatCurrency(roomType.price_per_night)}
                        </span>
                        <span className={styles.bookingCard__pricePeriod}>
                           per night
                        </span>
                     </div>
                     <div className={styles.bookingCard__availability}>
                        <span className={styles.bookingCard__availabilityBadge}>
                           {isAvailableRoomsLoading
                              ? "Checking availability..."
                              : availableRooms?.length > 0
                              ? `${availableRooms.length} rooms`
                              : "No rooms"}
                        </span>
                     </div>
                  </div>

                  <form
                     onSubmit={(e) => {
                        e.preventDefault();
                        if (!isAuthenticated) {
                           setPendingAction("booking");
                           openAuthModal("login");
                        } else {
                           setShowBookingModal(true);
                        }
                     }}
                     className={styles.bookingForm}
                  >
                     <div className={styles.bookingForm__dates}>
                        <div className={styles.bookingForm__field}>
                           <label className={styles.bookingForm__label}>
                              <Calendar size={16} />
                              Check-in
                           </label>
                           <input
                              type="date"
                              name="checkIn"
                              value={bookingData.checkIn}
                              onChange={handleInputChange}
                              className={styles.bookingForm__input}
                              min={new Date().toISOString().split("T")[0]}
                              required
                           />
                        </div>
                        <div className={styles.bookingForm__field}>
                           <label className={styles.bookingForm__label}>
                              <Calendar size={16} />
                              Check-out
                           </label>
                           <input
                              type="date"
                              name="checkOut"
                              value={bookingData.checkOut}
                              onChange={handleInputChange}
                              className={styles.bookingForm__input}
                              min={
                                 bookingData.checkIn
                                    ? addDays(bookingData.checkIn, 1)
                                    : undefined
                              }
                              required
                           />
                        </div>
                     </div>

                     {/* Price Breakdown */}
                     <div className={styles.priceBreakdown}>
                        <div className={styles.priceBreakdown__item}>
                           <span>
                              {formatCurrency(roomType.price_per_night)} ×{" "}
                              {totalNights} nights
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

                     <Button
                        type="submit"
                        variant="primary"
                        size="large"
                        fullWidth
                        disabled={!availableRooms?.length}
                        className={styles.bookingForm__button}
                     >
                        {availableRooms?.length > 0
                           ? "Select Room & Book"
                           : !bookingData.checkIn || !bookingData.checkOut
                           ? "Select Dates to Check Availability"
                           : "No Rooms Available"}
                     </Button>

                     <p className={styles.bookingForm__note}>
                        You won't be charged yet. Free cancellation available.
                     </p>
                  </form>
               </Card>

               {/* Contact Host */}
               <Card title="Contact Hotel" className={styles.contactCard}>
                  <div className={styles.contactCard__info}>
                     <div className={styles.contactCard__host}>
                        <img
                           src={
                              roomType.hotel?.profile_pic_url ||
                              "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3"
                           }
                           alt={roomType.hotel?.name}
                           className={styles.contactCard__hostImage}
                        />
                        <div>
                           <h4 className={styles.contactCard__hostName}>
                              {roomType.hotel?.name || "Hotel Management"}
                           </h4>
                           <p className={styles.contactCard__hostRole}>
                              Hotel Manager
                           </p>
                           {/* contact info */}
                           <p className={styles.contactCard__contactItem}>
                              <Phone size={16} />
                              {roomType.hotel?.contact_info || "N/A"}
                           </p>
                        </div>
                     </div>
                     <p className={styles.contactCard__response}>
                        <Clock size={16} />
                        Response time: within 1 hour
                     </p>
                  </div>

                  {/* Map Section */}
                  {roomType.hotel?.latitude && roomType.hotel?.longitude && (
                     <div className="mt-4 mb-4 h-48 rounded-lg overflow-hidden border border-gray-200 relative z-0">
                        <MapContainer
                           center={[
                              roomType.hotel.latitude,
                              roomType.hotel.longitude,
                           ]}
                           zoom={15}
                           scrollWheelZoom={true}
                           style={{ height: "100%", width: "100%" }}
                        >
                           <LayersControl position="topright">
                              <LayersControl.BaseLayer checked name="Street">
                                 <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                 />
                              </LayersControl.BaseLayer>
                              <LayersControl.BaseLayer name="Satellite">
                                 <TileLayer
                                    attribution="Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
                                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                                 />
                              </LayersControl.BaseLayer>
                           </LayersControl>
                           <Marker
                              position={[
                                 roomType.hotel.latitude,
                                 roomType.hotel.longitude,
                              ]}
                           />
                        </MapContainer>
                     </div>
                  )}

                  <div className="flex gap-3">
                     <Button variant="outline" fullWidth className="flex-1">
                        Contact Hotel
                     </Button>
                     {roomType.hotel?.latitude && roomType.hotel?.longitude && (
                        <Button
                           fullWidth
                           className="flex-1 bg-green-600 hover:bg-green-700 text-white border-none"
                           onClick={() =>
                              window.open(
                                 `https://www.google.com/maps/dir/?api=1&destination=${roomType.hotel.latitude},${roomType.hotel.longitude}`,
                                 "_blank"
                              )
                           }
                        >
                           <MapPin size={18} className="mr-2" />
                           Go
                        </Button>
                     )}
                  </div>
               </Card>
            </div>
         </div>

         {showReviews && (
            <div ref={reviewsRef} className={styles.reviewsSection}>
               <h2 className={styles.reviewsSection__title}>
                  Guest Reviews ({reviews?.length || 0})
               </h2>

               {isReviewsLoading ? (
                  <LoadingSpinner text="Loading reviews..." />
               ) : reviews?.length > 0 ? (
                  <div className={styles.reviewsList}>
                     {reviews.map((review) => (
                        <div key={review.id} className={styles.playReview}>
                           <div className={styles.playReview__header}>
                              <img
                                 src={review.profile_pic_url}
                                 alt={review.first_name}
                                 className={styles.playReview__avatar}
                              />

                              <div className={styles.playReview__meta}>
                                 <p className={styles.playReview__name}>
                                    {review.first_name} {review.last_name}
                                 </p>

                                 <div className={styles.playReview__ratingRow}>
                                    <div className={styles.playReview__stars}>
                                       {[...Array(5)].map((_, i) => (
                                          <Star
                                             key={i}
                                             size={14}
                                             className={
                                                i < review.rating
                                                   ? styles.playReview__starActive
                                                   : styles.playReview__star
                                             }
                                          />
                                       ))}
                                    </div>

                                    <span className={styles.playReview__date}>
                                       {formatDate(review.created_at)}
                                    </span>
                                 </div>
                              </div>
                           </div>

                           <p className={styles.playReview__comment}>
                              {review.comment}
                           </p>
                        </div>
                     ))}
                  </div>
               ) : (
                  <p className={styles.noReviews}>No reviews yet.</p>
               )}
            </div>
         )}

         {/* Booking Modal for Room Selection */}
         <Modal
            isOpen={showBookingModal}
            onClose={() => {
               setShowBookingModal(false);
               setBookingData((prev) => ({ ...prev, roomId: "" }));
            }}
            title="Select Your Room"
            size="lg"
         >
            <div className={styles.roomSelectionModal}>
               <div className={styles.roomSelectionModal__header}>
                  <div className={styles.roomSelectionModal__dates}>
                     <div className={styles.roomSelectionModal__dateItem}>
                        <Calendar size={16} />
                        <span>
                           <strong>Check-in:</strong>{" "}
                           {formatDate(bookingData.checkIn)}
                        </span>
                     </div>
                     <div className={styles.roomSelectionModal__dateItem}>
                        <Calendar size={16} />
                        <span>
                           <strong>Check-out:</strong>{" "}
                           {formatDate(bookingData.checkOut)}
                        </span>
                     </div>
                  </div>
                  <div className={styles.roomSelectionModal__price}>
                     <span className={styles.roomSelectionModal__priceLabel}>
                        Total Price:
                     </span>
                     <span className={styles.roomSelectionModal__priceValue}>
                        {formatCurrency(grandTotal)}
                     </span>
                  </div>
               </div>

               <div className={styles.roomSelectionModal__content}>
                  {availableRooms?.length > 0 ? (
                     <>
                        <h4 className={styles.roomSelectionModal__subtitle}>
                           Available Rooms ({availableRooms.length})
                        </h4>
                        <p className={styles.roomSelectionModal__description}>
                           Please select a room number for your stay
                        </p>

                        <div className={styles.roomSelectionModal__rooms}>
                           {availableRooms.map((room) => (
                              <div
                                 key={room.id}
                                 className={`${
                                    styles.roomSelectionModal__room
                                 } ${
                                    bookingData.roomId === room.id
                                       ? styles[
                                            "roomSelectionModal__room--selected"
                                         ]
                                       : ""
                                 }`}
                                 onClick={() => handleRoomSelection(room.id)}
                              >
                                 <div
                                    className={
                                       styles.roomSelectionModal__roomInfo
                                    }
                                 >
                                    <Building size={20} />
                                    <div>
                                       <h5
                                          className={
                                             styles.roomSelectionModal__roomNumber
                                          }
                                       >
                                          Room #{room.room_number}
                                       </h5>
                                       <p
                                          className={
                                             styles.roomSelectionModal__roomFloor
                                          }
                                       >
                                          Floor: {room.floor || "Ground"}
                                       </p>
                                    </div>
                                 </div>

                                 {bookingData.roomId === room.id && (
                                    <div
                                       className={
                                          styles.roomSelectionModal__selectedIndicator
                                       }
                                    >
                                       <CheckCircle size={20} />
                                       Selected
                                    </div>
                                 )}
                              </div>
                           ))}
                        </div>

                        <div className={styles.roomSelectionModal__actions}>
                           <Button
                              variant="outline"
                              onClick={() => {
                                 setShowBookingModal(false);
                                 setBookingData((prev) => ({
                                    ...prev,
                                    roomId: "",
                                 }));
                              }}
                           >
                              Cancel
                           </Button>
                           <Button
                              variant="primary"
                              onClick={handleBookingSubmit}
                              loading={bookingMutation.isLoading}
                              disabled={!bookingData.roomId}
                           >
                              Confirm Booking
                           </Button>
                        </div>
                     </>
                  ) : (
                     <div className={styles.roomSelectionModal__empty}>
                        <div className={styles.roomSelectionModal__emptyIcon}>
                           <Building size={48} />
                        </div>
                        <h4 className={styles.roomSelectionModal__emptyTitle}>
                           No Rooms Available
                        </h4>
                        <p className={styles.roomSelectionModal__emptyMessage}>
                           No rooms are available for the selected dates. Please
                           try different dates or check back later.
                        </p>
                        <Button
                           variant="primary"
                           onClick={() => setShowBookingModal(false)}
                        >
                           Close
                        </Button>
                     </div>
                  )}
               </div>
            </div>
         </Modal>
      </div>
   );
};

export default RoomDetails;
