import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import {
   Plus,
   Search,
   Pencil,
   Trash2,
   Upload,
   Image as ImageIcon,
   X,
} from "lucide-react";
import { adminApi } from "../../../api/admin";
import { uploadImage } from "../../../utils/upload";
import Card from "../../../components/shared/Card/Card";
import Button from "../../../components/shared/Button/Button";
import Table from "../../../components/shared/Table/Table";
import Input from "../../../components/shared/Input/Input";
import Modal from "../../../components/shared/Modal/Modal";
import LoadingSpinner from "../../../components/shared/Loading/LoadingSpinner";
import styles from "./PropertySetup.module.css";

const PropertySetup = () => {
   const queryClient = useQueryClient();
   const [activeTab, setActiveTab] = useState("amenities");
   const [search, setSearch] = useState("");

   // --- Modal States ---
   const [amenityModal, setAmenityModal] = useState({
      isOpen: false,
      isEditing: false,
      data: { id: null, name: "", icon_url: "", icon_public_id: "" },
   });

   const [bedTypeModal, setBedTypeModal] = useState({
      isOpen: false,
      isEditing: false,
      data: { id: null, name: "" },
   });

   const [deleteModal, setDeleteModal] = useState({
      isOpen: false,
      type: "", // 'amenity' or 'bedType'
      id: null,
      name: "",
   });

   // --- Fetching Data ---
   const { data: amenities, isLoading: loadingAmenities } = useQuery({
      queryKey: ["admin-amenities"],
      queryFn: () => adminApi.getAmenities().then((res) => res.data.amenities),
   });

   const { data: bedTypes, isLoading: loadingBedTypes } = useQuery({
      queryKey: ["admin-bed-types"],
      queryFn: () => adminApi.getBedTypes().then((res) => res.data.bed_types),
   });

   // --- Queries & Filtering ---
   const filteredAmenities = useMemo(() => {
      if (!amenities) return [];
      return amenities?.filter((a) =>
         a.name.toLowerCase().includes(search.toLowerCase())
      );
   }, [amenities, search]);

   const filteredBedTypes = useMemo(() => {
      if (!bedTypes) return [];
      return bedTypes?.filter((b) =>
         b.name.toLowerCase().includes(search.toLowerCase())
      );
   }, [bedTypes, search]);

   // --- Mutations ---
   const amenityMutation = useMutation({
      mutationFn: ({ id, data, isEditing }) =>
         isEditing
            ? adminApi.updateAmenity(id, data)
            : adminApi.createAmenity(data),
      onSuccess: () => {
         queryClient.invalidateQueries(["admin-amenities"]);
         toast.success(
            `Amenity ${
               amenityModal.isEditing ? "updated" : "created"
            } successfully`
         );
         setAmenityModal({
            isOpen: false,
            isEditing: false,
            data: { name: "", icon_url: "", icon_public_id: "" },
         });
      },
      onError: (err) => {
         toast.error(err.response?.data?.message || "Operation failed");
      },
   });

   const bedTypeMutation = useMutation({
      mutationFn: ({ id, data, isEditing }) =>
         isEditing
            ? adminApi.updateBedType(id, data)
            : adminApi.createBedType(data),
      onSuccess: () => {
         queryClient.invalidateQueries(["admin-bed-types"]);
         toast.success(
            `Bed type ${
               bedTypeModal.isEditing ? "updated" : "created"
            } successfully`
         );
         setBedTypeModal({
            isOpen: false,
            isEditing: false,
            data: { name: "" },
         });
      },
      onError: (err) => {
         toast.error(err.response?.data?.message || "Operation failed");
      },
   });

   const deleteMutation = useMutation({
      mutationFn: ({ id, type }) =>
         type === "amenity"
            ? adminApi.deleteAmenity(id)
            : adminApi.deleteBedType(id),
      onSuccess: (_, variables) => {
         queryClient.invalidateQueries([
            `admin-${variables.type === "amenity" ? "amenities" : "bed-types"}`,
         ]);
         toast.success("Deleted successfully");
         setDeleteModal({ isOpen: false, type: "", id: null, name: "" });
      },
   });

   // --- Handlers ---
   const handleUploadIcon = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      try {
         const loadingToast = toast.loading("Uploading icon...");
         const res = await uploadImage(file);
         toast.dismiss(loadingToast);
         setAmenityModal((prev) => ({
            ...prev,
            data: {
               ...prev.data,
               icon_url: res.secure_url,
               icon_public_id: res.public_id,
            },
         }));
      } catch (err) {
         toast.error("Upload failed");
      }
   };

   const saveAmenity = (e) => {
      e.preventDefault();
      const { id, name, icon_url, icon_public_id } = amenityModal.data;
      if (!name || !icon_url) return toast.error("Name and icon are required");
      amenityMutation.mutate({
         id,
         data: { name, icon_url, icon_public_id },
         isEditing: amenityModal.isEditing,
      });
   };

   const saveBedType = (e) => {
      e.preventDefault();
      const { id, name } = bedTypeModal.data;
      if (!name) return toast.error("Name is required");
      bedTypeMutation.mutate({
         id,
         data: { name },
         isEditing: bedTypeModal.isEditing,
      });
   };

   // --- Table Config ---
   const amenityColumns = [
      {
         key: "amenity",
         header: "Amenity",
         render: (row) => (
            <div className={styles.setup__amenity}>
               <div className={styles.setup__icon}>
                  {row.icon_url ? (
                     <img src={row.icon_url} alt={row.name} />
                  ) : (
                     <ImageIcon size={20} />
                  )}
               </div>
               <span className={styles.setup__name}>{row.name}</span>
            </div>
         ),
      },
      {
         key: "actions",
         header: "Actions",
         render: (row) => (
            <div className={styles.setup__tableActions}>
               <Button
                  variant="ghost"
                  size="small"
                  onClick={() =>
                     setAmenityModal({
                        isOpen: true,
                        isEditing: true,
                        data: row,
                     })
                  }
               >
                  <Pencil size={18} />
               </Button>
               <Button
                  variant="ghost"
                  size="small"
                  className="text-rose-600"
                  onClick={() =>
                     setDeleteModal({
                        isOpen: true,
                        type: "amenity",
                        id: row.id,
                        name: row.name,
                     })
                  }
               >
                  <Trash2 size={18} />
               </Button>
            </div>
         ),
      },
   ];

   const bedTypeColumns = [
      {
         key: "name",
         header: "Bed Type",
         render: (row) => (
            <span className={styles.setup__name}>{row.name}</span>
         ),
      },
      {
         key: "actions",
         header: "Actions",
         render: (row) => (
            <div className={styles.setup__tableActions}>
               <Button
                  variant="ghost"
                  size="small"
                  onClick={() =>
                     setBedTypeModal({
                        isOpen: true,
                        isEditing: true,
                        data: row,
                     })
                  }
               >
                  <Pencil size={18} />
               </Button>
               <Button
                  variant="ghost"
                  size="small"
                  className="text-rose-600"
                  onClick={() =>
                     setDeleteModal({
                        isOpen: true,
                        type: "bedType",
                        id: row.id,
                        name: row.name,
                     })
                  }
               >
                  <Trash2 size={18} />
               </Button>
            </div>
         ),
      },
   ];

   return (
      <div className={styles.setup}>
         <div className={styles.setup__header}>
            <h1 className={styles.setup__title}>Property Setup</h1>
            <p className={styles.setup__subtitle}>
               Manage system-wide amenities and available bed configurations
            </p>
         </div>

         <div className={styles.setup__tabs}>
            <button
               className={`${styles.setup__tab} ${
                  activeTab === "amenities" ? styles["setup__tab--active"] : ""
               }`}
               onClick={() => setActiveTab("amenities")}
            >
               Amenities
            </button>
            <button
               className={`${styles.setup__tab} ${
                  activeTab === "bedTypes" ? styles["setup__tab--active"] : ""
               }`}
               onClick={() => setActiveTab("bedTypes")}
            >
               Bed Types
            </button>
         </div>

         <div className={styles.setup__actions}>
            <div className={styles.setup__searchWrapper}>
               <Input
                  placeholder={`Search ${
                     activeTab === "amenities" ? "amenities" : "bed types"
                  }...`}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  icon={<Search size={18} />}
               />
            </div>
            <Button
               icon={<Plus size={18} />}
               onClick={() =>
                  activeTab === "amenities"
                     ? setAmenityModal({
                          isOpen: true,
                          isEditing: false,
                          data: { name: "", icon_url: "", icon_public_id: "" },
                       })
                     : setBedTypeModal({
                          isOpen: true,
                          isEditing: false,
                          data: { name: "" },
                       })
               }
            >
               Add {activeTab === "amenities" ? "Amenity" : "Bed Type"}
            </Button>
         </div>

         <div className={styles.setup__content}>
            {activeTab === "amenities" ? (
               loadingAmenities ? (
                  <LoadingSpinner />
               ) : (
                  <Table columns={amenityColumns} data={filteredAmenities} />
               )
            ) : loadingBedTypes ? (
               <LoadingSpinner />
            ) : (
               <Table columns={bedTypeColumns} data={filteredBedTypes} />
            )}
         </div>

         {/* Amenity Modal */}
         <Modal
            isOpen={amenityModal.isOpen}
            onClose={() => setAmenityModal((p) => ({ ...p, isOpen: false }))}
            title={amenityModal.isEditing ? "Edit Amenity" : "Add Amenity"}
         >
            <form className={styles.modal} onSubmit={saveAmenity}>
               <div className={styles.modal__form}>
                  <Input
                     label="Amenity Name"
                     placeholder="e.g. Free Wi-Fi"
                     value={amenityModal.data.name}
                     onChange={(e) =>
                        setAmenityModal((p) => ({
                           ...p,
                           data: { ...p.data, name: e.target.value },
                        }))
                     }
                     required
                  />

                  <div className={styles.modal__upload}>
                     <label className={styles.modal__label}>Icon</label>
                     <div className="flex items-center gap-4">
                        <label className={styles.modal__preview}>
                           <input
                              type="file"
                              hidden
                              accept="image/*"
                              onChange={handleUploadIcon}
                           />
                           {amenityModal.data.icon_url ? (
                              <img
                                 src={amenityModal.data.icon_url}
                                 alt="Preview"
                              />
                           ) : (
                              <Upload size={24} className="text-gray-400" />
                           )}
                        </label>
                        <div className="flex flex-col gap-1">
                           <span className="text-xs text-gray-500">
                              Upload a clear icon for this amenity.
                           </span>
                           {amenityModal.data.icon_url && (
                              <button
                                 type="button"
                                 className="text-xs text-rose-600 font-semibold flex items-center gap-1"
                                 onClick={() =>
                                    setAmenityModal((p) => ({
                                       ...p,
                                       data: {
                                          ...p.data,
                                          icon_url: "",
                                          icon_public_id: "",
                                       },
                                    }))
                                 }
                              >
                                 <X size={12} /> Remove
                              </button>
                           )}
                        </div>
                     </div>
                  </div>
               </div>
               <div className={styles.modal__actions}>
                  <Button
                     variant="ghost"
                     type="button"
                     onClick={() =>
                        setAmenityModal((p) => ({ ...p, isOpen: false }))
                     }
                  >
                     Cancel
                  </Button>
                  <Button type="submit" loading={amenityMutation.isPending}>
                     {amenityModal.isEditing ? "Update" : "Create"} Amenity
                  </Button>
               </div>
            </form>
         </Modal>

         {/* Bed Type Modal */}
         <Modal
            isOpen={bedTypeModal.isOpen}
            onClose={() => setBedTypeModal((p) => ({ ...p, isOpen: false }))}
            title={bedTypeModal.isEditing ? "Edit Bed Type" : "Add Bed Type"}
         >
            <form className={styles.modal} onSubmit={saveBedType}>
               <div className={styles.modal__form}>
                  <Input
                     label="Bed Type Name"
                     placeholder="e.g. King Size"
                     value={bedTypeModal.data.name}
                     onChange={(e) =>
                        setBedTypeModal((p) => ({
                           ...p,
                           data: { ...p.data, name: e.target.value },
                        }))
                     }
                     required
                  />
               </div>
               <div className={styles.modal__actions}>
                  <Button
                     variant="ghost"
                     type="button"
                     onClick={() =>
                        setBedTypeModal((p) => ({ ...p, isOpen: false }))
                     }
                  >
                     Cancel
                  </Button>
                  <Button type="submit" loading={bedTypeMutation.isPending}>
                     {bedTypeModal.isEditing ? "Update" : "Create"} Bed Type
                  </Button>
               </div>
            </form>
         </Modal>

         {/* Delete Confirmation Modal */}
         <Modal
            isOpen={deleteModal.isOpen}
            onClose={() =>
               setDeleteModal({ isOpen: false, type: "", id: null, name: "" })
            }
            title="Confirm Deletion"
         >
            <div className={styles.modal}>
               <p className={styles.modal__deleteMessage}>
                  Are you sure you want to delete{" "}
                  <span className={styles.modal__deleteTarget}>
                     {deleteModal.name}
                  </span>
                  ? This action cannot be undone and may affect existing
                  property listings.
               </p>
               <div className={styles.modal__actions}>
                  <Button
                     variant="ghost"
                     onClick={() =>
                        setDeleteModal({
                           isOpen: false,
                           type: "",
                           id: null,
                           name: "",
                        })
                     }
                  >
                     Cancel
                  </Button>
                  <Button
                     variant="danger"
                     onClick={() =>
                        deleteMutation.mutate({
                           id: deleteModal.id,
                           type: deleteModal.type,
                        })
                     }
                     loading={deleteMutation.isPending}
                  >
                     Delete
                  </Button>
               </div>
            </div>
         </Modal>
      </div>
   );
};

export default PropertySetup;
