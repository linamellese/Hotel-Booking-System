import { useEffect } from "react";
import PropTypes from "prop-types";
import { X } from "lucide-react";
import styles from "./Modal.module.css";
import classNames from "classnames";

const Modal = ({
   isOpen,
   onClose,
   title,
   children,
   footer,
   size = "md",
   closeOnOverlayClick = true,
   showCloseButton = true,
   className,
   overlayClassName,
}) => {
   useEffect(() => {
      const handleEscape = (e) => {
         if (e.key === "Escape" && isOpen) {
            onClose();
         }
      };

      if (isOpen) {
         document.body.style.overflow = "hidden";
         document.addEventListener("keydown", handleEscape);
      }

      return () => {
         document.body.style.overflow = "unset";
         document.removeEventListener("keydown", handleEscape);
      };
   }, [isOpen, onClose]);

   if (!isOpen) return null;

   const handleOverlayClick = (e) => {
      if (closeOnOverlayClick && e.target === e.currentTarget) {
         onClose();
      }
   };

   const modalClasses = classNames(
      styles.modal,
      styles[`modal--${size}`],
      className
   );

   const overlayClasses = classNames(styles.modal__overlay, overlayClassName);

   return (
      <div className={overlayClasses} onClick={handleOverlayClick}>
         <div
            className={modalClasses}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? "modal-title" : undefined}
         >
            {showCloseButton && (
               <button
                  className={styles.modal__close}
                  onClick={onClose}
                  aria-label="Close modal"
               >
                  <X size={24} />
               </button>
            )}

            {title && (
               <div className={styles.modal__header}>
                  <h2 id="modal-title" className={styles.modal__title}>
                     {title}
                  </h2>
               </div>
            )}

            <div className={styles.modal__body}>{children}</div>

            {footer && <div className={styles.modal__footer}>{footer}</div>}
         </div>
      </div>
   );
};

Modal.propTypes = {
   isOpen: PropTypes.bool.isRequired,
   onClose: PropTypes.func.isRequired,
   title: PropTypes.string,
   children: PropTypes.node.isRequired,
   footer: PropTypes.node,
   size: PropTypes.oneOf(["sm", "md", "lg", "xl"]),
   closeOnOverlayClick: PropTypes.bool,
   showCloseButton: PropTypes.bool,
   className: PropTypes.string,
   overlayClassName: PropTypes.string,
};

export default Modal;
