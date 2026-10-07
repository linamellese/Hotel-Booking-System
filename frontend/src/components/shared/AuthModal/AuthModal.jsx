import { useState, useEffect } from "react";
import { X } from "lucide-react";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";
import ForgotPasswordForm from "./ForgotPasswordForm";
import styles from "./AuthModal.module.css";

const AuthModal = ({ isOpen, onClose, initialMode = "login" }) => {
   const [mode, setMode] = useState(initialMode);

   useEffect(() => {
      setMode(initialMode);
   }, [initialMode, isOpen]);

   if (!isOpen) return null;

   const renderContent = () => {
      switch (mode) {
         case "login":
            return (
               <LoginForm
                  onSwitchToSignup={() => setMode("signup")}
                  onSwitchToForgot={() => setMode("forgot-password")}
                  onSuccess={onClose}
               />
            );
         case "signup":
            return (
               <SignupForm
                  onSwitchToLogin={() => setMode("login")}
                  onSuccess={() => setMode("login")}
               />
            );
         case "forgot-password":
            return (
               <ForgotPasswordForm onSwitchToLogin={() => setMode("login")} />
            );
         default:
            return null;
      }
   };

   return (
      <div className={styles.overlay}>
         <div className={styles.modal}>
            <button
               onClick={onClose}
               className={styles.closeButton}
               aria-label="Close modal"
            >
               <X size={24} />
            </button>

            <div className={styles.content}>{renderContent()}</div>
         </div>
      </div>
   );
};

export default AuthModal;
