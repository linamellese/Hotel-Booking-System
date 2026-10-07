import PropTypes from "prop-types";
import styles from "./Input.module.css";
import classNames from "classnames";

const Input = ({
   label,
   type = "text",
   value,
   onChange,
   error,
   placeholder,
   required = false,
   disabled = false,
   readOnly = false,
   className,
   containerClassName,
   lefticon,
   righticon,
   ...props
}) => {
   const inputClasses = classNames(
      styles.input,
      {
         [styles["input--error"]]: error,
         [styles["input--disabled"]]: disabled,
         [styles["input--readonly"]]: readOnly,
         [styles["input--with-left-icon"]]: lefticon,
         [styles["input--with-right-icon"]]: righticon,
      },
      className
   );

   const containerClasses = classNames(
      styles.input__container,
      containerClassName
   );

   return (
      <div className={containerClasses}>
         {label && (
            <label className={styles.input__label}>
               {label}
               {required && <span className={styles.input__required}>*</span>}
            </label>
         )}
         <div className={styles.input__wrapper}>
            {lefticon && (
               <span className={styles.input__leftIcon}>{lefticon}</span>
            )}
            <input
               type={type}
               value={value}
               onChange={onChange}
               placeholder={placeholder}
               disabled={disabled}
               readOnly={readOnly}
               className={inputClasses}
               {...props}
            />
            {righticon && (
               <span className={styles.input__righticon}>{righticon}</span>
            )}
         </div>
         {error && <span className={styles.input__error}>{error}</span>}
      </div>
   );
};

Input.propTypes = {
   label: PropTypes.string,
   type: PropTypes.string,
   value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
   onChange: PropTypes.func,
   error: PropTypes.string,
   placeholder: PropTypes.string,
   required: PropTypes.bool,
   disabled: PropTypes.bool,
   readOnly: PropTypes.bool,
   className: PropTypes.string,
   containerClassName: PropTypes.string,
   lefticon: PropTypes.node,
   righticon: PropTypes.node,
};

export default Input;
