import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { authApi } from "../../../api/auth";
import useAuthStore from "../../../store/authStore";
import Button from "../../shared/Button/Button";
import Input from "../../shared/Input/Input";
import styles from "./AuthModal.module.css";

const LoginForm = ({ onSwitchToSignup, onSwitchToForgot, onSuccess }) => {
   const navigate = useNavigate();
   const setAuth = useAuthStore((state) => state.setAuth);
   const [formData, setFormData] = useState({
      email: "",
      password: "",
   });
   const [errors, setErrors] = useState({});
   const [showPassword, setShowPassword] = useState(false);

   const loginMutation = useMutation({
      mutationFn: (data) => authApi.login(data),
      onSuccess: (response) => {
         setAuth(response.data);
         toast.success("Login successful!");
         onSuccess();

         // Redirect based on role - REMOVED to allow staying on current page
         // const role = response.data.user.role;
         // if (role === "hotel_owner") navigate("/hotel-owner");
         // else if (role === "admin") navigate("/admin");
         // else if (role === "super_admin") navigate("/admin");
         // else navigate("/customer");
      },
      onError: (error) => {
         toast.error(error.response?.data?.message || "Login failed");
      },
   });

   const validateForm = () => {
      const newErrors = {};
      if (!formData.email.trim()) newErrors.email = "Email is required";
      if (!formData.password) newErrors.password = "Password is required";
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
   };

   const handleSubmit = (e) => {
      e.preventDefault();
      if (validateForm()) {
         loginMutation.mutate(formData);
      }
   };

   const handleChange = (e) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
      if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: "" });
   };

   return (
      <div className={styles.formContainer}>
         <h2 className={styles.title}>Sign In</h2>
         <p className={styles.subtitle}>
            Don't have an account?{" "}
            <button onClick={onSwitchToSignup} className={styles.linkButton}>
               Sign up
            </button>
         </p>

         <form onSubmit={handleSubmit} className={styles.form}>
            <Input
               label="Email"
               name="email"
               type="email"
               value={formData.email}
               onChange={handleChange}
               error={errors.email}
               placeholder="Enter your email"
            />
            <div className={styles.inputWrapper}>
               <Input
                  label="Password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                  placeholder="Enter your password"
               />
               <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowPassword(!showPassword)}
               >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
               </button>
            </div>

            <div className={styles.forgotPassword}>
               <button
                  type="button"
                  onClick={onSwitchToForgot}
                  className={styles.linkButton}
               >
                  Forgot password?
               </button>
            </div>

            {/* Extended Logic: Check if user is unverified handled by backend error ideally */}

            <Button type="submit" fullWidth loading={loginMutation.isPending}>
               Sign In
            </Button>
         </form>
      </div>
   );
};

export default LoginForm;
