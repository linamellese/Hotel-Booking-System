import { useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Star, Hotel, Bed, Heart } from "lucide-react";
import { customerApi } from "../../../api/customer";
import Card from "../../../components/shared/Card/Card";
import Button from "../../../components/shared/Button/Button";
import LoadingSpinner from "../../../components/shared/Loading/LoadingSpinner";
import styles from "./Wishlist.module.css";
import { formatCurrency } from "../../../utils/helpers";

const Wishlist = () => {
   const navigate = useNavigate();
   const location = useLocation();

   const {
      data: wishlistItems,
      isLoading,
      refetch,
   } = useQuery({
      queryKey: ["wishlist"],
      queryFn: async () => {
         const response = await customerApi.getWishlist();
         return response.data;
      },
   });

   const handleRoomClick = (roomId) => {
      navigate(`/room-types/${roomId}`, {
         state: { from: location.pathname },
      });
   };

   const removeFromWishlist = async (e, roomId) => {
      e.stopPropagation();
      try {
         await customerApi.toggleWishlist(roomId);
         refetch();
      } catch (error) {
         console.error("Failed to remove from wishlist", error);
      }
   };

   if (isLoading) {
      return <LoadingSpinner fullScreen />;
   }

   return (
      <div className={styles.wishlist}>
         <div className={styles.header}>
            <h1 className={styles.title}>My Wishlist</h1>
            <p className={styles.subtitle}>
               {wishlistItems?.length || 0} saved items
            </p>
         </div>

         {wishlistItems?.length > 0 ? (
            <div className={styles.grid}>
               {wishlistItems.map((item) => (
                  <Card
                     key={item.id}
                     className={styles.card}
                     onClick={() => handleRoomClick(item.id)}
                  >
                     <div className={styles.imageWrapper}>
                        <img
                           src={
                              item.main_image_url ||
                              "https://images.unsplash.com/photo-1611892440504-42a792e24d32?ixlib=rb-4.0.3"
                           }
                           alt={item.name}
                           className={styles.image}
                        />
                        <button
                           className={styles.wishlistBtn}
                           onClick={(e) => removeFromWishlist(e, item.id)}
                        >
                           <Heart
                              size={20}
                              fill="currentColor"
                              color="#ef4444"
                           />
                        </button>
                        <div className={styles.rating}>
                           <Star size={12} fill="currentColor" />
                           <span>{item.average_rating || "4.5"}</span>
                        </div>
                     </div>
                     <div className={styles.content}>
                        <div className={styles.cardHeader}>
                           <h3 className={styles.cardTitle}>{item.name}</h3>
                           <p className={styles.bedType}>
                              <span className={styles.bedCount}>
                                 {item.number_of_beds}
                              </span>
                              <Bed size={14} />
                              {item.bed_type &&
                                 item.bed_type.charAt(0).toUpperCase() +
                                    item.bed_type.slice(1)}{" "}
                              Bed
                           </p>
                        </div>
                        <p className={styles.location}>
                           <MapPin size={14} />
                           {item.hotel_location}
                        </p>

                        <div className={styles.hotelName}>
                           <Hotel size={14} />
                           {item.hotel_name}
                        </div>
                        <div className={styles.footer}>
                           <div>
                              <span className={styles.price}>
                                 {formatCurrency(item.price_per_night)}
                              </span>
                              <span className={styles.period}> / night</span>
                           </div>
                           <Button
                              variant="outline"
                              size="small"
                              onClick={(e) => {
                                 e.stopPropagation();
                                 handleRoomClick(item.id);
                              }}
                           >
                              View Details
                           </Button>
                        </div>
                     </div>
                  </Card>
               ))}
            </div>
         ) : (
            <div className={styles.emptyState}>
               <div className={styles.emptyIcon}>❤️</div>
               <h3 className={styles.emptyTitle}>Your wishlist is empty</h3>
               <p className={styles.emptyMessage}>
                  Save rooms you like to your wishlist to easily find them
                  later.
               </p>
               <Button onClick={() => navigate("/room-types")}>
                  Browse Rooms
               </Button>
            </div>
         )}
      </div>
   );
};

export default Wishlist;
