import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
   CheckCircle,
   Loader2,
   X,
   XCircle,
   FileText,
   Image as ImageIcon,
} from "lucide-react";
import { hotelOwnerApi } from "../../../api/hotelOwner";
import Button from "../../../components/shared/Button/Button";
import Input from "../../../components/shared/Input/Input";
import { uploadImage, uploadDocument } from "../../../utils/upload";
import styles from "./BusinessApproval.module.css";
import LocationPicker from "../../../components/shared/LocationPicker/LocationPicker";

const BusinessApproval = () => {
   const navigate = useNavigate();
   const [step, setStep] = useState(1);
   const [hotelId, setHotelId] = useState(null);

   // Check existing hotel status
   const {
      data: hotel,
      isLoading: isLoadingHotel,
      refetch: refetchHotel,
   } = useQuery({
      queryKey: ["my-hotel"],
      queryFn: async () => {
         const response = await hotelOwnerApi.getMyHotel();
         return response.data;
      },
      retry: false,
   });

   // Step 1 Form Data
   const [hotelForm, setHotelForm] = useState({
      name: "",
      location: "",
      latitude: null,
      longitude: null,
      contact_info: "",
      description: "",
      profile_pic_url: "",
      profile_pic_public_id: "",
      business_license_url: "",
      business_license_public_id: "",
   });

   // Step 2 Form Data
   const [bankForm, setBankForm] = useState({
      hotel_id: hotelId,
      bank_name: "", // Will be select
      account_number: "",
      account_holder_name: "",
   });

   // File Upload State
   const [uploads, setUploads] = useState({
      profile: { progress: 0, uploading: false },
      license: { progress: 0, uploading: false },
   });

   const createHotelMutation = useMutation({
      mutationFn: async (data) => {
         const response = await hotelOwnerApi.createHotel(data);
         return response.data;
      },
      onSuccess: () => {
         toast.success("Hotel information saved");
         refetchHotel();
      },
      onError: (error) => {
         toast.error(
            error.response?.data?.message || "Failed to save hotel info"
         );
      },
   });

   const updateHotelMutation = useMutation({
      mutationFn: async (data) => {
         const response = await hotelOwnerApi.updateHotel(hotelId, data);
         return response.data;
      },
      onSuccess: () => {
         toast.success("Hotel information updated");
         refetchHotel();
         // If we are updating, allow moving to next step or stay?
         // If bank details missing, usually Step 2. If present, might jump to Step 3 via useEffect.
      },
      onError: (error) => {
         toast.error(
            error.response?.data?.message || "Failed to update hotel info"
         );
      },
   });

   const addBankDetailsMutation = useMutation({
      mutationFn: async (data) => {
         const response = await hotelOwnerApi.addBankDetails(hotelId, data);
         return response.data;
      },
      onSuccess: () => {
         toast.success("Bank details saved");
         refetchHotel();
      },
      onError: (error) => {
         toast.error(
            error.response?.data?.message || "Failed to save bank details"
         );
      },
   });

   // Check existing hotel status
   useEffect(() => {
      if (!hotel) return;

      if (!hotel.id) return;

      setHotelId(hotel.id);

      // Populate form when hotel loads
      setHotelForm((prev) => ({
         ...prev,
         name: hotel.name || "",
         location: hotel.location || "",
         latitude: hotel.latitude || null,
         longitude: hotel.longitude || null,
         contact_info: hotel.contact_info || "",
         description: hotel.description || "",
         profile_pic_url: hotel.profile_pic_url || "",
         profile_pic_public_id: hotel.profile_pic_public_id || "",
         business_license: hotel.business_license || "",
         business_license_public_id: hotel.business_license_public_id || "",
      }));

      // Only auto-advance if we are not manually editing (status check logic remains)
      // But for initial load:
      if (!hotel.bank_name) {
         setStep(2);
      } else {
         setStep(3);
      }
   }, [hotel]);

   const handleHotelChange = (e) => {
      setHotelForm({ ...hotelForm, [e.target.name]: e.target.value });
   };

   const handleBankChange = (e) => {
      setBankForm({ ...bankForm, [e.target.name]: e.target.value });
   };

   // Generic File Upload Handler
   const handleFileUpload = async (file, type) => {
      if (!file) return;

      setUploads((prev) => ({
         ...prev,
         [type]: { ...prev[type], uploading: true, progress: 0 },
      }));

      try {
         let result;
         if (type === "profile") {
            result = await uploadImage(file, (progress) => {
               setUploads((prev) => ({
                  ...prev,
                  [type]: { ...prev[type], progress },
               }));
            });
         } else {
            result = await uploadDocument(file, (progress) => {
               setUploads((prev) => ({
                  ...prev,
                  [type]: { ...prev[type], progress },
               }));
            });
         }

         if (type === "profile") {
            setHotelForm((prev) => ({
               ...prev,
               profile_pic_url: result.secure_url,
               profile_pic_public_id: result.public_id,
            }));
         } else if (type === "license") {
            setHotelForm((prev) => ({
               ...prev,
               business_license_url: result.secure_url,
               business_license_public_id: result.public_id,
            }));
         }

         toast.success("Upload successful");
      } catch (error) {
         toast.error("Upload failed");
      } finally {
         setUploads((prev) => ({
            ...prev,
            [type]: { ...prev[type], uploading: false },
         }));
      }
   };

   const handleRemoveFile = (type) => {
      if (type === "profile") {
         setHotelForm((prev) => ({
            ...prev,
            profile_pic_url: "",
            profile_pic_public_id: "",
         }));
      } else {
         setHotelForm((prev) => ({
            ...prev,
            business_license_url: "",
            business_license_public_id: "",
         }));
      }
   };

   const submitStep1 = (e) => {
      e.preventDefault();
      // Validation
      if (
         !hotelForm.name ||
         !hotelForm.location ||
         !hotelForm.contact_info ||
         !hotelForm.description
      ) {
         return toast.error("Please fill all required fields");
      }
      if (!hotelForm.profile_pic_url)
         return toast.error("Please upload a profile picture");
      if (!hotelForm.business_license_url)
         return toast.error("Please upload a business license");

      if (hotelId) {
         updateHotelMutation.mutate(hotelForm);
      } else {
         createHotelMutation.mutate(hotelForm);
      }
   };

   const submitStep2 = (e) => {
      e.preventDefault();
      if (
         !bankForm.bank_name ||
         !bankForm.account_number ||
         !bankForm.account_holder_name
      ) {
         return toast.error("Please fill all bank details");
      }
      // Assuming bank details endpoint might also need hotel_id in URL or body if not inferred from token/context
      // But user said POST /hotels/bank-details with body { ... }
      addBankDetailsMutation.mutate(bankForm);
   };

   if (isLoadingHotel)
      return (
         <div className="flex justify-center p-8">
            <Loader2 className="animate-spin text-blue-600" />
         </div>
      );

   return (
      <div className={styles.container}>
         <div className={styles.header}>
            <h1 className={styles.title}>Business Verification</h1>
            <p className={styles.subtitle}>
               Complete your profile to start hosting
            </p>
         </div>

         {/* Steps Indicator */}
         <div className={styles.steps}>
            <div
               className={`${styles.step} ${step >= 1 ? styles.active : ""} ${
                  step > 1 ? styles.completed : ""
               }`}
            >
               <div className={styles.stepNumber}>
                  {step > 1 ? <CheckCircle size={18} /> : 1}
               </div>
               <span className={styles.stepTitle}>Hotel Info</span>
            </div>
            <div
               className={`${styles.stepLine} ${
                  step > 1 ? styles.completed : ""
               }`}
            />

            <div
               className={`${styles.step} ${step >= 2 ? styles.active : ""} ${
                  step > 2 ? styles.completed : ""
               }`}
            >
               <div className={styles.stepNumber}>
                  {step > 2 ? <CheckCircle size={18} /> : 2}
               </div>
               <span className={styles.stepTitle}>Bank Details</span>
            </div>
            <div
               className={`${styles.stepLine} ${
                  step > 2 ? styles.completed : ""
               }`}
            />

            <div className={`${styles.step} ${step >= 3 ? styles.active : ""}`}>
               <div className={styles.stepNumber}>3</div>
               <span className={styles.stepTitle}>Approval</span>
            </div>
         </div>

         {/* Step 1: Hotel Information */}
         {step === 1 && (
            <div className={styles.card}>
               <h2 className="text-xl font-semibold mb-4">Hotel Information</h2>
               <form onSubmit={submitStep1} className={styles.form}>
                  <Input
                     label="Hotel Name"
                     name="name"
                     value={hotelForm.name}
                     onChange={handleHotelChange}
                     placeholder="e.g. Blue Sky Hotel"
                  />

                  <div className="mb-4">
                     <label className="text-sm font-medium text-gray-700 block mb-1">
                        Location
                     </label>
                     <p className="text-xs text-gray-500 mb-2">
                        Search for a location or pin it on the map.
                     </p>
                     <LocationPicker
                        onLocationSelect={({ lat, lng, address }) => {
                           setHotelForm((prev) => ({
                              ...prev,
                              latitude: lat,
                              longitude: lng,
                              location: address || prev.location,
                           }));
                        }}
                        initialAddress={hotelForm.location}
                     />
                  </div>

                  <div className="mb-4">
                     <Input
                        label="Contact Info"
                        name="contact_info"
                        value={hotelForm.contact_info}
                        onChange={handleHotelChange}
                        placeholder="+251..."
                     />
                  </div>

                  <div className="flex flex-col gap-1">
                     <label className="text-sm font-medium text-gray-700">
                        Description
                     </label>
                     <textarea
                        name="description"
                        value={hotelForm.description}
                        onChange={handleHotelChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none min-h-[100px]"
                        placeholder="Describe your hotel..."
                     />
                  </div>

                  {/* Profile Picture Upload */}
                  <div className={styles.uploadSection}>
                     <label className={styles.uploadLabel}>
                        Profile Picture
                     </label>
                     {!hotelForm.profile_pic_url ? (
                        <div className={styles.upload}>
                           <input
                              type="file"
                              id="profile-upload"
                              className="hidden"
                              accept="image/*"
                              onChange={(e) =>
                                 handleFileUpload(e.target.files[0], "profile")
                              }
                           />
                           <label
                              htmlFor="profile-upload"
                              className={styles.uploadArea}
                           >
                              {uploads.profile.uploading ? (
                                 <div className="flex flex-col items-center">
                                    <Loader2 className="animate-spin mb-2 text-blue-500" />
                                    <span className="text-sm text-gray-500">
                                       Uploading{" "}
                                       {Math.round(uploads.profile.progress)}%
                                    </span>
                                 </div>
                              ) : (
                                 <>
                                    <ImageIcon
                                       className={styles.uploadIcon}
                                       size={32}
                                    />
                                    <span className={styles.uploadText}>
                                       Click to upload hotel image
                                    </span>
                                 </>
                              )}
                           </label>
                        </div>
                     ) : (
                        <div className={styles.filePreview}>
                           <img
                              src={hotelForm.profile_pic_url}
                              alt="Profile"
                              className="w-12 h-12 object-cover rounded"
                           />
                           <div className={styles.fileInfo}>
                              <div className={styles.fileName}>
                                 Profile Picture
                              </div>
                              <div className="text-xs text-green-600">
                                 Uploaded
                              </div>
                           </div>
                           <button
                              type="button"
                              onClick={() => handleRemoveFile("profile")}
                              className={styles.removeFile}
                           >
                              <X size={16} />
                           </button>
                        </div>
                     )}
                  </div>

                  {/* Business License Upload */}
                  <div className={styles.uploadSection}>
                     <label className={styles.uploadLabel}>
                        Business License
                     </label>
                     {!hotelForm.business_license_url ? (
                        <div className={styles.upload}>
                           <input
                              type="file"
                              id="license-upload"
                              className="hidden"
                              accept=".pdf,image/*"
                              onChange={(e) =>
                                 handleFileUpload(e.target.files[0], "license")
                              }
                           />
                           <label
                              htmlFor="license-upload"
                              className={styles.uploadArea}
                           >
                              {uploads.license.uploading ? (
                                 <div className="flex flex-col items-center">
                                    <Loader2 className="animate-spin mb-2 text-blue-500" />
                                    <span className="text-sm text-gray-500">
                                       Uploading{" "}
                                       {Math.round(uploads.license.progress)}%
                                    </span>
                                 </div>
                              ) : (
                                 <>
                                    <FileText
                                       className={styles.uploadIcon}
                                       size={32}
                                    />
                                    <span className={styles.uploadText}>
                                       Click to upload license (PDF/Image)
                                    </span>
                                 </>
                              )}
                           </label>
                        </div>
                     ) : (
                        <div className={styles.filePreview}>
                           <FileText size={24} className="text-blue-500" />
                           <div className={styles.fileInfo}>
                              <div className={styles.fileName}>
                                 Business License
                              </div>
                              <div className="text-xs text-green-600">
                                 Uploaded
                              </div>
                           </div>
                           <button
                              type="button"
                              onClick={() => handleRemoveFile("license")}
                              className={styles.removeFile}
                           >
                              <X size={16} />
                           </button>
                        </div>
                     )}
                  </div>

                  <Button
                     type="submit"
                     fullWidth
                     loading={createHotelMutation.isPending}
                     className="mt-4"
                  >
                     Save & Continue
                  </Button>
               </form>
            </div>
         )}

         {/* Step 2: Bank Details */}
         {step === 2 && (
            <div className={styles.card}>
               <h2 className="text-xl font-semibold mb-4">Bank Details</h2>
               <form onSubmit={submitStep2} className={styles.form}>
                  <div className="flex flex-col gap-1">
                     <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Bank Name
                     </label>
                     <select
                        name="bank_name"
                        value={bankForm.bank_name}
                        onChange={handleBankChange}
                        className={styles.selectInput}
                     >
                        <option value="">Select Bank</option>
                        <option value="CBE">Commercial Bank of Ethiopia</option>
                        <option value="Awash">Awash Bank</option>
                        <option value="Dashen">Dashen Bank</option>
                        <option value="Abyssinia">Bank of Abyssinia</option>
                        <option value="Hibret">Hibret Bank</option>
                        <option value="Nib">Nib International Bank</option>
                     </select>
                  </div>

                  <Input
                     label="Account Number"
                     name="account_number"
                     value={bankForm.account_number}
                     onChange={handleBankChange}
                     placeholder="Enter account number"
                  />

                  <Input
                     label="Account Holder Name"
                     name="account_holder_name"
                     value={bankForm.account_holder_name}
                     onChange={handleBankChange}
                     placeholder="Enter full name"
                  />

                  <Button
                     type="submit"
                     fullWidth
                     loading={addBankDetailsMutation.isPending}
                     className="mt-4"
                  >
                     Submit for Approval
                  </Button>
               </form>
            </div>
         )}

         {/* Step 3: Success/Pending */}
         {/* Step 3: Success/Pending/Rejected */}
         {step === 3 && (
            <div className={styles.card}>
               {hotel?.status === "rejected" ? (
                  <div className={styles.rejectedState}>
                     <XCircle className={styles.rejectedIcon} />
                     <h2 className={styles.successTitle}>
                        Application Rejected
                     </h2>
                     <p className={styles.successText}>
                        {hotel.rejection_reason
                           ? `Reason: ${hotel.rejection_reason}`
                           : "Your application does not meet our requirements. Please review your information and try again."}
                     </p>
                     <Button onClick={() => setStep(1)}>
                        Update Information
                     </Button>
                  </div>
               ) : hotel?.status === "approved" ? (
                  <div className={styles.successState}>
                     <CheckCircle className={styles.successIcon} />
                     <h2 className={styles.successTitle}>
                        Application Approved!
                     </h2>
                     <p className={styles.successText}>
                        Congratulations! Your hotel has been approved. You can
                        now start managing your property.
                     </p>
                     <Button
                        variant="outline"
                        onClick={() => navigate("/hotel-owner")}
                     >
                        Go to Dashboard
                     </Button>
                  </div>
               ) : (
                  <div className={styles.successState}>
                     <CheckCircle className={styles.successIcon} />
                     <h2 className={styles.successTitle}>
                        Application Submitted!
                     </h2>
                     <p className={styles.successText}>
                        Your hotel information and documents have been submitted
                        successfully. Our team will review your application and
                        notify you once approved.
                     </p>
                     <Button
                        variant="outline"
                        onClick={() => navigate("/hotel-owner")}
                     >
                        Go to Dashboard
                     </Button>
                  </div>
               )}
            </div>
         )}
      </div>
   );
};

export default BusinessApproval;
