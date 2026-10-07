import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { Search, Hotel, CheckCircle, XCircle, Clock, User } from "lucide-react";
import { adminApi } from "../../../api/admin";
import Button from "../../../components/shared/Button/Button";
import Table from "../../../components/shared/Table/Table";
import Input from "../../../components/shared/Input/Input";
import Modal from "../../../components/shared/Modal/Modal";
import LoadingSpinner from "../../../components/shared/Loading/LoadingSpinner";
import Pagination from "../../../components/shared/Pagination/Pagination";
import styles from "./Hotels.module.css";

const Hotels = () => {
   const navigate = useNavigate();
   const queryClient = useQueryClient();

   // State for filters
   const [search, setSearch] = useState("");
   const [debouncedSearch, setDebouncedSearch] = useState("");
   const [statusFilter, setStatusFilter] = useState("");
   const [page, setPage] = useState(1);

   // Modals state
   const [statusModal, setStatusModal] = useState({
      isOpen: false,
      hotel: null,
      newStatus: "",
   });

   // Debounce search
   useEffect(() => {
      const handler = setTimeout(() => {
         setDebouncedSearch(search);
         setPage(1);
      }, 500);
      return () => clearTimeout(handler);
   }, [search]);

   // Fetch hotels
   const { data, isLoading } = useQuery({
      queryKey: [
         "admin-hotels",
         { search: debouncedSearch, statusFilter, page },
      ],
      queryFn: () =>
         adminApi
            .getHotels({
               search: debouncedSearch,
               status: statusFilter,
               page,
               limit: 10,
            })
            .then((res) => res.data),
   });

   // Mutation for status update
   const statusMutation = useMutation({
      mutationFn: ({ id, status }) => adminApi.updateHotelStatus(id, status),
      onSuccess: () => {
         toast.success("Hotel status updated successfully");
         queryClient.invalidateQueries(["admin-hotels"]);
         setStatusModal({ isOpen: false, hotel: null, newStatus: "" });
      },
      onError: (error) => {
         toast.error(
            error.response?.data?.message || "Failed to update status"
         );
      },
   });

   const handleStatusChange = (e, hotel, newStatus) => {
      e.stopPropagation(); // Prevent row click
      setStatusModal({ isOpen: true, hotel, newStatus });
   };

   const confirmStatusUpdate = () => {
      statusMutation.mutate({
         id: statusModal.hotel.id,
         status: statusModal.newStatus,
      });
   };

   const columns = useMemo(
      () => [
         {
            key: "hotel",
            header: "Hotel",
            render: (row) => (
               <div className={styles.hotels__hotel}>
                  <div className={styles.hotels__hotelImage}>
                     {row.profile_pic_url ? (
                        <img src={row.profile_pic_url} alt={row.name} />
                     ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                           <Hotel size={24} />
                        </div>
                     )}
                  </div>
                  <div className={styles.hotels__hotelInfo}>
                     <div className={styles.hotels__hotelName}>{row.name}</div>
                     <div className={styles.hotels__location}>
                        {row.location}
                     </div>
                  </div>
               </div>
            ),
         },
         {
            key: "owner",
            header: "Owner",
            render: (row) => (
               <div className={styles.hotels__owner}>
                  <div className={styles.hotels__ownerImage}>
                     {row.owner_profile_pic_url ? (
                        <img
                           src={row.owner_profile_pic_url}
                           alt={row.first_name}
                           onError={(e) =>
                              (e.target.src = `https://ui-avatars.com/api/?color=random&name=${row.first_name}+${row.last_name}`)
                           }
                        />
                     ) : (
                        <img
                           src={`https://ui-avatars.com/api/?color=random&name=${row.first_name}+${row.last_name}`}
                           alt={row.first_name}
                        />
                     )}
                  </div>
                  <div className={styles.hotels__info}>
                     <div className={styles.hotels__infoName}>
                        {row.first_name} {row.last_name}
                     </div>
                     <div className={styles.hotels__infoPhone}>
                        {row.phone_number}
                     </div>
                     <div className={styles.hotels__infoEmail}>{row.email}</div>
                  </div>
               </div>
            ),
         },
         {
            key: "status",
            header: "Status",
            render: (row) => (
               <span
                  className={`${styles.hotels__status} ${
                     styles[`hotels__status--${row.status}`]
                  }`}
               >
                  {row.status}
               </span>
            ),
         },
         {
            key: "actions",
            header: "Actions",
            render: (row) => (
               <div className={styles.hotels__actions}>
                  {row.status !== "approved" && (
                     <Button
                        variant="ghost"
                        size="small"
                        onClick={(e) => handleStatusChange(e, row, "approved")}
                        className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                        title="Approve Hotel"
                     >
                        <CheckCircle size={18} />
                     </Button>
                  )}
                  {row.status !== "rejected" && (
                     <Button
                        variant="ghost"
                        size="small"
                        onClick={(e) => handleStatusChange(e, row, "rejected")}
                        className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                        title="Reject Hotel"
                     >
                        <XCircle size={18} />
                     </Button>
                  )}
                  {row.status !== "pending" && (
                     <Button
                        variant="ghost"
                        size="small"
                        onClick={(e) => handleStatusChange(e, row, "pending")}
                        className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                        title="Reset to Pending"
                     >
                        <Clock size={18} />
                     </Button>
                  )}
               </div>
            ),
         },
      ],
      []
   );

   return (
      <div className={styles.hotels}>
         <div className={styles.hotels__header}>
            <h1 className={styles.hotels__title}>Hotel Management</h1>
            <p className={styles.hotels__subtitle}>
               Review registrations, approve or reject hotel applications
            </p>
         </div>

         <div className={styles.hotels__filters}>
            <div className={styles.hotels__searchWrapper}>
               <Input
                  placeholder="Search by hotel name or city..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  icon={<Search size={18} />}
               />
            </div>

            <div className={styles.hotels__filterGroup}>
               <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase ml-1">
                     Status
                  </label>
                  <select
                     className={styles.hotels__select}
                     value={statusFilter}
                     onChange={(e) => setStatusFilter(e.target.value)}
                  >
                     <option value="">All Statuses</option>
                     <option value="pending">Pending</option>
                     <option value="approved">Approved</option>
                     <option value="rejected">Rejected</option>
                  </select>
               </div>
            </div>
         </div>

         {isLoading ? (
            <div className="p-12">
               <LoadingSpinner />
            </div>
         ) : (
            <Table
               columns={columns}
               data={data?.hotels || []}
               onRowClick={(row) => navigate(`/admin/hotels/${row.id}`)}
            />
         )}

         {data?.total_pages > 1 && (
            <div className={styles.hotels__pagination}>
               <Pagination
                  currentPage={page}
                  totalPages={data.total_pages}
                  onPageChange={setPage}
               />
            </div>
         )}

         <Modal
            isOpen={statusModal.isOpen}
            onClose={() =>
               setStatusModal({ isOpen: false, hotel: null, newStatus: "" })
            }
            title="Confirm Status Change"
         >
            <div className={styles.hotelModal}>
               <p className={styles.hotelModal__message}>
                  Are you sure you want to change the status of{" "}
                  <span className={styles.hotelModal__hotelName}>
                     {statusModal.hotel?.name}
                  </span>{" "}
                  to{" "}
                  <span className="font-bold uppercase">
                     {statusModal.newStatus}
                  </span>
                  ?
               </p>
               <div className={styles.hotelModal__actions}>
                  <Button
                     variant="ghost"
                     onClick={() =>
                        setStatusModal({
                           isOpen: false,
                           hotel: null,
                           newStatus: "",
                        })
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

export default Hotels;
