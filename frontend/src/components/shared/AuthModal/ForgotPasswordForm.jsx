import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { authApi } from "../../../api/auth";
import Button from "../../shared/Button/Button";
import Input from "../../shared/Input/Input";
import styles from "./AuthModal.module.css";

const ForgotPasswordForm = ({ onSwitchToLogin }) => {
   const [email, setEmail] = useState("");
   const [isSubmitted, setIsSubmitted] = useState(false);
   const [cooldown, setCooldown] = useState(0);

   useEffect(() => {
      let timer;
      if (cooldown > 0) {
         timer = setInterval(() => {
            setCooldown((prev) => prev - 1);
         }, 1000);
      }
      return () => clearInterval(timer);
   }, [cooldown]);

   const forgotMutation = useMutation({
      mutationFn: (data) => authApi.forgotPassword(data),
      onSuccess: () => {
         setIsSubmitted(true);
         setCooldown(60); // 60 seconds cooldown for resend
         toast.success("Reset link sent!");
      },
      onError: (error) => {
         toast.error(
            error.response?.data?.message || "Failed to send reset link"
         );
      },
   });

   const handleSubmit = (e) => {
      e.preventDefault();
      if (!email.trim()) {
         toast.error("Email is required");
         return;
      }
      forgotMutation.mutate({ email });
   };

   const handleResend = () => {
      if (cooldown === 0) {
         forgotMutation.mutate({ email });
      }
   };

   if (isSubmitted) {
      return (
         <div className={styles.formContainer}>
            <h2 className={styles.title}>Check Your Email</h2>
            <p className={styles.subtitle}>
               We've sent a password reset link to <strong>{email}</strong>.
               Please check your inbox and follow the instructions.
            </p>

            <div className={styles.successActions}>
               <Button
                  onClick={handleResend}
                  variant="outline"
                  fullWidth
                  disabled={cooldown > 0 || forgotMutation.isPending}
               >
                  {cooldown > 0
                     ? `Resend Email (${cooldown}s)`
                     : "Resend Email"}
               </Button>
               <Button onClick={onSwitchToLogin} variant="ghost" fullWidth>
                  Back to Login
               </Button>
            </div>
         </div>
      );
   }

   return (
      <div className={styles.formContainer}>
         <h2 className={styles.title}>Forgot Password</h2>
         <p className={styles.subtitle}>
            Enter your email address and we'll send you a link to reset your
            password.
         </p>

         <form onSubmit={handleSubmit} className={styles.form}>
            <Input
               label="Email Address"
               type="email"
               value={email}
               onChange={(e) => setEmail(e.target.value)}
               placeholder="Enter your email"
               required
            />

            <Button type="submit" fullWidth loading={forgotMutation.isPending}>
               Reset Password
            </Button>

            <Button
               onClick={onSwitchToLogin}
               variant="ghost"
               fullWidth
               type="button"
            >
               Back to Login
            </Button>
         </form>
      </div>
   );
};

export default ForgotPasswordForm;
