import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { ShieldCheck, Lock, Eye, EyeOff, CheckCircle } from "lucide-react";
import { authApi } from "../../../api/auth";
import Button from "../../../components/shared/Button/Button";
import Input from "../../../components/shared/Input/Input";
import styles from "./ResetPassword.module.css";

const ResetPassword = () => {
   const [searchParams] = useSearchParams();
   const navigate = useNavigate();
   const token = searchParams.get("token");

   const [formData, setFormData] = useState({
      new_password: "",
      confirm_password: "",
   });
   const [showPassword, setShowPassword] = useState(false);
   const [isSuccess, setIsSuccess] = useState(false);

   const resetMutation = useMutation({
      mutationFn: (data) => authApi.resetPassword(data),
      onSuccess: () => {
         setIsSuccess(true);
         toast.success("Password reset successfully!");
      },
      onError: (error) => {
         if (error.response?.data?.details) {
            toast.error(error.response?.data?.details[0]?.msg);
         } else {
            toast.error(error.response?.data?.message || "Reset failed");
         }
      },
   });

   const handleSubmit = (e) => {
      e.preventDefault();

      if (!token) {
         toast.error("Invalid or missing token");
         return;
      }

      if (formData.new_password !== formData.confirm_password) {
         toast.error("Passwords do not match");
         return;
      }

      if (formData.new_password.length < 6) {
         toast.error("Password must be at least 6 characters");
         return;
      }

      if (!/[A-Z]/.test(formData.new_password)) {
         toast.error("Password must contain at least one uppercase letter");
         return;
      }

      if (!/[0-9]/.test(formData.new_password)) {
         toast.error("Password must contain at least one number");
         return;
      }

      resetMutation.mutate({
         new_password: formData.new_password,
         token,
      });
   };

   if (isSuccess) {
      return (
         <div className={styles.container}>
            <div className={styles.card}>
               <div className={styles.content}>
                  <div className={styles.successIconWrapper}>
                     <CheckCircle className={styles.successIcon} size={64} />
                  </div>
                  <h2 className={styles.title}>Password Reset!</h2>
                  <p className={styles.text}>
                     Your password has been successfully updated. You can now
                     use your new password to sign in to your account.
                  </p>
                  <Button onClick={() => navigate("/")} fullWidth>
                     Back to Home
                  </Button>
               </div>
            </div>
         </div>
      );
   }

   if (!token) {
      return (
         <div className={styles.container}>
            <div className={styles.card}>
               <div className={styles.content}>
                  <div className={styles.errorIconWrapper}>
                     <ShieldCheck className={styles.errorIcon} size={64} />
                  </div>
                  <h2 className={styles.title}>Invalid Link</h2>
                  <p className={styles.text}>
                     The password reset link is invalid or has expired. Please
                     request a new one.
                  </p>
                  <Button
                     onClick={() => navigate("/")}
                     variant="outline"
                     fullWidth
                  >
                     Back to Home
                  </Button>
               </div>
            </div>
         </div>
      );
   }

   return (
      <div className={styles.container}>
         <div className={styles.card}>
            <div className={styles.header}>
               <div className={styles.iconWrapper}>
                  <Lock className={styles.icon} size={32} />
               </div>
               <h1 className={styles.title}>Create New Password</h1>
               <p className={styles.subtitle}>
                  Please choose a strong password that you haven't used before.
               </p>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
               <div className={styles.inputWrapper}>
                  <Input
                     label="New Password"
                     type={showPassword ? "text" : "password"}
                     value={formData.new_password}
                     onChange={(e) =>
                        setFormData({
                           ...formData,
                           new_password: e.target.value,
                        })
                     }
                     placeholder="Minimum 6 characters"
                     required
                     icon={<Lock size={18} />}
                  />
                  <button
                     type="button"
                     className={styles.passwordToggle}
                     onClick={() => setShowPassword(!showPassword)}
                  >
                     {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
               </div>

               <Input
                  label="Confirm Password"
                  type={showPassword ? "text" : "password"}
                  value={formData.confirm_password}
                  onChange={(e) =>
                     setFormData({
                        ...formData,
                        confirm_password: e.target.value,
                     })
                  }
                  placeholder="Repeat your password"
                  required
                  icon={<Lock size={18} />}
               />

               <Button
                  type="submit"
                  fullWidth
                  loading={resetMutation.isPending}
               >
                  Update Password
               </Button>
            </form>
         </div>
      </div>
   );
};

export default ResetPassword;
