import PropTypes from "prop-types";
import styles from "./LoadingSpinner.module.css";
import classNames from "classnames";

const LoadingSpinner = ({
   size = "medium",
   color = "primary",
   fullScreen = false,
   text = "",
   overlay = false,
   className,
}) => {
   const spinnerClasses = classNames(
      styles.spinner,
      styles[`spinner--${size}`],
      styles[`spinner--${color}`],
      className
   );

   if (fullScreen) {
      return (
         <div className={styles.spinner__fullscreen}>
            <div className={spinnerClasses} />
            {text && <div className={styles.spinner__text}>{text}</div>}
         </div>
      );
   }

   if (overlay) {
      return (
         <div className={styles.spinner__overlay}>
            <div className={spinnerClasses} />
            {text && <div className={styles.spinner__text}>{text}</div>}
         </div>
      );
   }

   return (
      <div className={styles.spinner__container}>
         <div className={spinnerClasses} />
         {text && <div className={styles.spinner__text}>{text}</div>}
      </div>
   );
};

LoadingSpinner.propTypes = {
   size: PropTypes.oneOf(["small", "medium", "large", "xlarge"]),
   color: PropTypes.oneOf(["primary", "secondary", "white", "gray"]),
   fullScreen: PropTypes.bool,
   text: PropTypes.string,
   overlay: PropTypes.bool,
   className: PropTypes.string,
};

// Page loading component
export const PageLoader = ({ text = "Loading..." }) => (
   <div className={styles.pageLoader}>
      <LoadingSpinner size="large" text={text} />
   </div>
);

// Content loading component with skeleton
export const ContentLoader = ({
   rows = 3,
   columns = 1,
   showSpinner = true,
}) => (
   <div className={styles.contentLoader}>
      {showSpinner && <LoadingSpinner size="medium" />}
      <div className={styles.contentLoader__skeleton}>
         {Array.from({ length: columns }).map((_, colIndex) => (
            <div key={colIndex} className={styles.contentLoader__column}>
               {Array.from({ length: rows }).map((_, rowIndex) => (
                  <div key={rowIndex} className={styles.contentLoader__row} />
               ))}
            </div>
         ))}
      </div>
   </div>
);

// Button loading spinner
export const ButtonSpinner = ({ size = "small" }) => (
   <div className={styles.buttonSpinner}>
      <LoadingSpinner size={size} color="white" />
   </div>
);

export default LoadingSpinner;
