/**
 * Logger utility for servers
 * Creates server specific loggers with file and console outputs
 */

import winston from "winston";

// JSON format for production logs
const logFormat = winston.format.combine(
   winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
   winston.format.errors({ stack: true }),
   winston.format.json()
);

// Colored format for development console
const consoleFormat = winston.format.combine(
   winston.format.colorize(),
   winston.format.timestamp({ format: "HH:mm:ss" }),
   winston.format.printf(({ timestamp, level, message, server, ...meta }) => {
      return `[${timestamp}] ${
         server ? `[${server}]` : ""
      } ${level}: ${message} ${
         Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ""
      }`;
   })
);

/**
 * Create logger for a server
 * @param {string} serverName - Server identifier
 * @returns {winston.Logger} Logger instance
 */
export const createLogger = (serverName) => {
   const logger = winston.createLogger({
      level: process.env.LOG_LEVEL || "info",
      defaultMeta: { server: serverName },
      format: logFormat,
      transports: [
         // Error-only log file
         new winston.transports.File({
            filename: `logs/${serverName}-error.log`,
            level: "error",
            maxsize: 5242880, // 5MB
            maxFiles: 5,
         }),
         // Combined log file (info + warnings + errors)
         new winston.transports.File({
            filename: `logs/${serverName}-combined.log`,
            level: "info",
            maxsize: 5242880, // 5MB
            maxFiles: 5,
         }),
      ],
   });

   // Add console output in development
   if (process.env.NODE_ENV !== "production") {
      logger.add(
         new winston.transports.Console({
            format: consoleFormat,
            level: "debug", // More verbose in dev
         })
      );
   }

   return logger;
};

export const logger = createLogger(process.env.SERVER_NAME);
