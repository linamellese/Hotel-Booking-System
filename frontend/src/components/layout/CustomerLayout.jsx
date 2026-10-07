import { Calendar, User, Home, LayoutDashboard } from "lucide-react";
import DashboardLayout from "./DashboardLayout/DashboardLayout";

const CustomerLayout = () => {
   const menuItems = [
      { path: "/", label: "Home", icon: <Home size={20} /> },
      {
         path: "/customer",
         label: "Dashboard",
         icon: <LayoutDashboard size={20} />,
      },
      {
         path: "/customer/bookings",
         label: "My Bookings",
         icon: <Calendar size={20} />,
      },
      { path: "/customer/wishlist", label: "Wishlist", icon: "❤️" },
      { path: "/customer/profile", label: "Profile", icon: <User size={20} /> },
   ];

   return (
      <DashboardLayout
         menuItems={menuItems}
         role="customer"
         title="Dashboard"
      />
   );
};

export default CustomerLayout;
