import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { Search, Shield, UserX, UserCheck } from "lucide-react";
import { adminApi } from "../../../api/admin";
import useAuthStore from "../../../store/authStore";
import Card from "../../../components/shared/Card/Card";
import Button from "../../../components/shared/Button/Button";
import Table from "../../../components/shared/Table/Table";
import Input from "../../../components/shared/Input/Input";
import Modal from "../../../components/shared/Modal/Modal";
import LoadingSpinner from "../../../components/shared/Loading/LoadingSpinner";
import Pagination from "../../../components/shared/Pagination/Pagination";
import styles from "./Users.module.css";

const Users = () => {
   const queryClient = useQueryClient();
   const { user: currentUser } = useAuthStore();
   const isSuperAdmin = currentUser?.role === "super_admin";

   // State for filters
   const [search, setSearch] = useState("");
   const [debouncedSearch, setDebouncedSearch] = useState("");
   const [roleFilter, setRoleFilter] = useState("");
   const [statusFilter, setStatusFilter] = useState("");
   const [page, setPage] = useState(1);

   // Debounce search
   useEffect(() => {
      const handler = setTimeout(() => {
         setDebouncedSearch(search);
         setPage(1); // Reset page when search changes
      }, 500);

      return () => {
         clearTimeout(handler);
      };
   }, [search]);

   // Modals state
   const [statusModal, setStatusModal] = useState({
      isOpen: false,
      user: null,
   });
   const [roleModal, setRoleModal] = useState({
      isOpen: false,
      user: null,
      selectedRole: "",
   });

   // Fetch users
   const { data, isLoading } = useQuery({
      queryKey: [
         "admin-users",
         { search: debouncedSearch, roleFilter, statusFilter, page },
      ],
      queryFn: () =>
         adminApi
            .getUsers({
               search: debouncedSearch,
               role: roleFilter,
               status: statusFilter,
               page,
               limit: 10,
            })
            .then((res) => res.data),
   });

   // Mutations
   const statusMutation = useMutation({
      mutationFn: ({ id, status }) => adminApi.updateUserStatus(id, status),
      onSuccess: () => {
         toast.success("User status updated successfully");
         queryClient.invalidateQueries(["admin-users"]);
         setStatusModal({ isOpen: false, user: null });
      },
      onError: (error) => {
         toast.error(
            error.response?.data?.message || "Failed to update status"
         );
      },
   });

   const roleMutation = useMutation({
      mutationFn: ({ id, role }) => adminApi.updateUserRole(id, role),
      onSuccess: () => {
         toast.success("User role updated successfully");
         queryClient.invalidateQueries(["admin-users"]);
         setRoleModal({ isOpen: false, user: null, selectedRole: "" });
      },
      onError: (error) => {
         toast.error(error.response?.data?.message || "Failed to update role");
      },
   });

   // Handlers
   const handleStatusToggle = (user) => {
      setStatusModal({ isOpen: true, user });
   };

   const handleRoleUpdate = (user) => {
      setRoleModal({ isOpen: true, user, selectedRole: user.role });
   };

   const confirmStatusUpdate = () => {
      const newStatus =
         statusModal.user.status === "active" ? "inactive" : "active";
      statusMutation.mutate({ id: statusModal.user.id, status: newStatus });
   };

   const confirmRoleUpdate = () => {
      roleMutation.mutate({
         id: roleModal.user.id,
         role: roleModal.selectedRole,
      });
   };

   // Create Admin State
   const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
   const [createFormData, setCreateFormData] = useState({
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      phone_number: "",
      role: "admin",
   });

   const createAdminMutation = useMutation({
      mutationFn: (data) => adminApi.createAdmin(data),
      onSuccess: () => {
         toast.success("User created successfully");
         queryClient.invalidateQueries(["admin-users"]);
         setIsCreateModalOpen(false);
         setCreateFormData({
            first_name: "",
            last_name: "",
            email: "",
            password: "",
            phone_number: "",
            role: "admin",
         });
      },
      onError: (error) => {
         if (error.response?.data?.details?.length > 0) {
            toast.error(error.response?.data?.details[0].msg);
         } else {
            toast.error(
               error.response?.data?.message || "Failed to create user"
            );
         }
      },
   });

   const handleCreateAdmin = (e) => {
      e.preventDefault();
      createAdminMutation.mutate(createFormData);
   };

   // Table Columns
   const columns = useMemo(
      () => [
         {
            key: "name",
            header: "User",
            render: (row) => (
               <div className={styles.users__user}>
                  <div className={styles.users__userImage}>
                     {row.profile_pic_url ? (
                        <img
                           src={row.profile_pic_url}
                           alt={row.first_name}
                           onError={(e) =>
                              (e.target.src = `https://ui-avatars.com/api/?background=random&name=${row.first_name}+${row.last_name}`)
                           }
                        />
                     ) : (
                        <img
                           src={`https://ui-avatars.com/api/?background=random&name=${row.first_name}+${row.last_name}`}
                           alt={row.first_name}
                        />
                     )}
                  </div>
                  <div className={styles.users__userInfo}>
                     <div className={styles.users__userName}>
                        {row.first_name} {row.last_name}
                     </div>
                     <div className={styles.users__userPhone}>
                        {row.phone_number}
                     </div>
                     <div className={styles.users__userEmail}>{row.email}</div>
                  </div>
               </div>
            ),
         },
         {
            key: "role",
            header: "Role",
            render: (row) => (
               <span className={styles.users__role}>
                  {row.role.replace("_", " ")}
               </span>
            ),
         },
         {
            key: "status",
            header: "Status",
            render: (row) => (
               <span
                  className={`${styles.users__status} ${
                     styles[`users__status--${row.status}`]
                  }`}
               >
                  {row.status}
               </span>
            ),
         },
         {
            key: "joined",
            header: "Joined",
            render: (row) => new Date(row.created_at).toLocaleDateString(),
         },
         {
            key: "actions",
            header: "Actions",
            render: (row) => {
               // Admin can't manage other Admins or Super Admins
               const canManage =
                  isSuperAdmin ||
                  (row.role !== "admin" && row.role !== "super_admin");
               const isSelf = row.id === currentUser?.id;

               if (!canManage || isSelf) return null;

               return (
                  <div className={styles.users__actions}>
                     <Button
                        variant="ghost"
                        size="small"
                        onClick={() => handleStatusToggle(row)}
                        title={
                           row.status === "active"
                              ? "Deactivate User"
                              : "Activate User"
                        }
                     >
                        {row.status === "active" ? (
                           <UserX size={18} />
                        ) : (
                           <UserCheck size={18} />
                        )}
                     </Button>

                     {isSuperAdmin && (
                        <button
                           className="p-2 hover:bg-gray-100 rounded-full transition-colors text-primary-600"
                           onClick={() => handleRoleUpdate(row)}
                           title="Change User Role"
                        >
                           <Shield size={18} />
                        </button>
                     )}
                  </div>
               );
            },
         },
      ],
      [isSuperAdmin, currentUser?.id]
   );

   return (
      <div className={styles.users}>
         <div className={styles.users__header}>
            <div>
               <h1 className={styles.users__title}>User Management</h1>
               <p className={styles.users__subtitle}>
                  Manage system users, roles, and account statuses
               </p>
            </div>
            {isSuperAdmin && (
               <Button onClick={() => setIsCreateModalOpen(true)}>
                  Create User
               </Button>
            )}
         </div>

         <div className={styles.users__filters}>
            <div className={styles.users__searchWrapper}>
               <Input
                  placeholder="Search by name or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  icon={<Search size={18} />}
               />
            </div>

            <div className={styles.users__filterGroup}>
               <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase ml-1">
                     Role
                  </label>
                  <select
                     className={styles.users__select}
                     value={roleFilter}
                     onChange={(e) => setRoleFilter(e.target.value)}
                  >
                     <option value="">All Roles</option>
                     <option value="customer">Customer</option>
                     <option value="hotel_owner">Hotel Owner</option>
                     {isSuperAdmin && <option value="admin">Admin</option>}
                  </select>
               </div>

               <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase ml-1">
                     Status
                  </label>
                  <select
                     className={styles.users__select}
                     value={statusFilter}
                     onChange={(e) => setStatusFilter(e.target.value)}
                  >
                     <option value="">All Status</option>
                     <option value="active">Active</option>
                     <option value="inactive">Inactive</option>
                  </select>
               </div>
            </div>
         </div>

         {isLoading ? (
            <div className="p-12">
               <LoadingSpinner />
            </div>
         ) : (
            <>
               <Table columns={columns} data={data?.users || []} />
            </>
         )}

         {data?.total_pages > 1 && (
            <div className={styles.users__pagination}>
               <Pagination
                  currentPage={page}
                  totalPages={data.total_pages}
                  onPageChange={setPage}
               />
            </div>
         )}

         {/* Status Toggle Modal */}
         <Modal
            isOpen={statusModal.isOpen}
            onClose={() => setStatusModal({ isOpen: false, user: null })}
            title="Confirm Status Change"
         >
            <div className={styles.userModal}>
               <p className={styles.userModal__message}>
                  Are you sure you want to{" "}
                  <span className="font-bold">
                     {statusModal.user?.status === "active"
                        ? "deactivate"
                        : "activate"}
                  </span>{" "}
                  user{" "}
                  <span className={styles.userModal__userName}>
                     {statusModal.user?.first_name}{" "}
                     {statusModal.user?.last_name}
                  </span>
                  ?
               </p>
               <div className={styles.userModal__actions}>
                  <Button
                     variant="ghost"
                     onClick={() =>
                        setStatusModal({ isOpen: false, user: null })
                     }
                  >
                     Cancel
                  </Button>
                  <Button
                     variant={
                        statusModal.user?.status === "active"
                           ? "danger"
                           : "primary"
                     }
                     onClick={confirmStatusUpdate}
                     loading={statusMutation.isPending}
                  >
                     {statusModal.user?.status === "active"
                        ? "Deactivate"
                        : "Activate"}
                  </Button>
               </div>
            </div>
         </Modal>

         {/* Role Update Modal */}
         <Modal
            isOpen={roleModal.isOpen}
            onClose={() =>
               setRoleModal({ isOpen: false, user: null, selectedRole: "" })
            }
            title="Update User Role"
         >
            <div className={styles.userModal}>
               <p className={styles.userModal__message}>
                  Select a new role for{" "}
                  <span className={styles.userModal__userName}>
                     {roleModal.user?.first_name} {roleModal.user?.last_name}
                  </span>
                  . This will change their access level across the platform.
               </p>

               <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                     New Role
                  </label>
                  <select
                     className={`${styles.users__select} w-full`}
                     value={roleModal.selectedRole}
                     onChange={(e) =>
                        setRoleModal({
                           ...roleModal,
                           selectedRole: e.target.value,
                        })
                     }
                  >
                     <option value="customer">Customer</option>
                     <option value="hotel_owner">Hotel Owner</option>
                     <option value="admin">Administrator</option>
                  </select>
               </div>

               <div className={styles.userModal__actions}>
                  <Button
                     variant="ghost"
                     onClick={() =>
                        setRoleModal({
                           isOpen: false,
                           user: null,
                           selectedRole: "",
                        })
                     }
                  >
                     Cancel
                  </Button>
                  <Button
                     variant="primary"
                     onClick={confirmRoleUpdate}
                     loading={roleMutation.isPending}
                  >
                     Update Role
                  </Button>
               </div>
            </div>
         </Modal>

         {/* Create Admin Modal */}
         <Modal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            title="Create New User"
         >
            <div className={styles.userModal}>
               <p className={styles.userModal__message}>
                  Fill in the details below to create a new system user
               </p>

               <form
                  onSubmit={handleCreateAdmin}
                  className={styles.userModal__formGrid}
               >
                  <div className={styles.userModal__formGroup}>
                     <label className={styles.userModal__formLabel}>
                        First Name
                     </label>
                     <Input
                        required
                        value={createFormData.first_name}
                        onChange={(e) =>
                           setCreateFormData({
                              ...createFormData,
                              first_name: e.target.value,
                           })
                        }
                        placeholder="e.g. Mikias"
                     />
                  </div>
                  <div className={styles.userModal__formGroup}>
                     <label className={styles.userModal__formLabel}>
                        Last Name
                     </label>
                     <Input
                        required
                        value={createFormData.last_name}
                        onChange={(e) =>
                           setCreateFormData({
                              ...createFormData,
                              last_name: e.target.value,
                           })
                        }
                        placeholder="e.g. Tadesse"
                     />
                  </div>
                  <div
                     className={`${styles.userModal__formGroup} ${styles["userModal__formGroup--full"]}`}
                  >
                     <label className={styles.userModal__formLabel}>
                        Email Address
                     </label>
                     <Input
                        required
                        type="email"
                        value={createFormData.email}
                        onChange={(e) =>
                           setCreateFormData({
                              ...createFormData,
                              email: e.target.value,
                           })
                        }
                        placeholder="admin@gmail.com"
                     />
                  </div>
                  <div className={styles.userModal__formGroup}>
                     <label className={styles.userModal__formLabel}>
                        Password
                     </label>
                     <Input
                        required
                        type="password"
                        value={createFormData.password}
                        onChange={(e) =>
                           setCreateFormData({
                              ...createFormData,
                              password: e.target.value,
                           })
                        }
                        placeholder="••••••••"
                     />
                  </div>
                  <div className={styles.userModal__formGroup}>
                     <label className={styles.userModal__formLabel}>
                        Phone Number
                     </label>
                     <Input
                        required
                        value={createFormData.phone_number}
                        onChange={(e) =>
                           setCreateFormData({
                              ...createFormData,
                              phone_number: e.target.value,
                           })
                        }
                        placeholder="0917471426"
                     />
                  </div>
                  <div className={styles.userModal__formGroup}>
                     <label className={styles.userModal__formLabel}>
                        Account Role
                     </label>
                     <select
                        className={styles.users__select}
                        value={createFormData.role}
                        onChange={(e) =>
                           setCreateFormData({
                              ...createFormData,
                              role: e.target.value,
                           })
                        }
                     >
                        <option value="admin">Administrator</option>
                        <option value="hotel_owner">Hotel Owner</option>
                        <option value="customer">Customer</option>
                     </select>
                  </div>

                  <div
                     className={`${styles.userModal__actions} ${styles["userModal__formGroup--full"]}`}
                  >
                     <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setIsCreateModalOpen(false)}
                     >
                        Cancel
                     </Button>
                     <Button
                        type="submit"
                        variant="primary"
                        loading={createAdminMutation.isPending}
                     >
                        Create User
                     </Button>
                  </div>
               </form>
            </div>
         </Modal>
      </div>
   );
};

export default Users;
