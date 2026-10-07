// Format currency
export const formatCurrency = (amount, currency = "ETB") => {
   return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
   }).format(amount);
};

// Format date
export const formatDate = (date, options = {}) => {
   const defaultOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
      ...options,
   };
   return new Date(date).toLocaleDateString("en-US", defaultOptions);
};

// Format date and time
export const formatDateTime = (date) => {
   return new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
   });
};

// Calculate days between dates
export const calculateDaysBetween = (startDate, endDate) => {
   const start = new Date(startDate);
   const end = new Date(endDate);
   const diffTime = Math.abs(end - start);
   return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Add days to a date
export const addDays = (dateString, days) => {
   const date = new Date(dateString);
   date.setDate(date.getDate() + days);
   return date.toISOString().split("T")[0];
};

// Validate email
export const validateEmail = (email) => {
   const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
   return re.test(email);
};

// Validate phone number (basic validation)
export const validatePhone = (phone) => {
   const re = /^[\+]?[1-9][\d]{0,15}$/;
   return re.test(phone.replace(/[\s\-\(\)\.]/g, ""));
};

// Truncate text
export const truncateText = (text, maxLength = 100) => {
   if (text.length <= maxLength) return text;
   return text.substring(0, maxLength) + "...";
};

// Generate pagination range
export const generatePaginationRange = (currentPage, totalPages, delta = 2) => {
   const range = [];
   const rangeWithDots = [];
   let l;

   for (let i = 1; i <= totalPages; i++) {
      if (
         i === 1 ||
         i === totalPages ||
         (i >= currentPage - delta && i <= currentPage + delta)
      ) {
         range.push(i);
      }
   }

   range.forEach((i) => {
      if (l) {
         if (i - l === 2) {
            rangeWithDots.push(l + 1);
         } else if (i - l !== 1) {
            rangeWithDots.push("...");
         }
      }
      rangeWithDots.push(i);
      l = i;
   });

   return rangeWithDots;
};

// Get user initials
export const getUserInitials = (firstName = "", lastName = "") => {
   return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

// Debounce function
export const debounce = (func, wait) => {
   let timeout;
   return function executedFunction(...args) {
      const later = () => {
         clearTimeout(timeout);
         func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
   };
};

// Throttle function
export const throttle = (func, limit) => {
   let inThrottle;
   return function (...args) {
      if (!inThrottle) {
         func.apply(this, args);
         inThrottle = true;
         setTimeout(() => (inThrottle = false), limit);
      }
   };
};

// Parse query string
export const parseQueryString = (queryString) => {
   const params = new URLSearchParams(queryString);
   const result = {};
   for (const [key, value] of params) {
      result[key] = value;
   }
   return result;
};

// Stringify query params
export const stringifyQueryParams = (params) => {
   return new URLSearchParams(params).toString();
};

// Copy to clipboard
export const copyToClipboard = async (text) => {
   try {
      await navigator.clipboard.writeText(text);
      return true;
   } catch (err) {
      console.error("Failed to copy text: ", err);
      return false;
   }
};

// File size formatter
export const formatFileSize = (bytes) => {
   if (bytes === 0) return "0 Bytes";
   const k = 1024;
   const sizes = ["Bytes", "KB", "MB", "GB"];
   const i = Math.floor(Math.log(bytes) / Math.log(k));
   return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// Sleep function
export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Safe JSON parse
export const safeJsonParse = (str, defaultValue = {}) => {
   try {
      return JSON.parse(str);
   } catch {
      return defaultValue;
   }
};
