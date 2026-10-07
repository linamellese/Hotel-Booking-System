import axios from "axios";

/**
 * Uploads a file to Cloudinary
 * @param {File} file - The file to upload
 * @param {Function} onProgress - Callback for upload progress (0-100)
 * @param {string} resourceType - "image" or "raw"
 * @returns {Promise<{secure_url: string, public_id: string}>}
 */
export const uploadToCloudinary = async (file, onProgress, resourceType) => {
   if (!file) return null;

   const formData = new FormData();
   formData.append("file", file);

   // Select correct upload preset based on file type
   const uploadPreset =
      resourceType === "raw"
         ? import.meta.env.VITE_CLOUDINARY_PDF_UPLOAD_PRESET
         : import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

   if (!uploadPreset) {
      throw new Error("Cloudinary upload preset is missing");
   }

   formData.append("upload_preset", uploadPreset);

   try {
      const response = await axios.post(
         `https://api.cloudinary.com/v1_1/${
            import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
         }/${resourceType}/upload`,
         formData,
         {
            headers: {
               "Content-Type": "multipart/form-data",
            },
            onUploadProgress: (progressEvent) => {
               if (onProgress && progressEvent.total) {
                  const percentCompleted = Math.round(
                     (progressEvent.loaded * 100) / progressEvent.total
                  );
                  onProgress(percentCompleted);
               }
            },
         }
      );

      return {
         secure_url: response.data.secure_url,
         public_id: response.data.public_id,
      };
   } catch (error) {
      console.error(`Error uploading ${resourceType}:`, error);
      throw error;
   }
};

/**
 * Uploads an image
 */
export const uploadImage = (file, onProgress) => {
   return uploadToCloudinary(file, onProgress, "image");
};

/**
 * Uploads a PDF or document
 */
export const uploadDocument = (file, onProgress) => {
   return uploadToCloudinary(file, onProgress, "raw");
};
