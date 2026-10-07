import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Plus, Edit, Trash2, Loader2, Image as ImageIcon } from "lucide-react";
import { toast } from "react-hot-toast";
import { hotelOwnerApi } from "../../../api/hotelOwner";
import Button from "../../../components/shared/Button/Button";
import Modal from "../../../components/shared/Modal/Modal";
import Input from "../../../components/shared/Input/Input";
import { uploadImage } from "../../../utils/upload";
import styles from "./RoomTypes.module.css";
import { formatCurrency } from "../../../utils/helpers";

const RoomTypes = () => {
   const navigate = useNavigate();
   const queryClient = useQueryClient();
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [hotelId, setHotelId] = useState(null);

   // Form State
   const [formData, setFormData] = useState({
      name: "",
      description: "",
      price_per_night: "",
      bed_type: "",
      number_of_beds: 1,
      main_image_url: "",
      main_image_public_id: "",
   });
   const [uploading, setUploading] = useState(false);

   // Fetch Hotel ID first
   const { data: hotel, isLoading: isLoadingHotel } = useQuery({
      queryKey: ["my-hotel"],
      queryFn: async () => {
         const res = await hotelOwnerApi.getMyHotel();
         return res.data;
      },
   });

   // Fetch Room Types
   const { data: roomTypes, isLoading: isLoadingTypes } = useQuery({
      queryKey: ["room-types", hotelId],
      queryFn: async () => {
         const res = await hotelOwnerApi.getRoomTypes(hotelId);
         return res.data.room_types;
      },
      enabled: Boolean(hotelId),
   });

   // Create Mutation
   const createMutation = useMutation({
      mutationFn: (data) => hotelOwnerApi.createRoomType(hotelId, data),
      onSuccess: () => {
         toast.success("Room type created successfully");
         setIsModalOpen(false);
         setFormData({
            name: "",
            description: "",
            price_per_night: "",
            bed_type: "",
            number_of_beds: 1,
            main_image_url: "",
            main_image_public_id: "",
         });
         queryClient.invalidateQueries(["room-types", hotelId]);
      },
      onError: (error) => {
         toast.error(
            error.response?.data?.message || "Failed to create room type"
         );
      },
   });

   useEffect(() => {
      if (hotel) {
         setHotelId(hotel.id);
      }
   }, [hotel]);

   const handleInputChange = (e) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
   };

   const handleImageUpload = async (file) => {
      if (!file) return;
      setUploading(true);
      try {
         const result = await uploadImage(file);
         setFormData((prev) => ({
            ...prev,
            main_image_url: result.secure_url,
            main_image_public_id: result.public_id,
         }));
         toast.success("Image uploaded");
      } catch (error) {
         toast.error("Upload failed");
      } finally {
         setUploading(false);
      }
   };

   const handleSubmit = (e) => {
      e.preventDefault();
      if (
         !formData.name ||
         !formData.price_per_night ||
         !formData.main_image_url
      ) {
         return toast.error("Please fill required fields and upload image");
      }
      createMutation.mutate(formData);
   };

   if (isLoadingHotel)
      return (
         <div className="p-8 flex justify-center">
            <Loader2 className="animate-spin" />
         </div>
      );

   return (
      <div className={styles.container}>
         <div className={styles.header}>
            <h1 className={styles.title}>Room Types</h1>
            <Button onClick={() => setIsModalOpen(true)}>
               <Plus size={20} className="mr-2" />
               New Room Type
            </Button>
         </div>

         {isLoadingTypes ? (
            <div className="flex justify-center p-12">
               <Loader2 className="animate-spin text-blue-500" />
            </div>
         ) : roomTypes?.length > 0 ? (
            <div className={styles.grid}>
               {roomTypes.map((type) => (
                  <div
                     key={type.id}
                     className={styles.card}
                     onClick={() =>
                        navigate(`/hotel-owner/room-types/${type.id}`)
                     }
                  >
                     <div className={styles.imageWrapper}>
                        <img
                           src={type.main_image_url}
                           alt={type.name}
                           className={styles.image}
                        />
                        <div className={styles.priceTag}>
                           {formatCurrency(type.price_per_night)}/night
                        </div>
                     </div>
                     <div className={styles.content}>
                        <h3 className={styles.cardTitle}>{type.name}</h3>
                        <p className={styles.cardDescription}>
                           {type.description?.substring(0, 100)}...
                        </p>
                        <div className={styles.meta}>
                           <span>
                              {type.number_of_beds} {type.bed_type} Bed
                              {type.number_of_beds > 1 ? "s" : ""}
                           </span>
                           {/* Add available rooms count if available */}
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         ) : (
            <div className={styles.emptyState}>
               <p>No room types found. Create your first one!</p>
            </div>
         )}

         {/* Create Modal */}
         <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title="Create New Room Type"
            size="md"
         >
            <form onSubmit={handleSubmit} className={styles.form}>
               <Input
                  label="Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Deluxe Suite"
               />

               <div className={`grid grid-cols-2 gap-4`}>
                  <Input
                     label="Price per Night"
                     name="price_per_night"
                     type="number"
                     value={formData.price_per_night}
                     onChange={handleInputChange}
                     placeholder="0.00"
                  />
                  <div className="flex flex-col gap-1">
                     <label className="text-sm font-medium text-gray-700 dark:text-gray-100">
                        Bed Type
                     </label>
                     <select
                        name="bed_type"
                        value={formData.bed_type}
                        onChange={handleInputChange}
                        className={`${styles.select}`}
                     >
                        <option value="">Select Type</option>
                        <option value="Single">Single</option>
                        <option value="Double">Double</option>
                        <option value="Queen">Queen</option>
                        <option value="King">King</option>
                     </select>
                  </div>
               </div>

               <div className={`grid grid-cols-2 gap-4`}>
                  <Input
                     label="Number of Beds"
                     name="number_of_beds"
                     type="number"
                     value={formData.number_of_beds}
                     onChange={handleInputChange}
                  />
               </div>

               <div className={`flex flex-col gap-2`}>
                  <label
                     className={`text-sm font-medium text-gray-700 dark:text-gray-100`}
                  >
                     Description
                  </label>
                  <textarea
                     name="description"
                     value={formData.description}
                     onChange={handleInputChange}
                     className={styles.textarea}
                     placeholder="Room description..."
                  />
               </div>

               {/* Image Upload */}
               <div className={styles.uploadSection}>
                  <label
                     className={`block text-sm font-medium text-gray-700 dark:text-gray-100`}
                  >
                     Main Image
                  </label>
                  {!formData.main_image_url ? (
                     <label className={styles.uploadArea}>
                        <input
                           type="file"
                           className="hidden"
                           accept="image/*"
                           onChange={(e) =>
                              handleImageUpload(e.target.files[0])
                           }
                        />
                        {uploading ? (
                           <Loader2 className="animate-spin text-blue-500" />
                        ) : (
                           <div className="flex flex-col items-center text-gray-500">
                              <ImageIcon size={24} />
                              <span className="text-sm mt-1">
                                 Upload Main Image
                              </span>
                           </div>
                        )}
                     </label>
                  ) : (
                     <div className="relative">
                        <img
                           src={formData.main_image_url}
                           alt="Preview"
                           className="w-full h-48 object-cover rounded-md"
                        />
                        <button
                           type="button"
                           onClick={() =>
                              setFormData((prev) => ({
                                 ...prev,
                                 main_image_url: "",
                                 main_image_public_id: "",
                              }))
                           }
                           className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                        >
                           <Trash2 size={16} />
                        </button>
                     </div>
                  )}
               </div>

               <Button
                  type="submit"
                  loading={createMutation.isPending}
                  fullWidth
               >
                  Create Room Type
               </Button>
            </form>
         </Modal>
      </div>
   );
};

export default RoomTypes;
