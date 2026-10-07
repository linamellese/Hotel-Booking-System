import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { hotelOwnerApi } from "../../../api/hotelOwner";
import Card from "../../../components/shared/Card/Card";
import Button from "../../../components/shared/Button/Button";
import Table from "../../../components/shared/Table/Table";
import LoadingSpinner from "../../../components/shared/Loading/LoadingSpinner";
import Modal from "../../../components/shared/Modal/Modal";
import { useNavigate } from "react-router-dom";
import styles from "./Dashboard.module.css";
import useAuthStore from "../../../store/authStore";
import { formatCurrency } from "../../../utils/helpers";

const Dashboard = () => {
   const navigate = useNavigate();
   const [showBusinessModal, setShowBusinessModal] = useState(false);
   const [step, setStep] = useState(1);
   const user = useAuthStore((state) => state.user);

   // Fetch dashboard data
   const {
      data: hotel,
      isLoading: isLoadingHotel,
      refetch,
   } = useQuery({
      queryKey: ["my-hotel"],
      queryFn: async () => {
         const response = await hotelOwnerApi.getMyHotel();
         return response.data;
      },
      retry: false,
   });
   // Check if business is approved
   const isBusinessApproved = hotel?.status === "approved";

   const {
      data: dashboardData,
      isLoading,
      isError,
   } = useQuery({
      queryKey: ["hotel-owner-dashboard", hotel?.id],
      queryFn: () =>
         hotelOwnerApi.getDashboardAnalytics(hotel.id).then((res) => res.data),
      enabled: !isLoadingHotel && Boolean(hotel?.id),
      retry: false,
   });

   // Fetch recent bookings
   const { data: recentBookings, isLoading: isLoadingBookings } = useQuery({
      queryKey: ["hotel-owner-recent-bookings"],
      queryFn: async () => {
         const response = await hotelOwnerApi.getHotelBookings(hotel.id);
         return response.data.bookings;
      },
      enabled: !isLoadingHotel && Boolean(hotel?.id),
   });

   // Check existing hotel status
   useEffect(() => {
      if (!hotel) return;

      if (!hotel?.id) return;

      if (!hotel?.bank_name) {
         setStep(2);
      } else {
         setStep(3);
      }
   }, [hotel, isBusinessApproved]);

   if (isLoadingHotel) {
      return <LoadingSpinner fullScreen />;
   }

   // Dashboard metrics
   const metrics = [
      {
         title: "Total Bookings",
         value: dashboardData?.total_bookings || 0,
         change: `${dashboardData?.booking_change_percent || 0}%`,
         trend: dashboardData?.booking_change_percent >= 0 ? "up" : "down",
         icon: "📅",
         color: "blue",
         link: "/hotel-owner/bookings",
      },
      {
         title: "Total Revenue",
         value: formatCurrency(dashboardData?.total_revenue || 0),
         change: `${dashboardData?.revenue_change_percent || 0}%`,
         trend: dashboardData?.revenue_change_percent >= 0 ? "up" : "down",
         icon: "💰",
         color: "green",
         link: "/hotel-owner/bookings",
      },

      {
         title: "Customer Rating",
         value: dashboardData?.avg_rating || 0,
         total: 5,
         change: `${dashboardData?.rating_change_percent || 0}%`,
         trend: dashboardData?.rating_change_percent >= 0 ? "up" : "down",
         icon: "⭐",
         color: "amber",
         link: "/hotel-owner/bookings",
      },
   ];

   // Recent bookings columns
   const bookingColumns = [
      {
         key: "booking_reference",
         header: "Reference",
         render: (row) => (
            <span className="font-medium text-blue-600">
               {row.booking_reference}
            </span>
         ),
      },
      {
         key: "guest",
         header: "Guest",
         render: (row) => (
            <div>
               <div className="font-medium text-gray-900 dark:text-gray-100">
                  {row.user.first_name} {row.user.last_name}
               </div>
               <div className="text-sm text-gray-500 dark:text-gray-400">
                  {row.user.email}
               </div>
            </div>
         ),
      },
      {
         key: "room_details",
         header: "Room Details",
         render: (row) => (
            <div>
               <div className="font-medium text-gray-900 dark:text-gray-100">
                  {row.room.room_type.name}
               </div>
               <div className="text-sm text-gray-500 dark:text-gray-400">
                  Room #{row.room.room_number}
               </div>
            </div>
         ),
      },
      {
         key: "dates",
         header: "Dates",
         render: (row) => (
            <div className="text-sm">
               <div>
                  Check-in: {new Date(row.check_in).toLocaleDateString()}
               </div>
               <div>
                  Check-out: {new Date(row.check_out).toLocaleDateString()}
               </div>
            </div>
         ),
      },
      {
         key: "amount",
         header: "Amount",
         render: (row) => (
            <span className="font-medium">
               {formatCurrency(row.total_amount)}
            </span>
         ),
      },
      {
         key: "status",
         header: "Status",
         render: (row) => (
            <span
               className={`${styles.status} ${
                  styles[`status--${row.status.toLowerCase()}`]
               }`}
            >
               {row.status}
            </span>
         ),
      },
   ];

   // Business Approval Alert
   if (!isBusinessApproved) {
      if (step === 3) {
         if (hotel?.status === "rejected") {
            return (
               <div className={styles.approval}>
                  <div className={styles["approval__card"]}>
                     <div className={styles["approval__iconWrapper--rejected"]}>
                        <span className={styles["approval__icon"]}>❌</span>
                     </div>

                     <h2 className={styles["approval__title"]}>
                        Hotel Submission Rejected
                     </h2>

                     <p className={styles["approval__description"]}>
                        {hotel.rejection_reason
                           ? `Reason: ${hotel.rejection_reason}`
                           : "Your application does not meet our requirements. Please review your information and try again."}
                     </p>

                     <div className={styles["approval__status"]}>
                        <span className={styles["approval__badge--rejected"]}>
                           Rejected
                        </span>
                     </div>

                     <Button
                        variant="primary"
                        onClick={() =>
                           navigate("/hotel-owner/business-approval")
                        }
                        className="mt-6"
                     >
                        Update Information
                     </Button>
                  </div>
               </div>
            );
         }

         return (
            <div className={styles.approval}>
               <div className={styles["approval__card"]}>
                  <div className={styles["approval__iconWrapper"]}>
                     <span className={styles["approval__icon"]}>🏨</span>
                  </div>

                  <h2 className={styles["approval__title"]}>
                     Hotel Submission Under Review
                  </h2>

                  <p className={styles["approval__description"]}>
                     Thank you for submitting your hotel details. Our team is
                     currently reviewing your information to ensure everything
                     meets our quality standards.
                  </p>

                  <div className={styles["approval__status"]}>
                     <span className={styles["approval__badge"]}>
                        Pending Approval
                     </span>
                  </div>

                  <ul className={styles["approval__steps"]}>
                     <li className={styles["approval__step"]}>
                        ✔ Hotel information submitted
                     </li>
                     <li className={styles["approval__step"]}>
                        ⏳ Verification in progress
                     </li>
                  </ul>

                  <p className={styles["approval__hint"]}>
                     This process usually takes less than{" "}
                     <strong>24 hours</strong>. You will be notified once your
                     hotel is approved.
                  </p>
               </div>
            </div>
         );
      }
      if (step === 2) {
         return (
            <>
               <div className={styles.dashboard__alert}>
                  <div className={styles.dashboard__alertContent}>
                     <span className={styles.dashboard__alertIcon}>⚠️</span>
                     <div>
                        <h3 className={styles.dashboard__alertTitle}>
                           Business Approval Required
                        </h3>
                        <p className={styles.dashboard__alertText}>
                           Complete your business profile to start accepting
                           bookings and receiving payments.
                        </p>
                     </div>
                  </div>
                  <Button
                     variant="primary"
                     size="small"
                     onClick={() => navigate("/hotel-owner/business-approval")}
                  >
                     Complete Setup
                  </Button>
               </div>
            </>
         );
      }
      if (step === 1) {
         return (
            <>
               <div className={styles.dashboard__alert}>
                  <div className={styles.dashboard__alertContent}>
                     <span className={styles.dashboard__alertIcon}>⚠️</span>
                     <div>
                        <h3 className={styles.dashboard__alertTitle}>
                           Business Approval Required
                        </h3>
                        <p className={styles.dashboard__alertText}>
                           Complete your business profile to start accepting
                           bookings and receiving payments.
                        </p>
                     </div>
                  </div>
                  <Button
                     variant="primary"
                     size="small"
                     onClick={() => setShowBusinessModal(true)}
                  >
                     Start Application
                  </Button>
               </div>

               {/* Business Setup Modal */}
               <Modal
                  isOpen={showBusinessModal}
                  onClose={() => setShowBusinessModal(false)}
                  title="Complete Business Setup"
                  size="lg"
               >
                  <div className={styles.dashboard__businessModal}>
                     <p className={styles.dashboard__modalText}>
                        To start accepting bookings and receiving payments,
                        please complete your business profile.
                     </p>

                     <div className={styles.dashboard__setupSteps}>
                        <div className={styles.dashboard__setupStep}>
                           <div className={styles.dashboard__stepNumber}>1</div>
                           <div className={styles.dashboard__stepContent}>
                              <h3 className={styles.dashboard__stepTitle}>
                                 Hotel Information
                              </h3>
                              <p className={styles.dashboard__stepDescription}>
                                 Add hotel details.
                              </p>
                           </div>
                        </div>

                        <div className={styles.dashboard__setupStep}>
                           <div className={styles.dashboard__stepNumber}>2</div>
                           <div className={styles.dashboard__stepContent}>
                              <h3 className={styles.dashboard__stepTitle}>
                                 Bank Details
                              </h3>
                              <p className={styles.dashboard__stepDescription}>
                                 Add your bank account details for receiving
                                 payments.
                              </p>
                           </div>
                        </div>
                     </div>

                     <div className={styles.dashboard__modalActions}>
                        <Button
                           variant="outline"
                           onClick={() => setShowBusinessModal(false)}
                        >
                           Later
                        </Button>
                        <Button
                           variant="primary"
                           onClick={() => {
                              setShowBusinessModal(false);
                              navigate("/hotel-owner/business-approval");
                           }}
                        >
                           Start Setup
                        </Button>
                     </div>
                  </div>
               </Modal>
            </>
         );
      }
   }

   return (
      <div className={styles.dashboard}>
         {/* Header */}
         <div className={styles.dashboard__header}>
            {/* Welcome Section */}
            <div className={`${styles.dashboard__welcome} mb-8`}>
               <h1 className={styles.dashboard__title}>
                  Welcome back,{" "}
                  <span className={styles.dashboard__userName}>
                     {user?.first_name}!
                  </span>
               </h1>
               <p className={styles.dashboard__subtitle}>
                  Here's what's happening with your hotel.
               </p>
            </div>
         </div>

         {/* Metrics Grid */}
         <div className={styles.dashboard__metricsGrid}>
            {metrics.map((metric, index) => (
               <Card
                  key={index}
                  className={`${styles.dashboard__metricCard} ${
                     metric.highlight
                        ? styles["dashboard__metricCard--highlight"]
                        : ""
                  }`}
                  onClick={() => metric.link && navigate(metric.link)}
               >
                  <div className={styles.dashboard__metricHeader}>
                     <div
                        className={`${styles.dashboard__metricIcon} ${
                           styles[`dashboard__metricIcon--${metric.color}`]
                        }`}
                     >
                        {metric.icon}
                     </div>
                     <div className={styles.dashboard__metricInfo}>
                        <div className={styles.dashboard__metricValue}>
                           {metric.value}
                        </div>
                        {metric.total && (
                           <div className={styles.dashboard__metricTotal}>
                              / {metric.total}
                           </div>
                        )}
                        <div className={styles.dashboard__metricTitle}>
                           {metric.title}
                        </div>
                     </div>
                  </div>
                  {metric.change && (
                     <div className={styles.dashboard__metricFooter}>
                        <div
                           className={`${styles.dashboard__metricChange} ${
                              metric.trend === "up"
                                 ? styles["dashboard__metricChange--positive"]
                                 : styles["dashboard__metricChange--negative"]
                           }`}
                        >
                           {metric.trend === "up" ? "↑" : "↓"} {metric.change}
                        </div>
                        <div className={styles.dashboard__metricPeriod}>
                           vs last month
                        </div>
                     </div>
                  )}
               </Card>
            ))}
         </div>

         {/* Main Content */}
         <div className={styles.dashboard__leftColumn}>
            {/* Recent Bookings */}
            <Card className={styles.dashboard__section}>
               <div className={styles.dashboard__sectionHeader}>
                  <h2 className={styles.dashboard__sectionTitle}>
                     Recent Bookings
                  </h2>
                  <Button
                     variant="ghost"
                     size="small"
                     onClick={() => navigate("/hotel-owner/bookings")}
                  >
                     View All
                  </Button>
               </div>
               {isLoadingBookings ? (
                  <LoadingSpinner />
               ) : recentBookings?.length > 0 ? (
                  <Table
                     columns={bookingColumns}
                     data={recentBookings}
                     className={styles.dashboard__table}
                  />
               ) : (
                  <div className={styles.dashboard__emptyState}>
                     <div className={styles.dashboard__emptyIcon}>📅</div>
                     <p className={styles.dashboard__emptyText}>
                        No recent bookings
                     </p>
                     <Button
                        variant="outline"
                        onClick={() => navigate("/hotel-owner/bookings")}
                     >
                        View All Bookings
                     </Button>
                  </div>
               )}
            </Card>
         </div>
      </div>
   );
};

export default Dashboard;
