import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { customerApi } from "../../../api/customer";
import Card from "../../../components/shared/Card/Card";
import Button from "../../../components/shared/Button/Button";
import Table from "../../../components/shared/Table/Table";
import LoadingSpinner from "../../../components/shared/Loading/LoadingSpinner";
import Modal from "../../../components/shared/Modal/Modal";
import styles from "./Bookings.module.css";
import useAuthStore from "../../../store/authStore";
import Pagination from "../../../components/shared/Pagination/Pagination";
import toast from "react-hot-toast";
import { formatCurrency } from "../../../utils/helpers";

const Bookings = () => {
   const location = useLocation();
   const navigate = useNavigate();
   const queryParams = new URLSearchParams(location.search);
   const [searchTerm, setSearchTerm] = useState("");
   const [statusFilter, setStatusFilter] = useState(
      queryParams.get("filter") || "all"
   );
   const [page, setPage] = useState(1);
   const pageSize = 10; // Fixed page size

   // Modal state
   const [showCancelModal, setShowCancelModal] = useState(false);
   const [selectedBooking, setSelectedBooking] = useState(null);

   // User info
   const { user } = useAuthStore();
   const userId = user?.id;

   // Fetch bookings with filters
   const {
      data: bookingsData,
      isLoading,
      refetch,
   } = useQuery({
      queryKey: ["customer-bookings", page, statusFilter, searchTerm],
      queryFn: async () => {
         const response = await customerApi.getBookings(userId, {
            page,
            status: statusFilter !== "all" ? statusFilter : undefined,
            search: searchTerm || undefined,
            limit: pageSize,
         });
         return response.data;
      },
      keepPreviousData: true,
      enabled: Boolean(userId),
   });

   // Booking status options - updated to match your actual statuses
   const statusOptions = [
      { value: "all", label: "All Bookings" },
      { value: "pending", label: "Pending" },
      { value: "paid", label: "Paid" },
   ];

   // Handle booking cancellation
   const cancelMutation = useMutation({
      mutationFn: () => customerApi.cancelBooking(selectedBooking.id),
      onSuccess: () => {
         toast.success("Booking cancelled successfully");
         setShowCancelModal(false);
         setSelectedBooking(null);
         setPage(1);
         refetch();
      },
   });

   // Handle page change
   const handlePageChange = (page) => {
      setPage(page);
   };

   // Table columns
   const columns = [
      {
         key: "booking_reference", // Changed from confirmation_number
         header: "Confirmation #",
         render: (row) => (
            <Link
               to={`/customer/bookings/${row.id}`}
               className={styles.bookings__confirmationLink}
            >
               {row.booking_reference}
            </Link>
         ),
      },
      {
         key: "hotel_name",
         header: "Hotel",
         render: (row) => (
            <div>
               <div className={styles.bookings__hotelName}>
                  {row.hotel_name}
               </div>
            </div>
         ),
      },
      {
         key: "room_type", // Changed from room_type_name
         header: "Room Type",
         render: (row) => (
            <div>
               <div className={styles.bookings__hotelName}>{row.room_type}</div>
            </div>
         ),
      },
      {
         key: "check_in",
         header: "Dates",
         render: (row) => (
            <div>
               <div>{new Date(row.check_in).toLocaleDateString()}</div>
               <div className={styles.bookings__dateSeparator}>to</div>
               <div>{new Date(row.check_out).toLocaleDateString()}</div>
            </div>
         ),
      },
      {
         key: "room_number", // Added room number since it's in your data
         header: "Room #",
         render: (row) => (
            <div>
               <div className={styles.bookings__hotelName}>
                  {row.room_number}
               </div>
            </div>
         ),
      },
      {
         key: "total_amount", // Changed from total_price
         header: "Total",
         render: (row) => (
            <div className={styles.bookings__price}>
               {formatCurrency(row.total_amount)}
            </div>
         ),
      },
      {
         key: "status",
         header: "Status",
         render: (row) => (
            <span
               className={`${styles.bookings__status} ${
                  styles[`bookings__status--${row.status.toLowerCase()}`]
               }`}
            >
               {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
            </span>
         ),
      },
      {
         key: "actions",
         header: "Actions",
         render: (row) => (
            <div className={styles.bookings__actionButtons}>
               {row.status === "paid" && (
                  <Link
                     to={`/customer/bookings/${row.id}`}
                     className={`${styles.bookings__actionButton} ${styles["bookings__actionButton--view"]}`}
                  >
                     View
                  </Link>
               )}
               {/* pay */}
               {row.status === "pending" && (
                  <>
                     <Link
                        to={`/customer/bookings/${row.id}`}
                        className={`${styles.bookings__actionButton} ${styles["bookings__actionButton--pay"]}`}
                     >
                        Pay
                     </Link>

                     <button
                        onClick={() => {
                           setSelectedBooking(row);
                           setShowCancelModal(true);
                        }}
                        className={`${styles.bookings__actionButton} ${styles["bookings__actionButton--cancel"]}`}
                     >
                        Cancel
                     </button>
                  </>
               )}
            </div>
         ),
      },
   ];

   const totalPages = bookingsData?.pagination?.total_pages || 1;
   const totalItems = bookingsData?.pagination?.total || 0;

   // ... rest of the component remains the same ...

   return (
      <div className={styles.bookings}>
         {/* Header */}
         <div className={styles.bookings__header}>
            <div>
               <h1 className={styles.bookings__title}>My Bookings</h1>
               <p className={styles.bookings__subtitle}>
                  Manage and view all your hotel reservations
               </p>
            </div>
            <Link
               to="/room-types"
               className={styles.bookings__newBookingButton}
            >
               + New Booking
            </Link>
         </div>

         {/* Filters */}
         <Card className={styles.bookings__filtersCard}>
            <div className={styles.bookings__filtersGrid}>
               <div className={styles.bookings__filterGroup}>
                  <label className={styles.bookings__filterLabel}>Status</label>
                  <div className={styles.bookings__statusButtons}>
                     {statusOptions.map((option) => (
                        <button
                           key={option.value}
                           className={`${styles.bookings__statusButton} ${
                              statusFilter === option.value
                                 ? styles["bookings__statusButton--active"]
                                 : ""
                           }`}
                           onClick={() => {
                              setStatusFilter(option.value);
                              setPage(1);
                           }}
                        >
                           {option.label}
                        </button>
                     ))}
                  </div>
               </div>
            </div>
         </Card>

         {/* CONTENT AREA */}
         <div className={styles.bookings__content}>
            {isLoading && !bookingsData && <LoadingSpinner />}

            {!isLoading && bookingsData?.bookings?.length > 0 && (
               <>
                  {/* ONLY THIS SCROLLS */}
                  <div className={styles.bookings__tableWrapper}>
                     <Table
                        columns={columns}
                        data={bookingsData.bookings}
                        onRowClick={(row) =>
                           navigate(`/customer/bookings/${row.id}`)
                        }
                        className={styles.bookings__table}
                     />
                  </div>

                  {/* Pagination (fixed) */}
                  {bookingsData.pagination.total_pages > 1 && (
                     <div className={styles.bookings__paginationContainer}>
                        <Pagination
                           currentPage={page}
                           totalPages={totalPages}
                           totalItems={totalItems}
                           pageSize={pageSize}
                           onPageChange={handlePageChange}
                           showPageSizeOptions={false}
                        />
                     </div>
                  )}
               </>
            )}

            {(!bookingsData || bookingsData?.bookings?.length === 0) &&
               !isLoading && (
                  <Card className={styles.bookings__emptyCard}>
                     <div className={styles.bookings__emptyContent}>
                        <div className={styles.bookings__emptyIcon}>📋</div>
                        <h3 className={styles.bookings__emptyTitle}>
                           No Bookings Found
                        </h3>
                        <p className={styles.bookings__emptyMessage}>
                           {searchTerm || statusFilter !== "all"
                              ? "Try adjusting your search or filters"
                              : "You haven't made any bookings yet"}
                        </p>
                        <div className={styles.bookings__emptyActions}>
                           <Link
                              to="/room-types"
                              className={styles.bookings__emptyAction}
                           >
                              Find Rooms
                           </Link>
                           {(searchTerm || statusFilter !== "all") && (
                              <Button
                                 variant="outline"
                                 onClick={() => {
                                    setSearchTerm("");
                                    setStatusFilter("all");
                                 }}
                              >
                                 Clear Filters
                              </Button>
                           )}
                        </div>
                     </div>
                  </Card>
               )}
         </div>
         {/* Cancel Booking Modal */}
         <Modal
            isOpen={showCancelModal}
            onClose={() => {
               setShowCancelModal(false);
               setSelectedBooking(null);
            }}
            title="Cancel Booking"
            size="md"
         >
            {selectedBooking && (
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
                           {selectedBooking.hotel_name}
                        </span>
                     </div>
                     <div className={styles.bookings__cancelDetail}>
                        <span className={styles.bookings__cancelLabel}>
                           Room:
                        </span>
                        <span className={styles.bookings__cancelValue}>
                           {selectedBooking.room_type} (Room #{" "}
                           {selectedBooking.room_number})
                        </span>
                     </div>
                     <div className={styles.bookings__cancelDetail}>
                        <span className={styles.bookings__cancelLabel}>
                           Dates:
                        </span>
                        <span className={styles.bookings__cancelValue}>
                           {new Date(
                              selectedBooking.check_in
                           ).toLocaleDateString()}{" "}
                           -{" "}
                           {new Date(
                              selectedBooking.check_out
                           ).toLocaleDateString()}
                        </span>
                     </div>
                     <div className={styles.bookings__cancelDetail}>
                        <span className={styles.bookings__cancelLabel}>
                           Total:
                        </span>
                        <span className={styles.bookings__cancelValue}>
                           {formatCurrency(selectedBooking.total_amount)}
                        </span>
                     </div>
                     <div className={styles.bookings__cancelDetail}>
                        <span className={styles.bookings__cancelLabel}>
                           Reference:
                        </span>
                        <span className={styles.bookings__cancelValue}>
                           {selectedBooking.booking_reference}
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
                           setSelectedBooking(null);
                        }}
                     >
                        Keep Booking
                     </Button>
                     <Button
                        variant="danger"
                        onClick={() => cancelMutation.mutate()}
                     >
                        Cancel Booking
                     </Button>
                  </div>
               </div>
            )}
         </Modal>
      </div>
   );
};

export default Bookings;
