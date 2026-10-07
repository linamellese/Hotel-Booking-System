import { logger } from "../utils/logger.js";
import { ERROR_TEMPLATES } from "../constants/errors.js";
import { errorResponse } from "../utils/responseFormatter.js";

const errorHandler = (err, req, res, next) => {
   // If no status code, default to 500
   const statusCode = err.statusCode || 500;
   const isOperational = err.isOperational ?? false;
   const details = err.details;

   // Get standard template based on statusCode
   const template = ERROR_TEMPLATES[statusCode] || ERROR_TEMPLATES[500];
   const errorType = template.error;
   const message = err.message || template.message;

   // Log full details internally
   logger.error({
      message: err.message,
      path: req.originalUrl,
      method: req.method,
      code: statusCode,
   });

   // If not operational → crash after logging
   if (!isOperational) {
      logger.error("Non-operational error encountered. Shutting down...");
      process.exit(1);
   }

   // Send standardized response
   errorResponse(res, {
      error: errorType,
      message,
      statusCode,
      details,
   });
};

export default errorHandler;
