import React from "react";
import PropTypes from "prop-types";
import styles from "./Card.module.css";
import classNames from "classnames";

const Card = ({
   children,
   title,
   subtitle,
   headerAction,
   footer,
   className,
   padding = true,
   hover = false,
   onClick,
   ...props
}) => {
   const cardClasses = classNames(
      styles.card,
      {
         [styles["card--hover"]]: hover,
         [styles["card--clickable"]]: onClick,
         [styles["card--no-padding"]]: !padding,
      },
      className
   );

   const handleClick = (e) => {
      if (onClick) {
         onClick(e);
      }
   };

   return (
      <div
         className={cardClasses}
         onClick={handleClick}
         role={onClick ? "button" : undefined}
         tabIndex={onClick ? 0 : undefined}
         {...props}
      >
         {(title || subtitle || headerAction) && (
            <div className={styles.card__header}>
               <div>
                  {title && <h3 className={styles.card__title}>{title}</h3>}
                  {subtitle && (
                     <p className={styles.card__subtitle}>{subtitle}</p>
                  )}
               </div>
               {headerAction && (
                  <div className={styles.card__headerAction}>
                     {headerAction}
                  </div>
               )}
            </div>
         )}
         <div className={styles.card__body}>{children}</div>
         {footer && <div className={styles.card__footer}>{footer}</div>}
      </div>
   );
};

Card.propTypes = {
   children: PropTypes.node.isRequired,
   title: PropTypes.string,
   subtitle: PropTypes.string,
   headerAction: PropTypes.node,
   footer: PropTypes.node,
   className: PropTypes.string,
   padding: PropTypes.bool,
   hover: PropTypes.bool,
   onClick: PropTypes.func,
};

export default Card;
