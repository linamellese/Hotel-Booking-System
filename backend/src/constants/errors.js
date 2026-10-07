/**
 *
 * *  Error Constants
 *
 */

export const ERROR_TEMPLATES = {
   400: { error: "Bad Request", message: "Provided parameter is invalid." },
   401: {
      error: "Unauthorized",
      message: "You are not signed in. Please sign in.",
   },
   403: { error: "Forbidden", message: "You do not have permission." },
   404: {
      error: "Not Found",
      message: "The requested resource was not found.",
   },
   409: { error: "Conflict", message: "Resource already exists." },
   429: {
      error: "Too Many Requests",
      message: "Too many requests in a short period. Please try again later.",
   },
   500: {
      error: "Internal Server Error",
      message: "An unexpected error occurred.",
   },
};
