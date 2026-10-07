import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { hotelOwnerApi } from "../../../api/hotelOwner";
import Button from "../../../components/shared/Button/Button";
import Input from "../../../components/shared/Input/Input";
import LoadingSpinner from "../../../components/shared/Loading/LoadingSpinner";
import styles from "./BankDetails.module.css";
import useAuthStore from "../../../store/authStore";

const BankDetails = () => {
   const { user } = useAuthStore();

   const [form, setForm] = useState({
      bank_name: "",
      account_number: "",
      account_holder_name: "",
   });

   const [initialForm, setInitialForm] = useState(null);

   // Fetch existing details
   const {
      data: hotelData,
      isLoading,
      refetch,
   } = useQuery({
      queryKey: ["my-hotel"],
      queryFn: async () => {
         const res = await hotelOwnerApi.getMyHotel();
         return res.data;
      },
   });

   useEffect(() => {
      if (hotelData) {
         const data = {
            bank_name: hotelData.bank_name || "",
            account_number: hotelData.account_number || "",
            account_holder_name: hotelData.account_holder_name || "",
         };
         setForm(data);
         setInitialForm(data);
      }
   }, [hotelData]);

   const updateMutation = useMutation({
      mutationFn: (data) => hotelOwnerApi.updateBankDetails(hotelData.id, data),
      onSuccess: () => {
         toast.success("Bank details updated successfully");
         refetch();
         // Initial form will be updated by the useEffect when data refetches
      },
      onError: (error) => {
         toast.error(
            error.response?.data?.message || "Failed to update details"
         );
      },
   });

   const handleChange = (e) => {
      setForm({ ...form, [e.target.name]: e.target.value });
   };

   const handleSubmit = (e) => {
      e.preventDefault();
      updateMutation.mutate(form);
   };

   const isChanged =
      initialForm && JSON.stringify(form) !== JSON.stringify(initialForm);

   if (isLoading) return <LoadingSpinner fullScreen />;

   return (
      <div className={styles.container}>
         <div className={styles.header}>
            <h1 className={styles.title}>Bank Details</h1>
            <p className={styles.subtitle}>Manage your payout information</p>
         </div>

         <div className={styles.card}>
            <form onSubmit={handleSubmit} className={styles.form}>
               <div className={styles.selectInput__contanier}>
                  <label className={styles.label}>Bank Name</label>
                  <select
                     name="bank_name"
                     value={form.bank_name}
                     onChange={handleChange}
                     className={styles.selectInput}
                  >
                     <option value="">Select Bank</option>
                     <option value="CBE">Commercial Bank of Ethiopia</option>
                     <option value="Awash">Awash Bank</option>
                     <option value="Dashen">Dashen Bank</option>
                     <option value="Abyssinia">Bank of Abyssinia</option>
                     <option value="Hibret">Hibret Bank</option>
                     <option value="Coop">Cooperative Bank of Oromia</option>
                  </select>
               </div>

               <Input
                  label="Account Number"
                  name="account_number"
                  value={form.account_number}
                  onChange={handleChange}
                  placeholder="Enter account number"
               />

               <Input
                  label="Account Holder Name"
                  name="account_holder_name"
                  value={form.account_holder_name}
                  onChange={handleChange}
                  placeholder="Enter account holder name"
               />

               <div className={styles.actions}>
                  <Button
                     type="submit"
                     loading={updateMutation.isPending}
                     disabled={!isChanged || updateMutation.isPending}
                     className={`w-full sm:w-auto`}
                  >
                     Save Changes
                  </Button>
               </div>
            </form>
         </div>
      </div>
   );
};

export default BankDetails;
