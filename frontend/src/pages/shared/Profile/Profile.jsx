import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import {
   Mail,
   Phone,
   Camera,
   Save,
   Loader2,
   Building2,
   Pencil,
} from "lucide-react";
import useAuthStore from "../../../store/authStore";
import { usersApi } from "../../../api/users";
import { uploadImage } from "../../../utils/upload";
import Button from "../../../components/shared/Button/Button";
import Input from "../../../components/shared/Input/Input";
import LoadingSpinner from "../../../components/shared/Loading/LoadingSpinner";
import styles from "./Profile.module.css";
import { hotelOwnerApi } from "../../../api/hotelOwner";
import LocationPicker from "../../../components/shared/LocationPicker/LocationPicker";

const Profile = () => {
   const { user, role, updateUser } = useAuthStore();
   const queryClient = useQueryClient();
   const [isEditing, setIsEditing] = useState(false);
   const [hotelStatus, setHotelStatus] = useState(null);

   const {
      register,
      handleSubmit,
      reset,
      setValue,
      watch,
      formState: { errors, isDirty },
   } = useForm();

   const profilePicUrl = watch("profile_pic_url");
   const [isUploading, setIsUploading] = useState(false);
   const [uploadProgress, setUploadProgress] = useState(0);
   const [uploadError, setUploadError] = useState(null);

   const { data: profileData, isLoading } = useQuery({
      queryKey: ["userProfile", user?.id],
      queryFn: async () => {
         const response = await usersApi.getUserProfile(user.id);
         return response.data;
      },
      enabled: Boolean(user?.id),
   });

   // Hotel Data
   const { data: hotelData, isLoading: isLoadingHotel } = useQuery({
      queryKey: ["my-hotel"],
      queryFn: async () => {
         const response = await hotelOwnerApi.getMyHotel();
         return response.data;
      },
      retry: false,
      enabled: Boolean(user?.id) && role === "hotel_owner",
   });

   useEffect(() => {
      if (profileData) {
         reset({
            first_name: profileData.first_name,
            last_name: profileData.last_name,
            phone_number: profileData.phone_number,
            profile_pic_url: profileData.profile_pic_url,
            profile_pic_public_id: profileData.profile_pic_public_id,
         });
      }
   }, [profileData, reset]);

   // Check existing hotel status
   useEffect(() => {
      if (!hotelData) return;
      setHotelStatus(hotelData?.status);
   }, [hotelData]);

   const handleImageUpload = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      // Validation
      const validTypes = ["image/jpeg", "image/png", "image/webp"];
      if (!validTypes.includes(file.type)) {
         toast.error("Please upload a valid image (JPEG, PNG, WEBP)");
         return;
      }

      if (file.size > 5 * 1024 * 1024) {
         // 5MB limit
         toast.error("Image size must be less than 5MB");
         return;
      }

      // Local Preview
      const objectUrl = URL.createObjectURL(file);
      setValue("profile_pic_url", objectUrl); // Update preview immediately

      setIsUploading(true);
      setUploadProgress(0);
      setUploadError(null);

      try {
         const { secure_url, public_id } = await uploadImage(
            file,
            (progress) => {
               setUploadProgress(progress);
            }
         );

         // Automatic update with just the image fields
         await updateProfileMutation.mutateAsync({
            profile_pic_url: secure_url,
            profile_pic_public_id: public_id,
         });

         // Update form values to reflect the saved state
         setValue("profile_pic_url", secure_url);
         setValue("profile_pic_public_id", public_id);
      } catch (error) {
         setUploadError("Failed to upload image");
         // Error handled by mutation onError or here
         if (!error.response) {
            // Only show toast if it wasn't the mutation (which has its own toast)
            toast.error("Failed to upload image");
         }

         // Revert to original or empty if upload failed
         setValue("profile_pic_url", profileData?.profile_pic_url || "");
      } finally {
         setIsUploading(false);
         URL.revokeObjectURL(objectUrl);
      }
   };

   const updateProfileMutation = useMutation({
      mutationFn: (data) => usersApi.updateUserProfile(user.id, data),
      onSuccess: (data) => {
         toast.success("Profile updated successfully");
         setIsEditing(false);
         // Invalidate queries to fetch fresh data
         queryClient.invalidateQueries(["userProfile", user.id]);

         // Update local auth store with the response data
         // Assuming the API returns the updated user object in data.data or similar
         if (data?.data) {
            updateUser(data.data);
         } else {
            // Fallback if structure is different, usually data is the user object if axios interceptor unwraps it
            // But checking apiClient, it returns response.data.
            // If backend returns { success: true, data: { ... } }, then 'data' here is { success: true, data: { ... } }
            // So data.data is the user object.
            updateUser(data.data || data);
         }
      },
      onError: (error) => {
         toast.error(
            error.response?.data?.message || "Failed to update profile"
         );
      },
   });

   const onSubmit = (data) => {
      // Exclude profile picture fields from the manual update
      const { profile_pic_url, profile_pic_public_id, ...profileData } = data;
      updateProfileMutation.mutate(profileData);
   };

   if (isLoading) {
      return <LoadingSpinner fullScreen />;
   }

   return (
      <div className={styles.profile}>
         <div className={styles.header}>
            <h1 className={styles.title}>My Profile</h1>
            <p className={styles.subtitle}>Manage your personal information</p>
         </div>

         <div className={styles.content}>
            {/* Sidebar / Profile Card */}
            <div className={styles.sidebar}>
               <div className={styles.profileCard}>
                  <div className={styles.avatarWrapper}>
                     <img
                        src={
                           profilePicUrl ||
                           profileData?.profile_pic_url ||
                           "https://media.istockphoto.com/id/2151669184/vector/vector-flat-illustration-in-grayscale-avatar-user-profile-person-icon-gender-neutral.jpg?s=612x612&w=0&k=20&c=UEa7oHoOL30ynvmJzSCIPrwwopJdfqzBs0q69ezQoM8="
                        }
                        alt="Profile"
                        className={styles.avatar}
                     />
                     <label className={styles.uploadOverlay}>
                        <input
                           type="file"
                           accept="image/*"
                           onChange={handleImageUpload}
                           className={styles.hiddenInput}
                           disabled={isUploading}
                        />
                        {isUploading ? (
                           <div className={styles.progressOverlay}>
                              <Loader2 className={styles.spinner} />
                              <span className={styles.progressText}>
                                 {uploadProgress}%
                              </span>
                           </div>
                        ) : (
                           <Camera size={24} color="white" />
                        )}
                     </label>
                  </div>
                  {isUploading && (
                     <div className={styles.progressContainer}>
                        <div
                           className={styles.progressBar}
                           style={{ width: `${uploadProgress}%` }}
                        />
                     </div>
                  )}
                  {uploadError && (
                     <p className={styles.uploadError}>{uploadError}</p>
                  )}
                  <h2 className={styles.userName}>
                     {profileData?.first_name} {profileData?.last_name}
                  </h2>
                  <p className={styles.userRole}>
                     {role
                        ? role.charAt(0).toUpperCase() + role.slice(1)
                        : "User"}
                  </p>
                  <div className={styles.infoList}>
                     <div className={styles.infoItem}>
                        <Mail size={16} />
                        <span>{profileData?.email}</span>
                     </div>
                     {profileData?.phone_number && (
                        <div className={styles.infoItem}>
                           <Phone size={16} />
                           <span>{profileData.phone_number}</span>
                        </div>
                     )}
                  </div>
               </div>
            </div>

            {/* Main Form Area */}
            <div className={styles.main}>
               <div className={styles.formCard}>
                  <div className={styles.formHeader}>
                     <h3>Personal Details</h3>
                     {!isEditing && (
                        <Button
                           variant="outline"
                           size="small"
                           onClick={() => setIsEditing(true)}
                        >
                           <Pencil size={18} />
                        </Button>
                     )}
                  </div>

                  <form onSubmit={handleSubmit(onSubmit)}>
                     <div className={styles.formGrid}>
                        <Input
                           label="First Name"
                           {...register("first_name", {
                              required: "First name is required",
                           })}
                           error={errors.first_name?.message}
                           disabled={!isEditing}
                        />
                        <Input
                           label="Last Name"
                           {...register("last_name", {
                              required: "Last name is required",
                           })}
                           error={errors.last_name?.message}
                           disabled={!isEditing}
                        />
                        <Input
                           label="Phone Number"
                           {...register("phone_number")}
                           disabled={!isEditing}
                        />
                        <Input
                           label="Email"
                           value={profileData?.email}
                           disabled={true}
                        />
                     </div>

                     {isEditing && (
                        <div className={styles.formActions}>
                           <Button
                              type="button"
                              variant="ghost"
                              onClick={() => {
                                 reset({
                                    first_name: profileData.first_name,
                                    last_name: profileData.last_name,
                                    phone_number: profileData.phone_number,
                                    profile_pic_url:
                                       profileData.profile_pic_url,
                                 });
                                 setIsEditing(false);
                              }}
                           >
                              Cancel
                           </Button>
                           <Button
                              type="submit"
                              isLoading={updateProfileMutation.isLoading}
                              disabled={
                                 !isDirty || updateProfileMutation.isLoading
                              }
                           >
                              <Save size={18} />
                              Save Changes
                           </Button>
                        </div>
                     )}
                  </form>
               </div>

               {/* Hotel Details Form (Only for Hotel Owners) */}
               {!isLoading &&
                  role === "hotel_owner" &&
                  hotelStatus === "approved" && <HotelDetailsForm />}
            </div>
         </div>
      </div>
   );
};

const HotelDetailsForm = () => {
   const queryClient = useQueryClient();
   const [isEditing, setIsEditing] = useState(false);
   const [isUploading, setIsUploading] = useState(false);
   const [uploadProgress, setUploadProgress] = useState(0);
   const { role } = useAuthStore();

   // Fetch Hotel Data
   const { data: hotelData, isLoading } = useQuery({
      queryKey: ["my-hotel"],
      queryFn: async () => {
         const res = await hotelOwnerApi.getMyHotel();
         return res.data;
      },
      enabled: role === "hotel_owner",
   });

   const {
      register,
      handleSubmit,
      reset,
      setValue,
      watch,
      formState: { errors, isDirty },
   } = useForm();

   const hotelImage = watch("profile_pic_url");

   // Sync form with hotel data
   useEffect(() => {
      if (hotelData) {
         reset({
            name: hotelData.name,
            location: hotelData.location,
            latitude: hotelData.latitude,
            longitude: hotelData.longitude,
            contact_info: hotelData.contact_info,
            description: hotelData.description,
            profile_pic_url: hotelData.profile_pic_url,
            profile_pic_public_id: hotelData.profile_pic_public_id,
         });
      }
   }, [hotelData, reset]);

   const updateHotelMutation = useMutation({
      mutationFn: (data) => hotelOwnerApi.updateHotel(hotelData.id, data),
      onSuccess: () => {
         toast.success("Hotel details updated");
         setIsEditing(false);
         queryClient.invalidateQueries(["my-hotel-profile"]);
      },
      onError: () => toast.error("Failed to update hotel"),
   });

   const handleImageUpload = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      setIsUploading(true);
      try {
         const { secure_url, public_id } = await uploadImage(file, (progress) =>
            setUploadProgress(progress)
         );
         setValue("profile_pic_url", secure_url, { shouldDirty: true });
         setValue("profile_pic_public_id", public_id, { shouldDirty: true });
      } catch {
         toast.error("Image upload failed");
      } finally {
         setIsUploading(false);
      }
   };

   const onSubmit = (data) => {
      // API expects strictly these fields for this specific update request context
      const payload = {
         location: data.location,
         latitude: data.latitude,
         longitude: data.longitude,
         contact_info: data.contact_info,
         description: data.description,
         profile_pic_url: data.profile_pic_url,
         profile_pic_public_id: data.profile_pic_public_id,
      };
      updateHotelMutation.mutate(payload);
   };

   if (isLoading) return <LoadingSpinner />;

   return (
      <div className={`${styles.formCard}`}>
         <div className={styles.formHeader}>
            <div className="flex items-center gap-3">
               <Building2 size={24} className="text-gray-400" />
               <h3>Hotel Details</h3>
            </div>
            {!isEditing && (
               <Button
                  variant="outline"
                  size="small"
                  onClick={() => setIsEditing(true)}
               >
                  <Pencil size={18} />
               </Button>
            )}
         </div>

         <form onSubmit={handleSubmit(onSubmit)}>
            {/* Hotel Image Preview */}
            <div className="mb-6 flex justify-center">
               <div
                  className={`${styles.hotelImageContainer} relative group w-full h-48 rounded-lg overflow-hidden border border-gray-200 bg-gray-50`}
               >
                  {hotelImage ? (
                     <img
                        src={hotelImage}
                        alt="Hotel"
                        className="w-full h-full object-cover"
                     />
                  ) : (
                     <div
                        className={`${styles.noImagePlaceholder} flex flex-col items-center justify-center h-full text-gray-400`}
                     >
                        <Building2 size={48} />
                        <span className="text-sm mt-2">No Image</span>
                     </div>
                  )}

                  {isEditing && (
                     <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <label className="cursor-pointer bg-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                           Change Image
                           <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleImageUpload}
                              disabled={isUploading}
                           />
                        </label>
                     </div>
                  )}

                  {isUploading && (
                     <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <div className="w-1/2">
                           <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                 className="h-full bg-blue-600 transition-all duration-300"
                                 style={{ width: `${uploadProgress}%` }}
                              />
                           </div>
                           <p className="text-white text-center text-xs mt-2">
                              Uploading...
                           </p>
                        </div>
                     </div>
                  )}
               </div>
            </div>

            <div className={styles.formGrid}>
               <Input
                  label="Hotel Name"
                  value={hotelData?.name}
                  disabled={true}
               />
               <Input
                  label="Contact Info"
                  {...register("contact_info", {
                     required: "Contact info is required",
                  })}
                  error={errors.contact_info?.message}
                  disabled={!isEditing}
               />
               <div className="col-span-2">
                  {isEditing ? (
                     <div className="mb-4">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">
                           Location
                        </label>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                           Search for a location or pin it on the map.
                        </p>
                        <LocationPicker
                           initialPosition={
                              hotelData?.latitude && hotelData?.longitude
                                 ? [hotelData.latitude, hotelData.longitude]
                                 : [9.03, 38.74]
                           }
                           initialAddress={hotelData?.location || ""}
                           onLocationSelect={({ lat, lng, address }) => {
                              setValue("latitude", lat, { shouldDirty: true });
                              setValue("longitude", lng, { shouldDirty: true });
                              setValue("location", address, {
                                 shouldDirty: true,
                              });
                           }}
                        />
                     </div>
                  ) : (
                     <Input
                        label="Location"
                        value={hotelData?.location}
                        disabled={true}
                     />
                  )}
               </div>
               <div className="col-span-2">
                  <div className="flex flex-col gap-1">
                     <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Description
                     </label>
                     <textarea
                        {...register("description", {
                           required: "Description is required",
                        })}
                        disabled={!isEditing}
                        className={`${styles.textarea} ${
                           !isEditing ? styles.textareaDisabled : ""
                        }`}
                     />
                     {errors.description && (
                        <p className="text-red-500 text-xs mt-1">
                           {errors.description.message}
                        </p>
                     )}
                  </div>
               </div>
            </div>

            {isEditing && (
               <div className={styles.formActions}>
                  <Button
                     type="button"
                     variant="ghost"
                     onClick={() => {
                        reset({
                           name: hotelData.name,
                           location: hotelData.location,
                           latitude: hotelData.latitude,
                           longitude: hotelData.longitude,
                           contact_info: hotelData.contact_info,
                           description: hotelData.description,
                           profile_pic_url: hotelData.profile_pic_url,
                           profile_pic_public_id:
                              hotelData.profile_pic_public_id,
                        });
                        setIsEditing(false);
                     }}
                  >
                     Cancel
                  </Button>
                  <Button
                     type="submit"
                     isLoading={updateHotelMutation.isPending}
                     disabled={
                        !isDirty || updateHotelMutation.isPending || isUploading
                     }
                  >
                     <Save size={18} />
                     Save Changes
                  </Button>
               </div>
            )}
         </form>
      </div>
   );
};

export default Profile;
