import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "../../../api/admin";
import Card from "../../../components/shared/Card/Card";
import Button from "../../../components/shared/Button/Button";
import Table from "../../../components/shared/Table/Table";
import LoadingSpinner from "../../../components/shared/Loading/LoadingSpinner";
import Pagination from "../../../components/shared/Pagination/Pagination";
import Input from "../../../components/shared/Input/Input";
import { Search, Calendar, User, Hotel as HotelIcon } from "lucide-react";
import styles from "./Bookings.module.css";
import { formatCurrency } from "../../../utils/helpers";

const AdminBookings = () => {
   const navigate = useNavigate();
   const [page, setPage] = useState(1);
   const pageSize = 10;
   const [statusFilter, setStatusFilter] = useState("all");
   const [search, setSearch] = useState("");
   const [debouncedSearch, setDebouncedSearch] = useState("");
   const [dates, setDates] = useState({ checkIn: "", checkOut: "" });

   // Debounce search
   useEffect(() => {
      const handler = setTimeout(() => {
         setDebouncedSearch(search);
         setPage(1);
      }, 1000);

      return () => clearTimeout(handler);
   }, [search]);

   // Fetch bookings
   const { data: bookingsData, isLoading } = useQuery({
      queryKey: ["admin-bookings", page, statusFilter, debouncedSearch, dates],
      queryFn: async () => {
         const params = {
            page,
            limit: pageSize,
            status: statusFilter !== "all" ? statusFilter : undefined,
            search: debouncedSearch || undefined,
            check_in: dates.checkIn || undefined,
            check_out: dates.checkOut || undefined,
         };
         const response = await adminApi.getAllBookings(params);
         return response.data;
      },
      keepPreviousData: true,
   });

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
            <span className={styles.reference}>{row.booking_reference}</span>
         ),
      },
      {
         key: "guest",
         header: "Guest",
         render: (row) => (
            <div className={styles.guestCell}>
               <img
                  src={
                     row?.profile_pic_url ||
                     `https://ui-avatars.com/api/?name=${row?.first_name}+${row?.last_name}&background=random`
                  }
                  alt=""
                  className={styles.guestAvatar}
               />
               <div className={styles.guestInfo}>
                  <span className={styles.infoName}>
                     {row?.first_name} {row?.last_name}
                  </span>
                  <span className={styles.infoSecondary}>{row?.email}</span>
               </div>
            </div>
         ),
      },
      {
         key: "hotel",
         header: "Hotel",
         render: (row) => (
            <div className={styles.hotelInfo}>
               <span className={styles.infoName}>{row?.hotel_name}</span>
               <span className={styles.infoSecondary}>
                  {row?.hotel_location}
               </span>
            </div>
         ),
      },
      {
         key: "room",
         header: "Room #",
         render: (row) => <span>{row?.room_number}</span>,
      },
      {
         key: "dates",
         header: "Dates",
         render: (row) => (
            <div className={styles.infoSecondary}>
               <div>In: {new Date(row.check_in).toLocaleDateString()}</div>
               <div>Out: {new Date(row.check_out).toLocaleDateString()}</div>
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
               } dark:text-gray-100`}
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
               <h1 className={styles.title}>System Bookings</h1>
               <p className={styles.subtitle}>
                  Overview of all reservations across the platform
               </p>
            </div>
         </div>

         <Card className={styles.filtersCard}>
            <div className={styles.filtersGrid}>
               <div className={styles.filterGroup}>
                  <label className={styles.filterLabel}>Search Reference</label>
                  <Input
                     placeholder="Search by reference..."
                     value={search}
                     onChange={(e) => setSearch(e.target.value)}
                     icon={<Search size={18} />}
                  />
               </div>

               <div className={styles.filterGroup}>
                  <label className={styles.filterLabel}>Check-in Date</label>
                  <Input
                     type="date"
                     name="checkIn"
                     value={dates.checkIn}
                     onChange={handleDateChange}
                     icon={<Calendar size={18} />}
                  />
               </div>

               <div className={styles.filterGroup}>
                  <label className={styles.filterLabel}>Check-out Date</label>
                  <Input
                     type="date"
                     name="checkOut"
                     value={dates.checkOut}
                     onChange={handleDateChange}
                     icon={<Calendar size={18} />}
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
                     <div className={styles.tableContainer}>
                        <Table
                           columns={columns}
                           data={bookingsData?.bookings}
                           onRowClick={(row) =>
                              navigate(`/admin/bookings/${row.id}`)
                           }
                        />
                     </div>
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
                           : "There are no bookings in the system yet."}
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

export default AdminBookings;
