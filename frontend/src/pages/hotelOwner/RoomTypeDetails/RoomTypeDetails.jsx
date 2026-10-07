import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import {
   ArrowLeft,
   Save,
   Image as ImageIcon,
   Trash2,
   Plus,
   BedDouble,
   Grid,
   List,
   Check,
   Star,
} from "lucide-react";
import { hotelOwnerApi } from "../../../api/hotelOwner";
import Button from "../../../components/shared/Button/Button";
import Input from "../../../components/shared/Input/Input";
import { uploadImage } from "../../../utils/upload";
import styles from "./RoomTypeDetails.module.css";
import LoadingSpinner from "../../../components/shared/Loading/LoadingSpinner";
import Table from "../../../components/shared/Table/Table";
import Modal from "../../../components/shared/Modal/Modal";
import Pagination from "../../../components/shared/Pagination/Pagination";

const RoomTypeDetails = () => {
   const { id } = useParams();
   const navigate = useNavigate();
   const queryClient = useQueryClient();
   const [activeTab, setActiveTab] = useState("overview");

   // Fetch Room Type Details
   const { data: roomType, isLoading } = useQuery({
      queryKey: ["room-type", id],
      queryFn: async () => {
         const response = await hotelOwnerApi.getRoomTypeDetails(id);
         return response.data;
      },
   });

   // Fetch All Amenities
   const { data: allAmenities } = useQuery({
      queryKey: ["amenities"],
      queryFn: async () => {
         const response = await hotelOwnerApi.getAllAmenities();
         return response.data.amenities;
      },
   });

   // Fetch Rooms (Inventory)
   const { data: rooms } = useQuery({
      queryKey: ["rooms", id],
      queryFn: async () => {
         const response = await hotelOwnerApi.getRooms(id);
         return response.data;
      },
      enabled: activeTab === "rooms",
   });

   if (isLoading) return <LoadingSpinner fullScreen />;

   return (
      <div className={styles.container}>
         {/* Header */}
         <div className={styles.breadcrumb}>
            <Link
               to="/hotel-owner/room-types"
               className={styles.breadcrumbLink}
            >
               Room Types
            </Link>
            <span className={styles.breadcrumbSeparator}>/</span>
            <span className={styles.breadcrumbCurrent}>{roomType.name}</span>
         </div>

         {/* Tabs */}
         <div className={styles.tabs}>
            <button
               className={`${styles.tab} ${
                  activeTab === "overview" ? styles.activeTab : ""
               }`}
               onClick={() => setActiveTab("overview")}
            >
               Overview
            </button>
            <button
               className={`${styles.tab} ${
                  activeTab === "amenities" ? styles.activeTab : ""
               }`}
               onClick={() => setActiveTab("amenities")}
            >
               Amenities
            </button>
            <button
               className={`${styles.tab} ${
                  activeTab === "images" ? styles.activeTab : ""
               }`}
               onClick={() => setActiveTab("images")}
            >
               Images
            </button>
            <button
               className={`${styles.tab} ${
                  activeTab === "rooms" ? styles.activeTab : ""
               }`}
               onClick={() => setActiveTab("rooms")}
            >
               Rooms (Inventory)
            </button>
            <button
               className={`${styles.tab} ${
                  activeTab === "reviews" ? styles.activeTab : ""
               }`}
               onClick={() => setActiveTab("reviews")}
            >
               Reviews
            </button>
         </div>

         <div className={styles.content}>
            {activeTab === "overview" && <OverviewTab roomType={roomType} />}
            {activeTab === "amenities" && (
               <AmenitiesTab roomType={roomType} allAmenities={allAmenities} />
            )}
            {activeTab === "images" && <ImagesTab roomType={roomType} />}
            {activeTab === "rooms" && (
               <RoomsTab roomType={roomType} rooms={rooms} />
            )}
            {activeTab === "reviews" && <ReviewsTab roomType={roomType} />}
         </div>
      </div>
   );
};

const ReviewsTab = ({ roomType }) => {
   const [page, setPage] = useState(1);
   const [sortBy, setSortBy] = useState("relevant");
   const pageSize = 10;

   const { data: reviewsData, isLoading } = useQuery({
      queryKey: ["room-type-reviews", roomType.id, page, sortBy],
      queryFn: async () => {
         const response = await hotelOwnerApi.getRoomTypeReviews(roomType.id, {
            page,
            limit: pageSize,
            sort_by: sortBy,
         });
         return response.data;
      },
   });

   const reviews = reviewsData?.reviews || [];
   const pagination = reviewsData?.pagination;

   if (isLoading) return <LoadingSpinner />;

   return (
      <div className={styles.tabContent}>
         {/* Sorting */}
         <div className={styles.reviewsFilter}>
            <select
               value={sortBy}
               onChange={(e) => {
                  setSortBy(e.target.value);
                  setPage(1);
               }}
               className={`${styles.select} ${styles.reviewsSelect}`}
            >
               <option value="relevant">Most Relevant</option>
               <option value="newest">Newest</option>
               <option value="oldest">Oldest</option>
               <option value="highest">Highest Rating</option>
               <option value="lowest">Lowest Rating</option>
            </select>
         </div>

         {/* Reviews List */}
         {reviews.length > 0 ? (
            <>
               <div
                  className={`${styles.reviewsGrid} grid grid-cols-1 md:grid-cols-2 gap-6`}
               >
                  {reviews.map((review) => (
                     <div key={review.id} className={styles.reviewCard}>
                        <div className={`${styles.reviewHeader} flex flex-col`}>
                           <div className={styles.reviewerInfo}>
                              <img
                                 src={
                                    review.profile_pic_url ||
                                    "https://ui-avatars.com/api/?name=" +
                                       encodeURIComponent(
                                          `${review.first_name} ${review.last_name}`
                                       )
                                 }
                                 alt={`${review.first_name} ${review.last_name}`}
                                 className={styles.reviewerAvatar}
                              />
                              <div>
                                 <span className={styles.reviewerName}>
                                    {review.first_name} {review.last_name}
                                 </span>
                                 <span className={styles.reviewDate}>
                                    {new Date(
                                       review.created_at
                                    ).toLocaleDateString()}
                                 </span>
                              </div>
                           </div>
                           <div className={styles.reviewRating}>
                              {[...Array(5)].map((_, i) => (
                                 <Star
                                    key={i}
                                    size={16}
                                    className={
                                       i < review.rating
                                          ? styles.starFilled
                                          : styles.starEmpty
                                    }
                                 />
                              ))}
                           </div>
                        </div>
                        <p className={styles.reviewComment}>{review.comment}</p>
                     </div>
                  ))}
               </div>

               {/* Pagination */}
               {pagination && pagination.total_pages > 1 && (
                  <div className={styles.paginationContainer}>
                     <Pagination
                        currentPage={page}
                        totalPages={pagination.total_pages}
                        onPageChange={setPage}
                     />
                  </div>
               )}
            </>
         ) : (
            <div className={styles.noReviewsState}>
               <p>No reviews yet for this room type.</p>
            </div>
         )}
      </div>
   );
};

const OverviewTab = ({ roomType }) => {
   const queryClient = useQueryClient();
   const [uploading, setUploading] = useState(false);
   const [uploadProgress, setUploadProgress] = useState(0);
   const [form, setForm] = useState({
      name: roomType?.name || "",
      description: roomType?.description || "",
      price_per_night: roomType?.price_per_night || "",
      bed_type: roomType?.bed_type || "",
      number_of_beds: roomType?.number_of_beds || 1,
      status: roomType?.status || "active",
      main_image_url: roomType?.main_image_url || "",
      main_image_public_id: roomType?.main_image_public_id || "",
   });

   // Sync form with roomType prop if it changes (e.g. after refetch)
   useEffect(() => {
      if (roomType) {
         setForm({
            name: roomType.name || "",
            description: roomType.description || "",
            price_per_night: roomType.price_per_night || "",
            bed_type: roomType.bed_type || "",
            number_of_beds: roomType.number_of_beds || 1,
            status: roomType.status || "active",
            main_image_url: roomType.main_image_url || "",
            main_image_public_id: roomType.main_image_public_id || "",
         });
      }
   }, [roomType]);

   const updateMutation = useMutation({
      mutationFn: (data) => hotelOwnerApi.updateRoomType(roomType.id, data),
      onSuccess: () => {
         toast.success("Updated successfully");
         queryClient.invalidateQueries(["room-type", roomType.id]);
      },
      onError: () => toast.error("Failed to update"),
   });

   const handleChange = (e) =>
      setForm({ ...form, [e.target.name]: e.target.value });

   const handleMainImageUpload = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      setUploading(true);
      setUploadProgress(0);
      try {
         const result = await uploadImage(file, (progress) =>
            setUploadProgress(progress)
         );
         setForm((prev) => ({
            ...prev,
            main_image_url: result.secure_url,
            main_image_public_id: result.public_id,
         }));
         toast.success("Image uploaded, click Save to persist");
      } catch (error) {
         console.error(error);
         toast.error("Failed to upload image");
      } finally {
         setUploading(false);
         setUploadProgress(0);
      }
   };

   // Check if changes exist
   const hasChanges = () => {
      if (!roomType) return false;

      // Compare each field, handling potental type mismatches (string vs number)
      return (
         form.name !== (roomType.name || "") ||
         form.description !== (roomType.description || "") ||
         String(form.price_per_night) !==
            String(roomType.price_per_night || "") ||
         form.bed_type !== (roomType.bed_type || "") ||
         String(form.number_of_beds) !== String(roomType.number_of_beds || 1) ||
         form.status !== (roomType.status || "active") ||
         form.main_image_url !== (roomType.main_image_url || "") ||
         form.main_image_public_id !== (roomType.main_image_public_id || "")
      );
   };

   return (
      <form
         onSubmit={(e) => {
            e.preventDefault();
            updateMutation.mutate(form);
         }}
         className={styles.tabContent}
      >
         <div className="mb-6">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-100 mb-2 block">
               Main Image
            </label>
            <div className="flex items-start gap-4">
               {/* Image Preview */}
               <div className="relative w-40 h-24 rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                  {form.main_image_url ? (
                     <img
                        src={form.main_image_url}
                        alt="Main"
                        className="w-full h-full object-cover"
                     />
                  ) : (
                     <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <ImageIcon size={24} />
                     </div>
                  )}
               </div>

               {/* Upload Button */}
               <div className="flex flex-col gap-2">
                  <label
                     className={`cursor-pointer inline-flex items-center gap-2 px-4 py-2 border rounded-md transition-colors ${
                        uploading
                           ? "bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed"
                           : "border-blue-500 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                     }`}
                  >
                     {uploading ? (
                        <>
                           <LoadingSpinner size="sm" />
                           <span className="text-sm font-medium">
                              {uploadProgress}%
                           </span>
                        </>
                     ) : (
                        <>
                           <ImageIcon size={18} />
                           <span className="text-sm font-medium">
                              Change Image
                           </span>
                        </>
                     )}
                     <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleMainImageUpload}
                        disabled={uploading}
                     />
                  </label>
                  <p className="text-xs text-gray-500">
                     Recommended size: 800x600px
                  </p>
               </div>
            </div>
         </div>
         <div className="grid sm:grid-cols-2 gap-6">
            <Input
               label="Name"
               name="name"
               value={form.name}
               onChange={handleChange}
            />
            <div className="flex flex-col gap-1">
               <label className="text-sm font-medium text-gray-700 dark:text-gray-100">
                  Status
               </label>
               <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className={styles.select}
               >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
               </select>
            </div>
         </div>
         <div className="grid sm:grid-cols-2 gap-6 mt-4">
            <Input
               label="Price per Night"
               name="price_per_night"
               type="number"
               value={form.price_per_night}
               onChange={handleChange}
            />
            <Input
               label="Number of Beds"
               name="number_of_beds"
               type="number"
               value={form.number_of_beds}
               onChange={handleChange}
            />
         </div>
         <div className="grid sm:grid-cols-2 gap-6 mt-4">
            <div className="flex flex-col gap-1">
               <label className="text-sm font-medium text-gray-700 dark:text-gray-100">
                  Bed Type
               </label>
               <select
                  name="bed_type"
                  value={form.bed_type}
                  onChange={handleChange}
                  className={styles.select}
               >
                  <option value="Single">Single</option>
                  <option value="Double">Double</option>
                  <option value="Queen">Queen</option>
                  <option value="King">King</option>
               </select>
            </div>
         </div>
         <div className={styles.textareaContainer}>
            <label
               className={`text-sm font-medium text-gray-700 dark:text-gray-100`}
            >
               Description
            </label>
            <textarea
               name="description"
               value={form.description}
               onChange={handleChange}
               className={styles.textarea}
            />
         </div>
         <div className={styles.saveButton}>
            <Button
               type="submit"
               loading={updateMutation.isPending}
               disabled={!hasChanges() || updateMutation.isPending}
            >
               <Save size={18} className="mr-2" /> Save Changes
            </Button>
         </div>
      </form>
   );
};

const AmenitiesTab = ({ roomType, allAmenities }) => {
   const queryClient = useQueryClient();

   // Fetch linked amenities
   const { data: linkedAmenities, isLoading } = useQuery({
      queryKey: ["room-type-amenities", roomType.id],
      queryFn: async () => {
         const res = await hotelOwnerApi.getRoomTypeAmenities(roomType.id);
         return res.data.amenities || [];
      },
   });

   const linkedIds = linkedAmenities?.map((a) => a.id) || [];

   const addAmenitiesMutation = useMutation({
      mutationFn: (ids) =>
         hotelOwnerApi.addRoomTypeAmenities(roomType.id, { amenities: ids }),
      onSuccess: () => {
         toast.success("Amenity added");
         queryClient.invalidateQueries(["room-type-amenities", roomType.id]);
      },
      onError: () => toast.error("Failed to add amenity"),
   });

   const removeAmenitiesMutation = useMutation({
      mutationFn: (amenityId) =>
         hotelOwnerApi.deleteRoomTypeAmenity(roomType.id, amenityId),
      onSuccess: () => {
         toast.success("Amenity removed");
         queryClient.invalidateQueries(["room-type-amenities", roomType.id]);
      },
      onError: () => toast.error("Failed to remove amenity"),
   });

   const toggleAmenity = (amenityId) => {
      if (linkedIds.includes(amenityId)) {
         removeAmenitiesMutation.mutate(amenityId);
      } else {
         addAmenitiesMutation.mutate([amenityId]);
      }
   };

   if (isLoading) return <LoadingSpinner />;

   return (
      <div className={styles.tabContent}>
         <div className={styles.amenitiesGrid}>
            {allAmenities?.map((amenity) => (
               <div
                  key={amenity.id}
                  className={`${styles.amenityCard} ${
                     linkedIds.includes(amenity.id)
                        ? styles.selectedAmenity
                        : ""
                  }`}
                  onClick={() => toggleAmenity(amenity.id)}
               >
                  <div className="flex items-center gap-3">
                     {amenity.icon_url && (
                        <img
                           src={amenity.icon_url}
                           alt=""
                           className="w-6 h-6"
                        />
                     )}
                     <span>{amenity.name}</span>
                  </div>
                  {linkedIds.includes(amenity.id) && (
                     <Check size={18} className="text-blue-600" />
                  )}
               </div>
            ))}
         </div>
      </div>
   );
};

const ImagesTab = ({ roomType }) => {
   const queryClient = useQueryClient();
   const [uploading, setUploading] = useState(false);

   // Fetch images specific to room type
   const { data: images, isLoading } = useQuery({
      queryKey: ["room-type-images", roomType.id],
      queryFn: async () => {
         const res = await hotelOwnerApi.getRoomTypeImages(roomType.id);
         return res.data.images || [];
      },
   });

   const handleUpload = async (file) => {
      if (!file) return;
      setUploading(true);
      try {
         const result = await uploadImage(file);
         await hotelOwnerApi.addRoomTypeImage(roomType.id, {
            image_url: result.secure_url,
            image_public_id: result.public_id,
         });
         toast.success("Image added");
         queryClient.invalidateQueries(["room-type-images", roomType.id]);
      } catch (e) {
         toast.error("Upload failed");
         console.error(e);
      } finally {
         setUploading(false);
      }
   };

   const handleDelete = async (imageId) => {
      try {
         await hotelOwnerApi.deleteRoomTypeImage(roomType.id, imageId);
         toast.success("Image deleted");
         queryClient.invalidateQueries(["room-type-images", roomType.id]);
      } catch {
         toast.error("Failed to delete");
      }
   };

   if (isLoading) return <LoadingSpinner />;

   return (
      <div className={styles.tabContent}>
         <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {/* Main Image (from room type details) */}
            <div className="col-span-1 relative group">
               <img
                  src={roomType.main_image_url}
                  alt="Main"
                  className="w-full h-40 object-cover rounded-lg border-2 border-primary-500"
               />
               <span className="absolute top-2 left-2 bg-primary-500 text-white text-xs px-2 py-1 rounded">
                  Main
               </span>
            </div>

            {/* Additional Images */}
            {images?.map((img, idx) => (
               <div key={img.id || idx} className="relative group">
                  <img
                     src={img.image_url}
                     alt=""
                     className="w-full h-40 object-cover rounded-lg"
                  />
                  <button
                     onClick={() => handleDelete(img.id)} // Assuming endpoint uses ID, user spec said /:imageId which usually implies database ID not public_id for DELETE path param
                     className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                     <Trash2 size={16} />
                  </button>
               </div>
            ))}

            {/* Upload Button */}
            <label className="border-2 dashed border-gray-300 rounded-lg h-40 flex flex-col justify-center items-center cursor-pointer hover:bg-gray-50 transition-colors">
               <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => {
                     handleUpload(e.target.files[0]);
                     e.target.value = "";
                  }}
                  disabled={uploading}
               />
               {uploading ? (
                  <LoadingSpinner />
               ) : (
                  <>
                     <Plus size={32} className="text-gray-400" />
                     <span className="text-sm text-gray-500 mt-2">
                        Add Image
                     </span>
                  </>
               )}
            </label>
         </div>
      </div>
   );
};

const RoomsTab = ({ roomType, rooms }) => {
   const queryClient = useQueryClient();
   const [roomNumbers, setRoomNumbers] = useState("");
   const [roomToDelete, setRoomToDelete] = useState(null);

   const addRoomsMutation = useMutation({
      mutationFn: (data) => hotelOwnerApi.addRooms(roomType.id, data),
      onSuccess: () => {
         toast.success("Rooms added");
         setRoomNumbers("");
         queryClient.invalidateQueries(["rooms", roomType.id]);
      },
      onError: () => toast.error("Failed to add rooms"),
   });

   const toggleStatusMutation = useMutation({
      mutationFn: ({ roomId, status }) =>
         hotelOwnerApi.updateRoomStatus(roomType.id, roomId, { status }),
      onSuccess: () => {
         toast.success("Status updated");
         queryClient.invalidateQueries(["rooms", roomType.id]);
      },
      onError: () => toast.error("Failed to update status"),
   });

   const deleteRoomMutation = useMutation({
      mutationFn: (roomId) => hotelOwnerApi.deleteRoom(roomType.id, roomId),
      onSuccess: () => {
         toast.success("Room deleted successfully");
         setRoomToDelete(null);
         queryClient.invalidateQueries(["rooms", roomType.id]);
      },
      onError: () => toast.error("Failed to delete room"),
   });

   const handleSubmit = (e) => {
      e.preventDefault();
      if (!roomNumbers.trim()) return;
      // Parse comma separated
      const numbers = roomNumbers
         .split(",")
         .map((s) => s.trim())
         .filter(Boolean);
      addRoomsMutation.mutate({ room_numbers: numbers });
   };

   // Table columns
   const columns = [
      {
         key: "room_number",
         header: "Room Number",
         render: (room) => room.room_number,
      },
      {
         key: "status",
         header: "Status",
         render: (room) => (
            <span
               className={`${styles.statusBadge} ${
                  room.status === "available"
                     ? styles.statusAvailable
                     : room.status === "maintenance"
                     ? styles.statusMaintenance
                     : styles.statusBooked
               }`}
            >
               {room.status}
            </span>
         ),
      },
      {
         key: "actions",
         header: "Actions",
         render: (room) => (
            <div className="flex items-center gap-2 justify-start">
               <select
                  className={styles.actionSelect}
                  value={room.status}
                  onChange={(e) =>
                     toggleStatusMutation.mutate({
                        roomId: room.id,
                        status: e.target.value,
                     })
                  }
               >
                  <option value="available">Available</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="booked">Booked</option>
               </select>
               <Button
                  variant="danger"
                  size="small"
                  onClick={() => setRoomToDelete(room)}
                  className="p-1.5 h-auto rounded-md bg-red-50 hover:bg-red-100 text-red-600 border border-red-200"
               >
                  <Trash2 size={16} />
               </Button>
            </div>
         ),
      },
   ];

   return (
      <div className={styles.tabContent}>
         <div className="mb-8 p-4 rounded-lg">
            <h3 className={`${styles.tabContent__title} text-lg font-medium`}>
               Add Rooms
            </h3>
            <form
               onSubmit={handleSubmit}
               className="flex md:gap-4 md:flex-row flex-col  md:items-start"
            >
               <Input
                  placeholder="e.g. 101, 102, 103"
                  value={roomNumbers}
                  onChange={(e) => setRoomNumbers(e.target.value)}
                  className="flex-1"
                  containerClassName="w-full md:w-auto"
               />
               <Button
                  type="submit"
                  loading={addRoomsMutation.isPending}
                  className="w-full md:w-auto h-[42px]"
               >
                  Add Rooms
               </Button>
            </form>
            <p className={`${styles.roomText} text-xs text-gray-500`}>
               Enter multiple room numbers separated by commas.
            </p>
         </div>

         <div className={styles.tableContainer}>
            <Table
               columns={columns}
               data={rooms}
               className={styles.bookingsTable}
            />
            {rooms?.length === 0 && (
               <p className="text-center py-8 text-gray-500">
                  No rooms added yet.
               </p>
            )}
         </div>
         <div className="mt-4 text-xs text-gray-400 text-center">
            Showing {rooms?.length || 0} room(s)
         </div>

         {/* Delete Confirmation Modal */}
         <Modal
            isOpen={!!roomToDelete}
            onClose={() => setRoomToDelete(null)}
            title="Delete Room"
            footer={
               <div className="flex justify-end gap-3 w-full">
                  <Button
                     variant="outline"
                     onClick={() => setRoomToDelete(null)}
                  >
                     Cancel
                  </Button>
                  <Button
                     variant="danger"
                     onClick={() => deleteRoomMutation.mutate(roomToDelete.id)}
                     loading={deleteRoomMutation.isPending}
                  >
                     Delete
                  </Button>
               </div>
            }
         >
            <p className="text-gray-600">
               Are you sure you want to delete{" "}
               <span className="font-semibold">
                  Room {roomToDelete?.room_number}
               </span>
               ? This action cannot be undone.
            </p>
         </Modal>
      </div>
   );
};

export default RoomTypeDetails;
