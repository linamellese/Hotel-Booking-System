import express from "express";
import cors from "cors";
import { requestLogger } from "./middlewares/requestLogger.js";
import { rateLimiter } from "./middlewares/rateLimiter.js";
import errorHandler from "./middlewares/errorHandler.js";
import { successResponse } from "./utils/responseFormatter.js";
import { HTTP_STATUS } from "./constants/http.js";
import AppError from "./utils/AppError.js";
import authRoutes from "./modules/auth/routes/index.js";
import usersRoutes from "./modules/users/routes/index.js";
import adminRoutes from "./modules/admin/routes/index.js";
import hotelsRoutes from "./modules/hotels/routes/index.js";
import bookingsRoutes from "./modules/bookings/routes/index.js";
import paymentsRoutes from "./modules/payments/routes/index.js";
import { logger } from "./utils/logger.js";
import { HotelService } from "./modules/hotels/service/index.js";
import { UserService } from "./modules/users/service/index.js";
import installRoutes from "./modules/install/routes/index.js";
const app = express();

// ====== Global Middlewares ======
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Parse incoming JSON requests
/**
 * GLOBAL invalid JSON handler
 * Must be AFTER express.json()
 */
app.use((err, req, res, next) => {
   if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
      return res.status(400).json({
         success: false,
         message: "Invalid JSON body",
      });
   }

   next(err);
});
app.set("trust proxy", 1); // Enable "trust proxy" if using Nginx or reverse proxy
app.use(requestLogger);

// ====== Global Rate Limiter ======
app.use(
   rateLimiter({
      windowMs: 1 * 60 * 1000, // 1 minutes
      max: 100, // limit each IP to 100 requests per windowMs
   })
);

// ====== System installation ======
app.use("/api/v1/install", installRoutes);

// ====== Health Check Route ======
app.use("/api/v1/health", (req, res) => {
   successResponse(res, {
      message: "healthy",
   });
});

// set hotel service
app.set("hotelService", HotelService);
// set user service
app.set("userService", UserService);
// ====== Api Routes ======
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", usersRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/hotels", hotelsRoutes);
app.use("/api/v1/bookings", bookingsRoutes);
app.use("/api/v1/payments", paymentsRoutes);

// ====== 404 Fallback ======
app.use((req, res) => {
   throw new AppError("Route Not Found", HTTP_STATUS.NOT_FOUND);
});

// Global error handler (must be last)
app.use(errorHandler);

// Handle uncaught exceptions (sync code)
process.on("uncaughtException", (err) => {
   logger.error("UNCAUGHT EXCEPTION 💥 Shutting down...");
   logger.error(err);
   process.exit(1); // crash to restart in stable state
});

// Handle unhandled promise rejections (async code)
process.on("unhandledRejection", (err) => {
   logger.error("UNHANDLED REJECTION 💥 Shutting down...");
   logger.error(err);
   process.exit(1); // crash to restart in stable state
});

// Export the configured Express application instance.
export default app;
