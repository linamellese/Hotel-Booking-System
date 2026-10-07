import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import LoadingSpinner from "../components/shared/Loading/LoadingSpinner";
import RoleRoute from "./RoleRoute";

// Lazy load pages for better performance
const Home = lazy(() => import("../pages/public/Home/Home"));
const About = lazy(() => import("../pages/public/About/About"));
const Contact = lazy(() => import("../pages/public/Contact/Contact"));
const RoomSearch = lazy(() => import("../pages/public/RoomSearch/RoomSearch"));
const RoomDetails = lazy(() =>
   import("../pages/public/RoomDetails/RoomDetails")
);
const PageNotFound = lazy(() =>
   import("../pages/shared/PageNotFound/PageNotFound")
);
const Unauthorized = lazy(() =>
   import("../pages/shared/Unauthorized/Unauthorized")
);
const VerifyEmail = lazy(() =>
   import("../pages/public/VerifyEmail/VerifyEmail")
);
const ResetPassword = lazy(() =>
   import("../pages/public/ResetPassword/ResetPassword")
);

// Customer Pages
const CustomerDashboard = lazy(() =>
   import("../pages/customer/Dashboard/Dashboard")
);
const CustomerBookings = lazy(() =>
   import("../pages/customer/Bookings/Bookings")
);
const BookingDetails = lazy(() =>
   import("../pages/customer/BookingDetails/BookingDetails")
);
const Wishlist = lazy(() => import("../pages/customer/Wishlist/Wishlist"));
const Profile = lazy(() => import("../pages/shared/Profile/Profile"));

// Hotel Owner Pages
const HotelOwnerDashboard = lazy(() =>
   import("../pages/hotelOwner/Dashboard/Dashboard")
);
const BusinessApproval = lazy(() =>
   import("../pages/hotelOwner/BusinessApproval/BusinessApproval")
);
const RoomTypes = lazy(() => import("../pages/hotelOwner/RoomTypes/RoomTypes"));
const RoomTypeDetails = lazy(() =>
   import("../pages/hotelOwner/RoomTypeDetails/RoomTypeDetails")
);
const HotelBookings = lazy(() =>
   import("../pages/hotelOwner/Bookings/Bookings")
);
const BankDetails = lazy(() =>
   import("../pages/hotelOwner/BankDetails/BankDetails")
);

// Admin Pages
const AdminDashboard = lazy(() => import("../pages/admin/Dashboard/Dashboard"));
const AdminUsers = lazy(() => import("../pages/admin/Users/Users"));
const AdminHotels = lazy(() => import("../pages/admin/Hotels/Hotels"));
const AdminHotelDetails = lazy(() =>
   import("../pages/admin/HotelDetails/HotelDetails")
);
const AdminPropertySetup = lazy(() =>
   import("../pages/admin/PropertySetup/PropertySetup")
);
const AdminBookings = lazy(() => import("../pages/admin/Bookings/Bookings"));
const AdminBookingDetails = lazy(() =>
   import("../pages/admin/BookingDetails/BookingDetails")
);

// Layouts
const MainLayout = lazy(() =>
   import("../components/layout/MainLayout/MainLayout")
);
const CustomerLayout = lazy(() =>
   import("../components/layout/CustomerLayout")
);
const HotelOwnerLayout = lazy(() =>
   import("../components/layout/HotelOwnerLayout")
);
const AdminLayout = lazy(() => import("../components/layout/AdminLayout"));

const Router = () => {
   return (
      <Suspense fallback={<LoadingSpinner fullScreen />}>
         <Routes>
            {/* Public routes */}
            <Route path="/" element={<MainLayout />}>
               <Route index element={<Home />} />
               <Route path="about" element={<About />} />
               <Route path="contact" element={<Contact />} />
               <Route path="room-types" element={<RoomSearch />} />
               <Route path="room-types/:id" element={<RoomDetails />} />
               <Route path="auth/verify-email" element={<VerifyEmail />} />
               <Route path="reset-password" element={<ResetPassword />} />
            </Route>

            {/* Customer routes */}
            <Route
               path="/customer"
               element={
                  <RoleRoute allowedRoles={["customer"]}>
                     <CustomerLayout />
                  </RoleRoute>
               }
            >
               <Route index element={<CustomerDashboard />} />
               <Route path="bookings" element={<CustomerBookings />} />
               <Route path="bookings/:id" element={<BookingDetails />} />
               <Route path="wishlist" element={<Wishlist />} />
               <Route path="profile" element={<Profile />} />
            </Route>

            {/* Hotel Owner routes */}
            <Route
               path="/hotel-owner"
               element={
                  <RoleRoute
                     allowedRoles={["hotel_owner"]}
                     checkBusinessApproval={false} // Don't check for business approval on layout
                  >
                     <HotelOwnerLayout />
                  </RoleRoute>
               }
            >
               <Route index element={<HotelOwnerDashboard />} />
               <Route path="business-approval" element={<BusinessApproval />} />
               <Route path="room-types" element={<RoomTypes />} />
               <Route path="room-types/:id" element={<RoomTypeDetails />} />
               <Route path="bookings" element={<HotelBookings />} />
               <Route path="bank-details" element={<BankDetails />} />
               <Route path="profile" element={<Profile />} />
            </Route>

            {/* Admin routes */}
            <Route
               path="/admin"
               element={
                  <RoleRoute allowedRoles={["admin", "super_admin"]}>
                     <AdminLayout />
                  </RoleRoute>
               }
            >
               <Route index element={<AdminDashboard />} />
               <Route path="users" element={<AdminUsers />} />
               <Route path="hotels" element={<AdminHotels />} />
               <Route path="hotels/:id" element={<AdminHotelDetails />} />
               <Route path="property-setup" element={<AdminPropertySetup />} />
               <Route path="bookings" element={<AdminBookings />} />
               <Route path="bookings/:id" element={<AdminBookingDetails />} />
               <Route path="profile" element={<Profile />} />
            </Route>

            {/* Redirects */}
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="*" element={<PageNotFound />} />
         </Routes>
      </Suspense>
   );
};

export default Router;
