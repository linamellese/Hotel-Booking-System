import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { hotelOwnerApi } from "../../../api/hotelOwner";
import Card from "../../../components/shared/Card/Card";
import Button from "../../../components/shared/Button/Button";
import Table from "../../../components/shared/Table/Table";
import LoadingSpinner from "../../../components/shared/Loading/LoadingSpinner";
import styles from "./Bookings.module.css";
import useAuthStore from "../../../store/authStore";
import Pagination from "../../../components/shared/Pagination/Pagination";
import Input from "../../../components/shared/Input/Input";
import { formatCurrency } from "../../../utils/helpers";

const Bookings = () => {
   const location = useLocation();
   const queryParams = new URLSearchParams(location.search);
   const [page, setPage] = useState(1);
   const pageSize = 10;
   const [statusFilter, setStatusFilter] = useState("all");
   const [search, setSearch] = useState("");
   const [debouncedSearch, setDebouncedSearch] = useState("");
   const [dates, setDates] = useState({ checkIn: "", checkOut: "" });
   const [hotelId, setHotelId] = useState(null);

   // Debounce search
   useEffect(() => {
      const handler = setTimeout(() => {
         setDebouncedSearch(search);
         setPage(1); // Reset page when search changes
      }, 1000);

      return () => {
         clearTimeout(handler);
      };
   }, [search]);

   const { user } = useAuthStore();

   // Fetch hotel ID
   const { data: hotelData } = useQuery({
      queryKey: ["my-hotel"],
      queryFn: async () => {
         const res = await hotelOwnerApi.getMyHotel();
         return res.data;
      },
      staleTime: Infinity,
   });

   // Fetch bookings
   const { data: bookingsData, isLoading } = useQuery({
      queryKey: [
         "hotel-bookings",
         hotelId,
         page,
         statusFilter,
         debouncedSearch,
         dates,
      ],
      queryFn: async () => {
         const params = {
            page,
            limit: pageSize,
            status: statusFilter !== "all" ? statusFilter : undefined,
            search: debouncedSearch || undefined,
            check_in: dates.checkIn || undefined,
            check_out: dates.checkOut || undefined,
         };
         const response = await hotelOwnerApi.getHotelBookings(hotelId, params);
         return response.data;
      },
      enabled: Boolean(hotelId),
      keepPreviousData: true,
   });

   // Set hotel ID from hotelData
   useEffect(() => {
      if (hotelData) {
         setHotelId(hotelData.id);
      }
   }, [hotelData]);

   const statusOptions = [
      { value: "all", label: "All" },
      { value: "pending", label: "Pending" },
      { value: "paid", label: "Paid" },
   ];

   const handlePageChange = (p) => setPage(p);

   const handleDateChange = (e) => {
      setDates((prev) => ({ ...prev, [e.target.name]: e.target.value }));
      setPage(1);
   };

   const columns = [
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

   const totalPages = bookingsData?.pagination?.total_pages || 1;
   const totalItems = bookingsData?.pagination?.total || 0;

   return (
      <div className={styles.bookings}>
         <div className={styles.header}>
            <div>
               <h1 className={styles.title}>Bookings</h1>
               <p className={styles.subtitle}>Manage your hotel reservations</p>
            </div>
         </div>

         <Card className={styles.filtersCard}>
            <div className={styles.filtersGrid}>
               {/* Search */}
               <div className={styles.filterGroup}>
                  <label className={styles.filterLabel}>Search Reference</label>
                  <Input
                     placeholder="Search by reference..."
                     value={search}
                     onChange={(e) => {
                        setSearch(e.target.value);
                     }}
                     containerClassName="w-full min-w-[200px]"
                  />
               </div>

               {/* Date Filters */}
               <div className={styles.filterGroup}>
                  <label className={styles.filterLabel}>Check-in Date</label>
                  <Input
                     type="date"
                     name="checkIn"
                     value={dates.checkIn}
                     onChange={handleDateChange}
                  />
               </div>
               <div className={styles.filterGroup}>
                  <label className={styles.filterLabel}>Check-out Date</label>
                  <Input
                     type="date"
                     name="checkOut"
                     value={dates.checkOut}
                     onChange={handleDateChange}
                  />
               </div>

               <div className={styles.filterGroup}>
                  <label className={styles.filterLabel}>Status</label>
                  <div className={styles.statusButtons}>
                     {statusOptions.map((option) => (
                        <button
                           key={option.value}
                           className={`${styles.statusButton} ${
                              statusFilter === option.value
                                 ? styles["statusButton--active"]
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

         <div className={styles.content}>
            {isLoading && !bookingsData && <LoadingSpinner />}

            {!isLoading && bookingsData?.bookings?.length !== 0 && (
               <>
                  <div className={styles.tableWrapper}>
                     <Table
                        columns={columns}
                        data={bookingsData?.bookings}
                        className={styles.table}
                     />
                  </div>
                  {totalPages > 1 && (
                     <div className={styles.paginationContainer}>
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

            {!isLoading && !bookingsData?.bookings?.length && (
               <Card className={styles.emptyCard}>
                  <div className={styles.emptyContent}>
                     <div className={styles.emptyIcon}>📅</div>
                     <h3 className={styles.emptyTitle}>No Bookings Found</h3>
                     <p className={styles.emptyMessage}>
                        {statusFilter !== "all"
                           ? "Try adjusting your filters"
                           : "You don't have any bookings yet."}
                     </p>
                     {statusFilter !== "all" && (
                        <Button
                           variant="outline"
                           onClick={() => setStatusFilter("all")}
                        >
                           Clear Filters
                        </Button>
                     )}
                  </div>
               </Card>
            )}
         </div>
      </div>
   );
};

export default Bookings;
