// middlewares/requestLogger.js
import morgan from "morgan";
import chalk from "chalk";
import { logger } from "../utils/logger.js";

// Custom token for IP
morgan.token("ip", (req) => {
   return (
      req.ip ||
      req.headers["x-forwarded-for"] ||
      (req.socket && req.socket.remoteAddress) ||
      "unknown"
   );
});

// Custom Morgan format function
const devFormat = (tokens, req, res) => {
   const status = res.statusCode;
   const color =
      status >= 500
         ? chalk.red
         : status >= 400
         ? chalk.yellow
         : status >= 300
         ? chalk.cyan
         : chalk.green;

   return [
      chalk.gray(`[${new Date().toISOString()}]`),
      chalk.blue(`[IP: ${tokens.ip(req, res)}]`),
      chalk.white(`"${tokens.method(req, res)} ${tokens.url(req, res)}"`),
      color(`[${tokens.status(req, res)}]`),
      chalk.magenta(`${tokens["response-time"](req, res)} ms`),
   ].join(" ");
};

// Production JSON format
const prodFormat = (tokens, req, res) => {
   return JSON.stringify({
      ip: tokens.ip(req, res),
      method: tokens.method(req, res),
      url: tokens.url(req, res),
      status: tokens.status(req, res),
      response_time: tokens["response-time"](req, res),
      user_agent: tokens["user-agent"](req, res),
      timestamp: new Date().toISOString(),
   });
};

// Choose format by environment
const format = process.env.NODE_ENV === "production" ? prodFormat : devFormat;

// Create Morgan middleware
export const requestLogger = morgan(format, {
   stream: {
      write: (message) => logger.info(message.trim()),
   },
});
