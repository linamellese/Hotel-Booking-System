import DashboardLayout from "./DashboardLayout/DashboardLayout";
import {
   Home,
   Bed,
   DoorOpen,
   Calendar,
   CreditCard,
   User,
   BarChart3,
   ShieldCheck,
   Star,
   LayoutDashboard,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { hotelOwnerApi } from "../../api/hotelOwner";

const HotelOwnerLayout = () => {
   // if the business is not approved, the menu item are only  dashboard and business approval and profile
   const { data: hotel } = useQuery({
      queryKey: ["hotel-owner-dashboard"],
      queryFn: async () => {
         const response = await hotelOwnerApi.getMyHotel();
         return response.data;
      },
   });
   const isBusinessApproved = hotel?.status === "approved";

   let menuItems = [];
   if (!isBusinessApproved) {
      menuItems = [
         { path: "/", label: "Home", icon: <Home size={20} /> },
         {
            path: "/hotel-owner",
            label: "Dashboard",
            icon: <LayoutDashboard size={20} />,
            exact: true,
         },
         {
            path: "/hotel-owner/business-approval",
            label: "Business Approval",
            icon: <ShieldCheck size={20} />,
            badge: "pending",
            badgeType: "warning",
         },
         {
            path: "/hotel-owner/profile",
            label: "Profile",
            icon: <User size={20} />,
         },
      ];
   } else {
      menuItems = [
         { path: "/", label: "Home", icon: <Home size={20} /> },
         {
            path: "/hotel-owner",
            label: "Dashboard",
            icon: <LayoutDashboard size={20} />,
            exact: true,
         },
         {
            path: "/hotel-owner/room-types",
            label: "Room Types",
            icon: <Bed size={20} />,
         },
         {
            path: "/hotel-owner/bookings",
            label: "Bookings",
            icon: <Calendar size={20} />,
         },
         {
            path: "/hotel-owner/bank-details",
            label: "Bank Details",
            icon: <CreditCard size={20} />,
         },
         {
            path: "/hotel-owner/profile",
            label: "Profile",
            icon: <User size={20} />,
         },
      ];
   }

   return (
      <DashboardLayout
         menuItems={menuItems}
         role="hotel_owner"
         title="Dashboard"
      />
   );
};

export default HotelOwnerLayout;
