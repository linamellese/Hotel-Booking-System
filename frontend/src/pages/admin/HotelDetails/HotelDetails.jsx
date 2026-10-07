import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import {
   ArrowLeft,
   MapPin,
   User,
   Phone,
   Mail,
   Globe,
   FileText,
   CheckCircle,
   XCircle,
   Clock,
   Building,
} from "lucide-react";
import { adminApi } from "../../../api/admin";
import Card from "../../../components/shared/Card/Card";
import Button from "../../../components/shared/Button/Button";
import LoadingSpinner from "../../../components/shared/Loading/LoadingSpinner";
import Modal from "../../../components/shared/Modal/Modal";
import styles from "./HotelDetails.module.css";

const HotelDetails = () => {
   const { id } = useParams();
   const navigate = useNavigate();
   const queryClient = useQueryClient();

   const [statusModal, setStatusModal] = useState({
      isOpen: false,
      newStatus: "",
   });

   // Fetch hotel details
   const {
      data: hotel,
      isLoading,
      isError,
   } = useQuery({
      queryKey: ["admin-hotel-details", id],
      queryFn: () => adminApi.getHotelById(id).then((res) => res.data),
   });

   // Mutation for status update
   const statusMutation = useMutation({
      mutationFn: (status) => adminApi.updateHotelStatus(id, status),
      onSuccess: (res, status) => {
         toast.success(`Hotel ${status} successfully`);
         queryClient.invalidateQueries(["admin-hotel-details", id]);
         queryClient.invalidateQueries(["admin-hotels"]);
         setStatusModal({ isOpen: false, newStatus: "" });
      },
      onError: (error) => {
         toast.error(
            error.response?.data?.message || "Failed to update status"
         );
      },
   });

   const handleStatusUpdate = (status) => {
      setStatusModal({ isOpen: true, newStatus: status });
   };

   const confirmStatusUpdate = () => {
      statusMutation.mutate(statusModal.newStatus);
   };

   if (isLoading) return <LoadingSpinner fullScreen />;
   if (isError) {
      return (
         <div className="flex flex-col items-center justify-center p-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
               Hotel Not Found
            </h2>
            <Button onClick={() => navigate("/admin/hotels")}>
               Go Back to Hotels
            </Button>
         </div>
      );
   }

   return (
      <div className={styles.details}>
         {/* Header */}
         <div className={styles.breadcrumb}>
            <Link to="/admin/hotels" className={styles.breadcrumbLink}>
               Hotels
            </Link>
            <span className={styles.breadcrumbSeparator}>/</span>
            <span className={styles.breadcrumbCurrent}>{hotel.name}</span>
         </div>

         <div className={styles.details__header}>
            <div className={styles.details__titleSection}>
               <h1 className={styles.details__name}>{hotel.name}</h1>
               <div className={styles.details__location}>
                  <MapPin size={20} />
                  {hotel.location}
               </div>
            </div>
            <div
               className={`${styles.details__statusBadge} ${
                  styles[`details__statusBadge--${hotel.status}`]
               }`}
            >
               {hotel.status}
            </div>
         </div>

         <div className={styles.details__grid}>
            <div className={styles.details__content}>
               {/* Basic Information */}
               <section className={styles.details__section}>
                  <h3 className={styles.details__sectionTitle}>
                     <Building size={20} />
                     Hotel Information
                  </h3>
                  <div className={styles.details__infoCard}>
                     <div className={styles.details__infoGrid}>
                        <div className={styles.details__infoItem}>
                           <span className={styles.details__infoLabel}>
                              Official Name
                           </span>
                           <span className={styles.details__infoValue}>
                              {hotel.name}
                           </span>
                        </div>
                     </div>
                     <div className={styles.details__infoItem}>
                        <span className={styles.details__infoLabel}>
                           Description
                        </span>
                        <p className={styles.details__infoValue}>
                           {hotel.description}
                        </p>
                     </div>
                  </div>
               </section>

               {/* Owner Information */}
               <section className={styles.details__section}>
                  <h3 className={styles.details__sectionTitle}>
                     <User size={20} />
                     Owner Details
                  </h3>
                  <div className={styles.details__infoCard}>
                     <div className={styles.details__infoGrid}>
                        <div className={styles.details__infoItem}>
                           <span className={styles.details__infoLabel}>
                              Full Name
                           </span>
                           <span className={styles.details__infoValue}>
                              {hotel.owner?.first_name} {hotel.owner?.last_name}
                           </span>
                        </div>
                        <div className={styles.details__infoItem}>
                           <span className={styles.details__infoLabel}>
                              Email Address
                           </span>
                           <span className={styles.details__infoValue}>
                              <a
                                 href={`mailto:${hotel.owner?.email}`}
                                 className="flex items-center gap-2 hover:text-primary-600"
                              >
                                 <Mail size={14} />
                                 {hotel.owner?.email}
                              </a>
                           </span>
                        </div>
                        <div className={styles.details__infoItem}>
                           <span className={styles.details__infoLabel}>
                              Phone Number
                           </span>
                           <span className={styles.details__infoValue}>
                              <a
                                 href={`tel:${hotel.owner?.phone_number}`}
                                 className="flex items-center gap-2 hover:text-primary-600"
                              >
                                 <Phone size={14} />
                                 {hotel.owner?.phone_number}
                              </a>
                           </span>
                        </div>
                     </div>
                  </div>
               </section>

               {/* Images */}
               <section className={styles.details__section}>
                  <h3 className={styles.details__sectionTitle}>
                     Business Logo
                  </h3>
                  <div className={styles.details__imageGallery}>
                     {hotel.profile_pic_url ? (
                        <div className={styles.details__imageWrapper}>
                           <img
                              src={hotel.profile_pic_url}
                              alt={`${hotel.name}`}
                           />
                        </div>
                     ) : (
                        <div className={styles.details__imageWrapper}>
                           <img
                              src={`https://ui-avatars.com/api/?name=${hotel.name}`}
                              alt={`${hotel.name}`}
                           />
                        </div>
                     )}
                  </div>
               </section>

               {/* Documents */}
               {hotel.business_license && (
                  <section className={styles.details__section}>
                     <h3 className={styles.details__sectionTitle}>
                        <FileText size={20} />
                        Business License
                     </h3>
                     <div className={styles.details__infoCard}>
                        <a
                           href={hotel.business_license}
                           target="_blank"
                           rel="noopener noreferrer"
                           className={styles.details__documentLink}
                        >
                           <FileText size={20} />
                           View Business License
                        </a>
                     </div>
                  </section>
               )}
            </div>

            {/* Sidebar Actions */}
            <div className={styles.details__sidebar}>
               <div className={styles.details__actions}>
                  <Card className={styles.details__actionCard}>
                     <h4 className={styles.details__actionTitle}>
                        Management Actions
                     </h4>
                     <div className={styles.details__actionButtons}>
                        {hotel.status !== "approved" && (
                           <Button
                              fullWidth
                              variant="primary"
                              onClick={() => handleStatusUpdate("approved")}
                              icon={<CheckCircle size={18} />}
                           >
                              Approve Registration
                           </Button>
                        )}
                        {hotel.status !== "rejected" && (
                           <Button
                              fullWidth
                              variant="danger"
                              onClick={() => handleStatusUpdate("rejected")}
                              icon={<XCircle size={18} />}
                           >
                              Reject Registration
                           </Button>
                        )}
                        {hotel.status !== "pending" && (
                           <Button
                              fullWidth
                              variant="outline"
                              onClick={() => handleStatusUpdate("pending")}
                              icon={<Clock size={18} />}
                           >
                              Reset to Pending
                           </Button>
                        )}
                     </div>
                  </Card>
               </div>
            </div>
         </div>

         {/* Confirmation Modal */}
         <Modal
            isOpen={statusModal.isOpen}
            onClose={() => setStatusModal({ isOpen: false, newStatus: "" })}
            title="Confirm Status Update"
         >
            <div className={styles.statusModal}>
               <p className={styles.statusModal__description}>
                  Are you sure you want to change the status of{" "}
                  <span className={styles.statusModal__hotelName}>
                     {hotel.name}
                  </span>{" "}
                  to{" "}
                  <span className={styles.statusModal__status}>
                     {statusModal.newStatus}
                  </span>
                  ? This action will notify the hotel owner.
               </p>

               <div className={styles.statusModal__actions}>
                  <Button
                     variant="ghost"
                     onClick={() =>
                        setStatusModal({ isOpen: false, newStatus: "" })
                     }
                  >
                     Cancel
                  </Button>

                  <Button
                     variant={
                        statusModal.newStatus === "rejected"
                           ? "danger"
                           : "primary"
                     }
                     onClick={confirmStatusUpdate}
                     loading={statusMutation.isPending}
                  >
                     Confirm Update
                  </Button>
               </div>
            </div>
         </Modal>
      </div>
   );
};

export default HotelDetails;
