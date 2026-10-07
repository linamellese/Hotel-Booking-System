import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { authApi } from "../../../api/auth";
import Button from "../../../components/shared/Button/Button";
import styles from "./VerifyEmail.module.css";

const VerifyEmail = () => {
   const [searchParams] = useSearchParams();
   const navigate = useNavigate();
   const token = searchParams.get("token");
   const [status, setStatus] = useState("verifying"); // verifying, success, error

   const verifyMutation = useMutation({
      mutationFn: (token) => authApi.verifyEmail({ token }),
      onSuccess: () => {
         setStatus("success");
         toast.success("Email verified successfully!");
      },
      onError: (error) => {
         setStatus("error");
         toast.error(error.response?.data?.message || "Verification failed");
      },
   });

   useEffect(() => {
      if (token) {
         verifyMutation.mutate(token);
      } else {
         setStatus("error");
      }
   }, [token]);

   return (
      <div className={styles.container}>
         <div className={styles.card}>
            {status === "verifying" && (
               <div className={styles.content}>
                  <Loader2 className={styles.spinner} size={48} />
                  <h2 className={styles.title}>Verifying your email...</h2>
                  <p className={styles.text}>
                     Please wait while we verify your email address.
                  </p>
               </div>
            )}

            {status === "success" && (
               <div className={styles.content}>
                  <CheckCircle className={styles.successIcon} size={48} />
                  <h2 className={styles.title}>Email Verified!</h2>
                  <p className={styles.text}>
                     Your email has been successfully verified. You can now sign
                     in to your account.
                  </p>
                  <Button
                     onClick={() => navigate("/")} // Navigate home, user can click Login there
                     fullWidth
                  >
                     Go to Home
                  </Button>
               </div>
            )}

            {status === "error" && (
               <div className={styles.content}>
                  <XCircle className={styles.errorIcon} size={48} />
                  <h2 className={styles.title}>Verification Failed</h2>
                  <p className={styles.text}>
                     The verification link is invalid or has expired. Please
                     request a new one or try again.
                  </p>
                  <Button
                     variant="outline"
                     onClick={() => navigate("/")}
                     fullWidth
                  >
                     Go to Home
                  </Button>
               </div>
            )}
         </div>
      </div>
   );
};

export default VerifyEmail;
