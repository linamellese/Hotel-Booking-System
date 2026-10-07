import { Navigate, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import useAuthStore from "../store/authStore";
import LoadingSpinner from "../components/shared/Loading/LoadingSpinner";
import { toast } from "react-hot-toast";

/**
 * Role-based route protection component
 * Allows access based on user role and optional permissions
 */
const RoleRoute = ({
   children,
   allowedRoles,
   fallback = null,
   redirectTo = "/unauthorized",
   checkBusinessApproval = false,
}) => {
   const location = useLocation();
   const {
      isAuthenticated,
      role,
      user,
      isLoading: authLoading,
   } = useAuthStore();

   // Show loading spinner while auth is loading
   if (authLoading) {
      return fallback || <LoadingSpinner fullScreen />;
   }

   // If not authenticated, redirect to login
   if (!isAuthenticated) {
      return <Navigate to="/" state={{ from: location }} replace />;
   }

   // Check if user role is allowed
   const isRoleAllowed = allowedRoles.includes(role);

   // If role is not allowed, redirect
   if (!isRoleAllowed) {
      toast.error("You do not have permission to access this page");
      return <Navigate to={redirectTo} replace />;
   }

   // Check business approval for hotel owners
   if (checkBusinessApproval && role === "hotel_owner") {
      const isBusinessApproved = user?.business_approved;

      if (!isBusinessApproved) {
         toast.error("Your business needs approval before accessing this page");
         return <Navigate to="/hotel-owner/business-approval" replace />;
      }
   }

   // Additional checks based on user status
   if (user?.status === "inactive") {
      toast.error("Your account has been suspended. Please contact support.");
      return <Navigate to="/account-suspended" replace />;
   }

   // All checks passed, render children
   return children;
};

RoleRoute.propTypes = {
   /** Children components to render if authorized */
   children: PropTypes.node.isRequired,

   /** Array of allowed roles (e.g., ['customer', 'admin']) */
   allowedRoles: PropTypes.arrayOf(PropTypes.string).isRequired,

   /** Array of required permissions (optional) */
   allowedPermissions: PropTypes.arrayOf(PropTypes.string),

   /** Component to show while checking authorization */
   fallback: PropTypes.node,

   /** Path to redirect if unauthorized */
   redirectTo: PropTypes.string,

   /** For hotel owners: check if business is approved */
   checkBusinessApproval: PropTypes.bool,
};

RoleRoute.defaultProps = {
   redirectTo: "/unauthorized",
   checkBusinessApproval: false,
};

export default RoleRoute;
