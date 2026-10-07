import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { authApi } from "../../../api/auth";
import { Eye, EyeOff } from "lucide-react";
import Button from "../../shared/Button/Button";
import Input from "../../shared/Input/Input";
import styles from "./AuthModal.module.css";

const SignupForm = ({ onSwitchToLogin, onSuccess }) => {
   const [formData, setFormData] = useState({
      first_name: "",
      last_name: "",
      email: "",
      phone_number: "",
      password: "",
      confirmPassword: "",
      role: "customer", // Default role
   });
   const [errors, setErrors] = useState({});
   const [showPassword, setShowPassword] = useState(false);

   const registerMutation = useMutation({
      mutationFn: (data) => authApi.register(data),
      onSuccess: () => {
         toast.success("Account created! Please check your email to verify.");
         onSuccess(); // Switch to login or close
      },
      onError: (error) => {
         if (error.response?.data?.details) {
            toast.error(error.response?.data?.details[0]?.msg);
         } else {
            toast.error(error.response?.data?.message || "Registration failed");
         }
      },
   });

   const validateForm = () => {
      const newErrors = {};
      if (!formData.first_name.trim())
         newErrors.first_name = "First name is required";
      if (!formData.last_name.trim())
         newErrors.last_name = "Last name is required";
      if (!formData.email.trim()) newErrors.email = "Email is required";
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
         newErrors.email = "Invalid email format";
      }
      if (!formData.password) {
         newErrors.password = "Password is required";
      } else {
         if (formData.password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
         }
         if (!/[A-Z]/.test(formData.password)) {
            newErrors.password =
               "Password must contain at least one uppercase letter";
         }
         if (!/[0-9]/.test(formData.password)) {
            newErrors.password = "Password must contain at least one number";
         }
      }

      if (formData.password !== formData.confirmPassword) {
         newErrors.confirmPassword = "Passwords do not match";
      }
      if (!formData.phone_number.trim())
         newErrors.phone_number = "Phone number is required";
      // Validate phone number format
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(formData.phone_number)) {
         newErrors.phone_number = "Invalid phone number format";
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
   };

   const handleSubmit = (e) => {
      e.preventDefault();
      if (validateForm()) {
         // Exclude confirmPassword from API payload
         const { confirmPassword, ...payload } = formData;
         registerMutation.mutate(payload);
      }
   };

   const handleChange = (e) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
      if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: "" });
   };

   return (
      <div className={styles.formContainer}>
         <h2 className={styles.title}>Create Account</h2>
         <p className={styles.subtitle}>
            Already have an account?{" "}
            <button onClick={onSwitchToLogin} className={styles.linkButton}>
               Sign in
            </button>
         </p>

         <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.row}>
               <Input
                  label="First Name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  error={errors.first_name}
               />
               <Input
                  label="Last Name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  error={errors.last_name}
               />
            </div>
            <Input
               label="Email"
               name="email"
               type="email"
               value={formData.email}
               onChange={handleChange}
               error={errors.email}
            />
            <Input
               label="Phone Number"
               name="phone_number"
               value={formData.phone_number}
               onChange={handleChange}
               error={errors.phone_number}
            />
            <div className={styles.inputWrapper}>
               <Input
                  label="Password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
               />
               <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowPassword(!showPassword)}
               >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
               </button>
            </div>

            <div className={styles.inputWrapper}>
               <Input
                  label="Confirm Password"
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={errors.confirmPassword}
               />
               <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowPassword(!showPassword)}
               >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
               </button>
            </div>

            <div className="flex items-center gap-2 py-2">
               <input
                  type="checkbox"
                  id="hotel-owner-toggle"
                  checked={formData.role === "hotel_owner"}
                  onChange={(e) => {
                     setFormData((prev) => ({
                        ...prev,
                        role: e.target.checked ? "hotel_owner" : "customer",
                     }));
                  }}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
               />
               <label
                  htmlFor="hotel-owner-toggle"
                  className="text-sm text-gray-700 font-medium cursor-pointer"
               >
                  Register as a Hotel Owner
               </label>
            </div>

            <Button
               type="submit"
               fullWidth
               loading={registerMutation.isPending}
            >
               Sign Up
            </Button>
         </form>
      </div>
   );
};

export default SignupForm;
