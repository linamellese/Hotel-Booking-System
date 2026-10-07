import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
   ChevronRight,
   Shield,
   CreditCard,
   Clock,
   MapPin,
   Star,
   Bed,
   Hotel,
} from "lucide-react";
import { customerApi } from "../../../api/customer";
import Button from "../../../components/shared/Button/Button";
import Card from "../../../components/shared/Card/Card";
import styles from "./Home.module.css";
import { formatCurrency } from "../../../utils/helpers";

const Home = () => {
   const navigate = useNavigate();
   const location = useLocation();
   const [userLocation, setUserLocation] = useState(null);

   // Get recommended rooms based on user location
   const { data: recommendedRooms, isLoading: roomsLoading } = useQuery({
      queryKey: ["recommendedRooms", userLocation],
      queryFn: () =>
         customerApi
            .searchRoomTypes({
               search: userLocation || "Addis Ababa",
            })
            .then((res) => res.data.roomTypes),
      enabled: true,
   });

   // Get user's current location
   useEffect(() => {
      if (navigator.geolocation) {
         navigator.geolocation.getCurrentPosition(
            (position) => {
               setUserLocation({
                  lat: position.coords.latitude,
                  lng: position.coords.longitude,
               });
            },
            (error) => {
               console.log("Geolocation error:", error);
            }
         );
      }
   }, []);

   // Featured cities data
   const featuredCities = [
      {
         name: "Addis Ababa",
         image: "https://images.unsplash.com/photo-1624314138470-5a2f24623f10?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
         count: 234,
      },
      {
         name: "Hawassa",
         image: "https://cf.bstatic.com/xdata/images/hotel/max1024x768/725562509.jpg?k=5514efc19b8c50cb41100d78eaa10abc13bd259408158b6a5377a7765565c4a8&o=",
         count: 189,
      },
      {
         name: "Bahrdar",
         image: "https://cf.bstatic.com/xdata/images/hotel/max1280x900/346552166.jpg?k=a9545292393c96b591b9eb9099bf6c364dce881287a6a38fd4b04e201b0e420b&o=",
         count: 156,
      },
      {
         name: "Jimma",
         image: "https://i.ytimg.com/vi/pgjORbFCwVo/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLBZV9RlBk5cYayEFs46e7R5H4nUHA",
         count: 210,
      },
   ];

   // Features data
   const features = [
      {
         icon: <Shield size={32} />,
         title: "Secure Booking",
         description: "Your information is protected with bank-level security",
      },
      {
         icon: <CreditCard size={32} />,
         title: "Best Price Guarantee",
         description:
            "Found a better price? We'll match it and give you 10% off",
      },
      {
         icon: <Clock size={32} />,
         title: "24/7 Support",
         description: "Our support team is available around the clock",
      },
   ];

   // Navigate to room details page
   const handleRoomClick = (roomId) => {
      // add state to know where it come from
      navigate(`/room-types/${roomId}`, {
         state: { from: location.pathname || "/" },
         replace: true,
      });
   };

   return (
      <div className={styles.home}>
         {/* Hero Section */}
         <section className={styles.hero}>
            <div className={styles.hero__content}>
               <h1 className={styles.hero__title}>
                  Find Your Perfect
                  <span className={styles.hero__highlight}> Stay</span>
               </h1>
               <p className={styles.hero__subtitle}>
                  Book amazing hotels, resorts, and apartments at the best
                  prices
               </p>
            </div>
         </section>

         {/* Featured Cities */}
         <section className={styles.section}>
            <div className={styles.section__header}>
               <h2 className={styles.section__title}>Popular Destinations</h2>
               <p className={styles.section__subtitle}>
                  Discover amazing places to stay around the world
               </p>
            </div>

            <div className={styles.citiesGrid}>
               {featuredCities.map((city) => (
                  <div
                     key={city.name}
                     className={styles.cityCard}
                     style={{ backgroundImage: `url(${city.image})` }}
                     onClick={() => {
                        navigate(
                           `/room-types?search=${encodeURIComponent(
                              city.name
                           )}`,
                           { replace: true }
                        );
                     }}
                  >
                     <div className={styles.cityCard__overlay} />
                     <div className={styles.cityCard__content}>
                        <h3 className={styles.cityCard__name}>{city.name}</h3>
                        <p className={styles.cityCard__count}>
                           {city.count} properties
                        </p>
                     </div>
                  </div>
               ))}
            </div>
         </section>

         {/* Recommended Rooms */}
         <section className={styles.section}>
            <div className={styles.section__header}>
               <h2 className={styles.section__title}>Recommended For You</h2>
               <p className={styles.section__subtitle}>
                  {userLocation
                     ? "Based on your location"
                     : "Top-rated properties"}
               </p>
            </div>

            {roomsLoading ? (
               <div className={styles.loadingGrid}>
                  {[1, 2, 3, 4].map((i) => (
                     <div key={i} className={styles.roomCardSkeleton}>
                        <div className={styles.roomCardSkeleton__image} />
                        <div className={styles.roomCardSkeleton__content}>
                           <div className={styles.roomCardSkeleton__title} />
                           <div
                              className={styles.roomCardSkeleton__description}
                           />
                           <div className={styles.roomCardSkeleton__price} />
                        </div>
                     </div>
                  ))}
               </div>
            ) : (
               <div className={styles.roomsGrid}>
                  {recommendedRooms?.slice(0, 4).map((roomType) => (
                     <Card
                        key={roomType.id}
                        className={styles.roomCard}
                        onClick={() => handleRoomClick(roomType.id)}
                     >
                        <div className={styles.roomCard__image}>
                           <img
                              src={
                                 roomType.main_image_url ||
                                 "https://images.unsplash.com/photo-1611892440504-42a792e24d32?ixlib=rb-4.0.3"
                              }
                              alt={roomType.name}
                              className={styles.roomCard__img}
                           />
                           <div className={styles.roomCard__badge}>
                              <Star size={12} fill="currentColor" />
                              <span>{roomType.average_rating || "4.5"}</span>
                           </div>
                        </div>
                        <div className={styles.roomCard__content}>
                           <div className={styles.roomCard__header}>
                              <h3 className={styles.roomCard__title}>
                                 {roomType.name}
                              </h3>
                              <p className={styles.roomCard__bedType}>
                                 <span className={styles.roomCard__numberOfBed}>
                                    {roomType.number_of_beds}
                                 </span>
                                 <Bed size={14} />
                                 {roomType.bed_type.charAt(0).toUpperCase() +
                                    roomType.bed_type.slice(1)}{" "}
                                 Bed
                              </p>
                           </div>
                           <p className={styles.roomCard__location}>
                              <MapPin size={14} />
                              {roomType.hotel_location}
                           </p>
                           <div className={styles.roomCard__location}>
                              <Hotel size={14} />
                              {roomType.hotel_name}
                           </div>
                           <div className={styles.roomCard__footer}>
                              <div>
                                 <span className={styles.roomCard__price}>
                                    {formatCurrency(roomType.price_per_night)}
                                 </span>
                                 <span className={styles.roomCard__period}>
                                    {" "}
                                    / night
                                 </span>
                              </div>
                              <Button
                                 variant="outline"
                                 size="small"
                                 onClick={() => handleRoomClick(roomType.id)}
                              >
                                 View
                              </Button>
                           </div>
                        </div>
                     </Card>
                  ))}
               </div>
            )}

            <div className={styles.section__footer}>
               <Button
                  variant="ghost"
                  onClick={() => navigate("/room-types", { replace: true })}
               >
                  View All Rooms
                  <ChevronRight size={20} />
               </Button>
            </div>
         </section>

         {/* Features */}
         <section className={styles.section}>
            <div className={styles.section__header}>
               <h2 className={styles.section__title}>Why Choose Us</h2>
               <p className={styles.section__subtitle}>
                  We provide the best experience for your stay
               </p>
            </div>

            <div className={styles.featuresGrid}>
               {features.map((feature, index) => (
                  <div key={index} className={styles.featureCard}>
                     <div className={styles.featureCard__icon}>
                        {feature.icon}
                     </div>
                     <h3 className={styles.featureCard__title}>
                        {feature.title}
                     </h3>
                     <p className={styles.featureCard__description}>
                        {feature.description}
                     </p>
                  </div>
               ))}
            </div>
         </section>

         {/* CTA Section */}
         <section className={styles.cta}>
            <div className={styles.cta__content}>
               <h2 className={styles.cta__title}>
                  Ready to Book Your Perfect Stay?
               </h2>
               <p className={styles.cta__subtitle}>
                  Join thousands of satisfied customers who found their perfect
                  accommodation with us
               </p>
               <div className={styles.cta__buttons}>
                  <Button
                     variant="primary"
                     size="large"
                     onClick={() => navigate("/room-types")}
                  >
                     Start Searching
                  </Button>
                  <Button
                     variant="outline"
                     size="large"
                     onClick={() => navigate("/register")}
                  >
                     Create Account
                  </Button>
               </div>
            </div>
         </section>
      </div>
   );
};

export default Home;
