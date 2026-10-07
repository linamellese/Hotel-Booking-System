import PropTypes from "prop-types";
import styles from "./Button.module.css";
import classNames from "classnames";

const Button = ({
   children,
   variant = "primary",
   size = "medium",
   fullWidth = false,
   loading = false,
   disabled = false,
   type = "button",
   onClick,
   className,
   ...props
}) => {
   const buttonClasses = classNames(
      styles.button,
      styles[`button--${variant}`],
      styles[`button--${size}`],
      {
         [styles["button--fullWidth"]]: fullWidth,
         [styles["button--loading"]]: loading,
         [styles["button--disabled"]]: disabled,
      },
      className
   );

   return (
      <button
         type={type}
         className={`${buttonClasses} ${fullWidth ? "w-full" : ""}`}
         disabled={disabled || loading}
         onClick={onClick}
         {...props}
      >
         {loading && (
            <span className={styles.button__spinner}>
               <svg className={styles.button__spinnerSvg} viewBox="0 0 50 50">
                  <circle
                     className={styles.button__spinnerCircle}
                     cx="25"
                     cy="25"
                     r="20"
                     fill="none"
                     strokeWidth="4"
                  />
               </svg>
            </span>
         )}
         <span className={styles.button__content}>{children}</span>
      </button>
   );
};

Button.propTypes = {
   children: PropTypes.node.isRequired,
   variant: PropTypes.oneOf([
      "primary",
      "secondary",
      "danger",
      "outline",
      "ghost",
   ]),
   size: PropTypes.oneOf(["small", "medium", "large"]),
   fullWidth: PropTypes.bool,
   loading: PropTypes.bool,
   disabled: PropTypes.bool,
   type: PropTypes.oneOf(["button", "submit", "reset"]),
   onClick: PropTypes.func,
   className: PropTypes.string,
};

export default Button;
