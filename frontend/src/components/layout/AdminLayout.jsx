import DashboardLayout from "./DashboardLayout/DashboardLayout";
import {
   Home,
   Users,
   Calendar,
   ListChecks,
   Hotel,
   User,
   LayoutDashboard,
} from "lucide-react";

const AdminLayout = () => {
   const menuItems = [
      { path: "/", label: "Home", icon: <Home size={20} /> },
      {
         path: "/admin",
         label: "Dashboard",
         icon: <LayoutDashboard size={20} />,
      },
      {
         path: "/admin/users",
         label: "Users",
         icon: <Users size={20} />,
      },
      {
         path: "/admin/hotels",
         label: "Hotels",
         icon: <Hotel size={20} />,
      },
      {
         path: "/admin/bookings",
         label: "Bookings",
         icon: <Calendar size={20} />,
      },
      {
         path: "/admin/property-setup",
         label: "Property Setup",
         icon: <ListChecks size={20} />,
      },
      {
         path: "/admin/profile",
         label: "Profile",
         icon: <User size={20} />,
      },
   ];

   return (
      <DashboardLayout menuItems={menuItems} role="admin" title="Dashboard" />
   );
};

export default AdminLayout;
