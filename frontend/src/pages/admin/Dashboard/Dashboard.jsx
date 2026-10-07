import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { adminApi } from "../../../api/admin";
import Card from "../../../components/shared/Card/Card";
import Button from "../../../components/shared/Button/Button";
import Table from "../../../components/shared/Table/Table";
import LoadingSpinner from "../../../components/shared/Loading/LoadingSpinner";
import Modal from "../../../components/shared/Modal/Modal";
import styles from "./Dashboard.module.css";
import { formatCurrency } from "../../../utils/helpers";

const AdminDashboard = () => {
   const navigate = useNavigate();
   const queryClient = useQueryClient();

   const [approvalModal, setApprovalModal] = useState({
      isOpen: false,
      hotelId: null,
      hotelName: "",
   });

   const approveMutation = useMutation({
      mutationFn: (id) => adminApi.updateHotelStatus(id, "approved"),
      onSuccess: () => {
         toast.success("Hotel approved successfully");
         queryClient.invalidateQueries(["admin-pending-approvals"]);
         queryClient.invalidateQueries(["admin-dashboard-data"]);
         setApprovalModal({ isOpen: false, hotelId: null, hotelName: "" });
      },
      onError: (error) => {
         if (error.response?.data?.details) {
            toast.error(error.response?.data?.details[0].msg);
         } else {
            toast.error(
               error?.response?.data?.message || "Failed to approve hotel"
            );
         }
      },
   });

   const handleApprove = (row) => {
      setApprovalModal({
         isOpen: true,
         hotelId: row.id,
         hotelName: row.name,
      });
   };

   const confirmApprove = () => {
      if (approvalModal.hotelId) {
         approveMutation.mutate(approvalModal.hotelId);
      }
   };

   // Fetch dashboard statistics
   const { data: dashboardData, isLoading: isLoadingDashboardData } = useQuery({
      queryKey: ["admin-dashboard-data"],
      queryFn: () => adminApi.getDashboardData().then((res) => res.data),
      enabled: true,
   });

   // Fetch pending approvals
   const { data: pendingApprovals, isLoading: isLoadingApprovals } = useQuery({
      queryKey: ["admin-pending-approvals"],
      queryFn: () =>
         adminApi.getHotels({ status: "pending" }).then((res) => res.data),
      enabled: true,
   });

   if (isLoadingDashboardData || isLoadingApprovals) {
      return <LoadingSpinner fullScreen />;
   }

   // Statistics cards
   const statCards = [
      {
         title: "Total Hotels",
         value: dashboardData?.total_hotels_count || 0,
         icon: "🏨",
         color: "blue",
         link: "/admin/hotels",
      },
      {
         title: "Total Hotel Owners",
         value: dashboardData?.total_hotel_owner_count || 0,
         icon: "👤",
         color: "green",
         link: "/admin/hotel-owners",
      },
      {
         title: "Total Customers",
         value: dashboardData?.total_customers_count || 0,
         icon: "👥",
         color: "purple",
         link: "/admin/customers",
      },
      {
         title: "Total Bookings",
         value: dashboardData?.total_bookings_count || 0,
         icon: "📋",
         color: "amber",
         link: "/admin/bookings",
      },
      {
         title: "Revenue",
         value: formatCurrency(dashboardData?.total_revenue),
         icon: "💰",
         color: "emerald",
      },
      {
         title: "Pending Approvals",
         value: dashboardData?.pending_hotels_count || 0,
         icon: "⏳",
         color: "orange",
         link: "/admin/hotels",
      },
   ];

   // Pending approvals table columns
   const approvalColumns = [
      {
         key: "name",
         header: "Business Name",
         render: (row) => (
            <div>
               <div className={styles.dashboard__businessName}>{row?.name}</div>
            </div>
         ),
      },
      {
         key: "owner",
         header: "Owner Name",
         render: (row) => {
            return (
               <div>
                  <div className={styles.dashboard__businessOwner}>
                     {row?.first_name + " " + row?.last_name}
                  </div>
               </div>
            );
         },
      },
      {
         key: "owner_email",
         header: "Owner Email",
         render: (row) => {
            return (
               <div>
                  <div className={styles.dashboard__businessOwnerEmail}>
                     {row?.email}
                  </div>
               </div>
            );
         },
      },
      {
         key: "created_at",
         header: "Submitted",
         render: (row) => new Date(row?.created_at).toLocaleDateString(),
      },
      {
         key: "actions",
         header: "Actions",
         render: (row) => (
            <div className={styles.dashboard__approvalActions}>
               <Button
                  variant="primary"
                  size="small"
                  onClick={() => handleApprove(row)}
               >
                  Approve
               </Button>
               <Button
                  variant="outline"
                  size="small"
                  onClick={() => navigate(`/admin/hotels/${row.id}`)}
               >
                  Review
               </Button>
            </div>
         ),
      },
   ];

   return (
      <div className={styles.dashboard}>
         {/* Header */}
         <div className={styles.dashboard__header}>
            <div>
               <h1 className={styles.dashboard__title}>Admin Dashboard</h1>
               <p className={styles.dashboard__subtitle}>
                  System overview and management tools
               </p>
            </div>
         </div>

         {/* Statistics Grid */}
         <div className={styles.dashboard__statsGrid}>
            {statCards.map((stat, index) => (
               <Card key={index} className={styles.dashboard__statCard}>
                  <div className={styles.dashboard__statHeader}>
                     <div
                        className={`${styles.dashboard__statIcon} ${
                           styles[`dashboard__statIcon--${stat.color}`]
                        }`}
                     >
                        {stat.icon}
                     </div>
                     <div className={styles.dashboard__statInfo}>
                        <div className={styles.dashboard__statValue}>
                           {stat.value}
                        </div>
                        <div className={styles.dashboard__statTitle}>
                           {stat.title}
                        </div>
                     </div>
                  </div>
               </Card>
            ))}
         </div>

         {/* Main Content Grid */}
         <div className={styles.dashboard__contentGrid}>
            {/* Pending Approvals */}
            <Card className={styles.dashboard__sectionCard}>
               <div className={styles.dashboard__sectionHeader}>
                  <h2 className={styles.dashboard__sectionTitle}>
                     Pending Approvals
                     {pendingApprovals?.total > 0 && (
                        <span className={styles.dashboard__badge}>
                           {pendingApprovals.total}
                        </span>
                     )}
                  </h2>
                  <Link
                     to="/admin/hotels"
                     className={styles.dashboard__viewAllLink}
                  >
                     View All →
                  </Link>
               </div>
               {isLoadingApprovals ? (
                  <LoadingSpinner />
               ) : pendingApprovals?.hotels?.length > 0 ? (
                  <>
                     <Table
                        columns={approvalColumns}
                        data={pendingApprovals.hotels.slice(0, 5)}
                        className={styles.dashboard__table}
                     />
                     {pendingApprovals.total > 5 && (
                        <div className={styles.dashboard__moreItems}>
                           +{pendingApprovals.total - 5} more pending approvals
                        </div>
                     )}
                  </>
               ) : (
                  <div className={styles.dashboard__emptyState}>
                     <div className={styles.dashboard__emptyIcon}>✅</div>
                     <p className={styles.dashboard__emptyText}>
                        No pending approvals
                     </p>
                  </div>
               )}
            </Card>
         </div>

         {/* Approval Confirmation Modal */}
         <Modal
            isOpen={approvalModal.isOpen}
            onClose={() =>
               setApprovalModal({ ...approvalModal, isOpen: false })
            }
            title="Confirm Approval"
         >
            <div className={styles.approvalModal}>
               <p className={styles.approvalModal__description}>
                  Are you sure you want to approve{" "}
                  <span className={styles.approvalModal__hotelName}>
                     {approvalModal.hotelName}
                  </span>
                  ? This will allow the hotel owner to start managing their
                  property and accepting bookings.
               </p>

               <div className={styles.approvalModal__actions}>
                  <Button
                     variant="ghost"
                     onClick={() =>
                        setApprovalModal({ ...approvalModal, isOpen: false })
                     }
                  >
                     Cancel
                  </Button>

                  <Button
                     variant="primary"
                     onClick={confirmApprove}
                     loading={approveMutation.isPending}
                  >
                     Yes, Approve
                  </Button>
               </div>
            </div>
         </Modal>
      </div>
   );
};

export default AdminDashboard;
