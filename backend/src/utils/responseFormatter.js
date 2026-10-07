import { HTTP_STATUS } from "../constants/http.js";

/**
 * Success response
 * @param {object} res - Express response object
 * @param {object} options - Response options
 * @param {string} [options.message] - Success message
 * @param {any} [options.data] - Payload data
 * @param {number} [options.statusCode] - HTTP status code (default 200)
 */
export const successResponse = (
   res,
   { message = "Success", data, statusCode = HTTP_STATUS.OK, meta = {} }
) => {
   const response = {
      success: true,
      message,
      timestamp: new Date().toISOString(),
      ...(data && { data }), // add data only if not null
      ...(Object.keys(meta).length > 0 && meta), // spread meta if not empty
   };

   return res.status(statusCode).json(response);
};

/**
 * Error response
 * @param {object} res - Express response object
 * @param {object} options - Error options
 * @param {string} options.error - Error code
 * @param {string} [options.message] - Optional custom message
 * @param {number} [options.statusCode] - HTTP status code (default 500)
 * @param {any} [options.details] - Optional additional info
 */
export const errorResponse = (
   res,
   {
      error,
      message = "Something went wrong",
      statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR,
      details,
   }
) => {
   const response = {
      success: false,
      error,
      message,
      timestamp: new Date().toISOString(),
      ...(details && { details }), // Add only if not null/undefined
   };

   return res.status(statusCode).json(response);
};
